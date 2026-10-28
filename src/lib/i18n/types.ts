/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared types for the site-wide language layer (`sp-i18n`).
 *
 * One runtime, three consumers — all of them reading the SAME dictionary:
 *   1. the React app (every page, volume, module and component),
 *   2. the static retrofit scripts (companion.js, site-header.js, bottom-nav.js),
 *   3. the standalone shim `public/assets/sp-i18n.js` included by the static
 *      module documents (prophecy-map.html, kings-of-the-bible.html,
 *      cross-references/viz.html, biblical-maps-atlas.html, singers.html, …).
 *
 * Nothing here calls a third-party API at runtime: translations are generated
 * at build time into `public/i18n/<lang>.json` and cached like any other
 * static asset (see scripts/build-i18n.mjs).
 */

/** Every language the site ships. Adding one is a single entry here + a
 *  generated dictionary file — no component changes. */
export type Lang = 'en' | 'ur' | 'hi' | 'ar';

export interface LangConfig {
  code: Lang;
  /** English name (used in docs / aria labels). */
  label: string;
  /** Name in its own script — this is what the toggle shows. */
  native: string;
  dir: 'ltr' | 'rtl';
  /** CSS font stack applied to the whole document while this language is active. */
  fontStack: string | null;
  /** Extra Google-Fonts families to fetch on demand (never loaded for English). */
  webfont?: string;
  /** Index into the `[ur, hi, ar]` translation tuples. English has none. */
  tuple?: 0 | 1 | 2;
  /** Localised digits, used only for numeric capture groups in patterns. */
  digits?: string;
}

export const LANGS: Record<Lang, LangConfig> = {
  en: {
    code: 'en', label: 'English', native: 'English', dir: 'ltr',
    fontStack: null,
  },
  ur: {
    code: 'ur', label: 'Urdu', native: '\u0627\u0631\u062F\u0648', dir: 'rtl',
    /* local woff2 (public/fonts) — declared by @font-face in global.css and
       injected by the standalone shim for the static documents. */
    fontStack: '"Noto Nastaliq Urdu", "Noto Naskh Arabic", "Jameel Noori Nastaleeq", "Segoe UI", serif',
    tuple: 0,
    digits: '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9',
  },
  hi: {
    code: 'hi', label: 'Hindi', native: '\u0939\u093F\u0928\u094D\u0926\u0940', dir: 'ltr',
    fontStack: '"Noto Sans Devanagari", "Nirmala UI", "Mangal", "Segoe UI", sans-serif',
    webfont: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
    tuple: 1,
    digits: '\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F',
  },
  ar: {
    code: 'ar', label: 'Arabic', native: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', dir: 'rtl',
    fontStack: '"Noto Naskh Arabic", "Traditional Arabic", "Segoe UI", serif',
    webfont: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
    tuple: 2,
    digits: '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669',
  },
};

export const LANG_ORDER: Lang[] = ['en', 'ur', 'hi', 'ar'];

/** A translation tuple: `[ur, hi, ar]`. English is the dictionary key itself. */
export type Tr = [string, string, string];

/**
 * A templated rule for strings that are generated rather than authored —
 * "Vol 12: Book of Revelation", "Browse 51 Volumes", "Last Updated: September
 * 6, 2026". These are why volumes added after the toggle was built still
 * translate: the rule matches any number and re-uses the captured title.
 */
export interface PatternRule {
  id: string;
  /** Regular expression source (serialised so the JSON dictionaries can carry it). */
  re: string;
  flags?: string;
  /** Template with `{1}`…`{n}` placeholders for the capture groups. */
  out: Tr;
  /** Group indexes that are pure numbers — their digits get localised. */
  numeric?: number[];
  /** Group indexes whose content should itself be looked up in the dictionary
   *  (e.g. a volume title inside "Vol 12: <title>"). */
  translate?: number[];
}

export interface DictionaryPayload {
  /** Bumped by scripts/build-i18n.mjs when the dictionary contents change. */
  v: number;
  lang: Lang;
  /** Normalised English source → translation for this language only. */
  dict: Record<string, string>;
  patterns: PatternRule[];
}

/** Everything the DOM translator needs, resolved for one language. */
export interface Translator {
  lang: Lang;
  tuple: 0 | 1 | 2;
  /** Normalised source → translation (exact match). */
  lookup: Map<string, string>;
  /** Lower-cased source → translation (tolerates casing drift in the DOM). */
  lower: Map<string, string>;
  patterns: { rule: PatternRule; re: RegExp; out: string }[];
}
