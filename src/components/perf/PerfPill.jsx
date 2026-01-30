import React, { Suspense, lazy } from 'react';
import { isPerfEnabled } from '../../lib/perf/overlayConfig';
import { usePerfOverlay } from './usePerfOverlay';
import { cn } from '../../utils/common';

const PerfOverlay = lazy(() => import('./PerfOverlay'));

/**
 * Floating Pill to toggle performance overlay
 */
export default function PerfPill() {
    const enabled = isPerfEnabled();
    const { isOpen, setIsOpen, budgetStatus, vitals, resources } = usePerfOverlay();

    if (!enabled) return null;

    const totalFailures = budgetStatus.filter(b => !b.pass).length;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 h-10 rounded-full",
                    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md",
                    "text-xs font-semibold transition-all duration-200 active:scale-95",
                    totalFailures > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                )}
                aria-label="Toggle Performance Overlay"
            >
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    totalFailures > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                )} />
                Perf
                {totalFailures > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-[10px]">
                        {totalFailures}
                    </span>
                )}
            </button>

            <Suspense fallback={null}>
                {isOpen && <PerfOverlay
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    budgetStatus={budgetStatus}
                    vitals={vitals}
                    resources={resources}
                />}
            </Suspense>
        </>
    );
}
