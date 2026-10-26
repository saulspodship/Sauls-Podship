# Saul's Podship — RSS.com setup kit (copy‑paste)

Everything on this page is written to be pasted straight into the RSS.com
**New podcast** wizard and the **New episode** screens. Nothing here publishes
itself — RSS.com requires a logged‑in account, so you (or an agent with your
credentials) have to click **Next / Publish**.

---

## 0. How RSS.com structures it: show vs. episode vs. season

Three different levels — only the first one is entered **once**:

| Level | What it is | Entered how often | Where it shows |
| --- | --- | --- | --- |
| **Podcast (show)** | The *Title*, *Description*, *Cover art*, *feed URL* on your screenshot | **Once**, when you create the podcast | The card people see in Spotify / Apple Podcasts |
| **Episode** | One `.m4a` file + its own title + its own notes | **Once per file** — 11 files = 11 separate "New episode" uploads | Each row inside the show |
| **Season** (optional) | A folder that groups episodes | Only if you want it | A small "Season 1" label in some apps |

So the rules in plain terms:

1. **The big title (`Saul's Podship — Urdu Bible Apologetics`) is the SHOW, not an
   episode.** It is typed one time and is automatically attached to every episode.
   You never repeat it per episode — apps already print the show name above the
   episode name, so typing it again just wastes the 250 characters.
2. **Each audio file is its own episode.** Do **not** put 8 files inside one
   episode (RSS.com does accept several audio files in one episode, but then all of
   them share one title, one thumbnail and one set of stats — and nobody can jump
   to the question they care about). One question = one episode = one upload.
3. **Seasons are optional and you probably don't need them.** Use **Episodic** and
   just number 1, 2, 3… If you ever want the label, put everything in **Season 1**
   (all of them, consistently — never Season 1 on some and blank on others, that
   looks broken). Seasons are worth it only when you publish in batches months
   apart: Season 1 = the current 8–11 questions, Season 2 = whatever you record
   next year.
4. **Only 8–9 files instead of 11?** Then upload 8–9 episodes. Nothing in the show
   setup changes; just skip the rows you don't have and let the numbers run
   1…N in your upload order. You can always add the remaining files later as
   episodes 12, 13, etc.

### The rhythm of one upload (about 2 minutes per file)

```
Dashboard → "New episode"
  → upload ONE .m4a
  → Episode title  ← the Urdu question title from section 4 (NOT the show title)
  → Episode notes  ← paste that episode's Urdu block from section 4
  → (optional) episode art, keywords, season/episode number
  → Publish  (or "Schedule" if you want a clean release order)
```

Upload them in the order you want them numbered (or type the number in the
*Episode number* field). Publishing the newest one last keeps #1 at the top of a
brand-new show.

## 1. What was in the Drive folder

Folder: `1BejmDDZfHc_kRjjJObFJtFMj9TbdKrZg`
→ 11 audio files (`audio/x-m4a`) + 1 Google Doc (`Podcast Topics Questions`,
the question bank used for the episode notes below).

| # | File | Size |
|---|------|------|
| 1 | یسوع_کے_دو_مختلف_شجرہ_نسب.m4a | 22.5 MB |
| 2 | ہم_جنس_پرستی_اور_قدیم_مذہبی_بحث.m4a | **3.2 MB** ⚠️ |
| 3 | آزمائش_میں_الہی_وعدوں_کی_حقیقت.m4a | 53.8 MB |
| 4 | Khushhali_ki_injeel_ka_fareb.m4a | 44.4 MB |
| 5 | آنکھ_کے_بدلے_آنکھ_اور_سزائے_موت.m4a | 27.3 MB |
| 6 | مسیحیت_میں_طلاق_اور_جذباتی_شفا.m4a | 38.4 MB |
| 7 | سیکرٹ_رپچر_1830_کا_خواب_یا_حقیقت.m4a | 34.2 MB |
| 8 | بائبل_کی_جنگیں_اور_الٰہی_انصاف.m4a | 26.3 MB |
| 9 | بائبل_اور_غلامی_کی_اصل_حقیقت.m4a | 26.8 MB |
| 10 | کیا_سب_کچھ_پہلے_سے_لکھا_ہے.m4a | 44.7 MB |
| 11 | کلیسیا_میں_خواتین_کی_قیادت_اور_بائبل.m4a | 44.0 MB |

⚠️ **Check file 2 before publishing.** Every other episode is 22–54 MB; this one
is 3.2 MB, which is roughly a 3‑minute clip at the same bitrate. It looks like an
interrupted export or a trimmed file. Play it once — if it is cut short, re‑export
it from the source recording.

**Format:** RSS.com accepts `.m4a`, but `mp3` is its recommended format and the
safest for Apple Podcasts / Spotify ingestion. If any upload is rejected, convert
first (`ffmpeg -i file.m4a -codec:a libmp3lame -b:a 128k file.mp3`).

---

## 2. Wizard step 1 — the screen in your screenshot

### Title (max 100 characters)

```
Saul's Podship — Urdu Bible Apologetics | ساؤلز پوڈشپ
```

### Description (max 4000 characters)

Paste this whole block:

