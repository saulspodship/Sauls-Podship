/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  type LangKey,
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
import { useSiteLang } from '../i18n/LanguageProvider';
import { toughTitle, TOUGH_TITLES } from '../data/theology/toughI18n';
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
   TOUGH_TITLES[q.id] ? Object.values(TOUGH_TITLES[q.id]).join(' ') : '',
   ...q.views.flatMap((v) => [v.summary, v.detail ?? '', v.quote?.text ?? '', v.quote?.cite ?? ''])].join(' ');

type SortMode = 'freq' | 'region' | 'num' | 'az';
type Track = 'tough' | 'archive';
type PageLang = 'all' | LangKey;

const RTL_KEYS: LangKey[] = ['ur', 'ar'];

/** Per-language masthead ledes (they embed live counts, so no dict lookup). */
const LEDES: Record<PageLang, string> = {
  all: `Answers to ${STATS.toughCount} of the hardest questions in Christian theology — each set out in English, Urdu,
          Hindi and Arabic, then answered from five traditions: Catholic, Orthodox, Protestant, Anglican and
          Pentecostal. Alongside them sits a book-by-book archive of ${STATS.archiveCount.toLocaleString()} study
          questions across ${STATS.categoryCount} codices. All scripture is quoted from the Revised Version of
          1885&nbsp;/&nbsp;1895.`,
  en: `Answers to ${STATS.toughCount} of the hardest questions in Christian theology — each set out in English, Urdu,
          Hindi and Arabic, then answered from five traditions: Catholic, Orthodox, Protestant, Anglican and
          Pentecostal. Alongside them sits a book-by-book archive of ${STATS.archiveCount.toLocaleString()} study
          questions across ${STATS.categoryCount} codices. All scripture is quoted from the Revised Version of
          1885&nbsp;/&nbsp;1895.`,
  ur: `مسیحی الہیات کے ${STATS.toughCount} مشکل ترین سوالوں کے جوابات — ہر سوال انگریزی، اردو، ہندی اور عربی میں، پھر پانچ روایات — کیتھولک، آرتھوڈوکس، پروٹسٹنٹ، انگلیکن اور پنتیکاسٹل — کے مطابق۔ ساتھ ہی کتاب بہ کتاب ${STATS.archiveCount.toLocaleString()} مطالعاتی سوالوں کا آرکائیو ${STATS.categoryCount} کوڈیکس میں۔ تمام آیات ۱۸۸۵/۱۸۹۵ء کی نظرِ ثانی شدہ نسخہ سے لی گئی ہیں۔`,
  hi: `ईसाई धर्मशास्त्र के ${STATS.toughCount} कठिनतम प्रश्नों के उत्तर — प्रत्येक प्रश्न अंग्रेज़ी, उर्दू, हिन्दी और अरबी में, फिर पाँच परंपराओं — कैथोलिक, ऑर्थोडॉक्स, प्रोटेस्टैंट, एंग्लिकन और पेंटेकोस्टल — के अनुसार। साथ में पुस्तक-वार ${STATS.archiveCount.toLocaleString()} अध्ययन प्रश्नों का अभिलेखागार ${STATS.categoryCount} कोडेक्स में। सभी वचन १८८५/१८९५ के संशोधित संस्करण से उद्धृत हैं।`,
  ar: `أجوبة عن ${STATS.toughCount} من أصعب أسئلة اللاهوت المسيحي — كل سؤال بالإنجليزية والأردية والهندية والعربية، ثم بإجابات من خمس تقليدات: الكاثوليك والأرثوذكس والبروتستانت والأنغليكان والخمسينيين. وإلى جانبها أرشيف فيه ${STATS.archiveCount.toLocaleString()} سؤالاً دراسياً سفراً بسفر في ${STATS.categoryCount} مخطوطة. جميع الآيات مقتبسة من النسخة المنقحة ١٨٨٥/١٨٩٥.`,
};

/** "{n} questions" in the page languages. */
const countLabel = (n: number, lang: PageLang): string => {
  if (lang === 'ur') return `${n.toLocaleString('ur-PK')} سوالات`;
  if (lang === 'hi') return `${n.toLocaleString('en-IN')} प्रश्न`;
  if (lang === 'ar') return `${n.toLocaleString('ar-EG')} سؤالاً`;
  return `${n.toLocaleString('en-US')} question${n === 1 ? '' : 's'}`;
};

const entryLabel = (n: number, lang: PageLang): string => {
  if (lang === 'ur') return `${n.toLocaleString('ur-PK')} اندراجات`;
  if (lang === 'hi') return `${n.toLocaleString('en-IN')} प्रविष्टियाँ`;
  if (lang === 'ar') return `${n.toLocaleString('ar-EG')} مدخلاً`;
  return `${n.toLocaleString('en-US')} entr${n === 1 ? 'y' : 'ies'}`;
};

