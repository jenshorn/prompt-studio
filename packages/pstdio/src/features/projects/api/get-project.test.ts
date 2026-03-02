import { afterEach, describe, expect, mock, test } from "bun:test";
import { getProject } from "./get-project";

const originalFetch = globalThis.fetch;

const mockFetch = (status: number, body: unknown) => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  ) as unknown as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getProject", () => {
  test("returns project when found", async () => {
    mockFetch(200, { id: "abc", name: "My Project" });

    const result = await getProject("http://test:3000", "abc");

    expect(result).toEqual({ id: "abc", name: "My Project" });
  });

  test("returns null when not found", async () => {
    mockFetch(404, { error: "Not found" });

    const result = await getProject("http://test:3000", "missing");

    expect(result).toBeNull();
  });
});
