/**
 * Shared constants used across the application
 */

export const CATEGORY_PRESETS = [
  { key: "system-design", label: "System Design" },
  { key: "genai", label: "GenAI" },
  { key: "dsa", label: "DSA" },
];

export const READING_FILTERS = [
  { key: "all", label: "Any length" },
  { key: "short", label: "≤ 5 min" },
  { key: "med", label: "6–10 min" },
  { key: "long", label: "10+ min" },
];

export const SORTS = [
  { key: "new", label: "Newest" },
  { key: "old", label: "Oldest" },
  { key: "rel", label: "Relevance" },
];

export const STORAGE_KEYS = {
  POSTS_CACHE: "runtimenotes_posts_cache_v1",
  RECENTS: "runtimenotes_recent_slugs_v1",
  SAVED: "runtimenotes_saved_slugs_v1",
};

export const TITLE_PREFIX = "RuntimeNotes";

/**
 * Get category label from key
 */
export function categoryLabelFromKey(key) {
  const preset = CATEGORY_PRESETS.find((c) => c.key === key);
  return preset?.label ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get reading time bucket
 */
export function readingBucket(mins) {
  if (mins <= 5) return "short";
  if (mins <= 10) return "med";
  return "long";
}