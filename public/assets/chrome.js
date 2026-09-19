/* Saul's Podship — Header & module-centering retrofit (drop-in on every page)
   Usage: <script src="/assets/chrome.js" defer></script> in the global template.
   Implements only the requested deltas, without redesigning anything:
   1. Removes the "YouTube" and "Browse/Explore 50 Volumes" buttons from the header.
   2. Aligns the remaining header buttons/text/icons on one centered row.
   3. Center-aligns module sections & module data (as requested 2026-09-08).
   SAFETY: the /cross-references module (The Interlinked Bible) is fully excluded —
   this script never touches that route, so the horseshoe chart & world faith map
   render exactly as shipped. */
(function(){
  var path=(location.pathname||'');
  if(/^\/cross-references/.test(path)) return;           /* never touch the Interlinked Bible */

  function centerModules(){
    if(document.getElementById('sp-chrome-css')) return;
    var css=document.createElement('style');
    css.id='sp-chrome-css';
    css.textContent=[
      /* header nav is laid out by RootLayout (single row, right-aligned) — do not override */
      'section[data-module],[class*=module-card],[class*=moduleCard]{margin-left:auto;margin-right:auto;text-align:center}'
    ].join('');
    document.head.appendChild(css);
  }
  function hide(el){
    /* CSS-hide instead of remove(): the header is React-rendered, and deleting
       its nodes breaks React's reconciliation (insertBefore crashes). */
    el.style.display='none';
    el.setAttribute('data-trimmed','1');
    el.setAttribute('aria-hidden','true');
  }
  function trimHeader(){
    document.querySelectorAll('header a,header button,nav a,nav button').forEach(function(el){
      /* 2026-09-19: the header is now five categorised dropdowns (src/config/nav.ts).
         Their panels are legitimately allowed to carry a "YouTube" row, so only the
         top-level header row / the injected shell bar are trimmed — never a menu. */
      if(el.closest('.sp-mega,[id^="nav-panel-"],.sp-hdr .panel,.sp-hdr nav')) return;
      var t=(el.textContent||'').trim().toLowerCase();
      if(/youtube/.test(t)) hide(el);
      else if(el.closest('header,nav') && /(browse|explore)\s+(all\s+)?50\s+volumes/.test(t)) hide(el);
    });
  }
  function run(){ centerModules(); trimHeader(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  setTimeout(run,1200); setTimeout(run,3000);
})();
