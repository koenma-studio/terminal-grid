const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const bundle = esbuild.buildSync({ stdin: {
  contents: fs.readFileSync('src/webview/gridTerminal.ts', 'utf8') + '\n(globalThis as any).testCells = cells;',
  resolveDir: path.resolve('src/webview'), loader: 'ts',
}, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;
// Use the real panel CSS: short programmatic selections in a simplified page missed this bug.
const panelCss = fs.readFileSync('src/TerminalGridPanel.ts', 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace('${customFontCss}', '').replace('${this._rows}', '2').replace('${this._cols}', '2');

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.setContent('<div id="grid"></div><div class="ctx-menu" id="ctxMenu"><div class="ctx-menu-item" data-action="copy">Copy</div><div class="ctx-menu-item" data-action="copyPlain">Plain</div><div class="ctx-menu-item" data-action="paste">Paste</div></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addStyleTag({ content: panelCss });
  await page.evaluate(() => {
    Object.assign(window, { __GRID_ROWS: 2, __GRID_COLS: 2, __GRID_ZOOM: 100, __GRID_SCROLLBACK: 5000,
      __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null,
      __GRID_MERGE_REGIONS: [], messages: [], copyAck: true });
    window.acquireVsCodeApi = () => ({ postMessage: msg => {
      messages.push(msg);
      if (msg.type === 'clipboardWrite' && window.copyAck) setTimeout(() => window.postMessage({ type: 'clipboardWriteResult',
        id: msg.id, requestId: msg.requestId, success: true, characters: Array.from(msg.text).length, lines: msg.text.split(/\r?\n/).length }, '*'), 0);
    }, getState: () => undefined, setState() {} });
  });
  await page.addScriptTag({ content: bundle });
  await expect.poll(() => page.evaluate(() => messages.filter(m => m.type === 'resize').length)).toBe(4);
});

async function populate(page, count) {
  return page.evaluate(async count => {
    const t = testCells[0].terminal;
    window.originalLines = Array.from({ length: count }, (_, i) => `ROW${String(i).padStart(5, '0')} 한글😀 abcdef`);
    await new Promise(resolve => t.write(originalLines.join('\r\n'), resolve));
    t.scrollToTop();
    window.retainedLines = originalLines.slice(count - t.buffer.active.length);
    const rect = t.element.querySelector('.xterm-screen').getBoundingClientRect();
    const cell = t._core._renderService.dimensions.css.cell;
    return { x: rect.x + cell.width * .1, y: rect.y + cell.height * .5, h: cell.height, w: cell.width, bottom: rect.bottom };
  }, count);
}
async function output(page, data, id = 0) {
  await page.evaluate(({ data, id }) => new Promise(resolve => {
    const ack = event => { if (event.data.type === 'output' && event.data.id === id) {
      window.removeEventListener('message', ack); resolve();
    } };
    window.addEventListener('message', ack);
    window.postMessage({ type: 'output', id, data }, '*');
  }), { data, id });
}
async function copied(page) {
  return page.evaluate(() => messages.filter(m => m.type === 'clipboardWrite').at(-1)?.text.replace(/\r\n/g, '\n'));
}

for (const reverse of [false, true]) {
  test(`wheel scrolling updates ${reverse ? 'reverse' : 'forward'} drag without another mousemove`, async ({ page }) => {
    const p = await populate(page, 1000);
    if (reverse) await page.evaluate(() => testCells[0].terminal.scrollToLine(500));
    await page.mouse.move(p.x, p.y + p.h * (reverse ? 20 : 0));
    await page.mouse.down();
    await page.mouse.move(p.x, p.y + p.h * 4);
    for (let i = 0; i < 35; i++) await page.mouse.wheel(0, reverse ? -450 : 450);
    await page.waitForTimeout(100);
    const endRow = await page.evaluate(() => testCells[0].terminal.buffer.active.viewportY + 4);
    expect(reverse ? 520 - endRow : endRow).toBeGreaterThan(50);
    await page.mouse.up();
    await page.keyboard.press('Control+Shift+C');
    const expected = await page.evaluate(({ reverse, endRow }) =>
      originalLines.slice(reverse ? endRow : 0, reverse ? 520 : endRow).join('\n') + '\n', { reverse, endRow });
    expect(await copied(page)).toBe(expected);
    expect(await page.evaluate(() => messages.filter(m => m.type === 'selectionDrag').map(m => m.paused))).toEqual([true, false]);
  });
}

test('output during a long drag is held, then resumes without shortening Plain copy', async ({ page }) => {
  const p = await populate(page, 5100);
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.evaluate(() => testCells[0].terminal.scrollToLine(500));
  await page.mouse.move(p.x, p.y + 4 * p.h);
  const expected = await page.evaluate(() => retainedLines.slice(0, 504).join('\n') + '\n');
  await output(page, '\r\n' + Array.from({ length: 400 }, (_, i) => `NEW${i}`).join('\r\n'));
  await output(page, 'other cell keeps running', 1);
  expect(await page.evaluate(() => testCells[0].terminal.buffer.active.getLine(0).translateToString(true))).toBe('ROW00074 한글😀 abcdef');
  await expect.poll(() => page.evaluate(() => testCells[1].terminal.buffer.active.getLine(0).translateToString(true))).toBe('other cell keeps running');
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => testCells[0].terminal.buffer.active.getLine(0).translateToString(true))).toBe('ROW00474 한글😀 abcdef');
  await expect(page.locator('.cell-copy-retained').first()).toBeVisible();
  await page.mouse.click(p.x + 80, p.y + p.h * 3, { button: 'right' });
  await page.locator('[data-action=copyPlain]').click();
  expect(await copied(page)).toBe(expected);
  await expect(page.locator('.cell-copy-retained').first()).toBeHidden();
});

