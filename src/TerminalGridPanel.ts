import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { BUILTIN_THEMES, resolveThemeColors } from "./themes";
import { panelRegistry, TabIdAllocator } from "./PanelRegistry";
import { tabState } from "./TabStateStore";
import { cellIdMapper } from "./CellIdMapper";
import { PtyWriteQueue } from "./PtyWriteQueue";
import { randomUUID } from "crypto";
import { compileStartupSteps } from "./StartupLaunch";
import type { StartupStep } from "./StartupLaunch";
import { ReadinessGate, classifyStartupScreen, startupComposerMatches } from "./StartupReadiness";
import { validateTerminalSnapshot } from "./TerminalSnapshot";
import { CellCommandQueue, buildCellInput, formatCellRead } from "./CellIo";
import type { CellDelivery, CellStatus, CellReadOptions, CellReadResult } from "./CellIo";
import { PtyOutputFlow } from "./PtyOutputFlow";
import type { TerminalSnapshot, ReadyState } from "./StartupReadiness";
export type { StartupStep } from "./StartupLaunch";

interface PtyLike {
  onData(cb: (data: string) => void): void;
  write(data: string): void;
  writeAsync?(data: string, progress?: (written: number, total: number) => void): Promise<void>;
  cancelInput?(interrupt?: boolean): void;
  status?: CellStatus;
  enter?: string;
  onExit?(cb: (status: CellStatus) => void): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  pause?(): void;
  resume?(): void;
}

interface TerminalInstance {
  id: number;
  pty: PtyLike;
}

interface StartupRun { steps: StartupStep[]; index: number; insideLlm: boolean; generation: number; paused: boolean; }

function stepsDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_STEP_DELAY = 3000;

/** Detect Windows build number. Win11 = 22000+, Win10 = below. */
const WIN_BUILD = (() => {
  if (process.platform !== "win32") return 0;
  const parts = os.release().split(".");
  return parseInt(parts[2] || "0", 10);
})();

/** LLM Enter: CSI U on Win11+ / non-Windows, plain CR on Win10 */
const LLM_ENTER = WIN_BUILD > 0 && WIN_BUILD < 22000 ? "\r" : "\x1b[13u";

/** Known LLM CLI commands — after these, subsequent steps use \n (LF) */
const LLM_CLI_PATTERNS = [
  "claude", "codex", "gemini", "copilot", "aider",
  "claude --dangerously-skip-permissions",
  "codex -s danger-full-access -a never",
];

function isLlmCommand(input: string): boolean {
  const trimmed = input.trim();
  return LLM_CLI_PATTERNS.some((p) => trimmed === p || trimmed.startsWith(p + " "));
}

const POLL_MS = 150;
const SETTLE_CAP_MS = 2500;
const QUIET_MS = process.platform === "win32" ? 450 : 300;
// Auto-accept applies only to recognized trust dialogs on the rendered screen.
const llmEnter = (csiU: boolean): string => (csiU ? LLM_ENTER : "\r");
const MODAL_RULES: { test: RegExp; accept: (csiU: boolean) => string }[] = [
  { test: /do you trust the files in this folder/i, accept: llmEnter },                                       // Claude Code
  { test: /do you trust the (files|contents) (in|of) this (directory|folder|workspace)/i, accept: llmEnter }, // Codex & variants
  { test: /\btrust (this|the) (folder|directory|workspace)\b/i, accept: llmEnter },                            // Gemini-ish
];

function resolveStartupSteps(
  cellOverrides: Record<number, { startupSteps?: StartupStep[]; startupCommand?: string; [k: string]: unknown }>,
  expandedCmds: string[],
  defaultSteps: StartupStep[],
  defaultCommand: string,
  cellId: number,
): StartupStep[] {
  const ov = cellOverrides[cellId];
  if (ov?.startupSteps && ov.startupSteps.length > 0) return ov.startupSteps;
  if (ov?.startupCommand) return [{ type: "command", input: ov.startupCommand }];
  if (expandedCmds[cellId]) return [{ type: "command", input: expandedCmds[cellId] }];
  if (defaultSteps.length > 0) return defaultSteps;
  if (defaultCommand) return [{ type: "command", input: defaultCommand }];
  return [];
}

interface CustomFont {
  name: string;
  path: string;
}

interface ShellDescriptor {
  name: string;
  path: string;
  args: string[];
}

const FONT_FORMATS: Record<string, string> = {
  ".ttf": "truetype",
  ".otf": "opentype",
  ".woff": "woff",
  ".woff2": "woff2",
};

export class TerminalGridPanel {
  private static _mcpEnvironment: Record<string, string> = {};

  public static setMcpEnvironment(windowId: string, port: number): void {
    TerminalGridPanel._mcpEnvironment = { TERMINAL_GRID_WINDOW_ID: windowId, TERMINAL_GRID_PORT: String(port) };
  }
  /** Active-tab accessor — returns the most recently focused panel. */
  public static get currentPanel(): TerminalGridPanel | undefined {
    return panelRegistry.getActive();
  }
  private static _nodePty: typeof import("node-pty") | null | undefined;
  private static _log: vscode.OutputChannel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private readonly _tabId: number;
  /** Global cell ids owned by this tab (sparse). Length = rows * cols. */
  private _cellIds: number[] = [];
  /** Listener that re-renders the editor-tab title when the tab order changes. */
  private _registryListener: vscode.Disposable | undefined;
  private _terminals: TerminalInstance[] = [];
  private _outputBuffers: string[] = [];
  private _droppedOutput: number[] = [];
  private _bracketedPaste: boolean[] = [];
  private _commandQueues = new Map<number, CellCommandQueue>();
  private _cellDimensions: { cols: number; rows: number }[] = [];
  private _outputFlows = new Map<number, { epoch: number; flow: PtyOutputFlow }>();
  private _outputEpoch = 0;
  private _csiUMode: boolean[] = [];            // Kitty keyboard protocol active per cell
  private _insideLlm: boolean[] = [];            // Cell is running an LLM CLI process
  private _cellShellType: string[] = [];          // Shell type per cell for EOL detection
  private _lastByteTs: number[] = [];            // last PTY-output timestamp per cell (settle clock)
  private _altScreen: boolean[] = [];            // cell is in the alt-screen buffer (TUI up)
  private _altDwellStart: number[] = [];         // when alt-screen was entered (dwell gate)
  private _stepWatermark: number[] = [];         // buffer offset marking the start of the current screen
  private _controlTail: string[] = [];           // incomplete escape sequence across PTY chunks
  private _startupSent: boolean[] = [];          // startup steps already triggered for this cell
  private static readonly OUTPUT_BUFFER_SIZE = 50000;
  private _disposed = false;
  private _stepGeneration: Record<number, number> = {};
  private _startupRuns = new Map<number, StartupRun>();
  private _startupPending = new Set<number>();
  private _startupLastStatus = new Map<number, string>();
  private _userInputVersion: Record<number, number> = {};
  private _snapshotSequence = 0;
  private _snapshotRequests = new Map<number, { cellId: number; generation: number; finish: (snapshot: TerminalSnapshot | null) => void }>();
  private _rows: number;
  private _cols: number;
  private _hiddenCells: Set<number>;
  private _configListener: vscode.Disposable | undefined;
  private _pasteImages: string[] = [];


  private static _getLog(): vscode.OutputChannel {
    if (!TerminalGridPanel._log) {
      TerminalGridPanel._log = vscode.window.createOutputChannel("Terminal Grid");
    }
    return TerminalGridPanel._log;
  }


  private static _getNodePty(): typeof import("node-pty") | null {
    if (TerminalGridPanel._nodePty === undefined) {
      try {
        TerminalGridPanel._nodePty = require("node-pty");
      } catch {
        TerminalGridPanel._nodePty = null;
      }
    }
    return TerminalGridPanel._nodePty as typeof import("node-pty") | null;
  }

