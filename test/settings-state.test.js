const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'vscode') return {
    EventEmitter: class { event = () => ({ dispose() {} }); fire() {} },
    workspace: { getConfiguration: () => ({ get: (_key, fallback) => fallback }), onDidChangeConfiguration: () => ({ dispose() {} }) },
    l10n: { t: text => text },
  };
  return originalLoad.call(this, id, ...args);
};
const { TabStateStoreImpl, tabState, validateSavedTabs } = require('../out/TabStateStore');
const { TabRestorePlan } = require('../out/TabRestorePlan');
const { TabIdAllocator, panelRegistry } = require('../out/PanelRegistry');
const { cellIdMapper } = require('../out/CellIdMapper');
const { SidebarProvider } = require('../out/SidebarProvider');
Module._load = originalLoad;

function memento(seed = {}, deferred = false) {
  const values = new Map(Object.entries(structuredClone(seed)));
  return {
    get: (key, fallback) => values.has(key) ? values.get(key) : fallback,
    keys: () => [...values.keys()],
    update: async (key, value) => {
      if (deferred) await new Promise(resolve => setImmediate(resolve));
      if (value === undefined) values.delete(key); else values.set(key, structuredClone(value));
    },
    snapshot: () => Object.fromEntries(values),
  };
}

function context(globalState = memento(), workspaceState = memento()) {
  return { globalState, workspaceState, extensionUri: {} };
}

const tab = (tabId, firstCell = tabId * 2) => ({ tabId, rows: 1, cols: 2, cellIds: [firstCell, firstCell + 1] });

test('different workspaces keep tab layouts, overrides and allocator IDs independent', async () => {
  const global = memento({ presets: [{ name: 'shared' }], nextTabId: 8 });
  const before = global.snapshot();
  const ctxA = context(global), ctxB = context(global);
  const a = new TabStateStoreImpl(), b = new TabStateStoreImpl();
  a.init(ctxA); b.init(ctxB);
  await a.migrateOnce(); await b.migrateOnce();
  await a.setLastTabs([tab(2)]); await b.setLastTabs([tab(3)]);
  await a.setCellOverrides(0, { 0: { shellType: 'pwsh', startupCommand: 'codex resume a' } });
  await b.setCellOverrides(0, { 0: { shellType: 'bash', startupCommand: 'claude --resume b' } });
  assert.deepEqual(a.getLastTabs(), [tab(2)]);
  assert.deepEqual(b.getLastTabs(), [tab(3)]);
  assert.equal(TabIdAllocator.next(ctxA), 8);
  assert.equal(TabIdAllocator.next(ctxA), 9);
  assert.equal(TabIdAllocator.next(ctxB), 8);
  await a.deleteTab(0);
  assert.equal(b.getCellOverrides(0)[0].startupCommand, 'claude --resume b');
  assert.deepEqual(global.snapshot(), before);
});

test('migration preserves shared legacy data and existing workspace values across interruption/retry', async () => {
  const global = memento({
    lastTabs: [tab(4, 20)], cellOverrides_4: { 0: { startupCommand: 'saved' } },
    cellOverrides_0: { 0: { fontFamily: 'newer' } }, cellOverrides: { 0: { fontFamily: 'older' } },
    cellLabels: ['legacy label'], multiTabMigrationDone: true,
  });
  const before = global.snapshot();
  const ctx = context(global, memento({ cellOverrides_4: { 0: { startupCommand: 'workspace value' } } }));
  const store = new TabStateStoreImpl(); store.init(ctx);
  await store.migrateOnce();
  assert.equal(store.getCellOverrides(4)[0].startupCommand, 'workspace value');
  assert.equal(store.getCellOverrides(0)[0].fontFamily, 'newer');
  assert.deepEqual(store.getCellLabels(0), ['legacy label']);
  assert.equal(TabIdAllocator.next(ctx), 5);
  assert.deepEqual(cellIdMapper.allocate(ctx, 2), [22, 23]);
  await store.deleteTab(4); await store.setLastTabs([]);
  await store.migrateOnce();
  assert.deepEqual(store.getCellOverrides(4), {});
  assert.deepEqual(store.getLastTabs(), []);
  assert.deepEqual(global.snapshot(), before);
});

test('single-grid migration and tab clone preserve startup settings', async () => {
  const ctx = context(memento({ lastGrid: { rows: 2, cols: 2 }, defaultSteps: [{ type: 'command', input: 'codex' }] }));
  const store = new TabStateStoreImpl(); store.init(ctx); await store.migrateOnce();
  assert.deepEqual(store.getLastTabs(), [{ tabId: 0, rows: 2, cols: 2, cellIds: [0, 1, 2, 3] }]);
  await store.cloneTab(0, 8);
  assert.deepEqual(store.getDefaultSteps(8), [{ type: 'command', input: 'codex' }]);
  await store.setDefaultSteps(8, []);
  assert.equal(store.getDefaultSteps(0)[0].input, 'codex');
});

