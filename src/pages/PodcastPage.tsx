/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Play, Calendar, Clock, ExternalLink, Rss, Headphones, Globe2, ArrowRight,
} from 'lucide-react';
import { EPISODES, PODCAST } from '../data/episodes';

const dateFmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

/** PodcastSeries + ItemList so search engines see the show and its episodes. */
function podcastJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: PODCAST.title,
    alternateName: PODCAST.titleUrdu,
    url: 'https://www.saulspodship.com/podcast',
    webFeed: PODCAST.feedUrl,
    inLanguage: 'ur',
    description: PODCAST.description,
    image: `https://www.saulspodship.com${PODCAST.coverArt}`,
    publisher: { '@type': 'Organization', name: PODCAST.publisher },
    numberOfEpisodes: EPISODES.length,
    episode: [...EPISODES].reverse().map((ep) => ({
      '@type': 'PodcastEpisode',
      name: ep.title,
      url: `https://www.saulspodship.com/podcast/${ep.slug}`,
      episodeNumber: ep.number,
      datePublished: ep.publishDate,
      timeRequired: `PT${ep.duration.split(':')[0]}M${ep.duration.split(':')[1]}S`,
    })),
  };
}

export const PodcastPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FDFBF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd()) }}
      />

      {/* ---------- Show hero ---------- */}
      <section className="bg-[#1A0812] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[220px_1fr] md:items-center">
          <img
            src={PODCAST.coverArt}
            alt={`${PODCAST.title} cover art`}
            width={220}
            height={220}
            className="w-44 sm:w-52 md:w-full mx-auto rounded-2xl border border-[#D4AF37]/40 shadow-2xl"
          />

          <div className="space-y-5 text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
              <Mic className="w-4 h-4" />
              Urdu Audio Scriptorium
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {PODCAST.title}
            </h1>

            <p className="urdu text-xl sm:text-2xl text-[#E8C96A]">
              {PODCAST.tagline}
            </p>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light max-w-2xl">
              {PODCAST.description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <a
                href={PODCAST.showUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] font-bold text-xs shadow transition-all"
              >
                <Headphones className="w-4 h-4" />
                Listen on RSS.com
              </a>
              <a
                href={PODCAST.feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all"
              >
                <Rss className="w-4 h-4 text-[#E8C96A]" />
                RSS feed
              </a>
              <a
                href="/encyclopedia"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-semibold text-xs transition-all"
              >
                <Globe2 className="w-4 h-4 text-[#E8C96A]" />
                The 51 volumes behind it
              </a>
            </div>

            <dl className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-[11px] uppercase tracking-wider text-white/55 font-semibold">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E8C96A]" />
                {EPISODES.length} episodes
              </div>
              <div>Season 1</div>
              <div>{PODCAST.languageLabel}</div>
              <div>{PODCAST.category}</div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Episode list ---------- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-gray-200">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C]">
              All Episodes
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Newest first. Every episode streams from RSS.com — the published
              show stays the single source of truth.
            </p>
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {EPISODES.length} published
          </span>
        </div>

        <div className="space-y-5">
          {EPISODES.map((ep) => (
            <article
              key={ep.id}
              className="relative p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D4AF37]/60 transition-all flex flex-col sm:flex-row gap-5 sm:items-center"
            >
              <Link
                to={`/podcast/${ep.slug}`}
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-[1] rounded-3xl"
              />

              <Link
                to={`/podcast/${ep.slug}`}
                className="relative z-[2] flex-shrink-0 mx-auto sm:mx-0"
                aria-label={`Episode ${ep.number}: ${ep.titleEnglish}`}
              >
                <img
                  src={ep.coverArt}
                  alt=""
                  width={112}
                  height={112}
                  loading="lazy"
                  className="w-28 h-28 rounded-2xl border border-[#4A152C]/10 shadow-sm object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-11 h-11 rounded-full bg-[#4A152C]/85 text-[#E8C96A] flex items-center justify-center shadow-lg ring-1 ring-[#D4AF37]/50">
                    <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                  </span>
                </span>
              </Link>

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1A0812] text-[#D4AF37]">
                    S1 · E{ep.number}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ep.duration}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dateFmt(ep.publishDate)}
                  </span>
                </div>

                <h3 className="urdu text-lg sm:text-xl text-[#4A152C] leading-snug">
                  <Link to={`/podcast/${ep.slug}`} className="hover:text-[#8B1C2E]">
                    {ep.title}
                  </Link>
                </h3>

                <p className="text-[11px] italic text-[#8B1C2E]/80">{ep.titleRoman}</p>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {ep.description}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {ep.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#4A152C]/5 text-[#4A152C] border border-[#4A152C]/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-[2] flex sm:flex-col items-center gap-2 flex-shrink-0">
                <Link
                  to={`/podcast/${ep.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A152C] text-[#E8C96A] font-bold text-xs shadow hover:bg-[#681E3E] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Listen &amp; notes
                </Link>
                <a
                  href={ep.rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-[11px] hover:border-[#D4AF37] hover:text-[#4A152C] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  RSS.com
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* ---------- Subscribe / feed ---------- */}
        <section className="mt-4 p-8 rounded-3xl bg-[#1A0812] text-white border-2 border-[#D4AF37]/40 shadow-xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Rss className="w-4 h-4 text-[#E8C96A]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#E8C96A]">
              Subscribe anywhere
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold">Paste this feed into any podcast app</h2>
          <code className="inline-block max-w-full overflow-x-auto px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] sm:text-xs text-[#E8C96A] font-mono">
            {PODCAST.feedUrl}
          </code>
          <p className="text-xs text-white/60 max-w-xl mx-auto">
            Apple Podcasts, Spotify, Amazon Music and the rest are fed by the same
            show on RSS.com. The site mirrors the published episodes — it never
            hosts copies of the audio.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <a
              href={PODCAST.showUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] font-bold text-xs transition-all"
            >
              <Headphones className="w-4 h-4" />
              Open the show page
            </a>
            <Link
              to="/encyclopedia"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all"
            >
              Explore the volumes
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PodcastPage;
