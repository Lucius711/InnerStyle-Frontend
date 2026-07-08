# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-orders-api.spec.ts >> Staff orders API >> TC-API-STF-003: PATCH /status advances the order
- Location: e2e\staff-orders-api.spec.ts:78:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'IN_PRODUCTION' }) resolved to 2 elements:
    1) <button type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors border-app-line/10 bg-app-line/[0.03] text-app-muted hover:text-app-text">IN_PRODUCTION</button> aka getByRole('button', { name: 'IN_PRODUCTION' }).first()
    2) <button type="button" class="flex w-full items-center rounded-xl px-2 py-1.5 transition-colors hover:bg-app-line/5">…</button> aka getByRole('button', { name: 'IN_PRODUCTION' }).nth(1)

Call log:
  - waiting for getByRole('button', { name: 'IN_PRODUCTION' })

```

```
Error: page.waitForRequest: Test ended.
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
          - generic [ref=e18]: EN
        - button "Switch to dark mode" [ref=e19] [cursor=pointer]:
          - img [ref=e21]
        - button "Account" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]: S
          - img [ref=e34]
  - generic [ref=e37]:
    - generic [ref=e38]:
      - generic [ref=e39]:
        - heading "Order fulfilment" [level=1] [ref=e40]:
          - img [ref=e41]
          - text: Order fulfilment
        - paragraph [ref=e46]: Incoming customer 3D-print orders with contact, address and model files.
      - button "Refresh" [ref=e47] [cursor=pointer]:
        - img [ref=e48]
        - text: Refresh
    - generic [ref=e53]:
      - button "All" [ref=e54] [cursor=pointer]
      - button "PENDING" [ref=e55] [cursor=pointer]
      - button "PAID" [ref=e56] [cursor=pointer]
      - button "IN_PRODUCTION" [ref=e57] [cursor=pointer]
      - button "SHIPPED" [ref=e58] [cursor=pointer]
      - button "COMPLETED" [ref=e59] [cursor=pointer]
      - button "CANCELLED" [ref=e60] [cursor=pointer]
    - list [ref=e61]:
      - listitem [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - img [ref=e66]
            - generic [ref=e71]:
              - generic [ref=e72]:
                - generic [ref=e73]: PAID
                - generic [ref=e74]: "#ord-abcd"
              - paragraph [ref=e75]: 7/8/2026, 5:22:59 PM · 199.000 ₫
          - generic [ref=e76]:
            - button "GLB" [ref=e79] [cursor=pointer]:
              - generic [ref=e80]: GLB
              - img [ref=e81]
            - button "Download" [ref=e84] [cursor=pointer]:
              - img [ref=e85]
              - text: Download
            - generic [ref=e89]:
              - button "Set status…" [active] [ref=e90] [cursor=pointer]:
                - text: Set status…
                - img [ref=e91]
              - list [ref=e93]:
                - listitem [ref=e94]:
                  - button "IN_PRODUCTION" [ref=e95] [cursor=pointer]:
                    - generic [ref=e96]: IN_PRODUCTION
                - listitem [ref=e97]:
                  - button "SHIPPED" [ref=e98] [cursor=pointer]:
                    - generic [ref=e99]: SHIPPED
                - listitem [ref=e100]:
                  - button "COMPLETED" [ref=e101] [cursor=pointer]:
                    - generic [ref=e102]: COMPLETED
                - listitem [ref=e103]:
                  - button "CANCELLED" [ref=e104] [cursor=pointer]:
                    - generic [ref=e105]: CANCELLED
        - generic [ref=e106]:
          - generic [ref=e107]:
            - paragraph [ref=e108]: Recipient
            - paragraph [ref=e109]:
              - img [ref=e110]
              - text: Nguyen A
            - paragraph [ref=e113]:
              - img [ref=e114]
              - text: "0900000000"
            - paragraph [ref=e116]:
              - img [ref=e117]
              - text: a@example.com
          - generic [ref=e120]:
            - paragraph [ref=e121]: Ship to
            - paragraph [ref=e122]:
              - img [ref=e123]
              - generic [ref=e126]: 1 Street, Ward, City
        - paragraph [ref=e127]: "Placed by: Cust"
        - generic [ref=e129]:
          - heading "Printability" [level=4] [ref=e131]:
            - img [ref=e132]
            - text: Printability
          - button "Check printability" [ref=e135] [cursor=pointer]:
            - img [ref=e136]
            - text: Check printability
          - paragraph [ref=e139]: Geometry analysis for 3D printing. Auto-fix makes the mesh watertight and downloads a printable STL (geometry only, no color).
  - contentinfo [ref=e140]:
    - generic [ref=e141]:
      - generic [ref=e142]:
        - generic [ref=e143]:
          - link "InnerStyle" [ref=e144] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e145]
          - paragraph [ref=e146]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e147]:
          - generic [ref=e148]:
            - heading "Product" [level=4] [ref=e149]
            - list [ref=e150]:
              - listitem [ref=e151]:
                - link "Studio" [ref=e152] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e153]:
                - link "How it works" [ref=e154] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e155]:
                - link "Features" [ref=e156] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e157]:
            - heading "Pipeline" [level=4] [ref=e158]
            - list [ref=e159]:
              - listitem [ref=e160]:
                - link "Image to 3D" [ref=e161] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e162]:
                - link "Text to 3D" [ref=e163] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e164]:
                - link "Rig & Animate" [ref=e165] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e166]:
            - heading "Resources" [level=4] [ref=e167]
            - list [ref=e168]:
              - listitem [ref=e169]:
                - link "MeshyAI Docs" [ref=e170] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e171]:
                - link "API Reference" [ref=e172] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e173]:
                - link "Support" [ref=e174] [cursor=pointer]:
                  - /url: /
      - generic [ref=e175]:
        - paragraph [ref=e176]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e177]:
          - link "social link" [ref=e178] [cursor=pointer]:
            - /url: "#"
            - img [ref=e179]
          - link "social link" [ref=e182] [cursor=pointer]:
            - /url: "#"
            - img [ref=e183]
          - link "social link" [ref=e185] [cursor=pointer]:
            - /url: "#"
            - img [ref=e186]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { ok, authed, STAFF } from "./helpers";
  3   | 
  4   | /**
  5   |  * Staff fulfilment dashboard — exercises the staff order APIs reachable through the UI:
  6   |  *   GET   /api/staff/orders                       (list, with ?status filter)
  7   |  *   GET   /api/staff/orders/{id}/thumbnail        (order preview image)
  8   |  *   PATCH /api/staff/orders/{id}/status           (advance status)
  9   |  *   GET   /api/staff/orders/{id}/model            (download)
  10  |  *   GET   /api/staff/orders/{id}/printability     (analyse)
  11  |  *   POST  /api/staff/orders/{id}/repair           (auto-fix)
  12  |  * (GET /api/staff/orders/{id} has no UI trigger — the list returns full rows — so it is omitted.)
  13  |  */
  14  | const ORDER = {
  15  |   id: "ord-abcd-1234-5678",
  16  |   status: "PAID",
  17  |   amount: 199000,
  18  |   createdAt: new Date().toISOString(),
  19  |   sourceTaskId: "task-1",
  20  |   recipientName: "Nguyen A",
  21  |   recipientPhone: "0900000000",
  22  |   recipientEmail: "a@example.com",
  23  |   addressDetail: "1 Street",
  24  |   wardName: "Ward",
  25  |   provinceName: "City",
  26  |   customerName: "Cust",
  27  |   customerEmail: "c@example.com",
  28  |   note: null,
  29  | };
  30  | 
  31  | const json = (route, body, status = 200) =>
  32  |   route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  33  | 
  34  | async function mockStaff(page) {
  35  |   await page.route(/\/api\/staff\/orders\?/, (r) => json(r, ok({ content: [ORDER], last: true })));
  36  |   await page.route(/\/api\/staff\/orders\/[^/]+\/thumbnail/, (r) => r.fulfill({ status: 204, body: "" }));
  37  |   await page.route(/\/api\/staff\/orders\/[^/]+\/status/, (r) =>
  38  |     json(r, ok({ ...ORDER, status: "IN_PRODUCTION" }))
  39  |   );
  40  |   await page.route(/\/api\/staff\/orders\/[^/]+\/model/, (r) =>
  41  |     r.fulfill({ status: 200, contentType: "application/zip", body: "PK" })
  42  |   );
  43  |   await page.route(/\/api\/staff\/orders\/[^/]+\/printability/, (r) =>
  44  |     json(r, ok({ watertight: false, volume: 12.3, holes: 2, nonManifoldEdges: 1, triangles: 1000 }))
  45  |   );
  46  |   await page.route(/\/api\/staff\/orders\/[^/]+\/repair/, (r) =>
  47  |     json(r, ok({ after: { watertight: true, holes: 0, nonManifoldEdges: 0, triangles: 1000 } }))
  48  |   );
  49  | }
  50  | 
  51  | test.describe("Staff orders API", () => {
  52  |   test("TC-API-STF-001: GET /orders + /thumbnail on load", async ({ page }) => {
  53  |     await authed(page, STAFF);
  54  |     await mockStaff(page);
  55  | 
  56  |     const listReq = page.waitForRequest((r) => /\/api\/staff\/orders\?/.test(r.url()) && r.method() === "GET");
  57  |     const thumbReq = page.waitForRequest((r) => /\/api\/staff\/orders\/[^/]+\/thumbnail/.test(r.url()));
  58  |     await page.goto("/staff");
  59  |     await listReq;
  60  |     await thumbReq;
  61  | 
  62  |     await expect(page.getByText("PAID")).toBeVisible();
  63  |     await expect(page.getByText("#ord-abcd")).toBeVisible(); // id.slice(0, 8)
  64  |   });
  65  | 
  66  |   test("TC-API-STF-002: status filter re-queries GET /orders?status=PENDING", async ({ page }) => {
  67  |     await authed(page, STAFF);
  68  |     await mockStaff(page);
  69  |     await page.goto("/staff");
  70  | 
  71  |     const filtered = page.waitForRequest(
  72  |       (r) => r.url().includes("/api/staff/orders") && new URL(r.url()).searchParams.get("status") === "PENDING"
  73  |     );
  74  |     await page.getByRole("button", { name: "PENDING" }).click();
  75  |     await filtered;
  76  |   });
  77  | 
  78  |   test("TC-API-STF-003: PATCH /status advances the order", async ({ page }) => {
  79  |     await authed(page, STAFF);
  80  |     await mockStaff(page);
  81  |     await page.goto("/staff");
  82  |     await expect(page.getByText("#ord-abcd")).toBeVisible();
  83  | 
  84  |     await page.getByRole("button", { name: /Set status/ }).click();
> 85  |     const patch = page.waitForRequest(
      |                        ^ Error: page.waitForRequest: Test ended.
  86  |       (r) => /\/api\/staff\/orders\/[^/]+\/status/.test(r.url()) && r.method() === "PATCH"
  87  |     );
  88  |     await page.getByRole("button", { name: "IN_PRODUCTION" }).click();
  89  |     const req = await patch;
  90  |     expect(req.postDataJSON()).toMatchObject({ status: "IN_PRODUCTION" });
  91  |     await expect(page.getByText("Status updated")).toBeVisible();
  92  |   });
  93  | 
  94  |   test("TC-API-STF-004: Download triggers GET /model", async ({ page }) => {
  95  |     await authed(page, STAFF);
  96  |     await mockStaff(page);
  97  |     await page.goto("/staff");
  98  |     await expect(page.getByText("#ord-abcd")).toBeVisible();
  99  | 
  100 |     const modelReq = page.waitForRequest(
  101 |       (r) => /\/api\/staff\/orders\/[^/]+\/model/.test(r.url()) && r.method() === "GET"
  102 |     );
  103 |     await page.getByRole("button", { name: "Download" }).click();
  104 |     await modelReq;
  105 |   });
  106 | 
  107 |   test("TC-API-STF-005: printability check then auto-fix (GET /printability, POST /repair)", async ({ page }) => {
  108 |     await authed(page, STAFF);
  109 |     await mockStaff(page);
  110 |     await page.goto("/staff");
  111 |     await expect(page.getByText("#ord-abcd")).toBeVisible();
  112 | 
  113 |     const checkReq = page.waitForRequest(
  114 |       (r) => /\/api\/staff\/orders\/[^/]+\/printability/.test(r.url()) && r.method() === "GET"
  115 |     );
  116 |     await page.getByRole("button", { name: "Check printability" }).click();
  117 |     await checkReq;
  118 |     await expect(page.getByText("Needs repair")).toBeVisible();
  119 | 
  120 |     const repairReq = page.waitForRequest(
  121 |       (r) => /\/api\/staff\/orders\/[^/]+\/repair/.test(r.url()) && r.method() === "POST"
  122 |     );
  123 |     await page.getByRole("button", { name: "Auto-fix & download STL" }).click();
  124 |     await repairReq;
  125 |   });
  126 | });
  127 | 
```