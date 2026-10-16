import { ClipboardList, CreditCard, Printer, Truck, PackageCheck, XCircle, Copy } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";

/** Order-progress steps, in order. CANCELLED is shown as a banner instead of a step. */
const STEPS = [
  { status: "PENDING", icon: ClipboardList },
  { status: "PAID", icon: CreditCard },
  { status: "IN_PRODUCTION", icon: Printer },
  { status: "SHIPPED", icon: Truck },
  { status: "COMPLETED", icon: PackageCheck },
];

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Shopee-style tracking: a 5-step progress bar, the carrier + tracking code, and the timeline of
 * updates (newest first). `data` is the API's PrintOrderTrackingResponse.
 */
export default function OrderTracking({ data }) {
  const t = useT();
  const toast = useToast();
  if (!data) return null;

  const events = data.events || [];
  const cancelled = data.status === "CANCELLED";
  // furthest step reached, from the timeline (a cancelled order keeps the steps it passed)
  const reached = Math.max(0, ...events.map((e) => STEPS.findIndex((s) => s.status === e.status)), STEPS.findIndex((s) => s.status === data.status));
  const firstAt = (status) => events.find((e) => e.status === status)?.at;
  const noteText = (note) => (note?.startsWith("system.") ? t(`tracking.notes.${note.slice(7)}`) : note);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.trackingCode);
      toast.success(t("tracking.copied"), data.trackingCode);
    } catch {
      /* clipboard blocked: the code is selectable text anyway */
    }
  };

  return (
    <div className="space-y-4">
      {cancelled ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/5 px-3 py-2 text-sm text-rose-400">
          <XCircle className="h-4 w-4 shrink-0" /> {t("tracking.cancelled")}
        </div>
      ) : (
        <ol className="grid grid-cols-5 gap-1">
          {STEPS.map((s, i) => {
            const done = i <= reached;
            const Icon = s.icon;
            const at = firstAt(s.status);
            return (
              <li key={s.status} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span
                    className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${i <= reached ? "bg-emerald-400" : "bg-app-line/15"}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    done ? "border-emerald-400 bg-emerald-400/10 text-emerald-400" : "border-app-line/15 bg-app-surface text-app-faint"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className={`mt-2 text-[11px] font-medium leading-tight sm:text-xs ${done ? "text-app-text" : "text-app-faint"}`}>
                  {t(`tracking.steps.${s.status}`)}
                </span>
                {done && at && <span className="mt-0.5 hidden text-[10px] text-app-faint sm:block">{fmt(at)}</span>}
              </li>
            );
          })}
        </ol>
      )}

      {(data.carrier || data.trackingCode) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-app-line/[0.04] px-3 py-2 text-sm">
          {data.carrier && (
            <span className="text-app-muted">
              {t("tracking.carrier")}: <b className="font-semibold text-app-text">{data.carrier}</b>
            </span>
          )}
          {data.trackingCode && (
            <span className="flex items-center gap-1.5 text-app-muted">
              {t("tracking.trackingCode")}: <b className="select-all font-mono font-semibold text-app-text">{data.trackingCode}</b>
              <button type="button" onClick={copy} className="rounded p-1 text-app-faint hover:text-app-text" aria-label={t("tracking.copy")}>
                <Copy className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-app-faint">{t("tracking.empty")}</p>
      ) : (
        <ol className="relative ml-1.5 space-y-4 border-l border-app-line/15 pl-5">
          {[...events].reverse().map((e, i) => (
            <li key={`${e.at}-${i}`} className="relative">
              <span
                className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-app-surface ${
                  i === 0 ? (e.status === "CANCELLED" ? "bg-rose-400" : "bg-emerald-400") : "bg-app-line/30"
                }`}
                aria-hidden
              />
              <p className={`text-sm font-medium ${i === 0 ? (e.status === "CANCELLED" ? "text-rose-400" : "text-emerald-400") : "text-app-text"}`}>
                {t(`tracking.status.${e.status}`)}
              </p>
              {e.note && <p className="mt-0.5 whitespace-pre-wrap text-sm text-app-muted">{noteText(e.note)}</p>}
              <p className="mt-0.5 text-xs text-app-faint">{fmt(e.at)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
