import { Box, Button, HStack, Text } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import type { SessionMessage } from "../agent-types";
import rawConversationMessages from "../mocks/full-conversation-normalized.json";
import { ChatPanel } from "./chat-panel";

const conversationMessages = rawConversationMessages as unknown as SessionMessage[];

const meta: Meta<typeof ChatPanel> = {
  title: "Chat UI/Chat Panel",
  component: ChatPanel,
  parameters: {
    layout: "padded",
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
};

export default meta;

type Story = StoryObj<typeof ChatPanel>;
type ChatPanelProps = ComponentProps<typeof ChatPanel>;

const panelContainerStyles = {
  w: "960px",
  maxW: "100%",
  h: "680px",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "lg",
  p: "md",
} as const;

const defaultActions = (
  <HStack gap="2">
    <Button size="xs" variant="subtle">
      Opencode
    </Button>
    <Button size="xs" variant="subtle">
      GPT-5.3 Codex
    </Button>
  </HStack>
);

const defaultRepoMenu = (
  <HStack gap="2">
    <Text textStyle="label/S/medium" color="fg.muted">
      mono
    </Text>
    <Button size="xs" variant="ghost">
      main
    </Button>
  </HStack>
);

const streamingMessages = conversationMessages.slice(-18);
const STREAM_CHUNK_SIZE = 10;
const STREAM_INTERVAL_MS = 60;

const splitTextIntoChunks = (text: string) => {
  if (!text) return [];

  const chunks: string[] = [];

  for (let index = 0; index < text.length; index += STREAM_CHUNK_SIZE) {
    chunks.push(text.slice(index, index + STREAM_CHUNK_SIZE));
  }

  return chunks;
};

const isTextPart = (part: SessionMessage["parts"][number]): part is { type: "text"; text: string } => {
  return part.type === "text";
};

const updateAssistantTextPart = (
  currentMessages: SessionMessage[],
  messageId: string,
  partIndex: number,
  text: string,
) => {
  return currentMessages.map((message) => {
    if (message.id !== messageId) return message;

    const targetPart = message.parts[partIndex];
    if (!targetPart || !isTextPart(targetPart)) return message;

    const nextParts = [...message.parts];
    nextParts[partIndex] = { ...targetPart, text };

    return {
      ...message,
      parts: nextParts,
    };
  });
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CONVERSATION_STREAM_MESSAGE_DELAY_MS = 200;
const CONVERSATION_STREAM_STEP_DELAY_MS = 80;

const clearStreamTimer = (timerRef: { current: ReturnType<typeof setInterval> | null }) => {
  if (timerRef.current === null) return;

  clearInterval(timerRef.current);
  timerRef.current = null;
};

const streamAssistantText = (options: {
  timerRef: { current: ReturnType<typeof setInterval> | null };
  sourceText: string;
  onStart: () => void;
  onChunk: (nextText: string) => void;
  onComplete: () => void;
}) => {
  const { timerRef, sourceText, onStart, onChunk, onComplete } = options;

  clearStreamTimer(timerRef);

  const chunks = splitTextIntoChunks(sourceText);
  if (chunks.length === 0) {
    onComplete();
    return;
  }

  let streamedText = "";
  let chunkIndex = 0;

  onStart();

  timerRef.current = setInterval(() => {
    streamedText += chunks[chunkIndex] ?? "";
    onChunk(streamedText);

    chunkIndex += 1;

    if (chunkIndex >= chunks.length) {
      clearStreamTimer(timerRef);
      onComplete();
    }
  }, STREAM_INTERVAL_MS);
};

const buildMockAssistantReply = (text: string, attachments: string[]) => {
  if (attachments.length === 0) {
    return `Mock response: I received "${text}" and generated a draft answer.`;
  }

  return `Mock response: I received "${text}" with ${attachments.length} attachment(s): ${attachments.join(", ")}.`;
};

function MockChatPanelRenderer(props: ChatPanelProps) {
  const {
    messages: initialMessages = [],
    onSubmitMessage,
    emptyStateTitle,
    emptyStateDescription,
    chatInputPlaceholder,
    actions,
    repoMenu,
  } = props;

  const [messages, setMessages] = useState<SessionMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [nextMessageNumber, setNextMessageNumber] = useState(initialMessages.length + 1);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    clearStreamTimer(streamTimerRef);
    setMessages(initialMessages);
    setNextMessageNumber(initialMessages.length + 1);
  }, [initialMessages]);

  useEffect(() => {
    return () => clearStreamTimer(streamTimerRef);
  }, []);

  const handleSubmitMessage = (text: string, attachments: string[]) => {
    onSubmitMessage?.(text, attachments);

    const userMessage: SessionMessage = {
      id: `message-${nextMessageNumber}`,
      role: "user",
      parts: [{ type: "text", text }],
    };

    const assistantReply = buildMockAssistantReply(text, attachments);
    const assistantMessageId = `message-${nextMessageNumber + 1}`;
    const assistantMessage: SessionMessage = {
      id: assistantMessageId,
      role: "assistant",
      parts: [{ type: "text", text: "" }],
    };

    setNextMessageNumber((current) => current + 2);
    setMessages((current) => [...current, userMessage, assistantMessage]);
    streamAssistantText({
      timerRef: streamTimerRef,
      sourceText: assistantReply,
      onStart: () => setStreaming(true),
      onChunk: (nextText) => {
        setMessages((current) => updateAssistantTextPart(current, assistantMessageId, 0, nextText));
      },
      onComplete: () => setStreaming(false),
    });
  };

  return (
    <ChatPanel
      messages={messages}
      streaming={streaming}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      chatInputPlaceholder={chatInputPlaceholder}
      onSubmitMessage={handleSubmitMessage}
      actions={actions}
      repoMenu={repoMenu}
    />
  );
}

