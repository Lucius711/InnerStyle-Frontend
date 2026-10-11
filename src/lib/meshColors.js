import * as THREE from "three";

const pixelCache = new WeakMap();

/** RGBA pixels of a texture image (ImageBitmap / HTMLImageElement / canvas), read once and cached. */
function pixelsOf(image) {
  let px = pixelCache.get(image);
  if (px) return px;
  const w = image.width;
  const h = image.height;
  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  px = { data: ctx.getImageData(0, 0, w, h).data, w, h };
  pixelCache.set(image, px);
  return px;
}

/** UV (any range) -> pixel index; glTF textures have flipY=false, three's TextureLoader flipY=true. */
export function uvToPixel(u, v, w, h, flipY) {
  const fu = u - Math.floor(u);
  const fv = v - Math.floor(v);
  const x = Math.min(w - 1, Math.floor(fu * w));
  const y = Math.min(h - 1, Math.floor((flipY ? 1 - fv : fv) * h));
  return y * w + x;
}

/**
 * sRGB colour (0-255, rgb interleaved) of every vertex of a mesh: base-colour texture at the
 * vertex UV, tinted by the material colour; falls back to the flat material colour.
 * shortcut: uses the mesh's first material only (multi-material meshes get one map), fine for Meshy GLBs.
 */
export function vertexColorsSrgb(mesh) {
  const pos = mesh.geometry.attributes.position;
  const uv = mesh.geometry.attributes.uv;
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const tint = { r: 1, g: 1, b: 1 };
  mat?.color?.getRGB(tint, THREE.SRGBColorSpace);
  const out = new Uint8Array(pos.count * 3);
  const img = mat?.map?.image;
  const px = img && uv ? pixelsOf(img) : null;
  for (let i = 0; i < pos.count; i++) {
    let r = 255, g = 255, b = 255;
    if (px) {
      const p = uvToPixel(uv.getX(i), uv.getY(i), px.w, px.h, mat.map.flipY) * 4;
      r = px.data[p]; g = px.data[p + 1]; b = px.data[p + 2];
    }
    out[i * 3] = Math.round(r * tint.r);
    out[i * 3 + 1] = Math.round(g * tint.g);
    out[i * 3 + 2] = Math.round(b * tint.b);
  }
  return out;
}

/** Bake the texture into a vertex `color` attribute (linear, as three expects) on every mesh — for PLY. */
export function bakeVertexColors(root) {
  const c = new THREE.Color();
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position) return;
    const srgb = vertexColorsSrgb(o);
    const lin = new Float32Array(srgb.length);
    for (let i = 0; i < srgb.length; i += 3) {
      c.setRGB(srgb[i] / 255, srgb[i + 1] / 255, srgb[i + 2] / 255, THREE.SRGBColorSpace);
      lin[i] = c.r; lin[i + 1] = c.g; lin[i + 2] = c.b;
    }
    o.geometry.setAttribute("color", new THREE.BufferAttribute(lin, 3));
  });
}
