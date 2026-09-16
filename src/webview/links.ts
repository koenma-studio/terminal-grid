import type { ILink, IBufferCellPosition, Terminal } from "@xterm/xterm";
import { parseTerminalLink } from "../TerminalLink";

interface TextLink { start: number; end: number; uri: string }

function findTextLinks(text: string): TextLink[] {
  const links: TextLink[] = [];
  const starts = /https?:\/\/|file:\/\/|\/?[a-z]:[\\/]|\\\\[^\\/\s]+[\\/]|\/(?=[^\s/])/gi;
  for (let match; (match = starts.exec(text));) {
    const start = match.index;
    const before = text[start - 1];
    // Avoid finding a path inside another scheme, word or relative path.
    if (before && !/[\s("'`\[<{=]/.test(before)) continue;
    const closing = before === "<" ? ">" : before && "\"'`".includes(before) ? before : undefined;
    let end: number;
    if (closing) {
      end = text.indexOf(closing, start);
      if (end < 0) continue;
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
    if (parseTerminalLink(uri)) links.push({ start, end: start + uri.length, uri });
    starts.lastIndex = Math.max(starts.lastIndex, end);
  }
  return links;
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
  const chunks: string[] = [];
  const positions: (IBufferCellPosition & { width: number })[] = [];
  const cell = buffer.getNullCell();
  for (let row = first; row <= last; row++) {
    const line = buffer.getLine(row)!;
    for (let col = 0; col < Math.min(line.length, terminal.cols); col++) {
      line.getCell(col, cell);
      const width = cell.getWidth();
      if (!width) continue;
      const chars = cell.getChars();
      // A wide glyph may wrap leaving one empty padding cell on the prior row.
      if (!chars && col === terminal.cols - 1 && row < last && buffer.getLine(row + 1)?.getCell(0)?.getWidth() === 2) continue;
      const text = chars || " ";
      chunks.push(text);
      const position = { x: col + 1, y: row + 1, width };
      for (let unit = 0; unit < text.length; unit++) positions.push(position);
    }
  }
  return findTextLinks(chunks.join("")).flatMap(link => {
    const start = positions[link.start], end = positions[link.end - 1];
    if (!start || !end || y < start.y || y > end.y) return [];
    return [{ text: link.uri, activate, range: {
      start: { x: start.x, y: start.y }, end: { x: end.x + end.width - 1, y: end.y },
    } }];
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
