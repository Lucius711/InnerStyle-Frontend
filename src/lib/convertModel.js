// Client-side model conversion: turn an uploaded OBJ / FBX / STL file into a GLB (glTF-binary)
// so it can be previewed AND edited in the Lab (the viewer/editor use GLTFLoader + GLTFExporter,
// which only handle glb/gltf). Parsing + export run entirely in the browser via three.js.
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const CONVERTIBLE = /\.(obj|stl|fbx)$/i;
const TEXTURE_EXT = /\.(png|jpe?g|webp|bmp|tga)$/i;

/** File extension (lowercase, no dot). */
function ext(name) {
  return (String(name || "").match(/\.(\w+)$/)?.[1] || "").toLowerCase();
}

/** Just the filename without directory path (handles both / and \). */
function basename(name) {
  return String(name || "").split(/[/\\]/).pop();
}

/** True when the file is a mesh format the editor can't open directly but we can convert to GLB. */
export function needsGlbConversion(file) {
  return CONVERTIBLE.test(file?.name || "");
}

/** Ensure every mesh has normals so the converted model is lit correctly. */
function ensureNormals(object3d) {
  object3d.traverse((o) => {
    if (o.isMesh && o.geometry && !o.geometry.attributes.normal) {
      o.geometry.computeVertexNormals();
    }
  });
}

/**
 * Build a filename→blobUrl map for all texture/image companions.
 * Returns a cleanup function that revokes all blob URLs.
 */
function buildTextureMap(companions) {
  const map = {};
  for (const f of companions) {
    if (TEXTURE_EXT.test(f.name)) {
      map[basename(f.name).toLowerCase()] = URL.createObjectURL(f);
    }
  }
  const cleanup = () => Object.values(map).forEach((u) => URL.revokeObjectURL(u));
  return { map, cleanup };
}

/**
 * Patch an MTL file's texture paths to point at blob: URLs from our map.
 * Replaces relative paths (map_Kd, map_bump, etc.) with the matching blob URL.
 */
function patchMtl(mtlText, textureMap) {
  return mtlText.replace(
    /^(\s*(?:map_Kd|map_Ka|map_Ks|map_Ns|map_d|map_bump|bump|disp|decal|refl)\s+)(.+)$/gim,
    (_, prefix, value) => {
      const key = basename(value.trim()).toLowerCase();
      return textureMap[key] ? prefix + textureMap[key] : prefix + value;
    }
  );
}

/**
 * Parse an OBJ file together with its MTL + texture companions into a three.js Group.
 * companions: array of File objects (MTL, images, etc.) from the same folder.
 */
async function parseObjWithCompanions(objFile, companions) {
  // Find MTL file among companions.
  const mtlFile = companions.find((f) => /\.mtl$/i.test(f.name));
  if (!mtlFile) {
    // No MTL — plain OBJ parse (no color).
    return new OBJLoader().parse(await objFile.text());
  }

  const { map: textureMap, cleanup } = buildTextureMap(companions);
  try {
    const mtlText = await mtlFile.text();
    const patchedMtl = patchMtl(mtlText, textureMap);

    const mtlLoader = new MTLLoader();
    mtlLoader.setMaterialOptions({ side: THREE.DoubleSide });
    // MTLLoader.parse() returns a MaterialCreator — we give it an empty base path
    // because texture paths are already blob: URLs.
    const materials = mtlLoader.parse(patchedMtl, "");
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    return objLoader.parse(await objFile.text());
  } finally {
    cleanup();
  }
}

/**
 * Export a three.js Object3D to a GLB File with embedded textures.
 */
async function exportToGlb(object3d, name) {
  ensureNormals(object3d);
  const glb = await new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      object3d,
      (result) => resolve(result),
      (err) => reject(err instanceof Error ? err : new Error("glb export failed")),
      { binary: true, onlyVisible: false, embedImages: true }
    );
  });
  const blob = new Blob([glb], { type: "model/gltf-binary" });
  return new File([blob], name, { type: "model/gltf-binary" });
}

/**
 * Convert an OBJ/FBX/STL File into a GLB File (same base name, .glb extension).
 * companions: optional array of companion files (MTL, textures) for OBJ color support.
 * If the file is already glb/gltf it is returned unchanged.
 */
export async function convertToGlb(file, companions = []) {
  if (!needsGlbConversion(file)) return file;

  const format = ext(file.name);
  const glbName = file.name.replace(/\.\w+$/, ".glb");

  if (format === "obj") {
    const object3d = await parseObjWithCompanions(file, companions);
    return exportToGlb(object3d, glbName);
  }

  if (format === "stl") {
    const geometry = new STLLoader().parse(await file.arrayBuffer());
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: "#c4c8d2", roughness: 0.85, metalness: 0.0 })
    );
    const group = new THREE.Group();
    group.add(mesh);
    return exportToGlb(group, glbName);
  }

  if (format === "fbx") {
    const object3d = new FBXLoader().parse(await file.arrayBuffer(), "");
    return exportToGlb(object3d, glbName);
  }

  throw new Error(`Unsupported format for conversion: ${format}`);
}

/**
 * Given a list of files (e.g. from a folder drop or multi-select), find the main
 * 3D model file and return { modelFile, companions }.
 * companions = all non-model files (MTL, textures) that the model might reference.
 */
export function splitModelFiles(files) {
  const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl)$/i;
  const modelFile = files.find((f) => MODEL_EXT.test(f.name)) || null;
  const companions = files.filter((f) => f !== modelFile);
  return { modelFile, companions };
}
