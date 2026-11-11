/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_ARTICLES } from './seo-articles.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Read volumes and data from src/data/volumes/index.ts or raw JSON
const volumesDataPath = path.resolve(rootDir, 'src/data/volumes/volumesData.json');
const podshipApps = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/data/podshipApps.json'), 'utf8'));
let volumes = [];
if (fs.existsSync(volumesDataPath)) {
  volumes = JSON.parse(fs.readFileSync(volumesDataPath, 'utf8'));
} else {
  // Try importing or reading
  console.warn('volumesData.json not found directly, checking fallback');
}

console.log(`[POSTBUILD] Starting build artifact generation for ${volumes.length} volumes...`);

const clipText = (value, limit) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`;
};
const escapeHtmlAttribute = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const replaceMeta = (html, attr, key, value) => html.replace(
  new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 'i'),
  `$1${escapeHtmlAttribute(value)}$2`,
);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Generate sitemap.xml
const BASE_URL = 'https://www.saulspodship.com';
const today = new Date().toISOString().split('T')[0];
const volumeBySlug = new Map(volumes.map((volume) => [volume.slug, volume]));

const formatVolumeYear = (year) => year == null ? 'Not stated' : `${Math.abs(year)} ${year < 0 ? 'BCE' : 'CE'}`;
const volumeLineageMarkdown = (lineage) => {
  if (!lineage?.nodes?.length) return '';
  const groupLabels = new Map((lineage.groups || []).map((group) => [group.id, group.label]));
  const notes = (lineage.notes || []).map((note) => `- **${note.label}:** ${note.text}`).join('\n');
  const nodes = lineage.nodes.map((node) => {
    const groups = (node.tags || []).map((tag) => groupLabels.get(tag)).filter(Boolean);
    return `- **${node.name}** — Biblical date: ${formatVolumeYear(node.biblicalYear)}; scholarly date: ${formatVolumeYear(node.scholarlyYear)}; founder/origin: ${node.founder || 'Not stated'}; sacred texts: ${node.books || 'Not stated'}; source label: ${node.claimType || 'Not stated'}.` +
      (node.dateNote ? ` ${node.dateNote}` : '') +
      ` Symbols: ${node.symbols || 'Not stated'}.` +
      (groups.length ? ` Group: ${groups.join(', ')}.` : '') +
      (node.claim ? ` Origin claim recorded in the tree: ${node.claim}` : '') +
      (node.occultView ? ` ${node.occultViewLabel || 'Occult view'}: ${node.occultView}` : '') +
      (node.check ? ` Historical check: ${node.check}` : '');
  }).join('\n');
  return `## ${lineage.title}\n\n${lineage.intro}\n\n` +
    (notes ? `### Dating and source notes\n\n${notes}\n\n` : '') +
    `### ${lineage.nodes.length} traditions in the tree\n\n${nodes}\n`;
};

const volumeResourcesMarkdown = (volume) => {
  const resources = [];
  if (volume.articleLink) resources.push(`[Companion article](${volume.articleLink})`);
  if (volume.youtubeLink) resources.push(`[Video lesson](${volume.youtubeLink})`);
  for (const slug of volume.relatedVolumes || []) {
    const related = volumeBySlug.get(slug);
    if (related) resources.push(`[Volume ${String(related.number).padStart(2, '0')}: ${related.title}](${BASE_URL}/encyclopedia/${related.slug})`);
  }
  for (const article of volume.relatedArticles || []) {
    if (article.href?.startsWith('/') && !article.href.startsWith('//')) {
      resources.push(`[Study guide: ${article.title}](${BASE_URL}${article.href})`);
    }
  }
  return resources.length ? `## Further reading and resources\n\n${resources.map((resource) => `- ${resource}`).join('\n')}\n` : '';
};

