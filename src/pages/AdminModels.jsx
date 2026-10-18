import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Shapes } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { adminApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

// Mirrors ModelStatsService.CREATION_TYPES (FIGURE_BUILD = chibi figurine).
const TYPES = ["IMAGE_TO_3D", "MULTI_IMAGE_TO_3D", "TEXT_TO_3D_PREVIEW", "FIGURE_BUILD"];

/** Admin: how many 3D models were created, by creation method and by account. */
export default function AdminModels() {
  const t = useT();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState(null);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const [s, a] = await Promise.all([adminApi.modelSummary(), adminApi.modelAccounts()]);
      setSummary(s);
      setRows(a);
    } catch (err) {
      setRows([]);
      toast.error(t("models.loadFail"), friendly(err));
    }
  }, [t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const time = (v) => (v ? new Date(v).toLocaleString() : "–");

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-app-text">
            <Shapes className="h-6 w-6 text-brand-violet" /> {t("models.title")}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{t("models.subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} aria-label={t("staff.refresh")} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label={t("models.total")} value={summary?.totalModels ?? "–"} tone="text-emerald-400" />
        {TYPES.map((type) => (
          <Stat key={type} label={t(`studio.types.${type}`)} value={summary?.byType?.[type] ?? "–"} />
        ))}
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        {!rows ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-app-muted">{t("models.empty")}</p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs text-app-muted">
              <tr className="border-b border-app-line/10">
                <th className="px-4 py-3 font-medium">{t("models.account")}</th>
                {TYPES.map((type) => (
                  <th key={type} className="px-4 py-3 text-right font-medium">
                    {t(`studio.types.${type}`)}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">{t("models.totalCol")}</th>
                <th className="px-4 py-3 font-medium">{t("models.lastCreated")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId} className="border-b border-app-line/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-app-text">{r.fullName || "–"}</div>
                    <div className="text-xs text-app-faint">{r.email}</div>
                  </td>
                  {TYPES.map((type) => (
                    <td key={type} className="px-4 py-3 text-right text-app-muted">
                      {r.byType?.[type] ?? 0}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-medium text-app-text">{r.total}</td>
                  <td className="px-4 py-3 text-xs text-app-muted">{time(r.lastCreatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone = "text-app-text" }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-app-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </Card>
  );
}
