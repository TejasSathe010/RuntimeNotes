import { useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, X, XCircle, Command, Check, Hash, Clock, SlidersHorizontal } from "lucide-react";
import { cn } from "../../utils/common";
import { CATEGORY_PRESETS, READING_FILTERS, SORTS } from "../../utils/constants";

export default function CommandPalette({
  open,
  query,
  setQuery,
  catKey,
  setCatKey,
  sort,
  setSort,
  tagKeys,
  toggleTag,
  rt,
  setRt,
  categories,
  categoryCounts,
  tagCounts,
  hasAnyActive,
  metaText,
  onClose,
  onClearAll,
}) {
  const reduceMotion = useReducedMotion();
  const paletteRef = useRef(null);
  const paletteInputRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      paletteInputRef.current?.focus?.();
      paletteInputRef.current?.select?.();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = paletteRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll(
          'button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      const el = lastFocusedRef.current;
      el?.focus?.();
      lastFocusedRef.current = null;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-start justify-center px-4 sm:px-6 pt-20 sm:pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          ref={paletteRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={reduceMotion ? false : { y: 10, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 10, scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/90 dark:bg-neutral-950/85 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              <Command className="h-4 w-4 opacity-80" />
              Command Palette
              <span className="ml-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                (Esc to close)
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70
                         dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/50
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Close command palette"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search inside palette */}
          <div className="px-5 py-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                ref={paletteInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="w-full rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                           bg-white/85 dark:bg-neutral-900/60 px-11 py-3 text-sm
                           text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-primary/35"
                aria-label="Search posts"
              />
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                  aria-label="Clear search"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categories */}
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 p-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
                  Categories
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = catKey === c.key;
                    const count = categoryCounts.get(c.key) ?? 0;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCatKey(c.key)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                          "border border-neutral-200/70 dark:border-neutral-800/70",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          active
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "bg-white/70 text-neutral-700 hover:bg-white dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                        )}
                        aria-pressed={active}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : null}
                        {c.label}
                        <span className="tabular-nums text-[0.72rem] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort + reading */}
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 p-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
                  Sort & Length
                </p>

                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-950/30 px-3 py-2">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full bg-transparent text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none"
                      aria-label="Sort posts"
                    >
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reading filter */}
                  <div className="flex flex-wrap gap-2">
                    {READING_FILTERS.map((r) => {
                      const active = rt === r.key;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRt(r.key)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                            "border border-neutral-200/70 dark:border-neutral-800/70",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            active
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-white/70 text-neutral-700 hover:bg-white dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                          )}
                          aria-pressed={active}
                        >
                          <Clock
                            className={cn(
                              "h-3.5 w-3.5",
                              active
                                ? "text-white/90 dark:text-neutral-900/80"
                                : "text-neutral-500 dark:text-neutral-300"
                            )}
                          />
                          <span className={cn(active ? "text-white dark:text-neutral-900" : "")}>
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tags (full) */}
              <div className="md:col-span-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 p-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
                  Tags
                </p>

                <div className="mt-3 flex flex-wrap gap-2 max-h-[140px] overflow-auto no-scrollbar pr-1">
                  {Array.from(tagCounts.entries())
                    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                    .slice(0, 28)
                    .map(([key, count]) => {
                      const active = tagKeys.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleTag(key)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                            "border border-neutral-200/70 dark:border-neutral-800/70",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            active
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-white/70 text-neutral-700 hover:bg-white dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                          )}
                          aria-pressed={active}
                          title={`${count} posts`}
                        >
                          {active ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Hash className="h-3.5 w-3.5 opacity-70" />
                          )}
                          {startCaseFromKey(key)}
                          <span className="tabular-nums text-[0.72rem] opacity-75">{count}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{metaText}</div>

              <div className="flex items-center gap-2">
                {hasAnyActive && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/70 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold
                               text-neutral-700 dark:text-neutral-200 hover:text-primary hover:border-primary/30
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Clear all
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white
                             hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Done
                </button>
              </div>
            </div>

            <p className="mt-3 text-[0.78rem] text-neutral-500/85 dark:text-neutral-400/85">
              Pro tip: use tags for narrow intent; use length when you want a quick win.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}