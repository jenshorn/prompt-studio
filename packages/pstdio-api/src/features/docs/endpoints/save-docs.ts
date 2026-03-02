import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRoute, z } from "@hono/zod-openapi";
import type { AppRouteHandler } from "../../../types";
import type { RouteDeps } from "../../deps";
import { docsErrorResponseSchema, saveDocsBodySchema, saveDocsResponseSchema } from "../dto";

export const saveDocsRoute = createRoute({
  method: "post",
  path: "/projects/{id}/docs",
  description: "Save project documentation files.",
  tags: ["Docs"],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Project ID" }),
    }),
    body: {
      content: { "application/json": { schema: saveDocsBodySchema } },
    },
  },
  responses: {
    200: {
      description: "Docs saved successfully.",
      content: { "application/json": { schema: saveDocsResponseSchema } },
    },
    400: {
      description: "Invalid docs structure.",
      content: { "application/json": { schema: docsErrorResponseSchema } },
    },
  },
});

export const saveDocsHandler = (deps: RouteDeps): AppRouteHandler<typeof saveDocsRoute> => {
  return async (c) => {
    const { id } = c.req.valid("param");
    const { files } = c.req.valid("json");

    const tempDir = mkdtempSync(join(tmpdir(), "pstdio-docs-save-"));

    try {
      for (const file of files) {
        const filePath = join(tempDir, file.path);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, file.content, "utf8");
      }

      const result = await deps.docsService.save(id, tempDir);

      return c.json(result, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save docs";
      return c.json({ error: message }, 400);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  };
};
