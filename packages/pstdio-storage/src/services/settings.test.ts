import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSettingsService } from "./settings";

const tempRoot = mkdtempSync(join(tmpdir(), "pstdio-settings-"));

afterAll(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

test("get returns empty defaults when file does not exist", async () => {
  const settings = createSettingsService(join(tempRoot, "missing", "settings.json"));

  const result = await settings.get();

  expect(result).toEqual({});
});

test("createSettingsService defaults to ~/.pstdio/settings.json", async () => {
  const customHome = join(tempRoot, "custom-home");
  mkdirSync(customHome, { recursive: true });

  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;

  process.env.HOME = customHome;
  process.env.USERPROFILE = customHome;

  try {
    const settings = createSettingsService();
    await settings.update({ default_agent: "opencode" });

    const settingsPath = join(customHome, ".pstdio", "settings.json");
    const persisted = JSON.parse(readFileSync(settingsPath, "utf8"));
    expect(persisted.default_agent).toBe("opencode");
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }

    if (originalUserProfile === undefined) {
      delete process.env.USERPROFILE;
    } else {
      process.env.USERPROFILE = originalUserProfile;
    }
  }
});

test("get reads existing settings file", async () => {
  const path = join(tempRoot, "existing", "settings.json");
  mkdirSync(join(tempRoot, "existing"), { recursive: true });
  writeFileSync(path, JSON.stringify({ default_agent: "claude-code" }));

  const settings = createSettingsService(path);

  const result = await settings.get();

  expect(result).toEqual({ default_agent: "claude-code" });
});

test("update merges partial settings into existing", async () => {
  const path = join(tempRoot, "merge", "settings.json");
  mkdirSync(join(tempRoot, "merge"), { recursive: true });
  writeFileSync(path, JSON.stringify({ default_agent: "opencode", agents: { opencode: { enabled: true } } }));

  const settings = createSettingsService(path);

  const result = await settings.update({ default_agent: "claude-code" });

  expect(result).toEqual({
    default_agent: "claude-code",
    agents: { opencode: { enabled: true } },
  });

  const persisted = JSON.parse(readFileSync(path, "utf8"));
  expect(persisted.default_agent).toBe("claude-code");
});

test("update creates file and directories when missing", async () => {
  const path = join(tempRoot, "deep", "nested", "settings.json");
  const settings = createSettingsService(path);

  const result = await settings.update({ default_agent: "opencode" });

  expect(result).toEqual({ default_agent: "opencode" });

  const persisted = JSON.parse(readFileSync(path, "utf8"));
  expect(persisted.default_agent).toBe("opencode");
});

test("getDefaultAgent returns configured agent", async () => {
  const path = join(tempRoot, "default-configured", "settings.json");
  mkdirSync(join(tempRoot, "default-configured"), { recursive: true });
  writeFileSync(path, JSON.stringify({ default_agent: "claude-code" }));

  const settings = createSettingsService(path);

  const result = await settings.getDefaultAgent();

  expect(result).toBe("claude-code");
});

test("getDefaultAgent returns opencode as fallback", async () => {
  const settings = createSettingsService(join(tempRoot, "no-default", "settings.json"));

  const result = await settings.getDefaultAgent();

  expect(result).toBe("opencode");
});

// --- getAgentSettings / updateAgentSettings ---

test("getAgentSettings returns empty object when no agent settings exist", async () => {
  const settings = createSettingsService(join(tempRoot, "no-agent", "settings.json"));

  const result = await settings.getAgentSettings("claude-code");

  expect(result).toEqual({});
});

test("getAgentSettings returns stored agent settings", async () => {
  const path = join(tempRoot, "agent-get", "settings.json");
  mkdirSync(join(tempRoot, "agent-get"), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({
      agents: { "claude-code": { model: "claude-sonnet-4-5-20250929", approvalMode: "prompt" } },
    }),
  );

  const settings = createSettingsService(path);

  const result = await settings.getAgentSettings("claude-code");

  expect(result).toEqual({ model: "claude-sonnet-4-5-20250929", approvalMode: "prompt" });
});

test("updateAgentSettings merges partial into existing agent settings", async () => {
  const path = join(tempRoot, "agent-merge", "settings.json");
  mkdirSync(join(tempRoot, "agent-merge"), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({
      default_agent: "opencode",
      agents: { "claude-code": { model: "claude-sonnet-4-5-20250929", approvalMode: "bypass" } },
    }),
  );

  const settings = createSettingsService(path);

  const result = await settings.updateAgentSettings("claude-code", { approvalMode: "prompt" });

  expect(result).toEqual({ model: "claude-sonnet-4-5-20250929", approvalMode: "prompt" });

  const persisted = JSON.parse(readFileSync(path, "utf8"));
  expect(persisted.default_agent).toBe("opencode");
  expect(persisted.agents["claude-code"]).toEqual({ model: "claude-sonnet-4-5-20250929", approvalMode: "prompt" });
});

test("updateAgentSettings creates agent entry when none exists", async () => {
  const path = join(tempRoot, "agent-create", "settings.json");
  mkdirSync(join(tempRoot, "agent-create"), { recursive: true });
  writeFileSync(path, JSON.stringify({ default_agent: "opencode" }));

  const settings = createSettingsService(path);

  const result = await settings.updateAgentSettings("opencode", { model: "gpt-4o", autoApprove: true });

  expect(result).toEqual({ model: "gpt-4o", autoApprove: true });

  const persisted = JSON.parse(readFileSync(path, "utf8"));
  expect(persisted.default_agent).toBe("opencode");
  expect(persisted.agents.opencode).toEqual({ model: "gpt-4o", autoApprove: true });
});
