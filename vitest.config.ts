import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests run in Node (the crypto/forget/parse logic is all server-side).
// The "@/..." alias mirrors tsconfig so tests import modules the same way the
// app does.
//
// globalSetup provisions a throwaway SQLite database (separate from dev.db) so
// the DB-backed tests — notably the multi-tenant isolation test — run against a
// real schema without touching developer data. `test.env` pins DATABASE_URL and
// forces the offline heuristic AI provider so tests never reach Ollama.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./vitest.globalSetup.ts"],
    env: {
      // SQLite paths in DATABASE_URL are resolved relative to the Prisma schema
      // directory (prisma/), so this lands at prisma/test.db.
      DATABASE_URL: "file:./test.db",
      AI_PROVIDER: "heuristic",
    },
  },
});
