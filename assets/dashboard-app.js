/* =============================================================================
   ASBERN · assets/dashboard-app.js
   -----------------------------------------------------------------------------
   THE ADMIN DASHBOARD — dashboard.html. The browser half of `@asbern/api`.

   Discord sign-in · the server picker · every control in the registry, generated
   · module state · a live socket · an activity log.

   ⚠ WHAT THIS PAGE IS, IN ONE SENTENCE: a second surface onto
   `adminactions.run(id, params, ctx)`. Discord's `/menu` console reaches that
   function through `adminpanel.js`; this page reaches it through
   `POST /v1/guilds/{id}/actions/{actionId}`, which reaches it through
   `registry.run()`. There is no synchroniser between the two and there is
   nothing to reconcile, because the module config stores are the single source
   of truth and both surfaces read and write the same ones. A change made in
   Discord shows up here because this reads the same store — NOT because
   anything copied it. That is why the owner's "everything must reflect both
   ways" requirement is structural here rather than a feature that can regress.

   ⚠ AND NOTHING ON THIS PAGE IS A GATE. `adminactions.run()`'s own header:
   "THE GATE IS HERE, not on the button. Every surface calls this, so no surface
   can forget it — and a stale or hand-made request cannot skip it." Everything
   below decides what to DRAW. A hostile browser can return true from any of it
   and the server still refuses.

   ── WHAT IS NOT LOADED, AND WHY IT IS WORTH SAYING ──────────────────────────
   `assets/mock-data.js` is not on this page. `assets/dashboard.js` — with its
   generated 300-odd-control snapshot — is not on this page. Both are still
   shipped, and both still power preview.html, billing.html and bridge.html,
   which is the right home for a fixture-driven demo. This console holds no
   control list at all: it fetches the contract and re-hashes it. When the API
   cannot be reached, this page says so and shows nothing else, because the
   alternative — a plausible screen full of last-known values — is the exact
   defect that let a 221-control snapshot sit 86 behind the registry in silence.

   ── DEPLOYMENT, WHICH IS THE ONE THING THAT WILL WASTE YOUR TIME ────────────
   Serve this page from the SAME ORIGIN as the API (a reverse proxy: `/v1/*` to
   the bot's web API, everything else static). Two reasons, both structural:
     1. the CSRF token is a readable cookie the page must echo in a header, and
        a browser will not hand a cross-site page another origin's cookie;
     2. the session cookie is `SameSite=Lax`, so a cross-site XHR does not carry
        it either.
   A different origin can still be pointed at with the API-origin control in the
   header — it will read fine and refuse to write, saying which of the two it is.
   And `general.webApi.origins` MUST list this page's origin: `live.js` refuses
   any upgrade carrying an `Origin` it does not know, even on loopback, because
   `Origin` is the whole CSWSH defence for a socket that cannot send headers.

   NO BUILD STEP, NO DEPENDENCIES. Needs assets/asbern.js (theme, icons, toasts)
   and assets/dashboard-core.js (the rules, with no DOM in them).
   ========================================================================== */
'use strict';

