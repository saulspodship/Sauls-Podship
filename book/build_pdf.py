#!/usr/bin/env python3
"""Build the Saul's Podship knowledge compendium PDF (print-ready A4)."""
from __future__ import annotations

import json, re, os, sys, datetime, html as htmllib
from pathlib import Path
from collections import defaultdict

from reportlab.lib.pagesizes import A4
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
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(__file__).resolve().parent / "data"
OUT_PDF = Path(__file__).resolve().parent / "Sauls-Podship-Compendium.pdf"
IMG_TMP = Path(__file__).resolve().parent / "_imgtmp"
IMG_TMP.mkdir(exist_ok=True)

PAGE_W, PAGE_H = A4
MARGIN = 16 * mm
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
    pdfmetrics.registerFont(TTFont("Serif", f"{F}/DejaVuSerif.ttf"))
    pdfmetrics.registerFont(TTFont("Serif-Bold", f"{F}/DejaVuSerif-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Sans", f"{F}/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("Sans-Bold", f"{F}/DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Mono", f"{F}/DejaVuSansMono.ttf"))
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

# ---------------------------------------------------------------- text utils
EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U00002190-\U000021FF\U00002B00-\U00002BFF⬀-⯿]"
)
EMOJI_MAP = {
    "🟦": "■", "🟥": "■", "🟨": "■", "🟩": "■", "🟪": "■", "🟧": "■", "🟫": "■",
    "⚫": "■", "⚪": "■", "🔘": "■", "✨": "★", "🔥": "▲", "🔵": "●",
    "✅": "✓", "❌": "✗", "⭐": "★", "📖": "▣", "✟": "✝", "☦": "✝",
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
        out.append(Paragraph(clean(caption), ST["caption"]))
    else:
        out.append(Spacer(1, 4))
    return out


# ---------------------------------------------------------------- tables
def safe_para(text, style):
    try:
        return Paragraph(text, style)
    except Exception:
        plain = re.sub(r"<[^>]+>", "", str(text))
        return Paragraph(clean(plain), style)


def make_table(headers, rows, col_widths=None, header_bg=WINE, font_size=7.6,
               zebra=True, align_left=True):
    if not rows and not headers:
        return []
    avail = PAGE_W - 2 * MARGIN
    data = []
    if headers:
        data.append([safe_para(clean(str(h)), ST["cell_h"]) for h in headers])
    for row in rows:
        data.append([
            safe_para(inline_md(str(c)) if c is not None else "", ST["cell"])
            for c in row
        ])
    n_cols = max(len(r) for r in data)
    for r in data:
        while len(r) < n_cols:
            r.append(safe_para("", ST["cell"]))
    if col_widths:
        widths = [avail * w for w in col_widths]
    else:
        widths = [avail / n_cols] * n_cols
    total = sum(widths)
    widths = [w * avail / total for w in widths]
    t = Table(data, colWidths=widths, repeatRows=1 if headers else 0)
    style_cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if headers:
        style_cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), header_bg),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, GOLD),
        ]
        start = 1
    else:
        start = 0
    if zebra:
        for i in range(start, len(data)):
            if (i - start) % 2 == 1:
                style_cmds.append(("BACKGROUND", (0, i), (-1, i), CREAM2))
    t.setStyle(TableStyle(style_cmds))
    return [t, Spacer(1, 6)]


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
                [ListItem(safe_para(inline_md(it), ST["bullet"]), leftIndent=12)
                 for it in items],
                bulletType="bullet", start="•", leftIndent=14,
                bulletFontName="Sans", bulletFontSize=7,
            ))
            continue
        if re.match(r"^\d+[.)]\s+", s):
            items = []
            while i < len(lines) and re.match(r"^\d+[.)]\s+", lines[i].strip()):
                items.append(re.sub(r"^\d+[.)]\s+", "", lines[i].strip()))
                i += 1
            out.append(ListFlowable(
                [ListItem(safe_para(inline_md(it), ST["bullet"]), leftIndent=14)
                 for it in items],
                bulletType="1", leftIndent=18,
                bulletFontName="Sans", bulletFontSize=8,
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


class BookDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=A4,
                         leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=18 * mm, bottomMargin=16 * mm,
                         title="Saul's Podship — The Complete Knowledge Book",
                         author="Solat Jamil",
                         subject="Bible encyclopedia, comparative apologetics, atlases and archives",
                         **kw)
        frame_cover = Frame(0, 0, PAGE_W, PAGE_H, 0, 0, 0, 0, id="cover")
        # single body frame; side is decided by which template (left / right page) is active
        def body_frame(fid):
            return Frame(MARGIN, 16 * mm, PAGE_W - 2 * MARGIN,
                         PAGE_H - 18 * mm - 16 * mm, id=fid)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[frame_cover], onPage=self._cover_page),
            PageTemplate(id="front", frames=[body_frame("front")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "front")),
            PageTemplate(id="bodyL", frames=[body_frame("L")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "L")),
            PageTemplate(id="bodyR", frames=[body_frame("R")],
                         onPageEnd=lambda c, d: self._side_page(c, d, "R")),
            # silent blank used only to pad part openers onto right-hand pages
            PageTemplate(id="blank", frames=[body_frame("B")],
                         onPage=lambda c, d: None),
        ])
        self._tpls = {pt.id: pt for pt in self.pageTemplates}
        self._pending_tpl = None
        self._last_side = "R"
        self.chapter_label = ""
        self.part_label = ""

    def handle_nextPageTemplate(self, name):
        # accept our ids (and legacy alias)
        if name == "body":
            name = "bodyR"
        self._pending_tpl = name

    def handle_pageBegin(self):
        if self._pending_tpl and self._pending_tpl in self._tpls:
            self.pageTemplate = self._tpls[self._pending_tpl]
            self._pending_tpl = None
        elif self.pageTemplate.id in ("bodyL", "bodyR"):
            # auto-alternate so verso/recto work like a real printed book
            self.pageTemplate = self._tpls["bodyR" if self.pageTemplate.id == "bodyL" else "bodyL"]
        if self.pageTemplate.id in ("bodyL", "bodyR"):
            self._last_side = self.pageTemplate.id
        super().handle_pageBegin()

    def _cover_page(self, canv, doc):
        canv.saveState()
        canv.setFillColor(CREAM)
        canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(2)
        canv.rect(12 * mm, 12 * mm, PAGE_W - 24 * mm, PAGE_H - 24 * mm, fill=0, stroke=1)
        canv.setLineWidth(0.5)
        canv.rect(14 * mm, 14 * mm, PAGE_W - 28 * mm, PAGE_H - 28 * mm, fill=0, stroke=1)
        canv.setFillColor(WINE)
        canv.rect(12 * mm, PAGE_H - 48 * mm, PAGE_W - 24 * mm, 22 * mm, fill=1, stroke=0)
        canv.setFillColor(GOLD_L)
        canv.setFont("Sans-Bold", 13)
        canv.drawCentredString(PAGE_W / 2, PAGE_H - 40 * mm, "SAUL'S PODSHIP")
        canv.restoreState()

    def _side_page(self, canv, doc, side):
        """Running header/footer. side: front | L (left/verso) | R (right/recto)."""
        canv.saveState()
        y = PAGE_H - 13 * mm
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(MARGIN, y + 4 * mm, PAGE_W - MARGIN, y + 4 * mm)
        n = str(canv.getPageNumber())
        chapter = (self.chapter_label or "")[:58]
        if side == "front":
            # first pages after the cover: quiet header, number outside (left)
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawString(MARGIN, y, BOOK_TITLE)
            canv.setFillColor(WINE)
            canv.setFont("Sans-Bold", 8.5)
            canv.drawString(MARGIN, 8.5 * mm, n)
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawRightString(PAGE_W - MARGIN, 8.5 * mm, "saulspodship.com")
        elif side == "L":
            # verso: book title outer (left), chapter inner (right); page no. outer
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawString(MARGIN, y, BOOK_TITLE)
            if chapter:
                canv.setFillColor(WINE)
                canv.drawRightString(PAGE_W - MARGIN, y, chapter)
            canv.setFillColor(WINE)
            canv.setFont("Sans-Bold", 8.5)
            canv.drawString(MARGIN, 8.5 * mm, n)
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawRightString(PAGE_W - MARGIN, 8.5 * mm, "saulspodship.com")
        else:
            # recto: chapter inner (left), book title outer (right); page no. outer
            if chapter:
                canv.setFont("Sans", 7.5)
                canv.setFillColor(WINE)
                canv.drawString(MARGIN, y, chapter)
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawRightString(PAGE_W - MARGIN, y, BOOK_TITLE)
            canv.setFont("Sans", 7.5)
            canv.setFillColor(MUTED)
            canv.drawString(MARGIN, 8.5 * mm, "saulspodship.com")
            canv.setFillColor(WINE)
            canv.setFont("Sans-Bold", 8.5)
            canv.drawRightString(PAGE_W - MARGIN, 8.5 * mm, n)
        canv.restoreState()

    def beforeDocument(self):
        self.chapter_label = ""
        self.part_label = ""

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            text = flowable.getPlainText()
            if style == "part_title":
                self.notify("TOCEntry", (0, text, self.page))
                self.part_label = text
                self.chapter_label = ""
                # chapter that follows a part opener starts on the left page
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
def part_page(num: str, title: str, subtitle: str, hero: Path | None = None) -> list:
    """Part divider: opens on a right-hand page with a full-width picture."""
    flow = [
        NextPageTemplate("bodyR"),
        PageBreak(),
        EnsureRecto(),
        Spacer(1, 14 * mm),
        Paragraph(f"PART {num}", ST["part"]),
        Paragraph(clean_plain(title), ST["part_title"]),
        Spacer(1, 3 * mm),
        Paragraph(clean_plain(subtitle), ST["part_sub"]),
        Spacer(1, 8 * mm),
    ]
    if hero and Path(hero).exists():
        flow += img_flowable(Path(hero), PAGE_W - 2 * MARGIN, 88 * mm)
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
        flow.append(Paragraph(clean_plain(kicker), ST["chap_no"]))
    flow.append(Paragraph(clean_plain(title), ST["chap_title"]))
    if subtitle:
        flow.append(Paragraph(clean_plain(subtitle), ST["chap_sub"]))
    flow.append(Spacer(1, 4))
    if hero and Path(hero).exists():
        flow.extend(img_flowable(Path(hero), PAGE_W - 2 * MARGIN, 70 * mm))
    return flow


