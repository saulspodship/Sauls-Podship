export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqDataset {
  summary: string;
  items: FaqEntry[];
}

/** The route-specific theological FAQ copy, shared by the UI and its JSON-LD. */
export const FAQ_DATA: Record<string, FaqDataset> = {
  '/': {
    summary: "Saul’s Podship is a biblical ministry project presenting an interactive theological encyclopedia for believers and scholars worldwide: 50 peer-reviewed volumes from Eden to the New Jerusalem; a Biblical Prophecy Map tagging all 247 prophecies by historical, metaphorical and futurist fulfilment; the Kings of the Bible throne line from Jesus the King of Kings to the final Beast; 400 comparative apologetics questions across Islam, Judaism, Hinduism and Sikhism; and the living archive of Punjabi Zaboor hymnody — 150 Psalms in classical Punjabi meters — fulfilling the vision of worship in Spirit and Truth from Karachi to the nations.",
    items: [
      { question: "What is Saul's Podship?", answer: 'An interactive theological encyclopedia and digital ministry: 50 peer-reviewed volumes, the Biblical Prophecy Map, the Kings of the Bible throne line, 400 comparative apologetics questions, and the Punjabi Zaboor archive — freely accessible worldwide.' },
      { question: 'What do the fulfilment tags on the Prophecy Map mean?', answer: 'Every one of the 247 prophecies carries three interpretive lenses — Historical (preterist/historicist reading), Metaphorical (idealist/spiritual reading) and Futurist (literal awaiting reading) — so you can see which school of theology counts each prophecy complete.' },
      { question: 'Who is the first King in the Kings of the Bible module?', answer: 'Jesus the Messiah — King of Kings and Lord of Lords, the Alpha and the Omega — before Saul, David and Solomon; the line closes with the final counterfeit king, the Beast.' },
      { question: 'Is the Punjabi Zaboor archive complete?', answer: 'Yes — the complete historical record of 150 biblical Psalms versified into Punjabi classical meters by Imam-ud-Din Shahbaz (1908), with the living archive of Pakistani gospel musicians.' },
      { question: 'Are the new biblical maps interactive?', answer: 'Yes — eight journey maps with animated footsteps tracing Abraham, the Exodus, Paul, the Seven Churches and more, stop by stop.' },
      { question: "Is Saul's Podship free?", answer: 'Yes. Every volume, atlas, archive and podcast is freely accessible; the ministry is sustained by voluntary support and prayer.' },
    ],
  },
  '/encyclopedia': {
    summary: 'The complete Scriptorium catalog: fifty peer-reviewed volumes across scholarly exegesis, historical theology, devotional, reference and hymnology categories — each with data tables, FAQs, timelines, original-language transliteration and complete scriptural references, with the companion modules routed at the bottom of every volume.',
    items: [
      { question: 'How many volumes are in the encyclopedia?', answer: 'Fifty — 26 scholarly exegesis, 11 historical theology, 8 devotional & spiritual, 5 reference & canonical.' },
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
