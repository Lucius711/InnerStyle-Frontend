import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * The landing "film": one WebGL stage whose state is a pure function of story progress p.
 * Story timeline (p runs 0 → END_P):
 *   0.00 camera roll · 0.12 photo becomes points · 0.21 points fly to depth · 0.31 wire + skin scan
 *   0.46 melt + layer-by-layer print · 0.67 shelf · 0.84 gallery of sample models · 1.30 pull-back
 * Kept as plain three.js (no r3f) because every object is driven per frame by the scroll position.
 */
export const END_P = 1.4;

const FOOT = -0.95;
const HEAD = 0.95;
const SPAN = HEAD - FOOT + 0.13;
const CUT0 = FOOT - 0.08;
const R_BASE = 0.9;
const PX = 150; // photo pixels per scene unit
const PHOTO_Y = -0.05;
const SPACING = 2.8; // gallery plinth spacing
const GALLERY_H = 1.55; // gallery models are normalised to this height

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// camera shot list for the single-subject part: [p, radius, azimuth, height, lookAt y]
const KF = [
  [0.0, 24, 0, 0.7, 0],
  [0.105, 4.7, 0, 0.05, 0],
  [0.17, 4.7, 0, 0.05, 0],
  [0.27, 4.3, 1.3, 0.45, 0],
  [0.31, 4.3, 1.4, 0.5, 0],
  [0.45, 4.8, 3.7, 1.0, 0],
  [0.5, 5.9, 4.3, 1.8, -0.15],
  [0.58, 3.5, 4.9, 0.6, 0.0],
  [0.65, 3.9, 5.4, 0.5, 0.15],
  [0.73, 4.9, 5.95, 0.35, -0.05],
  [0.82, 4.8, 6.4, 0.35, -0.05],
];
function shot(p) {
  let i = 0;
  while (i < KF.length - 2 && p > KF[i + 1][0]) i++;
  const a = KF[i];
  const b = KF[i + 1];
  const t = smooth(a[0], b[0], p);
  return [1, 2, 3, 4].map((k) => lerp(a[k], b[k], t));
}

/** Which gallery stand (0 = the hero, 1..n = samples) the camera is on, eased so it lingers on each. */
export function galleryFocus(p, count) {
  const f = clamp((p - 0.88) / 0.38) * count;
  const i = Math.min(count, Math.floor(f));
  return i + (i < count ? smooth(0.3, 0.7, f - i) : 0);
}

function photoCard(seed) {
  const c = document.createElement("canvas");
  c.width = 200;
  c.height = 250;
  const g = c.getContext("2d");
  const rnd = (n) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * n;
  };
  g.fillStyle = "#e9e6f1";
  g.fillRect(0, 0, 200, 250);
  const h = rnd(360);
  const sky = g.createLinearGradient(0, 10, 0, 190);
  sky.addColorStop(0, `hsl(${h} 45% 62%)`);
  sky.addColorStop(1, `hsl(${(h + 40) % 360} 55% 78%)`);
  g.fillStyle = sky;
  g.fillRect(10, 10, 180, 180);
  g.fillStyle = `hsl(${(h + 30) % 360} 80% 88%)`;
  g.beginPath();
  g.arc(30 + rnd(140), 40 + rnd(60), 10 + rnd(18), 0, 7);
  g.fill();
  g.fillStyle = `hsl(${(h + 180) % 360} 25% ${28 + rnd(20)}%)`;
  g.beginPath();
  g.moveTo(10, 190);
  for (let x = 10; x <= 190; x += 20) g.lineTo(x, 120 + rnd(50));
  g.lineTo(190, 190);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });
}

function firstMesh(root) {
  let m = null;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o.isMesh && !m) m = o;
  });
  return m;
}

// Meshy/trimesh exports often leave metallicFactor at the glTF default of 1, which renders near-black without an env map.
function matte(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if ("metalness" in m) m.metalness = 0;
      if ("roughness" in m) m.roughness = Math.max(0.55, m.roughness ?? 0.8);
    });
  });
}

/**
 * Build the stage inside `host`. Resolves once the hero photo + model are in; gallery models
 * stream in later via loadGallery(). Returns { draw(p, t, opts), loadGallery(), dispose() }.
 */
