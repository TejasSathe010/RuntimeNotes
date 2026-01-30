import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../utils/common";

export const PreBlock = ({ children, ...props }) => (
    <pre {...props} className="not-prose my-6 overflow-x-auto rounded-xl border border-neutral-700/50 bg-[#1e1e2e] p-4 text-sm leading-relaxed shadow-lg">
        {children}
    </pre>
);

export const CodeBlock = ({ inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);

    const match = /language-(\w+)/.exec(className || "");
    const hasNewlines = String(children).includes("\n");
    // Heuristic: If explicit inline prop is missing, assume inline if no language class AND no newlines.
    const isInline = inline ?? (!match && !hasNewlines);

    if (isInline) {
        return (
            <code
                {...props}
                className="mx-[0.1em] rounded-[4px] border border-neutral-200/60 bg-neutral-100/80 px-[0.3em] py-[0.1em] font-mono text-[0.85em] font-semibold text-rose-600 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-rose-300 align-baseline"
            >
                {children}
            </code>
        );
    }

    // Block code logic
    const lang = match ? match[1] : "";
    const textContent = String(children).replace(/\n$/, "");

    const onCopy = () => {
        navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative my-4">
            {lang && (
                <span className="absolute right-3 top-3 select-none text-[10px] uppercase tracking-wider text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
                    {lang}
                </span>
            )}
            <button
                onClick={onCopy}
                type="button"
                className={cn(
                    "absolute right-2 top-2 z-10 hidden rounded-md p-1.5 transition-all focus:outline-none md:block",
                    "bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white",
                    "opacity-0 group-hover:opacity-100"
                )}
                aria-label="Copy code"
            >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <code {...props} className={cn(className, "block min-w-full bg-transparent p-0 font-mono text-[13px] text-[#cdd6f4]")}>
                {children}
            </code>
        </div>
    );
};
