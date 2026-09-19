/**
 * BottomNav — app-style bottom navigation for phones / tablets / installed PWA.
 * Visible < 1024px (the same breakpoint where the desktop nav row is hidden).
 *
 *   Home · Questions · Volumes (centre) · Apologetics · Videos · More
 *
 * "More" opens a bottom sheet with every remaining destination — Prophecy Map,
 * Bible Links (cross-references), Biblical Maps, Podcast, Music, Studio…
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Globe2, Network, Crown, Video, LayoutGrid, X,
  BookOpen, Scale, HelpCircle, Mic, Music, Sparkles, ShieldCheck, Info, Heart, Map,
  School, Languages,
} from 'lucide-react';
import { SITE } from '../config/site';

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; static?: boolean; external?: boolean };

const TABS: Item[] = [
  { to: '/',                   label: 'Home',        icon: Home },
  { to: '/theological-archive',     label: 'Questions',   icon: HelpCircle },
  { to: '/encyclopedia',            label: 'Volumes',     icon: BookOpen },
  { to: '/comparative-apologetics', label: 'Apologetics', icon: Scale },
  { to: '/videos/',            label: 'Videos',      icon: Video, static: true },
];

const MORE: { heading: string; items: Item[] }[] = [
  {
    heading: 'Study modules',
    items: [
      { to: '/prophecy-map',            label: 'Prophecy Map · Globe & Timeline',        icon: Globe2 },
      { to: '/cross-references',        label: 'Bible Links · Interlinked Cross-References', icon: Network },
      { to: '/kings-of-the-bible',      label: 'Kings of the Bible · Volume 51',         icon: Crown },
      { to: '/encyclopedia/biblical-maps-atlas.html', label: 'Biblical Maps Atlas',       icon: Map, static: true },
    ],
  },
  {
    heading: 'Listen & watch',
    items: [
      { to: '/podcast',               label: 'Podcast',                 icon: Mic },
      { to: '/music',                 label: 'Sacred Music & Zaboor',   icon: Music },
      { to: '/studio',                label: 'Scriptorium Studio',      icon: Sparkles },
    ],
  },
  {
    heading: 'Academy · our campuses',
    items: [
      { to: SITE.sundaySchool,      label: 'Sunday School · Subdomain',      icon: School, external: true },
      { to: SITE.biblicalLanguages, label: 'Biblical Languages · Subdomain', icon: Languages, external: true },
    ],
  },
  {
    heading: 'Ministry',
    items: [
      { to: '/scholarly-standards',   label: 'Scholarly Standards',     icon: ShieldCheck },
      { to: '/about',                 label: 'About Saul’s Podship',    icon: Info },
      { to: SITE.patreon,             label: 'Support on Patreon',      icon: Heart, external: true },
    ],
  },
];

const isActive = (to: string, pathname: string) =>
  to === '/' ? pathname === '/' : pathname.startsWith(to.replace(/\/$/, ''));

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  // position:fixed pins to the LAYOUT viewport; when the browser pinch-zooms
  // (or auto-zooms into a small input) the bar slides out of view. Track the
  // visual viewport and keep the bar glued to its bottom edge instead.
  useEffect(() => {
    const vv = window.visualViewport;
    const nav = navRef.current;
    if (!vv || !nav) return;
    let raf = 0;
    const place = () => {
      raf = 0;
      const scale = vv.scale || 1;
      if (scale <= 1.02 && Math.abs(vv.offsetTop) < 1) {
        nav.style.transform = ''; nav.style.top = ''; nav.style.left = ''; nav.style.width = ''; nav.style.bottom = '';
        return;
      }
      const h = nav.offsetHeight;
      nav.style.bottom = 'auto';
      nav.style.left = `${vv.offsetLeft}px`;
      nav.style.width = `${vv.width}px`;
      nav.style.top = `${vv.offsetTop + vv.height - h / scale}px`;
      nav.style.transformOrigin = 'top left';
      nav.style.transform = `scale(${1 / scale})`;
    };
    const onChange = () => { if (!raf) raf = requestAnimationFrame(place); };
    vv.addEventListener('resize', onChange); vv.addEventListener('scroll', onChange); window.addEventListener('scroll', onChange, { passive: true });
    place();
    return () => { vv.removeEventListener('resize', onChange); vv.removeEventListener('scroll', onChange); window.removeEventListener('scroll', onChange); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // close the sheet on navigation + lock scroll while open
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const moreActive = !open && MORE.some(g => g.items.some(i => !i.external && isActive(i.to, pathname))) && !TABS.some(t => isActive(t.to, pathname));

  const tabClass = (active: boolean) =>
    `relative flex h-[60px] w-full flex-col items-center justify-center gap-1 text-[10.5px] font-semibold leading-none transition-colors ${
      active ? 'text-[#E8C96A]' : 'text-white/70 active:text-white'
    }`;
  const Indicator = () => <span aria-hidden className="absolute top-0 left-[22%] right-[22%] h-0.5 rounded-b bg-[#D4AF37]" />;

  return (
    <>
      {/* ---- MORE sheet ---- */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[390]" role="dialog" aria-modal="true" aria-label="More destinations">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <div className="absolute inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] max-h-[72vh] overflow-y-auto rounded-t-3xl bg-[#1A0812] border-t border-[#D4AF37]/30 shadow-2xl text-left">
            <div className="sticky top-0 flex items-center justify-between px-5 pt-4 pb-3 bg-[#1A0812]/95 backdrop-blur border-b border-white/10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">Saul’s Podship</p>
                <h2 className="font-serif text-lg font-bold text-white leading-tight">Everything else</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-6 pt-2 space-y-5">
              {MORE.map(group => (
                <div key={group.heading}>
                  <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{group.heading}</p>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const active = !item.external && isActive(item.to, pathname);
                      const cls = `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                        active ? 'bg-[#4A152C] text-[#E8C96A] border border-[#D4AF37]/40' : 'text-white/90 bg-white/5 active:bg-white/10'
                      }`;
                      const inner = (
                        <>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#E8C96A]"><Icon className="w-[18px] h-[18px]" /></span>
                          <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
                        </>
                      );
                      return (
                        <li key={item.to}>
                          {item.external ? (
                            <a href={item.to} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                          ) : item.static ? (
                            <a href={item.to} className={cls}>{inner}</a>
                          ) : (
                            <Link to={item.to} className={cls}>{inner}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- tab bar ---- */}
      <nav
        ref={navRef}
        id="sp-bottom-nav"
        aria-label="Primary mobile navigation"
        className="lg:hidden fixed inset-x-0 bottom-0 z-[400] bg-[#16060f]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 shadow-[0_-6px_24px_rgba(0,0,0,0.35)] pb-[env(safe-area-inset-bottom)] text-left"
      >
        <ul className="grid grid-cols-6 m-0 p-0 list-none">
          {TABS.map(({ to, label, icon: Icon, static: isStatic }) => {
            const active = !open && isActive(to, pathname);
            const content = (
              <>
                {active && <Indicator />}
                <Icon className="w-[23px] h-[23px]" strokeWidth={1.9} />
                <span>{label}</span>
              </>
            );
            return (
              <li key={to}>
                {isStatic ? (
                  <a href={to} aria-current={active ? 'page' : undefined} className={tabClass(active)}>{content}</a>
                ) : (
                  <Link to={to} aria-current={active ? 'page' : undefined} className={tabClass(active)}>{content}</Link>
                )}
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={tabClass(open || moreActive)}
            >
              {(open || moreActive) && <Indicator />}
              {open ? <X className="w-[23px] h-[23px]" strokeWidth={1.9} /> : <LayoutGrid className="w-[23px] h-[23px]" strokeWidth={1.9} />}
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default BottomNav;
