/**
 * Collects Web Vitals using PerformanceObserver
 */
export const initVitalsCollector = (onUpdate) => {
    const vitals = {
        lcp: 0,
        cls: 0,
        inp: 0,
        ttfb: 0,
        entries: {
            lcp: null,
            cls: [],
            inp: null,
        }
    };

    // TTFB
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
        vitals.ttfb = navEntry.responseStart - navEntry.startTime;
    }

    // LCP
    const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
        vitals.entries.lcp = lastEntry;
        onUpdate({ ...vitals });
    });

    // CLS
    const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
                vitals.cls += entry.value;
                vitals.entries.cls.push(entry);
            }
        }
        onUpdate({ ...vitals });
    });

    // INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.duration > vitals.inp) {
            vitals.inp = lastEntry.duration;
            vitals.entries.inp = lastEntry;
            onUpdate({ ...vitals });
        }
    });

    try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        inpObserver.observe({ type: 'event', buffered: true }); // INP heuristic
    } catch (e) {
        console.warn('Performance observers not fully supported', e);
    }

    return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        inpObserver.disconnect();
    };
};
