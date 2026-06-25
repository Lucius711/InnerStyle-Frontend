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
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Slider } from "@/components/ui/FormControls";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";

// Formats three.js can export entirely in the browser from the edited mesh.
const EXPORT_FORMATS = [
  { id: "glb", label: "GLB" },
  { id: "obj", label: "OBJ" },
  { id: "stl", label: "STL" },
  { id: "usdz", label: "USDZ" },
  { id: "ply", label: "PLY" },
];

/* ------------------------------------------------------------------ scene */

function EditableModel({ url, registerScene, onParts, selectedId, onSelect }) {
  const { scene } = useGLTF(url, true, true);

  // Clone the cached scene + clone every material so edits never mutate the
  // shared gltf cache (which the read-only ModelViewer also uses).
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.userData.baseScale = o.scale.clone();
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

  useEffect(() => {
    registerScene(cloned);
    const parts = [];
    cloned.traverse((o) => {
      if (o.isMesh) parts.push({ id: o.uuid, name: o.name || `Mesh ${parts.length + 1}` });
    });
    onParts(parts);
  }, [cloned, registerScene, onParts]);

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

/* ------------------------------------------------------------------ controls */

const DEFAULT_CTRL = {
  color: "#ffffff",
  metalness: 0,
  roughness: 1,
  visible: true,
  sx: 1,
  sy: 1,
  sz: 1,
};

function PartControls({ mesh, onChange }) {
  const t = useT();
  const [c, setC] = useState(DEFAULT_CTRL);

  useEffect(() => {
    if (!mesh) return;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const base = mesh.userData.baseScale || new THREE.Vector3(1, 1, 1);
    setC({
      color: mat?.color ? `#${mat.color.getHexString()}` : "#ffffff",
      metalness: mat?.metalness ?? 0,
      roughness: mat?.roughness ?? 1,
      visible: mesh.visible,
      sx: base.x ? mesh.scale.x / base.x : 1,
      sy: base.y ? mesh.scale.y / base.y : 1,
      sz: base.z ? mesh.scale.z / base.z : 1,
    });
  }, [mesh]);

  if (!mesh) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-app-line/15 px-4 py-8 text-center text-xs text-app-faint">
        <MousePointerClick className="h-5 w-5" />
        {t("editor.noSelection")}
      </div>
    );
  }

  const set = (patch) => {
    const next = { ...c, ...patch };
    setC(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-app-muted">{t("editor.color")}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={c.color}
            onChange={(e) => set({ color: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded-lg border border-app-line/15 bg-transparent"
          />
          <span className="font-mono text-xs text-app-faint">{c.color}</span>
        </div>
      </div>

      <Slider
        label={t("editor.metalness")}
        min={0}
        max={1}
        step={0.05}
        value={c.metalness}
        onChange={(v) => set({ metalness: v })}
        format={(v) => v.toFixed(2)}
      />
      <Slider
        label={t("editor.roughness")}
        min={0}
        max={1}
        step={0.05}
        value={c.roughness}
        onChange={(v) => set({ roughness: v })}
        format={(v) => v.toFixed(2)}
      />

      <div className="space-y-3 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-3">
        <span className="block text-xs font-medium text-app-muted">{t("editor.scale")}</span>
        <Slider label={t("editor.scaleX")} min={0.3} max={2.5} step={0.05} value={c.sx} onChange={(v) => set({ sx: v })} format={(v) => `${v.toFixed(2)}x`} />
        <Slider label={t("editor.scaleY")} min={0.3} max={2.5} step={0.05} value={c.sy} onChange={(v) => set({ sy: v })} format={(v) => `${v.toFixed(2)}x`} />
        <Slider label={t("editor.scaleZ")} min={0.3} max={2.5} step={0.05} value={c.sz} onChange={(v) => set({ sz: v })} format={(v) => `${v.toFixed(2)}x`} />
        <Slider label={t("editor.uniform")} min={0.3} max={2.5} step={0.05} value={c.sx} onChange={(v) => set({ sx: v, sy: v, sz: v })} format={(v) => `${v.toFixed(2)}x`} />
      </div>

      <button
        type="button"
        onClick={() => set({ visible: !c.visible })}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-app-line/10 bg-app-line/[0.03] px-4 py-2.5 text-sm text-app-text hover:bg-app-line/[0.06]"
      >
        <span>{t("editor.visible")}</span>
        {c.visible ? <Eye className="h-4 w-4 text-brand-violet" /> : <EyeOff className="h-4 w-4 text-app-faint" />}
      </button>

      <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => set(DEFAULT_CTRL)}>
        {t("editor.resetPart")}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

export default function ModelEditor({ url, open, onClose }) {
  const t = useT();
  const toast = useToast();
  const sceneRef = useRef(null);
  const fmtRef = useRef(null);
  const [parts, setParts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [fmtOpen, setFmtOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setParts([]);
      setFmtOpen(false);
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

  const meshOf = (id) =>
    id && sceneRef.current ? sceneRef.current.getObjectByProperty("uuid", id) : null;

  const selectedMesh = meshOf(selectedId);

  const applyEdit = useCallback(
    (next) => {
      const mesh = meshOf(selectedId);
      if (!mesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        if (m.color) m.color.set(next.color);
        if ("metalness" in m) m.metalness = next.metalness;
        if ("roughness" in m) m.roughness = next.roughness;
        m.needsUpdate = true;
      });
      mesh.visible = next.visible;
      const base = mesh.userData.baseScale || new THREE.Vector3(1, 1, 1);
      mesh.scale.set(base.x * next.sx, base.y * next.sy, base.z * next.sz);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId]
  );

  const resetAll = () => {
    const s = sceneRef.current;
    if (!s) return;
    s.traverse((o) => {
      if (!o.isMesh) return;
      o.visible = true;
      if (o.userData.baseScale) o.scale.copy(o.userData.baseScale);
    });
    setSelectedId(null);
    toast.success(t("editor.resetAll"));
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
    try {
      if (fmt === "glb") {
        new GLTFExporter().parse(
          s,
          (res) => save(res, "model/gltf-binary", "glb"),
          () => fail(),
          { binary: true }
        );
      } else if (fmt === "obj") {
        save(new OBJExporter().parse(s), "text/plain", "obj");
      } else if (fmt === "stl") {
        save(new STLExporter().parse(s, { binary: true }), "model/stl", "stl");
      } else if (fmt === "ply") {
        new PLYExporter().parse(s, (res) => save(res, "application/octet-stream", "ply"), {
          binary: true,
        });
      } else if (fmt === "usdz") {
        save(await new USDZExporter().parseAsync(s), "model/vnd.usdz+zip", "usdz");
      } else {
        fail();
      }
    } catch {
      fail();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-app-bg/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-app-line/10 px-5 py-3">
        <h3 className="font-display text-lg font-semibold text-app-text">{t("editor.title")}</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={resetAll}>
            {t("editor.resetAll")}
          </Button>

          <div className="relative" ref={fmtRef}>
            <Button
              size="sm"
              icon={exporting ? Loader2 : Download}
              loading={exporting}
              onClick={() => setFmtOpen((o) => !o)}
            >
              {t("editor.export")} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            {fmtOpen && !exporting && (
              <div className="glass-strong absolute right-0 z-10 mt-2 w-40 rounded-xl p-1.5 shadow-card">
                {EXPORT_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => exportAs(f.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-line/10 hover:text-app-text"
                  >
                    {f.label}
                    <span className="text-[10px] uppercase text-app-faint">.{f.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-app-muted hover:bg-app-line/10 hover:text-app-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-[45vh] flex-1 bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
          <Canvas
            shadows
            camera={{ position: [0, 0.4, 4], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            onPointerMissed={() => setSelectedId(null)}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[4, 6, 5]} intensity={1.1} castShadow />
            <Suspense fallback={<CanvasLoader />}>
              <EditableModel
                url={url}
                registerScene={registerScene}
                onParts={setParts}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2.6} far={4} />
              <Environment resolution={256} frames={1}>
                <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[12, 4, 1]} />
                <Lightformer intensity={1.4} position={[-6, 2, 2]} scale={[10, 3, 1]} color="#cfe0ff" />
                <Lightformer intensity={1.4} position={[6, 2, 2]} scale={[10, 3, 1]} color="#ffe9d6" />
              </Environment>
            </Suspense>
            <OrbitControls makeDefault enablePan={false} minDistance={1.4} maxDistance={12} enableDamping dampingFactor={0.08} />
          </Canvas>
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-app-bg/70 px-3 py-1.5 text-[11px] font-medium text-app-muted backdrop-blur-md">
            {t("editor.hint")}
          </span>
        </div>

        <aside className="w-full overflow-y-auto border-t border-app-line/10 bg-app-surface/40 p-5 md:w-80 md:border-l md:border-t-0">
          <div className="mb-4">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-app-faint">
              {t("editor.parts")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {parts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={
                    "max-w-full truncate rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors " +
                    (p.id === selectedId
                      ? "bg-brand-violet text-white"
                      : "bg-app-line/[0.05] text-app-muted hover:text-app-text")
                  }
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-300/90">
            {t("editor.retexHint")}
          </p>

          <PartControls mesh={selectedMesh} onChange={applyEdit} />
        </aside>
      </div>
    </div>
  );
}
