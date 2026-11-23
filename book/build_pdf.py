#!/usr/bin/env python3
"""Build the Saul's Podship theological archive as a trade-size open-spread ebook.

Usage:  python book/build_pdf.py [en|ur|hi]
Outputs book/Sauls-Podship-Compendium[-ur|-hi].pdf
"""
from __future__ import annotations

import json, re, os, sys, datetime, html as htmllib
from pathlib import Path
from collections import defaultdict

# ReportLab's RTL engine (BidiStr, wordWrap="RTL") looks for the retired
# `rlbidi` extension.  Ship a python-bidi backed stand-in beside this file
# and make sure it is importable before reportlab is loaded.
_VENDOR = Path(__file__).resolve().parent / "_vendor"
if _VENDOR.is_dir() and str(_VENDOR) not in sys.path:
    sys.path.insert(0, str(_VENDOR))

from reportlab.lib.pagesizes import inch
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, NextPageTemplate, ListFlowable, ListItem,
    ActionFlowable,
    HRFlowable, CondPageBreak, Flowable,
)
# ReportLab 5.x crashes when an RTL paragraph with inline markup is split
# across a frame; install the tolerant splitter before building anything.
import rl_rtl_patch
rl_rtl_patch.apply()

from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(__file__).resolve().parent / "data"
FONTS = Path(__file__).resolve().parent / "fonts"
IMG_TMP = Path(__file__).resolve().parent / "_imgtmp"
IMG_TMP.mkdir(exist_ok=True)

# ---------------------------------------------------------------- language
# en | ur | hi  — three editions of the same theological archive
LANG = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BOOK_LANG", "en")).lower()
if LANG not in ("en", "ur", "hi"):
    sys.exit(f"unknown language {LANG!r} (use en, ur or hi)")

LANG_NAMES = {"en": "English", "ur": "اردو", "hi": "हिन्दी"}
if LANG == "en":
    OUT_PDF = Path(__file__).resolve().parent / "Sauls-Podship-Compendium.pdf"
elif LANG == "ur":
    OUT_PDF = Path(__file__).resolve().parent / "Sauls-Podship-Compendium-Urdu.pdf"
else:
    OUT_PDF = Path(__file__).resolve().parent / "Sauls-Podship-Compendium-Hindi.pdf"

# Trade book trim (6 in × 9 in) — standard theological paperback size
BOOK_W, BOOK_H = 6 * inch, 9 * inch
# Each PDF sheet is an open spread: verso (left) + recto (right)
PAGE_W, PAGE_H = BOOK_W * 2, BOOK_H
MARGIN = 14 * mm          # outer/inner margin on each book half
GUTTER = 8 * mm           # breathing room at the spine
AVAIL_W = BOOK_W - 2 * MARGIN - GUTTER   # usable width of one book half
WINE = colors.HexColor("#4A152C")
WINE2 = colors.HexColor("#8B1C2E")
GOLD = colors.HexColor("#B5952F")
GOLD_L = colors.HexColor("#E8C96A")
CREAM = colors.HexColor("#F8F4E3")
CREAM2 = colors.HexColor("#FDFBF7")
NAVY = colors.HexColor("#1D2D50")
LINE = colors.HexColor("#E3D8BD")
MUTED = colors.HexColor("#7a6a5f")
INK = colors.HexColor("#2a231d")

# ---------------------------------------------------------------- fonts
def register_fonts():
    F = "/usr/share/fonts/truetype/dejavu"
    pdfmetrics.registerFont(TTFont("Mono", f"{F}/DejaVuSansMono.ttf"))
    if LANG == "en":
        pdfmetrics.registerFont(TTFont("Serif", f"{F}/DejaVuSerif.ttf"))
        pdfmetrics.registerFont(TTFont("Serif-Bold", f"{F}/DejaVuSerif-Bold.ttf"))
        pdfmetrics.registerFont(TTFont("Sans", f"{F}/DejaVuSans.ttf"))
        pdfmetrics.registerFont(TTFont("Sans-Bold", f"{F}/DejaVuSans-Bold.ttf"))
    elif LANG == "ur":
        # Jameel Noori Nastaleeq for everything readable: it is the face Urdu
        # readers actually expect, and ReportLab shapes and embeds it cleanly.
        # Nastaliq needs deep descenders and stacked marks, so it is set at a
        # larger size with generous leading (see ST below).
        nastaliq = FONTS / "JameelNooriNastaleeq.ttf"
        pdfmetrics.registerFont(TTFont("Serif", str(nastaliq)))
        pdfmetrics.registerFont(TTFont("Serif-Bold", str(nastaliq)))
        pdfmetrics.registerFont(TTFont("Sans", str(nastaliq)))
        pdfmetrics.registerFont(TTFont("Sans-Bold", str(nastaliq)))
    else:  # hi
        pdfmetrics.registerFont(TTFont("Serif", str(FONTS / "NotoSerifDevanagari.ttf")))
        pdfmetrics.registerFont(TTFont("Serif-Bold", str(FONTS / "NotoSerifDevanagari.ttf")))
        pdfmetrics.registerFont(TTFont("Sans", str(FONTS / "NotoSansDevanagari.ttf")))
        pdfmetrics.registerFont(TTFont("Sans-Bold", str(FONTS / "NotoSansDevanagari.ttf")))
    # symbol fallback for colour-key chips (■ ● ★ ...) missing from
    # the Arabic and Devanagari faces
    pdfmetrics.registerFont(TTFont("Sy", f"{F}/DejaVuSans.ttf"))
    pdfmetrics.registerFontFamily(
        "Serif", normal="Serif", bold="Serif-Bold", italic="Serif", boldItalic="Serif-Bold"
    )
    pdfmetrics.registerFontFamily(
        "Sans", normal="Sans", bold="Sans-Bold", italic="Sans", boldItalic="Sans-Bold"
    )


register_fonts()

# ---------------------------------------------------------------- styles
def S(name, **kw):
    base = dict(fontName="Serif", fontSize=9.5, leading=13.2, textColor=INK,
                alignment=TA_JUSTIFY, spaceBefore=0, spaceAfter=4)
    base.update(kw)
    if LANG == "ur":
        # Right-to-left paragraph engine: wordWrap="RTL" drives ReportLab's
        # bidi reordering + HarfBuzz shaping; alignment is mirrored here.
        base["wordWrap"] = "RTL"
        # HarfBuzz shaping must be switched on explicitly: with shaping off
        # ReportLab draws the font's default glyph for each character, so the
        # letters never take their contextual (joined) forms.
        base["shaping"] = 1
        size = base.get("fontSize", 9.5)
        # Table cells and captions live in narrow columns, so they keep a
        # smaller floor; body text gets the readable minimum.
        floor = 8.0 if name.startswith(("cell", "caption", "small")) else 9.6
        if size < floor:
            size = base["fontSize"] = floor
        # Nastaliq hangs well below the baseline and stacks marks above it,
        # so it needs far more leading than a Latin face at the same size.
        tight = name.startswith(("cell", "caption"))
        base["leading"] = size * (1.75 if tight else (2.0 if size <= 12 else 1.55))
        if base.get("alignment") == TA_LEFT:
            base["alignment"] = TA_RIGHT
        elif base.get("alignment") == TA_RIGHT:
            base["alignment"] = TA_LEFT
    return ParagraphStyle(name, **base)


ST = {
    "body": S("body"),
    "body_c": S("body_c", alignment=TA_CENTER),
    "lead": S("lead", fontSize=10.5, leading=15, textColor=WINE, alignment=TA_LEFT,
              spaceAfter=6),
    "h1": S("h1", fontName="Serif-Bold", fontSize=20, leading=24, textColor=WINE,
            alignment=TA_LEFT, spaceBefore=2, spaceAfter=8),
    "h2": S("h2", fontName="Serif-Bold", fontSize=14, leading=18, textColor=WINE,
            alignment=TA_LEFT, spaceBefore=12, spaceAfter=5),
    "h3": S("h3", fontName="Sans-Bold", fontSize=11, leading=14, textColor=WINE2,
            alignment=TA_LEFT, spaceBefore=9, spaceAfter=3),
    "h4": S("h4", fontName="Sans-Bold", fontSize=9.5, leading=12, textColor=NAVY,
            alignment=TA_LEFT, spaceBefore=7, spaceAfter=2),
    "part": S("part", fontName="Sans-Bold", fontSize=13, leading=16, textColor=GOLD,
              alignment=TA_CENTER, spaceAfter=6),
    "part_title": S("part_title", fontName="Serif-Bold", fontSize=28, leading=34,
                    textColor=WINE, alignment=TA_CENTER, spaceAfter=10),
    "part_sub": S("part_sub", fontName="Serif", fontSize=12, leading=17,
                  textColor=MUTED, alignment=TA_CENTER),
    "chap_no": S("chap_no", fontName="Sans-Bold", fontSize=10, leading=13,
                 textColor=GOLD, alignment=TA_LEFT, spaceAfter=2),
    "chap_title": S("chap_title", fontName="Serif-Bold", fontSize=18, leading=22,
                    textColor=WINE, alignment=TA_LEFT, spaceAfter=4),
    "chap_sub": S("chap_sub", fontName="Serif", fontSize=11, leading=15,
                  textColor=MUTED, alignment=TA_LEFT, spaceAfter=6),
    "bullet": S("bullet", leftIndent=12, bulletIndent=2, spaceAfter=2.5),
    "quote": S("quote", leftIndent=14, rightIndent=10, fontName="Serif",
               textColor=WINE, spaceBefore=4, spaceAfter=6, alignment=TA_LEFT),
    "caption": S("caption", fontName="Sans", fontSize=8, leading=11, textColor=MUTED,
                 alignment=TA_CENTER, spaceBefore=3, spaceAfter=8),
    "cell": S("cell", fontName="Sans", fontSize=7.6, leading=10, alignment=TA_LEFT,
              spaceAfter=0, spaceBefore=0),
    "cell_b": S("cell_b", fontName="Sans-Bold", fontSize=7.6, leading=10,
                alignment=TA_LEFT, spaceAfter=0, spaceBefore=0),
    "cell_h": S("cell_h", fontName="Sans-Bold", fontSize=7.8, leading=10.5,
                textColor=colors.white, alignment=TA_LEFT, spaceAfter=0, spaceBefore=0),
    "q_title": S("q_title", fontName="Sans-Bold", fontSize=9.5, leading=13,
                 textColor=WINE, spaceBefore=8, spaceAfter=3, alignment=TA_LEFT),
    "q_block_h": S("q_block_h", fontName="Sans-Bold", fontSize=8.5, leading=11,
                   textColor=GOLD, spaceBefore=5, spaceAfter=1.5, alignment=TA_LEFT),
    "small": S("small", fontSize=8.2, leading=11, textColor=MUTED, alignment=TA_LEFT),
    "toc_h": S("toc_h", fontName="Sans-Bold", fontSize=10, leading=14, textColor=WINE,
               spaceBefore=8, spaceAfter=2),
    "cover_title": S("cover_title", fontName="Serif-Bold", fontSize=34, leading=42,
                     textColor=WINE, alignment=TA_CENTER),
    "cover_sub": S("cover_sub", fontName="Serif", fontSize=15, leading=22,
                   textColor=NAVY, alignment=TA_CENTER),
    "cover_kicker": S("cover_kicker", fontName="Sans-Bold", fontSize=11, leading=15,
                      textColor=GOLD, alignment=TA_CENTER),
    "mono": S("mono", fontName="Mono", fontSize=8, leading=11, alignment=TA_LEFT),
    "faq_q": S("faq_q", fontName="Sans-Bold", fontSize=9, leading=12, textColor=WINE,
               spaceBefore=5, spaceAfter=1),
    "panel": S("panel", fontSize=8.6, leading=11.8, alignment=TA_LEFT, spaceAfter=2),
}

