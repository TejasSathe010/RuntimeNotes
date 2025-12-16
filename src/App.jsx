import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Post from "./pages/Post";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import { AnimatePresence, motion } from "framer-motion";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// Dynamically set <title> for SEO and UX
function PageTitleUpdater() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.replace("/", "") || "Home";
    const pageTitle = path
      ? `Daily Tech Chronicles — ${path
          .replace("-", " ")
          .replace(/^\w/, (c) => c.toUpperCase())}`
      : "Daily Tech Chronicles";
    document.title = pageTitle;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <ScrollToTop />
      <PageTitleUpdater />

      {/* ---------- Page Transition Wrapper ---------- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/about" element={<About />} />
\          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* ---------- Footer ---------- */}
      <footer className="max-w-5xl mx-auto border-t border-neutral-200/60 dark:border-neutral-800/60 mt-5 pt-10 pb-16 text-center text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        <p>
          © {new Date().getFullYear()} <span className="text-primary font-semibold">Tejas Sathe</span>
        </p>
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          Exploring System Design, GenAI, and the art of scalable engineering.
        </p>
      </footer>
    </Router>
  );
}
