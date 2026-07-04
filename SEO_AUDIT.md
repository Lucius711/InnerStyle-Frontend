# InnerStyle — Technical SEO Audit & Roadmap

> Scope note: the supplied brief described a *furniture / TypeScript / React Query* app. The real
> codebase is different and this audit is written against **what actually exists**:
>
> - **Product**: AI pipeline that turns a 2D image / text prompt into a textured, rigged, animated 3D model (+ figurine, 3D-print ordering, AR preview). **Not** a furniture catalog.
> - **Stack**: React 18 **JavaScript/JSX (no TypeScript)**, **React Router**, **framer-motion**, **three.js / @react-three**, TailwindCSS, **Vite** build, served by **nginx** (SPA fallback). **No React Query**, **no react-helmet**.
> - **SEO infra already present**: `src/components/seo/Seo.jsx` (lightweight head manager), `public/robots.txt`, `public/sitemap.xml`, static OG + `SoftwareApplication` JSON-LD in `index.html`.

The single most important fact for SEO strategy: **InnerStyle is an authenticated tool, not a content site.** Almost every route (`/studio`, `/my-3d-printing`, `/print-history`, `/profile`, `/membership`, staff) is behind login and has no public, indexable content. The realistic indexable surface today is **one page — the marketing Landing (`/`)** — plus any future static marketing pages (about/pricing/blog). The roadmap is sized to that reality.

---

## Phase 1 — Audit findings (by severity)

### CRITICAL
**C1. 100% client-side rendering → invisible to non-JS crawlers.**
The app is a Vite SPA; nginx serves `index.html` for every route and React renders content in the browser. Googlebot executes JS (so the homepage can still rank), but **social/link crawlers (Facebook, Zalo, X/Twitter, LinkedIn, Discord) do not run JS**. Per-route meta written by `Seo.jsx` only exists *after* hydration, so those crawlers see **only the static tags baked into `index.html`** — which are homepage-generic. Any shared non-home URL gets the wrong/blank preview.
*Files:* `index.html`, `src/components/seo/Seo.jsx`, `nginx.conf`.
*Why it matters:* link previews and reliable indexing of anything beyond `/` depend on HTML being present without JS.

### HIGH
**H1. No route-level code splitting → heavy bundle → weak Core Web Vitals.**
`src/App.jsx` imports **every page statically**, so `three.js`, `@react-three/fiber`, `@react-three/drei`, `recharts`, and `framer-motion` all land in the initial bundle even for a visitor who only sees the Landing page. This inflates LCP/TBT and drags the Lighthouse **Performance** score.
*Files:* `src/App.jsx` (static `import Studio from …`, `import ArView …`, etc.).

**H2. `sitemap.xml` is stale/incorrect.**
It lists only `/` and `/gallery`. But `/gallery` **redirects to `/my-3d-printing`** (an auth-only page) in `App.jsx`. So the sitemap advertises a URL that 302s into a private route, and omits any real public page.
*Files:* `public/sitemap.xml`, `src/App.jsx`.

**H3. App/tool routes are indexable by default.**
`robots.txt` only disallows auth pages (`/login`, `/register`, `/wallet`, …). `/studio`, `/my-3d-printing`, `/print-history`, `/profile`, `/membership`, and `/ar/:taskId` are crawlable but are either auth-gated (thin/empty to a bot) or per-user. `ArView` (`/ar/:taskId`) is public **and does not set `noindex`**, so unbounded UUID URLs can be discovered and indexed as thin pages.
*Files:* `public/robots.txt`, `src/pages/ArView.jsx`, app routes.

**H4. Most pages never set per-page metadata.**
`<Seo>` is used on only ~5 surfaces (Landing, Gallery, Membership, PaymentReturn, AuthShell, ProfileLayout). Until JS runs, **every route shares the homepage `<title>`/description** from `index.html`. Low impact for noindex pages, but means there is no per-page title even for pages you *would* want indexed later.

### MEDIUM
**M1. Canonical includes query/hash.** `Seo.jsx` sets canonical to `window.location.href`, so `?utm=…`, `&v=…` cache-busters, and `#anchor` leak into the canonical. Should be `origin + pathname`.
*File:* `src/components/seo/Seo.jsx` (`upsertCanonical`).

**M2. Single-language signals.** `index.html` is `lang="en"` and all default meta/OG are English, but the app ships Vietnamese (`vi.js`) and English. No `hreflang`, and `lang` never reflects the active locale.
*Files:* `index.html`, i18n provider.

**M3. JSON-LD is partial.** `index.html` has `SoftwareApplication` only. Missing `Organization` (logo, sameAs) and `WebSite` (+ optional `SearchAction`) which are the standard homepage trio.

**M4. OG/meta duplicated in two places.** Static tags live in `index.html` *and* are re-written by `Seo.jsx`, with slightly different copy/title formats — risk of drift.

### LOW
**L1. `keywords` meta** in `index.html` — deprecated, ignored by Google. Harmless; can drop.
**L2. Image hygiene** — sample images use `loading="lazy"` and real `alt` (good). Decorative SVGs/orbs are correctly non-semantic. Verify any hero/`og-cover.png` has explicit width/height to avoid CLS; serve WebP/AVIF where possible.
**L3. Accessibility** — `aria-label`s exist on icon buttons across the app; confirm heading order on Landing (one `<h1>` in `Hero`, section `<h2>`s — currently correct) and color-contrast of `text-app-faint` on dark.

