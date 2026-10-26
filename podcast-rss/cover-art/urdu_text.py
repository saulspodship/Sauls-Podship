"""
Render Urdu (Nastaliq) text shapes to tight RGBA PNGs using HarfBuzz + FreeType.

Used by make_episode_cover.py. Requires: pip install uharfbuzz freetype-py pillow
(ImageMagick's built-in text renderer cannot shape Urdu, so we shape here.)
"""
import uharfbuzz as hb
import freetype
from PIL import Image, ImageChops


class UrduFont:
    def __init__(self, path: str):
        self.path = path
        blob = hb.Blob.from_file_path(path)
        self.hb_face = hb.Face(blob)
        self.hb_font = hb.Font(self.hb_face)
        self.ft_face = freetype.Face(path)

    def shape(self, text: str, size_px: int):
        """Return [(glyph_id, x_offset, y_offset, x_advance)] and total advance."""
        font = self.hb_font
        font.scale = (size_px, size_px)
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        buf.direction = "rtl"
        buf.script = "Arab"
        buf.language = "ur"
        hb.shape(font, buf, {"kern": True, "liga": True, "calt": True, "rlig": True})
        out, advance = [], 0
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append((info.codepoint, pos.x_offset, pos.y_offset, pos.x_advance))
            advance += pos.x_advance
        return out, advance

    def line_mask(self, text: str, size_px: int):
        """Render one line to an 8-bit alpha mask. Returns (mask, advance, bbox)."""
        glyphs, advance = self.shape(text, size_px)
        self.ft_face.set_char_size(size_px * 64)  # 26.6 fixed point => ppem == size_px
        pad = size_px * 3  # Nastaliq hangs deep below the baseline
        width = int(advance) + 2 * pad
        height = int(size_px * 6)
        canvas = Image.new("L", (max(width, 1), height), 0)
        base_y = int(size_px * 3.2)  # baseline position inside canvas
        pen_x = pad
        for gid, x_off, y_off, x_adv in glyphs:
            if gid == 0:
                pen_x += x_adv
                continue
            self.ft_face.load_glyph(
                gid, freetype.FT_LOAD_RENDER | freetype.FT_LOAD_TARGET_NORMAL
            )
            slot = self.ft_face.glyph
            bmp = slot.bitmap
            if bmp.width and bmp.rows:
                glyph_img = Image.frombytes(
                    "L", (bmp.width, bmp.rows), bytes(bmp.buffer)
                )
                x = int(pen_x + x_off + slot.bitmap_left)
                y = int(base_y - y_off - slot.bitmap_top)
                canvas.paste(
                    ImageChops.lighter(
                        canvas.crop((x, y, x + bmp.width, y + bmp.rows)), glyph_img
                    ),
                    (x, y),
                )
            pen_x += x_adv
        bbox = canvas.getbbox()
        if bbox:
            canvas = canvas.crop(bbox)
        else:
            canvas = canvas.crop((0, 0, 1, 1))
        return canvas, advance


def urdu_text_image(font: UrduFont, lines, size_px, color, line_gap_px=None,
                    max_width=None, target_width=None):
    """Stack shaped lines centered, return tight RGBA image."""
    masks = []
    for ln in lines:
        m, adv = font.line_mask(ln, size_px)
        masks.append((m, adv, m.height))
    gap = line_gap_px if line_gap_px is not None else int(size_px * 0.55)
    w = max(m.width for m, _, _ in masks)
    h = sum(m.height for m, _, _ in masks) + gap * (len(masks) - 1)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    y = 0
    for m, adv, mh in masks:
        img.paste(Image.merge("RGBA", (Image.new("L", m.size, color[0]),
                                      Image.new("L", m.size, color[1]),
                                      Image.new("L", m.size, color[2]), m)),
                  ((w - m.width) // 2, y), m)
        y += mh + gap
    if target_width:
        r = target_width / img.width
        img = img.resize((int(img.width * r), int(img.height * r)), Image.LANCZOS)
    elif max_width and img.width > max_width:
        r = max_width / img.width
        img = img.resize((int(img.width * r), int(img.height * r)), Image.LANCZOS)
    return img
