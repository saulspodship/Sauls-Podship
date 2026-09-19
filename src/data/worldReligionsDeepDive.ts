/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Extended comparative-religion study data for Vol. 15 (comparative-religion).
 * Sourced from the "Understanding World Religions — Hinduism & Islam" study
 * document; presented here as each tradition describes itself, for Christian
 * study, understanding, and witness.
 */

export interface Yuga {
  id: string;
  name: string;
  subtitle: string;
  duration: string;
  qualities: string[];
  description: string;
  color: string;
  flex: number;
}

export interface Figure {
  name: string;
  era: string;
  form: string;
  story: string;
  teaching: string;
  teachingLabel?: string;
  initials: string;
}

export interface Concept {
  name: string;
  short: string;
  long: string;
}

export interface StackItem {
  title: string;
  sub: string;
  body: string;
  color: string;
}

export interface PatternSegment {
  label: string;
  text: string;
}

export interface Pattern {
  title: string;
  sub: string;
  color: string;
  segments: PatternSegment[];
}

export const YUGAS: Yuga[] = [
  {
    id: "satya",
    name: "Satya yuga",
    subtitle: "the age of truth",
    duration: "Traditional length: 1,728,000 years",
    qualities: ["Full dharma", "No conflict", "Long lifespans"],
    description:
      "Described as a golden age where truth and virtue are complete, people live in harmony without need for law or ritual, and the divine is directly perceptible. Five of Vishnu's avatars are traditionally placed here: Matsya, Kurma, Varaha, Narasimha, and Vamana.",
    color: "#B8892A",
    flex: 4,
  },
  {
    id: "treta",
    name: "Treta yuga",
    subtitle: "three-quarters virtue",
    duration: "Traditional length: 1,296,000 years",
    qualities: ["Dharma at 3/4", "Rise of ritual", "Kingship emerges"],
    description:
      "Virtue begins to decline; formal ritual and sacrifice become necessary to maintain order. This is the traditional setting of the Ramayana, and of the avatars Parashurama and Rama.",
    color: "#3C7A74",
    flex: 3,
  },
  {
    id: "dvapara",
    name: "Dvapara yuga",
    subtitle: "half virtue",
    duration: "Traditional length: 864,000 years",
    qualities: ["Dharma at 1/2", "Disease appears", "Shorter lifespans"],
    description:
      "Virtue and vice are in balance. This is the traditional setting of the Mahabharata and the life of Krishna, whose teaching to Arjuna forms the Bhagavad Gita.",
    color: "#B8571C",
    flex: 2,
  },
  {
    id: "kali",
    name: "Kali yuga",
    subtitle: "the age of conflict",
    duration: "Traditional length: 432,000 years",
    qualities: ["Dharma at 1/4", "Discord", "Shortest lifespans"],
    description:
      "The current age, marked by declining virtue and rising conflict, said to have begun roughly 3,000 BCE by traditional reckoning. Kalki, the final avatar, is prophesied to appear near its end to restore dharma before the cycle begins again.",
    color: "#6B638F",
    flex: 1,
  },
];

export const AVATARS: Figure[] = [
  {
    name: "Matsya",
    era: "Satya yuga",
    form: "Fish",
    story:
      "Warned the first man, Manu, of a coming great flood and guided his boat to safety, preserving the Vedas and seeds of life.",
    teaching:
      "Divine guidance protects what is essential when the world itself is in upheaval.",
    initials: "Ma",
  },
  {
    name: "Kurma",
    era: "Satya yuga",
    form: "Tortoise",
    story:
      "Supported Mount Mandara on his back while gods and demons churned the cosmic ocean to obtain amrita, the nectar of immortality.",
    teaching: "Patient, steady support underlies great collective undertakings.",
    initials: "Ku",
  },
  {
    name: "Varaha",
    era: "Satya yuga",
    form: "Boar",
    story:
      "Rescued the earth goddess Bhudevi after she was dragged to the bottom of the cosmic ocean by a demon, lifting the earth back into place on his tusks.",
    teaching: "Restoring balance sometimes requires immense, direct force.",
    initials: "Va",
  },
  {
    name: "Narasimha",
    era: "Satya yuga",
    form: "Half-man, half-lion",
    story:
      "Appeared in a form that was neither man nor beast to slay a tyrant who believed a boon made him unkillable by either, protecting his devotee Prahlada.",
    teaching:
      "Devotion is protected even when the threat seems to have no loophole.",
    initials: "Na",
  },
  {
    name: "Vamana",
    era: "Satya yuga",
    form: "Dwarf",
    story:
      "Asked a powerful king for only as much land as he could cover in three steps, then grew to cosmic size and reclaimed the three worlds in two strides.",
    teaching: "Humility can conceal, and precede, immense power.",
    initials: "Vm",
  },
  {
    name: "Parashurama",
    era: "Treta yuga",
    form: "Warrior sage",
    story:
      "A fierce Brahmin warrior who confronted a corrupt, oppressive warrior class to restore order.",
    teaching:
      "Even a peace-oriented tradition holds a place for righteous confrontation of abuse.",
    initials: "Pa",
  },
  {
    name: "Rama",
    era: "Treta yuga",
    form: "Ideal king",
    story:
      "Hero of the Ramayana — an exiled prince who lives by duty and truth even at great personal cost, and rescues his wife Sita from the demon king Ravana.",
    teaching:
      "Rama is held up as the model of dharma: doing what is right even when it is costly.",
    initials: "Ra",
  },
  {
    name: "Krishna",
    era: "Dvapara yuga",
    form: "Divine teacher",
    story:
      "Central figure of the Mahabharata; on the eve of a great war, counsels the warrior Arjuna on duty and detachment — the teaching recorded as the Bhagavad Gita.",
    teaching: "Act according to your duty without clinging to the result.",
    initials: "Kr",
  },
  {
    name: "Buddha",
    era: "Kali yuga (in some lists)",
    form: "Enlightened teacher",
    story:
      "Some later Puranic lists include the historical Buddha as an avatar, generally interpreted within these texts as guiding certain seekers toward renunciation.",
    teaching:
      "Not accepted by all traditions or by Buddhists themselves — a later, contested addition.",
    initials: "Bu",
  },
  {
    name: "Kalki",
    era: "Kali yuga (still to come)",
    form: "Warrior on a white horse",
    story:
      "Prophesied to appear at the end of the current age, wielding a blazing sword, to end widespread corruption and begin the cycle anew.",
    teaching:
      "The tradition holds that no age of decline is final — renewal is always said to follow.",
    initials: "Ka",
  },
];

/** Timeline dot positions (%) matching avatar order */
export const AVATAR_TIMELINE_POSITIONS = [4, 10, 16, 24, 32, 46, 58, 80, 87, 96];

