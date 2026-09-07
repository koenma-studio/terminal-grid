import * as fs from "fs";
import * as path from "path";

/** The installer touches this signal only after a successful VSIX installation. */
export class ReloadWatcher {
  private readonly _signalPath: string;
  private readonly _sessionPath: string;
  private _lastSignal: string;
  private _reloading = false;
  readonly windowId = `${process.pid}-${Date.now()}`;
  private _port = 0;

  constructor(
    directory: string,
    private readonly _runtime: { version: string; buildHash: string; workspaces: string[] },
    private readonly _reload: () => PromiseLike<unknown>,
  ) {
    this._signalPath = path.join(directory, "reload-signal");
    const sessions = path.join(directory, "sessions");
    fs.mkdirSync(sessions, { recursive: true });
    this._sessionPath = path.join(sessions, `${process.pid}.json`);
    this._lastSignal = this._readSignal();
    this._writeSession();
    // watchFile also handles creation/replacement and avoids duplicate fs.watch events.
    fs.watchFile(this._signalPath, { interval: 250, persistent: false }, this._check);
  }

  setPort(port: number): void {
    this._port = port;
    this._writeSession();
  }

  private _writeSession(): void {
    const temp = `${this._sessionPath}.tmp`;
    try {
      fs.writeFileSync(temp, JSON.stringify({
        ...this._runtime, pid: process.pid, windowId: this.windowId, port: this._port,
        activatedAt: Number(this.windowId.split("-")[1]), signal: this._lastSignal,
      }));
      fs.renameSync(temp, this._sessionPath);
    } finally {
      if (fs.existsSync(temp)) fs.unlinkSync(temp);
    }
  }

  private _readSignal(): string {
    try { return fs.readFileSync(this._signalPath, "utf8").trim(); }
    catch { return ""; }
  }

  private readonly _check = (): void => {
    const signal = this._readSignal();
    if (!signal || signal === this._lastSignal || this._reloading) return;
    this._lastSignal = signal;
    this._reloading = true;
    void Promise.resolve().then(() => this._reload()).catch(error => {
      this._reloading = false;
      console.warn("Terminal Grid: window reload failed:", error);
    });
  };

  dispose(): void {
    fs.unwatchFile(this._signalPath, this._check);
    try { fs.unlinkSync(this._sessionPath); } catch { /* Already removed during shutdown. */ }
  }
}
