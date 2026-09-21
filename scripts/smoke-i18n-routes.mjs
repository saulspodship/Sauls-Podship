/**
 * Headless smoke test (dev tool, not part of the production build):
 * boots the BUILT app inside a jsdom-backed Node environment and verifies —
 *   1. the home page renders its seven pillar cards;
 *   2. the pillar CTA links are react-router Links (hash URLs), not raw
 *      document-reloading hrefs (the "GSAP animation instead of content" bug);
 *   3. switching the site language to Urdu translates chrome + content and
 *      sets <html lang/dir> + persists sp-lang;
 *   4. the theological archive shows real, translated question content;
 *   5. the comparative-apologetics iframe receives ?lang=;
 *   6. the ascension splash mounts only once per browser session.
 *
 * Usage: node scripts/smoke-i18n-routes.mjs   (after `npx vite build`)
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

const distDir = path.resolve(process.cwd(), 'dist');
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const shell = html.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, '');

const dom = new JSDOM(shell, {
  url: 'http://localhost:3000/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;

/* ---- browser API shims ---- */
window.matchMedia = window.matchMedia || ((q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q, onchange: null,
  addListener() {}, removeListener() {},
  addEventListener() {}, removeEventListener() {},
  dispatchEvent() { return false; },
}));
window.scrollTo = () => {};
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
window.cancelAnimationFrame = (id) => clearTimeout(id);

const store = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; },
  },
  configurable: true,
});
const session = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (k) => (k in session ? session[k] : null),
    setItem: (k, v) => { session[k] = String(v); },
    removeItem: (k) => { delete session[k]; },
  },
  configurable: true,
});
window.fetch = async (url) => {
  const file = path.join(distDir, String(url).replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('#')[0]);
  try {
    const body = fs.readFileSync(file);
    return { ok: true, status: 200, text: async () => body.toString(), json: async () => JSON.parse(body.toString()) };
  } catch {
    return { ok: false, status: 404, text: async () => '', json: async () => ({}) };
  }
};

/* expose the jsdom window as the Node global environment */
const FORCE = [ // realm-sensitive classes Node also defines natively — jsdom's must win
  'Event', 'CustomEvent', 'MessageEvent', 'ErrorEvent', 'UIEvent', 'KeyboardEvent',
  'MouseEvent', 'PointerEvent', 'FocusEvent', 'InputEvent', 'WheelEvent', 'TouchEvent',
  'ProgressEvent', 'AbortEvent', 'CloseEvent', 'HashChangeEvent', 'PopStateEvent',
  'AbortController', 'AbortSignal', 'DOMException',
];
for (const k of Object.getOwnPropertyNames(window)) {
  if (k === 'console' || k === 'process' || k === 'Buffer') continue;
  const exists = k in globalThis;
  if (!exists || FORCE.includes(k)) {
    try {
      const v = window[k];
      if (v !== undefined && (typeof v === 'function' || typeof v === 'object' || typeof v === 'string')) {
        Object.defineProperty(globalThis, k, { value: v, writable: true, configurable: true });
      }
    } catch { /* ignore */ }
  }
}
/* a few classes jsdom may not own but libraries expect */
for (const k of ['SVGElement', 'SVGSVGElement', 'SVGPathElement', 'SVGGElement', 'SVGCircleElement', 'SVGGraphicsElement', 'HTMLCanvasElement', 'CanvasRenderingContext2D', 'WebGLRenderingContext']) {
  if (!(k in globalThis)) {
    class Stub { }
    Object.defineProperty(globalThis, k, { value: Stub, writable: true, configurable: true });
  }
}
for (const k of ['requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'fetch', 'localStorage', 'sessionStorage', 'IntersectionObserver', 'ResizeObserver', 'scrollTo']) {
  try { globalThis[k] = window[k]; } catch { /* ignore */ }
}

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CSS_STRING = (s) => String(s).replace(/["\\]/g, '\\$&');
const waitFor = async (pred, timeoutMs, stepMs = 250) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pred()) return true;
    await sleep(stepMs);
  }
  return pred();
};

/* ---- import the built app as a real ESM module graph ---- */
const entry = fs.readdirSync(path.join(distDir, 'assets'))
  .filter((f) => /^index-.*\.js$/.test(f))
  .map((f) => path.join(distDir, 'assets', f))[0];

try {
  await import(pathToFileURL(entry).href);
} catch (e) {
  console.error('app import error:', e);
  process.exit(1);
}

await sleep(3000); // let React mount + GSAP arm

const doc = window.document;

/*
 * jsdom never fires `load` on stylesheet links (no network), and Vite's
 * __vitePreload awaits that event for CSS deps of lazy chunks — a lazy route
 * whose CSS hasn't been injected yet would hang on "Loading…" forever in this
 * harness (works fine in real browsers). Pre-injecting every built stylesheet
 * makes __vitePreload's `document.querySelector('link[href=...]')` short-
 * circuit, so lazy chunks import normally.
 */
