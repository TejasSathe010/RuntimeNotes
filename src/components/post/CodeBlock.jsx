import { useState } from "react";
import { extractText } from "./markdownUtils";

export default function CodeBlock({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toUpperCase() : "CODE";

  const [copied, setCopied] = useState(false);
  const plainText = extractText(children);

  // robust inline detection:
  // - trust `inline` if present
  // - otherwise: no language + no newline => treat as inline
  const isInline = inline ?? (!match && !plainText.includes("\n"));

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[0.9em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="mt-6 mb-8 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-[#0d1117] shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-neutral-800 text-[0.7rem] text-neutral-300">
        <div className="flex gap-1.5 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-3 uppercase tracking-[0.16em] text-neutral-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 transition-colors"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <pre className="p-4 sm:p-5 text-[0.88rem] text-zinc-50 leading-[1.7] overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}
