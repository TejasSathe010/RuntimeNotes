import { ArrowUpRight, Linkedin } from "lucide-react";

export default function PostAuthor() {
  return (
    <div className="mt-12 pt-7 border-t border-neutral-200/70 dark:border-neutral-800/70">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Tejas Sathe</p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            System Design • GenAI • Scalable Engineering
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="https://www.linkedin.com/in/tejas-sathe010/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href="https://github.com/tejassathe010"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                       bg-white/75 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                       text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}