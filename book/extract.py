#!/usr/bin/env python3
"""Extract every knowledge payload in the Saul's Podship repo into book/data/*.json."""
import json, re, os, sys, html as htmllib
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "data"
OUT.mkdir(parents=True, exist_ok=True)


def save(name, obj):
    p = OUT / name
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {name} ({p.stat().st_size//1024} KB)")


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def extract_balanced(text, start_idx, open_ch="{", close_ch="}"):
    """Return substring of balanced bracket group starting at start_idx (must point at open_ch)."""
    depth = 0
    in_str = None
    esc = False
    for i in range(start_idx, len(text)):
        c = text[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == in_str:
                in_str = None
            continue
        if c in "\"'`":
            in_str = c
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return text[start_idx : i + 1]
    raise ValueError("unbalanced")


def js_to_json(blob: str) -> str:
    """Convert a JS object/array literal to JSON: single-quoted strings → double-quoted, drop trailing commas."""
    out = []
    i = 0
    n = len(blob)
    while i < n:
        c = blob[i]
        if c == "'":
            j = i + 1
            body = []
            while j < n:
                if blob[j] == "\\":
                    nxt = blob[j + 1] if j + 1 < n else ""
                    if nxt == "'":
                        body.append("'")
                    elif nxt == '"':
                        body.append('\\"')
                    else:
                        body.append(blob[j : j + 2])
                    j += 2
                    continue
                if blob[j] == "'":
                    break
                ch = blob[j]
                if ch == '"':
                    body.append('\\"')
                elif ch == "\n":
                    body.append("\\n")
                elif ch == "\r":
                    body.append("\\r")
                elif ch == "\t":
                    body.append("\\t")
                else:
                    body.append(ch)
                j += 1
            out.append('"' + "".join(body) + '"')
            i = j + 1
        elif c == '"':
            j = i + 1
            body = []
            while j < n:
                if blob[j] == "\\":
                    body.append(blob[j : j + 2])
                    j += 2
                    continue
                if blob[j] == '"':
                    break
                ch = blob[j]
                if ch == "\n":
                    body.append("\\n")
                elif ch == "\r":
                    body.append("\\r")
                else:
                    body.append(ch)
                j += 1
            out.append('"' + "".join(body) + '"')
            i = j + 1
        else:
            out.append(c)
            i += 1
    s = "".join(out)
    s = re.sub(r",(\s*[}\]])", r"\1", s)
    s = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)", r'\1"\2"\3', s)
    s = re.sub(r"([{,]\s*)(\d+)(\s*:)", r'\1"\2"\3', s)
    return s


def ts_array(text, export_name):
    """Extract `export const NAME: T[] = [ ... ];` as a Python list (JS-literal tolerant)."""
    m = re.search(rf"export const {re.escape(export_name)}[^=]*=\s*\[", text)
    if not m:
        m = re.search(rf"(?:export )?const {re.escape(export_name)}[^=]*=\s*\[", text)
    if not m:
        raise KeyError(export_name)
    start = m.end() - 1
    arr = extract_balanced(text, start, "[", "]")
    return json.loads(js_to_json(arr))


def ts_object(text, export_name):
    m = re.search(rf"(?:export )?const {re.escape(export_name)}[^=]*=\s*\{{", text)
    if not m:
        raise KeyError(export_name)
    start = m.end() - 1
    obj = extract_balanced(text, start, "{", "}")
    return json.loads(js_to_json(obj))


# ----------------------------------------------------------------------------
# 1. Volumes (50)
# ----------------------------------------------------------------------------
def extract_volumes():
    vols = []
    for i in range(1, 51):
        txt = read(f"src/data/volumes/volume_{i:02d}.ts")
        m = re.search(r"export const \w+: Volume = (\{)", txt)
        if not m:
            raise RuntimeError(f"volume {i}")
        blob = extract_balanced(txt, m.start(1), "{", "}")
        vols.append(json.loads(blob))
    save("volumes.json", vols)
    return vols


# ----------------------------------------------------------------------------
# 2. Comparative Apologetics Codex (400 Q)
# ----------------------------------------------------------------------------
class CodexParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.articles = []
        self.cur = None
        self.block = None
        self.capture = None
        self.buf = []
        self.in_article = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class", "")
        if tag == "article" and "qcard" in cls:
            self.in_article = True
            self.cur = {"id": a.get("id", ""), "title": "", "blocks": []}
            self.articles.append(self.cur)
            self.block = None
            return
        if not self.in_article:
            return
        if tag == "h3" and "qtitle" in cls:
            self.capture = "title"
            self.buf = []
        elif tag == "h4" and self.cur is not None:
            self.capture = "h4"
            self.buf = []
        elif tag == "section" and "qblock" in cls:
            self.block = {"heading": "", "items": []}
            self.cur["blocks"].append(self.block)
        elif tag == "p" and self.block is not None:
            self.capture = "p"
            self.buf = []
        elif tag == "li" and self.block is not None:
            self.capture = "li"
            self.buf = []
        elif tag == "img" and self.block is not None:
            src = a.get("src", "")
            if src:
                self.block["items"].append(("img", src))

    def handle_endtag(self, tag):
        if self.capture and tag in ("h3", "h4", "p", "li"):
            text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
            if self.capture == "title" and self.cur is not None:
                self.cur["title"] = text
            elif self.capture == "h4" and self.block is not None:
                self.block["heading"] = text
            elif self.capture == "p" and self.block is not None and text:
                self.block["items"].append(("p", text))
            elif self.capture == "li" and self.block is not None and text:
                self.block["items"].append(("li", text))
            self.capture = None
            self.buf = []

    def handle_data(self, data):
        if self.capture:
            self.buf.append(data)


def extract_codex():
    txt = read("public/comparative-apologetics/codex.html")
    body_i = txt.find("<body")
    first_art = txt.find('<article class="qcard"')
    head = txt[body_i:first_art]
    m = re.search(r'class="sidebar-sub">([^<]+)', head)
    sidebar_sub = htmllib.unescape(m.group(1)) if m else ""
    m = re.search(r'id="sec-preface">(.*?)</h1>(.*?)(?=<h1 class="section-title")', head, re.S)
    preface_title = "A Note on Method"
    preface_paras = []
    leads = re.findall(r'<p class="lead">(.*?)</p>', head, re.S)
    for p in leads:
        t = re.sub(r"<[^>]+>", "", p)
        preface_paras.append(re.sub(r"\s+", " ", htmllib.unescape(t)).strip())
    sections = {}
    for rel in ("islam", "judaism", "hinduism", "sikhism"):
        m = re.search(
            rf'id="sec-{rel}">(.*?)</h1>\s*<p class="lead">(.*?)</p>',
            txt, re.S)
        if m:
            h1 = m.group(1)
            eyebrow_m = re.search(r'class="section-eyebrow">(.*?)</span>', h1, re.S)
            sub_m = re.search(r'<span class="section-sub">(.*?)</span>', h1, re.S)
            eyebrow = re.sub(r"<[^>]+>", "", eyebrow_m.group(1)).strip() if eyebrow_m else ""
            sub = re.sub(r"<[^>]+>", "", sub_m.group(1)).strip() if sub_m else ""
            t = re.sub(r'<span class="section-eyebrow">.*?</span>', "", h1, flags=re.S)
            t = re.sub(r'<span class="section-sub">.*?</span>', "", t, flags=re.S)
            title = re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "", t))).strip()
            lead = re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(2)))).strip()
            sections[rel] = {"eyebrow": eyebrow, "title": title, "sub": sub, "lead": lead}

    p = CodexParser()
    p.feed(txt)
    articles = p.articles
    for a in articles:
        a["title"] = re.sub(r"^Q\d+", "", a["title"]).strip()
        m = re.match(r"q-(islam|judaism|hinduism|sikhism)-(\d+)", a["id"])
        if m:
            a["religion"] = m.group(1)
            a["n"] = int(m.group(2))
    save(
        "codex.json",
        {"sidebar": sidebar_sub, "preface_title": preface_title,
         "preface": preface_paras, "sections": sections, "questions": articles},
    )
    return articles


