const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

// Exercise the production grid and real xterm in Chromium. Only the VS Code message bridge
// and OS clipboard are replaced so tests cannot overwrite the user's clipboard.
const bundle = esbuild.buildSync({
  stdin: { contents: fs.readFileSync('src/webview/gridTerminal.ts', 'utf8') + '\n(globalThis as any).testCells = cells;', resolveDir: path.resolve('src/webview'), loader: 'ts' },
  bundle: true, write: false, format: 'iife', platform: 'browser',
}).outputFiles[0].text;

test.beforeEach(async ({ page }) => {
  await page.setContent('<style>#grid{display:grid;grid-template-columns:1fr 1fr;width:1000px;height:400px}.cell{min-width:0;min-height:0}.term-container{height:360px}#ctxMenu{display:none}#ctxMenu.show{display:block;position:fixed;z-index:100}</style><div id="grid"></div><div id="ctxMenu"><button data-action="copy">Copy</button><button data-action="copyPlain">Plain</button><button data-action="paste">Paste</button></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.evaluate(() => {
    Object.assign(window, { __GRID_ROWS: 1, __GRID_COLS: 2, __GRID_ZOOM: 100, __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null, __GRID_MERGE_REGIONS: [], messages: [], clipText: '붙여넣기😀\r\nsecond line' });
    window.acquireVsCodeApi = () => ({ postMessage: msg => {
      window.messages.push(msg);
      if (msg.type === 'pasteRequest') setTimeout(() => window.postMessage({ type: 'pasteText', id: msg.id, text: window.clipText, requestId: msg.requestId }, '*'), window.clipDelay || 10);
      if (msg.type === 'clipboardWrite') setTimeout(() => window.postMessage({ type: 'clipboardWriteResult', id: msg.id,
        requestId: msg.requestId, success: true, characters: Array.from(msg.text).length, lines: msg.text.split(/\r?\n/).length }, '*'), 0);
    }, getState: () => undefined, setState() {} });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { read: async () => { throw new Error('Webview permission denied'); } } });
  });
  await page.addScriptTag({ content: bundle });
  await page.waitForFunction(() => window.testCells?.length === 2);
});

async function input(page) { return page.evaluate(() => window.messages.filter(m => m.type === 'input')); }

for (const shortcut of ['Control+v', 'Control+Shift+V', 'Shift+Insert', 'Meta+v']) {
  test(`${shortcut} pastes once with bracketed paste and preserves target cell`, async ({ page }) => {
    await page.evaluate(async () => {
      await new Promise(resolve => window.testCells[0].terminal.write('\x1b[?2004h', resolve));
      window.testCells[0].terminal.focus();
    });
    await page.keyboard.press(shortcut);
    await page.evaluate(() => window.testCells[1].terminal.focus());
    await expect.poll(() => input(page)).toEqual([{ type: 'input', id: 0, data: '\x1b[200~붙여넣기😀\rsecond line\x1b[201~' }]);
    expect(await page.evaluate(() => window.messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  });
}

test('copy shortcuts preserve selected text, while Ctrl+C without selection interrupts', async ({ page }) => {
  await page.evaluate(async () => {
    const t = window.testCells[0].terminal;
    await new Promise(resolve => t.write('prefix selected suffix', resolve));
    t.select(7, 0, 8);
    t.focus();
  });
  await page.keyboard.press('Control+Shift+C');
  expect(await page.evaluate(() => window.messages.filter(m => m.type === 'clipboardWrite'))).toEqual([
    { type: 'clipboardWrite', id: 0, text: 'selected', requestId: expect.stringMatching(/^copy-/) },
  ]);
  expect(await input(page)).toEqual([]);
  await page.evaluate(() => window.testCells[0].terminal.clearSelection());
  await page.keyboard.press('Control+c');
  expect((await input(page)).map(m => m.data)).toEqual(['\x03']);
});

test('plain context copy preserves the selected columns and wrapped Korean text', async ({ page }) => {
  await page.evaluate(async () => {
    const t = window.testCells[0].terminal;
    await new Promise(resolve => t.write('prefix 선택😀 suffix', resolve));
    t.select(7, 0, 6);
    window.testCells[0].el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 }));
  });
  await page.locator('[data-action=copyPlain]').click();
  expect(await page.evaluate(() => window.messages.filter(m => m.type === 'clipboardWrite').map(m => m.text))).toEqual(['선택😀']);
  await page.evaluate(async () => {
    const t = window.testCells[0].terminal;
    t.reset();
    const text = '한글 test '.repeat(20);
    await new Promise(resolve => t.write(text, resolve));
    t.selectAll();
    window.expectedCopy = t.getSelection();
    window.testCells[0].el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
  });
  await page.locator('[data-action=copyPlain]').click();
  expect(await page.evaluate(() => window.messages.filter(m => m.type === 'clipboardWrite').at(-1).text)).toBe(await page.evaluate(() => window.expectedCopy));
});

