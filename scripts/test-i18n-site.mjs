#!/usr/bin/env node
/**
 * test-i18n-site.mjs — the site-wide translation test loop.
 *
 * Runs the BUILT site for real: the production JS bundle is executed in Node
 * with a jsdom DOM (no mocks of the site itself), then every page is visited —
 * home, the encyclopedia hub, ALL 51 volumes, every module route and every
 * static module document — switching the language through the site's REAL
 * toggle paths (`sp-lang` in localStorage + the `storage` event, exactly what
 * the language select triggers cross-tab; `window.__spI18n.set()` for static
 * module docs). For every page × language it measures:
 *
 *   • html[lang] / html[dir] set correctly (hard gate)
 *   • chrome sample strings actually translated (hard gate)
 *   • coverage: share of translatable text nodes that now carry the target
 *     script (Arabic for ur/ar, Devanagari for hi)
 *   • the top English strings still left per page (the fix-list)
 *   • regression vs scripts/i18n-site-baseline.json (hard gate, -5pp)
 *
 * Usage:
 *   npm run build && npm run test:i18n:site              # full loop (all 51 volumes)
 *   node scripts/test-i18n-site.mjs --fast               # core + modules + 6 sample volumes
 *   node scripts/test-i18n-site.mjs --langs ur,hi        # subset of languages
 *   node scripts/test-i18n-site.mjs --update-baseline    # refresh the regression baseline
 *   I18N_DEBUG=1 ...                                     # per-probe progress logs
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL, fileURLToPath } from 'node:url';

const nodeFetch = globalThis.fetch;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const FAST = flag('--fast');
const UPDATE_BASELINE = flag('--update-baseline');
const LANGS = (args.find((a) => a.startsWith('--langs'))?.split('=')[1] || 'ur,hi,ar').split(',');
const MIN_COVERAGE = parseFloat(process.env.I18N_MIN_COVERAGE || '0'); // absolute gate (off by default)
const REGRESSION_PP = parseFloat(process.env.I18N_REGRESSION_PP || '5'); // hard: max allowed drop vs baseline

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error(`\n[x] ${DIST}/index.html not found — run \`npm run build\` first.\n`);
  process.exit(2);
}
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = await import('jsdom')); }
catch (e) { console.error(`\n[x] jsdom unavailable (${e.message}) — \`npm i --no-save jsdom\`.\n`); process.exit(2); }

/* ---------------------------------------------------------------- pages */
const volumes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/volumes/volumeIndex.json'), 'utf8'));
const CORE_ROUTES = ['/', '/encyclopedia', '/comparative-apologetics', '/prophecy-map', '/kings-of-the-bible',
  '/cross-references', '/music', '/music/punjabi-zaboor', '/music/pakistani-singers-archive', '/podcast',
  '/theological-archive', '/studio', '/support', '/faq', '/about', '/scholarly-standards',
  '/contact', '/terms', '/privacy', '/disclaimer', '/sitemap'];
const STATIC_DOCS = ['watchers-atlas/index.html', 'encyclopedia/biblical-maps-atlas.html', 'prophecy-map.html',
  'kings-of-the-bible.html', 'cross-references/viz.html', 'biblical-maps/index.html',
  'world-religion-map/index.html', 'family-tree/adam-to-jesus-overlap.html', 'singers.html', 'videos/index.html']
  .filter((f) => fs.existsSync(path.join(DIST, f)));

const volumeSlugs = volumes.map((v) => v.slug).filter(Boolean);
const volumeSample = FAST
  ? [...volumeSlugs].sort(() => Math.random() - 0.5).slice(0, 6)
  : volumeSlugs;
const MAX_ROUTES = parseInt(process.env.I18N_MAX_ROUTES || '0', 10);
const ALL_HASHES = [...CORE_ROUTES.map((r) => '#' + r), ...volumeSample.map((s) => `#/encyclopedia/${s}`)];
const SPA_HASHES = MAX_ROUTES ? ALL_HASHES.slice(0, MAX_ROUTES) : ALL_HASHES;

/* ------------------------------------------------------------ static server */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

/* ----------------------------------------------------------------- helpers */
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const DEVANAGARI = /[\u0900-\u097F]/;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR', 'SVG',
  'CANVAS', 'AUDIO', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'TITLE', 'META', 'LINK', 'PATH']);
const skipEl = (el) => {
  if (!el || SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest?.('[translate="no"],[data-sp-notranslate],[data-sp-i18n-skip],[aria-hidden="true"]')) return true;
  const cls = el.getAttribute?.('class') || '';
  return /(^|\s)(notranslate|urdu|urdu-body|sp-boot|katex|MathJax)(\s|$)/.test(cls);
};
const targetScript = (lang) => (lang === 'hi' ? DEVANAGARI : ARABIC);

