import type { TerminalGridPanel } from "./TerminalGridPanel";
import * as vscode from "vscode";

class PanelRegistry {
  private _panels = new Map<number, TerminalGridPanel>();
  private _activeTabId: number | undefined;
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  /** Fires when tabs are added/removed or the active tab changes. */
  public readonly onDidChange = this._onDidChange.event;

  /**
   * Register a panel. If `position` is provided (and within range), insert at that index
   * so the new panel takes the slot of a just-disposed predecessor. Otherwise append.
   */
  register(tabId: number, panel: TerminalGridPanel, position?: number): void {
    if (position !== undefined && position >= 0 && position <= this._panels.size) {
      // Rebuild map preserving order, with the new entry spliced at `position`
      const entries = Array.from(this._panels.entries());
      entries.splice(position, 0, [tabId, panel]);
      this._panels = new Map(entries);
    } else {
      this._panels.set(tabId, panel);
    }
    this._activeTabId = tabId;
    this._onDidChange.fire();
  }

  /**
   * Unregister. If `panel` is provided, only unregister when the slot still belongs to it.
   * This lets `replace()` atomically swap in a new panel without the old one's dispose
   * clobbering its successor.
   */
  unregister(tabId: number, panel?: TerminalGridPanel): void {
    if (panel !== undefined && this._panels.get(tabId) !== panel) return;
    const hadPanel = this._panels.delete(tabId);
    if (this._activeTabId === tabId) {
      const remaining = Array.from(this._panels.keys());
      this._activeTabId = remaining.length > 0 ? remaining[remaining.length - 1] : undefined;
    }
    if (hadPanel) this._onDidChange.fire();
  }

  /**
   * Atomic in-place replace: swap the entry for `oldTabId` with `newPanel` (possibly under
   * `newTabId`) at the same insertion index. Fires onDidChange once. The caller is responsible
   * for disposing the old panel afterwards; thanks to the panel-ref check in `unregister`,
   * that dispose will not remove the new entry.
   */
  replace(oldTabId: number, newTabId: number, newPanel: TerminalGridPanel): void {
    const entries = Array.from(this._panels.entries());
    const idx = entries.findIndex(([tid]) => tid === oldTabId);
    if (idx >= 0) {
      entries[idx] = [newTabId, newPanel];
    } else {
      entries.push([newTabId, newPanel]);
    }
    this._panels = new Map(entries);
    this._activeTabId = newTabId;
    this._onDidChange.fire();
  }

  setActive(tabId: number): void {
    if (this._panels.has(tabId) && this._activeTabId !== tabId) {
      this._activeTabId = tabId;
      this._onDidChange.fire();
    }
  }

  getActive(): TerminalGridPanel | undefined {
    return this._activeTabId !== undefined ? this._panels.get(this._activeTabId) : undefined;
  }

  getActiveTabId(): number | undefined {
    return this._activeTabId;
  }

  get(tabId: number): TerminalGridPanel | undefined {
    return this._panels.get(tabId);
  }

  has(tabId: number): boolean {
    return this._panels.has(tabId);
  }

  size(): number {
    return this._panels.size;
  }

  all(): TerminalGridPanel[] {
    return Array.from(this._panels.values());
  }

  entries(): Array<[number, TerminalGridPanel]> {
    return Array.from(this._panels.entries());
  }

  disposeAll(): void {
    const panels = Array.from(this._panels.values());
    for (const p of panels) {
      try { p.dispose(); } catch { /* ignore */ }
    }
    this._panels.clear();
    this._activeTabId = undefined;
  }
}

export const panelRegistry = new PanelRegistry();

export class TabIdAllocator {
  private static readonly KEY = "nextTabId";
  static next(context: vscode.ExtensionContext): number {
    const current = context.globalState.get<number>(TabIdAllocator.KEY, 0);
    void context.globalState.update(TabIdAllocator.KEY, current + 1);
    return current;
  }
  static peek(context: vscode.ExtensionContext): number {
    return context.globalState.get<number>(TabIdAllocator.KEY, 0);
  }
  static reset(context: vscode.ExtensionContext): Thenable<void> {
    return context.globalState.update(TabIdAllocator.KEY, 0);
  }
}
