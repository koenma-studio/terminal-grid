interface OutputCallbacks {
  post(data: string, sequence: number): void;
  pause(): void;
  resume(): void;
}

/** Bound unparsed webview output, without dropping output that arrives just after PTY pause. */
export class PtyOutputFlow {
  private readonly _pending: string[] = [];
  private _offset = 0;
  private _pendingCharacters = 0;
  private readonly _inFlight = new Map<number, number>();
  private _inFlightCharacters = 0;
  private _sequence = 0;
  private _selectionPaused = false;
  private _flowPaused = false;
  private _paused = false;
  private _draining = false;
  private _disposed = false;

  constructor(
    private readonly _callbacks: OutputCallbacks,
    private readonly _highWater = 256 * 1024,
    private readonly _lowWater = 128 * 1024,
    private readonly _chunkSize = 32 * 1024,
  ) {
    if (_highWater < 2 || _lowWater < 0 || _lowWater >= _highWater || _chunkSize < 2 || _chunkSize > _highWater) {
      throw new Error("Invalid PTY output flow watermarks");
    }
  }

  get inFlightCharacters(): number { return this._inFlightCharacters; }
  get pendingCharacters(): number { return this._pendingCharacters; }
  get paused(): boolean { return this._paused; }

  enqueue(data: string): void {
    if (this._disposed || !data) return;
    this._pending.push(data);
    this._pendingCharacters += data.length;
    this._drain();
  }

  acknowledge(sequence: number): void {
    if (this._disposed) return;
    const length = this._inFlight.get(sequence);
    if (length === undefined) return;
    this._inFlight.delete(sequence);
    this._inFlightCharacters -= length;
    this._drain();
  }

  selectionPaused(paused: boolean): void {
    if (this._disposed || this._selectionPaused === paused) return;
    this._selectionPaused = paused;
    this._drain();
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    this._pending.length = 0;
    this._inFlight.clear();
    this._pendingCharacters = this._inFlightCharacters = this._offset = 0;
    // A disposed flow must not leave an otherwise live process permanently paused.
    if (this._paused) { this._paused = false; this._callbacks.resume(); }
  }

  private _drain(): void {
    if (this._disposed || this._draining) return;
    this._draining = true;
    try {
      while (!this._selectionPaused && this._pending.length) {
        const room = this._highWater - this._inFlightCharacters;
        if (room < 2) break;
        const data = this._pending[0];
        let end = Math.min(data.length, this._offset + this._chunkSize, this._offset + room);
        if (end < data.length && /[\uD800-\uDBFF]/.test(data[end - 1])) end--;
        const chunk = data.slice(this._offset, end);
        this._offset = end;
        this._pendingCharacters -= chunk.length;
        if (end === data.length) { this._pending.shift(); this._offset = 0; }
        const sequence = ++this._sequence;
        this._inFlight.set(sequence, chunk.length);
        this._inFlightCharacters += chunk.length;
        this._callbacks.post(chunk, sequence);
      }
      if (this._pendingCharacters || this._inFlightCharacters >= this._highWater - 1) this._flowPaused = true;
      else if (this._inFlightCharacters <= this._lowWater) this._flowPaused = false;
      const paused = this._selectionPaused || this._flowPaused;
      if (paused !== this._paused) {
        this._paused = paused;
        if (paused) this._callbacks.pause();
        else this._callbacks.resume();
      }
    } finally { this._draining = false; }
  }
}