def section_h(text: str) -> list:
    return [Paragraph(clean(text), ST["h2"])]


def sub_h(text: str) -> list:
    return [Paragraph(clean(text), ST["h3"])]


class EnsureRecto(ActionFlowable):
    """Pad with one blank verso so the next content starts on a right-hand page."""

    def apply(self, doc):
        # Runs right after a PageBegin for the page that will hold a part opener.
        if getattr(doc, "page", 0) % 2 == 0:  # even → left/verso; we need odd/recto
            doc.pageTemplate = doc._tpls["blank"]
            doc.handle_nextPageTemplate("bodyR")
            doc.handle_pageBreak()


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

    story = []

    # ================= COVER =================
    story += [
        Spacer(1, 58 * mm),
        Paragraph("THE COMPLETE KNOWLEDGE BOOK", ST["cover_kicker"]),
        Spacer(1, 5 * mm),
        Paragraph("Saul's Podship", ST["cover_title"]),
        Spacer(1, 6 * mm),
        Paragraph(
            "Fifty Bible-encyclopedia volumes, a 400-question faith codex, "
            "Bible maps, a 1,000-answer study archive, angels and prophecy, "
            "and the Punjabi Zaboor hymn collection",
            ST["cover_sub"],
        ),
        Spacer(1, 6 * mm),
    ]
    hero_path = ROOT / "public/images/hero/last-supper-v2-1920.jpg"
    if not hero_path.exists():
        hero_path = ROOT / "public/images/volumes/all-bible-stories/hero-1920.jpg"
    if hero_path.exists():
        story += img_flowable(hero_path, PAGE_W - 40 * mm, 70 * mm)
    story += [
        Spacer(1, 3 * mm),
        Paragraph(
            "Collected from the Saul's Podship project and set in print for study and devotion",
            S("cover_f", fontName="Sans", fontSize=9.5, leading=14, textColor=MUTED,
              alignment=TA_CENTER),
        ),
        Spacer(1, 2 * mm),
        Paragraph(
            "Solat Jamil · " + datetime.date.today().strftime("%d %B %Y"),
            S("cover_d", fontName="Sans-Bold", fontSize=10, leading=14, textColor=GOLD,
              alignment=TA_CENTER),
        ),
        NextPageTemplate("front"),
        PageBreak(),
    ]

    # ================= DEDICATION =================
    story += [
        Spacer(1, 48 * mm),
        Paragraph("DEDICATION", S("ded_k", fontName="Sans-Bold", fontSize=11,
                                  leading=15, textColor=GOLD, alignment=TA_CENTER,
                                  spaceAfter=14)),
        Paragraph(
            "To the seed my grandparents planted in me",
            S("ded_h", fontName="Serif-Bold", fontSize=20, leading=27, textColor=WINE,
              alignment=TA_CENTER, spaceAfter=18),
        ),
        Paragraph(
            "I, Solat Jamil, dedicate this book, and the research that lies behind it, "
            "to my grandparents, Jamson Jamil-ud-Din and my grandmother Mercy Jamson. "
            "They planted a seed in me, and everything you are about to read grew from it.",
            S("ded_b", fontName="Serif", fontSize=12, leading=19, textColor=INK,
              alignment=TA_CENTER, spaceAfter=14),
        ),
        Paragraph(
            "More than sixty percent of the knowledge and the questions gathered in these "
            "pages belongs to them. It is knowledge they handed down to me, and work they "
            "had already laboured over and written in their own hands. I have taken that "
            "treasure, studied it, and shaped it into this book so that the truth they "
            "loved may be brought out clearly for others.",
            S("ded_b2", fontName="Serif", fontSize=12, leading=19, textColor=INK,
              alignment=TA_CENTER, spaceAfter=14),
        ),
        Paragraph(
            "With love and gratitude, and in hope that the seed keeps growing.",
            S("ded_b3", fontName="Serif", fontSize=12, leading=19, textColor=WINE,
              alignment=TA_CENTER, spaceBefore=6, spaceAfter=22),
        ),
        Paragraph("Solat Jamil", S("ded_sig", fontName="Serif-Bold", fontSize=13,
                                   leading=17, textColor=WINE, alignment=TA_CENTER)),
        NextPageTemplate("bodyR"),
        PageBreak(),
    ]

    # ================= ABOUT THIS BOOK =================
    story += [
        Paragraph("About This Book", ST["h1"]),
        Paragraph(
            "This book gathers everything the Saul's Podship project has written and "
            "studied over the years. It is an open Christian ministry library that lives "
            "on the internet at saulspodship.com, now set down on paper so you can hold "
            "it, mark it, and share it.",
            ST["body"],
        ),
        Paragraph(
            "Inside you will find fifty illustrated Bible volumes, four hundred questions "
            "about other faiths, eight journey maps across the Holy Land, one thousand "
            "short Bible study answers, one hundred hard questions with replies from five "
            "Christian traditions, a full atlas of angels and the Watchers, two hundred "
            "and forty seven prophecy notes, the story of the world's religions, the "
            "family line from Adam to Jesus, and the archive of Pakistani Christian music "
            "and podcasts.",
            ST["body"],
        ),
        Paragraph(
            "Every chapter is taken straight from the project's own files. The pictures, "
            "maps and tables come from the same artwork and data you see on the website. "
            "Bible quotes are from the King James Version, which is free to print. The "
            "cross reference data is credited to openbible.info.",
            ST["body"],
        ),
        sub_h("How to print this book"),
        Paragraph(
            "The pages are A4, set up as a two sided book. Page numbers sit on the outer "
            "edge of every page. When you print, choose duplex printing and flip on the "
            "long edge. The table of contents lists every part and chapter with its page "
            "number, so you can print only the parts you want.",
            ST["body"],
        ),
        sub_h("What is inside"),
    ]
    include_rows = [
        ["Part 1", "How this project began", "The story, the tools, and the list of fifty volumes"],
        ["Part 2", "The fifty volumes", "The full Bible encyclopedia with tables and pictures"],
        ["Part 3", "Bible maps", "Eight journey maps with every stop named"],
        ["Part 4", "Four hundred questions", "Islam, Judaism, Hinduism and Sikhism, answered with care"],
        ["Part 5", "One thousand answers", "Short Bible study questions sorted by book"],
        ["Part 6", "Hard questions", "One hundred tough questions, five Christian views each"],
        ["Part 7", "Angels and the Watchers", "Enoch, holy beings, beasts, and a picture gallery"],
        ["Part 8", "Prophecy and world faiths", "Fulfillment notes, world religions, Adam to Jesus"],
        ["Part 9", "Music and podcasts", "Pakistani gospel singers, Punjabi Zaboor, episodes"],
        ["Part 10", "Notes and records", "Project documents and audits"],
        ["Appendix", "Directory and reference", "Apps, questions and answer, Bible book counts"],
    ]
    story += make_table(["Part", "You will find", "In short"], include_rows,
                        col_widths=[0.12, 0.34, 0.54])
    story.append(PageBreak())

    # ================= TOC =================
    story += [Paragraph("Table of Contents", ST["h1"]),
              Spacer(1, 4),
              make_toc(), PageBreak()]

    # ================================================================
    # PART 1 — HOW THIS PROJECT BEGAN
    # ================================================================
    def hero(name, *fallbacks):
        for n in (name, *fallbacks):
            pp = ROOT / "public" / n.lstrip("/")
            if pp.exists():
                return pp
        return None

    story += part_page(
        "1", "How This Project Began",
        "Where these pages come from, what tools keep them true, and the list of fifty volumes",
        hero("images/volumes/family-tree-adam-jesus/hero-1920.jpg"),
    )

    story += chapter_head("", "What Is Saul's Podship?",
                          kicker="Part 1")
    story += md_to_flowables(
        "Saul's Podship is a Christian study project that lives on the internet at "
        "saulspodship.com. It brings together more than fifty illustrated Bible volumes, "
        "a Bible maps atlas, four hundred questions about other faiths, a Pakistani "
        "Christian music archive, and tools for studying prophecy."
    )
    story += sub_h("Five things this project is known for")
    pillars = [
        ["1", "Fifty Illustrated Volumes", "Bible-encyclopedia chapters from All Bible Stories to the 1-Year Sermon Guide — with tables, timelines, story panels, maps and FAQs."],
        ["2", "Biblical Maps & Atlas", "Eight journey maps (Abraham, Exodus, Paul, Seven Churches, Holy Land, kingdoms, Ancient Near East, Roman Empire) plus the world-faith map."],
        ["3", "Comparative Apologetics Codex", "400 questions — 100 each on Islam, Judaism, Hinduism and Sikhism — with context, primary sources, Christian response and discussion points."],
        ["4", "Prophecy & Reference Tools", "A 247-prophecy fulfilment lens (historical / metaphorical / futurist), the Interlinked Bible, Kings of the Bible, cross-references."],
        ["5", "Sacred Music & Podcasts", "The living archive of Punjabi Zaboor hymnody (150 Psalms in classical meters), Pakistani gospel musicians, and Urdu + English podcasts."],
    ]
    story += make_table(["#", "Pillar", "Description"], pillars, col_widths=[0.05, 0.27, 0.68])
    story += sub_h("Technology stack")
    story += [Paragraph(
        "React 19 + Vite 6 + TypeScript · Tailwind CSS 4 · Express (served via a single "
        "Vercel function) · Firestore REST API · React Router (createHashRouter). The site "
        "ships English, Urdu, Hindi and Arabic through a fully static client-side "
        "translation layer — no translation API and no server round-trip.",
        ST["body"],
    )]
    story += sub_h("Languages")
    story += [Paragraph(
        "The language switcher translates the whole site — React pages, every volume's body "
        "text, tables, timelines, story panels, the Companion bar, the static module docs "
        "and the comparative apologetics codex. The dictionary lives in "
        "<font name='Mono'>src/data/i18n/</font> and is emitted to "
        "<font name='Mono'>public/i18n/{ur,hi,ar}.json</font>; English visitors download "
        "nothing. Patterns localise data-built strings and digits (51 in each script).",
        ST["body"],
    )]

    # Ch 2 architecture
    story += chapter_head("", "How the Project Is Built", kicker="Part 1")
    arch_rows = [
        ["src/data/volumes/", "50 TypeScript volume records (analysis, tables, panels, timelines, FAQ)", "1.8 MB"],
        ["src/data/theology/", "Theological Archive (1,000 entries) + 100 Tough Questions", "576 KB"],
        ["src/data/", "Singers, zaboor list, podcast episodes, videos, FAQ, apps", "~120 KB"],
        ["public/comparative-apologetics/", "Frozen codex.html — 400 question cards", "1.6 MB"],
        ["public/watchers-atlas/", "Watchers Atlas HTML + 317 images", "29 MB"],
        ["public/images/", "Volume heroes, maps, stories, podcast art", "48 MB"],
        ["public/cross-references/", "KJV text + openbible.info cross-reference data", "12 MB"],
        ["public/assets/", "maps-atlas, prophecy-lens, i18n, chrome scripts", "—"],
        ["docs/", "Audits, URL maps, sequence freeze, performance notes", "92 KB"],
        ["scripts/", "Verify codex, i18n gates, image optimisation, heroes", "—"],
        [".github/workflows/", "videos-sync (daily), vercel-cleanup", "—"],
    ]
    story += make_table(["Path", "Contents", "Size"], arch_rows,
                        col_widths=[0.30, 0.55, 0.15])
    story += sub_h("Required verification before shipping")
    story += [Paragraph(
        "<font name='Mono'>npm run lint && npm test && npm run verify && npm run build && "
        "npm run test:about</font> — type-check, hero-variant integrity, codex 400/400 gate, "
        "full build, and the About/FAQ/structured-data crawler check.",
        ST["body"],
    )]
    story += sub_h("Repository rules that protect the knowledge")
    rules = [
        "codex.html is frozen: 400 verified cards, stable IDs, never reformatted; changes must pass scripts/verify-codex.mjs.",
        "main is the only long-lived branch; batch related changes into one push (each push is a full production deploy).",
        "Never hand-edit generated data: videos sync, i18n artifacts, volumeIndex.json.",
        "Run python3 scripts/optimize_images.py before committing any new image under public/.",
        "Commit as saulspodship &lt;saulspodship@gmail.com&gt; — the Vercel-linked account.",
    ]
    story += [ListFlowable(
        [ListItem(safe_para(inline_md(r), ST["bullet"]), leftIndent=12) for r in rules],
        bulletType="bullet", start="•", leftIndent=14, bulletFontName="Sans", bulletFontSize=7,
    )]

    # Ch 3 sequence
    story += chapter_head("", "The Fifty Volume List", kicker="Part 1")
    story += [Paragraph(
        "The volumes are numbered in alphabetical order, with the one year sermon guide "
        "always placed last. This list is the master order used on the website and in "
        "this book.",
        ST["body"],
    )]
    seq_rows = []
    for v in vols:
        seq_rows.append([
            f"{v['number']:02d}", v["title"], v.get("category", ""),
            v.get("lastUpdated", ""),
        ])
    story += make_table(["#", "Title", "Category", "Updated"], seq_rows,
                        col_widths=[0.06, 0.62, 0.16, 0.16])
    story += sub_h("The encyclopedia at a glance")
    stats = [
        ["Volumes", str(len(vols))],
        ["Data tables", str(sum(len(v["content"].get("tables") or []) for v in vols))],
        ["Story panels", str(sum(len(v["content"].get("storyPanels") or []) for v in vols))],
        ["Timeline entries", str(sum(len(v["content"].get("timeline") or []) for v in vols))],
        ["FAQ pairs", str(sum(len(v.get("faq") or []) for v in vols))],
        ["Key facts", str(sum(len(v.get("keyFacts") or []) for v in vols))],
        ["Embedded maps", str(sum(len(v["content"].get("maps") or []) for v in vols))],
        ["Scripture passages", str(sum(len(v["content"].get("scriptures") or []) for v in vols))],
    ]
    story += make_table(["Metric", "Count"], stats, col_widths=[0.6, 0.4])

    # ================================================================
    # PART II — THE FIFTY VOLUMES
    # ================================================================
    story += part_page(
        "2", "The Fifty Volumes",
        "The full Bible encyclopedia, volume by volume, with tables, timelines and pictures",
        hero("images/volumes/all-bible-stories/hero-1920.jpg"),
    )

    for v in vols:
        story += build_volume_chapter(v)

    # ================================================================
    # PART III — BIBLICAL ATLAS
    # ================================================================
    story += part_page(
        "3", "Bible Maps",
        "Eight journey maps that walk the routes of Abraham, Moses, Paul and Jesus",
        hero("images/hero-biblical-maps.jpg"),
    )

    story += chapter_head("", "Walking the Bible Maps", kicker="Part 3",
                          hero=hero("images/volumes/biblical-maps/hero-1920.jpg"))
    story += [Paragraph(
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
        story += img_flowable(img, PAGE_W - 2 * MARGIN, 118 * mm)
        stop_rows = [[str(i + 1), s[2]] for i, s in enumerate(stops)]
        if stop_rows:
            story += make_table(["Stop", "Station"], stop_rows, col_widths=[0.1, 0.9])
    story += chapter_head("", "The World Map", kicker="Part 3",
                          hero=hero("images/hero-prophecy.jpg"))
    story += [Paragraph(
        "After walking the sacred journeys, lift your eyes to the whole world the gospel now "
        "covers. The world-faith map (Part VIII) carries the same dataset the live site "
        "woven into its Interlinked Bible module: seven tradition categories across 175 "
        "countries, on a total population of 8.23 billion.",
        ST["body"],
    )]

    # ================================================================
    # PART IV — CODEX
    # ================================================================
    story += part_page(
        "4", "Four Hundred Questions",
        "One hundred questions each on Islam, Judaism, Hinduism and Sikhism, answered with care",
        hero("images/volumes/comparative-religion/hero-1920.jpg"),
    )

    story += chapter_head("", "How These Answers Were Written", kicker="Part 4",
                          hero=hero("images/hero-jesus-alpha-omega.jpg"))
    story += [Paragraph(clean(codex.get("sidebar", "")), ST["lead"])]
    story += [Paragraph(clean(codex.get("preface_title", "A Note on Method")), ST["h2"])]
    for p in codex.get("preface", []):
        story += [safe_para(inline_md(p), ST["body"])]
    story += [Paragraph(
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
                              kicker=f"Part 4 · {eyebrow}")
        if sec.get("lead"):
            story += [Paragraph(clean_plain(sec["lead"]), ST["lead"])]
        for q in qs:
            story += build_codex_question(q)

    # ================================================================
    # PART V — THEOLOGICAL ARCHIVE
    # ================================================================
    story += part_page(
        "5", "One Thousand Answers",
        "Short Bible study questions sorted by book, from the Law to Revelation",
        hero("images/volumes/complete-christian-theology-map/hero-1920.jpg"),
    )

    story += chapter_head("", "The Study Archive", kicker="Part 5",
                          hero=hero("images/stories/scenes/book.webp"))
    total_items = sum(len(c["items"]) for c in archive)
    story += [Paragraph(
        f"This archive holds {total_items} questions in {len(archive)} groups of "
        "Scripture. Each one gives a short answer, a Bible reference, and when it helps, "
        "a note that opens up the meaning behind the answer.",
        ST["lead"],
    )]
    idx_rows = [[c["name"], str(len(c["items"]))] for c in archive]
    story += make_table(["Category", "Entries"], idx_rows, col_widths=[0.8, 0.2])

    for c in archive:
        story += [CondPageBreak(40 * mm), Paragraph(clean(c["name"]), ST["h2"])]
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
    # PART VI — TOUGH QUESTIONS
    # ================================================================
    story += part_page(
        "6", "Hard Questions",
        "One hundred tough questions, with answers from five Christian traditions",
        hero("images/volumes/apologetics-40-critical-questions/hero-1920.jpg"),
    )

    story += chapter_head("", "One Hundred Tough Questions", kicker="Part 6",
                          hero=hero("images/volumes/jesus-is-god-full-references-ot-nt/hero-1920.jpg"))
    tier_names = {1: "Tier 1 — Most asked", 2: "Tier 2 — Common", 3: "Tier 3 — Advanced"}
    view_names = {
        "catholic": "Catholic", "orthodox": "Orthodox", "protestant": "Protestant",
        "anglican": "Anglican", "pentecostal": "Pentecostal",
    }
    story += [Paragraph(
        "Each question below comes with a plain answer, a verse from the King James "
        "Bible, and five responses from different Christian traditions. Where a tradition "
        "has a famous quotation to offer, it is included.",
        ST["lead"],
    )]
    for q in tough:
        tier = q.get("tier", 1)
        story += [CondPageBreak(30 * mm)]
        story += [Paragraph(
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
        story += [Paragraph(clean(" · ".join(meta_bits)), ST["small"])]
        if q.get("rv"):
            story += [Paragraph(f"<i>{inline_md(q['rv'])}</i>", ST["quote"])]
        common = (q.get("common") or {}).get("en", "")
        if common:
            story += [Paragraph(f"<b>Common answer.</b> {inline_md(common)}", ST["body"])]
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
    # PART VII — WATCHERS ATLAS
    # ================================================================
    story += part_page(
        "7", "Angels and the Watchers",
        "Holy beings, fallen watchers, beasts and the stories the Bible tells about them",
        hero("images/volumes/angels-demons-beasts-monsters-in-the-bible/hero-1920.jpg"),
    )

    story += chapter_head("", watchers.get("title", "Angels and the Watchers"),
                          kicker="Part 7",
                          hero=hero("images/volumes/forbidden-knowledge-the-watchers/hero-1920.jpg"))
    if watchers.get("lede"):
        story += [Paragraph(clean_plain(watchers["lede"]), ST["lead"])]
    for n in watchers.get("notices", []):
        story += [Paragraph(clean(n), ST["body"])]

    for sec in watchers.get("sections", []):
        title = sec.get("title") or ""
        if title:
            story += [CondPageBreak(35 * mm), Paragraph(clean(title), ST["h2"])]
        story += watchers_blocks_to_flowables(sec.get("blocks", []))

    story += [CondPageBreak(60 * mm),
              Paragraph("Visual index — key figures and beings", ST["h2"])]
    story += [Paragraph(
        "Each profile in the atlas carries its own distinct artwork — sourced historical "
        "images where they exist, and text-guided reconstructions strictly limited to the "
        "forms the Bible or 1 Enoch describes. Concept and claim rows carry no images, so "
        "no picture pretends to be evidence.",
        ST["body"],
    )]
    assets = watchers.get("assets", {})
    feature_names = watchers.get("feature_names", [])
    if feature_names:
        story += [Paragraph("Featured gallery", ST["h3"])]
        story += asset_grid(feature_names, assets, cols=3, thumb=True)
    story += [Paragraph("Complete image catalogue", ST["h3"])]
    story += asset_grid(list(assets.keys()), assets, cols=4, thumb=True)

    # ================================================================
    # PART VIII — PROPHECY, WORLD FAITHS, GENEALOGY
    # ================================================================
    story += part_page(
        "8", "Prophecy and World Faiths",
        "How prophecies were fulfilled, the religions of the world, and the family line from Adam to Jesus",
        hero("images/hero-second-coming.jpg", "images/hero-prophecy.jpg"),
    )

    story += chapter_head("", "Two Hundred Forty Seven Prophecies", kicker="Part 8",
                          hero=hero("images/hero-prophecy.jpg"))
    story += [Paragraph(
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
    story += [Paragraph("Reading the tags", ST["h3"])]
    tag_counts = defaultdict(int)
    for v in lens.values():
        tag_counts[v.get("h", "")] += 1
    gloss_rows = [[k, str(v)] for k, v in sorted(tag_counts.items(), key=lambda x: -x[1])]
    story += make_table(["Historical-lens tag", "Prophecies"], gloss_rows,
                        col_widths=[0.75, 0.25])

    story += chapter_head("", "World Religions and People", kicker="Part 8",
                          hero=hero("images/volumes/worlds-all-big-churches/hero-1920.jpg"))
    story += [Paragraph(
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
    story += [Paragraph("Largest countries by dominant tradition", ST["h3"])]
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

    story += chapter_head("", "From Adam to Jesus", kicker="Part 8",
                          hero=hero("images/volumes/family-tree-adam-jesus/hero-1920.jpg"))
    story += [Paragraph(
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
        story += [Paragraph(clean(gene["page_text"][:1200]), ST["small"])]

    # ================================================================
    # PART IX — MUSIC & BROADCAST
    # ================================================================
    story += part_page(
        "9", "Music and Podcasts",
        "Pakistani gospel singers, the Punjabi Zaboor psalms, and the podcast episodes",
        hero("images/podcast/show-cover.jpg"),
    )

    story += chapter_head("", "The Singers and Their Story", kicker="Part 9",
                          hero=hero("images/volumes/guide-to-christian-living/hero-1920.jpg"))
    story += [Paragraph(
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
    story += [Paragraph("Full profiles — the honored Din dynasty", ST["h3"])]
    for s in music.get("dynasty", []):
        story += [CondPageBreak(25 * mm)]
        story += [Paragraph(clean(f"{s.get('name')} — {s.get('badge','')}"), ST["q_title"])]
        if s.get("lineageNote"):
            story += [Paragraph(clean(s["lineageNote"]), ST["small"])]
        story += [Paragraph(inline_md(s.get("bio", "")), ST["body"])]
        for b in s.get("majorContributions", []):
            story += [Paragraph(f"• {inline_md(b)}", ST["bullet"])]

    story += chapter_head("", "Punjabi Zaboor, the Psalm Songs", kicker="Part 9",
                          hero=hero("images/volumes/lords-prayer/hero-1920.jpg"))
    story += [Paragraph(
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

    story += chapter_head("", "Podcasts and Video Lessons", kicker="Part 9",
                          hero=hero("images/podcast/ep01-cover.jpg"))
    pod = music.get("podcast", {})
    story += [Paragraph(clean_plain(pod.get("title", "Podcast")), ST["h2"])]
    story += [Paragraph(clean_plain(pod.get("description", "")), ST["body"])]
    # show a few episode covers as a strip
    cover_flow = []
    for ep_i in range(1, 7):
        cp = ROOT / f"public/images/podcast/ep{ep_i:02d}-cover.jpg"
        if cp.exists():
            cover_flow += img_flowable(cp, 28 * mm, 28 * mm)
    if cover_flow:
        story += [Spacer(1, 4)] + cover_flow + [Spacer(1, 4)]
    story += [Paragraph(
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
    story += [Paragraph("Episode notes", ST["h3"])]
    for e in music.get("episodes", []):
        story += [CondPageBreak(22 * mm)]
        story += [Paragraph(
            f"<b>Ep. {e.get('number')} · {clean_plain(e.get('titleEnglish',''))}</b> "
            f"<font color='#7a6a5f'>({e.get('duration','')}, {e.get('publishDate','')})</font>",
            ST["faq_q"])]
        ecp = ROOT / f"public/images/podcast/ep{int(e.get('number') or 0):02d}-cover.jpg"
        if ecp.exists():
            story += img_flowable(ecp, 34 * mm, 34 * mm)
        if e.get("titleRoman"):
            story += [Paragraph(f"<i>{clean(e['titleRoman'])}</i> · {clean(e.get('title',''))}",
                                ST["small"])]
        story += [Paragraph(inline_md(e.get("description", "")), ST["body"])]
        if e.get("notesUrdu"):
            story += [Paragraph(
                f"<font color='#7a6a5f'>Full Urdu show notes on the live episode page "
                f"({len(e['notesUrdu'])} characters).</font>", ST["small"])]
        refs = e.get("scriptureReferences") or []
        if refs:
            story += [Paragraph(f"<b>Scripture:</b> {clean(', '.join(refs))}", ST["small"])]

    ch = music.get("video_channel", {})
    story += [Spacer(1, 6), Paragraph(clean(ch.get("name", "Video masterclasses")), ST["h2"])]
    story += [Paragraph(clean(ch.get("description", "")), ST["body"])]
    v_rows = []
    for v in music.get("videos", []):
        v_rows.append([
            str(v.get("number", "")), v.get("title", ""), v.get("duration", ""),
            v.get("publishDate", ""), ", ".join(v.get("topics", [])),
        ])
    story += make_table(["#", "Masterclass", "Length", "Published", "Topics"],
                        v_rows, col_widths=[0.05, 0.45, 0.10, 0.14, 0.26])

    # ================================================================
    # PART X — DOCUMENTATION
    # ================================================================
    story += part_page(
        "10", "Notes and Records",
        "Project documents, audits and guides kept with the source files",
        hero("images/hero-interlinked.jpg"),
    )

    doc_order = [
        "README.md", "SEQUENCE_50.md", "MASTER_AUDIT_RECORD_50.md", "URL_MAP_50.md",
        "SITE_AUDIT_2026-11-02.md", "VOLUME_15_LINEAGE_2026-11-10.md",
        "LINK_RESTORE.md", "HERO_IMAGE_PLAN.md", "PHASE_10_HERO_BANNERS.md",
        "PERFORMANCE_2026-10-25.md", "INTEGRATION_GUIDE.md", "AGENTS.md", "RULES.md",
    ]
    for i, name in enumerate(doc_order):
        md = docs.get(name)
        if not md:
            continue
        title = name.replace(".md", "").replace("_", " ")
        story += chapter_head("", title, kicker="Part 10")
        story += md_to_flowables(md)

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
    story += [Paragraph(clean_plain(about.get("directory_intro", "")), ST["lead"])]
    a_rows = []
    for app in about.get("apps", []):
        a_rows.append([app.get("name", ""), app.get("category", ""),
                       app.get("url", "").replace("https://", ""),
                       app.get("description", "")])
    story += make_table(["App", "Category", "URL", "Description"], a_rows,
                        col_widths=[0.16, 0.16, 0.24, 0.44])
    story += sub_h("About FAQ")
    for f in about.get("about_faq", []):
        story += [Paragraph(clean(f["question"]), ST["faq_q"]),
                  Paragraph(inline_md(f["answer"]), ST["body"])]

    story += chapter_head("", "Questions People Ask", kicker="Appendix",
                          hero=hero("images/stories/scenes/scroll.webp", "images/stories/scenes/book.webp"))
    for f in about.get("faq", []):
        story += [Paragraph(clean(f["question"]), ST["faq_q"]),
                  Paragraph(inline_md(f["answer"]), ST["body"])]

    story += chapter_head("", "Bible Books and Counts", kicker="Appendix",
                          hero=hero("images/stories/scenes/book.webp"))
    story += [Paragraph(
        f"License: {clean(xref.get('license',''))}. Credits: {clean(xref.get('credits',''))}. "
        f"Generated {xref.get('generated','')}.",
        ST["body"],
    )]
    story += [Paragraph(
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
    story += [Paragraph(
        "The world map module ships dominant-tradition polygons for 175 countries with "
        "population and percentage shares — the same data tabulated earlier in Part VIII.",
        ST["body"],
    )]

    story += [PageBreak(),
              Spacer(1, 42 * mm),
              Paragraph("THE END", ST["part"]),
              Paragraph("Thank you for reading", ST["part_title"]),
              Spacer(1, 6 * mm),
              Paragraph(
                  "Solat Jamil · saulspodship.com · "
                  + datetime.date.today().strftime("%d %B %Y"),
                  ST["part_sub"]),
              Spacer(1, 10 * mm),
              ]
    end_hero = hero("images/hero/last-supper-v2-1920.jpg")
    if end_hero:
        story += img_flowable(end_hero, PAGE_W - 40 * mm, 60 * mm)

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
                        kicker=f"Part 2 · Volume {v['number']:02d}")
    meta = [v.get("category", "").title(), f"Updated {v.get('lastUpdated','')}"]
    if v.get("featured"):
        meta.append("Featured")
    flow += [Paragraph(" · ".join(m for m in meta if m), ST["small"])]
    if v.get("overview"):
        flow += [Paragraph(clean_plain(v["overview"]), ST["lead"])]
    if v.get("summary"):
        flow += [Paragraph(f"<b>Summary.</b> {inline_md(v['summary'])}", ST["body"])]
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
        rows = [[e.get("year", ""), e.get("event", ""), e.get("era", "")]
                for e in timeline]
        flow += make_table(["When", "Event", "Era"], rows,
                           col_widths=[0.18, 0.57, 0.25])
    panels = c.get("storyPanels") or []
    if panels:
        flow += [CondPageBreak(30 * mm), sub_h(f"Story panels ({len(panels)})")]
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
            rows.append([
                f"<b>{p.get('title','')}</b><br/><font color='#7a6a5f'>{p.get('era','')}</font>",
                "<br/>".join(b for b in bits if b),
            ])
        flow += make_table(["Panel", "Detail"], rows, col_widths=[0.32, 0.68])
    profiles = c.get("characterProfiles") or []
    if profiles:
        flow += [CondPageBreak(30 * mm), sub_h("Character profiles")]
        for p in profiles:
            flow += [Paragraph(clean(f"{p.get('name')} — {p.get('role','')}"), ST["q_title"])]
            bits = []
            if p.get("description"):
                bits.append(p["description"])
            if p.get("scriptureReference"):
                bits.append(f"Reference: {p['scriptureReference']}")
            if p.get("significance"):
                bits.append(f"Significance: {p['significance']}")
            flow += [Paragraph(inline_md(" ".join(bits)), ST["body"])]
            if p.get("keyActions"):
                for a in p["keyActions"]:
                    flow += [Paragraph(f"• {inline_md(a)}", ST["bullet"])]
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
            flow += [Paragraph(f"<b>{clean(m.get('title',''))}</b> — {inline_md(m.get('description',''))}",
                               ST["body"])]
            url = m.get("url", "")
            if url.startswith("/"):
                p = ROOT / "public" / url.lstrip("/")
                flow += img_flowable(p, PAGE_W - 2 * MARGIN, 90 * mm)
    lineage = c.get("lineage")
    if lineage:
        flow += [CondPageBreak(40 * mm), sub_h(lineage.get("title", "Lineage"))]
        if lineage.get("intro"):
            flow += [Paragraph(clean(lineage["intro"]), ST["body"])]
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
            flow += [Paragraph(clean(f.get("q", "")), ST["faq_q"]),
                     Paragraph(inline_md(f.get("a", "")), ST["body"])]
    rel = v.get("relatedVolumes") or []
    if rel:
        flow += [Paragraph("<b>Related volumes:</b> " + clean(", ".join(rel)), ST["small"])]
    links = []
    if v.get("articleLink"):
        links.append(f"Article: {v['articleLink']}")
    if v.get("youtubeLink"):
        links.append(f"Video: {v['youtubeLink']}")
    if links:
        flow += [Paragraph(clean(" · ".join(links)), ST["small"])]
    return flow


# ---------------------------------------------------------------- codex question
def build_codex_question(q: dict) -> list:
    flow = [CondPageBreak(28 * mm)]
    n = q.get("n", "")
    flow += [Paragraph(f"Q{n}. {clean(q.get('title',''))}", ST["q_title"])]
    for b in q.get("blocks", []):
        head = b.get("heading", "")
        items = b.get("items") or []
        if not items:
            continue
        flow += [Paragraph(clean(head), ST["q_block_h"])]
        lis = [t for k, t in items if k == "li"]
        ps = [t for k, t in items if k == "p"]
        imgs = [t for k, t in items if k == "img"]
        for p in ps:
            flow += [Paragraph(inline_md(p), ST["body"])]
        if lis:
            flow += [ListFlowable(
                [ListItem(Paragraph(inline_md(li), ST["bullet"]), leftIndent=12)
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
    avail = PAGE_W - 2 * MARGIN
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
        label = Paragraph(
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
