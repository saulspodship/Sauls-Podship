/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Post-build SEO gate — the regression guard for the Ahrefs Site Audit of
 * 2 Nov 2026 (see docs/SITE_AUDIT_2026-11-02.md).
 *
 * Why this exists: several of the flagged issues were not authoring mistakes but
 * build-order accidents. `prerender-seo.mjs` rewrites dist/encyclopedia/<slug>/
 * index.html after `postbuild.mjs` has written it, which silently dropped the
 * per-volume Article JSON-LD — 95 of the 101 "Article page missing schema" URLs
 * were that one overwrite. Nothing in the build noticed.
 *
 * This script checks the *built output* against the sitemaps and fails the build
 * when a promised URL loses its canonical, its social metadata, its structured
 * data or its last internal link.
 *
 * Usage: node scripts/check-seo.mjs   (runs last in `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://www.saulspodship.com';
const OG_REQUIRED = ['og:title', 'og:type', 'og:description', 'og:image', 'og:url'];
const TWITTER_REQUIRED = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 170;

if (!fs.existsSync(path.join(dist, 'sitemap.xml'))) {
  console.error('[CHECK-SEO] dist/sitemap.xml missing — run the build first');
  process.exit(1);
}

const normalize = (value) =>
  (value === '/' ? '/' : value.replace(/\/+$/, '').replace(/\/index\.html$/, ''));

/* ---- every built HTML page, keyed by the URL path that serves it ---- */
const pages = new Map(); // urlPath -> { html, file }
const aliases = new Map(); // urlPath -> urlPath (flat .html files reachable without the extension)
const skipDirs = new Set(['assets', 'images', 'icons', 'i18n', 'fonts', 'data', 'engine']);
function walk(directory, relative = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walk(full, path.posix.join(relative, entry.name));
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(full, 'utf8');
    if (entry.name === 'index.html') {
      pages.set(normalize(`/${relative}`), { html, file: full });
    } else {
      pages.set(normalize(`/${path.posix.join(relative, entry.name)}`), { html, file: full });
    }
  }
}
walk(dist);

/* A flat dist/<path>.html is also served at /<path> through a vercel.json rewrite. */
const rewrites = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).rewrites || [];
for (const rewrite of rewrites) {
  const destination = rewrite.destination?.replace(/^\//, '');
  const source = normalize(rewrite.source);
  if (!destination || !source.startsWith('/') || source.includes(':') || source.includes('(')) continue;
  const page = pages.get(`/${destination}`);
  if (page && !pages.has(source)) aliases.set(source, `/${destination}`);
}
const pageFor = (urlPath) => pages.get(aliases.get(urlPath) || urlPath);

const attr = (html, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<meta\\s+(?:name|property)="${escaped}"\\s+content="([^"]*)"`, 'i'));
  return match ? match[1] : '';
};
const canonicalOf = (html) =>
  html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
const isNoindex = (html) => /\bnoindex\b/i.test(attr(html, 'robots'));

/* ---- collect the sitemap promise ---- */
const sitemapFiles = ['sitemap.xml', 'sitemap-theological-archive.xml'];
const promised = [];
for (const file of sitemapFiles) {
  const full = path.join(dist, file);
  if (!fs.existsSync(full)) continue;
  for (const match of fs.readFileSync(full, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    promised.push(match[1] === SITE ? '/' : normalize(new URL(match[1]).pathname));
  }
}

/* ---- internal links, so "Orphan page" cannot come back ---- */
const inlinks = new Map([...pages.keys()].map((key) => [key, 0]));
for (const [from, { html }] of pages) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    const href = match[1];
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/.test(href)) continue;
    let url;
    try {
      url = new URL(href, `${SITE}${from === '/' ? '/' : `${from}/`}`);
    } catch {
      continue;
    }
    if (!['www.saulspodship.com', 'saulspodship.com'].includes(url.hostname)) continue;
    const resolved = normalize(url.pathname);
    const target = aliases.get(resolved) || resolved;
    if (target === from || !inlinks.has(target)) continue;
    inlinks.set(target, inlinks.get(target) + 1);
  }
}

const errors = [];
const fail = (urlPath, message) => errors.push(`${urlPath}: ${message}`);

