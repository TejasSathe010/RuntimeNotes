import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  LayoutGroup,
} from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  XCircle,
  ArrowUpRight,
  SlidersHorizontal,
  Sparkles,
  Command,
  Hash,
  Clock,
  Check,
  Filter,
  X,
  Bookmark,
  History,
} from "lucide-react";
import Fuse from "fuse.js";
import { getPosts } from "../utils/posts";
import ArchitecturalMesh from "../components/ArchitecturalMesh";
import ParticleField from "../components/ParticleField";
import {
  cn,
  normalizeKey,
  startCaseFromKey,
  formatDate,
  safeMs,
  wordCount,
  readingMinutesFromContent,
  safeJsonParse,
  buildHighlights,
} from "../utils/common";
import {
  CATEGORY_PRESETS,
  READING_FILTERS,
  SORTS,
  STORAGE_KEYS,
  categoryLabelFromKey,
  readingBucket,
} from "../utils/constants";
import { getLocalArray, setLocalArray, addToLocalArray } from "../utils/localStorage";
import Toast from "../components/Toast";
import SearchBar from "../components/home/SearchBar";
import FilterBadges from "../components/home/FilterBadges";
import CategoryFilters from "../components/home/CategoryFilters";
import PostGrid from "../components/home/PostGrid";
import CommandPalette from "../components/home/CommandPalette";
import FeaturedPost from "../components/home/FeaturedPost";
import RecentSavedPosts from "../components/home/RecentSavedPosts";
import { useToast } from "../hooks/useToast";

