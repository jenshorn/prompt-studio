import { createRoute } from "@hono/zod-openapi";
import type { AppRouteHandler } from "../../../types";
import type { RouteDeps } from "../../deps";
import { createProjectBodySchema, projectResponseSchema } from "../dto";

export const createProjectRoute = createRoute({
  method: "post",
  path: "/projects",
  description: "Create a new project.",
  tags: ["Projects"],
  request: {
    body: {
      content: { "application/json": { schema: createProjectBodySchema } },
    },
  },
  responses: {
    201: {
      description: "Project created.",
      content: { "application/json": { schema: projectResponseSchema } },
    },
  },
});

export const createProjectHandler = (deps: RouteDeps): AppRouteHandler<typeof createProjectRoute> => {
  return async (c) => {
    const { name } = c.req.valid("json");
    const project = await deps.projectsService.create({ name });
    return c.json(project, 201);
  };
};
