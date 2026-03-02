import { Box, Table, Text, Textarea } from "@chakra-ui/react";
import type { CodeEditorProps, DataTableProps } from "../types/rich-text-components";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.length ? value : "-";
  if (typeof value === "number" || typeof value === "boolean") return String(value).toUpperCase();
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
};

export const DefaultRichTextCodeEditor = (props: CodeEditorProps) => {
  const { defaultCode = "", isEditable = false, showLineNumbers = false, disableScroll = false } = props;

  if (isEditable) {
    return <Textarea defaultValue={defaultCode} fontFamily="mono" fontSize="sm" resize="vertical" minHeight="100%" />;
  }

  const lines = showLineNumbers ? defaultCode.split("\n") : [defaultCode];

  return (
    <Box
      as="pre"
      margin={0}
      padding="sm"
      fontFamily="mono"
      fontSize="sm"
      lineHeight="1.5"
      overflowY={disableScroll ? "hidden" : "auto"}
      background="bg.muted"
      borderRadius="md"
      width="100%"
    >
      {showLineNumbers ? (
        <Box as="code" display="grid" gridTemplateColumns="auto 1fr" columnGap="sm">
          {lines.map((line, index) => (
            <Box as="span" key={`${index}-${line}`} display="contents">
              <Text as="span" color="fg.muted" textAlign="right">
                {index + 1}
              </Text>
              <Text as="span">{line.length ? line : " "}</Text>
            </Box>
          ))}
        </Box>
      ) : (
        <Box as="code">{defaultCode}</Box>
      )}
    </Box>
  );
};

export const DefaultRichTextDataTable = (props: DataTableProps) => {
  const { data, fullWidth = false, noBorder = false, hiddenColumns = [] } = props;

  if (!data.length) {
    return (
      <Box padding="sm" borderWidth={noBorder ? "0" : "1px"} borderColor="border.muted">
        <Text textStyle="label/S/regular" color="fg.muted">
          No data
        </Text>
      </Box>
    );
  }

  const hiddenSet = new Set(hiddenColumns);
  const columns = Object.keys(data[0] ?? {}).filter((key) => !hiddenSet.has(key));

  return (
    <Table.ScrollArea overflowX="auto" maxWidth="100%">
      <Table.Root
        size="sm"
        width={fullWidth ? "100%" : "fit-content"}
        borderWidth={noBorder ? "0" : "1px"}
        borderColor="border.muted"
      >
        <Table.Header>
          <Table.Row background="bg.muted">
            {columns.map((column) => (
              <Table.ColumnHeader key={column} textTransform="none" paddingX="xs" paddingY="2xs">
                <Text textStyle="label/S/medium">{column}</Text>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, rowIndex) => (
            <Table.Row key={`${rowIndex}-${columns.join("-")}`}>
              {columns.map((column) => (
                <Table.Cell key={`${rowIndex}-${column}`} paddingX="xs" paddingY="2xs">
                  <Text textStyle="paragraph/S/regular">{formatValue(row[column])}</Text>
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};
