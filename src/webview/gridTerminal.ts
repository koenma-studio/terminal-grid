import { Terminal, ITheme } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { copySelection, handleClipboardKey, handleNativePaste, requestPaste, sendImage } from "./clipboard";
import { CellInputQueue } from "./inputQueue";
import { CellSelection } from "./selection";
import { CellViewport } from "./viewport";
import { captureTerminalSnapshot } from "../TerminalSnapshot";
import { openTerminalHistory } from "./history";

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare const __GRID_ROWS: number;
declare const __GRID_COLS: number;
declare const __GRID_TAB_ID: number;
declare const __GRID_CELL_IDS: number[];
declare const __GRID_LABELS: Record<string, string>;
declare const __GRID_ZOOM: number;
declare const __GRID_SCROLLBACK: number;
declare const __GRID_COPY_RETAINED: string;
declare const __GRID_FONT_FAMILY: string;
declare const __GRID_BG_COLOR: string;
declare const __GRID_FG_COLOR: string;
declare const __GRID_THEME: string;
declare const __GRID_THEME_COLORS: Record<string, string> | null;
declare const __GRID_MERGE_REGIONS: { startRow: number; startCol: number; rowSpan: number; colSpan: number }[];

const vscode = acquireVsCodeApi();
const rows = __GRID_ROWS;
const cols = __GRID_COLS;
const total = rows * cols;
const restoredState = vscode.getState() as { tabId?: number; zooms?: number[]; colFr?: number[]; rowFr?: number[] } | undefined;
const sameTab = typeof __GRID_TAB_ID === "number" && restoredState?.tabId === __GRID_TAB_ID;
const ui = (key: string): string => typeof __GRID_LABELS !== "undefined" ? __GRID_LABELS[key] || key : key;

function saveViewState(): void {
  vscode.setState({ tabId: typeof __GRID_TAB_ID === "number" ? __GRID_TAB_ID : undefined, rows, cols,
    cellIds: typeof __GRID_CELL_IDS !== "undefined" ? __GRID_CELL_IDS : [],
    zooms: cells.map(c => c?.zoom ?? 100), colFr, rowFr });
}

// ── Merge regions ──
const mergeRegions = (typeof __GRID_MERGE_REGIONS !== "undefined" ? __GRID_MERGE_REGIONS : []) || [];
const hiddenCells = new Set<number>();
for (const m of mergeRegions) {
  for (let r = m.startRow; r < m.startRow + m.rowSpan; r++) {
    for (let c = m.startCol; c < m.startCol + m.colSpan; c++) {
      if (r === m.startRow && c === m.startCol) continue;
      hiddenCells.add(r * cols + c);
    }
  }
}
function getMergeOrigin(cellRow: number, cellCol: number) {
  return mergeRegions.find(m => m.startRow === cellRow && m.startCol === cellCol);
}

let globalZoom = __GRID_ZOOM;
let fontFamilyOverride = __GRID_FONT_FAMILY;
let bgColorOverride = __GRID_BG_COLOR;
let fgColorOverride = __GRID_FG_COLOR;
let globalThemeName = __GRID_THEME;
let globalThemeColors = __GRID_THEME_COLORS;

const ZOOM_STEP = 10;
const ZOOM_MIN = 50;
const ZOOM_MAX = 300;

