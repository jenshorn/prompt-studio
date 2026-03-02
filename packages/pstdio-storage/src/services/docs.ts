import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import type { DbClient } from "pstdio-db";
import { project_docs } from "pstdio-db";
import type { createFilesService } from "./files";

type DocsErrorCode = "DOCS_CONFIG_NOT_FOUND" | "DOCS_CONFIG_INVALID" | "DOCS_LINK_INVALID" | "DOCS_DOCUMENT_NOT_FOUND";

type PersistedFile = {
  id: string;
  file_name: string;
  storage_path: string;
  hash: string | null;
};

type DocsSidebarItem = {
  text: string;
  link?: string;
  items?: DocsSidebarItem[];
};

const DOCS_CONFIG_NAME = "docs.json";
const DOCS_STORAGE_PREFIX = "docs/";

const nowTimestamp = () => new Date().toISOString();

const createDocsError = (code: DocsErrorCode, message: string) => Object.assign(new Error(message), { code });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertDocsRelativePath = (docsRoot: string, inputPath: string, source: string) => {
  const normalized = inputPath.replaceAll("\\", "/").trim();
  if (!normalized) {
    throw createDocsError("DOCS_LINK_INVALID", `Invalid docs path from ${source}: '${inputPath}'.`);
  }

  if (normalized.startsWith("/") || normalized === ".." || normalized.includes("../")) {
    throw createDocsError("DOCS_LINK_INVALID", `Docs path resolves outside .pstdio/docs: ${inputPath}`);
  }

  const resolved = resolve(docsRoot, normalized);
  const rel = relative(docsRoot, resolved);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) {
    throw createDocsError("DOCS_LINK_INVALID", `Docs path resolves outside .pstdio/docs: ${inputPath}`);
  }

  return rel.replaceAll("\\", "/");
};

const normalizeSidebarLinkPath = (docsRoot: string, link: string) => {
  const withoutParams = link.split("?")[0]?.split("#")[0] ?? "";
  const trimmed = withoutParams.trim();

  if (!trimmed || /^[a-zA-Z]+:\/\//.test(trimmed)) {
    throw createDocsError("DOCS_LINK_INVALID", `Unsupported docs link: ${link}`);
  }

  const normalized = trimmed.replace(/^\/+/, "");
  const withExtension = normalized.endsWith(".md") ? normalized : `${normalized}.md`;
  return assertDocsRelativePath(docsRoot, withExtension, `docs link '${link}'`);
};

const parseSidebarItem = (value: unknown, location: string): DocsSidebarItem => {
  if (!isRecord(value)) {
    throw createDocsError("DOCS_CONFIG_INVALID", `Invalid sidebar item at ${location}.`);
  }

  const text = typeof value.text === "string" ? value.text.trim() : "";
  const link = typeof value.link === "string" ? value.link.trim() : undefined;
  const items = Array.isArray(value.items)
    ? value.items.map((item, index) => parseSidebarItem(item, `${location}.items[${index}]`))
    : undefined;

  if (!text) {
    throw createDocsError("DOCS_CONFIG_INVALID", `Sidebar item at ${location} is missing a valid text field.`);
  }

  if (!link && (!items || items.length === 0)) {
    throw createDocsError("DOCS_CONFIG_INVALID", `Sidebar item at ${location} must include link or items.`);
  }

  if (link === "") {
    throw createDocsError("DOCS_CONFIG_INVALID", `Sidebar item at ${location} has an empty link.`);
  }

  return { text, link, items };
};

const parseSidebar = (parsed: unknown) => {
  if (!isRecord(parsed)) {
    throw createDocsError("DOCS_CONFIG_INVALID", "docs.json must contain an object.");
  }

  if (!Array.isArray(parsed.sidebar)) {
    throw createDocsError("DOCS_CONFIG_INVALID", "docs.json must include a sidebar array.");
  }

  return parsed.sidebar.map((item, index) => parseSidebarItem(item, `sidebar[${index}]`));
};

const collectSidebarLinks = (items: DocsSidebarItem[]): string[] => {
  const links: string[] = [];
  for (const item of items) {
    if (item.link) {
      links.push(item.link);
    }
    if (item.items?.length) {
      links.push(...collectSidebarLinks(item.items));
    }
  }
  return links;
};

const listRelativeFiles = (rootDir: string, currentDir = rootDir): string[] => {
  if (!existsSync(currentDir)) {
    return [];
  }

  const entries = readdirSync(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listRelativeFiles(rootDir, absolutePath));
      continue;
    }

    if (entry.isSymbolicLink()) {
      throw createDocsError("DOCS_LINK_INVALID", `Symlinks are not supported in .pstdio/docs: ${absolutePath}`);
    }

    if (!entry.isFile()) {
      continue;
    }

    files.push(relative(rootDir, absolutePath).replaceAll("\\", "/"));
  }

  return files.sort((left, right) => left.localeCompare(right));
};

