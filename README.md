# Saul's Podship Scriptorium

Comparative apologetics and Bible-encyclopedia SPA for [saulspodship.com](https://www.saulspodship.com) —
50+ illustrated volumes, biblical maps atlas, a 400-question comparative codex
(Islam / Judaism / Hinduism / Sikhism), a Pakistani Christian music archive, and
prophecy tools.

**Stack:** React 19 + Vite 6 + TypeScript · Tailwind CSS 4 · Express (served via a
single Vercel function) · Firestore REST API · React Router (`createHashRouter`).

## Getting started

```bash
npm install
npm run dev        # dev server on :3000 (tsz server.ts behind gen-volume-index)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Volume index generation + `tsx server.ts` dev server |
| `npm run build` | Link check → `vite build` → postbuild prerender → music prerender → bundles `server.ts` to `dist/server.cjs` |
| `npm start` | Run the built server (`dist/server.cjs`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm test` | Hero-variant integrity test (unique MD5s per variant) |
| `npm run verify` | Codex integrity gate (`scripts/verify-codex.mjs`, 400/400 cards) |
| `npm run gen:volumes` | Regenerate `src/data/volumes/volumeIndex.json` |

## Header navigation (dropdowns)

The header does **not** list pages one by one — it groups the whole site into five
dropdowns (Encyclopedia · Study Tools · Listen & Watch · Academy · Ministry).

* **Single source of truth:** `src/config/nav.ts`. Add/move/remove an item there and
  the desktop mega-menu, the mobile drawer and the footer-adjacent sitemap page all follow.
* **Same taxonomy on the static module shells** (prophecy map, interlinked bible, kings,
  atlas, codex): `public/assets/site-header.js` carries a mirror of the tree in plain JS.
  Keep the two in sync when a destination is added, and bump `?v=` on
  `/assets/site-header.js` + `/assets/bottom-nav.js` in the shells that reference them.
* **Ministry campuses (subdomains of saulspodship.com):** `SITE.sundaySchool`
  (https://saulssundayschool.saulspodship.com) and `SITE.biblicalLanguages`
  (https://biblicallanguages.saulspodship.com) live in the **Academy** dropdown of every
  header. They are external `https://` links that open in a new tab and are labelled
  `Subdomain`.
* `?category=scholarly|history|devotional|reference` on `/encyclopedia` deep-links a
  discipline filter straight from the Encyclopedia dropdown.

## Verify before finishing (required)

```bash
npm run lint && npm test && npm run verify && npm run build
```

## Repo conventions (read before contributing)

- **`AGENTS.md`** — agent guardrails, incl. the frozen codex artifact rules.
- **`.github/workflows/`** — `videos-sync` refreshes `public/videos/assets/videos-data.*`
  daily (18:15 PKT); `vercel-cleanup` prunes old Vercel deployments on demand.
  **Never hand-edit those generated data files** and don't fight the automation.
- **`main` is the only long-lived branch** (`dev` and the `promote-dev` workflow were
  retired 2026-09-13). Every push to `main` triggers a full production deployment
  (~95 MB build copy each), so batch related changes into one push and merge
  short-lived branches only once they're ready.
- Before committing any new/edited image under `public/`, run
  `python3 scripts/optimize_images.py` (needs Pillow). Never commit multi-MB PNG/JPG.
- Commit as `saulspodship <saulspodship@gmail.com>` — the Vercel-linked account.
  On the Hobby plan with a private repo, Vercel blocks deployments authored by
  any other GitHub account.
