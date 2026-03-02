import { describe, expect, it } from "bun:test";

describe("pstdio-db public exports", () => {
  it("loads the package entrypoint", async () => {
    const module = await import("./index");

    expect(module.createDb).toBeDefined();
    expect(module.resolveDbPath).toBeDefined();
    expect(module.projects).toBeDefined();
    expect(module.ticketSelectSchema).toBeDefined();
    expect(module.ticketApiSchema).toBeDefined();
    expect(module.createTicketBodySchema).toBeDefined();
  });
});
