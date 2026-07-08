# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: staff-orders-api.spec.ts >> Staff orders API >> TC-API-STF-001: GET /orders + /thumbnail on load
- Location: e2e\staff-orders-api.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('PAID')
Expected: visible
Error: strict mode violation: getByText('PAID') resolved to 2 elements:
    1) <button type="button" class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors border-app-line/10 bg-app-line/[0.03] text-app-muted hover:text-app-text">PAID</button> aka getByRole('button', { name: 'PAID' })
    2) <span class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 border-emerald-400/25">PAID</span> aka locator('span').filter({ hasText: 'PAID' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('PAID')

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
        - button "Account" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: S
          - img [ref=e36]
  - generic [ref=e39]:
    - generic [ref=e40]:
      - generic [ref=e41]:
        - heading "Order fulfilment" [level=1] [ref=e42]:
          - img [ref=e43]
          - text: Order fulfilment
        - paragraph [ref=e48]: Incoming customer 3D-print orders with contact, address and model files.
      - button "Refresh" [ref=e49] [cursor=pointer]:
        - img [ref=e50]
        - text: Refresh
    - generic [ref=e55]:
      - button "All" [ref=e56] [cursor=pointer]
      - button "PENDING" [ref=e57] [cursor=pointer]
      - button "PAID" [ref=e58] [cursor=pointer]
      - button "IN_PRODUCTION" [ref=e59] [cursor=pointer]
      - button "SHIPPED" [ref=e60] [cursor=pointer]
      - button "COMPLETED" [ref=e61] [cursor=pointer]
      - button "CANCELLED" [ref=e62] [cursor=pointer]
    - list [ref=e63]:
      - listitem [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - img [ref=e68]
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: PAID
                - generic [ref=e76]: "#ord-abcd"
              - paragraph [ref=e77]: 7/8/2026, 5:22:57 PM · 199.000 ₫
          - generic [ref=e78]:
            - button "GLB" [ref=e81] [cursor=pointer]:
              - generic [ref=e82]: GLB
              - img [ref=e83]
            - button "Download" [ref=e86] [cursor=pointer]:
              - img [ref=e87]
              - text: Download
            - button "Set status…" [ref=e92] [cursor=pointer]:
              - text: Set status…
              - img [ref=e93]
        - generic [ref=e95]:
          - generic [ref=e96]:
            - paragraph [ref=e97]: Recipient
            - paragraph [ref=e98]:
              - img [ref=e99]
              - text: Nguyen A
            - paragraph [ref=e102]:
              - img [ref=e103]
              - text: "0900000000"
            - paragraph [ref=e105]:
              - img [ref=e106]
              - text: a@example.com
          - generic [ref=e109]:
            - paragraph [ref=e110]: Ship to
            - paragraph [ref=e111]:
              - img [ref=e112]
              - generic [ref=e115]: 1 Street, Ward, City
        - paragraph [ref=e116]: "Placed by: Cust"
        - generic [ref=e118]:
          - heading "Printability" [level=4] [ref=e120]:
            - img [ref=e121]
            - text: Printability
          - button "Check printability" [ref=e124] [cursor=pointer]:
            - img [ref=e125]
            - text: Check printability
          - paragraph [ref=e128]: Geometry analysis for 3D printing. Auto-fix makes the mesh watertight and downloads a printable STL (geometry only, no color).
  - contentinfo [ref=e129]:
    - generic [ref=e130]:
      - generic [ref=e131]:
        - generic [ref=e132]:
          - link "InnerStyle" [ref=e133] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e134]
          - paragraph [ref=e135]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e136]:
          - generic [ref=e137]:
            - heading "Product" [level=4] [ref=e138]
            - list [ref=e139]:
              - listitem [ref=e140]:
                - link "Studio" [ref=e141] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e142]:
                - link "How it works" [ref=e143] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e144]:
                - link "Features" [ref=e145] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e146]:
            - heading "Pipeline" [level=4] [ref=e147]
            - list [ref=e148]:
              - listitem [ref=e149]:
                - link "Image to 3D" [ref=e150] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e151]:
                - link "Text to 3D" [ref=e152] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e153]:
                - link "Rig & Animate" [ref=e154] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e155]:
            - heading "Resources" [level=4] [ref=e156]
            - list [ref=e157]:
              - listitem [ref=e158]:
                - link "MeshyAI Docs" [ref=e159] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e160]:
                - link "API Reference" [ref=e161] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e162]:
                - link "Support" [ref=e163] [cursor=pointer]:
                  - /url: /
      - generic [ref=e164]:
        - paragraph [ref=e165]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e166]:
          - link "social link" [ref=e167] [cursor=pointer]:
            - /url: "#"
            - img [ref=e168]
          - link "social link" [ref=e171] [cursor=pointer]:
            - /url: "#"
            - img [ref=e172]
          - link "social link" [ref=e174] [cursor=pointer]:
            - /url: "#"
            - img [ref=e175]
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
> 62  |     await expect(page.getByText("PAID")).toBeVisible();
      |                                          ^ Error: expect(locator).toBeVisible() failed
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
  85  |     const patch = page.waitForRequest(
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