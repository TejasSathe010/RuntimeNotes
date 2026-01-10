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
  const headerHeight = useTransform(scrollY, [0, 120], [72, 60]);
  const bgOpacity = useTransform(scrollY, [0, 120], [0.86, 0.985]);

  const headerStyle = prefersReducedMotion ? undefined : { height: headerHeight };
  const bgStyle = prefersReducedMotion ? undefined : { opacity: bgOpacity };

  const drawerId = useId();

  // Close drawer on route change
  useEffect(() => setOpen(false), [pathname]);

  // “Scrolled” state for shadow / borders
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 8));
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
      style={headerStyle}
      className={[
        "sticky top-0 z-50",
        "border-b border-neutral-200/60 dark:border-neutral-800/60",
        "bg-transparent",
        scrolled
          ? "shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          : "",
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

      {/* Backdrop */}
      <Motion.div
        style={bgStyle}
        className={[
          "absolute inset-0 -z-10",
          "bg-white/90 backdrop-blur-xl dark:bg-neutral-950/85",
          scrolled ? "ring-1 ring-black/5 dark:ring-white/5" : "",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Top hairline accent */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-0 top-0 h-[2px] w-full",
          "bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335]",
          scrolled ? "opacity-55" : "opacity-35",
        ].join(" ")}
      />

      <nav
        className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="RuntimeNotes"
        >
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="w-10 h-10"
            decoding="async"
            loading="eager"
          />
          <span
            className="text-base font-extrabold tracking-tight sm:text-lg md:text-xl
                       bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% to-[#EA4335]
                       bg-clip-text text-transparent"
          >
            RuntimeNotes
          </span>
          <span className="hidden text-xs text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200 sm:inline">
            Notes
          </span>
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
                      className="absolute inset-0 rounded-md bg-neutral-100/80 dark:bg-neutral-900/50"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    to={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative inline-flex items-center rounded-md px-3 py-2 text-[0.95rem] font-medium",
                      "transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50",
                      "hover:bg-neutral-100/70 dark:hover:bg-neutral-900/40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    ].join(" ")}
                  >
                    {link.name}
                  </Link>

                  {/* Active underline */}
                  {isActive && (
                    <Motion.span
                      layoutId="active-link-underline"
                      className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-primary"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 32 }
                      }
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}

            <div className="mx-2 h-6 w-px bg-neutral-200/70 dark:bg-neutral-800/70" />

            <a
              href="https://github.com/TejasSathe010"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-[0.95rem] font-medium
                         text-neutral-700 transition-colors hover:bg-neutral-100/70 hover:text-neutral-900
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                         dark:text-neutral-300 dark:hover:bg-neutral-900/40 dark:hover:text-neutral-50"
            >
              GitHub <ArrowUpRight className="h-4 w-4 opacity-70" />
            </a>
          </div>
        </LayoutGroup>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2
                     text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                     dark:text-neutral-200 dark:hover:bg-neutral-900/50 dark:hover:text-white"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls={drawerId}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
              className="absolute inset-0 bg-black/35"
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
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm
                         border-l border-neutral-200/60 bg-white shadow-2xl
                         dark:border-neutral-800/60 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/60 px-5 py-4 dark:border-neutral-800/60">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100/70
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:text-neutral-200 dark:hover:bg-neutral-900/50"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive = isRouteActive(pathname, link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "inline-flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium",
                          "transition-colors",
                          isActive
                            ? "bg-neutral-100 text-primary dark:bg-neutral-900/50"
                            : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900/50",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        ].join(" ")}
                      >
                        <span>{link.name}</span>
                        <ArrowUpRight className="h-4 w-4 opacity-60" />
                      </Link>
                    );
                  })}
                </div>

                <div className="my-5 h-px bg-neutral-200/70 dark:bg-neutral-800/70" />

                <a
                  href="https://github.com/TejasSathe010"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-between rounded-lg px-4 py-3
                             text-base font-medium text-neutral-800 hover:bg-neutral-100
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                             dark:text-neutral-100 dark:hover:bg-neutral-900/50"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </a>

                <p className="mt-6 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Exploring System Design, GenAI, and scalable engineering patterns.
                </p>
              </div>
            </Motion.aside>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.header>
  );
}
