import { expect, test } from "bun:test";
import { openBrowser } from "./open-browser";

test("calls open command on darwin", () => {
  let calledWith = "";
  const opener = (cmd: string) => {
    calledWith = cmd;
  };

  openBrowser("http://localhost:5555", "darwin", opener);

  expect(calledWith).toBe('open "http://localhost:5555"');
});

test("calls xdg-open on linux", () => {
  let calledWith = "";
  const opener = (cmd: string) => {
    calledWith = cmd;
  };

  openBrowser("http://localhost:5555", "linux", opener);

  expect(calledWith).toBe('xdg-open "http://localhost:5555"');
});

test("calls start on win32", () => {
  let calledWith = "";
  const opener = (cmd: string) => {
    calledWith = cmd;
  };

  openBrowser("http://localhost:5555", "win32", opener);

  expect(calledWith).toBe('start "" "http://localhost:5555"');
});
