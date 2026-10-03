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
  ['한눈에 보려면 assets/style-studies/lineup-front-v2.jpg를 열면 됩니다.', 'assets/style-studies/lineup-front-v2.jpg', 18],
  ['새 시험은 bevy/captures/look/hud-tour/에 남깁니다.', 'bevy/captures/look/hud-tour/', 12],
  ['README.md와 결과', 'README.md', 3],
  ['원화(assets/front.png)를 확인', 'assets/front.png', 8],
  ['assets/front.png(정면 그림)을 확인', 'assets/front.png', 3],
  ['(docs/index.html)인지 확인', 'docs/index.html', 3],
  ['[assets/front.png]에서', 'assets/front.png', 3],
  ['src/app.ts:12에서 실패', 'src/app.ts:12', 3],
  ['https://github.com/koenma-studio/terminal-grid를 참고하세요', 'https://github.com/koenma-studio/terminal-grid', 3],
  ['docs/자료 폴더', 'docs/자료', 3],
  ['docs/2026년', 'docs/2026년', 3],
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
  ['(assets/front-v2.j\r\n  pg)를 열면 됩니다.', 'assets/front-v2.jpg', [[3, 0], [2, 1]]],
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

async function writeAt(page, cols, text) {
  await page.evaluate(async ({ cols, text }) => {
    const t = testCells[0].terminal;
    // Keep the grid's delayed startup fit from overriding the test widths.
    testCells[0].viewport.fit = () => {};
    t.resize(cols, t.rows);
    await new Promise(resolve => t.write(text, resolve));
  }, { cols, text });
}

async function resize(page, cols) {
  await page.evaluate(async cols => {
    testCells[0].terminal.resize(cols, testCells[0].terminal.rows);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, cols);
}

/** Viewport cell of visible text, counting wide characters as two cells. */
async function locate(page, fragment) {
  const location = await page.evaluate(fragment => {
    const t = testCells[0].terminal, buffer = t.buffer.active, cell = buffer.getNullCell();
    for (let row = 0; row < t.rows; row++) {
      const line = buffer.getLine(buffer.viewportY + row);
      let text = '';
      const columns = [];
      for (let column = 0; column < t.cols; column++) {
        line.getCell(column, cell);
        if (!cell.getWidth()) continue;
        const chars = cell.getChars() || ' ';
        text += chars;
        for (let unit = 0; unit < chars.length; unit++) columns.push(column);
      }
      const index = text.indexOf(fragment);
      if (index >= 0) return { column: columns[index], row };
    }
    return null;
  }, fragment);
  expect(location, fragment).not.toBeNull();
  return textOutput(page, '', location.column, location.row);
}

/** A resize clears xterm's hover; it returns only when the pointer enters another cell. */
async function hoverFromElsewhere(page, point) {
  const rows = await page.evaluate(() => testCells[0].terminal.rows);
  const empty = await textOutput(page, '', 0, rows - 1);
  await page.mouse.move(empty.x, empty.y);
  await page.mouse.move(point.x, point.y);
}

async function expectOpens(page, fragments, uri) {
  await page.evaluate(() => { messages.length = 0; });
  for (const fragment of fragments) {
    const point = await locate(page, fragment);
    await hoverFromElsewhere(page, point);
    await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
    await page.mouse.click(point.x, point.y);
  }
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'openExternal')))
    .toEqual(fragments.map(() => ({ type: 'openExternal', uri })));
}

async function expectPlainText(page, fragment) {
  const point = await locate(page, fragment);
  await hoverFromElsewhere(page, point);
  await expect(page.locator('.xterm-screen')).not.toHaveClass(/xterm-cursor-pointer/);
}

const lineup = 'assets/style-studies/parody-cat-outfits-20261003/lineup-front-v2.jpg';

test('a reflowed path keeps one target and underline without its attached Korean particle', async ({ page }) => {
  await writeAt(page, 100, `● 세 가지를 모두 고쳐 2차 열두 장을 새로 그렸습니다. 한눈에 보려면\r\n  ${lineup}를 열면 됩니다.\r\n`);
  await expectOpens(page, ['assets/', 'v2.jpg'], lineup);
  await expectPlainText(page, '를 열면');
  // Narrowing reflows the remainder of the path onto the next row.
  await resize(page, 68);
  await expectOpens(page, ['assets/', 'pg를'], lineup);
  await expectPlainText(page, '를 열면');
  const point = await locate(page, 'assets/');
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('.xterm-screen')).toHaveClass(/xterm-cursor-pointer/);
  const range = await page.evaluate(() => testCells[0].terminal._core.linkifier.currentLink.link.range);
  expect(range).toEqual({ start: { x: 3, y: range.start.y }, end: { x: 2, y: range.start.y + 1 } });
  await resize(page, 100);
  await expectOpens(page, ['assets/', 'v2.jpg'], lineup);
});

