/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Merge source for Volume 15 — "Religions of the World: Biblical-View Tree".
 *
 * `node scripts/merge_volume_15_lineage.mjs` folds the owner's standalone
 * lineage document into src/data/volumes/volume_15.ts (Comparative Religion)
 * as `content.lineage`, so the page renders it natively (site theme, dark mode,
 * language layer, scripture links) instead of framing a second document.
 * Run once; the script is idempotent (it refuses to merge twice) and it aborts
 * rather than guess if the volume no longer looks the way this merge expects.
 *
 * WHAT WAS MERGED, AND WHAT WAS DROPPED AS DUPLICATE
 *  - The document's own header ("Theological Scriptorium / Saul's Podship /
 *    Interactive Theological Encyclopedia") and footer ("Part of Saul's Podship ·
 *    Worship in Spirit and Truth") repeat the site chrome — not carried over.
 *  - Tables "2. FOUNDER & HISTORICAL ORIGIN" and "3. SACRED TEXTS" listed the
 *    founder, date and scriptures of six religions that the tree records in more
 *    detail. They are retired; whatever they said that the tree did not
 *    (Old Testament, Hadith, Talmud, Vedas / Bhagavad Gita, Tripitaka / Sutras,
 *    "Prophet Muhammad") is folded into those six traditions below.
 *  - Atheism and the New Age movement are compared in the tables but are not on
 *    the owner's tree. Nothing is invented for them: their founder / date / text
 *    facts move into their rows of table 1 instead.
 *  - Inside the document: the type badge was echoed in the claim text
 *    ("Contested. …", "No stated claim."), "Occult view: … Check: …" repeated its
 *    own label, and equal dates were stated three times. Each is now said once.
 *  - Scripture abbreviations are written out (Gen → Genesis, Deut → Deuteronomy…)
 *    — the site's house style, and what src/components/ScriptureRef.tsx links.
 *
 * Years are signed (negative = BC); `null` means that dating system has no date.
 */

/* Two sentences recur across several traditions — kept in one place. */
const DEUT_18 = 'Deuteronomy 18:10–12 forbids divination and sorcery.';
const GAL_1 = 'Galatians 1:8 warns against “another gospel”; 2 Corinthians 11:14 says Satan disguises himself as an angel of light.';

