import type { TitleSegment } from "../components/timeline";

export type FileChange = { filePath: string; additions: number; deletions: number };

export function basenameSafe(path: string) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(idx + 1) : path;
}

function normalizeHeaderPath(input?: string | null) {
  if (!input) return null;

  const token = input.split("\t")[0].trim();
  if (token === "/dev/null") return null;

  let normalized = token;
  if (normalized.startsWith("a/") || normalized.startsWith("b/")) {
    normalized = normalized.slice(2);
  }

  return normalized.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function parseUnifiedDiff(diffText?: string) {
  if (!diffText || typeof diffText !== "string") return [] as FileChange[];

  const changes = new Map<string, { additions: number; deletions: number }>();
  let currentPath: string | null = null;
  let lastMinusHeader: string | null = null;
  let inHunk = false;

  const lines = diffText.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("--- ")) {
      lastMinusHeader = normalizeHeaderPath(line.slice(4));
      inHunk = false;
      continue;
    }

    if (line.startsWith("+++ ")) {
      const plusPath = normalizeHeaderPath(line.slice(4));
      currentPath = plusPath ?? lastMinusHeader;
      if (currentPath && !changes.has(currentPath)) {
        changes.set(currentPath, { additions: 0, deletions: 0 });
      }
      inHunk = false;
      continue;
    }

    if (!currentPath) continue;

    if (line.startsWith("@@")) {
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith("+") && !(line.startsWith("+++ ") || line === "+++")) {
      const current = changes.get(currentPath);
      if (current) current.additions += 1;
      continue;
    }

    if (line.startsWith("-") && !(line.startsWith("--- ") || line === "---")) {
      const current = changes.get(currentPath);
      if (current) current.deletions += 1;
    }
  }

  return Array.from(changes.entries()).map(([filePath, { additions, deletions }]) => ({
    filePath,
    additions,
    deletions,
  }));
}

export function buildDiffTitleSegments(diffText?: string) {
  return parseUnifiedDiff(diffText).map(
    (file) =>
      ({
        kind: "diff",
        fileName: basenameSafe(file.filePath),
        filePath: file.filePath,
        additions: file.additions,
        deletions: file.deletions,
      }) satisfies TitleSegment,
  );
}

export function extractDiffFilePaths(diffText?: string) {
  return parseUnifiedDiff(diffText).map((file) => file.filePath);
}

export type FileDiffPreview = { filePath: string; original: string; modified: string };

export function buildFileDiffPreviews(diffText?: string) {
  if (!diffText || typeof diffText !== "string") return [] as FileDiffPreview[];

  const lines = diffText.split(/\r?\n/);
  const previews: FileDiffPreview[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] || "";
    if (!line.startsWith("--- ")) {
      i += 1;
      continue;
    }

    const oldHeader = normalizeHeaderPath(line.slice(4));
    const next = lines[i + 1] || "";
    if (!next.startsWith("+++ ")) {
      i += 1;
      continue;
    }

    const newHeader = normalizeHeaderPath(next.slice(4));
    const filePath = newHeader ?? oldHeader ?? "";
    i += 2;

    const original: string[] = [];
    const modified: string[] = [];

    while (i < lines.length) {
      const current = lines[i] || "";
      if (current.startsWith("--- ") || current.startsWith("diff --git ")) break;

      if (current.startsWith("@@")) {
        i += 1;
        while (i < lines.length) {
          const body = lines[i] || "";
          if (
            body.startsWith("--- ") ||
            body.startsWith("@@") ||
            body.startsWith("diff --git ") ||
            (!body.startsWith(" ") && !body.startsWith("+") && !body.startsWith("-") && body.trim() !== "")
          ) {
            break;
          }

          if (body.startsWith(" ")) {
            const text = body.slice(1);
            original.push(text);
            modified.push(text);
          } else if (body.startsWith("-")) {
            original.push(body.slice(1));
          } else if (body.startsWith("+")) {
            modified.push(body.slice(1));
          }

          i += 1;
        }

        if (original.length > 0 || modified.length > 0) {
          original.push("");
          modified.push("");
        }

        continue;
      }

      i += 1;
    }

    previews.push({ filePath, original: original.join("\n"), modified: modified.join("\n") });
  }

  return previews;
}
