import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = (eventOrMediaQueryList) => {
      const matches =
        typeof eventOrMediaQueryList.matches === "boolean"
          ? eventOrMediaQueryList.matches
          : false;
      setPrefers(matches);
    };

    update(mq);

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    if (typeof mq.addListener === "function") {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }

    return undefined;
  }, []);

  return prefers;
}
