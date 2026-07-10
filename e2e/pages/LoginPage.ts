import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object for the auth page (`/login` and `/register`). Wraps the username + password form
 * (PasswordAuthForm) plus the social sign-in card. Uses stable `data-testid` locators so the
 * specs don't depend on copy/markup.
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly fullName: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly switchMode: Locator;
  readonly togglePassword: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByTestId("auth-username");
    this.fullName = page.getByTestId("auth-fullname");
    this.password = page.getByTestId("auth-password");
    this.submit = page.getByTestId("auth-submit");
    this.switchMode = page.getByTestId("auth-switch-mode");
    this.togglePassword = page.getByTestId("auth-toggle-password");
    this.heading = page.getByRole("heading", { level: 1 });
  }

  async gotoLogin() {
    await this.page.goto("/login");
    await expect(this.submit).toBeVisible();
  }

  async gotoRegister() {
    await this.page.goto("/register");
    await expect(this.submit).toBeVisible();
  }

  /** Fill + submit the login form. Does not assert the outcome. */
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Fill + submit the register form. `fullName` is optional. */
  async register(username: string, password: string, fullName?: string) {
    await this.username.fill(username);
    if (fullName !== undefined) await this.fullName.fill(fullName);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** True when the form is in "register" mode (the full-name field is shown). */
  async isRegisterMode(): Promise<boolean> {
    return this.fullName.isVisible();
  }
}
