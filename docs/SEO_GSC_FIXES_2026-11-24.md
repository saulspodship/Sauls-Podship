# GSC Page indexing fixes — 24 Nov 2026

Source: Google Search Console → *Page indexing* reports captured 24 Nov 2026
(five drill-down exports; "Validation failed, started 11/2/26, failed 11/17/26").

This document records, issue by issue: what GSC reported, the **root cause in this
repo**, the **fix**, and what still has to happen outside the repository.

| GSC report | URLs | Root cause | Status after this change |
| --- | --- | --- | --- |
| Page with redirect | 78 | `index.html` boot script called `location.replace('/#/…')`; numeric volume URLs were noindex + `<meta refresh>` stubs | Fixed in code (real routes, real 301s) |
| Not found (404) | 2 | legacy `/music-archive/<collection-slug>` had no route; apex `http://saulspodship.com/` is not attached to the Vercel project | 1 fixed in code, 1 needs a Vercel dashboard/DNS step |
| Alternate page with proper canonical tag | 1 | `/index.html` was served as a copy of `/` | Fixed (301 → `/`) |
| Crawled – currently not indexed | 11 | `.md` corpus companions + XML sitemaps crawled as pages; thin music pages; legacy `/music/archive/…` | 5 fixed, 5 are content/demand signals (see §4) |
| Excluded by 'noindex' tag | 3 | `/encyclopedia/21`, `/25`, `/34` were static "redirect" pages | Fixed (edge 301s) |

---

## 1. Page with redirect (78)

**What GSC showed.** The examples were almost exactly the 196 URLs in
`sitemap.xml` — `/terms`, `/encyclopedia`, `/encyclopedia/<slug>`, `/podcast/…`,
`/music`, `/studio`, `/faq`, `/contact`, `/support`, `/sitemap`, `/disclaimer`,
`/scholarly-standards`, `/comparative-apologetics` — plus the numeric volume
aliases and the apex/www variants.

**Root cause.** The site is a `createHashRouter` SPA whose clean URLs are
*prerendered static files*. Every one of those files shipped this inline boot
script (top of `index.html`, copied by `scripts/postbuild.mjs` and
`scripts/prerender-seo.mjs`):

```js
if (p && p !== '/' && p !== '/index.html' && !location.hash) {
  location.replace('/#' + p.replace(/\/+$/, '') + location.search); // navigation!
}
```

`location.replace` is a real navigation. Googlebot rendered `/terms`, watched the
page navigate to `/#/terms`, and filed the clean URL as a redirect — so none of
the prerendered pages could ever be indexed, even though each one carries its own
canonical, title, description and article body.

**Fix.** The script now *seeds* the hash route with `history.replaceState`
instead of navigating:

* there is no navigation, so there is nothing for GSC to report as a redirect;
* the clean path stays in the address bar (`/terms#/terms`), so the rendered URL
  still matches the canonical the page declares;
* the prerendered HTML is kept instead of being thrown away and re-fetched, so
  first paint and LCP improve as a side effect;
* `src/routes.tsx` subscribes to the router and rewrites the address to the plain
  `/#/…` form on the **first in-app navigation**, so the seeded path never goes
  stale while a visitor browses.

Regression guards (both run in the build/`npm test:about`):

* `scripts/test-boot-route.mjs` — runs the *built* boot script in `node:vm`
  against a fake window and asserts no navigation, the preserved pathname and the
  seeded fragment (also for query strings and trailing slashes);
* `scripts/check-seo.mjs` — fails the build if any built page contains
  `location.replace('/#…')`.

The routing architecture is untouched: still `createHashRouter`, per `AGENTS.md`.

## 2. Not found (404) (2)

**(a) `/music-archive/bonpounoucom-pakistani-gospel-collection`.**
Not an artist. The archive index used to live at several "collection" /
"directory" slugs. `vercel.json` now 301s them to `/Pakistanisingersarchive`:

```
/music-archive                        → /Pakistanisingersarchive
/music-archive/bonpounoucom-pakistani-gospel-collection
/music-archive/pakistani-christian-gospel-collection
/music-archive/christians-of-pakistan-music-directory
/music-archive/pakistani-christian-musicians
/music-archive/pakistani-christian-gospel-singers-group
/music/archive/christians-of-pakistan-music-directory
/music/archive/pakistani-christian-gospel-collection
/music/archive/:slug                  → /music-archive/:slug
/music/archive                        → /music/pakistani-singers-archive
```

`api/index.ts` mirrors the same rules so `npm start` behaves identically.

**(b) `http://saulspodship.com/` — needs a dashboard step.**
The repo already declares the apex → www 301 (`vercel.json`, host condition) and
`api/index.ts` repeats it, but a URL only reaches that code if the apex domain is
attached to the Vercel project. A 404 on `http://saulspodship.com/` means the
request never got to the app. See §6.

## 3. Alternate page with proper canonical tag (1) — `/index.html`

`dist/index.html` is reachable directly and is byte-identical to `/`, so Google
picked one at random. `vercel.json` now 301s `/index.html` → `/` (and
`api/index.ts` does the same for the container build). The boot script already
ignored `/index.html`.

## 4. Crawled – currently not indexed (11)

