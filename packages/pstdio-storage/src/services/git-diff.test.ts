import { describe, expect, test } from "bun:test";
import { createGitDiffService } from "./git-diff";

describe("createGitDiffService", () => {
  const gitDiff = createGitDiffService();

  describe("parseDiff", () => {
    test("parses simple unified diff with additions and deletions", () => {
      const diff = `diff --git a/file.ts b/file.ts
index 1234567..abcdefg 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,3 @@
 const unchanged = 1;
-const old = 2;
+const new = 2;
 const alsoUnchanged = 3;`;

      const result = gitDiff.parseDiff(diff);

      expect(result).toEqual([
        {
          filePath: "file.ts",
          additions: 1,
          deletions: 1,
        },
      ]);
    });

    test("parses multiple files", () => {
      const diff = `diff --git a/file1.ts b/file1.ts
index 1234567..abcdefg 100644
--- a/file1.ts
+++ b/file1.ts
@@ -1,2 +1,3 @@
 line1
+line2
 line3
diff --git a/file2.ts b/file2.ts
index 7654321..gfedcba 100644
--- a/file2.ts
+++ b/file2.ts
@@ -1,3 +1,2 @@
 line1
-line2
 line3`;

      const result = gitDiff.parseDiff(diff);

      expect(result).toEqual([
        { filePath: "file1.ts", additions: 1, deletions: 0 },
        { filePath: "file2.ts", additions: 0, deletions: 1 },
      ]);
    });

    test("handles new files", () => {
      const diff = `diff --git a/new-file.ts b/new-file.ts
new file mode 100644
index 0000000..abcdefg
--- /dev/null
+++ b/new-file.ts
@@ -0,0 +1,2 @@
+export const foo = 1;
+export const bar = 2;`;

      const result = gitDiff.parseDiff(diff);

      expect(result).toEqual([{ filePath: "new-file.ts", additions: 2, deletions: 0 }]);
    });

    test("handles deleted files", () => {
      const diff = `diff --git a/deleted.ts b/deleted.ts
deleted file mode 100644
index abcdefg..0000000
--- a/deleted.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-export const foo = 1;
-export const bar = 2;`;

      const result = gitDiff.parseDiff(diff);

      expect(result).toEqual([{ filePath: "deleted.ts", additions: 0, deletions: 2 }]);
    });

    test("handles files with a/ and b/ prefixes", () => {
      const diff = `diff --git a/src/file.ts b/src/file.ts
index 1234567..abcdefg 100644
--- a/src/file.ts
+++ b/src/file.ts
@@ -1,1 +1,1 @@
-old
+new`;

      const result = gitDiff.parseDiff(diff);

      expect(result).toEqual([{ filePath: "src/file.ts", additions: 1, deletions: 1 }]);
    });

    test("returns empty array for empty diff", () => {
      const result = gitDiff.parseDiff("");
      expect(result).toEqual([]);
    });

    test("returns empty array for invalid diff", () => {
      const result = gitDiff.parseDiff("not a diff");
      expect(result).toEqual([]);
    });
  });

  describe("parseDiffWithContent", () => {
    test("parses added file with content", () => {
      const diff = `diff --git a/new-file.ts b/new-file.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/new-file.ts
@@ -0,0 +1,3 @@
+export const foo = () => {
+  console.log("hello");
+};`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "new-file.ts",
        change: "added",
        additions: 3,
        deletions: 0,
        oldContent: "",
      });
      expect(result[0].newContent).toContain("export const foo");
      expect(result[0].newContent).toContain('console.log("hello")');
    });

    test("parses deleted file with content", () => {
      const diff = `diff --git a/deleted.ts b/deleted.ts
deleted file mode 100644
index abcdefg..0000000
--- a/deleted.ts
+++ /dev/null
@@ -1,3 +0,0 @@
-export const bar = () => {
-  return "goodbye";
-};`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "deleted.ts",
        change: "deleted",
        additions: 0,
        deletions: 3,
        newContent: "",
      });
      expect(result[0].oldContent).toContain("export const bar");
      expect(result[0].oldContent).toContain('return "goodbye"');
    });

    test("parses modified file with old and new content", () => {
      const diff = `diff --git a/existing.ts b/existing.ts
index 1234567..abcdefg 100644
--- a/existing.ts
+++ b/existing.ts
@@ -1,5 +1,5 @@
 export const test = () => {
-  const old = "value";
+  const new = "value";
   return old;
 };`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "existing.ts",
        change: "modified",
        additions: 1,
        deletions: 1,
      });
      expect(result[0].oldContent).toContain('const old = "value"');
      expect(result[0].newContent).toContain('const new = "value"');
    });

    test("parses renamed file", () => {
      const diff = `diff --git a/old-name.ts b/new-name.ts
similarity index 100%
rename from old-name.ts
rename to new-name.ts`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "new-name.ts",
        change: "renamed",
        oldPath: "old-name.ts",
        newPath: "new-name.ts",
        additions: 0,
        deletions: 0,
      });
    });

    test("parses renamed file with modifications", () => {
      const diff = `diff --git a/old.ts b/new.ts
similarity index 85%
rename from old.ts
rename to new.ts
index 1234567..abcdefg 100644
--- a/old.ts
+++ b/new.ts
@@ -1,3 +1,4 @@
 export const fn = () => {
+  console.log("added");
   return true;
 };`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "new.ts",
        change: "renamed",
        oldPath: "old.ts",
        newPath: "new.ts",
        additions: 1,
        deletions: 0,
      });
      expect(result[0].newContent).toContain('console.log("added")');
    });

    test("parses multiple files with content", () => {
      const diff = `diff --git a/file1.ts b/file1.ts
index 1234567..abcdefg 100644
--- a/file1.ts
+++ b/file1.ts
@@ -1,2 +1,3 @@
 const line1 = 1;
+const line2 = 2;
 const line3 = 3;
diff --git a/file2.ts b/file2.ts
index 7654321..gfedcba 100644
--- a/file2.ts
+++ b/file2.ts
@@ -1,3 +1,2 @@
 const a = 1;
-const b = 2;
 const c = 3;`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(2);
      expect(result[0].filePath).toBe("file1.ts");
      expect(result[0].change).toBe("modified");
      expect(result[0].newContent).toContain("const line2 = 2");
      expect(result[1].filePath).toBe("file2.ts");
      expect(result[1].change).toBe("modified");
      expect(result[1].oldContent).toContain("const b = 2");
    });

    test("handles empty diff", () => {
      const result = gitDiff.parseDiffWithContent("");
      expect(result).toEqual([]);
    });

    test("handles binary files", () => {
      const diff = `diff --git a/image.png b/image.png
index 1234567..abcdefg 100644
Binary files a/image.png and b/image.png differ`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "image.png",
        change: "modified",
        additions: 0,
        deletions: 0,
        oldContent: "",
        newContent: "",
      });
    });

    test("handles permission changes", () => {
      const diff = `diff --git a/script.sh b/script.sh
old mode 100644
new mode 100755`;

      const result = gitDiff.parseDiffWithContent(diff);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filePath: "script.sh",
        change: "permissionChange",
        additions: 0,
        deletions: 0,
      });
    });
  });

  describe("isGitRepo", () => {
    test("returns true for valid git repository", async () => {
      const repoPath = process.cwd();
      const result = await gitDiff.isGitRepo(repoPath);
      expect(result).toBe(true);
    });

    test("returns false for non-git directory", async () => {
      const result = await gitDiff.isGitRepo("/tmp");
      expect(result).toBe(false);
    });

    test("returns false for non-existent directory", async () => {
      const result = await gitDiff.isGitRepo("/nonexistent/path");
      expect(result).toBe(false);
    });
  });

  describe("getCurrentBranch", () => {
    test("returns current branch name for a git repository", async () => {
      const repoPath = process.cwd();
      const branch = await gitDiff.getCurrentBranch(repoPath);
      expect(typeof branch).toBe("string");
      expect(branch.length).toBeGreaterThan(0);
    });

    test("throws for non-git directory", async () => {
      await expect(gitDiff.getCurrentBranch("/tmp")).rejects.toThrow("Failed to get current branch");
    });
  });

  describe("getBranchDiff", () => {
    test("returns diff between current state and base ref", async () => {
      const repoPath = process.cwd();
      const diff = await gitDiff.getBranchDiff(repoPath, "HEAD");
      expect(typeof diff).toBe("string");
    });

    test("throws for invalid base ref", async () => {
      const repoPath = process.cwd();
      await expect(gitDiff.getBranchDiff(repoPath, "nonexistent-branch-xyz")).rejects.toThrow(
        "Failed to get branch diff",
      );
    });
  });
});
