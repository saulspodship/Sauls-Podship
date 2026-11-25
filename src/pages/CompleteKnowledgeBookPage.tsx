import React, { useEffect } from "react";

/**
 * /complete-knowledge-book
 *
 * Hosts the Urdu "Complete Knowledge Book" (مکمل علمی کتاب) — a
 * self-contained, page-flip reading experience. The book is a static
 * HTML document with its own navigation and embedded assets, so we
 * embed it in a full-height iframe (same isolation pattern as other
 * static modules).
 */
const BOOK_SRC = "/complete-knowledge-book/book-ur.html";

const META = {
  title: "The Complete Knowledge Book (Urdu) | Saul's Podship",
  description:
    "مکمل علمی کتاب — Saul's Podship کا مکمل الٰہیاتی ذخیرہ: پچاس بائبل انسائیکلوپیڈیا جلدیں، چار سو تقابلی سوالات، بائبل کے نقشے، فرشتے اور نبوتیں، اور مزید۔ اردو ایڈیشن۔",
};

export default function CompleteKnowledgeBookPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = META.title;
    let desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc ? desc.getAttribute("content") : null;
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", META.description);
    return () => {
      document.title = prev;
      if (prevDesc !== null) desc?.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <div className="w-full">
      <section
        data-hero="/images/hero-jesus-alpha-omega.jpg"
        className="py-14 text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[#D4AF37] text-[#1A0812]">
            Saul&apos;s Podship &middot; Urdu Edition
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mt-4">
            The Complete Knowledge Book
          </h1>
          <p
            className="text-white/80 text-lg sm:text-xl leading-relaxed max-w-2xl mt-2 font-serif"
            lang="ur"
            dir="rtl"
          >
            مکمل علمی کتاب
          </p>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mt-3 font-light">
            The full Saul&apos;s Podship theological archive in Urdu &mdash; fifty Bible
            encyclopedia volumes, 400 comparative apologetics questions, Bible maps, a
            1,000-answer study archive, angels and prophecy, and more &mdash; presented as
            a page-flip book.
          </p>
        </div>
      </section>

      <section className="py-6 bg-[#F8F4E3]">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <iframe
            title="The Complete Knowledge Book — Urdu Edition"
            src={BOOK_SRC}
            loading="eager"
            className="w-full block rounded-lg shadow-lg border border-[#D4AF37]/30"
            style={{ height: "calc(100vh - 120px)", minHeight: 720, background: "#2b1a20" }}
          />
          <p className="text-center text-xs text-[#7a6a5f] font-sans mt-4">
            Prefer a full window?{" "}
            <a
              href={BOOK_SRC}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#4A152C]"
            >
              Open the Urdu book in a new tab
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
