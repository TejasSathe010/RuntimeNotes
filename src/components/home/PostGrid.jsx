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
      <div className="text-center mt-16">
        <p className="text-neutral-900 dark:text-neutral-50 font-semibold">No posts found.</p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Try a different query, or clear filters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {posts.map((p) => {
        const isSaved = savedSlugs.includes(p.slug);
        const titleNode = typeof p.title === "string" ? p.title : (p.title || p.slug);
        const summaryNode = p.summary || null;
        const cover = p.cover || p.image || p.banner || p.hero || null;

        return (
          <motion.article
            key={p.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/15 transition" />

            {cover && (
              <div className="relative aspect-[16/9]">
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
              </div>
            )}

            <div className={cn("p-6", cover ? "pt-5" : "pt-6")}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[0.7rem] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  {p.categoryLabel || "Uncategorized"}
                </span>

                <span className="text-[0.72rem] tabular-nums text-neutral-500 dark:text-neutral-400">
                  {p.__readingMin} min
                </span>
              </div>

              <Link
                to={`/post/${p.slug}`}
                className="mt-4 block font-display text-[1.05rem] font-semibold leading-snug text-neutral-900 dark:text-neutral-50
                           group-hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
                aria-label={`Read article: ${typeof p.title === "string" ? p.title : p.slug}`}
                onClick={() => {
                  const next = addToLocalArray(STORAGE_KEYS.RECENTS, p.slug);
                  setRecentSlugs(next);
                }}
              >
                {titleNode}
              </Link>

              {summaryNode && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                  {summaryNode}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {p.date ? formatDate(p.date) : "Notes"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSaved(p.slug)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isSaved
                        ? "border-primary/30 bg-primary/10 text-primary dark:bg-primary/15"
                        : "border-neutral-200/70 bg-white/70 text-neutral-700 hover:bg-white dark:border-neutral-800/70 dark:bg-neutral-950/25 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    )}
                    aria-pressed={isSaved}
                    aria-label={isSaved ? "Unsave" : "Save for later"}
                    title={isSaved ? "Saved" : "Save for later"}
                  >
                    <Bookmark className="h-3.5 w-3.5 opacity-80" />
                    {isSaved ? "Saved" : "Save"}
                  </button>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-200">
                    Read <ArrowUpRight className="h-4 w-4 opacity-70" />
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}