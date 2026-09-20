/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses public/singers.html at BUILD time and writes api/singersData.ts with
 * an embedded artist list, so the Vercel function no longer depends on finding
 * singers.html at runtime (that path differed from cwd/__dirname in the
 * serverless bundle and threw → 500 on every /music-archive/* page).
 *
 * Usage:  node scripts/generate-singers-data.mjs
 * Re-run whenever public/singers.html changes (same parsing rules as the
 * runtime parser in api/index.ts, kept in sync intentionally).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'public/singers.html');
const outPath = path.join(rootDir, 'api/singersData.ts');

const content = fs.readFileSync(htmlPath, 'utf8');
const artists = [];
const seenSlugs = new Set();

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// 1. Historic Pioneer rows
const pioneerRegex =
  /<div class="pioneer-row">[\s\S]*?<div class="pioneer-name">([\s\S]*?)<\/div>[\s\S]*?<div class="pioneer-bio">([\s\S]*?)<\/div>/g;
let pMatch;
while ((pMatch = pioneerRegex.exec(content)) !== null) {
  const rawName = pMatch[1].replace(/<[^>]+>/g, ' ').trim();
  // Name cell may START with markup (Shahbaz's portrait <img>): split on <br>
  // first (name is always the first line), THEN strip tags.
  const nameOnly = pMatch[1].split(/<br\s*\/?>/i)[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

// 2. Artist cards
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

const out = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** GENERATED FILE — do not edit by hand.
 *  Regenerate with: node scripts/generate-singers-data.mjs
 *  Source: public/singers.html (${artists.length} artist records).
 *  This list is bundled into the Vercel API function so singer pages never
 *  depend on runtime filesystem paths. */

export interface EmbeddedArtist {
  id: string;
  name: string;
  badge: string;
  also: string;
  role: string;
  dates: string;
  bio: string;
  links: Record<string, string>;
}

export const EMBEDDED_ARTISTS: EmbeddedArtist[] = ${JSON.stringify(artists, null, 2)};

export default EMBEDDED_ARTISTS;
`;
fs.writeFileSync(outPath, out, 'utf8');
console.log(`[SINGERS-DATA] wrote ${outPath} with ${artists.length} artists`);
