# Changelog

## [0.7.0] - 2026-09-07

### Fixed
- Hidden/collapsed layouts no longer shrink terminals to 2 columns. Returning to a completed response follows the bottom when appropriate, preserves the history being read, and retains an anchor across resize/reflow. Restart keeps the actual PTY dimensions.
- Appearance changes preserve cell shell/startup settings. Tab layouts/settings and ID allocation are workspace scoped; restore uses saved panel identity instead of callback order and preserves legacy data during migration.
- MCP submissions serialize entire input requests and report actual delivery or failure. Exited/restarted cells cancel pending input. Startup checks the full composer, including text to the right of the cursor, multiline input, styled hints and wide characters.
- Copy keeps selections until clipboard success. Clipboard reads time out without submitting queued Enter; large pastes show progress and can be cancelled without submitting partial text.
- Output uses parse acknowledgments and PTY backpressure during ordinary output as well as selection.

### Added
- Context-menu selection preview and scrollback search, copy and text-file export.
- Version/MCP diagnostics showing running and last locally installed builds.
- MCP `read_cell` defaults to the parsed current screen. `mode: "history"` explicitly selects raw output history; results include `output`, capture time, range, truncation and cell lifecycle status.
- Per-cell zoom and grid proportions persist with the webview's tab identity.

## [0.6.1] - 2026-09-07

### Fixed
- Mouse selections follow wheel scrolling, including reverse, wide-character and word selections. Removed scroll preservation code tied to xterm's obsolete viewport element.
- Dragging temporarily holds that cell's output with PTY backpressure. Mouseup/blur resumes output and saves the selected text, so buffer trimming or CLI redraws cannot shorten subsequent keyboard, native or context-menu copies. A Copy saved selection button appears when output changes after selection.
- Escape, typing, a new selection, clear and restart discard saved selections; restarting discards held output. Startup automation cannot use a screen held for selection.

### Added
- Configurable scrollback (`terminalGrid.scrollback`), defaulting to 20,000 rows per cell.

## [0.6.0] - 2026-09-07

### Added
- CLI launch controls for Codex and Claude Code: new conversation, session picker, latest conversation or a specific session ID, with a command preview and optional CLI arguments.
- Per-cell startup progress, pause, Check again and Cancel startup controls. A configurable readiness timeout defaults to 60 seconds; retry continues the pending step without restarting completed commands.
- `npm run verify:install` checks live activation receipts against a durable deployment record written before Reload Window.

### Fixed
- Simple legacy CLI launch followed by `/resume` is compiled into a native resume command, preserving options and explicit delays without modifying saved settings.
- Startup readiness uses xterm's parsed screen and cursor, requiring a stable empty input area. Elapsed time, keyboard protocol negotiation and busy footers no longer authorize input. Login/confirmation dialogs and session pickers hold subsequent commands.
- Startup text is sent once and submitted only after confirming its contents in the composer. Failed confirmation, manual input, reset or cancellation cannot trigger blind backspaces, repeated typing or a stray Enter.

## [0.5.1] - 2026-09-07

### Changed
- Removed the Claude Desktop MCP registration card from the sidebar, including its status checks and registration handlers. Existing MCP registrations and launcher repair remain supported.

## [0.5.0] - 2026-09-07

### Fixed
- MCP `cellId` and `tabId` now match the UI: both start at 1 within the selected editor window/tab. Sparse internal cell IDs are translated by the server and no longer exposed as user-facing numbers. Existing MCP clients must refresh their tool schemas and grid information.
- Multiple VS Code windows are discovered by project, process and listening port. A shared legacy `TERMINAL_GRID_PORT` setting no longer sends every project to the first window.

### Added
- `list_windows` and optional `windowId` / `workspace` / `tabId` tool parameters for explicit cross-project targeting. Ambiguous project matches return an error instead of guessing.
- Grid terminals inherit their originating window ID. Modern bridges reject stale window identities after port reuse; Windows 0.4.1 sessions can be discovered through their actual listening process.
- `npm run test:windows` performs read-only MCP checks against running editor windows. Automated tests cover UI numbering, multi-window routing and invalid/stale targets.

## [0.4.1] - 2026-09-07

