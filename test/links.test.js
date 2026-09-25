const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const opened = [], revealed = [], warnings = [];
let openResult = true;
let revealError, remoteName, workspaceFolders;
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
    workspace: { get workspaceFolders() { return workspaceFolders; },
      onDidChangeConfiguration: () => ({ dispose() {} }) },
    l10n: { t: text => text },
  };
  return originalLoad.call(this, id, ...args);
};
const { TerminalGridPanel } = require('../out/TerminalGridPanel');
const { tabState } = require('../out/TabStateStore');
const { parseTerminalLink } = require('../out/TerminalLink');
Module._load = originalLoad;

function receiver(workspacePath) {
  opened.length = 0; revealed.length = 0; warnings.length = 0; openResult = true;
  revealError = undefined; remoteName = undefined;
  workspaceFolders = workspacePath ? [{ uri: { fsPath: workspacePath } }] : undefined;
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

test('relative CLI paths resolve from the workspace, including line references', async t => {
  const { directory } = localFiles(t), receive = receiver(directory);
  const relative = 'docs/references/panokseon-32dir-2026-09-25/index.html';
  const file = path.join(directory, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, 'test');
  for (const target of [relative, `./${relative}`, `${relative}:12:3`, `${relative}#L12`]) {
    await receive({ type: 'openExternal', uri: target });
  }
  assert.deepEqual(revealed, Array(4).fill({ command: 'revealFileInOS', uri: pathToFileURL(file).href }));
  assert.deepEqual(warnings, []);
});

test('relative filenames, parent paths, and folders resolve from the workspace', async t => {
  const { directory, folder, file } = localFiles(t), receive = receiver(folder);
  const parentFile = path.join(directory, 'parent.txt');
  fs.writeFileSync(parentFile, 'test');
  for (const target of [path.basename(file), `./${path.basename(file)}`, '../parent.txt']) {
    await receive({ type: 'openExternal', uri: target });
  }
  await receive({ type: 'openExternal', uri: './' });
  assert.deepEqual(revealed, [file, file, parentFile].map(file => ({
    command: 'revealFileInOS', uri: pathToFileURL(file).href,
  })));
  assert.deepEqual(opened, [pathToFileURL(folder).href]);
  assert.deepEqual(warnings, []);
});

test('Windows relative paths support dot and bare backslash forms', { skip: process.platform !== 'win32' }, async t => {
  const { directory, file } = localFiles(t), receive = receiver(directory);
  const relative = path.relative(directory, file);
  for (const target of [relative, `.\\${relative}`]) await receive({ type: 'openExternal', uri: target });
  assert.deepEqual(revealed, Array(2).fill({ command: 'revealFileInOS', uri: pathToFileURL(file).href }));
  assert.deepEqual(warnings, []);
});

test('literal hash filenames take precedence over line-reference suffixes', async t => {
  const { folder } = localFiles(t), receive = receiver(folder);
  const file = path.join(folder, 'report.txt#L12');
  fs.writeFileSync(file, 'test');
  await receive({ type: 'openExternal', uri: path.basename(file) });
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

test('link classification accepts absolute and relative files while rejecting other schemes', () => {
  for (const target of ['C:\\Users\\USER\\report.txt', 'G:/repos/terminal-grid', '/G:/repos/terminal-grid',
    '/home/user/report.txt', '\\\\server\\share\\report.txt', './report.txt', '.\\report.txt',
    '../report.txt', '..\\report.txt', 'docs/references/index.html', 'docs\\references\\index.html',
    'report.txt', 'report.txt:12:3', '자료 (최종).html', './', '../']) {
    assert.deepEqual(parseTerminalLink(target), { kind: 'path', path: target });
  }
  assert.equal(parseTerminalLink('file:///C:/Users/USER/report.txt').kind, 'file');
  for (const target of ['javascript:alert(1)', 'command:test', 'vscode://file/C:/test', 'data:text/plain,test',
    'https://', 'C:report.txt', '/tmp/file\x00.txt', '\\\\?\\C:\\test', 'not a URL', '', 'command:docs/index.html']) {
    assert.equal(parseTerminalLink(target), undefined);
  }
});
