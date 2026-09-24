/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { STATS, ARCHIVE_BASE } from '../../lib/theologySeo';

/**
 * Fourth pillar card for the "Four Pillars of Saul's Podship Scriptorium"
 * section on the home page. Styled to match the existing cards.
 */
export default function ArchivePillarCard({ href = ARCHIVE_BASE }: { href?: string }) {
  return (
    <article className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5V5a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-1.5Z" />
            <path d="M4 19.5A2 2 0 0 1 6 18h14" />
            <path d="M9.2 8.4a2.8 2.8 0 0 1 5.4.9c0 1.9-2.7 2.2-2.7 4" />
            <circle cx="11.9" cy="15.6" r=".7" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">{STATS.toughCount} Tough Questions with 1000 Quiz Questions</h3>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
          The hardest questions in Christian theology — answered in English, Urdu, Hindi and Arabic across five
          traditions, with {STATS.archiveCount.toLocaleString()} book-by-book study questions and verified,
          word-for-word denominational sources.
        </p>
      </div>

      {/* Must be a router <Link>: the app uses createHashRouter, so a plain
          <a href="/theological-archive"> triggers a full reload of a path the
          static host answers with index.html (no #hash) — i.e. the home page. */}
      <Link to={href} className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group">
        <span>Enter the Archive</span> <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
