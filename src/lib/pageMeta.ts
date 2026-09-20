/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared client-side SEO helper. Every SPA route applies its own title,
 * description, canonical and social tags through here so Google never sees
 * duplicate titles / descriptions across the site's clean URLs.
 *
 * Static-route copy lives in src/config/pageMeta.json (single source shared
 * with the build-time prerender); dynamic routes (volumes, episodes,
 * singers, archive questions) build their meta at render time.
 */

import { useEffect } from 'react';
import RAW from '../config/pageMeta.json';

export const SITE_URL = 'https://www.saulspodship.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icons/brand-logo.png`;

export interface RouteMeta {
  title: string;
  description: string;
  keywords?: string[];
  /** path portion, e.g. "/about" — canonical is always SITE_URL + path */
  path: string;
  image?: string;
  /** article (volumes, episodes…) vs website (index pages) */
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

type StaticEntry = { title: string; description: string; keywords?: string[]; image?: string };

const STATIC_META = RAW as unknown as Record<string, StaticEntry>;

/** Look up the curated meta for an exact static path ("/about" — not prefixes). */
export function staticMetaFor(pathname: string): RouteMeta | null {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  const entry = STATIC_META[clean];
  if (!entry) return null;
  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords,
    path: clean === '/' ? '/' : clean,
    image: entry.image?.startsWith('/') ? `${SITE_URL}${entry.image}` : entry.image,
    ogType: 'website',
  };
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.remove();
}

/** Apply a full meta set to document.head. Idempotent; safe to call per route. */
export function applyPageMeta(meta: RouteMeta) {
  const canonical = meta.path.startsWith('http') ? meta.path : `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`;
  const image = meta.image || DEFAULT_OG_IMAGE;

  document.title = meta.title;

  upsertMeta('name', 'description', meta.description);
  if (meta.keywords?.length) {
    upsertMeta('name', 'keywords', meta.keywords.join(', '));
  }
  upsertMeta('name', 'robots', meta.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large');
  if (meta.noindex) {
    upsertMeta('name', 'googlebot', 'noindex, nofollow');
  } else {
    upsertMeta('name', 'googlebot', 'index, follow, max-snippet:-1');
  }

  upsertMeta('property', 'og:type', meta.ogType || 'website');
  upsertMeta('property', 'og:site_name', "Saul's Podship");
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:image', image);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);
  upsertMeta('name', 'twitter:image', image);

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = canonical;
}

/** Remove crawler noindex (used when leaving a noindex page — applyPageMeta covers it). */
export function clearNoindex() {
  removeMeta('name', 'robots');
  removeMeta('name', 'googlebot');
}

/** React hook: apply meta on mount / when inputs change. */
export function usePageMeta(meta: RouteMeta) {
  useEffect(() => {
    applyPageMeta(meta);
    // Re-apply canonical host if the prerendered shell carried a stale one.
  }, [meta.title, meta.description, meta.path, meta.image, meta.ogType, meta.noindex]); // eslint-disable-line react-hooks/exhaustive-deps
}
