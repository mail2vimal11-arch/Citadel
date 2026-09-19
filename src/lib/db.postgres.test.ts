import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// P3 migration smoke test — proves the data model is portable to the durable
// Postgres seam, not just SQLite. We derive a Postgres-provider copy of the live
// schema and let Prisma validate it. This runs OFFLINE (validate never connects),
// so it guards against accidentally adding a SQLite-only construct.
//
// If TEST_DATABASE_URL (a real Postgres URL) is set, an extra opt-in case also
// pushes the schema to that database — the full "does it actually migrate" check.
// It is skipped by default so neither CI nor local dev needs a Postgres running.

function postgresSchema(): string {
  const original = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  const swapped = original.replace(
    /datasource db \{[^}]*provider = "sqlite"/,
    (block) => block.replace('provider = "sqlite"', 'provider = "postgresql"')
  );
  expect(swapped).toContain('provider = "postgresql"'); // the swap actually happened
  return swapped;
}

describe("Postgres storage seam (migration smoke test)", () => {
  it("the schema is valid under the postgresql provider", () => {
    const dir = mkdtempSync(join(tmpdir(), "citadel-pg-"));
    const schemaPath = join(dir, "schema.prisma");
    writeFileSync(schemaPath, postgresSchema());
    try {
      // validate does not connect; a well-formed URL just has to resolve.
      execFileSync("npx", ["prisma", "validate", "--schema", schemaPath], {
        env: { ...process.env, DATABASE_URL: "postgresql://u:p@localhost:5432/citadel?schema=public" },
        stdio: "pipe",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it.skipIf(!process.env.TEST_DATABASE_URL)(
    "pushes the schema to a live Postgres (opt-in via TEST_DATABASE_URL)",
    () => {
      const dir = mkdtempSync(join(tmpdir(), "citadel-pg-live-"));
      const schemaPath = join(dir, "schema.prisma");
      writeFileSync(schemaPath, postgresSchema());
      try {
        execFileSync(
          "npx",
          ["prisma", "db", "push", "--schema", schemaPath, "--skip-generate", "--accept-data-loss"],
          { env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }, stdio: "pipe" }
        );
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  );
});
