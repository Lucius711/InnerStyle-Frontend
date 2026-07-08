# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: membership-api.spec.ts >> Membership API >> TC-API-MEM-003: a failed /plans load shows an error toast
- Location: e2e\membership-api.spec.ts:71:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Couldn\'t load membership')
Expected: visible
Error: strict mode violation: getByText('Couldn\'t load membership') resolved to 2 elements:
    1) <p class="text-sm font-semibold text-app-text">Couldn't load membership</p> aka getByText('Couldn\'t load membership').first()
    2) <p class="text-sm font-semibold text-app-text">Couldn't load membership</p> aka getByText('Couldn\'t load membership').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Couldn\'t load membership')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - navigation [ref=e4]:
      - link "InnerStyle" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "InnerStyle" [ref=e6]
      - generic [ref=e7]:
        - link "How it works" [ref=e8] [cursor=pointer]:
          - /url: /#how
        - link "Features" [ref=e9] [cursor=pointer]:
          - /url: /#features
        - link "Showcase" [ref=e10] [cursor=pointer]:
          - /url: /#showcase
      - generic [ref=e11]:
        - button "Change language" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
          - generic [ref=e17]: EN
        - button "Switch to dark mode" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
        - link "Start creating" [ref=e27] [cursor=pointer]:
          - /url: /studio
          - button "Start creating" [ref=e28]:
            - img [ref=e29]
            - text: Start creating
        - button "Account" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]: H
          - img [ref=e34]
  - main [ref=e37]:
    - generic [ref=e38]:
      - heading "Membership" [level=1] [ref=e39]
      - generic [ref=e40]:
        - link "Print orders" [ref=e41] [cursor=pointer]:
          - /url: /print-orders
          - button "Print orders" [ref=e42]:
            - img [ref=e43]
            - text: Print orders
        - button "Refresh" [ref=e47] [cursor=pointer]:
          - img [ref=e48]
          - text: Refresh
    - generic [ref=e53]:
      - generic [ref=e54]:
        - img [ref=e55]
        - text: Plan · credits remaining
      - paragraph [ref=e57]:
        - text: —
        - generic [ref=e58]: / per month
  - contentinfo [ref=e59]:
    - generic [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - link "InnerStyle" [ref=e63] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e64]
          - paragraph [ref=e65]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e66]:
          - generic [ref=e67]:
            - heading "Product" [level=4] [ref=e68]
            - list [ref=e69]:
              - listitem [ref=e70]:
                - link "Studio" [ref=e71] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e72]:
                - link "How it works" [ref=e73] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e74]:
                - link "Features" [ref=e75] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e76]:
            - heading "Pipeline" [level=4] [ref=e77]
            - list [ref=e78]:
              - listitem [ref=e79]:
                - link "Image to 3D" [ref=e80] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e81]:
                - link "Text to 3D" [ref=e82] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e83]:
                - link "Rig & Animate" [ref=e84] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e85]:
            - heading "Resources" [level=4] [ref=e86]
            - list [ref=e87]:
              - listitem [ref=e88]:
                - link "MeshyAI Docs" [ref=e89] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e90]:
                - link "API Reference" [ref=e91] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e92]:
                - link "Support" [ref=e93] [cursor=pointer]:
                  - /url: /
      - generic [ref=e94]:
        - paragraph [ref=e95]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e96]:
          - link "social link" [ref=e97] [cursor=pointer]:
            - /url: "#"
            - img [ref=e98]
          - link "social link" [ref=e101] [cursor=pointer]:
            - /url: "#"
            - img [ref=e102]
          - link "social link" [ref=e104] [cursor=pointer]:
            - /url: "#"
            - img [ref=e105]
  - generic:
    - generic [ref=e107]:
      - img [ref=e108]
      - generic [ref=e110]:
        - paragraph [ref=e111]: Couldn't load membership
        - paragraph [ref=e112]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e113] [cursor=pointer]:
        - img [ref=e114]
    - generic [ref=e117]:
      - img [ref=e118]
      - generic [ref=e120]:
        - paragraph [ref=e121]: Couldn't load membership
        - paragraph [ref=e122]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e123] [cursor=pointer]:
        - img [ref=e124]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ok, err, authed, USER } from "./helpers";
  3  | 
  4  | /**
  5  |  * Membership module — exercises the backend APIs the Membership page calls:
  6  |  *   GET  /api/user/membership/me
  7  |  *   GET  /api/common/membership/plans
  8  |  *   POST /api/user/membership/subscribe
  9  |  * Backend is mocked at the network layer; assertions target the request/response contract and the
  10 |  * resulting UI so we verify the frontend ⇄ API integration for each endpoint.
  11 |  */
  12 | 
  13 | const ME = { planCode: "FREE", planName: "Free", creditsRemaining: 20, monthlyCredits: 20, periodEnd: null };
  14 | const PLANS = [
  15 |   { code: "FREE", name: "Free", price: 0, monthlyCredits: 20 },
  16 |   { code: "PRO", name: "Pro", price: 199000, monthlyCredits: 500 },
  17 | ];
  18 | 
  19 | async function mockMembership(page, over = {}) {
  20 |   await page.route("**/api/user/membership/me", (r) =>
  21 |     r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(ME)) })
  22 |   );
  23 |   await page.route("**/api/common/membership/plans", (r) => {
  24 |     if (over.plansError) {
  25 |       const e = err("common.serverError", 500);
  26 |       return r.fulfill({ status: e.status, contentType: "application/json", body: JSON.stringify(e.body) });
  27 |     }
  28 |     return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(PLANS)) });
  29 |   });
  30 |   await page.route("**/api/user/membership/subscribe", (r) =>
  31 |     r.fulfill({
  32 |       status: 200,
  33 |       contentType: "application/json",
  34 |       body: JSON.stringify(ok({ orderCode: "OC1", provider: "VNPAY", amount: 199000, payUrl: "/wallet/vnpay-return?e2e=1" })),
  35 |     })
  36 |   );
  37 | }
  38 | 
  39 | test.describe("Membership API", () => {
  40 |   test("TC-API-MEM-001: GET /me + /plans populate the page", async ({ page }) => {
  41 |     await authed(page, USER);
  42 |     await mockMembership(page);
  43 | 
  44 |     const plansReq = page.waitForRequest(
  45 |       (r) => r.url().includes("/api/common/membership/plans") && r.method() === "GET"
  46 |     );
  47 |     await page.goto("/membership");
  48 |     await plansReq;
  49 | 
  50 |     await expect(page.getByRole("heading", { name: "Membership" })).toBeVisible();
  51 |     await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
  52 |     await expect(page.getByText("20", { exact: false }).first()).toBeVisible(); // creditsRemaining
  53 |   });
  54 | 
  55 |   test("TC-API-MEM-002: POST /subscribe fires with the plan + provider, then redirects to payUrl", async ({ page }) => {
  56 |     await authed(page, USER);
  57 |     await mockMembership(page);
  58 |     await page.goto("/membership");
  59 | 
  60 |     const subReq = page.waitForRequest(
  61 |       (r) => r.url().includes("/api/user/membership/subscribe") && r.method() === "POST"
  62 |     );
  63 |     await page.getByRole("button", { name: "Buy with VNPay" }).click();
  64 |     const req = await subReq;
  65 |     expect(req.postDataJSON()).toMatchObject({ planCode: "PRO", provider: "VNPAY" });
  66 | 
  67 |     // payUrl redirect (backend returns the gateway URL; here a local stand-in).
  68 |     await expect(page).toHaveURL(/\/wallet\/vnpay-return/);
  69 |   });
  70 | 
  71 |   test("TC-API-MEM-003: a failed /plans load shows an error toast", async ({ page }) => {
  72 |     await authed(page, USER);
  73 |     await mockMembership(page, { plansError: true });
  74 |     await page.goto("/membership");
> 75 |     await expect(page.getByText("Couldn't load membership")).toBeVisible();
     |                                                              ^ Error: expect(locator).toBeVisible() failed
  76 |   });
  77 | });
  78 | 
```