# ----------------------------------------------------------------------------
# 3. Theological archive (1000+) & Tough questions (100)
# ----------------------------------------------------------------------------
def extract_theology():
    arch = read("src/data/theology/archive.ts")
    m = re.search(r"export const ARCHIVE_CATEGORIES[^=]*=\s*\[", arch)
    start = m.end() - 1
    cats = json.loads(extract_balanced(arch, start, "[", "]"))
    save("archive.json", cats)

    tough = read("src/data/theology/tough.ts")
    m = re.search(r"export const TOUGH_QUESTIONS[^=]*=\s*\[", tough)
    start = m.end() - 1
    qs = json.loads(extract_balanced(tough, start, "[", "]"))
    save("tough.json", qs)
    return cats, qs


# ----------------------------------------------------------------------------
# 4. Biblical atlas routes (maps-atlas.js)
# ----------------------------------------------------------------------------
def extract_atlas():
    txt = read("public/assets/maps-atlas.js")
    m = re.search(r"var ROUTES = (\{)", txt)
    blob = extract_balanced(txt, m.start(1), "{", "}")
    routes = json.loads(js_to_json(blob))
    order_m = re.search(r"var ORDER = (\[[^\]]*\])", txt)
    order = json.loads(js_to_json(order_m.group(1))) if order_m else list(routes.keys())
    ordered = [{"key": k, **routes[k]} for k in order if k in routes]
    save("atlas.json", ordered)
    return ordered


