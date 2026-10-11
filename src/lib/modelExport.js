// Shared download pipeline: GLB (+ the textures/ the server ships beside it) -> any format, keeping colour.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { strToU8 } from "three/examples/jsm/libs/fflate.module.js";
import { export3mf } from "@/lib/export3mf";
import { bakeVertexColors } from "@/lib/meshColors";

export function toU8(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === "string") return strToU8(data);
  return new Uint8Array(data);
}

/** Formats slicers read as millimetres, Z-up. */
const PRINT_FORMATS = new Set(["stl", "3mf", "obj", "ply"]);
/** Height a normalised model gets in print formats when it has no real-world size. */
export const DEFAULT_PRINT_HEIGHT_MM = 100;

/**
 * Make `root` slicer-ready: stand it up (three/glTF is Y-up, slicers are Z-up) and, when it is
 * still in Meshy's normalised units (~1-2 units tall), scale it to DEFAULT_PRINT_HEIGHT_MM --
 * otherwise a slicer imports a ~2 mm figure ("object too small"). Returns an undo function.
 */
export function prepareForPrint(root) {
  const prevRotX = root.rotation.x;
  const prevScale = root.scale.clone();
  root.rotation.x += Math.PI / 2;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const height = box.max.z - box.min.z;
  if (height > 0 && height < 10) {
    root.scale.multiplyScalar(DEFAULT_PRINT_HEIGHT_MM / height); // < 10 units: not millimetres yet
    root.updateMatrixWorld(true);
  }
  return () => {
    root.rotation.x = prevRotX;
    root.scale.copy(prevScale);
    root.updateMatrixWorld(true);
  };
}

const findTex = (texFiles, name) => Object.keys(texFiles).find((k) => new RegExp(`(^|/)${name}\\.\\w+$`).test(k));

/** Classic + PBR .mtl binding the exported maps (mirrors the server OBJ export). */
export function buildMtl(matName, texFiles) {
  const base = findTex(texFiles, "base_color");
  const metal = findTex(texFiles, "metallic");
  const norm = findTex(texFiles, "normal");
  const rough = findTex(texFiles, "roughness");
  let s = "# InnerStyle export\n";
  s += `newmtl ${matName}\n`;
  s += "Ka 1.000 1.000 1.000\nKd 1.000 1.000 1.000\nKs 0.000 0.000 0.000\n";
  if (base) s += `map_Kd ${base}\n`;
  if (norm) s += `map_Bump ${norm}\nbump ${norm}\n`;
  if (metal) s += `map_Pm ${metal}\n`;
  if (rough) s += `map_Pr ${rough}\n`;
  return s;
}

/** Drop stale mtllib/usemtl and bind a single material (mirrors the server's OBJ export). */
export function bindMtlToObj(objText, mtlFile, matName) {
  const obj = objText.replace(/^\s*mtllib.*\r?\n?/gm, "").replace(/^\s*usemtl.*\r?\n?/gm, "");
  const idx = obj.search(/^f\s/m);
  const usemtl = `usemtl ${matName}\n`;
  const body = idx >= 0 ? obj.slice(0, idx) + usemtl + obj.slice(idx) : usemtl + obj;
  return `mtllib ${mtlFile}\n` + body;
}

/**
 * Meshy GLBs often only *link* their colour map by a CDN URL that has since expired, so the loaded
 * model is white. Give every textureless mesh the base_color map shipped beside it.
 * @returns {Promise<boolean>} whether any material was patched
 */
async function applyBaseColor(scene, texFiles) {
  const key = findTex(texFiles, "base_color");
  if (!key) return false;
  const missing = [];
  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.uv) return;
    for (const m of [].concat(o.material)) if (m && !m.map?.image) missing.push(m);
  });
  if (!missing.length) return false;
  const tex = new THREE.Texture(await createImageBitmap(new Blob([texFiles[key]])));
  tex.flipY = false; // glTF UV convention
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  for (const m of missing) {
    m.map = tex;
    m.color?.set(0xffffff);
    m.needsUpdate = true;
  }
  return true;
}

/**
 * Build the ZIP entries for a download: the model in `fmt` with its colour preserved, plus the
 * texture maps. GLB comes back with the texture embedded; OBJ gets a bound .mtl; 3MF gets
 * per-triangle colours; PLY gets vertex colours. STL cannot carry colour (format limit).
 * @param {Uint8Array|ArrayBuffer} glbBytes source GLB
 * @param {Record<string, Uint8Array>} texFiles e.g. { "textures/base_color.png": bytes }
 * @param {string} fmt glb | obj | stl | 3mf | usdz | ply
 */
export async function buildModelFiles(glbBytes, texFiles, fmt) {
  const src = toU8(glbBytes);
  const gltf = await new GLTFLoader().parseAsync(src.slice().buffer, "");
  const scene = gltf.scene || gltf.scenes?.[0];
  scene.updateMatrixWorld(true);
  const patched = await applyBaseColor(scene, texFiles);
  const files = { ...texFiles };
  if (PRINT_FORMATS.has(fmt)) prepareForPrint(scene); // throwaway scene: no need to undo

  if (fmt === "glb") {
    files["model.glb"] = patched
      ? toU8(await new GLTFExporter().parseAsync(scene, { binary: true, embedImages: true, animations: gltf.animations }))
      : src;
  } else if (fmt === "obj") {
    const objText = new OBJExporter().parse(scene);
    if (findTex(texFiles, "base_color")) {
      files["model.obj"] = strToU8(bindMtlToObj(objText, "model.mtl", "innerstyle"));
      files["model.mtl"] = strToU8(buildMtl("innerstyle", texFiles));
    } else {
      files["model.obj"] = strToU8(objText);
    }
  } else if (fmt === "stl") {
    files["model.stl"] = toU8(new STLExporter().parse(scene, { binary: true }));
  } else if (fmt === "3mf") {
    files["model.3mf"] = export3mf(scene).data;
  } else if (fmt === "usdz") {
    files["model.usdz"] = toU8(await new USDZExporter().parseAsync(scene));
  } else if (fmt === "ply") {
    bakeVertexColors(scene);
    files["model.ply"] = toU8(await new Promise((res) => new PLYExporter().parse(scene, res, { binary: true })));
  } else {
    throw new Error("unsupported format");
  }
  return files;
}
