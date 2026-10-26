/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The English video masterclasses.
 *
 * These are NOT episodes of the RSS.com audio show — that show is Urdu and
 * lives in `src/data/episodes.ts`. These five are the long-form video
 * broadcasts on the YouTube channel, so the site now labels them plainly as
 * "YouTube Podcasts" and always links out to YouTube for playback.
 *
 * They keep the `/podcast/<slug>` URLs they were published with, so old links,
 * bookmarks and search results never 404 — they simply land on a video page
 * instead of an audio page.
 */

export interface VideoEpisode {
  id: string;
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  publishDate: string;
  /** Watch page on YouTube — omitted for the two that were never uploaded */
  youtubeUrl?: string;
  topics: string[];
  scriptureReferences: string[];
}

export const VIDEO_CHANNEL = {
  label: 'YouTube Podcast',
  name: 'Saul’s Podship — YouTube Podcast',
  description:
    'Long-form English video masterclasses from the same scholarship as the 51 volumes. Watch on the Saul’s Podship YouTube channel; the Urdu audio show is published separately on RSS.com.',
  channelUrl: 'https://www.youtube.com/@saulspodship',
} as const;

/** youtu.be/<id> | youtube.com/watch?v=<id> | youtube.com/embed/<id> */
export function youtubeId(url?: string): string | undefined {
  if (!url) return undefined;
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  return m ? m[1] : undefined;
}

export const VIDEO_EPISODES: VideoEpisode[] = [
  {
    id: 'vid-01',
    number: 1,
    slug: 'creation-to-redemption-the-grand-narrative',
    title: 'Creation to Redemption: The Grand Narrative of Scripture',
    subtitle: 'Understanding the thematic unity of the 66 books from Genesis to Revelation',
    description:
      'An in-depth exploration of how the biblical covenants trace a single, unbroken line of divine redemption. We analyze the literary structures, ancient Near Eastern cultural contexts, and theological turning points that bind the Old and New Testaments.',
    duration: '48:15',
    publishDate: '2026-01-15',
    youtubeUrl: 'https://youtu.be/7t2Tjo9F_mg',
    topics: ['Biblical Theology', 'Covenants', 'Hermeneutics'],
    scriptureReferences: ['Genesis 1-3', 'Luke 24:27', 'Revelation 21-22'],
  },
  {
    id: 'vid-02',
    number: 2,
    slug: 'the-five-sacrifices-of-leviticus-shadow-to-substance',
    title: 'The Five Sacrifices of Leviticus: From Shadow to Substance',
    subtitle: 'Unlocking Olah, Minchah, Shelamim, Chatat, and Asham in light of Christ',
    description:
      'Leviticus is often considered the most difficult book for modern readers, yet it holds the theological DNA of the entire New Testament. In this masterclass, we break down each of the five Levitical offerings and trace their prophetic fulfillment in the cross of Christ.',
    duration: '54:30',
    publishDate: '2026-01-29',
    topics: ['Leviticus', 'Typology', 'Atonement'],
    scriptureReferences: ['Leviticus 1-7', 'Hebrews 9-10'],
  },
  {
    id: 'vid-03',
    number: 3,
    slug: 'angels-demons-and-unseen-realms',
    title: 'Angels, Demons, and the Unseen Realm: Scriptural Demonology',
    subtitle: 'Separating biblical truth from medieval folklore and modern myth',
    description:
      "What does the Bible actually teach about the spiritual realm? We examine the divine council, the Cherubim and Seraphim, the fall of Lucifer, the Nephilim controversy of Genesis 6, and Christ's definitive victory over territorial spirits.",
    duration: '51:40',
    publishDate: '2026-02-12',
    youtubeUrl: 'https://youtu.be/HSI84sTSkKY',
    topics: ['Angelology', 'Demonology', 'Spiritual Warfare'],
    scriptureReferences: ['Psalm 82', 'Colossians 2:15', 'Ephesians 6:10-18'],
  },
  {
    id: 'vid-04',
    number: 4,
    slug: 'punjabi-zaboor-the-indigenous-psalms-of-south-asia',
    title: 'Punjabi Zaboor: The Indigenous Psalms of South Asia',
    subtitle: 'How 150 biblical Psalms were preserved in classical Punjabi metrical poetry',
    description:
      'In 1908, missionary Imam-ud-Din Shahbaz completed the translation and poetic versification of all 150 biblical Psalms into indigenous Punjabi meters (Bahr). We explore the history, musical ragas, and profound spiritual impact of the Zaboor on millions across Pakistan and the diaspora.',
    duration: '45:20',
    publishDate: '2026-02-26',
    topics: ['Church History', 'Musicology', 'South Asian Christianity'],
    scriptureReferences: ['Psalm 23', 'Psalm 121', 'Psalm 150'],
  },
  {
    id: 'vid-05',
    number: 5,
    slug: 'messianic-prophecies-mathematical-and-historical-proofs',
    title: 'Messianic Prophecies: Historical and Theological Proofs',
    subtitle: 'Examining the probability of 300+ Old Testament predictions fulfilled in Yeshua',
    description:
      "From the seed of the woman in Genesis 3:15 to the suffering servant of Isaiah 53 and the exact timing of Daniel's 70 weeks, we investigate the staggering precision of Messianic prophecies with rigorous textual evidence.",
    duration: '58:10',
    publishDate: '2026-03-05',
    youtubeUrl: 'https://youtu.be/wrwXpxvtEZk',
    topics: ['Apologetics', 'Messianic Prophecy', 'Old Testament'],
    scriptureReferences: ['Isaiah 53', 'Daniel 9:24-27', 'Micah 5:2', 'Psalm 22'],
  },
].sort((a, b) => b.number - a.number); // newest first, same as the audio list

export function findVideoEpisode(param?: string): VideoEpisode | undefined {
  if (!param) return undefined;
  const p = decodeURIComponent(param).toLowerCase();
  return VIDEO_EPISODES.find(
    (v) => v.slug.toLowerCase() === p || v.id === p || String(v.number) === p,
  );
}
