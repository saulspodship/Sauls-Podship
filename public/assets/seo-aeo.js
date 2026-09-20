/* Saul's Podship — SEO / AEO / GEO injector (drop-in on every page)
   Usage: <script src="/assets/seo-aeo.js" defer></script>
   Adds, per route, without touching the existing UI:
   - JSON-LD structured data (FAQPage / Article / LearningResource / WebSite) for AEO,
   - GEO meta (geo.region PK, geo.placename, ICBM Karachi + worldwide copy),
   - a visible "Theological Inquiries" FAQ block + paragraphic summary prose,
     styled with the site's own tokens (wine/gold/cream, EB Garamond/Inter). */
(function(){
  var path=(location.pathname||'/').replace(/\/+$/,'')||'/';
  var DATA={
    '/':{
      para:"Saul’s Podship is a biblical ministry project presenting an interactive theological encyclopedia for believers and scholars worldwide: 50 peer-reviewed volumes from Eden to the New Jerusalem; a Biblical Prophecy Map tagging all 247 prophecies by historical, metaphorical and futurist fulfilment; the Kings of the Bible throne line from Jesus the King of Kings to the final Beast; 400 comparative apologetics questions across Islam, Judaism, Hinduism and Sikhism; and the living archive of Punjabi Zaboor hymnody — 150 Psalms in classical Punjabi meters — fulfilling the vision of worship in Spirit and Truth from Karachi to the nations.",
      faq:[
        ["What is Saul's Podship?","An interactive theological encyclopedia and digital ministry: 50 peer-reviewed volumes, the Biblical Prophecy Map, the Kings of the Bible throne line, 400 comparative apologetics questions, and the Punjabi Zaboor archive — freely accessible worldwide."],
        ["What do the fulfilment tags on the Prophecy Map mean?","Every one of the 247 prophecies carries three interpretive lenses — Historical (preterist/historicist reading), Metaphorical (idealist/spiritual reading) and Futurist (literal awaiting reading) — so you can see which school of theology counts each prophecy complete."],
        ["Who is the first King in the Kings of the Bible module?","Jesus the Messiah — King of Kings and Lord of Lords, the Alpha and the Omega — before Saul, David and Solomon; the line closes with the final counterfeit king, the Beast."],
        ["Is the Punjabi Zaboor archive complete?","Yes — the complete historical record of 150 biblical Psalms versified into Punjabi classical meters by Imam-ud-Din Shahbaz (1908), with the living archive of Pakistani gospel musicians."],
        ["Are the new biblical maps interactive?","Yes — eight journey maps with animated footsteps tracing Abraham, the Exodus, Paul, the Seven Churches and more, stop by stop."],
        ["Is Saul's Podship free?","Yes. Every volume, atlas, archive and podcast is freely accessible; the ministry is sustained by voluntary support and prayer."]
      ]
    },
    '/encyclopedia':{
      para:"The complete Scriptorium catalog: fifty peer-reviewed volumes across scholarly exegesis, historical theology, devotional, reference and hymnology categories — each with data tables, FAQs, timelines, original-language transliteration and complete scriptural references, with the companion modules routed at the bottom of every volume.",
      faq:[
        ["How many volumes are in the encyclopedia?","Fifty — 26 scholarly exegesis, 11 historical theology, 8 devotional & spiritual, 5 reference & canonical."],
        ["What are the companion modules?","The Biblical Prophecy Map, Kings of the Bible, the Interlinked Bible and Comparative Apologetics — interactive charts woven from the same scholarship, linked by routing buttons at the bottom of every volume."],
        ["Are the volumes free to read?","Yes — every volume, table and FAQ is freely readable online."]
      ]
    },
    '/comparative-apologetics':{
      para:"A Christian’s guide to comparative apologetics: 400 of the hardest objections raised in dialogue with Islam, Judaism, Hinduism and Sikhism — 100 per tradition — each answered with context, primary sources, a fair statement of the other side, and a Christian response; searchable, sortable, and ranked by what is most asked in Pakistan & India.",
      faq:[
        ["How is the codex organized?","100 questions per tradition, each with Context, Mainstream Position & Primary Sources, Christian Apologetic Response, and Points for Respectful Discussion."],
        ["What is the method?","Represent other traditions accurately and charitably before answering — persuasion through honesty, not mockery; weak or fabricated hadith are never used as authoritative."],
        ["Can I search and sort the questions?","Yes — by book order, by most-asked in Pakistan & India, or A–Z."]
      ]
    },
    '/encyclopedia/biblical-maps':{
      para:"Biblical Maps, Volume 11: a visual atlas of sacred topography — the land bridge of Canaan, the Exodus spine, Paul’s 10,000 miles, the Jordan Rift — now with an interactive journey atlas whose footsteps walk each route, and the world map at the foot of the volume.",
      faq:[
        ["Why is geographical context vital for reading the Bible?","Revelation happened in real places: elevation, water and borderlands shape the meaning of campaigns, covenants and parables."],
        ["Where did the Exodus route travel?","Rameses → Succoth → the sea crossing → Sinai → Kadesh-barnea → Moab; the interactive map walks this spine."],
        ["How many missionary journeys did Paul make?","Three recorded journeys plus the voyage to Rome — over 10,000 miles."]
      ]
    }
  };
  var d=DATA[path]; if(!d) return;

  /* GEO */
  function meta(name,content){ var m=document.createElement('meta'); m.name=name; m.content=content; document.head.appendChild(m); }
  meta('geo.region','PK'); meta('geo.placename','Karachi, Pakistan — serving believers worldwide');
  meta('geo.position','24.8607;67.0011'); meta('ICBM','24.8607, 67.0011');

  /* AEO JSON-LD */
  var ld={"@context":"https://schema.org","@type":"FAQPage","mainEntity":d.faq.map(function(f){
    return {"@type":"Question","name":f[0],"acceptedAnswer":{"@type":"Answer","text":f[1]}};
  })};
  var sc=document.createElement('script'); sc.type='application/ld+json'; sc.textContent=JSON.stringify(ld);
  document.head.appendChild(sc);

  /* visible FAQ + prose, site tokens */
  var st=document.createElement('style');
  st.textContent='.sp-seo{--w:#4A152C;--g:#D4AF37;--gd:#B5952F;--c:#F8F4E3;--p:#FFFDF6;--l:#E3D8BD;--m:#7a6a5f;max-width:1100px;margin:40px auto 60px;padding:0 20px;text-align:center;font-family:Inter,"Segoe UI",sans-serif}'+
  '.sp-seo .kick{display:inline-block;border:1px solid var(--g);padding:4px 16px;font-size:9px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--gd)}'+
  '.sp-seo h2{font-family:"Merriweather",Georgia,serif;color:var(--w);font-size:1.5rem;margin:12px 0 10px}'+
  '.sp-seo .para{font-family:"EB Garamond",Georgia,serif;font-style:italic;color:var(--m);max-width:860px;margin:0 auto 20px;line-height:1.7;font-size:1rem}'+
  '.sp-seo details{background:var(--p);border:1px solid var(--l);border-radius:6px;padding:12px 18px;margin:8px auto;max-width:860px;text-align:left}'+
  '.sp-seo summary{font-weight:700;font-size:13px;color:var(--w);cursor:pointer;text-align:center}'+
  '.sp-seo details p{margin:10px 0 4px;font-size:13px;color:#4a4038;line-height:1.7}'+
  '.sp-seo .fallback-notice{color:#d32f2f;font-weight:bold;margin-bottom:15px;}'+
  '.sp-seo .fallback-links{display:flex;gap:15px;justify-content:center;flex-wrap:wrap;}'+
  '.sp-seo .fallback-links a{color:var(--w);text-decoration:underline;}';
  document.head.appendChild(st);

  function injectFAQ(isFallback) {
    if (document.querySelector('.sp-seo')) return; // Idempotency guard
    var sec = document.createElement('section'); 
    sec.className = 'sp-seo';
    
    if (isFallback) {
      sec.innerHTML = '<div class="fallback-notice">Site is taking longer than usual to load.</div>' +
        '<div class="fallback-links">' +
        '<a href="/encyclopedia">Encyclopedia</a>' +
        '<a href="/videos/">Videos</a>' +
        '<a href="/kings-of-the-bible.html">Kings of the Bible</a>' +
        '</div>';
    } else {
      sec.innerHTML = '<span class="kick">Theological Inquiries</span><h2>Frequently Asked Questions</h2><p class="para">' + d.para + '</p>' +
        d.faq.map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>';}).join('');
    }

    var main = document.querySelector('main');
    var root = document.getElementById('root');
    var target = main || root || document.body;
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode === target) target.insertBefore(sec, footer); else target.appendChild(sec);
  }

  var elapsed = 0;
  var interval = setInterval(function() {
    elapsed += 150;
    var root = document.getElementById('root');
    var hasAppRendered = (root && root.children.length > 0) || document.querySelector('main') || document.querySelector('footer');
    
    if (hasAppRendered) {
      clearInterval(interval);
      injectFAQ(false);
    } else if (elapsed >= 5000) {
      clearInterval(interval);
      injectFAQ(true);
    }
  }, 150);
})();
