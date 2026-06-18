import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "text-white shadow-glow bg-[linear-gradient(110deg,#7c5cff,#5b6cff,#22d3ee)] bg-[length:200%_auto] hover:bg-[position:right_center]",
  secondary: "text-app-text glass-strong hover:bg-app-line/10",
  ghost: "text-app-muted hover:bg-app-line/5 hover:text-app-text",
  outline:
    "text-app-text border border-app-line/15 hover:border-brand-violet/60 hover:bg-app-line/5",
  danger: "text-white bg-rose-500/90 hover:bg-rose-500",
};

const SIZES = {
  sm: "h-9 px-4 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-14 px-7 text-base rounded-2xl gap-2.5",
};

/**
 * Core button with built-in transition + loading state.
 * Use inside <MagneticButton> for the magnetic effect.
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    loading = false,
    disabled,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "focus-ring group relative inline-flex select-none items-center justify-center font-semibold transition-all duration-300 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-55",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
      )}
      {children}
      {!loading && IconRight && (
        <IconRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
});

export default Button;
