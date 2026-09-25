import type { ILink, IBufferCellPosition, Terminal } from "@xterm/xterm";
import { parseTerminalLink } from "../TerminalLink";

interface TextLink { start: number; end: number; uri: string; delimiter?: string }
type CellPosition = IBufferCellPosition & { width: number };
interface TextBlock { text: string; positions: CellPosition[] }

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
    let uri = text.slice(start, end);
    if (!closing) {
      // Keep balanced brackets in paths/URLs, but exclude surrounding prose.
      for (;;) {
        const last = uri.slice(-1);
        const opener = ({ ")": "(", "]": "[", "}": "{" } as Record<string, string>)[last];
        if (/[.,;:!?]/.test(last) || (opener && uri.split(last).length > uri.split(opener).length)) uri = uri.slice(0, -1);
        else break;
      }
    }
    if (parseTerminalLink(uri)) links.push({ start, end: start + uri.length, uri,
      delimiter: before && "(\"'`[<".includes(before) ? before : undefined });
    starts.lastIndex = Math.max(starts.lastIndex, end);
  }
  return links;
}

/** CLI renderers can wrap with CRLF and indentation rather than xterm wrapping. */
function continuesPath(current: TextBlock, next: TextBlock, cols: number): boolean {
  const tail = findTextLinks(current.text, true).pop();
  if (!tail || tail.end !== current.text.length) return false;
  const leading = next.text.length - next.text.trimStart().length;
  const rest = next.text.slice(leading);
  // Do not join a blank line, a fresh absolute target, or a shell/list prompt.
  if (!rest || /^(?:[\\/]|\.{1,2}[\\/]|[>*|•]|[-+]\s)/.test(rest)) return false;
  const quote = tail.delimiter && "\"'`".includes(tail.delimiter) ? tail.delimiter : undefined;
  const stop = quote ? rest.indexOf(quote) : rest.search(/[\s<>"'`|]/);
  const fragment = (stop < 0 ? rest : rest.slice(0, stop)).replace(/[)\]},;!?]+$/, "");
  if (!fragment || /[=:]/.test(fragment.replace(/:\d+(?::\d+)?$/, ""))) return false;
  const end = current.positions[current.positions.length - 1];
  const nearEdge = cols - (end.x + end.width - 1) <= 4;
  const nextEnd = next.positions[next.positions.length - 1];
  const nextNearEdge = cols - (nextEnd.x + nextEnd.width - 1) <= 4;
  // A file/component continuation or another full-width fragment is required;
  // prose after a path must remain a separate line.
  const closer = ({ "(": ")", "[": "]", "<": ">" } as Record<string, string>)[tail.delimiter || ""] || quote;
  const closesPath = !!closer && rest.slice(fragment.length).startsWith(closer);
  const pathFragment = /[\\/]|\.[\p{L}\p{N}]/u.test(fragment) || closesPath || (nextNearEdge && stop < 0);
  return pathFragment && (!!tail.delimiter || (nearEdge && leading > 0));
}

/** TUI renderers can fill a row with spaces, then indent the next wrapped row. */
function joinWrappedPadding(block: TextBlock, cols: number): void {
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
    if (!continuesPath(prefix, suffix, cols)) continue;
    block.text = prefix.text + block.text.slice(gaps.lastIndex);
    block.positions.splice(gap.index, gap[0].length);
    gaps.lastIndex = gap.index;
  }
}

/** Map logical text offsets to xterm cells, including wrapping and wide glyphs. */
function provideTextLinks(terminal: Terminal, y: number, activate: ILink["activate"]): ILink[] {
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
  const blocks: TextBlock[] = [];
  let block: TextBlock = { text: "", positions: [] };
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
      const position = { x: col + 1, y: row + 1, width };
      for (let unit = 0; unit < text.length; unit++) block.positions.push(position);
    }
    if (!buffer.getLine(row + 1)?.isWrapped) {
      // Drop unused terminal cells, preserving actual spaces in quoted paths.
      block.text = block.text.slice(0, contentEnd);
      const tail = findTextLinks(block.text, true).pop();
      if (!tail?.delimiter || !"\"'`".includes(tail.delimiter) || tail.end !== block.text.length) {
        block.text = block.text.trimEnd();
      }
      block.positions.length = block.text.length;
      joinWrappedPadding(block, terminal.cols);
      const previous = blocks[blocks.length - 1];
      if (previous && continuesPath(previous, block, terminal.cols)) {
        const leading = block.text.length - block.text.trimStart().length;
        previous.text += block.text.slice(leading);
        previous.positions.push(...block.positions.slice(leading));
      } else {
        blocks.push(block);
      }
      block = { text: "", positions: [] };
    }
  }
  return blocks.flatMap((block, index) => {
    // A joined path touching the context limit may have unseen fragments.
    if ((index === 0 && first > 0) || (index === blocks.length - 1 && buffer.getLine(last + 1))) return [];
    return findTextLinks(block.text).flatMap(link => {
      // Limit each range to its row, excluding CLI indentation and right padding.
      const cells = block.positions.slice(link.start, link.end).filter(position => position.y === y);
      const start = cells[0], end = cells[cells.length - 1];
      if (!start || !end) return [];
      return [{ text: link.uri, activate, range: {
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
  // Explicit OSC 8 targets retain precedence over detected display text.
  terminal.options.linkHandler = { allowNonHttpProtocols: true, activate };
  terminal.registerLinkProvider({
    provideLinks: (y, callback) => callback(provideTextLinks(terminal, y, activate)),
  });
}
