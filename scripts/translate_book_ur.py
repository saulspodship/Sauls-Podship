#!/usr/bin/env python3
"""Translate the Complete Knowledge Book HTML to Urdu, page by page.

Pattern (matches existing Urdu pages):
- page['h']: HTML content translated to Urdu (structure preserved)
- page['r']: running head translated to Urdu
- page['k']: gets 'ur' token appended if missing

Usage:
  python3 scripts/translate_book_ur.py \
    --input public/complete-knowledge-book/book-ur.html \
    --output public/complete-knowledge-book/book-ur.html \
    --cache urdu_cache.json \
    --batch-size 40

Requires: pip install deep-translator
Network: needs access to Google Translate (deep-translator Google backend).
Resumable: updates --cache after every batch; re-run to continue.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from html import unescape
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except Exception:
    GoogleTranslator = None


URDU_RE = re.compile(r'[\u0600-\u06FF]')
LATIN_RE = re.compile(r'[A-Za-z]')
DATA_RE = re.compile(r'(<script type="application/json" id="data">)(\{.*?\})(</script>)', re.DOTALL)
SKIP_TAGS = {'script', 'style', 'code', 'pre'}
# Keep URLs, emails, numbers-only, and very short tokens as-is.
KEEP_RE = re.compile(r'^(https?://|www\.|[\d\s\W]+$)', re.I)


def is_mostly_urdu(text: str) -> bool:
    t = re.sub(r'\s+', ' ', text).strip()
    ur = len(URDU_RE.findall(t))
    la = len(LATIN_RE.findall(t))
    return ur > 20 and ur > la * 2


def load_cache(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding='utf-8'))
        except Exception:
            return {}
    return {}


def save_cache(path: Path, cache: dict) -> None:
    path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding='utf-8')


def translate_text(text: str, tr, cache: dict) -> str:
    s = text.strip()
    if not s:
        return text
    if KEEP_RE.match(s):
        return text
    # Preserve leading/trailing whitespace
    lead = text[: len(text) - len(text.lstrip())]
    tail = text[len(text.rstrip()) :]
    if s in cache:
        return lead + cache[s] + tail
    if is_mostly_urdu(s) or not LATIN_RE.search(s):
        cache[s] = s
        return text
    if tr is None:
        return text
    try:
        out = tr.translate(s)
        if out and isinstance(out, str):
            cache[s] = out
            return lead + out + tail
    except Exception as e:
        print(f"  [warn] translate failed: {e}", file=sys.stderr)
    return text


def translate_html(html: str, tr, cache: dict) -> str:
    if not html or not html.strip():
        return html
    # Split into tags and text nodes; translate only text nodes.
    parts = re.split(r'(<[^>]+>)', html)
    out = []
    skip_depth = 0
    for part in parts:
        if not part:
            continue
        if part.startswith('<'):
            out.append(part)
            m = re.match(r'</?\s*([a-zA-Z0-9:-]+)', part)
            if m:
                tag = m.group(1).lower()
                if tag in SKIP_TAGS:
                    if part.startswith('</'):
                        skip_depth = max(0, skip_depth - 1)
                    elif not part.endswith('/>'):
                        skip_depth += 1
            continue
        if skip_depth > 0:
            out.append(part)
            continue
        # Translate text node, preserving entities spacing
        if not LATIN_RE.search(part):
            out.append(part)
            continue
        out.append(translate_text(part, tr, cache))
    return ''.join(out)


def ensure_ur_kind(k: str) -> str:
    tokens = k.split()
    if 'ur' not in tokens:
        tokens.append('ur')
    return ' '.join(tokens)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--cache', default='urdu_cache.json')
    ap.add_argument('--batch-size', type=int, default=40)
    ap.add_argument('--sleep', type=float, default=0.2, help='seconds between API calls')
    ap.add_argument('--limit', type=int, default=0, help='max pages to translate (0=all)')
    ap.add_argument('--source', default='en')
    ap.add_argument('--target', default='ur')
    ap.add_argument('--cache-only', action='store_true', help='Only apply translations already in cache; no network calls')
    args = ap.parse_args()

    inp = Path(args.input)
    out = Path(args.output)
    cache_path = Path(args.cache)

    raw = inp.read_text(encoding='utf-8')
    m = DATA_RE.search(raw)
    if not m:
        print('ERROR: could not find JSON data script in HTML', file=sys.stderr)
        sys.exit(1)
    data = json.loads(m.group(2))
    pages = data['pages']
    cache = load_cache(cache_path)
    tr = None if args.cache_only else (GoogleTranslator(source=args.source, target=args.target) if GoogleTranslator else None)
    if not args.cache_only and tr is None:
        print('ERROR: deep-translator not available; install it or use --cache-only', file=sys.stderr)
        sys.exit(1)

    translated_pages = 0
    calls = 0
    for i, p in enumerate(pages):
        if args.limit and translated_pages >= args.limit:
            break
        h = p.get('h', '')
        r = p.get('r', '')
        text = re.sub(r'<[^>]+>', ' ', h)
        text = re.sub(r'\s+', ' ', text).strip()
        if not text:
            # still mark structural pages as ur if they have ur running head
            if r and is_mostly_urdu(r):
                p['k'] = ensure_ur_kind(p.get('k', ''))
            continue
        if is_mostly_urdu(text) and (not r or is_mostly_urdu(r) or not LATIN_RE.search(r)):
            p['k'] = ensure_ur_kind(p.get('k', ''))
            continue

        # Translate running head
        if r and not is_mostly_urdu(r) and LATIN_RE.search(r):
            p['r'] = translate_text(r, tr, cache)
            calls += 1
            time.sleep(args.sleep)

        # Translate HTML content
        new_h = translate_html(h, tr, cache)
        if new_h != h:
            p['h'] = new_h
            p['k'] = ensure_ur_kind(p.get('k', ''))
            translated_pages += 1
        else:
            # even if unchanged, ensure kind marks ur when text is urdu
            if is_mostly_urdu(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', p.get('h','')))):
                p['k'] = ensure_ur_kind(p.get('k', ''))

        if translated_pages % args.batch_size == 0 and translated_pages > 0:
            save_cache(cache_path, cache)
            print(f'[{translated_pages}] pages translated, cache={len(cache)} calls~{calls}')

    save_cache(cache_path, cache)

    new_json = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    new_raw = raw[:m.start(2)] + new_json + raw[m.end(2):]
    out.write_text(new_raw, encoding='utf-8')
    print(f'DONE: translated_pages={translated_pages} total_pages={len(pages)} cache={len(cache)} -> {out}')


if __name__ == '__main__':
    main()
