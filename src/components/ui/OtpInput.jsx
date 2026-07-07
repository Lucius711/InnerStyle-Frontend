import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Segmented one-time-code input: `length` single-digit boxes that behave like a native OTP field.
 * Fully controlled via `value` (a string of digits) / `onChange`. Supports type-to-advance,
 * backspace-to-previous, arrow-key navigation, and pasting the whole code into any box.
 * `onComplete` fires once the last digit is filled (handy for auto-submit).
 */
export default function OtpInput({
  value = "",
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
  onComplete,
}) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const emit = (next) => {
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const focusAt = (i) => refs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const next = digits.slice();
    if (!raw) {
      next[i] = "";
      emit(next);
      return;
    }
    let idx = i;
    for (const c of raw.split("")) {
      if (idx >= length) break;
      next[idx++] = c;
    }
    emit(next);
    focusAt(idx);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.slice();
      if (digits[i]) {
        next[i] = "";
        emit(next);
      } else if (i > 0) {
        next[i - 1] = "";
        emit(next);
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    emit(text.split(""));
    focusAt(text.length);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          disabled={disabled}
          value={d}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "focus-ring h-14 w-full min-w-0 rounded-xl border text-center font-display text-2xl font-semibold text-app-text caret-brand-violet transition-all duration-200 focus:border-brand-violet/70 focus:bg-app-line/[0.06] disabled:opacity-50",
            d
              ? "border-brand-violet/60 bg-brand-violet/[0.08] shadow-glow"
              : "border-app-line/10 bg-app-line/[0.04]"
          )}
        />
      ))}
    </div>
  );
}
