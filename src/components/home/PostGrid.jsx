import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn, formatDate } from "../../utils/common";
import { addToLocalArray } from "../../utils/localStorage";
import { STORAGE_KEYS } from "../../utils/constants";

export default function PostGrid({ posts, savedSlugs, setRecentSlugs, onToggleSaved }) {
  const reduceMotion = useReducedMotion();

  if (posts.length === 0) {
    return (
      <div className="text-center mt-16 py-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <p className="text-neutral-900 dark:text-neutral-50 font-semibold text-lg">No posts found</p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, staggerChildren: 0.05 }}
    >
      {posts.map((p) => {
        const isSaved = savedSlugs.includes(p.slug);
        const titleNode = typeof p.title === "string" ? p.title : (p.title || p.slug);
        const summaryNode = p.summary || null;
        const cover = p.cover || p.image || p.banner || p.hero || null;

        return (
          <motion.article
            key={p.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 shadow-xs hover:shadow-sm hover:-translate-y-0.5
                       transition-all duration-200"
          >
            {/* Hover Highlight Ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-primary-500/10 transition-all duration-200" />

            {cover && (
              <div className="relative aspect-[16/9] overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            <div className={cn("flex flex-1 flex-col p-4", cover ? "pt-4" : "pt-5")}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {p.categoryLabel || "Notes"}
                </span>

                <span className="text-xs font-medium tabular-nums text-neutral-400 dark:text-neutral-500">
                  {p.__readingMin} min
                </span>
              </div>

              <Link
                to={`/post/${p.slug}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded"
                aria-label={`Read article: ${typeof p.title === "string" ? p.title : p.slug}`}
                onClick={() => {
                  const next = addToLocalArray(STORAGE_KEYS.RECENTS, p.slug);
                  setRecentSlugs(next);
                }}
              >
                <h3 className="font-display text-base font-bold leading-snug text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {titleNode}
                </h3>
              </Link>

              {summaryNode && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                  {summaryNode}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500 tabular-nums">
                  {p.date ? formatDate(p.date) : "Draft"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSaved(p.slug)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all duration-150",
                      "active:translate-y-px",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
                      isSaved
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    )}
                    aria-pressed={isSaved}
                    aria-label={isSaved ? "Unsave" : "Save for later"}
                  >
                    <Bookmark className={cn("h-3.5 w-3.5", isSaved ? "fill-current" : "")} />
                  </button>

                  <Link
                    to={`/post/${p.slug}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-primary-50 hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 active:translate-y-px transition-all duration-150"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}