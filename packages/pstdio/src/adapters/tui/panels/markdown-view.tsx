import { Box, Text } from "ink";
import Markdown from "ink-markdown";

interface MarkdownViewProps {
  title: string;
  content: string;
  width: number;
  viewportHeight: number;
}

export function MarkdownView({ title, content, width, viewportHeight }: MarkdownViewProps) {
  if (!content) {
    return (
      <Box height={viewportHeight} width={width} alignItems="center" justifyContent="center">
        <Text dimColor>No content for this document.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={viewportHeight} width={width}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>

      <Box flexDirection="column" overflow="hidden">
        <Markdown>{content}</Markdown>
      </Box>

      <Box justifyContent="center" marginTop={1}>
        <Text dimColor>Press esc or v to close</Text>
      </Box>
    </Box>
  );
}
