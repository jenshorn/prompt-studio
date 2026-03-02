const extensionToMediaType: Record<string, string> = {
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  md: "text/markdown",
  markdown: "text/markdown",
  txt: "text/plain",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  ts: "text/typescript",
  tsx: "text/typescript",
  js: "text/javascript",
  jsx: "text/javascript",
  sql: "text/x-sql",
  yml: "text/yaml",
  yaml: "text/yaml",
};

export function mediaTypeFromPath(path: string) {
  const cleaned = path.split("?")[0]?.split("#")[0] ?? "";
  const ext = cleaned.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return extensionToMediaType[ext] ?? null;
}
