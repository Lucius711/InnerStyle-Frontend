import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Bounds,
  Center,
  Environment,
  Lightformer,
  ContactShadows,
  Html,
  useGLTF,
} from "@react-three/drei";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import {
  X,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  MousePointerClick,
  Palette,
  Move3d,
  SunMedium,
  Scan,
  Layers,
  Disc3,
  Save,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import SignaturePad from "@/components/three/SignaturePad";
import { Slider, Segmented, Toggle } from "@/components/ui/FormControls";
import { export3mf } from "@/lib/export3mf";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";

const DEG = Math.PI / 180;

// Formats three.js can export entirely in the browser from the edited mesh.
const EXPORT_FORMATS = [
  { id: "glb", label: "GLB" },
  { id: "obj", label: "OBJ" },
  { id: "stl", label: "STL" },
  { id: "3mf", label: "3MF" },
  { id: "usdz", label: "USDZ" },
  { id: "ply", label: "PLY" },
];

/* -------------------------------------------------- render mode (whole scene) */

/**
 * Apply a display mode across every mesh non-destructively. The original
 * ("standard") material is cached on first call so we can always restore it, and
 * its base-color map is remembered so "textured" can put it back.
 */
function applyRenderModeTo(scene, mode) {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (!o.userData._std) o.userData._std = o.material;

    if (mode === "normals") {
      if (!o.userData._normal) {
        o.userData._normal = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
      }
      o.material = o.userData._normal;
      return;
    }

    o.material = o.userData._std;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m) return;
      if (o.userData._origMap === undefined) o.userData._origMap = m.map ?? null;
      m.wireframe = mode === "wireframe";
      if ("map" in m) m.map = mode === "textured" ? o.userData._origMap : null;
      m.needsUpdate = true;
    });
  });
}

/** The std material we edit color/metalness/roughness on, regardless of mode. */
function stdMaterialOf(mesh) {
  const holder = mesh.userData._std || mesh.material;
  return Array.isArray(holder) ? holder[0] : holder;
}

/* ------------------------------------------------------------------ scene */

function EditableModel({ url, baseColorUrl, registerScene, onParts, onMetrics, selectedId, onSelect }) {
  const { scene } = useGLTF(url, true, true);

  // Clone the cached scene + every material so edits never mutate the shared
  // gltf cache (which the read-only ModelViewer also uses). Capture each mesh's
  // base transform so scale / rotation / position edits are relative.
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.userData.baseScale = o.scale.clone();
      o.userData.baseRotation = o.rotation.clone();
      o.userData.basePosition = o.position.clone();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const clones = mats.map((m) => {
        if (!m) return m;
        const cm = m.clone();
        cm.side = THREE.DoubleSide;
        return cm;
      });
      o.material = Array.isArray(o.material) ? clones : clones[0];
    });
    return c;
  }, [scene]);

  // Fallback texture: like ModelViewer, Meshy GLBs may reference the base-color map on a CDN
  // (no CORS / dropped on re-export), leaving the cloned materials map-less and the model grey.
  // If nothing has a map after cloning, fetch base_color same-origin and bind it onto every
  // material — caching it as _origMap so the "textured" render mode restores it after mode swaps.
  useEffect(() => {
    if (!baseColorUrl) return undefined;
    let hasMap = false;
    cloned.traverse((o) => {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m?.map) hasMap = true;
      });
    });
    if (hasMap) return undefined;

    let cancelled = false;
    new THREE.TextureLoader().load(
      baseColorUrl,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.flipY = false;
        tex.anisotropy = 8;
        cloned.traverse((o) => {
          if (!o.isMesh) return;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            if (!m || !("map" in m)) return;
            m.map = tex;
            if (m.color) m.color.set("#ffffff"); // show the texture untinted
            o.userData._origMap = tex; // keep it through textured/solid mode swaps
            m.needsUpdate = true;
          });
        });
      },
      undefined,
      () => {
        /* texture proxy failed — leave the model as-is (grey) */
      }
    );
    return () => {
      cancelled = true;
    };
  }, [cloned, baseColorUrl]);

  useEffect(() => {
    registerScene(cloned);
    const parts = [];
    cloned.traverse((o) => {
      if (o.isMesh) parts.push({ id: o.uuid, name: o.name || `Mesh ${parts.length + 1}` });
    });
    onParts(parts);

    // Measure the model so the base can be sized + placed relative to it.
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    onMetrics?.({
      size: { x: size.x, y: size.y, z: size.z },
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      center: { x: center.x, y: center.y, z: center.z },
    });
  }, [cloned, registerScene, onParts, onMetrics]);

  // Highlight the selected mesh with a subtle emissive glow.
  useEffect(() => {
    cloned.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.emissive) return;
        if (o.userData.baseEmissive === undefined) {
          o.userData.baseEmissive = m.emissive.clone();
          o.userData.baseEmissiveIntensity = m.emissiveIntensity ?? 1;
        }
        if (o.uuid === selectedId) {
          m.emissive.set("#5b6cff");
          m.emissiveIntensity = 0.4;
        } else {
          m.emissive.copy(o.userData.baseEmissive);
          m.emissiveIntensity = o.userData.baseEmissiveIntensity;
        }
        m.needsUpdate = true;
      });
    });
  }, [selectedId, cloned]);

  return (
    <Bounds fit clip margin={1.1}>
      <Center>
        <primitive
          object={cloned}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e.object.uuid);
          }}
        />
      </Center>
    </Bounds>
  );
}

