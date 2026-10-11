import { useCallback, useEffect, useState } from "react";
import { Loader2, Paintbrush, Check, Undo2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { staffApi } from "@/lib/authApi";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

const RUNNING = ["PENDING", "IN_PROGRESS"];
const POLL_MS = 5000;

/**
 * Staff AI repaint of an order's model (Meshy Retexture styled on the original look), so repaired
 * holes get plausible colour/detail instead of a smear. Start -> wait -> preview -> apply (undoable).
 */
export default function RepaintPanel({ orderId }) {
  const t = useT();
  const toast = useToast();
  const [state, setState] = useState(null); // { task, applied }
  const [busy, setBusy] = useState("");

  const load = useCallback(() => staffApi.repaintStatus(orderId).then(setState).catch(() => {}), [orderId]);
  useEffect(() => {
    load();
  }, [load]);

  const task = state?.task;
  const running = task && RUNNING.includes(task.status);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [running, load]);

  const act = (name, fn, okMsg) => async () => {
    setBusy(name);
    try {
      setState(await fn(orderId));
      if (okMsg) toast.success(t(okMsg));
    } catch (err) {
      toast.error(t("staff.repaintFail"), friendly(err));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-app-text">
          <Paintbrush className="h-4 w-4 text-brand-violet" /> {t("staff.repaintTitle")}
        </span>
        {task && (
          <Badge tone={task.status === "SUCCEEDED" ? "emerald" : task.status === "FAILED" ? "rose" : "amber"}>
            {state.applied ? t("staff.repaintApplied") : running ? `${task.progress || 0}%` : task.status}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-[11px] text-app-faint">{t("staff.repaintHint")}</p>

      {task?.status === "SUCCEEDED" && task.thumbnailUrl && (
        <img src={api.mediaUrl(task.thumbnailUrl)} alt={t("staff.repaintTitle")} className="mt-2 h-28 rounded-xl object-contain" />
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {state?.applied ? (
          <Button size="sm" variant="ghost" icon={busy === "undo" ? Loader2 : Undo2} loading={busy === "undo"}
            onClick={act("undo", staffApi.undoRepaint, "staff.repaintUndone")}>
            {t("staff.repaintUndo")}
          </Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" icon={running || busy === "start" ? Loader2 : Paintbrush}
              loading={busy === "start"} disabled={running || !!busy}
              onClick={act("start", staffApi.startRepaint)}>
              {running ? t("staff.repaintRunning") : t("staff.repaintStart")}
            </Button>
            {task?.status === "SUCCEEDED" && (
              <Button size="sm" variant="primary" icon={Check} loading={busy === "apply"} disabled={!!busy}
                onClick={act("apply", staffApi.applyRepaint, "staff.repaintAppliedToast")}>
                {t("staff.repaintApply")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
