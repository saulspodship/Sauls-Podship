/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pattern rules + time vocabulary.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The original toggle could only translate strings that somebody had typed
 * into a dictionary by hand. The moment volumes 47-51 were added, their
 * "Vol 47: …" links, their counts ("51 Academic Volumes") and their
 * "Last Updated: …" lines were invisible to it — the exact complaint this
 * rebuild fixes.
 *
 * A pattern rule matches a *shape* rather than a literal string, so anything
 * generated from data translates with no dictionary edit:
 *   "Vol 47: Types of Bad Spirits in the Bible"  →  "جلد ۴۷: …"
 *   "Browse 63 Volumes"                          →  "۶۳ جلدیں دیکھیں"
 *   "Last Updated: March 4, 2027"                →  "آخری ترمیم: ۴ مارچ ۲۰۲۷"
 *
 * `{1}`, `{2}` … are the regex capture groups. Groups listed in `numeric`
 * get localised digits (۵۱ / ५१ / ٥١); groups listed in `translate` are
 * themselves looked up in the dictionary (so a captured volume title is
 * translated too, and falls back to English when we have no entry for it).
 */

import type { PatternRule, Tr } from '../../lib/i18n/types';

/* ---------- months / weekdays / time words ---------- */
export const DICT_TIME: Record<string, Tr> = {
  'January': ['جنوری', 'जनवरी', 'يناير'],
  'February': ['فروری', 'फ़रवरी', 'فبراير'],
  'March': ['مارچ', 'मार्च', 'مارس'],
  'April': ['اپریل', 'अप्रैल', 'أبريل'],
  'May': ['مئی', 'मई', 'مايو'],
  'June': ['جون', 'जून', 'يونيو'],
  'July': ['جولائی', 'जुलाई', 'يوليو'],
  'August': ['اگست', 'अगस्त', 'أغسطس'],
  'September': ['ستمبر', 'सितंबर', 'سبتمبر'],
  'October': ['اکتوبر', 'अक्टूबर', 'أكتوبر'],
  'November': ['نومبر', 'नवंबर', 'نوفمبر'],
  'December': ['دسمبر', 'दिसंबर', 'ديسمبر'],
  'Last updated': ['آخری ترمیم', 'अंतिम अद्यतन', 'آخر تحديث'],
  'Last Updated': ['آخری ترمیم', 'अंतिम अद्यतन', 'آخر تحديث'],
  'Updated': ['ترمیم شدہ', 'अद्यतन', 'محدَّث'],
  'Published': ['شائع شدہ', 'प्रकाशित', 'منشور'],
  'Volume': ['جلد', 'खंड', 'مجلد'],
  'Volumes': ['جلدیں', 'खंड', 'مجلدات'],
  'Episode': ['قسط', 'प्रकरण', 'حلقة'],
  'Season': ['سیزن', 'सीज़न', 'موسم'],
  'Tier': ['درجہ', 'स्तर', 'مرتبة'],
  'Most Asked': ['سب سے زیادہ پوچھے گئے', 'सर्वाधिक पूछे गए', 'الأكثر طرحًا'],
  'Core': ['بنیادی', 'मूल', 'جوهرية'],
  'Specialised': ['تخصصی', 'विशेष', 'متخصصة'],
  'Supplement': ['اضافہ', 'परिशिष्ट', 'ملحق'],
  'Answers': ['جوابات', 'उत्तर', 'أجوبة'],
  'Questions': ['سوالات', 'प्रश्न', 'أسئلة'],
  'Question': ['سوال', 'प्रश्न', 'سؤال'],
  'Dossier': ['دستاویز', 'दस्तावेज़', 'ملف'],
  'Psalms': ['زبوریں', 'भजन', 'مزامير'],
  'Psalm': ['زبور', 'भजन', 'مزمور'],
  'Prophecies': ['نبوّتیں', 'भविष्यवाणियाँ', 'نبوءات'],
  'min read': ['منٹ مطالعہ', 'मिनट पठन', 'دقائق قراءة'],
  'Page': ['صفحہ', 'पृष्ठ', 'صفحة'],
  'of': ['از', 'का', 'من'],
  'Results': ['نتائج', 'परिणाम', 'النتائج'],
  'No results': ['کوئی نتیجہ نہیں', 'कोई परिणाम नहीं', 'لا نتائج'],
  'Found': ['ملے', 'प्राप्त', 'وُجد'],
  'New': ['نیا', 'नया', 'جديد'],
  'Live': ['براہِ راست', 'लाइव', 'بث مباشر'],
  'Scheduled': ['طے شدہ', 'निर्धारित', 'مجدول'],
};

