import { Suspense, Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Lightformer,
  Grid,
  Html,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import {
  Loader2,
  Box,
  Circle,
  RotateCcw,
  Download,
  Play,
  Pause,
  Grid2x2,
  Grid3x3,
  Maximize2,
} from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { cn, formatNumber } from "@/lib/utils";

/* Load model, prep materials, expose clips/stats, drive render mode + animation. */
function Model({ url, mode, clip, playing, onReady }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url, true, true);
  const { actions, names } = useAnimations(animations, group);

  const clayMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c4c8d2", roughness: 0.9, metalness: 0.0 }),
    []
  );

  const stats = useMemo(() => {
    let tris = 0;
    let verts = 0;
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        if (!o.userData.origMat) o.userData.origMat = o.material;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          m.side = THREE.DoubleSide;
          if ("envMapIntensity" in m) m.envMapIntensity = 1.1;
          if (m.map) {
            m.map.anisotropy = 8;
            m.map.colorSpace = THREE.SRGBColorSpace;
          }
          m.needsUpdate = true;
        });
        const g = o.geometry;
        if (g) {
          verts += g.attributes.position ? g.attributes.position.count : 0;
          tris += g.index
            ? g.index.count / 3
            : (g.attributes.position ? g.attributes.position.count : 0) / 3;
        }
      }
    });
    return { triangles: Math.round(tris), vertices: verts };
  }, [scene]);

  useEffect(() => {
    onReady({ names: names || [], stats });
  }, [names, stats, onReady]);

  // Render mode: textured (original) | clay (flat grey) | wireframe
  useEffect(() => {
    clayMat.wireframe = mode === "wireframe";
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const orig = o.userData.origMat;
      if (mode === "clay" || mode === "wireframe") {
        o.material = clayMat;
      } else {
        o.material = orig;
        const mats = Array.isArray(orig) ? orig : [orig];
        mats.forEach((m) => {
          if (m) m.wireframe = false;
        });
      }
    });
  }, [mode, scene, clayMat]);

  useEffect(() => {
    if (!names || !names.length) return undefined;
    const active = clip && actions[clip] ? clip : names[0];
    const a = actions[active];
    if (a) {
      a.reset().fadeIn(0.25).play();
      a.paused = !playing;
    }
    return () => {
      if (a) a.fadeOut(0.25);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, names, clip]);

  useEffect(() => {
    if (!names || !names.length) return;
    const active = clip && actions[clip] ? clip : names[0];
    const a = actions[active];
    if (a) a.paused = !playing;
  }, [playing, clip, names, actions]);

  return (
    <group ref={group}>
      <Bounds fit clip margin={1.1}>
        <Center>
          <primitive object={scene} />
        </Center>
      </Bounds>
    </group>
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

class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function StudioLighting() {
  return (
    <SafeBoundary fallback={null}>
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[12, 4, 1]} />
        <Lightformer intensity={1.4} position={[-6, 2, 2]} scale={[10, 3, 1]} color="#cfe0ff" />
        <Lightformer intensity={1.4} position={[6, 2, 2]} scale={[10, 3, 1]} color="#ffe9d6" />
        <Lightformer intensity={2.0} position={[0, 3, -8]} scale={[12, 6, 1]} />
      </Environment>
    </SafeBoundary>
  );
}

function Fallback({ thumbnailUrl }) {
  const t = useT();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      {thumbnailUrl ? (
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-[conic-gradient(from_180deg,#7c5cff,#22d3ee,#d946ef,#7c5cff)] opacity-20 blur-2xl" />
          <img
            src={thumbnailUrl}
            alt="Model preview"
            className="relative max-h-72 w-auto rounded-2xl border border-app-line/10 object-contain shadow-card"
          />
        </div>
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-app-line/10 bg-app-line/[0.04] text-app-faint">
          <Box className="h-8 w-8" />
        </span>
      )}
      <p className="flex items-center gap-1.5 text-xs text-app-faint">
        <Download className="h-3.5 w-3.5" /> {t("studio.previewUnavailable")}
      </p>
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active ? "bg-brand-violet text-white" : "text-app-muted hover:bg-app-line/10 hover:text-app-text"
      )}
    >
      {children}
    </button>
  );
}

