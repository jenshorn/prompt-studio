import type { LucideIcon } from "lucide-react";
import {
  File,
  FileArchive,
  FileChartLine,
  FileCode,
  FileCog,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export const getFileTypeIcon = (filename: string): LucideIcon => {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";

  if (["csv", "tsv", "xlsx", "xls", "parquet"].includes(extension)) return FileSpreadsheet;
  if (
    [
      "sql",
      "py",
      "js",
      "ts",
      "jsx",
      "tsx",
      "java",
      "cpp",
      "c",
      "h",
      "css",
      "scss",
      "sass",
      "php",
      "rb",
      "go",
      "rs",
      "kt",
      "swift",
    ].includes(extension)
  ) {
    return FileCode;
  }
  if (["json", "jsonl", "ndjson"].includes(extension)) {
    if (filename.includes("/visualizations/")) return FileChartLine;
    return FileJson;
  }
  if (["md", "txt", "rst", "org", "pdf", "doc", "docx", "rtf"].includes(extension)) return FileText;
  if (["yaml", "yml", "toml", "ini", "conf", "config"].includes(extension)) return FileCog;
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(extension)) return FileImage;
  if (["zip", "tar", "gz", "rar", "7z"].includes(extension)) return FileArchive;
  return File;
};
