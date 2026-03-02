import { Box, Collapsible, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { ChevronRight, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip } from "./tooltip";

export interface PropertyItem {
  label: string;
  description?: string;
  value: ReactNode;
}

export interface PropertiesProps {
  items: PropertyItem[];
  title?: string;
  defaultOpen?: boolean;
}

/**
 * A collapsible component that displays a list of properties.
 *
 * Each property has a label, an optional description (shown as a tooltip), and a value (ReactNode).
 * All labels have the same fixed width for alignment.
 */
export const Properties = (props: PropertiesProps) => {
  const { items, title, defaultOpen = true } = props;

  return (
    <Collapsible.Root defaultOpen={defaultOpen} width="full">
      <Collapsible.Trigger
        _hover={{
          background: "bg.muted",
        }}
        borderRadius={"xs"}
        padding="sm"
        height="2rem"
        display="flex"
        gap="2"
        alignItems="center"
        cursor="pointer"
      >
        {title && (
          <Text fontWeight="600" textStyle="label/S/medium">
            {title}
          </Text>
        )}
        <Collapsible.Indicator transition="transform 0.2s" _open={{ transform: "rotate(90deg)" }}>
          <ChevronRight size={16} />
        </Collapsible.Indicator>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Stack gap="sm" paddingLeft="sm" paddingY="xs">
          {items.map((item, index) => (
            <HStack key={`${item.label}-${index}`} gap="md" alignItems="center">
              <Box width="140px" flexShrink={0}>
                <HStack gap="1" alignItems="center">
                  <Text textStyle="label/S/medium" color="fg.muted">
                    {item.label}
                  </Text>
                  {item.description && (
                    <Tooltip content={item.description} showArrow>
                      <Icon as={Info} boxSize="12px" color="fg.muted" opacity={0.6} cursor="help" />
                    </Tooltip>
                  )}
                </HStack>
              </Box>
              <Box flex="1">{item.value}</Box>
            </HStack>
          ))}
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
