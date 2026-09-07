const { test } = require('node:test');
const assert = require('node:assert/strict');
const { classifyStartupScreen, startupComposerMatches, ReadinessGate } = require('../out/StartupReadiness');
const { captureTerminalSnapshot, validateTerminalSnapshot, snapshotColumnOffset } = require('../out/TerminalSnapshot');

function screen(lines, cursorX = 2, cursorY = 0) {
  return { lines, cursorX, cursorY };
}

function styled(snapshot, dim = true) {
  return { ...snapshot, cols: 100, lineInfo: snapshot.lines.map((line, row) => ({ wrapped: false, styles: row === snapshot.cursorY
    ? [{ start: 0, end: 2, dim: false, italic: false, fgMode: 0, fg: 0 }, { start: 2, end: line.length, dim, italic: false, fgMode: 0, fg: 0 }]
    : [] })) };
}

test('Home, middle, and right-of-cursor content never qualify as an empty composer', () => {
  for (const cursorX of [2, 6, 19]) {
    const value = screen(['› existing question', '? for shortcuts'], cursorX);
    assert.equal(classifyStartupScreen(value), 'occupied');
    const gate = new ReadinessGate();
    gate.observe(value, 0);
    assert.equal(gate.observe(value, 60000).ready, false);
  }
  assert.equal(classifyStartupScreen(screen(['›    ', '? for shortcuts'], 4)), 'occupied');
});

test('only muted known CLI hints are treated as placeholders', () => {
  for (const row of ['› Ask Codex to do anything', '❯ Try "refactor <filepath>"']) {
    const value = screen([row, '? for shortcuts']);
    assert.equal(classifyStartupScreen(value), 'occupied', 'plain text is not evidence of a placeholder');
    assert.equal(classifyStartupScreen(styled(value, false)), 'occupied', 'a user typing the hint text is still input');
    assert.equal(classifyStartupScreen(styled(value)), 'ready');
    const gray = styled(value, false);
    gray.lineInfo[0].styles[1].fgMode = 0x2000000;
    gray.lineInfo[0].styles[1].fg = 244;
    assert.equal(classifyStartupScreen(gray), 'ready');
  }
  assert.equal(classifyStartupScreen(styled(screen(['› my existing question', '? for shortcuts']))), 'occupied');
});

test('multiline input above and below the cursor remains occupied', () => {
  for (const value of [
    screen(['❯ ', '  existing second line', '────────────', '? for shortcuts']),
    screen(['❯ first line', '  ', '────────────', '? for shortcuts'], 2, 1),
    screen(['❯ ', '  ', '  third line', '────────────', '? for shortcuts']),
    screen(['❯ ', '  ', '────────────', '? for shortcuts'], 2, 1),
    screen(['❯ previous line', '  > ', '────────────', '? for shortcuts'], 4, 1),
    screen(['────────────', '❯ previous line', '', '  ❯ ', '────────────', '? for shortcuts'], 4, 3),
    screen(['────────────', '❯ ', '  ? for shortcuts', '────────────', 'shift+tab to cycle'], 2, 1),
  ]) assert.equal(classifyStartupScreen(value), 'occupied');
  assert.equal(classifyStartupScreen(screen(['❯ ', '', '────────────', '? for shortcuts'])), 'ready');
});

test('painted input rows containing footer words remain part of the composer', () => {
  const value = screen(['› ', '  ? for shortcuts', '', '? for shortcuts']);
  value.cols = 40;
  value.lineInfo = value.lines.map((_line, row) => ({ wrapped: false, styles: row < 2
    ? [{ start: 0, end: 40, dim: false, italic: false, fgMode: 0, fg: 0, bgMode: 0x2000000, bg: 235 }]
    : [] }));
  assert.equal(classifyStartupScreen(value), 'occupied');
  value.lines[0] = '› /resume'; value.cursorX = 9;
  assert.equal(startupComposerMatches(value, '/resume'), false);
});

test('confirmation requires the entire input and cursor at its end', () => {
  assert.equal(startupComposerMatches(screen(['› /resume', '? for shortcuts'], 9), '/resume'), true);
  assert.equal(startupComposerMatches(screen(['› /resumeexisting question', '? for shortcuts'], 9), '/resume'), false);
  assert.equal(startupComposerMatches(screen(['› /resume', '? for shortcuts'], 2), '/resume'), false);
  assert.equal(startupComposerMatches(screen(['› /resume', '  existing second line', '? for shortcuts'], 9), '/resume'), false);
  assert.equal(startupComposerMatches(screen(['› /resume', '? for shortcuts · esc to interrupt'], 9), '/resume'), false);
  assert.equal(startupComposerMatches(screen(['› /resume', 'Loading…'], 9), '/resume'), false);
});

test('confirmation supports wide and combined characters using terminal columns', () => {
  const value = screen(['› 한😀é', '? for shortcuts'], 7);
  value.cols = 10;
  value.lineInfo = [{ wrapped: false, styles: [], columns: [0, 1, 2, 2, 3, 3, 5, 7, 7, 7, 7] }, { wrapped: false, styles: [] }];
  assert.equal(startupComposerMatches(value, '한😀é'), true);
  value.cursorX = 6;
  assert.equal(startupComposerMatches(value, '한😀é'), false);
});

test('confirmation joins actual soft wraps, but does not discard hard line breaks', () => {
  const value = screen(['› /long-co', 'mmand', '? for shortcuts'], 5, 1);
  value.lineInfo = [{ wrapped: false, styles: [] }, { wrapped: true, styles: [] }, { wrapped: false, styles: [] }];
  assert.equal(startupComposerMatches(value, '/long-command'), true);
  value.lineInfo[1].wrapped = false;
  assert.equal(startupComposerMatches(value, '/long-command'), false);
});

test('captured snapshots preserve style runs, Unicode columns, and wrap flags', () => {
  const characters = ['›', ' ', '한', '', '😀', '', 'é'];
  const terminal = { cols: 10, rows: 1, buffer: { active: { baseY: 9, cursorX: 7, cursorY: 0,
    getLine(index) {
      assert.equal(index, 9);
      return { isWrapped: true, translateToString: () => '› 한😀é', getCell(column) {
        return { getChars: () => characters[column] || '', getWidth: () => column === 3 || column === 5 ? 0 : column === 2 || column === 4 ? 2 : 1,
          isDim: () => column >= 2 ? 1 : 0, isItalic: () => 0, getFgColorMode: () => 0, getFgColor: () => 0 };
      } };
    } } } };
  const value = captureTerminalSnapshot(terminal);
  assert.equal(validateTerminalSnapshot(value), true);
  assert.equal(value.lineInfo[0].wrapped, true);
  assert.equal(value.lineInfo[0].styles.length, 2);
  assert.equal(value.lineInfo[0].styles[1].dim, true);
  assert.equal(snapshotColumnOffset(value, 0, 7), '› 한😀é'.length);
});

test('snapshot validation rejects malformed styles and unsafe cursor values', () => {
  const value = styled(screen(['› Ask Codex to do anything', '? for shortcuts']));
  assert.equal(validateTerminalSnapshot(value), true);
  assert.equal(validateTerminalSnapshot({ ...value, cursorX: 5000 }), false);
  assert.equal(validateTerminalSnapshot({ ...value, lineInfo: [null, null] }), false);
  const malformed = structuredClone(value);
  malformed.lineInfo[0].styles[1].start = -1;
  assert.equal(validateTerminalSnapshot(malformed), false);
});