const docsStorageName = (relativePath: string) => `${DOCS_STORAGE_PREFIX}${relativePath}`;

const detectMimeType = (relativePath: string) => {
  const lower = relativePath.toLowerCase();
  if (lower === DOCS_CONFIG_NAME) return "application/json";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".json")) return "application/json";
  return "application/octet-stream";
};

const stripStoragePrefix = (docsRoot: string, fileName: string) => {
  if (!fileName.startsWith(DOCS_STORAGE_PREFIX)) {
    return null;
  }

  const relativePath = fileName.slice(DOCS_STORAGE_PREFIX.length);
  return assertDocsRelativePath(docsRoot, relativePath, "persisted docs");
};

const parseConfigAndValidateLinks = (docsRoot: string, configText: string, availableFiles: Set<string>) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configText);
  } catch {
    throw createDocsError("DOCS_CONFIG_INVALID", "Unable to parse .pstdio/docs/docs.json");
  }

  const sidebar = parseSidebar(parsed);
  const links = collectSidebarLinks(sidebar);
  for (const link of links) {
    const fromLink = normalizeSidebarLinkPath(docsRoot, link);
    if (!availableFiles.has(fromLink)) {
      throw createDocsError("DOCS_DOCUMENT_NOT_FOUND", `Docs link not found in .pstdio/docs: ${link}`);
    }
  }

  return { sidebar };
};

export const isDocsServiceError = (value: unknown): value is Error & { code: DocsErrorCode } =>
  value instanceof Error && "code" in value && typeof value.code === "string";

