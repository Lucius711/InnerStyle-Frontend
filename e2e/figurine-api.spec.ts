import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/**
 * Chibi figurine — a 2-stage pipeline: the prototype create (/figurine) and, once it succeeds,
 * Studio auto-launches the build (/figurine/build). Driven from an image URL so no file upload is
 * needed; the moderation proxy is mocked non-OK so the nsfwjs check is skipped (fails open).
 *   POST /api/common/3d/figurine
 *   POST /api/common/3d/figurine/build
 */
const json = (r, body, status = 200) =>
  r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

test.describe("Figurine pipeline API", () => {
  test("TC-API-3D-020: prototype create auto-chains to build", async ({ page }) => {
    await authed(page, USER);
    await page.addInitScript(() => localStorage.setItem("innerstyle-studio-tour-seen", "1"));

    await page.route("**/api/common/3d/moderation/image-proxy**", (r) => r.fulfill({ status: 400, body: "" }));
    await page.route("**/api/common/3d/figurine", (r) =>
      json(r, ok({ id: "fig-1", status: "IN_PROGRESS", taskType: "FIGURE_PROTOTYPE" }))
    );
    await page.route("**/api/common/3d/tasks/fig-1", (r) =>
      json(r, ok({ id: "fig-1", status: "SUCCEEDED", taskType: "FIGURE_PROTOTYPE" }))
    );
    await page.route("**/api/common/3d/figurine/build", (r) =>
      json(r, ok({ id: "build-1", status: "IN_PROGRESS", taskType: "FIGURE_BUILD" }))
    );

    await page.goto("/studio");
    await page.getByRole("button", { name: "Chibi figurine" }).click();
    await page.getByRole("button", { name: "Image URL" }).click();
    await page.getByPlaceholder("https://example.com/character.png").fill("https://example.com/face.png");

    const proto = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/figurine") && !r.url().includes("/build") && r.method() === "POST"
    );
    await page.getByRole("button", { name: "Create chibi figurine" }).click();
    await proto;

    // Prototype SUCCEEDED → the build stage is launched automatically.
    const build = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/figurine/build") && r.method() === "POST"
    );
    await build;
  });
});
