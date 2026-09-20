/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ArrowLeft } from 'lucide-react';
import { usePageMeta } from '../lib/pageMeta';

interface NotFoundPageProps {
  status?: number;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = () => {
  // The static host always answers 200 for SPA fallback URLs, so client-side
  // noindex is what keeps mistyped / removed URLs OUT of Google's index
  // (fixes "Soft 404" / "Crawled — currently not indexed" on dead ends).
  usePageMeta({
    title: "Page Not Found | Saul's Podship",
    description: "The page you requested could not be found. Browse the 51-volume theological encyclopedia, study modules and archives instead.",
    path: '/404',
    noindex: true,
  });
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7] px-4 py-20">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-[#4A152C]/10 text-[#4A152C] rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#8B1C2E]">404 Error</span>
          <h1 className="font-serif text-3xl font-bold text-[#4A152C] mt-1">
            Volume or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            The theological manuscript, volume slug, or scriptorium resource you requested could not be located in our index.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/encyclopedia"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A152C] text-[#E8C96A] font-bold text-xs shadow hover:bg-[#681E3E] transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse 51 Volumes</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-semibold text-xs hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
