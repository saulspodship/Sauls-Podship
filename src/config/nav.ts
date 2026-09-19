/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * NAV — the whole site, categorised, in one place.
 *
 * The header used to cram eight flat links next to the logo, so most of the
 * site (maps, archives, Zaboor, legal pages, the ministry subdomains) was only
 * reachable from the footer or the mobile "More" sheet. Everything is now
 * grouped into five dropdowns and this file is the single source of truth:
 * the desktop mega-menu, the mobile drawer and the injected header on the
 * standalone module shells all read the same taxonomy.
 *
 * Rules for editing:
 *  - one destination, one home — do not repeat a link in two groups;
 *  - `route`   → internal SPA path (rendered with react-router <Link>);
 *  - `static`  → a file served from /public (plain <a>, full page load);
 *  - `external`→ off-site URL, including our ministry subdomains on
 *                our own saulspodship.com subdomains (Sunday School,
 *                Biblical Languages).
 */
import type { ComponentType } from 'react';
import {
  BookMarked, BookOpen, CalendarDays, Camera, Church, Compass, FileText, Globe2,
  GraduationCap, Heart, HelpCircle, History, Info, Languages,
  LibraryBig, Landmark, Map as MapIcon, MessageSquare, Mic, Music2, Network,
  Play, Scale, ScrollText, ShieldCheck, Sparkles, Users, Video,
} from 'lucide-react';
import { SITE } from './site';

export type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;
export type NavKind = 'route' | 'static' | 'external';

export interface NavItem {
  label: string;
  href: string;
  /** one line of context under the label — keeps the menu scannable */
  desc?: string;
  kind?: NavKind;
  /** chip on the right: volume number, item count, "Subdomain", … */
  tag?: string;
  icon: IconType;
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  /** eyebrow line at the top of the open panel */
  kicker: string;
  icon: IconType;
  sections: NavSection[];
  /** small italic note pinned at the foot of the panel */
  note?: string;
}

