/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Live podcast data — mirrors https://rss.com/podcasts/sauls-podship
 * (feed: https://media.rss.com/sauls-podship/feed.xml).
 *
 * The 11 episodes below are the ones actually published on RSS.com; `episodeId`
 * is RSS.com's numeric episode id, which is all the official embed player needs:
 *   https://player.rss.com/<showSlug>/<episodeId>/
 *
 * Audio is never re-hosted here — the player iframe streams from RSS.com, so
 * download counts, ads-free hosting and future re-uploads stay in one place.
 * If an episode is re-recorded on RSS.com, only `duration` needs touching.
 */

export interface PodcastEpisode {
  id: string;
  number: number;
  slug: string;
  /** Urdu title exactly as published on RSS.com */
  title: string;
  /** Romanised Urdu, for readers without Nastaliq fonts */
  titleRoman: string;
  /** English working title (cards, search, social) */
  titleEnglish: string;
  /** Short English summary for cards and meta descriptions */
  description: string;
  /** Full Urdu show notes from the published episode */
  notesUrdu: string;
  /** mm:ss as reported by RSS.com */
  duration: string;
  publishDate: string;
  topics: string[];
  scriptureReferences: string[];
  /** RSS.com numeric episode id */
  episodeId: number;
  /** Public episode page on RSS.com */
  rssUrl: string;
  /** Official RSS.com embed player (iframe src) */
  playerUrl: string;
  /** Local, optimised 800x800 cover art */
  coverArt: string;
}

export const PODCAST = {
  title: "Saul's Podship — Urdu Bible Apologetics",
  titleUrdu: 'ساؤلز پوڈشپ',
  tagline: 'ایک سوال، ایک قسط — بائبل کی روشنی میں',
  description:
    "Saul's Podship is an Urdu-language Christian apologetics podcast. Each episode takes one hard question — slavery in the Bible, violence in the Old Testament, women's leadership, divorce, predestination, the secret rapture, the two genealogies of Jesus — and answers it from Scripture, in conversation with the objections raised by Islam, Judaism, Hinduism and Sikhism.",
  showSlug: 'sauls-podship',
  showUrl: 'https://rss.com/podcasts/sauls-podship/',
  feedUrl: 'https://media.rss.com/sauls-podship/feed.xml',
  playerUrl: 'https://player.rss.com/sauls-podship/',
  coverArt: '/images/podcast/show-cover.jpg',
  language: 'ur',
  languageLabel: 'اردو / Urdu',
  publisher: "Saul's Podship Scriptorium",
  category: 'Religion & Spirituality › Christianity',
} as const;

export const EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-01',
    number: 1,
    slug: "kya-sab-kuch-pehle-se-likha-hai",
    title: "کیا سب کچھ پہلے سے لکھا ہے؟ — تقدیر اور آزاد مرضی",
    titleRoman: "Kya sab kuch pehle se likha hai? — Taqdeer aur azaad marzi",
    titleEnglish: "Is Everything Already Written? Predestination vs Free Will",
    description:
      "If God fixed everything in advance, what is left of human freedom — and why pray at all? The biblical texts (Romans 9, Ephesians 1, John 3:16, 2 Peter 3:9), the classical Calvinist and Arminian positions, and how to talk about qadr with Muslim friends.",
    notesUrdu:
      "اگر خدا نے سب کچھ پہلے سے مقرر کر دیا ہے، تو میری مرضی کا کیا مطلب؟ اور اگر سب کچھ طے شدہ ہے تو دعا، توبہ اور تبلیغ کا کیا فائدہ؟ یہ سوال ہر مسلمان گھر میں پیدا ہونے والے مسیحی سے پہلی بار پوچھا جاتا ہے — اور اکثر جواب میں صرف \"خدا جانتا ہے\" کہہ کر بات ختم کر دی جاتی ہے۔\n\nاِس قسط میں ہم تقدیر بمقابلہ آزاد مرضی کا سوال تین سطحوں پر کھولتے ہیں: بائبل کیا کہتی ہے، کلاسیکی مسیحی موقف (کلونزم اور آرمینینزم) کیسے پیدا ہوئے، اور اسلامی نظریۂ تقدیر سے اِس کا فرق کیا ہے۔ ساتھ ہی وہ آیات جن پر دونوں طرف کے لوگ بحث کرتے ہیں — رومیوں ۹، افسیوں ۱، یوحنا ۳:۱۶، ۲-پطرس ۳:۹ — اور یہ کہ انسان کی ذمہ داری کہیں ختم نہیں ہوتی۔\n\nاِس قسط میں:\n• کیا ہم خدا کو چنتے ہیں یا خدا ہمیں چنتا ہے؟\n• کیا نجات کھوئی جا سکتی ہے؟\n• تقدیر اور انسانی ذمہ داری کیسے ساتھ چل سکتے ہیں؟\n• اگر خدا سب کچھ جانتا ہے تو ہماری مرضی واقعی آزاد ہے؟\n• مسلم ماحول میں تقدیر پر گفتگو کیسے کریں؟\n• اگر سب کچھ مقرر ہے تو تبلیغ کیوں کریں؟\n\nکلیدی صحیفے: رومیوں ۸:۲۸-۳۰، رومیوں ۹:۱۴-۲۴، افسیوں ۱:۳-۱۴، اعمال ۲:۲۳، یوحنا ۳:۱۶، ۲-پطرس ۳:۹، استثنا ۳۰:۱۹، یشوع ۲۴:۱۵\n\nEnglish: Is everything already written? Predestination vs. free will — the biblical texts, the classical Christian positions, and how to talk about qadr with Muslim friends.",
    duration: "23:08",
    publishDate: '2026-10-26',
    topics: ["Predestination", "Free Will", "Qadr"],
    scriptureReferences: ["Romans 8:28-30", "Romans 9:14-24", "Ephesians 1:3-14", "Acts 2:23", "John 3:16", "2 Peter 3:9"],
    episodeId: 3267208,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267208/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267208/',
    coverArt: '/images/podcast/ep01-cover.jpg',
  },
  {
    id: 'ep-02',
    number: 2,
    slug: "aazmaish-mein-ilahi-wadon-ki-haqeeqat",
    title: "آزمائش میں الٰہی وعدوں کی حقیقت",
    titleRoman: "Aazmaish mein ilahi wadon ki haqeeqat",
    titleEnglish: "The Reality of Divine Promises in Trial",
    description:
      "What God actually promises when the trial does not lift — comfort verses read honestly, and the difference between God removing suffering and God walking through it with us.",
    notesUrdu:
      "\"خدا وفادار ہے، وہ تمہیں آزمائش سے نکالے گا\" — یہ جملہ ہم مشکل میں سنتے ہیں، لیکن جب آزمائش ختم ہی نہ ہو تو؟ جب دعا کے باوجود بیماری، غربت یا ظلم برقرار رہے تو خدا کے وعدوں کا کیا مطلب ہے؟\n\nاِس قسط میں ہم بائبل کے وعدوں کو جذباتی نعروں سے الگ کر کے دیکھتے ہیں: وہ آیات جو تسلی دیتی ہیں، اور وہ حقیقت کہ مسیحی بھی آزمائش میں رہتے ہیں۔ یعقوب ۱، رومیوں ۵، ۱-پطرس ۱، ۲-کرنتھیوں ۱۲ اور عبرانیوں ۱۲ کے ذریعے ہم سیکھتے ہیں کہ آزمائش میں خدا کیا وعدہ کرتا ہے — آزمائش ہٹانے کا نہیں، اُس میں ساتھ چلنے اور اُسے بدلنے کا۔\n\nاِس قسط میں:\n• مشکل وقت میں خدا کے وعدے کیا ہیں؟\n• فکرمندی اور خوف میں کون سی آیات مدد کرتی ہیں؟\n• کمزوری میں طاقت کی آیات کیا ہیں؟\n• ایک دوسرے کو حوصلہ دینے کے لیے کیا آیات ہیں؟\n• خدا کی وفاداری کی یاد دہانی دینے والی آیات؟\n• تسلی بخش زبور کون سے ہیں؟\n• روزانہ عبادت کے لیے کون سی آیات مددگار ہیں؟\n\nکلیدی صحیفے: یعقوب ۱:۲-۴، ۱۲؛ رومیوں ۵:۳-۵؛ ۱-پطرس ۱:۶-۷؛ ۲-کرنتھیوں ۱۲:۷-۱۰؛ زبور ۳۴:۱۹؛ عبرانیوں ۱۲:۵-۱۱؛ ایوب ۲۳:۱۰\n\nEnglish: What God actually promises in suffering — the difference between comfort-verse clichés and the biblical theology of trial.",
    duration: "27:52",
    publishDate: '2026-10-26',
    topics: ["Suffering", "Promises of God", "Faith"],
    scriptureReferences: ["James 1:2-4,12", "Romans 5:3-5", "1 Peter 1:6-7", "2 Corinthians 12:7-10", "Psalm 34:19", "Hebrews 12:5-11", "Job 23:10"],
    episodeId: 3267215,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267215/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267215/',
    coverArt: '/images/podcast/ep02-cover.jpg',
  },
  {
    id: 'ep-03',
    number: 3,
    slug: "khushhali-ki-injeel-ka-fareb",
    title: "خوشحالی کی انجیل کا فریب",
    titleRoman: "Khushhali ki Injeel ka fareb",
    titleEnglish: "The Deception of the Prosperity Gospel",
    description:
      "\"Have faith and the business will run, the illness will go, the car will come\" — the prosperity gospel's claims tested against Paul's contentment, the crucified life, and what a church should say to believers living in poverty.",
    notesUrdu:
      "\"ایمان لاؤ، کاروبار چل جائے گا، بیماری دور ہو جائے گی، گاڑی آ جائے گی۔\" یہ وعدہ پاکستان کے ٹی وی چینلز، یوٹیوب اور واٹس ایپ پیغامات میں ہر جگہ موجود ہے۔ مگر یہ خوشخبری ہے یا ایک نیا فریب؟\n\nاِس قسط میں ہم خوشحالی کی انجیل (prosperity gospel) کی جڑیں، اُس کے سب سے مشہور دعوے، اور اُن کے جواب میں بائبل کی گواہی دیکھتے ہیں: پولس کی قناعت، مسیح کی مصلوب زندگی، اور یہ حقیقت کہ ایمان کا وعدہ آسانی نہیں بلکہ وفاداری ہے۔ ساتھ ہی ہم اِس سوال کو بھی چھوتے ہیں کہ غربت میں مبتلا ایماندار کو کلیسیا کیا کہہ سکتی ہے — اور کیا نہیں کہنا چاہیے۔\n\nاِس قسط میں:\n• کیا ایمان مال و دولت لاتا ہے؟\n• کیا غربت ایمان کی کمی کی علامت ہے؟\n• قناعت اور خوشحالی میں فرق کیا ہے؟\n• مالی مشکلات میں بائبل کیا کہتی ہے؟\n• جھوٹی تعلیمات سے کیسے بچیں؟\n• سخاوت اور لالچ میں فرق کیا ہے؟\n• دکھ اور تکلیف کا خدا کے منصوبے میں کیا کردار ہے؟\n\nکلیدی صحیفے: ۲-کرنتھیوں ۸:۹؛ فلپیوں ۴:۱۱-۱۳؛ ۱-تیمتھیس ۶:۶-۱۰؛ عبرانیوں ۱۳:۵؛ یوحنا ۱۶:۳۳؛ لوقا ۹:۲۳؛ متی ۶:۱۹-۲۱\n\nEnglish: The deception of the prosperity gospel — what Scripture promises, what it never promised, and how the church should speak to believers living in poverty.",
    duration: "23:00",
    publishDate: '2026-10-26',
    topics: ["Prosperity Gospel", "Contentment", "Wealth"],
    scriptureReferences: ["2 Corinthians 8:9", "Philippians 4:11-13", "1 Timothy 6:6-10", "Hebrews 13:5", "John 16:33", "Luke 9:23", "Matthew 6:19-21"],
    episodeId: 3267241,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267241/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267241/',
    coverArt: '/images/podcast/ep03-cover.jpg',
  },
  {
    id: 'ep-04',
    number: 4,
    slug: "yesu-ke-do-mukhtalif-shajra-e-nasab",
    title: "یسوع کے دو مختلف شجرۂ نسب",
    titleRoman: "Yesu ke do mukhtalif shajra-e-nasab",
    titleEnglish: "The Two Different Genealogies of Jesus",
    description:
      "Matthew 1 and Luke 3 do not match — contradiction or two vantage points? Solomon versus Nathan, levirate marriage and adoption, and the places where honesty requires saying \"we do not know\".",
    notesUrdu:
      "متی ۱ اور لوقا ۳ میں یسوع کا شجرۂ نسب ہے — لیکن دونوں ایک دوسرے سے مختلف ہیں۔ یہ سب سے پرانا اور سب سے زیادہ پوچھا جانے والا اعتراض ہے: کیا بائبل میں تضاد ہے؟\n\nاِس قسط میں ہم دونوں فہرستوں کو ایک ساتھ رکھ کر پڑھتے ہیں: متی کا یہودی/بادشاہانہ ڈھانچہ اور لوقا کا آدم تک جانے والا راستہ، داؤد کے دو بیٹوں (سلیمان اور ناتھن) سے آنے والی دو لکیریں، یہودی قانونِ نکاح (levirate marriage) اور گود لینے کا رواج، اور لوقا کے اُس جملے کا مطلب جہاں وہ یوسف کو \"خیا ل کیا جاتا تھا باپ\" کہتا ہے۔ ہم یہ بھی بتاتے ہیں کہ کون سی تشریحات سب سے زیادہ مضبوط ہیں اور کہاں ایمانداروں کو ایمانداری سے \"ہم قطعی نہیں جانتے\" کہنا چاہیے۔\n\nاِس قسط میں:\n• متی اور لوقا کے نسب میں فرق کیوں ہے؟\n• کیا یہ تضاد ہے یا دو مختلف زاویے؟\n• یوسف کے ذریعے نسب کیوں اہم ہے اگر یسوع یوسف کے بیٹے نہیں؟\n• کن کن تاریخی رواجوں سے یہ فرق سمجھا جا سکتا ہے؟\n• اِس اعتراض کا جواب غیر مسیحی دوست کو کیسے دیں؟\n\nکلیدی صحیفے: متی ۱:۱-۱۷؛ لوقا ۳:۲۳-۳۸؛ ۱-تواریخ ۳؛ ۲-سموئیل ۷؛ استثنا ۲۵:۵-۶؛ روت ۴\n\nEnglish: The two genealogies of Jesus (Matthew 1 and Luke 3) — the differences, the explanations, and how to answer the oldest objection honestly.",
    duration: "11:38",
    publishDate: '2026-10-26',
    topics: ["Genealogies", "Matthew 1", "Luke 3"],
    scriptureReferences: ["Matthew 1:1-17", "Luke 3:23-38", "1 Chronicles 3", "2 Samuel 7", "Deuteronomy 25:5-6", "Ruth 4"],
    episodeId: 3267257,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267257/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267257/',
    coverArt: '/images/podcast/ep04-cover.jpg',
  },
  {
    id: 'ep-05',
    number: 5,
    slug: "secret-rapture-1830-ka-khwab-ya-haqeeqat",
    title: "سیکرٹ ریپچر: 1830 کا خواب یا حقیقت؟",
    titleRoman: "Secret Rapture: 1830 ka khwab ya haqeeqat?",
    titleEnglish: "The Secret Rapture: An 1830 Dream or Reality?",
    description:
      "Where the secret rapture actually came from — Darby, the Plymouth Brethren, Margaret MacDonald, the Scofield Bible — and what 1 Thessalonians 4, Matthew 24 and Revelation 20 say when they are read rather than assumed.",
    notesUrdu:
      "\"خفیہ ریپچر\" — یعنی مسیح اپنے کلیسیا کو خاموشی سے اُٹھا لے جائے گا اور بعد میں دکھ کی بڑی مصیبت آئے گی — یہ نظریہ آج بہت سے گھرانوں میں بنیادی عقیدہ سمجھا جاتا ہے۔ مگر یہ تعلیم کہاں سے آئی؟\n\nاِس قسط میں ہم تاریخ کھولتے ہیں: ۱۸۳۰ کے لگ بھگ جان نیلسن ڈاربی اور پلے ماؤتھ برادرن، مارگریٹ میکڈونلڈ کے تجربات، بعد میں سکوفیلڈ بائبل (۱۹۰۹) کے ذریعے امریکہ میں پھیلاؤ — اور ساتھ ہی ۱-تھسلنیکیوں ۴، متی ۲۴، ۲-تھسلنیکیوں ۲ اور مکاشفہ ۲۰ کے متن کو پڑھتے ہیں۔ ہم مختلف موقف (pre-trib, mid-trib, post-trib, amillennial) کو غیر جانبدارانہ انداز میں بیان کرتے ہیں اور یہ بتاتے ہیں کہ اِس حوالے سے ایمانداروں میں اختلاف کیوں ہے — اور کیا چیز اِس اختلاف سے بالاتر ہے۔\n\nاِس قسط میں:\n• ریپچر کا لفظ بائبل میں کہاں ہے؟\n• 1830 سے پہلے یہ نظریہ کیوں نہیں ملتا؟\n• ۱-تھسلنیکیوں ۴ کا صحیح مطلب کیا ہے؟\n• کیا کلیسیا دکھ کی بڑی مصیبت سے بچ جائے گی؟\n• اِس عقیدے پر اختلاف ایمان کو کیسے متاثر کرتا ہے؟\n\nکلیدی صحیفے: ۱-تھسلنیکیوں ۴:۱۳-۱۸؛ متی ۲۴:۲۹-۳۱؛ ۲-تھسلنیکیوں ۲:۱-۴؛ مکاشفہ ۲۰؛ دانیال ۱۲\n\nEnglish: The secret rapture — where the doctrine came from (Darby, 1830, Scofield), what the texts actually say, and how to hold the debate without splitting the church.",
    duration: "17:41",
    publishDate: '2026-10-26',
    topics: ["Rapture", "Eschatology", "Church History"],
    scriptureReferences: ["1 Thessalonians 4:13-18", "Matthew 24:29-31", "2 Thessalonians 2:1-4", "Revelation 20", "Daniel 12"],
    episodeId: 3267265,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267265/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267265/',
    coverArt: '/images/podcast/ep05-cover.jpg',
  },
  {
    id: 'ep-06',
    number: 6,
    slug: "bible-aur-ghulami-ki-asal-haqeeqat",
    title: "بائبل اور غلامی کی اصل حقیقت",
    titleRoman: "Bible aur ghulami ki asal haqeeqat",
    titleEnglish: "The Bible and the Real Truth About Slavery",
    description:
      "Slavery in Scripture read honestly: the ancient and Roman setting, the laws of Exodus 21 and Leviticus 25, Philemon, the difference between regulating an institution and endorsing it, and the abolitionists who read the same texts.",
    notesUrdu:
      "\"اگر بائبل خدا کا کلام ہے تو اُس میں غلامی کی اجازت کیوں ہے؟\" یہ اعتراض آج سب سے طاقتور اعتراضات میں سے ہے — اور اکثر مسیحی اِس کا جواب نہیں جانتے۔\n\nاِس قسط میں ہم ایمانداری سے کام لیتے ہیں۔ پہلے قدیم مشرق وسطیٰ اور رومی غلامی کا سیاق و سباق — جو قرض، جنگ اور پیدائش پر مبنی تھی اور جس میں غلام انسانیت سے محروم سامان سمجھے جاتے تھے۔ پھر بائبل کے متن: خروج ۲۱، احبار ۲۵، استثنا ۱۵ اور ۲۳، فلیمون، افسیوں ۶۔ ہم دیکھتے ہیں کہ بائبل غلامی کے نظام کو اُس وقت کی دنیا میں محدود کرتی ہے، غلاموں کے ساتھ انصاف، آرام اور آزادی کی راہیں کھولتی ہے، انسان کو فروخت کرنے کو سخت گناہ کہتی ہے، اور فلیمون جیسے خط میں ایک غلام کو \"بھائی\" بنا دیتی ہے۔ پھر ہم وہ تاریخی کردار بھی بتاتے ہیں جو اِن ہی متنوں کی بنیاد پر غلامی کے خاتمے کی تحریک لے کر اُٹھے۔\n\nاِس قسط میں:\n• بائبل غلامی کی مذمت کیوں نہیں کرتی؟\n• خدا نے پرانے عہد میں غلامی کی اجازت کیوں دی؟\n• آج کے انسانی حقوق کے تناظر میں اُن آیات کی وضاحت کیسے کریں؟\n• بائبل کی غلامی اور جدید غلامی میں کیا فرق ہے؟\n• پولس رسول نے غلامی کو کیسے دیکھا؟\n• کیا مسیحیت غلامی کو جائز دیتی ہے یا ختم کرتی ہے؟\n• غلامی سے متعلق بائبل کی آیات سے ہم کیا سیکھ سکتے ہیں؟\n• عیسائیت نے غلامی کے خاتمے میں کیا کردار ادا کیا؟\n• کلیسیا غلامی پر ایمانداری سے گفتگو کیسے کرے؟\n• آج کے دور میں آزادی کی خوشخبری کیا معنی رکھتی ہے؟\n\nکلیدی صحیفے: خروج ۲۱:۱-۱۱، ۱۶؛ احبار ۲۵:۳۹-۴۳؛ استثنا ۱۵:۱۲-۱۵؛ استثنا ۲۳:۱۵-۱۶؛ فلیمون؛ افسیوں ۶:۵-۹؛ ۱-تیمتھیس ۱:۱۰\n\nEnglish: The Bible and slavery — the ancient context, the texts themselves, the difference between regulating an institution and endorsing it, and the abolitionists who read the same texts.",
    duration: "13:53",
    publishDate: '2026-10-26',
    topics: ["Slavery", "Old Testament Ethics", "Philemon"],
    scriptureReferences: ["Exodus 21:1-11,16", "Leviticus 25:39-43", "Deuteronomy 15:12-15", "Deuteronomy 23:15-16", "Philemon", "Ephesians 6:5-9", "1 Timothy 1:10"],
    episodeId: 3267277,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267277/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267277/',
    coverArt: '/images/podcast/ep06-cover.jpg',
  },
  {
    id: 'ep-07',
    number: 7,
    slug: "bible-ki-jangein-aur-ilahi-insaaf",
    title: "بائبل کی جنگیں اور الٰہی انصاف",
    titleRoman: "Bible ki jangein aur ilahi insaaf",
    titleEnglish: "The Wars of the Bible and Divine Justice",
    description:
      "The conquest of Canaan and the herem commands, set in the warfare of the ancient Near East, with the main interpretive options and the passages where God's mercy speaks for itself.",
    notesUrdu:
      "کنعان کی فتح، \"ہر جاندار کو قتل کر دو\" کے احکام، اور عمالیقیوں کا ذکر — عہدِ عتیق کے یہ حصے آج کے قاری کو چونکا دیتے ہیں۔ کیا یہ خدا ہے؟\n\nاِس قسط میں ہم سب سے مشکل متن کو چھپاتے نہیں۔ ہم پہلے اُس دور کی جنگ کی حقیقت بیان کرتے ہیں (قدیم مشرق وسطیٰ میں جنگ کے قوانین کتنے وحشی تھے)، پھر متن کے مختلف اندازِ تفسیر دیکھتے ہیں، اور ساتھ ہی وہ آیات بھی پڑھتے ہیں جو خدا کے کردار کو ظاہر کرتی ہیں — یرمیاہ ۱۸، حزقی ایل ۱۸ اور ۳۳، یوناہ ۴، پیدائش ۱۵ اور ۱۸۔ ہم یہ بھی بتاتے ہیں کہ \"تشدد\" اور \"انصاف\" کے درمیان فرق کیسے کیا جائے، اور یسوع کے پہاڑی وعظ میں اِس بحث کا انجام کہاں آتا ہے۔\n\nاِس قسط میں:\n• خدا نے پوری قوموں کے قتل کا حکم کیوں دیا؟\n• محبت کرنے والا خدا جنگ کا حکم کیسے دے سکتا ہے؟\n• کیا یہ پرتشدد کہانیاں جائز ہیں؟\n• غیر مسیحیوں کو یہ واقعات کیسے سمجھائیں؟\n• کیا یسوع نے پرانے عہد کے خدا کو مسترد کیا؟\n• خدا کا عدل اور رحمت ساتھ کیسے چلتے ہیں؟\n• کیا یہ واقعات حکم دینے والے ہیں یا صرف بیانیہ؟\n• کیا آج کے دور میں ہم اِن سے سیکھ سکتے ہیں؟\n• خدا نے قوموں پر عدالت کیوں نازل کی؟\n• کیا یہ واقعات مذہبی تشدد کو جواز دیتے ہیں؟\n\nکلیدی صحیفے: استثنا ۲۰؛ یشوع ۶-۱۱؛ پیدائش ۱۵:۱۳-۱۶؛ ۱-سموئیل ۱۵؛ یرمیاہ ۱۸:۷-۱۰؛ حزقی ایل ۱۸:۲۳؛ ۳۳:۱۱؛ یوناہ ۴:۱۱؛ متی ۵:۴۳-۴۸\n\nEnglish: The wars of the Bible and divine justice — the hardest Old Testament texts read out loud, the main interpretive options, and the passages where God's mercy speaks for itself.",
    duration: "13:36",
    publishDate: '2026-10-26',
    topics: ["Holy War", "Divine Justice", "Joshua"],
    scriptureReferences: ["Deuteronomy 20", "Joshua 6-11", "Genesis 15:13-16", "1 Samuel 15", "Jeremiah 18:7-10", "Ezekiel 18:23", "Ezekiel 33:11", "Jonah 4:11", "Matthew 5:43-48"],
    episodeId: 3267289,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267289/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267289/',
    coverArt: '/images/podcast/ep07-cover.jpg',
  },
  {
    id: 'ep-08',
    number: 8,
    slug: "aankh-ke-badle-aankh-aur-saza-e-maut",
    title: "آنکھ کے بدلے آنکھ اور سزائے موت",
    titleRoman: "Aankh ke badle aankh aur saza-e-maut",
    titleEnglish: "An Eye for an Eye and the Death Penalty",
    description:
      "\"An eye for an eye\" never licensed revenge — it limited it. Proportional justice, the same law for rich and poor, the death penalty, and Jesus going further in Matthew 5.",
    notesUrdu:
      "\"آنکھ کے بدلے آنکھ، دانت کے بدلے دانت\" — یہ جملہ بائبل کے پرتشدد ہونے کی سب سے مشہور مثال سمجھا جاتا ہے۔ مگر اصل میں یہ قانون جوش و غضب کی اجازت نہیں دیتا، بلکہ اُسے روکتا ہے۔\n\nاِس قسط میں ہم قصاص (lex talionis) کے اصل مقصد کو کھولتے ہیں: بدلہ لینے پر حد، عدالت میں تناسب، اور غریب و امیر کے لیے یکساں قانون۔ پھر سزائے موت کے سوال پر — پیدائش ۹:۶، رومیوں ۱۳، اور یسوع کا متی ۵ میں اُس سے آگے بڑھ جانا۔ آخر میں عہدِ عتیق کی عدالتوں کے طریقۂ کار (گواہوں کی شرائط، پناہ کے شہر) اور یہ کہ کس طرح رحمت انصاف کو کالعدم نہیں کرتی۔\n\nاِس قسط میں:\n• قصاص کا اصل مقصد کیا تھا؟\n• کیا یہ انتقام کی اجازت ہے؟\n• یسوع نے \"آنکھ کے بدلے آنکھ\" کو کیسے بدلا؟\n• سزائے موت پر بائبل کا موقف کیا ہے؟\n• کیا آج مسیحی سزائے موت کی حمایت کر سکتے ہیں؟\n• انصاف اور معافی میں توازن کیسے رکھیں؟\n\nکلیدی صحیفے: خروج ۲۱:۲۳-۲۵؛ احبار ۲۴:۱۹-۲۲؛ استثنا ۱۹:۱۵-۲۱؛ پیدائش ۹:۶؛ رومیوں ۱۳:۱-۴؛ متی ۵:۳۸-۴۲؛ متی ۷:۱-۵\n\nEnglish: \"An eye for an eye\" and the death penalty — what the law of retaliation actually limited, and how Jesus' teaching on mercy relates to public justice.",
    duration: "14:09",
    publishDate: '2026-10-26',
    topics: ["Lex Talionis", "Death Penalty", "Justice"],
    scriptureReferences: ["Exodus 21:23-25", "Leviticus 24:19-22", "Deuteronomy 19:15-21", "Genesis 9:6", "Romans 13:1-4", "Matthew 5:38-42"],
    episodeId: 3267299,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267299/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267299/',
    coverArt: '/images/podcast/ep08-cover.jpg',
  },
  {
    id: 'ep-09',
    number: 9,
    slug: "masihiyat-mein-talaq-aur-jazbati-shifa",
    title: "مسیحیت میں طلاق اور جذباتی شفا",
    titleRoman: "Masihiyat mein talaq aur jazbati shifa",
    titleEnglish: "Divorce in Christianity and Emotional Healing",
    description:
      "The subject the church is quietest about and where the wounds are deepest: Deuteronomy 24, Malachi 2, Matthew 19 and 1 Corinthians 7, the pastoral questions that follow, and hope for the broken-hearted.",
    notesUrdu:
      "طلاق کلیسیا میں وہ موضوع ہے جس پر سب سے زیادہ خاموشی ہے اور سب سے زیادہ زخم ہیں۔ بہت سے ایماندار گھر ٹوٹنے کے بعد خود کو کلیسیا سے باہر پاتے ہیں — اور اُن کا زخم مزید گہرا ہو جاتا ہے۔\n\nاِس قسط میں ہم بائبل کے متن کو ایمانداری سے دیکھتے ہیں: استثنا ۲۴، ملاکی ۲، متی ۱۹، ۱-کرنتھیوں ۷ — اور اُن کے ساتھ وہ سیاق و سباق جس میں یسوع نے بات کی (اُس دور میں عورتوں کی حالت، یک طرفہ طلاق کا رواج)۔ پھر ہم عملی پہلوؤں پر آتے ہیں: علیحدگی، دوبارہ شادی، بچوں کی پرورش، اور کلیسیا کا کردار۔ آخر میں جذباتی شفا — زبور ۳۴:۱۸، ۱۴۷:۳ — اور یہ کہ زخموں کے ساتھ خدا کے پاس آنا ایمان کی کمی نہیں۔\n\nاِس قسط میں:\n• بائبل طلاق کے بارے میں کیا کہتی ہے؟\n• کیا طلاق کبھی جائز ہے؟\n• یسوع نے طلاق کو سخت کیوں کیا؟\n• طلاق کے بعد دوبارہ شادی پر کیا موقف ہے؟\n• کلیسیا طلاق یافتہ افراد کی مدد کیسے کرے؟\n• بچوں پر طلاق کے اثرات کا کیا حل ہے؟\n• جذباتی زخموں کی شفا کیسے ممکن ہے؟\n• کیا خدا ٹوٹے ہوئے گھر کو بحال کر سکتا ہے؟\n• شرم اور قصور واری کے جذبات کا علاج کیا ہے؟\n• ایک صحت مند مسیحی شادی کی بنیاد کیا ہے؟\n\nکلیدی صحیفے: استثنا ۲۴:۱-۴؛ ملاکی ۲:۱۴-۱۶؛ متی ۱۹:۳-۹؛ ۱-کرنتھیوں ۷:۱۰-۱۶؛ افسیوں ۵:۲۵-۳۳؛ زبور ۳۴:۱۸؛ زبور ۱۴۷:۳\n\nEnglish: Divorce in Christianity and emotional healing — the texts, the culture behind them, the pastoral questions, and what the church owes people who are already wounded.",
    duration: "19:51",
    publishDate: '2026-10-26',
    topics: ["Divorce", "Healing", "Pastoral Care"],
    scriptureReferences: ["Deuteronomy 24:1-4", "Malachi 2:14-16", "Matthew 19:3-9", "1 Corinthians 7:10-16", "Ephesians 5:25-33", "Psalm 34:18", "Psalm 147:3"],
    episodeId: 3267306,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267306/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267306/',
    coverArt: '/images/podcast/ep09-cover.jpg',
  },
  {
    id: 'ep-10',
    number: 10,
    slug: "kalisia-mein-khawateen-ki-qiyadat",
    title: "کلیسیا میں خواتین کی قیادت اور بائبل",
    titleRoman: "Kalisia mein khawateen ki qiyadat aur Bible",
    titleEnglish: "Women's Leadership in the Church and the Bible",
    description:
      "Deborah, Huldah, Phoebe and Priscilla alongside 1 Corinthians 11 and 1 Timothy 2 — the overlooked texts, the debated ones, both main readings, and why the dignity of women is not the disputed part.",
    notesUrdu:
      "کیا عورتیں کلیسیا میں پادری یا بزرگ بن سکتی ہیں؟ کیا بائبل عورتوں کو مردوں کو تعلیم دینے کی اجازت دیتی ہے؟ پاکستانی معاشرے میں یہ سوال کلیسیا کے اندر بھی ہے اور باہر بھی۔\n\nاِس قسط میں ہم پہلے وہ حصے پڑھتے ہیں جو اکثر نظر انداز کیے جاتے ہیں: دبورہ (قضاة ۴-۵)، حُلدہ نبیہ، یسوع کی خاتون شاگردوں کا پہلا گواہ ہونا، پرسکلہ اور اکولہ کی تعلیمی خدمت، فیلپس کی بیٹیاں، فیبی اور یونیہ (رومیوں ۱۶)، اور پنتکست کی نبوت (اعمال ۲)۔ پھر ہم وہ متن بھی پڑھتے ہیں جن پر اختلاف ہے: ۱-کرنتھیوں ۱۱ و ۱۴، ۱-تیمتھیس ۲ — اور اُن کی مختلف تفسیریں (complementarian اور egalitarian)۔ ہم کسی ایک طرف کو جیتنے کی کوشش نہیں کرتے، مگر یہ واضح کرتے ہیں کہ عورت کی عزت اور خدمت کہیں بھی کم نہیں۔\n\nاِس قسط میں:\n• کیا عورتیں کلیسیا میں پادری یا بزرگ بن سکتی ہیں؟\n• کیا بائبل عورتوں کو مردوں کو تعلیم دینے کی اجازت دیتی ہے؟\n• پاکستانی معاشرے میں خواتین کلیسیا کی خدمت میں کیسے رہنمائی کر سکتی ہیں؟\n• کلیسیائی کرداروں میں مرد و زن کی تفریق بائبلی ہے یا ثقافتی؟\n• یسوع مسیح نے خواتین کے ساتھ کیا سلوک روا رکھا؟\n• کیا آج بھی خواتین کو سر ڈھانپنا چاہیے؟\n• کیا خواتین عبادت میں قیادت یا نبوت کر سکتی ہیں؟\n• خواتین کو کلیسیا میں بااختیار بنانا کیسے ممکن ہے؟\n• چرچ پلانٹنگ اور انجیل رسائی میں خواتین کا کیا کردار ہے؟\n• کلیسیاؤں میں خواتین کے ساتھ امتیازی سلوک ہو رہا ہے؟\n\nکلیدی صحیفے: پیدائش ۱:۲۷؛ قضاة ۴-۵؛ ۲-سلاطین ۲۲؛ لوقا ۸:۱-۳؛ لوقا ۲۴:۹-۱۱؛ اعمال ۲:۱۷-۱۸؛ اعمال ۱۸:۲۶؛ اعمال ۲۱:۹؛ رومیوں ۱۶:۱-۷؛ ۱-کرنتھیوں ۱۱:۵؛ ۱۱:۱۱-۱۲؛ ۱۴:۳۴-۳۵؛ ۱-تیمتھیس ۲:۱۱-۱۵؛ گلتیوں ۳:۲۸؛ ۱-پطرس ۴:۱۰-۱۱\n\nEnglish: Women's leadership in the church and the Bible — the overlooked texts, the debated ones, both main readings, and how the conversation can be honest instead of a war.",
    duration: "22:46",
    publishDate: '2026-10-26',
    topics: ["Women in Ministry", "Church Leadership", "Hermeneutics"],
    scriptureReferences: ["Genesis 1:27", "Judges 4-5", "2 Kings 22", "Luke 8:1-3", "Acts 2:17-18", "Acts 18:26", "Acts 21:9", "Romans 16:1-7", "1 Corinthians 11:5,11-12", "1 Timothy 2:11-15", "Galatians 3:28"],
    episodeId: 3267311,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267311/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267311/',
    coverArt: '/images/podcast/ep10-cover.jpg',
  },
  {
    id: 'ep-11',
    number: 11,
    slug: "hum-jins-parasti-aur-qadeem-mazhabi-behas",
    title: "ہم جنس پرستی اور قدیم مذہبی بحث",
    titleRoman: "Hum jins parasti aur qadeem mazhabi behas",
    titleEnglish: "Homosexuality and the Ancient Religious Debate",
    description:
      "The historical and textual background (Leviticus 18 and 20, Romans 1, Genesis 19), the honest questions people actually ask, and how the church can hold truth and grace without wounding people further.",
    notesUrdu:
      "یہ وہ موضوع ہے جس پر بات کرتے ہوئے اکثر زخم لگتے ہیں۔ اِس قسط میں ہم بحث کو شور سے نکال کر تاریخ اور متن کی طرف لے جاتے ہیں — اور ایمانداری سے دونوں اطراف کے دلائل بیان کرتے ہیں۔\n\nپہلے قدیم دنیا کا سیاق و سباق: احبار ۱۸ و ۲۰، رومیوں ۱، ۱-کرنتھیوں ۶، پیدائش ۱۹ — اور یہ کہ \"قدیم مذاہب\" (یہودیت، اسلام، عیسائیت) نے اِس موضوع پر روایتی طور پر کیا موقف رکھا۔ پھر آج کے دور کے سوالات: کیا یہ ایک شناخت ہے یا عمل؟ کیا کوئی ہم جنس پرست شخص مسیحی ہو سکتا ہے؟ کلیسیا اُن لوگوں کے ساتھ کیسے پیش آئے جنہیں اکثر ٹھکرا دیا گیا؟ ہم محبت، پاکیزگی، سچائی اور رحمت کے درمیان توازن پر بات کرتے ہیں — بغیر کسی پر پتھر پھینکنے کے۔\n\nاِس قسط میں:\n• بائبل ہم جنس پرستی کے بارے میں کیا کہتی ہے؟\n• کیا کوئی ہم جنس پرست شخص مسیحی ہو سکتا ہے؟\n• ہم جنس پرست افراد سے مسیحی محبت اور سچائی کیسے ظاہر کریں؟\n• کیا ہم جنس کشش گناہ ہے یا اُس پر عمل کرنا گناہ ہے؟\n• سچ اور فضل کے درمیان توازن کیسے رکھیں؟\n• پاکستانی نوجوان اِس کشش سے کیسے نمٹیں؟\n• کلیسیا کس طرح مدد فراہم کر سکتی ہے؟\n• \"پیدائشی طور پر ایسے\" ہونے کے دعوے کا جواب کیا ہے؟\n• مغربی میڈیا کی حمایت پر مسیحیوں کا ردعمل کیا ہونا چاہیے؟\n• کشش اور شناخت میں فرق ہے؟\n\nکلیدی صحیفے: احبار ۱۸:۲۲؛ احبار ۲۰:۱۳؛ پیدائش ۱۹؛ رومیوں ۱:۲۶-۲۷؛ ۱-کرنتھیوں ۶:۹-۱۱؛ ۱-تیمتھیس ۱:۱۰؛ متی ۱۹:۴-۶؛ یوحنا ۸:۱-۱۱؛ ۱-یوحنا ۱:۹\n\nEnglish: Homosexuality and the ancient religious debate — the historical and textual background, the honest questions, and how the church can hold truth and grace without wounding people further.",
    duration: "1:39",
    publishDate: '2026-10-26',
    topics: ["Homosexuality", "Grace and Truth", "Pastoral Care"],
    scriptureReferences: ["Leviticus 18:22", "Leviticus 20:13", "Genesis 19", "Romans 1:26-27", "1 Corinthians 6:9-11", "1 Timothy 1:10", "John 8:1-11", "1 John 1:9"],
    episodeId: 3267316,
    rssUrl: 'https://rss.com/podcasts/sauls-podship/3267316/',
    playerUrl: 'https://player.rss.com/sauls-podship/3267316/',
    coverArt: '/images/podcast/ep11-cover.jpg',
  },
].sort((a, b) => b.number - a.number); // newest first, like RSS.com

/** Newest episode (used by the home page broadcast card). */
export const LATEST_EPISODE: PodcastEpisode = EPISODES[0];

/** Look up by slug, id ("ep-03") or plain number ("3"). */
export function findEpisode(param?: string): PodcastEpisode | undefined {
  if (!param) return undefined;
  const p = decodeURIComponent(param).toLowerCase();
  return EPISODES.find(
    (e) =>
      e.slug.toLowerCase() === p ||
      e.id === p ||
      String(e.number) === p,
  );
}

/** Neighbouring episodes for prev/next navigation. */
export function episodeNeighbours(ep: PodcastEpisode) {
  const older = EPISODES.find((e) => e.number === ep.number - 1);
  const newer = EPISODES.find((e) => e.number === ep.number + 1);
  return { older, newer };
}

