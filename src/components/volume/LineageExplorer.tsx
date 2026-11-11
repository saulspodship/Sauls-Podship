/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * LineageExplorer — a volume's family tree of traditions (`content.lineage`).
 *
 * It is part of the volume page, not a module framed inside it: the section
 * header, pills, cards and fact tiles are the same Tailwind idioms VolumePage
 * uses, so the site theme (light / dark), the language layer and the scripture
 * auto-linker all apply with no extra wiring. Everything is centre-aligned, in
 * line with the "Center Alignment Across Site" rule in global.css.
 *
 * Two views over one dataset:
 *   Tree      nested groups — each tradition sits inside the one it branches from
 *   Timeline  one flat list in order of appearance, with each tradition's roots
 * and two dating systems (biblical / scholarly) that drive the "Began" line and
 * the timeline order.
 *
 * Notes for whoever edits this:
 *  - Text that changes at runtime is rendered in a keyed <span>. The language
 *    engine keeps the first English string it saw on a text node, so re-using a
 *    node for a new string would restore a stale label on switching back to
 *    English. A new key gives it a fresh node.
 *  - Lists are <ul>/<li>, never `.grid > div`: ChromeControls arms every
 *    `section .grid > div` for the scroll-reveal animation, which is right for
 *    the static notes but would replay on every expand/collapse.
 *  - Colours are the site palette only, and only classes the dark-mode block in
 *    global.css already retints.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Copy, Download, Network, Search, X } from 'lucide-react';
import type { LineageNode, VolumeLineage } from '../../types';
import { lineageAncestors, lineageTable, yearLabel } from '../../lib/lineage';
import { useI18n } from '../../lib/i18n/react';
import { InlineMd } from '../InlineMd';

type View = 'tree' | 'timeline';
type Dating = 'biblical' | 'scholarly';

interface Props {
  lineage: VolumeLineage;
  /** Volume slug — names the CSV export. */
  slug: string;
}

const PILL = 'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all';
const PILL_ON = 'bg-[#4A152C] text-[#E8C96A] border-[#D4AF37]/50 shadow-sm';
const PILL_OFF = 'bg-gray-100 text-gray-700 border-transparent hover:border-[#D4AF37]/60 hover:text-[#4A152C]';

/** A labelled row of pills; exactly one is pressed. */
function PillGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label={label}>
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1C2E] me-1">{label}</span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`${PILL} ${value === option.id ? PILL_ON : PILL_OFF}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const TONES = {
  plain: {
    box: 'bg-gray-50 border-gray-200',
    head: 'text-gray-500',
    body: 'text-gray-900 font-medium',
  },
  claim: {
    box: 'bg-amber-50/60 border-[#D4AF37]/30',
    head: 'text-[#8B1C2E]',
    body: 'font-serif text-[#4A152C]',
  },
  dark: {
    box: 'bg-[#1A0812] border-[#D4AF37]/40',
    head: 'text-[#E8C96A]',
    body: 'text-white/80',
  },
} as const;

/** One labelled fact about a tradition. */
const Fact: React.FC<{
  label: string;
  tone?: keyof typeof TONES;
  wide?: boolean;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, tone = 'plain', wide = false, badge, children }) => {
  const t = TONES[tone];
  return (
    <li className={`p-4 rounded-xl border text-center ${t.box} ${wide ? 'sm:col-span-2' : ''}`}>
      <div className={`flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${t.head}`}>
        <span>{label}</span>
        {badge}
      </div>
      {/* dir="auto": the values are English until the dictionary covers them, so under an RTL
          language they keep their own left-to-right order (and flip the day they are translated). */}
      {children ? (
        <div dir="auto" className={`mt-1.5 text-sm leading-relaxed ${t.body}`}>
          {children}
        </div>
      ) : null}
    </li>
  );
};

