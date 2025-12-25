import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import markdownComponents from "./markdownComponents";

export default function PostArticle({ content }) {
  return (
    <article className="relative z-10 mx-auto max-w-2xl sm:max-w-3xl text-[1rem] sm:text-[1.04rem] leading-[1.8] text-neutral-800 dark:text-neutral-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
