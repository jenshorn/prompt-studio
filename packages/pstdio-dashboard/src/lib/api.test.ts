import { afterEach, expect, test } from "vitest";
import { buildApiUrl } from "./api";

type RuntimeConfig = {
  __PSTDIO_CONFIG__?: { apiBaseUrl?: string };
};

const runtimeConfig = globalThis as unknown as RuntimeConfig;

afterEach(() => {
  delete runtimeConfig.__PSTDIO_CONFIG__;
});

test("buildApiUrl uses __PSTDIO_CONFIG__.apiBaseUrl when available", () => {
  runtimeConfig.__PSTDIO_CONFIG__ = { apiBaseUrl: "http://localhost:7777/" };

  expect(buildApiUrl("/healthz")).toBe("http://localhost:7777/healthz");
});