for (const [kind, cols, indent] of [['indented', 68, '  '], ['unindented', 66, '']]) {
  test(`a path split at the row edge continues onto an ${kind} row with a Korean particle`, async ({ page }) => {
    await writeAt(page, cols, `${indent}${lineup.slice(0, 66)}\r\n${indent}${lineup.slice(66)}를 열면 됩니다.`);
    await expectOpens(page, ['assets/', 'pg를'], lineup);
  });
}

test('an English word with a Korean particle after a short path at the edge stays separate', async ({ page }) => {
  await writeAt(page, 68, `${'x'.repeat(52)} src/config.ts\r\n  API를 호출합니다.`);
  await expectOpens(page, ['src/config.ts'], 'src/config.ts');
  await expectPlainText(page, 'API를');
});

for (const [text, fragment] of [
  ['› /quit', 'quit'],
  ['Tip: Use /permissions to pre-approve tools', 'permissions'],
  ['\\x1b[200~…\\x1b[201~ 같은 제어 문자열', '200~'],
  ['\\x1b[200~…\\x1b[201~ 같은 제어 문자열', '201~'],
  ['escape \\n or \\x1b in code', 'x1b'],
  ['assets/style-studies/codex-brief-v2.… 잘린 경로', 'codex-brief'],
  ['1/2 or 24/7 on 2026/10/03', '24/7'],
  ['1/2 or 24/7 on 2026/10/03', '2026/10'],
  ['원화의 0.99~1.01배입니다.', '1.01'],
  ['v0.7.3 릴리스, 평점 5.0/5', '0.7.3'],
  ['v0.7.3 릴리스, 평점 5.0/5', '5.0/5'],
]) {
  test(`non-path text ${JSON.stringify(text)} is not clickable at ${fragment}`, async ({ page }) => {
    await writeAt(page, 80, text);
    await expectPlainText(page, fragment);
  });
}

for (const [text, fragment, uri] of [
  ['/home/user/project/notes', 'project', '/home/user/project/notes'],
  ['see /README.md', 'README', '/README.md'],
  ['run .\\scripts now', 'scripts', '.\\scripts'],
  ['logs/2026/10/03.txt', '2026', 'logs/2026/10/03.txt'],
]) {
  test(`path text ${JSON.stringify(text)} stays clickable`, async ({ page }) => {
    await writeAt(page, 80, text);
    await expectOpens(page, [fragment], uri);
  });
}

test('a path split right before a separator continues onto the next indented row', async ({ page }) => {
  // Claude Code hard-wraps at the row edge, here just before "\@xterm".
  await writeAt(page, 47, '  - 긴 경로 G:\\repos\\terminal-grid\\node_modules\r\n  \\@xterm\\xterm\\src\\browser\\Linkifier.ts를\r\n  봅니다');
  await expectOpens(page, ['terminal-grid', 'Linkifier'], 'G:\\repos\\terminal-grid\\node_modules\\@xterm\\xterm\\src\\browser\\Linkifier.ts');
});

test('a short path ending near the edge does not absorb a following separator-led row', async ({ page }) => {
  await writeAt(page, 47, `${'x'.repeat(37)} C:\\temp\\a\r\n  \\server note`);
  await expectOpens(page, ['temp'], 'C:\\temp\\a');
  await expectPlainText(page, 'server');
});

for (const [kind, text, fragments, uri] of [
  ['path after a hyphen', `  • 절대경로 G:\\repos\\terminal-${' '.repeat(16)}\r\n    grid\\package.json`,
    ['repos', 'package'], 'G:\\repos\\terminal-grid\\package.json'],
  ['URL after a slash', `  • 웹 https://github.com/koenma-studio/${' '.repeat(7)}\r\n    terminal-grid를 참고`,
    ['github', 'terminal'], 'https://github.com/koenma-studio/terminal-grid'],
]) {
  test(`a Codex ${kind} wrapped before a segment that did not fit continues past the row padding`, async ({ page }) => {
    await writeAt(page, 47, text);
    await expectOpens(page, fragments, uri);
  });
}