export const LINEAGE = {
  eyebrow: 'Origins, Founders & Sacred Texts',
  title: 'Religions of the World: Biblical-View Tree',
  intro:
    'The origin, founder and sacred books of each world religion on one family tree, traced from the primal worship of the LORD through the Flood and Babel to the movements of the modern era. Open any tradition for its dates, founder, books, symbols and the biblical reading of its origin, or switch to the timeline to read them in order of appearance.',
  notes: [
    {
      label: 'Biblical dating rule',
      text: 'Nothing can start before Babel (Ussher 2242 BC; Flood 2348 BC). Where scholars date a tradition earlier, the biblical date is the earliest anchor Scripture allows; where scholars date it later, the two dates agree. Septuagint-based chronologies run centuries earlier.',
    },
    {
      label: 'Source labels',
      text: 'Spiritual-origin and occult-symbol claims are labelled by source type. “Occult view” records what occult writers themselves claim; “Check” records what historians find. Adherents disagree with the biblical reading.',
    },
  ],
  groups: [
    { id: 'occult', label: 'Occult' },
    { id: 'american', label: 'American' },
    { id: 'asian', label: 'Asian' },
    { id: 'abrahamic', label: 'Abrahamic' },
  ],
  nodes: [
    {
      id: "r",
      parent: null,
      name: "Primal worship of the LORD",
      biblicalYear: -4004,
      scholarlyYear: null,
      dateNote: "Ussher: Creation 4004 BC. No scholarly equivalent.",
      founder: "Adam, Seth, Enosh, Noah",
      claimType: "Bible",
      claim: "The root of true worship (Genesis 4:26; 8:20).",
      books: "Genesis (Moses, c. 1445 BC by tradition)",
      symbols: "Altars, sacrifices",
      tags: ["abrahamic"],
    },
    {
      id: "w",
      parent: "r",
      name: "The Watchers and the occult arts",
      biblicalYear: -3544,
      scholarlyYear: null,
      dateNote: "1 Enoch dates the descent to Jared’s days (Ussher: Jared born 3544 BC).",
      founder: "Shemihazah, Azazel (Enochic tradition)",
      claimType: "Tradition",
      claim: "Genesis 6:1–4. 1 Enoch says fallen angels taught sorcery, astrology and metalwork. Others read “sons of God” as Seth’s line.",
      books: "1 Enoch (c. 300 BC; Jude 1:14–15 quotes it)",
      symbols: "Forbidden knowledge",
      tags: ["occult"],
      occultView: "Occultists say these teachers gave humanity astrology, magic and metalwork as enlightenment, not corruption.",
    },
    {
      id: "t",
      parent: "r",
      name: "The Flood and Babel",
      biblicalYear: -2242,
      scholarlyYear: null,
      dateNote: "Ussher: Flood 2348 BC; Babel 2242 BC (Peleg born 2247 BC); Babylon 2234, Egypt 2188, Greece 2089 BC.",
      founder: "Noah’s sons; Nimrod (Genesis 10–11)",
      claimType: "Bible",
      claim: "God scattered the nations (Genesis 11). Deuteronomy 32:8, 17 and Psalm 106:37 are read as saying pagan sacrifices went to demons.",
      books: "Genesis 10–11",
      symbols: "Ziggurat (the tower)",
      tags: [],
    },
    {
      id: "ab",
      parent: "r",
      name: "The Abrahamic line (covenant)",
      biblicalYear: -1921,
      scholarlyYear: -1900,
      dateNote: "Ussher: Abraham born 1996, called 1921 BC. Scholars place him c. 2000–1700 BC.",
      founder: "Abraham of Ur",
      claimType: "Bible",
      claim: "God’s covenant with Abraham (Genesis 12).",
      books: "Genesis",
      symbols: "Altars, circumcision",
      tags: ["abrahamic"],
    },
    {
      id: "jud",
      parent: "ab",
      name: "Judaism (Torah faith)",
      biblicalYear: -1491,
      scholarlyYear: -1200,
      dateNote: "Ussher: Sinai 1491 BC. Scholars: Israel appears c. 1208 BC (Merneptah Stele).",
      founder: "Moses at Sinai",
      claimType: "Bible",
      claim: "The true-worship line in the Bible.",
      books: "Torah; Tanakh (Hebrew Bible, c. 400 BC); Talmud",
      symbols: "Menorah, Ark of the Covenant, tefillin",
      tags: ["abrahamic"],
    },
    {
      id: "chr",
      parent: "jud",
      name: "Christianity",
      biblicalYear: 33,
      scholarlyYear: 30,
      dateNote: "Ussher: Jesus born 4 BC, crucified AD 33. Scholars: c. AD 30.",
      founder: "Jesus Christ and the apostles",
      claimType: "Bible",
      claim: "Fulfilment of the Law and the Prophets.",
      books: "The Holy Bible: Old Testament and New Testament (50–95 AD)",
      symbols: "Cross, Ichthys fish, chi-rho",
      tags: ["abrahamic"],
      occultViewLabel: "Disputed claim",
      occultView: "Fish symbolism (Hislop, 1853, and some prophecy writers): the bishop’s mitre copies the fish-head crown of Dagon/Oannes (Enki’s fish-robed sage).",
      check: "Dagan was a West Semitic grain god; Oannes is Ea’s sage; the mitre appears c. AD 1000, about 1,600 years after Nineveh fell; the Ichthys is a Greek acrostic from the 2nd century AD.",
    },
    {
      id: "isl",
      parent: "ab",
      name: "Islam",
      biblicalYear: 610,
      scholarlyYear: 610,
      founder: "Prophet Muhammad (Mecca)",
      claimType: "Contested",
      claim: "Muslims trace it to Abraham through Ishmael. Christians cite Galatians 1:8 and hold it departs from the gospel; Muslims reject this.",
      books: "Qur’an (revealed word; compiled c. 650 AD); Hadith (traditions)",
      symbols: "Crescent, Kaaba, Shahada",
      tags: ["abrahamic"],
    },
    {
      id: "bah",
      parent: "isl",
      name: "Baháʼí Faith",
      biblicalYear: 1863,
      scholarlyYear: 1863,
      dateNote: "AD 1863 declaration.",
      founder: "Bahá’u’lláh (Persia); Bábism began 1844",
      claimType: "Contested",
      claim: "Teaches that all religions share one source.",
      books: "Kitáb-i-Aqdas (1873)",
      symbols: "Nine-pointed star",
      tags: ["abrahamic"],
    },
    {
      id: "lds",
      parent: "chr",
      name: "Latter-day Saint movement (Mormonism)",
      biblicalYear: 1830,
      scholarlyYear: 1830,
      dateNote: "Church organized April 1830.",
      founder: "Joseph Smith (New York, USA)",
      claimType: "Contested",
      claim: `Smith reported visits from the angel Moroni. ${GAL_1} Latter-day Saints reject this reading.`,
      books: "Book of Mormon (1830)",
      symbols: "Angel Moroni statue, temple garments",
      tags: ["american"],
    },
    {
      id: "jw",
      parent: "chr",
      name: "Jehovah’s Witnesses",
      biblicalYear: 1879,
      scholarlyYear: 1879,
      dateNote: "Bible study group 1870; Zion’s Watch Tower 1879; name “Jehovah’s Witnesses” 1931.",
      founder: "Charles Taze Russell (Pennsylvania, USA)",
      claimType: "Contested",
      claim: "It rejects the Trinity and Christ’s deity; critics cite Galatians 1:8.",
      books: "New World Translation (1950–60)",
      symbols: "The Watchtower magazine",
      tags: ["american"],
    },
    {
      id: "sda",
      parent: "chr",
      name: "Seventh-day Adventism",
      biblicalYear: 1863,
      scholarlyYear: 1863,
      dateNote: "Millerite movement 1840s; church organized 1863.",
      founder: "Ellen G. White; William Miller (USA)",
      claimType: "Contested",
      claim: "Many evangelicals count it Christian but dispute White’s prophetic authority.",
      books: "Writings of Ellen G. White",
      symbols: "Seventh-day Sabbath",
      tags: ["american"],
    },
    {
      id: "noi",
      parent: "isl",
      name: "Nation of Islam",
      biblicalYear: 1930,
      scholarlyYear: 1930,
      dateNote: "Founded in Detroit, 1930.",
      founder: "Wallace Fard Muhammad; Elijah Muhammad (Detroit, USA)",
      claimType: "Contested",
      claim: "Mainstream Muslims reject its teachings.",
      books: "Message to the Blackman in America",
      symbols: "Star and crescent",
      tags: ["american"],
    },
    {
      id: "sum",
      parent: "t",
      name: "Sumerian religion (Mesopotamian polytheism)",
      biblicalYear: -2234,
      scholarlyYear: -3500,
      dateNote: "Scholars: Uruk period c. 3500 BC (first Eridu temple c. 5400 BC; cuneiform c. 3300 BC). Ussher: Babylon begins 2234 BC.",
      founder: "No single founder; Nimrod by tradition",
      claimType: "Tradition",
      claim: "Gods An, Enlil, Inanna. Read as demonic powers behind idols (Deuteronomy 32:17).",
      books: "Sumerian King List; Gilgamesh poems (c. 2100 BC)",
      symbols: "Ziggurats, cylinder seals, eight-pointed star of Inanna",
      tags: [],
    },
    {
      id: "anu",
      parent: "sum",
      name: "Anunnaki and Enki–Ea worship (Eridu cult)",
      biblicalYear: -2234,
      scholarlyYear: -3500,
      dateNote: "Eridu cult c. 5400–3500 BC by scholars; Ussher’s Babylon, 2234 BC.",
      founder: "No founder; Berossus’ Oannes taught men (c. 280 BC)",
      claimType: "Tradition",
      claim: "Some read the “great gods” as fallen Watchers. Ancient-astronaut writers (Sitchin, 1976) call them aliens; scholars reject this.",
      books: "Enuma Elish (copies c. 1100 BC); Atrahasis; Epic of Gilgamesh",
      symbols: "Fish-robed apkallu sages, eight-pointed star, winged disc, serpent staff",
      tags: ["occult"],
      occultView: "Occultists claim Anunnaki wisdom passed down through secret schools. Modern books such as the Simon Necronomicon (1977) invent a magic system from these names; Assyriologists call it fiction.",
    },
    {
      id: "bab",
      parent: "sum",
      name: "Babylonian religion (Marduk worship)",
      biblicalYear: -1894,
      scholarlyYear: -1894,
      dateNote: "Babylon’s Amorite dynasty began c. 1894 BC; Marduk rose under Hammurabi (c. 1792–1750 BC).",
      founder: "Hammurabi’s dynasty raised Marduk",
      claimType: "Bible",
      claim: "Bel/Marduk is named and judged in Isaiah 46:1 and Jeremiah 50:2.",
      books: "Enuma Elish (Marduk epic)",
      symbols: "Ishtar Gate, Marduk’s dragon (mušḫuššu)",
      tags: [],
    },
    {
      id: "kem",
      parent: "t",
      name: "Kemetism (Ancient Egyptian religion)",
      biblicalYear: -2188,
      scholarlyYear: -3100,
      dateNote: "Scholars: unification c. 3100 BC (Naqada ritual from c. 4000 BC). Ussher: Mizraim settles Egypt 2188 BC.",
      founder: "No founder; Mizraim by lineage (Genesis 10:6)",
      claimType: "Bible",
      claim: "Exodus 12:12 describes judgment on all the gods of Egypt.",
      books: "Pyramid Texts (c. 2350 BC); Book of the Dead (c. 1550 BC)",
      symbols: "Ankh, Eye of Horus, scarab, ouroboros, pyramids",
      tags: ["occult"],
      occultView: "The Eye of Horus, ankh and scarab are charms of magic (heka) and the root of Western occult eye symbols.",
      check: "Egyptians used them as protective amulets; Western occultism took them up much later.",
    },
    {
      id: "can",
      parent: "t",
      name: "Canaanite religion (Baalism)",
      biblicalYear: -2200,
      scholarlyYear: -2400,
      dateNote: "Scholars: Dagan appears at Ebla c. 2400 BC. Biblical date inferred from Ham’s line after Babel.",
      founder: "Canaan, son of Ham (Genesis 10:6)",
      claimType: "Bible",
      claim: "Sacrifices to demons (Psalm 106:37). Baal, Asherah and Molech are condemned.",
      books: "Ugaritic Baal Cycle (c. 1350 BC)",
      symbols: "Asherah poles, high places, bull figures",
      tags: [],
    },
    {
      id: "hit",
      parent: "t",
      name: "Hittite and Anatolian religion",
      biblicalYear: -2200,
      scholarlyYear: -2500,
      dateNote: "Scholars: Hatti c. 2500 BC; Göbekli Tepe (c. 9500 BC) is the oldest known ritual site and cannot fit Ussher without reinterpretation. Biblical date inferred.",
      founder: "Japheth’s sons (Genesis 10:2); no founder",
      claimType: "None stated",
      claim: "Later Artemis of Ephesus (Acts 19).",
      books: "Hittite tablets (c. 1650 BC)",
      symbols: "Double-headed eagle, T-shaped pillars",
      tags: [],
    },
    {
      id: "gre",
      parent: "t",
      name: "Hellenic polytheism (Ancient Greek religion)",
      biblicalYear: -2089,
      scholarlyYear: -1600,
      dateNote: "Scholars: Mycenaean cults c. 1600 BC. Ussher: Greece begins 2089 BC.",
      founder: "Javan’s line (Genesis 10:2); Homer and Hesiod shaped it",
      claimType: "Bible",
      claim: "Paul at Athens (Acts 17); 1 Corinthians 10:20 on sacrifices to demons.",
      books: "Homer, Hesiod (c. 750 BC)",
      symbols: "Temples, oracle of Delphi",
      tags: [],
    },
    {
      id: "rom",
      parent: "gre",
      name: "Roman religion (Religio Romana)",
      biblicalYear: -753,
      scholarlyYear: -753,
      dateNote: "Traditional founding of Rome, 753 BC.",
      founder: "Romulus and Numa (legendary)",
      claimType: "Bible",
      claim: "Emperor worship opposed in Revelation 13 (one reading).",
      books: "Sibylline Books",
      symbols: "Augury, lares, Pontifex Maximus",
      tags: [],
    },
    {
      id: "mit",
      parent: "gre",
      name: "Mithraism (Roman mystery cult)",
      biblicalYear: 100,
      scholarlyYear: 100,
      dateNote: "Appears in the 1st century AD.",
      founder: "Unknown; Persian Mithra cult",
      claimType: "None stated",
      books: "No scriptures; temple reliefs",
      symbols: "Bull-slaying scene, seven grades",
      tags: ["occult"],
      occultView: "Initiatory grades and astral symbolism were later claimed by esoteric orders.",
      check: "No Mithraic texts survive.",
    },
    {
      id: "cel",
      parent: "t",
      name: "Druidry (Celtic religion)",
      biblicalYear: -800,
      scholarlyYear: -800,
      dateNote: "Hallstatt Iron Age c. 800 BC; Druids first named c. 200 BC.",
      founder: "Druid priests; no founder",
      claimType: "None stated",
      books: "Oral; Roman accounts",
      symbols: "Oak and mistletoe, stone circles",
      tags: [],
    },
    {
      id: "nor",
      parent: "t",
      name: "Norse paganism (Germanic heathenry)",
      biblicalYear: -1700,
      scholarlyYear: -1700,
      dateNote: "Nordic Bronze Age rock art c. 1700 BC; Viking Age AD 793–1066.",
      founder: "No founder; Odin as chief god",
      claimType: "None stated",
      books: "Poetic Edda (c. 1270 AD; older oral)",
      symbols: "Mjölnir hammer, valknut, runes",
      tags: [],
    },
    {
      id: "zor",
      parent: "t",
      name: "Zoroastrianism (Mazdayasna)",
      biblicalYear: -1200,
      scholarlyYear: -1200,
      dateNote: "Scholars range from c. 1500 to 1000 BC; tradition says 6th century BC.",
      founder: "Zarathustra (Zoroaster)",
      claimType: "None stated",
      claim: "Cyrus the Persian is praised in Isaiah 45.",
      books: "Avesta (oral; written c. AD 400–600)",
      symbols: "Fire temples, Faravahar winged disc",
      tags: [],
    },
    {
      id: "ved",
      parent: "t",
      name: "Vedic religion (Vedism)",
      biblicalYear: -1500,
      scholarlyYear: -1500,
      founder: "No founder; the Vedic rishis",
      claimType: "Contested",
      claim: "Some Christian writers cite 1 Corinthians 10:20; Hindus reject this.",
      books: "Rigveda (c. 1500–1200 BC, oral)",
      symbols: "Fire altar (yajna), soma, Om",
      tags: ["asian"],
    },
    {
      id: "hin",
      parent: "ved",
      name: "Hinduism (Sanātana Dharma)",
      biblicalYear: -500,
      scholarlyYear: -500,
      dateNote: "Classical Hinduism took shape c. 500 BC–AD 300 from Vedism.",
      founder: "No single founder",
      claimType: "Contested",
      claim: "Some Christian writers cite 1 Corinthians 10:20 on idol worship; Hindus reject this.",
      books: "Vedas (Rigveda); Upanishads; Mahabharata and Bhagavad Gita; Puranas",
      symbols: "Om, trishula, Shiva lingam, mandala, swastika",
      tags: ["asian"],
    },
    {
      id: "ind",
      parent: "t",
      name: "Indus Valley religion (Harappan)",
      biblicalYear: -2100,
      scholarlyYear: -2600,
      dateNote: "Scholars: mature Harappan c. 2600–1900 BC. Biblical date is an inference after Babel.",
      founder: "Unknown; script undeciphered",
      claimType: "Speculation",
      claim: "The Bible does not mention it. Its placement after Babel is an inference.",
      books: "None known",
      symbols: "Pashupati seal, Great Bath",
      tags: ["asian"],
    },
    {
      id: "jai",
      parent: "ved",
      name: "Jainism",
      biblicalYear: -599,
      scholarlyYear: -599,
      dateNote: "Mahavira c. 599–527 BC by tradition. Part of the 6th–5th c. BC Shramana movement.",
      founder: "Mahavira, 24th Tirthankara (Parshvanatha earlier)",
      claimType: "None stated",
      books: "Agamas (written c. AD 450)",
      symbols: "Jain hand (ahimsa), swastika, siddhashila",
      tags: ["asian"],
    },
    {
      id: "bud",
      parent: "ved",
      name: "Buddhism",
      biblicalYear: -500,
      scholarlyYear: -500,
      dateNote: "Scholars: c. 480–400 BC (older view 563–483 BC).",
      founder: "Siddhartha Gautama",
      claimType: "None stated",
      books: "Tripitaka (Pali Canon, written c. 29 BC); various Sutras",
      symbols: "Dharma wheel, lotus, stupa",
      tags: ["asian"],
    },
    {
      id: "sik",
      parent: "hin",
      name: "Sikhism",
      biblicalYear: 1499,
      scholarlyYear: 1499,
      dateNote: "Nanak’s call 1499; scripture 1604.",
      founder: "Guru Nanak (Punjab)",
      claimType: "None stated",
      books: "Guru Granth Sahib (1604)",
      symbols: "Khanda, the five Ks",
      tags: ["asian"],
    },
    {
      id: "cfr",
      parent: "t",
      name: "Chinese folk religion (Shenism)",
      biblicalYear: -1600,
      scholarlyYear: -1600,
      dateNote: "Shang dynasty c. 1600 BC (oracle bones c. 1250 BC).",
      founder: "No founder; worship of Shangdi",
      claimType: "Contested",
      claim: "Early Shangdi worship resembles monotheism. Ancestor and spirit rites fall under Deuteronomy 18.",
      books: "Classic of Documents; I Ching",
      symbols: "Ancestor tablets, joss paper, bagua",
      tags: ["asian"],
    },
    {
      id: "con",
      parent: "cfr",
      name: "Confucianism (Rujiao)",
      biblicalYear: -500,
      scholarlyYear: -500,
      founder: "Confucius (Kong Fuzi, 551–479 BC)",
      claimType: "None stated",
      books: "Analects (c. 450 BC onward)",
      symbols: "Ancestral rites, Temple of Confucius",
      tags: ["asian"],
    },
    {
      id: "tao",
      parent: "cfr",
      name: "Taoism (Daoism)",
      biblicalYear: -350,
      scholarlyYear: -350,
      dateNote: "Philosophy c. 350 BC; Celestial Masters church AD 142.",
      founder: "Laozi (tradition); Zhang Daoling organized it, AD 142",
      claimType: "Contested",
      claim: "Spirit talismans and divination fall under Deuteronomy 18.",
      books: "Tao Te Ching (c. 350–250 BC)",
      symbols: "Yin-yang, paper talismans, bagua",
      tags: ["asian"],
      occultView: "Talismans (fu) and the bagua are used for magic and divination.",
      check: "This is ritual Daoism; the philosophy is separate.",
    },
    {
      id: "shi",
      parent: "t",
      name: "Shinto (Kami-no-michi)",
      biblicalYear: -300,
      scholarlyYear: -300,
      dateNote: "Yayoi period c. 300 BC; written myths AD 712.",
      founder: "No founder; Amaterasu myth line",
      claimType: "None stated",
      books: "Kojiki (AD 712); Nihon Shoki (AD 720)",
      symbols: "Torii gate, sacred rope, mirror",
      tags: ["asian"],
    },
    {
      id: "yor",
      parent: "t",
      name: "Yoruba religion (Orisha worship, Ifá)",
      biblicalYear: -2200,
      scholarlyYear: -500,
      dateNote: "Scholars: Ife settled from c. 500 BC; Ifá is oral and undated. Biblical date inferred: earliest possible after Babel.",
      founder: "No founder; descendants of Ham scattered at Babel (inferred)",
      claimType: "Contested",
      claim: "Some read such worship under 1 Corinthians 10:20; practitioners reject this.",
      books: "Ifá corpus (oral, 256 Odu)",
      symbols: "Divination tray, beaded elekes",
      tags: [],
    },
    {
      id: "vod",
      parent: "yor",
      name: "Vodou, Santería (Lucumí) and Candomblé",
      biblicalYear: 1700,
      scholarlyYear: 1700,
      dateNote: "Vodou 1600s–1700s; Santería and Candomblé 1800s.",
      founder: "Enslaved West Africans blending Catholic saints",
      claimType: "Contested",
      claim: "As with its Yoruba root: some read such worship under 1 Corinthians 10:20; practitioners reject this.",
      books: "Oral",
      symbols: "Vèvè drawings, drums, cowrie shells, altars",
      tags: [],
    },
    {
      id: "may",
      parent: "t",
      name: "Mesoamerican and Andean religion (Olmec, Maya, Aztec, Inca)",
      biblicalYear: -1200,
      scholarlyYear: -1200,
      dateNote: "Olmec c. 1200 BC; Aztec capital 1325; Inca empire 1438.",
      founder: "No founder",
      claimType: "Tradition",
      claim: "Human sacrifice is read as demon worship (Psalm 106:37).",
      books: "Popol Vuh (recorded c. 1550); Florentine Codex (1577)",
      symbols: "Step pyramids, Aztec Sun Stone, obsidian knife",
      tags: [],
    },
    {
      id: "nat",
      parent: "t",
      name: "Native American religions (many nations)",
      biblicalYear: -2000,
      scholarlyYear: -10600,
      dateNote: "Scholars: people reached the Americas c. 23,000 years ago (White Sands footprints, disputed); Anzick burial c. 10,600 BC. Biblical date inferred after Babel; no text gives it.",
      founder: "No founder; diverse oral traditions",
      claimType: "None stated",
      claim: "Varies. Many nations preserve a Great Spirit tradition.",
      books: "Oral traditions",
      symbols: "Medicine wheel, sweat lodge, sacred pipe",
      tags: ["american"],
    },
    {
      id: "nac",
      parent: "nat",
      name: "Native American Church",
      biblicalYear: 1918,
      scholarlyYear: 1918,
      dateNote: "Incorporated 1918; peyote use is much older.",
      founder: "John Wilson; Quanah Parker (Oklahoma, USA)",
      claimType: "Contested",
      claim: "Blends Christian and indigenous elements; sacramental peyote.",
      books: "Oral; Bible used in some chapters",
      symbols: "Peyote, water drum, tipi",
      tags: ["american"],
    },
    {
      id: "gd",
      parent: "nat",
      name: "Ghost Dance movement",
      biblicalYear: 1889,
      scholarlyYear: 1889,
      dateNote: "First wave 1870; Wovoka’s revival 1889.",
      founder: "Wovoka (Paiute prophet, Nevada, USA)",
      claimType: "None stated",
      claim: "A revival movement.",
      books: "Oral",
      symbols: "Ghost shirts, circle dance",
      tags: ["american"],
    },
    {
      id: "sci",
      parent: "t",
      name: "Scientology",
      biblicalYear: 1954,
      scholarlyYear: 1954,
      dateNote: "Dianetics 1950; church founded 1954.",
      founder: "L. Ron Hubbard (USA)",
      claimType: "None stated",
      claim: "Self-improvement system turned church.",
      books: "Dianetics (1950)",
      symbols: "Scientology cross, E-meter",
      tags: ["american"],
    },
    {
      id: "cha",
      parent: "w",
      name: "Chaldean astrology and omen magic (Mesopotamia)",
      biblicalYear: -1800,
      scholarlyYear: -1800,
      dateNote: "Omens c. 1800 BC; the 12-sign zodiac c. 5th c. BC.",
      founder: "Babylonian priest-astrologers",
      claimType: "Bible",
      claim: `Isaiah 47:12–13 and Daniel 2 mention them. ${DEUT_18}`,
      books: "Enuma Anu Enlil (c. 1600–1100 BC)",
      symbols: "Zodiac wheel, star charts, clay omen tablets",
      tags: ["occult"],
      occultView: "The zodiac and planetary seals carry hidden power.",
      check: "Later occultism borrowed Babylonian star lore through Hellenistic Egypt.",
    },
    {
      id: "her",
      parent: "w",
      name: "Hermeticism (Egyptian roots, Greek form)",
      biblicalYear: 100,
      scholarlyYear: 100,
      dateNote: "Texts c. AD 100–300 (Casaubon showed in 1614 they are not ancient Egyptian).",
      founder: "Hermes Trismegistus (legendary, from Thoth)",
      claimType: "Tradition",
      claim: `Occult claim of hidden knowledge. ${DEUT_18}`,
      books: "Corpus Hermeticum (AD 100–300); Emerald Tablet",
      symbols: "Caduceus, planetary seals, ouroboros, “As above, so below”",
      tags: ["occult"],
      occultView: "The source of Western magic and alchemy; the caduceus and ouroboros encode transformation.",
      check: "The caduceus is Hermes’ staff; the ouroboros is Egyptian (c. 1300 BC).",
    },
    {
      id: "gno",
      parent: "w",
      name: "Gnosticism",
      biblicalYear: 100,
      scholarlyYear: 100,
      dateNote: "1st–2nd century AD.",
      founder: "Simon Magus (per church fathers); Valentinus",
      claimType: "Tradition",
      claim: "Acts 8:9–24; church fathers called it heresy. Teaches a flawed creator and ruling archons.",
      books: "Nag Hammadi library (2nd–4th c. AD)",
      symbols: "Abraxas gems, ouroboros",
      tags: ["occult"],
      occultView: "Salvation by secret knowledge (gnosis); Abraxas gems were used as amulets.",
    },
    {
      id: "kab",
      parent: "w",
      name: "Kabbalah (Jewish mysticism; occult Qabalah)",
      biblicalYear: 1176,
      scholarlyYear: 1176,
      dateNote: "Medieval Kabbalah emerges c. 1176; Christian Kabbalah from Pico, 1486.",
      founder: "Isaac the Blind; Moses de León",
      claimType: "Contested",
      claim: "Jewish mystics treat it as sacred; occult Qabalah adopts it for magic.",
      books: "Sefer Yetzirah; Bahir (1176); Zohar (c. 1290)",
      symbols: "Tree of Life, Hebrew letter permutations",
      tags: ["occult"],
      occultView: "The Tree of Life maps magic, tarot and planets; the Golden Dawn and Freemasonry reused it.",
      check: "The occult “Qabalah” is a Renaissance and Victorian remake of the Jewish original.",
    },
    {
      id: "fm",
      parent: "her",
      name: "Freemasonry (fraternity with esoteric symbolism)",
      biblicalYear: 1717,
      scholarlyYear: 1717,
      dateNote: "First Grand Lodge 1717; operative guild texts from c. 1390.",
      founder: "United Grand Lodge of England (London); roots in stonemasons’ guilds",
      claimType: "Contested",
      claim: "Masons say it is not a religion. Critics cite its Hermetic and Kabbalistic borrowing and oaths (Matthew 5:34–37).",
      books: "Anderson’s Constitutions (1723); Pike, Morals and Dogma (1871)",
      symbols: "Square and compasses, letter G, all-seeing eye, pillars Boaz and Jachin, checkered floor",
      tags: ["occult"],
      occultView: "Pike and others read Kabbalah and Hermes into its degrees; the Eye is linked to the Eye of Horus.",
      check: "Pillars come from Solomon’s Temple (1 Kings 7:21); the Eye of Providence is Renaissance Christian art (1525).",
    },
    {
      id: "gdn",
      parent: "fm",
      name: "Hermetic Order of the Golden Dawn",
      biblicalYear: 1888,
      scholarlyYear: 1888,
      dateNote: "Founded 1888.",
      founder: "Westcott, Mathers, Woodman (London)",
      claimType: "Tradition",
      claim: `Ceremonial magic. ${DEUT_18}`,
      books: "Cipher Manuscripts",
      symbols: "Tarot, Enochian tablets, wand, dagger, cup, pentacle, lamen",
      tags: ["occult"],
      occultView: "The four tools match the four elements and tarot suits. The lamen is a magical badge.",
    },
    {
      id: "the",
      parent: "gdn",
      name: "Thelema",
      biblicalYear: 1904,
      scholarlyYear: 1904,
      dateNote: "Founded 1904.",
      founder: "Aleister Crowley (Cairo)",
      claimType: "Contested",
      claim: `Claims an angelic voice, Aiwass, dictated its book. ${GAL_1}`,
      books: "The Book of the Law (1904)",
      symbols: "Unicursal hexagram, Stele of Revealing",
      tags: ["occult"],
      occultView: "The unicursal hexagram joins the hexagram and pentagram; the Stele is its sacred relic.",
    },
    {
      id: "wic",
      parent: "gdn",
      name: "Wicca (modern witchcraft)",
      biblicalYear: 1954,
      scholarlyYear: 1954,
      dateNote: "Gardner’s Witchcraft Today, 1954.",
      founder: "Gerald Gardner (England; spread to USA)",
      claimType: "Contested",
      claim: `Practitioners say they do not worship Satan. ${DEUT_18}`,
      books: "Book of Shadows",
      symbols: "Pentacle, athame, chalice, wand, cauldron",
      tags: ["occult"],
      occultView: "The pentacle (upright) stands for the five elements.",
      check: "The pentagram was Pythagorean and Christian (five wounds) before occult use.",
    },
    {
      id: "spi",
      parent: "w",
      name: "Spiritualism",
      biblicalYear: 1848,
      scholarlyYear: 1848,
      dateNote: "Founded 1848.",
      founder: "Fox sisters (Hydesville, New York, USA)",
      claimType: "Bible",
      claim: "Isaiah 8:19 and Deuteronomy 18:11 forbid contacting the dead; 2 Corinthians 11:14.",
      books: "Spirit communications",
      symbols: "Séance table, planchette, spirit trumpet",
      tags: ["occult","american"],
      occultView: "Mediums speak with spirits. The Fox sisters later confessed fraud (1888), then recanted.",
    },
    {
      id: "tsy",
      parent: "w",
      name: "Theosophy",
      biblicalYear: 1875,
      scholarlyYear: 1875,
      dateNote: "Founded 1875.",
      founder: "Helena Blavatsky and Henry Olcott (New York, USA)",
      claimType: "Contested",
      claim: `Occult claim of ascended “Masters”. ${GAL_1}`,
      books: "Isis Unveiled (1877); The Secret Doctrine (1888)",
      symbols: "Seal: ankh, hexagram, ouroboros, swastika, Om",
      tags: ["occult","american"],
      occultView: "The seal joins symbols of East and West.",
      check: "The swastika is an ancient solar sign in Hinduism, Jainism and Buddhism that Theosophy borrowed.",
    },
    {
      id: "cos",
      parent: "w",
      name: "Church of Satan (LaVeyan Satanism)",
      biblicalYear: 1966,
      scholarlyYear: 1966,
      dateNote: "Founded 1966.",
      founder: "Anton LaVey (San Francisco, USA)",
      claimType: "Contested",
      claim: "LaVeyans are atheistic and use Satan as a symbol of the self; Christians read the name as opposition to God.",
      books: "The Satanic Bible (1969)",
      symbols: "Sigil of Baphomet: inverted pentagram, goat head, Hebrew letters",
      tags: ["occult","american"],
      occultView: "The goat is Baphomet, drawn by Eliphas Lévi (1856) from the Templar-trial accusations of 1307; LaVey adopted it in 1969.",
    },
  ],
};

