import { join } from "node:path";
import { app, protocol } from "electron";
import type { RuntimeDescriptor } from "pstdio/runtime";
import { LIFECYCLE_SCHEME, readLifecycleAsset } from "../windows/lifecycle-protocol";
import { DesktopWindowController } from "../windows/window-controller";

protocol.registerSchemesAsPrivileged([
  { scheme: LIFECYCLE_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

void app.whenReady().then(async () => {
  const controller = await DesktopWindowController.create(join(import.meta.dirname, "preload.cjs"));
  const focused = new Promise<void>((resolve) => controller.window.once("focus", () => resolve()));
  const descriptor: RuntimeDescriptor = {
    schemaVersion: 1,
    protocolVersion: 1,
    pid: process.pid,
    instanceId: "window-readiness",
    ownerType: "persistent",
    origin: process.env.PSTDIO_WINDOW_TEST_ORIGIN as RuntimeDescriptor["origin"],
    token: "window-readiness-secret",
    appVersion: app.getVersion(),
    startedAt: new Date().toISOString(),
  };
  const workbenchReady = controller.showWorkbench(descriptor);
  const lifecycleProtocol = controller.window.webContents.session.protocol;
  lifecycleProtocol.unhandle(LIFECYCLE_SCHEME);
  lifecycleProtocol.handle(LIFECYCLE_SCHEME, async (request) => {
    if (new URL(request.url).pathname === "/pending.png") {
      // Finish loading the lifecycle document after the workbench takes focus.
      await workbenchReady;
      return new Response(null, { status: 404 });
    }
    return readLifecycleAsset(request.url, join(import.meta.dirname, "renderer"));
  });
  controller.window.webContents.once("dom-ready", () => {
    app.focus({ steal: true });
    console.log(JSON.stringify({ documentReadyVisible: controller.window.isVisible() }));
  });
  process.stdin.once("data", async () => {
    await controller.showLifecycle();
    console.log(JSON.stringify({ lifecycleVisible: controller.window.isVisible() }));
    await workbenchReady;
    await focused;
    process.stdout.write(
      `${JSON.stringify({ visible: controller.window.isVisible(), workbenchVisible: controller.window.contentView.children.some((view) => view.getVisible()), workbenchFocused: controller.webContents()[1]?.isFocused() })}\n`,
      () => app.exit(0),
    );
  });
  console.log(
    JSON.stringify({
      visible: controller.window.isVisible(),
      workbenchVisible: controller.window.contentView.children.some((view) => view.getVisible()),
    }),
  );
});
