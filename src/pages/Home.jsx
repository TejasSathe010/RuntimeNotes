import { useEffect, useState, useMemo } from "react";
import { getPosts } from "../utils/posts";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import ArchitecturalMesh from "../components/ArchitecturalMesh";
import ParticleField from "../components/ParticleField";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const normalizedPosts = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        normalizedCategory: p.category
          ? p.category.trim().toLowerCase().replace(/\s+/g, "-")
          : "uncategorized",
      })),
    [posts]
  );

  const normalizedFilter =
    filter === "All" ? "all" : filter.trim().toLowerCase().replace(/\s+/g, "-");

  const filteredPosts = useMemo(() => {
    let list = [...normalizedPosts];

    if (normalizedFilter !== "all") {
      list = list.filter((p) => p.normalizedCategory === normalizedFilter);
    }

    if (query.trim()) {
      const fuse = new Fuse(list, {
        keys: ["title", "summary", "category"],
        threshold: 0.3,
      });
      list = fuse.search(query).map((r) => r.item);
    }

    return list;
  }, [normalizedPosts, normalizedFilter, query]);

  const categories = ["All", "System Design", "GenAI", "DSA"];
  const featured = posts.find((p) => p.featured) || posts[0];
  const remainingPosts = filteredPosts.filter((p) => p.slug !== featured?.slug);

  return (
    <main className="min-h-screen bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-900 dark:to-surface-dark transition-colors duration-700">
      {/* ---------- Hero Section ---------- */}
      <section className="relative overflow-hidden pt-28 pb-16 text-center">
        {/* ---------- Architectural Background ---------- */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Moving gradient energy */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(66,133,244,0.05),transparent_70%)] animate-pulse" />

          {/* Grid topology */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07] text-neutral-400 dark:text-neutral-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Pulsing architecture nodes */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] animate-pulse-slower" />
        </div>

        <ParticleField />

        <ArchitecturalMesh />

        {/* ---------- Hero Content ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10"
        >
          <h1 className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% via-[#FBBC05] to-[#EA4335] bg-clip-text text-transparent animate-gradient-x">
            Daily Tech Chronicles
          </h1>

          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Deep dives into <strong>GenAI</strong>, <strong>System Design</strong>, and{" "}
            <strong>DSA</strong> — decoding real-world architectures and engineering
            decisions.
          </p>

          {/* ---------- Search + Filters ---------- */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            {/* Search box */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 
                           bg-white/60 dark:bg-neutral-900/50 backdrop-blur-md shadow-sm text-sm 
                           focus:ring-2 focus:ring-primary/60 focus:outline-none transition 
                           placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-3 text-neutral-400 dark:text-neutral-500 text-sm hover:text-primary transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    filter === cat
                      ? "bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white shadow-md border-transparent"
                      : "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------- Featured Post ---------- */}
      {featured && (
        <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200/70 dark:border-neutral-800/70 shadow-md hover:shadow-lg transition-all duration-500"
          >
            <Link to={`/post/${featured.slug}`} className="block p-10 md:p-14 relative z-10">
              <p className="text-xs text-primary font-semibold tracking-wide uppercase mb-3">
                Featured Insight
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 dark:text-white mb-3 leading-snug">
                {featured.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mb-5">
                {featured.summary || featured.content.slice(0, 180) + "..."}
              </p>
              <span className="inline-flex items-center text-sm text-primary font-medium hover:underline underline-offset-4">
                Read full article →
              </span>
            </Link>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-70 pointer-events-none" />
          </motion.div>
        </section>
      )}

      {/* ---------- Post Grid ---------- */}
      <section id="posts" className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
        {loading ? (
          <div className="text-center text-neutral-500 mt-32 animate-pulse">
            Loading posts...
          </div>
        ) : filteredPosts.length > 0 ? (
          <motion.div
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <AnimatePresence>
              {filteredPosts.map((p) => (
                <motion.article
                  key={p.slug}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                    exit: { opacity: 0, scale: 0.95 },
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 180, damping: 15 },
                  }}
                  className="relative group bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 
                             rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                             transition-all duration-500 overflow-hidden
                             before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-tr 
                             before:from-transparent before:via-white/2 dark:before:via-white/5 before:to-transparent 
                             before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_left,_rgba(66,133,244,0.12),transparent_70%),_radial-gradient(ellipse_at_bottom_right,_rgba(251,188,5,0.12),transparent_70%)]" />
                  <header className="relative z-10 mb-3">
                    <div className="flex items-center justify-between mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="capitalize">
                        {p.category?.replace("-", " ") || "General"}
                      </span>
                      <span>~{Math.ceil(p.content.split(/\s+/).length / 200)} min read</span>
                    </div>
                    <Link
                      to={`/post/${p.slug}`}
                      className="block text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary transition-colors leading-snug"
                    >
                      {p.title}
                    </Link>
                  </header>
                  <p className="relative z-10 text-sm text-neutral-700 dark:text-neutral-400 line-clamp-3 mb-5">
                    {p.summary}
                  </p>
                  <footer className="relative z-10 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-500">
                    <span>
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      to={`/post/${p.slug}`}
                      className="font-medium text-primary hover:underline underline-offset-4 transition"
                    >
                      Read more →
                    </Link>
                  </footer>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center text-neutral-500 mt-32">
            No posts found {query && `for “${query}”`} — try another search or category.
          </div>
        )}
      </section>
    </main>
  );
}