// ── Read IDE theme via CSS variables ──
function css(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildThemeFromColors(tc: Record<string, string> | null): ITheme {
  if (tc) {
    // Theme colors provided — use them, but allow bg/fg overrides on top
    const bg = bgColorOverride || tc.background || "";
    const fg = fgColorOverride || tc.foreground || "";
    return {
      background: bg || undefined,
      foreground: fg || undefined,
      cursor: tc.cursor || fg || undefined,
      cursorAccent: tc.cursorAccent || bg || undefined,
      selectionBackground: tc.selectionBackground || undefined,
      black: tc.black || undefined, brightBlack: tc.brightBlack || undefined,
      red: tc.red || undefined, brightRed: tc.brightRed || undefined,
      green: tc.green || undefined, brightGreen: tc.brightGreen || undefined,
      yellow: tc.yellow || undefined, brightYellow: tc.brightYellow || undefined,
      blue: tc.blue || undefined, brightBlue: tc.brightBlue || undefined,
      magenta: tc.magenta || undefined, brightMagenta: tc.brightMagenta || undefined,
      cyan: tc.cyan || undefined, brightCyan: tc.brightCyan || undefined,
      white: tc.white || undefined, brightWhite: tc.brightWhite || undefined,
    };
  }
  // IDE Default — read CSS variables
  const bg = bgColorOverride || css("--vscode-terminal-background") || css("--vscode-editor-background") || "";
  const fg = fgColorOverride || css("--vscode-terminal-foreground") || css("--vscode-editor-foreground") || "";
  return {
    background: bg || undefined,
    foreground: fg || undefined,
    cursor: css("--vscode-terminalCursor-foreground") || fg || undefined,
    cursorAccent: bg || undefined,
    selectionBackground: css("--vscode-terminal-selectionBackground") || undefined,
    selectionForeground: css("--vscode-terminal-selectionForeground") || undefined,
    black: css("--vscode-terminal-ansiBlack") || undefined,
    brightBlack: css("--vscode-terminal-ansiBrightBlack") || undefined,
    red: css("--vscode-terminal-ansiRed") || undefined,
    brightRed: css("--vscode-terminal-ansiBrightRed") || undefined,
    green: css("--vscode-terminal-ansiGreen") || undefined,
    brightGreen: css("--vscode-terminal-ansiBrightGreen") || undefined,
    yellow: css("--vscode-terminal-ansiYellow") || undefined,
    brightYellow: css("--vscode-terminal-ansiBrightYellow") || undefined,
    blue: css("--vscode-terminal-ansiBlue") || undefined,
    brightBlue: css("--vscode-terminal-ansiBrightBlue") || undefined,
    magenta: css("--vscode-terminal-ansiMagenta") || undefined,
    brightMagenta: css("--vscode-terminal-ansiBrightMagenta") || undefined,
    cyan: css("--vscode-terminal-ansiCyan") || undefined,
    brightCyan: css("--vscode-terminal-ansiBrightCyan") || undefined,
    white: css("--vscode-terminal-ansiWhite") || undefined,
    brightWhite: css("--vscode-terminal-ansiBrightWhite") || undefined,
  };
}

function buildTheme(): ITheme {
  return buildThemeFromColors(globalThemeColors);
}

function getTermFontFamily(): string {
  if (fontFamilyOverride) return fontFamilyOverride;
  return (
    css("--vscode-terminal-fontFamily") ||
    css("--vscode-editor-fontFamily") ||
    'Consolas, "Courier New", monospace'
  );
}

function baseFontSize(): number {
  const raw = css("--vscode-terminal-fontSize") || css("--vscode-editor-fontSize");
  const n = parseInt(raw, 10);
  return n > 0 ? n : 13;
}

// ── Zoom helpers ──
function calcFontSize(cellZoom: number): number {
  const base = baseFontSize();
  return Math.max(6, Math.round(base * (globalZoom / 100) * (cellZoom / 100)));
}

function displayPct(cellZoom: number): number {
  const raw = Math.round((globalZoom / 100) * cellZoom);
  return Math.round(raw / 10) * 10;
}

function applyZoom(cell: Cell): void {
  cell.selection.finishDrag();
  cell.terminal.options.fontSize = calcFontSize(cell.zoom);
  cell.viewport.fit();
  const pct = displayPct(cell.zoom);
  cell.zoomLabel.textContent = pct === 100 ? "" : pct + "%";
  saveViewState();
}

// ── Apply background color override to containers ──
function applyBgOverride(): void {
  const bg = bgColorOverride || (globalThemeColors?.background ?? "");
  document.body.style.background = bg || "";
  grid.style.background = bg || "";
  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx];
    if (!cell) continue;
    const ov = cellOverrides[idx];
    // Skip cells with their own bg override or cell-level theme
    if (ov?.bgColor || ov?.themeColors?.background) continue;
    cell.el.style.background = bg || "";
    cell.el.querySelectorAll<HTMLElement>(".term-container, .xterm, .xterm-viewport, .xterm-screen").forEach(el => {
      el.style.backgroundColor = bg || "";
    });
  }
}

// ── Build cells ──
interface Cell {
  terminal: Terminal;
  inputQueue: CellInputQueue;
  fitAddon: FitAddon;
  viewport: CellViewport;
  el: HTMLDivElement;
  zoom: number;
  zoomLabel: HTMLSpanElement;
  labelEl: HTMLSpanElement;
  selection: CellSelection;
  startup: HTMLDivElement;
  startupText: HTMLSpanElement;
  startupRetry: HTMLButtonElement;
  startupCancel: HTMLButtonElement;
  startupGeneration: number;
  notice: HTMLSpanElement;
  pasteCancel: HTMLButtonElement;
  epoch: number;
}

const cells: (Cell | null)[] = [];
const grid = document.getElementById("grid")!;