# RTL list defaults: bullets hang off the right edge in the Urdu edition
if LANG == "ur":
    # Mirrored indents: in a right-to-left list the marker belongs at the
    # right edge and the text hangs to its left, so the indents are set on the
    # right and the left ones are cleared.  Without this the bullet is drawn at
    # the far left margin while the text starts at the right, which reads as a
    # stray dot in the gutter.
    RTL_LIST = dict(bulletDir="rtl", bulletAlign="right", rightIndent=14)
    RTL_BULLET = dict(rightIndent=12)
else:
    RTL_LIST = {}
    RTL_BULLET = {}

# ---------------------------------------------------------------- text utils
EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U00002190-\U000021FF\U00002B00-\U00002BFF⬀-⯿]"
)
def _chip(hex_color: str, glyph: str = "■") -> str:
    # The Urdu/Hindi faces have no geometric shapes, so route the chip glyph
    # through DejaVu Sans (registered as "Sy") to keep colour keys visible.
    face = "" if LANG == "en" else ' name="Sy"'
    return f'<font color="{hex_color}"{face}>{glyph}</font>'


# Coloured square emojis keep their hue as ■ chips so colour keys stay colourful.
EMOJI_MAP = {
    "🟦": _chip("#2563EB"), "🟥": _chip("#DC2626"), "🟨": _chip("#CA8A04"),
    "🟩": _chip("#16A34A"), "🟪": _chip("#9333EA"), "🟧": _chip("#EA580C"),
    "🟫": _chip("#92400E"),
    "⚫": _chip("#1F2937"), "⚪": _chip("#9CA3AF"), "🔘": _chip("#6B7280"),
    "🔵": _chip("#2563EB", "●"), "✨": "★", "🔥": _chip("#DC2626", "▲"),
    "✅": _chip("#16A34A", "✓"), "❌": _chip("#DC2626", "✗"),
    "⭐": _chip("#CA8A04", "★"),
    "📖": _chip("#4A152C", "▣"), "✟": _chip("#4A152C", "✝"),
    "☦": _chip("#4A152C", "✝"),
}
AR_DIGIT_TABLE = str.maketrans(
    "٠١٢٣٤٥٦٧٨٩"  # Arabic-Indic
    "۰۱۲۳۴۵۶۷۸۹"  # Extended Arabic-Indic (Persian/Urdu)
    "०१२३४५६७८९",  # Devanagari
    "0123456789" * 3,
)
SAFE_TAG_RE = re.compile(
    r"</?(?:b|i|br|font|u|sub|sup|strong|em)(?:\s[^<>]*)?/?>", re.I
)


