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
    setNote("Email updates coming soon. Subscribe via RSS.");
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
      setNote("Copy failed. Open /rss.xml.");
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
    <footer className="mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-surface-light-alt dark:bg-surface-dark-alt/50">
      {/* Footer is now cleaner, less "noisy" */}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RuntimeNotes logo"
                className="h-9 w-9 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                  RuntimeNotes
                </p>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Engineering, documented.
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Notes on <span className="text-neutral-900 dark:text-neutral-200 font-medium">System Design</span>,{" "}
              <span className="text-neutral-900 dark:text-neutral-200 font-medium">GenAI</span>, and{" "}
              <span className="text-neutral-900 dark:text-neutral-200 font-medium">DSA</span>. Built for production.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Stable", "Readable", "Production-Ready"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-800
                             bg-white dark:bg-neutral-900/50 px-2 py-1 text-xs font-medium
                             text-neutral-600 dark:text-neutral-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation & Utilities */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Resources
            </h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors">
                About
              </Link>
              <a href="/rss.xml" className="text-sm text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5">
                <Rss className="h-3.5 w-3.5" />
                RSS Feed
              </a>
            </nav>
          </div>

          {/* Social & Connect */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/TejasSathe010"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/tejas-sathe010/"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:tejassathe010@gmail.com"
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* Newsletter Mini-Form */}
            <form onSubmit={onSubscribe} className="mt-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for updates"
                  className="w-full h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                             bg-white dark:bg-neutral-900 px-3 text-sm
                             placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-transparent
                             text-neutral-900 dark:text-neutral-200 transition-all duration-150"
                />
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-neutral-900 dark:bg-neutral-100 px-4 text-sm font-semibold text-white dark:text-neutral-900
                             hover:bg-neutral-800 dark:hover:bg-neutral-200 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 transition-all duration-150"
                >
                  Join
                </button>
              </div>
              {note && <p className="text-xs text-primary-600 dark:text-primary-400">{note}</p>}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-200/50 dark:border-neutral-800/50 pt-8">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            © {year} Tejas Sathe. All rights reserved.
          </p>

          <button
            type="button"
            onClick={onTop}
            className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
          >
            Top
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer >
  );
}
