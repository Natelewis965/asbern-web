/* =============================================================================
   ASBERN · assets/asbern.js
   -----------------------------------------------------------------------------
   Shared behaviour for every page in packages/web. Vanilla, no dependencies,
   no build step, runs straight off `file://`.

   WHAT IT PROVIDES
     Asbern.theme      get / set / toggle, persisted to localStorage
     Asbern.icon(name) inline SVG string from the registry below
     Asbern.toast()    transient message
     Asbern.modal()    open a <dialog class="as-modal">
     Asbern.money()    /.num() / .pct()  formatting helpers
     Asbern.on()       tiny delegated-event helper
     Asbern.mount()    wires every data-as-* behaviour in a subtree

   AUTO-WIRED ATTRIBUTES  (declare in HTML, no per-page JS)
     data-as-icon="film"          replace the element's contents with an icon
     data-as-theme-toggle         button that cycles the theme
     data-as-drawer="#id"         button that toggles a mobile drawer
     data-as-tabs                 container for role=tab / role=tabpanel
     data-as-modal-open="#id"     button that opens a dialog
     data-as-modal-close          button inside a dialog that closes it
     data-as-reveal               fade/rise into view once
     data-as-count="1284"         count a number up when it scrolls into view
     data-as-year                 current year (footers)
     data-as-copy="text"          copy text to the clipboard, with a toast

   CONVENTION: JS hooks are ALWAYS data-as-*, never a class. Styling hooks are
   ALWAYS .as-*, never a data attribute. Neither vocabulary reaches into the
   other, so a redesign cannot break behaviour.
   ========================================================================== */
'use strict';

