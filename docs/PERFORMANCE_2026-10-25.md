# Performance & first-paint pass — 25 Oct 2026

Scope: the splash screen, the "FAQs before the hero" flash on the home page and
on volume pages, scroll lag, and the weight of the volume route. Plus the
comparative-evidence merge into Volume 27.

## 1. Splash screen: 10 s → 2 s

`src/components/AscensionSplash.tsx` — the five acts (Calvary → light → the Lord
rises → the declaration → the ascension) are unchanged, but the timeline is now
authored against `SPLASH_SECONDS = 2`:

| Act | Was | Now |
| --- | --- | --- |
| Calvary fade + Ken Burns | 1.4 s / 10.6 s | 0.35 s / 2.0 s |
| Rays, glow, dust | from 0.5 s | from 0.1 s |
| Jesus rises onto screen | 2.3 s | 0.55 s |
| Declaration (title → verse) | 2.3 → 3.8 s | 0.28 → 0.66 s |
| Ascension + beam + flash + dissolve | 5.7 → 9.8 s | 1.15 → 2.0 s |

The 40 ms start beat (was 250 ms) and the failsafe (2 s + 1.5 s) follow the new
duration. Skip still fast-forwards at ×6; `prefers-reduced-motion` fades in ~1.9 s.

## 2. "The FAQs show up first, then the hero banner"

Two independent causes, both fixed.

**(a) A visible FAQ block was injected over the pre-render shell.**
`public/assets/seo-aeo.js` polled `#root` every 150 ms and injected a visible
"Frequently Asked Questions" section as soon as the container had *any* child.
Every client-rendered route ships a crawler-facing block inside `#root`
(`scripts/prerender-seo.mjs`), so the block was painted while the JS bundle was
still downloading — then replaced by the hero. It now waits for React to paint
(`html[data-sp-app="ready"]`, set by `RootLayout`, and the `sp-app-ready` event
from the splash), and only appears on the home route. The FAQ/JSON-LD + GEO head
markup is unchanged.

**(b) The crawler shell itself was painted before the app.**
`index.html` now carries an inline, network-free **boot curtain** in the splash's
own colours (z-index 9998, under the splash). It is removed on `sp-app-ready`
(fallbacks: `load` + 2.5 s, hard 6 s, `noscript` disables it). Result: first
paint is the brand — never a serif list of site links — and cold loads on slow
connections no longer start with a white screen. `public/sw.js` → `sp-pwa-v8`
so returning visitors drop the cached copy of the old retrofit scripts.

## 3. Volume route: one 628 kB chunk → the dossier being read

`src/data/volumes/index.ts` statically imported all 51 `volume_NN.ts` modules, so
**every** volume page downloaded 628 kB (221 kB gzip) before rendering a
paragraph. New `src/data/volumes/registry.ts` loads them with
`import.meta.glob`, so Rollup emits one chunk per volume (7–45 kB).

`VolumePage` now paints immediately from the 82 kB catalogue index
(`volumeIndex.json`): the real hero banner, title, subtitle and CTAs, then the
dossier streams in (`VolumeDossierLoading` holds the height, so there is no
layout shift). Prev/next and related-volume cards read the same lite index.
`VolumeNumberRedirect` also uses the index instead of the full corpus.
The `volumes-data` manualChunk was removed from `vite.config.ts`.

## 4. Other main-thread wins

- **`public/assets/companion.js`** walked *every* `h2,h3,h4,div,span,p` and read
  `.textContent` off each one — several times (300 ms / 1.2 s / 3 s / repaint) —
  on long volume pages. It now targets `#companion-modules` first, scans
  headings only, runs once, and hides (never removes) the React-owned panel.
- **Home-page module iframe** (`ModuleSwitcher`) mounts the 300 kB atlas document
  only when it comes within 500 px of the viewport, with a same-height placeholder.
- **Sticky header blur** is dropped below 768 px (a `position: sticky` backdrop
  filter re-composites every frame while scrolling); a near-opaque tint keeps the
  identical look.
- The server-rendered `/encyclopedia/:slug` article (Vercel function) now
  time-boxes its Firestore round-trip to 600 ms and is edge-cacheable
  (`s-maxage=600, stale-while-revalidate=86400`); `markdownToHtml` learned
  `*italics*` and `> blockquotes`.

## 5. Volume 27 — comparative dossier merged

`scripts/merge_volume_27_evidence.mjs` (idempotent) appends Part VI–VII to
`src/data/volumes/volume_27.ts` — Jewish-scripture passages, the blasphemy
episodes, the historical witnesses (Pliny, Philippians hymn, Sanhedrin 43a,
Najran, Dome of the Rock, John of Damascus, Timothy I, "Two Powers"), where the
evidence cuts the other way, the Quran/hadith material and the framing advice —
plus a new reference table (7 witnesses), 4 FAQ entries and 3 key facts. The
`volumesData.json` mirror is refreshed so `dist/encyclopedia/<slug>.md` and
`llms.txt` carry the same text.

## Verification

```bash
npx tsc --noEmit          # clean
node scripts/verify-codex.mjs
npm run build             # 51 per-volume chunks, 63 prerendered pages
```
