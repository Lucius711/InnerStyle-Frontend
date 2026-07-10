import { test, expect } from "@playwright/test";
import { ok } from "./helpers";

/**
 * Sign-in supports a username + password form (see auth-password.spec.ts for the full flow) as
 * well as social sign-in (Google / Facebook). The social SDKs aren't loaded in e2e (no
 * VITE_GOOGLE_CLIENT_ID / VITE_FACEBOOK_APP_ID). Here we assert the login page composition, the
 * remaining legacy-route redirects, and that a seeded session (JWT already in storage) is honoured
 * by the route guards.
 */

/** Catch-all so protected pages that fetch on mount don't hit the network. */
async function mockRest(page) {
  await page.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok([])) })
  );
}

/** Seed a JWT session and make the profile endpoints return `user`. */
async function seedSession(page, user) {
  await page.addInitScript(() => {
    localStorage.setItem("innerstyle.accessToken", "seeded-access");
    localStorage.setItem("innerstyle.refreshToken", "seeded-refresh");
  });
  const me = (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(user)) });
  await page.route("**/api/user/account/me", me);
  await page.route("**/api/staff/account/me", me);
}

test.describe("Login page", () => {
  test("TC-E2E-009: login page shows the username + password form and the social card", async ({ page }) => {
    await mockRest(page);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    // Password form present.
    await expect(page.getByTestId("auth-username")).toBeVisible();
    await expect(page.getByTestId("auth-password")).toBeVisible();
    await expect(page.getByTestId("auth-submit")).toBeVisible();
    // Social sign-in card still offered alongside (the divider label is an exact match — the
    // subtitle also contains the phrase "or continue with").
    await expect(page.getByText("or continue with", { exact: true })).toBeVisible();
  });

  // /register now renders the register form; only these routes still redirect to /login.
  for (const path of ["/forgot-password", "/reset-password", "/verify-email"]) {
    test(`TC-E2E-013: legacy ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("TC-E2E-013b: /register renders the register form (no redirect)", async ({ page }) => {
    await mockRest(page);
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("TC-E2E-010: a seeded USER session reaches a protected page", async ({ page }) => {
    await mockRest(page);
    await seedSession(page, { id: "u1", email: "huy@example.com", fullName: "Huy", roles: ["USER"] });
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
  });

  test("TC-E2E-011: a seeded STAFF session reaches /staff", async ({ page }) => {
    await mockRest(page);
    await seedSession(page, { id: "s1", email: "staff@example.com", fullName: "Staff", roles: ["STAFF"] });
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/staff/);
  });
});
