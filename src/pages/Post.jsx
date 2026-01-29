import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPostBySlug, getPosts } from "../utils/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark-dimmed.css";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../utils/common";
import { getLocalArray, setLocalArray } from "../utils/localStorage";
import { STORAGE_KEYS } from "../utils/constants";
import { remarkHeadingIds, remarkCodeMetaToDataAttrs, extractTakeaways } from "../utils/markdown";
import { getMarkdownComponents } from "../utils/markdownComponents";
import PostHeader from "../components/post/PostHeader";
import TocSidebar from "../components/post/TocSidebar";
import MobileToc from "../components/post/MobileToc";
import JumpPalette from "../components/post/JumpPalette";
import PostAuthor from "../components/post/PostAuthor";
import RelatedPosts from "../components/post/RelatedPosts";
import TakeawaysCard from "../components/post/TakeawaysCard";
import UtilitiesCard from "../components/post/UtilitiesCard";
import QuoteBubble from "../components/post/QuoteBubble";
import PostMetaTags from "../components/post/PostMetaTags";

function readSaved() {
  return getLocalArray(STORAGE_KEYS.SAVED);
}

function writeSaved(arr) {
  setLocalArray(STORAGE_KEYS.SAVED, arr);
}

export default function Post() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();

  const articleRef = useRef(null);

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const [activeId, setActiveId] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [tocItems, setTocItems] = useState([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [showSubheads, setShowSubheads] = useState(true);
  const [sectionCopied, setSectionCopied] = useState("");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteCopied, setQuoteCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const markdownComponents = useMemo(() => getMarkdownComponents(), []);

  const pushToast = (msg) => {
    setToast({ msg });
    window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setShowScrollTop(y > 800);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      const current = await getPostBySlug(slug);
      if (!alive) return;

      if (!current) {
        setPost(null);
        setRelatedPosts([]);
        return;
      }

      setPost(current);

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
      setActiveId("");
      setTocItems([]);
      setTocOpen(false);
      setSectionCopied("");
      setCopiedLink(false);
      setJumpOpen(false);
      setQuote(null);
      setQuoteCopied(false);

      const savedArr = readSaved();
      setSaved(savedArr.some((x) => x?.slug === current.slug));
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!post?.content) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const root = articleRef.current;
        if (!root) return;

        const nodes = Array.from(root.querySelectorAll("h2[id], h3[id]"));
        const items = nodes
          .map((el) => ({
            id: el.id,
            text: (el.textContent || "").trim(),
            level: el.tagName === "H3" ? 3 : 2,
          }))
          .filter((x) => x.id && x.text);

        setTocItems(items);
        setActiveId((prev) => prev || items[0]?.id || "");

        const hash = window.location.hash?.slice(1);
        if (hash && items.some((t) => t.id === hash)) {
          const el = document.getElementById(hash);
          if (el) {
            const offset = 112;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [post?.content, reduceMotion]);

  useEffect(() => {
    if (!tocItems.length) return;

    const root = articleRef.current;
    if (!root) return;

    const headings = Array.from(root.querySelectorAll("h2[id], h3[id]"));
    if (!headings.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-16% 0px -72% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [tocItems]);

  useEffect(() => {
    if (!activeId) return;
    const el = document.getElementById(`toc-item-${activeId}`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const isTypingContext =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setJumpOpen(true);
        return;
      }

      if (!isTypingContext && e.key === "/") {
        e.preventDefault();
        setJumpOpen(true);
        return;
      }

      if (e.key === "Escape") {
        if (jumpOpen) setJumpOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [jumpOpen]);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection?.();
      if (!sel || sel.isCollapsed) {
        setQuote(null);
        return;
      }

      const text = sel.toString().trim().replace(/\s+/g, " ");
      if (!text || text.length < 22) {
        setQuote(null);
        return;
      }

      let range;
      try {
        range = sel.getRangeAt(0);
      } catch {
        setQuote(null);
        return;
      }

      const root = articleRef.current;
      const container = range?.commonAncestorContainer;
      if (!root || !container || !root.contains(container)) {
        setQuote(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        setQuote(null);
        return;
      }

      setQuote({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const readingTime = useMemo(() => {
    const words = (post?.content || "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 230));
  }, [post?.content]);

  // Unused: category
  const takeaways = useMemo(() => extractTakeaways(post?.content), [post?.content]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      pushToast("Link copied");
      window.setTimeout(() => setCopiedLink(false), 1100);
    } catch { /* ignore */ }
  };

  const copySectionLink = async (id) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setSectionCopied(id);
      pushToast("Section link copied");
      window.setTimeout(() => setSectionCopied(""), 1000);
    } catch { /* ignore */ }
  };

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 112;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    setActiveId(id);
    setTocOpen(false);
    history.replaceState(null, "", `#${id}`);
  };

  const toggleSaved = () => {
    if (!post?.slug) return;

    const current = {
      slug: post.slug,
      title: post.title || "Untitled",
      category: post.category || "",
      date: post.date || "",
      summary: post.summary || "",
    };

    const arr = readSaved();
    const exists = arr.some((x) => x?.slug === post.slug);

    const next = exists ? arr.filter((x) => x?.slug !== post.slug) : [current, ...arr].slice(0, 100);
    writeSaved(next);
    setSaved(!exists);
    pushToast(exists ? "Removed from saved" : "Saved for later");
  };

  const printPage = () => {
    try {
      window.print();
    } catch { /* ignore */ }
  };

  const copyQuote = async () => {
    if (!quote?.text) return;
    try {
      const base = window.location.origin + window.location.pathname;
      const url = activeId ? `${base}#${activeId}` : window.location.href;
      const md = `> ${quote.text}\n\n— ${post?.title || "RuntimeNotes"}\n${url}\n`;
      await navigator.clipboard.writeText(md);
      setQuoteCopied(true);
      pushToast("Quote copied");
      window.setTimeout(() => setQuoteCopied(false), 900);
      setQuote(null);
      window.getSelection?.()?.removeAllRanges?.();
    } catch { /* ignore */ }
  };

  if (!post) {
    return (
      <main className="min-h-[70dvh] flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        <span className="text-sm">Loading article…</span>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      <PostMetaTags post={post} slug={slug} />
      <AnimatePresence>
        {toast?.msg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95]
                       rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 px-4 py-2 shadow-sm
                       text-sm font-medium text-neutral-700 dark:text-neutral-200"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
            className="fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-[80]
                       h-10 w-10 flex items-center justify-center
                       bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                       rounded-full shadow-sm hover:shadow active:translate-y-px transition-all duration-150"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            type="button"
            aria-label="Back to top"
          >
            <span className="text-sm font-bold">↑</span>
          </motion.button>
        )}
      </AnimatePresence>

      <QuoteBubble
        quote={quote}
        copied={quoteCopied}
        onCopy={copyQuote}
        onDismiss={() => setQuote(null)}
      />

      <PostHeader
        post={post}
        readingTime={readingTime}
        saved={saved}
        copiedLink={copiedLink}
        showJumpButton={tocItems.length > 0}
        onToggleSaved={toggleSaved}
        onCopyLink={copyLink}
        onOpenJump={() => setJumpOpen(true)}
        onPrint={printPage}
      />

      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12 items-start">
          <div
            className={cn(
              "relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl",
              "shadow-sm",
              "px-6 sm:px-8 md:px-10 py-8 sm:py-10"
            )}
          >
            {/* Subtle top accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

            <article
              ref={articleRef}
              className={cn(
                "relative z-10 mx-auto max-w-[65ch]",
                "prose prose-neutral dark:prose-invert",
                "prose-headings:font-display prose-headings:tracking-tight",
                "prose-p:text-neutral-600 dark:prose-p:text-neutral-400",
                "prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline",
                "prose-code:text-sm prose-code:font-medium",
                "selection:bg-primary-100 dark:selection:bg-primary-900/40"
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkHeadingIds, remarkCodeMetaToDataAttrs]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            <PostAuthor />
            <RelatedPosts posts={relatedPosts} />
          </div>

          <div className="hidden lg:block sticky top-24 self-start space-y-6">
            <TocSidebar
              tocItems={tocItems}
              activeId={activeId}
              showSubheads={showSubheads}
              sectionCopied={sectionCopied}
              saved={saved}
              onScrollToHeading={scrollToHeading}
              onCopySectionLink={copySectionLink}
              onToggleShowSubheads={() => setShowSubheads((v) => !v)}
              onOpenJump={() => setJumpOpen(true)}
              onToggleSaved={toggleSaved}
            />

            <TakeawaysCard takeaways={takeaways} />
            <UtilitiesCard post={post} />
          </div>
        </div>
      </section>

      <MobileToc
        open={tocOpen}
        tocItems={tocItems}
        activeId={activeId}
        showSubheads={showSubheads}
        reduceMotion={reduceMotion}
        onOpen={() => setTocOpen(true)}
        onClose={() => setTocOpen(false)}
        onToggleShowSubheads={() => setShowSubheads((v) => !v)}
        onOpenJump={() => {
          setJumpOpen(true);
          setTocOpen(false);
        }}
        onScrollToHeading={scrollToHeading}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
      />

      <JumpPalette
        open={jumpOpen}
        tocItems={tocItems}
        showSubheads={showSubheads}
        saved={saved}
        onClose={() => setJumpOpen(false)}
        onJump={scrollToHeading}
        onToggleSaved={toggleSaved}
      />

      <div className="h-10" />
    </main>
  );
}