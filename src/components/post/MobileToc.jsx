import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/common";

export default function MobileToc({
  open,
  tocItems,
  activeId,
  showSubheads,
  reduceMotion,
  onOpen,
  onClose,
  onToggleShowSubheads,
  onOpenJump,
  onScrollToHeading,
  onScrollToTop,
}) {
  return (
    <>
      {tocItems.length > 0 && !open && (
        <button
          type="button"
          onClick={onOpen}
          className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[75]
                     rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/90 dark:bg-neutral-900/75 backdrop-blur px-4 py-2 shadow-lg
                     text-xs font-medium text-neutral-800 dark:text-neutral-100
                     hover:border-primary/40 hover:text-primary transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Open outline"
        >
          Outline •{" "}
          <span className="max-w-[170px] inline-block align-bottom truncate">
            {tocItems.find((t) => t.id === activeId)?.text || "Contents"}
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 max-h-[74vh] overflow-hidden
                         rounded-t-2xl border-t border-neutral-200/70 dark:border-neutral-800/70
                         bg-white dark:bg-neutral-950 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Outline"
            >
              <div className="px-4 pt-4 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Outline</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-3 py-1 text-xs border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleShowSubheads}
                    className="rounded-full px-3 py-1 text-xs border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200"
                  >
                    {showSubheads ? "H3: On" : "H3: Off"}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenJump}
                    className="rounded-full px-3 py-1 text-xs border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200"
                  >
                    Jump
                  </button>

                  <button
                    type="button"
                    onClick={onScrollToTop}
                    className="ml-auto rounded-full px-3 py-1 text-xs border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200"
                  >
                    Top
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-auto">
                <div className="space-y-1">
                  {tocItems
                    .filter((h) => (showSubheads ? true : h.level === 2))
                    .map((h) => {
                      const active = h.id === activeId;
                      return (
                        <button
                          key={h.id}
                          onClick={() => {
                            onScrollToHeading(h.id);
                            onClose();
                          }}
                          type="button"
                          className={cn(
                            "w-full text-left rounded-xl px-3 py-2 transition",
                            h.level === 3 ? "ml-3" : "ml-0",
                            active
                              ? "bg-primary/10 dark:bg-primary/14 text-primary font-semibold"
                              : "text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50"
                          )}
                        >
                          <span className="text-[0.95rem] leading-[1.35]">{h.text}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}