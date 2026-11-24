#!/usr/bin/env python3
"""Shared helpers for the book i18n pipeline.

The book data files hold a few million characters of prose, so translation is
split into two stages that can run in parallel across CI runners:

  strings()  -> the deterministic, de-duplicated list of strings to translate
  walk()     -> map every string in a loaded JSON object through a function

Keeping the string order deterministic matters: shard N of M must contain the
same strings in every run, so a failed shard can be retried on its own.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BOOK = Path(__file__).resolve().parent
DATA = BOOK / "data"
I18N = DATA / "i18n"

# Strings that should never be sent to the translator.
SKIP_RE = re.compile(
    # '#' only means a URL fragment or an id when it has no space after it.
    # A markdown heading ("# Title", "### Analysis") does have one, and those
    # headings introduce whole sections -- matching bare '#' silently dropped
    # 318 strings and 247,000 characters from translation, which is why blocks
    # of the Urdu book were still English.
    r"^(https?://|www\.|/(?=\S)|#(?=[^\s#])|[\d\.\s%:]+\$?$)"
    # A lone Latin slug ("jesus-is-god", "abraham-journey", "NIV") is an id,
    # not prose -- but a capitalised single word is a name ("Philippines",
    # "Indonesia"), and the world map lists 175 of them. Requiring lowercase
    # keeps slugs out while letting names through.
    # (?-i:) keeps the re.I above from making the lowercase half match names.
    r"|^(?-i:[a-z0-9_\-./]+|[A-Z0-9_\-./]*[0-9_\-./][A-Za-z0-9_\-./]*)$"
    r"|^[\W\d]+$",
    re.I,
)


def should_skip(s: str) -> bool:
    s = s.strip()
    if len(s) < 2:
        return True
    if SKIP_RE.match(s):
        return True
    # single markup-ish token with no spaces
    if re.fullmatch(r"[\s<>/a-z0-9=\"'#;:,\.]+", s) and " " not in s:
        return True
    return False


def source_files():
    """The 13 tracked data files, in a stable order."""
    return [p for p in sorted(DATA.glob("*.json")) if p.parent == DATA]


def strings():
    """All unique, translatable strings across the data files, in file order.

    Order is stable because it follows the sorted file list and each object's
    natural key order, so index-based sharding is reproducible.
    """
    seen = set()
    out = []
    for src in source_files():
        obj = json.loads(src.read_text(encoding="utf-8"))

        def walk(o):
            if isinstance(o, str):
                if o not in seen and not should_skip(o):
                    seen.add(o)
                    out.append(o)
            elif isinstance(o, list):
                for x in o:
                    walk(x)
            elif isinstance(o, dict):
                for v in o.values():
                    walk(v)

        walk(obj)

    # Prose that lives in build_pdf.py rather than in the data files. It is
    # listed last so adding it never renumbers the existing shards.
    ui = BOOK / "data" / "i18n" / "_ui_prose_sources.json"
    if ui.exists():
        for s in json.loads(ui.read_text(encoding="utf-8")):
            if isinstance(s, str) and s not in seen and not should_skip(s):
                seen.add(s)
                out.append(s)
    return out


def shard(items, index, count):
    return items[index::count]


def walk(obj, fn):
    """Apply fn to every string leaf."""
    if isinstance(obj, str):
        return fn(obj)
    if isinstance(obj, list):
        return [walk(x, fn) for x in obj]
    if isinstance(obj, dict):
        return {k: walk(v, fn) for k, v in obj.items()}
    return obj


def load_json(path, default=None):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default if default is not None else {}


def dump_json(path, obj):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(
        json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def argos_translator(lang):
    """Return a cached en->lang translate callable backed by Argos."""
    try:
        import argostranslate.translate as tr
    except Exception as exc:  # pragma: no cover
        raise SystemExit(f"argostranslate not installed: {exc}") from exc

    codes = {l.code for l in tr.get_installed_languages()}
    if lang not in codes:
        raise SystemExit(
            f"no installed model for {lang!r}; installed codes = {sorted(codes)}"
        )
    return lambda s: tr.translate(s, "en", lang)
