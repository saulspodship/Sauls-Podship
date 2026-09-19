/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ExternalLink } from 'lucide-react';
import { VOLUME_INDEX as VOLUMES } from '../data/volumes/index-lite';
import { NAV_GROUPS, isOffSite } from '../config/nav';

export const SitemapPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FDFBF7]">
      <section className="bg-[#1A0812] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            <Compass className="w-4 h-4" />
            Index of Scriptorium Records
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            HTML Site Directory &amp; Sitemap
          </h1>
          <p className="text-xs sm:text-sm text-white/70">Complete structured directory of all 51 theological volumes and ministry pages.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-800">
        {/* Site families — the same five groups the header dropdowns use,
            so this page and the navigation can never drift apart. */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#4A152C] border-b border-gray-100 pb-2">
            Primary Navigation
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link to="/" className="bg-[#4A152C] text-white p-5 rounded-2xl flex items-center justify-between hover:bg-[#8B1C2E] transition-colors">
              <span className="text-sm font-bold">Home &amp; Hero</span>
              <span className="text-[10px] uppercase tracking-widest text-[#E8C96A]">Start</span>
            </Link>
            <Link to="/encyclopedia" className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between hover:border-[#D4AF37] transition-colors">
              <span className="text-sm font-bold text-[#4A152C]">51-Volume Encyclopedia Catalog</span>
              <BookOpen className="w-4 h-4 text-[#8B1C2E]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {NAV_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                  <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#4A152C] border-b border-gray-100 pb-2">
                    <Icon className="w-4 h-4 text-[#8B1C2E]" />
                    {group.label}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-gray-500 font-semibold">{group.kicker}</p>
                  <div className="mt-4 space-y-4">
                    {group.sections.map((section) => (
                      <div key={section.heading}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-1.5">{section.heading}</p>
                        <ul className="space-y-1.5 text-sm">
                          {section.items.map((item) => (
                            <li key={item.href + item.label}>
                              {item.kind === 'external' || isOffSite(item.href) ? (
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-start gap-1.5 text-[#4A152C] hover:underline font-semibold"
                                >
                                  <span>{item.label}</span>
                                  <ExternalLink className="w-3 h-3 mt-1 opacity-60" />
                                </a>
                              ) : item.kind === 'static' ? (
                                // real files under /public — full page load, not a router navigation
                                <a href={item.href} className="text-[#4A152C] hover:underline font-semibold">
                                  {item.label}
                                </a>
                              ) : (
                                <Link to={item.href} className="text-[#4A152C] hover:underline font-semibold">
                                  {item.label}
                                </Link>
                              )}
                              {item.tag && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.tag}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* All 51 Volumes */}
        <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#4A152C] border-b border-gray-100 pb-2">
            The 51 Encyclopedia Volumes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {VOLUMES.map((v) => (
              <Link
                key={v.id}
                to={`/encyclopedia/${v.slug}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#4A152C]"
              >
                <span className="font-bold text-[#8B1C2E]">Vol. {v.number < 10 ? `0${v.number}` : v.number}</span>
                <span className="truncate flex-1 ml-2 font-medium">{v.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SitemapPage;