def clean(text: str) -> str:
    """Make a string safe for our fonts (strip emoji, keep safe inline tags)."""
    if not text:
        return ""
    text = str(text)
    if "\\u" in text:
        def _dec(m):
            try:
                return chr(int(m.group(1), 16))
            except Exception:
                return m.group(0)
        text = re.sub(r"\\u([0-9a-fA-F]{4})", _dec, text)
    if "\\x" in text:
        text = re.sub(
            r"\\x([0-9a-fA-F]{2})",
            lambda m: chr(int(m.group(1), 16)),
            text,
        )
    for k, v in EMOJI_MAP.items():
        text = text.replace(k, v)
    text = EMOJI_RE.sub("", text)
    text = text.translate(AR_DIGIT_TABLE)
    # Markdown rules and other repeated punctuation survive translation as one
    # enormous unbreakable "word" (a 190-char run of "=" was aborting the
    # build), so collapse them to nothing.
    text = re.sub(r"[=\-_*~#]{4,}", " ", text)
    text = re.sub(r"\s{2,}", " ", text)
    # plain wording: drop the ornamental "Scriptorium" brand label
    text = text.replace("Saul's Podship Scriptorium", "Saul's Podship")
    text = text.replace("SCRIPTORIUM", "LIBRARY")
    text = text.replace("Scriptorium", "Library")
    text = text.replace("scriptorium", "library")
    placeholders = []

    def _keep(m):
        placeholders.append(m.group(0))
        return f"\x01{len(placeholders) - 1}\x01"

    text = SAFE_TAG_RE.sub(_keep, text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(
        r"\x01(\d+)\x01",
        lambda m: placeholders[int(m.group(1))],
        text,
    )
    return text


def _square(hex_color: str) -> str:
    """A coloured square for colour keys, in a face that has the glyph."""
    return _chip(hex_color, "■")


def inline_md(text: str) -> str:
    """Convert a small markdown subset to reportlab-safe inline markup."""
    t = clean(text)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", t)
    code_spans = []

    def _code(m):
        code_spans.append(m.group(1))
        return f"\x00{len(code_spans) - 1}\x00"

    t = re.sub(r"`([^`]+)`", _code, t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<i>\1</i>", t)
    t = re.sub(
        r"\x00(\d+)\x00",
        lambda m: f'<font name="Mono">{code_spans[int(m.group(1))]}</font>',
        t,
    )
    return t


def load(name):
    """Load a data file, preferring the translated copy for ur/hi editions."""
    if LANG != "en":
        tr = DATA / "i18n" / LANG / name
        if tr.exists():
            return json.loads(tr.read_text(encoding="utf-8"))
    return json.loads((DATA / name).read_text(encoding="utf-8"))


# ---------------------------------------------------------------- images
def prep_image(path: Path, max_w: float, max_h: float, quality: int = 84) -> Path | None:
    if not path.exists():
        return None
    key = f"{abs(hash((str(path), max_w, max_h, quality)))}.jpg"
    out = IMG_TMP / key
    if out.exists():
        return out
    try:
        im = PILImage.open(path)
        if im.mode in ("RGBA", "P", "LA"):
            bg = PILImage.new("RGB", im.size, (255, 255, 255))
            im2 = im.convert("RGBA")
            bg.paste(im2, mask=im2.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        max_px = 1600
        if max(im.size) > max_px:
            im.thumbnail((max_px, max_px), PILImage.Resampling.LANCZOS)
        im.save(out, "JPEG", quality=quality, optimize=True)
        return out
    except Exception as e:
        print(f"  ! image fail {path}: {e}", file=sys.stderr)
        return None


def img_flowable(path: Path, max_w: float, max_h: float, caption: str | None = None):
    if not path or not Path(path).exists():
        return []
    prepared = prep_image(Path(path), max_w, max_h)
    if not prepared:
        return []
    try:
        iw, ih = PILImage.open(prepared).size
    except Exception:
        return []
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    out = [Image(str(prepared), width=w, height=h)]
    if caption:
        out.append(para(clean(caption), ST["caption"]))
    else:
        out.append(Spacer(1, 4))
    return out


# ---------------------------------------------------------------- tables
_ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
_LATIN_RE = re.compile(r"[A-Za-z]")
_LTR_STYLE_CACHE = {}


def _is_latin_only(text: str) -> bool:
    """True when a string has no Arabic-script letters at all.

    Urdu translation left some passages in English (proper nouns, untranslated
    study notes).  Laying those out right-to-left reverses their punctuation
    and reads as garbage, so they are set left to right even in the Urdu book.
    """
    plain = re.sub(r"<[^>]+>", "", text or "")
    return not _ARABIC_RE.search(plain) and bool(_LATIN_RE.search(plain))


MAX_WORD_CHARS = 34


def _break_long_tokens(text: str) -> str:
    """Insert soft break points in absurdly long tokens (URLs, hash runs).

    ReportLab cannot break a word that has no spaces, so one such token is
    enough to overflow a line and abort the build.
    """
    if not text:
        return text

    def fix(m):
        w = m.group(0)
        if len(w) <= MAX_WORD_CHARS or "://" in w:
            return w
        return "\u200b".join(w[i:i + MAX_WORD_CHARS]
                             for i in range(0, len(w), MAX_WORD_CHARS))

    return re.sub(r"\S+", fix, text)


def _ltr_variant(style):
    key = id(style)
    hit = _LTR_STYLE_CACHE.get(key)
    if hit is not None:
        return hit
    d = style.__dict__.copy()
    d["wordWrap"] = None
    d["alignment"] = TA_LEFT
    d["name"] = style.name + "-ltr"
    out = ParagraphStyle(d.pop("name"), **{k: v for k, v in d.items() if k != "name"})
    _LTR_STYLE_CACHE[key] = out
    return out


def para(text, style):
    """Paragraph() with per-string direction resolution for the Urdu book."""
    # Only fully-Latin strings take the LTR style. Anything containing Urdu
    # must stay on the RTL path, because ReportLab shapes Arabic script only
    # when wordWrap="RTL"; the LTR style would print unjoined letters.
    if LANG == "ur":
        text = _break_long_tokens(text)
        if _is_latin_only(text):
            return Paragraph(text, _ltr_variant(style))
    return Paragraph(text, style)


def safe_para(text, style):
    try:
        return para(text, style)
    except Exception:
        plain = re.sub(r"<[^>]+>", "", str(text))
        return para(clean(plain), style)


def make_table(headers, rows, col_widths=None, header_bg=WINE, font_size=7.6,
               zebra=True, align_left=True):
    """Build a themed table, sized to fit a single book page.

    Nastaliq runs tall, so Urdu tables are laid out repeatedly at falling font
    sizes until the whole table fits the frame. Without this an unlucky table
    overruns the height and ReportLab aborts the entire build.
    """
    if not rows and not headers:
        return []

    avail = AVAIL_W
    sizes = [1.0]
    if LANG == "ur":
        sizes = [1.0, 0.92, 0.84, 0.76, 0.68, 0.6]

    last = None
    for scale in sizes:
        cell_st, head_st = _cell_styles(scale)
        data = []
        if headers:
            data.append([safe_para(clean(str(h)), head_st) for h in headers])
        for row in rows:
            data.append([
                safe_para(inline_md(str(c)) if c is not None else "", cell_st)
                for c in row
            ])
        n_cols = max(len(r) for r in data)
        for r in data:
            while len(r) < n_cols:
                r.append(safe_para("", cell_st))

        if col_widths:
            widths = [avail * w for w in col_widths]
        else:
            widths = [avail / n_cols] * n_cols
            if LANG == "ur":
                # weight columns by how much text they actually hold
                # Measure, don't guess: weight columns by how wide their text
                # actually sets, and never let a column be narrower than its
                # longest unbreakable word (otherwise ReportLab breaks words
                # like "Week" mid-glyph).
                need = [0.0] * n_cols
                min_w = [0.0] * n_cols
                for r in data:
                    for i, cell in enumerate(r[:n_cols]):
                        st = cell.style
                        indent = (getattr(st, "leftIndent", 0) or 0) + \
                                 (getattr(st, "rightIndent", 0) or 0)
                        for para_text in re.sub(r"<[^>]+>", "",
                                                getattr(cell, "text", "") or "").split("\n"):
                            try:
                                w = pdfmetrics.stringWidth(para_text, st.fontName,
                                                           st.fontSize) + indent
                            except Exception:
                                w = len(para_text) * st.fontSize * 0.5
                            need[i] = max(need[i], w)
                            for word in para_text.split():
                                try:
                                    ww = pdfmetrics.stringWidth(
                                        word, st.fontName, st.fontSize) + 14
                                except Exception:
                                    ww = len(word) * st.fontSize * 0.5
                                min_w[i] = max(min_w[i], ww)
                total = sum(need) or 1.0
                widths = [avail * n / total for n in need]
                widths = [max(w, m) for w, m in zip(widths, min_w)]
        total_w = sum(widths)
        widths = [w * avail / total_w for w in widths]

        # Probe the fit BEFORE mirroring: the column widths above belong to
        # the logical (source) column order, so measuring after reversing them
        # would test the wrong columns.
        if LANG == "ur":
            probe = Table(data, colWidths=widths,
                          repeatRows=1 if headers else 0)
            try:
                _, probe_h = probe.wrap(avail, PAGE_H)
            except Exception:
                probe_h = 0
            if probe_h > PAGE_H - 120 and scale != sizes[-1]:
                continue

        if LANG == "ur":
            # right-to-left reading order: last column is read first
            data = [list(reversed(r)) for r in data]
            widths = list(reversed(widths))

        t = Table(data, colWidths=widths, repeatRows=1 if headers else 0)
        cmds = [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.4, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]
        if headers:
            cmds += [
                ("BACKGROUND", (0, 0), (-1, 0), header_bg),
                ("LINEBELOW", (0, 0), (-1, 0), 0.8, GOLD),
            ]
        start = 1 if headers else 0
        if zebra:
            for i in range(start, len(data)):
                if (i - start) % 2 == 1:
                    cmds.append(("BACKGROUND", (0, i), (-1, i), CREAM2))
        t.setStyle(TableStyle(cmds))
        last = t
        if LANG != "ur":
            break
        if probe_h <= PAGE_H - 120:
            break

    return [last, Spacer(1, 6)]


_CELL_STYLE_CACHE = {}


def _cell_styles(scale):
    """Return (cell, header) paragraph styles at a scale of the base size."""
    if LANG != "ur":
        return ST["cell"], ST["cell_h"]
    hit = _CELL_STYLE_CACHE.get(scale)
    if hit:
        return hit
    base = ST["cell"]
    head = ST["cell_h"]
    size = base.fontSize * scale
    lead = base.leading * scale
    cell = ParagraphStyle(base.name + f"-{scale}", parent=base,
                          fontSize=size, leading=lead, shaping=1)
    hsize = head.fontSize * scale
    headst = ParagraphStyle(head.name + f"-{scale}", parent=head,
                            fontSize=hsize, leading=lead, shaping=1)
    _CELL_STYLE_CACHE[scale] = (cell, headst)
    return cell, headst


# ---------------------------------------------------------------- markdown
def md_to_flowables(md: str, style=None) -> list:
    style = style or ST["body"]
    out: list = []
    if not md:
        return out
    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            i += 1
            buf = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            if buf:
                out.append(safe_para(clean("\n".join(buf)).replace("\n", "<br/>"), ST["mono"]))
            continue
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            def split_row(row):
                row = row.strip().strip("|")
                return [c.strip() for c in row.split("|")]
            headers = split_row(s)
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            n = len(headers)
            rows = [(r + [""] * n)[:n] for r in rows]
            out.extend(make_table(headers, rows))
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
            if level <= 2:
                out.append(safe_para(inline_md(text), ST["h2"]))
            else:
                out.append(safe_para(inline_md(text), ST["h3"]))
            i += 1
            continue
        m = re.match(r"^\*\*([^*]+)\*\*$", s)
        if m and len(m.group(1)) < 90:
            out.append(safe_para(inline_md(m.group(1)), ST["h3"]))
            i += 1
            continue
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append(safe_para(inline_md(" ".join(buf)), ST["quote"]))
            continue
        if re.match(r"^[-*•]\s+", s):
            items = []
            while i < len(lines) and re.match(r"^[-*•]\s+", lines[i].strip()):
                items.append(re.sub(r"^[-*•]\s+", "", lines[i].strip()))
                i += 1
            out.append(ListFlowable(
                [ListItem(safe_para(inline_md(it), ST["bullet"]),
                          leftIndent=0 if LANG == "ur" else 12,
                          **RTL_BULLET)
                 for it in items],
                bulletType="bullet", start="•",
                leftIndent=0 if LANG == "ur" else 14,
                bulletFontName="Sans", bulletFontSize=7, **RTL_LIST,
            ))
            continue
        if re.match(r"^\d+[.)]\s+", s):
            items = []
            while i < len(lines) and re.match(r"^\d+[.)]\s+", lines[i].strip()):
                items.append(re.sub(r"^\d+[.)]\s+", "", lines[i].strip()))
                i += 1
            out.append(ListFlowable(
                [ListItem(safe_para(inline_md(it), ST["bullet"]),
                          leftIndent=0 if LANG == "ur" else 14,
                          **RTL_BULLET)
                 for it in items],
                bulletType="1", leftIndent=0 if LANG == "ur" else 18,
                bulletFontName="Sans", bulletFontSize=8, **RTL_LIST,
            ))
            continue
        buf = [s]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if (not nxt or re.match(r"^(#{1,6}\s|[-*•]\s|\d+[.)]\s|>|\*\*[^*]+\*\*$|```)", nxt)):
                break
            buf.append(nxt)
            i += 1
        out.append(safe_para(inline_md(" ".join(buf)), style))
    return out


# ---------------------------------------------------------------- doc template
BOOK_TITLE = "Saul's Podship — The Complete Knowledge Book"
if LANG == "ur":
    BOOK_TITLE = "سولز پاڈشپ — مکمل علمی کتاب"
elif LANG == "hi":
    BOOK_TITLE = "सॉल्स पॉडशिप — सम्पूर्ण ज्ञान पुस्तक"



# ------------------------------------------------- canvas (header/footer) text
def rtl_text(text, font_name, size):
    """Return canvas-ready text: shaped and reordered for Urdu, plain otherwise.

    Canvas drawing bypasses the paragraph engine, so running heads and page
    furniture would otherwise print unjoined and in the wrong order.
    """
    if LANG != "ur" or not text:
        return text
    try:
        from reportlab.pdfgen.textobject import bidiShapedText
        shaped, _w = bidiShapedText(text, direction="RTL", fontName=font_name,
                                    fontSize=size, shaping=True)
        return shaped
    except Exception:
        return text


def draw_rtl(canv, x, y, text, font_name, size, align="left"):
    """drawString/drawRightString/drawCentredString with Urdu shaping."""
    canv.setFont(font_name, size)
    t = rtl_text(text, font_name, size)
    if align == "right":
        canv.drawRightString(x, y, t)
    elif align == "center":
        canv.drawCentredString(x, y, t)
    else:
        canv.drawString(x, y, t)

COVER_BRAND = "SAUL'S PODSHIP"
COVER_SUBTITLE = "The Complete Knowledge Book"
if LANG == "ur":
    COVER_BRAND = "سولز پاڈشپ"
    COVER_SUBTITLE = "مکمل علمی کتاب"
elif LANG == "hi":
    COVER_BRAND = "सॉल्स पॉडशिप"
    COVER_SUBTITLE = "सम्पूर्ण ज्ञान पुस्तक"


class BookDoc(BaseDocTemplate):
    """One PDF sheet = one open spread (verso left | recto right)."""

    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=(PAGE_W, PAGE_H),
                         leftMargin=0, rightMargin=0,
                         topMargin=0, bottomMargin=0,
                         title=BOOK_TITLE,
                         author="Solat Jamil",
                         subject="Theological archive — Bible encyclopedia, apologetics, prophecy",
                         **kw)
        half = BOOK_W
        # frames live in sheet coordinates: left half [0, half), right half [half, 2*half)
        def half_frame(side, fid):
            x0 = 0.0 if side == "L" else half
            # inner margin near gutter, outer margin at sheet edge
            if side == "L":
                lm, rm = MARGIN, GUTTER
            else:
                lm, rm = GUTTER, MARGIN
            return Frame(x0 + lm, 14 * mm,
                         half - lm - rm, BOOK_H - 14 * mm - 14 * mm,
                         id=fid)
        self.addPageTemplates([
            # front cover sits on the recto (right half), inset inside the gold border
            PageTemplate(id="cover",
                         frames=[Frame(BOOK_W + 16 * mm, 0, BOOK_W - 32 * mm, PAGE_H,
                                       0, 0, 0, 0, id="cover")],
                         onPage=self._cover_page),
            PageTemplate(id="front", frames=[half_frame("R", "front")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "front")),
            PageTemplate(id="bodyL", frames=[half_frame("L", "L")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "L")),
            PageTemplate(id="bodyR", frames=[half_frame("R", "R")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "R")),
            # blank half used to pad part openers onto the right page of a spread
            PageTemplate(id="blank", frames=[half_frame("L", "B")],
                         onPage=lambda c, d: None),
        ])
        self._tpls = {pt.id: pt for pt in self.pageTemplates}
        self._pending_tpl = None
        self._last_side = "R"
        self.chapter_label = ""
        self.part_label = ""
        self._spread_no = 0

    def handle_nextPageTemplate(self, name):
        if name == "body":
            name = "bodyR"
        self._pending_tpl = name

    def handle_pageBegin(self):
        # each reportlab "page" is one spread; number it once
        if self._pending_tpl and self._pending_tpl in self._tpls:
            self.pageTemplate = self._tpls[self._pending_tpl]
            self._pending_tpl = None
        elif self.pageTemplate.id in ("bodyL", "bodyR"):
            self.pageTemplate = self._tpls["bodyR" if self.pageTemplate.id == "bodyL" else "bodyL"]
        if self.pageTemplate.id in ("bodyL", "bodyR"):
            self._last_side = self.pageTemplate.id
        super().handle_pageBegin()

    def _spread_index(self):
        # physical book-page number for the recto (right) half of this sheet
        return self.page  # 1-based sheet number

    def _cover_page(self, canv, doc):
        canv.saveState()
        # full-bleed cream on the whole spread; artwork centred on right half (recto)
        canv.setFillColor(CREAM)
        canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # spine hint
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.6)
        canv.line(BOOK_W, 0, BOOK_W, PAGE_H)
        # left half: quiet quarter-title
        canv.setFillColor(WINE)
        draw_rtl(canv, BOOK_W / 2, PAGE_H * 0.55, COVER_BRAND, "Serif-Bold", 16, "center")
        canv.setFillColor(MUTED)
        draw_rtl(canv, BOOK_W / 2, PAGE_H * 0.55 - 18, COVER_SUBTITLE, "Sans", 9, "center")
        # right half: formal cover panel
        rx = BOOK_W
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(1.6)
        canv.rect(rx + 10 * mm, 10 * mm, BOOK_W - 20 * mm, PAGE_H - 20 * mm, fill=0, stroke=1)
        canv.setLineWidth(0.5)
        canv.rect(rx + 12 * mm, 12 * mm, BOOK_W - 24 * mm, PAGE_H - 24 * mm, fill=0, stroke=1)
        canv.setFillColor(WINE)
        canv.rect(rx + 10 * mm, PAGE_H - 42 * mm, BOOK_W - 20 * mm, 18 * mm, fill=1, stroke=0)
        canv.setFillColor(GOLD_L)
        draw_rtl(canv, rx + BOOK_W / 2, PAGE_H - 34 * mm, COVER_BRAND, "Sans-Bold", 11, "center")
        canv.restoreState()

    def _side_page(self, canv, doc, side):
        """Running head/foot. side: front | L | R — page numbers on outer edges of the spread."""
        canv.saveState()
        n = str(doc.page * 2 - (0 if side in ("R", "front") else 1))
        # sheet-level book page: recto = 2k, verso = 2k-1 for sheet k? keep simple:
        # verso shows odd, recto shows even so outer edges read correctly when bound
        if side == "L":
            book_pg = str(doc.page * 2 - 1)
        elif side == "R":
            book_pg = str(doc.page * 2)
        else:
            book_pg = str(doc.page * 2)
        chapter = (self.chapter_label or "")[:52]
        y = PAGE_H - 11 * mm
        if side == "front":
            x0 = BOOK_W + GUTTER
            x1 = PAGE_W - MARGIN
            canv.setFillColor(MUTED)
            draw_rtl(canv, x1, y, BOOK_TITLE, "Sans", 7, "right")
            canv.setFillColor(WINE)
            draw_rtl(canv, x1, 8 * mm, book_pg, "Sans-Bold", 8, "right")
            canv.restoreState()
            return
        if side == "L":
            # verso: outer edge = left of sheet
            x_out, x_in = MARGIN, BOOK_W - GUTTER
            canv.setFillColor(MUTED)
            draw_rtl(canv, x_out, y, BOOK_TITLE, "Sans", 7)
            if chapter:
                canv.setFillColor(WINE)
                draw_rtl(canv, x_in, y, chapter, "Sans", 7, "right")
            canv.setFillColor(WINE)
            draw_rtl(canv, x_out, 8 * mm, book_pg, "Sans-Bold", 8)          # outer = left
            canv.setFillColor(MUTED)
            draw_rtl(canv, x_in, 8 * mm, "saulspodship.com", "Sans", 7, "right")
        else:
            # recto: outer edge = right of sheet
            x_in, x_out = BOOK_W + GUTTER, PAGE_W - MARGIN
            if chapter:
                canv.setFillColor(WINE)
                draw_rtl(canv, x_in, y, chapter, "Sans", 7)
            canv.setFillColor(MUTED)
            draw_rtl(canv, x_out, y, BOOK_TITLE, "Sans", 7, "right")
            canv.setFillColor(MUTED)
            draw_rtl(canv, x_in, 8 * mm, "saulspodship.com", "Sans", 7)
            canv.setFillColor(WINE)
            draw_rtl(canv, x_out, 8 * mm, book_pg, "Sans-Bold", 8, "right")      # outer = right
        canv.restoreState()

    def beforeDocument(self):
        self.chapter_label = ""
        self.part_label = ""
        self._pending_tpl = "cover"
        self.pageTemplate = self._tpls["cover"]

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            text = flowable.getPlainText()
            if style == "part_title":
                self.notify("TOCEntry", (0, text, self.page))
                self.part_label = text
                self.chapter_label = ""
                self._pending_tpl = "bodyL"
            elif style == "chap_title":
                self.notify("TOCEntry", (1, text, self.page))
                self.chapter_label = re.sub(r"\s*[—–]\s*", " · ", text)[:60]



# ---------------------------------------------------------------- TOC
def make_toc():
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(name="toc0", fontName="Sans-Bold", fontSize=11.5, leading=19,
                       textColor=WINE, spaceBefore=12, spaceAfter=3),
        ParagraphStyle(name="toc1", fontName="Serif", fontSize=9.5, leading=14.5,
                       textColor=INK, leftIndent=12, spaceBefore=2),
    ]
    toc.dotsMinLevel = 0
    return toc


