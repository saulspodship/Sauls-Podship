#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * volume-hero-batch.mjs — artwork campaign helper (volumes 14–50).
 *
 * For every manifest entry in .tmp-hero-masters/manifest.json whose volume
 * number falls inside the requested [from..to] range:
 *   1. Converts the generated master .tmp-hero-masters/<slug>.png into the
 *      three site variants under public/images/volumes/<slug>/ with sharp:
 *        hero-1920.jpg   (width 1920, jpeg, quality 82, mozjpeg, progressive)
 *        hero-1920.webp  (width 1920, webp, quality 80)
 *        hero-1280.webp  (width 1280, webp, quality 80)
 *   2. Rewrites the heroImage + cardImage blocks (src/alt/credit) in
 *      src/data/volumes/volume_NN.ts and in the volumesData.json mirror,
 *      replacing the old public-domain / unsplash placeholders.
 *
 * Run: node scripts/volume-hero-batch.mjs <from> <to>     e.g. 14 23
 * Then: node scripts/gen-volume-index.mjs && npm run lint
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MASTERS = path.join(ROOT, '.tmp-hero-masters');
const IMG_DIR = path.join(ROOT, 'public/images/volumes');
const VOL_DIR = path.join(ROOT, 'src/data/volumes');
const CREDIT = "Original artwork commissioned by Saul's Podship Studio";

/**
 * Replace the `"key": { … }` block in `src` with pretty-printed `obj`,
 * preserving the indentation of the key's line. When `searchFrom` is given,
 * only matches at/after that offset (used for the per-volume slice of the
 * volumesData.json mirror).
 */
function replaceBlock(src, key, obj, searchFrom = 0) {
  const keyIdx = src.indexOf(`"${key}":`, searchFrom);
  if (keyIdx === -1) throw new Error(`"${key}" block not found`);
  const braceStart = src.indexOf('{', keyIdx);
  if (braceStart === -1) throw new Error(`"${key}" block has no body`);
  let i = braceStart, depth = 0, inStr = false, esc = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error(`"${key}" block unbalanced`);
  const lineStart = src.lastIndexOf('\n', keyIdx) + 1;
  const indent = /^\s*/.exec(src.slice(lineStart, keyIdx))[0];
  const block = JSON.stringify(obj, null, 2).split('\n').join('\n' + indent);
  return src.slice(0, lineStart) + indent + `"${key}": ` + block + src.slice(i + 1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(MASTERS, 'manifest.json'), 'utf8'));
const [from, to] = process.argv.slice(2).map(n => Number(n));
if (!Number.isInteger(from) || !Number.isInteger(to)) {
  console.error('usage: node scripts/volume-hero-batch.mjs <from> <to>');
  process.exit(1);
}
const pad = n => String(n).padStart(2, '0');
const mirrorPath = path.join(VOL_DIR, 'volumesData.json');

for (const m of manifest.filter(e => e.n >= from && e.n <= to)) {
  const master = path.join(MASTERS, `${m.slug}.png`);
  if (!fs.existsSync(master)) throw new Error(`missing master for volume ${m.n}: ${master}`);
  const dir = path.join(IMG_DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });

  await sharp(master).clone().resize({ width: 1920 })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(path.join(dir, 'hero-1920.jpg'));
  await sharp(master).clone().resize({ width: 1920 })
    .webp({ quality: 80 }).toFile(path.join(dir, 'hero-1920.webp'));
  await sharp(master).clone().resize({ width: 1280 })
    .webp({ quality: 80 }).toFile(path.join(dir, 'hero-1280.webp'));

  const hero = {
    src: `/images/volumes/${m.slug}/hero-1920.jpg`,
    alt: m.alt,
    credit: CREDIT,
  };
  const card = {
    src: `/images/volumes/${m.slug}/hero-1280.webp`,
    alt: m.alt,
  };

  const tsPath = path.join(VOL_DIR, `volume_${pad(m.n)}.ts`);
  let ts = fs.readFileSync(tsPath, 'utf8');
  ts = replaceBlock(ts, 'heroImage', hero);
  ts = replaceBlock(ts, 'cardImage', card);
  fs.writeFileSync(tsPath, ts);

  // Mirror: the volume files are sorted by number, so each key's first
  // occurrence after this volume's "slug" line belongs to this volume.
  let mirror = fs.readFileSync(mirrorPath, 'utf8');
  const volStart = mirror.indexOf(`"slug": "${m.slug}"`);
  if (volStart === -1) throw new Error(`${m.slug} not in volumesData.json`);
  mirror = replaceBlock(mirror, 'heroImage', hero, volStart);
  mirror = replaceBlock(mirror, 'cardImage', card, volStart);
  fs.writeFileSync(mirrorPath, mirror);

  console.log(`[HERO] vol ${pad(m.n)} ${m.slug}: variants + data updated`);
}
console.log('[HERO] batch done');
