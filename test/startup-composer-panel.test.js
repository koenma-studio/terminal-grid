const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'vscode') return { EventEmitter: class { event = () => ({ dispose() {} }); fire() {} } };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
Module._load = originalLoad;

function panel(snapshots) {
  const writes = [];
  const value = Object.create(TerminalGridPanel.prototype);
  Object.assign(value, { _disposed: false, _stepGeneration: [1], _userInputVersion: [0], _insideLlm: [true], _csiUMode: [false],
    _terminals: [{ pty: { write: text => writes.push(text) } }], _requestSnapshot: snapshots });
  return { value, writes };
}

const idle = { lines: ['› ', '? for shortcuts'], cursorX: 2, cursorY: 0 };

test('startup does not type into existing input whose cursor is at Home', async () => {
  const { value, writes } = panel(async () => ({ ...idle, lines: ['› existing question', '? for shortcuts'] }));
  assert.equal(await value._typeAndConfirm(0, '/resume', 1), false);
  assert.deepEqual(writes, []);
});

test('actual startup submission refuses a suffix or another row after typing', async () => {
  const realNow = Date.now;
  let now = realNow();
  try {
    Date.now = () => now;
    for (const lines of [['› /resumeexisting question', '? for shortcuts'], ['› /resume', '  another row', '? for shortcuts']]) {
      let requests = 0;
      const { value, writes } = panel(async () => {
        if (++requests === 1) return idle;
        now += 3000;
        return { ...idle, lines, cursorX: 9 };
      });
      assert.equal(await value._typeAndConfirm(0, '/resume', 1), false);
      assert.equal(writes.join(''), '/resume');
    }
  } finally { Date.now = realNow; }
});
