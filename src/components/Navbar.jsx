import { useEffect, useMemo, useState } from "react";
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

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 120], [72, 60]);
  const bgOpacity = useTransform(scrollY, [0, 120], [0.86, 0.98]);

  const headerStyle = prefersReducedMotion ? undefined : { height: headerHeight };
  const bgStyle = prefersReducedMotion ? undefined : { opacity: bgOpacity };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => {
      if (mq.matches) setOpen(false);
    };
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isActivePath = useMemo(() => new Set([pathname]), [pathname]);

  return (
    <Motion.header
      role="banner"
      style={headerStyle}
      className="sticky top-0 z-50 border-b border-neutral-200/60 bg-transparent dark:border-neutral-800/60"
    >
      {/* Skip link for accessibility */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60]
                   rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow
                   ring-1 ring-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-neutral-800"
      >
        Skip to content
      </a>

      <Motion.div
        style={bgStyle}
        className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-xl dark:bg-neutral-950/85"
        aria-hidden="true"
      />

      <nav
        className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Daily Tech Chronicles"
        >
          <span
            className="text-base font-extrabold tracking-tight sm:text-lg md:text-xl
                       bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% to-[#EA4335]
                       bg-clip-text text-transparent"
          >
            Daily Tech Chronicles
          </span>
          <span className="hidden text-xs text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200 sm:inline">
            Blog
          </span>
        </Link>

        <LayoutGroup>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = isActivePath.has(link.path);
              return (
                <div key={link.name} className="relative">
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

                  {isActive && (
                    <Motion.span
                      layoutId="active-link-pill"
                      className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
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
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <Motion.div
            className="fixed inset-0 z-[60] md:hidden"
            aria-hidden={!open}
          >
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
              className="absolute inset-0 bg-black/35"
              onClick={() => setOpen(false)}
            />

            <Motion.aside
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm
                         border-l border-neutral-200/60 bg-white shadow-2xl
                         dark:border-neutral-800/60 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/60 px-5 py-4 dark:border-neutral-800/60">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  Menu
                </span>
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
                    const isActive = pathname === link.path;
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
