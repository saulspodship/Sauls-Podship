"""Fix two crashes in ReportLab 5.x's right-to-left paragraph engine.

Both are the same class of bug: the RTL code path sorts collections whose
entries are sometimes *plain* objects (inline ``<font>``/``<b>`` fragments,
callback definitions) rather than the bidi-aware wrapper types that carry the
``__bidiL__`` / ``__bidiV__`` attributes.  Sorting raises:

    AttributeError: 'str' object has no attribute '__bidiL__'

Any Urdu paragraph that mixes an inline tag, or that straddles a page or frame
break, can hit one of these, which aborts the whole book build.
"""
from __future__ import annotations

import reportlab.platypus.paragraph as _para


def _sort_key(attr, filler):
    def key(item):
        return getattr(item, attr, filler)
    return key


def apply():
    BidiList = _para.BidiList

    # --- 1. splitting a paragraph across a frame boundary -------------------
    def _split_blParaSimple(blPara, start, stop):
        f = blPara.clone()
        for a in ("lines", "kind", "text"):
            if hasattr(f, a):
                delattr(f, a)
        f.words = list(_para._yieldBLParaWords(blPara, start, stop))
        if isinstance(blPara.lines, BidiList):
            # plain fragments have no logical index; sort them first
            f.words.sort(key=_sort_key("__bidiL__", -1))
            f.words = BidiList(f.words)
        if f.words and isinstance(f.words[-1], _para._SplitWordHY):
            f.words[-1].__class__ = (
                _para._SHYSplit
                if isinstance(f.words[-1], _para._SHYStr)
                else _para._SplitWordLL
            )
        return [f]

    _para._split_blParaSimple = _split_blParaSimple

    # --- 2. visual-order sorting while laying out lines ---------------------
    # ReportLab calls this through the module-level name ``sortBidiV``.
    _para.sortBidiV = _sort_key("__bidiV__", -1)

    return True

# --- 3. a split that yields a part too tall for the frame -------------------
# ReportLab raises LayoutError when S[0] from a split still does not fit,
# which kills the build.  For a right-to-left paragraph this can happen when
# the fragment list is reordered, so retry once with a wrapping mode that
# still keeps every glyph shaped before giving up.
from reportlab.platypus.frames import Frame as _Frame

_orig_split = _Frame.split


def _retry_without_wordwrap(f):
    style = getattr(f, "style", None)
    if style is None or getattr(style, "wordWrap", None) != "RTL":
        return None
    from reportlab.lib.styles import ParagraphStyle

    d = {k: v for k, v in style.__dict__.items() if k != "name"}
    d["wordWrap"] = "RTL-horizontal"
    try:
        return f.__class__(f.text, ParagraphStyle("rtl-retry", **d),
                           bulletText=getattr(f, "bulletText", None))
    except Exception:
        return None


def _patched_split(self, f, canv=None):
    try:
        return _orig_split(self, f, canv)
    except Exception:
        retry = _retry_without_wordwrap(f)
        if retry is None:
            raise
        return _orig_split(self, retry, canv)


_Frame.split = _patched_split


# --- 4. words silently dropped / duplicated around mirrored brackets --------
# ReportLab maps each *logical* word onto a visual slot by looking at the
# visual position of its characters.  When a mirrored bracket pair straddles a
# word boundary -- "(Revised Urdu Bible)" set in an RTL paragraph -- the two
# words share characters in both visual slots, so two logical words resolve to
# the same slot.  The result is a word list that is not a permutation: one word
# disappears and another is emitted twice, which is how
#   (Revised Urdu Bible, Bible Society 2010)
# came out as
#   Urdu Bible, Bible Society 2010) 2010)
# The replacement below assigns slots by majority vote and then resolves the
# remainder as a permutation, so no word is ever lost or doubled.
import re as _re

import reportlab.pdfgen.textobject as _to

_wordpat = _re.compile(r"[^ ]+")


def _bidi_word_list(words, direction="RTL", clean=True, wx=False):
    if direction:
        direction = direction.upper()
    if direction not in ("LTR", "RTL"):
        return list(words)
    if not isinstance(words, (list, tuple)):
        raise ValueError("bidiWordList argument words should be a list or tuple")
    n = len(words)
    if n < 2:
        return list(words)

    raw = " ".join(words)
    v2l = []
    bidi = _to.log2vis(raw, base_direction=direction, clean=clean, positions_V_to_L=v2l)
    if len(v2l) != len(raw) or len(bidi) != len(raw):
        return list(words)  # cannot map reliably; leave ReportLab's order

    lspan = [m.span() for m in _wordpat.finditer(raw)]
    vspan = [m.span() for m in _wordpat.finditer(bidi)]
    if len(lspan) != n or len(vspan) != n:
        return list(words)

    l2v = [0] * len(raw)
    for v, l in enumerate(v2l):
        l2v[l] = v

    slot_of = [0] * len(raw)
    for si, (a, b) in enumerate(vspan):
        for p in range(a, b):
            slot_of[p] = si

    votes = [{} for _ in range(n)]
    for wi, (a, b) in enumerate(lspan):
        for l in range(a, b):
            if raw[l] == " ":
                continue
            d = votes[slot_of[l2v[l]]]
            d[wi] = d.get(wi, 0) + 1

    order = [None] * n
    used = set()
    claims = []
    for si, d in enumerate(votes):
        for wi, c in d.items():
            claims.append((-c, wi, si))
    claims.sort()
    for _, wi, si in claims:
        if order[si] is None and wi not in used:
            order[si] = wi
            used.add(wi)
    for si in range(n):
        if order[si] is None:
            for wi in range(n):
                if wi not in used:
                    order[si] = wi
                    used.add(wi)
                    break

    if wx:
        return order

    slot_for_word = {wi: si for si, wi in enumerate(order)}
    out = []
    aR = out.append
    for wi, w in enumerate(words):
        si = slot_for_word[wi]
        aR(_to.bidiStrWrap(bidi[vspan[si][0]:vspan[si][1]], _to.BidiIndex(si, wi)))
    return out


def apply_bidi_words():
    _to.bidiWordList = _bidi_word_list
    _para.bidiWordList = _bidi_word_list
    return True


apply_bidi_words()
