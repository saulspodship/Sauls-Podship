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

## Sibling domains — re-check, 2 November 2026 (live)

The 100 sibling rows were re-tested against the deployed sites after their fixes.
Method: clone + inspect the repos this account can read (`Evangelism`,
`Biblical-Cosmos-3D`), then the live HTML/metadata for the four private projects
(`saulssundayschool`, `biblicalnumerologyandetymology`, `biblicallanguages`,
`faithconnectpro`) — sitemap XML, `<head>` metadata, `<h1>` structure and the
stale-host links.

| Domain | Rows | Result |
| --- | --- | --- |
| `evangelism` | 32 | **Clear.** 11 pages, all self-canonical and in `sitemap.xml` (11 URLs, declared in `robots.txt`); `/library/index.html` 301s to `/library/`; descriptions 120–155; `setting-goals-for-evangelism` title now under 60; all 15 Google Drive anchors removed, local 1200×630 share image. `scripts/validate.py` passes. |
| `saulssundayschool` | 10 | **Clear.** Sitemap lists `/`, `/apps/`, `/about/`, `/print/`; `/apps/` description 200 → 146; `/print/` is one `<h1>` with `<h2>` per unit (was 91 `<h1>`s); the `studio.` / `gematria-lab.` / `cdn.` links are gone from `/`, `/apps/` and `/about/` — Studio now points at `www.saulspodship.com/studio`, Gematria Lab at `biblicalnumerologyandetymology.saulspodship.com`, and the CDN card is explained rather than linked. |
| `biblicalnumerologyandetymology` | 40 | **Clear, with one new defect** (below). Sitemap now exists with 66 URLs covering all 20 audited ones (topics and terms are auto-generated, so future terms cannot be missed); `og:image` (`og-image.png`, 1424×752) and `og:site_name` are present on home, `/about`, every `/term/*` and `/topic/*`. |
| `biblicalcosmos3d` | 1 | **Clear.** One-URL sitemap, declared in `robots.txt`, full head metadata, single `<h1>`; the legacy `Biblical Cosmos 3D.html` is a `noindex` redirect stub. |
| `biblicallanguages` | 1 | **Clear.** Sitemap + `robots.txt`, self-canonical root, 1200×630 OG image. |
| `faithconnectpro` | 4 | **Clear.** Sitemap lists `/`, `/about`, `/faq`, `/privacy`; root has full OG/Twitter set with a 1200×630 card. |

### Open: two 404s inside the Gematria Lab sitemap

```
https://biblicalnumerologyandetymology.saulspodship.com/term/l   404
https://biblicalnumerologyandetymology.saulspodship.com/term/n   404
```

Single-letter slugs (the Arabic article and a bare nun) are emitted by the sitemap
generator from term data that has no resolvable page. This is a *new* row waiting
to happen — "sitemap contains a URL that returns 4xx". Fix in that project:

1. Build the sitemap from the same resolution used by `/term/[slug]` (only slugs
   whose page renders, i.e. `terms.filter(t => t.slug && t.gloss)`), not from the
   raw term list.
2. Add the check to that project's build/test so a 404 can never be listed again:
   fetch every sitemap `<loc>` and fail on anything other than 200.
3. Audit the remaining short slugs the same way (`haqq`, `nur`, `chaser`, `netiv`,
   `regel`, `shalah`, `davar`, `melekh`, `ish`, `et`, `or` all rendered 200 in the
   spot checks; `l` and `n` do not).

Minor, not audit rows:

- `/term/*` and `/topic/*` meta descriptions are clipped mid-sentence at ~139–153
  characters (`… baselines in Gematria`). They pass the length rule but read as
  broken text; clip on a sentence boundary and end with `…`.
- The apostrophe slugs `/term/ra'ah` and `/term/sha'al` are emitted unencoded in
  the sitemap and canonical. They resolve, but `%27` (or an apostrophe-free slug)
  is the safer form in XML.
- `saulssundayschool` uses `assets/icons/icon-512.png` as its `og:image` while
  declaring `twitter:card=summary_large_image`; a 1200×630 card like the other
  sites' would avoid the cropped preview.

All four private projects (`Gematria-Lab`, `Sauls-Sunday-School`, and the
languages / FaithConnect repos) are outside this GitHub connection's permissions —
`gh` returns *Resource not accessible by integration* — so the two 404 slugs above
must be fixed in those repositories, not here.

## Pre-existing test failure

`npm run test:about` (`scripts/test-about-directory.ts`) fails on this commit
*before* these changes too: it still expects a `/index.html` SPA-fallback rewrite
that `vercel.json` no longer declares. It is not part of `npm run build`.
