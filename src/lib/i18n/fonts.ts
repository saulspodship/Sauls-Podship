/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Per-language typography.
 *
 * Translating the words is only half the job: Urdu set in a Latin sans face at
 * `leading-tight` with `tracking-widest` is unreadable (Nastaliq needs a deep
 * line box and no letter-spacing at all), and Devanagari/Naskh need their own
 * families. So the language layer owns the fonts too.
 *
 * Urdu ships as local woff2 (public/fonts/noto-nastaliq-urdu-*.woff2) because
 * the site already self-hosts it for the podcast pages. Hindi/Arabic are
 * fetched from Google Fonts on demand — the same origin index.html already
 * preconnects to — and only ever for the active language.
 */

import { LANGS, type Lang } from './types';

const STYLE_ID = 'sp-i18n-fonts';
const URDU_FONT_FACE = `
@font-face{font-family:"Noto Nastaliq Urdu";src:url("/fonts/noto-nastaliq-urdu-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap;unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200D,U+2010-2011,U+2018-201F}
@font-face{font-family:"Noto Nastaliq Urdu";src:url("/fonts/noto-nastaliq-urdu-700.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap;unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200D,U+2010-2011,U+2018-201F}
@font-face{font-family:"Noto Naskh Arabic";src:local("Noto Naskh Arabic"),local("Traditional Arabic");font-display:swap}
`;

/** Typographic fixes applied while a non-Latin language is active. Kept in JS
 *  so the static module documents (which do not load global.css) get them too. */
function scriptCss(lang: Lang): string {
  const cfg = LANGS[lang];
  if (!cfg.fontStack) return '';
  const base = `
html[data-lang="${lang}"] body,html[data-lang="${lang}"] .sp-i18n-scope{font-family:${cfg.fontStack} !important}
html[data-lang="${lang}"] *{letter-spacing:normal !important}
html[data-lang="${lang}"] h1,html[data-lang="${lang}"] h2,html[data-lang="${lang}"] h3,
html[data-lang="${lang}"] h4,html[data-lang="${lang}"] p,html[data-lang="${lang}"] li,
html[data-lang="${lang}"] td,html[data-lang="${lang}"] th,html[data-lang="${lang}"] dd,
html[data-lang="${lang}"] dt,html[data-lang="${lang}"] blockquote{line-height:2.05}
html[data-lang="${lang}"] .uppercase{text-transform:none}
html[data-lang="${lang}"] button,html[data-lang="${lang}"] a,html[data-lang="${lang}"] span,
html[data-lang="${lang}"] label,html[data-lang="${lang}"] select,html[data-lang="${lang}"] option,
html[data-lang="${lang}"] .text-\\[10px\\],html[data-lang="${lang}"] .text-\\[11px\\]{line-height:1.9}
html[data-lang="${lang}"] .whitespace-nowrap{white-space:normal}
html[data-lang="${lang}"] table{width:100%}
`;
  if (lang !== 'ur') return base;
  /* Nastaliq ascends and descends far more than Latin: give it air, and stop
     tight fixed-height chips from clipping it. */
  return base + `
html[data-lang="ur"] h1,html[data-lang="ur"] h2,html[data-lang="ur"] .hero-scrim h1{line-height:2.35}
html[data-lang="ur"] .h-10,html[data-lang="ur"] .h-8,html[data-lang="ur"] .h-9{height:auto;min-height:2.5rem;padding-top:.35rem;padding-bottom:.35rem}
html[data-lang="ur"] .truncate{text-overflow:clip;overflow:visible}
html[data-lang="ur"] .tracking-\\[0\\.2em\\],html[data-lang="ur"] .tracking-widest,
html[data-lang="ur"] .tracking-wider,html[data-lang="ur"] .tracking-tight{letter-spacing:normal !important}
`;
}

const loaded = new Set<string>();

/**
 * Make the active language readable in this document (and, when asked, in an
 * iframe's document). Idempotent — safe to call on every language change.
 */
export function applyLangFonts(doc: Document, lang: Lang): void {
  const head = doc.head;
  if (!head) return;

  let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement('style');
    style.id = STYLE_ID;
    head.appendChild(style);
  }
  const css = (lang === 'ur' || lang === 'ar' ? URDU_FONT_FACE : '') + scriptCss(lang);
  if (style.textContent !== css) style.textContent = css;

  const cfg = LANGS[lang];
  if (!cfg.webfont) return;
  const key = `${doc === document ? 'top' : 'frame'}:${cfg.webfont}`;
  if (loaded.has(key)) return;
  loaded.add(key);
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = cfg.webfont;
  link.setAttribute('data-sp-i18n-font', lang);
  head.appendChild(link);
}

/** Drop the injected font CSS (back to English). */
export function clearLangFonts(doc: Document): void {
  doc.getElementById(STYLE_ID)?.remove();
  doc.querySelectorAll('link[data-sp-i18n-font]').forEach((l) => l.remove());
}
