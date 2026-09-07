const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'vscode') return {
    EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
    workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }) },
    window: { showWarningMessage() {} },
    l10n: { t: (value, ...args) => value.replace(/\{(\d+)\}/g, (_, i) => args[i]) },
  };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
const { PtyWriteQueue } = require('../out/PtyWriteQueue');
const { tabState } = require('../out/TabStateStore');
Module._load = originalLoad;

function fixture(t) {
  const messages = [];
  const p = Object.create(TerminalGridPanel.prototype);
  Object.assign(p, {
    _disposed: false, _panel: { webview: { postMessage: message => { messages.push(message); return Promise.resolve(true); } } },
    _terminals: [], _stepGeneration: { 0: 1 }, _hiddenCells: new Set(),
    _commandQueues: new Map(), _outputFlows: new Map(), _outputEpoch: 0,
    _startupRuns: new Map(), _startupPending: new Set(), _startupLastStatus: new Map(), _userInputVersion: {},
    _snapshotRequests: new Map(), _snapshotSequence: 0,
  });
  for (const key of ['_insideLlm', '_csiUMode', '_altScreen', '_altDwellStart', '_lastByteTs', '_outputBuffers',
    '_stepWatermark', '_startupSent', '_controlTail', '_cellShellType', '_bracketedPaste', '_droppedOutput']) p[key] = [];
  const writes = [];
  const writer = new PtyWriteQueue(data => writes.push(data), error => { throw error; }, 2, 2);
  const status = { state: 'running' };
  let exitListener;
  const pty = { status, write: data => writer.write(data), writeAsync: data => writer.writeAsync(data),
    cancelInput: interrupt => writer.cancel('Input cancelled', interrupt), resize() {}, onData() {},
    onExit: callback => { exitListener = callback; },
    kill: () => { status.state = 'exited'; writer.dispose(); } };
  p._terminals = [{ id: 0, pty }];
  t.after(() => { writer.dispose(); for (const queue of p._commandQueues.values()) queue.dispose(); });
  return { p, pty, writer, writes, messages, exit: code => {
    Object.assign(pty.status, { state: 'exited', exitCode: code }); writer.dispose(); exitListener?.(pty.status);
  } };
}

test('actual panel delivers concurrent text plus Enter atomically through the PTY writer', async t => {
  const { p, writes } = fixture(t);
  p._insideLlm[0] = true;
  const results = await Promise.all([p.deliverToCell(0, 'ABC', true), p.deliverToCell(0, 'xyz', true)]);
  assert.equal(writes.join(''), 'ABC\rxyz\r');
  assert.ok(results.every(result => result.delivery === 'delivered' && result.submitted));
  assert.equal(p._userInputVersion[0], 2);
});

test('actual panel refuses dead cells and reports writer failure instead of success', async t => {
  const { p, pty, writer, writes } = fixture(t);
  pty.status = { state: 'exited', exitCode: 7 };
  assert.equal((await p.deliverToCell(0, 'lost', true)).success, false);
  assert.equal(p.sendToCell(0, 'lost'), false);
  assert.equal(p.sendInputToCell(0, 'lost'), false);
  assert.deepEqual(p.getCellStatuses(), [{ state: 'exited', exitCode: 7 }]);
  assert.deepEqual(writes, []);
  pty.status = { state: 'running' };
  writer.dispose();
  const result = await p.deliverToCell(0, 'also lost', true);
  assert.equal(result.delivery, 'failed');
  assert.equal(result.submitted, false);
  assert.deepEqual(writes, []);
});

test('actual panel uses parsed snapshots for current screen and reports raw history truncation explicitly', async t => {
  const { p } = fixture(t);
  p._outputBuffers[0] = 'Old confirmation\n> Old answer\x1b[2JReady\n> ';
  p._droppedOutput[0] = 400;
  p._lastByteTs[0] = 1000;
  p._requestSnapshot = async () => ({ lines: ['Ready', '> '], cursorX: 2, cursorY: 1 });
  const screen = await p.readCellSnapshot(0);
  assert.equal(screen.output, 'Ready\n> ');
  assert.doesNotMatch(screen.output, /Old/);
  assert.equal(screen.mode, 'screen');
  assert.equal(screen.truncated, false);
  const history = await p.readCellSnapshot(0, { mode: 'history', lines: 2 });
  assert.match(history.output, /Old answerReady/);
  assert.equal(history.mode, 'history');
  assert.equal(history.truncated, true);
  assert.equal(history.range.droppedCharacters, 400);
  p._requestSnapshot = async () => { throw new Error('lines:0 must not request the terminal content'); };
  assert.equal((await p.readCellSnapshot(0, { lines: 0 })).output, '');
});

test('MCP delivery cannot inject a command into an active startup sequence', async t => {
  const { p, writes } = fixture(t);
  p._startupRuns.set(0, { paused: false, generation: 1, steps: [], index: 0, insideLlm: true });
  const result = await p.deliverToCell(0, 'unexpected', true);
  assert.equal(result.delivery, 'failed');
  assert.match(result.error, /startup/i);
  assert.deepEqual(writes, []);
});

