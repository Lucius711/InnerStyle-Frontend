# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-generate-edit.spec.ts >> Generate & edit a 3D model >> TC-E2E-170: text → 3D generate, then edit with Refine
- Location: e2e\studio-generate-edit.spec.ts:15:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Text → 3D' })
    - locator resolved to <button type="button" class="focus-ring relative flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-app-muted hover:text-app-text">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="absolute inset-0"></div> from <div class="fixed inset-0 z-[80]">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="absolute inset-0"></div> from <div class="fixed inset-0 z-[80]">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  13 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="absolute inset-0"></div> from <div class="fixed inset-0 z-[80]">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - link "Start creating" [ref=e27]:
            - /url: /studio
            - button "Start creating" [ref=e28] [cursor=pointer]:
              - img [ref=e29]
              - text: Start creating
          - button "Account" [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: H
            - img [ref=e34]
    - generic [ref=e38]:
      - generic [ref=e40]:
        - generic [ref=e41]:
          - generic [ref=e42]:
            - img [ref=e46]
            - text: Studio
          - heading "Create your 3D model" [level=1] [ref=e48]
          - paragraph [ref=e49]: Generate from an image or a text prompt, watch it build live, then download in your format of choice.
        - button "Tutorial" [ref=e51] [cursor=pointer]:
          - img [ref=e52]
          - text: Tutorial
      - generic [ref=e55]:
        - generic [ref=e57]:
          - generic [ref=e59]:
            - button "Image → 3D" [ref=e60] [cursor=pointer]: Image → 3D
            - button "Text → 3D" [ref=e62] [cursor=pointer]
            - button "Chibi figurine" [ref=e63] [cursor=pointer]
            - button "Upload 3D" [ref=e64] [cursor=pointer]
          - generic [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - button "Image URL" [ref=e69] [cursor=pointer]: Image URL
                - button "Upload file" [ref=e71] [cursor=pointer]
                - button "Multiple images" [ref=e72] [cursor=pointer]
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: Image URL
                  - generic [ref=e77]: JPG / PNG
                - generic [ref=e78]:
                  - img
                  - textbox "https://example.com/character.png" [ref=e79]
            - button "Advanced settings" [ref=e82] [cursor=pointer]:
              - generic [ref=e83]:
                - img [ref=e84]
                - text: Advanced settings
              - img [ref=e86]
            - button "Generate 3D model" [ref=e90] [cursor=pointer]:
              - img [ref=e91]
              - text: Generate 3D model
        - generic [ref=e96]:
          - img [ref=e98]
          - generic [ref=e103]:
            - paragraph [ref=e104]: Your model will appear here
            - paragraph [ref=e105]: Add an image and hit generate — you'll be able to orbit the result in real time.
          - generic [ref=e106]:
            - img [ref=e107]
            - text: Image → 3D
    - contentinfo [ref=e111]:
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]:
            - link "InnerStyle" [ref=e115]:
              - /url: /
              - img "InnerStyle" [ref=e116]
            - paragraph [ref=e117]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
          - generic [ref=e118]:
            - generic [ref=e119]:
              - heading "Product" [level=4] [ref=e120]
              - list [ref=e121]:
                - listitem [ref=e122]:
                  - link "Studio" [ref=e123]:
                    - /url: /studio
                - listitem [ref=e124]:
                  - link "How it works" [ref=e125]:
                    - /url: /#how
                - listitem [ref=e126]:
                  - link "Features" [ref=e127]:
                    - /url: /#features
            - generic [ref=e128]:
              - heading "Pipeline" [level=4] [ref=e129]
              - list [ref=e130]:
                - listitem [ref=e131]:
                  - link "Image to 3D" [ref=e132]:
                    - /url: /studio
                - listitem [ref=e133]:
                  - link "Text to 3D" [ref=e134]:
                    - /url: /studio
                - listitem [ref=e135]:
                  - link "Rig & Animate" [ref=e136]:
                    - /url: /studio
            - generic [ref=e137]:
              - heading "Resources" [level=4] [ref=e138]
              - list [ref=e139]:
                - listitem [ref=e140]:
                  - link "MeshyAI Docs" [ref=e141]:
                    - /url: /
                - listitem [ref=e142]:
                  - link "API Reference" [ref=e143]:
                    - /url: /
                - listitem [ref=e144]:
                  - link "Support" [ref=e145]:
                    - /url: /
        - generic [ref=e146]:
          - paragraph [ref=e147]: © 2026 InnerStyle. Built on MeshyAI.
          - generic [ref=e148]:
            - link "social link" [ref=e149]:
              - /url: "#"
              - img [ref=e150]
            - link "social link" [ref=e153]:
              - /url: "#"
              - img [ref=e154]
            - link "social link" [ref=e156]:
              - /url: "#"
              - img [ref=e157]
  - dialog [ref=e161]:
    - generic [ref=e162]:
      - generic [ref=e163]: Step 1/5
      - button "Skip" [ref=e164] [cursor=pointer]:
        - img [ref=e165]
    - heading "1. Pick what to create" [level=3] [ref=e168]
    - paragraph [ref=e169]: "Choose how to generate: Image → 3D, Text → 3D, or a Chibi figurine from a portrait photo."
    - generic [ref=e176]:
      - button "Skip" [ref=e177] [cursor=pointer]
      - button "Next" [ref=e179] [cursor=pointer]:
        - text: Next
        - img [ref=e180]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ok, authed, USER } from "./helpers";
  3  | 
  4  | /**
  5  |  * The core happy path: describe a model → generate (create + poll to SUCCEEDED) → the studio shows
  6  |  * the finished result → edit it (Refine / "Add color").
  7  |  *
  8  |  * The backend is mocked at the network layer: the create call returns an in-progress task and the
  9  |  * first poll of GET /tasks/:id flips it to SUCCEEDED; the edit action then fires POST /refine.
  10 |  * The finished task carries no model file, so the viewer renders its (WebGL-free) fallback — the
  11 |  * assertions target the real generate → result → edit network flow and UI state, which is what a
  12 |  * user actually experiences, without needing a live Meshy run.
  13 |  */
  14 | test.describe("Generate & edit a 3D model", () => {
  15 |   test("TC-E2E-170: text → 3D generate, then edit with Refine", async ({ page }) => {
  16 |     await authed(page, USER);
  17 | 
  18 |     const pending = { id: "prev-1", status: "IN_PROGRESS", taskType: "TEXT_TO_3D_PREVIEW" };
  19 |     const ready = {
  20 |       id: "prev-1",
  21 |       status: "SUCCEEDED",
  22 |       taskType: "TEXT_TO_3D_PREVIEW",
  23 |       modelUrls: {},
  24 |       textureUrls: [],
  25 |       updatedAt: new Date().toISOString(),
  26 |     };
  27 |     const refined = { id: "refine-1", status: "IN_PROGRESS", taskType: "TEXT_TO_3D_REFINE" };
  28 | 
  29 |     // Create → IN_PROGRESS; the first poll of /tasks/prev-1 → SUCCEEDED.
  30 |     await page.route("**/api/common/3d/text-to-3d", (r) =>
  31 |       r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(pending)) })
  32 |     );
  33 |     await page.route("**/api/common/3d/tasks/prev-1", (r) =>
  34 |       r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(ready)) })
  35 |     );
  36 |     // The edit: /refine creates a follow-up task.
  37 |     await page.route("**/api/common/3d/refine", (r) =>
  38 |       r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(refined)) })
  39 |     );
  40 | 
  41 |     await page.goto("/studio");
  42 | 
  43 |     // 1) Choose Text → 3D and describe the model.
> 44 |     await page.getByRole("button", { name: "Text → 3D" }).click();
     |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  45 |     await page
  46 |       .getByPlaceholder("e.g. a futuristic robot warrior with glowing armor")
  47 |       .fill("a cute clay fox, pastel");
  48 | 
  49 |     // 2) Generate — the create call fires.
  50 |     const createReq = page.waitForRequest(
  51 |       (req) => req.url().includes("/api/common/3d/text-to-3d") && req.method() === "POST"
  52 |     );
  53 |     await page.getByRole("button", { name: "Generate preview" }).click();
  54 |     await createReq;
  55 | 
  56 |     // 3) Generation completes (poll → SUCCEEDED) and the result panel offers the edit action.
  57 |     const editBtn = page.getByRole("button", { name: "Add color (refine)" });
  58 |     await expect(editBtn).toBeVisible({ timeout: 15000 });
  59 | 
  60 |     // 4) Edit the generated model — Refine fires the /refine call.
  61 |     const editReq = page.waitForRequest(
  62 |       (req) => req.url().includes("/api/common/3d/refine") && req.method() === "POST"
  63 |     );
  64 |     await editBtn.click();
  65 |     await editReq;
  66 |   });
  67 | });
  68 | 
```