function measure(doc, lang) {
  const tgt = targetScript(lang);
  const walker = doc.createTreeWalker(doc.body, 4 /* SHOW_TEXT */);
  let translated = 0, english = 0, node;
  const misses = new Map();
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || skipEl(parent)) continue;
    const text = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const letters = text.replace(/[^A-Za-z\u0600-\u06FF\u0900-\u097F]/g, '');
    if (letters.length < 3) continue; // numbers, symbols, dates
    if (/^(https?:\/\/|www\.|[\w.+-]+@[\w-]+\.)/.test(text)) continue;
    if (tgt.test(text)) translated++;
    else if (/[A-Za-z]{3,}/.test(text)) {
      english++;
      const key = text.slice(0, 90);
      misses.set(key, (misses.get(key) || 0) + 1);
    }
  }
  const total = translated + english;
  const coverage = total ? translated / total : 1;
  const top = [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s, n]) => ({ n, s }));
  return { coverage, translated, english, top };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pageSig = (doc) => (doc.title || '') + '|' + (doc.querySelector('main h1, h1')?.textContent || '').trim();
const measureOnly = (win, hash) => pageSig(win.document) === lastSig && win.location.hash === hash;
async function settle(doc, { min = 1500, max = 8000, quiet = 650 } = {}) {
  const start = Date.now();
  let lastMutation = Date.now();
  const obs = new doc.defaultView.MutationObserver(() => { lastMutation = Date.now(); });
  obs.observe(doc.documentElement, { childList: true, subtree: true, characterData: true });
  while (Date.now() - start < max) {
    await sleep(120);
    if (Date.now() - start >= min && Date.now() - lastMutation >= quiet) break;
  }
  obs.disconnect();
  await sleep(200); // the engine's trailing rescan passes land at +250ms
}

/* --------------------------------------------------- static module documents */
const vc = () => {
  const c = new VirtualConsole();
  c.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) console.error('  [jsdom]', e.message?.slice(0, 200)); });
  c.on('error', (...a) => console.error('  [console.error]', ...a.map((x) => String(x?.stack || x).slice(0, 300))));
  if (process.env.I18N_DEBUG) c.on('log', (...a) => console.log('  [log]', ...a.map((x) => String(x).slice(0, 160))));
  return c;
};

async function runStaticDoc(rel) {
  const doc = await JSDOM.fromURL(`${BASE}/${rel}`, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc(),
    beforeParse(win) {
      try { win.localStorage.setItem('sp-lang', 'en'); } catch {}
      win.fetch = (input, init) => nodeFetch(typeof input === 'string' ? new URL(input, BASE + '/').href : input, init);
      win.matchMedia ||= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
      win.IntersectionObserver ||= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
      win.scrollTo = () => {};
    },
  });
  const { window: win } = doc;
  await settle(win.document, { min: 2200, max: 10000 });
  for (const lang of LANGS) {
    try {
      win.__spI18n?.set?.(lang);
      await settle(win.document, { min: 2800, max: 10000 });
      const m = measure(win.document, lang);
      const rep = win.__spI18n?.report?.();
      results.push({ page: `/${rel}`, kind: 'static', lang, ...m, runtimeMissing: rep?.missing?.length ?? null,
        sampleMissing: (rep?.missing || []).slice(0, 8),
        langOk: win.document.documentElement.getAttribute('lang') === lang,
        dir: win.document.documentElement.getAttribute('dir') });
    } catch (e) {
      results.push({ page: `/${rel}`, kind: 'static', lang, error: String(e?.message || e).slice(0, 160), coverage: 0 });
    }
  }
  win.close();
}

/* ----------------------------------------------------- the SPA under test */
const GLOBALS_FROM_WIN = ['document', 'location', 'history', 'CustomEvent', 'Event', 'StorageEvent', 'MessageChannel',
  'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'getComputedStyle',
  'matchMedia', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'DocumentFragment', 'NodeFilter', 'Image', 'self'];
let spaCleanup = null;

