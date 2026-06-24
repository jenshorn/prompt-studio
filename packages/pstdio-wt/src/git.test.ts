import { describe, expect, test } from "bun:test";
import { createGit, GitError, git, resolveGitExecutable } from "./git";

const stream = (value: string) => new Response(value).body!;

describe("git", () => {
  test("bypasses the Git for Windows cmd launcher", () => {
    const command = resolveGitExecutable({
      exists: (path) => path === "C:\\Program Files\\Git\\mingw64\\bin\\git.exe",
      platform: "win32",
      which: () => "C:\\Program Files\\Git\\cmd\\git.exe",
    });

    expect(command).toBe("C:\\Program Files\\Git\\mingw64\\bin\\git.exe");
  });

  test("hides Windows console windows when spawning git", async () => {
    const calls: unknown[] = [];
    const runGit = createGit(
      ((command: string[], options: unknown) => {
        calls.push({ command, options });
        return {
          exited: Promise.resolve(0),
          stderr: stream(""),
          stdout: stream("ok\n"),
        };
      }) as never,
      "git",
    );

    await expect(runGit("C:\\repo", ["status", "--short"])).resolves.toBe("ok");

    expect(calls).toEqual([
      {
        command: ["git", "status", "--short"],
        options: expect.objectContaining({
          cwd: "C:\\repo",
          stderr: "pipe",
          stdout: "pipe",
          windowsHide: true,
        }),
      },
    ]);
  });

  test("runs a git command and returns trimmed stdout", async () => {
    const result = await git(import.meta.dir, ["rev-parse", "--is-inside-work-tree"]);
    expect(result).toBe("true");
  });

  test("throws GitError on failure", async () => {
    try {
      await git(import.meta.dir, ["rev-parse", "--verify", "nonexistent-ref-abc123"]);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GitError);
      expect((err as GitError).exitCode).not.toBe(0);
    }
  });
});
