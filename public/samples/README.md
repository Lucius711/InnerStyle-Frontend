# Showcase sample models

Drop exported 3D models here to show them in the landing-page "Showcase / Ví dụ"
section. Each file is served from the site root, e.g. `public/samples/robot.glb`
is reachable at `/samples/robot.glb`.

## Expected files

There are two card kinds (see `src/sections/Showcase.jsx`):

- **image cards** show a 2D source photo on the left → 3D model on the right.
- **text cards** show just the prompt text on the left → 3D model on the right
  (text-to-3D has no source image, so no 2D file is needed).

Every card needs its `.glb`; only the image cards need a `.jpg`.

| Card | Kind  | Prompt (vi)                     | 2D image                 | 3D model                  |
|------|-------|---------------------------------|--------------------------|---------------------------|
| 1    | image | "Ảnh sản phẩm"                  | `/samples/product.jpg`   | `/samples/product.glb`    |
| 2    | text  | "chiến binh robot tương lai"    | — (text only)            | `/samples/robot.glb`      |
| 3    | text  | "cáo đất sét dễ thương, pastel" | — (text only)            | `/samples/fox.glb`        |
| 4    | image | "Concept nhân vật"              | `/samples/character.jpg` | `/samples/character.glb`  |

- The 2D image is the reference photo / concept you fed into the generator.
  `.jpg`, `.png` or `.webp` all work — keep the filename's path matching the
  table (change the extension in `Showcase.jsx` if you prefer png/webp).
- Until a model file exists, that card's right side falls back to the animated
  hex, so the page never looks broken.

### Model formats

Both **`.glb`** and **`.obj`** are supported — the viewer auto-detects by file
extension, so you can point a card's `model` path at either (e.g.
`/samples/robot.obj`).

- **`.glb`** (recommended): self-contained, keeps color/texture. Best look.
- **`.obj`**: geometry only — it's rendered with a clean grey "clay" material
  (any `.mtl`/textures are ignored). Good when you only have the print mesh.

## How to get the files from Meshy

1. In the Studio, generate a model, then use **Download / Export** to save a
   `.glb` (GLB is self-contained — geometry + textures in one file, ideal here).
2. Rename it to one of the names above and place it in this folder.
3. Re-run / refresh the site — the card will load and slowly auto-rotate it.

## Tips

- Prefer `.glb` over `.gltf` (single file, no missing-texture issues).
- Keep each file reasonably small (ideally < 5–8 MB) so the landing page stays
  fast; use the Studio's remesh/optimize step if a model is very heavy.
- `.gltf` also works if you point the path at the `.gltf` file, but make sure its
  referenced `.bin` / texture files sit alongside it.
