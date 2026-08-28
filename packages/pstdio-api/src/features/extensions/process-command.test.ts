import { describe, expect, test } from "bun:test";
import { resolveProcessCommand } from "./process-command";

describe("resolveProcessCommand", () => {
  test("resolves bare executable commands before spawning", () => {
    const command = resolveProcessCommand(["codex", "--version"], (name) =>
      name === "codex" ? "C:\\Tools\\codex.exe" : null,
    );

    expect(command).toEqual(["C:\\Tools\\codex.exe", "--version"]);
  });

  test("wraps Windows command shims through cmd.exe", () => {
    const command = resolveProcessCommand(
      ["tool", "--version"],
      (name) => (name === "tool" ? "C:\\Users\\me\\AppData\\Roaming\\npm\\tool.cmd" : null),
      "win32",
      "cmd.exe",
    );

    expect(command).toEqual([
      "cmd.exe",
      "/d",
      "/s",
      "/c",
      "call",
      "C:\\Users\\me\\AppData\\Roaming\\npm\\tool.cmd",
      "--version",
    ]);
  });

  test("switches a Windows .ps1 shim to its sibling .cmd", () => {
    const ps1 = "C:\\Users\\me\\AppData\\Roaming\\npm\\codex.ps1";
    const cmd = "C:\\Users\\me\\AppData\\Roaming\\npm\\codex.cmd";
    const command = resolveProcessCommand(
      ["codex", "--version"],
      (name) => (name === "codex" ? ps1 : null),
      "win32",
      "cmd.exe",
      (path) => path === cmd,
    );

    expect(command).toEqual(["cmd.exe", "/d", "/s", "/c", "call", cmd, "--version"]);
  });

  test("runs a lone Windows .ps1 shim through powershell", () => {
    const ps1 = "C:\\Tools\\only.ps1";
    const command = resolveProcessCommand(
      ["only", "--version"],
      (name) => (name === "only" ? ps1 : null),
      "win32",
      "cmd.exe",
      () => false,
    );

    expect(command).toEqual(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1, "--version"]);
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
