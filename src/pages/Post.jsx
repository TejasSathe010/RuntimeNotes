// src/pages/Post.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  useReducedMotion,
} from "framer-motion";
import {
  ChevronLeft,
  Link2,
  ArrowUpRight,
  Share2,
  Twitter,
  Linkedin,
  Clock,
  Calendar,
  Tag,
  Sparkles,
} from "lucide-react";

/** ---------- Helpers ---------- */
const slugifyHeading = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");

function extractText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node.props) return extractText(node.props.children);
  return "";
}

function formatCategory(label) {
  return (label || "Architecture")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function safeDate(d) {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
}

/** ---------- Extract “🔥 Takeaway” blocks from markdown ---------- */
function extractTakeaways(markdown) {
  const lines = String(markdown || "").split("\n");
  const takeaways = [];

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] || "").trim();
    if (!/^🔥\s*takeaway\b/i.test(line)) continue;

    const bullets = [];
    for (let j = i + 1; j < lines.length; j++) {
      const t = (lines[j] || "").trim();
      if (!t) break;
      if (/^#{1,6}\s+/.test(t)) break;

      if (/^[-*•]\s+/.test(t)) bullets.push(t.replace(/^[-*•]\s+/, "").trim());
      else if (bullets.length > 0) bullets[bullets.length - 1] += ` ${t}`;
    }

    bullets.forEach((b) => b && takeaways.push(b));
  }

  const seen = new Set();
  return takeaways.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
}

/** ---------- Code block renderer (compact + crisp) ---------- */
function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toUpperCase() : "CODE";

  const [copied, setCopied] = useState(false);
  const plainText = extractText(children);

  const isInline = inline ?? (!match && !plainText.includes("\n"));
  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80
                   text-[0.92em] font-mono text-neutral-950 dark:text-neutral-50"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1100);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-[#0d1117] shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161b22] border-b border-neutral-800 text-[0.72rem] text-neutral-400">
        <div className="flex gap-1.5 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/90" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/90" />
          <span className="ml-3 uppercase tracking-[0.16em] text-neutral-300">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="px-2.5 py-1 rounded-md bg-neutral-800/70 hover:bg-neutral-700 text-neutral-100 transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="p-3.5 sm:p-4 text-[0.84rem] sm:text-[0.9rem] text-zinc-50 leading-[1.65] overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/** ---------- Markdown components (compact, Google-style editorial) ---------- */
