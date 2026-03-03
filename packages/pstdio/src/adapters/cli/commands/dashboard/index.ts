import type { Server } from "node:http";
import type { Argv } from "yargs";
import { runApi as defaultRunApi } from "../../dashboard/api";
import { isHealthy as defaultIsHealthy, waitForHealthy as defaultWaitForHealthy } from "../../dashboard/health-check";
import { openBrowser as defaultOpenBrowser } from "../../dashboard/open-browser";
import { resolveDashboardRoot as defaultResolveDashboardRoot } from "../../dashboard/resolve-dashboard-root";
import { serveDashboard as defaultServeDashboard } from "../../dashboard/serve-dashboard";

type LaunchDeps = {
  isHealthy: typeof defaultIsHealthy;
  waitForHealthy: typeof defaultWaitForHealthy;
  runApi: typeof defaultRunApi;
  serveDashboard: typeof defaultServeDashboard;
  resolveDashboardRoot: typeof defaultResolveDashboardRoot;
  openBrowser: (url: string) => void;
};

const defaultDeps: LaunchDeps = {
  isHealthy: defaultIsHealthy,
  waitForHealthy: defaultWaitForHealthy,
  runApi: defaultRunApi,
  serveDashboard: defaultServeDashboard,
  resolveDashboardRoot: defaultResolveDashboardRoot,
  openBrowser: defaultOpenBrowser,
};

type LaunchOptions = {
  apiPort: number;
  dashboardPort: number;
};

export const launch = async (options: LaunchOptions, deps: LaunchDeps = defaultDeps) => {
  const { apiPort, dashboardPort } = options;
  const apiUrl = `http://localhost:${apiPort}`;
  const dashboardUrl = `http://localhost:${dashboardPort}`;

  const apiAlreadyRunning = await deps.isHealthy(`${apiUrl}/healthz`);

  let apiChild: ReturnType<typeof deps.runApi> = null;
  if (!apiAlreadyRunning) {
    apiChild = deps.runApi(process.cwd(), {
      stdio: "inherit",
      detached: false,
      env: { ...process.env, PSTDIO_API_PORT: String(apiPort) },
    });
  }

  const dashboardRoot = deps.resolveDashboardRoot(process.cwd());
  const server = deps.serveDashboard({
    root: dashboardRoot,
    port: dashboardPort,
    config: { apiBaseUrl: apiUrl },
  });

  await deps.waitForHealthy({ url: `${apiUrl}/healthz` });

  deps.openBrowser(dashboardUrl);

  process.stdout.write(`Dashboard: ${dashboardUrl}\n`);
  process.stdout.write(`API:       ${apiUrl}\n`);

  const shutdown = () => {
    (server as Server).close();
    apiChild?.child?.kill?.();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

export const command = "$0";
export const describe = "Start API and dashboard, then open in browser";

export const builder = (yargs: Argv) =>
  yargs
    .option("api-port", { type: "number", default: 3000, describe: "API server port" })
    .option("dashboard-port", { type: "number", default: 5555, describe: "Dashboard server port" });

export const handler = async (args: { apiPort: number; dashboardPort: number }) => {
  await launch(args);
};
