/* ============================================================
   Saul's Podship — module i18n (prophecy map · interlinked Bible · kings)
   Drop-in on the standalone module pages. Follows the site-wide language
   (localStorage "sp-lang"), the ?lang= URL param the SPA appends when
   embedding the module in an iframe, and live {sp:'lang'} postMessages,
   translating the module chrome (titles, toolbars, buttons, hints) into
   Urdu / Hindi / Arabic. Deep scholarly body text stays as authored.
   ============================================================ */
(function () {
  "use strict";

  var RTL = { ur: 1, ar: 1 };
  var PATH = location.pathname;

  var DICT = {};
  if (/\/prophecy-map\.html?$/.test(PATH)) {
    DICT = {
      "A Saul’s Podship Study": { ur: "ایک ساؤلز پوڈشپ مطالعہ", hi: "एक सॉल्स पॉडशिप अध्ययन", ar: "دراسة سالس بودشيب" },
      "Biblical Prophecy": { ur: "بائبی نبوّت", hi: "बाइबलीय भविष्यवाणी", ar: "النبوءة الكتابية" },
      "Map": { ur: "نقشہ", hi: "नक्शा", ar: "الخريطة" },
      "Every cross-reference linked · every verse opens on bible.com · dates are approximate": {
        ur: "ہر باہمی حوالہ جُڑا ہوا · ہر آیت bible.com پر کھلتی ہے · تاریخیں تقریباً ہیں",
        hi: "प्रत्येक पारस्परिक संदर्भ जुड़ा हुआ · प्रत्येक पद bible.com पर खुलता है · तिथियाँ अनुमानित हैं",
        ar: "كل مرجع متبادل موصول · كل آية تُفتح على bible.com · التواريخ تقريبية",
      },
      "3D Globe": { ur: "تین جہتی گلوب", hi: "त्रि-आयामी ग्लोब", ar: "كرة ثلاثية الأبعاد" },
      "Network": { ur: "نیٹ ورک", hi: "नेटवर्क", ar: "الشبكة" },
      "Timeline": { ur: "ٹائم لائن", hi: "समयरेखा", ar: "الخط الزمني" },
      "Grid": { ur: "گرڈ", hi: "ग्रिड", ar: "الشبكة الدقيقة" },
      "Reset": { ur: "دوبارہ سیٹ", hi: "रीसेट", ar: "إعادة ضبط" },
      "Fit": { ur: "فٹ", hi: "फ़िट", ar: "ملاءمة" },
      "Re-arrange": { ur: "دوبارہ ترتیب", hi: "पुनर्व्यवस्था", ar: "إعادة ترتيب" },
      "Pause spin": { ur: "چکر روکیں", hi: "घूर्णन रोकें", ar: "إيقاف الدوران" },
      "Themes": { ur: "موضوعات", hi: "विषय", ar: "المواضيع" },
      "Status rings": { ur: "حالت کے حلقے", hi: "स्थिति वलय", ar: "حلقات الحالة" },
      "Isolate this node": { ur: "اس نوڈ کو الگ کریں", hi: "इस नोड को अलग करें", ar: "اعزل هذه العقدة" },
      "Copy all verses": { ur: "تمام آیات کاپی کریں", hi: "सभी पद कॉपी करें", ar: "انسخ كل الآيات" },
      "Skip module ↓": { ur: "ماڈیول چھوڑیں ↓", hi: "मॉड्यूल छोड़ें ↓", ar: "تخطَّ الوحدة ↓" },
      "Drag the sliders to turn the globe · pinch or ＋/－ to zoom": {
        ur: "گلوب گھمانے کے لیے سلائیڈر کھینچیں · زوم کے لیے پنچ یا ＋/－",
        hi: "ग्लोब घुमाने के लिए स्लाइडर खींचें · ज़ूम हेतु पिंच या ＋/－",
        ar: "اسحب أشرطة التمرير لتدوير الكرة · قرِّص أو استخدم ＋/－ للتكبير",
      },
      "Labels": { ur: "ليبل", hi: "लेबल", ar: "التسميات" },
      "Colour: fulfilled / awaiting": { ur: "رنگ: پوری / منتظر", hi: "रंग: पूर्ण / प्रतीक्षित", ar: "اللون: متحققة / منتظرة" },
      "Colour: theme": { ur: "رنگ: موضوع", hi: "रंग: विषय", ar: "اللون: الموضوع" },
      "Search prophecy or verse…  ( / )": {
        ur: "نبوّت یا آیت تلاش کریں…  ( / )",
        hi: "भविष्यवाणी या पद खोजें…  ( / )",
        ar: "ابحث عن نبوءة أو آية…  ( / )",
      },
      "Rotate ⟷": { ur: "گھمائیں ⟷", hi: "घुमाएँ ⟷", ar: "تدوير ⟷" },
      "Rotate ⟰": { ur: "جھکائیں ⟰", hi: "झुकाएँ ⟰", ar: "إمالة ⟰" },
      "Midnight": { ur: "آدھی رات", hi: "मध्यरात्रि", ar: "منتصف الليل" },
    };
  } else if (/\/viz\.html$/.test(PATH)) {
    DICT = {
      "A Saul’s Podship Study · Visual Concordance": {
        ur: "ساؤلز پوڈشپ مطالعہ · بصری کنکارڈنس",
        hi: "सॉल्स पॉडशिप अध्ययन · दृश्य संग्रह",
        ar: "دراسة سالس بودشيب · المراجع المرئية",
      },
      "The Interlinked": { ur: "باہمی مربوط", hi: "परस्पर-संबद्ध", ar: "الكتاب المترابط" },
      "Bible": { ur: "بائبل", hi: "बाइबल", ar: "الكتاب" },
      "verse references": { ur: "آیات کے حوالے", hi: "पद संदर्भ", ar: "مراجع الآيات" },
      "chapter threads": { ur: "باب کے دھاگے", hi: "अध्याय धागे", ar: "خيوط الفصول" },
      "shown": { ur: "دکھائے گئے", hi: "दिखाए गए", ar: "المعروضة" },
      "66 books · 1,189 chapters": { ur: "۶۶ کتابیں · ۱٬۱۸۹ ابواب", hi: "६६ पुस्तकें · १,१८९ अध्याय", ar: "٦٦ سفراً · ١٬١٨٩ فصلاً" },
      "Weaving 344,799 threads — loading the concordance (≈1.5 MB)…": {
        ur: "۳۴۴٬۷۹۹ دھاگے پروے جا رہے ہیں — کنکارڈنس لوڈ ہو رہا ہے (تقریباً ۱.۵ MB)…",
        hi: "३,४४,७९९ धागे बुने जा रहे हैं — संग्रह लोड हो रहा है (लगभग १.५ MB)…",
        ar: "نسج ٣٤٤٬٧٩٩ خيطاً — يجري تحميل المراجع (≈١.٥ MB)…",
      },
      "Slide to move across the chart · pinch or scroll to zoom": {
        ur: "چارٹ پر حرکت کے لیے سلائیڈ کریں · زوم کے لیے پنچ یا اسکرول",
        hi: "चार्ट पर घूमने के लिए स्लाइड करें · ज़ूम हेतु पिंच या स्क्रॉल",
        ar: "اسحب للتنقل عبر المخطط · قرِّص أو مرِّر للتكبير",
      },
      "Skip module ↓": { ur: "ماڈیول چھوڑیں ↓", hi: "मॉड्यूल छोड़ें ↓", ar: "تخطَّ الوحدة ↓" },
      "Scroll ⟷": { ur: "اسکرول ⟷", hi: "स्क्रॉल ⟷", ar: "تمرير ⟷" },
      "Scroll ⟰": { ur: "اسکرول ⟰", hi: "स्क्रॉल ⟰", ar: "تمرير ⟰" },
      /* the HTML uses a straight apostrophe here — both variants kept */
      "A Saul's Podship Study · Visual Concordance": {
        ur: "ساؤلز پوڈشپ مطالعہ · بصری کنکارڈنس",
        hi: "सॉल्स पॉडशिप अध्ययन · दृश्य संग्रह",
        ar: "دراسة سالس بودشيب · المراجع المرئية",
      },
    };
  } else if (/\/kings-of-the-bible\.html$/.test(PATH)) {
    DICT = {
      "Every King in the Bible, in Sequence": {
        ur: "بائبل کا ہر بادشاہ، ترتیب سے",
        hi: "बाइबल का प्रत्येक राजा, क्रम से",
        ar: "كل ملوك الكتاب المقدس، بالتسلسل",
      },
      "United & Divided Kingdoms, the foreign kings of the exile, the Apocrypha's Seleucid & Hasmonean rulers, the Herods of the New Testament, and Nero — with reign length, scripture reference, the prophets sent to warn them, and how each one's reign came to an end.": {
        ur: "متحدہ اور مقتسمہ سلطنتیں، جلاوطنی کے غیر ملکی بادشاہ، اپوکریفا کے سلیوسیڈ اور حشمونی حکمران، عہدِ جدید کے ہیرودس اور نیرو — دورِ حکومت، کلام کا حوالہ، ان کو تنبیہ کرنے والے انبیاء، اور ہر ایک کے دور کا انجام۔",
        hi: "एकीकृत और विभाजित राज्य, निर्वासन के विदेशी राजा, अपोक्रिफा के सेल्यूसिड और हैस्मोनियन शासक, नए नियम के हेरोदेस और नीरो — शासन-अवधि, शास्त्र संदर्भ, चेतावनी देने वाले भविष्यद्वक्ता, और प्रत्येक शासन का अंत।",
        ar: "الممالك الموحدة والمقسومة، وملوك السبي الأجانب، وحكام الأبوكريفا السلوقيون والحشمونيون، وهيرودس العهد الجديد، ونيرون — مع مدة الحكم والمرجع الكتابي والأنبياء الذين حذّروهم وكيفية نهاية كل حكم.",
      },
      "The King Who Is Coming · The Throne Line Begins and Ends with Him": {
        ur: "وہ بادشاہ جو آنے والا ہے · تخت کا سلسلہ اسی سے شروع اور اسی پر ختم ہوتا ہے",
        hi: "वह राजा जो आने वाला है · सिंहासन-पंक्ति उसी से आरंभ और उसी पर समाप्त होती है",
        ar: "الملك القادم · سلسلة العرش تبدأ به وتنتهي إليه",
      },
      "“I AM THE ALPHA AND THE OMEGA”": {
        ur: "”میں الف اور یا ہوں“",
        hi: "”मैं अल्फ़ा और ओमेगा हूँ“",
        ar: "»أنا الألف والياء«",
      },
      "Jump to a section": { ur: "کسی حصے پر جائیں", hi: "किसी अनुभाग पर जाएँ", ar: "انتقل إلى قسم" },
      "0. Jesus the Messiah — King of Kings": { ur: "۰. یسوع مسیح — بادشاہوں کا بادشاہ", hi: "०. यीशु मसीह — राजाओं का राजा", ar: "٠. يسوع المسيح — ملك الملوك" },
      "1. United Kingdom of Israel": { ur: "۱. اسرائیل کی متحدہ سلطنت", hi: "१. इस्राएल का एकीकृत राज्य", ar: "١. مملكة إسرائيل الموحدة" },
      "2. Kingdom of Israel (Northern)": { ur: "۲. اسرائیل کی سلطنت (شمالی)", hi: "२. इस्राएल राज्य (उत्तरी)", ar: "٢. مملكة إسرائيل (الشمالية)" },
      "3. Kingdom of Judah (Southern)": { ur: "۳. یہوداہ کی سلطنت (جنوبی)", hi: "३. यहूदा राज्य (दक्षिणी)", ar: "٣. مملكة يهوذا (الجنوبية)" },
      "4. Foreign Kings in Scripture": { ur: "۴. کلامِ مقدس میں غیر ملکی بادشاہ", hi: "४. शास्त्र में विदेशी राजा", ar: "٤. الملوك الأجانب في الكتاب" },
      "5. Apocrypha — Seleucid Kings": { ur: "۵. اپوکریفا — سلیوسیڈ بادشاہ", hi: "५. अपोक्रिफा — सेल्यूसिड राजा", ar: "٥. الأبوكريفا — الملوك السلوقيون" },
      "6. Apocrypha — Hasmonean Leaders": { ur: "۶. اپوکریفا — حشمونی رہنما", hi: "६. अपोक्रिफा — हैस्मोनियन नेता", ar: "٦. الأبوكريفا — قادة الحشمونيين" },
      "7. Herodian Kings (New Testament)": { ur: "۷. ہیرودی بادشاہ (عہدِ جدید)", hi: "७. हेरोदियन राजा (नया नियम)", ar: "٧. ملوك هيرودس (العهد الجديد)" },
      "8. Nero (Roman Emperor)": { ur: "۸. نیرو (رومن شہنشاہ)", hi: "८. नीरो (रोमन सम्राट)", ar: "٨. نيرون (إمبراطور رومي)" },
      "9. The Last King — The Beast (Dan conjecture)": { ur: "۹. آخری بادشاہ — وحش (دان کے بارے میں قیاس)", hi: "९. अंतिम राजा — विकराल पशु (दान के विषय में अनुमान)", ar: "٩. الملك الأخير — الوحش (فرضية دان)" },
      "Jesus the Messiah — King of Kings & Lord of Lords": { ur: "یسوع مسیح — بادشاہوں کا بادشاہ اور خدانوں کا خداوند", hi: "यीशु मसीह — राजाओं का राजा और प्रभुओं का प्रभु", ar: "يسوع المسيح — ملك الملوك ورب الأرباب" },
      "United Kingdom of Israel": { ur: "اسرائیل کی متحدہ سلطنت", hi: "इस्राएल का एकीकृत राज्य", ar: "مملكة إسرائيل الموحدة" },
      "Kingdom of Israel — Northern (10 Tribes)": { ur: "اسرائیل کی سلطنت — شمالی (۱۰ قبائل)", hi: "इस्राएल राज्य — उत्तरी (१० गोत्र)", ar: "مملكة إسرائيل — الشمالية (١٠ أسباط)" },
      "Kingdom of Judah — Southern": { ur: "یہوداہ کی سلطنت — جنوبی", hi: "यहूदा राज्य — दक्षिणी", ar: "مملكة يهوذا — الجنوبية" },
      "Foreign Kings in the Canonical Text": { ur: "کیننی متن میں غیر ملکی بادشاہ", hi: "कैनन पाठ में विदेशी राजा", ar: "الملوك الأجانب في النص القانوني" },
      "Apocrypha — Seleucid Kings": { ur: "اپوکریفا — سلیوسیڈ بادشاہ", hi: "अपोक्रिफा — सेल्यूसिड राजा", ar: "الأبوكريفا — الملوك السلوقيون" },
      "Apocrypha — Hasmonean Leaders (Jewish Side)": { ur: "اپوکریفا — حشمونی رہنما (یہودی طرف)", hi: "अपोक्रिफा — हैस्मोनियन नेता (यहूदी पक्ष)", ar: "الأبوكريفا — قادة الحشمونيين (الجانب اليهودي)" },
      "Herodian Kings — New Testament Era": { ur: "ہیرودی بادشاہ — عہدِ جدید کا دور", hi: "हेरोदियन राजा — नए नियम का युग", ar: "ملوك هيرودس — عصر العهد الجديد" },
      "Nero — Roman Emperor": { ur: "نیرو — رومن شہنشاہ", hi: "नीरो — रोमन सम्राट", ar: "نيرون — إمبراطور رومي" },
      "The Last King — The Beast & the Tribe of Dan Conjecture": { ur: "آخری بادشاہ — وحش اور قبیلۂ دان کا قیاس", hi: "अंतिम राजा — विकराल पशु और दान गोत्र का अनुमान", ar: "الملك الأخير — الوحش وفرضية سبط دان" },
      /* table column headers (repeated over all ten eras) */
      "King": { ur: "بادشاہ", hi: "राजा", ar: "الملك" },
      "Leader": { ur: "رہنما", hi: "नेता", ar: "القائد" },
      "Ruler": { ur: "حاکم", hi: "शासक", ar: "الحاكم" },
      "Kingdom": { ur: "سلطنت", hi: "राज्य", ar: "المملكة" },
      "Years Ruled": { ur: "حکمرانی کے سال", hi: "शासन के वर्ष", ar: "سنوات الحكم" },
      "Bible Reference": { ur: "بائبل حوالہ", hi: "बाइबल संदर्भ", ar: "مرجع الكتاب" },
      "Urdu Bible Reference": { ur: "اردو بائبل حوالہ", hi: "उर्दू बाइबल संदर्भ", ar: "مرجع الكتاب بالأردية" },
      "Reference (chapter)": { ur: "حوالہ (باب)", hi: "संदर्भ (अध्याय)", ar: "المرجع (الفصل)" },
      "Prophets / Witnesses Sent": { ur: "بھیجے گئے نبی / گواہ", hi: "भेजे गए भविष्यद्वक्ता / साक्षी", ar: "الأنبياء / الشهود المُرسَلون" },
      "Prophets / Apostles Sent": { ur: "بھیجے گئے نبی / رسول", hi: "भेजे गए भविष्यद्वक्ता / प्रेरित", ar: "الأنبياء / الرسل المُرسَلون" },
      "Prophets Sent": { ur: "بھیجے گئے نبی", hi: "भेजे गए भविष्यद्वक्ता", ar: "الأنبياء المُرسَلون" },
      "Witnesses Sent": { ur: "بھیجے گئے گواہ", hi: "भेजे गए साक्षी", ar: "الشهود المُرسَلون" },
      "How It Ends": { ur: "اختتام کیسے ہوتا ہے", hi: "अंत कैसे होता है", ar: "كيف ينتهي" },
      "How It Ended": { ur: "اختتام کیسے ہوا", hi: "अंत कैसे हुआ", ar: "كيف انتهى" },
      /* section chrome */
      "Theological Inquiries": { ur: "لاہوتی تحقیقات", hi: "धर्मशास्त्रीय जिज्ञासाएँ", ar: "الاستفسارات اللاهوتية" },
      "Saulspodship — Scripture Reference Series": { ur: "ساؤلزپوڈشپ — کلامِ مقدس کے حوالوں کی سیریز", hi: "सॉल्सपॉडशिप — शास्त्र संदर्भ शृंखला", ar: "سولسبودشيب — سلسلة مراجع الكتاب" },
      "Urdu references link to the Revised Urdu Bible (URV) on bible.com.": {
        ur: "اردو حوالے bible.com پر نظرثانی شدہ اردو بائبل (URV) سے جڑے ہیں۔",
        hi: "उर्दू संदर्भ bible.com पर संशोधित उर्दू बाइबल (URV) से जुड़े हैं।",
        ar: "ترتبط المراجع الأردية بالكتاب المقدس الأردي المنقح (URV) على bible.com.",
      },
    };
  } else {
    return; /* no dictionary for this page */
  }

  /* Lookup receives whitespace-normalised text, so the keys are normalised
     the same way — an irregular double space must not break a translation. */
  var NDICT = {};
  Object.keys(DICT).forEach(function (k) {
    var nk = k.replace(/\s+/g, " ").trim();
    if (nk && !NDICT[nk]) NDICT[nk] = DICT[k];
  });

  var lang = "en";
  try { lang = localStorage.getItem("sp-lang") || "en"; } catch (e) {}
  /* ?lang= wins at boot (the SPA appends it when embedding the module). */
  var urlLang = (location.search.match(/[?&]lang=(en|ur|hi|ar)/) || [])[1];
  if (urlLang) lang = urlLang;

  var translated = [];
  function restore() {
    translated.forEach(function (pair) { try { pair[0].data = pair[1]; } catch (e) {} });
    translated = [];
  }

  function lookup(text, l) {
    var hit = NDICT[text] || DICT[text];
    if (hit && hit[l]) return hit[l];
    try {
      var m = text.match(/^([^\p{L}\p{N}]+)?([\s\S]*?)([^\p{L}\p{N}]+)?$/u);
      if (m && m[2]) {
        var k = NDICT[m[2]] || DICT[m[2]];
        if (k && k[l]) return (m[1] || "") + k[l] + (m[3] || "");
      }
    } catch (e) { /* engine without \p classes */ }
    return null;
  }

  function applyLang(l) {
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-lang", l);
    restore();
    if (l === "en") return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.data || !n.data.replace(/\s+/g, "")) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("script, style, noscript, textarea, code, pre")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var out = lookup(node.data.replace(/\s+/g, " ").trim(), l);
      if (out) {
        var m = node.data.match(/^(\s*)([\s\S]*?)(\s*)$/);
        translated.push([node, node.data]);
        node.data = m[1] + out + m[3];
      }
    });
    /* search placeholder (prophecy map) */
    var q = document.getElementById("q");
    if (q && typeof q.placeholder === "string") {
      if (!q.getAttribute("data-orig-ph")) q.setAttribute("data-orig-ph", q.placeholder || "");
      var phHit = lookup((q.getAttribute("data-orig-ph") || "").replace(/\s+/g, " ").trim(), l);
      if (phHit) q.placeholder = phHit;
      else q.placeholder = q.getAttribute("data-orig-ph") || q.placeholder;
    }
  }

  /* live updates from the host SPA */
  window.addEventListener("message", function (e) {
    var d = e && e.data;
    if (d && d.sp === "lang" && /^(en|ur|hi|ar)$/.test(d.lang || "")) {
      lang = d.lang;
      applyLang(lang);
    }
  });
  /* and from the header toggle on a standalone view (same tab) */
  window.addEventListener("sp-lang-change", function (e) {
    var l = e && e.detail && e.detail.lang;
    if (/^(en|ur|hi|ar)$/.test(l || "")) { lang = l; applyLang(lang); }
  });

  function boot() { applyLang(lang); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
