import { motion, LayoutGroup } from "framer-motion";
import { cn } from "../../utils/common";

export default function CategoryFilters({ categories, categoryCounts, catKey, setCatKey }) {
  return (
    <LayoutGroup>
      <div className="relative flex gap-2 overflow-x-auto no-scrollbar py-1 pr-4">
        {categories.map((c) => {
          const active = catKey === c.key;
          const count = categoryCounts.get(c.key) ?? 0;

          return (
            <button
              key={c.key}
              onClick={() => setCatKey(c.key)}
              aria-pressed={active}
              className={cn(
                "relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "text-white dark:text-neutral-900"
                  : "text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-50",
                !active &&
                  "bg-neutral-100/90 hover:bg-neutral-200/70 dark:bg-neutral-900/50 dark:hover:bg-neutral-900"
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-cat"
                  className="absolute inset-0 rounded-full bg-neutral-900 dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 520, damping: 36 }}
                  aria-hidden="true"
                />
              )}

              <span className="relative inline-flex items-center gap-2">
                {c.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.72rem] font-semibold tabular-nums",
                    active
                      ? "bg-white/15 text-white dark:bg-neutral-900/15 dark:text-neutral-900"
                      : "bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  )}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}