for (const copyMethod of ['keyboard', 'native', 'button']) {
  test(`${copyMethod} copies the saved selection after a CLI clears/repaints its screen`, async ({ page }) => {
    const p = await populate(page, 20);
    await page.mouse.move(p.x, p.y); await page.mouse.down();
    await page.mouse.move(p.x, p.y + 10 * p.h); await page.mouse.up();
    const expected = await page.evaluate(() => originalLines.slice(0, 10).join('\n') + '\n');
    await output(page, '\x1b[H\x1b[2Jnew screen');
    await expect.poll(() => page.evaluate(() => testCells[0].terminal.buffer.active.getLine(0).translateToString(true))).toBe('new screen');
    if (copyMethod === 'keyboard') await page.keyboard.press('Control+c');
    else if (copyMethod === 'button') await page.locator('.cell-copy-retained').first().click();
    else {
      const native = await page.evaluate(() => {
        const clipboardData = new DataTransfer();
        testCells[0].terminal.textarea.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData }));
        return clipboardData.getData('text/plain').replace(/\r\n/g, '\n');
      });
      expect(native).toBe(expected); return;
    }
    expect(await copied(page)).toBe(expected);
    expect(await page.evaluate(() => messages.filter(m => m.type === 'input'))).toEqual([]);
  });
}

test('Escape and typing discard saved text; Ctrl+C without selection still interrupts', async ({ page }) => {
  await populate(page, 20);
  await page.evaluate(() => { testCells[0].terminal.selectAll(); testCells[0].terminal.focus(); });
  await output(page, '\x1b[H\x1b[2Jnew screen');
  await expect(page.locator('.cell-copy-retained').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.cell-copy-retained').first()).toBeHidden();
  await page.keyboard.press('Control+c');
  expect(await page.evaluate(() => messages.filter(m => m.type === 'input').map(m => m.data))).toEqual(['\x03']);
  await page.evaluate(() => testCells[0].terminal.selectAll());
  await output(page, '\x1b[Hnewer');
  await page.keyboard.type('x');
  expect(await page.evaluate(() => testCells[0].selection.hasSelection())).toBe(false);
});

test('blur releases output and auto-scroll; reset discards output held during a drag', async ({ page }) => {
  const p = await populate(page, 1000);
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x, p.bottom + 60);
  await page.waitForTimeout(100);
  await output(page, '\r\nQUEUED-BEFORE-BLUR');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(() => page.evaluate(() => testCells[0].selection.dragging)).toBe(false);
  const top = await page.evaluate(() => testCells[0].terminal.buffer.active.viewportY);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => testCells[0].terminal.buffer.active.viewportY)).toBe(top);
  expect(await page.evaluate(() => messages.filter(m => m.type === 'selectionDrag').at(-1).paused)).toBe(false);
  await page.mouse.up();
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x, p.y + 4 * p.h);
  await output(page, '\r\nMUST-NOT-REPLAY');
  await page.evaluate(() => window.postMessage({ type: 'reset', id: 0 }, '*'));
  await expect.poll(() => page.evaluate(() => testCells[0].epoch)).toBe(1);
  await page.mouse.up();
  await output(page, 'NEW-SHELL');
  await expect.poll(() => page.evaluate(() => testCells[0].terminal.buffer.active.getLine(0).translateToString(true))).toBe('NEW-SHELL');
  expect(await page.evaluate(() => testCells[0].selection.hasSelection())).toBe(false);
});

