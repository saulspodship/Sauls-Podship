#!/usr/bin/env python3
"""
Render all 11 episode covers (3000x3000 + 1400x1400) from ../episodes.json.

    python3 make_all_covers.py

Episode titles come from episodes.json; the typographic line splits and the
short gold subtitles live in LAYOUT below, because where a Nastaliq line should
break is a design decision, not a data one.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_episode_cover import build  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
EMBLEM_DIR = os.path.join(HERE, "emblems")

# number: (title lines, gold subtitle)
LAYOUT = {
    1: (["کیا سب کچھ پہلے سے لکھا ہے؟"], "تقدیر اور آزاد مرضی"),
    2: (["آزمائش میں الٰہی وعدوں کی حقیقت"], "مصیبت میں خدا کے وعدے"),
    3: (["خوشحالی کی انجیل کا فریب"], "ایمان، قناعت اور مال و دولت"),
    4: (["یسوع کے دو مختلف شجرۂ نسب"], "متی ۱ اور لوقا ۳ کا معمہ"),
    5: (["سیکرٹ ریپچر:", "1830 کا خواب یا حقیقت؟"], "خفیہ ریپچر کی تاریخ"),
    6: (["بائبل اور غلامی کی اصل حقیقت"], "متن، سیاق و سباق اور تاریخ"),
    7: (["بائبل کی جنگیں اور الٰہی انصاف"], "عہدِ عتیق کے مشکل متن"),
    8: (["آنکھ کے بدلے آنکھ", "اور سزائے موت"], "قصاص اور الٰہی عدالت"),
    9: (["مسیحیت میں طلاق اور جذباتی شفا"], "ٹوٹے دلوں کے لیے امید"),
    10: (["کلیسیا میں خواتین کی", "قیادت اور بائبل"], "خدمت، قیادت اور عزت"),
    11: (["ہم جنس پرستی اور", "قدیم مذہبی بحث"], "سچ، فضل اور رحمت"),
}


def main():
    meta = json.load(open(os.path.join(HERE, "..", "episodes.json")))
    made = []
    for ep in meta["episodes"]:
        n = ep["number"]
        lines, sub = LAYOUT[n]
        emblem = next(
            (os.path.join(EMBLEM_DIR, f"ep{n:02d}-raw.{ext}") for ext in ("jpg", "png")
             if os.path.exists(os.path.join(EMBLEM_DIR, f"ep{n:02d}-raw.{ext}"))),
            os.path.join(EMBLEM_DIR, f"ep{n:02d}-raw.jpg"),
        )
        out = os.path.join(HERE, f"ep{n:02d}-cover")
        for f in build(n, lines, sub, emblem, out):
            made.append(f)
            print(os.path.basename(f), os.path.getsize(f) // 1024, "KB")
    print(f"\n{len(made)} files")


if __name__ == "__main__":
    main()
