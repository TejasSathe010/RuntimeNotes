import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  useSandpackNavigation,
  useSandpackConsole,
} from "@codesandbox/sandpack-react";
import { sandpackDark, githubLight } from "@codesandbox/sandpack-themes";

function detectDarkMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function Actions() {
  const { sandpack } = useSandpack();
  const { refresh } = useSandpackNavigation();
  const { reset: resetConsole } = useSandpackConsole();

  const run = () => {
    resetConsole();
    refresh(); // recompiles & re-runs
  };

  const reset = () => {
    sandpack.resetAllFiles();
    resetConsole();
    refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-[0.72rem] font-semibold text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
      >
        Run
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 px-3 py-1.5 text-[0.72rem] font-semibold text-neutral-700 dark:text-neutral-200 hover:border-red-500/40 hover:text-red-500 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

/**
 * CodePlayground
 * - template: "vanilla" | "vanilla-ts" | "react" | "react-ts"
 * - language: "js" | "ts" | "jsx" | "tsx"
 */
export default function CodePlayground({
  code,
  language = "ts",
  template: templateOverride,
  title,
  editorHeight = 360,
}) {
  const isDark = detectDarkMode();

  // Decide template if not provided
  const template = (() => {
    if (templateOverride) return templateOverride;
    if (language === "tsx") return "react-ts";
    if (language === "jsx") return "react";
    if (language === "ts") return "vanilla-ts";
    return "vanilla";
  })();

  const files = (() => {
    // React templates
    if (template.startsWith("react")) {
      const ext = template === "react-ts" ? "tsx" : "jsx";
      return {
        [`/App.${ext}`]: code,
      };
    }

    // Vanilla templates
    const ext = template === "vanilla-ts" ? "ts" : "js";
    return {
      [`/index.${ext}`]: code,
    };
  })();

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/80 dark:bg-neutral-950/40">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
            {title || "Playground"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-full border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-[0.7rem] font-medium text-neutral-600 dark:text-neutral-300">
            {template}
          </span>
          {/* visible run controls */}
          <SandpackProvider
            template={template}
            files={files}
            theme={isDark ? sandpackDark : githubLight}
            options={{
              recompileMode: "delayed",
              recompileDelay: 350,
              autorun: true,
              showLineNumbers: true,
              showInlineErrors: true,
              wrapContent: false,
            }}
          >
            {/* Actions must be inside provider context */}
            <Actions />

            {/* Sandpack Layout */}
            <SandpackLayout className="!border-0 !rounded-none flex flex-col md:flex-row mt-2">
              <div className="md:w-[58%] border-b md:border-b-0 md:border-r border-neutral-200/70 dark:border-neutral-800/70">
                <SandpackCodeEditor style={{ height: editorHeight }} />
              </div>

              <div className="md:w-[42%]">
                <SandpackPreview
                  style={{ height: Math.max(260, editorHeight) }}
                  showRefreshButton={false}
                  showOpenInCodeSandbox={false}
                />
                <div className="border-t border-neutral-200/70 dark:border-neutral-800/70">
                  <SandpackConsole style={{ height: 160 }} />
                </div>
              </div>
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}