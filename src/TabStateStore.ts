import * as vscode from "vscode";
import type { StartupStep } from "./TerminalGridPanel";

export interface MergeRegion {
  startRow: number;
  startCol: number;
  rowSpan: number;
  colSpan: number;
}

export interface CellOverride {
  bgColor?: string;
  fgColor?: string;
  fontFamily?: string;
  themeName?: string;
  shellType?: string;
  startupCommand?: string;
  startupSteps?: StartupStep[];
}

export const APPEARANCE_KEYS = ["bgColor", "fgColor", "fontFamily", "themeName"] as const;
export type AppearanceKey = typeof APPEARANCE_KEYS[number];

export function clearCellAppearance(overrides: Record<number, CellOverride>, fields: readonly AppearanceKey[] = APPEARANCE_KEYS): Record<number, CellOverride> {
  const result: Record<number, CellOverride> = {};
  for (const [id, value] of Object.entries(overrides)) {
    const remaining = { ...value };
    for (const key of fields) delete remaining[key];
    if (Object.keys(remaining).length > 0) result[Number(id)] = remaining;
  }
  return result;
}

export interface StartupCommandEntry {
  command: string;
  count: number;
}

export interface SavedTab {
  tabId: number;
  rows: number;
  cols: number;
  cellIds: number[];
}

const TAB_KEY = /^(?:cellOverrides|cellLabels|mergedRegions|defaultSteps|defaultCommand|startupCommands|tabName)_\d+$/;
const LEGACY_TAB_KEYS = ["cellOverrides", "cellLabels", "mergedRegions", "defaultSteps", "defaultCommand", "startupCommands", "tabName"];

/** Reject malformed persisted layouts before they can allocate terminals or collide IDs. */
export function validateSavedTabs(value: unknown): SavedTab[] {
  if (!Array.isArray(value)) return [];
  const tabIds = new Set<number>();
  const cellIds = new Set<number>();
  return value.filter((item): item is SavedTab => {
    if (!item || !Number.isSafeInteger(item.tabId) || item.tabId < 0 || tabIds.has(item.tabId)) return false;
    if (!Number.isInteger(item.rows) || item.rows < 1 || item.rows > 4 || !Number.isInteger(item.cols) || item.cols < 1 || item.cols > 5) return false;
    if (!Array.isArray(item.cellIds) || item.cellIds.length !== item.rows * item.cols) return false;
    const localIds = new Set<number>();
    for (const id of item.cellIds) {
      if (!Number.isSafeInteger(id) || id < 0 || cellIds.has(id) || localIds.has(id)) return false;
      localIds.add(id);
    }
    tabIds.add(item.tabId);
    localIds.forEach(id => cellIds.add(id));
    return true;
  }).map(item => ({ tabId: item.tabId, rows: item.rows, cols: item.cols, cellIds: [...item.cellIds] }));
}

/**
 * Per-tab state store. All cell-scoped settings (overrides, labels, merges,
 * startup steps, etc.) are namespaced by tabId so each tab has independent
 * configuration within its VS Code workspace. Global settings (customFonts, projects, presets,
 * projectPresets, sectionStates) remain unnamespaced.
 */
export class TabStateStoreImpl {
  private _ctx: vscode.ExtensionContext | undefined;
  private _restoring: SavedTab[] | undefined;

  init(context: vscode.ExtensionContext): void {
    this._ctx = context;
    this._restoring = undefined;
  }

  getLastTabs(): SavedTab[] {
    return validateSavedTabs(this.ctx.workspaceState.get<unknown>("lastTabs", []));
  }

  setLastTabs(tabs: SavedTab[]): Thenable<void> {
    // Constructor callbacks persist as each panel revives. Keep the yet-to-revive
    // tabs until restoration settles so an interrupted reload cannot erase them.
    const current = new Map(tabs.map(tab => [tab.tabId, tab]));
    const merged = (this._restoring ?? []).map(tab => current.get(tab.tabId) ?? tab);
    const restoredIds = new Set(merged.map(tab => tab.tabId));
    merged.push(...tabs.filter(tab => !restoredIds.has(tab.tabId)));
    return this.ctx.workspaceState.update("lastTabs", validateSavedTabs(merged));
  }

  beginRestore(): SavedTab[] {
    this._restoring = this.getLastTabs();
    return this._restoring;
  }

  finishRestore(): void {
    this._restoring = undefined;
  }

  private get ctx(): vscode.ExtensionContext {
    if (!this._ctx) throw new Error("TabStateStore not initialized");
    return this._ctx;
  }

  // ── Cell overrides ──
  getCellOverrides(tabId: number): Record<number, CellOverride> {
    return this.ctx.workspaceState.get<Record<number, CellOverride>>(`cellOverrides_${tabId}`, {});
  }
  setCellOverrides(tabId: number, value: Record<number, CellOverride>): Thenable<void> {
    return this.ctx.workspaceState.update(`cellOverrides_${tabId}`, value);
  }

  // ── Cell labels ──
  getCellLabels(tabId: number): string[] {
    return this.ctx.workspaceState.get<string[]>(`cellLabels_${tabId}`, []);
  }
  setCellLabels(tabId: number, value: string[]): Thenable<void> {
    return this.ctx.workspaceState.update(`cellLabels_${tabId}`, value);
  }

  // ── Merged regions ──
  getMergedRegions(tabId: number): MergeRegion[] {
    return this.ctx.workspaceState.get<MergeRegion[]>(`mergedRegions_${tabId}`, []);
  }
  setMergedRegions(tabId: number, value: MergeRegion[]): Thenable<void> {
    return this.ctx.workspaceState.update(`mergedRegions_${tabId}`, value);
  }

