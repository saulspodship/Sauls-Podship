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

/* ---- Article structured data for every prerendered content page ----
 * Ahrefs Site Audit (2 Nov 2026), "Article page missing schema" (101 URLs):
 * Ahrefs classifies these deep pages as articles but the only JSON-LD left in
 * the served HTML was the site-wide WebSite + Organization graph from
 * index.html — postbuild's per-volume Article block was being overwritten by
 * this script. Each content page now carries its own Article node with the
 * headline, description, canonical URL, image, dates, author and publisher. */
const CONTENT_CREATED = '2026-09-08';
const CONTENT_UPDATED = '2026-11-02';
const DEFAULT_ARTICLE_IMAGE = `${BASE_URL}/images/hero-second-coming.jpg`;
const AUTHOR = { '@type': 'Person', name: 'Solat Nadeem' };
const PUBLISHER = {
  '@type': 'Organization',
  name: "Saul's Podship",
  url: `${BASE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${BASE_URL}/icons/brand-logo.png` },
};
const absolute = (src) => (src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`);
const articleSchema = ({ headline, description, url, image, datePublished, dateModified, section }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: clip(headline, 110),
  description: clip(description, 300),
  url,
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  image: [image ? absolute(image) : DEFAULT_ARTICLE_IMAGE],
  datePublished: datePublished || CONTENT_CREATED,
  dateModified: dateModified || CONTENT_UPDATED,
  author: AUTHOR,
  publisher: PUBLISHER,
  isPartOf: { '@type': 'WebSite', name: "Saul's Podship", url: `${BASE_URL}/` },
  inLanguage: 'en',
  ...(section ? { articleSection: section } : {}),
});

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
      "export { PODCAST, EPISODES } from './src/data/episodes.ts';\n" +
      "export { VIDEO_EPISODES, VIDEO_CHANNEL } from './src/data/videos.ts';\n" +
      "export { ABOUT_META, ABOUT_DIRECTORY_INTRO, PODSHIP_APPS, aboutPageSchema } from './src/data/about.ts';\n" +
      "export { FAQ_DATA, FAQ_PAGE_ITEMS, FAQ_PAGE_META, faqSchema } from './src/data/faq.ts';\n",
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
const {
  TOUGH_QUESTIONS, ARCHIVE_CATEGORIES, PODCAST, EPISODES, VIDEO_EPISODES, VIDEO_CHANNEL,
  ABOUT_META, ABOUT_DIRECTORY_INTRO, PODSHIP_APPS, aboutPageSchema,
  FAQ_DATA, FAQ_PAGE_ITEMS, FAQ_PAGE_META, faqSchema,
} = await import(pathToFileURL(tmpFile).href);
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
function withHead(html, { title, description, canonical, keywords }) {
  // Keep snippets concise and prevent the same long titles/descriptions from
  // being emitted on dozens of generated pages. Clip at a word boundary.
  const pageTitle = clip(title, 60);
  const pageDescription = clip(description, 155);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(pageTitle)}</title>`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${esc(canonical)}" />`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*(")/i, `$1${esc(pageTitle)}$2`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${esc(pageDescription)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${esc(canonical)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${esc(pageTitle)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${esc(pageDescription)}$2`)
    .replace(/(<meta\s+property="twitter:url"\s+content=")[^"]*(")/i, `$1${esc(canonical)}$2`)
    .replace(/(<meta\s+property="twitter:title"\s+content=")[^"]*(")/i, `$1${esc(pageTitle)}$2`)
    .replace(/(<meta\s+property="twitter:description"\s+content=")[^"]*(")/i, `$1${esc(pageDescription)}$2`);
  if (keywords) {
    out = out.replace(/(<meta\s+name="keywords"\s+content=")[^"]*(")/i, `$1${esc(keywords.join(', '))}$2`);
  }
  return out;
}

/* ---- which URLs does the theological-archive sitemap promise? ---- */
const taSitemap = fs.readFileSync(path.join(rootDir, 'public/sitemap-theological-archive.xml'), 'utf8');
const taPaths = [...taSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE_URL, ''));
const qSlugs = taPaths.filter((p) => p.startsWith('/theological-archive/question/')).map((p) => p.split('/').pop());
const cSlugs = taPaths.filter((p) => p.startsWith('/theological-archive/category/')).map((p) => p.split('/').pop());

const pages = new Map(); // route path -> { head, body }

// The HTML, FAQ schema and React UI all use the same app and FAQ data. Keep
// these scripts inside #root so React replaces the static copies on hydration.
const jsonLd = (id, data) =>
  `<script id="${esc(id)}" type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const faqContent = (items) =>
  items.map(({ question, answer }) => `<section><h3>${esc(question)}</h3><p>${esc(answer)}</p></section>`).join('');

pages.set('/about', {
  head: ABOUT_META,
  body: wrap(
    `<main><h1>About Saul's Podship Scriptorium</h1>` +
      `<p>Dedicated to scholarly biblical exegesis, historic Christian theology, and the preservation of indigenous South Asian hymnody.</p>` +
      `<h2>The Scriptorium Vision</h2><p>Saul's Podship is an open-access digital scriptorium, offering 51 volumes of biblical study, historic theology and original-language research.</p>` +
      `<h2>Explore the Podship family</h2><p>${esc(ABOUT_DIRECTORY_INTRO)}</p>` +
      `<ul>${PODSHIP_APPS.map((app) =>
        `<li><h3><a href="${esc(app.url)}">${esc(app.name)}</a></h3>` +
        `<img src="${esc(app.logo)}" alt="${esc(app.name)} logo" width="72" height="72" />` +
        `<p>${esc(app.description)}</p><p><a href="${esc(app.url)}">${esc(new URL(app.url).hostname)}</a></p></li>`,
      ).join('')}</ul>` +
      `<h2>Explore the Encyclopedia</h2><p><a href="/encyclopedia">Browse the 51-volume catalog</a></p>` +
      `<h2>Frequently Asked Questions</h2><p>${esc(FAQ_DATA['/about'].summary)}</p>` +
      faqContent(FAQ_DATA['/about'].items) +
      jsonLd('sp-about-apps-jsonld', aboutPageSchema()) +
      jsonLd('sp-route-faq-jsonld', faqSchema(FAQ_DATA['/about'].items)) +
      `</main>` + siteNav(),
  ),
});

pages.set('/faq', {
  head: FAQ_PAGE_META,
  body: wrap(
    `<main><h1>Frequently Asked Questions</h1>` +
      `<p>Answers about our theological library, Punjabi Zaboor, free resources and family of Bible study apps.</p>` +
      faqContent(FAQ_PAGE_ITEMS) +
      `<p><a href="/about">Explore the Podship family</a></p>` +
      jsonLd('sp-faq-page-jsonld', faqSchema(FAQ_PAGE_ITEMS)) +
      `</main>` + siteNav(),
  ),
});

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
    article: {
      headline: q.q,
      description: q.common.en,
      section: 'Theological Archive — Tough Bible Questions',
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
      description: `Browse ${c.items.length} study questions and answers for ${c.name}, with Revised Version quotations and book-by-book biblical context across Scripture.`,
      canonical: BASE_URL + p,
    },
    article: {
      headline: `${c.name} — Book-by-Book Bible Study Archive`,
      description: `${c.items.length} study questions and answers for ${c.name}, quoted from the Revised Version (1885/1895).`,
      section: 'Theological Archive — Book-by-Book Study',
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
  head: {
    title: "100 Tough Bible Questions & 1,000 Answers | Saul's Podship",
    description: 'Explore 100 tough theology questions and 1,000 book-by-book Bible study answers in English, Urdu, Hindi and Arabic across five Christian traditions.',
    canonical: `${BASE_URL}/theological-archive`,
  },
  article: {
    headline: 'The Tough Questions Archive',
    description: `Answers to ${TOUGH_QUESTIONS.length} of the hardest questions in Christian theology, in English, Urdu, Hindi and Arabic, across five traditions, plus a book-by-book archive of study questions.`,
    section: 'Theological Archive',
  },
  body: wrap(
    `<main><h1>The Tough Questions Archive</h1>` +
      `<p>Answers to ${TOUGH_QUESTIONS.length} of the hardest questions in Christian theology, in English, Urdu, Hindi and Arabic, across five traditions, plus a book-by-book archive of study questions.</p>` +
      list(archiveLinks) +
      `</main>` +
      siteNav(),
  ),
});

// Encyclopedia hub: link every volume, plus the Volume 11 atlas supplement.
// Ahrefs Site Audit (2 Nov 2026) flagged /encyclopedia/biblical-maps-atlas as an
// orphan: it was in the sitemap but no crawlable page linked to it.
pages.set('/encyclopedia', {
  head: {
    title: "51-Volume Theological Encyclopedia | Saul's Podship",
    description: 'Browse 51 scholarly Bible study volumes covering Scripture, theology, Christian history, apologetics, biblical maps and South Asian Christian heritage.',
    canonical: `${BASE_URL}/encyclopedia`,
  },
  article: {
    headline: 'The 51-Volume Theological Encyclopedia',
    description: 'Browse 51 scholarly Bible study volumes covering Scripture, theology, Christian history, apologetics, biblical maps and South Asian Christian heritage.',
    section: 'Encyclopedia',
  },
  body: wrap(
    `<main><h1>The 51-Volume Theological Encyclopedia</h1>` +
      list(volumes.map((v) => [`/encyclopedia/${v.slug}`, `Volume ${v.number}: ${v.title}`])) +
      `<h2>Volume 11 supplement</h2>` +
      `<ul><li><a href="/encyclopedia/biblical-maps-atlas">Biblical Maps — Interactive Journey Atlas</a> — eight animated study maps with the world faith map at the foot.</li></ul>` +
      `<h2>Volume 4 supplement</h2>` +
      `<ul><li><a href="/watchers-atlas">Watchers Atlas — Watchers of Enoch &amp; the World's Gods</a> — 220 sourced image profiles, comparative tables and a speculative-claims evidence check.</li></ul>` +
      `</main>` +
      siteNav(),
  ),
});

// Pages that had no static file at all.
pages.set('/comparative-apologetics', {
  head: {
    title: "400 Comparative Apologetics Questions | Saul's Podship",
    description:
      "A Christian's guide to comparative apologetics: 100 critical questions each on Islam, Judaism, Hinduism and Sikhism, with primary sources and a Christian response.",
    canonical: `${BASE_URL}/comparative-apologetics`,
  },
  article: {
    headline: 'Comparative Apologetics Codex',
    description:
      '400 critical dialogue questions across Islam, Judaism, Hinduism and Sikhism, with primary sources, fair representation and a Christian response.',
    section: 'Comparative Apologetics',
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
      // Ahrefs Site Audit (2 Nov 2026) reported five orphaned /podcast/<slug>
      // pages: those are the English video masterclasses, which had a rendered
      // page but no link from the hub. They are listed here now.
      `<h2>Video masterclasses (${VIDEO_EPISODES.length})</h2>` +
      `<ol>${VIDEO_EPISODES.map(
        (v) => `<li><a href="/podcast/${v.slug}">${esc(v.title)}</a> — ${esc(v.subtitle)} (${esc(v.duration)})</li>`,
      ).join('')}</ol>` +
      `<p><a href="/videos/">All video masterclasses</a></p>` +
      `<p>RSS feed: <a href="${PODCAST.feedUrl}">${PODCAST.feedUrl}</a></p>` +
      `<p><a href="${PODCAST.showUrl}">Listen on RSS.com</a></p></main>` +
      siteNav(),
  ),
});

for (const ep of EPISODES) {
  pages.set(`/podcast/${ep.slug}`, {
    head: {
      title: clip(`${ep.titleEnglish} | Saul's Podship Podcast`, 70),
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
        `<p><a href="/podcast">All episodes</a> · <a href="${PODCAST.feedUrl}">RSS feed</a></p>` +
        jsonLd('sp-podcast-episode-jsonld', {
          '@context': 'https://schema.org',
          '@type': 'PodcastEpisode',
          name: ep.title,
          description: clip(ep.description, 300),
          url: `${BASE_URL}/podcast/${ep.slug}`,
          datePublished: ep.publishDate,
          episodeNumber: ep.number,
          timeRequired: `PT${ep.duration.split(':')[0]}M${ep.duration.split(':')[1]}S`,
          partOfSeries: { '@type': 'PodcastSeries', name: PODCAST.title, url: `${BASE_URL}/podcast` },
        }) + `</main>` +
        siteNav(),
    ),
  });
}

/* ---- YouTube Podcasts: the English video masterclasses ---- */
// Old /podcast/<slug> URLs are kept alive by the SPA, and they keep a crawlable
// static page too, clearly labelled as video rather than audio.
pages.set('/podcast', pages.get('/podcast')); // touch nothing, hub already set

for (const v of VIDEO_EPISODES) {
  pages.set(`/podcast/${v.slug}`, {
    head: {
      title: `${v.title} | ${VIDEO_CHANNEL.label} | Saul's Podship`,
      description: clip(v.description, 155),
      canonical: `${BASE_URL}/podcast/${v.slug}`,
    },
    body: wrap(
      `<main><h1>${esc(v.title)}</h1>` +
        `<p><strong>${esc(VIDEO_CHANNEL.label)}</strong> — ${esc(v.subtitle)}</p>` +
        `<p>${esc(v.duration)} · ${esc(v.publishDate)} · English video masterclass</p>` +
        `<p>${esc(v.description)}</p>` +
        `<h2>Key Scriptures</h2><p>${v.scriptureReferences.map(esc).join(' · ')}</p>` +
        (v.youtubeUrl
          ? `<p><a href="${v.youtubeUrl}">Watch on YouTube</a></p>`
          : `<p>Not yet uploaded to YouTube.</p>`) +
        `<p>The Urdu audio podcast is published separately: ` +
        `<a href="/podcast">all ${EPISODES.length} episodes</a> · ` +
        `<a href="${PODCAST.feedUrl}">RSS feed</a></p></main>` +
        siteNav(),
    ),
  });
}


/* ---- Static routes that previously shipped the generic home shell ----
 * Ahrefs flagged these as duplicate title / duplicate description / thin
 * content: they all received the home <title> and a ~58-word nav-only body.
 * Each now gets its own head and a real, crawlable summary of the page. */
const para = (...t) => t.map((x) => `<p>${esc(x)}</p>`).join('');
// `article` in the head config (headline / section / image) makes the writer
// emit an Article JSON-LD node for the page — see articleSchema() above.
const simple = (route, head, h1, inner) => {
  const { article, ...meta } = head;
  pages.set(route, {
    head: { ...meta, canonical: `${BASE_URL}${route}` },
    article: article && { headline: h1, ...article },
    body: wrap(`<main><h1>${esc(h1)}</h1>${inner}</main>` + siteNav()),
  });
};

simple('/contact',
  { title: "Contact the Scriptorium | Saul's Podship", description: 'Send academic feedback, research collaboration requests, theological questions or corrections to the Saul\u2019s Podship editorial team.' },
  'Contact Saul\u2019s Podship Scriptorium',
  para(
    'We welcome academic feedback, research collaborations, theological inquiries and corrections. Saul\u2019s Podship is an open-access digital scriptorium offering a 51-volume theological encyclopedia, a Tough Bible Questions archive, a comparative apologetics codex and a Pakistani Christian gospel music archive.',
    'Use the correspondence form to report an error in a volume, to suggest a primary source or citation, to propose a research partnership, or to ask a question about the material. Please include the page address and, where relevant, the passage or citation you are writing about so that our editorial team can review it quickly.',
    'Privacy and data-removal requests are also handled through this page.',
  ));

simple('/disclaimer',
  { title: "Theological Disclaimer & Editorial Position | Saul's Podship", description: 'How Saul\u2019s Podship approaches interpretation: historic creedal Christianity, careful exegesis of contested texts, and verified external links.' },
  'Disclaimer',
  para(
    'Saul\u2019s Podship strives to present rigorous, historically informed biblical scholarship. Our editorial board works within classical historic Christian orthodoxy, the creedal Christianity confessed by the early ecumenical councils.',
    'Interpretations of complex prophetic texts, millenarian viewpoints and ceremonial typology are presented as careful exegesis intended to stimulate study, not as binding dogma. Readers are encouraged to test every claim against Scripture and against the primary sources cited in each volume.',
    'External links to companion articles, research archives and YouTube masterclasses are provided for educational enrichment and are checked for accuracy. We are not responsible for the content of third-party sites.',
  ));

simple('/scholarly-standards',
  { title: "Scholarly Standards & Exegetical Method | Saul's Podship", description: 'The grammatical-historical method, original-language grounding, creedal framework and verified-link policy behind all 51 volumes of the Scriptorium.', article: { section: 'About the Scriptorium', description: 'Our academic criteria for biblical exegesis, primary source attribution and theological objectivity across all 51 volumes.' } },
  'Scholarly Standards',
  `<p>${esc('Our academic criteria for biblical exegesis, primary source attribution and theological objectivity.')}</p>` +
  `<h2>Core exegetical principles</h2>` + para(
    'We interpret every passage in light of its original historical context, grammatical structure and authorial intent. We reject speculative eisegesis and allegorization that disconnects Scripture from its covenantal setting.') +
  `<h2>Original-language grounding</h2>` + para(
    'Doctrinal definitions across the 51 volumes reference the Hebrew (Masoretic Text), Aramaic (Targums and Daniel) and Greek (Novum Testamentum Graece and the Septuagint) with precise transliterations and morphological breakdowns.') +
  `<h2>Harmony with the historic creeds</h2>` + para(
    'Our exegesis is framed by the ecumenical orthodoxy of the historic church, including the Apostles\u2019 Creed, the Nicene-Constantinopolitan Creed and the Chalcedonian Definition.') +
  `<h2>Verified link policy</h2>` + para(
    'Every external article link and YouTube reference across the volumes is audited for active status. Broken links and speculative URLs are not permitted in the public record.'));

simple('/music',
  { title: "Sacred Music & Pakistani Gospel Heritage | Saul's Podship", description: 'The 150 Punjabi Zaboor psalms and the living archive of Pakistani Christian gospel composers, classical vocalists and musical families.' },
  'Sacred Music & Pakistani Gospel Heritage',
  para(
    'This section preserves the 150 Punjabi Zaboor and a living archive of Pakistani Christian gospel composers, classical vocalists and musical patriarchs.',
    'Between 1898 and 1908 Rev. Imam-ud-Din Shahbaz translated and versified all 150 biblical Psalms into native Punjabi meters, paired with classical North Indian ragas such as Bhairavi, Yaman, Pahadi and Kafi, giving Punjabi Christians a liturgy in their mother tongue.',
    'The Pakistani Gospel Singers Archive documents historic patriarchs, master classical vocalists, pioneer hymn writers and contemporary worship artists across every decade, including the Din family musical dynasty that began with Pastor Jamil-ud-Din of the City Church of Montgomery, today Sahiwal.',
  ) + `<ul><li><a href="/music/punjabi-zaboor">The Punjabi Zaboor Heritage</a></li><li><a href="/music/pakistani-singers-archive">Pakistani Singers Archive</a></li></ul>`);

simple('/music/punjabi-zaboor',
  { title: "Punjabi Zaboor: All 150 Psalms in Punjabi Verse | Saul's Podship", description: 'The 1898\u20131908 metrical Punjabi Psalter by Rev. Imam-ud-Din Shahbaz, set to classical ragas, with all 150 Zaboor mapped to the official 1908 repository.' },
  'The Punjabi Zaboor Heritage',
  para(
    'The historic metrical translation of all 150 biblical Psalms by Rev. Imam-ud-Din Shahbaz (1898\u20131908), preserving Scripture in South Asian classical ragas.',
    'Between 1898 and 1908 the Sialkot Mission in undivided Punjab produced the Punjabi Zaboor. Translating from the Hebrew Masoretic text, Rev. Shahbaz versified all 150 Psalms into traditional Punjabi poetic meters (Bahr).',
    'Rather than imposing Western hymn tunes, the metrical psalms were deliberately married to native ragas (Bhairavi, Yaman, Pahadi, Kafi), so that Punjabi Christians could worship the God of Abraham, Isaac and Jacob in their own mother tongue.',
    'Browse or search all 150 metrical Psalms, with direct links to the official punjabizaboor1908.com digital repository, and see arrangers and tabla masters associated with the tradition.',
  ));

simple('/music/pakistani-singers-archive',
  { title: "Pakistani Gospel Composers & Singers Directory | Saul's Podship", description: 'A searchable register of the composers, vocalists, musicologists and hymn writers who shaped Pakistani and South Asian Christian music.' },
  'Pakistani Gospel Composers & Singers Archive',
  para(
    'The historical register of the composers, vocalists, musicologists and hymn writers who shaped South Asian gospel music and the metrical Punjabi Zaboor tradition.',
    'Search the registry by name, era or role, and read biographical monographs on each artist, including their major contributions and honors. A special memorial tribute honors the four-generation Din family musical dynasty, beginning with Pastor Jamil-ud-Din, one of the first pastors of the City Church of Montgomery (present-day Sahiwal).',
    'The archive is a living research record and is extended as verified information becomes available.',
  ) + `<p><a href="/Pakistanisingersarchive">Open the full singers archive</a></p>`);

simple('/prophecy-map',
  { title: "Biblical Prophecy Map: 247 Prophecies Cross-Referenced | Saul's Podship", description: 'An interactive map of 247 biblical prophecies \u2014 fulfilled, partly fulfilled and future \u2014 with 1,063 cross-reference links and a rotatable 3D globe.', article: { section: 'Scripture Reference Series', image: '/images/hero-prophecy.jpg', description: 'An interactive map of 247 biblical prophecies \u2014 107 fulfilled, 88 fulfilled in part and 52 still awaiting fulfilment \u2014 woven together by 1,063 cross-references on a rotatable 3D globe.' } },
  'The Biblical Prophecy Map',
  para(
    'A Saul\u2019s Podship study of prophetic fulfilment. The map charts 247 biblical prophecies: 107 fulfilled, 88 fulfilled in part and 52 still awaiting fulfilment.',
    'Prophecies are woven together by 1,063 cross-references and placed on a rotatable 3D globe, with historical, metaphorical and futurist fulfilment tags on each one. Every thread opens the passage on bible.com so the text can be read in context.',
    'Use the map to trace how a prophecy is quoted in the New Testament, to compare views on fulfilment, and to see which regions of the world each prophecy concerns.',
  ));

simple('/kings-of-the-bible',
  { title: "Kings of the Bible: Every Throne in Order | Saul's Podship", description: 'Every throne in Scripture in canonical order, from Saul to the Herods, with reign lengths, prophets sent and how each reign ended.', article: { section: 'Scripture Reference Series', image: '/images/hero-jesus-alpha-omega.jpg' } },
  'Kings of the Bible: The Throne Line',
  para(
    'Every throne in the Bible in canonical order, beginning with Jesus the Messiah, King of Kings, and running from Saul through the divided kingdoms of Israel and Judah to the Herods and Nero.',
    'For each reign the chart gives the length of rule, the prophets sent, the wars fought, synchronisms with neighbouring powers and how the reign ended, so that the royal chronology can be read line by line.',
    'The sequence closes with the last king of Scripture, the Beast, together with the historic interpretations recorded by Irenaeus and Hippolytus.',
  ));

simple('/support',
  { title: "Support Free Christian Scholarship | Saul's Podship", description: 'Help keep 51 encyclopedia volumes, podcast masterclasses and the Punjabi Zaboor archive free for pastors, students and missionaries worldwide.' },
  'Support Saul\u2019s Podship',
  para(
    'Every volume in the 51-volume encyclopedia, every podcast masterclass and every digital hymn archive is provided free of charge to pastors, students, missionaries and believers worldwide.',
    'Supporters finance independent theological research, original Greek and Hebrew linguistic parsing, podcast studio production and the archival scanning of rare South Asian Christian hymnody, through the official Patreon community.',
    'Your pledge keeps all volumes and scholarly reference tables free from commercial paywalls, and funds the digitizing of the 150 Punjabi Zaboor, their historic meters and the Pakistani Christian artists who sang them.',
  ));

simple('/studio',
  { title: "Interactive Theological Studio | Saul's Podship", description: 'Arrange sacred songs in South Asian ragas and search the Scriptorium\u2019s own scholarship on the Research Desk, all in your browser.' },
  'Interactive Theological Studio',
  para(
    'Compose, hear and download sacred songs in South Asian ragas and global gospel, and search the Scriptorium\u2019s own scholarship. Everything runs in your browser.',
    'Raga-based sacred music arrangement lets you arrange Christian hymns with traditional scales such as Bhairavi, Yaman Kalyan, Bilawal, Khamaj and Kafi, and indigenous rhythms such as Dadra, Keherwa and Roopak.',
    'The Scriptorium Research Desk searches the 100 Tough Questions, the 1,000-question archive and all 51 volumes, and quotes what the Scriptorium already teaches. It uses no AI, only the sources. Try a passage such as Isaiah 53, a doctrine such as atonement, or a name such as Melchizedek.',
  ));

simple('/privacy',
  { title: "Privacy Policy | Saul's Podship", description: 'What Saul\u2019s Podship collects, how cookies and advertising partners are used, and how to request removal of your data.' },
  'Privacy Policy',
  para(
    'Saul\u2019s Podship operates saulspodship.com as a free public theological scriptorium and educational encyclopedia. We are committed to transparency and respect for user privacy.',
    'No account or registration is needed to read the encyclopedia or listen to the podcast. We only collect information that you voluntarily submit through our contact or newsletter forms.',
    'We may partner with third-party advertising networks such as Google AdSense, which may use cookies and similar technologies to serve ads based on prior visits. You can manage cookie preferences in your browser settings or in Google Ad Settings.',
    'For privacy questions or data-removal requests, please use the contact page.',
  ));

simple('/terms',
  { title: "Terms of Use | Saul's Podship", description: 'Terms for using the Saul\u2019s Podship encyclopedia, archives and artwork: educational use, attribution and intellectual property.' },
  'Terms of Use',
  para(
    'By using saulspodship.com you accept these terms. The theological manuscripts, data tables and study monographs are published for educational, ecclesiastical and scholarly research, and proper academic attribution is requested when citing Scriptorium materials.',
    'Historical art assets are in the public domain where so marked. The homepage artwork, The Last Supper (2026), is an original commission created for and owned by Saul\u2019s Podship. Original exegesis and the compilation of the volumes are the copyright of Saul\u2019s Podship.',
    'See the disclaimer for our editorial position and the privacy policy for how data is handled.',
  ));

simple('/sitemap',
  { title: "HTML Site Directory & Sitemap | Saul's Podship", description: 'A complete directory of all 51 theological volumes, archives, music pages and ministry pages on Saul\u2019s Podship.' },
  'HTML Site Directory & Sitemap',
  `<p>${esc('A complete structured directory of all 51 theological volumes and ministry pages.')}</p>` +
  `<h2>Encyclopedia volumes</h2>` + list(volumes.map((v) => [`/encyclopedia/${v.slug}`, `Volume ${v.number}: ${v.title}`])));


/* ---- Encyclopedia volumes: unique short title + crawlable body ----
 * dist/encyclopedia/<slug>/index.html (written by postbuild) is served by
 * Vercel before the /encyclopedia/* API rewrite, so Ahrefs saw a ~54-word
 * shell and titles of up to 100 characters. Give each volume a real summary,
 * key facts and FAQ, and keep the <title> under ~60 characters. */
for (const v of volumes) {
  const n = String(v.number).padStart(2, '0');
  const route = `/encyclopedia/${v.slug}`;
  if (pages.has(route)) continue;
  const summary = v.summary || v.overview || '';
  pages.set(route, {
    head: {
      title: `${clip(v.title, 40)} | Vol. ${n} | Saul's Podship`,
      description: clip(v.metaDescription || summary, 155),
      canonical: BASE_URL + route,
      keywords: Array.isArray(v.keywords) ? v.keywords : undefined,
    },
    // This script overwrites dist/encyclopedia/<slug>/index.html, so the
    // Article node postbuild wrote there is gone by now — emit it here.
    article: {
      headline: `Volume ${n}: ${v.title}`,
      description: v.metaDescription || summary || v.overview,
      image: v.heroImage?.src,
      dateModified: v.lastUpdated,
      section: `Encyclopedia — Volume ${n}`,
    },
    body: wrap(
      `<main><h1>Volume ${n}: ${esc(v.title)}</h1>` +
        (v.subtitle ? `<p><em>${esc(v.subtitle)}</em></p>` : '') +
        `<p>${esc(summary)}</p>` +
        (v.overview && v.overview !== summary ? `<p>${esc(v.overview)}</p>` : '') +
        (v.keyFacts && v.keyFacts.length ? `<h2>Key facts</h2><ul>${v.keyFacts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '') +
        (v.faq && v.faq.length ? `<h2>Frequently asked questions</h2>${v.faq.map((f) => `<section><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></section>`).join('')}` : '') +
        `<p><a href="/encyclopedia">Browse all 51 volumes</a></p></main>` +
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
  let pageHtml = withHead(template, page.head).replace(EMPTY_ROOT, page.body);
  if (page.article) {
    const schema = articleSchema({
      headline: page.article.headline || page.head.title,
      description: page.article.description || page.head.description,
      url: page.head.canonical,
      ...page.article,
    });
    pageHtml = pageHtml.replace('</head>', `${jsonLd('sp-article-jsonld', schema)}\n</head>`);
  }
  fs.writeFileSync(file, pageHtml, 'utf8');
  // Vite preview and Vercel can resolve clean URLs to .html files. Keeping
  // these copies makes the About/FAQ content available before JavaScript runs.
  if (route === '/about' || route === '/faq') {
    fs.writeFileSync(path.join(distDir, `${route.slice(1)}.html`), pageHtml, 'utf8');
  }
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
