import { Icon as ChakraIcon } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { CalendarClock, CheckCircle2, Hash, Type } from "lucide-react";
import { isValidElement, type ReactElement, type ReactNode } from "react";

import type { ColumnType, DisplayValue, RowData } from "./types";

export const isDisplayValue = (value: unknown): value is DisplayValue =>
  typeof value === "object" && value !== null && "display" in value;

export const isString = (v: unknown): v is string => typeof v === "string" || v instanceof String;
export const isNumber = (v: unknown): v is number => typeof v === "number" || v instanceof Number;
export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean" || v instanceof Boolean;

export const getType = (values: unknown[]): ColumnType => {
  const comparableValues = values
    .map((value) => {
      if (isDisplayValue(value)) return value.sortValue ?? null;
      if (value instanceof String || value instanceof Number || value instanceof Boolean) return value.valueOf();
      if (isValidElement(value)) return null;
      return value;
    })
    .filter((value) => value !== null && value !== undefined);

  if (comparableValues.length === 0) return "unknown";
  if (comparableValues.every((v) => isString(v) && !Number.isNaN(Date.parse(v.toString())))) return "date";
  if (comparableValues.every((v) => isNumber(v))) return "number";
  if (comparableValues.every((v) => isBoolean(v))) return "boolean";
  if (comparableValues.every((v) => isString(v))) return "string";
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
  if (isDisplayValue(value)) return value.display;
  if (isValidElement(value)) return value;

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

export const columnHelper = createColumnHelper<RowData>();
