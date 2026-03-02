import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scaffoldDocs } from "./scaffold";

const tmpBase = join(import.meta.dirname, "__test-tmp__");

const setup = (name: string) => {
  const dir = join(tmpBase, name);
  mkdirSync(dir, { recursive: true });
  return dir;
};

beforeEach(() => {
  mkdirSync(tmpBase, { recursive: true });
});

afterEach(() => {
  rmSync(tmpBase, { recursive: true, force: true });
});

describe("scaffoldDocs", () => {
  test("creates docs.json and index.md", () => {
    const root = setup("scaffold-docs");

    scaffoldDocs(root);

    const docsDir = join(root, ".pstdio", "docs");
    expect(existsSync(join(docsDir, "docs.json"))).toBe(true);
    expect(existsSync(join(docsDir, "index.md"))).toBe(true);
  });

  test("docs.json contains valid sidebar structure", () => {
    const root = setup("scaffold-docs-json");

    scaffoldDocs(root);

    const raw = JSON.parse(readFileSync(join(root, ".pstdio", "docs", "docs.json"), "utf8"));
    expect(raw.sidebar).toBeArray();
    expect(raw.sidebar[0].text).toBeDefined();
    expect(raw.sidebar[0].link).toBeDefined();
  });

  test("does not overwrite existing docs", () => {
    const root = setup("scaffold-no-overwrite");
    const docsDir = join(root, ".pstdio", "docs");
    mkdirSync(docsDir, { recursive: true });
    writeFileSync(join(docsDir, "docs.json"), "existing");

    scaffoldDocs(root);

    const raw = readFileSync(join(docsDir, "docs.json"), "utf8");
    expect(raw).toBe("existing");
  });
});
