import { test, expect } from "@playwright/test";
import { authed } from "./helpers";

/** Old routes that now live inside the profile area redirect to their new homes. */
test.describe("Legacy route redirects", () => {
  test("TC-E2E-155: /gallery → /my-3d-printing", async ({ page }) => {
    await authed(page);
    await page.goto("/gallery");
    await expect(page).toHaveURL(/\/my-3d-printing/);
  });

  test("TC-E2E-156: /print-orders → /print-history", async ({ page }) => {
    await authed(page);
    await page.goto("/print-orders");
    await expect(page).toHaveURL(/\/print-history/);
  });
});
