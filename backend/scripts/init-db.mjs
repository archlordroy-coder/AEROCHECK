import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Database from "better-sqlite3";

const projectRoot = path.resolve(process.cwd(), "..");
dotenv.config({ path: path.join(projectRoot, ".env") });

function resolveDbPath() {
  const databasePath = process.env.DATABASE_PATH?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const backendRoot = path.resolve(projectRoot, "backend");

  const resolveLegacyRelativePath = (rawPath) => {
    const normalized = rawPath.replace(/^\.\/+/, "");
    if (normalized === "prisma/dev.db" || normalized.startsWith("prisma/")) {
      return path.resolve(backendRoot, normalized);
    }
    return path.resolve(projectRoot, rawPath);
  };

  if (databasePath) {
    return resolveLegacyRelativePath(databasePath);
  }

  if (databaseUrl?.startsWith("file:")) {
    return resolveLegacyRelativePath(databaseUrl.slice("file:".length));
  }

  return path.resolve(projectRoot, "backend/prisma/dev.db");
}

const dbPath = resolveDbPath();
const uploadsDir = path.join(process.cwd(), "uploads", "documents");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.prepare("CREATE TABLE IF NOT EXISTS __aerocheck_init (id INTEGER PRIMARY KEY, created_at TEXT NOT NULL)").run();
sqlite.close();

console.log(`✅ SQLite prête: ${dbPath}`);
console.log(`✅ Répertoires prêts: ${uploadsDir}`);
