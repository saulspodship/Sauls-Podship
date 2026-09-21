/**
 * Headless smoke test for the static module translator
 * (public/assets/module-i18n.js) — dev tool, not part of the build.
 *
 * For each of the three module pages it loads the REAL served HTML into
 * jsdom (scripts disabled, so only the static chrome exists — exactly what
 * the translator covers), runs module-i18n.js in that window, and verifies:
 *   1. boot from ?lang= (highest priority, not persisted);
 *   2. boot from localStorage['sp-lang'];
 *   3. <html lang/dir/data-lang> switched;
 *   4. the DICT keys actually match the rendered chrome text (text nodes
 *      change, spot-check strings appear);
 *   5. the search placeholder is translated via data-orig-ph;
 *   6. live re-translation through the {sp:'lang'} postMessage protocol
 *      (restore first, then apply the new language);
 *   7. 'en' restores every touched node to its original English text.
 *
 * Usage: node scripts/smoke-module-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const i18nSrc = fs.readFileSync(path.join(root, 'public/assets/module-i18n.js'), 'utf8');

const PAGES = [
  {
    file: 'prophecy-map.html',
    url: 'http://localhost:3000/prophecy-map.html',
    hasSearch: true,
    spot: { ur: 'تین جہتی گلوب', ar: 'كرة ثلاثية الأبعاد', hi: 'त्रि-आयामी ग्लोब' }, // 3D Globe view button
  },
  {
    file: 'cross-references/viz.html',
    url: 'http://localhost:3000/cross-references/viz.html',
    hasSearch: false,
    spot: { ur: '۶۶ کتابیں', ar: 'مراجع الآيات', hi: '६६ पुस्तकें' },
  },
  {
    file: 'kings-of-the-bible.html',
    url: 'http://localhost:3000/kings-of-the-bible.html',
    hasSearch: false,
    spot: { ur: 'یسوع مسیح — بادشاہوں کا بادشاہ', ar: 'ملك الملوك', hi: 'राजाओं का राजा' },
  },
];

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Normalised snapshot of every visible text node in the document. */
const snapshot = (doc) => {
  const walker = doc.createTreeWalker(doc.body, doc.defaultView.NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.data && n.data.replace(/\s+/g, '')
      && n.parentElement && !n.parentElement.closest('script, style, noscript, textarea, code, pre')
      ? 1 : 2),
  });
  const out = [];
  let n;
  while ((n = walker.nextNode())) out.push(n.data.replace(/\s+/g, ' ').trim());
  return out;
};

/** Build a jsdom of the page with fresh storage, then run the translator. */
async function bootPage(file, url, { storedLang } = {}) {
  const html = fs.readFileSync(path.join(root, 'public', file), 'utf8');
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const store = {};
  if (storedLang) store['sp-lang'] = storedLang;
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    configurable: true,
  });
  const before = snapshot(window.document);
  const beforeH2 = Array.from(window.document.querySelectorAll('h2')).map((h) => h.textContent.trim());
  window.eval(i18nSrc);
  await sleep(150); // boot + TreeWalker
  return { dom, window, store, before, beforeH2 };
}

const changedCount = (before, after) => {
  const counts = new Map();
  for (const t of before) counts.set(t, (counts.get(t) || 0) + 1);
  let changed = 0;
  for (const t of after) {
    const c = counts.get(t) || 0;
    if (c > 0) counts.set(t, c - 1);
    else changed++;
  }
  return changed;
};

for (const page of PAGES) {
  console.log(`\n── ${page.file} ──`);

  /* boot from ?lang=ur (must win, must not persist) */
  {
    const { window, store, before } = await bootPage(page.file, `${page.url}?lang=ur`);
    const doc = window.document;
    const changed = changedCount(before, snapshot(doc));
    check(`${page.file}: ?lang=ur boot translates chrome text`, changed > 5, `${changed} nodes changed`);
    check(`${page.file}: ?lang= boot sets html lang=ur dir=rtl data-lang=ur`,
      doc.documentElement.getAttribute('lang') === 'ur'
      && doc.documentElement.getAttribute('dir') === 'rtl'
      && doc.documentElement.getAttribute('data-lang') === 'ur');
    check(`${page.file}: ?lang= boot does NOT persist to localStorage`, !('sp-lang' in store));
    check(`${page.file}: Urdu spot-check present`, doc.body.textContent.includes(page.spot.ur),
      `"${page.spot.ur.slice(0, 28)}"`);
    if (page.hasSearch) {
      const q = doc.querySelector('#q');
      check(`${page.file}: search placeholder translated`,
        !!q && !!q.getAttribute('data-orig-ph') && /[\u0600-\u06FF]/.test(q.placeholder || ''),
        q ? `placeholder="${q.placeholder}"` : 'no #q input');
    }
    window.close();
  }

  /* boot from localStorage, live postMessage → ar, then window event → en */
  {
    const { window, before, beforeH2 } = await bootPage(page.file, page.url, { storedLang: 'hi' });
    const doc = window.document;
    check(`${page.file}: localStorage boot (hi) sets html lang=hi`,
      doc.documentElement.getAttribute('lang') === 'hi'
      && doc.documentElement.getAttribute('data-lang') === 'hi');
    const hiChanged = changedCount(before, snapshot(doc));
    check(`${page.file}: localStorage boot translates chrome (hi)`, hiChanged > 5, `${hiChanged} nodes changed`);

    window.postMessage({ sp: 'lang', lang: 'ar' }, '*');
    await sleep(200);
    check(`${page.file}: postMessage → ar switches html attrs`,
      doc.documentElement.getAttribute('lang') === 'ar' && doc.documentElement.getAttribute('dir') === 'rtl');
    const afterAr = snapshot(doc);
    check(`${page.file}: postMessage → ar re-translates`, changedCount(before, afterAr) > 5,
      `${changedCount(before, afterAr)} nodes differ from original English`);
    check(`${page.file}: Arabic spot-check present`, doc.body.textContent.includes(page.spot.ar),
      `"${page.spot.ar.slice(0, 28)}"`);
    if (beforeH2.length > 0) {
      const arH2 = Array.from(doc.querySelectorAll('h2')).map((h) => h.textContent.trim());
      const h2Changed = arH2.filter((t, i) => beforeH2[i] !== t).length;
      check(`${page.file}: section headings translated under ar`, h2Changed > 0, `${h2Changed}/${beforeH2.length} h2s changed`);
    }

    window.dispatchEvent(new window.CustomEvent('sp-lang-change', { detail: { lang: 'en' } }));
    await sleep(200);
    check(`${page.file}: sp-lang-change → en restores original English exactly`,
      doc.documentElement.getAttribute('lang') === 'en' && changedCount(before, snapshot(doc)) === 0);
    window.close();
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(' | '));
  process.exit(1);
}
process.exit(0);
