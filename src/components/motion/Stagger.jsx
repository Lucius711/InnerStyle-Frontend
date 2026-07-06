import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const container = (stagger, delay) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/** Parent that staggers its <StaggerItem> children as they scroll into view. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  amount = 0.2,
  once = true,
}) {
  // useInView (state-driven) instead of the declarative `whileInView` prop: on SPA
  // navigation the group is often already in the viewport at mount, where
  // `whileInView` + `once` can miss the intersection and leave children stuck hidden.
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
