import { useEffect } from "react";

function setMetaTag(attr, key, content) {
  if (!content) return;

  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function PostMetaTags({ post, slug }) {
  useEffect(() => {
    if (!post) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/post/${slug}`;

    const baseTitle = "Daily Tech Chronicles";
    const title = post.title
      ? `${post.title} | ${baseTitle}`
      : baseTitle;

    const rawSummary =
      post.summary ||
      (post.content || "").replace(/\s+/g, " ").slice(0, 180);

    const description = rawSummary.trim();

    const image =
      post.coverImage || `${origin}/og-default.png`; // optional default OG image

    // <title>
    document.title = title;

    // <link rel="canonical">
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Basic SEO
    setMetaTag("name", "description", description);

    // OpenGraph
    setMetaTag("property", "og:type", "article");
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", url);
    setMetaTag("property", "og:image", image);

    // Twitter
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);

    // JSON-LD structured data
    const ldId = "post-structured-data";
    let script = document.getElementById(ldId);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = ldId;
      document.head.appendChild(script);
    }

    const published = post.date
      ? new Date(post.date).toISOString()
      : undefined;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image,
      datePublished: published,
      dateModified: published,
      url,
      author: {
        "@type": "Person",
        name: "Tejas Sathe",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    };

    script.textContent = JSON.stringify(structuredData);

    // no cleanup: we want tags to stay until another page overwrites them
  }, [post, slug]);

  return null;
}
