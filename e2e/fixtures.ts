import { test as base, expect, Page, Route } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { ok } from "./helpers";

/**
 * Shared fixtures for the e2e suite.
 *
 * - `loginPage`   — Page Object for the auth page.
 * - `mockAuthApi` — installs auth-endpoint mocks; call it with per-endpoint overrides.
 *
 * All specs mock the backend at the network layer, so they stay deterministic and parallel-safe.
 */

type AuthOverride = { status?: number; body: unknown };
type MockAuthApi = (overrides?: Record<string, AuthOverride>) => Promise<void>;

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

export const test = base.extend<{
  loginPage: LoginPage;
  mockAuthApi: MockAuthApi;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  mockAuthApi: async ({ page }, use) => {
    const install: MockAuthApi = async (overrides = {}) => {
      const handler = async (r: Route) => {
        const url = r.request().url();
        const key = Object.keys(overrides).find((k) => url.includes(`/auth/${k}`));
        if (key) {
          const o = overrides[key];
          await fulfillJson(r, o.status ?? 200, o.body);
          return;
        }
        await fulfillJson(r, 200, ok());
      };
      // Broad catch-all first so protected pages that fetch on mount don't hit the network,
      // then the auth routes (registered last → they win in Playwright).
      await page.route("**/api/**", (r) => fulfillJson(r, 200, ok([])));
      await page.route("**/api/user/auth/**", handler);
      await page.route("**/api/*/auth/**", handler);
    };
    await use(install);
  },
});

export { expect };
export type { Page };