async function runSpa() {
  const dom = new JSDOM(`<!doctype html><html lang="en"><head><title>loop</title></head><body><div id="root"></div></body></html>`,
    { url: `${BASE}/index.html`, pretendToBeVisual: true, virtualConsole: vc() });
  const win = dom.window;
  // absolute-URL fetch for everything the app/runtime fetch at runtime
  win.fetch = (input, init) => nodeFetch(typeof input === 'string' ? new URL(input, BASE + '/').href : input, init);
  win.matchMedia ||= () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  win.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };
  win.IntersectionObserver ||= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  win.HTMLElement.prototype.scrollIntoView ||= () => {};
  Object.defineProperty(win, 'scrollTo', { value: () => {}, configurable: true });
  try { win.localStorage.setItem('sp-lang', 'en'); } catch {}

  // Mirror the DOM environment onto Node's globals — the production bundle
  // references these as bare identifiers.
  globalThis.window = win;
  for (const k of GLOBALS_FROM_WIN) {
    try { Object.defineProperty(globalThis, k, { value: win[k], configurable: true, writable: true }); }
    catch { globalThis[k] = win[k]; }
  }
  Object.defineProperty(globalThis, 'navigator', { value: win.navigator, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: win.localStorage, configurable: true });
  // framer-motion does `addEventListener(type, fn, { signal })` with a signal
  // from THIS realm — jsdom's IDL validation rejects cross-realm signals, so
  // the bundle must construct AbortControllers from the jsdom realm.
  Object.defineProperty(globalThis, 'AbortController', { value: win.AbortController, configurable: true });
  Object.defineProperty(globalThis, 'AbortSignal', { value: win.AbortSignal, configurable: true });
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  globalThis.cancelAnimationFrame = clearTimeout;
  globalThis.scrollTo = () => {};
  globalThis.fetch = win.fetch;

  const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const bundles = [...indexHtml.matchAll(/src="(\/assets\/index-[^"]+\.js)"/g)].map((m) => m[1]);
  if (!bundles.length) { console.error('[x] no index bundle found in dist/index.html'); process.exit(2); }
  await import(pathToFileURL(path.join(DIST, bundles[0].slice(1))));
  await settle(win.document, { min: 3000, max: 20000, quiet: 900 });
  if (!win.document.getElementById('root')?.children.length) {
    console.error('\n[x] the app did not render into #root — cannot loop the SPA.');
    process.exit(2);
  }

  for (const lang of LANGS) {
    // The REAL toggle path: persist + storage event (what the language select
    // produces cross-tab; the in-page select funnels into the same store).
    win.localStorage.setItem('sp-lang', lang);
    win.dispatchEvent(new win.StorageEvent('storage', { key: 'sp-lang', newValue: lang }));
    await settle(win.document, { min: 3000, max: 12000 });
    for (const hash of SPA_HASHES) {
      try {
        const navTo = async () => {
          if (win.location.hash !== hash) win.location.hash = hash;
          await settle(win.document, { min: 2400, max: 14000, quiet: 850 });
        };
        await navTo();
        // navigation retry: when a lazy chunk import races the settle window the
        // router can swallow the hashchange — re-dispatch it manually once.
        if (win.location.hash !== hash || (lastSig && measureOnly(win, hash))) {
          win.dispatchEvent(new win.Event('hashchange'));
          await settle(win.document, { min: 2400, max: 14000, quiet: 850 });
        }
        let m = measure(win.document, lang);
        // route-change guard: did the page actually change? (title + first heading)
        let sig = (win.document.title || '') + '|' +
          (win.document.querySelector('main h1, h1')?.textContent || '').trim();
        if (lastSig && sig === lastSig && hash !== lastHash) {
          // one more forced pass before recording the anomaly
          win.dispatchEvent(new win.Event('hashchange'));
          await settle(win.document, { min: 2400, max: 14000, quiet: 850 });
          const sig2 = (win.document.title || '') + '|' +
            (win.document.querySelector('main h1, h1')?.textContent || '').trim();
          if (sig2 !== sig) { sig = sig2; m = measure(win.document, lang); }
          else navWarnings.push(`${hash} [${lang}] page did not change from ${lastHash}`);
        }
        lastSig = sig; lastHash = hash;
        results.push({ page: hash, kind: 'spa', lang, ...m, sig,
          navTexts: hash === '#/' ? [...win.document.querySelectorAll('header a')].map((a) => (a.textContent || '').trim()) : undefined,
          langOk: win.document.documentElement.getAttribute('lang') === lang,
          dir: win.document.documentElement.getAttribute('dir') });
        if (process.env.I18N_DEBUG) console.log(`  ${hash} [${lang}] ${(m.coverage * 100).toFixed(0)}% (${m.translated}t/${m.english}en)`);
      } catch (e) {
        results.push({ page: hash, kind: 'spa', lang, error: String(e?.message || e).slice(0, 160), coverage: 0 });
      }
    }
  }
  spaCleanup = () => win.close();
}

/* --------------------------------------------------------- the loop itself */
const results = [];
const navWarnings = [];
let lastSig = '', lastHash = '';
const CHROME_SAMPLE = ['Encyclopedia', 'Study Tools', 'Watch & Listen', 'Support'];

