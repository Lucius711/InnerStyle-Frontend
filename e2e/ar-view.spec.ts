import { test, expect } from "@playwright/test";
import { mockApi } from "./helpers";

/**
 * Standalone AR launcher (opened by scanning the QR on a phone). Routing smoke only — the
 * WebGL/AR runtime isn't exercised in e2e. Confirms the bare route resolves and is not bounced
 * to /login or the 404 page.
 */
test.describe("AR view", () => {
  test("TC-E2E-160: /ar/:taskId resolves as a standalone route", async ({ page }) => {
    await mockApi(page);
    await page.goto("/ar/task-123");
    await expect(page).toHaveURL(/\/ar\/task-123/);
  });
});
