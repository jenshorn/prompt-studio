import { Flex, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PanelMenuProps {
  title: string;
  children?: ReactNode;
}

export function PanelMenu(props: PanelMenuProps) {
  const { title, children } = props;

  return (
    <Stack borderRightWidth="1px" width="64" gap="0" minH="0">
      <Flex height="49px" p="xs" borderBottomWidth="1px" alignItems="center">
        <Text pb="0" textStyle="label/L/medium" color="fg.muted">
          {title}
        </Text>
      </Flex>

      {children && (
        <Stack p="xs" gap="xs" flex="1" minH="0" overflowY="auto">
          {children}
        </Stack>
      )}
    </Stack>
  );
}
