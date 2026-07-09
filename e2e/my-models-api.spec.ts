import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/**
 * "My 3D models" library — exercises:
 *   GET    /api/common/3d/tasks           (list, with optional ?status filter)
 *   DELETE /api/common/3d/tasks/{id}      (delete a model)
 */
const TASK = {
  id: "task-1",
  taskType: "TEXT_TO_3D_REFINE",
  status: "SUCCEEDED",
  modelUrls: {},
  thumbnailUrl: null,
  createdAt: new Date().toISOString(),
};

async function mockTasks(page) {
  // One route serves both the list (GET) and the delete (DELETE) of /tasks.
  await page.route("**/api/common/3d/tasks**", (route) => {
    const method = route.request().method();
    const body =
      method === "DELETE" ? ok(null) : ok({ content: [TASK], last: true });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

test.describe("My models API", () => {
  test("TC-API-MDL-001: GET /tasks lists the user's models", async ({ page }) => {
    await authed(page, USER);
    await mockTasks(page);

    const listReq = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/tasks") && r.method() === "GET"
    );
    await page.goto("/my-3d-printing");
    await listReq;

    await expect(page.getByText("Ready").first()).toBeVisible(); // SUCCEEDED status badge
  });

  test("TC-API-MDL-002: the status filter re-queries GET /tasks?status=SUCCEEDED", async ({ page }) => {
    await authed(page, USER);
    await mockTasks(page);
    await page.goto("/my-3d-printing");

    const filtered = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/tasks") && new URL(r.url()).searchParams.get("status") === "SUCCEEDED"
    );
    await page.getByRole("button", { name: "Ready", exact: true }).click(); // the "Ready" (SUCCEEDED) filter chip
    await filtered;
  });

  test("TC-API-MDL-003: DELETE /tasks/{id} after confirming removal", async ({ page }) => {
    await authed(page, USER);
    await mockTasks(page);
    await page.goto("/my-3d-printing");
    await expect(page.getByText("Ready").first()).toBeVisible();

    await page.getByRole("button", { name: "Options", exact: true }).click(); // the card "..." menu
    await page.getByRole("button", { name: "Delete", exact: true }).click(); // menu → Delete
    await expect(page.getByText("Delete this model?")).toBeVisible();

    const del = page.waitForRequest(
      (r) => r.url().includes("/api/common/3d/tasks/task-1") && r.method() === "DELETE"
    );
    await page.getByRole("button", { name: "Delete", exact: true }).click(); // dialog → confirm
    await del;
    await expect(page.getByText("Model deleted")).toBeVisible();
  });
});
