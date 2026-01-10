import { createElement } from "react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function normalizeKey(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function startCaseFromKey(key) {
  return String(key || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function safeMs(d) {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function wordCount(s) {
  return String(s || "").trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutesFromContent(content) {
  const w = wordCount(content);
  return Math.max(1, Math.ceil(w / 220));
}

export function safeJsonParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

export function getScrollbarWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function slugifyHeading(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node.props) return extractText(node.props.children);
  return "";
}

export function formatCategory(label) {
  return (label || "Architecture")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function safeDate(d) {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
}

export function clampText(s, n = 220) {
  const t = String(s || "").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n).trim()}…`;
}

export function buildHighlights(text, indices) {
  if (!text || !indices || indices.length === 0) return text;

  const ranges = [...indices]
    .map(([s, e]) => [Math.max(0, s), Math.min(text.length - 1, e)])
    .sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (!last || r[0] > last[1] + 1) merged.push([...r]);
    else last[1] = Math.max(last[1], r[1]);
  }

  const out = [];
  let cursor = 0;

  for (let i = 0; i < merged.length; i++) {
    const [s, e] = merged[i];
    if (cursor < s) out.push(text.slice(cursor, s));
    out.push(
      createElement(
        "mark",
        {
          key: `m-${i}-${s}-${e}`,
          className: "rounded-sm bg-primary/15 px-1 py-0.5 text-neutral-900 dark:text-neutral-50",
        },
        text.slice(s, e + 1)
      )
    );
    cursor = e + 1;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
