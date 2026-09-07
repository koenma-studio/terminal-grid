import * as http from "http";
import { GridWindow, readWindowRecords, selectWindow } from "./McpWindows";

export function httpRequest(port: number, method: string, reqPath: string, body?: Record<string, unknown>, windowId?: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port, path: reqPath, method,
      timeout: method === "POST" && reqPath !== "/api/read" ? 60000 : 5000,
      headers: { "Content-Type": "application/json", ...(windowId ? { "X-Terminal-Grid-Window": windowId } : {}) },
    }, res => {
      res.setEncoding("utf8");
      let data = "";
      res.on("data", (chunk: string) => { data += chunk; });
      res.on("error", reject);
      res.on("aborted", () => reject(new Error("Terminal Grid closed the HTTP response early")));
      res.on("end", () => {
        try {
          const result = JSON.parse(data) as Record<string, unknown>;
          if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error();
          if ((res.statusCode ?? 500) >= 400 || result.error || result.success === false) {
            reject(new Error(String(result.error || `Terminal Grid request failed (HTTP ${res.statusCode})`)));
          } else resolve(result);
        } catch { reject(new Error("Invalid JSON response from Terminal Grid")); }
      });
    });
    req.on("error", error => reject(new Error(`Cannot connect to Terminal Grid on port ${port}: ${error.message}`)));
    req.on("timeout", () => req.destroy(new Error("Terminal Grid request timed out")));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

export async function discoverWindows(): Promise<GridWindow[]> {
  const checked = await Promise.all(readWindowRecords(process.env.TERMINAL_GRID_REGISTRY_DIR).map(async record => {
    try {
      const health = await httpRequest(record.port, "GET", "/api/health");
      if (health.name !== "terminal-grid") return null;
      if (!record.legacy && health.windowId !== record.windowId) return null;
      return record;
    } catch { return null; }
  }));
  return checked.filter((record): record is GridWindow => record !== null);
}

export class McpConnection {
  constructor(private readonly _explicitPort?: number) {}

  async target(options: { windowId?: string; workspace?: string }): Promise<GridWindow> {
    const explicit = this._explicitPort;
    if (explicit && !options.windowId && !options.workspace) {
      const health = await httpRequest(explicit, "GET", "/api/health");
      if (health.name !== "terminal-grid") throw new Error("The selected port is not a Terminal Grid bridge.");
      return { windowId: String(health.windowId || `port-${explicit}`), port: explicit,
        pid: Number(health.pid || 0), workspaces: health.workspaces as string[] || [], version: String(health.version || "unknown"), legacy: !health.windowId };
    }
    const windows = await discoverWindows();
    // A shared client's old TERMINAL_GRID_PORT must not override its originating Grid window/CWD.
    // Explicit --port remains available for integrations that intentionally pin an endpoint.
    return selectWindow(windows, { ...options, inheritedWindowId: process.env.TERMINAL_GRID_WINDOW_ID, cwd: process.cwd() });
  }

  async request(window: GridWindow, method: string, route: string, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (window.legacy && window.pid > 0 && method === "POST" && route !== "/api/read") {
      // Compatibility with 0.4.1: recheck OS ownership immediately before a write.
      const current = await discoverWindows();
      if (!current.some(item => item.windowId === window.windowId && item.port === window.port && item.pid === window.pid)) {
        throw new Error("The selected editor window changed. Refresh list_windows before sending input.");
      }
    }
    return httpRequest(window.port, method, route, body, window.legacy ? undefined : window.windowId);
  }
}