test('a folder list wrapped after a slash keeps separate folders', async ({ page }) => {
  await writeAt(page, 47, `  • 폴더 src/webview/ docs/references/${' '.repeat(9)}\r\n    scripts/ out/`);
  await expectOpens(page, ['references'], 'docs/references/');
  await expectOpens(page, ['scripts'], 'scripts/');
});

// Rows as a CLI drew them at `width` columns: it pads each row with spaces and never redraws
// them after the cell is resized, so the CLI's row edge differs from the current one.
const cells = text => [...text].reduce((width, ch) => width + (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(ch) ? 2 : 1), 0);
const drawn = (width, rows) => rows.map(row => row + ' '.repeat(Math.max(0, width - cells(row)))).join('\r\n');
const linkifierPath = 'G:\\repos\\terminal-grid\\node_modules\\@xterm\\xterm\\src\\browser\\Linkifier.ts';
for (const [cli, width, rows, fragments] of [
  ['Claude', 32, ['● 경로 목록입니다. 아래 긴 경로를', '  눌러서 확인해 주세요. 여러 줄로', '  - 긴 경로 G:\\repos\\terminal-gr', '  id\\node_modules\\@xterm\\xterm\\s',
    '  rc\\browser\\Linkifier.ts를', '  봅니다'], ['repos', 'node_modules', 'Linkifier']],
  ['Codex', 47, ['› 링크 인식 테스트용입니다. 도구는 쓰지 말고,', '  아래 두 목록을 한 글자도 바꾸지 말고 그대로',
    '  - 긴 경로 G:\\repos\\terminal-', '  grid\\node_modules\\@xterm\\xterm\\src\\browser\\L', '  inkifier.ts를 봅니다',
    '  - 웹 https://github.com/koenma-studio/'], ['terminal-', 'node_modules', 'inkifier']],
]) {
  for (const resized of [width, width + 20, width - 7]) {
    test(`a ${cli} path over three rows drawn at ${width} columns opens from every row at ${resized} columns`, async ({ page }) => {
      await writeAt(page, width, drawn(width, rows));
      if (resized !== width) await resize(page, resized);
      await expectOpens(page, fragments, linkifierPath);
    });
  }
}

/** Wrap `prefix + path + suffix` like a CLI at `width` columns with a two-space indent. Words break at
 *  spaces (Codex also after "-" and "/"); a word longer than a row splits at its edge as wrap-ansi does. */
function wrapLikeCli(prefix, path, suffix, width, codex) {
  const text = prefix + path + suffix, pathStart = prefix.length, pathEnd = pathStart + path.length, content = width - 2;
  const tokens = [];
  for (let i = 0; i < text.length;) {
    if (text[i] === ' ') { i++; continue; }
    let j = i + 1;
    while (j < text.length && text[j] !== ' ' && !(codex && /[-/]/.test(text[j - 1]))) j++;
    tokens.push({ start: i, end: j, space: i > 0 && text[i - 1] === ' ' });
    i = j;
  }
  const rows = [[]];
  let used = 0;
  for (const token of tokens) {
    const width = cells(text.slice(token.start, token.end)), gap = used > 0 && token.space ? 1 : 0;
    if (used + gap + width <= content) { rows.at(-1).push([token.start - gap, token.end]); used += gap + width; continue; }
    if (width <= content) { rows.push([[token.start, token.end]]); used = width; continue; }
    const remaining = content - used - gap;
    if (remaining <= 0 || Math.floor((width - 1) / content) < 1 + Math.floor((width - remaining - 1) / content)) { rows.push([]); used = 0; }
    else if (gap) { rows.at(-1).push([token.start - 1, token.start]); used += 1; }
    for (let at = token.start; at < token.end;) {
      let take = 0, taken = 0;
      while (at + take < token.end && taken + cells(text[at + take]) <= content - used) taken += cells(text[at + take++]);
      rows.at(-1).push([at, at + take]);
      at += take; used += taken;
      if (at < token.end) { rows.push([]); used = 0; }
    }
  }
  // `offset` is the cell column (0-based) of the first path character on the row, or -1.
  return rows.map(ranges => {
    let row = '', offset = -1;
    for (const [from, to] of ranges) {
      if (offset < 0 && from < pathEnd && to > pathStart) offset = 2 + cells(row + text.slice(from, Math.max(from, pathStart)));
      row += text.slice(from, to);
    }
    return { text: '  ' + row, offset };
  });
}

