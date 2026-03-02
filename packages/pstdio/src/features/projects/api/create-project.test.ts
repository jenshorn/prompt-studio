import { afterEach, describe, expect, mock, test } from "bun:test";
import { createProject } from "./create-project";

const originalFetch = globalThis.fetch;

const mockFetch = (status: number, body: unknown) => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  ) as unknown as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createProject", () => {
  test("returns created project on 201", async () => {
    mockFetch(201, { id: "new-id", name: "My Project" });

    const result = await createProject("http://test:3000", "My Project");

    expect(result).toEqual({ id: "new-id", name: "My Project" });
  });

  test("throws on non-ok response", async () => {
    mockFetch(500, { error: "Internal" });

    expect(createProject("http://test:3000", "fail")).rejects.toThrow("Failed to create project: 500");
  });
});
