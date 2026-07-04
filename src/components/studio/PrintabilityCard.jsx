import { useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2, Wrench, Gauge } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

/** A single label/value row. `bad` highlights the value red when it's a problem. */
function Row({ label, value, bad }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-app-muted">{label}</span>
      <span className={bad ? "font-semibold text-rose-400" : "font-semibold text-app-text"}>
        {value}
      </span>
    </div>
  );
}

/**
 * 3D-print readiness panel (like Meshy's): on demand, analyses the model (watertight / volume /
 * holes / non-manifold) and offers a one-click auto-repair that fixes the model IN PLACE — the
 * existing download button then serves the repaired mesh (no separate file download here).
 *
 * Reusable via injected calls so it works for both a user's task and a staff order:
 *  - `checkFn()`   -> Promise<PrintabilityResponse>            (analyse)
 *  - `repairFn()`  -> Promise<{ before, after, task? }>        (repair in place)
 *  - `onRepaired()` (optional) -> refresh the model/viewer after an in-place repair.
 */
export default function PrintabilityCard({ checkFn, repairFn, onRepaired }) {
  const { t } = useI18n();
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      setReport(await checkFn());
    } catch (err) {
      toast.error(t("studio.printCheckFail"), friendly(err));
    } finally {
      setChecking(false);
    }
  };

  const fix = async () => {
    setFixing(true);
    try {
      const res = await repairFn();
      const after = res?.after || res || {};
      setReport((r) => ({
        ...(r || {}),
        watertight: after.watertight,
        holes: after.holes,
        nonManifoldEdges: after.nonManifoldEdges,
        triangles: after.triangles,
      }));
      onRepaired?.();
      toast.success(
        t("studio.fixedTitle"),
        after.watertight ? t("studio.fixedBody") : t("studio.fixedPartial")
      );
    } catch (err) {
      toast.error(t("studio.fixFail"), friendly(err));
    } finally {
      setFixing(false);
    }
  };

  const printable = report?.watertight;

  return (
    <div className="rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-medium text-app-text">
          <Gauge className="h-4 w-4 text-brand-violet" /> {t("studio.printability")}
        </h4>
        {report && (
          <Badge tone={printable ? "emerald" : "amber"}>
            {printable ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {printable ? t("studio.printable") : t("studio.notPrintable")}
          </Badge>
        )}
      </div>

      {!report ? (
        <Button
          variant="secondary"
          size="sm"
          icon={checking ? Loader2 : Gauge}
          loading={checking}
          className="mt-3 w-full"
          onClick={check}
        >
          {t("studio.printCheck")}
        </Button>
      ) : (
        <>
          <div className="mt-2 divide-y divide-app-line/10">
            <Row label={t("studio.watertight")} value={report.watertight ? t("studio.yes") : t("studio.no")} bad={!report.watertight} />
            <Row label={t("studio.volume")} value={`${Number(report.volume || 0).toFixed(2)}`} />
            <Row label={t("studio.holes")} value={report.holes} bad={report.holes > 0} />
            <Row label={t("studio.nonManifold")} value={report.nonManifoldEdges} bad={report.nonManifoldEdges > 0} />
            <Row label={t("studio.triangles")} value={Number(report.triangles || 0).toLocaleString()} />
          </div>

          {!printable && (
            <Button
              size="sm"
              icon={fixing ? Loader2 : Wrench}
              loading={fixing}
              className="mt-3 w-full"
              onClick={fix}
            >
              {t("studio.autoFix")}
            </Button>
          )}
          {printable && (
            <p className="mt-3 text-center text-xs text-emerald-400">{t("studio.printableNote")}</p>
          )}
        </>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-app-faint">{t("studio.printabilityNote")}</p>
    </div>
  );
}
