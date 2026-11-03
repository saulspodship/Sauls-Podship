#!/usr/bin/env python3
"""Build public/watchers-atlas/index.html from the source Drive HTML.

- Keeps every word of the original study content (hero, tables, notices, details).
- Fixes the table alignment bug: 15 tables had one extra image <td> per row with
  no matching header <th>; a leading "Depiction" header column is inserted.
- Re-themes the document to the Saul's Podship palette (wine #4A152C /
  gold #D4AF37 / cream #F8F4E3, Merriweather + Inter + EB Garamond).
- Rewrites atlasAssets data URIs to optimized files under
  /watchers-atlas/img/ (produced by extract_watchers_atlas.py).
- Strips Cloudflare beacon / Rocket Loader junk.
One-off migration tool."""
import json, re, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else 'google_drive/Watchers_Atlas_Scripture_Real_Images_Fullscreen.html'
OUT = 'public/watchers-atlas/index.html'
ASSETS_JSON = '/tmp/watchers_assets.json'

# ---------- 1. main content ----------
# Preferred source: the original Drive HTML (pass its path as argv[1]). When it
# is unavailable (e.g. a fresh sandbox), rebuild from the previously generated
# module — every pass below is idempotent, so repeated builds are safe.
if not os.path.isfile(SRC):
    print(f'source {SRC!r} not found; rebuilding from the existing module {OUT!r}')
    SRC = OUT
raw = open(SRC, encoding='utf-8').read()

main = raw[raw.find('<main>') + len('<main>'):raw.find('</main>')]

# Demote the duplicate mid-document <h1> (the hero keeps the single h1).
main = main.replace("<h1>Watchers of Enoch and the world's gods</h1>",
                    '<h2 class="part-title">Watchers of Enoch and the world&rsquo;s gods</h2>')

# ---------- 2. table alignment repair ----------
def fix_table(m: re.Match) -> str:
    tbl = m.group(0)
    if 'data-image-cell' not in tbl:
        return tbl
    thead = re.search(r'<thead>\s*<tr>(.*?)</tr>\s*</thead>', tbl, re.S)
    if not thead:
        return tbl
    n_th = len(re.findall(r'<th[ >]', thead.group(1)))
    body_rows = [r for r in re.findall(r'<tr>(.*?)</tr>', tbl, re.S) if '<td' in r]
    td_counts = {len(re.findall(r'<td[ >]', r)) for r in body_rows}
    if td_counts == {n_th + 1}:
        tbl = tbl.replace('<thead><tr>', '<thead><tr><th class="img-col" scope="col">Depiction</th>', 1)
    return tbl

main, n_tables = re.subn(r'<table.*?</table>', fix_table, main, flags=re.S)

# ---------- 3. validate every table (span-aware) ----------
from collections import defaultdict

def span_attr(attrs: str, name: str) -> int:
    m = re.search(name + r'="(\d+)"', attrs)
    return int(m.group(1)) if m else 1

problems = []
for i, tbl in enumerate(re.findall(r'<table.*?</table>', main, re.S)):
    thead = re.search(r'<thead>\s*<tr>(.*?)</tr>\s*</thead>', tbl, re.S)
    if not thead:
        continue
    n_th = len(re.findall(r'<th[ >]', thead.group(1)))
    pending: dict[int, int] = defaultdict(int)
    body_rows = [m.group(1) for m in re.finditer(r'<tr>(.*?)</tr>', tbl, re.S) if '<td' in m.group(1)]
    for ri, r in enumerate(body_rows):
        eff = pending.pop(ri, 0)
        for td in re.finditer(r'<td([^>]*)>', r):
            attrs = td.group(1)
            cs, rs = span_attr(attrs, 'colspan'), span_attr(attrs, 'rowspan')
            eff += cs
            for k in range(1, rs):
                pending[ri + k] += cs
        if eff != n_th:
            problems.append((i, n_th, eff, r[:90]))
if problems:
    for p in problems:
        print('ALIGNMENT PROBLEM', p, file=sys.stderr)
    sys.exit(1)
print(f'tables processed: {n_tables}, all row/column counts verified')

# ---------- 3b. structure passes ----------
import html as _html

W_BLOCK = re.compile(r'<div class="w">\s*<table.*?</table>\s*</div>', re.S)
IMG_TD = '<td class="image-slot" data-image-cell></td>'
DEPICTION_TH = '<th class="img-col" scope="col">Depiction</th>'
# Tables about claims/views/arguments/places: not beings -> no depiction column.
SUPPRESS_UNDER = (
    'Why the "gods" looked righteous',
    'What were these entities, really?',
    'Where their power came from',
    'Lost technology claims',
    'Lost, sunken or disputed',
)
ROWSPAN_UNDER = ('Lucifer: names and titles',)

def heading_for(source: str, start: int) -> str:
    h = max(source.rfind('<h2', 0, start), source.rfind('<h3', 0, start))
    if h < 0:
        return ''
    e = source.find('</h', h)
    return re.sub(r'<[^>]+>', '', source[source.find('>', h) + 1:e]).strip()

def add_labels(block: str) -> str:
    headers = [re.sub(r'<[^>]+>', '', t).strip()
               for t in re.findall(r'<th[^>]*>(.*?)</th>', re.search(r'<thead>.*?</thead>', block, re.S).group(0), re.S)]
    def label_row(m: re.Match) -> str:
        tr, idx = m.group(0), 0
        def tag_td(td: re.Match) -> str:
            nonlocal idx
            tag, i = td.group(0), idx
            idx += 1
            if 'image-slot' in tag or 'data-label=' in tag or i >= len(headers):
                return tag
            return tag[:-1] + f' data-label="{_html.escape(headers[i], quote=True)}">'
        return re.sub(r'<td[^>]*>', tag_td, tr)
    return re.sub(r'<tr>.*?</tr>', label_row, block, flags=re.S)

