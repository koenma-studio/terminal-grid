const fs = require("fs");
const os = require("os");
const path = require("path");

try {
  const directory = path.join(os.homedir(), ".terminal-grid");
  const deployment = JSON.parse(fs.readFileSync(path.join(directory, "deployment.json"), "utf8"));
  const sessions = [];
  for (const file of fs.readdirSync(path.join(directory, "sessions"))) {
    if (!/^\d+\.json$/.test(file)) continue;
    try {
      const session = JSON.parse(fs.readFileSync(path.join(directory, "sessions", file), "utf8"));
      process.kill(session.pid, 0);
      sessions.push({ workspaces: session.workspaces, version: session.version, port: session.port,
        current: session.version === deployment.version && session.buildHash === deployment.buildHash
          && (!deployment.signal || session.signal === deployment.signal) });
    } catch { /* Exited hosts and files replaced during activation are checked on the next run. */ }
  }
  const complete = sessions.length > 0 && sessions.every(session => session.current);
  console.log(JSON.stringify({ installedVersion: deployment.version, installedAt: deployment.installedAt, complete, sessions }, null, 2));
  process.exitCode = complete ? 0 : 1;
} catch (error) {
  console.error("Installation verification unavailable: " + error.message);
  process.exitCode = 1;
}
