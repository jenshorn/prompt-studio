import { Badge, Box, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useState } from "react";

import { type FileTreeItem, mapFilesById } from "@/components/file-tree-helpers";
import { FileSelector } from "./file-selector";

type StoryFn = () => ReactNode;

const fileTree: FileTreeItem[] = [
  {
    id: "sample-raw",
    name: "sample-raw",
    type: "folder",
    meta: "4 items",
    children: [
      {
        id: "sample-raw/invoices",
        name: "invoices",
        type: "folder",
        meta: "2 items",
        children: [
          {
            id: "sample-raw/invoices/2024-05.pdf",
            name: "2024-05.pdf",
            type: "file",
            meta: "1.4 MB · May 2, 2024",
          },
          {
            id: "sample-raw/invoices/2024-06.pdf",
            name: "2024-06.pdf",
            type: "file",
            meta: "1.1 MB · Jun 4, 2024",
          },
        ],
      },
      {
        id: "sample-raw/receipts",
        name: "receipts",
        type: "folder",
        meta: "1 item",
        children: [
          {
            id: "sample-raw/receipts/ameris.csv",
            name: "ameris.csv",
            type: "file",
            meta: "120 KB · Apr 1, 2024",
          },
        ],
      },
      {
        id: "sample-raw/notes.md",
        name: "notes.md",
        type: "file",
        meta: "6 KB · Apr 8, 2024",
      },
    ],
  },
  {
    id: "sample-artifacts",
    name: "sample-artifacts",
    type: "folder",
    meta: "2 items",
    children: [
      {
        id: "sample-artifacts/run-042",
        name: "run-042",
        type: "folder",
        meta: "1 item",
        children: [
          {
            id: "sample-artifacts/run-042/output.json",
            name: "output.json",
            type: "file",
            meta: "48 KB · May 8, 2024",
          },
        ],
      },
      {
        id: "sample-artifacts/summary.json",
        name: "summary.json",
        type: "file",
        meta: "12 KB · May 10, 2024",
      },
    ],
  },
];

const initialCheckedIds = ["sample-raw/invoices/2024-05.pdf", "sample-raw/notes.md"];
const filesById = mapFilesById(fileTree);
const initialSelectedFiles = initialCheckedIds.flatMap((id) => {
  const file = filesById.get(id);

  return file ? [file] : [];
});

const meta = {
  title: "Components/FileSelector",
  component: FileSelector,
  decorators: [
    (Story: StoryFn) => (
      <Box padding="sm" background="bg">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const Default = {
  render: () => {
    const [checkedFileIds, setCheckedFileIds] = useState<string[]>(initialCheckedIds);
    const [selectedFiles, setSelectedFiles] = useState<FileTreeItem[]>(initialSelectedFiles);

    const handleCheckedFilesChange = (files: FileTreeItem[]) => {
      setSelectedFiles(files);

      setCheckedFileIds(files.map((file) => file.id));
    };

    return (
      <Stack gap="md" maxWidth="420px">
        <FileSelector
          files={fileTree}
          label="Raw bucket files"
          checkedFileIds={checkedFileIds}
          maxHeight="280px"
          onCheckedFilesChange={handleCheckedFilesChange}
        />
        <Stack gap="xs">
          <Text textStyle="paragraph/XS/regular" color="fg.muted">
            Selected files ({selectedFiles.length})
          </Text>
          {selectedFiles.length === 0 ? (
            <Text textStyle="paragraph/S/regular">None</Text>
          ) : (
            <Stack gap="xs">
              {selectedFiles.map((file) => (
                <Badge key={file.id} variant="subtle" colorPalette="blue">
                  {file.name}
                </Badge>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  },
};

export const Loading = {
  render: () => (
    <Box maxWidth="420px">
      <FileSelector files={fileTree} label="Raw bucket files" isLoading maxHeight="280px" />
    </Box>
  ),
};

export const Empty = {
  render: () => (
    <Box maxWidth="420px">
      <FileSelector files={[]} label="Raw bucket files" emptyLabel="No files in this bucket yet." maxHeight="280px" />
    </Box>
  ),
};
