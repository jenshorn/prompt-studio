import { exec } from "node:child_process";

type Opener = (command: string) => void;

export const openBrowser = (url: string, platform = process.platform as string, opener: Opener = exec) => {
  const command =
    platform === "darwin" ? `open "${url}"` : platform === "win32" ? `start "" "${url}"` : `xdg-open "${url}"`;

  opener(command);
};
