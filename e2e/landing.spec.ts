import { test, expect } from "@playwright/test";

/** The public marketing landing page — no auth required. */
test.describe("Landing", () => {
  test("TC-E2E-100: public landing renders a hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("TC-E2E-101: navbar exposes a link to /login when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});
