#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * test-i18n.mjs — the gate that keeps the language toggle honest.
 *
 * The old toggle broke silently: it only translated strings somebody had typed
 * into a dictionary, so every page/volume/module added later stayed English and
 * nothing ever reported it. This script fails the build when that happens
 * again.
 *
 * Checks
 *  1. artifacts      public/i18n/{ur,hi,ar}.json exist, parse, and are current
 *                    (scripts/build-i18n.mjs --check)
 *  2. shape          every language has the same key set; no empty values
 *  3. script         Urdu/Arabic values are Arabic-script, Hindi values are
 *                    Devanagari (catches a copy/paste into the wrong column)
 *  4. patterns       every rule compiles, and every {n} placeholder in the
 *                    template refers to a capture group that exists
 *  5. coverage       the navigation, footer, Companion module bar, volume-page
 *                    chrome and ALL 51 volume titles/subtitles are translated
 *
 * Missing volume titles are a warning (a new volume must not block a release);
 * missing chrome is a failure. `--strict` turns the warnings into failures.
 *
 * Usage: node scripts/test-i18n.mjs [--strict]
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');

const LANGS = ['ur', 'hi', 'ar'];
/** Translation tuples are [ur, hi, ar] — index per language. */
const TUPLE = { ur: 0, hi: 1, ar: 2 };
const errors = [];
const warnings = [];
let checks = 0;

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ok = (label, detail = '') => { checks++; console.log(`  \u2713 ${label}${detail ? ` — ${detail}` : ''}`); };

/* Arabic script (incl. Urdu) and Devanagari ranges. */
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const DEVANAGARI = /[\u0900-\u097F]/;
const LATIN_HEAVY = (s) => (s.match(/[A-Za-z]/g) || []).length / Math.max(1, s.replace(/\s/g, '').length) > 0.6;

/* ------------------------------------------------------------------ */
console.log('sp-i18n: artifacts');
/* ------------------------------------------------------------------ */
const payloads = {};
for (const lang of LANGS) {
  const file = path.join(root, 'public', 'i18n', `${lang}.json`);
  if (!fs.existsSync(file)) { fail(`missing generated dictionary: public/i18n/${lang}.json (run \`npm run gen:i18n\`)`); continue; }
  try {
    payloads[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`public/i18n/${lang}.json is not valid JSON: ${err.message}`);
  }
}
if (Object.keys(payloads).length === LANGS.length) {
  ok('dictionaries present', LANGS.map((l) => `${l}:${Object.keys(payloads[l].dict).length}`).join(' '));
}

/* stale artifact check — the committed JSON must match the TS sources */
try {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build-i18n.mjs'), '--check'], { cwd: root, stdio: 'pipe' });
  ok('artifacts are current');
} catch (err) {
  const out = `${err.stdout || ''}${err.stderr || ''}`.trim().split('\n').pop();
  fail(`generated i18n artifacts are stale — run \`npm run gen:i18n\` and commit. (${out})`);
}

/* ------------------------------------------------------------------ */
console.log('sp-i18n: dictionary shape');
/* ------------------------------------------------------------------ */
const keySets = LANGS.map((l) => (payloads[l] ? new Set(Object.keys(payloads[l].dict)) : new Set()));
const base = keySets[0];
for (let i = 1; i < keySets.length; i++) {
  const missing = [...base].filter((k) => !keySets[i].has(k));
  const extra = [...keySets[i]].filter((k) => !base.has(k));
  if (missing.length) fail(`${LANGS[i]} is missing ${missing.length} keys present in ${LANGS[0]} (e.g. "${missing[0]}")`);
  if (extra.length) fail(`${LANGS[i]} has ${extra.length} keys not in ${LANGS[0]} (e.g. "${extra[0]}")`);
}
if (!errors.length) ok('all three languages share one key set', `${base.size} keys`);

for (const lang of LANGS) {
  if (!payloads[lang]) continue;
  let empty = 0;
  for (const [k, v] of Object.entries(payloads[lang].dict)) {
    if (typeof v !== 'string' || !v.trim()) empty++;
    else if (v === k) empty++;
  }
  if (empty) fail(`${lang}: ${empty} empty or untranslated values`);
  else ok(`${lang}: no empty values`);
}

