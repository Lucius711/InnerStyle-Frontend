import { useState } from "react";
import {
  AlertTriangle,
  PersonStanding,
  Palette,
  Sparkles,
  Gauge,
  Brush,
  Footprints,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { TextInput, Segmented, Toggle } from "@/components/ui/FormControls";
import { REMESH_POLY_PRESETS, UV_UNWRAP_MAX_POLYCOUNT } from "@/lib/constants";
import { useT } from "@/hooks/useI18n";

const MODEL_TYPES = [
  "IMAGE_TO_3D",
  "MULTI_IMAGE_TO_3D",
  "TEXT_TO_3D_REFINE",
  "REMESH",
  "RETEXTURE",
  "UPLOADED",
];

/**
 * "Continue the pipeline" panel — refine / retexture / remesh / rig / animate a finished model.
 * Extracted from the Studio ResultPanel so it can live in the Creative Lab (and be reused).
 * `actions` + `busyAction` come from usePipelineActions; renders nothing when no action applies.
 */
export default function PipelinePanel({ task, actions = {}, busyAction }) {
  const t = useT();
  const [panel, setPanel] = useState(null); // 'retexture' | 'animate' | 'remesh' | null
  const [retexPrompt, setRetexPrompt] = useState("");
  const [actionId, setActionId] = useState(92);

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

  const isModel = MODEL_TYPES.includes(task.taskType);
  const canRefine = task.taskType === "TEXT_TO_3D_PREVIEW" && actions.onRefine;
  const canRemesh = isModel && actions.onRemesh;
  const canRetexture = isModel && actions.onRetexture;
  const canRig = isModel && actions.onRig;
  const canAnimate = task.taskType === "RIG" && actions.onAnimate;
  const hasActions = canRefine || canRemesh || canRetexture || canRig || canAnimate;

  if (!hasActions) return null;

  return (
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
              { label: t("studio.qHairBrown"), value: "only change the hair color to natural brown, keep the face, skin, outfit and all other colors exactly the same as the original" },
              { label: t("studio.qHairBlonde"), value: "only change the hair color to blonde, keep the face, skin, outfit and all other colors exactly the same as the original" },
              { label: t("studio.qClothesRed"), value: "only change the clothing color to red, keep the face, skin, hair and everything else exactly the same as the original" },
              { label: t("studio.qEyesBlue"), value: "only change the eye color to blue, keep the face, skin, hair, outfit and everything else exactly the same as the original" },
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
  );
}
