import { motion, LayoutGroup } from "framer-motion";
import { cn } from "../../utils/common";

export default function CategoryFilters({ categories, categoryCounts, catKey, setCatKey }) {
  return (
    <LayoutGroup>
      <div className="relative flex overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex gap-2 mx-auto">
          {categories.map((c) => {
            const active = catKey === c.key;
            const count = categoryCounts.get(c.key) ?? 0;

            return (
              <button
                key={c.key}
                onClick={() => setCatKey(c.key)}
                aria-pressed={active}
                className={cn(
                  "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                  "active:translate-y-px transition-all duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
                  active
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-cat"
                    className="absolute inset-0 rounded-lg bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-800/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    aria-hidden="true"
                  />
                )}

                <span className="relative inline-flex items-center gap-2">
                  {c.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums transition-colors",
                      active
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    )}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}