| URL | Cause | Action |
| --- | --- | --- |
| `/encyclopedia/parables-of-jesus-all-40-explained.md`<br>`/encyclopedia/not-biblical-quotes-sayings.md`<br>`/encyclopedia/revelation-judgments-timeline.md` | The Markdown companions are linked as `rel="alternate"` and were crawled as pages | `vercel.json` + `api/index.ts` send `X-Robots-Tag: noindex, follow` and `Content-Type: text/markdown` for `*.md` — still readable by LLM crawlers, no longer competing with the HTML pages |
| `/sitemap.xml` | Crawled as a page | `X-Robots-Tag: noindex` on both XML sitemaps (sitemap *processing* is unaffected) |
| `/music/archive/christians-of-pakistan-music-directory`<br>`/music-archive/christians-of-pakistan-music-directory` | Legacy prefix / collection slug | 301 to `/Pakistanisingersarchive` (§2a) |
| `/music-archive/imam-ud-din-shahbaz` | Thin + effectively orphaned: one short paragraph, one incoming link | Each artist page now ships a breadcrumb trail, `BreadcrumbList` JSON-LD, an "About this record" context block linking `/music/punjabi-zaboor`, `/music`, and the Christianity-in-South-Asia volume, plus five links to neighbouring profiles (`scripts/prerender-music.mjs`). 104 profile pages, all cross-linked |
| `/podcast/aazmaish-mein-ilahi-wadon-ki-haqeeqat`<br>`/podcast/bible-aur-ghulami-ki-asal-haqeeqat` | Canonical, correct, 200 — Google simply has not chosen to index them yet | Not a technical fault: needs demand/signal (see §5) |
| `/music/punjabi-zaboor` | Same | §5 |
| `/encyclopedia/all-biblical-numerology`<br>`/encyclopedia/non-canonical-books-canon-differences` | Same | §5 |

Two Facebook group/page entries (`Active Community`) are **not** artist
biographies; they were generating one-paragraph pages that duplicate the archive
index. They are now skipped by `scripts/prerender-music.mjs`
(`NON_PROFILE_BADGES`), dropped from the curated sitemap, and 301'd to
`/Pakistanisingersarchive`.

## 5. Excluded by 'noindex' tag (3) — `/encyclopedia/21`, `/25`, `/34`

**Root cause.** `postbuild.mjs` wrote a static file per numeric volume URL
(`dist/encyclopedia/34/index.html`) containing:

```html
<meta http-equiv="refresh" content="0; url=/encyclopedia/not-biblical-quotes-sayings">
<meta name="robots" content="noindex, follow">
```

A static file cannot send a 301, so Google got **200 + noindex** — filed as
"Excluded by 'noindex' tag", while the meta refresh simultaneously counted as a
redirect. `docs/URL_MAP_50.md` has always specified `/encyclopedia/<NN>` → *301*
to the slug; it simply was not real.

**Fix.** The stubs are gone. `scripts/sync-vercel-redirects.mjs` generates the
edge 301s from `src/data/volumes/volumesData.json`:

* `/encyclopedia/<N>` and `/encyclopedia/0<N>` (for volumes 1–9)
* `/encyclopedia/by-number/<N>` and `/encyclopedia/by-number/0<N>`
* legacy slugs: `biblical-numerology`, `biblical-quotes-sayings`,
  `not-biblical-quotes-or-sayings`,
  `miracles-of-jesus-the-apostles-complete-catalogue`

`vercel.json` is read by Vercel *before* the build runs, so the entries are
committed. The file is now generated, not hand-maintained:

```bash
npm run gen:redirects     # rewrite the volume block in vercel.json
npm run check:redirects   # gate: fails when vercel.json drifts from the data
```

`check:redirects` also fails on duplicate sources, and `check-seo.mjs` fails when
a redirect shadows a page that was actually built (that is exactly how
`/music-archive/pakistani-christian-musicians` ended up in a sitemap while being
redirected away).

## 6. Still to do outside the repo

1. **Attach the apex domain.** Vercel → Project → Settings → Domains:
   add `saulspodship.com` and set it to redirect to `www.saulspodship.com`
   (Vercel also redirects `http` → `https` automatically once the domain is
   attached). Until then `http://saulspodship.com/` keeps answering 404, which
   also removes the "Not found (404)" item.
2. **Deploy, then validate.** After the next production deploy, open each report
   in GSC → *Validate fix*. Expected outcome:
   * "Page with redirect" shrinks to the *intentional* 301s only — apex→www,
     `/index.html`, `/encyclopedia/<NN>` and the legacy music paths. Those stay
     listed by design; that report is "excluded, on purpose".
   * "Not found (404)" clears once the apex domain is attached.
   * "Excluded by 'noindex' tag" clears to just the `*.md` companions and the two
     XML sitemaps, which are noindex on purpose.
3. **Content levers for §4's remaining five URLs** (they are valid, crawlable,
   self-canonical pages that Google has not selected — that is a demand signal,
   not a bug): get them linked from the highest-authority pages, keep them
   fresh (`lastmod`, visible "Last updated"), and give each an answer-first
   opening paragraph. Cross-linking the podcast episodes from the volume pages
   that share their topic is the cheapest win.
