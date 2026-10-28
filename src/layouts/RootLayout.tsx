/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigationType, ScrollRestoration } from 'react-router-dom';
import { BookOpen, Mic, Music, Compass, Info, ShieldCheck, Heart, Menu, X, Search, ChevronRight, ChevronDown, ExternalLink, Globe, Award, Sparkles, Mail, Play, Video, MapPin, Network, Crown, Scale, HelpCircle, Map, Globe2, Music2, GraduationCap, Languages, Megaphone, Calculator, Users } from 'lucide-react';
// Floating AI assistant pulls in framer-motion + the full catalogue — load it
// after first paint instead of inside the critical bundle.
const ScholarAssistant = lazy(() => import('../../components/ScholarAssistant'));
import { SITE } from '../config/site';
import ChromeControls from '../components/ChromeControls';
import BottomNav from '../components/BottomNav';
import AscensionSplash from '../components/AscensionSplash';
import FAQBlock from '../components/FAQBlock';
import { PODSHIP_APPS } from '../data/about';


/* ── Header navigation ─────────────────────────────────────────────────
   Every destination on the site is reachable from the header: a top-level
   item is either a direct link or a dropdown group. The study modules
   (Prophecy Map, Interlinked Bible, Kings of the Bible, Comparative
   Apologetics, Theological Archive, Biblical Maps Atlas) used to exist only
   in the mobile "More" sheet — they now have a desktop dropdown too.      */
type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;
type NavLeaf = { name: string; href: string; icon: IconType; isExternal?: boolean; isStatic?: boolean };
type NavGroup = { name: string; icon: IconType; group: NavLeaf[] };
type NavItem = NavLeaf | NavGroup;
const APP_NAV_ICONS: Record<string, IconType> = {
  'biblical-languages': Languages,
  'sunday-school': GraduationCap,
  evangelism: Megaphone,
  'biblical-cosmos-3d': Globe2,
  'biblical-numerology-etymology': Calculator,
  'faithconnect-pro': Users,
};
const isNavGroup = (item: NavItem): item is NavGroup => Array.isArray((item as NavGroup).group);

/** A leaf is "on" when the current path is it, or sits underneath it. */
const leafActive = (leaf: NavLeaf, pathname: string) =>
  pathname === leaf.href ||
  (!leaf.isExternal && !leaf.isStatic && leaf.href !== '/' && pathname.startsWith(leaf.href));

const NAV_ITEMS: NavItem[] = [
  { name: 'Encyclopedia', href: '/encyclopedia', icon: BookOpen },
  {
    name: 'Study Tools',
    icon: Compass,
    group: [
      { name: 'Prophecy Map', href: '/prophecy-map', icon: Globe2 },
      { name: 'Interlinked Bible', href: '/cross-references', icon: Network },
      { name: 'Kings of the Bible', href: '/kings-of-the-bible', icon: Crown },
      { name: 'Comparative Apologetics', href: '/comparative-apologetics', icon: Scale },
      { name: 'Theological Archive', href: '/theological-archive', icon: HelpCircle },
      { name: 'Biblical Maps Atlas', href: '/encyclopedia/biblical-maps-atlas.html', icon: Map, isStatic: true },
      ...PODSHIP_APPS.map((app) => ({
        name: app.name, href: app.url, icon: APP_NAV_ICONS[app.id] || BookOpen, isExternal: true,
      })),
    ],
  },
  {
    name: 'Watch & Listen',
    icon: Play,
    group: [
      { name: 'Podcast', href: '/podcast', icon: Mic },
      { name: 'Videos', href: '/videos/', icon: Video, isStatic: true },
      { name: 'Sacred Music', href: '/music', icon: Music },
      { name: 'Punjabi Zaboor', href: '/music/punjabi-zaboor', icon: Music2 },
      { name: 'Singers Archive', href: '/music/pakistani-singers-archive', icon: Mic },
    ],
  },
  { name: 'Scriptorium Studio', href: '/studio', icon: Sparkles },
  {
    name: 'Ministry',
    icon: Info,
    group: [
      { name: 'About', href: '/about', icon: Info },
      { name: 'Standards', href: '/scholarly-standards', icon: ShieldCheck },
      { name: 'Support & Mission', href: '/support', icon: Heart },
      { name: 'FAQ', href: '/faq', icon: HelpCircle },
      { name: 'Contact', href: '/contact', icon: Mail },
    ],
  },
  { name: 'Support', href: SITE.patreon, icon: Heart, isExternal: true },
];