def structure_pass(source: str) -> str:
    def fix(m: re.Match) -> str:
        block = m.group(0)
        h = heading_for(source, m.start())
        n_img = block.count(IMG_TD)
        if any(h.startswith(p) for p in SUPPRESS_UNDER) and n_img:
            block = block.replace(IMG_TD, '').replace(DEPICTION_TH, '')
        elif any(h.startswith(p) for p in ROWSPAN_UNDER) and n_img > 1:
            block = block.replace(DEPICTION_TH, DEPICTION_TH.replace('>', f' rowspan="{n_img}">', 1), 1)
            block = block.replace(IMG_TD, IMG_TD.replace('>', f' rowspan="{n_img}">', 1), 1)
            block = block.replace(IMG_TD, '')
        elif '<b>Strength of parallel</b>' in block:
            m = re.search(r'<tr>(?:(?!</tr>).)*?<b>Strength of parallel</b>(?:(?!</tr>).)*?</tr>', block, re.S)
            if m:
                row = m.group(0).replace(IMG_TD, '', 1)
                row = row.replace('<td', '<td colspan="2"', 1)
                block = block.replace(m.group(0), row, 1)
        return add_labels(block)
    return W_BLOCK.sub(fix, source)

# ---------- 3c. bible.com reference links ----------
ALIASES = [
    ('1 Samuel', '1SA'), ('2 Samuel', '2SA'), ('1 Sam', '1SA'), ('2 Sam', '2SA'),
    ('1 Kings', '1KI'), ('2 Kings', '2KI'), ('1 Kgs', '1KI'), ('2 Kgs', '2KI'),
    ('1 Chronicles', '1CH'), ('2 Chronicles', '2CH'), ('1 Chr', '1CH'), ('2 Chr', '2CH'),
    ('1 Corinthians', '1CO'), ('2 Corinthians', '2CO'), ('1 Cor', '1CO'), ('2 Cor', '2CO'),
    ('1 Thessalonians', '1TH'), ('2 Thessalonians', '2TH'), ('1 Thess', '1TH'), ('2 Thess', '2TH'),
    ('1 Timothy', '1TI'), ('2 Timothy', '2TI'), ('1 Tim', '1TI'), ('2 Tim', '2TI'),
    ('1 Peter', '1PE'), ('2 Peter', '2PE'), ('1 Pet', '1PE'), ('2 Pet', '2PE'),
    ('1 John', '1JN'), ('2 John', '2JN'), ('3 John', '3JN'),
    ('Genesis', 'GEN'), ('Exodus', 'EXO'), ('Exod', 'EXO'), ('Leviticus', 'LEV'), ('Numbers', 'NUM'),
    ('Deuteronomy', 'DEU'), ('Joshua', 'JOS'), ('Josh', 'JOS'), ('Judges', 'JDG'), ('Judg', 'JDG'),
    ('Ruth', 'RUT'), ('Ezra', 'EZR'), ('Nehemiah', 'NEH'), ('Neh', 'NEH'), ('Esther', 'EST'),
    ('Job', 'JOB'), ('Psalms', 'PSA'), ('Psalm', 'PSA'), ('Proverbs', 'PRO'), ('Prov', 'PRO'),
    ('Ecclesiastes', 'ECC'), ('Eccl', 'ECC'), ('Isaiah', 'ISA'), ('Isa', 'ISA'),
    ('Jeremiah', 'JER'), ('Jer', 'JER'), ('Lamentations', 'LAM'), ('Ezekiel', 'EZK'), ('Ezek', 'EZK'),
    ('Daniel', 'DAN'), ('Dan', 'DAN'), ('Hosea', 'HOS'), ('Hos', 'HOS'), ('Joel', 'JOL'),
    ('Amos', 'AMO'), ('Obadiah', 'OBA'), ('Jonah', 'JON'), ('Micah', 'MIC'), ('Mic', 'MIC'),
    ('Nahum', 'NAM'), ('Habakkuk', 'HAB'), ('Zephaniah', 'ZEP'), ('Haggai', 'HAG'),
    ('Zechariah', 'ZEC'), ('Zech', 'ZEC'), ('Malachi', 'MAL'), ('Matthew', 'MAT'), ('Matt', 'MAT'),
    ('Mark', 'MRK'), ('Luke', 'LUK'), ('John', 'JHN'), ('Acts', 'ACT'), ('Romans', 'ROM'),
    ('Rom', 'ROM'), ('Galatians', 'GAL'), ('Gal', 'GAL'), ('Ephesians', 'EPH'), ('Eph', 'EPH'),
    ('Philippians', 'PHP'), ('Phil', 'PHP'), ('Colossians', 'COL'), ('Col', 'COL'),
    ('Titus', 'TIT'), ('Philemon', 'PHM'), ('Phlm', 'PHM'), ('Hebrews', 'HEB'), ('Heb', 'HEB'),
    ('James', 'JAS'), ('Jas', 'JAS'), ('Jude', 'JUD'), ('Revelation', 'REV'), ('Rev', 'REV'),
    ('Ps', 'PSA'), ('Pss', 'PSA'), ('Ex', 'EXO'), ('Lev', 'LEV'), ('Num', 'NUM'), ('Deut', 'DEU'),
]
ALIASES.sort(key=lambda a: -len(a[0]))
SINGLE_CHAPTER = {'JUD', 'PHM', 'OBA', '2JN', '3JN'}
ALIAS_RE = '|'.join(re.escape(a) for a, _ in ALIASES)
USFM = dict(ALIASES)
DASH = r'(?:[–—-]|&ndash;)'
RFULL = re.compile(rf'\b(?P<book>{ALIAS_RE})\.?\s?(?![A-Za-z])(?P<c>\d{{1,3}})(?:(?::(?P<v>\d{{1,3}})(?:\s*{DASH}\s*(?P<v2>\d{{1,3}}))?)|(?:\s*{DASH}\s*(?P<c2>\d{{1,3}})\b))?')
RBARE = re.compile(rf'(?P<bc>\d{{1,3}}):(?P<bv>\d{{1,3}})(?:\s*{DASH}\s*(?P<bv2>\d{{1,3}}))?')
GAP = re.compile(r'[\s;,.\u2013\u2014-]*')
BIBLE_BASE = 'https://www.bible.com/bible/1/'

def ref_href(usfm: str, c: str, v: str | None, v2: str | None) -> str:
    if usfm in SINGLE_CHAPTER and not v:
        return f'{BIBLE_BASE}{usfm}.1.{c}'
    if v:
        return f'{BIBLE_BASE}{usfm}.{c}.{v}' + (f'-{v2}' if v2 else '')
    return f'{BIBLE_BASE}{usfm}.{c}'