export const HINDU_CONCEPTS: Concept[] = [
  {
    name: "Dharma",
    short: "Duty, right action, the order that holds things together.",
    long: "Dharma refers to one's duty or right conduct — which varies by role, stage of life, and circumstance. It is less a fixed rulebook than a call to act rightly within your own context.",
  },
  {
    name: "Karma",
    short: "Every action carries consequence, across lifetimes.",
    long: "Karma is the principle that intentional actions shape future circumstances, including across rebirths. It is often paired with the idea that understanding this can motivate more careful, ethical action rather than fatalism.",
  },
  {
    name: "Samsara",
    short: "The cycle of birth, death, and rebirth.",
    long: "Samsara describes the ongoing cycle souls move through across lifetimes, driven by karma and desire, until release is achieved.",
  },
  {
    name: "Moksha",
    short: "Liberation from the cycle of rebirth.",
    long: "Moksha is the ultimate goal in most Hindu schools — release from samsara through self-realization, devotion, right action, or knowledge, depending on the school.",
  },
  {
    name: "Bhakti",
    short: "Devotion to a personal form of the divine.",
    long: "Bhakti traditions emphasize love and surrender to a chosen deity as a direct path to liberation, often through worship, chanting, and ritual.",
  },
  {
    name: "Ahimsa",
    short: "Non-violence toward all living things.",
    long: "Ahimsa is the principle of avoiding harm to living beings in thought, word, and deed — influential well beyond Hinduism, notably in Gandhi's political philosophy.",
  },
];

export const CHAKRAS: StackItem[] = [
  {
    color: "#C0392B",
    title: "Muladhara — Root",
    sub: "Base of the spine · Earth · Red",
    body: "Linked to survival, stability, and a felt sense of security in the physical body. Traditionally described as the foundation the other six centers rest on.",
  },
  {
    color: "#E2711D",
    title: "Svadhisthana — Sacral",
    sub: "Lower abdomen · Water · Orange",
    body: "Associated with creativity, pleasure, and emotional flow, and with the sense of self that grows through relationship with others.",
  },
  {
    color: "#B8892A",
    title: "Manipura — Solar Plexus",
    sub: "Upper abdomen · Fire · Yellow",
    body: "Linked to willpower, confidence, and personal transformation — often described as an inner fire that fuels action and digestion alike.",
  },
  {
    color: "#3C8F5C",
    title: "Anahata — Heart",
    sub: "Center of the chest · Air · Green",
    body: "Associated with love, compassion, and connection to others. Traditionally seen as the midpoint bridging the three lower, more physical centers with the three upper, more subtle ones.",
  },
  {
    color: "#3F7FB8",
    title: "Vishuddha — Throat",
    sub: "Throat · Ether/space · Blue",
    body: "Linked to communication, truth-telling, and authentic self-expression.",
  },
  {
    color: "#5B5580",
    title: "Ajna — Third Eye",
    sub: "Between the eyebrows · Light/mind · Indigo",
    body: "Associated with intuition, insight, and clarity of perception beyond the five ordinary senses.",
  },
  {
    color: "#8A5FC9",
    title: "Sahasrara — Crown",
    sub: "Top of the head · Pure consciousness · Violet/white",
    body: "Described as the seat of pure awareness and connection to the divine, said in yogic tradition to open fully only through sustained, long-term practice.",
  },
];

export const LOKAS: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "1. Bhurloka",
    sub: "The earth",
    body: "The physical world currently inhabited by humans and animals — the plane where karma is actively made through action.",
  },
  {
    color: "#A97A4F",
    title: "2. Bhuvarloka",
    sub: "The intermediate realm",
    body: "An atmospheric plane between earth and the heavens, traditionally described as home to certain celestial beings and a realm souls may pass through after death.",
  },
  {
    color: "#C9954B",
    title: "3. Svarloka",
    sub: "The heavenly realm",
    body: "A heavenly plane traditionally ruled by Indra — described as a reward for good karma, but still temporary and still within the cycle of rebirth.",
  },
  {
    color: "#4A9089",
    title: "4. Maharloka",
    sub: "Realm of great sages",
    body: "Home to great sages and seers said to have moved beyond ordinary worldly desire.",
  },
  {
    color: "#3F7FB8",
    title: "5. Janaloka",
    sub: "Realm of the Creator's sons",
    body: "Traditionally described as home to the mind-born sons of Brahma and other highly realized beings.",
  },
  {
    color: "#5B5580",
    title: "6. Tapoloka",
    sub: "Realm of austerity",
    body: "A realm of intense spiritual discipline, inhabited by beings devoted entirely to austerity and meditation.",
  },
  {
    color: "#8A5FC9",
    title: "7. Satyaloka",
    sub: "Realm of truth (Brahmaloka)",
    body: "The highest of the seven lokas — the abode of Brahma, and traditionally described as the last realm before final liberation from rebirth altogether.",
  },
];

export const HINDU_HISTORY: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "c. 3300 – 1300 BCE",
    sub: "Indus Valley Civilization",
    body: "An early urban culture (Mohenjo-daro, Harappa) whose seals, ritual baths, and figurines are seen by many historians as a layer beneath later Hindu practice — though the civilization's script remains undeciphered, so the link is inferred rather than proven.",
  },
  {
    color: "#C9954B",
    title: "c. 1500 – 500 BCE",
    sub: "The Vedic period",
    body: "Indo-Aryan groups compose the four Vedas — Rigveda, Yajurveda, Samaveda, and Atharvaveda — the oldest surviving Hindu scriptures. The Rigveda itself is generally dated to roughly 1500–1200 BCE.",
  },
  {
    color: "#4A9089",
    title: "c. 800 – 500 BCE",
    sub: "The Upanishads",
    body: "Philosophical texts shift emphasis from Vedic ritual toward ideas like Brahman (ultimate reality), atman (self), and moksha (liberation) — the more contemplative side of the tradition.",
  },
  {
    color: "#3F7FB8",
    title: "c. 400 BCE – 200 CE",
    sub: "Mahabharata & Bhagavad Gita",
    body: "The Mahabharata reaches close to its final form as an epic, and the Bhagavad Gita — Krishna's teaching to Arjuna within it — becomes one of the most widely read texts in the entire tradition.",
  },
  {
    color: "#5B5580",
    title: "c. 300 – 1200 CE",
    sub: "Classical & temple-building age",
    body: "Puranic literature and avatar theology take the shape described earlier on this page, while monumental temple architecture flourishes across India and Southeast Asia — including Ellora, Thanjavur, and Angkor Wat.",
  },
  {
    color: "#8A5FC9",
    title: "Today",
    sub: "Roughly 1.2 billion adherents",
    body: "Hinduism is the world's third-largest religion by population, practiced mainly in India, Nepal, and among diaspora communities worldwide, and is commonly cited by historians as the oldest major religion still actively practiced.",
  },
];

