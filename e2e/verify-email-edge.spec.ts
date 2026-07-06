import { test, expect } from "@playwright/test";
import { mockAuth, ok, err } from "./helpers";

test.describe("Verify email — OTP form edge cases", () => {
  test("TC-E2E-004: OTP field strips non-digit characters", async ({ page }) => {
    await mockAuth(page);
    await page.goto("/verify-email?email=huy@example.com");
    const otp = page.getByPlaceholder("Enter the code");
    await otp.fill("");
    await otp.type("a1b2c3d4");
    await expect(otp).toHaveValue("1234");
  });

  test("TC-E2E-006: correct OTP shows the verified success screen", async ({ page }) => {
    await mockAuth(page, {
      "verify-email": { status: 200, body: ok(null, "auth.emailVerified") },
    });
    await page.goto("/verify-email?email=huy@example.com");
    await page.getByPlaceholder("Enter the code").fill("123456");
    await page.getByRole("button", { name: "Verify email" }).click();

    await expect(page.getByText("Your email is verified.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue to sign in" })).toBeVisible();
  });

  test("TC-E2E-005: wrong OTP shows an error toast and stays on the page", async ({ page }) => {
    const e = err("auth.verification.invalid", 400);
    await mockAuth(page, { "verify-email": { status: e.status, body: e.body } });
    await page.goto("/verify-email?email=huy@example.com");
    await page.getByPlaceholder("Enter the code").fill("000000");
    await page.getByRole("button", { name: "Verify email" }).click();

    await expect(
      page.getByText("That code is incorrect. Please check and try again.")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify email" })).toBeVisible();
  });

  test("TC-E2E-007: resend code succeeds", async ({ page }) => {
    await mockAuth(page, {
      "resend-verification": { status: 200, body: ok(null, "auth.verificationSent") },
    });
    await page.goto("/verify-email?email=huy@example.com");
    await page.getByRole("button", { name: /Resend code/ }).click();
    await expect(page.getByText("Code sent")).toBeVisible();
  });

  test("TC-E2E-008: resend without email shows a validation toast", async ({ page }) => {
    await mockAuth(page);
    await page.goto("/verify-email"); // no email query param
    await page.getByRole("button", { name: /Resend code/ }).click();
    await expect(page.getByText("Email required")).toBeVisible();
  });
});
