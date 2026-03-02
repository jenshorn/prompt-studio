import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { ensureDbDirectory, resolveDbPath } from "./paths";
import * as schema from "./schemas.pg";

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../drizzle");

export const createDb = async (options?: { path?: string }) => {
  const dbPath = resolveDbPath(options?.path);

  ensureDbDirectory(dbPath);

  const pglite = dbPath === ":memory:" ? new PGlite() : new PGlite(dbPath);

  const db = drizzle(pglite, { schema });
  if (fs.existsSync(migrationsFolder)) {
    await migrate(db, { migrationsFolder });
  }

  const close = async () => {
    await pglite.close();
  };

  return {
    close,
    db,
    path: dbPath,
    pglite,
  };
};

export type DbClient = PgliteDatabase<typeof schema>;
