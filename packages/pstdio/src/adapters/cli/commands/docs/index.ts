import type { Argv } from "yargs";
import * as pullCommand from "./pull";
import * as saveCommand from "./save";

export const command = "docs <command>";
export const describe = "Manage project documentation";

export const builder = (yargs: Argv) =>
  yargs.command(saveCommand).command(pullCommand).demandCommand(1, "Please specify a docs command: save or pull.");

export const handler = () => {};
