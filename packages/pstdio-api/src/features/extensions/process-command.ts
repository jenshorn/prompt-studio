import { existsSync } from "node:fs";

type WhichCommand = (command: string) => string | null;
type ExistsCommand = (path: string) => boolean;

const hasPathSeparator = (command: string) => command.includes("/") || command.includes("\\");

const endsWithAny = (value: string, suffixes: string[]) => {
  const lower = value.toLowerCase();
  return suffixes.some((suffix) => lower.endsWith(suffix));
};

// npm installs three shims side by side: `foo`, `foo.cmd`, `foo.ps1`. `Bun.which`
// can return the `.ps1` when PATHEXT lists `.PS1` before `.CMD`, and neither
// `Bun.spawn` nor `cmd.exe /c` can launch a `.ps1` — so switch to the sibling
// `.cmd`/`.bat`/`.exe`, which the rest of this function already knows how to run.
const preferSpawnableSibling = (command: string, exists: ExistsCommand) => {
  if (!command.toLowerCase().endsWith(".ps1")) return command;

  const base = command.slice(0, -".ps1".length);
  for (const extension of [".cmd", ".bat", ".exe"]) {
    if (exists(base + extension)) return base + extension;
  }
  return command;
};

const whichCommand: WhichCommand = (command) => {
  if (typeof Bun.which !== "function") return null;
  return Bun.which(command);
};

/**
 * Resolve a bare command name to a spawnable argv.
 *
 * `Bun.spawn` needs an absolute path on Windows and, for npm-installed CLIs,
 * finds a `.cmd`/`.bat`/`.ps1` shim it can't execute directly. `.cmd`/`.bat` run
 * through `cmd.exe /c call`; a `.ps1` falls back to its sibling shim, or
 * `powershell -File` when it stands alone. Commands that already contain a path
 * separator, or that can't be resolved, are passed through untouched.
 */
export const resolveProcessCommand = (
  command: readonly string[],
  which: WhichCommand = whichCommand,
  platform = process.platform,
  comspec = process.env.ComSpec,
  exists: ExistsCommand = existsSync,
): string[] => {
  const [executable, ...args] = command;
  if (!executable || hasPathSeparator(executable)) return [...command];

  const resolved = which(executable);
  if (!resolved) return [...command];
  if (platform !== "win32") return [resolved, ...args];

  const target = preferSpawnableSibling(resolved, exists);
  if (endsWithAny(target, [".cmd", ".bat"])) {
    return [comspec ?? "cmd.exe", "/d", "/s", "/c", "call", target, ...args];
  }
  if (target.toLowerCase().endsWith(".ps1")) {
    return ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", target, ...args];
  }
  return [target, ...args];
};
