import { test, expect } from "@playwright/test";
import { ok, err, authed, USER } from "./helpers";

/**
 * Membership module — exercises the backend APIs the Membership page calls:
 *   GET  /api/user/membership/me
 *   GET  /api/common/membership/plans
 *   POST /api/user/membership/subscribe
 * Backend is mocked at the network layer; assertions target the request/response contract and the
 * resulting UI so we verify the frontend ⇄ API integration for each endpoint.
 */

const ME = { planCode: "FREE", planName: "Free", creditsRemaining: 20, monthlyCredits: 20, periodEnd: null };
const PLANS = [
  { code: "FREE", name: "Free", price: 0, monthlyCredits: 20 },
  { code: "PRO", name: "Pro", price: 199000, monthlyCredits: 500 },
];

async function mockMembership(page, over = {}) {
  await page.route("**/api/user/membership/me", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(ME)) })
  );
  await page.route("**/api/common/membership/plans", (r) => {
    if (over.plansError) {
      const e = err("common.serverError", 500);
      return r.fulfill({ status: e.status, contentType: "application/json", body: JSON.stringify(e.body) });
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(PLANS)) });
  });
  await page.route("**/api/user/membership/subscribe", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ok({ orderCode: "OC1", provider: "VNPAY", amount: 199000, payUrl: "/wallet/vnpay-return?e2e=1" })),
    })
  );
}

test.describe("Membership API", () => {
  test("TC-API-MEM-001: GET /me + /plans populate the page", async ({ page }) => {
    await authed(page, USER);
    await mockMembership(page);

    const plansReq = page.waitForRequest(
      (r) => r.url().includes("/api/common/membership/plans") && r.method() === "GET"
    );
    await page.goto("/membership");
    await plansReq;

    await expect(page.getByRole("heading", { name: "Membership" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByText("20", { exact: false }).first()).toBeVisible(); // creditsRemaining
  });

  test("TC-API-MEM-002: POST /subscribe fires with the plan + provider, then redirects to payUrl", async ({ page }) => {
    await authed(page, USER);
    await mockMembership(page);
    await page.goto("/membership");

    const subReq = page.waitForRequest(
      (r) => r.url().includes("/api/user/membership/subscribe") && r.method() === "POST"
    );
    await page.getByRole("button", { name: "Buy with VNPay" }).click();
    const req = await subReq;
    expect(req.postDataJSON()).toMatchObject({ planCode: "PRO", provider: "VNPAY" });

    // payUrl redirect (backend returns the gateway URL; here a local stand-in).
    await expect(page).toHaveURL(/\/wallet\/vnpay-return/);
  });

  test("TC-API-MEM-003: a failed /plans load shows an error toast", async ({ page }) => {
    await authed(page, USER);
    await mockMembership(page, { plansError: true });
    await page.goto("/membership");
    await expect(page.getByText("Couldn't load membership")).toBeVisible();
  });
});
