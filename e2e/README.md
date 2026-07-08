# Frontend E2E (Playwright)

Sign-in is social-only (Google / Facebook). These specs cover the social-only auth surface
(password-free login page, legacy auth-route redirects, seeded-session route guards) and 404
handling. They **mock the backend at the network layer** (`page.route`), so they run against
just the Vite dev server — no live backend or database needed.

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
| `auth-login.spec.ts` | TC-E2E-009, 010, 011, 013 (social-only login, legacy redirects, seeded session) |
| `navigation-guards.spec.ts` | TC-E2E-015, 017, 020, 021 |
| `landing.spec.ts` | TC-E2E-100, 101 (public landing renders) |
| `studio.spec.ts` | TC-E2E-110, 111 (guard + loads) |
| `creative-lab.spec.ts` | TC-E2E-115, 116 (guard + `/lab` redirect) |
| `membership.spec.ts` | TC-E2E-120, 121 (guard + loads) |
| `profile-area.spec.ts` | TC-E2E-130..133 (profile / my-models / print-history) |
| `staff-dashboard.spec.ts` | TC-E2E-140, 141, 142 (guard + role gating) |
| `payment-return.spec.ts` | TC-E2E-150, 151 (success / failure card) |
| `legacy-redirects.spec.ts` | TC-E2E-155, 156 (/gallery, /print-orders) |
| `ar-view.spec.ts` | TC-E2E-160 (standalone route smoke) |
| `studio-generate-edit.spec.ts` | TC-E2E-170 (text→3D generate → poll → edit/Refine flow) |
| `membership-api.spec.ts` | Membership: me / plans / subscribe |
| `my-models-api.spec.ts` | 3D library: list / status filter / delete |
| `print-history-api.spec.ts` | User print orders list |
| `staff-orders-api.spec.ts` | Staff orders: list / filter / status / download / printability / repair |
| `studio-pipeline-api.spec.ts` | Meshy: image-to-3d + rig / retexture / remesh |
| `figurine-api.spec.ts` | Meshy: figurine prototype → build |

All non-public specs seed a JWT session via `authed()` in `helpers.ts` and mock the backend at the
network layer, so no real social sign-in (Google/Facebook) is needed. Assertions anchor on URLs,
route guards and role/heading presence — locale-independent, so they hold in either language.