for (let i = 0; i < total; i++) {
  if (hiddenCells.has(i)) {
    cells.push(null);
    continue;
  }

  const cellRow = Math.floor(i / cols);
  const cellCol = i % cols;

  const cellDiv = document.createElement("div");
  cellDiv.className = "cell";

  // Explicit grid positioning (required when merges exist)
  cellDiv.style.gridRow = String(cellRow + 1);
  cellDiv.style.gridColumn = String(cellCol + 1);
  const mergeInfo = getMergeOrigin(cellRow, cellCol);
  if (mergeInfo) {
    cellDiv.style.gridRow = `${cellRow + 1} / span ${mergeInfo.rowSpan}`;
    cellDiv.style.gridColumn = `${cellCol + 1} / span ${mergeInfo.colSpan}`;
  }

  // Info bar: number + zoom %
  const info = document.createElement("div");
  info.className = "cell-info";

  const zoomLabel = document.createElement("span");
  zoomLabel.className = "cell-zoom-pct";
  info.appendChild(zoomLabel);

  const label = document.createElement("span");
  label.className = "cell-label";
  label.textContent = `${i + 1}`;
  info.appendChild(label);

  cellDiv.appendChild(info);

  const startup = document.createElement("div");
  startup.className = "cell-startup";
  startup.hidden = true;
  const startupText = document.createElement("span");
  startupText.setAttribute("role", "status");
  const startupRetry = document.createElement("button");
  const startupCancel = document.createElement("button");
  startup.append(startupText, startupRetry, startupCancel);
  cellDiv.appendChild(startup);

  const termContainer = document.createElement("div");
  termContainer.className = "term-container";
  cellDiv.appendChild(termContainer);

  grid.appendChild(cellDiv);

  const storedZoom = sameTab ? restoredState?.zooms?.[i] : undefined;
  const cellZoom = typeof storedZoom === "number" && storedZoom >= ZOOM_MIN && storedZoom <= ZOOM_MAX ? storedZoom : 100;
  const terminal = new Terminal({
    fontSize: calcFontSize(cellZoom),
    fontFamily: getTermFontFamily(),
    theme: buildTheme(),
    cursorBlink: true,
    scrollback: typeof __GRID_SCROLLBACK === "number" ? __GRID_SCROLLBACK : 20000,
    allowTransparency: true,
    allowProposedApi: true,
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(new Unicode11Addon());
  terminal.unicode.activeVersion = "11";
  terminal.open(termContainer);

  const copyRetained = document.createElement("button");
  copyRetained.className = "cell-copy-retained";
  copyRetained.hidden = true;
  copyRetained.textContent = typeof __GRID_COPY_RETAINED === "string" ? __GRID_COPY_RETAINED : "Copy saved selection";
  cellDiv.appendChild(copyRetained);
  const selection = new CellSelection(terminal,
    paused => vscode.postMessage({ type: "selectionDrag", id: i, paused }),
    retained => { copyRetained.hidden = !retained; });
  copyRetained.addEventListener("click", () => {
    const text = selection.getSelection();
    copySelection(terminal, msg => postClipboard(i, msg), text, () => { if (selection.getSelection() === text) selection.cancel(); });
    terminal.focus();
  });
  // Discard a previous selection on an intentional new click or terminal input.
  termContainer.addEventListener("mousedown", e => {
    if (e.button === 0 && !e.shiftKey && !selection.dragging) selection.cancel();
  }, true);
  termContainer.addEventListener("keydown", e => {
    if (e.key === "Escape" && selection.hasSelection()) {
      selection.cancel(); e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    const copy = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "c";
    if (!copy && !["Control", "Shift", "Alt", "Meta"].includes(e.key)) selection.cancel();
  }, true);
  termContainer.addEventListener("copy", e => {
    if (!selection.hasSelection() || !e.clipboardData) return;
    e.clipboardData.setData("text/plain", selection.getSelection());
    e.preventDefault(); e.stopImmediatePropagation(); selection.cancel();
  }, true);

  const noticeBar = document.createElement("div");
  noticeBar.className = "cell-notice";
  const notice = document.createElement("span");
  notice.setAttribute("role", "status");
  const pasteCancel = document.createElement("button");
  pasteCancel.textContent = ui("Cancel paste"); pasteCancel.hidden = true;
  noticeBar.append(notice, pasteCancel); cellDiv.appendChild(noticeBar);
  const inputQueue = new CellInputQueue(terminal, data => {
    vscode.postMessage({ type: "input", id: i, data });
  }, state => {
    if (state === "reading") { notice.textContent = ui("Reading clipboard…"); pasteCancel.hidden = false; }
    else if (state === "timeout") { notice.textContent = ui("Clipboard timed out. Paste again."); pasteCancel.hidden = true; }
    else if (state === "cancelled") { notice.textContent = ui("Paste cancelled"); pasteCancel.hidden = true; }
    else { notice.textContent = ""; pasteCancel.hidden = true; }
  });
  pasteCancel.addEventListener("click", () => {
    inputQueue.reset(); vscode.postMessage({ type: "cancelInput", id: i });
    notice.textContent = ui("Paste cancelled"); pasteCancel.hidden = true; terminal.focus();
  });
  terminal.onData(data => inputQueue.input(data));
  for (const event of ["keydown", "paste"]) {
    terminal.textarea?.addEventListener(event, () => vscode.postMessage({ type: "userActivity", id: i }));
  }

  terminal.textarea?.addEventListener("focus", () => cellDiv.classList.add("focused"));
  terminal.textarea?.addEventListener("blur", () => cellDiv.classList.remove("focused"));

  const viewport = new CellViewport(terminal, fitAddon, (cols, rows) => vscode.postMessage({ type: "resize", id: i, cols, rows }));
  const cell: Cell = { terminal, inputQueue, fitAddon, viewport, el: cellDiv, zoom: cellZoom, zoomLabel, labelEl: label, selection,
    startup, startupText, startupRetry, startupCancel, startupGeneration: 0, notice, pasteCancel, epoch: 0 };
  cells.push(cell);
  startupRetry.addEventListener("click", () => {
    startupRetry.disabled = true;
    vscode.postMessage({ type: "startupRetry", id: i, generation: cell.startupGeneration });
  });
  startupCancel.addEventListener("click", () => vscode.postMessage({ type: "startupCancel", id: i, generation: cell.startupGeneration }));

  // Ctrl+Wheel zoom — capture phase so it fires BEFORE xterm.js handles scroll
  cellDiv.addEventListener("wheel", (e: WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.deltaY < 0) {
      cell.zoom = Math.min(ZOOM_MAX, cell.zoom + ZOOM_STEP);
    } else {
      cell.zoom = Math.max(ZOOM_MIN, cell.zoom - ZOOM_STEP);
    }
    applyZoom(cell);
  }, { capture: true, passive: false });

  // Ctrl+0 reset zoom, Ctrl+C copy when selection exists
  termContainer.addEventListener("paste", e => {
    selection.cancel();
    handleNativePaste(e, terminal, image => handlePaste(i, image));
  }, true);

  terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
    if (handleClipboardKey(e, terminal, msg => postClipboard(i, msg), () => handlePaste(i), selection)) return false;
    if (e.ctrlKey && e.type === "keydown" && e.key === "0") {
      cell.zoom = 100;
      applyZoom(cell);
      return false;
    }
    // Let VS Code handle F-keys and common shortcuts
    if (e.type === "keydown") {
      // F1~F12
      if (e.key.match(/^F\d{1,2}$/)) return false;
      // Ctrl+Shift+P, Ctrl+P, Ctrl+Shift+`, Ctrl+B, Ctrl+J, Ctrl+,
      if (e.ctrlKey && e.shiftKey && (e.key === "P" || e.key === "p" || e.key === "`")) return false;
      if (e.ctrlKey && !e.shiftKey && (e.key === "p" || e.key === "b" || e.key === "j" || e.key === ",")) return false;
    }
    return true;
  });
}

