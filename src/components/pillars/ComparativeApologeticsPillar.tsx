import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Pillar card — "400 Comparative Religion Apologetics Questions".
 * Styled 1:1 with the other pillar cards on the home page
 * (p-8 rounded-3xl white card, wine #4A152C, gold #E8C96A hover).
 *
 * IMPORTANT: react-router <Link>, never a raw <a href> — the site runs on
 * a hash router, so a plain href would reload the document, replay the
 * GSAP splash and dump the visitor back on the home route.
 */
export const COMPARATIVE_APOLOGETICS_PATH = "/comparative-apologetics";

interface ComparativeApologeticsPillarProps {
  href?: string;
  count?: number;
}

export default function ComparativeApologeticsPillar({
  href = COMPARATIVE_APOLOGETICS_PATH,
  count = 400,
}: ComparativeApologeticsPillarProps) {
  return (
    <article className="p-8 rounded-3xl bg-white border border-[#4A152C]/10 shadow-sm flex flex-col items-center justify-between text-center group hover:border-[#D4AF37] transition-all">
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-2xl bg-[#4A152C]/10 text-[#4A152C] flex items-center justify-center mb-4 group-hover:bg-[#4A152C] group-hover:text-[#E8C96A] transition-colors"
          aria-hidden="true"
        >
          {/* scales / comparative icon */}
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v18" />
            <path d="M5 21h14" />
            <path d="M4 7h16" />
            <path d="M7 7l-3 7a3.5 3.5 0 0 0 6 0L7 7Z" />
            <path d="M17 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7Z" />
          </svg>
        </div>
        <h3 className="font-serif font-bold text-xl text-[#4A152C] mb-2">
          {count} Comparative Religion Apologetics Questions
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
          The hardest objections raised in Christian dialogue with Islam,
          Judaism, Hinduism and Sikhism — 100 per tradition — each answered
          with primary sources, a fair statement of the other side, and a
          Christian apologetic response. Searchable, sortable, and ranked
          by what is most asked in Pakistan &amp; India.
        </p>
      </div>
      <Link
        to={href}
        className="mt-6 inline-flex items-center text-xs font-bold text-[#4A152C] hover:text-[#8B1C2E] gap-1 group"
      >
        <span>Open the Codex</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
