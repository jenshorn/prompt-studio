import type { ReactNode } from "react";

export type ColumnType = "boolean" | "date" | "number" | "string" | "unknown";

export type RowData = Record<string, unknown>;

export type DisplayValue = { display: ReactNode; sortValue?: unknown };

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