/** Saul's Podship academies — separate campuses on their own subdomains. */
export const SUBDOMAINS = {
  sundaySchool: {
    label: 'Sunday School',
    href: SITE.sundaySchool,
    host: 'saulssundayschool.saulspodship.com',
    desc: 'Lesson plans, flannel-graph sets and quizzes for every age band',
  },
  biblicalLanguages: {
    label: 'Biblical Languages',
    href: SITE.biblicalLanguages,
    host: 'biblicallanguages.saulspodship.com',
    desc: 'Hebrew, Aramaic and Greek drills, parses and lexicon work',
  },
} as const;

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'encyclopedia',
    label: 'Encyclopedia',
    kicker: '51 peer-reviewed volumes',
    icon: BookOpen,
    sections: [
      {
        heading: 'Browse by discipline',
        items: [
          { label: 'All Volumes Index', href: '/encyclopedia', desc: 'The complete Scriptorium catalogue, searchable', tag: '51', icon: LibraryBig },
          { label: 'Scholarly Exegesis', href: '/encyclopedia?category=scholarly', desc: 'Doctrines, texts and hard passages, argued', tag: '26', icon: Scale },
          { label: 'Historical Theology', href: '/encyclopedia?category=history', desc: 'Councils, crusades, churches and cultures', tag: '11', icon: History },
          { label: 'Devotional & Spiritual', href: '/encyclopedia?category=devotional', desc: 'Prayer, worship and everyday discipleship', tag: '8', icon: Heart },
          { label: 'Reference & Canonical', href: '/encyclopedia?category=reference', desc: 'Charts, chronologies and canon data', tag: '6', icon: BookMarked },
        ],
      },
      {
        heading: 'Most opened',
        items: [
          { label: 'All Bible Stories', href: '/encyclopedia/all-bible-stories', desc: 'The metanarrative of Scripture in one map', tag: 'Vol 01', icon: BookOpen },
          { label: 'Names of God', href: '/encyclopedia/names-of-god', desc: 'Every divine name, meaning and occurrence', tag: 'Vol 30', icon: ScrollText },
          { label: 'Messianic Prophecies', href: '/encyclopedia/messianic-prophecies', desc: 'Old Testament predictions, New Testament fulfilment', tag: 'Vol 29', icon: Compass },
          { label: 'Early Church Fathers & Councils', href: '/encyclopedia/early-church-fathers-councils', desc: 'Nicaea to Chalcedon and the creeds they wrote', tag: 'Vol 18', icon: Landmark },
        ],
      },
      {
        heading: 'Answers & codices',
        items: [
          { label: 'Theological Archive', href: '/theological-archive', desc: '1,000 answered questions with citations', tag: '1000', icon: HelpCircle },
          { label: 'Comparative Apologetics', href: '/comparative-apologetics', desc: '400 questions on Islam, Judaism, Hinduism, Sikhism', tag: '400', icon: Scale },
          { label: 'Kings of the Bible', href: '/kings-of-the-bible', desc: 'The throne line from Saul to the Herods', tag: 'Vol 51', icon: Landmark },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Study Tools',
    kicker: 'Interactive atlases & concordances',
    icon: Globe2,
    sections: [
      {
        heading: 'Maps & atlases',
        items: [
          { label: 'Biblical Prophecy Map', href: '/prophecy-map', desc: '247 prophecies on a rotatable 3D globe', icon: Globe2 },
          { label: 'The Interlinked Bible', href: '/cross-references', desc: '344,799 cross-reference threads, 66 books', icon: Network },
          { label: 'Biblical Maps Atlas', href: '/encyclopedia/biblical-maps-atlas.html', kind: 'static', desc: 'Eight journey maps — Abraham, Exodus, Paul — animated (Vol 11)', icon: MapIcon },
          { label: 'World Religion Map', href: '/world-religion-map/', kind: 'static', desc: 'Faiths, denominations and populations by nation', icon: Church },
        ],
      },
      {
        heading: 'Scriptorium tools',
        items: [
          { label: 'Scriptorium AI Studio', href: '/studio', desc: 'Research engine, hymn composer and manuscript analysis', icon: Sparkles },
          { label: 'Scholarly Standards', href: '/scholarly-standards', desc: 'Sources, citation rules and our corrections policy', icon: ShieldCheck },
          { label: 'HTML Site Directory', href: '/sitemap', desc: 'Every page and every volume in one list', icon: FileText },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: 'Listen & Watch',
    kicker: 'Podcast, video and sacred music',
    icon: Mic,
    sections: [
      {
        heading: 'Audio & video',
        items: [
          { label: 'Theological Podcast', href: '/podcast', desc: 'Long-form episodes, one doctrine at a time', icon: Mic },
          { label: 'Bible Video Library', href: '/videos/', kind: 'static', desc: 'Illustrated documentary series on sacred history', icon: Video },
          { label: 'Official YouTube', href: SITE.youtube, kind: 'external', desc: 'Sermons, debates and visual studies', icon: Play },
        ],
      },
      {
        heading: 'Music & Zaboor',
        items: [
          { label: 'Sacred Music Hub', href: '/music', desc: 'Hymnody, Masihi geet and the media shelf', icon: Music2 },
          { label: 'Punjabi Zaboor', href: '/music/punjabi-zaboor', desc: 'All 150 Psalms in Punjabi classical meter', tag: '150', icon: ScrollText },
          { label: 'Pakistani Singers Archive', href: '/music/pakistani-singers-archive', desc: 'Geet pioneers, discographies and biographies', icon: Users },
          { label: 'Punjabi Zaboor Society', href: SITE.punjabiZaboor, kind: 'external', desc: 'The independent psalter society archive', icon: BookMarked },
        ],
      },
      {
        heading: 'Follow the Podship',
        items: [
          { label: 'TikTok', href: SITE.tiktok, kind: 'external', desc: 'Short clips and scripture reels', icon: Play },
          { label: 'Facebook', href: SITE.facebook, kind: 'external', desc: 'Community page and live streams', icon: Globe2 },
          { label: 'Instagram', href: SITE.instagram, kind: 'external', desc: 'Artwork, maps and episode drops', icon: Camera },
        ],
      },
    ],
    note: 'New episode every week — podcast, YouTube and the video library ship together.',
  },
  {
    id: 'academy',
    label: 'Academy',
    kicker: 'Saul’s schools — separate campuses',
    icon: GraduationCap,
    sections: [
      {
        heading: 'Our subdomains',
        items: [
          { label: SUBDOMAINS.sundaySchool.label, href: SUBDOMAINS.sundaySchool.href, kind: 'external', desc: SUBDOMAINS.sundaySchool.desc, tag: 'Subdomain', icon: GraduationCap },
          { label: SUBDOMAINS.biblicalLanguages.label, href: SUBDOMAINS.biblicalLanguages.href, kind: 'external', desc: SUBDOMAINS.biblicalLanguages.desc, tag: 'Subdomain', icon: Languages },
        ],
      },
      {
        heading: 'Course material from the archive',
        items: [
          { label: 'Original Scripture Languages', href: '/encyclopedia/original-scripture-languages', desc: 'Alphabets, scripts and manuscripts of the Bible', tag: 'Vol 35', icon: Languages },
          { label: 'Guide to Christian Living', href: '/encyclopedia/guide-to-christian-living', desc: 'A discipleship curriculum for new believers', tag: 'Vol 22', icon: Heart },
          { label: 'Ten Commandments & OT Laws', href: '/encyclopedia/ten-commandments-ot-laws', desc: 'The law taught line by line', tag: 'Vol 43', icon: ScrollText },
          { label: '1-Year Sermon Guide', href: '/encyclopedia/1-year-sermon-guide-52-gen-z-topics', desc: '52 weeks of series outlines for preachers', tag: 'Vol 50', icon: CalendarDays },
        ],
      },
    ],
    note: 'Each campus is its own site on a saulspodship.com subdomain — it opens in its own tab.',
  },
  {
    id: 'ministry',
    label: 'Ministry',
    kicker: 'The people, the purse and the paperwork',
    icon: Info,
    sections: [
      {
        heading: 'The Podship',
        items: [
          { label: 'About the Ministry', href: '/about', desc: 'Mission, founder and the Scriptorium story', icon: Info },
          { label: 'Partnership & Mission', href: '/support', desc: 'How the work is funded and what it costs', icon: Heart },
          { label: 'Support on Patreon', href: SITE.patreon, kind: 'external', desc: 'Monthly partners keep the volumes free', icon: Heart },
          { label: 'Contact & Submissions', href: '/contact', desc: 'Questions, corrections and guest papers', icon: MessageSquare },
        ],
      },
      {
        heading: 'Help & writing',
        items: [
          { label: 'Frequently Asked Questions', href: '/faq', desc: 'Permissions, citations and Bible use', icon: HelpCircle },
          { label: 'The Goshsays Blog', href: SITE.blog, kind: 'external', desc: 'Long-form articles and devotional notes', icon: FileText },
        ],
      },
      {
        heading: 'Legal',
        items: [
          { label: 'Privacy Policy', href: '/privacy', desc: 'What the site stores about you', icon: ShieldCheck },
          { label: 'Terms of Service', href: '/terms', desc: 'Use, reuse and attribution terms', icon: FileText },
          { label: 'Theological Disclaimer', href: '/disclaimer', desc: 'Confessional stance and scholarly limits', icon: Scale },
        ],
      },
    ],
  },
];

/**
 * Is this item where the reader already is?
 * `route` items match the SPA path; `static` items match the file's directory.
 */
export const isItemActive = (item: NavItem, pathname: string): boolean => {
  if (item.kind === 'external') return false;
  const base = item.href.split('?')[0].replace(/index\.html$/, '').replace(/\.html$/, '');
  if (base === '/') return pathname === '/';
  if (item.kind === 'static') return pathname.startsWith(base);
  return pathname === base || pathname.startsWith(`${base}/`);
};

export const isGroupActive = (group: NavGroup, pathname: string): boolean =>
  group.sections.some((s) => s.items.some((i) => isItemActive(i, pathname)));

/** hostname shown on external / subdomain rows */
export const hostOf = (href: string): string => {
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
};

export const isOffSite = (href: string): boolean => /^https?:\/\//i.test(href);
