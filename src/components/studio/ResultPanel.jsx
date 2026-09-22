import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FlaskConical,
} from "lucide-react";
import ModelViewer from "@/components/three/ModelViewer";
import PrintabilityCard from "@/components/studio/PrintabilityCard";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import DownloadSettings from "./DownloadSettings";
import ShippingDialog from "./ShippingDialog";
import { pickModelUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { printApi } from "@/lib/authApi";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

const MODEL_TYPES = [
  "IMAGE_TO_3D",
  "MULTI_IMAGE_TO_3D",
  "TEXT_TO_3D_REFINE",
  "REMESH",
  "RETEXTURE",
  "UPLOADED",
];

export default function ResultPanel({ task, actions = {}, busyAction }) {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState("");
  const [shippingOpen, setShippingOpen] = useState(false);
  // Bumped after a base is baked server-side so the viewer reloads the updated mesh.
  const [modelVersion, setModelVersion] = useState(0);

  // Step 1: open the shipping form for the chosen payment method.
  // Step 2 (submitShipping): create the order with recipient + address, then redirect to pay.
  const submitShipping = async (payload) => {
    setPrinting(payload.provider);
    try {
      const res = await printApi.placeOrder({ taskId: task.id, ...payload });
      const pay = res.payment || {};
      if (pay.qrCode) {
        navigate("/wallet/payos-qr", { state: { ...pay, returnTo: window.location.pathname } });
      } else if (pay.payUrl) {
        window.location.href = pay.payUrl;
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
  const best = pickModelUrl(task.modelUrls);
  // The viewer picks the right three.js loader from the ?format= (glb/gltf/obj/fbx/stl), so we
  // can preview whatever native format the task has.
  const viewerFormat = best?.format || null;
  // Cache-bust the model proxy by the task's last-updated time (and by modelVersion for in-session
  // edits). The proxy sends a long Cache-Control, so without this a page refresh after editing
  // (e.g. adding a base) would serve the stale, pre-edit GLB from the browser cache.
  const modelVer = modelVersion || (task.updatedAt ? Date.parse(task.updatedAt) || "" : "");
  const viewerUrl = viewerFormat
    ? api.modelUrl(task.id, viewerFormat) + (modelVer ? `&v=${modelVer}` : "")
    : null;
  const textures = (task.textureUrls || []).filter(Boolean);
  // Fallback base-color URL: applied in the viewer if the GLB ships textures externally
  // (Meshy CDN lacks CORS, so the embedded reference would otherwise render grey).
  const baseColorUrl = textures[0]?.baseColor ? api.textureUrl(task.id, "base_color") : null;
  const animations = task.animationUrls ? Object.entries(task.animationUrls) : [];

  const isModel = MODEL_TYPES.includes(task.taskType);
  // Printability applies to any finished model with a viewable mesh — including the chibi figurine
  // (FIGURE_BUILD), which isn't in MODEL_TYPES (it doesn't take remesh/retexture/rig actions).
  const canCheckPrintability = (isModel || task.taskType === "FIGURE_BUILD") && hasViewable;

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

      <ModelViewer url={viewerUrl} thumbnailUrl={api.mediaUrl(task.thumbnailUrl)} baseColorUrl={baseColorUrl} className="aspect-square" />

      {hasViewable && viewerUrl && (
        <a href={`/lab/${task.id}`} className="block">
          <Button variant="secondary" icon={FlaskConical} className="w-full">
            {t("lab.openCta")}
          </Button>
        </a>
      )}

      {canCheckPrintability && (
        <PrintabilityCard
          checkFn={() => api.printability(task.id)}
          repairFn={() => api.repairModel(task.id)}
          revertFn={() => api.revertModel(task.id)}
          onRepaired={() => setModelVersion(Date.now())}
        />
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

      {/* Order a physical 3D print — pay directly via payOS */}
      {task.modelUrls && Object.keys(task.modelUrls).length > 0 && (
        <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-app-text">
            <Printer className="h-4 w-4 text-brand-violet" /> {t("studio.print3dTitle")}
          </p>
          <p className="mt-1 text-xs text-app-faint">{t("studio.print3dHint")}</p>
          <div className="mt-3">
            <Button
              size="sm"
              loading={!!printing}
              onClick={() => setShippingOpen(true)}
            >
              {t("studio.print3dCta")}
            </Button>
          </div>
        </div>
      )}

      <ShippingDialog
        open={shippingOpen}
        submitting={!!printing}
        onClose={() => setShippingOpen(false)}
        onSubmit={submitShipping}
      />

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