```
ساؤلز پوڈشپ — اردو بائبل و عقائد مباحث

کیا بائبل میں واقعی تضادات ہیں؟ کیا خدا نے غلامی کی اجازت دی؟ عہدِ عتیق کی جنگوں اور سزائے موت کا کیا جواز ہے؟ کلیسیا میں خواتین کی قیادت، طلاق، ہم جنس پرستی، تقدیر اور آزاد مرضی، اور خوشحالی کی انجیل — یہ وہ سوالات ہیں جو پاکستان اور برصغیر کے ہر مسیحی اور ہر Seekr کے ذہن میں آتے ہیں۔

ساؤلز پوڈشپ اِن سوالات کا سیدھا، بے لاگ اور صحیفے پر مبنی جواب دیتا ہے۔ ہر قسط میں ایک سوال، اُس کی تاریخی اور ثقافتی پس منظر، اسلام، یہودیت، ہندو مت اور سکھ مت کے اعتراضات کا جائزہ، اور بائبل کی تعلیم کا واضح بیان۔ نہ جذباتی پروپیگنڈا، نہ خاموشی — صرف دلیل، سیاق و سباق اور انجیل کا پیغام۔

ساؤلز پوڈشپ دراصل ساؤلز پوڈشپ سکرپٹوریم (saulspodship.com) کا صوتی حصہ ہے: ۵۰ سے زائد مصور جلدیں، ۴۰۰ سوالات کا تقابلی عقائد انسائیکلوپیڈیا، بائبلی نقشے اور پاکستانی مسیحی موسیقی کا محفوظ خانہ — سب ایک ہی جگہ۔

Saul's Podship is an Urdu-language Christian apologetics podcast from
saulspodship.com. Each episode takes one hard question — slavery in the Bible,
violence in the Old Testament, women's leadership in the church, divorce,
homosexuality and the ancient debate, predestination versus free will, the secret
rapture, the two genealogies of Jesus, the prosperity gospel, the death penalty,
and divine promises in suffering — and answers it honestly from Scripture, in
conversation with the objections raised by Islam, Judaism, Hinduism and Sikhism.

New episodes regularly. Listen in Urdu, think in Scripture.
ویب سائٹ: https://www.saulspodship.com/podcast
```

### Public website and Podcast feed

```
https://rss.com/podcasts/sauls-podship
```

If that slug is already taken by someone else, use
`https://rss.com/podcasts/sauls-podship-urdu` (same words, just longer).
This URL is permanent once the podcast is created.

### Cover art

Upload: **`podcast-rss/cover-art/sauls-podship-cover-3000x3000.jpg`**

- 3000 × 3000 px, square, RGB, JPG, 835 KB — inside every directory limit
  (square, JPG/PNG, < 5 MB, min 1024 px, recommended 3000 px).
- A 1400 × 1400 copy is included for episode art / social use.
- The same file was also uploaded back into the Drive folder.

### Episode art — all 11 ready

Each episode has its own card in the same visual system (wine, gold frame,
`SAUL'S PODSHIP` / `EPISODE nn` header, gold emblem, Urdu title in real Nastaliq,
gold subtitle, `URDU BIBLE APOLOGETICS` footer). Upload `…-3000x3000.jpg` in
*New episode → Episode art*; the `…-1400x1400.jpg` copies are for social posts.

| # | File | Emblem |
|---|------|--------|
| 1 | `ep01-cover-3000x3000.jpg` | book + quill, one road rising to a lamp, one sinking into shadow |
| 2 | `ep02-cover-3000x3000.jpg` | anchor in engraved waves, light striking the ring |
| 3 | `ep03-cover-3000x3000.jpg` | scales: coins + crown on one side, mustard seed + dove on the other |
| 4 | `ep04-cover-3000x3000.jpg` | one trunk splitting into two crowned branches |
| 5 | `ep05-cover-3000x3000.jpg` | pocket watch among clouds, trumpet above |
| 6 | `ep06-cover-3000x3000.jpg` | broken shackles on a scroll, dove rising from the open link |
| 7 | `ep07-cover-3000x3000.jpg` | shield, sword and olive branch on a stone wall |
| 8 | `ep08-cover-3000x3000.jpg` | scales of justice with an eye, upright sword |
| 9 | `ep09-cover-3000x3000.jpg` | cracked vessel bound by gold threads, leaf growing from the seam |
| 10 | `ep10-cover-3000x3000.jpg` | seven-branched lampstand with three smaller lamps |
| 11 | `ep11-cover-3000x3000.jpg` | two facing scrolls, hands meeting, olive branch |

Contact sheet: `podcast-rss/cover-art/all-covers-contact-sheet.jpg`.

To regenerate or restyle the whole set:
`python3 cover-art/make_all_covers.py` (title line splits and subtitles live in
`LAYOUT` inside that file). Text is shaped with HarfBuzz — ImageMagick's own
renderer breaks Nastaliq, see `cover-art/fonts/README.md`.

---

## 3. Wizard step 2 — show details

| Field | Value |
| --- | --- |
| Primary category | Religion & Spirituality |
| Sub-category | Christianity |
| Language | Urdu (اردو) |
| Country / region | Pakistan |
| Author / owner name | Saul's Podship |
| Owner e‑mail | saulspodship@gmail.com |
| Explicit content | No |
| Podcast type | Episodic (not serial) |
| Website | https://www.saulspodship.com/podcast |

Notes:
- The Free plan is enough: unlimited episodes, unlimited audio, one podcast.
  It may ask for a card to verify the account — the Free plan is not charged.
- Set **Episodic** so listeners see newest‑first instead of Season 1, Episode 1.
- Add the website link in *Podcast settings → Links*; add the codex and the
  encyclopedia as two extra links if you want discovery traffic.

---

## 4. Episode order + copy‑paste notes

Suggested order (teach first, then the hot‑button ethics episodes, end with the
question everyone asks in Pakistan). Reorder freely — RSS.com numbers episodes by
publishing order, so upload in the order you want them numbered (or set the
episode number manually in the episode editor).

