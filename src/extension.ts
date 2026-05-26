import * as vscode from "vscode";
import * as path from "path";
import { SidebarProvider } from "./SidebarProvider";
import { TerminalGridPanel } from "./TerminalGridPanel";
import { McpBridge } from "./McpBridge";

let mcpBridge: McpBridge | undefined;
let mcpStatusItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // Auto-load preset for current workspace
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
      }>>("presets", []);
      const preset = presets.find((p) => p.name === presetName);
      if (preset) {
        const cfg = vscode.workspace.getConfiguration("terminalGrid");
        cfg.update("defaultRows", preset.rows, vscode.ConfigurationTarget.Global);
        cfg.update("defaultCols", preset.cols, vscode.ConfigurationTarget.Global);
        cfg.update("zoomPercent", preset.zoomPercent, vscode.ConfigurationTarget.Global);
        cfg.update("fontFamily", preset.fontFamily, vscode.ConfigurationTarget.Global);
        cfg.update("backgroundColor", preset.bgColor, vscode.ConfigurationTarget.Global);
        cfg.update("foregroundColor", preset.fgColor, vscode.ConfigurationTarget.Global);
        cfg.update("colorTheme", preset.colorTheme || "", vscode.ConfigurationTarget.Global);
        cfg.update("shellType", preset.shellType || "", vscode.ConfigurationTarget.Global);
        context.globalState.update("startupCommands", preset.startupCommands || []);
        context.globalState.update("cellLabels", preset.cellLabels || []);
        context.globalState.update("defaultCommand", preset.defaultCommand || "");
        // Restore sequential startup steps
        if (preset.defaultSteps) {
          context.globalState.update("defaultSteps", preset.defaultSteps);
        } else if (preset.defaultCommand) {
          context.globalState.update("defaultSteps", [{ type: "command", input: preset.defaultCommand }]);
        } else {
          context.globalState.update("defaultSteps", []);
        }
        if (preset.cellStepsOverrides) {
          const cur = context.globalState.get<Record<number, Record<string, unknown>>>("cellOverrides", {});
          for (const [k, v] of Object.entries(preset.cellStepsOverrides)) {
            if (!cur[Number(k)]) cur[Number(k)] = {};
            if (Array.isArray((v as Record<string, unknown>).startupSteps)) {
              cur[Number(k)].startupSteps = (v as Record<string, unknown>).startupSteps;
            }
          }
          context.globalState.update("cellOverrides", cur);
        }
      }
    }
  }

  // Sidebar
  const sidebarProvider = new SidebarProvider(context);

  // MCP HTTP Bridge
  const apiPort = vscode.workspace
    .getConfiguration("terminalGrid")
    .get<number>("apiPort", 7890);
  if (apiPort > 0) {
    mcpBridge = new McpBridge(apiPort);
    mcpBridge
      .start()
      .then((port) => {
        mcpStatusItem = vscode.window.createStatusBarItem(
          vscode.StatusBarAlignment.Right,
          50
        );
        mcpStatusItem.text = `$(broadcast) TG :${port}`;
        mcpStatusItem.tooltip = vscode.l10n.t("Terminal Grid API active on port {0}", port);
        mcpStatusItem.command = "terminalGrid.copyMcpConfig";
        mcpStatusItem.show();
        context.subscriptions.push(mcpStatusItem);
        sidebarProvider.setMcpPort(port);
      })
      .catch((err) => {
        vscode.window.showWarningMessage(
          vscode.l10n.t("Terminal Grid API bridge failed to start: {0}", err.message)
        );
      });
  }

  // VS Code Copilot MCP registration (VS Code 1.99+)
  const lm = vscode.lm as Record<string, unknown> | undefined;
  if (typeof lm?.registerMcpServerDefinitionProvider === "function") {
    const didChange = new vscode.EventEmitter<void>();
    let currentPort = apiPort;
    const register = lm.registerMcpServerDefinitionProvider as (
      id: string,
      provider: {
        onDidChangeMcpServerDefinitions: vscode.Event<void>;
        provideMcpServerDefinitions: () => Promise<unknown[]>;
      }
    ) => vscode.Disposable;
    context.subscriptions.push(
      register("terminalGrid", {
        onDidChangeMcpServerDefinitions: didChange.event,
        provideMcpServerDefinitions: async () => {
          if (currentPort <= 0) return [];
          const McpStdio = (vscode as Record<string, unknown>).McpStdioServerDefinition as
            new (label: string, command: string, args: string[], env: Record<string, string>, version?: string) => unknown;
          if (!McpStdio) return [];
          return [
            new McpStdio(
              "Terminal Grid",
              "node",
              [path.join(context.extensionPath, "mcp-server.js")],
              { TERMINAL_GRID_PORT: String(currentPort) },
              context.extension.packageJSON.version
            ),
          ];
        },
      }),
      didChange
    );
    // Expose port updater so config change listener can fire didChange
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("terminalGrid.apiPort")) {
          currentPort = vscode.workspace
            .getConfiguration("terminalGrid")
            .get<number>("apiPort", 7890);
          didChange.fire();
        }
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

  // Restore grid panel on VS Code restart
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer("terminalGrid", {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async deserializeWebviewPanel(panel: vscode.WebviewPanel, _state: unknown) {
        const lastGrid = context.globalState.get<{ rows: number; cols: number }>("lastGrid");
        if (lastGrid) {
          TerminalGridPanel.revive(panel, context, lastGrid.rows, lastGrid.cols);
        } else {
          panel.dispose();
        }
      },
    })
  );

  // Commands
  context.subscriptions.push(
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
    // Agent Teams API
    vscode.commands.registerCommand(
      "terminalGrid.sendToCell",
      (cellId: number, text: string): boolean => {
        return TerminalGridPanel.currentPanel?.sendToCell(cellId, text) ?? false;
      }
    ),
    vscode.commands.registerCommand(
      "terminalGrid.readCell",
      (cellId: number, lines?: number): string | null => {
        return TerminalGridPanel.currentPanel?.readCell(cellId, lines) ?? null;
      }
    ),
    vscode.commands.registerCommand(
      "terminalGrid.getGridInfo",
      (): { rows: number; cols: number; cellCount: number; cellLabels: string[] } | null => {
        const panel = TerminalGridPanel.currentPanel;
        if (!panel) return null;
        return {
          rows: panel.getRows(),
          cols: panel.getCols(),
          cellCount: panel.getCellCount(),
          cellLabels: panel.getCellLabels(),
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
      const info = await vscode.commands.executeCommand<{rows: number; cols: number; cellCount: number; cellLabels: string[]} | null>("terminalGrid.getGridInfo");
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

      ch.appendLine(`\n=== ${passed} passed, ${failed} failed ===`);
      if (failed === 0) {
        vscode.window.showInformationMessage(vscode.l10n.t("Terminal Grid API: All {0} tests passed!", passed));
      } else {
        vscode.window.showWarningMessage(vscode.l10n.t("Terminal Grid API: {0} test(s) failed. See output.", failed));
      }
    }),
// Copy MCP configuration to clipboard
    vscode.commands.registerCommand("terminalGrid.copyMcpConfig", () => {
      const port = mcpBridge?.getPort() ?? 7890;
      const mcpServerPath = path.join(
        context.extensionPath,
        "mcp-server.js"
      );
      const config = {
        mcpServers: {
          "terminal-grid": {
            command: "node",
            args: [mcpServerPath],
            env: { TERMINAL_GRID_PORT: String(port) },
          },
        },
      };
      vscode.env.clipboard.writeText(JSON.stringify(config, null, 2));
      vscode.window.showInformationMessage(
        vscode.l10n.t("Terminal Grid MCP config copied to clipboard (port {0})", port)
      );
    })
  );
}

export function deactivate(): void {
  mcpBridge?.stop();
  mcpBridge = undefined;
  TerminalGridPanel.currentPanel?.dispose();
}
