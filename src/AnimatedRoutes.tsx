import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Home from "./pages/Home";
import Post from "./pages/Post";
import About from "./pages/About";

export function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const pageVariants = {
    initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        id="content"
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: reduceMotion ? 0 : 0.28,
          ease: "easeOut",
        }}
        // Keeps your existing spacing, but makes layout more “app-like”
        className={[
          "py-6 sm:py-10",
          "min-h-[calc(100dvh-4rem)]", // prevents footer jump on short pages
          "focus:outline-none",
        ].join(" ")}
        // Helps screen readers understand page changes without removing anything else
        role="main"
        aria-live="polite"
        tabIndex={-1}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}
