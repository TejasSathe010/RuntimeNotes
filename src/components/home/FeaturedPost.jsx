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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70
                   bg-white dark:bg-neutral-900 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(66,133,244,0.12),transparent_55%),radial-gradient(circle_at_85%_45%,rgba(52,168,83,0.10),transparent_55%),radial-gradient(circle_at_50%_95%,rgba(234,67,53,0.08),transparent_55%)]" />

        <Link
          to={`/post/${post.slug}`}
          className="relative block p-6 sm:p-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-3xl"
          onClick={() => {
            const next = addToLocalArray(STORAGE_KEYS.RECENTS, post.slug);
            onPostClick?.(next);
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[0.7rem] font-semibold text-primary dark:bg-primary/15">
                Featured
              </span>
              {post?.categoryLabel && (
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[0.7rem] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  {post.categoryLabel}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              {post?.date ? <span className="tabular-nums">{formatDate(post.date)}</span> : null}
              <span className="h-4 w-px bg-neutral-200/70 dark:bg-neutral-800/70" />
              <span className="tabular-nums">
                {post.__readingMin || readingMinutesFromContent(post?.content || "")} min
              </span>
              <span className="h-4 w-px bg-neutral-200/70 dark:bg-neutral-800/70" />
              <span className="inline-flex items-center gap-1">
                Read <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <h2 className="mt-4 font-display font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 text-[clamp(1.4rem,2.1vw,2.15rem)] leading-[1.2]">
            {post.title}
          </h2>

          <p className="mt-3 text-sm sm:text-[0.98rem] text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {post.summary}
          </p>
        </Link>
      </motion.div>
    </section>
  );
}