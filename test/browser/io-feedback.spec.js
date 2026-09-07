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
    Object.assign(window, { __GRID_ROWS: 2, __GRID_COLS: 2, __GRID_ZOOM: 100, __GRID_SCROLLBACK: 5000,
      __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null,
      __GRID_MERGE_REGIONS: [], messages: [] });
    window.acquireVsCodeApi = () => ({ postMessage: msg => messages.push(msg), getState: () => undefined, setState() {} });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { read: async () => { throw new Error('Use mocked host clipboard'); } } });
  });
  await page.addScriptTag({ content: bundle });
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'resize').length)).toBeGreaterThanOrEqual(4);
});

async function ackCopy(page, success, index = -1) {
  return page.evaluate(({ success, index }) => {
    const copy = messages.filter(m => m.type === 'clipboardWrite').at(index);
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'clipboardWriteResult', id: copy.id,
      requestId: copy.requestId, success, characters: Array.from(copy.text).length, lines: copy.text.split(/\r?\n/).length } }));
    return copy;
  }, { success, index });
}

async function inputs(page) {
  return page.evaluate(() => messages.filter(m => m.type === 'input').map(m => m.data));
}

test('failed clipboard write retains the saved selection; successful retry clears it', async ({ page }) => {
  const expected = await page.evaluate(async () => {
    const cell = testCells[0], t = cell.terminal;
    await new Promise(resolve => t.write('한글😀 first line\r\nsecond line', resolve));
    t.selectAll(); t.focus();
    const text = cell.selection.getSelection();
    cell.selection.write('\x1b[H\x1b[2Janswer redrawn');
    await new Promise(resolve => t.write('', resolve));
    return text;
  });
  await expect(page.locator('.cell-copy-retained').first()).toBeVisible();
  await page.keyboard.press('Control+Shift+C');
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).toBe(expected);
  await ackCopy(page, false);
  await expect(page.getByText('Copy failed. Selection kept; try again.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).toBe(expected);
  await page.locator('.cell-copy-retained').first().click();
  expect(await page.evaluate(() => messages.filter(m => m.type === 'clipboardWrite').map(m => m.text))).toEqual([expected, expected]);
  await ackCopy(page, true);
  expect(await page.evaluate(() => testCells[0].selection.hasSelection())).toBe(false);
  await expect(page.locator('.cell-copy-retained').first()).toBeHidden();
  await expect(page.locator('.cell-notice').first()).toContainText('characters');
  expect(await inputs(page)).toEqual([]);
});

test('a delayed copy acknowledgement does not erase a newer selection', async ({ page }) => {
  await page.evaluate(async () => {
    const t = testCells[0].terminal;
    await new Promise(resolve => t.write('first second', resolve));
    t.select(0, 0, 5); t.focus();
  });
  await page.keyboard.press('Control+Shift+C');
  await page.evaluate(() => testCells[0].terminal.select(6, 0, 6));
  await ackCopy(page, true);
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).toBe('second');
});

test('a missing clipboard acknowledgement times out while keeping the text for retry', async ({ page }) => {
  await page.clock.install();
  await page.evaluate(async () => {
    const t = testCells[0].terminal;
    await new Promise(resolve => t.write('saved text', resolve));
    t.select(0, 0, 10); t.focus();
  });
  await page.keyboard.press('Control+Shift+C');
  await page.clock.runFor(15001);
  await expect(page.getByText('Copy failed. Selection kept; try again.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => testCells[0].selection.getSelection())).toBe('saved text');
});

test('Ctrl+C cancels a pending clipboard read and queued Enter, ignoring a late reply', async ({ page }) => {
  await page.evaluate(() => testCells[0].terminal.focus());
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.keyboard.press('Enter');
  expect(await inputs(page)).toEqual([]);
  await page.keyboard.press('Control+c');
  expect(await inputs(page)).toEqual(['\x03']);
  await page.evaluate(() => {
    const request = messages.find(m => m.type === 'pasteRequest');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: request.requestId, text: 'SHOULD NOT ARRIVE' } }));
  });
  expect(await inputs(page)).toEqual(['\x03']);
  await expect(page.getByText('Paste cancelled', { exact: true })).toBeVisible();
});

