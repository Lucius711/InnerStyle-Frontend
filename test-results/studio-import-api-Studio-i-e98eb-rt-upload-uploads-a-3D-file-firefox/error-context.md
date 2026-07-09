# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-import-api.spec.ts >> Studio import API >> TC-API-3D-030: POST /import/upload uploads a 3D file
- Location: e2e\studio-import-api.spec.ts:26:3

# Error details

```
Error: locator.setInputFiles: Error: [webkitdirectory] input requires passing a path to a directory
Call log:
  - waiting for locator('input[type="file"]')
    - locator resolved to <input multiple type="file" class="hidden" mozdirectory="" webkitdirectory=""/>

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
          - button "Image → 3D" [ref=e74] [cursor=pointer]
          - button "Text → 3D" [ref=e75] [cursor=pointer]
          - button "Chibi figurine" [ref=e76] [cursor=pointer]
          - button "Upload 3D" [active] [ref=e77] [cursor=pointer]: Upload 3D
        - generic [ref=e80]:
          - generic [ref=e81]:
            - paragraph [ref=e82]:
              - img [ref=e83]
              - text: Upload a 3D model
            - paragraph [ref=e87]: Already have a 3D file? Upload it to preview, edit, download, or continue the pipeline (remesh, retexture, 3D print…).
          - generic [ref=e88]:
            - generic [ref=e90]: Choose a 3D file
            - generic [ref=e93] [cursor=pointer]:
              - img [ref=e95]
              - generic [ref=e97]:
                - paragraph [ref=e98]: Drop your model folder here
                - paragraph [ref=e99]: Folder containing a 3D file + textures subfolder
              - button "Select folder" [ref=e100]:
                - img [ref=e101]
                - text: Select folder
              - generic [ref=e103]:
                - paragraph [ref=e104]: "Supported folder structure:"
                - generic [ref=e105]: 📁 my_model/ 📄 model.obj ← GLB/OBJ/FBX/STL 📁 textures/ 🖼 diffuse.png 🖼 normal.png
          - paragraph [ref=e106]: Supports GLB, GLTF, OBJ, FBX, STL. Your model appears instantly after upload.
          - button "Upload & preview" [ref=e108] [cursor=pointer]:
            - img [ref=e109]
            - text: Upload & preview
      - generic [ref=e115]:
        - img [ref=e117]
        - generic [ref=e122]:
          - paragraph [ref=e123]: Your model will appear here
          - paragraph [ref=e124]: Upload an existing 3D file (.glb, .gltf, .obj, .fbx, .stl) — it appears here instantly for preview.
        - generic [ref=e125]:
          - img [ref=e126]
          - text: Upload 3D
  - contentinfo [ref=e130]:
    - generic [ref=e131]:
      - generic [ref=e132]:
        - generic [ref=e133]:
          - link "InnerStyle" [ref=e134] [cursor=pointer]:
            - /url: /
            - img "InnerStyle" [ref=e135]
          - paragraph [ref=e136]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e137]:
          - generic [ref=e138]:
            - heading "Product" [level=4] [ref=e139]
            - list [ref=e140]:
              - listitem [ref=e141]:
                - link "Studio" [ref=e142] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e143]:
                - link "How it works" [ref=e144] [cursor=pointer]:
                  - /url: /#how
              - listitem [ref=e145]:
                - link "Features" [ref=e146] [cursor=pointer]:
                  - /url: /#features
          - generic [ref=e147]:
            - heading "Pipeline" [level=4] [ref=e148]
            - list [ref=e149]:
              - listitem [ref=e150]:
                - link "Image to 3D" [ref=e151] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e152]:
                - link "Text to 3D" [ref=e153] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e154]:
                - link "Rig & Animate" [ref=e155] [cursor=pointer]:
                  - /url: /studio
          - generic [ref=e156]:
            - heading "Resources" [level=4] [ref=e157]
            - list [ref=e158]:
              - listitem [ref=e159]:
                - link "MeshyAI Docs" [ref=e160] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e161]:
                - link "API Reference" [ref=e162] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e163]:
                - link "Support" [ref=e164] [cursor=pointer]:
                  - /url: /
      - generic [ref=e165]:
        - paragraph [ref=e166]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e167]:
          - link "social link" [ref=e168] [cursor=pointer]:
            - /url: "#"
            - img [ref=e169]
          - link "social link" [ref=e172] [cursor=pointer]:
            - /url: "#"
            - img [ref=e173]
          - link "social link" [ref=e175] [cursor=pointer]:
            - /url: "#"
            - img [ref=e176]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ok, authed, USER } from "./helpers";
  3  | 
  4  | /**
  5  |  * Upload 3D — the fourth studio mode (import). The user picks the "Upload 3D" mode, chooses a
  6  |  * local .glb file, and uploads it:
  7  |  *   POST /api/common/3d/import/upload   (multipart: file)
  8  |  * A .glb needs no client-side GLB conversion, so the upload fires directly. The created task then
  9  |  * polls to SUCCEEDED; the finished task carries no model file, so the viewer uses its WebGL-free
  10 |  * fallback — the assertion targets the real upload → result network flow.
  11 |  */
  12 | const IMPORT_PENDING = { id: "imp-1", status: "IN_PROGRESS", taskType: "IMPORT" };
  13 | const IMPORT_READY = {
  14 |   id: "imp-1",
  15 |   status: "SUCCEEDED",
  16 |   taskType: "IMPORT",
  17 |   modelUrls: {},
  18 |   textureUrls: [],
  19 |   updatedAt: new Date().toISOString(),
  20 | };
  21 | 
  22 | const json = (r, body, status = 200) =>
  23 |   r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  24 | 
  25 | test.describe("Studio import API", () => {
  26 |   test("TC-API-3D-030: POST /import/upload uploads a 3D file", async ({ page }) => {
  27 |     await authed(page, USER);
  28 |     // Suppress the first-visit guided tour; its overlay intercepts clicks.
  29 |     await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));
  30 | 
  31 |     await page.route("**/api/common/3d/import/upload", (r) => json(r, ok(IMPORT_PENDING)));
  32 |     await page.route("**/api/common/3d/tasks/imp-1", (r) => json(r, ok(IMPORT_READY)));
  33 | 
  34 |     await page.goto("/studio");
  35 | 
  36 |     // 1) Switch to the Upload 3D mode.
  37 |     await page.getByRole("button", { name: "Upload 3D", exact: true }).click();
  38 | 
  39 |     // 2) Choose a local .glb (the dropzone's hidden file input). A .glb skips GLB conversion.
> 40 |     await page.locator('input[type="file"]').setInputFiles({
     |     ^ Error: locator.setInputFiles: Error: [webkitdirectory] input requires passing a path to a directory
  41 |       name: "model.glb",
  42 |       mimeType: "model/gltf-binary",
  43 |       buffer: Buffer.from("glTF-e2e-fixture"),
  44 |     });
  45 | 
  46 |     // 3) Upload — the multipart create call fires.
  47 |     const uploadReq = page.waitForRequest(
  48 |       (r) => r.url().includes("/api/common/3d/import/upload") && r.method() === "POST"
  49 |     );
  50 |     await page.getByRole("button", { name: "Upload & preview" }).click();
  51 |     const req = await uploadReq;
  52 |     // The file is sent as multipart form-data.
  53 |     expect(req.headers()["content-type"]).toContain("multipart/form-data");
  54 |   });
  55 | });
  56 | 
```