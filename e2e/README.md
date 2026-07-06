# Frontend E2E (Playwright)

These specs cover the critical auth journeys (register → OTP verify, login, forgot-password),
route guards, and 404 handling. They **mock the backend at the network layer** (`page.route`),
so they run against just the Vite dev server — no live backend or database needed.

## Install (first time)

```bash
npm install
npx playwright install       # download browser binaries
```

## Run

```bash
npm run test:e2e             # headless, all browsers
npm run test:e2e:ui         # interactive UI mode
npm run test:e2e:report     # open the last HTML report
```

The config auto-starts `npm run dev` on http://localhost:5173.

## Run against a real backend

Set `E2E_BASE_URL` to your running app and remove/relax the `page.route` mocks in the specs:

```bash
E2E_BASE_URL=http://localhost:5173 npm run test:e2e
```

## Coverage map

| Spec | Test cases (see backend `docs/testing/TEST-CASES.md`) |
|------|-------------------------------------------------------|
| `auth-register-verify.spec.ts` | TC-E2E-001..003 |
| `verify-email-edge.spec.ts` | TC-E2E-004..008 |
| `auth-login.spec.ts` | TC-E2E-009..012 |
| `auth-forgot-password.spec.ts` | TC-E2E-013 |
| `navigation-guards.spec.ts` | TC-E2E-015, 017, 020, 021 |