# ---------------------------------------------------------------- part/chapter helpers

# ---------------------------------------------------------------- part openers
# Part dividers and the closing page are chrome rather than translated content,
# so their wording lives here.  Urdu strings were added because the dividers
# were printing English headings in the middle of the Urdu book.
_PART_EN = {
    "1": ("The Fifty Volumes",
          "The full Bible encyclopedia, volume by volume, with tables, timelines and pictures"),
    "2": ("Bible Maps",
          "Eight journey maps that walk the routes of Abraham, Moses, Paul and Jesus"),
    "3": ("Four Hundred Questions",
          "One hundred questions each on Islam, Judaism, Hinduism and Sikhism, answered with care"),
    "4": ("One Thousand Answers",
          "Short Bible study questions sorted by book, from the Law to Revelation"),
    "5": ("Hard Questions",
          "One hundred tough questions, with answers from five Christian traditions"),
    "6": ("Angels and the Watchers",
          "Holy beings, fallen watchers, beasts and the stories the Bible tells about them"),
    "7": ("Prophecy and World Faiths",
          "How prophecies were fulfilled, the religions of the world, and the family line from Adam to Jesus"),
    "8": ("Music and Podcasts",
          "Pakistani gospel singers, the Punjabi Zaboor psalms, and the podcast episodes"),
    "A": ("Appendix",
          "The family of websites, common questions, and Bible book counts"),
}
_PART_UR = {
    "1": ("پچاس جلدوں کا مجموعہ",
          "مکمل بائبل دائرۃ المعارف، جلد بہ جلد، جدولوں، زمانوں اور تصویروں کے ساتھ"),
    "2": ("بائبل کے نقشے",
          "آٹھ سفری نقشے جو ابراہیم، موسیٰ، پولس اور یسوع کے راستوں پر لے جاتے ہیں"),
    "3": ("چار سو سوالات",
          "اسلام، یہودیت، ہندومت اور سکھ مت پر ایک ایک سو سوالات، احتیاط سے دیے گئے جوابات"),
    "4": ("ایک ہزار جوابات",
          "بائبل کے مختصر مطالعاتی سوالات، کتاب بہ کتاب، توریت سے مکاشفہ تک"),
    "5": ("مشکل سوالات",
          "ایک سو مشکل سوالات، پانچ مسیحی روایات کے جوابات کے ساتھ"),
    "6": ("فرشتے اور نگہبان",
          "مقدس ہستیاں، گِرے ہوئے نگہبان، حیوانات اور اُن کے بارے میں بائبل کی روایات"),
    "7": ("پیشین گوئی اور عالمی مذاہب",
          "کیسے پیشین گوئیاں پوری ہوئیں، دنیا کے مذاہب، اور آدم سے یسوع تک کا نسب"),
    "8": ("موسیقی اور پوڈکاسٹ",
          "پاکستانی انجیلی گلوکار، پنجابی زبور کے بھجن، اور پوڈکاسٹ اقساط"),
    "A": ("ضمیمہ",
          "ویب سائٹس کا خاندان، عام سوالات، اور بائبل کی کتابوں کی تعداد"),
}
_HI_KEEP = _PART_EN


def part_text(num, title, subtitle):
    """Localised wording for a part divider."""
    if LANG == "ur":
        t, sub = _PART_UR.get(num, (title, subtitle))
        return f"حصہ {num}", t, sub
    return f"PART {num}", title, subtitle


def part_page(num: str, title: str, subtitle: str, hero: Path | None = None) -> list:
    """Part divider: opens on a right-hand page with a full-width picture."""
    kicker, title, subtitle = part_text(num, title, subtitle)
    flow = [
        NextPageTemplate("bodyR"),
        PageBreak(),
        EnsureRecto(),
        Spacer(1, 14 * mm),
        para(kicker, ST["part"]),
        para(clean_plain(title), ST["part_title"]),
        Spacer(1, 3 * mm),
        para(clean_plain(subtitle), ST["part_sub"]),
        Spacer(1, 8 * mm),
    ]
    if hero and Path(hero).exists():
        flow += img_flowable(Path(hero), BOOK_W - 2 * MARGIN - GUTTER, 88 * mm)
    # no trailing PageBreak: the next chapter_head() breaks once (no blank between)
    return flow


def clean_plain(s: str) -> str:
    """Plain book wording: no long dashes, no emoji."""
    s = clean(s)
    s = s.replace("—", " · ").replace("–", "-")
    s = re.sub(r"\s*·\s*·\s*", " · ", s)
    s = re.sub(r"\s+", " ", s).strip(" ·")
    return s


def chapter_head(no: str, title: str, subtitle: str | None = None,
                 hero: Path | None = None, kicker: str | None = None) -> list:
    flow = [PageBreak()]
    if kicker:
        flow.append(para(clean_plain(kicker), ST["chap_no"]))
    flow.append(para(clean_plain(title), ST["chap_title"]))
    if subtitle:
        flow.append(para(clean_plain(subtitle), ST["chap_sub"]))
    flow.append(Spacer(1, 4))
    if hero and Path(hero).exists():
        flow.extend(img_flowable(Path(hero), BOOK_W - 2 * MARGIN - GUTTER, 70 * mm))
    return flow


def section_h(text: str) -> list:
    return [para(clean(text), ST["h2"])]


def sub_h(text: str) -> list:
    return [para(clean(text), ST["h3"])]


class EnsureRecto(ActionFlowable):
    """Force the part opener onto the right-hand half of a fresh spread."""

    def apply(self, doc):
        # After PageBreak we are at the start of a new spread. Content should
        # sit on the recto (right half). If the active template is not bodyR,
        # switch it so the left half stays empty (no header drawn there).
        if getattr(doc, "pageTemplate", None) is not None and doc.pageTemplate.id != "bodyR":
            doc.pageTemplate = doc._tpls["bodyR"]


