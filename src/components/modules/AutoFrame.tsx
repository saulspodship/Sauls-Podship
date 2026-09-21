/**
 * AutoFrame — borderless, auto-height iframe.
 * The embedded document flows with the host page: no boxed "window",
 * no inner scrollbar. The frame grows to its content's height and the
 * page scrolls as one.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { useSiteLang } from '../../i18n/LanguageProvider';

interface Props {
  src: string;
  title: string;
  initial?: string;
  min?: number;
  className?: string;
}

const AutoFrame: React.FC<Props> = ({ src, title, initial = '76vh', min = 560, className = '' }) => {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const { lang } = useSiteLang();

  // Tell the embedded module which site language is active. The static
  // modules (prophecy map, interlinked Bible, kings) read ?lang= at boot and
  // also listen for the postMessage below, so switching languages is live.
  useEffect(() => {
    try {
      ref.current?.contentWindow?.postMessage({ sp: 'lang', lang }, '*');
    } catch { /* frame not ready yet */ }
  }, [lang]);

  // ?lang=xx rides along on the frame URL (before any #hash).
  const srcWithLang = useMemo(() => {
    if (lang === 'en') return src;
    const hash = src.indexOf('#');
    const base = hash === -1 ? src : src.slice(0, hash);
    const tail = hash === -1 ? '' : src.slice(hash);
    return `${base}${base.includes('?') ? '&' : '?'}lang=${lang}${tail}`;
  }, [src, lang]);

  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    const fit = () => {
      try {
        const d = f.contentDocument;
        if (!d || !d.body) return;
        // Stabilize vh-sized sections (e.g. the xref horseshoe's 74vh) so the
        // inner height is constant and the frame converges in one step.
        if (!d.getElementById('sp-frame-fit')) {
          const st = d.createElement('style');
          st.id = 'sp-frame-fit';
          st.textContent = '@media (min-width:768px){#viz{height:880px !important;min-height:520px !important}}';
          d.head.appendChild(st);
        }
        const h = Math.max(d.documentElement.scrollHeight, d.body.scrollHeight);
        if (h > 120 && Math.abs(h - f.clientHeight) > 2) f.style.height = h + 'px';
      } catch {
        /* cross-origin guard */
      }
    };
    fit();
    f.addEventListener('load', fit);
    const iv = window.setInterval(fit, 700);
    let ro: ResizeObserver | null = null;
    try {
      const d = f.contentDocument;
      if (d && d.body && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(fit);
        ro.observe(d.body);
      }
    } catch {
      /* cross-origin guard */
    }
    // "Skip module ↓" inside the frame: scroll the host page just past the iframe
    const onMsg = (e: MessageEvent) => {
      if (e.source !== f.contentWindow || !e.data || e.data.sp !== 'skip-module') return;
      const bottom = f.getBoundingClientRect().bottom + window.scrollY - 56;
      window.scrollTo({ top: bottom, behavior: 'smooth' });
    };
    window.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('message', onMsg);
      f.removeEventListener('load', fit);
      window.clearInterval(iv);
      ro?.disconnect();
    };
  }, [srcWithLang]);

  return (
    <iframe
      ref={ref}
      src={srcWithLang}
      title={title}
      loading="lazy"
      className={`w-full border-0 block bg-transparent ${className}`}
      style={{ height: initial, minHeight: min }}
    />
  );
};

export default AutoFrame;
