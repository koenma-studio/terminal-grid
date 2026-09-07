import { snapshotColumnOffset, SnapshotStyle, TerminalSnapshot } from "./TerminalSnapshot";
export type { TerminalSnapshot } from "./TerminalSnapshot";

export type ReadyState = "ready" | "starting" | "busy" | "picker" | "trust" | "blocked" | "occupied";

const PROMPT = /^\s*[│┃]?\s*(?:[›❯>]|aider>)\s?/;
const FOOTER = /\? for shortcuts|shift\+tab|context left|context remaining|ctrl\+g|ctrl\+t|esc to clear|esc(?:ape)? to (?:interrupt|cancel)|ctrl\+c to interrupt/i;
const BORDER = /^\s*[│┃]?[─━═┌┐└┘┏┓┗┛╭╮╰╯]{3,}[│┃]?\s*$/;

interface Composer {
  row: number;
  end: number;
  start: number;
  text: string;
  beforeCursor: string;
  atStart: boolean;
  inputUi: boolean;
  placeholder: boolean;
}

function isFooter(line: string, codex: boolean): boolean {
  return FOOTER.test(line) || (codex && /\S.* · (?:[a-zA-Z]:[\\/]|[~/])/.test(line));
}

function isMuted(style: SnapshotStyle): boolean {
  if (style.dim) return true;
  // The public xterm color-mode value distinguishes ANSI palette indices from RGB.
  if (style.fgMode === 0x1000000 || style.fgMode === 0x2000000) return style.fg === 8 || (style.fg >= 232 && style.fg <= 254);
  if (style.fgMode === 0x3000000) {
    const red = (style.fg >>> 16) & 255, green = (style.fg >>> 8) & 255, blue = style.fg & 255;
    return Math.max(red, green, blue) - Math.min(red, green, blue) <= 16 && red >= 48 && red <= 220;
  }
  return false;
}

/** A hint must match a CLI's known wording AND its subdued cell styling. */
function isPlaceholder(snapshot: TerminalSnapshot, row: number, end: number, start: number, text: string): boolean {
  const known = /^(?:Ask Codex to do anything|Try asking a question|Ask anything|Explain this codebase|Find and fix a bug in @filename|Write tests for @filename|Improve documentation in @filename|Implement \{feature\}|Summarize recent commits|Run \/review to review your current code changes|Try ["“].+["”])$/.test(text.replace(/\n\s*/g, " "));
  if (!known || !snapshot.lineInfo) return false;
  for (let index = row; index < end; index++) {
    const info = snapshot.lineInfo[index];
    if (!info) return false;
    const contentStyles = info.styles.filter(style => {
      const from = Math.max(index === row ? start : 0, snapshotColumnOffset(snapshot, index, style.start));
      const to = snapshotColumnOffset(snapshot, index, style.end);
      return /\S/.test(snapshot.lines[index].slice(from, to));
    });
    if (!contentStyles.length || !contentStyles.every(isMuted)) return false;
  }
  return true;
}

/** Read every row in the input box, not merely the characters left of the cursor. */
function composer(snapshot: TerminalSnapshot): Composer | null {
  const { lines, cursorX, cursorY } = snapshot;
  if (!lines.length || cursorY < 0 || cursorY >= lines.length) return null;
  let row = cursorY;
  while (row >= 0 && !PROMPT.test(lines[row])) {
    if (BORDER.test(lines[row]) || isFooter(lines[row], true)) return null;
    row--;
  }
  if (row < 0) return null;
  // A continuation can itself start with ">" (for example a quoted paragraph).
  // Prefer the prompt above it in the same input box instead of losing that text.
  let boundary = row - 1;
  while (boundary >= 0 && !BORDER.test(lines[boundary]) && !isFooter(lines[boundary], true)) boundary--;
  const enclosed = boundary >= 0 && BORDER.test(lines[boundary]);
  for (let index = row - 1; index > boundary; index--) {
    if (!enclosed && !lines[index].trim()) break;
    if (PROMPT.test(lines[index]) && !snapshot.lineInfo?.[index]?.wrapped) row = index;
  }
  const prefix = lines[row].match(PROMPT)!;
  const start = prefix[0].length;
  const codex = /^\s*›/.test(lines[row]);
  const aider = /^\s*aider>/.test(lines[row]);
  const inputBackground = snapshot.lineInfo?.[row]?.styles.find(style => style.start <= start && style.end > start && style.bgMode);
  const shadedInput = !!inputBackground;
  let end = lines.length;
  for (let index = row + 1; index < lines.length; index++) {
    const sameBackground = inputBackground && snapshot.lineInfo?.[index]?.styles.some(style =>
      style.bgMode === inputBackground.bgMode && style.bg === inputBackground.bg);
    // Borders and painted input backgrounds are stronger boundaries than words:
    // a user's multiline text can itself contain "? for shortcuts".
    if (BORDER.test(lines[index]) || (shadedInput ? !sameBackground : !enclosed && isFooter(lines[index], codex))) { end = index; break; }
  }
  if (cursorY >= end) return null;
  const inputUi = aider || lines.slice(end).some(line => isFooter(line, codex));
  const boxed = /[│┃]/.test(prefix[0]);
  const parts: string[] = [];
  let beforeCursor = "";
  let text = "";
  for (let index = row; index < end; index++) {
    const source = lines[index];
    const wrapped = !!snapshot.lineInfo?.[index]?.wrapped;
    const indent = index === row ? start : (!wrapped && source.startsWith(" ".repeat(start)) ? start : 0);
    const content = source.slice(indent).replace(boxed ? /\s*[│┃]\s*$/ : /$/, "");
    const separator = index === row || wrapped ? "" : "\n";
    if (index === cursorY) beforeCursor = text + separator + content.slice(0, Math.max(0, snapshotColumnOffset(snapshot, index, cursorX) - indent));
    text += separator + content;
    parts.push(content);
  }
  // Empty display padding below the cursor is not part of the editor. Nonempty
  // continuation rows always remain, even when the cursor was moved to Home.
  while (parts.length > cursorY - row + 1 && !parts[parts.length - 1].trim()) parts.pop();
  text = parts.reduce((result, part, index) => result + (index && !snapshot.lineInfo?.[row + index]?.wrapped ? "\n" : "") + part, "");
  const atStart = cursorY === row && snapshotColumnOffset(snapshot, row, cursorX) === start;
  return { row, end: row + parts.length, start, text, beforeCursor, atStart, inputUi, placeholder: atStart && isPlaceholder(snapshot, row, row + parts.length, start, text) };
}

