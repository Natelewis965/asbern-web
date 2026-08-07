/* =============================================================================
   ASBERN · assets/dashboard-core.js
   -----------------------------------------------------------------------------
   THE ADMIN CONSOLE'S RULES, WITH NO DOM IN THEM.

   `dashboard-app.js` owns the browser: elements, events, the hash router, the
   WebSocket. This file owns everything you can decide without one — the param
   type table, the contract check, the search ranking, the HTML a control card
   is made of, and the API client itself (whose `fetch` is injected).

   ⚠ THE SPLIT IS NOT TIDINESS. It is what makes the console TESTABLE from
   `node --test`, which is the only test runner this repo has. `test/v172-*.test.js`
   requires this file directly and drives it: it renders the real card for the
   real registry's one `secret` param and asserts the value is nowhere in the
   HTML; it hands the client a `fetch` that throws and asserts what comes back is
   a typed failure rather than a fixture. Neither of those is assertable against a
   file that reaches for `document` at load.

   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ THERE IS NO REGISTRY SNAPSHOT IN THIS FILE, AND THERE MUST NEVER BE ONE.
   ═══════════════════════════════════════════════════════════════════════════

   `assets/dashboard.js` — the marketing preview, still shipped at preview.html —
   carries a generated `var REGISTRY = {…}` block, a frozen paste of
   `adminactions.describe()`. It held **221** controls while the live registry
   held **307**. The page rendered 221 correct-looking cards and NOTHING ANYWHERE
   NOTICED, because a snapshot that is wrong by OMISSION is invisible to every
   check that walks the snapshot: the 221 it had were byte-identical, and it
   offered no control that had been removed.

   That preview is a static page with no backend, so a snapshot plus
   `scripts/gen-dashboard-registry.js --check` is the right answer THERE.

   This console is not that page. It fetches `GET /v1/guilds/{id}/actions` and
   renders whatever comes back, so it holds nothing that can go stale — and
   `verifyContract()` below RE-COMPUTES the API's own fingerprint over the bytes
   that actually arrived, which is the one check that catches an omission: drop
   an action in transit and the recomputed hash stops matching the declared one.
   `packages/api/src/routes.js` shipped `fingerprint()` "so the snapshot can be
   DELETED rather than regenerated". This is the client that deletes it.

   ⚠ AND THE FALLBACK IS REFUSAL, NOT FIXTURES. `assets/mock-data.js` exists and
   is never loaded here. An API that cannot be reached produces a stated failure
   with the origin in it. Showing a plausible wrong number instead of an error is
   the exact defect class above, one layer out.

   ── THE SYNC REQUIREMENT IS STRUCTURAL, NOT A FEATURE ────────────────────────
   Both surfaces call `adminactions.run(id, params, ctx)`. Discord's console does
   it through `adminpanel.js`; this one does it through `POST …/actions/{id}`,
   which does it through `registry.run()`. There is no synchroniser, no mirror and
   no reconciliation job, because there is only one store and one runner. A change
   made in Discord shows here because this reads the same store — not because
   anything copied it. See packages/web/README.md § "The dashboard and the bot".

   NO BUILD STEP, NO DEPENDENCIES. Loads in a browser as `window.AsbernDashCore`
   and in Node as a CommonJS module.
   ========================================================================== */
'use strict';

