# Terminal Grid

### 0.7.0 개선 사항

다른 작업을 하다 돌아오면 과거 기록을 읽던 위치를 유지하고, 맨 아래를 보고 있었다면 최신 출력으로 이어집니다. 숨겨진 화면의 크기가 0이 되어도 실행 중인 터미널을 2열로 줄이지 않습니다. 셀 확대 비율과 구분선 위치도 웹뷰 복원 시 유지됩니다.

복사는 클립보드 저장 성공 후 글자·줄 수를 표시하고, 실패하면 선택 내용을 보관합니다. 긴 붙여넣기는 진행 상황을 표시하며 **붙여넣기 취소** 또는 Ctrl+C로 남은 입력을 전송하지 않고 중단할 수 있습니다. 우클릭 메뉴의 **선택 내용 미리보기**, **기록 검색 / 저장**에서 내용을 확인·검색하고 `.txt` 파일로 저장할 수 있습니다.

탭 구성과 셀 설정은 워크스페이스별로 저장됩니다. 기존 전역 설정은 원본을 지우지 않고 한 번 복사합니다. 예전에 다른 창에서 이미 덮어쓴 구성까지 자동으로 복원할 수는 없습니다. 사이드바 **버전 및 MCP 상태**에서 실행 중인 빌드와 마지막 로컬 설치를 비교할 수 있습니다.

MCP `read_cell`의 기본값은 현재 렌더링 화면이며, JSON 결과의 `output`에 내용이 들어갑니다. 원시 출력 기록은 `mode: "history"`로 요청합니다. 결과에는 조회 시각·행 범위·잘림 여부·프로세스 상태가 포함됩니다. 같은 셀의 명령은 순서대로 전달하고, 전체 입력 전달을 확인한 뒤 성공을 반환하며, 종료된 셀에는 실패를 반환합니다.

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

VS Code 내장 MCP 공급자는 확장 활성화 시 Terminal Grid를 인식합니다. 외부 클라이언트에서는 **Terminal Grid: Copy MCP Config** 명령 또는 상태 표시줄의 `TG :포트`를 눌러 버전과 무관한 실행 경로를 확인하세요.

Codex CLI는 복사한 설정의 `args` 경로를 사용해 등록합니다.

```sh
codex mcp add terminal-grid -- node "<mcp-server.js 경로>"
```

이미 등록된 Codex 설정의 오래되거나 사라진 경로는 확장 활성화 시 복구하며 다른 설정은 유지합니다. 업데이트 후 Codex 세션을 다시 시작해 MCP 도구를 갱신하세요. Grid 안에서 시작한 CLI는 자신이 실행된 창에 연결하고, 다른 클라이언트는 현재 작업 경로와 일치하는 프로젝트를 선택합니다. 기존 공용 `TERMINAL_GRID_PORT` 설정은 자동 탐색에 사용하지 않습니다. 포트를 의도적으로 고정하려면 서버 인자에 `--port 7890`을 추가하세요.

창이 여러 개라면 `list_windows`로 프로젝트와 `windowId`를 확인하고, 도구 호출에 원하는 `windowId` 또는 고유한 `workspace` 이름을 지정하세요. 예를 들어 `get_grid_info({"workspace":"oak"})`, `read_cell({"workspace":"oak","tabId":1,"cellId":2,"lines":10})`는 **oak → 탭 1 → 셀 2**를 가리킵니다. 같은 프로젝트의 창이 여러 개면 정확한 `windowId`가 필요합니다. 셀과 탭 번호는 화면처럼 1부터 시작하며, 내부 HTTP·확장 API의 기존 번호만 호환성을 위해 유지합니다.

