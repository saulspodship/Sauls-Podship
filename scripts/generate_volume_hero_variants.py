#!/usr/bin/env python3
"""
Generate multi-resolution responsive hero variants for all 50 volumes in Saul's Podship Scriptorium.
Produces in public/images/volumes/<slug>/:
  - hero-1920.webp / hero-1920.jpg
  - hero-1280.webp
  - hero-portrait.webp (1080x1920: entire painting at full width, centred at 34% from top, padded above/below with blurred+darkened copy of itself)
  - hero-og.jpg
"""

import os
import sys
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from make_hero_variants import make_variants

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_FILE = os.path.join(ROOT_DIR, 'src', 'data', 'volumes', 'volumesData.json')
VOLUMES_OUT = os.path.join(ROOT_DIR, 'public', 'images', 'volumes')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def process_volume(vol):
    slug = vol.get('slug')
    number = vol.get('number')
    hero = vol.get('heroImage', {})
    src_url = hero.get('src')
    
    if not slug or not src_url:
        print(f"[SKIP] Vol {number} has no slug or heroImage src.")
        return

    vol_dir = os.path.join(VOLUMES_OUT, slug)
    os.makedirs(vol_dir, exist_ok=True)
    
    source_file = os.path.join(vol_dir, 'hero-source.jpg')
    portrait_file = os.path.join(vol_dir, 'hero-portrait.webp')
    
    # Download source if missing
    if not os.path.exists(source_file) or os.path.getsize(source_file) == 0:
        try:
            req = urllib.request.Request(src_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp, open(source_file, 'wb') as out_f:
                out_f.write(resp.read())
        except Exception as e:
            print(f"[WARN] Failed to download hero for {slug}: {e}")
            # Fallback to last-supper-v2-source.jpg if download fails
            fallback = os.path.join(ROOT_DIR, 'public', 'images', 'hero', 'last-supper-v2-source.jpg')
            if os.path.exists(fallback):
                import shutil
                shutil.copy(fallback, source_file)

    # Generate variants if portrait doesn't exist
    if os.path.exists(source_file) and not os.path.exists(portrait_file):
        try:
            make_variants(source_file, vol_dir, 'hero')
            print(f"[OK] Volume {number} ({slug}) variants created.")
        except Exception as e:
            print(f"[ERROR] Failed variants for {slug}: {e}")

def main():
    if not os.path.exists(DATA_FILE):
        print(f"[ERROR] Data file not found: {DATA_FILE}")
        sys.exit(1)

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        volumes = json.load(f)

    print(f"Generating hero variants for {len(volumes)} volumes...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(process_volume, volumes))
    print("Completed volume heroes generation.")

if __name__ == '__main__':
    main()
