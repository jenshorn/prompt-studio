import { spawn } from "node:child_process";
import { createServer } from "node:net";

const forwardedArgs = process.argv.slice(2).filter((arg) => arg !== "--silent");

const getFreePort = async () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Failed to resolve free port"));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });

const run = async () => {
  const apiPort = await getFreePort();
  const dashboardPort = await getFreePort();

  const child = spawn("bunx", ["playwright", "test", ...forwardedArgs], {
    env: {
      ...process.env,
      E2E_API_PORT: String(apiPort),
      E2E_DASHBOARD_PORT: String(dashboardPort),
    },
    stdio: "inherit",
  });

  child.on("error", () => {
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
};

run().catch(() => {
  process.exit(1);
});
