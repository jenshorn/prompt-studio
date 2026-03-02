import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "hono";

export const swagger = <T extends Env>(app: OpenAPIHono<T>, basePath = "/") => {
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    servers: [
      {
        description: "Demo API",
        url: basePath,
      },
    ],
    info: {
      version: "1.0.0",
      title: "Demo API Service",
    },
    security: [
      {
        Bearer: [],
      },
    ],
  });

  app.get(
    "/docs",
    swaggerUI({
      url: "/openapi.json",
      title: "Demo API Docs",
    }),
  );
};
