import { test, expect } from "@playwright/test";

// SMOKE — the fastest "is the build alive at all" check. If these fail, deeper
// E2E is pointless. Run on every push and as a post-deploy gate.
test.describe("smoke", () => {
  test("health endpoint responds ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).ok).toBe(true);
  });

  test("landing page renders", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Citadel/);
  });

  test("inbox app boots", async ({ page }) => {
    const res = await page.goto("/inbox");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByText("Citadel").first()).toBeVisible();
  });
});
