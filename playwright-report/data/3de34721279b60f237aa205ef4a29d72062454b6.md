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
        - text: Plan · credits remaining
      - paragraph [ref=e59]:
        - text: —
        - generic [ref=e60]: / per month
  - contentinfo [ref=e61]:
    - generic [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]:
          - link "InnerStyle" [ref=e65]:
            - /url: /
            - img "InnerStyle" [ref=e66]
          - paragraph [ref=e67]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e68]:
          - generic [ref=e69]:
            - heading "Product" [level=4] [ref=e70]
            - list [ref=e71]:
              - listitem [ref=e72]:
                - link "Studio" [ref=e73]:
                  - /url: /studio
              - listitem [ref=e74]:
                - link "How it works" [ref=e75]:
                  - /url: /#how
              - listitem [ref=e76]:
                - link "Features" [ref=e77]:
                  - /url: /#features
          - generic [ref=e78]:
            - heading "Pipeline" [level=4] [ref=e79]
            - list [ref=e80]:
              - listitem [ref=e81]:
                - link "Image to 3D" [ref=e82]:
                  - /url: /studio
              - listitem [ref=e83]:
                - link "Text to 3D" [ref=e84]:
                  - /url: /studio
              - listitem [ref=e85]:
                - link "Rig & Animate" [ref=e86]:
                  - /url: /studio
          - generic [ref=e87]:
            - heading "Resources" [level=4] [ref=e88]
            - list [ref=e89]:
              - listitem [ref=e90]:
                - link "MeshyAI Docs" [ref=e91]:
                  - /url: /
              - listitem [ref=e92]:
                - link "API Reference" [ref=e93]:
                  - /url: /
              - listitem [ref=e94]:
                - link "Support" [ref=e95]:
                  - /url: /
      - generic [ref=e96]:
        - paragraph [ref=e97]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e98]:
          - link "social link" [ref=e99]:
            - /url: "#"
            - img [ref=e100]
          - link "social link" [ref=e103]:
            - /url: "#"
            - img [ref=e104]
          - link "social link" [ref=e106]:
            - /url: "#"
            - img [ref=e107]
  - generic:
    - generic [ref=e109]:
      - img [ref=e110]
      - generic [ref=e112]:
        - paragraph [ref=e113]: Couldn't load membership
        - paragraph [ref=e114]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e115] [cursor=pointer]:
        - img [ref=e116]
    - generic [ref=e119]:
      - img [ref=e120]
      - generic [ref=e122]:
        - paragraph [ref=e123]: Couldn't load membership
        - paragraph [ref=e124]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e125] [cursor=pointer]:
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