| # | Episode title (Urdu) | Source file |
|---|---|---|
| 1 | کیا سب کچھ پہلے سے لکھا ہے؟ — تقدیر اور آزاد مرضی | کیا_سب_کچھ_پہلے_سے_لکھا_ہے.m4a |
| 2 | آزمائش میں الٰہی وعدوں کی حقیقت | آزمائش_میں_الہی_وعدوں_کی_حقیقت.m4a |
| 3 | خوشحالی کی انجیل کا فریب | Khushhali_ki_injeel_ka_fareb.m4a |
| 4 | یسوع کے دو مختلف شجرۂ نسب | یسوع_کے_دو_مختلف_شجرہ_نسب.m4a |
| 5 | سیکرٹ ریپچر: 1830 کا خواب یا حقیقت؟ | سیکرٹ_رپچر_1830_کا_خواب_یا_حقیقت.m4a |
| 6 | بائبل اور غلامی کی اصل حقیقت | بائبل_اور_غلامی_کی_اصل_حقیقت.m4a |
| 7 | بائبل کی جنگیں اور الٰہی انصاف | بائبل_کی_جنگیں_اور_الٰہی_انصاف.m4a |
| 8 | آنکھ کے بدلے آنکھ اور سزائے موت | آنکھ_کے_بدلے_آنکھ_اور_سزائے_موت.m4a |
| 9 | مسیحیت میں طلاق اور جذباتی شفا | مسیحیت_میں_طلاق_اور_جذباتی_شفا.m4a |
| 10 | کلیسیا میں خواتین کی قیادت اور بائبل | کلیسیا_میں_خواتین_کی_قیادت_اور_بائبل.m4a |
| 11 | ہم جنس پرستی اور قدیم مذہبی بحث | ہم_جنس_پرستی_اور_قدیم_مذہبی_بحث.m4a |

Same metadata lives in `podcast-rss/episodes.json` if you ever want to script it.

Episode fields in RSS.com: **title ≤ 250 chars**, **notes ≤ 4000 chars**,
keywords up to 10 (keywords are RSS.com‑only, they are not sent to Apple/Spotify,
so keep the important words in the title and notes).

---

### Episode 1 — کیا سب کچھ پہلے سے لکھا ہے؟ — تقدیر اور آزاد مرضی

**Episode art:** `podcast-rss/cover-art/ep01-cover-3000x3000.jpg`

Note the difference: the **show cover** is the wine "SAUL'S PODSHIP" card and is
what every episode inherits; **episode art** only replaces the square thumbnail
inside an individual episode row. Uploading no episode art is fine — the show
cover is used instead. If you do use it, upload it in the *New episode* →
*Episode art* box, never as the podcast cover.

**Title**

```
کیا سب کچھ پہلے سے لکھا ہے؟ — تقدیر اور آزاد مرضی
```

**Notes**

```
اگر خدا نے سب کچھ پہلے سے مقرر کر دیا ہے، تو میری مرضی کا کیا مطلب؟ اور اگر سب کچھ طے شدہ ہے تو دعا، توبہ اور تبلیغ کا کیا فائدہ؟ یہ سوال ہر مسلمان گھر میں پیدا ہونے والے مسیحی سے پہلی بار پوچھا جاتا ہے — اور اکثر جواب میں صرف "خدا جانتا ہے" کہہ کر بات ختم کر دی جاتی ہے۔

اِس قسط میں ہم تقدیر بمقابلہ آزاد مرضی کا سوال تین سطحوں پر کھولتے ہیں: بائبل کیا کہتی ہے، کلاسیکی مسیحی موقف (کلونزم اور آرمینینزم) کیسے پیدا ہوئے، اور اسلامی نظریۂ تقدیر سے اِس کا فرق کیا ہے۔ ساتھ ہی وہ آیات جن پر دونوں طرف کے لوگ بحث کرتے ہیں — رومیوں ۹، افسیوں ۱، یوحنا ۳:۱۶، ۲-پطرس ۳:۹ — اور یہ کہ انسان کی ذمہ داری کہیں ختم نہیں ہوتی۔

اِس قسط میں:
• کیا ہم خدا کو چنتے ہیں یا خدا ہمیں چنتا ہے؟
• کیا نجات کھوئی جا سکتی ہے؟
• تقدیر اور انسانی ذمہ داری کیسے ساتھ چل سکتے ہیں؟
• اگر خدا سب کچھ جانتا ہے تو ہماری مرضی واقعی آزاد ہے؟
• مسلم ماحول میں تقدیر پر گفتگو کیسے کریں؟
• اگر سب کچھ مقرر ہے تو تبلیغ کیوں کریں؟

کلیدی صحیفے: رومیوں ۸:۲۸-۳۰، رومیوں ۹:۱۴-۲۴، افسیوں ۱:۳-۱۴، اعمال ۲:۲۳، یوحنا ۳:۱۶، ۲-پطرس ۳:۹، استثنا ۳۰:۱۹، یشوع ۲۴:۱۵

English: Is everything already written? Predestination vs. free will — the biblical texts, the classical Christian positions, and how to talk about qadr with Muslim friends.
```

**Keywords:** تقدیر, آزاد مرضی, predestination, free will, qadr, رومیوں ۹, election

---

### Episode 2 — آزمائش میں الٰہی وعدوں کی حقیقت

**Title**

```
آزمائش میں الٰہی وعدوں کی حقیقت
```

**Notes**

