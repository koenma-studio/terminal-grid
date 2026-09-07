const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function(id, ...args) {
  if (id === 'vscode') return {
    EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
    workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }) },
    l10n: { t: (value, ...args) => value.replace(/\{(\d+)\}/g, (_, i) => args[i]) },
  };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
Module._load = originalLoad;

function panel() {
  const p = Object.create(TerminalGridPanel.prototype);
  Object.assign(p, { _disposed: false, _panel: { webview: { postMessage() {} } }, _terminals: [], _stepGeneration: {}, _hiddenCells: new Set(),
    _startupRuns: new Map(), _startupLastStatus: new Map(), _userInputVersion: {}, _snapshotRequests: new Map(), _snapshotSequence: 0,
    _commandQueues: new Map(), _outputFlows: new Map() });
  for (const key of ['_insideLlm', '_csiUMode', '_altScreen', '_altDwellStart', '_lastByteTs', '_outputBuffers', '_stepWatermark', '_startupSent', '_controlTail', '_cellShellType']) p[key] = [];
  p._resetCellState(0, true);
  return p;
}

test('history retains a dialog delivered with a clear, including split sequences', async () => {
  const p = panel();
  p._handlePtyData(0, '\x1b[?1049h\x1b[2JDo you trust the files in this folder?', []);
  assert.match(p._screen(0), /Do you trust/);
  p._handlePtyData(0, '\x1b[', []);
  p._handlePtyData(0, '2JReady screen', []);
  assert.equal(p._screen(0), 'Ready screen');
  p._handlePtyData(0, '\x1b[>', []);
  p._handlePtyData(0, '1u', []);
  assert.equal(p._csiUMode[0], true);
  p._handlePtyData(0, '\x1b[<u', []);
  assert.equal(p._csiUMode[0], false);
});

test('screen watermark remains valid when the rolling output buffer is truncated', () => {
  const p = panel();
  p._handlePtyData(0, 'a'.repeat(49980) + '\x1b[2JReady', []);
  p._handlePtyData(0, 'b'.repeat(50), []);
  assert.equal(p._screen(0), 'Ready' + 'b'.repeat(50));
});

test('restart invalidates a readiness wait before it can accept a dialog', async () => {
  const p = panel();
  let writes = 0;
  p._terminals = [{ pty: { write() { writes++; } } }];
  p._handlePtyData(0, 'Do you trust the files in this folder?', []);
  p._requestSnapshot = async () => {
    p._resetCellState(0, true);
    return { lines: ['Do you trust the files in this folder?'], cursorX: 0, cursorY: 0 };
  };
  assert.equal(await p._waitForReady(0, true, p._stepGeneration[0]), false);
  assert.equal(writes, 0);
});

const idle = { lines: ['Codex', '', '› ', '? for shortcuts'], cursorX: 2, cursorY: 2 };

test('readiness holds a session picker until the empty composer is rendered and stable', async () => {
  const p = panel();
  let polls = 0;
  let writes = 0;
  p._terminals = [{ pty: { write() { writes++; } } }];
  p._requestSnapshot = async () => ++polls < 3
    ? { lines: ['Resume a session', '› saved session'], cursorX: 2, cursorY: 1 }
    : idle;
  assert.equal(await p._waitForReady(0, false, p._stepGeneration[0]), true);
  assert.ok(polls >= 7);
  assert.equal(writes, 0);
});

test('unconfirmed startup text is sent once with no backspaces, retries or Enter', async () => {
  const p = panel();
  p._insideLlm[0] = true;
  const writes = [];
  p._terminals = [{ pty: { write: text => writes.push(text) } }];
  let snapshots = 0;
  p._requestSnapshot = async () => ++snapshots === 1 ? idle : { lines: ['Loading tools…'], cursorX: 0, cursorY: 0 };
  assert.equal(await p._typeAndConfirm(0, '/compact', p._stepGeneration[0]), false);
  assert.equal(writes.join(''), '/compact');
});

