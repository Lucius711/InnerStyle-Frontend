// Client-side model conversion: turn an uploaded OBJ / FBX / STL file into a GLB (glTF-binary)
// so it can be previewed AND edited in the Lab (the viewer/editor use GLTFLoader + GLTFExporter,
// which only handle glb/gltf). Parsing + export run entirely in the browser via three.js.
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const CONVERTIBLE = /\.(obj|stl|fbx)$/i;

/** File extension (lowercase, no dot). */
function ext(name) {
  return (String(name || "").match(/\.(\w+)$/)?.[1] || "").toLowerCase();
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

/** Parse the uploaded file into a three.js Object3D using the loader for its format. */
async function parseToObject(file) {
  const format = ext(file.name);
  if (format === "obj") {
    return new OBJLoader().parse(await file.text());
  }
  if (format === "stl") {
    const geometry = new STLLoader().parse(await file.arrayBuffer());
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: "#c4c8d2", roughness: 0.85, metalness: 0.0 })
    );
    const group = new THREE.Group();
    group.add(mesh);
    return group;
  }
  if (format === "fbx") {
    return new FBXLoader().parse(await file.arrayBuffer(), "");
  }
  throw new Error(`Unsupported format for conversion: ${format}`);
}

/**
 * Convert an OBJ/FBX/STL File into a GLB File (same base name, .glb extension). If the file is
 * already glb/gltf it is returned unchanged. Throws if parsing/export fails so callers can fall
 * back to uploading the original.
 */
export async function convertToGlb(file) {
  if (!needsGlbConversion(file)) return file;

  const object3d = await parseToObject(file);
  ensureNormals(object3d);

  const glb = await new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      object3d,
      (result) => resolve(result), // ArrayBuffer, because binary: true
      (err) => reject(err instanceof Error ? err : new Error("glb export failed")),
      { binary: true, onlyVisible: false }
    );
  });

  const blob = new Blob([glb], { type: "model/gltf-binary" });
  const name = file.name.replace(/\.\w+$/, ".glb");
  return new File([blob], name, { type: "model/gltf-binary" });
}