```
"خدا وفادار ہے، وہ تمہیں آزمائش سے نکالے گا" — یہ جملہ ہم مشکل میں سنتے ہیں، لیکن جب آزمائش ختم ہی نہ ہو تو؟ جب دعا کے باوجود بیماری، غربت یا ظلم برقرار رہے تو خدا کے وعدوں کا کیا مطلب ہے؟

اِس قسط میں ہم بائبل کے وعدوں کو جذباتی نعروں سے الگ کر کے دیکھتے ہیں: وہ آیات جو تسلی دیتی ہیں، اور وہ حقیقت کہ مسیحی بھی آزمائش میں رہتے ہیں۔ یعقوب ۱، رومیوں ۵، ۱-پطرس ۱، ۲-کرنتھیوں ۱۲ اور عبرانیوں ۱۲ کے ذریعے ہم سیکھتے ہیں کہ آزمائش میں خدا کیا وعدہ کرتا ہے — آزمائش ہٹانے کا نہیں، اُس میں ساتھ چلنے اور اُسے بدلنے کا۔

اِس قسط میں:
• مشکل وقت میں خدا کے وعدے کیا ہیں؟
• فکرمندی اور خوف میں کون سی آیات مدد کرتی ہیں؟
• کمزوری میں طاقت کی آیات کیا ہیں؟
• ایک دوسرے کو حوصلہ دینے کے لیے کیا آیات ہیں؟
• خدا کی وفاداری کی یاد دہانی دینے والی آیات؟
• تسلی بخش زبور کون سے ہیں؟
• روزانہ عبادت کے لیے کون سی آیات مددگار ہیں؟

کلیدی صحیفے: یعقوب ۱:۲-۴، ۱۲؛ رومیوں ۵:۳-۵؛ ۱-پطرس ۱:۶-۷؛ ۲-کرنتھیوں ۱۲:۷-۱۰؛ زبور ۳۴:۱۹؛ عبرانیوں ۱۲:۵-۱۱؛ ایوب ۲۳:۱۰

English: What God actually promises in suffering — the difference between comfort-verse clichés and the biblical theology of trial.
```

**Keywords:** آزمائش, مصیبت, divine promises, suffering, یعقوب ۱, comfort, faith under trial

---

### Episode 3 — خوشحالی کی انجیل کا فریب

**Title**

```
خوشحالی کی انجیل کا فریب
```

**Notes**

```
"ایمان لاؤ، کاروبار چل جائے گا، بیماری دور ہو جائے گی، گاڑی آ جائے گی۔" یہ وعدہ پاکستان کے ٹی وی چینلز، یوٹیوب اور واٹس ایپ پیغامات میں ہر جگہ موجود ہے۔ مگر یہ خوشخبری ہے یا ایک نیا فریب؟

اِس قسط میں ہم خوشحالی کی انجیل (prosperity gospel) کی جڑیں، اُس کے سب سے مشہور دعوے، اور اُن کے جواب میں بائبل کی گواہی دیکھتے ہیں: پولس کی قناعت، مسیح کی مصلوب زندگی، اور یہ حقیقت کہ ایمان کا وعدہ آسانی نہیں بلکہ وفاداری ہے۔ ساتھ ہی ہم اِس سوال کو بھی چھوتے ہیں کہ غربت میں مبتلا ایماندار کو کلیسیا کیا کہہ سکتی ہے — اور کیا نہیں کہنا چاہیے۔

اِس قسط میں:
• کیا ایمان مال و دولت لاتا ہے؟
• کیا غربت ایمان کی کمی کی علامت ہے؟
• قناعت اور خوشحالی میں فرق کیا ہے؟
• مالی مشکلات میں بائبل کیا کہتی ہے؟
• جھوٹی تعلیمات سے کیسے بچیں؟
• سخاوت اور لالچ میں فرق کیا ہے؟
• دکھ اور تکلیف کا خدا کے منصوبے میں کیا کردار ہے؟

کلیدی صحیفے: ۲-کرنتھیوں ۸:۹؛ فلپیوں ۴:۱۱-۱۳؛ ۱-تیمتھیس ۶:۶-۱۰؛ عبرانیوں ۱۳:۵؛ یوحنا ۱۶:۳۳؛ لوقا ۹:۲۳؛ متی ۶:۱۹-۲۱

English: The deception of the prosperity gospel — what Scripture promises, what it never promised, and how the church should speak to believers living in poverty.
```

**Keywords:** خوشحالی کی انجیل, prosperity gospel, قناعت, wealth, faith teaching, poverty

---

### Episode 4 — یسوع کے دو مختلف شجرۂ نسب

**Title**

```
یسوع کے دو مختلف شجرۂ نسب
```

**Notes**

```
متی ۱ اور لوقا ۳ میں یسوع کا شجرۂ نسب ہے — لیکن دونوں ایک دوسرے سے مختلف ہیں۔ یہ سب سے پرانا اور سب سے زیادہ پوچھا جانے والا اعتراض ہے: کیا بائبل میں تضاد ہے؟

اِس قسط میں ہم دونوں فہرستوں کو ایک ساتھ رکھ کر پڑھتے ہیں: متی کا یہودی/بادشاہانہ ڈھانچہ اور لوقا کا آدم تک جانے والا راستہ، داؤد کے دو بیٹوں (سلیمان اور ناتھن) سے آنے والی دو لکیریں، یہودی قانونِ نکاح (levirate marriage) اور گود لینے کا رواج، اور لوقا کے اُس جملے کا مطلب جہاں وہ یوسف کو "خیا ل کیا جاتا تھا باپ" کہتا ہے۔ ہم یہ بھی بتاتے ہیں کہ کون سی تشریحات سب سے زیادہ مضبوط ہیں اور کہاں ایمانداروں کو ایمانداری سے "ہم قطعی نہیں جانتے" کہنا چاہیے۔

اِس قسط میں:
• متی اور لوقا کے نسب میں فرق کیوں ہے؟
• کیا یہ تضاد ہے یا دو مختلف زاویے؟
• یوسف کے ذریعے نسب کیوں اہم ہے اگر یسوع یوسف کے بیٹے نہیں؟
• کن کن تاریخی رواجوں سے یہ فرق سمجھا جا سکتا ہے؟
• اِس اعتراض کا جواب غیر مسیحی دوست کو کیسے دیں؟

کلیدی صحیفے: متی ۱:۱-۱۷؛ لوقا ۳:۲۳-۳۸؛ ۱-تواریخ ۳؛ ۲-سموئیل ۷؛ استثنا ۲۵:۵-۶؛ روت ۴

English: The two genealogies of Jesus (Matthew 1 and Luke 3) — the differences, the explanations, and how to answer the oldest objection honestly.
```

