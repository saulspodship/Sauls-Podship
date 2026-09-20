/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/theology/Seo';
import { ARCHIVE_CATEGORIES } from '../data/theology/archive';
import { CATEGORY_ICON } from '../data/theology/types';
import {
  ARCHIVE_BASE,
  categoryMeta,
  faqPageLd,
  scholarlyLd,
  breadcrumbLd,
} from '../lib/theologySeo';
import { SITE_URL } from '../lib/pageMeta';
import NotFoundPage from './NotFoundPage';
import './theological-archive.css';

/**
 * Permalink for one book-by-book codex: /theological-archive/category/<slug>.
 * Every entry is rendered expanded so crawlers read the full text.
 * Unknown slugs render a noindex 404.
 */
export default function TheologicalCategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const cat = ARCHIVE_CATEGORIES.find((c) => c.slug === slug.toLowerCase());

  const meta = useMemo(() => (cat ? categoryMeta(cat) : null), [cat]);
  const jsonLd = useMemo(
    () =>
      cat && meta
        ? [
            faqPageLd(
              cat.items.slice(0, 100).map((it, i) => ({
                id: i,
                slug: it.slug,
                q: it.q,
                tier: 2 as const,
                ref: it.ref,
                rv: '',
                common: { en: it.a, ur: '', hi: '', ar: '' },
                views: [],
              })),
            ),
            scholarlyLd(meta),
            breadcrumbLd([
              { name: 'Home', url: '/' },
              { name: 'Theological Archive', url: ARCHIVE_BASE },
              { name: 'Book-by-Book Scriptorium', url: ARCHIVE_BASE },
              { name: cat.name, url: `${ARCHIVE_BASE}/category/${cat.slug}` },
            ]),
          ]
        : [],
    [cat, meta],
  );

  if (!cat || !meta) {
    // NotFoundPage applies its own noindex + title.
    return <NotFoundPage />;
  }

  return (
    <div className="ta-root">
      <Seo meta={meta} jsonLd={jsonLd} image={`${SITE_URL}/icons/brand-logo.png`} />

      <nav className="ta-crumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link to={ARCHIVE_BASE}>Theological Archive</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{cat.name}</span>
      </nav>

      <header className="ta-masthead">
        <span className="ta-kicker">Book-by-Book Scriptorium · Codex</span>
        <h1>
          <span aria-hidden="true">{CATEGORY_ICON[cat.name] ?? '📘'} </span>
          {cat.name}
        </h1>
        <p className="ta-lede">
          {cat.items.length} study questions with concise answers and scripture
          references — part of the 1,000-entry book-by-book archive.
        </p>
      </header>

      <section className="ta-cat open" aria-label={cat.name}>
        <ol className="ta-items">
          {cat.items.map((it, idx) => (
            <li key={it.id}>
              <article
                className="ta-item open"
                id={`a-${it.slug}`}
                itemScope
                itemType="https://schema.org/Question"
              >
                <h2 className="ta-item-head">
                  <span className="ta-item-n">{String(idx + 1).padStart(3, '0')}</span>
                  <span className="ta-item-q" itemProp="name">{it.q}</span>
                </h2>
                <div
                  className="ta-item-body"
                  itemProp="acceptedAnswer"
                  itemScope
                  itemType="https://schema.org/Answer"
                >
                  <p className="ta-item-a" itemProp="text">{it.a}</p>
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
          ))}
        </ol>
      </section>

      <nav className="ta-pager" aria-label="More codices">
        <Link to={ARCHIVE_BASE} className="ta-pager-all">Back to the full archive</Link>
      </nav>

      <section className="ta-cats" aria-label="All codices">
        {ARCHIVE_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
          <Link key={c.slug} to={`${ARCHIVE_BASE}/category/${c.slug}`} className="ta-cat-link">
            <span aria-hidden="true">{CATEGORY_ICON[c.name] ?? '📘'}</span> {c.name}
            <small>{c.items.length} entries</small>
          </Link>
        ))}
      </section>
    </div>
  );
}
