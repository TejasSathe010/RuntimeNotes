import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  Link2,
  ArrowUpRight,
  Twitter,
  Linkedin,
  Clock,
  Calendar,
  Tag,
  Wand2,
  Bookmark,
  BookmarkCheck,
  Printer,
  Command,
  Search,
} from "lucide-react";
import { cn, formatCategory, safeDate } from "../../utils/common";

export default function PostHeader({
  post,
  readingTime,
  saved,
  copiedLink,
  showJumpButton,
  onToggleSaved,
  onCopyLink,
  onOpenJump,
  onPrint,
}) {
  const reduceMotion = useReducedMotion();
  const category = formatCategory(post?.category);
  const dateObj = safeDate(post?.date);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title || "Article");
  const hero = post?.cover || post?.image || post?.banner || post?.hero || null;

  return (
    <section className="relative overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(66,133,244,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(52,168,83,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.84),rgba(255,255,255,0.70),rgba(250,250,250,0.92))] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,0.78),rgba(10,10,10,0.66),rgba(10,10,10,0.90))]" />

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
              onClick={onToggleSaved}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-pressed={saved}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </button>

            {showJumpButton && (
              <button
                onClick={onOpenJump}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                           bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                           text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Command className="h-4 w-4" />
                Jump
                <span className="ml-1 hidden md:inline-flex items-center gap-1 text-[0.7rem] text-neutral-500 dark:text-neutral-400">
                  <span className="rounded-md border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 px-1.5 py-0.5">
                    ⌘
                  </span>
                  <span className="rounded-md border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 px-1.5 py-0.5">
                    K
                  </span>
                </span>
              </button>
            )}

            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              onClick={onCopyLink}
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Link2 className="h-4 w-4" />
              {copiedLink ? "Copied" : "Copy link"}
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

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              Share
            </a>
          </div>
        </div>

        {/* Title */}
        <motion.h1
          className="mt-4 text-[1.9rem] sm:text-[2.25rem] md:text-[2.55rem] font-display font-bold tracking-tight
                     text-neutral-950 dark:text-neutral-50 leading-[1.14]"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {post.title}
        </motion.h1>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.78rem] sm:text-[0.8rem] text-neutral-700/85 dark:text-neutral-300/85">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/75 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
            <Tag className="h-4 w-4 text-neutral-500" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{category}</span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/75 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <span>
              {dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/75 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 px-2.5 py-1">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span>{readingTime} min</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/55 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 px-2.5 py-1 text-neutral-600 dark:text-neutral-300">
            <Wand2 className="h-4 w-4 text-neutral-500" />
            Select text to copy a quote
          </span>
        </div>

        {/* Summary */}
        {post.summary && (
          <p className="mt-4 max-w-3xl text-[1.0rem] sm:text-[1.05rem] text-neutral-800/85 dark:text-neutral-200/85 leading-[1.75]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
            </div>
          </div>
        )}

        {/* Mobile action row */}
        <div className="mt-4 flex sm:hidden gap-2">
          <button
            onClick={onToggleSaved}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-4 py-2 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved" : "Save"}
          </button>

          {showJumpButton && (
            <button
              onClick={onOpenJump}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/75 dark:bg-neutral-900/60 px-4 py-2 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              Jump
            </button>
          )}

          <button
            onClick={onCopyLink}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-4 py-2 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Link2 className="h-4 w-4" />
            {copiedLink ? "Copied" : "Link"}
          </button>
        </div>
      </div>
    </section>
  );
}