**Keywords:** شجرہ نسب, genealogies, Matthew 1, Luke 3, contradiction, داؤد, virgin birth

---

### Episode 5 — سیکرٹ ریپچر: 1830 کا خواب یا حقیقت؟

**Title**

```
سیکرٹ ریپچر: 1830 کا خواب یا حقیقت؟
```

**Notes**

```
"خفیہ ریپچر" — یعنی مسیح اپنے کلیسیا کو خاموشی سے اُٹھا لے جائے گا اور بعد میں دکھ کی بڑی مصیبت آئے گی — یہ نظریہ آج بہت سے گھرانوں میں بنیادی عقیدہ سمجھا جاتا ہے۔ مگر یہ تعلیم کہاں سے آئی؟

اِس قسط میں ہم تاریخ کھولتے ہیں: ۱۸۳۰ کے لگ بھگ جان نیلسن ڈاربی اور پلے ماؤتھ برادرن، مارگریٹ میکڈونلڈ کے تجربات، بعد میں سکوفیلڈ بائبل (۱۹۰۹) کے ذریعے امریکہ میں پھیلاؤ — اور ساتھ ہی ۱-تھسلنیکیوں ۴، متی ۲۴، ۲-تھسلنیکیوں ۲ اور مکاشفہ ۲۰ کے متن کو پڑھتے ہیں۔ ہم مختلف موقف (pre-trib, mid-trib, post-trib, amillennial) کو غیر جانبدارانہ انداز میں بیان کرتے ہیں اور یہ بتاتے ہیں کہ اِس حوالے سے ایمانداروں میں اختلاف کیوں ہے — اور کیا چیز اِس اختلاف سے بالاتر ہے۔

اِس قسط میں:
• ریپچر کا لفظ بائبل میں کہاں ہے؟
• 1830 سے پہلے یہ نظریہ کیوں نہیں ملتا؟
• ۱-تھسلنیکیوں ۴ کا صحیح مطلب کیا ہے؟
• کیا کلیسیا دکھ کی بڑی مصیبت سے بچ جائے گی؟
• اِس عقیدے پر اختلاف ایمان کو کیسے متاثر کرتا ہے؟

کلیدی صحیفے: ۱-تھسلنیکیوں ۴:۱۳-۱۸؛ متی ۲۴:۲۹-۳۱؛ ۲-تھسلنیکیوں ۲:۱-۴؛ مکاشفہ ۲۰؛ دانیال ۱۲

English: The secret rapture — where the doctrine came from (Darby, 1830, Scofield), what the texts actually say, and how to hold the debate without splitting the church.
```

**Keywords:** ریپچر, rapture, Darby, dispensationalism, ۱ تھسلنیکیوں ۴, end times, مکاشفہ

---

### Episode 6 — بائبل اور غلامی کی اصل حقیقت

**Title**

```
بائبل اور غلامی کی اصل حقیقت
```

**Notes**

```
"اگر بائبل خدا کا کلام ہے تو اُس میں غلامی کی اجازت کیوں ہے؟" یہ اعتراض آج سب سے طاقتور اعتراضات میں سے ہے — اور اکثر مسیحی اِس کا جواب نہیں جانتے۔

اِس قسط میں ہم ایمانداری سے کام لیتے ہیں۔ پہلے قدیم مشرق وسطیٰ اور رومی غلامی کا سیاق و سباق — جو قرض، جنگ اور پیدائش پر مبنی تھی اور جس میں غلام انسانیت سے محروم سامان سمجھے جاتے تھے۔ پھر بائبل کے متن: خروج ۲۱، احبار ۲۵، استثنا ۱۵ اور ۲۳، فلیمون، افسیوں ۶۔ ہم دیکھتے ہیں کہ بائبل غلامی کے نظام کو اُس وقت کی دنیا میں محدود کرتی ہے، غلاموں کے ساتھ انصاف، آرام اور آزادی کی راہیں کھولتی ہے، انسان کو فروخت کرنے کو سخت گناہ کہتی ہے، اور فلیمون جیسے خط میں ایک غلام کو "بھائی" بنا دیتی ہے۔ پھر ہم وہ تاریخی کردار بھی بتاتے ہیں جو اِن ہی متنوں کی بنیاد پر غلامی کے خاتمے کی تحریک لے کر اُٹھے۔

اِس قسط میں:
• بائبل غلامی کی مذمت کیوں نہیں کرتی؟
• خدا نے پرانے عہد میں غلامی کی اجازت کیوں دی؟
• آج کے انسانی حقوق کے تناظر میں اُن آیات کی وضاحت کیسے کریں؟
• بائبل کی غلامی اور جدید غلامی میں کیا فرق ہے؟
• پولس رسول نے غلامی کو کیسے دیکھا؟
• کیا مسیحیت غلامی کو جائز دیتی ہے یا ختم کرتی ہے؟
• غلامی سے متعلق بائبل کی آیات سے ہم کیا سیکھ سکتے ہیں؟
• عیسائیت نے غلامی کے خاتمے میں کیا کردار ادا کیا؟
• کلیسیا غلامی پر ایمانداری سے گفتگو کیسے کرے؟
• آج کے دور میں آزادی کی خوشخبری کیا معنی رکھتی ہے؟

کلیدی صحیفے: خروج ۲۱:۱-۱۱، ۱۶؛ احبار ۲۵:۳۹-۴۳؛ استثنا ۱۵:۱۲-۱۵؛ استثنا ۲۳:۱۵-۱۶؛ فلیمون؛ افسیوں ۶:۵-۹؛ ۱-تیمتھیس ۱:۱۰

English: The Bible and slavery — the ancient context, the texts themselves, the difference between regulating an institution and endorsing it, and the abolitionists who read the same texts.
```

