import { Sparkles } from "lucide-react";

export default function TakeawaysCard({ takeaways }) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-2">
        Key takeaways
      </p>
      <ul className="space-y-2 text-[0.92rem] text-neutral-800/95 dark:text-neutral-200/90 leading-[1.7]">
        {takeaways.slice(0, 7).map((t, idx) => (
          <li key={`${idx}-${t}`} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0" />
            <span className="min-w-0">{t}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-950/30 p-3">
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Tip: press <span className="font-semibold">/</span> or{" "}
          <span className="font-semibold">⌘/Ctrl K</span> to jump to a section instantly.
        </p>
      </div>
    </div>
  );
}