for (const css of fs.readdirSync(path.join(distDir, 'assets')).filter((f) => f.endsWith('.css'))) {
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/assets/${css}`;
  doc.head.appendChild(link);
}

/* 1 — home page rendered */
check('home page rendered (seven-pillars section present)',
  /Seven Pillars/i.test(doc.body.textContent));

/* 2 — pillar CTAs are hash-router links (no full-page href) */
const anchors = Array.from(doc.querySelectorAll('main a[href]')).map((a) => a.getAttribute('href'));
const rawInternal = anchors.filter((h) => {
  const a = /^\/(theological-archive|comparative-apologetics|prophecy-map|cross-references|encyclopedia\/)/.test(h || '');
  return a && !doc.querySelector(`main a[href="${CSS_STRING(h)}"][target="_blank"]`);
});
check('pillar/module CTAs use the hash router (no document reload)', rawInternal.length === 0,
  rawInternal.length ? `raw hrefs: ${rawInternal.join(', ')}` : 'all internal CTAs are router links or deliberate new-tab links');
check('archive CTA targets the tough questions route',
  anchors.some((h) => (h || '').includes('theological-archive')));
check('codex CTA targets the comparative route',
  anchors.some((h) => (h || '').includes('comparative-apologetics')));

/* 3 — splash once per session */
check('ascension splash mounted on first open', !!doc.querySelector('.asc-root'));
const skipBtn = doc.querySelector('button[aria-label="Skip the ascension animation"]');
check('splash exposes a skip control', !!skipBtn);
if (skipBtn) {
  skipBtn.click();
  // skip = fast-forward at 6× timeScale across a ~10 s timeline (plus a
  // failsafe timer that always fires) — poll for the overlay to lift.
  const lifted = await waitFor(() => !doc.querySelector('.asc-root'), 15000);
  check('splash overlay removed after skipping', lifted);
  check('splash marks the session after skipping (never replays this session)',
    window.sessionStorage.getItem('sp-splash-played') === '1',
    `sp-splash-played=${window.sessionStorage.getItem('sp-splash-played')}`);
}

/* 4 — language switch */
const langSelect = doc.querySelector('select[aria-label="Website language"]');
check('site language selector present in header', !!langSelect);
if (langSelect) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(langSelect, 'ur');
  langSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  await sleep(2000);
  const htmlEl = doc.documentElement;
  check('switching to Urdu sets <html lang=ur dir=rtl>',
    htmlEl.getAttribute('lang') === 'ur' && htmlEl.getAttribute('dir') === 'rtl',
    `lang=${htmlEl.getAttribute('lang')} dir=${htmlEl.getAttribute('dir')}`);
  check('localStorage persisted sp-lang=ur', window.localStorage.getItem('sp-lang') === 'ur');
  const translatedLeaves = doc.querySelectorAll('[data-sp-i18n="ur"]').length;
  check('DOM translation applied to chrome strings', translatedLeaves > 10, `${translatedLeaves} translated leaves`);
  const pillarHeading = Array.from(doc.querySelectorAll('h3')).map((h) => h.textContent).join(' | ');
  check('pillar card titles translated (e.g. 51 Academic Volumes)',
    /۵۱ علمی جلدیں/.test(pillarHeading), pillarHeading.slice(0, 140));
  check('header nav translated', /موسوعہ/.test(Array.from(doc.querySelectorAll('header a, header button')).map((e) => e.textContent).join(' ')));
}

/* 5 — archive route with translations */
const archiveLink = Array.from(doc.querySelectorAll('a')).find((a) => (a.getAttribute('href') || '').includes('#/theological-archive'));
if (archiveLink) {
  archiveLink.click();
  // React Router keeps the old page visible during the lazy transition —
  // poll until the archive content actually commits (slow chunk loads).
  await waitFor(() => !!doc.querySelector('.ta-q-text'), 20000);
  const bodyTxt = doc.body.textContent || '';
  check('theological archive route renders real content', /Tough Questions/i.test(bodyTxt) || /سخت سوالات/.test(bodyTxt));
  const firstQ = doc.querySelector('.ta-q-text');
  check('tough question list rendered', !!firstQ, firstQ ? firstQ.textContent.slice(0, 90) : 'no .ta-q-text');
  check('question titles are in Urdu after language switch', firstQ ? /[\u0600-\u06FF]/.test(firstQ.textContent) : false,
    firstQ ? firstQ.textContent.slice(0, 90) : '');
  const stats = Array.from(doc.querySelectorAll('.ta-stats dd')).map((d) => d.textContent).join(',');
  check('stats labels translated', stats.includes('زبانیں'), stats);
  check('translated short answers present (ta-direct)', !!doc.querySelector('.ta-direct'));
}

/* 6 — comparative codex iframe receives ?lang= */
const codexLink = Array.from(doc.querySelectorAll('a')).find((a) => (a.getAttribute('href') || '').includes('#/comparative-apologetics'));
if (codexLink) {
  codexLink.click();
  await waitFor(() => !!doc.querySelector('iframe[src*="codex.html"]'), 20000);
  const frame = doc.querySelector('iframe[src*="codex.html"]');
  check('codex iframe present', !!frame);
  check('codex iframe src carries ?lang=ur', frame ? /\?lang=ur/.test(frame.getAttribute('src') || '') : false,
    frame ? frame.getAttribute('src') : 'no frame');
  const idx = doc.body.textContent || '';
  check('comparative page chrome translated', /مکمل سوالات کا فہرست/.test(idx));
  const jsonLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
    .some((s) => /"numberOfItems":400/.test(s.textContent || ''));
  check('comparative 400-question JSON-LD index rendered', jsonLd);
}

/* summary */
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(' | '));
  process.exit(1);
}
process.exit(0);
