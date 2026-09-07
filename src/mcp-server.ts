import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { version } from "../package.json";
import { discoverWindows, McpConnection } from "./McpConnection";
import type { GridWindow } from "./McpWindows";
import type { CellStatus } from "./CellIo";

const portIndex = process.argv.indexOf("--port");
const rawPort = portIndex >= 0 ? process.argv[portIndex + 1] : undefined;
if (portIndex >= 0 && (!rawPort || !/^\d+$/.test(rawPort) || Number(rawPort) < 1 || Number(rawPort) > 65535)) {
  console.error("Terminal Grid: --port must be an integer between 1 and 65535.");
  process.exit(1);
}
const connection = new McpConnection(rawPort ? Number(rawPort) : undefined);
const windowSchema = {
  windowId: z.string().optional().describe("Exact editor window ID from list_windows. Use this to target another VS Code window unambiguously."),
  workspace: z.string().optional().describe("Project folder path or unique project name (e.g. oak or 1592). Omit to use the originating Grid window or current working directory."),
};
const tabSchema = {
  ...windowSchema,
  tabId: z.number().int().min(1).optional().describe("Tab number shown in the editor, starting at 1. Omit to use the active tab in the selected window."),
};
const cellSchema = {
  ...tabSchema,
  cellId: z.number().int().min(1).describe("Cell number shown in the selected tab: 1 is the first cell, 2 is the second. Never use zero or internal/global IDs."),
};
type Target = { windowId?: string; workspace?: string; tabId?: number };
type Tab = { tabId: number; rows: number; cols: number; cellIds: number[]; labels: string[]; hiddenCellIds?: number[]; cellStatuses?: CellStatus[] };
type Info = { tabs: Tab[]; activeTabId: number | null };

function windowInfo(window: GridWindow) {
  return { windowId: window.windowId, workspaces: window.workspaces, port: window.port, version: window.version };
}

function displayTab(tab: Tab, index: number) {
  const hidden = new Set(tab.hiddenCellIds || []);
  const cells = tab.cellIds.map((internalId, local) => {
    const status = tab.cellStatuses?.[local];
    return { cellId: local + 1, label: tab.labels[local] || String(local + 1),
      available: !hidden.has(internalId) && (!status || status.state === "running"),
      hidden: hidden.has(internalId), ...(status || { state: "unknown" }) };
  });
  return { tabId: index + 1, rows: tab.rows, cols: tab.cols, cellCount: cells.length,
    cellIds: cells.filter(cell => cell.available).map(cell => cell.cellId), cellLabels: cells.map(cell => cell.label), cells };
}

async function getTarget(options: Target) {
  const window = await connection.target(options);
  const info = await connection.request(window, "GET", "/api/info") as unknown as Info;
  if (!Array.isArray(info.tabs)) throw new Error("Terminal Grid does not expose tabs. Update the extension and reload the editor.");
  const index = options.tabId === undefined ? info.tabs.findIndex(tab => tab.tabId === info.activeTabId) : options.tabId - 1;
  return { window, info, index, tab: info.tabs[index] as Tab | undefined };
}

function resolveCell(tab: Tab | undefined, cellId: number, requireRunning = false): number {
  if (!tab) throw new Error("The selected tab is not open. Call get_grid_info for available tabs.");
  const internalId = tab.cellIds[cellId - 1];
  if (internalId === undefined || tab.hiddenCellIds?.includes(internalId)) throw new Error(`Cell ${cellId} is not available in this tab. Use the cell numbers from get_grid_info.`);
  const status = tab.cellStatuses?.[cellId - 1];
  if (requireRunning && status && status.state !== "running") {
    throw new Error(`Cell ${cellId} is ${status.state}${status.exitCode === undefined ? "" : ` (exit code ${status.exitCode})`}. Restart the cell before sending input.`);
  }
  return internalId;
}

