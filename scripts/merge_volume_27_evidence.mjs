/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Merge source for Volume 27 — the comparative/historical dossier.
 *
 * Kept as a build-time-free helper: `node scripts/merge_volume_27_evidence.mjs`
 * appends the text below to src/data/volumes/volume_27.ts (analysis), adds the
 * witness table and the new FAQ entries. Run once; the script is idempotent
 * (it refuses to add the block twice).
 */

export const PART_TWO_HEADING = 'VI. The Comparative Record: Jewish, Muslim and Historical Witnesses';

export const PART_TWO_MARKDOWN = `---
### VI. The Comparative Record: Jewish, Muslim and Historical Witnesses

#### Honest Framing

The Gospels and the Hebrew Scriptures give the strongest case that Jesus made divine claims and was charged with blasphemy. No Quran verse and no hadith says that Jesus is God; they either deny it or are silent. The Muslim and early historical sources are therefore most useful as evidence that the belief was **early, widespread and recognised by Islam's own texts** — not as Muslim proof of it.

---

#### 1. Jewish Scripture (Old Testament) — The Passages Christians Cite

• **Exodus 3:14** — "I AM WHO I AM." This is the background for Jesus's "I am" sayings in John's Gospel.
• **Isaiah 43:10–13; 44:6** — God alone is "I am he," the first and the last. Compare Revelation 1:17, where Jesus takes "the first and the last" of Himself.
• **Isaiah 9:6** — The promised child is called "Mighty God" (*El Gibbor*).
• **Psalm 110:1** — David's "Lord" sits at God's right hand; Jesus cites this in Mark 12:35–37.
• **Daniel 7:13–14** — The "Son of Man" comes on the clouds and receives worship; Jesus quotes this before the Sanhedrin (Mark 14:62).
• **Zechariah 12:10** — "They will look on me, the one they have pierced."

#### 2. The Blasphemy Episodes (New Testament)

• **John 8:58–59** — "Before Abraham was, I am." Those listening pick up stones immediately.
• **John 10:30–33** — "I and the Father are one." The reply is explicit: "You, a man, make yourself God."
• **John 5:18** — They seek to kill Him because He was "making himself equal with God."
• **Mark 2:5–7** — He forgives sins, and the scribes reason, "Who can forgive sins but God alone?"
• **Mark 14:61–64** — Asked whether He is the Messiah, the Son of the Blessed, He answers "I am" and cites Daniel 7. The high priest tears his robes and charges blasphemy.

#### 3. Historical Evidence, With Context

**Pliny the Younger — Letter 10.96 (c. 112 AD)**

• **Who:** Roman governor of Bithynia (modern Turkey), writing to the Emperor Trajan about how to handle Christians brought before him.
• **What it says:** Christians met before dawn and sang a hymn to Christ "as to a god."
• **Why it matters:** A hostile, non-Christian source showing that Christ was worshipped as divine within about eighty years of the crucifixion.
• **Limit:** it records what Christians believed, not what Jesus Himself claimed.

**The Philippians Hymn — Philippians 2:6–11 (30s–50s AD)**

• **Context:** Paul quotes an existing hymn in a letter written around the 50s, so the hymn itself is older still.
• **What it does:** It applies Isaiah 45:23 — "every knee shall bow," a verse about YHWH — to Jesus.
• **Why it matters:** The belief appears within roughly twenty years of the crucifixion, not centuries later.

**Talmud, Sanhedrin 43a (c. 200–500 AD)**

• **What it says:** Yeshu was executed for sorcery and for leading Israel astray.
• **Context:** Written long after the events, and hostile to Christianity.
• **Why it matters:** It confirms that Jewish tradition remembered His execution. It does **not** say He claimed to be God, so cite it as a counterpoint, never as support.

**The Najran Delegation (c. 631 AD)**

• **Context:** A Christian delegation from Najran, in southern Arabia, visited Muhammad in Medina. Ibn Ishaq's *Sira* reports that they argued Jesus is God, God's son, or "third of three."
• **Quran link:** Tradition ties Quran 3:59–61 to this meeting.
• **Why it matters:** Arab Christians held this belief during Muhammad's lifetime, and the Quran addresses it directly.
• **Limit:** the account comes from Muslim sources written about 130 years later (Ibn Ishaq d. 767, preserved through Ibn Hisham).

**The Dome of the Rock Inscriptions (691–692 AD)**

• **Context:** Built in Jerusalem by the Caliph Abd al-Malik, in a city full of Christian churches and under Byzantine rivalry.
• **What it says:** Quranic inscriptions, including 4:171, call Jesus "only a messenger" and deny that God has a son.
• **Why it matters:** The earliest datable monument carrying Quranic text uses it to rebut the Christian belief in Jesus's divinity — so that belief was clearly widespread and visible.

**John of Damascus — *Heresy of the Ishmaelites* (c. 730s–740s AD)**

• **Who:** A Christian theologian and former Umayyad official.
• **What it says:** Muslims call Christ "Word and Spirit of God"; John argues that if Christ is God's Word, He cannot be a created thing.
• **Why it matters:** Among the earliest Christian responses to Islam, and built entirely on Quranic titles.
• **Limit:** scholars debate its exact date and authorship.

**Timothy I and the Caliph al-Mahdi (c. 781 AD)**

• **Who:** Timothy was Patriarch of the Church of the East; the debate was held in Baghdad.
• **What it says:** A formal dialogue in which Timothy defended Christ's divinity using the Quran's own titles for Jesus.
• **Why it matters:** Christians and Muslims were debating this question at the highest level within about 150 years of Islam's beginning.

**The Rabbinic "Two Powers" Debates**

• **Context:** Scholars such as Alan Segal argue that early Jewish concern about a second divine figure fits precisely what Christians were claiming.
• **Why it matters:** It supports the case that the claim was recognised as a challenge to Jewish monotheism — which is why it provoked the charge.

#### 4. Where the Evidence Cuts the Other Way

• **Talmud, Sanhedrin 43a** — executed for sorcery and leading Israel astray, not for claiming to be God.
• **Josephus, *Antiquities* 18.63** — partly a later Christian addition, so use it with caution.
• **The Sanhedrin charge** — some scholars argue that claiming to be the Messiah was not blasphemy in itself, which is exactly why the "Son of Man" saying matters.
• **John 8:58** — "I am" may be read as the divine name or as a claim of pre-existence; Jewish and Muslim scholars read it differently.

#### 5. Muslim Texts: Quran and Hadith

These texts do not teach that Jesus is God. They are gathered here because they give Him unique titles, and because they show Islam responding to a Christian belief that already existed.

#### Quran: verses that reject divinity

• **4:171; 5:72–75; 5:116–117; 19:34–35** — directly reject Jesus's divinity. 4:171 says "do not say three" and calls Him a messenger.

#### Quran: unique titles and attributes

• **3:45; 4:171** — "a Word from Him" and "a Spirit from Him," together with the virgin birth (3:45–47) and the title *al-Masih* (Messiah).
• **3:49; 5:110** — creating birds from clay, healing the blind and the leper, raising the dead — all "by God's leave," which Muslim readers take as proof of prophethood.
• **19:19** — called a "pure boy" (*ghulam zakiyy*).
• **3:55; 4:158** — God raised him up to Himself.
• **43:61** — he is a "sign" or "knowledge" of the Hour.
• **5:116–117** — God asks Jesus whether He told people to worship Him and His mother, and Jesus denies it. The verse presupposes that some were doing so; scholars debate who is meant, since mainstream Christianity never taught that Mary is God.

#### Hadith

• **Bukhari 3431; Muslim 2366** — Satan touches every child at birth except Mary and her son.
• **Bukhari 3435; Muslim 28** — whoever testifies that Jesus is God's servant, His Messenger, and His Word and Spirit enters Paradise. It affirms the titles but explicitly says "servant."
• **Muslim 2937** — Jesus returns, descending at Damascus, and kills the Dajjal: a unique role, but still within prophethood.
• **Bukhari 3443** — Muhammad says he is the closest to Jesus in this world and the next.
• **Bukhari 3448** — the return of Jesus.

Christians point to these as signs of Jesus's unique status; Islamic scholars read them as describing a prophet, not God.

#### 6. How to Frame This in Your Book

• Use Pliny, Philippians 2, Najran, the Dome of the Rock and John of Damascus to show that the belief was **early, widespread and recognised by Islam's own texts**.
• Present the Quran and the hadith as the **opposing view**, then answer it. Muslim readers will trust the argument more for conceding what the Quran denies.
• The honest question to answer is "what did Jesus's claims mean, and why did they provoke a blasphemy charge," not "even the Quran proves it."
• Verify exact wording and numbering against standard editions before publishing, since hadith numbering varies between collections.

Dates for the Talmud, Ibn Ishaq and John of Damascus are approximate and debated among scholars.

---

### VII. Conclusion of the Comparative Record

The deity of Christ rests on the canon — the Hebrew prophets and the apostolic witness. Everything outside that canon functions as corroboration, not as foundation: it shows that the confession was not a fourth-century invention, that it was costly enough to be recorded by hostile witnesses, and that the Quran itself felt obliged to answer it. Used honestly, that is a stronger argument than a proof-text, because it is an argument an opponent can verify.`;

