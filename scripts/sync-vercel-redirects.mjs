/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Keep the volume redirects in vercel.json in sync with the shipped volumes.
 *
 * Why this exists (GSC Page indexing, 16 Nov 2026):
 *  - "Excluded by 'noindex' tag" (3): /encyclopedia/21, /25, /34 were static
 *    files written by postbuild.mjs containing <meta http-equiv="refresh"> and
 *    <meta name="robots" content="noindex, follow">. A static file cannot send a
 *    301, so Google saw a 200 + noindex page instead of the canonical slug and
 *    refused to index either form. docs/URL_MAP_50.md already specified the
 *    behaviour — "/encyclopedia/<NN> → 301 to slug" — it just was not real.
 *  - "Page with redirect" (78): the same stubs, and every clean sitemap URL that
 *    was answered with a JavaScript location.replace(), are reported as
 *    redirects. Real edge 301s keep the numeric aliases out of the index
 *    cleanly instead of leaving a noindex page behind.
 *
 * vercel.json is read by Vercel *before* the build runs, so the entries have to
 * be committed rather than generated at build time. This script is the single
 * source of truth: run it after adding/renumbering a volume, and the build gate
 * (`--check`) fails if vercel.json drifts from src/data/volumes/volumesData.json.
 *
 * Usage:
 *   node scripts/sync-vercel-redirects.mjs          # rewrite vercel.json
 *   node scripts/sync-vercel-redirects.mjs --check  # exit 1 when out of date
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vercelPath = path.join(root, 'vercel.json');
const volumesPath = path.join(root, 'src/data/volumes/volumesData.json');
const checkOnly = process.argv.includes('--check');

const BASE_URL = 'https://www.saulspodship.com';
const volumes = JSON.parse(fs.readFileSync(volumesPath, 'utf8'));
const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

/* ---- legacy slugs that must never 404 ----------------------------------
 * Keep `docs/URL_MAP_50.md` and this table in step. Every target is verified
 * against volumesData.json below, so a renamed volume fails the build instead
 * of silently pointing at nothing. */
const LEGACY_SLUGS = {
  // Ahrefs/GSC link history: the "All Biblical Numerology" volume has been
  // reached under three spellings.
  'biblical-numerology': 'all-biblical-numerology',
  // URL_MAP_50.md rows 30 and 34: the previous deploy's slugs.
  'miracles-of-jesus-the-apostles-complete-catalogue': 'miracles-of-jesus-and-the-apostles-complete-catalogue',
  'not-biblical-quotes-or-sayings': 'not-biblical-quotes-sayings',
  // GSC "Page with redirect" example from 15 Nov 2026 — the older title of
  // Volume 34 ("Biblical Quotes & Sayings").
  'biblical-quotes-sayings': 'not-biblical-quotes-sayings',
};

const slugSet = new Set(volumes.map((volume) => volume.slug));
for (const [legacy, target] of Object.entries(LEGACY_SLUGS)) {
  if (!slugSet.has(target)) {
    console.error(`[REDIRECTS] legacy slug ${legacy} points at missing volume ${target}`);
    process.exit(1);
  }
  if (slugSet.has(legacy)) {
    console.error(`[REDIRECTS] ${legacy} is now a real volume — drop it from LEGACY_SLUGS`);
    process.exit(1);
  }
}

/* ---- the managed set: numeric volume aliases + legacy slugs ---- */
const isManagedSource = (source) =>
  /^\/encyclopedia\/(by-number\/)?\d+$/.test(source) ||
  Object.prototype.hasOwnProperty.call(LEGACY_SLUGS, String(source).replace(/^\/encyclopedia\//, ''));

const generated = [];
for (const volume of volumes) {
  const target = `/encyclopedia/${volume.slug}`;
  const numbers = [String(volume.number)];
  // Three digits of history: /encyclopedia/07 and /encyclopedia/07 were both
  // linked from the old volume cards, so both spellings are redirected.
  if (volume.number < 10) numbers.push(`0${volume.number}`);
  for (const number of numbers) {
    generated.push({ source: `/encyclopedia/${number}`, destination: target, permanent: true });
    generated.push({ source: `/encyclopedia/by-number/${number}`, destination: target, permanent: true });
  }
}
for (const [legacy, target] of Object.entries(LEGACY_SLUGS)) {
  generated.push({ source: `/encyclopedia/${legacy}`, destination: `/encyclopedia/${target}`, permanent: true });
}

const current = Array.isArray(config.redirects) ? config.redirects : [];
const kept = current.filter((redirect) => !isManagedSource(redirect.source));
const merged = [...kept, ...generated];

const duplicates = merged
  .map((redirect) => redirect.source)
  .filter((source, index, all) => all.indexOf(source) !== index);
if (duplicates.length) {
  console.error(`[REDIRECTS] duplicate redirect source(s): ${[...new Set(duplicates)].join(', ')}`);
  process.exit(1);
}

const next = { ...config, redirects: merged };
const serialized = `${JSON.stringify(next, null, 2)}\n`;
const previous = fs.readFileSync(vercelPath, 'utf8');

if (checkOnly) {
  if (serialized !== previous) {
    console.error(
      '[REDIRECTS] vercel.json is out of date — run `node scripts/sync-vercel-redirects.mjs` ' +
        `(${generated.length} volume redirects expected, ${current.length} present).`,
    );
    process.exit(1);
  }
  console.log(`[REDIRECTS] vercel.json carries all ${generated.length} volume redirects (${BASE_URL}).`);
} else {
  if (serialized !== previous) fs.writeFileSync(vercelPath, serialized, 'utf8');
  console.log(
    `[REDIRECTS] ${generated.length} volume redirects written to vercel.json ` +
      `(${kept.length} other redirects preserved).`,
  );
}
