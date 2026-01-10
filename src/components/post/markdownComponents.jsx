import { useState, isValidElement, cloneElement } from "react";
import { Sparkles } from "lucide-react";
import { slugifyHeading, extractText, cn } from "../../utils/common";
import { parseMeta } from "../../utils/markdown";
import ReactFlowEmbed from "../ReactFlowEmbed";
import { Suspense, lazy } from "react";

const CodePlayground = lazy(() => import("../CodePlayground"));

export function PreBlock({ children, ...props }) {
  const meta = props["data-meta"] || "";
  const child = Array.isArray(children) ? children[0] : children;

  if (isValidElement(child)) {
    return cloneElement(child, { ...child.props, "data-meta": meta });
  }

  return <pre {...props}>{children}</pre>;
}

export function CodeBlock({ inline, className, children, node, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1].toLowerCase() : "code";

  const [copied, setCopied] = useState(false);
  const plainText = extractText(children);

  const isInline = inline ?? (!match && !plainText.includes("\n"));
  const lang = match?.[1]?.toLowerCase();

  if (!inline && lang === "reactflow") {
    const jsonText = extractText(children);
    return <ReactFlowEmbed jsonText={jsonText} />;
  }

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80
                   text-[0.92em] font-mono text-neutral-950 dark:text-neutral-100"
        {...props}
      >
        {children}
      </code>
    );
  }

  const metaFromProps = props["data-meta"] || "";
  const metaFromNode = node?.data?.meta || node?.meta || "";
  const meta = metaFromProps || metaFromNode;
  const metaInfo = parseMeta(meta);

  let markerInfo = { runner: false, template: null, title: null };
  const firstLine = (plainText.split("\n")[0] || "").trim();
  if (/^\/\/\s*@runner\b/i.test(firstLine)) {
    const rest = firstLine.replace(/^\/\/\s*@runner\s*/i, "");
    markerInfo = parseMeta(`runner ${rest}`);
  }

  const isRunnableLang = ["js", "ts", "jsx", "tsx"].includes(language);
  const shouldRun = isRunnableLang && (metaInfo.runner || markerInfo.runner);

  if (shouldRun) {
    const template = metaInfo.template || markerInfo.template || null;
    const title = metaInfo.title || markerInfo.title || "Playground";

    const runnableCode = markerInfo.runner
      ? plainText.split("\n").slice(1).join("\n")
      : plainText;

    return (
      <Suspense
        fallback={
          <div className="my-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4 text-sm text-neutral-600 dark:text-neutral-300">
            Loading playground…
          </div>
        }
      >
        <CodePlayground
          code={runnableCode}
          language={language}
          template={template}
          title={title}
        />
      </Suspense>
    );
  }

  const headerLang = match ? match[1].toUpperCase() : "CODE";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard write failed, ignore silently
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-[#0d1117] shadow-[0_14px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-neutral-800 text-[0.72rem] text-neutral-400">
        <div className="flex gap-1.5 items-center">
          <span className="w-3 h-3 rounded-full bg-red-500/90" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
          <span className="w-3 h-3 rounded-full bg-green-500/90" />
          <span className="ml-3 uppercase tracking-[0.16em] text-neutral-300">{headerLang}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="px-2.5 py-1 rounded-lg bg-neutral-800/70 hover:bg-neutral-700 text-neutral-100 transition-colors"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <pre className="p-4 sm:p-5 text-[0.9rem] sm:text-[0.95rem] text-zinc-50 leading-[1.75] overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}