/* ---- the two tables the tree supersedes ---- */
export const RETIRED_TABLES = ['2. FOUNDER & HISTORICAL ORIGIN', '3. SACRED TEXTS'];

/* ---- the surviving tables close ranks: 1, 2, 3 ---- */
export const RENUMBERED_TABLES = {
  '4. THE "JESUS QUESTION": WHO IS HE?': '2. THE "JESUS QUESTION": WHO IS HE?',
  '5. SALVATION & AFTERLIFE': '3. SALVATION & AFTERLIFE',
};

/* ---- Atheism / New Age: founder, date and texts move into their table-1 rows ---- */
export const VIEW_OF_GOD_TABLE = '1. VIEW OF GOD & ULTIMATE REALITY';
export const VIEW_OF_GOD_ROWS = {
  Atheism: {
    from: '📌 No God or supernatural realm; the material universe is all there is.',
    to: '📌 No God or supernatural realm; the material universe is all there is. A modern philosophical movement (1700s+) with no sacred text; it relies on scientific reason.',
  },
  'New Age': {
    from: '📌 "God" is an impersonal cosmic energy; all humans possess divine potential.',
    to: '📌 "God" is an impersonal cosmic energy; all humans possess divine potential. A blended movement (1960s+) drawing on channelings, metaphysical texts and "A Course in Miracles".',
  },
};