function postClipboard(id: number, message: unknown): void {
  const notice = cells[id]!.notice;
  const requestId = (message as { requestId: string }).requestId;
  notice.dataset.copyRequest = requestId;
  notice.textContent = ui("Copying…");
  setTimeout(() => {
    if (notice.dataset.copyRequest === requestId) {
      delete notice.dataset.copyRequest;
      notice.textContent = ui("Copy failed. Selection kept; try again.");
    }
  }, 15000);
  vscode.postMessage({ ...(message as object), id });
}

// ── Context menu ──
const ctxMenu = document.getElementById("ctxMenu")!;
let ctxTargetId = -1;
let ctxSelection = "";

for (let i = 0; i < cells.length; i++) {
  if (!cells[i]) continue;
  cells[i]!.el.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ctxTargetId = i;
    ctxSelection = cells[i]?.selection.getSelection() ?? "";
    // Position off-screen, show to measure, then place correctly
    ctxMenu.style.left = "-9999px";
    ctxMenu.style.top = "-9999px";
    ctxMenu.classList.add("show");
    const menuRect = ctxMenu.getBoundingClientRect();
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuRect.width > window.innerWidth) x = Math.max(0, x - menuRect.width);
    if (y + menuRect.height > window.innerHeight) y = Math.max(0, y - menuRect.height);
    ctxMenu.style.left = x + "px";
    ctxMenu.style.top = y + "px";
  });
}

function handlePaste(cellId: number, image?: Blob): void {
  const cell = cells[cellId];
  if (!cell) return;
  cell.selection.cancel();
  const requestId = cell.inputQueue.beginPaste();
  const post = (msg: unknown): void => vscode.postMessage(msg);
  if (image) void sendImage(image, cellId, post, requestId).catch(() => post({ type: "pasteRequest", id: cellId, requestId }));
  else void requestPaste(cellId, post, requestId);
}

