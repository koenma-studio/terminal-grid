const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const Module = require('node:module');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

// Only the VS Code host API is stubbed; bridge HTTP and MCP stdio are real.
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'vscode') return { EventEmitter: class { event = () => ({ dispose() {} }); fire() {} } };
  return originalLoad.call(this, id, ...args);
};
const { McpBridge } = require('../out/McpBridge');
const { panelRegistry } = require('../out/PanelRegistry');
const { CellCommandQueue, formatCellRead } = require('../out/CellIo');
Module._load = originalLoad;

async function connect(t, port) {
  const client = new Client({ name: 'terminal-grid-regression', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [process.env.TERMINAL_GRID_TEST_SERVER || path.resolve('mcp-server.js'), '--port', String(port)], stderr: 'pipe' });
  const errors = [];
  transport.stderr.on('data', d => errors.push(d.toString()));
  t.after(() => client.close());
  await client.connect(transport, { timeout: 5000 });
  assert.equal(client.getServerVersion().name, 'terminal-grid');
  assert.deepEqual(errors, []);
  return client;
}

function request(port, body, headers = {}, reqPath = '/api/send') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, method: 'POST', path: reqPath, headers: { 'Content-Type': 'application/json', ...headers } }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('MCP initializes and lists tools even when the editor bridge is unavailable', async t => {
  const bridge = new McpBridge(0);
  const port = await bridge.start();
  await bridge.stop();
  const client = await connect(t, port);
  assert.equal((await client.listTools()).tools.length, 5);
  const result = await client.callTool({ name: 'get_grid_info', arguments: {} });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Cannot connect to Terminal Grid/);
  assert.equal((await client.listTools()).tools.length, 5);
});

test('MCP exposes UI cell/tab numbers and resolves them to sparse internal IDs', async t => {
  const sent = [];
  const fakePanel = {
    getRows: () => 1, getCols: () => 2, getCellCount: () => 2,
    getCellIds: () => [10, 11], getCellLabels: () => ['custom', '2'],
    getHiddenCellIds: () => [11],
    getCellStatuses: () => [{ state: 'running' }, { state: 'exited', exitCode: 0 }],
    sendToCell: (id, text) => { sent.push({ id, text }); return id === 0; },
    sendInputToCell: (id, text) => { sent.push({ id, text, submit: true }); return id === 0; },
    readCell: id => id === 0 ? '한글😀 output' : null,
    deliverToCell: async (id, text, submit) => {
      sent.push({ id, text, ...(submit ? { submit } : {}) });
      return { success: id === 0, delivery: id === 0 ? 'delivered' : 'failed', characters: text.length, submitted: submit, completedAt: new Date().toISOString() };
    },
    readCellSnapshot: async (id, options) => id === 0 ? formatCellRead({ lines: ['한글😀 output'], requestedLines: options.lines, mode: options.mode, state: { state: 'running' } }) : null,
  };
  panelRegistry.register(5, fakePanel);
  t.after(() => panelRegistry.unregister(5));
  const bridge = new McpBridge(0);
  t.after(() => bridge.stop());
  const client = await connect(t, await bridge.start());
  const info = JSON.parse((await client.callTool({ name: 'get_grid_info', arguments: {} })).content[0].text);
  assert.equal(info.activeTabId, 1);
  assert.equal(info.tabs[0].tabId, 1);
  assert.deepEqual(info.tabs[0].cellIds, [1]);
  assert.deepEqual(info.grid.cellIds, [1]);
  const result = await client.callTool({ name: 'send_to_cell', arguments: { cellId: 1, text: 'hello', submit: true } });
  assert.equal(result.isError, undefined);
  assert.equal(JSON.parse(result.content[0].text).delivery, 'delivered');
  assert.deepEqual(sent.pop(), { id: 0, text: 'hello', submit: true });
  const read = JSON.parse((await client.callTool({ name: 'read_cell', arguments: { cellId: 1 } })).content[0].text);
  assert.equal(read.output, '한글😀 output');
  assert.equal(read.mode, 'screen');
  assert.equal((await client.callTool({ name: 'send_to_cell', arguments: { cellId: 11, text: 'old global id' } })).isError, true);
  assert.equal((await client.callTool({ name: 'send_to_cell', arguments: { cellId: 2, text: 'hidden' } })).isError, true);
  const broadcast = await client.callTool({ name: 'broadcast', arguments: { text: 'hello' } });
  assert.equal(JSON.parse(broadcast.content[0].text).cellCount, 1);
});

