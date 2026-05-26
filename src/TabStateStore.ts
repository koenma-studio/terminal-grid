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

export interface StartupCommandEntry {
  command: string;
  count: number;
}

/**
 * Per-tab state store. All cell-scoped settings (overrides, labels, merges,
 * startup steps, etc.) are namespaced by tabId so each tab has independent
 * configuration. Global settings (customFonts, projects, presets,
 * projectPresets, sectionStates) remain unnamespaced.
 */
class TabStateStoreImpl {
  private _ctx: vscode.ExtensionContext | undefined;

  init(context: vscode.ExtensionContext): void {
    this._ctx = context;
  }

  private get ctx(): vscode.ExtensionContext {
    if (!this._ctx) throw new Error("TabStateStore not initialized");
    return this._ctx;
  }

  // ── Cell overrides ──
  getCellOverrides(tabId: number): Record<number, CellOverride> {
    return this.ctx.globalState.get<Record<number, CellOverride>>(`cellOverrides_${tabId}`, {});
  }
  setCellOverrides(tabId: number, value: Record<number, CellOverride>): Thenable<void> {
    return this.ctx.globalState.update(`cellOverrides_${tabId}`, value);
  }

  // ── Cell labels ──
  getCellLabels(tabId: number): string[] {
    return this.ctx.globalState.get<string[]>(`cellLabels_${tabId}`, []);
  }
  setCellLabels(tabId: number, value: string[]): Thenable<void> {
    return this.ctx.globalState.update(`cellLabels_${tabId}`, value);
  }

  // ── Merged regions ──
  getMergedRegions(tabId: number): MergeRegion[] {
    return this.ctx.globalState.get<MergeRegion[]>(`mergedRegions_${tabId}`, []);
  }
  setMergedRegions(tabId: number, value: MergeRegion[]): Thenable<void> {
    return this.ctx.globalState.update(`mergedRegions_${tabId}`, value);
  }

  // ── Default startup steps ──
  getDefaultSteps(tabId: number): StartupStep[] {
    return this.ctx.globalState.get<StartupStep[]>(`defaultSteps_${tabId}`, []);
  }
  /** Setter accepts unknown[] for backward compat with legacy step shapes from older presets. */
  setDefaultSteps(tabId: number, value: unknown[]): Thenable<void> {
    return this.ctx.globalState.update(`defaultSteps_${tabId}`, value);
  }

  // ── Default single-command (legacy) ──
  getDefaultCommand(tabId: number): string {
    return this.ctx.globalState.get<string>(`defaultCommand_${tabId}`, "");
  }
  setDefaultCommand(tabId: number, value: string): Thenable<void> {
    return this.ctx.globalState.update(`defaultCommand_${tabId}`, value);
  }

  // ── Startup commands list (legacy: supports both string[] and {command,count}[] entries) ──
  getStartupCommands(tabId: number): unknown[] {
    return this.ctx.globalState.get<unknown[]>(`startupCommands_${tabId}`, []);
  }
  setStartupCommands(tabId: number, value: unknown[]): Thenable<void> {
    return this.ctx.globalState.update(`startupCommands_${tabId}`, value);
  }

  // ── User-assigned tab name (empty string = use default "Tab N" label) ──
  getTabName(tabId: number): string {
    return this.ctx.globalState.get<string>(`tabName_${tabId}`, "");
  }
  setTabName(tabId: number, value: string): Thenable<void> {
    return this.ctx.globalState.update(`tabName_${tabId}`, value);
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
      await this.ctx.globalState.update(k, undefined);
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

  /**
   * One-shot migration: legacy unnamespaced keys → `_0` namespace.
   * Legacy keys are preserved as a safety net (never deleted).
   * Idempotent via `multiTabMigrationDone` flag.
   */
  async migrateOnce(): Promise<void> {
    const done = this.ctx.globalState.get<boolean>("multiTabMigrationDone", false);
    if (done) return;

    const legacyCellOverrides = this.ctx.globalState.get<Record<number, CellOverride>>("cellOverrides", {});
    const legacyCellLabels = this.ctx.globalState.get<string[]>("cellLabels", []);
    const legacyMergedRegions = this.ctx.globalState.get<MergeRegion[]>("mergedRegions", []);
    const legacyDefaultSteps = this.ctx.globalState.get<StartupStep[]>("defaultSteps", []);
    const legacyDefaultCommand = this.ctx.globalState.get<string>("defaultCommand", "");
    const legacyStartupCommands = this.ctx.globalState.get<unknown[]>("startupCommands", []);

    await this.setCellOverrides(0, legacyCellOverrides);
    await this.setCellLabels(0, legacyCellLabels);
    await this.setMergedRegions(0, legacyMergedRegions);
    await this.setDefaultSteps(0, legacyDefaultSteps);
    await this.setDefaultCommand(0, legacyDefaultCommand);
    await this.setStartupCommands(0, legacyStartupCommands);

    await this.ctx.globalState.update("multiTabMigrationDone", true);
  }
}

export const tabState = new TabStateStoreImpl();