/* Ordered: the first rule that matches wins. */
export const PATTERNS: PatternRule[] = [
  /* ---- volume links in the footer / index: "Vol 01: All Bible Stories" ---- */
  {
    id: 'vol-colon-title',
    re: '^Vol(?:ume)?\\.?\\s*(\\d{1,3})\\s*[:\u00b7\u2013\u2014-]\\s*(.+)$',
    flags: 'i',
    out: ['جلد {1}: {2}', 'खंड {1}: {2}', 'المجلد {1}: {2}'],
    numeric: [1],
    translate: [2],
  },
  /* ---- "Volume 11", "Volume 11 \u00b7 Supplement", "Examine Volume 12 Dossier" ---- */
  {
    id: 'volume-number-suffix',
    re: '^Volume\\s+(\\d{1,3})\\s*(.*)$',
    flags: 'i',
    out: ['جلد {1}{2}', 'खंड {1}{2}', 'المجلد {1}{2}'],
    numeric: [1],
  },
  {
    id: 'examine-volume-dossier',
    re: '^Examine\\s+Volume\\s+(\\d{1,3})\\s+Dossier$',
    flags: 'i',
    out: ['جلد {1} کی دستاویز دیکھیں', 'खंड {1} का दस्तावेज़ देखें', 'افتح ملف المجلد {1}'],
    numeric: [1],
  },
  {
    id: 'kings-volume',
    re: '^(.+?)\\s*[\u00b7\u2022|]\\s*Volume\\s+(\\d{1,3})$',
    flags: 'i',
    out: ['{1} \u00b7 جلد {2}', '{1} \u00b7 खंड {2}', '{1} \u00b7 المجلد {2}'],
    numeric: [2],
    translate: [1],
  },

  /* ---- counts: "Browse 51 Volumes", "All 51 Volumes", "51 Academic Volumes" ---- */
  {
    id: 'browse-n-volumes',
    re: '^(?:Browse|Explore|View|Open|See)\\s+(?:All\\s+)?(\\d{1,4})\\s+Volumes(?:\\s+in\\s+Catalog)?$',
    flags: 'i',
    out: ['{1} جلدیں دیکھیں', '{1} खंड देखें', 'تصفَّح {1} مجلدًا'],
    numeric: [1],
  },
  {
    id: 'all-n-volumes-index',
    re: '^All\\s+(\\d{1,4})\\s+Volumes(?:\\s+Index)?$',
    flags: 'i',
    out: ['تمام {1} جلدوں کا فہرست', 'सभी {1} खंडों की अनुक्रमणिका', 'فهرس كل الـ{1} مجلدًا'],
    numeric: [1],
  },
  {
    id: 'n-academic-volumes',
    re: '^(\\d{1,4})\\s+Academic\\s+Volumes$',
    flags: 'i',
    out: ['{1} علمی جلدیں', '{1} शैक्षणिक खंड', '{1} مجلدًا أكاديميًّا'],
    numeric: [1],
  },
  {
    id: 'n-volume-catalog',
    re: '^(\\d{1,4})-Volume\\s+(.+)$',
    flags: 'i',
    out: ['{1} جلدوں کی {2}', '{1} खंडों का {2}', '{2} بـ{1} مجلدًا'],
    numeric: [1],
    translate: [2],
  },
  {
    id: 'the-n-volume-scriptorium',
    re: '^The\\s+(\\d{1,4})-Volume\\s+Scriptorium$',
    flags: 'i',
    out: ['{1} جلدوں کا اسکرپٹوریم', '{1} खंडों का लिपिगृह', 'دار النسخ بـ{1} مجلدًا'],
    numeric: [1],
  },
  {
    id: 'n-peer-reviewed-volumes',
    re: '^(\\d{1,4})\\s+Peer-Reviewed\\s+Volumes$',
    flags: 'i',
    out: ['{1} ہم مرتبہ جلداًیں', '{1} समीक्षित खंड', '{1} مجلدًا مُحكَّمًا'],
    numeric: [1],
  },

  /* ---- "Last Updated: September 6, 2026" ---- */
  {
    id: 'last-updated-date',
    re: '^Last\\s+Updated\\s*[:\u00b7\u2013-]?\\s*([A-Za-z]+)\\s+(\\d{1,2}),?\\s+(\\d{4})$',
    flags: 'i',
    out: ['آخری ترمیم: {2} {1} {3}', 'अंतिम अद्यतन: {2} {1} {3}', 'آخر تحديث: {2} {1} {3}'],
    translate: [1],
    numeric: [2, 3],
  },
  {
    id: 'last-updated-iso',
    re: '^Last\\s+Updated\\s*[:\u00b7\u2013-]?\\s*(\\d{4}-\\d{2}-\\d{2})$',
    flags: 'i',
    out: ['آخری ترمیم: {1}', 'अंतिम अद्यतन: {1}', 'آخر تحديث: {1}'],
  },
  {
    id: 'updated-on',
    re: '^Updated\\s+(?:on\\s+)?([A-Za-z]+)\\s+(\\d{1,2}),?\\s+(\\d{4})$',
    flags: 'i',
    out: ['ترمیم شدہ: {2} {1} {3}', 'अद्यतन: {2} {1} {3}', 'محدَّث في: {2} {1} {3}'],
    translate: [1],
    numeric: [2, 3],
  },

  /* ---- podcast / video chrome ---- */
  {
    id: 'episode-n',
    re: '^Episode\\s+(\\d{1,4})\\s*(.*)$',
    flags: 'i',
    out: ['قسط {1}{2}', 'प्रकरण {1}{2}', 'الحلقة {1}{2}'],
    numeric: [1],
  },
  {
    id: 'season-n',
    re: '^Season\\s+(\\d{1,3})$',
    flags: 'i',
    out: ['سیزن {1}', 'सीज़न {1}', 'الموسم {1}'],
    numeric: [1],
  },
  {
    id: 'n-min-read',
    re: '^(\\d{1,3})\\s*min(?:ute)?\\s*read$',
    flags: 'i',
    out: ['{1} منٹ مطالعہ', '{1} मिनट पठन', '{1} دقائق قراءة'],
    numeric: [1],
  },

  /* ---- archive / codex counters ---- */
  {
    id: 'n-questions',
    re: '^(\\d{1,5})\\s+Questions$',
    flags: 'i',
    out: ['{1} سوالات', '{1} प्रश्न', '{1} سؤالًا'],
    numeric: [1],
  },
  {
    id: 'n-answers-parens',
    re: '^(.+?)\\s*\\((\\d{1,6})\\s+Answers\\)$',
    flags: 'i',
    out: ['{1} ({2} جوابات)', '{1} ({2} उत्तर)', '{1} ({2} جوابًا)'],
    translate: [1],
    numeric: [2],
  },
  {
    id: 'n-psalms',
    re: '^(\\d{1,4})\\s+(?:Psalms|Punjabi\\s+Zaboor)$',
    flags: 'i',
    out: ['{1} زبوریں', '{1} भजन', '{1} مزمورًا'],
    numeric: [1],
  },
  {
    id: 'tier-n',
    re: '^Tier\\s+(\\d)\\s*\\((.+)\\)$',
    flags: 'i',
    out: ['درجہ {1} ({2})', 'स्तर {1} ({2})', 'المرتبة {1} ({2})'],
    numeric: [1],
    translate: [2],
  },

  /* ---- browser-tab titles ("Book of Revelation | Saul's Podship").
         usePageMetadata/Seo build these from data, so the shape is matched
         rather than the literal; the page part is looked up in the dictionary
         and left alone when we have no entry for it. ---- */
  {
    id: 'title-suffix-brand',
    re: "^(.+?)\\s*\\|\\s*Saul['\u2019]?s Podship\\s*$",
    flags: 'i',
    out: ['{1} | سالز پوڈشپ', '{1} | सौल्स पॉडशिप', '{1} | سالس بودشيب'],
    translate: [1],
  },
  {
    id: 'title-prefix-brand',
    re: "^Saul['\u2019]?s Podship\\s*\\|\\s*(.+)$",
    flags: 'i',
    out: ['سالز پوڈشپ | {1}', 'सौल्स पॉडशिप | {1}', 'سالس بودشيب | {1}'],
    translate: [1],
  },
  {
    id: 'title-archive-suffix',
    re: "^(.+?)\\s*[\u2014\u2013-]\\s*(Book-by-Book Bible Study Archive)\\s*\\|\\s*Saul['\u2019]?s Podship\\s*$",
    flags: 'i',
    out: ['{1} \u2014 {2} | سالز پوڈشپ', '{1} \u2014 {2} | सौल्स पॉडशिप', '{1} \u2014 {2} | سالس بودشيب'],
    translate: [1, 2],
  },

  /* ---- generic numeric-labelled section headings ("Table 3", "Figure 2") ---- */
  {
    id: 'label-n-colon',
    re: '^(Table|Figure|Chart|Map|Section|Part|Step|Note|Chapter|Book)\\s+(\\d{1,4})\\s*[:\u00b7\u2013-]\\s*(.+)$',
    flags: 'i',
    out: ['{1} {2}: {3}', '{1} {2}: {3}', '{1} {2}: {3}'],
    translate: [1, 3],
    numeric: [2],
  },

  /* ---- pagination / result counters ---- */
  {
    id: 'page-x-of-y',
    re: '^Page\\s+(\\d{1,4})\\s+of\\s+(\\d{1,4})$',
    flags: 'i',
    out: ['صفحہ {1} از {2}', 'पृष्ठ {1} का {2}', 'صفحة {1} من {2}'],
    numeric: [1, 2],
  },
  {
    id: 'n-results',
    re: '^(\\d{1,6})\\s+(?:results?|records?|items?|entries)$',
    flags: 'i',
    out: ['{1} نتائج', '{1} परिणाम', '{1} نتيجة'],
    numeric: [1],
  },

  /* ---- lineage explorer (content.lineage): the counter, the branch toggle and
         approximate years, all generated from the data ("Showing 11 of 52
         traditions", "7 branches", "c. 2242 BC"). "1 branch" is a dictionary
         entry, so the singular never reaches the plural rule. ---- */
  {
    id: 'showing-n-of-m-traditions',
    re: '^Showing\\s+(\\d{1,5})\\s+of\\s+(\\d{1,5})\\s+traditions$',
    flags: 'i',
    out: ['{2} میں سے {1} روایات', '{2} में से {1} परंपराएँ', 'عرض {1} من {2} تقليدًا'],
    numeric: [1, 2],
  },
  {
    id: 'n-branches',
    re: '^(\\d{1,4})\\s+branches$',
    flags: 'i',
    out: ['{1} شاخیں', '{1} शाखाएँ', '{1} فروع'],
    numeric: [1],
  },
  {
    id: 'circa-year-bc',
    re: '^c\\.\\s*(\\d[\\d,]*)\\s*BC$',
    flags: 'i',
    out: ['تقریباً {1} ق م', 'लगभग {1} ई.पू.', 'نحو {1} ق.م'],
    numeric: [1],
  },
  {
    id: 'circa-year-ad',
    re: '^c\\.\\s*(\\d[\\d,]*)\\s*AD$',
    flags: 'i',
    out: ['تقریباً {1} عیسوی', 'लगभग {1} ईस्वी', 'نحو {1} م'],
    numeric: [1],
  },
];

