# Comparative Apologetics Codex — install package for saulspodship.com

This folder is a **drop-in add-on** for the Saul's Podship Vite + React + Tailwind
site (React Router `createHashRouter`, lucide-react icons, wine `#4A152C` /
gold `#E8C96A` / cream `#F8F4E3` palette).

It adds a **fifth pillar** — "400 Comparative Questions" — to the
*Four Pillars of Saul's Podship Scriptorium* section on the home page, plus a
new route `/comparative-apologetics` that hosts the complete interactive codex
(100 questions each on Islam, Judaism, Hinduism, Sikhism).

## What the agent must do (summary — full steps in `.agent/workflows/`)

1. Copy `public/comparative-apologetics/` → project `public/` (static codex HTML, ~1.5 MB).
2. Copy `src/components/pillars/ComparativeApologeticsPillar.jsx`,
   `src/pages/ComparativeApologeticsPage.jsx`,
   `src/data/comparativeApologeticsIndex.json` into the same paths in the project.
3. Register the route `{ path: "comparative-apologetics", element: <ComparativeApologeticsPage /> }`
   in the router **before** the `path: "*"` 404 route.
4. On the home page, insert `<ComparativeApologeticsPillar />` as the **5th card** of the
   pillar grid, directly after the "Tough Questions" card, and change
   `lg:grid-cols-4` → `lg:grid-cols-5` (or `xl:grid-cols-5 lg:grid-cols-3`).
5. Update the section intro text to read "Five Pillars of Saul's Podship Scriptorium".
6. Add `/comparative-apologetics` to the Sitemap page and `sitemap.xml` (if present).
7. Run `npm run build` and confirm `dist/comparative-apologetics/codex.html` exists.

## Hard rules

- **Do not** edit, minify, re-format, or "clean up" `public/comparative-apologetics/codex.html`.
  It is a verified, self-contained document: 400 `article.qcard` elements with stable IDs
  (`q-islam-1` … `q-sikhism-100`), its own CSS/JS toolbar, and tested behaviour.
  Any change there must go through `scripts/verify-codex.mjs` and pass 400/400.
- **Do not** import the codex HTML into the React bundle. It is served as a static asset
  and embedded via `<iframe>` — this is intentional (bundle size, style isolation).
- **Do not** rename the route slug `comparative-apologetics`; `canonical`, JSON-LD and
  deep links (`?q=q-islam-83`, `?rel=hinduism`) depend on it.
- Match the existing pillar card markup exactly (same Tailwind classes) so the fifth card
  is visually identical to the other four. Do not introduce new colours.
