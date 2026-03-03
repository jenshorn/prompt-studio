import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type ApprovalMode = "bypass" | "prompt";

export type ClaudeCodeSettings = {
  model?: string;
  planMode?: boolean;
  approvalMode?: ApprovalMode;
  additionalParams?: string[];
};

export type OpencodeSettings = {
  model?: string;
  autoApprove?: boolean;
  autoCompact?: boolean;
};

export type AgentSettingsMap = {
  "claude-code"?: ClaudeCodeSettings;
  opencode?: OpencodeSettings;
};

export type PstdioSettings = {
  default_agent?: string;
  agents?: Record<string, Record<string, unknown>>;
};

const resolveHome = () => process.env.HOME ?? process.env.USERPROFILE ?? homedir();

const defaultSettingsPath = () => join(resolveHome(), ".pstdio", "settings.json");

const persist = async (path: string, data: PstdioSettings) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
};

export const createSettingsService = (path = defaultSettingsPath()) => {
  const get = async (): Promise<PstdioSettings> => {
    try {
      const raw = await readFile(path, "utf8");
      return JSON.parse(raw) as PstdioSettings;
    } catch {
      return {};
    }
  };

  const update = async (partial: Partial<PstdioSettings>) => {
    const current = await get();
    const merged = { ...current, ...partial };

    await persist(path, merged);

    return merged;
  };

  const getDefaultAgent = async () => {
    const settings = await get();
    return settings.default_agent ?? "opencode";
  };

  const getAgentSettings = async (agentId: string): Promise<Record<string, unknown>> => {
    const settings = await get();
    return settings.agents?.[agentId] ?? {};
  };

  const updateAgentSettings = async (agentId: string, partial: Record<string, unknown>) => {
    const current = await get();
    const currentAgent = current.agents?.[agentId] ?? {};
    const mergedAgent = { ...currentAgent, ...partial };

    const merged: PstdioSettings = {
      ...current,
      agents: { ...current.agents, [agentId]: mergedAgent },
    };

    await persist(path, merged);

    return mergedAgent;
  };

  return { get, update, getDefaultAgent, getAgentSettings, updateAgentSettings };
};
