import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, XCircle, ArrowUpRight } from "lucide-react";
import Fuse from "fuse.js";
import { getPosts } from "../utils/posts";
import ArchitecturalMesh from "../components/ArchitecturalMesh";
import ParticleField from "../components/ParticleField";

const CATEGORIES = ["All", "System Design", "GenAI", "DSA"];

export default function Home() {
  const reduceMotion = useReducedMotion();

  const posts = useMemo(() => getPosts(), []);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const normalizedPosts = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        normalizedCategory:
          p.category?.trim().toLowerCase().replace(/\s+/g, "-") ?? "uncategorized",
      })),
    [posts]
  );

  const normalizedFilter =
    filter === "All" ? "all" : filter.trim().toLowerCase().replace(/\s+/g, "-");

  const fuse = useMemo(
    () =>
      new Fuse(normalizedPosts, {
        keys: ["title", "summary", "category", "tags"],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [normalizedPosts]
  );

  const filteredPosts = useMemo(() => {
    let list = normalizedPosts;

    if (normalizedFilter !== "all") {
      list = list.filter((p) => p.normalizedCategory === normalizedFilter);
    }

    if (query.trim()) {
      list = fuse.search(query.trim()).map((r) => r.item);
    }

    return list;
  }, [normalizedPosts, normalizedFilter, query, fuse]);

  const featured = posts?.find((p) => p.featured) ?? posts?.[0] ?? null;

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-950 dark:to-surface-dark transition-colors duration-700">
      {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
        {/* Background effects (behind everything) */}
        {!reduceMotion && (
          <div className="pointer-events-none absolute inset-0 z-0">
            {/* Particles on all screens */}
            <ParticleField quality="auto" />
            {/* Mesh is heavier; show from sm+ */}
            <div className="hidden sm:block">
              <ArchitecturalMesh quality="auto" />
            </div>
          </div>
        )}

        {/* Soft overlay (above canvas, below content) */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/55 via-white/35 to-white/60 dark:from-neutral-950/55 dark:via-neutral-950/25 dark:to-neutral-950/55" />

        {/* Content */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-14 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% to-[#EA4335] bg-clip-text text-transparent">
            Daily Tech Chronicles
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-neutral-700/90 dark:text-neutral-300 leading-relaxed">
            Deep dives into <strong>System Design</strong>, <strong>GenAI</strong>, and{" "}
            <strong>DSA</strong> — real engineering insights, written for builders.
          </p>

          {/* Search + Filters */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-3xl">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/80 dark:bg-neutral-900/60 backdrop-blur
                             px-11 py-3 text-sm sm:text-[0.95rem]
                             text-neutral-900 dark:text-neutral-50
                             placeholder:text-neutral-400
                             shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Search articles"
                />
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                    aria-label="Clear search"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Filters (mobile scroll, desktop centered) */}
              <div className="flex items-center justify-start sm:justify-center">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-1">
                  {CATEGORIES.map((cat) => {
                    const active = filter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        aria-pressed={active}
                        className={[
                          "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                          active
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70 dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        ].join(" ")}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Small meta line */}
            <p className="mt-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {filteredPosts.length} article{filteredPosts.length === 1 ? "" : "s"}{" "}
              {query.trim() ? "matched" : "available"}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ---------- FEATURED ---------- */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white dark:bg-neutral-900 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

            <Link to={`/post/${featured.slug}`} className="relative block p-6 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-primary">
                  Featured
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Read <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {featured.title}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                {featured.summary}
              </p>
            </Link>
          </motion.div>
        </section>
      )}

      {/* ---------- GRID ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 mt-16">
            No posts found.
          </p>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <AnimatePresence>
              {filteredPosts.map((p) => (
                <motion.article
                  key={p.slug}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  className="group relative rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white dark:bg-neutral-900
                             p-6 shadow-sm hover:shadow-md
                             transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[0.7rem] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {p.category ?? "Uncategorized"}
                    </span>

                    {p.date && (
                      <span className="text-[0.7rem] text-neutral-500 dark:text-neutral-400">
                        {new Date(p.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/post/${p.slug}`}
                    className="mt-4 block font-display text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-50
                               group-hover:text-primary transition-colors"
                  >
                    {p.title}
                  </Link>

                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                    {p.summary}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {p.tags?.slice(0, 2)?.join(" • ") || "Notes"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-200">
                      Read <ArrowUpRight className="h-4 w-4 opacity-70" />
                    </span>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </main>
  );
}
