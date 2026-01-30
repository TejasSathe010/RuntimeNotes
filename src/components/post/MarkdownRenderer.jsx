import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark-dimmed.css";
import { remarkHeadingIds, remarkCodeMetaToDataAttrs } from "../../utils/markdown";
import { getMarkdownComponents } from "../../utils/markdownComponents";

/**
 * Isolated Markdown Renderer
 * This is split into its own component to allow for easy lazy loading,
 * as it contains several heavy dependencies (react-markdown, rehype, highlight.js).
 */
export default function MarkdownRenderer({ content }) {
    const components = getMarkdownComponents();

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkHeadingIds, remarkCodeMetaToDataAttrs]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
}
