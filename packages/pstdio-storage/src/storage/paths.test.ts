import { expect, test } from "bun:test";
import { resolveStorageRoot } from "./paths";

test("resolveStorageRoot requires an explicit storage path", () => {
  expect(() => resolveStorageRoot()).toThrow("Storage path is required. Set PSTDIO_STORAGE_PATH or pass storagePath.");
});
