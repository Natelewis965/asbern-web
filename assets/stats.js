/* eslint-disable */
/**
 * assets/stats.js — the Analytics surface.
 *
 * ⚠ CLASSIC SCRIPT, ES5 FLAVOUR, NO MODULES. Pages here are opened from
 * `file://`, which blocks `import`/`export` outright. One IIFE, one global.
 * Same rule as mock-data.js and app.js; see packages/web/README.md.
 *
 * ⚠ NO NETWORK, EVER. There is no backend and no CDN — not a chart library, not
 * a font, not an icon sprite. Every mark below is an SVG string this file
 * builds. A stats page that fetches a chart library is a stats page a CDN can
 * take over, and it is also a stats page that leaks which guild is being looked
 * at to whoever serves the script.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE IS
 * ---------------------------------------------------------------------------
 *
 * Three layers, deliberately separated:
 *
 *   1. A deterministic DEMO STORE in the exact shape of the real one
 *      (`data/stats/<YYYY-MM>.json` — `days` / `hod` / `uhod` / `chan` /
 *      `guild`). Every number on this page is invented and marked
 *      `_placeholder: true`, per mock-data.js's rules.
 *
 *   2. AGGREGATIONS that mirror `packages/core/src/statsQuery.js` — the same
 *      windows, the same local-midnight boundaries, the same bot exclusion, the
 *      same rolling-not-calendar `year`. They run over the demo store here and
 *      would run over the API's response unchanged. This is on purpose: a
 *      preview that computes its numbers a different way from the product is a
 *      preview that lies, and the drift is invisible until someone compares two
 *      screens.
 *
 *   3. SVG CHART BUILDERS. Functions returning HTML strings, coloured from
 *      `var(--as-*)` tokens so both themes work with no second palette, and
 *      every one carries `role="img"` + an aria-label stating the numbers.
 *
 * ---------------------------------------------------------------------------
 * ⚠ THE COLOUR RULES, WHICH WERE MEASURED RATHER THAN CHOSEN
 * ---------------------------------------------------------------------------
 *
 * CATEGORICAL IS CAPPED AT TWO SERIES: `--as-accent` (brass) and `--as-frost`
 * (cold blue). Run through a CVD validator against the real surfaces, that pair
 * separates by ΔE 15.0 (dark) / 14.7 (light) under protanopia and 17.0 / 17.7
 * for normal vision. Adding the system's danger red as a third collapses it to
 * ΔE 5.8 against the brass under deuteranopia — two of the three series become
 * the same colour for ~8% of men. So a third series is NEVER a third hue: it is
 * neutral ink plus a dashed stroke plus a direct label, which is what charts.js
 * already does on the Discord side for "Previous".
 *
 * SEQUENTIAL (the heatmap) IS ONE HUE AT STEPPED OPACITY, never a rainbow — a
 * rainbow invents category boundaries in data that has none. The floor is
 * `HEAT_FLOOR`, not zero, so "quiet" and "never" cannot render identically.
 *
 * DIVERGING (joins vs leaves) uses the reserved status pair either side of a
 * neutral zero line, and both sides are directly labelled — status colour is
 * never the only thing carrying the meaning.
 */