/**
 * Search forgives what a phone keyboard leaves out: "quran" finds Qur’an, "bahai"
 * finds Bahá’í, "6:1-4" finds 6:1–4 — and likewise the vowel marks of Urdu and
 * Arabic and the nukta of Hindi when the page is read in those languages.
 */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u0652\u0670\u093c]/g, '')
    .replace(/[’‘ʼ'`]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const Stem: React.FC = () => <span aria-hidden="true" className="block mx-auto h-3 w-px bg-[#D4AF37]/60" />;

export const LineageExplorer: React.FC<Props> = ({ lineage, slug }) => {
  const { nodes } = lineage;

  /* ---- the tree, indexed once ---- */
  const index = useMemo(() => {
    const children = new Map<string, LineageNode[]>();
    for (const n of nodes) {
      if (n.parent === null) continue;
      const list = children.get(n.parent);
      if (list) list.push(n);
      else children.set(n.parent, [n]);
    }
    const root = nodes.find((n) => n.parent === null);
    const ancestors = lineageAncestors(nodes);
    const haystack = new Map(
      nodes.map((n) => [
        n.id,
        fold(
          [n.name, n.founder, n.books, n.symbols, n.claimType, n.claim, n.dateNote, n.occultView, n.check]
            .filter(Boolean)
            .join(' \n '),
        ),
      ]),
    );
    /* Opening state on arrival: the root and its first branches. */
    const firstBranches = new Set<string>();
    if (root) {
      firstBranches.add(root.id);
      for (const child of children.get(root.id) || []) if (children.has(child.id)) firstBranches.add(child.id);
    }
    return { children, root, ancestors, haystack, firstBranches };
  }, [nodes]);

  const [view, setView] = useState<View>('tree');
  const [dating, setDating] = useState<Dating>('biblical');
  const [group, setGroup] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [openFacts, setOpenFacts] = useState<Set<string>>(() => new Set());
  const [openBranches, setOpenBranches] = useState<Set<string>>(() => new Set(index.firstBranches));
  const [copied, setCopied] = useState(false);

  const { lang, t } = useI18n();
  const q = fold(query.trim());
  const filtering = group !== 'all' || q !== '';

  /* ---- which traditions match, and which are only shown as the path to a match ---- */
  const { matched, visible } = useMemo(() => {
    const matchedIds = new Set<string>();
    const visibleIds = new Set<string>();
    for (const n of nodes) {
      if (group !== 'all' && !n.tags.includes(group)) continue;
      if (q) {
        let hit = (index.haystack.get(n.id) || '').includes(q);
        /* Read in Urdu, Hindi or Arabic, the names and source types on screen are
           translated, so a search typed in that language has to find them too. */
        if (!hit && lang !== 'en') hit = fold(`${t(n.name)} \n ${t(n.claimType)}`).includes(q);
        if (!hit) continue;
      }
      matchedIds.add(n.id);
      visibleIds.add(n.id);
      for (const ancestor of index.ancestors.get(n.id) || []) visibleIds.add(ancestor.id);
    }
    return { matched: matchedIds, visible: visibleIds };
  }, [nodes, group, q, index, lang, t]);

  const yearOf = useCallback(
    (n: LineageNode) => (dating === 'biblical' ? n.biblicalYear : n.scholarlyYear),
    [dating],
  );

  /* Undated traditions (no scholarly equivalent) lead the timeline: they are the primeval ones. */
  const chronological = useMemo(() => {
    const rank = (n: LineageNode) => yearOf(n) ?? Number.NEGATIVE_INFINITY;
    return nodes
      .filter((n) => matched.has(n.id))
      .map((n, i) => ({ n, i }))
      .sort((a, b) => {
        const x = rank(a.n);
        const y = rank(b.n);
        return x === y ? a.i - b.i : x < y ? -1 : 1;
      })
      .map(({ n }) => n);
  }, [nodes, matched, yearOf]);

  const allExpanded = openFacts.size === nodes.length;

  const toggleIn = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (allExpanded) {
      setOpenFacts(new Set());
      setOpenBranches(new Set(index.firstBranches));
    } else {
      setOpenFacts(new Set(nodes.map((n) => n.id)));
      setOpenBranches(new Set(index.children.keys()));
    }
  };

  const clearFilters = () => {
    setGroup('all');
    setQuery('');
  };

  /* ---- export: the whole tree as a table, like every other reference table ---- */
  const handleCopy = () => {
    const { headers, rows } = lineageTable(lineage);
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    try {
      void navigator.clipboard?.writeText(tsv);
    } catch {
      /* clipboard blocked — nothing to report */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const { headers, rows } = lineageTable(lineage);
    const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-lineage.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ---- the facts of one tradition ---- */
  const renderFacts = (n: LineageNode) => {
    const biblical = yearLabel(n.biblicalYear);
    const scholarly = yearLabel(n.scholarlyYear);
    const agree = biblical !== null && biblical === scholarly;
    return (
      <div id={`lineage-facts-${n.id}`} className="border-t border-gray-100 px-3 sm:px-6 py-4 sm:py-5 font-sans">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Fact label="Dates">
            {agree ? (
              <>
                <span className="block font-semibold">{biblical}</span>
                <span className="block text-[11px] font-normal text-gray-500">Biblical and scholarly dating agree</span>
              </>
            ) : (
              <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5">
                {biblical && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-normal text-gray-500">Biblical</span>
                    <span className="font-semibold">{biblical}</span>
                  </span>
                )}
                {scholarly ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-normal text-gray-500">Scholarly</span>
                    <span className="font-semibold">{scholarly}</span>
                  </span>
                ) : (
                  <span className="font-normal italic text-gray-500">No scholarly date</span>
                )}
              </span>
            )}
            {n.dateNote && (
              <span dir="auto" className="mt-1.5 block text-xs font-normal text-gray-600">
                <InlineMd text={n.dateNote} />
              </span>
            )}
          </Fact>

          <Fact label="Founder or source">
            <InlineMd text={n.founder} />
          </Fact>

          <Fact
            label="Spiritual claim"
            tone="claim"
            wide
            badge={
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  n.claimType === 'Bible'
                    ? 'bg-[#4A152C] text-[#E8C96A]'
                    : 'border border-[#8B1C2E]/40 text-[#8B1C2E]'
                }`}
              >
                {n.claimType}
              </span>
            }
          >
            {n.claim ? <InlineMd text={n.claim} /> : null}
          </Fact>

          <Fact label="Books">
            <InlineMd text={n.books} />
          </Fact>

          <Fact label="Symbols and relics">
            <InlineMd text={n.symbols} />
          </Fact>

          {n.occultView && (
            <Fact label={n.occultViewLabel || 'Occult view'} tone="dark" wide={!n.check}>
              <InlineMd text={n.occultView} />
            </Fact>
          )}

          {n.check && (
            <Fact label="Check" wide={!n.occultView}>
              <InlineMd text={n.check} />
            </Fact>
          )}
        </ul>
      </div>
    );
  };

  /* ---- one tradition: title row (opens its facts) + branch row (opens what grew from it) ---- */
  const renderCard = (n: LineageNode, options: { branches?: number; branchesOpen?: boolean; showRoots?: boolean }) => {
    const factsOpen = openFacts.has(n.id);
    const began = yearLabel(yearOf(n));
    const isRoot = n.parent === null;
    const pathOnly = filtering && !matched.has(n.id);
    const roots = index.ancestors.get(n.id) || [];
    return (
      <div
        className={`rounded-2xl bg-white border overflow-hidden shadow-sm transition-colors hover:border-[#D4AF37]/60 ${
          isRoot || factsOpen ? 'border-[#D4AF37]/60' : 'border-gray-200'
        } ${pathOnly ? 'opacity-60' : ''}`}
      >
        <button
          type="button"
          onClick={() => toggleIn(setOpenFacts, n.id)}
          aria-expanded={factsOpen}
          aria-controls={`lineage-facts-${n.id}`}
          className="group relative block w-full px-10 sm:px-12 py-3.5 text-center"
        >
          <span className="block font-serif font-bold text-base sm:text-lg text-[#1D2D50] group-hover:text-[#4A152C] transition-colors">
            {n.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-gray-500">
            {began ? (
              <>
                <span>Began</span>
                <span key={began} className="font-semibold text-[#8B1C2E]">{began}</span>
              </>
            ) : (
              <span className="italic">No scholarly date</span>
            )}
            {n.tags.includes('occult') && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#1A0812] text-[#D4AF37]">
                Occult
              </span>
            )}
          </span>
          {options.showRoots && (
            <span className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 text-[11px] text-gray-500">
              {roots.length ? (
                <>
                  <span className="font-bold uppercase tracking-wider">Roots</span>
                  {/* one text node per name, so each resolves in the site dictionary */}
                  {roots.map((a, i) => (
                    <React.Fragment key={a.id}>
                      {i > 0 && <span aria-hidden="true">›</span>}
                      <span>{a.name}</span>
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <span className="font-bold uppercase tracking-wider">Origin</span>
              )}
            </span>
          )}
          <ChevronRight
            aria-hidden="true"
            className={`absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
              factsOpen ? 'rotate-90 text-[#4A152C]' : ''
            }`}
          />
        </button>

        {factsOpen && renderFacts(n)}

        {options.branches ? (
          <button
            type="button"
            onClick={() => toggleIn(setOpenBranches, n.id)}
            aria-expanded={!!options.branchesOpen}
            disabled={filtering}
            className="flex w-full items-center justify-center gap-1 border-t border-gray-100 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8B1C2E] transition-colors hover:bg-amber-50/40 disabled:pointer-events-none"
          >
            <span key={options.branches}>
              {options.branches === 1 ? '1 branch' : `${options.branches} branches`}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`w-3.5 h-3.5 transition-transform ${options.branchesOpen ? 'rotate-180' : ''}`}
            />
          </button>
        ) : null}
      </div>
    );
  };

  /* ---- tree view: every tradition sits inside the group of the one it branches from ---- */
  const renderBranch = (n: LineageNode): React.ReactNode => {
    if (!visible.has(n.id)) return null;
    const kids = (index.children.get(n.id) || []).filter((k) => visible.has(k.id));
    const branchesOpen = kids.length > 0 && (filtering || openBranches.has(n.id));
    return (
      <li key={n.id}>
        {renderCard(n, { branches: kids.length, branchesOpen })}
        {branchesOpen && (
          <>
            <Stem />
            <ul className="space-y-2 rounded-2xl border border-[#4A152C]/10 bg-[#4A152C]/[0.03] p-1.5 sm:p-3">
              {kids.map(renderBranch)}
            </ul>
          </>
        )}
      </li>
    );
  };

  const shown = matched.size;
  const countLabel = `Showing ${shown} of ${nodes.length} traditions`;

  return (
    <section id="lineage" className="space-y-6 scroll-mt-24">
      <div className="border-b border-gray-200 pb-3 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">{lineage.eyebrow}</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <Network className="w-6 h-6 shrink-0 text-[#D4AF37]" aria-hidden="true" />
          {lineage.title}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2" aria-hidden="true">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/70" />
          <span className="text-[#D4AF37] text-xs">&#10022;</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/70" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-3xl mx-auto">{lineage.intro}</p>
      </div>

      {/* How to read the tree: the dating rule and the source labels */}
      {lineage.notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lineage.notes.map((item) => (
            <div key={item.label} className="p-5 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-sm text-center">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#8B1C2E] mb-2">{item.label}</div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4 text-center">
        <div className="relative w-full sm:w-96 mx-auto">
          <Search className="w-4 h-4 absolute start-3 top-3 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search traditions..."
            aria-label="Search traditions, founders, books and symbols"
            className="w-full px-9 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-center text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#4A152C]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute end-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <PillGroup<View>
            label="View as"
            value={view}
            onChange={setView}
            options={[{ id: 'tree', label: 'Tree' }, { id: 'timeline', label: 'Timeline' }]}
          />
          <PillGroup<Dating>
            label="Dating"
            value={dating}
            onChange={setDating}
            options={[{ id: 'biblical', label: 'Biblical' }, { id: 'scholarly', label: 'Scholarly' }]}
          />
        </div>

        <PillGroup<string>
          label="Show"
          value={group}
          onChange={setGroup}
          options={[{ id: 'all', label: 'All' }, ...lineage.groups]}
        />

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4A152C] hover:bg-[#681E3E] text-[#E8C96A] text-xs font-bold transition-colors"
          >
            <ChevronDown aria-hidden="true" className={`w-3.5 h-3.5 transition-transform ${allExpanded ? 'rotate-180' : ''}`} />
            <span key={allExpanded ? 'collapse' : 'expand'}>{allExpanded ? 'Collapse all' : 'Expand all'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Table to Clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-colors hover:border-[#D4AF37]/60 hover:text-[#4A152C]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 font-medium" aria-live="polite">
          <span key={countLabel}>{countLabel}</span>
        </p>
      </div>

      {/* The lineage itself */}
      {shown === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm text-center space-y-3">
          <p className="text-sm text-gray-500 italic">No traditions match your search.</p>
          <button type="button" onClick={clearFilters} className={`${PILL} ${PILL_ON}`}>
            Clear filters
          </button>
        </div>
      ) : view === 'tree' ? (
        <ul className="max-w-3xl mx-auto">{index.root ? renderBranch(index.root) : null}</ul>
      ) : (
        <ol className="max-w-3xl mx-auto">
          {chronological.map((n, i) => (
            <li key={n.id}>
              {i > 0 && <Stem />}
              {renderCard(n, { showRoots: true })}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default LineageExplorer;
