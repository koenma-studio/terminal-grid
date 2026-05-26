# Terminal Grid

[English](../README.md) | [한국어](./README.ko.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [Português (Brasil)](./README.pt-BR.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/icon.png" width="128" alt="Terminal Grid">
</p>

> Claude Code, Codex, 개발 서버를 나란히 실행하세요 — VS Code 탭 하나에서.

![MCP Demo](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-mcp.gif)

<p align="center"><em>설정 없이, AI에게 말하기만 하세요.</em></p>

## 왜 Terminal Grid인가?

VS Code 기본 터미널도 분할이 되지만, 이런 건 못합니다:

- **AI가 터미널을 제어** — Claude Code나 Codex가 MCP를 통해 셀에 명령을 실행하고 출력을 읽음
- **한 번의 명령, 여러 터미널** — "셀 2에서 서버 실행, 셀 3에서 테스트, 셀 4에서 로그 감시해줘"
- **4×5 그리드 레이아웃** — 탭 하나에 20개 터미널, 셀 경계를 드래그해서 크기 조절
- **병합, 브로드캐스트, 프리셋** — 셀 합치기, 전체 동시 전송, 프로젝트별 설정 저장

![Terminal Grid Screenshot](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/screenshot.png)

## MCP 연동 — AI 기반 터미널 제어

Terminal Grid에는 [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) 서버가 내장되어 있습니다. AI 에이전트가 그리드를 확인하고, 셀에 명령을 실행하고, 출력을 읽을 수 있습니다 — 자연어로.

**한 번의 프롬프트로 세 개의 터미널을 동시에:**

> "셀 2에서 ls 실행하고, 셀 3에서 git log 보여주고, 셀 4에서 git status 실행해줘"

AI가 `get_grid_info`로 레이아웃을 파악한 뒤 각 셀에 `send_to_cell`로 명령을 전송합니다 — 그리드 전체에서 동시에 실행됩니다.

### 설정 방법

별도 설정이 필요 없습니다 — 확장 활성화 시 MCP 서버가 자동 등록됩니다. Terminal Grid를 설치하면 MCP 클라이언트(Claude Code 등)가 자동으로 인식합니다.

### MCP 도구

| 도구 | 설명 |
|------|------|
| `get_grid_info` | 그리드 크기, 셀 수, 라벨 조회 |
| `send_to_cell` | 특정 셀에 텍스트/명령 전송 |
| `read_cell` | 셀의 터미널 출력 읽기 |
| `broadcast` | 모든 셀에 동시 전송 |

### LLM CLI 지원

LLM CLI 도구(Claude Code, Codex 등)를 그리드 셀 내에서 직접 실행할 수 있습니다. Terminal Grid가 LLM TUI 앱을 자동 감지하여 올바른 키 시퀀스(CSI u / Kitty 키보드 프로토콜)를 전송합니다 — Enter, Tab, 방향키가 그냥 작동합니다.

## 기능

### 그리드 레이아웃

최대 4x5 (20개) 터미널을 커스텀 가능한 그리드로 배치. 셀 경계를 드래그하여 크기 조절 — 엑셀처럼.

![Grid Layout](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-grid-open.gif)

### 셀 병합

인접한 셀을 하나의 큰 터미널로 병합. 사이드바 그리드 미리보기에서 셀을 선택하고 Merge를 클릭한 뒤 그리드를 열면 병합된 영역이 하나의 큰 패널이 됩니다. 주 터미널에 더 넓은 공간을 주면서 모니터링용 작은 셀을 유지할 때 유용합니다.

### 시작 명령 & 프리셋

터미널 생성 시 자동 실행 명령 설정. 전체 그리드 구성(크기, 병합 영역, 색상, 명령)을 프리셋으로 저장 — 프로젝트별 자동 로드 지원.

![Startup Commands](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-startup-commands.gif)

### 셀별 커스터마이징

셀마다 개별 배경색, 전경색, 폰트 설정. 전체 셀에 일괄 적용하거나 개별 커스터마이징 가능.

![Cell Customization](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-cell-customize.gif)

### 브로드캐스트 입력

전체 또는 선택한 셀에 명령 동시 전송.

![Broadcast](https://raw.githubusercontent.com/koenma-studio/terminal-grid/main/images/demo-broadcast.gif)

### 기타 기능

- **Codex CLI 지원** — 활성화 시 `~/.codex/config.toml`에 자동 등록
- **셀 라벨** — 각 터미널에 이름 지정
- **컨텍스트 메뉴** — 우클릭으로 붙여넣기, 지우기, 재시작, 종료, 이름 변경
- **테마** — 8가지 내장 색상 테마
- **커스텀 폰트** — .ttf/.otf/.woff/.woff2 파일 로드
- **프로젝트 폴더** — 사이드바에 폴더 등록. 클릭하면 이동, Ctrl+클릭하면 새 창에서 열기
- **Remote-SSH 호환** — 바로 사용 가능
- **접이식 사이드바** — 모든 섹션 접기/펼치기, 상태 자동 저장

## 빠른 시작

1. 확장 설치
2. `Ctrl+Shift+P` → **Terminal Grid: Open Grid**
3. 에디터 영역에 터미널 그리드 표시

## 명령어

| 명령어 | 설명 |
|--------|------|
| `Terminal Grid: Open Grid` | 기본 크기로 그리드 열기 (설정 참조) |
| `Terminal Grid: Open 2x2` | 2x2 그리드 열기 |
| `Terminal Grid: Open 2x3` | 2x3 그리드 열기 |
| `Terminal Grid: Open 3x3` | 3x3 그리드 열기 |
| `Terminal Grid: Open Custom Grid` | 커스텀 크기 그리드 열기 |

## 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `terminalGrid.defaultRows` | `2` | 기본 행 수 (1-4) |
| `terminalGrid.defaultCols` | `3` | 기본 열 수 (1-5) |
| `terminalGrid.zoomPercent` | `100` | 전역 터미널 폰트 줌 (50-300%) |
| `terminalGrid.fontFamily` | `""` | 폰트 패밀리 오버라이드 (빈값 = IDE 테마) |
| `terminalGrid.backgroundColor` | `""` | 배경색 오버라이드 (빈값 = IDE 테마) |
| `terminalGrid.foregroundColor` | `""` | 전경색 오버라이드 (빈값 = IDE 테마) |
| `terminalGrid.apiPort` | `7890` | MCP HTTP 브릿지 포트 (0 = 비활성화) |

## Agent API

다른 확장에서 VS Code 명령으로 Terminal Grid를 프로그래밍 제어할 수 있습니다:

```typescript
// 그리드 정보 조회
const info = await vscode.commands.executeCommand('terminalGrid.getGridInfo');

// 셀 0에 명령 전송
await vscode.commands.executeCommand('terminalGrid.sendToCell', 0, 'echo hello\r');

// 셀 0 출력 읽기 (최근 10줄)
const output = await vscode.commands.executeCommand('terminalGrid.readCell', 0, 10);
```

## 보안

MCP 브릿지는 `127.0.0.1`에서만 수신합니다 (기본 포트 `7890`, `terminalGrid.apiPort`로 변경 가능). 외부 네트워크 연결은 받지 않습니다.

Claude Desktop에 MCP 서버를 등록하면 `terminal-grid` 항목이 번들된 `mcp-server.js`를 가리키도록 기록됩니다. 확장을 제거하기 전에 **Terminal Grid: Claude Desktop에서 MCP 등록 해제**를 실행하면 깔끔하게 정리됩니다. 등록된 스크립트 경로가 더 이상 존재하지 않는 경우 다음 확장 활성화 시 자동으로 정리됩니다.

## 요구사항

- VS Code 1.80.0+

## 라이선스

[MIT](../LICENSE)
