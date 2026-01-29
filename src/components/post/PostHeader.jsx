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
import { formatCategory, safeDate } from "../../utils/common";

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
    <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      {/* Removed heavy radial gradients, using clean surface */}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 active:translate-y-px transition-all duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onToggleSaved}
              type="button"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              aria-pressed={saved}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </button>

            {showJumpButton && (
              <button
                onClick={onOpenJump}
                type="button"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                           bg-white dark:bg-neutral-900 text-sm font-medium
                           text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              >
                <Command className="h-4 w-4" />
                Jump
                <span className="ml-1 hidden md:inline-flex items-center gap-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                  <kbd className="rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-1.5 py-0.5 font-sans">⌘</kbd>
                  <kbd className="rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-1.5 py-0.5 font-sans">K</kbd>
                </span>
              </button>
            )}

            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              onClick={onCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 active:translate-y-px transition-all duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
              <Link2 className="h-4 w-4" />
              {copiedLink ? "Copied" : "Copy"}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 active:translate-y-px transition-all duration-150"
            >
              <Twitter className="h-4 w-4" />
              Share
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 active:translate-y-px transition-all duration-150"
            >
              <Linkedin className="h-4 w-4" />
              Share
            </a>
          </div>
        </div>

        {/* Title */}
        <motion.h1
          className="mt-6 text-3xl sm:text-4xl font-display font-bold tracking-tight text-neutral-900 dark:text-white leading-tight"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {post.title}
        </motion.h1>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5">
            <Tag className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-medium text-neutral-700 dark:text-neutral-200">{category}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span>{dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>{readingTime} min</span>
          </span>

          <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-neutral-500 dark:text-neutral-400">
            <Wand2 className="h-3.5 w-3.5" />
            Select text to copy
          </span>
        </div>

        {/* Summary */}
        {post.summary && (
          <p className="mt-4 max-w-2xl text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {post.summary}
          </p>
        )}

        {/* Hero image */}
        {hero && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
            <div className="relative aspect-[16/9]">
              <img
                src={hero}
                alt={post.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Mobile action row */}
        <div className="mt-6 flex sm:hidden gap-2">
          <button
            onClick={onToggleSaved}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 text-sm font-medium
                       text-neutral-700 dark:text-neutral-200 active:translate-y-px transition-all duration-150"
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saved ? "Saved" : "Save"}
          </button>

          {showJumpButton && (
            <button
              onClick={onOpenJump}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                         bg-white dark:bg-neutral-900 text-sm font-medium
                         text-neutral-700 dark:text-neutral-200 active:translate-y-px transition-all duration-150"
            >
              <Search className="h-4 w-4" />
              Jump
            </button>
          )}

          <button
            onClick={onCopyLink}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 text-sm font-medium
                       text-neutral-700 dark:text-neutral-200 active:translate-y-px transition-all duration-150"
          >
            <Link2 className="h-4 w-4" />
            {copiedLink ? "Copied" : "Link"}
          </button>
        </div>
      </div>
    </section>
  );
}