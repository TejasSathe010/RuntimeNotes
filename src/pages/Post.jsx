import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPostBySlug, getPosts } from "../utils/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark-dimmed.css";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

/** Helper used both for TOC and heading IDs */
const slugifyHeading = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Code block renderer for markdown
 * - Nice header bar (language + copy button)
 * - Good spacing and readable font size
 * - Keeps inline <code> simple and readable
 */
// helper to extract plain text from react-markdown children
function extractText(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(node.props.children);
  }
  return "";
}

function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toUpperCase() : "CODE";

  const [copied, setCopied] = useState(false);

  const plainText = extractText(children);

  // robust inline detection:
  // - trust react-markdown's `inline` if present
  // - otherwise: no language + no newline => treat as inline
  const isInline = inline ?? (!match && !plainText.includes("\n"));

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800
                   text-[0.9em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="mt-6 mb-8 rounded-xl overflow-hidden border border-neutral-200/70 dark:border-neutral-800/70 bg-[#0d1117] shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-neutral-800 text-[0.7rem] text-neutral-400">
        <div className="flex gap-1.5 items-center">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 uppercase tracking-wide text-neutral-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-100 transition-colors"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Code body – IMPORTANT: render real children, not String(children) */}
      <pre className="p-4 sm:p-5 text-[0.88rem] text-zinc-50 leading-[1.7] overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}



/**
 * Custom markdown renderers tuned for a “real world” blog feel:
 * - comfortable line length
 * - generous line height
 * - clear hierarchy
 * - soft colors
 */
const markdownComponents = {
  h1: ({ children, ...props }) => {
    const text = String(children);
    const id = slugifyHeading(text);
    return (
      <h1
        id={id}
        {...props}
        className="scroll-mt-32 mt-10 mb-6 text-[2rem] sm:text-[2.2rem] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    const text = String(children);
    const id = slugifyHeading(text);

    return (
      <h2
        id={id}
        {...props}
        className="group scroll-mt-28 mt-12 mb-4 flex items-baseline gap-2 text-[1.4rem] sm:text-[1.5rem] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
      >
        <span className="inline-block w-1 h-6 rounded-full bg-primary/75 mr-1" />
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="ml-1 opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-xs transition-opacity"
        >
          #
        </a>
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const text = String(children);
    const id = slugifyHeading(text);

    return (
      <h3
        id={id}
        {...props}
        className="group scroll-mt-24 mt-8 mb-2 text-[1.1rem] sm:text-[1.15rem] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="ml-1 opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-[0.7rem] transition-opacity"
        >
          #
        </a>
      </h3>
    );
  },

  // Body text: slightly larger, relaxed, with a narrow “column” feel
  p: ({ children, ...props }) => (
    <p
      {...props}
      className="my-5 max-w-[70ch] text-[0.98rem] sm:text-[1.02rem] leading-[1.85] tracking-[0.01em] text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </p>
  ),

  a: ({ children, href, ...props }) => {
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-[3px] decoration-primary/30 hover:decoration-primary"
      >
        {children}
        {isExternal && (
          <span className="ml-1 text-[0.6rem] align-super">↗</span>
        )}
      </a>
    );
  },

  strong: ({ children, ...props }) => (
    <strong
      {...props}
      className="font-semibold text-neutral-900 dark:text-neutral-50"
    >
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em
      {...props}
      className="italic text-neutral-800 dark:text-neutral-200 not-italic:font-normal"
    >
      {children}
    </em>
  ),

  // Softer, “documentation style” callout
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="mt-6 mb-8 max-w-[68ch] border-l-2 border-primary/60 bg-primary/5 dark:bg-neutral-900/70 px-5 py-4 rounded-r-xl text-[0.95rem] leading-[1.7] text-neutral-800 dark:text-neutral-50 space-y-2"
    >
      {children}
    </blockquote>
  ),

  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-5 ml-1 pl-5 space-y-2 text-[0.98rem] sm:text-[1.02rem] leading-[1.75] text-neutral-800 dark:text-neutral-100 list-disc marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="my-5 ml-1 pl-5 space-y-2 text-[0.98rem] sm:text-[1.02rem] leading-[1.75] text-neutral-800 dark:text-neutral-100 list-decimal marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      {...props}
      className="leading-[1.7] text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </li>
  ),

  // Tables with zebra rows & subtle borders
  table: ({ children, ...props }) => (
    <div className="my-7 w-full overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/70">
      <table
        {...props}
        className="min-w-full text-sm text-left border-collapse"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      {...props}
      className="bg-neutral-100/90 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </thead>
  ),
  tr: ({ children, ...props }) => (
    <tr
      {...props}
      className="even:bg-neutral-50/90 dark:even:bg-neutral-900/60"
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 font-semibold text-[0.85rem]"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-2 align-top text-[0.9rem]"
    >
      {children}
    </td>
  ),

  img: ({ alt, ...props }) => (
    <figure className="my-7">
      <img
        {...props}
        alt={alt}
        className="mx-auto max-h-[420px] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm object-contain"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {alt}
        </figcaption>
      )}
    </figure>
  ),

  hr: (props) => (
    <hr
      {...props}
      className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-neutral-300/80 dark:via-neutral-700 to-transparent"
    />
  ),

  code: CodeBlock,
};

