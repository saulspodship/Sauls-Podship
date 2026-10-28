/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The DOM translation engine.
 *
 * WHY THIS EXISTS
 * ---------------
 * The first language toggle translated a hand-picked selector list
 * (`header a, footer h4, main h1..h3`) against a ~90-entry dictionary with a
 * hard 500-element budget. Everything added afterwards — volumes 47-51, the
 * Companion module bar, the module iframes, page bodies, tables, FAQs — was
 * invisible to it, so switching to Urdu changed a handful of headings and left
 * the rest of the site in English.
 *
 * This engine has no selector list and no budget. It walks *every* text node
 * and every user-facing attribute in the document, in all same-origin module
 * iframes too, and re-walks whatever React or a retrofit script renders later.
 * Coverage is therefore a property of the dictionary, not of the markup: a new
 * page or volume is translated the moment its strings are in the dictionary,
 * and templated strings ("Vol 12: …", "Browse 51 Volumes") are covered by
 * pattern rules so new volumes need no dictionary edit at all.
 *
 * RULES IT OBEYS
 * --------------
 *   - `translate="no"`, `.notranslate`, `[data-sp-notranslate]` and
 *     `[data-sp-i18n-skip]` subtrees are never touched (the language toggle
 *     itself, Urdu podcast copy that is already Urdu, Hebrew/Greek scripture,
 *     the four-language Theological Archive cards).
 *   - `script`, `style`, `code`, `pre`, `textarea`, `noscript` are skipped.
 *   - Original text is kept on the node so switching back to English (or to
 *     another language) restores it exactly — React keeps ownership of its tree.
 *   - No network calls except the static `/i18n/<lang>.json` dictionary.
 */

import { LANGS, type DictionaryPayload, type Lang, type PatternRule, type Translator } from './types';
import { applyDocumentLang, getLang, onLangChange, wireLangSync } from './store';
import { applyLangFonts, clearLangFonts } from './fonts';
import { DICT_VERSION } from '../../data/i18n/version';

/* ------------------------------------------------------------------ *
 * Normalisation — the dictionary and the DOM must agree on one form.
 * ------------------------------------------------------------------ */

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&bull;': '\u2022', '&middot;': '\u00B7', '&mdash;': '\u2014', '&ndash;': '\u2013',
  '&hellip;': '\u2026', '&nbsp;': ' ', '&rarr;': '\u2192', '&larr;': '\u2190',
  '&times;': '\u00D7', '&rsquo;': '\u2019', '&lsquo;': '\u2018',
  '&ldquo;': '\u201C', '&rdquo;': '\u201D', '&apos;': "'",
};

