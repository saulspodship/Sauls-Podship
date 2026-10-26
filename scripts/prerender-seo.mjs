/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build-time SEO prerender for the client-rendered (hash-routed) pages.
 *
 * Why this exists (Ahrefs Site Audit, 4 Oct 2026):
 *  - "Non-canonical page in sitemap" (64): sitemap URLs without their own static
 *    file were answered by the SPA shell whose <link rel="canonical"> points at
 *    "/". This script writes a real dist/<path>/index.html with its own
 *    title / description / canonical for every sitemap URL that lacked one.
 *  - "Page has no outgoing links" (71) and "Orphan page" (73): the SPA shell has
 *    an empty <div id="root"> and the React nav uses #/ links, so crawlers that
 *    read raw HTML saw zero <a> links. Every shell now ships a crawlable block
 *    of real path links (React's createRoot replaces it on mount, so visitors
 *    with JS never see it twice).
 *
 * Usage: node scripts/prerender-seo.mjs   (runs after postbuild + prerender-music)
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { build as esbuild } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const BASE_URL = 'https://www.saulspodship.com';
const EMPTY_ROOT = '<div id="root"></div>';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, '') + '…';
};

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('[PRERENDER-SEO] dist/index.html missing — run vite build first');
  process.exit(1);
}
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

