const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildLaunchCommand, compileStartupSteps } = require('../out/StartupLaunch');
const { classifyStartupScreen, ReadinessGate } = require('../out/StartupReadiness');

function hint(snapshot) {
  return { ...snapshot, cols: 100, lineInfo: snapshot.lines.map((line, row) => ({ wrapped: false, styles: row === snapshot.cursorY
    ? [{ start: 0, end: 2, dim: false, italic: false, fgMode: 0, fg: 0 }, { start: 2, end: line.length, dim: true, italic: false, fgMode: 0, fg: 0 }]
    : [] })) };
}

test('all launch modes use native interactive commands and retain user options', () => {
  for (const [cli, expected] of [
    ['codex', ['codex', 'codex resume', 'codex resume --last', 'codex resume abc-123']],
    ['claude', ['claude', 'claude --resume', 'claude --continue', 'claude --resume abc-123']],
  ]) {
    for (const [i, mode] of ['new', 'picker', 'last', 'session'].entries()) {
      assert.equal(buildLaunchCommand({ cli, mode, sessionId: 'abc-123', options: '--model test' }), expected[i] + ' --model test');
    }
  }
  for (const sessionId of ['', 'a;echo hacked', '$(whoami)', 'a\nb', 'a b']) {
    assert.throws(() => buildLaunchCommand({ cli: 'codex', mode: 'session', sessionId }));
  }
});

test('legacy resume pairs compile without typing /resume and without changing saved settings', () => {
  const saved = [{ type: 'command', input: 'codex -s danger-full-access -a never' }, { type: 'timeout', ms: 1500 }, { type: 'command', input: '/resume' }, { type: 'command', input: '/compact' }];
  const before = JSON.stringify(saved);
  assert.deepEqual(compileStartupSteps(saved), [{ type: 'command', input: 'codex resume -s danger-full-access -a never' }, { type: 'timeout', ms: 1500 }, { type: 'command', input: '/compact' }]);
  assert.equal(JSON.stringify(saved), before);
  assert.deepEqual(compileStartupSteps([{ type: 'command', input: 'claude --model opus' }, { type: 'command', input: '/resume abc-123' }]), [{ type: 'command', input: 'claude --resume abc-123 --model opus' }]);
  for (const input of ['codex resume', 'claude --continue', 'codex --model test; echo x', 'echo codex', 'codex -c model=foo']) {
    const steps = [{ type: 'command', input }, { type: 'command', input: '/resume' }];
    assert.deepEqual(compileStartupSteps(steps), steps);
  }
});

test('boot text, busy footers, login and session pickers are never classified as ready', () => {
  const cases = [
    [['Connecting to MCP servers. Waiting for initialization of codex_apps and terminal-grid.'], 0, 'starting'],
    [['› ', 'esc to interrupt · ? for shortcuts'], 0, 'busy'],
    [['Do you trust the files in this folder?', '❯ Yes'], 1, 'trust'],
    [['Resume a previous session', '› Example', '? for shortcuts'], 1, 'picker'],
    [['Please sign in to continue', '❯ ', '? for shortcuts'], 1, 'blocked'],
    [['› /some-user-input', '? for shortcuts'], 0, 'occupied'],
    [['❯ ', 'Choose a color'], 0, 'starting'],
  ];
  for (const [lines, cursorY, state] of cases) {
    const snapshot = { lines, cursorY, cursorX: state === 'occupied' ? 18 : 2 };
    assert.equal(classifyStartupScreen(snapshot), state);
    const gate = new ReadinessGate();
    assert.equal(gate.observe(snapshot, 0).ready, false);
    assert.equal(gate.observe(snapshot, 300000).ready, false, 'time alone must not grant readiness');
  }
});

test('only a stable empty composer qualifies; unavailable snapshots reset the gate', () => {
  for (const glyph of ['›', '❯']) {
    const screen = hint({ lines: [glyph + ' Try asking a question', '? for shortcuts'], cursorY: 0, cursorX: 2 });
    const gate = new ReadinessGate();
    assert.equal(gate.observe(screen, 0).ready, false);
    assert.equal(gate.observe(screen, 599).ready, false);
    assert.equal(gate.observe(screen, 600).ready, true);
    gate.observe({ lines: [], cursorX: 0, cursorY: 0 }, 601);
    assert.equal(gate.observe(screen, 1000).ready, false);
  }
});

test('current CLI screens recognize the Codex model/path footer and bottom-cursor session picker', () => {
  const lines = Array(30).fill('');
  lines[1] = '│ >_ OpenAI Codex (v0.153.4) │';
  lines[12] = '› Ask Codex to do anything';
  lines[14] = '  gpt-6-astra xhigh · G:\\repos\\example';
  assert.equal(classifyStartupScreen(hint({ lines, cursorX: 2, cursorY: 12 })), 'ready');
  lines.fill('');
  lines[0] = ' Resume a previous session';
  lines[27] = ' enter resume   ctrl+a archive   esc new   ctrl+c quit   tab focus';
  assert.equal(classifyStartupScreen({ lines, cursorX: 79, cursorY: 27 }), 'picker');
  lines.fill(''); lines[2] = 'Resume session'; lines[4] = '│ ⌕ Search… │';
  assert.equal(classifyStartupScreen({ lines, cursorX: 0, cursorY: 29 }), 'picker');
  assert.equal(classifyStartupScreen({ lines: ['Use Fable 5.1 at high effort by default?', '❯ Keep xhigh', '  Switch to high effort'], cursorX: 22, cursorY: 2 }), 'blocked');
});
