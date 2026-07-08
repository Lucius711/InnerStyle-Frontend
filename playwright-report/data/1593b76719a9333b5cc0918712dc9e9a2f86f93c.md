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
        - text: Plan · credits remaining
      - paragraph [ref=e72]:
        - text: —
        - generic [ref=e73]: / per month
  - contentinfo [ref=e74]:
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e77]:
          - link "InnerStyle" [ref=e78] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e79]
          - paragraph [ref=e80]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e81]:
          - generic [ref=e82]:
            - heading "Product" [level=4] [ref=e83]
            - list [ref=e84]:
              - listitem [ref=e85]:
                - link "Studio" [ref=e86] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e87]:
                - link "How it works" [ref=e88] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e89]:
                - link "Features" [ref=e90] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e91]:
            - heading "Pipeline" [level=4] [ref=e92]
            - list [ref=e93]:
              - listitem [ref=e94]:
                - link "Image to 3D" [ref=e95] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e96]:
                - link "Text to 3D" [ref=e97] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e98]:
                - link "Rig & Animate" [ref=e99] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e100]:
            - heading "Resources" [level=4] [ref=e101]
            - list [ref=e102]:
              - listitem [ref=e103]:
                - link "MeshyAI Docs" [ref=e104] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e105]:
                - link "API Reference" [ref=e106] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e107]:
                - link "Support" [ref=e108] [cursor=pointer]:
                  - /url: /
      - generic [ref=e109]:
        - paragraph [ref=e110]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e111]:
          - link "social link" [ref=e112] [cursor=pointer]:
            - /url: "#"
            - img [ref=e113]
          - link "social link" [ref=e116] [cursor=pointer]:
            - /url: "#"
            - img [ref=e117]
          - link "social link" [ref=e119] [cursor=pointer]:
            - /url: "#"
            - img [ref=e120]
  - generic:
    - generic [ref=e123]:
      - img [ref=e124]
      - generic [ref=e128]:
        - paragraph [ref=e129]: Couldn't load membership
        - paragraph [ref=e130]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e131] [cursor=pointer]:
        - img [ref=e132]
    - generic [ref=e135]:
      - img [ref=e136]
      - generic [ref=e140]:
        - paragraph [ref=e141]: Couldn't load membership
        - paragraph [ref=e142]: Something went wrong. Please try again.
      - button "Dismiss notification" [ref=e143] [cursor=pointer]:
        - img [ref=e144]
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