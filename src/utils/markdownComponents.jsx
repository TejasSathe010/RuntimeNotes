import { slugifyHeading, extractText, cn } from "./common";
import { Sparkles } from "lucide-react";
import { PreBlock, CodeBlock } from "../components/post/MarkdownComponents";

export function getMarkdownComponents() {
  return {
    pre: PreBlock,
    code: CodeBlock,

    h1: ({ children, ...props }) => {
      const id = props.id || slugifyHeading(extractText(children));
      return (
        <h1
          id={id}
          {...props}
          className={cn(
            "scroll-mt-28 mt-10 mb-4",
            "font-display font-semibold tracking-tight",
            "text-[1.65em] sm:text-[1.85em] leading-[1.15]",
            "text-neutral-950 dark:text-neutral-50"
          )}
        >
          {children}
        </h1>
      );
    },

    h2: ({ children, ...props }) => {
      const id = props.id || slugifyHeading(extractText(children));
      return (
        <h2
          id={id}
          {...props}
          className={cn(
            "group scroll-mt-28 mt-10 mb-3 flex items-baseline gap-2",
            "font-display font-semibold tracking-tight",
            "text-[1.25em] sm:text-[1.35em] leading-[1.2]",
            "text-neutral-950 dark:text-neutral-50"
          )}
        >
          <span className="min-w-0">{children}</span>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-xs transition-opacity"
            aria-label="Anchor link"
          >
            #
          </a>
        </h2>
      );
    },

    h3: ({ children, ...props }) => {
      const id = props.id || slugifyHeading(extractText(children));
      return (
        <h3
          id={id}
          {...props}
          className={cn(
            "group scroll-mt-24 mt-8 mb-2",
            "font-display font-semibold tracking-tight",
            "text-[1.08em] sm:text-[1.12em] leading-[1.25]",
            "text-neutral-950 dark:text-neutral-50"
          )}
        >
          <span>{children}</span>
          <a
            href={`#${id}`}
            className="ml-1 opacity-0 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 text-[0.72rem] transition-opacity"
            aria-label="Anchor link"
          >
            #
          </a>
        </h3>
      );
    },

    p: ({ children, ...props }) => {
      const text = extractText(children).trim();

      if (/^🔥\s*takeaway\b/i.test(text)) {
        return (
          <div className="my-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/15 px-3 py-1 text-[0.75rem] font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Takeaway
            </div>
          </div>
        );
      }

      return (
        <p
          {...props}
          className={cn(
            "my-4",
            "leading-[1.9] tracking-[0.002em]",
            "text-neutral-800/95 dark:text-neutral-100/90"
          )}
        >
          {children}
        </p>
      );
    },

    a: ({ children, href, ...props }) => {
      const isExternal = href && /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...props}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="font-medium text-primary underline underline-offset-[3px]
                     decoration-primary/30 hover:decoration-primary"
        >
          {children}
          {isExternal && <span className="ml-1 text-[0.62rem] align-super">↗</span>}
        </a>
      );
    },

    strong: ({ children, ...props }) => (
      <strong {...props} className="font-semibold text-neutral-950 dark:text-neutral-50">
        {children}
      </strong>
    ),

    blockquote: ({ children, ...props }) => {
      // Check if this acts as a callout/admonition
      const text = extractText(children).trim();
      const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.exec(text);

      if (match) {
        const type = match[1].toUpperCase();
        // Styles map
        const styles = {
          NOTE: "bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200",
          TIP: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200",
          IMPORTANT: "bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-900 dark:text-violet-200",
          WARNING: "bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200",
          CAUTION: "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-900 dark:text-red-200",
        };
        const icons = {
          NOTE: "ℹ️",
          TIP: "💡",
          IMPORTANT: "✨",
          WARNING: "⚠️",
          CAUTION: "🚨",
        };

        const accentClass = styles[type] || styles.NOTE;
        const icon = icons[type] || icons.NOTE;

        return (
          <div className={cn("my-6 rounded-xl border-l-4 px-4 py-3", accentClass)}>
            <div className="flex items-center gap-2 font-semibold text-sm opacity-90 mb-1 capitalize">
              <span>{icon}</span> {type.toLowerCase()}
            </div>
            <div className="[&>p]:mt-0 [&>p]:mb-1 text-[0.95rem] leading-relaxed opacity-90">
              {children}
            </div>
          </div>
        );
      }

      return (
        <blockquote
          {...props}
          className="my-7 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white/85 dark:bg-neutral-900/60 px-5 py-4 shadow-sm"
        >
          <div className="border-l-2 border-primary/70 pl-4 leading-[1.85] text-neutral-900 dark:text-neutral-50 space-y-2">
            {children}
          </div>
        </blockquote>
      );
    },

    ul: ({ children, ...props }) => (
      <ul
        {...props}
        className="my-4 pl-5 space-y-2 leading-[1.85]
                   text-neutral-800/95 dark:text-neutral-100/90
                   list-disc marker:text-neutral-400 dark:marker:text-neutral-500"
      >
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol
        {...props}
        className="my-4 pl-5 space-y-2 leading-[1.85]
                   text-neutral-800/95 dark:text-neutral-100/90
                   list-decimal marker:text-neutral-400 dark:marker:text-neutral-500"
      >
        {children}
      </ol>
    ),

    li: ({ children, ...props }) => (
      <li {...props} className="leading-[1.85]">
        {children}
      </li>
    ),

    table: ({ children, ...props }) => (
      <div className="my-8 w-full overflow-x-auto rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/85 dark:bg-neutral-900/60 shadow-sm">
        <table {...props} className="min-w-full text-sm text-left border-collapse">
          {children}
        </table>
      </div>
    ),

    thead: ({ children, ...props }) => (
      <thead
        {...props}
        className="bg-neutral-100/80 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      >
        {children}
      </thead>
    ),

    tr: ({ children, ...props }) => (
      <tr {...props} className="even:bg-neutral-50/70 dark:even:bg-neutral-900/40">
        {children}
      </tr>
    ),

    th: ({ children, ...props }) => (
      <th
        {...props}
        className="border-b border-neutral-200/70 dark:border-neutral-800/70 px-3 py-2 font-semibold text-[0.85rem]"
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }) => (
      <td
        {...props}
        className="border-t border-neutral-200/70 dark:border-neutral-800/70 px-3 py-2 align-top text-[0.92rem]"
      >
        {children}
      </td>
    ),

    img: ({ alt, src, ...props }) => (
      <figure className="my-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-100 dark:bg-neutral-900 shadow-sm">
          <a href={src} target="_blank" rel="noreferrer" className="block">
            <img
              {...props}
              src={src}
              alt={alt || ""}
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-[620px] object-contain"
            />
          </a>
        </div>
        {alt && (
          <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {alt}
          </figcaption>
        )}
      </figure>
    ),

    hr: (props) => (
      <hr
        {...props}
        className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-neutral-300/80 dark:via-neutral-700 to-transparent"
      />
    ),
  };
}
