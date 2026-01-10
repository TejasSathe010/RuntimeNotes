import { useRef, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, X, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "../../utils/common";

export default function JumpPalette({
  open,
  tocItems,
  showSubheads,
  saved,
  onClose,
  onJump,
  onToggleSaved,
}) {
  const reduceMotion = useReducedMotion();
  const jumpInputRef = useRef(null);
  const [jumpQuery, setJumpQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => jumpInputRef.current?.focus?.(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const jumpResults = useMemo(() => {
    const q = jumpQuery.trim().toLowerCase();
    const filtered = !q
      ? tocItems
      : tocItems.filter((h) => (h.text || "").toLowerCase().includes(q));
    return filtered
      .filter((h) => (showSubheads ? true : h.level === 2))
      .slice(0, 12);
  }, [jumpQuery, tocItems, showSubheads]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[96]">
        <motion.div
          className="absolute inset-0 bg-black/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          className="absolute left-1/2 top-[18%] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden
                     rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white dark:bg-neutral-950 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Jump to section"
        >
          <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 p-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                ref={jumpInputRef}
                value={jumpQuery}
                onChange={(e) => setJumpQuery(e.target.value)}
                placeholder="Jump to section…"
                className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400
                           focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setJumpQuery("");
                  onClose();
                }}
                className="rounded-full p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70
                           dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Tip: type to filter • press <span className="font-semibold">Enter</span> to jump
            </p>
          </div>

          <div className="max-h-[46vh] overflow-auto p-2">
            {jumpResults.length === 0 ? (
              <div className="p-4 text-sm text-neutral-600 dark:text-neutral-300">
                No matches.
              </div>
            ) : (
              <div className="space-y-1">
                {jumpResults.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      onJump(h.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2 transition",
                      "hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "text-sm",
                          h.level === 3
                            ? "text-neutral-700 dark:text-neutral-200"
                            : "text-neutral-900 dark:text-neutral-50 font-medium"
                        )}
                      >
                        {h.text}
                      </span>
                      <span className="text-[0.72rem] text-neutral-500 dark:text-neutral-400">
                        {h.level === 3 ? "H3" : "H2"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 p-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleSaved}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                         border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/80 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-200
                         hover:border-primary/40 hover:text-primary transition-colors"
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                         bg-neutral-900 text-white hover:bg-neutral-800
                         dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Done <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}