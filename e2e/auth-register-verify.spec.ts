import { test, expect } from "@playwright/test";
import { mockAuth, ok, err } from "./helpers";

test.describe("Registration → email OTP verification", () => {
  test("TC-E2E-001: successful register redirects to verify-email with email prefilled", async ({
    page,
  }) => {
    await mockAuth(page, {
      register: { status: 201, body: ok({ id: "u1", email: "huy@example.com" }, "auth.registered") },
    });
    await page.goto("/register");

    await page.getByPlaceholder("Your name").fill("Do Huy");
    await page.getByPlaceholder("you@example.com").fill("huy@example.com");
    await page.getByPlaceholder("Create a strong password").fill("S3curePass!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/verify-email\?email=huy%40example\.com/);
    // Email is prefilled on the OTP form.
    await expect(page.getByPlaceholder("you@example.com")).toHaveValue("huy@example.com");
    await expect(page.getByPlaceholder("Enter the code")).toBeVisible();
  });

  test("TC-E2E-002: duplicate email surfaces an error toast", async ({ page }) => {
    const e = err("auth.emailExists", 409);
    await mockAuth(page, { register: { status: e.status, body: e.body } });
    await page.goto("/register");

    await page.getByPlaceholder("Your name").fill("Do Huy");
    await page.getByPlaceholder("you@example.com").fill("dupe@example.com");
    await page.getByPlaceholder("Create a strong password").fill("S3curePass!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("An account with this email already exists.")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test("TC-E2E-003: short password blocked by native validation (no navigation)", async ({
    page,
  }) => {
    await mockAuth(page);
    await page.goto("/register");
    await page.getByPlaceholder("Your name").fill("Do Huy");
    await page.getByPlaceholder("you@example.com").fill("huy@example.com");
    await page.getByPlaceholder("Create a strong password").fill("short"); // < 8 (minLength=8)
    await page.getByRole("button", { name: "Create account" }).click();
    // The browser blocks submit; we stay on /register.
    await expect(page).toHaveURL(/\/register/);
  });
});
