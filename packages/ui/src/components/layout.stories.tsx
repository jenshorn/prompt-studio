import { Box, Button, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ContentPlaceholder } from "@/components/content-placeholder";
import { Layout, PanelLayout, PanelSectionLayout } from "./layout";

type StoryFn = () => ReactNode;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
    mutations: {
      retry: false,
    },
  },
});

interface PanelActions {
  primaryLabel: string;
  secondaryLabel: string;
}

interface PanelContentSection {
  id: string;
  title: string;
  description: string;
  placeholderHeight?: string;
}

interface PanelStoryPageProps {
  title: string;
  description: string;
  menuItems: string[];
  actions: PanelActions;
  contentSections: PanelContentSection[];
}

interface PanelStoryMenuProps {
  items: string[];
}

const PanelStoryMenu = (props: PanelStoryMenuProps) => {
  const { items } = props;

  return (
    <Stack gap="xs">
      {items.map((item) => (
        <Stack key={item} gap="2xs" p="xs" borderWidth="1px" borderRadius="md">
          <Text textStyle="label/M/medium">{item}</Text>
          <Text textStyle="paragraph/XS/regular" color="fg.muted">
            Quick links and filters live here inside the panel menu.
          </Text>
        </Stack>
      ))}
    </Stack>
  );
};

interface PanelSectionActionsProps {
  title: string;
  primaryLabel: string;
  secondaryLabel: string;
}

const PanelSectionActions = (props: PanelSectionActionsProps) => {
  const { title, primaryLabel, secondaryLabel } = props;

  return (
    <Flex width="100%" alignItems="center" gap="sm" flexWrap="wrap">
      <Stack gap="2xs">
        <Text textStyle="label/L/medium">{title}</Text>
      </Stack>
      <HStack gap="sm" ml="auto">
        <Button size="sm" variant="solid">
          {primaryLabel}
        </Button>
        <Button size="sm" variant="ghost">
          {secondaryLabel}
        </Button>
      </HStack>
    </Flex>
  );
};

interface PanelSectionContentProps {
  sections: PanelContentSection[];
}

const PanelSectionContent = (props: PanelSectionContentProps) => {
  const { sections } = props;

  return (
    <Stack flex="1" minH="0" width="100%" p="md" gap="lg" overflowY="auto">
      {sections.map((section) => (
        <Stack key={section.id} gap="md">
          <Stack gap="2xs">
            <Text textStyle="label/L/medium">{section.title}</Text>
            <Text textStyle="paragraph/XS/regular" color="fg.muted">
              {section.description}
            </Text>
          </Stack>
          <ContentPlaceholder minH={section.placeholderHeight ?? "260px"} borderRadius="md" />
        </Stack>
      ))}
    </Stack>
  );
};

const PanelStoryPage = (props: PanelStoryPageProps) => {
  const { title, menuItems, actions, contentSections } = props;

  return (
    <PanelLayout
      title={title}
      menuContent={<PanelStoryMenu items={menuItems} />}
      errorLabel={`Unable to render the ${title} panel.`}
    >
      <Stack gap="lg" height="100%" width="100%">
        <PanelSectionLayout
          actions={
            <PanelSectionActions
              title={`${title} workspace`}
              primaryLabel={actions.primaryLabel}
              secondaryLabel={actions.secondaryLabel}
            />
          }
          content={<PanelSectionContent sections={contentSections} />}
        />
      </Stack>
    </PanelLayout>
  );
};

const createPanelPage = (panelStoryProps: PanelStoryPageProps) => () => <PanelStoryPage {...panelStoryProps} />;

const filesPage = createPanelPage({
  title: "Files",
  description: "Browse uploads, assets, and artifacts across the Schub buckets.",
  menuItems: ["Inbox", "Archive", "Shared"],
  actions: { primaryLabel: "Upload file", secondaryLabel: "Refresh" },
  contentSections: [
    {
      id: "incoming",
      title: "Incoming uploads",
      description: "Newly added files ready for ingestion.",
      placeholderHeight: "360px",
    },
    {
      id: "processing",
      title: "Processing queue",
      description: "Jobs running extraction or cleanup.",
      placeholderHeight: "240px",
    },
    {
      id: "library",
      title: "Library",
      description: "Previously processed documents and assets.",
      placeholderHeight: "320px",
    },
  ],
});

