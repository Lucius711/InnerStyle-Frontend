import { test, expect } from "@playwright/test";
import { authed } from "./helpers";

/** The Creative Lab editor — customer-only. `/lab` without a task id redirects to the library. */
test.describe("Creative Lab", () => {
  test("TC-E2E-115: logged out → redirected to /login", async ({ page }) => {
    await page.goto("/lab/task-123");
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-E2E-116: logged-in /lab without a task id → redirects to /my-3d-printing", async ({ page }) => {
    await authed(page);
    await page.goto("/lab");
    await expect(page).toHaveURL(/\/my-3d-printing/);
  });
});
