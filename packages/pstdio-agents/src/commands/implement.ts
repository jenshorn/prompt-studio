import { basename } from "node:path";
import type { AgentService, LaunchResult } from "../types";

type ImplementOptions = {
  title?: string;
  prompt?: string;
  model?: string | null;
};

const buildSessionTitle = (repoRoot: string, ticketId: string, customTitle?: string) => {
  const repo = basename(repoRoot);
  const suffix = customTitle ? ` — ${customTitle}` : "";
  return `${repo}: Implement ${ticketId}${suffix}`;
};

export const implement = (
  agent: AgentService,
  ticketId: string,
  repoRoot: string,
  options: ImplementOptions = {},
): Promise<LaunchResult> => {
  const title = buildSessionTitle(repoRoot, ticketId, options.title);
  const prompt = options.prompt ?? `Implement ticket ${ticketId}`;

  return agent.launchSession({ prompt, title, model: options.model, cwd: repoRoot });
};
