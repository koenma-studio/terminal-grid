const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const bundle = esbuild.buildSync({ stdin: {
  contents: fs.readFileSync('src/webview/gridTerminal.ts', 'utf8') + '\n(globalThis as any).testCells = cells;',
  resolveDir: path.resolve('src/webview'), loader: 'ts',
}, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;
const css = fs.readFileSync('src/TerminalGridPanel.ts', 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace('${customFontCss}', '').replace('${this._rows}', '2').replace('${this._cols}', '2');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.setContent('<div id="grid"></div><div id="ctxMenu"></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addStyleTag({ content: css });
  await page.evaluate(() => {
    Object.assign(window, { __GRID_ROWS: 2, __GRID_COLS: 2, __GRID_ZOOM: 100, __GRID_SCROLLBACK: 20000,
      __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null,
      __GRID_MERGE_REGIONS: [], messages: [] });
    window.acquireVsCodeApi = () => ({ postMessage: msg => messages.push(msg), getState: () => undefined, setState() {} });
  });
  await page.addScriptTag({ content: bundle });
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'resize').length)).toBeGreaterThanOrEqual(4);
  await page.evaluate(() => new Promise(resolve => testCells[0].terminal.write(
    Array.from({ length: 1000 }, (_, i) => `LINE ${i}: ${'가나다 😀 answer '.repeat(12)}`).join('\r\n'), resolve)));
});

async function position(page) {
  return page.evaluate(() => { const t = testCells[0].terminal; const b = t.buffer.active;
    return { cols: t.cols, rows: t.rows, y: b.viewportY, base: b.baseY, text: b.getLine(b.viewportY)?.translateToString(true) }; });
}

test('hidden layout does not reflow terminal to a tiny size while an answer arrives', async ({ page }) => {
  const before = await position(page);
  await page.evaluate(() => { document.getElementById('grid').style.height = '0px'; document.getElementById('grid').style.width = '0px'; });
  await page.waitForTimeout(250);
  const hidden = await position(page);
  expect(hidden.cols).toBe(before.cols);
  expect(hidden.rows).toBe(before.rows);
  await page.evaluate(() => new Promise(resolve => {
    testCells[0].selection.write('\r\nFINAL ANSWER\r\n'); testCells[0].terminal.write('', resolve);
  }));
  await page.evaluate(() => { document.getElementById('grid').style.height = ''; document.getElementById('grid').style.width = ''; });
  await page.waitForTimeout(300);
  const after = await position(page);
  expect(after.cols).toBe(before.cols);
  expect(after.y).toBe(after.base);
});

test('returning after background output preserves the history being read', async ({ page }) => {
  await page.evaluate(() => testCells[0].terminal.scrollToLine(500));
  await page.waitForTimeout(50);
  const before = await position(page);
  await page.evaluate(() => { window.dispatchEvent(new Event('blur')); document.getElementById('grid').style.display = 'none'; });
  await page.waitForTimeout(250);
  await page.evaluate(() => new Promise(resolve => {
    testCells[0].selection.write('\r\n' + 'background reply\r\n'.repeat(500)); testCells[0].terminal.write('', resolve);
  }));
  await page.evaluate(() => { document.getElementById('grid').style.display = ''; window.dispatchEvent(new Event('focus')); });
  await page.waitForTimeout(300);
  const after = await position(page);
  expect(after.y).toBe(before.y);
  expect(after.text).toBe(before.text);
});

test('resizing a visible cell preserves the same history line across wrapping', async ({ page }) => {
  await page.evaluate(() => { const t = testCells[0].terminal; let line = 500;
    while (line > 0 && t.buffer.active.getLine(line).isWrapped) line--; t.scrollToLine(line); });
  await page.waitForTimeout(50);
  const before = await position(page);
  await page.setViewportSize({ width: 950, height: 730 });
  await page.waitForTimeout(350);
  const after = await position(page);
  expect(after.text?.slice(0, 20)).toBe(before.text?.slice(0, 20));
});
