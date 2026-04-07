import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const projectRoot = path.resolve(process.cwd(), "..");
const schemaPath = path.join(projectRoot, "schema.sql");
const defaultDbPath = path.join(process.cwd(), "data", "aerocheck.db");
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : defaultDbPath;

if (!fs.existsSync(schemaPath)) {
  console.error(`❌ schema.sql introuvable: ${schemaPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const schemaSql = fs.readFileSync(schemaPath, "utf8");
const result = spawnSync("sqlite3", [dbPath], {
  input: schemaSql,
  encoding: "utf8",
});

if (result.status !== 0) {
  console.error("❌ Erreur initialisation SQLite");
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

console.log(`✅ Base SQLite initialisée: ${dbPath}`);
