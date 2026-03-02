import { writeConfig } from "@/features/config/config";
import { scaffoldDocs } from "@/features/docs/scaffold";
import { API_URL } from "../api-url";
import { getProject } from "./api/get-project";

export const linkProject = async (root: string, projectId: string) => {
  const project = await getProject(API_URL, projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  writeConfig(root, { project_id: projectId });
  scaffoldDocs(root);
  return project;
};
