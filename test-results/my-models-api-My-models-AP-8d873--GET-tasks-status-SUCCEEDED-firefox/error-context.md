# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: my-models-api.spec.ts >> My models API >> TC-API-MDL-002: the status filter re-queries GET /tasks?status=SUCCEEDED
- Location: e2e\my-models-api.spec.ts:42:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Ready' }) resolved to 2 elements:
    1) <button type="button" class="focus-ring relative flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-app-muted hover:text-app-text">…</button> aka getByRole('button', { name: 'Ready', exact: true })
    2) <div tabindex="0" role="button" class="group glass relative cursor-pointer overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-glow">…</div> aka getByRole('button', { name: 'Ready Options Refine 5s ago' })

Call log:
  - waiting for getByRole('button', { name: 'Ready' })

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
        - link "Start creating" [ref=e32] [cursor=pointer]:
          - /url: /studio
          - button "Start creating" [ref=e33]:
            - img [ref=e34]
            - text: Start creating
        - button "Account" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]: H
          - img [ref=e43]
  - generic [ref=e47]:
    - generic [ref=e48]:
      - generic [ref=e49]: H
      - generic [ref=e50]:
        - heading "Huy" [level=1] [ref=e51]
        - paragraph [ref=e52]: huy@example.com
    - generic [ref=e53]:
      - link "Personal info" [ref=e54] [cursor=pointer]:
        - /url: /profile
        - img [ref=e55]
        - text: Personal info
      - link "My 3D models" [ref=e58] [cursor=pointer]:
        - /url: /my-3d-printing
        - img [ref=e59]
        - text: My 3D models
      - link "Print history" [ref=e72] [cursor=pointer]:
        - /url: /print-history
        - img [ref=e73]
        - text: Print history
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]:
          - heading "My 3D models" [level=2] [ref=e81]
          - paragraph [ref=e82]: Everything you've generated — open any model to view in 3D, download, or continue the pipeline.
        - button "Refresh" [ref=e83] [cursor=pointer]:
          - img [ref=e84]
          - text: Refresh
      - generic [ref=e90]:
        - button "All" [ref=e91] [cursor=pointer]: All
        - button "Ready" [ref=e93] [cursor=pointer]
        - button "Generating" [ref=e94] [cursor=pointer]
        - button "Failed" [ref=e95] [cursor=pointer]
      - button "Ready Options Refine 5s ago" [ref=e98] [cursor=pointer]:
        - generic [ref=e99]:
          - generic [ref=e101]: Ready
          - button "Options" [ref=e103]:
            - img [ref=e104]
        - generic [ref=e108]:
          - paragraph [ref=e109]: Refine
          - paragraph [ref=e110]:
            - img [ref=e111]
            - text: 5s ago
  - contentinfo [ref=e114]:
    - generic [ref=e115]:
      - generic [ref=e116]:
        - generic [ref=e117]:
          - link "InnerStyle" [ref=e118] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e119]
          - paragraph [ref=e120]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e121]:
          - generic [ref=e122]:
            - heading "Product" [level=4] [ref=e123]
            - list [ref=e124]:
              - listitem [ref=e125]:
                - link "Studio" [ref=e126] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e127]:
                - link "How it works" [ref=e128] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e129]:
                - link "Features" [ref=e130] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e131]:
            - heading "Pipeline" [level=4] [ref=e132]
            - list [ref=e133]:
              - listitem [ref=e134]:
                - link "Image to 3D" [ref=e135] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e136]:
                - link "Text to 3D" [ref=e137] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e138]:
                - link "Rig & Animate" [ref=e139] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e140]:
            - heading "Resources" [level=4] [ref=e141]
            - list [ref=e142]:
              - listitem [ref=e143]:
                - link "MeshyAI Docs" [ref=e144] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e145]:
                - link "API Reference" [ref=e146] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e147]:
                - link "Support" [ref=e148] [cursor=pointer]:
                  - /url: /
      - generic [ref=e149]:
        - paragraph [ref=e150]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e151]:
          - link "social link" [ref=e152] [cursor=pointer]:
            - /url: "#"
            - img [ref=e153]
          - link "social link" [ref=e156] [cursor=pointer]:
            - /url: "#"
            - img [ref=e157]
          - link "social link" [ref=e159] [cursor=pointer]:
            - /url: "#"
            - img [ref=e160]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ok, authed, USER } from "./helpers";
  3  | 
  4  | /**
  5  |  * "My 3D models" library — exercises:
  6  |  *   GET    /api/common/3d/tasks           (list, with optional ?status filter)
  7  |  *   DELETE /api/common/3d/tasks/{id}      (delete a model)
  8  |  */
  9  | const TASK = {
  10 |   id: "task-1",
  11 |   taskType: "TEXT_TO_3D_REFINE",
  12 |   status: "SUCCEEDED",
  13 |   modelUrls: {},
  14 |   thumbnailUrl: null,
  15 |   createdAt: new Date().toISOString(),
  16 | };
  17 | 
  18 | async function mockTasks(page) {
  19 |   // One route serves both the list (GET) and the delete (DELETE) of /tasks.
  20 |   await page.route("**/api/common/3d/tasks**", (route) => {
  21 |     const method = route.request().method();
  22 |     const body =
  23 |       method === "DELETE" ? ok(null) : ok({ content: [TASK], last: true });
  24 |     return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  25 |   });
  26 | }
  27 | 
  28 | test.describe("My models API", () => {
  29 |   test("TC-API-MDL-001: GET /tasks lists the user's models", async ({ page }) => {
  30 |     await authed(page, USER);
  31 |     await mockTasks(page);
  32 | 
  33 |     const listReq = page.waitForRequest(
  34 |       (r) => r.url().includes("/api/common/3d/tasks") && r.method() === "GET"
  35 |     );
  36 |     await page.goto("/my-3d-printing");
  37 |     await listReq;
  38 | 
  39 |     await expect(page.getByText("Ready").first()).toBeVisible(); // SUCCEEDED status badge
  40 |   });
  41 | 
  42 |   test("TC-API-MDL-002: the status filter re-queries GET /tasks?status=SUCCEEDED", async ({ page }) => {
  43 |     await authed(page, USER);
  44 |     await mockTasks(page);
  45 |     await page.goto("/my-3d-printing");
  46 | 
> 47 |     const filtered = page.waitForRequest(
     |                           ^ Error: page.waitForRequest: Test ended.
  48 |       (r) => r.url().includes("/api/common/3d/tasks") && new URL(r.url()).searchParams.get("status") === "SUCCEEDED"
  49 |     );
  50 |     await page.getByRole("button", { name: "Ready" }).click(); // the "Ready" (SUCCEEDED) filter chip
  51 |     await filtered;
  52 |   });
  53 | 
  54 |   test("TC-API-MDL-003: DELETE /tasks/{id} after confirming removal", async ({ page }) => {
  55 |     await authed(page, USER);
  56 |     await mockTasks(page);
  57 |     await page.goto("/my-3d-printing");
  58 |     await expect(page.getByText("Ready").first()).toBeVisible();
  59 | 
  60 |     await page.getByRole("button", { name: "Options", exact: true }).click(); // the card "..." menu
  61 |     await page.getByRole("button", { name: "Delete" }).click(); // menu → Delete
  62 |     await expect(page.getByText("Delete this model?")).toBeVisible();
  63 | 
  64 |     const del = page.waitForRequest(
  65 |       (r) => r.url().includes("/api/common/3d/tasks/task-1") && r.method() === "DELETE"
  66 |     );
  67 |     await page.getByRole("button", { name: "Delete" }).click(); // dialog → confirm
  68 |     await del;
  69 |     await expect(page.getByText("Model deleted")).toBeVisible();
  70 |   });
  71 | });
  72 | 
```