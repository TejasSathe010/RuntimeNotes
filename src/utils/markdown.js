/**
 * Markdown processing utilities
 */

import { slugifyHeading } from "./common";

/**
 * Extract text from MDAST node
 */
export function mdastText(node) {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node)) return node.map(mdastText).join("");
  if (Array.isArray(node.children)) return node.children.map(mdastText).join("");
  return "";
}

/**
 * Remark plugin: Add stable + UNIQUE heading ids
 */
export function remarkHeadingIds() {
  return (tree) => {
    const counts = new Map();

    const walk = (n) => {
      if (!n || typeof n !== "object") return;

      if (n.type === "heading") {
        const text = mdastText(n.children || []).trim();
        const base = slugifyHeading(text || "section");
        const next = (counts.get(base) || 0) + 1;
        counts.set(base, next);

        const id = next === 1 ? base : `${base}-${next}`;
        n.data = n.data || {};
        n.data.hProperties = n.data.hProperties || {};
        n.data.hProperties.id = id;
      }

      if (Array.isArray(n.children)) n.children.forEach(walk);
    };

    walk(tree);
  };
}

/**
 * Forward fenced code meta to HTML as data-meta
 */
export function remarkCodeMetaToDataAttrs() {
  return (tree) => {
    const stack = [tree];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;

      if (node.type === "code" && node.meta) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties["data-meta"] = String(node.meta);
      }

      const children = node.children;
      if (Array.isArray(children)) {
        for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
      }
    }
  };
}

/**
 * Extract "🔥 Takeaway" blocks from markdown
 */
export function extractTakeaways(markdown) {
  const lines = String(markdown || "").split("\n");
  const takeaways = [];

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] || "").trim();
    if (!/^🔥\s*takeaway\b/i.test(line)) continue;

    const bullets = [];
    for (let j = i + 1; j < lines.length; j++) {
      const t = (lines[j] || "").trim();
      if (!t) break;
      if (/^#{1,6}\s+/.test(t)) break;

      if (/^[-*•]\s+/.test(t)) bullets.push(t.replace(/^[-*•]\s+/, "").trim());
      else if (bullets.length > 0) bullets[bullets.length - 1] += ` ${t}`;
    }

    bullets.forEach((b) => b && takeaways.push(b));
  }

  const seen = new Set();
  return takeaways.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
}

/**
 * Parse code block meta information
 */
export function parseMeta(meta) {
  const m = String(meta || "").trim();
  if (!m) return { runner: false, template: null, title: null };

  const runner = /\b(runner|live|playground)\b/i.test(m);

  let template = null;
  let title = null;

  const re = /(\w+)=(("[^"]*")|\S+)/g;
  let match;
  while ((match = re.exec(m))) {
    const key = match[1];
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

    if (key === "template") template = val;
    if (key === "title") title = val;
    if (key === "runner") template = val;
  }

  const runnerEq = m.match(/\brunner=([^\s]+)/i);
  if (runnerEq?.[1]) template = runnerEq[1];

  return { runner, template, title };
}