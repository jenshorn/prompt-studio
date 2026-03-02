import { Box, Stack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Folder, Settings } from "lucide-react";
import { ItemSection } from "./item-section";
import { MenuItem } from "./menu-item";
import { PanelMenu } from "./panel-menu";

const meta: Meta<typeof PanelMenu> = {
  title: "Components/PanelMenu",
  component: PanelMenu,
  decorators: [
    (Story) => (
      <Box height="560px" bg="bg">
        <Story />
      </Box>
    ),
  ],
  args: {
    title: "Project",
  },
};

export default meta;

type Story = StoryObj<typeof PanelMenu>;

export const Default: Story = {};

export const WithSections: Story = {
  args: {
    title: "Resources",
    children: (
      <Stack gap="sm">
        <ItemSection title="Workspace">
          <MenuItem primaryLabel="Overview" leftIcon={FileText} />
          <MenuItem primaryLabel="Files" leftIcon={Folder} />
        </ItemSection>
        <ItemSection title="Settings">
          <MenuItem primaryLabel="Preferences" leftIcon={Settings} />
        </ItemSection>
      </Stack>
    ),
  },
};
