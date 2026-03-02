import { Box, Button, Menu, Stack } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, FileText, Folder, Settings, Star } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { MenuItem } from "./menu-item";

type StoryFn = () => ReactNode;
type MenuItemStoryArgs = ComponentProps<typeof MenuItem>;

const meta = {
  title: "Components/MenuItem",
  component: MenuItem,
  decorators: [
    (Story: StoryFn) => (
      <Box padding="sm" background="bg">
        <Story />
      </Box>
    ),
  ],
  args: {
    id: "reports",
    primaryLabel: "Reports",
    secondaryLabel: "Financial and tax summaries",
    tooltipLabel: "Open reports",
    leftIcon: FileText,
    rightIcon: ChevronRight,
  },
};

export default meta;

const renderMenuList = (children: ReactNode) => (
  <Menu.Root>
    <Stack
      width="20rem"
      gap="2px"
      padding="sm"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.muted"
      background="bg"
    >
      {children}
    </Stack>
  </Menu.Root>
);

const renderMenuItem = (args: MenuItemStoryArgs) => renderMenuList(<MenuItem {...args} />);

export const Default = {
  render: renderMenuItem,
};

export const WithTag = {
  args: {
    tagLabel: "WIP",
    tagColorPalette: "yellow",
  },
  render: renderMenuItem,
};

export const Selected = {
  args: {
    isSelected: true,
    rightIcon: Star,
  },
  render: renderMenuItem,
};

export const NoIcon = {
  args: {
    primaryLabel: "Activity log",
    secondaryLabel: "Latest updates",
    leftIcon: null,
    rightIcon: null,
  },
  render: renderMenuItem,
};

export const NoDescription = {
  args: {
    primaryLabel: "Invoices",
    secondaryLabel: undefined,
    tooltipLabel: undefined,
  },
  render: renderMenuItem,
};

export const Compact = {
  args: {
    variant: "compact",
    secondaryLabel: "Financial and tax summaries",
  },
  render: renderMenuItem,
};

export const Disabled = {
  args: {
    isDisabled: true,
    secondaryLabel: "Requires admin access",
  },
  render: renderMenuItem,
};

export const MenuList = {
  render: () =>
    renderMenuList(
      <>
        <MenuItem id="files" primaryLabel="Files" secondaryLabel="Recent uploads" leftIcon={Folder} />
        <MenuItem
          id="reports"
          primaryLabel="Reports"
          secondaryLabel="Financial and tax summaries"
          leftIcon={FileText}
          rightIcon={ChevronRight}
        />
        <MenuItem
          id="activity"
          primaryLabel="Activity log"
          secondaryLabel="Latest updates"
          leftIcon={null}
          rightIcon={null}
        />
        <MenuItem id="settings" primaryLabel="Settings" secondaryLabel="Workspace preferences" isSelected />
        <MenuItem id="locked" primaryLabel="Billing" secondaryLabel="Requires admin access" isDisabled />
      </>,
    ),
};

export const DropdownMenu = {
  render: () => (
    <Menu.Root defaultOpen>
      <Menu.Trigger asChild>
        <Button size="sm" variant="outline">
          Actions
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content minW="240px" bg="bg">
          <MenuItem
            id="sort"
            primaryLabel="Sort by"
            secondaryLabel="Newest first"
            tooltipLabel="Change sort order"
            leftIcon={ChevronDown}
          />
          <MenuItem id="duplicate" primaryLabel="Duplicate" secondaryLabel="Create a copy" leftIcon={FileText} />
          <MenuItem
            id="move"
            primaryLabel="Move to folder"
            secondaryLabel="Organize this item"
            leftIcon={Folder}
            rightIcon={ChevronRight}
          />
          <Menu.Separator />
          <MenuItem id="settings" primaryLabel="Settings" secondaryLabel={undefined} leftIcon={Settings} />
          <MenuItem id="archive" primaryLabel="Archive" secondaryLabel="Requires admin access" isDisabled />
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  ),
};
