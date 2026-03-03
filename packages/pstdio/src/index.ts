import { readFile } from "node:fs/promises";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { topLevelCommandModules } from "./adapters/cli/commands";
import * as dashboardCommand from "./adapters/cli/commands/dashboard";

const packageData = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const cli = yargs(hideBin(process.argv))
  .scriptName("pstdio")
  .version(packageData.version)
  .strict()
  .command(dashboardCommand);

for (const mod of topLevelCommandModules) {
  cli.command(mod);
}

cli.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