### Fixed
- Copy/paste shortcuts now cancel native duplicate handling and support Ctrl+Shift+C/V, Cmd+C/V and Shift+Insert. Text paste uses xterm's newline normalization and negotiated bracketed-paste mode.
- Plain copy preserves the exact selection, including wrapped lines and wide characters. Clipboard access failures fall back to the extension host; image paste retains earlier attachments until the panel closes.
- PTY writes are serialized so Enter and subsequent input cannot overtake a large paste; UTF-16 surrogate pairs remain intact and queued writes stop when a terminal closes.
- Clipboard reads preserve input order even when asynchronous replies arrive out of order; late paste replies are discarded after a cell restarts.
- Existing Codex MCP registrations are repaired to a stable path instead of deleted. The standalone server is refreshed by content, including rebuilds with the same version.
- MCP cell IDs consistently use one-based global IDs; failed commands return tool errors. Bridge port fallback/configuration changes publish the actual listening port.
- Startup readiness retains dialogs delivered alongside a screen clear, handles split escape sequences, cancels waits after restart and sends Kitty Enter only when the application enables it.
- Extension shutdown preserves the tab snapshot needed for reload.

### Changed
- Compilation only builds artifacts. `npm run deploy` builds, packages, installs via the editor CLI and triggers Reload Window. A reload watcher records the activated version/build so deployment can be verified; old extension folders are managed by the editor.
- Added HTTP/stdio, startup, configuration, PTY queue and Chromium clipboard regression tests, plus webview type checking.
- Updated vulnerable dependencies and removed the unused ZIP extraction dependency.

### Security
- The local HTTP bridge rejects browser origins, unexpected Host headers, invalid JSON and oversized request bodies.

## [0.4.0] - 2026

