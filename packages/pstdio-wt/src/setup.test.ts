import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRunSetup, runSetup, runSetupScript } from "./setup";

let worktreePath: string;

beforeEach(async () => {
  worktreePath = await realpath(await mkdtemp(join(tmpdir(), "pstdio-wt-setup-test-")));
  await Bun.write(join(worktreePath, "README.md"), "# test repo\n");
});

afterEach(async () => {
  await rm(worktreePath, { recursive: true, force: true });
});

describe("runSetup", () => {
  test("hides Windows console windows when spawning setup commands", async () => {
    const calls: unknown[] = [];
    const runSetup = createRunSetup(((command: string[], options: unknown) => {
      calls.push({ command, options });
      return {
        exited: Promise.resolve(0),
        stderr: new Response("").body!,
        stdout: new Response("ok\n").body!,
      };
    }) as never);

    await expect(runSetup({ worktreePath, command: ["bun", "install"] })).resolves.toMatchObject({
      exitCode: 0,
      stdout: "ok\n",
      stderr: "",
    });

    expect(calls).toEqual([
      {
        command: ["bun", "install"],
        options: expect.objectContaining({
          cwd: worktreePath,
          stderr: "pipe",
          stdout: "pipe",
          windowsHide: true,
        }),
      },
    ]);
  });

  test("runs a command and captures output", async () => {
    const result = await runSetup({
      worktreePath,
      command: [process.execPath, "-e", "console.log('hello setup')"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("hello setup");
  });

  test("captures non-zero exit code", async () => {
    const result = await runSetup({
      worktreePath,
      command: [process.execPath, "-e", "process.exit(42)"],
    });

    expect(result.exitCode).toBe(42);
  });

  test("sets WORKTREE_PATH env var", async () => {
    const result = await runSetup({
      worktreePath,
      command: [process.execPath, "-e", "console.log(process.env.WORKTREE_PATH)"],
    });

    expect(result.stdout.trim()).toBe(worktreePath);
  });
});

describe("runSetupScript", () => {
  test("runs a shell script string", async () => {
    const script =
      process.platform === "win32" ? "echo from script && dir /b README.md" : "echo 'from script' && ls README.md";
    const result = await runSetupScript({
      worktreePath,
      script,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("from script");
    expect(result.stdout).toContain("README.md");
  });
});
