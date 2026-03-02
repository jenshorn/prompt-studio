import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb, createProjectsService } from "pstdio-db";
import { createDocsService } from "./docs";
import { createFilesService } from "./files";

const createFixture = async () => {
  const root = mkdtempSync(join(tmpdir(), "pstdio-docs-service-"));
  const dbPath = join(root, "pstdio.db");
  const storagePath = join(root, "storage");
  const docsRoot = join(root, ".pstdio", "docs");
  mkdirSync(docsRoot, { recursive: true });

  const { db } = await createDb({ path: dbPath });
  const projects = createProjectsService(db);
  const files = createFilesService(db, storagePath);
  const docs = createDocsService(db, files);

  const project = await projects.create({ name: "docs-project" });

  return { root, docsRoot, docs, project };
};

test("docs.save persists snapshot and docs.pull restores it", async () => {
  const fixture = await createFixture();

  try {
    mkdirSync(join(fixture.docsRoot, "guide"), { recursive: true });
    writeFileSync(
      join(fixture.docsRoot, "docs.json"),
      JSON.stringify(
        {
          sidebar: [{ text: "Guide", items: [{ text: "Getting Started", link: "/guide/getting-started" }] }],
        },
        null,
        2,
      ),
      "utf8",
    );
    writeFileSync(join(fixture.docsRoot, "guide", "getting-started.md"), "# Getting Started\n", "utf8");
    mkdirSync(join(fixture.docsRoot, "images"), { recursive: true });
    writeFileSync(join(fixture.docsRoot, "images", "logo.png"), Buffer.from("png"));

    const saveSummary = await fixture.docs.save(fixture.project.id, fixture.docsRoot);
    expect(saveSummary).toEqual({ updatedCount: 3, removedCount: 0 });

    rmSync(fixture.docsRoot, { recursive: true, force: true });
    mkdirSync(fixture.docsRoot, { recursive: true });
    writeFileSync(join(fixture.docsRoot, "stale.md"), "# stale\n", "utf8");

    const pullSummary = await fixture.docs.pull(fixture.project.id, fixture.docsRoot);
    expect(pullSummary).toEqual({ updatedCount: 3, removedCount: 1 });
    expect(readFileSync(join(fixture.docsRoot, "guide", "getting-started.md"), "utf8")).toContain("Getting Started");
    expect(existsSync(join(fixture.docsRoot, "stale.md"))).toBe(false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("docs.save rejects invalid config and path traversal links", async () => {
  const fixture = await createFixture();

  try {
    writeFileSync(join(fixture.docsRoot, "docs.json"), "{invalid", "utf8");
    writeFileSync(join(fixture.docsRoot, "index.md"), "# Home\n", "utf8");

    expect(fixture.docs.save(fixture.project.id, fixture.docsRoot)).rejects.toThrow(
      "Unable to parse .pstdio/docs/docs.json",
    );

    writeFileSync(
      join(fixture.docsRoot, "docs.json"),
      JSON.stringify({ sidebar: [{ text: "Escape", link: "../../secret" }] }, null, 2),
      "utf8",
    );

    expect(fixture.docs.save(fixture.project.id, fixture.docsRoot)).rejects.toThrow("outside .pstdio/docs");
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("docs.getIndex and getDocument read from persisted remote snapshot", async () => {
  const fixture = await createFixture();

  try {
    writeFileSync(
      join(fixture.docsRoot, "docs.json"),
      JSON.stringify({ sidebar: [{ text: "Overview", link: "/index" }] }, null, 2),
      "utf8",
    );
    writeFileSync(join(fixture.docsRoot, "index.md"), "# Overview\n\nRemote\n", "utf8");

    await fixture.docs.save(fixture.project.id, fixture.docsRoot);

    const index = await fixture.docs.getIndex(fixture.project.id);
    expect(index.sidebar).toEqual([{ text: "Overview", link: "/index", items: undefined }]);

    const content = await fixture.docs.getDocument(fixture.project.id, "/index");
    expect(content.path).toBe("index.md");
    expect(content.content).toContain("Remote");
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