**Keywords:** غلامی, slavery, خروج ۲۱, فلیمون, abolition, Old Testament ethics, انسانی حقوق

---

### Episode 7 — بائبل کی جنگیں اور الٰہی انصاف

**Title**

```
بائبل کی جنگیں اور الٰہی انصاف
```

**Notes**

```
کنعان کی فتح، "ہر جاندار کو قتل کر دو" کے احکام، اور عمالیقیوں کا ذکر — عہدِ عتیق کے یہ حصے آج کے قاری کو چونکا دیتے ہیں۔ کیا یہ خدا ہے؟

اِس قسط میں ہم سب سے مشکل متن کو چھپاتے نہیں۔ ہم پہلے اُس دور کی جنگ کی حقیقت بیان کرتے ہیں (قدیم مشرق وسطیٰ میں جنگ کے قوانین کتنے وحشی تھے)، پھر متن کے مختلف اندازِ تفسیر دیکھتے ہیں، اور ساتھ ہی وہ آیات بھی پڑھتے ہیں جو خدا کے کردار کو ظاہر کرتی ہیں — یرمیاہ ۱۸، حزقی ایل ۱۸ اور ۳۳، یوناہ ۴، پیدائش ۱۵ اور ۱۸۔ ہم یہ بھی بتاتے ہیں کہ "تشدد" اور "انصاف" کے درمیان فرق کیسے کیا جائے، اور یسوع کے پہاڑی وعظ میں اِس بحث کا انجام کہاں آتا ہے۔

اِس قسط میں:
• خدا نے پوری قوموں کے قتل کا حکم کیوں دیا؟
• محبت کرنے والا خدا جنگ کا حکم کیسے دے سکتا ہے؟
• کیا یہ پرتشدد کہانیاں جائز ہیں؟
• غیر مسیحیوں کو یہ واقعات کیسے سمجھائیں؟
• کیا یسوع نے پرانے عہد کے خدا کو مسترد کیا؟
• خدا کا عدل اور رحمت ساتھ کیسے چلتے ہیں؟
• کیا یہ واقعات حکم دینے والے ہیں یا صرف بیانیہ؟
• کیا آج کے دور میں ہم اِن سے سیکھ سکتے ہیں؟
• خدا نے قوموں پر عدالت کیوں نازل کی؟
• کیا یہ واقعات مذہبی تشدد کو جواز دیتے ہیں؟

کلیدی صحیفے: استثنا ۲۰؛ یشوع ۶-۱۱؛ پیدائش ۱۵:۱۳-۱۶؛ ۱-سموئیل ۱۵؛ یرمیاہ ۱۸:۷-۱۰؛ حزقی ایل ۱۸:۲۳؛ ۳۳:۱۱؛ یوناہ ۴:۱۱؛ متی ۵:۴۳-۴۸

English: The wars of the Bible and divine justice — the hardest Old Testament texts read out loud, the main interpretive options, and the passages where God's mercy speaks for itself.
```

**Keywords:** جنگ, herem, عہد عتیق تشدد, Old Testament violence, کنعان, divine justice, یشوع

---

### Episode 8 — آنکھ کے بدلے آنکھ اور سزائے موت

**Title**

```
آنکھ کے بدلے آنکھ اور سزائے موت
```

**Notes**

```
"آنکھ کے بدلے آنکھ، دانت کے بدلے دانت" — یہ جملہ بائبل کے پرتشدد ہونے کی سب سے مشہور مثال سمجھا جاتا ہے۔ مگر اصل میں یہ قانون جوش و غضب کی اجازت نہیں دیتا، بلکہ اُسے روکتا ہے۔

اِس قسط میں ہم قصاص (lex talionis) کے اصل مقصد کو کھولتے ہیں: بدلہ لینے پر حد، عدالت میں تناسب، اور غریب و امیر کے لیے یکساں قانون۔ پھر سزائے موت کے سوال پر — پیدائش ۹:۶، رومیوں ۱۳، اور یسوع کا متی ۵ میں اُس سے آگے بڑھ جانا۔ آخر میں عہدِ عتیق کی عدالتوں کے طریقۂ کار (گواہوں کی شرائط، پناہ کے شہر) اور یہ کہ کس طرح رحمت انصاف کو کالعدم نہیں کرتی۔

اِس قسط میں:
• قصاص کا اصل مقصد کیا تھا؟
• کیا یہ انتقام کی اجازت ہے؟
• یسوع نے "آنکھ کے بدلے آنکھ" کو کیسے بدلا؟
• سزائے موت پر بائبل کا موقف کیا ہے؟
• کیا آج مسیحی سزائے موت کی حمایت کر سکتے ہیں؟
• انصاف اور معافی میں توازن کیسے رکھیں؟

کلیدی صحیفے: خروج ۲۱:۲۳-۲۵؛ احبار ۲۴:۱۹-۲۲؛ استثنا ۱۹:۱۵-۲۱؛ پیدائش ۹:۶؛ رومیوں ۱۳:۱-۴؛ متی ۵:۳۸-۴۲؛ متی ۷:۱-۵

English: "An eye for an eye" and the death penalty — what the law of retaliation actually limited, and how Jesus' teaching on mercy relates to public justice.
```

**Keywords:** آنکھ کے بدلے آنکھ, lex talionis, سزائے موت, death penalty, انصاف, Matthew 5

