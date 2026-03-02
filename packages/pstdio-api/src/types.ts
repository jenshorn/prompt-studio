import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";

export type AppBindings = {
  Variables: {
    requestId?: string;
  };
};

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
