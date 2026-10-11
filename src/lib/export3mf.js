import * as THREE from "three";
import { zipSync, strToU8 } from "three/examples/jsm/libs/fflate.module.js";
import { vertexColorsSrgb } from "@/lib/meshColors";

// 16 levels per channel: keeps the colour group small (<= 4096) so slicers can map it to filaments.
const quant = (c) => Math.min(255, Math.round(c / 17) * 17);
const hex2 = (c) => c.toString(16).padStart(2, "0").toUpperCase();

/**
 * Export a three.js scene/object to a binary 3MF — the standard slicer format
 * (Bambu Studio, PrusaSlicer, Cura). three.js ships no 3MF exporter, so we build
 * the OPC zip package ourselves. Each triangle carries its texture colour through the 3MF
 * Materials extension (m:colorgroup), so multi-colour slicers can map it to filaments,
 * with coordinates kept raw and tagged as millimetres to match the STL/OBJ size.
 *
 * @param {THREE.Object3D} root a scene or mesh container
 * @returns {{ data: Uint8Array, type: string }} bytes + mime for download
 */
export function export3mf(root) {
  root.updateMatrixWorld(true);
  const vertexLines = [];
  const triangleLines = [];
  const colorIndex = new Map(); // "#RRGGBB" -> index in the colour group
  const colorOf = (rgb, a, b, c) => {
    const ch = (k) => quant(Math.round((rgb[a * 3 + k] + rgb[b * 3 + k] + rgb[c * 3 + k]) / 3));
    const key = `#${hex2(ch(0))}${hex2(ch(1))}${hex2(ch(2))}`;
    if (!colorIndex.has(key)) colorIndex.set(key, colorIndex.size);
    return colorIndex.get(key);
  };
  const v = new THREE.Vector3();
  let offset = 0;

  root.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position) return;
    const pos = o.geometry.attributes.position;
    const rgb = vertexColorsSrgb(o);
    const tri = (a, b, c) =>
      triangleLines.push(`<triangle v1="${offset + a}" v2="${offset + b}" v3="${offset + c}" pid="2" p1="${colorOf(rgb, a, b, c)}"/>`);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      vertexLines.push(`<vertex x="${v.x.toFixed(5)}" y="${v.y.toFixed(5)}" z="${v.z.toFixed(5)}"/>`);
    }
    const idx = o.geometry.index?.array;
    if (idx) {
      for (let i = 0; i < idx.length; i += 3) tri(idx[i], idx[i + 1], idx[i + 2]);
    } else {
      for (let i = 0; i < pos.count; i += 3) tri(i, i + 1, i + 2);
    }
    offset += pos.count;
  });

  const modelXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" ' +
    'xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">\n' +
    '<resources><m:colorgroup id="2">' +
    [...colorIndex.keys()].map((c) => `<m:color color="${c}"/>`).join("") +
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
  return { data: zipped, type: "model/3mf" };
}
