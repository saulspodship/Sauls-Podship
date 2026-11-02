# Ahrefs Site Audit — 2 November 2026

Eleven Site Audit exports were supplied (`saulspodship_02-nov-2026_*.csv`). This
record covers what was wrong on **www.saulspodship.com** — the domain this
repository builds — what caused it and what now prevents it from returning.

The remaining rows sit on the separate subdomain projects (see
[Out of scope](#out-of-scope-rows)).

| Ahrefs issue | www rows | Root cause | Fix |
| --- | --- | --- | --- |
| Article page missing schema | 101 | `scripts/prerender-seo.mjs` rewrites `dist/encyclopedia/<slug>/index.html` **after** `postbuild.mjs`, dropping the Article JSON-LD postbuild had written (95 rows). The rest (question pages, hubs, module pages) never carried one. | Every prerendered content page now emits its own `Article` node (`articleSchema()` in `prerender-seo.mjs`); the static module docs and `/biblical-maps` got theirs in the HTML. |
| Orphan page (no internal links) | 9 | Five `/podcast/<slug>` rows are the English **video** masterclasses: the hub only listed the Urdu audio episodes. Three `/music-archive/<slug>` rows are "Historic Pioneer" rows in `singers.html`, which `prerender-music.mjs` never linked. `/encyclopedia/biblical-maps-atlas` was reachable only from the sitemap. | Hub lists the video masterclasses; pioneer rows get the same "Read Biography" link as the cards; the atlas is linked from the encyclopedia hub, `/biblical-maps`, and both module footers. |
| Page has no outgoing links | 1 | `/prophecy-map.html` is a self-contained module with zero `<a>` elements — its header/footer chrome is injected by JS. | A crawlable "Explore Saul's Podship" footer was added (the kings module got the same footer). |
| Indexable page not in sitemap | 2 | `scripts/sync-sitemap.mjs` only collected `index.html` pages, so the flat module documents (`prophecy-map.html`, `kings-of-the-bible.html`) could never be added. | Self-canonical root-level `.html` pages are now collected (and both declare a canonical). |
| Open Graph tags incomplete | 3 | The three static module docs were hand-written before the `og:type` / `og:url` / `og:image` set became the house standard. | All five required Open Graph tags plus `og:site_name` and a full Twitter card. |
| X (Twitter) card missing | 3 | Same files — no `twitter:*` tags at all. | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`. |
| Meta description too long | 3 | 188–317 characters on the module docs. | Rewritten to ≤160 characters. |
| Title too long | 1 | `/encyclopedia/biblical-maps-atlas` shipped an 81-character `<title>`. | Now `Biblical Maps — Interactive Journey Atlas \| Saul's Podship` (58). |
| Page has links to broken pages | 0 | All rows are on `saulssundayschool.` / `evangelism.` — see below. | — |
| Multiple H1 tags | 0 | The single row is `saulssundayschool.saulspodship.com/print/`. | — |

## Where the fixes live

| File | Change |
| --- | --- |
| `scripts/prerender-seo.mjs` | `articleSchema()` + per-page `article` config; podcast hub lists `VIDEO_EPISODES`; encyclopedia hub links the Volume 11 atlas. |
| `scripts/prerender-music.mjs` | Pioneer rows in the singers archive link to their `/music-archive/<slug>` biography. |
| `scripts/sync-sitemap.mjs` | Collects self-canonical root-level `.html` pages as well as `index.html` directories. |
| `scripts/check-seo.mjs` | **New build gate.** Fails `npm run build` if a sitemap URL loses its canonical, Open Graph/Twitter tags, title/description limits, Article schema or its last internal link. |
| `public/kings-of-the-bible.html`, `public/prophecy-map.html`, `public/encyclopedia/biblical-maps-atlas.html` | Canonical, complete social metadata, Article JSON-LD, link footer. |
| `public/biblical-maps/index.html` | Article JSON-LD, Twitter title/description/image, link to the atlas supplement. |
| `package.json` | `npm run build` runs `node scripts/check-seo.mjs` after `sync-sitemap.mjs`; `npm run check:seo` runs it alone. |

## Verification

```bash
node scripts/sync-sitemap.mjs     # 261 canonical URLs, 2 module docs added
node scripts/check-seo.mjs        # canonical + social + schema + orphan gate
```

`check-seo.mjs` fails on a deliberately stripped Article block, which is the
exact regression that produced 95 of the 101 schema rows.

The 201 stored URLs, 101 article pages and 9 orphans were re-checked against the
built `dist/` output: 101/101 article rows carry `Article`, the two module docs
are in `dist/sitemap.xml`, and none of the nine orphans has zero internal links.

## Out of scope rows

These URLs are served by the sibling subdomain projects, not by this repository
(no rewrite or asset in `vercel.json` / `public/` reaches them):

- `indexable-page-not-in-sitemap` — 41 rows on `evangelism`, `biblicalnumerologyandetymology`, `biblicalcosmos3d`, `saulssundayschool`, `biblicallanguages`, `faithconnectpro`.
- `meta-description-too-long` — 10 rows on `evangelism`, `saulssundayschool`.
- `open-graph-tags-incomplete` — 20 rows on `biblicalnumerologyandetymology`.
- `title-too-long` — 1 row on `evangelism`.
- `multiple-h1-tags` — 1 row on `saulssundayschool`.
- `page-has-links-to-broken-pages` — 15 rows: `saulssundayschool` links to
  `studio.saulspodship.com`, `gematria-lab.saulspodship.com` and
  `cdn.saulspodship.com` (all 404, so those hosts must be deployed, redirected or
  the links removed there), and `evangelism` links to eight deleted Google Drive
  PDFs.

`npm run test:about` (`scripts/test-about-directory.ts`) fails on this commit
*before* these changes too: it still expects a `/index.html` SPA-fallback rewrite
that `vercel.json` no longer declares. It is not part of `npm run build`.
