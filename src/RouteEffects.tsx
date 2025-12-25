import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

const TITLE_PREFIX = "Daily Tech Chronicles";

export function RouteEffects() {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

    const segment = pathname === "/" ? "Home" : pathname.split("/").pop();
    const formatted =
      segment?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Home";

    document.title =
      formatted === "Home" ? TITLE_PREFIX : `${TITLE_PREFIX} — ${formatted}`;
  }, [pathname, reduceMotion]);

  return null;
}
