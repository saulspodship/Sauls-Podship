/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Language store — the single source of truth for "which language is the site
 * in?". Framework-agnostic on purpose so the React app, the static retrofit
 * scripts and the standalone shim all agree.
 *
 * Responsibilities:
 *   - persist the choice in localStorage (`sp-lang`, the key the site has
 *     always used, so existing visitors keep their preference),
 *   - stamp `lang` / `dir` / `data-lang` on every document we can reach
 *     (the app document *and* same-origin module iframes),
 *   - notify subscribers in this document (`sp-lang-change`),
 *   - notify other frames (postMessage) and other tabs (`storage` event).
 */

import { LANGS, LANG_ORDER, type Lang } from './types';

export const LANG_KEY = 'sp-lang';
export const LANG_EVENT = 'sp-lang-change';

/** Message shape exchanged between the app and the static module frames. */
export interface LangMessage { sp: 'lang'; lang: Lang }

export const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && (LANG_ORDER as string[]).includes(v);

export function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (isLang(v)) return v;
  } catch { /* private mode / blocked storage */ }
  /* A first-time visitor whose browser speaks Urdu lands in Urdu: the audience
     is overwhelmingly Pakistani, and the toggle is one click away. */
  try {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('ur')) return 'ur';
  } catch { /* no navigator (SSR guard) */ }
  return 'en';
}

let current: Lang | null = null;

export function getLang(): Lang {
  if (current) return current;
  current = readStoredLang();
  return current;
}

type Listener = (lang: Lang) => void;
const listeners = new Set<Listener>();

export function onLangChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Stamp lang/dir/data-lang on a document (app document or an iframe's). */
export function applyDocumentLang(doc: Document, lang: Lang): void {
  const cfg = LANGS[lang];
  const root = doc.documentElement;
  if (!root) return;
  if (root.lang !== lang) root.lang = lang;
  if (root.dir !== cfg.dir) root.dir = cfg.dir;
  if (root.getAttribute('data-lang') !== lang) root.setAttribute('data-lang', lang);
}

/** Push the language into every same-origin frame we own. */
export function broadcastToFrames(lang: Lang, win: Window = window): void {
  const msg: LangMessage = { sp: 'lang', lang };
  win.document.querySelectorAll('iframe').forEach((f) => {
    try { f.contentWindow?.postMessage(msg, win.location.origin); } catch { /* cross-origin */ }
  });
}

/**
 * Switch language. Safe to call from anywhere (React toggle, a static page's
 * own selector, another browser tab).
 */
export function setLang(lang: Lang, opts: { persist?: boolean; broadcast?: boolean } = {}): void {
  if (!isLang(lang)) return;
  const { persist = true, broadcast = true } = opts;
  const changed = current !== lang;
  current = lang;
  if (persist) {
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
  }
  applyDocumentLang(document, lang);
  if (broadcast) {
    broadcastToFrames(lang);
    /* Frames we mount later must inherit the language too. */
    window.setTimeout(() => broadcastToFrames(lang), 400);
    window.setTimeout(() => broadcastToFrames(lang), 1500);
  }
  listeners.forEach((fn) => { try { fn(lang); } catch { /* a bad listener must not break the toggle */ } });
  try {
    window.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: lang }));
    document.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: lang }));
  } catch { /* CustomEvent unavailable */ }
  if (changed) {
    try {
      /* Same-origin sibling tabs / the static module pages opened in a tab. */
      window.dispatchEvent(new StorageEvent('storage', { key: LANG_KEY, newValue: lang }));
    } catch { /* ignore */ }
  }
}

/** Wire the cross-frame + cross-tab listeners. Idempotent. */
let wired = false;
export function wireLangSync(): void {
  if (wired || typeof window === 'undefined') return;
  wired = true;

  window.addEventListener('message', (e: MessageEvent) => {
    if (e.origin && e.origin !== window.location.origin) return;
    const d = e.data as LangMessage | null;
    if (!d || d.sp !== 'lang' || !isLang(d.lang)) return;
    if (d.lang === getLang()) return;
    /* A frame (or the app) changed the language: adopt it without re-broadcasting
       back at the sender, which would ping-pong. */
    setLang(d.lang, { persist: true, broadcast: false });
  });

  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== LANG_KEY || !isLang(e.newValue)) return;
    if (e.newValue === getLang()) return;
    setLang(e.newValue, { persist: false, broadcast: true });
  });

  applyDocumentLang(document, getLang());
}
