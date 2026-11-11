# Volume 15 — "Religions of the World: Biblical-View Tree" merged — 10 Nov 2026

The owner supplied a standalone page, *Religions of the World: Biblical-View
Tree* (52 traditions, each with dates, founder, books, symbols and the biblical
reading of its origin). It is now part of **Volume 15, Comparative Religion**
(`/encyclopedia/comparative-religion`) rather than a second document beside it.

## What was merged

| Piece | Where it lives |
| --- | --- |
| The 52 traditions, the two reading notes and the four filter groups | `src/data/volumes/volume_15.ts` → `content.lineage` (typed in `types.ts`: `VolumeLineage`, `LineageNode`) |
| The explorer — tree and timeline views, biblical / scholarly dating, search, group filter, Copy / CSV | `src/components/volume/LineageExplorer.tsx`, a lazy chunk that only a volume with `content.lineage` downloads |
| Its place on the page | `src/pages/VolumePage.tsx`: `#lineage`, between `#exegesis` and `#tables` |
| The same data as one flat table (Copy, CSV, and the Express article route) | `src/lib/lineage.ts`, used by the explorer and by `api/index.ts` |
| Merge source, idempotent | `scripts/merge_volume_15_lineage.mjs` |

Where the flat table is read without JavaScript: the Express route
`/encyclopedia/:slug` in `api/index.ts` lists it first among the volume's
tables. That route answers on the dev server and on the `npm start` container
build. On Vercel the same URL is answered by the prerendered shell
(`dist/encyclopedia/<slug>/index.html`), which carries the summary, key facts
and FAQ of a volume but no tables — for this volume or any other — so there the
52 traditions are reached through the explorer.

Nothing is framed in an iframe. The section is built from the idioms the volume
page already uses, so the light / dark theme, the language layer and the
scripture auto-linker apply to it without extra wiring. All of it is
centre-aligned.

## What was dropped as duplicate

- The document's own header and footer, palette and typeface — the site chrome
  already says all of it.
- Tables **2. Founder & Historical Origin** and **3. Sacred Texts**. They listed
  the founder, date and scriptures of six religions that the tree records in
  more detail. What they said that the tree did not (Old Testament, Hadith,
  Talmud, Vedas / Bhagavad Gita, Tripitaka / Sutras) was folded into those six
  traditions. The remaining tables are renumbered 1–3.
- Atheism and the New Age movement are compared in the tables but are not on the
  tree. Nothing was invented for them: their founder / date / text facts moved
  into their rows of table 1.
- Inside the document: the source-type badge echoed in the claim text, the
  "Occult view: … Check: …" labels repeated in the prose, and equal dates stated
  three times. Each is now said once.

## Language layer

92 dictionary entries in `src/data/i18n/dict-volumes.ts` (labels, the section
copy, 50 tradition names — Islam and Sikhism were already present) and four
pattern rules in `patterns.ts` for the generated strings: `Showing 11 of 52
traditions`, `7 branches`, `c. 2242 BC`, `c. 33 AD`. In the tree and timeline
views the section has no untranslated text node in Urdu, Hindi or Arabic. The
facts inside an opened tradition stay English, like the rest of a volume's body
text; they carry `dir="auto"` so they keep their left-to-right order on an RTL
page.

The search box folds accents, apostrophes and dashes (`quran` finds Qur’an,
`bahai` finds Bahá’í, `6:1-4` finds 6:1–4) and, in a translated reading, also
matches the tradition names and source types as they appear on screen, so a
search typed in Urdu, Hindi or Arabic finds what the reader is looking at.

One entry went into `dict-chrome.ts`: `The Interlinked`. The source-type badge
needs the plain word `Bible`, and the Interlinked Bible module's heading is two
text nodes (`The Interlinked` + `<em>Bible</em>`), so without its other half
that heading would have turned half-translated.

## Editing a tradition

Edit the node in `src/data/volumes/volume_15.ts`, mirror the change in
`src/data/volumes/volumesData.json` (the build scripts read the mirror), and if
a **name** changed, update its key in `dict-volumes.ts` and run
`npm run gen:i18n`. A new tradition needs a unique `id`, the `parent` it
branches from, signed years (negative = BC, `null` = no date in that system)
and one of the five `claimType` values.

## Verification

```bash
npm run lint && npm test && npm run verify && npm run build   # all pass
node scripts/content-regression.mjs                             # pass
node scripts/verify-scripture.mjs                               # structure clean
node scripts/harvest-i18n.mjs --missing                         # 157 unmatched, unchanged
```

`npm run test:about` fails with "Missing clean URL rewrite for /about" on a
clean checkout of the previous commit as well: the test looks for a catch-all
rewrite to `/index.html` that `vercel.json` does not contain. It is unrelated to
this change and was left as it is.
