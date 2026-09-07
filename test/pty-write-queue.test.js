const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const { PtyWriteQueue } = require('../out/PtyWriteQueue');

test('Enter and a second paste follow all chunks of the first paste, preserving Unicode', async () => {
  const chunks = [];
  const writer = new PtyWriteQueue(data => chunks.push(data), assert.fail, 8, 1);
  const first = '\x1b[200~a😀한글\rsecond line\x1b[201~';
  writer.write(first);
  writer.write('\r');
  writer.write('next paste');
  await delay(150);
  assert.equal(chunks.join(''), first + '\rnext paste');
  assert.equal(Buffer.concat(chunks.map(s => Buffer.from(s))).toString(), first + '\rnext paste');
  writer.dispose();
});

test('closing/restarting cancels pending writes and errors never escape a timer', async () => {
  const chunks = [];
  const writer = new PtyWriteQueue(data => chunks.push(data), assert.fail, 4, 1);
  writer.write('long paste');
  writer.dispose();
  writer.write('after close');
  await delay(30);
  assert.deepEqual(chunks, ['long']);
  const errors = [];
  let count = 0;
  const failing = new PtyWriteQueue(() => { if (++count > 1) throw new Error('PTY exited'); }, e => errors.push(e), 4, 1);
  failing.write('long paste');
  await delay(30);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /PTY exited/);
});

test('cancelling a large paste closes its bracket, interrupts once, and drops queued Enter', async () => {
  const chunks = [];
  const writer = new PtyWriteQueue(data => chunks.push(data), assert.fail, 8, 50);
  const paste = writer.writeAsync('\x1b[200~' + '한😀data'.repeat(100) + '\x1b[201~');
  const enter = writer.writeAsync('\r');
  const completed = Promise.allSettled([paste, enter]);
  writer.cancel('User cancelled', true);
  const results = await completed;
  assert.deepEqual(results.map(result => result.status), ['rejected', 'rejected']);
  assert.equal(chunks.at(-1), '\x1b[201~\x03');
  assert.equal(chunks.join('').includes('\r'), false);
  const cancelled = chunks.join('');
  await delay(70);
  assert.equal(chunks.join(''), cancelled, 'cancelled chunks must never resume later');
  await writer.writeAsync('next input');
  assert.equal(chunks.join(''), cancelled + 'next input');
  writer.dispose();
});

test('an oversized input fails before any bytes are written and later input still works', async () => {
  const chunks = [];
  const writer = new PtyWriteQueue(data => chunks.push(data), assert.fail);
  await assert.rejects(writer.writeAsync('x'.repeat(8 * 1024 * 1024 + 1)), /queue is full/);
  assert.deepEqual(chunks, []);
  await writer.writeAsync('small');
  assert.deepEqual(chunks, ['small']);
  writer.dispose();
});
