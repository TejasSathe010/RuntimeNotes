import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { formatDate, readingMinutesFromContent } from "../../utils/common";
import { addToLocalArray } from "../../utils/localStorage";
import { STORAGE_KEYS } from "../../utils/constants";

export default function FeaturedPost({ post, onPostClick }) {
  const reduceMotion = useReducedMotion();

  if (!post) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800
                   bg-white dark:bg-neutral-900 shadow-sm"
      >
        {/* Subtle accent gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/20" />

        <Link
          to={`/post/${post.slug}`}
          className="relative block p-6 sm:p-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-2xl"
          onClick={() => {
            const next = addToLocalArray(STORAGE_KEYS.RECENTS, post.slug);
            onPostClick?.(next);
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ring-1 ring-primary-100 dark:ring-primary-800/50">
                  Featured
                </span>
                {post?.categoryLabel && (
                  <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {post.categoryLabel}
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {post?.date ? <span className="tabular-nums">{formatDate(post.date)}</span> : null}
                <span className="h-0.5 w-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="tabular-nums">
                  {post.__readingMin || readingMinutesFromContent(post?.content || "")} min read
                </span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h2 className="font-display font-bold tracking-tight text-neutral-900 dark:text-white text-2xl sm:text-3xl leading-tight">
                {post.title}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {post.summary}
              </p>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-3 transition-all duration-200">
              Read article
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}