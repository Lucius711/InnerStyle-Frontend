import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/**
 * Meshy pipeline — generate a model from an image URL, then run the "continue the pipeline"
 * actions on the finished model:
 *   POST /api/common/3d/image-to-3d
 *   POST /api/common/3d/rig
 *   POST /api/common/3d/retexture
 *   POST /api/common/3d/remesh
 * The image-moderation proxy is mocked non-OK so the client skips the nsfwjs check (it fails open);
 * the finished task has no model file so the viewer uses its WebGL-free fallback.
 */
const IMG_PENDING = { id: "img-1", status: "IN_PROGRESS", taskType: "IMAGE_TO_3D" };
const IMG_READY = {
  id: "img-1",
  status: "SUCCEEDED",
  taskType: "IMAGE_TO_3D",
  modelUrls: {},
  textureUrls: [],
  updatedAt: new Date().toISOString(),
};

const json = (r, body, status = 200) =>
  r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function mockPipeline(page) {
  await page.route("**/api/common/3d/moderation/image-proxy**", (r) => r.fulfill({ status: 400, body: "" }));
  await page.route("**/api/common/3d/image-to-3d", (r) => json(r, ok(IMG_PENDING)));
  await page.route("**/api/common/3d/tasks/img-1", (r) => json(r, ok(IMG_READY)));
  for (const ep of ["refine", "remesh", "retexture", "rig", "animate"]) {
    // eslint-disable-next-line no-await-in-loop
    await page.route(`**/api/common/3d/${ep}`, (r) =>
      json(r, ok({ id: `${ep}-1`, status: "IN_PROGRESS", taskType: ep.toUpperCase() }))
    );
  }
}

/** Generate an IMAGE_TO_3D model and wait for the result actions to appear. Asserts the create call. */
async function generateModel(page) {
  await page.goto("/studio");
  await page.getByPlaceholder("https://example.com/character.png").fill("https://example.com/x.png");
  const create = page.waitForRequest(
    (r) => r.url().includes("/api/common/3d/image-to-3d") && r.method() === "POST"
  );
  // The poll response is what flips the task to SUCCEEDED and renders the ResultPanel. Wait for it
  // explicitly so the button assertion isn't racing the 3.5s poll interval — and so a failure here
  // clearly points at the poll (rather than a generic "button not found").
  const polled = page.waitForResponse(
    (r) => /\/api\/common\/3d\/tasks\/img-1/.test(r.url()),
    { timeout: 15000 }
  );
  await page.getByRole("button", { name: "Generate 3D model" }).click();
  await create;
  await polled;
  await expect(page.getByRole("button", { name: "Rig for animation" })).toBeVisible({ timeout: 15000 });
}

test.describe("Studio pipeline API", () => {
  test.beforeEach(async ({ page }) => {
    await authed(page, USER);
    await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));
    await mockPipeline(page);
  });

  test("TC-API-3D-010: POST /image-to-3d generates a model", async ({ page }) => {
    await generateModel(page); // the create request is asserted inside
  });

  test("TC-API-3D-011: POST /rig continues the pipeline", async ({ page }) => {
    await generateModel(page);
    const rig = page.waitForRequest((r) => r.url().includes("/api/common/3d/rig") && r.method() === "POST");
    await page.getByRole("button", { name: "Rig for animation" }).click();
    await rig;
  });

  test("TC-API-3D-012: POST /retexture with a style prompt", async ({ page }) => {
    await generateModel(page);
    await page.getByRole("button", { name: "Re-texture" }).click();
    await page.getByPlaceholder("New style, e.g. golden samurai armor").fill("golden samurai armor");
    const rtx = page.waitForRequest((r) => r.url().includes("/api/common/3d/retexture") && r.method() === "POST");
    await page.getByRole("button", { name: "Apply" }).click();
    await rtx;
  });

  test("TC-API-3D-013: POST /remesh (Optimize)", async ({ page }) => {
    await generateModel(page);
    await page.getByRole("button", { name: "Optimize" }).click(); // toggle the remesh panel
    const rm = page.waitForRequest((r) => r.url().includes("/api/common/3d/remesh") && r.method() === "POST");
    await page.getByRole("button", { name: "Optimize" }).last().click(); // panel "apply"
    await rm;
  });
});
