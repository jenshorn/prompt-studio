import {
  accessSync,
  chmodSync,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const BIN_NAME = "pstdio";
const CLI_ENTRY = "packages/pstdio/src/index.ts";
const MANAGED_MARKER = "# managed-by=pstdio-local-checkout";
const LEGACY_MANAGED_MARKER = "// managed-by=pstdio-local-checkout";
const CMD_MANAGED_MARKER = "REM managed-by=pstdio-local-checkout";
const REPO_MARKER = "# repo-root=";
const LEGACY_REPO_MARKER = "// repo-root=";
const CMD_REPO_MARKER = "REM repo-root=";
const BACKUP_SUFFIX = ".pstdio-local-backup";
const DEV_HOME_SHELL_EXPANSION = ["${", "PSTDIO_HOME:-$HOME/.pstdio-dev", "}"].join("");

type LocalPstdioInput = {
  installDir: string;
  platform?: NodeJS.Platform | undefined;
  repoRoot: string;
};

type InstallLocalPstdioInput = LocalPstdioInput & {
  mode?:
    | {
        type: "checkout";
      }
    | {
        apiUrl: string;
        type: "dev-server";
      };
  pathEnv?: string | undefined;
};

const canWrite = (path: string) => {
  try {
    accessSync(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

const commandNameFor = (platform: NodeJS.Platform) => (platform === "win32" ? `${BIN_NAME}.cmd` : BIN_NAME);

const pathDelimiterFor = (platform: NodeJS.Platform) => (platform === "win32" ? ";" : ":");

const commandNamesFor = (platform: NodeJS.Platform) =>
  platform === "win32" ? [commandNameFor(platform), BIN_NAME] : [BIN_NAME];

const isPathEntry = (pathEnv: string | undefined, installDir: string, platform = process.platform) => {
  if (!pathEnv) return false;
  return pathEnv.split(pathDelimiterFor(platform)).includes(installDir);
};

const resolveExistingCommandPath = (pathEnv: string | undefined, platform = process.platform) => {
  if (!pathEnv) return null;

  for (const installDir of pathEnv.split(pathDelimiterFor(platform))) {
    if (!installDir) continue;

    for (const commandName of commandNamesFor(platform)) {
      const destination = join(installDir, commandName);
      if (existsSync(destination)) return destination;
    }
  }

  return null;
};

const getBackupPath = (destination: string) => `${destination}${BACKUP_SUFFIX}`;

const quoteShellValue = (value: string) => `'${value.replaceAll("'", `'\\''`)}'`;

const createShellWrapper = (repoRoot: string, mode: NonNullable<InstallLocalPstdioInput["mode"]>) => {
  const cliPath = join(repoRoot, CLI_ENTRY);
  const envLines =
    mode.type === "dev-server"
      ? [
          `export PSTDIO_HOME="${DEV_HOME_SHELL_EXPANSION}"`,
          `export PSTDIO_API_URL=${quoteShellValue(mode.apiUrl)}`,
          "export PSTDIO_DISABLE_API_AUTO_START='1'",
          "export PSTDIO_DISABLE_EMBED_MANIFEST='1'",
        ]
      : ["export PSTDIO_DISABLE_EMBED_MANIFEST='1'"];

  return `#!/bin/sh
${MANAGED_MARKER}
${REPO_MARKER}${repoRoot}
${envLines.join("\n")}
exec bun --conditions=source ${quoteShellValue(cliPath)} "$@"
`;
};

const createCmdWrapper = (repoRoot: string, mode: NonNullable<InstallLocalPstdioInput["mode"]>) => {
  const cliPath = join(repoRoot, CLI_ENTRY);
  const envLines =
    mode.type === "dev-server"
      ? [
          'if not defined PSTDIO_HOME set "PSTDIO_HOME=%USERPROFILE%\\.pstdio-dev"',
          `set "PSTDIO_API_URL=${mode.apiUrl}"`,
          'set "PSTDIO_DISABLE_API_AUTO_START=1"',
          'set "PSTDIO_DISABLE_EMBED_MANIFEST=1"',
        ]
      : ['set "PSTDIO_DISABLE_EMBED_MANIFEST=1"'];

  return `@echo off
${CMD_MANAGED_MARKER}
${CMD_REPO_MARKER}${repoRoot}
${envLines.join("\n")}
bun --conditions=source "${cliPath}" %*
exit /b %ERRORLEVEL%
`;
};

const createWrapper = (
  repoRoot: string,
  mode: NonNullable<InstallLocalPstdioInput["mode"]>,
  platform: NodeJS.Platform,
) => (platform === "win32" ? createCmdWrapper(repoRoot, mode) : createShellWrapper(repoRoot, mode));

const readManagedRepoRoot = (path: string) => {
  const content = readFileSync(path, "utf8");
  if (
    !content.includes(MANAGED_MARKER) &&
    !content.includes(LEGACY_MANAGED_MARKER) &&
    !content.includes(CMD_MANAGED_MARKER)
  ) {
    return null;
  }

  const repoLine = content
    .split("\n")
    .find(
      (line) => line.startsWith(REPO_MARKER) || line.startsWith(LEGACY_REPO_MARKER) || line.startsWith(CMD_REPO_MARKER),
    );

  if (!repoLine) return null;
  if (repoLine.startsWith(REPO_MARKER)) return repoLine.slice(REPO_MARKER.length);
  if (repoLine.startsWith(LEGACY_REPO_MARKER)) return repoLine.slice(LEGACY_REPO_MARKER.length);
  return repoLine.slice(CMD_REPO_MARKER.length);
};

export const resolveLocalPstdioInstallDir = (pathEnv?: string, platform = process.platform) => {
  const existingCommandPath = resolveExistingCommandPath(pathEnv, platform);

  if (existingCommandPath && canWrite(dirname(existingCommandPath))) {
    return dirname(existingCommandPath);
  }

  if (canWrite("/usr/local/bin")) return "/usr/local/bin";
  return join(homedir(), ".local", "bin");
};

export const installLocalPstdio = ({
  installDir,
  mode = { type: "checkout" },
  pathEnv,
  platform = process.platform,
  repoRoot,
}: InstallLocalPstdioInput) => {
  mkdirSync(installDir, { recursive: true });

  const destination = join(installDir, commandNameFor(platform));
  const legacyDestination = platform === "win32" ? join(installDir, BIN_NAME) : null;
  const backupPath = getBackupPath(destination);
  const previousRepoRoot = existsSync(destination) ? readManagedRepoRoot(destination) : null;
  const previousLegacyRepoRoot =
    legacyDestination && existsSync(legacyDestination) ? readManagedRepoRoot(legacyDestination) : null;

  if (existsSync(destination) && !previousRepoRoot) {
    if (existsSync(backupPath)) {
      throw new Error(`Refusing to overwrite unmanaged pstdio install at ${destination}`);
    }

    renameSync(destination, backupPath);
  }

  writeFileSync(destination, createWrapper(repoRoot, mode, platform));
  chmodSync(destination, 0o755);

  if (legacyDestination && previousLegacyRepoRoot) {
    rmSync(legacyDestination);
  }

  return {
    destination,
    needsPathUpdate: !isPathEntry(pathEnv, installDir, platform),
    previousRepoRoot: previousRepoRoot ?? previousLegacyRepoRoot,
  };
};

export const removeLocalPstdio = ({ installDir, platform = process.platform, repoRoot }: LocalPstdioInput) => {
  const destination = join(installDir, commandNameFor(platform));
  const backupPath = getBackupPath(destination);
  const legacyDestination = platform === "win32" ? join(installDir, BIN_NAME) : null;

  if (!existsSync(destination) && !(legacyDestination && existsSync(legacyDestination))) {
    return { destination, reason: "missing" as const, removed: false };
  }

  const target = existsSync(destination) ? destination : legacyDestination;
  if (!target) return { destination, reason: "missing" as const, removed: false };

  const installedRepoRoot = readManagedRepoRoot(target);

  if (!installedRepoRoot) {
    throw new Error(`Refusing to remove unmanaged pstdio install at ${target}`);
  }

  if (installedRepoRoot !== repoRoot) {
    return {
      destination,
      installedRepoRoot,
      reason: "different-checkout" as const,
      removed: false,
    };
  }

  if (existsSync(backupPath)) {
    rmSync(target);
    renameSync(backupPath, destination);
    return { destination, removed: true, restoredBackup: true };
  }

  rmSync(target);
  return { destination, removed: true };
};
