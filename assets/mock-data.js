/* =============================================================================
   ASBERN · assets/mock-data.js
   -----------------------------------------------------------------------------
   ONE shared data module for every page in packages/web — the marketing site
   today, the client dashboard and the member app when those land.

   HOW TO USE
     <script src="assets/mock-data.js"></script>      (classic script, no build)
     …then read `window.AsbernMock` (alias `window.AM`).

   RULES FOR ANYONE EXTENDING THIS FILE
     1. No `import`/`export`. Pages are opened straight off the filesystem and
        `file://` blocks ES modules. This is a plain script that assigns a global.
     2. Anything invented rather than measured carries `_placeholder: true`.
        Anything taken from a document that is itself a proposal carries
        `_provisional: true` and `_source`. Grep for both before quoting a number.
     3. Anything MEASURED carries `_source` naming where it came from.
     4. Never claim a feature. `status` is the single source of truth for what the
        site may advertise:
           'shipped' — built, running in production today
           'partial' — some of it exists; say which part
           'dark'    — built and merged, ships DISABLED behind an owner toggle
           'unwired' — code exists, deliberately not connected
           'planned' — designed and scheduled. NO CODE. Must render as planned.
        ⚠ PRICING.md §7: "A `planned` or `dark` row must never appear on a
        pricing page as if it shipped." `sellable` below enforces that.

   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ PRICING IS PROVISIONAL — READ BEFORE QUOTING ANY NUMBER ⚠⚠
   ═══════════════════════════════════════════════════════════════════════════
   The `pricing` object is transcribed from `docs/_platform/PRICING.md`, whose
   own header reads: **"Status: proposal, not committed."**

   AND IT IS ALREADY KNOWN TO BE CHANGING. Owner decision, 2026-08-05, after
   that document was written:
     · the ladder is being **revised downward** to undercut the market — the
       $0 / $5 / $12 / $29 / $19 numbers below WILL be replaced with lower ones;
     · **AI is usage-based metered billing, not a subscription line, and it is
       roadmap — not on sale.** It must never render as an included tier feature.

   Every page reads this object and nothing else. Swapping in the final model is
   an edit to THIS FILE ONLY — there is not a single price, tier name, allowance
   or module id written into any .html file. See README.md → "What to swap".
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

(function (root) {

  /* ---------------------------------------------------------------------- */
  /*  BRAND                                                                  */
  /* ---------------------------------------------------------------------- */

  var brand = {
    name: 'Asbern',
    etymology: 'Old Norse Ásbjǫrn — óss (“god”) + bjǫrn (“bear”)',
    tagline: 'A Discord platform with a cinema in it.',
    position: 'Everything MEE6 and Arcane do, free — and then a cinema and a game-server ' +
              'control panel that nobody else has.',
    _source: 'position: docs/_platform/PRICING.md §6.3'
  };

  /* ---------------------------------------------------------------------- */
  /*  MEASURED FACTS — safe to quote. Each carries where it came from.       */
  /* ---------------------------------------------------------------------- */

  var facts = {
    memory:      { value: '136 MB',  label: 'Resident memory, whole container',       _source: 'ARCHITECTURE.md §1' },
    cpu:         { value: '0.02%',   label: 'CPU at idle on the live deployment',     _source: 'ARCHITECTURE.md §1' },
    tests:       { value: '2,376',   label: 'Automated tests, all green',             _source: 'PLAN.md baseline' },
    controls:    { value: '221',     label: 'Admin controls — 163 of them free',      _source: 'adminactions.describe(), run 2026-08-05' },
    casinoGames: { value: '12',      label: 'Casino games — 9 solo, 3 multiplayer',   _source: 'README.md' },
    ranks:       { value: '21 + 11', label: 'Military ranks, then prestige tiers',    _source: 'README.md' },
    channels:    { value: '~150',    label: 'Curated live TV channels with a guide',  _source: 'README.md' },
    guildData:   { value: '~0.85 MB',label: 'Total live data for a 150-member server',_source: 'PLAN.md baseline' },
    guildCost:   { value: '2–13¢',   label: 'Infrastructure cost per server / month', _source: 'ARCHITECTURE.md §2' }
  };

  /* ---------------------------------------------------------------------- */
  /*  MODULES — the marketing view. Ten things a human would name.           */
  /*  The fine-grained normative list is pricing.registry (40 rows).         */
  /* ---------------------------------------------------------------------- */

  var modules = [
    {
      id: 'screening',
      name: 'Screening Room',
      icon: 'film',
      status: 'shipped',
      minTier: 'pro',
      metered: 'egress',
      flagship: true,
      tagline: 'Films and live TV from your own library, on one public link.',
      summary:
        'Put a film, an episode or a live channel on a shared stream. Everyone taps one link — no ' +
        'Plex account, no install, no screen-share mush. The stream is transcoded next to your files ' +
        'and delivered as HLS to a browser player.',
      points: [
        'Reads your Plex library directly — films and TV, with a Movies / TV-Shows picker',
        'A second independent screen on Studio, so two groups can watch different things at once',
        'Every viewer gets their own single-use link, which is how attendance is actually counted',
        'TV shows auto-advance episode to episode while anyone is still watching',
        'A screen shuts itself off after 15 minutes with nobody on it',
        '“Tell me when it lands” remembers a title that is not in the library yet and pings you'
      ],
      caveat: 'Needs a machine with your media on it, and it consumes relay bandwidth — which is metered.'
    },
    {
      id: 'livetv',
      name: 'Live TV',
      icon: 'tv',
      status: 'shipped',
      minTier: 'pro',
      metered: 'egress',
      tagline: 'Around 150 channels with an always-current guide.',
      summary:
        'IPTV channels joined to an XMLTV guide, so the picker shows what is actually on right now. ' +
        'Category tabs, a favourites tab built from what you actually watch, and type-anything search.',
      points: [
        'What’s On guide, refreshed continuously',
        'Category tabs — Sports, News, Entertainment, and whatever your provider groups',
        'Favourites, ranked by your own watch history',
        'Dead channels are detected on cold start and mid-stream, announced, and flagged to moderators'
      ],
      caveat: 'Live TV left running is the single biggest way to burn a bandwidth allowance.'
    },
    {
      id: 'economy',
      name: 'Economy & Casino',
      icon: 'coins',
      status: 'shipped',
      minTier: 'community',
      tagline: 'A currency with real stakes, and twelve games to lose it in.',
      summary:
        'Real-life-scaled virtual cash with daily and work faucets, an idle tycoon that earns while ' +
        'you are away, and a casino whose house edge has been verified rather than assumed.',
      points: [
        'Solo: slots, blackjack with double and split, crash, mines, roulette, high-low, coinflip, plinko, horse race',
        'Multiplayer: shared-dealer blackjack, six-seat Texas Hold’em with side pots, coinflip duels',
        'Idle tycoon assets with income that accrues offline',
        'Per-user ledger; stakes survive a restart mid-hand',
        'Money mutators are atomic and conservation-tested — the total supply is checked, not trusted'
      ],
      caveat:
        'Currency and XP cannot be bought at any price, on any plan. A subscription buys access to the ' +
        'casino module; it never grants a balance, alters odds or multiplies a payout.'
    },
    {
      id: 'leveling',
      name: 'Leveling & Achievements',
      icon: 'trophy',
      status: 'shipped',
      minTier: 'free',
      tagline: 'Twenty-one ranks, eleven prestige tiers, and XP you cannot buy.',
      summary:
        'Activity XP from messages and genuine voice presence, climbing a military rank ladder to ' +
        'level 100 and then into prestige. Anti-farm capped, and deliberately not for sale.',
      points: [
        'Private through Master General, then an eleven-tier prestige ladder',
        'Sixteen achievements and equippable name icons',
        'Voice XP requires real presence, not an idle connection',
        'Rank roles assigned and repaired automatically',
        'Free, on every plan, forever'
      ]
    },
    {
      id: 'stats',
      name: 'Stats & Wrapped',
      icon: 'chart',
      status: 'shipped',
      minTier: 'free',
      tagline: 'Analytics that were checked against another product before we trusted them.',
      summary:
        'An on-box activity collector replaced a third-party stats service — but only after months ' +
        'of running both and diffing every figure. Day, week and month windows are free; the year and ' +
        'all-time windows, and the Wrapped recap, are on Community.',
      points: [
        'Messages and voice, by member, channel and window',
        'Day / week / month on every plan including Free',
        'Year and all-time windows, plus Wrapped, on Community and up',
        'Parity-verified against the previous provider before the switch'
      ],
      caveat:
        'The “year” window is a rolling twelve months, not a calendar year, and the UI says so. ' +
        'Nothing is deleted by being on Free — the collector keeps writing history the tier cannot ' +
        'yet read, and upgrading reveals all of it instantly.'
    },
    {
      id: 'challenges',
      name: 'Challenges & Goals',
      icon: 'target',
      status: 'shipped',
      minTier: 'community',
      tagline: 'Rotating objectives, shared goals, and weekends that pay double.',
      summary:
        'Short personal challenges, month-long server goals and a calendar of live events that give a ' +
        'quiet server something to push at — wired into the same economy and levelling the rest of the ' +
        'platform uses. Every rotation is a pure function of the date, so nothing is scheduled, nothing ' +
        'drifts, and a restart cannot lose a day.',
      /* ⚠ These numbers are counted from packages/core/src — challenges.js,
         goals.js and liveevents.js — not estimated. The four casino-specific
         live events were deleted by owner decision on 2026-08-02 and must not
         reappear in this list. */
      points: [
        '31 daily and 14 weekly challenges, rotating by date rather than by a scheduler',
        'Targets calibrate to your own server’s activity — a percentile, not a number somebody guessed',
        '12 monthly community goals with shared progress, and a 12-week season on top',
        'Live events: Double XP and Double Money weekends, four midweek boosts, and Premiere Nights',
        'A contribution gate on shared goals, so a lurker cannot claim a server’s work',
        'Rewards paid through the same audited money path as everything else — and never a role you did not earn',
        'Free plans run one challenge and one goal at a time; Community removes the limit'
      ]
    },
    {
      id: 'gameservers',
      name: 'Game Servers',
      icon: 'server',
      status: 'shipped',
      minTier: 'pro',
      tagline: 'Start, stop and configure your game servers from Discord.',
      summary:
        'Preset servers your members can bring up themselves, with live player counts, per-world ' +
        'settings and an idle watchdog that shuts them down when nobody is playing.',
      points: [
        'Minecraft, Enshrouded, 7 Days to Die and anything else you add — adding a game is one config entry',
        'Live player counts via Server List Ping and Source A2S',
        'Auto-shutdown after 1–2 hours empty, and it survives a bot restart',
        'Continue-or-new-world flow with every game setting editable from the menu',
        'Graceful stop that lets the game write its save — not a kill'
      ],
      caveat: 'Runs on your hardware. No bandwidth cost — game traffic never touches our relay.'
    },
    {
      id: 'moderation',
      name: 'Moderation & Admin Console',
      icon: 'shield',
      status: 'shipped',
      minTier: 'free',
      tagline: '221 controls, 163 of them free, and not one is hand-written UI.',
      summary:
        'The console is a data registry: one definition per control, rendered wherever it is needed. ' +
        'That is why the same controls appear in Discord, over the HTTP API and on the web dashboard ' +
        'without three implementations drifting apart.',
      points: [
        'Members, channels, roles, guild identity, safety, emoji, invites, AutoMod — all free',
        'Blueprints — kits, templates and permission presets with rollback — on Community',
        'Destructive actions are dry-run first, then confirmed',
        'Permission checks live in the runner, not on the button, so a control cannot forget its gate',
        'Admin means Discord permission, not a role ID somebody has to remember to grant'
      ],
      caveat:
        'Only 32 of the 221 controls are held back to sell a tier. A further 26 belong to paid modules ' +
        'and are meaningless without them.'
    },
    {
      id: 'ai',
      name: 'AI Companions',
      icon: 'bot',
      status: 'dark',
      minTier: null,
      metered: 'ai',
      tagline: 'Built, switched off, and not on sale.',
      summary:
        'Voice and chat companions with a full command bridge and permission-aware memory. The code ' +
        'is merged and it ships disabled. It is not for sale and will not be until the spend ceiling ' +
        'is per-server rather than per-process — today one server’s chatty evening would spend another ' +
        'server’s budget, and that is a correctness bug, not a missing feature.',
      points: [
        'Chat and voice, with a bridge into the same commands the menu drives',
        'Memory that respects the permissions of whoever is asking',
        'A hard spend ceiling enforced in code — but currently one ceiling for the whole process',
        'Off by default, and unavailable to buy'
      ],
      caveat:
        'When it does go on sale it will be usage-based prepaid credit, never bundled into a plan. ' +
        'One busy server measured $35.84 a month in tokens — three times the price of the plan it ' +
        'would have sat in. That is arithmetic, not positioning.'
    },
    {
      id: 'music',
      name: 'Music',
      icon: 'music',
      status: 'planned',
      minTier: 'pro',
      tagline: 'Your own library through the same pipeline. Not built yet.',
      summary:
        'Planned: read the music library on the Plex server you have already connected, and play it ' +
        'through Lavalink. Deliberately not sourced from YouTube — that is what got the big music ' +
        'bots shut down, and the risk is worse once real money is in the same product.',
      points: [
        'Sourced from your own library, never scraped from a streaming site',
        'Audio-only rendition of the existing media pipeline',
        'Background audio and lock-screen controls on mobile'
      ],
      caveat:
        'Not built. Spotify’s API does not permit third-party playback, and Plexamp is a player with ' +
        'no public API — so neither is a shortcut.'
    }
  ];

  /* Modules the market expects that Asbern genuinely does not have. */
  var notBuilt = [
    { name: 'Level import from MEE6 / Arcane', note: 'Planned, and the highest-priority gap. Deliberately reserved to the Free tier so it can never be sold — it is how you become a customer, not a feature. MEE6 data is importable; Arcane has no public API or export, so an Arcane migration can only read the roles it assigned.' },
    { name: 'Tickets & modmail', note: 'No code. Planned for Community.' },
    { name: 'Giveaways', note: 'No code. Planned for Community.' },
    { name: 'Starboard', note: 'No code. Planned for Free.' },
    { name: 'Reminders', note: 'No code. Planned for Free.' },
    { name: 'Temporary voice channels', note: 'No code. Planned for Community.' },
    { name: 'Birthdays', note: 'No code. Planned for Free.' },
    { name: 'Social alerts (Twitch / YouTube / X)', note: 'No code. Planned for Community.' },
    { name: 'Automod rules engine', note: 'Partial — Asbern can toggle Discord’s native AutoMod, but has no rules engine of its own.' },
    { name: 'Moderation cases & modlog', note: 'Partial — actions are logged, but there is no case file to open.' },
    { name: 'Web dashboard', note: 'Planned. This site is not it — it is a preview of the marketing surface only.' },
    { name: 'Mobile apps', note: 'Planned — React Native, sharing the same core.' },
    { name: 'Self-host bridge', note: 'Partial — the agent pattern runs in production but dials inward across a LAN. The outbound bridge and the signed installer are not shipped.' }
  ];

  /* ═══════════════════════════════════════════════════════════════════════ */
  /*  PRICING — ⚠ PROVISIONAL. See the banner at the top of this file.       */
  /*  Transcribed from docs/_platform/PRICING.md (itself "proposal, not      */
  /*  committed"), and already superseded in direction: the ladder is being  */
  /*  revised DOWNWARD, and AI is metered + roadmap, never a tier feature.   */
  /* ═══════════════════════════════════════════════════════════════════════ */

  var pricing = {
    _provisional: true,
    _source: 'docs/_platform/PRICING.md §1, §3, §4, §7, §8 — "Status: proposal, not committed."',
    _swapNote:
      'Replace tiers[].monthly and tiers[].annual when the revised (lower) ladder lands. Nothing ' +
      'else in packages/web hardcodes a price.',

    currency: 'USD',
    symbol: '$',

    /* The organising principle the whole page is built to communicate. */
    principle:
      'The subscription buys features. Bandwidth and AI are usage-based — because a subscription ' +
      'cannot be both cheap and quietly subsidise somebody else’s movie night.',

    /* ⚠ There is deliberately NO platform fee, setup fee or per-seat fee. */
    platformFee: null,
    platformFeeNote:
      'No base fee, no setup fee, no per-seat charge. The plan price is the whole fixed cost; the ' +
      'only additive line items are bandwidth overage and AI credit, both opt-in and both zero by default.',

    multiGuild: {
      discount: 0.25,
      note: 'Additional servers on one account are 25% off each. That comes out of margin, not out of ' +
            'a cost that disappears — the cost really is per server. 25% is the floor; there is no ' +
            'deeper volume tier.'
    },

    /* ---------------- TIERS ---------------- */
    tiers: [
      {
        id: 'free',
        name: 'Free',
        epithet: 'Everything the big bots charge for',
        monthly: 0,
        annual: 0,
        rank: 0,
        cta: 'Start on Free',
        blurb: 'Levels, moderation, 163 of the 221 console controls, and stats. Not a trial — a tier.',
        trigger: null,
        egressGB: 0,
        egressHuman: 'No streaming',
        memberCeiling: 10000,
        highlights: [
          'Levelling, achievements, ranks and profiles',
          '163 of the 221 admin controls',
          'Moderation, notices, counting, title requests',
          'Stats — day, week and month windows',
          'One challenge and one goal at a time'
        ],
        excluded: [
          'No economy or casino',
          'No Wrapped, no year or all-time stats',
          'No screening room, live TV or game servers'
        ]
      },
      {
        id: 'community',
        name: 'Community',
        epithet: 'The money game, and your whole history',
        monthly: 3,
        annual: 30,
        rank: 1,
        cta: 'Choose Community',
        blurb: 'The economy, all twelve casino games, Wrapped, and stats back to the beginning.',
        trigger: '“We want the money game and we want to see last year.”',
        egressGB: 0,
        egressHuman: 'No streaming',
        memberCeiling: 10000,
        highlights: [
          'Everything in Free',
          'Economy, idle tycoon and the full casino',
          'Wrapped, plus year and all-time stats',
          'Unlimited challenges and goals',
          'Blueprints — composite operations with rollback',
          'Scheduled backup and restore',
          'Read-only web dashboard'
        ],
        excluded: ['No screening room or live TV', 'No game servers', 'No API or MCP surface']
      },
      {
        id: 'pro',
        name: 'Pro',
        epithet: 'The cinema, and the machine room',
        monthly: 8,
        annual: 80,
        rank: 2,
        popular: true,
        cta: 'Choose Pro',
        blurb: 'Screening room, live TV, game servers, the API — and 250 GB of relay bandwidth.',
        trigger: '“We want to watch something together.”',
        egressGB: 250,
        egressHuman: '≈150 viewer-hours ≈ 6 movie nights',
        memberCeiling: 10000,
        highlights: [
          'Everything in Community',
          'Screening Room — films and TV from your library',
          'Live TV with the guide',
          'Game-server control and world settings',
          '250 GB of relay bandwidth a month',
          '/v1 HTTP API and the MCP surface'
        ],
        excluded: ['One screen at a time', 'AI is metered and not yet on sale']
      },
      {
        id: 'studio',
        name: 'Studio',
        epithet: 'Two screens, and a bigger room',
        monthly: 18,
        annual: 180,
        rank: 3,
        cta: 'Choose Studio',
        blurb: 'A second simultaneous screen, six times the bandwidth, and a 50,000-member ceiling.',
        trigger: '“We ran out of movie nights.”',
        egressGB: 1500,
        egressHuman: '≈900 viewer-hours ≈ 36 movie nights',
        memberCeiling: 50000,
        highlights: [
          'Everything in Pro',
          'A second independent screen',
          '1,500 GB of relay bandwidth a month',
          'Up to 50,000 members'
        ],
        excluded: ['AI is metered and not yet on sale']
      },
      {
        id: 'sovereign',
        name: 'Sovereign',
        epithet: 'Your metal, your data',
        monthly: 12,
        annual: 120,
        rank: 2,
        selfHost: true,
        cta: 'Read the requirements',
        blurb: 'Every paid module, licensed to run on your own hardware. It costs more than Pro, and that is the honest answer.',
        trigger: '“Our data does not leave our machine.”',
        egressGB: 250,
        egressHuman: '≈150 viewer-hours ≈ 6 movie nights',
        memberCeiling: null,
        highlights: [
          'A licence for every paid module — no tier gating at all',
          'The hosted relay, 250 GB a month',
          'The signed installer and update channel',
          'The hosted web dashboard',
          'Support — and this is the expensive part',
          'No member ceiling'
        ],
        excluded: ['You own the uptime', 'Requires Docker and a supported encoder']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        epithet: 'Above 50,000 members',
        monthly: null,
        annual: null,
        rank: 4,
        custom: true,
        cta: 'Talk to us',
        blurb: 'Negotiated bandwidth, data residency, and a conversation rather than an automatic charge.',
        trigger: null,
        egressGB: null,
        egressHuman: 'Negotiated',
        memberCeiling: null,
        highlights: [
          'Everything in Studio',
          'Negotiated bandwidth',
          'Data residency and dedicated-database options',
          'Above 50,000 members'
        ],
        excluded: []
      }
    ],

    /* Free self-hosting exists and should be said out loud. */
    freeSelfHostNote:
      'Self-hosting for free also exists: the installer runs unlicensed with the Free module set and ' +
      'no relay. It is not a crippled demo — it is exactly the Free tier, on your own metal.',

    /* ---------------- MODULE REGISTRY (normative) ----------------
       id / name / minTier / status / metered / pickable
       ⚠ `id` is stable and never renamed — it lands in plan state and billing.
       `pickable` marks the curated subset the picker offers; everything else is
       still listed in the comparison table so nothing is hidden.            */
    registry: [
      { id: 'core',            name: 'Bot core & /menu',                 minTier: 'free',      status: 'shipped', pickable: false },
      { id: 'leveling',        name: 'Leveling & ranks',                 minTier: 'free',      status: 'shipped', pickable: true },
      { id: 'achievements',    name: 'Achievements & name-icons',        minTier: 'free',      status: 'shipped', pickable: false },
      { id: 'moderation',      name: 'Moderation & bans',                minTier: 'free',      status: 'shipped', pickable: true },
      { id: 'admin-console',   name: 'Admin console (162 controls)',     minTier: 'free',      status: 'shipped', pickable: true },
      { id: 'notices',         name: 'Notices, changelog & TTL cleanup', minTier: 'free',      status: 'shipped', pickable: false },
      { id: 'stats-basic',     name: 'Stats — day / week / month',       minTier: 'free',      status: 'shipped', pickable: true },
      { id: 'counting',        name: 'Counting game',                    minTier: 'free',      status: 'shipped', pickable: false },
      { id: 'requests',        name: 'Title requests & “tell me when it lands”', minTier: 'free', status: 'shipped', pickable: false },
      { id: 'profile',         name: 'Member profile & self-service',    minTier: 'free',      status: 'shipped', pickable: false },
      { id: 'level-import',    name: 'Import levels from MEE6 / Arcane', minTier: 'free',      status: 'planned', pickable: false,
        note: 'Free on purpose — it is acquisition, not a feature. It will never be sold.' },
      { id: 'starboard',       name: 'Starboard',                        minTier: 'free',      status: 'planned', pickable: false },
      { id: 'reminders',       name: 'Reminders',                        minTier: 'free',      status: 'planned', pickable: false },
      { id: 'birthdays',       name: 'Birthdays',                        minTier: 'free',      status: 'planned', pickable: false },

      { id: 'economy',         name: 'Economy & idle tycoon',            minTier: 'community', status: 'shipped', pickable: true },
      { id: 'casino',          name: 'Casino — twelve games',            minTier: 'community', status: 'shipped', pickable: true },
      { id: 'stats-history',   name: 'Stats — year & all-time',          minTier: 'community', status: 'shipped', pickable: true,
        note: '“Year” is a rolling twelve months, not a calendar year.' },
      { id: 'wrapped',         name: 'Wrapped / annual recap',           minTier: 'community', status: 'shipped', pickable: true },
      { id: 'challenges',      name: 'Challenges, goals & the roller',   minTier: 'community', status: 'shipped', pickable: true },
      { id: 'blueprints',      name: 'Blueprints — composite ops with rollback', minTier: 'community', status: 'shipped', pickable: true },
      { id: 'backup',          name: 'Scheduled backup & restore',       minTier: 'community', status: 'shipped', pickable: true },
      { id: 'automod',         name: 'Automod rules engine',             minTier: 'community', status: 'partial', pickable: false,
        note: 'We can toggle Discord’s native AutoMod. There is no rules engine of our own.' },
      { id: 'modlog',          name: 'Moderation cases & modlog',        minTier: 'community', status: 'partial', pickable: false,
        note: 'Actions are logged; there is no case file to open.' },
      { id: 'themes',          name: 'Cosmetic hero-card themes',        minTier: 'community', status: 'unwired', pickable: false },
      { id: 'tickets',         name: 'Tickets / modmail',                minTier: 'community', status: 'planned', pickable: false },
      { id: 'giveaways',       name: 'Giveaways',                        minTier: 'community', status: 'planned', pickable: false },
      { id: 'temp-voice',      name: 'Temporary voice channels',         minTier: 'community', status: 'planned', pickable: false },
      { id: 'social-alerts',   name: 'Social alerts (Twitch / YouTube / X)', minTier: 'community', status: 'planned', pickable: false },

      { id: 'screening-room',  name: 'Screening room — films & TV',      minTier: 'pro',       status: 'shipped', pickable: true,  metered: 'egress' },
      { id: 'live-tv',         name: 'Live TV — channels & guide',       minTier: 'pro',       status: 'shipped', pickable: true,  metered: 'egress' },
      { id: 'game-servers',    name: 'Game-server operations',           minTier: 'pro',       status: 'shipped', pickable: true },
      { id: 'world-settings',  name: 'World settings & New World flow',  minTier: 'pro',       status: 'shipped', pickable: false },
      { id: 'api',             name: '/v1 HTTP API',                     minTier: 'pro',       status: 'shipped', pickable: true },
      { id: 'mcp',             name: 'MCP tool surface',                 minTier: 'pro',       status: 'shipped', pickable: true },
      { id: 'bridge',          name: 'Self-host bridge (your hardware)', minTier: 'pro',       status: 'partial', pickable: false,
        note: 'The agent runs in production but dials inward across a LAN. The outbound bridge is not shipped.' },
      { id: 'web-dashboard',   name: 'Web dashboard',                    minTier: 'pro',       status: 'planned', pickable: false },
      { id: 'mobile',          name: 'Mobile app',                       minTier: 'pro',       status: 'planned', pickable: false },
      { id: 'music',           name: 'Music (from your own library)',    minTier: 'pro',       status: 'planned', pickable: false },
      { id: 'ai-companions',   name: 'AI companions',                    minTier: null,        status: 'dark',    pickable: false, metered: 'ai',
        note: 'Not on sale. Usage-based when it ships — never part of a plan.' },

      { id: 'second-screen',   name: 'Second simultaneous screen',       minTier: 'studio',    status: 'shipped', pickable: true,  metered: 'egress' }
    ],

    /* ---------------- METERED USAGE ----------------
       Separate from tiers on purpose. Both default OFF, both opt-in, both
       hard-capped. The failure mode is the feature stopping, never an invoice. */
    metered: [
      {
        id: 'egress',
        name: 'Streaming bandwidth',
        icon: 'wifi',
        onSale: true,
        unit: 'GB delivered',
        unitNote:
          'Billed in bytes delivered, because that is what a CDN invoices. Shown in both GB and ' +
          'viewer-hours at ≈1.67 GB per viewer-hour — but never quoted in viewer-hours alone, ' +
          'because that conversion is a property of our own encoder and we can change it.',
        price: 2.00,
        priceUnit: 'per 100 GB block',
        perGB: 0.02,
        included: 'Pro 250 GB · Studio 1,500 GB · Sovereign 250 GB. Free and Community: none.',
        defaultState: 'OFF',
        optIn: true,
        cap: 'A hard monthly ceiling you set, which we never exceed.',
        failureMode:
          'Overage billing is opt-in per server and defaults to OFF. With it off, the failure mode ' +
          'is “the stream stops”, not “a $400 invoice”. That is not a courtesy — it is the only ' +
          'configuration in which a bug in the meter cannot bankrupt a customer, and the meter is ' +
          'new code metering somebody else’s bandwidth.',
        _provisional: true,
        _source: 'PRICING.md §3. ⚠ The 1.67 GB/viewer-hour conversion is INFERRED from the 200 GB ' +
                 'party figure, not read off the encoder config, and the underlying $0.01/GB CDN ' +
                 'cost is tagged [UNVERIFIED] — no contract signed. Verify before publishing.'
      },
      {
        id: 'ai',
        name: 'AI credit',
        icon: 'bot',
        onSale: false,
        saleNote: 'Not on sale. Roadmap — see below.',
        unit: 'prepaid credit',
        unitNote:
          'Prepaid, never auto-topped-up, and billed on reconciled actual usage rather than on the ' +
          'worst-case reservation that protects you.',
        price: null,
        priceUnit: null,
        included: 'None, in any plan. It is never bundled.',
        defaultState: 'OFF',
        optIn: true,
        cap: 'A monthly ceiling you set when you buy credit. There is no configuration in which spend continues past it.',
        failureMode:
          'A companion sitting in a busy voice channel bills for room-minutes whether or not anybody ' +
          'talks to it. That is exactly the shape that produces an angry invoice, so the console will ' +
          'show cost per hour of occupied voice channel — not cost per turn, which is the number that ' +
          'misleads here.',
        whyNotBundled:
          'One 117-member server measured $35.84 a month in tokens. That is three times the price of ' +
          'the plan it would have sat in, and more than the plan above it. AI cannot be bundled into ' +
          'any tier at any of these prices. That is arithmetic, not positioning.',
        blocker:
          'It is not on sale because the spend ceiling is a single number for the whole process, not ' +
          'one per server — so one server’s chatty evening would switch everyone else’s companions ' +
          'off. That is a correctness bug, and it is fixed before anything is sold, not after.',
        _provisional: true,
        _source: 'PRICING.md §4 and §4.4. ⚠ The $15 vs $25 ceiling conflict is unresolved in the ' +
                 'source, so NO ceiling figure is printed on the site.'
      }
    ],

    /* What actually happens as an allowance runs out. Nothing deletes anything. */
    egressLadder: [
      { at: '80%',                what: 'A notice in the admin channel. Nothing changes.', tone: 'ok' },
      { at: '100%, overage off',  what: 'The picture drops to 720p — about half the bytes. Nothing stops.', tone: 'warn' },
      { at: '100%, overage on',   what: 'Billed per 100 GB block, up to the hard ceiling you set.', tone: 'warn' },
      { at: '150%, overage off',  what: 'New screenings refuse to start. A screening already playing runs to its end.', tone: 'danger' },
      { at: 'Any point',          what: 'Watch history, attendance, resume points, economy and levels: untouched.', tone: 'ok' }
    ],

    /* Bandwidth arithmetic the estimator uses. */
    egressMath: {
      gbPerViewerHour: 1.67,
      mbps: 3.70,
      movieNightViewerHours: 25,
      movieNightGB: 41.7,
      _provisional: true,
      _source: 'PRICING.md §0 — derived from ARCHITECTURE §2’s measured 200 GB party. The bitrate is inferred, not read off the encoder.'
    },

    /* Payment-failure ladder. Nothing is ever deleted to force a payment. */
    lapse: [
      { when: '7 days before', what: 'A notice to the owner. Nothing changes.' },
      { when: 'Payment fails', what: 'Nothing changes. The retry schedule begins.' },
      { when: '+7 days',       what: 'Paid modules go read-only. Balances, levels and stats stay visible; the casino refuses new bets; a screening in flight finishes.' },
      { when: '+30 days',      what: 'The server returns to the Free module set. All data retained.' },
      { when: '+365 days',     what: 'The first point at which deletion is even discussed, and only with explicit owner action.' }
    ],

    founding: {
      _provisional: true,
      name: 'Founding 100',
      blurb: 'The first 100 paying servers get 50% off the subscription for as long as it stays continuously active.',
      terms: [
        'Bound to the server, not the account. Non-transferable.',
        'A lapse of more than 30 days ends it permanently — stated at signup, in the cancellation flow, and in the notice a week before.',
        'Bandwidth overage and AI credit are always at list price. Only the fixed fee is ever discounted.'
      ],
      note: 'The Studio founding price is not settled and is deliberately not shown.'
    },

    faq: [
      {
        q: 'Can I get a surprise bill?',
        a: 'No. Bandwidth overage defaults to off and is opt-in per server; if you turn it on, you set a ' +
           'hard monthly ceiling we never exceed. AI is prepaid credit only and is never auto-topped-up. ' +
           'With overage off, the failure mode is “the stream stops”, not “a $400 invoice”.'
      },
      {
        q: 'What happens when I run out of bandwidth?',
        a: 'Nothing stops. At 80% you get a notice. At 100% the picture drops to 720p and keeps playing. ' +
           'At 150% new screenings refuse to start — but a screening already playing runs to its end, ' +
           'because killing a film eighty minutes in to save 20 GB is the unrecoverable side of the choice.'
      },
      {
        q: 'Is AI included in any plan?',
        a: 'No, and it is not on sale at all yet. When it ships it will be prepaid usage-based credit, ' +
           'never part of a subscription — one busy server measured $35.84 a month in tokens, which is ' +
           'more than the plans it would have sat in. The blocker today is that the spend ceiling is one ' +
           'number for the whole process rather than one per server, and that gets fixed before anything ' +
           'is sold.'
      },
      {
        q: 'Can members buy currency or XP?',
        a: 'No, at any price, on any plan. A plan may grant access to the casino module. It may never ' +
           'grant currency, alter a balance, change odds or multiply a payout. The two largest ' +
           'competitors sell both; we consider that the difference.'
      },
      {
        q: 'What happens to my data if I downgrade or stop paying?',
        a: 'Nothing is deleted. Paid modules go read-only after a week, and the server returns to the Free ' +
           'module set after a month — balances are not zeroed, levels are not reset, and the stats ' +
           'collector keeps writing history the tier cannot yet read, so upgrading reveals all of it ' +
           'instantly. The data is yours; it is the access that lapsed.'
      },
      {
        q: 'My server got big. Will you switch it off?',
        a: 'No. A member ceiling must never be a kill switch. If you pass a band we tell you and invite ' +
           'you to the next plan. Turning off a 12,000-member community’s economy because it recruited ' +
           'well is how you generate a public incident.'
      },
      {
        q: 'Why does self-hosting cost more than Pro?',
        a: 'Because the compute you replace is worth about eight cents a month, and what you are actually ' +
           'buying is the hosted relay, a licence to every paid module, the signed installer and update ' +
           'channel, the hosted dashboard, and support. Support is the expensive part. Self-hosting for ' +
           'free also exists — the installer runs unlicensed with the Free module set and no relay.'
      },
      {
        q: 'Will my price go up?',
        a: 'Your rate is locked for as long as the subscription stays continuous, and if a module moves to ' +
           'a higher plan you keep it. Bandwidth allowances track a cost we do not control and can be ' +
           're-priced with 60 days’ notice. We never take a working feature away from a paying customer ' +
           'to force an upgrade.'
      },
      {
        q: 'Can I bring my levels over from MEE6 or Arcane?',
        a: 'Not yet — it is not built. When it is, it will be free forever, because charging for the ' +
           'privilege of becoming a customer is absurd. Be warned that MEE6 data is importable but Arcane ' +
           'has no public API and no export, so an Arcane migration can only read the roles it assigned.'
      },
      {
        q: 'Is this pricing final?',
        a: 'No, and this page says so rather than hiding it. The source document is marked “proposal, not ' +
           'committed”, the bandwidth cost it is built on has no signed contract behind it, and the ladder ' +
           'is already being revised downward.'
      }
    ]
  };

  /* ---------------------------------------------------------------------- */
  /*  DERIVED METADATA — computed in ONE place so index, features and        */
  /*  pricing can never disagree about what a module's badge says.           */
  /* ---------------------------------------------------------------------- */

  var STATUS_BADGE = {
    shipped: { label: 'Available now',       tone: 'success', note: 'Built, shipped, and running in production today.' },
    partial: { label: 'Partly built',        tone: 'warn',    note: 'Some of it exists. The caveat says which part.' },
    dark:    { label: 'Built · switched off',tone: 'warn',    note: 'The code is merged and in production. It ships disabled behind an owner toggle.' },
    unwired: { label: 'Built · not wired up',tone: 'plain',   note: 'The code exists and is deliberately not connected.' },
    planned: { label: 'Planned · not built', tone: 'plain',   note: 'Designed and scheduled. There is no code. Do not buy Asbern for this.' }
  };

  function tierById(id) {
    for (var i = 0; i < pricing.tiers.length; i++) if (pricing.tiers[i].id === id) return pricing.tiers[i];
    return null;
  }

  /* A module may be SOLD only if it is shipped (or usefully partial) and has a
     tier. Anything metered-and-not-on-sale, planned, dark or unwired is not.
     PRICING.md §7: a planned or dark row must never render as if it shipped. */
  function decorate(m) {
    var meteredEntry = m.metered ? meteredById(m.metered) : null;
    var meteredBlocked = !!(meteredEntry && meteredEntry.onSale === false);

    m.sellable = !meteredBlocked &&
                 !!m.minTier &&
                 (m.status === 'shipped' || m.status === 'partial');

    m.badge = meteredBlocked
      ? { label: 'Usage-based · not on sale yet', tone: 'warn',
          note: 'Built, switched off, and deliberately not for sale. When it ships it is metered usage, never a plan feature.' }
      : STATUS_BADGE[m.status] || STATUS_BADGE.planned;

    var t = m.minTier ? tierById(m.minTier) : null;
    m.tierBadge = meteredBlocked
      ? { label: 'Metered', tone: 'frost' }
      : t
        ? { label: t.monthly === 0 ? 'Free' : t.name, tone: t.monthly === 0 ? 'success' : 'accent' }
        : null;
    return m;
  }

  function meteredById(id) {
    for (var i = 0; i < pricing.metered.length; i++) if (pricing.metered[i].id === id) return pricing.metered[i];
    return null;
  }

  modules.forEach(decorate);
  pricing.registry.forEach(decorate);

  /* ---------------------------------------------------------------------- */
  /*  SCREENING ROOM — mock state for the player UI                          */
  /* ---------------------------------------------------------------------- */

  var screening = {
    nowPlaying: {
      kind: 'film',
      title: 'The Northman',
      year: 2022,
      runtimeMin: 137,
      elapsedSec: 3142,
      quality: '1080p · H.264 · NVENC',
      summary: 'Playing from the host’s own library — nothing here was fetched from anywhere.',
      screen: 1,
      startedBy: 'Hallr'
    },
    queueNote: 'Each screen plays one thing at a time. There is deliberately no queue.',
    library: [
      { id: 'northman', kind: 'film', title: 'The Northman',     year: 2022, runtime: '2h 17m' },
      { id: 'valhalla', kind: 'film', title: 'Valhalla Rising',  year: 2009, runtime: '1h 33m' },
      { id: 'seventh',  kind: 'film', title: 'The Seventh Seal', year: 1957, runtime: '1h 36m' },
      { id: 'wind',     kind: 'film', title: 'The Wind Rises',   year: 2013, runtime: '2h 06m' },
      { id: 'saga',     kind: 'tv',   title: 'Saga of the Coast',year: 2021, runtime: 'S2 · 8 eps' },
      { id: 'ember',    kind: 'tv',   title: 'Ember & Ash',      year: 2024, runtime: 'S1 · 6 eps' }
    ],
    channels: [
      { id: 'ch-1', name: 'Nordic Sport 1',    group: 'Sports',        now: 'Elite Series — Bodø / Rosenborg', ends: '21:45' },
      { id: 'ch-2', name: 'Continental News',  group: 'News',          now: 'The Evening Brief',               ends: '20:30' },
      { id: 'ch-3', name: 'Reel Classics',     group: 'Entertainment', now: 'Double bill — noir night',        ends: '23:10' },
      { id: 'ch-4', name: 'Documentary North', group: 'Documentary',   now: 'Ice Roads, ep. 4',                ends: '21:00' },
      { id: 'ch-5', name: 'Late Comedy',       group: 'Entertainment', now: 'Stand-up hour',                   ends: '22:00' }
    ],
    viewers: [
      { name: 'Hallr',  initials: 'HA', joinedMin: 52, host: true },
      { name: 'Sigrún', initials: 'SI', joinedMin: 49 },
      { name: 'Bekan',  initials: 'BE', joinedMin: 44 },
      { name: 'Thora',  initials: 'TH', joinedMin: 31 },
      { name: 'Gunnar', initials: 'GU', joinedMin: 12 },
      { name: 'Ylva',   initials: 'YL', joinedMin: 6 }
    ],
    /* Measured constraints, not marketing — ARCHITECTURE.md §3. */
    encoders: [
      { host: 'Windows', encoder: 'NVIDIA NVENC (GTX 1050 or newer)', verdict: 'ok',
        note: 'The supported path. One 1080p stream costs almost nothing on the CPU.' },
      { host: 'Windows', encoder: 'Intel QuickSync', verdict: 'no',
        note: 'Does not work inside Docker on Windows or WSL2. Measured — it is what cancelled an entire migration plan.' },
      { host: 'Linux',   encoder: 'QuickSync (/dev/dri) or NVENC', verdict: 'ok',
        note: 'Both work with device passthrough.' },
      { host: 'Any',     encoder: 'No hardware encoder', verdict: 'warn',
        note: 'Software transcode: roughly 4–6 CPU cores per concurrent stream. It works. It is not comfortable.' }
    ],
    bandwidth: {
      viewers: 20, perViewerMbps: 5, directUpMbps: 100, relayUpMbps: 8,
      partyHours: 6, partyGB: 200,
      _source: 'ARCHITECTURE.md §2 and §3'
    },
    specs: [
      { use: 'Connector only',          cpu: '1 core',            ram: '512 MB',   up: '1 Mbps',  note: 'A Raspberry Pi 4 is enough' },
      { use: 'Media, direct play',      cpu: '2 cores',           ram: '4 GB',     up: '10 Mbps', note: 'No transcode' },
      { use: 'Media, 1080p transcode',  cpu: '4 cores + encoder', ram: '8 GB',     up: '15 Mbps', note: 'See the encoder table' },
      { use: 'Game servers too',        cpu: '4–8 cores',         ram: '16–32 GB', up: '10 Mbps', note: 'Modded Minecraft wants 6–12 GB per server' },
      { use: 'Everything at once',      cpu: '8 cores + GPU',     ram: '32 GB',    up: '25 Mbps', note: 'A capable desktop' }
    ]
  };

  /* ---------------------------------------------------------------------- */
  /*  SOCIAL PROOF — ⚠ ALL PLACEHOLDER, and the UI must say so.              */
  /* ---------------------------------------------------------------------- */

  var socialProof = {
    _placeholder: true,
    _source: 'No customers exist. Asbern runs one server. These are not quotes and must never render as quotes.',
    note: 'Asbern has run one community for years and has no outside customers yet. These slots are empty on purpose.',

    /* The counter band this category always puts near the top of a landing page.
       ⚠ EVERY `placeholder: true` ROW MUST RENDER AS EMPTY, NOT AS A NUMBER.
       There is one server, no public installs, and no uptime history to quote.
       Fill `value` in only when the figure is real and `placeholder` is removed. */
    counters: [
      { id: 'servers',  label: 'Servers',           value: null, placeholder: true,
        note: 'No public installs yet' },
      { id: 'members',  label: 'Members reached',   value: null, placeholder: true,
        note: 'One community, not published' },
      { id: 'uptime',   label: 'Uptime, 90 days',   value: null, placeholder: true,
        note: 'No status page yet' }
    ],
    countersNote:
      'Every server-count, member-count and uptime figure on this page is deliberately blank. Asbern has ' +
      'run one community for years and has no outside customers — so there is no number here that would ' +
      'be true, and we would rather show nothing than something flattering.',

    slots: [
      { role: 'Server owner, gaming community', size: '~2,000 members' },
      { role: 'Server owner, film club',        size: '~300 members' },
      { role: 'Moderator, study server',        size: '~5,000 members' }
    ],
    logos: ['Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder']
  };

  /* ---------------------------------------------------------------------- */
  /*  DEPLOYMENT — cloud vs self-host                                        */
  /* ---------------------------------------------------------------------- */

  var deployment = {
    rule:
      'Anything that is your data, or needs your hardware, stays with you. Anything that needs a public ' +
      'endpoint, a certificate or bandwidth is what we run.',
    split: [
      { component: 'The bot',            self: 'optional',       cloud: 'default' },
      { component: 'Media library',      self: 'yours only',     cloud: 'never ours to hold' },
      { component: 'Transcode engine',   self: 'yours only',     cloud: 'must sit next to the files' },
      { component: 'Streaming relay',    self: 'possible',       cloud: 'the piece we sell' },
      { component: 'Game servers',       self: 'yours',          cloud: 'partner hosts' },
      { component: 'Web dashboard',      self: '—',              cloud: 'ours only' },
      { component: 'AI',                 self: 'local models',   cloud: 'metered, when it ships' }
    ],
    onboarding: [
      { step: 'Add to Discord',         body: 'OAuth, pick a plan, the bot joins. Cloud modules work immediately.' },
      { step: 'Run the wizard',         body: 'Per-server setup names your channels, roles and categories. No JSON, ever.' },
      { step: 'Connect your hardware',  body: 'Optional. The dashboard shows a one-time pairing code.' },
      { step: 'The bridge dials out',   body: 'The agent opens an outbound connection. No port forwarding, no inbound firewall rule, no public endpoint on your network.' },
      { step: 'Modules light up',       body: 'Media and game servers configure themselves from what the agent actually reported — not from what you told us you had.' }
    ]
  };

  /* ---------------------------------------------------------------------- */
  /*  SITE INFORMATION ARCHITECTURE                                          */
  /* ---------------------------------------------------------------------- */

  var nav = {
    primary: [
      { label: 'Screening Room', href: 'screening.html' },
      { label: 'Modules',        href: 'features.html' },
      { label: 'Pricing',        href: 'pricing.html' }
    ],
    /* The category's universal primary action. Repeated in the nav and at the
       foot of every page. `href` becomes the OAuth install URL. */
    cta:          { label: 'Add to Discord', href: 'pricing.html' },
    ctaSecondary: { label: 'View dashboard demo', href: '#', soon: true },
    footer: [
      { title: 'Product', links: [
        { label: 'Screening Room', href: 'screening.html' },
        { label: 'All modules',    href: 'features.html' },
        { label: 'Pricing',        href: 'pricing.html' },
        { label: 'Self-hosting',   href: 'features.html#deployment' },
        { label: 'Changelog',      href: '#', soon: true }
      ]},
      { title: 'Developers', links: [
        { label: 'Documentation',  href: '#', soon: true },
        { label: 'HTTP API',       href: '#', soon: true },
        { label: 'Bridge agent',   href: 'screening.html#bridge' },
        { label: 'Status',         href: '#', soon: true }
      ]},
      { title: 'Company', links: [
        { label: 'Support server', href: '#', soon: true },
        { label: 'About',          href: '#', soon: true },
        { label: 'Contact',        href: '#', soon: true },
        { label: 'Roadmap',        href: 'features.html#roadmap' }
      ]},
      { title: 'Legal', links: [
        { label: 'Privacy policy',     href: '#', soon: true },
        { label: 'Terms of service',   href: '#', soon: true },
        { label: 'Data & retention',   href: '#', soon: true },
        { label: 'Licences',           href: '#', soon: true }
      ]}
    ]
  };

  /* ---------------------------------------------------------------------- */
  /*  SHARED FIXTURES for the dashboard / member-app agents who come next.   */
  /*  Not used by the marketing pages — here so there is ONE mock world.     */
  /* ---------------------------------------------------------------------- */

  var app = {
    guild: {
      id: '000000000000000000', name: 'Hearthstead', members: 1284, online: 213,
      boostTier: 2, plan: 'pro',
      bridge: { status: 'online', host: 'ASGARD-PC', encoder: 'NVENC', uptimeHours: 412 },
      egress: { usedGB: 186, allowanceGB: 250, overageEnabled: false }
    },
    me: {
      name: 'Sigrún', initials: 'SI', level: 47, rank: 'Captain', prestige: 2,
      xp: 18420, xpToNext: 24000, balance: 1284500, netWorth: 4106200,
      watchMinutes: 6412, achievements: 11
    },
    leaderboard: [
      { rank: 1, name: 'Hallr',  initials: 'HA', level: 88, messages: 41204, voiceHours: 612, net: 91400000 },
      { rank: 2, name: 'Sigrún', initials: 'SI', level: 47, messages: 22918, voiceHours: 388, net: 4106200 },
      { rank: 3, name: 'Bekan',  initials: 'BE', level: 44, messages: 19002, voiceHours: 401, net: 3880100 },
      { rank: 4, name: 'Thora',  initials: 'TH', level: 39, messages: 15771, voiceHours: 296, net: 2140000 },
      { rank: 5, name: 'Gunnar', initials: 'GU', level: 31, messages: 9882,  voiceHours: 512, net: 1902450 },
      { rank: 6, name: 'Ylva',   initials: 'YL', level: 28, messages: 8140,  voiceHours: 122, net: 940300 }
    ],
    ledger: [
      { at: '19:42', kind: 'Watch payout', detail: 'The Northman — 52 min on stream', amount: 5200 },
      { at: '19:05', kind: 'Blackjack',    detail: 'Split, both hands won',           amount: 24000 },
      { at: '18:31', kind: 'Tycoon',       detail: 'Idle income, 4 assets',           amount: 8600 },
      { at: '17:58', kind: 'Crash',        detail: 'Cashed out at 1.42×',             amount: -18000 },
      { at: '09:00', kind: 'Daily',        detail: 'Streak, day 14',                  amount: 14000 }
    ],
    servers: [
      { name: 'Millénaire', game: 'Minecraft 1.21.1', status: 'running',  players: 3, max: 12, idleIn: '1h 42m' },
      { name: 'Enshrouded', game: 'Enshrouded',       status: 'stopped',  players: 0, max: 16, idleIn: null },
      { name: 'Seven Days', game: '7 Days to Die',    status: 'starting', players: 0, max: 8,  idleIn: null }
    ],
    adminTabs: ['Overview', 'Members', 'Channels', 'Roles', 'Guild', 'Bot',
                'Data', 'Settings', 'Blueprints', 'Media', 'Servers']
  };

  /* ---------------------------------------------------------------------- */
  /*  HELPERS                                                                */
  /* ---------------------------------------------------------------------- */

  function moduleById(id) {
    for (var i = 0; i < modules.length; i++) if (modules[i].id === id) return modules[i];
    return null;
  }

  function registryById(id) {
    for (var i = 0; i < pricing.registry.length; i++) if (pricing.registry[i].id === id) return pricing.registry[i];
    return null;
  }

  /** Monthly-equivalent price for a tier at a given period. null = "custom". */
  function tierPrice(tier, period) {
    if (tier.custom) return null;
    if (!tier.monthly) return 0;
    return period === 'annual' ? tier.annual / 12 : tier.monthly;
  }

  /** Billed amount for a period — what actually leaves the account. */
  function tierBilled(tier, period) {
    if (tier.custom) return null;
    return period === 'annual' ? tier.annual : tier.monthly;
  }

  /**
   * The cheapest tier that covers every selected registry id.
   * Tiers are cumulative, so this is simply the highest `rank` required.
   * Sovereign is excluded — it is a deployment choice, not a rung.
   */
  function requiredTier(selectedIds) {
    var need = 0;
    for (var i = 0; i < selectedIds.length; i++) {
      var row = registryById(selectedIds[i]);
      if (!row || !row.minTier) continue;
      var t = tierById(row.minTier);
      if (t && t.rank > need) need = t.rank;
    }
    for (var j = 0; j < pricing.tiers.length; j++) {
      var c = pricing.tiers[j];
      if (c.selfHost || c.custom) continue;
      if (c.rank === need) return c;
    }
    return tierById('free');
  }

  /** Bandwidth arithmetic for the estimator. */
  function egressEstimate(viewers, hours, allowanceGB) {
    var m = pricing.egressMath;
    var viewerHours = viewers * hours;
    var gb = viewerHours * m.gbPerViewerHour;
    var overGB = Math.max(0, gb - allowanceGB);
    var blocks = Math.ceil(overGB / 100);
    var egress = meteredById('egress');
    return {
      viewerHours: viewerHours,
      gb: gb,
      allowanceGB: allowanceGB,
      overGB: overGB,
      blocks: blocks,
      cost: blocks * egress.price,
      pctUsed: allowanceGB ? (gb / allowanceGB) * 100 : (gb > 0 ? Infinity : 0)
    };
  }

  var AsbernMock = {
    brand: brand,
    facts: facts,
    modules: modules,
    notBuilt: notBuilt,
    pricing: pricing,
    screening: screening,
    socialProof: socialProof,
    deployment: deployment,
    nav: nav,
    app: app,
    moduleById: moduleById,
    registryById: registryById,
    tierById: tierById,
    meteredById: meteredById,
    tierPrice: tierPrice,
    tierBilled: tierBilled,
    requiredTier: requiredTier,
    egressEstimate: egressEstimate
  };

  root.AsbernMock = AsbernMock;
  root.AM = AsbernMock;
})(typeof window !== 'undefined' ? window : this);
