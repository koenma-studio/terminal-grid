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
]) {
  test(`visible text target ${uri} opens exactly the detected address`, async ({ page }) => {
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
