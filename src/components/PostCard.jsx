import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function PostCard({ post }) {
  const readingTime = Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 220));

  const categoryLabel = (post.category || "Uncategorized")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={`Read article: ${post.title}`}
    >
      <article
        className={[
          "relative h-full overflow-hidden rounded-2xl",
          "border border-neutral-200/70 dark:border-neutral-800/70",
          "bg-white dark:bg-neutral-900",
          "shadow-sm transition-all duration-300",
          "group-hover:-translate-y-1 group-hover:shadow-md",
        ].join(" ")}
      >
        {/* Subtle gradient accent (professional, not loud) */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -inset-24 bg-[radial-gradient(circle_at_30%_10%,rgba(66,133,244,0.18),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(52,168,83,0.14),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(234,67,53,0.10),transparent_55%)]" />
        </div>

        {/* Top hairline accent */}
        <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335] opacity-60" />

        <div className="relative flex h-full flex-col p-5 sm:p-6">
          {/* Meta row */}
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[0.7rem] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  {categoryLabel}
                </span>

                <span className="text-[0.75rem] text-neutral-500 dark:text-neutral-400">
                  {format(new Date(post.date), "PPP")}
                </span>
              </div>
            </div>

            <span className="shrink-0 text-[0.75rem] font-medium text-neutral-500 dark:text-neutral-400">
              {readingTime} min
            </span>
          </header>

          {/* Title */}
          <h2 className="mt-4 font-display text-lg sm:text-xl font-semibold leading-snug text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          {/* Summary */}
          <p className="mt-2 text-sm sm:text-[0.95rem] leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {post.summary}
          </p>

          {/* Footer */}
          <footer className="mt-5 flex items-center justify-between pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read more
              <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>

            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-primary/15">
              {format(new Date(post.date), "MMM d")}
            </span>
          </footer>
        </div>
      </article>
    </Link>
  );
}
