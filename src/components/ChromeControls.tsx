/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Globe, Moon, Sun } from 'lucide-react';

/**
 * ChromeControls — site-wide language (EN / اردو / हिन्दी / العربية) +
 * dark/light toggle, mounted in the header.
 *
 * Translation is dictionary-driven over stable UI chrome strings (nav, CTAs,
 * section headings, footer) applied at the DOM layer so it follows route
 * changes and static prerender alike. Scholarly body text stays in English
 * by design; lang/dir attributes + RTL mirroring are set on <html>.
 */

type Lang = 'en' | 'ur' | 'hi' | 'ar';

const RTL: Lang[] = ['ur', 'ar'];

// EN key → [ur, hi, ar]
const DICT: Record<string, [string, string, string]> = {
  'Encyclopedia': ['موسوعہ', 'विश्वकोश', 'الموسوعة'],
  /* header dropdown groups + their destinations (added with the nav dropdowns) */
  'Study Tools': ['مطالعہ کے آلات', 'अध्ययन उपकरण', 'أدوات الدراسة'],
  'Watch & Listen': ['دیکھیں اور سنیں', 'देखें और सुनें', 'شاهد واستمع'],
  'Ministry': ['خدمت', 'सेवा-कार्य', 'الخدمة'],
  'Prophecy Map': ['نقشۂ نبوّت', 'भविष्यवाणी नक्शा', 'خريطة النبوءات'],
  'Interlinked Bible': ['باہمی مربوط بائبل', 'परस्पर-संबद्ध बाइबल', 'الكتاب المقدس المترابط'],
  'Kings of the Bible': ['بائبل کے بادشاہ', 'बाइबल के राजा', 'ملوك الكتاب المقدس'],
  'Comparative Apologetics': ['تقابلی دفاعِ ایمان', 'तुलनात्मक ईसाई युक्तिवाद', 'الدفاعيات المقارنة'],
  'Theological Archive': ['الٰہیاتی آرکائیو', 'धार्मिक अभिलेखागार', 'الأرشيف اللاهوتي'],
  'Biblical Maps Atlas': ['بائبل کے نقشوں کا اطلس', 'बाइबल मानचित्र एटलस', 'أطلس خرائط الكتاب المقدس'],
  'Punjabi Zaboor': ['پنجابی زبور', 'पंजाबी ज़बूर', 'الزَّبُور البنجابية'],
  'Singers Archive': ['گلوکاروں کا ذخیرہ', 'गायकों का संग्रह', 'أرشيف المرتّلين'],
  'Support & Mission': ['حمایت و مشن', 'सहयोग एवं मिशन', 'الدعم والرسالة'],
  'FAQ': ['عام سوالات', 'सामान्य प्रश्न', 'الأسئلة الشائعة'],
  'Contact': ['رابطہ', 'संपर्क', 'اتصل بنا'],
  'Podcast': ['پوڈکاسٹ', 'पॉडकास्ट', 'البودكاست'],
  'Videos': ['ویڈیوز', 'वीडियो', 'الفيديوهات'],
  'Sacred Music': ['مقدس موسیقی', 'पवित्र संगीत', 'الموسيقى المقدسة'],
  'Scriptorium Studio': ['اسکرپٹوریم اسٹوڈیو', 'लिपिगृह स्टूडियो', 'استوديو النُّسْخ'],
  'Standards': ['معیارات', 'मानक', 'المعايير'],
  'About': ['تعارف', 'परिचय', 'حول'],
  'Support': ['حمایت', 'सहयोग', 'الدعم'],
  'Browse 51 Volumes': ['۵۱ جلدیں دیکھیں', '५१ खंड देखें', 'تصفَّح ٥١ مجلدًا'],
  'Start Reading ↓': ['پڑھنا شروع کریں ↓', 'पढ़ना आरंभ करें ↓', 'ابدأ القراءة ↓'],
  'A BIBLICAL MINISTRY PROJECT': ['ایک انجیلی خدمت کا منصوبہ', 'एक बाइबली सेवा-परियोजना', 'مَشْرُوعُ خِدْمَة إِنْجِيلِيَّة'],
  'Five Pillars of Saul\u2019s Podship Scriptorium': ['سالز پوڈشپ اسکرپٹوریم کے پانچ ستون', 'सौल्स पॉडशिप लिपिगृह के पाँच स्तंभ', 'الأركان الخمسة لمكتب سالس بودشيب للنسخ'],
  "Five Pillars of Saul's Podship Scriptorium": ['سالز پوڈشپ اسکرپٹوریم کے پانچ ستون', 'सौल्स पॉडशिप लिपिगृह के पाँच स्तंभ', 'الأركان الخمسة لمكتب سالس بودشيب للنسخ'],
  'The 51-Volume Scriptorium': ['اکیاون جلدوں کا اسکرپٹوریم', 'इक्यावन खंडों का लिपिगृह', 'دار النسخ بإحدى وخمسين مجلدًا'],
  'Featured Scholarly Excerpts': ['منتخب علمی اقتباسات', 'चुनिंदा विद्वत्तापूर्ण अंश', 'مقتطفات علمية مختارة'],
  "Saul's Podship Podcast": ['سالز پوڈشپ پوڈکاسٹ', 'सौल्स पॉडशिप पॉडकास्ट', 'بودكاست سالس بودشيب'],
  'Sacred Punjabi Zaboor & Artists Archive': ['مقدس پنجابی زبور اور فنکاروں کا ذخیرہ', 'पवित्र पंजाबी ज़बूर एवं कलाकार संग्रह', 'أرشيف الزَّبُور البنجابية المقدسة والفنّانين'],
  'AI Scholar Assistant & Hymn Composer': ['اے آئی علمی معاون و بجن نگار', 'एआई विद्वत् सहायक एवं भजन-रचयिता', 'مساعد الباحث الذكي وملحّن الترانيم'],
  '51 Academic Volumes': ['۵۱ علمی جلدیں', '५१ शैक्षणिक खंड', '٥١ مجلدًا أكاديميًّا'],
  'Indigenous Punjabi Zaboor': ['مقامی پنجابی زبور', 'स्वदेशी पंजाबी ज़बूर', 'الزَّبُور البنجابي الأصيل'],
  'Scholarly Standards': ['علمی معیار', 'विद्वत्तापूर्ण मानक', 'المعايير العلمية'],
  'New from the Podship': ['پوڈشپ سے نیا', 'पॉडशिप से नया', 'جديد من بودشيب'],
  'Latest Episodes, Fresh Aboard': ['تازہ ترین اقساط، بحری جہاز پر خوش آمدید', 'नवीनतम प्रकरण, जहाज़ पर नया', 'أحدث الحلقات، على متن السفينة'],
  'All videos': ['تمام ویڈیوز', 'सभी वीडियो', 'كل الفيديوهات'],
  'About the Ministry': ['خدمت کا تعارف', 'सेवा-परिचय', 'عن الخدمة'],
  'All 51 Volumes Index': ['تمام ۵۱ جلدوں کا فہرست', 'सभी ५१ खंडों की अनुक्रमणिका', 'فهرس الـ٥١ مجلدًا'],
  'Bible Video Library': ['بائبل ویڈیو لائبریری', 'बाइबल वीडियो पुस्तकालय', 'مكتبة فيديوهات الكتاب المقدس'],
  'Contact & Submissions': ['رابطہ و ارسال', 'संपर्क एवं प्रस्तुतियाँ', 'التواصل والإرساليات'],
  'Frequently Asked Questions': ['عام سوالات', 'सामान्य प्रश्न', 'الأسئلة الشائعة'],
  'Official YouTube': ['سرکاری یوٹیوب', 'आधिकारिक यूट्यूब', 'يوتيوب الرسمي'],
  'Pakistani Singers Archive': ['پاکستانی گلوکاروں کا ذخیرہ', 'पाकिस्तानी गायक संग्रह', 'أرشيف مرتّلي باكستان'],
  'Partnership & Mission': ['شراکت اور مشن', 'साझेदारी एवं मिशन', 'الشركة والرسالة'],
  'Privacy Policy': ['رازداری کی پالیسی', 'गोपनीयता नीति', 'سياسة الخصوصية'],
  'Sacred Music Hub': ['مقدس موسیقی مرکز', 'पवित्र संगीत केंद्र', 'مركز الموسيقى المقدسة'],
  'Scriptorium AI Studio': ['اسکرپٹوریم اے آئی اسٹوڈیو', 'लिपिगृह एआई स्टूडियो', 'استوديو النسخ الذكي'],
  'Support on Patreon': ['پیٹریون پر حمایت', 'पैट्रॉन पर सहयोग', 'الدعم عبر Patreon'],
  'Terms of Service': ['خدمت کی شرائط', 'सेवा की शर्तें', 'شروط الخدمة'],
  'Theological Disclaimer': ['الہیاتی وضاحت', 'धर्मशास्त्रीय अस्वीकरण', 'إخلاء مسؤولية لاهوتية'],
  'Theological Podcast': ['الہیاتی پوڈکاسٹ', 'धर्मशास्त्रीय पॉडकास्ट', 'البودكاست اللاهوتي'],
};

