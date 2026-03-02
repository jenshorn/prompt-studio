import type { createProjectsService } from "pstdio-db";
import type { createDocsService } from "pstdio-storage";

export interface ReadinessChecks {
  database: boolean;
  storage: boolean;
}

export interface RouteDeps {
  readiness: ReadinessChecks;
  projectsService: ReturnType<typeof createProjectsService>;
  docsService: ReturnType<typeof createDocsService>;
}