/* ------------------------------------------------------------------ */
console.log('sp-i18n: script sanity');
/* ------------------------------------------------------------------ */
for (const lang of LANGS) {
  if (!payloads[lang]) continue;
  const want = lang === 'hi' ? DEVANAGARI : ARABIC;
  const wrong = [];
  for (const [k, v] of Object.entries(payloads[lang].dict)) {
    /* Values that are only Latin (proper nouns, URLs, brand names) are fine. */
    if (!/[A-Za-z]/.test(k)) continue;
    if (want.test(v)) continue;
    if (LATIN_HEAVY(v) && !/[^\x00-\x7F]/.test(v)) continue; // pure brand/URL value
    wrong.push(k);
  }
  if (wrong.length) fail(`${lang}: ${wrong.length} values are not in the expected script (e.g. "${wrong[0]}" → "${payloads[lang].dict[wrong[0]]}")`);
  else ok(`${lang}: values are in the expected script`);
}

/* ------------------------------------------------------------------ */
console.log('sp-i18n: pattern rules');
/* ------------------------------------------------------------------ */
const patterns = (payloads.ur && payloads.ur.patterns) || [];
if (!patterns.length) fail('no pattern rules shipped — generated strings ("Vol 12: …") would stay English');
for (const p of patterns) {
  let re;
  try { re = new RegExp(p.re, p.flags || ''); } catch (err) { fail(`pattern "${p.id}" does not compile: ${err.message}`); continue; }
  const groups = countGroups(p.re);
  for (const lang of LANGS) {
    const out = Array.isArray(p.out) ? p.out[TUPLE[lang]] : (p.out || {})[lang];
    if (typeof out !== 'string' || !out) { fail(`pattern "${p.id}" has no ${lang} template`); continue; }
    for (const m of out.matchAll(/\{(\d+)\}/g)) {
      const n = Number(m[1]);
      if (n < 1 || n > groups) fail(`pattern "${p.id}" ${lang} template references {${n}} but has only ${groups} group(s)`);
    }
  }
  for (const idx of [...(p.numeric || []), ...(p.translate || [])]) {
    if (idx < 1 || idx > groups) fail(`pattern "${p.id}" references group ${idx} but has only ${groups} group(s)`);
  }
}
if (patterns.length && !errors.some((e) => e.startsWith('pattern'))) ok('pattern rules compile and their placeholders resolve', `${patterns.length} rules`);

function countGroups(src) {
  let n = 0;
  let escaped = false;
  let inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }
    if (c === '[') { inClass = true; continue; }
    if (c === ']') { inClass = false; continue; }
    if (inClass) continue;
    if (c === '(' && src.slice(i, i + 2) !== '(?') n++;
    else if (c === '(' && src[i + 1] === '?' && src[i + 2] === '<' && src[i + 3] !== '=' && src[i + 3] !== '!') n++;
  }
  return n;
}

/* ------------------------------------------------------------------ */
console.log('sp-i18n: coverage');
/* ------------------------------------------------------------------ */
const dict = payloads.ur ? payloads.ur.dict : {};
const has = (s) => Object.prototype.hasOwnProperty.call(dict, s);

/** Strings that MUST translate: the chrome every visitor sees on every page. */
const CRITICAL = {
  'header navigation': ['Encyclopedia', 'Study Tools', 'Watch & Listen', 'Ministry', 'Scriptorium Studio', 'Support',
    'Prophecy Map', 'Interlinked Bible', 'Kings of the Bible', 'Comparative Apologetics', 'Theological Archive',
    'Biblical Maps Atlas', 'Biblical Languages', 'Punjabi Zaboor', 'Singers Archive', 'Podcast', 'Videos',
    'Sacred Music', 'Support & Mission', 'FAQ', 'Contact', 'About', 'Standards'],
  'footer': ['All 51 Volumes Index', 'Sacred Music Hub', 'Pakistani Singers Archive', 'Theological Podcast',
    'Bible Video Library', 'Scriptorium AI Studio', 'Official YouTube', 'About the Ministry', 'Scholarly Standards',
    'Support on Patreon', 'Partnership & Mission', 'Frequently Asked Questions', 'Contact & Submissions',
    'Privacy Policy', 'Terms of Service', 'Theological Disclaimer', 'HTML Sitemap', 'Follow the Podship',
    'Music & Media', 'Ministry & Legal'],
  'Companion module': ['Companion Modules', 'Biblical Prophecy Map', 'The Interlinked Bible', 'Comparative Apologetics'],
  'volume page chrome': ['Key Facts', 'Overview', 'Timeline', 'Related Volumes', 'Read Volume', 'Open Volume',
    'Tables', 'Scriptures', 'Story Panels', 'Character Profiles', 'Print Study Guide', 'Copy Table to Clipboard'],
  'modules': ['Switch Between the Modules', 'Study modules', 'Interactive Modules', 'Table of Contents', 'Islam',
    'Judaism', 'Hinduism', 'Sikhism', 'Open the Codex', 'Weave the Cross-References'],
  'shared micro-copy': ['Search', 'Loading…', 'Share', 'Download', 'Print', 'Close', 'Read more', 'Back to top',
    'Expand all', 'Collapse all', 'Sort by:', 'All languages', 'Return Home'],
};

