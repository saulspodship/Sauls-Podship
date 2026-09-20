/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mic, Play, Calendar, Clock, ChevronLeft, ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';
import { EPISODES, Episode } from '../data/episodes';
import NotFoundPage from './NotFoundPage';
import { usePageMeta } from '../lib/pageMeta';

const EpisodeMeta: React.FC<{ episode: Episode }> = ({ episode }) => {
  usePageMeta({
    title: `${episode.title} | Podcast Ep. ${episode.number} | Saul's Podship`,
    description: episode.description.length > 160 ? `${episode.description.slice(0, 157)}…` : episode.description,
    keywords: [...episode.topics, ...episode.scriptureReferences, 'theology podcast'],
    path: `/podcast/${episode.slug}`,
    ogType: 'article',
  });
  return null;
};

export const PodcastEpisodePage: React.FC = () => {
  const { episode: episodeSlug } = useParams<{ episode: string }>();

  const episode = EPISODES.find(
    e => e.slug.toLowerCase() === (episodeSlug || '').toLowerCase() || `ep-${e.number}` === episodeSlug
  );

  if (!episode) {
    return <NotFoundPage status={404} />;
  }

  return (
    <div className="w-full bg-[#FDFBF7]">
      <EpisodeMeta episode={episode} />
      <section className="bg-[#1A0812] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/podcast"
            className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Podcast Episodes
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D4AF37] text-[#1A0812]">
              Episode 0{episode.number}
            </span>
            <span className="text-xs text-white/60">{episode.duration}</span>
            <span className="text-xs text-white/60">{episode.publishDate}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {episode.title}
          </h1>
          <p className="text-base text-white/80 font-light">
            {episode.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-gray-800">
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#4A152C]">
            Episode Summary &amp; Theological Discussion
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif font-light">
            {episode.description}
          </p>

          {episode.scriptureReferences && episode.scriptureReferences.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-serif font-bold text-sm text-[#4A152C] uppercase tracking-wider mb-2">
                Primary Scripture References
              </h3>
              <div className="flex flex-wrap gap-2">
                {episode.scriptureReferences.map((ref, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-[#4A152C]/10 text-[#4A152C] font-semibold text-xs">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {episode.youtubeUrl && (
            <div className="pt-6">
              <a
                href={episode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Full Masterclass on YouTube</span>
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PodcastEpisodePage;
