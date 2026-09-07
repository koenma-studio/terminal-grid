interface PendingWrite {
  data: string;
  offset: number;
  resolve(): void;
  reject(error: Error): void;
  progress?: (written: number, total: number) => void;
}

/** Serialize complete writes, bound memory, and allow a large paste to be interrupted. */
export class PtyWriteQueue {
  private readonly _pending: PendingWrite[] = [];
  private _timer: ReturnType<typeof setTimeout> | undefined;
  private _disposed = false;
  private _queued = 0;

  constructor(
    private readonly _write: (data: string) => void,
    private readonly _onError: (error: unknown) => void,
    private readonly _chunkSize = 4096,
    private readonly _delay = 10,
  ) {}

  get disposed(): boolean { return this._disposed; }

  write(data: string): void { void this.writeAsync(data).catch(() => {}); }

  writeAsync(data: string, progress?: PendingWrite["progress"]): Promise<void> {
    if (this._disposed) return Promise.reject(new Error("Terminal process has exited"));
    if (!data) return Promise.resolve();
    if (this._queued + data.length > 8 * 1024 * 1024) return Promise.reject(new Error("Terminal input queue is full"));
    return new Promise((resolve, reject) => {
      this._pending.push({ data, offset: 0, resolve, reject, progress });
      this._queued += data.length;
      if (!this._timer) this._drain();
    });
  }

  cancel(reason = "Input cancelled", interrupt = false): void {
    clearTimeout(this._timer);
    this._timer = undefined;
    const current = this._pending[0];
    const closePaste = current && current.offset > 0 && current.data.startsWith("\x1b[200~")
      && current.offset < current.data.lastIndexOf("\x1b[201~") + 6;
    for (const job of this._pending) job.reject(new Error(reason));
    this._pending.length = 0;
    this._queued = 0;
    if (!this._disposed && (closePaste || interrupt)) {
      try { this._write((closePaste ? "\x1b[201~" : "") + (interrupt ? "\x03" : "")); }
      catch (error) { this._disposed = true; this._onError(error); }
    }
  }

  dispose(): void {
    this._disposed = true;
    this.cancel("Terminal process exited or restarted");
  }

  private _drain(): void {
    this._timer = undefined;
    if (this._disposed || !this._pending.length) return;
    const job = this._pending[0];
    let end = Math.min(job.offset + this._chunkSize, job.data.length);
    // A split UTF-16 surrogate pair becomes two replacement characters in node-pty.
    if (end < job.data.length && /[\uD800-\uDBFF]/.test(job.data[end - 1])) end--;
    if (end === job.offset) end = Math.min(end + 2, job.data.length);
    try {
      this._write(job.data.slice(job.offset, end));
    } catch (error) {
      this.dispose();
      this._onError(error);
      return;
    }
    this._queued -= end - job.offset;
    job.offset = end;
    job.progress?.(end, job.data.length);
    if (end === job.data.length) {
      this._pending.shift();
      job.resolve();
    }
    if (this._pending.length) this._timer = setTimeout(() => this._drain(), this._delay);
  }
}
