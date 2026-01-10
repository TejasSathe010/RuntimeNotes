import yaml from "js-yaml";
import { GITHUB_CONFIG } from "../config/github";
import { 
  getPostsFromGitHub, 
  getPostBySlugFromGitHub 
} from "./githubPosts";

/* ---------- Frontmatter ---------- */
function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!match) return { data: {}, content: raw };

  try {
    return {
      data: yaml.load(match[1]) || {},
      content: raw.slice(match[0].length).trim(),
    };
  } catch (err) {
    console.warn("Failed to parse frontmatter:", err);
    return { data: {}, content: raw };
  }
}

/* ---------- Local Posts (Build-time) ---------- */
const postFiles = import.meta.glob("../posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const allPostsLocal = Object.entries(postFiles).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw);
  const parts = path.split("/");
  const folder = parts.at(-2);

  return {
    slug: parts.at(-1).replace(".md", ""),
    category: folder.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
    ...data,
    content,
  };
});

/* ---------- Exports ---------- */

/**
 * Get all posts
 * Uses GitHub CMS if enabled, otherwise uses local files
 * Always returns a Promise for consistency
 */
export async function getPosts() {
  if (GITHUB_CONFIG.USE_GITHUB_CMS) {
    try {
      return await getPostsFromGitHub();
    } catch (err) {
      console.error("Failed to fetch posts from GitHub, falling back to local:", err);
      // Fallback to local in case of error
      return Promise.resolve([...allPostsLocal].sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      ));
    }
  }

  // Local build-time posts (return as Promise for consistency)
  return Promise.resolve([...allPostsLocal].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  ));
}

/**
 * Get post by slug
 * Uses GitHub CMS if enabled, otherwise uses local files
 * Always returns a Promise for consistency
 */
export async function getPostBySlug(slug) {
  if (GITHUB_CONFIG.USE_GITHUB_CMS) {
    try {
      return await getPostBySlugFromGitHub(slug);
    } catch (err) {
      console.error(`Failed to fetch post ${slug} from GitHub, falling back to local:`, err);
      // Fallback to local
      const post = allPostsLocal.find((p) => p.slug === slug);
      if (!post) throw new Error(`Post not found: ${slug}`);
      return Promise.resolve(post);
    }
  }

  // Local build-time posts (return as Promise for consistency)
  const post = allPostsLocal.find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return Promise.resolve(post);
}