export default function TheologicalArchivePage() {
  const [track, setTrack] = useState<Track>('tough');
  const { t, lang: siteLang, setLang: setSiteLang } = useSiteLang();

  // The page's content-language filter follows the site-wide language (and
  // writes back to it — one choice, whole website).
  const [lang, setLang] = useState<PageLang>(() => (siteLang === 'en' ? 'all' : siteLang));
  useEffect(() => { setLang(siteLang === 'en' ? 'all' : siteLang); }, [siteLang]);
  const changeLang = useCallback((l: PageLang) => {
    setLang(l);
    setSiteLang(l === 'all' ? 'en' : l);
  }, [setSiteLang]);

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
      <Seo meta={indexMeta} jsonLd={jsonLd} />

      <header className="ta-masthead">
        <span className="ta-kicker">{t('Theological Heritage & Foundations')}</span>
        <h1>
          {t('The Tough Questions')} <em>{t('Archive')}</em>
        </h1>
        {/* GEO: a single lede paragraph an answer engine can lift verbatim */}
        <p className="ta-lede">{LEDES[lang]}</p>
        <dl className="ta-stats">
          <div><dt>{STATS.toughCount}</dt><dd>{t('Tough Questions')}</dd></div>
          <div><dt>{STATS.archiveCount.toLocaleString()}</dt><dd>{t('Archive Entries')}</dd></div>
          <div><dt>{STATS.denominationCount}</dt><dd>{t('Traditions')}</dd></div>
          <div><dt>{STATS.languageCount}</dt><dd>{t('Languages')}</dd></div>
          <div><dt>{STATS.regionalCount}</dt><dd>{t('Pakistan / India Focus')}</dd></div>
        </dl>
      </header>

      <nav className="ta-tracks" aria-label="Archive sections">
        <button className={track === 'tough' ? 'on' : ''} onClick={() => setTrack('tough')} aria-pressed={track === 'tough'}>
          <span className="vol">{t('Volume I')}</span>
          <b>{t('The Hundred Tough Questions')}</b>
          <small>{t('Four languages · five traditions · sourced quotation')}</small>
        </button>
        <button className={track === 'archive' ? 'on' : ''} onClick={() => setTrack('archive')} aria-pressed={track === 'archive'}>
          <span className="vol">{t('Volume II')}</span>
          <b>{t('Book-by-Book Scriptorium')}</b>
          <small>
            {lang === 'ur' && `${STATS.archiveCount.toLocaleString('ur-PK')} اندراجات · ${STATS.categoryCount} کوڈیکس`}
            {lang === 'hi' && `${STATS.archiveCount.toLocaleString('en-IN')} प्रविष्टियाँ · ${STATS.categoryCount} कोडेक्स`}
            {lang === 'ar' && `${STATS.archiveCount.toLocaleString('ar-EG')} مدخلاً · ${STATS.categoryCount} مخطوطة`}
            {(lang === 'all' || lang === 'en') && `${STATS.archiveCount.toLocaleString()} entries · ${STATS.categoryCount} codices`}
          </small>
        </button>
      </nav>

      {track === 'tough'
        ? <ToughTrack lang={lang} setLang={changeLang} />
        : <ArchiveTrack lang={lang} />}

      <footer className="ta-provenance">
        <h2>{t('Sources & Method')}</h2>
        <p>{PROVENANCE}</p>
      </footer>
    </div>
  );
}

/* ============================= VOLUME I ============================= */

function ToughTrack({ lang, setLang }: { lang: PageLang; setLang: (l: PageLang) => void }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('freq');
  const [scope, setScope] = useState<'' | 't1' | 'pk'>('');
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const titleLang: LangKey = lang === 'all' ? 'en' : lang;
  const titleRtl = RTL_KEYS.includes(titleLang);

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
        <select value={lang} onChange={(e) => setLang(e.target.value as PageLang)} aria-label="Language">
          <option value="all">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
        <button onClick={() => setOpenIds(new Set(visible.map((q) => q.id)))}>Expand all</button>
        <button onClick={() => setOpenIds(new Set())}>Collapse all</button>
        <span className="ta-hits">{countLabel(visible.length, lang)}</span>
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
                  <span className="ta-q-text" itemProp="name">
                    <span dir={titleRtl ? 'rtl' : 'ltr'} lang={titleLang === 'en' ? undefined : titleLang}>
                      {toughTitle(q.id, q.q, titleLang)}
                    </span>
                    {lang !== 'all' && lang !== 'en' && <small className="ta-q-orig">{q.q}</small>}
                  </span>
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
                <p
                  itemProp="text"
                  dir={RTL_KEYS.includes(lang === 'all' ? 'en' : lang) ? 'rtl' : 'ltr'}
                  lang={lang === 'all' || lang === 'en' ? undefined : lang}
                >
                  {lang === 'all' ? directAnswer(q) : q.common[lang]}
                </p>
              </div>

              <div id={`body-${q.id}`} className="ta-q-body" hidden={!openIds.has(q.id)}>
                <figure className="ta-scripture">
                  <figcaption>
                    {q.ref}<span>Revised Version · 1885/1895</span>
                  </figcaption>
                  <blockquote cite="https://en.wikipedia.org/wiki/Revised_Version">{q.rv}</blockquote>
                </figure>

                <h4 className="ta-lbl">Common Ground</h4>
                {LANGUAGES.filter((l) => lang === 'all' || l.key === lang).map((l) => (
                  <p key={l.key} className="ta-lang" dir={l.dir} lang={l.key}>
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

function ArchiveTrack({ lang }: { lang: PageLang }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [field, setField] = useState<'all' | 'q' | 'a' | 'r' | 'n'>('all');
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

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
        <span className="ta-hits">{entryLabel(total, lang)}</span>
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
