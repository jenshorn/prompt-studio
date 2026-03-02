import "./data-table.css";

import {
  Button,
  Icon as ChakraIcon,
  chakra,
  Flex,
  IconButton,
  Menu,
  Portal,
  Separator,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ, CalendarClock, CheckCircle2, Hash, MoreVertical, Type, X } from "lucide-react";
import { isValidElement, type ReactElement, type ReactNode, useEffect, useState } from "react";
import { MenuItem } from "./menu-item";
import { NumberInputField, NumberInputRoot } from "./number-input";
import { Tooltip } from "./tooltip";

type ColumnType = "boolean" | "date" | "number" | "string" | "unknown";

export type RowData = Record<string, unknown>;

type DisplayValue = { display: ReactNode; sortValue?: unknown };
const isDisplayValue = (value: unknown): value is DisplayValue =>
  typeof value === "object" && value !== null && "display" in value;

export interface DataTableProps {
  data: RowData[];
  isReadOnly?: boolean;
  noBorder?: boolean;
  fullWidth?: boolean;
  onCSVUpload?: (csv: string) => Promise<void>;
  onCSVDownload?: (scenarios: string[]) => void;
  hiddenColumns?: string[];
  onRowClick?: (row: RowData) => void;
  isRowInteractive?: (row: RowData) => boolean;
  activeRowId?: string | null;
  columnIcons?: Partial<Record<string, ReactNode>>;
}

const columnHelper = createColumnHelper<RowData>();

const isString = (v: unknown): v is string => typeof v === "string" || v instanceof String;
const isNumber = (v: unknown): v is number => typeof v === "number" || v instanceof Number;
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean" || v instanceof Boolean;

const getType = (values: unknown[]): ColumnType => {
  const comparableValues = values
    .map((value) => {
      if (isDisplayValue(value)) {
        return value.sortValue ?? null;
      }

      if (value instanceof String || value instanceof Number || value instanceof Boolean) {
        return value.valueOf();
      }

      if (isValidElement(value)) {
        return null;
      }

      return value;
    })
    .filter((value) => value !== null && value !== undefined);

  if (comparableValues.length === 0) {
    return "unknown";
  }

  if (comparableValues.every((v) => isString(v) && !Number.isNaN(Date.parse(v.toString())))) {
    return "date";
  }
  if (comparableValues.every((v) => isNumber(v))) {
    return "number";
  }
  if (comparableValues.every((v) => isBoolean(v))) {
    return "boolean";
  }
  if (comparableValues.every((v) => isString(v))) {
    return "string";
  }
  return "unknown";
};

const headerIconProps = {
  boxSize: "14px",
  marginRight: "2px",
};

export const getIcon = (values: unknown[]): ReactElement | null => {
  const type = getType(values);
  if (type === "date") return <ChakraIcon as={CalendarClock} {...headerIconProps} />;
  if (type === "string") return <ChakraIcon as={Type} {...headerIconProps} />;
  if (type === "number") return <ChakraIcon as={Hash} {...headerIconProps} />;
  if (type === "boolean") return <ChakraIcon as={CheckCircle2} {...headerIconProps} />;
  return null;
};

export function formatDisplayValue(value: unknown): ReactNode {
  if (isDisplayValue(value)) {
    return value.display;
  }

  if (isValidElement(value)) {
    return value;
  }

  if (value instanceof String || value instanceof Number || value instanceof Boolean) {
    value = value.valueOf();
  }

  switch (typeof value) {
    case "boolean":
      return value ? "TRUE" : "FALSE";

    case "number":
      return value;

    case "object":
      return value !== null ? JSON.stringify(value) : "-";

    case "undefined":
      return "-";

    default:
      return value ? String(value) : "-";
  }
}

