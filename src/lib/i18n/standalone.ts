/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standalone shim entry point.
 *
 * `scripts/build-i18n.mjs` bundles this file (engine + store + fonts + the
 * generated dictionary URL logic) into `public/assets/sp-i18n.js`, a tiny
 * dependency-free IIFE that the static documents include:
 *
 *   prophecy-map.html · kings-of-the-bible.html · cross-references/viz.html
 *   encyclopedia/biblical-maps-atlas.html · singers.html · videos/index.html
 *   biblical-maps/index.html · world-religion-map/index.html
 *   family-tree/adam-to-jesus-overlap.html · comparative-apologetics/*.html
 *
 * Those pages are not rendered by React, so without the shim they would stay
 * English no matter what the visitor picked in the header. The shim reads the
 * same `sp-lang` preference, translates the whole document, keeps its own
 * language selector (if the page has one) in sync, and tells the parent app
 * about changes so the whole browser follows.
 *
 * When the document is embedded in an iframe the parent app already walks into
 * it, so the shim only stamps `lang`/`dir`/fonts there — never text — which
 * keeps the two translators from fighting over the same nodes.
 */

import { applyDocumentLang, getLang, onLangChange, setLang, wireLangSync, LANG_KEY, LANG_EVENT } from './store';
import { startI18n, rescan, t, report, setLanguage } from './engine';
import { applyLangFonts } from './fonts';
import { LANGS, LANG_ORDER, type Lang } from './types';

declare global {
  interface Window {
    __spI18n?: {
      lang: () => Lang;
      set: (lang: Lang) => void;
      rescan: () => void;
      t: (source: string, fallback?: string) => string;
      report: () => ReturnType<typeof report>;
      langs: Lang[];
      native: (lang: Lang) => string;
      version: string;
    };
  }
}

const embedded = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

function boot(): void {
  const lang = getLang();
  applyDocumentLang(document, lang);
  applyLangFonts(document, lang);

  if (!embedded) {
    /* Top-level static page: translate its own content. */
    void startI18n();
  } else {
    /* Inside the app's iframe: adopt the parent's language, let the parent
       translate the text (it walks same-origin frames), keep lang/dir/fonts
       correct in case the frame is ever opened on its own. */
    wireLangSync();
    onLangChange((next) => {
      applyDocumentLang(document, next);
      applyLangFonts(document, next);
    });
    window.addEventListener('message', (e: MessageEvent) => {
      const d = e.data as { sp?: string; lang?: Lang } | null;
      if (!d || d.sp !== 'lang' || !d.lang) return;
      setLang(d.lang, { persist: true, broadcast: false });
    });
  }

  /* A page's own <select data-sp-lang> (podship-enhance.js, maps atlas) drives
     the whole site — no private dictionary, no private state. */
  document.querySelectorAll<HTMLSelectElement>('select[data-sp-lang], select#sp-lang').forEach((sel) => {
    sel.value = lang;
    if ((sel as unknown as { __spWired?: boolean }).__spWired) return;
    (sel as unknown as { __spWired?: boolean }).__spWired = true;
    sel.addEventListener('change', () => {
      const next = sel.value as Lang;
      if (!LANG_ORDER.includes(next)) return;
      setLang(next);
      /* Tell the parent app (when embedded) so the header follows. */
      try { window.parent?.postMessage({ sp: 'lang', lang: next }, window.location.origin); } catch { /* cross-origin */ }
    });
  });

  window.__spI18n = {
    lang: getLang,
    set: (l: Lang) => setLang(l),
    rescan,
    t,
    report,
    langs: LANG_ORDER,
    native: (l: Lang) => LANGS[l].native,
    version: '__SP_I18N_BUILD__',
  };

  /* Retrofit scripts (site-header.js, bottom-nav.js, maps-atlas.js) inject
     their own markup a beat later — settle once they have. */
  window.setTimeout(rescan, 400);
  window.setTimeout(rescan, 1400);
  window.setTimeout(rescan, 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* Exported for the static pages' inline scripts. */
export { LANG_KEY, LANG_EVENT, LANGS, LANG_ORDER };
