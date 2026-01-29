import { useRef } from "react";
import { Search, XCircle, Command } from "lucide-react";
import { cn } from "../../utils/common";

export default function SearchBar({ query, setQuery, onOpenPalette }) {
  const searchRef = useRef(null);

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />

      <input
        ref={searchRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search… (press "/" or ⌘K)'
        className={cn(
          "w-full h-10 rounded-xl border border-neutral-200 dark:border-neutral-800",
          "bg-white dark:bg-neutral-900",
          "pl-10 pr-24 text-sm",
          "text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400",
          "shadow-xs",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-transparent",
          "transition-[border-color,box-shadow] duration-150"
        )}
        aria-label="Search articles"
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden sm:inline-flex items-center gap-1 h-7 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 transition-all duration-150"
          aria-label="Open command palette"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="tabular-nums">K</span>
        </button>

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 active:translate-y-px transition-colors"
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}