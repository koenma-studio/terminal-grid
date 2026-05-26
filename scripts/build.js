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

// Remove other-version folders
if (fs.existsSync(extDir)) {
  for (const name of fs.readdirSync(extDir)) {
    if (name.startsWith("koenma.terminal-grid-") && name !== path.basename(targetDir)) {
      fs.rmSync(path.join(extDir, name), { recursive: true, force: true });
      console.log("Removed old: " + name);
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
console.log(`Deployed to ${targetDir}. Reload VS Code to activate.`);
