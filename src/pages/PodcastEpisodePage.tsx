/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, Calendar, Clock, ChevronLeft, ChevronRight, ExternalLink, Rss,
  BookOpen, Headphones, ArrowUpRight,
} from 'lucide-react';
import {
  EPISODES, PODCAST, findEpisode, episodeNeighbours,
} from '../data/episodes';
import NotFoundPage from './NotFoundPage';

const dateFmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

/** mm:ss -> PT#M#S */
const isoDuration = (mmss: string) => {
  const [m, s] = mmss.split(':');
  return `PT${parseInt(m, 10) || 0}M${parseInt(s, 10) || 0}S`;
};

export const PodcastEpisodePage: React.FC = () => {
  const { episode: episodeSlug } = useParams<{ episode: string }>();
  const episode = findEpisode(episodeSlug);

  if (!episode) return <NotFoundPage status={404} />;

  const { older, newer } = episodeNeighbours(episode);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: episode.title,
    alternateName: episode.titleEnglish,
    description: episode.description,
    url: `https://www.saulspodship.com/podcast/${episode.slug}`,
    episodeNumber: episode.number,
    partOfSeason: { '@type': 'PodcastSeason', seasonNumber: 1 },
    datePublished: episode.publishDate,
    timeRequired: isoDuration(episode.duration),
    inLanguage: 'ur',
    image: `https://www.saulspodship.com${episode.coverArt}`,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: PODCAST.title,
      url: PODCAST.showUrl,
      webFeed: PODCAST.feedUrl,
    },
    sameAs: episode.rssUrl,
  };

  return (
    <div className="w-full bg-[#FDFBF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------- Episode hero ---------- */}
      <section className="bg-[#1A0812] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link
            to="/podcast"
            className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            All {EPISODES.length} episodes
          </Link>

          <div className="grid gap-8 sm:grid-cols-[200px_1fr] sm:items-center">
            <img
              src={episode.coverArt}
              alt={`${episode.title} — episode art`}
              width={200}
              height={200}
              className="w-40 sm:w-full mx-auto rounded-2xl border border-[#D4AF37]/40 shadow-2xl"
            />

            <div className="space-y-4 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37] text-[#1A0812]">
                  Season 1 · Episode {episode.number}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {episode.duration}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateFmt(episode.publishDate)}
                </span>
              </div>

              <h1 className="urdu text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
                {episode.title}
              </h1>
              <p className="text-sm italic text-[#E8C96A]">{episode.titleRoman}</p>
              <p className="text-sm sm:text-base text-white/75 font-light">
                {episode.titleEnglish}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* ---------- Player ---------- */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-bold text-[#4A152C] flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#D4AF37]" />
              Listen to this episode
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={episode.rssUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#4A152C] text-[#E8C96A] font-bold text-[11px] hover:bg-[#681E3E] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                RSS.com page
              </a>
              <a
                href={PODCAST.feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#4A152C]/5 border border-[#4A152C]/15 text-[#4A152C] font-semibold text-[11px] hover:border-[#D4AF37] transition-colors"
              >
                <Rss className="w-3 h-3" />
                Podcast feed
              </a>
            </div>
          </div>

          <iframe
            src={episode.playerUrl}
            title={`${episode.titleEnglish} — Saul's Podship episode player`}
            loading="lazy"
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            className="w-full rounded-xl border border-gray-200 bg-white"
            height={180}
          />

          <p className="text-[11px] text-gray-500">
            Audio is streamed from RSS.com — the platform that hosts the show — so
            plays here count toward the same analytics as every podcast app.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] items-start">
          {/* ---------- Urdu show notes ---------- */}
          <section className="p-7 sm:p-9 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1C2E]">
                Episode notes
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#4A152C] mt-1">
                Urdu Show Notes &amp; Scriptures
              </h2>
            </div>

            <div className="urdu-body text-[15px] sm:text-base text-gray-800 whitespace-pre-line">
              {episode.notesUrdu}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4A152C]">
                In English
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{episode.description}</p>
            </div>
          </section>

          {/* ---------- Side rail ---------- */}
          <aside className="space-y-6">
            <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-bold text-[#4A152C] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                Key Scriptures
              </h3>
              <div className="flex flex-wrap gap-2">
                {episode.scriptureReferences.map((ref) => (
                  <span
                    key={ref}
                    className="px-2.5 py-1 rounded-lg bg-[#4A152C]/8 border border-[#4A152C]/10 text-[#4A152C] font-semibold text-[11px]"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </section>

            <section className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-bold text-[#4A152C]">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {episode.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#4A152C] font-medium text-[11px] border border-[#D4AF37]/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className="p-6 rounded-3xl bg-[#1A0812] text-white border-2 border-[#D4AF37]/40 shadow-xl space-y-3 text-center">
              <img
                src={PODCAST.coverArt}
                alt={`${PODCAST.title} cover art`}
                width={112}
                height={112}
                loading="lazy"
                className="w-24 h-24 mx-auto rounded-xl border border-[#D4AF37]/40"
              />
              <p className="font-serif font-bold text-sm leading-snug">{PODCAST.title}</p>
              <p className="urdu text-sm text-[#E8C96A]">{PODCAST.tagline}</p>
              <a
                href={PODCAST.showUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] font-bold text-[11px] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Follow the show
              </a>
              <Link
                to="/podcast"
                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#E8C96A] hover:underline"
              >
                Browse all episodes
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </section>
          </aside>
        </div>

        {/* ---------- Prev / next ---------- */}
        <nav
          aria-label="Adjacent episodes"
          className="flex flex-col sm:flex-row items-stretch justify-between gap-3 pt-4 border-t border-gray-200"
        >
          {older ? (
            <Link
              to={`/podcast/${older.slug}`}
              className="group flex-1 p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#D4AF37] transition-colors text-left"
            >
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <ChevronLeft className="w-3 h-3" />
                Previous · E{older.number}
              </span>
              <span className="block urdu text-sm text-[#4A152C] mt-1 leading-snug">
                {older.title}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}

          {newer ? (
            <Link
              to={`/podcast/${newer.slug}`}
              className="group flex-1 p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#D4AF37] transition-colors text-right"
            >
              <span className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Next · E{newer.number}
                <ChevronRight className="w-3 h-3" />
              </span>
              <span className="block urdu text-sm text-[#4A152C] mt-1 leading-snug">
                {newer.title}
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      </div>
    </div>
  );
};

export default PodcastEpisodePage;