`connection closed: initialize response`가 나오면 `codex mcp get terminal-grid`로 실행 파일 경로가 실제로 존재하는지 확인하세요. 별도 서버인 `codex_apps`의 `401 token_expired`는 Codex 계정 인증 오류입니다. Codex를 다시 시작해 갱신된 인증을 사용하고, 계속되면 `codex login`으로 다시 로그인하세요. [OpenAI 인증 문서](https://learn.chatgpt.com/docs/auth)를 참고하세요.

### MCP 도구

| 도구 | 설명 |
|------|------|
| `list_windows` | 편집기 창의 프로젝트 경로 및 고유한 창 ID 조회 |
| `get_grid_info` | 선택한 창의 화면 기준 탭·셀 번호, 라벨, 사용 가능 여부 조회 |
| `send_to_cell` | 특정 셀에 텍스트/명령 전송 |
| `read_cell` | 셀의 터미널 출력 읽기 |
| `broadcast` | 선택한 창·탭의 사용 가능한 셀에 동시 전송 |

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

### CLI 시작과 대화 재개

**시작 명령**에서 **CLI 시작**(Codex 또는 Claude Code)과 **시작 방식**을 선택한 뒤 **시작 단계 추가**를 누릅니다. 새 대화, 세션 선택, 최근 대화 이어가기, 특정 세션을 지원하며 추가 CLI 옵션은 명령 미리보기에 표시됩니다. **전체** 탭은 기본값, 셀 탭은 해당 셀의 시작 단계를 설정합니다. 같은 프로젝트에서 서로 다른 대화를 이어가려면 셀마다 세션 ID를 지정하세요.

재개 방식은 `codex resume` 또는 `claude --resume`으로 바로 시작합니다. 기존의 단순한 실행 → `/resume` 조합도 저장된 설정을 바꾸지 않고 실행 시 변환하며 명시적인 대기 시간은 유지합니다. 후속 단계는 CLI의 빈 입력란이 안정적으로 표시될 때 진행합니다. 로그인·확인창이나 세션 선택창에서는 사용자 조작을 기다립니다. `terminalGrid.startupReadyTimeout`(기본 60초)이 지나면 셀에 **다시 확인**, **시작 단계 취소** 버튼이 나타납니다. 다시 확인은 대기 중인 단계부터 진행하며, 입력 결과가 불확실할 때 텍스트를 반복해서 보내지 않습니다.

### 긴 내용 복사

마우스로 드래그하면서 휠을 돌리면 스크롤 기록까지 선택할 수 있습니다. 드래그 중에는 해당 셀의 출력을 잠깐 보류하고, 버튼을 놓거나 창을 벗어나면 출력을 재개합니다. 선택한 텍스트는 출력 재개 전에 보관하므로 CLI가 화면을 다시 그려도 복사 내용이 줄어들지 않습니다. Ctrl+C, Ctrl+Shift+C, 우클릭 메뉴 또는 표시되는 **보관된 선택 내용 복사** 버튼을 사용하세요. Esc, 새 입력, 새 선택은 보관한 내용을 해제합니다. 마우스를 직접 사용하는 CLI에서는 Shift를 누른 채 선택하세요.

`terminalGrid.scrollback`은 셀마다 기본 20,000행을 보관하며 최대 100,000행으로 늘릴 수 있습니다. 자동 줄바꿈도 행을 사용합니다. 전체 화면 CLI의 대체 화면에는 현재 화면만 남으므로, 기록을 늘려도 CLI가 이미 지운 내용을 되살릴 수는 없습니다.

### 기타 기능

- **Codex CLI 지원** — 업데이트 후 `$CODEX_HOME/config.toml`(기본 `~/.codex/config.toml`)의 기존 등록 경로 복구
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
| `terminalGrid.scrollback` | `20000` | 셀별 스크롤 기록 행 수 (1,000–100,000) |
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

MCP 등록은 버전과 무관한 확장 저장소의 독립 실행 파일 `mcp-server.js`를 가리킵니다. 기존의 깨진 등록 경로는 활성화 시 복구합니다. 확장을 제거하기 전에 설정했던 외부 클라이언트에서 `terminal-grid`를 제거하세요. Codex에서는 `codex mcp remove terminal-grid`를 실행하고, 기존 Claude Desktop 등록은 `claude_desktop_config.json`에서 제거할 수 있습니다. 공유 작업 공간의 MCP 설정 파일은 자동으로 변경하지 않습니다.

브릿지는 브라우저 Origin 및 예상하지 않은 Host 헤더를 거부합니다. 로컬 프로세스는 여전히 접근해 명령을 실행할 수 있으므로 브릿지를 끄려면 `terminalGrid.apiPort`를 `0`으로 설정하세요.

### 개발 검증

`npm test`는 타입 검사·빌드·Node 회귀 테스트를 실행합니다. `npm run test:clipboard`는 Chromium 기반 클립보드 테스트를 실행합니다(기본 Microsoft Edge). `npm run compile`은 빌드만 수행하고, `npm run package`는 VSIX를 생성합니다.

`npm run deploy`(또는 `npm run install:local`)는 빌드→VSIX 생성→편집기 CLI 설치→Terminal Grid가 활성화된 편집기 창의 **Reload Window**까지 실행합니다. 실행 중인 터미널 작업을 마친 뒤 사용하세요. VSCodium에 설치하려면 `TERMINAL_GRID_EDITOR=codium`을 설정합니다. 이미 빌드한 VSIX를 리로드 없이 설치하려면 `node scripts/install.js --no-reload`를 실행하세요. 리로드 감시 코드가 없는 버전에서 업데이트할 때는 최초 한 번 **Developer: Reload Window**가 필요하며, 이후 배포부터 자동 리로드됩니다.

`npm run test:windows`는 실제 열린 창의 프로젝트 연결과 각 셀의 조회(`lines:0`)를 검증합니다. 터미널에 명령을 입력하지 않습니다.

## 요구사항

- VS Code 1.80.0+

## 라이선스

[MIT](../LICENSE)

Reload Window 후 `npm run verify:install`을 실행하면 각 창의 적용 상태를 확인할 수 있습니다. 설치 기록은 리로드 신호 전에 `~/.terminal-grid/deployment.json`에 저장됩니다.
