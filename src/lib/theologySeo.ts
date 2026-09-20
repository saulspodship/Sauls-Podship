/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToughQuestion, ArchiveCategory } from '../data/theology/types';

export const ARCHIVE_BASE = '/theological-archive';

export const SITE = {
  name: "Saul's Podship",
  author: "Solat Nadeem",
  twitter: "@TheSaulsPodship",
  url: "https://www.saulspodship.com",
};

export const STATS = {
  toughCount: 100,
  archiveCount: 1000,
  categoryCount: 11,
  denominationCount: 5,
  languageCount: 4,
  regionalCount: 20,
};

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
}

export const indexMeta: PageMeta = {
  title: "100 Tough Bible Questions & 1000 Answers | Saul's Podship",
  description: "Complete text index of 100 tough theology questions and 1000 book-by-book Bible study answers, in English, Urdu, Hindi and Arabic across five Christian traditions.",
  canonical: "https://www.saulspodship.com/theological-archive",
  keywords: ["tough bible questions", "christian theology", "apologetics", "revised version", "pakistan", "india", "punjabi zaboor"],
};

export const PROVENANCE = "Compiled and edited by Solat Nadeem for Saul's Podship. All biblical quotations are verbatim from the Revised Version (1885/1895). Denominational summaries reflect official formularies, catechisms, and ecumenical consensus documents.";

export function directAnswer(q: ToughQuestion): string {
  return q.common.en;
}

export function faqPageLd(questions: ToughQuestion[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.common.en,
      },
    })),
  };
}

export function scholarlyLd(meta: PageMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": meta.title,
    "description": meta.description,
    "author": { "@type": "Person", "name": SITE.author },
    "publisher": { "@type": "Organization", "name": SITE.name },
    "isAccessibleForFree": "true",
  };
}

/** Permalink meta for one tough question: /theological-archive/question/<slug> */
export function questionMeta(q: ToughQuestion): PageMeta {
  const short = q.common.en.length > 150 ? `${q.common.en.slice(0, 147)}…` : q.common.en;
  return {
    title: `${q.q} | Tough Bible Questions | Saul's Podship`,
    description: `${q.q} — ${short} Answered from Catholic, Orthodox, Protestant, Anglican and Pentecostal traditions, in English, Urdu, Hindi and Arabic.`,
    canonical: `${SITE.url}${ARCHIVE_BASE}/question/${q.slug}`,
    keywords: [q.q.toLowerCase(), 'tough bible questions', 'christian theology', 'apologetics', q.ref],
  };
}

/** Permalink meta for one book-by-book codex: /theological-archive/category/<slug> */
export function categoryMeta(c: ArchiveCategory): PageMeta {
  return {
    title: `${c.name} — Bible Study Questions & Answers | Saul's Podship`,
    description: `${c.items.length} book-by-book Bible study questions on ${c.name} with concise answers and scripture references, from the Saul's Podship theological archive.`,
    canonical: `${SITE.url}${ARCHIVE_BASE}/category/${c.slug}`,
    keywords: [c.name.toLowerCase(), 'bible study questions', 'bible answers', 'scripture study'],
  };
}

/** Full-question FAQ JSON-LD: the five tradition summaries as parallel answers. */
export function questionFaqLd(q: ToughQuestion) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.common.en,
        },
        suggestedAnswer: q.views.map((v) => ({
          '@type': 'Answer',
          text: `${v.summary}${v.detail ? ` ${v.detail}` : ''}`,
        })),
      },
    ],
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE.url}${item.url}`,
    })),
  };
}
