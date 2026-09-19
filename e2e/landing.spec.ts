import { test, expect } from "@playwright/test";

// E2E / black-box — exercise the marketing landing the way a visitor would, with
// no knowledge of the internals. Asserts the value proposition is on the page
// and the primary call-to-action actually navigates into the app.
test.describe("landing page", () => {
  test("shows the hero, guarantees and pricing", async ({ page }) => {
    await page.goto("/");

    // Hero (the de-AI'd copy).
    await expect(page.getByRole("heading", { level: 1 })).toContainText("inbox");
    await expect(page.locator("body")).toContainText("forgets");

    // The three guarantees section.
    await expect(page.getByText("guarantees", { exact: false })).toBeVisible();

    // Pricing: free + the $15 Full plan.
    await expect(page.getByText("$15").first()).toBeVisible();
    await expect(page.getByText("Free", { exact: false }).first()).toBeVisible();
  });

  test("primary CTA opens the app", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /open citadel/i }).first().click();
    await expect(page).toHaveURL(/\/inbox/);
  });
});
