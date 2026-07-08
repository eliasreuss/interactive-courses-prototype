/* ═══════════════════════════════════════════════════════════════════
   INACT PROFILE OVERLAY — shared across Inact Now & Inact Learn.
   Self-contained: injects its own styles + markup, intercepts clicks
   on any element pointing at profile.html and opens as a modal layer.
   Prototype only — no backend; state persists in localStorage.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── User + progress data ── */
  var USER_KEY = 'inact_profile_user';
  var TFA_KEY  = 'inact_profile_2fa';
  var MAIL_KEY = 'inact_profile_mailpref';

  function getUser() {
    try { var u = JSON.parse(localStorage.getItem(USER_KEY)); if (u && u.first) return u; } catch (e) {}
    return { first: 'Elias', last: 'Reuss', role: 'Super User', email: 'erc@inact.io' };
  }
  function saveUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function initials(u) { return (u.first[0] || '') + (u.last[0] || ''); }

  var PP = [
    { name: 'Inventory Management', courseIds: ['intro','double-abc','stock-policy','safety-stock','reorder-point','reorder-quantity'] },
    { name: 'Supplier Management',  courseIds: ['suppliers-intro','supplier-performance','spend-analysis','supplier-negotiation'] },
    { name: 'Inact Now Fundamentals', courseIds: ['now-intro','now-home','now-insights','now-actions','now-dashboards'] },
    { name: 'Super Users & Admins', courseIds: ['admin-intro','admin-standard','admin-custom','admin-manage'] }
  ];
  function pathPct(p) {
    var sum = 0, n = p.courseIds.length;
    for (var i = 0; i < n; i++) {
      var cid = p.courseIds[i];
      if (localStorage.getItem('course_' + cid + '_completed') === 'true') { sum += 100; continue; }
      var raw = localStorage.getItem('course_progress_' + cid);
      if (!raw) continue;
      try { var d = JSON.parse(raw); sum += d.completed ? 100 : (d.progress || 0); }
      catch (e) { if (raw === 'completed') sum += 100; }
    }
    return n ? Math.round(sum / n) : 0;
  }
  function learnStats() {
    var completed = 0, sumPct = 0;
    for (var i = 0; i < PP.length; i++) {
      var pct = pathPct(PP[i]);
      sumPct += pct;
      if (pct === 100) completed++;
    }
    return {
      lpDone: completed, lpTotal: PP.length,
      lpPct: Math.round((completed / PP.length) * 100),
      allPct: Math.round(sumPct / PP.length)
    };
  }

  var ACHIEVEMENTS = [
    { name: 'Inventory Management', img: 'Achievements/Inventory-Achievement.svg', earned: true },
    { name: 'Supplier Management',  img: 'Achievements/Supplier-Achievement.svg',  earned: true },
    { name: 'Inact Now Fundamentals', img: 'Achievements/Inact-Now-Fundamentals-Achievement.svg', earned: true },
    { name: 'Customer Management',  img: 'Achievements/Empty-Achievement.svg',     earned: false }
  ];

  /* ── Styles ── */
  var CSS = [
'#inact-profile-overlay { position: fixed; inset: 0; z-index: 3000; display: none; font-family: "Poppins", sans-serif; }',
'#inact-profile-overlay.is-open { display: block; }',
':where(#inact-profile-overlay, #inact-profile-overlay *) { box-sizing: border-box; margin: 0; padding: 0; }',
'.po-ico { display: inline-block; width: 17px; height: 17px; flex-shrink: 0; background-color: currentColor; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; }',
'.po-backdrop { position: absolute; inset: 0; background: rgba(23, 34, 32, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.35s ease; }',
'#inact-profile-overlay.is-visible .po-backdrop { opacity: 1; }',

'.po-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) translateY(16px) scale(0.97); width: min(1020px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); display: flex; background: #FBFAF8; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 50px rgba(20, 30, 28, 0.30), 0 60px 140px rgba(20, 30, 28, 0.35); opacity: 0; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease; }',
'#inact-profile-overlay.is-visible .po-panel { transform: translate(-50%, -50%); opacity: 1; }',

/* ── Rail ── */
'.po-rail { width: 248px; flex-shrink: 0; display: flex; flex-direction: column; padding: 26px 16px 18px; background: #304642; position: relative; overflow: hidden; }',
'.po-rail::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0); background-size: 22px 22px; pointer-events: none; }',
'.po-rail > * { position: relative; z-index: 1; }',
'.po-rail-id { display: flex; flex-direction: column; padding: 6px 12px 22px; }',
'.po-rail-id-top { display: flex; align-items: center; gap: 12px; }',
'.po-rail-id-avatar { width: 46px; height: 46px; border-radius: 50%; background: #D9EBFF; color: #1F5591; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; flex-shrink: 0; box-shadow: 0 0 0 4px rgba(255,255,255,0.10); }',
'.po-rail-id-meta { min-width: 0; }',
'.po-rail-id-name { font-size: 15.5px; font-weight: 700; color: #fff; letter-spacing: -0.3px; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
'.po-rail-id-mail { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
'.po-rail-pill { align-self: flex-start; margin-top: 12px; padding: 4px 12px; border-radius: 100px; background: rgba(255,255,255,0.13); font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,255,255,0.92); }',
'.po-rail-label { padding: 2px 12px 8px; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.38); }',
'.po-rail-item { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 12px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.72); font-family: inherit; font-size: 13.5px; font-weight: 500; text-align: left; cursor: pointer; transition: background 0.18s ease, color 0.18s ease; }',
'.po-rail-item .po-ico { opacity: 0.85; }',
'.po-rail-item:hover { background: rgba(255,255,255,0.07); color: #fff; }',
'.po-rail-item.is-active { background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; }',
'.po-rail-item { position: relative; }',
'.po-rail-sep { height: 1px; background: rgba(255,255,255,0.10); margin: 14px 12px; }',
'.po-rail-foot { margin-top: auto; padding-top: 14px; }',
'.po-logout { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 12px; border: none; border-radius: 8px; background: transparent; color: rgba(255,255,255,0.60); font-family: inherit; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: background 0.18s, color 0.18s; }',
'.po-logout .po-ico { width: 17px; height: 17px; }',
'.po-logout:hover { background: rgba(255, 106, 61, 0.14); color: #FFB396; }',

/* ── Content pane ── */
'.po-content { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #FBFAF8; background-image: radial-gradient(circle at 1px 1px, rgba(48,70,66,0.035) 1px, transparent 0); background-size: 24px 24px; }',
'.po-content-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px 0; }',
'.po-view-title { font-size: 21px; font-weight: 700; color: #304642; letter-spacing: -0.5px; }',
'.po-view-sub { font-size: 12.5px; color: #8A9A97; margin-top: 3px; }',
'.po-close { width: 36px; height: 36px; border: none; border-radius: 50%; background: rgba(48,70,66,0.07); color: #304642; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.18s, transform 0.18s; flex-shrink: 0; }',
'.po-close .po-ico { width: 15px; height: 15px; }',
'.po-close:hover { background: rgba(48,70,66,0.14); transform: rotate(90deg); }',
'.po-scroll { flex: 1; overflow-y: auto; padding: 22px 32px 32px; }',
'.po-scroll::-webkit-scrollbar { width: 10px; }',
'.po-scroll::-webkit-scrollbar-thumb { background: rgba(48,70,66,0.14); border-radius: 100px; border: 3px solid #FBFAF8; }',

'.po-view { display: none; }',
'.po-view.is-active { display: block; }',
'@keyframes poFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }',
'.po-view.is-active > * { animation: poFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }',
'.po-view.is-active > *:nth-child(2) { animation-delay: 0.06s; }',
'.po-view.is-active > *:nth-child(3) { animation-delay: 0.12s; }',
'.po-view.is-active > *:nth-child(4) { animation-delay: 0.18s; }',

/* ── Cards / shared ── */
'.po-card { background: #fff; border: 1px solid rgba(48,70,66,0.08); border-radius: 12px; padding: 22px 24px; box-shadow: 0 2px 8px rgba(48,70,66,0.05); }',
'.po-card + .po-card { margin-top: 14px; }',
'.po-card-title { font-size: 14.5px; font-weight: 600; color: #304642; letter-spacing: -0.2px; }',
'.po-card-sub { font-size: 12px; color: #8A9A97; margin-top: 2px; }',

'.po-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border: none; border-radius: 6px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; line-height: 1; transition: background 0.2s, box-shadow 0.22s, transform 0.22s cubic-bezier(0.22,1,0.36,1); }',
'.po-btn-primary { background: #FF5A00; color: #fff; box-shadow: 0 2px 8px rgba(255,90,0,0.22); }',
'.po-btn-primary:hover { background: #D94E00; box-shadow: 0 5px 16px rgba(255,90,0,0.34); transform: translateY(-1px); }',
'.po-btn-dark { background: #569068; color: #fff; }',
'.po-btn-dark:hover { background: #63a678; transform: translateY(-1px); }',
'.po-btn-ghost { background: transparent; color: #304642; box-shadow: inset 0 0 0 1.5px rgba(48,70,66,0.22); }',
'.po-btn-ghost:hover { background: rgba(48,70,66,0.05); }',
'.po-btn:disabled { opacity: 0.45; cursor: default; transform: none !important; box-shadow: none; }',

'.po-field { margin-top: 14px; }',
'.po-field label { display: block; font-size: 11.5px; font-weight: 600; color: #304642; letter-spacing: 0.02em; margin-bottom: 6px; }',
'.po-input, .po-select { width: 100%; padding: 10px 14px; border: 1.5px solid rgba(48,70,66,0.14); border-radius: 8px; font-family: inherit; font-size: 13.5px; color: #304642; background: #fff; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }',
'.po-input:focus, .po-select:focus { border-color: #304642; box-shadow: 0 0 0 3px rgba(48,70,66,0.10); }',
'.po-input::placeholder { color: #AEB9B6; }',
'.po-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }',
'.po-form-actions { margin-top: 18px; display: flex; justify-content: flex-end; gap: 10px; }',

/* ── Overview: learning-paths card header ── */
'.po-lp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }',
'.po-lp-stat { flex-shrink: 0; text-align: right; line-height: 1; }',
'.po-lp-stat span { display: block; font-size: 30px; font-weight: 700; color: #304642; letter-spacing: -0.8px; font-variant-numeric: tabular-nums; }',
'.po-lp-stat small { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A9A97; }',

/* ── Overview: two-column body ── */
'.po-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }',
'.po-overview-grid > .po-card { margin-top: 0; }',

/* ── Overview: learn progress ── */
'.po-learn-bar { height: 5px; border-radius: 100px; background: rgba(48,70,66,0.15); overflow: hidden; }',
'.po-learn-fill { height: 100%; width: 0%; border-radius: 100px; background: #304642; transition: width 0.9s cubic-bezier(0.22,1,0.36,1); }',
'.po-learn-row { margin-top: 16px; }',
'.po-learn-row:first-of-type { margin-top: 14px; }',
'.po-learn-row-label { font-size: 13.5px; color: rgba(48,70,66,0.85); margin-bottom: 7px; }',
'.po-learn-row-label strong { font-weight: 700; color: #304642; font-variant-numeric: tabular-nums; }',

/* ── Overview: achievements ── */
'.po-ach-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }',
'.po-ach-count { font-size: 12px; font-weight: 600; color: #8A9A97; }',
'.po-ach-count strong { color: #304642; font-size: 15px; }',
'.po-ach-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }',
'.po-ach { display: flex; flex-direction: column; align-items: center; gap: 9px; text-align: center; }',
'.po-ach-badge { display: flex; align-items: center; justify-content: center; width: 100%; height: 92px; }',
'.po-ach img { max-width: 92px; max-height: 92px; width: auto; height: auto; transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), filter 0.3s; }',
'.po-ach.earned img:hover { transform: translateY(-4px) scale(1.05) rotate(-2deg); filter: drop-shadow(0 10px 16px rgba(48,70,66,0.22)); cursor: pointer; }',
'.po-ach.locked img { filter: grayscale(1); opacity: 0.38; }',
'.po-ach span { font-size: 11px; font-weight: 500; color: #304642; line-height: 1.4; max-width: 130px; }',
'.po-ach.locked span { color: #AEB9B6; }',

/* ── 2FA ── */
'.po-2fa-status { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 100px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em; }',
'.po-2fa-status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; }',
'.po-2fa-status.off { background: rgba(214, 69, 55, 0.10); color: #C0392B; }',
'.po-2fa-status.off::before { background: #C0392B; }',
'.po-2fa-status.on { background: rgba(46, 125, 92, 0.12); color: #2E7D5C; }',
'.po-2fa-status.on::before { background: #2E7D5C; }',
'.po-2fa-head { display: flex; align-items: center; justify-content: space-between; }',
'.po-steps { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }',
'.po-step { display: flex; gap: 13px; align-items: flex-start; }',
'.po-step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(48,70,66,0.08); color: #304642; font-size: 11.5px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
'.po-step p { font-size: 13px; color: rgba(48,70,66,0.75); line-height: 1.55; padding-top: 2px; }',
'.po-step p strong { color: #304642; }',
'.po-auth-app { display: inline-flex; align-items: center; gap: 9px; margin-top: 7px; padding: 8px 14px 8px 9px; border-radius: 8px; background: rgba(31,85,145,0.07); font-size: 12.5px; font-weight: 600; color: #1F5591; }',
'.po-auth-app svg { width: 22px; height: 22px; }',
'.po-code-row { display: flex; gap: 8px; margin-top: 16px; }',
'.po-code { width: 44px; height: 52px; border: 1.5px solid rgba(48,70,66,0.16); border-radius: 8px; font-family: inherit; font-size: 20px; font-weight: 600; color: #304642; text-align: center; outline: none; background: #fff; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }',
'.po-code:focus { border-color: #FF5A00; box-shadow: 0 0 0 3px rgba(255,90,0,0.14); transform: translateY(-2px); }',
'.po-2fa-verify { margin-top: 16px; display: flex; gap: 10px; align-items: center; }',

/* ── Email prefs ── */
'.po-radio-card { display: flex; align-items: center; gap: 13px; padding: 15px 17px; border: 1.5px solid rgba(48,70,66,0.11); border-radius: 10px; cursor: pointer; transition: border-color 0.18s, background 0.18s; margin-top: 10px; }',
'.po-radio-card:hover { border-color: rgba(48,70,66,0.28); }',
'.po-radio-card.is-checked { border-color: #304642; background: rgba(48,70,66,0.035); }',
'.po-radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(48,70,66,0.28); flex-shrink: 0; position: relative; transition: border-color 0.18s; }',
'.po-radio-card.is-checked .po-radio-dot { border-color: #FF5A00; }',
'.po-radio-card.is-checked .po-radio-dot::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: #FF5A00; }',
'.po-radio-meta h4 { font-size: 13px; font-weight: 600; color: #304642; }',
'.po-radio-meta p { font-size: 11.5px; color: #8A9A97; margin-top: 2px; line-height: 1.5; }',

/* ── Logout confirm + toast ── */
'.po-confirm { position: absolute; inset: 0; z-index: 10; display: none; align-items: center; justify-content: center; background: rgba(251,250,248,0.88); backdrop-filter: blur(4px); border-radius: 14px; }',
'.po-confirm.is-open { display: flex; }',
'.po-confirm-box { background: #fff; border-radius: 12px; padding: 30px 34px; text-align: center; box-shadow: 0 20px 60px rgba(48,70,66,0.22); max-width: 340px; animation: poFadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }',
'.po-confirm-box h3 { font-size: 17px; font-weight: 700; color: #304642; letter-spacing: -0.3px; }',
'.po-confirm-box p { font-size: 12.5px; color: #8A9A97; margin-top: 7px; line-height: 1.55; }',
'.po-confirm-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }',

'.po-toast { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%) translateY(16px); background: #304642; color: #fff; font-size: 12.5px; font-weight: 500; padding: 11px 22px; border-radius: 100px; box-shadow: 0 10px 30px rgba(20,30,28,0.35); opacity: 0; pointer-events: none; transition: opacity 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1); z-index: 20; display: flex; align-items: center; gap: 8px; }',
'.po-toast .po-ico { width: 14px; height: 14px; background-color: #6FCF97; }',
'.po-toast.is-shown { opacity: 1; transform: translateX(-50%); }',

/* ── Responsive ── */
'@media (max-width: 860px) {',
'  .po-panel { width: 100vw; height: 100vh; max-height: none; border-radius: 0; flex-direction: column; }',
'  .po-rail { width: 100%; flex-direction: row; align-items: center; padding: 14px 16px; overflow-x: auto; gap: 4px; }',
'  .po-rail-id, .po-rail-label, .po-rail-sep { display: none; }',
'  .po-rail-item { width: auto; white-space: nowrap; padding: 9px 14px; }',
'  .po-rail-foot { margin: 0 0 0 auto; padding: 0; }',
'  .po-form-grid { grid-template-columns: 1fr; }',
'  .po-overview-grid { grid-template-columns: 1fr; }',
'}',
'@media (prefers-reduced-motion: reduce) { #inact-profile-overlay * { animation-duration: 0.001s !important; transition-duration: 0.001s !important; } }'
  ].join('\n');

  /* ── Icons (Tabler Icons — outline set, https://tabler.io/icons, MIT licensed).
     SVG files live in SVGs/tabler/ and are rendered as CSS masks so they inherit
     the surrounding text colour (matches the repo's mask-image icon convention). ── */
  function tablerIcon(name) {
    var url = "url('SVGs/tabler/" + name + ".svg')";
    return '<span class="po-ico" style="-webkit-mask-image:' + url + ';mask-image:' + url + '"></span>';
  }
  var I = {
    grid:   tablerIcon('layout-grid'),
    user:   tablerIcon('user'),
    shield: tablerIcon('shield-lock'),
    mail:   tablerIcon('mail'),
    out:    tablerIcon('logout'),
    x:      tablerIcon('x'),
    check:  tablerIcon('check'),
    /* Microsoft Authenticator brand logo — kept inline (not a Tabler icon). */
    msauth:'<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#1F5591"/><path d="M12 5.5 6.5 7.6v4.2c0 3.4 2.3 6 5.5 6.7 3.2-.7 5.5-3.3 5.5-6.7V7.6L12 5.5z" fill="#fff"/><circle cx="12" cy="10.6" r="1.7" fill="#1F5591"/><path d="M9.3 14.6c.3-1.2 1.4-2 2.7-2s2.4.8 2.7 2c-.7.8-1.7 1.3-2.7 1.5-1-.2-2-.7-2.7-1.5z" fill="#1F5591"/></svg>'
  };

  /* ── Markup ── */
  function buildHTML() {
    var u = getUser();
    var earned = ACHIEVEMENTS.filter(function (a) { return a.earned; }).length;

    var achHtml = ACHIEVEMENTS.map(function (a) {
      return '<div class="po-ach ' + (a.earned ? 'earned' : 'locked') + '">' +
        '<div class="po-ach-badge"><img src="' + a.img + '" alt="' + a.name + (a.earned ? ' — earned' : ' — not yet earned') + '"></div>' +
        '<span>' + a.name + '</span></div>';
    }).join('');

    return '' +
'<div class="po-backdrop"></div>' +
'<div class="po-panel" role="dialog" aria-modal="true" aria-label="Your profile">' +

  '<aside class="po-rail">' +
    '<div class="po-rail-id">' +
      '<div class="po-rail-id-top">' +
        '<div class="po-rail-id-avatar" data-bind="initials">' + initials(u) + '</div>' +
        '<div class="po-rail-id-meta">' +
          '<div class="po-rail-id-name" data-bind="fullname">' + u.first + ' ' + u.last + '</div>' +
          '<div class="po-rail-id-mail">' + u.email + '</div>' +
        '</div>' +
      '</div>' +
      '<span class="po-rail-pill">' + u.role + '</span>' +
    '</div>' +
    '<div class="po-rail-label">Your account</div>' +
    '<button class="po-rail-item is-active" data-view="overview">' + I.grid + 'Overview</button>' +
    '<button class="po-rail-item" data-view="account">' + I.user + 'Account settings</button>' +
    '<button class="po-rail-item" data-view="security">' + I.shield + 'Two-factor auth</button>' +
    '<button class="po-rail-item" data-view="email">' + I.mail + 'Email preferences</button>' +
    '<div class="po-rail-foot">' +
      '<button class="po-logout" id="po-logout">' + I.out + 'Log out</button>' +
    '</div>' +
  '</aside>' +

  '<div class="po-content">' +
    '<div class="po-content-head">' +
      '<div><div class="po-view-title" id="po-title">Overview</div><div class="po-view-sub" id="po-sub">Your learning progress across Inact</div></div>' +
      '<button class="po-close" aria-label="Close profile">' + I.x + '</button>' +
    '</div>' +
    '<div class="po-scroll">' +

      /* ── OVERVIEW ── */
      '<section class="po-view is-active" data-viewpane="overview">' +
        '<div class="po-overview-grid">' +
          '<div class="po-card">' +
            '<div class="po-lp-head">' +
              '<div><div class="po-card-title">All learning paths</div><div class="po-card-sub">Progress across every path</div></div>' +
              '<div class="po-lp-stat"><span id="po-all-pct">0%</span><small>complete</small></div>' +
            '</div>' +
            PP.map(function (p, i) {
              return '<div class="po-learn-row">' +
                '<div class="po-learn-row-label"><strong data-lp-pct="' + i + '">0%</strong> of ' + p.name.replace(/&/g, '&amp;') + '</div>' +
                '<div class="po-learn-bar"><div class="po-learn-fill" data-lp-fill="' + i + '"></div></div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="po-card">' +
            '<div class="po-ach-head"><div><div class="po-card-title">Achievements</div><div class="po-card-sub">Earned by completing paths</div></div>' +
            '<span class="po-ach-count"><strong>' + earned + '</strong> / ' + ACHIEVEMENTS.length + '</span></div>' +
            '<div class="po-ach-row">' + achHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      /* ── ACCOUNT ── */
      '<section class="po-view" data-viewpane="account">' +
        '<div class="po-card">' +
          '<div class="po-card-title">Your name</div><div class="po-card-sub">Shown across Inact Now and Inact Learn</div>' +
          '<div class="po-form-grid">' +
            '<div class="po-field"><label for="po-first">First name</label><input class="po-input" id="po-first" value="' + u.first + '"></div>' +
            '<div class="po-field"><label for="po-last">Last name</label><input class="po-input" id="po-last" value="' + u.last + '"></div>' +
          '</div>' +
          '<div class="po-form-actions"><button class="po-btn po-btn-dark" id="po-save-name">Save name</button></div>' +
        '</div>' +
        '<div class="po-card">' +
          '<div class="po-card-title">Change password</div><div class="po-card-sub">Use at least 8 characters</div>' +
          '<div class="po-field"><label for="po-oldpw">Old password</label><input type="password" class="po-input" id="po-oldpw" placeholder="••••••••"></div>' +
          '<div class="po-form-grid">' +
            '<div class="po-field"><label for="po-newpw">New password</label><input type="password" class="po-input" id="po-newpw" placeholder="••••••••"></div>' +
            '<div class="po-field"><label for="po-confpw">Confirm new password</label><input type="password" class="po-input" id="po-confpw" placeholder="••••••••"></div>' +
          '</div>' +
          '<div class="po-form-actions"><button class="po-btn po-btn-primary" id="po-save-pw">Update password</button></div>' +
        '</div>' +
      '</section>' +

      /* ── SECURITY / 2FA ── */
      '<section class="po-view" data-viewpane="security">' +
        '<div class="po-card">' +
          '<div class="po-2fa-head"><div><div class="po-card-title">Two-factor authentication</div><div class="po-card-sub">An extra layer of security for your account</div></div>' +
          '<span class="po-2fa-status off" id="po-2fa-status">Disabled</span></div>' +
          '<div class="po-steps">' +
            '<div class="po-step"><span class="po-step-num">1</span><p>Download an authenticator app on your mobile device. We suggest:<br><span class="po-auth-app">' + I.msauth + 'Microsoft Authenticator</span></p></div>' +
            '<div class="po-step"><span class="po-step-num">2</span><p>Press <strong>"Enable 2FA"</strong> and scan the QR code with your authenticator app.</p></div>' +
            '<div class="po-step"><span class="po-step-num">3</span><p>Enter the one-time passcode from the app to confirm. From then on you\'ll use a passcode every time you log in to Inact.</p></div>' +
          '</div>' +
          '<div id="po-2fa-setup" style="display:none">' +
            '<div class="po-code-row">' +
              '<input class="po-code" maxlength="1" inputmode="numeric"><input class="po-code" maxlength="1" inputmode="numeric"><input class="po-code" maxlength="1" inputmode="numeric"><input class="po-code" maxlength="1" inputmode="numeric"><input class="po-code" maxlength="1" inputmode="numeric"><input class="po-code" maxlength="1" inputmode="numeric">' +
            '</div>' +
            '<div class="po-2fa-verify"><button class="po-btn po-btn-primary" id="po-2fa-verify" disabled>Verify &amp; enable</button><button class="po-btn po-btn-ghost" id="po-2fa-cancel">Cancel</button></div>' +
          '</div>' +
          '<div class="po-form-actions" id="po-2fa-actions"><button class="po-btn po-btn-dark" id="po-2fa-enable">Enable 2FA</button></div>' +
        '</div>' +
      '</section>' +

      /* ── EMAIL PREFS ── */
      '<section class="po-view" data-viewpane="email">' +
        '<div class="po-card">' +
          '<div class="po-card-title">Email preferences</div><div class="po-card-sub">Choose how Inact keeps you posted</div>' +
          '<div class="po-radio-card" data-mail="none"><span class="po-radio-dot"></span><div class="po-radio-meta"><h4>Receive no emails</h4><p>You won\'t get any notifications by email.</p></div></div>' +
          '<div class="po-radio-card" data-mail="all"><span class="po-radio-dot"></span><div class="po-radio-meta"><h4>Receive email notifications</h4><p>An email for every notification — mentions, shared content and assigned actions.</p></div></div>' +
          '<div class="po-radio-card" data-mail="digest"><span class="po-radio-dot"></span><div class="po-radio-meta"><h4>Daily digest of unread notifications</h4><p>One summary email a day, only when you have unread notifications.</p></div></div>' +
          '<div class="po-form-actions"><button class="po-btn po-btn-dark" id="po-save-mail">Save preferences</button></div>' +
        '</div>' +
      '</section>' +

    '</div>' +
    '<div class="po-toast" id="po-toast">' + I.check + '<span id="po-toast-msg">Saved</span></div>' +
  '</div>' +

  '<div class="po-confirm" id="po-confirm">' +
    '<div class="po-confirm-box">' +
      '<h3>Log out of Inact?</h3>' +
      '<p>You\'ll be signed out of both Inact Now and Inact Learn on this device.</p>' +
      '<div class="po-confirm-actions"><button class="po-btn po-btn-ghost" id="po-confirm-cancel">Cancel</button><button class="po-btn po-btn-primary" id="po-confirm-yes">Log out</button></div>' +
    '</div>' +
  '</div>' +
'</div>';
  }

  /* ── Titles per view ── */
  var VIEW_META = {
    overview:   ['Overview', 'Your learning progress across Inact'],
    account:    ['Account settings', 'Update your name and password'],
    security:   ['Two-factor authentication', 'Protect your account with a one-time passcode'],
    email:      ['Email preferences', 'Control what lands in your inbox']
  };

  /* ── Boot ── */
  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = 'inact-profile-overlay';
    root.innerHTML = buildHTML();
    document.body.appendChild(root);

    var toastTimer = null;
    function toast(msg) {
      var t = document.getElementById('po-toast');
      document.getElementById('po-toast-msg').textContent = msg;
      t.classList.add('is-shown');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.classList.remove('is-shown'); }, 2400);
    }

    /* open / close */
    var lastFocus = null;
    function open(view) {
      lastFocus = document.activeElement;
      root.classList.add('is-open');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.add('is-visible');
        animateRings();
      }); });
      document.body.style.overflow = 'hidden';
      if (view) switchView(view);
      root.querySelector('.po-close').focus();
    }
    function close() {
      root.classList.remove('is-visible');
      document.getElementById('po-confirm').classList.remove('is-open');
      setTimeout(function () {
        root.classList.remove('is-open');
        document.body.style.overflow = '';
        resetRings();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 320);
    }
    root.querySelector('.po-backdrop').addEventListener('click', close);
    root.querySelector('.po-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) close();
    });

    /* learn progress bars */
    function animateRings() {
      var s = learnStats();
      document.getElementById('po-all-pct').textContent = s.allPct + '%';
      PP.forEach(function (p, i) {
        var pct = pathPct(p);
        var num = root.querySelector('[data-lp-pct="' + i + '"]');
        var fill = root.querySelector('[data-lp-fill="' + i + '"]');
        if (num) num.textContent = pct + '%';
        if (fill) {
          fill.style.transition = '';
          fill.style.transitionDelay = (60 + i * 70) + 'ms';
          fill.style.width = pct + '%';
        }
      });
    }
    function resetRings() {
      root.querySelectorAll('.po-learn-fill').forEach(function (f) {
        f.style.transition = 'none';
        f.style.transitionDelay = '0ms';
        f.style.width = '0%';
      });
    }

    /* view switching */
    function switchView(key) {
      root.querySelectorAll('.po-rail-item').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.view === key);
      });
      root.querySelectorAll('.po-view').forEach(function (v) {
        v.classList.toggle('is-active', v.dataset.viewpane === key);
      });
      var meta = VIEW_META[key];
      document.getElementById('po-title').textContent = meta[0];
      document.getElementById('po-sub').textContent = meta[1];
      root.querySelector('.po-scroll').scrollTop = 0;
      if (key === 'overview') { resetRings(); requestAnimationFrame(function () { requestAnimationFrame(animateRings); }); }
    }
    root.querySelectorAll('.po-rail-item').forEach(function (b) {
      b.addEventListener('click', function () { switchView(b.dataset.view); });
    });

    /* account: name */
    function refreshUserBindings() {
      var u = getUser();
      root.querySelectorAll('[data-bind="fullname"]').forEach(function (el) { el.textContent = u.first + ' ' + u.last; });
      root.querySelectorAll('[data-bind="initials"]').forEach(function (el) { el.textContent = initials(u); });
      document.querySelectorAll('.nav-avatar span').forEach(function (el) { el.textContent = initials(u); });
    }
    document.getElementById('po-save-name').addEventListener('click', function () {
      var u = getUser();
      u.first = document.getElementById('po-first').value.trim() || u.first;
      u.last  = document.getElementById('po-last').value.trim() || u.last;
      saveUser(u);
      refreshUserBindings();
      toast('Name updated');
    });

    /* account: password */
    document.getElementById('po-save-pw').addEventListener('click', function () {
      var nw = document.getElementById('po-newpw').value, cf = document.getElementById('po-confpw').value;
      if (!nw || nw.length < 8) { toast('Password must be at least 8 characters'); return; }
      if (nw !== cf) { toast('Passwords don’t match'); return; }
      ['po-oldpw','po-newpw','po-confpw'].forEach(function (id) { document.getElementById(id).value = ''; });
      toast('Password updated');
    });

    /* 2FA */
    var tfaOn = localStorage.getItem(TFA_KEY) === 'true';
    var statusEl = document.getElementById('po-2fa-status');
    var enableBtn = document.getElementById('po-2fa-enable');
    var setupEl = document.getElementById('po-2fa-setup');
    function render2fa() {
      statusEl.textContent = tfaOn ? 'Enabled' : 'Disabled';
      statusEl.className = 'po-2fa-status ' + (tfaOn ? 'on' : 'off');
      enableBtn.textContent = tfaOn ? 'Disable 2FA' : 'Enable 2FA';
      setupEl.style.display = 'none';
      enableBtn.style.display = '';
    }
    render2fa();
    enableBtn.addEventListener('click', function () {
      if (tfaOn) {
        tfaOn = false; localStorage.setItem(TFA_KEY, 'false');
        render2fa(); toast('Two-factor authentication disabled');
      } else {
        setupEl.style.display = 'block';
        enableBtn.style.display = 'none';
        setupEl.querySelector('.po-code').focus();
      }
    });
    document.getElementById('po-2fa-cancel').addEventListener('click', function () {
      setupEl.querySelectorAll('.po-code').forEach(function (i) { i.value = ''; });
      render2fa();
    });
    var codes = Array.prototype.slice.call(setupEl.querySelectorAll('.po-code'));
    var verifyBtn = document.getElementById('po-2fa-verify');
    codes.forEach(function (inp, idx) {
      inp.addEventListener('input', function () {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        if (inp.value && idx < codes.length - 1) codes[idx + 1].focus();
        verifyBtn.disabled = !codes.every(function (c) { return c.value; });
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && idx > 0) codes[idx - 1].focus();
      });
    });
    verifyBtn.addEventListener('click', function () {
      tfaOn = true; localStorage.setItem(TFA_KEY, 'true');
      codes.forEach(function (c) { c.value = ''; });
      verifyBtn.disabled = true;
      render2fa();
      toast('Two-factor authentication enabled');
    });

    /* email prefs */
    var mailCards = root.querySelectorAll('.po-radio-card');
    var mailPref = localStorage.getItem(MAIL_KEY) || 'none';
    function renderMail() {
      mailCards.forEach(function (c) { c.classList.toggle('is-checked', c.dataset.mail === mailPref); });
    }
    renderMail();
    mailCards.forEach(function (c) {
      c.addEventListener('click', function () { mailPref = c.dataset.mail; renderMail(); });
    });
    document.getElementById('po-save-mail').addEventListener('click', function () {
      localStorage.setItem(MAIL_KEY, mailPref);
      toast('Email preferences saved');
    });


    /* logout */
    var confirmEl = document.getElementById('po-confirm');
    document.getElementById('po-logout').addEventListener('click', function () { confirmEl.classList.add('is-open'); });
    document.getElementById('po-confirm-cancel').addEventListener('click', function () { confirmEl.classList.remove('is-open'); });
    document.getElementById('po-confirm-yes').addEventListener('click', function () {
      confirmEl.classList.remove('is-open');
      close();
      setTimeout(function () { toast('Signed out'); }, 100);
    });

    refreshUserBindings();

    /* intercept every link to the old profile page */
    document.querySelectorAll('a[href$="profile.html"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open('overview'); });
      a.setAttribute('role', 'button');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