def link_refs(source: str) -> str:
    parts = re.split(r'(<a\b[^>]*>.*?</a>)', source, flags=re.S)
    for pi in range(0, len(parts), 2):  # even indexes are outside existing anchors
        text, out, p, last = parts[pi], [], 0, None
        while p < len(text):
            mb, mi = RFULL.search(text, p), RBARE.search(text, p)
            if mb and (not mi or mb.start() <= mi.start()):
                usfm = USFM[mb.group('book')]
                c = mb.group('c')
                if usfm == 'DAN' and c == '14':  # deuterocanonical; not on bible.com KJV
                    out.append(text[p:mb.end()]); last, p = None, mb.end(); continue
                ref = text[mb.start():mb.end()]
                a = f'<a class="bref" href="{ref_href(usfm, c, mb.group("v"), mb.group("v2"))}" target="_blank" rel="noopener" title="Open {ref.strip()} on Bible.com">{ref}</a>'
                out.append(text[p:mb.start()] + a); last, p = (usfm, mb.end()), mb.end()
            elif mi:
                if last and GAP.fullmatch(text[last[1]:mi.start()] or ' '):
                    ref = text[mi.start():mi.end()]
                    a = f'<a class="bref" href="{ref_href(last[0], mi.group("bc"), mi.group("bv"), mi.group("bv2"))}" target="_blank" rel="noopener" title="Open {ref.strip()} on Bible.com">{ref}</a>'
                    out.append(text[p:mi.start()] + a); last, p = (last[0], mi.end()), mi.end()
                else:
                    out.append(text[p:mi.end()]); p = mi.end()
            else:
                out.append(text[p:]); break
        parts[pi] = ''.join(out)
    return ''.join(parts)

main = structure_pass(main)
main = link_refs(main)

# ---------- 3d. edition notice ----------
main = re.sub(
    r'<div class="notice changed">.*?</div>',
    '<div class="notice changed"><strong>About this Saul\u2019s Podship edition:</strong> every profile now carries '
    'its own distinct artwork \u2014 sourced historical images where they exist, and new text-guided reconstructions, '
    'strictly limited to the forms the Bible or 1 Enoch describes, where they do not. Concept and claim rows carry no '
    'images at all, so no picture pretends to be evidence. All verse references open at Bible.com.</div>',
    main, count=1, flags=re.S)

# ---------- 4. assets ----------
if os.path.isfile(ASSETS_JSON):
    assets = open(ASSETS_JSON, encoding='utf-8').read()
else:
    print(f'{ASSETS_JSON} missing; reading atlasAssets from the built module')
    assets = re.search(r'<script type="application/json" id="atlasAssets">([\s\S]*?)</script>', raw).group(1)
assert '</script' not in assets.lower()

# ---------- 4b. AI reconstruction overrides ----------
# scripts/watchers_ai_images.json assigns each duplicated/generic key its own
# commissioned, text-guided reconstruction. Files are applied only when present,
# so the remaining batches can be generated and simply rebuilt later.
import os
OVERRIDES = json.load(open('scripts/watchers_ai_images.json', encoding='utf-8'))
A_OBJ = json.loads(assets)
APPLIED = set()
PENDING = set()
for e in OVERRIDES:
    if not os.path.isfile('public' + e['file']):
        PENDING.add(e['file'])
        continue
    for key in e['keys']:
        if key in A_OBJ:
            A_OBJ[key] = {'t': e['file'], 'f': e['file'], 'ti': e['ti'], 'c': e['c'],
                          'l': e['l'], 'p': e['p'], 'd': e['d'], 's': e['s'], 'k': e['k']}
            APPLIED.add(key)
# Keys that fall back to the generic placeholder but belong to a sourced row:
# point them at that row's real image instead (same subject, honest depiction).
FALLBACK_FOR = {'Ashtoreth': 'Asherah / Ashtoreth (Astarte)', 'Astarte': 'Asherah / Ashtoreth (Astarte)'}
for k, src in FALLBACK_FOR.items():
    if k in A_OBJ and src in A_OBJ:
        A_OBJ[k] = dict(A_OBJ[src])
        APPLIED.add(k)
assets = json.dumps(A_OBJ, ensure_ascii=False, separators=(',', ':'))
assert '</script' not in assets.lower()
print(f'AI overrides applied to {len(APPLIED)} asset keys; {len(PENDING)} image files still pending generation')

