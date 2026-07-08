import { test, expect } from "@playwright/test";
import { authed } from "./helpers";

/** Membership / plans page — customer-only. */
test.describe("Membership", () => {
  test("TC-E2E-120: logged out → redirected to /login", async ({ page }) => {
    await page.goto("/membership");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-E2E-121: logged-in USER sees the Membership page", async ({ page }) => {
    await authed(page);
    await page.goto("/membership");
    await expect(page).toHaveURL(/\/membership/);
    await expect(page.getByRole("heading", { name: "Membership" })).toBeVisible();
  });
});
