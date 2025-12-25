export function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              Tejas Sathe
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/TejasSathe010"
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-2 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                         dark:text-neutral-400 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40"
            >
              GitHub
            </a>
            <a
              href="/about"
              className="rounded-md px-2 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                         dark:text-neutral-400 dark:hover:text-neutral-50 dark:hover:bg-neutral-900/40"
            >
              About
            </a>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Daily Tech Chronicles — practical notes on system design, GenAI, and building reliable, scalable software.
        </p>
      </div>
    </footer>
  );
}
