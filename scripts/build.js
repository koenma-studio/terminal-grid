const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

fs.mkdirSync("media", { recursive: true });
fs.mkdirSync("dist", { recursive: true });

// Copy xterm.css
fs.copyFileSync(
  path.join("node_modules", "@xterm", "xterm", "css", "xterm.css"),
  path.join("media", "xterm.css")
);

// Bundle webview code + xterm.js (minified)
esbuild.buildSync({
  entryPoints: ["src/webview/gridTerminal.ts"],
  bundle: true,
  outfile: "media/gridTerminal.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  sourcemap: false,
});

// Bundle extension host code (minified)
esbuild.buildSync({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  format: "cjs",
  platform: "node",
  target: "node18",
  minify: true,
  sourcemap: false,
  external: ["vscode", "node-pty"],
});

// Bundle MCP server (standalone Node.js script with SDK + zod inlined)
esbuild.buildSync({
  entryPoints: ["src/mcp-server.ts"],
  bundle: true,
  outfile: "mcp-server.js",
  format: "cjs",
  platform: "node",
  target: "node18",
  minify: true,
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
});

console.log("Build complete (webview + extension + mcp-server).");

// ── Package VSIX & deploy ──
const { execSync } = require("child_process");
const AdmZip = require("adm-zip");
const pkg = require("../package.json");
const vsixName = `terminal-grid-${pkg.version}.vsix`;

// Package
execSync("npx vsce package", { stdio: "inherit" });

// Deploy: extract VSIX directly into extensions folder
const extDir = path.join(process.env.USERPROFILE || process.env.HOME, ".vscode", "extensions");
const targetDir = path.join(extDir, `koenma.terminal-grid-${pkg.version}`);

// Remove other-version folders (tolerate locked files — VS Code may hold conpty.node)
function rmTolerant(target) {
  let leftover = 0;
  function walk(p) {
    let stat;
    try { stat = fs.lstatSync(p); } catch { return; }
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(p)) walk(path.join(p, name));
      try { fs.rmdirSync(p); } catch { leftover++; }
    } else {
      try { fs.unlinkSync(p); } catch { leftover++; }
    }
  }
  walk(target);
  return leftover;
}
if (fs.existsSync(extDir)) {
  for (const name of fs.readdirSync(extDir)) {
    if (name.startsWith("koenma.terminal-grid-") && name !== path.basename(targetDir)) {
      const full = path.join(extDir, name);
      const leftover = rmTolerant(full);
      if (leftover === 0) {
        console.log("Removed old: " + name);
      } else {
        console.log(`Partially removed (busy): ${name} — ${leftover} file(s) still locked, leave VS Code to clean up after reload.`);
      }
    }
  }
}

// Extract VSIX (it's a zip) — files are under "extension/" prefix
const zip = new AdmZip(vsixName);
const entries = zip.getEntries();
fs.mkdirSync(targetDir, { recursive: true });
for (const entry of entries) {
  if (entry.entryName.startsWith("extension/")) {
    const rel = entry.entryName.slice("extension/".length);
    if (!rel) continue;
    const dest = path.join(targetDir, rel);
    if (entry.isDirectory) {
      fs.mkdirSync(dest, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try {
        fs.writeFileSync(dest, entry.getData());
      } catch (e) {
        if (e.code === "EBUSY") {
          console.log("  Skipped (busy): " + rel);
        } else {
          throw e;
        }
      }
    }
  }
}
console.log(`Deployed to ${targetDir}.`);

// Signal active VS Code windows to auto-reload (picked up by extension watcher)
const os = require("os");
const signalDir = path.join(os.homedir(), ".terminal-grid");
fs.mkdirSync(signalDir, { recursive: true });
fs.writeFileSync(path.join(signalDir, "reload-signal"), Date.now().toString());
console.log("Reload signal sent (active VS Code windows will auto-reload).");
