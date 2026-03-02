import { HStack, type StackProps } from "@chakra-ui/react";

interface HorizontalMenuStackProps extends StackProps {
  children?: StackProps["children"];
}

export function HorizontalMenuStack(props: HorizontalMenuStackProps) {
  const { children, ...rest } = props;

  return (
    <HStack {...rest} minH="49px" justify="space-between" align="center" borderBottomWidth="1px" p="xs">
      {children}
    </HStack>
  );
}
