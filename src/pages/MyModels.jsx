import { useCallback, useEffect, useState } from "react";
import { Loader2, Images, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/primitives";
import Button from "@/components/ui/Button";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import TaskCard from "@/components/studio/TaskCard";
import TaskDetailModal from "@/components/studio/TaskDetailModal";
import { Segmented } from "@/components/ui/FormControls";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";

const PAGE_SIZE = 12;

/** "My 3D models" — every task the user has generated (moved here from the old Gallery). */
export default function MyModels() {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
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

  const handleDelete = async (task) => {
    const ok = await confirm({
      title: t("gallery.deleteConfirmTitle"),
      message: t("gallery.deleteConfirmMsg"),
      confirmLabel: t("gallery.delete"),
      cancelLabel: t("confirm.cancel"),
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((x) => x.id !== task.id));
      if (selected?.id === task.id) setSelected(null);
      toast.success(t("gallery.deleted"));
    } catch (err) {
      toast.error(t("gallery.deleteFail"), tServer(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-semibold text-app-text">{t("profile.models.title")}</h2>
          <p className="mt-1 max-w-lg text-sm text-app-muted">{t("profile.models.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => load(0, statusFilter, false)}>
          {t("gallery.refresh")}
        </Button>
      </div>

      <div className="mt-6 max-w-md">
        <Segmented name="modelsFilter" options={filters} value={statusFilter} onChange={setStatusFilter} />
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
                <TaskCard task={task} onOpen={setSelected} onDelete={handleDelete} />
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

      <TaskDetailModal task={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
