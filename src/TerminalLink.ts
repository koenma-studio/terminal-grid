export type TerminalLink =
  | { kind: "web"; uri: string }
  | { kind: "file"; uri: string }
  | { kind: "path"; path: string };

/** Shared by the webview and host; OSC 8 targets are untrusted terminal output. */
export function parseTerminalLink(value: unknown): TerminalLink | undefined {
  if (typeof value !== "string" || /[\x00-\x1f\x7f]/.test(value)) return;
  const text = value.trim();
  // Do not treat Windows device namespaces as ordinary file paths.
  if (/^[\\/]{2}[?.][\\/]/.test(text)) return;
  if (/^[a-z]:[\\/]/i.test(text) || text.startsWith("/") || /^\\\\[^\\]+\\/.test(text)) {
    return { kind: "path", path: text };
  }
  try {
    const uri = new URL(text);
    if (uri.protocol === "http:" || uri.protocol === "https:") return { kind: "web", uri: uri.href };
    if (uri.protocol === "file:") return { kind: "file", uri: uri.href };
  } catch { /* Malformed or relative targets are not links we can resolve. */ }
  return undefined;
}