/* ---- load the theology data (TypeScript) without a TS runtime ---- */
const bundled = await esbuild({
  stdin: {
    contents:
      "export { TOUGH_QUESTIONS } from './src/data/theology/tough.ts';\n" +
      "export { ARCHIVE_CATEGORIES } from './src/data/theology/archive.ts';\n" +
      "export { PODCAST, EPISODES } from './src/data/episodes.ts';\n",
    resolveDir: rootDir,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const tmpFile = path.join(os.tmpdir(), `sp-theology-${process.pid}.mjs`);
fs.writeFileSync(tmpFile, bundled.outputFiles[0].text);
const { TOUGH_QUESTIONS, ARCHIVE_CATEGORIES, PODCAST, EPISODES } = await import(
  pathToFileURL(tmpFile).href,
);
fs.unlinkSync(tmpFile);

const volumesPath = path.join(rootDir, 'src/data/volumes/volumesData.json');
const volumes = fs.existsSync(volumesPath) ? JSON.parse(fs.readFileSync(volumesPath, 'utf8')) : [];

/* ---- shared crawlable navigation ---- */
const NAV_LINKS = [
  ['/', 'Home'],
  ['/encyclopedia', '51-Volume Encyclopedia'],
  ['/theological-archive', 'Theological Archive — Tough Bible Questions'],
  ['/comparative-apologetics', 'Comparative Apologetics Codex'],
  ['/prophecy-map', 'Biblical Prophecy Map'],
  ['/cross-references', 'Interlinked Bible'],
  ['/kings-of-the-bible', 'Kings of the Bible'],
  ['/biblical-maps', 'Biblical Maps Atlas'],
  ['/world-religion-map', 'World Faith & Population Map'],
  ['/podcast', 'Podcast'],
  ['/videos/', 'Videos'],
  ['/music', 'Sacred Music'],
  ['/music/punjabi-zaboor', 'Punjabi Zaboor'],
  ['/music/pakistani-singers-archive', 'Pakistani Singers Archive'],
  ['/studio', 'Scriptorium Studio'],
  ['/about', 'About'],
  ['/scholarly-standards', 'Scholarly Standards'],
  ['/support', 'Support'],
  ['/faq', 'FAQ'],
  ['/contact', 'Contact'],
  ['/sitemap', 'Sitemap'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/disclaimer', 'Disclaimer'],
];
const list = (items) =>
  `<ul>${items.map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join('')}</ul>`;
const siteNav = () => `<nav aria-label="Saul's Podship site pages"><h2>Saul's Podship</h2>${list(NAV_LINKS)}</nav>`;
const wrap = (inner) =>
  `<div id="root"><div style="max-width:60rem;margin:0 auto;padding:1.25rem;font-family:Georgia,serif;color:#4A152C;background:#F8F4E3;line-height:1.55">${inner}</div></div>`;

/* ---- rewrite <head> for a prerendered page ---- */
function withHead(html, { title, description, canonical }) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${esc(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${canonical}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${esc(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${esc(description)}$2`)
    .replace(/(<meta\s+property="twitter:url"\s+content=")[^"]*(")/i, `$1${canonical}$2`)
    .replace(/(<meta\s+property="twitter:title"\s+content=")[^"]*(")/i, `$1${esc(title)}$2`)
    .replace(/(<meta\s+property="twitter:description"\s+content=")[^"]*(")/i, `$1${esc(description)}$2`);
  return out;
}

/* ---- which URLs does the theological-archive sitemap promise? ---- */
const taSitemap = fs.readFileSync(path.join(rootDir, 'public/sitemap-theological-archive.xml'), 'utf8');
const taPaths = [...taSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE_URL, ''));
const qSlugs = taPaths.filter((p) => p.startsWith('/theological-archive/question/')).map((p) => p.split('/').pop());
const cSlugs = taPaths.filter((p) => p.startsWith('/theological-archive/category/')).map((p) => p.split('/').pop());

const pages = new Map(); // route path -> { head, body }

for (const slug of qSlugs) {
  const q = TOUGH_QUESTIONS.find((x) => x.slug === slug);
  if (!q) {
    console.warn(`[PRERENDER-SEO] sitemap question "${slug}" not found in data — skipped`);
    continue;
  }
  const p = `/theological-archive/question/${slug}`;
  pages.set(p, {
    head: {
      title: `${q.q} | Saul's Podship`,
      description: clip(q.common.en, 155),
      canonical: BASE_URL + p,
    },
    body: wrap(
      `<main><h1>${esc(q.q)}</h1><p>${esc(q.common.en)}</p>` +
        (q.ref ? `<p><strong>Scripture:</strong> ${esc(q.ref)}</p>` : '') +
        (q.rv ? `<blockquote>${esc(q.rv)}</blockquote>` : '') +
        `<p><a href="/theological-archive">All tough Bible questions</a></p></main>` +
        siteNav(),
    ),
  });
}

for (const slug of cSlugs) {
  const c = ARCHIVE_CATEGORIES.find((x) => x.slug === slug);
  if (!c) {
    console.warn(`[PRERENDER-SEO] sitemap category "${slug}" not found in data — skipped`);
    continue;
  }
  const p = `/theological-archive/category/${slug}`;
  pages.set(p, {
    head: {
      title: `${c.name} — Book-by-Book Bible Study Archive | Saul's Podship`,
      description: `${c.items.length} study questions and answers for ${c.name}, quoted from the Revised Version (1885/1895).`,
      canonical: BASE_URL + p,
    },
    body: wrap(
      `<main><h1>${esc(c.name)}</h1><p>${c.items.length} study questions and answers, quoted from the Revised Version (1885/1895).</p>` +
        `<ol>${c.items.map((it) => `<li><h2>${esc(it.q)}</h2><p>${esc(it.a)}</p>${it.ref ? `<p><em>${esc(it.ref)}</em></p>` : ''}</li>`).join('')}</ol>` +
        `<p><a href="/theological-archive">Back to the Theological Archive</a></p></main>` +
        siteNav(),
    ),
  });
}

// Hub: link to every promised deep page so none of them is an orphan.
const archiveLinks = [
  ...cSlugs.map((s) => {
    const c = ARCHIVE_CATEGORIES.find((x) => x.slug === s);
    return c ? [`/theological-archive/category/${s}`, c.name] : null;
  }),
  ...qSlugs.map((s) => {
    const q = TOUGH_QUESTIONS.find((x) => x.slug === s);
    return q ? [`/theological-archive/question/${s}`, q.q] : null;
  }),
].filter(Boolean);
pages.set('/theological-archive', {
  head: null, // keep the head postbuild already wrote
  body: wrap(
    `<main><h1>The Tough Questions Archive</h1>` +
      `<p>Answers to ${TOUGH_QUESTIONS.length} of the hardest questions in Christian theology, in English, Urdu, Hindi and Arabic, across five traditions, plus a book-by-book archive of study questions.</p>` +
      list(archiveLinks) +
      `</main>` +
      siteNav(),
  ),
});

// Encyclopedia hub: link every volume.
pages.set('/encyclopedia', {
  head: null,
  body: wrap(
    `<main><h1>The 51-Volume Theological Encyclopedia</h1>` +
      list(volumes.map((v) => [`/encyclopedia/${v.slug}`, `Volume ${v.number}: ${v.title}`])) +
      `</main>` +
      siteNav(),
  ),
});

// Pages that had no static file at all.
pages.set('/comparative-apologetics', {
  head: {
    title: "400 Comparative Apologetics Questions — Islam, Judaism, Hinduism & Sikhism | Saul's Podship",
    description:
      "A Christian's guide to comparative apologetics: 100 critical questions each on Islam, Judaism, Hinduism and Sikhism, with primary sources and a Christian response.",
    canonical: `${BASE_URL}/comparative-apologetics`,
  },
  body: wrap(
    `<main><h1>Comparative Apologetics Codex</h1><p>400 critical dialogue questions across Islam, Judaism, Hinduism and Sikhism, with primary sources, fair representation and a Christian response.</p></main>` +
      siteNav(),
  ),
});
pages.set('/cross-references', {
  head: {
    title: "The Interlinked Bible — 344,799 Threads | Saul's Podship",
    description:
      'Every cross-reference in Scripture woven into one interactive horseshoe: 66 books, 1,189 chapters and 190,758 chapter-to-chapter links, with KJV drill-down.',
    canonical: `${BASE_URL}/cross-references`,
  },
  body: wrap(
    `<main><h1>The Interlinked Bible</h1><p>Every cross-reference in Scripture woven into one interactive horseshoe: 66 books, 1,189 chapters and 190,758 chapter-to-chapter links.</p></main>` +
      siteNav(),
  ),
});

/* ---- Podcast: hub + one crawlable page per published episode ---- */
// Mirrors https://rss.com/podcasts/sauls-podship — the audio itself stays on RSS.com.
pages.set('/podcast', {
  head: {
    title: `${PODCAST.title} | Saul's Podship`,
    description: clip(PODCAST.description, 155),
    canonical: `${BASE_URL}/podcast`,
  },
  body: wrap(
    `<main><h1>${esc(PODCAST.title)}</h1>` +
      `<p><em>${esc(PODCAST.titleUrdu)} — ${esc(PODCAST.tagline)}</em></p>` +
      `<p>${esc(PODCAST.description)}</p>` +
      `<h2>All ${EPISODES.length} episodes</h2>` +
      `<ol>${[...EPISODES]
        .reverse()
        .map(
          (e) =>
            `<li><a href="/podcast/${e.slug}">Episode ${e.number}: ${esc(e.title)}</a>` +
            ` — ${esc(e.titleEnglish)} (${esc(e.duration)})</li>`,
        )
        .join('')}</ol>` +
      `<p>RSS feed: <a href="${PODCAST.feedUrl}">${PODCAST.feedUrl}</a></p>` +
      `<p><a href="${PODCAST.showUrl}">Listen on RSS.com</a></p></main>` +
      siteNav(),
  ),
});

for (const ep of EPISODES) {
  pages.set(`/podcast/${ep.slug}`, {
    head: {
      title: `${ep.titleEnglish} | ${ep.title} | Saul's Podship Podcast`,
      description: clip(ep.description, 155),
      canonical: `${BASE_URL}/podcast/${ep.slug}`,
    },
    body: wrap(
      `<main><h1>${esc(ep.title)}</h1>` +
        `<p><em>${esc(ep.titleRoman)}</em> — ${esc(ep.titleEnglish)}</p>` +
        `<p>Season 1 · Episode ${ep.number} · ${esc(ep.duration)} · ${esc(ep.publishDate)}</p>` +
        `<p>${esc(ep.description)}</p>` +
        `<h2>Key Scriptures</h2><p>${ep.scriptureReferences.map(esc).join(' · ')}</p>` +
        `<h2>Show notes (Urdu)</h2><div lang="ur" dir="rtl">${esc(ep.notesUrdu).replace(/\n/g, '<br />')}</div>` +
        `<p><a href="${ep.rssUrl}">Listen to this episode on RSS.com</a></p>` +
        `<p><a href="/podcast">All episodes</a> · <a href="${PODCAST.feedUrl}">RSS feed</a></p></main>` +
        siteNav(),
    ),
  });
}

/* ---- 1. write pages that have their own head ---- */
let created = 0;
for (const [route, page] of pages) {
  if (!page.head) continue;
  const file = path.join(distDir, route.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, withHead(template, page.head).replace(EMPTY_ROOT, page.body), 'utf8');
  created++;
}

/* ---- 2. give every remaining SPA shell a crawlable body ---- */
let injected = 0;
const skipDirs = new Set(['assets', 'images', 'icons', 'cross-references-data', 'videos']);
function walk(dir, rel) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (rel === '' && skipDirs.has(entry.name)) continue;
      walk(full, `${rel}/${entry.name}`);
    } else if (entry.name === 'index.html') {
      const html = fs.readFileSync(full, 'utf8');
      if (!html.includes(EMPTY_ROOT)) continue; // already filled, or a standalone page
      const route = rel === '' ? '/' : rel;
      const page = pages.get(route);
      const body = page ? page.body : wrap(`<main><h1>Saul's Podship</h1></main>` + siteNav());
      fs.writeFileSync(full, html.replace(EMPTY_ROOT, body), 'utf8');
      injected++;
    }
  }
}
walk(distDir, '');

console.log(`[PRERENDER-SEO] wrote ${created} prerendered pages; added crawlable links to ${injected} SPA shells.`);
