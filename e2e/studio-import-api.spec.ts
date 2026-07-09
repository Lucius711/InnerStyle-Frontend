import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/**
 * Upload 3D — the fourth studio mode (import). The user picks the "Upload 3D" mode, chooses a
 * local .glb file, and uploads it:
 *   POST /api/common/3d/import/upload   (multipart: file)
 * A .glb needs no client-side GLB conversion, so the upload fires directly. The created task then
 * polls to SUCCEEDED; the finished task carries no model file, so the viewer uses its WebGL-free
 * fallback — the assertion targets the real upload → result network flow.
 */
const IMPORT_PENDING = { id: "imp-1", status: "IN_PROGRESS", taskType: "IMPORT" };
const IMPORT_READY = {
  id: "imp-1",
  status: "SUCCEEDED",
  taskType: "IMPORT",
  modelUrls: {},
  textureUrls: [],
  updatedAt: new Date().toISOString(),
};

const json = (r, body, status = 200) =>
  r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

test.describe("Studio import API", () => {
  test("TC-API-3D-030: POST /import/upload uploads a 3D file", async ({ page }) => {
    await authed(page, USER);
    // Suppress the first-visit guided tour; its overlay intercepts clicks.
    await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));

    await page.route("**/api/common/3d/import/upload", (r) => json(r, ok(IMPORT_PENDING)));
    await page.route("**/api/common/3d/tasks/imp-1", (r) => json(r, ok(IMPORT_READY)));

    await page.goto("/studio");

    // 1) Switch to the Upload 3D mode.
    await page.getByRole("button", { name: "Upload 3D", exact: true }).click();

    // 2) Provide a local .glb. The dropzone's file input is a *directory* input (webkitdirectory),
    // which setInputFiles can't feed an in-memory file — so simulate a real drag-and-drop instead:
    // build a DataTransfer with the .glb and dispatch "drop" on the dropzone (the input's parent).
    // The dropzone's folder-entry read returns nothing for synthetic items and falls back to
    // dataTransfer.files, so the .glb is picked up. A .glb skips client-side GLB conversion.
    const dropzone = page.locator('input[type="file"]').locator("xpath=..");
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array([0x67, 0x6c, 0x54, 0x46])], "model.glb", { type: "model/gltf-binary" }));
      return dt;
    });
    await dropzone.dispatchEvent("drop", { dataTransfer });

    // 3) Upload — the multipart create call fires.
    const uploadReq = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/import/upload") && r.method() === "POST"
    );
    await page.getByRole("button", { name: "Upload & preview" }).click();
    const req = await uploadReq;
    // The file is sent as multipart form-data.
    expect(req.headers()["content-type"]).toContain("multipart/form-data");
  });
});
