import * as THREE from 'three';
import { export3mf } from './src/lib/export3mf.js';
import { unzipSync, strFromU8 } from 'three/examples/jsm/libs/fflate.module.js';
import fs from 'fs';

const scene = new THREE.Scene();
const mesh = new THREE.Mesh(new THREE.BoxGeometry(10,20,30), new THREE.MeshStandardMaterial());
scene.add(mesh);
const { data } = export3mf(scene);
fs.writeFileSync('/tmp/test.3mf', Buffer.from(data));
const files = unzipSync(data);
console.log('ENTRIES:', Object.keys(files));
const model = strFromU8(files['3D/3dmodel.model']);
console.log('MODEL LEN:', model.length);
console.log(model.slice(0, 700));
console.log('...verts:', (model.match(/<vertex /g)||[]).length, 'tris:', (model.match(/<triangle /g)||[]).length);