test('tab and cell allocation remains unique while persistence writes are pending', async () => {
  const ctx = context(memento(), memento({}, true));
  assert.deepEqual([TabIdAllocator.next(ctx), TabIdAllocator.next(ctx)], [0, 1]);
  TabIdAllocator.reserve(ctx, 8);
  assert.equal(TabIdAllocator.next(ctx), 9);
  assert.deepEqual(cellIdMapper.allocate(ctx, 2), [0, 1]);
  assert.deepEqual(cellIdMapper.allocate(ctx, 2), [2, 3]);
  cellIdMapper.reserve(ctx, [25, 30]);
  assert.deepEqual(cellIdMapper.allocate(ctx, 2), [31, 32]);
  await new Promise(resolve => setImmediate(resolve));
});

test('restoration matches stable panel identity even in reverse order and keeps saved tab order', async () => {
  const store = new TabStateStoreImpl(); store.init(context());
  await store.setLastTabs([tab(1), tab(3), tab(8)]);
  const plan = new TabRestorePlan(store.beginRestore());
  assert.equal(plan.claim({ tabId: 8 }).tabId, 8);
  assert.equal(plan.claim({ tabId: 1 }).tabId, 1);
  assert.equal(plan.claim({ tabId: 8 }), undefined);
  assert.equal(plan.claim(undefined), undefined);
  assert.equal(plan.claim({ tabId: 99 }), undefined);
  await store.setLastTabs([tab(8)]);
  assert.deepEqual(store.getLastTabs().map(item => item.tabId), [1, 3, 8]);
  assert.deepEqual(plan.missing([8, 1]).map(item => item.tabId), [3]);
  plan.cancel();
  assert.equal(plan.claim({ tabId: 3 }), undefined);
  assert.deepEqual(plan.missing([]), []);
  panelRegistry.register(8, {}); panelRegistry.register(1, {}); panelRegistry.register(3, {});
  panelRegistry.reorder([1, 3, 8]);
  assert.deepEqual(panelRegistry.entries().map(([id]) => id), [1, 3, 8]);
  for (const id of [1, 3, 8]) panelRegistry.unregister(id);
  store.finishRestore();
  await store.setLastTabs([tab(8)]);
  assert.deepEqual(store.getLastTabs(), [tab(8)]);
});

test('malformed or overlapping saved terminal IDs cannot create colliding panels', () => {
  assert.deepEqual(validateSavedTabs([
    tab(1), tab(1, 10), tab(2, 2), { ...tab(3), rows: 10000 }, { ...tab(4), cellIds: [9, 9] }, tab(5),
  ]), [tab(1), tab(5)]);
});

function sidebarReceiver(ctx) {
  tabState.init(ctx);
  const sidebar = Object.create(SidebarProvider.prototype);
  sidebar._context = ctx; sidebar._getHtml = () => '';
  let receive;
  sidebar.resolveWebviewView({ webview: { onDidReceiveMessage: callback => { receive = callback; } } });
  return receive;
}

test('global font/theme/color changes preserve startup commands, shell and unrelated appearance', async () => {
  const receive = sidebarReceiver(context());
  const startup = { shellType: 'pwsh', startupCommand: 'legacy', startupSteps: [{ type: 'command', input: 'codex resume session-1' }] };
  await tabState.setCellOverrides(0, { 0: { ...startup, fontFamily: 'Consolas', bgColor: '#000', fgColor: '#fff', themeName: 'dark' } });
  await receive({ type: 'clearAllCellOverrides', fields: ['fontFamily'] });
  assert.deepEqual(tabState.getCellOverrides(0)[0], { ...startup, bgColor: '#000', fgColor: '#fff', themeName: 'dark' });
  await receive({ type: 'clearAllCellOverrides', fields: ['bgColor'] });
  assert.equal(tabState.getCellOverrides(0)[0].fgColor, '#fff');
  await receive({ type: 'clearAllCellOverrides' });
  assert.deepEqual(tabState.getCellOverrides(0)[0], startup);
});

test('per-cell appearance edit does not remove saved launch steps or shell', async () => {
  const receive = sidebarReceiver(context());
  const startup = { shellType: 'pwsh', startupCommand: 'legacy', startupSteps: [{ type: 'command', input: 'claude --resume session-2' }] };
  await tabState.setCellOverrides(0, { 0: startup });
  await receive({ type: 'setCellConfig', cellId: 0, bgColor: '#123456', fontFamily: 'Consolas' });
  assert.deepEqual(tabState.getCellOverrides(0)[0], { ...startup, bgColor: '#123456', fgColor: '', fontFamily: 'Consolas', themeName: '' });
});
