/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Play, ArrowDown } from 'lucide-react';
import { Volume } from '../types';
import { SITE } from '../config/site';
import { artUrl } from '../lib/artUrl';

interface HeroProps {
  variant: 'home' | 'volume';
  volume?: Volume;
  onStartReading?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ variant, volume, onStartReading }) => {
  if (variant === 'volume' && volume) {
    const slug = volume.slug;
    // Image folder: normally /images/volumes/<slug>/, but a volume may point
    // its heroImage at a different local folder (e.g. a "-v2" re-issue that
    // bypasses stale CDN caches) — derive the base from it when present.
    const m = /^(\/images\/volumes\/[^/]+)\/hero-/.exec(volume.heroImage?.src || '');
    const base = m ? m[1] : `/images/volumes/${slug}`;
    const heroCredit = volume.heroImage?.credit || 'Historical Theological Archive';
    const numPadded = volume.number < 10 ? `0${volume.number}` : `${volume.number}`;

    return (
      <section id="volume-hero" className="relative w-full overflow-hidden flex flex-col text-white min-h-0 sm:min-h-[100svh] bg-[linear-gradient(180deg,#16060F_0%,#1A0812_55%,#24101C_100%)">
        <picture
          className="relative w-full aspect-video sm:absolute sm:inset-0 sm:aspect-auto"
          style={{ background: 'linear-gradient(180deg, #16060F 0%, #1A0812 62%, #24101C 100%)' }}
        >
          <source media="(max-width: 639px)" srcSet={artUrl(`${base}/hero-1280.webp`)} type="image/webp" />
          <source media="(max-width: 1279px)" srcSet={artUrl(`${base}/hero-1280.webp`)} type="image/webp" />
          <source srcSet={artUrl(`${base}/hero-1920.webp`)} type="image/webp" />
          <img
            src={artUrl(`${base}/hero-1920.jpg`)}
            alt={volume.heroImage?.alt || volume.title}
            width="1920"
            height="1082"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = volume.heroImage?.src ? artUrl(volume.heroImage.src) : '';
              if (fallback && !target.src.endsWith(fallback)) {
                target.src = fallback;
              }
            }}
          />
        </picture>
        <div className="hero-overlay absolute inset-0 pointer-events-none hidden sm:block" />

        {/* content: on mobile pinned to the LOWER 40% and compact; on desktop centred */}
        <div className="relative z-10 flex-1 flex flex-col items-center text-center px-5 py-6 sm:py-0
                        justify-end pb-[max(1.25rem,env(safe-area-inset-bottom))]
                        md:justify-center md:pb-0">
          <div className="hero-scrim rounded-3xl px-5 py-5 md:px-8 md:py-8 max-w-xl w-full max-h-[42svh] md:max-h-none flex flex-col items-center justify-center">
            <span className="pill">
              <BookOpen className="w-3.5 h-3.5 mr-1 inline" />
              Vol. {numPadded} &bull; {volume.category}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mt-3 mb-2 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {volume.title}
            </h1>

            {/* Subtitle: one-line subtitle on mobile, full on desktop */}
            {volume.subtitle && (
              <>
                <p className="hidden md:block text-base md:text-lg text-[#F8F4E3] max-w-lg leading-relaxed font-sans font-light drop-shadow">
                  {volume.subtitle}
                </p>
                <p className="md:hidden text-xs sm:text-sm text-[#F8F4E3]/95 leading-snug line-clamp-1">
                  {volume.subtitle}
                </p>
              </>
            )}

            {/* Action CTAs: on mobile one "Start Reading ↓" button; desktop all buttons */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={onStartReading || (() => {
                  const el = document.getElementById('volume-content') || document.getElementById('summary');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                })}
                className="btn-gold text-xs sm:text-sm py-2.5 px-5 w-full sm:w-auto"
              >
                <ArrowDown className="w-4 h-4 mr-1 inline" />
                Start Reading &darr;
              </button>

              {volume.articleLink && (
                <a
                  href={volume.articleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex btn-ghost text-xs sm:text-sm py-2.5 px-4"
                >
                  <ExternalLink className="w-4 h-4 text-[#E8C96A] mr-1 inline" />
                  Read Blog Article
                </a>
              )}

              {volume.youtubeLink ? (
                <a
                  href={volume.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex btn-red text-xs sm:text-sm py-2.5 px-4"
                >
                  <Play className="w-4 h-4 fill-current mr-1 inline" />
                  Watch Video
                </a>
              ) : (
                <a
                  href={SITE.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex btn-red text-xs sm:text-sm py-2.5 px-4"
                >
                  <Play className="w-4 h-4 fill-current mr-1 inline" />
                  YouTube Channel
                </a>
              )}
            </div>
          </div>

          <p className="credit mt-3 text-[10px] opacity-60 px-4">
            Artwork: {heroCredit}
          </p>
        </div>
      </section>
    );
  }

  // Home Hero Variant
  return (
    <section id="home-hero" className="relative w-full overflow-hidden min-h-[240px] sm:min-h-[100svh] flex flex-col text-white">
      <picture className="absolute inset-0">
        <source media="(max-width: 639px)"  srcSet="/images/hero/last-supper-1280.webp"     type="image/webp" />
        <source media="(max-width: 1279px)" srcSet="/images/hero/last-supper-1280.webp"     type="image/webp" />
        <source srcSet="/images/hero/last-supper-1920.webp" type="image/webp" />
        <img
          src="/images/hero/last-supper-1920.jpg"
          alt="The Last Supper — ultra-realistic commission with the Lord's face drawn from the Shroud of Turin"
          width="1920"
          height="1082"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[center_64%] sm:object-center"
        />
      </picture>
      <div className="hero-overlay absolute inset-0 pointer-events-none" />

      {/* content: on mobile pinned to the LOWER 40% and compact; on desktop centred */}
      <div className="relative z-10 flex-1 flex flex-col items-center text-center px-5
                      justify-end pb-[max(1.25rem,env(safe-area-inset-bottom))]
                      md:justify-center md:pb-0">
        <div className="hero-scrim rounded-3xl px-5 py-5 md:px-8 md:py-8 max-w-xl w-full max-h-[42svh] md:max-h-none flex flex-col items-center justify-center">
          <span className="pill">A BIBLICAL MINISTRY PROJECT</span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mt-3 mb-2 leading-tight">
            Saul's Podship
          </h1>
          <p className="hidden md:block text-base md:text-lg text-[#F8F4E3] max-w-lg leading-relaxed font-sans font-light drop-shadow">
            A rigorous, peer-reviewed digital scriptorium for Christian exegesis, historic theology, indigenous Punjabi Zaboor hymnody, and academic scripture analysis.
          </p>
          <p className="md:hidden text-xs sm:text-sm text-[#F8F4E3]/95 leading-snug">
            An interactive theological encyclopedia — 51 illustrated volumes from Eden to the New Jerusalem.
          </p>

          {/* MOBILE: 2 primary buttons side-by-side + 2 text links. DESKTOP: all four as buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 md:flex md:flex-wrap md:justify-center md:gap-3 w-full sm:w-auto">
            <Link to="/encyclopedia" className="btn-gold text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-5">
              Explore 51 Volumes
            </Link>
            <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="btn-red text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-5">
              YouTube Channel
            </a>
            <Link to="/podcast" className="btn-ghost col-span-1 text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-5">
              Podcast
            </Link>
            <Link to="/music" className="btn-ghost col-span-1 text-xs sm:text-sm py-2 px-3 sm:py-3 sm:px-5">
              Music &amp; Zaboor
            </Link>
          </div>
        </div>

        <p className="credit mt-3 text-[10px] opacity-60 px-4">
          Saul's Podship archive — <i>The Last Supper</i>, ultra-realistic original commission (2026); the Lord's face drawn from the Shroud of Turin.
        </p>
      </div>
    </section>
  );
};

export default Hero;
