/**
 * Headless smoke test for the SEO/AEO FAQ injector
 * (public/assets/seo-aeo.js) — dev tool, not part of the build.
 *
 * Guards against the regression where the injected FAQ block:
 *   - landed at the TOP of <main> after SPA route changes (React inserts
 *     new route content after it), and
 *   - showed the HOME FAQ on every route (hash router pathname is "/").
 *
 * Verifies:
 *   1. home route: FAQ block at the very BOTTOM of <main>, FAQPage JSON-LD;
 *   2. encyclopedia route: FAQ rebuilt with the encyclopedia content, bottom;
 *   3. volume route: NO FAQ block, NO FAQPage JSON-LD, volume heading first;
 *   4. module route: NO FAQ block;
 *   5. back navigation restores the correct per-route state.
 *
 * Usage: node scripts/smoke-seo-faq.mjs   (after `npx vite build`)
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const dom = new JSDOM(html.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, ''), { url: 'http://localhost:3000/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, onchange: null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } }));
window.scrollTo = () => {};
window.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
window.cancelAnimationFrame = (id) => clearTimeout(id);
const store = {};
Object.defineProperty(window, 'localStorage', { value: { getItem:(k)=>(k in store?store[k]:null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:(k)=>{delete store[k];}, clear:()=>{} }, configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: { getItem:() => null, setItem:()=>{}, removeItem:()=>{} }, configurable: true });
window.fetch = async (url) => { const file = path.join(distDir, String(url).replace(/^https?:\/\/[^/]+/, '').split('?')[0].split('#')[0]);
  try { const body = fs.readFileSync(file); return { ok:true, status:200, text: async()=>body.toString(), json: async()=>JSON.parse(body.toString()) }; }
  catch { return { ok:false, status:404, text: async()=>'', json: async()=>({}) }; } };
const FORCE = ['Event','CustomEvent','MessageEvent','ErrorEvent','UIEvent','KeyboardEvent','MouseEvent','PointerEvent','FocusEvent','InputEvent','WheelEvent','TouchEvent','ProgressEvent','AbortEvent','CloseEvent','HashChangeEvent','PopStateEvent','AbortController','AbortSignal','DOMException'];
for (const k of Object.getOwnPropertyNames(window)) {
  if (k === 'console' || k === 'process' || k === 'Buffer') continue;
  if (!(k in globalThis) || FORCE.includes(k)) {
    try { const v = window[k]; if (v !== undefined && (typeof v==='function'||typeof v==='object'||typeof v==='string')) Object.defineProperty(globalThis, k, { value: v, writable: true, configurable: true }); } catch {}
  }
}
for (const k of ['SVGElement','SVGSVGElement','SVGPathElement','SVGGElement','SVGCircleElement','SVGGraphicsElement']) { if (!(k in globalThis)) { class S{}; Object.defineProperty(globalThis,k,{value:S,writable:true,configurable:true}); } }

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const entry = fs.readdirSync(path.join(distDir,'assets')).filter(f=>/^index-.*\.js$/.test(f)).map(f=>path.join(distDir,'assets',f))[0];
await import(pathToFileURL(entry).href);
await sleep(2500); // shell + home content
const doc = window.document;

/* run the injector exactly as the deferred tag would */
window.eval(fs.readFileSync(path.join(root, 'public/assets/seo-aeo.js'), 'utf8'));
await sleep(1200);

const seoPos = () => {
  const main = doc.querySelector('main');
  if (!main) return { idx: -1, total: 0 };
  const kids = Array.from(main.children);
  return { idx: kids.findIndex((c) => c.classList.contains('sp-seo')), total: kids.length };
};
const hasLd = () => Array.from(doc.querySelectorAll('script.sp-seo-ld')).length > 0;
const nav = async (href, waitMs) => {
  const link = Array.from(doc.querySelectorAll('a')).find((a) => (a.getAttribute('href') || '') === href);
  if (link) link.click(); else window.location.hash = href.slice(1);
  await sleep(waitMs);
};

/* 1 — home */
let p = seoPos();
check('home: FAQ block injected', p.idx !== -1);
check('home: FAQ block at the very bottom of <main>', p.idx === p.total - 1, `index ${p.idx} of ${p.total}`);
check('home: FAQPage JSON-LD present', hasLd());
check('home: FAQ prose is the home content', (doc.querySelector('.sp-seo .para')?.textContent || '').includes('biblical ministry project'));

/* 2 — encyclopedia (SPA forward navigation via pushState) */
await nav('#/encyclopedia', 5000);
p = seoPos();
check('encyclopedia: FAQ block at the bottom (not above the content)', p.idx === p.total - 1, `index ${p.idx} of ${p.total}`);
check('encyclopedia: FAQ content switched to the encyclopedia FAQ', (doc.querySelector('.sp-seo .para')?.textContent || '').includes('Scriptorium catalog'));
check('encyclopedia: route heading comes before the FAQ', (() => {
  const h = doc.querySelector('main h1, main h2');
  const seo = doc.querySelector('.sp-seo');
  return !!(h && seo && (h.compareDocumentPosition(seo) & window.Node.DOCUMENT_POSITION_FOLLOWING));
})());

/* 3 — volume (no FAQ data for this route) */
await nav('#/encyclopedia/all-bible-stories', 6000);
p = seoPos();
check('volume: NO FAQ block on top or anywhere', p.idx === -1, `index ${p.idx} of ${p.total}`);
check('volume: FAQPage JSON-LD removed', !hasLd());
check('volume: first heading is the volume content', !/Frequently Asked Questions/i.test(doc.querySelector('main h1, main h2')?.textContent || ''));

/* 4 — module route (no FAQ data) */
await nav('#/prophecy-map', 5000);
p = seoPos();
check('module route: NO FAQ block', p.idx === -1);

/* 5 — back to volume, then back to encyclopedia */
window.history.back(); await sleep(3500);
check('back→volume: still no FAQ block', seoPos().idx === -1);
window.history.back(); await sleep(3500);
p = seoPos();
check('back→encyclopedia: FAQ restored at the bottom', p.idx === p.total - 1, `index ${p.idx} of ${p.total}`);
check('back→encyclopedia: correct FAQ content restored', (doc.querySelector('.sp-seo .para')?.textContent || '').includes('Scriptorium catalog'));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(' | '));
  process.exit(1);
}
process.exit(0);
