#!/usr/bin/env python3
"""Translate one shard of the book data.

Usage: python book/translate_shard.py <lang> <index> <count>

Writes book/data/i18n/_shard_<lang>_<index>.json, a plain {english: target}
map. Shards are independent and idempotent, so a failed runner can simply be
re-run without touching the others.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import i18n_common as C


def main(argv):
    if len(argv) < 3:
        raise SystemExit("usage: translate_shard.py <lang> <index> <count>")
    lang = argv[0]
    index, count = int(argv[1]), int(argv[2])
    if not 0 <= index < count:
        raise SystemExit("index must be in range(count)")

    items = C.strings()
    mine = C.shard(items, index, count)
    out_path = C.I18N / f"_shard_{lang}_{index}.json"
    done = C.load_json(out_path, {})

    todo = [s for s in mine if s not in done]
    print(
        f"[{lang}/{index}] strings total={len(items)} mine={len(mine)} "
        f"cached={len(done)} todo={len(todo)}",
        flush=True,
    )

    tr = C.argos_translator(lang)
    t0 = time.time()
    for n, s in enumerate(todo, 1):
        try:
            out = tr(s)
        except Exception as exc:
            print(f"  ! {exc} :: {s[:50]!r}", flush=True)
            continue
        if out and out != s:
            done[s] = out
        if n % 50 == 0:
            C.dump_json(out_path, done)
            rate = n / max(time.time() - t0, 1e-6)
            left = (len(todo) - n) / rate / 60 if rate else 0
            print(f"  {n}/{len(todo)} {rate:.1f}/s eta {left:.1f} min", flush=True)

    C.dump_json(out_path, done)
    print(f"[{lang}/{index}] wrote {len(done)} entries → {out_path}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
