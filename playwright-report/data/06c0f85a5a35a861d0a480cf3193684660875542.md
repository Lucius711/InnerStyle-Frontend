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
          - button "Image → 3D" [ref=e60] [cursor=pointer]
          - button "Text → 3D" [ref=e61] [cursor=pointer]
          - button "Chibi figurine" [ref=e62] [cursor=pointer]
          - button "Upload 3D" [ref=e63] [cursor=pointer]: Upload 3D
        - generic [ref=e66]:
          - generic [ref=e67]:
            - paragraph [ref=e68]:
              - img [ref=e69]
              - text: Upload a 3D model
            - paragraph [ref=e72]: Already have a 3D file? Upload it to preview, edit, download, or continue the pipeline (remesh, retexture, 3D print…).
          - generic [ref=e73]:
            - generic [ref=e75]: Choose a 3D file
            - generic [ref=e78] [cursor=pointer]:
              - img [ref=e80]
              - generic [ref=e82]:
                - paragraph [ref=e83]: Drop your model folder here
                - paragraph [ref=e84]: Folder containing a 3D file + textures subfolder
              - button "Select folder" [ref=e85]:
                - img [ref=e86]
                - text: Select folder
              - generic [ref=e88]:
                - paragraph [ref=e89]: "Supported folder structure:"
                - generic [ref=e90]: 📁 my_model/ 📄 model.obj ← GLB/OBJ/FBX/STL 📁 textures/ 🖼 diffuse.png 🖼 normal.png
          - paragraph [ref=e91]: Supports GLB, GLTF, OBJ, FBX, STL. Your model appears instantly after upload.
          - button "Upload & preview" [ref=e93] [cursor=pointer]:
            - img [ref=e94]
            - text: Upload & preview
      - generic [ref=e99]:
        - img [ref=e101]
        - generic [ref=e106]:
          - paragraph [ref=e107]: Your model will appear here
          - paragraph [ref=e108]: Upload an existing 3D file (.glb, .gltf, .obj, .fbx, .stl) — it appears here instantly for preview.
        - generic [ref=e109]:
          - img [ref=e110]
          - text: Upload 3D
  - contentinfo [ref=e113]:
    - generic [ref=e114]:
      - generic [ref=e115]:
        - generic [ref=e116]:
          - link "InnerStyle" [ref=e117]:
            - /url: /
            - img "InnerStyle" [ref=e118]
          - paragraph [ref=e119]: Turn a single 2D image or one line of text into a textured, rigged and animated 3D model — powered by the MeshyAI pipeline.
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "Product" [level=4] [ref=e122]
            - list [ref=e123]:
              - listitem [ref=e124]:
                - link "Studio" [ref=e125]:
                  - /url: /studio
              - listitem [ref=e126]:
                - link "How it works" [ref=e127]:
                  - /url: /#how
              - listitem [ref=e128]:
                - link "Features" [ref=e129]:
                  - /url: /#features
          - generic [ref=e130]:
            - heading "Pipeline" [level=4] [ref=e131]
            - list [ref=e132]:
              - listitem [ref=e133]:
                - link "Image to 3D" [ref=e134]:
                  - /url: /studio
              - listitem [ref=e135]:
                - link "Text to 3D" [ref=e136]:
                  - /url: /studio
              - listitem [ref=e137]:
                - link "Rig & Animate" [ref=e138]:
                  - /url: /studio
          - generic [ref=e139]:
            - heading "Resources" [level=4] [ref=e140]
            - list [ref=e141]:
              - listitem [ref=e142]:
                - link "MeshyAI Docs" [ref=e143]:
                  - /url: /
              - listitem [ref=e144]:
                - link "API Reference" [ref=e145]:
                  - /url: /
              - listitem [ref=e146]:
                - link "Support" [ref=e147]:
                  - /url: /
      - generic [ref=e148]:
        - paragraph [ref=e149]: © 2026 InnerStyle. Built on MeshyAI.
        - generic [ref=e150]:
          - link "social link" [ref=e151]:
            - /url: "#"
            - img [ref=e152]
          - link "social link" [ref=e155]:
            - /url: "#"
            - img [ref=e156]
          - link "social link" [ref=e158]:
            - /url: "#"
            - img [ref=e159]
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