import { Page, Route } from "@playwright/test";

/** Standard success envelope the backend returns. */
export function ok(data: unknown = null, message = "ok") {
  return { success: true, message, data };
}

/** Standard error envelope produced by the backend GlobalExceptionHandler. */
export function err(code: string, status = 400) {
  return {
    status,
    body: { success: false, error: { _: code }, errors: { _: [code] }, message: "error" },
  };
}

/** Fulfil a route with a JSON body + status. */
async function fulfill(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

/**
 * Install auth API mocks. Pass overrides keyed by the endpoint suffix (e.g. "register").
 * Each override is `{ status, body }` or a success `data` shortcut via `ok(...)`.
 */
export async function mockAuth(
  page: Page,
  overrides: Record<string, { status?: number; body: unknown }> = {}
) {
  const route = async (r: Route) => {
    const url = r.request().url();
    const key = Object.keys(overrides).find((k) => url.includes(`/auth/${k}`));
    if (key) {
      const o = overrides[key];
      await fulfill(r, o.status ?? 200, o.body);
      return;
    }
    // default: succeed with an empty envelope
    await fulfill(r, 200, ok());
  };
  await page.route("**/api/user/auth/**", route);
  await page.route("**/api/*/auth/**", route);
}

/** A broad catch-all so pages that fetch on mount don't hit the network (empty success). */
export async function mockApi(page: Page) {
  await page.route("**/api/**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok([])) })
  );
}

export const USER = { id: "u1", email: "huy@example.com", fullName: "Huy", roles: ["USER"] };
export const STAFF = { id: "s1", email: "staff@example.com", fullName: "Staff", roles: ["STAFF"] };

/**
 * Seed a JWT session + a catch-all API mock, and make the profile endpoints return `user`.
 * The catch-all is registered first so the specific `/account/me` routes win (Playwright uses the
 * most-recently-added matching route). Extra per-test routes registered after this also win.
 */
export async function authed(page: Page, user: unknown = USER) {
  await page.addInitScript(() => {
    localStorage.setItem("innerstyle.accessToken", "seeded-access");
    localStorage.setItem("innerstyle.refreshToken", "seeded-refresh");
  });
  await mockApi(page);
  const me = (r: Route) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(user)) });
  await page.route("**/api/user/account/me", me);
  await page.route("**/api/staff/account/me", me);
}
