import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { formatCategory } from "../../utils/common";

export default function RelatedPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-10 pt-7 border-t border-neutral-200/70 dark:border-neutral-800/70">
      <h3 className="text-[0.98rem] font-display font-semibold mb-4 text-neutral-950 dark:text-neutral-50">
        Continue reading
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to={`/post/${p.slug}`}
            className="group block rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80
                       bg-white dark:bg-neutral-900 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-primary font-semibold">
                {formatCategory(p.category)}
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors" />
            </div>

            <h4 className="mt-1 text-sm font-semibold text-neutral-950 dark:text-neutral-50 group-hover:text-primary transition-colors line-clamp-2">
              {p.title}
            </h4>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
              {p.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}