export async function createFilmStage({ host, photoUrl, modelUrl, gallery = [], reduce = false }) {
  const loader = new GLTFLoader();
  const [gltf, img] = await Promise.all([loader.loadAsync(modelUrl), loadImage(photoUrl)]);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.localClippingEnabled = true;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0910, 12, 40);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  // three ≥ r155 uses physical light units: ×π keeps the look tuned in the r128 prototype
  const hemi = new THREE.HemisphereLight(0xffffff, 0x3a4156, 0.75 * Math.PI);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.15 * Math.PI);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9d86ff, 0.9 * Math.PI);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // hero mesh baked into scene space (the sample is normalised to 1.9 units tall, centred on 0)
  matte(gltf.scene);
  const src = firstMesh(gltf.scene);
  const geo = src.geometry.clone().applyMatrix4(src.matrixWorld);
  geo.computeBoundingBox();
  const depthUnits = geo.boundingBox.max.z - geo.boundingBox.min.z;
  const photoTex = new THREE.Texture(img);
  photoTex.colorSpace = THREE.SRGBColorSpace;
  photoTex.needsUpdate = true;
  const pc = document.createElement("canvas");
  pc.width = img.width;
  pc.height = img.height;
  const pg = pc.getContext("2d", { willReadFrequently: true });
  pg.drawImage(img, 0, 0);
  const pd = pg.getImageData(0, 0, pc.width, pc.height).data;

  /* 01 camera roll: a tunnel of photo cards */
  const galleryCards = new THREE.Group();
  scene.add(galleryCards);
  const cardGeo = new THREE.PlaneGeometry(0.8, 1.0);
  const cards = [];
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(
      cardGeo,
      new THREE.MeshBasicMaterial({ map: photoCard(i * 7919 + 13), transparent: true, toneMapped: false, side: THREE.DoubleSide })
    );
    const ang = (i * 2.399) % (Math.PI * 2);
    const rad = 1.1 + (((i * 37) % 17) / 17) * 1.9;
    m.position.set(Math.cos(ang) * rad * 1.35, Math.sin(ang) * rad * 0.9, 4.5 + i * 0.33);
    m.rotation.set((((i * 13) % 7) - 3) * 0.05, (((i * 29) % 9) - 4) * 0.07, (((i * 17) % 11) - 5) * 0.04);
    galleryCards.add(m);
    cards.push(m);
  }

  /* the subject: photo → points → wire → skin → print → shelf */
  const hero = new THREE.Group();
  scene.add(hero);
  const pw = img.width / PX;
  const ph = img.height / PX;
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(pw + 0.12, ph + 0.22),
    new THREE.MeshBasicMaterial({ color: 0xe9e6f1, transparent: true, toneMapped: false })
  );
  frame.position.set(0, PHOTO_Y - 0.04, -0.01);
  hero.add(frame);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(pw, ph),
    new THREE.MeshBasicMaterial({ map: photoTex, transparent: true, toneMapped: false })
  );
  plane.position.set(0, PHOTO_Y, 0);
  hero.add(plane);

  // each point starts on a photo pixel and lands on a model vertex, so the photo and model need no alignment
  const tmap = src.material.map;
  const tc = document.createElement("canvas");
  tc.width = tc.height = 512;
  const tg = tc.getContext("2d", { willReadFrequently: true });
  if (tmap?.image) tg.drawImage(tmap.image, 0, 0, 512, 512);
  const td = tg.getImageData(0, 0, 512, 512).data;
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  const K = Math.min(9000, pos.count);
  const real = new Float32Array(K * 3);
  const flat = new Float32Array(K * 3);
  const cur = new Float32Array(K * 3);
  const colA = new Float32Array(K * 3);
  const colB = new Float32Array(K * 3);
  const col = new Float32Array(K * 3);
  const delay = new Float32Array(K);
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < K; i++) {
    const v = Math.floor((i / K) * pos.count);
    const x = pos.getX(v);
    const y = pos.getY(v);
    real.set([x, y, pos.getZ(v)], i * 3);
    const px = Math.floor(rnd() * pc.width);
    const py = Math.floor(rnd() * pc.height);
    const k = (py * pc.width + px) * 4;
    flat.set([(px - pc.width / 2) / PX, PHOTO_Y + (pc.height / 2 - py) / PX, 0.002], i * 3);
    colA.set([pd[k] / 255, pd[k + 1] / 255, pd[k + 2] / 255], i * 3);
    if (uv) {
      const q = (clamp(Math.floor(uv.getY(v) * 512), 0, 511) * 512 + clamp(Math.floor(uv.getX(v) * 512), 0, 511)) * 4; // glTF UVs: top-left origin
      colB.set([td[q] / 255, td[q + 1] / 255, td[q + 2] / 255], i * 3);
    } else colB.set([0.8, 0.8, 0.85], i * 3);
    delay[i] = ((HEAD - y) / (HEAD - FOOT)) * 0.5; // head lifts off first
  }
  cur.set(flat);
  col.set(colA);
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position", new THREE.BufferAttribute(cur, 3));
  pgeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(
    pgeo,
    new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, depthWrite: false, toneMapped: false })
  );
  hero.add(points);

  const wireCut = new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT0); // keeps y <= constant
  const skinCut = new THREE.Plane(new THREE.Vector3(0, -1, 0), CUT0);
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: 0x8b6cff, wireframe: true, transparent: true, opacity: 0, depthWrite: false, clippingPlanes: [wireCut] })
  );
  const skinMat = src.material.clone();
  skinMat.clippingPlanes = [skinCut];
  skinMat.side = THREE.DoubleSide;
  const skin = new THREE.Mesh(geo, skinMat);
  hero.add(skin);
  hero.add(wire);
  const seam = new THREE.Mesh(
    new THREE.RingGeometry(0.02, R_BASE + 0.08, 64),
    new THREE.MeshBasicMaterial({ color: 0x8b6cff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
  );
  seam.rotation.x = -Math.PI / 2;
  hero.add(seam);

  /* 05 the printer */
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(R_BASE, R_BASE + 0.02, 0.06, 64),
    new THREE.MeshStandardMaterial({ color: 0x9ec7d3, roughness: 0.6, clippingPlanes: [skinCut] })
  );
  base.position.y = FOOT - 0.03;
  hero.add(base);
  const rig = new THREE.Group();
  hero.add(rig);
  const steel = new THREE.MeshStandardMaterial({ color: 0x3b3651, roughness: 0.4, metalness: 0.6, transparent: true });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 2.6), steel);
  bed.position.y = FOOT - 0.085;
  rig.add(bed);
  const bedGrid = new THREE.GridHelper(2.6, 26, 0x5a4f80, 0x2f2a44);
  bedGrid.position.y = FOOT - 0.059;
  bedGrid.material.transparent = true;
  rig.add(bedGrid);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 0.05), steel);
    post.position.set(x * 1.28, FOOT + 1.1, z * 1.28);
    rig.add(post);
  });
  const gantry = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.06), steel);
  rig.add(gantry);
  const nozzle = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0xff9a4d, emissive: 0xff7a1a, emissiveIntensity: 0.8 })
  );
  nozzle.rotation.x = Math.PI;
  hero.add(nozzle);

  /* 06 plinth under a spotlight */
  const stone = new THREE.MeshStandardMaterial({ color: 0x24202f, roughness: 0.9 });
  const plinthGeo = new THREE.CylinderGeometry(R_BASE + 0.12, R_BASE + 0.16, 0.5, 64);
  const plinth = new THREE.Mesh(plinthGeo, stone);
  hero.add(plinth);
  const beamGeo = new THREE.ConeGeometry(1.3, 3.2, 48, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xbfb2ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = FOOT + 1.55;
  hero.add(beam);
  const floorTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(139,108,255,.28)");
    r.addColorStop(1, "rgba(139,108,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false, opacity: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FOOT - 0.56;
  scene.add(floor);

  /* 07 gallery: one stand per sample model, to the right of the hero */
  const stands = gallery.map((_, i) => {
    const g = new THREE.Group();
    g.position.x = (i + 1) * SPACING;
    const p = new THREE.Mesh(plinthGeo, stone);
    p.position.y = FOOT - 0.31;
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(R_BASE * 0.8, R_BASE * 0.8 + 0.02, 0.06, 64),
      new THREE.MeshStandardMaterial({ color: 0x9ec7d3, roughness: 0.6 })
    );
    disc.position.y = FOOT - 0.03;
    const b = new THREE.Mesh(beamGeo, beamMat.clone());
    b.position.y = FOOT + 1.55;
    const f = new THREE.Mesh(floor.geometry, floor.material.clone());
    f.rotation.x = -Math.PI / 2;
    f.position.y = FOOT - 0.56;
    g.add(p, disc, b, f);
    scene.add(g);
    return { g, beam: b, floor: f, model: null };
  });
  let galleryRequested = false;
  function loadGallery() {
    if (galleryRequested) return;
    galleryRequested = true;
    gallery.forEach((item, i) => {
      loader
        .loadAsync(item.url)
        .then((g) => {
          const root = g.scene;
          matte(root);
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const s = GALLERY_H / Math.max(size.y, 1e-3);
          root.scale.setScalar(s);
          const c = box.getCenter(new THREE.Vector3());
          root.position.set(-c.x * s, FOOT - box.min.y * s, -c.z * s);
          const holder = new THREE.Group();
          holder.add(root);
          stands[i].g.add(holder);
          stands[i].model = holder;
        })
        .catch(() => {}); // a missing sample just leaves an empty lit stand
    });
  }

  let w = 0;
  let h = 0;
  function resize() {
    const nw = host.clientWidth;
    const nh = host.clientHeight;
    if (!nw || !nh || (nw === w && nh === h)) return;
    w = nw;
    h = nh;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  resize();

  let lastLift = -1;
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();

  function draw(p, t) {
    resize();
    const W = (a, b) => smooth(a, b, p);
    const portrait = w / h < 0.8;
    const m = portrait ? Math.max(1.12, 0.85 / (w / h)) : 1;

    // camera: orbit the subject, then glide along the gallery, then pull back
    const [r0, az, ch, ty0] = shot(p);
    const r = r0 * m;
    const ty = ty0 - (portrait ? 0.55 : 0);
    const orbitPos = tmpPos.set(Math.sin(az) * r, ch, Math.cos(az) * r).clone();
    const orbitLook = new THREE.Vector3(0, ty, 0);
    const focus = galleryFocus(p, gallery.length);
    const gx = focus * SPACING;
    const out = W(1.28, 1.36);
    const galPos = new THREE.Vector3(
      lerp(gx, (gallery.length * SPACING) / 2, out),
      lerp(0.45, 1.8, out),
      lerp(5.0, 7.5 + gallery.length * 1.7, out) * m
    );
    const galLook = tmpLook.set(lerp(gx, (gallery.length * SPACING) / 2, out), lerp(-0.15, -0.3, out) - (portrait ? 0.7 : 0), 0);
    const gBlend = W(0.8, 0.86);
    cam.position.lerpVectors(orbitPos, galPos, gBlend);
    cam.lookAt(orbitLook.lerp(galLook, gBlend));
    // wide screens: push the subject right of the captions column
    if (w > 760) cam.setViewOffset(w, h, -w * 0.15 * (1 - out), 0, w, h);
    else cam.clearViewOffset();

    // 01 camera roll
    const gal = 1 - W(0.085, 0.125);
    galleryCards.visible = gal > 0.01;
    cards.forEach((c, i) => {
      c.material.opacity = gal;
      if (!reduce) c.rotation.z += Math.sin(t / 900 + i) * 0.0004;
    });

    // 02–03 photo lifts into points
    const lift = W(0.12, 0.22);
    const phv = 1 - W(0.13, 0.19);
    plane.material.opacity = phv;
    frame.material.opacity = phv * (1 - W(0.105, 0.14));
    plane.visible = phv > 0.01;
    frame.visible = frame.material.opacity > 0.01;
    if (lift !== lastLift) {
      for (let i = 0; i < K; i++) {
        const k = smooth(0, 1, lift * 1.5 - delay[i]);
        for (let a = 0; a < 3; a++) {
          const j = i * 3 + a;
          cur[j] = flat[j] + (real[j] - flat[j]) * k;
          col[j] = colA[j] + (colB[j] - colA[j]) * k;
        }
      }
      pgeo.attributes.position.needsUpdate = true;
      pgeo.attributes.color.needsUpdate = true;
      lastLift = lift;
    }
    points.material.opacity = W(0.112, 0.13) * (1 - W(0.36, 0.42));
    points.visible = points.material.opacity > 0.01;

    // 04 weave: wire leads, skin follows; 05 skin drains, ghost stays, print rebuilds
    const weave = W(0.3, 0.39);
    const skinUp = W(0.33, 0.44);
    const drain = W(0.46, 0.5);
    const print = W(0.51, 0.64);
    wireCut.constant = p < 0.455 ? CUT0 + SPAN * weave : 9;
    const ghost = W(0.46, 0.49) * (1 - W(0.64, 0.68));
    wire.material.opacity = p < 0.455 ? 0.55 * W(0.295, 0.31) * (1 - 0.85 * skinUp) : 0.17 * ghost;
    wire.visible = wire.material.opacity > 0.01;
    const cut = CUT0 + SPAN * clamp(skinUp - drain + print);
    skinCut.constant = cut;
    skin.visible = cut > CUT0 + 0.005;
    const scanning = (skinUp > 0.002 && skinUp < 0.998 && p < 0.46) || (drain > 0.002 && drain < 0.998);
    const printing = print > 0.002 && print < 0.998;
    seam.visible = scanning || printing;
    seam.position.y = cut;
    seam.material.color.setHex(printing ? 0xff9a4d : 0x8b6cff);
    base.visible = p > 0.5;

    const rigIn = W(0.47, 0.52) * (1 - W(0.655, 0.69));
    rig.visible = rigIn > 0.01;
    rig.scale.set(1, Math.max(0.001, rigIn), 1);
    steel.opacity = rigIn;
    bedGrid.material.opacity = rigIn;
    gantry.position.y = Math.max(cut, FOOT) + 0.2;
    const a = reduce ? 0.6 : t / 230;
    nozzle.visible = printing;
    nozzle.position.set(Math.cos(a) * 0.6, cut + 0.08, Math.sin(a) * 0.5);

    // 06 shelf
    const shelf = W(0.66, 0.71);
    plinth.visible = shelf > 0.01;
    plinth.scale.y = Math.max(0.001, shelf);
    plinth.position.y = FOOT - 0.06 - 0.25 * shelf;
    beamMat.opacity = 0.08 * W(0.68, 0.73);
    floor.material.opacity = Math.max(W(0.3, 0.36) * 0.6, shelf);

    // 07 gallery stands rise one after another as the camera arrives
    stands.forEach((s, i) => {
      const up = W(0.8 + i * 0.03, 0.86 + i * 0.03);
      s.g.visible = up > 0.01;
      s.g.scale.y = Math.max(0.001, up);
      s.beam.material.opacity = 0.08 * up;
      s.floor.material.opacity = up;
      if (s.model && !reduce) s.model.rotation.y = t / 4000 + i;
    });

    renderer.render(scene, cam);
  }

  function dispose() {
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      (Array.isArray(o.material) ? o.material : o.material ? [o.material] : []).forEach((m) => {
        m.map?.dispose?.();
        m.dispose?.();
      });
    });
    photoTex.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  /** Match the site theme: background comes from the page (transparent canvas), the set pieces recolour. */
  function setTheme(dark) {
    scene.fog.color.set(dark ? 0x0a0910 : 0xf4f1fb);
    hemi.groundColor.set(dark ? 0x3a4156 : 0xb9b3cc);
    stone.color.set(dark ? 0x24202f : 0xe3def0);
    steel.color.set(dark ? 0x3b3651 : 0xa59dc2);
    renderer.toneMappingExposure = dark ? 1.25 : 1.1;
    // pale points (white hair, sky) disappear on a light page: thicker and darkened via the colour multiplier
    points.material.size = dark ? 0.02 : 0.03;
    points.material.color.setScalar(dark ? 1 : 0.55);
    wire.material.color.set(dark ? 0x8b6cff : 0x5b3fd6);
    // additive light shafts vanish on a pale page, so draw them as a faint violet veil instead
    [beamMat, ...stands.map((s) => s.beam.material)].forEach((m) => {
      m.color.set(dark ? 0xbfb2ff : 0x8b6cff);
      m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.needsUpdate = true;
    });
  }

  return { draw, loadGallery, dispose, setTheme, stats: { verts: pos.count, tris: (geo.index ? geo.index.count : pos.count) / 3, depthUnits } };
}
