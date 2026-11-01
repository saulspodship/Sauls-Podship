/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build-time prerender for the Pakistani singers archive + every artist bio
 * page, written straight into dist/ so Vercel serves them from its static
 * filesystem (like /encyclopedia/* pages) and they NEVER depend on the
 * serverless function booting. This eliminates the FUNCTION_INVOCATION_FAILED
 * 500s on /Pakistanisingersarchive and /music-archive/<id>.
 *
 * Parsing mirrors scripts/generate-singers-data.mjs + api/index.ts
 * getSingersList (intentionally kept in sync). Rendering mirrors the
 * /Pakistanisingersarchive and /music-archive/:slug route output.
 *
 * Usage: node scripts/prerender-music.mjs   (runs at the end of `npm run build`)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const BASE_URL = 'https://www.saulspodship.com';
const redirectSources = new Set(
  (JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8')).redirects || [])
    .map((redirect) => redirect.source),
);
const clipText = (value, limit) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`;
};
const escapeAttribute = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const htmlPath = path.join(rootDir, 'public/singers.html');
if (!fs.existsSync(htmlPath)) {
  console.error('[PRERENDER-MUSIC] public/singers.html missing — aborting prerender');
  process.exit(1);
}
const content = fs.readFileSync(htmlPath, 'utf8');

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ---- Parse artists (same rules as api/index.ts getSingersList) ----
const artists = [];
const seenSlugs = new Set();

const pioneerRegex =
  /<div class="pioneer-row">[\s\S]*?<div class="pioneer-name">([\s\S]*?)<\/div>[\s\S]*?<div class="pioneer-bio">([\s\S]*?)<\/div>/g;
let pMatch;
while ((pMatch = pioneerRegex.exec(content)) !== null) {
  const rawName = pMatch[1].replace(/<[^>]+>/g, ' ').trim();
  const nameOnly = pMatch[1].replace(/<img\b[^>]*>/gi, '').split('<')[0].trim();
  const bio = pMatch[2].replace(/<[^>]+>/g, '').trim();
  const slug = slugify(nameOnly);
  if (slug && !seenSlugs.has(slug)) {
    seenSlugs.add(slug);
    artists.push({
      id: slug,
      name: nameOnly,
      badge: 'Historic Pioneer',
      also: '',
      role: 'Historic Pioneer / Patriarch of Gospel',
      dates:
        rawName.includes('–') || rawName.includes('-')
          ? rawName.replace(nameOnly, '').trim()
          : '',
      bio,
      links: {}
    });
  }
}

const cardBlocks = content.split(/<div class="card\s+/).slice(1);
for (const block of cardBlocks) {
  const badgeMatch = block.match(/<div class="card-badge[^"]*">([^<]+)<\/div>/);
  const badge = badgeMatch ? badgeMatch[1].replace(/^[^\w]+/, '').trim() : '';
  const nameMatch = block.match(/<div class="card-name">([^<]+)<\/div>/);
  if (!nameMatch) continue;
  const name = nameMatch[1].trim();
  const slug = slugify(name);
  if (
    !slug ||
    slug.includes('directory') ||
    slug.includes('collection') ||
    slug.includes('archive') ||
    slug.includes('org') ||
    seenSlugs.has(slug)
  )
    continue;
  seenSlugs.add(slug);

  const alsoMatch = block.match(/<div class="card-also">([^<]+)<\/div>/);
  const roleMatch = block.match(/<div class="card-role">([^<]+)<\/div>/);
  const datesMatch = block.match(/<div class="card-dates">([^<]+)<\/div>/);
  const bioMatch = block.match(/<div class="card-bio">([\s\S]*?)<\/div>/);

  const links = {};
  const linkRegex = /<a class="link-btn[^"]*" href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let lMatch;
  while ((lMatch = linkRegex.exec(block)) !== null) {
    const href = lMatch[1];
    const label = lMatch[2].replace(/^[^\w]+/, '').trim();
    if (href && !href.startsWith('#')) links[label || 'Link'] = href;
  }

  artists.push({
    id: slug,
    name,
    badge,
    also: alsoMatch ? alsoMatch[1].trim() : '',
    role: roleMatch ? roleMatch[1].trim() : 'Gospel Artist',
    dates: datesMatch ? datesMatch[1].trim() : '',
    bio: bioMatch ? bioMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    links
  });
}

// ---- 1. Full archive page (mirrors the /Pakistanisingersarchive route) ----
const cardLinkRegex =
  /<div class="card-name">([^<]+)<\/div>([\s\S]*?)<div class="card-bio">([\s\S]*?)<\/div>/g;
const archiveHtml = content.replace(cardLinkRegex, (match, name, middle, bio) => {
  const slug = slugify(name);
  if (
    slug &&
    !redirectSources.has(`/music-archive/${slug}`) &&
    !slug.includes('directory') &&
    !slug.includes('collection') &&
    !slug.includes('archive') &&
    !slug.includes('org')
  ) {
    return `<div class="card-name">${name}</div>${middle}<div class="card-bio">${bio} <a href="/music-archive/${slug}" style="color:var(--gold-light); font-weight:bold; text-decoration:underline; display:inline-block; margin-left:0.35rem;">Read Biography &amp; Legacy &rarr;</a></div>`;
  }
  return match;
});

const archDir = path.join(distDir, 'Pakistanisingersarchive');
fs.mkdirSync(archDir, { recursive: true });
fs.writeFileSync(path.join(archDir, 'index.html'), archiveHtml, 'utf8');

// ---- 2. Artist bio pages (mirror the /music-archive/:slug route) ----
function renderBio(artist) {
  const canonicalSlug = artist.id;
  const title = clipText(
    artist.metaTitle || `${artist.name} | Pakistani Gospel Music | Saul's Podship`,
    60,
  );
  const description = clipText(
    artist.metaDescription ||
      `Biography, musical legacy, and historical recordings of ${artist.name}, ${artist.role} in Pakistani Christian gospel music.`,
    155,
  );

  let linksHtml = '';
  if (artist.links && Object.keys(artist.links).length > 0) {
    linksHtml = `<div style="margin-top: 3rem; border-top: 1px solid #D4AF37; padding-top: 1.5rem;">
        <h3 style="font-family:'Merriweather', serif; color:#4A152C; font-size:1.2rem; margin-bottom:1rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Official Media & Links</h3>
        <div style="display:flex; flex-wrap:wrap; gap:1rem;">`;
    for (const [key, url] of Object.entries(artist.links)) {
      linksHtml += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color:#4A152C; color:#D4AF37; padding:0.6rem 1.2rem; text-decoration:none; font-weight:bold; font-size:0.8rem; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">${key}</a>`;
    }
    linksHtml += `</div></div>`;
  }

  const pageUrl = `${BASE_URL}/music-archive/${canonicalSlug}`;
  const personSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    description,
    jobTitle: artist.role,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
  }).replace(/</g, '\\u003c');
  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${artist.name} — Pakistani Gospel Music Biography`,
    description,
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Organization', name: "Saul's Podship Editorial Team" },
    publisher: {
      '@type': 'Organization',
      name: "Saul's Podship",
      url: `${BASE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icons/brand-logo.png` },
    },
    mainEntity: { '@type': 'Person', name: artist.name },
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttribute(title)}</title>
  <meta name="title" content="${escapeAttribute(title)}">
  <meta name="description" content="${escapeAttribute(description)}">
  <link rel="canonical" href="${BASE_URL}/music-archive/${canonicalSlug}" />
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:url" content="${BASE_URL}/music-archive/${canonicalSlug}">
  <meta property="og:image" content="${BASE_URL}/icons/brand-logo.png">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${BASE_URL}/icons/brand-logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script type="application/ld+json">${personSchema}</script>
  <script type="application/ld+json">${articleSchema}</script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #F8F4E3;
      color: #1D2D50;
      margin: 0;
      padding: 3rem 1.5rem;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; box-sizing: border-box;">
    <!-- BREADCRUMBS -->
    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2.5rem; color: rgba(29,45,80,0.6);">
      <a href="/" style="color: #4A152C; text-decoration: none; font-weight: bold;">Home</a> &nbsp;/&nbsp; 
      <a href="/Pakistanisingersarchive" style="color: #4A152C; text-decoration: none; font-weight: bold;">Music Archive</a> &nbsp;/&nbsp; 
      <span style="color: #1D2D50;">${artist.name}</span>
    </div>

    ${artist.badge ? `<span style="background-color: #4A152C; color: #D4AF37; font-size: 0.75rem; font-weight: bold; padding: 0.25rem 0.6rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 1rem;">${artist.badge}</span>` : ''}
    <h1 style="font-family: 'Merriweather', serif; color: #4A152C; font-size: 2.5rem; margin: 0 0 0.5rem 0; font-weight: 900; line-height: 1.2;">${artist.name}</h1>
    ${artist.also ? `<p style="font-style: italic; color: rgba(29,45,80,0.7); font-size: 1.1rem; margin-top: 0; margin-bottom: 1rem;">Also known as: ${artist.also}</p>` : ''}
    <p style="font-weight: bold; color: #4A152C; margin-bottom: 2rem;">Role: ${artist.role} ${artist.dates ? `· ${artist.dates}` : ''}</p>

    <div style="margin-bottom: 3rem; text-align: justify; font-size: 1.1rem;">
      <p>${artist.bio}</p>
    </div>

    ${linksHtml}
  </div>
</body>
</html>`;
}

let written = 0;
for (const artist of artists) {
  const dir = path.join(distDir, 'music-archive', artist.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderBio(artist), 'utf8');
  written++;
}

// ---- 3. Append music URLs to the static sitemap written by postbuild ----
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const today = new Date().toISOString().split('T')[0];
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  // Only append URLs the shipped sitemap does not already carry (no dupes).
  const urls = [
    `${BASE_URL}/Pakistanisingersarchive`,
    ...artists.map((a) => `${BASE_URL}/music-archive/${a.id}`)
  ].filter((loc) => {
    const pathname = new URL(loc).pathname;
    return !redirectSources.has(pathname) && !xml.includes(`<loc>${loc}</loc>`);
  });
  const block = urls
    .map(
      (loc) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
    )
    .join('');
  if (block && xml.includes('</urlset>')) {
    xml = xml.replace('</urlset>', block + '</urlset>');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
  }
  console.log(`[PRERENDER-MUSIC] sitemap: appended ${urls.length} new music URLs (rest already present).`);
}

console.log(
  `[PRERENDER-MUSIC] Archive page + ${written}/${artists.length} artist bio pages written to dist/ (static, function-independent).`
);
