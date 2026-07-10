import { test, expect } from "./fixtures";
import { ok, err, USER } from "./helpers";

/**
 * Username + password authentication (register + login). Sign-up creates the account but does
 * NOT start a session — the user is returned to the sign-in form and must log in. All backend
 * calls are mocked at the network layer, so these run against the Vite dev server alone.
 */

const readAccessToken = (page: import("@playwright/test").Page) =>
  page.evaluate(() => localStorage.getItem("innerstyle.accessToken"));

test.describe("Auth · Register (username + password)", () => {
  test("TC-AUTH-001 (happy): register does not auto-login — returns to the sign-in form", async ({
    page,
    loginPage,
    mockAuthApi,
  }) => {
    await mockAuthApi({ register: { body: ok({ user: USER }) } });
    await loginPage.gotoRegister();

    await test.step("submit the registration form", async () => {
      await expect(loginPage.fullName).toBeVisible(); // register mode
      await loginPage.register("newuser", "secret123", "New User");
    });

    await test.step("no session is created and the form flips to login", async () => {
      await expect(page.getByText("Account created")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
      await expect(loginPage.fullName).toBeHidden();
      await expect(page).toHaveURL(/\/register$/); // stayed on the auth page (not /studio)
      expect(await readAccessToken(page)).toBeNull();
    });
  });

  test("TC-AUTH-002 (happy): full name is optional", async ({ loginPage, page, mockAuthApi }) => {
    await mockAuthApi({ register: { body: ok({ user: USER }) } });
    await loginPage.gotoRegister();
    await loginPage.register("nofullname", "secret123"); // fullName omitted
    await expect(page.getByText("Account created")).toBeVisible();
  });

  test("TC-AUTH-003 (validation): username shorter than 3 chars is rejected client-side", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoRegister();
    await loginPage.register("ab", "secret123", "AB");
    await expect(page.getByText("Username too short")).toBeVisible();
    await expect(loginPage.fullName).toBeVisible(); // still in register mode
  });

  test("TC-AUTH-004 (validation): password shorter than 6 chars is rejected client-side", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoRegister();
    await loginPage.register("goodname", "123", "Good Name");
    await expect(page.getByText("Password too short")).toBeVisible();
  });

  test("TC-AUTH-005 (validation): empty fields are rejected", async ({ loginPage, page, mockAuthApi }) => {
    await mockAuthApi();
    await loginPage.gotoRegister();
    await loginPage.submit.click();
    await expect(page.getByText("Missing details")).toBeVisible();
  });

  test("TC-AUTH-006 (negative): duplicate username surfaces a conflict error", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi({ register: err("user.usernameExists", 409) });
    await loginPage.gotoRegister();
    await loginPage.register("taken", "secret123", "Taken");
    // Assert the stable toast title (message copy lives in messages.js and may be localised).
    await expect(page.getByText("Couldn't create account")).toBeVisible();
    await expect(loginPage.fullName).toBeVisible(); // stayed in register mode
    expect(await readAccessToken(page)).toBeNull();
  });

  test("TC-AUTH-007 (edge): whitespace-only username is treated as empty", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoRegister();
    await loginPage.username.fill("   ");
    await loginPage.password.fill("secret123");
    await loginPage.submit.click();
    await expect(page.getByText("Missing details")).toBeVisible();
  });
});

test.describe("Auth · Login (username + password)", () => {
  test("TC-AUTH-010 (happy): valid credentials sign the user in and land on /studio", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi({
      login: { body: ok({ accessToken: "a-token", refreshToken: "r-token", user: USER }) },
    });
    await loginPage.gotoLogin();
    await loginPage.login("huy", "secret123");
    await expect(page).toHaveURL(/\/studio/);
    expect(await readAccessToken(page)).toBe("a-token");
  });

  test("TC-AUTH-011 (negative): invalid credentials show an error and stay on /login", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi({ login: err("auth.invalidCredentials", 401) });
    await loginPage.gotoLogin();
    await loginPage.login("huy", "wrongpass");
    await expect(page.getByText("Sign-in failed")).toBeVisible(); // stable toast title
    await expect(page).toHaveURL(/\/login$/);
    expect(await readAccessToken(page)).toBeNull();
  });

  test("TC-AUTH-012 (negative): suspended account is blocked", async ({ loginPage, page, mockAuthApi }) => {
    await mockAuthApi({ login: err("auth.accountInactive", 401) });
    await loginPage.gotoLogin();
    await loginPage.login("huy", "secret123");
    await expect(page.getByText("Sign-in failed")).toBeVisible(); // stable toast title
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-AUTH-013 (validation): empty credentials are rejected before any request", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoLogin();
    await loginPage.submit.click();
    await expect(page.getByText("Missing details")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-AUTH-014 (API failure): a 500 from the server shows a generic error", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi({ login: err("common.serverError", 500) });
    await loginPage.gotoLogin();
    await loginPage.login("huy", "secret123");
    await expect(page.getByText("Sign-in failed")).toBeVisible(); // stable toast title
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-AUTH-015 (network): an aborted login request is handled gracefully", async ({
    loginPage,
    page,
  }) => {
    // Let mount-time calls succeed, but drop the login POST at the network layer.
    await page.route("**/api/**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok([])) })
    );
    await page.route("**/api/user/auth/login", (r) => r.abort());
    await loginPage.gotoLogin();
    await loginPage.login("huy", "secret123");
    await expect(page.getByText("Sign-in failed")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("Auth · Form UX", () => {
  test("TC-AUTH-020: /login defaults to the login form (no full-name field)", async ({
    loginPage,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoLogin();
    await expect(loginPage.fullName).toBeHidden();
    await expect(loginPage.submit).toHaveText(/Sign in/);
  });

  test("TC-AUTH-021: toggling to register reveals the full-name field and updates the header", async ({
    loginPage,
    page,
    mockAuthApi,
  }) => {
    await mockAuthApi();
    await loginPage.gotoLogin();
    await loginPage.switchMode.click();
    await expect(loginPage.fullName).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("TC-AUTH-022: /register deep link opens the register form", async ({ loginPage, page, mockAuthApi }) => {
    await mockAuthApi();
    await loginPage.gotoRegister();
    await expect(loginPage.fullName).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("TC-AUTH-023: the show/hide toggle reveals the password", async ({ loginPage, mockAuthApi }) => {
    await mockAuthApi();
    await loginPage.gotoLogin();
    await loginPage.password.fill("secret123");
    await expect(loginPage.password).toHaveAttribute("type", "password");
    await loginPage.togglePassword.click();
    await expect(loginPage.password).toHaveAttribute("type", "text");
  });
});

test.describe("Auth · Session", () => {
  test("TC-AUTH-030 (session expiry): a dead session + failed refresh redirects to /login", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("innerstyle.accessToken", "expired-access");
      localStorage.setItem("innerstyle.refreshToken", "expired-refresh");
    });
    // Catch-all first, then the specific expiry routes (registered last → they win).
    await page.route("**/api/**", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok([])) })
    );
    const unauthorized = (r: import("@playwright/test").Route) =>
      r.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify(err("auth.refresh.invalid", 401).body),
      });
    await page.route("**/api/user/account/me", unauthorized);
    await page.route("**/api/user/auth/refresh", unauthorized);

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login$/);
  });
});