  public static getAvailableShells(): ShellDescriptor[] {
    const shells: ShellDescriptor[] = [{ name: "IDE Default", path: "", args: [] }];
    try {
      const fs = require("fs") as typeof import("fs");
      const cp = require("child_process") as typeof import("child_process");
      const seen = new Set<string>();

      function shellExists(p: string): boolean {
        try {
          // Absolute path → check file
          if (/[/\\]/.test(p)) return fs.existsSync(p);
          // Bare name (e.g. "powershell.exe") → check via where/which
          const cmd = process.platform === "win32" ? `where ${p}` : `which ${p}`;
          cp.execSync(cmd, { stdio: "ignore", timeout: 500 });
          return true;
        } catch { return false; }
      }

      const platform = process.platform === "win32" ? "windows"
        : process.platform === "darwin" ? "osx" : "linux";
      const profiles = vscode.workspace.getConfiguration(
        `terminal.integrated.profiles.${platform}`
      );
      // Read VS Code terminal profiles
      if (profiles) {
        for (const name of Object.keys(profiles)) {
          try {
            const profile = profiles.get<{ path?: string | string[]; args?: string[] }>(name);
            if (!profile || typeof profile !== "object") continue;
            const shellPath = Array.isArray(profile.path) ? profile.path[0] : profile.path;
            if (shellPath && shellExists(shellPath)) {
              shells.push({ name, path: shellPath, args: profile.args || [] });
              seen.add(shellPath.toLowerCase());
            }
          } catch { /* skip invalid profile */ }
        }
      }
      // Merge well-known shells (skip duplicates, only if installed)
      const defaults: ShellDescriptor[] = process.platform === "win32" ? [
        { name: "PowerShell", path: "powershell.exe", args: ["-NoLogo"] },
        { name: "PowerShell 7", path: "pwsh.exe", args: ["-NoLogo"] },
        { name: "Command Prompt", path: "cmd.exe", args: [] },
        { name: "Git Bash", path: "C:\\Program Files\\Git\\bin\\bash.exe", args: ["--login"] },
        { name: "WSL", path: "wsl.exe", args: [] },
      ] : [
        { name: "Bash", path: "/bin/bash", args: ["--login"] },
        { name: "Zsh", path: "/bin/zsh", args: ["--login"] },
        { name: "Fish", path: "/usr/bin/fish", args: [] },
        { name: "sh", path: "/bin/sh", args: [] },
      ];
      for (const d of defaults) {
        if (!seen.has(d.path.toLowerCase()) && shellExists(d.path)) {
          shells.push(d);
          seen.add(d.path.toLowerCase());
        }
      }
    } catch { /* return at least IDE Default */ }
    return shells;
  }

  private _resolveShell(shellType?: string): { path: string; args: string[] } {
    if (!shellType) {
      // Current "auto" behavior
      if (process.platform === "win32") {
        if (TerminalGridPanel._getNodePty()) {
          return { path: "powershell.exe", args: ["-NoLogo", "-NoProfile"] };
        }
        return { path: process.env.COMSPEC || "cmd.exe", args: [] };
      }
      return { path: process.env.SHELL || "bash", args: [] };
    }
    // Look up from available shells
    const available = TerminalGridPanel.getAvailableShells();
    const match = available.find(s => s.path === shellType || s.name === shellType);
    if (match && match.path) {
      return { path: match.path, args: match.args };
    }
    // Direct path - infer args
    const lower = shellType.toLowerCase();
    if (lower.includes("powershell") || lower.includes("pwsh")) {
      return { path: shellType, args: ["-NoLogo"] };
    }
    if (lower.includes("bash") || lower.includes("zsh")) {
      return { path: shellType, args: ["--login"] };
    }
    return { path: shellType, args: [] };
  }

