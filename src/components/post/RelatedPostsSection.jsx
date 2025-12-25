import { Link } from "react-router-dom";

export default function RelatedPostsSection({ relatedPosts }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className="text-base sm:text-lg font-semibold mb-6 text-neutral-900 dark:text-neutral-100">
        Continue reading
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((p) => (
          <Link
            key={p.slug}
            to={`/post/${p.slug}`}
            className="group block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 sm:px-5 sm:py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-[0.7rem] uppercase tracking-[0.16em] text-neutral-500 mb-1">
              {p.category || p.tags?.[0] || "Article"}
            </div>
            <h4 className="text-sm sm:text-[0.98rem] font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-[#0b57d0] transition-colors line-clamp-2">
              {p.title}
            </h4>
            <p className="mt-2 text-xs sm:text-[0.85rem] text-neutral-600 dark:text-neutral-400 line-clamp-3">
              {p.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