export const TEMPLES: StackItem[] = [
  {
    color: "#C9954B",
    title: "Angkor Wat",
    sub: "Siem Reap, Cambodia · originally dedicated to Vishnu",
    body: "The largest religious monument in the world, covering about 402 acres (162.6 hectares). Built 1113–1150 CE by the Khmer king Suryavarman II, its five towers represent Mount Meru, the cosmic mountain of Hindu tradition. It later transitioned into a Buddhist site but has never stopped being an active place of worship.",
  },
  {
    color: "#B8892A",
    title: "BAPS Swaminarayan Akshardham",
    sub: "New Delhi, India · dedicated to Bhagwan Swaminarayan",
    body: "Holds the Guinness World Record for the world's largest comprehensive Hindu temple. Consecrated in 2005, the main structure stands about 141 ft tall across an 86,342 sq ft footprint within a roughly 32-acre complex, built without any structural steel by about 11,000 artisans and volunteers.",
  },
  {
    color: "#3F7FB8",
    title: "Sri Ranganathaswamy Temple",
    sub: "Srirangam, Tamil Nadu, India · dedicated to Ranganatha (a reclining form of Vishnu)",
    body: "The largest functioning Hindu temple in the world (Angkor Wat is larger but no longer active as a Hindu site), spanning about 156 acres across 7 concentric enclosures and 21 towers. Its origins trace to around the 2nd century BCE, with most standing structures built between the 10th and 16th centuries CE.",
  },
  {
    color: "#E2711D",
    title: "Sri Venkateswara Temple, Tirumala",
    sub: "Tirupati, Andhra Pradesh, India · dedicated to Venkateswara (a form of Vishnu)",
    body: "The richest Hindu temple in the world by donations and assets, and the most-visited place of worship on Earth — drawing 30,000 to over 100,000 pilgrims a day, and several hundred thousand during major festivals.",
  },
  {
    color: "#A9435A",
    title: 'Brihadeeswarar Temple ("Big Temple")',
    sub: "Thanjavur, Tamil Nadu, India · dedicated to Shiva",
    body: "Built by the Chola emperor Raja Raja I between 1003 and 1010 CE. Its vimana tower rises about 216 ft (66m), among the tallest of its kind in the world, capped by an 80-ton monolithic granite cupola. A UNESCO World Heritage Site.",
  },
  {
    color: "#5B5580",
    title: "Kashi Vishwanath Temple",
    sub: "Varanasi, India · dedicated to Shiva",
    body: "One of the twelve Jyotirlinga shrines considered most sacred to Shiva worship, located in Varanasi — often cited as one of the oldest continuously inhabited cities in the world.",
  },
  {
    color: "#8A5FC9",
    title: "Meenakshi Amman Temple",
    sub: "Madurai, Tamil Nadu, India · dedicated to Meenakshi (a form of Parvati) and Sundareswarar (Shiva)",
    body: "Famous for its 14 towering, brightly painted gopurams (gateway towers) covered in thousands of sculpted figures depicting Hindu mythology.",
  },
];

export const PILLARS: Concept[] = [
  {
    name: "Shahada",
    short: "The declaration of faith.",
    long: "The testimony that there is no god but God (Allah) and that Muhammad is His messenger. Sincerely reciting it is considered the entry point into Islam.",
  },
  {
    name: "Salah",
    short: "Five daily ritual prayers.",
    long: "Prescribed prayers performed at dawn, midday, afternoon, sunset, and night, facing the Kaaba in Mecca, structured around set physical postures and recitations.",
  },
  {
    name: "Zakat",
    short: "Obligatory almsgiving.",
    long: "A portion of eligible wealth (commonly reckoned at about 2.5% of savings) given annually to those in need, treated as a purification of wealth rather than optional charity.",
  },
  {
    name: "Sawm",
    short: "Fasting during Ramadan.",
    long: "Abstaining from food, drink, and other specified acts from dawn to sunset throughout the month of Ramadan, the month the Quran is believed to have first been revealed.",
  },
  {
    name: "Hajj",
    short: "Pilgrimage to Mecca.",
    long: "A pilgrimage to the Kaaba in Mecca, required at least once in a lifetime for those who are physically and financially able, performed during a specific month of the Islamic calendar.",
  },
];

export const ARTICLES_OF_FAITH: StackItem[] = [
  {
    color: "#B8892A",
    title: "Tawhid",
    sub: "Belief in the oneness of God",
    body: "The core Islamic doctrine that God (Allah) is one, without partner or equal — considered the single most fundamental belief in Islam.",
  },
  {
    color: "#4A9089",
    title: "Malaika",
    sub: "Belief in angels",
    body: "Angels are described as beings created from light who carry out God's commands — including Jibril (Gabriel), traditionally understood as the angel who delivered revelation to the prophets.",
  },
  {
    color: "#C96A4B",
    title: "Kutub",
    sub: "Belief in revealed books",
    body: "Muslims believe God revealed scriptures to various prophets over time, including the Tawrat (Torah) to Musa, the Zabur (Psalms) to Dawud, the Injil (Gospel) to Isa, and the Quran to Muhammad as the final revelation.",
  },
  {
    color: "#3F7FB8",
    title: "Anbiya",
    sub: "Belief in the prophets",
    body: "Belief in a line of prophets and messengers sent by God to every nation, including figures shared with Judaism and Christianity, with Muhammad regarded as the final prophet.",
  },
  {
    color: "#5B5580",
    title: "Qiyamah",
    sub: "Belief in the Day of Judgment",
    body: "A day on which all people will be resurrected and held accountable for their deeds, leading to Paradise (Jannah) or Hell (Jahannam).",
  },
  {
    color: "#8A5FC9",
    title: "Qadar",
    sub: "Belief in divine decree",
    body: "The belief that God has full knowledge and ultimate authority over all that happens, while human beings remain responsible for their own choices and actions.",
  },
];

