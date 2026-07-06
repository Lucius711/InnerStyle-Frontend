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
