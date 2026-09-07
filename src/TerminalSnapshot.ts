/** A rendered screen, with just enough cell metadata to distinguish hints from input. */
export interface SnapshotStyle {
  start: number;
  end: number;
  dim: boolean;
  italic: boolean;
  fgMode: number;
  fg: number;
  bgMode?: number;
  bg?: number;
}

export interface SnapshotLine {
  wrapped: boolean;
  styles: SnapshotStyle[];
  /** UTF-16 offsets by terminal column; omitted for ordinary one-column characters. */
  columns?: number[];
}

export interface TerminalSnapshot {
  lines: string[];
  cursorX: number;
  cursorY: number;
  cols?: number;
  lineInfo?: SnapshotLine[];
}

interface SnapshotCellSource {
  getChars(): string;
  getWidth(): number;
  isDim(): number;
  isItalic(): number;
  getFgColorMode(): number;
  getFgColor(): number;
  getBgColorMode?(): number;
  getBgColor?(): number;
}

interface SnapshotTerminalSource {
  rows: number;
  cols: number;
  buffer: { active: {
    baseY: number;
    cursorX: number;
    cursorY: number;
    getLine(index: number): { isWrapped: boolean; translateToString(trimRight?: boolean): string; getCell(column: number): SnapshotCellSource | undefined } | undefined;
  } };
}

/** Call after xterm's write callback so the cursor and cells describe the same parsed frame. */
export function captureTerminalSnapshot(terminal: SnapshotTerminalSource): TerminalSnapshot {
  const buffer = terminal.buffer.active;
  const lines: string[] = [];
  const lineInfo: SnapshotLine[] = [];
  for (let row = 0; row < terminal.rows; row++) {
    const source = buffer.getLine(buffer.baseY + row);
    const text = source?.translateToString(true) || "";
    lines.push(text);
    const styles: SnapshotStyle[] = [];
    const columns: number[] = [];
    let offset = 0;
    let previousOffset = 0;
    let ordinaryColumns = true;
    for (let column = 0; source && column < terminal.cols; column++) {
      const cell = source.getCell(column);
      if (!cell) break;
      const width = cell.getWidth();
      columns.push(Math.min(text.length, width === 0 ? previousOffset : offset));
      if (width !== 0) {
        previousOffset = offset;
        const chars = cell.getChars() || " ";
        if (width !== 1 || chars.length !== 1) ordinaryColumns = false;
        offset += chars.length;
      }
      // Blank cells beyond the visible text do not help classify the composer.
      const bgMode = cell.getBgColorMode?.() || 0;
      const bg = cell.getBgColor?.() || 0;
      if (previousOffset >= text.length && !bgMode) continue;
      const style: SnapshotStyle = { start: column, end: column + 1, dim: !!cell.isDim(), italic: !!cell.isItalic(), fgMode: cell.getFgColorMode(), fg: cell.getFgColor(), bgMode, bg };
      const previous = styles[styles.length - 1];
      if (previous && previous.end === column && previous.dim === style.dim && previous.italic === style.italic && previous.fgMode === style.fgMode && previous.fg === style.fg && previous.bgMode === style.bgMode && previous.bg === style.bg) previous.end++;
      else styles.push(style);
    }
    columns.push(text.length);
    lineInfo.push({ wrapped: source?.isWrapped || false, styles, ...(!ordinaryColumns ? { columns } : {}) });
  }
  return { lines, cursorX: buffer.cursorX, cursorY: buffer.cursorY, cols: terminal.cols, lineInfo };
}

/** Reject malformed or oversized webview messages before inspecting cell attributes. */
export function validateTerminalSnapshot(value: unknown): value is TerminalSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as TerminalSnapshot;
  if (!Array.isArray(snapshot.lines) || snapshot.lines.length > 500
    || !snapshot.lines.every(line => typeof line === "string" && line.length <= 4000)
    || !Number.isInteger(snapshot.cursorX) || snapshot.cursorX < 0 || snapshot.cursorX > 4000
    || !Number.isInteger(snapshot.cursorY) || snapshot.cursorY < 0 || snapshot.cursorY >= snapshot.lines.length) return false;
  if (snapshot.cols !== undefined && (!Number.isInteger(snapshot.cols) || snapshot.cols < 1 || snapshot.cols > 4000 || snapshot.cursorX > snapshot.cols)) return false;
  if (snapshot.lineInfo === undefined) return true;
  if (!Array.isArray(snapshot.lineInfo) || snapshot.lineInfo.length !== snapshot.lines.length) return false;
  return snapshot.lineInfo.every((line, row) => {
    if (!line || typeof line.wrapped !== "boolean" || !Array.isArray(line.styles) || line.styles.length > 4000) return false;
    let previousEnd = 0;
    if (!line.styles.every(style => {
      if (!style || !Number.isInteger(style.start) || !Number.isInteger(style.end)
        || style.start < previousEnd || style.end <= style.start || style.end > (snapshot.cols || 4000)
        || typeof style.dim !== "boolean" || typeof style.italic !== "boolean"
        || !Number.isInteger(style.fgMode) || !Number.isInteger(style.fg)
        || (style.bgMode !== undefined && !Number.isInteger(style.bgMode)) || (style.bg !== undefined && !Number.isInteger(style.bg))) return false;
      previousEnd = style.end;
      return true;
    })) return false;
    if (line.columns === undefined) return true;
    if (!Array.isArray(line.columns) || line.columns.length > 4001) return false;
    let previous = 0;
    return line.columns.every(offset => {
      if (!Number.isInteger(offset) || offset < previous || offset > snapshot.lines[row].length) return false;
      previous = offset;
      return true;
    });
  });
}

export function snapshotColumnOffset(snapshot: TerminalSnapshot, row: number, column: number): number {
  const offsets = snapshot.lineInfo?.[row]?.columns;
  return offsets ? offsets[Math.min(column, offsets.length - 1)] : Math.min(column, snapshot.lines[row].length);
}
