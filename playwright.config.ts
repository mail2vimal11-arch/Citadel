import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

// ============================================================================
// E2E / black-box config. Playwright drives a real Chromium against a real
// production build of the app (heuristic AI, synthetic mailbox, SQLite), with no
// knowledge of internals — the black-box + end-to-end + system layer of the
// test pyramid (see TESTING.md).
//
// Locally we reuse the pre-installed Chromium (PLAYWRIGHT_BROWSERS_PATH); in CI
// the workflow runs `playwright install chromium`, so we only pin executablePath
// when the pre-installed binary is actually present.
// ============================================================================
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const preinstalledChromium = "/opt/pw-browsers/chromium";
const executablePath = fs.existsSync(preinstalledChromium) ? preinstalledChromium : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
  ],
  // Boot the built app once for the whole run. db push makes the SQLite schema;
  // the forget sweep is disabled so nothing mutates under the tests.
  webServer: {
    command: `npx prisma db push --skip-generate && npx next start -H 127.0.0.1 -p ${PORT}`,
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: "production",
      AI_PROVIDER: "heuristic",
      DATABASE_URL: "file:./e2e.db",
      FORGET_SWEEP_INTERVAL_MS: "0",
    },
  },
});
