import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  PersonStanding,
  Palette,
  Sparkles,
  CheckCircle2,
  Gauge,
  Brush,
  Footprints,
  Printer,
  Wand2,
} from "lucide-react";
import ModelViewer from "@/components/three/ModelViewer";
import ModelEditor from "@/components/three/ModelEditor";
import Button from "@/components/ui/Button";
import { TextInput, Segmented, Toggle } from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/primitives";
import DownloadSettings from "./DownloadSettings";
import { REMESH_POLY_PRESETS, UV_UNWRAP_MAX_POLYCOUNT } from "@/lib/constants";
import { pickModelUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { printApi } from "@/lib/authApi";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

const MODEL_TYPES = ["IMAGE_TO_3D", "MULTI_IMAGE_TO_3D", "TEXT_TO_3D_REFINE", "REMESH", "RETEXTURE"];

export default function ResultPanel({ task, actions = {}, busyAction }) {
  const t = useT();
  const toast = useToast();
  const [panel, setPanel] = useState(null); // 'retexture' | 'animate' | 'remesh' | null
  const [retexPrompt, setRetexPrompt] = useState("");
  const [actionId, setActionId] = useState(92);
  const [printing, setPrinting] = useState("");
  const [editing, setEditing] = useState(false);

  // Remesh dialog state (mirrors Meshy's UV-unwrap / remesh panel).
  const [remeshTopology, setRemeshTopology] = useState("triangle");
  const [polyPreset, setPolyPreset] = useState(10000); // a preset value or "custom"
  const [customPoly, setCustomPoly] = useState(30000);
  const [uvUnwrap, setUvUnwrap] = useState(false);

  // UV unwrap is only possible on triangle meshes ≤ 40K faces, so enabling it
  // forces triangle topology and clamps the effective polycount.
  const effectiveTopology = uvUnwrap ? "triangle" : remeshTopology;
  const rawPolycount = polyPreset === "custom" ? Number(customPoly) || 0 : polyPreset;
  const effectivePolycount = uvUnwrap
    ? Math.min(rawPolycount, UV_UNWRAP_MAX_POLYCOUNT)
    : rawPolycount;
  const polyValid = effectivePolycount >= 100 && effectivePolycount <= 300000;

  const runRemesh = () =>
    actions.onRemesh(task, {
      topology: effectiveTopology,
      targetPolycount: effectivePolycount,
    });

  const orderPrint = async (provider) => {
    setPrinting(provider);
    try {
      const res = await printApi.placeOrder({ taskId: task.id, provider });
      if (res.payUrl) {
        window.location.href = res.payUrl; // redirect to VNPay / MoMo
      } else {
        toast.error(t("studio.printFailTitle"), "No payment URL returned.");
        setPrinting("");
      }
    } catch (err) {
      toast.error(t("studio.printFailTitle"), friendly(err));
      setPrinting("");
    }
  };

  if (task.status === "FAILED" || task.status === "CANCELED") {
    return <FailedState task={task} t={t} />;
  }

  const hasViewable =
    (task.modelUrls && Object.keys(task.modelUrls).length > 0) ||
    (task.animationUrls && Object.keys(task.animationUrls).length > 0);
  const viewerFormat = task.modelUrls?.gltf && !task.modelUrls?.glb ? "gltf" : "glb";
  const viewerUrl = hasViewable ? api.modelUrl(task.id, viewerFormat) : null;
  const best = pickModelUrl(task.modelUrls);
  const textures = (task.textureUrls || []).filter(Boolean);
  const animations = task.animationUrls ? Object.entries(task.animationUrls) : [];

  const isModel = MODEL_TYPES.includes(task.taskType);
  const canRefine = task.taskType === "TEXT_TO_3D_PREVIEW" && actions.onRefine;
  const canRemesh = isModel && actions.onRemesh;
  const canRetexture = isModel && actions.onRetexture;
  const canRig = isModel && actions.onRig;
  const canAnimate = task.taskType === "RIG" && actions.onAnimate;
  const hasActions = canRefine || canRemesh || canRetexture || canRig || canAnimate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <Badge tone="emerald">
          <CheckCircle2 className="h-3.5 w-3.5" /> {t("studio.modelReady")}
        </Badge>
        {typeof task.consumedCredits === "number" && (
          <span className="text-xs text-app-faint">
            {t("studio.credits", { n: task.consumedCredits })}
          </span>
        )}
      </div>

      <ModelViewer url={viewerUrl} thumbnailUrl={task.thumbnailUrl} className="aspect-square" />

      {hasViewable && viewerUrl && (
        <Button variant="secondary" icon={Wand2} className="w-full" onClick={() => setEditing(true)}>
          {t("editor.open")}
        </Button>
      )}

      {/* Downloads */}
      <div>
        <h4 className="mb-2.5 text-sm font-medium text-app-text">{t("studio.downloadSettings")}</h4>
        {task.modelUrls && Object.keys(task.modelUrls).length > 0 ? (
          <DownloadSettings task={task} />
        ) : (
          <p className="text-xs text-app-faint">{t("studio.noFiles")}</p>
        )}
        {best && (
          <p className="mt-2 text-[11px] text-app-faint">
            {t("studio.previewing", { fmt: best.format.toUpperCase() })}
          </p>
        )}
      </div>

      {/* Order a physical 3D print — pay directly via VNPay / MoMo */}
      {task.modelUrls && Object.keys(task.modelUrls).length > 0 && (
        <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-app-text">
            <Printer className="h-4 w-4 text-brand-violet" /> {t("studio.print3dTitle")}
          </p>
          <p className="mt-1 text-xs text-app-faint">{t("studio.print3dHint")}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" loading={printing === "VNPAY"} onClick={() => orderPrint("VNPAY")}>
              VNPay
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={printing === "MOMO"}
              onClick={() => orderPrint("MOMO")}
            >
              MoMo
            </Button>
          </div>
        </div>
      )}

      {animations.length > 0 && (
        <div>
          <h4 className="mb-2.5 text-sm font-medium text-app-text">{t("studio.animationOutputs")}</h4>
          <div className="flex flex-wrap gap-2">
            {animations.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" download>
                <Button variant="outline" size="sm" icon={Download}>{name}</Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {textures.length > 0 && (
        <div>
          <h4 className="mb-2.5 text-sm font-medium text-app-text">{t("studio.textureMaps")}</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {textures.flatMap((tex, ti) =>
              Object.entries(tex)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <a key={`${ti}-${k}`} href={v} target="_blank" rel="noreferrer" className="group">
                    <div className="aspect-square overflow-hidden rounded-xl border border-app-line/10 bg-app-elevated">
                      <img src={v} alt={k} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="mt-1 block truncate text-center text-[10px] text-app-faint">{t(`studio.tex.${k}`)}</span>
                  </a>
                ))
            )}
          </div>
        </div>
      )}

      {/* Continue the pipeline */}
      {hasActions && (
        <div className="space-y-3 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-app-text">
            <Sparkles className="h-4 w-4 text-brand-violet" /> {t("studio.continueTitle")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {canRefine && (
              <Button size="sm" variant="primary" icon={Palette} loading={busyAction === "refine"} onClick={() => actions.onRefine(task)}>
                {t("studio.addColor")}
              </Button>
            )}
            {canRetexture && (
              <Button size="sm" variant={panel === "retexture" ? "primary" : "secondary"} icon={Brush}
                onClick={() => setPanel((p) => (p === "retexture" ? null : "retexture"))}>
                {t("studio.retexture")}
              </Button>
            )}
            {canRemesh && (
              <Button size="sm" variant={panel === "remesh" ? "primary" : "secondary"} icon={Gauge}
                onClick={() => setPanel((p) => (p === "remesh" ? null : "remesh"))}>
                {t("studio.remesh")}
              </Button>
            )}
            {canRig && (
              <Button size="sm" variant="secondary" icon={PersonStanding} loading={busyAction === "rig"} onClick={() => actions.onRig(task)}>
                {t("studio.rigForAnim")}
              </Button>
            )}
            {canAnimate && (
              <Button size="sm" variant={panel === "animate" ? "primary" : "secondary"} icon={Footprints}
                onClick={() => setPanel((p) => (p === "animate" ? null : "animate"))}>
                {t("studio.animateAction")}
              </Button>
            )}
          </div>

          {panel === "remesh" && canRemesh && (
            <div className="space-y-4 rounded-xl border border-app-line/10 bg-app-line/[0.03] p-4">
              {/* Target polygon count */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-app-muted">
                  {t("studio.remeshPolycount")}
                </span>
                <Segmented
                  name="remeshPoly"
                  value={polyPreset}
                  onChange={setPolyPreset}
                  options={[
                    { value: "custom", label: t("studio.polyCustom") },
                    ...REMESH_POLY_PRESETS,
                  ]}
                />
                {polyPreset === "custom" && (
                  <TextInput
                    type="number"
                    min={100}
                    max={uvUnwrap ? UV_UNWRAP_MAX_POLYCOUNT : 300000}
                    step={1000}
                    value={customPoly}
                    placeholder={t("studio.polyCustomPlaceholder")}
                    onChange={(e) => setCustomPoly(e.target.value)}
                  />
                )}
              </div>

              {/* Topology */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-app-muted">
                  {t("studio.remeshTopology")}
                </span>
                <Segmented
                  name="remeshTopology"
                  value={effectiveTopology}
                  onChange={uvUnwrap ? () => {} : setRemeshTopology}
                  options={[
                    { value: "quad", label: "Quad" },
                    { value: "triangle", label: "Triangle" },
                  ]}
                />
              </div>

              {/* UV unwrap */}
              <Toggle
                label={t("studio.uvUnwrap")}
                description={t("studio.uvUnwrapDesc")}
                checked={uvUnwrap}
                onChange={setUvUnwrap}
              />
              {uvUnwrap && (
                <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("studio.uvUnwrapWarning")}
                </p>
              )}

              <Button
                size="md"
                icon={Gauge}
                loading={busyAction === "remesh"}
                disabled={!polyValid}
                onClick={runRemesh}
              >
                {t("studio.remesh")}
              </Button>
            </div>
          )}

          {panel === "retexture" && canRetexture && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-app-faint">{t("studio.retexQuick")}:</span>
                {[
                  { label: t("studio.qHairBrown"), value: "brown hair" },
                  { label: t("studio.qHairBlonde"), value: "blonde hair" },
                  { label: t("studio.qClothesRed"), value: "red clothes" },
                  { label: t("studio.qEyesBlue"), value: "blue eyes" },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() =>
                      setRetexPrompt((p) => (p.trim() ? `${p.trim()}, ${chip.value}` : chip.value))
                    }
                    className="rounded-lg border border-app-line/10 bg-app-line/[0.04] px-2.5 py-1 text-xs font-medium text-app-muted transition-colors hover:border-brand-violet/40 hover:text-app-text"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <TextInput
                  placeholder={t("studio.retexturePromptPh")}
                  value={retexPrompt}
                  maxLength={600}
                  onChange={(e) => setRetexPrompt(e.target.value)}
                />
                <Button
                  size="md"
                  loading={busyAction === "retexture"}
                  disabled={!retexPrompt.trim()}
                  onClick={() => actions.onRetexture(task, { textStylePrompt: retexPrompt.trim(), enablePbr: true })}
                >
                  {t("studio.apply")}
                </Button>
              </div>
            </div>
          )}

          {panel === "animate" && canAnimate && (
            <div className="flex items-end gap-2">
              <label className="flex-1">
                <span className="mb-1 block text-xs text-app-muted">{t("studio.actionId")}</span>
                <TextInput
                  type="number"
                  min={1}
                  value={actionId}
                  onChange={(e) => setActionId(e.target.value)}
                />
              </label>
              <Button
                size="md"
                loading={busyAction === "animate"}
                disabled={!actionId}
                onClick={() => actions.onAnimate(task, { actionId: Number(actionId) })}
              >
                {t("studio.apply")}
              </Button>
            </div>
          )}
        </div>
      )}

      <ModelEditor open={editing} url={viewerUrl} onClose={() => setEditing(false)} />
    </motion.div>
  );
}

function FailedState({ task, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-rose-500/30 bg-rose-500/5 p-10 text-center"
    >
      <motion.span
        initial={{ rotate: -10 }}
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 0.5 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400"
      >
        <AlertTriangle className="h-7 w-7" />
      </motion.span>
      <div>
        <p className="font-semibold text-app-text">
          {task.status === "CANCELED" ? t("studio.canceled") : t("studio.failed")}
        </p>
        <p className="mt-1 max-w-sm text-sm text-app-muted">{task.errorMessage || t("studio.failedBody")}</p>
      </div>
    </motion.div>
  );
}
