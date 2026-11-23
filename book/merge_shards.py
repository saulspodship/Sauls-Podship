#!/usr/bin/env python3
"""Merge translation shards into book/data/i18n/<lang>/*.json.

Usage: python book/merge_shards.py <lang>

Reads every book/data/i18n/_shard_<lang>_*.json, unions them into one
dictionary, and rewrites each data file with the translated string leaves.
Untranslated leaves pass through unchanged, so the output is always complete.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import i18n_common as C


def main(argv):
    if not argv:
        raise SystemExit("usage: merge_shards.py <lang>")
    lang = argv[0]
    # real runs are written as _shard_<lang>_<n>_0.json; the <n>_<limit>
    # suffix keeps short pilot runs out of the merge
    shards = sorted(C.I18N.glob(f"_shard_{lang}_*_0.json"))
    shards += sorted(C.I18N.glob(f"_shard_{lang}_[0-9]*.json"))
    if not shards:
        raise SystemExit(f"no shards found for {lang!r} in {C.I18N}")

    table = {}
    for path in shards:
        data = C.load_json(path, {})
        table.update(data)
        print(f"  {path.name}: {len(data)} entries")

    expected = set(C.strings())
    covered = len(expected & set(table))
    print(
        f"[{lang}] shards={len(shards)} entries={len(table)} "
        f"coverage={covered}/{len(expected)} "
        f"({covered / max(len(expected), 1) * 100:.1f}%)",
        flush=True,
    )
    if covered < len(expected) * 0.5:
        raise SystemExit(
            f"refusing to write {lang}: only {covered} of {len(expected)} "
            "strings translated"
        )

    out_dir = C.I18N / lang
    for src in C.source_files():
        obj = C.load_json(src)
        out = C.walk(obj, lambda s: table.get(s, s))
        dest = out_dir / src.name
        C.dump_json(dest, out)
        print(f"  {src.name} → {dest.relative_to(C.DATA.parent)}", flush=True)

    # keep a single canonical dictionary alongside the per-file outputs
    C.dump_json(C.I18N / f"_cache_{lang}.json", table)
    print(f"[{lang}] done: {len(table)} translations", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
