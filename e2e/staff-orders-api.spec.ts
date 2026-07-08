import { test, expect } from "@playwright/test";
import { ok, authed, STAFF } from "./helpers";

/**
 * Staff fulfilment dashboard — exercises the staff order APIs reachable through the UI:
 *   GET   /api/staff/orders                       (list, with ?status filter)
 *   GET   /api/staff/orders/{id}/thumbnail        (order preview image)
 *   PATCH /api/staff/orders/{id}/status           (advance status)
 *   GET   /api/staff/orders/{id}/model            (download)
 *   GET   /api/staff/orders/{id}/printability     (analyse)
 *   POST  /api/staff/orders/{id}/repair           (auto-fix)
 * (GET /api/staff/orders/{id} has no UI trigger — the list returns full rows — so it is omitted.)
 */
const ORDER = {
  id: "ord-abcd-1234-5678",
  status: "PAID",
  amount: 199000,
  createdAt: new Date().toISOString(),
  sourceTaskId: "task-1",
  recipientName: "Nguyen A",
  recipientPhone: "0900000000",
  recipientEmail: "a@example.com",
  addressDetail: "1 Street",
  wardName: "Ward",
  provinceName: "City",
  customerName: "Cust",
  customerEmail: "c@example.com",
  note: null,
};

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function mockStaff(page) {
  await page.route(/\/api\/staff\/orders\?/, (r) => json(r, ok({ content: [ORDER], last: true })));
  await page.route(/\/api\/staff\/orders\/[^/]+\/thumbnail/, (r) => r.fulfill({ status: 204, body: "" }));
  await page.route(/\/api\/staff\/orders\/[^/]+\/status/, (r) =>
    json(r, ok({ ...ORDER, status: "IN_PRODUCTION" }))
  );
  await page.route(/\/api\/staff\/orders\/[^/]+\/model/, (r) =>
    r.fulfill({ status: 200, contentType: "application/zip", body: "PK" })
  );
  await page.route(/\/api\/staff\/orders\/[^/]+\/printability/, (r) =>
    json(r, ok({ watertight: false, volume: 12.3, holes: 2, nonManifoldEdges: 1, triangles: 1000 }))
  );
  await page.route(/\/api\/staff\/orders\/[^/]+\/repair/, (r) =>
    json(r, ok({ after: { watertight: true, holes: 0, nonManifoldEdges: 0, triangles: 1000 } }))
  );
}

test.describe("Staff orders API", () => {
  test("TC-API-STF-001: GET /orders + /thumbnail on load", async ({ page }) => {
    await authed(page, STAFF);
    await mockStaff(page);

    const listReq = page.waitForRequest((r) => /\/api\/staff\/orders\?/.test(r.url()) && r.method() === "GET");
    const thumbReq = page.waitForRequest((r) => /\/api\/staff\/orders\/[^/]+\/thumbnail/.test(r.url()));
    await page.goto("/staff");
    await listReq;
    await thumbReq;

    await expect(page.getByText("PAID")).toBeVisible();
    await expect(page.getByText("#ord-abcd")).toBeVisible(); // id.slice(0, 8)
  });

  test("TC-API-STF-002: status filter re-queries GET /orders?status=PENDING", async ({ page }) => {
    await authed(page, STAFF);
    await mockStaff(page);
    await page.goto("/staff");

    const filtered = page.waitForRequest(
      (r) => r.url().includes("/api/staff/orders") && new URL(r.url()).searchParams.get("status") === "PENDING"
    );
    await page.getByRole("button", { name: "PENDING" }).click();
    await filtered;
  });

  test("TC-API-STF-003: PATCH /status advances the order", async ({ page }) => {
    await authed(page, STAFF);
    await mockStaff(page);
    await page.goto("/staff");
    await expect(page.getByText("#ord-abcd")).toBeVisible();

    await page.getByRole("button", { name: /Set status/ }).click();
    const patch = page.waitForRequest(
      (r) => /\/api\/staff\/orders\/[^/]+\/status/.test(r.url()) && r.method() === "PATCH"
    );
    await page.getByRole("button", { name: "IN_PRODUCTION" }).click();
    const req = await patch;
    expect(req.postDataJSON()).toMatchObject({ status: "IN_PRODUCTION" });
    await expect(page.getByText("Status updated")).toBeVisible();
  });

  test("TC-API-STF-004: Download triggers GET /model", async ({ page }) => {
    await authed(page, STAFF);
    await mockStaff(page);
    await page.goto("/staff");
    await expect(page.getByText("#ord-abcd")).toBeVisible();

    const modelReq = page.waitForRequest(
      (r) => /\/api\/staff\/orders\/[^/]+\/model/.test(r.url()) && r.method() === "GET"
    );
    await page.getByRole("button", { name: "Download" }).click();
    await modelReq;
  });

  test("TC-API-STF-005: printability check then auto-fix (GET /printability, POST /repair)", async ({ page }) => {
    await authed(page, STAFF);
    await mockStaff(page);
    await page.goto("/staff");
    await expect(page.getByText("#ord-abcd")).toBeVisible();

    const checkReq = page.waitForRequest(
      (r) => /\/api\/staff\/orders\/[^/]+\/printability/.test(r.url()) && r.method() === "GET"
    );
    await page.getByRole("button", { name: "Check printability" }).click();
    await checkReq;
    await expect(page.getByText("Needs repair")).toBeVisible();

    const repairReq = page.waitForRequest(
      (r) => /\/api\/staff\/orders\/[^/]+\/repair/.test(r.url()) && r.method() === "POST"
    );
    await page.getByRole("button", { name: "Auto-fix & download STL" }).click();
    await repairReq;
  });
});
