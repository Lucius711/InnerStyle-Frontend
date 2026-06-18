# InnerStyle — Frontend

A premium, conversion-focused web app for the **InnerStyle** pipeline: turn a 2D
image or a text prompt into a textured, rigged and animated 3D model (MeshyAI).

Built with **React + Vite + Framer Motion**, an interactive **react-three-fiber**
3D viewer, and TailwindCSS. Plain JavaScript (no TypeScript).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server proxies `/api` → `http://localhost:2207` (the InnerStyle backend),
so make sure the backend is running. No CORS setup needed in dev.

```bash
npm run build        # production build -> dist/
npm run preview      # preview the production build
```

## Configuration

Copy `.env.example` → `.env` if you need to point at a non-default backend:

```dotenv
# Production: the deployed API origin (leave blank in dev to use the proxy)
VITE_API_BASE_URL=
# Dev only: override the proxy target (default http://localhost:2207)
VITE_API_PROXY_TARGET=http://localhost:2207
```

## What's inside

- **Landing page** — animated gradient hero with parallax & floating elements,
  animated stat counters, scroll-reveal feature grid, the 6-step pipeline,
  before→after showcase, and a magnetic CTA. Smooth page transitions throughout.
- **Studio** — the live generation experience:
  - Image → 3D (paste a URL or drag-and-drop an image file)
  - Text → 3D (prompt + presets)
  - Advanced settings: AI model, topology, pose, target polycount, PBR/texture
    toggles, export formats
  - Live task polling with animated progress + skeleton stage
  - Interactive GLB viewer (orbit / zoom), texture-map previews, multi-format
    downloads, and one-click "continue the pipeline" (refine / rig)

## API integration

All calls go through `src/lib/api.js`, which wraps the backend's
`{ success, message, data }` envelope and surfaces field-level validation errors.
Endpoints used (all under `/api/common/3d`):

`image-to-3d`, `image-to-3d/upload`, `text-to-3d`, `refine`, `remesh`,
`retexture`, `rig`, `animate`, `tasks/{id}`, `tasks`.

Task results from MeshyAI are asynchronous — the UI polls `GET /tasks/{id}`
until the status is terminal (`SUCCEEDED` / `FAILED` / `CANCELED`).

## Structure

```
src/
├── lib/            # api client, constants (mirrors backend DTOs), utils
├── hooks/          # useTaskPolling, useToast
├── components/
│   ├── motion/     # MagneticButton, Reveal, Stagger, AnimatedCounter,
│   │               #   AnimatedBackground, PageTransition
│   ├── ui/         # Button, primitives (Card/Badge/Skeleton/Progress), FormControls
│   ├── layout/     # Navbar, Footer
│   ├── three/      # ModelViewer (react-three-fiber GLB viewer)
│   └── studio/     # Dropzone, AdvancedOptions, forms, TaskProgress, ResultPanel
├── sections/       # landing sections (Hero, Stats, Features, Pipeline, Showcase, CTA)
├── pages/          # Landing, Studio
└── App.jsx         # routing + page transitions
```

Animations respect `prefers-reduced-motion`.
