import type { Terminal } from "@xterm/xterm";

type PostMessage = (message: unknown) => void;
let copySequence = 0;
const pendingCopies = new Map<string, { done?: () => void; timer: ReturnType<typeof setTimeout> }>();
if (typeof window !== "undefined") window.addEventListener("message", event => {
  if (event.data?.type !== "clipboardWriteResult") return;
  const pending = pendingCopies.get(event.data.requestId);
  if (!pending) return;
  clearTimeout(pending.timer); pendingCopies.delete(event.data.requestId);
  if (event.data.success) pending.done?.();
});

export function copySelection(terminal: Terminal, post: PostMessage, text = terminal.getSelection(), done?: () => void): void {
  if (!text) return;
  const requestId = `copy-${++copySequence}`;
  pendingCopies.set(requestId, { done, timer: setTimeout(() => pendingCopies.delete(requestId), 15000) });
  post({ type: "clipboardWrite", text, requestId });
}

export async function sendImage(blob: Blob, id: number, post: PostMessage, requestId: number): Promise<void> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("Clipboard image read aborted"));
    reader.readAsDataURL(blob);
  });
  post({ type: "pasteImage", id, data, requestId });
}

export async function requestPaste(id: number, post: PostMessage, requestId: number): Promise<void> {
  try {
    if (navigator.clipboard?.read) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const items = await Promise.race([navigator.clipboard.read(), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Clipboard read timed out")), 1500);
      })]).finally(() => clearTimeout(timer));
      // Text with an image representation (e.g. a spreadsheet) should stay text.
      if (!items.some(item => item.types.includes("text/plain"))) {
        for (const item of items) {
          const type = item.types.find(t => /^image\/(png|jpeg|webp|gif)$/.test(t));
          if (type) {
            await sendImage(await item.getType(type), id, post, requestId);
            return;
          }
        }
      }
    }
  } catch { /* Webview clipboard permission/image decoding may fail; use the host. */ }
  post({ type: "pasteRequest", id, requestId });
}

export function handleClipboardKey(e: KeyboardEvent, terminal: Terminal, post: PostMessage, paste: () => void,
  selection?: { hasSelection(): boolean; getSelection(): string; cancel(): void }): boolean {
  if (e.type !== "keydown" || e.altKey || e.isComposing) return false;
  const key = e.key.toLowerCase();
  const modifier = e.ctrlKey || e.metaKey;
  const copy = modifier && key === "c" && ((selection ?? terminal).hasSelection() || e.shiftKey || e.metaKey);
  const isPaste = (modifier && key === "v") || (e.shiftKey && !modifier && key === "insert");
  if (!copy && !isPaste) return false;
  // Returning false to xterm alone doesn't cancel Chromium's native paste.
  e.preventDefault();
  e.stopPropagation();
  if (copy) {
    const text = (selection ?? terminal).getSelection();
    copySelection(terminal, post, text, () => {
      if (selection?.getSelection() === text) selection.cancel();
    });
  }
  else paste();
  return true;
}

export function handleNativePaste(e: ClipboardEvent, terminal: Terminal, pasteImage: (image: Blob) => void): void {
  if (!e.clipboardData) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (e.clipboardData.types.includes("text/plain")) {
    terminal.paste(e.clipboardData.getData("text/plain"));
    return;
  }
  const image = Array.from(e.clipboardData.files).find(file => /^image\/(png|jpeg|webp|gif)$/.test(file.type));
  if (image) pasteImage(image);
}
