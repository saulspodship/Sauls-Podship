/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SiteNav — the categorised header navigation.
 *
 * Desktop (≥1024px): five dropdowns — Encyclopedia · Study Tools ·
 * Listen & Watch · Academy · Ministry. Hover, focus or click opens a mega
 * panel that holds every destination of that family in labelled columns, so the
 * header row stays a calm line of five words instead of a wall of links.
 *
 * Mobile / tablet: the burger opens the very same five groups as accordions.
 *
 * Both read `src/config/nav.ts` — the single source of truth for the taxonomy,
 * including the two ministry subdomains (Sunday School, Biblical Languages).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import {
  hostOf, isGroupActive, isOffSite, NAV_GROUPS, SUBDOMAINS,
  type NavGroup, type NavItem,
} from '../config/nav';

const SUBDOMAIN_HREFS: string[] = [SUBDOMAINS.sundaySchool.href, SUBDOMAINS.biblicalLanguages.href];
const isSubdomainItem = (item: NavItem) => item.kind === 'external' && SUBDOMAIN_HREFS.indexOf(item.href) > -1;

/* ---------------------------------------------------------------- one row --- */

const Row: React.FC<{ item: NavItem; onNavigate: () => void; dense?: boolean }> = ({ item, onNavigate, dense }) => {
  const Icon = item.icon;
  const offSite = item.kind === 'external';
  const campus = isSubdomainItem(item);
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${
        campus
          ? 'bg-[#D4AF37] text-[#1A0812] ring-[#E8C96A]'
          : 'bg-[#D4AF37]/10 text-[#E8C96A] ring-[#D4AF37]/20 group-hover:bg-[#D4AF37]/25'
      }`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={`text-[13.5px] font-semibold leading-snug ${campus ? 'text-[#E8C96A]' : 'text-white/95'}`}>
            {item.label}
          </span>
          {campus ? (
            <span className="rounded-full bg-[#D4AF37]/15 px-1.5 py-px text-[9.5px] font-black uppercase tracking-wider text-[#E8C96A]">
              Subdomain
            </span>
          ) : item.tag ? (
            <span className="rounded-full bg-white/[.08] px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wider text-[#D4AF37]/90">
              {item.tag}
            </span>
          ) : null}
        </span>
        {item.desc && (
          <span className="mt-0.5 block text-[11.5px] font-light leading-snug text-white/55">
            {item.desc}
            {offSite && !campus && <span className="ml-1 text-white/35">{hostOf(item.href)}</span>}
          </span>
        )}
        {campus && <span className="mt-0.5 block text-[10.5px] font-medium tracking-wide text-white/40">{hostOf(item.href)}</span>}
      </span>
      {offSite ? (
        <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-white/40 transition-colors group-hover:text-[#E8C96A]" />
      ) : (
        <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-[#E8C96A]" />
      )}
    </>
  );

  const cls = `group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
    dense ? '' : 'hover:bg-white/[.06]'
  }`;
  const shared = { className: cls, onClick: onNavigate, title: item.desc || item.label };

  if (offSite || isOffSite(item.href)) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" {...shared}>{body}</a>;
  }
  if (item.kind === 'static') return <a href={item.href} {...shared}>{body}</a>;
  return <Link to={item.href} {...shared}>{body}</Link>;
};

/* -------------------------------------------------------------- mega panel -- */

const MegaPanel: React.FC<{ group: NavGroup; onNavigate: () => void }> = ({ group, onNavigate }) => {
  const innerCols = group.sections.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
  const rail = group.sections.flatMap((s) => s.items).slice(0, 3);
  return (
    <div
      id={`nav-panel-${group.id}`}
      role="group"
      aria-label={`${group.label} menu`}
      className="sp-mega absolute inset-x-0 top-full z-50 hidden lg:block px-4 sm:px-5 lg:px-6"
    >
      <div className="mx-auto mt-2 max-w-[1240px] overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#16060F]/[.97] text-white shadow-[0_28px_60px_-18px_rgba(0,0,0,0.75)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[.03] px-5 py-2.5 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">
            {group.label} <span className="text-white/30">·</span>{' '}
            <span className="font-semibold tracking-[0.14em] text-white/55">{group.kicker}</span>
          </p>
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/45 hover:bg-white/10 hover:text-white"
          >
            Close ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 text-left sm:p-5 xl:grid-cols-[minmax(0,1fr)_236px]">
          <div className={`grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 ${innerCols}`}>
            {group.sections.map((section) => (
              <div key={section.heading} className="min-w-0">
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                  {section.heading}
                </p>
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                  {section.items.map((item) => (
                    <li key={`${item.href}-${item.label}`}>
                      <Row item={item} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* right rail — the group's three headline doors, plus a note */}
          <aside className="hidden flex-col justify-between gap-3 rounded-xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#24101C] to-[#16060F] p-4 text-left xl:flex">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Start here</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {rail.map((item) => (
                  <RailLink key={`${item.href}-rail`} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
            {group.note && (
              <p className="text-[11px] font-light italic leading-snug text-white/45">{group.note}</p>
            )}
          </aside>
        </div>

        {group.note && group.sections.length < 3 && (
          <p className="border-t border-white/10 px-5 py-2 text-left text-[11px] font-light italic text-white/40 xl:hidden">
            {group.note}
          </p>
        )}
      </div>
    </div>
  );
};

const RailLink: React.FC<{ item: NavItem; onNavigate: () => void }> = ({ item, onNavigate }) => {
  const label = (
    <span className="flex items-center gap-2 rounded-lg bg-white/[.04] px-3 py-2 text-[12px] font-semibold text-white/80 ring-1 ring-white/5 transition-colors hover:bg-white/[.09] hover:text-[#E8C96A]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]/70" />
      <span className="truncate">{item.label}</span>
    </span>
  );
  if (item.kind === 'external' || isOffSite(item.href)) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>{label}</a>;
  }
  if (item.kind === 'static') return <a href={item.href} onClick={onNavigate}>{label}</a>;
  return <Link to={item.href} onClick={onNavigate}>{label}</Link>;
};

/* ---------------------------------------------------------------- desktop --- */

export const SiteNavDesktop: React.FC = () => {
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const clearTimer = () => { if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const open = useCallback((id: string) => { clearTimer(); setOpenId(id); }, []);
  const close = useCallback(() => { clearTimer(); setOpenId(null); }, []);
  // small grace period so the pointer can cross the gap between row and panel
  const scheduleClose = useCallback(() => {
    clearTimer();
    closeTimer.current = window.setTimeout(() => setOpenId(null), 160);
  }, []);

  useEffect(() => { close(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [location.pathname, location.search]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = e.target as Node | null;
      if (rootRef.current && el && !rootRef.current.contains(el)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    const onResize = () => setOpenId(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      clearTimer();
    };
  }, []);

  const onButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>, id: string, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open(id);
      window.setTimeout(() => document.querySelector<HTMLAnchorElement>(`#nav-panel-${id} a`)?.focus(), 40);
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = NAV_GROUPS[(index + dir + NAV_GROUPS.length) % NAV_GROUPS.length];
      btnRefs.current[next.id]?.focus();
      if (openId) open(next.id);
      return;
    }
    if (e.key === 'Escape') close();
  };

  const openGroup = openId ? NAV_GROUPS.find((g) => g.id === openId) || null : null;

  return (
    // NOTE: this wrapper is deliberately NOT positioned — the mega panel anchors
    // to the header row (the `relative` flex parent in RootLayout) so it can span
    // the full header width without being clipped by body's overflow-x: clip.
    <div
      ref={rootRef}
      className="hidden lg:block"
      onMouseEnter={clearTimer}
      onMouseLeave={scheduleClose}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close(); }}
    >
      <nav aria-label="Primary" className="flex flex-nowrap items-center justify-end gap-0.5 xl:gap-1">
        {NAV_GROUPS.map((group, i) => {
          const Icon = group.icon;
          const isOpen = openId === group.id;
          const active = !isOpen && isGroupActive(group, location.pathname);
          return (
            <button
              key={group.id}
              ref={(el) => { btnRefs.current[group.id] = el; }}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`nav-panel-${group.id}`}
              onMouseEnter={() => open(group.id)}
              onFocus={() => open(group.id)}
              onClick={() => (isOpen ? close() : open(group.id))}
              onKeyDown={(e) => onButtonKey(e, group.id, i)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[13px] font-semibold leading-none transition-all xl:px-2.5 xl:text-sm 2xl:px-3 ${
                isOpen
                  ? 'bg-[#4A152C] text-[#E8C96A] shadow-inner ring-1 ring-[#D4AF37]/40'
                  : active
                    ? 'text-[#E8C96A] hover:bg-white/10'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="hidden h-4 w-4 opacity-80 2xl:block" strokeWidth={1.9} />
              <span>{group.label}</span>
              <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </nav>

      {openGroup && <MegaPanel group={openGroup} onNavigate={close} />}
    </div>
  );
};

/* ----------------------------------------------------------------- mobile --- */

export const SiteNavMobile: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const location = useLocation();
  const activeGroup = NAV_GROUPS.find((g) => isGroupActive(g, location.pathname));
  const [expanded, setExpanded] = useState<string | null>(activeGroup?.id ?? null);

  // opening the drawer lands on the group the reader is already inside
  useEffect(() => {
    if (open) setExpanded(NAV_GROUPS.find((g) => isGroupActive(g, location.pathname))?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { if (open) onClose(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sp-nav-drawer lg:hidden max-h-[76vh] overflow-y-auto overscroll-contain border-b border-[#D4AF37]/20 bg-[#1A0812] px-3 pt-2 pb-5 text-left">
      {NAV_GROUPS.map((group) => {
        const Icon = group.icon;
        const isOpen = expanded === group.id;
        const active = isGroupActive(group, location.pathname);
        const count = group.sections.reduce((n, s) => n + s.items.length, 0);
        return (
          <div key={group.id} className="mb-1.5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : group.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left ${active ? 'text-[#E8C96A]' : 'text-white'}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-[#E8C96A]">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold leading-tight">{group.label}</span>
                <span className="block truncate text-[10.5px] font-medium uppercase tracking-wider text-white/45">
                  {group.kicker}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white/[.07] px-2 py-0.5 text-[10px] font-bold text-white/55">{count}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="border-t border-white/10 px-2 pt-1.5 pb-2">
                {group.sections.map((section) => (
                  <div key={section.heading} className="mb-1">
                    <p className="px-2 pt-1.5 pb-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {section.heading}
                    </p>
                    <ul className="m-0 list-none p-0">
                      {section.items.map((item) => (
                        <li key={`${item.href}-${item.label}`}>
                          <Row item={item} onNavigate={onClose} dense />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {group.note && (
                  <p className="px-3 pt-1 text-[10.5px] italic leading-snug text-white/40">{group.note}</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/support" onClick={onClose} className="btn-gold px-4 py-2.5 text-[12px] uppercase tracking-wider">
          Support the Ministry
        </Link>
        <Link to="/encyclopedia" onClick={onClose} className="btn-ghost !bg-[#4A152C] px-4 py-2.5 text-[12px] uppercase tracking-wider">
          All 51 Volumes
        </Link>
      </div>
    </div>
  );
};

export default SiteNavDesktop;
