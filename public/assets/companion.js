/* Saul's Podship — Companion Module retrofit (drop-in for ALL 51 volume pages)
   Usage: <script src="/assets/companion.js" defer></script> in the volume template.
   Per the 2026-09-08 spec: removes the companion "view" cards and renders plain
   ROUTING BUTTONS at the BOTTOM of the content, styled with the site's own tokens
   (wine #4A152C / gold #D4AF37 / Inter). Does not touch any other UI. */
(function(){
  /* Fast path: the React volume page renders <section id="companion-modules">
     with its own "Companion Modules" eyebrow. The old implementation scanned
     EVERY h2/h3/h4/div/span/p and read .textContent off each one — on a long
     volume that is hundreds of thousands of characters re-serialised four
     times (300 ms / 1.2 s / 3 s / SPA repaints) and was a visible main-thread
     stall. Headings only, and never more than once. */
  var DONE='data-companion-routes-done';
  function findCompanion(){
    var host=document.getElementById('companion-modules');
    if(host){
      /* The React panel labels itself with an eyebrow <span>/<h2>. Look only
         inside that one small section — never the whole document. */
      var kids=host.querySelectorAll('span,h2,h3,h4');
      for(var k=0;k<kids.length;k++){
        if(/companion modules/i.test((kids[k].textContent||'').trim())) return kids[k];
      }
      return host;
    }
    var nodes=document.querySelectorAll('h2,h3,h4');
    for(var i=0;i<nodes.length;i++){
      var t=(nodes[i].textContent||'').trim();
      if(/^Companion Modules$/i.test(t)) return nodes[i];
    }
    return null;
  }
  function btn(t){
    var a=document.createElement('a');
    a.href=t.href; a.textContent=t.label;
    a.style.cssText='display:inline-flex;align-items:center;gap:8px;font-family:Inter,"Segoe UI",sans-serif;font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:12px 20px;border-radius:4px;text-decoration:none;background:#4A152C;color:#D4AF37;border:1px solid #4A152C';
    return a;
  }
  function run(){
    if(document.documentElement.hasAttribute(DONE)) return; /* once per page */
    var head=findCompanion(); if(!head) return;
    if(document.querySelector('[data-companion-routes]')) return; /* idempotent */
    /* Only replace the SMALL companion panel: climb until we find the first
       ancestor that contains 2+ links, and never accept anything that also
       contains the volume grid / hero / more than 12 links (the page shell). */
    var sec=null, cur=head;
    for(var up=0; up<5 && cur.parentElement; up++){
      cur=cur.parentElement; var n=cur.querySelectorAll('a').length;
      if(n>=2){ if(n<=12 && !cur.querySelector('main, #volume-hero, h1')) sec=cur; break; }
    }
    if(!sec) return; /* unknown layout — do nothing rather than break the page */
    var bar=document.createElement('div');
    bar.setAttribute('data-companion-routes','1');
    bar.style.cssText='display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin:34px auto 12px;text-align:center;max-width:1100px';
    var label=document.createElement('div');
    label.style.cssText='width:100%;font-family:Inter,sans-serif;font-size:10px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:#B5952F';
    label.textContent='Companion Modules';
    bar.appendChild(label);
    [ {href:'/prophecy-map',label:'Biblical Prophecy Map'},
      {href:'/cross-references',label:'The Interlinked Bible'},
      {href:'/comparative-apologetics',label:'Comparative Apologetics'} ]
      .forEach(function(t){ bar.appendChild(btn(t)); });
    sec.parentElement.insertBefore(bar, sec); /* same place, as plain routing buttons */
    /* Hide, do not remove: this node belongs to React's tree, and deleting it
       makes a later re-render of the same page throw NotFoundError. */
    document.documentElement.setAttribute(DONE,'1');
    if(sec.id==='companion-modules'){ sec.style.display='none'; }
    else { try{ sec.style.display='none'; }catch(e){} }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(run,300)});
  else setTimeout(run,300);
  /* SPA repaints: watch for the app flag instead of re-scanning on a timer. */
  window.addEventListener('sp-app-ready', function(){ setTimeout(run, 60); }, { once: true });
})();