const renderVolumeMarkdown = (volume) => {
  const number = String(volume.number).padStart(2, '0');
  const canonical = `${BASE_URL}/encyclopedia/${volume.slug}`;
  const parts = [
    `# Volume ${number}: ${volume.title}`,
    `**Canonical article:** [${volume.title}](${canonical})  \n**Category:** ${volume.category || 'theology'} | **Last updated:** ${volume.lastUpdated || today}`,
    `## Quick answer\n\n${volume.summary || volume.overview || ''}`,
  ];
  if (volume.overview && volume.overview !== volume.summary) parts.push(`## Scope and context\n\n${volume.overview}`);
  if (volume.keywords?.length) parts.push(`## Topics covered\n\n${volume.keywords.map((keyword) => `- ${keyword}`).join('\n')}`);
  if (volume.keyFacts?.length) parts.push(`## Key facts\n\n${volume.keyFacts.map((fact) => `- ${fact}`).join('\n')}`);
  if (volume.content?.analysis) {
    const analysis = volume.content.analysis.replace(/\[\[CHART:[\s\S]*?\]\]/g, '').replace(/\n{3,}/g, '\n\n');
    parts.push(`## Scholarly exegesis and analysis\n\n${analysis}`);
  }
  if (volume.content?.lineage) parts.push(volumeLineageMarkdown(volume.content.lineage));
  if (volume.faq?.length) {
    parts.push(`## Frequently asked questions\n\n${volume.faq.map((item) => `### ${item.q}\n\n${item.a}`).join('\n\n')}`);
  }
  const resources = volumeResourcesMarkdown(volume);
  if (resources) parts.push(resources);
  return parts.filter(Boolean).join('\n\n').trim() + '\n';
};

const renderSeoArticleMarkdown = (article) => {
  const canonical = `${BASE_URL}/resources/${article.slug}`;
  const cell = (value) => String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const parts = [
    `# ${article.title}`,
    `**Canonical article:** [${article.title}](${canonical})  \n**Updated:** ${article.updatedDate || today}`,
    `## Quick answer\n\n${article.answer}`,
  ];
  for (const section of article.sections || []) {
    parts.push(`## ${section.heading}`);
    if (section.table) {
      parts.push(section.table.caption || '');
      parts.push(`| ${section.table.headings.map(cell).join(' | ')} |`);
      parts.push(`| ${section.table.headings.map(() => '---').join(' | ')} |`);
      for (const row of section.table.rows) parts.push(`| ${row.map(cell).join(' | ')} |`);
    }
    for (const paragraph of section.paragraphs || []) parts.push(paragraph);
    if (section.bullets?.length) parts.push(section.bullets.map((item) => `- ${item}`).join('\n'));
  }
  if (article.sourceNotes?.length) {
    parts.push(`## Sources and editorial notes\n\n${article.sourceNotes.map((note) => `- ${note}`).join('\n')}`);
  }
  if (article.faqs?.length) {
    parts.push(`## Frequently asked questions\n\n${article.faqs.map((item) => `### ${item.question}\n\n${item.answer}`).join('\n\n')}`);
  }
  const related = (article.relatedVolumes || []).map((slug) => {
    const volume = volumeBySlug.get(slug);
    return volume ? `- [Volume ${String(volume.number).padStart(2, '0')}: ${volume.title}](${BASE_URL}/encyclopedia/${volume.slug})` : '';
  }).filter(Boolean);
  for (const resource of article.relatedPages || []) {
    if (resource.href?.startsWith('/') && !resource.href.startsWith('//')) {
      related.push(`- [${resource.label}](${BASE_URL}${resource.href})`);
    }
  }
  if (related.length) parts.push(`## Related reading\n\n${related.join('\n')}`);
  return parts.filter(Boolean).join('\n\n').trim() + '\n';
};

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
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-theological-archive.xml
`;
fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
console.log(`[POSTBUILD] Generated dist/robots.txt`);

// 3. Generate a concise llms.txt and a full, linked volume corpus.
let llmsTxt = `# Saul's Podship Scriptorium
> A scholarly 51-volume Christian theology reference and South Asian hymnody archive.

## Core sections
- [Homepage](${BASE_URL}/): Digital scriptorium portal.
- [51-Volume Encyclopedia](${BASE_URL}/encyclopedia): Biblical exegesis, Christian history, doctrine, apologetics and reference.
- [Theological Archive](${BASE_URL}/theological-archive): Tough Bible questions and book-by-book study answers.
- [Comparative Apologetics Codex](${BASE_URL}/comparative-apologetics): 400 dialogue questions across Islam, Judaism, Hinduism and Sikhism.
- [Scholarly Standards](${BASE_URL}/scholarly-standards): Research and hermeneutical method.
- [Punjabi Zaboor](${BASE_URL}/music/punjabi-zaboor): Historical Punjabi versification of the biblical Psalms.
- [Pakistani Singers Archive](${BASE_URL}/music/pakistani-singers-archive): South Asian Christian music history.
- [About](${BASE_URL}/about): Mission, apps and FAQs.
- [Full machine-readable volume corpus](${BASE_URL}/llms-full.txt): Summaries, topics, key facts, source links, analysis, lineage data and FAQs.

## The Saul's Podship app family
These dedicated sites are Saul's Podship projects, serving readers in Pakistan and worldwide.
`;

for (const app of podshipApps) {
  llmsTxt += `- [${app.name}](${app.url}): ${app.description}\n`;
}
llmsTxt += '\n## Comparative religion study guides\n';
for (const article of SEO_ARTICLES) {
  llmsTxt += `- [${article.title}](${BASE_URL}/resources/${article.slug}): ${article.description} ([Markdown](${BASE_URL}/resources/${article.slug}.md))\n`;
}
llmsTxt += '\n## All 51 volumes\n';

for (const v of volumes) {
  const number = String(v.number).padStart(2, '0');
  llmsTxt += `- [Vol. ${number}: ${v.title}](${BASE_URL}/encyclopedia/${v.slug}): ${v.summary || v.overview} ([Markdown](${BASE_URL}/encyclopedia/${v.slug}.md))\n`;
}

let llmsFullTxt = `${llmsTxt}\n\n# Detailed volume content\n`;
for (const v of volumes) {
  llmsFullTxt += `\n---\n\n${renderVolumeMarkdown(v)}\n`;
}
llmsFullTxt += '\n# Comparative religion study guides\n';
for (const article of SEO_ARTICLES) {
  llmsFullTxt += `\n---\n\n${renderSeoArticleMarkdown(article)}\n`;
}
const resourcesDir = path.join(distDir, 'resources');
fs.mkdirSync(resourcesDir, { recursive: true });
for (const article of SEO_ARTICLES) {
  fs.writeFileSync(path.join(resourcesDir, `${article.slug}.md`), renderSeoArticleMarkdown(article), 'utf8');
}
fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt, 'utf8');
fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFullTxt, 'utf8');
console.log(`[POSTBUILD] Generated dist/llms.txt (${llmsTxt.length} chars) and llms-full.txt (${llmsFullTxt.length} chars)`);

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