# ================================================================ BUILD
def build():
    vols = load("volumes.json")
    codex = load("codex.json")
    archive = load("archive.json")
    tough = load("tough.json")
    atlas = load("atlas.json")
    lens = load("prophecy_lens.json")
    world = load("world_faiths.json")
    gene = load("genealogy.json")
    music = load("music.json")
    watchers = load("watchers.json")
    docs = load("docs.json")
    about = load("about.json")
    xref = load("crossrefs_meta.json")

    fm = load("frontmatter.json")

    story = []

    # ================= COVER =================
    story += [
        NextPageTemplate("cover"),
        Spacer(1, 34 * mm),  # clear the wine banner drawn by _cover_page
        para(clean_plain(fm["cover_kicker"]), ST["cover_kicker"]),
        Spacer(1, 5 * mm),
        para("Saul's Podship", ST["cover_title"]),
        Spacer(1, 6 * mm),
        para(clean(fm["cover_lede"]), ST["cover_sub"]),
        Spacer(1, 6 * mm),
    ]
    hero_path = ROOT / "public/images/hero/last-supper-v2-1920.jpg"
    if not hero_path.exists():
        hero_path = ROOT / "public/images/volumes/all-bible-stories/hero-1920.jpg"
    if hero_path.exists():
        story += img_flowable(hero_path, BOOK_W - 36 * mm, 50 * mm)
    story += [
        Spacer(1, 3 * mm),
        para(
            clean(fm["cover_note"]),
            S("cover_f", fontName="Sans", fontSize=9.5, leading=14, textColor=MUTED,
              alignment=TA_CENTER),
        ),
        Spacer(1, 2 * mm),
        para(
            "Solat Jamil · " + datetime.date.today().strftime("%d %B %Y"),
            S("cover_d", fontName="Sans-Bold", fontSize=10, leading=14, textColor=GOLD,
              alignment=TA_CENTER),
        ),
        NextPageTemplate("front"),
        PageBreak(),
    ]

    # ================= DEDICATION =================
    ded_lead = 13 if LANG == "hi" else 19
    story += [
        Spacer(1, 48 * mm),
        para(clean_plain(fm["dedication_title"]), S(
            "ded_k", fontName="Sans-Bold", fontSize=11, leading=15, textColor=GOLD,
            alignment=TA_CENTER, spaceAfter=14)),
        para(clean_plain(fm["dedication_heading"]), S(
            "ded_h", fontName="Serif-Bold", fontSize=20, leading=27, textColor=WINE,
            alignment=TA_CENTER, spaceAfter=18)),
        para(clean(fm["dedication_body1"]), S(
            "ded_b", fontName="Serif", fontSize=12, leading=ded_lead, textColor=INK,
            alignment=TA_CENTER, spaceAfter=14)),
        para(clean(fm["dedication_body2"]), S(
            "ded_b2", fontName="Serif", fontSize=12, leading=ded_lead, textColor=INK,
            alignment=TA_CENTER, spaceAfter=14)),
        para(clean(fm["dedication_body3"]), S(
            "ded_b3", fontName="Serif", fontSize=12, leading=ded_lead, textColor=WINE,
            alignment=TA_CENTER, spaceBefore=6, spaceAfter=22)),
        para(clean_plain(fm["dedication_sign"]), S(
            "ded_sig", fontName="Serif-Bold", fontSize=13, leading=17, textColor=WINE,
            alignment=TA_CENTER)),
        NextPageTemplate("bodyR"),
        PageBreak(),
    ]

    # ================= ABOUT THIS BOOK =================
    # Scripture source note varies by edition
    if LANG == "ur":
        scripture_note = (
            "اس ایڈیشن میں بائبل کے تمام حوالے کِتابِ مُقادّس "
            "(Revised Urdu Bible, Bible Society 2010) سے لیے گئے ہیں، جو "
            "YouVersion پر version 189 کے نام سے دستیاب ہے "
            "(bible.com/versions/189)۔"
        )
    elif LANG == "hi":
        scripture_note = (
            "इस संस्करण में बाइबल के सभी सन्दर्भ मानक हिन्दी बाइबल से लिए गए हैं; "
            "क्रॉस-रेफ़रंस डेटा का श्रेय openbible.info को है।"
        )
    else:
        scripture_note = (
            "Bible quotes are from the King James Version, which is free to print. "
            "The cross reference data is credited to openbible.info."
        )
    story += [
        para(clean_plain(fm["about_title"]), ST["h1"]),
        para(clean(fm["about_body"]), ST["body"]),
        para(scripture_note, ST["body"]),
        sub_h(fm["inside_title"]),
    ]
    story += make_table([clean_plain(h) for h in fm["table_headers"]],
                        [[clean_plain(c) for c in row] for row in fm["table_rows"]],
                        col_widths=[0.12, 0.34, 0.54])
    story.append(PageBreak())

    # ================= TOC =================
    story += [para(clean_plain(fm["toc_title"]), ST["h1"]),
              Spacer(1, 4),
              make_toc(), PageBreak()]

    def hero(name, *fallbacks):
        for n in (name, *fallbacks):
            pp = ROOT / "public" / n.lstrip("/")
            if pp.exists():
                return pp
        return None

    # ================================================================
    # PART 1 — THE FIFTY VOLUMES
    # ================================================================
    story += part_page(
        "1", "The Fifty Volumes",
        "The full Bible encyclopedia, volume by volume, with tables, timelines and pictures",
        hero("images/volumes/all-bible-stories/hero-1920.jpg"),
    )

    for v in vols:
        story += build_volume_chapter(v)

    # ================================================================
    # PART 2 — BIBLICAL ATLAS
    # ================================================================
    story += part_page(
        "2", "Bible Maps",
        "Eight journey maps that walk the routes of Abraham, Moses, Paul and Jesus",
        hero("images/hero-biblical-maps.jpg"),
    )

    story += chapter_head("", "Walking the Bible Maps", kicker="Part 2",
                          hero=hero("images/volumes/biblical-maps/hero-1920.jpg"))
    story += [para(
        "These eight maps show real places on true geography. On the website you can "
        "press a button and watch footsteps trace each route, stop by stop. The coastlines "
        "come from Natural Earth, which is free for everyone to use. The routes follow "
        "standard scholarly reconstructions, so a few details are approximate. Use them "
        "to picture where these stories actually happened.",
        ST["lead"],
    )]
    map_meta = {
        "abraham-journey": ("Abraham's Journey", "From Ur of the Chaldees through Haran to Canaan — the call of Abraham in three great stages (Genesis 11–13)."),
        "exodus": ("The Exodus from Egypt", "Rameses to the Sea crossing, Elim and Mount Sinai, the wilderness of Paran, Kadesh-barnea and on to Beersheba — the redemption route of Exodus–Numbers."),
        "paul-journeys": ("Paul's Missionary Journeys", "Jerusalem, Antioch, Tarsus, the Galatian cities, Philippi, Athens, Corinth and beyond — the gospel into the Gentile world."),
        "seven-churches": ("The Seven Churches of Revelation", "Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea — the letters of Revelation 2–3 on the Anatolian road."),
        "holy-land-jesus": ("The Holy Land in the Time of Jesus", "Nazareth, Capernaum, Jericho, Bethlehem and Jerusalem — the geography of the Gospels."),
        "kingdom-israel-judah": ("Kingdom of Israel & Judah", "Samaria, capital of the ten tribes, and Jerusalem, capital of Judah — with the road to Assyria (722 BC)."),
        "ancient-near-east": ("Ancient Near East — Empires & Exiles", "Israel and Judah between Assyria (722 BC) and Babylon (586 BC) — the world of the prophets."),
        "roman-empire-jesus": ("The Roman Empire in Jesus' Time", "Jerusalem, Antioch — where believers were first called Christians — and Rome, the gospel to the ends of the earth."),
    }
    for idx, r in enumerate(atlas, 1):
        name = r.get("name") or map_meta.get(r["key"], ("", ""))[0]
        img = ROOT / "public" / r.get("img", "").lstrip("/")
        stops = r.get("stops") or []
        blurb = map_meta.get(r["key"], (name, ""))[1]
        story += [safe_para(f"{idx}. {clean_plain(name)}", ST["h2"])]
        if blurb:
            story += [safe_para(clean_plain(blurb), ST["body"])]
        story += img_flowable(img, BOOK_W - 2 * MARGIN - GUTTER, 118 * mm)
        stop_rows = [[str(i + 1), s[2]] for i, s in enumerate(stops)]
        if stop_rows:
            story += make_table(["Stop", "Station"], stop_rows, col_widths=[0.1, 0.9])
    story += chapter_head("", "The World Map", kicker="Part 2",
                          hero=hero("images/hero-prophecy.jpg"))
    story += [para(
        "After walking the sacred journeys, lift your eyes to the whole world the gospel now "
        "covers. The world-faith map (Part VIII) carries the same dataset the live site "
        "woven into its Interlinked Bible module: seven tradition categories across 175 "
        "countries, on a total population of 8.23 billion.",
        ST["body"],
    )]

    # ================================================================
    # PART 3 — CODEX
    # ================================================================
    story += part_page(
        "3", "Four Hundred Questions",
        "One hundred questions each on Islam, Judaism, Hinduism and Sikhism, answered with care",
        hero("images/volumes/comparative-religion/hero-1920.jpg"),
    )

    story += chapter_head("", "How These Answers Were Written", kicker="Part 3",
                          hero=hero("images/hero-jesus-alpha-omega.jpg"))
    story += [para(clean(codex.get("sidebar", "")), ST["lead"])]
    story += [para(clean(codex.get("preface_title", "A Note on Method")), ST["h2"])]
    for p in codex.get("preface", []):
        story += [safe_para(inline_md(p), ST["body"])]
    story += [para(
        "Each entry follows the same structure: Context; the mainstream position with "
        "primary sources; a Christian apologetic response; and points for respectful "
        "discussion — because a debate opponent who feels straw-manned will not listen, no "
        "matter how strong the argument is.",
        ST["body"],
    )]

    rel_order = ["islam", "judaism", "hinduism", "sikhism"]
    for rel in rel_order:
        qs = [q for q in codex["questions"] if q.get("religion") == rel]
        if not qs:
            continue
        sec = codex.get("sections", {}).get(rel, {})
        eyebrow = sec.get("eyebrow", "")
        title = sec.get("title", rel.title())
        sub = sec.get("sub", "")
        story += chapter_head("", f"{title}", subtitle=sub if sub else None,
                              kicker=f"Part 3 · {eyebrow}")
        if sec.get("lead"):
            story += [para(clean_plain(sec["lead"]), ST["lead"])]
        for q in qs:
            story += build_codex_question(q)

    # ================================================================
    # PART 4 — THEOLOGICAL ARCHIVE
    # ================================================================
    story += part_page(
        "4", "One Thousand Answers",
        "Short Bible study questions sorted by book, from the Law to Revelation",
        hero("images/volumes/complete-christian-theology-map/hero-1920.jpg"),
    )

    story += chapter_head("", "The Study Archive", kicker="Part 4",
                          hero=hero("images/stories/scenes/book.webp"))
    total_items = sum(len(c["items"]) for c in archive)
    story += [para(
        f"This archive holds {total_items} questions in {len(archive)} groups of "
        "Scripture. Each one gives a short answer, a Bible reference, and when it helps, "
        "a note that opens up the meaning behind the answer.",
        ST["lead"],
    )]
    idx_rows = [[c["name"], str(len(c["items"]))] for c in archive]
    story += make_table(["Category", "Entries"], idx_rows, col_widths=[0.8, 0.2])

    for c in archive:
        story += [CondPageBreak(40 * mm), para(clean(c["name"]), ST["h2"])]
        rows = []
        for it in c["items"]:
            ans = it.get("a") or ""
            ref = it.get("ref") or ""
            note = it.get("note") or ""
            cell_q = f"<b>{it.get('q','')}</b><br/>{ans}"
            if note:
                cell_q += f"<br/><font color='#7a6a5f' size='6.8'>{note}</font>"
            rows.append([cell_q, ref])
        story += make_table(["Question & answer", "Reference"], rows,
                            col_widths=[0.82, 0.18])

    # ================================================================
    # PART 5 — TOUGH QUESTIONS
    # ================================================================
    story += part_page(
        "5", "Hard Questions",
        "One hundred tough questions, with answers from five Christian traditions",
        hero("images/volumes/apologetics-40-critical-questions/hero-1920.jpg"),
    )

    story += chapter_head("", "One Hundred Tough Questions", kicker="Part 5",
                          hero=hero("images/volumes/jesus-is-god-full-references-ot-nt/hero-1920.jpg"))
    tier_names = {1: "Tier 1 — Most asked", 2: "Tier 2 — Common", 3: "Tier 3 — Advanced"}
    view_names = {
        "catholic": "Catholic", "orthodox": "Orthodox", "protestant": "Protestant",
        "anglican": "Anglican", "pentecostal": "Pentecostal",
    }
    story += [para(
        "Each question below comes with a plain answer, a verse from the King James "
        "Bible, and five responses from different Christian traditions. Where a tradition "
        "has a famous quotation to offer, it is included.",
        ST["lead"],
    )]
    for q in tough:
        tier = q.get("tier", 1)
        story += [CondPageBreak(30 * mm)]
        story += [para(
            f"Q{q.get('id')}. {clean(q.get('q',''))}",
            ST["q_title"],
        )]
        meta_bits = []
        if tier in tier_names:
            meta_bits.append(tier_names[tier])
        if q.get("region"):
            meta_bits.append(f"Asked in: {q['region']}")
        if q.get("ref"):
            meta_bits.append(q["ref"])
        story += [para(clean(" · ".join(meta_bits)), ST["small"])]
        if q.get("rv"):
            story += [para(f"<i>{inline_md(q['rv'])}</i>", ST["quote"])]
        common = (q.get("common") or {}).get("en", "")
        if common:
            story += [para(f"<b>Common answer.</b> {inline_md(common)}", ST["body"])]
        views = q.get("views") or []
        if views:
            rows = []
            for v in views:
                name = view_names.get(v.get("key", ""), v.get("key", "").title())
                detail = v.get("detail") or ""
                quote = v.get("quote") or {}
                cell = f"<b>{v.get('summary','')}</b>"
                if detail:
                    cell += f"<br/>{detail}"
                if quote:
                    cell += (f"<br/><i>“{quote.get('text','')}”</i> "
                             f"<font color='#7a6a5f'>{quote.get('cite','')}</font>")
                rows.append([name, cell])
            story += make_table(["Tradition", "Response"], rows, col_widths=[0.16, 0.84])

    # ================================================================
    # PART 6 — WATCHERS ATLAS
    # ================================================================
    story += part_page(
        "6", "Angels and the Watchers",
        "Holy beings, fallen watchers, beasts and the stories the Bible tells about them",
        hero("images/volumes/angels-demons-beasts-monsters-in-the-bible/hero-1920.jpg"),
    )

    story += chapter_head("", watchers.get("title", "Angels and the Watchers"),
                          kicker="Part 6",
                          hero=hero("images/volumes/forbidden-knowledge-the-watchers/hero-1920.jpg"))
    if watchers.get("lede"):
        story += [para(clean_plain(watchers["lede"]), ST["lead"])]
    for n in watchers.get("notices", []):
        story += [para(clean(n), ST["body"])]

    for sec in watchers.get("sections", []):
        title = sec.get("title") or ""
        if title:
            story += [CondPageBreak(35 * mm), para(clean(title), ST["h2"])]
        story += watchers_blocks_to_flowables(sec.get("blocks", []))

    story += [CondPageBreak(60 * mm),
              para("Visual index — key figures and beings", ST["h2"])]
    story += [para(
        "Each profile in the atlas carries its own distinct artwork — sourced historical "
        "images where they exist, and text-guided reconstructions strictly limited to the "
        "forms the Bible or 1 Enoch describes. Concept and claim rows carry no images, so "
        "no picture pretends to be evidence.",
        ST["body"],
    )]
    assets = watchers.get("assets", {})
    feature_names = watchers.get("feature_names", [])
    if feature_names:
        story += [para("Featured gallery", ST["h3"])]
        story += asset_grid(feature_names, assets, cols=3, thumb=True)
    story += [para("Complete image catalogue", ST["h3"])]
    story += asset_grid(list(assets.keys()), assets, cols=4, thumb=True)

    # ================================================================
    # PART 7 — PROPHECY, WORLD FAITHS, GENEALOGY
    # ================================================================
    story += part_page(
        "7", "Prophecy and World Faiths",
        "How prophecies were fulfilled, the religions of the world, and the family line from Adam to Jesus",
        hero("images/hero-second-coming.jpg", "images/hero-prophecy.jpg"),
    )

    story += chapter_head("", "Two Hundred Forty Seven Prophecies", kicker="Part 7",
                          hero=hero("images/hero-prophecy.jpg"))
    story += [para(
        "Every prophecy on the live prophecy map carries three ways of reading it. "
        "The historical view looks at what happened in the past. The metaphorical view "
        "sees a spiritual meaning in Christ. The futurist view waits for a literal "
        "fulfillment still to come. This way you can see which school of theology counts "
        "each prophecy as complete.",
        ST["lead"],
    )]
    lens_rows = []
    for k, v in lens.items():
        lens_rows.append([
            k.replace("m-", "").replace("p-", "").replace("-", " "),
            v.get("h", ""), v.get("m", ""), v.get("f", ""),
        ])
    story += make_table(["Prophecy", "Historical", "Metaphorical", "Futurist"],
                        lens_rows, col_widths=[0.28, 0.24, 0.24, 0.24])
    story += [para("Reading the tags", ST["h3"])]
    tag_counts = defaultdict(int)
    for v in lens.values():
        tag_counts[v.get("h", "")] += 1
    gloss_rows = [[k, str(v)] for k, v in sorted(tag_counts.items(), key=lambda x: -x[1])]
    story += make_table(["Historical-lens tag", "Prophecies"], gloss_rows,
                        col_widths=[0.75, 0.25])

    story += chapter_head("", "World Religions and People", kicker="Part 7",
                          hero=hero("images/volumes/worlds-all-big-churches/hero-1920.jpg"))
    story += [para(
        f"Total world population represented: {world['worldPop']:,}. The dominant-tradition "
        "map colours each of 175 countries by its largest religious community.",
        ST["lead"],
    )]
    cat_rows = []
    for key, c in world["cats"].items():
        cat_rows.append([c["label"], f"{c['adherents']:,}",
                         f"{100 * c['adherents'] / world['worldPop']:.1f}%"])
    story += make_table(["Tradition", "Adherents (est.)", "Share of world"],
                        cat_rows, col_widths=[0.4, 0.3, 0.3])
    story += [para("Largest countries by dominant tradition", ST["h3"])]
    by_cat = defaultdict(list)
    for c in world["countries"]:
        by_cat[c["cat"]].append(c)
    rows = []
    for key in world["cats"]:
        label = world["cats"][key]["label"]
        top = sorted(by_cat.get(key, []), key=lambda x: -x["pop"])[:6]
        for i, c in enumerate(top):
            rows.append([label if i == 0 else "", c["name"],
                         f"{c['pct']}%", f"{c['pop']:,}"])
    story += make_table(["Tradition", "Country", "% dominant", "Population"],
                        rows, col_widths=[0.25, 0.35, 0.15, 0.25])

    story += chapter_head("", "From Adam to Jesus", kicker="Part 7",
                          hero=hero("images/volumes/family-tree-adam-jesus/hero-1920.jpg"))
    story += [para(
        "Every row is one person's life; where lives overlap, those people were alive "
        "together. Ages in Genesis 5 and 11 (Hebrew text; the Septuagint differs) give "
        "absolute dates for the antediluvian and early postdiluvian patriarchs. From Judah "
        "onward Scripture lists names but not ages, and Matthew's list skips some "
        "generations, so those bars are estimates built from known reign dates and "
        "generation spacing (shown as approx). Enoch is shown to age 365, when God took "
        "him. Chronology is Ussher-style years from creation (AM).",
        ST["body"],
    )]
    g_rows = []
    for p in gene["people"]:
        approx = "≈" if p.get("approx") else ""
        g_rows.append([
            p["name"],
            f"{p['birthAM']} AM",
            f"{p['deathAM']} AM",
            f"{p['deathAM'] - p['birthAM']} yr",
            approx + str(4004 - p["deathAM"]) + " BC" if p["deathAM"] <= 4004 else "",
        ])
    story += make_table(["Person", "Born (AM)", "Died (AM)", "Lifespan", "Death (BC)"],
                        g_rows, col_widths=[0.34, 0.16, 0.16, 0.14, 0.20])
    if gene.get("page_text"):
        story += [para(clean(gene["page_text"][:1200]), ST["small"])]

    # ================================================================
    # PART 8 — MUSIC & BROADCAST
    # ================================================================
    story += part_page(
        "8", "Music and Podcasts",
        "Pakistani gospel singers, the Punjabi Zaboor psalms, and the podcast episodes",
        hero("images/podcast/show-cover.jpg"),
    )

    story += chapter_head("", "The Singers and Their Story", kicker="Part 8",
                          hero=hero("images/volumes/guide-to-christian-living/hero-1920.jpg"))
    story += [para(
        "This is a living archive of Pakistani Christian music. It follows four "
        "generations of one family, beginning with a founding pastor in Montgomery, "
        "which is now called Sahiwal, and running through to today's composers and "
        "maestros.",
        ST["lead"],
    )]
    all_singers = (music.get("dynasty", []) + music.get("pioneers", [])
                   + music.get("veterans", []))
    s_rows = []
    for s in all_singers:
        contrib = "; ".join(s.get("majorContributions", [])[:3])
        s_rows.append([
            s.get("name", ""),
            s.get("role", ""),
            s.get("dates") or s.get("era", ""),
            contrib,
        ])
    story += make_table(["Name", "Role", "Dates / Era", "Major contributions"],
                        s_rows, col_widths=[0.18, 0.22, 0.18, 0.42])
    story += [para("Full profiles — the honored Din dynasty", ST["h3"])]
    for s in music.get("dynasty", []):
        story += [CondPageBreak(25 * mm)]
        story += [para(clean(f"{s.get('name')} — {s.get('badge','')}"), ST["q_title"])]
        if s.get("lineageNote"):
            story += [para(clean(s["lineageNote"]), ST["small"])]
        story += [para(inline_md(s.get("bio", "")), ST["body"])]
        for b in s.get("majorContributions", []):
            story += [para(f"• {inline_md(b)}", ST["bullet"])]

    story += chapter_head("", "Punjabi Zaboor, the Psalm Songs", kicker="Part 8",
                          hero=hero("images/volumes/lords-prayer/hero-1920.jpg"))
    story += [para(
        "These are the biblical Psalms put into classical Punjabi meters by Imam-ud-Din "
        "Shahbaz in 1908. Each one is listed with its raga and its English theme. The "
        "full hymn texts live at punjabizaboor1908.com.",
        ST["lead"],
    )]
    z_rows = []
    for z in music.get("zaboor", []):
        z_rows.append([str(z["number"]), z.get("title", ""),
                       z.get("englishTheme", ""), z.get("raga", "")])
    story += make_table(["Psalm", "Punjabi title", "English theme", "Raga"],
                        z_rows, col_widths=[0.08, 0.32, 0.40, 0.20])

    story += chapter_head("", "Podcasts and Video Lessons", kicker="Part 8",
                          hero=hero("images/podcast/ep01-cover.jpg"))
    pod = music.get("podcast", {})
    story += [para(clean_plain(pod.get("title", "Podcast")), ST["h2"])]
    story += [para(clean_plain(pod.get("description", "")), ST["body"])]
    # show a few episode covers as a strip
    cover_flow = []
    for ep_i in range(1, 7):
        cp = ROOT / f"public/images/podcast/ep{ep_i:02d}-cover.jpg"
        if cp.exists():
            cover_flow += img_flowable(cp, 28 * mm, 28 * mm)
    if cover_flow:
        story += [Spacer(1, 4)] + cover_flow + [Spacer(1, 4)]
    story += [para(
        f"Show: {pod.get('showUrl','')} · Language: {pod.get('languageLabel','')} · "
        f"Category: {pod.get('category','')}",
        ST["small"],
    )]
    e_rows = []
    for e in music.get("episodes", []):
        topics = ", ".join(e.get("topics", [])[:4])
        e_rows.append([
            str(e.get("number", "")),
            e.get("titleEnglish") or e.get("titleRoman", ""),
            e.get("duration", ""),
            e.get("publishDate", ""),
            topics,
        ])
    story += make_table(["Ep.", "Episode (English working title)", "Length", "Published", "Topics"],
                        e_rows, col_widths=[0.06, 0.44, 0.10, 0.14, 0.26])
    story += [para("Episode notes", ST["h3"])]
    for e in music.get("episodes", []):
        story += [CondPageBreak(22 * mm)]
        story += [para(
            f"<b>Ep. {e.get('number')} · {clean_plain(e.get('titleEnglish',''))}</b> "
            f"<font color='#7a6a5f'>({e.get('duration','')}, {e.get('publishDate','')})</font>",
            ST["faq_q"])]
        ecp = ROOT / f"public/images/podcast/ep{int(e.get('number') or 0):02d}-cover.jpg"
        if ecp.exists():
            story += img_flowable(ecp, 34 * mm, 34 * mm)
        if e.get("titleRoman"):
            story += [para(f"<i>{clean(e['titleRoman'])}</i> · {clean(e.get('title',''))}",
                                ST["small"])]
        story += [para(inline_md(e.get("description", "")), ST["body"])]
        if e.get("notesUrdu"):
            story += [para(
                f"<font color='#7a6a5f'>Full Urdu show notes on the live episode page "
                f"({len(e['notesUrdu'])} characters).</font>", ST["small"])]
        refs = e.get("scriptureReferences") or []
        if refs:
            story += [para(f"<b>Scripture:</b> {clean(', '.join(refs))}", ST["small"])]

    ch = music.get("video_channel", {})
    story += [Spacer(1, 6), para(clean(ch.get("name", "Video masterclasses")), ST["h2"])]
    story += [para(clean(ch.get("description", "")), ST["body"])]
    v_rows = []
    for v in music.get("videos", []):
        v_rows.append([
            str(v.get("number", "")), v.get("title", ""), v.get("duration", ""),
            v.get("publishDate", ""), ", ".join(v.get("topics", [])),
        ])
    story += make_table(["#", "Masterclass", "Length", "Published", "Topics"],
                        v_rows, col_widths=[0.05, 0.45, 0.10, 0.14, 0.26])

    # ================================================================
    # APPENDICES
    # ================================================================
    story += part_page(
        "A", "Appendix",
        "The family of websites, common questions, and Bible book counts",
        hero("images/apps/biblical-languages.webp") or ROOT / "public/images/stories/scenes/book.webp",
    )

    story += chapter_head("", "Our Family of Websites", kicker="Appendix",
                          hero=hero("images/stories/scenes/city.webp"))
    story += [para(clean_plain(about.get("directory_intro", "")), ST["lead"])]
    a_rows = []
    for app in about.get("apps", []):
        a_rows.append([app.get("name", ""), app.get("category", ""),
                       app.get("url", "").replace("https://", ""),
                       app.get("description", "")])
    story += make_table(["App", "Category", "URL", "Description"], a_rows,
                        col_widths=[0.16, 0.16, 0.24, 0.44])
    story += sub_h("About FAQ")
    for f in about.get("about_faq", []):
        story += [para(clean(f["question"]), ST["faq_q"]),
                  para(inline_md(f["answer"]), ST["body"])]

    story += chapter_head("", "Questions People Ask", kicker="Appendix",
                          hero=hero("images/stories/scenes/scroll.webp", "images/stories/scenes/book.webp"))
    for f in about.get("faq", []):
        story += [para(clean(f["question"]), ST["faq_q"]),
                  para(inline_md(f["answer"]), ST["body"])]

    story += chapter_head("", "Bible Books and Counts", kicker="Appendix",
                          hero=hero("images/stories/scenes/book.webp"))
    story += [para(
        f"License: {clean(xref.get('license',''))}. Credits: {clean(xref.get('credits',''))}. "
        f"Generated {xref.get('generated','')}.",
        ST["body"],
    )]
    story += [para(
        "The Interlinked Bible / cross-reference module maps every verse of the King James "
        "Version against openbible.info's topical links — 66 books, with chapter and verse "
        "counts used to lay out the classic chord diagram.",
        ST["body"],
    )]
    x_rows = []
    for b in xref.get("books", []):
        x_rows.append([b.get("n", ""), b.get("a", ""), str(b.get("c", "")),
                       str(b.get("v", ""))])
    story += make_table(["Book", "Abbr.", "Chapters", "Verses"], x_rows,
                        col_widths=[0.44, 0.16, 0.2, 0.2])
    story += sub_h("World faith dataset (as shipped)")
    story += [para(
        "The world map module ships dominant-tradition polygons for 175 countries with "
        "population and percentage shares — the same data tabulated earlier in Part 7.",
        ST["body"],
    )]

    story += [PageBreak(),
              Spacer(1, 42 * mm),
              para("اختتام" if LANG == "ur" else "THE END", ST["part"]),
              para("پڑھنے کا شکریہ" if LANG == "ur"
                   else ("पढ़ने के लिए धन्यवाद" if LANG == "hi" else "Thank you for reading"),
                   ST["part_title"]),
              Spacer(1, 6 * mm),
              para(
                  "Solat Jamil · saulspodship.com · "
                  + datetime.date.today().strftime("%d %B %Y"),
                  ST["part_sub"]),
              Spacer(1, 4 * mm),
              para(
                  "Urdu Scripture: کِتابِ مُقادّس (Revised Urdu Bible) · bible.com/189"
                  if LANG == "ur" else
                  "Hindi Scripture: standard Hindi Bible · saulspodship.com"
                  if LANG == "hi" else
                  "Scripture: King James Version",
                  S("end_script", fontName="Sans", fontSize=8, leading=11,
                    textColor=MUTED, alignment=TA_CENTER)),
              Spacer(1, 10 * mm),
              ]
    end_hero = hero("images/hero/last-supper-v2-1920.jpg")
    if end_hero:
        story += img_flowable(end_hero, BOOK_W - 30 * mm, 60 * mm)

    # ================= BUILD =================
    flat = []

    def _flatten(seq, depth=0):
        for x in seq:
            if isinstance(x, list):
                if depth > 6:
                    raise RuntimeError(f"deep nesting at {type(x)}")
                _flatten(x, depth + 1)
            else:
                flat.append(x)

    _flatten(story)
    print(f"Story flowables: {len(flat)}")
    story = flat
    print("Building PDF (pass 1 — layout & TOC)…")
    doc = BookDoc(str(OUT_PDF))
    doc.multiBuild(story)
    size = OUT_PDF.stat().st_size
    print(f"Done → {OUT_PDF} ({size/1e6:.1f} MB)")