# ----------------------------------------------------------------------------
# 5. Prophecy lens
# ----------------------------------------------------------------------------
def extract_prophecy_lens():
    txt = read("public/assets/prophecy-lens.js")
    m = re.search(r"window\.LENS\s*=\s*(\{)", txt)
    blob = extract_balanced(txt, m.start(1), "{", "}")
    lens = json.loads(blob)
    save("prophecy_lens.json", lens)
    return lens


# ----------------------------------------------------------------------------
# 6. World faith map data
# ----------------------------------------------------------------------------
def extract_world():
    w = json.loads(read("public/cross-references/data/world.json"))
    countries = [
        {"name": c["n"], "cat": c["c"], "pct": c["pct"], "pop": c["pop"]}
        for c in w["countries"]
    ]
    out = {"worldPop": w["worldPop"], "cats": w["cats"], "countries": countries}
    save("world_faiths.json", out)
    return out


# ----------------------------------------------------------------------------
# 7. Adam → Jesus genealogy
# ----------------------------------------------------------------------------
def extract_genealogy():
    txt = read("public/family-tree/adam-to-jesus-overlap.html")
    m = re.search(r"const P\s*=\s*(\[.*?\])\s*\.map", txt, re.S)
    blob = m.group(1)

    def fix(s):
        out = []
        i = 0
        while i < len(s):
            c = s[i]
            if c == "'":
                j = i + 1
                buf = []
                while j < len(s):
                    if s[j] == "\\":
                        buf.append(s[j : j + 2])
                        j += 2
                        continue
                    if s[j] == "'":
                        break
                    buf.append(s[j])
                    j += 1
                text = "".join(buf).replace('"', '\\"')
                out.append('"' + text + '"')
                i = j + 1
            else:
                out.append(c)
                i += 1
        return "".join(out)

    people = json.loads(fix(blob))
    rows = [
        {"name": p[0], "birthAM": p[1], "deathAM": p[2],
         "approx": len(p) > 3 and bool(p[3])}
        for p in people
    ]
    body = txt[txt.find("<body") :]
    body = re.sub(r"<script.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<style.*?</style>", "", body, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", body)
    text = re.sub(r"\s+", " ", htmllib.unescape(text)).strip()
    save("genealogy.json", {"people": rows, "page_text": text})
    return rows


# ----------------------------------------------------------------------------
# 8. Music archive: singers, zaboor, episodes, videos
# ----------------------------------------------------------------------------
def extract_music():
    sing = read("src/data/singers.ts")
    dynasty = ts_array(sing, "HONORED_DIN_DYNASTY")
    pioneers = ts_array(sing, "HISTORIC_PIONEERS_AND_MAESTROS")
    veterans = ts_array(sing, "VETERANS_AND_CONTEMPORARY_SINGERS")

    zab = read("src/data/zaboorsList.ts")
    m = re.search(r"const specialSlugs[^=]*=\s*\{", zab)
    start = m.end() - 1
    special = json.loads(js_to_json(extract_balanced(zab, start, "{", "}")))
    zlist = sorted(
        ({"number": int(k), **v} for k, v in special.items()),
        key=lambda x: x["number"],
    )

    eps_txt = read("src/data/episodes.ts")
    episodes = ts_array(eps_txt, "EPISODES")
    m = re.search(r"export const PODCAST = (\{)", eps_txt)
    podcast = json.loads(js_to_json(extract_balanced(eps_txt, m.start(1), "{", "}")))

    vid_txt = read("src/data/videos.ts")
    videos = ts_array(vid_txt, "VIDEO_EPISODES")
    m = re.search(r"export const VIDEO_CHANNEL = (\{)", vid_txt)
    channel = json.loads(js_to_json(extract_balanced(vid_txt, m.start(1), "{", "}")))

    save(
        "music.json",
        {"dynasty": dynasty, "pioneers": pioneers, "veterans": veterans,
         "zaboor": zlist, "podcast": podcast, "episodes": episodes,
         "video_channel": channel, "videos": videos},
    )


# ----------------------------------------------------------------------------
# 9. Watchers atlas (HTML sections)
# ----------------------------------------------------------------------------
class WatchersParser(HTMLParser):
    """Sequentially collect all content blocks; each <h2> starts a new logical section."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.cur = None
        self.capture = None
        self.buf = []
        self._row = None
        self._pending_id = ""

    def _ensure(self):
        if self.cur is None:
            self.cur = {"id": "", "title": "", "blocks": []}
            self.sections.append(self.cur)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "section":
            sid = a.get("id", "")
            if self.cur is None:
                self.cur = {"id": sid, "title": "", "blocks": []}
                self.sections.append(self.cur)
            elif not self.cur["title"] and not self.cur["id"]:
                self.cur["id"] = sid
            else:
                self._pending_id = sid
            return
        if tag == "h2":
            if self.cur and (self.cur["title"] or self.cur["blocks"]):
                self.cur = None
            self._ensure()
            if not self.cur["id"]:
                self.cur["id"] = self._pending_id or ""
                self._pending_id = ""
            self.capture = "h2"
            self.buf = []
            return
        if self.cur is None:
            self._ensure()
        if tag in ("h3", "h4"):
            self.capture = tag
            self.buf = []
        elif tag == "p":
            self.capture = "p"
            self.buf = []
        elif tag in ("td", "th"):
            self.capture = tag
            self.buf = []
        elif tag == "tr":
            self._row = []
        elif tag == "img":
            src = a.get("src", "")
            if src and not src.startswith("data:") and "logo" not in src:
                self.cur["blocks"].append({"type": "img", "src": src,
                                           "alt": a.get("alt", "")})
        elif tag == "li":
            self.capture = "li"
            self.buf = []
        elif tag == "summary":
            self.capture = "summary"
            self.buf = []

    def handle_endtag(self, tag):
        if self.cur is None:
            return
        if self.capture == tag and tag in ("h2", "h3", "h4", "p", "li", "summary", "td", "th"):
            text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
            text = htmllib.unescape(text)
            if tag == "h2":
                if text:
                    self.cur["title"] = text
            elif tag in ("h3", "h4") and text:
                self.cur["blocks"].append({"type": tag, "text": text})
            elif tag == "summary" and text:
                self.cur["blocks"].append({"type": "summary", "text": text})
            elif tag == "p" and text:
                self.cur["blocks"].append({"type": "p", "text": text})
            elif tag == "li" and text:
                self.cur["blocks"].append({"type": "li", "text": text})
            elif tag in ("td", "th") and self._row is not None:
                self._row.append({"cell": tag, "text": text})
            self.capture = None
            self.buf = []
        if tag == "tr" and self._row is not None:
            if self._row:
                self.cur["blocks"].append({"type": "row", "cells": self._row})
            self._row = None

    def handle_data(self, data):
        if self.capture:
            self.buf.append(data)


def extract_watchers():
    txt = read("public/watchers-atlas/index.html")
    body_i = txt.find("<body")
    head = txt[body_i:txt.find("<section", body_i)]
    head = re.sub(r"<script.*?</script>", "", head, flags=re.S)
    head = re.sub(r"<style.*?</style>", "", head, flags=re.S)
    m = re.search(r"<h1[^>]*>(.*?)</h1>", head, re.S)
    title = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else "Watchers Atlas"
    title = htmllib.unescape(re.sub(r"\s+", " ", title))
    notices = []
    for nm in re.findall(r'<div class="notice[^"]*">(.*?)</div>', head, re.S):
        t = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", nm))).strip()
        notices.append(t)
    lede = ""
    lm = re.search(r'<p class="n">(.*?)</p>', head, re.S)
    if lm:
        lede = htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", lm.group(1)))).strip()

    p = WatchersParser()
    p.feed(txt[body_i:])
    if p.cur and (p.cur["title"] or p.cur["blocks"]):
        p.sections.append(p.cur)
    cleaned = []
    for s in p.sections:
        s.pop("_row", None)
        if not s["title"] and not s["blocks"]:
            continue
        if cleaned and not s["title"] and s["id"] and not cleaned[-1]["id"]:
            cleaned[-1]["id"] = s["id"]
            continue
        if cleaned and s["title"] == cleaned[-1]["title"] and not s["id"]:
            cleaned[-1]["blocks"].extend(s["blocks"])
            continue
        cleaned.append(s)
    sections = cleaned
    am = re.search(r'<script type="application/json" id="atlasAssets">(.*?)</script>', txt, re.S)
    assets = json.loads(am.group(1)) if am else {}
    fm = re.search(r"const featureNames=\[(.*?)\]", txt, re.S)
    feature_names = []
    if fm:
        feature_names = re.findall(r"'((?:[^'\\]|\\.)*)'", fm.group(1))
        feature_names = [fn.replace("\\u2019", "’").replace("\\'", "'") for fn in feature_names]
    img_dir = ROOT / "public/watchers-atlas/img"
    local_imgs = sorted(x.name for x in img_dir.iterdir()) if img_dir.exists() else []
    save("watchers.json", {"title": title, "lede": lede, "notices": notices,
                           "sections": sections, "assets": assets,
                           "feature_names": feature_names,
                           "local_images": local_imgs})
    return sections


# ----------------------------------------------------------------------------
# 10. Docs (markdown), README, AGENTS
# ----------------------------------------------------------------------------
def extract_docs():
    docs = {}
    for p in sorted((ROOT / "docs").glob("*.md")):
        docs[p.name] = p.read_text(encoding="utf-8")
    docs["README.md"] = read("README.md")
    docs["AGENTS.md"] = read("AGENTS.md")
    docs["RULES.md"] = read(".agent/rules/comparative-apologetics.md")
    save("docs.json", docs)


# ----------------------------------------------------------------------------
# 11. Apps, FAQ, About
# ----------------------------------------------------------------------------
def extract_about():
    apps = json.loads(read("src/data/podshipApps.json"))
    about = read("src/data/about.ts")
    items = []
    for qm in re.finditer(
        r'\{\s*question:\s*([\'"`])(.*?)\1,\s*answer:\s*([\'"`])(.*?)\3,\s*\}',
        about, re.S):
        q = htmllib.unescape(qm.group(2))
        a = htmllib.unescape(qm.group(4))
        if "${" in a:
            a = re.sub(r"\$\{[^}]*\}", "[our public apps]", a)
        items.append({"question": q, "answer": re.sub(r"\s+", " ", a).strip()})
    intro_m = re.search(r"export const ABOUT_DIRECTORY_INTRO =\s*\n?\s*(['\"`])(.*?)\1", about, re.S)
    intro = intro_m.group(2) if intro_m else ""

    faq_txt = read("src/data/faq.ts")
    faq_items = []
    for qm in re.finditer(
        r"\{\s*question:\s*([\'\"])(.*?)\1,\s*answer:\s*([\'\"])(.*?)\3\s*\}",
        faq_txt, re.S):
        faq_items.append({
            "question": htmllib.unescape(qm.group(2)),
            "answer": htmllib.unescape(re.sub(r"\s+", " ", qm.group(4))).strip(),
        })
    summaries = re.findall(r"summary:\s*([\'\"])(.*?)\1", faq_txt)

    save("about.json", {"apps": apps, "directory_intro": intro,
                        "about_faq": items, "faq": faq_items,
                        "faq_summaries": [s[1] for s in summaries]})


# ----------------------------------------------------------------------------
# 12. Cross-reference meta (KJV books table)
# ----------------------------------------------------------------------------
def extract_crossrefs():
    meta = json.loads(read("public/cross-references/data/meta.json"))
    save("crossrefs_meta.json", meta)
    return meta


# ----------------------------------------------------------------------------
def main():
    print("Extracting…")
    extract_volumes()
    extract_codex()
    extract_theology()
    extract_atlas()
    extract_prophecy_lens()
    extract_world()
    extract_genealogy()
    extract_music()
    extract_watchers()
    extract_docs()
    extract_about()
    extract_crossrefs()
    print("done.")


if __name__ == "__main__":
    main()
