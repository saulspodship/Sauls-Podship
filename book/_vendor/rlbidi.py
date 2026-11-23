"""Minimal stand-in for the retired ``rlbidi`` extension.

ReportLab 4.4+/5.x exposes full right-to-left support (BidiStr, ShapedStr,
``wordWrap="RTL"`` styles, HarfBuzz shaping) but gates it behind
``import rlbidi``.  That package is no longer on PyPI, so this module
re-implements the two functions ReportLab actually uses on top of the
maintained ``python-bidi`` crate:

    log2vis(text, base_direction=None, clean=True, positions_V_to_L=None)

``positions_V_to_L`` is filled with the logical index of every character in
visual order, which ReportLab needs to map shaped glyph clusters back onto
the original markup runs.
"""
from __future__ import annotations

try:
    import bidi.algorithm as _alg
except Exception as exc:  # pragma: no cover - import guard
    raise ImportError(
        "the local rlbidi shim needs python-bidi (pip install python-bidi)"
    ) from exc

__all__ = ["log2vis", "get_display"]


def _resolve(text, base_direction, positions_V_to_L):
    storage = _alg.get_empty_storage()
    bd = str(base_direction or "R")[0].upper()
    if bd not in ("L", "R"):
        bd = "R"
    storage["base_level"] = _alg.PARAGRAPH_LEVELS[bd]
    storage["base_dir"] = bd

    _alg.get_embedding_levels(text, storage)
    for i, ch in enumerate(storage["chars"]):
        ch["index"] = i
    _alg.explicit_embed_and_overrides(storage, False)
    _alg.resolve_weak_types(storage, False)
    _alg.resolve_neutral_types(storage, False)
    _alg.resolve_implicit_levels(storage, False)
    _alg.reorder_resolved_levels(storage, False)
    _alg.apply_mirroring(storage, False)

    chars = storage["chars"]
    if positions_V_to_L is not None:
        positions_V_to_L.extend(c["index"] for c in chars)
    return "".join(c["ch"] for c in chars)


def log2vis(text, base_direction=None, clean=True, positions_V_to_L=None):
    """Return ``text`` reordered into visual order for PDF drawing."""
    if not isinstance(text, str):
        text = str(text)
    if not text:
        return text
    return _resolve(text, base_direction, positions_V_to_L)


def get_display(text, base_direction=None, clean=True):
    """python-bidi compatible alias."""
    return log2vis(text, base_direction=base_direction, clean=clean)
