import { test, expect } from "@playwright/test";
import { ok, authed, USER } from "./helpers";

/** Print history — exercises GET /api/user/print/orders (the user's past 3D-print orders). */
const ORDER = {
  id: "order-12-3456-7890",
  status: "PAID",
  amount: 199000,
  note: null,
  createdAt: new Date().toISOString(),
};

test.describe("Print history API", () => {
  test("TC-API-PRT-001: GET /orders renders the order list", async ({ page }) => {
    await authed(page, USER);
    await page.route("**/api/user/print/orders**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok({ content: [ORDER], last: true })) })
    );

    const listReq = page.waitForRequest(
      (r) => r.url().includes("/api/user/print/orders") && r.method() === "GET"
    );
    await page.goto("/print-history");
    await listReq;

    await expect(page.getByText("PAID")).toBeVisible();
    await expect(page.getByText("#order-12")).toBeVisible(); // id.slice(0, 8)
  });

  test("TC-API-PRT-002: an empty order list shows the empty state", async ({ page }) => {
    await authed(page, USER);
    await page.route("**/api/user/print/orders**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok({ content: [], last: true })) })
    );
    await page.goto("/print-history");
    await expect(page.getByText("No print orders yet.")).toBeVisible();
  });
});
