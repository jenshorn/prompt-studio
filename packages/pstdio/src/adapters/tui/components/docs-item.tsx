import { Box, Text } from "ink";

import type { DocRow } from "@/features/docs/types";

interface DocsItemProps {
  row: DocRow;
  isExpanded: boolean;
  isSelected: boolean;
  width: number;
}

export function DocsItem({ row, isExpanded, isSelected, width }: DocsItemProps) {
  const indent = "  ".repeat(row.depth);
  const expandIcon = row.hasChildren ? (isExpanded ? "▾ " : "▸ ") : "  ";
  const icon = row.item.link ? "📄 " : "📁 ";

  const prefix = `${isSelected ? " ❯ " : "   "}${indent}${expandIcon}${icon}`;
  const title = row.item.text;
  const maxTitle = Math.max(0, width - prefix.length - 2);
  const displayed = title.length > maxTitle ? `${title.slice(0, maxTitle - 1)}…` : title;

  if (isSelected) {
    return (
      <Box>
        <Text backgroundColor="blue" color="white" bold>
          {" ❯ "}
          {indent}
          {expandIcon}
          {icon}
          {displayed}
          {"".padEnd(Math.max(0, width - prefix.length - displayed.length))}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text>
        {"   "}
        {indent}
        {expandIcon}
        <Text dimColor={!row.item.link}>{icon}</Text>
        <Text dimColor={!row.item.link}>{displayed}</Text>
      </Text>
    </Box>
  );
}