for (const [cli, codex] of [['Claude', false], ['Codex', true]]) {
  test(`a long ${cli}-wrapped path opens from every row at every drawn width, before and after a resize`, async ({ page }) => {
    test.setTimeout(120000);
    const failures = [];
    for (let width = 28; width <= 72; width++) {
      const rows = [...wrapLikeCli('- 경로 목록을 출력합니다. 아래 긴 경로를 눌러 확인해 주세요. ', '', '', width, codex),
        ...wrapLikeCli('- 긴 경로 ', linkifierPath, '를 봅니다', width, codex)];
      failures.push(...await page.evaluate(async ({ rows, width, uri, padded }) => {
        const t = testCells[0].terminal, found = [];
        testCells[0].viewport.fit = () => {};
        const provider = t._core._linkProviderService.linkProviders[1];
        for (const cols of [width, width + 15, width - 8]) {
          t.reset();
          t.resize(width, t.rows);
          await new Promise(resolve => t.write(padded.join('\r\n'), resolve));
          if (cols !== width) t.resize(cols, t.rows);
          const buffer = t.buffer.active, starts = [];
          for (let row = 0; row < buffer.length; row++) if (!buffer.getLine(row).isWrapped) starts.push(row);
          rows.forEach((row, index) => {
            if (row.offset < 0) return;
            const y = starts[index] + Math.floor(row.offset / cols) + 1, x = row.offset % cols + 1;
            let links = [];
            provider.provideLinks(y, result => { links = result || []; });
            const inside = range => (range.start.y < y || (range.start.y === y && range.start.x <= x)) && (range.end.y > y || (range.end.y === y && range.end.x >= x));
            if (!links.some(link => link.text === uri && inside(link.range))) found.push(`${width}→${cols} row ${index} "${row.text}": ${JSON.stringify(links.map(link => link.text))}`);
          });
        }
        return found;
      }, { rows, width, uri: linkifierPath, padded: rows.map(row => row.text + ' '.repeat(Math.max(0, width - cells(row.text)))) }));
    }
    expect(failures).toEqual([]);
  });
}

// Rows read back from a 77-column grid. The CLI responses lost "\" before "@" to Markdown,
// so they name a missing path that the host repairs; the prompt echo kept it.
for (const [kind, rows, fragments, uri] of [
  ['Claude prompt echo', ['  - 긴 경로 G:\\repos\\terminal-grid\\node_modules\\@xterm\\xterm\\src\\browser\\Lin ', '  kifier.ts를 봅니다'],
    ['node_modules', 'kifier'], linkifierPath],
  ['Claude response', ['  - 긴 경로 G:\\repos\\terminal-grid\\node_modules@xterm\\xterm\\src\\browser\\Linki', '    fier.ts를 봅니다'],
    ['node_modules', 'fier.ts'], linkifierPath.replace('\\@', '@')],
  ['Codex response', ['  • 긴 경로 G:\\repos\\terminal-', '    grid\\node_modules@xterm\\xterm\\src\\browser\\Linkifier.ts를 봅니다'],
    ['repos', 'Linkifier'], linkifierPath.replace('\\@', '@')],
]) {
  test(`the two-row path in the ${kind} from a 77-column grid opens from both rows`, async ({ page }) => {
    await writeAt(page, 77, rows.join('\r\n'));
    await expectOpens(page, fragments, uri);
  });
}

test('a link click in an application with mouse reporting opens once and is not reported to it', async ({ page }) => {
  const target = 'https://github.com/koenma-studio/terminal-grid%EB%A5%BC';
  // Codex enables any-event SGR mouse reporting and linkifies URLs itself.
  await writeAt(page, 80, `\x1b[?1003h\x1b[?1006h\x1b]8;;${target}\x1b\\terminal-grid를\x1b]8;;\x1b\\ 참고\r\nplain text`);
  const reports = () => page.evaluate(() => messages.filter(m => m.type === 'input' && /\x1b\[<0;/.test(m.data)).length);
  await expectOpens(page, ['terminal-grid'], target);
  await page.waitForTimeout(100);
  expect(await reports()).toBe(0);
  // Clicks elsewhere still reach the application.
  const point = await locate(page, 'plain');
  await page.mouse.click(point.x, point.y);
  await expect.poll(reports).toBeGreaterThan(0);
});

test('several paths with Korean particles on one row open separately', async ({ page }) => {
  await writeAt(page, 80, 'bevy/README.md와 docs/HANDOFF.md에 기록했습니다.');
  await expectOpens(page, ['README'], 'bevy/README.md');
  await expectOpens(page, ['HANDOFF'], 'docs/HANDOFF.md');
  await expectPlainText(page, '와 docs');
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
