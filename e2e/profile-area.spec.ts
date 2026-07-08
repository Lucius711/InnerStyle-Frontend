import { test, expect } from "@playwright/test";
import { authed } from "./helpers";

/**
 * The profile area (personal info, my 3D models, print history) rendered inside ProfileLayout.
 * All routes require auth; the customer pages additionally require a non-staff account.
 */
test.describe("Profile area", () => {
  const guarded = [
    { path: "/profile", name: "profile info" },
    { path: "/my-3d-printing", name: "my 3D models" },
    { path: "/print-history", name: "print history" },
  ];

  for (const { path, name } of guarded) {
    test(`TC-E2E-130: ${name} redirects to /login when logged out`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("TC-E2E-131: logged-in USER sees personal info", async ({ page }) => {
    await authed(page);
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("TC-E2E-132: logged-in USER opens the 3D models library", async ({ page }) => {
    await authed(page);
    await page.goto("/my-3d-printing");
    await expect(page).toHaveURL(/\/my-3d-printing/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("TC-E2E-133: logged-in USER opens the print history", async ({ page }) => {
    await authed(page);
    await page.goto("/print-history");
    await expect(page).toHaveURL(/\/print-history/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
