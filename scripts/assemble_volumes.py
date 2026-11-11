import json
import os
import re

from scripts.volumes_meta import VOLUMES_METADATA as V1_10
from scripts.volumes_meta_p2 import VOLUMES_METADATA_P2 as V11_20
from scripts.volumes_meta_p3 import VOLUMES_METADATA_P3 as V21_30
from scripts.volumes_meta_p4 import VOLUMES_METADATA_P4 as V31_40
from scripts.volumes_meta_p5 import VOLUMES_METADATA_P5 as V41_50

from scripts.authored_volumes import VOL_16_CONTENT, AUTHOR_BLOCK
from scripts.authored_volumes_p2 import VOL_22_CONTENT, VOL_30_CONTENT
from scripts.authored_volumes_p3 import (
    VOL_36_CONTENT, VOL_44_CONTENT, VOL_47_CONTENT,
    VOL_12_EXPANSION, VOL_24_EXPANSION, VOL_46_EXPANSION
)

ALL_METAS = V1_10 + V11_20 + V21_30 + V31_40 + V41_50

print(f"Total metadata records: {len(ALL_METAS)}")

with open("data/raw_categories.json", "r", encoding="utf-8") as f:
    RAW_CATEGORIES = json.load(f)

print(f"Total raw categories in json: {len(RAW_CATEGORIES)}")

# Create map from title to raw category
RAW_MAP = {}
for cat in RAW_CATEGORIES:
    title = cat.get("title", "").strip()
    RAW_MAP[title.lower()] = cat

os.makedirs("src/data/volumes", exist_ok=True)

index_imports = []
index_exports = []

def clean_overview(text):
    if not text:
        return ""
    # Remove "Last updated on..." or dates
    cleaned = re.sub(r'Last updated on [^\n\.]+(\.|\n)?', '', text, flags=re.IGNORECASE).strip()
    return cleaned

for meta in ALL_METAS:
    num = meta["number"]
    id_str = f"{num:02d}"
    slug = meta["slug"]
    title = meta["title"]
    
    # Check authored
    if num == 16:
        content = VOL_16_CONTENT
    elif num == 22:
        content = VOL_22_CONTENT
    elif num == 30:
        content = VOL_30_CONTENT
    elif num == 36:
        content = VOL_36_CONTENT
    elif num == 44:
        content = VOL_44_CONTENT
    elif num == 47:
        content = VOL_47_CONTENT
    else:
        # Match from raw categories
        raw = RAW_MAP.get(title.lower())
        if not raw:
            # Try fuzzy or partial title matching
            for k, v in RAW_MAP.items():
                if k in title.lower() or title.lower() in k:
                    raw = v
                    break
        
        if raw and "content" in raw and raw["content"]:
            raw_content = raw["content"]
            analysis = raw_content.get("analysis", "")
            if num == 12:
                analysis = analysis + VOL_12_EXPANSION
            elif num == 24:
                analysis = analysis + VOL_24_EXPANSION
            elif num == 46:
                analysis = analysis + VOL_46_EXPANSION
            else:
                if "Written by Solat Nadeem" not in analysis:
                    analysis = analysis + AUTHOR_BLOCK
            
            content = {
                "analysis": analysis,
                "tables": raw_content.get("tables", []),
                "storyPanels": raw_content.get("storyPanels", []),
                "timeline": raw_content.get("timeline", []),
                "scriptures": raw_content.get("scriptures", []),
                "interactiveMapPoints": raw_content.get("interactiveMapPoints", []),
                "characterProfiles": raw_content.get("characterProfiles", []),
                "maps": raw_content.get("maps", [])
            }
        else:
            print(f"Warning: No raw content found for Volume {num}: {title}")
            content = {
                "analysis": f"### **I. Biblical & Historical Analysis of {title}**\n\n{meta['summary']}\n\n" + AUTHOR_BLOCK,
                "tables": [],
                "storyPanels": [],
                "timeline": [],
                "scriptures": [],
                "interactiveMapPoints": [],
                "characterProfiles": [],
                "maps": []
            }
    
    # Remove unsupported legacy chart placeholders from generated analysis.
    if isinstance(content.get("analysis"), str):
        content["analysis"] = re.sub(r'\[\[CHART:[\s\S]*?\]\]', '', content["analysis"])
        content["analysis"] = re.sub(r'\n{3,}', '\n\n', content["analysis"]).strip()

    unsplash_id = meta.get("unsplashId", "1507608869274-d3177c8bb4c7")
    artwork = meta.get("artwork", f"Historical sacred illustration for {title}")
    
    volume_obj = {
        "id": id_str,
        "number": num,
        "slug": slug,
        "title": title,
        "subtitle": meta.get("subtitle", ""),
        "overview": clean_overview(meta.get("overview", "")),
        "category": meta.get("category", "scholarly"),
        "lastUpdated": "2026-09-06",
        "heroImage": {
            "src": f"https://images.unsplash.com/photo-{unsplash_id}?auto=format&fit=crop&w=1600&q=80",
            "alt": title,
            "credit": artwork
        },
        "cardImage": {
            "src": f"https://images.unsplash.com/photo-{unsplash_id}?auto=format&fit=crop&w=800&q=80",
            "alt": title
        },
        "metaDescription": meta.get("metaDescription", ""),
        "keywords": meta.get("keywords", []),
        "articleLink": meta.get("articleLink") or "",
        "youtubeLink": meta.get("youtubeLink") or "",
        "youtubeStatus": meta.get("youtubeStatus", "scheduled"),
        "youtubePublishDate": meta.get("youtubePublishDate", "2026-10-01"),
        "relatedVolumes": meta.get("relatedVolumes", []),
        "summary": meta.get("summary", ""),
        "keyFacts": meta.get("keyFacts", []),
        "faq": meta.get("faq", []),
        "content": content,
        "featured": meta.get("featured", False)
    }
    
    file_basename = f"volume_{id_str}"
    file_path = f"src/data/volumes/{file_basename}.ts"
    
    ts_code = f"""/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {{ Volume }} from '../../../types';

export const {file_basename}: Volume = {json.dumps(volume_obj, indent=2, ensure_ascii=False)};

export default {file_basename};
"""
    with open(file_path, "w", encoding="utf-8") as vf:
        vf.write(ts_code)
    
    index_imports.append(f"import {{ {file_basename} }} from './{file_basename}';")
    index_exports.append(f"  {file_basename},")

# Now generate src/data/volumes/index.ts
index_ts_code = f"""/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {{ Volume }} from '../../../types';

{chr(10).join(index_imports)}

export const VOLUMES: Volume[] = [
{chr(10).join(index_exports)}
];

export function getVolumeBySlug(slug: string): Volume | undefined {{
  return VOLUMES.find(v => v.slug.toLowerCase() === slug.toLowerCase());
}}

export function getVolumeById(id: string): Volume | undefined {{
  const cleanId = id.padStart(2, '0');
  return VOLUMES.find(v => v.id === cleanId);
}}

export function getVolumeByNumber(num: number): Volume | undefined {{
  return VOLUMES.find(v => v.number === num);
}}

export default VOLUMES;
"""

with open("src/data/volumes/index.ts", "w", encoding="utf-8") as f:
    f.write(index_ts_code)

print("Successfully generated all 50 volume files and index.ts!")
