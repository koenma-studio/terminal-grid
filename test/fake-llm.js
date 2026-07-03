#!/usr/bin/env node
// Fake LLM CLI to exercise terminal-grid's startup readiness gate WITHOUT needing a fresh/untrusted
// folder. It reproduces the first-run flow: an alt-screen TUI that shows a "trust this folder?"
// dialog, then (after Enter) an input box that ECHOES typed input and reports what it received.
//
// Test it by setting a cell's startup steps to:
//   [{ "type":"command", "input":"node test/fake-llm.js" }, { "type":"command", "input":"/resume" }]
// then restart that cell. With the gate working, the input box shows ">>> RECEIVED: /resume <<<"
// — i.e. /resume landed in the input box, only AFTER the trust dialog was dismissed.
const W = (s) => process.stdout.write(s);
W("\x1b[?1049h"); // enter alt-screen (TUI up)
W("\x1b[>1u");    // enable Kitty keyboard protocol (so the gate sees a TUI)
let trusted = false, line = "";
function drawTrust() {
  W("\x1b[2J\x1b[H");
  W("╭── fake-llm ────────╮\r\n");
  W("Do you trust the files in this folder?\r\n");
  W("\x1b[7m❯ 1. Yes, proceed\x1b[0m\r\n"); // highlighted default — Enter accepts this
  W("  2. No, exit\r\n");
  W("╰──────────────╯\r\n");
}
function drawInput() {
  W("\x1b[2J\x1b[H");
  W("╭── fake-llm ready ──╮\r\n");
  W("> " + line + "\r\n");
  W("╰─────────────────╯\r\n");
}
drawTrust();
if (process.stdin.setRawMode) { try { process.stdin.setRawMode(true); } catch { /* not a tty */ } }
process.stdin.resume();
process.stdin.on("data", (d) => {
  const s = d.toString();
  const isEnter = s.includes("\r") || s.includes("\n") || s.includes("\x1b[13u");
  if (!trusted) {
    if (isEnter) { trusted = true; line = ""; drawInput(); } // accept default (Yes) on Enter only
    return;                                                  // typed chars are NOT echoed in the dialog
  }
  if (isEnter) { W("\r\n>>> RECEIVED: " + line + " <<<\r\n"); line = ""; return; }
  for (const ch of s) { if (ch === "\x1b") break; if (ch >= " ") line += ch; }
  drawInput(); // echo by redrawing with the accumulated line
});
