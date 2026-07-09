import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

// A "figure" tall along Y (height 40), thin in X/Z, standing with bottom at Y=0.
const scene = new THREE.Scene();
const mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 40, 8), new THREE.MeshStandardMaterial());
mesh.position.y = 20; // bottom at Y=0
scene.add(mesh);

function extents(scene) {
  const stl = new STLExporter().parse(scene, { binary: true });
  const buf = stl.buffer ? Buffer.from(stl.buffer) : Buffer.from(stl);
  const n = buf.readUInt32LE(80);
  let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
  let off=84;
  for(let i=0;i<n;i++){
    off+=12; // skip normal
    for(let v=0;v<3;v++){
      for(let a=0;a<3;a++){const val=buf.readFloatLE(off); off+=4; mn[a]=Math.min(mn[a],val); mx[a]=Math.max(mx[a],val);}
    }
    off+=2;
  }
  return [mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]].map(x=>+x.toFixed(1));
}

console.log('BEFORE (Y-up) size XYZ:', extents(scene), '-> tallest axis: Y');
scene.rotation.x += Math.PI/2;
scene.updateMatrixWorld(true);
console.log('AFTER  (Z-up) size XYZ:', extents(scene), '-> tallest axis should be Z');
