import { describe, expect, test } from "bun:test";
import { createOpencodeAgent } from "./opencode-agent";

// --- Helper ---

const agent = (opts: { available?: boolean; modelsOutput?: string } = {}) =>
  createOpencodeAgent(
    {
      isCommandAvailable: () => opts.available ?? true,
      getModelsOutput: () => opts.modelsOutput ?? "",
    },
    {
      startServer: async () => "http://localhost:4096",
      serverStore: { read: async () => null, write: async () => {}, clear: async () => {} },
      pingServer: async () => false,
      isPortOpen: async () => false,
      fetcher: async () => new Response("{}"),
    },
  );

// --- Factory ---

describe("createOpencodeAgent", () => {
  test("returns an agent with id and name", () => {
    const a = agent();

    expect(a.id).toBe("opencode");
    expect(a.name).toBe("OpenCode");
  });

  test("reports capabilities", () => {
    const a = agent();

    expect(a.capabilities()).toEqual(["SessionFork", "ContextUsage"]);
  });
});

// --- Availability ---

describe("checkAvailability", () => {
  test("returns INSTALLED when command is available", () => {
    const a = agent({ available: true });

    expect(a.checkAvailability()).toEqual({ type: "INSTALLED" });
  });

  test("returns NOT_FOUND when command is unavailable", () => {
    const a = agent({ available: false });

    expect(a.checkAvailability()).toEqual({ type: "NOT_FOUND" });
  });
});

// --- Model listing ---

describe("listModels", () => {
  test("returns empty when not available", () => {
    const a = agent({ available: false, modelsOutput: "openai/gpt-4" });

    expect(a.listModels()).toEqual([]);
  });

  test("returns empty for empty output", () => {
    const a = agent({ modelsOutput: "" });

    expect(a.listModels()).toEqual([]);
  });

  test("parses JSON array of strings", () => {
    const a = agent({ modelsOutput: JSON.stringify(["openai/gpt-4", "anthropic/claude-3"]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]);
  });

  test("parses JSON array of objects with id", () => {
    const a = agent({ modelsOutput: JSON.stringify([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]);
  });

  test("parses JSON array of objects with model field", () => {
    const a = agent({ modelsOutput: JSON.stringify([{ model: "openai/gpt-4" }]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }]);
  });

  test("parses JSON array of objects with name field", () => {
    const a = agent({ modelsOutput: JSON.stringify([{ name: "openai/gpt-4" }]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }]);
  });

  test("parses JSON object with models array", () => {
    const a = agent({ modelsOutput: JSON.stringify({ models: ["openai/gpt-4"] }) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }]);
  });

  test("filters entries without slash", () => {
    const a = agent({ modelsOutput: JSON.stringify(["gpt-4", "openai/gpt-4"]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }]);
  });

  test("deduplicates model ids", () => {
    const a = agent({ modelsOutput: JSON.stringify(["openai/gpt-4", "openai/gpt-4"]) });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }]);
  });

  test("falls back to line-based parsing for non-JSON", () => {
    const a = agent({ modelsOutput: "openai/gpt-4\nanthropic/claude-3\n" });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]);
  });

  test("extracts first token from lines with spaces", () => {
    const a = agent({ modelsOutput: "openai/gpt-4  (default)\nanthropic/claude-3  (fast)\n" });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]);
  });

  test("skips lines without slash in line-based parsing", () => {
    const a = agent({ modelsOutput: "Models:\nopenai/gpt-4\n---\nanthropic/claude-3\n" });

    expect(a.listModels()).toEqual([{ id: "openai/gpt-4" }, { id: "anthropic/claude-3" }]);
  });
});

// --- getMessages ---

describe("getMessages", () => {
  test("normalizes messages from service", async () => {
    const mockMessages = [
      { role: "user", content: [{ type: "text", text: "hello" }] },
      { role: "assistant", content: [{ type: "text", text: "hi there" }] },
    ];

    const a = createOpencodeAgent(
      { isCommandAvailable: () => true, getModelsOutput: () => "" },
      {
        startServer: async () => "http://localhost:4096",
        serverStore: { read: async () => null, write: async () => {}, clear: async () => {} },
        pingServer: async () => true,
        isPortOpen: async () => true,
        fetcher: async () => new Response(JSON.stringify(mockMessages)),
      },
    );

    const messages = await a.getMessages("session-1");

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("user");
    expect(messages[0].parts[0]).toMatchObject({ type: "text", text: "hello" });
    expect(messages[1].role).toBe("assistant");
    expect(messages[1].parts[0]).toMatchObject({ type: "text", text: "hi there" });
  });
});
