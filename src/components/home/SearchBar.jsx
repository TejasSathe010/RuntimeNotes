import { useRef } from "react";
import { Search, XCircle, Command } from "lucide-react";
import { cn } from "../../utils/common";

export default function SearchBar({ query, setQuery, onOpenPalette }) {
  const searchRef = useRef(null);

  return (
    <div className="relative group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />

      <input
        ref={searchRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search… (press "/" or ⌘K)'
        className={cn(
          "w-full rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70",
          "bg-white/85 dark:bg-neutral-900/60 backdrop-blur",
          "px-11 pr-28 py-3 text-sm sm:text-[0.95rem]",
          "text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400",
          "shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
          "focus:outline-none focus:ring-2 focus:ring-primary/35",
          "group-hover:border-neutral-300/80 dark:group-hover:border-neutral-700/80 transition-colors"
        )}
        aria-label="Search articles"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 px-2.5 py-1 text-[0.72rem] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-white dark:hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Open command palette"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="tabular-nums">K</span>
        </button>

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-md p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
            aria-label="Clear search"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}