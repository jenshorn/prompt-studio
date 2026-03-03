import { chakra, Text } from "@chakra-ui/react";
import { isValidElement, type ReactNode } from "react";

import { columnHelper, formatDisplayValue, getIcon, isDisplayValue } from "./helpers";
import type { RowData } from "./types";

export function buildColumns(data: RowData[], columnKeys: string[], columnIcons?: Partial<Record<string, ReactNode>>) {
  const rowIndexColumn = columnHelper.accessor((_row, rowIndex) => rowIndex + 1, {
    header: "",
    id: "rowIndex",
    enableResizing: false,
    size: 20,
    cell: (info) => (
      <chakra.span display={"block"} textStyle={"paragraph/S/regular"} textAlign={"center"}>
        {info.getValue()}
      </chakra.span>
    ),
  });

  const dataColumns = columnKeys.map((key) => {
    const fallBackKey = key || "-";
    const columnValues = data.map((row) => row[fallBackKey]);
    const customIcon = columnIcons?.[fallBackKey];
    const headerIcon = customIcon === undefined ? getIcon(columnValues) : customIcon;

    return columnHelper.accessor((row) => row[fallBackKey], {
      id: fallBackKey,
      header: () => {
        if (!headerIcon) return fallBackKey;
        return (
          <chakra.span display="inline-flex" alignItems="center" gap="4px">
            {headerIcon}
            <chakra.span>{fallBackKey}</chakra.span>
          </chakra.span>
        );
      },
      cell: (info) => {
        const value = info.getValue();
        const displayValue = formatDisplayValue(value);
        if (isValidElement(displayValue)) {
          return (
            <chakra.span display="inline-flex" maxWidth="full">
              {displayValue}
            </chakra.span>
          );
        }
        return (
          <Text width="fit-content" textStyle="paragraph/S/regular">
            {displayValue}
          </Text>
        );
      },
      sortingFn: (rowA, rowB) => {
        const valueA = isDisplayValue(rowA.original[fallBackKey])
          ? rowA.original[fallBackKey].sortValue
          : rowA.original[fallBackKey];
        const valueB = isDisplayValue(rowB.original[fallBackKey])
          ? rowB.original[fallBackKey].sortValue
          : rowB.original[fallBackKey];

        if (valueA === valueB) return 0;
        if (valueA === null || valueA === undefined) return 1;
        if (valueB === null || valueB === undefined) return -1;

        if (typeof valueA === "number" && typeof valueB === "number") {
          return valueA - valueB;
        }

        return String(valueA).localeCompare(String(valueB));
      },
    });
  });

  return [rowIndexColumn, ...dataColumns];
}
