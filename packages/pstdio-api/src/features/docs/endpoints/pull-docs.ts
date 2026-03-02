import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { createRoute, z } from "@hono/zod-openapi";
import type { AppRouteHandler } from "../../../types";
import type { RouteDeps } from "../../deps";
import { docsErrorResponseSchema, pullDocsResponseSchema } from "../dto";

const listFilesRecursive = (rootDir: string, currentDir = rootDir): string[] => {
  if (!existsSync(currentDir)) return [];

  const entries = readdirSync(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(rootDir, fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(relative(rootDir, fullPath));
    }
  }

  return files.sort();
};

export const pullDocsRoute = createRoute({
  method: "get",
  path: "/projects/{id}/docs",
  description: "Pull project documentation files.",
  tags: ["Docs"],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Project ID" }),
    }),
  },
  responses: {
    200: {
      description: "Docs retrieved successfully.",
      content: { "application/json": { schema: pullDocsResponseSchema } },
    },
    404: {
      description: "No docs found for this project.",
      content: { "application/json": { schema: docsErrorResponseSchema } },
    },
  },
});

export const pullDocsHandler = (deps: RouteDeps): AppRouteHandler<typeof pullDocsRoute> => {
  return async (c) => {
    const { id } = c.req.valid("param");

    const tempDir = mkdtempSync(join(tmpdir(), "pstdio-docs-pull-"));

    try {
      await deps.docsService.pull(id, tempDir);

      const relativePaths = listFilesRecursive(tempDir);
      const files = relativePaths.map((path) => ({
        path,
        content: readFileSync(join(tempDir, path), "utf8"),
      }));

      return c.json({ files }, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to pull docs";
      return c.json({ error: message }, 404);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  };
};