(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AsbernDashCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /* =======================================================================
     0 · ESCAPING — local, because this file must not need asbern.js
     ======================================================================= */

  var AMP = /&/g, LT = /</g, GT = />/g, QUOT = /"/g, APOS = /'/g;

  /**
   * ⚠ EVERY INTERPOLATION IN THIS FILE GOES THROUGH THIS, INCLUDING THE ONES
   * WHOSE INPUT "COMES FROM OUR OWN REGISTRY". The contract arrives over HTTP
   * from a host the page was pointed at; treating it as trusted markup is how a
   * self-hoster's compromised bot turns into script execution in their admin's
   * browser. It costs nothing to escape a label.
   */
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(AMP, '&amp;').replace(LT, '&lt;').replace(GT, '&gt;')
      .replace(QUOT, '&quot;').replace(APOS, '&#39;');
  }

  /** A DOM id that is safe for `getElementById` and for a CSS selector. */
  function slug(s) { return String(s == null ? '' : s).replace(/[^a-zA-Z0-9]/g, '-'); }

  /* =======================================================================
     1 · PARAM TYPES — a PORT of src/lib/adminactions.js's TYPES table
     -----------------------------------------------------------------------
     ⚠ THIS IS A SECOND COPY OF A VALIDATOR AND THE REPO HAS SAID SO OUT LOUD.
     `packages/api/src/routes.js` refused to make a third and named the cost:
     "one number implemented twice, silently disagreeing for months" (v1.4.23).

     It is here anyway, for one reason: the alternative is a round trip before an
     admin learns they typed a channel name where a channel id goes. What makes
     it safe is not care, it is a GATE — `test/v172-dashboard-console.test.js`
     drives the same ~70 inputs through `adminactions.TYPES` and through this
     table and requires byte-identical `coerce` output and byte-identical `check`
     strings. A drift here goes red in `npm test`, not in six months.

     ⚠ AND IT IS ADVISORY IN THE ONLY DIRECTION THAT MATTERS. The server calls
     `registry.run()`, which calls `registry.validate()` — the same code path
     Discord takes. If this table were ever wrong, the server refuses and the
     admin sees the refusal, which is the correct failure direction. Nothing here
     can let something through that Discord would reject.
     ======================================================================= */

  function lbl(p) { return p.label || p.name; }

  function idCoerce(v) {
    if (v == null || v === '') return null;
    var s = String(v).trim();
    var m = /(\d{17,20})/.exec(s);
    return m ? m[1] : s;
  }
  function idCheck(v, p) {
    if (v == null) return p.required ? lbl(p) + ' is required' : null;
    return /^\d{17,20}$/.test(String(v)) ? null : lbl(p) + ' must be a Discord id';
  }

  var DURATION_MULT = { s: 1e3, m: 6e4, h: 3.6e6, d: 8.64e7, w: 6.048e8 };

  var TYPES = {
    string: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function (v, p) { return p.required && !v ? lbl(p) + ' is required' : null; },
    },
    reason: {
      coerce: function (v) { return v == null ? null : String(v).slice(0, 512); },
      check: function () { return null; },
    },
    pattern: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function () { return null; },
    },
    number: {
      coerce: function (v) { return (v === '' || v == null) ? null : Number(v); },
      check: function (v, p) {
        if (v == null) return p.required ? lbl(p) + ' is required' : null;
        if (!Number.isFinite(v)) return lbl(p) + ' must be a number';
        if (p.min != null && v < p.min) return lbl(p) + ' must be at least ' + p.min;
        if (p.max != null && v > p.max) return lbl(p) + ' must be at most ' + p.max;
        return null;
      },
    },
    count: {
      coerce: function (v) { return (v == null || v === '') ? null : Math.floor(Number(v)); },
      check: function (v, p) {
        return (v != null && (!Number.isFinite(v) || v < 1))
          ? lbl(p) + ' must be 1 or more' : null;
      },
    },
    boolean: {
      coerce: function (v) { return v === true || v === 'true' || v === 1 || v === '1'; },
      check: function () { return null; },
    },
    enum: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function (v, p) {
        if (v == null || !p.choices) return null;
        for (var i = 0; i < p.choices.length; i += 1) {
          var c = p.choices[i];
          // `c.value ?? c` — the registry's own expression, spelled for ES5.
          var val = (c != null && typeof c === 'object' && c.value != null) ? c.value : c;
          if (val === v) return null;
        }
        return v + ' is not one of the choices';
      },
    },
    member: { coerce: idCoerce, check: idCheck },
    channel: { coerce: idCoerce, check: idCheck },
    category: { coerce: idCoerce, check: idCheck },
    role: { coerce: idCoerce, check: idCheck },
    duration: {
      coerce: function (v) {
        if (v == null || v === '') return null;
        if (typeof v === 'number') return v;
        var m = /^(\d+)\s*(s|m|h|d|w)$/i.exec(String(v).trim());
        if (!m) return Number(v);
        return Number(m[1]) * DURATION_MULT[m[2].toLowerCase()];
      },
      check: function (v, p) {
        if (v == null) return p.required ? lbl(p) + ' is required' : null;
        if (!Number.isFinite(v) || v <= 0) return lbl(p) + ' must be a duration like 10m or 1h';
        return null;
      },
    },
  };

  var PARAM_TYPES = Object.keys(TYPES);

  /**
   * Coerce + check one call's params.
   *
   * ⚠ AN UNKNOWN TYPE IS CARRIED THROUGH AS A STRING, NEVER DROPPED. The mobile
   * client states the rule and it is the same one here: "a control that silently
   * loses a parameter is a control that runs with a default nobody chose." The
   * registry can grow a thirteenth type at any time; this console must degrade to
   * a text field rather than post a call with a hole in it.
   */
  function validate(action, raw) {
    var values = {};
    var errors = [];
    var fieldErrors = {};
    var params = (action && action.params) || [];
    for (var i = 0; i < params.length; i += 1) {
      var p = params[i];
      var t = TYPES[p.type];
      if (!t) {
        values[p.name] = raw[p.name] == null ? null : String(raw[p.name]);
        continue;
      }
      var v = t.coerce(raw[p.name]);
      var err = t.check(v, p);
      if (err) { errors.push(err); fieldErrors[p.name] = err; }
      values[p.name] = v;
    }
    return { ok: errors.length === 0, values: values, errors: errors, fieldErrors: fieldErrors };
  }

  /* =======================================================================
     2 · WIDGETS — the type → input mapping, shared with the phone
     -----------------------------------------------------------------------
     ⚠ THE SAME SEVEN NAMES packages/mobile/src/rules/adminRegistry.ts USES.
     Two clients that call the same concept different things is how a third
     invents a fourth vocabulary. `test/v172` pins this set against the mobile
     file's `InputKind` union, so a widget added on one surface is a red test on
     the other rather than a divergence nobody is looking for.
     ======================================================================= */

  var INPUT_KINDS = ['text', 'multiline', 'number', 'switch', 'choice', 'snowflake', 'duration'];

  function inputKindFor(type) {
    switch (type) {
      case 'reason': return 'multiline';
      case 'pattern': return 'multiline';
      case 'number': case 'count': return 'number';
      case 'boolean': return 'switch';
      case 'enum': return 'choice';
      case 'member': case 'channel': case 'category': case 'role': return 'snowflake';
      case 'duration': return 'duration';
      // ⚠ INCLUDING UNKNOWN TYPES. See validate(): degrade, never drop.
      default: return 'text';
    }
  }

  /**
   * Plan every widget on a control, and say so when a type is unrecognised.
   *
   * ⚠ THIS EXISTS SO "EVERY CONTROL HAS A RENDERER" IS A TEST AND NOT A HOPE.
   * The 221-vs-307 incident was a missing CONTROL; the same failure one level
   * down is a missing WIDGET — a param that draws nothing, on a card that still
   * looks finished. `test/v172` plans every control in the live registry and
   * requires `unknownTypes` to be empty across all of them.
   */
  function planControl(action) {
    var params = (action && action.params) || [];
    var widgets = [];
    var unknown = [];
    for (var i = 0; i < params.length; i += 1) {
      var p = params[i];
      if (!TYPES[p.type]) unknown.push(p.type);
      widgets.push({ param: p.name, type: p.type, kind: inputKindFor(p.type), secret: !!p.secret });
    }
    return {
      id: action && action.id,
      widgets: widgets,
      unknownTypes: unknown,
      verb: primaryVerb(action),
      twoStep: !!(action && (action.confirm || action.dryRun || action.destructive)),
    };
  }

  /* =======================================================================
     3 · WHO MAY SEE WHAT — copied from the runner's ladder, exactly
     ======================================================================= */

  /**
   * ⚠ INCLUDING THAT `isOwner` SATISFIES EVERY TIER. `adminactions.run()`:
   *   owner  → ctx.isOwner
   *   aidev  → ctx.isAiDev || ctx.isOwner
   *   else   → ctx.isAdmin || ctx.isOwner
   * A control hidden here but allowed there is a feature an admin cannot find;
   * one shown here and refused there is a dead button, which LAW 1 forbids by
   * name. Getting it subtly different is worse than not having it.
   */
  function maySee(control, actor) {
    var a = actor || {};
    switch (control.permission) {
      case 'owner': return !!a.isOwner;
      case 'aidev': return !!a.isAiDev || !!a.isOwner;
      default: return !!a.isAdmin || !!a.isOwner;
    }
  }

  /* =======================================================================
     4 · NAVIGATION — grouping, search
     ======================================================================= */

  /**
   * ⚠ GROUP ORDER COMES FROM THE CONTRACT AND CONTROLS KEEP REGISTRATION ORDER.
   * Both are decisions the registry made. Re-sorting alphabetically here would
   * put the same control in a different place on every surface, and an admin who
   * has learned where a control lives in Discord must find it in the same
   * relative place on the web. LAW 2's "one size" rule, one surface out.
   *
   * ⚠ EMPTY GROUPS ARE KEPT, NOT DROPPED. A tab that vanishes because its
   * controls are all above your permission level is indistinguishable from a tab
   * that was never built — and the sidebar's job is to describe the product, not
   * this session.
   */
  function groupControls(contract, actor) {
    var groups = (contract && contract.groups) || [];
    var actions = (contract && contract.actions) || [];
    return groups.map(function (g) {
      return {
        group: g,
        controls: actions.filter(function (a) { return a.group === g.id && maySee(a, actor); }),
        hidden: actions.filter(function (a) { return a.group === g.id && !maySee(a, actor); }).length,
      };
    });
  }

  /**
   * Rank controls against a query.
   *
   * ⚠ SEARCH IS THE PRIMARY NAVIGATION, NOT A CONVENIENCE. There are ~370
   * controls across 11 tabs. Browsing for one you can name is the slowest path
   * on the page, which is why the search box sits in the top bar and not inside
   * a tab. Weighted so an exact id beats a label beats a mention in the help
   * text — the same ordering the registry's own `overview.find` control uses, so
   * the two surfaces answer the same question the same way.
   */
  function searchControls(controls, query, limit) {
    var q = String(query == null ? '' : query).trim().toLowerCase();
    if (!q) return [];
    var cap = limit == null ? 40 : limit;
    var scored = [];
    for (var i = 0; i < controls.length; i += 1) {
      var c = controls[i];
      var score = 0;
      var id = String(c.id).toLowerCase();
      var label = String(c.label || '').toLowerCase();
      if (id === q) score += 100;
      else if (id.indexOf(q) === 0) score += 40;
      else if (id.indexOf(q) > -1) score += 20;
      if (label === q) score += 50;
      else if (label.indexOf(q) > -1) score += 16;
      if (String(c.help || '').toLowerCase().indexOf(q) > -1) score += 8;
      if (String(c.module || '').toLowerCase().indexOf(q) > -1) score += 4;
      if (String(c.group || '').toLowerCase().indexOf(q) > -1) score += 2;
      if (score > 0) scored.push({ c: c, score: score });
    }
    // A stable tiebreak on id: a list that reshuffles between keystrokes is
    // unusable, and two runs of the same query must not disagree.
    scored.sort(function (a, b) { return b.score - a.score || (a.c.id < b.c.id ? -1 : a.c.id > b.c.id ? 1 : 0); });
    return scored.slice(0, cap).map(function (s) { return s.c; });
  }

  /* =======================================================================
     4b · CONSEQUENCE + SEVERITY — ONE computation, two renderings
     -----------------------------------------------------------------------
     ⚠ THE PILL AND THE SENTENCE COME OUT OF THE SAME FUNCTION, AND THAT IS THE
     WHOLE POINT. This page used to draw a red stripe from `action.destructive`
     in one place and write "Read-only — nothing on the server changes" from a
     SEPARATE list of flags in another. Two derivations of "what will this do"
     is two chances to disagree, and the one that disagrees silently is the
     colour — an admin reads a stripe in 200ms and a sentence in two seconds.
     `test/v172` pins the equivalence: severity `read` ⟺ the sentence begins
     "Read-only". Neither can move without the other.

     ⚠ AND SEVERITY IS NOT PERMISSION. "This will change 400 members" and "you
     are not allowed to press this" are different facts and they get different
     form: severity is the left stripe and the semantic pill (danger / caution /
     read), permission is a neutral chip. Colouring a locked control red would
     say the control is dangerous when what is true is that it is not yours.
     ======================================================================= */

  var SEVERITIES = ['read', 'caution', 'danger'];

  function botNeeds(action) {
    var bp = action && action.botPermission;
    return (bp && Array.isArray(bp.need)) ? bp.need : [];
  }

  /**
   * What a control will do, as a severity AND as the sentence that says it.
   *
   * ⚠ THE `dryRun || confirm` ARM ONLY FIRES WHEN NOTHING ELSE DID, and it is
   * not padding. A control that previews before it commits is, by construction,
   * a control that commits — so calling it "read-only" because it declared no
   * `destructive` flag would be the page telling an admin the opposite of the
   * truth. Everything that reaches the final arm genuinely changes nothing.
   */
  function consequences(action) {
    var a = action || {};
    var parts = [];
    var sev = 'read';
    function raise(next) { if (SEVERITIES.indexOf(next) > SEVERITIES.indexOf(sev)) sev = next; }

    if (a.destructive) { parts.push('changes the server'); raise('danger'); }
    if (a.bulk) { parts.push('may touch many objects at once'); raise('caution'); }
    if (a.composite) { parts.push('runs several steps and rolls them back if one fails'); raise('caution'); }
    var need = botNeeds(a);
    if (need.length) { parts.push('needs the bot to hold ' + need.join(', ')); raise('caution'); }
    if (!parts.length && (a.dryRun || a.confirm)) {
      parts.push('shows you what it would do before anything commits');
      raise('caution');
    }

    return {
      severity: sev,
      parts: parts,
      line: parts.length ? 'This ' + parts.join(', and ') + '.' : 'Read-only — nothing on the server changes.',
    };
  }

  function severityOf(action) { return consequences(action).severity; }

  /** One sentence for what a control will touch. Read above the confirm. */
  function consequenceLine(control) { return consequences(control).line; }

  /* =======================================================================
     4c · FACETS — filtering that is derived from the contract, not declared
     -----------------------------------------------------------------------
     ⚠ EVERY PREDICATE BELOW READS A FIELD THE CONTRACT ALREADY CARRIES. There
     is no tag list, no curated "dangerous controls" set and nothing to keep in
     step with the registry — which is the same rule the module index follows
     ("A dashboard that re-declares the group→module map is a dashboard that
     will disagree with the gate one day"). A control added to the bot lands in
     the right facets on its own.
     ======================================================================= */

  var FACETS = [
    { id: 'destructive', label: 'Destructive', hint: 'Changes the server. Previews or arms before it commits.',
      match: function (a) { return !!a.destructive; } },
    { id: 'changes', label: 'Changes things', hint: 'Writes to Discord or to the bot’s own stores, but is not marked destructive.',
      match: function (a) { return severityOf(a) === 'caution'; } },
    { id: 'readonly', label: 'Read-only', hint: 'Nothing on the server changes. Safe to press to find something out.',
      match: function (a) { return severityOf(a) === 'read'; } },
    { id: 'needsinput', label: 'Needs a value', hint: 'Will not run until you fill in a required field.',
      match: function (a) { return (a.params || []).some(function (p) { return p.required; }); } },
    { id: 'noinput', label: 'No inputs', hint: 'Acts on the server as a whole — nothing to fill in.',
      match: function (a) { return !(a.params || []).length; } },
    { id: 'bulk', label: 'Bulk', hint: 'May touch many objects in one press.',
      match: function (a) { return !!a.bulk; } },
    { id: 'restricted', label: 'Beyond admin', hint: 'Needs the server owner, or the AI-dev role — not plain Administrator.',
      match: function (a) { return a.permission !== 'admin'; } },
  ];

  function facetById(id) {
    for (var i = 0; i < FACETS.length; i += 1) if (FACETS[i].id === id) return FACETS[i];
    return null;
  }

  /**
   * Narrow a list by every active facet.
   *
   * ⚠ ACTIVE FACETS ARE ANDed, AND AN UNKNOWN FACET ID IS IGNORED RATHER THAN
   * TREATED AS "MATCH NOTHING". The active set arrives from the URL-ish state a
   * browser holds across reloads; a facet renamed in a later release would
   * otherwise turn a remembered filter into an empty page with no explanation.
   */
  function filterControls(controls, active) {
    var list = Array.isArray(controls) ? controls : [];
    var on = (Array.isArray(active) ? active : []).map(facetById).filter(Boolean);
    if (!on.length) return list.slice();
    return list.filter(function (a) {
      for (var i = 0; i < on.length; i += 1) if (!on[i].match(a)) return false;
      return true;
    });
  }

  /**
   * What to draw for each chip: its count IN THE SET THE OTHER CHIPS LEAVE, and
   * whether pressing it can only produce an empty page.
   *
   * ⚠ THE COUNT IS TAKEN AGAINST THE CURRENTLY FILTERED SET, NOT AGAINST THE
   * WHOLE REGISTRY. That is the whole value: with `Destructive` on, the
   * `Read-only` chip reads **0** rather than 155, so an admin can see that the
   * combination is empty before pressing it instead of after. A chip that
   * advertises a number the current filters cannot produce is a number an admin
   * will trust and be wrong about.
   *
   * ⚠ AND `others` EXCLUDING THE CHIP'S OWN ID IS THE CONVENTIONAL FORMULATION,
   * NOT A BEHAVIOUR CHANGE — MEASURED, NOT ASSUMED. For AND-composed, idempotent
   * predicates `filter(on).filter(f)` and `filter(on \ {f}).filter(f)` are the
   * same set, so this reads identically either way today. It is written this way
   * because it stays correct if a facet ever stops being idempotent, and because
   * the alternative reads as though it were doing something it is not. A
   * sabotage against the exclusion was written expecting red and came back
   * green; that is why this note says so rather than claiming a defence.
   */
  function facetPlan(controls, active) {
    var on = (Array.isArray(active) ? active : []).filter(function (id) { return !!facetById(id); });
    return FACETS.map(function (f) {
      var others = on.filter(function (id) { return id !== f.id; });
      var base = filterControls(controls, others);
      var n = base.filter(f.match).length;
      return {
        id: f.id,
        label: f.label,
        hint: f.hint,
        count: n,
        active: on.indexOf(f.id) > -1,
        // An active chip is never disabled: it must always be pressable to turn
        // off, even when the combination it is part of shows nothing.
        disabled: n === 0 && on.indexOf(f.id) < 0,
      };
    });
  }

  /* =======================================================================
     5 · MODULES — derived from the contract, never a table in this file
     -----------------------------------------------------------------------
     ⚠ `adminactions.js` EXPORTS `MODULES` AND `GROUP_MODULE` PRECISELY SO NO
     SURFACE COPIES THEM: "A dashboard that re-declares the group→module map is a
     dashboard that will disagree with the gate one day." The old preview build
     kept its own `GROUP_MODULE`; this one has none. Every module shown comes
     from the `module` field of the controls that arrived in the contract, so a
     module cannot appear here without a control behind it, and a control cannot
     land in Discord without its module appearing here.
     ======================================================================= */

  /**
   * ⚠ THE OWNER'S TWO EXCLUSIONS, HELD AS DATA AND STATED ON THE PAGE.
   *
   * Owner decision: the AI companions stay off and Music is not in this product.
   * They are not silently filtered out of the contract — a control that exists is
   * still listed, still searchable and still says what it does. What they are
   * excluded from is the ENABLED SET: the Modules view will not show them as on
   * and will not offer a switch, and it says which decision did that.
   *
   * Hiding them outright would be the worse failure: an admin who cannot find a
   * module cannot tell "not sold" from "broken dashboard", and LAW 1's rule is a
   * disabled section WITH AN EXPLANATION, never a dead button.
   */
  var WITHHELD_MODULES = {
    'ai-companions': 'Held off by the server owner. The AI companions ship dark; the switch is in Discord.',
    'ai-credit': 'Held off by the server owner, with the AI companions it bills for.',
    music: 'Not part of this product. The music stack was retired and its library removed.',
  };

  function isWithheld(moduleId) {
    return Object.prototype.hasOwnProperty.call(WITHHELD_MODULES, String(moduleId));
  }

  /**
   * Every module the contract mentions, with its controls counted.
   * Sorted by control count then id, so the list is stable across loads.
   */
  function moduleIndex(contract) {
    var actions = (contract && contract.actions) || [];
    var by = {};
    for (var i = 0; i < actions.length; i += 1) {
      var a = actions[i];
      var id = a.module || 'unassigned';
      if (!by[id]) by[id] = { id: id, controls: 0, destructive: 0, groups: {}, withheld: isWithheld(id), why: WITHHELD_MODULES[id] || null };
      by[id].controls += 1;
      if (a.destructive) by[id].destructive += 1;
      by[id].groups[a.group] = true;
    }
    return Object.keys(by).map(function (k) {
      var m = by[k];
      m.groups = Object.keys(m.groups);
      return m;
    }).sort(function (a, b) { return b.controls - a.controls || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
  }

  /* =======================================================================
     6 · THE AUTO-READ HEURISTIC — which controls may be run unattended
     -----------------------------------------------------------------------
     ⚠ THE CONTRACT HAS NO "CURRENT VALUE" AND THAT IS NOT AN OVERSIGHT.
     `describe()` publishes what a control ASKS FOR, never what the store holds —
     it is a list of actions, not a settings document, and there is deliberately
     no read-value endpoint on the write API. So "show me the current state" is
     answered the only honest way available: by RUNNING the registry's own
     read-only controls (`bot.features`, `automod.show`, `verify.status`, …) and
     rendering what they return. Same runner, same gates, same answer Discord
     gets — which is the sync guarantee working rather than being described.

     ⚠ SO THIS PICKS WHAT MAY BE RUN WITHOUT SOMEBODY PRESSING IT, AND IT IS A
     PRESENTATION HEURISTIC OVER THE CONTRACT — NOT A SECOND CONTRACT. Nothing
     is hidden by it and nothing depends on it for correctness; it decides only
     which cards get a "read now" on view entry. Every guard below is an AND, and
     an unrecognised control simply does not qualify.

     ⚠ AND EVERY RUN COSTS AN AUDIT LINE, which is why this is once per guild
     per view rather than a poll. `packages/api/src/audit.js` writes one line per
     attempt including the refusals — a 15-second refresher would drown the trail
     that exists to be read.
     ======================================================================= */

  var READ_SUFFIXES = ['.show', '.list', '.status', '.features', '.overview'];

  function isSafeAutoRead(control) {
    if (!control || !control.id) return false;
    if (control.destructive) return false;
    if (control.confirm) return false;
    if (control.dryRun) return false;
    if (control.bulk) return false;
    if (control.composite) return false;
    if (control.permission !== 'admin') return false;
    var params = control.params || [];
    for (var i = 0; i < params.length; i += 1) if (params[i].required) return false;
    var id = String(control.id);
    for (var j = 0; j < READ_SUFFIXES.length; j += 1) {
      if (id.length > READ_SUFFIXES[j].length && id.slice(-READ_SUFFIXES[j].length) === READ_SUFFIXES[j]) return true;
    }
    return false;
  }

  function autoReadControls(contract, moduleId) {
    var actions = (contract && contract.actions) || [];
    return actions.filter(function (a) {
      if (!isSafeAutoRead(a)) return false;
      if (moduleId && a.module !== moduleId) return false;
      return true;
    });
  }

  /* =======================================================================
     7 · SECRETS — dropped, never masked, never echoed
     -----------------------------------------------------------------------
     ⚠ A LINE-FOR-LINE MIRROR OF `packages/api/src/audit.js`'s summariseParams,
     PINNED BY A TEST AGAINST THE REAL FUNCTION. Its argument, from botapi.js:
     emitting `"token": "[REDACTED]"` still publishes the fact and the field
     name, "and it makes 'no secret-bearing key appears in any response'
     untestable as a plain substring assertion." The server drops the key. A
     client that renders `••••••` into its own activity log has undone that on
     the customer's screen and in their screenshot.
     ======================================================================= */

  var FREE_TEXT_TYPES = { reason: true, pattern: true, string: true };
  var SCALAR_TYPES = {
    member: true, channel: true, category: true, role: true,
    number: true, count: true, boolean: true, enum: true, duration: true,
  };

  function summariseParams(spec, values) {
    var out = {};
    var dropped = 0;
    var list = Array.isArray(spec) ? spec : [];
    for (var i = 0; i < list.length; i += 1) {
      var p = list[i];
      var v = values ? values[p.name] : undefined;
      if (v === undefined || v === null) continue;
      if (p.secret) { dropped += 1; continue; }
      if (FREE_TEXT_TYPES[p.type]) { out[p.name] = { len: String(v).length }; continue; }
      if (SCALAR_TYPES[p.type]) { out[p.name] = v; continue; }
      // Unknown types fall to the safe side, exactly as the server's does.
      out[p.name] = { len: String(v).length };
    }
    if (dropped) out.redactedFields = dropped;
    return out;
  }

  /**
   * What a value may be shown as, anywhere on the page.
   *
   * ⚠ THE SECRET ARM RETURNS A FIXED GLYPH THAT CARRIES NO LENGTH. `••••••` for
   * a four-character token and `••••••` for a forty-character one, because a
   * length is a meaningful head start on a credential and there is no screen
   * where an admin needs it.
   */
  function displayValue(param, raw) {
    if (raw == null || raw === '') return '—';
    if (param && param.secret) return '••••••';
    return String(raw);
  }

  /* =======================================================================
     8 · THE CONTRACT CHECK — recompute the fingerprint from what arrived
     ======================================================================= */

  /**
   * `packages/api/src/routes.js`'s `canonical()`, ported exactly.
   *
   * ⚠ ARRAY ORDER IS PRESERVED, AND THAT IS DELIBERATE ON BOTH SIDES. `params`
   * and `choices` are ORDERED contracts — the order params are declared in is the
   * order Discord's modal asks for them and the order this page renders them —
   * so a reordering IS a contract change and must move the hash. Sorting them
   * would make the fingerprint blind to exactly the change a surface renders.
   */
  function canonical(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value === undefined ? null : value);
    if (Array.isArray(value)) {
      var parts = [];
      for (var i = 0; i < value.length; i += 1) parts.push(canonical(value[i]));
      return '[' + parts.join(',') + ']';
    }
    var keys = Object.keys(value).sort();
    var out = [];
    for (var k = 0; k < keys.length; k += 1) out.push(JSON.stringify(keys[k]) + ':' + canonical(value[keys[k]]));
    return '{' + out.join(',') + '}';
  }

  function hex(buf) {
    var b = new Uint8Array(buf);
    var s = '';
    for (var i = 0; i < b.length; i += 1) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s;
  }

  /**
   * SHA-256 of the canonical contract, or `null` when this browser will not do
   * it (WebCrypto's `subtle` is absent outside a secure context — plain `http://`
   * on a LAN hostname, for instance).
   *
   * ⚠ THREE-VALUED, AND THE THIRD VALUE IS LOAD-BEARING, exactly as
   * `screening.presence()` is: `null` means COULD NOT BE ASKED and may never be
   * spent as "matches". `verifyContract()` below returns `unverifiable` for it
   * and the page says so, rather than showing a green tick it did not earn.
   */
  function fingerprintOf(described) {
    var subtle = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) || null;
    if (!subtle || typeof TextEncoder === 'undefined') return Promise.resolve(null);
    var bytes = new TextEncoder().encode(canonical(described));
    return Promise.resolve(subtle.digest('SHA-256', bytes)).then(hex, function () { return null; });
  }

  /**
   * Is the contract this page is holding the contract the API meant to send?
   *
   * ⚠ THIS IS THE CHECK THE FROZEN SNAPSHOT NEVER HAD. It re-derives the hash
   * from the ACTIONS THAT ARRIVED, so a truncated array, a proxy that dropped a
   * chunk, or a stale cached body stops matching the declared value. A
   * self-declared checksum only detects the changes that bother to update it —
   * `scripts/gen-dashboard-registry.js` learned that the hard way and its own
   * comment says so.
   *
   * `health` is the second half: the fingerprint on `/v1/health` comes from the
   * live route table, so a contract served by a different build than the one
   * answering writes is caught even when the payload itself is intact.
   */
  function verifyContract(payload, health) {
    if (!payload || !Array.isArray(payload.actions) || !Array.isArray(payload.groups)) {
      return Promise.resolve({ ok: false, state: 'malformed', why: 'the contract had no actions array' });
    }
    var declared = payload.fingerprint || null;
    var counted = payload.actions.length;
    var claimed = payload.count == null ? null : Number(payload.count);

    // The cheapest omission check there is, and it needs no crypto at all.
    if (claimed != null && claimed !== counted) {
      return Promise.resolve({
        ok: false, state: 'truncated', declared: declared, count: counted, claimed: claimed,
        why: 'the API said ' + claimed + ' controls and sent ' + counted,
      });
    }

    return fingerprintOf({ groups: payload.groups, actions: payload.actions }).then(function (have) {
      if (health && health.fingerprint && declared && health.fingerprint !== declared) {
        return {
          ok: false, state: 'mismatched-build', declared: declared, have: have, count: counted,
          why: 'the contract is from a different build than the one answering writes',
        };
      }
      if (have == null) {
        return {
          ok: true, state: 'unverifiable', declared: declared, have: null, count: counted,
          why: 'this browser will not hash (WebCrypto needs https or localhost), so the contract is taken as sent',
        };
      }
      if (declared && have !== declared) {
        return {
          ok: false, state: 'tampered', declared: declared, have: have, count: counted,
          why: 'the contract does not hash to the fingerprint it shipped with',
        };
      }
      return { ok: true, state: 'verified', declared: declared, have: have, count: counted };
    });
  }

  /* =======================================================================
     9 · CONTROL CARD — one function renders all of them
     -----------------------------------------------------------------------
     Markup matches assets/dashboard.css §3 and §4 exactly (`.ad-control`,
     `.ad-params`, `.ad-param`, `.ad-result`), so the console inherits the design
     system rather than growing a second one beside it.
     ======================================================================= */

  var PARAM_HINT = {
    reason: 'Optional. This reaches Discord’s own audit log.',
    pattern: 'Matched against names. Not a regular expression.',
    duration: 'Like 10m, 1h, 7d — or milliseconds.',
    member: 'A Discord user id. Turn on Developer Mode, then right-click → Copy User ID.',
    channel: 'A Discord channel id. Right-click the channel → Copy Channel ID.',
    category: 'A Discord category id. Right-click the category → Copy Channel ID.',
    role: 'A Discord role id. Server Settings → Roles → ⋯ → Copy Role ID.',
  };

  var WIDE_TYPES = { string: true, reason: true, pattern: true };

  function fieldId(actionId, name) { return 'f_' + slug(actionId) + '__' + slug(name); }
  function hintId(actionId, name) { return fieldId(actionId, name) + '__hint'; }
  function errId(actionId, name) { return fieldId(actionId, name) + '__err'; }
  function bodyId(actionId) { return 'ctlb-' + slug(actionId); }

  /**
   * ⚠ THE SNOWFLAKE TYPES ARE A TEXT BOX AND NOT A PICKER, AND SAYING WHY IS
   * BETTER THAN FAKING ONE. A picker needs the guild's channel and role lists;
   * this API publishes neither (`/v1/me` returns guild IDS ONLY — see
   * `authz.actionableGuilds`). The preview build had lists because it had
   * fixtures. Inventing them here would be the mock-data defect wearing a
   * `<select>`, so the field takes an id, validates its shape locally, and tells
   * the admin exactly how to get one. `datalist` remembers ids THEY have typed,
   * which is the only source of truth this page legitimately has.
   */
  function paramFieldHtml(action, p) {
    var id = fieldId(action.id, p.name);
    var hId = hintId(action.id, p.name);
    var eId = errId(action.id, p.name);
    var kind = inputKindFor(p.type);
    var label = esc(lbl(p));
    var hint = p.help || PARAM_HINT[p.type] || null;
    var wide = !!WIDE_TYPES[p.type];

    // ⚠ THE ASTERISK IS DECORATION AND `required` IS THE FACT. A screen reader
    // gets nothing usable out of a `*` with a `title` on it; it gets "required"
    // out of the attribute. Both are rendered because sighted admins scan for
    // the glyph and assistive tech reads the attribute — neither substitutes.
    var req = p.required ? '<span class="ad-param__req" aria-hidden="true">*</span>' : '';
    var typeTag = '<span class="ad-param__type" title="' + esc('The value this field takes: ' + p.type) + '">'
      + esc(p.type) + '</span>';

    // ⚠ EVERY FIELD POINTS AT ITS OWN HELP AND ITS OWN ERROR BY ID. The help was
    // already on the page and already read from the contract; what it was not
    // was ATTACHED to the input, so a keyboard admin tabbing into a snowflake
    // box heard "Channel, edit text" and never the sentence telling them where a
    // channel id comes from. `aria-describedby` is what makes the description a
    // description rather than adjacent text.
    var describedBy = (hint ? hId + ' ' : '') + eId;
    var attrs = ' id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="' + esc(p.type) + '"'
      + ' aria-describedby="' + describedBy + '"'
      + (p.required ? ' required aria-required="true"' : '');
    var hintHtml = hint ? '<span class="as-hint ad-param__hint" id="' + hId + '">' + esc(hint) + '</span>' : '';
    var errHtml = '<span class="as-error" id="' + eId + '" data-ad-err hidden></span>';

    if (kind === 'switch') {
      return '<div class="ad-param ad-param--switch">'
        + '<div class="as-field">'
        + '<label class="as-switch" for="' + id + '">'
        + '<input type="checkbox"' + attrs + '>'
        + '<span class="as-switch__label">' + label + req + '</span></label>'
        + hintHtml
        + errHtml
        + '</div></div>';
    }

    var control;
    if (kind === 'choice') {
      var choices = (p.choices || []).map(function (c) {
        var v = (c != null && typeof c === 'object' && c.value != null) ? c.value : c;
        var n = (c != null && typeof c === 'object') ? (c.label != null ? c.label : (c.name != null ? c.name : v)) : v;
        return '<option value="' + esc(v) + '">' + esc(n) + '</option>';
      }).join('');
      control = '<select class="as-select"' + attrs + '>'
        + '<option value="">' + (p.required ? 'Choose…' : 'Leave unchanged') + '</option>'
        + choices + '</select>';
      if ((p.choices || []).length > 6) wide = true;
    } else if (kind === 'snowflake') {
      var listId = 'ad-ids-' + esc(p.type);
      control = '<input class="as-input as-input--mono" type="text" inputmode="numeric" list="' + listId + '"'
        + attrs + ' autocomplete="off" spellcheck="false" placeholder="000000000000000000">';
    } else if (kind === 'number') {
      var bounds = p.type === 'count'
        ? ' min="1" step="1"'
        : (p.min != null ? ' min="' + esc(p.min) + '"' : '') + (p.max != null ? ' max="' + esc(p.max) + '"' : '');
      var ph = p.type === 'count' ? '1 or more'
        : (p.min != null || p.max != null)
          ? (p.min != null ? p.min : '') + '–' + (p.max != null ? p.max : '')
          : 'A number';
      control = '<input class="as-input" type="number"' + attrs + bounds + ' placeholder="' + esc(ph) + '">';
    } else if (kind === 'duration') {
      control = '<input class="as-input" type="text" list="ad-durations"' + attrs + ' placeholder="10m">';
    } else if (kind === 'multiline') {
      control = '<textarea class="as-input as-textarea" rows="2"' + attrs
        + (p.type === 'reason' ? ' maxlength="512"' : '')
        + ' placeholder="' + esc(p.type === 'reason' ? 'Why — this reaches Discord’s audit log' : lbl(p)) + '"></textarea>';
    } else if (p.secret) {
      // ⚠ NO `value`, EVER — not on first render and not on a re-render after a
      // run. The browser's own password manager is the only thing that may put
      // characters in this box, and nothing this file writes reads them back out
      // into markup. `type="password"` also keeps it off a screen share.
      control = '<input class="as-input" type="password"' + attrs
        + ' autocomplete="off" autocapitalize="off" spellcheck="false" data-ad-secret="1"'
        + ' placeholder="Paste it here — it is never shown again">';
    } else {
      control = '<input class="as-input" type="text"' + attrs
        + ' placeholder="' + esc(lbl(p)) + '">';
    }

    var secretNote = p.secret
      ? '<span class="as-hint ad-secret-note">Never displayed, never logged, and dropped from the audit line — '
        + 'only the fact that something was withheld is recorded.</span>'
      : '';

    // ⚠ THE LABEL TEXT AND THE TYPE TAG ARE SEPARATE CELLS, NOT TWO INLINE
    // RUNS. The tag used to right-align with `margin-left:auto` against whatever
    // the label happened to be, so in a two-column param grid the tags landed on
    // two different x-positions per row and a long label pushed its own tag off
    // the card. A named span the CSS can truncate is what makes a column of
    // labels read as a column.
    return '<div class="ad-param' + (wide ? ' ad-param--wide' : '') + '">'
      + '<div class="as-field">'
      + '<label class="as-label" for="' + id + '">'
      + '<span class="ad-param__name">' + label + req + '</span>' + typeTag
      + '</label>'
      + control
      + hintHtml
      + secretNote
      + errHtml
      + '</div></div>';
  }

  function badge(text, cls, title) {
    return '<span class="as-badge ' + (cls || '') + '"'
      + (title ? ' title="' + esc(title) + '"' : '') + '>' + esc(text) + '</span>';
  }

  /**
   * The verb on the primary button.
   *
   * ⚠ "Preview" AND "Run" ARE DIFFERENT PROMISES and the two surfaces must not
   * disagree about what a press means. `packages/api/src/routes.js` makes the
   * same call server-side: a POST with no `commit` is the FIRST press, and it
   * previews for anything that declares `dryRun`.
   */
  function primaryVerb(control) {
    if (!control) return 'Run';
    if (control.dryRun) return 'Preview';
    return (control.params && control.params.length) ? 'Apply' : 'Run';
  }

  /**
   * The pills that ride on the COLLAPSED row.
   *
   * ⚠ AT MOST TWO, AND SEVERITY IS ALWAYS THE FIRST. A row carrying six badges
   * is a row nobody reads: the earlier card put Destructive, Previews first,
   * Rolls back, Bulk, the permission level and the bot-permission list side by
   * side in one wrap, all at the same weight, and the one that decides whether
   * you should be careful was indistinguishable from the one naming a Discord
   * permission bit. The full set still renders — inside the card, next to the
   * fields, which is where somebody deciding needs it.
   */
  function rowPillsHtml(action, cons, permitted, withheld) {
    var out = [];
    if (!permitted) out.push(badge('Not yours', 'as-badge--plain', 'Your Discord permissions do not reach this control.'));
    else if (withheld) out.push(badge('Held off', 'as-badge--plain', WITHHELD_MODULES[action.module]));
    else if (cons.severity === 'danger') out.push(badge('Destructive', 'as-badge--danger', cons.line));
    else if (cons.severity === 'caution') out.push(badge('Changes things', 'as-badge--warn', cons.line));
    else out.push(badge('Read-only', 'as-badge--success', cons.line));

    if (action.permission !== 'admin') {
      out.push(badge(action.permission + ' only', 'as-badge--plain',
        'This control is above plain Administrator in the runner’s own ladder.'));
    } else if (action.bulk) {
      out.push(badge('Bulk', 'as-badge--warn', 'One press may touch many objects.'));
    }
    return out.join('');
  }

  /**
   * @param action  a control, verbatim from the contract
   * @param opts    { actor, showGroup, groups, open }
   *
   * ⚠ THE CARD IS A DISCLOSURE, AND WHAT COLLAPSES IS THE FORM — NEVER THE
   * DESCRIPTION. 369 fully-drawn cards is ~740 KB of markup and a scroll
   * distance nobody browses; that wall IS the "way too confusing" the owner
   * reported. So the row always shows the glyph, the label, the whole `help`
   * sentence the registry wrote, the severity and the id — everything you need
   * to decide whether this is the control you meant — and hides only the inputs,
   * the full flag set and the button until you say so.
   *
   * ⚠ AND THE RUN BUTTON LIVES INSIDE THE DISCLOSURE, EXACTLY ONE PER CARD.
   * Putting a second one on the row for the 76 controls that take no parameters
   * was drafted and dropped: two elements carrying `data-ad-run` for one id
   * means `card.querySelector('[data-ad-run]')` disables one and the arming
   * press relabels the other, so a destructive control would sit half-armed with
   * no way to see which half. One button also means every run — including the
   * one-press read-only ones — is preceded by a deliberate open, which is the
   * cheapest possible guard against a stray click in a list of 128 destructive
   * controls.
   */
  function controlCardHtml(action, opts) {
    var o = opts || {};
    var actor = o.actor || { isAdmin: true, isAiDev: false, isOwner: false };
    var permitted = maySee(action, actor);
    var withheld = isWithheld(action.module);
    var runnable = permitted && !withheld;
    var cons = consequences(action);
    var open = !!o.open;
    var bId = bodyId(action.id);
    var params = (action.params && action.params.length) ? action.params : [];

    var flags = [];
    if (action.destructive) flags.push(badge('Destructive', 'as-badge--danger', 'Marked destructive in the bot’s own registry.'));
    if (action.dryRun) flags.push(badge('Previews first', 'as-badge--frost', 'The first press shows a plan. Nothing commits until the second.'));
    if (action.confirm && !action.dryRun) flags.push(badge('Confirms', 'as-badge--warn', 'Press once to arm, once more to run.'));
    if (action.composite) flags.push(badge('Rolls back', 'as-badge--accent', 'Several steps, undone together if one fails.'));
    if (action.bulk) flags.push(badge('Bulk', 'as-badge--warn', 'May touch many objects at once.'));
    if (action.permission !== 'admin') flags.push(badge(action.permission + ' only', 'as-badge--plain'));
    if (!permitted) flags.push(badge('Above your level', 'as-badge--plain'));
    if (withheld) flags.push(badge('Held off', 'as-badge--plain'));
    var need = botNeeds(action);
    if (need.length) {
      flags.push('<span class="as-badge as-badge--plain" title="What Discord must allow the bot">bot: '
        + esc(need.join(' + ')) + '</span>');
    }

    var groupMeta = null;
    var groups = o.groups || [];
    for (var i = 0; i < groups.length; i += 1) if (groups[i].id === action.group) groupMeta = groups[i];

    // ⚠ ONE CARD, TWO STEPS, NO MODAL. `adminpanel.js` grows the commit button
    // inside the same card on the second press; a modal here would be a second
    // contract for one gesture, and LAW 2's "no screen hand-rolls its nav" is the
    // same instinct. The preview's plan renders into the result strip in place.
    var verb = primaryVerb(action);
    var danger = action.destructive ? 'as-btn--danger' : (action.dryRun ? 'as-btn--secondary' : 'as-btn--primary');
    var button = runnable
      ? '<button class="as-btn as-btn--sm ' + danger + '" type="button"'
        + ' data-ad-run="' + esc(action.id) + '"'
        + (action.dryRun ? ' data-ad-dry="1"' : '')
        + (action.confirm && !action.dryRun ? ' data-ad-arm="1"' : '')
        + '>' + esc(verb) + '</button>'
      : '<span class="u-text-xs as-muted">'
        + (withheld ? esc(WITHHELD_MODULES[action.module]) : 'Your Discord permissions do not reach this control.')
        + '</span>';

    var fieldNote = params.length
      ? params.length + ' field' + (params.length === 1 ? '' : 's')
        + (params.some(function (p) { return p.required; }) ? ' · one required' : '')
      : 'No inputs';

    return '<article class="ad-control ad-control--row'
      + (action.destructive ? ' is-destructive' : '')
      + (runnable ? '' : ' is-locked')
      + '" data-ad-card="' + esc(action.id) + '"'
      + ' data-ad-sev="' + esc(runnable ? cons.severity : 'locked') + '"'
      + ' id="ctl-' + slug(action.id) + '">'

      // ── the row: everything needed to decide, nothing that needs deciding ──
      + '<div class="ad-control__row">'
      + '<button class="ad-control__disc" type="button" data-ad-toggle="' + esc(action.id) + '"'
      + ' aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + bId + '">'
      + '<span class="ad-control__glyph" aria-hidden="true">' + (action.emoji ? esc(action.emoji) : '•') + '</span>'
      + '<span class="ad-control__lines">'
      + '<span class="ad-control__title">' + esc(action.label) + '</span>'
      + (action.help ? '<span class="ad-control__help">' + esc(action.help) + '</span>' : '')
      + '<span class="ad-control__id">' + esc(action.id)
      + (o.showGroup && groupMeta ? ' · ' + esc(groupMeta.emoji + ' ' + groupMeta.label) : '')
      + ' · ' + esc(action.module)
      + ' · <span class="ad-control__fields">' + esc(fieldNote) + '</span>'
      + '</span>'
      + '</span>'
      + '<span class="ad-control__pills">' + rowPillsHtml(action, cons, permitted, withheld) + '</span>'
      // ⚠ THE CHEVRON IS DRAWN IN CSS, NOT SHIPPED AS MARKUP. An inline SVG here
      // is ~180 bytes × 369 rows = 66 KB of identical path data in one
      // `innerHTML` assignment, for a shape that is two borders and a rotation.
      + '<span class="ad-control__chev" aria-hidden="true"></span>'
      + '</button>'
      + '</div>'

      // ── the body: the form, the whole flag set, the outcome ──
      + '<div class="ad-control__body" id="' + bId + '"' + (open ? '' : ' hidden') + '>'
      + '<p class="ad-control__conseq ad-control__conseq--' + esc(cons.severity) + '">'
      + esc(cons.line) + '</p>'
      + (flags.length ? '<div class="ad-control__flags">' + flags.join('') + '</div>' : '')
      + (params.length
        ? '<div class="ad-params">' + params.map(function (p) { return paramFieldHtml(action, p); }).join('') + '</div>'
        : '<p class="ad-empty-params">No parameters — this control acts on the server as a whole.</p>')
      // ⚠ THE OUTCOME IS A LIVE REGION. A run answers by replacing this node's
      // markup; without `role="status"` a screen-reader admin presses a button
      // that changes the server and is told nothing at all.
      + '<div data-ad-result role="status" aria-live="polite"></div>'
      + '<div class="ad-control__foot">'
      + '<span class="ad-spacer"></span>' + button
      + '</div>'
      + '</div>'
      + '</article>';
  }

  /* =======================================================================
     10 · THE RESULT STRIP — the typed outcome vocabulary, rendered
     -----------------------------------------------------------------------
     ⚠ A REFUSAL IS AN ANSWER, NOT AN ERROR. CLAUDE.md's debugging section names
     the four outcomes and says they are "distinguishable BY DESIGN": ok ·
     ok:false + refusal (a gate said no) · ok:false + err_code (it threw) ·
     unrouted. Collapsing a refusal into "something went wrong" throws away the
     one thing the admin needs, which is WHICH GATE and WHAT TO DO.
     ======================================================================= */

  var REFUSAL_COPY = {
    permission: ['Refused — permission', 'The runner checked your level and said no. This is the same gate Discord uses.'],
    params: ['Check the fields above', 'These are the bot’s own validators — the web surface cannot accept something Discord would refuse.'],
    entitlement: ['Refused — not on this plan', 'The module this control belongs to is not enabled for this server.'],
    'bot-permission': ['Refused — the bot cannot do this', 'Discord has not granted the bot the permission this control needs. Nothing was attempted.'],
    'bot-hierarchy': ['Refused — role position', 'The bot’s highest role sits below the role it was asked to touch. Drag the bot above it in Server Settings → Roles.'],
    'confirm-required': ['Confirmation required', 'This control has no preview to stand in for a confirmation, so it must be sent with confirm.'],
    'body-too-large': ['Refused — too much data', 'The API caps a request body at 64 KiB.'],
    'bad-json': ['Refused — malformed request', 'The body was not valid JSON. This is a bug in the page, not in what you typed.'],
    'session-none': ['Signed out', 'There is no session on this browser any more. Sign in again.'],
    'session-expired': ['Session expired', 'Sessions last 8 hours. Sign in again.'],
    'session-idle': ['Session idle', 'An hour of inactivity ends a session. Sign in again.'],
    'session-bad-csrf': ['Refused — CSRF check', 'The page could not prove this request came from it. Reload and try again.'],
    'authz-not-served': ['Not this deployment’s server', 'This install does not serve that guild.'],
    'authz-not-a-member': ['Not a member', 'Your Discord account is not in that server.'],
    'authz-not-admin': ['Refused — not an administrator', 'This console needs Discord’s ADMINISTRATOR permission on that server. Manage Server is deliberately not accepted.'],
    'authz-no-guild-scope': ['Sign in again', 'Discord did not grant the `guilds` scope, so your permissions could not be read. That is no evidence, not a "no".'],
    'authz-stale-permissions': ['Permissions are stale', 'Your Discord roles were read too long ago. Reload to refresh them.'],
    'authz-guild-unknown': ['Cannot tell which servers this install serves', 'The write is refused rather than guessed.'],
    'rate-limited': ['Slow down', 'The API limits how fast destructive controls can be run.'],
  };

  function outcomeOf(result) {
    if (!result) return 'error';
    if (result.ok && result.dryRun) return 'dry';
    if (result.ok) return 'ok';
    if (result.refused) return 'refused';
    return 'error';
  }

  /**
   * ONE vocabulary for the four outcomes, used by every surface on the page.
   *
   * ⚠ THE CONSOLE HAD FOUR OF THESE AND THEY DID NOT LINE UP. The result strip
   * said `--ok / --dry / --warn / --err`, the activity log said
   * `success / frost / warn / danger`, the lamp said
   * `online / degraded / offline / unknown`, and `dashboard.css` shipped a fifth
   * (`.ad-outcome--ref`) that nothing ever emitted. Four names for four states
   * is how a fifth gets invented, and it is why "refused" reads as an error in
   * one place and a warning two inches away. `test/v172` pins this table
   * against `outcomeOf`'s own return values so neither can grow an arm alone.
   */
  var OUTCOME_TONE = {
    ok:      { chip: 'ad-outcome--ok',  strip: 'ad-result--ok',   word: 'done',     say: 'It ran, and it changed what it said it would.' },
    dry:     { chip: 'ad-outcome--dry', strip: 'ad-result--dry',  word: 'preview',  say: 'A plan only. Nothing has changed yet.' },
    refused: { chip: 'ad-outcome--ref', strip: 'ad-result--warn', word: 'refused',  say: 'A gate said no, and named which one. Nothing changed.' },
    error:   { chip: 'ad-outcome--err', strip: 'ad-result--err',  word: 'failed',   say: 'It threw, or nothing answered.' },
  };

  function outcomeTone(result) { return OUTCOME_TONE[outcomeOf(result)] || OUTCOME_TONE.error; }

  function resultHtml(result, action) {
    var kind = outcomeOf(result);

    if (kind === 'dry') {
      var plan = Array.isArray(result.plan) ? result.plan : null;
      return '<div class="ad-result ' + OUTCOME_TONE.dry.strip + '">'
        + '<div class="ad-result__body">'
        + '<div class="ad-result__title">Preview — nothing has changed</div>'
        + (plan
          ? '<ol class="ad-plan-list">' + plan.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>'
          : '<div class="u-text-sm">' + esc(result.preview || result.note || 'The runner produced a plan with no steps to list.') + '</div>')
        + (result.affected != null ? '<div class="u-text-xs as-muted u-mt-2">Would affect ' + esc(result.affected) + '.</div>' : '')
        // ⚠ THE COMMIT BUTTON IS GROWN BY THE PREVIEW AND EXISTS NOWHERE ELSE ON
        // THE CARD, so "I previewed but never pressed the second thing" cannot be
        // confused with "I ran it". Same shape as adminpanel.js's adm:commit.
        + (action
          ? '<div class="as-row u-mt-3">'
            + '<button class="as-btn as-btn--sm ' + (action.destructive ? 'as-btn--danger' : 'as-btn--primary') + '"'
            + ' type="button" data-ad-run="' + esc(action.id) + '" data-ad-commit="1">Do it</button>'
            + '<span class="u-text-xs as-muted">Nothing has changed yet.</span>'
            + '</div>'
          : '')
        + '</div></div>';
    }

    if (kind === 'ok') {
      var changes = Array.isArray(result.changes) ? result.changes : null;
      return '<div class="ad-result ' + OUTCOME_TONE.ok.strip + '">'
        + '<div class="ad-result__body">'
        + '<div class="ad-result__title">Done'
        + (result.affected != null ? ' — ' + esc(result.affected) + ' affected' : '') + '</div>'
        + (result.note ? '<div class="u-text-sm">' + esc(result.note) + '</div>' : '')
        + (result.message ? '<div class="u-text-sm">' + esc(result.message) + '</div>' : '')
        + (changes ? '<ol class="ad-plan-list">' + changes.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' : '')
        + (result.redirect
          ? '<div class="u-text-xs as-muted u-mt-2">This control opens a screen inside Discord ('
            + esc(result.redirect) + '). It has no web equivalent yet — run <code>/menu</code> there.</div>'
          : '')
        + '</div></div>';
    }

    if (kind === 'refused') {
      var copy = REFUSAL_COPY[String(result.refused)] || ['Refused', 'The runner declined. Its reason is below.'];
      return '<div class="ad-result ' + OUTCOME_TONE.refused.strip + '">'
        + '<div class="ad-result__body">'
        + '<div class="ad-result__title">' + esc(copy[0]) + '</div>'
        + (result.error ? '<div class="u-text-sm">' + esc(result.error) + '</div>' : '')
        + (result.why ? '<div class="u-text-sm">' + esc(result.why) + '</div>' : '')
        + '<div class="u-text-xs as-muted u-mt-2">' + esc(copy[1]) + '</div>'
        + (result.missing && result.missing.length
          ? '<div class="u-text-xs as-muted u-mt-2">Missing: ' + esc(result.missing.join(', ')) + '</div>' : '')
        + '<div class="u-text-xs as-muted u-mt-2">Refusal code <code>' + esc(result.refused) + '</code>. Nothing changed.</div>'
        + '</div></div>';
    }

    return '<div class="ad-result ' + OUTCOME_TONE.error.strip + '">'
      + '<div class="ad-result__body">'
      + '<div class="ad-result__title">It failed</div>'
      + '<div class="u-text-sm">' + esc(result && (result.error || result.message) || 'The API gave no reason.') + '</div>'
      + (result && result.err_code
        ? '<div class="u-text-xs as-muted u-mt-2">Error code <code>' + esc(result.err_code) + '</code>.</div>' : '')
      + '</div></div>';
  }

  /* =======================================================================
     11 · THE API CLIENT — `fetch` is injected, and every failure is TYPED
     -----------------------------------------------------------------------
     ⚠ THERE IS NO SUCCESS PATH THAT INVENTS DATA. Every method returns either
     `{ok:true, …}` or `{ok:false, reason, …}`, and `reason` is one of a closed
     set the page renders a sentence for. `packages/web/assets/mock-data.js` is
     not loaded by this console and must never become its "offline mode": a
     dashboard that answers from fixtures while the bot is unreachable is the
     221-vs-307 defect with a network cable in it — plausible, wrong, and silent.
     ======================================================================= */

  var REASON = {
    UNREACHABLE: 'unreachable',   // the request never got an answer
    HTTP: 'http',                 // an answer, with a status the caller must read
    BAD_BODY: 'bad-body',         // an answer that was not the JSON we asked for
    NO_CSRF: 'no-csrf',           // this page cannot read the CSRF cookie
  };

  /**
   * @param {object} o
   * @param {Function} o.fetch     injected — the tests hand this one that throws
   * @param {string}   o.base      API origin. '' means "same origin as this page"
   * @param {Function} [o.csrf]    () => string|null. Reads the readable cookie.
   */
  function createClient(o) {
    var opts = o || {};
    var doFetch = opts.fetch;
    var base = String(opts.base == null ? '' : opts.base).replace(/\/+$/, '');
    var readCsrf = typeof opts.csrf === 'function' ? opts.csrf : function () { return null; };

    function url(path) { return base + path; }

    async function request(method, path, body, extraHeaders) {
      var headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (extraHeaders) for (var k in extraHeaders) if (Object.prototype.hasOwnProperty.call(extraHeaders, k)) headers[k] = extraHeaders[k];

      var res;
      try {
        res = await doFetch(url(path), {
          method: method,
          // ⚠ WITHOUT THIS THE SESSION COOKIE IS NOT SENT AND EVERY CALL IS A 401
          // THAT LOOKS LIKE "YOU ARE SIGNED OUT". Cost an hour once; stated here
          // so it is not re-derived.
          credentials: 'include',
          cache: 'no-store',
          headers: headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (err) {
        // ⚠ A THROWN fetch IS THE ONLY HONEST "UNREACHABLE". DNS, refused
        // connection, a CORS preflight the API declined, a mixed-content block —
        // the browser deliberately tells a page nothing more, so the message
        // names the ORIGIN rather than guessing at the cause.
        return { ok: false, reason: REASON.UNREACHABLE, origin: base || '(this page’s own origin)', detail: err && err.message ? String(err.message) : null };
      }

      var text = '';
      try { text = await res.text(); } catch (e) { text = ''; }
      var data = null;
      if (text) { try { data = JSON.parse(text); } catch (e2) { data = null; } }

      if (data === null && text) {
        return { ok: false, reason: REASON.BAD_BODY, status: res.status, origin: base || '(this page’s own origin)' };
      }
      if (!res.ok) {
        return { ok: false, reason: REASON.HTTP, status: res.status, code: (data && data.code) || null, body: data };
      }
      return { ok: true, status: res.status, body: data || {} };
    }

    return {
      base: base,
      REASON: REASON,

      health: function () { return request('GET', '/v1/health'); },
      me: function () { return request('GET', '/v1/me'); },

      /** Begin sign-in. Returns the Discord URL the browser must navigate to. */
      loginUrl: function () { return request('POST', '/v1/auth/login', {}); },

      /**
       * Finish sign-in.
       * ⚠ THE PAGE ITSELF IS THE REDIRECT URI, and the exchange happens over
       * `fetch` rather than by letting the browser land on the API's JSON. The
       * server answers `/v1/auth/callback` with `application/json` + `Set-Cookie`
       * — correct for an API and a raw JSON blob in the face of anyone who logs
       * in. Fetching it keeps the cookies and keeps the page.
       */
      completeLogin: function (code, state) {
        return request('GET', '/v1/auth/callback?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state));
      },

      logout: function () {
        var csrf = readCsrf();
        return request('POST', '/v1/auth/logout', {}, csrf ? { 'x-asbern-csrf': csrf } : null);
      },

      contract: function (guildId) {
        return request('GET', '/v1/guilds/' + encodeURIComponent(guildId) + '/actions');
      },

      /**
       * Run one control.
       *
       * ⚠ `commit` IS AN OPT-IN AND IS NEVER SPELLED `dryRun:false`. The API
       * makes the same choice and says why: "a client that forgets the field
       * previews, and a client that sends garbage previews." So this method's
       * default is the FIRST press.
       */
      run: function (guildId, actionId, params, runOpts) {
        var ro = runOpts || {};
        var csrf = readCsrf();
        // ⚠ REFUSED BEFORE THE REQUEST, WITH THE REAL REASON. Without the
        // readable CSRF cookie the server answers 403 `session-bad-csrf`, which
        // reads like a bug in the page. It is almost always one thing: the
        // console is being served from a different origin than the API, so the
        // browser will not hand it that cookie. Say that, rather than let the
        // admin debug a CSRF error.
        if (!csrf) return Promise.resolve({ ok: false, reason: REASON.NO_CSRF, origin: base || '(this page’s own origin)' });
        var body = { params: params || {} };
        if (ro.commit === true) body.commit = true;
        if (ro.confirm === true) body.confirm = true;
        return request('POST', '/v1/guilds/' + encodeURIComponent(guildId) + '/actions/' + encodeURIComponent(actionId), body, { 'x-asbern-csrf': csrf });
      },

      /** The live channel's URL, derived from `base` — never hardcoded. */
      liveUrl: function (guildId, pageOrigin) {
        var origin = base || String(pageOrigin || '');
        var ws = origin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
        return ws + '/v1/live?guild=' + encodeURIComponent(guildId);
      },
    };
  }

  /**
   * One sentence for a transport failure, with the origin in it.
   *
   * ⚠ NAMING THE ORIGIN IS THE WHOLE POINT. "Could not reach the API" sends a
   * self-hoster to their logs; "could not reach http://127.0.0.1:47617" tells
   * them the port is wrong, the bot is down, or `webApi.enabled` is false — and
   * those are the only three answers.
   */
  function failureSentence(failure) {
    if (!failure || failure.ok) return null;
    switch (failure.reason) {
      case REASON.UNREACHABLE:
        return 'Could not reach the Asbern API at ' + (failure.origin || 'its configured address')
          + '. The bot may be down, `general.webApi.enabled` may be false, or this page’s origin may not be in the API’s `origins` allowlist.';
      case REASON.BAD_BODY:
        return 'The address answered, but not with the API (HTTP ' + failure.status + '). Something else is on that port.';
      case REASON.NO_CSRF:
        return 'This page cannot read its CSRF cookie, so it will not attempt a write. Serve the console from the same origin as the API — a browser will not hand a cross-site page that cookie.';
      case REASON.HTTP:
        if (failure.status === 401) return 'Not signed in.';
        if (failure.status === 404) return 'This deployment does not serve that server, or you are not in it.';
        if (failure.status === 403) return 'Refused: ' + (failure.code || 'not permitted') + '.';
        if (failure.status === 429) return 'Rate limited. The API caps destructive writes at ten a minute.';
        return 'The API refused with HTTP ' + failure.status + (failure.code ? ' (' + failure.code + ')' : '') + '.';
      default:
        return 'The API call failed for a reason this page does not have wording for: ' + String(failure.reason) + '.';
    }
  }

  /* =======================================================================
     12 · THE EXPORT
     ======================================================================= */

  return {
    // escaping / ids
    esc: esc,
    slug: slug,
    fieldId: fieldId,

    // the ported type table
    TYPES: TYPES,
    PARAM_TYPES: PARAM_TYPES,
    validate: validate,

    // widgets
    INPUT_KINDS: INPUT_KINDS,
    inputKindFor: inputKindFor,
    planControl: planControl,

    // permissions / navigation
    maySee: maySee,
    groupControls: groupControls,
    searchControls: searchControls,

    // consequence + severity (one computation, two renderings)
    SEVERITIES: SEVERITIES,
    consequences: consequences,
    severityOf: severityOf,

    // faceted filtering, derived from contract fields only
    FACETS: FACETS,
    facetById: facetById,
    filterControls: filterControls,
    facetPlan: facetPlan,

    // modules
    WITHHELD_MODULES: WITHHELD_MODULES,
    isWithheld: isWithheld,
    moduleIndex: moduleIndex,

    // auto-read
    READ_SUFFIXES: READ_SUFFIXES,
    isSafeAutoRead: isSafeAutoRead,
    autoReadControls: autoReadControls,

    // secrets
    summariseParams: summariseParams,
    displayValue: displayValue,

    // contract identity
    canonical: canonical,
    fingerprintOf: fingerprintOf,
    verifyContract: verifyContract,

    // rendering
    hintId: hintId,
    errId: errId,
    bodyId: bodyId,
    paramFieldHtml: paramFieldHtml,
    controlCardHtml: controlCardHtml,
    resultHtml: resultHtml,
    outcomeOf: outcomeOf,
    OUTCOME_TONE: OUTCOME_TONE,
    outcomeTone: outcomeTone,
    rowPillsHtml: rowPillsHtml,
    primaryVerb: primaryVerb,
    consequenceLine: consequenceLine,
    REFUSAL_COPY: REFUSAL_COPY,

    // transport
    REASON: REASON,
    createClient: createClient,
    failureSentence: failureSentence,
  };
}));
