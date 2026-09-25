const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const bundle = esbuild.buildSync({ stdin: {
  contents: fs.readFileSync('src/webview/gridTerminal.ts', 'utf8') + '\n(globalThis as any).testCells = cells;',
  resolveDir: path.resolve('src/webview'), loader: 'ts',
}, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;
const panelCss = fs.readFileSync('src/TerminalGridPanel.ts', 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace('${customFontCss}', '').replace('${this._rows}', '1').replace('${this._cols}', '1');

test.beforeEach(async ({ page }) => {
  await page.setContent('<div id="grid"></div><div id="ctxMenu"></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addStyleTag({ content: panelCss });
  await page.evaluate(() => {
    Object.assign(window, { __GRID_ROWS: 1, __GRID_COLS: 1, __GRID_ZOOM: 100,
      __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null,
      __GRID_MERGE_REGIONS: [], messages: [], browserCalls: [] });
    window.acquireVsCodeApi = () => ({ postMessage: msg => messages.push(msg), getState: () => undefined, setState() {} });
    // A webview cannot use xterm's default confirmation/popup path.
    window.confirm = () => { browserCalls.push('confirm'); return false; };
    window.open = () => { browserCalls.push('open'); return null; };
  });
  await page.addScriptTag({ content: bundle });
  await expect.poll(() => page.evaluate(() => messages.some(m => m.type === 'resize'))).toBe(true);
});

async function hyperlink(page, uri, wrapped = false) {
  return page.evaluate(async ({ uri, wrapped }) => {
    const t = testCells[0].terminal;
    const prefix = wrapped ? ' '.repeat(t.cols - 3) : '';
    await new Promise(resolve => t.write(`${prefix}\x1b]8;;${uri}\x1b\\Open browser\x1b]8;;\x1b\\`, resolve));
    const rect = t.element.querySelector('.xterm-screen').getBoundingClientRect();
    const cell = t._core._renderService.dimensions.css.cell;
    return { x: rect.x + cell.width * 1.5, y: rect.y + cell.height * (wrapped ? 1.5 : .5), w: cell.width };
  }, { uri, wrapped });
}

async function textOutput(page, text, column = 1, row = 0) {
  return page.evaluate(async ({ text, column, row }) => {
    const t = testCells[0].terminal;
    await new Promise(resolve => t.write(text, resolve));
    const rect = t.element.querySelector('.xterm-screen').getBoundingClientRect();
    const cell = t._core._renderService.dimensions.css.cell;
    return { x: rect.x + cell.width * (column + .5), y: rect.y + cell.height * (row + .5), w: cell.width };
  }, { text, column, row });
}

test('a blue folder path without OSC 8 metadata is clickable', async ({ page }) => {
  const uri = 'G:\\repos\\terminal-grid';
  const point = await textOutput(page, `\x1b[34m${uri}\x1b[0m`);
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  await page.mouse.click(point.x, point.y);
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual([{ type: 'openExternal', uri }]);
});

for (const [text, uri, column] of [
  ['(G:/repos/terminal-grid). 다음', 'G:/repos/terminal-grid', 3],
  ['file:///G:/my%20project/report.txt#L12', 'file:///G:/my%20project/report.txt#L12', 3],
  ['https://example.com/login?return=%2Fhello&state=a%2Bb#section', 'https://example.com/login?return=%2Fhello&state=a%2Bb#section', 3],
  ['\\\\server\\share\\report.txt', '\\\\server\\share\\report.txt', 3],
  ['결과😀 "G:\\my project\\자료😀\\report.txt:12:3" 완료', 'G:\\my project\\자료😀\\report.txt:12:3', 10],
  ['`/home/user/my folder/report.txt`', '/home/user/my folder/report.txt', 3],
  ['HTML에서 보기 (docs/references/panokseon-32dir-2026-09-25/index.html)', 'docs/references/panokseon-32dir-2026-09-25/index.html', 20],
  ['./docs/index.html:12:3', './docs/index.html:12:3', 3],
  ['..\\docs\\index.html', '..\\docs\\index.html', 3],
  ['docs\\references\\index.html', 'docs\\references\\index.html', 3],
  ['`자료 (최종).html`', '자료 (최종).html', 3],
  ['URL=https://example.com/path?a=1', 'https://example.com/path?a=1', 8],
  ['[결과](docs/index.html)', 'docs/index.html', 10],
  ['[index.html](docs/index.html)', 'docs/index.html', 15],
  ['reference=docs/index.html', 'docs/index.html', 12],
  ['https://example.com/path_(one)?a=1&b=2', 'https://example.com/path_(one)?a=1&b=2', 3],
  ['http://[::1]:3000/path?q=a&b=2', 'http://[::1]:3000/path?q=a&b=2', 3],
]) {
  test(`visible text ${text} opens exactly the detected address`, async ({ page }) => {
    const point = await textOutput(page, text, column);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
    await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
      .toEqual([{ type: 'openExternal', uri }]);
    expect(await page.evaluate(() => browserCalls)).toEqual([]);
  });
}

test('a wrapped path with Korean and emoji remains one complete target', async ({ page }) => {
  const uri = 'G:/자료😀/경로/file.txt';
  const cols = await page.evaluate(() => testCells[0].terminal.cols);
  // The emoji wraps with one unused cell at the end of the previous row.
  const point = await textOutput(page, ' '.repeat(cols - 8) + uri, 1, 1);
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  await page.mouse.click(point.x, point.y);
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual([{ type: 'openExternal', uri }]);
});

test('a log prefix does not hide the path before a Markdown link', async ({ page }) => {
  await textOutput(page, '[INFO] docs/first.html [결과](docs/second.html)');
  for (const [column, uri] of [[9, 'docs/first.html'], [33, 'docs/second.html']]) {
    const point = await textOutput(page, '', column);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
    expect(await page.evaluate(() => messages.filter(m => m.type === 'openExternal').at(-1)))
      .toEqual({ type: 'openExternal', uri });
  }
});

for (const [text, uri, points] of [
  ['HTML에서 회전노 젓기 보기 (docs/references/panokseon-32dir-2026-09-25/\r\n  index.html) 다음 문장',
    'docs/references/panokseon-32dir-2026-09-25/index.html', [[35, 0], [4, 1]]],
  ['(docs/references/panokseon-32dir-\r\n  2026-09-25/index.html)',
    'docs/references/panokseon-32dir-2026-09-25/index.html', [[3, 0], [4, 1]]],
  ['(docs/references/\r\n  panokseon-32dir-2026-09-25/\r\n  index.html)',
    'docs/references/panokseon-32dir-2026-09-25/index.html', [[3, 0], [4, 1], [4, 2]]],
  ['"G:/my project/자료😀/\r\n  report final.html" 완료',
    'G:/my project/자료😀/report final.html', [[3, 0], [4, 1]]],
  ['(docs/자료😀/re\r\n  port.html) 완료', 'docs/자료😀/report.html', [[3, 0], [4, 1]]],
  ['(docs/index.ht\r\n  ml) 완료', 'docs/index.html', [[3, 0], [2, 1]]],
  ['"docs/my \r\n  report.html"', 'docs/my report.html', [[3, 0], [4, 1]]],
  ['(docs/references/   \r\n  index.html:12:3) 완료', 'docs/references/index.html:12:3', [[3, 0], [4, 1]]],
]) {
  test(`CLI hard-wrapped path ${JSON.stringify(text)} resolves from every row`, async ({ page }) => {
    await textOutput(page, text);
    for (const [column, row] of points) {
      const point = await textOutput(page, '', column, row);
      await page.mouse.move(point.x, point.y);
      await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
      await page.mouse.click(point.x, point.y);
    }
    await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
      .toEqual(points.map(() => ({ type: 'openExternal', uri })));
  });
}

test('a relative path survives both soft wrapping and CLI hard wrapping', async ({ page }) => {
  const cols = await page.evaluate(() => testCells[0].terminal.cols);
  const uri = 'docs/references/panokseon-32dir-2026-09-25/index.html';
  await textOutput(page, ' '.repeat(cols - 12) + '(docs/references/panokseon-32dir-2026-09-25/\r\n  index.html)');
  for (const [column, row] of [[cols - 8, 0], [3, 1], [4, 2]]) {
    const point = await textOutput(page, '', column, row);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
  }
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual(Array(3).fill({ type: 'openExternal', uri }));
});

for (const [kind, fragments, uri, firstFragment] of [
  ['absolute', ['  (G:/repos/1592/docs/references/panokseon-', '  32dir-2026-09-25/', '    index.html)'],
    'G:/repos/1592/docs/references/panokseon-32dir-2026-09-25/index.html', 'G:/repos'],
  ['relative', ['  (../1592/docs/references/panokseon-32dir-2026-', '  09-25/', '    index.html)'],
    '../1592/docs/references/panokseon-32dir-2026-09-25/index.html', '../1592/'],
]) {
  for (const resizedCols of [50, 40, 60, 120]) {
    test(`CLI padded soft-wrapped ${kind} path resolves at ${resizedCols} columns`, async ({ page }) => {
      await page.evaluate(async ({ fragments, resizedCols }) => {
        const t = testCells[0].terminal;
        // Keep the grid's delayed startup fit from overriding the test widths.
        testCells[0].viewport.fit = () => {};
        t.resize(50, t.rows);
        // CLI renderers may fill each row and let the terminal wrap naturally.
        const output = fragments.slice(0, -1).map(fragment => fragment.padEnd(50)).join('') + fragments.at(-1) + '\r\n';
        await new Promise(resolve => t.write(output, resolve));
        if (resizedCols !== 50) t.resize(resizedCols, t.rows);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, { fragments, resizedCols });
      for (const fragment of [firstFragment, '09-25/', 'index.html']) {
        const location = await page.evaluate(fragment => {
          const t = testCells[0].terminal;
          for (let row = 0; row < t.rows; row++) {
            const column = t.buffer.active.getLine(row).translateToString(false).indexOf(fragment);
            if (column >= 0) return { column: column + 1, row };
          }
          return null;
        }, fragment);
        expect(location).not.toBeNull();
        const point = await textOutput(page, '', location.column, location.row);
        await page.mouse.move(point.x, point.y);
        await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
        await page.mouse.click(point.x, point.y);
      }
      await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
        .toEqual(Array(3).fill({ type: 'openExternal', uri }));
    });
  }
}

test('a quoted soft-wrapped path preserves real spaces across the row boundary', async ({ page }) => {
  const cols = await page.evaluate(() => testCells[0].terminal.cols);
  const uri = 'G:/my folder/with   space/index.html';
  const firstPart = '"G:/my folder/with ';
  await textOutput(page, ' '.repeat(cols - firstPart.length) + `"${uri}"`);
  for (const [column, row] of [[cols - 5, 0], [4, 1]]) {
    const point = await textOutput(page, '', column, row);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
  }
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual(Array(2).fill({ type: 'openExternal', uri }));
});

test('a bare path at the right edge continues onto an indented CLI line', async ({ page }) => {
  const cols = await page.evaluate(() => testCells[0].terminal.cols);
  const prefix = 'docs/' + 'a'.repeat(cols - 7);
  const uri = prefix + 'end.html';
  await textOutput(page, prefix + '\r\n  end.html');
  for (const [column, row] of [[3, 0], [4, 1]]) {
    const point = await textOutput(page, '', column, row);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
  }
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual(Array(2).fill({ type: 'openExternal', uri }));
});

for (const text of ['docs/first.html\r\n  docs/second.html', '(docs/first.html)\r\n  second.html',
  '(docs/first.html\r\n\r\n  second.html', '(docs/first.html\r\n  PS G:\\repos>']) {
  test(`separate output lines stay separate: ${JSON.stringify(text)}`, async ({ page }) => {
    const point = await textOutput(page, text, 3);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
    await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
      .toEqual([{ type: 'openExternal', uri: 'docs/first.html' }]);
  });
}

test('explicit OSC 8 target takes priority over a path in its display text', async ({ page }) => {
  const uri = 'https://example.com/actual-target';
  const point = await textOutput(page, `\x1b]8;;${uri}\x1b\\G:\\repos\\display-only\x1b]8;;\x1b\\`);
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  await page.mouse.click(point.x, point.y);
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual([{ type: 'openExternal', uri }]);
});

test('selecting a detected local path does not open the file explorer', async ({ page }) => {
  const point = await textOutput(page, 'G:\\repos\\terminal-grid');
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  await page.mouse.down();
  await page.mouse.move(point.x + point.w * 8, point.y, { steps: 8 });
  await page.mouse.up();
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).not.toBe('');
  expect(await page.evaluate(() => messages.filter(m => m.type === 'openExternal'))).toEqual([]);
});

for (const wrapped of [false, true]) {
  test(`OSC 8 ${wrapped ? 'wrapped Ctrl+click' : 'click'} sends the target URL to the host once`, async ({ page }) => {
    const uri = 'https://example.com/login?return=%2Fhello%3Fa%3D1&state=a%2Bb#section';
    const point = await hyperlink(page, uri, wrapped);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    if (wrapped) await page.keyboard.down('Control');
    await page.mouse.click(point.x, point.y);
    if (wrapped) await page.keyboard.up('Control');
    await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
      .toEqual([{ type: 'openExternal', uri }]);
    expect(await page.evaluate(() => browserCalls)).toEqual([]);
  });
}

test('dragging across a hyperlink selects text without opening it', async ({ page }) => {
  const point = await hyperlink(page, 'http://localhost:3000');
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  await page.mouse.down();
  await page.mouse.move(point.x + point.w * 6, point.y, { steps: 8 });
  await page.mouse.up();
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).not.toBe('');
  expect(await page.evaluate(() => messages.filter(m => m.type === 'openExternal'))).toEqual([]);
});

for (const uri of ['file:///G:/my%20project/report.txt#L12', 'G:\\my project\\report.txt:12:3',
  '/G:/my project/report.txt', '/home/user/report.txt', '\\\\server\\share\\report.txt']) {
  test(`local hyperlink ${uri} is sent to the host`, async ({ page }) => {
    const point = await hyperlink(page, uri);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
    await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
      .toEqual([{ type: 'openExternal', uri }]);
    expect(await page.evaluate(() => browserCalls)).toEqual([]);
  });
}

for (const uri of ['command:workbench.action.reloadWindow', 'javascript:alert(1)', 'vscode://settings']) {
  test(`unsupported OSC 8 target ${uri} is not activated`, async ({ page }) => {
    const point = await hyperlink(page, uri);
    await page.mouse.click(point.x, point.y);
    expect(await page.evaluate(() => messages.filter(m => m.type === 'openExternal'))).toEqual([]);
    expect(await page.evaluate(() => browserCalls)).toEqual([]);
  });
}
