import { expect, test } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveDefaultDbPath, resolveDefaultStoragePath } from "./state-paths";

const DATA_DIR = join(homedir(), ".pstdio");

test("resolveDefaultDbPath returns path inside ~/.pstdio", () => {
  expect(resolveDefaultDbPath()).toBe(join(DATA_DIR, "pstdio.db"));
});

test("resolveDefaultStoragePath returns path inside ~/.pstdio", () => {
  expect(resolveDefaultStoragePath()).toBe(join(DATA_DIR, "storage"));
});