# ---------------------------------------------------------------- volume chapter
def build_volume_chapter(v: dict) -> list:
    hero = None
    hi = v.get("heroImage") or {}
    if hi.get("src"):
        hero = ROOT / "public" / hi["src"].lstrip("/")
        if not hero.exists():
            hero = None
    flow = chapter_head("", v["title"], v.get("subtitle"), hero=hero,
                        kicker=f"Part 1 · Volume {v['number']:02d}")
    meta = [v.get("category", "").title(), f"Updated {v.get('lastUpdated','')}"]
    if v.get("featured"):
        meta.append("Featured")
    flow += [para(" · ".join(m for m in meta if m), ST["small"])]
    if v.get("overview"):
        flow += [para(clean_plain(v["overview"]), ST["lead"])]
    if v.get("summary"):
        flow += [para(f"<b>Summary.</b> {inline_md(v['summary'])}", ST["body"])]
    kf = v.get("keyFacts") or []
    if kf:
        flow += sub_h("Key facts")
        flow += make_table(["Fact"], [[f] for f in kf], col_widths=[1.0])
    c = v.get("content") or {}
    analysis = c.get("analysis") or ""
    if analysis.strip():
        flow += sub_h("Analysis")
        flow += md_to_flowables(analysis)
    tables = c.get("tables") or []
    for t in tables:
        flow += [CondPageBreak(30 * mm), sub_h(t.get("title", "Table"))]
        flow += make_table(t.get("headers") or [], t.get("rows") or [])
    timeline = c.get("timeline") or []
    if timeline:
        flow += sub_h("Timeline")
        # colour key for this timeline
        seen_tl = []
        for e in timeline:
            col = (e.get("color") or "").strip()
            era = e.get("era") or ""
            if col and (col, era) not in seen_tl:
                seen_tl.append((col, era))
        if seen_tl:
            flow += [para("<b>Colour key</b>", ST["h4"])]
            key_cells = []
            for col, era in seen_tl:
                key_cells.append(
                    _square(col) + " " + htmllib.escape(era or col)
                )
            # chunk into rows of 3
            key_rows = []
            for i in range(0, len(key_cells), 3):
                chunk = key_cells[i:i+3]
                while len(chunk) < 3:
                    chunk.append("")
                key_rows.append(chunk)
            flow += make_table(["Era colours", "", ""], key_rows,
                               col_widths=[0.34, 0.33, 0.33], font_size=7.2)
        rows = []
        for e in timeline:
            col = (e.get("color") or "#4A152C").strip() or "#4A152C"
            chip_mark = _square(col)
            rows.append([chip_mark + " " + e.get("year", ""),
                         e.get("event", ""), e.get("era", "")])
        flow += make_table(["When", "Event", "Era"], rows,
                           col_widths=[0.18, 0.57, 0.25])
    panels = c.get("storyPanels") or []
    if panels:
        flow += [CondPageBreak(30 * mm), sub_h(f"Story panels ({len(panels)})")]
        # Build a colourful era → colour key from the panels' colourTheme
        era_colors = {}
        for p in panels:
            era = p.get("era") or ""
            col = (p.get("colorTheme") or "").strip()
            if era and col and era not in era_colors:
                era_colors[era] = col
        if era_colors:
            flow += [para("<b>Colour key by era</b>", ST["h4"])]
            key_rows = []
            items = list(era_colors.items())
            for i in range(0, len(items), 3):
                chunk = items[i:i+3]
                row = []
                for era, col in chunk:
                    row.append(_square(col) + " " + htmllib.escape(era))
                while len(row) < 3:
                    row.append("")
                key_rows.append(row)
            flow += make_table(["Era", "Era", "Era"], key_rows,
                               col_widths=[0.34, 0.33, 0.33], font_size=7.2)
        rows = []
        for p in panels:
            bits = [p.get("description", "")]
            if p.get("scripture"):
                bits.append(f"Scripture: {p['scripture']}")
            if p.get("theologicalTheme"):
                bits.append(f"Theme: {p['theologicalTheme']}")
            if p.get("connections"):
                bits.append(f"Connections: {p['connections']}")
            if p.get("characters"):
                bits.append(f"Characters: {p['characters']}")
            col = (p.get("colorTheme") or "").strip()
            chip_mark = (_square(col) + " ") if col else ""
            era_col = col if col else "#7a6a5f"
            rows.append([
                f"{chip_mark}<b>{p.get('title','')}</b><br/>"
                f"<font color='{era_col}'>{p.get('era','')}</font>",
                "<br/>".join(b for b in bits if b),
            ])
        flow += make_table(["Panel", "Detail"], rows, col_widths=[0.32, 0.68])
    profiles = c.get("characterProfiles") or []
    if profiles:
        flow += [CondPageBreak(30 * mm), sub_h("Character profiles")]
        for p in profiles:
            flow += [para(clean(f"{p.get('name')} — {p.get('role','')}"), ST["q_title"])]
            bits = []
            if p.get("description"):
                bits.append(p["description"])
            if p.get("scriptureReference"):
                bits.append(f"Reference: {p['scriptureReference']}")
            if p.get("significance"):
                bits.append(f"Significance: {p['significance']}")
            flow += [para(inline_md(" ".join(bits)), ST["body"])]
            if p.get("keyActions"):
                for a in p["keyActions"]:
                    flow += [para(f"• {inline_md(a)}", ST["bullet"])]
    scriptures = c.get("scriptures") or []
    if scriptures:
        flow += sub_h("Scripture passages")
        flow += make_table(["Reference", "Text"],
                           [[s.get("reference", ""), s.get("text", "")]
                            for s in scriptures],
                           col_widths=[0.22, 0.78])
    maps = c.get("maps") or []
    if maps:
        flow += sub_h("Maps")
        for m in maps:
            flow += [para(f"<b>{clean(m.get('title',''))}</b> — {inline_md(m.get('description',''))}",
                               ST["body"])]
            url = m.get("url", "")
            if url.startswith("/"):
                p = ROOT / "public" / url.lstrip("/")
                flow += img_flowable(p, BOOK_W - 2 * MARGIN - GUTTER, 90 * mm)
    lineage = c.get("lineage")
    if lineage:
        flow += [CondPageBreak(40 * mm), sub_h(lineage.get("title", "Lineage"))]
        if lineage.get("intro"):
            flow += [para(clean(lineage["intro"]), ST["body"])]
        nodes = lineage.get("nodes") or []
        if nodes:
            rows = []
            for n in nodes:
                year = n.get("biblicalYear")
                y = "" if year is None else (f"{abs(year)} BC" if year < 0 else f"{year}")
                rows.append([
                    n.get("name", ""), n.get("founder", ""), y,
                    n.get("claimType", ""), n.get("books", ""),
                ])
            flow += make_table(["Tradition", "Founder", "Biblical date", "Claim", "Books"],
                               rows, col_widths=[0.22, 0.22, 0.16, 0.16, 0.24])
    faq = v.get("faq") or []
    if faq:
        flow += [CondPageBreak(30 * mm), sub_h("Frequently asked questions")]
        for f in faq:
            flow += [para(clean(f.get("q", "")), ST["faq_q"]),
                     para(inline_md(f.get("a", "")), ST["body"])]
    rel = v.get("relatedVolumes") or []
    if rel:
        flow += [para("<b>Related volumes:</b> " + clean(", ".join(rel)), ST["small"])]
    links = []
    if v.get("articleLink"):
        links.append(f"Article: {v['articleLink']}")
    if v.get("youtubeLink"):
        links.append(f"Video: {v['youtubeLink']}")
    if links:
        flow += [para(clean(" · ".join(links)), ST["small"])]
    return flow