/* ---- the dossier promised this visual; it now describes the one on the page ---- */
export const ANALYSIS_EDIT = {
  from: '• **Timeline of Major Religions**: Tracing the origins from Judaism (2000 BC) to the New Age movement (1960s).',
  to: '• **Lineage & Timeline of World Religions**: Tracing every tradition from the primal worship of the LORD and the scattering at Babel to the movements of the twentieth century, on biblical and scholarly dating.',
};

export const OVERVIEW_ADDITION =
  ' A biblical-view family tree traces the origin, founder and sacred texts of each tradition from Babel to the modern era.';

export const NEW_KEYWORDS = [
  'religions of the world family tree',
  'biblical timeline of world religions',
  'origin of world religions after babel',
  'founders and sacred texts of world religions',
  'biblical vs scholarly dating of religions',
  'hinduism buddhism sikhism origins',
  "mormonism jehovah's witnesses adventism origins",
  'freemasonry kabbalah hermeticism occult symbols',
];

/* The tree's first branches are the subject of two existing volumes. */
export const NEW_RELATED = ['forbidden-knowledge-the-watchers', 'primeval-world-timeline-ancient-civilizations'];

/* ─────────────────────────── applier ─────────────────────────── */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src/data/volumes/volume_15.ts');
const stop = (message) => {
  console.error(`[VOL15 MERGE] ${message} — nothing was written`);
  process.exit(1);
};

