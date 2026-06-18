import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Counts up to `value` when scrolled into view.
 */
export default function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  duration = 1.6,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    if (reduce) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${format(value, decimals)}${suffix}`;
      }
      return;
    }
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${format(latest, decimals)}${suffix}`;
      }
    });
  }, [spring, decimals, prefix, suffix, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(0, decimals)}
      {suffix}
    </span>
  );
}

function format(n, decimals) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}