const markdownComponents = {
  h1: ({ children, ...props }) => {
    const id = slugifyHeading(extractText(children));
    return (
      <h1
        id={id}
        {...props}
        className="scroll-mt-28 mt-8 mb-3 text-[1.8rem] sm:text-[2.05rem] font-semibold tracking-tight
                   text-neutral-950 dark:text-neutral-50"
      >
        {children}
      </h1>
    );
  },

  h2: ({ children, ...props }) => {
    const id = slugifyHeading(extractText(children));
    return (
      <h2
        id={id}
        {...props}
        className="group scroll-mt-28 mt-9 mb-2.5 flex items-baseline
                   text-[1.28rem] sm:text-[1.45rem] font-semibold tracking-tight
                   text-neutral-950 dark:text-neutral-50"
      >
        {/* <span className="inline-flex h-5 w-1.5 rounded-full bg-primary/85" /> */}
        <span className="min-w-0">{children}</span>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-xs transition-opacity"
          aria-label="Anchor link"
        >
          #
        </a>
      </h2>
    );
  },

  h3: ({ children, ...props }) => {
    const id = slugifyHeading(extractText(children));
    return (
      <h3
        id={id}
        {...props}
        className="group scroll-mt-24 mt-6 mb-2 text-[1.02rem] sm:text-[1.12rem]
                   font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="ml-1 opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-[0.72rem] transition-opacity"
          aria-label="Anchor link"
        >
          #
        </a>
      </h3>
    );
  },

  p: ({ children, ...props }) => {
    const text = extractText(children).trim();

    // "🔥 Takeaway" label (compact)
    if (/^🔥\s*takeaway\b/i.test(text)) {
      return (
        <div className="my-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/15 px-2.5 py-1 text-[0.72rem] font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Takeaway
          </div>
        </div>
      );
    }

    return (
      <p
        {...props}
        className="my-3.5 text-[0.95rem] sm:text-[1rem] leading-[1.72] tracking-[0.01em]
                   text-neutral-800 dark:text-neutral-100"
      >
        {children}
      </p>
    );
  },

  a: ({ children, href, ...props }) => {
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="font-medium text-primary underline underline-offset-[3px]
                   decoration-primary/30 hover:decoration-primary"
      >
        {children}
        {isExternal && <span className="ml-1 text-[0.62rem] align-super">↗</span>}
      </a>
    );
  },

  strong: ({ children, ...props }) => (
    <strong {...props} className="font-semibold text-neutral-950 dark:text-neutral-50">
      {children}
    </strong>
  ),

  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="my-5 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                 bg-white/70 dark:bg-neutral-900/60 px-4 py-3 shadow-sm"
    >
      <div className="border-l-2 border-primary/70 pl-3 text-[0.95rem] leading-[1.68] text-neutral-900 dark:text-neutral-50 space-y-2">
        {children}
      </div>
    </blockquote>
  ),

  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-3.5 pl-5 space-y-1.5 text-[0.95rem] sm:text-[1rem] leading-[1.68]
                 text-neutral-800 dark:text-neutral-100 list-disc marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="my-3.5 pl-5 space-y-1.5 text-[0.95rem] sm:text-[1rem] leading-[1.68]
                 text-neutral-800 dark:text-neutral-100 list-decimal marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li {...props} className="leading-[1.66]">
      {children}
    </li>
  ),

  table: ({ children, ...props }) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/60 shadow-sm">
      <table {...props} className="min-w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead
      {...props}
      className="bg-neutral-100/80 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    >
      {children}
    </thead>
  ),

  tr: ({ children, ...props }) => (
    <tr {...props} className="even:bg-neutral-50/70 dark:even:bg-neutral-900/40">
      {children}
    </tr>
  ),

  th: ({ children, ...props }) => (
    <th
      {...props}
      className="border-b border-neutral-200/70 dark:border-neutral-800/70 px-3 py-2 font-semibold text-[0.85rem]"
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td
      {...props}
      className="border-t border-neutral-200/70 dark:border-neutral-800/70 px-3 py-2 align-top text-[0.9rem]"
    >
      {children}
    </td>
  ),

  img: ({ alt, src, ...props }) => (
    <figure className="my-6">
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-100 dark:bg-neutral-900 shadow-sm">
        <a href={src} target="_blank" rel="noreferrer" className="block">
          <img
            {...props}
            src={src}
            alt={alt || ""}
            loading="lazy"
            decoding="async"
            className="w-full h-auto max-h-[560px] object-contain"
          />
        </a>
      </div>
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
      className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-neutral-300/80 dark:via-neutral-700 to-transparent"
    />
  ),

  code: CodeBlock,
};

