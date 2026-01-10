/**
 * GitHub CMS - Runtime post fetching from GitHub
 */

import yaml from "js-yaml";
import { GITHUB_CONFIG, buildGitHubUrl, buildGitHubApiUrl } from "../config/github";

const CACHE_KEY = "github_posts_cache";
const CACHE_TIMESTAMP_KEY = "github_posts_cache_timestamp";

/**
 * Parse frontmatter from markdown
 */
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

/**
 * Get cache if valid
 */
function getCachedPosts() {
  if (!GITHUB_CONFIG.ENABLE_CACHE || typeof window === "undefined") return null;

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > GITHUB_CONFIG.CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }

    return JSON.parse(cached);
  } catch {
    return null;
  }
}

/**
 * Cache posts
 */
function cachePosts(posts) {
  if (!GITHUB_CONFIG.ENABLE_CACHE || typeof window === "undefined") return;

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(posts));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch (err) {
    console.warn("Failed to cache posts:", err);
  }
}

/**
 * Fetch markdown file from GitHub
 */
async function fetchPostFromGitHub(slug, category) {
  const url = buildGitHubUrl(slug, category);
  
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/plain",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Post not found: ${slug}`);
      }
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }

    const raw = await response.text();
    const { data, content } = parseFrontmatter(raw);

    return {
      slug,
      category,
      ...data,
      content,
    };
  } catch (err) {
    console.error(`Error fetching post ${slug} from GitHub:`, err);
    throw err;
  }
}

/**
 * List posts in a category from GitHub
 */
async function listPostsInCategory(category) {
  try {
    const url = buildGitHubApiUrl(category);
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to list posts in category ${category}:`, response.status);
      return [];
    }

    const files = await response.json();
    return files
      .filter((file) => file.type === "file" && file.name.endsWith(".md"))
      .map((file) => file.name.replace(".md", ""));
  } catch (err) {
    console.warn(`Error listing posts in category ${category}:`, err);
    return [];
  }
}

/**
 * Get all posts from GitHub
 * 
 * Attempts to use a manifest file first, then falls back to hardcoded categories.
 * You can improve performance by maintaining a posts-manifest.json in your repo.
 */
export async function getPostsFromGitHub() {
  // Check cache first
  const cached = getCachedPosts();
  if (cached) {
    return cached;
  }

  let categories = ["SystemDesign", "DSA", "GenAI"]; // Default fallback

  // Try to load from manifest for better performance
  try {
    const { getPostsManifestFromGitHub } = await import("./posts-manifest");
    const manifest = await getPostsManifestFromGitHub();
    if (manifest?.categories && Array.isArray(manifest.categories)) {
      categories = manifest.categories.map((cat) => cat.name || cat.path);
    }
  } catch (err) {
    // Manifest not available, use default categories
    console.debug("Manifest not available, using default categories");
  }

  const allPosts = [];

  for (const category of categories) {
    try {
      const slugs = await listPostsInCategory(category);
      
      for (const slug of slugs) {
        try {
          const post = await fetchPostFromGitHub(slug, category);
          allPosts.push(post);
        } catch (err) {
          console.warn(`Failed to fetch ${slug}:`, err);
        }
      }
    } catch (err) {
      console.warn(`Failed to process category ${category}:`, err);
    }
  }

  // Normalize category names
  const normalized = allPosts.map((post) => {
    const normalizedCategory = post.category?.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() || "uncategorized";
    return {
      ...post,
      category: normalizedCategory,
    };
  });

  // Sort by date
  const sorted = normalized.sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  // Cache the results
  cachePosts(sorted);

  return sorted;
}

/**
 * Get a single post by slug from GitHub
 */
export async function getPostBySlugFromGitHub(slug) {
  // Try common categories
  const categories = ["SystemDesign", "DSA", "GenAI"];
  
  for (const category of categories) {
    try {
      const post = await fetchPostFromGitHub(slug, category);
      return {
        ...post,
        category: category.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
      };
    } catch (err) {
      // Try next category
      continue;
    }
  }

  throw new Error(`Post not found: ${slug}`);
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearGitHubCache() {
  if (typeof window === "undefined") return;
  
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
}