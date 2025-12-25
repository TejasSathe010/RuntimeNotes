export default function TocSidebar({ headings, activeId, onItemClick }) {
  if (!headings || headings.length === 0) return null;

  return (
    <aside className="hidden lg:block w-64 sticky top-24 self-start">
      <div className="pl-4 border-l border-neutral-200 dark:border-neutral-800">
        <p className="text-[0.75rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500 mb-3">
          On this page
        </p>
        <nav className="space-y-1.5 text-[0.8rem] text-neutral-700 dark:text-neutral-400">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => onItemClick(h.id)}
              className={`relative block w-full text-left py-1 pr-2 rounded-md transition-colors ${
                activeId === h.id
                  ? "text-[#0b57d0] font-medium bg-[#0b57d0]/5"
                  : "hover:text-[#0b57d0]"
              } ${h.level === 3 ? "ml-4" : "ml-0"}`}
            >
              {activeId === h.id && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#0b57d0]" />
              )}
              <span className="line-clamp-2">{h.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
