import { motion } from "framer-motion";

export default function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[95]
                 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                 bg-white/85 dark:bg-neutral-950/80 backdrop-blur px-4 py-2 text-xs sm:text-sm
                 text-neutral-700 dark:text-neutral-200 shadow-lg"
      role="status"
      aria-live="polite"
    >
      {message}
    </motion.div>
  );
}