for (const v of volumes) {
  // Markdown output
  const mdPath = path.join(encDistDir, `${v.slug}.md`);
  const mdContent = renderVolumeMarkdown(v);
  fs.writeFileSync(mdPath, mdContent, 'utf8');

  // Static HTML pre-render for /encyclopedia/:slug/index.html
  const volDir = path.join(encDistDir, v.slug);
  if (!fs.existsSync(volDir)) {
    fs.mkdirSync(volDir, { recursive: true });
  }

  const volTitle = clipText(`${v.title} | Vol ${v.number} | Saul's Podship`, 60);
  const volDesc = clipText(v.metaDescription || v.summary || v.overview, 155);
  const volCanonical = `${BASE_URL}/encyclopedia/${v.slug}`;

  // Keep standard, social and canonical metadata in sync on each static URL.
  let volHtml = baseTemplate
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtmlAttribute(volTitle)}</title>`)
    .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${volCanonical}" />`);
  volHtml = replaceMeta(volHtml, 'name', 'title', volTitle);
  volHtml = replaceMeta(volHtml, 'name', 'description', volDesc);
  volHtml = replaceMeta(volHtml, 'property', 'og:url', volCanonical);
  volHtml = replaceMeta(volHtml, 'property', 'og:title', volTitle);
  volHtml = replaceMeta(volHtml, 'property', 'og:description', volDesc);
  volHtml = replaceMeta(volHtml, 'property', 'twitter:url', volCanonical);
  volHtml = replaceMeta(volHtml, 'property', 'twitter:title', volTitle);
  volHtml = replaceMeta(volHtml, 'property', 'twitter:description', volDesc);
  volHtml = volHtml.replace('</head>', `<link rel="alternate" type="text/markdown" href="${volCanonical}.md" />\n</head>`);
  const volumeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: v.title,
    description: volDesc,
    mainEntityOfPage: volCanonical,
    author: { '@type': 'Person', name: 'Solat Nadeem' },
    publisher: {
      '@type': 'Organization',
      name: "Saul's Podship",
      url: `${BASE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icons/brand-logo.png` },
    },
    ...(v.lastUpdated ? { dateModified: v.lastUpdated } : {}),
  };
  const volumeJsonLd = `<script type="application/ld+json">${JSON.stringify(volumeSchema).replace(/</g, '\\u003c')}</script>`;
  volHtml = volHtml.replace('</head>', `${volumeJsonLd}\n</head>`);

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
  <meta name="robots" content="noindex, follow">
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
  if (p === '' || p === '/comparative-apologetics' || p === '/cross-references' || p === '/videos' || p.endsWith('.html')) continue; // dist/prophecy-map.html & friends are real files vite already copied; mkdir over them is ENOTDIR // dist/index.html already exists, codex AND the Interlinked Bible shell have their own static index.html, /videos is a standalone static module
  const targetDir = path.join(distDir, p.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const pageCanonical = `${BASE_URL}${p || '/'}`;
  let pageHtml = baseTemplate.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${pageCanonical}" />`
  );
  pageHtml = replaceMeta(pageHtml, 'property', 'og:url', pageCanonical);
  pageHtml = replaceMeta(pageHtml, 'property', 'twitter:url', pageCanonical);
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
