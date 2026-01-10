import { motion, AnimatePresence } from "framer-motion";
import { Quote, X } from "lucide-react";

export default function QuoteBubble({ quote, copied, onCopy, onDismiss }) {
  if (!quote?.text) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: -10, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        className="fixed z-[92]"
        style={{
          left: Math.max(16, Math.min(window.innerWidth - 16, quote.x)),
          top: Math.max(16, quote.y),
          transform: "translate(-50%, -100%)",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/95 dark:bg-neutral-900/90 backdrop-blur px-3 py-2 shadow-lg"
        >
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                       bg-neutral-900 text-white hover:bg-neutral-800
                       dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Quote className="h-4 w-4" />
            {copied ? "Copied" : "Copy quote"}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center justify-center rounded-full p-2
                       text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70
                       dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-800/40
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}