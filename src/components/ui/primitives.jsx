import { cn } from "@/lib/utils";

/* ---------------- Badge / Pill ---------------- */

const BADGE_TONES = {
  violet: "text-brand-violet bg-brand-violet/10 border-brand-violet/25",
  cyan: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/25",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  rose: "text-rose-400 bg-rose-400/10 border-rose-400/25",
  slate: "text-app-text bg-app-line/5 border-app-line/15",
};

export function Badge({ tone = "violet", className, children, dot = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        BADGE_TONES[tone],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

/* ---------------- Card ---------------- */

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("glass rounded-3xl shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-app-line/[0.06]",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-app-line/10 to-transparent" />
    </div>
  );
}

/* ---------------- Progress (animated, gradient) ---------------- */

export function Progress({ value = 0, className }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-app-line/10", className)}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#7c5cff,#5b6cff,#22d3ee)] bg-[length:200%_auto] animate-gradient-pan transition-[width] duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionEyebrow({ children, className }) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-[0.25em] text-brand-violet/90",
        className
      )}
    >
      {children}
    </span>
  );
}