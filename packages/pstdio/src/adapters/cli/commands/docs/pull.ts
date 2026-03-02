import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { API_URL } from "@/features/api-url";
import { findGitRoot, readConfig } from "@/features/config/config";
import { pullDocs } from "@/features/docs/api/pull-docs";

export const command = "pull";
export const describe = "Pull persisted docs to local .pstdio/docs";

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

  const result = await pullDocs(API_URL, config.project_id);

  if (existsSync(docsDir)) {
    rmSync(docsDir, { recursive: true });
  }

  mkdirSync(docsDir, { recursive: true });

  for (const file of result.files) {
    const filePath = join(docsDir, file.path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, file.content);
  }

  console.log(`Pulled ${result.files.length} file(s) to .pstdio/docs.`);
};