- Keep the existing four pillars, their links, and their copy unchanged.
- Preserve `createHashRouter`; do not switch to `createBrowserRouter`.
- **Do not** add a private translation dictionary anywhere (component, `public/assets/*.js`,
  or a static module page). The one dictionary lives in `src/data/i18n/` — see
  [Language layer](#language-layer-sp-i18n). A second copy drifts, and the codex enhancer
  already proved it.
- **Do not** hand-edit the generated i18n artifacts: `public/i18n/{ur,hi,ar}.json`,
  `public/assets/sp-i18n.js`, `src/data/i18n/version.ts`. They are emitted by
  `scripts/build-i18n.mjs` (and rewritten by every `npm run build` / `npm run dev`).

## Language layer (`sp-i18n`)

The site ships Urdu / Hindi / Arabic alongside English. Translation is **static and
client-side only** — no translation API, no server round-trip. The dictionary is bundled
from `src/data/i18n/` into `public/i18n/*.json`; English visitors never download a byte of it.

How it fits together:

| Piece | Path | Role |
| --- | --- | --- |
| Dictionary sources (edit these) | `src/data/i18n/dict-{chrome,volumes,pages,modules}.ts` | `[ur, hi, ar]` tuples keyed by the English string |
| Templated rules (edit these) | `src/data/i18n/patterns.ts` | regex → template for strings built from data (`Vol 12: …`, `Browse 51 Volumes`, `Last Updated: …`, tab titles) |
| Emitter | `scripts/build-i18n.mjs` (`npm run gen:i18n`) | writes `public/i18n/*.json`, `src/data/i18n/version.ts`, and bundles `public/assets/sp-i18n.js` |
| Runtime | `src/lib/i18n/{store,engine,react}.ts(x)` | the React translator: `MutationObserver` + per-frame settle passes, `WeakMap` original registry, same-origin iframe walking |
| Fallback runtime | `src/lib/i18n/standalone.ts` → `public/assets/sp-i18n.js` | `window.__spI18n` for static module docs and the codex enhancer; inside a frame it only sets `lang`/`dir`/fonts and defers to the parent |
| Gate | `scripts/test-i18n.mjs` (`npm run test:i18n`) | runs inside `npm run build` — fails on stale artifacts, wrong-script values, empty entries, untranslated chrome/volume/module strings |
| DOM gate (optional) | `scripts/test-i18n-dom.mjs` | jsdom end-to-end proof (needs `npm i -D jsdom`; skips cleanly without it) |
| Coverage audit | `scripts/harvest-i18n.mjs` | scans `src/` for user-facing strings and reports which have no dictionary entry |

Rules when touching UI text:

1. **Prefer a pattern over a dictionary entry for anything built from data.** Volume
   numbers, dates, counts and titles are generated, so a literal entry rots the moment a
   volume is added. Patterns also localise digits (`۵۱` / `५१` / `٥١`).
2. **A new page/volume/module is not done until its strings translate.** Add entries, run
   `npm run gen:i18n`, then check `node scripts/harvest-i18n.mjs --missing`.
3. **Never translate text that is already in the target language.** Mark it
   `translate="no"` or `data-sp-notranslate` (see `TheologicalArchivePage`, and the `.urdu`
   / `.urdu-body` classes the engine always skips).
4. **`codex.html` stays frozen.** It is translated two ways without being edited: the
   parent engine walks its same-origin iframe, and `podship-enhance.js` injects
   `sp-i18n.js` for direct visits.
5. A static module doc gets `<script src="/assets/sp-i18n.js" defer></script>` in `<head>`.
   Keep it to one reference per page — the gate counts them.

Debugging gaps on the live site: `localStorage['sp-i18n-debug']='1'` (or `?i18n-debug=1`)
outlines every untranslated node, and `window.__spI18n.report()` lists the misses.

## Verify before finishing

```bash
node scripts/verify-codex.mjs      # 400 cards, 4×100, unique IDs, toolbar present
npm run build
ls dist/comparative-apologetics/codex.html
```
Then open `/#/comparative-apologetics`, click a religion chip (it filters **and**
scrolls to that section), click a question title (it expands), and change the sort to
"Most asked in Pakistan & India".

## Deployment storage hygiene (Vercel)

Every push to `main` creates a production deployment, and Vercel keeps a FULL copy
of the build output (`dist/`, ~95 MB) for every retained deployment. ~120 pushes in
three weeks is what caused the 11 GB Deployment Storage spike in Sep 2026.

- **`main` is the only long-lived branch.** The `dev` branch and the daily
  `promote-dev` workflow were retired on 2026-09-13 — everything lives in `main`.
  Since every push to `main` is now a production deployment, **batch related
  changes into a single push** rather than pushing after each commit, and do the
  work in short-lived branches that get merged once they are ready.
- Before committing any new or edited image under `public/`, run:
  `python3 scripts/optimize_images.py` (needs Pillow). It compresses in place and
  generates missing `hero-1920.webp` variants. Never commit multi-MB PNG/JPG.
- Keep hero generation settings in `scripts/make_hero_variants.py` at q<=80.
- To reclaim storage: Actions -> "Clean old Vercel deployments" (needs the
  `VERCEL_TOKEN` repo secret); dry-run first. Deletions are restorable 30 days.
- **Git identity:** always commit with
  `user.name = saulspodship` / `user.email = saulspodship@gmail.com` — the GitHub
  account linked to the project's Vercel. The repo is PRIVATE and Vercel is on the
  Hobby plan, so ONLY commits authored by an account with project access deploy;
  anything else is blocked ("Git author ... must have access to the project on
  Vercel"). `111325113+Solatjamil@users.noreply.github.com` resolves to a DIFFERENT
  GitHub account (`Solatjamil`) and its commits were blocked on 2026-09-13 — do not
  use it, even though earlier revisions of this file recommended it.
