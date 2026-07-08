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
      - link "InnerStyle" [ref=e7]:
        - /url: /
        - img "InnerStyle" [ref=e8]
      - generic [ref=e9]:
        - link "How it works" [ref=e10]:
          - /url: /#how
        - link "Features" [ref=e11]:
          - /url: /#features
        - link "Showcase" [ref=e12]:
          - /url: /#showcase
      - generic [ref=e13]:
        - button "Change language" [ref=e15] [cursor=pointer]:
          - img [ref=e16]
          - generic [ref=e19]: EN
        - button "Switch to dark mode" [ref=e20] [cursor=pointer]:
          - img [ref=e22]
        - link "Start creating" [ref=e29]:
          - /url: /studio
          - button "Start creating" [ref=e30] [cursor=pointer]:
            - img [ref=e31]
            - text: Start creating
        - button "Account" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: H
          - img [ref=e36]
  - main [ref=e39]:
    - generic [ref=e40]:
      - heading "Membership" [level=1] [ref=e41]
      - generic [ref=e42]:
        - link "Print orders" [ref=e43]:
          - /url: /print-orders
          - button "Print orders" [ref=e44] [cursor=pointer]:
            - img [ref=e45]
            - text: Print orders
        - button "Refresh" [ref=e49] [cursor=pointer]:
          - img [ref=e50]
          - text: Refresh
    - generic [ref=e55]:
      - generic [ref=e56]:
        - img [ref=e57]
        - text: Plan Free · credits remaining
      - paragraph [ref=e59]:
        - text: "20"
        - generic [ref=e60]: / 20 per month
    - generic [ref=e61]:
      - generic [ref=e62]:
        - heading "Free" [level=3] [ref=e63]
        - paragraph [ref=e64]: Free
        - paragraph [ref=e65]:
          - img [ref=e66]
          - text: 20 credits / month
        - button "Current plan" [disabled] [ref=e69]
      - generic [ref=e70]:
        - heading "Pro" [level=3] [ref=e71]
        - paragraph [ref=e72]: 199.000 ₫ /mo
        - paragraph [ref=e73]:
          - img [ref=e74]
          - text: 500 credits / month
        - generic [ref=e77]:
          - button "Buy with VNPay" [ref=e78] [cursor=pointer]
          - button "Buy with MoMo" [ref=e79] [cursor=pointer]
  - contentinfo [ref=e80]:
    - generic [ref=e81]:
      - generic [ref=e82]:
        - generic [ref=e83]:
          - link "InnerStyle" [ref=e84]:
            - /url: /
            - img "InnerStyle" [ref=e85]
          - paragraph [ref=e86]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "Product" [level=4] [ref=e89]
            - list [ref=e90]:
              - listitem [ref=e91]:
                - link "Studio" [ref=e92]:
                  - /url: /studio
              - listitem [ref=e93]:
                - link "How it works" [ref=e94]:
                  - /url: /#how
              - listitem [ref=e95]:
                - link "Features" [ref=e96]:
                  - /url: /#features
          - generic [ref=e97]:
            - heading "Pipeline" [level=4] [ref=e98]
            - list [ref=e99]:
              - listitem [ref=e100]:
                - link "Image to 3D" [ref=e101]:
                  - /url: /studio
              - listitem [ref=e102]:
                - link "Text to 3D" [ref=e103]:
                  - /url: /studio
              - listitem [ref=e104]:
                - link "Rig & Animate" [ref=e105]:
                  - /url: /studio
          - generic [ref=e106]:
            - heading "Resources" [level=4] [ref=e107]
            - list [ref=e108]:
              - listitem [ref=e109]:
                - link "MeshyAI Docs" [ref=e110]:
                  - /url: /
              - listitem [ref=e111]:
                - link "API Reference" [ref=e112]:
                  - /url: /
              - listitem [ref=e113]:
                - link "Support" [ref=e114]:
                  - /url: /
      - generic [ref=e115]:
        - paragraph [ref=e116]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e117]:
          - link "social link" [ref=e118]:
            - /url: "#"
            - img [ref=e119]
          - link "social link" [ref=e122]:
            - /url: "#"
            - img [ref=e123]
          - link "social link" [ref=e125]:
            - /url: "#"
            - img [ref=e126]
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