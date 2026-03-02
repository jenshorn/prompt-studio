import { useEffect, useRef } from "react";
import { useStickToBottomContext } from "use-stick-to-bottom";

export interface AutoScrollProps {
  userMessageCount: number;
}

interface ShouldAutoScrollArgs {
  previousUserMessageCount: number;
  userMessageCount: number;
}

export const shouldAutoScroll = (args: ShouldAutoScrollArgs) => {
  const { previousUserMessageCount, userMessageCount } = args;

  if (previousUserMessageCount === 0) {
    return false;
  }

  return userMessageCount > previousUserMessageCount;
};

export function AutoScroll(props: AutoScrollProps) {
  const { userMessageCount } = props;
  const { scrollToBottom } = useStickToBottomContext();
  const previousCountRef = useRef(userMessageCount);

  useEffect(() => {
    if (
      shouldAutoScroll({
        previousUserMessageCount: previousCountRef.current,
        userMessageCount,
      })
    ) {
      scrollToBottom();
    }

    previousCountRef.current = userMessageCount;
  }, [userMessageCount, scrollToBottom]);

  return null;
}
