export interface CellStatus {
  state: "starting" | "running" | "exited";
  exitCode?: number;
  signal?: number | string;
  error?: string;
}

export interface CellDelivery {
  success: boolean;
  delivery: "delivered" | "failed";
  /** Requested character count; on failure some input may already have reached the process. */
  characters: number;
  /** True only after the complete text and requested Enter have been delivered. */
  submitted: boolean;
  completedAt: string;
  error?: string;
}

export interface CellReadOptions {
  mode?: "screen" | "history";
  lines?: number;
}

export interface CellReadResult {
  output: string;
  mode: "screen" | "history";
  capturedAt: string;
  lastOutputAt: string | null;
  truncated: boolean;
  range: { startLine: number; endLine: number; totalLines: number; droppedCharacters: number };
  state: CellStatus;
  cursor?: { x: number; y: number };
}

interface Command {
  execute: (assertActive: () => void) => Promise<void>;
  finish: (result: CellDelivery) => void;
  characters: number;
  submitted: boolean;
  generation: number;
}

/** A command and its Enter share one job; cancellation invalidates active and queued work. */
export class CellCommandQueue {
  private _generation = 0;
  private _closedReason: string | undefined;
  private _active: Command | undefined;
  private readonly _pending: Command[] = [];

  get pending(): number { return this._pending.length + (this._active ? 1 : 0); }

  enqueue(characters: number, submitted: boolean, execute: Command["execute"]): Promise<CellDelivery> {
    if (this._closedReason) return Promise.resolve(this._receipt(characters, submitted, this._closedReason));
    if (this.pending >= 16) return Promise.resolve(this._receipt(characters, submitted, "Cell input queue is full. Wait for pending deliveries before retrying."));
    return new Promise(resolve => {
      this._pending.push({ execute, characters, submitted, finish: resolve, generation: this._generation });
      this._drain();
    });
  }

  dispose(reason = "Cell process exited or restarted before input was delivered"): void {
    if (this._closedReason) return;
    this._closedReason = reason;
    this._generation++;
    for (const job of [...(this._active ? [this._active] : []), ...this._pending]) {
      job.finish(this._receipt(job.characters, job.submitted, reason));
    }
    this._pending.length = 0;
  }

  private _receipt(characters: number, submitted: boolean, error?: string): CellDelivery {
    return { success: !error, delivery: error ? "failed" : "delivered", characters,
      submitted: !error && submitted, completedAt: new Date().toISOString(), ...(error ? { error } : {}) };
  }

  private _drain(): void {
    if (this._active || this._closedReason) return;
    const job = this._pending.shift();
    if (!job) return;
    this._active = job;
    const assertActive = (): void => {
      if (this._closedReason || job.generation !== this._generation) {
        throw new Error(this._closedReason || "Input was cancelled");
      }
    };
    void Promise.resolve().then(() => {
      assertActive();
      return job.execute(assertActive);
    }).then(() => {
      assertActive();
      job.finish(this._receipt(job.characters, job.submitted));
    }).catch(error => {
      job.finish(this._receipt(job.characters, job.submitted, error instanceof Error ? error.message : "Input delivery failed"));
    }).finally(() => {
      this._active = undefined;
      this._drain();
    });
  }
}

/** Send an entire paste packet in one writer operation so other input cannot split it. */
export function buildCellInput(text: string, options: { submit: boolean; bracketedPaste: boolean; enter: string }): string {
  // Bracketed paste applies only to text. Raw control input (Ctrl+C, arrows, etc.) retains its meaning.
  const plainText = !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text);
  let data = text;
  if (options.bracketedPaste && plainText && text) {
    data = "\x1b[200~" + text.replace(/\r\n|\n/g, "\r") + "\x1b[201~";
  } else if (options.submit && /[\r\n]/.test(text)) {
    // Without negotiated paste, a newline may execute half a command before its remainder.
    throw new Error("This cell has not enabled bracketed paste. Send one line at a time or paste through its terminal UI.");
  }
  return data + (options.submit ? options.enter : "");
}

export function formatCellRead(input: {
  lines: string[];
  mode: "screen" | "history";
  requestedLines?: number;
  droppedCharacters?: number;
  lastOutputAt?: number;
  state: CellStatus;
  cursor?: { x: number; y: number };
}): CellReadResult {
  const totalLines = input.lines.length;
  const count = input.requestedLines === undefined ? totalLines : Math.min(totalLines, Math.max(0, input.requestedLines));
  const start = totalLines - count;
  const droppedCharacters = input.droppedCharacters || 0;
  return {
    output: count === 0 ? "" : input.lines.slice(start).join("\n"),
    mode: input.mode,
    capturedAt: new Date().toISOString(),
    lastOutputAt: input.lastOutputAt ? new Date(input.lastOutputAt).toISOString() : null,
    truncated: start > 0 || droppedCharacters > 0,
    range: { startLine: count ? start + 1 : 0, endLine: count ? totalLines : 0, totalLines, droppedCharacters },
    state: input.state,
    ...(input.cursor ? { cursor: input.cursor } : {}),
  };
}
