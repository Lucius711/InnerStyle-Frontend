import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------- Field wrapper ---------------- */

export function Field({ label, hint, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label className="text-sm font-medium text-app-text">{label}</label>
          {hint && <span className="text-xs text-app-faint">{hint}</span>}
        </div>
      )}
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* ---------------- Text input / textarea ---------------- */

const inputBase =
  "w-full rounded-xl border border-app-line/10 bg-app-line/[0.04] px-4 py-3 text-sm text-app-text placeholder:text-app-faint transition-all duration-200 focus-ring focus:border-brand-violet/60 focus:bg-app-line/[0.06]";

export function TextInput({ className, ...props }) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={cn(inputBase, "min-h-[110px] resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

/* ---------------- Segmented control ---------------- */

export function Segmented({ options, value, onChange, name }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-1.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "focus-ring relative flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-app-text" : "text-app-muted hover:text-app-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${name}`}
                className="absolute inset-0 rounded-xl bg-[linear-gradient(110deg,#7c5cff,#5b6cff)] shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Toggle ---------------- */

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="focus-ring flex w-full items-center justify-between gap-4 rounded-xl border border-app-line/10 bg-app-line/[0.03] px-4 py-3 text-left transition-colors hover:bg-app-line/[0.05]"
    >
      <span>
        <span className="block text-sm font-medium text-app-text">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-app-faint">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-brand-violet" : "bg-app-line/15"
        )}
      >
        <motion.span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </span>
    </button>
  );
}

/* ---------------- Slider ---------------- */

export function Slider({ min, max, step, value, onChange, format, label }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-app-muted">{label || "Resolution"}</span>
        <span className="font-semibold text-app-text">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
        style={{
          background: `linear-gradient(90deg,#7c5cff ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
    </div>
  );
}

/* ---------------- Format chips (multi-select) ---------------- */

export function ChipMultiSelect({ options, value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "focus-ring rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
              active
                ? "border-brand-violet/60 bg-brand-violet/15 text-app-text shadow-glow"
                : "border-app-line/10 bg-app-line/[0.03] text-app-muted hover:border-app-line/25 hover:text-app-text"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
