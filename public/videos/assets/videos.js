/* ============================================================
   Saul's Podship — Videos section logic
   Renders collections, latest carousel and the full link list
   from assets/videos-data.js. Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var D = window.SAULS_VIDEOS;
  if (!D) { console.warn('[sauls-videos] assets/videos-data.js missing'); return; }

  var CH = D.channel;
  var LIST_PAGE = 30;

  var state = { coll: 'all', q: '', shown: LIST_PAGE, lastList: [] };

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hqThumb(id) {
    return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  }

  function cleanTitle(t) {
    // Keep the full title but drop the leading "#N" (we show it as a number chip)
    return String(t).replace(/^\s*#\d+\s*[—–-]?\s*/, '');
  }

  function collLabel(v) {
    var out = [];
    (v.collections || []).forEach(function (k) {
      var c = D.collections.find(function (x) { return x.key === k; });
      if (c) out.push(c.label);
    });
    return out.join(' · ') || CH.name;
  }

  function publishedVideos() {
    return D.videos.slice().sort(function (a, b) { return a.channelOrder - b.channelOrder; });
  }

  function inCollection(v, key) {
    return key === 'all' || (v.collections || []).indexOf(key) !== -1;
  }

  /* ---------- video markup ---------- */

  function thumbHTML(v, withNum) {
    var num = withNum && v.n ? '<span class="thumb-num">#' + v.n + '</span>' : '';
    var dur = v.length ? '<span class="dur">' + esc(v.length) + '</span>' : '';
    return (
      '<span class="thumb">' + num +
      '<img loading="lazy" alt="" src="' + hqThumb(v.id) + '" ' +
      'onerror="this.alt=\' \';this.style.opacity=0">' +
      '<span class="play"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z"/></svg></span>' +
      dur + '</span>'
    );
  }

  function soonThumbHTML(label) {
    return (
      '<span class="thumb">' +
      '<span class="thumb-num" style="font-size:22px;opacity:.55">🔒</span>' +
      '</span>'
    );
  }

  /* ---------- latest rail ---------- */

  function renderRail() {
    var rail = document.getElementById('sp-rail');
    if (!rail) return;
    var latest = publishedVideos().slice(0, 8);
    var AVATAR = CH.avatarUrl || '/videos/assets/channel-avatar-64.png';
    rail.innerHTML = latest.map(function (v) {
      return (
        '<button class="v-card" data-id="' + v.id + '" aria-label="Play ' + esc(cleanTitle(v.title)) + '">' +
        thumbHTML(v, true) +
        '<span class="v-meta">' +
        '<span class="avatar" aria-hidden="true"><img src="' + AVATAR + '" alt="" onerror="this.remove();this.parentNode.textContent=\'SP\'"></span>' +
        '<span><span class="t">' + esc(cleanTitle(v.title)) + '</span>' +
        '<span class="c">' + esc(CH.name) + '</span></span>' +
        '</span></button>'
      );
    }).join('');
  }

  /* ---------- collections ---------- */

  function renderCollections() {
    var wrap = document.getElementById('sp-coll');
    if (!wrap) return;
    var cards = [];

    D.collections.forEach(function (c) {
      if (c.key === 'all') return;
      var vids = D.videos.filter(function (v) { return inCollection(v, c.key) && v.id; });
      var total = c.totalOnYouTube || vids.length;
      var strip = [0, 1, 2].map(function (i) {
        var v = vids[i];
        return v
          ? '<span class="sq"><img loading="lazy" alt="" src="' + hqThumb(v.id) + '" onerror="this.style.opacity=0"><i>' + (v.n || '') + '</i></span>'
          : '<span class="sq"><i>' + (i + 1) + '</i></span>';
      }).join('');
      var label = vids.length + (c.totalOnYouTube ? ' of ' + c.totalOnYouTube + ' episodes' : (total === 1 ? ' episode' : ' episodes'));
      if (c.comingSoon) label += ' · ' + c.comingSoon + ' coming soon';
      cards.push(
        '<button class="coll-card" data-coll="' + c.key + '" aria-pressed="' + (state.coll === c.key) + '">' +
        '<span class="rows-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h11M4 12h11M4 18h7M18 14l4 3-4 3"/></svg>' + total + '</span>' +
        '<h3>' + esc(c.label) + '</h3>' +
        '<p>' + esc(c.blurb) + '</p>' +
        '<span class="coll-strip">' + strip + '</span>' +
        '<span class="go">' + esc(label) +
        (c.playlist
          ? ' · <span class="go">View on YouTube ↗</span>'
          : '') +
        '</span></button>'
      );
    });

    wrap.innerHTML = cards.join('');
  }

  /* ---------- the link list ---------- */

  function currentList() {
    var q = state.q.trim().toLowerCase();
    var list = D.videos.filter(function (v) {
      if (!inCollection(v, state.coll)) return false;
      if (q && String(v.title).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    // keep Bible order (by episode number) inside a collection
    list.sort(function (a, b) { return (a.n || 9999) - (b.n || 9999); });

    var c = D.collections.find(function (x) { return x.key === state.coll; });
    if (c && c.comingSoon) {
      for (var i = 0; i < c.comingSoon; i++) {
        list.push({ soon: true, n: 68 + i + 1, collections: [c.key] });
      }
    }
    return list;
  }

  function rowHTML(v, i) {
    if (v.soon) {
      return (
        '<div class="row row--soon" aria-disabled="true">' +
        soonThumbHTML() +
        '<span class="row-main"><span class="t">Next episode in this collection</span>' +
        '<span class="m"><span class="soon-chip">COMING SOON</span><span>Publishes on YouTube when Saul drops it</span></span></span>' +
        '<span class="num">#' + v.n + '</span>' +
        '</div>'
      );
    }
    return (
      '<a class="row" href="https://www.youtube.com/watch?v=' + v.id + '" data-id="' + v.id + '" target="_blank" rel="noopener">' +
      thumbHTML(v, false) +
      '<span class="row-main"><span class="t">' + esc(cleanTitle(v.title)) + '</span>' +
      '<span class="m"><span class="tag">' + esc(collLabel(v)) + '</span>' +
      (v.length ? '<span>' + esc(v.length) + '</span>' : '') +
      '<span>Watch on YouTube ↗</span></span></span>' +
      '<span class="num">#' + (v.n || '·') + '</span>' +
      '<span class="ext"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>' +
      '</a>'
    );
  }

  function renderList() {
    var box = document.getElementById('sp-list');
    var info = document.getElementById('sp-count');
    if (!box) return;
    var list = currentList();
    state.lastList = list;
    var shown = list.slice(0, state.shown);

    box.innerHTML = shown.map(rowHTML).join('') ||
      '<p style="color:var(--muted);padding:18px 6px">No episodes match that search yet.</p>';

    var real = list.filter(function (v) { return !v.soon; }).length;
    var soon = list.length - real;
    if (info) {
      info.textContent = real + ' episode' + (real === 1 ? '' : 's') +
        (soon ? ' · ' + soon + ' coming soon' : '') +
        (state.coll !== 'all' ? ' in this collection' : ' on the channel');
    }
    var more = document.getElementById('sp-more');
    if (more) {
      var left = list.length - shown.length;
      more.innerHTML = left > 0
        ? '<button class="pill" id="sp-more-btn">Show ' + Math.min(LIST_PAGE, left) + ' more (' + left + ' left)</button>'
        : (state.shown > LIST_PAGE && list.length > LIST_PAGE
          ? '<span class="sp-footnote">That’s the whole collection — keep digging!</span>' : '');
      var btn = document.getElementById('sp-more-btn');
      if (btn) btn.addEventListener('click', function () {
        state.shown += LIST_PAGE; renderList();
      });
    }
  }

  /* ---------- modal player ---------- */

  var modal, frame, mTitle, mYt, mPrev, mNext, mUpNext;

  function findIndex(id) {
    for (var i = 0; i < state.lastList.length; i++) {
      if (!state.lastList[i].soon && state.lastList[i].id === id) return i;
    }
    return -1;
  }

  function openModal(id) {
    var i = findIndex(id);
    var v = i >= 0 ? state.lastList[i] : D.videos.find(function (x) { return x.id === id; });
    if (!v) return;
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1" title="' + esc(cleanTitle(v.title)) +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    mTitle.textContent = cleanTitle(v.title);
    mYt.href = 'https://www.youtube.com/watch?v=' + id;
    var canNav = i >= 0 && state.lastList.length > 1;
    mPrev.style.visibility = canNav ? 'visible' : 'hidden';
    mNext.style.visibility = canNav ? 'visible' : 'hidden';
    var nxt = canNav ? nextPlayable(i, 1) : null;
    mUpNext.textContent = nxt ? 'Up next: ' + cleanTitle(nxt.title) : '';
    mUpNext.dataset.id = nxt ? nxt.id : '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function nextPlayable(i, dir) {
    var n = state.lastList.length;
    for (var k = 1; k <= n; k++) {
      var j = (i + dir * k + n) % n;
      if (!state.lastList[j].soon) return state.lastList[j];
      if (k === n) break;
    }
    return null;
  }

  function closeModal() {
    modal.classList.remove('open');
    frame.innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ---------- events ---------- */

  function onClick(e) {
    var card = e.target.closest('[data-id]');
    if (card && card.closest('#sp-rail')) {
      e.preventDefault();
      openModal(card.getAttribute('data-id'));
      return;
    }
    var row = e.target.closest('a.row[data-id]');
    if (row) {
      // left click without modifiers -> play on site; ctrl/cmd/middle follow the link
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        openModal(row.getAttribute('data-id'));
      }
      return;
    }
    var cc = e.target.closest('.coll-card[data-coll]');
    if (cc) {
      var key = cc.getAttribute('data-coll');
      state.coll = (state.coll === key) ? 'all' : key;
      state.shown = LIST_PAGE;
      syncChips();
      renderCollections();
      renderList();
      document.getElementById('sp-list-card').scrollIntoView({ block: 'start' });
    }
  }

  function syncChips() {
    document.querySelectorAll('#sp-chips [data-coll]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-coll') === state.coll));
    });
  }

  function init() {
    // hero CTA hrefs (keep HTML template static for caching)
    document.querySelectorAll('[data-href="yt"]').forEach(function (a) { a.href = CH.url; });
    document.querySelectorAll('[data-href="subscribe"]').forEach(function (a) { a.href = CH.subscribeUrl; });

    var chips = document.getElementById('sp-chips');
    if (chips) {
      chips.innerHTML = D.collections.map(function (c) {
        return '<button class="chip" data-coll="' + c.key + '" aria-pressed="' + (c.key === 'all') + '">' +
          esc(c.label) + '</button>';
      }).join('');
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-coll]');
        if (!b) return;
        state.coll = b.getAttribute('data-coll');
        state.shown = LIST_PAGE;
        syncChips(); renderCollections(); renderList();
      });
    }

    var search = document.getElementById('sp-q');
    if (search) {
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          state.q = search.value; state.shown = LIST_PAGE; renderList();
        }, 160);
      });
    }

    renderRail();
    renderCollections();
    renderList();

    modal = document.getElementById('sp-modal');
    frame = document.getElementById('sp-frame');
    mTitle = document.getElementById('sp-m-title');
    mYt = document.getElementById('sp-m-yt');
    mPrev = document.getElementById('sp-m-prev');
    mNext = document.getElementById('sp-m-next');
    mUpNext = document.getElementById('sp-m-nextline');

    var gen = document.getElementById('sp-generated');
    if (gen) gen.textContent = 'Episode list synced from YouTube on ' + (D.generatedAt || '');

    document.addEventListener('click', onClick);

    document.getElementById('sp-m-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      var i = findIndex(currentModalId());
      if (e.key === 'ArrowRight') playRelative(i, 1);
      if (e.key === 'ArrowLeft') playRelative(i, -1);
    });
    mPrev.addEventListener('click', function () { playRelative(findIndex(currentModalId()), -1); });
    mNext.addEventListener('click', function () { playRelative(findIndex(currentModalId()), 1); });
    mUpNext.addEventListener('click', function () {
      if (mUpNext.dataset.id) openModal(mUpNext.dataset.id);
    });
  }

  function currentModalId() {
    var m = (frame.firstChild && frame.firstChild.src) || '';
    var idm = m.match(/embed\/([^?]+)/);
    return idm ? idm[1] : '';
  }

  function playRelative(i, dir) {
    if (i < 0) return;
    var v = nextPlayable(i, dir);
    if (v) openModal(v.id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
