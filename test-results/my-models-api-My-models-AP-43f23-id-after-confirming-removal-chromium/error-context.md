# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: my-models-api.spec.ts >> My models API >> TC-API-MDL-003: DELETE /tasks/{id} after confirming removal
- Location: e2e\my-models-api.spec.ts:54:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Options' }) resolved to 2 elements:
    1) <div tabindex="0" role="button" class="group glass relative cursor-pointer overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-glow">…</div> aka getByRole('button', { name: 'Ready Options Refine 4s ago' })
    2) <button type="button" aria-label="Options" class="flex h-8 w-8 items-center justify-center rounded-lg bg-app-bg/60 text-app-muted opacity-0 backdrop-blur-md transition-all hover:text-app-text group-hover:opacity-100">…</button> aka getByRole('button', { name: 'Options', exact: true })

Call log:
  - waiting for getByRole('button', { name: 'Options' })

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
  - generic [ref=e38]:
    - generic [ref=e39]:
      - generic [ref=e40]: H
      - generic [ref=e41]:
        - heading "Huy" [level=1] [ref=e42]
        - paragraph [ref=e43]: huy@example.com
    - generic [ref=e44]:
      - link "Personal info" [ref=e45] [cursor=pointer]:
        - /url: /profile
        - img [ref=e46]
        - text: Personal info
      - link "My 3D models" [ref=e49] [cursor=pointer]:
        - /url: /my-3d-printing
        - img [ref=e50]
        - text: My 3D models
      - link "Print history" [ref=e60] [cursor=pointer]:
        - /url: /print-history
        - img [ref=e61]
        - text: Print history
    - generic [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - heading "My 3D models" [level=2] [ref=e69]
          - paragraph [ref=e70]: Everything you've generated — open any model to view in 3D, download, or continue the pipeline.
        - button "Refresh" [ref=e71] [cursor=pointer]:
          - img [ref=e72]
          - text: Refresh
      - generic [ref=e78]:
        - button "All" [ref=e79] [cursor=pointer]: All
        - button "Ready" [ref=e81] [cursor=pointer]
        - button "Generating" [ref=e82] [cursor=pointer]
        - button "Failed" [ref=e83] [cursor=pointer]
      - button "Ready Options Refine 4s ago" [ref=e86] [cursor=pointer]:
        - generic [ref=e87]:
          - generic [ref=e89]: Ready
          - button "Options" [ref=e91]:
            - img [ref=e92]
        - generic [ref=e96]:
          - paragraph [ref=e97]: Refine
          - paragraph [ref=e98]:
            - img [ref=e99]
            - text: 4s ago
  - contentinfo [ref=e102]:
    - generic [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - link "InnerStyle" [ref=e106] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e107]
          - paragraph [ref=e108]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e109]:
          - generic [ref=e110]:
            - heading "Product" [level=4] [ref=e111]
            - list [ref=e112]:
              - listitem [ref=e113]:
                - link "Studio" [ref=e114] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e115]:
                - link "How it works" [ref=e116] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e117]:
                - link "Features" [ref=e118] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e119]:
            - heading "Pipeline" [level=4] [ref=e120]
            - list [ref=e121]:
              - listitem [ref=e122]:
                - link "Image to 3D" [ref=e123] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e124]:
                - link "Text to 3D" [ref=e125] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e126]:
                - link "Rig & Animate" [ref=e127] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e128]:
            - heading "Resources" [level=4] [ref=e129]
            - list [ref=e130]:
              - listitem [ref=e131]:
                - link "MeshyAI Docs" [ref=e132] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e133]:
                - link "API Reference" [ref=e134] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e135]:
                - link "Support" [ref=e136] [cursor=pointer]:
                  - /url: /
      - generic [ref=e137]:
        - paragraph [ref=e138]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e139]:
          - link "social link" [ref=e140] [cursor=pointer]:
            - /url: "#"
            - img [ref=e141]
          - link "social link" [ref=e144] [cursor=pointer]:
            - /url: "#"
            - img [ref=e145]
          - link "social link" [ref=e147] [cursor=pointer]:
            - /url: "#"
            - img [ref=e148]
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
  47 |     const filtered = page.waitForRequest(
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
> 60 |     await page.getByRole("button", { name: "Options" }).click(); // the card "..." menu
     |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Options' }) resolved to 2 elements:
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