export default function ModelViewer({ url, thumbnailUrl, className }) {
  const t = useT();
  const [mode, setMode] = useState("textured");
  const [autoRotate, setAutoRotate] = useState(true);
  const [grid, setGrid] = useState(true);
  const [stats, setStats] = useState(null);
  const [names, setNames] = useState([]);
  const [clip, setClip] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [viewKey, setViewKey] = useState(0);

  const handleReady = useCallback(({ names: n, stats: s }) => {
    setStats(s);
    setNames(n);
    setClip((c) => (c && n.includes(c) ? c : n[0] || null));
  }, []);

  const hasAnim = names.length > 0;

  return (
    <div className={className}>
      <div className="group relative h-full w-full overflow-hidden rounded-3xl border border-app-line/10 bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
        {url ? (
          <SafeBoundary resetKey={url} fallback={<Fallback thumbnailUrl={thumbnailUrl} />}>
            <Canvas
              key={`${url}-${viewKey}`}
              shadows
              camera={{ position: [0, 0.4, 4], fov: 40 }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
              }}
            >
              <ambientLight intensity={0.35} />
              <directionalLight position={[4, 6, 5]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />

              <Suspense fallback={<CanvasLoader />}>
                <Model url={url} mode={mode} clip={clip} playing={playing} onReady={handleReady} />
                <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2.6} far={4} />
                <StudioLighting />
              </Suspense>

              {grid && (
                <Grid
                  position={[0, -1, 0]}
                  args={[20, 20]}
                  cellSize={0.4}
                  cellThickness={0.6}
                  sectionSize={2}
                  sectionThickness={1}
                  cellColor="#3b4256"
                  sectionColor="#5b6cff"
                  fadeDistance={18}
                  fadeStrength={1.5}
                  infiniteGrid
                />
              )}

              <OrbitControls
                makeDefault
                autoRotate={autoRotate}
                autoRotateSpeed={0.9}
                enablePan={false}
                minDistance={1.4}
                maxDistance={12}
                enableDamping
                dampingFactor={0.08}
              />
            </Canvas>
          </SafeBoundary>
        ) : (
          <Fallback thumbnailUrl={thumbnailUrl} />
        )}

        {url && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-xl border border-app-line/10 bg-app-bg/60 p-1 backdrop-blur-md">
            <ToolBtn active={mode === "textured"} onClick={() => setMode("textured")} title={t("studio.viewer.textured")}>
              <Box className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn active={mode === "clay"} onClick={() => setMode("clay")} title={t("studio.viewer.clay")}>
              <Circle className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn active={mode === "wireframe"} onClick={() => setMode("wireframe")} title={t("studio.viewer.wireframe")}>
              <Grid3x3 className="h-4 w-4" />
            </ToolBtn>
            <span className="mx-0.5 h-5 w-px bg-app-line/15" />
            <ToolBtn active={autoRotate} onClick={() => setAutoRotate((v) => !v)} title={t("studio.viewer.rotate")}>
              <RotateCcw className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn active={grid} onClick={() => setGrid((v) => !v)} title={t("studio.viewer.grid")}>
              <Grid2x2 className="h-4 w-4" />
            </ToolBtn>
            <ToolBtn active={false} onClick={() => setViewKey((k) => k + 1)} title={t("studio.viewer.reset")}>
              <Maximize2 className="h-4 w-4" />
            </ToolBtn>
          </div>
        )}

        {url && stats && (
          <div className="absolute right-3 top-3 rounded-xl border border-app-line/10 bg-app-bg/60 px-3 py-2 text-[11px] backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <span className="text-app-faint">{t("studio.viewer.triangles")}</span>
              <span className="font-mono font-semibold text-app-text">{formatNumber(stats.triangles)}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-4">
              <span className="text-app-faint">{t("studio.viewer.vertices")}</span>
              <span className="font-mono font-semibold text-app-text">{formatNumber(stats.vertices)}</span>
            </div>
          </div>
        )}

        {url && hasAnim && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-app-line/10 bg-app-bg/70 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet text-white transition hover:opacity-90"
              title={playing ? t("studio.viewer.pause") : t("studio.viewer.play")}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            {names.length > 1 ? (
              <select
                value={clip || names[0]}
                onChange={(e) => setClip(e.target.value)}
                className="focus-ring max-w-[160px] rounded-lg border border-app-line/10 bg-app-line/[0.05] px-2 py-1.5 text-xs text-app-text"
              >
                {names.map((n) => (
                  <option key={n} value={n} className="bg-app-surface text-app-text">
                    {n}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-2 text-xs font-medium text-app-text">{names[0]}</span>
            )}
          </div>
        )}

        {url && !hasAnim && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-app-text">
              <RotateCcw className="h-3 w-3" /> {t("studio.orbitHint")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