export default function Post() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const progressPercent = useTransform(scrollYProgress, (v) => Math.round(v * 100));
  const scrollHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => setShowScrollTop(v > 0.2));
    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    (async () => {
      const current = await getPostBySlug(slug);
      if (!current) return;

      setPost(current);

      const matches = Array.from((current.content || "").matchAll(/^#{1,3}\s+(.*)$/gm));
      const parsed = matches
        .map((m) => {
          const raw = (m[1] || "").trim();
          const level = m[0].startsWith("###") ? 3 : m[0].startsWith("##") ? 2 : 1;
          const id = slugifyHeading(raw);
          return { text: raw, level, id };
        })
        .filter((h) => h.level >= 2 && h.text);

      setHeadings(parsed);

      const normalize = (s) => (s ? s.toLowerCase().replace(/\s+/g, "-") : "");
      const all = await getPosts();

      const related = (all || [])
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

  useEffect(() => {
    if (!post?.content || headings.length === 0) return;

    const elements = Array.from(document.querySelectorAll("article h2[id], article h3[id]"));
    if (elements.length === 0) return;

    const onScroll = () => {
      const scrollTop = window.scrollY + 132;
      let current = elements[0].id;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el.offsetTop <= scrollTop) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post, headings]);

  const readingTime = useMemo(() => {
    const words = (post?.content || "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 230));
  }, [post?.content]);

  const category = useMemo(() => formatCategory(post?.category), [post?.category]);

  const takeaways = useMemo(() => extractTakeaways(post?.content), [post?.content]);

  const hero = post?.cover || post?.image || post?.banner || post?.hero || null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1100);
    } catch {
      // ignore
    }
  };

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 108;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    setActiveId(id);
  };

  if (!post) {
    return (
      <div className="min-h-[70dvh] flex items-center justify-center text-neutral-500 dark:text-neutral-400 animate-pulse">
        Loading article…
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title || "Article");
  const dateObj = safeDate(post.date);

  return (
    <main className="min-h-[100dvh] bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[80]" style={{ scaleX }} />

      {/* Scroll map (xl+) */}
      <div className="fixed right-6 top-28 z-30 w-[2px] h-[70vh] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden hidden xl:block">
        <motion.div
          style={{
            height: scrollHeight,
            background: "linear-gradient(to bottom, rgb(66,133,244), rgb(52,168,83))",
          }}
        />
      </div>

      {/* % read badge (smaller + quieter) */}
      <motion.div
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[70]
                   bg-neutral-900/80 dark:bg-white/10 backdrop-blur-md text-white dark:text-neutral-100
                   text-[0.72rem] font-medium px-3 py-1.5 rounded-full shadow-lg border border-neutral-700/40"
        style={{ opacity: scrollYProgress }}
      >
        <motion.span className="tabular-nums mr-1">{progressPercent}</motion.span>% read
      </motion.div>

      {/* Back to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
            className="fixed bottom-14 right-5 sm:bottom-7 sm:left-7 sm:right-auto z-[70]
                       bg-primary text-white p-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            aria-label="Back to top"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---------- HERO HEADER (compact) ---------- */}
      <section className="relative overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(66,133,244,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(52,168,83,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),rgba(255,255,255,0.62),rgba(250,250,250,0.88))] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,0.74),rgba(10,10,10,0.62),rgba(10,10,10,0.86))]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-7">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={copyLink}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                           bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                           text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Link2 className="h-4 w-4" />
                {copied ? "Copied" : "Copy link"}
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                           bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                           text-neutral-700 dark:text-neutral-200 hover:border-sky-500/40 hover:text-sky-500 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Share
              </a>
            </div>
          </div>

          {/* Title */}
          <motion.h1
            className="mt-4 text-[1.9rem] sm:text-[2.25rem] md:text-[2.65rem] font-extrabold font-display tracking-tight
                       text-neutral-950 dark:text-neutral-50 leading-[1.12]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {post.title}
          </motion.h1>

          {/* Meta (compact pills) */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.78rem] sm:text-[0.82rem] text-neutral-700/85 dark:text-neutral-300/85">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
              <Tag className="h-4 w-4 text-neutral-500" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{category}</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <span>
                {dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
              <Clock className="h-4 w-4 text-neutral-500" />
              <span>{readingTime} min</span>
            </span>
          </div>

          {/* Summary (tight) */}
          {post.summary && (
            <p className="mt-3 max-w-3xl text-sm sm:text-[0.95rem] text-neutral-800/85 dark:text-neutral-200/85 leading-[1.55]">
              {post.summary}
            </p>
          )}

          {/* Hero image */}
          {hero && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-100 dark:bg-neutral-900 shadow-sm">
              <div className="relative aspect-[16/9]">
                <img
                  src={hero}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          )}

          {/* Mobile share row */}
          <div className="mt-4 flex sm:hidden gap-2">
            <button
              onClick={copyLink}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-4 py-2 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Link2 className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-4 py-2 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-sky-500/40 hover:text-sky-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </a>
          </div>
        </div>
      </section>

      {/* ---------- BODY (more compact) ---------- */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 items-start">
          {/* Main */}
          <div
            className="relative bg-white dark:bg-neutral-900/95 border border-neutral-200/70 dark:border-neutral-800/80 rounded-2xl
                       shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]
                       px-5 sm:px-7 md:px-8 py-7 sm:py-8"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/7 via-transparent to-transparent rounded-t-2xl" />

            {/* Mobile TOC */}
            {headings.length > 0 && (
              <div className="lg:hidden relative z-10 mb-6">
                <details className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-950/30 p-4">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                    On this page
                  </summary>
                  <div className="mt-3 space-y-1">
                    {headings.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => scrollToHeading(h.id)}
                        className={[
                          "block w-full text-left rounded-lg px-2 py-1.5 text-sm transition",
                          h.level === 3 ? "ml-3" : "",
                          activeId === h.id
                            ? "text-primary font-semibold bg-primary/5 dark:bg-primary/10"
                            : "text-neutral-800 dark:text-neutral-200 hover:text-primary hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40",
                        ].join(" ")}
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* Article (tight typography container) */}
            <article className="relative z-10 mx-auto max-w-[72ch]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Author */}
            <div className="mt-10 pt-6 border-t border-neutral-200/70 dark:border-neutral-800/70">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Tejas Sathe</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    System Design • GenAI • Scalable Engineering
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://www.linkedin.com/in/tejas-sathe010/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                               text-neutral-700 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/tejassathe010"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                               text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Related */}
            {relatedPosts.length > 0 && (
              <section className="mt-10 pt-6 border-t border-neutral-200/70 dark:border-neutral-800/70">
                <h3 className="text-base font-display font-semibold mb-4 text-neutral-950 dark:text-neutral-50">
                  Continue reading
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/post/${p.slug}`}
                      className="group block rounded-xl border border-neutral-200/70 dark:border-neutral-800/80
                                 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5
                                 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[0.7rem] uppercase tracking-[0.16em] text-primary font-semibold">
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
            )}
          </div>

          {/* Right rail */}
          <aside className="hidden lg:block sticky top-24 self-start space-y-4">
            {/* TOC */}
            {headings.length > 0 && (
              <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-2">
                  On this page
                </p>
                <nav className="space-y-1 text-[0.82rem] text-neutral-700 dark:text-neutral-300">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      type="button"
                      className={[
                        "relative block w-full text-left rounded-lg px-2 py-1.5 transition-colors",
                        h.level === 3 ? "ml-3" : "ml-0",
                        activeId === h.id
                          ? "text-primary font-semibold bg-primary/5 dark:bg-primary/10"
                          : "hover:text-primary/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/40",
                      ].join(" ")}
                    >
                      <span className="line-clamp-2">{h.text}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Key takeaways */}
            {takeaways.length > 0 && (
              <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-2">
                  Key takeaways
                </p>
                <ul className="space-y-2 text-[0.9rem] text-neutral-800 dark:text-neutral-200 leading-[1.55]">
                  {takeaways.slice(0, 7).map((t, idx) => (
                    <li key={`${idx}-${t}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0" />
                      <span className="min-w-0">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share */}
            <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-2">
                Share
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={copyLink}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                             text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                             text-neutral-700 dark:text-neutral-200 hover:border-sky-500/40 hover:text-sky-500 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  Share on X
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                             text-neutral-700 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
