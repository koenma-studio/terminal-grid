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
  } catch { /* Relative file paths are resolved against the workspace by the host. */ }
  const withoutLine = text.replace(/:\d+(?::\d+)?$/, "");
  // A line suffix can resemble a URI scheme, but other schemes stay unsupported.
  if (/^[a-z][a-z\d+.-]*:/i.test(withoutLine)) return;
  if (/^\.{1,2}[\\/]/.test(text)
    || (!text.startsWith("\\") && /[\\/]/.test(text))
    || /^[^\\/:*?"<>|]+\.[^\\/:*?"<>|\s.]+$/.test(withoutLine)) {
    return { kind: "path", path: text };
  }
  return undefined;
}

// Korean particles and endings that prose attaches directly after a path or URL.
const PARTICLE = "에서|으로|에게|까지|부터|처럼|보다|이나|이랑|하고|입니다|이에요|예요|이다|인데|인지|이고|이며|이면|"
  + "이라고|라고|이라|라는|이란|[을를이가은는에의로와과도만엔나랑인란]";
const PARTICLES = new RegExp(`^(?:${PARTICLE})+$`);
const ONE_PARTICLE = new RegExp(`^(?:${PARTICLE})$`);

/** Removes prose attached to a target: `a.jpg를`, `a.png(정면)`, `a.md)에서`, `grid를`, `folder/에`. */
export function withoutAttachedProse(text: string): string {
  // A file name does not continue with Korean text or a note right after its extension.
  const extension = /^(.*[^\\/.]\.[a-z][a-z\d]*(?::\d+(?::\d+)?|#L\d+(?:C\d+)?)?)(?:\p{Script=Hangul}|[([{])[^\\/.]*$/iu.exec(text);
  if (extension) return extension[1];
  const closed = /^(.*[)\]}])\p{Script=Hangul}[^\\/.]*$/u.exec(text);
  if (closed) return closed[1];
  // Short runs keep the particle match linear; a Korean name after a separator keeps chains like `도로`.
  const korean = /^(.*[^\p{Script=Hangul}])(\p{Script=Hangul}{1,6})$/u.exec(text);
  return korean && (/[\\/]$/.test(korean[1]) ? ONE_PARTICLE : PARTICLES).test(korean[2]) ? korean[1] : text;
}

/** CLIs that linkify `…/terminal-grid를` include the particle in the hyperlink; open the address without it. */
export function webTargetWithoutProse(href: string): string {
  try {
    const url = new URL(href);
    if (url.search || url.hash) return href;
    const path = decodeURIComponent(url.pathname);
    const trimmed = withoutAttachedProse(path);
    if (trimmed === path) return href;
    url.pathname = trimmed;
    return url.href;
  } catch {
    return href;
  }
}

/** Shorter names for a missing Korean name with an attached particle: `자료를` → `자료`. */
export function withoutKoreanParticle(path: string): string[] {
  const names: string[] = [];
  for (let index = path.length - 1; index > 0 && path.length - index <= 6 && /\p{Script=Hangul}/u.test(path[index]); index--) {
    const name = path.slice(0, index);
    if (!/[\\/]$/.test(name) && PARTICLES.test(path.slice(index))) names.push(name);
  }
  return names;
}
