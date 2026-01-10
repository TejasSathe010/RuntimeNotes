/**
 * Posts Manifest Loader
 * 
 * For better performance with GitHub CMS, maintain a manifest.json file
 * in your repo that lists all posts. This reduces API calls significantly.
 */

import { GITHUB_CONFIG } from "../config/github";

/**
 * Fetch posts manifest from GitHub
 */
export async function getPostsManifestFromGitHub() {
  const { USERNAME, REPO, BRANCH } = GITHUB_CONFIG;
  const manifestUrl = `https://raw.githubusercontent.com/${USERNAME}/${REPO}/${BRANCH}/posts-manifest.json`;

  try {
    const response = await fetch(manifestUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn("Failed to fetch posts manifest:", err);
    return null;
  }
}

/**
 * Use manifest to get list of posts (more efficient than discovering)
 */
export async function getPostsFromManifest() {
  const manifest = await getPostsManifestFromGitHub();
  if (!manifest || !manifest.categories) {
    return null;
  }

  // Return category list from manifest
  return manifest.categories.map((cat) => ({
    name: cat.name,
    path: cat.path,
    normalized: cat.normalized || cat.name.toLowerCase(),
  }));
}