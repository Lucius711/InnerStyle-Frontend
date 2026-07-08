import { test, expect } from "@playwright/test";
import { authed } from "./helpers";

/** The 3D generation studio — customer-only, requires auth. */
test.describe("Studio", () => {
  test("TC-E2E-110: logged out → redirected to /login", async ({ page }) => {
    await page.goto("/studio");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-E2E-111: logged-in USER stays on /studio and sees the page", async ({ page }) => {
    await authed(page);
    await page.goto("/studio");
    await expect(page).toHaveURL(/\/studio/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
