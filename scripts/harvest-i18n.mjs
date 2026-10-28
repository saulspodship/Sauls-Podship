#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * harvest-i18n.mjs — build-time *audit* helper for the site-wide language layer.
 *
 * It walks every React page/component/module plus the static retrofit scripts
 * and extracts the English UI strings a visitor can actually read (JSX text,
 * aria-label / title / placeholder / alt attributes, nav + footer labels).
 *
 * Output:
 *   --report   (default)  prints a coverage report: how many harvested strings
 *                         the shipped dictionary already translates, and the
 *                         top missing ones, ordered by how "UI-ish" they look.
 *   --json <file>         writes the harvested list as JSON (for translation
 *                         worklists / the optional machine-translation pass).
 *
 * This script never touches the network and never edits sources: it is a
 * measuring stick so "the whole website is translated" stays true as new
 * volumes, pages and modules are added.
 *
 * Usage:
 *   node scripts/harvest-i18n.mjs
 *   node scripts/harvest-i18n.mjs --json .i18n-worklist.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SCAN_DIRS = ['src/pages', 'src/components', 'src/layouts', 'src/data', 'components'];
const SCAN_FILES = ['public/assets/companion.js', 'public/assets/site-header.js', 'public/assets/bottom-nav.js', 'public/assets/maps-atlas.js'];
const EXTS = new Set(['.tsx', '.jsx', '.ts', '.js']);

const ATTR_RE = /(?:aria-label|title|placeholder|alt)\s*=\s*(?:"([^"\n]{2,160})"|'([^'\n]{2,160})'|\{\s*(?:"([^"\n]{2,160})"|'([^'\n]{2,160})')\s*\})/g;
const JSX_TEXT_RE = />([^<>{}\n]{2,160})</g;
const JS_STRING_RE = /(?:label|name|text|title|heading|blurb|short|q|a|caption|eyebrow)\s*:\s*(?:"([^"\n]{2,200})"|'([^'\n]{2,200})')/g;

const SKIP_SOURCE = new Set(['src/data/volumes/volumesData.json']);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      yield* walk(p);
    } else if (EXTS.has(path.extname(entry.name))) {
      yield p;
    }
  }
}

const files = [];
for (const d of SCAN_DIRS) {
  const abs = path.join(root, d);
  if (fs.existsSync(abs)) files.push(...walk(abs));
}
for (const f of SCAN_FILES) {
  const abs = path.join(root, f);
  if (fs.existsSync(abs)) files.push(abs);
}

/** Strip comments so commented-out copy is not harvested. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
}

const isNoise = (s) => {
  const t = s.trim();
  if (t.length < 2) return true;
  if (!/[A-Za-z]/.test(t)) return true;                       // icons, glyphs, numbers
  if (/^[a-z0-9-]+$/i.test(t)) return true;                   // css classes, slugs
  if (/^[.#]/.test(t) || /^(https?:|\/)/.test(t)) return true;
  if (/[{}<>|]/.test(t)) return true;                         // template fragments
  if (/^(px|rem|em|ms|s|vh|vw|%|deg)$/.test(t)) return true;
  if (/^\s*(className|style|key|id|src|href|to|value|onChange|onClick)\s*$/i.test(t)) return true;
  if (/tailwind|webkit|rgba?|#[0-9a-f]{3,8}/i.test(t)) return true;
  if (/^[A-Z][A-Za-z0-9]+$/.test(t) && t.length > 18) return true; // identifiers
  if (/^\s*(true|false|null|undefined|number|string|boolean)\s*$/i.test(t)) return true;
  return false;
};

/** Normalise exactly like the runtime translator does. */
const ENTITIES = { '&amp;': '&', '&bull;': '\u2022', '&mdash;': '\u2014', '&ndash;': '\u2013', '&hellip;': '\u2026', '&nbsp;': ' ', '&rarr;': '\u2192', '&times;': '\u00d7', '&rsquo;': '\u2019', '&lsquo;': '\u2018', '&ldquo;': '\u201c', '&rdquo;': '\u201d', '&apos;': "'", '&middot;': '\u00b7' };
const decode = (s) => s.replace(/&[a-zA-Z#0-9]{2,8};/g, (m) => ENTITIES[m] ?? m);
const norm = (s) => decode(s).replace(/\s+/g, ' ').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014\u2015]/g, '-').trim();

