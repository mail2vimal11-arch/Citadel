import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Provision a fresh SQLite schema for DB-backed tests. Runs once before the
// suite. We point Prisma at a dedicated test.db (never dev.db) and push the
// schema so tables exist; the file is removed afterwards so each run starts
// clean and nothing is left behind.
// DATABASE_URL is relative to the Prisma schema dir (prisma/); the rm paths are
// relative to the project root (cwd) — both point at the same prisma/test.db.
const DB_URL = "file:./test.db";
const DB_FILE = "./prisma/test.db";

export async function setup() {
  rmSync(DB_FILE, { force: true });
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: "ignore",
  });
}

export async function teardown() {
  rmSync(DB_FILE, { force: true });
  rmSync(`${DB_FILE}-journal`, { force: true });
}
