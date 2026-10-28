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
| `npm run gen:i18n` | Emit `public/i18n/*.json` + bundle `public/assets/sp-i18n.js` from `src/data/i18n/` |
| `npm run test:i18n` | Dictionary/coverage/engine gate (also runs inside `npm run build`) |

## Verify before finishing (required)

```bash
npm run lint && npm test && npm run verify && npm run build && npm run test:about
```

## Languages (Urdu / Hindi / Arabic)

The language switcher translates the whole site — React pages, every volume's body text,
tables, timelines, story panels, the Companion bar, the static module docs and the
Comparative Apologetics codex iframe. It is **fully static**: no translation API and no
server round-trip. The dictionary lives in `src/data/i18n/` and is emitted to
`public/i18n/{ur,hi,ar}.json`; English visitors download nothing.

```bash
npm run gen:i18n                          # after editing any dictionary or pattern
node scripts/harvest-i18n.mjs --missing   # which user-facing strings still lack an entry
node scripts/test-i18n-dom.mjs            # optional jsdom end-to-end check (needs `npm i -D jsdom`)
```

Strings built from data (`Vol 12: …`, `Browse 51 Volumes`, `Last Updated: September 6, 2026`,
tab titles) are handled by templated **patterns** in `src/data/i18n/patterns.ts`, so adding a
volume never needs a dictionary edit — and digits are localised too (`۵۱` / `५१` / `٥١`).
Text that is already in the target language is skipped via `translate="no"` /
`data-sp-notranslate` / `.urdu`. To see gaps live: `localStorage['sp-i18n-debug']='1'`
(or `?i18n-debug=1`), then `window.__spI18n.report()`. See `AGENTS.md` → *Language layer*
for the rules.

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