  public static createOrShow(
    context: vscode.ExtensionContext,
    rows: number,
    cols: number,
    options?: { forceNewTab?: boolean; tabIdOverride?: number; cellIdsOverride?: number[]; positionOverride?: number; preserveFocus?: boolean }
  ): number {
    // Replace-active path: reuse the active tab's id (and cellIds if size unchanged) so
    // customName/cellOverrides/labels are preserved and the sidebar entry keeps its slot.
    const active = !options?.forceNewTab ? panelRegistry.getActive() : null;

    let tabId: number;
    let cellIds: number[];
    let oldTabId: number | undefined;

    if (active) {
      oldTabId = active.getTabId();
      tabId = options?.tabIdOverride ?? oldTabId;
      const sameSize = active.getRows() * active.getCols() === rows * cols;
      cellIds = options?.cellIdsOverride
        ?? (sameSize ? active.getCellIds() : cellIdMapper.allocate(context, rows * cols));
    } else {
      // No active tab — explicit override > pending preset tabId > next from allocator
      if (options?.tabIdOverride !== undefined) {
        tabId = options.tabIdOverride;
      } else {
        const pending = context.workspaceState.get<number | undefined>("pendingFirstTabId");
        if (pending !== undefined && pending !== null) {
          tabId = pending;
          void context.workspaceState.update("pendingFirstTabId", undefined);
        } else if (options?.forceNewTab) {
          // Explicit "New Tab" → allocate a fresh id that is never reused.
          tabId = TabIdAllocator.next(context);
        } else {
          // Plain "Open" with no grid currently open → reuse tab 0, the default
          // namespace the sidebar binds to when nothing is open (the _tid fallback).
          // Without this, Open allocates a new id and reads an empty namespace, so
          // sidebar-configured merges/startup commands silently fail to apply.
          tabId = 0;
        }
      }
      cellIds = options?.cellIdsOverride ?? cellIdMapper.allocate(context, rows * cols);
    }

    // Reserve this id so the allocator never hands it out again — prevents a
    // later "New Tab" from colliding with a reused id (e.g. tab 0).
    TabIdAllocator.reserve(context, tabId);
    cellIdMapper.reserve(context, cellIds);

    const panel = vscode.window.createWebviewPanel(
      "terminalGrid",
      // Placeholder — title is set by refreshTitle() after register/replace fires onDidChange.
      vscode.l10n.t("Terminal Grid {0}×{1}", rows, cols),
      { viewColumn: vscode.ViewColumn.One, preserveFocus: options?.preserveFocus },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "media"),
        ],
      }
    );

    const instance = new TerminalGridPanel(panel, context, rows, cols, tabId, cellIds);

    if (active && oldTabId !== undefined) {
      // Atomic swap: single onDidChange fire, no flicker
      panelRegistry.replace(oldTabId, tabId, instance);
      active.dispose();  // panel-ref check in unregister keeps the new entry intact
    } else {
      panelRegistry.register(tabId, instance, options?.positionOverride);
    }
    TerminalGridPanel._persistTabs(context);
    return tabId;
  }

  public static revive(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    rows: number,
    cols: number,
    tabIdOverride?: number,
    cellIdsOverride?: number[]
  ): void {
    let replaceIdx: number | undefined;
    if (tabIdOverride === undefined) {
      const active = panelRegistry.getActive();
      if (active) {
        const activeTid = active.getTabId();
        const idx = panelRegistry.entries().findIndex(([tid]) => tid === activeTid);
        if (idx >= 0) replaceIdx = idx;
        active.dispose();
      }
    }
    const tabId = tabIdOverride ?? TabIdAllocator.next(context);
    TabIdAllocator.reserve(context, tabId);
    const cellIds = cellIdsOverride ?? cellIdMapper.allocate(context, rows * cols);
    cellIdMapper.reserve(context, cellIds);
    const instance = new TerminalGridPanel(panel, context, rows, cols, tabId, cellIds);
    panelRegistry.register(tabId, instance, replaceIdx);
    TerminalGridPanel._persistTabs(context);
    vscode.commands.executeCommand("terminalGrid._refreshSidebar");
  }

  /** Persist the current panel snapshot to lastTabs for multi-tab restore on VS Code restart.
   *  Public so extension.ts can force a re-sync after deserialize settles. */
  public static persistTabs(context: vscode.ExtensionContext): void {
    TerminalGridPanel._persistTabs(context);
  }

  private static _persistTabs(context: vscode.ExtensionContext): void {
    const snapshot = panelRegistry.entries().map(([tabId, p]) => ({
      tabId,
      rows: p.getRows(),
      cols: p.getCols(),
      cellIds: p.getCellIds(),
    }));
    void tabState.setLastTabs(snapshot);
    // Backward compat: keep lastGrid in sync with the most recent panel (used as fallback by old deserialize path).
    if (snapshot.length > 0) {
      const last = snapshot[snapshot.length - 1];
      void context.workspaceState.update("lastGrid", { rows: last.rows, cols: last.cols });
    }
  }

  /** Format webview panel title: `workspace — Terminal Grid 2×3 · Tab 2` (or user-assigned name).
   *  displayIdx is the zero-based position in panelRegistry.entries(); the rendered number
   *  matches the sidebar and MCP's one-based tabId.
   *  If customName is non-empty, it replaces the "Tab N" suffix.
   */
  private static _formatTitle(rows: number, cols: number, displayIdx: number, customName?: string): string {
    const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name;
    const base = vscode.l10n.t("Terminal Grid {0}×{1}", rows, cols);
    const tabSuffix = (customName && customName.length > 0)
      ? customName
      : vscode.l10n.t("Tab {0}", displayIdx + 1);
    return workspaceName
      ? `${workspaceName} — ${base} · ${tabSuffix}`
      : `${base} · ${tabSuffix}`;
  }

  /** Get the correct Enter sequence for a terminal cell.
   *  LLM TUI apps: CSI U on Win11+, plain CR on Win10. */
  private _enterSeq(id: number): string {
    if (this._csiUMode[id]) return LLM_ENTER;
    if (this._insideLlm[id]) return "\r";
    return this._terminals[id]?.pty.enter || "\r";
  }

  /** Broadcast text to all terminals */
  public broadcastInput(text: string): void {
    for (const t of this._terminals) {
      if (this._hiddenCells.has(t.id)) continue;
      void this.deliverToCell(t.id, text, true).then(result => this._showDeliveryFailure(result));
    }
  }

  /** Send text to a specific terminal cell */
  public sendToCell(cellId: number, text: string): boolean {
    const t = this._terminals[cellId];
    if (!t || this._hiddenCells.has(cellId) || t.pty.status?.state === "exited") return false;
    void this.deliverToCell(cellId, text, false).then(result => this._showDeliveryFailure(result));
    return true;
  }

  /** Send text + Enter to a specific terminal cell (auto-detects LLM / CSI u mode) */
  public sendInputToCell(cellId: number, text: string): boolean {
    const t = this._terminals[cellId];
    if (!t || this._hiddenCells.has(cellId) || t.pty.status?.state === "exited") return false;
    void this.deliverToCell(cellId, text, true).then(result => this._showDeliveryFailure(result));
    return true;
  }

  private _showDeliveryFailure(result: CellDelivery): void {
    if (!result.success && !this._disposed) void vscode.window.showWarningMessage(result.error || "Terminal input failed");
  }

  public getCellStatuses(): CellStatus[] {
    return this._terminals.map(t => this._hiddenCells.has(t.id)
      ? { state: "exited", error: "Cell is merged into another cell" }
      : { ...(t.pty.status ?? { state: "running" as const }) });
  }

  public async deliverToCell(cellId: number, text: string, submit: boolean): Promise<CellDelivery> {
    const pty = this._terminals[cellId]?.pty;
    const startup = this._startupRuns.get(cellId);
    const starting = this._startupPending?.has(cellId) || (startup && !startup.paused);
    if (!pty || this._hiddenCells.has(cellId) || pty.status?.state === "exited" || this._disposed || starting) {
      return { success: false, delivery: "failed", characters: text.length, submitted: false,
        completedAt: new Date().toISOString(), error: starting
          ? "Startup commands are still running; wait or stop startup before sending input"
          : "Cell is unavailable or its process has exited" };
    }
    if (startup?.paused) { this._stepGeneration[cellId]++; this._startupRuns.delete(cellId); this._setStartupStatus(cellId, "", false); }
    let queue = this._commandQueues.get(cellId);
    if (!queue) { queue = new CellCommandQueue(); this._commandQueues.set(cellId, queue); }
    return queue.enqueue(text.length, submit, async assertActive => {
      assertActive();
      if (this._terminals[cellId]?.pty !== pty || pty.status?.state === "exited") throw new Error("Cell process changed");
      this._userInputVersion[cellId] = (this._userInputVersion[cellId] || 0) + 1;
      const packet = buildCellInput(text, { submit, bracketedPaste: this._bracketedPaste[cellId] || false, enter: this._enterSeq(cellId) });
      if (pty.writeAsync) await pty.writeAsync(packet); else pty.write(packet);
      assertActive();
      if (submit && isLlmCommand(text)) this._insideLlm[cellId] = true;
      if (submit && text.trim() === "exit") this._insideLlm[cellId] = false;
    });
  }

  public async readCellSnapshot(cellId: number, options: CellReadOptions = {}): Promise<CellReadResult | null> {
    if (!this._terminals[cellId] || this._hiddenCells.has(cellId)) return null;
    const state = this.getCellStatuses()[cellId];
    if (options.mode === "history") {
      return formatCellRead({ lines: TerminalGridPanel._stripAnsi(this._outputBuffers[cellId] || "").split("\n"),
        mode: "history", requestedLines: options.lines, droppedCharacters: this._droppedOutput[cellId], lastOutputAt: this._lastByteTs[cellId], state });
    }
    if (options.lines === 0) return formatCellRead({ lines: [], mode: "screen", lastOutputAt: this._lastByteTs[cellId], state });
    const snapshot = await this._requestSnapshot(cellId, this._stepGeneration[cellId]);
    if (!snapshot) throw new Error("Current screen is unavailable while the view is loading or a selection is being dragged. Retry, or request mode: history.");
    return formatCellRead({ lines: snapshot.lines, mode: "screen", requestedLines: options.lines,
      lastOutputAt: this._lastByteTs[cellId], state, cursor: { x: snapshot.cursorX, y: snapshot.cursorY } });
  }

  /** Read recent output from a specific terminal cell */
  /** Strip ANSI escape sequences from raw PTY output */
  private static _stripAnsi(s: string): string {
    return s
      .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "")   // CSI sequences (colors, cursor, erase)
      .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, "") // OSC sequences
      .replace(/\x1b[()][0-9A-Z]/g, "")           // Character set selection
      .replace(/\x1b[78DEHM]/g, "")               // Single-char escapes
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "") // Control chars (keep \t \n \r)
      .replace(/\r\n/g, "\n")                      // Normalize line endings
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n");                 // Collapse excessive blank lines
  }

  public readCell(cellId: number, lines?: number): string | null {
    if (this._hiddenCells.has(cellId)) return null;
    const buf = this._outputBuffers[cellId];
    if (buf === undefined) return null;
    const clean = TerminalGridPanel._stripAnsi(buf);
    if (lines === undefined) return clean;
    if (lines <= 0) return "";
    const allLines = clean.split("\n");
    return allLines.slice(-lines).join("\n");
  }

  /** Get total number of terminal cells */
  public getCellCount(): number {
    return this._terminals.length;
  }

  /** Get grid row count */
  public getRows(): number {
    return this._rows;
  }

  /** Get grid column count */
  public getCols(): number {
    return this._cols;
  }

  /** Get cell labels */
  public getCellLabels(): string[] {
    const labels = tabState.getCellLabels(this._tabId);
    const total = this._rows * this._cols;
    return Array.from({ length: total }, (_, i) => labels[i] || String(i + 1));
  }

  /** Send per-cell config to webview */
  public sendCellConfig(cellId: number, bgColor: string, fgColor: string, fontFamily: string, themeName?: string, themeColors?: Record<string, string> | null): void {
    this._panel.webview.postMessage({ type: "cellConfig", id: cellId, bgColor, fgColor, fontFamily, themeName: themeName ?? "", themeColors: themeColors ?? null });
  }

  /** Clear all per-cell overrides in webview */
  public clearCellOverrides(): void {
    this._panel.webview.postMessage({ type: "clearCellOverrides" });
  }

  /** Send current cell labels to webview */
  public sendLabels(): void {
    const labels = tabState.getCellLabels(this._tabId);
    this._panel.webview.postMessage({ type: "setLabels", labels });
  }

  /** Send custom font data to an open terminal panel */
  public loadCustomFonts(fonts: CustomFont[]): void {
    for (const font of fonts) {
      const data = this._readFontBase64(font.path);
      if (data) {
        const ext = path.extname(font.path).toLowerCase();
        this._panel.webview.postMessage({
          type: "loadFont",
          name: font.name,
          data,
          format: FONT_FORMATS[ext] || "truetype",
        });
      }
    }
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    rows: number,
    cols: number,
    tabId: number,
    cellIds: number[]
  ) {
    this._panel = panel;
    this._context = context;
    this._rows = rows;
    this._cols = cols;
    this._tabId = tabId;
    this._cellIds = cellIds;

    // Title placeholder — the post-register onDidChange fire (and any later tab churn)
    // routes through refreshTitle() so the editor tab shows the 1-based display index.
    this._panel.title = vscode.l10n.t("Terminal Grid {0}×{1}", rows, cols);
    this._registryListener = panelRegistry.onDidChange(() => {
      if (this._disposed) return;
      this.refreshTitle();
    });

    // Compute hidden cells from merge regions
    const mergedRegions = tabState.getMergedRegions(tabId)
      .filter(m => m.startRow + m.rowSpan <= rows && m.startCol + m.colSpan <= cols);
    this._hiddenCells = new Set<number>();
    for (const m of mergedRegions) {
      for (let r = m.startRow; r < m.startRow + m.rowSpan; r++) {
        for (let c = m.startCol; c < m.startCol + m.colSpan; c++) {
          if (r === m.startRow && c === m.startCol) continue;
          this._hiddenCells.add(r * cols + c);
        }
      }
    }

    // Ensure webview options use current extensionUri (path changes on update)
    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "media"),
      ],
    };

    this._panel.webview.html = this._getHtml();

    this._panel.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case "selectionDrag": {
          // Pause the stream itself while dragging so a noisy process cannot grow an
          // unbounded webview queue. Mouseup/blur resumes it immediately.
          if (msg.paused === true && this._panel.active) {
            this._userInputVersion[msg.id] = (this._userInputVersion[msg.id] || 0) + 1;
            this._outputFlows.get(msg.id)?.flow.selectionPaused(true);
          } else if (msg.paused === false || msg.paused === true) {
            this._outputFlows.get(msg.id)?.flow.selectionPaused(false);
            if (msg.paused === true) this._panel.webview.postMessage({ type: "endSelectionDrag" });
          }
          break;
        }
        case "outputAck": {
          const output = this._outputFlows.get(msg.id);
          if (output && output.epoch === msg.outputEpoch) output.flow.acknowledge(msg.outputSequence);
          break;
        }
        case "startupSnapshot":
          this._receiveSnapshot(msg);
          break;
        case "startupRetry": {
          const run = this._startupRuns.get(msg.id);
          if (run?.paused && run.generation === msg.generation) {
            run.paused = false;
            void this._runStartup(msg.id, run);
          }
          break;
        }
        case "startupCancel":
          if (this._stepGeneration[msg.id] === msg.generation) {
            this._stepGeneration[msg.id]++;
            this._startupRuns.delete(msg.id);
            this._setStartupStatus(msg.id, "", false);
          }
          break;
        case "userActivity":
          this._userInputVersion[msg.id] = (this._userInputVersion[msg.id] || 0) + 1;
          break;
        case "ready":
          this._createTerminals(msg.defaultCols, msg.defaultRows);
          // Apply per-cell dimensions if available
          if (msg.cellDims && Array.isArray(msg.cellDims)) {
            for (let i = 0; i < msg.cellDims.length && i < this._terminals.length; i++) {
              const d = msg.cellDims[i] as { cols: number; rows: number };
              if (Number.isInteger(d?.cols) && Number.isInteger(d?.rows) && d.cols >= 2 && d.rows >= 1 && d.cols <= 4000 && d.rows <= 500) {
                this._cellDimensions[i] = { cols: d.cols, rows: d.rows };
                try { this._terminals[i].pty.resize(d.cols, d.rows); } catch { /* ignore */ }
              }
            }
          }
          // Load custom fonts into webview
          this.loadCustomFonts(
            this._context.globalState.get<CustomFont[]>("customFonts", [])
          );
          // Apply stored per-cell overrides
          const cellOverrides = tabState.getCellOverrides(this._tabId);
          for (const [id, ov] of Object.entries(cellOverrides)) {
            if (ov.bgColor || ov.fgColor || ov.fontFamily || ov.themeName) {
              const tc = ov.themeName ? resolveThemeColors(ov.themeName) : null;
              this.sendCellConfig(parseInt(id), ov.bgColor || "", ov.fgColor || "", ov.fontFamily || "", ov.themeName || "", tc);
            }
          }
          break;
        case "input": {
          if (typeof msg.data !== "string") break;
          this._userInputVersion[msg.id] = (this._userInputVersion[msg.id] || 0) + 1;
          const pty = this._terminals[msg.id]?.pty;
          if (msg.data === "\x03") { this._cancelCellInput(msg.id, true); break; }
          if (pty) {
            let lastProgress = 0;
            const progress = msg.data.length > 4096 ? (written: number, total: number): void => {
              if (written !== total && Date.now() - lastProgress < 100) return;
              lastProgress = Date.now();
              this._panel.webview.postMessage({ type: "inputProgress", id: msg.id, written, total, done: written === total });
            } : undefined;
            try {
              if (pty.writeAsync) await pty.writeAsync(msg.data, progress); else this._chunkedWrite(pty, msg.data);
            } catch (error) {
              this._panel.webview.postMessage({ type: "inputProgress", id: msg.id, done: true, error: error instanceof Error ? error.message : "Input failed" });
            }
          }
          break;
        }
        case "cancelInput":
          this._cancelCellInput(msg.id, true);
          break;
        case "clipboardWrite":
          if (typeof msg.text === "string") {
            try {
              await vscode.env.clipboard.writeText(msg.text);
              let characters = 0; for (const _ of msg.text) characters++;
              this._panel.webview.postMessage({ type: "clipboardWriteResult", id: msg.id, requestId: msg.requestId, success: true,
                characters, lines: msg.text.split(/\r?\n/).length });
            } catch {
              this._panel.webview.postMessage({ type: "clipboardWriteResult", id: msg.id, requestId: msg.requestId, success: false,
                error: vscode.l10n.t("Could not write to the clipboard.") });
              void vscode.window.showWarningMessage(vscode.l10n.t("Could not write to the clipboard."));
            }
          }
          break;
        case "exportText": {
          if (typeof msg.text !== "string" || msg.text.length > 32 * 1024 * 1024) break;
          const file = await vscode.window.showSaveDialog({ filters: { Text: ["txt"] },
            defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || os.homedir(), "terminal-grid-history.txt")) });
          if (file) {
            try { await vscode.workspace.fs.writeFile(file, Buffer.from(msg.text, "utf8")); }
            catch { void vscode.window.showWarningMessage(vscode.l10n.t("Could not save terminal history.")); }
          }
          break;
        }
        case "pasteRequest": {
          const target = this._terminals[msg.id];
          if (!target) break;
          try {
            const text = await vscode.env.clipboard.readText();
            if (!this._disposed && target === this._terminals[msg.id]) {
              // xterm owns newline normalization and the application's bracketed-paste mode.
              this._panel.webview.postMessage({ type: "pasteText", id: msg.id, text, requestId: msg.requestId });
            }
          } catch {
            this._panel.webview.postMessage({ type: "pasteText", id: msg.id, text: "", requestId: msg.requestId, error: vscode.l10n.t("Could not read the clipboard.") });
            void vscode.window.showWarningMessage(vscode.l10n.t("Could not read the clipboard."));
          }
          break;
        }
        case "pasteImage": {
          const match = typeof msg.data === "string" && msg.data.length <= 32 * 1024 * 1024
            ? msg.data.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/) : null;
          if (match && this._terminals[msg.id]) {
            const ext = match[1] === "jpeg" ? "jpg" : match[1];
            const filePath = path.join(os.tmpdir(), `tg-paste-${randomUUID()}.${ext}`);
            try {
              fs.writeFileSync(filePath, Buffer.from(match[2], "base64"), { flag: "wx", mode: 0o600 });
              // Retain every pasted image until this panel closes; an earlier prompt may still use it.
              this._pasteImages.push(filePath);
              const text = /\s/.test(filePath) ? `"${filePath}"` : filePath;
              this._panel.webview.postMessage({ type: "pasteText", id: msg.id, text, requestId: msg.requestId });
            } catch {
              this._panel.webview.postMessage({ type: "pasteText", id: msg.id, text: "", requestId: msg.requestId, error: vscode.l10n.t("Could not paste the clipboard image.") });
              void vscode.window.showWarningMessage(vscode.l10n.t("Could not paste the clipboard image."));
            }
          } else {
            this._panel.webview.postMessage({ type: "pasteText", id: msg.id, text: "", requestId: msg.requestId, error: vscode.l10n.t("Could not paste the clipboard image.") });
          }
          break;
        }
        case "resize":
          try {
            if (!Number.isInteger(msg.cols) || !Number.isInteger(msg.rows) || msg.cols < 2 || msg.rows < 1 || msg.cols > 4000 || msg.rows > 500) break;
            this._cellDimensions[msg.id] = { cols: msg.cols, rows: msg.rows };
            this._terminals[msg.id]?.pty.resize(msg.cols, msg.rows);
          } catch {
            // resize may fail if process exited
          }
          break;
        case "clearTerminal":
          this._panel.webview.postMessage({ type: "clear", id: msg.id });
          break;
        case "killTerminal":
          try {
            this._terminals[msg.id]?.pty.kill();
          } catch {
            // ignore
          }
          break;
        case "restartTerminal":
          this._restartTerminal(msg.id);
          break;
        case "renameCell": {
          const labels = tabState.getCellLabels(this._tabId);
          const current = labels[msg.id] || "";
          const newName = await vscode.window.showInputBox({
            prompt: vscode.l10n.t("Rename cell {0}", msg.id + 1),
            value: current,
            placeHolder: vscode.l10n.t("Enter alias (empty to reset)"),
          });
          if (newName !== undefined) {
            labels[msg.id] = newName;
            await tabState.setCellLabels(this._tabId, labels);
            this.sendLabels();
            vscode.commands.executeCommand("terminalGrid._refreshSidebar");
          }
          break;
        }
      }
    });

    // Watch for config changes
    this._configListener = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminalGrid")) {
        const cfg = vscode.workspace.getConfiguration("terminalGrid");
        const themeName = cfg.get<string>("colorTheme", "");
        this._panel.webview.postMessage({
          type: "configUpdate",
          zoom: cfg.get<number>("zoomPercent", 100),
          scrollback: cfg.get<number>("scrollback", 20000),
          fontFamily: cfg.get<string>("fontFamily", ""),
          bgColor: cfg.get<string>("backgroundColor", ""),
          fgColor: cfg.get<string>("foregroundColor", ""),
          themeName,
          themeColors: resolveThemeColors(themeName),
        });
      }
    });

    this._panel.onDidDispose(() => this.dispose());

    this._panel.onDidChangeViewState((e) => {
      if (this._disposed) return;
      this._panel.webview.postMessage({ type: "viewVisibility", visible: e.webviewPanel.visible });
      if (e.webviewPanel.active) {
        panelRegistry.setActive(this._tabId);
        vscode.commands.executeCommand("terminalGrid._refreshSidebar");
      } else {
        this._panel.webview.postMessage({ type: "endSelectionDrag" });
        for (const output of this._outputFlows.values()) output.flow.selectionPaused(false);
      }
    });

    this._panel.iconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "images",
      "sidebar.svg"
    );
  }

  /** Public accessor for this panel's tab id. */
  public getTabId(): number {
    return this._tabId;
  }

  /** Public accessor for this panel's global cell ids (length = rows * cols). */
  public getCellIds(): number[] {
    return this._cellIds.slice();
  }

  public getHiddenCellIds(): number[] {
    return [...this._hiddenCells].map(id => this._cellIds[id]);
  }

  /** Bring this panel into focus. */
  public reveal(): void {
    this._panel.reveal(this._panel.viewColumn ?? vscode.ViewColumn.One);
  }

  /** Refresh the editor-tab title to reflect the current 1-based display index (matches sidebar)
   *  and any user-assigned custom name. Called by the registry listener AND directly after rename. */
  public refreshTitle(): void {
    if (this._disposed) return;
    const entries = panelRegistry.entries();
    const idx = entries.findIndex(([tid]) => tid === this._tabId);
    // If not yet registered, assume we will be appended last
    const displayIdx = idx >= 0 ? idx : entries.length;
    const customName = tabState.getTabName(this._tabId);
    this._panel.title = TerminalGridPanel._formatTitle(this._rows, this._cols, displayIdx, customName);
  }

  private _readFontBase64(fontPath: string): string | null {
    try {
      const buf = fs.readFileSync(fontPath);
      return buf.toString("base64");
    } catch {
      return null;
    }
  }

  private _spawnPty(
    nodePty: typeof import("node-pty") | null,
    cols: number, rows: number, cwd: string,
    shellType?: string
  ): PtyLike {
    try { return this._spawnPtyProcess(nodePty, cols, rows, cwd, shellType); }
    catch (error) {
      const status: CellStatus = { state: "exited", error: error instanceof Error ? error.message : String(error) };
      return { status, onData() {}, write() {}, resize() {}, kill() {}, onExit: cb => cb(status),
        writeAsync: async () => { throw new Error(status.error); } };
    }
  }

  private _spawnPtyProcess(
    nodePty: typeof import("node-pty") | null,
    cols: number, rows: number, cwd: string,
    shellType?: string
  ): PtyLike {
    const resolved = this._resolveShell(shellType);
    const env = { ...process.env, ...TerminalGridPanel._mcpEnvironment } as Record<string, string>;
    const status: CellStatus = { state: "running" };
    const exits = new Set<(status: CellStatus) => void>();
    const finish = (details: Partial<CellStatus> = {}): void => {
      if (status.state === "exited") return;
      Object.assign(status, details, { state: "exited" });
      for (const cb of exits) cb({ ...status });
    };
    const onExit = (cb: (status: CellStatus) => void): void => {
      exits.add(cb); if (status.state === "exited") cb({ ...status });
    };
    if (nodePty) {
      const proc = nodePty.spawn(resolved.path, resolved.args, {
        name: "xterm-256color",
        cols, rows, cwd,
        env,
      });
      const writer = new PtyWriteQueue(data => proc.write(data), error => finish({ error: String(error) }));
      proc.onExit(event => { writer.dispose(); finish({ exitCode: event.exitCode, signal: event.signal }); });
      return {
        status, onExit,
        onData: (cb) => { proc.onData(cb); },
        write: (data) => writer.write(data),
        writeAsync: (data, progress) => writer.writeAsync(data, progress),
        cancelInput: interrupt => writer.cancel("Input cancelled", interrupt),
        resize: (c, r) => proc.resize(c, r),
        pause: () => { proc.pause(); },
        resume: () => { proc.resume(); },
        kill: () => { writer.dispose(); finish(); proc.kill(); },
      };
    }
    // Fallback: child_process.spawn
    const { spawn } = require("child_process") as typeof import("child_process");
    const proc = spawn(resolved.path, resolved.args, { cwd, env, windowsHide: true });
    const writer = new PtyWriteQueue(data => {
      if (!proc.stdin?.writable) throw new Error("Shell input is closed");
      if (proc.stdin.writableLength > 8 * 1024 * 1024) throw new Error("Shell input is not draining; input cancelled");
      proc.stdin.write(data);
    }, error => finish({ error: String(error) }));
    proc.on("exit", (exitCode, signal) => { writer.dispose(); finish({ exitCode: exitCode ?? undefined, signal: signal ?? undefined }); });
    proc.on("error", error => { writer.dispose(); finish({ error: error.message }); });
    proc.stdin?.on("error", error => { writer.dispose(); finish({ error: error.message }); });
    return {
      status, onExit,
      enter: process.platform === "win32" ? "\r\n" : "\n",
      onData: (cb) => {
        proc.stdout?.on("data", (d: Buffer) => cb(d.toString()));
        proc.stderr?.on("data", (d: Buffer) => cb(d.toString()));
      },
      write: (data) => writer.write(data),
      writeAsync: (data, progress) => writer.writeAsync(data, progress),
      cancelInput: interrupt => writer.cancel("Input cancelled", interrupt),
      resize: () => {},
      pause: () => { proc.stdout?.pause(); proc.stderr?.pause(); },
      resume: () => { proc.stdout?.resume(); proc.stderr?.resume(); },
      kill: () => { writer.dispose(); finish(); proc.kill(); },
    };
  }

  private _createTerminals(defaultCols: number, defaultRows: number): void {
    const cwd =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
      process.env.USERPROFILE ||
      process.env.HOME ||
      ".";

    const total = this._rows * this._cols;
    const nodePty = TerminalGridPanel._getNodePty();
    if (!nodePty) {
      vscode.window.showWarningMessage(
        vscode.l10n.t("node-pty not available. Falling back to basic shell (limited features).")
      );
    }

    // Resolve per-cell startup commands (backward compat: old startupCommands list)
    const rawCmds = tabState.getStartupCommands(this._tabId);
    const expandedCmds: string[] = [];
    for (const item of rawCmds) {
      if (typeof item === "string") {
        expandedCmds.push(item);
      } else if (item && typeof item === "object" && "command" in item) {
        const sc = item as { command: string; count: number };
        for (let j = 0; j < (sc.count || 1); j++) {
          expandedCmds.push(sc.command);
        }
      }
    }
    const defaultCommand = tabState.getDefaultCommand(this._tabId);
    const defaultSteps = tabState.getDefaultSteps(this._tabId);

    const c = defaultCols || 80;
    const r = defaultRows || 24;

    const globalShell = vscode.workspace.getConfiguration("terminalGrid").get<string>("shellType", "");
    const cellOverrides = tabState.getCellOverrides(this._tabId) as Record<number, { shellType?: string; startupCommand?: string; startupSteps?: StartupStep[] }>;

    // Spawn + wire handler immediately per cell (handler must be registered
    // before the first PTY output arrives, so spawn and onData stay together)
    for (let i = 0; i < total; i++) {
      // Skip hidden cells (absorbed by merge)
      if (this._hiddenCells.has(i)) {
        const noopPty: PtyLike = { status: { state: "exited" }, onData() {}, write() {}, resize() {}, kill() {} };
        this._terminals.push({ id: i, pty: noopPty });
        this._cellShellType[i] = "";
        this._resetCellState(i, true);
        continue;
      }
      const cellShell = cellOverrides[i]?.shellType || globalShell || "";
      const pty = this._spawnPty(nodePty, c, r, cwd, cellShell || undefined);
      const id = i;
      const steps = resolveStartupSteps(cellOverrides, expandedCmds, defaultSteps, defaultCommand, i);
      this._cellShellType[id] = cellShell;
      this._resetCellState(id);
      if (steps.length) this._startupPending.add(id);
      pty.onData((data: string) => {
        if (this._terminals[id]?.pty === pty) this._handlePtyData(id, data, steps);
      });
      this._terminals.push({ id: i, pty });
      this._cellDimensions[id] = { cols: c, rows: r };
      this._watchTerminal(id, pty);
    }

    // Send cell labels
    this.sendLabels();
  }

  private _restartTerminal(id: number): void {
    const t = this._terminals[id];
    if (!t || this._hiddenCells.has(id)) return;

    // Kill old PTY
    try { t.pty.kill(); } catch { /* ignore */ }

    // Reset the webview terminal (full clear + reset state)
    this._panel.webview.postMessage({ type: "reset", id });

    const cwd =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
      process.env.USERPROFILE ||
      process.env.HOME ||
      ".";

    const globalShell = vscode.workspace.getConfiguration("terminalGrid").get<string>("shellType", "");
    const cellOverrides = tabState.getCellOverrides(this._tabId) as Record<number, { shellType?: string; startupCommand?: string; startupSteps?: StartupStep[] }>;
    const cellShell = cellOverrides[id]?.shellType || globalShell || "";
    const dims = this._cellDimensions[id] || { cols: 80, rows: 24 };
    const pty = this._spawnPty(TerminalGridPanel._getNodePty(), dims.cols, dims.rows, cwd, cellShell || undefined);

    // Re-apply startup steps for this cell (backward compat: old startupCommands list)
    const rawCmds = tabState.getStartupCommands(this._tabId);
    const expanded: string[] = [];
    for (const item of rawCmds) {
      if (typeof item === "string") {
        expanded.push(item);
      } else if (item && typeof item === "object" && "command" in item) {
        const sc = item as { command: string; count: number };
        for (let j = 0; j < (sc.count || 1); j++) {
          expanded.push(sc.command);
        }
      }
    }
    const defaultCommand = tabState.getDefaultCommand(this._tabId);
    const defaultSteps = tabState.getDefaultSteps(this._tabId);
    const steps = resolveStartupSteps(cellOverrides, expanded, defaultSteps, defaultCommand, id);
    this._cellShellType[id] = cellShell;
    this._resetCellState(id);
    if (steps.length) this._startupPending.add(id);
    pty.onData((data: string) => {
      if (this._terminals[id]?.pty === pty) this._handlePtyData(id, data, steps);
    });

    this._terminals[id] = { id, pty };
    this._watchTerminal(id, pty);
  }

  private _watchTerminal(id: number, pty: PtyLike): void {
    const epoch = ++this._outputEpoch;
    const flow = new PtyOutputFlow({
      post: (data, outputSequence) => { this._panel.webview.postMessage({ type: "output", id, data, outputSequence, outputEpoch: epoch }); },
      pause: () => { try { pty.pause?.(); } catch { /* Process already exited. */ } },
      resume: () => { try { pty.resume?.(); } catch { /* Process already exited. */ } },
    });
    this._outputFlows.set(id, { epoch, flow });
    pty.onExit?.(status => {
      if (this._terminals[id]?.pty !== pty || this._disposed) return;
      this._commandQueues.get(id)?.dispose("Cell process exited");
      this._stepGeneration[id]++;
      this._startupRuns.delete(id); this._setStartupStatus(id, "", false);
      this._startupPending.delete(id);
      this._panel.webview.postMessage({ type: "cellStatus", id, status });
    });
  }

  private _cancelCellInput(id: number, interrupt: boolean): void {
    this._commandQueues.get(id)?.dispose("Input cancelled");
    this._commandQueues.delete(id);
    this._stepGeneration[id] = (this._stepGeneration[id] || 0) + 1;
    this._startupRuns.delete(id); this._setStartupStatus(id, "", false);
    this._startupPending?.delete(id); this._startupSent[id] = true;
    const pty = this._terminals[id]?.pty;
    if (pty?.cancelInput) pty.cancelInput(interrupt); else if (interrupt) pty?.write("\x03");
  }

  /** All PTY writes share the queue installed by _spawnPty. */
  private _chunkedWrite(pty: PtyLike, data: string): void {
    pty.write(data);
  }

  /** Raw output remains useful for history, but is never used to authorize startup input. */
  private _screen(cellId: number): string {
    const buf = this._outputBuffers[cellId] || "";
    return TerminalGridPanel._stripAnsi(buf.slice(Math.min(this._stepWatermark[cellId] || 0, buf.length)));
  }

  private _requestSnapshot(cellId: number, generation: number): Promise<TerminalSnapshot | null> {
    if (this._outputFlows?.get(cellId)?.flow.pendingCharacters) return Promise.resolve(null);
    if (this._disposed || this._stepGeneration[cellId] !== generation) return Promise.resolve(null);
    return new Promise(resolve => {
      const requestId = ++this._snapshotSequence;
      const finish = (snapshot: TerminalSnapshot | null): void => {
        clearTimeout(timer);
        this._snapshotRequests.delete(requestId);
        resolve(snapshot);
      };
      const timer = setTimeout(() => finish(null), 1500);
      this._snapshotRequests.set(requestId, { cellId, generation, finish });
      Promise.resolve(this._panel.webview.postMessage({ type: "startupSnapshotRequest", id: cellId, requestId, generation }))
        .catch(() => finish(null));
    });
  }

  private _receiveSnapshot(msg: { requestId: number; id: number; generation: number; snapshot?: TerminalSnapshot }): void {
    const request = this._snapshotRequests.get(msg.requestId);
    if (!request || request.cellId !== msg.id || request.generation !== msg.generation) return;
    const snapshot = msg.snapshot;
    const valid = validateTerminalSnapshot(snapshot);
    request.finish(valid && !this._disposed && !this._outputFlows?.get(msg.id)?.flow.pendingCharacters
      && this._stepGeneration[msg.id] === request.generation ? snapshot! : null);
  }

  private _setStartupStatus(cellId: number, text: string, retry: boolean): void {
    const generation = this._stepGeneration[cellId];
    const key = JSON.stringify([text, retry, generation]);
    if (this._startupLastStatus.get(cellId) === key) return;
    this._startupLastStatus.set(cellId, key);
    this._panel.webview.postMessage({ type: "startupStatus", id: cellId, text, retry, generation,
      retryLabel: vscode.l10n.t("Check again"), cancelLabel: vscode.l10n.t("Cancel startup") });
  }

  private _readinessText(state: ReadyState): string {
    switch (state) {
      case "picker": return vscode.l10n.t("Select a session in the terminal to continue.");
      case "trust": return vscode.l10n.t("Waiting for folder trust confirmation.");
      case "blocked": return vscode.l10n.t("Complete login or confirmation in the terminal.");
      case "busy": return vscode.l10n.t("Waiting for the CLI to finish its current operation.");
      case "occupied": return vscode.l10n.t("The input contains text. Clear or submit it before continuing.");
      case "ready": return vscode.l10n.t("Checking that the input is ready…");
      default: return vscode.l10n.t("Waiting for the CLI input to appear…");
    }
  }

  /** A quiet shell is enough before the first command. CLI input uses _waitForReady instead. */
  private async _settle(cellId: number, deadline: number): Promise<void> {
    const start = Date.now();
    while (Date.now() < deadline && !this._disposed) {
      if (Date.now() - (this._lastByteTs[cellId] || 0) >= QUIET_MS || Date.now() - start >= SETTLE_CAP_MS) return;
      await stepsDelay(POLL_MS);
    }
  }

  private async _waitForReady(cellId: number, autoAccept: boolean, generation: number): Promise<boolean> {
    const seconds = vscode.workspace.getConfiguration("terminalGrid").get<number>("startupReadyTimeout", 60);
    const deadline = Date.now() + Math.max(5, Math.min(300, seconds)) * 1000;
    const gate = new ReadinessGate();
    let acceptedTrust = "";
    let state: ReadyState = "starting";
    let lastActivity = this._userInputVersion[cellId];
    while (Date.now() < deadline && !this._disposed && this._stepGeneration[cellId] === generation) {
      const activity = this._userInputVersion[cellId];
      if (activity !== lastActivity) gate.observe({ lines: [], cursorX: 0, cursorY: 0 });
      lastActivity = activity;
      const snapshot = await this._requestSnapshot(cellId, generation);
      if (this._disposed || this._stepGeneration[cellId] !== generation) return false;
      if (snapshot) {
        const observation = gate.observe(snapshot);
        state = observation.state;
        this._setStartupStatus(cellId, this._readinessText(state), false);
        if (state === "trust" && autoAccept) {
          const screen = snapshot.lines.slice(Math.max(0, snapshot.cursorY - 8)).join("\n");
          const rule = MODAL_RULES.find(rule => rule.test.test(screen));
          if (rule && screen !== acceptedTrust && activity === this._userInputVersion[cellId]) {
            acceptedTrust = screen;
            this._terminals[cellId]?.pty.write(rule.accept(this._csiUMode[cellId]));
          }
        }
        if (activity !== this._userInputVersion[cellId]) gate.observe({ lines: [], cursorX: 0, cursorY: 0 });
        else if (observation.ready) return true;
      } else {
        gate.observe({ lines: [], cursorX: 0, cursorY: 0 });
      }
      await stepsDelay(POLL_MS);
    }
    if (!this._disposed && this._stepGeneration[cellId] === generation) {
      this._setStartupStatus(cellId, vscode.l10n.t("Startup paused: {0}", this._readinessText(state)), true);
    }
    return false;
  }

  /** Send once, verify the actual composer, then submit once. Uncertain input is left for the user. */
  private async _typeAndConfirm(cellId: number, text: string, generation: number): Promise<boolean> {
    const pty = this._terminals[cellId]?.pty;
    const activity = this._userInputVersion[cellId];
    const live = (): boolean => !this._disposed && this._stepGeneration[cellId] === generation
      && this._terminals[cellId]?.pty === pty && this._userInputVersion[cellId] === activity;
    if (!pty || /[\r\n]/.test(text)) return false;
    const before = await this._requestSnapshot(cellId, generation);
    if (!live() || !before || classifyStartupScreen(before) !== "ready") return false;
    for (const ch of text) {
      if (!live()) return false;
      pty.write(ch);
      await stepsDelay(20);
    }
    const deadline = Date.now() + 2500;
    while (Date.now() < deadline && live()) {
      const snapshot = await this._requestSnapshot(cellId, generation);
      if (!live()) return false;
      if (snapshot) {
        const row = snapshot.lines[snapshot.cursorY] || "";
        const prefix = row.match(/^\s*[│┃]?\s*(?:[›❯>]|aider>)\s?/);
        if (startupComposerMatches(snapshot, text)) {
          // A slash completion menu is allowed; trust/login/session pickers are never submitted here.
          const state = classifyStartupScreen(snapshot);
          if (!["trust", "blocked", "picker", "busy"].includes(state)) {
            pty.write(this._enterSeq(cellId));
            return true;
          }
        }
      }
      await stepsDelay(POLL_MS);
    }
    return false;
  }

  private async _executeSteps(cellId: number, steps: StartupStep[], shellType: string): Promise<void> {
    void shellType;
    const generation = this._stepGeneration[cellId] = (this._stepGeneration[cellId] || 0) + 1;
    const run: StartupRun = { steps: compileStartupSteps(steps), index: 0, insideLlm: false, generation, paused: false };
    this._startupRuns.set(cellId, run);
    await this._settle(cellId, Date.now() + 3000);
    await this._runStartup(cellId, run);
  }

  private async _runStartup(cellId: number, run: StartupRun): Promise<void> {
    const live = (): boolean => !this._disposed && this._stepGeneration[cellId] === run.generation;
    const autoAccept = vscode.workspace.getConfiguration("terminalGrid").get<boolean>("autoAcceptTrust", true);
    try {
      while (run.index < run.steps.length && live()) {
        const step = run.steps[run.index];
        if (step.type === "timeout") {
          this._setStartupStatus(cellId, vscode.l10n.t("Waiting {0} ms…", step.ms), false);
          await stepsDelay(step.ms);
        } else {
          if (run.insideLlm) {
            if (!await this._waitForReady(cellId, autoAccept, run.generation)) { run.paused = live(); return; }
            if (!live()) return;
            if (!await this._typeAndConfirm(cellId, step.input, run.generation)) {
              if (live()) {
                this._startupRuns.delete(cellId);
                this._setStartupStatus(cellId, vscode.l10n.t("Startup stopped: check the terminal input. No automatic retry was sent."), false);
              }
              return;
            }
          } else {
            if (run.index > 0 && run.steps[run.index - 1].type === "command") await stepsDelay(DEFAULT_STEP_DELAY);
            if (!live()) return;
            this._stepWatermark[cellId] = (this._outputBuffers[cellId] || "").length;
            this._terminals[cellId]?.pty.write(step.input + this._enterSeq(cellId));
          }
          if (isLlmCommand(step.input)) run.insideLlm = true;
          if (step.input.trim() === "exit") run.insideLlm = false;
          this._insideLlm[cellId] = run.insideLlm;
        }
        run.index++;
      }
      if (live()) { this._startupRuns.delete(cellId); this._setStartupStatus(cellId, "", false); }
    } catch (error) {
      if (live()) {
        this._startupRuns.delete(cellId);
        this._setStartupStatus(cellId, vscode.l10n.t("Startup stopped: check the terminal input. No automatic retry was sent."), false);
        TerminalGridPanel._getLog().appendLine(`[startup] cell ${cellId + 1}: ${String(error)}`);
      }
    }
  }

  /** Reset all per-cell runtime state for a (re)spawned cell. alreadyStarted=true for hidden cells. */
  private _resetCellState(id: number, alreadyStarted = false): void {
    this._startupPending?.delete(id);
    this._commandQueues?.get(id)?.dispose("Cell restarted");
    this._commandQueues?.delete(id);
    this._outputFlows?.get(id)?.flow.dispose();
    this._outputFlows?.delete(id);
    this._droppedOutput ??= []; this._droppedOutput[id] = 0;
    this._bracketedPaste ??= []; this._bracketedPaste[id] = false;
    this._stepGeneration[id] = (this._stepGeneration[id] || 0) + 1;
    this._startupRuns?.delete(id);
    this._startupLastStatus?.delete(id);
    this._userInputVersion[id] = 0;
    for (const request of this._snapshotRequests?.values() || []) {
      if (request.cellId === id) request.finish(null);
    }
    this._controlTail[id] = "";
    this._insideLlm[id] = false;
    this._csiUMode[id] = false;
    this._altScreen[id] = false;
    this._altDwellStart[id] = 0;
    this._lastByteTs[id] = 0;
    this._outputBuffers[id] = "";
    this._stepWatermark[id] = 0;
    this._startupSent[id] = alreadyStarted;
  }

  /** Single PTY data handler for every cell — tracks the settle clock, terminal mode (Kitty /
   *  alt-screen), the output buffer + current-screen watermark, and triggers startup steps on first
   *  output. Used by BOTH _createTerminals and _restartTerminal so the two paths can never drift. */
  private _handlePtyData(id: number, data: string, steps: StartupStep[]): void {
    if (this._disposed) return;
    const previous = this._outputBuffers[id] || "";
    const tail = this._controlTail[id] || "";
    const controls = tail + data;
    // Process complete sequences in order; a clear and its dialog often arrive in ONE chunk.
    for (const match of controls.matchAll(/\x1b\[(?:[>=]\d+(?:;\d+)*u|<\d*u|\?(?:1049|2004)[hl]|[23]J)/g)) {
      const sequence = match[0];
      if (/\[[>=]/.test(sequence)) this._csiUMode[id] = !/^\x1b\[[>=]0(?:;|u)/.test(sequence);
      else if (sequence.includes("<")) this._csiUMode[id] = false;
      else if (sequence.includes("2004")) { this._bracketedPaste ??= []; this._bracketedPaste[id] = sequence.endsWith("h"); }
      else {
        if (sequence === "\x1b[?1049h") { this._altScreen[id] = true; this._altDwellStart[id] = Date.now(); }
        if (sequence === "\x1b[?1049l") this._altScreen[id] = false;
        this._stepWatermark[id] = previous.length - tail.length + match.index! + sequence.length;
      }
    }
    this._controlTail[id] = controls.match(/\x1b(?:\[[0-9;?<=>]*)?$/)?.[0].slice(-64) || "";
    this._lastByteTs[id] = Date.now();
    const combined = previous + data;
    const dropped = Math.max(0, combined.length - TerminalGridPanel.OUTPUT_BUFFER_SIZE);
    this._droppedOutput ??= []; this._droppedOutput[id] = (this._droppedOutput[id] || 0) + dropped;
    this._outputBuffers[id] = combined.slice(dropped);
    this._stepWatermark[id] = Math.max(0, (this._stepWatermark[id] || 0) - dropped);
    const output = this._outputFlows?.get(id);
    if (output) output.flow.enqueue(data); else this._panel.webview.postMessage({ type: "output", id, data });
    if (!this._startupSent[id] && steps.length > 0) {
      this._startupPending?.delete(id);
      this._startupSent[id] = true;
      void this._executeSteps(id, steps, this._cellShellType[id] || "");
    }
  }

  public restartCell(id: number): void {
    this._restartTerminal(id);
  }

  public restartAllCells(): void {
    for (const t of this._terminals) {
      this._restartTerminal(t.id);
    }
  }

  public dispose(preserveState = false): void {
    if (this._disposed) return;
    this._disposed = true;
    for (const queue of this._commandQueues.values()) queue.dispose("Panel closed");
    for (const output of this._outputFlows.values()) output.flow.dispose();
    this._commandQueues.clear(); this._outputFlows.clear();
    for (const request of this._snapshotRequests.values()) request.finish(null);
    this._startupRuns.clear();
    this._startupPending?.clear();
    this._registryListener?.dispose();
    // Pass `this` so a prior replace() that swapped this slot to a new panel isn't clobbered
    panelRegistry.unregister(this._tabId, this);
    this._configListener?.dispose();

    for (const t of this._terminals) {
      try {
        t.pty.kill();
      } catch {
        // ignore
      }
    }
    this._terminals = [];
    for (const f of this._pasteImages) {
      try { fs.unlinkSync(f); } catch { /* ignore */ }
    }
    this._pasteImages = [];
    this._panel.dispose();

    // Extension shutdown must not erase the snapshot needed to restore tabs after reload.
    if (preserveState) return;
    if (panelRegistry.size() === 0) {
      this._context.workspaceState.update("lastGrid", undefined);
      void tabState.setLastTabs([]);
    } else {
      TerminalGridPanel._persistTabs(this._context);
    }

    const next = panelRegistry.getActive();
    if (next) {
      next.reveal();
      vscode.commands.executeCommand("terminalGrid._refreshSidebar");
    }
  }

  private _buildCustomFontCss(): string {
    const fonts = this._context.globalState.get<CustomFont[]>("customFonts", []);
    let css = "";
    for (const font of fonts) {
      const data = this._readFontBase64(font.path);
      if (!data) continue;
      const ext = path.extname(font.path).toLowerCase();
      const format = FONT_FORMATS[ext] || "truetype";
      css += `@font-face { font-family: '${font.name}'; src: url(data:font/${ext.slice(1)};base64,${data}) format('${format}'); font-display: swap; }\n`;
    }
    return css;
  }

  private _getHtml(): string {
    const webview = this._panel.webview;
    const gridTerminalJs = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "media", "gridTerminal.js")
    );
    const xtermCss = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "media", "xterm.css")
    );
    const nonce = getNonce();
    const customFontCss = this._buildCustomFontCss();

    return /*html*/ `<!DOCTYPE html>
<html lang="${vscode.env.language}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src 'nonce-${nonce}';
                 font-src ${webview.cspSource} data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${xtermCss}">
  <style>
    ${customFontCss}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%;
      overflow: hidden;
      background: var(--vscode-editor-background, #1e1e1e);
    }
    #grid {
      display: grid;
      grid-template-rows: repeat(${this._rows}, 1fr);
      grid-template-columns: repeat(${this._cols}, 1fr);
      width: 100%; height: 100%;
      gap: 2px;
      padding: 2px;
      position: relative;
    }
    .cell {
      overflow: hidden;
      contain: strict;
      background: var(--vscode-terminal-background, var(--vscode-editor-background, #1e1e1e));
      border-radius: 6px;
      border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.04));
      display: flex;
      flex-direction: column;
      position: relative;
      transition: border-color 0.2s ease;
    }
    .cell.focused {
      border-color: var(--vscode-focusBorder, rgba(0, 127, 212, 0.6));
      box-shadow: 0 0 8px color-mix(in srgb, var(--vscode-focusBorder, #007fd4) 25%, transparent);
    }
    .cell-info {
      position: absolute;
      top: 4px; right: 8px;
      display: flex; align-items: center; gap: 6px;
      font-size: 10px;
      font-family: var(--vscode-terminal-fontFamily, var(--vscode-editor-fontFamily, monospace));
      z-index: 1;
      pointer-events: none;
      user-select: none;
    }
    .cell-label {
      color: var(--vscode-textLink-foreground, #3794ff);
      opacity: 0.6;
    }
    .cell-startup {
      position: absolute; top: 6px; left: 8px; right: 80px; z-index: 3;
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      padding: 5px 8px; border-radius: 4px; font-size: 11px;
      background: var(--vscode-editorWidget-background, #252526);
      color: var(--vscode-editorWidget-foreground, #ddd);
      border: 1px solid var(--vscode-widget-border, #555);
    }
    .cell-startup[hidden], .cell-startup button[hidden] { display: none; }
    .cell-startup button {
      padding: 2px 5px; cursor: pointer; color: var(--vscode-button-foreground, white);
      background: var(--vscode-button-background, #007acc); border: 0; border-radius: 3px;
    }
    .cell-zoom-pct {
      font-size: 9px;
      color: var(--vscode-textLink-foreground, #3794ff);
      opacity: 0.7;
    }
    .grid-resizer {
      position: absolute;
      z-index: 20;
      background: transparent;
    }
    .grid-resizer:hover, .grid-resizer.active {
      background: var(--vscode-focusBorder, #007fd4);
      opacity: 0.45;
    }
    .grid-resizer.col-resizer {
      top: 0; width: 6px; height: 100%;
      cursor: col-resize;
    }
    .grid-resizer.row-resizer {
      left: 0; height: 6px; width: 100%;
      cursor: row-resize;
    }
    body.resizing-col, body.resizing-col * { cursor: col-resize !important; }
    body.resizing-row, body.resizing-row * { cursor: row-resize !important; }
    .term-container {
      flex: 1;
      overflow: hidden;
      padding: 4px 0 0 4px;
      background: var(--vscode-terminal-background, var(--vscode-editor-background, #1e1e1e));
    }
    .term-container .xterm,
    .term-container .xterm-viewport,
    .term-container .xterm-screen {
      height: 100%;
    }
    .cell-copy-retained {
      position: absolute; bottom: 6px; right: 16px; z-index: 4;
      padding: 4px 8px; border-radius: 4px; cursor: pointer;
      color: var(--vscode-button-foreground, white);
      background: var(--vscode-button-background, #007acc);
      border: 1px solid var(--vscode-contrastBorder, transparent);
    }
    .cell-copy-retained[hidden] { display: none; }
    .cell-notice { position: absolute; bottom: 5px; left: 6px; z-index: 4; max-width: 65%; max-height: 60px; overflow: auto; font-size: 11px;
      background: var(--vscode-editor-background, #1e1e1e); border-radius: 3px; }
    .cell-notice span:not(:empty) { display: inline-block; padding: 3px 5px; }
    .cell-notice button { color: var(--vscode-button-foreground, white); background: var(--vscode-button-background, #007acc);
      border: 0; border-radius: 3px; cursor: pointer; padding: 3px 5px; }
    .cell-notice button[hidden] { display: none; }
    .ctx-menu {
      position: fixed; display: none; z-index: 1000;
      background: var(--vscode-menu-background, #252526);
      border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      padding: 4px 0; min-width: 140px;
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
    }
    .ctx-menu.show { display: block; }
    .ctx-menu-item {
      padding: 6px 12px; font-size: 12px; cursor: pointer;
      color: var(--vscode-menu-foreground, var(--vscode-foreground));
      transition: background .1s;
    }
    .ctx-menu-item:hover { background: rgba(255,255,255,.06); }
    .ctx-menu-sep { height: 1px; background: rgba(255,255,255,.06); margin: 4px 8px; }
  </style>
</head>
<body lang="${vscode.env.language}">
  <div id="grid"></div>
  <div class="ctx-menu" id="ctxMenu">
    <div class="ctx-menu-item" data-action="copy">${vscode.l10n.t("Copy")}</div>
    <div class="ctx-menu-item" data-action="copyPlain">${vscode.l10n.t("Copy (Plain)")}</div>
    <div class="ctx-menu-item" data-action="paste">${vscode.l10n.t("Paste")}</div>
    <div class="ctx-menu-item" data-action="preview">${vscode.l10n.t("Preview selection")}</div>
    <div class="ctx-menu-item" data-action="history">${vscode.l10n.t("Search / save history")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="clear">${vscode.l10n.t("Clear")}</div>
    <div class="ctx-menu-item" data-action="restart">${vscode.l10n.t("Restart")}</div>
    <div class="ctx-menu-item" data-action="kill">${vscode.l10n.t("Kill")}</div>
    <div class="ctx-menu-sep"></div>
    <div class="ctx-menu-item" data-action="rename">${vscode.l10n.t("Rename")}</div>
  </div>
  <script nonce="${nonce}">
    var __GRID_ROWS = ${this._rows};
    var __GRID_COLS = ${this._cols};
    var __GRID_TAB_ID = ${this._tabId};
    var __GRID_CELL_IDS = ${JSON.stringify(this._cellIds)};
    var __GRID_LABELS = ${JSON.stringify(Object.fromEntries(["Cancel paste", "Reading clipboard…", "Clipboard timed out. Paste again.", "Paste cancelled", "Copying…", "Copied", "characters", "lines", "Copy failed. Selection kept; try again.", "Paste sent", "Pasting…", "Process exited"].map(key => [key, vscode.l10n.t(key)])))};
    var __GRID_ZOOM = ${vscode.workspace.getConfiguration("terminalGrid").get<number>("zoomPercent", 100)};
    var __GRID_SCROLLBACK = ${vscode.workspace.getConfiguration("terminalGrid").get<number>("scrollback", 20000)};
    var __GRID_COPY_RETAINED = ${JSON.stringify(vscode.l10n.t("Copy saved selection"))};
    var __GRID_FONT_FAMILY = ${JSON.stringify(vscode.workspace.getConfiguration("terminalGrid").get<string>("fontFamily", ""))};
    var __GRID_BG_COLOR = ${JSON.stringify(vscode.workspace.getConfiguration("terminalGrid").get<string>("backgroundColor", ""))};
    var __GRID_FG_COLOR = ${JSON.stringify(vscode.workspace.getConfiguration("terminalGrid").get<string>("foregroundColor", ""))};
    var __GRID_THEME = ${JSON.stringify(vscode.workspace.getConfiguration("terminalGrid").get<string>("colorTheme", ""))};
    var __GRID_THEME_COLORS = ${JSON.stringify(resolveThemeColors(vscode.workspace.getConfiguration("terminalGrid").get<string>("colorTheme", "")))};
    var __GRID_MERGE_REGIONS = ${JSON.stringify(tabState.getMergedRegions(this._tabId).filter((m) => m.startRow + m.rowSpan <= this._rows && m.startCol + m.colSpan <= this._cols))};
  </script>
  <script nonce="${nonce}" src="${gridTerminalJs}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
