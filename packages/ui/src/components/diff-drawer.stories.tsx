import { Box, Flex } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { type Diff, DiffDrawer } from "./diff-drawer";

type StoryFn = () => ReactNode;

const sampleDiffs: Diff[] = [
  {
    change: "modified",
    oldPath: "src/index.ts",
    newPath: "src/index.ts",
    oldContent: `import { foo } from "./foo";\n\nconsole.log(foo);\n`,
    newContent: `import { foo, bar } from "./foo";\n\nconsole.log(foo);\nconsole.log(bar);\n`,
    additions: 2,
    deletions: 0,
  },
  {
    change: "added",
    newPath: "src/new-file.tsx",
    oldContent: "",
    newContent: `export const NewFile = () => {\n  return <div>New File</div>;\n};\n`,
    additions: 3,
    deletions: 0,
  },
  {
    change: "deleted",
    oldPath: "src/old-file.ts",
    oldContent: `export const old = true;\n`,
    newContent: "",
    additions: 0,
    deletions: 1,
  },
  {
    change: "renamed",
    oldPath: "src/utils.ts",
    newPath: "src/helpers.ts",
    oldContent: `export const util = () => {};\n`,
    newContent: `export const helper = () => {};\n`,
    additions: 1,
    deletions: 1,
  },
  {
    change: "modified",
    oldPath:
      "packages/very-long-directory-name-that-should-be-truncated-because-it-is-so-long/and-another-subdirectory/even-more-nesting/the-final-file-name-which-is-also-quite-long.ts",
    newPath:
      "packages/very-long-directory-name-that-should-be-truncated-because-it-is-so-long/and-another-subdirectory/even-more-nesting/the-final-file-name-which-is-also-quite-long.ts",
    oldContent: "// long path test\n",
    newContent: "// long path test - updated\n",
    additions: 1,
    deletions: 0,
  },
];

const meta: Meta<typeof DiffDrawer> = {
  title: "Components/DiffDrawer",
  component: DiffDrawer,
  decorators: [
    (Story: StoryFn) => (
      <Flex height="100vh" border="1px solid" borderColor="border.muted" borderRadius="md" overflow="hidden">
        <Box flex="1" p="md"></Box>
        <Box w="400px" h="full">
          <Story />
        </Box>
      </Flex>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DiffDrawer>;

export const Default: Story = {
  render: (args) => <DiffDrawer {...args} />,
  args: {
    diffs: sampleDiffs,
  },
};

export const SingleFile: Story = {
  render: (args) => <DiffDrawer {...args} />,
  args: {
    diffs: [sampleDiffs[0]],
  },
};

const changes: Diff["change"][] = ["modified", "added", "deleted", "renamed"];

const manyDiffs: Diff[] = Array.from({ length: 200 }, (_, i) => ({
  change: changes[i % changes.length],
  oldPath: `src/components/file-${i}.ts`,
  newPath: `src/components/file-${i}.ts`,
  oldContent: `// file ${i} original\nexport const value = ${i};\n`,
  newContent: `// file ${i} updated\nexport const value = ${i + 1};\n`,
  additions: 1,
  deletions: 1,
}));

export const ManyFiles: Story = {
  render: (args) => <DiffDrawer {...args} />,
  args: {
    diffs: manyDiffs,
  },
};