function CanvasLoader() {
  const t = useT();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-app-text">
        <Loader2 className="h-7 w-7 animate-spin text-brand-violet" />
        <span className="text-xs font-medium">{t("studio.loadingModel")}</span>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ base (đế) */

const DEFAULT_BASE = {
  enabled: false,
  shape: "cylinder", // cylinder | box | hex
  color: "#3a3f55",
  size: 1.15, // radius multiplier vs. the model footprint
  height: 0.16, // thickness as a fraction of the model footprint radius
  metalness: 0.1,
  roughness: 0.85,
  signatureStrokes: null, // hand-drawn signature (list of strokes) engraved on the underside
  signaturePenWidth: 0.045, // pen width as a fraction of the drawing box
  signatureRaised: false, // false = recessed (engraved), true = raised
};

const BASE_PRESETS = [
  "#3a3f55", "#1f2433", "#0b0e17", "#111827", "#6b7280", "#d1d5db",
  "#8b5e34", "#b08d57", "#ffffff", "#5b6cff", "#10b981", "#ef4444",
];

/** Derive radius/height/position (in model-local space) from the metrics box. */
function baseDims(base, metrics) {
  if (!metrics) return null;
  const r0 = Math.max(metrics.size.x, metrics.size.z) / 2 || 0.5;
  const r = r0 * base.size;
  const h = r0 * base.height;
  return { r, h, r0 };
}

/**
 * Procedural pedestal rendered under the model. Lives outside <Center>, so it
 * sits at world bottom = -size.y/2 (the model is centered at the origin).
 */
function ModelBase({ base, metrics }) {
  if (!base.enabled || !metrics) return null;
  const dims = baseDims(base, metrics);
  if (!dims) return null;
  const { r, h } = dims;
  const y = -metrics.size.y / 2 - h / 2;
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      {base.shape === "box" ? (
        <boxGeometry args={[r * 2, h, r * 2]} />
      ) : (
        <cylinderGeometry args={[r, r, h, base.shape === "hex" ? 6 : 64]} />
      )}
      <meshStandardMaterial color={base.color} metalness={base.metalness} roughness={base.roughness} />
    </mesh>
  );
}

