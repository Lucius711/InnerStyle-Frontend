import { useEffect } from "react";

const SITE_NAME = "InnerStyle";
const DEFAULT_DESC =
  "InnerStyle turns 2D images & text prompts into textured, rigged, animated 3D models — powered by an AI pipeline.";

function upsertMeta(selector, attr, name, content) {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route SEO. Sets <title>, description, robots, canonical and Open Graph / Twitter tags.
 * Lightweight (no react-helmet dependency).
 */
export default function Seo({ title, description, canonical, noindex = false, image }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — 2D & Text → Animated 3D`;
    const desc = description || DEFAULT_DESC;
    const url = canonical || window.location.href;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex,nofollow" : "index,follow");

    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    if (image) upsertMeta('meta[property="og:image"]', "property", "og:image", image);

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    if (image) upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    upsertCanonical(url);
  }, [title, description, canonical, noindex, image]);

  return null;
}
