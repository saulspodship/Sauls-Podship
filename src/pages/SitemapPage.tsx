/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ExternalLink } from 'lucide-react';
import { VOLUME_INDEX as VOLUMES } from '../data/volumes/index-lite';
import { EPISODES, PODCAST } from '../data/episodes';
import { VIDEO_EPISODES } from '../data/videos';

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
        {/* Core Pages */}
        <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#4A152C] border-b border-gray-100 pb-2">
            Primary Navigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <Link to="/" className="text-[#4A152C] hover:underline font-semibold">Home &amp; Hero</Link>
            <Link to="/encyclopedia" className="text-[#4A152C] hover:underline font-semibold">51-Volume Encyclopedia Catalog</Link>
            <Link to="/podcast" className="text-[#4A152C] hover:underline font-semibold">Theological Podcast</Link>
            <a href="/videos/" className="text-[#4A152C] hover:underline font-semibold">Bible Video Library</a>
            <Link to="/music" className="text-[#4A152C] hover:underline font-semibold">Sacred Music &amp; Hymnody</Link>
            <Link to="/music/punjabi-zaboor" className="text-[#4A152C] hover:underline font-semibold">Punjabi Zaboor (150 Psalms)</Link>
            <Link to="/music/pakistani-singers-archive" className="text-[#4A152C] hover:underline font-semibold">Pakistani Singers Archive</Link>
            <Link to="/studio" className="text-[#4A152C] hover:underline font-semibold">Scriptorium AI Studio</Link>
            <Link to="/scholarly-standards" className="text-[#4A152C] hover:underline font-semibold">Scholarly Standards</Link>
            <Link to="/theological-archive" className="text-[#4A152C] hover:underline font-semibold">Theological Archive (1000 Answers)</Link>
            <Link to="/comparative-apologetics" className="text-[#4A152C] hover:underline font-semibold">Comparative Apologetics Codex</Link>
            <Link to="/prophecy-map" className="text-[#4A152C] hover:underline font-semibold">Biblical Prophecy Map</Link>
            <Link to="/kings-of-the-bible" className="text-[#4A152C] hover:underline font-semibold">Kings of the Bible</Link>
            <Link to="/cross-references" className="text-[#4A152C] hover:underline font-semibold">Bible Cross-References</Link>
            <Link to="/sitemap" className="text-[#4A152C] hover:underline font-semibold">HTML Site Directory</Link>
            <Link to="/about" className="text-[#4A152C] hover:underline font-semibold">About the Scriptorium</Link>
            <Link to="/support" className="text-[#4A152C] hover:underline font-semibold">Support &amp; Partner</Link>
            <Link to="/faq" className="text-[#4A152C] hover:underline font-semibold">Frequently Asked Questions</Link>
            <Link to="/contact" className="text-[#4A152C] hover:underline font-semibold">Contact Desk</Link>
            <Link to="/privacy" className="text-[#4A152C] hover:underline font-semibold">Privacy Policy</Link>
            <Link to="/terms" className="text-[#4A152C] hover:underline font-semibold">Terms of Service</Link>
            <Link to="/disclaimer" className="text-[#4A152C] hover:underline font-semibold">Theological Disclaimer</Link>
          </div>
        </section>

        {/* Podcast Episodes (mirrored from RSS.com) */}
        <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#4A152C] border-b border-gray-100 pb-2">
            Podcast Episodes ({EPISODES.length})
          </h2>
          <p className="text-xs text-gray-600">
            {PODCAST.title} — published on{' '}
            <a href={PODCAST.showUrl} target="_blank" rel="noopener noreferrer" className="text-[#4A152C] hover:underline font-semibold">
              RSS.com
            </a>
            . The site mirrors each episode for search and study notes; the audio always streams from the host.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[...EPISODES].reverse().map((ep) => (
              <li key={ep.id} className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold text-gray-400 w-6 flex-shrink-0">{ep.number}</span>
                <Link to={`/podcast/${ep.slug}`} className="urdu text-[#4A152C] hover:underline leading-relaxed">
                  {ep.title}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="font-serif text-base font-bold text-[#4A152C] border-t border-gray-100 pt-3">
            YouTube Podcasts — English video masterclasses ({VIDEO_EPISODES.length})
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {VIDEO_EPISODES.map((v) => (
              <li key={v.id} className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold text-gray-400 w-6 flex-shrink-0">{v.number}</span>
                <Link to={`/podcast/${v.slug}`} className="text-[#4A152C] hover:underline leading-relaxed">
                  {v.title}
                </Link>
              </li>
            ))}
          </ul>
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