export const PROPHETS: Figure[] = [
  {
    name: "Adam",
    era: "The first prophet",
    form: "Father of humanity",
    story:
      "Regarded as the first human being and the first prophet, created directly by God and placed in a garden before being sent to Earth.",
    teaching:
      "Human life begins in relationship with God, and prophethood begins with the very first generation.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Ad",
  },
  {
    name: "Nuh (Noah)",
    era: "Pre-flood generation",
    form: "Builder of the ark",
    story:
      "Sent to warn his people away from idol worship for centuries; built an ark on God's command and survived a great flood along with his followers and pairs of animals.",
    teaching:
      "Patient warning in the face of long rejection, and trust in divine instruction even when it seems impossible.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Nu",
  },
  {
    name: "Ibrahim (Abraham)",
    era: "Patriarch",
    form: "Friend of God",
    story:
      "Known for rejecting idol worship, his willingness to sacrifice his son on God's command (halted before completion), and rebuilding the Kaaba in Mecca with his son Ismail.",
    teaching:
      "Complete submission to God's will, and the origin point of monotheistic worship at the Kaaba.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Ib",
  },
  {
    name: "Musa (Moses)",
    era: "Exodus era",
    form: "Speaker with God",
    story:
      "Sent to confront a tyrannical Pharaoh and lead the Israelites out of slavery in Egypt; received the Tawrat (Torah) from God at Mount Sinai.",
    teaching:
      "Confronting oppression directly, and the giving of a detailed law to guide a people.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Mu",
  },
  {
    name: "Dawud (David)",
    era: "Kingdom era",
    form: "Prophet-king",
    story:
      "A king known for his beautiful recitation, said to make iron pliable in his hands, and famed for defeating the giant Jalut (Goliath) as a young man. Received the Zabur (Psalms).",
    teaching:
      "Justice, humility, and devotion combined with worldly authority.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Da",
  },
  {
    name: "Sulaiman (Solomon)",
    era: "Kingdom era",
    form: "Prophet-king",
    story:
      "Son of Dawud, given a kingdom of unmatched scale, understanding of the speech of birds and animals, and command over the wind — famed for his wisdom in judgment.",
    teaching:
      "Immense worldly power held in service of God rather than pride.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Su",
  },
  {
    name: "Isa (Jesus)",
    era: "Roman-era Judea",
    form: "Messenger and healer",
    story:
      "Regarded in Islam as a prophet and messenger (not divine), born miraculously to Maryam (Mary), who performed healing miracles with God's permission and received the Injil (Gospel).",
    teaching:
      "God's power to work through a prophet without violating His oneness — a central point of difference from Christian doctrine.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Is",
  },
  {
    name: "Muhammad",
    era: "7th century CE, Mecca & Medina",
    form: "The final messenger",
    story:
      "Received the Quran over 23 years beginning in 610 CE, migrated from Mecca to Medina in 622 CE, and is regarded in Islam as the final prophet, sealing the line of messengers.",
    teaching:
      "The completion of revelation, delivered through recitation rather than any physical or visual sign.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Mh",
  },
];

export const SEVEN_HEAVENS: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "1st heaven",
    sub: "Adam",
    body: "The Prophet Muhammad is described as meeting Adam at the first heaven, greeting him as the father of humanity.",
  },
  {
    color: "#A97A4F",
    title: "2nd heaven",
    sub: "Isa (Jesus) and Yahya (John the Baptist)",
    body: "The second heaven is described as home to these two cousins, greeted together during the ascent.",
  },
  {
    color: "#C9954B",
    title: "3rd heaven",
    sub: "Yusuf (Joseph)",
    body: "Described as a heaven where the Prophet met Yusuf, noted in the accounts for his extraordinary beauty.",
  },
  {
    color: "#4A9089",
    title: "4th heaven",
    sub: "Idris (Enoch)",
    body: "Home to Idris, a prophet associated in Islamic tradition with wisdom, writing, and astronomy.",
  },
  {
    color: "#3F7FB8",
    title: "5th heaven",
    sub: "Harun (Aaron)",
    body: "Described as home to Harun, brother and supporter of Musa (Moses).",
  },
  {
    color: "#5B5580",
    title: "6th heaven",
    sub: "Musa (Moses)",
    body: "Accounts describe Musa weeping here — not from envy, but because he knew more of his followers would enter Paradise than would follow Muhammad, given how much later Muhammad's message arrived.",
  },
  {
    color: "#8A5FC9",
    title: "7th heaven",
    sub: "Ibrahim (Abraham), near Sidrat al-Muntaha",
    body: "The highest heaven, where the Prophet met Ibrahim near the Lote Tree of the utmost boundary — beyond which, tradition holds, he proceeded alone to receive the command of the five daily prayers.",
  },
];

export const ISLAM_HISTORY: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "c. 570 CE",
    sub: "Birth of Muhammad in Mecca",
    body: "Born into the Quraysh tribe in Mecca, in the Arabian Peninsula, orphaned at a young age and raised by his grandfather and later his uncle.",
  },
  {
    color: "#C9954B",
    title: "610 CE",
    sub: "First revelation",
    body: "At around age 40, Muhammad is said to have received the first verses of the Quran from the angel Jibril (Gabriel) while meditating in the Cave of Hira, marking the start of his prophethood.",
  },
  {
    color: "#4A9089",
    title: "622 CE",
    sub: "The Hijra",
    body: "Muhammad and his followers migrate from Mecca to Medina to escape persecution. This migration marks Year 1 of the Islamic (Hijri) lunar calendar still used today.",
  },
  {
    color: "#3F7FB8",
    title: "630 CE",
    sub: "Conquest of Mecca",
    body: "Muhammad returns to Mecca largely without bloodshed; the Kaaba, previously housing numerous idols, is rededicated to the worship of one God.",
  },
  {
    color: "#5B5580",
    title: "632 CE",
    sub: "Death of Muhammad",
    body: "Muhammad dies in Medina. The Quran is considered complete and preserved, and leadership of the growing Muslim community passes to a series of caliphs.",
  },
  {
    color: "#8A5FC9",
    title: "Today",
    sub: "Roughly 1.9 billion adherents",
    body: "Islam is the world's second-largest religion by population, with major populations across the Middle East, North Africa, South and Southeast Asia, and growing communities worldwide.",
  },
];

export const MOSQUES: StackItem[] = [
  {
    color: "#B8892A",
    title: "Masjid al-Haram",
    sub: "Mecca, Saudi Arabia",
    body: "The holiest site in Islam, surrounding the Kaaba, the direction all Muslims face in prayer. Following expansions, it can hold up to about 2 million worshippers during Hajj.",
  },
  {
    color: "#C9954B",
    title: "Al-Masjid an-Nabawi (The Prophet's Mosque)",
    sub: "Medina, Saudi Arabia",
    body: "The second holiest site in Islam, originally built by Muhammad himself in 622 CE and now containing his tomb. Capacity is roughly 1 million worshippers after major expansions.",
  },
  {
    color: "#E2711D",
    title: "Faisal Mosque",
    sub: "Islamabad, Pakistan",
    body: "For decades the largest mosque in South Asia, funded by Saudi Arabia and named for King Faisal, with a distinctive tent-inspired design by Turkish architect Vedat Dalokay. Capacity is around 300,000 across its grounds.",
  },
  {
    color: "#A9435A",
    title: "Badshahi Mosque",
    sub: "Lahore, Pakistan",
    body: "Built in 1673 by the Mughal emperor Aurangzeb, it was for over 300 years one of the largest mosques in the world and remains one of Pakistan's most iconic landmarks.",
  },
  {
    color: "#3F7FB8",
    title: "Istiqlal Mosque",
    sub: "Jakarta, Indonesia",
    body: "The largest mosque in Southeast Asia, built to commemorate Indonesian independence, with a capacity of roughly 200,000 worshippers.",
  },
  {
    color: "#5B5580",
    title: "Sheikh Zayed Grand Mosque",
    sub: "Abu Dhabi, United Arab Emirates",
    body: "Completed in 2007, known for its white marble domes and, at the time of completion, the world's largest hand-knotted carpet. Holds around 40,000 worshippers and visitors.",
  },
];

