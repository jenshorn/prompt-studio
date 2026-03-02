import { z } from "@hono/zod-openapi";

const docFileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const saveDocsBodySchema = z.object({
  files: z.array(docFileSchema).min(1),
});

export const saveDocsResponseSchema = z.object({
  updatedCount: z.number(),
  removedCount: z.number(),
});

export const pullDocsResponseSchema = z.object({
  files: z.array(docFileSchema),
});

export const docsErrorResponseSchema = z.object({
  error: z.string(),
});