const src = fs.readFileSync(target, 'utf8');
const start = src.indexOf('= {');
const end = src.lastIndexOf('};');
if (start < 0 || end < 0) stop('could not locate the volume object literal');

const volume = JSON.parse(src.slice(start + 2, end + 1));

if (volume.content?.lineage) {
  console.log('[VOL15 MERGE] lineage already present — nothing to do');
  process.exit(0);
}

/* ---- sanity: the dataset itself ---- */
const ids = new Set(LINEAGE.nodes.map((n) => n.id));
if (ids.size !== LINEAGE.nodes.length) stop('duplicate tradition ids in the merge source');
const roots = LINEAGE.nodes.filter((n) => n.parent === null);
if (roots.length !== 1) stop(`expected exactly one root tradition, found ${roots.length}`);
for (const n of LINEAGE.nodes) {
  if (n.parent !== null && !ids.has(n.parent)) stop(`"${n.name}" branches from an unknown tradition "${n.parent}"`);
}
const groupIds = new Set(LINEAGE.groups.map((g) => g.id));
for (const n of LINEAGE.nodes) {
  for (const tag of n.tags) if (!groupIds.has(tag)) stop(`"${n.name}" uses an unknown group "${tag}"`);
}

/* ---- sanity: the volume still looks the way this merge expects ---- */
const tables = volume.content?.tables || [];
const titles = tables.map((t) => t.title);
for (const title of [VIEW_OF_GOD_TABLE, ...RETIRED_TABLES, ...Object.keys(RENUMBERED_TABLES)]) {
  if (!titles.includes(title)) stop(`table "${title}" not found`);
}
const viewOfGod = tables.find((t) => t.title === VIEW_OF_GOD_TABLE);
for (const [religion, edit] of Object.entries(VIEW_OF_GOD_ROWS)) {
  const row = viewOfGod.rows.find((r) => r[0] === religion);
  if (!row || row[1] !== edit.from) stop(`the "${religion}" row of table 1 has changed`);
}
if (!String(volume.content.analysis).includes(ANALYSIS_EDIT.from)) stop('the analysis line to update has changed');