export default function Home() {
  const reduceMotion = useReducedMotion();

  const searchRef = useRef(null);
  const paletteRef = useRef(null);
  const paletteInputRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const toastTimerRef = useRef(0);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL -> initial state
  const initialQuery = searchParams.get("q") ?? "";
  const initialSort = searchParams.get("sort") ?? "new";
  const rawCat = searchParams.get("cat");
  const initialCatKey = rawCat ? normalizeKey(rawCat) : "all";

  const rawTags = searchParams.get("tags");
  const initialTags = rawTags
    ? rawTags
        .split(",")
        .map((t) => normalizeKey(t))
        .filter(Boolean)
    : [];

  const initialRt = searchParams.get("rt") ?? "all";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catKey, setCatKey] = useState(initialCatKey || "all");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [tagKeys, setTagKeys] = useState(initialTags);
  const [rt, setRt] = useState(
    READING_FILTERS.some((x) => x.key === initialRt) ? initialRt : "all"
  );

  const deferredQuery = useDeferredValue(query);

  const [paletteOpen, setPaletteOpen] = useState(false);

  const [savedSlugs, setSavedSlugs] = useState(() => getLocalArray(STORAGE_KEYS.SAVED));
  const [recentSlugs, setRecentSlugs] = useState(() => getLocalArray(STORAGE_KEYS.RECENTS));

  const [toastMsg, showToast] = useToast();

  /** ------------------ Load posts: cache-first, revalidate ------------------ */
  useEffect(() => {
    let alive = true;

    const fromCache = () => {
      if (typeof window === "undefined") return null;
      const cached = safeJsonParse(window.sessionStorage.getItem(STORAGE_KEYS.POSTS_CACHE), null);
      if (!cached || !Array.isArray(cached?.data)) return null;
      return cached.data;
    };

    const writeCache = (data) => {
      if (typeof window === "undefined") return;
      window.sessionStorage.setItem(STORAGE_KEYS.POSTS_CACHE, JSON.stringify({ ts: Date.now(), data }));
    };

    (async () => {
      try {
        setLoading(true);

        const cachedData = fromCache();
        if (cachedData && alive) {
          setPosts(cachedData);
          setLoading(false);
        }

        const data = await Promise.resolve(getPosts());
        if (!alive) return;
        const final = Array.isArray(data) ? data : [];
        setPosts(final);
        writeCache(final);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /** ------------------ Multi-tab sync for saved/recents ------------------ */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.SAVED) setSavedSlugs(getLocalArray(STORAGE_KEYS.SAVED));
      if (e.key === STORAGE_KEYS.RECENTS) setRecentSlugs(getLocalArray(STORAGE_KEYS.RECENTS));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /** ------------------ URL changes (back/forward) -> state ------------------ */
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const s = searchParams.get("sort") ?? "new";
    const rc = searchParams.get("cat");
    const c = rc ? normalizeKey(rc) : "all";

    const rawT = searchParams.get("tags");
    const t = rawT
      ? rawT
          .split(",")
          .map((x) => normalizeKey(x))
          .filter(Boolean)
      : [];

    const nextRt = searchParams.get("rt") ?? "all";

    if (q !== query) setQuery(q);
    if (s !== sort) setSort(s);
    if ((c || "all") !== catKey) setCatKey(c || "all");

    const a = (tagKeys || []).join(",");
    const b = (t || []).join(",");
    if (a !== b) setTagKeys(t);

    if (nextRt !== rt && READING_FILTERS.some((x) => x.key === nextRt)) setRt(nextRt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /** ------------------ Keyboard shortcuts ------------------ */
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const isTypingContext =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if (!paletteOpen && !isTypingContext && e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus?.();
      }

      const isK = e.key?.toLowerCase?.() === "k";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen(true);
      }

      if (e.key === "Escape") {
        if (paletteOpen) setPaletteOpen(false);
        else if (query.trim()) setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, query]);

  /** ------------------ Palette open: lock scroll + focus mgmt ------------------ */
  useEffect(() => {
    if (!paletteOpen) return;

    lastFocusedRef.current = document.activeElement;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      paletteInputRef.current?.focus?.();
      paletteInputRef.current?.select?.();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") setPaletteOpen(false);
      if (e.key !== "Tab") return;

      const root = paletteRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll(
          'button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);

      const el = lastFocusedRef.current;
      el?.focus?.();
      lastFocusedRef.current = null;
    };
  }, [paletteOpen]);

  /** ------------------ Normalize posts ------------------ */
  const normalizedPosts = useMemo(() => {
    return (posts || []).map((p) => {
      const cKey = normalizeKey(p.category || "") || "uncategorized";

      const tagsRaw = Array.isArray(p.tags) ? p.tags : [];
      const tagsNorm = tagsRaw.map((t) => normalizeKey(t)).filter(Boolean);

      const readingMin = Number.isFinite(p.__readingMin)
        ? p.__readingMin
        : readingMinutesFromContent(p?.content);

      return {
        ...p,
        categoryKey: cKey,
        categoryLabel: categoryLabelFromKey(cKey),
        __dateMs: safeMs(p?.date),
        __readingMin: readingMin,
        __readingBucket: readingBucket(readingMin),
        __tagKeys: tagsNorm,
        __tagLabels: tagsRaw,
      };
    });
  }, [posts]);

  /** ------------------ Categories + counts ------------------ */
  const categories = useMemo(() => {
    const discoveredKeys = new Set();
    for (const p of normalizedPosts) discoveredKeys.add(p.categoryKey || "uncategorized");

    const presetKeys = new Set(CATEGORY_PRESETS.map((c) => c.key));
    const extraKeys = Array.from(discoveredKeys)
      .filter((k) => k && k !== "uncategorized" && !presetKeys.has(k))
      .sort((a, b) => categoryLabelFromKey(a).localeCompare(categoryLabelFromKey(b)));

    const keys = ["all", ...CATEGORY_PRESETS.map((c) => c.key), ...extraKeys];
    if (discoveredKeys.has("uncategorized")) keys.push("uncategorized");

    return keys.map((k) => ({ key: k, label: k === "all" ? "All" : categoryLabelFromKey(k) }));
  }, [normalizedPosts]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    counts.set("all", normalizedPosts.length);
    for (const p of normalizedPosts) {
      const k = p.categoryKey || "uncategorized";
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
  }, [normalizedPosts]);

  useEffect(() => {
    if (catKey === "all") return;
    if (!categoryCounts.has(catKey)) setCatKey("all");
  }, [catKey, categoryCounts]);

  /** ------------------ Tags ------------------ */
  const tagCounts = useMemo(() => {
    const map = new Map();
    for (const p of normalizedPosts) {
      for (const t of p.__tagKeys || []) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return map;
  }, [normalizedPosts]);

  const topTags = useMemo(() => {
    const entries = Array.from(tagCounts.entries());
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return entries.slice(0, 10).map(([key, count]) => ({
      key,
      label: startCaseFromKey(key),
      count,
    }));
  }, [tagCounts]);

  /** ------------------ Fuse: include matches for highlighting ------------------ */
  const fuse = useMemo(() => {
    return new Fuse(normalizedPosts, {
      includeMatches: true,
      includeScore: true,
      keys: [
        { name: "title", weight: 0.56 },
        { name: "summary", weight: 0.28 },
        { name: "categoryLabel", weight: 0.10 },
        { name: "__tagLabels", weight: 0.06 },
      ],
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [normalizedPosts]);

  /** ------------------ Filtering + highlighting ------------------ */
  const filtered = useMemo(() => {
    const q = deferredQuery.trim();

    let list = normalizedPosts;

    if (catKey !== "all") {
      list = list.filter((p) => (p.categoryKey || "uncategorized") === catKey);
    }

    if (tagKeys.length > 0) {
      list = list.filter((p) => {
        const set = new Set(p.__tagKeys || []);
        return tagKeys.every((t) => set.has(t));
      });
    }

    if (rt !== "all") {
      list = list.filter((p) => p.__readingBucket === rt);
    }

    if (q) {
      const results = fuse.search(q);
      const items = results.map((r) => {
        const m = r.matches || [];
        const titleMatch = m.find((x) => x.key === "title")?.indices || [];
        const summaryMatch = m.find((x) => x.key === "summary")?.indices || [];
        return {
          ...r.item,
          __match: {
            title: titleMatch,
            summary: summaryMatch,
          },
        };
      });

      if (sort === "rel") return items;
      list = items;
    }

    if (sort === "rel" && q) return list;
    const dir = sort === "old" ? 1 : -1;
    return [...list].sort((a, b) => (a.__dateMs - b.__dateMs) * dir);
  }, [normalizedPosts, catKey, tagKeys, rt, deferredQuery, fuse, sort]);

  const featured = useMemo(() => {
    return normalizedPosts?.find((p) => p.featured) ?? normalizedPosts?.[0] ?? null;
  }, [normalizedPosts]);

  const hasAnyActive = useMemo(() => {
    return query.trim() || catKey !== "all" || sort !== "new" || tagKeys.length > 0 || rt !== "all";
  }, [query, catKey, sort, tagKeys, rt]);

  const showFeatured = !loading && featured && !hasAnyActive;

  /** ------------------ Sync state -> URL ------------------ */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    const q = query.trim();
    if (q) next.set("q", q);
    else next.delete("q");

    if (catKey && catKey !== "all") next.set("cat", catKey);
    else next.delete("cat");

    if (sort && sort !== "new") next.set("sort", sort);
    else next.delete("sort");

    if (tagKeys.length > 0) next.set("tags", tagKeys.join(","));
    else next.delete("tags");

    if (rt && rt !== "all") next.set("rt", rt);
    else next.delete("rt");

    const currentStr = searchParams.toString();
    const nextStr = next.toString();
    if (currentStr !== nextStr) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, catKey, sort, tagKeys, rt]);

  /** ------------------ Actions ------------------ */
  const clearAll = useCallback(() => {
    setQuery("");
    setCatKey("all");
    setSort("new");
    setTagKeys([]);
    setRt("all");
  }, []);

  const toggleTag = useCallback((t) => {
    setTagKeys((prev) => {
      const set = new Set(prev);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      return Array.from(set);
    });
  }, []);

  const removeBadge = useCallback((kind, value) => {
    if (kind === "q") setQuery("");
    if (kind === "cat") setCatKey("all");
    if (kind === "sort") setSort("new");
    if (kind === "rt") setRt("all");
    if (kind === "tag") setTagKeys((prev) => prev.filter((x) => x !== value));
  }, []);

  const activeBadges = useMemo(() => {
    const out = [];
    const q = query.trim();
    if (q) out.push({ kind: "q", value: q, label: `Query: ${q}` });

    if (catKey !== "all") {
      out.push({ kind: "cat", value: catKey, label: `Category: ${categoryLabelFromKey(catKey)}` });
    }

    if (tagKeys.length > 0) {
      tagKeys.forEach((t) =>
        out.push({ kind: "tag", value: t, label: `Tag: ${startCaseFromKey(t)}` })
      );
    }

    if (rt !== "all") {
      const lbl = READING_FILTERS.find((x) => x.key === rt)?.label ?? "Reading";
      out.push({ kind: "rt", value: rt, label: `Length: ${lbl}` });
    }

    if (sort !== "new") {
      const s = SORTS.find((x) => x.key === sort)?.label ?? "Sort";
      out.push({ kind: "sort", value: sort, label: `Sort: ${s}` });
    }

    return out;
  }, [query, catKey, tagKeys, rt, sort]);

  const metaText = useMemo(() => {
    if (loading) return "Loading articles…";
    const n = filtered.length;
    const q = deferredQuery.trim();
    return `${n} article${n === 1 ? "" : "s"} ${q ? "matched" : "available"}`;
  }, [loading, filtered.length, deferredQuery]);

  /** ------------------ Recents + saved display ------------------ */
  const recentPosts = useMemo(() => {
    if (!recentSlugs.length) return [];
    const map = new Map(normalizedPosts.map((p) => [p.slug, p]));
    return recentSlugs.map((s) => map.get(s)).filter(Boolean).slice(0, 4);
  }, [recentSlugs, normalizedPosts]);

  const savedPosts = useMemo(() => {
    if (!savedSlugs.length) return [];
    const map = new Map(normalizedPosts.map((p) => [p.slug, p]));
    return savedSlugs.map((s) => map.get(s)).filter(Boolean).slice(0, 4);
  }, [savedSlugs, normalizedPosts]);

  const onToggleSaved = useCallback(
    (slug) => {
      setSavedSlugs((prev) => {
        const set = new Set(prev);
        const nextIsSaved = !set.has(slug);

        if (nextIsSaved) set.add(slug);
        else set.delete(slug);

        const next = Array.from(set).slice(0, 64);
        setLocalArray(STORAGE_KEYS.SAVED, next);

        showToast(nextIsSaved ? "Saved" : "Removed from saved");
        return next;
      });
    },
    [showToast]
  );

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  /** ------------------ Chip styles ------------------ */
  // FIX: Selected timing capsules were white-on-light depending on theme primary.
  // Use a neutral high-contrast selected style (works regardless of primary color).
  const timingChipBase =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition " +
    "border border-neutral-200/70 dark:border-neutral-800/70 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const timingChipActive =
    "bg-neutral-900 text-white shadow-sm border-neutral-900/20 ring-1 ring-primary/20 " +
    "dark:bg-white dark:text-neutral-900 dark:border-white/25";

  const timingChipInactive =
    "bg-white/70 text-neutral-700 hover:bg-white " +
    "dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900";

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-950 dark:to-surface-dark transition-colors duration-700">
      {/* Toast */}
      <AnimatePresence>{toastMsg ? <Toast key={toastMsg} message={toastMsg} /> : null}</AnimatePresence>

      {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
        {!reduceMotion && (
          <div className="pointer-events-none absolute inset-0 z-0">
            <ParticleField quality="auto" />
            <div className="hidden sm:block">
              <ArchitecturalMesh quality="auto" />
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/60 via-white/40 to-white/65 dark:from-neutral-950/60 dark:via-neutral-950/28 dark:to-neutral-950/60" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 sm:pb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70 bg-white/75 dark:bg-neutral-900/55 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 shadow-sm">
            <Sparkles className="h-4 w-4 text-neutral-500" />
            Engineering notes, written clean.
          </div>

          <h1 className="mt-4 font-display font-extrabold tracking-tight bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% to-[#EA4335] bg-clip-text text-transparent text-[clamp(2.6rem,4.8vw,4.15rem)]">
            RuntimeNotes
          </h1>

          <p className="mt-5 mx-auto max-w-[62ch] text-[clamp(1.0rem,1.25vw,1.22rem)] leading-[1.75] text-neutral-700/90 dark:text-neutral-300">
            Deep dives into{" "}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-50">System Design</strong>,{" "}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-50">GenAI</strong>, and{" "}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-50">DSA</strong> — practical insights for builders.
          </p>

          {/* Search + controls */}
          <div className="mt-8 sm:mt-10 mx-auto max-w-[56ch]">
            <SearchBar
              query={query}
              setQuery={setQuery}
              onOpenPalette={openPalette}
            />

            {/* Filters */}
            <div className="mt-4 flex flex-col gap-3">
              {/* Categories row */}
              <div className="flex items-center justify-between gap-3">
                <CategoryFilters
                  categories={categories}
                  categoryCounts={categoryCounts}
                  catKey={catKey}
                  setCatKey={setCatKey}
                />

                {/* Sort + clear */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/60 px-3 py-2">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-transparent text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none"
                      aria-label="Sort posts"
                    >
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasAnyActive && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                                 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm
                                 text-neutral-700 dark:text-neutral-200 hover:border-primary/30 hover:text-primary transition-colors
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tags + reading time (compact) */}
              <div className="flex flex-col gap-2">
                {/* Tags */}
                {topTags.length > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-1">
                      {topTags.map((t) => {
                        const active = tagKeys.includes(t.key);
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => toggleTag(t.key)}
                            aria-pressed={active}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                              "border border-neutral-200/70 dark:border-neutral-800/70",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                              active
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                : "bg-white/70 text-neutral-700 hover:bg-white dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                            )}
                            title={`${t.count} posts`}
                          >
                            <Hash className="h-3.5 w-3.5 opacity-70" />
                            <span>{t.label}</span>
                            <span className="tabular-nums text-[0.72rem] opacity-75">{t.count}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={openPalette}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium
                                   border border-neutral-200/70 dark:border-neutral-800/70
                                   bg-white/70 text-neutral-700 hover:bg-white
                                   dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:bg-neutral-900
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        aria-label="More filters"
                      >
                        <Filter className="h-3.5 w-3.5 opacity-70" />
                        More
                      </button>
                    </div>
                  </div>
                )}

                {/* Reading time (FIXED selected text visibility) */}
                <div className="flex items-center justify-center">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 pr-1">
                    {READING_FILTERS.map((r) => {
                      const active = rt === r.key;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRt(r.key)}
                          aria-pressed={active}
                          className={cn(
                            timingChipBase,
                            active ? timingChipActive : timingChipInactive
                          )}
                        >
                          <Clock
                            className={cn(
                              "h-3.5 w-3.5",
                              active
                                ? "text-white/90 dark:text-neutral-900/80"
                                : "text-neutral-500 dark:text-neutral-300"
                            )}
                          />
                          <span className={cn(active ? "text-white dark:text-neutral-900" : "")}>
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile sort */}
                <div className="sm:hidden flex justify-end">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/60 px-3 py-2">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-transparent text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none"
                      aria-label="Sort posts"
                    >
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active badges */}
                <FilterBadges activeBadges={activeBadges} onRemoveBadge={removeBadge} hasAnyActive={hasAnyActive} />

                {/* Subtle “confidence” line (psych UX: reduces uncertainty) */}
                <p className="mt-1 text-[0.78rem] text-neutral-500/85 dark:text-neutral-400/85">
                  {loading ? "Indexing…" : "Use filters to narrow quickly — results update instantly."}
                </p>
              </div>
            </div>

            {/* Meta */}
            <p aria-live="polite" className="mt-3 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {metaText}
            </p>

            {/* Cmd hint */}
            <p className="mt-1 hidden sm:block text-[0.78rem] text-neutral-500/80 dark:text-neutral-400/80">
              Tip: press <span className="font-semibold">⌘K</span> for quick filters.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        query={query}
        setQuery={setQuery}
        catKey={catKey}
        setCatKey={setCatKey}
        sort={sort}
        setSort={setSort}
        tagKeys={tagKeys}
        toggleTag={toggleTag}
        rt={rt}
        setRt={setRt}
        categories={categories}
        categoryCounts={categoryCounts}
        tagCounts={tagCounts}
        hasAnyActive={hasAnyActive}
        metaText={metaText}
        onClose={closePalette}
        onClearAll={clearAll}
      />

      {/* Recent/Saved Posts */}
      {!loading && (recentPosts.length > 0 || savedPosts.length > 0) && (
        <RecentSavedPosts
          recentPosts={recentPosts}
          savedPosts={savedPosts}
          onRecentClick={setRecentSlugs}
        />
      )}

      {/* Featured Post */}
      {showFeatured && (
        <FeaturedPost post={featured} onPostClick={setRecentSlugs} />
      )}

      {/* ---------- GRID ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-6 shadow-sm"
              >
                <div className="h-5 w-28 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div className="mt-4 h-6 w-5/6 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div className="mt-3 h-4 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div className="mt-2 h-4 w-5/6 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div className="mt-5 h-4 w-24 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-neutral-900 dark:text-neutral-50 font-semibold">No posts found.</p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Try a different query, or clear filters.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                           bg-white dark:bg-neutral-900 px-4 py-2 text-sm
                           text-neutral-700 dark:text-neutral-200 hover:border-primary/30 hover:text-primary transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={openPalette}
                className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white
                           hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                           dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Open filters
              </button>
            </div>
          </div>
        ) : (
          <PostGrid
            posts={filtered.map((p) => {
              const titleNode =
                p.__match?.title?.length
                  ? buildHighlights(p.title, p.__match.title)
                  : p.title;
              const summaryNode =
                p.__match?.summary?.length
                  ? buildHighlights(p.summary || "", p.__match.summary)
                  : p.summary;
              return {
                ...p,
                title: titleNode,
                summary: summaryNode,
              };
            })}
            savedSlugs={savedSlugs}
            setRecentSlugs={setRecentSlugs}
            onToggleSaved={onToggleSaved}
          />
        )}
      </section>
    </main>
  );
}
