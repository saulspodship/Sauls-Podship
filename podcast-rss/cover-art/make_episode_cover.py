#!/usr/bin/env python3
"""
Build a 3000x3000 episode cover for Saul's Podship.

Usage:
  python3 make_episode_cover.py --number 1 --urdu "کیا سب کچھ پہلے سے لکھا ہے؟" \
      --urdu-sub "تقدیر اور آزاد مرضی" --emblem ep01-emblem-raw.png --out ep01-cover

Needs: pillow, uharfbuzz, freetype-py (and fonts/NotoNastaliqUrdu-Bold.ttf),
plus a DejaVu Serif from the OS for the Latin lines.
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

from urdu_text import UrduFont, urdu_text_image

WINE = (74, 21, 44)
GOLD = (232, 201, 106)
CREAM = (248, 244, 227)
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")

# vertical map of the card (fractions of the canvas height)
HEADER_TOP = 0.070
EMBLEM_TOP = 0.188
EMBLEM_SIZE = 0.398
TEXT_BOTTOM = 0.884      # bottom edge the Urdu block may grow up to
TEXT_GAP_AFTER_EMBLEM = 0.018
FOOTER_TOP = 0.905


def tracked(text, font, tracking=0.18):
    """Render Latin text with letter-spacing onto an RGBA strip."""
    widths = [font.getlength(c) for c in text]
    total = int(sum(widths) + tracking * font.size * (len(text) - 1)) + 20
    h = int(font.size * 1.7)
    img = Image.new("RGBA", (total, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 10
    for c, w in zip(text, widths):
        d.text((x, h * 0.12), c, font=font, fill=GOLD)
        x += w + tracking * font.size
    return img.crop(img.getbbox())


def gold_rule(width, thickness=4, alpha=150):
    return Image.new("RGBA", (width, thickness), GOLD + (alpha,))


def gold_emblem(path, size):
    """Turn a flat-background emblem into crisp gold line art with a transparent
    background, so no square edge shows against the wine canvas.

    alpha = how far each pixel rises above that image's own background level;
    the ramp is then normalised per image, so all eleven covers end up with the
    same visual weight whatever the source brightness."""
    em = Image.open(path).convert("RGB").resize((size, size), Image.LANCZOS)
    lum = em.convert("L")
    hist = lum.histogram()
    bg = max(range(256), key=lambda v: hist[v])          # modal background level
    ramp = lum.point(
        lambda v: 0 if v < bg + 6 else min(255, int(255 * ((v - bg - 6) / 150.0) ** 0.7))
    )
    h = ramp.histogram()
    total = sum(h)
    acc, p995 = 0, 255
    for v, c in enumerate(h):
        acc += c
        if acc >= total * 0.995:
            p995 = v
            break
    scale = 255.0 / max(p995, 30)
    alpha = ramp.point(lambda v: min(255, int(v * scale)))
    out = em.convert("RGBA")
    out.putalpha(alpha)
    return out


def build(number, urdu_lines, urdu_sub, emblem, out_base, size=3000):
    canvas = Image.new("RGBA", (size, size), WINE + (255,))

    # --- warm vignette so the flat wine does not read as a placeholder --------
    vig = Image.new("L", (size, size), 0)
    ImageDraw.Draw(vig).ellipse(
        (-size * 0.25, -size * 0.25, size * 1.25, size * 1.25), fill=60)
    vig = vig.filter(ImageFilter.GaussianBlur(size * 0.06)).point(lambda v: int(v * 0.55))
    canvas = Image.composite(Image.new("RGBA", (size, size), (120, 40, 74, 255)),
                             canvas, vig)

    # --- double gold frame ---------------------------------------------------
    d = ImageDraw.Draw(canvas)
    d.rectangle((size * 0.032, size * 0.032, size * 0.968, size * 0.968),
                outline=GOLD + (170,), width=10)
    d.rectangle((size * 0.044, size * 0.044, size * 0.956, size * 0.956),
                outline=GOLD + (90,), width=4)

    # --- wordmark ------------------------------------------------------------
    serif_bold = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", int(size * 0.040))
    serif = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", int(size * 0.026))

    word = tracked("SAUL’S PODSHIP", serif_bold, 0.16)
    canvas.alpha_composite(word, ((size - word.width) // 2, int(size * HEADER_TOP)))

    rule = gold_rule(int(size * 0.10), 3, 150)
    canvas.alpha_composite(rule, ((size - rule.width) // 2, int(size * HEADER_TOP) + int(size * 0.056)))

    ep = tracked(f"EPISODE {number:02d}", serif, 0.42)
    canvas.alpha_composite(ep, ((size - ep.width) // 2, int(size * HEADER_TOP) + int(size * 0.070)))

    # --- emblem --------------------------------------------------------------
    em_size = int(size * EMBLEM_SIZE)
    emblem_bottom = int(size * EMBLEM_TOP) + em_size
    canvas.alpha_composite(gold_emblem(emblem, em_size),
                           ((size - em_size) // 2, int(size * EMBLEM_TOP)))

    # --- Urdu title + subtitle, fitted into the space under the emblem -------
    nastaliq = UrduFont(os.path.join(FONT_DIR, "NotoNastaliqUrdu-Bold.ttf"))
    one_line = len(urdu_lines) == 1
    gap = int(size * (0.020 if one_line else 0.015))
    title_size = int(size * (0.058 if one_line else 0.047))
    title = urdu_text_image(nastaliq, urdu_lines, title_size, CREAM,
                            max_width=int(size * 0.82),
                            target_width=int(size * (0.78 if one_line else 0.755)))
    sub = None
    if urdu_sub:
        sub = urdu_text_image(nastaliq, [urdu_sub], int(size * (0.042 if one_line else 0.032)), GOLD,
                              max_width=int(size * 0.70),
                              target_width=int(size * (0.56 if one_line else 0.42)))

    block_h = title.height + (gap + sub.height if sub else 0)
    max_h = int(size * TEXT_BOTTOM) - (emblem_bottom + int(size * TEXT_GAP_AFTER_EMBLEM))
    if block_h > max_h:                      # shrink to fit, keep both lines
        r = max_h / block_h
        title = title.resize((int(title.width * r), int(title.height * r)), Image.LANCZOS)
        gap = int(gap * r)
        if sub:
            sub = sub.resize((int(sub.width * r), int(sub.height * r)), Image.LANCZOS)
        block_h = title.height + (gap + sub.height if sub else 0)

    y = int(size * TEXT_BOTTOM) - block_h
    canvas.alpha_composite(title, ((size - title.width) // 2, y))
    if sub:
        canvas.alpha_composite(sub, ((size - sub.width) // 2, y + title.height + gap))

    # --- footer --------------------------------------------------------------
    foot = tracked("URDU BIBLE APOLOGETICS", serif, 0.34)
    canvas.alpha_composite(foot, ((size - foot.width) // 2, int(size * FOOTER_TOP)))

    out = f"{out_base}-{size}x{size}.jpg"
    canvas.convert("RGB").save(out, quality=92, subsampling=1, optimize=True)
    small = f"{out_base}-1400x1400.jpg"
    canvas.convert("RGB").resize((1400, 1400), Image.LANCZOS).save(
        small, quality=90, subsampling=1, optimize=True)
    return out, small


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--number", type=int, required=True)
    p.add_argument("--urdu", nargs="+", required=True, help="one or more title lines")
    p.add_argument("--urdu-sub", default="")
    p.add_argument("--emblem", required=True)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    for f in build(a.number, a.urdu, a.urdu_sub, a.emblem, a.out):
        print(f)
