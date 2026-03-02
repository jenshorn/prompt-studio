import { afterEach, describe, expect, mock, test } from "bun:test";
import { saveDocs } from "./save-docs";

const originalFetch = globalThis.fetch;

const mockFetch = (status: number, body: unknown) => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  ) as unknown as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("saveDocs", () => {
  test("posts files to the API", async () => {
    mockFetch(200, { updatedCount: 2, removedCount: 0 });

    const result = await saveDocs("http://test:3000", "proj-1", [
      { path: "docs.json", content: "{}" },
      { path: "index.md", content: "# Hello" },
    ]);

    expect(result).toEqual({ updatedCount: 2, removedCount: 0 });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
