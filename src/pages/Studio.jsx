import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Type, Cuboid, RefreshCw, Sparkles } from "lucide-react";
import { Segmented } from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/primitives";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import ImageTo3DForm from "@/components/studio/ImageTo3DForm";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TaskProgress from "@/components/studio/TaskProgress";
import ResultPanel from "@/components/studio/ResultPanel";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { usePipelineActions } from "@/hooks/usePipelineActions";
import { useToast } from "@/hooks/useToast";
import { useI18n } from "@/hooks/useI18n";
import { TERMINAL_STATUSES } from "@/lib/constants";

export default function Studio() {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const [mode, setMode] = useState("image");
  const [startedAt, setStartedAt] = useState(null);
  const { task, status, isPolling, start, reset } = useTaskPolling(3500);

  const handleCreated = (created) => {
    setStartedAt(Date.now());
    start(created);
  };

  const { actions, busyAction } = usePipelineActions(handleCreated);

  const modes = [
    { value: "image", label: t("studio.modeImage") },
    { value: "text", label: t("studio.modeText") },
  ];

  useEffect(() => {
    if (!task) return;
    if (status === "SUCCEEDED") {
      toast.success(t("toast.readyTitle"), t("toast.readyBody"));
    } else if (status === "FAILED") {
      toast.error(t("toast.failTitle"), tServer(task.errorMessage) || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const isTerminal = status && TERMINAL_STATUSES.includes(status);
  const showWorkspace = Boolean(task);

  const startOver = () => {
    reset();
    setStartedAt(null);
  };

  return (
    <div className="relative min-h-screen px-6 pb-24 pt-28">
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge tone="violet" dot>
                <Sparkles className="h-3 w-3" /> {t("studio.badge")}
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
                {t("studio.title")} <span className="text-gradient">{t("studio.titleHi")}</span>
              </h1>
              <p className="mt-2 max-w-lg text-app-muted">{t("studio.subtitle")}</p>
            </div>
            {showWorkspace && (
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={startOver}>
                {t("studio.startOver")}
              </Button>
            )}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,460px)_1fr]">
          <Reveal direction="up" delay={0.05}>
            <div className="glass rounded-3xl p-6">
              <div className="mb-6 max-w-xs">
                <Segmented name="mode" options={modes} value={mode} onChange={setMode} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "image" ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "image" ? 16 : -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {mode === "image" ? (
                    <ImageTo3DForm onCreated={handleCreated} disabled={isPolling} />
                  ) : (
                    <TextTo3DForm onCreated={handleCreated} disabled={isPolling} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="glass min-h-[460px] rounded-3xl p-6">
              <AnimatePresence mode="wait">
                {!showWorkspace ? (
                  <IdleState key="idle" mode={mode} t={t} />
                ) : isTerminal ? (
                  <motion.div key="result" exit={{ opacity: 0 }}>
                    <ResultPanel task={task} actions={actions} busyAction={busyAction} />
                  </motion.div>
                ) : (
                  <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TaskProgress task={task} startedAt={startedAt || Date.now()} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function IdleState({ mode, t }) {
  const Icon = mode === "image" ? ImageIcon : Type;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-h-[420px] flex-col items-center justify-center gap-5 text-center"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-app-line/10 bg-app-line/[0.03]"
      >
        <Cuboid className="h-11 w-11 text-brand-violet/80" />
        <motion.span
          className="absolute inset-0 rounded-3xl border border-brand-violet/30"
          animate={{ scale: [1, 1.15], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </motion.div>
      <div>
        <p className="text-lg font-semibold text-app-text">{t("studio.idleTitle")}</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-app-muted">
          {mode === "image" ? t("studio.idleImage") : t("studio.idleText")}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-app-faint">
        <Icon className="h-4 w-4" /> {mode === "image" ? t("studio.modeImage") : t("studio.modeText")}
      </div>
    </motion.div>
  );
}
