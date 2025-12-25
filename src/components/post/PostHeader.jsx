import { motion } from "framer-motion";

export default function PostHeader({ title, category, date, summary, readingTime }) {
  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-6">
      {/* Category / breadcrumb feel */}
      <div className="mb-3 text-xs sm:text-[0.78rem] text-neutral-500 flex flex-wrap items-center gap-x-2 gap-y-1">
        {category && (
          <span className="uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-400">
            {category}
          </span>
        )}
      </div>

      <motion.h1
        className="text-[2.2rem] sm:text-[2.5rem] md:text-[2.8rem] font-semibold leading-[1.08] tracking-tight text-neutral-900 dark:text-neutral-50"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] sm:text-sm text-neutral-600 dark:text-neutral-400">
        <span>{date}</span>
        <span className="text-neutral-400">·</span>
        <span>{readingTime} min read</span>
      </div>

      {summary && (
        <p className="mt-5 max-w-2xl text-[1rem] sm:text-[1.05rem] leading-[1.7] text-neutral-700 dark:text-neutral-300">
          {summary}
        </p>
      )}
    </section>
  );
}
