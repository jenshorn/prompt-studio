import { Box, Stack } from "@chakra-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { type Diff, DiffCard } from "./diff-card";
import { EmptyState } from "./empty-state";

interface DiffDrawerProps {
  diffs: Diff[];
}

export type { Diff };

export function DiffDrawer(props: DiffDrawerProps) {
  const { diffs } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: diffs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 42,
    overscan: 5,
  });

  if (diffs.length === 0) {
    return (
      <Stack h="full" minH="0" gap="0">
        <Stack flex="1" minH="0" overflowY="auto" p="xs" gap="xs">
          <EmptyState title="No changes detected" description="Make some changes to see the diff here." paddingY="sm" />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack h="full" minH="0" gap="0">
      <Box position="relative" flex="1" minH="0">
        <Box ref={scrollRef} position="absolute" inset="0" overflowY="auto" p="xs">
          <Box position="relative" width="100%" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualItem) => (
              <Box
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                position="absolute"
                top="0"
                left="0"
                width="100%"
                pb="xs"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <DiffCard diff={diffs[virtualItem.index]} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
