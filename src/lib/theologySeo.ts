/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToughQuestion } from '../data/theology/types';

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
    "isAccessibleForFree": true,
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
