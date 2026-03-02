import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export type FileChange = {
  filePath: string;
  additions: number;
  deletions: number;
};

export type FileDiff = {
  filePath: string;
  change: "added" | "deleted" | "modified" | "renamed" | "copied" | "permissionChange";
  additions: number;
  deletions: number;
  oldContent: string;
  newContent: string;
  oldPath?: string;
  newPath?: string;
};

export type DiffMode = "unstaged" | "staged" | "all";

type GitDiffResult = { success: true; diff: string } | { success: false; error: string; code?: string };

function normalizeHeaderPath(input?: string | null): string | null {
  if (!input) return null;

  const token = input.split("\t")[0].trim();
  if (token === "/dev/null") return null;

  let normalized = token;
  if (normalized.startsWith("a/") || normalized.startsWith("b/")) {
    normalized = normalized.slice(2);
  }

  normalized = normalized.replace(/^\/+/, "").replace(/\\/g, "/");
  return normalized;
}

export const createGitDiffService = () => {
  const parseDiff = (diffText: string): FileChange[] => {
    if (!diffText || typeof diffText !== "string") return [];

    const changes = new Map<string, { additions: number; deletions: number }>();
    let currentPath: string | null = null;
    let lastMinusHeader: string | null = null;
    let inHunk = false;

    const lines = diffText.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("--- ")) {
        lastMinusHeader = normalizeHeaderPath(line.slice(4));
        inHunk = false;
        continue;
      }

      if (line.startsWith("+++ ")) {
        const plusPath = normalizeHeaderPath(line.slice(4));
        currentPath = plusPath ?? lastMinusHeader;
        if (currentPath && !changes.has(currentPath)) {
          changes.set(currentPath, { additions: 0, deletions: 0 });
        }
        inHunk = false;
        continue;
      }

      if (!currentPath) continue;

      if (line.startsWith("@@")) {
        inHunk = true;
        continue;
      }

      if (!inHunk) continue;

      if (line.startsWith("+") && !(line.startsWith("+++ ") || line === "+++")) {
        const current = changes.get(currentPath);
        if (current) current.additions += 1;
        continue;
      }

      if (line.startsWith("-") && !(line.startsWith("--- ") || line === "---")) {
        const current = changes.get(currentPath);
        if (current) current.deletions += 1;
      }
    }

    return Array.from(changes.entries()).map(([filePath, { additions, deletions }]) => ({
      filePath,
      additions,
      deletions,
    }));
  };

  const parseDiffWithContent = (diffText: string): FileDiff[] => {
    if (!diffText || typeof diffText !== "string") return [];

    const files: FileDiff[] = [];
    const fileChunks = diffText.split(/^diff --git /m).filter(Boolean);

    for (const chunk of fileChunks) {
      const lines = chunk.split(/\r?\n/);
      const header = lines[0];

      const pathMatch = header.match(/a\/(.*?) b\/(.*)/);
      if (!pathMatch) continue;

      let oldPath = pathMatch[1];
      let newPath = pathMatch[2];

      let change: FileDiff["change"] = "modified";
      let additions = 0;
      let deletions = 0;
      let oldContent = "";
      let newContent = "";
      let inHunk = false;
      const oldLines: string[] = [];
      const newLines: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("new file mode")) {
          change = "added";
          continue;
        }

        if (line.startsWith("deleted file mode")) {
          change = "deleted";
          continue;
        }

        if (line.startsWith("rename from")) {
          change = "renamed";
          oldPath = line.slice("rename from ".length);
          continue;
        }

        if (line.startsWith("rename to")) {
          newPath = line.slice("rename to ".length);
          continue;
        }

        if (line.startsWith("old mode") || line.startsWith("new mode")) {
          if (!lines.some((l) => l.startsWith("---") || l.startsWith("+++"))) {
            change = "permissionChange";
          }
          continue;
        }

        if (line.startsWith("Binary files")) {
          change = "modified";
          break;
        }

        if (line.startsWith("--- ")) {
          continue;
        }

        if (line.startsWith("+++ ")) {
          continue;
        }

        if (line.startsWith("@@")) {
          inHunk = true;
          continue;
        }

        if (!inHunk) continue;

        if (line.startsWith("+") && !line.startsWith("+++")) {
          additions += 1;
          newLines.push(line.slice(1));
          continue;
        }

        if (line.startsWith("-") && !line.startsWith("---")) {
          deletions += 1;
          oldLines.push(line.slice(1));
          continue;
        }

        if (line.startsWith(" ")) {
          oldLines.push(line.slice(1));
          newLines.push(line.slice(1));
          continue;
        }

        oldLines.push(line);
        newLines.push(line);
      }

      oldContent = oldLines.join("\n");
      newContent = newLines.join("\n");

      files.push({
        filePath: newPath,
        change,
        additions,
        deletions,
        oldContent,
        newContent,
        ...(change === "renamed" && { oldPath, newPath }),
      });
    }

    return files;
  };

  const isGitRepo = async (repoPath: string): Promise<boolean> => {
    try {
      const { stdout } = await execAsync("git rev-parse --git-dir", {
        cwd: repoPath,
        timeout: 5000,
      });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  };

  const executeDiff = async (repoPath: string, args: string[]): Promise<GitDiffResult> => {
    try {
      const { stdout } = await execAsync(`git diff ${args.join(" ")}`, {
        cwd: repoPath,
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024,
      });
      return { success: true, diff: stdout };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const getUnstagedDiff = async (repoPath: string): Promise<string> => {
    const result = await executeDiff(repoPath, ["HEAD"]);
    if (!result.success) {
      throw new Error(`Failed to get unstaged diff: ${result.error}`);
    }
    return result.diff;
  };

  const getStagedDiff = async (repoPath: string): Promise<string> => {
    const result = await executeDiff(repoPath, ["--cached", "HEAD"]);
    if (!result.success) {
      throw new Error(`Failed to get staged diff: ${result.error}`);
    }
    return result.diff;
  };

  const getAllDiff = async (repoPath: string): Promise<string> => {
    return getUnstagedDiff(repoPath);
  };

  const getDiffByMode = async (repoPath: string, mode: DiffMode): Promise<string> => {
    switch (mode) {
      case "unstaged":
        return getUnstagedDiff(repoPath);
      case "staged":
        return getStagedDiff(repoPath);
      case "all":
        return getAllDiff(repoPath);
      default:
        throw new Error(`Invalid diff mode: ${mode}`);
    }
  };

  const getCurrentBranch = async (repoPath: string): Promise<string> => {
    try {
      const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD", {
        cwd: repoPath,
        timeout: 5000,
      });
      return stdout.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get current branch: ${message}`);
    }
  };

  const getBranchDiff = async (worktreePath: string, baseRef: string): Promise<string> => {
    try {
      const { stdout: mergeBase } = await execAsync(`git merge-base ${baseRef} HEAD`, {
        cwd: worktreePath,
        timeout: 5000,
      });

      const result = await executeDiff(worktreePath, [mergeBase.trim()]);
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.diff;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get branch diff: ${message}`);
    }
  };

  return {
    parseDiff,
    parseDiffWithContent,
    isGitRepo,
    getUnstagedDiff,
    getStagedDiff,
    getAllDiff,
    getDiffByMode,
    getCurrentBranch,
    getBranchDiff,
  };
};

export type GitDiffService = ReturnType<typeof createGitDiffService>;
