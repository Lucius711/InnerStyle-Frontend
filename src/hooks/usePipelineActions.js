import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";

const TOAST_BY_KIND = {
  refine: "toast.refiningTitle",
  rig: "toast.riggingTitle",
  remesh: "toast.remeshingTitle",
  retexture: "toast.retexturingTitle",
  animate: "toast.animatingTitle",
};

/**
 * Shared "continue the pipeline" runner used by both the Studio and the Gallery.
 * `onCreated(task)` is called with the freshly-created follow-up task so the caller can
 * begin polling it.
 */
export function usePipelineActions(onCreated) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const [busyAction, setBusyAction] = useState(null);

  const chain = async (kind, fn) => {
    try {
      setBusyAction(kind);
      const next = await fn();
      toast.success(t(TOAST_BY_KIND[kind] || "toast.startedTitle"), t("toast.chainBody"));
      onCreated(next);
    } catch (err) {
      toast.error(t("toast.chainFailTitle"), tServer(err.message));
    } finally {
      setBusyAction(null);
    }
  };

  const actions = {
    onRefine: (tk) => chain("refine", () => api.refine({ sourceTaskId: tk.id, enablePbr: true })),
    onRemesh: (tk, opts) => chain("remesh", () => api.remesh({ sourceTaskId: tk.id, ...opts })),
    onRetexture: (tk, opts) => chain("retexture", () => api.retexture({ sourceTaskId: tk.id, ...opts })),
    onRig: (tk, opts) => chain("rig", () => api.rig({ sourceTaskId: tk.id, heightMeters: 1.7, ...opts })),
    onAnimate: (tk, opts) => chain("animate", () => api.animate({ rigTaskId: tk.id, ...opts })),
  };

  return { actions, busyAction };
}
