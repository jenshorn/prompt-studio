import type { Arguments, Argv } from "yargs";
import { findGitRoot } from "@/features/config/config";
import { createAndInitProject } from "@/features/projects/create-and-init";

export const command = "create <name>";
export const describe = "Create a new project and initialize .pstdio in the current git root";

export const builder = (yargs: Argv) =>
  yargs.positional("name", {
    type: "string",
    demandOption: true,
    describe: "The project name",
  });

export const handler = async (argv: Arguments<{ name: string }>) => {
  const root = findGitRoot(process.cwd());
  if (!root) {
    throw new Error("Not inside a git repository. Run `git init` first.");
  }

  const project = await createAndInitProject(root, argv.name);
  console.log(`Created project "${project.name}" (${project.id}) and initialized .pstdio at ${root}`);
};
