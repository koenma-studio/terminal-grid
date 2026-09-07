import type { Terminal } from "@xterm/xterm";

const MAX_ROWS = 20000;
const MAX_CHARS = 8 * 1024 * 1024;
let nextRequest = 0;
let closeCurrent: (() => void) | undefined;

export interface HistoryLabels {
  title: string; history: string; selection: string; search: string; previous: string; next: string;
  copy: string; save: string; close: string; refresh: string; captured: string; limited: string;
  alternate: string; characters: string; lines: string; copying: string; copied: string; copyFailed: string;
}

const english: HistoryLabels = {
  title: "Terminal text", history: "Scrollback", selection: "Selected text", search: "Find in text",
  previous: "Previous match", next: "Next match", copy: "Copy text", save: "Save .txt", close: "Close", refresh: "Refresh",
  captured: "Captured", limited: "Showing the latest retained text (limit: 20,000 rows / 8,388,608 characters).",
  alternate: "This application is using an alternate screen with no scrollback.",
  characters: "characters", lines: "lines", copying: "Copying…", copied: "Copied", copyFailed: "Copy failed. Try again.",
};
const korean: HistoryLabels = {
  title: "터미널 텍스트", history: "스크롤 기록", selection: "선택한 텍스트", search: "텍스트 검색",
  previous: "이전 결과", next: "다음 결과", copy: "텍스트 복사", save: ".txt 저장", close: "닫기", refresh: "새로 고침",
  captured: "기록 시각", limited: "보관된 최신 내용 중 최대 20,000행 / 8,388,608자를 표시합니다.",
  alternate: "이 앱은 스크롤 기록이 없는 대체 화면을 사용하고 있습니다.",
  characters: "자", lines: "줄", copying: "복사 중…", copied: "복사 완료", copyFailed: "복사하지 못했습니다. 다시 시도하세요.",
};

/** Read rendered cells, preserving soft wraps instead of stripping terminal escape codes. */
export function captureTerminalHistory(terminal: Terminal): { text: string; limited: boolean; alternate: boolean } {
  const buffer = terminal.buffer.active;
  const start = Math.max(0, buffer.length - MAX_ROWS);
  // Work backwards so a character limit retains the newest rows, then join in order.
  const rows: Array<{ text: string; wrapped: boolean }> = [];
  let characters = 0;
  let limited = start > 0;
  for (let index = buffer.length - 1; index >= start; index--) {
    const line = buffer.getLine(index);
    if (!line) continue;
    const nextWrapped = !!buffer.getLine(index + 1)?.isWrapped;
    let end = terminal.cols;
    // A wide glyph can wrap with an unused last column. Preserve printed spaces
    // while omitting this padding, so joining a CJK/emoji wrap adds no new spaces.
    while (nextWrapped && end > 0 && line.getCell(end - 1)?.getChars() === "" && line.getCell(end - 1)?.getWidth() === 1) end--;
    const text = line.translateToString(!nextWrapped, 0, end);
    if (characters + text.length + 1 > MAX_CHARS) { limited = true; break; }
    rows.push({ text, wrapped: line.isWrapped });
    characters += text.length + 1;
  }
  const logical: string[] = [];
  for (const row of rows.reverse()) {
    if (row.wrapped && logical.length) logical[logical.length - 1] += row.text;
    else logical.push(row.text);
  }
  while (logical.length && logical[logical.length - 1] === "") logical.pop();
  return { text: logical.join("\n"), limited, alternate: buffer.type === "alternate" };
}

function countText(text: string): { characters: number; lines: number } {
  let characters = 0;
  for (const _character of text) characters++;
  return { characters, lines: text ? (text.match(/\n/g)?.length ?? 0) + 1 : 0 };
}

