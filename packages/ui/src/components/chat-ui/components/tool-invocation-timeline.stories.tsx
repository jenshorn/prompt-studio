import { Box } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import type { SessionMessage, ToolPart } from "../agent-types";
import rawConversationMessages from "../mocks/full-conversation-normalized.json";
import { ToolInvocationTimeline } from "./tool-invocation-timeline";

const conversationMessages = rawConversationMessages as unknown as SessionMessage[];

const toolInvocations = conversationMessages
  .flatMap((message) => message.parts ?? [])
  .filter((part): part is ToolPart => part.type === "tool")
  .slice(0, 10);

const meta: Meta<typeof ToolInvocationTimeline> = {
  title: "Chat UI/Tool Invocation Timeline",
  component: ToolInvocationTimeline,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ToolInvocationTimeline>;

export const FromConversationData: Story = {
  render: () => (
    <Box maxW="960px" w="full" borderWidth="1px" borderRadius="md" bg="bg" p="md">
      <ToolInvocationTimeline invocations={toolInvocations} />
    </Box>
  ),
};
