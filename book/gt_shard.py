#!/usr/bin/env python3
"""Translate one shard of the book data with Google Translate.

Usage: python book/gt_shard.py <lang> <index> <count> [--limit N]

Writes book/data/i18n/_shard_<lang>_<index>.json, a plain {english: target}
map, exactly like translate_shard.py so merge_shards.py consumes it unchanged.

Why this exists: the Argos models produced Urdu that was frequently wrong --
English words left mid-sentence ("LaBORS", "Gensis", "Babbel 2.0") and
grammar that did not hold together. Google Translate is markedly better on
this material, but it is not reachable from the agent sandbox, so the work
runs on a CI runner instead.

What was measured against the live endpoint, and why the code looks like this:

  * Real newlines translate perfectly, so paragraphs are sent as-is. An
    earlier version replaced them with marker tokens; Google then returned
    whole bullet lines untranslated, so the markers are gone.
  * Bold markers made Google skip the phrases inside them. They are stripped
    and not restored -- losing emphasis is better than leaving a phrase in
    English.
  * "###" survives if it is the first token on its own line, so headings keep
    their marker and the book's heading parser still recognises them.
  * Markdown links collapse to their text; the URL has no place in print.

chunk() keeps each request under the endpoint's practical size, splitting on
sentence boundaries rather than mid-sentence.
"""
from __future__ import annotations

import hashlib
import json
import random
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import i18n_common as C

ENDPOINT = "https://translate.googleapis.com/translate_a/single"
UA = "Mozilla/5.0 (compatible; SaulsPodshipBook/1.0)"
MAX_CHUNK = 1200          # characters per request, keeps the URL well under limits
CALL_DELAY = 0.2          # seconds between requests, to stay polite

# Latin-script Bible references turn into transliterated noise; pin them.
VERSE_RE = re.compile(
    r"\b(?:[1-3]\s)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|"
    r"Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|"
    r"Proverbs|Ecclesiastes|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|"
    r"Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|"
    r"Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|"
    r"Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|"
    r"Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)"
    r"\s\d+(?::\d+(?:[-\u2013]\d+)?)?"
)

# Placeholders the endpoint reliably leaves alone: bracketed digits survive
# translation intact (verified against the live endpoint).  The old marker was
# a bare private-use character, which Google mistranslated into "0" and then
# dropped the other half of, leaving stray glyphs and missing verse references
# in 614 Urdu strings.
PIN_OPEN, PIN_CLOSE = "[[", "]]"


def protect(text: str) -> tuple[str, list[str]]:
    """Prepare text for translation; return it plus the pinned references."""
    pins: list[str] = []

    def _pin(m):
        pins.append(m.group(0))
        return f"{PIN_OPEN}{len(pins) - 1}{PIN_CLOSE}"

    out = re.sub(r"\[([^\]]*)\]\(([^)]*)\)", r"\1", text)
    out = out.replace("**", "")
    # Pin only inside prose that has words around it. A string that is nothing
    # but a reference ("Acts 1:1") would otherwise reduce to a bare marker and
    # come back as "0" -- 110 of those were written to the cache before this
    # guard existed.
    leftover = re.findall(r"[A-Za-z]{3,}", VERSE_RE.sub(" ", out))
    has_prose = len(leftover) >= 2
    if has_prose:
        out = VERSE_RE.sub(_pin, out)
    return out, pins


def restore(text: str, pins: list[str]) -> str:
    """Put the pinned references back and tidy translation artefacts."""
    out = re.sub(
        r"\[\[\s*(\d+)\s*\]\]",
        lambda m: pins[int(m.group(1))] if int(m.group(1)) < len(pins) else "",
        text,
    )
    out = re.sub(r"[ \t]+\n", "\n", out)
    out = re.sub(r"\n[ \t]+", "\n", out)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


