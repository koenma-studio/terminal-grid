const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const pkg = require("../package.json");

const root = path.resolve(__dirname, "..");
const vsix = path.join(root, `terminal-grid-${pkg.version}.vsix`);
if (!fs.existsSync(vsix)) throw new Error(`VSIX missing: ${vsix}. Run npm run deploy to build and install.`);
const editor = process.env.TERMINAL_GRID_EDITOR || "code";
const args = ["--install-extension", vsix, "--force"];

// PowerShell invokes Windows .cmd launchers with literal arguments, including paths with spaces.
// Let the editor manage extension registration and locked native modules.
let result;
if (process.platform === "win32") {
  const quote = value => "'" + value.replace(/'/g, "''") + "'";
  const command = "& " + [editor, ...args].map(quote).join(" ") + "; exit $LASTEXITCODE";
  result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], {
    cwd: root, stdio: "inherit", windowsHide: true,
  });
} else {
  result = spawnSync(editor, args, { cwd: root, stdio: "inherit" });
}
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

// Persist before signaling: a reload can terminate the terminal running this installer.
const directory = path.join(os.homedir(), ".terminal-grid");
fs.mkdirSync(directory, { recursive: true });
const signal = process.argv.includes("--no-reload") ? null : `${Date.now()}-${crypto.randomUUID()}`;
const receipt = {
  version: pkg.version, installedAt: new Date().toISOString(), vsix, signal,
  buildHash: crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "dist", "extension.js"))).digest("hex"),
};
const receiptPath = path.join(directory, "deployment.json");
const receiptTemp = `${receiptPath}.${process.pid}.tmp`;
fs.writeFileSync(receiptTemp, JSON.stringify(receipt, null, 2));
fs.renameSync(receiptTemp, receiptPath);

if (process.argv.includes("--no-reload")) {
  console.log(`Terminal Grid ${pkg.version} installed. Automatic reload skipped.`);
} else {
  fs.writeFileSync(path.join(directory, "reload-signal"), signal);
  console.log(`Terminal Grid ${pkg.version} installed; Reload Window signal sent.`);
  console.log("Active editor windows with Terminal Grid will reload. Activation receipts: " + path.join(directory, "sessions"));
  console.log("After reload, run npm run verify:install to confirm every active window's build.");
}
