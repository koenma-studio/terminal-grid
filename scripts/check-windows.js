// Read-only checks against real editor windows. Never sends terminal input.
const path = require("path");
const assert = require("assert/strict");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const serverPath = process.env.TERMINAL_GRID_TEST_SERVER || path.resolve(__dirname, "..", "mcp-server.js");

async function open(cwd, env = {}) {
  const client = new Client({ name: "terminal-grid-window-check", version: "1.0.0" });
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath], cwd, env, stderr: "pipe" });
  transport.stderr.on("data", () => {});
  await client.connect(transport, { timeout: 5000 });
  return client;
}

async function call(client, name, args) {
  const response = await client.callTool({ name, arguments: args });
  if (response.isError) throw new Error(response.content[0].text);
  return response.content[0].text;
}

async function main() {
  const initial = await open(path.resolve(__dirname, ".."));
  let windows;
  try { windows = JSON.parse(await call(initial, "list_windows", {})).windows; }
  finally { await initial.close(); }
  if (!windows.length) throw new Error("No running Terminal Grid windows found.");
  for (const window of windows) {
    const cwd = window.workspaces[0];
    if (!cwd) continue;
    // Reproduce a shared config pinned to one port; each project must still select itself.
    const client = await open(cwd, { TERMINAL_GRID_PORT: String(windows[0].port) });
    try {
      const info = JSON.parse(await call(client, "get_grid_info", {}));
      assert.equal(info.window.windowId, window.windowId);
      assert.equal(info.window.port, window.port);
      let reads = 0;
      for (const tab of info.tabs) {
        for (const cellId of tab.cellIds) {
          assert.ok(cellId >= 1 && cellId <= tab.rows * tab.cols);
          const read = await call(client, "read_cell", { windowId: window.windowId, tabId: tab.tabId, cellId, lines: 0 });
          assert.equal(read === "" ? "" : JSON.parse(read).output, "");
          reads++;
        }
      }
      // Address every other project from this client using its unambiguous window ID.
      for (const other of windows) {
        const target = JSON.parse(await call(client, "get_grid_info", { windowId: other.windowId }));
        assert.equal(target.window.port, other.port);
      }
      console.log(JSON.stringify({ project: path.basename(cwd), port: window.port, windowId: window.windowId,
        tabs: info.tabs.map(tab => ({ tabId: tab.tabId, cellIds: tab.cellIds })), reads, crossWindowTargets: windows.length, result: "PASS" }));
    } finally { await client.close(); }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
