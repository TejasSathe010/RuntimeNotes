import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, LayoutGroup } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  // Smooth scroll fade + height shrink
  const bgLight = useTransform(scrollY, [0, 150], ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]);
  const bgDark = useTransform(scrollY, [0, 150], ["rgba(13,17,23,0.9)", "rgba(13,17,23,0.6)"]);
  const height = useTransform(scrollY, [0, 120], ["4.5rem", "3.6rem"]);

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  // Close dropdown when route changes
  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      style={{ height }}
      className="sticky top-0 z-50 transition-all duration-300 border-b border-neutral-200/60 dark:border-neutral-800/60"
    >
      <motion.div
        style={{
          background: bgLight,
        }}
        className="absolute inset-0 -z-10 backdrop-blur-xl dark:[background:var(--tw-bg-opacity)_rgba(13,17,23,var(--tw-bg-opacity))]"
      />

      <nav className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center h-full">
        {/* ---------- Brand ---------- */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-display font-extrabold tracking-tight
                     bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% via-[#FBBC05] to-[#EA4335]
                     bg-clip-text text-transparent animate-gradient-x hover:opacity-90 focus:outline-none 
                     focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
        >
          Daily Tech Chronicles
        </Link>

        {/* ---------- Desktop Links ---------- */}
        <LayoutGroup>
          <div className="hidden md:flex items-center gap-8 text-[0.95rem] font-medium relative">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <div key={link.name} className="relative">
                  <Link
                    to={link.path}
                    className={`transition-colors duration-200 pb-1 ${
                      isActive
                        ? "text-primary"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {isActive && (
                    <motion.span
                      layoutId="active-link-underline"
                      className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}

            {/* GitHub link */}
            <a
              href="https://github.com/TejasSathe010"
              target="_blank"
              rel="noreferrer"
              className="group relative text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors pb-1"
            >
              GitHub
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </LayoutGroup>

        {/* ---------- Mobile Menu Toggle ---------- */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-200 hover:text-primary transition 
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* ---------- Mobile Dropdown ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-white/95 dark:bg-neutral-950/90 border-t 
                       border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-lg 
                       shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:hidden"
          >
            <div className="flex flex-col items-center gap-6 py-6 text-base font-medium text-neutral-700 dark:text-neutral-300">
              {links.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-primary font-semibold" : "hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <a
                href="https://github.com/TejasSathe010"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
