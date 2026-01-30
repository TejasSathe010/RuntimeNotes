import { useState, useEffect, useCallback } from 'react';
import { initVitalsCollector } from '../../lib/perf/collectVitals';
import { collectResources } from '../../lib/perf/collectResources';
import { PERF_BUDGETS } from '../../lib/perf/overlayConfig';

export const usePerfOverlay = () => {
    const [vitals, setVitals] = useState({ lcp: 0, cls: 0, inp: 0, ttfb: 0 });
    const [resources, setResources] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only collect if needed
        const cleanup = initVitalsCollector((newVitals) => {
            setVitals(newVitals);
        });

        const updateResources = () => {
            setResources(collectResources());
        };

        // Initial collect
        updateResources();

        // Refresh resources periodically or on idle
        const interval = setInterval(updateResources, 2000);

        return () => {
            cleanup();
            clearInterval(interval);
        };
    }, []);

    const getBudgetStatus = useCallback(() => {
        if (!resources) return [];

        return [
            { label: 'LCP', value: vitals.lcp, budget: PERF_BUDGETS.lcp, unit: 'ms', pass: vitals.lcp <= PERF_BUDGETS.lcp },
            { label: 'CLS', value: vitals.cls, budget: PERF_BUDGETS.cls, unit: '', pass: vitals.cls <= PERF_BUDGETS.cls },
            { label: 'INP', value: vitals.inp, budget: PERF_BUDGETS.inp, unit: 'ms', pass: vitals.inp <= PERF_BUDGETS.inp },
            { label: 'TTFB', value: vitals.ttfb, budget: PERF_BUDGETS.ttfb, unit: 'ms', pass: vitals.ttfb <= PERF_BUDGETS.ttfb },
            { label: 'JS Size', value: resources.js.size, budget: PERF_BUDGETS.jsTotal, unit: 'B', pass: resources.js.size <= PERF_BUDGETS.jsTotal },
            { label: 'CSS Size', value: resources.css.size, budget: PERF_BUDGETS.cssTotal, unit: 'B', pass: resources.css.size <= PERF_BUDGETS.cssTotal },
            { label: 'Font Size', value: resources.font.size, budget: PERF_BUDGETS.fontsTotal, unit: 'B', pass: resources.font.size <= PERF_BUDGETS.fontsTotal },
        ];
    }, [vitals, resources]);

    return {
        vitals,
        resources,
        isOpen,
        setIsOpen,
        budgetStatus: getBudgetStatus(),
    };
};
