// Self-check: a box "stick figure" must split into all 6 parts. Run: node scripts/check-split-humanoid.mjs
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { splitHumanoid } from "../src/lib/splitHumanoid.js";

const box = (w, h, d, x, y) => new THREE.BoxGeometry(w, h, d, 24, 24, 24).translate(x, y, 0);
const figure = mergeGeometries([
  box(0.6, 0.6, 0.6, 0, 1.9),   // head
  box(0.2, 0.1, 0.2, 0, 1.55),  // neck
  box(0.8, 1.0, 0.4, 0, 1.0),   // torso
  box(0.2, 0.9, 0.2, -0.6, 1.0), // arm (-x = right)
  box(0.2, 0.9, 0.2, 0.6, 1.0),  // arm (+x = left)
  box(0.25, 0.5, 0.25, -0.2, 0.25), // leg
  box(0.25, 0.5, 0.25, 0.2, 0.25),  // leg
].map((g) => g.toNonIndexed()));

const parts = splitHumanoid(new THREE.Mesh(figure, new THREE.MeshStandardMaterial()));
const keys = parts?.map((p) => p.key).sort().join(",");
console.assert(keys === "armL,armR,head,legL,legR,torso", "unexpected parts: " + keys);
const tris = parts.reduce((n, p) => n + p.mesh.geometry.index.count / 3, 0);
console.assert(tris === figure.attributes.position.count / 3, "triangles lost");
console.log(keys === "armL,armR,head,legL,legR,torso" ? "splitHumanoid OK: " + keys : "FAIL");
