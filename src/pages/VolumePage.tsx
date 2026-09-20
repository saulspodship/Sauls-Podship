/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, Calendar, Clock, ExternalLink, Play, ChevronLeft, 
  ChevronRight, Bookmark, Share2, ShieldCheck, Sparkles, 
  Layers, MapPin, HelpCircle, CheckCircle2, Table, Info,
  Search, Download, Copy, Check, Filter, ArrowUpRight, X, FileText, Printer, Globe2
, Network} from 'lucide-react';
import { getVolumeBySlug, VOLUMES } from '../data/volumes';
import Hero from '../components/Hero';
import ManuscriptAnalysis from '../components/ManuscriptAnalysis';
import NotFoundPage from './NotFoundPage';
import VolumeNumberRedirect from './VolumeNumberRedirect';
import { StoryPanel, Volume } from '../types';
import { ScriptureRef } from '../components/ScriptureRef';
import { InlineMd } from '../components/InlineMd';
import { StorySceneIcon, sceneForStory } from '../components/story/StorySceneIcon';
import { sceneImageFor, storyArt } from '../components/story/storyScenes';
import { bibleComUrl } from '../lib/bibleRef';
import { SITE } from '../config/site';
import AutoFrame from '../components/modules/AutoFrame';
import { usePageMeta, SITE_URL } from '../lib/pageMeta';

/** Applies this volume's title / description / canonical / OG tags. */
const VolumeMeta: React.FC<{ volume: Volume }> = ({ volume }) => {
  const numPadded = volume.number < 10 ? `0${volume.number}` : `${volume.number}`;
  const hero = volume.heroImage?.src;
  usePageMeta({
    title: (volume as { metaTitle?: string }).metaTitle || `${volume.title} | Volume ${numPadded} Theological Encyclopedia | Saul's Podship`,
    description: volume.metaDescription || volume.summary || volume.overview || `Scholarly exegesis and theological analysis of ${volume.title}.`,
    keywords: volume.keywords,
    path: `/encyclopedia/${volume.slug}`,
    image: hero?.startsWith('/') ? `${SITE_URL}${hero}` : (hero || undefined),
    ogType: 'article',
  });
  return null;
};



