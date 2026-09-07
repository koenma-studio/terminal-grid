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

async function open(page, restored) {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.setContent('<div id="grid"></div><div id="ctxMenu"></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addStyleTag({ content: css });
  await page.evaluate(restored => {
    Object.assign(window, { __GRID_ROWS: 2, __GRID_COLS: 2, __GRID_TAB_ID: 7, __GRID_CELL_IDS: [20, 21, 22, 23],
      __GRID_ZOOM: 100, __GRID_SCROLLBACK: 20000, __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '',
      __GRID_THEME: '', __GRID_THEME_COLORS: null, __GRID_MERGE_REGIONS: [], messages: [], restored });
    window.acquireVsCodeApi = () => ({ postMessage: msg => messages.push(msg), getState: () => window.restored,
      setState: value => { window.saved = structuredClone(value); } });
  }, restored);
  await page.addScriptTag({ content: bundle });
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'resize').length)).toBeGreaterThanOrEqual(4);
}

test('matching tab restores zoom and pane proportions without mutating the saved identity', async ({ page }) => {
  const restored = { tabId: 7, zooms: [110, 130, 100, 80], colFr: [.7, 1.3], rowFr: [1.4, .6] };
  await open(page, restored);
  expect(await page.evaluate(() => testCells.map(cell => cell.zoom))).toEqual(restored.zooms);
  expect(await page.evaluate(() => saved.colFr)).toEqual(restored.colFr);
  expect(await page.evaluate(() => saved.rowFr)).toEqual(restored.rowFr);
  await page.locator('.cell').first().hover();
  await page.keyboard.down('Control'); await page.mouse.wheel(0, -100); await page.keyboard.up('Control');
  await expect.poll(() => page.evaluate(() => saved.zooms[0])).toBe(120);
  const handle = await page.locator('.col-resizer').boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + 80);
  await page.mouse.down(); await page.mouse.move(handle.x + 100, handle.y + 80); await page.mouse.up();
  expect(await page.evaluate(() => saved.colFr[0])).toBeGreaterThan(.7);
  expect(await page.evaluate(() => ({ tabId: saved.tabId, rows: saved.rows, cols: saved.cols, cellIds: saved.cellIds })))
    .toEqual({ tabId: 7, rows: 2, cols: 2, cellIds: [20, 21, 22, 23] });
  expect(await page.evaluate(() => window.restored)).toEqual(restored);
});

test('another tab or malformed pane proportions cannot leak into a restored grid', async ({ page }) => {
  await open(page, { tabId: 99, zooms: [300, 300, 300, 300], colFr: [.2, 1.8], rowFr: [1.7, .3] });
  expect(await page.evaluate(() => saved.zooms)).toEqual([100, 100, 100, 100]);
  expect(await page.evaluate(() => saved.colFr)).toEqual([1, 1]);
  expect(await page.evaluate(() => saved.rowFr)).toEqual([1, 1]);
  await open(page, { tabId: 7, zooms: [NaN, -50, 500, 110], colFr: [-1, 3], rowFr: [Infinity, 1] });
  expect(await page.evaluate(() => saved.zooms)).toEqual([100, 100, 100, 110]);
  expect(await page.evaluate(() => saved.colFr)).toEqual([1, 1]);
  expect(await page.evaluate(() => saved.rowFr)).toEqual([1, 1]);
});
