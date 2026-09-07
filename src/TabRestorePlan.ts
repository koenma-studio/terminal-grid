import type { SavedTab } from "./TabStateStore";

/** Match each VS Code webview to its saved tab, independent of deserialize order. */
export class TabRestorePlan {
  private readonly _byId: Map<number, SavedTab>;
  private readonly _claimed = new Set<number>();
  private _cancelled = false;

  constructor(readonly tabs: SavedTab[]) {
    this._byId = new Map(tabs.map(tab => [tab.tabId, tab]));
  }

  claim(state: unknown): SavedTab | undefined {
    if (this._cancelled) return undefined;
    const id = state && typeof state === "object" ? (state as { tabId?: unknown }).tabId : undefined;
    if (typeof id !== "number" || this._claimed.has(id)) return undefined;
    const tab = this._byId.get(id);
    if (tab) this._claimed.add(id);
    return tab;
  }

  missing(registeredIds: Iterable<number>): SavedTab[] {
    if (this._cancelled) return [];
    const registered = new Set(registeredIds);
    return this.tabs.filter(tab => !registered.has(tab.tabId));
  }

  cancel(): void { this._cancelled = true; }
}
