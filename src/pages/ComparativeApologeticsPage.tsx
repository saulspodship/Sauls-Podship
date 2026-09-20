import React, { useEffect, useMemo, useRef, useState } from "react";
import index from "../data/comparativeApologeticsIndex.json";
import { usePageMeta } from "../lib/pageMeta";
import "./theological-archive.css";

/**
 * /comparative-apologetics
 *
 * Route page that hosts the complete interactive codex. The codex itself
 * is a single self-contained HTML document (public/comparative-apologetics/index.html)
 * with its own sticky search toolbar, religion chips (which filter AND
 * scroll to that tradition), sort control, collapsible questions, and
 * "most asked in Pakistan & India" ranking. It is embedded in an iframe so
 * its 1.5 MB of content and its own styles never touch the SPA bundle.
 *
 * Deep links are supported in both directions:
 *   /#/comparative-apologetics?q=q-islam-83   -> opens that question in the codex
 *   /#/comparative-apologetics?rel=hinduism   -> opens with Hinduism selected
 */

interface QuestionItem {
  id: string;
  religion: string;
  n: number;
  q: string;
}

const typedIndex = index as QuestionItem[];

const RELIGIONS = [
  { key: "islam", label: "Islam", glyph: "\u262A", vol: "Volume I" },
  { key: "judaism", label: "Judaism", glyph: "\u2721", vol: "Volume II" },
  { key: "hinduism", label: "Hinduism", glyph: "\u{1F549}", vol: "Volume III" },
  { key: "sikhism", label: "Sikhism", glyph: "\u262C", vol: "Volume IV" },
];

const CODEX_SRC = "/comparative-apologetics/codex.html";

interface MetaData {
  title: string;
  description: string;
  canonical: string;
}

const META: MetaData = {
  title:
    "400 Comparative Apologetics Questions — Islam, Judaism, Hinduism & Sikhism | Saul's Podship",
  description:
    "A Christian's guide to comparative apologetics: 100 critical questions each on Islam, Judaism, Hinduism and Sikhism, with primary sources, fair representation and a Christian response. Searchable and ranked for Pakistan & India.",
  canonical: "https://www.saulspodship.com/comparative-apologetics",
};

function useDocumentMeta(meta: MetaData) {
  // Shared helper applies title + description + canonical + OG/Twitter.
  usePageMeta({
    title: meta.title,
    description: meta.description,
    keywords: ['comparative apologetics', 'christian apologetics Islam', 'interfaith dialogue', 'apologetics Pakistan India'],
    path: '/comparative-apologetics',
    ogType: 'website',
  });
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Comparative Apologetics Codex",
    numberOfItems: typedIndex.length,
    itemListElement: typedIndex.slice(0, 50).map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: q.q,
      url: `${META.canonical}?q=${q.id}`,
    })),
  };
}

