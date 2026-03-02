import { expect, test } from "bun:test";
import type { AgentId, AgentService, AvailabilityInfo } from "../types";
import { createAgentRegistry } from "./registry";

const createTestAgent = (id: AgentId, availability: AvailabilityInfo): AgentService => ({
  id,
  name: `${id} agent`,
  capabilities: () => [],
  startSession: async () => ({ sessionId: `${id}-session` }),
  resumeSession: async () => ({}),
  getMessages: async () => [],
  checkAvailability: () => availability,
  listModels: () => [{ id: `${id}/model` }],
  listSessions: async () => [],
  exportSession: async (sessionId) => ({
    session: { id: sessionId, title: sessionId, directory: "/tmp", updatedAt: new Date().toISOString() },
    messages: [],
  }),
  launchSession: async () => ({}),
});

test("registry returns agent by id", () => {
  const opencode = createTestAgent("opencode", { type: "INSTALLED" });
  const registry = createAgentRegistry([opencode]);

  expect(registry.get("opencode")).toBe(opencode);
});

test("registry returns null for unknown agent id", () => {
  const opencode = createTestAgent("opencode", { type: "INSTALLED" });
  const registry = createAgentRegistry([opencode]);

  expect(registry.get("unknown" as AgentId)).toBeNull();
});

test("registry list returns all agents", () => {
  const opencode = createTestAgent("opencode", { type: "INSTALLED" });
  const claudeCode = createTestAgent("claude-code", { type: "NOT_FOUND" });
  const registry = createAgentRegistry([opencode, claudeCode]);

  expect(registry.list()).toEqual([opencode, claudeCode]);
});

test("registry checkAll returns availability for all agents", () => {
  const opencode = createTestAgent("opencode", { type: "INSTALLED" });
  const claudeCode = createTestAgent("claude-code", { type: "NOT_FOUND" });
  const registry = createAgentRegistry([opencode, claudeCode]);

  expect(registry.checkAll()).toEqual({
    opencode: { type: "INSTALLED" },
    "claude-code": { type: "NOT_FOUND" },
  });
});
