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
    1) <div tabindex="0" role="button" class="group glass relative cursor-pointer overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-glow">…</div> aka getByRole('button', { name: 'Ready Options Refine 3s ago' })
    2) <button type="button" aria-label="Options" class="flex h-8 w-8 items-center justify-center rounded-lg bg-app-bg/60 text-app-muted opacity-0 backdrop-blur-md transition-all hover:text-app-text group-hover:opacity-100">…</button> aka getByRole('button', { name: 'Options', exact: true })

Call log:
  - waiting for getByRole('button', { name: 'Options' })

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
  - generic [ref=e49]:
    - generic [ref=e50]:
      - generic [ref=e51]: H
      - generic [ref=e52]:
        - heading "Huy" [level=1] [ref=e53]
        - paragraph [ref=e54]: huy@example.com
    - generic [ref=e55]:
      - link "Personal info" [ref=e56] [cursor=pointer]:
        - /url: /profile
        - img [ref=e57]
        - text: Personal info
      - link "My 3D models" [ref=e60] [cursor=pointer]:
        - /url: /my-3d-printing
        - img [ref=e61]
        - text: My 3D models
      - link "Print history" [ref=e74] [cursor=pointer]:
        - /url: /print-history
        - img [ref=e75]
        - text: Print history
    - generic [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e82]:
          - heading "My 3D models" [level=2] [ref=e83]
          - paragraph [ref=e84]: Everything you've generated — open any model to view in 3D, download, or continue the pipeline.
        - button "Refresh" [ref=e85] [cursor=pointer]:
          - img [ref=e86]
          - text: Refresh
      - generic [ref=e92]:
        - button "All" [ref=e93] [cursor=pointer]: All
        - button "Ready" [ref=e95] [cursor=pointer]
        - button "Generating" [ref=e96] [cursor=pointer]
        - button "Failed" [ref=e97] [cursor=pointer]
      - button "Ready Options Refine 3s ago" [ref=e100] [cursor=pointer]:
        - generic [ref=e101]:
          - generic [ref=e103]: Ready
          - button "Options" [ref=e105]:
            - img [ref=e106]
        - generic [ref=e110]:
          - paragraph [ref=e111]: Refine
          - paragraph [ref=e112]:
            - img [ref=e113]
            - text: 3s ago
  - contentinfo [ref=e116]:
    - generic [ref=e117]:
      - generic [ref=e118]:
        - generic [ref=e119]:
          - link "InnerStyle" [ref=e120] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e121]
          - paragraph [ref=e122]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e123]:
          - generic [ref=e124]:
            - heading "Product" [level=4] [ref=e125]
            - list [ref=e126]:
              - listitem [ref=e127]:
                - link "Studio" [ref=e128] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e129]:
                - link "How it works" [ref=e130] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e131]:
                - link "Features" [ref=e132] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e133]:
            - heading "Pipeline" [level=4] [ref=e134]
            - list [ref=e135]:
              - listitem [ref=e136]:
                - link "Image to 3D" [ref=e137] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e138]:
                - link "Text to 3D" [ref=e139] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e140]:
                - link "Rig & Animate" [ref=e141] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e142]:
            - heading "Resources" [level=4] [ref=e143]
            - list [ref=e144]:
              - listitem [ref=e145]:
                - link "MeshyAI Docs" [ref=e146] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e147]:
                - link "API Reference" [ref=e148] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e149]:
                - link "Support" [ref=e150] [cursor=pointer]:
                  - /url: /
      - generic [ref=e151]:
        - paragraph [ref=e152]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e153]:
          - link "social link" [ref=e154] [cursor=pointer]:
            - /url: "#"
            - img [ref=e155]
          - link "social link" [ref=e158] [cursor=pointer]:
            - /url: "#"
            - img [ref=e159]
          - link "social link" [ref=e161] [cursor=pointer]:
            - /url: "#"
            - img [ref=e162]
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