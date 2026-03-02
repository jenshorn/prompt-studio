import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DocsConfig } from "./types";

const DOCS_DIR = join(".pstdio", "docs");

const STARTER_DOCS_CONFIG: DocsConfig = {
  sidebar: [
    {
      text: "Getting Started",
      link: "/index",
    },
  ],
};

const STARTER_INDEX_MD = `# Getting Started

Welcome to your project documentation.
`;

export const scaffoldDocs = (root: string) => {
  const docsDir = join(root, DOCS_DIR);
  mkdirSync(docsDir, { recursive: true });

  const docsConfigPath = join(docsDir, "docs.json");
  if (!existsSync(docsConfigPath)) {
    writeFileSync(docsConfigPath, `${JSON.stringify(STARTER_DOCS_CONFIG, null, 2)}\n`);
  }

  const indexPath = join(docsDir, "index.md");
  if (!existsSync(indexPath)) {
    writeFileSync(indexPath, STARTER_INDEX_MD);
  }
};
