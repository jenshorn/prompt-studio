import { writeConfig } from "@/features/config/config";
import { scaffoldDocs } from "@/features/docs/scaffold";
import { API_URL } from "../api-url";
import { createProject } from "./api/create-project";

export const createAndInitProject = async (root: string, name: string) => {
  const project = await createProject(API_URL, name);
  writeConfig(root, { project_id: project.id });
  scaffoldDocs(root);
  return project;
};
