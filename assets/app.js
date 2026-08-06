/* =============================================================================
   ASBERN · MEMBER APP  ·  assets/app.js
   -----------------------------------------------------------------------------
   The shared brain for app.html / watch.html / casino.html / leaderboards.html.
   Vanilla, no dependencies, no build step, runs straight off `file://`.

   Layers on assets/asbern.js (theme, icons, toasts, modals, formatters) and
   assets/mock-data.js (the one shared mock world). It never modifies either.

   =============================================================================
   ⭐ THE ONE ARCHITECTURAL RULE THIS FILE EXISTS TO DEMONSTRATE
   =============================================================================

   docs/_platform/ARCHITECTURE.md §5:

     "Casino in web/mobile — ⭐ Nearly free: casino.js has zero discord.js refs
      and is already pure maths. The **server** runs it (never the client, or the
      odds are editable); the client renders. One implementation, one set of
      money tests, three front ends."

   So this file is split in two, and the seam is load-bearing:

     §2 RULES   a faithful port of the numbers in packages/core — payout tables,
                XP curves, asset costs, achievement conditions. Read-only
                constants and pure formatting. Porting these is safe because
                getting them wrong shows a member a wrong LABEL, not a wrong
                PAYOUT.

     §3 SERVER  the mock backend. It owns every balance, every deck, every
                pre-rolled crash point, and every call to Math.random(). It is
                the ONLY place in this file that decides an outcome.

     §4 CLIENT  the UI. It calls §3 and renders what comes back. It never rolls
                a die, never looks at a hole card it was not dealt, and never
                computes whether it won.

   In production §3 is deleted and every `MemberApp.server.*` call becomes an
   HTTP request to `/v1/...` (src/lib/botapi.js) which runs the real
   packages/core/src/casino.js and packages/core/src/economy.js. The client code
   in §4 does not change, because it already cannot tell the difference. That is
   the whole point: a client that could compute the outcome is a client that
   could edit the odds.

   ⚠ If you are extending this file and you find yourself typing Math.random()
     outside §3, stop. You are writing the bug this comment exists to prevent.

   =============================================================================
   AND THE OTHER RULE, WHICH IS A LEGAL ONE
   =============================================================================

   docs/_platform/PRICING.md §2, quoting DISCORD-VERIFICATION-DRAFT.md:180:

     ⛔ A tier may NEVER grant currency, alter a balance, change odds, multiply a
        payout, add a daily bonus, or sell anything purchasable with real money
        that converts to Bucks.

   There is therefore no "buy Bucks" anywhere in this app, and there never can
   be. XP is the same: it cannot be bought, at any price, by anybody. Both are
   surfaced to the member as features, because they are.
   ========================================================================== */
'use strict';

