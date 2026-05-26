# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> 在一个 VS Code 标签页中并排运行 Claude Code、Codex 和开发服务器。

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>零配置，直接告诉 AI 该做什么。</em></p>

## 为什么选择 Terminal Grid？

VS Code 内置终端可以拆分面板，但做不到这些：

- **AI 控制终端** — Claude Code 或 Codex 通过 MCP 在任意单元格执行命令并读取输出
- **一句话，多个终端** — "在单元格 2 启动服务器，单元格 3 跑测试，单元格 4 监控日志"
- **4×5 网格布局** — 一个标签页 20 个终端，拖动边框像 Excel 一样调整大小
- **合并、广播、预设** — 合并单元格、全部同时发送、按项目保存配置

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## MCP 集成 — AI 驱动的终端控制

Terminal Grid 内置 [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) 服务器。AI 代理可以查看网格、在任意单元格中运行命令并读取输出 — 全部通过自然语言完成。

**一条指令，三个终端同时执行：**

> "在单元格 2 运行 ls，在单元格 3 显示 git log，在单元格 4 运行 git status"

AI 调用 `get_grid_info` 获取布局，然后对每个目标调用 `send_to_cell` — 命令在整个网格中同时执行。

### 设置方法

无需配置 — 扩展激活时 MCP 服务器自动注册。只需安装 Terminal Grid，您的 MCP 客户端（Claude Code 等）将自动发现它。

### MCP 工具

| 工具 | 描述 |
|------|------|
| `get_grid_info` | 获取网格尺寸、单元格数量和标签 |
| `send_to_cell` | 向指定单元格发送文本/命令 |
| `read_cell` | 读取单元格终端输出 |
| `broadcast` | 向所有单元格同时发送 |

### LLM CLI 支持

在网格单元格中直接运行 LLM CLI 工具（Claude Code、Codex 等）。Terminal Grid 自动检测 LLM TUI 应用并发送正确的键序列（CSI u / Kitty 键盘协议）— Enter、Tab 和方向键直接可用。

## 功能

### 网格布局

最多 4x5（20个）终端，可自定义网格排列。拖动单元格边框调整大小 — 像 Excel 一样。

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### 单元格合并

将相邻单元格合并为一个更大的终端。在侧边栏网格预览中选择单元格，点击 Merge，然后打开网格 — 合并区域变为一个大面板。适合为主终端提供更多空间，同时保留小单元格用于监控。

### 启动命令 & 预设

终端创建时自动执行命令。将整个网格配置（大小、合并区域、颜色、命令）保存为预设 — 支持按项目自动加载。

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### 单元格自定义

每个单元格可独立设置背景色、前景色和字体。可一键应用到所有单元格或逐个自定义。

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### 广播输入

向所有终端或选定单元格同时发送命令。

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### 更多功能

- **Codex CLI 支持** — 激活时自动注册到 `~/.codex/config.toml`
- **单元格标签** — 为每个终端命名
- **右键菜单** — 粘贴、清除、重启、终止或重命名
- **主题** — 8 种内置颜色主题
- **自定义字体** — 加载 .ttf/.otf/.woff/.woff2 文件
- **项目文件夹** — 在侧边栏注册文件夹。点击切换，Ctrl+点击在新窗口中打开
- **Remote-SSH 兼容** — 开箱即用
- **可折叠侧边栏** — 所有区域可折叠，状态自动保存

## 快速开始

1. 安装扩展
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. 编辑器区域显示终端网格

## 命令

| 命令 | 描述 |
|------|------|
| `Terminal Grid: Open Grid` | 以默认大小打开网格 |
| `Terminal Grid: Open 2x2` | 打开 2x2 网格 |
| `Terminal Grid: Open 2x3` | 打开 2x3 网格 |
| `Terminal Grid: Open 3x3` | 打开 3x3 网格 |
| `Terminal Grid: Open Custom Grid` | 打开自定义大小网格 |

## 设置

| 设置 | 默认值 | 描述 |
|------|--------|------|
| `terminalGrid.defaultRows` | `2` | 默认行数 (1-4) |
| `terminalGrid.defaultCols` | `3` | 默认列数 (1-5) |
| `terminalGrid.zoomPercent` | `100` | 全局终端字体缩放 (50-300%) |
| `terminalGrid.fontFamily` | `""` | 字体覆盖（空 = IDE 主题） |
| `terminalGrid.backgroundColor` | `""` | 背景色覆盖（空 = IDE 主题） |
| `terminalGrid.foregroundColor` | `""` | 前景色覆盖（空 = IDE 主题） |
| `terminalGrid.apiPort` | `7890` | MCP HTTP 桥接端口（0 = 禁用） |

## Agent API

其他扩展可以通过 VS Code 命令以编程方式控制 Terminal Grid：

```typescript
// 获取网格信息
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// 向单元格 0 发送命令
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// 读取单元格 0 输出（最近 10 行）
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## 安全

MCP 桥接仅监听 `127.0.0.1` (默认端口 `7890`,可通过 `terminalGrid.apiPort` 修改)。不接受远程连接。

在 Claude Desktop 中注册 MCP 服务器时,会写入指向打包的 `mcp-server.js` 的 `terminal-grid` 条目。卸载前请运行 **Terminal Grid: 从 Claude Desktop 取消注册 MCP** 进行清理。引用脚本不存在的过时注册(如旧版本残留)会在下次扩展加载时自动清除。

## 要求

- VS Code 1.80.0+

## 许可证

[MIT](../LICENSE)