def chunk(text: str, limit: int = MAX_CHUNK):
    """Split prose on sentence boundaries, never inside a placeholder."""
    if len(text) <= limit:
        return [text]
    parts, buf = [], ""
    for sentence in re.split(r"(?<=[.!?\u06d4])\s+", text):
        while len(sentence) > limit:                 # a single huge sentence
            cut = sentence.rfind(" ", 0, limit)
            cut = cut if cut > limit // 2 else limit
            if buf:
                parts.append(buf)
                buf = ""
            parts.append(sentence[:cut])
            sentence = sentence[cut:].lstrip()
        if len(buf) + len(sentence) + 1 <= limit:
            buf = f"{buf} {sentence}".strip()
        else:
            parts.append(buf)
            buf = sentence
    if buf:
        parts.append(buf)
    return parts


def _request(text: str, lang: str, tries: int = 5) -> str:
    query = urllib.parse.urlencode(
        {"client": "gtx", "sl": "en", "tl": lang, "dt": "t", "q": text}
    )
    url = f"{ENDPOINT}?{query}"
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=45) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            # [[["seg","src",...],...], ...] -- segments concatenate in order
            return "".join(seg[0] for seg in payload[0] if seg and seg[0])
        except Exception as exc:                     # rate limit, 5xx, network
            last = exc
            time.sleep(min(2 ** attempt + random.random(), 30))
    raise RuntimeError(f"translate failed for {text[:60]!r}: {last}")


def is_garbage(value: str) -> bool:
    """True when a translation is empty punctuation or a leftover marker."""
    stripped = value.strip()
    if not stripped:
        return True
    if "[[" in stripped:          # an unresolved placeholder leaked through
        return True
    if re.fullmatch(r"[\uf8f00-9\s\d;:,.\-\u061f]*", stripped):
        return True
    return False


def translate(text: str, lang: str, cache: dict) -> str:
    key = hashlib.sha1(f"{lang}\x00{text}".encode("utf-8")).hexdigest()
    if key in cache:
        return cache[key]
    protected, pins = protect(text)
    # chunks are separate sentences, so they rejoin with a space, not a newline
    pieces = [_request(p, lang) for p in chunk(protected)]
    out = restore(" ".join(pieces), pins).strip()
    if out:
        cache[key] = out
    return out


def main(argv):
    if len(argv) < 3:
        raise SystemExit("usage: gt_shard.py <lang> <index> <count> [--limit N]")
    lang, index, count = argv[0], int(argv[1]), int(argv[2])
    limit = 0
    if "--limit" in argv:
        limit = int(argv[argv.index("--limit") + 1])
    # the workflow passes 0/empty to mean "everything", not "translate nothing"
    limit = limit or 0
    if not 0 <= index < count:
        raise SystemExit("index must be in range(count)")

    items = C.strings()
    mine = C.shard(items, index, count)
    # the filename carries the limit so a pilot run never seeds the full run
    out_path = C.I18N / f"_shard_{lang}_{index}_{limit or 0}.json"
    # Seed from this shard's own file so a re-run resumes rather than repeats.
    done = C.load_json(out_path, {})
    # drop anything a previous failed attempt wrote that is not a translation
    bad = [k for k, v in done.items() if is_garbage(v)]
    for k in bad:
        del done[k]
    if bad:
        print(f"[gt {lang}/{index}] discarded {len(bad)} bad prior entries", flush=True)
    todo = [s for s in mine if s not in done]
    if limit:
        todo = todo[:limit]
    print(
        f"[gt {lang}/{index}] total={len(items)} mine={len(mine)} "
        f"done={len(done)} todo={len(todo)}",
        flush=True,
    )

    cache = {}
    t0 = time.time()
    for n, s in enumerate(todo, 1):
        try:
            out = translate(s, lang, cache)
        except Exception as exc:
            print(f"  ! {exc}", flush=True)
            continue
        if out and out != s and not is_garbage(out):
            done[s] = out
        if n % 25 == 0:
            C.dump_json(out_path, done)
            rate = n / max(time.time() - t0, 1e-6)
            left = (len(todo) - n) / rate / 60 if rate else 0
            print(f"  {n}/{len(todo)} {rate:.1f}/s eta {left:.1f} min", flush=True)
        time.sleep(CALL_DELAY)

    C.dump_json(out_path, done)
    print(f"[gt {lang}/{index}] wrote {len(done)} entries -> {out_path}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
