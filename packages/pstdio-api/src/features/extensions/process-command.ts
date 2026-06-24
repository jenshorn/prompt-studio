import { existsSync } from "node:fs";
import { win32 } from "node:path";

type WhichCommand = (command: string) => string | null;
type ExistsCommand = (command: string) => boolean;

const hasPathSeparator = (command: string) => command.includes("/") || command.includes("\\");
const isWindowsCommandShim = (command: string) => {
  const lower = command.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".bat");
};

const resolveNativeCodex = (command: string, exists: ExistsCommand) => {
  if (win32.basename(command).toLowerCase() !== "codex.cmd") return null;

  const npmBinDir = win32.dirname(command);
  const candidates = [
    win32.join(
      npmBinDir,
      "node_modules",
      "@openai",
      "codex",
      "node_modules",
      "@openai",
      "codex-win32-x64",
      "vendor",
      "x86_64-pc-windows-msvc",
      "bin",
      "codex.exe",
    ),
    win32.join(npmBinDir, "node_modules", "@openai", "codex", "vendor", "x86_64-pc-windows-msvc", "bin", "codex.exe"),
  ];

  return candidates.find(exists) ?? null;
};

const whichCommand: WhichCommand = (command) => {
  if (typeof Bun.which !== "function") return null;
  return Bun.which(command);
};

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
  if (platform === "win32" && isWindowsCommandShim(resolved)) {
    const nativeCodex = resolveNativeCodex(resolved, exists);
    if (nativeCodex) return [nativeCodex, ...args];
    return [comspec ?? "cmd.exe", "/d", "/s", "/c", "call", resolved, ...args];
  }
  return [resolved, ...args];
};
