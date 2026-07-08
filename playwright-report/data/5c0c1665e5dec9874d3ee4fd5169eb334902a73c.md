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
      - link "InnerStyle" [ref=e5]:
        - /url: /
        - img "InnerStyle" [ref=e6]
      - generic [ref=e7]:
        - link "How it works" [ref=e8]:
          - /url: /#how
        - link "Features" [ref=e9]:
          - /url: /#features
        - link "Showcase" [ref=e10]:
          - /url: /#showcase
      - generic [ref=e11]:
        - button "Change language" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
          - generic [ref=e17]: EN
        - button "Switch to dark mode" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
        - button "Account" [ref=e27] [cursor=pointer]:
          - generic [ref=e28]: S
          - img [ref=e29]
  - generic [ref=e32]:
    - generic [ref=e33]:
      - generic [ref=e34]:
        - heading "Order fulfilment" [level=1] [ref=e35]:
          - img [ref=e36]
          - text: Order fulfilment
        - paragraph [ref=e40]: Incoming customer 3D-print orders with contact, address and model files.
      - button "Refresh" [ref=e41] [cursor=pointer]:
        - img [ref=e42]
        - text: Refresh
    - generic [ref=e47]:
      - button "All" [ref=e48] [cursor=pointer]
      - button "PENDING" [ref=e49] [cursor=pointer]
      - button "PAID" [ref=e50] [cursor=pointer]
      - button "IN_PRODUCTION" [ref=e51] [cursor=pointer]
      - button "SHIPPED" [ref=e52] [cursor=pointer]
      - button "COMPLETED" [ref=e53] [cursor=pointer]
      - button "CANCELLED" [ref=e54] [cursor=pointer]
    - list [ref=e55]:
      - listitem [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - img [ref=e60]
            - generic [ref=e64]:
              - generic [ref=e65]:
                - generic [ref=e66]: PAID
                - generic [ref=e67]: "#ord-abcd"
              - paragraph [ref=e68]: 7/8/2026, 5:24:07 PM · 199.000 ₫
          - generic [ref=e69]:
            - button "GLB" [ref=e72] [cursor=pointer]:
              - generic [ref=e73]: GLB
              - img [ref=e74]
            - button "Download" [ref=e77] [cursor=pointer]:
              - img [ref=e78]
              - text: Download
            - generic [ref=e81]:
              - button "Set status…" [ref=e82] [cursor=pointer]:
                - text: Set status…
                - img [ref=e83]
              - list [ref=e85]:
                - listitem [ref=e86]:
                  - button "IN_PRODUCTION" [ref=e87] [cursor=pointer]:
                    - generic [ref=e88]: IN_PRODUCTION
                - listitem [ref=e89]:
                  - button "SHIPPED" [ref=e90] [cursor=pointer]:
                    - generic [ref=e91]: SHIPPED
                - listitem [ref=e92]:
                  - button "COMPLETED" [ref=e93] [cursor=pointer]:
                    - generic [ref=e94]: COMPLETED
                - listitem [ref=e95]:
                  - button "CANCELLED" [ref=e96] [cursor=pointer]:
                    - generic [ref=e97]: CANCELLED
        - generic [ref=e98]:
          - generic [ref=e99]:
            - paragraph [ref=e100]: Recipient
            - paragraph [ref=e101]:
              - img [ref=e102]
              - text: Nguyen A
            - paragraph [ref=e105]:
              - img [ref=e106]
              - text: "0900000000"
            - paragraph [ref=e108]:
              - img [ref=e109]
              - text: a@example.com
          - generic [ref=e112]:
            - paragraph [ref=e113]: Ship to
            - paragraph [ref=e114]:
              - img [ref=e115]
              - generic [ref=e118]: 1 Street, Ward, City
        - paragraph [ref=e119]: "Placed by: Cust"
        - generic [ref=e121]:
          - heading "Printability" [level=4] [ref=e123]:
            - img [ref=e124]
            - text: Printability
          - button "Check printability" [ref=e127] [cursor=pointer]:
            - img [ref=e128]
            - text: Check printability
          - paragraph [ref=e131]: Geometry analysis for 3D printing. Auto-fix makes the mesh watertight and downloads a printable STL (geometry only, no color).
  - contentinfo [ref=e132]:
    - generic [ref=e133]:
      - generic [ref=e134]:
        - generic [ref=e135]:
          - link "InnerStyle" [ref=e136]:
            - /url: /
            - img "InnerStyle" [ref=e137]
          - paragraph [ref=e138]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e139]:
          - generic [ref=e140]:
            - heading "Product" [level=4] [ref=e141]
            - list [ref=e142]:
              - listitem [ref=e143]:
                - link "Studio" [ref=e144]:
                  - /url: /studio
              - listitem [ref=e145]:
                - link "How it works" [ref=e146]:
                  - /url: /#how
              - listitem [ref=e147]:
                - link "Features" [ref=e148]:
                  - /url: /#features
          - generic [ref=e149]:
            - heading "Pipeline" [level=4] [ref=e150]
            - list [ref=e151]:
              - listitem [ref=e152]:
                - link "Image to 3D" [ref=e153]:
                  - /url: /studio
              - listitem [ref=e154]:
                - link "Text to 3D" [ref=e155]:
                  - /url: /studio
              - listitem [ref=e156]:
                - link "Rig & Animate" [ref=e157]:
                  - /url: /studio
          - generic [ref=e158]:
            - heading "Resources" [level=4] [ref=e159]
            - list [ref=e160]:
              - listitem [ref=e161]:
                - link "MeshyAI Docs" [ref=e162]:
                  - /url: /
              - listitem [ref=e163]:
                - link "API Reference" [ref=e164]:
                  - /url: /
              - listitem [ref=e165]:
                - link "Support" [ref=e166]:
                  - /url: /
      - generic [ref=e167]:
        - paragraph [ref=e168]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e169]:
          - link "social link" [ref=e170]:
            - /url: "#"
            - img [ref=e171]
          - link "social link" [ref=e174]:
            - /url: "#"
            - img [ref=e175]
          - link "social link" [ref=e177]:
            - /url: "#"
            - img [ref=e178]
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