(function (root) {
  'use strict';

  var DAY_MS = 86400000;
  var HOUR_MS = 3600000;

  // ---------------------------------------------------------------------------
  // Local-midnight helpers. ⚠ NEVER `Math.floor(t / DAY_MS) * DAY_MS` — that
  // snaps to UTC midnight, and every bucket label would then name a different
  // day from the data inside it. This is the single most expensive bug the
  // server-side stats layer ever shipped; it is not repeated here.
  // ---------------------------------------------------------------------------
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function monthKey(t) { var d = new Date(t); return d.getFullYear() + '-' + pad2(d.getMonth() + 1); }
  function dayStart(t) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function monthStart(t) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); }
  function addMonths(t, n) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth() + n, 1).getTime(); }
  function keyToMs(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getTime(); }

  var MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hourLabel(h) { return h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p'; }
  function hourName(h) { return h == null ? '—' : h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : (h - 12) + 'pm'; }
  function dayLabel(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); }
  function monthLabel(t, withYear) { var d = new Date(t); return withYear ? MONTH_ABBR[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2) : MONTH_ABBR[d.getMonth()]; }
  function round1(n) { return Math.round(n * 10) / 10; }

  // ---------------------------------------------------------------------------
  // THE DEMO WORLD. Names match AsbernMock.app so this page and leaderboards.html
  // describe one guild rather than two.
  // ---------------------------------------------------------------------------
  var ME = 'u-sigrun';
  var MEMBERS = [
    { id: 'u-hallr', name: 'Hallr', initials: 'HA', weight: 1.00, night: 0.65 },
    { id: 'u-sigrun', name: 'Sigrún', initials: 'SI', weight: 0.62, night: 0.30 },
    { id: 'u-bekan', name: 'Bekan', initials: 'BE', weight: 0.55, night: 0.80 },
    { id: 'u-thora', name: 'Thora', initials: 'TH', weight: 0.47, night: 0.20 },
    { id: 'u-gunnar', name: 'Gunnar', initials: 'GU', weight: 0.38, night: 0.55 },
    { id: 'u-ylva', name: 'Ylva', initials: 'YL', weight: 0.29, night: 0.45 },
    { id: 'u-ketil', name: 'Ketil', initials: 'KE', weight: 0.18, night: 0.35 },
    { id: 'u-astrid', name: 'Astrid', initials: 'AS', weight: 0.11, night: 0.70 },
    // ⚠ A BOT IS IN THE FIXTURE ON PURPOSE. 48.6% of this guild's real all-time
    // message board once belonged to bots, ranking #1 and #2, because the
    // importer's filter only covered one of its two write paths. A demo without
    // one cannot show that the filter works.
    { id: 'b-companion', name: 'The Companion', initials: 'TC', weight: 2.40, night: 0.50, bot: true }
  ];
  var CHANNELS = [
    { id: 'c-general', name: '# general', voice: false, share: 0.42 },
    { id: 'c-introductions', name: '# introductions', voice: false, share: 0.06 },
    { id: 'c-gaming', name: '# gaming', voice: false, share: 0.24 },
    { id: 'c-screening', name: '# screening-room', voice: false, share: 0.14 },
    { id: 'c-lounge', name: '🔊 The Lounge', voice: true, share: 0.14 }
  ];
  var ROLES = [
    { id: 'r-everyone', name: '@everyone', members: ['u-hallr', 'u-sigrun', 'u-bekan', 'u-thora', 'u-gunnar', 'u-ylva', 'u-ketil', 'u-astrid'] },
    { id: 'r-regulars', name: 'Regulars', members: ['u-hallr', 'u-sigrun', 'u-bekan', 'u-thora'] },
    { id: 'r-boosters', name: 'Boosters', members: ['u-sigrun', 'u-gunnar'] },
    { id: 'r-mods', name: 'Moderators', members: ['u-hallr', 'u-thora'] }
  ];
  var BOT_IDS = {}; MEMBERS.forEach(function (m) { if (m.bot) BOT_IDS[m.id] = true; });
  var MEMBER_BY_ID = {}; MEMBERS.forEach(function (m) { MEMBER_BY_ID[m.id] = m; });

  // Deterministic PRNG — the page must render the same numbers on every load, or
  // a screenshot and the page it came from disagree.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The shape of a day: a diurnal curve with an evening peak, scaled by a
  // weekend lift. Invented, but invented to LOOK like the real thing so the
  // charts exercise the same label-collision and scaling cases real data will.
  var DIURNAL = [0.10, 0.05, 0.03, 0.02, 0.02, 0.03, 0.07, 0.18, 0.30, 0.42, 0.46, 0.48,
    0.52, 0.50, 0.48, 0.52, 0.62, 0.78, 0.95, 1.00, 0.96, 0.82, 0.58, 0.30];

  var STORE = null;
  var HORIZON_DAYS = 400;

  /**
   * Distribute an integer total across weights so the parts sum EXACTLY to it
   * (largest-remainder apportionment).
   *
   * ⚠ THIS IS NOT COSMETIC. The first version of this fixture split the day
   * across hours with `Math.round(total * w / k)` and dumped whatever was left
   * into hour 23, and split messages across channels with the last channel
   * taking `max(0, total - accumulated)`. Both produced a store whose parts did
   * not add up to its whole: the channel columns over-counted the server total
   * by 3, and hour 23 was the busiest hour of every single day — an artefact of
   * the remainder, not of anybody's habits.
   *
   * A fixture that does not reconcile makes every cross-check meaningless,
   * because a failing "channels sum to the server total" assertion can no longer
   * distinguish an aggregation bug from a fixture bug. The whole value of the
   * demo store is that it is internally exact.
   */
  function splitInt(total, weights) {
    var i, out = [], sum = 0;
    for (i = 0; i < weights.length; i++) sum += weights[i];
    if (!(sum > 0) || !total) { for (i = 0; i < weights.length; i++) out.push(0); return out; }
    var rem = [], acc = 0;
    for (i = 0; i < weights.length; i++) {
      var exact = total * weights[i] / sum;
      var fl = Math.floor(exact);
      out.push(fl); acc += fl; rem.push({ i: i, r: exact - fl });
    }
    rem.sort(function (a, b) { return b.r - a.r; });
    var left = total - acc;
    for (i = 0; i < left; i++) out[rem[i % rem.length].i] += 1;
    return out;
  }

  function buildStore(now) {
    var store = { days: {}, hod: {}, uhod: {}, chan: {}, guild: {}, _placeholder: true };
    var today = dayStart(now);
    for (var d = HORIZON_DAYS - 1; d >= 0; d--) {
      var t = dayStart(today - d * DAY_MS);
      var dk = dayKey(t);
      var wd = new Date(t).getDay();
      var weekend = (wd === 0 || wd === 5 || wd === 6) ? 1.35 : 1.0;
      // A slow upward trend, so growth and period-comparison have something true
      // to show rather than noise around a flat line.
      var trend = 0.55 + 0.45 * ((HORIZON_DAYS - d) / HORIZON_DAYS);
      var rnd = mulberry32(keyToMs(dk) / DAY_MS | 0);
      store.days[dk] = {};
      store.hod[dk] = {};
      store.chan[dk] = {};
      for (var mi = 0; mi < MEMBERS.length; mi++) {
        var mem = MEMBERS[mi];
        var base = mem.weight * weekend * trend * (0.6 + 0.8 * rnd());
        if (rnd() < 0.12) base = 0;                      // everyone has quiet days
        var msgs = Math.round(base * 34);
        var voice = Math.round(base * 46 * (mem.bot ? 0 : 1));
        var present = voice ? voice + Math.round(voice * (0.15 + 0.3 * rnd())) : 0;
        if (!msgs && !voice) continue;
        store.days[dk][mem.id] = { m: msgs, v: voice, p: present };

        // Spread the day across hours on the diurnal curve, shifted by how much
        // of a night owl this member is. ⚠ Bots never appear in the HOUR
        // profile, for the same reason the real collector never records one:
        // nothing that writes an hour bucket can be a bot, because the message
        // and voice handlers filter `author.bot` before they count.
        if (!mem.bot) {
          var shift = Math.round((mem.night - 0.5) * 6);
          var hw = [];
          for (var hi = 0; hi < 24; hi++) hw.push(DIURNAL[((hi - shift) % 24 + 24) % 24]);
          var hMsg = splitInt(msgs, hw), hVoice = splitInt(voice, hw), hPres = splitInt(present, hw);
          for (var h = 0; h < 24; h++) {
            if (!hMsg[h] && !hVoice[h] && !hPres[h]) continue;
            var g = store.hod[dk][h] || (store.hod[dk][h] = { m: 0, v: 0, p: 0 });
            g.m += hMsg[h]; g.v += hVoice[h]; g.p += hPres[h];
            var u = store.uhod[mem.id] || (store.uhod[mem.id] = {});
            var uc = u[h] || (u[h] = { m: 0, v: 0, p: 0 });
            uc.m += hMsg[h]; uc.v += hVoice[h]; uc.p += hPres[h];
          }
        }

        // Per-channel split — exact, so the channel columns reconcile with the
        // server total rather than drifting a few counts either side of it.
        var ch = store.chan[dk][mem.id] = {};
        var cw = CHANNELS.map(function (c) { return c.share * (0.7 + 0.6 * rnd()); });
        var cMsg = splitInt(msgs, cw);
        for (var ci = 0; ci < CHANNELS.length; ci++) {
          var cv = CHANNELS[ci].voice ? voice : 0;
          if (!cMsg[ci] && !cv) continue;
          ch[CHANNELS[ci].id] = { m: cMsg[ci], v: cv };
        }
      }
      // Arrivals and departures.
      var j = rnd() < 0.55 ? Math.round(rnd() * 3) : 0;
      var l = rnd() < 0.35 ? Math.round(rnd() * 2) : 0;
      if (j || l) store.guild[dk] = { join: j, leave: l };
    }
    return store;
  }

  function store() {
    if (!STORE) STORE = buildStore(Date.now());
    return STORE;
  }

  // ---------------------------------------------------------------------------
  // WINDOWS — the same five presets the bot offers, plus a custom range.
  //
  // ⚠ `year` IS A ROLLING 12 MONTHS, NOT A CALENDAR YEAR, and the label says so.
  // The server-side layer has always meant "the last 12 months ending with this
  // one"; a page that labelled the same numbers "2026" would be wrong for eleven
  // months out of twelve and right by accident in December.
  // ---------------------------------------------------------------------------
  var WINDOWS = [
    { key: 'day', short: 'Day', label: 'Last 24 hours' },
    { key: 'week', short: 'Week', label: 'Last 7 days' },
    { key: 'month', short: 'Month', label: 'Last 30 days' },
    { key: 'year', short: 'Year', label: 'Last 12 months' },
    { key: 'all', short: 'All time', label: 'All time' }
  ];

  function spec(window, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    if (opts.from != null || opts.to != null || window === 'custom') return customSpec(opts.from, opts.to, now);
    var buckets = [], i, t;
    if (window === 'day') {
      var d = new Date(now);
      var cur = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime();
      for (i = 23; i >= 0; i--) { t = cur - i * HOUR_MS; buckets.push({ start: t, end: t + HOUR_MS, label: hourLabel(new Date(t).getHours()) }); }
      return { key: 'day', unit: 'hour', label: 'Last 24 hours', buckets: buckets, start: buckets[0].start, end: buckets[23].end };
    }
    if (window === 'week' || window === 'month') {
      var n = window === 'week' ? 7 : 30;
      var last = dayStart(now);
      var list = [last];
      for (i = 1; i < n; i++) list.unshift(dayStart(list[0] - 1));
      list.forEach(function (x) { buckets.push({ start: x, end: dayStart(x + 26 * HOUR_MS), label: dayLabel(x) }); });
      return { key: window, unit: 'day', label: window === 'week' ? 'Last 7 days' : 'Last 30 days', buckets: buckets, start: buckets[0].start, end: buckets[n - 1].end };
    }
    if (window === 'year') {
      var first = addMonths(monthStart(now), -11);
      var spans = new Date(first).getFullYear() !== new Date(now).getFullYear();
      for (i = 0; i < 12; i++) { t = addMonths(first, i); buckets.push({ start: t, end: addMonths(t, 1), label: monthLabel(t, spans) }); }
      return { key: 'year', unit: 'month', label: 'Last 12 months', buckets: buckets, start: buckets[0].start, end: buckets[11].end };
    }
    var oldest = monthStart(dayStart(now) - (HORIZON_DAYS - 1) * DAY_MS);
    var newest = monthStart(now);
    var spansY = new Date(oldest).getFullYear() !== new Date(newest).getFullYear();
    for (t = oldest; t <= newest; t = addMonths(t, 1)) buckets.push({ start: t, end: addMonths(t, 1), label: monthLabel(t, spansY) });
    return { key: 'all', unit: 'month', label: 'All time', buckets: buckets, start: buckets[0].start, end: buckets[buckets.length - 1].end };
  }

  function customSpec(from, to, now) {
    if (from == null) from = dayStart(now) - 6 * DAY_MS;
    if (to == null) to = now;
    if (to < from) { var s = from; from = to; to = s; }
    var buckets = [], t;
    var days = Math.round((dayStart(to) - dayStart(from)) / DAY_MS) + 1;
    var fmt = function (x) { var d = new Date(x); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
    if (days <= 120) {
      for (t = dayStart(from); t <= dayStart(to); t = dayStart(t + 26 * HOUR_MS)) buckets.push({ start: t, end: dayStart(t + 26 * HOUR_MS), label: dayLabel(t) });
      return { key: 'custom', unit: 'day', label: fmt(from) + ' → ' + fmt(to), buckets: buckets, start: buckets[0].start, end: buckets[buckets.length - 1].end };
    }
    var spansY = new Date(from).getFullYear() !== new Date(to).getFullYear();
    for (t = monthStart(from); t <= monthStart(to); t = addMonths(t, 1)) buckets.push({ start: t, end: addMonths(t, 1), label: monthLabel(t, spansY) });
    return { key: 'custom', unit: 'month', label: fmt(from) + ' → ' + fmt(to), buckets: buckets, start: buckets[0].start, end: buckets[buckets.length - 1].end };
  }

  function bucketIndex(buckets, t) {
    if (!buckets.length || t < buckets[0].start || t >= buckets[buckets.length - 1].end) return -1;
    var lo = 0, hi = buckets.length - 1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (t < buckets[mid].start) hi = mid - 1;
      else if (t >= buckets[mid].end) lo = mid + 1;
      else return mid;
    }
    return -1;
  }

  // Walk the day cells a spec covers. `includeBots` defaults FALSE everywhere,
  // which is the product's rule and not a display preference.
  function walkDays(sp, includeBots, fn) {
    var st = store();
    for (var dk in st.days) {
      if (!Object.prototype.hasOwnProperty.call(st.days, dk)) continue;
      var t = keyToMs(dk);
      if (t < sp.start || t >= sp.end) continue;
      var users = st.days[dk];
      for (var uid in users) {
        if (!Object.prototype.hasOwnProperty.call(users, uid)) continue;
        if (!includeBots && BOT_IDS[uid]) continue;
        fn(t, uid, users[uid], dk);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // AGGREGATIONS — same names and same return shapes as statsQuery.
  // ---------------------------------------------------------------------------

  function activitySeries(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var only = opts.userIds && opts.userIds.length ? opts.userIds : null;
    var bars = sp.buckets.map(function (b) { return { label: b.label, messages: 0, voiceMinutes: 0, presentMinutes: 0, voiceHours: 0, presenceHours: 0 }; });
    var seen = {}, n = 0, tm = 0, tv = 0, tp = 0;
    walkDays(sp, !!opts.includeBots, function (t, uid, c) {
      if (only && only.indexOf(uid) < 0) return;
      var i = bucketIndex(sp.buckets, t);
      if (i < 0) return;
      bars[i].messages += c.m; bars[i].voiceMinutes += c.v; bars[i].presentMinutes += c.p;
      tm += c.m; tv += c.v; tp += c.p;
      if (!seen[uid]) { seen[uid] = 1; n++; }
    });
    bars.forEach(function (b) { b.voiceHours = round1(b.voiceMinutes / 60); b.presenceHours = round1(b.presentMinutes / 60); });
    return {
      window: sp.key, label: sp.label, unit: sp.unit, bars: bars, members: n,
      totals: { messages: tm, voiceMinutes: tv, presentMinutes: tp, voiceHours: round1(tv / 60), presenceHours: round1(tp / 60) }
    };
  }

  function comparePeriods(window, opts) {
    opts = opts || {};
    var cur = activitySeries(window, opts);
    var sp = spec(window, opts);
    var len = sp.end - sp.start;
    var prev = activitySeries('custom', { from: sp.start - len, to: sp.start - 1, userIds: opts.userIds, includeBots: opts.includeBots });
    var pct = function (a, b) { return b > 0 ? Math.round(((a - b) / b) * 100) : (a > 0 ? null : 0); };
    return {
      current: cur, previous: prev,
      delta: {
        messages: cur.totals.messages - prev.totals.messages,
        messagesPct: pct(cur.totals.messages, prev.totals.messages),
        voiceHours: round1(cur.totals.voiceHours - prev.totals.voiceHours),
        voicePct: pct(cur.totals.voiceMinutes, prev.totals.voiceMinutes),
        members: cur.members - prev.members,
        membersPct: pct(cur.members, prev.members)
      }
    };
  }

  function leaderboard(metric, window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var sums = {};
    walkDays(sp, !!opts.includeBots, function (t, uid, c) {
      var e = sums[uid] || (sums[uid] = { userId: uid, messages: 0, voiceMinutes: 0, presentMinutes: 0 });
      e.messages += c.m; e.voiceMinutes += c.v; e.presentMinutes += c.p;
    });
    var key = metric === 'voice' ? 'voiceMinutes' : metric === 'presence' ? 'presentMinutes' : 'messages';
    var rows = [];
    for (var uid in sums) if (Object.prototype.hasOwnProperty.call(sums, uid)) rows.push(sums[uid]);
    rows = rows.map(function (e) { return { userId: e.userId, count: e[key], messages: e.messages, voiceMinutes: e.voiceMinutes, presentMinutes: e.presentMinutes }; })
      .filter(function (e) { return e.count > 0; })
      .sort(function (a, b) { return b.count - a.count; });
    return { metric: metric, window: sp.key, label: sp.label, rows: rows, ranked: rows.length, total: rows.reduce(function (a, b) { return a + b.count; }, 0) };
  }

  function hourOfDay(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var st = store();
    var hours = [];
    for (var h = 0; h < 24; h++) hours.push({ hour: h, label: hourLabel(h), messages: 0, voiceMinutes: 0, presentMinutes: 0, voiceHours: 0 });
    var total = 0;
    for (var dk in st.hod) {
      if (!Object.prototype.hasOwnProperty.call(st.hod, dk)) continue;
      var day = keyToMs(dk);
      var byHour = st.hod[dk];
      for (var k in byHour) {
        if (!Object.prototype.hasOwnProperty.call(byHour, k)) continue;
        var hh = +k;
        var t = day + hh * HOUR_MS;
        if (t < sp.start || t >= sp.end) continue;
        var c = byHour[k];
        hours[hh].messages += c.m; hours[hh].voiceMinutes += c.v; hours[hh].presentMinutes += c.p;
        total += c.m + c.v;
      }
    }
    hours.forEach(function (b) { b.voiceHours = round1(b.voiceMinutes / 60); });
    var peak = hours.reduce(function (a, b) { return (b.messages + b.voiceMinutes) > (a.messages + a.voiceMinutes) ? b : a; }, hours[0]);
    return { window: sp.key, label: sp.label, hours: hours, peakHour: total ? peak.hour : null, available: total > 0 };
  }

  function weekdayProfile(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var only = opts.userIds && opts.userIds.length ? opts.userIds : null;
    var days = WEEKDAYS.map(function (label, index) { return { index: index, label: label, messages: 0, voiceMinutes: 0, voiceHours: 0 }; });
    var total = 0;
    walkDays(sp, !!opts.includeBots, function (t, uid, c) {
      if (only && only.indexOf(uid) < 0) return;
      var b = days[new Date(t).getDay()];
      b.messages += c.m; b.voiceMinutes += c.v; total += c.m + c.v;
    });
    days.forEach(function (d) { d.voiceHours = round1(d.voiceMinutes / 60); });
    var busiest = days.reduce(function (a, b) { return (b.messages + b.voiceMinutes) > (a.messages + a.voiceMinutes) ? b : a; }, days[0]);
    return {
      window: sp.key, label: sp.label, unit: sp.unit,
      // ⚠ STATED, NEVER INFERRED. A weekday means nothing over month buckets —
      // every month would land on whatever weekday its 1st happened to be.
      meaningful: sp.unit === 'day' || sp.unit === 'hour',
      days: days, busiest: total ? busiest.index : null, available: total > 0
    };
  }

  function heatmap(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var metric = opts.metric === 'voice' ? 'v' : 'm';
    var st = store();
    var grid = WEEKDAYS.map(function () {
      var row = []; for (var h = 0; h < 24; h++) row.push({ messages: 0, voiceMinutes: 0, value: 0 });
      return row;
    });
    var max = 0, total = 0;
    for (var dk in st.hod) {
      if (!Object.prototype.hasOwnProperty.call(st.hod, dk)) continue;
      var day = keyToMs(dk);
      var wd = new Date(day).getDay();
      var byHour = st.hod[dk];
      for (var k in byHour) {
        if (!Object.prototype.hasOwnProperty.call(byHour, k)) continue;
        var hh = +k;
        var t = day + hh * HOUR_MS;
        if (t < sp.start || t >= sp.end) continue;
        var c = byHour[k], cell = grid[wd][hh];
        cell.messages += c.m; cell.voiceMinutes += c.v;
        cell.value = metric === 'v' ? cell.voiceMinutes : cell.messages;
        if (cell.value > max) max = cell.value;
        total += metric === 'v' ? c.v : c.m;
      }
    }
    return { window: sp.key, label: sp.label, metric: opts.metric === 'voice' ? 'voice' : 'messages', weekdays: WEEKDAYS, grid: grid, max: max, total: total, available: total > 0 };
  }

  function channelBreakdown(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var metric = opts.metric === 'voice' ? 'voice' : 'messages';
    var st = store();
    var sums = {};
    for (var dk in st.chan) {
      if (!Object.prototype.hasOwnProperty.call(st.chan, dk)) continue;
      var t = keyToMs(dk);
      if (t < sp.start || t >= sp.end) continue;
      var users = st.chan[dk];
      for (var uid in users) {
        if (!Object.prototype.hasOwnProperty.call(users, uid)) continue;
        if (!opts.includeBots && BOT_IDS[uid]) continue;
        var chans = users[uid];
        for (var cid in chans) {
          if (!Object.prototype.hasOwnProperty.call(chans, cid)) continue;
          var e = sums[cid] || (sums[cid] = { channelId: cid, messages: 0, voiceMinutes: 0, people: {} , members: 0 });
          e.messages += chans[cid].m || 0; e.voiceMinutes += chans[cid].v || 0;
          if (!e.people[uid]) { e.people[uid] = 1; e.members++; }
        }
      }
    }
    var rows = [];
    for (var id in sums) if (Object.prototype.hasOwnProperty.call(sums, id)) rows.push(sums[id]);
    // ⚠ THE COUNT IS NAMED FOR ITS METRIC. A single `minutes` field that
    // sometimes holds messages is how a card ends up rendering a message count
    // divided by 60 under the heading "Voice by channel" — which is exactly what
    // the Discord surface did until v1.7.2.
    rows = rows.map(function (e) {
      return { channelId: e.channelId, messages: e.messages, voiceMinutes: e.voiceMinutes, voiceHours: round1(e.voiceMinutes / 60), members: e.members, count: metric === 'voice' ? e.voiceMinutes : e.messages };
    }).filter(function (r) { return r.count > 0; }).sort(function (a, b) { return b.count - a.count; });
    return { window: sp.key, label: sp.label, metric: metric, unit: metric === 'voice' ? 'minutes' : 'messages', rows: rows, total: rows.reduce(function (a, b) { return a + b.count; }, 0), available: rows.length > 0 };
  }

  function roleBreakdown(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var metric = opts.metric === 'voice' ? 'voice' : 'messages';
    var roleOf = {};
    ROLES.forEach(function (r) { r.members.forEach(function (u) { (roleOf[u] || (roleOf[u] = [])).push(r.id); }); });
    var acc = {};
    ROLES.forEach(function (r) { acc[r.id] = { roleId: r.id, name: r.name, members: r.members.length, messages: 0, voiceMinutes: 0, active: {}, activeMembers: 0 }; });
    walkDays(sp, !!opts.includeBots, function (t, uid, c) {
      var rs = roleOf[uid];
      if (!rs) return;
      for (var i = 0; i < rs.length; i++) {
        var e = acc[rs[i]];
        e.messages += c.m; e.voiceMinutes += c.v;
        if ((c.m || c.v) && !e.active[uid]) { e.active[uid] = 1; e.activeMembers++; }
      }
    });
    var rows = ROLES.map(function (r) {
      var e = acc[r.id];
      var count = metric === 'voice' ? e.voiceMinutes : e.messages;
      return {
        roleId: e.roleId, name: e.name, members: e.members, messages: e.messages,
        voiceMinutes: e.voiceMinutes, voiceHours: round1(e.voiceMinutes / 60),
        activeMembers: e.activeMembers, count: count,
        perMember: e.members ? Math.round((count / e.members) * 10) / 10 : 0
      };
    }).sort(function (a, b) { return b.count - a.count; });
    return {
      window: sp.key, label: sp.label, metric: metric, rows: rows, available: rows.some(function (r) { return r.count > 0; }),
      // ⚠ The caveat travels with the data. Roles are read from the CURRENT
      // roster, so a member who gained or lost a role moves retroactively.
      basis: 'current-roles'
    };
  }

  function growthSeries(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var st = store();
    var bars = sp.buckets.map(function (b) { return { label: b.label, joins: 0, leaves: 0, net: 0, cumulative: 0 }; });
    var j = 0, l = 0;
    for (var dk in st.guild) {
      if (!Object.prototype.hasOwnProperty.call(st.guild, dk)) continue;
      var i = bucketIndex(sp.buckets, keyToMs(dk));
      if (i < 0) continue;
      bars[i].joins += st.guild[dk].join || 0;
      bars[i].leaves += st.guild[dk].leave || 0;
      j += st.guild[dk].join || 0; l += st.guild[dk].leave || 0;
    }
    var run = 0;
    bars.forEach(function (b) { b.net = b.joins - b.leaves; run += b.net; b.cumulative = run; });
    return { window: sp.key, label: sp.label, unit: sp.unit, bars: bars, totals: { joins: j, leaves: l, net: j - l }, available: j + l > 0 };
  }

  function activeMembers(window, opts) {
    opts = opts || {};
    var sp = spec(window, opts);
    var per = sp.buckets.map(function () { return {}; });
    var counts = sp.buckets.map(function () { return 0; });
    var all = {}, distinct = 0;
    walkDays(sp, !!opts.includeBots, function (t, uid, c) {
      if (!(c.m || c.v || c.p)) return;
      var i = bucketIndex(sp.buckets, t);
      if (i < 0) return;
      if (!per[i][uid]) { per[i][uid] = 1; counts[i]++; }
      if (!all[uid]) { all[uid] = 1; distinct++; }
    });
    var bars = sp.buckets.map(function (b, i) { return { label: b.label, members: counts[i] }; });
    return {
      window: sp.key, label: sp.label, unit: sp.unit, bars: bars, distinct: distinct,
      // ⚠ NOT the sum of the bars. Somebody active on two days is one member and
      // two bars; a reader who adds them up has member-days, so both are named.
      memberDays: counts.reduce(function (a, b) { return a + b; }, 0),
      peak: counts.reduce(function (a, b) { return Math.max(a, b); }, 0),
      available: distinct > 0
    };
  }

  function serverSummary(window, opts) {
    var a = activitySeries(window, opts);
    var am = activeMembers(window, opts);
    var g = growthSeries(window, opts);
    var h = hourOfDay(window, opts);
    var busiest = a.bars.reduce(function (x, b) { return (b.messages + b.voiceMinutes) > (x.messages + x.voiceMinutes) ? b : x; }, a.bars[0] || { messages: 0, voiceMinutes: 0, label: '—' });
    return {
      window: a.window, label: a.label, unit: a.unit,
      messages: a.totals.messages, voiceHours: a.totals.voiceHours, presenceHours: a.totals.presenceHours,
      activeMembers: am.distinct, peak: am.peak,
      messagesPerMember: am.distinct ? Math.round((a.totals.messages / am.distinct) * 10) / 10 : 0,
      joins: g.totals.joins, leaves: g.totals.leaves, net: g.totals.net,
      peakHour: h.peakHour, busiest: busiest
    };
  }

  // ---------------------------------------------------------------------------
  // ⚠⚠ PER-MEMBER DETAIL AND THE ISOLATION RULE — READ THIS BEFORE CHANGING IT
  // ---------------------------------------------------------------------------
  //
  // Aggregate and leaderboard data is public on this surface: the bot already
  // shows every member a server leaderboard, so a rank and a total is not a new
  // disclosure. A member's DETAIL is not — their hour-by-hour profile is a map
  // of when they are awake, when they are at work, and when they are alone in a
  // voice channel. The Discord member surface only ever renders that for the
  // person who clicked, and this page must not be the hole in that.
  //
  // So `memberDetail` REFUSES for anybody but the viewer and says why. The check
  // lives here, in the data layer, and not in the renderer — a guard in a render
  // function is one careless `innerHTML` away from being bypassed, and the whole
  // point is that the numbers are never computed for the wrong person in the
  // first place.
  //
  // `viewerId` is a parameter rather than a module constant so a real deployment
  // passes the authenticated session's id and cannot accidentally inherit the
  // demo's.
  function memberDetail(userId, window, opts) {
    opts = opts || {};
    var viewer = opts.viewerId || ME;
    var uid = String(userId);
    if (uid !== String(viewer)) {
      return {
        userId: uid, allowed: false, reason: 'notYou',
        why: 'Per-member detail is only ever shown to that member. Rankings and server totals are public here; when somebody is awake is not.',
        available: false
      };
    }
    var sp = spec(window, opts);
    var st = store();
    var bars = sp.buckets.map(function (b) { return { label: b.label, messages: 0, voiceMinutes: 0, voiceHours: 0, presenceHours: 0 }; });
    var totals = { messages: 0, voiceMinutes: 0, presentMinutes: 0 };
    var activeDays = {}, nDays = 0, firstSeen = null, lastSeen = null;
    var ranks = {};
    walkDays(sp, false, function (t, u, c) {
      var e = ranks[u] || (ranks[u] = { messages: 0, voiceMinutes: 0 });
      e.messages += c.m; e.voiceMinutes += c.v;
      if (u !== uid) return;
      var i = bucketIndex(sp.buckets, t);
      if (i >= 0) { bars[i].messages += c.m; bars[i].voiceMinutes += c.v; }
      totals.messages += c.m; totals.voiceMinutes += c.v; totals.presentMinutes += c.p;
      if (c.m || c.v) {
        var dk = dayKey(t);
        if (!activeDays[dk]) { activeDays[dk] = 1; nDays++; }
        if (firstSeen == null || t < firstSeen) firstSeen = t;
        if (lastSeen == null || t > lastSeen) lastSeen = t;
      }
    });
    bars.forEach(function (b) { b.voiceHours = round1(b.voiceMinutes / 60); });
    var rankOf = function (field) {
      var mine = (ranks[uid] || {})[field] || 0;
      if (!mine) return null;
      var better = 0, of = 0;
      for (var u in ranks) {
        if (!Object.prototype.hasOwnProperty.call(ranks, u)) continue;
        if (ranks[u][field] > 0) of++;
        if (ranks[u][field] > mine) better++;
      }
      return { rank: better + 1, of: of, count: mine };
    };
    // Longest run of consecutive active days inside the window.
    var sorted = Object.keys(activeDays).sort();
    var best = 0, run = 0, prev = null;
    sorted.forEach(function (dk) {
      var t = keyToMs(dk);
      run = (prev != null && Math.round((t - prev) / DAY_MS) === 1) ? run + 1 : 1;
      if (run > best) best = run;
      prev = t;
    });
    var totalM = 0, totalV = 0;
    for (var u2 in ranks) {
      if (!Object.prototype.hasOwnProperty.call(ranks, u2)) continue;
      totalM += ranks[u2].messages; totalV += ranks[u2].voiceMinutes;
    }
    // The member's own hour profile — month-aggregated in the real store, so it
    // is not windowed here either.
    var uh = (st.uhod[uid] || {});
    var hours = [];
    var peakH = null, peakV = -1;
    for (var h = 0; h < 24; h++) {
      var c2 = uh[h] || { m: 0, v: 0, p: 0 };
      hours.push({ hour: h, label: hourLabel(h), messages: c2.m, voiceMinutes: c2.v, voiceHours: round1(c2.v / 60) });
      if (c2.m + c2.v > peakV) { peakV = c2.m + c2.v; peakH = h; }
    }
    return {
      userId: uid, allowed: true, window: sp.key, label: sp.label, unit: sp.unit,
      bars: bars,
      totals: { messages: totals.messages, voiceMinutes: totals.voiceMinutes, voiceHours: round1(totals.voiceMinutes / 60), presenceHours: round1(totals.presentMinutes / 60) },
      rank: { messages: rankOf('messages'), voice: rankOf('voiceMinutes') },
      activeDays: nDays, longestStreak: best, firstSeen: firstSeen, lastSeen: lastSeen,
      share: { messages: totalM ? Math.round((totals.messages / totalM) * 1000) / 10 : 0, voice: totalV ? Math.round((totals.voiceMinutes / totalV) * 1000) / 10 : 0 },
      hours: hours, peakHour: peakV > 0 ? peakH : null,
      weekdays: weekdayProfile(window, { userIds: [uid], now: opts.now }),
      available: totals.messages + totals.voiceMinutes > 0
    };
  }

  // ===========================================================================
  // SVG CHART BUILDERS
  // ===========================================================================
  //
  // Every function returns an HTML string. Colours are CSS custom properties so
  // one chart body serves both themes — a hex literal here is the classic way to
  // ship a white line on a white background in light mode.

  var S1 = 'var(--as-accent)';        // series 1 — messages
  var S2 = 'var(--as-frost)';         // series 2 — voice
  var INK3 = 'var(--as-text-3)';      // the third series is neutral + dashed
  var GRID = 'var(--as-border-soft)';
  var AXIS = 'var(--as-border)';
  var HEAT_FLOOR = 0.14;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmtNum(n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.round(n * 10) / 10);
  }

  // A "nice" axis top: 1/2/5 × 10^n at or above the data max, so ticks are round
  // numbers rather than 37.4 / 74.8 / 112.2.
  function niceScale(max, ticks) {
    ticks = ticks || 4;
    if (!(max > 0)) return { max: 1, ticks: [0, 1] };
    var raw = max / ticks;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
    var top = Math.ceil(max / step) * step;
    var out = [];
    for (var v = 0; v <= top + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
    return { max: top, ticks: out };
  }

  function labelStride(n, maxLabels) { return n <= maxLabels ? 1 : Math.ceil(n / maxLabels); }

  /**
   * Grouped bar + line chart over time. The workhorse.
   *
   * ⚠ ONE Y-AXIS, ALWAYS. A second scale on the right lets a renderer place any
   * two series in any relative position by choosing the scales — it is the most
   * common way to make a chart say something the data does not. Two measures of
   * different magnitude get two charts, not two axes. So `series` here must
   * share a unit; the messages/voice pair is split into two stacked panels
   * rather than overlaid.
   */
  function timeChart(bars, o) {
    o = o || {};
    var field = o.field || 'messages';
    var label = o.seriesLabel || 'Messages';
    var color = o.color || S1;
    var n = bars.length;
    if (!n) return emptyBox(o.empty || 'Nothing in this window yet.');
    var W = Math.max(560, Math.min(1120, 56 + n * (o.minStep || 26)));
    var H = o.height || 260;
    var pad = { l: 46, r: 14, t: 14, b: 30 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    var vals = bars.map(function (b) { return Number(b[field]) || 0; });
    var sc = niceScale(Math.max.apply(null, vals.concat([0])));
    var out = [];

    // Grid + y ticks.
    sc.ticks.forEach(function (v) {
      var y = pad.t + ph - (v / sc.max) * ph;
      out.push('<line x1="' + pad.l + '" y1="' + y.toFixed(1) + '" x2="' + (pad.l + pw) + '" y2="' + y.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>');
      out.push('<text x="' + (pad.l - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" class="sx-tick">' + fmtNum(v) + '</text>');
    });

    var step = pw / n;
    var bw = Math.max(2, Math.min(30, step * 0.62));
    // ⚠ 4px rounded ends anchored to the baseline: `rx` on a rect rounds all
    // four corners, so the radius is capped at a third of the width and the bar
    // is drawn tall enough that the bottom curve is hidden by the axis.
    var r = Math.min(4, bw / 3);
    for (var i = 0; i < n; i++) {
      var v = vals[i];
      var bh = (v / sc.max) * ph;
      var x = pad.l + step * (i + 0.5) - bw / 2;
      var last = i === n - 1;
      out.push('<rect x="' + x.toFixed(1) + '" y="' + (pad.t + ph - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(bh, 0.6).toFixed(1)
        + '" rx="' + r.toFixed(1) + '" fill="' + color + '" fill-opacity="' + (last ? '1' : '0.62') + '" class="sx-bar"><title>'
        + esc(bars[i].label + ' · ' + fmtNum(v) + ' ' + label.toLowerCase()) + '</title></rect>');
    }

    // Baseline + x labels, thinned so they never collide.
    out.push('<line x1="' + pad.l + '" y1="' + (pad.t + ph) + '" x2="' + (pad.l + pw) + '" y2="' + (pad.t + ph) + '" stroke="' + AXIS + '" stroke-width="1"/>');
    var stride = labelStride(n, Math.floor(pw / 46));
    for (var j = 0; j < n; j++) {
      if (j % stride !== 0 && j !== n - 1) continue;
      out.push('<text x="' + (pad.l + step * (j + 0.5)).toFixed(1) + '" y="' + (pad.t + ph + 18) + '" text-anchor="middle" class="sx-tick' + (j === n - 1 ? ' sx-tick--now' : '') + '">' + esc(bars[j].label) + '</text>');
    }
    // ⚠ THE ENDPOINT IS THE POINT. On an activity chart the reader's question is
    // almost always "where are we NOW", so the final bar is at full strength and
    // its value is direct-labelled — the one number that never has to be hunted
    // for on the axis.
    var lastV = vals[n - 1];
    var lastH = (lastV / sc.max) * ph;
    out.push('<text x="' + (pad.l + step * (n - 0.5)).toFixed(1) + '" y="' + Math.max(pad.t + 9, pad.t + ph - lastH - 6).toFixed(1) + '" text-anchor="middle" class="sx-endlabel">' + fmtNum(lastV) + '</text>');

    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    return svgFigure(W, H, out.join(''),
      label + ' over ' + (o.windowLabel || 'the selected period') + ': ' + fmtNum(total) + ' in total, '
      + 'highest ' + fmtNum(Math.max.apply(null, vals)) + ', most recent ' + fmtNum(lastV) + '.');
  }

  /** Two series on one shared scale, as lines — used for member comparison. */
  function multiLineChart(labels, series, o) {
    o = o || {};
    var n = labels.length;
    if (!n) return emptyBox('Nothing in this window yet.');
    var W = Math.max(560, Math.min(1120, 56 + n * (o.minStep || 26)));
    var H = o.height || 260;
    var pad = { l: 46, r: 14, t: 14, b: 30 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values); });
    var sc = niceScale(Math.max.apply(null, all.concat([0])));
    var out = [];
    sc.ticks.forEach(function (v) {
      var y = pad.t + ph - (v / sc.max) * ph;
      out.push('<line x1="' + pad.l + '" y1="' + y.toFixed(1) + '" x2="' + (pad.l + pw) + '" y2="' + y.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>');
      out.push('<text x="' + (pad.l - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" class="sx-tick">' + fmtNum(v) + '</text>');
    });
    var step = n > 1 ? pw / (n - 1) : 0;
    var xOf = function (i) { return pad.l + (n > 1 ? step * i : pw / 2); };
    var yOf = function (v) { return pad.t + ph - (v / sc.max) * ph; };
    series.forEach(function (s, si) {
      // ⚠ SERIES 3+ IS NEVER A NEW HUE — see the header. It is neutral ink with a
      // dashed stroke, and the legend below always names it.
      var col = si === 0 ? S1 : si === 1 ? S2 : INK3;
      var dash = si >= 2 ? ' stroke-dasharray="5 4"' : '';
      var d = s.values.map(function (v, i) { return (i ? 'L' : 'M') + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1); }).join(' ');
      out.push('<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"' + dash + '/>');
      // The endpoint marker: ≥8px, with a 2px surface ring so overlapping series
      // stay separable where they cross.
      var lv = s.values[n - 1];
      out.push('<circle cx="' + xOf(n - 1).toFixed(1) + '" cy="' + yOf(lv).toFixed(1) + '" r="4.5" fill="' + col + '" stroke="var(--as-surface-1)" stroke-width="2"><title>' + esc(s.name + ' · ' + fmtNum(lv)) + '</title></circle>');
    });
    out.push('<line x1="' + pad.l + '" y1="' + (pad.t + ph) + '" x2="' + (pad.l + pw) + '" y2="' + (pad.t + ph) + '" stroke="' + AXIS + '" stroke-width="1"/>');
    var stride = labelStride(n, Math.floor(pw / 46));
    for (var j = 0; j < n; j++) {
      if (j % stride !== 0 && j !== n - 1) continue;
      out.push('<text x="' + xOf(j).toFixed(1) + '" y="' + (pad.t + ph + 18) + '" text-anchor="middle" class="sx-tick' + (j === n - 1 ? ' sx-tick--now' : '') + '">' + esc(labels[j]) + '</text>');
    }
    var desc = series.map(function (s) { return s.name + ' ends at ' + fmtNum(s.values[n - 1]); }).join('; ');
    return svgFigure(W, H, out.join(''), (o.title || 'Comparison') + '. ' + desc + '.') + legendHtml(series.map(function (s, i) { return { name: s.name, color: i === 0 ? S1 : i === 1 ? S2 : INK3, dashed: i >= 2 }; }));
  }

  /**
   * Diverging joins/leaves around a zero line.
   *
   * ⚠ DIVERGING, NOT CATEGORICAL: two poles either side of a neutral midpoint.
   * The two colours are the system's reserved status pair, and they are NOT the
   * only thing carrying the meaning — joins are above the axis, leaves below,
   * and both are named in the legend. Status colour alone is unreadable to a
   * colour-blind viewer and invisible in forced-colors mode.
   */
  function growthChart(bars, o) {
    o = o || {};
    var n = bars.length;
    if (!n) return emptyBox('No arrivals or departures recorded in this window.');
    var W = Math.max(560, Math.min(1120, 56 + n * 26));
    var H = 240;
    var pad = { l: 46, r: 14, t: 14, b: 30 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    var maxUp = Math.max.apply(null, bars.map(function (b) { return b.joins; }).concat([0]));
    var maxDn = Math.max.apply(null, bars.map(function (b) { return b.leaves; }).concat([0]));
    var peak = Math.max(maxUp, maxDn, 1);
    var sc = niceScale(peak, 2);
    var mid = pad.t + ph / 2;
    var half = ph / 2;
    var out = [];
    [-sc.max, 0, sc.max].forEach(function (v) {
      var y = mid - (v / sc.max) * half;
      out.push('<line x1="' + pad.l + '" y1="' + y.toFixed(1) + '" x2="' + (pad.l + pw) + '" y2="' + y.toFixed(1) + '" stroke="' + (v === 0 ? AXIS : GRID) + '" stroke-width="1"/>');
      out.push('<text x="' + (pad.l - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" class="sx-tick">' + fmtNum(Math.abs(v)) + '</text>');
    });
    var step = pw / n;
    var bw = Math.max(2, Math.min(24, step * 0.6));
    var r = Math.min(4, bw / 3);
    bars.forEach(function (b, i) {
      var x = pad.l + step * (i + 0.5) - bw / 2;
      if (b.joins) {
        var hu = (b.joins / sc.max) * half;
        out.push('<rect x="' + x.toFixed(1) + '" y="' + (mid - hu).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hu.toFixed(1) + '" rx="' + r.toFixed(1) + '" fill="var(--as-success)"><title>' + esc(b.label + ' · ' + b.joins + ' joined') + '</title></rect>');
      }
      if (b.leaves) {
        var hd = (b.leaves / sc.max) * half;
        out.push('<rect x="' + x.toFixed(1) + '" y="' + mid.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hd.toFixed(1) + '" rx="' + r.toFixed(1) + '" fill="var(--as-danger)"><title>' + esc(b.label + ' · ' + b.leaves + ' left') + '</title></rect>');
      }
    });
    var stride = labelStride(n, Math.floor(pw / 46));
    for (var j = 0; j < n; j++) {
      if (j % stride !== 0 && j !== n - 1) continue;
      out.push('<text x="' + (pad.l + step * (j + 0.5)).toFixed(1) + '" y="' + (pad.t + ph + 18) + '" text-anchor="middle" class="sx-tick' + (j === n - 1 ? ' sx-tick--now' : '') + '">' + esc(bars[j].label) + '</text>');
    }
    var tj = bars.reduce(function (a, b) { return a + b.joins; }, 0);
    var tl = bars.reduce(function (a, b) { return a + b.leaves; }, 0);
    return svgFigure(W, H, out.join(''), 'Arrivals and departures: ' + tj + ' joined, ' + tl + ' left, net ' + (tj - tl) + '.')
      + legendHtml([{ name: 'Joined (above the line)', color: 'var(--as-success)' }, { name: 'Left (below the line)', color: 'var(--as-danger)' }]);
  }

  /**
   * The weekday × hour heatmap.
   *
   * ⚠ SEQUENTIAL: ONE HUE, STEPPED. Magnitude is encoded by intensity of a
   * single hue, never by hue itself — a rainbow ramp invents boundaries the data
   * does not have and is unreadable under any colour-vision deficiency. The
   * floor is HEAT_FLOOR rather than 0 so a cell with one message and a cell with
   * none are visibly different; without it the small hours read as "dead" when
   * they are merely quiet.
   */
  function heatmapChart(h, o) {
    o = o || {};
    if (!h || !h.available) return emptyBox(o.empty || 'The hour-by-hour grid has nothing in it for this window.');
    var rows = h.grid.length;
    var cw = 30, chh = 24, gap = 2, gutter = 40;
    var W = gutter + 24 * cw + 8;
    var H = 20 + rows * (chh + gap) + 44;
    var out = [];
    for (var hh = 0; hh < 24; hh += 3) {
      out.push('<text x="' + (gutter + hh * cw + (cw - gap) / 2).toFixed(1) + '" y="12" text-anchor="middle" class="sx-tick">' + hourLabel(hh) + '</text>');
    }
    for (var w = 0; w < rows; w++) {
      var y = 20 + w * (chh + gap);
      out.push('<text x="' + (gutter - 8) + '" y="' + (y + chh * 0.68).toFixed(1) + '" text-anchor="end" class="sx-tick">' + esc(h.weekdays[w]) + '</text>');
      for (var c = 0; c < 24; c++) {
        var cell = h.grid[w][c];
        var x = gutter + c * cw;
        out.push('<rect x="' + x + '" y="' + y + '" width="' + (cw - gap) + '" height="' + chh + '" rx="3" fill="var(--as-sunken)"/>');
        if (!cell.value) continue;
        var t = HEAT_FLOOR + (1 - HEAT_FLOOR) * (cell.value / (h.max || 1));
        out.push('<rect x="' + x + '" y="' + y + '" width="' + (cw - gap) + '" height="' + chh + '" rx="3" fill="' + S1 + '" fill-opacity="' + t.toFixed(3)
          + '"><title>' + esc(WEEKDAYS_LONG[w] + ' ' + hourName(c) + ' · ' + fmtNum(cell.value) + ' ' + (h.metric === 'voice' ? 'voice minutes' : 'messages')) + '</title></rect>');
      }
    }
    // The key. A heatmap without a scale is a picture, not a measurement.
    var ky = 20 + rows * (chh + gap) + 18, kx = gutter, kw = 108;
    out.push('<text x="' + (kx - 8) + '" y="' + (ky + 9) + '" text-anchor="end" class="sx-tick">0</text>');
    for (var s = 0; s < 6; s++) {
      var tt = HEAT_FLOOR + (1 - HEAT_FLOOR) * ((s + 1) / 6);
      out.push('<rect x="' + (kx + s * (kw / 6)).toFixed(1) + '" y="' + ky + '" width="' + (kw / 6 - 1).toFixed(1) + '" height="10" rx="2" fill="' + S1 + '" fill-opacity="' + tt.toFixed(3) + '"/>');
    }
    out.push('<text x="' + (kx + kw + 8) + '" y="' + (ky + 9) + '" class="sx-tick">' + fmtNum(h.max) + '</text>');
    var peakW = 0, peakH = 0, best = -1;
    h.grid.forEach(function (row, wi) { row.forEach(function (cc, hi) { if (cc.value > best) { best = cc.value; peakW = wi; peakH = hi; } }); });
    return svgFigure(W, H, out.join(''),
      'Activity by weekday and hour. Busiest is ' + WEEKDAYS_LONG[peakW] + ' at ' + hourName(peakH) + ' with ' + fmtNum(best) + '.');
  }

  /** Horizontal ranked bars — leaderboards, channels, roles. */
  function rankChart(rows, o) {
    o = o || {};
    if (!rows.length) return emptyBox(o.empty || 'Nothing ranked in this window.');
    var list = rows.slice(0, o.limit || 10);
    var W = 640, rowH = 26, gap = 8, nameW = o.nameW || 150;
    var H = list.length * (rowH + gap);
    var px = nameW + 8, pw = W - px - 74;
    var max = Math.max.apply(null, list.map(function (r) { return Number(r.value) || 0; }).concat([0])) || 1;
    var out = [];
    list.forEach(function (r, i) {
      var y = i * (rowH + gap);
      var bw = Math.max(2, (Number(r.value) / max) * pw);
      var hi = !!r.highlight;
      out.push('<text x="' + (nameW) + '" y="' + (y + rowH * 0.68).toFixed(1) + '" text-anchor="end" class="sx-name' + (hi ? ' sx-name--me' : '') + '">' + esc(r.label) + '</text>');
      out.push('<rect x="' + px + '" y="' + y + '" width="' + pw + '" height="' + rowH + '" rx="5" fill="var(--as-sunken)"/>');
      out.push('<rect x="' + px + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="' + rowH + '" rx="5" fill="' + (o.color || S1) + '" fill-opacity="' + (hi ? '1' : '0.72') + '"><title>' + esc(r.label + ' · ' + fmtNum(r.value) + (o.unit || '')) + '</title></rect>');
      out.push('<text x="' + (px + pw + 8) + '" y="' + (y + rowH * 0.68).toFixed(1) + '" class="sx-val">' + fmtNum(r.value) + esc(o.unit || '') + '</text>');
    });
    return svgFigure(W, H, out.join(''), (o.title || 'Ranking') + ': ' + list.map(function (r) { return r.label + ' ' + fmtNum(r.value); }).join(', ') + '.');
  }

  // ⚠ `overflow-x: auto` LIVES ON THE WRAPPER, NOT THE PAGE. A 24-column heatmap
  // is wider than a phone; if the figure is allowed to widen the document, the
  // whole page scrolls sideways and every other section becomes unusable. The
  // chart scrolls inside its own box or it is a layout bug.
  function svgFigure(w, h, body, aria) {
    return '<div class="sx-scroll"><svg class="sx-svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h
      + '" role="img" aria-label="' + esc(aria) + '" preserveAspectRatio="xMinYMin meet">' + body + '</svg></div>';
  }
  function legendHtml(items) {
    return '<div class="sx-legend">' + items.map(function (i) {
      return '<span class="sx-legend__item"><span class="sx-swatch" style="background:' + i.color + (i.dashed ? ';opacity:.6' : '') + '"></span>' + esc(i.name) + '</span>';
    }).join('') + '</div>';
  }
  function emptyBox(msg) {
    return '<div class="as-empty"><div class="as-empty__title">Nothing to show</div><div class="as-empty__body">' + esc(msg) + '</div></div>';
  }

  root.AsbernStats = {
    ME: ME, MEMBERS: MEMBERS, CHANNELS: CHANNELS, ROLES: ROLES, WINDOWS: WINDOWS,
    WEEKDAYS: WEEKDAYS, WEEKDAYS_LONG: WEEKDAYS_LONG,
    memberById: function (id) { return MEMBER_BY_ID[id] || null; },
    channelById: function (id) { for (var i = 0; i < CHANNELS.length; i++) if (CHANNELS[i].id === id) return CHANNELS[i]; return null; },
    store: store, spec: spec, customSpec: customSpec,
    activitySeries: activitySeries, comparePeriods: comparePeriods, leaderboard: leaderboard,
    hourOfDay: hourOfDay, weekdayProfile: weekdayProfile, heatmap: heatmap,
    channelBreakdown: channelBreakdown, roleBreakdown: roleBreakdown,
    growthSeries: growthSeries, activeMembers: activeMembers, serverSummary: serverSummary,
    memberDetail: memberDetail,
    timeChart: timeChart, multiLineChart: multiLineChart, growthChart: growthChart,
    heatmapChart: heatmapChart, rankChart: rankChart,
    fmtNum: fmtNum, hourName: hourName, hourLabel: hourLabel, niceScale: niceScale, esc: esc,
    HEAT_FLOOR: HEAT_FLOOR,
    _placeholder: true
  };
}(typeof window !== 'undefined' ? window : this));
