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
 * Persistence: `nextGlobalCellId` in globalState.
 *
 * Resolution: walks panelRegistry asking each panel for its cellIds[] and
 * matching against the global ID. O(tabs × cells) but tab counts are small.
 */
class CellIdMapperImpl {
  private static readonly KEY = "nextGlobalCellId";

  allocate(context: vscode.ExtensionContext, count: number): number[] {
    const start = context.globalState.get<number>(CellIdMapperImpl.KEY, 0);
    const ids: number[] = [];
    for (let i = 0; i < count; i++) ids.push(start + i);
    void context.globalState.update(CellIdMapperImpl.KEY, start + count);
    return ids;
  }

  peek(context: vscode.ExtensionContext): number {
    return context.globalState.get<number>(CellIdMapperImpl.KEY, 0);
  }

  reset(context: vscode.ExtensionContext): Thenable<void> {
    return context.globalState.update(CellIdMapperImpl.KEY, 0);
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
