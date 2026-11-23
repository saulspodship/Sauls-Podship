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
        r = _orig_split(self, f, canv)
    except Exception:
        retry = _retry_without_wordwrap(f)
        if retry is None:
            raise
        return _orig_split(self, retry, canv)

    # doctemplate raises when S[0] still does not fit the space that is left,
    # which kills the build.  That can happen with a right-to-left paragraph
    # whose split lines come back reordered and slightly too tall.  Keep
    # splitting the first part until it does fit, and hand the leftover back
    # on the flowable list.
    if not r or getattr(self, "_aW", 0) <= 0:
        return r
    h = self._y - self._y1p
    if not self._atTop:
        s = f.getSpaceBefore()
        if self._oASpace:
            s = max(s - self._prevASpace, 0)
        h -= s
    if h <= 0:
        return r

    for _ in range(8):
        head = r[0]
        wrap = getattr(head, "wrap", None)
        if wrap is None:
            break
        try:
            _, hh = wrap(self._aW, 1e6)
        except Exception:
            break
        if hh <= h + 1e-6:
            break
        try:
            more = head.split(self._aW, h)
        except Exception:
            break
        if not more or len(more) < 2:
            break
        r = [more[0]] + list(more[1:]) + list(r[1:])
    return r


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
    if len(v2l) != len(bidi):
        return list(words)  # cannot map reliably; leave ReportLab's order

    lspan = [m.span() for m in _wordpat.finditer(raw)]
    vspan = [m.span() for m in _wordpat.finditer(bidi)]
    if len(lspan) != n or len(vspan) != n:
        return list(words)

    # ZWNJ (U+200C) is a "boundary neutral" that the Unicode X9 rule removes,
    # so the visual string can be shorter than the logical one.  Those
    # characters are invisible, so simply leave them out of the mapping.
    l2v = {}
    for v, l in enumerate(v2l):
        l2v[l] = v

    slot_of = [0] * len(raw)
    for si, (a, b) in enumerate(vspan):
        for p in range(a, b):
            slot_of[p] = si

    votes = [{} for _ in range(n)]
    for wi, (a, b) in enumerate(lspan):
        for l in range(a, b):
            if raw[l] == " " or l not in l2v:
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

    # ``order`` maps a visual slot to the logical word in it; ReportLab wants
    # the inverse, indexed by logical word.
    slot_for_word = {wi: si for si, wi in enumerate(order)}
    if wx:
        return [slot_for_word[wi] for wi in range(n)]

    # ReportLab's drawing code sorts each line by __bidiV__ and takes the text
    # from the list, so the list must stay in *logical* order and every entry
    # must carry its visual slot.  BidiStr has to be built directly: going
    # through bidiStrWrap() silently returns a plain str and drops the slot,
    # which leaves the paragraph in source order and reverses the display.
    out = []
    aR = out.append
    for wi in range(n):
        si = slot_for_word[wi]
        a, b = vspan[si]
        aR(_to.BidiStr(bidi[a:b], bidiV=si, bidiL=wi))
    return out


_orig_bidiWordList = _to.bidiWordList


def apply_bidi_words():
    _to.bidiWordList = _bidi_word_list
    _para.bidiWordList = _bidi_word_list
    return True


apply_bidi_words()


# --- 5. setRise crashes when the text buffer is empty ------------------------
# ReportLab's setRise() looks at the previous operator to collapse redundant
# rise changes ("... Ts" pairs).  With shaped right-to-left text the buffer can
# be flushed before the rise is reset, so _code is empty and the lookup raises
# "IndexError: list index out of range", killing the build mid-book.
from reportlab.pdfgen.textobject import PDFTextObject as _PDFTextObject

_orig_setRise = _PDFTextObject.setRise


def _setRise(self, rise):
    if not getattr(self, "_code", None):
        # restore the buffer to a sane state instead of indexing into nothing
        self._rise = rise
        self._y -= rise
        self._code = [f"{_fmt_float(rise)} Ts"]
        return
    return _orig_setRise(self, rise)


def _fmt_float(v):
    return ("%f" % v).rstrip("0").rstrip(".")


_PDFTextObject.setRise = _setRise
