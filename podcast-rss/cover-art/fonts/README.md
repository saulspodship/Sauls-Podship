# Fonts used for Urdu cover text

`NotoNastaliqUrdu-Bold.ttf` — Noto Nastaliq Urdu (SIL Open Font License 1.1),
converted from Fontsource's woff2 (`@fontsource/noto-nastaliq-urdu`, weight 700)
so HarfBuzz/FreeType can shape it.

Latin text uses DejaVu Serif (system font).

ImageMagick *cannot* shape Urdu (it joins letters left-to-right and breaks the
Nastaliq baseline), so `../make_episode_cover.py` shapes text with
`uharfbuzz` + `freetype-py` via `../urdu_text.py`.

Regenerate any episode cover:

```bash
pip install pillow uharfbuzz freetype-py
python3 make_episode_cover.py --number 1 \
  --urdu "کیا سب کچھ پہلے سے لکھا ہے؟" --urdu-sub "تقدیر اور آزاد مرضی" \
  --emblem ep01-emblem-raw.png --out ep01-cover
# -> ep01-cover-3000x3000.jpg + ep01-cover-1400x1400.jpg
```

## All-episode build

`../make_all_covers.py` renders every cover (3000 + 1400) from `../../episodes.json`;
per-episode title line breaks and gold subtitles live in its `LAYOUT` dict.
Emblems are the gold line-art PNGs in `../emblems/`.