for (const urlPath of promised) {
  const page = pageFor(urlPath);
  if (!page) {
    fail(urlPath, 'in a sitemap but no built HTML page');
    continue;
  }
  if (isNoindex(page.html)) continue;
  const canonical = canonicalOf(page.html);
  if (!canonical) {
    fail(urlPath, 'no canonical');
  } else if (normalize(new URL(canonical, SITE).pathname) !== urlPath) {
    fail(urlPath, `canonical points elsewhere (${canonical})`);
  }
  for (const key of OG_REQUIRED) if (!attr(page.html, key)) fail(urlPath, `missing ${key}`);
  for (const key of TWITTER_REQUIRED) if (!attr(page.html, key)) fail(urlPath, `missing ${key}`);
  const title = page.html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  if (!title) fail(urlPath, 'no <title>');
  else if (title.length > TITLE_MAX) fail(urlPath, `title is ${title.length} characters`);
  const description = attr(page.html, 'description');
  if (!description) fail(urlPath, 'no meta description');
  else if (description.length > DESCRIPTION_MAX) fail(urlPath, `meta description is ${description.length} characters`);
  if ((inlinks.get(aliases.get(urlPath) || urlPath) || 0) === 0) fail(urlPath, 'no internal links to this page (orphan)');
}

/* ---- content pages must publish Article structured data ----
 * These are the page families Ahrefs classifies as articles. Any of them that
 * ships without an Article node is missing the schema search engines read. */
const ARTICLE_FAMILIES = [
  /^\/encyclopedia(\/[^/]+)?$/,
  /^\/theological-archive(\/(question|category)\/[^/]+)?$/,
  /^\/music-archive\/[^/]+$/,
  /^\/(prophecy-map|kings-of-the-bible|comparative-apologetics|biblical-maps|scholarly-standards)(\.html)?$/,
  /^\/resources\/[^/]+$/,
];
const jsonLdNodes = (html, urlPath) => {
  const nodes = [];
  for (const [, body] of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(body);
      const roots = Array.isArray(data) ? data : [data];
      for (const root of roots) {
        if (root?.['@graph']) nodes.push(...root['@graph']);
        else if (root) nodes.push(root);
      }
    } catch {
      fail(urlPath || 'JSON-LD', 'a script block is not valid JSON');
    }
  }
  return nodes;
};
const hasType = (node, type) => Array.isArray(node?.['@type'])
  ? node['@type'].includes(type)
  : node?.['@type'] === type;
const hasArticle = (html, urlPath) =>
  jsonLdNodes(html, urlPath).some((node) =>
    ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'].some((type) => hasType(node, type)),
  );
const schemaOfType = (html, type, urlPath) =>
  jsonLdNodes(html, urlPath).find((node) => hasType(node, type));
const escapeText = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

for (const urlPath of promised) {
  if (!ARTICLE_FAMILIES.some((pattern) => pattern.test(urlPath))) continue;
  const page = pageFor(urlPath);
  if (!page || isNoindex(page.html)) continue;
  if (!hasArticle(page.html, urlPath)) fail(urlPath, 'content page without Article structured data');
}

