import { afterEach, describe, expect, test } from "bun:test";
import type { Server } from "node:http";
import { launch } from ".";

type StubDeps = {
  apiHealthy?: boolean;
  dashboardRoot?: string;
};

const createStubDeps = (overrides: StubDeps = {}) => {
  const calls = {
    runApi: [] as unknown[],
    serveDashboard: [] as unknown[],
    openBrowser: [] as string[],
    waitForHealthy: [] as unknown[],
  };

  let serverClosed = false;
  const fakeServer = {
    close: () => {
      serverClosed = true;
    },
  } as unknown as Server;

  return {
    calls,
    serverClosed: () => serverClosed,
    deps: {
      isHealthy: async () => overrides.apiHealthy ?? false,
      waitForHealthy: async (opts: unknown) => {
        calls.waitForHealthy.push(opts);
      },
      runApi: (startDir: string, opts: unknown) => {
        calls.runApi.push({ startDir, opts });
        return { apiRoot: null, child: { kill: () => true } };
      },
      serveDashboard: (opts: unknown) => {
        calls.serveDashboard.push(opts);
        return fakeServer;
      },
      resolveDashboardRoot: () => overrides.dashboardRoot ?? "/fake/dashboard/dist",
      openBrowser: (url: string) => {
        calls.openBrowser.push(url);
      },
    },
  };
};

const sigintListeners: (() => void)[] = [];

afterEach(() => {
  for (const listener of sigintListeners) {
    process.removeListener("SIGINT", listener);
  }
  sigintListeners.length = 0;
});

describe("launch", () => {
  test("starts API when not already healthy", async () => {
    const { calls, deps } = createStubDeps({ apiHealthy: false });

    await launch({ apiPort: 3000, dashboardPort: 5555 }, deps);

    expect(calls.runApi).toHaveLength(1);
  });

  test("passes PSTDIO_API_PORT in runApi env", async () => {
    const { calls, deps } = createStubDeps({ apiHealthy: false });

    await launch({ apiPort: 4321, dashboardPort: 5555 }, deps);

    const runApiCall = calls.runApi[0] as { opts?: { env?: NodeJS.ProcessEnv } };
    const env = runApiCall.opts?.env ?? {};

    expect(env.PSTDIO_API_PORT).toBe("4321");
  });

  test("skips API start when already healthy", async () => {
    const { calls, deps } = createStubDeps({ apiHealthy: true });

    await launch({ apiPort: 3000, dashboardPort: 5555 }, deps);

    expect(calls.runApi).toHaveLength(0);
  });

  test("starts dashboard server with correct options", async () => {
    const { calls, deps } = createStubDeps({ dashboardRoot: "/my/dashboard" });

    await launch({ apiPort: 3000, dashboardPort: 5555 }, deps);

    expect(calls.serveDashboard).toEqual([
      {
        root: "/my/dashboard",
        port: 5555,
        config: { apiBaseUrl: "http://localhost:3000" },
      },
    ]);
  });

  test("waits for API health before opening browser", async () => {
    const order: string[] = [];
    const { deps } = createStubDeps();

    const trackedDeps = {
      ...deps,
      waitForHealthy: async (opts: unknown) => {
        order.push("waitForHealthy");
        return deps.waitForHealthy(opts);
      },
      openBrowser: (url: string) => {
        order.push("openBrowser");
        deps.openBrowser(url);
      },
    };

    await launch({ apiPort: 3000, dashboardPort: 5555 }, trackedDeps);

    expect(order).toEqual(["waitForHealthy", "openBrowser"]);
  });

  test("opens browser with dashboard URL", async () => {
    const { calls, deps } = createStubDeps();

    await launch({ apiPort: 3000, dashboardPort: 5555 }, deps);

    expect(calls.openBrowser).toEqual(["http://localhost:5555"]);
  });
});