export const WITNESS_TABLE = {
  title: 'HISTORICAL & COMPARATIVE WITNESSES TO THE DIVINE CLAIM',
  headers: ['Source', 'Date', 'What It Attests', 'Weight and Limit'],
  rows: [
    ['Philippians 2:6–11 (hymn quoted by Paul)', '30s–50s AD', 'Isaiah 45:23 ("every knee shall bow") applied to Jesus', 'Pre-Pauline: the earliest witness that the belief was immediate'],
    ['Pliny the Younger, Letter 10.96', 'c. 112 AD', 'Christians sang a hymn to Christ "as to a god"', 'Hostile Roman source; records worship, not Jesus’s own words'],
    ['Talmud, Sanhedrin 43a', 'c. 200–500 AD', 'Yeshu executed for sorcery and leading Israel astray', 'Confirms the execution; does not report a claim to deity'],
    ['Najran delegation (Ibn Ishaq / Ibn Hisham)', 'c. 631 AD', 'Arab Christians arguing Jesus is God, God’s son, "third of three"', 'Muslim source written c. 130 years later'],
    ['Dome of the Rock inscriptions', '691–692 AD', 'Quran 4:171: Jesus "only a messenger," no son of God', 'Earliest datable Quranic monument; rebuts a visible Christian belief'],
    ['John of Damascus, Heresy of the Ishmaelites', 'c. 730s–740s AD', 'Muslims call Christ "Word and Spirit of God"', 'Date and authorship debated by scholars'],
    ['Timothy I and Caliph al-Mahdi', 'c. 781 AD', 'Formal Baghdad dialogue defending Christ’s divinity from Quranic titles', 'Christian record of a high-level inter-faith debate'],
  ],
};