document.addEventListener("click", () => {
  ctxMenu.classList.remove("show");
});

ctxMenu.addEventListener("click", (e: Event) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  if (!action || ctxTargetId < 0) return;
  ctxMenu.classList.remove("show");
  switch (action) {
    case "copy":
    case "copyPlain": {
      const terminal = cells[ctxTargetId]?.terminal;
      // xterm already joins soft-wrapped lines and respects selection columns/wide glyphs.
      if (terminal) {
        const cell = cells[ctxTargetId]!;
        const text = ctxSelection;
        copySelection(terminal, msg => postClipboard(ctxTargetId, msg), text, () => { if (cell.selection.getSelection() === text) cell.selection.cancel(); });
        terminal.focus();
      }
      break;
    }
    case "paste":
      handlePaste(ctxTargetId);
      cells[ctxTargetId]?.terminal.focus();
      break;
    case "history":
    case "preview": {
      const cell = cells[ctxTargetId];
      if (cell) openTerminalHistory(cell.terminal, ctxSelection, message => vscode.postMessage(message),
        { initialView: action === "preview" ? "selection" : "history" });
      break;
    }
    case "clear":
      vscode.postMessage({ type: "clearTerminal", id: ctxTargetId });
      break;
    case "restart":
      vscode.postMessage({ type: "restartTerminal", id: ctxTargetId });
      break;
    case "kill":
      vscode.postMessage({ type: "killTerminal", id: ctxTargetId });
      break;
    case "rename":
      vscode.postMessage({ type: "renameCell", id: ctxTargetId });
      break;
  }
});

// ── Per-cell overrides ──
const cellOverrides: Record<number, { bgColor: string; fgColor: string; fontFamily: string; themeName: string; themeColors: Record<string, string> | null }> = {};

// Apply initial background override if set
applyBgOverride();

// ── Initial fit + notify extension ──
// Send ready immediately with default dims to start PTY spawning ASAP
vscode.postMessage({
  type: "ready",
  defaultCols: 80,
  defaultRows: 24,
  cellDims: Array.from({ length: total }, () => ({ cols: 80, rows: 24 })),
});

// Fit asynchronously and send accurate resize corrections
requestAnimationFrame(() => {
  for (const cell of cells) {
    if (!cell) continue;
    cell.viewport.fit();
  }
  // Re-fit after layout is fully settled, then send per-cell resize
  setTimeout(() => {
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i]) continue;
      cells[i]!.viewport.fit();
    }
  }, 100);
});

function buildCellTheme(cellId: number): ITheme {
  const ov = cellOverrides[cellId];
  if (!ov) return buildTheme();
  // If cell has its own theme, use that as base; otherwise use global theme
  const base = ov.themeColors !== undefined && ov.themeColors !== null
    ? buildThemeFromColors(ov.themeColors)
    : (ov.themeName === "" ? buildThemeFromColors(null) : buildTheme());
  // Apply per-cell bg/fg overrides on top
  if (ov.bgColor) {
    base.background = ov.bgColor;
    base.cursorAccent = ov.bgColor;
  }
  if (ov.fgColor) {
    base.foreground = ov.fgColor;
    base.cursor = ov.fgColor;
  }
  return base;
}

function applyCellBgOverride(cell: Cell, bg: string): void {
  if (!bg) {
    // Revert to global
    const globalBg = bgColorOverride;
    if (globalBg) {
      cell.el.style.background = globalBg;
      cell.el.querySelectorAll<HTMLElement>(".term-container, .xterm, .xterm-viewport, .xterm-screen").forEach(el => {
        el.style.backgroundColor = globalBg;
      });
    } else {
      cell.el.style.background = "";
      cell.el.querySelectorAll<HTMLElement>(".term-container, .xterm, .xterm-viewport, .xterm-screen").forEach(el => {
        el.style.backgroundColor = "";
      });
    }
    return;
  }
  cell.el.style.background = bg;
  cell.el.querySelectorAll<HTMLElement>(".term-container, .xterm, .xterm-viewport, .xterm-screen").forEach(el => {
    el.style.backgroundColor = bg;
  });
}

