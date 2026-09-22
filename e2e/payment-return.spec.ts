import { test, expect } from "@playwright/test";
import { ok, mockApi } from "./helpers";

/**
 * Payment-gateway return page (payOS). It verifies the return with the backend and
 * shows a success/failure card based on the returned `status`.
 */
test.describe("Payment return", () => {
  test("TC-E2E-150: SUCCESS status shows the success card", async ({ page }) => {
    await mockApi(page);
    await page.route("**/api/common/payments/**", (r) =>
      r.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({ status: "SUCCESS", amount: 199000 })),
      })
    );
    await page.goto("/wallet/payos-return?code=00");
    await expect(page.getByRole("heading", { name: "Payment successful" })).toBeVisible();
  });

  test("TC-E2E-151: a non-success status shows the failure card", async ({ page }) => {
    await mockApi(page);
    await page.route("**/api/common/payments/**", (r) =>
      r.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({ status: "FAILED" })),
      })
    );
    await page.goto("/wallet/payos-return?code=01");
    await expect(page.getByRole("heading", { name: "Payment not completed" })).toBeVisible();
  });
});
