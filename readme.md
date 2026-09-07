# Terminal Grid

### 0.7.0 improvements

Returning to a hidden grid preserves the history you were reading or follows the newest output if you were at the bottom. Hidden layout changes no longer resize running terminals to two columns. Cell zoom and divider proportions survive webview restoration.

Copy reports character/line counts after clipboard success and keeps the selection on failure. Long pastes show progress; **Cancel paste** or Ctrl+C stops pending input without submitting the remaining text. The cell context menu now offers **Preview selection** and **Search / save history** for a stable, searchable snapshot and `.txt` export.

Tab layouts and cell settings are stored per workspace. Legacy global settings are copied once without deleting the source; layouts already overwritten by another window cannot be reconstructed automatically. The sidebar's **Version and MCP status** button distinguishes the running build from the last local installation.

MCP `read_cell` now returns a JSON result with an `output` field and defaults to the parsed current terminal screen. Use `mode: "history"` for raw output history. Results include capture time, line range, truncation and process status; submitted commands return success only after the complete input reaches the terminal writer. Commands to the same cell are serialized, and exited cells reject input.

[English](./README.md) | [한국어](./docs/README.ko.md) | [中文](./docs/README.zh-CN.md) | [日本語](./docs/README.ja.md) | [Português (Brasil)](./docs/README.pt-BR.md) | [Español](./docs/README.es.md) | [Français](./docs/README.fr.md) | [Deutsch](./docs/README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Run Claude Code, Codex, and your dev server side by side — in a single VS Code tab.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>Zero config. Just tell your AI what to run.</em></p>

## Why Terminal Grid?

VS Code's built-in terminal lets you split panes, but it can't do this:

- **AI agents control your terminals** — Claude Code or Codex can run commands in any cell and read the output via MCP
- **One prompt, multiple terminals** — "Run the server in cell 2, tests in cell 3, and watch logs in cell 4"
- **Grid layout up to 4×5** — 20 terminals in one tab, drag borders to resize like Excel
- **Merge, broadcast, preset** — combine cells, send to all at once, save per-project configs

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## MCP Integration — AI-Powered Terminal Control

Terminal Grid includes a built-in [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server. AI agents can see your grid, run commands in any cell, and read the output — all through natural language.

**One prompt, three terminals at once:**

> "Run ls in cell 2, show git log in cell 3, and run git status in cell 4"

The AI calls `get_grid_info` to discover the layout, then `send_to_cell` for each target — commands execute simultaneously across your grid.

### Setup

VS Code's built-in MCP provider discovers Terminal Grid when the extension activates. For external clients, run **Terminal Grid: Copy MCP Config** (or click the `TG :port` status item) to get the version-independent launcher path.

For Codex CLI, use the path from `args` in the copied configuration:

```sh
codex mcp add terminal-grid -- node "<path-to-mcp-server.js>"
```

Existing Codex registrations with broken/versioned launcher paths are repaired on activation, preserving other settings. Restart the Codex session after updating to refresh its MCP tools. A CLI launched inside Grid uses its originating window; other clients select the project matching their working directory. An old shared `TERMINAL_GRID_PORT` setting is ignored for discovery. To intentionally pin a port, append `--port 7890` to the server arguments.

With multiple windows, call `list_windows` to see projects and their `windowId`, then pass the intended `windowId` or a unique `workspace` name to the tools. For example, `get_grid_info({"workspace":"oak"})` and `read_cell({"workspace":"oak","tabId":1,"cellId":2,"lines":10})` address **oak → Tab 1 → Cell 2**. Duplicate project names/windows require an exact `windowId`. Cell and tab numbers match the UI and start at 1; internal HTTP/extension IDs remain zero-based for compatibility.

`connection closed: initialize response` can indicate a missing launcher: check `codex mcp get terminal-grid` and confirm its script exists. The separate `codex_apps` error `401 token_expired` comes from Codex account authentication. Restart Codex to use refreshed credentials; if it persists, sign in again with `codex login`. See [OpenAI authentication documentation](https://learn.chatgpt.com/docs/auth).

### MCP Tools

| Tool | Description |
|------|-------------|
| `list_windows` | List editor windows, project paths and exact window IDs |
| `get_grid_info` | Get UI tab/cell numbers, labels and availability in the selected window |
| `send_to_cell` | Send text/commands to a specific cell |
| `read_cell` | Read terminal output from a cell |
| `broadcast` | Send text to all available cells in one selected window/tab |

### LLM CLI Support

Run LLM CLI tools (Claude Code, Codex, etc.) directly inside grid cells. Terminal Grid automatically detects LLM TUI apps and sends the correct key sequences (CSI u / Kitty keyboard protocol) — Enter, Tab, and arrow keys just work.

## Features

### Grid Layout

Open up to 4x5 (20) terminals arranged in a customizable grid. Drag cell borders to resize — just like Excel.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### Cell Merge

Merge adjacent cells into a single larger terminal. Select cells in the sidebar grid preview, click Merge, and open the grid — the merged region becomes one big pane. Useful for giving more space to a primary terminal while keeping smaller cells for monitoring.

### Startup Commands & Presets

Auto-run commands when terminals spawn. Save entire grid configurations (size, merge regions, colors, commands) as presets — per-project auto-load supported.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### Per-Cell Customization

Individual background color, foreground color, and font per cell. Apply to all cells at once or customize each one.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### Broadcast Input

Send commands to all terminals or selected cells at once.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### CLI startup and resume

In **Startup Commands**, choose **CLI launch** (Codex or Claude Code), a **Launch mode**, and **Add launch step**. Modes are new conversation, session picker, latest conversation, and a specific session ID. Optional CLI arguments are shown in the command preview. Select **All** for defaults or a cell tab for its own steps. Different sessions in the same project should use distinct session IDs.

Resume modes start with `codex resume` or `claude --resume` directly. Simple existing launch → `/resume` sequences are compiled the same way at runtime, including explicit delays, without changing saved settings. Later steps wait for a stable empty CLI input area. Login/confirmation screens and session pickers hold the sequence; complete them in the terminal to continue. After `terminalGrid.startupReadyTimeout` (60 seconds by default), the cell shows **Check again** and **Cancel startup**. Checking again continues the pending step; uncertain typed text is never blindly retried.

### Copying long selections

Drag with the mouse and use the wheel to extend a selection across scrollback. Output for that cell is held during the drag and resumes when you release the button or leave the window. The selected text is saved before output resumes, so a CLI redraw cannot shorten the copy. Use Ctrl+C, Ctrl+Shift+C, the context menu, or **Copy saved selection** when it appears. Escape, typing, or a new selection discards the saved text. In applications that capture the mouse, hold Shift to select.

`terminalGrid.scrollback` defaults to 20,000 rows per cell and can be raised to 100,000. Wrapped lines consume multiple rows. A full-screen alternate buffer only contains the application's current screen; increasing scrollback cannot recover text the application has already removed.

### And More

- **Codex CLI Support** — Existing registrations in `$CODEX_HOME/config.toml` (default `~/.codex/config.toml`) are repaired after extension updates
- **Cell Labels** — Name each terminal for easy identification
- **Context Menu** — Right-click to paste, clear, restart, kill, or rename
- **Themes** — 8 built-in color themes
- **Custom Fonts** — Load .ttf/.otf/.woff/.woff2 files
- **Project Folders** — Register folders in the sidebar. Click to switch, Ctrl+Click to open in a new window
- **Remote-SSH Compatible** — Works out of the box
- **Collapsible Sidebar** — All sections collapse, state persisted

## Quick Start

1. Install the extension
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. A terminal grid appears in the editor area

## Commands

| Command | Description |
|---------|-------------|
| `Terminal Grid: Open Grid` | Open grid with default size (settings) |
| `Terminal Grid: Open 2x2` | Open a 2x2 grid |
| `Terminal Grid: Open 2x3` | Open a 2x3 grid |
| `Terminal Grid: Open 3x3` | Open a 3x3 grid |
| `Terminal Grid: Open Custom Grid` | Open grid with custom dimensions |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `terminalGrid.defaultRows` | `2` | Default number of rows (1-4) |
| `terminalGrid.defaultCols` | `3` | Default number of columns (1-5) |
| `terminalGrid.zoomPercent` | `100` | Global terminal font zoom (50-300%) |
| `terminalGrid.scrollback` | `20000` | Scrollback rows per cell (1,000–100,000) |
| `terminalGrid.fontFamily` | `""` | Font family override (empty = IDE theme) |
| `terminalGrid.backgroundColor` | `""` | Background color override (empty = IDE theme) |
| `terminalGrid.foregroundColor` | `""` | Foreground color override (empty = IDE theme) |
| `terminalGrid.apiPort` | `7890` | MCP HTTP bridge port (0 = disabled) |

## Agent API

Extensions can programmatically control Terminal Grid via VS Code commands:

```typescript
// Get grid info
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');
// { rows: 2, cols: 3, cellCount: 6, cellLabels: ['1','2',...] }

// Send command to cell 0
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// Read output from cell 0 (last 10 lines)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## Security

The MCP bridge listens on `127.0.0.1` only (default port `7890`, configurable via `terminalGrid.apiPort`). It does not accept remote connections.

MCP registrations point to a standalone `mcp-server.js` in version-independent extension storage. Existing broken registrations are repaired on activation. Before uninstalling, remove `terminal-grid` from any external clients you configured; for Codex, run `codex mcp remove terminal-grid`. Existing Claude Desktop registrations can be removed from its `claude_desktop_config.json`. Shared workspace MCP files are not modified automatically.

The bridge rejects browser origins and unexpected Host headers. Local processes can still access it and execute commands; set `terminalGrid.apiPort` to `0` to disable the bridge.

### Development checks

Run `npm test` for type checks, a build and Node regression tests. Run `npm run test:clipboard` for Chromium clipboard tests (Microsoft Edge by default; set `PLAYWRIGHT_CHANNEL=chromium` after `npx playwright install chromium` on other systems). `npm run compile` only builds; `npm run package` creates the VSIX.

Run `npm run deploy` (alias `npm run install:local`) to build, package, install through the editor CLI and automatically **Reload Window** in active editor windows with Terminal Grid. Finish terminal jobs before deploying. Set `TERMINAL_GRID_EDITOR=codium` to install with VSCodium. To install an already-built VSIX without reloading, run `node scripts/install.js --no-reload`. Versions without the reload watcher need one manual **Developer: Reload Window** after installation; subsequent deployments reload automatically.

`npm run test:windows` discovers real running windows, verifies their project routing and reads each cell with `lines:0`. It never types commands into terminals.

## Requirements

- VS Code 1.80.0+

## License

[MIT](LICENSE)

After Reload Window, run `npm run verify:install` to compare every active window with the deployment record saved in `~/.terminal-grid/deployment.json` before the reload signal.