const result = (value: unknown) => ({ content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
async function run(action: () => Promise<unknown>) {
  try {
    const value = await action();
    return { ...result(value), ...(value && typeof value === "object" && "success" in value && value.success === false ? { isError: true as const } : {}) };
  }
  catch (error) { return { ...result(`Error: ${error instanceof Error ? error.message : String(error)}`), isError: true as const }; }
}

const server = new McpServer({ name: "terminal-grid", version }, {
  instructions: "Terminal Grid controls independent editor windows, tabs and cells. Call list_windows to identify projects, then get_grid_info for the intended window. Cell and tab numbers match the UI and start at 1. When launched inside Grid, default to that originating window; otherwise match the working directory. Always specify windowId when targeting another project. Use submit:true to press Enter. Input delivery confirms writing to the running terminal, not completion of the command. read_cell defaults to the parsed current screen; mode:history returns recent raw output with terminal controls removed and may contain overwritten content. Check status and truncation metadata. Do not guess ports or internal/global IDs.",
});

server.registerTool("list_windows", {
  description: "List running Terminal Grid editor windows with their exact windowId, project folder paths and port. Use windowId to distinguish projects or duplicate windows of the same project.",
  inputSchema: z.object({}),
}, async () => run(async () => ({ windows: (await discoverWindows()).map(windowInfo) })));

server.registerTool("get_grid_info", {
  description: "Get the selected project's window, tabs and cell numbers exactly as shown in the UI (1, 2, ...). Reports running/starting/exited status and exit codes; only running, visible cells accept input. Defaults to the originating window or the project matching the working directory.",
  inputSchema: z.object(tabSchema),
}, async options => run(async () => {
  const { window, info, index, tab } = await getTarget(options);
  if (options.tabId !== undefined && !tab) throw new Error(`Tab ${options.tabId} is not open.`);
  const active = info.tabs.findIndex(t => t.tabId === info.activeTabId);
  return { window: windowInfo(window), grid: tab ? displayTab(tab, index) : null,
    tabs: info.tabs.map(displayTab), activeTabId: active < 0 ? null : active + 1 };
}));

server.registerTool("send_to_cell", {
  description: "Deliver text to the running cell shown in the selected window/tab. Requests for one cell execute in order; the response confirms delivery, not command completion. Set submit=true to press Enter. Do not append Enter characters. Multiline submission requires the application's bracketed paste mode. Use windowId or workspace to address another project.",
  inputSchema: z.object({ ...cellSchema, text: z.string(), submit: z.boolean().optional().default(false) }),
}, async options => run(async () => {
  const { window, tab, index } = await getTarget(options);
  const cellId = resolveCell(tab, options.cellId, true);
  const response = await connection.request(window, "POST", "/api/send", { cellId, text: options.text, submit: options.submit });
  return { ...response, ...(!response.delivery ? { delivery: "accepted", warning: "This window runs an older extension and cannot confirm delivery. Reload the window after updating." } : {}),
    window: windowInfo(window), tabId: index + 1, cellId: options.cellId };
}));

server.registerTool("read_cell", {
  description: "Read the parsed current terminal screen (default mode:screen), or recent raw output with control sequences removed (mode:history; overwritten text may remain). Returns output, timestamps, process status and line/truncation metadata. Use lines:0 to validate without terminal contents. Exited cells remain readable.",
  inputSchema: z.object({ ...cellSchema, mode: z.enum(["screen", "history"]).optional().default("screen"), lines: z.number().int().min(0).optional() }),
}, async options => run(async () => {
  const { window, tab, index } = await getTarget(options);
  const cellId = resolveCell(tab, options.cellId);
  const response = await connection.request(window, "POST", "/api/read", { cellId, lines: options.lines, mode: options.mode });
  if (typeof response.output !== "string") throw new Error(`Cell ${options.cellId} is not available.`);
  if (!response.mode && options.mode === "screen" && options.lines !== 0) {
    throw new Error("This window runs an older extension without current-screen reads. Reload it after updating, or explicitly request mode:history.");
  }
  return { ...response, ...(!response.mode ? { mode: "history", warning: "Legacy output: timestamps and truncation metadata require an extension update and window reload." } : {}),
    window: windowInfo(window), tabId: index + 1, cellId: options.cellId };
}));

server.registerTool("broadcast", {
  description: "Send the same text to every available cell in ONE selected window/tab. Set submit=true to execute. Use windowId/workspace and tabId to select the target; other tabs/windows are not affected.",
  inputSchema: z.object({ ...tabSchema, text: z.string(), submit: z.boolean().optional().default(false) }),
}, async options => run(async () => {
  const { window, tab, index } = await getTarget(options);
  if (!tab) throw new Error("No grid open in the selected tab.");
  const targets = tab.cellIds.map((internalId, local) => ({ internalId, local }))
    .filter(({ internalId, local }) => !tab.hiddenCellIds?.includes(internalId)
      && (!tab.cellStatuses?.[local] || tab.cellStatuses[local].state === "running"));
  const deliveries = await Promise.all(targets.map(async ({ internalId, local }) => {
    try {
      const response = await connection.request(window, "POST", "/api/send", { cellId: internalId, text: options.text, submit: options.submit });
      return { ...response, cellId: local + 1, delivery: response.delivery || "accepted" };
    } catch (error) {
      return { cellId: local + 1, success: false, delivery: "failed", error: error instanceof Error ? error.message : "Input delivery failed" };
    }
  }));
  const count = deliveries.filter(item => item.delivery !== "failed").length;
  return { success: count > 0 && count === targets.length, window: windowInfo(window), tabId: index + 1, cellCount: count, deliveries,
    ...(targets.length ? {} : { error: "No running cells available" }) };
}));

server.connect(new StdioServerTransport()).catch(error => {
  console.error("Terminal Grid MCP failed to start:", error);
  process.exit(1);
});
