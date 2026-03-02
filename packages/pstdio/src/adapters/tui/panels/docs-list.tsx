import { Box, Text } from "ink";

import type { DocRow } from "@/features/docs/types";
import { DocsItem } from "../components/docs-item";

interface DocsListProps {
  rows: DocRow[];
  selectedIndex: number;
  expanded: Set<string>;
  viewportHeight: number;
  scrollOffset: number;
  width: number;
}

export function DocsList({ rows, selectedIndex, expanded, viewportHeight, scrollOffset, width }: DocsListProps) {
  if (rows.length === 0) {
    return (
      <Box height={viewportHeight} alignItems="center" justifyContent="center">
        <Text dimColor>No docs found. Run pstdio init first.</Text>
      </Box>
    );
  }

  const visible = rows.slice(scrollOffset, scrollOffset + viewportHeight);
  const emptyLines = Math.max(0, viewportHeight - visible.length);

  const showScrollUp = scrollOffset > 0;
  const showScrollDown = scrollOffset + viewportHeight < rows.length;

  return (
    <Box flexDirection="column" height={viewportHeight}>
      {showScrollUp && (
        <Box justifyContent="center">
          <Text dimColor>{`  ▲ ${scrollOffset} more`}</Text>
        </Box>
      )}

      {visible.map((row, i) => (
        <DocsItem
          key={`${row.depth}-${row.item.text}`}
          row={row}
          isExpanded={expanded.has(row.item.text)}
          isSelected={scrollOffset + i === selectedIndex}
          width={width}
        />
      ))}

      {showScrollDown && (
        <Box justifyContent="center">
          <Text dimColor>{`  ▼ ${rows.length - scrollOffset - viewportHeight} more`}</Text>
        </Box>
      )}

      {emptyLines > 0 && <Box height={emptyLines} />}
    </Box>
  );
}
