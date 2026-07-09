# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-pipeline-api.spec.ts >> Studio pipeline API >> TC-API-3D-013: POST /remesh (Optimize)
- Location: e2e\studio-pipeline-api.spec.ts:78:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Rig for animation' })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button', { name: 'Rig for animation' })

```

```yaml
- banner:
  - navigation:
    - link "InnerStyle":
      - /url: /
      - img "InnerStyle"
    - link "How it works":
      - /url: /#how
    - link "Features":
      - /url: /#features
    - link "Showcase":
      - /url: /#showcase
    - button "Change language":
      - img
      - text: EN
    - button "Switch to dark mode":
      - img
    - link "Start creating":
      - /url: /studio
      - button "Start creating":
        - img
        - text: Start creating
    - button "Account":
      - text: H
      - img
- img
- text: Studio
- heading "Create your 3D model" [level=1]
- paragraph: Generate from an image or a text prompt, watch it build live, then download in your format of choice.
- button "Tutorial":
  - img
  - text: Tutorial
- button "Start over":
  - img
  - text: Start over
- button "Image → 3D"
- button "Text → 3D"
- button "Chibi figurine"
- button "Upload 3D"
- button "Image URL"
- button "Upload file"
- button "Multiple images"
- text: Image URL JPG / PNG
- img
- textbox "https://example.com/character.png": https://example.com/x.png
- button "Advanced settings":
  - img
  - text: Advanced settings
  - img
- button "Generate 3D model" [disabled]:
  - img
  - text: Generate 3D model
- img
- text: 0% 00:02
- img
- text: Generating
- paragraph: Sending to the engine…
- paragraph: This usually takes 1–3 minutes
- contentinfo:
  - link "InnerStyle":
    - /url: /
    - img "InnerStyle"
  - paragraph: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
  - heading "Product" [level=4]
  - list:
    - listitem:
      - link "Studio":
        - /url: /studio
    - listitem:
      - link "How it works":
        - /url: /#how
    - listitem:
      - link "Features":
        - /url: /#features
  - heading "Pipeline" [level=4]
  - list:
    - listitem:
      - link "Image to 3D":
        - /url: /studio
    - listitem:
      - link "Text to 3D":
        - /url: /studio
    - listitem:
      - link "Rig & Animate":
        - /url: /studio
  - heading "Resources" [level=4]
  - list:
    - listitem:
      - link "MeshyAI Docs":
        - /url: /
    - listitem:
      - link "API Reference":
        - /url: /
    - listitem:
      - link "Support":
        - /url: /
  - paragraph: © 2026 InnerStyle. Built on MeshyAI.
  - link "social link":
    - /url: "#"
    - img
  - link "social link":
    - /url: "#"
    - img
  - link "social link":
    - /url: "#"
    - img
- img
- paragraph: Generation started
- paragraph: Your model is being created.
- button "Dismiss notification":
  - img
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
  43 |   const create = page.waitForRequest(
  44 |     (r) => r.url().includes("/api/common/3d/image-to-3d") && r.method() === "POST"
  45 |   );
  46 |   await page.getByRole("button", { name: "Generate 3D model" }).click();
  47 |   await create;
> 48 |   await expect(page.getByRole("button", { name: "Rig for animation" })).toBeVisible({ timeout: 15000 });
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
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