/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Seo from '../components/theology/Seo';
import { TOUGH_QUESTIONS } from '../data/theology/tough';
import { ARCHIVE_CATEGORIES } from '../data/theology/archive';
import {
  DENOMINATIONS,
  LANGUAGES,
  TIER_LABEL,
  CATEGORY_ICON,
  type ToughQuestion,
  type ArchiveCategory,
} from '../data/theology/types';
import {
  indexMeta,
  faqPageLd,
  scholarlyLd,
  breadcrumbLd,
  directAnswer,
  PROVENANCE,
  STATS,
  ARCHIVE_BASE,
} from '../lib/theologySeo';
import './theological-archive.css';

/* ---------- search: "quoted phrase" = exact, bare words = AND ---------- */
function makeMatcher(raw: string): ((text: string) => boolean) | null {
  const q = raw.toLowerCase().trim();
  if (!q) return null;
  const phrases: string[] = [];
  const rest = q.replace(/[\t\n\r]/g, ' ').replace(/"([^"]+)"/g, (_m, p: string) => {
    phrases.push(p.trim());
    return ' ';
  });
  const words = rest.split(' ').filter(Boolean);
  if (!phrases.length && !words.length) return null;
  return (text: string) => {
    const t = text.toLowerCase();
    return phrases.every((p) => t.includes(p)) && words.every((w) => t.includes(w));
  };
}

const toughHaystack = (q: ToughQuestion) =>
  [q.q, q.ref, q.rv, q.common.en, q.common.ur, q.common.hi, q.common.ar,
   ...q.views.flatMap((v) => [v.summary, v.detail ?? '', v.quote?.text ?? '', v.quote?.cite ?? ''])].join(' ');

type SortMode = 'freq' | 'region' | 'num' | 'az';
type Track = 'tough' | 'archive';