export const JEWISH_CORE: Concept[] = [
  {
    name: "Torah",
    short: "The core teaching, given at Sinai.",
    long: "The Five Books of Moses (Genesis through Deuteronomy), understood as revealed to Moshe at Mount Sinai and the foundation of Jewish law and narrative.",
  },
  {
    name: "Mitzvot",
    short: "613 commandments guiding daily life.",
    long: "Traditionally counted as 613 commandments in the Torah, covering everything from ethical conduct to dietary law to ritual observance — the practical expression of the covenant.",
  },
  {
    name: "Shabbat",
    short: "A weekly day of complete rest.",
    long: "Observed from Friday sunset to Saturday nightfall, commemorating God's rest after creation, marked by abstaining from work and specific rituals like lighting candles and reciting kiddush.",
  },
  {
    name: "Brit",
    short: "The covenant with God.",
    long: "The binding agreement first made with Avraham and renewed at Sinai — the relationship at the center of Jewish identity and obligation.",
  },
  {
    name: "Kashrut",
    short: "Dietary laws.",
    long: "Rules governing which foods may be eaten and how they must be prepared, including the separation of meat and dairy — observance varies widely by community.",
  },
  {
    name: "Tikkun Olam",
    short: "Repairing the world.",
    long: "A concept, rooted in Kabbalistic and rabbinic thought, calling for acts of justice and repair that improve the world — widely cited today as a motivation for social action.",
  },
];

export const JEWISH_FIGURES: Figure[] = [
  {
    name: "Avraham (Abraham)",
    era: "Patriarch",
    form: "Father of the covenant",
    story:
      "Called by God to leave his homeland, Avraham became the first to enter into a covenant with the one God, and is regarded as the father of the Jewish people through his son Yitzchak.",
    teaching:
      "Trust in God's promise even when it defies present circumstances.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Av",
  },
  {
    name: "Yitzchak (Isaac)",
    era: "Patriarch",
    form: "Son of the promise",
    story:
      "Bound by his father Avraham on an altar as a test of faith, then spared at the last moment — an episode known as the Akedah, central to Jewish liturgy and thought.",
    teaching:
      "Complete faith tested to its limit, and the sanctity of human life ultimately affirmed.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Yi",
  },
  {
    name: "Yaakov (Jacob)",
    era: "Patriarch",
    form: "Father of the twelve tribes",
    story:
      "Dreamed of a ladder reaching to heaven with angels ascending and descending, and was later renamed Yisrael after wrestling with a divine being. His twelve sons became the twelve tribes of Israel.",
    teaching:
      "A struggle with the divine that leaves a person changed, not defeated.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Ya",
  },
  {
    name: "Moshe (Moses)",
    era: "Exodus era",
    form: "Lawgiver",
    story:
      "Led the Israelites out of slavery in Egypt and received the Torah, including the Ten Commandments, on Mount Sinai. Regarded as the greatest of the prophets in Jewish tradition.",
    teaching:
      "Liberation from oppression paired with the responsibility of a detailed moral and legal code.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Mo",
  },
  {
    name: "Aharon (Aaron)",
    era: "Exodus era",
    form: "First High Priest",
    story:
      "Moshe's brother and spokesperson, appointed as the first High Priest, establishing the priestly line responsible for Temple service and sacrifice.",
    teaching:
      "Peacemaking and mediation, alongside sacred ritual responsibility.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Ah",
  },
  {
    name: "David",
    era: "Kingdom era",
    form: "Shepherd-king",
    story:
      "A shepherd who defeated the giant Goliath as a young man and later became Israel's king, uniting the tribes and establishing Jerusalem as its capital. Traditionally credited with composing many of the Psalms.",
    teaching:
      "The rise from humble beginnings to leadership, marked by both great faith and great flaws.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Dv",
  },
  {
    name: "Shlomo (Solomon)",
    era: "Kingdom era",
    form: "Builder of the Temple",
    story:
      "Son of David, renowned for his wisdom, who built the First Temple in Jerusalem, giving the priestly service a permanent home.",
    teaching:
      "Wisdom sought above wealth or power, put to use in building something lasting.",
    teachingLabel: "Traditionally emphasized as",
    initials: "Sh",
  },
  {
    name: "Eliyahu (Elijah)",
    era: "Divided kingdom era",
    form: "Zealous prophet",
    story:
      "A fierce prophet who confronted idol worship and, according to tradition, ascended to heaven alive in a chariot of fire. Jewish tradition holds he will return to herald the coming of the Messiah.",
    teaching:
      "Uncompromising defense of monotheism, and hope for future redemption.",
    teachingLabel: "Traditionally emphasized as",
    initials: "El",
  },
];

export const JEWISH_HEAVENS: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "1. Vilon",
    sub: "The curtain",
    body: "The lowest heaven, described as a curtain marking the boundary of the sky, drawn back each morning and drawn closed each evening.",
  },
  {
    color: "#A97A4F",
    title: "2. Rakia",
    sub: "The firmament",
    body: "Holds the sun, moon, stars, and constellations, each fixed in its own course.",
  },
  {
    color: "#C9954B",
    title: "3. Shechakim",
    sub: "The millstones",
    body: "Where millstones are said to grind manna for the righteous.",
  },
  {
    color: "#4A9089",
    title: "4. Zevul",
    sub: "The heavenly Jerusalem",
    body: "Home to a heavenly Jerusalem and Temple, where tradition holds the archangel Michael offers sacrifice.",
  },
  {
    color: "#3F7FB8",
    title: "5. Ma'on",
    sub: "Angelic song",
    body: "Where ministering angels are said to sing praises by night and fall silent by day, so as not to compete with Israel's praise on earth.",
  },
  {
    color: "#5B5580",
    title: "6. Machon",
    sub: "The storehouses",
    body: "Described as holding the storehouses of snow, hail, harmful dew, and rain.",
  },
  {
    color: "#8A5FC9",
    title: "7. Araboth",
    sub: "Souls, blessings, and the Throne of Glory",
    body: "The highest heaven — home to the souls of the righteous, the dew said to resurrect the dead, treasuries of blessing, the highest orders of angels, and the Throne of Glory itself.",
  },
];

