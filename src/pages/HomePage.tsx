/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Mic, Music, Sparkles, ShieldCheck, Video, ArrowRight, 
  Layers, Compass, ExternalLink, Calendar, CheckCircle2, ChevronRight, Network,
  Play, Award, Search, HelpCircle, FileText, Headphones, Users
} from 'lucide-react';
import Hero from '../components/Hero';
import ArchivePillarCard from '../components/theology/ArchivePillarCard';
import ComparativeApologeticsPillar from '../components/pillars/ComparativeApologeticsPillar';
import { VOLUME_INDEX as VOLUMES } from '../data/volumes/index-lite';
import ModuleSwitcher from '../components/modules/ModuleSwitcher';
import { EPISODES } from '../data/episodes';
import { PIONEERS_AND_SINGERS } from '../data/singers';
import { SITE } from '../config/site';
import { artUrl } from '../lib/artUrl';
import VideosRail from '../components/VideosRail';

export const HomePage: React.FC = () => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Highlight 6 featured or foundational volumes
  const featuredVolumes = activeCategoryFilter === 'all' 
    ? VOLUMES.slice(0, 6) 
    : VOLUMES.filter(v => v.category.toLowerCase() === activeCategoryFilter.toLowerCase()).slice(0, 6);

  const latestEpisode = EPISODES[0];
  const featuredSingers = PIONEERS_AND_SINGERS.slice(0, 4);

  return (
    <div className="w-full text-center">
      {/* 1. Shared Hero Banner (Last Supper with adjusted brightness & center-alignment) */}
      <Hero variant="home" />

      {/* 2. Scriptorium Overview / Purpose Banner - Centered */}
      <section className="py-16 bg-[#F8F4E3]/70 border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B1C2E]">
              Theological Heritage &amp; Foundations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A152C] mt-2">
              Seven Pillars of Saul's Podship Scriptorium
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mt-2 font-light">
              Rigorous biblical scholarship, sacred music preservation, classical hermeneutics, rigorous apologetic archives, comparative apologetics, and two interactive atlases — the prophecy map and the interlinked-Bible concordance — made freely accessible for believers and scholars worldwide.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 w-full *:w-full md:*:w-[calc(50%-1rem)] lg:*:w-[calc(33.333%-1.334rem)] xl:*:w-[calc(25%-1.5rem)]">
            <div className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">51 Academic Volumes</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                  Comprehensive biblical exegesis covering historical theology, Hebrew and Greek linguistic nuances, covenantal progression, and systematic doctrines.
                </p>
              </div>
              <Link to="/encyclopedia" className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">Indigenous Punjabi Zaboor</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                  The complete historical record of 150 biblical Psalms versified into Punjabi classical meters (Bahr) and the living archive of Pakistani gospel musicians.
                </p>
              </div>
              <Link to="/music/punjabi-zaboor" className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
                <span>Discover Zaboor History</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">Visual Bible Encyclopedia</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                  The video wing of the scriptorium — illustrated Bible video series,
                  documentary-style studies and visual walk-throughs of sacred history,
                  streamed from the Podship video library.
                </p>
              </div>
              <a href="/videos/" className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
                <span>Watch the Video Library</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <ArchivePillarCard />
            <ComparativeApologeticsPillar />

            <div className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">Biblical Prophecy Map</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                  247 prophecies — 107 fulfilled, 88 in part, 52 awaiting — woven by 1,063 cross-links on a rotatable 3D globe of sacred history.
                </p>
              </div>
              <Link to="/prophecy-map" className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
                <span>Open the Prophecy Atlas</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">The Interlinked Bible</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                  344,799 cross-references forming 190,758 chapter threads across all 66 books, woven into one interactive horseshoe chart.
                </p>
              </div>
              <Link to="/cross-references" className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
                <span>Weave the Cross-References</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2b. Interactive Modules — switch between the atlas, the throne line and the story collection */}
      <section className="py-20 bg-[#1A0812] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            <Compass className="w-3.5 h-3.5" />
            Interactive Modules
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-3">
            <span className="hidden lg:inline">Switch Between the Modules</span><span className="lg:hidden">Interactive Modules</span>
          </h2>
          <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl mt-3 font-light">
            <span className="hidden lg:inline">The prophecy atlas, the kings chronicle and the interlinked-Bible concordance —
            run them side by side without leaving this page, then open any of them on its own page.</span>
            <span className="lg:hidden">The prophecy atlas, the kings chronicle and the interlinked-Bible concordance —
            tap a module to open it on its own full page.</span>
          </p>
          <div className="mt-8 w-full">
            <ModuleSwitcher />
          </div>
        </div>
      </section>

      {/* 3. Encyclopedia Module Teaser - Centered */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B1C2E]">
            Authoritative Theological Corpus
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#4A152C] mt-2">
            The 51-Volume Scriptorium
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mt-2 font-light">
            Each volume features deep textual exegesis, comparative linguistic analysis, structured data tables, historical timelines, and peer-reviewed doctrine.
          </p>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {['all', 'narrative', 'christology', 'theology', 'reference', 'hymnology', 'apologetics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategoryFilter === cat
                    ? 'bg-[#4A152C] text-[#E8C96A] shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Teaser Cards Grid - Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-12">
          {featuredVolumes.map((vol) => {
            const num = vol.number < 10 ? `0${vol.number}` : `${vol.number}`;
            return (
              <div
                key={vol.id}
                className="group relative cursor-pointer flex flex-col rounded-3xl bg-white border border-[#4A152C]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                {/* Card Image — same curated artwork as the volume's hero banner */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={artUrl((vol.cardImage?.src?.includes('/images/volumes/') ? vol.cardImage.src : null) || (vol.heroImage?.src?.includes('/images/volumes/') ? vol.heroImage.src.replace(/hero-1920\.jpg$/, 'hero-1280.webp') : null) || vol.cardImage?.src || vol.heroImage?.src)}
                    alt={vol.heroImage?.alt || vol.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#1A0812]/90 text-[#D4AF37] backdrop-blur-md shadow-md">
                    Vol. {num}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/90 text-[#4A152C] shadow-sm">
                    {vol.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1D2D50] group-hover:text-[#4A152C] transition-colors mb-2">
                      {vol.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {vol.summary || vol.overview}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 w-full flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500">
                      {vol.content?.tables?.length || 0} Tables &bull; Peer-Reviewed
                    </span>
                    <Link
                      to={`/encyclopedia/${vol.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4A152C] group-hover:text-[#8B1C2E] after:absolute after:inset-0 after:content-['']"
                    >
                      Read Volume <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to="/encyclopedia"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#4A152C] hover:bg-[#681E3E] text-[#E8C96A] font-extrabold text-sm shadow-xl transition-all"
        >
          <span>Explore All 51 Volumes in Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Featured Scholarly Excerpts - Codex Extract - Centered */}
      <section className="py-20 bg-[#16060F] text-white border-y border-[#D4AF37]/30 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
              <BookOpen className="w-3.5 h-3.5" />
              Codex Extract
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E8C96A] mt-3">
              Featured Scholarly Excerpts
            </h2>
            <p className="text-sm text-white/70 mt-2 font-light max-w-xl mx-auto">
              Direct primary excerpts from the Saul's Podship theological corpus, integrating original Greek and Hebrew exegetical proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-center">
            {/* Excerpt 1: Vol 27 Jesus Is God */}
            <Link
              to="/encyclopedia/jesus-is-god-full-references-ot-nt"
              className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all flex flex-col items-center justify-between text-center relative backdrop-blur-sm"
            >
              <div className="space-y-4 flex flex-col items-center">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#4A152C] text-[#E8C96A] border border-[#D4AF37]/30">
                  Codex Extract &bull; Vol. 27
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#E8C96A] transition-colors">
                  Jesus Is God (Full References OT + NT)
                </h3>
                <blockquote className="text-xs sm:text-sm text-[#F8F4E3]/90 italic font-serif leading-relaxed text-center border-y border-white/10 py-4 my-2">
                  "In John 8:58, Jesus declared: 'Truly, truly, I say to you, before Abraham was, I am' (ἐγὼ εἰμί / egō eimi). The direct appropriation of the divine memorial name revealed to Moses at the burning bush (Exodus 3:14) establishes the ontological equality of the Son with the Father. Divine prerogatives—creation, forgiveness, judgment, and sovereign worship—belong exclusively to Yahweh, yet are attributed to Christ."
                </blockquote>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#E8C96A] group-hover:text-white transition-colors">
                <span>Examine Volume 27 Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Excerpt 2: Vol 12 Book of Revelation */}
            <Link
              to="/encyclopedia/book-of-revelation"
              className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all flex flex-col items-center justify-between text-center relative backdrop-blur-sm"
            >
              <div className="space-y-4 flex flex-col items-center">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#4A152C] text-[#E8C96A] border border-[#D4AF37]/30">
                  Codex Extract &bull; Vol. 12
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#E8C96A] transition-colors">
                  Book of Revelation (Apocalypse of John)
                </h3>
                <blockquote className="text-xs sm:text-sm text-[#F8F4E3]/90 italic font-serif leading-relaxed text-center border-y border-white/10 py-4 my-2">
                  "The Apocalypse is not primarily a cryptic calendar of catastrophe, but the climactic unveiling (ἀποκάλυψις / apokalypsis) of Jesus Christ as the slain yet reigning Lamb who has triumphed over chaos, death, and imperial idolatry. In Revelation 5:6, the Lamb stands in the midst of the divine throne with seven horns and seven eyes, possessing full sovereign power and universal omniscience, anchoring history in the certainty of the New Jerusalem."
                </blockquote>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#E8C96A] group-hover:text-white transition-colors">
                <span>Examine Volume 12 Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Podcast & Audio Masterclasses Section - Centered */}
      <section className="py-20 bg-[#1A0812] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8">
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
              <Mic className="w-3.5 h-3.5" />
              Urdu Audio Podcast · YouTube Video Masterclasses
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Saul's Podship Podcast
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed font-light">
              Two streams, one scriptorium: the Urdu audio podcast on RSS.com — one hard
              question per episode, answered from Scripture — and the English video
              masterclasses on YouTube, working through the covenants, the canon and the
              ancient Near Eastern background behind the text.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/podcast"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] font-bold text-sm shadow-md transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Listen to All Episodes</span>
            </Link>

            <a
              href={SITE.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm border border-red-400/40 shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Official YouTube Channel</span>
            </a>
          </div>

          {/* Featured Episode Card - Centered */}
          {latestEpisode && (
            <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-[#E8C96A]">Latest episode · Urdu audio podcast</div>
              <h3 className="urdu text-xl sm:text-2xl text-white leading-snug">{latestEpisode.title}</h3>
              <p className="text-[11px] font-semibold italic text-[#E8C96A]/90">{latestEpisode.titleRoman}</p>
              <p className="text-xs sm:text-sm text-white/70 line-clamp-3 leading-relaxed font-light">{latestEpisode.description}</p>
              <div className="flex items-center justify-between text-xs text-white/60 pt-4 border-t border-white/10 max-w-md mx-auto">
                <span>Duration: {latestEpisode.duration}</span>
                <Link to={`/podcast/${latestEpisode.slug}`} className="text-[#E8C96A] font-bold hover:underline flex items-center gap-1">
                  <span>Episode &amp; show notes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4.5 New from the Podship — YouTube video slider (data synced weekly) */}
      <VideosRail />

      {/* 5. Sacred Music & Punjabi Zaboor Archive Teaser - Centered */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B1C2E]">
            Historical Musicology &amp; Living Hymnody
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#4A152C] mt-2">
            Sacred Punjabi Zaboor &amp; Artists Archive
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mt-2 font-light">
            In 1908, missionary Imam-ud-Din Shahbaz versified all 150 biblical Psalms into classical Punjabi meters. Explore the complete meter directory, sheet music, audio renditions, and Pakistani gospel vocalists.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Link
              to="/music/punjabi-zaboor"
              className="px-6 py-3 rounded-xl bg-[#4A152C] hover:bg-[#681E3E] text-[#E8C96A] font-bold text-xs shadow-md"
            >
              Explore 150 Punjabi Zaboor
            </Link>
            <Link
              to="/music/pakistani-singers-archive"
              className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#1D2D50] font-semibold text-xs border border-gray-300 shadow-sm"
            >
              Pakistani Gospel Singers Archive
            </Link>
          </div>
        </div>

        {/* 4 Singers Spotlight Grid - Centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {featuredSingers.map((singer) => (
            <div
              key={singer.id}
              className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-[#D4AF37]/40 bg-[#1A0812] flex items-center justify-center text-[#E8C96A] shadow-md">
                <Music className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-gray-900">{singer.name}</h3>
              <p className="text-xs text-[#8B1C2E] font-medium mb-2">{singer.role || "Gospel Vocalist"}</p>
              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-4">{singer.bio}</p>
              <Link
                to="/music/pakistani-singers-archive"
                className="text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] mt-auto"
              >
                View Biography &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Scriptorium Studio & AI Exegete Teaser - Centered */}
      <section className="py-20 bg-gradient-to-b from-[#F8F4E3]/60 to-white border-t border-[#D4AF37]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B1C2E]">
            Interactive Theological Studio
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#4A152C]">
            AI Scholar Assistant &amp; Hymn Composer
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light max-w-2xl mx-auto">
            Engage with our theological research assistant to explore Greek and Hebrew morphology, run comparative scriptural exegesis, or use our interactive Raga-based hymn composer to arrange sacred music.
          </p>
          <div className="pt-2">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#4A152C] hover:bg-[#681E3E] text-[#E8C96A] font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Scriptorium Studio</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
