#!/usr/bin/env python3
"""Translate book/data/*.json string values into book/data/i18n/{lang}/*.json.

Usage: python book/translate_data.py ur hi
Keeps keys/structure identical; skips URLs, numbers, pure punctuation, and
already-translated files (idempotent resume).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
OUT_ROOT = DATA / "i18n"

# Skip strings that should not be translated
SKIP_RE = re.compile(
    r"^(https?://|www\.|/|#|[\d\.\s%:]+\$?$)|"
    r"^[A-Za-z0-9_\-./]+$|"
    r"^[\W\d]+$",
    re.I,
)
# Very short tokens (labels like "Q1", "Vol") — still translate if words
MIN_LEN = 2


def should_skip(s: str) -> bool:
    s = s.strip()
    if len(s) < MIN_LEN:
        return True
    if SKIP_RE.match(s):
        return True
    # pure markup
    if re.fullmatch(r"[\s<>\/a-z0-9=\"'#;:,\.]+", s) and " " not in s:
        return True
    return False


def translate_obj(obj, tr_fn, stats):
    if isinstance(obj, str):
        if should_skip(obj):
            return obj
        key = obj
        try:
            out = tr_fn(obj)
        except Exception as e:
            print(f"  ! fail: {e} :: {obj[:60]!r}", file=sys.stderr)
            return obj
        if out and out != obj:
            stats["n"] += 1
            return out
        return obj
    if isinstance(obj, list):
        return [translate_obj(x, tr_fn, stats) for x in obj]
    if isinstance(obj, dict):
        return {k: translate_obj(v, tr_fn, stats) for k, v in obj.items()}
    return obj


def main(langs):
    import argostranslate.translate as tr
    installed = {str(l).split(" -> ")[-1] if " -> " in str(l) else str(l)
                 for l in tr.get_installed_languages()}
    # map language codes
    lang_codes = set()
    for l in tr.get_installed_languages():
        lang_codes.add(l.code)
    print("installed codes:", lang_codes)

    for lang in langs:
        if lang not in lang_codes:
            # try by name
            ok = False
            for l in tr.get_installed_languages():
                if l.code == lang or lang in str(l).lower():
                    ok = True
            if not ok:
                print(f"SKIP {lang}: not installed")
                continue
        out_dir = OUT_ROOT / lang
        out_dir.mkdir(parents=True, exist_ok=True)
        cache_path = OUT_ROOT / f"_cache_{lang}.json"
        cache = {}
        if cache_path.exists():
            cache = json.loads(cache_path.read_text())

        def make_tr(lang=lang, cache=cache):
            def _t(s: str) -> str:
                if s in cache:
                    return cache[s]
                out = tr.translate(s, "en", lang)
                cache[s] = out
                return out
            return _t

        tr_fn = make_tr()
        for src in sorted(DATA.glob("*.json")):
            if src.parent.name == "i18n":
                continue
            dest = out_dir / src.name
            # resume: if dest exists and non-empty, still re-run for missing (cache helps)
            print(f"[{lang}] {src.name} …", flush=True)
            stats = {"n": 0}
            try:
                obj = json.loads(src.read_text(encoding="utf-8"))
            except Exception as e:
                print(f"  ! load fail {e}")
                continue
            out_obj = translate_obj(obj, tr_fn, stats)
            dest.write_text(json.dumps(out_obj, ensure_ascii=False, indent=2),
                            encoding="utf-8")
            print(f"  translated {stats['n']} strings → {dest}")
            # persist cache incrementally
            cache_path.write_text(json.dumps(cache, ensure_ascii=False),
                                  encoding="utf-8")
        print(f"[{lang}] done, cache {len(cache)} entries")


if __name__ == "__main__":
    langs = sys.argv[1:] or ["ur", "hi"]
    main(langs)
