/* Saul's Podship — app-style bottom navigation for STANDALONE static pages
   (Videos, singers archive, prerendered volume pages…). Mirrors the React
   BottomNav (Home · Questions · Volumes · Apologetics · Videos · More) so
   phones always have a way back. Never renders inside an iframe or ≥1024px. */
(function () {
  try { if (window.self !== window.top) return; } catch (e) { return; }
  if (document.getElementById('sp-bottom-nav')) return;
  var path = location.pathname || '/';
  var I = {
    home: '<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    q: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    scale: '<path d="M12 3v18"/><path d="M5 21h14"/><path d="M3 7h18"/><path d="M6 7l-3 7a3 3 0 0 0 6 0L6 7z"/><path d="M18 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>',
    video: '<path d="M15 10l4.6-2.6A1 1 0 0 1 21 8.3v7.4a1 1 0 0 1-1.4.9L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>'
  };
  var TABS = [
    ['/', 'Home', I.home], ['/theological-archive', 'Questions', I.q], ['/encyclopedia', 'Volumes', I.book],
    ['/comparative-apologetics', 'Apologetics', I.scale], ['/videos/', 'Videos', I.video]
  ];
  var MORE = [
    ['Study modules', [['/prophecy-map', 'Prophecy Map · Globe & Timeline'], ['/cross-references', 'Bible Links · Cross-References'], ['/kings-of-the-bible', 'Kings of the Bible · Volume 51'], ['/encyclopedia/biblical-maps-atlas.html', 'Biblical Maps Atlas']]],
    ['Listen & watch', [['/podcast', 'Podcast'], ['/music', 'Sacred Music & Zaboor'], ['/studio', 'Scriptorium Studio']]],
    ['Academy — our campuses', [['https://saulssundayschool.saulspodship.com', 'Sunday School'], ['https://biblicallanguages.saulspodship.com', 'Biblical Languages']]],
    ['Ministry', [['/scholarly-standards', 'Scholarly Standards'], ['/about', 'About Saul’s Podship'], ['https://www.patreon.com/saulspodship', 'Support on Patreon']]]
  ];
  function active(to) { return to === '/' ? path === '/' : path.indexOf(to.replace(/\/$/, '')) === 0; }
  function svg(d) { return '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }

  var css = document.createElement('style');
  css.textContent =
    '#sp-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(22,6,15,.95);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-top:1px solid rgba(212,175,55,.3);box-shadow:0 -6px 24px rgba(0,0,0,.35);padding-bottom:env(safe-area-inset-bottom);font-family:Inter,system-ui,sans-serif}' +
    '#sp-bottom-nav ul{display:grid;grid-template-columns:repeat(6,1fr);margin:0;padding:0;list-style:none}' +
    '#sp-bottom-nav a,#sp-bottom-nav button{position:relative;display:flex;height:60px;width:100%;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10.5px;font-weight:600;line-height:1;color:rgba(255,255,255,.7);text-decoration:none;background:none;border:0;cursor:pointer;font-family:inherit}' +
    '#sp-bottom-nav .on{color:#E8C96A}#sp-bottom-nav .on:before{content:"";position:absolute;top:0;left:22%;right:22%;height:2px;border-radius:0 0 3px 3px;background:#D4AF37}' +
    '#sp-bnav-sheet{position:fixed;inset:0;z-index:2147482999;display:none}#sp-bnav-sheet.open{display:block}' +
    '#sp-bnav-sheet .bd{position:absolute;inset:0;background:rgba(0,0,0,.55);border:0;width:100%;height:100%}' +
    '#sp-bnav-sheet .sh{position:absolute;left:0;right:0;bottom:calc(60px + env(safe-area-inset-bottom));max-height:72vh;overflow-y:auto;border-radius:24px 24px 0 0;background:#1A0812;border-top:1px solid rgba(212,175,55,.3);box-shadow:0 -10px 40px rgba(0,0,0,.5);text-align:left;font-family:Inter,system-ui,sans-serif}' +
    '#sp-bnav-sheet .hd{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;background:rgba(26,8,18,.95);border-bottom:1px solid rgba(255,255,255,.1)}' +
    '#sp-bnav-sheet .hd small{display:block;font-size:10px;font-weight:900;letter-spacing:.25em;text-transform:uppercase;color:#D4AF37}#sp-bnav-sheet .hd b{font-family:"EB Garamond",Georgia,serif;font-size:18px;color:#fff}' +
    '#sp-bnav-sheet .cl{height:36px;width:36px;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;border:0;display:inline-flex;align-items:center;justify-content:center}' +
    '#sp-bnav-sheet h4{margin:0;padding:14px 4px 8px;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.45)}' +
    '#sp-bnav-sheet .g{padding:0 16px 24px}#sp-bnav-sheet .g a{display:flex;align-items:center;gap:12px;margin:0 0 6px;padding:12px;border-radius:12px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.9);font-size:14px;font-weight:600;text-decoration:none}' +
    '#sp-bnav-sheet .g a.on{background:#4A152C;color:#E8C96A;border:1px solid rgba(212,175,55,.4)}' +
    'body{padding-bottom:calc(64px + env(safe-area-inset-bottom)) !important}' +
    '@media (min-width:1024px){#sp-bottom-nav,#sp-bnav-sheet{display:none !important}body{padding-bottom:0 !important}}';
  document.head.appendChild(css);

  var nav = document.createElement('nav'); nav.id = 'sp-bottom-nav'; nav.setAttribute('aria-label', 'Primary mobile navigation');
  var html = '<ul>';
  TABS.forEach(function (t) { html += '<li><a href="' + t[0] + '"' + (active(t[0]) ? ' class="on" aria-current="page"' : '') + '>' + svg(t[2]) + '<span>' + t[1] + '</span></a></li>'; });
  html += '<li><button type="button" id="sp-bnav-more" aria-haspopup="dialog" aria-expanded="false">' + svg(I.grid) + '<span>More</span></button></li></ul>';
  nav.innerHTML = html;

  var more = document.createElement('div'); more.id = "sp-bnav-sheet"; more.setAttribute('role', 'dialog'); more.setAttribute('aria-modal', 'true');
  var mh = '<button class="bd" type="button" aria-label="Close menu"></button><div class="sh"><div class="hd"><div><small>Saul’s Podship</small><b>Everything else</b></div><button class="cl" type="button" aria-label="Close">' + svg(I.x) + '</button></div><div class="g">';
  MORE.forEach(function (grp) { mh += '<h4>' + grp[0] + '</h4>'; grp[1].forEach(function (it) { var ext = it[0].indexOf('http') === 0; mh += '<a href="' + it[0] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + (!ext && active(it[0]) ? ' class="on"' : '') + '>' + it[1] + '</a>'; }); });
  mh += '</div></div>'; more.innerHTML = mh;

  document.body.appendChild(more); document.body.appendChild(nav);
  var btn = nav.querySelector('#sp-bnav-more');
  function set(o) { more.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); btn.innerHTML = svg(o ? I.x : I.grid) + '<span>More</span>'; btn.classList.toggle('on', o); document.body.style.overflow = o ? 'hidden' : ''; }
  btn.addEventListener('click', function () { set(!more.classList.contains('open')); });
  more.querySelector('.bd').addEventListener('click', function () { set(false); });
  more.querySelector('.cl').addEventListener('click', function () { set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });

  /* keep glued to the visual viewport when the browser pinch-zooms */
  var vv = window.visualViewport;
  if (vv) {
    var raf = 0;
    function place() {
      raf = 0; var s = vv.scale || 1;
      if (s <= 1.02 && Math.abs(vv.offsetTop) < 1) { nav.style.cssText = ''; return; }
      var h = nav.offsetHeight;
      nav.style.cssText = 'bottom:auto;left:' + vv.offsetLeft + 'px;width:' + vv.width + 'px;top:' + (vv.offsetTop + vv.height - h / s) + 'px;transform-origin:top left;transform:scale(' + (1 / s) + ')';
    }
    function on() { if (!raf) raf = requestAnimationFrame(place); }
    vv.addEventListener('resize', on); vv.addEventListener('scroll', on); window.addEventListener('scroll', on, { passive: true });
  }
})();