/* ---- merge ---- */
for (const [religion, edit] of Object.entries(VIEW_OF_GOD_ROWS)) {
  viewOfGod.rows.find((r) => r[0] === religion)[1] = edit.to;
}
const keptTables = tables
  .filter((t) => !RETIRED_TABLES.includes(t.title))
  .map((t) => (RENUMBERED_TABLES[t.title] ? { ...t, title: RENUMBERED_TABLES[t.title] } : t));

const { analysis, tables: _retired, ...restOfContent } = volume.content;
volume.content = {
  analysis: analysis.replace(ANALYSIS_EDIT.from, ANALYSIS_EDIT.to),
  lineage: LINEAGE,
  tables: keptTables,
  ...restOfContent,
};

if (!volume.overview.includes(OVERVIEW_ADDITION.trim())) volume.overview = `${volume.overview}${OVERVIEW_ADDITION}`;

const kwSet = new Set(volume.keywords || []);
volume.keywords = [...(volume.keywords || []), ...NEW_KEYWORDS.filter((k) => !kwSet.has(k))];

const relSet = new Set(volume.relatedVolumes || []);
volume.relatedVolumes = [...(volume.relatedVolumes || []), ...NEW_RELATED.filter((slug) => !relSet.has(slug))];

volume.lastUpdated = '2026-11-10';

