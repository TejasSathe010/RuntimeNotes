import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { lazy, Suspense } from "react";

// Lazy load pages to split the bundle
const Home = lazy(() => import("./pages/Home"));
const Post = lazy(() => import("./pages/Post"));
const About = lazy(() => import("./pages/About"));

// Loading fallback matching premium aesthetic
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="h-8 w-8 rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin" />
  </div>
);

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
          duration: reduceMotion ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={[
          "py-6 sm:py-10",
          "min-h-[calc(100dvh-4rem)]",
          "focus:outline-none",
        ].join(" ")}
        role="main"
        aria-live="polite"
        tabIndex={-1}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}
