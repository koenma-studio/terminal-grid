import * as http from "http";
import { panelRegistry } from "./PanelRegistry";
import { cellIdMapper } from "./CellIdMapper";

class RequestError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export class McpBridge {
  private _server: http.Server | null = null;
  private _port: number;

  constructor(port: number, private readonly _identity?: { windowId: string; workspaces: string[]; pid: number; version: string }) {
    this._port = port;
  }

  start(retries = 10): Promise<number> {
    return new Promise((resolve, reject) => {
      this._server = this._createServer();

      const server = this._server;
      const tryListen = (attempt: number): void => {
        const onError = (err: NodeJS.ErrnoException): void => {
          server.removeListener("listening", onListening);
          if (err.code === "EADDRINUSE" && attempt < retries && this._port < 65535) {
            this._port++;
            tryListen(attempt + 1);
          } else {
            reject(err);
          }
        };
        const onListening = (): void => {
          server.removeListener("error", onError);
          const addr = server.address() as { port: number };
          this._port = addr.port;
          resolve(this._port);
        };
        server.once("error", onError);
        server.once("listening", onListening);
        server.listen(this._port, "127.0.0.1");
      };

      tryListen(0);
    });
  }

  private _createServer(): http.Server {
    return http.createServer((req, res) => {
      res.setHeader("Content-Type", "application/json");
      // A browser must not be able to execute terminal commands via localhost or DNS rebinding.
      const allowedHosts = [`127.0.0.1:${this._port}`, `localhost:${this._port}`];
      if (req.headers.origin !== undefined || !allowedHosts.includes(req.headers.host || "")) {
        res.writeHead(403);
        res.end(JSON.stringify({ error: "Only local non-browser clients are allowed" }));
        return;
      }
      const expectedWindow = req.headers["x-terminal-grid-window"];
      if (expectedWindow && expectedWindow !== this._identity?.windowId) {
        res.writeHead(409);
        res.end(JSON.stringify({ error: "This port now belongs to a different editor window. Refresh list_windows." }));
        return;
      }
      let url: URL;
      try { url = new URL(req.url || "/", `http://127.0.0.1:${this._port}`); }
      catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request URL" }));
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/health") {
        res.writeHead(200);
        res.end(JSON.stringify({ status: "ok", name: "terminal-grid", ...this._identity, port: this._port }));
      } else if (req.method === "GET" && url.pathname === "/api/info") {
        this._handleInfo(res);
      } else if (req.method === "POST" && url.pathname === "/api/send") {
        this._withBody(req, res, body => this._handleSend(body, res));
      } else if (req.method === "POST" && url.pathname === "/api/read") {
        this._withBody(req, res, body => this._handleRead(body, res));
      } else if (req.method === "POST" && url.pathname === "/api/broadcast") {
        this._withBody(req, res, body => this._handleBroadcast(body, res));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
      }
    });
  }

  stop(): Promise<void> {
    const server = this._server;
    this._server = null;
    return new Promise(resolve => {
      if (!server) { resolve(); return; }
      server.close(() => resolve());
      server.closeAllConnections();
    });
  }

  getPort(): number {
    return this._port;
  }

  private _handleInfo(res: http.ServerResponse): void {
    const active = panelRegistry.getActive();
    const tabs = panelRegistry.entries().map(([tabId, p]) => ({
      tabId,
      rows: p.getRows(),
      cols: p.getCols(),
      cellIds: p.getCellIds(),
      labels: p.getCellLabels(),
      hiddenCellIds: p.getHiddenCellIds(),
      cellStatuses: p.getCellStatuses(),
    }));
    res.writeHead(200);
    res.end(
      JSON.stringify({
        window: this._identity ? { ...this._identity, port: this._port } : undefined,
        // Backward-compat top-level fields reflect the active tab
        grid: active ? {
          rows: active.getRows(),
          cols: active.getCols(),
          cellCount: active.getCellCount(),
          cellLabels: active.getCellLabels(),
          cellIds: active.getCellIds(),
          cellStatuses: active.getCellStatuses(),
        } : null,
        tabs,
        activeTabId: panelRegistry.getActiveTabId() ?? null,
      })
    );
  }

  private async _handleSend(
    body: Record<string, unknown>,
    res: http.ServerResponse
  ): Promise<void> {
    this._validateCell(body);
    this._validateText(body);
    const cellId = typeof body.cellId === "number" ? body.cellId : -1;
    const text = typeof body.text === "string" ? body.text : "";
    const submit = body.submit === true;
    const resolved = cellIdMapper.resolve(cellId);
    if (!resolved) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: false, error: "Invalid cell id" }));
      return;
    }
    const panel = panelRegistry.get(resolved.tabId);
    if (!panel) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: false, error: "Tab no longer open" }));
      return;
    }
    const result = await panel.deliverToCell(resolved.localCellId, text, submit);
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(200);
    res.end(JSON.stringify(result));
  }

  private async _handleRead(
    body: Record<string, unknown>,
    res: http.ServerResponse
  ): Promise<void> {
    this._validateCell(body);
    if (body.lines !== undefined && (typeof body.lines !== "number" || !Number.isSafeInteger(body.lines) || body.lines < 0)) {
      throw new RequestError(400, "lines must be a non-negative integer");
    }
    if (body.mode !== undefined && body.mode !== "screen" && body.mode !== "history") {
      throw new RequestError(400, "mode must be screen or history");
    }
    const cellId = typeof body.cellId === "number" ? body.cellId : -1;
    const lines = typeof body.lines === "number" ? body.lines : undefined;
    const resolved = cellIdMapper.resolve(cellId);
    if (!resolved) {
      res.writeHead(200);
      res.end(JSON.stringify({ output: null, error: "Invalid cell id" }));
      return;
    }
    const panel = panelRegistry.get(resolved.tabId);
    if (!panel) {
      res.writeHead(200);
      res.end(JSON.stringify({ output: null, error: "Tab no longer open" }));
      return;
    }
    const result = await panel.readCellSnapshot(resolved.localCellId, { lines, mode: body.mode === "history" ? "history" : "screen" });
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(200);
    res.end(JSON.stringify(result ?? { output: null, error: "Cell screen is unavailable. Wait for the grid to finish restoring, or request mode:history." }));
  }

  /** Broadcast scope: active tab only (per design — explicit tabId=all would be a future extension). */
  private async _handleBroadcast(
    body: Record<string, unknown>,
    res: http.ServerResponse
  ): Promise<void> {
    this._validateText(body);
    const panel = panelRegistry.getActive();
    if (!panel) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: false, error: "No grid open" }));
      return;
    }
    const text = typeof body.text === "string" ? body.text : "";
    const submit = body.submit === true;
    const hidden = new Set(panel.getHiddenCellIds());
    const ids = panel.getCellIds();
    const deliveries = await Promise.all(Array.from({ length: panel.getCellCount() }, async (_, id) => ({
      cellId: ids[id], ...(hidden.has(ids[id]) ? { success: false, error: "Cell is hidden" } : await panel.deliverToCell(id, text, submit)),
    })));
    const count = deliveries.filter(item => item.success).length;
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(200);
    res.end(JSON.stringify({ success: count > 0, cellCount: count, deliveries, ...(count ? {} : { error: "No cells available" }) }));
  }

  private _validateCell(body: Record<string, unknown>): void {
    if (typeof body.cellId !== "number" || !Number.isSafeInteger(body.cellId) || body.cellId < 0) {
      throw new RequestError(400, "cellId must be a non-negative integer");
    }
  }

  private _validateText(body: Record<string, unknown>): void {
    if (typeof body.text !== "string" || (body.submit !== undefined && typeof body.submit !== "boolean")) {
      throw new RequestError(400, "text must be a string and submit must be a boolean");
    }
  }

  private _withBody(req: http.IncomingMessage, res: http.ServerResponse, handle: (body: Record<string, unknown>) => void | Promise<void>): void {
    void this._readBody(req).then(handle).catch(error => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(error instanceof RequestError ? error.status : 500);
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }));
    });
  }

  private _readBody(
    req: http.IncomingMessage
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      if (req.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
        req.resume();
        reject(new RequestError(415, "Content-Type must be application/json"));
        return;
      }
      req.setEncoding("utf8");
      let data = "";
      let bytes = 0;
      req.on("data", (chunk: string) => {
        bytes += Buffer.byteLength(chunk);
        if (bytes > 1024 * 1024) {
          data = "";
          reject(new RequestError(413, "Request body exceeds 1 MB"));
        } else data += chunk;
      });
      req.on("error", reject);
      req.on("aborted", () => reject(new RequestError(400, "Request aborted")));
      req.on("end", () => {
        if (bytes > 1024 * 1024) return;
        try {
          const body: unknown = JSON.parse(data);
          if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
          resolve(body as Record<string, unknown>);
        } catch {
          reject(new RequestError(400, "Expected a JSON object"));
        }
      });
    });
  }
}
