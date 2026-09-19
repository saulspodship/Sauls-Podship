/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WorldReligionsDeepDive — extended interactive study layer for
 * Vol. 15 Comparative Religion, rendered directly beneath the
 * "Comparative & Linguistic Reference Tables" section.
 *
 * Styled to match the Scriptorium volume vibe: ivory ground, white
 * cards, maroon (#4A152C) + gold (#D4AF37) accents, serif headings.
 */

import React, { useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Globe2,
  Info,
  Landmark,
  Moon,
  Scale,
  Sparkles,
  Hourglass,
} from "lucide-react";
import {
  ARTICLES_OF_FAITH,
  AVATARS,
  AVATAR_TIMELINE_POSITIONS,
  CHAKRAS,
  FAST_CHRISTIAN,
  FAST_HINDU,
  FAST_ISLAM,
  FAST_JEWISH,
  HINDU_CONCEPTS,
  HINDU_HISTORY,
  INDUS_NOTE,
  ISLAM_HISTORY,
  JEWISH_AFTERLIFE,
  JEWISH_CORE,
  JEWISH_FIGURES,
  JEWISH_HEAVENS,
  JEWISH_HISTORY,
  LOKAS,
  MOSQUES,
  PATTERNS,
  PILLARS,
  PROPHETS,
  SEVEN_HEAVENS,
  SYNAGOGUES,
  TEMPLES,
  YUGAS,
  type Concept,
  type Figure,
  type Pattern,
  type StackItem,
} from "../../data/worldReligionsDeepDive";

type MainTab = "hindu" | "islam" | "jewish" | "fasting" | "patterns";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "hindu", label: "Hinduism", icon: "🕉️" },
  { id: "islam", label: "Islam", icon: "☪️" },
  { id: "jewish", label: "Judaism", icon: "✡️" },
  { id: "fasting", label: "Fasting", icon: "⏳" },
  { id: "patterns", label: "Story Parallels", icon: "🔀" },
];

/* ---------- small building blocks (match VolumePage styling) ---------- */

function SubSection(props: {
  eyebrow?: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        {props.eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1C2E]">
            {props.eyebrow}
          </span>
        )}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A152C] mt-1">
          {props.title}
        </h3>
        {props.sub && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-3xl mx-auto leading-relaxed">
            {props.sub}
          </p>
        )}
      </div>
      {props.children}
    </div>
  );
}