// ── Messages from extension ──
window.addEventListener("message", (event) => {
  const msg = event.data;
  switch (msg.type) {
    case "clipboardWriteResult": {
      const cell = cells[msg.id];
      if (cell && cell.notice.dataset.copyRequest === msg.requestId) {
        delete cell.notice.dataset.copyRequest;
        cell.notice.textContent = msg.success
          ? `${ui("Copied")}: ${msg.characters.toLocaleString()} ${ui("characters")}, ${msg.lines.toLocaleString()} ${ui("lines")}`
          : ui("Copy failed. Selection kept; try again.");
      }
      break;
    }
    case "inputProgress": {
      const cell = cells[msg.id];
      if (!cell) break;
      cell.pasteCancel.hidden = msg.done || !!msg.error;
      cell.notice.textContent = msg.error ? msg.error : msg.done ? ui("Paste sent") : `${ui("Pasting…")} ${Math.floor(msg.written / msg.total * 100)}%`;
      break;
    }
    case "cellStatus": {
      const cell = cells[msg.id];
      if (cell && msg.status?.state === "exited") {
        cell.notice.textContent = `${ui("Process exited")}${msg.status.exitCode !== undefined ? ` (${msg.status.exitCode})` : ""}${msg.status.error ? `: ${msg.status.error}` : ""}`;
        cell.pasteCancel.hidden = true;
      }
      break;
    }
    case "startupStatus": {
      const cell = cells[msg.id];
      if (!cell) break;
      cell.startup.hidden = !msg.text;
      cell.startupText.textContent = msg.text;
      cell.startupRetry.textContent = msg.retryLabel;
      cell.startupRetry.hidden = !msg.retry;
      cell.startupRetry.disabled = false;
      cell.startupCancel.textContent = msg.cancelLabel;
      cell.startupGeneration = msg.generation;
      break;
    }
    case "startupSnapshotRequest": {
      const cell = cells[msg.id];
      if (!cell) break;
      if (cell.selection.dragging) break; // A held display cannot authorize startup input.
      const epoch = cell.epoch;
      // A write callback runs after all preceding PTY output has been parsed by xterm.
      cell.terminal.write("", () => {
        if (cell.epoch !== epoch || cell.selection.dragging) return;
        vscode.postMessage({ type: "startupSnapshot", id: msg.id, generation: msg.generation, requestId: msg.requestId,
          snapshot: captureTerminalSnapshot(cell.terminal) });
      });
      break;
    }
    case "pasteText":
      if (msg.error && cells[msg.id]) {
        if (cells[msg.id]!.inputQueue.failPaste(msg.requestId)) cells[msg.id]!.notice.textContent = msg.error;
      } else if (typeof msg.text === "string") cells[msg.id]?.inputQueue.completePaste(msg.requestId, msg.text);
      break;
    case "output": {
      if (typeof msg.data === "string") cells[msg.id]?.selection.write(msg.data, () => {
        if (msg.outputSequence !== undefined) vscode.postMessage({ type: "outputAck", id: msg.id,
          outputSequence: msg.outputSequence, outputEpoch: msg.outputEpoch });
      });
      break;
    }
    case "endSelectionDrag":
      for (const cell of cells) cell?.selection.finishDrag();
      break;
    case "viewVisibility":
      for (const cell of cells) {
        if (msg.visible) cell?.viewport.resume();
        else cell?.viewport.suspend();
      }
      break;
    case "clear":
      cells[msg.id]?.selection.cancel();
      { const terminal = cells[msg.id]?.terminal; terminal?.write("", () => terminal.clear()); }
      break;
    case "reset":
      cells[msg.id]?.selection.reset();
      if (cells[msg.id]) { cells[msg.id]!.epoch++; cells[msg.id]!.startup.hidden = true; }
      cells[msg.id]?.inputQueue.reset();
      // Reset after old writes already in xterm, before any new-shell output.
      { const cell = cells[msg.id]; cell?.viewport.discard(); cell?.terminal.write("", () => {
        cell.terminal.reset(); cell.viewport.fit(true);
      }); }
      break;
    case "setLabels": {
      const labels: string[] = msg.labels || [];
      for (let i = 0; i < cells.length; i++) {
        if (!cells[i]) continue;
        cells[i]!.labelEl.textContent = labels[i] || `${i + 1}`;
      }
      break;
    }
    case "configUpdate":
      globalZoom = msg.zoom;
      fontFamilyOverride = msg.fontFamily;
      bgColorOverride = msg.bgColor || "";
      fgColorOverride = msg.fgColor || "";
      if (msg.themeName !== undefined) globalThemeName = msg.themeName;
      if (msg.themeColors !== undefined) globalThemeColors = msg.themeColors;
      {
        for (let ci = 0; ci < cells.length; ci++) {
          if (!cells[ci]) continue;
          if (typeof msg.scrollback === "number") cells[ci]!.terminal.options.scrollback = msg.scrollback;
          const ov = cellOverrides[ci];
          if (ov && (ov.bgColor || ov.fgColor || ov.fontFamily || ov.themeName)) {
            cells[ci]!.terminal.options.theme = buildCellTheme(ci);
            cells[ci]!.terminal.options.fontFamily = ov.fontFamily || getTermFontFamily();
          } else {
            cells[ci]!.terminal.options.theme = buildTheme();
            cells[ci]!.terminal.options.fontFamily = getTermFontFamily();
          }
          applyZoom(cells[ci]!);
        }
        // Apply bg: per-cell overrides take priority
        applyBgOverride();
        for (let ci = 0; ci < cells.length; ci++) {
          if (!cells[ci]) continue;
          const ov = cellOverrides[ci];
          if (ov?.bgColor || ov?.themeColors?.background) {
            applyCellBgOverride(cells[ci]!, ov.bgColor || ov.themeColors?.background || "");
          }
        }
      }
      break;
    case "loadFont": {
      const style = document.createElement("style");
      style.textContent = `@font-face { font-family: '${msg.name}'; src: url(data:font/${msg.format};base64,${msg.data}) format('${msg.format}'); font-display: swap; }`;
      document.head.appendChild(style);
      // Re-apply if this font is currently selected
      if (fontFamilyOverride === msg.name) {
        for (const cell of cells) {
          if (!cell) continue;
          cell.terminal.options.fontFamily = getTermFontFamily();
          cell.viewport.fit();
        }
      }
      break;
    }
    case "cellConfig": {
      const cell = cells[msg.id];
      if (!cell) break;
      cellOverrides[msg.id] = {
        bgColor: msg.bgColor || "",
        fgColor: msg.fgColor || "",
        fontFamily: msg.fontFamily || "",
        themeName: msg.themeName ?? "",
        themeColors: msg.themeColors ?? null,
      };
      cell.terminal.options.theme = buildCellTheme(msg.id);
      cell.terminal.options.fontFamily = msg.fontFamily || getTermFontFamily();
      cell.viewport.fit();
      applyCellBgOverride(cell, msg.bgColor || cellOverrides[msg.id]?.themeColors?.background || "");
      break;
    }
    case "clearCellOverrides": {
      // Reset all cells to global theme
      for (const key of Object.keys(cellOverrides)) {
        delete cellOverrides[parseInt(key)];
      }
      const globalTheme = buildTheme();
      const globalFf = getTermFontFamily();
      for (const cell of cells) {
        if (!cell) continue;
        cell.terminal.options.theme = globalTheme;
        cell.terminal.options.fontFamily = globalFf;
        cell.viewport.fit();
      }
      applyBgOverride();
      break;
    }
  }
});

