import * as fs from "fs";
import * as path from "path";
import { isDeepStrictEqual } from "util";
import { parse } from "smol-toml";

/** Refresh by content, including local rebuilds that keep the same extension version. */
export function copyMcpScript(source: string, destination: string): void {
  const content = fs.readFileSync(source);
  if (fs.existsSync(destination) && content.equals(fs.readFileSync(destination))) return;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temp = `${destination}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temp, content);
    fs.renameSync(temp, destination);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

/** Preserve comments, other servers, env and custom arguments when repairing Codex's path. */
export function repairCodexConfig(raw: string, stablePath: string): string {
  try {
    const expected = parse(raw);
    const servers = expected.mcp_servers as Record<string, { args?: unknown }> | undefined;
    const entry = servers?.["terminal-grid"];
    if (!Array.isArray(entry?.args)) return raw;
    const replacements = new Map<string, string>();
    entry.args = entry.args.map((arg: unknown) => {
      if (typeof arg !== "string" || !/[\\/]mcp-server\.js$/i.test(arg)) return arg;
      if (!/[\\/]extensions[\\/]koenma\.terminal-grid-\d/i.test(arg) && fs.existsSync(arg)) return arg;
      replacements.set(arg, stablePath);
      return stablePath;
    });
    if (!replacements.size) return raw;

    // Try one string token at a time, accepting ONLY the exact parsed change above.
    // This also supports quoted table names, literal Windows paths and multiline arrays,
    // without reserializing the user's entire TOML or guessing table boundaries.
    const tokens = /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\r\n]|\\.)*"|'[^'\r\n]*'|#[^\r\n]*/g;
    for (const match of raw.matchAll(tokens)) {
      if (match[0].startsWith("#")) continue;
      let value: unknown;
      try { value = parse(`value = ${match[0]}`).value; } catch { continue; }
      if (typeof value !== "string" || !replacements.has(value)) continue;
      const updated = raw.slice(0, match.index) + JSON.stringify(stablePath) + raw.slice(match.index! + match[0].length);
      if (isDeepStrictEqual(parse(updated), expected)) return updated;
    }
  } catch { /* Invalid or unusual config: leave it intact. */ }
  return raw;
}

export function healCodexConfig(configPath: string, stablePath: string): void {
  if (!fs.existsSync(configPath) || !fs.existsSync(stablePath)) return;
  const before = fs.readFileSync(configPath, "utf8");
  const after = repairCodexConfig(before, stablePath);
  if (before === after) return;
  const temp = `${configPath}.tg-tmp.${process.pid}.${Date.now()}`;
  try {
    fs.writeFileSync(temp, after);
    if (fs.readFileSync(configPath, "utf8") === before) fs.renameSync(temp, configPath);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
