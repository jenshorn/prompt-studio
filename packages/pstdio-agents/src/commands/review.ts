import { basename } from "node:path";
import type { AgentService, LaunchResult } from "../types";

type ReviewOptions = {
  changeTitle?: string;
  model?: string | null;
};

const buildSessionTitle = (repoRoot: string, changeId: string, changeTitle?: string) => {
  const repo = basename(repoRoot);
  const suffix = changeTitle ? ` — ${changeTitle}` : "";
  return `${repo}: Review ${changeId}${suffix}`;
};

export const review = (
  agent: AgentService,
  changeId: string,
  repoRoot: string,
  options: ReviewOptions = {},
): Promise<LaunchResult> => {
  const title = buildSessionTitle(repoRoot, changeId, options.changeTitle);
  const prompt = `Review change ${changeId}`;

  return agent.launchSession({ prompt, title, model: options.model, cwd: repoRoot });
};
