import * as THREE from 'three';
import { export3mf } from './src/lib/export3mf.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { unzipSync, strFromU8 } from 'three/examples/jsm/libs/fflate.module.js';

const scene = new THREE.Scene();
scene.add(new THREE.Mesh(new THREE.BoxGeometry(10,20,30), new THREE.MeshStandardMaterial()));

const files = unzipSync(export3mf(scene).data);
console.log('=== [Content_Types].xml ===');
console.log(strFromU8(files['[Content_Types].xml']));
console.log('\n=== _rels/.rels ===');
console.log(strFromU8(files['_rels/.rels']));

// STL
const stl = new STLExporter().parse(scene, { binary: true });
const buf = stl.buffer ? Buffer.from(stl.buffer) : Buffer.from(stl);
const triCount = buf.readUInt32LE(80);
console.log('\n=== STL binary ===');
console.log('bytes:', buf.length, 'header triangles:', triCount, 'expected bytes:', 84 + triCount*50);
