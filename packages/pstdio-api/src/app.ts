import { OpenAPIHono } from "@hono/zod-openapi";
import { createDb, createProjectsService } from "pstdio-db";
import { createDocsService, createFilesService, ensureStorageRoot, resolveStorageRoot } from "pstdio-storage";
import { createDocsRoutes } from "./features/docs/routes";
import { createHealthRoutes } from "./features/health/routes";
import { createProjectRoutes } from "./features/projects/routes";
import { swagger } from "./swagger";
import type { AppBindings } from "./types";

interface AppOptions {
  dbPath?: string;
  storagePath?: string;
}

export const createApp = async (options?: AppOptions) => {
  const { db } = await createDb({ path: options?.dbPath ?? process.env.DB_PATH });

  const storageRoot = options?.storagePath ?? resolveStorageRoot();
  ensureStorageRoot(storageRoot);

  const projectsService = createProjectsService(db);
  const filesService = createFilesService(db, storageRoot);
  const docsService = createDocsService(db, filesService);

  const deps = {
    readiness: { database: true, storage: true },
    projectsService,
    docsService,
  };

  const app = new OpenAPIHono<AppBindings>();

  app.route("/", createHealthRoutes(deps));
  app.route("/v1", createProjectRoutes(deps));
  app.route("/v1", createDocsRoutes(deps));

  swagger(app);

  return app;
};
