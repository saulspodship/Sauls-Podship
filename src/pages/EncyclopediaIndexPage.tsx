/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, ArrowUpDown, ChevronRight, 
  ExternalLink, Play, Calendar, ShieldCheck, Layers, Globe2
, Network} from 'lucide-react';
import { VOLUME_INDEX as VOLUMES } from '../data/volumes/index-lite';

export const EncyclopediaIndexPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'number' | 'title'>('number');

  const categories = [
    { id: 'all', label: 'All 51 Volumes', count: VOLUMES.length },
    { id: 'scholarly', label: 'Scholarly Exegesis', count: VOLUMES.filter(v => v.category === 'scholarly').length },
    { id: 'history', label: 'Historical Theology', count: VOLUMES.filter(v => v.category === 'history').length },
    { id: 'devotional', label: 'Devotional & Spiritual', count: VOLUMES.filter(v => v.category === 'devotional').length },
    { id: 'reference', label: 'Reference & Canonical', count: VOLUMES.filter(v => v.category === 'reference').length },
  ];

  const filteredVolumes = useMemo(() => {
    return VOLUMES.filter((v) => {
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        v.title.toLowerCase().includes(q) ||
        v.subtitle.toLowerCase().includes(q) ||
        v.overview.toLowerCase().includes(q) ||
        v.keywords.some(k => k.toLowerCase().includes(q)) ||
        `volume ${v.number}`.includes(q) ||
        `vol ${v.number}`.includes(q);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return a.number - b.number;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#1A0812] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812] shadow-md">
            <BookOpen className="w-4 h-4" />
            Complete Scriptorium Catalog
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            51-Volume Theological Encyclopedia
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed font-light">
            Peer-reviewed doctrinal treatises, linguistic exegesis in Hebrew, Greek, and Aramaic, comparative canonical tables, historical timelines, and complete scriptural references.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-[#4A152C]/10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by topic, scripture, title, or volume number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A152C] focus:ring-1 focus:ring-[#4A152C] text-sm text-gray-800"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-gray-500 font-medium">Sort by:</span>
              <button
                onClick={() => setSortBy(sortBy === 'number' ? 'title' : 'number')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortBy === 'number' ? 'Volume Number (1-51)' : 'Alphabetical Title'}</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#4A152C] text-[#E8C96A] shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companion Interactive Modules — standalone static pages that extend the corpus */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-3xl bg-[#1A0812] border-2 border-[#D4AF37]/40 shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-[#E8C96A]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E8C96A]">Companion Modules</span>
          </div>
          <p className="text-center text-xs text-white/60 mb-6 max-w-xl mx-auto">
            Interactive charts woven from the same scholarship as the 51 volumes — open them alongside any volume.
          </p>
          <div className="mx-auto flex max-w-4xl flex-wrap items-stretch justify-center gap-5">
            <a
              href="/prophecy-map"
              className="group flex w-full items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 p-5 transition-all md:w-[calc(50%-10px)]"
            >
              <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#4A152C] border border-[#D4AF37]/40 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-[#E8C96A]" />
              </span>
              <span className="flex-1 text-left">
                <span className="block font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors leading-snug">
                  Biblical Prophecy Map — 247 Threads
                </span>
                <span className="block text-[11px] text-white/55 mt-0.5">
                  Fulfilled, in-part &amp; future on a rotatable 3D globe, every link to bible.com
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#E8C96A] flex-shrink-0" />
            </a>
            <a
              href="/cross-references"
              className="group flex w-full items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 p-5 transition-all md:w-[calc(50%-10px)]"
            >
              <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#4A152C] border border-[#D4AF37]/40 flex items-center justify-center">
                <Network className="w-5 h-5 text-[#E8C96A]" />
              </span>
              <span className="flex-1 text-left">
                <span className="block font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors leading-snug">
                  The Interlinked Bible &mdash; 344,799 Threads
                </span>
                <span className="block text-[11px] text-white/55 mt-0.5">
                  Every cross-reference woven into one interactive horseshoe, plus a world faith map
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#E8C96A] flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Showing {filteredVolumes.length} of 51 Volumes
          </p>
        </div>

        {filteredVolumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">No Volumes Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              No encyclopedia volumes matched your query "{searchQuery}". Try searching for another topic or reset your filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-[#4A152C] text-[#E8C96A] text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVolumes.map((volume) => {
              const numPadded = volume.number < 10 ? `0${volume.number}` : `${volume.number}`;
              // Thumbnail = the volume's own curated hero artwork (identical photo used
              // as the full-bleed hero background on the volume page), served in the
              // lightweight 1280 webp variant. Legacy remote cardImage only as fallback.
              const heroBase = volume.heroImage?.src?.replace(/hero-1920\.jpg$/, 'hero-1280.webp');
              const cardImg = (volume.cardImage?.src?.includes('/images/volumes/') ? volume.cardImage.src : (heroBase && heroBase.includes('/images/volumes/') ? heroBase : (volume.cardImage?.src || volume.heroImage?.src)));
              return (
                <article
                  key={volume.id}
                  className="group relative cursor-pointer flex flex-col rounded-2xl bg-white border border-[#4A152C]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={cardImg}
                      alt={volume.heroImage?.alt || volume.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#1A0812]/90 text-[#D4AF37] backdrop-blur-md shadow-md">
                      Vol. {numPadded}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/90 text-[#4A152C] shadow-sm">
                      {volume.category}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-serif font-bold text-xl text-[#1D2D50] group-hover:text-[#4A152C] transition-colors mb-2 leading-snug">
                        {volume.title}
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {volume.summary || volume.overview}
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{volume.content?.tables?.length || 0} Data Tables</span>
                        <span>{volume.faq?.length || 0} FAQs</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          {volume.articleLink && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Article Live
                            </span>
                          )}
                          {volume.youtubeLink && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              Video Ready
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/encyclopedia/${volume.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#4A152C] group-hover:text-[#8B1C2E] hover:underline after:absolute after:inset-0 after:content-['']"
                        >
                          <span>Open Volume</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EncyclopediaIndexPage;
