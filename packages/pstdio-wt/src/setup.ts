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

const shellCommandFor = (script: string) =>
  process.platform === "win32" ? [process.env.ComSpec ?? "cmd.exe", "/d", "/s", "/c", script] : ["sh", "-c", script];

export const runSetupScript = async (opts: { worktreePath: string; script: string }) => {
  return runSetup({
    worktreePath: opts.worktreePath,
    command: shellCommandFor(opts.script),
  });
};
