import { expect, test } from "bun:test";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectRuntimeModulePaths, mirrorRuntimeSourceSnapshot } from "./runtime-source-snapshot";

test("snapshots the runtime import graph and symlinks unrelated artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "pstdio-runtime-source-snapshot-test-"));
  const packagePath = join(root, "extension");
  const targetPath = join(root, "runtime");
  const entryPath = join(packagePath, "extension.ts");
  mkdirSync(join(packagePath, "dist"), { recursive: true });
  mkdirSync(join(packagePath, "src"), { recursive: true });
  writeFileSync(join(packagePath, "package.json"), JSON.stringify({ name: "test-extension" }));
  writeFileSync(join(packagePath, "dist", "unrelated.js"), "export const unrelated = true;");
  writeFileSync(join(packagePath, "src", "contributions.ts"), `export const title = "Imported";`);
  writeFileSync(join(packagePath, "CHANGELOG.md"), "# Changelog\n");
  writeFileSync(entryPath, `import { title } from "./src/contributions"; export default { title };`);

  try {
    const modulePaths = collectRuntimeModulePaths(packagePath, entryPath);
    mirrorRuntimeSourceSnapshot(packagePath, targetPath, modulePaths);

    expect(lstatSync(join(targetPath, "extension.ts")).isSymbolicLink()).toBe(false);
    expect(lstatSync(join(targetPath, "src", "contributions.ts")).isSymbolicLink()).toBe(false);
    expect(lstatSync(join(targetPath, "dist")).isSymbolicLink()).toBe(true);

    // Windows can't symlink files without elevated privileges, so unrelated
    // files are copied there instead. Elsewhere they stay symlinks.
    const changelog = lstatSync(join(targetPath, "CHANGELOG.md"));
    expect(changelog.isSymbolicLink()).toBe(process.platform !== "win32");
    expect(readFileSync(join(targetPath, "CHANGELOG.md"), "utf8")).toBe("# Changelog\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
