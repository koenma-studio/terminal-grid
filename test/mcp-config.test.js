const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parse } = require('smol-toml');
const { repairCodexConfig, copyMcpScript, healCodexConfig } = require('../out/McpConfig');

const stale = 'C:/Users/test/.vscode/extensions/koenma.terminal-grid-0.3.7/mcp-server.js';
const stable = 'C:/Users/test/AppData/Roaming/Code/User/globalStorage/koenma.terminal-grid/mcp-server.js';

for (const header of ['terminal-grid', '"terminal-grid"', "'terminal-grid'"]) {
  test(`repair Codex ${header} preserves comments, args, env and other servers`, () => {
    const raw = `# user config\r\n[mcp_servers.${header}]\r\ncommand = "node"\r\nargs = [\r\n  "--no-warnings", # node flag\r\n  '${stale}',\r\n]\r\nstartup_timeout_sec = 30\r\n[mcp_servers.${header}.env]\r\nTERMINAL_GRID_PORT = "7891"\r\n[mcp_servers.other]\r\nargs = ["keep.js"]\r\n`;
    const result = repairCodexConfig(raw, stable);
    assert.equal(result, raw.replace(`'${stale}'`, JSON.stringify(stable)));
    assert.deepEqual(parse(result).mcp_servers['terminal-grid'].args, ['--no-warnings', stable]);
  });
}

test('repair does not change comments/other fields containing the same old path', () => {
  const raw = `# "${stale}"\nnotes = '${stale}'\n[mcp_servers.terminal-grid]\nargs = ["${stale}"]\n`;
  assert.equal(repairCodexConfig(raw, stable), raw.replace(`args = ["${stale}"]`, `args = ["${stable}"]`));
});

test('working custom path, invalid config and absent registration are left intact', () => {
  for (const raw of [`[mcp_servers.terminal-grid]\nargs = [${JSON.stringify(__filename)}]`, '[mcp_servers.terminal-grid]\nargs = [', '[mcp_servers.other]\nargs = ["missing.js"]']) {
    assert.equal(repairCodexConfig(raw, stable), raw);
  }
});

test('stable launcher updates by content, is idempotent, and config healing is repeatable', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tg-mcp-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'bundled.js');
  const dest = path.join(dir, 'storage', 'mcp-server.js');
  fs.writeFileSync(source, 'first build');
  copyMcpScript(source, dest);
  fs.writeFileSync(source, 'second build with same version');
  copyMcpScript(source, dest);
  assert.equal(fs.readFileSync(dest, 'utf8'), 'second build with same version');
  const modified = fs.statSync(dest).mtimeMs;
  copyMcpScript(source, dest);
  assert.equal(fs.statSync(dest).mtimeMs, modified);
  const config = path.join(dir, 'config.toml');
  fs.writeFileSync(config, `[mcp_servers.terminal-grid]\nargs = ["${stale}"]\n`);
  healCodexConfig(config, dest);
  const repaired = fs.readFileSync(config, 'utf8');
  assert.deepEqual(parse(repaired).mcp_servers['terminal-grid'].args, [dest]);
  healCodexConfig(config, dest);
  assert.equal(fs.readFileSync(config, 'utf8'), repaired);
});
