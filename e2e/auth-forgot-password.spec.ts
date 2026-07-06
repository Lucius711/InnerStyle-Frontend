import { test, expect } from "@playwright/test";
import { mockAuth, ok } from "./helpers";

test.describe("Forgot password", () => {
  test("TC-E2E-013: submitting shows the neutral confirmation (no enumeration)", async ({
    page,
  }) => {
    await mockAuth(page, {
      "forgot-password": { status: 200, body: ok(null, "auth.resetEmailSent") },
    });
    await page.goto("/forgot-password");
    await page.getByPlaceholder("you@example.com").fill("maybe@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByText(/a reset link has been sent/i)).toBeVisible();
    await expect(page.getByText("maybe@example.com")).toBeVisible();
  });
});
