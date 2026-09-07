const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { selectWindow } = require('../out/McpWindows');

test('window selection uses origin, exact project containment, and explicit targets', () => {
  const root = path.resolve('out/window-selection');
  const windows = ['terminal-grid', 'oak', '1592', 'oak-tree'].map((name, i) => ({
    windowId: name, port: 7890 + i, pid: process.pid, version: 'test', workspaces: [path.join(root, name)],
  }));
  assert.equal(selectWindow(windows, { cwd: path.join(root, 'oak/src') }).windowId, 'oak');
  assert.equal(selectWindow(windows, { cwd: path.join(root, 'oak-tree') }).windowId, 'oak-tree');
  assert.equal(selectWindow(windows, { cwd: path.join(root, 'oak'), inheritedWindowId: 'terminal-grid' }).windowId, 'terminal-grid');
  assert.equal(selectWindow(windows, { cwd: root, inheritedWindowId: 'terminal-grid', workspace: '1592' }).windowId, '1592');
  assert.throws(() => selectWindow(windows, { cwd: root }), /No matching/);
  assert.throws(() => selectWindow(windows, { cwd: root, inheritedWindowId: 'closed-window' }), /No matching/);
  assert.throws(() => selectWindow([...windows, { ...windows[1], windowId: 'second-oak' }], { cwd: path.join(root, 'oak') }), /Multiple/);
});

test('real MCP routes UI cell/tab numbers across three independent window endpoints', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tg-windows-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const registry = path.join(root, 'sessions');
  fs.mkdirSync(registry);
  const writes = [];
  const ports = {};
  for (const [index, name] of ['terminal-grid', 'oak', '1592'].entries()) {
    const workspace = path.join(root, name);
    fs.mkdirSync(workspace);
    const server = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const window = { windowId: name, pid: process.pid, version: 'test', workspaces: [workspace] };
      if (req.url === '/api/health') { res.end(JSON.stringify({ status: 'ok', name: 'terminal-grid', ...window })); return; }
      assert.equal(req.headers['x-terminal-grid-window'], name);
      if (req.url === '/api/info') {
        res.end(JSON.stringify({ window, tabs: [
          { tabId: 26, rows: 1, cols: 2, cellIds: [157, 158], labels: ['1', '2'] },
          { tabId: 42, rows: 1, cols: 2, cellIds: [999, 1000], labels: ['A', 'B'] },
        ], activeTabId: 26 }));
        return;
      }
      let raw = '';
      req.on('data', chunk => raw += chunk);
      req.on('end', () => {
        const body = JSON.parse(raw);
        if (req.url === '/api/send') { writes.push({ name, ...body }); res.end(JSON.stringify({ success: true })); }
        else res.end(JSON.stringify({ output: name + ':' + body.cellId, mode: 'screen' }));
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
    ports[name] = server.address().port;
    fs.writeFileSync(path.join(registry, `${index + 1}.json`), JSON.stringify({ windowId: name, pid: process.pid, port: ports[name], version: 'test', workspaces: [workspace] }));
  }

  for (const name of ['terminal-grid', 'oak', '1592']) {
    const client = new Client({ name: 'multi-window-test', version: '1' });
    const transport = new StdioClientTransport({ command: process.execPath, args: [process.env.TERMINAL_GRID_TEST_SERVER || path.resolve('mcp-server.js')], cwd: path.join(root, name),
      env: { TERMINAL_GRID_REGISTRY_DIR: registry, TERMINAL_GRID_PORT: String(ports['terminal-grid']) }, stderr: 'pipe' });
    transport.stderr.on('data', () => {});
    t.after(() => client.close());
    await client.connect(transport);
    const inventory = JSON.parse((await client.callTool({ name: 'list_windows', arguments: {} })).content[0].text);
    assert.equal(inventory.windows.length, 3);
    const info = JSON.parse((await client.callTool({ name: 'get_grid_info', arguments: {} })).content[0].text);
    assert.equal(info.window.windowId, name, 'the shared legacy port must not override the current project');
    assert.deepEqual(info.grid.cellIds, [1, 2]);
    assert.equal(info.activeTabId, 1);
    assert.deepEqual(info.tabs.map(tab => tab.tabId), [1, 2]);
    const read = await client.callTool({ name: 'read_cell', arguments: { workspace: 'oak', cellId: 2, tabId: 2 } });
    assert.equal(JSON.parse(read.content[0].text).output, 'oak:1000');
    const sent = await client.callTool({ name: 'send_to_cell', arguments: { windowId: '1592', tabId: 2, cellId: 1, text: 'routing check', submit: false } });
    assert.equal(sent.isError, undefined);
    assert.deepEqual(writes.pop(), { name: '1592', cellId: 999, text: 'routing check', submit: false });
    for (const args of [{ cellId: 0 }, { cellId: 158 }, { cellId: 1, tabId: 0 }, { cellId: 1, windowId: 'missing' }]) {
      const bad = await client.callTool({ name: 'send_to_cell', arguments: { ...args, text: 'must not send' } });
      assert.equal(bad.isError, true);
    }
    assert.deepEqual(writes, []);
    await client.close();
  }
});
