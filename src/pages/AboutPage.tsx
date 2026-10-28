/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Award, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ABOUT_DIRECTORY_INTRO, ABOUT_META, PODSHIP_APPS, aboutPageSchema } from '../data/about';
import { usePageMetadata } from '../lib/usePageMetadata';

const structuredData = JSON.stringify(aboutPageSchema()).replace(/</g, '\\u003c');

export const AboutPage: React.FC = () => {
  usePageMetadata(ABOUT_META);

  return (
    <div className="w-full bg-[#FDFBF7]">
      <script id="sp-about-apps-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      {/* Hero Section */}
      <section className="bg-[#1A0812] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            <BookOpen className="w-4 h-4" />
            Our Heritage &amp; Mission
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            About Saul's Podship Scriptorium
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
            Dedicated to scholarly biblical exegesis, historic Christian theology, and the preservation of indigenous South Asian hymnody.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-800">
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C]">
            The Scriptorium Vision
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif font-light">
            Saul's Podship was established as an open-access digital scriptorium. In an era of soundbite theology, we labor to restore depth, historic grounding, and rigorous linguistic exegesis to the study of the Holy Scriptures.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            Our encyclopedia spans 51 comprehensive volumes authored with academic discipline, cross-referencing Hebrew, Greek, and Aramaic manuscripts with the ecumenical creeds and historical councils of the church.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#8B1C2E] mb-3" />
            <h3 className="font-serif font-bold text-lg text-[#4A152C] mb-2">Expository Rigor</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every doctrine is evaluated under grammatical-historical hermeneutics, prioritizing original linguistic intent over modern eisegesis.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Globe className="w-8 h-8 text-[#8B1C2E] mb-3" />
            <h3 className="font-serif font-bold text-lg text-[#4A152C] mb-2">Global &amp; Indigenous</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Preserving the sacred heritage of the South Asian church, including the poetic 150 Punjabi Zaboor and historical Christian archives.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Award className="w-8 h-8 text-[#8B1C2E] mb-3" />
            <h3 className="font-serif font-bold text-lg text-[#4A152C] mb-2">Open Scriptorium</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              All 51 volumes, audio lectures, data tables, and study materials remain completely free and accessible for worldwide research.
            </p>
          </div>
        </section>

        <section aria-labelledby="podship-family-title" className="relative overflow-hidden rounded-3xl bg-[#1A0812] p-5 sm:p-8 lg:p-10 text-white shadow-xl">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full border border-[#D4AF37]/15" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#E8C96A]">
                One ministry &middot; many ways to explore
              </p>
              <h2 id="podship-family-title" className="mt-3 font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Explore the Podship family
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/75">
                {ABOUT_DIRECTORY_INTRO}
              </p>
            </div>
            <div className="hidden sm:block shrink-0 border-l border-[#D4AF37]/40 pl-5 text-left">
              <span className="block font-serif text-4xl leading-none text-[#E8C96A]">{String(PODSHIP_APPS.length).padStart(2, '0')}</span>
              <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Dedicated apps</span>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PODSHIP_APPS.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-w-0 flex-col rounded-2xl border border-[#E7DDCA] bg-[#FFFEFB] p-5 text-left text-gray-800 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E8C96A]"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={app.logo}
                    alt={`${app.name} logo`}
                    width="72"
                    height="72"
                    loading="lazy"
                    className="h-14 w-14 sm:h-[72px] sm:w-[72px] shrink-0 rounded-xl bg-[#F8F4E3] object-contain"
                  />
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8B6B28]">{app.category}</p>
                    <h3 className="mt-2 font-serif text-lg sm:text-xl font-bold leading-tight text-[#4A152C]">{app.name}</h3>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#8B6B28] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-gray-600">{app.description}</p>
                <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#EEE6D8] pt-4">
                  <span className="min-w-0 break-all text-xs font-semibold leading-relaxed text-[#6B4351]">{new URL(app.url).hostname}</span>
                  <span className="shrink-0 text-xs font-bold text-[#4A152C]">Visit <span aria-hidden="true">&rarr;</span></span>
                </div>
                <span className="sr-only">Opens in a new tab</span>
              </a>
            ))}
          </div>
          <p className="relative mt-5 text-xs leading-relaxed text-white/55">
            Each app opens on its own Saul's Podship subdomain.
          </p>
        </section>

        <section className="bg-[#4A152C] text-white p-8 sm:p-10 rounded-3xl shadow-md space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#E8C96A]">
            Explore the Encyclopedia
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Discover all 51 volumes covering Systematic Theology, Messianic Prophecies, Biblical Numerology, the Book of Revelation, and the Five Offerings of Leviticus.
          </p>
          <div className="pt-2">
            <Link
              to="/encyclopedia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#1A0812] font-bold text-xs shadow-md"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
