import { test, expect } from "@playwright/test";
import { ok } from "./helpers";

/**
 * Sign-in is social-only (Google / Facebook). The provider SDKs aren't loaded in e2e (no
 * VITE_GOOGLE_CLIENT_ID / VITE_FACEBOOK_APP_ID), so we can't drive a real social sign-in.
 * Instead we assert: the login page is password-free, legacy auth routes redirect to /login,
 * and a seeded session (JWT already in storage) is honoured by the route guards.
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

test.describe("Login (social-only)", () => {
  test("TC-E2E-009: login page renders the sign-in card with no password form", async ({ page }) => {
    // Stub every mount-time request so nothing hits the live dev-server proxy and reloads the
    // page mid-assertion (that shows up as `toHaveCount` → "Received: undefined").
    await mockRest(page);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    // Wait for the auth card to fully settle before asserting what's absent.
    await expect(page.getByText("Continue with Google or Facebook", { exact: false })).toBeVisible();
    // The email/password form has been removed entirely.
    await expect(page.getByPlaceholder("you@example.com")).toHaveCount(0);
    await expect(page.getByPlaceholder("••••••••")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sign in" })).toHaveCount(0);
  });

  for (const path of ["/register", "/forgot-password", "/reset-password", "/verify-email"]) {
    test(`TC-E2E-013: legacy ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test("TC-E2E-010: a seeded USER session reaches a protected page", async ({ page }) => {
    await mockRest(page);
    await seedSession(page, {
      id: "u1",
      email: "huy@example.com",
      fullName: "Huy",
      roles: ["USER"],
    });
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
  });

  test("TC-E2E-011: a seeded STAFF session reaches /staff", async ({ page }) => {
    await mockRest(page);
    await seedSession(page, {
      id: "s1",
      email: "staff@example.com",
      fullName: "Staff",
      roles: ["STAFF"],
    });
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/staff/);
  });
});
