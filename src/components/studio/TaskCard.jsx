import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Box, Clock, MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { STATUS_META } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { useT } from "@/hooks/useI18n";

/** A single task tile for the gallery grid. Pass `onDelete` to show a "..." menu. */
export default function TaskCard({ task, onOpen, onDelete }) {
  const t = useT();
  const meta = STATUS_META[task.status] || STATUS_META.PENDING;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(task);
      }}
      whileHover={{ y: -4 }}
      className="group glass relative cursor-pointer overflow-hidden rounded-2xl text-left transition-shadow hover:shadow-glow"
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

        {onDelete && (
          <div className="absolute right-2 top-2" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-bg/60 text-app-muted opacity-0 backdrop-blur-md transition-all hover:text-app-text group-hover:opacity-100"
              aria-label={t("gallery.menu")}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="glass-strong absolute right-0 z-10 mt-1 w-36 rounded-xl p-1.5 shadow-card">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" /> {t("gallery.delete")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-app-text">
          {t(`studio.types.${task.taskType}`)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-app-faint">
          <Clock className="h-3 w-3" /> {timeAgo(task.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}