(function () {

  var A = window.Asbern;
  var C = window.AsbernDashCore;
  if (!A || !C) return;

  var esc = C.esc;
  var icon = A.icon;
  var $ = A.$;
  var $$ = A.$$;

  /* =======================================================================
     1 · WHERE THE API IS — configurable, never hardcoded (LAW 1)
     -----------------------------------------------------------------------
     ⚠ A SELF-HOSTER'S API IS ON THEIR MACHINE AND WE DO NOT KNOW ITS ADDRESS.
     The default is the empty string, meaning "the origin this page was served
     from", which is the deployment we recommend and the only one where writes
     work. Everything else is an explicit override, in this order:

        ?api=<origin>          one-off, and CONFIRMED before it is stored
        localStorage           what was confirmed last time
        <meta name="asbern-api"> what the operator baked into the page
        ''                     same origin

     ⚠ THE `?api=` ARM ASKS FIRST, AND THAT IS NOT PADDING. A link that silently
     re-points an admin's console at an attacker's host would send them through a
     Discord consent screen for the attacker's OAuth app. One confirm turns that
     from invisible into a question with a hostname in it.
     ======================================================================= */

  var API_KEY = 'asbern.api';

  function metaApi() {
    var m = document.querySelector('meta[name="asbern-api"]');
    return m ? String(m.getAttribute('content') || '').trim() : '';
  }

  function storedApi() {
    try { return localStorage.getItem(API_KEY) || ''; } catch (e) { return ''; }
  }

  function storeApi(v) {
    try { if (v) localStorage.setItem(API_KEY, v); else localStorage.removeItem(API_KEY); } catch (e) { /* private mode */ }
  }

  function normaliseOrigin(raw) {
    var s = String(raw || '').trim().replace(/\/+$/, '');
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) return null;
    try { return new URL(s).origin; } catch (e) { return null; }
  }

  function resolveApiBase() {
    var params = new URLSearchParams(location.search);
    var asked = params.get('api');
    if (asked != null) {
      var want = normaliseOrigin(asked);
      if (want === null) {
        // Not a usable origin. Ignored rather than stored, and said out loud.
        state.apiWarning = 'The ?api= value in this link is not an http(s) origin, so it was ignored.';
      } else if (want !== storedApi()) {
        var ok = window.confirm(
          'Point this console at a different Asbern API?\n\n'
          + (want || 'this page’s own origin') + '\n\n'
          + 'Only accept this if you run that server. It will ask you to sign in with Discord.');
        if (ok) storeApi(want); else state.apiWarning = 'The API in that link was not accepted. Still using ' + (storedApi() || 'this page’s origin') + '.';
      }
    }
    var stored = storedApi();
    if (stored) return stored;
    var meta = normaliseOrigin(metaApi());
    return meta || '';
  }

  /** The readable half of the double-submit pair. Never sent anywhere but the header. */
  function csrfCookie() {
    var m = /(?:^|;\s*)asbern_csrf=([^;]*)/.exec(document.cookie || '');
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
  }

  /* =======================================================================
     2 · STATE — one object, and every field is three-valued where it must be
     -----------------------------------------------------------------------
     ⚠ `null` MEANS "NOT ASKED YET" AND IS NEVER SPENT AS "NO". The same rule
     CLAUDE.md states for `screening.presence()`: "`null` = the engine could not
     be asked … Neither may ever be spent as 'nobody is watching.'" Here it is
     `health`, `me` and `contract`: not-yet-asked renders a skeleton, a failure
     renders the failure, and neither renders an empty console that reads as "you
     have no controls".
     ======================================================================= */

  var state = {
    api: null,          // the client
    apiBase: '',
    apiWarning: null,

    health: null,       // null = not asked · {ok:false,…} = failure · {…} = the body
    me: null,           // null = not asked · false = signed out · {…} = the session
    meFailure: null,    // a NON-401 failure reading the session — a different screen
    loginError: null,
    guilds: [],
    guildId: null,
    moduleId: null,

    contract: null,     // null = not loaded · {…} = the contract as it arrived
    contractCheck: null,
    contractFailure: null,

    actor: { isAdmin: true, isAiDev: false, isOwner: false },

    view: 'overview',
    groupId: null,
    query: '',

    // ⚠ WHICH CARDS ARE OPEN IS STATE, NOT DOM. Every live event, every activity
    // line and every background read calls render(), which replaces `#ad-main`
    // wholesale — so an `open` attribute living only in the markup is an
    // expansion that closes itself while somebody is filling the form in it.
    // Keyed by control id, so it also survives changing tab and coming back.
    open: {},
    facets: [],         // active facet ids, ANDed. See dashboard-core FACETS.

    live: { socket: null, status: 'idle', lastEvent: null, events: 0, tries: 0, timer: null },
    activity: [],       // newest first — what THIS browser did, plus live events
    readState: {},      // actionId -> { at, result } from the auto-read pass
    readGuild: null,
    busy: {},
  };

  var LS_GUILD = 'asbern.guild';

  /* =======================================================================
     3 · SMALL HELPERS
     ======================================================================= */

  function setHtml(node, html) { if (node) node.innerHTML = html; }

  // ⚠ INLINE, BECAUSE asbern.js's ICON TABLE HAS NO MAGNIFIER AND THIS FILE DOES
  // NOT OWN THAT TABLE. `Asbern.icon()` returns the EMPTY STRING for a name it
  // does not know — so calling `icon('search')` would have rendered nothing at
  // all and left the gutter `.ad-search` reserves for it empty, which is the
  // exact defect being fixed. Same 24×24 stroke geometry as the rest of the set.
  var MAGNIFIER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"'
    + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
    + '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/></svg>';

  function when(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var diff = Date.now() - d.getTime();
    if (diff < 45000) return 'just now';
    if (diff < 3600000) return Math.round(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.round(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  }

  // `info` is spelled `frost` in the design system; mapped here rather than
  // adding a synonym to asbern.css, which this file does not own.
  var NOTE_VARIANT = { info: 'frost', warn: 'warn', danger: 'danger', accent: 'accent' };

  function note(kind, title, body, actions) {
    return '<div class="as-note as-note--' + esc(NOTE_VARIANT[kind] || 'accent') + ' ad-note-block">'
      + '<div>'
      + '<strong>' + esc(title) + '</strong>'
      + (body ? '<div class="u-text-sm u-mt-2">' + body + '</div>' : '')
      + (actions ? '<div class="as-row u-mt-3">' + actions + '</div>' : '')
      + '</div></div>';
  }

  /** Open or close one card's body, in the DOM, without a re-render. */
  function setCardOpen(card, disc, want) {
    if (!card) return;
    var body = card.querySelector('[id^="ctlb-"]') || card.querySelector('.ad-control__body');
    if (disc) disc.setAttribute('aria-expanded', want ? 'true' : 'false');
    if (body) { if (want) body.removeAttribute('hidden'); else body.setAttribute('hidden', ''); }
  }

  /** Is this event target something the visitor is typing into? */
  function typing(node) {
    if (!node || !node.tagName) return false;
    var t = String(node.tagName).toUpperCase();
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || node.isContentEditable === true;
  }

  /** Put keyboard focus back on an element a re-render has just replaced. */
  function refocus(selector) {
    var next = document.querySelector(selector);
    if (next && next.focus) { try { next.focus(); } catch (e) { /* detached */ } }
  }

  function pageHead(title, sub, right) {
    return '<header class="ad-pagehead">'
      + '<div class="u-grow"><h1 class="ad-pagehead__title">' + esc(title) + '</h1>'
      + (sub ? '<p class="ad-pagehead__sub">' + sub + '</p>' : '') + '</div>'
      + (right ? '<div class="ad-pagehead__side">' + right + '</div>' : '')
      + '</header>';
  }

  /* =======================================================================
     4 · THE ACTIVITY LOG — this browser's own record, secrets already gone
     -----------------------------------------------------------------------
     ⚠ THE PARAMS THAT LAND HERE GO THROUGH THE SAME REDUCTION THE SERVER'S
     AUDIT USES (`dashboard-core.summariseParams`, pinned against
     `packages/api/src/audit.js` by a test). A `secret` param's key is DROPPED,
     free text becomes a length, and only ids and scalars survive verbatim. A
     client that renders `••••••` into its own log has undone the server's
     decision on the customer's screen — and on their screenshot.
     ======================================================================= */

  function logActivity(entry) {
    state.activity.unshift(Object.assign({ at: Date.now() }, entry));
    if (state.activity.length > 200) state.activity.length = 200;
    if (state.view === 'activity') render();
    paintLivePill();
  }

  function logRun(control, values, outcome, detail) {
    logActivity({
      kind: 'run',
      actionId: control.id,
      label: control.label,
      module: control.module,
      params: C.summariseParams(control.params, values),
      outcome: outcome,
      detail: detail || null,
    });
  }

  /* =======================================================================
     5 · BOOT
     ======================================================================= */

  async function boot() {
    state.apiBase = resolveApiBase();
    state.api = C.createClient({
      fetch: window.fetch.bind(window),
      base: state.apiBase,
      csrf: csrfCookie,
    });

    renderChrome();
    render();

    // ⚠ HEALTH FIRST, AND IT IS UNAUTHENTICATED ON PURPOSE. It separates "the
    // API is not there" from "you are signed out", which are two completely
    // different things to be told and used to look identical.
    state.health = await state.api.health();
    if (!state.health.ok) { render(); return; }
    state.health = state.health.body;
    render();

    await completeLoginIfReturning();
    await loadMe();
    render();
  }

  /**
   * The OAuth landing.
   *
   * ⚠ THIS PAGE IS THE `redirectUri`, and the code/state pair is exchanged over
   * `fetch` instead of by letting the browser land on the API's JSON response.
   * `server.js`'s `/v1/auth/callback` answers `application/json` with the
   * `Set-Cookie` headers on it — exactly right for an API and a raw JSON blob in
   * the face of an admin if you navigate to it. Fetching it keeps both cookies
   * and keeps the page they were on.
   *
   * ⚠ THE QUERY IS STRIPPED WITH replaceState WHATEVER HAPPENS, including on
   * failure. An `?code=` left in the address bar ends up in bookmarks, in a
   * screenshot and in the next referrer.
   */
  async function completeLoginIfReturning() {
    var q = new URLSearchParams(location.search);
    var code = q.get('code');
    var st = q.get('state');
    var err = q.get('error');
    if (!code && !err) return;

    var clean = location.pathname + (location.hash || '');
    try { history.replaceState(null, '', clean); } catch (e) { /* file:// */ }

    if (err) {
      state.loginError = 'Discord declined the sign-in: ' + err + (q.get('error_description') ? ' — ' + q.get('error_description') : '');
      return;
    }
    var done = await state.api.completeLogin(code, st || '');
    if (!done.ok) {
      state.loginError = C.failureSentence(done)
        + (done.body && done.body.code ? ' (' + done.body.code + ')' : '');
      return;
    }
    state.loginError = null;
    logActivity({ kind: 'auth', outcome: 'ok', detail: 'signed in' });
  }

  async function loadMe() {
    var r = await state.api.me();
    if (!r.ok) {
      state.me = false;
      state.guilds = [];
      if (r.reason !== C.REASON.HTTP || r.status !== 401) state.meFailure = r;
      return;
    }
    state.meFailure = null;
    state.me = r.body.me || null;
    state.guilds = Array.isArray(r.body.guilds) ? r.body.guilds : [];

    // ⚠ OWNER IS THE ONLY ACTOR FACT THE API PUBLISHES. `actionableGuilds()`
    // returns `{id, owner}` and nothing else; `isAiDev` is a guild ROLE the
    // browser cannot see, so it stays FALSE here — the same direction the server
    // defaults to ("`aidev` fails closed"). A control this page greys out and the
    // server would have allowed is recoverable; the reverse is a dead button.
    var picked = pickGuild();
    if (picked) selectGuild(picked, { silent: true });
  }

  function pickGuild() {
    var remembered = null;
    try { remembered = localStorage.getItem(LS_GUILD); } catch (e) { /* private mode */ }
    var ids = state.guilds.map(function (g) { return g.id; });
    if (remembered && ids.indexOf(remembered) > -1) return remembered;
    return state.guilds.length === 1 ? state.guilds[0].id : null;
  }

  async function selectGuild(guildId, opts) {
    var o = opts || {};
    if (state.guildId === guildId && state.contract) return;
    state.guildId = guildId;
    try { localStorage.setItem(LS_GUILD, guildId); } catch (e) { /* private mode */ }

    var g = state.guilds.filter(function (x) { return x.id === guildId; })[0];
    state.actor = { isAdmin: true, isAiDev: false, isOwner: !!(g && g.owner) };

    state.contract = null;
    state.contractCheck = null;
    state.contractFailure = null;
    state.readState = {};
    state.readGuild = null;
    if (!o.silent) render();

    var r = await state.api.contract(guildId);
    if (!r.ok) { state.contractFailure = r; render(); return; }

    // ⚠ CHECKED BEFORE IT IS RENDERED, NEVER AFTER. The whole reason this
    // console has no snapshot is that an omission is invisible to anything that
    // walks the data — so the data is hashed before a single card is built from
    // it, and a contract that does not hash to the fingerprint it shipped with
    // is not drawn at all.
    state.contract = r.body;
    state.contractCheck = await C.verifyContract(r.body, state.health);
    if (!state.contractCheck.ok) state.contract = null;

    render();
    openLive();
  }

  /* =======================================================================
     6 · THE LIVE CHANNEL — the sync requirement, made visible
     -----------------------------------------------------------------------
     ⚠ ONE SOCKET, ONE GUILD, FIXED AT THE HANDSHAKE — the server's rule, not a
     preference: "a socket that can re-target is a socket whose authorization was
     checked once and spent many times." Changing servers closes this one and
     opens another, which is another authorization.

     ⚠ AND IT IS ONE-WAY. `live.js` accepts inbound frames and ignores them by
     design; everything this page wants to DO goes through the audited,
     rate-limited write routes. Nothing below ever sends.

     ⚠ WHAT IT PROVES AND WHAT IT DOES NOT. When the bot publishes on this
     channel, a change made in Discord lands here with no refresh, and the state
     cards re-read themselves. Today NOTHING IN `src/` CALLS `apiLive.publish()`
     — the package is delivered unwired — so this opens, handshakes, receives
     `hello`, and then sits silent. The pill says `live` when the socket is up and
     `no live channel` when it is not, and it NEVER says live because it hopes so.
     ======================================================================= */

  function openLive() {
    closeLive();
    if (!state.guildId || !state.health || !state.health.live) {
      state.live.status = state.health && state.health.live === false ? 'unavailable' : 'idle';
      paintLivePill();
      return;
    }
    var url = state.api.liveUrl(state.guildId, location.origin);
    var sock;
    try { sock = new WebSocket(url); } catch (e) { state.live.status = 'failed'; paintLivePill(); return; }
    state.live.socket = sock;
    state.live.status = 'connecting';
    paintLivePill();

    sock.onopen = function () { state.live.status = 'open'; state.live.tries = 0; paintLivePill(); };
    sock.onmessage = function (ev) { onLiveFrame(ev.data); };
    sock.onerror = function () { /* onclose always follows; one message is enough */ };
    sock.onclose = function () {
      if (state.live.socket !== sock) return;
      state.live.socket = null;
      state.live.status = 'closed';
      paintLivePill();
      // Backoff, capped. A console left open overnight must not hammer a bot
      // that is down, and must not be dead when it comes back.
      state.live.tries += 1;
      var wait = Math.min(30000, 1000 * Math.pow(2, Math.min(5, state.live.tries)));
      state.live.timer = window.setTimeout(function () { if (state.guildId) openLive(); }, wait);
    };
  }

  function closeLive() {
    if (state.live.timer) { window.clearTimeout(state.live.timer); state.live.timer = null; }
    var s = state.live.socket;
    state.live.socket = null;
    if (s) { try { s.close(); } catch (e) { /* already gone */ } }
  }

  var refreshTimer = null;

  function onLiveFrame(raw) {
    var msg = null;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (!msg || !msg.e) return;
    state.live.lastEvent = Date.now();
    state.live.events += 1;

    if (msg.e === 'hello') { paintLivePill(); return; }

    // ⚠ EVERY EVENT IS TREATED AS "SOMETHING CHANGED", AND THAT IS DELIBERATE
    // WHILE THE PUBLISHER DOES NOT EXIST YET. Branching on an event vocabulary
    // nothing emits would be a table written from imagination, and the first real
    // event would fall through it silently. A generic "re-read the state cards"
    // is correct for every event a config change could possibly be, and harmless
    // for the ones it is not.
    logActivity({ kind: 'live', event: msg.e, detail: 'changed elsewhere — this page re-read it', outcome: 'live' });
    if (refreshTimer) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function () { refreshReadState(true); }, 400);
    paintLivePill();
  }

  function livePill() {
    var s = state.live.status;
    var map = {
      open: ['online', 'Live'],
      connecting: ['unknown', 'Connecting'],
      closed: ['offline', 'Reconnecting'],
      failed: ['offline', 'No live channel'],
      unavailable: ['unknown', 'No live channel'],
      idle: ['unknown', 'Live channel idle'],
    };
    var m = map[s] || map.idle;
    var title = s === 'open'
      ? (state.live.events ? state.live.events + ' event(s) received' : 'Connected. Nothing has been published yet.')
      : 'The dashboard is not receiving live updates. Values are as of the last read.';
    return '<span class="ad-lamp ad-lamp--' + m[0] + '" title="' + esc(title) + '">' + esc(m[1]) + '</span>';
  }

  function paintLivePill() {
    var host = $('#ad-livepill');
    if (host) host.innerHTML = state.guildId ? livePill() : '';
  }

  /* =======================================================================
     7 · READING CURRENT STATE — by running the registry's own read controls
     ======================================================================= */

  async function refreshReadState(quiet) {
    if (!state.contract || !state.guildId) return;
    var reads = C.autoReadControls(state.contract).slice(0, 24);
    if (!reads.length) return;
    state.readGuild = state.guildId;
    for (var i = 0; i < reads.length; i += 1) {
      var control = reads[i];
      /* eslint-disable no-await-in-loop */
      var r = await state.api.run(state.guildId, control.id, {});
      state.readState[control.id] = {
        at: Date.now(),
        ok: !!(r.ok && r.body && r.body.ok !== false),
        result: r.ok ? r.body : { ok: false, error: C.failureSentence(r) },
      };
      /* eslint-enable no-await-in-loop */
    }
    if (!quiet) A.toast('Read ' + reads.length + ' state controls', { variant: 'success' });
    render();
  }

  /* =======================================================================
     8 · CHROME — the top bar and the sidebar
     ======================================================================= */

  /**
   * ⚠ THE FIRST ONE IS CALLED "HOME", NOT "OVERVIEW", AND THAT IS A COLLISION
   * FIX RATHER THAN A PREFERENCE. The registry's FIRST TAB is itself named
   * `Overview` (🏠, 9 controls), so a console view of the same name put two
   * entries reading "Overview" in one sidebar, four rows apart, going to
   * different places. The route id stays `overview` — it is in people's
   * bookmarks — and only the label moves, because the label is the half that was
   * ambiguous.
   */
  var VIEWS = [
    { id: 'overview', label: 'Home', icon: 'home' },
    { id: 'modules', label: 'Modules', icon: 'grid' },
    { id: 'controls', label: 'All controls', icon: 'sliders' },
    { id: 'activity', label: 'Activity', icon: 'clock' },
    { id: 'connection', label: 'Connection', icon: 'wifi' },
  ];

  function renderChrome() {
    setHtml($('#ad-serverselect'), serverSelectHtml());
    // ⚠ NEVER REBUILD THE SEARCH BOX WHILE SOMEBODY IS TYPING IN IT. A live
    // event, an activity line or a background read all call render(), and
    // replacing the input's markup drops the caret and the focus mid-word. The
    // box is the primary navigation for ~370 controls; losing it to a background
    // refresh is the difference between a console and a toy.
    var box = $('#ad-q');
    if (!box || document.activeElement !== box) setHtml($('#ad-globalsearch'), searchBoxHtml());
    setHtml($('#ad-account'), accountHtml());
    setHtml($('#ad-sidenav'), sideNavHtml());
    paintLivePill();
  }

  function serverSelectHtml() {
    if (!state.me) return '';
    if (!state.guilds.length) {
      return '<span class="u-text-xs as-muted">No servers you can configure</span>';
    }
    var current = state.guilds.filter(function (g) { return g.id === state.guildId; })[0];
    return '<div class="ad-switch" data-ad-switch>'
      + '<button class="ad-switch__btn" type="button" data-ad-switch-btn aria-expanded="false" aria-haspopup="true">'
      + '<span class="as-avatar as-avatar--sm ad-guildmark" aria-hidden="true">' + esc(guildMonogram(current ? current.id : '')) + '</span>'
      + '<span class="ad-switch__label">'
      + '<span class="ad-switch__name">' + esc(current ? guildLabel(current.id) : 'Choose a server') + '</span>'
      + '<span class="ad-switch__plan">' + (current && current.owner ? 'Owner' : 'Administrator') + '</span>'
      + '</span>' + icon('arrow')
      + '</button>'
      + '<div class="ad-switch__menu" data-ad-switch-menu hidden>'
      + state.guilds.map(function (g) {
        return '<button class="ad-switch__opt" type="button" data-ad-guild="' + esc(g.id) + '"'
          + (g.id === state.guildId ? ' aria-current="true"' : '') + '>'
          + '<span class="as-avatar as-avatar--sm ad-guildmark" aria-hidden="true">' + esc(guildMonogram(g.id)) + '</span>'
          + '<span class="ad-switch__meta"><b>' + esc(guildLabel(g.id)) + '</b>'
          + '<span>' + esc(g.id) + (g.owner ? ' · owner' : '') + '</span></span>'
          + '</button>';
      }).join('')
      // ⚠ THE PICKER SHOWS IDS BECAUSE IDS ARE ALL THE API PUBLISHES.
      // `authz.actionableGuilds()` returns `{id, owner}` — deliberately, since it
      // is the INTERSECTION of "servers you administer" and "servers this install
      // serves" and it carries no names or icons. Inventing a name would be a
      // fixture. Naming them locally is the honest alternative and it is the
      // admin's own label, stored in their own browser.
      + '<div class="ad-switch__foot">Names are yours to set — Discord’s are not published by this API.'
      + ' <button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-name-guild>Rename this server</button></div>'
      + '</div></div>';
  }

  function guildLabel(id) {
    if (!id) return 'Choose a server';
    var custom = null;
    try { custom = localStorage.getItem('asbern.guildname.' + id); } catch (e) { /* private mode */ }
    return custom || ('Server ' + String(id).slice(-4));
  }

  function guildMonogram(id) {
    if (!id) return '?';
    var name = guildLabel(id);
    return name.replace(/^Server\s+/, '').slice(0, 2).toUpperCase();
  }

  /**
   * ⚠ THE ICON AND THE ⌘K CHIP ARE NOT DECORATION — THE SPACE FOR THEM WAS
   * ALREADY BEING PAID FOR. `dashboard.css` §1 reserves `padding-left: 2.3rem`
   * and `padding-right: 3.4rem` on `.ad-search .as-input`, and positions
   * `.ad-search > svg` and `.ad-search__hint` into those gutters. The console
   * rendered neither, so the box shipped with 37px of empty indent on the left
   * and 54px of dead space on the right, and the placeholder started nowhere in
   * particular. Drawing them costs nothing and makes the primary navigation for
   * 369 controls look like a search box instead of a misaligned text field.
   */
  function searchBoxHtml() {
    if (!state.contract) return '';
    var n = state.contract.actions.length;
    return '<label class="as-field ad-search">'
      + '<span class="ad-sr">Search all ' + n + ' controls by name, id, or what they do</span>'
      + MAGNIFIER
      + '<input class="as-input" type="search" id="ad-q" placeholder="Search ' + n + ' controls…"'
      + ' autocomplete="off" spellcheck="false" aria-keyshortcuts="Control+K Meta+K"'
      + ' value="' + esc(state.query) + '" data-ad-search>'
      + '<kbd class="ad-search__hint ad-kbd" aria-hidden="true">' + esc(shortcutHint()) + '</kbd>'
      + '</label>';
  }

  /**
   * ⚠ READ FROM THE PLATFORM, NEVER ASSUMED. A Windows admin shown `⌘K` learns
   * that the shortcut is for somebody else's machine; the handler already
   * accepts either modifier, so the LABEL is the only thing that has to know.
   */
  function shortcutHint() {
    var p = '';
    try { p = String((navigator.platform || navigator.userAgent || '')); } catch (e) { p = ''; }
    return /Mac|iPhone|iPad|iPod/i.test(p) ? '⌘K' : 'Ctrl K';
  }

  function accountHtml() {
    if (state.me === null) return '<span class="as-skeleton ad-skel-pill"></span>';
    if (!state.me) {
      return '<button class="as-btn as-btn--primary as-btn--sm" type="button" data-ad-login>'
        + icon('discord') + ' Sign in</button>';
    }
    return '<div class="ad-account">'
      + '<span class="ad-account__id" title="Your Discord user id — the only identity this session holds">' + esc(state.me.userId) + '</span>'
      + '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-logout>Sign out</button>'
      + '</div>';
  }

  /**
   * ⚠ `aria-current="page"` IS A LAYOUT FIX, NOT ONLY AN ACCESSIBILITY ONE, AND
   * THIS WAS A REAL BUG. asbern.css styles the active item as
   * `.as-sidebar__item[aria-current], .as-sidebar__item.is-active` — both — but
   * `dashboard.css`'s narrow-viewport rule, where the sidebar becomes a
   * horizontal tab strip, keys the underline off `[aria-current]` ALONE. This
   * function emitted only `is-active`, so on every viewport under 60rem the
   * console had no indication whatsoever of which section you were in. Emitting
   * both fixes the phone and tells assistive tech at the same time.
   */
  function sideNavHtml() {
    if (!state.me || !state.contract) return '';
    var grouped = C.groupControls(state.contract, state.actor);
    var here = function (on) { return on ? ' class="as-sidebar__item is-active" aria-current="page"' : ' class="as-sidebar__item"'; };
    return '<div class="as-sidebar__head" id="ad-nav-console">Console</div>'
      + VIEWS.map(function (v) {
        return '<a' + here(state.view === v.id && !state.groupId) + ' href="#/' + v.id + '">'
          + icon(v.icon) + '<span>' + esc(v.label) + '</span></a>';
      }).join('')
      + '<div class="as-sidebar__head">Tabs · the same eleven as <code>/menu</code></div>'
      + grouped.map(function (g) {
        return '<a' + here(state.groupId === g.group.id) + ' href="#/group/' + esc(g.group.id) + '"'
          + ' title="' + esc(g.group.label + ' — ' + g.controls.length + ' control'
            + (g.controls.length === 1 ? '' : 's') + ' you can use') + '">'
          + '<span class="ad-side-emoji" aria-hidden="true">' + esc(g.group.emoji) + '</span>'
          + '<span class="u-grow">' + esc(g.group.label) + '</span>'
          + '<span class="ad-count">' + g.controls.length + '</span></a>';
      }).join('');
  }

  /* =======================================================================
     8b · THE TOOLBAR — filters, counts, and one gesture for 369 cards
     -----------------------------------------------------------------------
     ⚠ THE CHIPS ARE THE SECOND HALF OF WHAT SEARCH CANNOT DO. Search answers
     "where is the control I can name". It cannot answer "which of these 369
     things will change my server", which is the question an admin who has never
     seen this page actually has — and there are 128 of them. Every facet is a
     predicate over a field the contract already carries (see dashboard-core
     FACETS), so nothing here can fall out of step with the registry.

     ⚠ AND EVERY CHIP CARRIES ITS COUNT BEFORE IT IS PRESSED. A filter that can
     silently produce an empty page is a filter that reads as a broken console.
     ======================================================================= */

  /**
   * ⚠ THE TAB STRIP AND THE TOOLBAR ARE ONE STICKY BLOCK, NOT TWO.
   * MEASURED IN A BROWSER: as two independent sticky elements they SWAP VISUAL
   * ORDER as you scroll. `.ad-toolbar` sticks at `--as-nav-h` and
   * `.ad-sticky-tabs` at `--as-nav-h + 3.55rem` (dashboard.css was written for a
   * page that put the toolbar first), so the strip that sits ABOVE the filters at
   * rest jumps BELOW them the moment the page moves. One container with one
   * offset cannot do that, and it needs no height arithmetic to stay right when
   * the chips wrap to a second line.
   */
  function stickyHeadHtml(inner) {
    return '<div class="ad-stickyhead">' + inner + '</div>';
  }

  function toolbarHtml(pool, shown) {
    var plan = C.facetPlan(pool, state.facets);
    var openCount = 0;
    for (var i = 0; i < shown.length; i += 1) if (state.open[shown[i].id]) openCount += 1;
    var allOpen = shown.length > 0 && openCount === shown.length;

    return '<div class="ad-toolbar" role="group" aria-label="Filter the controls on this page">'
      + '<div class="ad-facets">'
      + '<span class="ad-facets__lede" aria-hidden="true">Show only</span>'
      + plan.map(function (f) {
        return '<button class="as-chip ad-facet" type="button" data-ad-facet="' + esc(f.id) + '"'
          + ' aria-pressed="' + (f.active ? 'true' : 'false') + '"'
          + (f.disabled ? ' disabled' : '')
          + ' title="' + esc(f.hint) + '">'
          + esc(f.label) + '<span class="ad-facet__n">' + f.count + '</span></button>';
      }).join('')
      + (state.facets.length
        ? '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-clearfacets>Clear filters</button>'
        : '')
      + '</div>'
      + '<div class="ad-toolbar__end">'
      + '<p class="ad-toolbar__count" role="status" aria-live="polite">'
      + '<b>' + shown.length + '</b> of ' + pool.length + ' shown</p>'
      + (shown.length
        ? '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-expandall="'
          + (allOpen ? '0' : '1') + '">' + (allOpen ? 'Collapse all' : 'Expand all') + '</button>'
        : '')
      + '</div>'
      + '</div>';
  }

  /* =======================================================================
     9 · VIEWS
     ======================================================================= */

  function render() {
    renderChrome();
    var host = $('#ad-main');
    if (!host) return;

    // ── the ladder of honest failures, in the order they can happen ──────
    if (state.health === null) { setHtml(host, skeletonHtml()); return; }
    if (state.health.ok === false) { setHtml(host, unreachableHtml(state.health)); return; }
    if (state.me === null) { setHtml(host, skeletonHtml()); return; }
    if (state.me === false) { setHtml(host, signInHtml()); return; }
    if (state.meFailure) { setHtml(host, apiFailureHtml('Could not read your session', state.meFailure)); return; }
    if (!state.guilds.length) { setHtml(host, noGuildsHtml()); return; }
    if (!state.guildId) { setHtml(host, guildPickerHtml()); return; }
    if (state.contractFailure) { setHtml(host, apiFailureHtml('Could not load this server’s controls', state.contractFailure)); return; }
    if (state.contractCheck && !state.contractCheck.ok) { setHtml(host, contractRefusedHtml(state.contractCheck)); return; }
    if (!state.contract) { setHtml(host, skeletonHtml()); return; }

    if (state.query) setHtml(host, searchResultsHtml());
    else if (state.groupId) setHtml(host, groupHtml(state.groupId));
    else setHtml(host, viewHtml());

    A.mount(host);
    paintDatalists();
  }

  function viewHtml() {
    switch (state.view) {
      case 'modules': return modulesHtml();
      case 'controls': return allControlsHtml();
      case 'activity': return activityHtml();
      case 'connection': return connectionHtml();
      case 'module': return moduleHtml(state.moduleId);
      default: return overviewHtml();
    }
  }

  function skeletonHtml() {
    return '<div class="ad-skel-wrap">'
      + '<div class="as-skeleton ad-skel-line" style="width:38%"></div>'
      + '<div class="as-skeleton ad-skel-line" style="width:64%"></div>'
      + '<div class="ad-controls u-mt-6">'
      + '<div class="as-skeleton ad-skel-card"></div>'
      + '<div class="as-skeleton ad-skel-card"></div>'
      + '<div class="as-skeleton ad-skel-card"></div>'
      + '</div></div>';
  }

  /**
   * ⚠ THE PAGE THAT REPLACES FIXTURES. There is no "offline mode" below this and
   * there must never be one: the honest answer to "the bot is unreachable" is
   * the address it tried and the three things that cause it, not a screen of
   * last-known values that reads exactly like a working console.
   */
  function unreachableHtml(failure) {
    return pageHead('The bot is not answering', 'Nothing below is guessed, and no cached values are shown.')
      + note('danger', C.failureSentence(failure), '<ul class="ad-why">'
        + '<li>The bot is not running, or its web API is off — <code>general.webApi.enabled</code> must be <code>true</code>.</li>'
        + '<li>The address is wrong. This page is trying <code>' + esc(state.apiBase || location.origin) + '</code>.</li>'
        + '<li>This page’s origin (<code>' + esc(location.origin) + '</code>) is not in the API’s <code>origins</code> allowlist, so the browser blocked it.</li>'
        + '</ul>',
        '<button class="as-btn as-btn--primary as-btn--sm" type="button" data-ad-retry>Try again</button>'
        + '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-setapi>Change the API address</button>'
        + '<a class="as-btn as-btn--ghost as-btn--sm" href="preview.html">Open the offline preview instead</a>')
      + '<p class="u-text-xs as-muted u-mt-4">The preview is a separate, fixture-driven page. It is labelled as one on every screen, '
      + 'and it is deliberately not what this console falls back to — a dashboard that answers from fixtures while the bot is '
      + 'down is worse than one that says it is down.</p>';
  }

  function apiFailureHtml(title, failure) {
    return pageHead(title, 'The API answered, and what it said is below.')
      + note('warn', C.failureSentence(failure),
        (failure.body && failure.body.code ? '<p>Code <code>' + esc(failure.body.code) + '</code>.</p>' : '')
        + (failure.body && failure.body.error ? '<p>' + esc(failure.body.error) + '</p>' : ''),
        '<button class="as-btn as-btn--primary as-btn--sm" type="button" data-ad-retry>Try again</button>');
  }

  function signInHtml() {
    return '<div class="ad-signin">'
      + '<div class="ad-signin__card">'
      + '<span class="ad-signin__mark" aria-hidden="true">'
      + '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">'
      + '<path d="M12 2.5v19M12 5 6.6 9M12 11l-5.4 4M12 3.5l6 4.2-6 4.2M12 11.9l6 4.2-6 4.2"/></svg></span>'
      + '<h1 class="ad-signin__title">Configure your server</h1>'
      + '<p class="ad-signin__sub">Sign in with Discord. You will see only the servers where Asbern is installed '
      + '<em>and</em> you hold Administrator — the intersection, never either side alone.</p>'
      + (state.loginError ? note('danger', 'Sign-in did not complete', '<p>' + esc(state.loginError) + '</p>') : '')
      + '<button class="as-btn as-btn--primary as-btn--lg" type="button" data-ad-login>'
      + icon('discord') + ' Continue with Discord</button>'
      + '<ul class="ad-signin__facts">'
      + '<li>' + icon('shield') + '<span><b>Administrator only.</b> Manage Server is deliberately not accepted — this console can wipe an economy and bulk-ban.</span></li>'
      + '<li>' + icon('lock') + '<span><b>No email is ever requested.</b> The scopes are <code>identify</code> and <code>guilds</code>; an email beside a Discord id would turn the session store into personal data.</span></li>'
      + '<li>' + icon('clock') + '<span><b>Eight hours, or one idle hour.</b> Whichever comes first, then you sign in again.</span></li>'
      + '<li>' + icon('sliders') + '<span><b>' + esc(state.health && state.health.controls != null ? state.health.controls : '—') + ' controls</b> are live on this deployment, and every one of them appears here — the page is generated from the bot’s own registry.</span></li>'
      + '</ul>'
      + '<p class="ad-signin__api">API: <code>' + esc(state.apiBase || location.origin) + '</code>'
      + ' <button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-setapi>change</button></p>'
      + '</div></div>';
  }

  function noGuildsHtml() {
    return pageHead('No servers to configure', 'You are signed in, and the intersection is empty.')
      + note('info', 'Nothing here is hidden from you',
        '<p>This console lists the servers where <b>both</b> things are true: Asbern is installed there, '
        + 'and your Discord account holds Administrator. If a server you expect is missing, it is one of those two.</p>'
        + '<p class="u-mt-2">Deliberately not listed: servers you administer where Asbern is not installed (they are not this '
        + 'deployment’s business) and servers this deployment serves where you are not an admin (they are not yours).</p>',
        '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-retry>Check again</button>');
  }

  function guildPickerHtml() {
    return pageHead('Pick a server', 'You administer ' + state.guilds.length + ' server(s) that this deployment serves.')
      + '<div class="ad-guildgrid">'
      + state.guilds.map(function (g) {
        return '<button class="ad-guildcard" type="button" data-ad-guild="' + esc(g.id) + '">'
          + '<span class="ad-guildcard__mark" aria-hidden="true">' + esc(guildMonogram(g.id)) + '</span>'
          + '<span class="ad-guildcard__name">' + esc(guildLabel(g.id)) + '</span>'
          + '<span class="ad-guildcard__id">' + esc(g.id) + '</span>'
          + (g.owner ? '<span class="as-badge as-badge--accent">Owner</span>' : '<span class="as-badge as-badge--plain">Administrator</span>')
          + '</button>';
      }).join('')
      + '</div>';
  }

  /**
   * ⚠ A CONTRACT THAT DOES NOT VERIFY IS NOT RENDERED, AT ALL.
   *
   * This is the one screen the 221-vs-307 incident argues for most directly.
   * That failure was silent because a partial contract still draws correct-looking
   * cards. Drawing 300 of 366 with a warning at the top would repeat it with a
   * banner nobody reads; refusing is the only response that cannot be misread.
   */
  function contractRefusedHtml(check) {
    return pageHead('The control list did not verify', 'Nothing is rendered from a contract that failed its own checksum.')
      + note('danger', check.why || 'The contract failed verification.',
        '<ul class="ad-why">'
        + '<li>State: <code>' + esc(check.state) + '</code></li>'
        + (check.declared ? '<li>The API declared <code>' + esc(check.declared) + '</code>.</li>' : '')
        + (check.have ? '<li>What arrived hashes to <code>' + esc(check.have) + '</code>.</li>' : '')
        + (check.count != null ? '<li>' + esc(check.count) + ' controls arrived' + (check.claimed != null ? ' against ' + esc(check.claimed) + ' claimed' : '') + '.</li>' : '')
        + '</ul>'
        + '<p class="u-mt-2">A dashboard that renders a partial contract shows correct-looking cards and omits the rest in '
        + 'silence. That has already happened once in this product — 221 controls rendered against a registry of 307, with '
        + 'nothing anywhere to say so. This screen is the fix, and it refuses rather than warns.</p>',
        '<button class="as-btn as-btn--primary as-btn--sm" type="button" data-ad-retry>Fetch it again</button>');
  }

  /* ---- Overview -------------------------------------------------------- */

  function overviewHtml() {
    var grouped = C.groupControls(state.contract, state.actor);
    var mods = C.moduleIndex(state.contract);
    var destructive = state.contract.actions.filter(function (a) { return a.destructive; }).length;
    var check = state.contractCheck || {};

    var pool = visibleControls();
    var readOnly = pool.filter(function (a) { return C.severityOf(a) === 'read'; }).length;

    return pageHead(guildLabel(state.guildId),
      'Every control your Discord admin menu has, on one page — generated from the same registry. '
      + 'Start with a filter below, or search from the bar at the top.',
      livePill())

      // ⚠ THE TILES ARE THE FIRST FILTER, NOT A SCOREBOARD. "128 destructive"
      // beside no way to see which 128 is a number an admin can do nothing with.
      // Each one lands on the same list, pre-filtered by the facet it counts.
      + '<div class="ad-stats">'
      + statTile(state.contract.actions.length, 'controls', 'Every one of them is on this page.', '#/controls')
      + statTile(readOnly, 'read-only', 'Change nothing. Safe to press to find something out.', '#/controls', 'readonly', 'read')
      + statTile(destructive, 'destructive', 'Change the server. Each previews or arms first.', '#/controls', 'destructive', 'danger')
      + statTile(mods.length, 'modules', 'Derived from the contract — no second table.', '#/modules')
      + '</div>'

      + '<section class="ad-section">'
      + '<h2 class="ad-section__title">Where do I change things?</h2>'
      + '<div class="ad-duo">'
      + '<div class="ad-panel"><h3 class="ad-panel__title">' + icon('grid') + ' Modules</h3>'
      + '<p class="u-text-sm as-muted">What this server’s Asbern can do, grouped the way the bot groups it. '
      + 'Read each one’s current state without changing anything.</p>'
      + '<a class="as-btn as-btn--primary as-btn--sm u-mt-3" href="#/modules">Open modules</a></div>'
      + '<div class="ad-panel"><h3 class="ad-panel__title">' + icon('sliders') + ' All controls</h3>'
      + '<p class="u-text-sm as-muted">All ' + state.contract.actions.length + ' of them, one scannable row each, '
      + 'filterable by what they do. Search from the top bar if you can name the one you want.</p>'
      + '<a class="as-btn as-btn--secondary as-btn--sm u-mt-3" href="#/controls">Browse everything</a></div>'
      + '</div></section>'

      + '<section class="ad-section">'
      + '<h2 class="ad-section__title">How to read a row</h2>'
      + '<ul class="ad-legend">'
      + legendRow('read', 'Read-only', 'Nothing on the server changes. Press it to find something out.')
      + legendRow('caution', 'Changes things', 'Writes to Discord or to the bot’s stores. Most of these preview first.')
      + legendRow('danger', 'Destructive', 'Marked destructive by the bot itself. Two presses, always — a preview or an arm, then a commit.')
      + legendRow('locked', 'Not yours', 'Above your Discord permission level, or held off by the server owner. Listed, explained, never a dead button.')
      + '</ul>'
      + '</section>'

      + '<section class="ad-section">'
      + '<h2 class="ad-section__title">Tabs</h2>'
      + '<div class="ad-tabgrid">'
      + grouped.map(function (g) {
        return '<a class="ad-tabcard" href="#/group/' + esc(g.group.id) + '">'
          + '<span class="ad-tabcard__emoji" aria-hidden="true">' + esc(g.group.emoji) + '</span>'
          + '<span class="ad-tabcard__name">' + esc(g.group.label) + '</span>'
          + '<span class="ad-tabcard__count">' + g.controls.length + ' control' + (g.controls.length === 1 ? '' : 's')
          + (g.hidden ? ' · ' + g.hidden + ' above your level' : '') + '</span></a>';
      }).join('')
      + '</div></section>'

      + '<section class="ad-section">'
      + '<h2 class="ad-section__title">This page and the bot</h2>'
      + '<div class="ad-kv">'
      + kv('Contract', esc(check.state === 'verified' ? 'verified against its own checksum' : check.state === 'unverifiable' ? 'taken as sent — this browser will not hash outside a secure context' : String(check.state || '—')))
      + kv('Fingerprint', '<code>' + esc((check.declared || '').slice(0, 16) || '—') + '</code>')
      + kv('Controls the API is serving', esc(String((state.health && state.health.controls) || '—')))
      + kv('Live channel', state.health && state.health.live ? 'available' : 'not enabled on this deployment')
      + kv('API origin', '<code>' + esc(state.apiBase || location.origin) + '</code>')
      + '</div>'
      + '<p class="u-text-xs as-muted u-mt-3">Both surfaces call the same <code>adminactions.run()</code>. '
      + 'Nothing syncs, because there is nothing to sync: the module config stores are the single source of truth and '
      + 'this page reads and writes exactly the ones Discord does.</p>'
      + '</section>';
  }

  function statTile(n, label, sub, href, facet, sev) {
    var body = '<span class="ad-stat__n">' + esc(String(n)) + '</span>'
      + '<span class="ad-stat__l">' + esc(label) + '</span>'
      + '<span class="ad-stat__s">' + esc(sub) + '</span>';
    if (!href) return '<div class="ad-stat">' + body + '</div>';
    return '<a class="ad-stat ad-stat--go" href="' + esc(href) + '"'
      + (sev ? ' data-ad-sev="' + esc(sev) + '"' : '')
      + (facet ? ' data-ad-gofacet="' + esc(facet) + '"' : '')
      + '>' + body + '</a>';
  }

  function legendRow(sev, title, why) {
    return '<li class="ad-legend__row" data-ad-sev="' + esc(sev) + '">'
      + '<span class="ad-legend__stripe" aria-hidden="true"></span>'
      + '<span><b>' + esc(title) + '</b> <span class="as-muted">' + esc(why) + '</span></span>'
      + '</li>';
  }

  function kv(k, v) {
    return '<div class="ad-kv__row"><span class="ad-kv__k">' + esc(k) + '</span><span class="ad-kv__v">' + v + '</span></div>';
  }

  /* ---- Modules --------------------------------------------------------- */

  /**
   * ⚠ THE MODULE LIST IS DERIVED FROM THE CONTRACT AND NOT DECLARED ANYWHERE.
   * `adminactions.js` exports `MODULES` and `GROUP_MODULE` for exactly this and
   * says why: "A dashboard that re-declares the group→module map is a dashboard
   * that will disagree with the gate one day." The preview build kept its own.
   * This one counts what arrived.
   */
  function modulesHtml() {
    var mods = C.moduleIndex(state.contract);
    var stale = state.readGuild !== state.guildId;

    return pageHead('Modules', 'What this server’s Asbern can do, and which controls belong to each.',
      '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-readstate>'
      + icon('trend') + ' Read current state</button>')

      + note('info', 'On/off lives in the controls, and this is not a trick of layout',
        '<p>The registry publishes what a control <em>asks for</em>, never what the store <em>holds</em> — there is no '
        + 'read-value endpoint on the write API. So a module’s current state comes from running the bot’s own read-only '
        + 'controls (<code>bot.features</code>, <code>automod.show</code>, <code>verify.status</code> …) and showing what '
        + 'they return. Same runner, same gates, same answer Discord gets.</p>'
        + (stale ? '<p class="u-mt-2">Nothing has been read yet for this server. Press <b>Read current state</b> — each read '
          + 'writes one audit line, which is why it is not on a timer.</p>' : ''))

      + '<div class="ad-mods u-mt-6">'
      + mods.map(moduleCardHtml).join('')
      + '</div>';
  }

  /**
   * ⚠ THE LAMP DESCRIBES **THE READ**, NOT THE MODULE, AND THAT DISTINCTION IS
   * THE WHOLE HONESTY OF THIS CARD. The contract publishes what a control ASKS
   * FOR and never what the store HOLDS — there is no read-value endpoint on the
   * write API — so this page has no way to know whether a module is on. What it
   * CAN know, exactly, is whether it managed to run that module's own read-only
   * controls and what they answered. Inferring "enabled" by pattern-matching the
   * text those controls return would be a number that looks authoritative and
   * is a guess, which is the defect class this whole console exists against.
   *
   * So: `unknown` (never asked) · `online` (every read answered) · `degraded`
   * (some read refused) · `offline` (a read failed outright). Four states, and
   * `unknown` is hollow rather than red — dashboard.css §12's rule, verbatim:
   * "'offline' is a stated condition, never assumed to be 'no'."
   */
  function moduleReadState(reads) {
    var asked = 0, refused = 0, failed = 0, at = 0;
    for (var i = 0; i < reads.length; i += 1) {
      var st = state.readState[reads[i].id];
      if (!st) continue;
      asked += 1;
      if (st.at > at) at = st.at;
      if (!st.ok) { if (st.result && st.result.refused) refused += 1; else failed += 1; }
    }
    if (!reads.length) return { lamp: 'unknown', word: 'nothing to read', at: 0, title: 'This module publishes no read-only control, so there is nothing to ask.' };
    if (!asked) return { lamp: 'unknown', word: 'not read yet', at: 0, title: 'Nobody has asked. Each read costs one audit line, so it is not on a timer.' };
    if (failed) return { lamp: 'offline', word: 'a read failed', at: at, title: failed + ' of ' + asked + ' reads did not answer.' };
    if (refused) return { lamp: 'degraded', word: 'a read was refused', at: at, title: refused + ' of ' + asked + ' reads were refused by a gate. That is an answer, not an error.' };
    return { lamp: 'online', word: 'read ' + when(at), at: at, title: 'All ' + asked + ' read-only controls answered.' };
  }

  function moduleCardHtml(m) {
    var reads = C.autoReadControls(state.contract, m.id);
    var rs = moduleReadState(reads);
    var readOut = reads.map(function (r) {
      var st = state.readState[r.id];
      if (!st) return '';
      return '<div class="ad-modread"><span class="ad-modread__id">' + esc(r.id) + '</span>'
        + '<span class="ad-modread__at">' + esc(when(st.at)) + '</span>'
        // ⚠ A READ'S ANSWER IS SOMEBODY ELSE'S PROSE AND CAN BE ANY WIDTH. Its
        // own scroller, so a long line scrolls inside the card and the page body
        // never goes sideways.
        + '<div class="ad-modread__body u-scroll-x">' + C.resultHtml(st.result, null) + '</div></div>';
    }).join('');

    var share = m.controls && state.contract.actions.length
      ? Math.max(3, Math.round((m.controls / state.contract.actions.length) * 100)) : 0;

    return '<article class="ad-mod' + (m.withheld ? ' is-unavailable' : '') + '" data-ad-module="' + esc(m.id) + '">'
      + '<div class="ad-mod__top">'
      + '<div class="u-grow"><div class="ad-mod__name">' + esc(prettyModule(m.id)) + '</div>'
      + '<div class="ad-mod__id">' + esc(m.id) + '</div></div>'
      + '<span class="ad-mod__ctl">'
      + (m.withheld
        ? '<span class="ad-lamp ad-lamp--unknown" title="' + esc(m.why) + '">held off</span>'
        : '<span class="ad-lamp ad-lamp--' + esc(rs.lamp) + '" title="' + esc(rs.title) + '">' + esc(rs.word) + '</span>')
      + '</span>'
      + '</div>'
      + (m.withheld
        ? '<p class="ad-mod__why">' + icon('lock') + ' ' + esc(m.why) + '</p>'
        : '<p class="ad-mod__why">' + esc(String(m.controls)) + ' control' + (m.controls === 1 ? '' : 's')
          + (m.destructive ? ' · <b class="ad-mod__danger">' + m.destructive + ' destructive</b>' : '')
          + ' · ' + esc(m.groups.join(', ')) + '</p>')
      // A share bar: how much of this server's console belongs to this module.
      // Encodes the count as a length so the list reads without arithmetic.
      + '<div class="ad-mod__bar" aria-hidden="true"><span style="width:' + share + '%"></span></div>'
      + (readOut ? '<div class="ad-mod__read">' + readOut + '</div>' : '')
      + '<div class="ad-mod__foot">'
      + '<a class="as-btn as-btn--secondary as-btn--sm" href="#/module/' + esc(m.id) + '">'
      + 'Open ' + esc(String(m.controls)) + ' control' + (m.controls === 1 ? '' : 's') + '</a>'
      + (reads.length && !m.withheld
        ? '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-readmodule="' + esc(m.id) + '">'
          + (rs.lamp === 'unknown' ? 'Read state' : 'Read again') + '</button>'
        : '')
      + '</div></article>';
  }

  function prettyModule(id) {
    return String(id).split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  /* ---- All controls / one tab / one module ------------------------------ */

  function controlsGridHtml(list, opts) {
    var o = opts || {};
    if (!list.length) {
      return '<p class="ad-empty">'
        + (state.facets.length
          ? 'No control matches every filter you have on. Turn one off, or clear them all.'
          : 'Nothing here for you. ' + (state.actor.isOwner ? '' : 'Some controls are above your permission level.'))
        + '</p>';
    }
    return '<div class="ad-controls">' + list.map(function (a) {
      return C.controlCardHtml(a, {
        actor: state.actor,
        groups: state.contract.groups,
        showGroup: !!o.showGroup,
        open: !!state.open[a.id] || !!o.openAll,
      });
    }).join('') + '</div>';
  }

  /** Everything this actor may see, before the facets narrow it. */
  function visibleControls() {
    return state.contract.actions.filter(function (a) { return C.maySee(a, state.actor); });
  }

  /**
   * ⚠ THE TAB STRIP IS STICKY BECAUSE THE BIGGEST TAB HOLDS 97 CONTROLS.
   * `dashboard.css` §1 shipped `.ad-sticky-tabs` for exactly this and nothing
   * ever emitted it: halfway down Bot there was no way to change tab except
   * scrolling back to the sidebar, which on a phone is above the whole list.
   */
  function tabStripHtml(grouped, activeId) {
    return '<nav class="ad-sticky-tabs" aria-label="Jump to a tab">'
      + '<div class="ad-tabstrip">'
      + grouped.map(function (g) {
        var on = activeId === g.group.id;
        return '<a class="as-chip ad-tabchip' + (on ? ' is-active' : '') + '"'
          + ' href="#' + (activeId ? '/group/' + esc(g.group.id) : 'tab-' + esc(g.group.id)) + '"'
          + (on ? ' aria-current="page"' : '') + '>'
          + '<span aria-hidden="true">' + esc(g.group.emoji) + '</span>' + esc(g.group.label)
          + '<span class="ad-facet__n">' + g.controls.length + '</span></a>';
      }).join('')
      + '</div></nav>';
  }

  function allControlsHtml() {
    var grouped = C.groupControls(state.contract, state.actor);
    var pool = visibleControls();
    var shown = C.filterControls(pool, state.facets);
    var keep = {};
    for (var i = 0; i < shown.length; i += 1) keep[shown[i].id] = true;

    return pageHead('All controls',
      'Every control the bot has, in the tab it lives on in Discord. Each row says what it does; open one to see its fields.',
      '<a class="as-btn as-btn--ghost as-btn--sm" href="#/overview">Back to overview</a>')
      + stickyHeadHtml(tabStripHtml(grouped, null) + toolbarHtml(pool, shown))
      + grouped.map(function (g) {
        var list = g.controls.filter(function (a) { return keep[a.id]; });
        return '<section class="ad-section" id="tab-' + esc(g.group.id) + '">'
          + '<h2 class="ad-section__title"><span aria-hidden="true">' + esc(g.group.emoji) + '</span> ' + esc(g.group.label)
          + ' <span class="ad-count">' + list.length
          + (list.length === g.controls.length ? '' : ' of ' + g.controls.length) + '</span></h2>'
          // ⚠ AN EMPTY TAB STILL RENDERS ITS HEADING. A section that disappears
          // under a filter is indistinguishable from a tab that was never built,
          // which is the same argument groupControls() makes for keeping empty
          // groups in the sidebar.
          + (list.length
            ? controlsGridHtml(list)
            : '<p class="ad-empty">Nothing in this tab matches the filters above.</p>')
          + '</section>';
      }).join('');
  }

  function groupHtml(groupId) {
    var g = state.contract.groups.filter(function (x) { return x.id === groupId; })[0];
    if (!g) { state.groupId = null; return overviewHtml(); }
    var grouped = C.groupControls(state.contract, state.actor);
    var all = state.contract.actions.filter(function (a) { return a.group === groupId; });
    var pool = all.filter(function (a) { return C.maySee(a, state.actor); });
    var shown = C.filterControls(pool, state.facets);
    return pageHead(g.emoji + ' ' + g.label,
      esc(String(pool.length)) + ' control' + (pool.length === 1 ? '' : 's') + ' you can use'
      + (all.length !== pool.length ? ' · ' + (all.length - pool.length) + ' above your permission level' : ''),
      '<a class="as-btn as-btn--ghost as-btn--sm" href="#/controls">All tabs</a>')
      + stickyHeadHtml(tabStripHtml(grouped, groupId) + toolbarHtml(pool, shown))
      + controlsGridHtml(shown);
  }

  function moduleHtml(moduleId) {
    var pool = state.contract.actions.filter(function (a) { return a.module === moduleId && C.maySee(a, state.actor); });
    var shown = C.filterControls(pool, state.facets);
    return pageHead(prettyModule(moduleId),
      '<code>' + esc(moduleId) + '</code> · ' + pool.length + ' control' + (pool.length === 1 ? '' : 's')
      + ' across ' + tabsOfHtml(pool),
      '<a class="as-btn as-btn--ghost as-btn--sm" href="#/modules">All modules</a>')
      + (C.isWithheld(moduleId)
        ? note('warn', 'This module is held off', '<p>' + esc(C.WITHHELD_MODULES[moduleId]) + '</p>')
        : '')
      + stickyHeadHtml(toolbarHtml(pool, shown))
      + controlsGridHtml(shown, { showGroup: true });
  }

  /** "3 tabs" — named, because a module's controls are scattered across them. */
  function tabsOfHtml(list) {
    var seen = {};
    var names = [];
    for (var i = 0; i < list.length; i += 1) {
      if (seen[list[i].group]) continue;
      seen[list[i].group] = true;
      var g = state.contract.groups.filter(function (x) { return x.id === list[i].group; })[0];
      names.push(esc(g ? g.label : list[i].group));
    }
    return names.join(', ') || '—';
  }

  function searchResultsHtml() {
    var pool = C.searchControls(visibleControls(), state.query, 60);
    var hits = C.filterControls(pool, state.facets);
    // ⚠ A HANDFUL OF HITS OPENS ITSELF. If you searched for a control by name
    // and there are three answers, making you click each one is a step the page
    // could have taken for you. Above that it is a wall again, so it does not.
    var openAll = hits.length > 0 && hits.length <= 3;
    return pageHead('“' + state.query + '”', pool.length + ' match' + (pool.length === 1 ? '' : 'es')
      + ' across ' + state.contract.actions.length + ' controls — ranked by id, then label, then the help text',
      '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-clearsearch>Clear search</button>')
      + (pool.length ? stickyHeadHtml(toolbarHtml(pool, hits)) : '')
      + (hits.length ? controlsGridHtml(hits, { showGroup: true, openAll: openAll })
        : '<p class="ad-empty">'
          + (pool.length ? 'Those matches are all filtered out. Turn a filter off above.'
            : 'No control matches that. Search looks at the id, the label, the help text and the module.')
          + '</p>');
  }

  /* ---- Activity -------------------------------------------------------- */

  function activityHtml() {
    return pageHead('Activity', 'What this browser did, and what arrived on the live channel.', livePill())
      + note('info', 'This is not the audit log',
        '<p>The server keeps its own, one line per attempt <em>including every refusal</em>, with <code>secret</code> '
        + 'params dropped rather than masked and free text recorded as a length. This list is the same reduction applied '
        + 'to what happened in this tab, so nothing here is more revealing than what the server already wrote.</p>')
      + (state.activity.length
        ? '<div class="ad-log u-mt-6">' + state.activity.map(logRowHtml).join('') + '</div>'
        : '<p class="ad-empty">Nothing yet this session.</p>');
  }

  /**
   * ⚠ ONE OUTCOME VOCABULARY, READ FROM dashboard-core's TABLE. This row used to
   * carry its own `as-badge--success / frost / warn / danger` map while the
   * result strip inside the card used `--ok / --dry / --warn / --err` and
   * `dashboard.css` shipped a THIRD set (`.ad-outcome--ok/dry/ref/err`) that
   * nothing emitted at all. Three names for four states is how "refused" ends up
   * reading as an error in one place and a warning two inches away.
   */
  function logRowHtml(e) {
    var tone = C.OUTCOME_TONE[e.outcome];
    var cls = tone ? tone.chip : (e.outcome === 'live' ? 'ad-outcome--dry' : 'ad-outcome--ok');
    var word = tone ? tone.word : String(e.outcome || '—');
    var title = tone ? tone.say : 'Published on the live channel by the bot.';
    return '<div class="ad-log__row">'
      + '<span class="ad-outcome ' + cls + '" title="' + esc(title) + '">' + esc(word) + '</span>'
      + '<span class="ad-log__what">' + esc(e.label || e.event || e.detail || e.kind) + '</span>'
      + '<code class="ad-log__id">' + esc(e.actionId || e.event || '') + '</code>'
      + '<span class="ad-log__params u-scroll-x">' + esc(e.params ? JSON.stringify(e.params) : '') + '</span>'
      + '<span class="ad-log__at">' + esc(when(e.at)) + '</span>'
      + '</div>';
  }

  /* ---- Connection ------------------------------------------------------ */

  function connectionHtml() {
    var check = state.contractCheck || {};
    var csrf = csrfCookie();
    return pageHead('Connection', 'What this page is talking to, and what it can and cannot do.')
      + (state.apiWarning ? note('warn', state.apiWarning, '') : '')
      + '<div class="ad-kv">'
      + kv('API origin', '<code>' + esc(state.apiBase || location.origin) + '</code>')
      + kv('This page’s origin', '<code>' + esc(location.origin) + '</code>')
      + kv('Same origin', state.apiBase === '' || state.apiBase === location.origin ? 'yes — writes are possible' : 'no')
      + kv('CSRF token readable', csrf ? 'yes' : 'no — writes will be refused before they are sent')
      + kv('Controls on the API', esc(String((state.health && state.health.controls) || '—')))
      + kv('API fingerprint', '<code>' + esc(((state.health && state.health.fingerprint) || '').slice(0, 16) || '—') + '</code>')
      + kv('Contract check', esc(String(check.state || '—')))
      + kv('Live channel', esc(state.live.status) + (state.live.events ? ' · ' + state.live.events + ' event(s)' : ''))
      + kv('Session expires', state.me && state.me.expiresAt ? esc(new Date(state.me.expiresAt).toLocaleString()) : '—')
      + '</div>'
      + (csrf ? '' : note('warn', 'This console is read-only from here',
        '<p>The CSRF token is a readable cookie the page must echo back in a header, and a browser will not hand a '
        + 'cross-site page another origin’s cookie. Serve this console from the same origin as the API — a reverse proxy '
        + 'mapping <code>/v1/*</code> to the bot and everything else to these static files — and writes work.</p>'))
      + note('info', 'What the live channel needs',
        '<p>The socket refuses any upgrade carrying an <code>Origin</code> it does not know, <em>even on loopback</em>, '
        + 'because <code>Origin</code> is the only CSWSH defence available to a socket that cannot send headers. '
        + 'Add <code>' + esc(location.origin) + '</code> to <code>general.webApi.origins</code>.</p>')
      + '<div class="as-row u-mt-4">'
      + '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-setapi>Change the API address</button>'
      + '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-retry>Re-check</button>'
      + '</div>';
  }

  /* =======================================================================
     10 · RUNNING A CONTROL
     ======================================================================= */

  function controlById(id) {
    if (!state.contract) return null;
    var list = state.contract.actions;
    for (var i = 0; i < list.length; i += 1) if (list[i].id === id) return list[i];
    return null;
  }

  function readCard(card) {
    var raw = {};
    $$('[data-ad-param]', card).forEach(function (input) {
      var name = input.getAttribute('data-ad-param');
      raw[name] = input.type === 'checkbox' ? input.checked : input.value;
    });
    return raw;
  }

  function clearFieldErrors(card) {
    $$('[data-ad-err]', card).forEach(function (n) { n.setAttribute('hidden', ''); n.textContent = ''; });
    $$('[data-ad-param]', card).forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }

  function showFieldErrors(card, fieldErrors) {
    Object.keys(fieldErrors).forEach(function (name) {
      var input = card.querySelector('[data-ad-param="' + name + '"]');
      if (!input) return;
      input.setAttribute('aria-invalid', 'true');
      var field = input.closest('.as-field');
      var err = field && field.querySelector('[data-ad-err]');
      if (err) { err.textContent = fieldErrors[name]; err.removeAttribute('hidden'); }
    });
  }

  function paintResult(card, result, control) {
    var host = card.querySelector('[data-ad-result]');
    if (host) host.innerHTML = C.resultHtml(result, control);
  }

  /**
   * ⚠ IDS THE ADMIN HAS TYPED ARE REMEMBERED, AND NOTHING ELSE IS.
   * The API publishes no channel or role list, so the only legitimate source of
   * suggestions is what this admin has already used on this machine. Secrets are
   * excluded by type — a `datalist` is markup, and markup is a screenshot.
   */
  function rememberIds(control, values) {
    (control.params || []).forEach(function (p) {
      if (p.secret) return;
      if (['member', 'channel', 'category', 'role'].indexOf(p.type) < 0) return;
      var v = values[p.name];
      if (!v || !/^\d{17,20}$/.test(String(v))) return;
      try {
        var key = 'asbern.ids.' + p.type;
        var have = JSON.parse(localStorage.getItem(key) || '[]');
        if (have.indexOf(v) < 0) { have.unshift(v); localStorage.setItem(key, JSON.stringify(have.slice(0, 30))); }
      } catch (e) { /* private mode */ }
    });
    paintDatalists();
  }

  function paintDatalists() {
    ['member', 'channel', 'category', 'role'].forEach(function (t) {
      var host = document.getElementById('ad-ids-' + t);
      if (!host) return;
      var have = [];
      try { have = JSON.parse(localStorage.getItem('asbern.ids.' + t) || '[]'); } catch (e) { have = []; }
      host.innerHTML = have.map(function (v) { return '<option value="' + esc(v) + '"></option>'; }).join('');
    });
  }

  async function doRun(card, control, opts) {
    var o = opts || {};
    clearFieldErrors(card);
    var raw = readCard(card);

    // ⚠ LOCAL VALIDATION IS A COURTESY AND IS NEVER THE GATE. It exists so an
    // admin learns "that is not a channel id" without a round trip. The server
    // runs `registry.validate()` regardless, on the same table this one is a
    // pinned port of, so this cannot let through anything Discord would refuse.
    var checked = C.validate(control, raw);
    if (!checked.ok) {
      // ⚠ AN ERROR ON A FIELD NOBODY CAN SEE IS NOT AN ERROR MESSAGE. The card
      // is normally open (the button lives inside the disclosure), but "Collapse
      // all" can close it while a request is in flight, and a validation refusal
      // that paints into a `hidden` body is a press that visibly did nothing.
      state.open[control.id] = true;
      setCardOpen(card, card.querySelector('[data-ad-toggle]'), true);
      showFieldErrors(card, checked.fieldErrors);
      paintResult(card, { ok: false, refused: 'params', error: checked.errors.join(' · ') }, control);
      logRun(control, checked.values, 'refused', 'local validation');
      return;
    }

    if (state.busy[control.id]) return;
    state.busy[control.id] = true;
    var btn = card.querySelector('[data-ad-run]');
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }

    var r = await state.api.run(state.guildId, control.id, checked.values, {
      commit: o.commit === true,
      confirm: o.confirm === true,
    });

    state.busy[control.id] = false;
    if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }

    if (!r.ok && r.reason !== C.REASON.HTTP) {
      paintResult(card, { ok: false, error: C.failureSentence(r) }, control);
      logRun(control, checked.values, 'error', r.reason);
      return;
    }

    // ⚠ AN HTTP FAILURE MAY STILL CARRY A REAL ANSWER. A 400 with
    // `{ok:false, refused:'permission'}` is the runner speaking, and it is worth
    // more than "HTTP 400". Only fall back to a transport sentence when the body
    // says nothing.
    var body = r.ok ? r.body : (r.body || null);
    if (!body) {
      paintResult(card, { ok: false, error: C.failureSentence(r) }, control);
      logRun(control, checked.values, 'error', String(r.status || r.reason));
      return;
    }
    if (!r.ok && body.code && !body.refused) body.refused = body.code;

    paintResult(card, body, control);
    rememberIds(control, checked.values);
    logRun(control, checked.values, C.outcomeOf(body), body.refused || body.err_code || null);

    if (body.ok && !body.dryRun) {
      A.toast(control.label + ' — done', { variant: 'success' });
      // A committed write may have changed what the state cards say.
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(function () { refreshReadState(true); }, 600);
    } else if (body.refused) {
      A.toast('Refused: ' + body.refused, { variant: 'warn' });
    }
  }

  /* =======================================================================
     11 · EVENTS
     ======================================================================= */

  function wire() {
    A.on('click', '[data-ad-login]', async function () {
      var r = await state.api.loginUrl();
      if (!r.ok) { state.loginError = C.failureSentence(r); render(); return; }
      if (!r.body || !r.body.url) { state.loginError = 'The API did not return a Discord URL. Is `webApi.clientId` set?'; render(); return; }
      location.assign(r.body.url);
    });

    A.on('click', '[data-ad-logout]', async function () {
      closeLive();
      await state.api.logout();
      state.me = false; state.guilds = []; state.guildId = null; state.contract = null;
      logActivity({ kind: 'auth', outcome: 'ok', detail: 'signed out' });
      render();
    });

    A.on('click', '[data-ad-retry]', function () { location.reload(); });

    A.on('click', '[data-ad-setapi]', function () {
      // ⚠ NO EXAMPLE ADDRESS. This used to end with a loopback host and port as
      // an illustration, and `test/v172`'s LAW 1 scan flagged it — correctly.
      // The default port is the API package's, not this install's; printing it
      // here tells a self-hoster who changed it a number that is wrong for them,
      // and it is the first literal address a reader would copy.
      var next = window.prompt(
        'Where is your Asbern API?\n\n'
        + 'Leave blank to use this page’s own origin (' + location.origin + '), which is the\n'
        + 'only arrangement where writes work. Otherwise a full origin — scheme, host and port.',
        state.apiBase || '');
      if (next === null) return;
      var v = String(next).trim();
      if (!v) { storeApi(''); location.reload(); return; }
      var norm = normaliseOrigin(v);
      if (norm === null) { window.alert('That is not an http(s) origin.'); return; }
      storeApi(norm);
      location.reload();
    });

    A.on('click', '[data-ad-switch-btn]', function (ev, btn) {
      var menu = btn.parentNode.querySelector('[data-ad-switch-menu]');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (menu) { if (open) menu.setAttribute('hidden', ''); else menu.removeAttribute('hidden'); }
    });

    A.on('click', '[data-ad-guild]', function (ev, btn) {
      selectGuild(btn.getAttribute('data-ad-guild'));
      var menu = document.querySelector('[data-ad-switch-menu]');
      if (menu) menu.setAttribute('hidden', '');
    });

    A.on('click', '[data-ad-name-guild]', function () {
      if (!state.guildId) return;
      var next = window.prompt('What do you call this server? (Stored in this browser only — the API does not publish Discord’s names.)', guildLabel(state.guildId));
      if (next === null) return;
      try {
        if (String(next).trim()) localStorage.setItem('asbern.guildname.' + state.guildId, String(next).trim());
        else localStorage.removeItem('asbern.guildname.' + state.guildId);
      } catch (e) { /* private mode */ }
      render();
    });

    A.on('click', '[data-ad-readstate]', function () { refreshReadState(false); });
    A.on('click', '[data-ad-readmodule]', async function (ev, btn) {
      var id = btn.getAttribute('data-ad-readmodule');
      var reads = C.autoReadControls(state.contract, id);
      for (var i = 0; i < reads.length; i += 1) {
        /* eslint-disable no-await-in-loop */
        var r = await state.api.run(state.guildId, reads[i].id, {});
        state.readState[reads[i].id] = {
          at: Date.now(),
          ok: !!(r.ok && r.body && r.body.ok !== false),
          result: r.ok ? r.body : { ok: false, error: C.failureSentence(r) },
        };
        /* eslint-enable no-await-in-loop */
      }
      state.readGuild = state.guildId;
      render();
    });

    A.on('click', '[data-ad-clearsearch]', function () {
      state.query = '';
      render();
      var box = $('#ad-q');
      if (box) box.focus();
    });

    /* ── the disclosure ─────────────────────────────────────────────────
       ⚠ THE DOM IS TOGGLED IN PLACE AND THE STATE OBJECT IS UPDATED TOO.
       Only re-rendering would be simpler and it is wrong twice over: it
       drops the caret of anybody typing in a field on ANOTHER open card,
       and it costs a full 369-card rebuild for one chevron. The state
       write is what makes the expansion survive the NEXT render, which
       comes from somewhere else entirely (a live event, a background
       read, an activity line). */
    A.on('click', '[data-ad-toggle]', function (ev, btn) {
      var id = btn.getAttribute('data-ad-toggle');
      var card = btn.closest('[data-ad-card]');
      var want = btn.getAttribute('aria-expanded') !== 'true';
      state.open[id] = want;
      if (!want) delete state.open[id];
      setCardOpen(card, btn, want);
    });

    A.on('click', '[data-ad-facet]', function (ev, btn) {
      var id = btn.getAttribute('data-ad-facet');
      var at = state.facets.indexOf(id);
      if (at > -1) state.facets.splice(at, 1); else state.facets.push(id);
      render();
      // ⚠ PUT THE FOCUS BACK ON THE CHIP THAT WAS PRESSED. render() replaces
      // #ad-main wholesale, so the element that had focus is gone and the
      // browser drops focus to <body> — which sends a keyboard admin back to
      // the top of the document on every single filter press.
      refocus('[data-ad-facet="' + id + '"]');
    });

    A.on('click', '[data-ad-clearfacets]', function () {
      state.facets = [];
      render();
      refocus('[data-ad-facet]');
    });

    // A stat tile is a filter, not a scoreboard: it sets the facet on the way.
    A.on('click', '[data-ad-gofacet]', function (ev, el) {
      state.facets = [el.getAttribute('data-ad-gofacet')];
    });

    A.on('click', '[data-ad-expandall]', function (ev, btn) {
      var want = btn.getAttribute('data-ad-expandall') === '1';
      $$('[data-ad-card]').forEach(function (card) {
        var id = card.getAttribute('data-ad-card');
        var disc = card.querySelector('[data-ad-toggle]');
        if (want) state.open[id] = true; else delete state.open[id];
        setCardOpen(card, disc, want);
      });
      btn.setAttribute('data-ad-expandall', want ? '0' : '1');
      btn.textContent = want ? 'Collapse all' : 'Expand all';
    });

    var searchTimer = null;
    A.on('input', '[data-ad-search]', function (ev, input) {
      var v = input.value;
      if (searchTimer) window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        state.query = v;
        var host = $('#ad-main');
        if (!host || !state.contract) return;
        setHtml(host, state.query ? searchResultsHtml() : (state.groupId ? groupHtml(state.groupId) : viewHtml()));
        A.mount(host);
        paintDatalists();
      }, 120);
    });

    // ⚠ THE TWO-STEP GESTURE, AND IT IS THE SAME ONE DISCORD USES.
    //   dryRun control  → first press previews, the preview grows "Do it"
    //   confirm control → first press arms the button for six seconds
    // `packages/api/src/routes.js` enforces the server half: a POST with no
    // `commit` is the first press, always, "so a client that forgets the field
    // previews and a client that sends garbage previews."
    A.on('click', '[data-ad-run]', function (ev, btn) {
      var id = btn.getAttribute('data-ad-run');
      var control = controlById(id);
      var card = btn.closest('[data-ad-card]');
      if (!control || !card) return;

      var commit = btn.getAttribute('data-ad-commit') === '1';

      if (!commit && control.confirm && !control.dryRun && btn.getAttribute('data-ad-arm') === '1') {
        btn.removeAttribute('data-ad-arm');
        btn.classList.add('as-btn--danger');
        btn.classList.remove('as-btn--primary');
        btn.textContent = 'Do it — press again';
        paintResult(card, {
          ok: false, refused: 'arm',
          error: control.destructive
            ? 'This is marked destructive in the registry. Press again to run it.'
            : 'Press again to run it.',
        }, null);
        window.setTimeout(function () {
          if (!btn.isConnected || btn.getAttribute('data-ad-arm') === '1') return;
          btn.setAttribute('data-ad-arm', '1');
          btn.textContent = C.primaryVerb(control);
        }, 6000);
        return;
      }

      // ⚠ `confirm:true` IS REQUIRED FOR THE `confirm && !dryRun` SHAPE, AND
      // FORGETTING IT IS A REFUSAL, NOT A CRASH. `routes.normaliseInvocation()`:
      //
      //   if (route.confirm && !route.dryRun && !dryRun && b.confirm !== true)
      //     return { refused: 'confirm-required' }
      //
      // That combination is unreachable in today's registry — `define()` defaults
      // `confirm` and `dryRun` together — so a client that omitted the field
      // would work perfectly until the first control declared it, and then refuse
      // for one control with a code nobody could place. The arming press above IS
      // the confirmation this field asserts.
      var needsConfirm = !!(control.confirm && !control.dryRun);
      doRun(card, control, { commit: commit || needsConfirm, confirm: needsConfirm });
    });

    window.addEventListener('hashchange', route);
    document.addEventListener('click', function (ev) {
      var sw = document.querySelector('[data-ad-switch]');
      if (sw && !sw.contains(ev.target)) {
        var menu = sw.querySelector('[data-ad-switch-menu]');
        var btn = sw.querySelector('[data-ad-switch-btn]');
        if (menu) menu.setAttribute('hidden', '');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // ⌘K / Ctrl-K / "/" to the search box — 369 controls is not a browsable
    // number, and the box is the primary navigation rather than a convenience.
    // ⚠ THE BARE "/" ARM MUST NOT FIRE WHILE SOMEBODY IS TYPING. Without the
    // field check it eats the slash out of every reason, pattern and name an
    // admin types into a control's own form.
    document.addEventListener('keydown', function (ev) {
      var box = $('#ad-q');
      var inField = typing(ev.target);
      if ((ev.metaKey || ev.ctrlKey) && String(ev.key).toLowerCase() === 'k') {
        if (box) { ev.preventDefault(); box.focus(); box.select(); }
        return;
      }
      if (ev.key === '/' && !inField && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        if (box) { ev.preventDefault(); box.focus(); box.select(); }
        return;
      }
      if (ev.key === 'Escape' && state.query) { state.query = ''; render(); }
    });
  }

  /**
   * ⚠ A ROUTE STARTS `#/`. ANYTHING ELSE IS AN IN-PAGE ANCHOR AND MUST NOT
   * CHANGE THE VIEW. The tab strip on the All-controls page links to
   * `#tab-<group>` so a click jumps 97 rows down the same document; without this
   * distinction the old parser read `tab-bot` as a view name, matched nothing in
   * `viewHtml()`'s switch, and dumped the admin on the Overview — a link that
   * looks like navigation and silently does the opposite. Card ids (`#ctl-…`)
   * are the same shape, so deep-linking one control also survives.
   */
  function isRoute() { return /^#\//.test(String(location.hash || '')); }

  function parseHash() {
    if (!isRoute()) return;
    var h = String(location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    state.groupId = null;
    state.moduleId = null;
    if (!parts.length) { state.view = 'overview'; }
    else if (parts[0] === 'group' && parts[1]) { state.groupId = decodeURIComponent(parts[1]); state.view = 'controls'; }
    else if (parts[0] === 'module' && parts[1]) { state.moduleId = decodeURIComponent(parts[1]); state.view = 'module'; }
    else { state.view = parts[0]; }
  }

  function route() {
    if (!isRoute()) {
      // An in-page anchor. The document is already correct; let the browser do
      // what it was going to do and do not steal the scroll position.
      scrollToAnchor();
      return;
    }
    parseHash();
    render();
    if (state.view === 'modules' && state.contract && state.readGuild !== state.guildId) {
      // One read per server per session on the view the owner uses most —
      // proportionate, and it is one audit line rather than a poll.
      refreshReadState(true);
    }
    window.scrollTo({ top: 0, behavior: A.reducedMotion ? 'auto' : 'smooth' });
  }

  /** Re-run the anchor jump, because the target was drawn after the hash was set. */
  function scrollToAnchor() {
    var id = String(location.hash || '').replace(/^#/, '');
    if (!id) return;
    var node = document.getElementById(id);
    if (node && node.scrollIntoView) {
      node.scrollIntoView({ block: 'start', behavior: A.reducedMotion ? 'auto' : 'smooth' });
    }
  }

  /* =======================================================================
     12 · GO
     ======================================================================= */

  function start() {
    wire();
    parseHash();
    boot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

}());