const pipelinesPage = createPanelPage({
  title: "Pipelines",
  description: "Configure workflows, versions, and execution targets.",
  menuItems: ["Active pipelines", "Drafts", "Retired"],
  actions: { primaryLabel: "New pipeline", secondaryLabel: "Import" },
  contentSections: [
    {
      id: "versions",
      title: "Current versions",
      description: "Rollouts and approvals for each pipeline.",
      placeholderHeight: "300px",
    },
    {
      id: "runs",
      title: "Recent runs",
      description: "Latest executions with status and outputs.",
      placeholderHeight: "260px",
    },
    {
      id: "approvals",
      title: "Approval queue",
      description: "Changes awaiting review before shipping.",
      placeholderHeight: "220px",
    },
  ],
});

const jobsPage = createPanelPage({
  title: "Jobs",
  description: "Track status and outputs for each processing run.",
  menuItems: ["Running", "Completed", "Failed"],
  actions: { primaryLabel: "Create job", secondaryLabel: "Retry failed" },
  contentSections: [
    {
      id: "live",
      title: "Live jobs",
      description: "Active runs streaming logs and metrics.",
      placeholderHeight: "340px",
    },
    {
      id: "history",
      title: "History",
      description: "Completed work with artifacts and summaries.",
      placeholderHeight: "280px",
    },
    {
      id: "alerts",
      title: "Alerts",
      description: "Failures that need your attention.",
      placeholderHeight: "200px",
    },
  ],
});

const extractionPage = createPanelPage({
  title: "Extraction",
  description: "Manage schemas, previews, and extraction templates.",
  menuItems: ["Schemas", "Previews", "Mappings"],
  actions: { primaryLabel: "New schema", secondaryLabel: "Run preview" },
  contentSections: [
    {
      id: "schemas",
      title: "Schemas",
      description: "Fields and validation rules for incoming data.",
      placeholderHeight: "260px",
    },
    {
      id: "previews",
      title: "Previews",
      description: "Sample documents and rendered results.",
      placeholderHeight: "320px",
    },
    {
      id: "templates",
      title: "Templates",
      description: "Reusable extraction logic across datasets.",
      placeholderHeight: "240px",
    },
  ],
});

const evalsPage = createPanelPage({
  title: "Evals",
  description: "Review evals, datasets, and validation runs.",
  menuItems: ["Datasets", "Runs", "Reports"],
  actions: { primaryLabel: "New eval", secondaryLabel: "Refresh" },
  contentSections: [
    {
      id: "datasets",
      title: "Datasets",
      description: "Collections of labeled documents for checks.",
      placeholderHeight: "300px",
    },
    {
      id: "runs",
      title: "Eval runs",
      description: "Execution history across evaluators.",
      placeholderHeight: "260px",
    },
    {
      id: "reports",
      title: "Reports",
      description: "Metrics, charts, and downloadable summaries.",
      placeholderHeight: "340px",
    },
  ],
});

const rootRoute = createRootRoute({
  component: Layout,
});

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "files",
  component: filesPage,
});

const pipelinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "pipelines",
  component: pipelinesPage,
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "jobs",
  component: jobsPage,
});

const extractionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "extraction",
  component: extractionPage,
});

const evalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "evals",
  component: evalsPage,
});

const routeTree = rootRoute.addChildren([filesRoute, pipelinesRoute, jobsRoute, extractionRoute, evalsRoute]);

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/files"] }),
});

const meta = {
  title: "Components/Layout",
  component: Layout,
  decorators: [
    (Story: StoryFn) => (
      <QueryClientProvider client={queryClient}>
        <Box height="100vh" background="bg" display="flex" flexDirection="column" overflow="hidden">
          <Story />
        </Box>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AppShell = {
  render: () => <RouterProvider router={router} />,
};
