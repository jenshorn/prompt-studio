import { Box, Button, HStack, Separator, Stack, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Properties } from "./properties";

type StoryFn = () => ReactNode;

const meta = {
  title: "Components/Properties",
  component: Properties,
  decorators: [
    (Story: StoryFn) => (
      <Box padding="lg" background="bg" minWidth="600px">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const Default = {
  render: () => (
    <Properties
      title="Project Settings"
      items={[
        {
          label: "Project Name",
          description: "The unique identifier for this project",
          value: (
            <Button size="sm" variant="ghost">
              <Info />
              My Cool Project
            </Button>
          ),
        },
        {
          label: "Visibility",
          description: "Who can see this project",
          value: (
            <HStack gap="sm">
              <Button size="sm" variant="outline">
                Public
              </Button>
              <Button size="sm" variant="ghost">
                Change
              </Button>
            </HStack>
          ),
        },
        {
          label: "Version",
          value: <Text>1.0.0</Text>,
        },
        {
          label: "Actions",
          description: "Dangerous operations",
          value: (
            <Button size="sm" variant="outline" colorPalette="red">
              Delete Project
            </Button>
          ),
        },
      ]}
    />
  ),
};

export const Collapsed = {
  render: () => (
    <Properties
      title="Advanced Configuration"
      defaultOpen={false}
      items={[
        {
          label: "API Endpoint",
          value: <Text>https://api.example.com/v1</Text>,
        },
        {
          label: "Timeout",
          value: <Text>30000ms</Text>,
        },
      ]}
    />
  ),
};

export const MultipleInStack = {
  render: () => (
    <Stack gap="md">
      <Properties
        title="General Information"
        items={[
          { label: "Author", value: <Text>John Doe</Text> },
          { label: "License", value: <Text>MIT</Text> },
        ]}
      />
      <Separator />
      <Properties
        title="Repository Details"
        items={[
          { label: "Git URL", value: <Text>git@github.com:user/repo.git</Text> },
          { label: "Branch", value: <Text>main</Text> },
        ]}
      />
    </Stack>
  ),
};
