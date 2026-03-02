import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createAndInitProject } from "./create-and-init";

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

describe("createAndInitProject", () => {
  test("creates project via API, writes config, scaffolds docs", async () => {
    mockFetch(201, { id: "proj-1", name: "Test" });
    const root = setup("create-init");

    const project = await createAndInitProject(root, "Test");

    expect(project).toEqual({ id: "proj-1", name: "Test" });

    const config = JSON.parse(readFileSync(join(root, ".pstdio", "config.json"), "utf8"));
    expect(config.project_id).toBe("proj-1");

    expect(existsSync(join(root, ".pstdio", "docs", "docs.json"))).toBe(true);
    expect(existsSync(join(root, ".pstdio", "docs", "index.md"))).toBe(true);
  });
});