/** Dictionary keys and static-script strings are authored with \uXXXX escapes;
 *  the DOM holds real characters. Decode both sides or the coverage report lies. */
const unescapeSource = (s) => s
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"')
  .replace(/\\\\/g, '\\');

const found = new Map(); // normalised string → { count, files:Set }
for (const file of files) {
  const rel = path.relative(root, file);
  if (SKIP_SOURCE.has(rel)) continue;
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }
  src = stripComments(src);
  const hits = [];
  for (const re of [ATTR_RE, JSX_TEXT_RE, JS_STRING_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      for (const g of m.slice(1)) if (g) hits.push(g);
    }
  }
  for (const h of hits) {
    const t = norm(unescapeSource(h));
    if (isNoise(t)) continue;
    const rec = found.get(t) || { count: 0, files: new Set() };
    rec.count++;
    rec.files.add(rel);
    found.set(t, rec);
  }
}

/* ---------- dictionary coverage ---------- */
const dictFiles = ['src/data/i18n/dict-chrome.ts', 'src/data/i18n/dict-pages.ts', 'src/data/i18n/dict-volumes.ts', 'src/data/i18n/dict-modules.ts', 'src/data/i18n/patterns.ts'];
const dictKeys = new Set();
for (const f of dictFiles) {
  const abs = path.join(root, f);
  if (!fs.existsSync(abs)) continue;
  const src = fs.readFileSync(abs, 'utf8');
  const re = /^\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([A-Za-z0-9_$][\w$]*))\s*:/gm;
  let m;
  while ((m = re.exec(src))) {
    const k = m[1] ?? m[2] ?? m[3];
    if (k) dictKeys.add(norm(unescapeSource(k)));
  }
}

/* Strings produced from data ("Vol 47: ...", "Browse 63 Volumes", dates) are
   covered by pattern rules rather than literal keys, so evaluate those too —
   otherwise the report calls them gaps and hides the real ones. */
const patternRes = [];
try {
  const payload = JSON.parse(fs.readFileSync(path.join(root, 'public/i18n/ur.json'), 'utf8'));
  for (const p of payload.patterns || []) {
    try { patternRes.push(new RegExp(p.re, p.flags || '')); } catch { /* bad rule: test-i18n reports it */ }
  }
} catch { /* dictionaries not built yet */ }
const byPattern = (s) => patternRes.some((re) => re.test(s));

const rows = [...found.entries()].map(([text, r]) => ({ text, count: r.count, files: [...r.files], pattern: false }));
rows.sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
const covered = rows.filter((r) => dictKeys.has(r.text));
const patterned = rows.filter((r) => !dictKeys.has(r.text) && ((r.pattern = byPattern(r.text)) === true));
const missing = rows.filter((r) => !dictKeys.has(r.text) && !r.pattern);

const jsonOut = process.argv.indexOf('--json');
if (jsonOut > -1) {
  const dest = process.argv[jsonOut + 1];
  if (!dest) { console.error('--json needs a path'); process.exit(2); }
  fs.writeFileSync(path.resolve(root, dest), JSON.stringify({ generated: new Date().toISOString(), total: rows.length, covered: covered.length, missing: missing.map((r) => r.text) }, null, 2));
  console.log(`wrote ${dest}`);
}

const pct = rows.length ? (((covered.length + patterned.length) / rows.length) * 100).toFixed(1) : '0.0';
console.log(`harvested ${rows.length} distinct UI strings from ${new Set(rows.flatMap((r) => r.files)).size} files`);
console.log(`covered ${covered.length} literal + ${patterned.length} by pattern rule (${pct}%) — ${missing.length} unmatched`);
if (process.argv.includes('--missing')) {
  for (const r of missing.slice(0, Number(process.env.LIMIT || 400))) console.log(`  ${String(r.count).padStart(3)}  ${r.text}`);
}