# ---------- 5. app script (adapted from the source document) ----------
APP_JS = r"""
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const A = JSON.parse($('#atlasAssets').textContent);
  const generic = A['__generic__'];
  const assetFor = name => A[name] || generic;
  const shortKind = k => k.startsWith('Text') ? 'Text-guided AI' : k.startsWith('Representative') ? 'Representative' : 'Real image';
  const badgeClass = k => k.startsWith('Text') ? 'badge-ai' : k.startsWith('Representative') ? 'badge-rep' : 'badge-real';
  const noteFor = name => {
    const d = assetFor(name);
    if (d.s) return 'Textual basis: ' + d.s + '. ' + (d.d || '');
    if (d.k === 'Representative real image') return d.d || 'No specific sourced image; representative real artwork only.';
    if (d.k.startsWith('Text')) return d.d || 'Text-guided reconstruction, limited to the stated features.';
    return d.d || 'Real sourced depiction. The cited text gives no physical description, so this is not a literal portrait.';
  };

  /* Embedded in the volume page via AutoFrame? Then the iframe is content-height
     and position:fixed would anchor to a 10,000px-tall box far off-screen, so the
     viewer is placed as an absolute band that tracks the host page's viewport
     (same-origin, like the AutoFrame height fit). */
  const embedded = (() => { try { return !!window.frameElement; } catch (_) { return false; } })();
  const parentWin = embedded ? window.parent : null;

  /* ---------------- Full-screen viewer ---------------- */
  const viewer = document.createElement('div');
  viewer.id = 'imageViewer';
  viewer.setAttribute('role','dialog');
  viewer.setAttribute('aria-modal','true');
  viewer.setAttribute('aria-label','Full-screen image viewer');
  if (embedded) viewer.classList.add('embedded');
  viewer.innerHTML = `
    <div class="viewer-head">
      <div class="viewer-heading"><div class="viewer-title"></div><span class="badge viewer-kind"></span></div>
      <div class="viewer-head-actions">
        <button class="viewer-btn" type="button" data-act="prev" title="Previous image (←)">&lsaquo; Prev</button>
        <button class="viewer-btn" type="button" data-act="next" title="Next image (→)">Next &rsaquo;</button>
        <button class="viewer-btn viewer-full-btn" type="button" data-act="full" title="Toggle browser full screen (F)">&#9974; Full screen</button>
        <button class="viewer-btn viewer-close" type="button" data-act="close" title="Close (Esc)">&#10005; Close</button>
      </div>
    </div>
    <div class="viewer-stage"><img id="viewerImage" alt=""></div>
    <div class="viewer-foot">
      <div class="viewer-caption"></div>
      <div class="viewer-scripture"></div>
      <div class="viewer-credit"></div>
      <div class="viewer-actions">
        <button class="viewer-btn" type="button" data-act="zoomout" title="Zoom out (-)">&minus;</button>
        <button class="viewer-btn" type="button" data-act="reset" title="Fit to screen (0)">Fit</button>
        <button class="viewer-btn" type="button" data-act="zoomin" title="Zoom in (+)">+</button>
        <span class="zoom-label">100%</span>
        <a class="viewer-btn viewer-source" target="_blank" rel="noopener">Source page &nearr;</a>
        <a class="viewer-btn viewer-download" download>Download image &darr;</a>
        <span class="viewer-hint">Drag to pan &middot; wheel / double-click to zoom &middot; &larr; &rarr; to browse</span>
      </div>
    </div>`;
  document.body.append(viewer);

  const stage = $('.viewer-stage', viewer);
  const viewerImg = $('#viewerImage', viewer);
  const vTitle = $('.viewer-title', viewer);
  const vKind = $('.viewer-kind', viewer);
  const vCaption = $('.viewer-caption', viewer);
  const vScripture = $('.viewer-scripture', viewer);
  const vCredit = $('.viewer-credit', viewer);
  const vSource = $('.viewer-source', viewer);
  const vDownload = $('.viewer-download', viewer);
  const zoomLabel = $('.zoom-label', viewer);

  let currentName = '', scale = 1, panX = 0, panY = 0, dragging = false, sx = 0, sy = 0, previousFocus = null;
  let viewerList = [];

  const apply = () => { viewerImg.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`; zoomLabel.textContent = Math.round(scale*100) + '%'; };
  const resetZoom = () => { scale = 1; panX = 0; panY = 0; apply(); };
  const zoomBy = f => { scale = Math.min(8, Math.max(.25, scale * f)); apply(); };

  /* Keep the viewer pinned to the host page's visible band while it is open. */
  let placeScheduled = false;
  function placeViewer(){
    if (!embedded) return;
    try {
      const rect = window.frameElement.getBoundingClientRect();
      const top = Math.max(0, parentWin.scrollY - rect.top);
      viewer.style.top = top + 'px';
      viewer.style.height = parentWin.innerHeight + 'px';
    } catch (_) { /* cross-origin guard */ }
  }
  function schedulePlace(){
    if (placeScheduled || !embedded || !viewer.classList.contains('open')) return;
    placeScheduled = true;
    parentWin.requestAnimationFrame(() => { placeScheduled = false; placeViewer(); });
  }
  if (embedded) {
    parentWin.addEventListener('scroll', schedulePlace, { passive: true });
    parentWin.addEventListener('resize', schedulePlace);
  }

  function openViewer(name){
    const d = assetFor(name);
    currentName = name;
    previousFocus = document.activeElement;
    vTitle.textContent = name;
    vKind.textContent = d.k;
    vKind.className = 'badge viewer-kind ' + badgeClass(d.k);
    vCaption.textContent = noteFor(name);
    vScripture.textContent = d.s ? 'Scriptural features used: ' + d.s + '.' : 'No physical features are specified in the cited text.';
    vCredit.textContent = (d.c ? 'Credit: ' + d.c : '') + (d.l ? ' · Licence: ' + d.l : '') + (d.ti && d.ti !== 'Text-guided reconstruction' ? ' · ' + d.ti : '');
    viewerImg.src = d.f || d.t;
    viewerImg.alt = name + ' — ' + d.k;
    if (d.p) { vSource.href = d.p; vSource.hidden = false; } else { vSource.hidden = true; }
    const safe = name.replace(/[^a-z0-9\-_]+/gi,'_').slice(0,60) || 'image';
    vDownload.href = d.f || d.t;
    vDownload.setAttribute('download', safe + '.webp');
    resetZoom();
    viewer.classList.add('open');
    document.body.classList.add('viewer-open');
    if (embedded) placeViewer();
    $('.viewer-close', viewer).focus();
  }
  function closeViewer(){
    if (document.fullscreenElement) document.exitFullscreen?.().catch(()=>{});
    viewer.classList.remove('open');
    document.body.classList.remove('viewer-open');
    viewerImg.removeAttribute('src');
    if (previousFocus?.focus) previousFocus.focus();
  }
  function navigate(delta){
    if (!viewerList.length) return;
    let i = viewerList.indexOf(currentName);
    if (i < 0) i = 0;
    i = (i + delta + viewerList.length) % viewerList.length;
    openViewer(viewerList[i]);
  }
  async function toggleFullscreen(){
    try {
      if (!document.fullscreenElement) await viewer.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch(_) {}
  }
  if (!document.fullscreenEnabled) $('.viewer-full-btn', viewer).hidden = true;
  viewer.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'close') closeViewer();
    else if (act === 'prev') navigate(-1);
    else if (act === 'next') navigate(1);
    else if (act === 'full') toggleFullscreen();
    else if (act === 'zoomin') zoomBy(1.3);
    else if (act === 'zoomout') zoomBy(1/1.3);
    else if (act === 'reset') resetZoom();
  });
  stage.addEventListener('wheel', e => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1/1.15); }, {passive:false});
  viewerImg.addEventListener('dblclick', e => { e.preventDefault(); if (scale > 1.05) resetZoom(); else zoomBy(2); });
  viewerImg.addEventListener('dragstart', e => e.preventDefault());
  stage.addEventListener('pointerdown', e => { if (e.button !== 0) return; dragging = true; sx = e.clientX - panX; sy = e.clientY - panY; stage.classList.add('dragging'); stage.setPointerCapture?.(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!dragging) return; panX = e.clientX - sx; panY = e.clientY - sy; apply(); });
  const endDrag = () => { dragging = false; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', e => {
    if (!viewer.classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowRight') navigate(1);
    else if (e.key === 'ArrowLeft') navigate(-1);
    else if (e.key === '+' || e.key === '=') zoomBy(1.3);
    else if (e.key === '-') zoomBy(1/1.3);
    else if (e.key === '0') resetZoom();
    else if (e.key.toLowerCase() === 'f' && document.fullscreenEnabled) toggleFullscreen();
  });

  /* ---------------- Profiles ---------------- */
  const profiles = [];
  function makeProfile(cell, name, append=false){
    if (!append) cell.innerHTML = '';
    const d = assetFor(name);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'profile-button';
    btn.title = 'Open ' + name + ' full screen';
    btn.setAttribute('aria-label','Open full-screen image for ' + name);
    const circle = document.createElement('span'); circle.className = 'profile-circle';
    const img = document.createElement('img'); img.className = 'profile-thumb'; img.src = d.t; img.alt = name + ' — ' + d.k; img.loading = 'lazy';
    circle.append(img);
    const label = document.createElement('span'); label.className = 'profile-label'; label.textContent = name;
    const meta = document.createElement('span'); meta.className = 'profile-credit'; meta.textContent = shortKind(d.k);
    btn.append(circle, label, meta);
    btn.addEventListener('click', () => openViewer(name));
    cell.append(btn);
    const p = {name, d, el:btn};
    profiles.push(p);
    return p;
  }

  const splitNames = {
    'Asael / Penemue':['Asael','Penemue'],
    'Ramiel, Danel':['Ramiel','Danel'],
    'Garuda and Nagas':['Garuda','Nagas'],
    'Surya / Yama':['Surya','Yama'],
    'Sobek, Khnum, Hathor and Apis':['Sobek','Khnum','Hathor','Apis'],
    'Bel (Marduk) and Nebo':['Bel / Marduk','Nebo / Nabu'],
    'Zeus and Hermes (at Lystra)':['Zeus','Hermes'],
    'Baal-zebub / Beelzebul':['Baal-zebub','Beelzebul'],
    'Asherah / Ashtoreth (Astarte)':['Asherah','Ashtoreth','Astarte'],
    'Gad and Meni':['Gad','Meni'],
    'Naphil, Naphidim, Eljo':['Naphil','Naphidim','Eljo'],
    'Nephilim, Rephaim, Anakim':['Nephilim','Rephaim','Anakim']
  };
  const individualNames = name => splitNames[name] || [name];

  $$('tbody tr').forEach(tr => {
    const cell = tr.querySelector('[data-image-cell]');
    const nameCell = [...tr.querySelectorAll('td')].find(td => !td.hasAttribute('data-image-cell'));
    const name = nameCell?.textContent?.trim();
    if (!cell || !name) return;
    individualNames(name).forEach((part,i) => makeProfile(cell, part, i > 0));
  });

  const featureNames=[
    'Semyaza','Azazel','Araki / Arakiba','Ramel / Rameel','Kokabiel','Tamiel','Ramiel','Danel','Ezeqel / Ezeqeel','Baraqel','Asael','Armaros','Penemue',
    'Uriel','Raphael','Raguel','Michael','Gabriel','Saraqael / Sariel','Remiel','Phanuel',
    'Seraphim','Cherubim','Ophanim','Four Living Creatures',
    'Nephilim','Naphil','Naphidim','Eljo','Evil spirits of the giants','Leviathan','Behemoth',
    'Daniel\u2019s Four Beasts','Watcher Descent Scene','Revelation 9 Locusts',
    'Anubis','Thoth','Horus','Shiva','Ganesha','Narasimha','Garuda','Zeus','Odin'
  ];
  const gallery = $('#featuredGallery');
  if (gallery){
    gallery.innerHTML = '';
    featureNames.forEach(name => {
      const d = assetFor(name);
      const card = document.createElement('article'); card.className = 'entity-card';
      const photo = document.createElement('div'); photo.className = 'card-photo'; photo.setAttribute('role','button'); photo.tabIndex = 0;
      photo.title = 'Open ' + name + ' full screen';
      const img = document.createElement('img'); img.src = d.t; img.alt = name + ' — ' + d.k; img.loading = 'lazy';
      const badge = document.createElement('span'); badge.className = 'photo-badge badge ' + badgeClass(d.k); badge.textContent = shortKind(d.k);
      photo.append(img, badge);
      const open = () => openViewer(name);
      photo.addEventListener('click', open);
      photo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      const body = document.createElement('div'); body.className = 'card-body';
      const h = document.createElement('h3'); h.textContent = name;
      const p = document.createElement('p'); p.textContent = noteFor(name);
      const src = document.createElement('div'); src.className = 'card-src';
      src.textContent = d.k.startsWith('Text') ? 'Text-guided reconstruction · ' + (d.s || 'scriptural features only') : (d.c || 'Wikimedia Commons') + (d.l ? ' · ' + d.l : '');
      const btn = document.createElement('button'); btn.type='button'; btn.className='card-open'; btn.textContent='View full screen ↗'; btn.addEventListener('click', open);
      body.append(h, p, src, btn); card.append(photo, body); gallery.append(card);
      profiles.push({name, d, el:photo});
    });
  }

  // Unique navigation order, preserving first appearance.
  viewerList = [...new Set(profiles.map(p => p.name))];

  /* ---------------- Status ---------------- */
  const imageStatus = $('#imageStatus');
  if (imageStatus){
    const kinds = viewerList.map(n => assetFor(n).k);
    const real = kinds.filter(k => k === 'Real sourced image').length;
    const ai = kinds.filter(k => k.startsWith('Text')).length;
    const rep = kinds.filter(k => k.startsWith('Representative')).length;
    imageStatus.textContent = `${viewerList.length} profiles · ${real} real sourced images · ${ai} text-guided reconstructions · ${rep} representative real images. Click any image for full-screen zoom.`;
  }

  /* ---------------- Credits table ---------------- */
  const cbody = $('#creditsTable tbody');
  if (cbody){
    const entries = Object.entries(A).filter(([k]) => k !== '__generic__').sort((a,b) => a[0].localeCompare(b[0]));
    $('#creditCount').textContent = entries.length;
    entries.forEach(([name,d]) => {
      const tr = document.createElement('tr');
      const c1 = document.createElement('td'); c1.textContent = name;
      const c2 = document.createElement('td'); const b = document.createElement('span'); b.className='badge '+badgeClass(d.k); b.textContent=shortKind(d.k); c2.append(b);
      const c3 = document.createElement('td'); c3.textContent = d.ti || d.c || '—';
      const c4 = document.createElement('td'); c4.textContent = d.l || '—';
      const c5 = document.createElement('td');
      if (d.p){ const a=document.createElement('a'); a.href=d.p; a.target='_blank'; a.rel='noopener'; a.textContent='Open source ↗'; c5.append(a); }
      else if (d.lu){ const a=document.createElement('a'); a.href=d.lu; a.target='_blank'; a.rel='noopener'; a.textContent='Licence ↗'; c5.append(a); }
      else c5.textContent='—';
      tr.append(c1,c2,c3,c4,c5); cbody.append(tr);
    });
  }

  /* ---------------- Atlas controls ---------------- */
  const rows = $$('tbody tr'), sections = [];
  $$('table').forEach((table,i) => {
    let heading = table.closest('.w')?.previousElementSibling;
    while (heading && !/^H[1-3]$/.test(heading.tagName)) heading = heading.previousElementSibling;
    const name = heading?.textContent?.trim() || `Table ${i+1}`;
    sections.push({table,name}); table.dataset.section = name;
    table.querySelectorAll('tbody tr').forEach(tr => tr.dataset.section = name);
  });
  const sectionFilter = $('#sectionFilter');
  if (sectionFilter) sections.forEach(({name}) => {
    if (![...sectionFilter.options].some(o => o.value === name)){
      const opt = document.createElement('option'); opt.value = name; opt.textContent = name; sectionFilter.append(opt);
    }
  });
  const search = $('#atlasSearch');
  function filter(){
    const q = (search?.value || '').trim().toLowerCase(), sec = sectionFilter?.value || '';
    let shown = 0;
    rows.forEach(tr => {
      const ok = (!q || (tr.innerText + ' ' + tr.dataset.section).toLowerCase().includes(q)) && (!sec || tr.dataset.section === sec);
      tr.hidden = !ok; if (ok) shown++;
    });
    sections.forEach(({table,name}) => {
      const w = table.closest('.w'); if (w) w.hidden = !!sec && sec !== name;
      let h = w?.previousElementSibling; while (h && !/^H[1-3]$/.test(h.tagName)) h = h.previousElementSibling;
      if (h) h.hidden = !!sec && sec !== name;
    });
    const status = $('#atlasStatus');
    if (status) status.textContent = `Showing ${shown} of ${rows.length} table rows.`;
  }
  search?.addEventListener('input', filter);
  sectionFilter?.addEventListener('change', filter);
  $('#jumpClaims')?.addEventListener('click', () => $('#claimsEvidence')?.scrollIntoView({behavior:'smooth',block:'start'}));
  $('#resetAtlas')?.addEventListener('click', () => {
    if (search) search.value = '';
    if (sectionFilter) sectionFilter.value = '';
    $('#imagesOnly')?.setAttribute('aria-pressed','false');
    filter();
  });
  $('#imagesOnly')?.addEventListener('click', e => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    $('#visualIndex').hidden = !on;
    if (on) $('#visualIndex').scrollIntoView({behavior:'smooth',block:'start'});
  });

  /* Back to top — inside the embed the iframe never scrolls itself, so scroll
     the host page instead; standalone, scroll this document. */
  const top = document.createElement('button');
  top.id = 'backTop'; top.type = 'button'; top.title = 'Back to top'; top.textContent = '↑';
  top.addEventListener('click', () => {
    if (embedded) { try { parentWin.scrollTo({top:0,behavior:'smooth'}); } catch(_) {} }
    else window.scrollTo({top:0,behavior:'smooth'});
  });
  if (!embedded) document.body.append(top);
  filter();
})();
""".strip()