for (const [group, list] of Object.entries(CRITICAL)) {
  const missing = list.filter((s) => !has(s));
  if (missing.length) fail(`${group}: ${missing.length} untranslated (${missing.slice(0, 6).map((m) => `"${m}"`).join(', ')})`);
  else ok(`${group} fully covered`, `${list.length} strings`);
}

/* Every catalogue volume must translate — this is the regression that started
   all of this: volumes added after the toggle existed stayed English. */
const indexPath = path.join(root, 'src', 'data', 'volumes', 'volumeIndex.json');
if (fs.existsSync(indexPath)) {
  const volumes = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const noTitle = [];
  const noSub = [];
  for (const v of volumes) {
    if (v.title && !has(v.title)) noTitle.push(`${v.number}: ${v.title}`);
    if (v.subtitle && !has(v.subtitle)) noSub.push(`${v.number}: ${v.subtitle}`);
  }
  if (noTitle.length) {
    const m = `volume titles untranslated (${noTitle.length}/${volumes.length}): ${noTitle.slice(0, 5).join(' | ')}`;
    STRICT ? fail(m) : warn(m);
  } else ok(`all ${volumes.length} volume titles translated`);
  if (noSub.length) {
    const m = `volume subtitles untranslated (${noSub.length}/${volumes.length}): ${noSub.slice(0, 3).join(' | ')}`;
    STRICT ? fail(m) : warn(m);
  } else ok(`all ${volumes.length} volume subtitles translated`);
} else {
  warn('volumeIndex.json not found — run `npm run gen:volumes`');
}

/* The static module documents must load the shared shim, or they stay English. */
const STATIC_PAGES = [
  'public/prophecy-map.html', 'public/kings-of-the-bible.html', 'public/cross-references/viz.html',
  'public/encyclopedia/biblical-maps-atlas.html', 'public/singers.html', 'public/videos/index.html',
  'public/biblical-maps/index.html', 'public/world-religion-map/index.html',
  'public/family-tree/adam-to-jesus-overlap.html',
];
const noShim = STATIC_PAGES.filter((f) => {
  const abs = path.join(root, f);
  return fs.existsSync(abs) && !fs.readFileSync(abs, 'utf8').includes('sp-i18n.js');
});
if (noShim.length) fail(`static module pages missing /assets/sp-i18n.js: ${noShim.join(', ')}`);
else ok('static module documents load the shared shim', `${STATIC_PAGES.length} pages`);

/* The codex page is frozen — its enhancer must delegate to the shared runtime
   instead of keeping a private dictionary. */
