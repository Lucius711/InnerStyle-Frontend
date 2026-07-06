import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

const DIRECTIONS = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 60, y: 0 },
  right: { x: -60, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Scroll-triggered reveal. Animates in once when it enters the viewport.
 *
 * Uses the `useInView` hook (state-driven) instead of the declarative `whileInView`
 * prop: on client-side (SPA) navigation the element is often already inside the
 * viewport at mount, and `whileInView` + `once` could miss that intersection and
 * leave the content stuck at opacity 0 (a blank page until a full reload). The hook
 * re-checks intersection after mount via React state, so already-visible content
 * reliably animates in.
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className,
  as = "div",
  amount = 0.3,
  once = true,
}) {
  const reduce = useReducedMotion();
  const offset = reduce ? DIRECTIONS.none : DIRECTIONS[direction] || DIRECTIONS.up;
  const MotionTag = motion[as] || motion.div;

  const ref = useRef(null);
  const inView = useInView(ref, { once, amount });

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </MotionTag>
  );
}
