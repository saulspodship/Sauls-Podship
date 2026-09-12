---
trigger: always_on
description: Guardrails for the Comparative Apologetics Codex add-on (fifth pillar + /comparative-apologetics route)
---

# Comparative Apologetics Codex — rules

- `public/comparative-apologetics/codex.html` is a **frozen, verified artifact**. Never rewrite,
  reformat, minify, or split it. If a content edit is genuinely required, edit it in place with a
  minimal diff and run `node scripts/verify-codex.mjs` (must report 400/400, 100 per religion).
- The codex is embedded via `<iframe src="/comparative-apologetics/codex.html">`. Do not inline it,
  do not convert it to JSX, do not fetch-and-`dangerouslySetInnerHTML` it.
- Route slug is `comparative-apologetics` (hash router → `/#/comparative-apologetics`). Do not rename.
- The fifth pillar card must reuse the **exact** classes of the existing four pillar cards:
  `p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center
  justify-between text-center group hover:border-[#D4AF37] transition-all`.
- Site palette only: wine `#4A152C`, deep wine `#8B1C2E`, gold `#D4AF37` / `#E8C96A`,
  cream `#F8F4E3` / `#FDFBF7`, navy `#1D2D50`. No new brand colours.
- Do not touch the other four pillars' copy, icons, or hrefs.
- Icons come from `lucide-react` (already a dependency) or inline SVG — do not add icon packages.
- Do not add dependencies for this feature. It needs none.
- When done, always run `npm run build` and confirm `dist/comparative-apologetics/codex.html` exists.