const enhancer = path.join(root, 'public', 'comparative-apologetics', 'podship-enhance.js');
if (fs.existsSync(enhancer)) {
  const src = fs.readFileSync(enhancer, 'utf8');
  if (!src.includes('/assets/sp-i18n.js')) fail('podship-enhance.js does not load the shared i18n runtime');
  else if (/\bDICT\s*=\s*{/.test(src)) fail('podship-enhance.js still keeps a private DICT — it must use the shared dictionary');
  else ok('codex enhancer delegates to the shared runtime');
}

/* Nothing may reintroduce a private dictionary. */
const chrome = path.join(root, 'src', 'components', 'ChromeControls.tsx');
if (fs.existsSync(chrome)) {
  const src = fs.readFileSync(chrome, 'utf8');
  if (/^const DICT:/m.test(src)) fail('ChromeControls.tsx has a private DICT again — translations live in src/data/i18n');
  else if (!src.includes('lib/i18n')) fail('ChromeControls.tsx does not use the shared i18n runtime');
  else ok('ChromeControls drives the shared runtime');
}

/* ------------------------------------------------------------------ */
console.log('sp-i18n: engine behaviour');
/* ------------------------------------------------------------------ */
/* Run the REAL translator (not a copy of it) against the generated dictionary,
   including strings that do not exist yet — a volume 63, a future date — which
   is the whole point of the pattern rules. */
try {
  const os = await import('os');
  const { build } = await import('esbuild');
  const tmpDir = fs.mkdtempSync(path.join(os.default.tmpdir(), 'sp-i18n-test-'));
  const outFile = path.join(tmpDir, 'engine.mjs');
  await build({
    entryPoints: [path.join(root, 'src/lib/i18n/engine.ts')],
    outfile: outFile, bundle: true, platform: 'node', format: 'esm',
    target: 'node18', logLevel: 'silent',
    /* the engine only touches the DOM inside functions, never at import time */
  });
  const engine = await import(pathToFileURL(outFile).href);
  const ur = payloads.ur;

  const tr = engine.buildTranslator('ur', ur);
  if (!tr) fail('buildTranslator returned null for the Urdu dictionary');
  else {
    const cases = [
      /* exact dictionary hit */
      ['Encyclopedia', '\u0645\u0648\u0633\u0648\u0639\u06C1'],
      /* entity-decoded source, as React renders it */
      ['Contact &amp; Submissions', '\u0631\u0627\u0628\u0637\u06C1 \u0648 \u0627\u0631\u0633\u0627\u0644'],
      /* trailing punctuation is preserved around the translation */
      ['Lineage:', '\u0646\u0633\u0628:'],
      /* casing drift in the DOM still resolves */
      ['companion modules', '\u06C1\u0645\u0631\u0627\u06C1 \u0645\u0627\u0688\u06CC\u0648\u0644\u0632'],
      /* templated: localised digits, no dictionary entry needed for the number */
      ['Browse 51 Volumes', '\u06F5\u06F1 \u062C\u0644\u062F\u06CC\u06BA \u062F\u06CC\u06A9\u06BE\u06CC\u06BA'],
      /* a volume count that does not exist yet — proves later volumes translate */
      ['Browse 63 Volumes', '\u06F6\u06F3 \u062C\u0644\u062F\u06CC\u06BA \u062F\u06CC\u06A9\u06BE\u06CC\u06BA'],
      ['All 78 Volumes Index', '\u062A\u0645\u0627\u0645 \u06F7\u06F8 \u062C\u0644\u062F\u0648\u06BA \u06A9\u0627 \u0641\u06C1\u0631\u0633\u062A'],
      /* templated + captured title looked up in the dictionary */
      ['Vol 12: Book of Revelation', '\u062C\u0644\u062F \u06F1\u06F2: \u0645\u06A9\u0627\u0634\u0641\u06C1 \u06A9\u06CC \u06A9\u062A\u0627\u0628'],
      /* a title we have no entry for still yields a correctly shaped string */
      ['Vol 99: Some Future Volume', '\u062C\u0644\u062F \u06F9\u06F9: Some Future Volume'],
      /* generated date line */
      ['Last Updated: September 6, 2026', '\u0622\u062E\u0631\u06CC \u062A\u0631\u0645\u06CC\u0645: \u06F6 \u0633\u062A\u0645\u0628\u0631 \u06F2\u06F0\u06F2\u06F6'],
    ];
    let bad = 0;
    for (const [src, want] of cases) {
      const got = engine.translateText(src, tr);
      if (got !== want) { bad++; fail(`translateText("${src}") → "${got}", expected "${want}"`); }
    }
    if (!bad) ok(`translator resolves ${cases.length} exact / edge / templated cases`);

    /* Unknown strings must come back null — never a partial guess. */
    const unknown = engine.translateText('Quantum chromodynamics of the early church', tr);
    if (unknown !== null) fail(`unknown string was "translated" to "${unknown}" — it must be left alone`);
    else ok('unknown strings are left untouched');

    /* Normalisation must be idempotent, or keys and DOM text drift apart. */
    const n = engine.normalize('  Contact   &amp;\u00A0Submissions \u2014 Vol\u2019s  ');
    if (engine.normalize(n) !== n) fail('normalize() is not idempotent');
    else ok('normalisation is idempotent');
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (err) {
  fail(`engine behaviour test could not run: ${err.message}`);
}

/* ------------------------------------------------------------------ */
for (const w of warnings) console.log(`  \u26A0 ${w}`);
console.log('');
if (errors.length) {
  console.error(`sp-i18n: FAILED (${errors.length} problem(s), ${checks} checks passed)`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  console.error('\nFix the dictionary in src/data/i18n/* then run: npm run gen:i18n');
  process.exit(1);
}
console.log(`sp-i18n: OK — ${checks} checks passed, ${base.size} entries × ${LANGS.length} languages, ${patterns.length} patterns${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