test('confirmed composer is submitted exactly once; manual input cancels submission', async () => {
  for (const interrupt of [false, true]) {
    const p = panel(); p._insideLlm[0] = true;
    const writes = []; let snapshots = 0;
    p._terminals = [{ pty: { write: text => writes.push(text) } }];
    p._requestSnapshot = async () => {
      if (++snapshots === 1) return idle;
      if (interrupt) p._userInputVersion[0]++;
      return { ...idle, lines: ['Codex', '', '› /compact', '? for shortcuts'], cursorX: 10 };
    };
    assert.equal(await p._typeAndConfirm(0, '/compact', p._stepGeneration[0]), !interrupt);
    assert.equal(writes.join(''), '/compact' + (interrupt ? '' : '\r'));
  }
});

test('retry continues the pending step without relaunching or resending completed commands', async () => {
  const p = panel(); const writes = []; const typed = [];
  p._terminals = [{ pty: { write: text => writes.push(text) } }];
  p._settle = async () => {};
  p._waitForReady = async () => false;
  p._typeAndConfirm = async (_id, text) => { typed.push(text); return true; };
  await p._executeSteps(0, [{ type: 'command', input: 'codex' }, { type: 'command', input: '/resume' }, { type: 'command', input: '/compact' }], '');
  const run = p._startupRuns.get(0);
  assert.equal(run.paused, true);
  assert.equal(run.index, 1);
  assert.deepEqual(writes, ['codex resume\r']);
  p._waitForReady = async () => true;
  run.paused = false;
  await p._runStartup(0, run);
  assert.deepEqual(writes, ['codex resume\r']);
  assert.deepEqual(typed, ['/compact']);
  assert.equal(p._startupRuns.size, 0);
});

test('reset resolves pending snapshots and late replies cannot authorize another generation', async () => {
  const p = panel();
  const snapshot = p._requestSnapshot(0, p._stepGeneration[0]);
  const requestId = p._snapshotSequence;
  const generation = p._stepGeneration[0];
  p._resetCellState(0, true);
  p._receiveSnapshot({ requestId, generation, id: 0, snapshot: idle });
  assert.equal(await snapshot, null);
  assert.equal(p._snapshotRequests.size, 0);
});

test('an expired wait pauses with a retry action and never types into a loading screen', async () => {
  const p = panel(); const messages = []; const writes = [];
  p._panel.webview.postMessage = message => messages.push(message);
  p._terminals = [{ pty: { write: value => writes.push(value) } }];
  const originalNow = Date.now;
  let now = originalNow();
  try {
    Date.now = () => now;
    p._requestSnapshot = async () => {
      now += 61000;
      return { lines: ['Connecting to MCP servers. Please wait...'], cursorX: 0, cursorY: 0 };
    };
    assert.equal(await p._waitForReady(0, false, p._stepGeneration[0]), false);
    assert.equal(messages.at(-1).retry, true);
    assert.match(messages.at(-1).text, /Startup paused/);
    assert.deepEqual(writes, []);
  } finally { Date.now = originalNow; }
});

test('LLM applications that did not enable Kitty receive plain Enter', () => {
  const p = panel();
  p._insideLlm[0] = true;
  assert.equal(p._enterSeq(0), '\r');
});

test('cmd and PowerShell startup submit one PTY Enter; pipe fallback uses its own newline', async () => {
  for (const [shell, enter] of [['cmd', '\r'], ['pwsh', '\r'], ['pwsh', '\n']]) {
    const p = panel(); const writes = [];
    p._terminals = [{ pty: { enter, write: text => writes.push(text) } }];
    p._cellShellType[0] = shell;
    p._settle = async () => {};
    await p._executeSteps(0, [{ type: 'command', input: 'echo ready' }], shell);
    assert.deepEqual(writes, ['echo ready' + enter]);
  }
});

test('extension shutdown keeps the persisted tab snapshot', () => {
  const p = panel();
  const changes = [];
  p._context = { globalState: { update: (key, value) => changes.push({ key, value }) } };
  p._pasteImages = [];
  p._panel.dispose = () => {};
  p.dispose(true);
  assert.equal(p._disposed, true);
  assert.deepEqual(changes, []);
});
