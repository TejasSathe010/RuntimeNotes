export default function PostMeta({ title }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      {/* Share Section */}
      <div className="mt-10 flex flex-wrap gap-4 justify-start text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-[#0b57d0] hover:text-[#0b57d0] transition-colors bg-white dark:bg-neutral-900"
        >
          <span>📋</span>
          <span>Copy link</span>
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 hover:text-sky-500 transition-colors bg-white dark:bg-neutral-900"
        >
          <span>🐦</span>
          <span>Share on X</span>
        </a>
      </div>

      {/* Author Block */}
      <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-left">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          ✍️ Written by{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">
            Tejas Sathe
          </span>
        </p>
        <p className="mt-2 text-xs sm:text-[0.8rem] text-neutral-500 dark:text-neutral-500 tracking-wide max-w-[45ch]">
          Exploring system design, GenAI, and the craft of scalable
          engineering.
        </p>
      </div>
    </>
  );
}
