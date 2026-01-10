/**
 * GitHub CMS Configuration
 * 
 * Configure your GitHub repository details here.
 * Set USE_GITHUB_CMS to true to fetch posts from GitHub at runtime.
 * Set to false to use local markdown files at build-time.
 */

export const GITHUB_CONFIG = {
  // Enable GitHub CMS (true) or use local files (false)
  USE_GITHUB_CMS: false, // Change to true to fetch from GitHub

  // Your GitHub username
  USERNAME: "tejassathe010",

  // Repository name (can be same repo or separate content repo)
  REPO: "arch-blog",

  // Branch name
  BRANCH: "main",

  // Path to posts directory in the repo
  POSTS_PATH: "src/posts",

  // Enable caching to reduce API calls
  ENABLE_CACHE: true,

  // Cache duration in milliseconds (1 hour default)
  CACHE_DURATION: 60 * 60 * 1000,
};

/**
 * Build GitHub raw content URL
 */
export function buildGitHubUrl(slug, category) {
  const { USERNAME, REPO, BRANCH, POSTS_PATH } = GITHUB_CONFIG;
  const fileName = `${slug}.md`;
  const path = `${POSTS_PATH}/${category}/${fileName}`;
  return `https://raw.githubusercontent.com/${USERNAME}/${REPO}/${BRANCH}/${path}`;
}

/**
 * Build GitHub API URL for directory listing
 */
export function buildGitHubApiUrl(category) {
  const { USERNAME, REPO, BRANCH, POSTS_PATH } = GITHUB_CONFIG;
  return `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${POSTS_PATH}/${category}?ref=${BRANCH}`;
}