const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CellCommandQueue, buildCellInput, formatCellRead } = require('../out/CellIo');

test('concurrent whole-cell submissions never interleave text or Enter', async () => {
  const queue = new CellCommandQueue();
  const writes = [];
  const send = text => queue.enqueue(text.length, true, async () => {
    for (const ch of text) {
      writes.push(ch);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    writes.push('\r');
  });
  const results = await Promise.all([send('ABC'), send('xyz')]);
  assert.equal(writes.join(''), 'ABC\rxyz\r');
  assert.ok(results.every(item => item.success && item.delivery === 'delivered' && item.submitted));
});

test('restart rejects active, queued, and subsequent deliveries and never sends a late Enter', async () => {
  const queue = new CellCommandQueue();
  const writes = [];
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const first = queue.enqueue(3, true, async assertActive => {
    writes.push('ABC');
    await blocked;
    assertActive();
    writes.push('\r');
  });
  const second = queue.enqueue(3, true, async () => { writes.push('xyz\r'); });
  await Promise.resolve();
  queue.dispose('Cell restarted');
  const third = queue.enqueue(4, true, async () => { writes.push('lost\r'); });
  const results = await Promise.all([first, second, third]);
  assert.ok(results.every(item => !item.success && item.delivery === 'failed' && item.error === 'Cell restarted'));
  assert.ok(results.every(item => item.submitted === false));
  release();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(writes, ['ABC']);
});

test('write failures are reported, and a bounded input queue rejects overload', async () => {
  const failed = new CellCommandQueue();
  const receipt = await failed.enqueue(3, false, async () => { throw new Error('PTY closed'); });
  assert.equal(receipt.success, false);
  assert.equal(receipt.error, 'PTY closed');
  const queue = new CellCommandQueue();
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const queued = Array.from({ length: 16 }, () => queue.enqueue(1, false, async () => blocked));
  const full = await queue.enqueue(1, false, async () => {});
  assert.equal(full.delivery, 'failed');
  assert.match(full.error, /queue is full/);
  queue.dispose();
  await Promise.all(queued);
  release();
});

test('negotiated paste preserves multiline text in one packet and leaves raw control input intact', () => {
  assert.equal(buildCellInput('한글😀\nsecond', { submit: true, bracketedPaste: true, enter: '\x1b[13u' }), '\x1b[200~한글😀\rsecond\x1b[201~\x1b[13u');
  assert.equal(buildCellInput('\x03', { submit: false, bracketedPaste: true, enter: '\r' }), '\x03');
  assert.equal(buildCellInput('hello', { submit: true, bracketedPaste: false, enter: '\r' }), 'hello\r');
  assert.throws(() => buildCellInput('first\nsecond', { submit: true, bracketedPaste: false, enter: '\r' }), /not enabled bracketed paste/);
});

test('read metadata distinguishes full screen, selected line ranges and truncated history', () => {
  const base = { lines: ['Ready', '>'], mode: 'screen', state: { state: 'running' }, lastOutputAt: 1000, cursor: { x: 2, y: 1 } };
  const screen = formatCellRead(base);
  assert.equal(screen.output, 'Ready\n>');
  assert.equal(screen.truncated, false);
  assert.equal(screen.lastOutputAt, '1970-01-01T00:00:01.000Z');
  assert.deepEqual(screen.cursor, base.cursor);
  const empty = formatCellRead({ ...base, requestedLines: 0 });
  assert.equal(empty.output, '');
  assert.deepEqual(empty.range, { startLine: 0, endLine: 0, totalLines: 2, droppedCharacters: 0 });
  const history = formatCellRead({ ...base, mode: 'history', requestedLines: 1, droppedCharacters: 800 });
  assert.equal(history.output, '>');
  assert.equal(history.truncated, true);
  assert.deepEqual(history.range, { startLine: 2, endLine: 2, totalLines: 2, droppedCharacters: 800 });
});
