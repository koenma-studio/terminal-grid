import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { BUILTIN_THEMES, resolveThemeColors } from "./themes";
import { panelRegistry, TabIdAllocator } from "./PanelRegistry";
import { tabState } from "./TabStateStore";
import { cellIdMapper } from "./CellIdMapper";

interface PtyLike {
  onData(cb: (data: string) => void): void;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
}

interface TerminalInstance {
  id: number;
  pty: PtyLike;
}

export type StartupStep =
  | { type: "command"; input: string }
  | { type: "timeout"; ms: number };

function stepsDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_STEP_DELAY = 3000;
const LLM_PROMPT_TIMEOUT = 15000; // Max wait for LLM prompt (15s)
const LLM_PROMPT_POLL = 200;      // Poll interval (ms)
/** Patterns that indicate an LLM CLI is ready for input */
const LLM_READY_PATTERNS = [
  /[❯>✻⏵›]\s*$/m,         // Claude, Gemini, Copilot, Codex prompt
  /aider>\s*$/m,           // Aider prompt
];

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

/** Determine line ending based on shell type (PTY always uses \r for Enter) */
function getLineEnding(shellType: string): string {
  const lower = shellType.toLowerCase();
  if (lower.includes("powershell") || lower.includes("pwsh") || lower.includes("cmd")) {
    return "\r\n";
  }
  return "\r";
}

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
  private _csiUMode: boolean[] = [];            // Kitty keyboard protocol active per cell
  private _insideLlm: boolean[] = [];            // Cell is running an LLM CLI process
  private _cellShellType: string[] = [];          // Shell type per cell for EOL detection
  private static readonly OUTPUT_BUFFER_SIZE = 50000;
  private static readonly CSI_U_ENABLE = /\x1b\[>[0-9]+u/;
  private static readonly CSI_U_DISABLE = /\x1b\[<[0-9]*u/;
  private _disposed = false;
  private _stepGeneration: Record<number, number> = {};
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
    options?: { forceNewTab?: boolean; tabIdOverride?: number; cellIdsOverride?: number[]; positionOverride?: number }
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
        const pending = context.globalState.get<number | undefined>("pendingFirstTabId");
        if (pending !== undefined && pending !== null) {
          tabId = pending;
          void context.globalState.update("pendingFirstTabId", undefined);
        } else {
          tabId = TabIdAllocator.next(context);
        }
      }
      cellIds = options?.cellIdsOverride ?? cellIdMapper.allocate(context, rows * cols);
    }

    const panel = vscode.window.createWebviewPanel(
      "terminalGrid",
      // Placeholder — title is set by refreshTitle() after register/replace fires onDidChange.
      vscode.l10n.t("Terminal Grid {0}×{1}", rows, cols),
      vscode.ViewColumn.One,
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
    const cellIds = cellIdsOverride ?? cellIdMapper.allocate(context, rows * cols);
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
    void context.globalState.update("lastTabs", snapshot);
    // Backward compat: keep lastGrid in sync with the most recent panel (used as fallback by old deserialize path).
    if (snapshot.length > 0) {
      const last = snapshot[snapshot.length - 1];
      void context.globalState.update("lastGrid", { rows: last.rows, cols: last.cols });
    }
  }

  /** Format webview panel title: `workspace — Terminal Grid 2×3 · Tab 2` (or user-assigned name).
   *  displayIdx is the 1-based position in panelRegistry.entries() — matches the sidebar Tabs card.
   *  This is NOT the sparse internal tabId (which is what LLMs see via getGridInfo).
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
    if (this._csiUMode[id] || this._insideLlm[id]) return LLM_ENTER;
    return getLineEnding(this._cellShellType[id] || "");
  }

  /** Broadcast text to all terminals */
  public broadcastInput(text: string): void {
    for (const t of this._terminals) {
      if (this._hiddenCells.has(t.id)) continue;
      if (this._insideLlm[t.id]) {
        // LLM TUI: type char-by-char then send Enter
        this._typeToCell(t.id, text).then(() => stepsDelay(50)).then(() => {
          t.pty.write(this._enterSeq(t.id));
        });
      } else {
        const hasNewline = /\r?\n/.test(text);
        const data = hasNewline
          ? "\x1b[200~" + text + "\x1b[201~"
          : text;
        this._chunkedWrite(t.pty, data + this._enterSeq(t.id));
      }
      // Track LLM context
      if (isLlmCommand(text)) this._insideLlm[t.id] = true;
      if (text.trim() === "exit") this._insideLlm[t.id] = false;
    }
  }

  /** Send text to a specific terminal cell */
  public sendToCell(cellId: number, text: string): boolean {
    const t = this._terminals[cellId];
    if (!t) return false;
    this._chunkedWrite(t.pty, text);
    return true;
  }

  /** Send text + Enter to a specific terminal cell (auto-detects LLM / CSI u mode) */
  public sendInputToCell(cellId: number, text: string): boolean {
    const t = this._terminals[cellId];
    if (!t) return false;
    if (this._insideLlm[cellId]) {
      // LLM TUI: type char-by-char then send Enter (same as startup steps)
      this._typeToCell(cellId, text).then(() => stepsDelay(50)).then(() => {
        t.pty.write(this._enterSeq(cellId));
      });
    } else {
      const hasNewline = /\r?\n/.test(text);
      const data = hasNewline
        ? "\x1b[200~" + text + "\x1b[201~"
        : text;
      this._chunkedWrite(t.pty, data + this._enterSeq(cellId));
    }
    // Track LLM context so subsequent calls use the correct Enter
    if (isLlmCommand(text)) this._insideLlm[cellId] = true;
    if (text.trim() === "exit") this._insideLlm[cellId] = false;
    return true;
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
        case "ready":
          this._createTerminals(msg.defaultCols, msg.defaultRows);
          // Apply per-cell dimensions if available
          if (msg.cellDims && Array.isArray(msg.cellDims)) {
            for (let i = 0; i < msg.cellDims.length && i < this._terminals.length; i++) {
              const d = msg.cellDims[i] as { cols: number; rows: number };
              if (d?.cols && d?.rows) {
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
          const pty = this._terminals[msg.id]?.pty;
          if (pty) this._chunkedWrite(pty, msg.data);
          break;
        }
        case "clipboardWrite":
          vscode.env.clipboard.writeText(msg.text);
          break;
        case "pasteRequest": {
          const clipText = await vscode.env.clipboard.readText();
          if (clipText && this._terminals[msg.id]) {
            const hasNewline = /\r?\n/.test(clipText);
            const data = hasNewline
              ? "\x1b[200~" + clipText + "\x1b[201~"
              : clipText;
            this._chunkedWrite(this._terminals[msg.id].pty, data);
          }
          break;
        }
        case "pasteImage": {
          const match = (msg.data as string).match(/^data:image\/([^;]+);base64,(.+)$/s);
          if (match && this._terminals[msg.id]) {
            // Delete previous paste images
            for (const old of this._pasteImages) {
              try { fs.unlinkSync(old); } catch { /* ignore */ }
            }
            this._pasteImages = [];
            const ext = match[1] === "jpeg" ? "jpg" : match[1];
            const filePath = path.join(os.tmpdir(), `tg-paste-${Date.now()}.${ext}`);
            fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
            this._pasteImages.push(filePath);
            this._chunkedWrite(this._terminals[msg.id].pty, filePath);
          }
          break;
        }
        case "resize":
          try {
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
      if (e.webviewPanel.active) {
        panelRegistry.setActive(this._tabId);
        vscode.commands.executeCommand("terminalGrid._refreshSidebar");
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
    const resolved = this._resolveShell(shellType);
    if (nodePty) {
      const proc = nodePty.spawn(resolved.path, resolved.args, {
        name: "xterm-256color",
        cols, rows, cwd,
        env: process.env as Record<string, string>,
      });
      return {
        onData: (cb) => { proc.onData(cb); },
        write: (data) => proc.write(data),
        resize: (c, r) => proc.resize(c, r),
        kill: () => proc.kill(),
      };
    }
    // Fallback: child_process.spawn
    const { spawn } = require("child_process") as typeof import("child_process");
    const proc = spawn(resolved.path, resolved.args, { cwd, env: process.env, windowsHide: true });
    return {
      onData: (cb) => {
        proc.stdout?.on("data", (d: Buffer) => cb(d.toString()));
        proc.stderr?.on("data", (d: Buffer) => cb(d.toString()));
      },
      write: (data) => { proc.stdin?.write(data); },
      resize: () => {},
      kill: () => proc.kill(),
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
        const noopPty: PtyLike = { onData() {}, write() {}, resize() {}, kill() {} };
        this._terminals.push({ id: i, pty: noopPty });
        this._outputBuffers[i] = "";
        this._cellShellType[i] = "";
        this._insideLlm[i] = false;
        this._csiUMode[i] = false;
        continue;
      }
      const cellShell = cellOverrides[i]?.shellType || globalShell || "";
      const pty = this._spawnPty(nodePty, c, r, cwd, cellShell || undefined);
      const id = i;
      const steps = resolveStartupSteps(cellOverrides, expandedCmds, defaultSteps, defaultCommand, i);
      this._cellShellType[id] = cellShell;
      this._insideLlm[id] = false;
      this._outputBuffers[id] = "";
      this._csiUMode[id] = false;
      let startupSent = false;
      pty.onData((data: string) => {
        if (!this._disposed) {
          // Track Kitty keyboard protocol mode
          if (TerminalGridPanel.CSI_U_ENABLE.test(data)) { this._csiUMode[id] = true; }
          if (TerminalGridPanel.CSI_U_DISABLE.test(data)) { this._csiUMode[id] = false; }
          this._outputBuffers[id] = (this._outputBuffers[id] || "") + data;
          if (this._outputBuffers[id].length > TerminalGridPanel.OUTPUT_BUFFER_SIZE) {
            this._outputBuffers[id] = this._outputBuffers[id].slice(-TerminalGridPanel.OUTPUT_BUFFER_SIZE);
          }
          this._panel.webview.postMessage({ type: "output", id, data });
          if (!startupSent && steps.length > 0) {
            startupSent = true;
            this._executeSteps(id, steps, this._cellShellType[id] || "");
          }
        }
      });
      this._terminals.push({ id: i, pty });
    }

    // Send cell labels
    this.sendLabels();
  }

  private _restartTerminal(id: number): void {
    const t = this._terminals[id];
    if (!t) return;

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
    const pty = this._spawnPty(TerminalGridPanel._getNodePty(), 80, 24, cwd, cellShell || undefined);

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
    this._insideLlm[id] = false;
    let startupSent = false;
    this._outputBuffers[id] = "";
    this._csiUMode[id] = false;

    pty.onData((data: string) => {
      if (!this._disposed) {
        // Track Kitty keyboard protocol mode
        if (TerminalGridPanel.CSI_U_ENABLE.test(data)) { this._csiUMode[id] = true; }
        if (TerminalGridPanel.CSI_U_DISABLE.test(data)) { this._csiUMode[id] = false; }
        this._outputBuffers[id] = (this._outputBuffers[id] || "") + data;
        if (this._outputBuffers[id].length > TerminalGridPanel.OUTPUT_BUFFER_SIZE) {
          this._outputBuffers[id] = this._outputBuffers[id].slice(-TerminalGridPanel.OUTPUT_BUFFER_SIZE);
        }
        this._panel.webview.postMessage({ type: "output", id, data });
        if (!startupSent && steps.length > 0) {
          startupSent = true;
          this._executeSteps(id, steps, this._cellShellType[id] || "");
        }
      }
    });

    this._terminals[id] = { id, pty };
  }

  /**

  /** Write large text to PTY in chunks to avoid ConPTY buffer overflow */
  private static readonly CHUNK_SIZE = 4096;
  private static readonly CHUNK_DELAY = 10;
  private _chunkedWrite(pty: PtyLike, data: string): void {
    if (data.length <= TerminalGridPanel.CHUNK_SIZE) {
      pty.write(data);
      return;
    }
    let offset = 0;
    const writeNext = (): void => {
      if (offset >= data.length) return;
      const chunk = data.slice(offset, offset + TerminalGridPanel.CHUNK_SIZE);
      offset += TerminalGridPanel.CHUNK_SIZE;
      pty.write(chunk);
      if (offset < data.length) setTimeout(writeNext, TerminalGridPanel.CHUNK_DELAY);
    };
    writeNext();
  }

  /** Write text to PTY one character at a time (simulates typing) */
  private async _typeToCell(cellId: number, text: string): Promise<void> {
    const pty = this._terminals[cellId]?.pty;
    if (!pty) return;
    for (const ch of text) {
      pty.write(ch);
      await stepsDelay(20);
    }
  }

  private static readonly LLM_TYPE_MAX_RETRIES = 5;
  private static readonly LLM_ECHO_WAIT = 2000;  // ms to wait for echo per attempt

  /** Wait until the LLM CLI shows a prompt (ready for input), or timeout */
  private async _waitForLlmPrompt(cellId: number): Promise<boolean> {
    const bufBefore = (this._outputBuffers[cellId] || "").length;
    const deadline = Date.now() + LLM_PROMPT_TIMEOUT;
    while (Date.now() < deadline) {
      await stepsDelay(LLM_PROMPT_POLL);
      const buf = this._outputBuffers[cellId] || "";
      const recent = TerminalGridPanel._stripAnsi(buf.slice(bufBefore));
      if (LLM_READY_PATTERNS.some((p) => p.test(recent))) return true;
      if (this._disposed) return false;
    }
    return false;
  }

  /** Type text into LLM, verify echo, retry with Ctrl+U clear if echo fails.
   *  Returns true if echo was confirmed. */
  private async _typeWithRetry(cellId: number, text: string): Promise<boolean> {
    const pty = this._terminals[cellId]?.pty;
    if (!pty) return false;
    for (let attempt = 0; attempt < TerminalGridPanel.LLM_TYPE_MAX_RETRIES; attempt++) {
      const bufBefore = (this._outputBuffers[cellId] || "").length;
      // Type text char-by-char
      await this._typeToCell(cellId, text);
      // Poll for echo
      const echoDeadline = Date.now() + TerminalGridPanel.LLM_ECHO_WAIT;
      while (Date.now() < echoDeadline) {
        await stepsDelay(50);
        const buf = this._outputBuffers[cellId] || "";
        const recent = TerminalGridPanel._stripAnsi(buf.slice(bufBefore));
        if (recent.includes(text)) return true; // echo confirmed
        if (this._disposed) return false;
      }
      // Echo not found — delete typed chars with backspaces and retry
      for (let j = 0; j < text.length; j++) pty.write("\x7f");
      await stepsDelay(300);
    }
    return false; // all retries exhausted
  }

  private async _executeSteps(cellId: number, steps: StartupStep[], shellType: string): Promise<void> {
    if (!this._stepGeneration[cellId]) this._stepGeneration[cellId] = 0;
    const gen = ++this._stepGeneration[cellId];
    let insideLlm = false;
    for (let i = 0; i < steps.length; i++) {
      if (this._disposed || this._stepGeneration[cellId] !== gen) return;
      const step = steps[i];
      if (step.type === "timeout") {
        await stepsDelay(step.ms);
      } else if (step.type === "command") {
        if (i > 0) {
          if (insideLlm) {
            await this._waitForLlmPrompt(cellId);
          } else if (steps[i - 1].type === "command") {
            await stepsDelay(DEFAULT_STEP_DELAY);
          }
        }
        if (this._disposed || this._stepGeneration[cellId] !== gen) return;
        const eol = insideLlm ? LLM_ENTER : this._enterSeq(cellId);
        if (insideLlm) {
          await this._typeWithRetry(cellId, step.input);
          this._terminals[cellId]?.pty.write(eol);
        } else {
          this._terminals[cellId]?.pty.write(step.input + eol);
        }
        if (isLlmCommand(step.input)) insideLlm = true;
        if (step.input.trim() === "exit") insideLlm = false;
        this._insideLlm[cellId] = insideLlm;
      }
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

  public dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
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

    if (panelRegistry.size() === 0) {
      this._context.globalState.update("lastGrid", undefined);
      this._context.globalState.update("lastTabs", undefined);
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
<html lang="en">
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
    .term-container .xterm-viewport {
      overflow-y: scroll !important;
      will-change: transform;
    }
    .term-container .xterm-viewport::-webkit-scrollbar { width: 4px; }
    .term-container .xterm-viewport::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background, rgba(255,255,255,0.1));
      border-radius: 2px;
    }
    .term-container .xterm-viewport::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(255,255,255,0.2));
    }
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
<body>
  <div id="grid"></div>
  <div class="ctx-menu" id="ctxMenu">
    <div class="ctx-menu-item" data-action="copy">${vscode.l10n.t("Copy")}</div>
    <div class="ctx-menu-item" data-action="copyPlain">${vscode.l10n.t("Copy (Plain)")}</div>
    <div class="ctx-menu-item" data-action="paste">${vscode.l10n.t("Paste")}</div>
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
    var __GRID_ZOOM = ${vscode.workspace.getConfiguration("terminalGrid").get<number>("zoomPercent", 100)};
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