CSS = r"""
:root{
  --wine:#4A152C; --wine-deep:#2B0C1B; --wine-ink:#1A0812;
  --gold:#D4AF37; --gold-soft:#E8C96A; --cream:#F8F4E3; --paper-warm:#FDFBF7;
  --ink:#2A231D; --mut:#7A6A5F; --line:rgba(74,21,44,.16);
}
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:light}
body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.6 Merriweather,Georgia,"Times New Roman",serif;padding:10px 14px 72px}
main{max-width:1140px;margin:0 auto}
a{color:var(--wine);text-decoration-thickness:1px;text-underline-offset:2px}
a:hover{color:#8B1C2E}

/* ---------- hero ---------- */
header.hero{position:relative;border:1px solid rgba(212,175,55,.35);border-radius:18px;overflow:hidden;
  padding:30px 30px 24px;margin:6px 0 22px;color:var(--cream);
  background:radial-gradient(ellipse at 88% 0%,rgba(212,175,55,.28),transparent 46%),radial-gradient(ellipse at 0% 100%,rgba(139,28,46,.5),transparent 55%),linear-gradient(135deg,var(--wine),var(--wine-deep))}
.kicker{font:700 .72rem/1.4 Inter,"Segoe UI",system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-soft)}
.hero h1{font-family:"EB Garamond",Merriweather,Georgia,serif;font-weight:400;font-size:clamp(1.7rem,4vw,2.7rem);line-height:1.15;margin:.35em 0 .4em;letter-spacing:-.01em}
.hero p{max-width:74ch;color:rgba(248,244,227,.88);margin:0 0 10px}
.hero-link{display:inline-block;color:var(--gold-soft)!important;font:600 .85rem Inter,system-ui,sans-serif;text-decoration:none;border:1px solid rgba(212,175,55,.5);border-radius:999px;padding:8px 16px;margin-top:8px;transition:background .2s}
.hero-link:hover{background:rgba(212,175,55,.15)}
.hero-art{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:20px}
.hero-art .tile{min-height:86px;border:1px solid rgba(232,201,106,.3);border-radius:12px;padding:12px;background:rgba(248,244,227,.06);display:flex;flex-direction:column;justify-content:space-between}
.tile .sigil{font-size:1.7rem;line-height:1}
.tile small{color:rgba(248,244,227,.75);font:600 .66rem Inter,system-ui,sans-serif;letter-spacing:.12em}
@media (max-width:640px){.hero{padding:22px 18px}.hero-art{grid-template-columns:repeat(2,1fr)}}

/* ---------- section headings ---------- */
h2{font-family:Merriweather,Georgia,serif;font-weight:700;color:var(--wine);font-size:1.35rem;line-height:1.3;margin:2em 0 .45em}
h2::after{content:"";display:block;width:56px;height:3px;border-radius:2px;background:var(--gold);margin-top:8px;opacity:.85}
h2.part-title{margin-top:1.4em}
h3{font-family:Merriweather,Georgia,serif;font-weight:700;color:#6D2148;font-size:1.05rem;margin:1.6em 0 .4em}
section{margin-top:10px}
p.n{color:var(--mut);font-size:.95rem;max-width:78ch;margin:.4em 0 1em}
p.c{font-size:.8rem;color:var(--mut);margin:.6em 0 1.6em;font-style:italic}
strong{color:#5A1030}

/* ---------- notices ---------- */
.notice{border-left:4px solid var(--gold);padding:12px 16px;background:var(--paper-warm);color:#5c5348;font-size:.9rem;line-height:1.55;margin:14px 0;border-radius:0 10px 10px 0;border-top:1px solid var(--line);border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.notice.changed{border-left-color:#8B1C2E}
.notice.claim-notice{border-left-color:#a66b36}

/* ---------- toolbar ---------- */
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;margin:16px 0 10px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 1px 2px rgba(74,21,44,.06)}
.toolbar input,.toolbar select{font:500 .9rem Inter,"Segoe UI",system-ui,sans-serif;color:var(--ink);background:var(--paper-warm);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.toolbar input{flex:1;min-width:200px}
.toolbar input:focus,.toolbar select:focus{outline:2px solid rgba(212,175,55,.55);outline-offset:1px}
.toolbar button{font:700 .78rem Inter,system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;color:var(--gold-soft);background:var(--wine);border:1px solid var(--wine);border-radius:10px;padding:10px 14px;transition:background .2s}
.toolbar button:hover{background:#642040}
.toolbar button[aria-pressed="true"]{background:var(--gold);border-color:var(--gold);color:var(--wine-ink)}
.progress{font:500 .8rem Inter,system-ui,sans-serif;color:var(--mut);margin:2px 2px 8px}

/* ---------- tables ---------- */
.w{overflow-x:auto;border:1px solid var(--line);background:#fff;border-radius:14px;margin:14px 0 26px;box-shadow:0 1px 3px rgba(74,21,44,.07)}
table{border-collapse:collapse;width:100%;min-width:760px;font:400 .86rem/1.5 Inter,"Segoe UI",system-ui,sans-serif}
th,td{border-bottom:1px solid rgba(74,21,44,.1);padding:10px 12px;text-align:left;vertical-align:top}
th{font:700 .68rem/1.4 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;background:var(--wine);color:var(--cream);position:sticky;top:0}
tbody tr:nth-child(even){background:var(--paper-warm)}
tbody tr:hover{background:#f6efdd}
td:first-child{font-weight:600}
td.image-slot{width:128px;min-width:128px;text-align:center;background:rgba(212,175,55,.05)}
th.img-col{width:128px}
.std-table td:first-child{white-space:nowrap}
.claims-table td.assess{font-weight:600;color:#6D2148;white-space:nowrap}
.sources li{margin:.35em 0}

/* ---------- inline profiles (table image cells) ---------- */
.profile-button{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;padding:2px;cursor:pointer;font-family:Inter,system-ui,sans-serif}
.profile-circle{width:84px;height:84px;border-radius:50%;overflow:hidden;border:2px solid var(--gold-soft);background:#efe9da;display:block;transition:transform .15s,border-color .15s}
.profile-button:hover .profile-circle{transform:scale(1.05);border-color:var(--gold)}
.profile-thumb{width:100%;height:100%;object-fit:cover;display:block}
.profile-label{font-size:.72rem;font-weight:700;color:var(--wine);line-height:1.25;text-align:center;max-width:118px}
.profile-credit{font-size:.6rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}

/* ---------- badges ---------- */
.badge{display:inline-block;font:700 .62rem/1 Inter,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:999px;white-space:nowrap}
.badge-real{background:#E7F4EE;color:#1F6F54;border:1px solid #bfe3d2}
.badge-ai{background:#F7ECD0;color:#8A6410;border:1px solid #ecd9a8}
.badge-rep{background:#F0E3EA;color:#6D2148;border:1px solid #dfc2d2}

/* ---------- visual gallery ---------- */
.visual-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin:14px 0 28px}
.entity-card{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(74,21,44,.07);transition:box-shadow .2s,transform .2s}
.entity-card:hover{box-shadow:0 6px 18px rgba(74,21,44,.14);transform:translateY(-2px)}
.card-photo{position:relative;height:150px;cursor:pointer;background:#efe9da}
.card-photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo-badge{position:absolute;left:8px;bottom:8px;box-shadow:0 1px 4px rgba(26,8,18,.35)}
.card-body{padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px;flex:1}
.card-body h3{margin:0;font-size:.92rem;color:var(--wine)}
.card-body p{margin:0;font:400 .78rem/1.5 Inter,system-ui,sans-serif;color:var(--mut)}
.card-src{font:500 .68rem/1.4 Inter,system-ui,sans-serif;color:#9b8d80}
.card-open{margin-top:auto;align-self:flex-start;font:700 .72rem Inter,system-ui,sans-serif;color:var(--gold-soft);background:var(--wine);border:none;border-radius:8px;padding:7px 12px;cursor:pointer}
.card-open:hover{background:#642040}

/* ---------- details / summary ---------- */
details{border:1px solid var(--line);border-radius:12px;background:#fff;padding:0;margin:12px 0;overflow:hidden}
summary{cursor:pointer;font:600 .88rem Inter,system-ui,sans-serif;color:var(--wine);padding:12px 16px;background:var(--paper-warm);list-style-position:inside}
details[open] summary{border-bottom:1px solid var(--line)}
details>*:not(summary){padding:4px 16px 12px}
details>p{margin:.4em 0;font-size:.88rem;color:#5c5348}

/* ---------- image credits ---------- */
#creditsTable td a{font:600 .78rem Inter,system-ui,sans-serif}

/* ---------- viewer ---------- */
#imageViewer{position:fixed;inset:0;z-index:60;display:none;background:rgba(26,8,18,.96);color:var(--cream)}
#imageViewer.open{display:flex;flex-direction:column}
#imageViewer.embedded{position:absolute;top:0;height:100vh;inset:auto 0 0 0;width:100%}
body.viewer-open{overflow:hidden}
.viewer-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 18px;background:rgba(74,21,44,.55);border-bottom:1px solid rgba(212,175,55,.3)}
.viewer-heading{display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap}
.viewer-title{font-family:"EB Garamond",Georgia,serif;font-size:1.15rem;line-height:1.2}
.viewer-head-actions{display:flex;gap:8px;flex-wrap:wrap}
.viewer-btn{font:600 .78rem Inter,system-ui,sans-serif;color:var(--cream);background:rgba(248,244,227,.1);border:1px solid rgba(248,244,227,.3);border-radius:9px;padding:8px 12px;cursor:pointer;text-decoration:none!important}
.viewer-btn:hover{background:rgba(212,175,55,.25);color:#fff}
.viewer-close{background:var(--gold);color:var(--wine-ink);border-color:var(--gold)}
.viewer-close:hover{background:var(--gold-soft);color:var(--wine-ink)}
.viewer-stage{flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;touch-action:none}
.viewer-stage.dragging{cursor:grabbing}
#viewerImage{max-width:92%;max-height:92%;will-change:transform;cursor:grab;user-select:none}
.viewer-foot{padding:10px 18px 14px;background:rgba(74,21,44,.55);border-top:1px solid rgba(212,175,55,.3)}
.viewer-caption{font-size:.9rem;line-height:1.5;max-width:100ch}
.viewer-scripture{font:500 .74rem Inter,system-ui,sans-serif;color:var(--gold-soft);margin-top:4px}
.viewer-credit{font:400 .74rem Inter,system-ui,sans-serif;color:rgba(248,244,227,.75);margin-top:2px}
.viewer-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
.zoom-label{font:600 .78rem Inter,system-ui,sans-serif;color:rgba(248,244,227,.8)}
.viewer-hint{font:400 .7rem Inter,system-ui,sans-serif;color:rgba(248,244,227,.5)}

/* ---------- back to top ---------- */
#backTop{position:fixed;right:18px;bottom:18px;z-index:40;width:44px;height:44px;border-radius:50%;border:none;background:var(--wine);color:var(--gold-soft);font-size:1.2rem;cursor:pointer;box-shadow:0 4px 14px rgba(26,8,18,.35)}
#backTop:hover{background:#642040}

@media (max-width:640px){
  body{padding:8px 8px 56px}
  table{min-width:640px}
  .claims-table td.assess{white-space:normal}
}

/* ---------- bible.com verse links ---------- */
.bref{color:#8B1C2E;text-decoration:underline;text-decoration-color:rgba(212,175,55,.55);text-underline-offset:2px;text-decoration-thickness:1px}
.bref:hover{color:var(--gold);text-decoration-color:var(--gold)}

/* ---------- phones: tables stack into labelled cards ---------- */
@media (max-width:760px){
  .w table{min-width:0;display:block}
  .w thead{display:none}
  .w tbody{display:block}
  .w tr{display:block;border-bottom:1px solid rgba(74,21,44,.12);padding:10px 12px}
  .w tr:last-child{border-bottom:none}
  .w td{display:block;border:none;padding:3px 0}
  .w td.image-slot{background:transparent;width:auto;min-width:0;padding:4px 0 8px}
  .w td[data-label]::before{content:attr(data-label);display:block;font:700 .6rem/1.4 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9b8d80;margin:6px 0 1px}
  .profile-button{display:grid;grid-template-columns:56px 1fr;column-gap:12px;row-gap:1px;text-align:left;align-items:center}
  .profile-circle{grid-row:1/3;width:56px;height:56px}
  .profile-label{text-align:left;max-width:none}
  .profile-credit{grid-column:2;text-align:left}
  .claims-table td.assess{white-space:normal}
}
""".strip()

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/png" href="../icons/favicon.png">
<link rel="shortcut icon" type="image/png" href="../icons/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="../icons/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Watchers Atlas — The Watchers of Enoch | Saul's Podship</title>
<meta name="description" content="A scripture-first visual atlas of the Watchers of Enoch: 220 sourced profiles with real images, text-guided reconstructions and a claims evidence check.">
<meta name="keywords" content="watchers atlas, book of enoch, nephilim, azazel, semyaza, seraphim, cherubim, divine council, biblical monsters, comparative religion">
<meta name="author" content="Solat Nadeem / Saul's Podship">
<link rel="canonical" href="https://www.saulspodship.com/encyclopedia/watchers-atlas">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Saul's Podship">
<meta property="og:url" content="https://www.saulspodship.com/encyclopedia/watchers-atlas">
<meta property="og:title" content="Watchers Atlas — Watchers of Enoch &amp; the World's Gods | Saul's Podship">
<meta property="og:description" content="220 sourced profiles of the Watchers, gods, beasts and beings — real images, scripture-first reconstructions, full-screen viewer.">
<meta property="og:image" content="https://www.saulspodship.com/images/volumes/angels-demons-beasts-monsters-in-the-bible/hero-1920.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Watchers Atlas — Watchers of Enoch &amp; the World's Gods | Saul's Podship">
<meta name="twitter:description" content="220 sourced profiles of the Watchers, gods, beasts and beings — real images, scripture-first reconstructions, full-screen viewer.">
<meta name="twitter:image" content="https://www.saulspodship.com/images/volumes/angels-demons-beasts-monsters-in-the-bible/hero-1920.jpg">
<meta name="geo.region" content="PK">
<meta name="geo.placename" content="Karachi">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700;900&display=swap" rel="stylesheet">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LearningResource","name":"Watchers Atlas — Watchers of Enoch and the World's Gods","educationalUse":"Bible study","provider":{"@type":"Organization","name":"Saul's Podship"},"dateModified":"2026-11-03"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"Watchers Atlas — Watchers of Enoch and the World's Gods","description":"A scripture-first visual atlas of Watchers traditions with 220 sourced image profiles, comparative tables and a speculative-claims evidence check.","url":"https://www.saulspodship.com/encyclopedia/watchers-atlas","mainEntityOfPage":{"@type":"WebPage","@id":"https://www.saulspodship.com/encyclopedia/watchers-atlas"},"author":{"@type":"Person","name":"Solat Nadeem"},"publisher":{"@type":"Organization","name":"Saul's Podship","url":"https://www.saulspodship.com/"}}
</script>
<script src="/assets/sp-i18n.js" defer></script>
<style>
%CSS%
</style>
</head>"""

html = HEAD.replace('%CSS%', CSS)
html += '\n<body>\n<main>\n' + main.rstrip() + '\n</main>\n'
html += '\n<script type="application/json" id="atlasAssets">' + assets + '</script>\n'
html += '\n<script>\n' + APP_JS + '\n</script>\n</body>\n</html>\n'

open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {OUT}: {len(html)/1024:.0f} KB')
