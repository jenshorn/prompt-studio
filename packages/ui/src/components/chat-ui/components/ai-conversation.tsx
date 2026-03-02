import type { HTMLChakraProps, IconButtonProps } from "@chakra-ui/react";
import { AbsoluteCenter, chakra, IconButton } from "@chakra-ui/react";
import { ArrowDownIcon } from "lucide-react";
import { StickToBottom as StickToBottomEl, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationRootProps = HTMLChakraProps<"div", React.ComponentProps<typeof StickToBottomEl>>;

export const conversationRootDefaultProps = {
  "aria-roledescription": "conversation",
  initial: "instant",
  resize: "instant",
  role: "log",
} as const;

export const ConversationRoot = chakra(
  StickToBottomEl,
  {
    base: {
      position: "relative",
      flex: 1,
      overflowY: "auto",
      height: "full",
    },
  },
  {
    forwardProps: ["resize"],
    defaultProps: conversationRootDefaultProps,
  },
);

export type ConversationContentProps = HTMLChakraProps<"div">;

export const ConversationContent = chakra(
  StickToBottomEl.Content,
  {
    base: {
      p: "0",
    },
  },
  {
    defaultProps: {
      "aria-live": "polite",
      role: "list",
    },
  },
);

export type ConversationScrollButtonProps = IconButtonProps;

export const ConversationScrollButton = (props: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <AbsoluteCenter axis="horizontal" bottom="md">
        <IconButton rounded="full" onClick={() => scrollToBottom()} variant="outline" size="xs" {...props}>
          <ArrowDownIcon size={16} />
        </IconButton>
      </AbsoluteCenter>
    )
  );
};

export const ChatPrimitives = {
  Root: ConversationRoot,
  Viewport: ConversationContent,
  ScrollToBottom: ConversationScrollButton,
} as const;
