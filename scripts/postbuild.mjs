/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Read volumes and data from src/data/volumes/index.ts or raw JSON
const volumesDataPath = path.resolve(rootDir, 'src/data/volumes/volumesData.json');
let volumes = [];
if (fs.existsSync(volumesDataPath)) {
  volumes = JSON.parse(fs.readFileSync(volumesDataPath, 'utf8'));
} else {
  // Try importing or reading
  console.warn('volumesData.json not found directly, checking fallback');
}

console.log(`[POSTBUILD] Starting build artifact generation for ${volumes.length} volumes...`);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Generate sitemap.xml
const BASE_URL = 'https://www.saulspodship.com';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  '',
  '/encyclopedia',
  '/about',
  '/scholarly-standards',
  '/podcast',
  '/music',
  '/music/punjabi-zaboor',
  '/music/pakistani-singers-archive',
  '/studio',
  '/support',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/sitemap',
  '/theological-archive',
  '/comparative-apologetics',
  '/videos',
  '/prophecy-map',
  '/kings-of-the-bible',
  '/cross-references'
];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const p of staticPages) {
  sitemapXml += `  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : p === '/encyclopedia' || p === '/theological-archive' || p === '/comparative-apologetics' ? '0.9' : '0.8'}</priority>
  </url>
`;
}

for (const v of volumes) {
  sitemapXml += `  <url>
    <loc>${BASE_URL}/encyclopedia/${v.slug}</loc>
    <lastmod>${v.lastUpdated || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
`;
}

sitemapXml += `</urlset>\n`;
if (fs.existsSync(path.join(rootDir, 'public/sitemap.xml'))) {
  fs.copyFileSync(path.join(rootDir, 'public/sitemap.xml'), path.join(distDir, 'sitemap.xml'));
  console.log(`[POSTBUILD] Kept shipped static public/sitemap.xml (curated, ${fs.readFileSync(path.join(distDir,'sitemap.xml'),'utf8').split('<url>').length - 1} URLs)`);
} else {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`[POSTBUILD] Generated dist/sitemap.xml with ${staticPages.length + volumes.length} URLs`);
}

// 2. Generate robots.txt
// NOTE: /*.md$ is disallowed — the per-volume .md mirrors in dist/encyclopedia/
// are research conveniences, not canonical pages; crawling them would create
// near-duplicate content in Search Console.
const robotsTxt = `User-agent: *
Allow: /
Disallow: /*.md$

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-theological-archive.xml
`;
fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
console.log(`[POSTBUILD] Generated dist/robots.txt`);

// 3. Generate llms.txt and llms-full.txt
let llmsTxt = `# Saul's Podship Scriptorium
> An authoritative, peer-reviewed 51-volume digital Christian theological encyclopedia and South Asian hymnody archive.

## Core Sections
- [Homepage](${BASE_URL}/): Digital scriptorium portal featuring Leonardo da Vinci's Last Supper.
- [51-Volume Encyclopedia](${BASE_URL}/encyclopedia): The complete catalog of biblical exegesis, data tables, and historical theology.
- [Theological Archive](${BASE_URL}/theological-archive): 100 Tough Bible Questions & 1,000 Book-by-Book Bible Study Answers in English, Urdu, Hindi and Arabic across 5 traditions.
- [Comparative Apologetics Codex](${BASE_URL}/comparative-apologetics): 400 critical dialogue questions across Islam, Judaism, Hinduism and Sikhism.
- [Scholarly Standards](${BASE_URL}/scholarly-standards): Grammatical-historical hermeneutical framework and original language transliterations.
- [Punjabi Zaboor](${BASE_URL}/music/punjabi-zaboor): Complete historical record of 150 biblical Psalms in native Punjabi verse (1898–1908).
- [Pakistani Singers Archive](${BASE_URL}/music/pakistani-singers-archive): Historical archive of South Asian gospel musicians.

## All 51 Volumes
`;

for (const v of volumes) {
  llmsTxt += `- [Vol. ${v.number < 10 ? '0' + v.number : v.number}: ${v.title}](${BASE_URL}/encyclopedia/${v.slug}): ${v.summary || v.overview}\n`;
}

fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt, 'utf8');
fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsTxt, 'utf8');
console.log(`[POSTBUILD] Generated dist/llms.txt and dist/llms-full.txt`);

// 4. Generate Markdown files and static HTML for all 50 volumes
const encDistDir = path.join(distDir, 'encyclopedia');
if (!fs.existsSync(encDistDir)) {
  fs.mkdirSync(encDistDir, { recursive: true });
}

// Read index.html template from dist/
const indexHtmlTemplatePath = path.join(distDir, 'index.html');
let baseTemplate = '';
if (fs.existsSync(indexHtmlTemplatePath)) {
  baseTemplate = fs.readFileSync(indexHtmlTemplatePath, 'utf8');
} else {
  // fallback template if running before vite build
  baseTemplate = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
}

// Per-route SEO copy shared with the SPA (src/config/pageMeta.json) — injected
// into every prerendered shell so raw HTML (no-JS crawlers, social scrapers)
// carries the same unique title/description/canonical the app applies at runtime.
const PAGE_META = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/config/pageMeta.json'), 'utf8'));

const attrEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Inject a full head meta set (title/desc/canonical/OG/Twitter) into a shell. */
function injectShellMeta(html, { title, description, keywords, canonical, image, ogType }) {
  const img = image || `${BASE_URL}/icons/brand-logo.png`;
  let out = html
    .replace(/<title>.*?<\/title>/i, `<title>${attrEsc(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${attrEsc(description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${attrEsc(canonical)}" />`)
    .replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i, `<meta property="og:type" content="${ogType || 'website'}" />`)
    .replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${attrEsc(canonical)}" />`)
    .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${attrEsc(title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${attrEsc(description)}" />`)
    .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${attrEsc(img)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${attrEsc(title)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${attrEsc(description)}" />`)
    .replace(/<meta\s+(?:name|property)="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${attrEsc(img)}" />`);
  // keywords: replace when the template has one, else insert after description
  if (keywords && keywords.length) {
    const kw = `<meta name="keywords" content="${attrEsc(keywords.join(', '))}" />`;
    if (/<meta\s+name="keywords"/i.test(out)) {
      out = out.replace(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i, kw);
    } else {
      out = out.replace(/(<meta\s+name="description"[^>]*>\s*)/i, `$1${kw}\n    `);
    }
  }
  return out;
}

for (const v of volumes) {
  // Markdown output
  const mdPath = path.join(encDistDir, `${v.slug}.md`);
  let mdContent = `# Volume ${v.number < 10 ? '0' + v.number : v.number}: ${v.title}\n\n`;
  mdContent += `**Category:** ${v.category} | **Last Updated:** ${v.lastUpdated || today}\n\n`;
  mdContent += `## Summary\n${v.summary || v.overview}\n\n`;
  if (v.keyFacts && v.keyFacts.length > 0) {
    mdContent += `## Key Facts\n${v.keyFacts.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  if (v.content?.analysis) {
    mdContent += `## Scholarly Exegesis & Analysis\n${v.content.analysis}\n\n`;
  }
  if (v.faq && v.faq.length > 0) {
    mdContent += `## Frequently Asked Questions\n${v.faq.map(f => `### ${f.q}\n${f.a}`).join('\n\n')}\n\n`;
  }
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  // Static HTML pre-render for /encyclopedia/:slug/index.html
  const volDir = path.join(encDistDir, v.slug);
  if (!fs.existsSync(volDir)) {
    fs.mkdirSync(volDir, { recursive: true });
  }

  const volTitle = `${v.title} | Volume ${v.number < 10 ? '0' + v.number : v.number} Theological Encyclopedia | Saul's Podship`;
  const volDesc = v.metaDescription || v.summary || v.overview;
  const volCanonical = `${BASE_URL}/encyclopedia/${v.slug}`;

  // Replace title, description, canonical + full OG/Twitter set (same values
  // the SPA's VolumeMeta applies at runtime, so raw HTML matches rendered DOM).
  const volHero = v.heroImage?.src?.startsWith('/') ? `${BASE_URL}${v.heroImage.src}` : (v.heroImage?.src || undefined);
  const volHtml = injectShellMeta(baseTemplate, {
    title: volTitle,
    description: volDesc,
    keywords: v.keywords,
    canonical: volCanonical,
    image: volHero,
    ogType: 'article',
  });

  fs.writeFileSync(path.join(volDir, 'index.html'), volHtml, 'utf8');

  // Pre-generate numeric redirect files for /encyclopedia/:num and /encyclopedia/by-number/:num
  const numDirs = [
    path.join(encDistDir, String(v.number)),
    path.join(encDistDir, 'by-number', String(v.number))
  ];

  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/encyclopedia/${v.slug}">
  <link rel="canonical" href="${volCanonical}">
  <title>Redirecting to Volume ${v.number}...</title>
</head>
<body>
  <p>Redirecting to <a href="/encyclopedia/${v.slug}">${v.title}</a>...</p>
</body>
</html>`;

  for (const nd of numDirs) {
    if (!fs.existsSync(nd)) {
      fs.mkdirSync(nd, { recursive: true });
    }
    fs.writeFileSync(path.join(nd, 'index.html'), redirectHtml, 'utf8');
  }
}


// Pre-render static HTML for all static pages
for (const p of staticPages) {
  if (p === '' || p === '/videos' || p.endsWith('.html')) continue; // dist/prophecy-map.html & friends are real files vite already copied; mkdir over them is ENOTDIR // dist/index.html already exists, codex AND the Interlinked Bible shell have their own static index.html, /videos is a standalone static module — NEVER overwrite its real index.html with the SPA shell
  const targetDir = path.join(distDir, p.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const key = p === '' ? '/' : p.replace(/\/$/, '');
  const pm = PAGE_META[key];
  if (!pm) {
    console.warn(`[POSTBUILD] No pageMeta.json entry for "${p}" — shell keeps template meta.`);
    fs.writeFileSync(path.join(targetDir, 'index.html'), baseTemplate, 'utf8');
    continue;
  }
  const pageCanonical = `${BASE_URL}${key === '/' ? '/' : key}`;
  const pageHtml = injectShellMeta(baseTemplate, {
    title: pm.title,
    description: pm.description,
    keywords: pm.keywords,
    canonical: pageCanonical,
    image: pm.image ? `${BASE_URL}${pm.image}` : undefined,
    ogType: 'website',
  });
  fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf8');
}

// Ensure the standalone codex is in dist/comparative-apologetics/index.html
const codexPublic = path.join(rootDir, 'public/comparative-apologetics/index.html');
const codexDist = path.join(distDir, 'comparative-apologetics/index.html');
if (fs.existsSync(codexPublic)) {
  fs.copyFileSync(codexPublic, codexDist);
}

// 5. Generate 404.html
const notFoundHtml = baseTemplate.replace(
  /<title>.*?<\/title>/i,
  `<title>Page Not Found | Saul's Podship</title>`
);
fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');
console.log(`[POSTBUILD] Pre-rendered all volumes + static pages + redirects successfully.`);