test('bridge awaits whole-command delivery and exposes exited cells as readable but unavailable', async t => {
  const queue = new CellCommandQueue();
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const writes = [];
  const fakePanel = {
    getRows: () => 1, getCols: () => 2, getCellCount: () => 2,
    getCellIds: () => [50, 51], getCellLabels: () => ['1', '2'], getHiddenCellIds: () => [],
    getCellStatuses: () => [{ state: 'running' }, { state: 'exited', exitCode: 7 }],
    deliverToCell: (id, text, submit) => id === 0 ? queue.enqueue(text.length, submit, async assertActive => {
      writes.push(text);
      await blocked;
      assertActive();
      writes.push(submit ? '\r' : '');
    }) : Promise.resolve({ success: false, delivery: 'failed', error: 'Cell exited (7)' }),
    readCellSnapshot: async (id, options) => formatCellRead({ mode: options.mode,
      lines: options.mode === 'screen' ? ['Ready', '>'] : ['Old confirmation', '> Old answerReady', '>'],
      requestedLines: options.lines, droppedCharacters: options.mode === 'history' ? 100 : 0,
      lastOutputAt: 1000, state: id ? { state: 'exited', exitCode: 7 } : { state: 'running' } }),
  };
  panelRegistry.register(9, fakePanel);
  t.after(() => panelRegistry.unregister(9));
  const bridge = new McpBridge(0);
  const port = await bridge.start();
  t.after(() => bridge.stop());
  const client = await connect(t, port);
  let firstFinished = false;
  const first = request(port, JSON.stringify({ cellId: 50, text: 'ABC', submit: true })).then(result => { firstFinished = true; return result; });
  const second = request(port, JSON.stringify({ cellId: 50, text: 'xyz', submit: true }));
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(firstFinished, false, 'HTTP success must wait for PTY delivery');
  assert.deepEqual(writes, ['ABC']);
  release();
  assert.equal((await first).body.delivery, 'delivered');
  assert.equal((await second).body.delivery, 'delivered');
  assert.deepEqual(writes, ['ABC', '\r', 'xyz', '\r']);
  const info = JSON.parse((await client.callTool({ name: 'get_grid_info', arguments: {} })).content[0].text);
  assert.deepEqual(info.grid.cellIds, [1]);
  assert.equal(info.grid.cells[1].state, 'exited');
  assert.equal(info.grid.cells[1].exitCode, 7);
  const dead = await client.callTool({ name: 'send_to_cell', arguments: { cellId: 2, text: 'lost' } });
  assert.equal(dead.isError, true);
  assert.match(dead.content[0].text, /exit code 7/);
  const screen = JSON.parse((await client.callTool({ name: 'read_cell', arguments: { cellId: 2 } })).content[0].text);
  assert.equal(screen.output, 'Ready\n>');
  assert.equal(screen.state.state, 'exited');
  assert.equal(screen.truncated, false);
  const history = JSON.parse((await client.callTool({ name: 'read_cell', arguments: { cellId: 1, mode: 'history', lines: 1 } })).content[0].text);
  assert.equal(history.output, '>');
  assert.equal(history.mode, 'history');
  assert.equal(history.truncated, true);
  assert.deepEqual(history.range, { startLine: 3, endLine: 3, totalLines: 3, droppedCharacters: 100 });
  assert.equal((await request(port, JSON.stringify({ cellId: 50, mode: 'raw' }), {}, '/api/read')).status, 400);
});

test('bridge rejects malformed/oversized/browser requests and survives each failure', async t => {
  const bridge = new McpBridge(0);
  const port = await bridge.start();
  t.after(() => bridge.stop());
  for (const body of ['null', '[]', '{', '{"cellId":0.5,"text":"x"}', '{"cellId":0,"text":null}', '{"cellId":0,"text":"x","submit":"yes"}']) {
    assert.equal((await request(port, body)).status, 400, body);
  }
  assert.equal((await request(port, JSON.stringify({ cellId: 0, text: 'x'.repeat(1024 * 1024) }))).status, 413);
  assert.equal((await request(port, '{}', { Origin: 'https://example.com' })).status, 403);
  assert.equal((await request(port, '{}', { Host: 'attacker.example' })).status, 403);
  assert.equal((await request(port, '{}', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await fetch(`http://127.0.0.1:${port}/api/health`)).status, 200);
});

test('bridge port fallback publishes the actual port and releases it on stop', async t => {
  const first = new McpBridge(0);
  const occupied = await first.start();
  t.after(() => first.stop());
  const second = new McpBridge(occupied);
  t.after(() => second.stop());
  const actual = await second.start();
  assert.ok(actual > occupied);
  assert.equal(second.getPort(), actual);
  assert.equal((await fetch(`http://127.0.0.1:${actual}/api/health`)).status, 200);
  await second.stop();
  const replacement = new McpBridge(actual);
  t.after(() => replacement.stop());
  assert.equal(await replacement.start(0), actual);
});

test('a stale window identity cannot send commands to a reused port', async t => {
  const bridge = new McpBridge(0, { windowId: 'new-window', pid: process.pid, workspaces: ['/new-project'], version: 'test' });
  const port = await bridge.start();
  t.after(() => bridge.stop());
  const response = await request(port, JSON.stringify({ cellId: 0, text: 'must not reach this window' }), { 'X-Terminal-Grid-Window': 'old-window' });
  assert.equal(response.status, 409);
});