export default function TheologicalArchivePage() {
  // Deep links from the sitemap: /theological-archive/question/:slug and
  // /theological-archive/category/:slug open the matching entry on the hub.
  const { slug: focusSlug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const focusKind: 'question' | 'category' | null = focusSlug
    ? pathname.includes('/category/') ? 'category' : pathname.includes('/question/') ? 'question' : null
    : null;
  const [track, setTrack] = useState<Track>(focusKind === 'category' ? 'archive' : 'tough');

  const pageMeta = useMemo(() => {
    if (focusKind === 'question') {
      const q = TOUGH_QUESTIONS.find((x) => x.slug === focusSlug);
      if (q) {
        return {
          ...indexMeta,
          title: `${q.q} | Saul's Podship`,
          description: directAnswer(q).slice(0, 300),
          canonical: `${indexMeta.canonical}/question/${q.slug}`,
        };
      }
    }
    if (focusKind === 'category') {
      const c = ARCHIVE_CATEGORIES.find((x) => x.slug === focusSlug);
      if (c) {
        return {
          ...indexMeta,
          title: `${c.name} — Book-by-Book Bible Study Archive | Saul's Podship`,
          description: `${c.items.length} study questions and answers for ${c.name}, quoted from the Revised Version (1885/1895).`,
          canonical: `${indexMeta.canonical}/category/${c.slug}`,
        };
      }
    }
    return indexMeta;
  }, [focusKind, focusSlug]);

  const jsonLd = useMemo(
    () => [
      faqPageLd(TOUGH_QUESTIONS.filter((q) => q.tier === 1)),
      scholarlyLd(indexMeta),
      breadcrumbLd([
        { name: 'Home', url: '/' },
        { name: 'Theological Archive', url: ARCHIVE_BASE },
      ]),
    ],
    [],
  );

  return (
    <div className="ta-root">
      <Seo meta={pageMeta} jsonLd={jsonLd} />

      <header className="ta-masthead">
        <span className="ta-kicker">Theological Heritage &amp; Foundations</span>
        <h1>
          The Tough Questions <em>Archive</em>
        </h1>
        {/* GEO: a single lede paragraph an answer engine can lift verbatim */}
        <p className="ta-lede">
          Answers to {STATS.toughCount} of the hardest questions in Christian theology — each set out in English, Urdu,
          Hindi and Arabic, then answered from five traditions: Catholic, Orthodox, Protestant, Anglican and
          Pentecostal. Alongside them sits a book-by-book archive of {STATS.archiveCount.toLocaleString()} study
          questions across {STATS.categoryCount} codices. All scripture is quoted from the Revised Version of
          1885&nbsp;/&nbsp;1895.
        </p>
        <dl className="ta-stats">
          <div><dt>{STATS.toughCount}</dt><dd>Tough Questions</dd></div>
          <div><dt>{STATS.archiveCount.toLocaleString()}</dt><dd>Archive Entries</dd></div>
          <div><dt>{STATS.denominationCount}</dt><dd>Traditions</dd></div>
          <div><dt>{STATS.languageCount}</dt><dd>Languages</dd></div>
          <div><dt>{STATS.regionalCount}</dt><dd>Pakistan / India Focus</dd></div>
        </dl>
      </header>

      <nav className="ta-tracks" aria-label="Archive sections">
        <button className={track === 'tough' ? 'on' : ''} onClick={() => setTrack('tough')} aria-pressed={track === 'tough'}>
          <span className="vol">Volume I</span>
          <b>The Hundred Tough Questions</b>
          <small>Four languages · five traditions · sourced quotation</small>
        </button>
        <button className={track === 'archive' ? 'on' : ''} onClick={() => setTrack('archive')} aria-pressed={track === 'archive'}>
          <span className="vol">Volume II</span>
          <b>Book-by-Book Scriptorium</b>
          <small>{STATS.archiveCount.toLocaleString()} entries · {STATS.categoryCount} codices</small>
        </button>
      </nav>

      {track === 'tough'
        ? <ToughTrack focusSlug={focusKind === 'question' ? focusSlug : undefined} />
        : <ArchiveTrack focusSlug={focusKind === 'category' ? focusSlug : undefined} />}

      <footer className="ta-provenance">
        <h2>Sources &amp; Method</h2>
        <p>{PROVENANCE}</p>
      </footer>
    </div>
  );
}

/* ============================= VOLUME I ============================= */

function ToughTrack({ focusSlug }: { focusSlug?: string }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('freq');
  const [scope, setScope] = useState<'' | 't1' | 'pk'>('');
  const [lang, setLang] = useState<'all' | 'en' | 'ur' | 'hi' | 'ar'>('all');
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!focusSlug) return;
    const target = TOUGH_QUESTIONS.find((q) => q.slug === focusSlug);
    if (!target) return;
    setOpenIds(new Set([target.id]));
    const t = window.setTimeout(() => {
      document.getElementById(`q-${focusSlug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [focusSlug]);

  const toggle = useCallback((id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const visible = useMemo(() => {
    const m = makeMatcher(query);
    const filtered = TOUGH_QUESTIONS.filter((q) => {
      const scopeOk = !scope || (scope === 't1' && q.tier === 1) || (scope === 'pk' && q.region);
      return scopeOk && (!m || m(toughHaystack(q)));
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === 'freq') return a.tier - b.tier || a.id - b.id;
      if (sort === 'region') return (a.region ? 0 : 1) - (b.region ? 0 : 1) || a.tier - b.tier || a.id - b.id;
      if (sort === 'az') return a.q.toLowerCase().localeCompare(b.q.toLowerCase());
      return a.id - b.id;
    });
    return sorted;
  }, [query, sort, scope]);

  return (
    <section className="ta-track" aria-label="Tough questions">
      <div className="ta-bar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'Search words, phrases, or "exact sentence" …'}
          aria-label="Search tough questions"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} aria-label="Sort order">
          <option value="freq">Sort: Most Asked First</option>
          <option value="region">Sort: Most Asked in Pakistan / India</option>
          <option value="num">Sort: Reference Order</option>
          <option value="az">Sort: A – Z</option>
        </select>
        <select value={scope} onChange={(e) => setScope(e.target.value as '' | 't1' | 'pk')} aria-label="Filter scope">
          <option value="">All questions</option>
          <option value="t1">Most asked only</option>
          <option value="pk">Pakistan / India focus</option>
        </select>
        <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} aria-label="Language">
          <option value="all">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
        <button onClick={() => setOpenIds(new Set(visible.map((q) => q.id)))}>Expand all</button>
        <button onClick={() => setOpenIds(new Set())}>Collapse all</button>
        <span className="ta-hits">{visible.length} question{visible.length === 1 ? '' : 's'}</span>
      </div>

      {visible.length === 0 && <p className="ta-none">No question matches your search.</p>}

      <ol className="ta-qlist">
        {visible.map((q, i) => (
          <li key={q.id}>
            <article
              className={`ta-q${openIds.has(q.id) ? ' open' : ''}`}
              id={`q-${q.slug}`}
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3 className="ta-q-head">
                <button onClick={() => toggle(q.id)} aria-expanded={openIds.has(q.id)} aria-controls={`body-${q.id}`}>
                  <span className="ta-q-num">{String(i + 1).padStart(3, '0')}</span>
                  <span className="ta-q-text" itemProp="name">{q.q}</span>
                  <span className="ta-q-pills">
                    {q.region && <span className="pill pill-r">{q.region}</span>}
                    <span className={`pill pill-t${q.tier}`}>{TIER_LABEL[q.tier]}</span>
                  </span>
                  <span className="ta-chev" aria-hidden="true">▾</span>
                </button>
              </h3>

              {/* AEO/GEO: the direct answer is always in the DOM, even when collapsed,
                  so crawlers and answer engines can read it without executing clicks. */}
              <div
                className="ta-direct"
                itemProp="acceptedAnswer"
                itemScope
                itemType="https://schema.org/Answer"
                hidden={!openIds.has(q.id)}
              >
                <span className="ta-direct-label">Short answer</span>
                <p itemProp="text">{directAnswer(q)}</p>
              </div>

              <div id={`body-${q.id}`} className="ta-q-body" hidden={!openIds.has(q.id)}>
                <figure className="ta-scripture">
                  <figcaption>
                    {q.ref}<span>Revised Version · 1885/1895</span>
                  </figcaption>
                  <blockquote cite="https://en.wikipedia.org/wiki/Revised_Version">{q.rv}</blockquote>
                </figure>

                <h4 className="ta-lbl">Common Ground</h4>
                {/* These cards are already authored in all four languages, one per
                    line — the site-wide translator must leave them exactly as
                    written or an Urdu visitor would see the English line
                    machine-swapped into the Urdu line's place. */}
                {LANGUAGES.filter((l) => lang === 'all' || l.key === lang).map((l) => (
                  <p key={l.key} className="ta-lang" dir={l.dir} lang={l.key} translate="no" data-sp-notranslate="">
                    <span className="ta-lang-tag">{l.label}</span>
                    {q.common[l.key]}
                  </p>
                ))}

                <h4 className="ta-lbl">In Their Own Traditions</h4>
                <div className="ta-dens">
                  {q.views.map((v) => (
                    <details key={v.key} className="ta-den">
                      <summary>{DENOMINATIONS[v.key]}</summary>
                      <div className="ta-den-body">
                        <p>{v.summary}</p>
                        {v.detail && <p className="ta-den-detail" dangerouslySetInnerHTML={{ __html: v.detail }} />}
                        {v.quote && (
                          <blockquote className="ta-quote">
                            {v.quote.text}
                            <cite>{v.quote.cite}</cite>
                          </blockquote>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================= VOLUME II ============================= */

function ArchiveTrack({ focusSlug }: { focusSlug?: string }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [field, setField] = useState<'all' | 'q' | 'a' | 'r' | 'n'>('all');
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!focusSlug || !ARCHIVE_CATEGORIES.some((c) => c.slug === focusSlug)) return;
    setOpenCats(new Set([focusSlug]));
    const t = window.setTimeout(() => {
      document.getElementById(`cat-${focusSlug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [focusSlug]);

  const results = useMemo(() => {
    const m = makeMatcher(query);
    return ARCHIVE_CATEGORIES.map((c) => {
      if (cat && c.name !== cat) return { ...c, items: [] as typeof c.items };
      const items = c.items.filter((it) => {
        if (!m) return true;
        const text =
          field === 'q' ? it.q : field === 'a' ? it.a : field === 'r' ? it.ref : field === 'n' ? it.note ?? '' :
          `${it.q} ${it.a} ${it.ref} ${it.note ?? ''}`;
        return m(text);
      });
      return { ...c, items };
    }).filter((c) => c.items.length > 0);
  }, [query, cat, field]);

  const total = results.reduce((s, c) => s + c.items.length, 0);
  const searching = Boolean(query || cat);

  return (
    <section className="ta-track" aria-label="Book-by-book archive">
      <div className="ta-bar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'Search words, phrases, or "exact sentence" …'}
          aria-label="Search archive"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Codex">
          <option value="">All codices</option>
          {ARCHIVE_CATEGORIES.map((c) => (
            <option key={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={field} onChange={(e) => setField(e.target.value as typeof field)} aria-label="Search field">
          <option value="all">Search: everything</option>
          <option value="q">Search: questions only</option>
          <option value="a">Search: answers only</option>
          <option value="r">Search: scripture refs</option>
          <option value="n">Search: theology notes</option>
        </select>
        <button onClick={() => setOpenCats(new Set(ARCHIVE_CATEGORIES.map((c) => c.slug)))}>Expand codices</button>
        <button onClick={() => { setOpenCats(new Set()); setOpenItems(new Set()); }}>Collapse all</button>
        <span className="ta-hits">{total.toLocaleString()} entr{total === 1 ? 'y' : 'ies'}</span>
      </div>

      {total === 0 && <p className="ta-none">No entry matches your search.</p>}

      {results.map((c: ArchiveCategory) => {
        const open = openCats.has(c.slug) || searching;
        return (
          <section key={c.slug} className={`ta-cat${open ? ' open' : ''}`} id={`cat-${c.slug}`}>
            <h3 className="ta-cat-head">
              <button
                onClick={() =>
                  setOpenCats((p) => {
                    const n = new Set(p);
                    n.has(c.slug) ? n.delete(c.slug) : n.add(c.slug);
                    return n;
                  })
                }
                aria-expanded={open}
              >
                <span className="ta-cat-icon" aria-hidden="true">{CATEGORY_ICON[c.name] ?? '📘'}</span>
                <span className="ta-cat-name">{c.name}</span>
                <span className="ta-cat-count">{c.items.length}</span>
                <span className="ta-chev" aria-hidden="true">▾</span>
              </button>
            </h3>

            {open && (
              <ol className="ta-items">
                {c.items.map((it, idx) => {
                  const isOpen = openItems.has(it.id);
                  return (
                    <li key={it.id}>
                      <article className={`ta-item${isOpen ? ' open' : ''}`} id={`a-${it.slug}`}>
                        <h4>
                          <button
                            onClick={() =>
                              setOpenItems((p) => {
                                const n = new Set(p);
                                n.has(it.id) ? n.delete(it.id) : n.add(it.id);
                                return n;
                              })
                            }
                            aria-expanded={isOpen}
                          >
                            <span className="ta-item-n">{String(idx + 1).padStart(3, '0')}</span>
                            <span className="ta-item-q">{it.q}</span>
                            <span className="ta-chev" aria-hidden="true">▾</span>
                          </button>
                        </h4>
                        <div className="ta-item-body" hidden={!isOpen}>
                          <p className="ta-item-a">{it.a}</p>
                          <p className="ta-item-ref">{it.ref}</p>
                          {it.note && (
                            <aside className="ta-item-note">
                              <span>Deeper Theology</span>
                              {it.note}
                            </aside>
                          )}
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </section>
  );
}