export const DataTable = (props: DataTableProps) => {
  const {
    data,
    noBorder,
    fullWidth,
    onCSVDownload,
    hiddenColumns,
    onRowClick,
    isRowInteractive,
    activeRowId,
    columnIcons,
  } = props;
  const [sorting, setSorting] = useState<SortingState>([]);
  const hiddenColumnsSet = new Set(hiddenColumns ?? []);
  const columnKeys = Object.keys(data[0] || {}).filter((key) => !hiddenColumnsSet.has(key));

  // Dynamically generate column definitions based on the keys in the first row of data
  const columns = [
    // Add custom column to show row number
    columnHelper.accessor((_row, rowIndex) => rowIndex + 1, {
      header: "",
      id: "rowIndex",
      enableResizing: false,
      size: 20,
      cell: (info) => (
        <chakra.span display={"block"} textStyle={"paragraph/S/regular"} textAlign={"center"}>
          {info.getValue()}
        </chakra.span>
      ),
    }),
    // Other columns generated dynamically based on data keys
    ...columnKeys.map((key) => {
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
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 150,
      minSize: 40,
      maxSize: 800,
    },
    state: {
      sorting,
    },
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: true,
    enableRowSelection: true,
    autoResetAll: true,
  });

  useEffect(() => {
    table.setPageSize(30);
  }, [table]);

  const columnSizeVars = (() => {
    const headers = table.getFlatHeaders();
    const colSizes: Record<string, number> = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;

      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }

    return colSizes;
  })();
  const totalPages = Math.max(table.getPageCount(), 1);
  const selectedRows = table.getSelectedRowModel().rows;
  const allRows = table.getCoreRowModel().rows;
  const selectedRowIds = selectedRows
    .map((row) => row.original.id)
    .filter((id): id is string => typeof id === "string");

  return (
    <Flex direction="column" height="100%" width="100%">
      {!!selectedRows.length && (
        <Flex alignItems="center" paddingY="2xs" paddingX="sm">
          <Stack direction="row" alignItems="center">
            <IconButton aria-label="clear-selection" onClick={() => table.toggleAllRowsSelected(false)} size="xs">
              <ChakraIcon as={X} boxSize="16px" />
            </IconButton>
            <Text>{selectedRows.length} rows selected</Text>
            {selectedRows.length !== allRows.length && (
              <Button onClick={() => table.toggleAllRowsSelected(true)}>Select all {allRows.length} rows</Button>
            )}
            <Separator orientation="vertical" />
            <Button onClick={() => onCSVDownload?.(selectedRowIds)}>Download CSV</Button>
          </Stack>
        </Flex>
      )}
      <Table.ScrollArea height="100%" overflowY="auto" overflowX="auto" maxWidth={"unset"}>
        <Table.Root
          className={`data-table${fullWidth ? " full-width" : ""}`}
          stickyHeader
          {...{
            style: {
              ...columnSizeVars,
              width: fullWidth ? "100%" : table.getTotalSize(),
            },
          }}
        >
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row
                background="bg.muted"
                key={headerGroup.id}
                borderRight={noBorder ? "none" : "1px solid"}
                borderColor="border.muted"
              >
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader
                    textTransform="none"
                    borderRight="1px solid"
                    _last={{ borderRight: "none" }}
                    borderColor="border.muted"
                    paddingX="xs"
                    paddingY="2xs"
                    key={header.id}
                    overflow={"hidden"}
                    position="relative"
                    style={{
                      width:
                        fullWidth && headerGroup.headers.indexOf(header) === headerGroup.headers.length - 1
                          ? undefined // Let the last column expand naturally with table width: 100%
                          : `calc(var(--header-${header?.id}-size) * 1px)`,
                    }}
                  >
                    <Tooltip content={flexRender(header.column.columnDef.header, header.getContext())}>
                      <Flex
                        className="group"
                        alignItems="center"
                        justifyContent="space-between"
                        gap="1"
                        flex="1"
                        paddingY="2xs"
                      >
                        <Text textStyle="label/S/medium">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        {header.column.id !== "rowIndex" && table.getCoreRowModel().rows.length > 1 && (
                          <Menu.Root>
                            <Menu.Trigger asChild>
                              <IconButton
                                ml="2px"
                                size="2xs"
                                aria-label="sort column"
                                variant="ghost"
                                visibility="hidden"
                                _groupHover={{ visibility: "visible" }}
                              >
                                <ChakraIcon as={MoreVertical} boxSize="14px" />
                              </IconButton>
                            </Menu.Trigger>
                            <Portal>
                              <Menu.Positioner>
                                <Menu.Content zIndex="popover" bg="bg">
                                  <MenuItem
                                    onClick={() => header.column.toggleSorting(false)}
                                    primaryLabel="Sort ascending"
                                    isDisabled={header.column.getIsSorted() === "asc"}
                                    leftIcon={ArrowUpAZ}
                                  />
                                  <MenuItem
                                    onClick={() => header.column.toggleSorting(true)}
                                    primaryLabel="Sort descending"
                                    isDisabled={header.column.getIsSorted() === "desc"}
                                    leftIcon={ArrowDownAZ}
                                  />
                                  {header.column.getIsSorted() && (
                                    <MenuItem onClick={() => header.column.clearSorting()} primaryLabel="Clear sort" />
                                  )}
                                </Menu.Content>
                              </Menu.Positioner>
                            </Portal>
                          </Menu.Root>
                        )}
                        {header.column.getCanResize() && (
                          <span
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`,
                            }}
                          />
                        )}
                      </Flex>
                    </Tooltip>
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => {
              const rowIsInteractive = onRowClick ? (isRowInteractive?.(row.original) ?? true) : false;

              return (
                <Table.Row
                  key={row.id}
                  cursor={rowIsInteractive ? "pointer" : undefined}
                  onClick={rowIsInteractive ? () => onRowClick?.(row.original) : undefined}
                  borderTop={noBorder ? "none" : "1px solid"}
                  borderBottom={"1px solid"}
                  borderRight={noBorder ? "none" : "1px solid"}
                  _last={{ borderBottom: noBorder ? "none" : "1px solid", borderColor: "border.muted" }}
                  borderColor="border.muted"
                  background={
                    activeRowId && typeof row.original.id === "string" && row.original.id === activeRowId
                      ? "bg.panel"
                      : "bg"
                  }
                  _hover={rowIsInteractive ? { background: "bg.panel" } : undefined}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <Table.Cell
                      width="fit-content"
                      maxWidth={"12rem"}
                      overflow={"hidden"}
                      padding="xs"
                      borderRight="1px solid"
                      borderColor="border.muted"
                      _last={{ borderRight: "none" }}
                      borderBottom="none"
                      key={cell.id}
                      textStyle="paragraph/S/regular"
                      background={index === 0 ? "bg.muted" : "inherit"}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {table.getPageCount() > 1 && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          borderTop="1px solid"
          borderColor={"border.muted"}
          paddingX="xs"
        >
          <Text>{table.getCoreRowModel().rows.length} rows</Text>
          <Stack alignItems="center" direction="row" justifyContent="flex-end" paddingY="xs">
            <Button size="xs" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              {"<<"}
            </Button>
            <Button size="xs" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              {"<"}
            </Button>
            <Button size="xs" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              {">"}
            </Button>
            <Button
              size="xs"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
            <Flex alignItems="center" height="100%" marginLeft="sm" marginRight="md" gap="xs">
              <Text>Page</Text>
              <NumberInputRoot
                margin="2xs"
                width="3rem"
                size="xs"
                min={1}
                max={totalPages}
                value={`${table.getState().pagination.pageIndex + 1}`}
                onValueChange={(details) => {
                  const next = Number.isNaN(details.valueAsNumber) ? 1 : details.valueAsNumber;
                  const clamped = Math.min(totalPages, Math.max(1, next));
                  table.setPageIndex(clamped - 1);
                }}
              >
                <NumberInputField className="nodrag" />
              </NumberInputRoot>
              <Text>of {totalPages}</Text>
            </Flex>
          </Stack>
        </Flex>
      )}
    </Flex>
  );
};
