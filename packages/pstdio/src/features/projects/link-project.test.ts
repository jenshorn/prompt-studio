import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { linkProject } from "./link-project";

const tmpBase = join(import.meta.dirname, "__test-tmp__");

const originalFetch = globalThis.fetch;

const mockFetch = (status: number, body: unknown) => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  ) as unknown as typeof fetch;
};

const setup = (name: string) => {
  const dir = join(tmpBase, name);
  mkdirSync(dir, { recursive: true });
  return dir;
};

beforeEach(() => {
  mkdirSync(tmpBase, { recursive: true });
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  rmSync(tmpBase, { recursive: true, force: true });
});

describe("linkProject", () => {
  test("verifies project exists, writes config, scaffolds docs", async () => {
    mockFetch(200, { id: "abc", name: "Existing" });
    const root = setup("link");

    const project = await linkProject(root, "abc");

    expect(project).toEqual({ id: "abc", name: "Existing" });

    const config = JSON.parse(readFileSync(join(root, ".pstdio", "config.json"), "utf8"));
    expect(config.project_id).toBe("abc");

    expect(existsSync(join(root, ".pstdio", "docs", "docs.json"))).toBe(true);
    expect(existsSync(join(root, ".pstdio", "docs", "index.md"))).toBe(true);
  });

  test("throws when project not found", async () => {
    mockFetch(404, { error: "Not found" });
    const root = setup("link-404");

    expect(linkProject(root, "missing")).rejects.toThrow("Project not found: missing");
  });
});
