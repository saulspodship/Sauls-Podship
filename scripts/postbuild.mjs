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
const podshipApps = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/data/podshipApps.json'), 'utf8'));
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
const robotsTxt = `User-agent: *
Allow: /

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
- [About the ministry and its apps](${BASE_URL}/about): The Scriptorium's mission, public subdomains and frequently asked questions.

## The Saul's Podship app family
These dedicated sites are Saul's Podship projects, serving readers in Pakistan and worldwide.
`;

for (const app of podshipApps) {
  llmsTxt += `- [${app.name}](${app.url}): ${app.description}\n`;
}
llmsTxt += '\n## All 51 Volumes\n';

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

  // Replace title, description, canonical
  let volHtml = baseTemplate
    .replace(/<title>.*?<\/title>/i, `<title>${volTitle}</title>`)
    .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${volDesc.replace(/"/g, '&quot;')}" />`)
    .replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${volCanonical}" />`);

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
  if (p === '' || p === '/comparative-apologetics' || p === '/cross-references' || p === '/videos' || p.endsWith('.html')) continue; // dist/prophecy-map.html & friends are real files vite already copied; mkdir over them is ENOTDIR // dist/index.html already exists, codex AND the Interlinked Bible shell have their own static index.html, /videos is a standalone static module
  const targetDir = path.join(distDir, p.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const pageCanonical = `${BASE_URL}${p}`;
  const pageHtml = baseTemplate.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${pageCanonical}" />`
  );
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