export default function ComparativeApologeticsPage() {
  useDocumentMeta(META);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [frameH, setFrameH] = useState<number | string>("calc(100vh - 120px)");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Auto-height the same-origin codex frame WITHOUT a feedback loop.
    // Measuring documentElement.scrollHeight is unsafe here: once the frame is
    // taller than the content, the codex's own 100vh sidebar / min-heights track
    // the frame's viewport, scrollHeight grows to match, and the frame balloons
    // (it reached >1,000,000px in production). Measure the real content block
    // (.wrap → main.content) instead, and only grow when the delta is meaningful.
    const measure = () => {
      try {
        const d = frameRef.current?.contentDocument;
        if (!d || !d.body) return;
        const content =
          (d.querySelector(".wrap") as HTMLElement | null) ||
          (d.querySelector("main") as HTMLElement | null) ||
          d.body;
        // offsetHeight of the static content block is independent of the
        // frame's own viewport; add the codex's bottom padding + a safety margin.
        const h = Math.ceil(content.getBoundingClientRect().height) + 48;
        if (h > 400 && h < 200000) {
          setFrameH((prev) => {
            const prevN = typeof prev === "number" ? prev : parseInt(String(prev), 10) || 0;
            return Math.abs(prevN - h) > 8 ? h : prev;
          });
        }
      } catch { /* cross-origin guard */ }
    };
    const t = window.setInterval(measure, 700);
    const f = frameRef.current;
    f?.addEventListener("load", measure);
    return () => { window.clearInterval(t); f?.removeEventListener("load", measure); };
  }, []);

  // Read ?q= / ?rel= from either the hash-router search or the real search.
  const initialHash = useMemo(() => {
    const raw =
      (typeof window !== "undefined" &&
        (window.location.hash.split("?")[1] || window.location.search.slice(1))) ||
      "";
    const p = new URLSearchParams(raw);
    if (p.get("q")) return "#" + p.get("q");
    if (p.get("rel")) return "#sec-" + p.get("rel");
    return "";
  }, []);

  const src = CODEX_SRC + initialHash;

  const jumpTo = (hash: string) => {
    const f = frameRef.current;
    if (!f) return;
    try {
      if (f.contentWindow) {
        f.contentWindow.location.hash = hash;
      }
    } catch {
      f.src = CODEX_SRC + hash;
    }
    f.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ta-root min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      <header className="ta-masthead">
        <span className="ta-kicker">Theological Heritage &amp; Foundations</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
          The Comparative Apologetics <em className="text-[#E8C96A] not-italic">Codex</em>
        </h1>
        <p className="ta-lede">
          Four hundred of the hardest questions raised in Christian dialogue with
          Islam, Judaism, Hinduism and Sikhism — one hundred per tradition. Every entry
          states the other faith&rsquo;s position fairly from its own primary sources
          before offering a Christian response. Persuasion through honesty, never mockery.
        </p>
        <div className="ta-stats">
          {RELIGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => jumpTo("#sec-" + r.key)}
              className="text-left hover:text-[#E8C96A] transition-colors"
            >
              <span className="block text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">
                {r.vol}
              </span>
              <span className="block text-lg font-semibold">
                {r.glyph}&nbsp;{r.label}
              </span>
              <span className="block text-xs opacity-70">100 questions</span>
            </button>
          ))}
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-6">
        <div className="ta-bar rounded-xl">
          <span className="text-[11px] tracking-[0.18em] uppercase text-[#7a6a5f]">
            Inside the codex
          </span>
          <span className="text-xs text-[#2a231d]">
            Search all 400 (keywords, sentences or &ldquo;exact phrases&rdquo;) &middot;
            filter by tradition &middot; sort by <strong>Most asked in Pakistan &amp; India</strong>
            &middot; tap any question to open it
          </span>
          <span className="ta-hits">{ready ? `${typedIndex.length} questions loaded` : "Loading\u2026"}</span>
        </div>

        <div>
          <iframe
            title="Comparative Apologetics Codex — 400 questions"
            src={src}
            onLoad={() => setReady(true)}
            loading="eager"
            ref={frameRef}
            className="w-full block"
            style={{ height: frameH, minHeight: 720, border: 0 }}
          />
        </div>

        <p className="text-center text-xs text-[#7a6a5f] font-sans mt-4">
          Prefer a full window?{" "}
          <a
            href={CODEX_SRC}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#4A152C]"
          >
            Open the codex in a new tab
          </a>{" "}
          &middot; printable (questions auto-expand when printing).
        </p>
      </section>

      {/* Crawlable text index of all 400 question titles (SEO + accessibility). */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-12 mb-16">
        <h2 className="font-serif text-2xl text-[#4A152C] mb-6 text-center font-bold">
          Complete Question Index
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {RELIGIONS.map((r) => (
            <div key={r.key}>
              <h3 className="font-serif font-bold text-lg text-[#4A152C] mb-3">
                {r.glyph}&nbsp;{r.label}{" "}
                <span className="text-xs font-sans font-normal text-[#7a6a5f]">{r.vol}</span>
              </h3>
              <ol className="space-y-1 text-sm font-sans text-[#2a231d]">
                {typedIndex
                  .filter((q) => q.religion === r.key)
                  .map((q) => (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => jumpTo("#" + q.id)}
                        className="text-left hover:text-[#8B1C2E] hover:underline"
                      >
                        <span className="text-[#7a6a5f] tabular-nums mr-2">
                          {String(q.n).padStart(2, "0")}
                        </span>
                        {q.q}
                      </button>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
