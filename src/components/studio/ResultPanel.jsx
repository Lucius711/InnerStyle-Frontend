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
} from "lucide-react";
import ModelViewer from "@/components/three/ModelViewer";
import Button from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/primitives";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { pickModelUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { useT } from "@/hooks/useI18n";

const MODEL_TYPES = ["IMAGE_TO_3D", "MULTI_IMAGE_TO_3D", "TEXT_TO_3D_REFINE", "REMESH", "RETEXTURE"];

export default function ResultPanel({ task, actions = {}, busyAction }) {
  const t = useT();
  const [panel, setPanel] = useState(null); // 'retexture' | 'animate' | null
  const [retexPrompt, setRetexPrompt] = useState("");
  const [actionId, setActionId] = useState(92);

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

      {/* Downloads */}
      <div>
        <h4 className="mb-2.5 text-sm font-medium text-app-text">{t("studio.download")}</h4>
        {task.modelUrls && Object.keys(task.modelUrls).length > 0 ? (
          <StaggerGroup className="flex flex-wrap gap-2">
            {Object.entries(task.modelUrls).map(([fmt, url]) => (
              <StaggerItem key={fmt}>
                <a href={url} target="_blank" rel="noreferrer" download>
                  <Button variant="secondary" size="sm" icon={Download}>
                    {fmt.toUpperCase()}
                  </Button>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <p className="text-xs text-app-faint">{t("studio.noFiles")}</p>
        )}
        {best && (
          <p className="mt-2 text-[11px] text-app-faint">
            {t("studio.previewing", { fmt: best.format.toUpperCase() })}
          </p>
        )}
      </div>

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
              <Button size="sm" variant="secondary" icon={Gauge} loading={busyAction === "remesh"}
                onClick={() => actions.onRemesh(task, { topology: "quad", targetPolycount: 50000 })}>
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

          {panel === "retexture" && canRetexture && (
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
