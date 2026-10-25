/* ============================================================
   ModuleSwitcher — switches the site's interactive scholarship
   modules in place. Modules merge into the page (no boxed
   "window"): a borderless auto-height frame flows with content,
   and the switch buttons sit below, centered, as on the atlas.
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ExternalLink, Network } from 'lucide-react';
import AutoFrame from './AutoFrame';

/** true below the lg breakpoint (phones / tablets / installed app) */
function useIsMobile() {
  const [m, setM] = useState<boolean>(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

/** Mount the (heavy) embedded module only once it is close to the viewport.
 *  The home page sits below the atlas, so the iframe + its 300 kB document
 *  used to start downloading while the visitor was still reading the hero. */
function useNearViewport<T extends HTMLElement>(rootMargin = '500px') {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some(e => e.isIntersecting)) { setNear(true); io.disconnect(); } },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

export type ModuleId = 'map' | 'crossrefs';

const MODULES: {
  id: ModuleId; label: string; short: string; blurb: string;
  src: string; full: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'map',
    label: 'Biblical Prophecy Map',
    short: 'Prophecy Map',
    blurb: '247 prophecies — 107 fulfilled, 88 in part, 52 awaiting — woven by 1,063 cross-links on a rotatable 3D globe. Every thread opens the passage on bible.com.',
    src: '/prophecy-map.html',
    full: '/prophecy-map',
    icon: Compass,
  },
  {
    id: 'crossrefs',
    label: 'The Interlinked Bible — 344,799 Threads',
    short: 'Interlinked Bible',
    blurb: 'Every cross-reference in Scripture — 344,799 verse links forming 190,758 chapter threads across all 66 books — woven into one interactive horseshoe, with a world faith map beneath.',
    src: '/cross-references/viz.html',
    full: '/cross-references',
    icon: Network,
  },
];

interface Props { compact?: boolean }

const ModuleSwitcher: React.FC<Props> = ({ compact = false }) => {
  const [active, setActive] = useState<ModuleId>('map');
  const mod = MODULES.find(m => m.id === active)!;
  const isMobile = useIsMobile();
  const { ref: hostRef, near } = useNearViewport<HTMLDivElement>();

  // Phones / app view: no embedded module (the iframes are heavy and the
  // toolbars swallow the small screen). Show routing cards that open each
  // module on its own full page instead.
  if (isMobile) {
    return (
      <div className="w-full grid grid-cols-1 gap-3 text-left">
        {MODULES.map(m => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              to={m.full}
              className="group flex items-center gap-4 rounded-2xl border border-[#D4AF37]/30 bg-white/5 px-4 py-4 active:bg-white/10 transition-colors"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-[#1A0812] shadow-md">
                <Icon className="w-6 h-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif font-bold text-base text-white leading-tight">{m.label}</span>
                <span className="mt-1 block text-[11px] leading-snug text-white/65 line-clamp-2">{m.blurb}</span>
              </span>
              <ArrowRight className="w-5 h-5 shrink-0 text-[#E8C96A] group-active:translate-x-0.5 transition-transform" />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={hostRef} className="w-full flex flex-col items-center">
      <div className="w-full" style={{ minHeight: compact ? 440 : 560 }}>
        {near ? (
          <AutoFrame
            src={mod.src}
            title={`${mod.label} — interactive module`}
            initial={compact ? '62vh' : '76vh'}
            min={compact ? 440 : 560}
          />
        ) : (
          // Placeholder with the same height — no layout shift when it swaps in.
          <div
            className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#D4AF37]/20 bg-white/[0.03]"
            style={{ height: compact ? '62vh' : '76vh', minHeight: compact ? 440 : 560 }}
            aria-hidden="true"
          >
            <span className="inline-block h-8 w-8 rounded-full border-2 border-[#D4AF37]/25 border-t-[#E8C96A] animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E8C96A]/70">
              {mod.short}
            </span>
          </div>
        )}
      </div>

      {/* module switch buttons — below the preview, centered */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        {MODULES.map(m => {
          const Icon = m.icon;
          const isOn = m.id === active;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m.id)}
              aria-pressed={isOn}
              className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                isOn
                  ? 'bg-[#D4AF37] text-[#1A0812] ring-2 ring-[#E8C96A]/60 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-[#E8C96A] border border-[#D4AF37]/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {isOn ? `Viewing · ${m.short}` : m.short}
            </button>
          );
        })}
        <a
          href={mod.full}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-xs text-[#E8C96A] bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Full-Screen
        </a>
      </div>

      {!compact && (
        <p className="text-white/65 text-[11px] sm:text-xs max-w-2xl text-center pt-3 leading-relaxed">{mod.blurb}</p>
      )}
    </div>
  );
};

export { MODULES };
export default ModuleSwitcher;
