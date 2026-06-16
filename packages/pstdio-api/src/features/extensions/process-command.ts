type WhichCommand = (command: string) => string | null;

const hasPathSeparator = (command: string) => command.includes("/") || command.includes("\\");

const whichCommand: WhichCommand = (command) => {
  if (typeof Bun.which !== "function") return null;
  return Bun.which(command);
};

export const resolveProcessCommand = (command: readonly string[], which: WhichCommand = whichCommand): string[] => {
  const [executable, ...args] = command;
  if (!executable || hasPathSeparator(executable)) return [...command];

  const resolved = which(executable);
  return resolved ? [resolved, ...args] : [...command];
};
