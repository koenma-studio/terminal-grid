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