test('MCP delivery waits for configured startup even before the first shell output', async t => {
  const { p, writes } = fixture(t);
  p._startupPending.add(0);
  const result = await p.deliverToCell(0, 'unexpected', true);
  assert.equal(result.delivery, 'failed');
  assert.match(result.error, /startup/i);
  assert.deepEqual(writes, []);
});

test('PTY replacement fails queued requests instead of applying them to the new process', async t => {
  const { p, writer, writes } = fixture(t);
  const first = p.deliverToCell(0, 'A'.repeat(100), true);
  const second = p.deliverToCell(0, 'should not run', true);
  await Promise.resolve();
  writer.dispose();
  const replacementWrites = [];
  p._terminals[0] = { id: 0, pty: { status: { state: 'running' }, write: data => replacementWrites.push(data), writeAsync: async data => replacementWrites.push(data) } };
  const results = await Promise.all([first, second]);
  assert.ok(results.every(result => result.delivery === 'failed'));
  assert.doesNotMatch(writes.join(''), /\r|should not run/);
  assert.deepEqual(replacementWrites, []);
});

test('actual cancel stops queued text and Enter, sends Ctrl+C, and allows a subsequent new request', async t => {
  const { p, writes } = fixture(t);
  const first = p.deliverToCell(0, 'A'.repeat(100), true);
  const second = p.deliverToCell(0, 'should not run', true);
  await Promise.resolve();
  const generation = p._stepGeneration[0];
  p._cancelCellInput(0, true);
  assert.ok((await Promise.all([first, second])).every(result => result.delivery === 'failed'));
  assert.equal(p._stepGeneration[0], generation + 1);
  assert.doesNotMatch(writes.join(''), /\r|should not run/);
  assert.equal(writes.at(-1), '\x03');
  assert.equal((await p.deliverToCell(0, 'clean', true)).delivery, 'delivered');
  assert.ok(writes.join('').endsWith('clean\r'));
});

test('actual exit listener cancels pending deliveries, startup work and publishes exit status', async t => {
  const { p, pty, writes, messages, exit } = fixture(t);
  p._watchTerminal(0, pty);
  const first = p.deliverToCell(0, 'A'.repeat(100), true);
  const second = p.deliverToCell(0, 'should not run', true);
  await Promise.resolve();
  exit(9);
  assert.ok((await Promise.all([first, second])).every(result => result.delivery === 'failed'));
  assert.doesNotMatch(writes.join(''), /\r|should not run/);
  assert.deepEqual(p.getCellStatuses(), [{ state: 'exited', exitCode: 9 }]);
  assert.ok(messages.some(message => message.type === 'cellStatus' && message.status.exitCode === 9));
  assert.equal((await p.deliverToCell(0, 'lost', true)).success, false);
});

test('a screen waiting behind host output cannot authorize startup or be labeled current', async t => {
  const { p, messages } = fixture(t);
  p._outputFlows.set(0, { epoch: 1, flow: { pendingCharacters: 100 } });
  assert.equal(await p._requestSnapshot(0, p._stepGeneration[0]), null);
  assert.ok(messages.every(message => message.type !== 'startupSnapshotRequest'));
  await assert.rejects(p.readCellSnapshot(0), /screen.*unavailable|catching up/i);
});

test('one invalid shell is reported as exited while remaining cells still start and accept input', async t => {
  const { p, messages } = fixture(t);
  const previousPty = TerminalGridPanel._nodePty;
  const previousContext = tabState._ctx;
  t.after(() => { TerminalGridPanel._nodePty = previousPty; tabState._ctx = previousContext; });
  const state = { get: (_key, fallback) => fallback, update: async () => {} };
  tabState.init({ workspaceState: state, globalState: state });
  const healthyWrites = [];
  let attempts = 0;
  TerminalGridPanel._nodePty = { spawn: () => {
    if (++attempts === 1) throw new Error('Configured shell does not exist');
    return { write: text => healthyWrites.push(text), onData() {}, onExit() {}, pause() {}, resume() {}, kill() {}, resize() {} };
  } };
  Object.assign(p, { _rows: 1, _cols: 2, _tabId: 0, _cellDimensions: [], _terminals: [] });
  p._resolveShell = () => ({ path: 'mock-shell', args: [] });
  p.sendLabels = () => {};
  p._createTerminals(100, 30);
  assert.equal(p.getCellCount(), 2);
  assert.equal(p.getCellStatuses()[0].state, 'exited');
  assert.match(p.getCellStatuses()[0].error, /shell does not exist/);
  assert.equal(p.getCellStatuses()[1].state, 'running');
  assert.ok(messages.some(message => message.type === 'cellStatus' && message.id === 0 && /shell does not exist/.test(message.status.error)));
  assert.equal((await p.deliverToCell(0, 'lost', true)).delivery, 'failed');
  assert.equal((await p.deliverToCell(1, 'healthy', true)).delivery, 'delivered');
  assert.equal(healthyWrites.join(''), 'healthy\r');
  for (const terminal of p._terminals) terminal.pty.kill();
});
