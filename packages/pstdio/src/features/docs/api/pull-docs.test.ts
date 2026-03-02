import { afterEach, describe, expect, mock, test } from "bun:test";
import { pullDocs } from "./pull-docs";

const originalFetch = globalThis.fetch;

const mockFetch = (status: number, body: unknown) => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  ) as unknown as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("pullDocs", () => {
  test("returns file list from the API", async () => {
    mockFetch(200, {
      files: [
        { path: "docs.json", content: "{}" },
        { path: "index.md", content: "# Hello" },
      ],
    });

    const result = await pullDocs("http://test:3000", "proj-1");

    expect(result.files).toHaveLength(2);
    expect(result.files[0].path).toBe("docs.json");
  });

  test("throws when no docs exist", async () => {
    mockFetch(404, { error: "Not found" });

    expect(pullDocs("http://test:3000", "proj-1")).rejects.toThrow();
  });
});
