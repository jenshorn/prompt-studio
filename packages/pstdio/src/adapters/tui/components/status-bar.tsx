import { Box, Text } from "ink";

import type { Mode } from "../app";

interface StatusBarProps {
  mode: Mode;
  docCount: number;
  error: string;
  width: number;
}

interface KeyHint {
  key: string;
  label: string;
}

const NORMAL_KEYS: KeyHint[] = [{ key: "?", label: "help" }];

const INPUT_KEYS: KeyHint[] = [
  { key: "enter", label: "confirm" },
  { key: "esc", label: "cancel" },
];

const VIEW_KEYS: KeyHint[] = [
  { key: "esc", label: "close" },
  { key: "v", label: "close" },
];

export function StatusBar({ mode, docCount, error, width }: StatusBarProps) {
  const hints = mode === "view" ? VIEW_KEYS : mode === "normal" || mode === "help" ? NORMAL_KEYS : INPUT_KEYS;

  return (
    <Box flexDirection="column">
      {error && (
        <Box>
          <Text color="red"> {error}</Text>
        </Box>
      )}

      <Box>
        <Text backgroundColor="gray" color="white">
          {" "}
          {docCount} doc(s){" "}
        </Text>

        <Text> </Text>

        {hints.map((hint, i) => (
          <Text key={hint.key}>
            {i > 0 && <Text dimColor> </Text>}
            <Text bold color="cyan">
              {hint.key}
            </Text>
            <Text dimColor> {hint.label}</Text>
          </Text>
        ))}

        <Text>{"".padEnd(Math.max(0, width - 80))}</Text>
      </Box>
    </Box>
  );
}
