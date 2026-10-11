import * as THREE from "three";

/**
 * Split ONE humanoid mesh (what Meshy returns) into parts: head / torso / arms / legs.
 *
 * - Rigged mesh (after "Rig"): each vertex goes to the part of its strongest bone — accurate.
 * - Unrigged mesh: shape heuristic (neck = narrowest slice in the upper body, crotch = lowest
 *   slice that fills the centre line, arms = anything wider than the torso between them).
 *   ponytail: heuristic assumes y-up, facing ±z, A/T-pose; odd poses mis-split → rig first.
 *
 * Returns [{ key, mesh }] (one new Mesh per part, own compacted geometry), or null if the
 * model doesn't split into at least 2 parts. The source mesh is not modified.
 */
export const PART_KEYS = ["head", "torso", "armL", "armR", "legL", "legR"];

const SLICES = 48;

function partFromBone(name) {
  const n = name.toLowerCase();
  const side = /left|(^|[_.:\s])l($|[_.\s])/.test(n) ? "L" : /right|(^|[_.:\s])r($|[_.\s])/.test(n) ? "R" : "";
  if (/head|neck|jaw|eye|hair/.test(n)) return "head";
  if (/arm|hand|shoulder|clavicle|elbow|wrist|finger|thumb|index|middle|ring|pinky/.test(n)) return side ? `arm${side}` : "torso";
  if (/leg|thigh|knee|calf|shin|foot|toe|ankle/.test(n)) return side ? `leg${side}` : "torso";
  return "torso";
}

/** Per-vertex part keys from skin weights, or null if the mesh isn't skinned. */
function labelsFromBones(mesh) {
  const idx = mesh.geometry.attributes.skinIndex;
  const w = mesh.geometry.attributes.skinWeight;
  if (!mesh.isSkinnedMesh || !idx || !w || !mesh.skeleton) return null;
  const boneParts = mesh.skeleton.bones.map((b) => partFromBone(b.name));
  const labels = new Array(idx.count);
  for (let v = 0; v < idx.count; v++) {
    let best = 0;
    for (let k = 1; k < 4; k++) if (w.getComponent(v, k) > w.getComponent(v, best)) best = k;
    labels[v] = boneParts[idx.getComponent(v, best)] || "torso";
  }
  return labels;
}

/** Per-vertex part keys from the silhouette (unrigged fallback). */
export function labelsFromShape(pos) {
  const n = pos.count;
  const box = new THREE.Box3().setFromBufferAttribute(pos);
  const H = box.max.y - box.min.y || 1;
  const W = box.max.x - box.min.x || 1;
  const cx = (box.min.x + box.max.x) / 2;
  const gap = W * 0.04; // max hole still counted as solid surface (armpit/crotch gaps are wider)

  const slice = (y) => Math.min(SLICES - 1, Math.floor(((y - box.min.y) / H) * SLICES));
  const xs = Array.from({ length: SLICES }, () => []);
  for (let v = 0; v < n; v++) xs[slice(pos.getY(v))].push(pos.getX(v));
  xs.forEach((a) => a.sort((p, q) => p - q));

  // Half-width of the solid interval around the centre line (0 if the centre is empty).
  const centreHalf = (a) => {
    if (!a.length) return 0;
    let i = a.findIndex((x) => x >= cx);
    if (i < 0) i = a.length - 1;
    if (Math.abs(a[i] - cx) > gap && (i === 0 || Math.abs(a[i - 1] - cx) > gap)) return 0;
    let lo = i;
    let hi = i;
    while (lo > 0 && a[lo] - a[lo - 1] <= gap) lo--;
    while (hi < a.length - 1 && a[hi + 1] - a[hi] <= gap) hi++;
    return Math.max(cx - a[lo], a[hi] - cx, gap);
  };
  const width = (a) => (a.length ? a[a.length - 1] - a[0] : Infinity);

  // Neck: narrowest slice in 45–92 % of the height.
  let neck = SLICES - 1;
  for (let s = Math.floor(SLICES * 0.45); s <= Math.floor(SLICES * 0.92); s++) {
    if (width(xs[s]) < width(xs[neck]) || neck === SLICES - 1) neck = s;
  }
  // Crotch: lowest slice (bottom 55 %) whose centre line is filled → legs below it.
  let crotch = 0;
  for (let s = 0; s < Math.floor(SLICES * 0.55); s++) {
    if (centreHalf(xs[s]) > 0) {
      crotch = s;
      break;
    }
  }
  // Torso half-width: median centre-interval over the trunk slices (ignores T-pose arm rows).
  const halves = [];
  for (let s = crotch; s < neck; s++) {
    const h = centreHalf(xs[s]);
    if (h > 0) halves.push(h);
  }
  halves.sort((p, q) => p - q);
  const torsoHalf = (halves[Math.floor(halves.length / 2)] || W / 2) * 1.08;

  const labels = new Array(n);
  for (let v = 0; v < n; v++) {
    const s = slice(pos.getY(v));
    const dx = pos.getX(v) - cx;
    const side = dx < 0 ? "R" : "L"; // model faces +z → its right hand is on -x
    if (s > neck) labels[v] = "head";
    else if (s < crotch) labels[v] = `leg${side}`;
    else if (Math.abs(dx) > torsoHalf) labels[v] = `arm${side}`;
    else labels[v] = "torso";
  }
  return labels;
}

/** Build a compacted geometry holding only triangles `tris` (vertex indices, flat). */
function subGeometry(src, tris) {
  const remap = new Map();
  const index = new Uint32Array(tris.length);
  for (let i = 0; i < tris.length; i++) {
    let j = remap.get(tris[i]);
    if (j === undefined) {
      j = remap.size;
      remap.set(tris[i], j);
    }
    index[i] = j;
  }
  const g = new THREE.BufferGeometry();
  const olds = [...remap.keys()];
  for (const [name, attr] of Object.entries(src.attributes)) {
    const size = attr.itemSize;
    const out = new attr.array.constructor(olds.length * size);
    olds.forEach((o, k) => {
      for (let c = 0; c < size; c++) out[k * size + c] = attr.getComponent(o, c);
    });
    g.setAttribute(name, new THREE.BufferAttribute(out, size, attr.normalized));
  }
  g.setIndex(new THREE.BufferAttribute(index, 1));
  return g;
}

export function splitHumanoid(mesh, material = mesh.material) {
  const geo = mesh.geometry;
  const labels = labelsFromBones(mesh) || labelsFromShape(geo.attributes.position);
  const idx = geo.index ? geo.index.array : Array.from({ length: geo.attributes.position.count }, (_, i) => i);

  const byPart = {};
  for (let t = 0; t < idx.length; t += 3) {
    const a = labels[idx[t]];
    const b = labels[idx[t + 1]];
    const key = a === b || a === labels[idx[t + 2]] ? a : b === labels[idx[t + 2]] ? b : a; // majority vote
    (byPart[key] ||= []).push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const keys = PART_KEYS.filter((k) => byPart[k]);
  if (keys.length < 2) return null;

  const baseMat = Array.isArray(material) ? material[0] : material;
  return keys.map((key) => {
    const g = subGeometry(geo, byPart[key]);
    const mat = baseMat.clone();
    const part = mesh.isSkinnedMesh ? new THREE.SkinnedMesh(g, mat) : new THREE.Mesh(g, mat);
    if (mesh.isSkinnedMesh) part.bind(mesh.skeleton, mesh.bindMatrix);
    part.name = key;
    part.position.copy(mesh.position);
    part.quaternion.copy(mesh.quaternion);
    part.scale.copy(mesh.scale);
    return { key, mesh: part };
  });
}
