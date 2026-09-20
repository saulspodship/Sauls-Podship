/**
 * Routed home pages for the standalone interactive modules.
 * Each gives a module its own page identity (URL, title, hero band) inside the
 * shared site chrome (RootLayout header/footer), embedding the verified static
 * module document in an iframe — same isolation pattern as /comparative-apologetics.
 */
import React from 'react';
import AutoFrame from '../components/modules/AutoFrame';
import { usePageMeta, SITE_URL } from '../lib/pageMeta';

interface ModuleMeta {
  kicker: string;
  title: string;
  blurb: string;
  src: string;
  hero: string;
  path: string;
  description: string;
  keywords: string[];
}

const makeModulePage = (meta: ModuleMeta): React.FC => {
  const Page: React.FC = () => {
    usePageMeta({
      title: `${meta.title} | Saul's Podship`,
      description: meta.description,
      keywords: meta.keywords,
      path: meta.path,
      image: `${SITE_URL}${meta.hero}`,
      ogType: 'website',
    });
    return (
      <div className="w-full">
        <section data-hero={meta.hero} className="py-14 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
              {meta.kicker}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:5xl font-bold tracking-tight text-white mt-4">
              {meta.title}
            </h1>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mt-3 font-light">
              {meta.blurb}
            </p>
          </div>
        </section>
        <section className="py-8 bg-[#F8F4E3]">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <AutoFrame src={meta.src} title={`${meta.title} — interactive module`} />
          </div>
        </section>
      </div>
    );
  };
  return Page;
};

export const ProphecyMapPage = makeModulePage({
  kicker: 'A Saul\u2019s Podship Study \u00b7 Prophetic Fulfilment Atlas',
  title: 'Biblical Prophecy Map — 247 Prophecies Charted',
  blurb: '247 biblical prophecies \u2014 107 fulfilled, 88 in part, 52 still awaiting \u2014 woven together by 1,063 cross-references on a rotatable 3D globe. Every thread opens the passage on bible.com.',
  src: '/prophecy-map.html',
  hero: '/images/hero-prophecy.jpg',
  path: '/prophecy-map',
  description: '247 biblical prophecies — fulfilled, partly fulfilled and still future — woven by 1,063 cross-references on a rotatable 3D globe. Every thread opens on bible.com.',
  keywords: ['bible prophecy map', 'fulfilled prophecy', 'messianic prophecies', 'prophecy timeline'],
});

export const KingsOfTheBiblePage = makeModulePage({
  kicker: 'A Saul\u2019s Podship Study \u00b7 Royal Chronology',
  title: 'Kings of the Bible — Every Throne in Order',
  blurb: 'Every throne from Saul to the Herods in canonical order \u2014 reign lengths, synchronisms, wars and prophetic witness charted line by line.',
  src: '/kings-of-the-bible.html',
  hero: '/images/hero-jesus-alpha-omega.jpg',
  path: '/kings-of-the-bible',
  description: 'Every throne in the Bible in canonical order — from Jesus the King of Kings through Saul, David, the Herods to the last king — with reigns and prophets.',
  keywords: ['kings of the bible', 'kings of Israel and Judah', 'biblical chronology'],
});

export const CrossReferencesPage = makeModulePage({
  kicker: 'A Saul\u2019s Podship Study \u00b7 Visual Concordance',
  title: 'Interlinked Bible — 344,799 Cross-References',
  blurb: 'Every cross-reference in Scripture woven into one interactive horseshoe: 66 books, 1,189 chapters, 190,758 chapter-to-chapter links, with KJV drill-down and the OT \u2192 NT scarlet thread.',
  src: '/cross-references/viz.html',
  hero: '/images/hero-interlinked.jpg',
  path: '/cross-references',
  description: 'Every cross-reference in Scripture woven into one interactive chart: 66 books, 1,189 chapters, 190,758 chapter threads, with KJV drill-down.',
  keywords: ['bible cross references', 'scripture concordance', 'interlinked bible'],
});