var Asbern = (function () {

  /* ======================================================================
     ICONS — 24×24, stroke-based, currentColor. Add here, use anywhere.
     ====================================================================== */

  var PATHS = {
    film:    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    tv:      '<rect x="2" y="6" width="20" height="13" rx="2"/><path d="m8 3 4 3 4-3"/>',
    coins:   '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.3-1.6-2.4-3.9-2.8"/>',
    trophy:  '<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v4M9 21h6M10 18h4"/>',
    chart:   '<path d="M3 3v17a1 1 0 0 0 1 1h17"/><path d="M7 15l3.5-4 3 2.5L20 7"/>',
    target:  '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    server:  '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    shield:  '<path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z"/><path d="m9.5 12 1.8 1.8 3.5-3.6"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    bot:     '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01M9.5 17.5h5"/><circle cx="12" cy="3" r="1.2"/>',
    music:   '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    check:   '<path d="m4.5 12.5 5 5 10-11"/>',
    x:       '<path d="M6 6l12 12M18 6 6 18"/>',
    minus:   '<path d="M5 12h14"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    arrow:   '<path d="M4 12h15M13 6l6 6-6 6"/>',
    external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
    menu:    '<path d="M4 7h16M4 12h16M4 17h16"/>',
    play:    '<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',
    pause:   '<path d="M8 4.5v15M16 4.5v15"/>',
    volume:  '<path d="M5 9v6h3.5L13 19V5L8.5 9H5Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
    mute:    '<path d="M5 9v6h3.5L13 19V5L8.5 9H5Z"/><path d="m17 10 4 4M21 10l-4 4"/>',
    users:   '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.3a3.2 3.2 0 0 1 0 5.9M17.5 14.4A6.5 6.5 0 0 1 21.5 20"/>',
    link:    '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 1 0 5.7 5.7l1.4-1.4"/>',
    cpu:     '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"/>',
    cloud:   '<path d="M7.5 18a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.6 1.6A3.9 3.9 0 0 1 18 18H7.5Z"/>',
    home:    '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z"/>',
    lock:    '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5"/>',
    spark:   '<path d="m12 3 2.1 5.6L20 10.5l-5.9 2L12 18l-2.1-5.5L4 10.5l5.9-1.9L12 3Z"/>',
    info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert:   '<path d="M12 4 3 19.5h18L12 4Z"/><path d="M12 10v4M12 17h.01"/>',
    zap:     '<path d="M13 3 5 13.5h6L10.5 21 19 10.5h-6L13 3Z"/>',
    download:'<path d="M12 4v11M7.5 11 12 15.5 16.5 11M4.5 19.5h15"/>',
    discord: '<path d="M8.5 9.5c1-.6 5-.6 6 0M8 16c-1.5-2-2-5-1.5-7.5C7.7 7.7 9 7.2 10 7l.6 1.2c1-.2 1.9-.2 2.9 0L14 7c1 .2 2.3.7 3.5 1.5.5 2.5 0 5.5-1.5 7.5"/><path d="M8 16c-.3 1 .2 1.7.6 2 1.5-.4 2.6-1.2 3.4-2M16 16c.3 1-.2 1.7-.6 2-1.5-.4-2.6-1.2-3.4-2"/><path d="M10 12.2h.01M14 12.2h.01"/>',
    grid:    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
    ticket:  '<path d="M4 9V6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V9a3 3 0 0 0 0 6v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5V15a3 3 0 0 0 0-6Z"/><path d="M13 6v2M13 11v2M13 16v2"/>',
    wifi:    '<path d="M2.5 9a15 15 0 0 1 19 0M6 12.5a10 10 0 0 1 12 0M9.5 16a5 5 0 0 1 5 0"/><path d="M12 19.5h.01"/>',
    /* Promoted from the member app's local EXTRA_ICONS (assets/app.js) — that
       file needed a game/economy/social icon set the registry did not carry.
       Checked against every key above for a collision before adding: none.
       app.js's own `icon()` still checks its local table first, so it keeps
       rendering identically off its own copy; once that file's owner deletes
       EXTRA_ICONS, the exact same 14 names resolve here instead. */
    dice:     '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
    cards:    '<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M8 10.5 10 13l-2 2.5L6 13l2-2.5Z"/><path d="M16.5 4.2 20.8 5.6a2 2 0 0 1 1.2 2.5L18.5 19"/>',
    flag:     '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5"/>',
    fire:     '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-5.5-3-9 0 0-2.5 1.5-3.5 4C10 8 9 6.5 9 6.5 7.5 8.5 6 11 6 15a6 6 0 0 0 6 6Z"/><path d="M12 21a2.6 2.6 0 0 0 2.6-2.6c0-1.7-1.3-2.4-1.3-3.9 0 0-1.6 1-2 2.3-.6-.7-1.2-1.2-1.2-1.2-.4.8-.7 1.6-.7 2.8A2.6 2.6 0 0 0 12 21Z"/>',
    medal:    '<circle cx="12" cy="15" r="5"/><path d="m8.5 10.5-3-7M15.5 10.5l3-7M9 3.5h6"/><path d="m12 13 .8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9L9.3 15l1.9-.3.8-1.7Z"/>',
    message:  '<path d="M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z"/>',
    mic:      '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/>',
    heart:    '<path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/>',
    wallet:   '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12a2 2 0 0 1 2 2v1"/><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M16.5 13.5h.01"/>',
    gift:     '<rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13v6.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V13M12 9v11.5"/><path d="M12 9S10.5 4 8.2 4a2.2 2.2 0 0 0 0 5M12 9s1.5-5 3.8-5a2.2 2.2 0 0 1 0 5"/>',
    expand:   '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    trend:    '<path d="M3 17 9.5 10.5l3.5 3L21 6"/><path d="M15 6h6v6"/>',
    /* The Asbern bind-rune: one stave, Ansuz (Á) arms left, Bjarkan (bjǫrn)
       bows right. Ás-bjǫrn, drawn once. */
    rune:    '<path d="M12 2.5v19M12 5 6.6 9M12 11l-5.4 4M12 3.5l6 4.2-6 4.2M12 11.9l6 4.2-6 4.2"/>'
  };

  function icon(name, cls) {
    var d = PATHS[name];
    if (!d) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' +
           (cls ? ' class="' + cls + '"' : '') + '>' + d + '</svg>';
  }

  /* Filled variants where a stroke reads badly at small sizes. */
  function iconFilled(name) {
    var d = PATHS[name];
    if (!d) return '';
    return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* ======================================================================
     THEME
     ====================================================================== */

  var STORE_KEY = 'asbern.theme';   // 'dark' | 'light' | 'system'

  function storedTheme() {
    try { return localStorage.getItem(STORE_KEY) || 'system'; }
    catch (e) { return 'system'; }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
  }

  function resolvedTheme() {
    var pref = storedTheme();
    return pref === 'system' ? systemTheme() : pref;
  }

  function applyTheme(pref) {
    var resolved = pref === 'system' ? systemTheme() : pref;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-pref', pref);
    var buttons = document.querySelectorAll('[data-as-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.innerHTML = icon(resolved === 'light' ? 'moon' : 'sun');
      b.setAttribute('aria-label', 'Switch to ' + (resolved === 'light' ? 'dark' : 'light') + ' theme');
      b.setAttribute('data-as-tip', resolved === 'light' ? 'Dark theme' : 'Light theme');
    }
    return resolved;
  }

  function setTheme(pref) {
    try { localStorage.setItem(STORE_KEY, pref); } catch (e) { /* private mode */ }
    return applyTheme(pref);
  }

  function toggleTheme() {
    return setTheme(resolvedTheme() === 'light' ? 'dark' : 'light');
  }

  var theme = {
    get: storedTheme,
    resolved: resolvedTheme,
    set: setTheme,
    toggle: toggleTheme,
    apply: applyTheme
  };

  /* ======================================================================
     FORMATTERS
     ====================================================================== */

  function num(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-US');
  }

  function money(n, symbol) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var s = symbol === undefined ? '$' : symbol;
    var neg = n < 0;
    return (neg ? '−' : '') + s + Math.abs(Math.round(n)).toLocaleString('en-US');
  }

  function money2(n, symbol) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var s = symbol === undefined ? '$' : symbol;
    return s + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pct(n) { return Math.round(n * 100) + '%'; }

  function clock(totalSec) {
    totalSec = Math.max(0, Math.round(totalSec));
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    var mm = (m < 10 && h > 0 ? '0' : '') + m;
    var ss = (s < 10 ? '0' : '') + s;
    return (h > 0 ? h + ':' : '') + mm + ':' + ss;
  }

  /* ======================================================================
     TINY DOM HELPERS
     ====================================================================== */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** Delegated listener: Asbern.on('click', '[data-x]', fn) */
  function on(type, selector, handler, root) {
    (root || document).addEventListener(type, function (ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest(selector) : null;
      if (el) handler.call(el, ev, el);
    });
  }

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ======================================================================
     TOASTS
     ====================================================================== */

  var toastHost = null;

  function toast(message, opts) {
    opts = opts || {};
    if (!toastHost) {
      toastHost = el('div', { class: 'as-toasts', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastHost);
    }
    var variant = opts.variant || 'accent';
    var glyph = { success: 'check', warn: 'alert', danger: 'alert', accent: 'info' }[variant] || 'info';
    var node = el('div', { class: 'as-toast as-toast--' + variant },
      icon(glyph) + '<span>' + escapeHtml(message) + '</span>');
    toastHost.appendChild(node);
    window.setTimeout(function () {
      node.classList.add('is-leaving');
      window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 220);
    }, opts.duration || 3200);
    return node;
  }

  /* ======================================================================
     MODAL — thin wrapper on native <dialog>
     ====================================================================== */

  function modal(target) {
    var dlg = typeof target === 'string' ? $(target) : target;
    if (!dlg) return null;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');       // very old browsers: non-modal fallback
    return dlg;
  }

  function closeModal(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }

  /* ======================================================================
     TABS — roving focus, arrow keys, aria kept honest
     ====================================================================== */

  function wireTabs(scope) {
    $$('[data-as-tabs]', scope).forEach(function (group) {
      var tabs = $$('[role="tab"]', group);
      if (!tabs.length) return;

      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (ev) {
          var delta = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
          if (ev.key === 'Home') { ev.preventDefault(); tabs[0].focus(); select(tabs[0]); return; }
          if (ev.key === 'End') { ev.preventDefault(); tabs[tabs.length - 1].focus(); select(tabs[tabs.length - 1]); return; }
          if (!delta) return;
          ev.preventDefault();
          var next = tabs[(i + delta + tabs.length) % tabs.length];
          next.focus();
          select(next);
        });
      });

      var initial = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      select(initial);
    });
  }

  /* ======================================================================
     REVEAL + COUNT-UP
     ====================================================================== */

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wireReveal(scope) {
    var nodes = $$('[data-as-reveal]', scope);
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = parseInt(e.target.getAttribute('data-as-reveal') || '0', 10) || 0;
        window.setTimeout(function () { e.target.classList.add('is-in'); }, delay);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function wireCounters(scope) {
    var nodes = $$('[data-as-count]', scope);
    if (!nodes.length) return;

    function run(node) {
      var to = parseFloat(node.getAttribute('data-as-count'));
      var suffix = node.getAttribute('data-as-count-suffix') || '';
      if (isNaN(to)) return;
      if (reduced) { node.textContent = num(to) + suffix; return; }
      var start = performance.now();
      var dur = 1100;
      (function frame(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = num(Math.round(to * eased)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ======================================================================
     MOUNT — wire everything declarative in a subtree
     ====================================================================== */

  function mount(scope) {
    scope = scope || document;

    /* icons */
    $$('[data-as-icon]', scope).forEach(function (node) {
      if (node.getAttribute('data-as-icon-done')) return;
      node.innerHTML = icon(node.getAttribute('data-as-icon'));
      node.setAttribute('data-as-icon-done', '1');
    });

    /* year */
    $$('[data-as-year]', scope).forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });

    wireTabs(scope);
    wireReveal(scope);
    wireCounters(scope);
  }

  /* ======================================================================
     GLOBAL WIRING — delegated, so it survives dynamic content
     ====================================================================== */

  function boot() {
    document.documentElement.classList.add('js');
    applyTheme(storedTheme());

    /* React to the OS changing while the visitor is on 'system'. */
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var listener = function () { if (storedTheme() === 'system') applyTheme('system'); };
      if (mq.addEventListener) mq.addEventListener('change', listener);
      else if (mq.addListener) mq.addListener(listener);
    }

    on('click', '[data-as-theme-toggle]', function () { toggleTheme(); });

    /* Mobile drawer */
    on('click', '[data-as-drawer]', function (ev, btn) {
      var drawer = $(btn.getAttribute('data-as-drawer'));
      if (!drawer) return;
      var open = drawer.hasAttribute('hidden');
      if (open) { drawer.removeAttribute('hidden'); } else { drawer.setAttribute('hidden', ''); }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.innerHTML = icon(open ? 'x' : 'menu');
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      $$('[data-as-drawer-panel]').forEach(function (d) {
        if (d.hasAttribute('hidden')) return;
        d.setAttribute('hidden', '');
        var btn = $('[data-as-drawer="#' + d.id + '"]');
        if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = icon('menu'); }
      });
    });
    /* Close the drawer when a link inside it is followed. */
    on('click', '[data-as-drawer-panel] a', function (ev, a) {
      var d = a.closest('[data-as-drawer-panel]');
      if (d) d.setAttribute('hidden', '');
      var btn = $('[data-as-drawer="#' + (d && d.id) + '"]');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = icon('menu'); }
    });

    /* Modals */
    on('click', '[data-as-modal-open]', function (ev, btn) {
      ev.preventDefault();
      modal(btn.getAttribute('data-as-modal-open'));
    });
    on('click', '[data-as-modal-close]', function (ev, btn) {
      closeModal(btn.closest('dialog'));
    });
    /* Click on the backdrop closes. */
    on('click', 'dialog.as-modal', function (ev, dlg) {
      if (ev.target === dlg) closeModal(dlg);
    });

    /* Copy to clipboard */
    on('click', '[data-as-copy]', function (ev, btn) {
      var text = btn.getAttribute('data-as-copy');
      var done = function () { toast('Copied to clipboard', { variant: 'success' }); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { toast('Could not copy', { variant: 'warn' }); });
      } else {
        var ta = el('textarea'); ta.value = text; document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy', { variant: 'warn' }); }
        document.body.removeChild(ta);
      }
    });

    /* Sticky nav shadow */
    var nav = $('.as-nav');
    if (nav) {
      var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    mount(document);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ====================================================================== */

  return {
    icon: icon,
    iconFilled: iconFilled,
    theme: theme,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    mount: mount,
    num: num,
    money: money,
    money2: money2,
    pct: pct,
    clock: clock,
    escapeHtml: escapeHtml,
    $: $,
    $$: $$,
    on: on,
    el: el,
    reducedMotion: reduced
  };
})();

window.Asbern = Asbern;
