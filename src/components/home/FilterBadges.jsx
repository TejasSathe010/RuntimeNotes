import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FilterBadges({ activeBadges, onRemoveBadge }) {
  if (!activeBadges || activeBadges.length === 0) return null;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="flex flex-wrap items-center gap-2 justify-center"
      >
        {activeBadges.map((b) => (
          <span
            key={`${b.kind}:${b.value}`}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/70 dark:bg-neutral-900/60 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300"
          >
            {b.label}
            <button
              type="button"
              onClick={() => onRemoveBadge(b.kind, b.value)}
              className="rounded-full p-0.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
              aria-label={`Remove filter: ${b.label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}