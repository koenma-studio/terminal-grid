export interface LaunchOptions {
  cli: "codex" | "claude";
  mode: "new" | "picker" | "last" | "session";
  sessionId?: string;
  options?: string;
}

export type StartupStep = { type: "command"; input: string } | { type: "timeout"; ms: number };

/** Self-contained so the sidebar can use the same validation and command preview. */
export function buildLaunchCommand(launch: LaunchOptions): string {
  if (!["codex", "claude"].includes(launch.cli) || !["new", "picker", "last", "session"].includes(launch.mode)) {
    throw new Error("Choose a CLI and a launch mode.");
  }
  const session = (launch.sessionId || "").trim();
  // Session IDs are shell-safe tokens. Names containing shell syntax must be entered as a custom command.
  if (launch.mode === "session" && !/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,199}$/.test(session)) {
    throw new Error("Enter a valid session ID (letters, numbers, dots, colons, underscores or hyphens).");
  }
  const options = (launch.options || "").trim();
  if (/[\r\n\x00]/.test(options)) throw new Error("CLI options must be a single line.");
  let command: string = launch.cli;
  if (launch.mode !== "new") {
    if (launch.cli === "codex") command += " resume" + (launch.mode === "last" ? " --last" : "");
    else command += launch.mode === "last" ? " --continue" : " --resume";
    if (launch.mode === "session") command += " " + session;
  }
  return command + (options ? " " + options : "");
}

/** Compile the common legacy launch → /resume pair without changing saved settings or arbitrary shell commands. */
export function compileStartupSteps(steps: StartupStep[]): StartupStep[] {
  const result: StartupStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    let nextIndex = i + 1;
    while (steps[nextIndex]?.type === "timeout") nextIndex++;
    const next = steps[nextIndex];
    if (step.type === "command" && next?.type === "command") {
      const launch = step.input.trim().match(/^(codex|claude)(\s+--?[\w][^\r\n]*)?$/);
      const resume = next.input.trim().match(/^\/resume(?:\s+([a-zA-Z0-9][a-zA-Z0-9_.:-]{0,199}))?$/);
      const options = launch?.[2]?.trim() || "";
      if (launch && resume && !/[;&|<>`$()]/.test(options) && !/(?:^|\s)(?:--resume|--continue|-r|-c|resume)(?:\s|$)/.test(options)) {
        result.push({ type: "command", input: buildLaunchCommand({ cli: launch[1] as "codex" | "claude", mode: resume[1] ? "session" : "picker", sessionId: resume[1], options }) });
        result.push(...steps.slice(i + 1, nextIndex).map(step => ({ ...step })));
        i = nextIndex;
        continue;
      }
    }
    result.push({ ...step });
  }
  return result;
}
