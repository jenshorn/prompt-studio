import { Box, Button, Flex, Text } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DrawerInline, DrawerInlineBody, DrawerInlineFooter, DrawerInlineHeader } from "./drawer-inline";

const meta: Meta<typeof DrawerInline> = {
  title: "Components/DrawerInline",
  component: DrawerInline,
  decorators: [
    (Story) => (
      <Box height="500px" width="100%" p="md">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DrawerInline>;

export const Default: Story = {
  render: (args) => (
    <Flex height="100%" border="1px solid" borderColor="border.muted" borderRadius="md" overflow="hidden">
      <Box flex="1" p="md">
        <Text>Main Content Area</Text>
        <Text color="fg.muted" textStyle="label/XS">
          The drawer will appear to the right of this content.
        </Text>
      </Box>
      <DrawerInline {...args}>
        <DrawerInlineHeader title="Drawer Title" onClose={() => {}} />
        <DrawerInlineBody p="md">
          <Text>This is the drawer body content.</Text>
          <Text color="fg.muted">It has a vertical separator on the left and scrolls if the content is too long.</Text>
          {Array.from({ length: 10 }).map((_, i) => (
            <Box key={i} p="sm" bg="bg.muted" borderRadius="sm">
              Item {i + 1}
            </Box>
          ))}
        </DrawerInlineBody>
        <DrawerInlineFooter>
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button variant="solid" size="sm">
            Save
          </Button>
        </DrawerInlineFooter>
      </DrawerInline>
    </Flex>
  ),
  args: {
    open: true,
    width: "320px",
  },
};

export const WithActions: Story = {
  render: (args) => (
    <Flex height="100%" border="1px solid" borderColor="border.muted" borderRadius="md" overflow="hidden">
      <Box flex="1" p="md">
        <Text>Main Content Area</Text>
        <Text color="fg.muted" textStyle="label/XS">
          The drawer will appear to the right of this content.
        </Text>
      </Box>
      <DrawerInline {...args}>
        <DrawerInlineHeader
          title="Project Settings"
          onClose={() => {}}
          actions={
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          }
        />
        <DrawerInlineBody p="md">
          <Text textStyle="label/L/medium">General Settings</Text>
          <Box height="100px" bg="bg.muted" borderRadius="md" />
          <Text textStyle="label/L/medium">Advanced Settings</Text>
          <Box height="200px" bg="bg.muted" borderRadius="md" />
        </DrawerInlineBody>
      </DrawerInline>
    </Flex>
  ),
  args: {
    open: true,
    width: "400px",
  },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <Flex height="100%" border="1px solid" borderColor="border.muted" borderRadius="md" overflow="hidden">
        <Box flex="1" p="md">
          <Text mb="md">Main Content Area</Text>
          <Button onClick={() => setOpen(true)} size="sm">
            Open Drawer
          </Button>
        </Box>
        <DrawerInline {...args} open={open}>
          <DrawerInlineHeader title="Interactive Drawer" onClose={() => setOpen(false)} />
          <DrawerInlineBody p="md">
            <Text>Click the close icon in the header to close me.</Text>
            <Text color="fg.muted">
              The drawer is rendered inline with the main content, pushing it if necessary or simply occupying the
              assigned space.
            </Text>
          </DrawerInlineBody>
          <DrawerInlineFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DrawerInlineFooter>
        </DrawerInline>
      </Flex>
    );
  },
  args: {
    width: "320px",
  },
};