# ---------------------------------------------------------------- codex question
def build_codex_question(q: dict) -> list:
    flow = [CondPageBreak(28 * mm)]
    n = q.get("n", "")
    flow += [para(f"Q{n}. {clean(q.get('title',''))}", ST["q_title"])]
    for b in q.get("blocks", []):
        head = b.get("heading", "")
        items = b.get("items") or []
        if not items:
            continue
        flow += [para(clean(head), ST["q_block_h"])]
        lis = [t for k, t in items if k == "li"]
        ps = [t for k, t in items if k == "p"]
        imgs = [t for k, t in items if k == "img"]
        for p in ps:
            flow += [para(inline_md(p), ST["body"])]
        if lis:
            flow += [ListFlowable(
                [ListItem(para(inline_md(li), ST["bullet"]), leftIndent=12)
                 for li in lis],
                bulletType="bullet", start="•", leftIndent=14,
                bulletFontName="Sans", bulletFontSize=6.5,
            )]
        for src in imgs:
            p = ROOT / "public" / src.lstrip("/")
            flow += img_flowable(p, 80 * mm, 50 * mm)
    return flow


# ---------------------------------------------------------------- watchers blocks
def watchers_blocks_to_flowables(blocks: list) -> list:
    flow: list = []
    i = 0
    while i < len(blocks):
        b = blocks[i]
        t = b.get("type")
        if t == "row":
            rows = []
            while i < len(blocks) and blocks[i].get("type") == "row":
                cells = blocks[i]["cells"]
                rows.append([c.get("text", "") for c in cells])
                i += 1
            if not rows:
                continue
            headers = rows[0] if len(rows[0]) <= 6 else None
            body = rows[1:] if headers else rows
            if headers and all(len(h) < 40 for h in headers):
                flow += make_table(headers, body)
            else:
                flow += make_table(None, rows)
            continue
        if t in ("h2", "h3", "h4"):
            style = {"h2": ST["h2"], "h3": ST["h3"], "h4": ST["h4"]}[t]
            flow += [safe_para(clean(b.get("text", "")), style)]
        elif t == "summary":
            flow += [safe_para(f"<b>{clean(b.get('text',''))}</b>", ST["body"])]
        elif t == "p":
            flow += [safe_para(inline_md(b.get("text", "")), ST["body"])]
        elif t == "li":
            flow += [safe_para(f"• {inline_md(b.get('text',''))}", ST["bullet"])]
        elif t == "img":
            src = b.get("src", "")
            if src.startswith("/"):
                p = ROOT / "public" / src.lstrip("/")
            else:
                p = ROOT / "public/watchers-atlas" / src
            flow += img_flowable(p, 70 * mm, 45 * mm, caption=b.get("alt") or None)
        i += 1
    return flow


