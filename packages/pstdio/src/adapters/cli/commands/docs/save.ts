import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { API_URL } from "@/features/api-url";
import { findGitRoot, readConfig } from "@/features/config/config";
import { saveDocs } from "@/features/docs/api/save-docs";

const listDocsFiles = (docsDir: string, currentDir = docsDir): string[] => {
  if (!existsSync(currentDir)) {
    return [];
  }

  const entries = readdirSync(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listDocsFiles(docsDir, fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(relative(docsDir, fullPath));
    }
  }

  return files.sort();
};

export const command = "save";
export const describe = "Save local docs to persisted storage";

export const handler = async () => {
  const root = findGitRoot(process.cwd());
  if (!root) {
    throw new Error("Not inside a git repository.");
  }

  const config = readConfig(root);
  if (!config) {
    throw new Error("No .pstdio/config.json found. Run `pstdio projects create` or `pstdio projects link` first.");
  }

  const docsDir = join(root, ".pstdio", "docs");
  if (!existsSync(docsDir)) {
    throw new Error("No .pstdio/docs directory found. Run `pstdio projects create` or `pstdio projects link` first.");
  }

  const relativePaths = listDocsFiles(docsDir);
  const files = relativePaths.map((path) => ({
    path,
    content: readFileSync(join(docsDir, path), "utf8"),
  }));

  const result = await saveDocs(API_URL, config.project_id, files);

  console.log(`Saved ${result.updatedCount} file(s), removed ${result.removedCount} stale file(s).`);
};
