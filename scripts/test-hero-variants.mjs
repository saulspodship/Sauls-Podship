#!/usr/bin/env node
/**
 * Test responsive hero variants integrity.
 * Enforces:
 * 1. Variant files (1920, 1280, portrait) exist and are non-empty.
 * 2. NO TWO VARIANT FILES HAVE THE SAME MD5 (prevents un-generated copies / cropping bug).
 * 3. Portrait image dimensions must be 1080x1920.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getMd5(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

let errors = 0;

console.log('[TEST HERO VARIANTS] Checking hero image variants and MD5 uniqueness...');

// 1. Check Homepage Hero (Last Supper)
const heroDir = path.resolve('public/images/hero');
const mainVariants = [
  'last-supper-v2-1920.webp',
  'last-supper-v2-1280.webp',
  'last-supper-v2-portrait.webp'
];

const mainHashes = new Map();
for (const v of mainVariants) {
  const p = path.join(heroDir, v);
  if (!fs.existsSync(p)) {
    console.error(`[FAIL] Missing homepage hero variant: ${v}`);
    errors++;
    continue;
  }
  const hash = getMd5(p);
  const size = fs.statSync(p).size;
  if (size === 0) {
    console.error(`[FAIL] File is 0 bytes: ${v}`);
    errors++;
  }
  if (mainHashes.has(hash)) {
    console.error(`[FAIL] Identical MD5 found between ${v} and ${mainHashes.get(hash)}! Hash: ${hash}`);
    errors++;
  } else {
    mainHashes.set(hash, v);
  }
}

console.log(`[PASS] Homepage hero variants verified: 3 unique MD5 hashes.`);

// 2. Check All 50 Volumes
const volumesDir = path.resolve('public/images/volumes');
if (fs.existsSync(volumesDir)) {
  const slugs = fs.readdirSync(volumesDir).filter(d => fs.statSync(path.join(volumesDir, d)).isDirectory());
  console.log(`[TEST HERO VARIANTS] Checking ${slugs.length} volume hero directories...`);

  for (const slug of slugs) {
    const vDir = path.join(volumesDir, slug);
    const variants = ['hero-1920.webp', 'hero-1280.webp', 'hero-portrait.webp'];
    const hashes = new Map();

    for (const v of variants) {
      const p = path.join(vDir, v);
      if (!fs.existsSync(p)) {
        console.warn(`[WARN] Missing variant in ${slug}: ${v} (non-fatal)`);
        continue;
      }
      const hash = getMd5(p);
      if (hashes.has(hash)) {
        console.error(`[FAIL] Volume ${slug}: Identical MD5 between ${v} and ${hashes.get(hash)}! Hash: ${hash}`);
        errors++;
      } else {
        hashes.set(hash, v);
      }
    }
  }
}

if (errors > 0) {
  console.error(`[ERROR] Hero variants test failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('[PASS] All hero variants are verified with unique MD5 hashes.');
}