  // ── Default startup steps ──
  getDefaultSteps(tabId: number): StartupStep[] {
    return this.ctx.workspaceState.get<StartupStep[]>(`defaultSteps_${tabId}`, []);
  }
  /** Setter accepts unknown[] for backward compat with legacy step shapes from older presets. */
  setDefaultSteps(tabId: number, value: unknown[]): Thenable<void> {
    return this.ctx.workspaceState.update(`defaultSteps_${tabId}`, value);
  }

  // ── Default single-command (legacy) ──
  getDefaultCommand(tabId: number): string {
    return this.ctx.workspaceState.get<string>(`defaultCommand_${tabId}`, "");
  }
  setDefaultCommand(tabId: number, value: string): Thenable<void> {
    return this.ctx.workspaceState.update(`defaultCommand_${tabId}`, value);
  }

  // ── Startup commands list (legacy: supports both string[] and {command,count}[] entries) ──
  getStartupCommands(tabId: number): unknown[] {
    return this.ctx.workspaceState.get<unknown[]>(`startupCommands_${tabId}`, []);
  }
  setStartupCommands(tabId: number, value: unknown[]): Thenable<void> {
    return this.ctx.workspaceState.update(`startupCommands_${tabId}`, value);
  }

  // ── User-assigned tab name (empty string = use default "Tab N" label) ──
  getTabName(tabId: number): string {
    return this.ctx.workspaceState.get<string>(`tabName_${tabId}`, "");
  }
  setTabName(tabId: number, value: string): Thenable<void> {
    return this.ctx.workspaceState.update(`tabName_${tabId}`, value);
  }

  // ── Tab lifecycle: delete all keys for a tab ──
  async deleteTab(tabId: number): Promise<void> {
    const keys = [
      `cellOverrides_${tabId}`,
      `cellLabels_${tabId}`,
      `mergedRegions_${tabId}`,
      `defaultSteps_${tabId}`,
      `defaultCommand_${tabId}`,
      `startupCommands_${tabId}`,
      `tabName_${tabId}`,
    ];
    for (const k of keys) {
      await this.ctx.workspaceState.update(k, undefined);
    }
  }

  // ── Tab lifecycle: deep clone all state from src → dst ──
  async cloneTab(srcTabId: number, dstTabId: number): Promise<void> {
    await this.setCellOverrides(dstTabId, JSON.parse(JSON.stringify(this.getCellOverrides(srcTabId))));
    await this.setCellLabels(dstTabId, [...this.getCellLabels(srcTabId)]);
    await this.setMergedRegions(dstTabId, JSON.parse(JSON.stringify(this.getMergedRegions(srcTabId))));
    await this.setDefaultSteps(dstTabId, JSON.parse(JSON.stringify(this.getDefaultSteps(srcTabId))));
    await this.setDefaultCommand(dstTabId, this.getDefaultCommand(srcTabId));
    await this.setStartupCommands(dstTabId, JSON.parse(JSON.stringify(this.getStartupCommands(srcTabId))));
  }

  /** Copy legacy global tab state into this workspace, preserving the source as a backup. */
  async migrateOnce(): Promise<void> {
    const destination = this.ctx.workspaceState;
    const legacy = this.ctx.globalState;
    if (destination.get<number>("workspaceTabStateVersion", 0) >= 1) return;
    const copyMissing = async (sourceKey: string, targetKey = sourceKey): Promise<void> => {
      const value = legacy.get<unknown>(sourceKey);
      if (value !== undefined && destination.get<unknown>(targetKey) === undefined) {
        await destination.update(targetKey, JSON.parse(JSON.stringify(value)));
      }
    };
    for (const key of legacy.keys()) {
      if (TAB_KEY.test(key)) await copyMissing(key);
    }
    // Older single-tab installations have no suffixed keys. Existing tab 0 data
    // always wins, even when a previous migration was interrupted midway.
    for (const key of LEGACY_TAB_KEYS) await copyMissing(key, `${key}_0`);
    for (const key of ["lastTabs", "lastGrid", "nextTabId", "nextGlobalCellId", "pendingFirstTabId"]) {
      await copyMissing(key);
    }
    let tabs = this.getLastTabs();
    if (destination.get<unknown>("lastTabs") === undefined) {
      const grid = destination.get<{ rows: number; cols: number }>("lastGrid");
      if (grid && Number.isInteger(grid.rows) && Number.isInteger(grid.cols)
        && grid.rows >= 1 && grid.rows <= 4 && grid.cols >= 1 && grid.cols <= 5) {
        tabs = [{ tabId: 0, rows: grid.rows, cols: grid.cols, cellIds: Array.from({ length: grid.rows * grid.cols }, (_, i) => i) }];
      }
    }
    await destination.update("lastTabs", tabs);
    const nextTab = Math.max(destination.get<number>("nextTabId", 0) || 0, ...tabs.map(tab => tab.tabId + 1));
    const nextCell = Math.max(destination.get<number>("nextGlobalCellId", 0) || 0, ...tabs.flatMap(tab => tab.cellIds.map(id => id + 1)));
    await destination.update("nextTabId", nextTab);
    await destination.update("nextGlobalCellId", nextCell);
    // Set the marker last. Retrying after an interruption only fills missing keys.
    await destination.update("workspaceTabStateVersion", 1);
  }
}

export const tabState = new TabStateStoreImpl();
