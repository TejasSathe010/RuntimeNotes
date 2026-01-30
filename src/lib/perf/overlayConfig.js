/**
 * Performance Budget Configuration
 * Values are in milliseconds or bytes (raw) unless specified.
 */
export const PERF_BUDGETS = {
    jsTotal: 200 * 1024,   // 200KB gzip target
    cssTotal: 50 * 1024,   // 50KB
    fontsTotal: 120 * 1024, // 120KB
    lcp: 2500,             // 2.5s
    cls: 0.1,              // 0.1
    inp: 200,              // 200ms
    ttfb: 600,             // 600ms
};

export const STORAGE_KEY = 'PERF_OVERLAY';

/**
 * Activation Rules:
 * - URL includes ?perf=1
 * - localStorage key PERF_OVERLAY=1
 * - DEV mode
 */
export const isPerfEnabled = () => {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const isUrlEnabled = params.get('perf') === '1';
    const isStorageEnabled = localStorage.getItem(STORAGE_KEY) === '1';
    const isDev = import.meta.env.DEV;

    return isUrlEnabled || isStorageEnabled || isDev;
};
