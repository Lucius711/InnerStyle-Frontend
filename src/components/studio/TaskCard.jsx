import { motion } from "framer-motion";
import { Box, Clock } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { STATUS_META } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { useT } from "@/hooks/useI18n";

/** A single task tile for the gallery grid. */
export default function TaskCard({ task, onOpen }) {
  const t = useT();
  const meta = STATUS_META[task.status] || STATUS_META.PENDING;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(task)}
      whileHover={{ y: -4 }}
      className="group glass overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-glow"
    >
      <div className="relative aspect-square overflow-hidden bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:28px_28px] opacity-20" />
        {task.thumbnailUrl ? (
          <img
            src={task.thumbnailUrl}
            alt=""
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-app-faint">
            <Box className="h-9 w-9" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge tone={meta.tone}>{t(`studio.status.${task.status}`)}</Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-app-text">
          {t(`studio.types.${task.taskType}`)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-app-faint">
          <Clock className="h-3 w-3" /> {timeAgo(task.createdAt)}
        </p>
      </div>
    </motion.button>
  );
}
