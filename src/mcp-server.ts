import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as http from "http";

const PORT = (() => {
  const idx = process.argv.indexOf("--port");
  if (idx !== -1 && process.argv[idx + 1]) {
    return parseInt(process.argv[idx + 1], 10);
  }
  return parseInt(process.env.TERMINAL_GRID_PORT || "7890", 10);
})();

function httpRequest(method: string, reqPath: string, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port: PORT, path: reqPath, method, headers: { "Content-Type": "application/json" }, timeout: 5000 },
      (res) => {
        let data = "";
        res.on("data", (chunk: string) => { data += chunk; });
        res.on("end", () => {
          try { resolve(JSON.parse(data)); } catch { resolve({ error: "Invalid JSON response", raw: data }); }
        });
      }
    );
    req.on("error", (e: Error) => reject(new Error(`Cannot connect to Terminal Grid on port ${PORT}. Is VS Code running with the extension active? (${e.message})`)));
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const server = new McpServer(
  { name: "terminal-grid", version: "1.0.0" },
  {
    instructions: "You have access to Terminal Grid — a VS Code tmux-like terminal multiplexer. Use get_grid_info first to see the grid layout, then send_to_cell/broadcast to run commands (always use submit:true to execute). Use read_cell to check output. These tools work with both shell and LLM TUI apps (claude, codex) automatically.",
  }
);

server.registerTool(
  "get_grid_info",
  {
    description: "Get information about the current Terminal Grid (a VS Code tmux-like terminal multiplexer). Returns grid dimensions (rows x cols), total cell count, and cell labels. Call this first to discover the grid layout before sending commands. Returns null grid if no grid is open.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const result = await httpRequest("GET", "/api/info");
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true as const };
    }
  }
);

server.registerTool(
  "send_to_cell",
  {
    description: "Send text to a specific terminal cell in Terminal Grid. Each cell is an independent terminal (PTY). Always set submit=true when you want to execute a command — this automatically sends the correct Enter key for the environment (shell, PowerShell/PSReadLine, or LLM TUI like claude/codex). Do NOT manually append \\r or \\n. PSReadLine compatibility is handled automatically. Cell numbers are 1-based, matching the labels shown in the grid UI (use get_grid_info to see available cells).",
    inputSchema: z.object({
      cellId: z.number().int().min(1).describe("Cell number (1-based, matches the label shown in the grid UI). Use get_grid_info to see available cells."),
      text: z.string().describe("Text to send to the terminal. Do not include \\r or \\n — use submit=true instead."),
      submit: z.boolean().optional().default(false).describe("Set to true to execute the text as a command (presses Enter). Automatically detects whether the cell is running a shell or an LLM TUI app and sends the correct Enter key sequence. Default: false."),
    }),
  },
  async ({ cellId, text, submit }) => {
    try {
      const result = await httpRequest("POST", "/api/send", { cellId: cellId - 1, text, submit });
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true as const };
    }
  }
);

server.registerTool(
  "read_cell",
  {
    description: "Read output from a specific terminal cell in Terminal Grid. Returns the terminal's recent output buffer as text. Useful for checking command results, monitoring processes, or reading LLM responses. Use the lines parameter to limit to the most recent N lines.",
    inputSchema: z.object({
      cellId: z.number().int().min(1).describe("Cell number (1-based, matches the label shown in the grid UI). Use get_grid_info to see available cells."),
      lines: z.number().optional().describe("Number of recent lines to return. Omit to get the full buffer (up to 50KB)."),
    }),
  },
  async ({ cellId, lines }) => {
    try {
      const internalId = cellId - 1;
      const body: Record<string, unknown> = { cellId: internalId };
      if (lines !== undefined) body.lines = lines;
      const result = await httpRequest("POST", "/api/read", body) as { output?: string | null; error?: string };
      if (result.output === null || result.output === undefined) {
        return { content: [{ type: "text" as const, text: result.error ? `Error: ${result.error}` : `Cell ${cellId} not found` }], isError: true as const };
      }
      return { content: [{ type: "text" as const, text: result.output }] };
    } catch (e: unknown) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true as const };
    }
  }
);

server.registerTool(
  "broadcast",
  {
    description: "Send the same text to ALL terminal cells in Terminal Grid at once. Set submit=true to execute as a command in every cell. Useful for running the same command across multiple terminals simultaneously.",
    inputSchema: z.object({
      text: z.string().describe("Text to send to all cells. Do not include \\r or \\n — use submit=true instead."),
      submit: z.boolean().optional().default(false).describe("Set to true to execute in all cells (presses Enter). Automatically handles shell and LLM TUI apps. Default: false."),
    }),
  },
  async ({ text, submit }) => {
    try {
      const result = await httpRequest("POST", "/api/broadcast", { text, submit });
      return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
    } catch (e: unknown) {
      return { content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true as const };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

main().catch(() => process.exit(1));
