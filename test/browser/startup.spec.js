const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const { classifyStartupScreen } = require('../../out/StartupReadiness');

const bundle = esbuild.buildSync({ stdin: { contents: fs.readFileSync('src/webview/gridTerminal.ts', 'utf8') + '\n(globalThis as any).testCells = cells;', resolveDir: path.resolve('src/webview'), loader: 'ts' }, bundle: true, write: false, platform: 'browser' }).outputFiles[0].text;

async function grid(page) {
  await page.setContent('<style>#grid{display:grid;grid-template-columns:1fr 1fr;width:1000px;height:400px}.cell{min-width:0;min-height:0}.term-container{height:360px}[hidden]{display:none!important}</style><div id="grid"></div><div id="ctxMenu"></div>');
  await page.addStyleTag({ path: 'media/xterm.css' });
  await page.evaluate(() => {
    Object.assign(window, { __GRID_ROWS: 1, __GRID_COLS: 2, __GRID_ZOOM: 100, __GRID_FONT_FAMILY: '', __GRID_BG_COLOR: '', __GRID_FG_COLOR: '', __GRID_THEME: '', __GRID_THEME_COLORS: null, __GRID_MERGE_REGIONS: [], messages: [] });
    window.acquireVsCodeApi = () => ({ postMessage: msg => window.messages.push(msg), getState: () => undefined, setState() {} });
  });
  await page.addScriptTag({ content: bundle });
}

test('readiness snapshots reflect parsed cursor/erase operations, including queued output', async ({ page }) => {
  await grid(page);
  await page.evaluate(() => {
    window.postMessage({ type: 'output', id: 0, data: '\x1b[2J\x1b[HDo you trust this folder?\r\n❯ Yes\r\n? for shortcuts' }, '*');
    window.postMessage({ type: 'output', id: 0, data: '\x1b[H\x1b[2KClaude Code\x1b[2;1H\x1b[2K❯ \x1b[3;1H\x1b[2K? for shortcuts\x1b[2;3H' }, '*');
    window.postMessage({ type: 'startupSnapshotRequest', id: 0, requestId: 1, generation: 7 }, '*');
  });
  await expect.poll(() => page.evaluate(() => window.messages.filter(m => m.type === 'startupSnapshot').length)).toBe(1);
  const response = await page.evaluate(() => window.messages.find(m => m.type === 'startupSnapshot'));
  expect(response.generation).toBe(7);
  expect(response.snapshot.lines.join('\n')).not.toContain('trust');
  expect(response.snapshot.cursorY).toBe(1);
  expect(response.snapshot.cursorX).toBe(2);
  expect(classifyStartupScreen(response.snapshot)).toBe('ready');
});

test('retry and cancel target the paused generation without sending terminal input', async ({ page }) => {
  await grid(page);
  await page.evaluate(() => window.postMessage({ type: 'startupStatus', id: 1, text: 'Select a session', retry: true, generation: 12, retryLabel: 'Check again', cancelLabel: 'Cancel startup' }, '*'));
  await page.getByRole('button', { name: 'Check again', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel startup', exact: true }).click();
  const messages = await page.evaluate(() => window.messages.filter(m => ['input', 'startupRetry', 'startupCancel'].includes(m.type)));
  expect(messages).toEqual([{ type: 'startupRetry', id: 1, generation: 12 }, { type: 'startupCancel', id: 1, generation: 12 }]);
  await page.evaluate(() => window.postMessage({ type: 'reset', id: 1 }, '*'));
  await expect(page.getByText('Select a session', { exact: true })).toBeHidden();
});

test('sidebar launch modes preview and save native resume commands for the selected cell', async ({ page }) => {
  const originalLoad = Module._load;
  Module._load = function(id, ...args) {
    if (id === 'vscode') return {
      EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
      l10n: { t: (value, ...args) => value.replace(/\{(\d+)\}/g, (_, index) => args[index]) },
      workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }) },
    };
    return originalLoad.call(this, id, ...args);
  };
  let html;
  try {
    const { SidebarProvider } = require('../../out/SidebarProvider');
    const provider = Object.create(SidebarProvider.prototype);
    provider._mcpPort = 7890;
    provider._context = { extension: { packageJSON: require('../../package.json') } };
    html = provider._getHtml();
  } finally { Module._load = originalLoad; }
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.messages = [];
    window.acquireVsCodeApi = () => ({ postMessage: msg => window.messages.push(msg), getState: () => ({}), setState() {} });
  });
  await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await page.selectOption('#launchMode', 'picker');
  await expect(page.locator('#launchPreview')).toHaveText('codex resume');
  await page.locator('#launchAddBtn').click();
  await page.evaluate(() => { window.activeCmdTab = '1'; });
  await page.selectOption('#launchCli', 'claude');
  await page.selectOption('#launchMode', 'last');
  await expect(page.locator('#launchPreview')).toHaveText('claude --continue');
  await page.selectOption('#launchMode', 'session');
  await expect(page.locator('#launchAddBtn')).toBeDisabled();
  await page.locator('#launchSession').fill('abc-123');
  await page.locator('#launchOptions').fill('--model opus');
  await page.locator('#launchAddBtn').click();
  const commands = await page.evaluate(() => window.messages.filter(m => m.type === 'addStep').map(m => m.step.input));
  expect(commands).toEqual(['codex resume', 'claude --resume abc-123 --model opus']);
  expect(await page.evaluate(() => window.messages.filter(m => m.type === 'addStep').map(m => m.target))).toEqual(['all', 1]);
  expect(errors).toEqual([]);
});
