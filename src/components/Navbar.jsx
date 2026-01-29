import { useEffect, useMemo, useRef, useState, useId } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import {
  motion as Motion,
  AnimatePresence,
  useScroll,
  useTransform,
  LayoutGroup,
} from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { getScrollbarWidth } from "../utils/common";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

function isRouteActive(pathname, linkPath) {
  if (linkPath === "/") {
    // Home should be active for Home itself and deep article routes
    return pathname === "/" || pathname.startsWith("/post/");
  }
  return pathname === linkPath || pathname.startsWith(linkPath + "/");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const drawerRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const { scrollY } = useScroll();
  // Simplified: opacity-only scroll state (no height animation per P0 rule)
  const bgOpacity = useTransform(scrollY, [0, 60], [0.85, 0.98]);

  const bgStyle = prefersReducedMotion ? undefined : { opacity: bgOpacity };

  const drawerId = useId();

  // Close drawer on route change
  useEffect(() => setOpen(false), [pathname]);

  // “Scrolled” state for shadow / borders
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 10));
    return () => unsub();
  }, [scrollY]);

  // Mobile: lock scroll + ESC + focus trap + restore focus
  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement;

    const prevOverflow = document.documentElement.style.overflow;
    const prevPaddingRight = document.documentElement.style.paddingRight;

    // Prevent background scroll + prevent layout shift from scrollbar removal
    const sw = getScrollbarWidth();
    document.documentElement.style.overflow = "hidden";
    if (sw > 0) document.documentElement.style.paddingRight = `${sw}px`;

    // focus first item
    const t = window.setTimeout(() => {
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      focusables[0]?.focus?.();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const root = drawerRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // loop focus
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = prevOverflow;
      document.documentElement.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);

      // restore focus (only if still in DOM)
      const el = lastFocusedRef.current;
      if (el && el instanceof HTMLElement && document.contains(el)) el.focus();
      lastFocusedRef.current = null;
    };
  }, [open]);

  // Auto-close drawer when switching to desktop width
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => {
      if (mq.matches) setOpen(false);
    };
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeMap = useMemo(() => {
    const map = new Map();
    for (const l of NAV_LINKS) map.set(l.path, isRouteActive(pathname, l.path));
    return map;
  }, [pathname]);

  return (
    <Motion.header
      role="banner"
      className={[
        "sticky top-0 z-50 h-14",
        "transition-[border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-neutral-200/80 dark:border-neutral-700/80 shadow-xs"
          : "border-b border-transparent",
      ].join(" ")}
    >
      {/* Skip link */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60]
                   rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow
                   ring-1 ring-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-neutral-800"
      >
        Skip to content
      </a>

      {/* Backdrop - simplified, no heavy blur */}
      <Motion.div
        style={bgStyle}
        className="absolute inset-0 -z-10 bg-white/95 dark:bg-neutral-950/95"
        aria-hidden="true"
      />

      {/* Top Accent Line (Sapphire Gradient) */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-0 top-0 h-[2px] w-full",
          "bg-gradient-to-r from-primary-600 via-primary-500 to-accent-teal",
          scrolled ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500"
        ].join(" ")}
      />

      <nav
        className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          aria-label="RuntimeNotes"
        >
          <img
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
            className="w-8 h-8 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10" // Smaller logo for dense navbar
            decoding="async"
            loading="eager"
          />
          <div className="flex flex-col">
            <span
              className="text-[0.95rem] font-bold tracking-tight text-neutral-900 dark:text-white leading-none group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
            >
              RuntimeNotes
            </span>
            <span className="text-[0.65rem] font-medium text-neutral-500 dark:text-neutral-400 leading-none tracking-wide pt-0.5 uppercase">
              Engineering Notes
            </span>
          </div>
        </Link>

        <LayoutGroup>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = Boolean(activeMap.get(link.path));

              return (
                <div key={link.name} className="relative">
                  {/* Active background pill */}
                  {isActive && (
                    <Motion.span
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-md bg-neutral-100 dark:bg-neutral-800/50"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 30 }
                      }
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    to={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative inline-flex items-center rounded-md px-3 py-1.5 text-[0.85rem] font-medium tracking-tight",
                      "transition-colors",
                      isActive
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-800/30",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    ].join(" ")}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}

            <div className="mx-2 h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

            <a
              href="https://github.com/TejasSathe010"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.85rem] font-medium
                         text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                         dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
            >
              GitHub <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
            </a>
          </div>
        </LayoutGroup>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-1.5
                     text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                     dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls={drawerId}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <Motion.div className="fixed inset-0 z-[60] md:hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <Motion.aside
              ref={drawerRef}
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className="absolute right-0 top-0 h-full w-[80%] max-w-xs
                         border-l border-neutral-200 bg-surface-light shadow-2xl
                         dark:border-neutral-800 dark:bg-surface-dark"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = isRouteActive(pathname, link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                        "transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      ].join(" ")}
                    >
                      <span>{link.name}</span>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
                    </Link>
                  );
                })}

                <div className="my-4 h-px bg-neutral-100 dark:bg-neutral-800" />

                <a
                  href="https://github.com/TejasSathe010"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md px-3 py-2
                             text-sm font-medium text-neutral-700 hover:bg-neutral-50
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-4 w-4 opacity-50" />
                </a>
              </div>
            </Motion.aside>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.header>
  );
}