function ExpandableStack(props: { items: StackItem[]; idPrefix: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-3 text-left">
      {props.items.map((item, idx) => {
        const open = openIdx === idx;
        return (
          <div
            key={`${props.idPrefix}-${idx}`}
            className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm transition-all hover:border-[#D4AF37]/60"
            style={{ borderLeftWidth: 4, borderLeftColor: item.color }}
          >
            <button
              onClick={() => setOpenIdx(open ? null : idx)}
              className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
            >
              <span className="min-w-0">
                <span className="block font-serif font-bold text-base text-[#1D2D50]">
                  {item.title}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {item.sub}
                </span>
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  open ? "rotate-180 text-[#4A152C]" : "text-gray-400"
                }`}
              />
            </button>
            {open && (
              <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-gray-700 leading-relaxed border-t border-gray-100">
                {item.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConceptGrid(props: { items: Concept[]; idPrefix: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      {props.items.map((c, idx) => {
        const open = openIdx === idx;
        return (
          <button
            key={`${props.idPrefix}-${idx}`}
            onClick={() => setOpenIdx(open ? null : idx)}
            className={`p-5 rounded-2xl bg-white border shadow-sm text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
              open ? "border-[#D4AF37]" : "border-gray-200 hover:border-[#D4AF37]/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-serif font-bold text-lg text-[#4A152C]">
                {c.name}
              </h4>
              <ChevronDown
                className={`w-4 h-4 mt-1 flex-shrink-0 transition-transform ${
                  open ? "rotate-180 text-[#4A152C]" : "text-gray-400"
                }`}
              />
            </div>
            <p className="text-[13px] text-gray-500 mt-1">{c.short}</p>
            {open && (
              <p className="text-[13px] text-gray-700 leading-relaxed mt-3 pt-3 border-t border-dashed border-gray-200">
                {c.long}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FigureCarousel(props: {
  figures: Figure[];
  idPrefix: string;
  detailLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);
  const current = props.figures[active];
  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1">
        {props.figures.map((f, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={`${props.idPrefix}-${idx}`}
              onClick={() => {
                setActive(idx);
                detailRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }}
              className={`flex-shrink-0 w-[132px] p-4 rounded-2xl border text-center transition-all ${
                isActive
                  ? "bg-amber-50 border-[#D4AF37] shadow-md"
                  : "bg-white border-gray-200 hover:border-[#D4AF37]/60 shadow-sm"
              }`}
            >
              <span
                className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full font-serif font-bold text-sm border ${
                  isActive
                    ? "bg-[#4A152C] text-[#E8C96A] border-[#D4AF37]"
                    : "bg-[#4A152C]/5 text-[#4A152C] border-[#4A152C]/20"
                }`}
              >
                {f.initials}
              </span>
              <span className="block text-[13px] font-bold text-gray-900 leading-tight">
                {f.name}
              </span>
              <span className="block text-[11px] text-gray-500 mt-1 leading-tight">
                {f.era}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={detailRef}
        className="rounded-2xl bg-white border border-[#4A152C]/15 shadow-sm p-6 sm:p-8 text-left scroll-mt-24"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A152C] text-[#E8C96A] font-serif font-bold border border-[#D4AF37]/60">
            {current.initials}
          </span>
          <div>
            <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#4A152C] leading-tight">
              {current.name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {current.form} · {current.era}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed mt-3">
          {current.story}
        </p>
        <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-gray-700 leading-relaxed">
          <strong className="text-[#4A152C]">
            {current.teachingLabel || "Traditionally read as"}:{" "}
          </strong>
          {current.teaching}
        </div>
      </div>
    </div>
  );
}

function PatternStack(props: { patterns: Pattern[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-3 text-left">
      {props.patterns.map((p, idx) => {
        const open = openIdx === idx;
        return (
          <div
            key={`pattern-${idx}`}
            className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:border-[#D4AF37]/60 transition-all"
            style={{ borderLeftWidth: 4, borderLeftColor: p.color }}
          >
            <button
              onClick={() => setOpenIdx(open ? null : idx)}
              className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
            >
              <span className="min-w-0">
                <span className="block font-serif font-bold text-base text-[#1D2D50]">
                  {p.title}
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  {p.sub}
                </span>
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  open ? "rotate-180 text-[#4A152C]" : "text-gray-400"
                }`}
              />
            </button>
            {open && (
              <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-gray-100 space-y-3">
                {p.segments.map((s, sIdx) => (
                  <p
                    key={sIdx}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    <strong className="text-[#4A152C]">{s.label} </strong>
                    {s.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- tab panels ---------- */

function HinduPanel() {
  const [yugaId, setYugaId] = useState("satya");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const avatarDetailRef = useRef<HTMLDivElement>(null);
  const yuga = YUGAS.find((y) => y.id === yugaId) || YUGAS[0];
  const avatar = AVATARS[avatarIdx];

  return (
    <div className="space-y-12">
      <p className="text-center text-xs sm:text-sm text-gray-500 max-w-3xl mx-auto">
        Below: the four cosmic ages, the ten avatars of Vishnu, the seven
        chakras, the seven lokas, Hinduism's history, and its largest temples —
        as presented within Hindu texts and tradition themselves.
      </p>

      <SubSection
        eyebrow="Hindu cosmology"
        title="The four yugas"
        sub="Hindu cosmology describes time as cyclical, moving through four ages of declining length and virtue, repeating endlessly."
      >
        {/* yuga proportion bar */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex h-12 rounded-xl overflow-hidden border border-gray-200">
            {YUGAS.map((y) => (
              <button
                key={y.id}
                onClick={() => setYugaId(y.id)}
                style={{ flex: y.flex, background: y.color }}
                className="flex items-center justify-center text-white text-[11px] sm:text-xs font-bold tracking-wide hover:brightness-110 transition"
                title={y.name}
              >
                {y.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-2">
            One full cycle (a mahayuga) runs Satya → Treta → Dvapara → Kali,
            then repeats. Tap a segment to study that age.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {YUGAS.map((y) => (
            <button
              key={y.id}
              onClick={() => setYugaId(y.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                y.id === yugaId
                  ? "bg-[#4A152C] text-[#E8C96A] shadow"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#D4AF37]/60"
              }`}
            >
              {y.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white border border-[#4A152C]/15 shadow-sm p-6 sm:p-8 text-left">
          <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#4A152C]">
            {yuga.name}{" "}
            <span className="text-sm font-sans font-normal text-gray-500">
              — {yuga.subtitle}
            </span>
            {yuga.id === "kali" && (
              <span className="ml-2 inline-block align-middle text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                traditionally, we are here now
              </span>
            )}
          </h4>
          <p className="text-[13px] text-gray-500 mt-1">{yuga.duration}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {yuga.qualities.map((q) => (
              <span
                key={q}
                className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#4A152C]/5 text-[#4A152C] border border-[#4A152C]/15"
              >
                {q}
              </span>
            ))}
          </div>
          <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed mt-4">
            {yuga.description}
          </p>
        </div>
      </SubSection>

      <SubSection
        eyebrow="Avatar timeline"
        title="Where each avatar falls on the timeline"
        sub="The bar runs across all four yugas in order. Each dot marks where an avatar is traditionally placed — tap one to jump to its story."
      >
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm px-5 sm:px-8 pt-10 pb-12">
          <div className="relative">
            <div className="flex h-11 rounded-lg overflow-hidden">
              {YUGAS.map((y) => (
                <div
                  key={y.id}
                  style={{ flex: y.flex, background: y.color }}
                  className="flex items-center justify-center text-white text-[10px] sm:text-[11px] font-bold"
                >
                  {y.name.split(" ")[0]}
                </div>
              ))}
            </div>
            {AVATARS.map((a, i) => (
              <button
                key={a.name}
                onClick={() => {
                  setAvatarIdx(i);
                  avatarDetailRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }}
                style={{ left: `${AVATAR_TIMELINE_POSITIONS[i]}%` }}
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow transition-all hover:scale-125 ${
                  i === avatarIdx
                    ? "bg-[#4A152C] scale-125 ring-2 ring-[#D4AF37]"
                    : "bg-white/95 hover:bg-[#E8C96A]"
                }`}
                title={`${a.name} — ${a.era}`}
                aria-label={`${a.name} — ${a.era}`}
              />
            ))}
            {/* labels alternate above / below */}
            <div className="relative h-0">
              {AVATARS.map((a, i) => (
                <button
                  key={`lbl-${a.name}`}
                  onClick={() => {
                    setAvatarIdx(i);
                    avatarDetailRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                  style={{ left: `${AVATAR_TIMELINE_POSITIONS[i]}%` }}
                  className={`absolute -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-[11px] font-bold ${
                    i % 2 === 0 ? "-top-[52px]" : "top-[30px]"
                  } ${i === avatarIdx ? "text-[#4A152C]" : "text-gray-500 hover:text-[#4A152C]"}`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection
        eyebrow="Dashavatara"
        title="The ten avatars (Dashavatara)"
        sub="In Vaishnava tradition, Vishnu descends in different forms across the ages to restore balance whenever dharma is under serious threat. Tap any figure."
      >
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1">
          {AVATARS.map((a, idx) => {
            const isActive = idx === avatarIdx;
            return (
              <button
                key={a.name}
                onClick={() => setAvatarIdx(idx)}
                className={`flex-shrink-0 w-[132px] p-4 rounded-2xl border text-center transition-all ${
                  isActive
                    ? "bg-amber-50 border-[#D4AF37] shadow-md"
                    : "bg-white border-gray-200 hover:border-[#D4AF37]/60 shadow-sm"
                }`}
              >
                <span
                  className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full font-serif font-bold text-sm border ${
                    isActive
                      ? "bg-[#4A152C] text-[#E8C96A] border-[#D4AF37]"
                      : "bg-[#4A152C]/5 text-[#4A152C] border-[#4A152C]/20"
                  }`}
                >
                  {a.initials}
                </span>
                <span className="block text-[13px] font-bold text-gray-900 leading-tight">
                  {a.name}
                </span>
                <span className="block text-[11px] text-gray-500 mt-1 leading-tight">
                  {a.era}
                </span>
              </button>
            );
          })}
        </div>
        <div
          ref={avatarDetailRef}
          className="rounded-2xl bg-white border border-[#4A152C]/15 shadow-sm p-6 sm:p-8 text-left scroll-mt-24"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A152C] text-[#E8C96A] font-serif font-bold border border-[#D4AF37]/60">
              {avatar.initials}
            </span>
            <div>
              <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#4A152C] leading-tight">
                {avatar.name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {avatar.form} · {avatar.era}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed mt-3">
            {avatar.story}
          </p>
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-gray-700 leading-relaxed">
            <strong className="text-[#4A152C]">Traditionally read as: </strong>
            {avatar.teaching}
          </div>
        </div>
      </SubSection>

      <SubSection
        eyebrow="Core concepts"
        title="A few core concepts"
        sub="These ideas run across most Hindu schools, though interpreted differently by each. Tap a card to expand."
      >
        <ConceptGrid items={HINDU_CONCEPTS} idPrefix="hindu-concept" />
      </SubSection>

      <SubSection
        eyebrow="Yogic tradition"
        title="The seven chakras"
        sub="In yogic and tantric traditions, the body is described as having seven main energy centers running from the base of the spine to the crown of the head. Tap one to expand."
      >
        <ExpandableStack items={CHAKRAS} idPrefix="chakra" />
      </SubSection>

      <SubSection
        eyebrow="Puranic cosmology"
        title="The seven lokas — realms beyond this life"
        sub="Puranic cosmology describes fourteen worlds: seven ascending upper realms (lokas) and seven lower ones (patalas). Below are the seven upper lokas — still within the cycle of rebirth (samsara) rather than final liberation (moksha)."
      >
        <ExpandableStack items={LOKAS} idPrefix="loka" />
        <p className="text-xs sm:text-sm text-gray-500 text-center max-w-2xl mx-auto">
          Moksha — liberation — is described as release from all fourteen
          worlds and from samsara itself, not simply reaching the highest loka.
        </p>
      </SubSection>

      <SubSection
        eyebrow="History"
        title="How old is Hinduism?"
        sub="Hinduism is widely described by historians as the oldest major religion still actively practiced today, with no single founder and no single founding date. Tap a period to expand."
      >
        <ExpandableStack items={HINDU_HISTORY} idPrefix="hindu-history" />
      </SubSection>

      <SubSection
        eyebrow="Sacred architecture"
        title="The world's biggest Hindu temples"
        sub="Some of the largest religious structures on Earth are Hindu temples, spread across India and Southeast Asia. Tap one to expand."
      >
        <ExpandableStack items={TEMPLES} idPrefix="temple" />
      </SubSection>
    </div>
  );
}

function IslamPanel() {
  return (
    <div className="space-y-12">
      <p className="text-center text-xs sm:text-sm text-gray-500 max-w-3xl mx-auto">
        Below: the Five Pillars, the Six Articles of Faith, key prophets
        recognized in Islam, the seven heavens of the Night Journey, Islam's
        history, and its largest mosques.
      </p>

      <SubSection
        eyebrow="Core worship"
        title="The Five Pillars of Islam"
        sub="The five core acts of worship considered obligatory for practicing Muslims. Tap a card to expand."
      >
        <ConceptGrid items={PILLARS} idPrefix="pillar" />
      </SubSection>

      <SubSection
        eyebrow="Core belief"
        title="The six articles of faith"
        sub="The core beliefs held across Sunni and Shia Islam, though articulated with some variation between schools. Tap one to expand."
      >
        <ExpandableStack items={ARTICLES_OF_FAITH} idPrefix="article" />
      </SubSection>

      <SubSection
        eyebrow="Prophethood"
        title="Prophets recognized in Islam"
        sub='The Quran names 25 prophets, several shared with Judaism and Christianity — including the five "Ulul Azm" (most resolute) messengers: Nuh, Ibrahim, Musa, Isa, and Muhammad. Tap one to expand.'
      >
        <FigureCarousel
          figures={PROPHETS}
          idPrefix="prophet"
          detailLabel="Traditionally emphasized as"
        />
      </SubSection>

      <SubSection
        eyebrow="Isra and Mi'raj"
        title="The seven heavens — the Night Journey"
        sub="Islamic tradition (Hadith accounts of the Isra and Mi'raj) describes the Prophet Muhammad ascending through seven heavens in a single night, meeting an earlier prophet at each level before proceeding, beyond the seventh, to receive the command of the five daily prayers."
      >
        <ExpandableStack items={SEVEN_HEAVENS} idPrefix="heaven" />
      </SubSection>

      <SubSection
        eyebrow="History"
        title="How old is Islam?"
        sub="Islam traces its founding to a specific place and time far more precisely than most ancient traditions. Tap a period to expand."
      >
        <ExpandableStack items={ISLAM_HISTORY} idPrefix="islam-history" />
      </SubSection>

      <SubSection
        eyebrow="Sacred architecture"
        title="The world's biggest mosques"
        sub="Some of the largest congregational spaces on Earth are mosques, several capable of holding over a million worshippers during Hajj. Tap one to expand."
      >
        <ExpandableStack items={MOSQUES} idPrefix="mosque" />
      </SubSection>
    </div>
  );
}

function JewishPanel() {
  return (
    <div className="space-y-12">
      <p className="text-center text-xs sm:text-sm text-gray-500 max-w-3xl mx-auto">
        Below: core beliefs and practices, key patriarchs and prophets, the
        seven heavens described in the Talmud, views of the afterlife,
        Judaism's history, and its largest synagogues.
      </p>

      <SubSection
        eyebrow="Core life"
        title="Core beliefs and practices"
        sub="A few ideas and practices central to Jewish life, interpreted with real variation across Orthodox, Conservative, and Reform movements. Tap a card to expand."
      >
        <ConceptGrid items={JEWISH_CORE} idPrefix="jewish-core" />
      </SubSection>

      <SubSection
        eyebrow="Patriarchs & prophets"
        title="Patriarchs and prophets"
        sub="Central figures from the Torah and Hebrew Bible, several shared with Christianity and Islam. Tap one to expand."
      >
        <FigureCarousel
          figures={JEWISH_FIGURES}
          idPrefix="jewish-figure"
          detailLabel="Traditionally emphasized as"
        />
      </SubSection>

      <SubSection
        eyebrow="Talmud · Chagigah 12b"
        title="The seven heavens (Talmud, Chagigah 12b)"
        sub='Rabbinic tradition describes seven layered heavens, each about a "five-hundred-year journey" from the next, holding different elements of creation. Tap one to expand.'
      >
        <ExpandableStack items={JEWISH_HEAVENS} idPrefix="jewish-heaven" />
      </SubSection>

      <SubSection
        eyebrow="Afterlife"
        title="Views of the afterlife"
        sub="Judaism has no single official doctrine of the afterlife — views have shifted across eras and denominations, with more historical emphasis placed on covenant and conduct in this life."
      >
        <ExpandableStack items={JEWISH_AFTERLIFE} idPrefix="jewish-afterlife" />
      </SubSection>

      <SubSection
        eyebrow="History"
        title="How old is Judaism?"
        sub="Commonly described as the oldest of the three Abrahamic monotheistic traditions to take shape as an organized religion. Tap a period to expand."
      >
        <ExpandableStack items={JEWISH_HISTORY} idPrefix="jewish-history" />
      </SubSection>

      <SubSection
        eyebrow="Sacred architecture"
        title="The world's biggest synagogues"
        sub="Synagogues are generally smaller than the grand temple and mosque complexes covered elsewhere, but a few stand out for scale or history. Tap one to expand."
      >
        <ExpandableStack items={SYNAGOGUES} idPrefix="synagogue" />
      </SubSection>
    </div>
  );
}

function FastingPanel() {
  return (
    <div className="space-y-12">
      <p className="text-center text-xs sm:text-sm text-gray-500 max-w-3xl mx-auto">
        Every tradition on this page treats fasting as a meaningful spiritual
        practice, though the rules, frequency, and purpose differ. Each
        tradition's own practices are broken out below.
      </p>

      <SubSection
        eyebrow="Vrat"
        title="🕉️ Fasting in Hinduism (Vrat)"
        sub="Hindu fasting is highly varied by region, deity, and personal vow, ranging from complete abstention to eating only specific foods. Tap one to expand."
      >
        <ExpandableStack items={FAST_HINDU} idPrefix="fast-hindu" />
      </SubSection>

      <SubSection
        eyebrow="Sawm"
        title="☪️ Fasting in Islam (Sawm)"
        sub="Islamic fasting means abstaining from food, drink, and marital relations from dawn to sunset. Tap one to expand."
      >
        <ExpandableStack items={FAST_ISLAM} idPrefix="fast-islam" />
      </SubSection>

      <SubSection
        eyebrow="Ta'anit"
        title="✡️ Fasting in Judaism (Ta'anit)"
        sub="Jewish fasts range from full 25-hour fasts to shorter dawn-to-dusk fasts, mostly tied to historical events of mourning or repentance. Tap one to expand."
      >
        <ExpandableStack items={FAST_JEWISH} idPrefix="fast-jewish" />
      </SubSection>

      <SubSection
        eyebrow="Christian fasting"
        title="✝️ Fasting in Christianity"
        sub="Christian fasting practice varies widely by denomination, from strict multi-week fasts to a general call to voluntary simplicity. Tap one to expand."
      >
        <ExpandableStack items={FAST_CHRISTIAN} idPrefix="fast-christian" />
      </SubSection>
    </div>
  );
}

function PatternsPanel() {
  return (
    <div className="space-y-12">
      <SubSection
        eyebrow="Comparative observation"
        title="Shared story patterns across traditions"
        sub="Scholars of comparative mythology have long noted that certain story patterns — a great flood, a threatened infant hero, a near-sacrifice, a temptation before a mission, a promised return — appear across cultures with little to no direct historical contact, including Sumerian and Babylonian texts, Zoroastrianism, and Buddhism. Listing them side by side is not a claim that any one tradition borrowed from another — it is simply an observation of recurring human narrative patterns, presented neutrally. Tap a pattern to see how each tradition tells it."
      >
        <PatternStack patterns={PATTERNS} />
      </SubSection>

      <SubSection
        eyebrow="Indus Valley"
        title="What about Harappa and Mohenjo-daro?"
        sub="The Indus Valley Civilization (c. 3300–1300 BCE) is often the first thing that comes up when people ask about very old “lost” religions — but it can't be pattern-matched the way the traditions above can, for an important reason."
      >
        <div className="rounded-2xl bg-white border border-[#4A152C]/15 shadow-sm p-6 sm:p-8 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1C2E]">
              {INDUS_NOTE.meta}
            </span>
          </div>
          <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#4A152C]">
            {INDUS_NOTE.title}
          </h4>
          <div className="space-y-3 mt-3">
            {INDUS_NOTE.paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-sm sm:text-[15px] text-gray-700 leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-gray-700 leading-relaxed">
            <strong className="text-[#4A152C]">
              Why this differs from the patterns above:{" "}
            </strong>
            {INDUS_NOTE.teaching}
          </div>
        </div>
      </SubSection>

      <p className="text-center text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed border-t border-gray-200 pt-6">
        Each tradition's account is summarized here on its own terms. Placing
        them together is a comparative-religion exercise, not an argument about
        which came first or which is correct — the Scriptorium's confession
        remains that salvation is in Christ alone (John 14:6; Acts 4:12).
      </p>
    </div>
  );
}

/* ---------- main section ---------- */

export const WorldReligionsDeepDive: React.FC = () => {
  const [tab, setTab] = useState<MainTab>("hindu");

  return (
    <section id="world-religions-deep-dive" className="space-y-10 scroll-mt-24">
      {/* header — mirrors the Reference Tables header */}
      <div className="border-b border-gray-200 pb-4 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8B1C2E]">
          Extended Comparative Study
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A152C] mt-1 flex items-center justify-center gap-2">
          <Globe2 className="w-6 h-6 text-[#D4AF37]" />
          Understanding World Religions — In Their Own Words
        </h2>
        <div
          className="flex items-center justify-center gap-2 mt-2"
          aria-hidden="true"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/70" />
          <span className="text-[#D4AF37] text-xs">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/70" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-3xl mx-auto">
          An interactive overview of Hinduism, Islam, and Judaism — their
          history, core beliefs, key figures, heavens, fasting, sacred spaces,
          and shared story patterns — sitting directly beneath the reference
          tables as one continuous study layer.
        </p>
      </div>

      {/* framing note */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#4A152C]/5 border border-[#4A152C]/15 flex items-start gap-3 text-left">
        <Info className="w-5 h-5 text-[#8B1C2E] flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          <strong className="text-[#4A152C]">
            How to read this section:{" "}
          </strong>
          each tradition below is summarized{" "}
          <em>as that tradition presents itself</em>, as a starting point for
          understanding — not a complete or final account. Schools, regions,
          and interpretations vary widely within every faith. It is included
          so Christians can understand neighbors accurately, respect them
          sincerely, and witness wisely — holding fast that Christ alone is
          “the way and the truth and the life” (John 14:6).
        </p>
      </div>

      {/* main tabs */}
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="World religions"
      >
        {MAIN_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                active
                  ? "bg-[#4A152C] text-[#E8C96A] shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#D4AF37]/60 shadow-sm"
              }`}
            >
              <span className="mr-1.5" aria-hidden="true">
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* panels */}
      <div className="rounded-3xl bg-white/60 border border-gray-200 shadow-sm p-5 sm:p-8 lg:p-10">
        {tab === "hindu" && <HinduPanel />}
        {tab === "islam" && <IslamPanel />}
        {tab === "jewish" && <JewishPanel />}
        {tab === "fasting" && <FastingPanel />}
        {tab === "patterns" && <PatternsPanel />}
      </div>

      {/* footer strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <BookOpen className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
            <strong className="text-[#4A152C]">Study tip —</strong> expand one
            card at a time and compare it with the reference tables above.
          </p>
        </div>
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <Scale className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
            <strong className="text-[#4A152C]">Fair witness —</strong> describe
            each faith as its own adherents would recognize it before
            responding with the gospel.
          </p>
        </div>
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          {tab === "fasting" ? (
            <Hourglass className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          ) : tab === "patterns" ? (
            <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          ) : (
            <Moon className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          )}
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
            <strong className="text-[#4A152C]">Keep exploring —</strong> switch
            tabs above to move between Hinduism, Islam, Judaism, fasting, and
            story parallels.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorldReligionsDeepDive;