test('6,000 wrapped Korean/emoji lines copy against the original with larger scrollback', async ({ page }) => {
  await page.evaluate(async () => {
    const t = testCells[0].terminal; t.options.scrollback = 20000;
    window.largeOriginal = Array.from({ length: 6000 }, (_, i) => `${i}: ` + '한글😀 wrapped '.repeat(9)).join('\r\n');
    await new Promise(resolve => t.write(largeOriginal, resolve));
    t.selectAll(); t.focus();
  });
  await page.keyboard.press('Control+Shift+C');
  expect(await copied(page)).toBe(await page.evaluate(() => largeOriginal.replace(/\r\n/g, '\n')));
});

test('mouse-reporting CLI input is preserved while Shift still forces a protected selection', async ({ page }) => {
  const p = await populate(page, 20);
  await output(page, '\x1b[?1000h\x1b[?1006h');
  await expect.poll(() => page.evaluate(() => testCells[0].terminal.modes.mouseTrackingMode)).not.toBe('none');
  await page.mouse.move(p.x + p.w * 3, p.y); await page.mouse.down();
  await page.mouse.move(p.x + p.w * 8, p.y); await page.mouse.up();
  expect(await page.evaluate(() => messages.filter(m => m.type === 'selectionDrag'))).toEqual([]);
  expect(await page.evaluate(() => messages.filter(m => m.type === 'input').length)).toBeGreaterThan(0);
  await page.keyboard.down('Shift');
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x, p.y + p.h * 4); await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.keyboard.press('Control+Shift+C');
  expect(await copied(page)).toBe(await page.evaluate(() => originalLines.slice(0, 4).join('\n') + '\n'));
});

test('a fast drag waits for queued parsing, and reset cannot replay an old selection or output', async ({ page }) => {
  const p = await populate(page, 20);
  await page.evaluate(({ x, y, h }) => {
    const c = testCells[0], screen = c.terminal.element.querySelector('.xterm-screen');
    // One event turn: output is already queued in xterm when the drag starts/ends.
    c.selection.write('\x1b[H\x1b[2J' + originalLines.join('\r\n'));
    screen.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: 1, detail: 1 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y + h * 4, buttons: 1 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y + h * 4, button: 0 }));
  }, p);
  await expect.poll(() => page.evaluate(() => testCells[0].selection.dragging)).toBe(false);
  await page.keyboard.press('Control+Shift+C');
  expect(await copied(page)).toBe(await page.evaluate(() => originalLines.slice(0, 4).join('\n') + '\n'));
  await page.evaluate(({ x, y }) => {
    const c = testCells[0], screen = c.terminal.element.querySelector('.xterm-screen');
    c.selection.write('OLD-QUEUED-OUTPUT');
    screen.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: 1, detail: 1 }));
    // Dispatch the actual reset handler synchronously to race with the pending write.
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'reset', id: 0 } }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'output', id: 0, data: 'FRESH' } }));
  }, p);
  await expect.poll(() => page.evaluate(() => testCells[0].terminal.buffer.active.getLine(0).translateToString(true))).toBe('FRESH');
  expect(await page.evaluate(() => testCells[0].selection.dragging || testCells[0].selection.hasSelection())).toBe(false);
});

test('double-click words, triple-click lines and Alt column selections keep native boundaries', async ({ page }) => {
  const p = await populate(page, 20);
  await page.mouse.dblclick(p.x + p.w * 11, p.y);
  await page.keyboard.press('Control+Shift+C');
  expect(await copied(page)).toBe('한글😀');
  await page.mouse.click(p.x + p.w * 3, p.y + p.h * 2, { clickCount: 3 });
  await page.keyboard.press('Control+Shift+C');
  expect((await copied(page)).trim()).toBe('ROW00002 한글😀 abcdef');
  await page.keyboard.down('Alt');
  await page.mouse.move(p.x + p.w * 3, p.y); await page.mouse.down();
  await page.mouse.move(p.x + p.w * 8, p.y + p.h * 2); await page.mouse.up();
  await page.keyboard.up('Alt'); await page.keyboard.press('Control+Shift+C');
  expect(await copied(page)).toBe('00000\n00001\n00002');
});
