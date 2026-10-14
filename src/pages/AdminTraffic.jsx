import { useCallback, useEffect, useState } from "react";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { adminApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

const RANGES = [7, 14, 30];

/** Admin: site visits per day, as a bar chart so days can be compared side by side. */
export default function AdminTraffic() {
  const t = useT();
  const toast = useToast();
  const [days, setDays] = useState(14);
  const [rows, setRows] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [online, setOnline] = useState(null);

  const load = useCallback(async () => {
    setRows(null);
    try {
      const [daily, active, onl] = await Promise.all([
        adminApi.dailyVisits(days),
        adminApi.activeAccounts(),
        adminApi.onlineUsers(),
      ]);
      setRows(daily);
      setAccounts(active);
      setOnline(onl);
    } catch (err) {
      setRows([]);
      toast.error(t("admin.loadFail"), friendly(err));
    }
  }, [days, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const max = Math.max(1, ...(rows || []).map((r) => Math.max(r.visits, r.newUsers)));
  const total = (rows || []).reduce((s, r) => s + r.visits, 0);
  const today = rows?.at(-1)?.visits ?? 0;
  const yesterday = rows?.at(-2)?.visits ?? 0;
  const diff = today - yesterday;
  const newToday = rows?.at(-1)?.newUsers ?? 0;

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-app-text">
            <BarChart3 className="h-6 w-6 text-brand-violet" /> {t("admin.title")}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{t("admin.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((n) => (
            <Button key={n} size="sm" variant={n === days ? "primary" : "ghost"} onClick={() => setDays(n)}>
              {n} {t("admin.days")}
            </Button>
          ))}
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} aria-label={t("staff.refresh")} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label={t("admin.today")} value={today} />
        <Stat
          label={t("admin.vsYesterday")}
          value={`${diff >= 0 ? "+" : ""}${diff}`}
          tone={diff >= 0 ? "text-emerald-400" : "text-rose-400"}
        />
        <Stat label={t("admin.total")} value={total} />
        <Stat label={t("admin.online")} value={online ?? "–"} tone="text-emerald-400" />
        <Stat label={t("admin.newToday")} value={newToday} tone="text-sky-400" />
        <Stat label={t("admin.activeAccounts")} value={accounts ?? "–"} />
      </div>

      <Card className="mt-6 p-6">
        {!rows ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
          </div>
        ) : (
          <ul className="flex h-64 items-end gap-1" aria-label={t("admin.title")}>
            {rows.map((r, i) => (
              <li key={r.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-app-muted">{r.visits}</span>
                <div className="flex h-full w-full items-end gap-0.5">
                  <div
                    className={`flex-1 rounded-t-md ${i === rows.length - 1 ? "bg-brand-violet" : "bg-brand-violet/40"}`}
                    style={{ height: `${(r.visits / max) * 85}%`, minHeight: 2 }}
                    title={`${r.date}: ${r.visits} ${t("admin.visits")}`}
                  />
                  <div
                    className="flex-1 rounded-t-md bg-emerald-400/70"
                    style={{ height: `${(r.newUsers / max) * 85}%`, minHeight: 2 }}
                    title={`${r.date}: ${r.newUsers} ${t("admin.newUsers")}`}
                  />
                </div>
                <span className="text-[10px] text-app-muted">{r.date.slice(5)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone = "text-app-text" }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-app-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value}</p>
    </Card>
  );
}
