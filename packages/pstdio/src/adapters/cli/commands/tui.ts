import type { Argv } from "yargs";

export const command = "tui";
export const describe = "Launch interactive terminal UI";

export const builder = (yargs: Argv) => yargs;

export const handler = async () => {
  const { render } = await import("ink");
  const { createElement } = await import("react");
  const { App } = await import("@/adapters/tui/app");

  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[?25l");

  const instance = render(createElement(App), { patchConsole: true });

  instance.waitUntilExit().then(() => {
    process.stdout.write("\x1b[?25h");
    process.stdout.write("\x1b[?1049l");
  });
};
