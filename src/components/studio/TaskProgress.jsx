import { useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { STATUS_META } from "@/lib/constants";
import { useT } from "@/hooks/useI18n";

const RADIUS = 84;
const CIRC = 2 * Math.PI * RADIUS;

export default function TaskProgress({ task, startedAt }) {
  const t = useT();
  const [elapsed, setElapsed] = useState(0);
  const [shown, setShown] = useState(0);
  const count = useMotionValue(0);

  const status = task?.status || "PENDING";
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const progress = Math.max(
    task?.progress || 0,
    status === "PENDING" ? 3 : 0
  );

  const phases = [
    t("studio.phases.p0"),
    t("studio.phases.p1"),
    t("studio.phases.p2"),
    t("studio.phases.p3"),
    t("studio.phases.p4"),
  ];
  const phaseIndex = Math.min(
    phases.length - 1,
    Math.floor((progress / 100) * phases.length)
  );

  // Elapsed timer.
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.round((Date.now() - startedAt) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [startedAt]);

  // Smoothly tween the displayed % toward the latest backend value on each poll.
  useEffect(() => {
    const controls = animate(count, progress, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [progress, count]);

  const dashoffset = CIRC * (1 - shown / 100);

  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-8 py-6">
      {/* Circular progress */}
      <div className="relative flex h-56 w-56 items-center justify-center">
        {/* pulsing halo */}
        <motion.span
          className="absolute h-44 w-44 rounded-full bg-brand-violet/20 blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c5cff" />
              <stop offset="0.5" stopColor="#5b6cff" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* track */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="rgb(var(--app-line) / 0.12)"
            strokeWidth="12"
          />
          {/* progress */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashoffset}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>

        {/* center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-5xl font-bold text-app-text tabular-nums">
            {shown}
            <span className="text-2xl text-app-muted">%</span>
          </div>
          <span className="mt-1 font-mono text-xs text-app-faint">
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
            {String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* phase + status */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge tone={meta.tone} dot>
          <Loader2 className="h-3 w-3 animate-spin" /> {t(`studio.status.${status}`)}
        </Badge>
        <motion.p
          key={phaseIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-medium text-app-text"
        >
          {phases[phaseIndex]}…
        </motion.p>
        <p className="text-xs text-app-faint">{t("studio.takesTime")}</p>

        {/* stepped phase dots */}
        <div className="mt-1 flex items-center gap-1.5">
          {phases.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= phaseIndex
                  ? "w-6 bg-brand-violet"
                  : "w-1.5 bg-app-line/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
