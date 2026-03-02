import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "../../types";
import type { RouteDeps } from "../deps";
import { pullDocsHandler, pullDocsRoute } from "./endpoints/pull-docs";
import { saveDocsHandler, saveDocsRoute } from "./endpoints/save-docs";

export const createDocsRoutes = (deps: RouteDeps) => {
  const routes = new OpenAPIHono<AppBindings>();

  routes.openapi(saveDocsRoute, saveDocsHandler(deps));
  routes.openapi(pullDocsRoute, pullDocsHandler(deps));

  return routes;
};
