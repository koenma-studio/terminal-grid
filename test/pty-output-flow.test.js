const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PtyOutputFlow } = require('../out/PtyOutputFlow');

function makeFlow() {
  const posted = [];
  const controls = [];
  const flow = new PtyOutputFlow({ post: (data, sequence) => posted.push({ data, sequence }),
    pause: () => controls.push('pause'), resume: () => controls.push('resume') }, 16, 8, 4);
  return { flow, posted, controls };
}

test('output waits for parsing acknowledgments and never exceeds its high watermark', () => {
  const { flow, posted, controls } = makeFlow();
  const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  flow.enqueue(data);
  assert.equal(flow.inFlightCharacters, 16);
  assert.equal(flow.pendingCharacters, 20);
  assert.deepEqual(controls, ['pause']);
  let acked = 0;
  while (acked < posted.length) {
    flow.acknowledge(posted[acked++].sequence);
    assert.ok(flow.inFlightCharacters <= 16);
  }
  assert.equal(posted.map(item => item.data).join(''), data);
  assert.equal(flow.inFlightCharacters, 0);
  assert.equal(flow.pendingCharacters, 0);
  assert.deepEqual(controls, ['pause', 'resume']);
});

test('selection and output pressure share pause state; finishing a drag cannot bypass pressure', () => {
  const { flow, posted, controls } = makeFlow();
  flow.enqueue('A'.repeat(24));
  flow.selectionPaused(true);
  flow.acknowledge(posted[0].sequence);
  assert.equal(posted.length, 4, 'selection blocks new output while existing writes settle');
  flow.selectionPaused(false);
  assert.equal(posted.length, 5);
  assert.equal(flow.paused, true);
  assert.deepEqual(controls, ['pause']);
  for (let i = 1; i < posted.length; i++) flow.acknowledge(posted[i].sequence);
  assert.equal(flow.paused, false);
  assert.deepEqual(controls, ['pause', 'resume']);
});

test('selection preserves overshoot and duplicate/out-of-order acknowledgments cannot release extra capacity', () => {
  const { flow, posted, controls } = makeFlow();
  flow.selectionPaused(true);
  flow.enqueue('A'.repeat(20));
  assert.equal(posted.length, 0);
  assert.equal(flow.pendingCharacters, 20);
  flow.selectionPaused(false);
  assert.equal(flow.inFlightCharacters, 16);
  const last = posted.at(-1).sequence;
  flow.acknowledge(last);
  const inFlight = flow.inFlightCharacters;
  flow.acknowledge(last);
  flow.acknowledge(9999);
  assert.equal(flow.inFlightCharacters, inFlight);
  for (const item of posted) flow.acknowledge(item.sequence);
  assert.equal(posted.map(item => item.data).join(''), 'A'.repeat(20));
  assert.deepEqual(controls, ['pause', 'resume']);
});

test('flow chunks preserve emoji pairs and disposal ignores late output/acknowledgments', () => {
  const { flow, posted, controls } = makeFlow();
  const text = '한글a😀'.repeat(10);
  flow.enqueue(text);
  for (let i = 0; i < posted.length; i++) flow.acknowledge(posted[i].sequence);
  assert.equal(posted.map(item => item.data).join(''), text);
  for (const item of posted) {
    assert.doesNotMatch(item.data, /[\uD800-\uDBFF]$/);
    assert.doesNotMatch(item.data, /^[\uDC00-\uDFFF]/);
  }
  flow.selectionPaused(true);
  flow.enqueue('pending');
  const count = posted.length;
  flow.dispose();
  flow.enqueue('old process output');
  flow.acknowledge(1);
  assert.equal(posted.length, count);
  assert.equal(flow.pendingCharacters, 0);
  assert.equal(flow.inFlightCharacters, 0);
  assert.equal(controls.at(-1), 'resume');
});
