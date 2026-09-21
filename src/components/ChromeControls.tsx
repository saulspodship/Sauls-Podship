/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { useSiteLang, applyLangToDom } from '../i18n/LanguageProvider';
import { LANG_OPTIONS } from '../i18n/dict';

/**
 * ChromeControls — site-wide language (EN / اردو / हिन्दी / العربية) +
 * dark/light toggle, mounted in the header.
 *
 * The language lives in the global LanguageProvider (one source of truth for
 * the whole website). Translation itself is dictionary-driven over stable UI
 * strings applied at the DOM layer, so it follows route changes, lazily
 * loaded pages and React re-renders alike: this component owns the observers
 * that keep the DOM layer in sync with the selected language.
 */

export const ChromeControls: React.FC = () => {
  const { lang, setLang } = useSiteLang();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('sp-theme') as any) || 'light');
  const booted = useRef(false);

  // apply / restore the DOM translation layer whenever the language changes
  useEffect(() => {
    applyLangToDom(lang);
    if (!booted.current) return;
    // re-apply after route transitions
    const t = setTimeout(() => applyLangToDom(lang), 120);
    return () => clearTimeout(t);
  }, [lang]);

  // theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sp-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#16060F' : '#F8F4E3');
  }, [theme]);

  // translation + reveal on route changes / lazy content
  useEffect(() => {
    booted.current = true;
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (lang !== 'en') {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => applyLangToDom(lang));
      }
      scanReveal();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scanReveal();
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" data-sp-i18n-skip>
      <label className="relative flex items-center">
        <Globe className="w-4 h-4 text-[#D4AF37] absolute left-2 sm:left-2.5 pointer-events-none" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as typeof lang)}
          aria-label="Website language"
          className="appearance-none h-10 max-w-[104px] sm:max-w-none bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-bold rounded-xl pl-7 pr-5 sm:pl-8 sm:pr-6 lg:pl-7 lg:pr-5 xl:pl-8 xl:pr-6 cursor-pointer border border-[#D4AF37]/25 transition-colors focus:outline-none"
        >
          {LANG_OPTIONS.map((o) => <option key={o.code} value={o.code} className="text-black">{o.label}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2 text-[#D4AF37] text-[9px]">▾</span>
      </label>
      <button
        onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#E8C96A] border border-[#D4AF37]/25 transition-all"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ---------- scroll-reveal ----------
let io: IntersectionObserver | null = null;
export function scanReveal() {
  if (!('IntersectionObserver' in window)) return;
  // Phones / tablets: never gate content behind the observer. On mobile the
  // Prophecy Map & Interlinked Bible pillar cards were stuck at opacity:0
  // whenever the observer did not fire (tall single-column grid, -8% margin).
  if (window.matchMedia('(max-width: 1023.98px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const sibs = Array.from(el.parentElement?.children || []);
          const i = Math.max(0, sibs.indexOf(el));
          el.style.animationDelay = `${Math.min(i, 8) * 70}ms`;
          el.classList.add('sp-shown');
          io?.unobserve(el);
        }
      }
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0.01 });
  }
  // Safety net: anything still hidden 1.5s after arming is revealed regardless.
  window.setTimeout(() => {
    document.querySelectorAll('.sp-armed:not(.sp-shown)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.5) el.classList.add('sp-shown');
    });
  }, 1500);
  document.querySelectorAll('main section > div > h2, section .grid > div, section .grid > a, #videos .v-card, .hero-scrim > .pill, .hero-scrim h1').forEach((el) => {
    if ((el as HTMLElement).dataset.spReveal) return;
    (el as HTMLElement).dataset.spReveal = '1';
    (el as HTMLElement).classList.add('sp-armed');
    io?.observe(el);
  });
}

export default ChromeControls;