export const JEWISH_AFTERLIFE: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "Sheol",
    sub: "An early, shadowy underworld",
    body: 'In the earliest biblical texts, Sheol is described simply as a shadowy place where the dead go, with little detail about reward or punishment — closer to a general concept of "the grave" than a moral afterlife.',
  },
  {
    color: "#4A9089",
    title: "Gan Eden",
    sub: "A heavenly paradise",
    body: "A later concept of a blissful afterlife state or place, reserved for the righteous, developed further in rabbinic and mystical literature.",
  },
  {
    color: "#C96A4B",
    title: "Gehinnom",
    sub: "A place of purification, not eternal damnation",
    body: "Usually described as a temporary, purifying process (commonly capped at twelve months) rather than an eternal hell, after which most souls are believed to move on.",
  },
  {
    color: "#5B5580",
    title: "Olam Ha-Ba & Techiyat HaMetim",
    sub: "The World to Come & resurrection of the dead",
    body: "A future age of restoration, associated in classical sources with the resurrection of the dead — though how literally to take this, and how it relates to the messianic era, has been debated for centuries across Jewish thought.",
  },
];

export const JEWISH_HISTORY: StackItem[] = [
  {
    color: "#8B6B4A",
    title: "c. 2000–1800 BCE (traditional)",
    sub: "Avraham's covenant",
    body: "The tradition's own starting point: Avraham enters a covenant with one God. Historians note this period cannot be independently verified and is debated, but it remains Judaism's self-understood origin.",
  },
  {
    color: "#C9954B",
    title: "c. 1300s BCE (traditional)",
    sub: "Exodus & giving of the Torah",
    body: "Moshe leads the Israelites out of Egypt, and the Torah is given at Mount Sinai — the origin point for Jewish law, though the historicity and dating of the Exodus itself is widely debated among scholars.",
  },
  {
    color: "#4A9089",
    title: "c. 1000–957 BCE",
    sub: "Kingdom of Israel; First Temple built",
    body: "David unites the tribes and establishes Jerusalem as capital; his son Solomon builds the First Temple, centralizing worship.",
  },
  {
    color: "#C96A4B",
    title: "586 BCE",
    sub: "First Temple destroyed",
    body: "Babylon destroys the First Temple and exiles much of the population — a foundational trauma commemorated to this day on the fast of Tisha B'Av.",
  },
  {
    color: "#3F7FB8",
    title: "516 BCE – 70 CE",
    sub: "Second Temple period",
    body: "Exiles return and rebuild the Temple; this period ends when Rome destroys the Second Temple in 70 CE, after which Judaism reorganizes around synagogues, prayer, and study rather than Temple sacrifice — the beginning of Rabbinic Judaism.",
  },
  {
    color: "#8A5FC9",
    title: "Today",
    sub: "Roughly 15 million adherents",
    body: "A comparatively small global population concentrated mainly in Israel and the United States, but commonly described by historians as the oldest of the three Abrahamic monotheistic traditions to take shape as an organized religion.",
  },
];

export const SYNAGOGUES: StackItem[] = [
  {
    color: "#B8892A",
    title: "Belz Great Synagogue",
    sub: "Jerusalem, Israel",
    body: "Widely cited as the largest synagogue in the world, completed in 2000 after 15 years of construction. Its main sanctuary capacity is cited between about 6,000 and 10,000 depending on the source, and its ark holds dozens of Torah scrolls.",
  },
  {
    color: "#A9435A",
    title: "Dohany Street Synagogue",
    sub: "Budapest, Hungary",
    body: "The largest synagogue in Europe, seating about 3,000, built in 1859 in a Moorish Revival style and serving the Neolog Jewish community.",
  },
  {
    color: "#C9954B",
    title: "Great Synagogue of Rome",
    sub: "Rome, Italy",
    body: "Completed in 1904, it serves one of the oldest continuous Jewish communities in the world, with roots in Rome predating the Roman destruction of the Second Temple.",
  },
  {
    color: "#4A9089",
    title: "Touro Synagogue",
    sub: "Newport, Rhode Island, USA",
    body: "The oldest surviving synagogue building in the United States, completed in 1763, and a U.S. National Historic Site.",
  },
  {
    color: "#3F7FB8",
    title: "Hurva Synagogue",
    sub: "Jerusalem, Israel (Old City)",
    body: "A historic synagogue in Jerusalem's Jewish Quarter, destroyed and rebuilt several times over three centuries — most recently reconstructed in 2010 after being destroyed in 1948.",
  },
  {
    color: "#5B5580",
    title: "The Western Wall",
    sub: "Jerusalem, Israel",
    body: "Not a synagogue building, but the holiest site in Judaism where prayer is practiced daily — a retaining wall remnant of the Second Temple's courtyard.",
  },
];

export const FAST_HINDU: StackItem[] = [
  {
    color: "#B8892A",
    title: "Ekadashi",
    sub: "Twice a month",
    body: "Observed on the 11th day of each lunar fortnight (roughly twice a month), often involving abstention from grains and beans, dedicated to Vishnu.",
  },
  {
    color: "#E2711D",
    title: "Navratri",
    sub: "Nine nights, twice yearly",
    body: "A nine-night festival honoring the goddess Durga, during which many observers fast partially (avoiding grains, meat, and alcohol) or fully on certain days.",
  },
  {
    color: "#A9435A",
    title: "Karva Chauth",
    sub: "One day, mainly North India",
    body: "A dawn-to-moonrise fast, often complete (no food or water), traditionally observed by married women for their husband's well-being and long life.",
  },
  {
    color: "#5B5580",
    title: "Maha Shivratri",
    sub: "One night, annual",
    body: "A night dedicated to Shiva, often marked by a full-day fast broken only the following morning, alongside night-long prayer and vigil.",
  },
];

export const FAST_ISLAM: StackItem[] = [
  {
    color: "#B8892A",
    title: "Ramadan (obligatory)",
    sub: "One lunar month, annual",
    body: "The best-known Islamic fast: abstaining from food, drink, and marital relations from dawn to sunset for an entire lunar month, one of the Five Pillars.",
  },
  {
    color: "#4A9089",
    title: "Day of Ashura",
    sub: "One day, voluntary",
    body: "A voluntary fast on the 10th of Muharram, associated with the story of Musa's deliverance from Pharaoh and, for Shia Muslims, also a major day of mourning for Husayn ibn Ali.",
  },
  {
    color: "#3F7FB8",
    title: "Day of Arafah",
    sub: "One day, voluntary (for non-pilgrims)",
    body: "A voluntary fast observed by Muslims not performing Hajj, on the day pilgrims gather at Mount Arafat — believed to atone for sins of the past and coming year.",
  },
  {
    color: "#5B5580",
    title: "Six days of Shawwal",
    sub: "Six days, voluntary",
    body: "An optional fast of six days following Ramadan, said in Hadith to carry the reward of fasting the whole year when combined with Ramadan.",
  },
];

