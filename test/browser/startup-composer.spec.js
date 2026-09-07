const { test, expect } = require('@playwright/test');
const path = require('node:path');
const esbuild = require('esbuild');

const bundle = esbuild.buildSync({ stdin: { contents: `
  import { Terminal } from '@xterm/xterm';
  import { Unicode11Addon } from '@xterm/addon-unicode11';
  import { captureTerminalSnapshot } from '../TerminalSnapshot';
  import { classifyStartupScreen, startupComposerMatches } from '../StartupReadiness';
  const terminal = new Terminal({ cols: 60, rows: 12, allowProposedApi: true });
  terminal.loadAddon(new Unicode11Addon()); terminal.unicode.activeVersion = '11';
  terminal.open(document.getElementById('terminal'));
  Object.assign(window, { terminal, captureTerminalSnapshot, classifyStartupScreen, startupComposerMatches });
`, resolveDir: path.resolve('src/webview'), loader: 'ts' }, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;

test.beforeEach(async ({ page }) => {
  await page.setContent('<div id="terminal"></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.addScriptTag({ content: bundle });
});

async function render(page, output, expected) {
  return page.evaluate(async ({ output, expected }) => {
    await new Promise(resolve => window.terminal.write('\x1b[0m\x1b[2J\x1b[H' + output, resolve));
    const snapshot = window.captureTerminalSnapshot(window.terminal);
    return { snapshot, state: window.classifyStartupScreen(snapshot), matches: window.startupComposerMatches(snapshot, expected || '/resume') };
  }, { output, expected });
}

test('actual ANSI placeholder styling distinguishes a hint from existing input at Home', async ({ page }) => {
  const hint = await render(page, '› \x1b[2mAsk Codex to do anything\x1b[0m\r\n? for shortcuts\x1b[1;3H');
  expect(hint.state).toBe('ready');
  expect(hint.snapshot.lineInfo[0].styles.some(style => style.dim)).toBe(true);
  expect((await render(page, '› Ask Codex to do anything\r\n? for shortcuts\x1b[1;3H')).state).toBe('occupied');
  expect((await render(page, '› existing question\r\n? for shortcuts\x1b[1;3H')).state).toBe('occupied');
  expect((await render(page, '❯\u00a0\x1b[38;5;244mTry "refactor <filepath>"\x1b[0m\r\n─────────────────\r\nshift+tab to cycle\x1b[1;3H')).state).toBe('ready');
});

test('parsed composer confirmation refuses hidden suffixes and other input rows', async ({ page }) => {
  expect((await render(page, '› /resume\r\n? for shortcuts\x1b[1;10H')).matches).toBe(true);
  expect((await render(page, '› /resumeexisting question\r\n? for shortcuts\x1b[1;10H')).matches).toBe(false);
  expect((await render(page, '❯ /resume\r\n  another line\r\n─────────────────\r\n? for shortcuts\x1b[1;10H')).matches).toBe(false);
  expect((await render(page, '─────────────────\r\n❯ \r\n  ? for shortcuts\r\n─────────────────\r\nshift+tab to cycle\x1b[2;3H')).state).toBe('occupied');
  expect((await render(page, '\x1b[48;5;235m› \x1b[K\r\n  ? for shortcuts\x1b[K\x1b[0m\r\n\r\n? for shortcuts\x1b[1;3H')).state).toBe('occupied');
});

test('rendered Unicode and soft wrapping preserve exact command confirmation', async ({ page }) => {
  expect((await render(page, '› 한😀é\r\n? for shortcuts\x1b[1;8H', '한😀é')).matches).toBe(true);
  await page.evaluate(() => window.terminal.resize(20, 12));
  expect((await render(page, '› /long-command-with-wrap\r\n\x1b[4;1H? for shortcuts\x1b[2;6H', '/long-command-with-wrap')).matches).toBe(true);
});
