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
| `npm run test:about` | After building, checks the app directory, FAQs, structured data and crawler output |
| `npm run verify` | Codex integrity gate (`scripts/verify-codex.mjs`, 400/400 cards) |
| `npm run gen:volumes` | Regenerate `src/data/volumes/volumeIndex.json` |

## Verify before finishing (required)

```bash
npm run lint && npm test && npm run verify && npm run build && npm run test:about
```

## About page: public app directory

`src/data/podshipApps.json` is the shared list of verified public subdomain apps. The About page, navigation, FAQ answers, structured data, prerendered HTML and generated `llms.txt` use this list. Add or change a product there only after checking its public URL and official logo. The locally hosted Biblical Languages and Sunday School WebP icons are optimized from their original 192px app icons ([Biblical Languages](https://biblicallanguages.saulspodship.com/icon-192.png), [Sunday School](https://saulssundayschool.saulspodship.com/assets/icons/icon-192.png)); the Evangelism and Biblical Cosmos SVG marks are copies of those projects' original icons. The About and FAQ page text and structured-data helpers live in `src/data/about.ts` and `src/data/faq.ts`. Run the build and `npm run test:about` after changes.

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
