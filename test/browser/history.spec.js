const { test, expect } = require('@playwright/test');
const esbuild = require('esbuild');
const path = require('node:path');

const bundle = esbuild.buildSync({ stdin: { contents: `
  import { Terminal } from '@xterm/xterm';
  import { openTerminalHistory, captureTerminalHistory } from './history';
  const terminal = new Terminal({ cols: 20, rows: 5, scrollback: 22000, allowProposedApi: true });
  terminal.open(document.getElementById('terminal'));
  window.messages = []; window.inputs = [];
  terminal.onData(data => window.inputs.push(data));
  window.terminal = terminal;
  window.captureHistory = () => captureTerminalHistory(terminal);
  window.captureSource = captureTerminalHistory;
  window.openHistory = (selectedText = '', initialView = 'history') => openTerminalHistory(terminal, selectedText, message => window.messages.push(message), {initialView});
`, resolveDir: path.resolve('src/webview'), loader: 'ts' }, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;

test.beforeEach(async ({ page }) => {
  await page.setContent('<html lang="en"><body><div id="terminal" style="height:160px;width:500px"></div></body></html>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addScriptTag({ content: bundle });
});

async function write(page, text) {
  await page.evaluate(text => new Promise(resolve => terminal.write(text, resolve)), text);
}

test('history joins wide-character soft wraps and reflects erased screen content', async ({ page }) => {
  const text = '1234567890123456789한글😀  continued  text';
  await write(page, '\x1b[31m' + text + '\x1b[0m');
  expect(await page.evaluate(() => captureHistory().text)).toBe(text);
  await write(page, '\x1b[H\x1b[2JReady');
  expect(await page.evaluate(() => captureHistory().text)).toBe('Ready');
});

test('history search reaches distant scrollback and the viewer snapshot stays stable during output', async ({ page }) => {
  const lines = Array.from({ length: 700 }, (_, i) => `ROW${i.toString().padStart(4, '0')}${i % 200 === 0 ? ' NEEDLE' : ''}`);
  await write(page, lines.join('\r\n'));
  await page.evaluate(() => openHistory());
  const viewer = page.getByRole('textbox', { name: 'Terminal text', exact: true });
  await expect(viewer).toHaveValue(lines.join('\n'));
  await page.getByRole('searchbox', { name: 'Find in text' }).fill('needle');
  await expect(page.locator('.tg-history-count')).toHaveText('1 / 4');
  await page.getByRole('button', { name: 'Next match' }).click();
  await expect(page.locator('.tg-history-count')).toHaveText('2 / 4');
  expect(await viewer.evaluate(el => el.value.slice(el.selectionStart, el.selectionEnd))).toBe('NEEDLE');
  expect(await viewer.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await write(page, '\r\nNEW OUTPUT');
  await expect(viewer).toHaveValue(lines.join('\n'));
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(viewer).toHaveValue(lines.join('\n') + '\nNEW OUTPUT');
});

test('selection preview copies only after acknowledgement and exports the exact retained text', async ({ page }) => {
  const selected = '한글😀 retained\r\nsecond line';
  await page.evaluate(text => openHistory(text, 'selection'), selected);
  await expect(page.locator('.tg-history-meta')).toContainText('25 characters · 2 lines');
  await page.getByRole('button', { name: 'Copy text', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Copying…');
  const request = await page.evaluate(() => messages.at(-1));
  expect(request.text).toBe(selected);
  await page.evaluate(requestId => window.postMessage({ type: 'clipboardWriteResult', requestId, success: false }, '*'), request.requestId);
  await expect(page.getByRole('status')).toHaveText('Copy failed. Try again.');
  await page.getByRole('button', { name: 'Copy text', exact: true }).click();
  await page.evaluate(() => window.postMessage({ type: 'clipboardWriteResult', requestId: messages.at(-1).requestId, success: true }, '*'));
  await expect(page.getByRole('status')).toHaveText('Copied');
  await page.getByRole('button', { name: 'Save .txt', exact: true }).click();
  expect(await page.evaluate(() => messages.at(-1))).toEqual({ type: 'exportText', text: selected, suggestedName: 'terminal-grid-selection.txt' });
});

test('modal input cannot reach the CLI, and Escape restores terminal focus', async ({ page }) => {
  await page.evaluate(() => { terminal.focus(); openHistory('captured', 'selection'); });
  await page.getByRole('searchbox', { name: 'Find in text' }).fill('search');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+F');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => inputs)).toEqual([]);
  await page.keyboard.type('x');
  expect(await page.evaluate(() => inputs.join(''))).toBe('x');
});

test('large histories have an explicit retained-row limit and alternate screens are identified', async ({ page }) => {
  await write(page, Array.from({ length: 21000 }, (_, i) => `ROW${i}`).join('\r\n'));
  const snapshot = await page.evaluate(() => captureHistory());
  expect(snapshot.limited).toBe(true);
  expect(snapshot.text.split('\n')).toHaveLength(20000);
  expect(snapshot.text).toMatch(/^ROW1000\n/);
  await page.evaluate(() => openHistory());
  await expect(page.locator('.tg-history-note')).toContainText('20,000 rows');
  await page.keyboard.press('Escape');
  await write(page, '\x1b[?1049hcurrent alternate screen');
  await page.evaluate(() => openHistory());
  await expect(page.locator('.tg-history-note')).toContainText('alternate screen');
});

test('wide histories cap text size explicitly while retaining the newest complete rows', async ({ page }) => {
  const result = await page.evaluate(() => {
    const text = 'x'.repeat(1000);
    const source = { cols: 1000, buffer: { active: {
      length: 10000, type: 'normal',
      getLine: index => index < 10000 ? { isWrapped: false, translateToString: () => index === 9999 ? 'LATEST' : text } : undefined,
    } } };
    const snapshot = captureSource(source);
    return { limited: snapshot.limited, size: snapshot.text.length, lastLine: snapshot.text.slice(-6) };
  });
  expect(result.limited).toBe(true);
  expect(result.size).toBeLessThanOrEqual(8 * 1024 * 1024);
  expect(result.size).toBeGreaterThan(8 * 1024 * 1024 - 2000);
  expect(result.lastLine).toBe('LATEST');
});
