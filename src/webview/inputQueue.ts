import type { Terminal } from "@xterm/xterm";

type PendingInput = { data: string } | { requestId: number; text?: string; timer?: ReturnType<typeof setTimeout> };

/** Reserve the paste's position before asynchronous clipboard access starts. */
export class CellInputQueue {
  private _nextRequest = 0;
  private _pending: PendingInput[] = [];
  private _applyingPaste = false;

  constructor(private readonly _terminal: Terminal, private readonly _send: (data: string) => void,
    private readonly _status: (state: "reading" | "done" | "cancelled" | "timeout") => void = () => {},
    private readonly _timeout = 5000) {}

  input(data: string): void {
    if (this._applyingPaste) { this._send(data); return; }
    if (data === "\x03") { this.reset(); this._send(data); return; }
    this._pending.push({ data });
    this._drain();
  }

  beginPaste(): number {
    const requestId = ++this._nextRequest;
    const timer = setTimeout(() => {
      const item = this._pending.find(item => "requestId" in item && item.requestId === requestId);
      if (item && "requestId" in item && item.text === undefined) {
        // Enter typed after Ctrl+V belongs to that paste. A failed read must not
        // submit whatever happened to be in the application's composer already.
        this.reset(); this._status("timeout");
      }
    }, this._timeout);
    this._pending.push({ requestId, timer });
    this._status("reading");
    return requestId;
  }

  completePaste(requestId: number, text: string): void {
    const entry = this._pending.find(item => "requestId" in item && item.requestId === requestId);
    if (entry && "requestId" in entry) {
      entry.text = text;
      this._drain();
    }
  }

  failPaste(requestId: number): boolean {
    if (!this._pending.some(item => "requestId" in item && item.requestId === requestId)) return false;
    this.reset();
    return true;
  }

  reset(): void {
    for (const item of this._pending) if ("timer" in item) clearTimeout(item.timer);
    if (this._pending.length) this._status("cancelled");
    this._pending.length = 0;
  }

  private _drain(): void {
    while (this._pending.length) {
      const entry = this._pending[0];
      if ("requestId" in entry && entry.text === undefined) return;
      this._pending.shift();
      if ("requestId" in entry) clearTimeout(entry.timer);
      if ("data" in entry) this._send(entry.data);
      else if (entry.text) {
        this._applyingPaste = true;
        try { this._terminal.paste(entry.text); }
        finally { this._applyingPaste = false; this._status("done"); }
      }
    }
  }
}
