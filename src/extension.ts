import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";
import { createHash } from "crypto";
import { ReloadWatcher } from "./ReloadWatcher";
import { SidebarProvider } from "./SidebarProvider";
import { TerminalGridPanel } from "./TerminalGridPanel";
import { McpBridge } from "./McpBridge";
import { tabState } from "./TabStateStore";
import type { CellOverride, MergeRegion } from "./TabStateStore";
import { panelRegistry, TabIdAllocator } from "./PanelRegistry";
import { cellIdMapper } from "./CellIdMapper";
import { TabRestorePlan } from "./TabRestorePlan";

let mcpBridge: McpBridge | undefined;
let mcpStatusItem: vscode.StatusBarItem | undefined;
let deactivating = false;
let reloadWatcher: ReloadWatcher | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  deactivating = false;
  // Tab layouts/settings belong to this workspace; keep shared presets/fonts global.
  tabState.init(context);
  await tabState.migrateOnce();

  // MCP hygiene: keep the bundled MCP launcher at a version-independent global-storage location and
  // repoint any existing terminal-grid registration (Claude Code + Claude Desktop) onto it, so an
  // extension update never leaves a dangling versioned path ("MCP server not connected" after update).
  SidebarProvider.ensureStableMcpScript(context);
  SidebarProvider.healMcpRegistrations(context);
  SidebarProvider.healCodexRegistration(context);

  // Opt-in local deployment: npm run deploy installs the VSIX, then requests Reload Window.
  try {
    reloadWatcher = new ReloadWatcher(path.join(os.homedir(), ".terminal-grid"), {
      version: String(context.extension.packageJSON.version),
      buildHash: createHash("sha256").update(fs.readFileSync(path.join(context.extensionPath, "dist", "extension.js"))).digest("hex"),
      workspaces: (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath),
    }, () => vscode.commands.executeCommand("workbench.action.reloadWindow"));
    context.subscriptions.push(reloadWatcher);
  } catch (error) {
    console.warn("Terminal Grid: deployment reload watcher unavailable:", error);
  }

  // Auto-load preset for current workspace.
  // Multi-tab deferred pattern: allocate the next tabId, write per-tab preset state to that
  // namespace, then auto-open the grid with that tabId so it inherits the preset on spawn.
  // Skipped when lastTabs has entries (user's restored panels take precedence).
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspacePath) {
    const mapping = context.globalState.get<Record<string, string>>("projectPresets", {});
    const presetName = mapping[workspacePath];
    if (presetName) {
      const presets = context.globalState.get<Array<{
        name: string; rows: number; cols: number;
        startupCommands: {command: string; count: number}[];
        cellLabels: string[]; zoomPercent: number;
        fontFamily: string; bgColor: string; fgColor: string;
        colorTheme?: string; shellType?: string; defaultCommand?: string;
        defaultSteps?: {type: string; input?: string; ms?: number}[];
        cellStepsOverrides?: Record<number, Record<string, unknown>>;
        mergedRegions?: MergeRegion[];
      }>>("presets", []);
      const preset = presets.find((p) => p.name === presetName);
      if (preset) {
        // 1. Global config (workspace settings, not tab-scoped)
        const cfg = vscode.workspace.getConfiguration("terminalGrid");
        await cfg.update("defaultRows", preset.rows, vscode.ConfigurationTarget.Global);
        await cfg.update("defaultCols", preset.cols, vscode.ConfigurationTarget.Global);
        await cfg.update("zoomPercent", preset.zoomPercent, vscode.ConfigurationTarget.Global);
        await cfg.update("fontFamily", preset.fontFamily, vscode.ConfigurationTarget.Global);
        await cfg.update("backgroundColor", preset.bgColor, vscode.ConfigurationTarget.Global);
        await cfg.update("foregroundColor", preset.fgColor, vscode.ConfigurationTarget.Global);
        await cfg.update("colorTheme", preset.colorTheme || "", vscode.ConfigurationTarget.Global);
        await cfg.update("shellType", preset.shellType || "", vscode.ConfigurationTarget.Global);
        // 2. Allocate the tabId the first opened panel will use, then write per-tab state to it
        const persistedTabs = tabState.getLastTabs();
        if (persistedTabs.length === 0) {
          const firstTabId = TabIdAllocator.next(context);
          await tabState.setStartupCommands(firstTabId, preset.startupCommands || []);
          await tabState.setCellLabels(firstTabId, preset.cellLabels || []);
          await tabState.setDefaultCommand(firstTabId, preset.defaultCommand || "");
          if (preset.defaultSteps) {
            await tabState.setDefaultSteps(firstTabId, preset.defaultSteps);
          } else if (preset.defaultCommand) {
            await tabState.setDefaultSteps(firstTabId, [{ type: "command", input: preset.defaultCommand }]);
          } else {
            await tabState.setDefaultSteps(firstTabId, []);
          }
          if (preset.cellStepsOverrides) {
            const cur: Record<number, Record<string, unknown>> = {};
            for (const [k, v] of Object.entries(preset.cellStepsOverrides)) {
              cur[Number(k)] = {};
              if (Array.isArray((v as Record<string, unknown>).startupSteps)) {
                cur[Number(k)].startupSteps = (v as Record<string, unknown>).startupSteps;
              }
            }
            await tabState.setCellOverrides(firstTabId, cur as Record<number, CellOverride>);
          }
          await tabState.setMergedRegions(firstTabId, preset.mergedRegions || []);
          // Stash pending tabId so the first createOrShow call picks it up.
          await context.workspaceState.update("pendingFirstTabId", firstTabId);
        }
      }
    }
  }

  // Sidebar
  const sidebarProvider = new SidebarProvider(context);

  // Publish only the port that actually bound (it may differ after EADDRINUSE).
  const didChangeMcp = new vscode.EventEmitter<void>();
  context.subscriptions.push(didChangeMcp);
  let currentPort = 0;
  mcpStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
  mcpStatusItem.command = "terminalGrid.showDiagnostics";
  context.subscriptions.push(mcpStatusItem);
  const restartBridge = async (): Promise<void> => {
    if (deactivating) return;
    currentPort = 0;
    reloadWatcher?.setPort(0);
    sidebarProvider.setMcpPort(0);
    mcpStatusItem?.hide();
    didChangeMcp.fire();
    await mcpBridge?.stop();
    mcpBridge = undefined;
    if (deactivating) return;
    const requestedPort = vscode.workspace.getConfiguration("terminalGrid").get<number>("apiPort", 7890);
    if (requestedPort <= 0) return;
    const windowId = reloadWatcher?.windowId || `${process.pid}-${Date.now()}`;
    const bridge = new McpBridge(requestedPort, {
      windowId, workspaces: (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath),
      pid: process.pid, version: String(context.extension.packageJSON.version),
    });
    mcpBridge = bridge;
    try {
      currentPort = await bridge.start();
      reloadWatcher?.setPort(currentPort);
      TerminalGridPanel.setMcpEnvironment(windowId, currentPort);
      context.environmentVariableCollection.persistent = false;
      context.environmentVariableCollection.replace("TERMINAL_GRID_WINDOW_ID", windowId);
      if (mcpStatusItem) {
        mcpStatusItem.text = "$(broadcast) TG :" + currentPort;
        mcpStatusItem.tooltip = vscode.l10n.t("Terminal Grid API active on port {0}", currentPort);
        mcpStatusItem.show();
      }
      sidebarProvider.setMcpPort(currentPort);
      didChangeMcp.fire();
    } catch (err) {
      await bridge.stop();
      mcpBridge = undefined;
      void vscode.window.showWarningMessage(vscode.l10n.t("Terminal Grid API bridge failed to start: {0}", err instanceof Error ? err.message : String(err)));
    }
  };
  let bridgeTask = restartBridge();
  await bridgeTask;
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("terminalGrid.apiPort")) bridgeTask = bridgeTask.then(restartBridge);
  }));

  // VS Code Copilot MCP registration (VS Code 1.99+)
  const lm = vscode.lm as Record<string, unknown> | undefined;
  if (typeof lm?.registerMcpServerDefinitionProvider === "function") {
    const register = lm.registerMcpServerDefinitionProvider as (
      id: string,
      provider: {
        onDidChangeMcpServerDefinitions: vscode.Event<void>;
        provideMcpServerDefinitions: () => Promise<unknown[]>;
      }
    ) => vscode.Disposable;
    context.subscriptions.push(
      register("terminalGrid", {
        onDidChangeMcpServerDefinitions: didChangeMcp.event,
        provideMcpServerDefinitions: async () => {
          if (currentPort <= 0) return [];
          const McpStdio = (vscode as Record<string, unknown>).McpStdioServerDefinition as
            new (label: string, command: string, args: string[], env: Record<string, string>, version?: string) => unknown;
          if (!McpStdio) return [];
          return [
            new McpStdio(
              "Terminal Grid",
              "node",
              [SidebarProvider.ensureStableMcpScript(context)],
              { TERMINAL_GRID_WINDOW_ID: reloadWatcher?.windowId || "" },
              context.extension.packageJSON.version
            ),
          ];
        },
      })
    );

  }

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Internal: refresh sidebar (called after rename, etc.)
  context.subscriptions.push(
    vscode.commands.registerCommand("terminalGrid._refreshSidebar", () => {
      sidebarProvider.sendConfig();
    })
  );

  // VS Code can deserialize tabs in any order. The webview's saved tabId is its
  // identity; a legacy panel without one is recreated from the saved layout.
  const restorePlan = new TabRestorePlan(tabState.beginRestore());
  let selfHealRan = false;
  let firstDeserializeFired = false;

  // Self-heal: VS Code only auto-deserializes the visible panel; hidden tabs stay dormant
  // until the user clicks them, which leaves them missing from panelRegistry (and thus the
  // sidebar). After deserialize fires, force-load any lastTabs entries that didn't register.
  // Idempotent — runs at most once per activation (whichever triggers first wins).
  const runSelfHeal = async (): Promise<void> => {
    if (selfHealRan) return;
    selfHealRan = true;

    if (deactivating) return;
    const active = panelRegistry.getActiveTabId();
    const missing = restorePlan.missing(panelRegistry.entries().map(([tid]) => tid));

    if (missing.length > 0) {
      // Do not close unidentified hidden editors: some are already restored live
      // terminals. Late placeholder deserializations are discarded by ID below.
      for (const entry of missing) {
        if (panelRegistry.has(entry.tabId)) continue;
        TerminalGridPanel.createOrShow(context, entry.rows, entry.cols, {
          forceNewTab: true,
          preserveFocus: true,
          tabIdOverride: entry.tabId,
          cellIdsOverride: entry.cellIds,
        });
      }
    }
    panelRegistry.reorder(restorePlan.tabs.map(tab => tab.tabId));
    if (active !== undefined) panelRegistry.setActive(active);
    tabState.finishRestore();
    TerminalGridPanel.persistTabs(context);
  };

  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer("terminalGrid", {
      async deserializeWebviewPanel(panel: vscode.WebviewPanel, state: unknown) {
        const entry = restorePlan.claim(state);
        if (entry && !panelRegistry.has(entry.tabId)) {
          TerminalGridPanel.revive(panel, context, entry.rows, entry.cols, entry.tabId, entry.cellIds);
          panelRegistry.reorder(restorePlan.tabs.map(tab => tab.tabId));
        } else {
          // No matching entry in lastTabs → zombie. Dispose to avoid orphaned panels.
          panel.dispose();
        }
        // First deserialize confirms VS Code is alive enough to hold panels — fast-track self-heal.
        if (!firstDeserializeFired) {
          firstDeserializeFired = true;
          setTimeout(() => void runSelfHeal(), 100);
        }
      },
    })
  );

  // Fallback: if no deserialize callback fires (no persisted panels, or VS Code is slow),
  // still run self-heal eventually to clean stale state.
  setTimeout(() => void runSelfHeal(), 1500);

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("terminalGrid.showDiagnostics", async () => {
      const runningVersion = String(context.extension.packageJSON.version);
      let installedVersion = vscode.l10n.t("Unknown (no local installation receipt)");
      let reloadNeeded = false;
      try {
        const receipt = JSON.parse(await fs.promises.readFile(path.join(os.homedir(), ".terminal-grid", "deployment.json"), "utf8"));
        installedVersion = String(receipt.version);
        const runningHash = createHash("sha256").update(await fs.promises.readFile(path.join(context.extensionPath, "dist", "extension.js"))).digest("hex");
        reloadNeeded = runningVersion !== receipt.version || runningHash !== receipt.buildHash;
      } catch { /* Marketplace installs need not have a local deployment receipt. */ }
      const port = currentPort;
      const bridgeState = port > 0 ? await new Promise<string>(resolve => {
        const request = http.get({ hostname: "127.0.0.1", port, path: "/api/health", timeout: 1500,
          headers: { "X-Terminal-Grid-Window": reloadWatcher?.windowId || "" } }, response => {
          response.resume();
          resolve(response.statusCode === 200 ? vscode.l10n.t("Connected on port {0}", port) : vscode.l10n.t("Connection failed (HTTP {0})", response.statusCode || 0));
        });
        request.on("timeout", () => request.destroy(new Error("timeout")));
        request.on("error", () => resolve(vscode.l10n.t("Connection failed on port {0}", port)));
      }) : vscode.l10n.t("Disabled or unavailable");
      const detail = [
        vscode.l10n.t("Running version: {0}", runningVersion),
        vscode.l10n.t("Last local installation: {0}", installedVersion),
        reloadNeeded ? vscode.l10n.t("Reload Window is needed to use the installed build.") : "",
        vscode.l10n.t("Terminal Grid MCP: {0}", bridgeState),
        vscode.l10n.t("Workspace: {0}", (vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.fsPath).join(", ") || vscode.l10n.t("Empty window")),
        vscode.l10n.t("Open grid tabs: {0}", panelRegistry.size()),
        "",
        vscode.l10n.t("CLI authentication is managed by Codex or Claude. A codex_apps 401 token_expired error requires signing in again in that CLI; the local Terminal Grid MCP connection does not refresh that token."),
      ].filter(line => line !== "").join("\n");
      await vscode.window.showInformationMessage(vscode.l10n.t("Terminal Grid status"), { modal: true, detail });
    }),
    vscode.commands.registerCommand("terminalGrid.openGrid", () => {
      const config = vscode.workspace.getConfiguration("terminalGrid");
      const rows = config.get<number>("defaultRows", 2);
      const cols = config.get<number>("defaultCols", 3);
      TerminalGridPanel.createOrShow(context, rows, cols);
    }),
    vscode.commands.registerCommand(
      "terminalGrid.openCustomGrid",
      (rows: number, cols: number) => {
        TerminalGridPanel.createOrShow(context, rows, cols);
      }
    ),
    vscode.commands.registerCommand("terminalGrid.open2x2", () =>
      TerminalGridPanel.createOrShow(context, 2, 2)
    ),
    vscode.commands.registerCommand("terminalGrid.open2x3", () =>
      TerminalGridPanel.createOrShow(context, 2, 3)
    ),
    vscode.commands.registerCommand("terminalGrid.open3x3", () =>
      TerminalGridPanel.createOrShow(context, 3, 3)
    ),
    // ── Tab management commands (also reachable from sidebar Tabs card) ──
    vscode.commands.registerCommand("terminalGrid.newTab", () => {
      const active = panelRegistry.getActive();
      const cfg = vscode.workspace.getConfiguration("terminalGrid");
      const rows = active?.getRows() ?? cfg.get<number>("defaultRows", 2);
      const cols = active?.getCols() ?? cfg.get<number>("defaultCols", 3);
      TerminalGridPanel.createOrShow(context, rows, cols, { forceNewTab: true });
    }),
    vscode.commands.registerCommand("terminalGrid.duplicateTab", async () => {
      const active = panelRegistry.getActive();
      if (!active) {
        vscode.window.showWarningMessage(vscode.l10n.t("No active tab to duplicate."));
        return;
      }
      const rows = active.getRows();
      const cols = active.getCols();
      const srcTabId = active.getTabId();
      const newTabId = TabIdAllocator.next(context);
      await tabState.cloneTab(srcTabId, newTabId);
      TerminalGridPanel.createOrShow(context, rows, cols, { forceNewTab: true, tabIdOverride: newTabId });
      vscode.window.showInformationMessage(
        vscode.l10n.t("Tab duplicated. Terminal history is not copied; cells will start with the configured startup commands.")
      );
    }),
    vscode.commands.registerCommand("terminalGrid.closeTab", () => {
      if (panelRegistry.size() <= 1) {
        vscode.window.showWarningMessage(vscode.l10n.t("Cannot close the last remaining tab."));
        return;
      }
      const active = panelRegistry.getActive();
      if (active) active.dispose();
    }),
    vscode.commands.registerCommand("terminalGrid.resetCellIds", async () => {
      if (panelRegistry.size() > 0) {
        vscode.window.showWarningMessage(
          vscode.l10n.t("Close all Terminal Grid tabs before resetting cell IDs.")
        );
        return;
      }
      await cellIdMapper.reset(context);
      await TabIdAllocator.reset(context);
      vscode.window.showInformationMessage(
        vscode.l10n.t("Cell IDs and tab counter reset.")
      );
    }),
    /** Nuclear option for zombie tabs — closes everything and clears all persisted multi-tab state. */
    vscode.commands.registerCommand("terminalGrid.resetAllTabs", async () => {
      const confirm = await vscode.window.showWarningMessage(
        vscode.l10n.t("Close all Terminal Grid tabs and wipe persisted tab state? This cannot be undone."),
        { modal: true },
        vscode.l10n.t("Reset")
      );
      if (confirm !== vscode.l10n.t("Reset")) return;
      selfHealRan = true;
      restorePlan.cancel();
      tabState.finishRestore();
      panelRegistry.disposeAll();
      await cellIdMapper.reset(context);
      await TabIdAllocator.reset(context);
      await tabState.setLastTabs([]);
      await context.workspaceState.update("lastGrid", undefined);
      await context.workspaceState.update("pendingFirstTabId", undefined);
      vscode.window.showInformationMessage(
        vscode.l10n.t("All Terminal Grid tabs and persisted state reset.")
      );
    }),
    // Agent Teams API — cellId is a sparse GLOBAL id (resolved across all open tabs)
    vscode.commands.registerCommand(
      "terminalGrid.sendToCell",
      (cellId: number, text: string): boolean => {
        const resolved = cellIdMapper.resolve(cellId);
        if (!resolved) return false;
        return panelRegistry.get(resolved.tabId)?.sendToCell(resolved.localCellId, text) ?? false;
      }
    ),
    vscode.commands.registerCommand(
      "terminalGrid.readCell",
      (cellId: number, lines?: number): string | null => {
        const resolved = cellIdMapper.resolve(cellId);
        if (!resolved) return null;
        return panelRegistry.get(resolved.tabId)?.readCell(resolved.localCellId, lines) ?? null;
      }
    ),
    vscode.commands.registerCommand(
      "terminalGrid.getGridInfo",
      (): {
        rows: number; cols: number; cellCount: number; cellLabels: string[];
        tabs: Array<{ tabId: number; rows: number; cols: number; cellIds: number[]; labels: string[] }>;
        activeTabId: number | null;
      } | null => {
        const active = panelRegistry.getActive();
        if (!active) return null;
        const tabs = panelRegistry.entries().map(([tabId, p]) => ({
          tabId,
          rows: p.getRows(),
          cols: p.getCols(),
          cellIds: p.getCellIds(),
          labels: p.getCellLabels(),
        }));
        return {
          rows: active.getRows(),
          cols: active.getCols(),
          cellCount: active.getCellCount(),
          cellLabels: active.getCellLabels(),
          tabs,
          activeTabId: panelRegistry.getActiveTabId() ?? null,
        };
      }
    ),
    // Hidden test command
    vscode.commands.registerCommand("terminalGrid.testAPI", async () => {
      const ch = vscode.window.createOutputChannel("Terminal Grid Tests");
      ch.show();
      ch.appendLine("=== Terminal Grid API Tests ===\n");
      let passed = 0, failed = 0;

      function check(name: string, ok: boolean, detail?: string): void {
        const s = ok ? "PASS" : "FAIL";
        if (ok) passed++; else failed++;
        ch.appendLine(`[${s}] ${name}${detail ? " — " + detail : ""}`);
      }

      // 1. getGridInfo
      const info = await vscode.commands.executeCommand<{
        rows: number; cols: number; cellCount: number; cellLabels: string[];
        tabs?: Array<{tabId: number; rows: number; cols: number; cellIds: number[]; labels: string[]}>;
        activeTabId?: number | null;
      } | null>("terminalGrid.getGridInfo");
      if (!info) {
        ch.appendLine("[FAIL] getGridInfo returned null. Open a grid first.");
        return;
      }
      check("getGridInfo returns object", !!info, JSON.stringify(info));
      check("rows is number", typeof info.rows === "number", `rows=${info.rows}`);
      check("cols is number", typeof info.cols === "number", `cols=${info.cols}`);
      check("cellCount = rows*cols", info.cellCount === info.rows * info.cols, `${info.cellCount}`);
      check("cellLabels is array", Array.isArray(info.cellLabels), `length=${info.cellLabels.length}`);
      check("cellLabels.length = cellCount", info.cellLabels.length === info.cellCount);

      // 2. sendToCell — valid
      const sent = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", 0, "echo __API_TEST__\r");
      check("sendToCell(0) returns true", sent === true);

      // 3. sendToCell — invalid cell
      const sentBad = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", 999, "x\r");
      check("sendToCell(999) returns false", sentBad === false, `got ${sentBad}`);

      // 4. sendToCell — no \\r (type only)
      const sentNoEnter = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", 0, "TYPED_ONLY");
      check("sendToCell without \\r returns true", sentNoEnter === true);

      // Wait for output
      await new Promise(r => setTimeout(r, 2000));

      // Clear typed text
      await vscode.commands.executeCommand("terminalGrid.sendToCell", 0, "\x15");

      // 5. readCell — valid
      const output = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", 0);
      check("readCell(0) returns string", typeof output === "string", `length=${output?.length ?? 0}`);
      check("readCell(0) contains test marker", !!output && output.includes("__API_TEST__"));

      // 6. readCell with lines
      const last3 = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", 0, 3);
      check("readCell(0, 3) returns string", typeof last3 === "string");

      // 7. readCell lines=0
      const zero = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", 0, 0);
      check("readCell(0, 0) returns empty", zero === "", `got "${zero}"`);

      // 8. readCell — invalid cell
      const readBad = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", 999);
      check("readCell(999) returns null", readBad === null, `got ${readBad}`);

      // 9. sendToCell to cell 1 (second cell)
      if (info.cellCount > 1) {
        const sent1 = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", 1, "echo CELL1_OK\r");
        check("sendToCell(1) returns true", sent1 === true);
        await new Promise(r => setTimeout(r, 1500));
        const out1 = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", 1);
        check("readCell(1) contains CELL1_OK", !!out1 && out1.includes("CELL1_OK"));
      }

      // ── Multi-tab tests (only run when more than one tab is open) ──
      if (info.tabs && info.tabs.length > 1) {
        ch.appendLine("\n--- Multi-tab tests ---");
        const allIds = info.tabs.flatMap((t) => t.cellIds);
        const unique = new Set(allIds);
        check("global cell ids unique across all tabs", unique.size === allIds.length, `${allIds.length} ids`);
        check("activeTabId is a number", typeof info.activeTabId === "number");
        // Send to second tab's first cell via its global id
        const tab2 = info.tabs[1];
        const tab2Global = tab2.cellIds[0];
        const sent2 = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", tab2Global, "echo __MULTITAB_OK__\r");
        check(`sendToCell global=${tab2Global} (tab ${tab2.tabId + 1} cell 1) returns true`, sent2 === true);
        await new Promise((r) => setTimeout(r, 1500));
        const out2 = await vscode.commands.executeCommand<string | null>("terminalGrid.readCell", tab2Global);
        check(`readCell global=${tab2Global} contains __MULTITAB_OK__`, !!out2 && out2.includes("__MULTITAB_OK__"));
        // Invalid global id (beyond any tab's range)
        const bogusId = Math.max(...allIds) + 10000;
        const sentBogus = await vscode.commands.executeCommand<boolean>("terminalGrid.sendToCell", bogusId, "x");
        check(`sendToCell with bogus global id=${bogusId} returns false`, sentBogus === false);
      } else if (info.tabs) {
        ch.appendLine(`\n(Multi-tab tests skipped: only ${info.tabs.length} tab open. Open a second tab via the sidebar to enable.)`);
      }

      ch.appendLine(`\n=== ${passed} passed, ${failed} failed ===`);
      if (failed === 0) {
        vscode.window.showInformationMessage(vscode.l10n.t("Terminal Grid API: All {0} tests passed!", passed));
      } else {
        vscode.window.showWarningMessage(vscode.l10n.t("Terminal Grid API: {0} test(s) failed. See output.", failed));
      }
    }),
    // Copy MCP configuration to clipboard
    vscode.commands.registerCommand("terminalGrid.copyMcpConfig", async () => {
      if (currentPort <= 0) {
        void vscode.window.showWarningMessage(vscode.l10n.t("Terminal Grid API bridge is disabled or not ready."));
        return;
      }
      const port = currentPort;
      const mcpServerPath = SidebarProvider.ensureStableMcpScript(context);
      const config = {
        mcpServers: {
          "terminal-grid": {
            command: "node",
            args: [mcpServerPath],
            env: {},
          },
        },
      };
      await vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
      vscode.window.showInformationMessage(
        vscode.l10n.t("Terminal Grid MCP config copied to clipboard (port {0})", port)
      );
    })
  );
}

export function deactivate(): void {
  deactivating = true;
  void mcpBridge?.stop();
  mcpBridge = undefined;
  panelRegistry.disposeAll(true);
}