export const NEW_FAQ = [
  {
    q: 'Do the Quran or the hadith ever say that Jesus is God?',
    a: 'No. The Quran never affirms the divinity of Christ and in several places denies it (4:171; 5:72–75; 5:116–117; 19:34–35). The hadith honour Jesus as God’s servant, His Messenger, His Word and Spirit, and as the one who returns to kill the Dajjal — but always within prophethood. They are therefore cited in this volume as evidence that the confession was early and widely known, not as Muslim proof of it.',
  },
  {
    q: 'What is the earliest non-Christian evidence that Jesus was worshipped as God?',
    a: 'Pliny the Younger, governor of Bithynia, wrote to the Emperor Trajan around 112 AD describing Christians who met before dawn and sang a hymn to Christ “as to a god.” It is hostile testimony, roughly eighty years after the crucifixion, and it records what Christians did rather than what Jesus claimed.',
  },
  {
    q: 'Why does the Talmud say Jesus was executed for sorcery and leading Israel astray?',
    a: 'Sanhedrin 43a preserves a later, hostile Jewish tradition that Yeshu was executed for sorcery and for leading Israel away from the Law. It corroborates the execution itself, but it does not report a claim to deity — so it should be cited as a counterpoint and a corroboration of the crucifixion, never as evidence for the divine claim.',
  },
  {
    q: 'How should the Dome of the Rock inscriptions be used in a case for Christ’s deity?',
    a: 'They are the earliest datable monument carrying Quranic text (691–692 AD), and they quote 4:171 to deny that God has a son. The argument is indirect but sound: a state monument would not spend its inscriptions refuting a belief that nobody held, which shows the Christian confession was widespread, public and recognised in Jerusalem within sixty years of Muhammad’s death.',
  },
];