test('the cancel button drops pending paste and Enter and restores keyboard input', async ({ page }) => {
  await page.evaluate(() => testCells[0].terminal.focus());
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Cancel paste', exact: true }).first().click();
  expect(await page.evaluate(() => messages.filter(m => m.type === 'cancelInput'))).toEqual([{ type: 'cancelInput', id: 0 }]);
  expect(await inputs(page)).toEqual([]);
  await page.keyboard.type('next');
  expect((await inputs(page)).join('')).toBe('next');
});

test('clipboard timeout drops queued submission and ignores the expired response', async ({ page }) => {
  await page.clock.install();
  await page.evaluate(() => testCells[0].terminal.focus());
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.keyboard.press('Enter');
  await page.clock.runFor(5100);
  await expect(page.getByText('Clipboard timed out. Paste again.', { exact: true })).toBeVisible();
  expect(await inputs(page)).toEqual([]);
  await page.evaluate(() => {
    const request = messages.find(m => m.type === 'pasteRequest');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: request.requestId, text: 'EXPIRED' } }));
  });
  expect(await inputs(page)).toEqual([]);
});

test('a stalled browser clipboard read falls back to the host after 1.5 seconds', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2030-01-01T00:00:01Z'));
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { read: () => new Promise(resolve => { window.resolveClipboard = resolve; }) } });
    testCells[0].terminal.focus();
  });
  await page.keyboard.press('Control+v');
  await page.clock.runFor(1499);
  expect(await page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(0);
  await page.clock.runFor(2);
  expect(await page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.evaluate(() => {
    const request = messages.find(m => m.type === 'pasteRequest');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: request.requestId, text: 'host text' } }));
    window.resolveClipboard([]);
  });
  expect(await inputs(page)).toEqual(['host text']);
  expect(await page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
});

test('host clipboard failure drops queued Enter and displays the read error', async ({ page }) => {
  await page.evaluate(() => testCells[0].terminal.focus());
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.keyboard.press('Enter');
  await page.evaluate(() => {
    const request = messages.find(m => m.type === 'pasteRequest');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: request.requestId, text: '', error: 'Could not read the clipboard.' } }));
  });
  expect(await inputs(page)).toEqual([]);
  await expect(page.getByText('Could not read the clipboard.', { exact: true })).toBeVisible();
  await page.keyboard.type('next');
  expect((await inputs(page)).join('')).toBe('next');
});

test('an expired paste error cannot cancel the newer paste request', async ({ page }) => {
  await page.evaluate(() => testCells[0].terminal.focus());
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.keyboard.press('Control+c');
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'pasteRequest').length)).toBe(2);
  await page.evaluate(() => {
    const [oldRequest, current] = messages.filter(m => m.type === 'pasteRequest');
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: oldRequest.requestId, text: '', error: 'Old clipboard read failed' } }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'pasteText', id: 0, requestId: current.requestId, text: 'new paste' } }));
  });
  expect(await inputs(page)).toEqual(['\x03', 'new paste']);
});

test('returning to the bottom after hidden output still shows the completed answer', async ({ page }) => {
  await page.evaluate(async () => {
    const t = testCells[0].terminal;
    await new Promise(resolve => t.write('before\r\n'.repeat(1000), resolve));
    t.scrollToBottom();
    window.dispatchEvent(new Event('blur'));
    document.getElementById('grid').style.display = 'none';
  });
  await page.waitForTimeout(200);
  await page.evaluate(async () => {
    const cell = testCells[0];
    cell.selection.write('reply chunk\r\n'.repeat(500) + 'COMPLETED ANSWER');
    await new Promise(resolve => cell.terminal.write('', resolve));
    document.getElementById('grid').style.display = '';
    window.dispatchEvent(new Event('focus'));
  });
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const t = testCells[0].terminal, b = t.buffer.active;
    return { bottom: b.viewportY === b.baseY, visible: Array.from({ length: t.rows }, (_, row) => b.getLine(b.viewportY + row)?.translateToString(true)).join('\n') };
  });
  expect(result.bottom).toBe(true);
  expect(result.visible).toContain('COMPLETED ANSWER');
});
