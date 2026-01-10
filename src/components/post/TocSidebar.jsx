import { useState, useMemo } from "react";
import { Command, Search, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "../../utils/common";

export default function TocSidebar({
  tocItems,
  activeId,
  showSubheads,
  sectionCopied,
  saved,
  onScrollToHeading,
  onCopySectionLink,
  onToggleShowSubheads,
  onOpenJump,
  onToggleSaved,
}) {
  const [tocFilter, setTocFilter] = useState("");

  const filteredToc = useMemo(() => {
    const q = tocFilter.trim().toLowerCase();
    const base = tocItems.filter((h) => (showSubheads ? true : h.level === 2));
    if (!q) return base;
    return base.filter((h) => (h.text || "").toLowerCase().includes(q));
  }, [tocFilter, tocItems, showSubheads]);

  if (tocItems.length === 0) return null;

  return (
    <aside className="hidden lg:block sticky top-24 self-start space-y-4">
      {/* Outline */}
      <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500">
              Outline
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
              {tocItems.find((t) => t.id === activeId)?.text || "Scroll to highlight sections"}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleShowSubheads}
            className="shrink-0 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-2.5 py-1 text-[0.72rem] font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
          >
            {showSubheads ? "H3: On" : "H3: Off"}
          </button>
        </div>

        {/* Filter */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={tocFilter}
            onChange={(e) => setTocFilter(e.target.value)}
            placeholder="Filter sections…"
            className="w-full rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/80 dark:bg-neutral-950/30 pl-9 pr-3 py-2 text-xs
                       text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-primary/35"
          />
        </div>

        <nav className="mt-3 max-h-[52vh] overflow-auto pr-1 space-y-1" aria-label="Outline">
          {filteredToc.map((h, idx) => {
            const active = h.id === activeId;
            const n = String(idx + 1).padStart(2, "0");

            return (
              <div key={h.id} className="group relative">
                <button
                  id={`toc-item-${h.id}`}
                  onClick={() => onScrollToHeading(h.id)}
                  type="button"
                  className={cn(
                    "w-full text-left rounded-xl px-2 py-2 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    h.level === 3 ? "ml-3" : "ml-0",
                    active
                      ? "bg-primary/7 dark:bg-primary/12 text-primary"
                      : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 hover:text-primary/90"
                  )}
                  aria-current={active ? "location" : undefined}
                >
                  <span className="flex items-start gap-2">
                    <span className="mt-[2px] tabular-nums text-[0.66rem] font-medium text-neutral-400/90 dark:text-neutral-500/90">
                      {n}
                    </span>
                    <span className={cn("text-[0.88rem] leading-[1.35] line-clamp-2", active && "font-semibold")}>
                      {h.text}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onCopySectionLink(h.id)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity
                             rounded-md px-2 py-1 text-[0.72rem] border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/90 dark:bg-neutral-900/70 text-neutral-700 dark:text-neutral-200
                             hover:border-primary/40 hover:text-primary"
                  aria-label="Copy section link"
                >
                  {sectionCopied === h.id ? "Copied" : "Copy"}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenJump}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Command className="h-4 w-4" />
            Jump
          </button>

          <button
            type="button"
            onClick={onToggleSaved}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </aside>
  );
}