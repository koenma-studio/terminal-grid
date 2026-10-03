import type { ILink, IBufferCellPosition, Terminal } from "@xterm/xterm";
import { parseTerminalLink, withoutAttachedProse } from "../TerminalLink";

interface TextLink { start: number; end: number; uri: string; delimiter?: string }
/** `column` counts from the start of the hard line, as if xterm had not wrapped it. */
type CellPosition = IBufferCellPosition & { width: number; column: number };
/** `drawn` is the last column a hard line's application wrote, including padding spaces. */
interface TextBlock { text: string; positions: CellPosition[]; drawn?: number }

const lastColumn = (position: CellPosition): number => position.column + position.width - 1;

/** CLIs pad rows to the width they drew them at and do not redraw them after a resize. */
function drawnWidth(lines: TextBlock[], cols: number): number {
  const ends = lines.map(line => line.drawn || 0);
  const widest = Math.max(0, ...ends);
  // Rows ending at one column are the CLI's edge; a single long line is not.
  return ends.filter(end => end && end >= widest - 2).length >= 2 ? widest : cols;
}

/** Keep balanced brackets in paths/URLs, but exclude surrounding prose. */
function trimLink(uri: string): string {
  for (;;) {
    const last = uri.slice(-1);
    const opener = ({ ")": "(", "]": "[", "}": "{" } as Record<string, string>)[last];
    const trimmed = /[.,;:!?]/.test(last) || (opener && uri.split(last).length > uri.split(opener).length)
      ? uri.slice(0, -1) : withoutAttachedProse(uri);
    if (trimmed === uri) return uri;
    uri = trimmed;
  }
}

/** Screen text that parses as a path but names nothing to open. Explicit OSC 8 targets are exempt. */
function unlikelyPath(path: string): boolean {
  const target = path.replace(/:\d+(?::\d+)?$/, "");
  // A CLI truncated the path (`codex-brief-v2.…`); the full target is not on screen.
  if (target.includes("…")) return true;
  // Slash commands (`/quit`, `/permissions`): one absolute segment without an extension.
  if (/^\/[^\\/.]*$/.test(target)) return true;
  // Numbers, versions, ratings and dates: `0.99`, `v0.7.3`, `5.0/5`, `24/7`, `2026/10/03`.
  if (/^v?[\d.]+(?:[\\/][\d.]+)*$/i.test(target)) return true;
  // A bare file name needs an extension that starts with a letter (`report.txt`, not `1.01배`).
  if (!/[\\/]/.test(target) && !/\.\p{L}[^.]*$/u.test(target)) return true;
  // Escapes such as `\x1b` or `\n`: a backslash-only relative path must name a file or folder.
  return !/^(?:[a-z]:|[\\/]{2}|\.{1,2}[\\/])/i.test(target) && target.includes("\\") && !target.includes("/")
    && !/(?:\\|\.[\p{L}\p{N}]+)$/u.test(target);
}

/** Terminal cells covered by text positions; surrogate pairs share one position. */
function cellWidth(positions: CellPosition[]): number {
  return positions.reduce((width, position, index) => position === positions[index - 1] ? width : width + position.width, 0);
}

