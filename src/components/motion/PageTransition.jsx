import { motion } from "framer-motion";

/**
 * Wraps a route's content with a fade/slide-in on enter. No exit animation on purpose: a
 * blocking exit (with AnimatePresence mode="wait") could leave the next page blank until a manual
 * reload. The new page mounts immediately and fades in.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
