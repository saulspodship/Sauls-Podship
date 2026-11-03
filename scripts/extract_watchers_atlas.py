#!/usr/bin/env python3
"""Extract the embedded webp images from the Watchers Atlas HTML into real
files under public/watchers-atlas/img/ and emit a rewritten
atlasAssets JSON (data URIs -> site URLs). One-off migration tool."""
import base64, hashlib, io, json, re, sys, os
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else 'google_drive/Watchers_Atlas_Scripture_Real_Images_Fullscreen.html'
OUT_DIR = 'public/watchers-atlas/img'
URL_BASE = '/watchers-atlas/img'
FULL_MAX = 1280   # px, longest side for full-view images
THUMB_MAX = 420   # px, longest side for thumbnails
FULL_Q = 78
THUMB_Q = 72

os.makedirs(OUT_DIR, exist_ok=True)

raw = open(SRC, encoding='utf-8').read()
m = re.search(r'<script type="application/json" id="atlasAssets">(.*?)</script>', raw, re.S)
assets = json.loads(m.group(1))
print(f'entities in atlasAssets: {len(assets)} (incl. __generic__)')

saved = {}          # sha1 -> filename
total_before = 0
total_after = 0

def decode(b64):
    # Values are full "data:image/webp;base64,...." URIs.
    payload = b64.split(',', 1)[1] if b64.startswith('data:') else b64
    return base64.b64decode(payload)

def optimize(data, max_side, q):
    im = Image.open(io.BytesIO(data))
    had_alpha = im.mode in ('RGBA', 'LA', 'P')
    im = im.convert('RGBA' if had_alpha else 'RGB')
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    return buf.getvalue(), im.size

def store(data, tag, max_side, q):
    nonlocal_dummy = None
    h = hashlib.sha1(data).hexdigest()[:14]
    if h in saved:
        return saved[h], 0
    opt, size = optimize(data, max_side, q)
    name = f'{h}-{tag}.webp'
    with open(os.path.join(OUT_DIR, name), 'wb') as fh:
        fh.write(opt)
    saved[h] = name
    return name, len(opt)

new_assets = {}
for key, d in assets.items():
    nd = dict(d)
    for field, tag, max_side, q in (('t', 't', THUMB_MAX, THUMB_Q), ('f', 'f', FULL_MAX, FULL_Q)):
        b64 = d.get(field)
        if not b64:
            continue
        data = decode(b64)
        total_before += len(data)
        url = saved.get(hashlib.sha1(data).hexdigest()[:14])
        if url:
            nd[field] = f'{URL_BASE}/{url}'
            continue
        name, sz = store(data, tag, max_side, q)
        total_after += sz
        nd[field] = f'{URL_BASE}/{name}'
    new_assets[key] = nd

json.dump(new_assets, open('/tmp/watchers_assets.json', 'w'), ensure_ascii=False, separators=(',', ':'))
n_files = len(os.listdir(OUT_DIR))
print(f'unique optimized files: {n_files}')
print(f'bytes embedded before: {total_before/1e6:.1f} MB')
print(f'bytes written after:   {total_after/1e6:.1f} MB')
kinds = {}
for k, d in new_assets.items():
    if k == '__generic__': continue
    kinds[d.get('k', '?')] = kinds.get(d.get('k', '?'), 0) + 1
print('kinds:', json.dumps(kinds, indent=1))