/* ─────────────────────────── applier ─────────────────────────── */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src/data/volumes/volume_27.ts');

const src = fs.readFileSync(target, 'utf8');
const start = src.indexOf('= {');
const end = src.lastIndexOf('};');
if (start < 0 || end < 0) {
  console.error('[VOL27 MERGE] could not locate the volume object literal');
  process.exit(1);
}

const volume = JSON.parse(src.slice(start + 2, end + 1));

if (String(volume.content?.analysis || '').includes(PART_TWO_HEADING)) {
  console.log('[VOL27 MERGE] comparative dossier already present — nothing to do');
  process.exit(0);
}

volume.content = volume.content || {};
volume.content.analysis = `${volume.content.analysis}\n\n${PART_TWO_MARKDOWN}`;
volume.content.tables = [...(volume.content.tables || []), WITNESS_TABLE];

const existingQuestions = new Set((volume.faq || []).map((f) => f.q));
volume.faq = [...(volume.faq || []), ...NEW_FAQ.filter((f) => !existingQuestions.has(f.q))];

const NEW_FACTS = [
  'Historical witnesses outside the canon — the pre-Pauline Philippians hymn (30s–50s AD), Pliny the Younger (c. 112 AD), the Najran delegation (c. 631 AD), the Dome of the Rock inscriptions (691–692 AD), John of Damascus and the Baghdad dialogue of Timothy I (c. 781 AD) — show that the worship of Jesus as divine was early, widespread and recognised by Islam’s own texts.',
  'The Quran and the hadith never affirm the deity of Christ: 4:171, 5:72–75, 5:116–117 and 19:34–35 reject it, while texts such as 3:45 and 4:171 give Jesus unique titles (“a Word from Him”, “a Spirit from Him”) that Islamic scholarship reads as honours of prophethood rather than of divinity.',
  'The Talmud (Sanhedrin 43a) remembers the execution but not a claim to deity, and Josephus (Antiquities 18.63) is partly a later Christian addition — both are cited as corroboration of the crucifixion and as honest counterpoints, never as proof of the divine claim.',
];
const factSet = new Set(volume.keyFacts || []);
volume.keyFacts = [...(volume.keyFacts || []), ...NEW_FACTS.filter((f) => !factSet.has(f))];

const NEW_KEYWORDS = [
  'historical evidence jesus is god',
  'pliny the younger christians hymn to christ',
  'jesus in the quran and hadith',
  'dome of the rock inscriptions jesus',
  'jewish evidence for jesus',
];
const kwSet = new Set(volume.keywords || []);
volume.keywords = [...(volume.keywords || []), ...NEW_KEYWORDS.filter((k) => !kwSet.has(k))];

volume.lastUpdated = '2026-10-25';

const banner = `/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\nimport { Volume } from '../../../types';\n\nexport const volume_27: Volume = `;
fs.writeFileSync(target, `${banner}${JSON.stringify(volume, null, 2)};\n\nexport default volume_27;\n`, 'utf8');

/* Keep the JSON mirror in step. volumesData.json feeds scripts/postbuild.mjs
   (dist/encyclopedia/<slug>.md, llms.txt) and check-links / content-regression,
   so a stale mirror would publish the old dossier to crawlers. */
const mirrorPath = path.join(root, 'src/data/volumes/volumesData.json');
if (fs.existsSync(mirrorPath)) {
  const mirror = JSON.parse(fs.readFileSync(mirrorPath, 'utf8'));
  const idx = mirror.findIndex((v) => v.slug === volume.slug);
  if (idx >= 0) {
    mirror[idx] = volume;
    fs.writeFileSync(mirrorPath, `${JSON.stringify(mirror, null, 2)}\n`, 'utf8');
    console.log('[VOL27 MERGE] volumesData.json mirror refreshed for volume 27');
  }
}

console.log('[VOL27 MERGE] comparative dossier merged into volume_27.ts');
