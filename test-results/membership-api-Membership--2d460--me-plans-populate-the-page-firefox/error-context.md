# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: membership-api.spec.ts >> Membership API >> TC-API-MEM-001: GET /me + /plans populate the page
- Location: e2e\membership-api.spec.ts:40:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Pro' })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: 'Pro' }) resolved to 2 elements:
    1) <h3 class="font-display text-xl font-bold text-app-text">Pro</h3> aka getByRole('heading', { name: 'Pro', exact: true })
    2) <h4 class="text-xs font-semibold uppercase tracking-wider text-app-faint">Product</h4> aka getByRole('heading', { name: 'Product' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Pro' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - img "InnerStyle" [ref=e4]
  - banner [ref=e5]:
    - navigation [ref=e6]:
      - link "InnerStyle" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "InnerStyle" [ref=e8]
      - generic [ref=e9]:
        - link "How it works" [ref=e10] [cursor=pointer]:
          - /url: /#how
        - link "Features" [ref=e11] [cursor=pointer]:
          - /url: /#features
        - link "Showcase" [ref=e12] [cursor=pointer]:
          - /url: /#showcase
      - generic [ref=e13]:
        - button "Change language" [ref=e15] [cursor=pointer]:
          - img [ref=e16]
          - generic [ref=e20]: EN
        - button "Switch to dark mode" [ref=e21] [cursor=pointer]:
          - img [ref=e23]
        - link "Start creating" [ref=e34] [cursor=pointer]:
          - /url: /studio
          - button "Start creating" [ref=e35]:
            - img [ref=e36]
            - text: Start creating
        - button "Account" [ref=e43] [cursor=pointer]:
          - generic [ref=e44]: H
          - img [ref=e45]
  - main [ref=e48]:
    - generic [ref=e49]:
      - heading "Membership" [level=1] [ref=e50]
      - generic [ref=e51]:
        - link "Print orders" [ref=e52] [cursor=pointer]:
          - /url: /print-orders
          - button "Print orders" [ref=e53]:
            - img [ref=e54]
            - text: Print orders
        - button "Refresh" [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - text: Refresh
    - generic [ref=e64]:
      - generic [ref=e65]:
        - img [ref=e66]
        - text: Plan Free · credits remaining
      - paragraph [ref=e72]:
        - text: "20"
        - generic [ref=e73]: / 20 per month
    - generic [ref=e74]:
      - generic [ref=e75]:
        - heading "Free" [level=3] [ref=e76]
        - paragraph [ref=e77]: Free
        - paragraph [ref=e78]:
          - img [ref=e79]
          - text: 20 credits / month
        - button "Current plan" [disabled] [ref=e82]
      - generic [ref=e83]:
        - heading "Pro" [level=3] [ref=e84]
        - paragraph [ref=e85]: 199.000 ₫ /mo
        - paragraph [ref=e86]:
          - img [ref=e87]
          - text: 500 credits / month
        - generic [ref=e90]:
          - button "Buy with VNPay" [ref=e91] [cursor=pointer]
          - button "Buy with MoMo" [ref=e92] [cursor=pointer]
  - contentinfo [ref=e93]:
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]:
          - link "InnerStyle" [ref=e97] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e98]
          - paragraph [ref=e99]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e100]:
          - generic [ref=e101]:
            - heading "Product" [level=4] [ref=e102]
            - list [ref=e103]:
              - listitem [ref=e104]:
                - link "Studio" [ref=e105] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e106]:
                - link "How it works" [ref=e107] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e108]:
                - link "Features" [ref=e109] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e110]:
            - heading "Pipeline" [level=4] [ref=e111]
            - list [ref=e112]:
              - listitem [ref=e113]:
                - link "Image to 3D" [ref=e114] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e115]:
                - link "Text to 3D" [ref=e116] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e117]:
                - link "Rig & Animate" [ref=e118] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e119]:
            - heading "Resources" [level=4] [ref=e120]
            - list [ref=e121]:
              - listitem [ref=e122]:
                - link "MeshyAI Docs" [ref=e123] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e124]:
                - link "API Reference" [ref=e125] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e126]:
                - link "Support" [ref=e127] [cursor=pointer]:
                  - /url: /
      - generic [ref=e128]:
        - paragraph [ref=e129]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e130]:
          - link "social link" [ref=e131] [cursor=pointer]:
            - /url: "#"
            - img [ref=e132]
          - link "social link" [ref=e135] [cursor=pointer]:
            - /url: "#"
            - img [ref=e136]
          - link "social link" [ref=e138] [cursor=pointer]:
            - /url: "#"
            - img [ref=e139]
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
> 51 |     await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
     |                                                              ^ Error: expect(locator).toBeVisible() failed
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
  75 |     await expect(page.getByText("Couldn't load membership")).toBeVisible();
  76 |   });
  77 | });
  78 | 
```