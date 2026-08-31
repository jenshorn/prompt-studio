import { existsSync } from "node:fs";
import { win32 } from "node:path";

export class GitError extends Error {
  constructor(
    public readonly command: string,
    public readonly exitCode: number,
    public readonly stderr: string,
  ) {
    super(`git ${command} failed (exit ${exitCode}): ${stderr}`);
    this.name = "GitError";
  }
}

type GitSpawner = typeof Bun.spawn;
type GitExecutableDeps = {
  exists?: (path: string) => boolean;
  platform?: NodeJS.Platform | "win32";
  which?: (command: string) => string | null;
};

export const resolveGitExecutable = (deps: GitExecutableDeps = {}) => {
  const which = deps.which ?? ((command: string) => Bun.which(command));
  const resolved = which("git") ?? "git";
  if ((deps.platform ?? process.platform) !== "win32") return resolved;
  if (win32.basename(win32.dirname(resolved)).toLowerCase() !== "cmd") return resolved;

  const root = win32.dirname(win32.dirname(resolved));
  const exists = deps.exists ?? existsSync;
  const nativeGit = [win32.join(root, "mingw64", "bin", "git.exe"), win32.join(root, "mingw32", "bin", "git.exe")].find(
    exists,
  );

  return nativeGit ?? resolved;
};

export const spawnGit = (
  cwd: string,
  args: string[],
  spawner: GitSpawner = Bun.spawn,
  executable = resolveGitExecutable(),
) => spawner([executable, ...args], { cwd, stdout: "pipe", stderr: "pipe", windowsHide: true });

export const createGit =
  (spawner: GitSpawner = Bun.spawn, executable = resolveGitExecutable()) =>
  async (cwd: string, args: string[]) => {
    const proc = spawnGit(cwd, args, spawner, executable);
    const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      throw new GitError(args.join(" "), exitCode, stderr.trim());
    }

    return stdout.trim();
  };

export const git = createGit();
