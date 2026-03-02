import { Box, Stack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import type { SessionMessage } from "../agent-types";
import rawConversationMessages from "../mocks/full-conversation-normalized.json";
import { ChatPrimitives } from "./ai-conversation";
import { ChatMessage } from "./ai-message";
import { MessagePartsRenderer } from "./message-parts-renderer";
import { getMessageOrigin, mergeReasoningToolOnlyMessages } from "./message-types";

const conversationMessages = rawConversationMessages as unknown as SessionMessage[];

const meta: Meta<typeof ChatPrimitives.Root> = {
  title: "Chat UI/AI Conversation",
  component: ChatPrimitives.Root,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ChatPrimitives.Root>;

const storyMessages = mergeReasoningToolOnlyMessages(conversationMessages).slice(-18);

const ConversationPreview = () => {
  return (
    <Box h="640px" maxW="960px" w="full" borderWidth="1px" borderRadius="md" bg="bg" overflow="hidden">
      <ChatPrimitives.Root>
        <ChatPrimitives.Viewport>
          <Stack gap="sm">
            {storyMessages.map((message) => (
              <ChatMessage.Root key={message.id} from={getMessageOrigin(message.role)}>
                <ChatMessage.Content from={getMessageOrigin(message.role)}>
                  <MessagePartsRenderer message={message} />
                </ChatMessage.Content>
              </ChatMessage.Root>
            ))}
          </Stack>
        </ChatPrimitives.Viewport>
        <ChatPrimitives.ScrollToBottom aria-label="Scroll to latest message" />
      </ChatPrimitives.Root>
    </Box>
  );
};

export const FullConversationPreview: Story = {
  render: () => <ConversationPreview />,
};