/** Extra single words that appear inside generated sentences. */
export const DICT_WORDS: Record<string, Tr> = {
  'Table': ['جدول', 'तालिका', 'جدول'],
  'Figure': ['شکل', 'आकृति', 'شكل'],
  'Chart': ['چارٹ', 'चार्ट', 'مخطط'],
  'Map': ['نقشہ', 'मानचित्र', 'خريطة'],
  'Section': ['حصہ', 'अनुभाग', 'قسم'],
  'Part': ['حصہ', 'भाग', 'جزء'],
  'Step': ['مرحلہ', 'चरण', 'خطوة'],
  'Note': ['نوٹ', 'टिप्पणी', 'ملاحظة'],
  'Chapter': ['باب', 'अध्याय', 'إصحاح'],
  'Book': ['کتاب', 'पुस्तक', 'سفر'],
  'Era': ['دور', 'युग', 'حقبة'],
  'Year': ['سال', 'वर्ष', 'سنة'],
  'Event': ['واقعہ', 'घटना', 'حدث'],
  'Reference': ['حوالہ', 'संदर्भ', 'مرجع'],
  'Text': ['متن', 'पाठ', 'نص'],
  'Description': ['تفصیل', 'विवरण', 'وصف'],
  'Title': ['عنوان', 'शीर्षक', 'عنوان'],
  'Author': ['مصنف', 'लेखक', 'المؤلف'],
  'Category': ['زمرہ', 'श्रेणी', 'فئة'],
  'Keywords': ['کلیدی الفاظ', 'मुख्य-शब्द', 'الكلمات المفتاحية'],
  'Related': ['متعلقہ', 'संबंधित', 'ذو صلة'],
  'Overview': ['خلاصہ', 'अवलोकन', 'نظرة عامة'],
  'Introduction': ['تمہید', 'प्रस्तावना', 'مقدمة'],
  'Conclusion': ['اختتامیہ', 'निष्कर्ष', 'خاتمة'],
  'Summary': ['خلاصہ', 'सारांश', 'ملخص'],
  'Key Takeaways': ['اہم نکات', 'मुख्य निष्कर्ष', 'الخلاصات الرئيسية'],
  'Sources': ['مآخذ', 'स्रोत', 'المصادر'],
  'Citations': ['حوالہ جات', 'उद्धरण', 'الإحالات'],
  'Footnotes': ['حاشیہ نوٹس', 'पाद-टिप्पणियाँ', 'الحواشي'],
  'Glossary': ['فرہنگ', 'शब्दावली', 'مسرد المصطلحات'],
  'Bibliography': ['کتابیات', 'ग्रंथ-सूची', 'المراجع'],
  'Appendix': ['ضمیمہ', 'परिशिष्ट', 'ملحق'],
};
