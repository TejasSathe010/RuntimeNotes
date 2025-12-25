import CodeBlock from "./CodeBlock";
import { slugifyHeading, extractText } from "./markdownUtils";

const markdownComponents = {
  h1: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);
    return (
      <h1
        id={id}
        {...props}
        className="scroll-mt-32 mt-10 mb-5 text-[2rem] sm:text-[2.25rem] md:text-[2.4rem] font-semibold leading-[1.12] text-neutral-900 dark:text-neutral-50"
      >
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);

    return (
      <h2
        id={id}
        {...props}
        className="scroll-mt-28 mt-12 mb-4 text-[1.45rem] sm:text-[1.6rem] font-semibold leading-[1.2] tracking-tight text-neutral-900 dark:text-neutral-50"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);

    return (
      <h3
        id={id}
        {...props}
        className="scroll-mt-24 mt-8 mb-3 text-[1.15rem] sm:text-[1.2rem] font-semibold leading-[1.3] text-neutral-900 dark:text-neutral-50"
      >
        {children}
      </h3>
    );
  },

  p: ({ children, ...props }) => (
    <p
      {...props}
      className="my-5 max-w-[70ch] text-[1rem] sm:text-[1.04rem] leading-[1.8] tracking-[0.005em] text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </p>
  ),

  a: ({ children, href, ...props }) => {
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="font-medium text-[#0b57d0] underline underline-offset-[3px] decoration-[#0b57d0]/30 hover:decoration-[#0b57d0]"
      >
        {children}
        {isExternal && (
          <span className="ml-1 text-[0.6rem] align-super">↗</span>
        )}
      </a>
    );
  },

  strong: ({ children, ...props }) => (
    <strong
      {...props}
      className="font-semibold text-neutral-900 dark:text-neutral-50"
    >
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em
      {...props}
      className="italic text-neutral-800 dark:text-neutral-200"
    >
      {children}
    </em>
  ),

  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="mt-6 mb-8 max-w-[68ch] border-l-4 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-5 py-4 rounded-r-2xl text-[0.96rem] leading-[1.75] text-neutral-800 dark:text-neutral-50"
    >
      {children}
    </blockquote>
  ),

  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-5 ml-1 pl-5 space-y-2 text-[1rem] sm:text-[1.02rem] leading-[1.75] text-neutral-800 dark:text-neutral-100 list-disc marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="my-5 ml-1 pl-5 space-y-2 text-[1rem] sm:text-[1.02rem] leading-[1.75] text-neutral-800 dark:text-neutral-100 list-decimal marker:text-neutral-400 dark:marker:text-neutral-500"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      {...props}
      className="leading-[1.75] text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </li>
  ),

  table: ({ children, ...props }) => (
    <div className="my-7 w-full overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <table
        {...props}
        className="min-w-full text-sm text-left border-collapse"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      {...props}
      className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
    >
      {children}
    </thead>
  ),
  tr: ({ children, ...props }) => (
    <tr
      {...props}
      className="even:bg-neutral-50 dark:even:bg-neutral-900/60"
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 font-semibold text-[0.85rem]"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-2 align-top text-[0.9rem]"
    >
      {children}
    </td>
  ),

  img: ({ alt, ...props }) => (
    <figure className="my-8">
      <img
        {...props}
        alt={alt}
        className="mx-auto max-h-[420px] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm object-contain"
      />
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

  code: CodeBlock,
};

export default markdownComponents;