/* ---- detailed volume crawlability / AEO regression checks ---- */
const volumes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/volumes/volumesData.json'), 'utf8'));
for (const volume of volumes) {
  const urlPath = `/encyclopedia/${volume.slug}`;
  const page = pageFor(urlPath);
  if (!page) {
    fail(urlPath, 'volume has no prerendered HTML');
    continue;
  }
  const article = schemaOfType(page.html, 'Article', urlPath);
  if (!article) fail(urlPath, 'missing Article JSON-LD');
  const faq = schemaOfType(page.html, 'FAQPage', urlPath);
  if (!faq) fail(urlPath, 'missing visible-volume FAQPage JSON-LD');
  else {
    const expected = (volume.faq || []).map((item) => item.q);
    const actual = (faq.mainEntity || []).map((item) => item.name);
    if (actual.length !== expected.length || expected.some((question) => !actual.includes(question))) {
      fail(urlPath, 'FAQPage JSON-LD does not match the visible volume FAQ data');
    }
  }
  const breadcrumb = schemaOfType(page.html, 'BreadcrumbList', urlPath);
  if (!breadcrumb) fail(urlPath, 'missing BreadcrumbList JSON-LD');
  else {
    const crumbs = breadcrumb.itemListElement || [];
    if (crumbs.length !== 3 || crumbs.at(-1)?.item !== `${SITE}${urlPath}`) {
      fail(urlPath, 'BreadcrumbList does not end at the canonical volume URL');
    }
  }
  if (!page.html.includes('id="quick-answer"') || !page.html.includes(escapeText(volume.summary || volume.overview || ''))) {
    fail(urlPath, 'missing crawlable answer-first volume summary');
  }
  if (volume.content?.analysis && !page.html.includes('id="volume-analysis"')) {
    fail(urlPath, 'detailed analysis is not present in prerendered HTML');
  }
  const markdownFile = path.join(dist, 'encyclopedia', `${volume.slug}.md`);
  if (!fs.existsSync(markdownFile)) fail(urlPath, 'missing full Markdown companion');
  if (!page.html.includes(`href="${SITE}${urlPath}.md"`)) fail(urlPath, 'missing text/Markdown alternate link');
  const resourceSection = page.html.match(/<section aria-labelledby="further-reading">[\s\S]*?<\/section>/)?.[0] || '';
  if (!resourceSection) fail(urlPath, 'missing crawlable further-reading resource section');
  const requireResourceLink = (href, label) => {
    if (href && !resourceSection.includes(`href="${escapeText(href)}"`)) {
      fail(urlPath, `${label} is not rendered as a clickable resource link`);
    }
  };
  if (volume.articleLink) requireResourceLink(volume.articleLink, 'companion article');
  if (volume.youtubeLink) requireResourceLink(volume.youtubeLink, 'video lesson');
  for (const slug of volume.relatedVolumes || []) {
    const related = volumes.find((item) => item.slug === slug);
    if (!related) {
      fail(urlPath, `invalid related volume slug: ${slug}`);
      continue;
    }
    requireResourceLink(`/encyclopedia/${slug}`, `related Volume ${related.number}`);
  }
  for (const articleLink of volume.relatedArticles || []) {
    if (!articleLink.href?.startsWith('/resources/') || articleLink.href.startsWith('//')) {
      fail(urlPath, `unsafe or non-resource article link: ${articleLink.href}`);
      continue;
    }
    const target = normalize(new URL(articleLink.href, SITE).pathname);
    if (!pageFor(target)) fail(urlPath, `related study guide has no prerendered HTML: ${articleLink.href}`);
    requireResourceLink(articleLink.href, `study guide ${articleLink.href}`);
  }
}

/* ---- machine-readable corpus and organic article companions ---- */
const llmsPath = path.join(dist, 'llms.txt');
const llmsFullPath = path.join(dist, 'llms-full.txt');
if (!fs.existsSync(llmsPath) || !fs.existsSync(llmsFullPath)) {
  fail('/llms-full.txt', 'llms.txt or llms-full.txt is missing');
} else {
  const llms = fs.readFileSync(llmsPath, 'utf8');
  const llmsFull = fs.readFileSync(llmsFullPath, 'utf8');
  if (llmsFull.length <= llms.length * 1.5) fail('/llms-full.txt', 'full corpus is not meaningfully fuller than llms.txt');
  for (const volume of volumes) {
    const title = `# Volume ${String(volume.number).padStart(2, '0')}: ${volume.title}`;
    if (!llmsFull.includes(title)) fail('/llms-full.txt', `missing detailed entry for Volume ${volume.number}`);
  }
}
const seoArticleSlugs = [
  'world-religions-comparison-chart',
  'christianity-judaism-islam',
  'hinduism-buddhism-comparison',
  'world-religions-timeline',
];
for (const slug of seoArticleSlugs) {
  const urlPath = `/resources/${slug}`;
  const page = pageFor(urlPath);
  if (!page) {
    fail(urlPath, 'organic study guide has no prerendered HTML');
    continue;
  }
  if (!hasArticle(page.html, urlPath)) fail(urlPath, 'study guide missing Article JSON-LD');
  if (!schemaOfType(page.html, 'FAQPage', urlPath)) fail(urlPath, 'study guide missing visible FAQPage JSON-LD');
  if (!schemaOfType(page.html, 'BreadcrumbList', urlPath)) fail(urlPath, 'study guide missing BreadcrumbList JSON-LD');
  if (!fs.existsSync(path.join(dist, 'resources', `${slug}.md`))) fail(urlPath, 'study guide Markdown companion missing');
}

if (errors.length) {
  console.error(`[CHECK-SEO] ${errors.length} problem(s) in the built HTML:`);
  for (const error of errors.slice(0, 40)) console.error(`  - ${error}`);
  if (errors.length > 40) console.error(`  … ${errors.length - 40} more`);
  process.exit(1);
}

console.log(`[CHECK-SEO] ${promised.length} sitemap URLs: canonical, social metadata and structured data verified; none orphaned.`);
