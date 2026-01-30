import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, AlertCircle, Zap, Activity, Package, HardDrive } from 'lucide-react';
import { cn } from '../../utils/common';

/**
 * Main Performance Overlay Panel
 */
export default function PerfOverlay({ isOpen, onClose, budgetStatus, vitals, resources }) {

    // Format bytes to readable string
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleCopySnapshot = () => {
        const data = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            vitals,
            budgets: budgetStatus,
            resources: resources ? {
                summary: {
                    js: formatBytes(resources.js.size),
                    css: formatBytes(resources.css.size),
                    font: formatBytes(resources.font.size),
                },
                critical: resources.critical
            } : null
        };
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('Performance snapshot copied to clipboard!');
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[2px] pointer-events-auto"
                />

                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto pointer-events-auto border-l border-neutral-200 dark:border-neutral-800"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold tracking-tight">Performance Budget</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopySnapshot}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
                                title="Copy Snapshot"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-8 pb-12">
                        {/* Vitals Summary */}
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> Web Vitals
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <MetricCard title="LCP" value={vitals.lcp ? `${vitals.lcp.toFixed(0)}ms` : '---'} pass={vitals.lcp <= 2500} />
                                <MetricCard title="CLS" value={vitals.cls.toFixed(3)} pass={vitals.cls <= 0.1} />
                                <MetricCard title="INP" value={vitals.inp ? `${vitals.inp.toFixed(0)}ms` : '---'} pass={vitals.inp <= 200} />
                                <MetricCard title="TTFB" value={vitals.ttfb ? `${vitals.ttfb.toFixed(0)}ms` : '---'} pass={vitals.ttfb <= 600} />
                            </div>
                        </section>

                        {/* Budgets */}
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                                <Package className="w-3.5 h-3.5" /> Budget Status
                            </h3>
                            <div className="space-y-3">
                                {budgetStatus.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.label}</span>
                                            <span className="text-[10px] text-neutral-400">Budget: {item.unit === 'B' ? formatBytes(item.budget) : `${item.budget}${item.unit}`}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn("text-xs font-mono font-semibold", item.pass ? "text-emerald-600" : "text-amber-600 uppercase")}>
                                                {item.unit === 'B' ? formatBytes(item.value) : `${item.value.toFixed(item.unit ? 0 : 3)}${item.unit}`}
                                            </span>
                                            {item.pass ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Critical Requests */}
                        {resources && resources.critical.length > 0 && (
                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                                    <HardDrive className="w-3.5 h-3.5" /> Critical Requests ({resources.critical.length})
                                </h3>
                                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
                                    {resources.critical.slice(0, 10).map((req, idx) => (
                                        <div key={idx} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium truncate text-neutral-800 dark:text-neutral-200" title={req.name}>{req.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {req.reason.split(', ').map((tag, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase">{formatBytes(req.size)}</p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">{req.duration.toFixed(0)}ms</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function MetricCard({ title, value, pass }) {
    return (
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{title}</p>
            <div className="flex items-baseline justify-between">
                <p className={cn("text-xl font-bold tracking-tight", pass ? "text-neutral-900 dark:text-neutral-50" : "text-amber-600")}>
                    {value}
                </p>
                <span className={cn("w-1.5 h-1.5 rounded-full", pass ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
            </div>
        </div>
    );
}