export const createDocsService = (db: DbClient, files: ReturnType<typeof createFilesService>) => {
  const getProjectDocsRow = async (projectId: string) => {
    const [row] = await db.select().from(project_docs).where(eq(project_docs.project_id, projectId));
    return row ?? null;
  };

  const getOrCreateProjectDocs = async (projectId: string) => {
    const existing = await getProjectDocsRow(projectId);
    if (existing) {
      return existing;
    }

    const timestamp = nowTimestamp();
    const created = {
      id: crypto.randomUUID(),
      project_id: projectId,
      last_synced_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await db.insert(project_docs).values(created);
    return created;
  };

  const listSnapshotFiles = async (projectId: string, docsRoot = ".pstdio/docs") => {
    const row = await getProjectDocsRow(projectId);
    if (!row) {
      return { row: null, filesByRelativePath: new Map<string, PersistedFile>() };
    }

    const attached = (await files.listForProjectDocs(row.id)) as PersistedFile[];
    const filesByRelativePath = new Map<string, PersistedFile>();

    for (const file of attached) {
      const relativePath = stripStoragePrefix(docsRoot, file.file_name);
      if (!relativePath) {
        continue;
      }
      filesByRelativePath.set(relativePath, file);
    }

    return { row, filesByRelativePath };
  };

  const save = async (projectId: string, sourceDir: string) => {
    if (!existsSync(sourceDir)) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", `Docs directory not found: ${sourceDir}`);
    }

    const localFiles = listRelativeFiles(sourceDir).map((filePath) =>
      assertDocsRelativePath(sourceDir, filePath, "local docs"),
    );
    if (!localFiles.includes(DOCS_CONFIG_NAME)) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", "Docs config not found at .pstdio/docs/docs.json");
    }

    const localSet = new Set(localFiles);
    const docsConfigText = readFileSync(join(sourceDir, DOCS_CONFIG_NAME), "utf8");
    parseConfigAndValidateLinks(sourceDir, docsConfigText, localSet);

    const row = await getOrCreateProjectDocs(projectId);
    const persisted = (await listSnapshotFiles(projectId, sourceDir)).filesByRelativePath;
    let updatedCount = 0;

    for (const relativePath of localFiles) {
      const filePath = join(sourceDir, relativePath);
      const data = readFileSync(filePath);
      const hash = createHash("sha256").update(data).digest("hex");
      const existing = persisted.get(relativePath);

      if (existing?.hash === hash) {
        persisted.delete(relativePath);
        continue;
      }

      if (existing) {
        await files.detachFromProjectDocs(row.id, existing.id);
        await files.remove(existing.id);
        persisted.delete(relativePath);
      }

      const uploaded = await files.upload({
        project_id: projectId,
        file_name: docsStorageName(relativePath),
        file_kind: "docs",
        data,
        mime_type: detectMimeType(relativePath),
      });

      await files.attachToProjectDocs(row.id, uploaded.id);
      updatedCount += 1;
    }

    const stale = Array.from(persisted.values());
    for (const file of stale) {
      await files.detachFromProjectDocs(row.id, file.id);
      await files.remove(file.id);
    }

    const attachedFiles = (await files.listForProjectDocs(row.id)) as PersistedFile[];
    const attachedIds = new Set(attachedFiles.map((file) => file.id));

    const allProjectFiles = (await files.listByProject(projectId)) as PersistedFile[];
    const orphanDocsFiles = allProjectFiles.filter((file) => {
      if (!file.file_name.startsWith(DOCS_STORAGE_PREFIX)) {
        return false;
      }

      return !attachedIds.has(file.id);
    });

    for (const file of orphanDocsFiles) {
      await files.remove(file.id);
    }

    const timestamp = nowTimestamp();
    await db
      .update(project_docs)
      .set({
        last_synced_at: timestamp,
        updated_at: timestamp,
      })
      .where(and(eq(project_docs.id, row.id), eq(project_docs.project_id, projectId)));

    return {
      updatedCount,
      removedCount: stale.length + orphanDocsFiles.length,
    };
  };

  const pull = async (projectId: string, targetDir: string) => {
    const { row, filesByRelativePath } = await listSnapshotFiles(projectId, targetDir);
    if (!row || filesByRelativePath.size === 0) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", "Project docs snapshot not found. Run `pstdio docs save` first.");
    }

    const docsConfig = filesByRelativePath.get(DOCS_CONFIG_NAME);
    if (!docsConfig) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", "Persisted docs config not found: docs/docs.json");
    }

    const persistedSet = new Set(filesByRelativePath.keys());
    const configText = readFileSync(docsConfig.storage_path, "utf8");
    parseConfigAndValidateLinks(targetDir, configText, persistedSet);

    mkdirSync(targetDir, { recursive: true });
    const persistedPaths = Array.from(filesByRelativePath.keys()).sort((left, right) => left.localeCompare(right));

    for (const relativePath of persistedPaths) {
      const persistedFile = filesByRelativePath.get(relativePath);
      if (!persistedFile) {
        continue;
      }

      const outputPath = join(targetDir, relativePath);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, readFileSync(persistedFile.storage_path));
    }

    const localFiles = existsSync(targetDir) ? listRelativeFiles(targetDir) : [];
    const staleLocal = localFiles.filter((relativePath) => !persistedSet.has(relativePath));

    for (const relativePath of staleLocal) {
      rmSync(join(targetDir, relativePath), { force: true });
    }

    return {
      updatedCount: persistedPaths.length,
      removedCount: staleLocal.length,
    };
  };

  const get = async (projectId: string) => {
    const { row, filesByRelativePath } = await listSnapshotFiles(projectId);
    if (!row) {
      return null;
    }

    return {
      ...row,
      files: Array.from(filesByRelativePath.entries()).map(([path, file]) => ({ path, ...file })),
    };
  };

  const getIndex = async (projectId: string) => {
    const { filesByRelativePath } = await listSnapshotFiles(projectId);
    const docsConfig = filesByRelativePath.get(DOCS_CONFIG_NAME);
    if (!docsConfig) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", "Project docs snapshot not found. Run `pstdio docs save` first.");
    }

    const availableFiles = new Set(filesByRelativePath.keys());
    const configText = readFileSync(docsConfig.storage_path, "utf8");
    return parseConfigAndValidateLinks(".pstdio/docs", configText, availableFiles);
  };

  const getDocument = async (projectId: string, link: string) => {
    const { filesByRelativePath } = await listSnapshotFiles(projectId);
    if (!filesByRelativePath.has(DOCS_CONFIG_NAME)) {
      throw createDocsError("DOCS_CONFIG_NOT_FOUND", "Project docs snapshot not found. Run `pstdio docs save` first.");
    }

    const relativePath = normalizeSidebarLinkPath(".pstdio/docs", link);
    const file = filesByRelativePath.get(relativePath);

    if (!file) {
      throw createDocsError("DOCS_DOCUMENT_NOT_FOUND", `Docs markdown file not found: ${relativePath}`);
    }

    if (extname(relativePath).toLowerCase() !== ".md") {
      throw createDocsError("DOCS_DOCUMENT_NOT_FOUND", `Docs markdown file not found: ${relativePath}`);
    }

    return {
      link,
      path: relativePath,
      content: readFileSync(file.storage_path, "utf8"),
    };
  };

  return {
    get,
    save,
    pull,
    getIndex,
    getDocument,
  };
};
