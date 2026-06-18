import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ResultPanel from "./ResultPanel";
import TaskProgress from "./TaskProgress";
import { useTaskPolling } from "@/hooks/useTaskPolling";
import { usePipelineActions } from "@/hooks/usePipelineActions";
import { TERMINAL_STATUSES } from "@/lib/constants";

/** Full-screen modal that views a task and lets the user continue the pipeline. */
export default function TaskDetailModal({ task: initial, onClose }) {
  const { task, status, start } = useTaskPolling(3500);
  const { actions, busyAction } = usePipelineActions((next) => start(next));

  useEffect(() => {
    if (initial) start(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const current = task || initial;
  const isTerminal = !status || TERMINAL_STATUSES.includes(status);

  return (
    <AnimatePresence>
      {initial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong relative my-auto w-full max-w-lg rounded-3xl p-6 shadow-card"
          >
            <button
              type="button"
              onClick={onClose}
              className="focus-ring absolute right-4 top-4 z-10 rounded-lg p-1.5 text-app-faint transition hover:bg-app-line/10 hover:text-app-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {current && isTerminal ? (
              <ResultPanel task={current} actions={actions} busyAction={busyAction} />
            ) : (
              <TaskProgress task={current} startedAt={Date.now()} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
