import type { Arguments, Argv } from "yargs";
import { findGitRoot } from "@/features/config/config";
import { linkProject } from "@/features/projects/link-project";

export const command = "link";
export const describe = "Link an existing project to the current git root";

export const builder = (yargs: Argv) =>
  yargs.option("project-id", {
    type: "string",
    demandOption: true,
    describe: "The project ID to link",
  });

export const handler = async (argv: Arguments<{ projectId: string }>) => {
  const root = findGitRoot(process.cwd());
  if (!root) {
    throw new Error("Not inside a git repository. Run `git init` first.");
  }

  const project = await linkProject(root, argv.projectId);
  console.log(`Linked project "${project.name}" (${project.id}) at ${root}`);
};
