/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FDFBF7]">
      <section className="bg-[#1A0812] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            <Scale className="w-4 h-4" />
            Legal Terms
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-white/70">Last Updated: September 6, 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-gray-800">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#4A152C]">1. Acceptance of Terms</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            By accessing or using Saul's Podship (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.
          </p>

          <h2 className="font-serif text-xl font-bold text-[#4A152C]">2. Academic &amp; Educational Use</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            The theological manuscripts, data tables, and study monographs are published for educational, ecclesiastical, and scholarly research. Proper academic attribution is requested when citing scriptorium materials.
          </p>

          <h2 className="font-serif text-xl font-bold text-[#4A152C]">3. Intellectual Property &amp; Artwork</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Historical art assets are in the public domain where so marked. The homepage artwork <em>The Last Supper</em> (2026) is an original ultra-realistic commission — the Lord's face drawn from the Shroud of Turin — created for and owned by Saul's Podship. Original exegesis and compilation copyright belong to Saul's Podship Scriptorium.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