const LEAF_SEL = 'header a, header button, header span, footer a, footer h4, nav a, main h1, main h2, main h3, main button';

const restoreAll = () => {
  document.querySelectorAll('[data-sp-i18n]').forEach((el) => {
    const orig = (el as HTMLElement).getAttribute('data-sp-orig');
    if (orig !== null) { el.textContent = orig; }
    el.removeAttribute('data-sp-i18n'); el.removeAttribute('data-sp-orig');
  });
};

const applyLang = (lang: Lang) => {
  restoreAll();
  if (lang === 'en') return;
  const idx = { ur: 0, hi: 1, ar: 2 }[lang] as 0 | 1 | 2;
  let budget = 500;
  document.querySelectorAll(LEAF_SEL).forEach((el) => {
    if (budget <= 0) return;
    if (el.querySelector('*:not(svg):not(path):not(circle)')) return; // leaves only
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const hit = DICT[t] || DICT[t.replace(/\u2019/g, "'")];
    if (hit && hit[idx]) {
      (el as HTMLElement).setAttribute('data-sp-orig', t);
      el.setAttribute('data-sp-i18n', lang);
      el.textContent = hit[idx];
      budget--;
    }
  });
};

export const ChromeControls: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('sp-lang') as Lang) || 'en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('sp-theme') as any) || 'light');
  const booted = useRef(false);

  // language + dir
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = RTL.includes(lang) ? 'rtl' : 'ltr';
    root.setAttribute('data-lang', lang);
    localStorage.setItem('sp-lang', lang);
    applyLang(lang);
    if (!booted.current) return;
    // re-apply after route transitions
    const t = setTimeout(() => applyLang(lang), 120);
    return () => clearTimeout(t);
  }, [lang]);

  // theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sp-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#16060F' : '#F8F4E3');
  }, [theme]);

  // translation + reveal on route changes
  useEffect(() => {
    booted.current = true;
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (lang !== 'en') {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => applyLang(lang));
      }
      scanReveal();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scanReveal();
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const options: Array<[Lang, string]> = [['en', 'English'], ['ur', 'اردو'], ['hi', 'हिन्दी'], ['ar', 'العربية']];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" data-sp-i18n-skip>
      <label className="relative flex items-center">
        <Globe className="w-4 h-4 text-[#D4AF37] absolute left-2 sm:left-2.5 pointer-events-none" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          aria-label="Website language"
          className="appearance-none h-10 max-w-[104px] sm:max-w-none bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-bold rounded-xl pl-7 pr-5 sm:pl-8 sm:pr-6 lg:pl-7 lg:pr-5 xl:pl-8 xl:pr-6 cursor-pointer border border-[#D4AF37]/25 transition-colors focus:outline-none"
        >
          {options.map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2 text-[#D4AF37] text-[9px]">▾</span>
      </label>
      <button
        onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#E8C96A] border border-[#D4AF37]/25 transition-all"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
};

// ---------- scroll-reveal ----------
let io: IntersectionObserver | null = null;
export function scanReveal() {
  if (!('IntersectionObserver' in window)) return;
  // Phones / tablets: never gate content behind the observer. On mobile the
  // Prophecy Map & Interlinked Bible pillar cards were stuck at opacity:0
  // whenever the observer did not fire (tall single-column grid, -8% margin).
  if (window.matchMedia('(max-width: 1023.98px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const sibs = Array.from(el.parentElement?.children || []);
          const i = Math.max(0, sibs.indexOf(el));
          el.style.animationDelay = `${Math.min(i, 8) * 70}ms`;
          el.classList.add('sp-shown');
          io?.unobserve(el);
        }
      }
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0.01 });
  }
  // Safety net: anything still hidden 1.5s after arming is revealed regardless.
  window.setTimeout(() => {
    document.querySelectorAll('.sp-armed:not(.sp-shown)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.5) el.classList.add('sp-shown');
    });
  }, 1500);
  document.querySelectorAll('main section > div > h2, section .grid > div, section .grid > a, #videos .v-card, .hero-scrim > .pill, .hero-scrim h1').forEach((el) => {
    if ((el as HTMLElement).dataset.spReveal) return;
    (el as HTMLElement).dataset.spReveal = '1';
    (el as HTMLElement).classList.add('sp-armed');
    io?.observe(el);
  });
}

export default ChromeControls;
