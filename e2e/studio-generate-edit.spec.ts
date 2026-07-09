import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/**
 * The core happy path: describe a model → generate (create + poll to SUCCEEDED) → the studio shows
 * the finished result → edit it (Refine / "Add color").
 *
 * The backend is mocked at the network layer: the create call returns an in-progress task and the
 * first poll of GET /tasks/:id flips it to SUCCEEDED; the edit action then fires POST /refine.
 * The finished task carries no model file, so the viewer renders its (WebGL-free) fallback — the
 * assertions target the real generate → result → edit network flow and UI state, which is what a
 * user actually experiences, without needing a live Meshy run.
 */
test.describe("Generate & edit a 3D model", () => {
  test("TC-E2E-170: text → 3D generate, then edit with Refine", async ({ page }) => {
    await authed(page, USER);
    // Suppress the first-visit guided tour; its overlay intercepts clicks.
    await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));

    const pending = { id: "prev-1", status: "IN_PROGRESS", taskType: "TEXT_TO_3D_PREVIEW" };
    const ready = {
      id: "prev-1",
      status: "SUCCEEDED",
      taskType: "TEXT_TO_3D_PREVIEW",
      modelUrls: {},
      textureUrls: [],
      updatedAt: new Date().toISOString(),
    };
    const refined = { id: "refine-1", status: "IN_PROGRESS", taskType: "TEXT_TO_3D_REFINE" };

    // Create → IN_PROGRESS; the first poll of /tasks/prev-1 → SUCCEEDED.
    await page.route("**/api/common/3d/text-to-3d", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(pending)) })
    );
    await page.route("**/api/common/3d/tasks/prev-1", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(ready)) })
    );
    // The edit: /refine creates a follow-up task.
    await page.route("**/api/common/3d/refine", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(refined)) })
    );

    await page.goto("/studio");

    // 1) Choose Text → 3D and describe the model.
    await page.getByRole("button", { name: "Text → 3D" }).click();
    await page
      .getByPlaceholder("e.g. a futuristic robot warrior with glowing armor")
      .fill("a cute clay fox, pastel");

    // 2) Generate — the create call fires.
    const createReq = page.waitForRequest(
      (req) => req.url().includes("/api/common/3d/text-to-3d") && req.method() === "POST"
    );
    await page.getByRole("button", { name: "Generate preview" }).click();
    await createReq;

    // 3) Generation completes (poll → SUCCEEDED) and the result panel offers the edit action.
    const editBtn = page.getByRole("button", { name: "Add color (refine)" });
    await expect(editBtn).toBeVisible({ timeout: 15000 });

    // 4) Edit the generated model — Refine fires the /refine call.
    const editReq = page.waitForRequest(
      (req) => req.url().includes("/api/common/3d/refine") && req.method() === "POST"
    );
    await editBtn.click();
    await editReq;
  });
});
