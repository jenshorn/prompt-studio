import { homedir } from "node:os";
import { join } from "node:path";

const DATA_DIR = join(homedir(), ".pstdio");

export const resolveDefaultDbPath = () => join(DATA_DIR, "pstdio.db");

export const resolveDefaultStoragePath = () => join(DATA_DIR, "storage");
