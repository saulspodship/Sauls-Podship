/* Saul's Podship — logo sync + official header injector + hero banner system
   Loaded in the global SPA template AND on standalone module shells.
   - Syncs brand assets (favicon / apple-touch-icon / OG image) on every page.
   - Injects the official centered site header (logo + nav, NO YouTube /
     Browse-50-Volumes) where it is missing: Comparative Apologetics, any
     #sp-header mount, and standalone module shells (never when iframed).
   - Responsive Divi-style hero banners: any [data-hero] element receives a
     cover background + scrim; mobile = landscape crop with text at bottom. */
(function(){
  var path=(location.pathname||'');
  var inFrame=(function(){ try{ return window.self!==window.top; }catch(e){ return true; } })();

  /* ---- logo sync on every page ---- */
  function link(rel,href,sizes){
    var l=document.createElement('link'); l.rel=rel; l.href=href; if(sizes) l.sizes=sizes;
    document.head.appendChild(l);
  }
  if(!document.querySelector('link[rel="icon"]')) link('icon','/icons/favicon.png');
  if(!document.querySelector('link[rel="shortcut icon"]')) link('shortcut icon','/icons/favicon.png');
  if(!document.querySelector('link[rel="apple-touch-icon"]')) link('apple-touch-icon','/icons/apple-touch-icon.png','180x180');
  function og(prop,href){ var m=document.createElement('meta'); m.setAttribute(prop.startsWith('tw')?'name':'property',prop); m.content=href; document.head.appendChild(m); }
  if(!document.querySelector('meta[property="og:image"]')) og('property:og:image','https://www.saulspodship.com/icons/brand-logo.png');
  if(!document.querySelector('meta[name="twitter:image"]')) og('tw:twitter:image','https://www.saulspodship.com/icons/brand-logo.png');

  /* ---- responsive hero banner system (every page this script loads on) ---- */
  var hs=document.createElement('style');
  hs.textContent=
    '[data-hero]{position:relative;overflow:hidden;background-size:cover;background-position:center;background-color:#1A0812}'+
    '[data-hero] .sp-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,8,18,.60) 0%,rgba(26,8,18,.30) 45%,rgba(26,8,18,.82) 100%);pointer-events:none}'+
    '[data-hero]>*:not(.sp-hero-scrim){position:relative}'+
    '@media (min-width:768px){[data-hero]{min-height:340px}}'+
    '@media (max-width:767px){[data-hero]{min-height:200px;display:flex;flex-direction:column;justify-content:flex-end}}';
  document.head.appendChild(hs);
  function wireHero(){
    var els=document.querySelectorAll('[data-hero]');
    for(var i=0;i<els.length;i++){ var el=els[i];
      if(el.__spHero) continue; el.__spHero=1;
      el.style.backgroundImage='url("'+el.getAttribute('data-hero')+'")';
      var sc=document.createElement('div'); sc.className='sp-hero-scrim';
      el.insertBefore(sc,el.firstChild);
    }
  }
  function initHero(){ if(document.body) wireHero(); else document.addEventListener('DOMContentLoaded',wireHero); setTimeout(wireHero,900); setTimeout(wireHero,2600); }
  initHero();

  /* ---- header injection ---- */
  /* Nav taxonomy — mirrors src/config/nav.ts (keep the two in sync).
     URL prefixes used below:
       '~'     → a real static file, linked as-is
       'http…' → off-site (social channels, Patreon, our campus subdomains)
       '/path' → an app route. The SPA runs on a HASH router, so from a static
                 shell these are emitted as /#/path — a bare '/encyclopedia'
                 would load the app on its home page instead. */
  var GROUPS=[
    ['encyclopedia','Encyclopedia','51 peer-reviewed volumes',[
      ['Browse by discipline',[
        ['All Volumes Index','/encyclopedia','The complete catalogue, searchable','51'],
        ['Scholarly Exegesis','/encyclopedia?category=scholarly','Doctrines, texts and hard passages','26'],
        ['Historical Theology','/encyclopedia?category=history','Councils, crusades, cultures','11'],
        ['Devotional & Spiritual','/encyclopedia?category=devotional','Prayer, worship, discipleship','8'],
        ['Reference & Canonical','/encyclopedia?category=reference','Charts, chronologies, canon data','6']
      ]],
      ['Most opened',[
        ['All Bible Stories','/encyclopedia/all-bible-stories','The metanarrative in one map','Vol 01'],
        ['Names of God','/encyclopedia/names-of-god','Every divine name, charted','Vol 30'],
        ['Messianic Prophecies','/encyclopedia/messianic-prophecies','OT promises, NT fulfilment','Vol 29'],
        ['Early Church Fathers & Councils','/encyclopedia/early-church-fathers-councils','Nicaea to Chalcedon','Vol 18']
      ]],
      ['Answers & codices',[
        ['Theological Archive','/theological-archive','1,000 answered questions with citations','1000'],
        ['Comparative Apologetics','/comparative-apologetics','400 questions on four faiths','400'],
        ['Kings of the Bible','/kings-of-the-bible','The throne line, Saul to the Herods','Vol 51']
      ]]
    ]],
    ['tools','Study Tools','Interactive atlases & concordances',[
      ['Maps & atlases',[
        ['Biblical Prophecy Map','/prophecy-map','247 prophecies on a rotatable 3D globe'],
        ['The Interlinked Bible','/cross-references','344,799 cross-reference threads'],
        ['Biblical Maps Atlas','~/encyclopedia/biblical-maps-atlas.html','Eight animated journey maps (Vol 11)'],
        ['World Religion Map','~/world-religion-map/index.html','Faiths and populations by nation']
      ]],
      ['Scriptorium tools',[
        ['Scriptorium AI Studio','/studio','Research engine, hymn composer, manuscripts'],
        ['Scholarly Standards','/scholarly-standards','Sources, citations, corrections policy'],
        ['HTML Site Directory','/sitemap','Every page and volume in one list']
      ]]
    ]],
    ['media','Listen & Watch','Podcast, video and sacred music',[
      ['Audio & video',[
        ['Theological Podcast','/podcast','Long-form episodes, one doctrine at a time'],
        ['Bible Video Library','~/videos/','Illustrated documentary series'],
        ['Official YouTube','https://www.youtube.com/@TheSaulsPodship','Sermons, debates and visual studies']
      ]],
      ['Music & Zaboor',[
        ['Sacred Music Hub','/music','Hymnody, Masihi geet and the media shelf'],
        ['Punjabi Zaboor','/music/punjabi-zaboor','All 150 Psalms in Punjabi meter','150'],
        ['Pakistani Singers Archive','/music/pakistani-singers-archive','Geet pioneers and discographies'],
        ['Punjabi Zaboor Society','https://punjabizaboor.org/','The independent psalter archive']
      ]]
    ]],
    ['academy','Academy','Saul’s schools — separate campuses',[
      ['Our subdomains',[
        ['Sunday School','https://saulssundayschool.saulspodship.com/','Lesson plans, activities and quizzes for every age','Subdomain'],
        ['Biblical Languages','https://biblicallanguages.saulspodship.com/','Hebrew, Aramaic and Greek drills and lexicons','Subdomain']
      ]],
      ['Course material from the archive',[
        ['Original Scripture Languages','/encyclopedia/original-scripture-languages','Alphabets, scripts and manuscripts','Vol 35'],
        ['Guide to Christian Living','/encyclopedia/guide-to-christian-living','A discipleship curriculum','Vol 22'],
        ['Ten Commandments & OT Laws','/encyclopedia/ten-commandments-ot-laws','The law, line by line','Vol 43'],
        ['1-Year Sermon Guide','/encyclopedia/1-year-sermon-guide-52-gen-z-topics','52 weeks of series outlines','Vol 50']
      ]]
    ],'Each campus is its own site on a saulspodship.com subdomain — it opens in its own tab.'],
    ['ministry','Ministry','The people, the purse and the paperwork',[
      ['The Podship',[
        ['About the Ministry','/about','Mission, founder and the Scriptorium story'],
        ['Partnership & Mission','/support','How the work is funded'],
        ['Support on Patreon','https://www.patreon.com/solatnadeem','Partners keep the volumes free'],
        ['Contact & Submissions','/contact','Questions, corrections, guest papers']
      ]],
      ['Help & writing',[
        ['Frequently Asked Questions','/faq','Permissions and Bible use'],
        ['The Goshsays Blog','https://goshsays.blogspot.com/','Long-form articles and notes']
      ]],
      ['Legal',[
        ['Privacy Policy','/privacy','What the site stores'],
        ['Terms of Service','/terms','Use, reuse and attribution'],
        ['Theological Disclaimer','/disclaimer','Confessional stance and limits']
      ]]
    ]]
  ];
  function href(u){ return u.charAt(0)==='~' ? u.slice(1) : (/^https?:/i.test(u) ? u : '/#'+u); }
  function host(u){ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(e){ return ''; } }
  function isCur(h){
    if(/^https?:/i.test(h)) return false;
    var p=(location.pathname||'')+(location.hash||'');
    if(p===h) return true;
    var clean=h.replace(/^\/#/,'');
    if(location.hash==='#'+clean) return true;
    if(clean && clean!=='/' && (location.pathname||'').indexOf(clean.replace(/\.html$/,''))===0) return true;
    return false;
  }

  /* the standalone module shells that get this header (unchanged from before) */
  var shell=/^\/(cross-references|prophecy-map|kings-of-the-bible|biblical-maps|world-religion-map|encyclopedia\/biblical-maps-atlas)/.test(path)
         || /\/(prophecy-map|kings-of-the-bible)\.html$/.test(path);
  var spa=!!document.getElementById('root');
  var needs=document.getElementById('sp-header') || (!spa && !inFrame && (shell || /^\/comparative-apologetics/.test(path)));
  if(!needs) return;
  var st=document.createElement('style');
  st.textContent=
  '.sp-hdr{position:sticky;top:0;z-index:300;background:rgba(22,6,15,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(212,175,55,.2);box-shadow:0 2px 12px rgba(0,0,0,.35);font-family:Inter,"Segoe UI",system-ui,sans-serif;color:#fff;text-align:left}'+
  '.sp-hdr .row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 16px;max-width:1280px;margin:0 auto;min-height:56px}'+
  '.sp-hdr .brand{display:flex;align-items:center;gap:10px;text-decoration:none;min-width:0}'+
  '.sp-hdr .brand img{height:44px;width:44px;object-fit:contain;display:block;filter:drop-shadow(0 2px 8px rgba(0,0,0,.45))}'+
  '.sp-hdr .brand b{font-family:"EB Garamond","Merriweather",Georgia,serif;font-size:16px;color:#fff;display:block;line-height:1.15;white-space:nowrap}'+
  '.sp-hdr .brand small{display:block;font-size:9px;letter-spacing:.18em;color:rgba(212,175,55,.9);text-transform:uppercase;font-weight:600;white-space:nowrap}'+
  '.sp-hdr nav.nav{display:none;align-items:center;gap:2px;margin-left:auto}'+
  '.sp-hdr .grp{position:static}'+
  '.sp-hdr button.gb{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12px;font-weight:600;color:rgba(255,255,255,.82);background:transparent;border:1px solid transparent;border-radius:8px;padding:8px 11px;cursor:pointer;white-space:nowrap}'+
  '.sp-hdr button.gb:hover,.sp-hdr .grp:hover button.gb,.sp-hdr .grp:focus-within button.gb{color:#E8C96A;background:rgba(255,255,255,.09)}'+
  '.sp-hdr .grp.cur button.gb{color:#E8C96A}'+
  '.sp-hdr button.gb i{font-style:normal;display:inline-block;transition:transform .18s;opacity:.6;font-size:9px}'+
  '.sp-hdr .grp:hover button.gb i,.sp-hdr .grp.open button.gb i{transform:rotate(180deg)}'+
  '.sp-hdr .panel{display:none;position:absolute;left:0;right:0;top:100%;padding:8px 16px 18px;background:rgba(18,5,12,.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(212,175,55,.22);box-shadow:0 26px 54px -20px rgba(0,0,0,.85);z-index:320}'+
  '.sp-hdr .grp:hover .panel,.sp-hdr .grp.open .panel,.sp-hdr .grp:focus-within .panel{display:block}'+
  '.sp-hdr .phead{max-width:1120px;margin:0 auto 8px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(212,175,55,.85);font-weight:800}'+
  '.sp-hdr .panel-in{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px 22px;padding:14px 16px;border:1px solid rgba(212,175,55,.2);border-radius:14px;background:linear-gradient(160deg,#24101C,#16060F)}'+
  '.sp-hdr .col h4{margin:0 0 6px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.42);font-weight:700}'+
  '.sp-hdr .col ul{margin:0;padding:0;list-style:none}'+
  '.sp-hdr .col a{display:flex;align-items:flex-start;gap:9px;padding:7px 8px;border-radius:10px;text-decoration:none;color:#fff;border:1px solid transparent}'+
  '.sp-hdr .col a:hover{background:rgba(255,255,255,.07);border-color:rgba(212,175,55,.22)}'+
  '.sp-hdr .col a.on{background:#4A152C;border-color:rgba(212,175,55,.4)}'+
  '.sp-hdr .col a.campus{background:rgba(212,175,55,.1)}'+
  '.sp-hdr .col a .t{display:block;font-size:12.5px;font-weight:700;line-height:1.25}'+
  '.sp-hdr .col a .d{display:block;font-size:11px;font-weight:400;color:rgba(255,255,255,.55);line-height:1.35;margin-top:1px}'+
  '.sp-hdr .col a .g{margin-left:auto;flex:0 0 auto;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(212,175,55,.9);border:1px solid rgba(212,175,55,.3);border-radius:999px;padding:1px 6px;align-self:center;white-space:nowrap}'+
  '.sp-hdr .col a.campus .g{background:#D4AF37;color:#1A0812;border-color:#E8C96A}'+
  '.sp-hdr .note{max-width:1120px;margin:8px auto 0;font-size:11px;font-style:italic;color:rgba(255,255,255,.4);text-align:left}'+
  '.sp-hdr a.cta{font-size:12px;font-weight:700;color:#1A0812;background:#D4AF37;padding:8px 14px;border-radius:8px;text-decoration:none;white-space:nowrap}'+
  '.sp-hdr a.cta:hover{background:#E8C96A}'+
  '.sp-hdr .burger{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.1);border:0;color:#fff;cursor:pointer}'+
  '.sp-hdr .burger:hover{background:rgba(255,255,255,.2)}'+
  '.sp-hdr .burger svg{width:24px;height:24px}'+
  '.sp-hdr .drawer{display:none;background:#1A0812;border-bottom:1px solid rgba(212,175,55,.2);padding:10px 14px 22px;text-align:left}'+
  '.sp-hdr.open .drawer{display:block}'+
  '.sp-hdr details{border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.03);margin-bottom:6px;overflow:hidden}'+
  '.sp-hdr summary{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;font-size:14px;font-weight:700;color:#fff;list-style:none}'+
  '.sp-hdr summary::-webkit-details-marker{display:none}'+
  '.sp-hdr summary em{font-style:normal;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-left:auto}'+
  '.sp-hdr summary svg{width:16px;height:16px;color:#D4AF37;transition:transform .18s;flex:0 0 auto}'+
  '.sp-hdr details[open] summary svg{transform:rotate(180deg)}'+
  '.sp-hdr details[open] summary{color:#E8C96A}'+
  '.sp-hdr .dgrp{padding:0 10px 10px}'+
  '.sp-hdr .dgrp h5{margin:8px 4px 4px;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.4)}'+
  '.sp-hdr .dgrp a{display:flex;align-items:flex-start;gap:8px;padding:9px 8px;border-radius:10px;font-size:13px;font-weight:600;color:rgba(255,255,255,.9);text-decoration:none}'+
  '.sp-hdr .dgrp a:hover{background:rgba(255,255,255,.08)}'+
  '.sp-hdr .dgrp a.on{background:#4A152C;color:#E8C96A;border:1px solid rgba(212,175,55,.3)}'+
  '.sp-hdr .dgrp a .g{margin-left:auto;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:rgba(212,175,55,.85);border:1px solid rgba(212,175,55,.3);border-radius:999px;padding:1px 6px;white-space:nowrap}'+
  '@media (min-width:1024px){.sp-hdr nav.nav{display:flex}.sp-hdr .burger{display:none}.sp-hdr .drawer{display:none!important}.sp-hdr a.cta{display:inline-flex}}'+
  '@media (max-width:1023px){.sp-hdr a.cta{display:none}}'+
  '@media (prefers-reduced-motion:reduce){.sp-hdr button.gb i,.sp-hdr details[open] summary svg{transition:none}}'+
  '.sp-hdr ~ #sp-chrome-bar{display:none!important}';
  document.head.appendChild(st);

  var CARET='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function cell(it,cls){
    var label=it[0], h=href(it[1]), desc=it[2]||'', tag=it[3]||'';
    var off=/^https?:/i.test(h);
    var cur=isCur(h);
    var g=tag?'<span class="g">'+tag+'</span>':'';
    var ext=off?' \u2197':'';
    var k=(' '+(cls||'')+(cur?' on':'')+(tag==='Subdomain'?' campus':'')).trim();
    return '<li><a class="'+k+'" href="'+h+'"'+
      (off?' target="_blank" rel="noopener noreferrer"':'')+
      ' title="'+(desc||label).replace(/"/g,'&quot;')+'"><span><span class="t">'+label+ext+'</span>'+
      (desc?'<span class="d">'+desc+(off?' <span style="opacity:.4">'+host(h)+'</span>':'')+'</span>':'')+
      '</span>'+g+'</a></li>';
  }
  var navH='', drwH='';
  for(var gi=0; gi<GROUPS.length; gi++){
    var g=GROUPS[gi], secs=g[3], note=g[4]||'';
    var cols='', drw='';
    for(var si=0; si<secs.length; si++){
      var rows='';
      for(var ii=0; ii<secs[si][1].length; ii++){ rows+=cell(secs[si][1][ii],''); drw+=cell(secs[si][1][ii],''); }
      cols+='<div class="col"><h4>'+secs[si][0]+'</h4><ul>'+rows+'</ul></div>';
      drw+='<div class="dgrp"><h5>'+secs[si][0]+'</h5>'+drw+'</div>';
    }
    var gcur=false;
    for(si=0;si<secs.length;si++){ for(ii=0;ii<secs[si][1].length;ii++){ if(isCur(href(secs[si][1][ii][1]))) gcur=true; } }
    navH+='<div class="grp'+(gcur?' cur':'')+'" data-grp="'+g[0]+'">'+
      '<button type="button" class="gb" aria-expanded="false" aria-controls="sp-panel-'+g[0]+'">'+g[1]+'<i>&#9662;</i></button>'+
      '<div class="panel" id="sp-panel-'+g[0]+'"><p class="phead">'+g[1]+' \u00b7 '+g[2]+'</p><div class="panel-in">'+cols+'</div>'+(note?'<p class="note">'+note+'</p>':'')+'</div>'+
      '</div>';
    drwH+='<details'+(gcur?' open':'')+'><summary><span>'+g[1]+'</span><em>'+g[2]+'</em>'+CARET+'</summary><div class="dwrap">'+drw+'</div></details>';
  }

  var hdr=document.createElement('header'); hdr.className='sp-hdr';
  hdr.innerHTML='<div class="row">'+
    '<a class="brand" href="/"><img src="/icons/emblem.png" alt="Saul\u2019s Podship logo"><span><b>Saul\u2019s Podship</b><small>Theological Encyclopedia</small></span></a>'+
    '<nav class="nav" aria-label="Primary">'+navH+'<a class="cta" href="/#/support">Support</a></nav>'+
    '<button class="burger" type="button" aria-label="Toggle navigation menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>'+
    '</div>'+
    '<div class="drawer">'+drwH+'<div class="dgrp" style="padding-top:4px"><a href="/#/support"><span>Support the Ministry</span><span class="g">Give</span></a></div></div>';
  var mount=document.getElementById('sp-header');
  if(mount) mount.replaceWith(hdr); else document.body.insertBefore(hdr,document.body.firstChild);

  /* burger + tap-to-open dropdowns (hover handles the mouse, this handles touch) */
  var burger=hdr.querySelector('.burger');
  function setH(){ document.documentElement.style.setProperty('--sp-hdr-h', hdr.offsetHeight+'px'); }
  function closeGrps(except){
    var gs=hdr.querySelectorAll('.grp.open');
    for(var i2=0;i2<gs.length;i2++){ if(gs[i2]===except) continue; gs[i2].classList.remove('open'); gs[i2].querySelector('button.gb').setAttribute('aria-expanded','false'); }
  }
  burger.addEventListener('click',function(){
    var open=hdr.classList.toggle('open');
    burger.setAttribute('aria-expanded', open?'true':'false');
    burger.innerHTML=open
      ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    setH();
  });
  var gbs=hdr.querySelectorAll('button.gb');
  for(var bi=0; bi<gbs.length; bi++){
    (function(btn){
      btn.addEventListener('click',function(){
        var grp=btn.parentNode;
        var isOpen=grp.classList.contains('open');
        closeGrps(isOpen?null:grp);
        grp.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', !isOpen?'true':'false');
      });
    })(gbs[bi]);
  }
  hdr.querySelector('.drawer').addEventListener('click',function(e){ if(e.target.closest('a')){ hdr.classList.remove('open'); setH(); } });
  document.addEventListener('click',function(e){
    var inHdr=e.composedPath?e.composedPath().indexOf(hdr)>-1:hdr.contains(e.target);
    if(!inHdr){ closeGrps(null); if(hdr.classList.contains('open')){ hdr.classList.remove('open'); setH(); } }
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeGrps(null); hdr.classList.remove('open'); setH(); } });
  setH(); window.addEventListener('resize', setH); window.addEventListener('load', setH);
})();
