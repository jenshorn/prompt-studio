import { describe, expect, it } from "bun:test";

import {
  projects,
  sessions,
  ticket_statuses,
  tickets,
  ydocAwareness,
  ydocResumeState,
  ydocUpdates,
} from "./schemas.pg";

describe("schemas.pg", () => {
  it("uses postgres text columns", () => {
    expect(projects.id.constructor.name).toBe("PgText");
  });

  it("uses postgres boolean columns for flags", () => {
    expect(ticket_statuses.is_default.constructor.name).toBe("PgBoolean");
    expect(tickets.archived.constructor.name).toBe("PgBoolean");
  });

  it("uses postgres jsonb for JSON content", () => {
    expect(sessions.content.constructor.name).toBe("PgJsonb");
  });

  it("uses postgres bytea for ydoc operations", () => {
    expect(ydocUpdates.op.constructor.name).toBe("PgCustomColumn");
    expect(ydocAwareness.op.constructor.name).toBe("PgCustomColumn");
  });

  it("uses postgres text columns in ydoc resume state keys", () => {
    expect(ydocResumeState.projectId.constructor.name).toBe("PgText");
    expect(ydocResumeState.room.constructor.name).toBe("PgText");
  });
});