export function decodeEntities(s: string): string {
  return s.indexOf('&') === -1 ? s : s.replace(/&[a-zA-Z#0-9]{2,8};/g, (m) => ENTITIES[m] ?? m);
}

/** Canonical form used for dictionary keys and lookups alike. */
export function normalize(s: string): string {
  return decodeEntities(s)
    .replace(/[\u2018\u2019\u02BC\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Leading/trailing decoration we keep verbatim around a translation. */
const EDGE = /^([\s:;.,!\-–—•·()\[\]"']*)(.*?)([\s:;.,!\-–—•·()\[\]"']*)$/;

export function splitEdges(s: string): { pre: string; core: string; post: string } {
  const m = EDGE.exec(s);
  if (!m) return { pre: '', core: s, post: '' };
  return { pre: m[1], core: m[2], post: m[3] };
}

const LETTER = /[A-Za-z\u00C0-\u024F]/;

/* ------------------------------------------------------------------ *
 * Dictionary loading
 * ------------------------------------------------------------------ */

const dictCache = new Map<Lang, DictionaryPayload | null>();
const dictInflight = new Map<Lang, Promise<DictionaryPayload | null>>();

/** Path of the generated static dictionary for a language. `DICT_VERSION`
 *  lives in src/data/i18n/version.ts and is bumped by scripts/build-i18n.mjs
 *  whenever the dictionary contents change, so a stale cached copy is dropped. */
export function dictUrl(lang: Lang): string {
  return `/i18n/${lang}.json?v=${DICT_VERSION}`;
}

export async function loadDictionary(lang: Lang): Promise<DictionaryPayload | null> {
  if (lang === 'en') return null;
  const hit = dictCache.get(lang);
  if (hit !== undefined) return hit;
  const running = dictInflight.get(lang);
  if (running) return running;

  const job = (async () => {
    try {
      const res = await fetch(dictUrl(lang), { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as DictionaryPayload;
      if (!data || typeof data.dict !== 'object') throw new Error('bad payload');
      dictCache.set(lang, data);
      return data;
    } catch (err) {
      /* A missing dictionary must never break the site: the language still
         switches (lang/dir/fonts) and the strings stay English. */
      console.warn(`[sp-i18n] no dictionary for "${lang}" — UI stays English.`, err);
      dictCache.set(lang, null);
      return null;
    } finally {
      dictInflight.delete(lang);
    }
  })();
  dictInflight.set(lang, job);
  return job;
}

/** Build the runtime lookup structures for a language. */
export function buildTranslator(lang: Lang, payload: DictionaryPayload | null): Translator | null {
  const cfg = LANGS[lang];
  if (!payload || cfg.tuple === undefined) return null;
  const lookup = new Map<string, string>();
  const lower = new Map<string, string>();
  for (const [k, v] of Object.entries(payload.dict)) {
    if (!v) continue;
    const nk = normalize(k);
    if (!nk) continue;
    if (!lookup.has(nk)) lookup.set(nk, v);
    const lk = nk.toLowerCase();
    if (!lower.has(lk)) lower.set(lk, v);
  }
  const patterns: Translator['patterns'] = [];
  for (const rule of payload.patterns || []) {
    const out = rule.out?.[cfg.tuple];
    if (!out) continue;
    try {
      patterns.push({ rule, re: new RegExp(rule.re, rule.flags || ''), out });
    } catch (err) {
      console.warn(`[sp-i18n] bad pattern "${rule.id}"`, err);
    }
  }
  return { lang, tuple: cfg.tuple, lookup, lower, patterns };
}

/** Localise the digits of a numeric capture group (۵۱ / ५१ / ٥١). */
function localizeDigits(value: string, lang: Lang): string {
  const digits = LANGS[lang].digits;
  if (!digits) return value;
  return value.replace(/[0-9]/g, (d) => digits[Number(d)]);
}

export interface TranslateOptions {
  /** Look up captured pattern groups in the dictionary too. */
  recursive?: boolean;
}

/**
 * Translate one string. Returns `null` when we have no translation — the
 * caller then leaves the source text untouched (never a partial guess).
 */
export function translateText(
  raw: string,
  t: Translator,
  opts: TranslateOptions = {}
): string | null {
  const { recursive = true } = opts;
  if (!raw) return null;
  const norm = normalize(raw);
  if (!norm || !LETTER.test(norm)) return null;

  /* 1. exact */
  let hit = t.lookup.get(norm);
  if (hit) return hit;

  /* 2. without surrounding punctuation ("Lineage:" → "Lineage" + ":") */
  const { pre, core, post } = splitEdges(norm);
  if (core && core !== norm) {
    hit = t.lookup.get(core);
    if (hit) return `${pre}${hit}${post}`;
  }

  /* 3. case-insensitive */
  hit = t.lower.get(norm.toLowerCase()) || (core ? t.lower.get(core.toLowerCase()) : undefined);
  if (hit) return core && core !== norm ? `${pre}${hit}${post}` : hit;

  /* 4. pattern rules — templated/generated strings */
  for (const p of t.patterns) {
    const m = p.re.exec(core || norm);
    if (!m) continue;
    let out = p.out;
    const numeric = p.rule.numeric || [];
    const translateGroups = p.rule.translate || [];
    for (let i = 1; i < m.length; i++) {
      let val = m[i] ?? '';
      if (numeric.includes(i)) val = localizeDigits(val, t.lang);
      else if (recursive && translateGroups.includes(i)) {
        const inner = translateText(val, t, { recursive: false });
        if (inner) val = inner;
      }
      out = out.split(`{${i}}`).join(val);
    }
    if (out !== p.out || /\{\d\}/.test(out) === false) return out;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * DOM walking
 * ------------------------------------------------------------------ */

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR',
  'CANVAS', 'AUDIO', 'VIDEO', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'TITLE', 'META', 'LINK',
]);

/** Attributes whose *value* is prose a visitor reads (tooltips, a11y names). */
const TEXT_ATTRS = ['title', 'aria-label', 'placeholder', 'alt', 'data-sp-label'] as const;

const ORIG = '__spI18nOrig';
const DONE = '__spI18nDone';

type TrackedText = Text & { [ORIG]?: string; [DONE]?: string };
type TrackedEl = Element & { [ORIG]?: Record<string, string> };

function isSkipped(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.hasAttribute('translate') && el.getAttribute('translate') === 'no') return true;
  if (el.hasAttribute('data-sp-notranslate') || el.hasAttribute('data-sp-i18n-skip')) return true;
  const cls = el.getAttribute('class');
  if (cls && /(^|\s)(notranslate|urdu|urdu-body|sp-boot)(\s|$)/.test(cls)) return true;
  return false;
}

/** Nodes inside a subtree that must stay in its source language. */
function inSkippedSubtree(node: Node): boolean {
  let p: Element | null = node.nodeType === 1 ? (node as Element) : node.parentElement;
  while (p) {
    if (isSkipped(p)) return true;
    p = p.parentElement;
  }
  return false;
}

export interface PassStats { scanned: number; translated: number; missing: number; truncated: boolean }

export const newStats = (): PassStats => ({ scanned: 0, translated: 0, missing: 0, truncated: false });

const missingSeen = new Set<string>();

/** Strings we could not translate — surfaced for the coverage report. */
export function missingStrings(): string[] {
  return [...missingSeen];
}
export function clearMissing(): void { missingSeen.clear(); }

const MAX_PER_PASS = 4000;

/**
 * One translation pass over a document.
 * Chunked so a 51-volume page never blocks the main thread for long.
 */
export function translateDocument(doc: Document, t: Translator | null, stats: PassStats = newStats()): PassStats {
  if (!doc.body) return stats;
  if (!t) { restoreDocument(doc); return stats; }

  const debug = isDebug();
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === 1) {
        const el = node as Element;
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
        if (isSkipped(el)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
      const v = node.nodeValue;
      if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Node | null = walker.nextNode();
  let count = 0;
  while (node && count < MAX_PER_PASS) {
    if (node.nodeType === 1) {
      translateAttributes(node as TrackedEl, t);
    } else {
      const text = node as TrackedText;
      stats.scanned++;
      const current = text.nodeValue || '';
      /* Already translated by us and untouched since → skip (this is what
         stops the MutationObserver from looping). */
      if (text[DONE] && text[DONE] === current) { node = walker.nextNode(); count++; continue; }
      const orig = text[ORIG] ?? current;
      const out = translateText(current, t);
      if (out !== null && out !== current) {
        const { pre, post } = splitEdges(orig);
        text[ORIG] = orig;
        /* keep the source's own leading/trailing whitespace so inline layout
           ("word <b>word</b> word") does not collapse */
        const lead = /^\s*/.exec(current)?.[0] ?? pre;
        const tail = /\s*$/.exec(current)?.[0] ?? post;
        text.nodeValue = `${lead}${out.replace(/^\s+|\s+$/g, '')}${tail}`;
        text[DONE] = text.nodeValue;
        stats.translated++;
        if (debug) (text.parentElement as HTMLElement | null)?.removeAttribute('data-sp-i18n-missing');
      } else if (out === null && LETTER.test(normalize(current))) {
        stats.missing++;
        const key = normalize(current);
        if (key.length < 200) {
          missingSeen.add(key);
          if (debug && text.parentElement) {
            (text.parentElement as HTMLElement).setAttribute('data-sp-i18n-missing', '1');
          }
        }
      }
    }
    node = walker.nextNode();
    count++;
  }
  /* A 51-volume page can exceed one chunk — the caller keeps going next frame
     so nothing on the page is left untranslated. */
  if (node) stats.truncated = true;
  return stats;
}

function translateAttributes(el: TrackedEl, t: Translator): void {
  let store = el[ORIG];
  for (const attr of TEXT_ATTRS) {
    const v = el.getAttribute(attr);
    if (!v || !LETTER.test(v)) continue;
    const out = translateText(v, t);
    if (out === null || out === v) continue;
    if (!store) { store = el[ORIG] = {}; }
    if (!(attr in store)) store[attr] = v;
    el.setAttribute(attr, out);
  }
}

/** Put a document back to its authored (English) text. */
export function restoreDocument(doc: Document): void {
  if (!doc.body) return;
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === 1 && SKIP_TAGS.has((node as Element).tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null = walker.nextNode();
  while (node) {
    if (node.nodeType === 1) {
      const el = node as TrackedEl;
      const store = el[ORIG];
      if (store) {
        for (const [attr, v] of Object.entries(store)) el.setAttribute(attr, v);
        delete el[ORIG];
      }
      if (isDebug()) el.removeAttribute?.('data-sp-i18n-missing');
    } else {
      const text = node as TrackedText;
      if (text[ORIG] !== undefined) {
        text.nodeValue = text[ORIG];
        delete text[ORIG];
        delete text[DONE];
      }
    }
    node = walker.nextNode();
  }
  doc.querySelectorAll('[data-sp-i18n-missing]').forEach((el) => el.removeAttribute('data-sp-i18n-missing'));
}

/* ------------------------------------------------------------------ *
 * Same-origin module frames (Prophecy Map, Interlinked Bible, codex…)
 * ------------------------------------------------------------------ */

const frameDocs = new WeakSet<Document>();

function eachFrameDoc(fn: (doc: Document) => void): void {
  document.querySelectorAll('iframe').forEach((f) => {
    let doc: Document | null = null;
    try { doc = f.contentDocument; } catch { return; /* cross-origin: leave it alone */ }
    if (!doc || !doc.body) return;
    fn(doc);
  });
}

/** Frames get their own observer the first time we see them. */
function adoptFrames(t: Translator | null): void {
  eachFrameDoc((doc) => {
    if (frameDocs.has(doc)) return;
    frameDocs.add(doc);
    try {
      const mo = new MutationObserver(() => schedule(doc));
      mo.observe(doc.documentElement || doc.body, { childList: true, subtree: true, characterData: true });
      frameObservers.set(doc, mo);
      frameObserverList.add(mo);
    } catch { /* document went away */ }
    void t;
  });
}

/** WeakMap so a discarded frame document can be collected; the parallel Set is
 *  only what lets us flush observer queues (WeakMap is not iterable). */
const frameObservers = new WeakMap<Document, MutationObserver>();
const frameObserverList = new Set<MutationObserver>();

/* ------------------------------------------------------------------ *
 * Scheduling
 * ------------------------------------------------------------------ */

let active: Translator | null = null;
let activeLang: Lang = 'en';
let scheduled = false;
let applying = false;
let rootObserver: MutationObserver | null = null;
const dirtyDocs = new Set<Document>();

function isDebug(): boolean {
  try {
    const on = localStorage.getItem('sp-i18n-debug') === '1' || /[?&]i18n-debug=1\b/.test(location.search);
    /* Drives the outline style in global.css so gaps are visible on the page. */
    document.documentElement.toggleAttribute('data-sp-i18n-debug', on);
    return on;
  } catch { return false; }
}

/** True once any pass has actually written a translation. While it is false
 *  and the site is in English, mutation callbacks are ignored entirely — an
 *  English visitor (the default, and every crawler reading a prerendered
 *  shell) must not pay for a document walk on every React render. */
let everTranslated = false;

function runPass(docs: Document[]): boolean {
  if (applying) return false;
  if (activeLang === 'en' && !everTranslated) {
    /* Nothing to undo: stamp lang/dir only (cheap, no walk). */
    for (const doc of docs) applyDocumentLang(doc, activeLang);
    return false;
  }
  applying = true;
  let truncated = false;
  try {
    for (const doc of docs) {
      if (activeLang === 'en' || !active) {
        restoreDocument(doc);
      } else {
        const stats = translateDocument(doc, active);
        truncated = truncated || stats.truncated;
        if (stats.translated) everTranslated = true;
      }
      applyDocumentLang(doc, activeLang);
      if (activeLang === 'en') clearLangFonts(doc); else applyLangFonts(doc, activeLang);
    }
  } finally {
    applying = false;
  }
  /* Our own edits above are now in the observer queues — drop them. */
  try { rootObserver?.takeRecords(); } catch { /* noop */ }
  frameObserverList.forEach((mo) => { try { mo.takeRecords(); } catch { /* noop */ } });
  /* The app rewrites <title> per route (usePageMetadata) — keep the tab in step. */
  if (docs.includes(document)) translateDocumentTitle();
  return truncated;
}

/** Pending follow-up passes. A Set (not an array) so a fired timer actually
 *  leaves the bookkeeping — an ever-growing list silently disabled the
 *  settle passes for the rest of the session. */
const settleTimers = new Set<number>();

function settle(delay: number, fn: () => void): void {
  /* Cap concurrency: a page that mutates constantly must not queue unbounded
     follow-up passes; the MutationObserver already covers further changes. */
  if (settleTimers.size >= 4) return;
  const id = window.setTimeout(() => {
    settleTimers.delete(id);
    try { fn(); } catch { /* document may be gone (SPA unmount) */ }
  }, delay);
  settleTimers.add(id);
}

function schedule(doc?: Document): void {
  if (doc) dirtyDocs.add(doc);
  if (scheduled) return;
  scheduled = true;
  const fire = () => {
    scheduled = false;
    const docs = dirtyDocs.size ? [...dirtyDocs] : [document];
    dirtyDocs.clear();
    const truncated = runPass(docs);
    /* Long page: finish the remaining nodes on the next frames. */
    if (truncated && activeLang !== 'en') settle(0, () => { runPass(docs); });
    /* Modules/iframes mount after the parent (lazy AutoFrame, companion.js
       injects its bar ~300 ms later) — settle with two follow-up passes. */
    settle(250, () => { adoptFrames(active); runPass(allDocs()); });
    settle(1200, () => { adoptFrames(active); runPass(allDocs()); });
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fire);
  else window.setTimeout(fire, 16);
}

function allDocs(): Document[] {
  const docs: Document[] = [document];
  eachFrameDoc((d) => docs.push(d));
  return docs;
}

/** What we last wrote into <title>, so a route change is not mistaken for ours. */
let lastTitleWritten = '';

/**
 * Keep the browser tab's title in the active language.
 *
 * The app rewrites `document.title` on every route change (usePageMetadata),
 * so this must be re-run after each pass — and it must be able to tell "the app
 * just set a new English title" apart from "this is the title I translated".
 */
function translateDocumentTitle(): void {
  const el = document.querySelector('title');
  if (!el) return;
  const current = el.textContent || '';

  if (activeLang === 'en' || !active) {
    /* Nothing to restore: the app owns the English title. */
    lastTitleWritten = '';
    return;
  }
  if (current === lastTitleWritten) return; // already ours

  const out = translateText(current, active);
  if (!out) return;
  lastTitleWritten = out;
  el.textContent = out;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Start (or re-point) the site-wide translator. Call once from the app. */
export async function startI18n(): Promise<void> {
  wireLangSync();
  await setLanguage(getLang());

  if (!rootObserver) {
    rootObserver = new MutationObserver((records) => {
      if (applying) { try { rootObserver?.takeRecords(); } catch { /* noop */ } return; }
      /* English + nothing ever translated → zero work per mutation. This is
         the path every default visitor and every crawler takes. */
      if (activeLang === 'en' && !everTranslated) return;
      /* Ignore mutations that are only our own text writes. */
      const mine = records.every((r) => {
        if (r.type === 'characterData') {
          const n = r.target as TrackedText;
          return !!n[DONE] && n[DONE] === n.nodeValue;
        }
        return false;
      });
      if (mine) return;
      schedule(document);
    });
    rootObserver.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  onLangChange((lang) => { void setLanguage(lang); });
  /* Frame → app language changes are handled once, inside wireLangSync():
     a second listener here would double-apply every switch. */
  window.addEventListener('load', () => schedule(document));
}

export async function setLanguage(lang: Lang): Promise<void> {
  activeLang = lang;
  if (lang === 'en') {
    active = null;
    clearMissing();
    runPass(allDocs());
    translateDocumentTitle();
    return;
  }
  const payload = await loadDictionary(lang);
  /* The visitor may have switched again while we were fetching. */
  if (activeLang !== lang) return;
  active = buildTranslator(lang, payload);
  adoptFrames(active);
  runPass(allDocs());
  translateDocumentTitle();
  if (isDebug()) {
    console.info(`[sp-i18n] ${lang}: ${active?.lookup.size ?? 0} dictionary entries, ${active?.patterns.length ?? 0} patterns`);
  }
}

/** Current translator (for `t()` in components). */
export function getTranslator(): Translator | null { return active; }
export function getActiveLang(): Lang { return activeLang; }

/** Translate a single string from JS (labels built at runtime, alerts…). */
export function t(source: string, fallback?: string): string {
  if (activeLang === 'en' || !active) return fallback ?? source;
  return translateText(source, active) ?? fallback ?? source;
}

/** Force a re-scan (after a heavy lazy mount, an iframe load, a retrofit script). */
export function rescan(): void { schedule(document); }

/** Coverage report for `?i18n-debug` / localStorage['sp-i18n-debug']='1'. */
export function report(): { lang: Lang; entries: number; missing: string[] } {
  return { lang: activeLang, entries: active?.lookup.size ?? 0, missing: missingStrings().sort() };
}
