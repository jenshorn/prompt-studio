import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ExtensionDiagnostic } from "../types/runtime";
import { loadExtensionPackage } from "./loader";

const tempDirs: string[] = [];
let previousPstdioHome: string | undefined;

const createTempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "pstdio-loader-node-modules-"));
  tempDirs.push(dir);
  return dir;
};

const isolateRuntimeCache = () => {
  previousPstdioHome = process.env.PSTDIO_HOME;
  process.env.PSTDIO_HOME = join(createTempDir(), "pstdio-home");
};

const writePackage = (dir: string) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: "loader-test",
        version: "1.0.0",
        publisher: "pstdio",
        main: "./extension.ts",
        engines: { pstdio: "^1.0.0" },
      },
      null,
      2,
    ),
  );
};

afterEach(() => {
  if (previousPstdioHome === undefined) delete process.env.PSTDIO_HOME;
  else process.env.PSTDIO_HOME = previousPstdioHome;

  previousPstdioHome = undefined;
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs.length = 0;
});

test("mirrors workspace linked node_modules entries as directories", async () => {
  isolateRuntimeCache();
  const repoDir = createTempDir();
  const extensionDir = join(repoDir, "extensions", "loader-test");
  const dependencyDir = join(repoDir, "packages", "e2e");
  const dependencyImport = JSON.stringify("e2e");
  writePackage(extensionDir);
  mkdirSync(dependencyDir, { recursive: true });
  writeFileSync(
    join(dependencyDir, "package.json"),
    JSON.stringify({ name: "e2e", version: "1.0.0", type: "module", exports: "./index.ts" }),
  );
  writeFileSync(join(dependencyDir, "index.ts"), `export const marker = "workspace-dependency";\n`);
  writeFileSync(
    join(extensionDir, "extension.ts"),
    `import { marker } from ${dependencyImport};

export default {
  commands: {
    check: {
      title: marker,
      run: async () => ({ marker }),
    },
  },
};
`,
  );

  const linkedDependency = join(repoDir, "node_modules", "e2e");
  mkdirSync(dirname(linkedDependency), { recursive: true });
  symlinkSync(dependencyDir, linkedDependency, process.platform === "win32" ? "junction" : "dir");

  const diagnostics: ExtensionDiagnostic[] = [];
  const loaded = await loadExtensionPackage({ path: extensionDir }, diagnostics);
  const commands = loaded?.definition.commands as Record<string, { title: string }> | undefined;

  expect(diagnostics).toEqual([]);
  expect(commands?.check.title).toBe("workspace-dependency");
});
