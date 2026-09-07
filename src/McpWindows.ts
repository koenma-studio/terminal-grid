import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";

export interface GridWindow {
  windowId: string;
  pid: number;
  port: number;
  version: string;
  workspaces: string[];
  legacy?: boolean;
}

export function normalizedPath(value: string): string {
  const result = path.resolve(value).replace(/\\/g, "/").replace(/\/$/, "");
  return process.platform === "win32" ? result.toLowerCase() : result;
}

/** Older installations recorded the host PID but not its port. Windows can identify it exactly. */
function legacyPorts(): Map<number, number[]> {
  if (process.platform !== "win32") return new Map();
  try {
    const raw = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
      "@(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalAddress -EQ '127.0.0.1' | Select-Object OwningProcess,LocalPort) | ConvertTo-Json -Compress"],
    { encoding: "utf8", windowsHide: true, timeout: 5000 });
    const rows = JSON.parse(raw || "[]");
    const result = new Map<number, number[]>();
    for (const row of Array.isArray(rows) ? rows : [rows]) {
      result.set(row.OwningProcess, [...(result.get(row.OwningProcess) || []), row.LocalPort]);
    }
    return result;
  } catch { return new Map(); }
}

export function readWindowRecords(directory = path.join(os.homedir(), ".terminal-grid", "sessions")): GridWindow[] {
  let files: string[];
  try { files = fs.readdirSync(directory); } catch { return []; }
  const records: Array<Partial<GridWindow> & { activatedAt?: number }> = [];
  for (const file of files) {
    if (!/^\d+\.json$/.test(file)) continue;
    try {
      const record = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
      if (!Number.isSafeInteger(record.pid) || record.pid <= 0 || !Array.isArray(record.workspaces) || !record.workspaces.every((p: unknown) => typeof p === "string")) continue;
      process.kill(record.pid, 0);
      records.push(record);
    } catch { /* Removed session or exited host. */ }
  }
  const ports = records.some(record => record.port === undefined) ? legacyPorts() : new Map<number, number[]>();
  return records.flatMap(record => {
    const candidates = record.port === undefined ? ports.get(record.pid!) || [] : [record.port];
    return candidates.filter(port => Number.isInteger(port) && port > 0 && port <= 65535).map(port => ({
      windowId: record.windowId || `${record.pid}-${record.activatedAt}`,
      pid: record.pid!, port, version: record.version || "unknown", workspaces: record.workspaces!,
      ...(!record.windowId ? { legacy: true } : {}),
    }));
  });
}

export function selectWindow(windows: GridWindow[], options: {
  windowId?: string; workspace?: string; inheritedWindowId?: string; cwd: string; port?: number;
}): GridWindow {
  let matches: GridWindow[];
  if (options.windowId) matches = windows.filter(w => w.windowId === options.windowId);
  else if (options.workspace) {
    matches = windows.filter(w => w.workspaces.some(folder =>
      normalizedPath(folder) === normalizedPath(options.workspace!) || path.basename(folder).toLowerCase() === options.workspace!.toLowerCase()));
  } else if (options.inheritedWindowId) matches = windows.filter(w => w.windowId === options.inheritedWindowId);
  else if (options.port !== undefined) matches = windows.filter(w => w.port === options.port);
  else {
    const cwd = normalizedPath(options.cwd);
    const ranked = windows.map(window => ({ window, rank: Math.max(-1, ...window.workspaces.map(folder => {
      const root = normalizedPath(folder);
      return cwd === root || cwd.startsWith(root + "/") ? root.length : -1;
    })) }));
    const best = Math.max(-1, ...ranked.map(item => item.rank));
    matches = best >= 0 ? ranked.filter(item => item.rank === best).map(item => item.window) : windows.length === 1 ? windows : [];
  }
  if (matches.length !== 1) {
    throw new Error(matches.length > 1
      ? "Multiple Terminal Grid windows match. Call list_windows and specify windowId."
      : "No matching Terminal Grid window. Call list_windows and specify windowId or workspace. Do not guess a port.");
  }
  return matches[0];
}