console.log(`[i18n-site] static module docs: ${STATIC_DOCS.length} · SPA routes: ${SPA_HASHES.length} · langs: ${LANGS.join(',')}`);
for (const doc of STATIC_DOCS) {
  process.stdout.write(`[doc] /${doc} ... `); console.time('t'); await runStaticDoc(doc); console.timeEnd('t');
}
process.stdout.write('[spa] booting the app ... '); console.time('t'); await runSpa(); console.timeEnd('t');
spaCleanup?.();

/* ------------------------------------------------------------------ report */
const pct = (c) => `${(c * 100).toFixed(0)}%`;
const byPage = new Map();
for (const r of results) byPage.set(r.page, { ...(byPage.get(r.page) || {}), [r.lang]: r });

const hardFailures = [];
console.log(`\n============ i18n site loop: ${results.length} page×lang probes ============`);
for (const [page, langs] of byPage) {
  const cells = LANGS.map((l) => {
    const r = langs[l];
    if (!r) return `${l}: —`;
    if (r.error) { hardFailures.push(`${page} [${l}] crashed: ${r.error}`); return `${l}: ERR`; }
    if (!r.langOk) hardFailures.push(`${page} [${l}] html[lang] not set to ${l}`);
    if (r.coverage < MIN_COVERAGE) hardFailures.push(`${page} [${l}] coverage ${pct(r.coverage)} < ${pct(MIN_COVERAGE)}`);
    return `${l}: ${pct(r.coverage)} (${r.translated}t/${r.english}en)`;
  });
  console.log(`${page.padEnd(52)} ${cells.join('  ·  ')}`);
}

/* chrome gate on the home page: nav labels must not survive in English */
for (const lang of LANGS) {
  const home = byPage.get('#/')?.[lang];
  if (!home || home.error) { hardFailures.push(`#/ [${lang}] missing measurement`); continue; }
  const nav = home.navTexts || [];
  if (!nav.length) { hardFailures.push(`#/ [${lang}] no header nav found to verify chrome`); continue; }
  for (const chrome of CHROME_SAMPLE) {
    if (nav.some((t) => t === chrome)) hardFailures.push(`#/ [${lang}] chrome string still English: "${chrome}"`);
  }
  if (process.env.I18N_DEBUG) console.log(`  [chrome ${lang}]`, nav.join(' | '));
}

/* regression gate vs baseline */
const baselinePath = path.join(root, 'scripts/i18n-site-baseline.json');
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : {};
let regressions = 0;
for (const r of results) {
  const prev = baseline[`${r.page}|${r.lang}`];
  if (prev != null && !r.error && r.coverage < prev - REGRESSION_PP / 100) {
    hardFailures.push(`${r.page} [${r.lang}] coverage ${pct(r.coverage)} regressed >${REGRESSION_PP}pp (baseline ${pct(prev)})`);
    regressions++;
  }
}
if (UPDATE_BASELINE) {
  const next = {};
  for (const r of results) if (!r.error) next[`${r.page}|${r.lang}`] = r.coverage;
  fs.writeFileSync(baselinePath, JSON.stringify(next, null, 1));
  console.log(`\n[i18n-site] baseline written: ${baselinePath} (${Object.keys(next).length} probes)`);
}

/* artifacts + fix-list */
const outDir = path.join(root, 'i18n-report');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'site-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), langs: LANGS, results }, null, 1));

const worst = results.filter((r) => !r.error).sort((a, b) => a.coverage - b.coverage).slice(0, 15);
console.log('\n--- thinnest coverage (the fix-list) ---');
for (const w of worst) {
  console.log(`${w.page} [${w.lang}] ${pct(w.coverage)}${w.runtimeMissing != null ? ` · runtime missing: ${w.runtimeMissing}` : ''}`);
  for (const t of (w.top || []).slice(0, 3)) console.log(`    ${t.n}×  ${t.s}`);
}
console.log(`\nfull report: i18n-report/site-report.json`);

if (navWarnings.length) {
  console.log(`\n[warn] ${navWarnings.length} navigation anomaly(ies):`);
  for (const w of navWarnings.slice(0, 20)) console.log('  ! ' + w);
}
if (hardFailures.length) {
  console.log(`\n[FAIL] ${hardFailures.length} hard gate failure(s):`);
  for (const f of hardFailures.slice(0, 40)) console.log('  ✗ ' + f);
  server.close(); process.exit(1);
}
console.log(`\n[PASS] hard gates passed (html[lang]/dir · chrome strings${MIN_COVERAGE ? ` · min coverage ${pct(MIN_COVERAGE)}` : ''} · ${regressions ? `${regressions} regression(s) blocked` : 'regression vs baseline'})`);
server.close();
