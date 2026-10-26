import React from 'react';
import { useLocation } from 'react-router-dom';
import { FAQ_DATA } from '../data/faq';

const FAQ_JSONLD_ID = 'sp-route-faq-jsonld';

const FAQBlock: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const dataset = FAQ_DATA[pathname];

  if (!dataset) return null;

  // VolumePage already emits one FAQPage node for its own exegetical accordion.
  // Merge this route's general FAQ into that node there rather than emitting a
  // second FAQPage script on the Biblical Maps volume.
  const volumeOwnsFaqSchema = pathname === '/encyclopedia/biblical-maps';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dataset.items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <section
      key={`${location.pathname}${location.search}`}
      className="w-full bg-[#F8F4E3]/70 border-y border-[#D4AF37]/20 py-12 sm:py-16"
      aria-labelledby="theological-inquiries-title"
    >
      {!volumeOwnsFaqSchema && (
        <script
          id={FAQ_JSONLD_ID}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block border border-[#D4AF37] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8A6B16]">
          Theological Inquiries
        </span>
        <h2 id="theological-inquiries-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-3 mb-3">
          Frequently Asked Questions
        </h2>
        <p className="font-serif italic text-gray-700 max-w-4xl mx-auto mb-7 leading-relaxed">
          {dataset.summary}
        </p>
        <div className="space-y-3 max-w-4xl mx-auto text-left">
          {dataset.items.map(({ question, answer }) => (
            <details key={question} className="bg-white border border-[#E3D8BD] rounded-lg px-4 sm:px-6 py-4">
              <summary className="cursor-pointer text-center font-bold text-sm sm:text-base text-[#4A152C]">
                {question}
              </summary>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQBlock;
