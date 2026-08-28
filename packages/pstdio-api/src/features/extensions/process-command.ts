type WhichCommand = (command: string) => string | null;

const hasPathSeparator = (command: string) => command.includes("/") || command.includes("\\");

const isWindowsCommandShim = (command: string) => {
  const lower = command.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".bat");
};

const whichCommand: WhichCommand = (command) => {
  if (typeof Bun.which !== "function") return null;
  return Bun.which(command);
};

/**
 * Resolve a bare command name to a spawnable argv.
 *
 * `Bun.spawn` needs an absolute path on Windows and, for npm-installed CLIs,
 * only finds a `.cmd`/`.bat` shim that `spawn` can't execute directly — so those
 * are run through `cmd.exe /c call`. Commands that already contain a path
 * separator, or that can't be resolved, are passed through untouched.
 */
export const resolveProcessCommand = (
  command: readonly string[],
  which: WhichCommand = whichCommand,
  platform = process.platform,
  comspec = process.env.ComSpec,
): string[] => {
  const [executable, ...args] = command;
  if (!executable || hasPathSeparator(executable)) return [...command];

  const resolved = which(executable);
  if (!resolved) return [...command];
  if (platform === "win32" && isWindowsCommandShim(resolved)) {
    return [comspec ?? "cmd.exe", "/d", "/s", "/c", "call", resolved, ...args];
  }
  return [resolved, ...args];
};
