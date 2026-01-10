import { Link } from "react-router-dom";
import { ArrowUpRight, History, Bookmark } from "lucide-react";
import { addToLocalArray } from "../../utils/localStorage";
import { STORAGE_KEYS } from "../../utils/constants";

export default function RecentSavedPosts({ recentPosts, savedPosts, onRecentClick }) {
  if (recentPosts.length === 0 && savedPosts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div className="grid gap-4 lg:grid-cols-2">
        {recentPosts.length > 0 && (
          <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                <History className="h-4 w-4 text-neutral-500" />
                Continue reading
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {recentPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/post/${p.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-950/25 px-4 py-3 hover:shadow-sm transition"
                  onClick={() => {
                    const next = addToLocalArray(STORAGE_KEYS.RECENTS, p.slug);
                    onRecentClick?.(next);
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-[0.72rem] uppercase tracking-[0.16em] text-primary font-semibold">
                      {p.categoryLabel}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-1">
                      {p.title}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {savedPosts.length > 0 && (
          <div className="rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                <Bookmark className="h-4 w-4 text-neutral-500" />
                Saved
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {savedPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/post/${p.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-950/25 px-4 py-3 hover:shadow-sm transition"
                >
                  <div className="min-w-0">
                    <div className="text-[0.72rem] uppercase tracking-[0.16em] text-primary font-semibold">
                      {p.categoryLabel}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-1">
                      {p.title}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}