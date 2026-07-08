import { test, expect } from "@playwright/test";
import { authed, USER, STAFF } from "./helpers";

/** Staff fulfilment dashboard — ROLE_STAFF only (StaffRoute). */
test.describe("Staff dashboard", () => {
  test("TC-E2E-140: logged out → redirected to /login", async ({ page }) => {
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-E2E-141: a signed-in non-staff user is sent home (/)", async ({ page }) => {
    await authed(page, USER);
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/$/);
  });

  test("TC-E2E-142: a STAFF account reaches the dashboard", async ({ page }) => {
    await authed(page, STAFF);
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/staff/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