export function openTerminalHistory(terminal: Terminal, selectedText: string, post: (message: unknown) => void,
  options: { initialView?: "history" | "selection"; labels?: Partial<HistoryLabels>; suggestedName?: string } = {}): void {
  closeCurrent?.();
  const labels = { ...(document.documentElement.lang.toLowerCase().startsWith("ko") ? korean : english), ...options.labels };
  let captured = captureTerminalHistory(terminal);
  let capturedAt = new Date();
  let selectionView = options.initialView === "selection" && !!selectedText;
  let matches: Array<{ start: number; end: number }> = [];
  let matchIndex = -1;
  let pendingCopy: string | undefined;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const style = document.createElement("style");
  style.textContent = `
    .tg-history{width:min(900px,calc(100vw - 40px));height:min(720px,calc(100vh - 40px));box-sizing:border-box;padding:18px;border:1px solid var(--vscode-panel-border,#555);border-radius:10px;background:var(--vscode-editor-background,#1e1e1e);color:var(--vscode-editor-foreground,#ddd);box-shadow:0 16px 60px #0008;font:13px var(--vscode-font-family,system-ui)}
    .tg-history[open]{display:flex;flex-direction:column;gap:10px}.tg-history::backdrop{background:#0007}
    .tg-history header,.tg-history nav,.tg-history footer,.tg-history-search{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.tg-history header strong{font-size:15px;flex:1}.tg-history button{padding:6px 10px;border:1px solid var(--vscode-button-border,#555);border-radius:5px;background:var(--vscode-button-secondaryBackground,#333);color:inherit;cursor:pointer;font:inherit}.tg-history button[aria-pressed=true]{background:var(--vscode-button-background,#075e9d);color:var(--vscode-button-foreground,#fff)}.tg-history button:disabled{opacity:.5;cursor:default}.tg-history button:focus-visible,.tg-history input:focus,.tg-history textarea:focus{outline:1px solid var(--vscode-focusBorder,#57a8ff);outline-offset:1px}
    .tg-history input,.tg-history textarea{background:var(--vscode-input-background,#252526);color:var(--vscode-input-foreground,#ddd);border:1px solid var(--vscode-input-border,#555);border-radius:4px;padding:7px;box-sizing:border-box}.tg-history input{flex:1;min-width:100px}.tg-history textarea{resize:none;width:100%;flex:1;min-height:80px;font:12px/1.5 var(--vscode-editor-font-family,monospace);white-space:pre;tab-size:4}.tg-history-meta,.tg-history-note{font-size:11px;opacity:.8}.tg-history-note:empty{display:none}.tg-history footer [role=status]{flex:1;min-width:100px}.tg-history-count{min-width:56px;text-align:center;font-variant-numeric:tabular-nums}
  `;
  const dialog = document.createElement("dialog");
  dialog.className = "tg-history";
  dialog.setAttribute("aria-label", labels.title);
  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "", className = ""): HTMLElementTagNameMap[K] => {
    const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
  };
  const button = (label: string, action: () => void): HTMLButtonElement => {
    const node = element("button", label); node.type = "button"; node.addEventListener("click", action); return node;
  };
  const header = element("header");
  const close = (): void => { if (!disposed) dialog.close(); };
  header.append(element("strong", labels.title), button(labels.close, close));
  const nav = element("nav");
  const historyButton = button(labels.history, () => { selectionView = false; render(); });
  const selectionButton = button(labels.selection, () => { selectionView = true; render(); });
  selectionButton.disabled = !selectedText;
  const refreshButton = button(labels.refresh, () => { captured = captureTerminalHistory(terminal); capturedAt = new Date(); render(); });
  nav.append(historyButton, selectionButton, refreshButton);
  const meta = element("div", "", "tg-history-meta");
  const note = element("div", "", "tg-history-note");
  const searchBar = element("div", "", "tg-history-search");
  const search = element("input"); search.type = "search"; search.placeholder = labels.search; search.setAttribute("aria-label", labels.search);
  const matchCount = element("span", "0 / 0", "tg-history-count"); matchCount.setAttribute("aria-live", "polite");
  const viewer = element("textarea"); viewer.readOnly = true; viewer.spellcheck = false; viewer.wrap = "off"; viewer.setAttribute("aria-label", labels.title);
  const footer = element("footer");
  const status = element("span"); status.setAttribute("role", "status");
  const copyText = (text: string): void => {
    if (pendingCopy || !text) return;
    pendingCopy = `history-${++nextRequest}`;
    copyButton.disabled = true; status.textContent = labels.copying;
    copyTimer = setTimeout(() => { pendingCopy = undefined; copyButton.disabled = !viewer.value; status.textContent = labels.copyFailed; }, 10000);
    post({ type: "clipboardWrite", text, requestId: pendingCopy });
  };
  const currentText = (): string => selectionView ? selectedText : captured.text;
  const copyButton = button(labels.copy, () => copyText(currentText()));
  const saveButton = button(labels.save, () => post({ type: "exportText", text: currentText(),
    suggestedName: options.suggestedName ?? `terminal-grid-${selectionView ? "selection" : "history"}.txt` }));
  footer.append(status, copyButton, saveButton);

  const showMatch = (): void => {
    matchCount.textContent = `${matches.length ? matchIndex + 1 : 0} / ${matches.length}${matches.length === 10000 ? "+" : ""}`;
    const match = matches[matchIndex];
    if (!match) return;
    viewer.setSelectionRange(match.start, match.end);
    // The readonly textarea is not focused while typing a query. Scroll it explicitly.
    const line = (viewer.value.slice(0, match.start).match(/\n/g)?.length ?? 0);
    viewer.scrollTop = Math.max(0, line * 18 - viewer.clientHeight / 2);
  };
  const findMatches = (): void => {
    matches = []; matchIndex = -1;
    if (search.value) {
      const query = new RegExp(search.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
      let match: RegExpExecArray | null;
      while ((match = query.exec(viewer.value)) && matches.length < 10000) matches.push({ start: match.index, end: match.index + match[0].length });
      if (matches.length) matchIndex = 0;
    }
    showMatch();
  };
  const moveMatch = (direction: number): void => {
    if (matches.length) { matchIndex = (matchIndex + direction + matches.length) % matches.length; showMatch(); viewer.focus(); }
  };
  search.addEventListener("input", findMatches);
  searchBar.append(search, button("↑", () => moveMatch(-1)), button("↓", () => moveMatch(1)), matchCount);
  searchBar.children[1].setAttribute("aria-label", labels.previous);
  searchBar.children[2].setAttribute("aria-label", labels.next);
  function render(): void {
    viewer.value = currentText();
    historyButton.setAttribute("aria-pressed", String(!selectionView));
    selectionButton.setAttribute("aria-pressed", String(selectionView));
    refreshButton.disabled = selectionView;
    const counts = countText(currentText());
    meta.textContent = `${counts.characters.toLocaleString()} ${labels.characters} · ${counts.lines.toLocaleString()} ${labels.lines} · ${labels.captured} ${capturedAt.toLocaleTimeString()}`;
    note.textContent = selectionView ? "" : [captured.limited ? labels.limited : "", captured.alternate ? labels.alternate : ""].filter(Boolean).join(" ");
    copyButton.disabled = !!pendingCopy || !viewer.value; saveButton.disabled = !viewer.value;
    status.textContent = ""; viewer.scrollTop = 0; findMatches();
  }
  const onMessage = (event: MessageEvent): void => {
    const message = event.data;
    if (!pendingCopy || message?.type !== "clipboardWriteResult" || message.requestId !== pendingCopy) return;
    clearTimeout(copyTimer); pendingCopy = undefined; copyButton.disabled = !viewer.value;
    status.textContent = message.success ? labels.copied : labels.copyFailed;
  };
  dialog.addEventListener("keydown", event => {
    event.stopPropagation();
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") { event.preventDefault(); search.focus(); search.select(); }
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && document.activeElement === viewer) {
      event.preventDefault(); copyText(viewer.value.slice(viewer.selectionStart, viewer.selectionEnd) || viewer.value);
    } else if (event.key === "Enter" && (event.target === search || event.target === viewer)) { event.preventDefault(); moveMatch(event.shiftKey ? -1 : 1); }
  });
  dialog.addEventListener("keyup", event => event.stopPropagation());
  dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
  dialog.addEventListener("close", () => {
    if (disposed) return; disposed = true;
    clearTimeout(copyTimer); window.removeEventListener("message", onMessage);
    dialog.remove(); style.remove(); if (closeCurrent === close) closeCurrent = undefined;
    terminal.focus();
  });
  dialog.append(header, nav, meta, note, searchBar, viewer, footer);
  document.head.append(style); document.body.append(dialog); window.addEventListener("message", onMessage);
  closeCurrent = close; render(); dialog.showModal(); search.focus();
}
