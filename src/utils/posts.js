import yaml from "js-yaml";

/* ---------- Frontmatter ---------- */
function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!match) return { data: {}, content: raw };

  return {
    data: yaml.load(match[1]),
    content: raw.slice(match[0].length).trim(),
  };
}

const postFiles = import.meta.glob("../posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const allPosts = Object.entries(postFiles).map(([path, raw]) => {
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

export function getPosts() {
  return [...allPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug) {
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
}
