import { useCallback, useEffect, useState } from "react";
import { Loader2, Images, RefreshCw } from "lucide-react";
import { Badge, Skeleton } from "@/components/ui/primitives";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import TaskCard from "@/components/studio/TaskCard";
import TaskDetailModal from "@/components/studio/TaskDetailModal";
import { Segmented } from "@/components/ui/FormControls";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";

const PAGE_SIZE = 12;

export default function Gallery() {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const filters = [
    { value: "", label: t("gallery.all") },
    { value: "SUCCEEDED", label: t("studio.status.SUCCEEDED") },
    { value: "IN_PROGRESS", label: t("studio.status.IN_PROGRESS") },
    { value: "FAILED", label: t("studio.status.FAILED") },
  ];

  const load = useCallback(
    async (p, status, append) => {
      try {
        setLoading(true);
        const res = await api.listTasks({ status: status || undefined, page: p, size: PAGE_SIZE });
        const content = res.content || [];
        setTasks((prev) => (append ? [...prev, ...content] : content));
        setLast(res.last !== false ? res.last : false);
        setPage(p);
      } catch (err) {
        toast.error(t("gallery.loadFail"), tServer(err.message));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    load(0, statusFilter, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div className="relative min-h-screen px-6 pb-24 pt-28">
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge tone="cyan" dot>
                <Images className="h-3 w-3" /> {t("gallery.badge")}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
                {t("gallery.title")} <span className="text-gradient">{t("gallery.titleHi")}</span>
              </h1>
              <p className="mt-2 max-w-lg text-app-muted">{t("gallery.subtitle")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => load(0, statusFilter, false)}
            >
              {t("gallery.refresh")}
            </Button>
          </div>
        </Reveal>

        <div className="mt-8 max-w-md">
          <Segmented name="galleryFilter" options={filters} value={statusFilter} onChange={setStatusFilter} />
        </div>

        {loading && tasks.length === 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-app-line/10 bg-app-line/[0.04] text-app-faint">
              <Images className="h-8 w-8" />
            </span>
            <p className="text-app-muted">{t("gallery.empty")}</p>
          </div>
        ) : (
          <>
            <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tasks.map((task) => (
                <StaggerItem key={task.id}>
                  <TaskCard task={task} onOpen={setSelected} />
                </StaggerItem>
              ))}
            </StaggerGroup>

            {!last && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => load(page + 1, statusFilter, true)}
                  loading={loading}
                  icon={loading ? Loader2 : undefined}
                >
                  {t("gallery.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <TaskDetailModal task={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