const banner = `/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\nimport { Volume } from '../../../types';\n\nexport const volume_15: Volume = `;
fs.writeFileSync(target, `${banner}${JSON.stringify(volume, null, 2)};\n\nexport default volume_15;\n`, 'utf8');

/* Keep the JSON mirror in step. volumesData.json feeds scripts/postbuild.mjs
   (dist/encyclopedia/<slug>.md, llms.txt), prerender-seo, check-links and
   content-regression, so a stale mirror would publish the old dossier. */
const mirrorPath = path.join(root, 'src/data/volumes/volumesData.json');
if (fs.existsSync(mirrorPath)) {
  const mirror = JSON.parse(fs.readFileSync(mirrorPath, 'utf8'));
  const idx = mirror.findIndex((v) => v.slug === volume.slug);
  if (idx >= 0) {
    mirror[idx] = volume;
    fs.writeFileSync(mirrorPath, `${JSON.stringify(mirror, null, 2)}\n`, 'utf8');
    console.log('[VOL15 MERGE] volumesData.json mirror refreshed for volume 15');
  }
}

console.log(`[VOL15 MERGE] ${LINEAGE.nodes.length} traditions merged into volume_15.ts; ${RETIRED_TABLES.length} duplicate tables retired`);
console.log('[VOL15 MERGE] now run: npm run gen:volumes');
