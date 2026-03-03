import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOpencodeService } from "./opencode-service";

test("createOpencodeService stores discovered server url under ~/.pstdio", async () => {
  const customHome = mkdtempSync(join(tmpdir(), "pstdio-opencode-home-"));
  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;

  process.env.HOME = customHome;
  process.env.USERPROFILE = customHome;

  try {
    const service = createOpencodeService({
      startServer: async () => "http://127.0.0.1:4900",
      isPortOpen: async () => false,
      pingServer: async () => false,
      fetcher: async (input) => {
        const url = String(input);

        if (url.includes("/session?")) {
          return new Response(JSON.stringify({ id: "session-1" }));
        }

        if (url.includes("/session/session-1/message?")) {
          return new Response(JSON.stringify({ info: {}, parts: [] }));
        }

        throw new Error(`Unexpected request URL: ${url}`);
      },
    });

    await service.startSession({ prompt: "Start session", cwd: customHome });

    const storePath = join(customHome, ".pstdio", "opencode-server.txt");
    const storedServerUrl = readFileSync(storePath, "utf8").trim();
    expect(storedServerUrl).toBe("http://127.0.0.1:4900");
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }

    if (originalUserProfile === undefined) {
      delete process.env.USERPROFILE;
    } else {
      process.env.USERPROFILE = originalUserProfile;
    }

    rmSync(customHome, { recursive: true, force: true });
  }
});