export const Empty: Story = {
  render: (args) => (
    <Box {...panelContainerStyles}>
      <MockChatPanelRenderer {...args} />
    </Box>
  ),
  args: {
    messages: [],
    streaming: false,
    emptyStateTitle: "No active conversations",
    emptyStateDescription: "Start a conversation to see messages here.",
    chatInputPlaceholder: "Type a message...",
    actions: defaultActions,
    repoMenu: defaultRepoMenu,
    onSubmitMessage: (text: string, attachments: string[]) => {
      console.log("Submitted", { text, attachments });
    },
  },
};

export const Conversation: Story = {
  render: (args) => (
    <Box {...panelContainerStyles}>
      <MockChatPanelRenderer {...args} />
    </Box>
  ),
  args: {
    ...Empty.args,
    messages: conversationMessages,
  },
};

function StreamingConversationRenderer(props: ChatPanelProps) {
  const {
    messages: allMessages = [],
    emptyStateTitle,
    emptyStateDescription,
    chatInputPlaceholder,
    actions,
    repoMenu,
  } = props;

  const [visibleMessages, setVisibleMessages] = useState<SessionMessage[]>([]);
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setVisibleMessages([]);
      setStreaming(true);

      for (const message of allMessages) {
        if (cancelled) return;

        const textPartEntries = message.parts
          .map((part, idx) => ({ part, idx }))
          .filter(({ part }) => isTextPart(part) && part.text.trim().length > 0);

        if (textPartEntries.length === 0) {
          setVisibleMessages((prev) => [...prev, message]);

          const pauseMs =
            message.role === "user" ? CONVERSATION_STREAM_MESSAGE_DELAY_MS : CONVERSATION_STREAM_STEP_DELAY_MS;

          await delay(pauseMs);
          continue;
        }

        const seeded: SessionMessage = {
          ...message,
          parts: message.parts.map((part, idx) =>
            textPartEntries.some((e) => e.idx === idx) && isTextPart(part) ? { ...part, text: "" } : part,
          ),
        };

        setVisibleMessages((prev) => [...prev, seeded]);

        for (const { part, idx } of textPartEntries) {
          if (cancelled) return;
          if (!isTextPart(part)) continue;

          const chunks = splitTextIntoChunks(part.text);
          let streamed = "";

          for (const chunk of chunks) {
            if (cancelled) return;

            streamed += chunk;
            const text = streamed;

            setVisibleMessages((prev) => updateAssistantTextPart(prev, message.id, idx, text));
            await delay(STREAM_INTERVAL_MS);
          }
        }

        await delay(CONVERSATION_STREAM_MESSAGE_DELAY_MS);
      }

      if (!cancelled) setStreaming(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [allMessages]);

  return (
    <ChatPanel
      messages={visibleMessages}
      streaming={streaming}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      chatInputPlaceholder={chatInputPlaceholder}
      actions={actions}
      repoMenu={repoMenu}
    />
  );
}

export const Streaming: Story = {
  render: (args) => (
    <Box {...panelContainerStyles}>
      <StreamingConversationRenderer {...args} />
    </Box>
  ),
  args: {
    ...Empty.args,
    messages: streamingMessages,
  },
};
