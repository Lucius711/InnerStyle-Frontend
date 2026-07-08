# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-pipeline-api.spec.ts >> Studio pipeline API >> TC-API-3D-011: POST /rig continues the pipeline
- Location: e2e\studio-pipeline-api.spec.ts:62:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForRequest: Test timeout of 30000ms exceeded.
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
    - generic [ref=e49]:
      - generic [ref=e50]:
        - generic [ref=e51]:
          - img [ref=e55]
          - text: Studio
        - heading "Create your 3D model" [level=1] [ref=e61]
        - paragraph [ref=e62]: Generate from an image or a text prompt, watch it build live, then download in your format of choice.
      - button "Tutorial" [ref=e64] [cursor=pointer]:
        - img [ref=e65]
        - text: Tutorial
    - generic [ref=e69]:
      - generic [ref=e71]:
        - generic [ref=e73]:
          - button "Image → 3D" [ref=e74] [cursor=pointer]: Image → 3D
          - button "Text → 3D" [ref=e76] [cursor=pointer]
          - button "Chibi figurine" [ref=e77] [cursor=pointer]
          - button "Upload 3D" [ref=e78] [cursor=pointer]
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - button "Image URL" [ref=e83] [cursor=pointer]: Image URL
              - button "Upload file" [ref=e85] [cursor=pointer]
              - button "Multiple images" [ref=e86] [cursor=pointer]
            - generic [ref=e88]:
              - generic [ref=e89]:
                - generic [ref=e90]: Image URL
                - generic [ref=e91]: JPG / PNG
              - generic [ref=e92]:
                - img
                - textbox "https://example.com/character.png" [ref=e93]: https://example.com/x.png
          - button "Advanced settings" [ref=e96] [cursor=pointer]:
            - generic [ref=e97]:
              - img [ref=e98]
              - text: Advanced settings
            - img [ref=e109]
          - button "Generate 3D model" [active] [ref=e113] [cursor=pointer]:
            - img [ref=e114]
            - text: Generate 3D model
      - generic [ref=e125]:
        - img [ref=e127]
        - generic [ref=e132]:
          - paragraph [ref=e133]: Your model will appear here
          - paragraph [ref=e134]: Add an image and hit generate — you'll be able to orbit the result in real time.
        - generic [ref=e135]:
          - img [ref=e136]
          - text: Image → 3D
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
  1  | import { test, expect } from "@playwright/test";
  2  | import { ok, authed, USER } from "./helpers";
  3  | 
  4  | /**
  5  |  * Meshy pipeline — generate a model from an image URL, then run the "continue the pipeline"
  6  |  * actions on the finished model:
  7  |  *   POST /api/common/3d/image-to-3d
  8  |  *   POST /api/common/3d/rig
  9  |  *   POST /api/common/3d/retexture
  10 |  *   POST /api/common/3d/remesh
  11 |  * The image-moderation proxy is mocked non-OK so the client skips the nsfwjs check (it fails open);
  12 |  * the finished task has no model file so the viewer uses its WebGL-free fallback.
  13 |  */
  14 | const IMG_PENDING = { id: "img-1", status: "IN_PROGRESS", taskType: "IMAGE_TO_3D" };
  15 | const IMG_READY = {
  16 |   id: "img-1",
  17 |   status: "SUCCEEDED",
  18 |   taskType: "IMAGE_TO_3D",
  19 |   modelUrls: {},
  20 |   textureUrls: [],
  21 |   updatedAt: new Date().toISOString(),
  22 | };
  23 | 
  24 | const json = (r, body, status = 200) =>
  25 |   r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  26 | 
  27 | async function mockPipeline(page) {
  28 |   await page.route("**/api/common/3d/moderation/image-proxy**", (r) => r.fulfill({ status: 400, body: "" }));
  29 |   await page.route("**/api/common/3d/image-to-3d", (r) => json(r, ok(IMG_PENDING)));
  30 |   await page.route("**/api/common/3d/tasks/img-1", (r) => json(r, ok(IMG_READY)));
  31 |   for (const ep of ["refine", "remesh", "retexture", "rig", "animate"]) {
  32 |     // eslint-disable-next-line no-await-in-loop
  33 |     await page.route(`**/api/common/3d/${ep}`, (r) =>
  34 |       json(r, ok({ id: `${ep}-1`, status: "IN_PROGRESS", taskType: ep.toUpperCase() }))
  35 |     );
  36 |   }
  37 | }
  38 | 
  39 | /** Generate an IMAGE_TO_3D model and wait for the result actions to appear. Asserts the create call. */
  40 | async function generateModel(page) {
  41 |   await page.goto("/studio");
  42 |   await page.getByPlaceholder("https://example.com/character.png").fill("https://example.com/x.png");
> 43 |   const create = page.waitForRequest(
     |                       ^ Error: page.waitForRequest: Test timeout of 30000ms exceeded.
  44 |     (r) => r.url().includes("/api/common/3d/image-to-3d") && r.method() === "POST"
  45 |   );
  46 |   await page.getByRole("button", { name: "Generate 3D model" }).click();
  47 |   await create;
  48 |   await expect(page.getByRole("button", { name: "Rig for animation" })).toBeVisible({ timeout: 15000 });
  49 | }
  50 | 
  51 | test.describe("Studio pipeline API", () => {
  52 |   test.beforeEach(async ({ page }) => {
  53 |     await authed(page, USER);
  54 |     await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));
  55 |     await mockPipeline(page);
  56 |   });
  57 | 
  58 |   test("TC-API-3D-010: POST /image-to-3d generates a model", async ({ page }) => {
  59 |     await generateModel(page); // the create request is asserted inside
  60 |   });
  61 | 
  62 |   test("TC-API-3D-011: POST /rig continues the pipeline", async ({ page }) => {
  63 |     await generateModel(page);
  64 |     const rig = page.waitForRequest((r) => r.url().includes("/api/common/3d/rig") && r.method() === "POST");
  65 |     await page.getByRole("button", { name: "Rig for animation" }).click();
  66 |     await rig;
  67 |   });
  68 | 
  69 |   test("TC-API-3D-012: POST /retexture with a style prompt", async ({ page }) => {
  70 |     await generateModel(page);
  71 |     await page.getByRole("button", { name: "Re-texture" }).click();
  72 |     await page.getByPlaceholder("New style, e.g. golden samurai armor").fill("golden samurai armor");
  73 |     const rtx = page.waitForRequest((r) => r.url().includes("/api/common/3d/retexture") && r.method() === "POST");
  74 |     await page.getByRole("button", { name: "Apply" }).click();
  75 |     await rtx;
  76 |   });
  77 | 
  78 |   test("TC-API-3D-013: POST /remesh (Optimize)", async ({ page }) => {
  79 |     await generateModel(page);
  80 |     await page.getByRole("button", { name: "Optimize" }).click(); // toggle the remesh panel
  81 |     const rm = page.waitForRequest((r) => r.url().includes("/api/common/3d/remesh") && r.method() === "POST");
  82 |     await page.getByRole("button", { name: "Optimize" }).last().click(); // panel "apply"
  83 |     await rm;
  84 |   });
  85 | });
  86 | 
```