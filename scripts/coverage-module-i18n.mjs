import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
const root = process.cwd();
const i18nSrc = fs.readFileSync(path.join(root, 'public/assets/module-i18n.js'), 'utf8');
const pages = [
  ['prophecy-map.html', 'http://localhost:3000/prophecy-map.html'],
  ['cross-references/viz.html', 'http://localhost:3000/cross-references/viz.html'],
  ['kings-of-the-bible.html', 'http://localhost:3000/kings-of-the-bible.html'],
];
for (const [file, url] of pages) {
  const html = fs.readFileSync(path.join(root, 'public', file), 'utf8');
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const { window } = dom;
  Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'ur', setItem(){}, removeItem(){} }, configurable: true });
  window.eval(i18nSrc);
  await new Promise(r => setTimeout(r, 200));
  const seen = new Set();
  const walker = window.document.createTreeWalker(window.document.body, 1 /* elements */, {
    acceptNode: (n) => n.closest('script, style, noscript, textarea, code, pre') ? 2 : 1,
  });
  const out = [];
  let el;
  while ((el = walker.nextNode())) {
    // own text only (child elements carry their own)
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.data.replace(/\s+/g,' ').trim()).join(' ').trim();
    if (!own) continue;
    if (/[\u0600-\u06FF\u0900-\u097F]/.test(own)) continue;      // translated
    if (own.length > 70) continue;                               // body prose stays as authored
    if (/^\d+([.,]\d+)*$/.test(own)) continue;                   // bare numbers
    if (seen.has(own)) continue;
    seen.add(own);
    out.push(own);
  }
  console.log(`\n=== ${file}: ${out.length} untranslated short strings ===`);
  out.forEach(t => console.log('  ', JSON.stringify(t)));
  window.close();
}