/**
 * Desktop dropdown. Opens on hover (with a grace period so the pointer can
 * travel into the panel) and on click/keyboard; closes on Escape, on an
 * outside click and on every route change.
 *
 * The panel stays in the DOM while closed (visibility:hidden, so its links
 * leave the tab order) — that keeps ChromeControls' language dictionary able
 * to translate the labels, and gives a fade instead of a hard pop.
 */
const NavDropdown: React.FC<{ item: NavGroup; pathname: string }> = ({ item, pathname }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const clearHover = () => {
    if (hoverTimer.current !== null) { window.clearTimeout(hoverTimer.current); hoverTimer.current = null; }
  };
  const openMenu = () => { clearHover(); setOpen(true); };
  const closeMenu = (delay = 0) => { clearHover(); hoverTimer.current = window.setTimeout(() => setOpen(false), delay); };

  useEffect(() => { setOpen(false); clearHover(); }, [pathname]);
  useEffect(() => () => clearHover(), []);
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Icon = item.icon;
  const active = item.group.some((c) => leafActive(c, pathname));

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={() => closeMenu(140)}
    >
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-1.5 xl:px-2.5 2xl:px-3 text-[13px] xl:text-sm font-semibold leading-none transition-all ${
          active || open
            ? 'bg-[#4A152C] text-[#E8C96A] border-[#D4AF37]/40 shadow-inner'
            : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent'
        }`}
      >
        <Icon className="hidden 2xl:block w-4 h-4 opacity-80" />
        <span>{item.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 top-full z-[60] w-[min(80vw,290px)] pt-2.5 transition-all duration-150 ${
          open ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain rounded-2xl border border-[#D4AF37]/30 bg-[#1A0812]/97 p-2 text-left shadow-2xl backdrop-blur-xl">
          {item.group.map((c) => {
            const CIcon = c.icon;
            const on = leafActive(c, pathname);
            const cls = `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
              on ? 'bg-[#4A152C] text-[#E8C96A]' : 'text-white/85 hover:bg-white/10 hover:text-white'
            }`;
            if (c.isExternal) {
              return (
                <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  <CIcon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="min-w-0 flex-1">{c.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
                </a>
              );
            }
            if (c.isStatic) {
              return (
                <a key={c.name} href={c.href} className={cls}>
                  <CIcon className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                  <span className="min-w-0 flex-1">{c.name}</span>
                </a>
              );
            }
            return (
              <Link key={c.name} to={c.href} className={cls}>
                <CIcon className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                <span className="min-w-0 flex-1">{c.name}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// Chrome/Edge fire beforeinstallprompt when the PWA criteria (manifest +
// service worker + HTTPS) are met — surface an explicit Install button.
const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const w = window as any;
    if (w.__spInstallEvt) setDeferred(w.__spInstallEvt);
    if (w.__spInstalled) setInstalled(true);
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('sp-install-ready', () => setDeferred(w.__spInstallEvt));
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  if (installed) {
    return (
      <p className="text-[11px] text-[#E8C96A]/80 tracking-wide">
        ✓ Saul’s Podship App installed — open it from your home screen any time.
      </p>
    );
  }
  let standalone = false;
  try { standalone = window.matchMedia('(display-mode: standalone)').matches || !!(navigator as any).standalone; } catch (_) {}
  if (standalone) return null; // already running as the installed app
  const isIos = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);
  if (!deferred) {
    return (
      <button
        type="button"
        onClick={() => alert(isIos
          ? 'Tap the Share button in Safari, then choose “Add to Home Screen”.'
          : 'Open the Chrome menu (⋮ at the top right) and tap “Install app” or “Add to Home screen”.')}
        className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37] px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-[#1A0812] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#E8C96A]"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
        </svg>
        Install the Saul's Podship App
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={async () => {
        deferred.prompt();
        try { await deferred.userChoice; } catch (_) {}
        setDeferred(null);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37] px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-[#1A0812] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#E8C96A]"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
      </svg>
      Install the Saul's Podship App
    </button>
  );
};


// Mobile install banner — a dismissible strip above the bottom nav that
// surfaces Chrome's native install prompt (or the iOS Share instructions).
const InstallBanner: React.FC = () => {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  useEffect(() => {
    const w = window as any;
    try {
      if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone || w.__spInstalled) return;
      const snooze = Number(localStorage.getItem('sp-install-snooze') || 0);
      if (snooze && Date.now() - snooze < 3 * 864e5) return;
    } catch (_) {}
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && !w.MSStream;
    setIsIos(ios);
    // event may already have fired before React mounted (captured in index.html)
    if (w.__spInstallEvt) setDeferred(w.__spInstallEvt);
    const onReady = () => setDeferred(w.__spInstallEvt);
    const onPrompt = (e: Event) => { e.preventDefault(); w.__spInstallEvt = e; setDeferred(e); };
    window.addEventListener('sp-install-ready', onReady);
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener);
    const onInstalled = () => setShow(false);
    window.addEventListener('appinstalled', onInstalled);
    // show on every phone/tablet after a short beat — with the native prompt
    // when Chrome offers it, otherwise with clear manual instructions
    const t = window.setTimeout(() => setShow(true), 2500);
    return () => { window.removeEventListener('sp-install-ready', onReady); window.removeEventListener('beforeinstallprompt', onPrompt as EventListener); window.removeEventListener('appinstalled', onInstalled); window.clearTimeout(t); };
  }, []);
  if (!show) return null;
  const dismiss = () => { setShow(false); try { localStorage.setItem('sp-install-snooze', String(Date.now())); } catch (_) {} };
  const install = async () => {
    if (deferred) {
      deferred.prompt();
      try { const r = await deferred.userChoice; if (r && r.outcome === 'accepted') setShow(false); } catch (_) {}
      (window as any).__spInstallEvt = null; setDeferred(null);
    } else {
      alert(isIos
        ? 'Tap the Share button in Safari, then choose “Add to Home Screen”.'
        : 'Open the Chrome menu (⋮ at the top right) and tap “Install app” or “Add to Home screen”.');
    }
  };
  return (
    <div className="lg:hidden fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[380] rounded-2xl border border-[#D4AF37]/50 bg-[#1A0812]/97 backdrop-blur-xl text-white shadow-2xl p-3 flex items-center gap-3">
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight">Install the Saul’s Podship App</p>
        <p className="text-[11px] text-white/65 leading-snug truncate">{deferred ? 'Faster, full-screen, works offline.' : isIos ? 'Share → “Add to Home Screen”.' : 'Menu ⋮ → “Install app”.'}</p>
      </div>
      <button type="button" onClick={install}
        className="shrink-0 rounded-full bg-[#D4AF37] px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-[#1A0812]">{deferred ? 'Install' : 'How'}</button>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/10 text-white/80"><X className="w-4 h-4" /></button>
    </div>
  );
};


// Author seal — formerly rendered at the end of every volume body, now a
// single global card at the foot of EVERY page (in the shared footer).
const AuthorSeal: React.FC = () => (
  <section className="mt-10 pt-10 border-t border-white/10 w-full flex justify-center">
    <div className="max-w-xl w-full p-6 rounded-3xl bg-gradient-to-br from-[#24101C] to-[#16060F] border-2 border-[#D4AF37]/40 shadow-xl relative overflow-hidden text-center">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <img
          src="/images/solat.png"
          alt="Solat Nadeem"
          width={72}
          height={72}
          loading="lazy"
          className="w-[72px] h-[72px] rounded-full object-cover ring-2 ring-[#D4AF37]/70 shadow-lg bg-white"
        />
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#E8C96A] bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Founder &amp; Exegete
          </span>
          <h3 className="font-serif text-lg font-bold text-white">Solat Nadeem</h3>
          <p className="text-[11px] text-white/70 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            Sahiwal, Punjab, Pakistan &bull; Saul's Podship Scriptorium
          </p>
        </div>
        <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light max-w-md mx-auto">
          Dedicated to equipping the global Church with historically grounded, theologically
          rigorous, and visually rich biblical scholarship.
        </p>
      </div>
    </div>
  </section>
);


export const RootLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navType = useNavigationType();

  // Marks the document as "React has painted". The static retrofit scripts
  // (public/assets/seo-aeo.js, companion.js) and the boot curtain in index.html
  // wait for this instead of guessing from `#root.children.length` — which is
  // non-zero the instant the crawler-facing pre-render shell is parsed.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-sp-app', 'ready');
  }, []);

  // Every route change starts at the top of the new page, instantly.
  // (ScrollRestoration alone raced with lazy pages + smooth scrolling, so the
  // new page kept the previous page's offset and landed on FAQ / Companion blocks.)
  useEffect(() => {
    if (location.hash || navType === 'POP') return; // anchors + back/forward keep their own position
    const root = document.documentElement; const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    let userMoved = false;
    const onUser = () => { userMoved = true; };
    window.addEventListener('wheel', onUser, { passive: true }); window.addEventListener('touchstart', onUser, { passive: true }); window.addEventListener('keydown', onUser);
    const top = () => { if (!userMoved) window.scrollTo(0, 0); };
    top();
    // lazy pages + iframes (Prophecy Map, Interlinked Bible) grow after mount; re-pin until settled
    const ids = [40, 160, 400, 900].map(ms => window.setTimeout(top, ms));
    const done = window.setTimeout(() => { root.style.scrollBehavior = prev; }, 950);
    return () => { ids.forEach(clearTimeout); clearTimeout(done); root.style.scrollBehavior = prev; window.removeEventListener('wheel', onUser); window.removeEventListener('touchstart', onUser); window.removeEventListener('keydown', onUser); };
  }, [location.pathname, location.search, navType]);


  const drawerLeaf = (leaf: NavLeaf) => {
    const Icon = leaf.icon;
    const on = leafActive(leaf, location.pathname);
    const cls = `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${
      on ? 'bg-[#4A152C] text-[#E8C96A] border border-[#D4AF37]/30' : 'text-white/90 hover:bg-white/10'
    }`;
    const body = (
      <>
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${leaf.isExternal ? 'text-rose-400' : 'text-[#D4AF37]'}`} />
          <span>{leaf.name}{/patreon/i.test(leaf.href) ? ' (Patreon)' : ''}</span>
        </div>
        {leaf.isExternal ? <ExternalLink className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
      </>
    );
    const key = leaf.href;
    if (leaf.isExternal) {
      return (
        <a key={key} href={leaf.href} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className={cls}>
          {body}
        </a>
      );
    }
    if (leaf.isStatic) {
      return (
        <a key={key} href={leaf.href} onClick={() => setMobileMenuOpen(false)} className={cls}>
          {body}
        </a>
      );
    }
    return (
      <Link key={key} to={leaf.href} onClick={() => setMobileMenuOpen(false)} className={cls}>
        {body}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1D2D50] font-sans antialiased selection:bg-[#4A152C] selection:text-[#E8C96A] pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Site-wide splash: plays on every open of the site/app (any link),
          then unmounts. GSAP ascension — Jesus rises, declares, ascends. */}
      <AscensionSplash />

      {/* key by path: full page loads all share key "default", which made a new page inherit the previous page's offset */}
      <ScrollRestoration getKey={(loc) => loc.pathname} />

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#16060f]/70 backdrop-blur-md border-b border-[#D4AF37]/20 text-white transition-all shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-6 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-3 lg:gap-4">
          {/* Brand Logo with Correct SVG */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink lg:shrink-0 lg:gap-2">
            <img src="/icons/emblem.png" alt="Saul's Podship Logo" className="h-10 w-10 sm:h-14 sm:w-14 lg:h-11 lg:w-11 xl:h-14 xl:w-14 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform" />
            <div className="flex flex-col text-left min-w-0">
              <span className="font-serif font-bold text-[15px] sm:text-xl lg:text-lg xl:text-xl tracking-tight text-white group-hover:text-[#E8C96A] transition-colors whitespace-nowrap truncate">
                Saul's Podship
              </span>
              <span className="text-[8px] sm:text-[10px] uppercase font-semibold tracking-[0.14em] sm:tracking-[0.18em] text-[#D4AF37]/90 whitespace-nowrap truncate">
                Theological Encyclopedia
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex flex-1 min-w-0 flex-nowrap items-center justify-end gap-0.5 xl:gap-1 ml-auto sp-desktop-nav">
            {NAV_ITEMS.map((item) => {
              if (isNavGroup(item)) return <NavDropdown key={item.name} item={item} pathname={location.pathname} />;
              const Icon = item.icon;
              if (item.isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 2xl:px-3 text-[13px] xl:text-sm font-semibold leading-none text-white/80 hover:text-[#E8C96A] hover:bg-white/10 transition-all group"
                    title="Partner on Patreon"
                  >
                    <Icon className="hidden 2xl:block w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>{item.name}</span>
                    <ExternalLink className="hidden 2xl:block w-3 h-3 opacity-60" />
                  </a>
                );
              }
              if (item.isStatic) {
                // a real file under public/ — must NOT go through the hash router
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 2xl:px-3 text-[13px] xl:text-sm font-semibold leading-none text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Icon className="hidden 2xl:block w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </a>
                );
              }
              const isActive = leafActive(item, location.pathname);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 xl:px-2.5 2xl:px-3 text-[13px] xl:text-sm font-semibold leading-none transition-all ${
                    isActive
                      ? 'bg-[#4A152C] text-[#E8C96A] border border-[#D4AF37]/40 shadow-inner'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="hidden 2xl:block w-4 h-4 opacity-80" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex h-10 shrink-0 items-center gap-1.5 sm:gap-3">
            <ChromeControls />




            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer — every destination, grouped */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1A0812] border-b border-[#D4AF37]/20 px-4 pt-2 pb-6 text-left max-h-[72vh] overflow-y-auto overscroll-contain">
            {NAV_ITEMS.map((item) =>
              isNavGroup(item) ? (
                <div key={item.name} className="pt-1">
                  <p className="px-4 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/70">
                    {item.name}
                  </p>
                  {item.group.map(drawerLeaf)}
                </div>
              ) : (
                <div key={item.name} className="pt-1">{drawerLeaf(item)}</div>
              )
            )}
          </div>
        )}
      </header>

      {/* Main Routed Content */}
      <main className="flex-1 w-full text-center">
        <Outlet />
        <FAQBlock />
      </main>

      {/* Interactive AI Scholar Floating Assistant */}
      <Suspense fallback={null}>
        <ScholarAssistant />
      </Suspense>

      {/* Global Scriptorium Footer - Center Aligned */}
      <footer className="w-full bg-[#1A0812] text-white border-t-2 border-[#D4AF37]/30 pt-16 pb-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-center">
            {/* Column 1: Ministry Info */}
            <div className="space-y-4 flex flex-col items-center text-center">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/icons/emblem.png" alt="Saul's Podship Logo" className="h-10 w-10 object-contain" />
                <span className="font-serif font-bold text-xl text-white tracking-tight">
                  Saul's Podship
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light max-w-sm mx-auto">
                A digital scriptorium and Christian theological encyclopedia dedicated to rigorous exegesis, historical contextualization, classical biblical hermeneutics, and indigenous South Asian Christian hymnody.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-[#E8C96A]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  51 Peer-Reviewed Volumes
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Award className="w-3.5 h-3.5" />
                  Free &amp; Open Access
                </span>
              </div>
            </div>

            {/* Column 2: Encyclopedia Volumes */}
            <div className="flex flex-col items-center text-center">
              <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#D4AF37]/30 pb-2 inline-block">
                Encyclopedia
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 text-center">
                <li><Link to="/encyclopedia" className="hover:text-[#E8C96A] transition-colors">All 51 Volumes Index</Link></li>
                <li><Link to="/encyclopedia/all-bible-stories" className="hover:text-[#E8C96A] transition-colors">Vol 01: All Bible Stories</Link></li>
                <li><Link to="/encyclopedia/names-of-god" className="hover:text-[#E8C96A] transition-colors">Vol 30: Names of God</Link></li>
                <li><Link to="/encyclopedia/messianic-prophecies" className="hover:text-[#E8C96A] transition-colors">Vol 29: Messianic Prophecies</Link></li>
                <li><Link to="/encyclopedia/guide-to-christian-living" className="hover:text-[#E8C96A] transition-colors">Vol 22: Christian Living</Link></li>
                <li><Link to="/encyclopedia/early-church-fathers-councils" className="hover:text-[#E8C96A] transition-colors">Vol 18: Church Fathers &amp; Councils</Link></li>
              </ul>
            </div>

            {/* Column 3: Sacred Music & Media */}
            <div className="flex flex-col items-center text-center">
              <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#D4AF37]/30 pb-2 inline-block">
                Music &amp; Media
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 text-center">
                <li><Link to="/music" className="hover:text-[#E8C96A] transition-colors">Sacred Music Hub</Link></li>
                <li><Link to="/music/punjabi-zaboor" className="hover:text-[#E8C96A] transition-colors">Punjabi Zaboor (150 Psalms)</Link></li>
                <li><Link to="/music/pakistani-singers-archive" className="hover:text-[#E8C96A] transition-colors">Pakistani Singers Archive</Link></li>
                <li><Link to="/podcast" className="hover:text-[#E8C96A] transition-colors">Theological Podcast</Link></li>
                <li><a href="/videos/" className="hover:text-[#E8C96A] transition-colors">Bible Video Library</a></li>
                <li><Link to="/studio" className="hover:text-[#E8C96A] transition-colors">Scriptorium AI Studio</Link></li>
                <li>
                  <a
                    href={SITE.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold justify-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Official YouTube</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Scriptorium & Legal */}
            <div className="flex flex-col items-center text-center">
              <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#D4AF37]/30 pb-2 inline-block">
                Ministry &amp; Legal
              </h3>
              <ul className="space-y-2.5 text-xs text-white/70 text-center">
                <li><Link to="/about" className="hover:text-[#E8C96A] transition-colors">About the Ministry</Link></li>
                <li><Link to="/scholarly-standards" className="hover:text-[#E8C96A] transition-colors">Scholarly Standards</Link></li>
                <li>
                  <a
                    href={SITE.patreon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E8C96A] transition-colors inline-flex items-center gap-1.5 font-semibold text-rose-300 hover:text-rose-200 justify-center"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                    <span>Support on Patreon</span>
                  </a>
                </li>
                <li><Link to="/support" className="hover:text-[#E8C96A] transition-colors">Partnership &amp; Mission</Link></li>
                <li><Link to="/faq" className="hover:text-[#E8C96A] transition-colors">Frequently Asked Questions</Link></li>
                <li><Link to="/contact" className="hover:text-[#E8C96A] transition-colors">Contact &amp; Submissions</Link></li>
                <li><Link to="/privacy" className="hover:text-[#E8C96A] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#E8C96A] transition-colors">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="hover:text-[#E8C96A] transition-colors">Theological Disclaimer</Link></li>
                <li><Link to="/sitemap" className="hover:text-[#E8C96A] transition-colors">HTML Sitemap</Link></li>
              </ul>
            </div>
          </div>

          {/* Follow the Podship — official social channels */}
          <div className="mt-12 pt-10 border-t border-white/10 flex flex-col items-center gap-5">
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider border-b border-[#D4AF37]/30 pb-2">
              Follow the Podship
            </h3>
            <div className="flex items-center justify-center gap-4">
              {[
                {
                  name: "YouTube",
                  href: SITE.youtube,
                  label: "Saul's Podship on YouTube",
                  path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                },
                {
                  name: "TikTok",
                  href: SITE.tiktok,
                  label: "Saul's Podship on TikTok",
                  path: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.19-3.67 2.58-4.99 1.42-1.37 3.33-2.23 5.32-2.32.02 1.64-.04 3.28-.02 4.91-1.4-.13-2.89.28-3.87 1.3-.78.81-1.25 1.95-1.3 3.11.05.97.5 1.95 1.25 2.62 1.61 1.55 4.35 1.36 5.72-.41.56-.69.86-1.59.9-2.51.11-2.6.05-5.21.05-7.82.01-1.65-.01-3.29-.01-4.94z"
                },
                {
                  name: "Facebook",
                  href: SITE.facebook,
                  label: "Saul's Podship on Facebook",
                  path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                },
                {
                  name: "Instagram",
                  href: SITE.instagram,
                  label: "Saul's Podship on Instagram",
                  path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.65.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.072 1.17.055 1.805.249 2.228.414.562.217.96.478 1.382.9.419.42.68.819.896 1.381.164.42.36 1.058.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.228-.224.562-.479.96-.899 1.382-.419.419-.824.68-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.898-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.06-1.649-.06-4.844 0-3.196.015-3.586.06-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 1.26-.998 2.24-2.246 2.24-1.26 0-2.24-.998-2.24-2.24 0-1.24.997-2.24 2.24-2.24 1.247 0 2.246.997 2.246 2.24z"
                }
              ].map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.label}
                  title={soc.label}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-[#D4AF37]/40 bg-white/5 text-[#E8C96A] hover:bg-[#D4AF37] hover:text-[#1A0812] hover:border-[#D4AF37] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                    <path d={soc.path} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-[11px] text-white/45 tracking-wide">
              Scripture through story, sound, and Spirit — new episodes on every channel.
            </p>
            <InstallPrompt />
          </div>

            <AuthorSeal />

          {/* Bottom Bar - Center Aligned */}
          <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center text-center text-xs text-white/60 gap-3">
            <p>
              &copy; {new Date().getFullYear()} Saul's Podship. All rights reserved. Scriptorium theological content is freely published for global Christian education and research.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
              <Link to="/privacy" className="hover:text-[#E8C96A]">Privacy Policy</Link>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-[#E8C96A]">Terms of Service</Link>
              <span>&bull;</span>
              <Link to="/disclaimer" className="hover:text-[#E8C96A]">Theological Disclaimer</Link>
              <span>&bull;</span>
              <Link to="/sitemap" className="hover:text-[#E8C96A]">HTML Sitemap</Link>
              <span>&bull;</span>
              <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                Official YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>

      <InstallBanner />
      <BottomNav />
    </div>
  );
};

export default RootLayout;
