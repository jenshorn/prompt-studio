import { Badge, Box, Button, HStack, Icon, Menu, Text } from "@chakra-ui/react";
import { MoreHorizontal, PlayIcon, Settings, ShieldCheck, Sparkles } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { InfoCard } from "./info-card";
import { MenuItem } from "./menu-item";

type StoryFn = () => ReactNode;
type InfoCardArgs = ComponentProps<typeof InfoCard>;

const meta = {
  title: "Components/InfoCard",
  component: InfoCard,
  decorators: [
    (Story: StoryFn) => (
      <Box padding="sm" background="bg">
        <Story />
      </Box>
    ),
  ],
  args: {
    title: "Fraud review pipeline",
    description: "Checks incoming claims against historical activity for anomalies.",
    infoItems: [
      { label: "Created", value: "Sep 18, 2024" },
      { label: "Updated", value: "Oct 2, 2024" },
    ],
  },
};

export default meta;

export const Default = {
  render: (args: InfoCardArgs) => (
    <Box maxWidth="520px">
      <InfoCard {...args} />
    </Box>
  ),
};

export const WithActions = {
  render: (args: InfoCardArgs) => {
    const actions = [
      <Button key="run" size="md" variant="solid">
        <HStack gap="2px">
          <Icon as={PlayIcon} boxSize="18px" />
          <Text>Run</Text>
        </HStack>
      </Button>,
      <Menu.Root key="options">
        <Menu.Trigger asChild>
          <Button size="md" variant="outline" aria-label="Options menu">
            <Icon as={MoreHorizontal} boxSize="18px" />
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minW="240px" bg="bg">
            <MenuItem
              id="favorite"
              primaryLabel="Feature pipeline"
              secondaryLabel="Pin to overview"
              leftIcon={Sparkles}
            />
            <MenuItem
              id="restrict"
              primaryLabel="Restrict access"
              secondaryLabel="Limit to admins"
              leftIcon={ShieldCheck}
            />
            <Menu.Separator />
            <MenuItem
              id="settings"
              primaryLabel="Pipeline settings"
              secondaryLabel="Configure inputs and outputs"
              leftIcon={Settings}
            />
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>,
    ];

    return (
      <Box maxWidth="520px">
        <InfoCard {...args} actions={actions} />
      </Box>
    );
  },
};

export const WithBadge = {
  args: {
    badge: (
      <Badge size="lg" variant="subtle" colorPalette="blue">
        Pipeline
      </Badge>
    ),
  },
  render: (args: InfoCardArgs) => (
    <Box maxWidth="520px">
      <InfoCard {...args} />
    </Box>
  ),
};

export const LongCopy = {
  args: {
    title: "Northwind Traders Q4 validation",
    description:
      "Monthly invoice and credit memo validation set with regional edge cases, multi-currency rounding, and fallback parsing rules.",
    infoItems: [
      { label: "Rows", value: "1,248" },
      { label: "Coverage", value: "85%" },
    ],
  },
  render: (args: InfoCardArgs) => (
    <Box maxWidth="520px">
      <InfoCard {...args} />
    </Box>
  ),
};
