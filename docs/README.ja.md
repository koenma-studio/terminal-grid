# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Claude Code、Codex、開発サーバーを並べて実行 — VS Codeのタブ1つで。

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>設定不要。AIに指示するだけ。</em></p>

## なぜTerminal Grid？

VS Code標準ターミナルもペイン分割はできますが、これはできません：

- **AIがターミナルを制御** — Claude CodeやCodexがMCP経由でセルにコマンド実行・出力読み取り
- **一言で複数ターミナル** — 「セル2でサーバー起動、セル3でテスト、セル4でログ監視して」
- **4×5グリッドレイアウト** — 1タブに20ターミナル、セル境界ドラッグでリサイズ
- **結合・ブロードキャスト・プリセット** — セル統合、一斉送信、プロジェクト別設定保存

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## MCP統合 — AIによるターミナル制御

Terminal Gridには[MCP（Model Context Protocol）](https://modelcontextprotocol.io/)サーバーが組み込まれています。AIエージェントがグリッドを確認し、任意のセルでコマンドを実行し、出力を読み取ることができます — すべて自然言語で。

**1つのプロンプトで3つのターミナルを同時に：**

> 「セル2でlsを実行、セル3でgit logを表示、セル4でgit statusを実行して」

AIが`get_grid_info`でレイアウトを把握し、各ターゲットに`send_to_cell`でコマンドを送信 — グリッド全体で同時に実行されます。

### セットアップ

設定は不要です — 拡張機能の有効化時にMCPサーバーが自動登録されます。Terminal Gridをインストールするだけで、MCPクライアント（Claude Codeなど）が自動的に検出します。

### MCPツール

| ツール | 説明 |
|--------|------|
| `get_grid_info` | グリッドサイズ、セル数、ラベルを取得 |
| `send_to_cell` | 指定セルにテキスト/コマンドを送信 |
| `read_cell` | セルのターミナル出力を読み取り |
| `broadcast` | すべてのセルに一括送信 |

### LLM CLIサポート

LLM CLIツール（Claude Code、Codexなど）をグリッドセル内で直接実行できます。Terminal GridはLLM TUIアプリを自動検出し、正しいキーシーケンス（CSI u / Kittyキーボードプロトコル）を送信します — Enter、Tab、矢印キーがそのまま動作します。

## 機能

### グリッドレイアウト

最大4x5（20個）のターミナルをカスタマイズ可能なグリッドに配置。セル境界をドラッグしてサイズ変更 — Excelのように。

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### セル結合

隣接するセルを1つの大きなターミナルに結合。サイドバーのグリッドプレビューでセルを選択し、Mergeをクリックしてグリッドを開くと、結合された領域が1つの大きなペインになります。メインターミナルに広いスペースを確保しながら、モニタリング用の小さなセルを維持するのに便利です。

### 起動コマンド & プリセット

ターミナル作成時にコマンドを自動実行。グリッド全体の構成（サイズ、結合領域、色、コマンド）をプリセットとして保存 — プロジェクト別の自動読み込みに対応。

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### セル別カスタマイズ

セルごとに背景色、前景色、フォントを個別設定。全セルに一括適用または個別にカスタマイズ可能。

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### ブロードキャスト入力

すべてのターミナルまたは選択したセルにコマンドを一括送信。

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### その他の機能

- **Codex CLI対応** — アクティベーション時に `~/.codex/config.toml` へ自動登録
- **セルラベル** — 各ターミナルに名前を付ける
- **コンテキストメニュー** — 右クリックで貼り付け、クリア、再起動、終了、名前変更
- **テーマ** — 8種類の組み込みカラーテーマ
- **カスタムフォント** — .ttf/.otf/.woff/.woff2 ファイルを読み込み
- **プロジェクトフォルダ** — サイドバーにフォルダを登録。クリックで切り替え、Ctrl+クリックで新しいウィンドウで開く
- **Remote-SSH対応** — すぐに使用可能
- **折りたたみ可能なサイドバー** — すべてのセクションを折りたたみ、状態を自動保存

## クイックスタート

1. 拡張機能をインストール
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. エディタ領域にターミナルグリッドが表示

## コマンド

| コマンド | 説明 |
|----------|------|
| `Terminal Grid: Open Grid` | デフォルトサイズでグリッドを開く |
| `Terminal Grid: Open 2x2` | 2x2グリッドを開く |
| `Terminal Grid: Open 2x3` | 2x3グリッドを開く |
| `Terminal Grid: Open 3x3` | 3x3グリッドを開く |
| `Terminal Grid: Open Custom Grid` | カスタムサイズのグリッドを開く |

## 設定

| 設定 | デフォルト | 説明 |
|------|------------|------|
| `terminalGrid.defaultRows` | `2` | デフォルト行数 (1-4) |
| `terminalGrid.defaultCols` | `3` | デフォルト列数 (1-5) |
| `terminalGrid.zoomPercent` | `100` | グローバルフォントズーム (50-300%) |
| `terminalGrid.fontFamily` | `""` | フォント上書き（空 = IDEテーマ） |
| `terminalGrid.backgroundColor` | `""` | 背景色上書き（空 = IDEテーマ） |
| `terminalGrid.foregroundColor` | `""` | 前景色上書き（空 = IDEテーマ） |
| `terminalGrid.apiPort` | `7890` | MCP HTTPブリッジポート（0 = 無効） |

## Agent API

他の拡張機能からVS Codeコマンドを使ってTerminal Gridをプログラムで制御できます：

```typescript
// グリッド情報を取得
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// セル0にコマンドを送信
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// セル0の出力を読み取り（直近10行）
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## セキュリティ

MCPブリッジは `127.0.0.1` でのみリッスンします (デフォルトポート `7890`、`terminalGrid.apiPort` で変更可)。リモート接続は受け付けません。

Claude Desktop に MCP サーバーを登録すると、バンドルされた `mcp-server.js` を指す `terminal-grid` エントリが書き込まれます。アンインストール前に **Terminal Grid: Claude Desktop の MCP 登録解除** を実行すると綺麗に削除されます。参照先スクリプトが存在しない古い登録は、次回の拡張機能起動時に自動的にクリーンアップされます。

## 要件

- VS Code 1.80.0+

## ライセンス

[MIT](../LICENSE)
