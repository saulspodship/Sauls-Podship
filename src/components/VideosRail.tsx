/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, ArrowUpRight, Radio } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  publishedAt: string;
  duration?: string | null;
  views?: number | null;
  description?: string;
}

interface VideosData {
  updatedAt?: string;
  videos?: VideoItem[];
}

const fmt = (n?: number | null) => {
  if (n == null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K views`;
  return `${n} views`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const humanDuration = (dur?: string | null) => {
  if (!dur) return '';
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(dur);
  if (!m) return '';
  const h = +(m[1] || 0), min = +(m[2] || 0), s = +(m[3] || 0);
  return h ? `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${min}:${String(s).padStart(2, '0')}`;
};

/**
 * VideosRail — "New from the Podship" horizontal slider on the home page.
 * Data is fetched at runtime from /videos/assets/videos-data.json, the same
 * file the weekly YouTube sync regenerates, so this rail is always current.
 */
export const VideosRail: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch('/videos/assets/videos-data.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: VideosData) => {
        if (!alive || !Array.isArray(data.videos)) return;
        const sorted = [...data.videos]
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 10);
        setVideos(sorted);
      })
      .catch(() => { /* rail silently hides if the module data is unavailable */ });
    return () => { alive = false; };
  }, []);

  if (videos.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <section id="videos" className="py-16 sm:py-20 bg-[#F8F4E3] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 12% 20%, rgba(212,175,55,.10), transparent 34%), radial-gradient(circle at 88% 80%, rgba(74,21,44,.08), transparent 30%)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
              <Radio className="w-3 h-3" /> New from the Podship
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#4A152C] mt-3">
              Latest Episodes, Fresh Aboard
            </h2>
            <p className="text-sm sm:text-base text-[#1D2D50]/70 mt-2 max-w-xl">
              Weekly video studies from the YouTube channel — the 66-book canon journey, the Book of Enoch series and Zaboor sessions, straight from the studio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll videos left"
              className="p-2.5 rounded-full border border-[#4A152C]/25 bg-white/70 text-[#4A152C] hover:bg-[#4A152C] hover:text-[#E8C96A] transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll videos right"
              className="p-2.5 rounded-full border border-[#4A152C]/25 bg-white/70 text-[#4A152C] hover:bg-[#4A152C] hover:text-[#E8C96A] transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Plain anchor: /videos is a standalone static page, not an SPA route. */}
            <a
              href="/videos"
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#4A152C] text-[#F8F4E3] text-xs font-bold hover:bg-[#681E3E] transition-colors shadow"
            >
              All videos <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(74,21,44,.35) transparent' }}
        >
          {videos.map(v => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[280px] sm:w-[320px] group bg-white rounded-2xl overflow-hidden border border-[#4A152C]/10 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="relative aspect-video bg-[#16060F]">
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={180}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16060F]/70 via-transparent to-transparent" />
                <span className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#D4AF37]/95 text-[#1A0812] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                  <Play className="w-5 h-5 fill-current translate-x-[1px]" />
                </span>
                {v.duration && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-semibold">
                    {humanDuration(v.duration)}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-[15px] leading-snug text-[#1A0812] line-clamp-2 group-hover:text-[#4A152C] transition-colors">
                  {v.title}
                </h3>
                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#1D2D50]/60 font-sans">
                  <span>{fmtDate(v.publishedAt)}</span>
                  {v.views != null && (<><span aria-hidden="true">•</span><span>{fmt(v.views)}</span></>)}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideosRail;
