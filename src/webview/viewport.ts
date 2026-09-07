import type { Terminal, IMarker } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";

type Anchor = { bottom: boolean; line: number; offset: number; marker?: IMarker; buffer: string };

/** Keep layout transitions separate from a user's choice of scroll position. */
export class CellViewport {
  private _suspended?: Anchor;
  private _revision = 0;
  private _lastSize = "";

  constructor(private readonly _terminal: Terminal, private readonly _fit: FitAddon,
    private readonly _resize: (cols: number, rows: number) => void) {
    for (const event of ["wheel", "pointerdown", "keydown"]) {
      _terminal.element?.addEventListener(event, () => this.discard(), { capture: true });
    }
  }

  private _anchor(): Anchor {
    const b = this._terminal.buffer.active;
    let line = b.viewportY;
    while (line > 0 && b.getLine(line)?.isWrapped) line--;
    return { bottom: b.viewportY >= b.baseY, line, offset: (b.viewportY - line) * this._terminal.cols, buffer: b.type,
      marker: b.type === "normal" ? this._terminal.registerMarker(line - b.baseY - b.cursorY) : undefined };
  }

  private _restore(anchor: Anchor): void {
    if (anchor.buffer !== this._terminal.buffer.active.type) return;
    if (anchor.bottom) this._terminal.scrollToBottom();
    else if (!anchor.marker?.isDisposed) this._terminal.scrollToLine((anchor.marker?.line ?? anchor.line) + Math.floor(anchor.offset / this._terminal.cols));
  }

  fit(force = false): void {
    const element = this._terminal.element?.parentElement;
    // FitAddon otherwise clamps a hidden/collapsed view to 2 columns by 1 row,
    // reflows its entire history, and sends that destructive size to the TUI.
    if (document.hidden || !element || !element.getClientRects().length
      || element.clientWidth < 40 || element.clientHeight < 24) return;
    const dims = this._fit.proposeDimensions();
    if (!dims || !Number.isFinite(dims.cols) || !Number.isFinite(dims.rows)) return;
    if (dims.cols !== this._terminal.cols || dims.rows !== this._terminal.rows) {
      const anchor = this._anchor();
      const revision = ++this._revision;
      this._fit.fit();
      this._restore(anchor);
      requestAnimationFrame(() => {
        if (revision === this._revision) this._restore(anchor);
        anchor.marker?.dispose();
      });
    }
    const size = `${this._terminal.cols}x${this._terminal.rows}`;
    if (force || size !== this._lastSize) {
      this._lastSize = size;
      this._resize(this._terminal.cols, this._terminal.rows);
    }
  }

  suspend(): void { this._suspended ??= this._anchor(); }

  resume(): void {
    this.fit();
    const revision = this._revision;
    this._terminal.write("", () => {
      // Let xterm finish its queued viewport synchronization before restoring.
      requestAnimationFrame(() => {
        if (revision !== this._revision) return;
        if (this._suspended) this._restore(this._suspended);
        this.discard();
      });
    });
  }

  discard(): void {
    this._revision++;
    this._suspended?.marker?.dispose();
    this._suspended = undefined;
  }
}
