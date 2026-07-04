import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  useGLTF,
  Bounds,
  Center,
  Environment,
  Lightformer,
  Html,
} from "@react-three/drei";
import { Loader2 } from "lucide-react";

/**
 * Lightweight, performance-conscious 3D preview for the landing showcase.
 *
 * - Loads a real exported model (GLB/GLTF) from `url` (e.g. /samples/robot.glb).
 * - Auto-rotates; no controls, so it never hijacks page scroll.
 * - Renders ONLY while the card is in the viewport: the Canvas is lazy-mounted
 *   on first intersection and switches to `frameloop="demand"` (paused) once it
 *   scrolls away, so several cards on one page stay cheap on CPU/GPU.
 * - If the file is missing or fails to load, it degrades to `fallback`
 *   (the decorative hex placeholder) instead of breaking the page.
 */

function useInView(ref, rootMargin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

const isObj = (url) => /\.obj($|\?)/i.test(url || "");

/** GLB / glTF — loads with color & textures intact. */
function GltfContent({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/** OBJ — geometry only (no PBR), so apply a clean clay material to read well. */
function ObjContent({ url }) {
  const object = useLoader(OBJLoader, url);
  const prepared = useMemo(() => {
    object.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({
          color: "#cdd2dc",
          roughness: 0.85,
          metalness: 0.04,
        });
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return object;
  }, [object]);
  return <primitive object={prepared} />;
}

function SpinModel({ url, spin }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current && spin) group.current.rotation.y += delta * 0.5;
  });
  return (
    <group ref={group}>
      <Bounds fit clip observe margin={1.15}>
        <Center>
          {isObj(url) ? <ObjContent url={url} /> : <GltfContent url={url} />}
        </Center>
      </Bounds>
    </group>
  );
}

/** Catches a failed model load (missing file, bad GLB) and shows the fallback. */
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

function SoftLighting() {
  return (
    <SafeBoundary fallback={null}>
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.0} position={[0, 4, 2]} scale={[10, 4, 1]} />
        <Lightformer intensity={1.3} position={[-5, 1, 2]} scale={[8, 3, 1]} color="#cfe0ff" />
        <Lightformer intensity={1.3} position={[5, 1, 2]} scale={[8, 3, 1]} color="#ffe9d6" />
        <Lightformer intensity={1.6} position={[0, 2, -6]} scale={[10, 5, 1]} />
      </Environment>
    </SafeBoundary>
  );
}

function Spinner() {
  return (
    <Html center>
      <Loader2 className="h-6 w-6 animate-spin text-brand-violet" />
    </Html>
  );
}

export default function ShowcaseModel({ url, fallback = null }) {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef);
  const [mounted, setMounted] = useState(false);

  // Lazy-mount the WebGL canvas the first time the card becomes visible.
  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  if (!url) return fallback;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {mounted ? (
        <SafeBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 1.5]}
            frameloop={inView ? "always" : "demand"}
            camera={{ position: [0, 0, 3.2], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.6} />
            <SoftLighting />
            <Suspense fallback={<Spinner />}>
              <SpinModel url={url} spin={inView} />
            </Suspense>
          </Canvas>
        </SafeBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
