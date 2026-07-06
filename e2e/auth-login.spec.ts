import { test, expect } from "@playwright/test";
import { mockAuth, ok, err } from "./helpers";

// A broad catch-all so pages that load after auth (studio, staff) don't hit the network.
async function mockRest(page) {
  await page.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok([])) })
  );
}

test.describe("Login", () => {
  test("TC-E2E-009: valid USER login lands on /studio", async ({ page }) => {
    await mockRest(page);
    await mockAuth(page, {
      login: {
        status: 200,
        body: ok({
          accessToken: "a",
          refreshToken: "r",
          tokenType: "Bearer",
          expiresIn: 900,
          user: { id: "u1", email: "huy@example.com", roles: ["USER"] },
        }),
      },
    });
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("huy@example.com");
    await page.getByPlaceholder("••••••••").fill("S3curePass!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/studio/);
  });

  test("TC-E2E-010: valid STAFF login lands on /staff", async ({ page }) => {
    await mockRest(page);
    await mockAuth(page, {
      login: {
        status: 200,
        body: ok({
          accessToken: "a",
          refreshToken: "r",
          tokenType: "Bearer",
          expiresIn: 900,
          user: { id: "s1", email: "staff@example.com", roles: ["STAFF"] },
        }),
      },
    });
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("staff@example.com");
    await page.getByPlaceholder("••••••••").fill("S3curePass!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/staff/);
  });

  test("TC-E2E-011: invalid credentials show an error toast", async ({ page }) => {
    const e = err("auth.invalidCredentials", 401);
    await mockAuth(page, { login: { status: e.status, body: e.body } });
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("huy@example.com");
    await page.getByPlaceholder("••••••••").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC-E2E-012: unverified account shows the verify hint", async ({ page }) => {
    const e = err("auth.emailNotVerified", 401);
    await mockAuth(page, { login: { status: e.status, body: e.body } });
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("huy@example.com");
    await page.getByPlaceholder("••••••••").fill("S3curePass!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Please verify your email before signing in.")).toBeVisible();
  });
});
