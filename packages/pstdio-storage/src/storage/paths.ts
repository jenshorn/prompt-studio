import fs from "node:fs";
import path from "node:path";

export const resolveStorageRoot = (storagePath?: string) => {
  if (!storagePath) {
    throw new Error("Storage path is required. Set PSTDIO_STORAGE_PATH or pass storagePath.");
  }

  return storagePath;
};

export const ensureStorageRoot = (storageRoot: string) => {
  fs.mkdirSync(storageRoot, { recursive: true });
};

export const ensureProjectStorageRoot = (storageRoot: string, projectId: string) => {
  fs.mkdirSync(path.join(storageRoot, projectId), { recursive: true });
};

export const resolveFileStoragePath = (storageRoot: string, projectId: string, fileId: string) =>
  path.join(storageRoot, projectId, fileId);
