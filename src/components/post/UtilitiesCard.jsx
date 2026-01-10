import { ArrowUpRight, Printer, Wand2 } from "lucide-react";
import { clampText } from "../../utils/common";

export default function UtilitiesCard({ post }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-2">
        Utilities
      </p>

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                     text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print (clean)
          </span>
          <ArrowUpRight className="h-4 w-4 opacity-60" />
        </button>

        <button
          type="button"
          onClick={() => {
            const hint = clampText(post.summary || post.content || "", 240);
            const url = window.location.href;
            const mail = `mailto:?subject=${encodeURIComponent(
              `Feedback: ${post.title || "RuntimeNotes"}`
            )}&body=${encodeURIComponent(
              `Link:\n${url}\n\nContext:\n${hint}\n\nFeedback:\n`
            )}`;
            window.location.href = mail;
          }}
          className="inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-xs font-medium
                     text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Send feedback (fast)
          </span>
          <ArrowUpRight className="h-4 w-4 opacity-60" />
        </button>

        <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-950/30 p-3">
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">Pro interaction</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            Highlight a sentence → copy as a quote with a source link.
          </p>
        </div>
      </div>
    </div>
  );
}