function findTextLinks(text: string, allowUnclosed = false): TextLink[] {
  const links: TextLink[] = [];
  // Check whole tokens so bare relative paths work without detecting a suffix
  // inside an unsupported URI scheme or a word.
  const starts = /[^\s<>"'`|()[\]{}=]+/g;
  for (let match; (match = starts.exec(text));) {
    const start = match.index;
    const before = text[start - 1];
    // Avoid finding a path inside another scheme or word.
    if (before && !/[\s("'`\[<{=]/.test(before)) continue;
    const labelEnd = before === "[" ? text.indexOf("]", start) : -1;
    if (labelEnd >= 0 && text[labelEnd + 1] === "(") {
      starts.lastIndex = labelEnd + 2;
      continue;
    }
    const closing = before === "<" ? ">" : before && "\"'`".includes(before) ? before : undefined;
    if (!closing && !/^(?:https?|file):\/\//i.test(match[0]) && !parseTerminalLink(match[0])) continue;
    let end: number;
    if (closing) {
      end = text.indexOf(closing, start);
      if (end < 0) {
        if (!allowUnclosed) continue;
        end = text.length;
      }
    } else {
      const stop = text.slice(start).search(/[\s<>"'`|]/);
      end = stop < 0 ? text.length : start + stop;
    }
    const uri = closing ? text.slice(start, end) : trimLink(text.slice(start, end));
    const target = parseTerminalLink(uri);
    if (target && !(target.kind === "path" && unlikelyPath(target.path))) links.push({ start, end: start + uri.length, uri,
      delimiter: before && "(\"'`[<".includes(before) ? before : undefined });
    starts.lastIndex = Math.max(starts.lastIndex, end);
  }
  return links;
}

/** CLI renderers can wrap with CRLF and indentation rather than xterm wrapping.
 *  `cols` is the width the CLI drew these rows at, which a resize does not change. */
function continuesPath(current: TextBlock, next: TextBlock, cols: number): boolean {
  const tail = findTextLinks(current.text, true).pop();
  if (!tail || tail.end !== current.text.length) return false;
  const leading = next.text.length - next.text.trimStart().length;
  const rest = next.text.slice(leading);
  // Do not join a blank line, a relative target, or a shell/list prompt.
  if (!rest || /^(?:\.{1,2}[\\/]|[>*|•]|[-+]\s)/.test(rest)) return false;
  const quote = tail.delimiter && "\"'`".includes(tail.delimiter) ? tail.delimiter : undefined;
  const stop = quote ? rest.indexOf(quote) : rest.search(/[\s<>"'`|]/);
  const word = stop < 0 ? rest : rest.slice(0, stop);
  const fragment = trimLink(word);
  if (!fragment || /[=:]/.test(fragment.replace(/:\d+(?::\d+)?$/, ""))) return false;
  const end = lastColumn(current.positions[current.positions.length - 1]);
  const nearEdge = cols - end <= 4;
  const nextNearEdge = cols - lastColumn(next.positions[next.positions.length - 1]) <= 4;
  // Word wrappers split only a word longer than the row.
  const tooLong = cellWidth(current.positions.slice(tail.start))
    + cellWidth(next.positions.slice(leading, leading + word.length)) > end - leading;
  // A row starting with a separator is a fresh absolute target unless the path was
  // split right before it at the row edge (`…\node_modules` + `\@xterm\…`).
  if (/^[\\/]/.test(rest)) {
    return nearEdge && tooLong && leading > 0 && tail.uri.includes(rest[0]) && !/[\\/]$/.test(tail.uri) && !/^[\\/]{2}/.test(rest);
  }
  // A file/component continuation or another full-width fragment is required;
  // prose after a path must remain a separate line.
  const closer = ({ "(": ")", "[": "]", "<": ">" } as Record<string, string>)[tail.delimiter || ""] || quote;
  const closesPath = !!closer && rest.slice(fragment.length).startsWith(closer);
  const pathFragment = /[\\/]|\.[\p{L}\p{N}]/u.test(fragment) || closesPath || (nextNearEdge && stop < 0);
  if (pathFragment && (!!tail.delimiter || (nearEdge && leading > 0))) return true;
  // Korean prose attached to the remainder (`...v2.j` + `pg를`) marks the end of a split path.
  const glued = /\p{Script=Hangul}/u.test(word.slice(fragment.length));
  if (nearEdge && tooLong && glued) return true;
  // Codex wraps after "-" or "/" and pads the row; its next segment did not fit in that gap.
  // After "/", only a file name or attached prose continues, not another listed folder.
  const breakAfter = tail.uri.slice(-1);
  if (leading > 0 && (breakAfter === "-" ? pathFragment || glued
    : breakAfter === "/" && (glued || /\.[\p{L}\p{N}]+$/u.test(fragment)))) {
    const unit = word.match(/^[^-/]*[-/]?/)![0];
    return cellWidth(next.positions.slice(leading, leading + unit.length)) >= cols - end - 1;
  }
  return false;
}

/** TUI renderers can fill a row with spaces, then indent the next wrapped row. */
function joinWrappedPadding(block: TextBlock): void {
  if (!block.positions.length) return;
  const spansRows = block.positions[0].y !== block.positions[block.positions.length - 1].y;
  // Reflow can move old row padding into the middle of a new row. Keep its cell
  // positions, but omit the padding from a clearly continuing unquoted path.
  const gaps = / {2,}/g;
  for (let gap; (gap = gaps.exec(block.text));) {
    if (!gap.index || gaps.lastIndex === block.text.length) continue;
    const prefix = { text: block.text.slice(0, gap.index), positions: block.positions.slice(0, gap.index) };
    const tail = findTextLinks(prefix.text, true).pop();
    // Spaces inside quoted file names are significant, even across soft wraps.
    if (!tail || (!spansRows && !tail.delimiter) || (tail.delimiter && "\"'`".includes(tail.delimiter))) continue;
    const suffix = { text: block.text.slice(gap.index), positions: block.positions.slice(gap.index) };
    // The padding filled the row up to the edge the CLI drew it at.
    if (!continuesPath(prefix, suffix, lastColumn(block.positions[gaps.lastIndex - 1]))) continue;
    block.text = prefix.text + block.text.slice(gaps.lastIndex);
    block.positions.splice(gap.index, gap[0].length);
    gaps.lastIndex = gap.index;
  }
}

/** Map logical text offsets to xterm cells, including wrapping and wide glyphs. */
function provideTextLinks(terminal: Terminal, y: number, handlers: Pick<ILink, "activate" | "hover" | "leave">): ILink[] {
  const buffer = terminal.buffer.active;
  let first = y - 1, last = y - 1;
  if (!buffer.getLine(first)) return [];
  // Bound hover work on unusually long output; never open a truncated target.
  const maxCells = 32768;
  while (first > 0 && buffer.getLine(first)?.isWrapped) {
    if ((last - first + 2) * terminal.cols > maxCells) return [];
    first--;
  }
  while (buffer.getLine(last + 1)?.isWrapped) {
    if ((last - first + 2) * terminal.cols > maxCells) return [];
    last++;
  }
  // Include nearby hard lines in both directions so every visible fragment
  // resolves to the same complete target. Keep hover work bounded.
  before: for (let count = 0; count < 8 && first > 0; count++) {
    let previous = first - 1;
    while (previous > 0 && buffer.getLine(previous)?.isWrapped) {
      if ((last - previous + 2) * terminal.cols > maxCells) break before;
      previous--;
    }
    if ((last - previous + 1) * terminal.cols > maxCells) break;
    first = previous;
  }
  after: for (let count = 0; count < 8 && buffer.getLine(last + 1); count++) {
    let following = last + 1;
    while (buffer.getLine(following + 1)?.isWrapped) {
      if ((following - first + 2) * terminal.cols > maxCells) break after;
      following++;
    }
    if ((following - first + 1) * terminal.cols > maxCells) break;
    last = following;
  }
  const lines: TextBlock[] = [];
  let block: TextBlock = { text: "", positions: [] };
  let lineStart = first;
  const cell = buffer.getNullCell();
  for (let row = first; row <= last; row++) {
    const line = buffer.getLine(row)!;
    let contentEnd = block.text.length;
    for (let col = 0; col < Math.min(line.length, terminal.cols); col++) {
      line.getCell(col, cell);
      const width = cell.getWidth();
      if (!width) continue;
      const chars = cell.getChars();
      // A wide glyph may wrap leaving one empty padding cell on the prior row.
      if (!chars && col === terminal.cols - 1 && buffer.getLine(row + 1)?.isWrapped
        && buffer.getLine(row + 1)?.getCell(0)?.getWidth() === 2) continue;
      const text = chars || " ";
      block.text += text;
      if (chars) contentEnd = block.text.length;
      const position = { x: col + 1, y: row + 1, width, column: (row - lineStart) * terminal.cols + col + 1 };
      for (let unit = 0; unit < text.length; unit++) block.positions.push(position);
    }
    if (!buffer.getLine(row + 1)?.isWrapped) {
      // Drop unused terminal cells, preserving actual spaces in quoted paths.
      block.text = block.text.slice(0, contentEnd);
      if (contentEnd) block.drawn = lastColumn(block.positions[contentEnd - 1]);
      const tail = findTextLinks(block.text, true).pop();
      if (!tail?.delimiter || !"\"'`".includes(tail.delimiter) || tail.end !== block.text.length) {
        block.text = block.text.trimEnd();
      }
      block.positions.length = block.text.length;
      lines.push(block);
      block = { text: "", positions: [] };
      lineStart = row + 1;
    }
  }
  // Join hard lines against the width the CLI drew the rows around each break at.
  const blocks: TextBlock[] = [];
  lines.forEach((line, index) => {
    joinWrappedPadding(line);
    const previous = blocks[blocks.length - 1];
    if (previous && continuesPath(previous, line, drawnWidth(lines.slice(Math.max(0, index - 3), index + 3), terminal.cols))) {
      const leading = line.text.length - line.text.trimStart().length;
      previous.text += line.text.slice(leading);
      previous.positions.push(...line.positions.slice(leading));
    } else {
      blocks.push(line);
    }
  });
  return blocks.flatMap((block, index) => {
    // A joined path touching the context limit may have unseen fragments.
    if ((index === 0 && first > 0) || (index === blocks.length - 1 && buffer.getLine(last + 1))) return [];
    return findTextLinks(block.text).flatMap(link => {
      // Range this row and the rows it soft-wraps into without a gap, excluding CLI
      // indentation and right padding between hard-wrapped fragments.
      const segments: CellPosition[][] = [];
      for (const cell of block.positions.slice(link.start, link.end)) {
        const segment = segments[segments.length - 1], previous = segment?.[segment.length - 1];
        // A wide glyph may wrap leaving one empty padding cell on the prior row.
        if (previous && (cell.y === previous.y || (cell.y === previous.y + 1 && cell.x === 1
          && previous.x + previous.width - 1 + (cell.width > 1 ? 1 : 0) >= terminal.cols))) segment.push(cell);
        else segments.push([cell]);
      }
      const segment = segments.find(cells => cells.some(position => position.y === y));
      if (!segment) return [];
      const start = segment[0], end = segment[segment.length - 1];
      return [{ text: link.uri, ...handlers, range: {
        start: { x: start.x, y: start.y }, end: { x: end.x + end.width - 1, y: end.y },
      } }];
    });
  });
}

export function registerTerminalLinks(terminal: Terminal, open: (uri: string) => void): void {
  const activate = (event: MouseEvent, uri: string): void => {
    if (event.button !== 0 || terminal.hasSelection() || !parseTerminalLink(uri)) return;
    event.preventDefault();
    open(uri);
  };
  let linkUnderPointer = false;
  const handlers = { activate, hover: () => { linkUnderPointer = true; }, leave: () => { linkUnderPointer = false; } };
  // Explicit OSC 8 targets retain precedence over detected display text.
  terminal.options.linkHandler = { allowNonHttpProtocols: true, ...handlers };
  terminal.registerLinkProvider({
    provideLinks: (y, callback) => callback(provideTextLinks(terminal, y, handlers)),
  });
  // An application with mouse reporting (Codex) also acts on a click, opening a second
  // window. The link alone handles a click on it; other clicks still reach the application.
  terminal.element?.querySelector(".xterm-screen")?.addEventListener("mousedown", event => {
    if (!linkUnderPointer || terminal.modes.mouseTrackingMode === "none" || (event as MouseEvent).button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    terminal.focus();
  });
}
