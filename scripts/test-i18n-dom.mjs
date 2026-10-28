#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * test-i18n-dom.mjs — runs the REAL translator against a REAL DOM.
 *
 * test-i18n.mjs proves the dictionary and the lookup logic are sound; this
 * proves the engine behaves in a document: that it translates every text node
 * (not a hand-picked selector list), reaches into same-origin module iframes,
 * leaves `translate="no"` / `.urdu` copy alone, translates tooltips and
 * alt text, and — critically — puts the page back exactly as it was when the
 * visitor switches to English.
 *
 * jsdom is not a project dependency (the repo has no test framework), so this
 * script SKIPS itself when jsdom is absent rather than failing the build:
 *
 *   npm i -D jsdom && node scripts/test-i18n-dom.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.log('sp-i18n-dom: SKIPPED (jsdom not installed — `npm i -D jsdom` to run)');
  process.exit(0);
}

const failures = [];
const passes = [];
const check = (label, cond, detail = '') => {
  if (cond) passes.push(label);
  else failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
};

/* ---- a page shaped like the real site: header nav, volume cards generated
   from data, the Companion bar injected by companion.js, an embedded module
   iframe, and copy that must never be translated. ---- */
const HTML = `<!DOCTYPE html><html lang="en"><head><title>Saul's Podship | Encyclopedia</title></head><body>
<header>
  <nav>
    <a href="#/encyclopedia">Encyclopedia</a>
    <button><span>Study Tools</span></button>
    <a href="#/music">Sacred Music</a>
    <a href="#/about" title="About the Ministry">About</a>
  </nav>
  <div data-sp-i18n-skip><select><option>English</option><option>اردو</option></select></div>
</header>
<main>
  <h1>The 51-Volume Scriptorium</h1>
  <h2>Featured Scholarly Excerpts</h2>
  <a href="#/encyclopedia/book-of-revelation">Vol 12: Book of Revelation</a>
  <a href="#/encyclopedia/vatican-and-its-history">Vol 48: Vatican and its History</a>
  <a href="#/encyclopedia/some-future-volume">Vol 99: Some Future Volume</a>
  <p>Browse 51 Volumes</p>
  <p>Key Facts</p>
  <p>Last Updated: September 6, 2026</p>
  <img src="/x.jpg" alt="Saul's Podship Logo" />
  <section id="companion-modules" data-companion-routes="1">
    <div data-sp-companion-eyebrow="1">Companion Modules</div>
    <a href="/prophecy-map" data-sp-companion-label="Biblical Prophecy Map">Biblical Prophecy Map</a>
    <a href="/cross-references" data-sp-companion-label="The Interlinked Bible">The Interlinked Bible</a>
  </section>
  <p class="urdu">سالز پوڈشپ پوڈکاسٹ</p>
  <div translate="no"><p>Do not translate this sentence.</p></div>
  <pre><code>const x = "Search";</code></pre>
  <p id="untranslated">Quantum chromodynamics of the early church</p>
</main>
<footer><h4>Ministry &amp; Legal</h4><a href="#/privacy">Privacy Policy</a></footer>
</body></html>`;

const dom = new JSDOM(HTML, { url: 'https://www.saulspodship.com/', pretendToBeVisual: true });
const { window } = dom;

/* An embedded module document, same-origin like prophecy-map.html. */
const frame = window.document.createElement('iframe');
window.document.body.appendChild(frame);
frame.contentDocument.documentElement.lang = 'en';
frame.contentDocument.body.innerHTML = '<h2>Biblical Prophecy Map</h2><button>Reset</button>';

/* ---- host globals the engine expects ---- */
const dictFiles = {};
for (const lang of ['ur', 'hi', 'ar']) {
  dictFiles[lang] = JSON.parse(fs.readFileSync(path.join(root, 'public', 'i18n', `${lang}.json`), 'utf8'));
}
/* Node 22 exposes some of these as getter-only globals — define, don't assign. */
const expose = (name, value) => {
  try {
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  } catch { /* the engine guards every use of these; a stub we cannot set is not fatal */ }
};
expose('window', window);
expose('document', window.document);
expose('navigator', window.navigator);
expose('location', window.location);
expose('MutationObserver', window.MutationObserver);
expose('NodeFilter', window.NodeFilter);
expose('CustomEvent', window.CustomEvent);
expose('StorageEvent', window.StorageEvent);
expose('requestAnimationFrame', (fn) => window.setTimeout(() => fn(Date.now()), 0));
expose('cancelAnimationFrame', (id) => window.clearTimeout(id));
expose('localStorage', window.localStorage);
expose('fetch', async (url) => {
  const m = /\/i18n\/(ur|hi|ar)\.json/.exec(String(url));
  if (!m) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => dictFiles[m[1]] };
});

/* ---- bundle + import the real engine ---- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-i18n-dom-'));
const outFile = path.join(tmp, 'engine.mjs');
await build({
  entryPoints: [path.join(root, 'src/lib/i18n/engine.ts')],
  outfile: outFile, bundle: true, platform: 'node', format: 'esm', target: 'node18', logLevel: 'silent',
});
const engine = await import(pathToFileURL(outFile).href);

const text = (sel) => (window.document.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= boot exactly like the app does ================= */
/* startI18n() is what I18nProvider calls: it wires the cross-frame language
   sync AND arms the MutationObserver that catches content rendered later
   (lazy volume chunks, the Companion bar, module iframes). */
await engine.startI18n();
await sleep(20);

/* ================= switch to Urdu ================= */
await engine.setLanguage('ur');
await sleep(60);

