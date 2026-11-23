"""Fix a crash in ReportLab 5.x when splitting right-to-left paragraphs.

``Paragraph._split_blParaSimple`` reorders the words of a bidi line by their
logical index:

    f.words.sort(key=lambda _: _.__bidiL__)

but the same function also yields plain fragments (inline ``<font>``/``<b>``
boundaries and callback definitions) that carry no ``__bidiL__`` attribute.
Any RTL paragraph that straddles a page or frame break with inline markup in
it therefore dies with ``AttributeError: 'str' object has no attribute
'__bidiL__'``.

This module installs an equivalent implementation whose sort key tolerates
plain entries. Fragments keep their position ahead of the reordered words,
which is what ReportLab's own non-bidi path does.
"""
from __future__ import annotations

import reportlab.platypus.paragraph as _para


def apply():
    BidiList = _para.BidiList

    def _split_blParaSimple(blPara, start, stop):
        f = blPara.clone()
        for a in ("lines", "kind", "text"):
            if hasattr(f, a):
                delattr(f, a)
        f.words = list(_para._yieldBLParaWords(blPara, start, stop))
        if isinstance(blPara.lines, BidiList):
            # plain fragments (no logical index) sort first, in place
            f.words.sort(key=lambda w: getattr(w, "__bidiL__", -1))
            f.words = BidiList(f.words)
        if f.words and isinstance(f.words[-1], _para._SplitWordHY):
            f.words[-1].__class__ = (
                _para._SHYSplit
                if isinstance(f.words[-1], _para._SHYStr)
                else _para._SplitWordLL
            )
        return [f]

    _para._split_blParaSimple = _split_blParaSimple
    return True
