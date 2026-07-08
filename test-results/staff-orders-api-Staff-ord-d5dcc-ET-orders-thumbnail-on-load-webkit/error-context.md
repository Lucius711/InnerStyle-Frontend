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
        - button "Account" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: S
          - img [ref=e31]
  - generic [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - heading "Order fulfilment" [level=1] [ref=e37]:
          - img [ref=e38]
          - text: Order fulfilment
        - paragraph [ref=e42]: Incoming customer 3D-print orders with contact, address and model files.
      - button "Refresh" [ref=e43] [cursor=pointer]:
        - img [ref=e44]
        - text: Refresh
    - generic [ref=e49]:
      - button "All" [ref=e50] [cursor=pointer]
      - button "PENDING" [ref=e51] [cursor=pointer]
      - button "PAID" [ref=e52] [cursor=pointer]
      - button "IN_PRODUCTION" [ref=e53] [cursor=pointer]
      - button "SHIPPED" [ref=e54] [cursor=pointer]
      - button "COMPLETED" [ref=e55] [cursor=pointer]
      - button "CANCELLED" [ref=e56] [cursor=pointer]
    - list [ref=e57]:
      - listitem [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - img [ref=e62]
            - generic [ref=e66]:
              - generic [ref=e67]:
                - generic [ref=e68]: PAID
                - generic [ref=e69]: "#ord-abcd"
              - paragraph [ref=e70]: 7/8/2026, 5:24:06 PM · 199.000 ₫
          - generic [ref=e71]:
            - button "GLB" [ref=e74] [cursor=pointer]:
              - generic [ref=e75]: GLB
              - img [ref=e76]
            - button "Download" [ref=e79] [cursor=pointer]:
              - img [ref=e80]
              - text: Download
            - button "Set status…" [ref=e84] [cursor=pointer]:
              - text: Set status…
              - img [ref=e85]
        - generic [ref=e87]:
          - generic [ref=e88]:
            - paragraph [ref=e89]: Recipient
            - paragraph [ref=e90]:
              - img [ref=e91]
              - text: Nguyen A
            - paragraph [ref=e94]:
              - img [ref=e95]
              - text: "0900000000"
            - paragraph [ref=e97]:
              - img [ref=e98]
              - text: a@example.com
          - generic [ref=e101]:
            - paragraph [ref=e102]: Ship to
            - paragraph [ref=e103]:
              - img [ref=e104]
              - generic [ref=e107]: 1 Street, Ward, City
        - paragraph [ref=e108]: "Placed by: Cust"
        - generic [ref=e110]:
          - heading "Printability" [level=4] [ref=e112]:
            - img [ref=e113]
            - text: Printability
          - button "Check printability" [ref=e116] [cursor=pointer]:
            - img [ref=e117]
            - text: Check printability
          - paragraph [ref=e120]: Geometry analysis for 3D printing. Auto-fix makes the mesh watertight and downloads a printable STL (geometry only, no color).
  - contentinfo [ref=e121]:
    - generic [ref=e122]:
      - generic [ref=e123]:
        - generic [ref=e124]:
          - link "InnerStyle" [ref=e125]:
            - /url: /
            - img "InnerStyle" [ref=e126]
          - paragraph [ref=e127]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e128]:
          - generic [ref=e129]:
            - heading "Product" [level=4] [ref=e130]
            - list [ref=e131]:
              - listitem [ref=e132]:
                - link "Studio" [ref=e133]:
                  - /url: /studio
              - listitem [ref=e134]:
                - link "How it works" [ref=e135]:
                  - /url: /#how
              - listitem [ref=e136]:
                - link "Features" [ref=e137]:
                  - /url: /#features
          - generic [ref=e138]:
            - heading "Pipeline" [level=4] [ref=e139]
            - list [ref=e140]:
              - listitem [ref=e141]:
                - link "Image to 3D" [ref=e142]:
                  - /url: /studio
              - listitem [ref=e143]:
                - link "Text to 3D" [ref=e144]:
                  - /url: /studio
              - listitem [ref=e145]:
                - link "Rig & Animate" [ref=e146]:
                  - /url: /studio
          - generic [ref=e147]:
            - heading "Resources" [level=4] [ref=e148]
            - list [ref=e149]:
              - listitem [ref=e150]:
                - link "MeshyAI Docs" [ref=e151]:
                  - /url: /
              - listitem [ref=e152]:
                - link "API Reference" [ref=e153]:
                  - /url: /
              - listitem [ref=e154]:
                - link "Support" [ref=e155]:
                  - /url: /
      - generic [ref=e156]:
        - paragraph [ref=e157]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e158]:
          - link "social link" [ref=e159]:
            - /url: "#"
            - img [ref=e160]
          - link "social link" [ref=e163]:
            - /url: "#"
            - img [ref=e164]
          - link "social link" [ref=e166]:
            - /url: "#"
            - img [ref=e167]
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