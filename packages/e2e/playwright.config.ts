import { defineConfig, devices } from "@playwright/test";

const apiPort = Number(process.env.E2E_API_PORT ?? "3200");
const dashboardPort = Number(process.env.E2E_DASHBOARD_PORT ?? "5174");

export default defineConfig({
  testDir: "./src/ui",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: `http://localhost:${dashboardPort}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `NODE_ENV=test PORT=${apiPort} bun run --cwd ../../packages/api src/server.ts`,
      port: apiPort,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: `VITE_API_BASE_URL=http://localhost:${apiPort} bun run --cwd ../../webapps/dashboard dev --port ${dashboardPort}`,
      port: dashboardPort,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