/** Build a standalone base mesh in model-local space (for export). */
function buildBaseMesh(base, metrics) {
  const dims = baseDims(base, metrics);
  if (!dims) return null;
  const { r, h } = dims;
  let geo;
  if (base.shape === "box") geo = new THREE.BoxGeometry(r * 2, h, r * 2);
  else geo = new THREE.CylinderGeometry(r, r, h, base.shape === "hex" ? 6 : 64);
  const mat = new THREE.MeshStandardMaterial({
    color: base.color,
    metalness: base.metalness,
    roughness: base.roughness,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "InnerStyle Base";
  mesh.position.set(metrics.center.x, metrics.min.y - h / 2, metrics.center.z);
  return mesh;
}

/* ------------------------------------------------------------------ controls */

const DEFAULT_CTRL = {
  color: "#ffffff",
  metalness: 0,
  roughness: 1,
  sx: 1, sy: 1, sz: 1,
  rx: 0, ry: 0, rz: 0,
  ox: 0, oy: 0, oz: 0,
};

function readCtrl(mesh) {
  const mat = stdMaterialOf(mesh);
  const bs = mesh.userData.baseScale || new THREE.Vector3(1, 1, 1);
  const br = mesh.userData.baseRotation || new THREE.Euler();
  const bp = mesh.userData.basePosition || new THREE.Vector3();
  const round = (v) => Math.round(v * 100) / 100;
  return {
    color: mat?.color ? `#${mat.color.getHexString()}` : "#ffffff",
    metalness: mat?.metalness ?? 0,
    roughness: mat?.roughness ?? 1,
    sx: bs.x ? round(mesh.scale.x / bs.x) : 1,
    sy: bs.y ? round(mesh.scale.y / bs.y) : 1,
    sz: bs.z ? round(mesh.scale.z / bs.z) : 1,
    rx: Math.round((mesh.rotation.x - br.x) / DEG),
    ry: Math.round((mesh.rotation.y - br.y) / DEG),
    rz: Math.round((mesh.rotation.z - br.z) / DEG),
    ox: round(mesh.position.x - bp.x),
    oy: round(mesh.position.y - bp.y),
    oz: round(mesh.position.z - bp.z),
  };
}

// Customer-friendly quick palette.
const PRESET_COLORS = [
  "#ffffff", "#d1d5db", "#111827", "#ef4444", "#f97316", "#f59e0b",
  "#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

function MaterialTab({ c, set, onApplyAll, parts, partColors, setPartColor, selectedId, onSelectPart }) {
  const t = useT();
  return (
    <div className="space-y-4">
      {/* Quick palette — one click recolors the selected part */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.quickColors")}</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              disabled={!selectedId}
              onClick={() => selectedId && setPartColor(selectedId, hex)}
              className="h-7 w-7 rounded-lg border border-app-line/20 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: hex }}
            />
          ))}
        </div>
        {!selectedId && <p className="mt-1.5 text-[11px] text-app-faint">{t("editor.pickPartHint")}</p>}
      </div>

      {/* Per-part colors — change any part directly */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-app-muted">{t("editor.partColors")}</label>
        {parts.map((p) => (
          <div
            key={p.id}
            className={
              "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors " +
              (p.id === selectedId ? "bg-brand-violet/10" : "hover:bg-app-line/[0.04]")
            }
          >
            <input
              type="color"
              value={partColors[p.id] || "#ffffff"}
              onChange={(e) => setPartColor(p.id, e.target.value)}
              className="h-7 w-9 shrink-0 cursor-pointer rounded-md border border-app-line/15 bg-transparent"
            />
            <button
              type="button"
              onClick={() => onSelectPart(p.id)}
              className={
                "min-w-0 flex-1 truncate text-left text-xs font-medium transition-colors " +
                (p.id === selectedId ? "text-app-text" : "text-app-muted hover:text-app-text")
              }
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Fine-tune the selected part's surface */}
      {selectedId && (
        <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
          <span className="block text-xs font-medium text-app-muted">{t("editor.finish")}</span>
          <Slider label={t("editor.metalness")} min={0} max={1} step={0.05}
            value={c.metalness} onChange={(v) => set({ metalness: v })} format={(v) => v.toFixed(2)} />
          <Slider label={t("editor.roughness")} min={0} max={1} step={0.05}
            value={c.roughness} onChange={(v) => set({ roughness: v })} format={(v) => v.toFixed(2)} />
        </div>
      )}

      <Button variant="secondary" size="sm" icon={Layers} className="w-full" onClick={onApplyAll}>
        {t("editor.applyToAll")}
      </Button>
    </div>
  );
}

function TransformTab({ c, set, onReset }) {
  const t = useT();
  const sx = (v) => `${v.toFixed(2)}x`;
  const deg = (v) => `${v}°`;
  const off = (v) => v.toFixed(2);
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
        <span className="block text-xs font-medium text-app-muted">{t("editor.scale")}</span>
        <Slider label={t("editor.scaleX")} min={0.3} max={2.5} step={0.05} value={c.sx} onChange={(v) => set({ sx: v })} format={sx} />
        <Slider label={t("editor.scaleY")} min={0.3} max={2.5} step={0.05} value={c.sy} onChange={(v) => set({ sy: v })} format={sx} />
        <Slider label={t("editor.scaleZ")} min={0.3} max={2.5} step={0.05} value={c.sz} onChange={(v) => set({ sz: v })} format={sx} />
        <Slider label={t("editor.uniform")} min={0.3} max={2.5} step={0.05} value={c.sx} onChange={(v) => set({ sx: v, sy: v, sz: v })} format={sx} />
      </div>
      <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
        <span className="block text-xs font-medium text-app-muted">{t("editor.rotation")}</span>
        <Slider label={t("editor.rotX")} min={-180} max={180} step={1} value={c.rx} onChange={(v) => set({ rx: v })} format={deg} />
        <Slider label={t("editor.rotY")} min={-180} max={180} step={1} value={c.ry} onChange={(v) => set({ ry: v })} format={deg} />
        <Slider label={t("editor.rotZ")} min={-180} max={180} step={1} value={c.rz} onChange={(v) => set({ rz: v })} format={deg} />
      </div>
      <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
        <span className="block text-xs font-medium text-app-muted">{t("editor.offset")}</span>
        <Slider label={t("editor.scaleX")} min={-1} max={1} step={0.02} value={c.ox} onChange={(v) => set({ ox: v })} format={off} />
        <Slider label={t("editor.scaleY")} min={-1} max={1} step={0.02} value={c.oy} onChange={(v) => set({ oy: v })} format={off} />
        <Slider label={t("editor.scaleZ")} min={-1} max={1} step={0.02} value={c.oz} onChange={(v) => set({ oz: v })} format={off} />
      </div>
      <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
        {t("editor.resetTransform")}
      </Button>
    </div>
  );
}

function SceneTab({ scene, setScene }) {
  const t = useT();
  const modes = [
    { value: "textured", label: t("editor.modeTextured") },
    { value: "solid", label: t("editor.modeSolid") },
    { value: "wireframe", label: t("editor.modeWireframe") },
    { value: "normals", label: t("editor.modeNormals") },
  ];
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.renderMode")}</label>
        <Segmented name="renderMode" options={modes} value={scene.renderMode}
          onChange={(v) => setScene({ renderMode: v })} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.background")}</label>
        <div className="flex items-center gap-2">
          <input type="color" value={scene.bg || "#0b0e17"}
            onChange={(e) => setScene({ bg: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded-lg border border-app-line/15 bg-transparent" />
          <button type="button" onClick={() => setScene({ bg: "" })}
            className="rounded-lg border border-app-line/10 px-2.5 py-1.5 text-xs text-app-muted hover:text-app-text">
            {t("editor.bgDefault")}
          </button>
        </div>
      </div>
      <Slider label={t("editor.lighting")} min={0.2} max={2.5} step={0.05}
        value={scene.light} onChange={(v) => setScene({ light: v })} format={(v) => `${v.toFixed(2)}x`} />
      <Toggle checked={scene.autoRotate} onChange={(v) => setScene({ autoRotate: v })} label={t("editor.autoRotate")} />
      <Toggle checked={scene.grid} onChange={(v) => setScene({ grid: v })} label={t("editor.grid")} />
    </div>
  );
}

function BaseTab({ base, setBase, onSave, saving, baked, onRemove, removing }) {
  const t = useT();
  const shapes = [
    { value: "cylinder", label: t("editor.baseCylinder") },
    { value: "box", label: t("editor.baseBox") },
    { value: "hex", label: t("editor.baseHex") },
  ];
  // Model already has a base → only offer to remove it. After removal it reloads base-less and the
  // normal "add base" UI returns (no separate "replace" flow needed).
  if (baked) {
    return (
      <div className="space-y-2 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
        <p className="text-xs leading-relaxed text-app-muted">{t("editor.baseExisting")}</p>
        {onRemove && (
          <Button size="sm" icon={Trash2} variant="ghost" className="w-full" loading={removing} onClick={onRemove}>
            {t("editor.baseRemove")}
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Toggle checked={base.enabled} onChange={(v) => setBase({ enabled: v })} label={t("editor.baseEnable")} />
      {base.enabled && (
        <>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.baseShape")}</label>
            <Segmented name="baseShape" options={shapes} value={base.shape} onChange={(v) => setBase({ shape: v })} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.baseColor")}</label>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {BASE_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => setBase({ color: hex })}
                  className={
                    "h-7 w-7 rounded-lg border transition-transform hover:scale-110 " +
                    (base.color.toLowerCase() === hex.toLowerCase()
                      ? "border-brand-violet ring-2 ring-brand-violet/40"
                      : "border-app-line/20")
                  }
                  style={{ background: hex }}
                />
              ))}
            </div>
            <input
              type="color"
              value={base.color}
              onChange={(e) => setBase({ color: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded-lg border border-app-line/15 bg-transparent"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
            <Slider label={t("editor.baseSize")} min={0.8} max={2.2} step={0.05}
              value={base.size} onChange={(v) => setBase({ size: v })} format={(v) => `${v.toFixed(2)}x`} />
            <Slider label={t("editor.baseThickness")} min={0.04} max={0.6} step={0.01}
              value={base.height} onChange={(v) => setBase({ height: v })} format={(v) => v.toFixed(2)} />
          </div>

          <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
            <span className="block text-xs font-medium text-app-muted">{t("editor.finish")}</span>
            <Slider label={t("editor.metalness")} min={0} max={1} step={0.05}
              value={base.metalness} onChange={(v) => setBase({ metalness: v })} format={(v) => v.toFixed(2)} />
            <Slider label={t("editor.roughness")} min={0} max={1} step={0.05}
              value={base.roughness} onChange={(v) => setBase({ roughness: v })} format={(v) => v.toFixed(2)} />
          </div>

          <div className="space-y-2 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
            <label className="block text-xs font-medium text-app-muted">{t("editor.signatureLabel")}</label>
            <SignaturePad
              penWidth={base.signaturePenWidth}
              onChange={(strokes) => setBase({ signatureStrokes: strokes })}
            />
            {base.signatureStrokes && base.signatureStrokes.length > 0 && (
              <Toggle
                checked={base.signatureRaised}
                onChange={(v) => setBase({ signatureRaised: v })}
                label={t("editor.signatureRaised")}
              />
            )}
            <p className="text-[11px] leading-relaxed text-app-faint">{t("editor.signatureHint")}</p>
          </div>

          <p className="text-[11px] leading-relaxed text-app-faint">{t("editor.baseHint")}</p>
          {onSave && (
            <Button size="sm" icon={Save} className="w-full" loading={saving} onClick={onSave}>
              {t("editor.saveBase")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

const TABS = [
  { id: "material", icon: Palette, key: "tabMaterial" },
  { id: "transform", icon: Move3d, key: "tabTransform" },
  { id: "base", icon: Disc3, key: "tabBase" },
  { id: "scene", icon: SunMedium, key: "tabScene" },
];

/** Collapsible section for the editor's right rail (replaces the old tab bar). */
function EditorSection({ icon: Icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-app-line/[0.03]"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-app-text">
          {Icon && <Icon className="h-4 w-4 text-brand-violet" />} {title}
        </span>
        <ChevronDown
          className={"h-4 w-4 shrink-0 text-app-faint transition-transform " + (open ? "rotate-180" : "")}
        />
      </button>
      {open && <div className="px-4 pb-5">{children}</div>}
    </div>
  );
}

export default function ModelEditor({ url, baseColorUrl, open, onClose, task, onModelUpdated, leftPanel = null }) {
  const t = useT();
  const toast = useToast();
  const sceneRef = useRef(null);
  // The live react-three-fiber state ({ gl, scene, camera }) — used to snapshot a fresh
  // thumbnail of the edited model after a base is added/removed.
  const glStateRef = useRef(null);
  // Set when we want to re-capture the thumbnail once the next (re)loaded model has rendered.
  const pendingCaptureRef = useRef(false);
  // Bumped each time a model finishes loading, so the capture effect can fire post-reload.
  const [loadTick, setLoadTick] = useState(0);
  // The model URL can be re-pointed (with a cache-busting param) after we persist a base
  // server-side, so the editor reloads the freshly baked mesh.
  const [modelUrl, setModelUrl] = useState(url);
  const [savingBase, setSavingBase] = useState(false);
  const [removingBase, setRemovingBase] = useState(false);
  useEffect(() => {
    setModelUrl(url);
  }, [url, open]);
  const fmtRef = useRef(null);
  const [parts, setParts] = useState([]);
  // A base baked in by the server shows up as a part named "innerstyle_base" — detect it so we
  // don't offer to add a second base on top.
  const hasBakedBase = useMemo(
    () => parts.some((p) => /innerstyle_base/i.test(p.name || "")),
    [parts]
  );
  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const [fmtOpen, setFmtOpen] = useState(false);

  const [tab, setTab] = useState("material");
  const [ctrl, setCtrl] = useState(DEFAULT_CTRL);
  const [hidden, setHidden] = useState([]);
  const [soloId, setSoloId] = useState(null);
  const [partColors, setPartColors] = useState({});
  const [base, setBaseState] = useState(DEFAULT_BASE);
  const setBase = (patch) => setBaseState((b) => ({ ...b, ...patch }));
  const [metrics, setMetrics] = useState(null);
  const metricsRef = useRef(null);
  const baseRef = useRef(DEFAULT_BASE);
  baseRef.current = base;
  const handleMetrics = useCallback((m) => {
    metricsRef.current = m;
    setMetrics(m);
    // Signal that a (re)load just finished so a pending thumbnail capture can run.
    setLoadTick((n) => n + 1);
  }, []);
  const [scene, setSceneState] = useState({
    renderMode: "textured",
    bg: "",
    light: 1,
    autoRotate: false,
    grid: true,
  });
  const setScene = (patch) => setSceneState((s) => ({ ...s, ...patch }));

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setParts([]);
      setFmtOpen(false);
      setHidden([]);
      setSoloId(null);
      setTab("material");
      setBaseState(DEFAULT_BASE);
      setMetrics(null);
      metricsRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    const onClick = (e) => {
      if (fmtRef.current && !fmtRef.current.contains(e.target)) setFmtOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const registerScene = useCallback((s) => {
    sceneRef.current = s;
  }, []);

  // Snapshot the current viewport to a PNG blob (transparent background, grid hidden) so it can
  // be uploaded as the task's new thumbnail. Returns null if the renderer isn't ready.
  const captureThumbnailBlob = useCallback(
    () =>
      new Promise((resolve) => {
        const st = glStateRef.current;
        if (!st?.gl || !st.scene || !st.camera) return resolve(null);
        const { gl, scene, camera } = st;
        const restore = [];
        scene.traverse((o) => {
          if (o.type === "GridHelper" && o.visible) {
            o.visible = false;
            restore.push(o);
          }
        });
        try {
          gl.render(scene, camera); // fresh frame with helpers hidden
          gl.domElement.toBlob((b) => resolve(b), "image/png");
        } catch {
          resolve(null);
        } finally {
          restore.forEach((o) => (o.visible = true));
        }
      }),
    []
  );

  // After a base is added/removed the model reloads; once it has rendered, capture a fresh
  // thumbnail and upload it so "My models" / orders show the edited model (not the stale Meshy one).
  useEffect(() => {
    if (!pendingCaptureRef.current || !task?.id) return;
    pendingCaptureRef.current = false;
    let cancelled = false;
    // Wait two frames so the freshly loaded mesh is actually painted before snapshotting.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(async () => {
        if (cancelled) return;
        const blob = await captureThumbnailBlob();
        if (blob) {
          try {
            await api.uploadThumbnail(task.id, blob);
            onModelUpdated?.();
          } catch {
            /* best-effort: a stale thumbnail isn't worth failing the edit over */
          }
        }
      })
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTick]);

  const meshOf = (id) =>
    id && sceneRef.current ? sceneRef.current.getObjectByProperty("uuid", id) : null;
  const selectedMesh = meshOf(selectedId);

  // Sync control values from the newly selected mesh.
  useEffect(() => {
    const mesh = meshOf(selectedId);
    if (mesh) setCtrl(readCtrl(mesh));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Read each part's starting colour for the per-part swatches.
  const refreshPartColors = useCallback(() => {
    const s = sceneRef.current;
    if (!s) return;
    const map = {};
    s.traverse((o) => {
      if (!o.isMesh) return;
      const mat = stdMaterialOf(o);
      map[o.uuid] = mat?.color ? `#${mat.color.getHexString()}` : "#ffffff";
    });
    setPartColors(map);
  }, []);
  useEffect(() => {
    refreshPartColors();
  }, [parts, refreshPartColors]);

  // Recolour one part directly (used by the per-part swatches + quick palette).
  const setPartColor = (id, hex) => {
    setPartColors((c) => ({ ...c, [id]: hex }));
    const mesh = meshOf(id);
    if (!mesh) return;
    const holder = mesh.userData._std || mesh.material;
    const mats = Array.isArray(holder) ? holder : [holder];
    mats.forEach((m) => {
      if (m?.color) {
        m.color.set(hex);
        m.needsUpdate = true;
      }
    });
    if (id === selectedId) setCtrl((c) => ({ ...c, color: hex }));
  };

  // Visibility: solo overrides per-part hide.
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    const hiddenSet = new Set(hidden);
    s.traverse((o) => {
      if (!o.isMesh) return;
      o.visible = soloId ? o.uuid === soloId : !hiddenSet.has(o.uuid);
    });
  }, [hidden, soloId, parts]);

  // Render mode across the scene.
  useEffect(() => {
    const s = sceneRef.current;
    if (s) applyRenderModeTo(s, scene.renderMode);
  }, [scene.renderMode, parts]);

  const set = (patch) => {
    const next = { ...ctrl, ...patch };
    setCtrl(next);
    const mesh = meshOf(selectedId);
    if (!mesh) return;
    const mat = stdMaterialOf(mesh);
    const mats = Array.isArray(mesh.userData._std || mesh.material)
      ? mesh.userData._std || mesh.material
      : [mat];
    mats.forEach((m) => {
      if (!m) return;
      if (m.color) m.color.set(next.color);
      if ("metalness" in m) m.metalness = next.metalness;
      if ("roughness" in m) m.roughness = next.roughness;
      m.needsUpdate = true;
    });
    const bs = mesh.userData.baseScale || new THREE.Vector3(1, 1, 1);
    const br = mesh.userData.baseRotation || new THREE.Euler();
    const bp = mesh.userData.basePosition || new THREE.Vector3();
    mesh.scale.set(bs.x * next.sx, bs.y * next.sy, bs.z * next.sz);
    mesh.rotation.set(br.x + next.rx * DEG, br.y + next.ry * DEG, br.z + next.rz * DEG);
    mesh.position.set(bp.x + next.ox, bp.y + next.oy, bp.z + next.oz);
  };

  const resetTransform = () => {
    set({ sx: 1, sy: 1, sz: 1, rx: 0, ry: 0, rz: 0, ox: 0, oy: 0, oz: 0 });
  };

  const applyToAll = () => {
    const s = sceneRef.current;
    if (!s) return;
    s.traverse((o) => {
      if (!o.isMesh) return;
      const holder = o.userData._std || o.material;
      const mats = Array.isArray(holder) ? holder : [holder];
      mats.forEach((m) => {
        if (!m) return;
        if (m.color) m.color.set(ctrl.color);
        if ("metalness" in m) m.metalness = ctrl.metalness;
        if ("roughness" in m) m.roughness = ctrl.roughness;
        m.needsUpdate = true;
      });
    });
    refreshPartColors();
    toast.success(t("editor.appliedAll"));
  };

  const toggleHide = (id) =>
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const toggleSolo = (id) => setSoloId((s) => (s === id ? null : id));

  const resetAll = () => {
    const s = sceneRef.current;
    if (!s) return;
    s.traverse((o) => {
      if (!o.isMesh) return;
      o.visible = true;
      if (o.userData.baseScale) o.scale.copy(o.userData.baseScale);
      if (o.userData.baseRotation) o.rotation.copy(o.userData.baseRotation);
      if (o.userData.basePosition) o.position.copy(o.userData.basePosition);
    });
    setHidden([]);
    setSoloId(null);
    if (selectedMesh) setCtrl(readCtrl(selectedMesh));
    toast.success(t("editor.resetAll"));
  };

  // Persist the configured base into the model on the server (it bakes the base into the stored
  // mesh), then reload the baked result so preview + export ZIP include it.
  const saveBaseToModel = async () => {
    if (!task?.id) return;
    const shapeMap = { cylinder: "cylinder", box: "square", hex: "hexagon" };
    const heightRatio = Math.min(0.5, Math.max(0.01, base.height));
    const marginRatio = Math.min(1, Math.max(0, base.size - 1));
    try {
      setSavingBase(true);
      const hasSig = base.signatureStrokes && base.signatureStrokes.length > 0;
      await api.addBase(task.id, {
        shape: shapeMap[base.shape] || "cylinder",
        heightRatio,
        marginRatio,
        color: base.color,
        signatureStrokes: hasSig ? base.signatureStrokes : undefined,
        signaturePenWidth: hasSig ? base.signaturePenWidth : undefined,
        signatureRaised: hasSig ? base.signatureRaised : undefined,
      });
      toast.success(t("editor.baseSavedTitle"), t("editor.baseSavedBody"));
      setBase({ enabled: false }); // drop the local preview; the real base is now in the mesh
      pendingCaptureRef.current = true; // re-snapshot the thumbnail once the baked model reloads
      const bust = url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
      setModelUrl(bust);
      onModelUpdated?.();
    } catch {
      toast.error(t("editor.baseSaveFail"));
    } finally {
      setSavingBase(false);
    }
  };

  // Remove the baked-in base on the server, then reload the base-less model.
  const removeBaseFromModel = async () => {
    if (!task?.id) return;
    try {
      setRemovingBase(true);
      await api.removeBase(task.id);
      toast.success(t("editor.baseRemovedTitle"), t("editor.baseRemovedBody"));
      setBase({ enabled: false });
      pendingCaptureRef.current = true; // re-snapshot the thumbnail once the base-less model reloads
      const bust = url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
      setModelUrl(bust);
      onModelUpdated?.();
    } catch {
      toast.error(t("editor.baseRemoveFail"));
    } finally {
      setRemovingBase(false);
    }
  };

  const save = (data, type, ext) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `innerstyle-edited.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExporting(false);
    toast.success(t("editor.exported"));
  };

  const fail = () => {
    setExporting(false);
    toast.error(t("editor.exportFail"));
  };

  const exportAs = async (fmt) => {
    const s = sceneRef.current;
    if (!s) return;
    setFmtOpen(false);
    setExporting(true);
    // Always export with full textured materials, then restore the current view.
    applyRenderModeTo(s, "textured");
    // Bake the configured base into the model so it ships with the export.
    const baseMesh = baseRef.current.enabled ? buildBaseMesh(baseRef.current, metricsRef.current) : null;
    if (baseMesh) s.add(baseMesh);
    try {
      if (fmt === "glb") {
        new GLTFExporter().parse(s, (res) => save(res, "model/gltf-binary", "glb"), () => fail(), { binary: true });
      } else if (fmt === "obj") {
        save(new OBJExporter().parse(s), "text/plain", "obj");
      } else if (fmt === "stl") {
        save(new STLExporter().parse(s, { binary: true }), "model/stl", "stl");
      } else if (fmt === "3mf") {
        save(export3mf(s).data, "model/3mf", "3mf");
      } else if (fmt === "ply") {
        new PLYExporter().parse(s, (res) => save(res, "application/octet-stream", "ply"), { binary: true });
      } else if (fmt === "usdz") {
        save(await new USDZExporter().parseAsync(s), "model/vnd.usdz+zip", "usdz");
      } else {
        fail();
      }
    } catch {
      fail();
    } finally {
      applyRenderModeTo(s, scene.renderMode);
      if (baseMesh) {
        s.remove(baseMesh);
        baseMesh.geometry.dispose();
        baseMesh.material.dispose();
      }
    }
  };

  // Bake the in-editor edits (material + transform, and the configured base) into the STORED
  // model — the same idea as "Save base to model", but for the whole edited mesh. We export the
  // live scene to a GLB in the browser and upload it as the task's new model, so preview / export
  // ZIP / orders all use the edited mesh. Scene settings (render mode, background, lights, grid)
  // are viewer-only display options and are deliberately NOT baked — we always export the fully
  // textured materials with every part visible so a transient view doesn't corrupt the saved model.
  const saveEditsToModel = async () => {
    const s = sceneRef.current;
    if (!s || !task?.id) return;
    setSavingModel(true);
    const prevHidden = hidden;
    const prevSolo = soloId;
    applyRenderModeTo(s, "textured");
    s.traverse((o) => {
      if (o.isMesh) o.visible = true;
    });
    const baseMesh = baseRef.current.enabled ? buildBaseMesh(baseRef.current, metricsRef.current) : null;
    if (baseMesh) s.add(baseMesh);
    try {
      const glb = await new Promise((resolve, reject) => {
        new GLTFExporter().parse(s, (res) => resolve(res), (err) => reject(err), { binary: true });
      });
      await api.replaceModel(task.id, new Blob([glb], { type: "model/gltf-binary" }));
      if (baseMesh) setBase({ enabled: false }); // the base is now part of the saved mesh
      toast.success(t("editor.modelSavedTitle"), t("editor.modelSavedBody"));
      pendingCaptureRef.current = true; // re-snapshot the thumbnail once the saved model reloads
      const bust = url + (url.includes("?") ? "&" : "?") + "v=" + Date.now();
      setModelUrl(bust);
      onModelUpdated?.();
    } catch {
      toast.error(t("editor.modelSaveFail"));
    } finally {
      if (baseMesh) {
        s.remove(baseMesh);
        baseMesh.geometry.dispose();
        baseMesh.material.dispose();
      }
      // Restore the editor's current view for continued editing.
      applyRenderModeTo(s, scene.renderMode);
      const hiddenSet = new Set(prevHidden);
      s.traverse((o) => {
        if (o.isMesh) o.visible = prevSolo ? o.uuid === prevSolo : !hiddenSet.has(o.uuid);
      });
      setSavingModel(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-app-bg/80 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[92vh] w-full min-w-0 w-[98vw] flex-col overflow-hidden rounded-2xl border border-app-line/10 bg-app-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-app-line/10 px-5 py-3">
        <h3 className="font-display text-lg font-semibold text-app-text">{t("editor.title")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={resetAll}>
            {t("editor.resetAll")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={savingModel ? Loader2 : Save}
            loading={savingModel}
            disabled={savingModel || exporting}
            onClick={saveEditsToModel}
          >
            {savingModel ? t("editor.savingModel") : t("editor.saveModel")}
          </Button>
          <div className="relative" ref={fmtRef}>
            <Button size="sm" icon={exporting ? Loader2 : Download} loading={exporting}
              onClick={() => setFmtOpen((o) => !o)}>
              {t("editor.export")} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            {fmtOpen && !exporting && (
              <div className="glass-menu absolute right-0 z-10 mt-2 w-40 rounded-xl p-1.5 shadow-card">
                {EXPORT_FORMATS.map((f) => (
                  <button key={f.id} type="button" onClick={() => exportAs(f.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-line/10 hover:text-app-text">
                    {f.label}
                    <span className="text-[10px] uppercase text-app-faint">.{f.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-app-muted hover:bg-app-line/10 hover:text-app-text"
            aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {leftPanel && (
          <div className="hidden shrink-0 overflow-y-auto border-app-line/10 bg-app-surface/40 lg:block lg:w-72 lg:border-r xl:w-80">
            {leftPanel}
          </div>
        )}
        <div
          className="relative h-[46vh] w-full shrink-0 lg:h-auto lg:min-h-0 lg:min-w-0 lg:flex-1"
          style={{ background: scene.bg || "radial-gradient(ellipse at center,#1b2030,#070810)" }}
        >
          <Canvas shadows camera={{ position: [0, 0.4, 4], fov: 40 }} dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            onCreated={(state) => (glStateRef.current = state)}
            onPointerMissed={() => setSelectedId(null)}>
            <ambientLight intensity={0.4 * scene.light} />
            <directionalLight position={[4, 6, 5]} intensity={1.1 * scene.light} castShadow />
            {scene.grid && <gridHelper args={[10, 20, "#3a3f55", "#23283a"]} position={[0, -1, 0]} />}
            <Suspense fallback={<CanvasLoader />}>
              <EditableModel url={modelUrl} baseColorUrl={baseColorUrl} registerScene={registerScene} onParts={setParts}
                onMetrics={handleMetrics} selectedId={selectedId} onSelect={setSelectedId} />
              <ModelBase base={base} metrics={metrics} />
              <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2.6} far={4} />
              <Environment resolution={256} frames={1}>
                <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[12, 4, 1]} />
                <Lightformer intensity={1.4} position={[-6, 2, 2]} scale={[10, 3, 1]} color="#cfe0ff" />
                <Lightformer intensity={1.4} position={[6, 2, 2]} scale={[10, 3, 1]} color="#ffe9d6" />
              </Environment>
            </Suspense>
            <OrbitControls makeDefault enablePan={false} minDistance={1.4} maxDistance={12}
              enableDamping dampingFactor={0.08} autoRotate={scene.autoRotate} autoRotateSpeed={1.1} />
          </Canvas>
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-app-bg/70 px-3 py-1.5 text-[11px] font-medium text-app-muted backdrop-blur-md">
            {t("editor.hint")}
          </span>
        </div>

        <aside className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden border-t border-app-line/10 bg-app-surface/40 lg:w-[340px] lg:flex-none lg:border-l lg:border-t-0">
          {/* Parts manager */}
          <div className="border-b border-app-line/10 p-4">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-app-faint">
              {t("editor.parts")}
            </span>
            <div className="space-y-1.5">
              {parts.length === 0 && (
                <span className="text-xs text-app-faint">{t("editor.loadingParts")}</span>
              )}
              {parts.map((p) => {
                const isHidden = hidden.includes(p.id);
                const isSolo = soloId === p.id;
                return (
                  <div
                    key={p.id}
                    className={
                      "flex items-center gap-1 rounded-lg px-1 " +
                      (p.id === selectedId ? "bg-brand-violet/15" : "")
                    }
                  >
                    <button type="button" onClick={() => setSelectedId(p.id)}
                      className={
                        "min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors " +
                        (p.id === selectedId ? "text-app-text" : "text-app-muted hover:text-app-text")
                      }>
                      {p.name}
                    </button>
                    <button type="button" onClick={() => toggleSolo(p.id)} title={t("editor.solo")}
                      className={"rounded-md p-1.5 " + (isSolo ? "text-brand-violet" : "text-app-faint hover:text-app-text")}>
                      <Scan className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => toggleHide(p.id)} title={t("editor.visible")}
                      className="rounded-md p-1.5 text-app-faint hover:text-app-text">
                      {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-brand-violet/80" />}
                    </button>
                  </div>
                );
              })}
            </div>
            {soloId && (
              <button type="button" onClick={() => setSoloId(null)}
                className="mt-2 text-xs font-medium text-brand-violet hover:underline">
                {t("editor.unsolo")}
              </button>
            )}
          </div>

          {/* Sections (scrolling accordion — replaces the old tab bar) */}
          <div className="flex-1 divide-y divide-app-line/10">
            <EditorSection icon={Palette} title={t("editor.tabMaterial")} defaultOpen>
              <MaterialTab
                c={ctrl}
                set={set}
                onApplyAll={applyToAll}
                parts={parts}
                partColors={partColors}
                setPartColor={setPartColor}
                selectedId={selectedId}
                onSelectPart={setSelectedId}
              />
            </EditorSection>

            <EditorSection icon={Move3d} title={t("editor.tabTransform")}>
              {selectedMesh ? (
                <TransformTab c={ctrl} set={set} onReset={resetTransform} />
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-app-line/15 px-4 py-8 text-center text-xs text-app-faint">
                  <MousePointerClick className="h-5 w-5" />
                  {t("editor.noSelection")}
                </div>
              )}
            </EditorSection>

            <EditorSection icon={Disc3} title={t("editor.tabBase")}>
              <BaseTab base={base} setBase={setBase} onSave={task ? saveBaseToModel : null} saving={savingBase} baked={hasBakedBase} onRemove={task ? removeBaseFromModel : null} removing={removingBase} />
            </EditorSection>

            <EditorSection icon={SunMedium} title={t("editor.tabScene")}>
              <SceneTab scene={scene} setScene={setScene} />
            </EditorSection>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
