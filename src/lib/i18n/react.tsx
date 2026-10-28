/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * React glue for the site-wide language layer.
 *
 * `<I18nProvider>` is mounted once in RootLayout. It
 *   - owns the language state (persisted in localStorage, shared with the
 *     static module frames and other tabs),
 *   - starts the DOM translator, which keeps every page, volume, module,
 *     iframe and retrofit-script string in the chosen language,
 *   - re-translates on every route change, and
 *   - exposes `t()` for strings React builds at runtime (alerts, dynamic
 *     aria-labels, data-driven labels).
 *
 * Components do NOT need to be rewritten to be translatable: the engine works
 * on the rendered DOM. `t()` exists for the cases where a string never reaches
 * the DOM as text (window.alert, document.title, attribute values built in JS).
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getLang, onLangChange, setLang as storeSetLang, wireLangSync } from './store';
import { rescan, startI18n, t as translateString } from './engine';
import type { Lang } from './types';
import { LANGS, LANG_ORDER } from './types';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a runtime-built string. Falls back to the source text. */
  t: (source: string, fallback?: string) => string;
  /** Language list for selectors, in site order. */
  options: { code: Lang; native: string; label: string; dir: 'ltr' | 'rtl' }[];
  isRtl: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (typeof window === 'undefined' ? 'en' : getLang()));
  const location = useLocation();

  /* Boot the engine once: it stamps <html lang dir>, loads the dictionary and
     starts watching the DOM (including same-origin module iframes). */
  useEffect(() => {
    wireLangSync();
    void startI18n();
    return onLangChange((next) => setLangState(next));
  }, []);

  /* Every route change renders new copy — re-scan once it has painted. */
  useEffect(() => {
    rescan();
    const a = window.setTimeout(rescan, 260);
    const b = window.setTimeout(rescan, 900);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [location.pathname, location.search, lang]);

  const setLang = useCallback((next: Lang) => {
    storeSetLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<I18nValue>(() => ({
    lang,
    setLang,
    t: (source: string, fallback?: string) => translateString(source, fallback),
    options: LANG_ORDER.map((code) => ({
      code, native: LANGS[code].native, label: LANGS[code].label, dir: LANGS[code].dir,
    })),
    isRtl: LANGS[lang].dir === 'rtl',
  }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/** Language state + setter. Safe outside the provider (returns the store value). */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  const lang = getLang();
  return {
    lang,
    setLang: (next: Lang) => storeSetLang(next),
    t: (source: string, fallback?: string) => translateString(source, fallback),
    options: LANG_ORDER.map((code) => ({ code, native: LANGS[code].native, label: LANGS[code].label, dir: LANGS[code].dir })),
    isRtl: LANGS[lang].dir === 'rtl',
  };
}

export function useLang(): Lang { return useI18n().lang; }

/** Translate a runtime-built string. */
export function useT(): (source: string, fallback?: string) => string { return useI18n().t; }

export default I18nProvider;
