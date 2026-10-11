import * as THREE from "three";
import { zipSync, strToU8 } from "three/examples/jsm/libs/fflate.module.js";
import { vertexColorsSrgb } from "@/lib/meshColors";

// Bambu AMS / AMS lite hold 4 spools. More colours make the slicer create one filament per colour
// (32+ on a Meshy figure), thousands of tool changes and a purge tower bigger than the plate.
export const MAX_PRINT_COLORS = 4;
const SAMPLE = 20000; // triangles used to fit the palette
const KMEANS_ITERS = 12;
const SMOOTH_PASSES = 3;

const hex2 = (c) => Math.round(c).toString(16).padStart(2, "0").toUpperCase();

/** k-means palette (k colours) for n RGB rows; deterministic farthest-point start. */
export function fitPalette(rgb, n, k) {
  const step = Math.max(1, Math.floor(n / SAMPLE));
  const idx = [];
  for (let i = 0; i < n; i += step) idx.push(i);
  const d2 = (i, c) => (rgb[i * 3] - c[0]) ** 2 + (rgb[i * 3 + 1] - c[1]) ** 2 + (rgb[i * 3 + 2] - c[2]) ** 2;
  const mean = [0, 0, 0];
  for (const i of idx) for (let c = 0; c < 3; c++) mean[c] += rgb[i * 3 + c] / idx.length;
  const centers = [];
  let ref = mean;
  for (let j = 0; j < k; j++) {
    let best = -1, far = -1;
    for (const i of idx) {
      const d = Math.min(d2(i, ref), ...centers.map((c) => d2(i, c)));
      if (d > far) { far = d; best = i; }
    }
    if (best < 0 || (j > 0 && far === 0)) break; // fewer distinct colours than k
    centers.push([rgb[best * 3], rgb[best * 3 + 1], rgb[best * 3 + 2]]);
    ref = centers[j];
  }
  for (let it = 0; it < KMEANS_ITERS; it++) {
    const sum = centers.map(() => [0, 0, 0, 0]);
    for (const i of idx) {
      const c = nearest(rgb, i, centers);
      for (let ch = 0; ch < 3; ch++) sum[c][ch] += rgb[i * 3 + ch];
      sum[c][3]++;
    }
    sum.forEach((s, c) => { if (s[3]) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
  }
  return centers;
}

function nearest(rgb, i, centers) {
  let best = 0, bd = Infinity;
  for (let c = 0; c < centers.length; c++) {
    const d = (rgb[i * 3] - centers[c][0]) ** 2 + (rgb[i * 3 + 1] - centers[c][1]) ** 2 + (rgb[i * 3 + 2] - centers[c][2]) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

/**
 * Remove colour speckles: a triangle takes the colour that most of its edge-neighbours share
 * (each lone off-colour triangle is an extra tool change on its layer).
 */
export function smoothLabels(labels, tris, weld, passes = SMOOTH_PASSES) {
  const n = labels.length;
  const edgeOwner = new Map();
  const nbr = Array.from({ length: n }, () => []);
  for (let t = 0; t < n; t++) {
    for (let e = 0; e < 3; e++) {
      const a = weld[tris[t * 3 + e]], b = weld[tris[t * 3 + ((e + 1) % 3)]];
      const key = a < b ? a * 4294967296 + b : b * 4294967296 + a;
      const other = edgeOwner.get(key);
      if (other === undefined) edgeOwner.set(key, t);
      else { nbr[t].push(other); nbr[other].push(t); }
    }
  }
  let cur = labels;
  for (let p = 0; p < passes; p++) {
    const next = cur.slice();
    for (let t = 0; t < n; t++) {
      const ns = nbr[t];
      if (ns.length < 2) continue;
      const counts = new Map();
      for (const o of ns) counts.set(cur[o], (counts.get(cur[o]) || 0) + 1);
      for (const [lab, c] of counts) if (lab !== cur[t] && c >= 2 && c > (counts.get(cur[t]) || 0)) next[t] = lab;
    }
    cur = next;
  }
  return cur;
}

/**
 * Export a three.js scene/object to a binary 3MF — the standard slicer format
 * (Bambu Studio, PrusaSlicer, Cura). three.js ships no 3MF exporter, so we build the OPC zip
 * package ourselves. The texture is reduced to at most MAX_PRINT_COLORS colours (one per AMS
 * spool) carried per triangle through the 3MF Materials extension (m:colorgroup).
 * Coordinates are millimetres (callers run prepareForPrint first so the size is real).
 *
 * @param {THREE.Object3D} root a scene or mesh container
 * @returns {{ data: Uint8Array, type: string, colors: string[] }} bytes, mime, and the palette
 *   (colour index i = filament slot i+1 in the slicer)
 */
export function export3mf(root, maxColors = MAX_PRINT_COLORS) {
  root.updateMatrixWorld(true);
  const verts = [];
  const tris = [];
  const triRgb = [];
  const v = new THREE.Vector3();
  let offset = 0;

  root.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position) return;
    const pos = o.geometry.attributes.position;
    const rgb = vertexColorsSrgb(o);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      verts.push(v.x, v.y, v.z);
    }
    const idx = o.geometry.index?.array;
    const count = idx ? idx.length : pos.count;
    for (let i = 0; i < count; i += 3) {
      const a = idx ? idx[i] : i, b = idx ? idx[i + 1] : i + 1, c = idx ? idx[i + 2] : i + 2;
      tris.push(offset + a, offset + b, offset + c);
      for (let ch = 0; ch < 3; ch++) triRgb.push((rgb[a * 3 + ch] + rgb[b * 3 + ch] + rgb[c * 3 + ch]) / 3);
    }
    offset += pos.count;
  });

  const nTri = tris.length / 3;
  const palette = fitPalette(triRgb, nTri, maxColors);
  let labels = new Array(nTri);
  for (let t = 0; t < nTri; t++) labels[t] = nearest(triRgb, t, palette);
  // weld by position so speckle smoothing also works across UV seams (split vertices)
  const weld = new Array(verts.length / 3);
  const seen = new Map();
  for (let i = 0; i < weld.length; i++) {
    const key = `${verts[i * 3].toFixed(4)},${verts[i * 3 + 1].toFixed(4)},${verts[i * 3 + 2].toFixed(4)}`;
    if (!seen.has(key)) seen.set(key, i);
    weld[i] = seen.get(key);
  }
  if (palette.length > 1) labels = smoothLabels(labels, tris, weld);

  const vertexLines = [];
  for (let i = 0; i < verts.length; i += 3) {
    vertexLines.push(`<vertex x="${verts[i].toFixed(5)}" y="${verts[i + 1].toFixed(5)}" z="${verts[i + 2].toFixed(5)}"/>`);
  }
  const triangleLines = [];
  for (let t = 0; t < nTri; t++) {
    triangleLines.push(`<triangle v1="${tris[t * 3]}" v2="${tris[t * 3 + 1]}" v3="${tris[t * 3 + 2]}" pid="2" p1="${labels[t]}"/>`);
  }

  const modelXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" ' +
    'xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">\n' +
    '<resources><m:colorgroup id="2">' +
    palette.map((c) => `<m:color color="#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}"/>`).join("") +
    '</m:colorgroup><object id="1" type="model" pid="2" pindex="0"><mesh><vertices>' +
    vertexLines.join("") +
    "</vertices><triangles>" +
    triangleLines.join("") +
    "</triangles></mesh></object></resources>\n" +
    '<build><item objectid="1"/></build>\n</model>\n';

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';
  const rels =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Target="/3D/3dmodel.model" Id="rel0" ' +
    'Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';

  const zipped = zipSync({
    "[Content_Types].xml": strToU8(contentTypes),
    "_rels/.rels": strToU8(rels),
    "3D/3dmodel.model": strToU8(modelXml),
  });
  const colors = palette.map((c) => `#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`);
  return { data: zipped, type: "model/3mf", colors };
}
