import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb, createProjectsService } from "pstdio-db";
import { createApp } from "../../../app";

let testRoot: string;

afterAll(() => {
  if (testRoot) rmSync(testRoot, { recursive: true, force: true });
});

describe("POST /v1/projects/:id/docs", () => {
  test("full save and pull round-trip", async () => {
    testRoot = mkdtempSync(join(tmpdir(), "pstdio-api-docs-test-"));
    const dbPath = join(testRoot, "test.db");
    const { db } = await createDb({ path: dbPath });
    const projects = createProjectsService(db);
    const project = await projects.create({ name: "Docs Test" });

    const app = await createApp({
      dbPath,
      storagePath: join(testRoot, "storage"),
    });

    const getRes = await app.request(`/v1/projects/${project.id}`);
    expect(getRes.status).toBe(200);

    const projectBody = await getRes.json();
    expect(projectBody.name).toBe("Docs Test");

    const saveRes = await app.request(`/v1/projects/${project.id}/docs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        files: [
          { path: "docs.json", content: JSON.stringify({ sidebar: [{ text: "Home", link: "/index" }] }) },
          { path: "index.md", content: "# Welcome\n\nHello world." },
        ],
      }),
    });

    expect(saveRes.status).toBe(200);

    const saveBody = await saveRes.json();
    expect(saveBody.updatedCount).toBe(2);
    expect(saveBody.removedCount).toBe(0);

    const pullRes = await app.request(`/v1/projects/${project.id}/docs`);
    expect(pullRes.status).toBe(200);

    const pullBody = await pullRes.json();
    expect(pullBody.files).toHaveLength(2);

    const paths = pullBody.files.map((f: { path: string }) => f.path).sort();
    expect(paths).toEqual(["docs.json", "index.md"]);

    const indexFile = pullBody.files.find((f: { path: string }) => f.path === "index.md");
    expect(indexFile.content).toContain("Hello world");
  });
});
