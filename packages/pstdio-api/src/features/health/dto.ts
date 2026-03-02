import { z } from "@hono/zod-openapi";

export const healthResponseSchema = z.object({
  ok: z.literal(true),
});

export const readyResponseSchema = z.object({
  checks: z.object({
    database: z.boolean(),
    storage: z.boolean(),
  }),
  ok: z.boolean(),
});
