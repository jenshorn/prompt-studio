import { useEffect, useState } from "react";

const clampIndex = (index: number, length: number) => {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
};

const computeScrollOffset = (index: number, currentOffset: number, viewportHeight: number) => {
  if (index < currentOffset) return index;
  if (index >= currentOffset + viewportHeight) return index - viewportHeight + 1;
  return currentOffset;
};

export function useSelection(rowCount: number, viewportHeight: number) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const moveTo = (next: number) => {
    const clamped = clampIndex(next, rowCount);
    setSelectedIndex(clamped);
    setScrollOffset((offset) => computeScrollOffset(clamped, offset, viewportHeight));
  };

  const resetSelection = () => {
    setSelectedIndex(0);
    setScrollOffset(0);
  };

  useEffect(() => {
    setSelectedIndex((prev) => {
      const clamped = clampIndex(prev, rowCount);
      setScrollOffset((offset) => computeScrollOffset(clamped, offset, viewportHeight));
      return clamped;
    });
  }, [rowCount, viewportHeight]);

  return { selectedIndex, scrollOffset, moveTo, resetSelection };
}
