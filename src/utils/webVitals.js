import { onCLS, onLCP, onINP, onTTFB } from "web-vitals";

/**
 * Initialize Core Web Vitals reporting.
 * @param {(metric: import('web-vitals').Metric) => void} [onReport]
 */
export function initWebVitals(onReport) {
  if (typeof window === "undefined") return;

  const handler =
    onReport ??
    ((metric) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[WEB-VITAL]", metric.name, metric.value);
      }
    });

  onCLS(handler);
  onLCP(handler);
  onINP(handler);
  onTTFB(handler);
}