### Added
- **Multiple Tab Support** (#3) — open many independent grids as separate editor tabs
  - Sidebar **Tabs** card (collapsed by default, above Grid Size) with `+ New`, `⧉ Duplicate`, `× Close`
  - Right-click or double-click a tab for inline rename (no native dialog; focus stays in sidebar)
  - Per-tab isolation of labels, cell overrides, merged regions, startup steps, and custom name
  - **Sparse global cell IDs** — MCP `sendToCell` / `readCell` keep same signature; LLMs that remember a cell ID stay correct as long as the tab is open
  - `getGridInfo` extended with `tabs[]` + `activeTabId`; flat `rows`/`cols`/`cellCount`/`cellLabels` retained for backward compat
  - Multi-tab restore across VS Code restarts via `lastTabs[]` snapshot
  - Active tab indicator on Grid Size card header (`→ Tab 2`)
  - Editor tab title uses 1-based display index matching sidebar
- **VSCodium support** (#4) — linux-x64 `node-pty` prebuild bundled in VSIX so `require("node-pty")` resolves without network install
- **Tab management commands**: `Terminal Grid: New Tab`, `Duplicate Active Tab`, `Close Active Tab`, `Reset All Tabs (clear zombies)`, `Reset Cell IDs`
- **Security section** in README — all 8 language translations (en, ko, ja, zh-CN, de, es, fr, pt-BR)
- Localized help tooltips for Tabs and MCP Registration cards in 7 languages

### Changed
- **MCP hygiene** (#2) — on activation, stale `terminal-grid` entries in Claude Desktop config whose referenced `mcp-server.js` no longer exists are quietly removed
- `Open Grid` now preserves the active tab's identity: tab name, cell overrides, sidebar slot, and (when grid size unchanged) cell IDs all carry over
- `loadPreset` writes to the active tab's namespace and keeps it in the same slot

### Fixed
- Sidebar flicker on Open Grid eliminated via atomic `PanelRegistry.replace` (single `onDidChange` fire)
- Hidden tabs after reload now force-loaded shortly after first deserialize fires (option B self-heal), so the sidebar reflects all open grids almost immediately instead of after a 1.5s wait
- Zombie webview panels (stale VS Code workbench state pointing to removed extension paths) cleaned up via deserialize fallback removal + activation-time self-heal
- `dispose()` is idempotent and only clears `lastGrid`/`lastTabs` when the last panel closes
- Rename UI moved from `vscode.window.showInputBox` to in-card inline `<input>` — focus no longer jumps to the editor's top bar

### Security
- README Security section documents: `127.0.0.1`-only listener, configurable port (`terminalGrid.apiPort`, default `7890`), config file paths written, and recommended uninstall procedure (`Unregister MCP from Claude Desktop` before removal; stale entries auto-cleanup on next load)
- MCP registration remains explicit opt-in via the sidebar — no auto-registration on install (#2)

## [0.3.7] - 2026

### Added
- Copy (Plain) context menu — strips terminal wrapping artifacts
- Codex CLI auto-registration (`~/.codex/config.toml`)
- Auto-patch stale `.mcp.json` in workspace folders on activation
- "Why Terminal Grid?" section and AI-focused tagline in README

### Fixed
- Copy (Plain) clipboard write via `vscode.env.clipboard` (webview sandbox workaround)
- `getSelectionPosition()` property mismatch (`x`/`y` vs `row`/`col`)
- Selection lost on context menu click — now cached at right-click time

## [0.3.6] - 2026

### Added
- MCP auto-registration for Claude Code (`~/.claude.json`) and Claude Desktop
- VS Code Copilot MCP registration (`vscode.lm.registerMcpServerDefinitionProvider`)
- LLM TUI detection — auto-sends CSI u key sequences for Enter/Tab/arrows
- ANSI strip for `read_cell` output
- Chunked PTY writes to prevent input drops
- Project Folders sidebar — click to switch, Ctrl+click to open in new window

### Changed
- README restructured: MCP-first layout with demo GIF
- Removed manual MCP config instructions (auto-registers now)
- Removed node-pty requirement section (bundled)

## [0.3.5] - 2026

### Added
- Startup commands UI with sequential steps (command, wait, key)
- Per-cell startup step overrides
- Shell type selection (system default, bash, PowerShell, cmd, zsh)
- Default command per preset
- Key passthrough for special keys in terminal
- Build automation — VSIX auto-package and install on compile

## [0.3.4] - 2026

### Added
- 8 built-in color themes
- Broadcast CSI u support for LLM apps
- Grid resize (change rows/cols without reopening)
- Search improvements in sidebar

## [0.3.2] - 2026

### Fixed
- Marketplace image URLs (use raw GitHub links)
- Exclude GIF from VSIX package

## [0.3.1] - 2026

### Added
- MCP server integration — built-in HTTP bridge for LLM orchestration
- `Terminal Grid: Copy MCP Config` command
- `broadcast` MCP tool for sending to all cells
- Health check auto-shutdown for MCP server process
- Remote-SSH compatibility (`extensionKind: ["workspace"]`)
- `terminalGrid.apiPort` setting

### Fixed
- MCP server zombie process prevention (stdin close + health check)

## [0.3.0] - 2026

### Added
- Per-cell terminal customization (background, foreground, font)
- Settings tabs UI — [All] [1] [2] [3]... for global/per-cell control
- Collapsible sidebar sections with persisted state
- Selective broadcast — choose which cells receive broadcast input
- Agent API: `sendToCell`, `readCell`, `getGridInfo` commands
- `getCellLabels` in grid info response
- Built-in API test command (`Terminal Grid: Test API`)

### Fixed
- Override indicator (yellow border) clearing on global reset
- Settings tabs not appearing after grid open
- Preset load timing — config sent after grid creation
- `readCell(id, 0)` now returns empty string instead of full buffer
- node-pty install banner stuck on "Installing..."
- Dynamic spacing between collapsed/expanded sections

## [0.2.0] - 2026

### Added
- Sidebar control panel with glass-morphism UI
- Preset system — save/load/delete grid configurations
- Per-project preset auto-load
- Startup commands with per-cell assignment
- Cell labels and renaming
- Broadcast input to all terminals
- Custom font file loading (.ttf, .otf, .woff, .woff2)
- Terminal zoom control (50–300%)
- Color customization (background, foreground)
- Context menu (paste, clear, restart, kill, rename)
- Grid panel serialization (restore on VS Code restart)
- node-pty installation flow with sidebar banner

## [0.1.0] - 2026

### Added
- Initial release
- Grid terminal layout in editor tab
- Configurable rows and columns
- xterm.js terminal emulation
- node-pty pseudo-terminal backend
- Fallback to child_process when node-pty unavailable
