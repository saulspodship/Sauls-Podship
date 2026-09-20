/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build-time prerender for the theological archive permalinks, written
 * straight into dist/ so Vercel serves them from its static filesystem:
 *
 *   /theological-archive/question/<slug>   (100 tough questions)
 *   /theological-archive/category/<slug>   (11 book-by-book codices)
 *
 * These URLs are all submitted in sitemap-theological-archive.xml (which this
 * script also regenerates from the same data). Before this script existed they
 * fell through to the SPA 404 shell with HTTP 200 — i.e. 61+ soft-404s in
 * Google Search Console. Now every submitted URL serves full article HTML.
 *
 * Rendering mirrors src/pages/TheologicalQuestionPage.tsx and
 * src/pages/TheologicalCategoryPage.tsx (kept in sync intentionally).
 *
 * Usage: tsx scripts/prerender-theology.ts   (runs at the end of `npm run build`)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOUGH_QUESTIONS } from '../src/data/theology/tough';
import { ARCHIVE_CATEGORIES } from '../src/data/theology/archive';
import { DENOMINATIONS, LANGUAGES, TIER_LABEL, CATEGORY_ICON } from '../src/data/theology/types';
import type { ToughQuestion, ArchiveCategory } from '../src/data/theology/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const BASE_URL = 'https://www.saulspodship.com';
const ARCHIVE_BASE = '/theological-archive';
const today = new Date().toISOString().split('T')[0];

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const shell = (opts: {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  jsonLd: unknown[];
  crumb: string;
  body: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.description)}">
  <meta name="keywords" content="${esc(opts.keywords.join(', '))}">
  <meta name="author" content="Solat Nadeem / Saul's Podship">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${esc(opts.canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Saul's Podship">
  <meta property="og:title" content="${esc(opts.title)}">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:url" content="${esc(opts.canonical)}">
  <meta property="og:image" content="${BASE_URL}/icons/brand-logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(opts.title)}">
  <meta name="twitter:description" content="${esc(opts.description)}">
  <meta name="twitter:image" content="${BASE_URL}/icons/brand-logo.png">
  <link rel="icon" type="image/png" href="/icons/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${opts.jsonLd.map((b) => `  <script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n')}
  <style>
    body{font-family:'Inter',system-ui,sans-serif;background:#F8F4E3;color:#1D2D50;margin:0;padding:0;line-height:1.75;}
    .wrap{max-width:860px;margin:0 auto;padding:2.5rem 1.25rem 4rem;box-sizing:border-box;}
    .crumb{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(29,45,80,.6);margin-bottom:2rem;text-align:center;}
    .crumb a{color:#4A152C;text-decoration:none;font-weight:700;}
    .kicker{display:inline-block;font-size:.68rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#8B1C2E;}
    h1{font-family:'Merriweather',Georgia,serif;color:#4A152C;font-size:2.1rem;line-height:1.25;font-weight:900;margin:.6rem 0 1rem;text-align:center;}
    .lede{font-size:1.08rem;color:rgba(29,45,80,.85);text-align:center;max-width:680px;margin:0 auto 1rem;}
    .ref{text-align:center;font-size:.9rem;color:rgba(29,45,80,.65);margin-bottom:2.5rem;}
    .ref strong{color:#4A152C;}
    .scripture{background:#fff;border:1px solid rgba(74,21,44,.15);border-left:4px solid #D4AF37;border-radius:8px;padding:1.2rem 1.4rem;margin:0 0 2.2rem;}
    .scripture figcaption{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4A152C;margin-bottom:.5rem;}
    .scripture figcaption span{display:block;font-weight:400;letter-spacing:.04em;text-transform:none;color:rgba(29,45,80,.6);}
    .scripture blockquote{margin:0;font-family:'Merriweather',Georgia,serif;font-style:italic;font-size:1.02rem;color:#1D2D50;}
    h2.lbl{font-family:'Inter',sans-serif;font-size:.78rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#4A152C;border-bottom:2px solid #D4AF37;padding-bottom:.4rem;margin:2.4rem 0 1.1rem;}
    .lang{background:#fff;border:1px solid rgba(74,21,44,.12);border-radius:8px;padding:.9rem 1.1rem;margin:.6rem 0;font-size:.95rem;}
    .lang-tag{display:inline-block;font-size:.65rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:#4A152C;border-radius:999px;padding:.15rem .7rem;margin-right:.6rem;vertical-align:middle;}
    details.den{background:#fff;border:1px solid rgba(74,21,44,.14);border-radius:10px;margin:.7rem 0;overflow:hidden;}
    details.den summary{cursor:pointer;font-family:'Merriweather',Georgia,serif;font-weight:700;color:#F8F4E3;background:#4A152C;padding:.8rem 1.2rem;font-size:1rem;list-style:none;}
    details.den summary::-webkit-details-marker{display:none;}
    details.den .den-body{padding:1rem 1.2rem 1.2rem;font-size:.94rem;}
    details.den .den-body p{margin:.6rem 0;}
    blockquote.tq{border-left:3px solid #D4AF37;margin:1rem 0;padding:.4rem 0 .4rem 1rem;font-style:italic;color:rgba(29,45,80,.85);}
    blockquote.tq cite{display:block;font-style:normal;font-size:.8rem;color:#4A152C;font-weight:700;margin-top:.3rem;}
    .item{background:#fff;border:1px solid rgba(74,21,44,.12);border-radius:10px;padding:1.1rem 1.25rem;margin:.8rem 0;}
    .item h2{font-size:1.02rem;color:#4A152C;margin:0 0 .4rem;font-family:'Merriweather',Georgia,serif;}
    .item .n{color:#8B1C2E;font-weight:800;margin-right:.5rem;}
    .item .a{font-size:.95rem;margin:.3rem 0;}
    .item .r{font-size:.8rem;color:#4A152C;font-weight:700;margin:.4rem 0 0;}
    .item aside{background:rgba(212,175,55,.12);border-radius:8px;padding:.7rem .9rem;margin-top:.7rem;font-size:.86rem;}
    .item aside span{display:block;font-size:.66rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#4A152C;margin-bottom:.25rem;}
    .pager{display:flex;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin:2.6rem 0 1rem;}
    .pager a{flex:1 1 200px;text-align:center;font-size:.82rem;font-weight:700;color:#4A152C;text-decoration:none;border:1px solid rgba(74,21,44,.2);border-radius:999px;padding:.65rem 1rem;background:#fff;}
    .pager a:hover{border-color:#D4AF37;}
    .cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;margin:1.5rem 0;}
    .cats a{display:block;font-size:.85rem;font-weight:700;color:#4A152C;text-decoration:none;border:1px solid rgba(74,21,44,.15);border-radius:10px;padding:.7rem .9rem;background:#fff;}
    .cats a small{display:block;font-weight:400;color:rgba(29,45,80,.6);}
    .foot{margin-top:3rem;padding-top:1.6rem;border-top:2px solid #D4AF37;text-align:center;font-size:.82rem;color:rgba(29,45,80,.65);}
    .foot a{color:#4A152C;font-weight:700;}
  </style>
</head>
<body>
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb">${opts.crumb}</nav>
${opts.body}
    <footer class="foot">
      <p>Compiled and edited by Solat Nadeem for Saul's Podship. Scripture quoted verbatim from the Revised Version (1885/1895).</p>
      <p><a href="/">Saul's Podship</a> · <a href="${ARCHIVE_BASE}">Theological Archive</a> · <a href="/encyclopedia">51-Volume Encyclopedia</a></p>
    </footer>
  </div>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`;

function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

function scholarlyLd(title: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: title,
    description,
    author: { '@type': 'Person', name: 'Solat Nadeem' },
    publisher: { '@type': 'Organization', name: "Saul's Podship" },
    isAccessibleForFree: 'true',
  };
}

function renderQuestion(q: ToughQuestion, idx: number): string {
  const url = `${ARCHIVE_BASE}/question/${q.slug}`;
  const short = q.common.en.length > 150 ? `${q.common.en.slice(0, 147)}…` : q.common.en;
  const title = `${q.q} | Tough Bible Questions | Saul's Podship`;
  const description = `${q.q} — ${short} Answered from Catholic, Orthodox, Protestant, Anglican and Pentecostal traditions, in English, Urdu, Hindi and Arabic.`;
  const prev = idx > 0 ? TOUGH_QUESTIONS[idx - 1] : null;
  const next = idx < TOUGH_QUESTIONS.length - 1 ? TOUGH_QUESTIONS[idx + 1] : null;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: q.common.en },
        suggestedAnswer: q.views.map((v) => ({
          '@type': 'Answer',
          text: `${v.summary}${v.detail ? ` ${v.detail.replace(/<[^>]+>/g, '')}` : ''}`,
        })),
      },
    ],
  };

  const langs = LANGUAGES.map(
    (l) =>
      `<p class="lang" dir="${l.dir}" lang="${l.key}"><span class="lang-tag">${esc(l.label)}</span>${esc(q.common[l.key])}</p>`,
  ).join('\n    ');

  const dens = q.views
    .map(
      (v) => `<details class="den" open>
      <summary>${esc(DENOMINATIONS[v.key])}</summary>
      <div class="den-body">
        <p>${esc(v.summary)}</p>
        ${v.detail ? `<p>${v.detail}</p>` : ''}
        ${v.quote ? `<blockquote class="tq">${esc(v.quote.text)}<cite>${esc(v.quote.cite)}</cite></blockquote>` : ''}
      </div>
    </details>`,
    )
    .join('\n    ');

  return shell({
    title,
    description,
    canonical: `${BASE_URL}${url}`,
    keywords: [q.q.toLowerCase(), 'tough bible questions', 'christian theology', 'apologetics', q.ref],
    jsonLd: [
      faqLd,
      scholarlyLd(title, description),
      breadcrumbLd([
        { name: 'Home', url: '/' },
        { name: 'Theological Archive', url: ARCHIVE_BASE },
        { name: q.q, url },
      ]),
    ],
    crumb: `<a href="/">Home</a> &nbsp;/&nbsp; <a href="${ARCHIVE_BASE}">Theological Archive</a> &nbsp;/&nbsp; <span>${esc(q.q)}</span>`,
    body: `    <header style="text-align:center;">
      <span class="kicker">Tough Question № ${q.id} · ${esc(TIER_LABEL[q.tier])}</span>
      <h1>${esc(q.q)}</h1>
      <p class="lede">${esc(q.common.en)}</p>
      <p class="ref">Key text: <strong>${esc(q.ref)}</strong>${q.region ? ` · Most asked in ${esc(q.region)}` : ''}</p>
    </header>
    <article itemscope itemtype="https://schema.org/Question">
      <meta itemprop="name" content="${esc(q.q)}">
      <figure class="scripture">
        <figcaption>${esc(q.ref)}<span>Revised Version · 1885/1895</span></figcaption>
        <blockquote>${esc(q.rv)}</blockquote>
      </figure>
      <h2 class="lbl">Common Ground — in four languages</h2>
      ${langs}
      <h2 class="lbl">In Their Own Traditions</h2>
      ${dens}
    </article>
    <nav class="pager" aria-label="More tough questions">
      ${prev ? `<a href="${ARCHIVE_BASE}/question/${prev.slug}">← ${esc(prev.q)}</a>` : '<span></span>'}
      <a href="${ARCHIVE_BASE}">All 100 questions</a>
      ${next ? `<a href="${ARCHIVE_BASE}/question/${next.slug}">${esc(next.q)} →</a>` : '<span></span>'}
    </nav>`,
  });
}

function renderCategory(c: ArchiveCategory): string {
  const url = `${ARCHIVE_BASE}/category/${c.slug}`;
  const title = `${c.name} — Bible Study Questions & Answers | Saul's Podship`;
  const description = `${c.items.length} book-by-book Bible study questions on ${c.name} with concise answers and scripture references, from the Saul's Podship theological archive.`;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.items.slice(0, 100).map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  const items = c.items
    .map(
      (it, i) => `<article class="item" id="a-${esc(it.slug)}" itemscope itemtype="https://schema.org/Question">
      <h2><span class="n">${String(i + 1).padStart(3, '0')}</span><span itemprop="name">${esc(it.q)}</span></h2>
      <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
        <p class="a" itemprop="text">${esc(it.a)}</p>
      </div>
      <p class="r">${esc(it.ref)}</p>
      ${it.note ? `<aside><span>Deeper Theology</span>${esc(it.note)}</aside>` : ''}
    </article>`,
    )
    .join('\n    ');

  const others = ARCHIVE_CATEGORIES.filter((x) => x.slug !== c.slug)
    .map((x) => `<a href="${ARCHIVE_BASE}/category/${x.slug}">${esc(x.name)}<small>${x.items.length} entries</small></a>`)
    .join('\n      ');

  return shell({
    title,
    description,
    canonical: `${BASE_URL}${url}`,
    keywords: [c.name.toLowerCase(), 'bible study questions', 'bible answers', 'scripture study'],
    jsonLd: [
      faqLd,
      scholarlyLd(title, description),
      breadcrumbLd([
        { name: 'Home', url: '/' },
        { name: 'Theological Archive', url: ARCHIVE_BASE },
        { name: c.name, url },
      ]),
    ],
    crumb: `<a href="/">Home</a> &nbsp;/&nbsp; <a href="${ARCHIVE_BASE}">Theological Archive</a> &nbsp;/&nbsp; <span>${esc(c.name)}</span>`,
    body: `    <header style="text-align:center;">
      <span class="kicker">Book-by-Book Scriptorium · Codex ${esc(CATEGORY_ICON[c.name] ?? '')}</span>
      <h1>${esc(c.name)}</h1>
      <p class="lede">${c.items.length} study questions with concise answers and scripture references — part of the 1,000-entry book-by-book archive.</p>
    </header>
    <section aria-label="${esc(c.name)}">
    ${items}
    </section>
    <nav class="pager" aria-label="Archive navigation">
      <a href="${ARCHIVE_BASE}">← Back to the full archive</a>
    </nav>
    <h2 class="lbl">All codices</h2>
    <div class="cats">
      ${others}
    </div>`,
  });
}

// ---- write pages ----
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

let qCount = 0;
TOUGH_QUESTIONS.forEach((q, i) => {
  const dir = path.join(distDir, 'theological-archive', 'question', q.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderQuestion(q, i), 'utf8');
  qCount++;
});

let cCount = 0;
for (const c of ARCHIVE_CATEGORIES) {
  const dir = path.join(distDir, 'theological-archive', 'category', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderCategory(c), 'utf8');
  cCount++;
}

console.log(`[PRERENDER-THEOLOGY] Wrote ${qCount} question pages + ${cCount} category pages.`);

if (qCount !== 100) {
  console.error(`[PRERENDER-THEOLOGY] Expected 100 tough questions, found ${qCount} — aborting.`);
  process.exit(1);
}
if (cCount !== 11) {
  console.error(`[PRERENDER-THEOLOGY] Expected 11 archive codices, found ${cCount} — aborting.`);
  process.exit(1);
}

// ---- regenerate sitemap-theological-archive.xml from the same data ----
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const smUrl = (loc: string, freq: string, pri: string) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
sm += smUrl(`${BASE_URL}${ARCHIVE_BASE}`, 'weekly', '0.9');
for (const q of TOUGH_QUESTIONS) {
  sm += smUrl(`${BASE_URL}${ARCHIVE_BASE}/question/${q.slug}`, 'monthly', q.tier === 1 ? '0.8' : '0.7');
}
for (const c of ARCHIVE_CATEGORIES) {
  sm += smUrl(`${BASE_URL}${ARCHIVE_BASE}/category/${c.slug}`, 'monthly', '0.75');
}
sm += `</urlset>\n`;

fs.writeFileSync(path.join(rootDir, 'public', 'sitemap-theological-archive.xml'), sm, 'utf8');
fs.writeFileSync(path.join(distDir, 'sitemap-theological-archive.xml'), sm, 'utf8');
console.log(`[PRERENDER-THEOLOGY] Regenerated sitemap-theological-archive.xml (${1 + qCount + cCount} URLs).`);
