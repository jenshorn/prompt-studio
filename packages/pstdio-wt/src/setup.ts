type SetupSpawner = typeof Bun.spawn;

export const createRunSetup =
  (spawner: SetupSpawner = Bun.spawn) =>
  async (opts: { worktreePath: string; command: string[] }) => {
    const proc = spawner(opts.command, {
      cwd: opts.worktreePath,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, WORKTREE_PATH: opts.worktreePath },
      windowsHide: true,
    });

    const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);

    const exitCode = await proc.exited;

    return { exitCode, stdout, stderr };
  };

export const runSetup = createRunSetup();

type ShellResolver = (command: string) => string | null;

const defaultWhich: ShellResolver = (command) => (typeof Bun.which === "function" ? Bun.which(command) : null);

/**
 * Setup scripts are authored as POSIX shell. On Windows we still prefer a real
 * shell — Git for Windows ships `bash` — and only fall back to `cmd.exe` (which
 * can't run `&&`, `$VAR`, or POSIX quoting) when no POSIX shell is on PATH.
 */
export const shellCommandFor = (
  script: string,
  platform: NodeJS.Platform | "win32" = process.platform,
  which: ShellResolver = defaultWhich,
): string[] => {
  if (platform !== "win32") return ["sh", "-c", script];

  const posixShell = which("bash") ?? which("sh");
  if (posixShell) return [posixShell, "-c", script];

  return [process.env.ComSpec ?? "cmd.exe", "/d", "/s", "/c", script];
};

export const runSetupScript = async (opts: { worktreePath: string; script: string }) => {
  return runSetup({
    worktreePath: opts.worktreePath,
    command: shellCommandFor(opts.script),
  });
};
