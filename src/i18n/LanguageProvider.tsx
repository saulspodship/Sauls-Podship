/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANG_OPTIONS, RTL_LANGS, translate, type LangCode } from './dict';

/**
 * Site-wide language state (EN / اردو / हिन्दी / العربية).
 *
 * One source of truth for the WHOLE website:
 *   • the header language selector (ChromeControls) writes to it;
 *   • the per-page language selector on the theological archive syncs with it;
 *   • the embedded codex / module iframes are told about changes through a
 *     `sp-lang-change` window event (plus ?lang= on their src);
 *   • the preference persists in localStorage("sp-lang") so static pages
 *     (comparative-apologetics codex, prophecy map…) pick it up too.
 */

export interface SiteLangContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  /** Translate a UI string; returns the original when no translation exists. */
  t: (text: string) => string;
}

const SiteLangContext = createContext<SiteLangContextValue>({
  lang: 'en',
  setLang: () => undefined,
  dir: 'ltr',
  isRtl: false,
  t: (s) => s,
});

const STORAGE_KEY = 'sp-lang';

const readStoredLang = (): LangCode => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LANG_OPTIONS.some((o) => o.code === v) ? (v as LangCode) : 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>(readStoredLang);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
  }, []);

  // Reflect the choice on <html> and tell the embedded static pages (codex,
  // prophecy map, interlinked Bible — they all listen for this event).
  useEffect(() => {
    const root = document.documentElement;
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    root.lang = lang;
    root.dir = dir;
    root.setAttribute('data-lang', lang);
    window.dispatchEvent(new CustomEvent('sp-lang-change', { detail: { lang } }));
    ensureLangFonts(lang);
  }, [lang]);

  const value = useMemo<SiteLangContextValue>(() => ({
    lang,
    setLang,
    dir: RTL_LANGS.includes(lang) ? 'rtl' : 'ltr',
    isRtl: RTL_LANGS.includes(lang),
    t: (text: string) => translate(text, lang) ?? text,
  }), [lang, setLang]);

  return <SiteLangContext.Provider value={value}>{children}</SiteLangContext.Provider>;
};

export const useSiteLang = () => useContext(SiteLangContext);

/* ───────────────────── non-English webfonts (lazy) ───────────────────── */

let fontsReady = false;
function ensureLangFonts(lang: LangCode) {
  if (lang === 'en' || fontsReady) return;
  fontsReady = true;
  if (document.getElementById('sp-lang-fonts')) return;
  const link = document.createElement('link');
  link.id = 'sp-lang-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.id = 'sp-lang-font-style';
  style.textContent = [
    // DOM-translated leaves
    'html[data-lang="ur"] [data-sp-i18n="ur"]{font-family:"Noto Nastaliq Urdu","Jameel Noori Nastaleeq","Urdu Typesetting",serif;line-height:2.15}',
    'html[data-lang="ar"] [data-sp-i18n="ar"]{font-family:"Noto Naskh Arabic","Amiri","Traditional Arabic",serif;line-height:1.9}',
    'html[data-lang="hi"] [data-sp-i18n="hi"]{font-family:"Noto Sans Devanagari","Mangal","Kohinoor Devanagari",sans-serif}',
    // React-rendered translated content (archive questions, codex headings…)
    'main [lang="ur"]{font-family:"Noto Nastaliq Urdu","Jameel Noori Nastaleeq","Urdu Typesetting",serif;line-height:2.15}',
    'main [lang="ar"]{font-family:"Noto Naskh Arabic","Amiri","Traditional Arabic",serif;line-height:1.9}',
    'main [lang="hi"]{font-family:"Noto Sans Devanagari","Mangal","Kohinoor Devanagari",sans-serif}',
  ].join('');
  document.head.appendChild(style);
}

/* ─────────────────────── DOM translation layer ───────────────────────── */

/**
 * Walk the rendered page and swap every dictionary hit into the selected
 * language. Runs after each render pass (ChromeControls owns the observers),
 * so lazily loaded routes are covered without per-page code.
 */
const LEAF_SEL = [
  'header a', 'header button', 'header span', 'header p',
  'footer a', 'footer button', 'footer h4', 'footer span', 'footer p', 'footer li',
  'nav a', 'nav button', 'nav span', 'nav p',
  'main h1', 'main h2', 'main h3', 'main h4', 'main button', 'main p', 'main span',
  'main li', 'main a', 'main dt', 'main dd', 'main small', 'main label',
  'main summary', 'main legend', 'main option', 'main strong',
].join(', ');

export function restoreDomTranslations() {
  document.querySelectorAll('[data-sp-i18n]').forEach((el) => {
    const orig = (el as HTMLElement).getAttribute('data-sp-orig');
    if (orig !== null) el.textContent = orig;
    el.removeAttribute('data-sp-i18n');
    el.removeAttribute('data-sp-orig');
  });
  document.querySelectorAll('[data-sp-i18n-ph]').forEach((el) => {
    const orig = (el as HTMLElement).getAttribute('data-sp-orig-ph');
    if (orig !== null) (el as HTMLInputElement).placeholder = orig;
    el.removeAttribute('data-sp-i18n-ph');
    el.removeAttribute('data-sp-orig-ph');
  });
}

export function applyLangToDom(lang: LangCode) {
  restoreDomTranslations();
  if (lang === 'en') return;
  let budget = 4000; // safety valve, far above any real page
  document.querySelectorAll<HTMLElement>(LEAF_SEL).forEach((el) => {
    if (budget <= 0) return;
    if (el.closest('[data-sp-i18n-skip]')) return;
    // leaves only — an element that wraps other elements is a heading split
    // by markup and is translated by its own component instead
    if (el.querySelector('*:not(svg):not(path):not(circle):not(use)')) return;
    const raw = el.textContent || '';
    const hit = translate(raw, lang);
    if (hit) {
      el.setAttribute('data-sp-orig', raw.replace(/\s+/g, ' ').trim());
      el.setAttribute('data-sp-i18n', lang);
      el.textContent = hit;
      budget--;
    }
  });
  // search inputs etc. — translate the placeholder attribute too
  document.querySelectorAll<HTMLInputElement>('main input[placeholder]').forEach((el) => {
    if (el.closest('[data-sp-i18n-skip]')) return;
    const hit = translate(el.placeholder, lang);
    if (hit) {
      el.setAttribute('data-sp-orig-ph', el.placeholder);
      el.setAttribute('data-sp-i18n-ph', lang);
      el.placeholder = hit;
    }
  });
}
