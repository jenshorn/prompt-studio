import { describe, expect, test } from "bun:test";
import { resolveProcessCommand } from "./process-command";

describe("resolveProcessCommand", () => {
  test("resolves bare commands before spawning", () => {
    const command = resolveProcessCommand(["codex", "--version"], (name) =>
      name === "codex" ? "C:\\Users\\me\\AppData\\Roaming\\npm\\codex.cmd" : null,
    );

    expect(command).toEqual(["C:\\Users\\me\\AppData\\Roaming\\npm\\codex.cmd", "--version"]);
  });

  test("leaves path commands unchanged", () => {
    const command = resolveProcessCommand([".\\tools\\codex.cmd", "--version"], () => "ignored");

    expect(command).toEqual([".\\tools\\codex.cmd", "--version"]);
  });

  test("keeps the original command when resolution fails", () => {
    const command = resolveProcessCommand(["missing", "--version"], () => null);

    expect(command).toEqual(["missing", "--version"]);
  });
});