export const FAST_JEWISH: StackItem[] = [
  {
    color: "#B8892A",
    title: "Yom Kippur",
    sub: "25 hours, most important fast",
    body: "The Day of Atonement — a complete 25-hour fast from food and drink, along with intensive prayer, marking the holiest day in the Jewish calendar.",
  },
  {
    color: "#A9435A",
    title: "Tisha B'Av",
    sub: "25 hours, mourning",
    body: "A full fast mourning the destruction of both the First and Second Temples, along with other historical tragedies traditionally associated with this date.",
  },
  {
    color: "#4A9089",
    title: "Fast of Gedaliah, 17th of Tammuz, 10th of Tevet",
    sub: "Dawn to dusk, minor fasts",
    body: "Three shorter fasts, each tied to a specific historical event surrounding the Temples' destruction and the Babylonian exile, observed from dawn to nightfall rather than a full 25 hours.",
  },
  {
    color: "#5B5580",
    title: "Ta'anit Esther (Fast of Esther)",
    sub: "Dawn to dusk, before Purim",
    body: "A dawn-to-dusk fast observed the day before Purim, commemorating the fasting described in the Book of Esther before Esther approached the king.",
  },
];

export const FAST_CHRISTIAN: StackItem[] = [
  {
    color: "#B8892A",
    title: "Lent",
    sub: "40 days, before Easter (Western Christianity)",
    body: "A 40-day period from Ash Wednesday to Easter, marked by fasting, almsgiving, and prayer, commemorating Jesus's 40 days of fasting in the wilderness. Practice ranges from full fasting to giving up a specific food or habit, depending on denomination and individual choice.",
  },
  {
    color: "#A9435A",
    title: "Great Lent",
    sub: "40+ days, Eastern Orthodox Christianity",
    body: "A stricter, longer Lenten fast observed in Orthodox tradition, generally excluding meat, dairy, eggs, fish, and sometimes oil and wine on set days, running up to Pascha (Easter).",
  },
  {
    color: "#4A9089",
    title: "Nativity Fast (Advent)",
    sub: "40 days, before Christmas (mainly Eastern Christianity)",
    body: "A fasting period leading up to Christmas, observed with particular strictness in Orthodox churches; Western Advent is generally observed more as a season of preparation than a formal fast today.",
  },
  {
    color: "#3F7FB8",
    title: "Friday abstinence",
    sub: "Weekly",
    body: "Many Catholic and some other Christian traditions abstain from meat on Fridays year-round or at least during Lent, commemorating the day of Jesus's crucifixion.",
  },
];

