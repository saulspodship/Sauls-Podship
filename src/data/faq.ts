import { ABOUT_FAQ } from './about';

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqDataset {
  eyebrow?: string;
  summary: string;
  items: FaqEntry[];
}

/** Schema is built from the same questions and answers that visitors can read. */
export function faqSchema(items: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** The route-specific theological FAQ copy, shared by the UI and its JSON-LD. */
export const FAQ_DATA: Record<string, FaqDataset> = {
  '/': {
    summary: "Saul’s Podship is a biblical ministry project presenting an interactive theological encyclopedia for believers and scholars worldwide: 51 volumes from Eden to the New Jerusalem; a Biblical Prophecy Map tagging all 247 prophecies by historical, metaphorical and futurist fulfilment; the Kings of the Bible throne line from Jesus the King of Kings to the final Beast; 400 comparative apologetics questions across Islam, Judaism, Hinduism and Sikhism; and the living archive of Punjabi Zaboor hymnody — 150 Psalms in classical Punjabi meters — fulfilling the vision of worship in Spirit and Truth from Karachi to the nations.",
    items: [
      { question: "What is Saul's Podship?", answer: 'An interactive theological encyclopedia and digital ministry: 51 volumes, the Biblical Prophecy Map, the Kings of the Bible throne line, 400 comparative apologetics questions, and the Punjabi Zaboor archive — freely accessible worldwide.' },
      { question: 'What do the fulfilment tags on the Prophecy Map mean?', answer: 'Every one of the 247 prophecies carries three interpretive lenses — Historical (preterist/historicist reading), Metaphorical (idealist/spiritual reading) and Futurist (literal awaiting reading) — so you can see which school of theology counts each prophecy complete.' },
      { question: 'Who is the first King in the Kings of the Bible module?', answer: 'Jesus the Messiah — King of Kings and Lord of Lords, the Alpha and the Omega — before Saul, David and Solomon; the line closes with the final counterfeit king, the Beast.' },
      { question: 'Is the Punjabi Zaboor archive complete?', answer: 'Yes — the complete historical record of 150 biblical Psalms versified into Punjabi classical meters by Imam-ud-Din Shahbaz (1908), with the living archive of Pakistani gospel musicians.' },
      { question: 'Are the new biblical maps interactive?', answer: 'Yes — eight journey maps with animated footsteps tracing Abraham, the Exodus, Paul, the Seven Churches and more, stop by stop.' },
      { question: "Is Saul's Podship free?", answer: 'Yes. Every volume, atlas, archive and podcast is freely accessible; the ministry is sustained by voluntary support and prayer.' },
    ],
  },
  '/about': ABOUT_FAQ,
  '/encyclopedia': {
    summary: 'The complete Scriptorium catalog: 51 volumes across scholarly exegesis, historical theology, devotional, reference and hymnology categories — with data tables, FAQs, timelines, original-language transliteration and scriptural references.',
    items: [
      { question: 'How many volumes are in the encyclopedia?', answer: 'The Scriptorium contains 51 volumes covering biblical exegesis, historical theology, devotional and reference subjects.' },
      { question: 'What are the companion modules?', answer: 'The Biblical Prophecy Map, Kings of the Bible, the Interlinked Bible and Comparative Apologetics — interactive charts woven from the same scholarship, linked by routing buttons at the bottom of every volume.' },
      { question: 'Are the volumes free to read?', answer: 'Yes — every volume, table and FAQ is freely readable online.' },
    ],
  },
  '/comparative-apologetics': {
    summary: 'A Christian’s guide to comparative apologetics: 400 of the hardest objections raised in dialogue with Islam, Judaism, Hinduism and Sikhism — 100 per tradition — each answered with context, primary sources, a fair statement of the other side, and a Christian response; searchable, sortable, and ranked by what is most asked in Pakistan & India.',
    items: [
      { question: 'How is the codex organized?', answer: '100 questions per tradition, each with Context, Mainstream Position & Primary Sources, Christian Apologetic Response, and Points for Respectful Discussion.' },
      { question: 'What is the method?', answer: 'Represent other traditions accurately and charitably before answering — persuasion through honesty, not mockery; weak or fabricated hadith are never used as authoritative.' },
      { question: 'Can I search and sort the questions?', answer: 'Yes — by book order, by most-asked in Pakistan & India, or A–Z.' },
    ],
  },
  '/encyclopedia/biblical-maps': {
    summary: 'Biblical Maps, Volume 11: a visual atlas of sacred topography — the land bridge of Canaan, the Exodus spine, Paul’s 10,000 miles, the Jordan Rift — now with an interactive journey atlas whose footsteps walk each route, and the world map at the foot of the volume.',
    items: [
      { question: 'Why is geographical context vital for reading the Bible?', answer: 'Revelation happened in real places: elevation, water and borderlands shape the meaning of campaigns, covenants and parables.' },
      { question: 'Where did the Exodus route travel?', answer: 'Rameses → Succoth → the sea crossing → Sinai → Kadesh-barnea → Moab; the interactive map walks this spine.' },
      { question: 'How many missionary journeys did Paul make?', answer: 'Three recorded journeys plus the voyage to Rome — over 10,000 miles.' },
    ],
  },
};

/** The main FAQ page reuses the same app answers as the About page. */
export const FAQ_PAGE_ITEMS: (FaqEntry & { category: string })[] = [
  {
    category: 'Encyclopedia & Doctrine',
    question: 'What is the scope of the 51-Volume Theological Encyclopedia?',
    answer: 'The encyclopedia covers 51 volumes spanning Systematic Theology, Biblical Typology, Messianic Prophecy, church history, Hebrew and Greek exegesis, the Tabernacle and the Book of Revelation. Volumes include structured data tables, historical timelines and Scripture citations.',
  },
  {
    category: 'Encyclopedia & Doctrine',
    question: "Which theological tradition or hermeneutical method does Saul's Podship follow?",
    answer: "Our work is grounded in classical grammatical-historical hermeneutics and historic Christian ecumenical orthodoxy (the Nicene, Apostles', and Chalcedonian creeds). We focus on original language analysis in Hebrew, Aramaic, and Greek without sectarian partisanship.",
  },
  {
    category: 'Sacred Music & Zaboor',
    question: 'What is the Punjabi Zaboor and why is it significant?',
    answer: 'The Punjabi Zaboor consists of all 150 biblical Psalms versified into classical Punjabi metrical poetry (Bahr) by Rev. Imam-ud-Din Shahbaz between 1898 and 1908. Set to classical South Asian ragas, it forms the liturgical heartbeat of millions of Punjabi Christians worldwide.',
  },
  {
    category: 'Access & Usage',
    question: 'Is the theological content freely accessible for churches, seminaries, and students?',
    answer: 'Yes. All 51 volumes, research monographs, audio masterclasses, and data tables are published freely for personal study, church education, academic research, and sermon preparation.',
  },
  {
    category: 'Access & Usage',
    question: "How can I cite Saul's Podship volumes in my academic papers or sermons?",
    answer: "You may cite any volume using standard academic citation formats (e.g., 'Saul's Podship Scriptorium, Volume [Number]: [Title], www.saulspodship.com/encyclopedia/[slug]'). Full metadata is provided on each volume page.",
  },
  ...ABOUT_FAQ.items.map((item) => ({ ...item, category: 'Our Apps & Subdomains' })),
];

export const FAQ_PAGE_META = {
  title: "Frequently Asked Questions | Saul's Podship",
  description: "Answers about Saul's Podship, its theological encyclopedia, Punjabi Zaboor and free Bible study apps for families and learners worldwide.",
  canonical: 'https://www.saulspodship.com/faq',
  keywords: ["Saul's Podship FAQ", 'Bible study apps', 'Sunday School', 'Biblical Languages', 'Evangelism', 'Biblical Cosmos 3D'],
  image: 'https://www.saulspodship.com/icons/brand-logo.png',
};
