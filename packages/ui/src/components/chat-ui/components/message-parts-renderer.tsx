import { Box, Spinner, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { RichMessage } from "@/components/rich-text";
import type {
  ErrorPart,
  LoadingPart,
  SessionMessage,
  SessionMessagePart,
  TokenUsagePart,
  ToolPart,
} from "../agent-types";
import { Response } from "./ai-response";
import { ToolInvocationTimeline, type ToolInvocationTimelineProps } from "./tool-invocation-timeline";

type ToolInvocationTimelineComponent = (props: ToolInvocationTimelineProps) => ReactNode;

export interface MessagePartsProps {
  message: SessionMessage;
  streaming?: boolean;
  onOpenFile?: (filePath: string) => void;
  toolInvocationTimeline?: ToolInvocationTimelineComponent;
}

const isTextPart = (part: SessionMessagePart): part is { type: "text"; text: string } => {
  return part.type === "text" && "text" in part;
};

const isReasoningPart = (part: SessionMessagePart): part is { type: "reasoning"; text: string } => {
  return part.type === "reasoning" && "text" in part;
};

const isToolPart = (part: SessionMessagePart): part is ToolPart => {
  return part.type === "tool";
};

const isLoadingPart = (part: SessionMessagePart): part is LoadingPart => {
  return part.type === "loading";
};

const isErrorPart = (part: SessionMessagePart): part is ErrorPart => {
  return part.type === "error";
};

const isTokenUsagePart = (part: SessionMessagePart): part is TokenUsagePart => {
  return part.type === "token_usage";
};

const formatTokenCount = (count: number) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
};

export function MessagePartsRenderer(props: MessagePartsProps) {
  const { message, onOpenFile, toolInvocationTimeline } = props;
  const RenderToolInvocationTimeline = toolInvocationTimeline ?? ToolInvocationTimeline;
  const parts = message.parts ?? [];
  const nodes: ReactNode[] = [];

  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex];
    const key = `${message.id}-${partIndex}`;

    if (isTextPart(part)) {
      nodes.push(
        <div key={key}>
          <Response>{part.text}</Response>
        </div>,
      );
      continue;
    }

    if (isReasoningPart(part)) {
      nodes.push(
        <Box
          key={key}
          padding="0"
          css={{
            "& .rich-text, & .rich-text *": {
              color: "fg.subtle !important",
              fontSize: ".75rem !important",
              fontWeight: "normal !important",
            },
          }}
        >
          <RichMessage defaultState={part.text} />
        </Box>,
      );
      continue;
    }

    if (isToolPart(part)) {
      const invocations: ToolPart[] = [part];
      let lookahead = partIndex + 1;

      while (lookahead < parts.length) {
        const nextPart = parts[lookahead];
        if (!isToolPart(nextPart)) break;
        invocations.push(nextPart);
        lookahead += 1;
      }

      partIndex = lookahead - 1;

      nodes.push(
        <Box key={key} width="full">
          <RenderToolInvocationTimeline invocations={invocations} labeledBlocks onOpenFile={onOpenFile} />
        </Box>,
      );
      continue;
    }

    if (isLoadingPart(part)) {
      nodes.push(
        <Box key={key} display="flex" alignItems="center" gap="2" py="2">
          <Spinner size="sm" />
          <Text fontSize="sm" color="fg.muted">
            Thinking...
          </Text>
        </Box>,
      );
      continue;
    }

    if (isErrorPart(part)) {
      nodes.push(
        <Box key={key} py="2">
          <Text fontSize="sm" color="fg.error">
            {part.errorType === "timeout"
              ? "Session timed out."
              : part.errorType === "crash"
                ? "Session crashed unexpectedly."
                : part.errorType === "permission"
                  ? "Permission denied."
                  : "An error occurred."}
          </Text>
        </Box>,
      );
      continue;
    }

    if (isTokenUsagePart(part)) {
      nodes.push(
        <Box key={key} py="1">
          <Text fontSize="xs" color="fg.subtle">
            Tokens: {formatTokenCount(part.inputTokens)} in / {formatTokenCount(part.outputTokens)} out
            {part.cacheReadTokens ? ` / ${formatTokenCount(part.cacheReadTokens)} cache read` : ""}
          </Text>
        </Box>,
      );
      continue;
    }

    nodes.push(null);
  }

  return <>{nodes}</>;
}
