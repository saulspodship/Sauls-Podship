/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { useI18n } from '../lib/i18n/react';
import { LANGS } from '../lib/i18n/types';

/**
 * ChromeControls — site-wide language (EN / اردو / हिन्दी / العربية) +
 * dark/light toggle, mounted in the header.
 *
 * This component no longer owns any translation logic. It is a thin selector
 * over the shared i18n runtime (`src/lib/i18n`), which translates the WHOLE
 * site — every page, volume, module, iframe and retrofit-script string — from
 * one dictionary. Keeping the toggle dumb is what stops the old failure mode:
 * previously the dictionary lived here, so anything added to the site after
 * this file was written (volumes 47-51, the Companion bar, the module frames)
 * silently stayed English.
 *
 * The wrapper carries `data-sp-i18n-skip` so the language names themselves are
 * never translated — a visitor picking "اردو" must be able to find "اردو".
 */

export const ChromeControls: React.FC = () => {
  const { lang, setLang, options } = useI18n();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('sp-theme') as 'light' | 'dark') || 'light'; } catch { return 'light'; }
  });
  const mounted = useRef(false);

  // theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('sp-theme', theme); } catch { /* storage blocked */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#16060F' : '#F8F4E3');
  }, [theme]);

  // reveal animations still need a nudge after route/DOM changes
  useEffect(() => {
    mounted.current = true;
    scanReveal();
    const mo = new MutationObserver(() => scanReveal());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => { if (mounted.current) scanReveal(); }, [lang]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" data-sp-i18n-skip>
      <label className="relative flex items-center">
        <Globe className="w-4 h-4 text-[#D4AF37] absolute start-2 sm:start-2.5 pointer-events-none" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as typeof lang)}
          aria-label="Website language"
          title={`Website language — ${LANGS[lang].label}`}
          className="appearance-none h-10 max-w-[104px] sm:max-w-none bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-bold rounded-xl ps-7 pe-5 sm:ps-8 sm:pe-6 lg:ps-7 lg:pe-5 xl:ps-8 xl:pe-6 cursor-pointer border border-[#D4AF37]/25 transition-colors focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.code} value={o.code} className="text-black" lang={o.code} dir={o.dir}>
              {o.native}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute end-2 text-[#D4AF37] text-[9px]">▾</span>
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