var MemberApp = (function () {

  var A = window.Asbern;
  var AM = window.AsbernMock;

  /* ======================================================================
     §1 · SMALL HELPERS
     ====================================================================== */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var esc = A.escapeHtml;

  function set(sel, html, root) { var n = $(sel, root); if (n) n.innerHTML = html; return n; }
  function text(sel, s, root) { var n = $(sel, root); if (n) n.textContent = s; return n; }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  /** Deterministic pseudo-random, seeded — for MOCK FIXTURES ONLY (avatar hues,
   *  sparkline shapes). Never for an outcome; outcomes live in §3. */
  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }

  /* ======================================================================
     §2 · RULES — ported, verbatim, from packages/core
     ----------------------------------------------------------------------
     Every constant below carries the file and the reason. If one of these
     disagrees with core, core is right and this is a bug.
     ====================================================================== */

  /* -- 2.1 economy.js ---------------------------------------------------- */

  var ECON = {
    CURRENCY: '$',                 // "Bucks"
    /* ⚠ SCALE = 1 means REAL-LIFE-SIZED WHOLE DOLLARS. There are no cents in a
       balance: every mutator floors, so a balance is an integer. Never render a
       balance with decimals — economy.js:90. */
    SCALE: 1,
    MESSAGE_EARN: 10,              // per message…
    MESSAGE_MINUTE_CAP: 30,        // …at most $30 per rolling minute (3 paid messages)
    VOICE_EARN: 1,                 // per qualifying voice minute — UNCAPPED, deliberately
    WATCH_HOUR_EARN: 1,            // per COMPLETED hour on the stream (see §7 note)
    DAILY_MS: 20 * 3600 * 1000,
    WORK_MS: 15 * 60 * 1000,
    OFFLINE_CAP_MS: 48 * 3600 * 1000,
    dailyAmount: function (streak) { return Math.min(150 + (streak - 1) * 50, 1200); },
    WORK_MIN: 15, WORK_MAX: 59     // 15 + floor(rand*45)
  };

  /* The idle-tycoon asset tree — economy.js ASSET_DEFS, exact. */
  var ASSETS = [
    { id: 'popcorn',    name: 'Popcorn Stand',   emoji: '🍿', branch: 'Concessions', desc: 'The humble beginning — buttery profits.',        base: 50,       mult: 1.18, income: 0.0000579, unlock: 0 },
    { id: 'soda',       name: 'Soda Fountain',   emoji: '🥤', branch: 'Concessions', desc: 'Ice-cold markup on fizzy water.',                base: 185,      mult: 1.18, income: 0.000167,  unlock: 74 },
    { id: 'candy',      name: 'Candy Counter',   emoji: '🍬', branch: 'Concessions', desc: 'Overpriced sweets by the register.',             base: 686,      mult: 1.18, income: 0.000485,  unlock: 274 },
    { id: 'homeserver', name: 'Home Server',     emoji: '🖥️', branch: 'Streaming',    desc: 'Rack a box in the closet and start streaming.', base: 2541,     mult: 1.18, income: 0.0014,    unlock: 1016 },
    { id: 'cdn',        name: 'CDN Node',        emoji: '🌐', branch: 'Streaming',    desc: 'Edge nodes so the boys never buffer.',           base: 9411,     mult: 1.18, income: 0.00406,   unlock: 3764 },
    { id: 'studio',     name: 'Studio Lot',      emoji: '🎬', branch: 'Streaming',    desc: 'Your own lot — make the content.',              base: 34856,    mult: 1.18, income: 0.0117,    unlock: 13942 },
    { id: 'gpurig',     name: 'GPU Rig',         emoji: '🎮', branch: 'Crypto',       desc: 'Mine coin while the GPUs scream.',              base: 129103,   mult: 1.18, income: 0.034,     unlock: 51641 },
    { id: 'minefarm',   name: 'Mining Farm',     emoji: '⛏️', branch: 'Crypto',       desc: 'A warehouse of rigs, humming cash.',            base: 478187,   mult: 1.18, income: 0.0983,    unlock: 191275 },
    { id: 'quantum',    name: 'Quantum Rig',     emoji: '🧊', branch: 'Crypto',       desc: 'Qubits go brrr.',                               base: 1771165,  mult: 1.18, income: 0.284,     unlock: 708466 },
    { id: 'slotfloor',  name: 'Slot Floor',      emoji: '🎰', branch: 'Casino',       desc: 'Own the machines instead of feeding them.',     base: 6560248,  mult: 1.18, income: 0.823,     unlock: 2624099 },
    { id: 'highlimit',  name: 'High-Limit Room', emoji: '🃏', branch: 'Casino',       desc: 'Where the whales play — and you take the rake.', base: 24298607, mult: 1.18, income: 2.38,      unlock: 9719443 },
    { id: 'thehouse',   name: 'The House',       emoji: '🏛️', branch: 'Casino',       desc: 'The house always wins. You ARE the house.',     base: 90000000, mult: 1.18, income: 6.89,      unlock: 36000000 }
  ];
  var ASSET_BY_ID = {};
  ASSETS.forEach(function (a) { ASSET_BY_ID[a.id] = a; });

  /* Net-worth tiers — economy.js RANKS. Status, not a Discord rank. */
  var WEALTH_TIERS = [
    { key: 'broke',      name: 'Broke',       emoji: '🫙', at: 0 },
    { key: 'scrounger',  name: 'Scrounger',   emoji: '🪙', at: 1e3 },
    { key: 'hustler',    name: 'Hustler',     emoji: '💵', at: 1e4 },
    { key: 'baller',     name: 'Baller',      emoji: '💸', at: 1e5 },
    { key: 'highroller', name: 'High Roller', emoji: '🎩', at: 1e6 },
    { key: 'bigshot',    name: 'Big Shot',    emoji: '🕴️', at: 1e7 },
    { key: 'tycoon',     name: 'Tycoon',      emoji: '🏦', at: 1e8 },
    { key: 'mogul',      name: 'Mogul',       emoji: '👑', at: 1e9 },
    { key: 'kingpin',    name: 'Kingpin',     emoji: '💠', at: 2.5e9 },
    { key: 'legend',     name: 'Legend',      emoji: '🌌', at: 10e9 }
  ];
  function wealthTier(netPeak) {
    var r = WEALTH_TIERS[0];
    for (var i = 0; i < WEALTH_TIERS.length; i++) { if (netPeak >= WEALTH_TIERS[i].at) r = WEALTH_TIERS[i]; else break; }
    return r;
  }
  function nextWealthTier(netPeak) {
    for (var i = 0; i < WEALTH_TIERS.length; i++) if (netPeak < WEALTH_TIERS[i].at) return WEALTH_TIERS[i];
    return null;
  }

  /* economy.js fmt() — the short-unit renderer. Ported because the whole app
     shows these numbers and they must read identically to Discord. */
  var UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n) {
    n = Math.floor(Number(n) || 0);
    /* ⚠ `n < 1000` AND NOT `Math.abs(n) < 1000`, EXACTLY AS CORE HAS IT.
       That early return catches every negative, so core's `neg` branch three
       lines down is unreachable and −4,200 renders as "-4200" rather than
       "-4.2K". This port was written the "better" way first and a diff against
       packages/core caught it — which is the whole reason the diff exists.
       Reported as a (harmless, latent) finding in core rather than silently
       corrected here: two surfaces that abbreviate differently is worse than
       one surface that abbreviates oddly. Nothing in this app renders a
       negative through fmt() anyway — signed money goes through signedMoney(),
       which takes the absolute value first. */
    /* ⚠ CORRECTED: core's bound is now TWO-SIDED and this port had gone stale.
       The comment above described a real defect in core (`n < 1000` catches every
       negative, making the `neg` branch below unreachable) and deliberately
       mirrored it so the two surfaces agreed. Core has since been FIXED — the
       dead branch was what proved the intent — so mirroring it now produces the
       drift it was meant to avoid: measured, 77 of 179 sampled values disagreed,
       and -4200 rendered "-4200" here against core's "-4.2K".
       ⚠ The deeper lesson: this port is checked against HAND-WRITTEN LITERALS,
       not against core, so when core moved the port went stale while the suite
       stayed green. A literal cannot notice that its source changed. */
    if (n > -1000 && n < 1000) return String(n);
    var neg = n < 0; n = Math.abs(n);
    var tier = Math.min(UNITS.length - 1, Math.floor(Math.log10(n) / 3));
    var scaled = n / Math.pow(1000, tier);
    var s = (scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(scaled >= 10 ? 1 : 2));
    var trimmed = s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s;
    return (neg ? '-' : '') + trimmed + UNITS[tier];
  }
  /** Short money — "$1.28M". Use in tight spaces. */
  function money(n) { return ECON.CURRENCY + fmt(n); }
  /** Exact money — "$1,284,500". No cents, ever: SCALE = 1. */
  function moneyFull(n) { return ECON.CURRENCY + Math.round(Number(n) || 0).toLocaleString('en-US'); }

  /* economy.js moneyRate() — pick the largest unit where the value reads >= $1. */
  function moneyRate(perSec) {
    var units = [[60, 'min'], [3600, 'hr'], [86400, 'day']];
    for (var i = 0; i < units.length; i++) {
      var v = perSec * units[i][0];
      if (v >= 1 || units[i][1] === 'day') {
        var num = v >= 100 ? fmt(Math.round(v)) : (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '');
        return ECON.CURRENCY + num + '/' + units[i][1];
      }
    }
  }

  function assetCost(id, level) {
    var a = ASSET_BY_ID[id]; if (!a) return Infinity;
    return Math.ceil(a.base * Math.pow(a.mult, level));
  }
  function assetSpend(id, levels) {                 // what L levels have cost so far
    var t = 0; for (var k = 0; k < levels; k++) t += assetCost(id, k); return t;
  }
  function incomePerSec(assets) {
    var inc = 0;
    for (var id in assets) { var a = ASSET_BY_ID[id]; if (a) inc += a.income * assets[id]; }
    return inc;
  }
  /* netWorth = cash + everything permanently invested, valued at what you paid. */
  function netWorth(u) { return Math.floor((u.cash || 0) + Math.max(0, u.spent || 0)); }

  /* -- 2.2 leveling.js --------------------------------------------------- */

  var LVL = {
    MSG_XP_MIN: 15, MSG_XP_MAX: 25, MSG_COOLDOWN_MS: 60000,
    VOICE_XP_PER_MIN: 12, VOICE_XP_DAILY_CAP: 1440,
    ECON_XP_PER_ACTION: 4, ECON_XP_DAILY_CAP: 120,
    MASTER_GENERAL_LEVEL: 100,
    MAX_PRESTIGE: 10, PRESTIGE_MASTER: 11,
    PRESTIGE_COSTS: [1000, 5000, 15000, 40000, 100000, 250000, 600000, 1500000, 3500000, 8000000, 18000000],
    /* The diminishing daily bands that compress the activity tiers. */
    DAILY_BANDS: [
      { upTo: 600, mult: 1.0, label: 'first 600 XP a day' },
      { upTo: 1200, mult: 0.5, label: 'the next 600' },
      { upTo: Infinity, mult: 0.25, label: 'everything after' }
    ]
  };
  function xpForLevel(L) { return Math.round(0.25 * L * L + 6 * L + 61); }
  function totalXpToReach(L) { var t = 0; for (var i = 0; i < L; i++) t += xpForLevel(i); return t; }

  var RANK_NAMES = [
    'Private', 'Lance Corporal', 'Corporal', 'Sergeant', 'Staff Sergeant',
    'Gunnery Sergeant', 'Master Sergeant', 'First Sergeant', 'Master Gunnery Sergeant',
    'Sergeant Major', 'Second Lieutenant', 'First Lieutenant', 'Captain',
    'Lieutenant Major', 'Major', 'Colonel', 'Brigadier General', 'Major General',
    'Lieutenant General', 'General', 'Master General'
  ];
  var MIL_RANKS = RANK_NAMES.map(function (name, i) {
    return { name: name, index: i, level: i === 0 ? 1 : Math.round(1 + (i / (RANK_NAMES.length - 1)) * (LVL.MASTER_GENERAL_LEVEL - 1)) };
  });
  function rankForLevel(level) {
    var r = MIL_RANKS[0];
    for (var i = 0; i < MIL_RANKS.length; i++) { if (level >= MIL_RANKS[i].level) r = MIL_RANKS[i]; else break; }
    return r;
  }
  function nextMilRank(level) {
    for (var i = 0; i < MIL_RANKS.length; i++) if (level < MIL_RANKS[i].level) return MIL_RANKS[i];
    return null;
  }
  function prestigeLabel(p) {
    if (!p) return null;
    return p >= LVL.PRESTIGE_MASTER ? 'Prestige Master' : 'Prestige ' + p;
  }
  function prestigeCost(nextP) { return LVL.PRESTIGE_COSTS[nextP - 1] || LVL.PRESTIGE_COSTS[LVL.PRESTIGE_COSTS.length - 1]; }

  /* -- 2.3 achievements.js — 15 + 1 mastery, with the real conditions ----- */

  var ACHIEVEMENTS = [
    { key: 'firstblood',   name: 'First Blood',       emoji: '🩸', desc: 'Win your first casino game.',                        metric: 'gamesWon',     need: 1 },
    { key: 'highroller',   name: 'High Roller',       emoji: '💰', desc: 'Net $50K from a single casino game.',                metric: 'biggestWin',   need: 50000, money: true },
    { key: 'jackpot',      name: 'Jackpot',           emoji: '🎰', desc: 'Hit the 7️⃣7️⃣7️⃣ slots jackpot.',                      metric: 'slotsJackpots', need: 1 },
    { key: 'cardshark',    name: 'Card Shark',        emoji: '🃏', desc: 'Win 10 poker hands.',                                metric: 'pokerWins',    need: 10 },
    { key: 'duelist',      name: 'Duelist',           emoji: '⚔️', desc: 'Win 10 coinflip duels.',                             metric: 'duelWins',     need: 10 },
    { key: 'horses',       name: 'Horse Whisperer',   emoji: '🐎', desc: 'Win a horse race bet.',                              metric: 'horseWins',    need: 1 },
    { key: 'tycoonking',   name: 'Tycoon',            emoji: '🏭', desc: 'Own all 12 tycoon assets.',                          metric: 'assetsOwned',  need: 12 },
    { key: 'empire',       name: 'Empire',            emoji: '🗽', desc: 'Reach $100M net worth.',                             metric: 'netPeak',      need: 100000000, money: true },
    { key: 'grinder',      name: 'Grinder',           emoji: '🔗', desc: 'Hold a 7-day voice streak.',                         metric: 'voiceStreak',  need: 7 },
    { key: 'nolife',       name: 'No Life',           emoji: '🦉', desc: 'Hold a 30-day voice streak.',                        metric: 'voiceStreak',  need: 30 },
    { key: 'doubledigits', name: 'Five Figures',      emoji: '💵', desc: 'Reach $10,000 net worth.',                           metric: 'netPeak',      need: 10000, money: true },
    { key: 'officer',      name: 'Officer',           emoji: '🎖️', desc: 'Reach the officer ranks (Second Lieutenant).',       metric: 'rankIndex',    need: 10, special: 'or any prestige' },
    { key: 'fivestar',     name: 'Five Star',         emoji: '🎯', desc: 'Reach Master General.',                              metric: 'level',        need: 100, special: 'or any prestige' },
    { key: 'reborn',       name: 'Reborn',            emoji: '♻️', desc: 'Prestige for the first time.',                       metric: 'prestige',     need: 1 },
    { key: 'bigspender',   name: 'Big Spender',       emoji: '🤑', desc: 'Spend $1M total in the economy.',                    metric: 'spent',        need: 1000000, money: true }
  ];
  var MASTERY = { key: 'completeboy', name: 'The Completionist', emoji: '🏆', desc: 'Unlock all 15 achievements.' };

  /* -- 2.4 challenges.js / goals.js -------------------------------------- */

  /* REWARDS × TIER_MULT — challenges.js:116/127. Difficulty is paid for. */
  var QUEST_REWARDS = { daily: { cash: 250, xp: 250 }, weekly: { cash: 1000, xp: 2500 } };
  var TIER_MULT = { easy: 0.6, standard: 1, hard: 1.6 };
  function rewardFor(kind, tier) {
    var base = QUEST_REWARDS[kind], m = TIER_MULT[tier] || 1;
    return { cash: Math.round(base.cash * m), xp: Math.round(base.xp * m) };
  }
  var GOAL_REWARD = { cash: 2500, xp: 2500 };
  var SEASON = {
    n: 1, name: 'Founders', weeks: 12, activeMins: 30,
    reward: { cash: 5000, xp: 5000, role: 'Founders Role', roleIcon: '🏛️' }
  };

  /* -- 2.5 statsQuery.js — the five windows ------------------------------ */

  var WINDOWS = [
    { key: 'day',   short: 'Day',      label: 'Last 24 hours' },
    { key: 'week',  short: 'Week',     label: 'Last 7 days' },
    { key: 'month', short: 'Month',    label: 'Last 30 days' },
    /* ⚠ `year` is a ROLLING TWELVE MONTHS, not a calendar year. PRICING.md §7
       is explicit that this must be labelled correctly. */
    { key: 'year',  short: 'Year',     label: 'Last 12 months (rolling — not a calendar year)' },
    { key: 'all',   short: 'All time', label: 'Everything on disk' }
  ];

  /* ⚠ MEASURED, NOT INVENTED. docs/_v14/12-stats-platform.md: 20,869 of 42,979
     all-time messages in the store — 48.6% — belong to 22 bot accounts. The
     board filters them; this figure is why. */
  var BOT_SHARE = { allTime: 0.486, recent60d: 0.613, botIds: 22, humans: 65 };

  /* -- 2.6 PRICING.md §7 — the module registry the entitlement check uses -- */

  var TIERS = [
    { id: 'free',      name: 'Free',      monthly: 0,  rank: 0 },
    { id: 'community', name: 'Community', monthly: 5,  rank: 1 },
    { id: 'pro',       name: 'Pro',       monthly: 12, rank: 2 },
    { id: 'studio',    name: 'Studio',    monthly: 29, rank: 3 },
    { id: 'sovereign', name: 'Sovereign', monthly: 19, rank: 3 }   // self-host; includes everything
  ];
  function tierRank(id) { for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i].rank; return 0; }
  function tierName(id) { for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i].name; return id; }

  /* Only the member-facing rows. `status` gates what may be rendered at all —
     a `planned` module must never look like a locked one you could unlock. */
  var MODULES = {
    'leveling':       { name: 'Leveling & ranks',        min: 'free',      status: 'shipped' },
    'achievements':   { name: 'Achievements & icons',    min: 'free',      status: 'shipped' },
    'profile':        { name: 'Member profile',          min: 'free',      status: 'shipped' },
    'stats-basic':    { name: 'Stats — day/week/month',  min: 'free',      status: 'shipped' },
    'counting':       { name: 'Counting game',           min: 'free',      status: 'shipped' },
    'requests':       { name: 'Title requests',          min: 'free',      status: 'shipped' },
    'economy':        { name: 'Economy & idle tycoon',   min: 'community', status: 'shipped' },
    'casino':         { name: 'Casino — nine games',     min: 'community', status: 'shipped' },
    'stats-history':  { name: 'Stats — year & all-time', min: 'community', status: 'shipped' },
    'wrapped':        { name: 'Wrapped / recap',         min: 'community', status: 'shipped' },
    'challenges':     { name: 'Challenges & goals',      min: 'community', status: 'shipped' },
    'screening-room': { name: 'Screening room',          min: 'pro',       status: 'shipped', metered: 'egress' },
    'live-tv':        { name: 'Live TV',                 min: 'pro',       status: 'shipped', metered: 'egress' },
    'game-servers':   { name: 'Game servers',            min: 'pro',       status: 'shipped' },
    'second-screen':  { name: 'Second simultaneous screen', min: 'studio', status: 'shipped', metered: 'egress' },
    'music':          { name: 'Music',                   min: 'pro',       status: 'planned' },
    'ai-companions':  { name: 'AI companions',           min: 'pro',       status: 'dark',    metered: 'ai' }
  };

  /* ======================================================================
     §3 · SERVER — the mock backend
     ----------------------------------------------------------------------
     EVERYTHING BELOW THIS LINE IS "THE SERVER". In production it is deleted
     and replaced by fetch() calls to /v1. Nothing in §4 may read `state`
     directly; it goes through the endpoints, which return plain JSON exactly
     as the HTTP API would.

     This is also the only region of this file allowed to call Math.random().
     ====================================================================== */

  var Server = (function () {

    /* ---- 3.0 private state ------------------------------------------- */

    var state = {
      /* The member. Balances are integers — SCALE = 1, no cents. */
      me: {
        id: '000000000000000001',
        name: 'Sigrún',
        initials: 'SI',
        joinedAt: Date.UTC(2022, 2, 14),
        cash: 1284500,
        /* stats.spent — the "invested" half of net worth. Derived below from
           the real asset costs so it cannot drift from the asset table. */
        spent: 0,
        giftedIn: 0,
        netPeak: 0,
        lifetimeEarned: 9418200,
        assets: { popcorn: 32, soda: 27, candy: 22, homeserver: 18, cdn: 13, studio: 8, gpurig: 4, minefarm: 1 },
        daily: { streak: 14, lastAt: Date.now() - 3 * 3600 * 1000 },
        work: { lastAt: Date.now() - 22 * 60 * 1000 },
        level: 47,
        prestige: 2,
        xpInto: 512,
        equippedIcon: '🎩',
        stats: {
          gamesPlayed: 1841, gamesWon: 792, biggestWin: 96000, wagered: 4180000,
          slotsJackpots: 0, pokerWins: 3, duelWins: 12, horseWins: 6, voiceStreak: 9
        },
        activity: {
          /* localstats counters. `voiceMinutes` is ENGAGED (>=2 humans, unmuted);
             `presentMinutes` is CONNECTED. The two are different questions and
             the UI must never conflate them. */
          day:   { messages: 41,    voiceMinutes: 96,    presentMinutes: 141,   reactions: 22,   watchMinutes: 52 },
          week:  { messages: 388,   voiceMinutes: 942,   presentMinutes: 1206,  reactions: 191,  watchMinutes: 402 },
          month: { messages: 1642,  voiceMinutes: 3980,  presentMinutes: 5104,  reactions: 806,  watchMinutes: 1488 },
          year:  { messages: 18106, voiceMinutes: 41880, presentMinutes: 52310, reactions: 8422, watchMinutes: 14760 },
          all:   { messages: 22918, voiceMinutes: 52104, presentMinutes: 64920, reactions: 10314, watchMinutes: 18442 }
        }
      },

      guild: {
        id: '000000000000000000',
        name: 'Hearthstead',
        members: 1284,
        online: 213,
        /* The owner's plan. The preview control in each page footer writes this;
           in production it comes from the billing record. */
        plan: 'pro'
      },

      /* The screening room, as the engine would report it. */
      screening: {
        engineReachable: true,
        screens: [
          {
            id: 1, live: true, kind: 'film',
            title: 'The Northman', year: 2022, rating: 'R',
            runtimeSec: 137 * 60, positionSec: 3142,
            startedBy: 'Hallr', startedAt: Date.now() - 3142 * 1000,
            summary: 'A young Viking prince sets out to avenge his father. Playing from the host’s own library — nothing here was fetched from anywhere.',
            /* One rendition. The engine runs ONE ffmpeg output per pipeline and
               pushes it to Owncast; there is no ABR ladder to choose from. See
               the note the watch page renders next to the quality control. */
            renditions: [{ id: 'src', label: '1080p', detail: 'H.264 · NVENC · 6.2 Mbps', active: true }],
            viewers: [
              { name: 'Hallr',  initials: 'HA', joinedMin: 52, host: true, measured: true },
              { name: 'Sigrún', initials: 'SI', joinedMin: 49, me: true,   measured: true },
              { name: 'Bekan',  initials: 'BE', joinedMin: 44, measured: true },
              { name: 'Thora',  initials: 'TH', joinedMin: 31, measured: true },
              { name: 'Gunnar', initials: 'GU', joinedMin: 12, measured: true },
              { name: 'Ylva',   initials: 'YL', joinedMin: 6,  measured: false, pressed: true }
            ],
            upNext: null,
            idleStopMin: 15
          },
          { id: 2, live: false, locked: 'second-screen' }
        ],
        /* The member's own accrual, as attendance + economy would report it. */
        accrual: { watchedSec: 49 * 60 + 12, paidHours: 0, ratePerHour: ECON.WATCH_HOUR_EARN },
        /* The last screening's wrap-up card. */
        lastWrap: {
          title: 'Ember & Ash — S1E4, “The Long Thaw”',
          kind: 'tv',
          startedAt: Date.UTC(2026, 7, 3, 20, 15),
          runtimeMin: 54,
          observed: true,
          viewers: [
            { name: 'Hallr',  initials: 'HA', ms: 54 * 60000, stayedToEnd: true,  measured: true,  pressed: true },
            { name: 'Sigrún', initials: 'SI', ms: 54 * 60000, stayedToEnd: true,  measured: true,  pressed: true },
            { name: 'Bekan',  initials: 'BE', ms: 41 * 60000, stayedToEnd: false, measured: true,  pressed: true },
            { name: 'Thora',  initials: 'TH', ms: 12 * 60000, stayedToEnd: false, measured: true,  pressed: false },
            { name: 'Ylva',   initials: 'YL', ms: 0,          stayedToEnd: false, measured: false, pressed: true, noShow: true }
          ]
        },
        channels: [
          { id: 'ch-1', name: 'Nordic Sport 1',   group: 'Sports',        now: 'Elite Series — Bodø / Rosenborg', ends: '21:45' },
          { id: 'ch-2', name: 'Continental News', group: 'News',          now: 'The Evening Brief',               ends: '20:30' },
          { id: 'ch-3', name: 'Reel Classics',    group: 'Entertainment', now: 'Double bill — noir night',        ends: '23:10' },
          { id: 'ch-4', name: 'Documentary North',group: 'Documentary',   now: 'Ice Roads, ep. 4',                ends: '21:00' },
          { id: 'ch-5', name: 'Late Comedy',      group: 'Entertainment', now: 'Stand-up hour',                   ends: '22:00' }
        ],
        /* The member's own single-use ticket, once minted. */
        ticket: null
      },

      /* The roster the boards are built from.
         `msgs` / `voice` (engaged min) / `present` (connected min) / `watch`
         (min) are ALL-TIME totals, exactly as localstats holds them; the window
         views are derived from a fixed per-member share so the numbers are
         stable across renders instead of jittering. `net` is LIVE net worth,
         which is what economy.leaderboard ranks by. */
      roster: [
        { id: 'u1',  name: 'Hallr',   initials: 'HA', msgs: 41204, voice: 36720, present: 45180, watch: 39240, net: 91400000, level: 88, prestige: 4, lifetimeXp: 512900, share: 1.00 },
        { id: 'u2',  name: 'Sigrún',  initials: 'SI', msgs: 22918, voice: 52104, present: 64920, watch: 18442, net: 0,        level: 47, prestige: 2, lifetimeXp: 0,      share: 0.94, me: true },
        { id: 'u3',  name: 'Bekan',   initials: 'BE', msgs: 19002, voice: 24060, present: 31220, watch: 22140, net: 3880100,  level: 44, prestige: 1, lifetimeXp: 172400, share: 0.88 },
        { id: 'u4',  name: 'Thora',   initials: 'TH', msgs: 15771, voice: 17760, present: 21900, watch: 9420,  net: 2140000,  level: 39, prestige: 1, lifetimeXp: 149600, share: 0.71 },
        { id: 'u5',  name: 'Gunnar',  initials: 'GU', msgs: 9882,  voice: 30720, present: 41880, watch: 27180, net: 1902450,  level: 31, prestige: 0, lifetimeXp: 88200,  share: 1.12 },
        { id: 'u6',  name: 'Ylva',    initials: 'YL', msgs: 8140,  voice: 7320,  present: 10440, watch: 14880, net: 940300,   level: 28, prestige: 0, lifetimeXp: 71400,  share: 1.31 },
        { id: 'u7',  name: 'Ragna',   initials: 'RA', msgs: 7415,  voice: 12480, present: 15600, watch: 5220,  net: 612800,   level: 26, prestige: 0, lifetimeXp: 63900,  share: 0.62 },
        { id: 'u8',  name: 'Ketil',   initials: 'KE', msgs: 6103,  voice: 21540, present: 28200, watch: 11760, net: 488900,   level: 24, prestige: 0, lifetimeXp: 55100,  share: 1.04 },
        { id: 'u9',  name: 'Alfdís',  initials: 'AL', msgs: 5288,  voice: 4620,  present: 6180,  watch: 3060,  net: 271400,   level: 19, prestige: 0, lifetimeXp: 37600,  share: 0.44 },
        { id: 'u10', name: 'Sten',    initials: 'ST', msgs: 4012,  voice: 9840,  present: 12960, watch: 8100,  net: 168200,   level: 17, prestige: 0, lifetimeXp: 31000,  share: 0.83 },
        { id: 'u11', name: 'Iðunn',   initials: 'ID', msgs: 2941,  voice: 3060,  present: 4020,  watch: 1980,  net: 94600,    level: 13, prestige: 0, lifetimeXp: 20800,  share: 1.19 },
        { id: 'u12', name: 'Vigdís',  initials: 'VI', msgs: 1877,  voice: 1560,  present: 2280,  watch: 720,   net: 41300,    level: 9,  prestige: 0, lifetimeXp: 12400,  share: 0.57 }
      ],

      /* ⚠ THESE NEVER RANK. They are here only so the disclosure below the board
         can show what the filter takes out — 22 bot ids were 48.6% of every
         message ever recorded on the real server this was built against. */
      /* ⚠ These counts are sized so the counterfactual toggle reproduces the
         MEASURED 48.6% share rather than some smaller number that would quietly
         contradict the note sitting underneath it. Humans in `roster` total
         144,553 all-time messages; 136,681 bot messages is 48.6% of the sum. */
      bots: [
        { id: 'b1', name: 'Statbot',  initials: 'ST', msgs: 71402, bot: true },
        { id: 'b2', name: 'Arcane',   initials: 'AR', msgs: 42318, bot: true },
        { id: 'b3', name: 'The Boys', initials: 'TB', msgs: 22961, bot: true }
      ],

      /* Open casino rounds, keyed by id. The client is given a round id and
         NOTHING ELSE it could use to predict an outcome. */
      rounds: {},
      roundSeq: 1
    };

    /* Derive `spent` (and therefore net worth) from the real asset cost curve
       rather than asserting a number that could drift. Plus the prestige spend
       and a couple of unlocked icons. */
    (function deriveSpend() {
      var total = 0, id;
      for (id in state.me.assets) total += assetSpend(id, state.me.assets[id]);
      for (var p = 1; p <= state.me.prestige; p++) total += prestigeCost(p);
      total += 25000; // icon unlocks
      state.me.spent = total;
      state.me.netPeak = Math.floor(netWorth(state.me) * 1.15);   // an earlier, better week
    })();

    /* ---- 3.1 the casino, exactly as packages/core/src/casino.js ------- */
    /*
       Ported verbatim. Every constant, every multiplier, every clamp. These run
       HERE, on the server, and their results are handed to the client as data.
    */

    var SLOT_SYMBOLS = [
      { s: '🍒', weight: 32, three: 3 },
      { s: '🍋', weight: 26, three: 4 },
      { s: '🔔', weight: 18, three: 8 },
      { s: '⭐', weight: 12, three: 15 },
      { s: '💎', weight: 8,  three: 45 },
      { s: '7️⃣', weight: 4,  three: 150 }
    ];
    var RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    var CRASH_RUNGS = [1.2, 1.5, 2, 3, 5, 10, 25, 100];
    var MINES_TILES = 20;
    var PLINKO_ROWS = 8;
    var PLINKO_BUCKETS = [12, 3, 1.4, 0.6, 0.3, 0.6, 1.4, 3, 12];
    var HORSES = [
      { name: 'Thunderhoof',    emoji: '🐎', odds: 3 },
      { name: 'Iron Duke',      emoji: '🐴', odds: 4 },
      { name: 'Midnight',       emoji: '🏇', odds: 5 },
      { name: 'Longshot Larry', emoji: '🫏', odds: 8 },
      { name: 'Rusty Nail',     emoji: '🐎', odds: 11 },
      { name: 'Dark Horse',     emoji: '🦄', odds: 18 }
    ];

    function randInt(n) { return Math.floor(Math.random() * n); }

    /* High-Low: multiplier scales to the odds so peeking the first card is
       worthless. casino.js:80-87. */
    function hlCount(first, higher) { return higher ? (13 - first) : (first - 1); }
    function hlMultiplier(first, higher) { var c = hlCount(first, higher); return c > 0 ? (0.97 * 13 / c) : 0; }

    /* Mines: fair value × 0.97. casino.js:117. */
    function minesMultiplier(bombs, revealed) {
      var m = 1;
      for (var i = 0; i < revealed; i++) m *= (MINES_TILES - i) / (MINES_TILES - bombs - i);
      return m * 0.97;
    }

    /* Crash: pre-rolled the instant the round opens. casino.js:96. */
    function rollCrashPoint() {
      var r = Math.random();
      if (r < 0.04) return 1.0;                       // 4% instant bust
      return Math.max(1.0, Math.min(0.96 / (1 - r), 1000));
    }

    /* Blackjack. Infinite shoe by RANK; the suit is decoration the presentation
       layer adds (src/lib/cards.js's { r, s } model) and carries no game meaning
       — which is also why counting cards here is impossible by construction. */
    function bjCard() { return { r: 1 + randInt(13), s: randInt(4) }; }
    function cardValue(r) { return r >= 10 ? 10 : r; }
    function handTotal(cards) {
      var total = 0, aces = 0, soft = false;
      for (var i = 0; i < cards.length; i++) {
        total += cardValue(cards[i].r);
        if (cards[i].r === 1) aces++;
      }
      while (aces > 0 && total + 10 <= 21) { total += 10; aces--; soft = true; }
      return { total: total, soft: soft };
    }
    function isBlackjack(cards) { return cards.length === 2 && handTotal(cards).total === 21; }
    function dealerPlay(cards) {
      var hand = cards.slice();
      while (handTotal(hand).total < 17) hand.push(bjCard());   // stands on ALL 17, soft included
      return hand;
    }
    function bjSettle(bet, player, dealer, noNatural) {
      var p = handTotal(player).total, d = handTotal(dealer).total;
      var pbj = !noNatural && isBlackjack(player), dbj = isBlackjack(dealer);
      if (p > 21) return { result: 'bust', payout: 0 };
      if (pbj && !dbj) return { result: 'blackjack', payout: Math.floor(bet * 2.5) };  // 3:2 + stake
      if (dbj && !pbj) return { result: 'dealer_bj', payout: 0 };
      if (d > 21) return { result: 'dealer_bust', payout: bet * 2 };
      if (p > d) return { result: 'win', payout: bet * 2 };
      if (p < d) return { result: 'lose', payout: 0 };
      return { result: 'push', payout: bet };
    }

    /* ---- 3.2 money movement — the economy.js contract ----------------- */
    /*
       stake() takes the money UP FRONT and settleBet() returns the gross payout
       (stake included; a total loss is payout 0). Mirrors economy.js exactly so
       the ledger lines the UI renders are the same shape the real ones are.
    */
    var ledger = [
      { at: '19:42', kind: 'Watch payout', detail: 'The Northman — 52 min on stream', amount: 5200 },
      { at: '19:05', kind: 'Blackjack',    detail: 'Split, both hands won',            amount: 24000 },
      { at: '18:31', kind: 'Tycoon',       detail: 'Idle income, 4 assets',            amount: 8600 },
      { at: '17:58', kind: 'Crash',        detail: 'Cashed out at 1.42×',              amount: -18000 },
      { at: '09:00', kind: 'Daily',        detail: 'Streak, day 14',                   amount: 14000 }
    ];
    function nowClock() {
      var d = new Date();
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    function logTxn(kind, detail, amount) {
      ledger.unshift({ at: nowClock(), kind: kind, detail: detail, amount: amount, fresh: true });
      if (ledger.length > 24) ledger.pop();
    }
    function stake(bet, game) {
      bet = Math.floor(bet);
      if (!(bet >= 1)) return { ok: false, reason: 'amount' };
      if (bet > state.me.cash) return { ok: false, reason: 'poor', balance: state.me.cash };
      state.me.cash -= bet;
      state.me.stats.gamesPlayed++;
      state.me.stats.wagered += bet;
      return { ok: true, balance: state.me.cash };
    }
    function settle(bet, payout, game, detail) {
      state.me.cash += payout;
      var net = payout - bet;
      if (payout > bet) {
        state.me.stats.gamesWon++;
        state.me.lifetimeEarned += net;
        if (net > state.me.stats.biggestWin) state.me.stats.biggestWin = net;
      }
      if (net !== 0) logTxn(game, detail, net);
      return state.me.cash;
    }

    /* ---- 3.3 endpoints ------------------------------------------------ */
    /*
       Each of these is the shape of a /v1 response. Note what they do NOT
       contain: no crash point until the round is over, no hole card until the
       dealer plays, no mine layout until you step on one.
    */

    function meResponse() {
      var m = state.me;
      var inc = incomePerSec(m.assets);
      return {
        id: m.id, name: m.name, initials: m.initials, joinedAt: m.joinedAt,
        level: m.level, prestige: m.prestige,
        xpInto: m.xpInto, xpNeed: xpForLevel(m.level),
        lifetimeXp: totalXpToReach(m.level) + m.xpInto + m.prestige * totalXpToReach(LVL.MASTER_GENERAL_LEVEL),
        cash: m.cash,
        spent: m.spent,
        netWorth: netWorth(m),
        netPeak: Math.max(m.netPeak, netWorth(m)),
        incomePerSec: inc,
        assets: m.assets,
        assetCount: Object.keys(m.assets).length,
        daily: { streak: m.daily.streak, nextAt: m.daily.lastAt + ECON.DAILY_MS },
        work: { nextAt: m.work.lastAt + ECON.WORK_MS },
        equippedIcon: m.equippedIcon,
        stats: m.stats,
        activity: m.activity
      };
    }

    /* achievements.heldBy() — evaluated LIVE against the rules, which is the
       owner's 2026-08-03 decision. The COSMETIC is never revoked; only the count
       and the lock glyphs follow the rules. */
    function achievementsResponse() {
      var m = state.me, nw = netWorth(m), peak = Math.max(m.netPeak, nw);
      var vals = {
        gamesWon: m.stats.gamesWon,
        biggestWin: m.stats.biggestWin,
        slotsJackpots: m.stats.slotsJackpots,
        pokerWins: m.stats.pokerWins,
        duelWins: m.stats.duelWins,
        horseWins: m.stats.horseWins,
        assetsOwned: Object.keys(m.assets).length,
        netPeak: peak,
        voiceStreak: m.stats.voiceStreak,
        rankIndex: rankForLevel(m.level).index,
        level: m.level,
        prestige: m.prestige,
        spent: m.spent
      };
      var out = ACHIEVEMENTS.map(function (a) {
        var have = vals[a.metric] || 0;
        var held = have >= a.need;
        if ((a.key === 'officer' || a.key === 'fivestar') && m.prestige >= 1) held = true;
        return {
          key: a.key, name: a.name, emoji: a.emoji, desc: a.desc,
          held: held, have: have, need: a.need, money: !!a.money, special: a.special || null
        };
      });
      var all = out.every(function (a) { return a.held; });
      out.push({ key: MASTERY.key, name: MASTERY.name, emoji: MASTERY.emoji, desc: MASTERY.desc,
                 held: all, have: out.filter(function (a) { return a.held; }).length, need: 15, mastery: true });
      return out;
    }

    /* challenges.js serves exactly ONE daily and ONE weekly at a time —
       `dailyFor()` / `weeklyFor()` are pure functions of the date and return a
       single challenge, not a list. goals.js adds one monthly goal and one
       season. That is the whole board, and the UI must not invent a fifth. */
    function questsResponse() {
      return {
        daily: {
          id: 'feature', name: 'Feature Presentation', icon: '🎬', tier: 'standard', kind: 'daily',
          ask: '45 min watching', have: 49, need: 45, unit: 'min',
          reward: rewardFor('daily', 'standard'), claimed: false, resetsIn: 'today, 23:59'
        },
        weekly: {
          id: 'w-gambler', name: 'Gambler', icon: '🎲', tier: 'standard', kind: 'weekly',
          ask: 'Play 25 casino rounds', have: 17, need: 25, unit: '',
          reward: rewardFor('weekly', 'standard'), claimed: false, resetsIn: 'Sunday'
        },
        goal: {
          id: 'voice-marathon', name: 'Voice Marathon', icon: '🏆', kind: 'goal', server: true,
          ask: '400 hours in voice together (last 5 weeks)', have: 311, need: 400, unit: 'h',
          reward: GOAL_REWARD, claimed: false, resetsIn: 'end of the month'
        },
        season: {
          id: 'season', name: 'Season ' + SEASON.n + ' — ' + SEASON.name, icon: '🏛️', kind: 'season', server: true,
          ask: SEASON.activeMins + '+ min in voice in 9 of ' + SEASON.weeks + ' weeks',
          have: 5, need: 9, unit: 'weeks',
          reward: SEASON.reward, claimed: false, resetsIn: '7 weeks left'
        },
        upcoming: [
          { kind: 'daily',  name: 'Hot Streak', icon: '🔥', tier: 'hard',     ask: 'Win 3 casino rounds' },
          { kind: 'daily',  name: 'Say Hello',  icon: '💬', tier: 'easy',     ask: 'Post 3 messages' },
          { kind: 'weekly', name: 'Marathon',   icon: '🏅', tier: 'standard', ask: '10 h in voice this week' }
        ]
      };
    }

    /* The three-valued screening presence. `null` = the engine could not be
       asked. Neither null nor `cold` may ever be spent as "nobody is watching",
       and nobody accrues on an unknown tick — cinema.js is explicit that you
       cannot pay money on a guess. */
    function screeningResponse() {
      if (!state.screening.engineReachable) {
        return { presence: null, engineReachable: false, screens: state.screening.screens,
                 accrual: state.screening.accrual, lastWrap: state.screening.lastWrap,
                 channels: state.screening.channels, ticket: state.screening.ticket };
      }
      return {
        presence: 'live',
        engineReachable: true,
        screens: state.screening.screens,
        accrual: state.screening.accrual,
        lastWrap: state.screening.lastWrap,
        channels: state.screening.channels,
        ticket: state.screening.ticket
      };
    }

    /* Minting a ticket is a real server action: single-use, short-lived, and
       bound to one person. Caddy's forward_auth calls /gate on EVERY HLS
       segment, which is what turns it into a per-viewer heartbeat. */
    function mintTicket() {
      var id = 'tk_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
      state.screening.ticket = {
        id: id,
        url: 'https://cinema.hearthstead.example/w/' + id,
        expiresInSec: 300,
        singleUse: true,
        mintedAt: Date.now()
      };
      return state.screening.ticket;
    }

    /* ---- 3.4 casino endpoints ---------------------------------------- */

    function newRound(kind, data) {
      var id = kind + '_' + (state.roundSeq++);
      state.rounds[id] = data;
      data.kind = kind;
      return id;
    }

    var api = {

      me: meResponse,
      achievements: achievementsResponse,
      quests: questsResponse,
      screening: screeningResponse,
      ledger: function () { return ledger.slice(0, 8); },
      guild: function () { return { id: state.guild.id, name: state.guild.name, members: state.guild.members, online: state.guild.online, plan: state.guild.plan }; },
      setPlan: function (id) { state.guild.plan = id; },
      balance: function () { return state.me.cash; },

      /* Simulated engine outage, so the honest empty state can be seen. */
      setEngineReachable: function (v) { state.screening.engineReachable = !!v; },
      mintTicket: mintTicket,
      dropTicket: function () { state.screening.ticket = null; },

      /* -- BLACKJACK --------------------------------------------------- */
      /*
         The client is dealt: its own cards, the dealer's UP card, and a list of
         legal actions. The hole card is not in the response until the dealer
         plays. There is no seed, no deck, and no way to look ahead.
      */
      blackjack: {
        deal: function (bet) {
          bet = Math.floor(Number(bet) || 0);
          var st = stake(bet, 'bj');
          if (!st.ok) return { ok: false, reason: st.reason, balance: state.me.cash };

          var player = [bjCard(), bjCard()];
          var dealer = [bjCard(), bjCard()];
          var r = {
            bet: bet, staked: bet,
            hands: [{ cards: player, bet: bet, done: false, doubled: false }],
            active: 0, dealer: dealer, fromSplit: false, over: false
          };
          var id = newRound('bj', r);

          /* A natural resolves immediately — there is nothing to decide. */
          if (isBlackjack(player) || isBlackjack(dealer)) return finishBj(id);
          return { ok: true, roundId: id, state: bjView(id) };
        },
        act: function (roundId, action) {
          var r = state.rounds[roundId];
          if (!r || r.over) return { ok: false, reason: 'gone' };
          var h = r.hands[r.active];

          if (action === 'hit') {
            h.cards.push(bjCard());
            if (handTotal(h.cards).total >= 21) h.done = true;
          } else if (action === 'stand') {
            h.done = true;
          } else if (action === 'double') {
            if (h.cards.length !== 2 || h.doubled) return { ok: false, reason: 'illegal' };
            var st = stake(r.bet, 'bj');
            if (!st.ok) return { ok: false, reason: st.reason, balance: state.me.cash };
            r.staked += r.bet;
            h.bet += r.bet; h.doubled = true;
            h.cards.push(bjCard());
            h.done = true;
          } else if (action === 'split') {
            if (r.hands.length !== 1 || h.cards.length !== 2 || h.cards[0].r !== h.cards[1].r) return { ok: false, reason: 'illegal' };
            var st2 = stake(r.bet, 'bj');
            if (!st2.ok) return { ok: false, reason: st2.reason, balance: state.me.cash };
            r.staked += r.bet;
            r.fromSplit = true;                     // split 21s pay even money
            var c1 = h.cards[0], c2 = h.cards[1];
            r.hands = [
              { cards: [c1, bjCard()], bet: r.bet, done: false, doubled: false },
              { cards: [c2, bjCard()], bet: r.bet, done: false, doubled: false }
            ];
            r.active = 0;
          } else {
            return { ok: false, reason: 'unknown' };
          }

          /* Advance to the next unfinished hand, or settle. */
          while (r.active < r.hands.length && r.hands[r.active].done) r.active++;
          if (r.active >= r.hands.length) return finishBj(roundId);
          return { ok: true, roundId: roundId, state: bjView(roundId) };
        }
      },

      /* -- CRASH -------------------------------------------------------- */
      /*
         ⭐ THE CRASH POINT IS PRE-ROLLED HERE AND NEVER LEAVES THE SERVER until
         the round is over. casino.js:96 rolls it when the round starts; the UI
         ticks up and the player taps Cash Out.

         ⚠ AND HERE IS THE PART THAT DOES NOT PORT FROM DISCORD.
         In Discord the BOT owns the clock — it renders each frame, so "what
         multiplier were they at when they tapped?" is unambiguous. On the web
         the client owns the animation frame, so a client that told the server
         its own multiplier could simply lie about it. So it does not: the client
         sends "cash out NOW" with no number in it, and the server derives the
         multiplier from ITS OWN `startedAt`. `poll()` exists for the same
         reason — the client asks what the multiplier is rather than deciding.
         In production this is a WebSocket tick, not a poll (ARCHITECTURE §5
         already names WebSocket for live state).
      */
      crash: {
        RUNGS: CRASH_RUNGS,
        /* Presentation only — the growth curve is the same class of thing as
           casino.js's frame planners: it decides nothing about money. */
        GROWTH_PER_SEC: 0.16,
        multAt: function (ms) { return Math.exp(0.16 * (ms / 1000)); },

        start: function (bet, autoAt) {
          bet = Math.floor(Number(bet) || 0);
          var st = stake(bet, 'crash');
          if (!st.ok) return { ok: false, reason: st.reason, balance: state.me.cash };
          var r = {
            bet: bet,
            crashPoint: rollCrashPoint(),          // ← hidden
            startedAt: Date.now(),
            autoAt: autoAt || null,
            over: false
          };
          var id = newRound('crash', r);
          return { ok: true, roundId: id, balance: state.me.cash, startedAt: r.startedAt };
        },

        poll: function (roundId) {
          var r = state.rounds[roundId];
          if (!r) return { ok: false, reason: 'gone' };
          if (r.over) return { ok: true, over: true, survived: r.survived, multiplier: r.at, crashPoint: r.crashPoint, payout: r.payout, balance: state.me.cash };
          var m = api.crash.multAt(Date.now() - r.startedAt);
          if (m >= r.crashPoint) return bust(roundId);
          if (r.autoAt && m >= r.autoAt) return api.crash.cashout(roundId, true);
          return { ok: true, over: false, multiplier: m };
        },

        /* No multiplier argument. On purpose. */
        cashout: function (roundId, auto) {
          var r = state.rounds[roundId];
          if (!r || r.over) return { ok: false, reason: 'gone' };
          var m = api.crash.multAt(Date.now() - r.startedAt);
          if (r.autoAt && auto) m = Math.max(m, r.autoAt);
          if (m >= r.crashPoint) return bust(roundId);
          m = Math.floor(m * 100) / 100;                       // pay on the shown rung
          var payout = Math.floor(r.bet * m);
          r.over = true; r.survived = true; r.at = m; r.payout = payout;
          var bal = settle(r.bet, payout, 'Crash', 'Cashed out at ' + m.toFixed(2) + '×');
          return { ok: true, over: true, survived: true, multiplier: m, crashPoint: r.crashPoint, payout: payout, balance: bal, auto: !!auto };
        }
      },

      /* -- LEADERBOARDS -------------------------------------------------- */
      /*
         ⚠ THE FIVE BOARDS DO NOT COME FROM ONE PLACE, AND ONLY TWO OF THEM CAN
         BE WINDOWED. This is the honest shape of what core actually exposes:

           messages / voice   statsQuery.leaderboard({ metric, window })
                              — the ONLY windowed boards. Five windows each.
                              Voice ranks on ENGAGED minutes; connected minutes
                              ride along on the row.
           wealth             economy.leaderboard() — LIVE net worth, no window
                              argument exists. It is a standings table, not a
                              period table.
           level              leveling.leaderboard() — prestige, then lifetime
                              XP. Also has no window.
           watch time         ⛔ THERE IS NO SUCH FUNCTION. watch-history.json
                              keeps running totals and a per-title lastAt, never
                              per-period ms — wrapped.js says so in as many
                              words. So this board is LIFETIME and the UI says
                              so rather than inventing a window.

         The board therefore disables the period switcher for three of five,
         with the reason on the control. Faking it would mean three quarters of
         this screen showing numbers nothing computes.
      */
      boards: function (metric, window, includeBots) {
        var WINDOWED = { messages: true, voice: true };
        var FRACTION = { day: 0.0016, week: 0.0122, month: 0.051, year: 0.62, all: 1 };
        var windowed = !!WINDOWED[metric];
        var w = windowed ? (window || 'month') : 'all';
        var f = FRACTION[w] === undefined ? 1 : FRACTION[w];

        function slice(v, share) { return Math.round(v * f * (w === 'all' ? 1 : share)); }

        var rows = state.roster.map(function (r) {
          var meRow = r.me;
          var live = meRow ? state.me : null;
          var value, sub;
          if (metric === 'messages') {
            value = slice(meRow ? live.activity.all.messages : r.msgs, r.share);
            sub = null;
          } else if (metric === 'voice') {
            value = slice(meRow ? live.activity.all.voiceMinutes : r.voice, r.share);
            var pres = slice(meRow ? live.activity.all.presentMinutes : r.present, r.share);
            sub = pres;
          } else if (metric === 'watch') {
            value = meRow ? live.activity.all.watchMinutes : r.watch;
            sub = null;
          } else if (metric === 'wealth') {
            value = meRow ? netWorth(state.me) : r.net;
            sub = null;
          } else {
            value = meRow ? live.level : r.level;
            sub = meRow ? live.prestige : r.prestige;
          }
          return {
            id: r.id, name: r.name, initials: r.initials, me: !!r.me, bot: false,
            value: value, sub: sub,
            lifetimeXp: r.me ? meResponse().lifetimeXp : r.lifetimeXp,
            prestige: r.me ? state.me.prestige : r.prestige
          };
        });

        if (includeBots && metric === 'messages') {
          state.bots.forEach(function (b) {
            rows.push({ id: b.id, name: b.name, initials: b.initials, me: false, bot: true,
                        value: slice(b.msgs, 1), sub: null });
          });
        }

        rows = rows.filter(function (r) { return r.value > 0; });
        if (metric === 'level') {
          rows.sort(function (a, b) { return b.prestige - a.prestige || b.lifetimeXp - a.lifetimeXp; });
        } else {
          rows.sort(function (a, b) { return b.value - a.value; });
        }
        rows.forEach(function (r, i) { r.rank = i + 1; });

        var mine = rows.filter(function (r) { return r.me; })[0] || null;
        var botTotal = 0, humanTotal = 0;
        rows.forEach(function (r) { if (r.bot) botTotal += r.value; else humanTotal += r.value; });

        return {
          metric: metric, window: w, windowed: windowed,
          rows: rows, ranked: rows.length,
          total: humanTotal + botTotal,
          me: mine ? { rank: mine.rank, of: rows.length, value: mine.value } : null,
          botShare: botTotal + humanTotal > 0 ? botTotal / (botTotal + humanTotal) : 0
        };
      },

      /* -- The seven that are not built on the web yet ------------------- */
      /*
         They are NOT stubbed out with fake outcomes. A lobby card that rolled a
         local die would be exactly the thing the §5 rule forbids. They render
         their real rules and real odds and say where to play them.
      */
      rules: function () { return CATALOGUE; }
    };

    function bust(roundId) {
      var r = state.rounds[roundId];
      r.over = true; r.survived = false; r.at = r.crashPoint; r.payout = 0;
      settle(r.bet, 0, 'Crash', 'Busted at ' + r.crashPoint.toFixed(2) + '×');
      return { ok: true, over: true, survived: false, multiplier: r.crashPoint, crashPoint: r.crashPoint, payout: 0, balance: state.me.cash };
    }

    /* What the client is allowed to see mid-hand. */
    function bjView(roundId) {
      var r = state.rounds[roundId];
      var h = r.hands[r.active];
      var t = handTotal(h.cards);
      return {
        bet: r.bet, staked: r.staked,
        hands: r.hands.map(function (x, i) {
          return { cards: x.cards, total: handTotal(x.cards).total, soft: handTotal(x.cards).soft,
                   bet: x.bet, doubled: x.doubled, done: x.done, active: i === r.active };
        }),
        active: r.active,
        dealerUp: r.dealer[0],
        dealerHidden: true,                                    // ← the hole card is not here
        can: {
          hit: !h.done && t.total < 21,
          stand: !h.done,
          double: !h.done && h.cards.length === 2 && !h.doubled && state.me.cash >= r.bet,
          split: !h.done && r.hands.length === 1 && h.cards.length === 2 && h.cards[0].r === h.cards[1].r && state.me.cash >= r.bet
        },
        balance: state.me.cash,
        over: false
      };
    }

    function finishBj(roundId) {
      var r = state.rounds[roundId];
      var anyLive = r.hands.some(function (h) { return handTotal(h.cards).total <= 21; });
      var dealerFinal = anyLive && !isBlackjack(r.dealer) ? dealerPlay(r.dealer) : r.dealer;
      r.dealer = dealerFinal;
      r.over = true;

      var totalPayout = 0;
      var results = r.hands.map(function (h) {
        var s = bjSettle(h.bet, h.cards, dealerFinal, r.fromSplit);
        totalPayout += s.payout;
        return { cards: h.cards, total: handTotal(h.cards).total, bet: h.bet, doubled: h.doubled,
                 result: s.result, payout: s.payout, net: s.payout - h.bet };
      });

      var detail = results.length > 1
        ? 'Split — ' + results.map(function (x) { return x.result; }).join(' / ')
        : BJ_RESULT_TEXT[results[0].result] || results[0].result;
      var bal = settle(r.staked, totalPayout, 'Blackjack', detail);

      return {
        ok: true, roundId: roundId, over: true,
        state: {
          over: true,
          bet: r.bet, staked: r.staked,
          hands: results,
          dealer: dealerFinal,
          dealerTotal: handTotal(dealerFinal).total,
          dealerBlackjack: isBlackjack(dealerFinal),
          payout: totalPayout,
          net: totalPayout - r.staked,
          balance: bal
        }
      };
    }

    var BJ_RESULT_TEXT = {
      blackjack: 'Blackjack, 3:2', win: 'Beat the dealer', dealer_bust: 'Dealer busted',
      lose: 'Dealer won', bust: 'Bust', dealer_bj: 'Dealer blackjack', push: 'Push'
    };

    /* ---- 3.5 the odds table, DERIVED not asserted --------------------- */
    /*
       Every return-to-player below is computed from the payout table above, so
       it cannot drift from the game. Where a figure is stated in casino.js's
       own comments it is checked against it in the note.
    */

    function slotsRTP() {
      var total = 0, i;
      for (i = 0; i < SLOT_SYMBOLS.length; i++) total += SLOT_SYMBOLS[i].weight;
      var ev = 0, p7 = 0;
      for (i = 0; i < SLOT_SYMBOLS.length; i++) {
        var p = SLOT_SYMBOLS[i].weight / total;
        if (SLOT_SYMBOLS[i].s === '7️⃣') p7 = p;
        ev += Math.pow(p, 3) * SLOT_SYMBOLS[i].three;             // three of a kind
      }
      var twoSevens = 3 * p7 * p7 * (1 - p7);
      ev += twoSevens * 5;
      var anyPair = 0;
      for (i = 0; i < SLOT_SYMBOLS.length; i++) {
        var q = SLOT_SYMBOLS[i].weight / total;
        anyPair += 3 * q * q * (1 - q);
      }
      ev += (anyPair - twoSevens) * 1.25;
      return ev;
    }
    function plinkoRTP() {
      var ev = 0;
      for (var k = 0; k <= PLINKO_ROWS; k++) {
        var c = 1;
        for (var j = 0; j < k; j++) c = c * (PLINKO_ROWS - j) / (j + 1);
        ev += (c / Math.pow(2, PLINKO_ROWS)) * PLINKO_BUCKETS[k];
      }
      return ev;
    }
    function horseRTP() {
      var s = 0;
      for (var i = 0; i < HORSES.length; i++) s += 1 / HORSES[i].odds;
      return 1 / s;
    }
    function horseChances() {
      var s = 0, i;
      for (i = 0; i < HORSES.length; i++) s += 1 / HORSES[i].odds;
      return HORSES.map(function (h) { return { name: h.name, emoji: h.emoji, odds: h.odds, chance: (1 / h.odds) / s }; });
    }

    /* The nine solo games. `web` says whether this prototype plays it. */
    var CATALOGUE = [
      {
        id: 'blackjack', name: 'Blackjack', emoji: '🃏', web: true,
        blurb: 'Beat the dealer’s hand without going over 21. Double on your first two cards, split a pair once.',
        rtp: null,
        rtpNote: 'Depends on how you play — the only game here where it does.',
        rules: [
          'Infinite shoe: every card is drawn fresh, so counting cannot work.',
          'Dealer stands on ALL 17, soft included.',
          'Blackjack pays 3:2 (a $100 bet returns $250).',
          'Double: one more card, twice the stake, hand over.',
          'Split: matching ranks only, once per hand. A split 21 pays even money, not 3:2.',
          'Push returns your stake. No insurance, no surrender.'
        ]
      },
      {
        id: 'crash', name: 'Crash', emoji: '📈', web: true,
        blurb: 'A multiplier climbs from 1.00× and crashes at a point rolled before you see it. Cash out first.',
        rtp: 0.96,
        rtpNote: 'Exactly 96% at every multiplier — holding longer is never better value, only riskier.',
        rules: [
          '4% of rounds bust instantly at 1.00×.',
          'Otherwise the crash point is 0.96 / (1 − r), clamped to 1,000×. Median ≈ 1.9×.',
          'The crash point is rolled when the round opens and is never sent to your device.',
          'Cash-out rungs: ' + CRASH_RUNGS.map(function (x) { return x + '×'; }).join(' · ')
        ]
      },
      {
        id: 'slots', name: 'Slots', emoji: '🎰', web: false,
        blurb: 'Three weighted reels. Three of a kind pays; two 7️⃣ pays a little; any pair returns a bit more than nothing.',
        rtp: slotsRTP(),
        rtpNote: 'Derived from the reel weights, not quoted.',
        rules: SLOT_SYMBOLS.map(function (s) {
          return 'Three ' + s.s + ' → ×' + s.three + '  (weight ' + s.weight + '/100)';
        }).concat(['Two 7️⃣ → ×5', 'Any pair → ×1.25', 'No match → nothing'])
      },
      {
        id: 'roulette', name: 'Roulette', emoji: '🔴', web: false,
        blurb: 'European single-zero wheel. Red/black, odd/even, low/high pay ×2. A straight-up number pays ×36.',
        rtp: 36 / 37,
        rtpNote: 'One green zero across 37 pockets — the classic 2.70%.',
        rules: [
          '37 pockets: 0–36, one green zero.',
          'Even-money bets (red, black, odd, even, 1–18, 19–36) pay ×2 and all lose on 0.',
          'A straight-up number pays ×36.',
          'Reds: ' + RED.join(', ')
        ]
      },
      {
        id: 'highlow', name: 'High-Low', emoji: '🎴', web: false,
        blurb: 'A card 1–13 is shown. Guess whether the next is higher or lower. Ties lose.',
        rtp: 0.97,
        rtpNote: 'The payout scales to the odds, so peeking at the card first is worth nothing.',
        rules: [
          'Multiplier = 0.97 × 13 ÷ (number of cards that win).',
          'Guess higher on a 2 → 11 of 13 cards win → ×1.15.',
          'Guess higher on a 10 → 3 of 13 win → ×4.20.',
          'Ties lose, which is where the 3% lives.'
        ]
      },
      {
        id: 'mines', name: 'Mines', emoji: '💣', web: false,
        blurb: 'A 4×5 grid with bombs hidden in it. Every safe tile raises the multiplier. Cash out whenever.',
        rtp: 0.97,
        rtpNote: 'The fair no-edge value × 0.97, at every step.',
        rules: [
          '20 tiles. You choose how many bombs.',
          'After k safe picks with b bombs: 0.97 × ∏ (20−i)/(20−b−i) for i < k.',
          '3 bombs, 5 safe picks → ×' + minesMultiplier(3, 5).toFixed(2) + '.',
          '5 bombs, 5 safe picks → ×' + minesMultiplier(5, 5).toFixed(2) + '.',
          'One bomb ends it, and everything on the table goes.'
        ]
      },
      {
        id: 'plinko', name: 'Plinko', emoji: '🔻', web: false,
        blurb: 'Drop a chip through 8 rows of pegs into one of 9 buckets. The edges pay big; the middle is where it usually lands.',
        rtp: plinkoRTP(),
        rtpNote: 'Derived from the binomial walk over the real bucket table.',
        rules: PLINKO_BUCKETS.map(function (b, i) {
          var c = 1; for (var j = 0; j < i; j++) c = c * (8 - j) / (j + 1);
          return 'Bucket ' + (i + 1) + ' → ×' + b + '  (' + (100 * c / 256).toFixed(1) + '% of drops)';
        })
      },
      {
        id: 'coinflip', name: 'Coinflip', emoji: '🪙', web: false,
        blurb: 'Heads or tails. A true 50/50 that pays ×1.95 — the cleanest bet in the building.',
        rtp: 0.975,
        rtpNote: 'The lowest edge of the nine. Also the duel primitive: player-vs-player it is a genuine coinflip with no house at all.',
        rules: [
          'Fair 50/50.',
          'House game pays ×1.95 — a $100 bet returns $195.',
          'A duel between two members pays the whole pot, so the edge is zero.'
        ]
      },
      {
        id: 'horse', name: 'Horse Race', emoji: '🏇', web: false,
        blurb: 'Six horses with fixed odds. Back one. It is the same value whoever you pick — that is the design.',
        rtp: horseRTP(),
        rtpNote: 'Win probability is 1/odds normalised, so every horse returns the same ' + (100 * horseRTP()).toFixed(1) + '%.',
        rules: horseChances().map(function (h) {
          return h.emoji + ' ' + h.name + ' — ×' + h.odds + ' at ' + (100 * h.chance).toFixed(1) + '%';
        })
      }
    ];

    return api;
  })();

  /* ======================================================================
     §4 · CLIENT
     ----------------------------------------------------------------------
     Rendering, navigation, formatting, entitlement states. Reads from §3 and
     from mock-data.js. Never decides anything.
     ====================================================================== */

  /* -- 4.1 icons the design system does not carry ------------------------ */
  /* Added here rather than in asbern.js (another agent owns that file). Every
     one of them belongs in the shared registry — see the promotion note. */
  var EXTRA_ICONS = {
    dice:      '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
    cards:     '<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M8 10.5 10 13l-2 2.5L6 13l2-2.5Z"/><path d="M16.5 4.2 20.8 5.6a2 2 0 0 1 1.2 2.5L18.5 19"/>',
    flag:      '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5"/>',
    fire:      '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-5.5-3-9 0 0-2.5 1.5-3.5 4C10 8 9 6.5 9 6.5 7.5 8.5 6 11 6 15a6 6 0 0 0 6 6Z"/><path d="M12 21a2.6 2.6 0 0 0 2.6-2.6c0-1.7-1.3-2.4-1.3-3.9 0 0-1.6 1-2 2.3-.6-.7-1.2-1.2-1.2-1.2-.4.8-.7 1.6-.7 2.8A2.6 2.6 0 0 0 12 21Z"/>',
    medal:     '<circle cx="12" cy="15" r="5"/><path d="m8.5 10.5-3-7M15.5 10.5l3-7M9 3.5h6"/><path d="m12 13 .8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9L9.3 15l1.9-.3.8-1.7Z"/>',
    message:   '<path d="M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z"/>',
    mic:       '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/>',
    heart:     '<path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/>',
    wallet:    '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12a2 2 0 0 1 2 2v1"/><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M16.5 13.5h.01"/>',
    gift:      '<rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13v6.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V13M12 9v11.5"/><path d="M12 9S10.5 4 8.2 4a2.2 2.2 0 0 0 0 5M12 9s1.5-5 3.8-5a2.2 2.2 0 0 1 0 5"/>',
    expand:    '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3"/>',
    calendar:  '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    trend:     '<path d="M3 17 9.5 10.5l3.5 3L21 6"/><path d="M15 6h6v6"/>'
  };
  function icon(name, cls) {
    if (EXTRA_ICONS[name]) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' +
             (cls ? ' class="' + cls + '"' : '') + '>' + EXTRA_ICONS[name] + '</svg>';
    }
    return A.icon(name, cls);
  }

  /* -- 4.2 the plan preview control -------------------------------------- */
  /*
     ⚠ NOT A MEMBER FEATURE. A member cannot change their server's plan. This
     exists so every locked state in this prototype can be inspected without
     editing a file, and every page labels it as a preview control.
  */
  var PLAN_KEY = 'asbern.app.plan';
  function planGet() {
    try { return localStorage.getItem(PLAN_KEY) || 'pro'; } catch (e) { return 'pro'; }
  }
  function planSet(id) {
    try { localStorage.setItem(PLAN_KEY, id); } catch (e) { /* private mode */ }
    location.reload();
  }

  /**
   * The entitlement check, in the shape PRICING.md §7.1 specifies for
   * `adminactions.run()`. Every surface calls the same one.
   *
   * ⚠ IT FAILS TOWARDS THE CUSTOMER. If plan state cannot be read we ALLOW and
   * log. An outage in billing must never turn off a paying server's economy —
   * the opposite direction to budget.js's fail-closed rule, and deliberately so.
   */
  function entitled(moduleId) {
    var m = MODULES[moduleId];
    if (!m) return { ok: true };                                   // unknown module: allow
    if (m.status === 'planned') {
      return { ok: false, why: 'planned', title: m.name + ' is not built',
               message: 'This one genuinely does not exist yet. It is on the roadmap and it is not pretending otherwise.' };
    }
    if (m.status === 'dark') {
      return { ok: false, why: 'dark', title: m.name + ' is switched off',
               message: 'Built and shipped, disabled behind an owner toggle. Your server’s owner decides whether it ever comes on.' };
    }
    var plan = planGet();
    if (tierRank(plan) >= tierRank(m.min)) return { ok: true, plan: plan };
    return {
      ok: false, why: 'entitlement', tier: m.min, tierName: tierName(m.min), plan: plan,
      title: m.name + ' is not on this server’s plan',
      message: 'Hearthstead is on ' + tierName(plan) + '. ' + m.name + ' needs ' + tierName(m.min) +
               '. Only a server admin can change that — and nothing you have earned is affected either way: ' +
               'balances are not zeroed, levels are not reset, and the history keeps being collected whether or not the plan can read it.'
    };
  }

  /** The standard locked block. Never a broken page, never a dead button. */
  function lockedHtml(gate, opts) {
    opts = opts || {};
    return '' +
      '<div class="app-lock">' +
        '<span class="app-lock__glyph">' + icon(gate.why === 'planned' ? 'sliders' : 'lock') + '</span>' +
        '<h3 class="app-lock__title">' + esc(gate.title) + '</h3>' +
        '<p class="app-lock__body">' + esc(gate.message) + '</p>' +
        (gate.why === 'entitlement'
          ? '<p class="app-lock__body"><span class="as-badge as-badge--accent">Needs ' + esc(gate.tierName) + '</span></p>'
          : '') +
        (opts.extra || '') +
      '</div>';
  }

  /* -- 4.3 formatting ---------------------------------------------------- */

  function hm(minutes) {
    minutes = Math.round(minutes);
    var h = Math.floor(minutes / 60), m = minutes % 60;
    if (h === 0) return m + 'm';
    if (m === 0) return h + 'h';
    return h + 'h ' + m + 'm';
  }
  function hoursFromMin(minutes) { return Math.round(minutes / 60); }
  function pct(n) { return Math.round(n * 100) + '%'; }
  function pct1(n) { return (n * 100).toFixed(1) + '%'; }
  function signed(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + moneyFull(Math.abs(n)).slice(0); }
  function signedMoney(n) {
    if (n === 0) return moneyFull(0);
    return (n > 0 ? '+' : '−') + moneyFull(Math.abs(n));
  }
  function until(ts) {
    var ms = ts - Date.now();
    if (ms <= 0) return 'ready';
    var mins = Math.ceil(ms / 60000);
    if (mins < 60) return 'in ' + mins + 'm';
    var hrs = Math.floor(mins / 60);
    return 'in ' + hrs + 'h ' + (mins % 60) + 'm';
  }

  /* -- 4.4 building blocks ----------------------------------------------- */

  /** A labelled meter. `value`/`max` are numbers; `text` overrides the caption. */
  function meter(label, value, max, opts) {
    opts = opts || {};
    var p = max > 0 ? clamp(value / max, 0, 1) : 0;
    var mod = opts.variant ? ' app-meter--' + opts.variant : (p >= 1 ? ' app-meter--done' : '');
    return '' +
      '<div class="app-meter' + mod + '">' +
        '<div class="app-meter__row">' +
          '<span class="app-meter__label">' + esc(label) + '</span>' +
          '<span class="app-meter__value">' + (opts.text !== undefined ? opts.text : esc(A.num(value) + ' / ' + A.num(max))) + '</span>' +
        '</div>' +
        '<div class="as-progress' + (opts.lg ? ' as-progress--lg' : '') + '" role="progressbar" aria-label="' + esc(label) +
          '" aria-valuenow="' + Math.round(p * 100) + '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="as-progress__bar" style="width:' + (p * 100).toFixed(1) + '%"></div>' +
        '</div>' +
      '</div>';
  }

  /** A circular progress ring. */
  function ring(fraction, label, sub, opts) {
    opts = opts || {};
    var r = 26, c = 2 * Math.PI * r;
    var off = c * (1 - clamp(fraction, 0, 1));
    return '' +
      '<div class="app-ring' + (opts.frost ? ' app-ring--frost' : '') + '" role="img" aria-label="' + esc(opts.aria || (label + ' ' + sub)) + '">' +
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<circle class="app-ring__track" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="5"/>' +
          '<circle class="app-ring__bar" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="5" ' +
            'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
        '</svg>' +
        '<span class="app-ring__label">' + esc(label) + '<small>' + esc(sub) + '</small></span>' +
      '</div>';
  }

  function figure(label, value, note, accent) {
    return '' +
      '<div class="app-figure">' +
        '<span class="app-figure__label">' + esc(label) + '</span>' +
        '<span class="app-figure__value' + (accent ? ' app-figure__value--accent' : '') + '">' + value + '</span>' +
        (note ? '<span class="app-figure__note">' + note + '</span>' : '') +
      '</div>';
  }

  function kv(rows) {
    return '<div class="app-kv">' + rows.map(function (r) {
      return '<div class="app-kv__row"><span class="app-kv__k">' + r[0] + '</span>' +
             '<span class="app-kv__v' + (r[2] ? ' app-kv__v--muted' : '') + '">' + r[1] + '</span></div>';
    }).join('') + '</div>';
  }

  function avatar(initials, cls) {
    return '<span class="as-avatar ' + (cls || '') + '" aria-hidden="true">' + esc(initials) + '</span>';
  }

  /* -- 4.5 playing cards, as inline SVG ----------------------------------- */
  /*
     Matches src/lib/cards.js's model exactly: { r: 1..13, s: 0..3 } where
     s maps ♠ ♥ ♦ ♣ (poker.js SUITS order). Drawn rather than imaged so the whole
     app stays a single self-contained folder with no network requests.
  */
  var RANK_LABEL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var SUIT_GLYPH = ['♠', '♥', '♦', '♣'];
  var SUIT_PATH = [
    /* spade  */ 'M12 3.2c-2.1 3-6.4 5.3-6.4 8.7 0 2 1.5 3.4 3.3 3.4 1 0 1.9-.4 2.4-1.1-.2 1.9-.9 3.4-2 4.3h5.4c-1.1-.9-1.8-2.4-2-4.3.5.7 1.4 1.1 2.4 1.1 1.8 0 3.3-1.4 3.3-3.4 0-3.4-4.3-5.7-6.4-8.7Z',
    /* heart  */ 'M12 19.5S4.6 14.6 4.6 9.7A3.9 3.9 0 0 1 12 7.4a3.9 3.9 0 0 1 7.4 2.3c0 4.9-7.4 9.8-7.4 9.8Z',
    /* diamond*/ 'M12 3.2 18.4 12 12 20.8 5.6 12Z',
    /* club   */ 'M12 3.4a3.1 3.1 0 0 0-2.4 5.1 3.1 3.1 0 1 0-1.5 5.8c.8 0 1.6-.3 2.1-.9-.2 1.9-.9 3.4-2 4.3h5.6c-1.1-.9-1.8-2.4-2-4.3.5.6 1.3.9 2.1.9a3.1 3.1 0 1 0-1.5-5.8A3.1 3.1 0 0 0 12 3.4Z'
  ];
  /**
   * One playing card. `card` is { r, s } or the string 'back'.
   * Colours come from tokens so the deck reads correctly in both themes — a
   * white-on-white card in light mode is the classic version of this bug.
   */
  function cardSvg(card, opts) {
    opts = opts || {};
    var W = 74, H = 104;
    var head = '<svg class="app-card ' + (opts.cls || '') + '" viewBox="0 0 ' + W + ' ' + H + '" ' +
               'style="' + (opts.delay ? 'animation-delay:' + opts.delay + 'ms;' : '') + '" ' +
               'role="img" aria-label="';
    if (card === 'back') {
      return head + 'Face-down card">' +
        '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" rx="7" fill="var(--as-surface-3)" stroke="var(--as-border-strong)"/>' +
        '<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" rx="4" fill="none" stroke="var(--as-accent-lo)" stroke-width="1.2" opacity=".55"/>' +
        '<path d="M' + (W / 2) + ' 18v68M' + (W / 2) + ' 26 22 40M' + (W / 2) + ' 48 22 62M' + (W / 2) + ' 20l22 15-22 15M' + (W / 2) + ' 52l22 15-22 15" ' +
          'fill="none" stroke="var(--as-accent-lo)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
        '</svg>';
    }
    var red = card.s === 1 || card.s === 2;
    var ink = red ? 'var(--as-danger)' : 'var(--as-text-1)';
    var label = RANK_LABEL[card.r] + ' of ' + ['spades', 'hearts', 'diamonds', 'clubs'][card.s];
    return head + esc(label) + '">' +
      '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" rx="7" fill="var(--as-surface-2)" stroke="var(--as-border-strong)"/>' +
      '<text x="8" y="21" font-family="var(--as-font-sans)" font-size="16" font-weight="700" fill="' + ink + '">' + RANK_LABEL[card.r] + '</text>' +
      '<text x="8" y="34" font-size="12" fill="' + ink + '">' + SUIT_GLYPH[card.s] + '</text>' +
      '<g transform="translate(' + (W / 2 - 14) + ',' + (H / 2 - 16) + ') scale(1.15)" fill="' + ink + '" opacity=".9">' +
        '<path d="' + SUIT_PATH[card.s] + '"/>' +
      '</g>' +
      '<g transform="rotate(180 ' + (W / 2) + ' ' + (H / 2) + ')">' +
        '<text x="8" y="21" font-family="var(--as-font-sans)" font-size="16" font-weight="700" fill="' + ink + '">' + RANK_LABEL[card.r] + '</text>' +
        '<text x="8" y="34" font-size="12" fill="' + ink + '">' + SUIT_GLYPH[card.s] + '</text>' +
      '</g>' +
      '</svg>';
  }

  /* -- 4.6 shared chrome -------------------------------------------------- */

  /** Fill in the wallet pill(s) and keep them ticking with idle income. */
  function wireWallet() {
    var nodes = $$('[data-app-wallet]');
    if (!nodes.length) return;
    var gate = entitled('economy');

    function paint(v) {
      nodes.forEach(function (n) {
        var amt = $('.app-wallet__amount', n);
        if (amt) amt.textContent = fmt(v);
        n.setAttribute('aria-label', gate.ok ? 'Balance ' + moneyFull(v) + ' Bucks' : 'Economy not on this plan');
      });
    }
    if (!gate.ok) {
      nodes.forEach(function (n) {
        n.innerHTML = icon('lock') + '<span>Economy off</span>';
        n.setAttribute('aria-label', 'The economy module is not on this server’s plan');
        n.setAttribute('data-as-tip', 'Not on this server’s plan');
      });
      return;
    }

    var me = Server.me();
    var shown = me.cash;
    paint(shown);

    /* The idle tycoon really does accrue while you are away — economy.js
       accrues at the top of all 13 mutators. Ticking the pill is the honest
       rendering of that, not decoration. */
    if (A.reducedMotion) return;
    var rate = me.incomePerSec;
    if (rate <= 0) return;
    var base = Server.balance(), t0 = Date.now();
    setInterval(function () {
      var live = Server.balance();
      if (live !== base) { base = live; t0 = Date.now(); }
      var v = Math.floor(base + rate * ((Date.now() - t0) / 1000));
      if (v !== shown) { shown = v; paint(v); }
    }, 1000);
  }

  /** Mark the current page in the top nav and the bottom tab bar. */
  function wireNav(page) {
    $$('[data-app-nav]').forEach(function (a) {
      if (a.getAttribute('data-app-nav') === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /** Render the preview plan control into every [data-app-preview]. */
  function wirePreview() {
    var host = $('[data-app-preview]');
    if (!host) return;
    var cur = planGet();
    host.innerHTML = '' +
      '<span class="as-badge as-badge--plain">Preview control</span>' +
      '<span>Not a member feature — a member cannot change their server’s plan. It is here so every locked state on this prototype can be seen.</span>' +
      '<label class="as-field" style="flex:0 0 auto">' +
        '<span class="as-visually-hidden">Simulate this server’s plan</span>' +
        '<select class="as-select" data-app-plan aria-label="Simulate this server’s plan">' +
          TIERS.map(function (t) {
            return '<option value="' + t.id + '"' + (t.id === cur ? ' selected' : '') + '>' +
                   esc(t.name) + (t.monthly ? ' — $' + t.monthly + '/mo' : ' — $0') + '</option>';
          }).join('') +
        '</select>' +
      '</label>';
    var sel = $('[data-app-plan]', host);
    sel.addEventListener('change', function () { planSet(sel.value); });
  }

  /** Announce something to screen readers without a visual toast. */
  function announce(msg) {
    var live = $('[data-app-live]');
    if (!live) {
      live = A.el('div', { class: 'app-live', role: 'status', 'aria-live': 'polite', 'data-app-live': '' });
      document.body.appendChild(live);
    }
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* -- 4.7 boot ---------------------------------------------------------- */

  function mountIcons(scope) {
    $$('[data-app-icon]', scope || document).forEach(function (n) {
      if (n.getAttribute('data-app-icon-done')) return;
      n.innerHTML = icon(n.getAttribute('data-app-icon'));
      n.setAttribute('data-app-icon-done', '1');
    });
  }

  function boot() {
    var page = document.body.getAttribute('data-app-page') || '';
    document.body.classList.add('app-body');
    mountIcons(document);
    wireNav(page);
    wireWallet();
    wirePreview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ====================================================================== */

  return {
    /* rules (read-only) */
    ECON: ECON, LVL: LVL, ASSETS: ASSETS, ASSET_BY_ID: ASSET_BY_ID,
    WEALTH_TIERS: WEALTH_TIERS, wealthTier: wealthTier, nextWealthTier: nextWealthTier,
    MIL_RANKS: MIL_RANKS, rankForLevel: rankForLevel, nextMilRank: nextMilRank,
    xpForLevel: xpForLevel, totalXpToReach: totalXpToReach,
    prestigeLabel: prestigeLabel, prestigeCost: prestigeCost,
    ACHIEVEMENTS: ACHIEVEMENTS, MASTERY: MASTERY,
    QUEST_REWARDS: QUEST_REWARDS, TIER_MULT: TIER_MULT, rewardFor: rewardFor,
    GOAL_REWARD: GOAL_REWARD, SEASON: SEASON,
    WINDOWS: WINDOWS, BOT_SHARE: BOT_SHARE,
    TIERS: TIERS, MODULES: MODULES, tierName: tierName, tierRank: tierRank,

    /* the mock backend */
    server: Server,

    /* client */
    entitled: entitled, lockedHtml: lockedHtml,
    plan: { get: planGet, set: planSet },
    icon: icon, cardSvg: cardSvg,
    fmt: fmt, money: money, moneyFull: moneyFull, moneyRate: moneyRate,
    incomePerSec: incomePerSec, netWorth: netWorth, assetCost: assetCost, assetSpend: assetSpend,
    hm: hm, hoursFromMin: hoursFromMin, pct: pct, pct1: pct1, signedMoney: signedMoney, until: until,
    meter: meter, ring: ring, figure: figure, kv: kv, avatar: avatar,
    announce: announce, mountIcons: mountIcons,
    clamp: clamp, hashSeed: hashSeed,
    $: $, $$: $$, esc: esc, set: set, text: text
  };
})();

window.MemberApp = MemberApp;