export const VolumePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Interactive Story Panels State
  const [selectedEra, setSelectedEra] = useState<string>('All');
  const [storyPage, setStoryPage] = useState<number>(0);
  const STORY_PAGE_SIZE = 50;
  const [panelSearchQuery, setPanelSearchQuery] = useState<string>('');
  const [activeStoryModal, setActiveStoryModal] = useState<StoryPanel | null>(null);

  // Table Search & Copy States
  const [tableSearch, setTableSearch] = useState<{ [tableIdx: number]: string }>({});
  const [copiedTableIdx, setCopiedTableIdx] = useState<number | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // If slug is purely digits (e.g. /encyclopedia/47 or /encyclopedia/02)
  if (slug && /^\d{1,2}$/.test(slug)) {
    return <VolumeNumberRedirect num={parseInt(slug, 10)} />;
  }

  if (!slug) {
    return <NotFoundPage status={404} />;
  }

  const volume = getVolumeBySlug(slug);

  if (!volume) {
    return <NotFoundPage status={404} />;
  }

  // Calculate adjacent volumes for bottom navigation
  const currentIndex = VOLUMES.findIndex(v => v.slug.toLowerCase() === volume.slug.toLowerCase());
  const prevVolume = currentIndex > 0 ? VOLUMES[currentIndex - 1] : null;
  const nextVolume = currentIndex < VOLUMES.length - 1 ? VOLUMES[currentIndex + 1] : null;

  // Compute related volume objects
  const relatedVolumeObjects = (volume.relatedVolumes || [])
    .map(relSlug => getVolumeBySlug(relSlug))
    .filter((v): v is typeof volume => !!v);

  // Extract unique eras for story panels if present
  const allEras = useMemo(() => {
    if (!volume.content?.storyPanels) return [];
    const set = new Set<string>();
    volume.content.storyPanels.forEach(p => {
      if (p.era) set.add(p.era);
    });
    return ['All', ...Array.from(set)];
  }, [volume.content?.storyPanels]);

  // Filtered Story Panels
  const filteredPanels = useMemo(() => {
    if (!volume.content?.storyPanels) return [];
    return volume.content.storyPanels.filter(p => {
      const matchEra = selectedEra === 'All' || p.era === selectedEra;
      const q = panelSearchQuery.toLowerCase();
      const matchQuery = !q || 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.scripture.toLowerCase().includes(q) ||
        (p.theologicalTheme && p.theologicalTheme.toLowerCase().includes(q)) ||
        (p.characters && p.characters.toLowerCase().includes(q));
      return matchEra && matchQuery;
    });
  }, [volume.content?.storyPanels, selectedEra, panelSearchQuery]);

  const pagePanels = useMemo(
    () => filteredPanels.slice(storyPage * STORY_PAGE_SIZE, (storyPage + 1) * STORY_PAGE_SIZE),
    [filteredPanels, storyPage]
  );
  const storyPages = Math.max(1, Math.ceil(filteredPanels.length / STORY_PAGE_SIZE));
  useEffect(() => { setStoryPage(0); }, [selectedEra, panelSearchQuery]);

  // Copy Citation Helper
  const handleCopyCitation = () => {
    const citation = `Saul's Podship Scriptorium. "${volume.title}: ${volume.subtitle || ''}." The 51-Volume Theological Encyclopedia, Vol. ${volume.number}, edited by Solat Nadeem, ${new Date().getFullYear()}, https://www.saulspodship.com/encyclopedia/${volume.slug}.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  // Copy Table Helper
  const handleCopyTable = (tableIdx: number, title: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join('\t'),
      ...rows.map(r => r.join('\t'))
    ].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopiedTableIdx(tableIdx);
    setTimeout(() => setCopiedTableIdx(null), 2000);
  };

  // Download Table CSV
  const handleDownloadTableCSV = (title: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${volume.slug}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Schema JSON-LD for Search Engine Indexing & AdSense compliance
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `https://www.saulspodship.com/encyclopedia/${volume.slug}#article`,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.saulspodship.com/#website",
          "name": "Saul's Podship",
          "url": "https://www.saulspodship.com"
        },
        "headline": volume.title,
        "description": volume.metaDescription || volume.summary,
        "datePublished": "2026-01-01",
        "dateModified": volume.lastUpdated || "2026-09-06",
        "mainEntityOfPage": `https://www.saulspodship.com/encyclopedia/${volume.slug}`,
        "author": {
          "@type": "Person",
          "name": "Solat Nadeem",
          "jobTitle": "Founder & Lead Exegete",
          "worksFor": {
            "@type": "Organization",
            "name": "Saul's Podship Scriptorium"
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": "Saul's Podship",
          "url": "https://www.saulspodship.com"
        },
        "image": volume.heroImage?.src?.startsWith("/") ? `${SITE.url}${volume.heroImage.src}` : (volume.heroImage?.src || "https://www.saulspodship.com/images/hero/last-supper-v2-1920.webp")
      },
      {
        "@type": "FAQPage",
        "@id": `https://www.saulspodship.com/encyclopedia/${volume.slug}#faq`,
        "mainEntity": (volume.faq || []).map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  };

  return (
    <div className="w-full bg-[#FDFBF7]">
      <VolumeMeta volume={volume} />
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* 1. Shared Full-Bleed Volume Hero */}
      <Hero variant="volume" volume={volume} />

      {/* 3. Main Volume Body */}
      <div id="volume-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Core Summary / Answer-First Box */}
        {slug === 'biblical-maps' && (
          <section id="biblical-atlas" className="pt-8 pb-2 text-center scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C]">
              The Biblical Atlas &mdash; Interactive Journey Maps
            </h2>
            <p className="text-[11px] sm:text-sm text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
              Eight study maps on true geography. Press &ldquo;Walk the Journey&rdquo; and footsteps
              trace Abraham, the Exodus, the seven churches and Paul&rsquo;s three journeys station by station.
            </p>
            <AutoFrame src="/biblical-maps/index.html" title="The Biblical Atlas — interactive journey maps" initial="70vh" min={520} />
          </section>
        )}

        {volume.summary && (
          <section id="summary" className="p-8 sm:p-10 rounded-3xl bg-[#4A152C]/5 border-2 border-[#4A152C]/20 shadow-sm relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#8B1C2E] mb-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Core Theological Definition &amp; Summary
            </div>
            <p className="font-serif text-lg sm:text-xl text-[#1D2D50] leading-relaxed font-normal max-w-4xl mx-auto">
              {volume.summary}
            </p>
          </section>
        )}

        {/* Key Facts Box */}
        {volume.keyFacts && volume.keyFacts.length > 0 && (
          <section id="key-facts" className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Essential Foundations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] flex items-center justify-center gap-2.5 mt-1">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                Foundational Exegetical Facts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {volume.keyFacts.map((fact, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/90 border border-gray-200 hover:border-[#D4AF37]/40 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-[#8B1C2E] flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Companion Modules — every volume page links the interactive companions */}
        <section id="companion-modules" className="rounded-3xl bg-[#1A0812] border-2 border-[#D4AF37]/40 shadow-xl p-6 sm:p-8 scroll-mt-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-[#E8C96A]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E8C96A]">Companion Modules</span>
          </div>
          <p className="text-center text-[11px] sm:text-xs text-white/60 mb-5 max-w-xl mx-auto">
            Interactive charts woven from the same scholarship as the 51 volumes — open them alongside this dossier.
          </p>
          <div className="mx-auto flex w-full flex-wrap items-center justify-center gap-3">
            <a href="/prophecy-map" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8C96A] font-bold text-xs border border-[#D4AF37]/30 transition-all">
              <Globe2 className="w-3.5 h-3.5" /> Biblical Prophecy Map
            </a>
            <a href="/cross-references" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#E8C96A] font-bold text-xs border border-[#D4AF37]/30 transition-all">
              <Network className="w-3.5 h-3.5" /> The Interlinked Bible
            </a>
          </div>
        </section>

                {/* Scholarly Exegesis & Theological Analysis Prose using ManuscriptAnalysis */}
        {volume.content?.analysis && (
          <section id="exegesis" className="p-8 sm:p-12 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-8">
            <div className="border-b border-gray-200 pb-4 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Manuscript Exegesis &amp; Historical Context
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A152C] mt-1">
                Textual Exegesis &amp; Hermeneutics
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
                Grammatical-historical analysis, covenantal progression, original language considerations, and canonical cross-references.
              </p>
            </div>

            {/* Clean Formatted Component (Removing Asterisks, Dashes, Layout Issues) */}
            <ManuscriptAnalysis 
              content={volume.content.analysis} 
              volumeTitle={volume.title} 
              onExploreEra={(era) => {
                setSelectedEra(era);
                const el = document.getElementById('story-panels');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </section>
        )}

        {/* Doctrinal Reference Data Tables with Real-Time Search & CSV Export */}
        {volume.content?.tables && volume.content.tables.length > 0 && (
          <section id="tables" className="space-y-8">
            <div className="border-b border-gray-200 pb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Doctrinal Reference Data
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-1 flex items-center justify-center gap-2">
                <Table className="w-6 h-6 text-[#D4AF37]" />
                Comparative &amp; Linguistic Reference Tables
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2" aria-hidden="true">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/70" />
                <span className="text-[#D4AF37] text-xs">&#10022;</span>
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/70" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-3xl mx-auto">
                The complete comparative apparatus of this volume in one continuous study layer: canonical taxonomy, synoptic parallels &amp; audiences, Greek&ndash;Hebrew linguistic keys, corrected misreadings, first-century cultural background, and single-sentence exegesis of every parable.
              </p>
            </div>

            {volume.content.tables.map((table, tIdx) => {
              const query = (tableSearch[tIdx] || '').toLowerCase();
              const filteredRows = table.rows.filter(row => 
                !query || row.some(cell => cell.toLowerCase().includes(query))
              );

              return (
                <div key={tIdx} className="rounded-3xl bg-white border border-[#4A152C]/15 overflow-hidden shadow-sm">
                  {/* Table Header Bar */}
                  <div className="bg-[#4A152C] px-6 py-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#E8C96A]">
                      {table.title}
                    </h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-white/50" />
                        <input
                          type="text"
                          value={tableSearch[tIdx] || ''}
                          onChange={(e) => setTableSearch(prev => ({ ...prev, [tIdx]: e.target.value }))}
                          placeholder="Filter rows..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20"
                        />
                      </div>
                      <button
                        onClick={() => handleCopyTable(tIdx, table.title, table.headers, table.rows)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1"
                        title="Copy Table to Clipboard"
                      >
                        {copiedTableIdx === tIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDownloadTableCSV(table.title, table.headers, table.rows)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] text-xs font-bold flex items-center gap-1"
                        title="Download CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-center border-collapse text-xs sm:text-sm mx-auto">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-100 border-b border-gray-200">
                          {table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3.5 font-bold text-gray-800 uppercase tracking-wider text-[11px] bg-gray-100 text-center align-middle">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredRows.length > 0 ? (
                          filteredRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-amber-50/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3.5 text-gray-700 leading-relaxed font-sans text-center align-middle">
                                  <InlineMd text={cell} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={table.headers.length} className="px-4 py-8 text-center text-gray-500 italic">
                              No matching rows found for "{tableSearch[tIdx]}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 text-right text-[11px] text-gray-500 border-t border-gray-200">
                    Showing {filteredRows.length} of {table.rows.length} rows &bull; Scriptorium Verified Data
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Interactive Story Panels & Historical Narratives (Visual Era Explorer) */}
        {volume.content?.storyPanels && volume.content.storyPanels.length > 0 && (
          <section id="story-panels" className="space-y-6">
            <div className="border-b border-gray-200 pb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Biblical Narrative Progression
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-1">
                Visual Era Explorer &amp; Story Panels ({volume.content.storyPanels.length})
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl mx-auto">
                Filter through canonical eras or search for specific biblical accounts, covenants, and typological links.
              </p>
            </div>

            {/* Controls Bar: Era Filter & Search */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Field */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={panelSearchQuery}
                    onChange={(e) => setPanelSearchQuery(e.target.value)}
                    placeholder="Search stories, scripture, characters..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#4A152C]"
                  />
                  {panelSearchQuery && (
                    <button onClick={() => setPanelSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong>{filteredPanels.length}</strong> of <strong>{volume.content.storyPanels.length}</strong> narratives
                </div>
              </div>

              {/* Era Pills Bar */}
              {allEras.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  {allEras.map((era) => {
                    const isActive = selectedEra === era;
                    return (
                      <button
                        key={era}
                        onClick={() => setSelectedEra(era)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-[#4A152C] text-[#E8C96A] shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {era}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid of Story Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pagePanels.map((panel, pIdx) => (
                <div 
                  key={panel.id || pIdx} 
                  onClick={() => setActiveStoryModal(panel)}
                  className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {(() => {
                      const g = sceneForStory(panel.title, panel.era, `${panel.description} ${panel.characters || ''}`);
                      const img = storyArt(panel.id) ?? sceneImageFor(g);
                      if (!img) return null;
                      return (
                        <div className="rounded-xl overflow-hidden border border-gray-200 group-hover:border-[#D4AF37]/60 shadow-sm transition-colors">
                          <img src={img} alt={`${panel.title} — painted scene`} loading="lazy" decoding="async" className="w-full h-44 sm:h-52 object-cover" />
                        </div>
                      );
                    })()}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StorySceneIcon
                          glyph={sceneForStory(panel.title, panel.era, `${panel.description} ${panel.characters || ''}`)}
                          accent={panel.colorTheme}
                          size={44}
                        />
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4A152C]/10 text-[#4A152C] whitespace-nowrap">
                          {panel.era}
                        </span>
                      </div>
                      <ScriptureRef reference={panel.scripture} className="text-xs font-semibold text-[#8B1C2E] bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors" />
                    </div>
                    <h3 className="font-serif font-bold text-xl text-gray-900 group-hover:text-[#4A152C] transition-colors">
                      {panel.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-sans">
                      <InlineMd text={panel.description} />
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    {panel.theologicalTheme && (
                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span className="font-bold text-gray-700">Theme:</span>
                        <span className="font-medium text-[#4A152C]">{panel.theologicalTheme}</span>
                      </div>
                    )}
                    {panel.connections && (
                      <div className="text-[11px] text-gray-500 line-clamp-1 italic">
                        Cross-ref: {panel.connections}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {storyPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-gray-200">
                <button
                  onClick={() => setStoryPage(pg => Math.max(0, pg - 1))}
                  disabled={storyPage === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A152C] text-[#E8C96A] text-sm font-bold shadow hover:bg-[#681E3E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Page <strong className="text-[#4A152C]">{storyPage + 1}</strong> of {storyPages} · Stories {storyPage * STORY_PAGE_SIZE + 1}–{Math.min((storyPage + 1) * STORY_PAGE_SIZE, filteredPanels.length)} of {filteredPanels.length}
                </span>
                <button
                  onClick={() => setStoryPage(pg => Math.min(storyPages - 1, pg + 1))}
                  disabled={storyPage >= storyPages - 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A152C] text-[#E8C96A] text-sm font-bold shadow hover:bg-[#681E3E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Story Modal Detail Viewer */}
        {activeStoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37]/40 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveStoryModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {(() => {
                const img = storyArt(activeStoryModal.id) ?? sceneImageFor(sceneForStory(activeStoryModal.title, activeStoryModal.era, `${activeStoryModal.description} ${activeStoryModal.characters || ''}`));
                if (!img) return null;
                return (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm -mx-2 -mt-2">
                    <img src={img} alt={`${activeStoryModal.title} — painted scene`} decoding="async" className="w-full h-44 sm:h-60 object-cover" />
                  </div>
                );
              })()}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StorySceneIcon
                    glyph={sceneForStory(activeStoryModal.title, activeStoryModal.era, `${activeStoryModal.description} ${activeStoryModal.characters || ''}`)}
                    accent="#D4AF37"
                    size={52}
                  />
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#4A152C] text-[#E8C96A]">
                    {activeStoryModal.era}
                  </span>
                  <ScriptureRef reference={activeStoryModal.scripture} className="text-xs font-bold text-[#8B1C2E] bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md border border-red-200 transition-colors" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A0812]">
                  {activeStoryModal.title}
                </h3>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
                <p><InlineMd text={activeStoryModal.description} /></p>
                
                {activeStoryModal.characters && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Key Biblical Figures</div>
                    <div className="font-medium text-gray-900"><InlineMd text={activeStoryModal.characters} /></div>
                  </div>
                )}

                {activeStoryModal.theologicalTheme && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">Central Theological Theme</div>
                    <div className="font-serif font-bold text-[#4A152C] text-base"><InlineMd text={activeStoryModal.theologicalTheme} /></div>
                  </div>
                )}

                {activeStoryModal.connections && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Typological &amp; Canonical Connections</div>
                    <div className="text-sm text-blue-950 font-medium"><InlineMd text={activeStoryModal.connections} /></div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${activeStoryModal.title} (${activeStoryModal.scripture}): ${activeStoryModal.description}`);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#4A152C]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Passage Summary</span>
                </button>
                {bibleComUrl(activeStoryModal.scripture, 'RSV') && (
                  <span className="inline-flex items-center gap-2">
                    <a
                      href={bibleComUrl(activeStoryModal.scripture, 'RSV')!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D4E89] hover:bg-[#2A6BB8] px-3.5 py-2 rounded-lg transition-colors"
                      title="Read on Bible.com — Revised Standard Version (Pakistan Bible Society 'Common Bible' edition)"
                    >
                      Read on Bible.com (RSV) <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={bibleComUrl(activeStoryModal.scripture, 'KJV')!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A152C] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 border border-[#D4AF37]/50 px-3 py-2 rounded-lg transition-colors"
                      title="Read on Bible.com — King James Version"
                    >
                      KJV <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                )}
                <button
                  onClick={() => setActiveStoryModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#4A152C] hover:bg-[#681E3E] text-white text-xs font-bold"
                >
                  Close Narrative
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Clickable Scriptorium Study Toolkit & Verified Links */}
        <section id="resources" className="p-8 sm:p-10 rounded-3xl bg-[#1A0812] text-white border-2 border-[#D4AF37]/40 shadow-xl space-y-6 text-center">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8C96A]">
              Official Publications &amp; Multi-Media Resources
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Scriptorium Study Toolkit &amp; Verified Links
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-2xl mx-auto">
              Access the companion research blog manuscript, video masterclasses, printable study outlines, and academic citations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {volume.articleLink && (
              <a
                href={volume.articleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E8C96A] text-[#1A0812] font-bold text-xs tracking-wide shadow transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Read Full Blog Article</span>
              </a>
            )}

            {volume.youtubeLink ? (
              <a
                href={volume.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Video Masterclass</span>
              </a>
            ) : (
              <a
                href={SITE.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Official YouTube Channel</span>
              </a>
            )}

            <button
              onClick={handleCopyCitation}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide shadow transition-all"
            >
              <Copy className="w-4 h-4 text-[#E8C96A]" />
              <span>{copiedCitation ? "Citation Copied!" : "Copy Citation"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide shadow transition-all"
            >
              <Printer className="w-4 h-4 text-[#E8C96A]" />
              <span>Print Study Guide</span>
            </button>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) Accordion */}
        {volume.faq && volume.faq.length > 0 && (
          <section id="faq" className="space-y-6">
            <div className="border-b border-gray-200 pb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Theological Inquiries
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-1 flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#D4AF37]" />
                Frequently Asked Exegetical Questions
              </h2>
            </div>

            <div className="space-y-3">
              {volume.faq.map((faqItem, fIdx) => {
                const isOpen = openFaqIndex === fIdx;
                return (
                  <div
                    key={fIdx}
                    className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-serif font-bold text-base text-[#1D2D50] hover:text-[#4A152C] transition-colors"
                    >
                      <span>{faqItem.q}</span>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90 text-[#4A152C]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-100 font-sans">
                        {faqItem.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Volumes Grid */}
        {relatedVolumeObjects.length > 0 && (
          <section id="related" className="space-y-6 pt-6 text-center">
            <div className="border-b border-gray-200 pb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
                Connected Doctrine
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#4A152C] mt-1">
                Related Theological Volumes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedVolumeObjects.map((relVol) => {
                const relNum = relVol.number < 10 ? `0${relVol.number}` : `${relVol.number}`;
                return (
                  <Link
                    key={relVol.id}
                    to={`/encyclopedia/${relVol.slug}`}
                    className="group p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:-translate-y-1 text-center"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#1A0812] text-[#D4AF37]">
                          Vol. {relNum}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {relVol.category}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-gray-900 group-hover:text-[#4A152C] transition-colors mb-1">
                        {relVol.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {relVol.summary || relVol.overview}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-xs font-bold text-[#4A152C]">
                      <span>Read Volume</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Previous / Next Volume Pagination Navigation */}
        <nav aria-label="Adjacent Volume Navigation" className="pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center gap-4 text-center">
          {prevVolume ? (
            <Link
              to={`/encyclopedia/${prevVolume.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[#4A152C] hover:text-[#4A152C] transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Vol. {prevVolume.number < 10 ? `0${prevVolume.number}` : prevVolume.number}: {prevVolume.title}</span>
            </Link>
          ) : <div />}

          {nextVolume && (
            <Link
              to={`/encyclopedia/${nextVolume.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[#4A152C] hover:text-[#4A152C] transition-all shadow-sm text-right"
            >
              <span>Vol. {nextVolume.number < 10 ? `0${nextVolume.number}` : nextVolume.number}: {nextVolume.title}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </nav>

        {slug === 'biblical-maps' && (
          <section className="pt-8 pb-10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C]">
              World Faith &amp; Population Map
            </h2>
            <p className="text-[11px] sm:text-sm text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
              Every territory filled by its majority religion &mdash; Christianity in green &mdash; with global
              adherent totals in the legend and national populations on hover.
            </p>
            <AutoFrame src="/world-religion-map/index.html" title="World religion and population map" initial="70vh" min={480} />
          </section>
        )}

      </div>
    </div>
  );
};

export default VolumePage;
