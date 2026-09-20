/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Seo from '../components/theology/Seo';
import { TOUGH_QUESTIONS } from '../data/theology/tough';
import { DENOMINATIONS, LANGUAGES, TIER_LABEL } from '../data/theology/types';
import {
  ARCHIVE_BASE,
  questionMeta,
  questionFaqLd,
  scholarlyLd,
  breadcrumbLd,
} from '../lib/theologySeo';
import { applyPageMeta, SITE_URL } from '../lib/pageMeta';
import NotFoundPage from './NotFoundPage';
import './theological-archive.css';

/**
 * Permalink for a single tough question: /theological-archive/question/<slug>.
 * Fully expanded (no collapsed sections) so crawlers and answer engines read
 * the whole answer without interaction. Unknown slugs render a noindex 404.
 */
export default function TheologicalQuestionPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const idx = TOUGH_QUESTIONS.findIndex((q) => q.slug === slug.toLowerCase());
  const q = idx >= 0 ? TOUGH_QUESTIONS[idx] : undefined;

  const meta = useMemo(() => (q ? questionMeta(q) : null), [q]);
  const jsonLd = useMemo(
    () =>
      q && meta
        ? [
            questionFaqLd(q),
            scholarlyLd(meta),
            breadcrumbLd([
              { name: 'Home', url: '/' },
              { name: 'Theological Archive', url: ARCHIVE_BASE },
              { name: 'Tough Questions', url: `${ARCHIVE_BASE}#tough` },
              { name: q.q, url: `${ARCHIVE_BASE}/question/${q.slug}` },
            ]),
          ]
        : [],
    [q, meta],
  );

  if (!q || !meta) {
    // NotFoundPage applies its own noindex + title.
    return <NotFoundPage />;
  }

  const prev = idx > 0 ? TOUGH_QUESTIONS[idx - 1] : null;
  const next = idx < TOUGH_QUESTIONS.length - 1 ? TOUGH_QUESTIONS[idx + 1] : null;

  return (
    <div className="ta-root">
      <Seo meta={meta} jsonLd={jsonLd} image={`${SITE_URL}/icons/brand-logo.png`} />

      <nav className="ta-crumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link to={ARCHIVE_BASE}>Theological Archive</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`${ARCHIVE_BASE}#q-${q.slug}`}>Tough Questions</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{q.q}</span>
      </nav>

      <header className="ta-masthead">
        <span className="ta-kicker">Tough Question № {q.id} · {TIER_LABEL[q.tier]}</span>
        <h1>{q.q}</h1>
        <p className="ta-lede">{q.common.en}</p>
        <p className="ta-ref">
          Key text: <strong>{q.ref}</strong>
          {q.region && <span className="pill pill-r"> Most asked in {q.region}</span>}
        </p>
      </header>

      <article
        className="ta-q open ta-single"
        itemScope
        itemType="https://schema.org/Question"
      >
        <meta itemProp="name" content={q.q} />
        <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
          <meta itemProp="text" content={q.common.en} />
        </div>

        <figure className="ta-scripture">
          <figcaption>
            {q.ref}<span>Revised Version · 1885/1895</span>
          </figcaption>
          <blockquote cite="https://en.wikipedia.org/wiki/Revised_Version">{q.rv}</blockquote>
        </figure>

        <h2 className="ta-lbl">Common Ground — in four languages</h2>
        {LANGUAGES.map((l) => (
          <p key={l.key} className="ta-lang" dir={l.dir} lang={l.key}>
            <span className="ta-lang-tag">{l.label}</span>
            {q.common[l.key]}
          </p>
        ))}

        <h2 className="ta-lbl">In Their Own Traditions</h2>
        <div className="ta-dens">
          {q.views.map((v) => (
            <details key={v.key} className="ta-den" open>
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
      </article>

      <nav className="ta-pager" aria-label="More tough questions">
        {prev ? (
          <Link to={`${ARCHIVE_BASE}/question/${prev.slug}`} className="ta-pager-prev">
            <ChevronLeft aria-hidden="true" /> {prev.q}
          </Link>
        ) : <span />}
        <Link to={ARCHIVE_BASE} className="ta-pager-all">All 100 questions</Link>
        {next ? (
          <Link to={`${ARCHIVE_BASE}/question/${next.slug}`} className="ta-pager-next">
            {next.q} <ChevronRight aria-hidden="true" />
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
