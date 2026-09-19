# PHASE 10 — Hero Banners: Last Supper on the Homepage, and Full-Size Matching Heroes on Every Volume Page

## 10.1 Shared `<Hero>` component — one component, two variants

Build a single `src/components/Hero.tsx` used by **both** the homepage (`variant="home"`) and every volume page (`variant="volume"`). Same dimensions, same overlay, same behaviour — only the content slot differs.

**Dimensions (identical for both variants):**
```css
.hero        { position:relative; width:100%; overflow:hidden; }
/* Desktop ≥1024px */
.hero        { min-height: 100svh; }             /* full viewport, like the current home hero */
/* Tablet 640–1023px */
.hero        { min-height: 80svh; }
/* Mobile <640px */
.hero        { min-height: 100svh; }             /* full screen so the whole painting fits */
```

- Content block: `absolute inset-0 flex items-end md:items-center` — bottom-aligned on mobile, centred on desktop.
- Reserve a safe area at the bottom on mobile for the "scroll" hint / progress bar: `pb-[max(2rem,env(safe-area-inset-bottom))]`.

## 10.2 Homepage: The Last Supper visible in full on mobile
- Source file: *The Last Supper* (2026) — an original ultra-realistic commission created for and owned by Saul's Podship, with the Lord's face drawn from the Shroud of Turin. Ships as `last-supper-v2-source.jpg` plus the generated variants `last-supper-v2-1920.webp`, `last-supper-v2-1920.jpg`, `last-supper-v2-1280.webp` and `last-supper-v2-portrait.webp`.
- `last-supper-v2-portrait.webp` — 1080 × 1920 canvas containing the entire uncropped painting, letter-boxed with blurred darkened padding.
- Credit line: *The Last Supper (2026) — original ultra-realistic commission owned by Saul's Podship; the Lord's face drawn from the Shroud of Turin.*
- **Cache-busting the hero (`-v2`):** the version suffix is part of the *filename*, not a query string, and it **must be bumped** (`-v3`, `-v4`, …) every time the artwork changes. `vercel.json` serves `/images/*` with `Cache-Control: public, max-age=2592000, stale-while-revalidate=604800` (30 days) and `public/sw.js` caches images stale-while-revalidate, so re-encoding over the same filename leaves returning visitors looking at the previous artwork for up to a month. Bumping means: rename the five files, then update `src/components/Hero.tsx`, the two `<link rel="preload">` LCP hints in `index.html`, the OG fallback in `src/pages/VolumePage.tsx`, the `prebuild` script in `package.json`, `mainVariants` in `scripts/test-hero-variants.mjs` and the fallback path in `scripts/generate_volume_hero_variants.py`.

## 10.3 Volume Pages: Same Hero, Same Size
- Full-bleed hero banner matching homepage height.
- Content slot: Breadcrumbs, volume pill, h1 title, subtitle, meta row, action buttons (`Start Reading`, `Read Article`, `Watch Video`).
- Sticky study toolbar under the hero.
- Credits matching artwork.
