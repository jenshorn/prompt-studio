import type { ResourceType } from "../types";

export function inferResourceTypeFromMediaType(mediaType: string) {
  const normalized = mediaType.toLowerCase().trim();
  if (!normalized) return "text";

  if (normalized.startsWith("image/")) return "image";
  if (normalized === "application/pdf") return "pdf";
  if (normalized === "text/markdown") return "markdown";
  if (normalized === "text/csv" || normalized === "text/tab-separated-values") return "table";
  if (normalized === "application/json") return "json";
  if (normalized.startsWith("text/")) return "text";
  if (normalized.startsWith("application/")) return "text";

  const fallback: ResourceType = "text";
  return fallback;
}
