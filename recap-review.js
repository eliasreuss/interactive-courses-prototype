/* ═══════════════════════════════════════════════════════════════════
   RECAP REVIEW — shared across the Learn hubs and My Courses.
   Self-contained: injects its own styles + markup. A finished course
   with a recap video gets a "Watch Recap" pill beside its type pill;
   the recap plays in a theatre dialog.
   Courses without a recap behave exactly as before.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Recap registry from recaps.js: course id → video. */
  var RECAPS = window.LEARN_RECAPS || {};

  /* Each solution's main button (.btn-start on its hub): background, text,
     and the text colour's RGB for the hover shadow. */
  var THEMES = {
    inventory: { bg: '#EEE0C3', fg: '#2C2416', shadow: '44, 36, 22' },
    products:  { bg: '#EDE0A6', fg: '#33290F', shadow: '51, 41, 15' },
    suppliers: { bg: '#E1DBEB', fg: '#221D2E', shadow: '34, 29, 46' },
    customers: { bg: '#E3E8D8', fg: '#222619', shadow: '34, 38, 25' },
    now:       { bg: '#DBE9FF', fg: '#1A2535', shadow: '26, 37, 53' },
    admin:     { bg: '#DBE9FF', fg: '#1A2535', shadow: '26, 37, 53' }
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function basename(path) {
    return String(path || '').split('?')[0].split('/').pop();
  }

  function fileFromHref(href) {
    var match = /[?&]course=([^&]+)/.exec(href || '');
    return match ? decodeURIComponent(match[1]) : '';
  }

  function recapFor(card) {
    if (!card.querySelector('.card-progress.completed')) return null;
    var byId = RECAPS[card.getAttribute('data-course-id')];
    if (byId) return byId;
    var file = basename(card.getAttribute('data-file') || fileFromHref(card.getAttribute('data-href')));
    for (var key in RECAPS) {
      if (RECAPS[key].file === file) return RECAPS[key];
    }
    return null;
  }

  function titleOf(card) {
    var el = card && card.querySelector('.course-title');
    return el ? el.textContent.trim() : 'this course';
  }

  function nextCardAfter(card) {
    var el = card.nextElementSibling;
    while (el && !(el.classList && el.classList.contains('course-card'))) el = el.nextElementSibling;
    return el;
  }

  /* The page's own card handler opens the course. Clicking the card with
     the interceptor bypassed reuses it, so every page keeps its own URLs. */
  var bypass = false;
  function openCourse(card) {
    bypass = true;
    try { card.click(); } finally { bypass = false; }
  }

  /* ── Styles ── */
  var ICON_PLAY_OUTLINE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11-7.2a.8.8 0 0 0 0-1.4l-11-7.2A.8.8 0 0 0 7 4.8z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_REPLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

  var CSS = [
    /* The card's thumbnail becomes the recap's video thumbnail */
    /* Watch Recap pill leads the card's top bar, before the type pill */
    '.rr-watch{display:inline-flex;align-items:center;gap:6px;margin:0 8px 0 0;padding:10px 14px;border:0;border-radius:100px;background:var(--rr-bg,#304642);font:inherit;font-size:13px;font-weight:600;line-height:1;color:var(--rr-fg,#F9F7F5);white-space:nowrap;pointer-events:auto;cursor:pointer;transition:background-color 150ms ease,transform 200ms cubic-bezier(0.25,1,0.5,1),box-shadow 200ms ease}',
    '.rr-watch svg{width:12px;height:12px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linejoin:round}',
    '.rr-watch:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(var(--rr-shadow,48, 70, 66),0.18)}',
    '.rr-watch:active{transform:none;box-shadow:none}',
    '.rr-watch:focus-visible{outline:2px solid var(--color-accent,#FF5A00);outline-offset:2px}',
    /* Course, Watch Recap, length and bookmark need about 355px. On tighter
       cards the course length goes first: the course is already finished,
       so it is the least useful thing on the bar. */
    '.course-card.rr-has-watch .card-type-pill{margin-right:auto}',
    '.course-card.rr-has-watch .card-top-bar{container-type:inline-size}',
    '@container (max-width:355px){.course-card.rr-has-watch .course-duration-pill{display:none}}',
    '@container (max-width:279px){.rr-watch-text{display:none}.rr-watch{padding:10px}}',
    '.rr-close{display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}',
    '.rr-close svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}',
    '.rr-label{font-size:11px;font-weight:600;line-height:1.4;letter-spacing:1.1px;text-transform:uppercase}',
    '.rr-theatre :focus-visible{outline:2px solid var(--color-accent,#FF5A00);outline-offset:2px}',

    /* Theatre */
    '.rr-theatre{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:clamp(16px,4vw,56px);box-sizing:border-box;border:0;background:transparent;color:#F9F7F5;font-family:"Poppins",sans-serif;overflow:auto}',
    '.rr-theatre[open]{display:grid;place-items:center}',
    '.rr-theatre::backdrop{background:#182421}',
    '.rr-stage{width:min(1280px,100%,calc((100vh - 2 * clamp(16px,4vw,56px) - 72px) * 16 / 9));min-width:min(100%,320px)}',
    '.rr-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:16px}',
    '.rr-bar .rr-label{color:rgba(249,247,245,0.55)}',
    '.rr-bar h2{margin:2px 0 0;font-size:22px;font-weight:600;line-height:30px;letter-spacing:-0.4px;color:#F9F7F5}',
    '.rr-theatre .rr-close{width:40px;height:40px;margin:0;border-radius:12px;background:rgba(249,247,245,0.08);color:#F9F7F5;flex-shrink:0}',
    '.rr-theatre .rr-close svg{width:18px;height:18px}',
    '.rr-theatre .rr-close:hover{background:rgba(249,247,245,0.16);color:#F9F7F5}',
    '.rr-frame{position:relative;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#F9F7F5;box-shadow:0 24px 64px rgba(10,18,16,0.45)}',
    '.rr-frame video{display:block;width:100%;height:100%;object-fit:contain;background:#F9F7F5}',
    '.rr-frame.is-loading::after{content:"";position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid rgba(48,70,66,0.35);animation:rrPulse 1.4s cubic-bezier(0.25,1,0.5,1) infinite;pointer-events:none}',
    '@keyframes rrPulse{0%{transform:scale(0.7);opacity:0.9}100%{transform:scale(1.25);opacity:0}}',
    '.rr-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:24px;text-align:center;background:#22332F;animation:rrFade 260ms cubic-bezier(0.25,1,0.5,1)}',
    '.rr-panel[hidden]{display:none}',
    '.rr-panel h3{margin:0;font-size:clamp(22px,1rem + 1.2vw,32px);font-weight:600;line-height:1.2;letter-spacing:-0.5px;color:#F9F7F5}',
    '.rr-panel p{margin:-12px 0 0;max-width:44ch;font-size:15px;line-height:22px;color:rgba(249,247,245,0.7)}',
    '.rr-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;max-width:100%}',
    '.rr-btn{display:inline-flex;align-items:center;gap:10px;max-width:100%;padding:13px 24px;border-radius:14px;border:1px solid rgba(249,247,245,0.32);background:transparent;font:inherit;font-size:15px;font-weight:500;line-height:20px;color:#F9F7F5;cursor:pointer;transition:background-color 150ms ease,border-color 150ms ease,transform 200ms cubic-bezier(0.25,1,0.5,1),box-shadow 200ms ease}',
    '.rr-btn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.rr-btn svg{width:16px;height:16px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.rr-btn:hover{background:rgba(249,247,245,0.08);border-color:rgba(249,247,245,0.5)}',
    '.rr-btn--primary{border-color:transparent;background:var(--color-accent,#FF5A00);color:#FFFDF9}',
    '.rr-btn--primary:hover{border-color:transparent;background:#D94E00;transform:translateY(-2px);box-shadow:0 4px 12px rgba(255,90,0,0.3)}',
    '.rr-theatre[open] .rr-stage{animation:rrIn 300ms cubic-bezier(0.25,1,0.5,1)}',
    '.rr-theatre[open]::backdrop{animation:rrFade 240ms ease-out}',
    '.rr-theatre.is-closing .rr-stage{animation:rrOut 160ms ease-in forwards}',
    '.rr-theatre.is-closing::backdrop{animation:rrFadeOut 180ms ease-in forwards}',
    '@keyframes rrIn{from{opacity:0;transform:translateY(12px) scale(0.985)}to{opacity:1;transform:none}}',
    '@keyframes rrOut{to{opacity:0;transform:scale(0.985)}}',
    '@keyframes rrFade{from{opacity:0}to{opacity:1}}',
    '@keyframes rrFadeOut{to{opacity:0}}',
    '@media (max-width:680px){.rr-theatre{padding:16px 0}.rr-frame.has-panel{aspect-ratio:auto}.rr-frame.has-panel video{display:none}.rr-frame.has-panel .rr-panel{position:relative;inset:auto;padding:40px 16px}.rr-bar{padding:0 16px}.rr-frame{border-radius:0}.rr-panel{gap:18px}.rr-panel p{display:none}.rr-actions{flex-direction:column;align-items:stretch;width:min(100%,320px)}.rr-btn{justify-content:center}}',
    '@media (prefers-reduced-motion:reduce){.rr-watch:hover{transform:none}.rr-btn--primary:hover{transform:none}.rr-theatre[open] .rr-stage,.rr-theatre.is-closing .rr-stage{animation-name:rrFade}.rr-theatre.is-closing .rr-stage{animation-name:rrFadeOut}.rr-frame.is-loading::after{animation:none;opacity:0.6}}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('rr-styles')) return;
    var style = document.createElement('style');
    style.id = 'rr-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Watch recap button ── */
  function themeStyle(recap) {
    var t = THEMES[recap.solution];
    return t ? ' style="--rr-bg:' + t.bg + ';--rr-fg:' + t.fg + ';--rr-shadow:' + t.shadow + '"' : '';
  }

  function enhanceCards() {
    document.querySelectorAll('.course-card:not([data-rr])').forEach(function (card) {
      card.setAttribute('data-rr', '');
      var recap = recapFor(card);
      var bar = card.querySelector('.card-top-bar');
      var typePill = bar && bar.querySelector('.card-type-pill');
      if (!recap || !typePill) return;
      card.classList.add('rr-has-watch');
      typePill.insertAdjacentHTML('beforebegin',
        '<button type="button" class="rr-watch"' + themeStyle(recap) + ' aria-label="Watch the recap of ' + escapeHtml(titleOf(card)) + ', ' + recap.length + '">' +
          '<span class="rr-watch-text">Watch Recap</span>' + ICON_PLAY_OUTLINE +
        '</button>');
    });
  }

  /* Hubs and My Courses re-render their grids with innerHTML, so new cards
     are picked up as they appear. */
  var enhanceQueued = false;
  function queueEnhance() {
    if (enhanceQueued) return;
    enhanceQueued = true;
    requestAnimationFrame(function () { enhanceQueued = false; enhanceCards(); });
  }

  /* ── Theatre ── */
  var theatre = null;
  var current = null; // { card, recap, returnFocus }

  function buildTheatre() {
    theatre = document.createElement('dialog');
    theatre.className = 'rr-theatre';
    theatre.setAttribute('aria-labelledby', 'rr-theatre-title');
    theatre.innerHTML =
      '<div class="rr-stage">' +
        '<div class="rr-bar"><div><span class="rr-label">Recap</span><h2 id="rr-theatre-title"></h2></div>' +
          '<button type="button" class="rr-close" data-rr="close-theatre" aria-label="Close recap">' + ICON_CLOSE + '</button></div>' +
        '<div class="rr-frame">' +
          '<video controls playsinline preload="metadata"></video>' +
          '<div class="rr-panel" data-rr-panel="end" hidden>' +
            '<h3>Recap complete</h3>' +
            '<div class="rr-actions"></div></div>' +
          '<div class="rr-panel" data-rr-panel="error" role="alert" hidden>' +
            '<h3>The recap couldn’t load</h3>' +
            '<p>Check your connection and try again, or go back into the course.</p>' +
            '<div class="rr-actions">' +
              '<button type="button" class="rr-btn" data-rr="retry">' + ICON_REPLAY + '<span>Try again</span></button>' +
              '<button type="button" class="rr-btn rr-btn--primary" data-rr="revisit-theatre"><span>Revisit the course</span></button>' +
            '</div></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(theatre);

    var video = theatre.querySelector('video');
    var frame = theatre.querySelector('.rr-frame');
    var loading = function () { frame.classList.add('is-loading'); };
    var ready = function () { frame.classList.remove('is-loading'); };
    video.addEventListener('loadstart', loading);
    video.addEventListener('waiting', loading);
    video.addEventListener('canplay', ready);
    video.addEventListener('playing', ready);
    video.addEventListener('ended', showEnd);
    video.addEventListener('error', showError);
    video.addEventListener('play', function () { setPanel(null); });

    theatre.addEventListener('cancel', function (e) { e.preventDefault(); closeTheatre(); });
    theatre.addEventListener('click', function (e) {
      if (e.target === theatre) { closeTheatre(); return; }
      var act = e.target.closest('[data-rr]');
      if (!act) return;
      var what = act.getAttribute('data-rr');
      if (what === 'close-theatre') closeTheatre();
      else if (what === 'replay' || what === 'retry') replay(what === 'retry');
      else if (what === 'revisit-theatre') leaveTo(current.card);
      else if (what === 'next') leaveTo(nextCardAfter(current.card));
    });
  }

  function setPanel(name) {
    theatre.querySelectorAll('[data-rr-panel]').forEach(function (p) {
      p.hidden = p.getAttribute('data-rr-panel') !== name;
    });
    theatre.querySelector('.rr-frame').classList.toggle('has-panel', !!name);
  }

  function showEnd() {
    var next = nextCardAfter(current.card);
    var actions = theatre.querySelector('[data-rr-panel="end"] .rr-actions');
    actions.innerHTML =
      '<button type="button" class="rr-btn" data-rr="replay">' + ICON_REPLAY + '<span>Replay</span></button>' +
      '<button type="button" class="rr-btn' + (next ? '' : ' rr-btn--primary') + '" data-rr="revisit-theatre"><span>Revisit the course</span></button>' +
      (next ? '<button type="button" class="rr-btn rr-btn--primary" data-rr="next"><span>Next: ' + escapeHtml(titleOf(next)) + '</span></button>' : '');
    setPanel('end');
    actions.querySelector('.rr-btn--primary').focus({ preventScroll: true });
  }

  function showError() {
    theatre.querySelector('.rr-frame').classList.remove('is-loading');
    setPanel('error');
    theatre.querySelector('[data-rr-panel="error"] .rr-btn--primary').focus({ preventScroll: true });
  }

  function replay(reload) {
    var video = theatre.querySelector('video');
    setPanel(null);
    if (reload) video.load();
    else video.currentTime = 0;
    playQuietly(video);
    video.focus({ preventScroll: true });
  }

  function playQuietly(video) {
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function openTheatre(card, recap) {
    if (!theatre) buildTheatre();
    current = { card: card, recap: recap, returnFocus: card.querySelector('.rr-watch') || card };
    theatre.querySelector('#rr-theatre-title').textContent = titleOf(card);
    var video = theatre.querySelector('video');
    setPanel(null);
    video.poster = recap.poster;
    video.src = recap.src;
    video.setAttribute('aria-label', 'Recap video: ' + titleOf(card));
    theatre.classList.remove('is-closing');
    document.documentElement.style.overflow = 'hidden';
    theatre.showModal();
    video.focus({ preventScroll: true });
    playQuietly(video);
  }

  function closeTheatre(after) {
    if (!theatre || !theatre.open || theatre.classList.contains('is-closing')) return;
    var video = theatre.querySelector('video');
    video.pause();
    var finish = function () {
      theatre.classList.remove('is-closing');
      theatre.close();
      video.removeAttribute('src');
      video.load();
      document.documentElement.style.overflow = '';
      if (after) after();
      else if (current && current.returnFocus) current.returnFocus.focus({ preventScroll: true });
    };
    if (reduceMotion.matches && !after) { finish(); return; }
    theatre.classList.add('is-closing');
    setTimeout(finish, after ? 120 : 180);
  }

  function leaveTo(card) {
    if (!card) return;
    closeTheatre(function () { openCourse(card); });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── Interception. Capture phase, so the page's own card handlers never
        see a press on the Watch recap button. ── */
  function onClick(e) {
    if (bypass) return;
    var button = e.target && e.target.closest && e.target.closest('.rr-watch');
    if (!button) return;
    e.preventDefault();
    e.stopPropagation();
    var card = button.closest('.course-card');
    var recap = card && recapFor(card);
    if (recap) openTheatre(card, recap);
  }

  function onKeydown(e) {
    // The cards' keydown handlers call preventDefault on Enter and Space,
    // which would swallow the button's own activation.
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.rr-watch')) {
      e.stopPropagation();
    }
  }

  function init() {
    injectStyles();
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);
    enhanceCards();
    new MutationObserver(queueEnhance).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
