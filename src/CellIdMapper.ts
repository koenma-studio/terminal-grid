import * as vscode from "vscode";
import { panelRegistry } from "./PanelRegistry";

/**
 * Sparse global cell ID allocator + resolver.
 *
 * Each tab owns a contiguous block of global cell IDs (e.g. tab A = [0..3],
 * tab B = [4..7]). When a tab is closed, its IDs are NOT reclaimed — they
 * become permanent holes (sparse). New tabs always allocate from the next
 * unused ID, so an LLM that remembers a global ID can still hit the right
 * cell as long as the tab is open.
 *
 * Persistence: `nextGlobalCellId` in workspaceState. IDs are scoped to one editor window's workspace.
 *
 * Resolution: walks panelRegistry asking each panel for its cellIds[] and
 * matching against the global ID. O(tabs × cells) but tab counts are small.
 */
class CellIdMapperImpl {
  private static readonly KEY = "nextGlobalCellId";
  private readonly _next = new WeakMap<vscode.Memento, number>();

  allocate(context: vscode.ExtensionContext, count: number): number[] {
    const start = this.peek(context);
    const ids: number[] = [];
    for (let i = 0; i < count; i++) ids.push(start + i);
    this._next.set(context.workspaceState, start + count);
    void context.workspaceState.update(CellIdMapperImpl.KEY, start + count);
    return ids;
  }

  peek(context: vscode.ExtensionContext): number {
    return Math.max(this._next.get(context.workspaceState) ?? 0, context.workspaceState.get<number>(CellIdMapperImpl.KEY, 0));
  }

  reserve(context: vscode.ExtensionContext, ids: number[]): void {
    const next = Math.max(this.peek(context), ...ids.map(id => id + 1));
    this._next.set(context.workspaceState, next);
    void context.workspaceState.update(CellIdMapperImpl.KEY, next);
  }

  reset(context: vscode.ExtensionContext): Thenable<void> {
    this._next.set(context.workspaceState, 0);
    return context.workspaceState.update(CellIdMapperImpl.KEY, 0);
  }

  /**
   * Resolve a global cell ID → { tabId, localCellId }.
   * Returns null if no open tab owns this ID.
   */
  resolve(globalCellId: number): { tabId: number; localCellId: number } | null {
    for (const [tabId, panel] of panelRegistry.entries()) {
      const cellIds = panel.getCellIds();
      const localIdx = cellIds.indexOf(globalCellId);
      if (localIdx !== -1) {
        return { tabId, localCellId: localIdx };
      }
    }
    return null;
  }
}

export const cellIdMapper = new CellIdMapperImpl();