---

### Episode 9 — مسیحیت میں طلاق اور جذباتی شفا

**Title**

```
مسیحیت میں طلاق اور جذباتی شفا
```

**Notes**

```
طلاق کلیسیا میں وہ موضوع ہے جس پر سب سے زیادہ خاموشی ہے اور سب سے زیادہ زخم ہیں۔ بہت سے ایماندار گھر ٹوٹنے کے بعد خود کو کلیسیا سے باہر پاتے ہیں — اور اُن کا زخم مزید گہرا ہو جاتا ہے۔

اِس قسط میں ہم بائبل کے متن کو ایمانداری سے دیکھتے ہیں: استثنا ۲۴، ملاکی ۲، متی ۱۹، ۱-کرنتھیوں ۷ — اور اُن کے ساتھ وہ سیاق و سباق جس میں یسوع نے بات کی (اُس دور میں عورتوں کی حالت، یک طرفہ طلاق کا رواج)۔ پھر ہم عملی پہلوؤں پر آتے ہیں: علیحدگی، دوبارہ شادی، بچوں کی پرورش، اور کلیسیا کا کردار۔ آخر میں جذباتی شفا — زبور ۳۴:۱۸، ۱۴۷:۳ — اور یہ کہ زخموں کے ساتھ خدا کے پاس آنا ایمان کی کمی نہیں۔

اِس قسط میں:
• بائبل طلاق کے بارے میں کیا کہتی ہے؟
• کیا طلاق کبھی جائز ہے؟
• یسوع نے طلاق کو سخت کیوں کیا؟
• طلاق کے بعد دوبارہ شادی پر کیا موقف ہے؟
• کلیسیا طلاق یافتہ افراد کی مدد کیسے کرے؟
• بچوں پر طلاق کے اثرات کا کیا حل ہے؟
• جذباتی زخموں کی شفا کیسے ممکن ہے؟
• کیا خدا ٹوٹے ہوئے گھر کو بحال کر سکتا ہے؟
• شرم اور قصور واری کے جذبات کا علاج کیا ہے؟
• ایک صحت مند مسیحی شادی کی بنیاد کیا ہے؟

کلیدی صحیفے: استثنا ۲۴:۱-۴؛ ملاکی ۲:۱۴-۱۶؛ متی ۱۹:۳-۹؛ ۱-کرنتھیوں ۷:۱۰-۱۶؛ افسیوں ۵:۲۵-۳۳؛ زبور ۳۴:۱۸؛ زبور ۱۴۷:۳

English: Divorce in Christianity and emotional healing — the texts, the culture behind them, the pastoral questions, and what the church owes people who are already wounded.
```

**Keywords:** طلاق, divorce, دوبارہ شادی, emotional healing, Matthew 19, کلیسیا, شفا

---

### Episode 10 — کلیسیا میں خواتین کی قیادت اور بائبل

**Title**

```
کلیسیا میں خواتین کی قیادت اور بائبل
```

**Notes**

```
کیا عورتیں کلیسیا میں پادری یا بزرگ بن سکتی ہیں؟ کیا بائبل عورتوں کو مردوں کو تعلیم دینے کی اجازت دیتی ہے؟ پاکستانی معاشرے میں یہ سوال کلیسیا کے اندر بھی ہے اور باہر بھی۔

اِس قسط میں ہم پہلے وہ حصے پڑھتے ہیں جو اکثر نظر انداز کیے جاتے ہیں: دبورہ (قضاة ۴-۵)، حُلدہ نبیہ، یسوع کی خاتون شاگردوں کا پہلا گواہ ہونا، پرسکلہ اور اکولہ کی تعلیمی خدمت، فیلپس کی بیٹیاں، فیبی اور یونیہ (رومیوں ۱۶)، اور پنتکست کی نبوت (اعمال ۲)۔ پھر ہم وہ متن بھی پڑھتے ہیں جن پر اختلاف ہے: ۱-کرنتھیوں ۱۱ و ۱۴، ۱-تیمتھیس ۲ — اور اُن کی مختلف تفسیریں (complementarian اور egalitarian)۔ ہم کسی ایک طرف کو جیتنے کی کوشش نہیں کرتے، مگر یہ واضح کرتے ہیں کہ عورت کی عزت اور خدمت کہیں بھی کم نہیں۔

اِس قسط میں:
• کیا عورتیں کلیسیا میں پادری یا بزرگ بن سکتی ہیں؟
• کیا بائبل عورتوں کو مردوں کو تعلیم دینے کی اجازت دیتی ہے؟
• پاکستانی معاشرے میں خواتین کلیسیا کی خدمت میں کیسے رہنمائی کر سکتی ہیں؟
• کلیسیائی کرداروں میں مرد و زن کی تفریق بائبلی ہے یا ثقافتی؟
• یسوع مسیح نے خواتین کے ساتھ کیا سلوک روا رکھا؟
• کیا آج بھی خواتین کو سر ڈھانپنا چاہیے؟
• کیا خواتین عبادت میں قیادت یا نبوت کر سکتی ہیں؟
• خواتین کو کلیسیا میں بااختیار بنانا کیسے ممکن ہے؟
• چرچ پلانٹنگ اور انجیل رسائی میں خواتین کا کیا کردار ہے؟
• کلیسیاؤں میں خواتین کے ساتھ امتیازی سلوک ہو رہا ہے؟

کلیدی صحیفے: پیدائش ۱:۲۷؛ قضاة ۴-۵؛ ۲-سلاطین ۲۲؛ لوقا ۸:۱-۳؛ لوقا ۲۴:۹-۱۱؛ اعمال ۲:۱۷-۱۸؛ اعمال ۱۸:۲۶؛ اعمال ۲۱:۹؛ رومیوں ۱۶:۱-۷؛ ۱-کرنتھیوں ۱۱:۵؛ ۱۱:۱۱-۱۲؛ ۱۴:۳۴-۳۵؛ ۱-تیمتھیس ۲:۱۱-۱۵؛ گلتیوں ۳:۲۸؛ ۱-پطرس ۴:۱۰-۱۱

English: Women's leadership in the church and the Bible — the overlooked texts, the debated ones, both main readings, and how the conversation can be honest instead of a war.
```