// ── Grid border drag-resize (Excel-like) ──
function restoreFractions(value: number[] | undefined, count: number): number[] {
  return sameTab && Array.isArray(value) && value.length === count && value.every(n => Number.isFinite(n) && n >= 0.15 && n <= count * 10)
    ? [...value] : Array(count).fill(1);
}
const colFr = restoreFractions(restoredState?.colFr, cols);
const rowFr = restoreFractions(restoredState?.rowFr, rows);
const MIN_FR = 0.15;

function applyGridFractions(): void {
  grid.style.gridTemplateColumns = colFr.map(f => f + "fr").join(" ");
  grid.style.gridTemplateRows = rowFr.map(f => f + "fr").join(" ");
  saveViewState();
}

function createResizers(): void {
  grid.querySelectorAll(".grid-resizer").forEach(el => el.remove());
  // Column resizers (between each pair of adjacent columns)
  for (let c = 0; c < cols - 1; c++) {
    const handle = document.createElement("div");
    handle.className = "grid-resizer col-resizer";
    handle.dataset.col = String(c);
    grid.appendChild(handle);
    handle.addEventListener("pointerdown", (e) => startDrag(e, "col", c, handle));
    handle.addEventListener("dblclick", () => {
      colFr[c] = 1; colFr[c + 1] = 1;
      applyGridFractions(); positionResizers(); triggerFitAll();
    });
  }
  // Row resizers
  for (let r = 0; r < rows - 1; r++) {
    const handle = document.createElement("div");
    handle.className = "grid-resizer row-resizer";
    handle.dataset.row = String(r);
    grid.appendChild(handle);
    handle.addEventListener("pointerdown", (e) => startDrag(e, "row", r, handle));
    handle.addEventListener("dblclick", () => {
      rowFr[r] = 1; rowFr[r + 1] = 1;
      applyGridFractions(); positionResizers(); triggerFitAll();
    });
  }
  positionResizers();
}

function findCellInCol(c: number): Cell | null {
  for (let r = 0; r < rows; r++) {
    const cell = cells[r * cols + c];
    if (cell) return cell;
  }
  return null;
}
function findCellInRow(r: number): Cell | null {
  for (let c = 0; c < cols; c++) {
    const cell = cells[r * cols + c];
    if (cell) return cell;
  }
  return null;
}