check('html[lang] follows the toggle', window.document.documentElement.lang === 'ur', window.document.documentElement.lang);
check('html[dir] becomes rtl', window.document.documentElement.dir === 'rtl', window.document.documentElement.dir);

check('header nav translated', text('nav a') === 'موسوعہ', text('nav a'));
check('nested nav label translated (button > span)', text('nav button span') === 'مطالعہ کے آلات', text('nav button span'));
check('footer heading translated through an entity', text('footer h4') === 'خدمت و قانونی', text('footer h4'));
check('footer link translated', text('footer a') === 'رازداری کی پالیسی', text('footer a'));

check('volume link: pattern + captured title', text('main a[href*="book-of-revelation"]') === 'جلد ۱۲: مکاشفہ کی کتاب', text('main a[href*="book-of-revelation"]'));
check('volume 48 (added after the toggle existed)', text('main a[href*="vatican"]') === 'جلد ۴۸: ویٹیکن اور اس کی تاریخ', text('main a[href*="vatican"]'));
check('a volume with no dictionary entry still keeps its shape',
  text('main a[href*="some-future-volume"]') === 'جلد ۹۹: Some Future Volume', text('main a[href*="some-future-volume"]'));
check('count string translated with localised digits', text('main p') === '۵۱ جلدیں دیکھیں', text('main p'));
check('generated date line translated', /آخری ترمیم: ۶ ستمبر ۲۰۲۶/.test(window.document.body.textContent), 'date');

check('Companion module eyebrow translated', text('[data-sp-companion-eyebrow]') === 'ہمراہ ماڈیولز', text('[data-sp-companion-eyebrow]'));
check('Companion route button translated', text('[data-sp-companion-label="Biblical Prophecy Map"]') === 'بائبل کا نقشۂ نبوّت', text('[data-sp-companion-label="Biblical Prophecy Map"]'));

check('tooltip attribute translated', window.document.querySelector('nav a[title]').getAttribute('title') === 'خدمت کا تعارف', window.document.querySelector('nav a[title]').getAttribute('title'));
check('alt attribute translated', window.document.querySelector('img').getAttribute('alt') === 'سالز پوڈشپ کا لوگو', window.document.querySelector('img').getAttribute('alt'));

check('same-origin module iframe translated', (frame.contentDocument.querySelector('h2').textContent || '').trim() === 'بائبل کا نقشۂ نبوّت', frame.contentDocument.querySelector('h2').textContent);
check('iframe lang/dir stamped', frame.contentDocument.documentElement.lang === 'ur' && frame.contentDocument.documentElement.dir === 'rtl');

check('already-Urdu copy untouched', text('.urdu') === 'سالز پوڈشپ پوڈکاسٹ', text('.urdu'));
check('translate="no" respected', text('[translate="no"] p') === 'Do not translate this sentence.', text('[translate="no"] p'));
check('code blocks untouched', text('pre code') === 'const x = "Search";', text('pre code'));
check('the language selector itself is never translated', text('[data-sp-i18n-skip] option') === 'English', text('[data-sp-i18n-skip] option'));
check('unknown strings are left in English, never guessed', text('#untranslated') === 'Quantum chromodynamics of the early church', text('#untranslated'));
check('tab title translated', /سالز پوڈشپ/.test(window.document.title), window.document.title);

/* ================= content added AFTER the switch ================= */
const late = window.document.createElement('p');
late.textContent = 'Frequently Asked Questions';
window.document.querySelector('main').appendChild(late);
await sleep(400);
check('late-rendered node is translated (MutationObserver)', late.textContent.trim() === 'عام سوالات', late.textContent);

/* ================= switch back to English ================= */
await engine.setLanguage('en');
await sleep(40);
check('html[lang] restored', window.document.documentElement.lang === 'en');
check('html[dir] restored to ltr', window.document.documentElement.dir === 'ltr');
check('nav restored to the authored English', text('nav a') === 'Encyclopedia', text('nav a'));
check('volume link restored exactly', text('main a[href*="book-of-revelation"]') === 'Vol 12: Book of Revelation', text('main a[href*="book-of-revelation"]'));
check('tooltip restored', window.document.querySelector('nav a[title]').getAttribute('title') === 'About the Ministry');
check('alt restored', window.document.querySelector('img').getAttribute('alt') === "Saul's Podship Logo");
check('Companion bar restored', text('[data-sp-companion-eyebrow]') === 'Companion Modules');
check('iframe restored', (frame.contentDocument.querySelector('h2').textContent || '').trim() === 'Biblical Prophecy Map', frame.contentDocument.querySelector('h2').textContent);
check('late node restored', late.textContent.trim() === 'Frequently Asked Questions', late.textContent);
check('no residue markers left behind', window.document.querySelectorAll('[data-sp-i18n-missing]').length === 0);

/* ================= switch straight to a third language ================= */
await engine.setLanguage('hi');
await sleep(40);
check('switching ur→en→hi lands on Hindi', text('nav a') === 'विश्वकोश', text('nav a'));
check('Hindi digits localised in templated strings', text('main p') === '५१ खंड देखें', text('main p'));
check('Hindi dir stays ltr', window.document.documentElement.dir === 'ltr');

fs.rmSync(tmp, { recursive: true, force: true });
window.close();

console.log('');
for (const p of passes) console.log(`  \u2713 ${p}`);
if (failures.length) {
  console.error(`\nsp-i18n-dom: FAILED (${failures.length}/${passes.length + failures.length})`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  process.exit(1);
}
console.log(`\nsp-i18n-dom: OK — ${passes.length} DOM assertions passed`);
