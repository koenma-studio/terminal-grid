// Builds the VSIX from the pushed commit and creates the GitHub release that
// .github/workflows/publish.yml publishes to Open VSX and the VS Code Marketplace.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const pkg = require("../package.json");

const root = path.resolve(__dirname, "..");
const tag = `v${pkg.version}`;
const vsix = `terminal-grid-${pkg.version}.vsix`;
const dryRun = process.argv.includes("--dry-run");
// Windows runs npm/npx as .cmd scripts through a shell; git and gh get their arguments verbatim.
const shell = command => process.platform === "win32" && (command === "npm" || command === "npx");
const output = (command, ...args) => execFileSync(command, args, { cwd: root, encoding: "utf8", shell: shell(command) }).trim();
const run = (command, ...args) => execFileSync(command, args, { cwd: root, stdio: "inherit", shell: shell(command) });
const fail = message => { console.error(`Release ${tag} stopped: ${message}`); process.exit(1); };

// Release notes are the CHANGELOG section for this version.
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8").replace(/\r\n/g, "\n");
const start = changelog.indexOf(`## [${pkg.version}]`);
if (start < 0) fail(`CHANGELOG.md has no [${pkg.version}] section.`);
const next = changelog.indexOf("\n## [", start + 1);
const notes = changelog.slice(changelog.indexOf("\n", start) + 1, next < 0 ? undefined : next).trim();

// The tag must point at a pushed commit containing these sources and build output.
if (output("git", "status", "--porcelain")) fail("commit all changes first.");
run("git", "fetch", "--quiet", "origin");
const head = output("git", "rev-parse", "HEAD");
if (!output("git", "branch", "-r", "--contains", head).split("\n").some(branch => branch.trim() === "origin/main")) {
  fail("push this commit to origin/main first.");
}
if (output("git", "ls-remote", "--tags", "origin", `refs/tags/${tag}`)) fail(`${tag} already exists; bump the version.`);

// Every platform's node-pty binary must ship; npm does not provide the Linux one.
const files = output("npx", "--yes", "@vscode/vsce@4.0.0", "ls").split(/\r?\n/);
for (const platform of ["win32-x64", "win32-arm64", "darwin-x64", "darwin-arm64", "linux-x64"]) {
  if (!files.includes(`node_modules/node-pty/prebuilds/${platform}/pty.node`)) fail(`the node-pty ${platform} prebuild is missing.`);
}
run("npm", "run", "package");
if (output("git", "status", "--porcelain")) fail("the build changed tracked files; commit the build output and run again.");

if (dryRun) {
  console.log(`Dry run: ${vsix} is ready for ${tag} at ${head.slice(0, 7)}.\n\n${notes}`);
  process.exit(0);
}
const notesFile = path.join(os.tmpdir(), `terminal-grid-${tag}-notes.md`);
fs.writeFileSync(notesFile, notes + "\n");
try {
  run("gh", "release", "create", tag, vsix, "--target", head, "--title", tag, "--notes-file", notesFile);
} finally {
  fs.rmSync(notesFile, { force: true });
}
console.log(`Release ${tag} created. Publishing: https://github.com/koenma-studio/terminal-grid/actions/workflows/publish.yml`);
