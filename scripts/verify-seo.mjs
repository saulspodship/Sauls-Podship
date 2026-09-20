/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SEO regression gate — fails the build when Search Console would suffer:
 *
 *  1. Every /encyclopedia/<slug> in sitemap.xml resolves to a real volume or
 *     to the static biblical-maps-atlas.html page (no submitted 404s).
 *  2. Every /music-archive/<slug> in sitemap.xml resolves to a real parsed
 *     artist (pioneer + card parsers, same rules as the API/prerender).
 *  3. Every static path in sitemap.xml has curated meta in pageMeta.json.
 *  4. dist/ contains a prerendered shell for EVERY volume, artist, tough
 *     question and archive codex (submitted URLs serve content, never the
 *     404 shell).
 *  5. No `/#/` hash-router links survive in the SPA source (all internal
 *     links must be clean crawlable URLs).
 *
 * Usage: node scripts/verify-seo.mjs   (runs at the end of `npm run build`)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const errors = [];
const err = (m) => errors.push(m);

const sitemap = fs.readFileSync(path.join(rootDir, 'public/sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// ---------- 1. encyclopedia slugs ----------
const volumesData = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src/data/volumes/volumesData.json'), 'utf8'),
);
const volumeSlugs = new Set(volumesData.map((v) => v.slug));
for (const loc of locs) {
  const m = /\/encyclopedia\/([A-Za-z0-9-]+)(\.html)?$/.exec(loc);
  if (!m) continue;
  const [, slug, ext] = m;
  if (ext) {
    if (!fs.existsSync(path.join(rootDir, `public/encyclopedia/${slug}.html`))) {
      err(`sitemap lists ${loc} but public/encyclopedia/${slug}.html does not exist`);
    }
  } else if (!volumeSlugs.has(slug)) {
    err(`sitemap lists ${loc} but no volume has slug "${slug}" (submitted 404)`);
  }
}

// ---------- 2. music-archive slugs (fixed pioneer/card parsers) ----------
const singersHtml = fs.readFileSync(path.join(rootDir, 'public/singers.html'), 'utf8');
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
const artistSlugs = new Set();
const pioneerRe =
  /<div class="pioneer-row">[\s\S]*?<div class="pioneer-name">([\s\S]*?)<\/div>[\s\S]*?<div class="pioneer-bio">([\s\S]*?)<\/div>/g;
let pm;
while ((pm = pioneerRe.exec(singersHtml)) !== null) {
  const nameOnly = pm[1].split(/<br\s*\/?>/i)[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = slugify(nameOnly);
  if (slug) artistSlugs.add(slug);
}
const cardRe = /<div class="card-name">([^<]+)<\/div>/g;
let cm;
while ((cm = cardRe.exec(singersHtml)) !== null) {
  const slug = slugify(cm[1]);
  if (
    slug &&
    !slug.includes('directory') &&
    !slug.includes('collection') &&
    !slug.includes('archive') &&
    !slug.includes('org')
  ) {
    artistSlugs.add(slug);
  }
}
for (const loc of locs) {
  const m = /\/music-archive\/([a-z0-9-]+)$/.exec(loc);
  if (!m) continue;
  if (!artistSlugs.has(m[1])) {
    err(`sitemap lists ${loc} but no artist parses to slug "${m[1]}" (submitted 404)`);
  }
}

// ---------- 3. static paths have curated meta ----------
const pageMeta = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src/config/pageMeta.json'), 'utf8'),
);
const metaKeys = new Set(Object.keys(pageMeta).filter((k) => !k.startsWith('_')));
for (const loc of locs) {
  const u = new URL(loc);
  const p = u.pathname;
  if (p.startsWith('/encyclopedia/') || p.startsWith('/music-archive/')) continue;
  // Standalone static documents with their own <head> (not SPA routes, so no
  // pageMeta.json entry is expected): the videos module, the two atlases
  // iframed into Volume 11, and the prerendered singers archive.
  if (['/videos', '/biblical-maps', '/world-religion-map', '/Pakistanisingersarchive'].includes(p)) continue;
  const key = p === '/' || p === '' ? '/' : p.replace(/\/$/, '');
  if (!metaKeys.has(key)) {
    err(`sitemap lists ${loc} but src/config/pageMeta.json has no "${key}" entry (duplicate title/description risk)`);
  }
}

// ---------- 4. dist/ prerender completeness ----------
const distMissing = (p) => !fs.existsSync(path.join(distDir, p, 'index.html'));
let missing = 0;
for (const v of volumesData) {
  if (distMissing(`encyclopedia/${v.slug}`)) {
    err(`dist/ missing prerendered shell for volume "${v.slug}"`);
    if (++missing > 5) break;
  }
}
for (const slug of artistSlugs) {
  if (distMissing(`music-archive/${slug}`)) {
    err(`dist/ missing prerendered bio for artist "${slug}"`);
    if (++missing > 10) break;
  }
}
// tough + category slugs straight from the TS data (read-only regex)
const toughSrc = fs.readFileSync(path.join(rootDir, 'src/data/theology/tough.ts'), 'utf8');
const toughSlugs = [...toughSrc.matchAll(/"slug": "([a-z0-9-]+)"/g)].map((m) => m[1]);
for (const slug of toughSlugs) {
  if (distMissing(`theological-archive/question/${slug}`)) {
    err(`dist/ missing prerendered page for tough question "${slug}"`);
    if (++missing > 15) break;
  }
}
const archLines = fs.readFileSync(path.join(rootDir, 'src/data/theology/archive.ts'), 'utf8').split('\n');
const catSlugs = [];
for (let i = 0; i < archLines.length - 1; i++) {
  const m = /"slug": "([a-z0-9-]+)",?\s*$/.exec(archLines[i]);
  if (m && archLines[i + 1].includes('"items"')) catSlugs.push(m[1]);
}
for (const slug of catSlugs) {
  if (distMissing(`theological-archive/category/${slug}`)) {
    err(`dist/ missing prerendered page for archive codex "${slug}"`);
    if (++missing > 20) break;
  }
}
// theological sitemap (regenerated by prerender-theology) matches the data
const theoSm = fs.readFileSync(path.join(distDir, 'sitemap-theological-archive.xml'), 'utf8');
const theoLocs = [...theoSm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expectTheo = 1 + toughSlugs.length + catSlugs.length;
if (theoLocs.length !== expectTheo) {
  err(`sitemap-theological-archive.xml lists ${theoLocs.length} URLs, expected ${expectTheo}`);
}

// ---------- 5. no hash-router links left in the SPA ----------
const SRC_DIRS = ['src', 'components'];
const hashHits = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      const src = fs.readFileSync(p, 'utf8');
      const lines = src.split('\n');
      lines.forEach((ln, i) => {
        if (ln.includes('/#/') && !ln.trim().startsWith('*') && !ln.trim().startsWith('//')) {
          hashHits.push(`${path.relative(rootDir, p)}:${i + 1}`);
        }
      });
    }
  }
};
for (const d of SRC_DIRS) walk(path.join(rootDir, d));
if (hashHits.length) {
  err(`hash-router links (/#/) survive in SPA source: ${hashHits.slice(0, 5).join(', ')}`);
}

// ---------- report ----------
console.log(
  `[VERIFY-SEO] sitemap.xml: ${locs.length} URLs | volumes: ${volumesData.length} | artists: ${artistSlugs.size} | tough: ${toughSlugs.length} | codices: ${catSlugs.length} | pageMeta: ${metaKeys.size}`,
);
if (errors.length) {
  console.error(`[VERIFY-SEO] FAILED with ${errors.length} error(s):`);
  for (const e of errors.slice(0, 25)) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('[VERIFY-SEO] PASSED — every submitted URL resolves to real content.');
