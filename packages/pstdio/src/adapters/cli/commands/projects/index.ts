import type { Argv } from "yargs";
import * as createCommand from "./create";
import * as linkCommand from "./link";

export const command = "projects <command>";
export const describe = "Manage projects";

export const builder = (yargs: Argv) =>
  yargs
    .command(createCommand)
    .command(linkCommand)
    .demandCommand(1, "Please specify a projects command: create or link.");

export const handler = () => {};