/** Classify the rendered VT screen, never concatenated PTY history or elapsed time. */
export function classifyStartupScreen(snapshot: TerminalSnapshot): ReadyState {
  const { lines, cursorX, cursorY } = snapshot;
  if (!lines.length || cursorY < 0 || cursorY >= lines.length) return "starting";
  const controls = lines.slice(Math.max(0, cursorY - 8)).join("\n");
  const screen = lines.join("\n");
  if (/^\s*Resume (?:(?:a|an|your) )?(?:previous )?(?:session|conversation)\s*$/im.test(screen)
    && /type to search|search…|search\.\.\.|enter\s+resume|no conversations found/i.test(screen)) return "picker";
  // Full-screen Codex pickers park the cursor in their footer, far below the heading.
  if (/enter\s+resume.*esc\s+new/i.test(controls)) return "picker";
  if (/do you trust|trust (?:this|the) (?:folder|directory|workspace)|is this a project you created/i.test(controls)) return "trust";
  if (/resume (?:(?:a|an|your) )?(?:previous )?(?:session|conversation)|select (?:(?:a|an) )?(?:previous )?(?:session|conversation)|search (?:past )?(?:sessions|conversations)|no (?:saved )?(?:sessions|conversations) found/i.test(controls)) return "picker";
  if (/sign in|log in|login required|open (?:your )?browser|paste (?:the )?(?:authentication|authorization|code)|select (?:a )?(?:login|theme)|do you want to (?:proceed|allow)|would you like to|use .+ by default\?|allow (?:once|this)|approve (?:this|the)|accept.*(?:terms|risk)/i.test(controls)) return "blocked";
  // The interrupt footer explicitly means a turn is still active, even if its composer is visible.
  if (/esc(?:ape)? to (?:interrupt|cancel)|interrupt.*esc|ctrl\+c to interrupt/i.test(controls)) return "busy";
  const input = composer(snapshot);
  if (!input || (input.row === cursorY && snapshotColumnOffset(snapshot, cursorY, cursorX) < input.start)) return "starting";
  if (!input.inputUi) return "starting";
  if (!input.atStart || (input.text && !input.placeholder)) return "occupied";
  // Require a second, independent input-UI signal near the cursor. A menu selection arrow alone is insufficient.
  return input.inputUi ? "ready" : "starting";
}

/** Exact, complete composer verification before submitting an automatically typed command. */
export function startupComposerMatches(snapshot: TerminalSnapshot, expected: string): boolean {
  if (!expected || /[\r\n]/.test(expected)) return false;
  const input = composer(snapshot);
  if (!input || !input.inputUi || input.placeholder || input.text !== expected || input.beforeCursor !== expected) return false;
  return !["trust", "blocked", "picker", "busy"].includes(classifyStartupScreen(snapshot));
}

/** At least two stable observations of an empty input area are needed before typing. */
export class ReadinessGate {
  private _key = "";
  private _since = 0;
  observe(snapshot: TerminalSnapshot, now = Date.now()): { state: ReadyState; ready: boolean } {
    const state = classifyStartupScreen(snapshot);
    const input = state === "ready" ? composer(snapshot) : null;
    const key = input ? JSON.stringify([snapshot.cursorY, snapshot.cursorX, snapshot.lines.slice(input.row, input.end), snapshot.lineInfo?.slice(input.row, input.end)]) : "";
    if (!key || key !== this._key) { this._key = key; this._since = now; return { state, ready: false }; }
    return { state, ready: now - this._since >= 600 };
  }
}
