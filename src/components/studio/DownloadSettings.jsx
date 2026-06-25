import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { Download, Crown, Lock, ChevronsUpDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Segmented, Toggle, TextInput } from "@/components/ui/FormControls";
import { api } from "@/lib/api";
import { membershipApi } from "@/lib/authApi";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

// Formats whose vertices the backend can resize (must match MeshTransformer.supportsResize).
const RESIZABLE = new Set(["stl", "obj"]);
const UNITS = ["cm", "mm"];

// Always-available download formats. GLB is the source; the rest are produced
// in-browser from the GLB when the server didn't generate them natively.
const DOWNLOAD_FORMATS = ["glb", "obj", "stl", "usdz", "ply"];

/** A compact native <select> styled to match the app's inputs. */
function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full appearance-none rounded-xl border border-app-line/10 bg-app-line/[0.03] px-3 py-2.5 text-sm text-app-text outline-none transition-colors hover:bg-app-line/[0.05]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-app-elevated text-app-text">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-faint" />
    </div>
  );
}

/** Load the model's GLB and re-export it to another format entirely in the browser. */
async function convertFromGlb(glbUrl, fmt) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(glbUrl);
  const scene = gltf.scene || gltf.scenes?.[0];
  scene.updateMatrixWorld(true);
  if (fmt === "obj") return { data: new OBJExporter().parse(scene), type: "text/plain" };
  if (fmt === "stl") return { data: new STLExporter().parse(scene, { binary: true }), type: "model/stl" };
  if (fmt === "usdz") return { data: await new USDZExporter().parseAsync(scene), type: "model/vnd.usdz+zip" };
  if (fmt === "ply") {
    return new Promise((resolve, reject) => {
      try {
        new PLYExporter().parse(
          scene,
          (res) => resolve({ data: res, type: "application/octet-stream" }),
          { binary: true }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
  throw new Error("unsupported");
}

function triggerDownload(data, type, filename) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * "Download settings" panel for a finished model. The format dropdown always offers
 * GLB/OBJ/STL/USDZ/PLY: formats the server generated are streamed directly (and can be
 * resized server-side for STL/OBJ on premium); the rest are converted in-browser from GLB.
 */
export default function DownloadSettings({ task }) {
  const { t, tServer } = useI18n();
  const toast = useToast();

  // Formats the backend actually has on file for this task.
  const serverFormats = useMemo(
    () => Object.keys(task.modelUrls || {}).map((f) => f.toLowerCase()),
    [task.modelUrls]
  );

  const [format, setFormat] = useState("glb");
  const [resize, setResize] = useState(false);
  const [height, setHeight] = useState("10");
  const [unit, setUnit] = useState("cm");
  const [origin, setOrigin] = useState("BOTTOM");
  const [premium, setPremium] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    membershipApi
      .me()
      .then((m) => {
        if (alive) setPremium(m?.status === "ACTIVE" && m?.planCode && m.planCode !== "FREE");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Resize is a server feature, so it only applies to STL/OBJ the server has natively.
  const serverHas = serverFormats.includes(format);
  const resizable = RESIZABLE.has(format) && serverHas;
  const canResize = resize && resizable && premium;
  const willConvert = !serverHas && format !== "glb";

  const download = async () => {
    setBusy(true);
    try {
      if (willConvert) {
        const { data, type } = await convertFromGlb(api.modelUrl(task.id, "glb"), format);
        triggerDownload(data, type, `model.${format}`);
        return;
      }

      let heightMm = null;
      if (canResize) {
        const h = Number(height);
        if (!h || h <= 0) {
          toast.error(t("studio.downloadFailTitle"), t("studio.heightInvalid"));
          return;
        }
        heightMm = unit === "cm" ? h * 10 : h;
      }
      const blob = await api.exportModel(task.id, { format, heightMm, origin });
      triggerDownload(blob, "application/octet-stream", `model.${format}`);
    } catch (err) {
      toast.error(t("studio.downloadFailTitle"), tServer(err.message) || friendly(err));
    } finally {
      setBusy(false);
    }
  };

  if (serverFormats.length === 0) {
    return <p className="text-xs text-app-faint">{t("studio.noFiles")}</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-4">
      {/* Resize toggle (premium) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-app-text">{t("studio.resize")}</span>
          {!premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              <Crown className="h-3 w-3" /> Pro
            </span>
          )}
        </div>
        <Toggle
          checked={canResize}
          onChange={(v) => {
            if (!premium) {
              toast.info(t("studio.resizeProOnly"), t("studio.resizeProHint"));
              return;
            }
            setResize(v);
          }}
          label={t("studio.resizeLabel")}
          description={
            !resizable ? t("studio.resizeFormatHint") : t("studio.resizeDescription")
          }
        />
      </div>

      {/* Height + unit */}
      <Field label={t("studio.height")}>
        <div className="flex items-center gap-2">
          <TextInput
            type="number"
            min={1}
            step="0.5"
            value={height}
            disabled={!canResize}
            onChange={(e) => setHeight(e.target.value)}
            className="flex-1"
          />
          <div className="w-24">
            <Select
              value={unit}
              onChange={setUnit}
              options={UNITS.map((u) => ({ value: u, label: u }))}
            />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-line/10 bg-app-line/[0.03] text-app-faint" title={t("studio.aspectLocked")}>
            <Lock className="h-4 w-4" />
          </span>
        </div>
      </Field>

      {/* Origin */}
      <Field label={t("studio.origin")}>
        <Segmented
          name="origin"
          value={origin}
          onChange={setOrigin}
          options={[
            { value: "BOTTOM", label: t("studio.originBottom") },
            { value: "CENTER", label: t("studio.originCenter") },
          ]}
        />
      </Field>

      {/* Format */}
      <Field label={t("studio.format")}>
        <Select
          value={format}
          onChange={setFormat}
          options={DOWNLOAD_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
        />
        {willConvert && (
          <p className="mt-1.5 text-[11px] text-app-faint">{t("studio.convertNote")}</p>
        )}
      </Field>

      <Button
        variant="primary"
        size="lg"
        icon={Download}
        loading={busy}
        onClick={download}
        className="w-full"
      >
        {t("studio.download")}
      </Button>
    </div>
  );
}
