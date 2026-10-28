/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQ_PAGE_ITEMS, FAQ_PAGE_META, faqSchema } from '../data/faq';
import { usePageMetadata } from '../lib/usePageMetadata';

const structuredData = JSON.stringify(faqSchema(FAQ_PAGE_ITEMS)).replace(/</g, '\\u003c');

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  usePageMetadata(FAQ_PAGE_META);

  return (
    <div className="w-full bg-[#FDFBF7]">
      <script id="sp-faq-page-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <section className="bg-[#1A0812] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            <HelpCircle className="w-4 h-4" />
            Scriptorium Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
            Answers about our theological library, Punjabi Zaboor, free resources and family of Bible study apps.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="space-y-4">
          {FAQ_PAGE_ITEMS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const answerId = `faq-answer-${idx}`;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif font-bold text-lg text-[#1D2D50] hover:text-[#4A152C] transition-colors"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronRight aria-hidden="true" className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90 text-[#4A152C]' : ''}`} />
                </button>
                <div id={answerId} hidden={!isOpen} className="px-6 pb-6 pt-2 text-sm text-gray-700 leading-relaxed border-t border-gray-100 font-sans">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 mb-3">
                    {faq.category}
                  </span>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-8 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Looking for our apps? <Link to="/about" className="text-[#4A152C] font-bold hover:underline">Explore the Podship family &rarr;</Link>
          </p>
          <p className="text-xs text-gray-500">
            Have a specific theological question not answered here?{' '}
            <Link to="/contact" className="text-[#4A152C] font-bold hover:underline">
              Contact our editorial desk &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