function positionResizers(): void {
  if (cells.length === 0) return;
  // Column resizers: place at the right edge of column c
  grid.querySelectorAll<HTMLElement>(".col-resizer").forEach(el => {
    const c = parseInt(el.dataset.col!, 10);
    const cell = cells[c] || findCellInCol(c);
    if (!cell) { el.style.display = "none"; return; }
    el.style.display = "";
    const gridRect = grid.getBoundingClientRect();
    const cellRect = cell.el.getBoundingClientRect();
    el.style.left = (cellRect.right - gridRect.left - 3) + "px";
    el.style.top = "0";
    el.style.height = "100%";
  });
  // Row resizers: place at the bottom edge of row r
  grid.querySelectorAll<HTMLElement>(".row-resizer").forEach(el => {
    const r = parseInt(el.dataset.row!, 10);
    const cell = cells[r * cols] || findCellInRow(r);
    if (!cell) { el.style.display = "none"; return; }
    el.style.display = "";
    const gridRect = grid.getBoundingClientRect();
    const cellRect = cell.el.getBoundingClientRect();
    el.style.top = (cellRect.bottom - gridRect.top - 3) + "px";
    el.style.left = "0";
    el.style.width = "100%";
  });
}

function triggerFitAll(): void {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell) continue;
    cell.selection.finishDrag();
    cell.viewport.fit();
  }
}

function startDrag(e: PointerEvent, axis: "col" | "row", index: number, handle: HTMLElement): void {
  e.preventDefault();
  e.stopPropagation();
  const startPos = axis === "col" ? e.clientX : e.clientY;
  const frArr = axis === "col" ? colFr : rowFr;
  const totalPx = axis === "col" ? grid.clientWidth : grid.clientHeight;
  const sumFr = frArr.reduce((a, b) => a + b, 0);
  const startFrA = frArr[index];
  const startFrB = frArr[index + 1];
  handle.classList.add("active");
  document.body.classList.add(axis === "col" ? "resizing-col" : "resizing-row");

  let fitTimer: ReturnType<typeof setTimeout>;

  function onMove(ev: PointerEvent): void {
    const delta = (axis === "col" ? ev.clientX : ev.clientY) - startPos;
    const deltaFr = (delta / totalPx) * sumFr;
    let newA = startFrA + deltaFr;
    let newB = startFrB - deltaFr;
    // Clamp
    if (newA < MIN_FR) { newB += newA - MIN_FR; newA = MIN_FR; }
    if (newB < MIN_FR) { newA += newB - MIN_FR; newB = MIN_FR; }
    frArr[index] = newA;
    frArr[index + 1] = newB;
    applyGridFractions();
    positionResizers();
    // Debounced fit
    clearTimeout(fitTimer);
    fitTimer = setTimeout(triggerFitAll, 80);
  }

  function onUp(): void {
    handle.classList.remove("active");
    document.body.classList.remove("resizing-col", "resizing-row");
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    triggerFitAll();
  }

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerup", onUp);
}

// Create resizers after cells are built
applyGridFractions();
if (cols > 1 || rows > 1) {
  createResizers();
}

// ── Resize ──
let resizeTimer: ReturnType<typeof setTimeout>;
const ro = new ResizeObserver(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (!cell) continue;
      cell.viewport.fit();
    }
    positionResizers();
  }, 150);
});
ro.observe(grid);

// ── Watch for theme changes ──
const themeObserver = new MutationObserver(() => {
  for (let ci = 0; ci < cells.length; ci++) {
    if (!cells[ci]) continue;
    const ov = cellOverrides[ci];
    if (ov && (ov.bgColor || ov.fgColor || ov.fontFamily || ov.themeName)) {
      cells[ci]!.terminal.options.theme = buildCellTheme(ci);
      cells[ci]!.terminal.options.fontFamily = ov.fontFamily || getTermFontFamily();
    } else {
      cells[ci]!.terminal.options.theme = buildTheme();
      cells[ci]!.terminal.options.fontFamily = getTermFontFamily();
    }
    cells[ci]!.terminal.options.fontSize = calcFontSize(cells[ci]!.zoom);
    cells[ci]!.viewport.fit();
  }
});
themeObserver.observe(document.body, {
  attributes: true,
  attributeFilter: ["class", "data-vscode-theme-kind"],
});

window.addEventListener("blur", () => { for (const cell of cells) cell?.viewport.suspend(); });
window.addEventListener("focus", () => { for (const cell of cells) cell?.viewport.resume(); });
document.addEventListener("visibilitychange", () => {
  for (const cell of cells) {
    if (document.hidden) cell?.viewport.suspend(); else cell?.viewport.resume();
  }
});