# ---------------------------------------------------------------- asset gallery
def asset_grid(names, assets, cols=4, thumb=True) -> list:
    avail = BOOK_W - 2 * MARGIN - GUTTER
    gap = 3 * mm
    cell_w = (avail - gap * (cols - 1)) / cols
    cell_h = cell_w * 0.78 + 14
    row_cells = []
    prepared_rows = []
    for name in names:
        d = assets.get(name)
        if not d:
            continue
        src = d.get("t" if thumb else "f", "")
        p = ROOT / "public" / src.lstrip("/")
        if not p.exists():
            continue
        prep = prep_image(p, cell_w, cell_w * 0.72)
        if not prep:
            continue
        try:
            iw, ih = PILImage.open(prep).size
        except Exception:
            continue
        scale = min((cell_w - 4) / iw, (cell_w * 0.72) / ih)
        w, h = iw * scale, ih * scale
        kind = d.get("k", "")
        short_kind = ("AI" if kind.startswith("Text") else
                      "Rep." if kind.startswith("Representative") else "Photo")
        label = para(
            f"{clean(name)}<br/><font color='#7a6a5f' size='6'>{short_kind}</font>",
            S("gl", fontName="Sans", fontSize=6.5, leading=8, alignment=TA_CENTER,
              textColor=INK),
        )
        cell = [Image(str(prep), width=w, height=h), label]
        row_cells.append(cell)
        if len(row_cells) == cols:
            prepared_rows.append(row_cells)
            row_cells = []
    if row_cells:
        prepared_rows.append(row_cells)
    if not prepared_rows:
        return []
    flow = []
    for row in prepared_rows:
        while len(row) < cols:
            row.append([Spacer(1, 1)])
        t = Table([row], colWidths=[cell_w] * cols)
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("BOX", (0, 0), (-1, -1), 0.3, LINE),
        ]))
        flow.append(t)
    flow.append(Spacer(1, 4))
    return flow


if __name__ == "__main__":
    build()