export default function Post() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });
  const progressPercent = useTransform(scrollYProgress, (v) =>
    Math.round(v * 100)
  );
  const scrollHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Toggle scroll-to-top button
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      setShowScrollTop(v > 0.18);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // ---------- Fetch Post + Headings + Related ----------
  useEffect(() => {
    (async () => {
      const current = await getPostBySlug(slug);
      if (!current) return;
      setPost(current);

      // Extract H1/H2/H3 headings from markdown
      const matches = Array.from(
        current.content.matchAll(/^#{1,3}\s+(.*)$/gm)
      );

      const parsed = matches.map((m) => {
        const raw = m[1].trim();
        const level = m[0].startsWith("###")
          ? 3
          : m[0].startsWith("##")
          ? 2
          : 1;
        const id = slugifyHeading(raw);
        return { text: raw, level, id };
      });

      // ignore H1 in TOC
      setHeadings(parsed.filter((h) => h.level >= 2));

      const normalize = (s) =>
        s ? s.toLowerCase().replace(/\s+/g, "-") : "";
      const allPosts = await getPosts();
      const related = allPosts
        .filter(
          (p) =>
            p.slug !== slug &&
            (normalize(p.category) === normalize(current.category) ||
              current.tags?.some((tag) => p.tags?.includes(tag)))
        )
        .slice(0, 3);

      setRelatedPosts(related);
    })();
  }, [slug]);

  // ---------- ScrollSpy on headings ----------
  useEffect(() => {
    if (!post?.content || headings.length === 0) return;

    const elements = Array.from(
      document.querySelectorAll("article h2[id], article h3[id]")
    );
    if (elements.length === 0) return;

    const onScroll = () => {
      const scrollTop = window.scrollY + 140; // account for sticky header
      let currentId = elements[0].id;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el.offsetTop <= scrollTop) currentId = el.id;
        else break;
      }

      setActiveId(currentId);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post, headings]);

  const handleTocClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 dark:text-neutral-400 animate-pulse">
        Loading article…
      </div>
    );
  }

  const readingTime = Math.ceil(post.content.split(/\s+/).length / 220);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      {/* ---------- Reading progress bar at top ---------- */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-40"
        style={{ scaleX }}
      />

      {/* Mini scroll map (right side) */}
      <div className="fixed right-6 top-28 z-30 w-[2px] h-[70vh] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden hidden xl:block">
        <motion.div
          style={{
            height: scrollHeight,
            background:
              "linear-gradient(to bottom, rgb(66,133,244), rgb(52,168,83))",
          }}
        />
      </div>

      {/* ---------- % Read Badge ---------- */}
      <motion.div
        className="fixed bottom-8 right-8 z-40 bg-neutral-900/85 dark:bg-white/10 backdrop-blur-md text-white dark:text-neutral-100 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-neutral-700/40"
        style={{ opacity: scrollYProgress }}
      >
        <motion.span className="tabular-nums mr-1">
          {progressPercent}
        </motion.span>
        % read
      </motion.div>

      {/* ---------- Back-to-top button ---------- */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 left-8 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---------- Article Header ---------- */}
      <section className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 pb-8 text-center">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold font-display tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {post.title}
        </motion.h1>

        <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium flex flex-wrap gap-x-2 gap-y-1 justify-center items-center">
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-primary font-semibold">
            {post.category || "Architecture"}
          </span>
          <span className="text-neutral-400">•</span>
          <span>{readingTime} min read</span>
        </p>

        {post.summary && (
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {post.summary}
          </p>
        )}
      </section>

      {/* ---------- Main Layout ---------- */}
      <section className="pb-16 pt-4 px-4 sm:px-6 flex justify-center">
        <div className="relative w-full max-w-6xl flex gap-10 lg:gap-14 items-start">
          {/* ---------- Main Content Card ---------- */}
          <div className="relative flex-1 bg-white dark:bg-neutral-900/95 border border-neutral-200/70 dark:border-neutral-800/80 rounded-3xl shadow-[0_18px_55px_rgba(15,23,42,0.15)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.6)] px-5 sm:px-8 md:px-10 py-10 md:py-12 lg:py-14">
            {/* Subtle background gradient only at top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/6 via-transparent to-transparent rounded-t-3xl" />

            {/* ---------- Markdown Content ---------- */}
            <article className="relative z-10 mx-auto max-w-2xl sm:max-w-3xl text-[0.98rem] sm:text-[1.02rem] leading-[1.85] text-neutral-800 dark:text-neutral-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            {/* ---------- Share Section ---------- */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-primary/70 hover:text-primary transition-colors"
              >
                📋 Copy article link
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 hover:text-sky-400 transition-colors"
              >
                🐦 Share on X
              </a>
            </div>

            {/* ---------- Author Block ---------- */}
            <div className="mt-16 pt-8 border-t border-neutral-200/70 dark:border-neutral-800/70 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                ✍️ Written by{" "}
                <span className="font-semibold text-primary">
                  Tejas Sathe
                </span>
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500 tracking-wide">
                Exploring System Design, GenAI, and the craft of scalable
                engineering.
              </p>
            </div>

            {/* ---------- Related Posts ---------- */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-8 border-t border-neutral-200/70 dark:border-neutral-800/70">
                <h3 className="text-base sm:text-lg font-display font-semibold mb-6 text-neutral-900 dark:text-neutral-100">
                  Continue reading
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/post/${p.slug}`}
                      className="group block rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="text-[0.7rem] uppercase tracking-wide text-primary font-semibold mb-1">
                        {p.category || p.tags?.[0] || "Article"}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors line-clamp-2">
                        {p.title}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                        {p.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ---------- TOC Sidebar ---------- */}
          <aside className="hidden lg:block w-64 sticky top-24 self-start">
            <div className="border-l border-neutral-200 dark:border-neutral-800 pl-5 py-2">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-3">
                On this page
              </p>
              <nav className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleTocClick(h.id)}
                    className={`relative block w-full text-left py-1 pr-2 transition-colors ${
                      activeId === h.id
                        ? "text-primary font-semibold"
                        : "hover:text-primary/80"
                    } ${h.level === 3 ? "ml-4" : "ml-0"}`}
                  >
                    {activeId === h.id && (
                      <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary" />
                    )}
                    <span className="line-clamp-2">{h.text}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