test('native paste goes through xterm exactly once and obeys disabled bracketed paste', async ({ page }) => {
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.setData('text/plain', 'one\r\ntwo');
    window.testCells[0].terminal.textarea.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }));
  });
  expect(await input(page)).toEqual([{ type: 'input', id: 0, data: 'one\rtwo' }]);
});

test('failed image decoding falls back to host text without an unhandled rejection', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluate(() => {
    navigator.clipboard.read = async () => [{ types: ['image/png'], getType: async () => { throw new Error('decode failed'); } }];
    window.testCells[0].terminal.focus();
  });
  await page.keyboard.press('Control+v');
  await expect.poll(() => input(page)).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('clipboard text takes priority over an image representation', async ({ page }) => {
  await page.evaluate(() => {
    navigator.clipboard.read = async () => [{ types: ['image/png', 'text/plain'], getType: async () => { throw new Error('must not read image'); } }];
    window.testCells[0].terminal.focus();
  });
  await page.keyboard.press('Control+v');
  await expect.poll(() => input(page)).toHaveLength(1);
  expect(await page.evaluate(() => window.messages.filter(m => m.type === 'pasteImage'))).toEqual([]);
});

test('Enter cannot overtake a slow clipboard read', async ({ page }) => {
  await page.evaluate(async () => {
    window.clipDelay = 150;
    await new Promise(resolve => window.testCells[0].terminal.write('\x1b[?2004h', resolve));
    window.testCells[0].terminal.focus();
  });
  await page.keyboard.press('Control+v');
  await page.keyboard.press('Enter');
  await page.keyboard.type('next');
  await expect.poll(async () => (await input(page)).map(m => m.data).join('')).toBe('\x1b[200~붙여넣기😀\rsecond line\x1b[201~\rnext');
});

test('two clipboard reads completing out of order preserve user input order', async ({ page }) => {
  await page.evaluate(async () => {
    window.clipDelay = 10000; // Deliver replies explicitly below.
    window.testCells[0].terminal.focus();
  });
  await page.keyboard.press('Control+v');
  await page.keyboard.type('between');
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => window.messages.filter(m => m.type === 'pasteRequest').length)).toBe(2);
  await page.evaluate(() => {
    const [first, second] = window.messages.filter(m => m.type === 'pasteRequest');
    window.postMessage({ type: 'pasteText', id: 0, requestId: second.requestId, text: 'second' }, '*');
    window.postMessage({ type: 'pasteText', id: 0, requestId: first.requestId, text: 'first' }, '*');
  });
  await expect.poll(async () => (await input(page)).map(m => m.data).join('')).toBe('firstbetweensecond');
});

test('restart discards a delayed paste so it cannot reach the new shell', async ({ page }) => {
  await page.evaluate(() => { window.clipDelay = 10000; window.testCells[0].terminal.focus(); });
  await page.keyboard.press('Control+v');
  await expect.poll(() => page.evaluate(() => window.messages.filter(m => m.type === 'pasteRequest').length)).toBe(1);
  await page.evaluate(() => {
    const request = window.messages.find(m => m.type === 'pasteRequest');
    window.postMessage({ type: 'reset', id: 0 }, '*');
    window.postMessage({ type: 'pasteText', id: 0, requestId: request.requestId, text: 'stale input' }, '*');
  });
  // postMessage is asynchronous: new-shell input must start after the reset was handled.
  await page.waitForFunction(() => window.testCells[0].epoch === 1);
  await page.keyboard.type('new');
  expect((await input(page)).map(m => m.data).join('')).toBe('new');
});
