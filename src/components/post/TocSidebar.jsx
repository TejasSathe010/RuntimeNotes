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
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-500 font-semibold">
            Outline
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {tocItems.find((t) => t.id === activeId)?.text || "Scroll to highlight"}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleShowSubheads}
          className="shrink-0 h-7 rounded-md border border-neutral-200 dark:border-neutral-800
                       bg-neutral-50 dark:bg-neutral-800 px-2 text-xs font-medium
                       text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150"
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
          className="w-full h-9 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 pl-9 pr-3 text-sm
                       text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-transparent transition-all duration-150"
        />
      </div>

      <nav className="mt-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-1 space-y-1" aria-label="Outline">
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
                  "w-full text-left rounded-lg px-2 py-2 transition-all duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
                  h.level === 3 ? "ml-3" : "ml-0",
                  active
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}
                aria-current={active ? "location" : undefined}
              >
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 tabular-nums text-xs font-medium text-neutral-400 dark:text-neutral-500">
                    {n}
                  </span>
                  <span className={cn("text-sm leading-snug line-clamp-2", active && "font-semibold")}>
                    {h.text}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => onCopySectionLink(h.id)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity
                               rounded-md h-6 px-2 text-xs border border-neutral-200 dark:border-neutral-800
                               bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300
                               hover:border-neutral-300 dark:hover:border-neutral-700"
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
          className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 text-sm font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150"
        >
          <Command className="h-4 w-4" />
          Jump
        </button>

        <button
          type="button"
          onClick={onToggleSaved}
          className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 text-sm font-medium
                     text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150"
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}