export const PATTERNS: Pattern[] = [
  {
    color: "#3F7FB8",
    title: "The great flood",
    sub: "Judaism, Christianity, Islam, Hinduism, Sumer/Babylon, Greek myth, Zoroastrianism",
    segments: [
      {
        label: "Judaism & Christianity (Genesis 6–9):",
        text: "Noah builds an ark on God's command to survive a flood sent to cleanse a corrupt world, saving his family and pairs of animals.",
      },
      {
        label: "Islam (Quran, Surah Hud & Nuh):",
        text: "Nuh (Noah) builds an ark after his people reject his warnings for centuries; a son who refuses to board is lost in the flood.",
      },
      {
        label: "Hinduism (Matsya Purana; Shatapatha Brahmana):",
        text: "The fish-avatar Matsya warns Manu, the first man, of a coming flood and guides his boat, preserving the Vedas and the seeds of life.",
      },
      {
        label: "Sumer & Babylon (the oldest known versions):",
        text: "The Sumerian King List and the Eridu Genesis describe Ziusudra surviving a flood sent by the gods; the later Babylonian Epic of Gilgamesh retells this as Utnapishtim, who is warned by the god Ea to build a boat and is later granted immortality.",
      },
      {
        label: "Greek mythology (Deucalion and Pyrrha):",
        text: "Zeus floods the earth to destroy a corrupt age of humanity; Deucalion and his wife survive in a chest and repopulate the world.",
      },
      {
        label: "Zoroastrianism (a related but distinct catastrophe myth):",
        text: "Rather than a flood, the first king Yima is warned of a coming killing winter and builds a vara — an underground enclosure — to preserve the best of every species until the world can be repopulated.",
      },
    ],
  },
  {
    color: "#C96A4B",
    title: "A threatened infant hero",
    sub: "Judaism/Christianity, Hinduism, Greek myth",
    segments: [
      {
        label: "Judaism (Exodus):",
        text: "The infant Moses is hidden in a basket on the Nile to escape Pharaoh's decree to kill Hebrew baby boys.",
      },
      {
        label: "Christianity (Matthew 2):",
        text: "The infant Jesus's family flees to Egypt to escape King Herod's massacre of infant boys in Bethlehem.",
      },
      {
        label: "Hinduism (Bhagavata Purana):",
        text: "The infant Krishna is smuggled to safety at birth to escape his uncle Kansa, who had been prophesied to be killed by Krishna.",
      },
      {
        label: "Greek mythology (Perseus):",
        text: "The infant Perseus is set adrift at sea with his mother after King Acrisius, warned a grandson would kill him, tries to have them killed.",
      },
    ],
  },
  {
    color: "#B8892A",
    title: "The near-sacrifice of a beloved son",
    sub: "Judaism/Christianity, Islam, Greek myth",
    segments: [
      {
        label: "Judaism & Christianity (Genesis 22):",
        text: "Abraham is commanded to sacrifice his son Isaac, then stopped at the last moment and given a ram instead.",
      },
      {
        label: "Islam (Quran, Surah As-Saffat):",
        text: "Ibrahim is commanded to sacrifice his son — most Islamic tradition holds this was Ismail — then stopped and given a ram, commemorated annually at Eid al-Adha.",
      },
      {
        label: "Greek mythology (Iphigenia):",
        text: "Agamemnon is pressured to sacrifice his daughter Iphigenia to appease Artemis before the Trojan War; in some versions a deer is substituted at the last moment.",
      },
    ],
  },
  {
    color: "#4A9089",
    title: "Death and return",
    sub: "Christianity, Greek myth, Hinduism",
    segments: [
      {
        label: "Christianity:",
        text: "Jesus is crucified and, central to Christian belief, rises from the dead on the third day.",
      },
      {
        label: "Greek mythology (Persephone):",
        text: "Persephone descends into the underworld and returns each year, explaining the cycle of the seasons.",
      },
      {
        label: "Hinduism:",
        text: 'Rather than a single death-and-return, Vishnu is described as repeatedly "descending" to earth across ages (the avatars covered earlier on this page) whenever dharma needs restoring.',
      },
    ],
  },
  {
    color: "#5B5580",
    title: "A final battle and an awaited savior",
    sub: "Christianity, Islam, Hinduism, Judaism, Zoroastrianism",
    segments: [
      {
        label: "Christianity:",
        text: "The Second Coming of Christ, followed by a final judgment.",
      },
      {
        label: "Islam:",
        text: "The appearance of the Mahdi, alongside the return of Isa (Jesus), to defeat the false messiah (Dajjal) before the Day of Judgment.",
      },
      {
        label: "Hinduism:",
        text: "Kalki, the final avatar of Vishnu, is prophesied to appear at the end of the current age (Kali Yuga) to end corruption and begin a new cycle.",
      },
      {
        label: "Judaism:",
        text: "The coming of the Mashiach (Messiah), traditionally expected to restore Israel and usher in an age of peace.",
      },
      {
        label: "Zoroastrianism:",
        text: "A final renovation of the world (Frashokereti) led by the Saoshyant, a savior figure prophesied to be born of a virgin who bathes in a lake said to hold the preserved seed of Zoroaster — an idea many historians of religion note as a likely influence on later Jewish, Christian, and Islamic end-times expectations, given centuries of contact between Persian and Jewish communities.",
      },
    ],
  },
  {
    color: "#8A5FC9",
    title: "Divine law or revelation given on a mountain",
    sub: "Judaism/Christianity, Islam, Greek myth",
    segments: [
      {
        label: "Judaism, Christianity & Islam:",
        text: "Moses receives the Torah, including the Ten Commandments, from God on Mount Sinai.",
      },
      {
        label: "Islam, additionally:",
        text: "Muhammad receives the first Quranic revelation in a cave on Mount Hira, and later ascends through the seven heavens from Jerusalem (the Isra and Mi'raj) to receive the command of the five daily prayers.",
      },
      {
        label: "Greek mythology:",
        text: "Mount Olympus is home to Zeus and the Olympian gods — a looser parallel, with a mountain as the seat of divine authority rather than the site of a specific revelation to a mortal.",
      },
    ],
  },
  {
    color: "#4A9089",
    title: "Creation from primordial waters or chaos",
    sub: "Judaism/Christianity, Sumer/Babylon, Hinduism, Greek myth",
    segments: [
      {
        label: "Judaism & Christianity (Genesis 1):",
        text: "The earth begins formless and void, covered in darkness and water, before God's spirit moves over the waters and speaks creation into being.",
      },
      {
        label: "Sumer & Babylon (Enuma Elish):",
        text: "The god Marduk defeats the primordial sea goddess Tiamat and forms the sky and earth from her divided body.",
      },
      {
        label: "Hinduism:",
        text: 'The Rigveda\'s Nasadiya Sukta describes a time when "neither being nor non-being existed"; later Puranic imagery has Vishnu resting on the serpent Ananta Shesha atop a cosmic ocean, with Brahma emerging from a lotus at his navel to begin creation.',
      },
      {
        label: "Greek mythology (Hesiod's Theogony):",
        text: "The world begins from Chaos, a yawning primordial void, out of which the first gods emerge.",
      },
    ],
  },
  {
    color: "#C9954B",
    title: "A descent into the underworld to rescue or retrieve someone",
    sub: "Sumer, Greek myth, Christianity, Buddhism",
    segments: [
      {
        label: "Sumer (the myth of Inanna's Descent):",
        text: "The goddess Inanna descends to the underworld ruled by her sister Ereshkigal, dies there, and is eventually revived and permitted to return.",
      },
      {
        label: "Greek mythology:",
        text: "Persephone is taken to the underworld and returns each year, explaining the seasons; Orpheus separately descends to try to bring his wife Eurydice back from the dead.",
      },
      {
        label: "Christianity (the Harrowing of Hell):",
        text: "A widely held tradition, referenced in the Apostles' Creed, that Christ descended to the realm of the dead between his crucifixion and resurrection.",
      },
      {
        label: "Buddhism (the story of Mulian, East Asian Buddhist tradition):",
        text: "The monk Mulian descends into hell to rescue his mother, a story that became the basis for the Ghost Festival observed across East Asia.",
      },
    ],
  },
  {
    color: "#E2711D",
    title: "Temptation by an adversary before a spiritual mission",
    sub: "Buddhism, Christianity, Zoroastrianism, Islam",
    segments: [
      {
        label: "Buddhism:",
        text: "Mara, a tempter deity, assails Siddhartha Gautama with fear, desire, and doubt as he sits beneath the Bodhi tree, just before his enlightenment.",
      },
      {
        label: "Christianity:",
        text: "Satan tempts Jesus three times during 40 days of fasting in the wilderness, offering power and provision in exchange for worship.",
      },
      {
        label: "Zoroastrianism:",
        text: "Angra Mainyu, the destructive spirit, is said to confront and tempt Zoroaster, who resists and continues his mission.",
      },
      {
        label: "Islam:",
        text: "Tradition holds that Shaytan appeared three times to try to dissuade Ibrahim (and, in some accounts, Ismail) from going through with the sacrifice — commemorated today by the stoning of pillars during Hajj.",
      },
    ],
  },
  {
    color: "#A9435A",
    title: "An extraordinary birth marked by signs and prophecy",
    sub: "Buddhism, Christianity, Zoroastrianism",
    segments: [
      {
        label: "Buddhism:",
        text: "Queen Maya dreams of a white elephant before conceiving Siddhartha Gautama, who is said to be born without pain from her side; the sage Asita visits soon after and prophesies the child's greatness.",
      },
      {
        label: "Christianity:",
        text: "A star appears over Bethlehem, angels announce the birth to shepherds, and the elderly Simeon prophesies over the infant Jesus at the Temple.",
      },
      {
        label: "Zoroastrianism:",
        text: 'Later tradition holds that the infant Zoroaster laughed at birth instead of crying, that his birth was accompanied by a radiant light, and that hostile forces made early attempts on his life — echoing the "threatened infant" pattern covered separately above (compare Moses, Krishna, and the infant Jesus).',
      },
    ],
  },
];

export const INDUS_NOTE = {
  title: "No decoded stories survive",
  meta: "Harappa & Mohenjo-daro · c. 3300–1300 BCE",
  paragraphs: [
    "The Indus script found on thousands of seals and tablets has never been deciphered, despite a century of attempts. That means no myths, prayers, or religious texts from Harappa or Mohenjo-daro can actually be read — everything said about their religion is inference from objects, not a translated story.",
    'What archaeologists have found and debated includes: the "Pashupati seal," a seated figure surrounded by animals that some scholars have speculatively linked to a proto-Shiva "Lord of Animals" figure — a reading many other scholars dispute; numerous female figurines some interpret as mother-goddess imagery; the Great Bath at Mohenjo-daro, suggesting some form of ritual purification; and a recurring sacred fig (pipal) tree motif on seals, which some connect to later Indian tree-veneration.',
  ],
  teaching:
    'Every entry in the story-pattern list is drawn from a text that has actually been read and translated. The Indus Valley has no such text yet, so any claimed "story" from it is speculation dressed as history — worth knowing about, but not something that can honestly be placed side by side with Genesis, the Quran, or the Puranas. Scholars still actively debate how much continuity, if any, exists between Indus Valley religion and later Vedic or Hindu tradition.',
};
