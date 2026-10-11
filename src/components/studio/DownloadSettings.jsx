import { useEffect, useMemo, useState } from "react";
import { Download, Crown, Lock } from "lucide-react";
import { zipSync } from "three/examples/jsm/libs/fflate.module.js";
import { buildModelFiles } from "@/lib/modelExport";
import Button from "@/components/ui/Button";
import { Field, Segmented, Toggle, TextInput, SelectMenu } from "@/components/ui/FormControls";
import { api } from "@/lib/api";
import { membershipApi } from "@/lib/authApi";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

// Formats whose vertices the backend can resize (must match MeshTransformer.supportsResize).
const RESIZABLE = new Set(["stl", "obj"]);
const PRINT_FORMATS = new Set(["stl", "obj", "3mf", "ply"]);
const UNITS = ["cm", "mm"];

// Always-available download formats. GLB is the source; the rest are produced
// in-browser from the GLB when the server didn't generate them natively.
// 3MF is the standard slicer format (Bambu Studio, PrusaSlicer, Cura).
const DOWNLOAD_FORMATS = ["bundle", "glb", "obj", "stl", "3mf", "usdz", "ply"];


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

// Texture maps to bundle into the ZIP (proxy map name -> task.textureUrls[0] field).
const TEXTURE_MAPS = [
  ["base_color", "base_color"],
  ["metallic", "metallic"],
  ["normal", "normal"],
  ["roughness", "roughness"],
  ["emission", "emission"],
];

function urlExt(url, fallback = "png") {
  const m = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(url || "");
  return m ? m[1].toLowerCase() : fallback;
}

/** Fetch a task's texture maps (same-origin proxy) as ZIP entries: { "textures/<name>.<ext>": U8 }. */
async function fetchTextureFiles(task) {
  const tex0 = (task.textureUrls || [])[0];
  const files = {};
  if (!tex0) return files;
  for (const [proxyName, field] of TEXTURE_MAPS) {
    if (!tex0[field]) continue;
    try {
      const res = await fetch(api.textureUrl(task.id, proxyName));
      if (!res.ok) continue;
      files[`textures/${proxyName}.${urlExt(tex0[field])}`] = new Uint8Array(await res.arrayBuffer());
    } catch {
      /* skip a map that fails to fetch */
    }
  }
  return files;
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

  // Whether this task ships any PBR maps (so the export ZIP carries a textures/ folder).
  const hasTextures = useMemo(() => {
    const tex0 = (task.textureUrls || [])[0];
    return !!tex0 && Object.values(tex0).some(Boolean);
  }, [task.textureUrls]);

  // Default: the print pack, so a new user downloads something they can print right away.
  const [format, setFormat] = useState("bundle");
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
  // GLB also goes through the browser: Meshy GLBs often only link their colour map by an
  // expired URL, so the client embeds the shipped base_color map into it. Print formats too
  // (unless resized server-side): Meshy's native STL/OBJ are ~2 mm tall in a slicer, the
  // browser export stands them up at a real print height (prepareForPrint).
  const willConvert = format === "glb" || !serverHas || (PRINT_FORMATS.has(format) && !canResize);

  // Picking a format that can't be resized (GLB/3MF/USDZ/PLY) clears any pending resize, so the
  // height value can't linger and silently do nothing — it only ever applies to STL/OBJ.
  useEffect(() => {
    if (!resizable && resize) setResize(false);
  }, [resizable, resize]);

  const download = async () => {
    setBusy(true);
    try {
      if (willConvert) {
        // Convert from GLB in the browser, then bundle the model together with its colour/texture
        // maps into a ZIP — so every format downloads as a ZIP that carries the colour files.
        const [glbRes, texFiles] = await Promise.all([fetch(api.modelUrl(task.id, "glb")), fetchTextureFiles(task)]);
        if (!glbRes.ok) throw new Error(`Model download failed (${glbRes.status})`);
        const files = await buildModelFiles(await glbRes.arrayBuffer(), texFiles, format);
        const zipped = zipSync(files);
        triggerDownload(
          new Blob([zipped], { type: "application/zip" }),
          "application/zip",
          `innerstyle-model-${task.id.slice(0, 8)}.zip`
        );
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
      // The server returns a ZIP (model file + texture maps), streamed straight from Meshy.
      const blob = await api.exportModel(task.id, { format, heightMm, origin });
      triggerDownload(blob, "application/zip", `innerstyle-model-${task.id.slice(0, 8)}.zip`);
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
      {/* Resize (premium) — only meaningful for server-side STL/OBJ. For every other format we
          show a clear hint instead of interactive controls, so the height can't appear to apply. */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-app-text">{t("studio.resize")}</span>
          {!premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              <Crown className="h-3 w-3" /> Pro
            </span>
          )}
        </div>

        {resizable ? (
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
            description={t("studio.resizeDescription")}
          />
        ) : (
          <p className="rounded-xl border border-app-line/10 bg-app-line/[0.03] px-3 py-2 text-[11px] text-app-faint">
            {t("studio.resizeFormatHint")}
          </p>
        )}
      </div>

      {/* Height + unit + Origin — shown only when resize is actually active (STL/OBJ, Pro, toggled on) */}
      {canResize && (
        <>
          <Field label={t("studio.height")}>
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={1}
                step="0.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1"
              />
              <div className="w-24">
                <SelectMenu
                  value={unit}
                  onChange={setUnit}
                  options={UNITS.map((u) => ({ value: u, label: u }))}
                  searchable={false}
                />
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-line/10 bg-app-line/[0.03] text-app-faint" title={t("studio.aspectLocked")}>
                <Lock className="h-4 w-4" />
              </span>
            </div>
          </Field>

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
        </>
      )}

      {/* Format */}
      <Field label={t("studio.format")}>
        <SelectMenu
          value={format}
          onChange={setFormat}
          options={DOWNLOAD_FORMATS.map((f) => ({ value: f, label: f === "bundle" ? t("studio.bundleFormat") : f.toUpperCase() }))}
          searchable={false}
        />
        {willConvert && format !== "glb" && format !== "bundle" && (
          <p className="mt-1.5 text-[11px] text-app-faint">{t("studio.convertNote")}</p>
        )}
        {format === "stl" && hasTextures && (
          <p className="mt-1.5 text-[11px] text-app-faint">{t("studio.stlTextureNote")}</p>
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