**Keywords:** خواتین, women in ministry, کلیسیا, ۱ تیمتھیس ۲, egalitarian, complementarian, leadership

---

### Episode 11 — ہم جنس پرستی اور قدیم مذہبی بحث

**Title**

```
ہم جنس پرستی اور قدیم مذہبی بحث
```

**Notes**

```
یہ وہ موضوع ہے جس پر بات کرتے ہوئے اکثر زخم لگتے ہیں۔ اِس قسط میں ہم بحث کو شور سے نکال کر تاریخ اور متن کی طرف لے جاتے ہیں — اور ایمانداری سے دونوں اطراف کے دلائل بیان کرتے ہیں۔

پہلے قدیم دنیا کا سیاق و سباق: احبار ۱۸ و ۲۰، رومیوں ۱، ۱-کرنتھیوں ۶، پیدائش ۱۹ — اور یہ کہ "قدیم مذاہب" (یہودیت، اسلام، عیسائیت) نے اِس موضوع پر روایتی طور پر کیا موقف رکھا۔ پھر آج کے دور کے سوالات: کیا یہ ایک شناخت ہے یا عمل؟ کیا کوئی ہم جنس پرست شخص مسیحی ہو سکتا ہے؟ کلیسیا اُن لوگوں کے ساتھ کیسے پیش آئے جنہیں اکثر ٹھکرا دیا گیا؟ ہم محبت، پاکیزگی، سچائی اور رحمت کے درمیان توازن پر بات کرتے ہیں — بغیر کسی پر پتھر پھینکنے کے۔

اِس قسط میں:
• بائبل ہم جنس پرستی کے بارے میں کیا کہتی ہے؟
• کیا کوئی ہم جنس پرست شخص مسیحی ہو سکتا ہے؟
• ہم جنس پرست افراد سے مسیحی محبت اور سچائی کیسے ظاہر کریں؟
• کیا ہم جنس کشش گناہ ہے یا اُس پر عمل کرنا گناہ ہے؟
• سچ اور فضل کے درمیان توازن کیسے رکھیں؟
• پاکستانی نوجوان اِس کشش سے کیسے نمٹیں؟
• کلیسیا کس طرح مدد فراہم کر سکتی ہے؟
• "پیدائشی طور پر ایسے" ہونے کے دعوے کا جواب کیا ہے؟
• مغربی میڈیا کی حمایت پر مسیحیوں کا ردعمل کیا ہونا چاہیے؟
• کشش اور شناخت میں فرق ہے؟

کلیدی صحیفے: احبار ۱۸:۲۲؛ احبار ۲۰:۱۳؛ پیدائش ۱۹؛ رومیوں ۱:۲۶-۲۷؛ ۱-کرنتھیوں ۶:۹-۱۱؛ ۱-تیمتھیس ۱:۱۰؛ متی ۱۹:۴-۶؛ یوحنا ۸:۱-۱۱؛ ۱-یوحنا ۱:۹

English: Homosexuality and the ancient religious debate — the historical and textual background, the honest questions, and how the church can hold truth and grace without wounding people further.
```

**Keywords:** ہم جنس پرستی, homosexuality, رومیوں ۱, grace and truth, pastoral care, کلیسیا

---

## 5. Click order (so you do not get lost in the wizard)

1. Open <https://dashboard.rss.com/new-podcast/>.
2. Paste **Title**, **Description**, set the **feed URL**, upload the
   **3000×3000 cover**, click **Next**.
3. Step 2: category, language Urdu, country Pakistan, owner name + e-mail,
   explicit **No**, **Episodic**. Save.
4. Dashboard → **New episode** → upload file #1 → paste title → paste notes →
   (optional) episode art → **Publish**. Repeat for #2–#11 in the order above.
   - You can upload all 11 as **drafts** and then schedule/publish in order
     (RSS.com → episode → *Schedule*), which keeps the numbering clean.
5. After at least 1 episode is live: **Distribution** → submit to Apple
   Podcasts, Spotify, Amazon Music, YouTube Music (RSS.com pushes them all).
6. Copy the final RSS feed URL (e.g. `https://media.rss.com/…/feed.xml`) and
   give it to me — I will wire it into `src/pages/PodcastPage.tsx` so the
   website's Podcast page lists these Urdu episodes with a live player.

---

## 6. Reality check on "post it yourself"

I can read the Drive folder and prepare every field, file and note (that is what
this kit is), but I cannot sign into RSS.com on your behalf: there is no RSS.com
connection in this workspace, and publishing requires your logged-in account
(plus a card on the Free plan). Anyone who tells you they posted it without your
credentials is guessing. So: either you paste the blocks above (about 10–15
minutes for all 11 episodes), or you give me an authenticated way in and I will
drive the wizard.

Before you publish, three things worth 60 seconds each:

- Play **ہم_جنس_پرستی_اور_قدیم_مذہبی_بحث.m4a** — 3.2 MB looks cut short.
- Skim each Urdu note once; correct anything your recording says differently.
  Notes are copy-paste-ready, not inerrant.
- Confirm the recorded position on ep. 9–11 (divorce, women's leadership,
  homosexuality) matches what the notes say — those notes deliberately present
  both main readings rather than picking a side.
