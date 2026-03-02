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

describe("GET /v1/projects/:id/docs", () => {
  test("returns 404 when no docs saved", async () => {
    testRoot = mkdtempSync(join(tmpdir(), "pstdio-api-pull-test-"));
    const dbPath = join(testRoot, "test.db");
    const { db } = await createDb({ path: dbPath });
    const projects = createProjectsService(db);
    const project = await projects.create({ name: "Empty Project" });

    const app = await createApp({
      dbPath,
      storagePath: join(testRoot, "storage"),
    });

    const res = await app.request(`/v1/projects/${project.id}/docs`);
    expect(res.status).toBe(404);
  });
});