---

## Phase 9 verdict first (it drives everything): CSR vs SSR
The app **is fully CSR**. But you do **not** need Next.js. Migrating a three.js/auth-heavy SPA to SSR is weeks of work for almost no SEO gain, because the pages that benefit from SSR (public, content-rich) barely exist here.

**Recommendation: build-time prerendering of the few public/marketing routes**, keep everything else CSR + `noindex`.
- Prerender `/` (and future `/about`, `/pricing`, `/blog/*`) to static HTML with real content + correct meta/OG/JSON-LD using **`vite-plugin-prerender` / `react-snap` / a small Puppeteer step** in the Docker build.
- Tool routes stay CSR and are marked `noindex` (they have nothing for a bot to index).
- Revisit SSR/SSG **only if** you later add a public, shareable gallery of generated models or a content blog — then SSR those specific routes.

This is the cheapest path to a 95+ homepage SEO score and correct social previews.

---

## Phases 2–8 mapped to *this* app

| Brief phase | Applies here? | Action |
|---|---|---|
| **2. Per-page metadata** | ✅ partial | Add `<Seo>` to remaining public/static pages; fix canonical (M1); set `lang` per locale (M2). `react-helmet-async` is **not needed** — the existing `Seo.jsx` is sufficient and lighter. |
| **3. Sitemap & robots** | ✅ | Rebuild `sitemap.xml` from real public routes; disallow app/tool routes; `noindex` `/ar/*`. (Details below.) |
| **4. UUID → slugs** | ❌ N/A | There are **no public product pages**. `/ar/:taskId` uses a UUID but should be `noindex`, so slugs add no SEO value. **No backend change needed.** |
| **5. Structured data** | ◐ | `Product/Offer/Review/AggregateRating/BreadcrumbList` = **N/A** (no e-commerce product pages). Add `Organization` + `WebSite` (+ optional `SearchAction`) to the homepage (M3). Keep `SoftwareApplication`. |
| **6. Images** | ◐ minor | Already lazy + alt on samples. Add explicit dimensions; convert `og-cover.png`/samples to WebP; preload the LCP hero asset. |
| **7. Accessibility** | ◐ | Largely OK (aria-labels, one H1). Spot-fix contrast + ensure modals trap focus. |
| **8. Performance** | ✅ high value | **H1 code splitting** is the big one: `React.lazy` per route so three.js/recharts load only on Studio/AR. Plus `manualChunks` in Vite, and the mobile render-cost fixes already applied (animated-blur/backdrop-blur). |

---

## Prioritized roadmap

**P0 — Quick wins (~0.5–1 day, no backend)**
1. Rebuild `public/sitemap.xml` to real public URLs; drop `/gallery`. (H2)
2. `robots.txt`: disallow `/studio`, `/my-3d-printing`, `/print-history`, `/profile`, `/membership`, `/ar`, `/staff`. (H3)
3. `ArView`: render `<Seo noindex />`. (H3)
4. Fix canonical to `origin+pathname`; sync `<html lang>` with locale. (M1, M2)
5. Add `Organization` + `WebSite` JSON-LD to homepage; de-duplicate OG between `index.html` and `Seo.jsx`. (M3, M4)

**P1 — Performance / CWV (~0.5–1 day)**
6. `React.lazy` + `Suspense` for `Studio`, `ArView`, `StaffDashboard`, `Membership`, `MyModels`; Vite `manualChunks` to split `three`/`drei`/`recharts`. (H1)
7. Preload LCP hero asset; ship WebP; explicit image dimensions.

**P2 — Make content actually indexable (~0.5–1 day)**
8. Add build-time prerender for `/` (+ future marketing routes). (C1)
9. Add real marketing pages worth indexing (About / How-it-works / Pricing) — only if SEO traffic is a goal.

---

## Estimates

- **Lighthouse SEO (homepage):** ~85–90 today → **95–100** after P0 (per-page meta in static HTML via prerender, clean canonical, valid sitemap/robots). The SEO category is easy to max here.
- **Lighthouse Performance (homepage):** likely **50–75** today (eager three.js + multiple WebGL canvases + animated blur). P1 code-splitting + the mobile fixes already applied should push mobile toward **75–90**; the 3D showcase is the main remaining cost.
- **Core Web Vitals:** LCP is the risk (hero + WebGL). Code splitting + preload + WebP target **LCP < 2.5s**; CLS is already low; INP fine once the main-thread 3D work is deferred/split.
- **Effort:** P0 ≈ 0.5–1d, P1 ≈ 0.5–1d, P2 ≈ 0.5–1d. Total **~2–3 days** for the high-value set. (Next.js migration, by contrast, would be ~1–3 **weeks** for negligible additional SEO gain — not recommended.)

## Backend changes required
**None for SEO.** No slugs, no SSR API, no schema endpoints are needed for the current indexable surface. The only backend-touching item would be a *future* public, shareable model gallery (public read endpoints + prerender) — out of scope unless you want indexable user content.
