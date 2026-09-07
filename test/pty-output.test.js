const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function(id, ...args) {
  if (id === 'vscode') return {
    EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
    workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }) },
  };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
Module._load = originalLoad;

// Exercise actual output stream backpressure. This child cannot run shell/LLM commands.
const child = `
  process.stdin.setEncoding('utf8');
  let input = '';
  process.stdin.on('data', data => {
    input += data;
    if (input.includes('burst')) {
      input = '';
      for (let i = 0; i < 2000; i++) process.stdout.write('ROW' + String(i).padStart(4, '0') + '\\r\\n');
      process.stdout.write('OUTPUT-DONE\\r\\n');
    }
  });
  process.stdout.write('CHILD-READY\\r\\n');
`;

for (const usePty of [true, false]) {
  test(`${usePty ? 'PTY' : 'fallback shell'} holds output during selection and resumes every row in order`, { timeout: 15000 }, async t => {
    const p = Object.create(TerminalGridPanel.prototype);
    p._resolveShell = () => ({ path: process.execPath, args: ['-e', child] });
    const terminal = p._spawnPty(usePty ? require('node-pty') : null, 80, 24, process.cwd());
    // Closing the PTY also disposes node-pty's Windows pipe worker. Letting only
    // the child exit leaves that worker alive in node-pty 1.1.0.
    t.after(() => terminal.kill());
    let text = '';
    terminal.onData(data => { text += data; });
    async function until(condition) {
      const deadline = Date.now() + 8000;
      while (!condition()) {
        assert.ok(Date.now() < deadline, 'child output timed out');
        await delay(20);
      }
    }
    await until(() => text.includes('CHILD-READY'));
    await delay(50);
    terminal.pause();
    const before = text;
    terminal.write('burst\r\n');
    await delay(150);
    assert.equal(text, before, 'paused stream delivered data');
    terminal.resume();
    await until(() => text.includes('OUTPUT-DONE'));
    assert.deepEqual(text.match(/ROW\d{4}/g), Array.from({ length: 2000 }, (_, i) => `ROW${String(i).padStart(4, '0')}`));
  });
}
