const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const opened = [], revealed = [], warnings = [];
let openResult = true;
let revealError, remoteName;
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'vscode') return {
    EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
    Uri: { joinPath: () => ({}), parse: value => ({ toString: () => value }),
      file: value => ({ toString: () => pathToFileURL(value).href }) },
    env: { get remoteName() { return remoteName; }, openExternal: async uri => {
      opened.push(uri.toString());
      if (openResult instanceof Error) throw openResult;
      return openResult;
    } },
    commands: { executeCommand: async (command, uri) => {
      revealed.push({ command, uri: uri.toString() });
      if (revealError) throw revealError;
    } },
    window: { showWarningMessage: message => warnings.push(message) },
    workspace: { onDidChangeConfiguration: () => ({ dispose() {} }) },
    l10n: { t: text => text },
  };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
const { tabState } = require('../out/TabStateStore');
const { parseTerminalLink } = require('../out/TerminalLink');
Module._load = originalLoad;

function receiver() {
  opened.length = 0; revealed.length = 0; warnings.length = 0; openResult = true;
  revealError = undefined; remoteName = undefined;
  let receive;
  const context = { extensionUri: {}, workspaceState: { get: (_key, fallback) => fallback } };
  tabState.init(context);
  const originalHtml = TerminalGridPanel.prototype._getHtml;
  TerminalGridPanel.prototype._getHtml = () => '';
  try {
    new TerminalGridPanel({
      webview: { onDidReceiveMessage: callback => { receive = callback; } },
      onDidDispose() {}, onDidChangeViewState() {},
    }, context, 1, 1, 0, [0]);
  } finally { TerminalGridPanel.prototype._getHtml = originalHtml; }
  return receive;
}

test('actual panel opens HTTP(S) links, preserving encoded query and fragment', async () => {
  const receive = receiver();
  const urls = ['https://example.com/login?return=%2Fhello%3Fa%3D1&state=a%2Bb#section', 'http://localhost:3000/path'];
  for (const uri of urls) await receive({ type: 'openExternal', uri });
  assert.deepEqual(opened, urls);
  assert.deepEqual(warnings, []);
});

test('actual panel rejects malformed URLs and executable schemes', async () => {
  const receive = receiver();
  for (const uri of [null, {}, 123, '', 'not a URL', 'https://', 'https://[invalid',
    'javascript:alert(1)', 'command:workbench.action.reloadWindow',
    'vscode://settings', 'data:text/html,test', '\\\\?\\C:\\Windows', '\\\\.\\PhysicalDrive0']) {
    await receive({ type: 'openExternal', uri });
  }
  assert.deepEqual(opened, []);
  assert.deepEqual(revealed, []);
});

test('browser launch failure or rejection is reported without an unhandled error', async () => {
  const receive = receiver();
  for (const result of [false, new Error('No browser available')]) {
    openResult = result;
    await receive({ type: 'openExternal', uri: 'https://example.com/' });
  }
  assert.equal(opened.length, 2);
  assert.deepEqual(warnings, Array(2).fill('Could not open the link in your browser.'));
});

function localFiles(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-grid-links-'));
  const folder = path.join(directory, '한글 folder #100%');
  const file = path.join(folder, 'report #100%.txt');
  const executable = path.join(folder, 'example.exe');
  fs.mkdirSync(folder);
  fs.writeFileSync(file, 'test'); fs.writeFileSync(executable, 'not an executable');
  t.after(() => {
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return { directory, folder, file, executable };
}

test('local folders open in the file explorer, including encoded file URLs', async t => {
  const { folder } = localFiles(t), receive = receiver();
  const uri = pathToFileURL(folder).href;
  for (const target of [folder, uri]) await receive({ type: 'openExternal', uri: target });
  assert.deepEqual(opened, [uri, uri]);
  assert.deepEqual(revealed, []);
  assert.deepEqual(warnings, []);
});

test('files and executable files are revealed without launching their associated application', async t => {
  const { file, executable } = localFiles(t), receive = receiver();
  const uri = pathToFileURL(file).href;
  for (const target of [file, uri, `${file}:12:3`, `${uri}:12`, `${uri}#L12`, executable]) {
    await receive({ type: 'openExternal', uri: target });
  }
  assert.deepEqual(opened, []);
  assert.deepEqual(revealed, [uri, uri, uri, uri, uri, pathToFileURL(executable).href]
    .map(uri => ({ command: 'revealFileInOS', uri })));
  assert.deepEqual(warnings, []);
});

test('slash-prefixed Windows drive links resolve to the real file', { skip: process.platform !== 'win32' }, async t => {
  const { file } = localFiles(t), receive = receiver();
  await receive({ type: 'openExternal', uri: '/' + file.replaceAll('\\', '/') });
  assert.deepEqual(revealed, [{ command: 'revealFileInOS', uri: pathToFileURL(file).href }]);
  assert.deepEqual(warnings, []);
});

test('missing paths and file-explorer failures are reported without launching files', async t => {
  const { folder, file, directory } = localFiles(t), receive = receiver();
  await receive({ type: 'openExternal', uri: path.join(directory, 'missing.txt') });
  openResult = false;
  await receive({ type: 'openExternal', uri: folder });
  revealError = new Error('File explorer unavailable');
  await receive({ type: 'openExternal', uri: file });
  assert.deepEqual(opened, [pathToFileURL(folder).href]);
  assert.deepEqual(warnings, Array(3).fill('Could not show the local path in your file explorer.'));
});

test('remote paths are not confused with files on the local machine', async t => {
  const { file } = localFiles(t), receive = receiver();
  remoteName = 'ssh-remote';
  await receive({ type: 'openExternal', uri: file });
  assert.deepEqual(opened, []);
  assert.deepEqual(revealed, []);
  assert.deepEqual(warnings, ['Local file explorer links are unavailable in a remote workspace.']);
  await receive({ type: 'openExternal', uri: 'https://example.com/' });
  assert.deepEqual(opened, ['https://example.com/']);
});

test('link classification accepts absolute paths while rejecting commands and relative paths', () => {
  for (const target of ['C:\\Users\\USER\\report.txt', 'G:/repos/terminal-grid', '/G:/repos/terminal-grid',
    '/home/user/report.txt', '\\\\server\\share\\report.txt']) {
    assert.deepEqual(parseTerminalLink(target), { kind: 'path', path: target });
  }
  assert.equal(parseTerminalLink('file:///C:/Users/USER/report.txt').kind, 'file');
  for (const target of ['javascript:alert(1)', 'command:test', 'vscode://file/C:/test', 'data:text/plain,test',
    'report.txt', './report.txt', 'C:report.txt', '/tmp/file\x00.txt', '\\\\?\\C:\\test']) {
    assert.equal(parseTerminalLink(target), undefined);
  }
});
