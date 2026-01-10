import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  Rss,
  Mail,
  Github,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

import { cn } from "./utils/common";
import { useReducedMotion } from "framer-motion";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function Footer() {
  const year = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [copiedRss, setCopiedRss] = useState(false);

  const noteTimer = useRef<number | null>(null);
  const copyTimer = useRef<number | null>(null);

  const rssUrl = useMemo(() => {
    if (typeof window === "undefined") return "/rss.xml";
    return new URL("/rss.xml", window.location.origin).toString();
  }, []);

  useEffect(() => {
    return () => {
      if (noteTimer.current) window.clearTimeout(noteTimer.current);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const onSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNote("");

    const v = email.trim();
    if (!v) {
      setNote("Please enter an email address.");
      noteTimer.current = window.setTimeout(() => setNote(""), 1800);
      return;
    }

    // Non-functional but professional
    setNote("Email updates are coming soon. For now, subscribe via RSS.");
    setEmail("");

    noteTimer.current = window.setTimeout(() => setNote(""), 2600);
  };

  const onCopyRss = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl);
      setCopiedRss(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedRss(false), 1200);
    } catch {
      setNote("Couldn’t copy. Open /rss.xml instead.");
      noteTimer.current = window.setTimeout(() => setNote(""), 2200);
    }
  };

  const onTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <footer className="mt-14 border-t border-neutral-200/60 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-950/40">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335] opacity-60" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-5 min-w-0">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RuntimeNotes logo"
                className="h-10 w-10 rounded-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/60"
                loading="lazy"
                decoding="async"
              />

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[1.05rem] font-extrabold tracking-tight",
                    "bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% to-[#EA4335]",
                    "bg-clip-text text-transparent"
                  )}
                >
                  RuntimeNotes
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Systems thinking, written clean.
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Practical notes on{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">System Design</span>,{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">GenAI</span>, and{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">DSA</span> — focused on reliability,
              correctness, and real-world engineering tradeoffs.
            </p>

            {/* Trust/positioning pills (psych UX: fast value scan) */}
            <div className="mt-5 flex flex-wrap gap-2">
              {["Stable under stress", "Readable by default", "Systems > syntax"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-1 text-xs font-medium
                             text-neutral-600 dark:text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-3">
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
              Sitemap
            </p>

            <div className="mt-3 grid gap-2">
              <Link
                to="/"
                className="group inline-flex items-center justify-between rounded-xl px-3 py-2
                           text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                           dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Home
                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                to="/about"
                className="group inline-flex items-center justify-between rounded-xl px-3 py-2
                           text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                           dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                About
                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href="/rss.xml"
                className="group inline-flex items-center justify-between rounded-xl px-3 py-2
                           text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                           dark:text-neutral-300 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                RSS Feed
                <Rss className="h-4 w-4 opacity-70" />
              </a>
            </div>

            {/* RSS helper card */}
            <div className="mt-4 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Prefer RSS?
                </p>

                <button
                  type="button"
                  onClick={onCopyRss}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold transition",
                    "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70",
                    "dark:text-neutral-200 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  )}
                  aria-label="Copy RSS URL"
                  title="Copy RSS URL"
                >
                  {copiedRss ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedRss ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Use any reader. Clean updates, no spam.
                </p>

                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-primary
                             dark:text-neutral-200 dark:hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-2 py-1"
                  aria-label="Open RSS feed"
                >
                  Open <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>

              {/* Small URL preview (confidence / transparency) */}
              <p className="mt-2 text-[0.72rem] font-mono text-neutral-500 dark:text-neutral-400 break-all">
                {rssUrl}
              </p>
            </div>
          </div>

          {/* Updates + Social */}
          <div className="lg:col-span-4 lg:justify-self-end w-full">
            <form
              onSubmit={onSubscribe}
              className="w-full rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/70 dark:bg-neutral-900/60 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
                  Get updates
                </p>

                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold
                             text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                             dark:text-neutral-200 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Rss className="h-4 w-4" />
                  RSS
                </a>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    placeholder="Email (coming soon)"
                    className="w-full rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/80 dark:bg-neutral-950/30 px-9 py-2.5 text-sm
                               text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400
                               focus:outline-none focus:ring-2 focus:ring-primary/35"
                    aria-label="Email address"
                  />
                </div>

                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white
                             hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Notify
                </button>
              </div>

              {/* Status note */}
              <div aria-live="polite" className="min-h-[1.1rem]">
                {note ? (
                  <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">{note}</p>
                ) : null}
              </div>

              {/* Social row */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <a
                  href="https://github.com/TejasSathe010"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold
                             text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                             dark:text-neutral-200 dark:hover:text-neutral-50 dark:hover:bg-neutral-900
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </a>

                <a
                  href="https://www.linkedin.com/in/tejas-sathe010/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold
                             text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                             dark:text-neutral-200 dark:hover:text-neutral-50 dark:hover:bg-neutral-900
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </a>

                {/* Optional: contact that feels “real” */}
                <a
                  href="mailto:tejassathe010@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold
                             text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70
                             dark:text-neutral-200 dark:hover:text-neutral-50 dark:hover:bg-neutral-900
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Mail className="h-4 w-4" />
                  Email
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </a>

                <button
                  type="button"
                  onClick={onTop}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 bg-white/70
                             px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm
                             hover:shadow-md hover:bg-white
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:border-neutral-800/70 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  aria-label="Back to top"
                >
                  <ArrowUp className="h-4 w-4 opacity-80" />
                  Top
                </button>
              </div>

              {/* Micro trust line (psych UX: reduces anxiety) */}
              <p className="mt-4 text-[0.72rem] text-neutral-500 dark:text-neutral-400">
                No tracking pixels. No spam. Just the feed.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom micro-row */}
        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200/60 pt-6 text-xs text-neutral-500 dark:border-neutral-800/60 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="tabular-nums">
            © {year}{" "}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Tejas Sathe
            </span>
          </span>
          <span className="tabular-nums">RuntimeNotes • Clean, predictable, production-minded</span>
        </div>
      </div>
    </footer>
  );
}
