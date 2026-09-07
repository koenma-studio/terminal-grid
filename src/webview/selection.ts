import type { Terminal } from "@xterm/xterm";

/** Keep a drag on one stable buffer, then retain its text while output resumes. */
export class CellSelection {
  private _dragging = false;
  private _mouse?: MouseEvent;
  private _frame = 0;
  private _snapshot?: string;
  private _pending: { data: string; parsed?: () => void }[] = [];
  private _writes = 0;
  private _epoch = 0;
  private _syncing = false;
  private _replaying = false;
  private _starting = false;
  private _endRequested = false;
  private _dragSequence = 0;

  constructor(
    private readonly _terminal: Terminal,
    private readonly _pauseOutput: (paused: boolean) => void,
    private readonly _retained: (retained: boolean) => void,
  ) {
    const screen = _terminal.element!.querySelector<HTMLElement>(".xterm-screen")!;
    screen.addEventListener("mousedown", event => {
      if (this._replaying) return;
      if (event.button !== 0) return;
      if (_terminal.modes.mouseTrackingMode !== "none" && !event.shiftKey) return;
      this._snapshot = undefined;
      this._retained(false);
      this._mouse = event;
      this._dragging = true;
      this._endRequested = false;
      const sequence = ++this._dragSequence;
      this._pauseOutput(true);
      if (this._writes) {
        // Finish writes already inside xterm before anchoring the selection. All
        // subsequent output is held. Replay even a fast down/move/up in order.
        event.preventDefault(); event.stopImmediatePropagation();
        this._starting = true;
        this._terminal.write("", () => {
          if (sequence !== this._dragSequence || !this._dragging) return;
          this._starting = false;
          this._replaying = true;
          try {
            screen.dispatchEvent(new MouseEvent("mousedown", {
              bubbles: true, cancelable: true, button: 0, buttons: 1, detail: event.detail,
              clientX: event.clientX, clientY: event.clientY,
              shiftKey: event.shiftKey || this._terminal.modes.mouseTrackingMode !== "none",
              altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey,
            }));
          } finally { this._replaying = false; }
          this._syncEndpoint();
          if (this._endRequested) this.finishDrag();
        });
      }
    }, true);
    document.addEventListener("mousemove", event => {
      if (!this._dragging || this._syncing) return;
      // A release outside the webview may not deliver mouseup to this document.
      if (!(event.buttons & 1)) { this.finishDrag(); return; }
      this._mouse = event;
    }, true);
    document.addEventListener("mouseup", event => {
      if (!this._dragging || event.button !== 0) return;
      this._mouse = event;
      this._syncEndpoint();
      // Let xterm complete word/line/column selection before taking the snapshot.
      queueMicrotask(() => this.finishDrag());
    }, true);
    window.addEventListener("blur", () => this.finishDrag());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.finishDrag();
    });
    _terminal.onScroll(() => {
      if (!this._dragging || this._frame) return;
      this._frame = requestAnimationFrame(() => {
        this._frame = 0;
        this._syncEndpoint();
      });
    });
    _terminal.onSelectionChange(() => {
      // Trimming/redrawing the live buffer must not replace the saved selection.
      if (this._dragging || this._writes) return;
      this._snapshot = _terminal.hasSelection() ? _terminal.getSelection() : undefined;
      this._retained(false);
    });
  }

  get dragging(): boolean { return this._dragging; }
  hasSelection(): boolean { return !!this._snapshot || this._terminal.hasSelection(); }
  getSelection(): string {
    this._syncEndpoint();
    return this._snapshot ?? this._terminal.getSelection();
  }

  /** Called before xterm writes, so even programmatic selections keep their original text. */
  write(data: string, parsed?: () => void): void {
    if (this._dragging) { this._pending.push({ data, parsed }); return; }
    if (this._snapshot === undefined && this._terminal.hasSelection()) {
      this._snapshot = this._terminal.getSelection();
    }
    if (this._snapshot) this._retained(true);
    const epoch = this._epoch;
    this._writes++;
    this._terminal.write(data, () => {
      if (epoch === this._epoch) this._writes--;
      parsed?.();
    });
  }

  finishDrag(): void {
    if (!this._dragging) return;
    if (this._starting) { this._endRequested = true; return; }
    this._syncEndpoint();
    this._snapshot = this._terminal.hasSelection() ? this._terminal.getSelection() : undefined;
    this._dragging = false;
    // Also stop xterm's document listeners/edge-scroll timer after a lost mouseup.
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    this._mouse = undefined;
    cancelAnimationFrame(this._frame);
    this._frame = 0;
    this._pauseOutput(false);
    if (this._pending.length) {
      const pending = this._pending;
      this._pending = [];
      this.write(pending.map(item => item.data).join(""), () => { for (const item of pending) item.parsed?.(); });
    }
  }

  cancel(): void {
    if (this._starting) {
      this._starting = false;
      this._dragSequence++;
    }
    this.finishDrag();
    this._snapshot = undefined;
    this._retained(false);
    this._terminal.clearSelection();
  }

  reset(): void {
    // Old output must not reappear in a restarted terminal.
    this._pending = [];
    this.cancel();
    this._epoch++;
    this._writes = 0;
  }

  private _syncEndpoint(): void {
    const mouse = this._mouse;
    if (!this._dragging || this._starting || !mouse || this._syncing) return;
    const rect = this._terminal.element!.querySelector(".xterm-screen")!.getBoundingClientRect();
    // xterm owns edge auto-scroll. Only wheel scrolling inside the screen needs repair.
    if (mouse.clientY < rect.top || mouse.clientY >= rect.bottom) return;
    this._syncing = true;
    try {
      // Use xterm's native mouse selection logic (wide glyphs, reverse, word and column
      // selection) instead of reconstructing buffer coordinates via private APIs.
      document.dispatchEvent(new MouseEvent("mousemove", {
        bubbles: true, clientX: mouse.clientX, clientY: mouse.clientY, buttons: 1,
        shiftKey: mouse.shiftKey, altKey: mouse.altKey, ctrlKey: mouse.ctrlKey, metaKey: mouse.metaKey,
      }));
    } finally { this._syncing = false; }
  }
}
