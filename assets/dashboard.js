/* =============================================================================
   ASBERN · assets/dashboard.js
   -----------------------------------------------------------------------------
   THE CLIENT DASHBOARD — dashboard.html, billing.html, bridge.html.

   ⚠ THE ONE ARCHITECTURAL RULE THIS FILE EXISTS TO OBEY
   PLAN.md, Phase 8: "Dashboard **generated from the … control registry**."
   ARCHITECTURE.md, on the registry: "one definition, four surfaces … the surface
   decides how to ask, the registry decides what to ask for."

   So NOTHING below hand-writes a control. `REGISTRY` is the verbatim output of
   `adminactions.describe()` from the live bot — 11 groups, 221 actions, dumped
   with:

       node -e "require('./src/lib/admin');
                console.log(JSON.stringify(require('./src/lib/adminactions').describe()))"

   …and every card, every input, every gate and every refusal on the Controls
   view is derived from that data. Adding a 218th control to the bot adds a card
   here with no UI code, which is the entire point of the registry existing.

   `TYPES` below is a LINE-FOR-LINE PORT of `adminactions.js`'s TYPES table, not
   a re-interpretation. Same coercion, same messages, same order. If the two ever
   disagree, the web surface would accept something Discord refuses, and the
   customer would learn about it from an error rather than from a field.

   ⚠ THIS IS A PREVIEW BUILD. There is no Discord connection and no API. The
   permission gate, the entitlement gate and the param validation are REAL and
   run exactly where the bot runs them. What is simulated is the last step — the
   Discord call itself. Every screen says so; see `SIMULATED` below.

   NO BUILD STEP, NO DEPENDENCIES, NO NETWORK. Opens off file://.
   Depends only on assets/asbern.js (theme, icons, toasts, modals, tabs) and
   assets/mock-data.js (shared fixtures). Neither is modified by this file.
   ========================================================================== */
'use strict';

var AsbernDash = (function () {

  var A = window.Asbern;
  var esc = A.escapeHtml;

  /* =======================================================================
     0 · HONESTY BANNER TEXT — reused everywhere, so it cannot drift
     ======================================================================= */

  var SIMULATED =
    'Preview build. There is no Discord connection: validation, the permission ' +
    'gate and the entitlement gate are the real ones, but the Discord call at ' +
    'the end is simulated.';

  /* =======================================================================
     1 · THE REGISTRY — verbatim adminactions.describe(), 221 actions
     ======================================================================= */

  var REGISTRY = /* ---- GENERATED — 307 actions, 11 groups, fingerprint 1aa8380dd8ef64ec.
     DO NOT EDIT BY HAND. Regenerate with `node scripts/gen-dashboard-registry.js --write`.
     This snapshot was 86 controls behind the live registry and nothing noticed,
     because a snapshot that is wrong by OMISSION is invisible to every check that
     walks the snapshot. test/v170-dashboard-registry.test.js is the check that is
     not — it compares this fingerprint against the live registry. ---- */
  {
  fingerprint: "1aa8380dd8ef64ec",
  groups: [{"id":"overview","label":"Overview","emoji":"🏠"},{"id":"blueprints","label":"Blueprints","emoji":"🧱"},{"id":"members","label":"Members","emoji":"👥"},{"id":"channels","label":"Channels","emoji":"💬"},{"id":"roles","label":"Roles","emoji":"🛡️"},{"id":"guild","label":"Guild","emoji":"🏛️"},{"id":"bot","label":"Bot","emoji":"🤖"},{"id":"media","label":"Media","emoji":"🎬"},{"id":"servers","label":"Servers","emoji":"🎮"},{"id":"data","label":"Data","emoji":"📊"},{"id":"settings","label":"Settings","emoji":"⚙️"}],
  actions: [
    {"id":"channel.slowmode","label":"Set slowmode","help":"Rate-limit a channel. 0 turns it off.","group":"channels","emoji":"🐌","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"seconds","label":"Seconds","type":"number","required":true,"help":"","choices":null,"min":0,"max":21600,"secret":false}]},
    {"id":"channel.lock","label":"Lock channel","help":"Stop @everyone posting here. History stays readable.","group":"channels","emoji":"🔒","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"category.kit","label":"New category (from a template)","help":"Clones an existing category’s channels, creates its access role, wires the permissions, adds the booster-prison voice channel, and registers it with the bot — in one atomic action.","group":"blueprints","emoji":"🧱","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"template","label":"Copy from","type":"category","required":true,"help":"An existing category whose channels and naming to clone","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New category name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"roleName","label":"Access role name","type":"string","required":false,"help":"Defaults to the category name","choices":null,"min":null,"max":null,"secret":false},{"name":"prison","label":"Add a booster-prison voice channel","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"audit.history","label":"Admin activity","help":"Every action this console has performed — who, when, and what changed.","group":"data","emoji":"📜","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false},{"name":"actor","label":"Only this admin","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"overview.find","label":"Find a Control","help":"Search every control by name, description or what it does — then jump straight to it.","group":"overview","emoji":"🔎","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"query","label":"What are you looking for?","type":"string","required":true,"help":"A word or two: \"raid\", \"emoji\", \"slow mode\", \"who is boosting\"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bridge.health","label":"Health","help":"What is still unset, and which integrations are degraded.","group":"overview","emoji":"📋","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.setup","label":"Setup Walkthrough","help":"The guided walk through every required setting, in order.","group":"overview","emoji":"🧭","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.settings","label":"Server Settings","help":"All 55 settings, grouped — every one editable here rather than in a file.","group":"settings","emoji":"⚙️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.stopStream","label":"Stop the Stream","help":"End the screening room for everyone watching.","group":"media","emoji":"📴","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.deadChannels","label":"Dead Channels","help":"Live-TV channels that failed, and how many times.","group":"media","emoji":"📉","module":"live-tv","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.secondScreen","label":"Second Screen","help":"Allow a parallel screening on its own stream.","group":"media","emoji":"🎬","module":"second-screen","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.stopServer","label":"Stop a Server","help":"Pick a running game server and shut it down.","group":"servers","emoji":"⏹️","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.playerBans","label":"Player Bans","help":"Ban a player from the game servers. This is the bot’s own list, not a Discord ban.","group":"servers","emoji":"🚫","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.trusted","label":"Trusted Users","help":"The allowlist that lets a non-admin start servers and grant category access.","group":"members","emoji":"🛡️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.ai","label":"AI Companions","help":"Master switch and spend caps for the voice companions.","group":"bot","emoji":"🤖","module":"admin-console","permission":"aidev","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bridge.installRanks","label":"Install Rank Roles","help":"Create the whole rank ladder as Discord roles in one press.","group":"roles","emoji":"🪖","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"member.kick","label":"Kick","help":"Remove a member. They can rejoin with a new invite.","group":"members","emoji":"👢","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["KickMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.ban","label":"Ban","help":"Ban a member, optionally deleting their recent messages. Works on someone who has already left.","group":"members","emoji":"🔨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["BanMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"purgeDays","label":"Delete messages from the last N days","type":"number","required":false,"help":"","choices":null,"min":0,"max":7,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.softban","label":"Softban (clear messages)","help":"Ban then immediately unban — deletes their recent messages without keeping them out.","group":"members","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["BanMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"purgeDays","label":"Delete messages from the last N days","type":"number","required":false,"help":"","choices":null,"min":1,"max":7,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.unban","label":"Unban","help":"Lift a ban so they can rejoin.","group":"members","emoji":"🕊️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["BanMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"User id","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.timeout","label":"Timeout","help":"Mute a member everywhere for a while. Discord's maximum is 28 days.","group":"members","emoji":"⏱️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ModerateMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"preset","label":"How long","type":"enum","required":false,"help":"","choices":[{"value":"60s","label":"60 seconds"},{"value":"5m","label":"5 minutes"},{"value":"10m","label":"10 minutes"},{"value":"1h","label":"1 hour"},{"value":"1d","label":"1 day"},{"value":"1w","label":"1 week"},{"value":"custom","label":"Custom…"}],"min":null,"max":null,"secret":false},{"name":"custom","label":"Custom duration","type":"duration","required":false,"help":"e.g. 45m, 3d — used when “Custom” is picked","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.untimeout","label":"Remove timeout","help":"Let a timed-out member speak again immediately.","group":"members","emoji":"⏰","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ModerateMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.warn","label":"Warn","help":"Record a warning against a member, and optionally tell them by DM.","group":"members","emoji":"⚠️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"What for","type":"reason","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"dm","label":"Send them a DM","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.warnings","label":"Warning history","help":"Every warning recorded against a member — who gave it, when, and why.","group":"members","emoji":"📋","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"member.clearWarnings","label":"Clear warnings","help":"Delete every warning recorded against a member.","group":"members","emoji":"🧽","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.nickname","label":"Set nickname","help":"Change a member's server nickname. Discord's limit is 32 characters.","group":"members","emoji":"🏷️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageNicknames"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"nickname","label":"New nickname","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.resetNickname","label":"Reset nickname","help":"Drop a member's nickname so their username shows again.","group":"members","emoji":"↩️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageNicknames"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.addRole","label":"Add role","help":"Give one member a role.","group":"members","emoji":"➕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.removeRole","label":"Remove role","help":"Take a role off one member.","group":"members","emoji":"➖","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.voiceMove","label":"Move to channel","help":"Drag one member into another voice channel.","group":"members","emoji":"🚚","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["MoveMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Voice channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.voiceKick","label":"Disconnect from voice","help":"Pull one member out of voice entirely.","group":"members","emoji":"🔌","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["MoveMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.voiceMute","label":"Server mute","help":"Server-mute or unmute a member in voice.","group":"members","emoji":"🔇","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["MuteMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"on","label":"Muted","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.voiceDeafen","label":"Server deafen","help":"Server-deafen or undeafen a member in voice.","group":"members","emoji":"🙉","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["DeafenMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"on","label":"Deafened","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.massMove","label":"Move everyone in a channel","help":"Move every occupant of one voice channel into another. Queued and throttled.","group":"members","emoji":"🚛","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["MoveMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"from","label":"From voice channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"to","label":"To voice channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.lookup","label":"Member lookup","help":"Everything the bot knows about one member — joined, roles, XP, money, activity, warnings.","group":"members","emoji":"🔍","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.churn","label":"Joined / left this week","help":"Who joined recently, and how many left.","group":"members","emoji":"📈","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"days","label":"Over the last N days","type":"count","required":false,"help":"","choices":null,"min":1,"max":90,"secret":false}]},
    {"id":"member.neverPosted","label":"Never posted","help":"Members the message collector has never seen say anything.","group":"members","emoji":"🙊","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"minDays","label":"Only if they joined over N days ago","type":"count","required":false,"help":"","choices":null,"min":1,"max":3650,"secret":false},{"name":"limit","label":"How many to list","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false}]},
    {"id":"member.inactive","label":"Inactive members","help":"Members with no recorded message or voice minute for N days.","group":"members","emoji":"💤","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"days","label":"Inactive for N days","type":"count","required":true,"help":"","choices":null,"min":1,"max":3650,"secret":false},{"name":"limit","label":"How many to list","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false}]},
    {"id":"member.copresence","label":"Who they hang out with","help":"Voice co-presence — who this member actually shares a channel with.","group":"members","emoji":"🤝","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"days","label":"Over the last N days","type":"count","required":false,"help":"","choices":null,"min":1,"max":365,"secret":false},{"name":"limit","label":"How many partners","type":"count","required":false,"help":"","choices":null,"min":1,"max":25,"secret":false}]},
    {"id":"member.bulkRole","label":"Bulk add/remove role","help":"Give or take a role across everyone a filter matches. Dry-runs first.","group":"members","emoji":"🎭","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"role","label":"Has this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"notRole","label":"Does NOT have this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"inactiveDays","label":"No activity for N days","type":"count","required":false,"help":"Needs the activity store","choices":null,"min":null,"max":null,"secret":false},{"name":"joinedWithinDays","label":"Joined within N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"accountYoungerDays","label":"Account younger than N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"namePattern","label":"Display name contains","type":"pattern","required":false,"help":"Plain text, or /regex/ for a pattern","choices":null,"min":null,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"everyone","label":"Yes — EVERY member","type":"boolean","required":false,"help":"Required when no other filter is set","choices":null,"min":null,"max":null,"secret":false},{"name":"op","label":"Operation","type":"enum","required":true,"help":"","choices":[{"value":"add","label":"Add the role"},{"value":"remove","label":"Remove the role"}],"min":null,"max":null,"secret":false},{"name":"target","label":"Role to add/remove","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.bulkTimeout","label":"Bulk timeout","help":"Time out everyone a filter matches. Dry-runs first.","group":"members","emoji":"⏳","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ModerateMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"role","label":"Has this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"notRole","label":"Does NOT have this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"inactiveDays","label":"No activity for N days","type":"count","required":false,"help":"Needs the activity store","choices":null,"min":null,"max":null,"secret":false},{"name":"joinedWithinDays","label":"Joined within N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"accountYoungerDays","label":"Account younger than N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"namePattern","label":"Display name contains","type":"pattern","required":false,"help":"Plain text, or /regex/ for a pattern","choices":null,"min":null,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"everyone","label":"Yes — EVERY member","type":"boolean","required":false,"help":"Required when no other filter is set","choices":null,"min":null,"max":null,"secret":false},{"name":"preset","label":"How long","type":"enum","required":false,"help":"","choices":[{"value":"60s","label":"60 seconds"},{"value":"5m","label":"5 minutes"},{"value":"10m","label":"10 minutes"},{"value":"1h","label":"1 hour"},{"value":"1d","label":"1 day"},{"value":"1w","label":"1 week"},{"value":"custom","label":"Custom…"}],"min":null,"max":null,"secret":false},{"name":"custom","label":"Custom duration","type":"duration","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.bulkKick","label":"Bulk kick","help":"Kick everyone a filter matches. Dry-runs first, always.","group":"members","emoji":"🥾","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["KickMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"role","label":"Has this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"notRole","label":"Does NOT have this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"inactiveDays","label":"No activity for N days","type":"count","required":false,"help":"Needs the activity store","choices":null,"min":null,"max":null,"secret":false},{"name":"joinedWithinDays","label":"Joined within N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"accountYoungerDays","label":"Account younger than N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"namePattern","label":"Display name contains","type":"pattern","required":false,"help":"Plain text, or /regex/ for a pattern","choices":null,"min":null,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"everyone","label":"Yes — EVERY member","type":"boolean","required":false,"help":"Required when no other filter is set","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.prune","label":"Prune inactive","help":"Kick members with no recorded activity for N days. Refuses outright when there is no activity data.","group":"members","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["KickMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"days","label":"Inactive for N days","type":"count","required":true,"help":"","choices":null,"min":7,"max":3650,"secret":false},{"name":"notRole","label":"Never touch anyone with this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"graceDays","label":"Spare anyone who joined in the last N days","type":"count","required":false,"help":"","choices":null,"min":1,"max":365,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.normaliseNicknames","label":"Normalise nicknames","help":"Strip hoisting punctuation and invisible characters from display names. Dry-runs first.","group":"members","emoji":"✒️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageNicknames"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"role","label":"Has this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"notRole","label":"Does NOT have this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"inactiveDays","label":"No activity for N days","type":"count","required":false,"help":"Needs the activity store","choices":null,"min":null,"max":null,"secret":false},{"name":"joinedWithinDays","label":"Joined within N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"accountYoungerDays","label":"Account younger than N days","type":"count","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"namePattern","label":"Display name contains","type":"pattern","required":false,"help":"Plain text, or /regex/ for a pattern","choices":null,"min":null,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"everyone","label":"Yes — EVERY member","type":"boolean","required":false,"help":"Required when no other filter is set","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.policyShow","label":"Show join policy","help":"The current auto-role, welcome/goodbye and raid-mode settings.","group":"members","emoji":"📜","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"member.policyAutoRole","label":"Auto-role on join","help":"Give every new member a role automatically. Leave the role empty to turn it off.","group":"members","emoji":"🎫","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"role","label":"Role (empty = off)","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.policyWelcome","label":"Welcome message","help":"Post a message when somebody joins. Placeholders: {user} {username} {server} {count}.","group":"members","emoji":"👋","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"enabled","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"message","label":"Message","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.policyGoodbye","label":"Goodbye message","help":"Post a message when somebody leaves. Placeholders: {user} {username} {server} {count}.","group":"members","emoji":"🫡","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"enabled","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"message","label":"Message","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.policyRaid","label":"Raid mode","help":"Auto-timeout anyone whose Discord account is younger than N days when they join.","group":"members","emoji":"🛑","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"enabled","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"minAccountAgeDays","label":"Accounts younger than N days","type":"count","required":false,"help":"","choices":null,"min":1,"max":365,"secret":false},{"name":"timeout","label":"Timeout length","type":"duration","required":false,"help":"e.g. 1h, 1d — max 28d","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.bans","label":"Ban List","help":"Everyone currently banned from this server, and the reason recorded at the time.","group":"members","emoji":"🔨","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["BanMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"search","label":"Filter by name or reason","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"member.timeouts","label":"Who Is Timed Out","help":"Everyone currently serving a timeout, and when each one lifts.","group":"members","emoji":"⏳","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"channel.create","label":"Create channel","help":"A new text, voice, forum or stage channel, optionally inside a category.","group":"channels","emoji":"➕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"kind","label":"Kind","type":"enum","required":true,"help":"","choices":[{"value":"text","label":"Text"},{"value":"voice","label":"Voice"},{"value":"forum","label":"Forum"},{"value":"stage","label":"Stage"}],"min":null,"max":null,"secret":false},{"name":"category","label":"Inside category","type":"category","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"topic","label":"Topic","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.rename","label":"Rename channel","help":"Change a channel’s name. The old name is recorded.","group":"channels","emoji":"✏️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.delete","label":"Delete channel","help":"Remove a channel and everything in it. This cannot be undone.","group":"channels","emoji":"🗑️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.topic","label":"Set topic","help":"The line under a channel’s name. Leave the topic empty to clear it.","group":"channels","emoji":"📝","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"topic","label":"Topic","type":"string","required":false,"help":"Up to 1024 characters. Empty clears it.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.nsfw","label":"Set age-restricted","help":"Mark a channel age-restricted, or clear the mark.","group":"channels","emoji":"🔞","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"on","label":"Age-restricted","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.move","label":"Move to category","help":"Move a channel into another category. Its own permissions are kept unless you sync it afterwards.","group":"channels","emoji":"📦","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"category","label":"Into category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.reorder","label":"Reorder a category","help":"Sort a category’s channels alphabetically, by how busy they are, or back to the order the last reorder replaced.","group":"channels","emoji":"🔢","module":"admin-console","permission":"admin","destructive":false,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"mode","label":"Order","type":"enum","required":true,"help":"","choices":[{"value":"alphabetical","label":"A → Z"},{"value":"activity","label":"Busiest first"},{"value":"saved","label":"Undo — back to the order before the last reorder"}],"min":null,"max":null,"secret":false},{"name":"window","label":"Activity window","type":"enum","required":false,"help":"Only used by “Busiest first”.","choices":[{"value":"day","label":"day"},{"value":"week","label":"week"},{"value":"month","label":"month"},{"value":"year","label":"year"},{"value":"all","label":"all"}],"min":null,"max":null,"secret":false}]},
    {"id":"channel.unlock","label":"Unlock channel","help":"Let @everyone post here again — the inverse of Lock.","group":"channels","emoji":"🔓","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"clear","label":"Remove the override entirely","type":"boolean","required":false,"help":"Instead of explicitly allowing, delete the SendMessages override so the channel inherits its category again.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"category.slowmode","label":"Slowmode a category","help":"Set the same slowmode on every text channel in a category. 0 turns it off.","group":"channels","emoji":"🐢","module":"admin-console","permission":"admin","destructive":false,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"channel","param":"category","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"seconds","label":"Seconds","type":"number","required":true,"help":"","choices":null,"min":0,"max":21600,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.lockdown","label":"Server lockdown","help":"Stop @everyone posting anywhere, and write down what each channel was set to so it can be lifted exactly.","group":"channels","emoji":"🚨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Only this category","type":"category","required":false,"help":"Leave empty to lock the whole server.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.lockdown.lift","label":"Lift lockdown","help":"Put every channel back to exactly what it was before the lockdown — not open, back.","group":"channels","emoji":"🕊️","module":"admin-console","permission":"admin","destructive":false,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge","label":"Purge messages","help":"Remove the most recent messages in a channel.","group":"channels","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.member","label":"Purge one member","help":"Remove one member’s recent messages from a channel.","group":"channels","emoji":"👤","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.bots","label":"Purge bot messages","help":"Remove messages posted by bots and webhooks.","group":"channels","emoji":"🤖","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.links","label":"Purge links","help":"Remove messages containing a link.","group":"channels","emoji":"🔗","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.attachments","label":"Purge attachments","help":"Remove messages that carry a file or image.","group":"channels","emoji":"📎","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.pattern","label":"Purge by text","help":"Remove messages whose text matches. Plain text is a substring; wrap in /slashes/ for a regular expression.","group":"channels","emoji":"🔎","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"pattern","label":"Text or /regex/","type":"pattern","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.purge.older","label":"Purge older than…","help":"Remove messages older than a number of days. Past 14 days Discord only allows one at a time.","group":"channels","emoji":"📆","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages","ReadMessageHistory"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"days","label":"Older than (days)","type":"number","required":true,"help":"","choices":null,"min":1,"max":3650,"secret":false},{"name":"limit","label":"How many at most","type":"count","required":false,"help":"Defaults to 50, ceiling 1000.","choices":null,"min":1,"max":1000,"secret":false},{"name":"pinned","label":"Include pinned messages","type":"boolean","required":false,"help":"Off by default — a pin is usually the one message nobody meant to lose.","choices":null,"min":null,"max":null,"secret":false},{"name":"slow","label":"Also remove messages older than 14 days","type":"boolean","required":false,"help":"One request each, so at most 25 per run.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.pin","label":"Pin a message","help":"Pin one message by its id.","group":"channels","emoji":"📌","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"message","label":"Message id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.unpin","label":"Unpin a message","help":"Remove one message from the pins.","group":"channels","emoji":"📍","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"message","label":"Message id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.pins.clear","label":"Clear all pins","help":"Unpin everything in a channel. The messages stay; only the pins go.","group":"channels","emoji":"🧷","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"thread.create","label":"Create thread","help":"Start a thread in a channel.","group":"channels","emoji":"🧵","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["CreatePublicThreads","CreatePrivateThreads"],"mode":"any","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"Thread name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"private","label":"Private thread","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"thread.archive","label":"Archive thread","help":"Close a thread. It stays readable and anyone can reopen it.","group":"channels","emoji":"🗄️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageThreads"],"mode":"all","scope":"channel","param":"thread","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"thread","label":"Thread","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"thread.lock","label":"Lock thread","help":"Stop anyone adding to a thread. Only a moderator can unlock it.","group":"channels","emoji":"🔐","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageThreads"],"mode":"all","scope":"channel","param":"thread","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"thread","label":"Thread","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"locked","label":"Locked","type":"boolean","required":false,"help":"Leave off to UNLOCK the thread.","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"thread.archiveStale","label":"Archive stale threads","help":"Archive every open thread with no activity since a cutoff.","group":"channels","emoji":"🧭","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageThreads"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"age","label":"Quiet for at least","type":"duration","required":true,"help":"e.g. 30d, 12h","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Only in this channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.sync","label":"Sync to category","help":"Replace a channel’s own permissions with its category’s.","group":"channels","emoji":"🔗","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.drift","label":"Permission drift","help":"Which channels no longer match the category they sit in.","group":"channels","emoji":"🧮","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"category","label":"Only this category","type":"category","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.preset","label":"Apply a preset","help":"Set @everyone’s access on a channel to a named pattern.","group":"channels","emoji":"🎚️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"preset","label":"Preset","type":"enum","required":true,"help":"","choices":[{"value":"public","label":"Public — anyone can read and post"},{"value":"readonly","label":"Read-only — anyone can read, nobody posts"},{"value":"private","label":"Private — hidden from @everyone"},{"value":"archive","label":"Archived — visible but frozen"}],"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"webhook.list","label":"List webhooks","help":"Every webhook on a channel, and which application owns it.","group":"channels","emoji":"🪝","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageWebhooks"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"webhook.create","label":"Create webhook","help":"Add a webhook to a channel. The URL is never shown here — copy it from Discord.","group":"channels","emoji":"➕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageWebhooks"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"Webhook name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"webhook.delete","label":"Delete webhook","help":"Remove a webhook. Anything posting through it stops immediately.","group":"channels","emoji":"🧨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageWebhooks"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"webhook","label":"Webhook id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"webhook.rotate","label":"Rotate webhook","help":"For a leaked URL: delete a webhook and create a replacement with the same name.","group":"channels","emoji":"♻️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageWebhooks"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"webhook","label":"Webhook id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"channel.activity","label":"Channel activity","help":"Messages per day per channel, and who posts in them.","group":"channels","emoji":"📈","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"window","label":"Window","type":"enum","required":false,"help":"","choices":[{"value":"day","label":"day"},{"value":"week","label":"week"},{"value":"month","label":"month"},{"value":"year","label":"year"},{"value":"all","label":"all"}],"min":null,"max":null,"secret":false},{"name":"channel","label":"Only this channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many channels","type":"count","required":false,"help":"","choices":null,"min":1,"max":25,"secret":false}]},
    {"id":"channel.dead","label":"Dead channels","help":"Channels with no recorded messages — with the ones that cannot be judged kept separate.","group":"channels","emoji":"🪦","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"window","label":"Window","type":"enum","required":false,"help":"","choices":[{"value":"day","label":"day"},{"value":"week","label":"week"},{"value":"month","label":"month"},{"value":"year","label":"year"},{"value":"all","label":"all"}],"min":null,"max":null,"secret":false}]},
    {"id":"channel.ignored","label":"Excluded channels","help":"Which channels the bot has been told to leave out, and what XP actually ignores.","group":"channels","emoji":"🚫","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.create","label":"New role","help":"Create a role. Colour accepts a name, a hex, or nothing at all.","group":"roles","emoji":"🆕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"colour","label":"Colour","type":"string","required":false,"help":"blurple · #5865F2 · none","choices":null,"min":null,"max":null,"secret":false},{"name":"hoist","label":"Show separately in the member list","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"mentionable","label":"Anyone can @mention it","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.rename","label":"Rename role","help":"Change a role’s name. 100 characters is Discord’s limit.","group":"roles","emoji":"✏️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"rename"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.colour","label":"Set colour","help":"A colour name (blurple), a hex (#5865F2 or 5865F2), or “none”.","group":"roles","emoji":"🎨","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"recolour"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"colour","label":"Colour","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.icon","label":"Set icon","help":"An emoji beside the role name. Needs Boost Level 2. Use “none” to clear it.","group":"roles","emoji":"🖼️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"change the icon of"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"icon","label":"Emoji, an image URL, or “none”","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.hoist","label":"Show separately","help":"Toggle whether members with this role are listed in their own section.","group":"roles","emoji":"📌","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"change"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.mentionable","label":"Allow @mention","help":"Toggle whether anyone can ping this role.","group":"roles","emoji":"🔔","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"change"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.move","label":"Move in hierarchy","help":"Set a role’s position. Higher numbers sit higher in the list.","group":"roles","emoji":"↕️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"move"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"position","label":"Position","type":"number","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"role.delete","label":"Delete role","help":"Delete a role. Refuses if the bot’s configuration still points at it.","group":"roles","emoji":"🗑️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"delete"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.perms","label":"Permissions","help":"Read or change a role’s permissions in plain English, grouped. Leave Allow and Remove empty to just look.","group":"roles","emoji":"🧩","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"change the permissions of"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"group","label":"Section","type":"enum","required":false,"help":"Leave empty to see everything","choices":[{"value":"general","label":"General"},{"value":"membership","label":"Membership"},{"value":"messages","label":"Messages"},{"value":"voice","label":"Voice"},{"value":"advanced","label":"Advanced / Dangerous"}],"min":null,"max":null,"secret":false},{"name":"allow","label":"Turn ON","type":"pattern","required":false,"help":"Comma-separated, e.g. “Kick members, Ban members” — or “all”","choices":null,"min":null,"max":null,"secret":false},{"name":"deny","label":"Turn OFF","type":"pattern","required":false,"help":"Comma-separated — or “all”","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.assignAll","label":"Give to everyone","help":"Add a role to every member. Queued and paced so Discord does not rate-limit the bot.","group":"roles","emoji":"👥","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"hand out"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.assignFilter","label":"Give by filter","help":"Add a role to everyone matching: has another role · joined before a date · inactive for N days.","group":"roles","emoji":"🎯","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"hand out"},"params":[{"name":"role","label":"Role to give","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"hasRole","label":"Only members who have this role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"joinedBefore","label":"Joined before","type":"string","required":false,"help":"2025-01-01, or a span like 90d","choices":null,"min":null,"max":null,"secret":false},{"name":"inactiveDays","label":"Inactive for at least N days","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"includeBots","label":"Include bots","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.removeAll","label":"Take from everyone","help":"Remove a role from every member who has it. The role itself stays.","group":"roles","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":"take away"},"params":[{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.merge","label":"Merge two roles","help":"Move every member from one role to another, re-point the bot’s configuration, then delete the old role.","group":"roles","emoji":"🔀","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["from","to"],"verb":"merge"},"params":[{"name":"from","label":"Merge this role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"to","label":"Into this one","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.board.create","label":"New role board","help":"Post a self-serve board members react to for a role. Add the roles to it afterwards.","group":"roles","emoji":"📋","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"title","label":"Title","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"intro","label":"Intro line","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.board.pair","label":"Add a board role","help":"Pair an emoji with a role on a board. Members react with it to get the role.","group":"roles","emoji":"➕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"board","label":"Board (message id)","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"emoji","label":"Emoji","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.board.unpair","label":"Remove a board role","help":"Take one emoji↔role pairing off a board. Nobody loses the role they already have.","group":"roles","emoji":"➖","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"board","label":"Board (message id)","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"emoji","label":"Emoji","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.board.delete","label":"Delete a board","help":"Remove a role board and its message. Members keep any role they already picked up.","group":"roles","emoji":"🧨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"board","label":"Board (message id)","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"role.board.list","label":"Role boards","help":"Every self-serve role board, its pairings, and any whose message has been deleted.","group":"roles","emoji":"🗂️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.audit.moderators","label":"Who can moderate","help":"Every role that can ban, kick, time out, or manage the server — the list nobody maintains.","group":"roles","emoji":"🚨","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.audit.admins","label":"Administrator roles","help":"Every role holding Administrator — the permission that overrides every other setting.","group":"roles","emoji":"👑","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.audit.empty","label":"Empty roles","help":"Roles nobody holds. Safe to delete unless the bot’s configuration points at them.","group":"roles","emoji":"🕸️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.audit.duplicates","label":"Duplicate roles","help":"Roles whose permissions are identical to another’s — candidates for a merge.","group":"roles","emoji":"👯","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"role.audit.above","label":"Roles above me","help":"Roles the bot cannot touch because they sit above its own — the reason an assignment fails.","group":"roles","emoji":"⛔","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"guild.overview","label":"Server Overview","help":"Everything about the server itself in one card — identity, safety settings, boosts, and the counts.","group":"guild","emoji":"🏛️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"guild.rename","label":"Rename Server","help":"Change the server name. Everyone sees this.","group":"guild","emoji":"✏️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"New name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.icon","label":"Server Icon","help":"Set the server icon from an image URL. Discord fetches it directly.","group":"guild","emoji":"🖼️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"url","label":"Image URL","type":"string","required":true,"help":"PNG/JPG/GIF. Leave blank in the modal to remove the icon.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.description","label":"Server Description","help":"The blurb shown in Discovery and on the invite splash. Community servers only.","group":"guild","emoji":"📝","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"text","label":"Description","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.verification","label":"Verification Level","help":"How much Discord requires of an account before it can talk here. The single most effective anti-raid setting.","group":"guild","emoji":"🔒","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"level","label":"Verification Level","type":"enum","required":true,"help":"","choices":[{"value":"None","label":"None"},{"value":"Low","label":"Low"},{"value":"Medium","label":"Medium"},{"value":"High","label":"High"},{"value":"VeryHigh","label":"VeryHigh"}],"min":null,"max":null,"secret":false}]},
    {"id":"guild.contentFilter","label":"Content Filter","help":"Whether Discord scans attachments for explicit content, and for whom.","group":"guild","emoji":"🛡️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"filter","label":"Content Filter","type":"enum","required":true,"help":"","choices":[{"value":"Disabled","label":"Disabled"},{"value":"MembersWithoutRoles","label":"MembersWithoutRoles"},{"value":"AllMembers","label":"AllMembers"}],"min":null,"max":null,"secret":false}]},
    {"id":"guild.notifications","label":"Default Notifications","help":"What NEW members get by default: every message, or only mentions.","group":"guild","emoji":"🔔","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"setting","label":"Default Notifications","type":"enum","required":true,"help":"","choices":[{"value":"AllMessages","label":"AllMessages"},{"value":"OnlyMentions","label":"OnlyMentions"}],"min":null,"max":null,"secret":false}]},
    {"id":"guild.afk","label":"AFK Channel","help":"Where idle members are moved, and after how long.","group":"guild","emoji":"💤","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"AFK voice channel","type":"channel","required":false,"help":"Leave blank to clear it","choices":null,"min":null,"max":null,"secret":false},{"name":"minutes","label":"Idle minutes","type":"number","required":false,"help":"Discord allows 1, 5, 15, 30 or 60","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.systemChannel","label":"System Messages","help":"Where Discord posts joins and boosts, and which of those it is allowed to post.","group":"guild","emoji":"📢","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"System channel","type":"channel","required":false,"help":"Leave blank to turn system messages off entirely","choices":null,"min":null,"max":null,"secret":false},{"name":"joins","label":"Announce joins","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"boosts","label":"Announce boosts","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.boostBar","label":"Boost Progress Bar","help":"Show or hide the boost progress bar at the top of the channel list.","group":"guild","emoji":"📊","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"on","label":"Show the bar","type":"boolean","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.boosters","label":"Who Is Boosting","help":"Everyone currently boosting, and since when — the people paying for this server.","group":"guild","emoji":"💎","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"emoji.list","label":"Emoji & Stickers","help":"Every custom emoji and sticker, how many slots are left, and which are animated.","group":"guild","emoji":"😀","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"emoji.add","label":"Add Emoji","help":"Upload a custom emoji from an image URL.","group":"guild","emoji":"➕","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuildExpressions"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Emoji name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"url","label":"Image URL","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"emoji.rename","label":"Rename Emoji","help":"Change what an emoji is typed as.","group":"guild","emoji":"🏷️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuildExpressions"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"emoji","label":"Current name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"emoji.delete","label":"Delete Emoji","help":"Remove a custom emoji. Every message that used it shows the raw text instead.","group":"guild","emoji":"🗑️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuildExpressions"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"emoji","label":"Emoji name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"invite.list","label":"Invites","help":"Every active invite: who made it, how many have used it, and when it expires.","group":"guild","emoji":"🔗","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[]},
    {"id":"invite.revoke","label":"Revoke Invite","help":"Kill one invite link. Anyone holding it can no longer join with it.","group":"guild","emoji":"⛔","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"code","label":"Invite code","type":"string","required":true,"help":"Just the code, not the full URL","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"invite.audit","label":"Invite Audit","help":"Who is bringing people in, and which invites are a standing risk.","group":"guild","emoji":"🕵️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[]},
    {"id":"automod.list","label":"AutoMod Rules","help":"Discord's own AutoMod rules — what they catch, what they do, and whether they are on.","group":"guild","emoji":"🤖","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[]},
    {"id":"automod.toggle","label":"Toggle AutoMod Rule","help":"Turn one of Discord's AutoMod rules on or off by name.","group":"guild","emoji":"🔀","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageGuild"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Rule name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"on","label":"Enabled","type":"boolean","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.events","label":"Scheduled Events","help":"Discord's own scheduled events — what is coming up and how many are interested.","group":"guild","emoji":"📅","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"guild.event.cancel","label":"Cancel Event","help":"Cancel a scheduled event by name. Everyone who marked interested is notified by Discord.","group":"guild","emoji":"🚫","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageEvents"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Event name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"guild.permCheck","label":"What Can I Do?","help":"Every permission this console needs, whether the bot has it, and exactly which controls stop working without it.","group":"guild","emoji":"🔑","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.branding","label":"Bot branding","help":"What this server shows for the bot — its name here, its avatar, its banner and its bio — what is stored, and what is actually live on Discord right now.","group":"bot","emoji":"🎨","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.branding.name","label":"Bot name here","help":"The nickname this one server shows for the bot. Needs Change Nickname. The bot’s GLOBAL username is deliberately not settable — it is one value for every server at once.","group":"bot","emoji":"🏷️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ChangeNickname"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"nick","label":"Name in this server","type":"string","required":true,"help":"Up to 32 characters. Use Clear branding to go back to the default.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.branding.look","label":"Bot look here","help":"The avatar, banner and bio this one server shows. None of them need a permission. Images: PNG, JPEG or GIF, up to 10.00 MB, given as an https link or a data: URI.","group":"bot","emoji":"🖼️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"avatar","label":"Avatar URL","type":"string","required":false,"help":"https link to a PNG, JPEG or GIF image, or a data: URI. Leave blank to leave it alone.","choices":null,"min":null,"max":null,"secret":false},{"name":"banner","label":"Banner URL","type":"string","required":false,"help":"Same formats. Leave blank to leave it alone.","choices":null,"min":null,"max":null,"secret":false},{"name":"bio","label":"Bio","type":"string","required":false,"help":"Up to 190 characters.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.branding.clear","label":"Clear branding","help":"Put the bot back to its default look in this server. Clears the name, avatar, banner and bio — or just one of them.","group":"bot","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"what","label":"What to clear","type":"enum","required":true,"help":"","choices":[{"value":"all","label":"Everything"},{"value":"nick","label":"Name only"},{"value":"avatar","label":"Avatar only"},{"value":"banner","label":"Banner only"},{"value":"bio","label":"Bio only"}],"min":null,"max":null,"secret":false}]},
    {"id":"bot.features","label":"Feature switches","help":"Every feature, whether it is on right now, and exactly what decides that.","group":"bot","emoji":"🎛️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.feature.set","label":"Turn a feature on/off","help":"Drives the module’s own enable path. A feature with no gate in its module is refused with the reason rather than given a switch that changes nothing.","group":"bot","emoji":"🔀","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"feature","label":"Feature","type":"enum","required":true,"help":"","choices":[{"value":"counting","label":"Counting game"},{"value":"content","label":"Challenges, goals & events"},{"value":"ai","label":"AI companions"},{"value":"booster","label":"Booster prison escalation"},{"value":"casino","label":"Casino games"},{"value":"economy","label":"Economy"},{"value":"leveling","label":"Levelling"},{"value":"wrapped","label":"Wrapped recap"}],"min":null,"max":null,"secret":false},{"name":"on","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Channel","type":"channel","required":false,"help":"Counting only — the channel it should watch","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.wrapped","label":"Wrapped occasion","help":"Which day the year-in-review card arrives on, how long it stays, and the date it will next actually fire.","group":"bot","emoji":"🎁","module":"wrapped","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"occasion","label":"Occasion","type":"enum","required":false,"help":"Leave blank to read the current setting without changing it","choices":[{"value":"year-end","label":"year-end"},{"value":"server-birthday","label":"server-birthday"},{"value":"bot-birthday","label":"bot-birthday"},{"value":"both","label":"both"},{"value":"off","label":"off"}],"min":null,"max":null,"secret":false},{"name":"windowDays","label":"Window (days)","type":"number","required":false,"help":"1–60; how long it stays available","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.economy.grant","label":"Grant money","help":"Add cash to one member. Goes through economy.credit(), so it lands in their ledger and the event log like every other Buck.","group":"bot","emoji":"💸","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"amount","label":"Amount","type":"number","required":true,"help":"","choices":null,"min":1,"max":1000000000000,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.economy.deduct","label":"Deduct money","help":"Take cash off one member. Refuses rather than going below zero.","group":"bot","emoji":"➖","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"amount","label":"Amount","type":"number","required":true,"help":"","choices":null,"min":1,"max":1000000000000,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.economy.reset.member","label":"Reset a member’s balance","help":"Zeroes one member’s cash through economy.debit(). Tycoon assets, lifetime stats and net-worth tier are untouched.","group":"bot","emoji":"🧹","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.economy.reset.all","label":"Reset EVERY balance","help":"Zeroes every member’s cash. Takes a verified backup first and requires the server name typed in.","group":"bot","emoji":"🔥","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"confirm","label":"Type the server name to confirm","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.economy.rates","label":"Payout rates","help":"Every rate the economy actually pays, read from economy.js itself.","group":"bot","emoji":"📈","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.economy.ledger","label":"View a ledger","help":"One member’s money in and out, newest first. The durable record is the event log; this is the 40-entry window they can see.","group":"bot","emoji":"📒","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":40,"secret":false}]},
    {"id":"bot.economy.reverse","label":"Reverse a transaction","help":"Applies the inverse of one ledger entry through credit/debit. The original entry stays — an audit trail you can edit is not one.","group":"bot","emoji":"↩️","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"entry","label":"Entry number (1 = newest)","type":"count","required":true,"help":"","choices":null,"min":1,"max":40,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.level.setxp","label":"Set XP","help":"Set a member’s XP outright. The level is recomputed from it with the same maths the XP grants use.","group":"bot","emoji":"✨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"xp","label":"XP","type":"number","required":true,"help":"","choices":null,"min":0,"max":1000000000,"secret":false}]},
    {"id":"bot.level.setlevel","label":"Set level","help":"Set a member’s level. XP is moved to that level’s threshold so the progress bar is honest.","group":"bot","emoji":"🎖️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"level","label":"Level","type":"number","required":true,"help":"","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"bot.level.recalc","label":"Recalculate levels","help":"Re-derives everyone’s level from their stored XP. Fixes a store edited by hand or restored from a mismatched backup.","group":"bot","emoji":"🧮","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.level.season.reset","label":"Reset the levelling season","help":"Everyone back to Lv 0 with 0 XP. Prestige, lifetime XP, achievements and equipped icons all survive. Backed up and confirmed first.","group":"bot","emoji":"🌱","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"confirm","label":"Type the server name to confirm","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.counting.set","label":"Set the count","help":"Re-seed the counting game. Per-member lifetime records are kept; the \"who counted last\" lock is cleared so nobody is wrongly blocked.","group":"bot","emoji":"🔢","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"count","label":"Count","type":"number","required":true,"help":"","choices":null,"min":0,"max":9007199254740991,"secret":false}]},
    {"id":"bot.counting.reset","label":"Reset the count","help":"Back to zero. The room’s run is a monument — this asks you to type the current count so it cannot be a mis-tap.","group":"bot","emoji":"🧨","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"confirm","label":"Type the current count to confirm","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.content.roll","label":"Force the rollover","help":"Closes any period that has genuinely ended, now, instead of waiting for the five-minute tick.","group":"bot","emoji":"⏭️","module":"challenges","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"period","label":"Period","type":"enum","required":false,"help":"","choices":[{"value":"day","label":"Day"},{"value":"week","label":"Week"},{"value":"season","label":"Season"},{"value":"all","label":"Anything that has ended"}],"min":null,"max":null,"secret":false}]},
    {"id":"bot.content.state","label":"Content state","help":"Which day, week and season are live, what the roller last closed, and whether the engine is running.","group":"bot","emoji":"🗓️","module":"challenges","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.casino.edge","label":"House edge (measured)","help":"What the house actually kept, per game, from the rounds in the event log. Never a design figure — if no rounds were recorded it says so.","group":"bot","emoji":"🎲","module":"casino","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"days","label":"Days to read","type":"count","required":false,"help":"","choices":null,"min":1,"max":90,"secret":false}]},
    {"id":"bot.casino.controls","label":"Casino controls","help":"What can and cannot be controlled about the casino today, and exactly what each missing control needs.","group":"bot","emoji":"🕹️","module":"casino","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.booster.release","label":"Release everyone","help":"Disconnects every member currently sitting in a booster-prison voice channel, in every category.","group":"bot","emoji":"🔓","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["MoveMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.commands.list","label":"Slash commands","help":"Which command modules are loaded, which are registered with Discord, and where they may be used.","group":"bot","emoji":"⌨️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.commands.channel","label":"Restrict commands to a channel","help":"Lock every slash command to one channel, or clear it to allow them anywhere.","group":"bot","emoji":"🚧","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Channel","type":"channel","required":false,"help":"Leave empty to allow commands everywhere","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.msg.say","label":"Say something","help":"Post a message as the bot. Plain text only — no embeds, no components, nothing that could impersonate one of its own cards.","group":"bot","emoji":"🗣️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"text","label":"Message","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.msg.edit","label":"Edit a bot message","help":"Rewrite a message this bot sent. Discord only allows a bot to edit its own messages, so anything else is refused before the call.","group":"bot","emoji":"✏️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"message","label":"Message id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"text","label":"New message","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.msg.schedule","label":"Schedule a message","help":"Send a message after a delay (up to 24h). In-process only — a restart cancels it, and the result says so.","group":"bot","emoji":"⏰","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"text","label":"Message","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"delay","label":"In how long (10m, 2h…)","type":"duration","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"bot.runtime.restart","label":"Restart the bot","help":"Banks the buffered counters, then asks the process to shut down cleanly so the supervisor restarts it.","group":"bot","emoji":"♻️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.runtime.reload","label":"Reload config","help":"Re-reads config.json and its siblings from disk without a restart.","group":"bot","emoji":"🔄","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.runtime.flushstats","label":"Flush stats","help":"Writes the buffered activity counters to disk now instead of at the next 60-second flush.","group":"bot","emoji":"💾","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.runtime.backup","label":"Back up now","help":"Snapshots every mutable store into backups/<today>/ and verifies the copy actually landed.","group":"bot","emoji":"🗄️","module":"backup","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"bot.runtime.health","label":"Health","help":"Uptime, memory, event-loop lag, Discord latency and the recent error rate — measured, or reported as unknown.","group":"bot","emoji":"🩺","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"sampleMs","label":"Loop-lag sample (ms)","type":"number","required":false,"help":"","choices":null,"min":20,"max":2000,"secret":false}]},
    {"id":"diag.scan","label":"Run every diagnostic","help":"Reads the whole guild and reports everything that is silently broken — deleted roles and channels the config still points at, categories nobody can be granted, missing booster prisons, roles the bot cannot assign, and stale data. Changes nothing.","group":"overview","emoji":"🩺","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"diag.configDrift","label":"Config drift","help":"Config drift — ids that no longer exist in Discord. Read-only — it changes nothing and can be run whenever.","group":"overview","emoji":"🧭","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"diag.categories","label":"Categories & prisons","help":"Categories the bot cannot grant · Categories with no booster prison. Read-only — it changes nothing and can be run whenever.","group":"overview","emoji":"🗂️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"diag.roles","label":"Roles","help":"Roles the bot cannot assign · Administrator roles, and roles nobody holds. Read-only — it changes nothing and can be run whenever.","group":"overview","emoji":"🛡️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"diag.channels","label":"Channels","help":"Channels the bot cannot see or post in · Channels out of sync with their category. Read-only — it changes nothing and can be run whenever.","group":"overview","emoji":"👁️","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"diag.upkeep","label":"Settings & upkeep","help":"Required settings still unset · Stale data — dead channels, old backups, quarantined files. Read-only — it changes nothing and can be run whenever.","group":"overview","emoji":"🧰","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"data.auditFilter","label":"Search admin activity","help":"The admin trail, filtered by who did it, what they did, and when. Read-only.","group":"data","emoji":"🔎","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"actor","label":"Only this admin","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"action","label":"Action contains","type":"pattern","required":false,"help":"e.g. “channel” or “role.add”","choices":null,"min":null,"max":null,"secret":false},{"name":"from","label":"From (YYYY-MM-DD)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"to","label":"To (YYYY-MM-DD)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false}]},
    {"id":"data.discordAudit","label":"Discord audit log","help":"Discord’s own audit log, read here instead of in the client. Shows bans, kicks, role and channel changes — including ones this bot did not make.","group":"data","emoji":"📖","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ViewAuditLog"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false},{"name":"type","label":"Audit log event type","type":"number","required":false,"help":"Optional numeric AuditLogEvent filter","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.parity","label":"StatBot parity trend","help":"Every recorded parity run, and whether the gap between our numbers and StatBot’s is closing. Read-only.","group":"data","emoji":"📈","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"limit","label":"How many runs","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"data.exportStats","label":"Export activity stats","help":"Per-member, per-day messages and voice minutes for a window, as CSV or JSON.","group":"data","emoji":"📤","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"format","label":"Format","type":"enum","required":false,"help":"","choices":[{"value":"csv","label":"CSV"},{"value":"json","label":"JSON"}],"min":null,"max":null,"secret":false},{"name":"from","label":"From (YYYY-MM-DD)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"to","label":"To (YYYY-MM-DD)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.exportMember","label":"Export a member’s data","help":"Everything this bot holds about one member, in one document. Read-only.","group":"data","emoji":"🧾","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.deleteMember","label":"Delete a member’s data","help":"Erases what this bot holds about one member from the stores that support it, and names the ones that do not.","group":"data","emoji":"🧹","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.storage","label":"Storage report","help":"How big every store is, how it has grown since the last backup, how old the backups are, and what has been quarantined. Read-only.","group":"data","emoji":"💾","module":"admin-console","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"data.snapshot","label":"Save a structure snapshot","help":"Records every category, channel, role and permission overwrite to a dated file, so a later change can be diffed against it.","group":"data","emoji":"📸","module":"backup","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"data.snapshotDiff","label":"Diff against a snapshot","help":"What has changed in the server since a snapshot was taken. Read-only.","group":"data","emoji":"🔀","module":"backup","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"snapshot","label":"Snapshot file","type":"string","required":false,"help":"Leave blank for the newest","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.snapshotRestore","label":"Restore from a snapshot","help":"Puts names, topics, slowmode and permission overwrites back to what a snapshot recorded. Never creates, never deletes, never moves a channel.","group":"data","emoji":"⏪","module":"backup","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"snapshot","label":"Snapshot file","type":"string","required":false,"help":"Leave blank for the newest","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"data.undo","label":"Undo the last admin action","help":"Reverses the most recent admin action whose inverse is well defined — a lock, a slowmode change, or anything that recorded its own undo. Refuses rather than guessing.","group":"data","emoji":"↩️","module":"admin-console","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"id","label":"Audit id","type":"string","required":false,"help":"Leave blank for the most recent undoable action","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.gameserver","label":"Game Server Kit","help":"A whole game server in one press: private category, access role, chat + LFG + voice + a read-only access channel, a servers.json preset, and the note that tells members how to get on the tailnet.","group":"blueprints","emoji":"🎮","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Game / server name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"key","label":"servers.json key","type":"string","required":false,"help":"Defaults to a slug of the name. This is what the bot calls the preset internally.","choices":null,"min":null,"max":null,"secret":false},{"name":"kind","label":"Kind","type":"enum","required":false,"help":"","choices":[{"value":"minecraft","label":"Minecraft"},{"value":"steam","label":"Steam"},{"value":"other","label":"Other"}],"min":null,"max":null,"secret":false},{"name":"container","label":"Docker container","type":"string","required":false,"help":"The container the start/stop path acts on. Leave blank if the bot will not manage it.","choices":null,"min":null,"max":null,"secret":false},{"name":"port","label":"Connect port","type":"number","required":false,"help":"","choices":null,"min":1,"max":65535,"secret":false},{"name":"roleName","label":"Access role name","type":"string","required":false,"help":"Defaults to the game name.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.event","label":"Event Kit","help":"A scheduled Discord event, a temporary attendee role, a channel for it and an announcement — recorded so “End an event” can clean all of it up afterwards.","group":"blueprints","emoji":"📅","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles","ManageEvents"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Event name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"startsIn","label":"Starts in","type":"duration","required":true,"help":"e.g. 2h, 3d","choices":null,"min":null,"max":null,"secret":false},{"name":"lasts","label":"Runs for","type":"duration","required":false,"help":"Defaults to 2h.","choices":null,"min":null,"max":null,"secret":false},{"name":"announceIn","label":"Announce in","type":"channel","required":false,"help":"Leave blank to skip the announcement.","choices":null,"min":null,"max":null,"secret":false},{"name":"roleName","label":"Attendee role name","type":"string","required":false,"help":"Defaults to “<event> Attendee”.","choices":null,"min":null,"max":null,"secret":false},{"name":"location","label":"Where","type":"string","required":false,"help":"Shown on the Discord event. Defaults to the event channel.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.event.end","label":"End an event","help":"Cleanup for an Event Kit: archives the event channel, deletes the temporary role, cancels the Discord event and forgets the record.","group":"blueprints","emoji":"🏁","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles","ManageEvents"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Event name","type":"string","required":true,"help":"As it appears in List blueprints.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.project","label":"Project / Clan Kit","help":"A private, invite-only space: hidden category, a role only an admin hands out, text + voice, registered with the bot, and an idle window after which “Archive idle projects” will pack it away.","group":"blueprints","emoji":"🔒","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Project / clan name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"roleName","label":"Invite-only role name","type":"string","required":false,"help":"Defaults to the project name.","choices":null,"min":null,"max":null,"secret":false},{"name":"idleDays","label":"Archive after (days idle)","type":"count","required":false,"help":"Defaults to 30. Enforced by “Archive idle projects”.","choices":null,"min":1,"max":365,"secret":false}]},
    {"id":"blueprint.sweep","label":"Archive idle projects","help":"Archives every Project Kit category that has gone past its idle window. Dry-runs first and names each one with how long it has been quiet.","group":"blueprints","emoji":"🧹","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"prefix","label":"Archive prefix","type":"string","required":false,"help":"Defaults to “🗄️ Archived —”.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.staff","label":"Staff Kit","help":"A staff area built with the staff-only preset: Staff and Moderator roles, a hidden category, mod-chat, a read-only mod-log and a staff voice channel — and it can point the bot’s moderator channel at the new mod-log.","group":"blueprints","emoji":"🛡️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"name","label":"Category name","type":"string","required":false,"help":"Defaults to “Staff”.","choices":null,"min":null,"max":null,"secret":false},{"name":"staffRoleName","label":"Staff role name","type":"string","required":false,"help":"Defaults to “Staff”.","choices":null,"min":null,"max":null,"secret":false},{"name":"modRoleName","label":"Moderator role name","type":"string","required":false,"help":"Defaults to “Moderator”.","choices":null,"min":null,"max":null,"secret":false},{"name":"wireModLog","label":"Point the bot’s moderator channel at the new mod-log","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.starter","label":"Server Starter Pack","help":"The opening structure of a whole guild — Information (read-only), Community (public) and Staff (hidden), with a Staff role and every permission set at creation. The first-run wizard’s natural sequel.","group":"blueprints","emoji":"🏗️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"staffRoleName","label":"Staff role name","type":"string","required":false,"help":"Defaults to “Staff”.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.clone","label":"Clone a category","help":"Duplicates an existing category — its channels, their topics and every permission overwrite — under a new name. Give it a role name and it creates a fresh access role, swaps it in everywhere the original’s role appeared, and registers the pair with the bot.","group":"blueprints","emoji":"📋","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"source","label":"Copy from","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New category name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"roleName","label":"New access role name","type":"string","required":false,"help":"Leave blank to reuse the original’s permissions exactly.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.save","label":"Save as a blueprint","help":"Turns an existing category into a reusable blueprint — channels, topics and permissions, saved by role name rather than by id so it can be built in any guild (or shipped as a module).","group":"blueprints","emoji":"💾","module":"blueprints","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":true,"botPermission":null,"params":[{"name":"source","label":"Category to save","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"Blueprint name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"description","label":"What it builds","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"overwrite","label":"Replace a blueprint of the same name","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.templates","label":"List blueprints","help":"Every saved blueprint and what it builds, plus any live events and idle-archive policies the console is holding.","group":"blueprints","emoji":"📚","module":"blueprints","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"blueprint.fromTemplate","label":"Build from a blueprint","help":"Builds a saved blueprint into a new category — creating its access role, resolving every role by NAME in this guild, and naming the booster prison from this guild’s own setting.","group":"blueprints","emoji":"🧩","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"template","label":"Blueprint name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"name","label":"New category name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"roleName","label":"Access role name","type":"string","required":false,"help":"Defaults to the category name.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.archive","label":"Archive a category","help":"Locks every channel, hides the category from @everyone, marks it archived and moves it to the bottom, and frees its access role by removing it from the bot’s list. History is kept.","group":"blueprints","emoji":"🗄️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"prefix","label":"Archive prefix","type":"string","required":false,"help":"Defaults to “🗄️ Archived —”.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.retire","label":"Retire a category","help":"Archive, plus an exported transcript of every text channel, the bot’s registration cleaned up, and the access role deleted. Deleting the role cannot be undone.","group":"blueprints","emoji":"⚰️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageChannels","ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"messages","label":"Messages per channel to export","type":"count","required":false,"help":"Defaults to 200.","choices":null,"min":1,"max":1000,"secret":false},{"name":"prefix","label":"Archive prefix","type":"string","required":false,"help":"Defaults to “🗄️ Archived —”.","choices":null,"min":null,"max":null,"secret":false},{"name":"includeMessageText","label":"Include the text of every message","type":"boolean","required":false,"help":"Off by default. Off exports who posted and when; on also writes what they said to disk.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.preset.channel","label":"Preset: one channel","help":"Applies one of the six named permission shapes to a single channel — public, members-only, announcement, staff-only, private or archive.","group":"blueprints","emoji":"🎛️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":true,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"preset","label":"Preset","type":"enum","required":true,"help":"","choices":[{"value":"public","label":"Public"},{"value":"members-only","label":"Members only"},{"value":"announcement","label":"Announcement"},{"value":"staff-only","label":"Staff only"},{"value":"private","label":"Private"},{"value":"archive","label":"Archive"}],"min":null,"max":null,"secret":false},{"name":"role","label":"Role","type":"role","required":false,"help":"Needed by members-only, staff-only and private. Falls back to the access role the bot has for the channel’s category.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"blueprint.preset.category","label":"Preset: whole category","help":"Applies a permission preset to a category and every channel inside it, in one atomic action — so a private category cannot end up with one public channel left in it.","group":"blueprints","emoji":"🎚️","module":"blueprints","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":true,"composite":true,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"channel","param":"category","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"category","label":"Category","type":"category","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"preset","label":"Preset","type":"enum","required":true,"help":"","choices":[{"value":"public","label":"Public"},{"value":"members-only","label":"Members only"},{"value":"announcement","label":"Announcement"},{"value":"staff-only","label":"Staff only"},{"value":"private","label":"Private"},{"value":"archive","label":"Archive"}],"min":null,"max":null,"secret":false},{"name":"role","label":"Role","type":"role","required":false,"help":"Needed by members-only, staff-only and private. Falls back to the access role the bot has for this category.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"media.start","label":"Put something on","help":"Start the stream with a film, an episode or a live channel, on the first free screen.","group":"media","emoji":"▶️","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"title","label":"Title or channel","type":"string","required":true,"help":"A library title, or the name/number of a live channel","choices":null,"min":null,"max":null,"secret":false},{"name":"screen","label":"Screen","type":"number","required":false,"help":"Leave blank for the first free one","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"media.switch","label":"Switch the title","help":"Replace what is playing without dropping the stream. Says who is watching first.","group":"media","emoji":"🔀","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"title","label":"Title or channel","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"screen","label":"Screen","type":"number","required":false,"help":"","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"media.skip","label":"Skip","help":"Move a series on to the next episode. There is no queue behind a film or a channel.","group":"media","emoji":"⏭️","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"screen","label":"Screen","type":"number","required":false,"help":"","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"media.pause","label":"Pause / resume","help":"Hold the picture on a slate, or let it run again.","group":"media","emoji":"⏯️","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"state","label":"Do what","type":"enum","required":true,"help":"","choices":[{"value":"pause","label":"Pause"},{"value":"resume","label":"Resume"}],"min":null,"max":null,"secret":false},{"name":"screen","label":"Screen","type":"number","required":false,"help":"","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"media.restartEngine","label":"Restart the projector","help":"Re-open the feeder for whatever is on and resume from where it is. Use it when the picture is stuck.","group":"media","emoji":"♻️","module":"screening-room","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"screen","label":"Screen","type":"number","required":false,"help":"","choices":null,"min":0,"max":null,"secret":false}]},
    {"id":"media.epg","label":"Refresh the TV guide","help":"Re-pull the channel lineup and the programme guide from the source.","group":"media","emoji":"📡","module":"live-tv","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"media.rescan","label":"Rescan Plex libraries","help":"Ask Plex to look for new files in every movie and show section.","group":"media","emoji":"🔄","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"media.artCache","label":"Refresh library artwork","help":"Re-pull the library and its artwork paths so changed posters and renamed titles show up.","group":"media","emoji":"🖼️","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"media.blacklist","label":"Blacklist a channel","help":"Pull a live channel out of the guide, search and autocomplete so nobody can put it on.","group":"media","emoji":"⛔","module":"live-tv","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Channel name or id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"media.revive","label":"Revive a dead channel","help":"Put a pulled live channel back in the guide, and check whether it actually plays now.","group":"media","emoji":"💡","module":"live-tv","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Channel name or id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"media.history","label":"Watch history","help":"What has been watched — server-wide, or everything one member has watched.","group":"media","emoji":"📜","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Only this member","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many titles","type":"count","required":false,"help":"","choices":null,"min":1,"max":25,"secret":false}]},
    {"id":"media.watchHours","label":"Watch hours by member","help":"Hours on the stream per member, and which era each figure was measured in.","group":"media","emoji":"⏱️","module":"screening-room","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"limit","label":"How many members","type":"count","required":false,"help":"","choices":null,"min":1,"max":25,"secret":false}]},
    {"id":"media.requests","label":"Request pipeline","help":"What members have asked for and where each one is. Read-only — the pipeline runs itself.","group":"media","emoji":"📥","module":"requests","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"server.start","label":"Start a server","help":"Bring one of the game servers up.","group":"servers","emoji":"▶️","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"server","label":"Server","type":"enum","required":true,"help":"","choices":[{"value":"millenaire","label":"Millénaire (Minecraft 1.21.1)"},{"value":"atm10","label":"All the Mods 10 (1.21.1)"},{"value":"bettermc","label":"Better MC [NeoForge] (1.21.1)"},{"value":"dawncraft","label":"DawnCraft (RPG · 1.18.2)"},{"value":"vaulthunters","label":"Vault Hunters (1.18.2)"},{"value":"prominence2","label":"Prominence II RPG (1.20.1)"},{"value":"pixelmon","label":"Pixelmon (Pokémon · 1.16.5)"},{"value":"valheim","label":"Valheim"},{"value":"palworld","label":"Palworld"},{"value":"satisfactory","label":"Satisfactory"},{"value":"sevendaystodie","label":"7 Days to Die"},{"value":"unturned","label":"Unturned"},{"value":"dontstarvetogether","label":"Don't Starve Together"},{"value":"arma3","label":"Arma 3"},{"value":"dragonwilds","label":"RuneScape: Dragonwilds"},{"value":"enshrouded","label":"Enshrouded"},{"value":"theforest","label":"The Forest"},{"value":"sonsoftheforest","label":"Sons of the Forest"},{"value":"sunkenland","label":"Sunkenland"},{"value":"windrose","label":"Windrose"}],"min":null,"max":null,"secret":false}]},
    {"id":"server.restart","label":"Restart a server","help":"Stop a game server the polite way and bring it straight back up.","group":"servers","emoji":"🔁","module":"game-servers","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"server","label":"Server","type":"enum","required":true,"help":"","choices":[{"value":"millenaire","label":"Millénaire (Minecraft 1.21.1)"},{"value":"atm10","label":"All the Mods 10 (1.21.1)"},{"value":"bettermc","label":"Better MC [NeoForge] (1.21.1)"},{"value":"dawncraft","label":"DawnCraft (RPG · 1.18.2)"},{"value":"vaulthunters","label":"Vault Hunters (1.18.2)"},{"value":"prominence2","label":"Prominence II RPG (1.20.1)"},{"value":"pixelmon","label":"Pixelmon (Pokémon · 1.16.5)"},{"value":"valheim","label":"Valheim"},{"value":"palworld","label":"Palworld"},{"value":"satisfactory","label":"Satisfactory"},{"value":"sevendaystodie","label":"7 Days to Die"},{"value":"unturned","label":"Unturned"},{"value":"dontstarvetogether","label":"Don't Starve Together"},{"value":"arma3","label":"Arma 3"},{"value":"dragonwilds","label":"RuneScape: Dragonwilds"},{"value":"enshrouded","label":"Enshrouded"},{"value":"theforest","label":"The Forest"},{"value":"sonsoftheforest","label":"Sons of the Forest"},{"value":"sunkenland","label":"Sunkenland"},{"value":"windrose","label":"Windrose"}],"min":null,"max":null,"secret":false}]},
    {"id":"server.forceStop","label":"Force-stop a server","help":"Kill a server that will not shut down gracefully. Use it only when Stop has already failed.","group":"servers","emoji":"⛔","module":"game-servers","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"server","label":"Server","type":"enum","required":true,"help":"","choices":[{"value":"millenaire","label":"Millénaire (Minecraft 1.21.1)"},{"value":"atm10","label":"All the Mods 10 (1.21.1)"},{"value":"bettermc","label":"Better MC [NeoForge] (1.21.1)"},{"value":"dawncraft","label":"DawnCraft (RPG · 1.18.2)"},{"value":"vaulthunters","label":"Vault Hunters (1.18.2)"},{"value":"prominence2","label":"Prominence II RPG (1.20.1)"},{"value":"pixelmon","label":"Pixelmon (Pokémon · 1.16.5)"},{"value":"valheim","label":"Valheim"},{"value":"palworld","label":"Palworld"},{"value":"satisfactory","label":"Satisfactory"},{"value":"sevendaystodie","label":"7 Days to Die"},{"value":"unturned","label":"Unturned"},{"value":"dontstarvetogether","label":"Don't Starve Together"},{"value":"arma3","label":"Arma 3"},{"value":"dragonwilds","label":"RuneScape: Dragonwilds"},{"value":"enshrouded","label":"Enshrouded"},{"value":"theforest","label":"The Forest"},{"value":"sonsoftheforest","label":"Sons of the Forest"},{"value":"sunkenland","label":"Sunkenland"},{"value":"windrose","label":"Windrose"}],"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"server.backupWorld","label":"Back up a world now","help":"Copy a game world beside itself, timestamped. Nothing is moved, renamed or deleted.","group":"servers","emoji":"💾","module":"game-servers","permission":"admin","destructive":false,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"server","label":"Server","type":"enum","required":true,"help":"","choices":[{"value":"millenaire","label":"Millénaire (Minecraft 1.21.1)"},{"value":"atm10","label":"All the Mods 10 (1.21.1)"},{"value":"bettermc","label":"Better MC [NeoForge] (1.21.1)"},{"value":"dawncraft","label":"DawnCraft (RPG · 1.18.2)"},{"value":"vaulthunters","label":"Vault Hunters (1.18.2)"},{"value":"prominence2","label":"Prominence II RPG (1.20.1)"},{"value":"pixelmon","label":"Pixelmon (Pokémon · 1.16.5)"},{"value":"valheim","label":"Valheim"},{"value":"palworld","label":"Palworld"},{"value":"satisfactory","label":"Satisfactory"},{"value":"sevendaystodie","label":"7 Days to Die"},{"value":"unturned","label":"Unturned"},{"value":"dontstarvetogether","label":"Don't Starve Together"},{"value":"arma3","label":"Arma 3"},{"value":"dragonwilds","label":"RuneScape: Dragonwilds"},{"value":"enshrouded","label":"Enshrouded"},{"value":"theforest","label":"The Forest"},{"value":"sonsoftheforest","label":"Sons of the Forest"},{"value":"sunkenland","label":"Sunkenland"},{"value":"windrose","label":"Windrose"}],"min":null,"max":null,"secret":false}]},
    {"id":"server.whoIsPlaying","label":"Who is playing","help":"Live player counts, straight from each running server.","group":"servers","emoji":"👀","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"server.idleShutdown","label":"Idle-shutdown override","help":"How long one server may sit empty before the bot stops it, overriding the server-wide default.","group":"servers","emoji":"⏲️","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"server","label":"Server","type":"enum","required":true,"help":"","choices":[{"value":"millenaire","label":"Millénaire (Minecraft 1.21.1)"},{"value":"atm10","label":"All the Mods 10 (1.21.1)"},{"value":"bettermc","label":"Better MC [NeoForge] (1.21.1)"},{"value":"dawncraft","label":"DawnCraft (RPG · 1.18.2)"},{"value":"vaulthunters","label":"Vault Hunters (1.18.2)"},{"value":"prominence2","label":"Prominence II RPG (1.20.1)"},{"value":"pixelmon","label":"Pixelmon (Pokémon · 1.16.5)"},{"value":"valheim","label":"Valheim"},{"value":"palworld","label":"Palworld"},{"value":"satisfactory","label":"Satisfactory"},{"value":"sevendaystodie","label":"7 Days to Die"},{"value":"unturned","label":"Unturned"},{"value":"dontstarvetogether","label":"Don't Starve Together"},{"value":"arma3","label":"Arma 3"},{"value":"dragonwilds","label":"RuneScape: Dragonwilds"},{"value":"enshrouded","label":"Enshrouded"},{"value":"theforest","label":"The Forest"},{"value":"sonsoftheforest","label":"Sons of the Forest"},{"value":"sunkenland","label":"Sunkenland"},{"value":"windrose","label":"Windrose"}],"min":null,"max":null,"secret":false},{"name":"minutes","label":"Minutes empty before stopping","type":"number","required":false,"help":"","choices":null,"min":1,"max":10080,"secret":false},{"name":"clear","label":"Remove the override instead","type":"boolean","required":false,"help":"Falls back to the server-wide default","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"server.access","label":"Tailnet access","help":"The state of the invite link, who is barred, and what the bot cannot know.","group":"servers","emoji":"🔑","module":"game-servers","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"server.rotateInvite","label":"Rotate the tailnet invite","help":"Replace the share link members redeem. Mint the new one in Tailscale first, then paste it here.","group":"servers","emoji":"🔄","module":"game-servers","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"url","label":"New invite URL","type":"string","required":true,"help":"The share link Tailscale just gave you","choices":null,"min":null,"max":null,"secret":true},{"name":"force","label":"Save it without checking Tailscale first","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"server.revokeAccess","label":"Revoke someone's access","help":"Bar a member from the game servers, and say what still has to be done in Tailscale.","group":"servers","emoji":"🚫","module":"game-servers","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"case.open","label":"Open a case","help":"Record a numbered moderation case by hand — a note, or an action taken outside the console. Cases are per-server, numbered in order, and the number is never reused.","group":"members","emoji":"📁","module":"modlog","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"type","label":"What kind","type":"enum","required":true,"help":"","choices":[{"value":"note","label":"Note"},{"value":"warn","label":"Warn"},{"value":"timeout","label":"Timeout"},{"value":"untimeout","label":"Timeout lifted"},{"value":"kick","label":"Kick"},{"value":"softban","label":"Softban"},{"value":"ban","label":"Ban"},{"value":"tempban","label":"Temporary ban"},{"value":"unban","label":"Unban"},{"value":"temprole","label":"Temporary role"},{"value":"quarantine","label":"Quarantine"}],"min":null,"max":null,"secret":false},{"name":"reason","label":"Reason","type":"reason","required":true,"help":"What a colleague reading this in six months needs to know.","choices":null,"min":null,"max":null,"secret":false},{"name":"duration","label":"Duration","type":"duration","required":false,"help":"For a timeout or a temporary punishment — e.g. 45m, 3d. Recorded, not enforced (see help).","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"case.show","label":"Show a case","help":"One case by its number — who, what, when, why, and every edit it has had.","group":"members","emoji":"🔎","module":"modlog","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"case","label":"Case number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"case.history","label":"Case history","help":"Every case recorded against a member, newest first, with a count of what they add up to.","group":"members","emoji":"📜","module":"modlog","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false},{"name":"includeVoided","label":"Include voided cases","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"case.search","label":"Search cases","help":"Find cases by member, by the moderator who issued them, by kind, or by a word in the reason.","group":"members","emoji":"🗂️","module":"modlog","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"moderator","label":"Issued by","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"type","label":"Kind","type":"enum","required":false,"help":"","choices":[{"value":"note","label":"Note"},{"value":"warn","label":"Warn"},{"value":"timeout","label":"Timeout"},{"value":"untimeout","label":"Timeout lifted"},{"value":"kick","label":"Kick"},{"value":"softban","label":"Softban"},{"value":"ban","label":"Ban"},{"value":"tempban","label":"Temporary ban"},{"value":"unban","label":"Unban"},{"value":"temprole","label":"Temporary role"},{"value":"quarantine","label":"Quarantine"}],"min":null,"max":null,"secret":false},{"name":"text","label":"Words in the reason","type":"pattern","required":false,"help":"A plain substring. Reasons only — no message content is stored or searched.","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false},{"name":"includeVoided","label":"Include voided cases","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"case.reason","label":"Edit a case reason","help":"Correct or expand the reason on a case. The previous reason is KEPT in the case history — a record that can be silently rewritten is not a record.","group":"members","emoji":"✏️","module":"modlog","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"case","label":"Case number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"reason","label":"New reason","type":"reason","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"case.void","label":"Void a case","help":"Withdraw a case. It stops counting towards escalation and renders struck through — but the NUMBER is kept and the record stays, because a case number may never be reused and a deleted case is a moderation history that can be edited.","group":"members","emoji":"🚫","module":"modlog","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"case","label":"Case number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"reason","label":"Why it is being withdrawn","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"modlog.show","label":"Log routing","help":"Which staff-log events go to which channel, what is ignored, and which events are deliberately not available.","group":"guild","emoji":"🧭","module":"logging","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"modlog.default","label":"Log routing — master switch","help":"Turn staff logging on or off for the whole server, and set the channel that events without one of their own go to.","group":"guild","emoji":"🎚️","module":"logging","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"enabled","label":"Logging on","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Default log channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"modlog.route","label":"Log routing — one event","help":"Switch one kind of log entry on or off, and optionally give it a channel of its own. Leave the channel blank to use the default.","group":"guild","emoji":"🔀","module":"logging","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"event","label":"What to log","type":"enum","required":true,"help":"","choices":[{"value":"case.create","label":"New moderation case"},{"value":"case.update","label":"Case reason edited"},{"value":"case.void","label":"Case voided"},{"value":"member.join","label":"Member joined"},{"value":"member.leave","label":"Member left"},{"value":"member.ban","label":"Member banned"},{"value":"member.unban","label":"Member unbanned"},{"value":"member.roles","label":"Roles changed"},{"value":"member.nick","label":"Nickname changed"},{"value":"message.delete","label":"Message deleted (who / where / when)"},{"value":"message.edit","label":"Message edited (who / where / when)"},{"value":"message.bulkDelete","label":"Bulk delete (count / where / by whom)"},{"value":"channel.create","label":"Channel created"},{"value":"channel.delete","label":"Channel deleted"},{"value":"channel.update","label":"Channel updated"},{"value":"role.create","label":"Role created"},{"value":"role.delete","label":"Role deleted"},{"value":"role.update","label":"Role updated"},{"value":"invite.create","label":"Invite created"},{"value":"invite.delete","label":"Invite deleted"},{"value":"voice.join","label":"Joined a voice channel"},{"value":"voice.leave","label":"Left a voice channel"},{"value":"voice.move","label":"Moved between voice channels"}],"min":null,"max":null,"secret":false},{"name":"enabled","label":"Log it","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channel","label":"Channel (blank = the default)","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"modlog.ignore","label":"Log routing — ignores","help":"Stop logging anything from a channel, a category, a role or a member. Ignores apply to every event at once.","group":"guild","emoji":"🙈","module":"logging","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"kind","label":"Ignore what","type":"enum","required":true,"help":"","choices":[{"value":"channels","label":"Channel"},{"value":"categories","label":"Category"},{"value":"roles","label":"Role"},{"value":"users","label":"Member"}],"min":null,"max":null,"secret":false},{"name":"id","label":"Its id","type":"string","required":true,"help":"The channel, category, role or member id.","choices":null,"min":null,"max":null,"secret":false},{"name":"remove","label":"Remove it from the list instead","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"modlog.test","label":"Log routing — send a test entry","help":"Post one sample entry so you can see where it lands and what it looks like, without waiting for something to happen.","group":"guild","emoji":"🧪","module":"logging","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"event","label":"Which entry","type":"enum","required":true,"help":"","choices":[{"value":"case.create","label":"New moderation case"},{"value":"case.update","label":"Case reason edited"},{"value":"case.void","label":"Case voided"},{"value":"member.join","label":"Member joined"},{"value":"member.leave","label":"Member left"},{"value":"member.ban","label":"Member banned"},{"value":"member.unban","label":"Member unbanned"},{"value":"member.roles","label":"Roles changed"},{"value":"member.nick","label":"Nickname changed"},{"value":"message.delete","label":"Message deleted (who / where / when)"},{"value":"message.edit","label":"Message edited (who / where / when)"},{"value":"message.bulkDelete","label":"Bulk delete (count / where / by whom)"},{"value":"channel.create","label":"Channel created"},{"value":"channel.delete","label":"Channel deleted"},{"value":"channel.update","label":"Channel updated"},{"value":"role.create","label":"Role created"},{"value":"role.delete","label":"Role deleted"},{"value":"role.update","label":"Role updated"},{"value":"invite.create","label":"Invite created"},{"value":"invite.delete","label":"Invite deleted"},{"value":"voice.join","label":"Joined a voice channel"},{"value":"voice.leave","label":"Left a voice channel"},{"value":"voice.move","label":"Moved between voice channels"}],"min":null,"max":null,"secret":false},{"name":"channel","label":"Force a channel","type":"channel","required":false,"help":"Leave blank to use the configured route — which is the thing worth testing.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tickets.show","label":"Tickets — overview","help":"The whole ticket setup at a glance: whether it is on, every category and its staff roles, the limits, the auto-close policy, and what the transcript does and does not contain.","group":"guild","emoji":"🎫","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"tickets.setup","label":"Tickets — setup","help":"Turn the ticket system on or off, choose the category new ticket channels are created under, and set the channel closed tickets are archived to.","group":"guild","emoji":"⚙️","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"transcriptChannel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"state","label":"Tickets","type":"enum","required":false,"help":"Leave blank to change the other settings without touching it.","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false},{"name":"parent","label":"Create ticket channels under","type":"category","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"transcriptChannel","label":"Archive closed tickets to","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"disclosure","label":"What members are told on the panel","type":"reason","required":false,"help":"Shown on the ticket panel itself, before anyone types anything. It cannot be blank — the default is used instead, because a notice that can be deleted from a settings screen is not a notice.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tickets.category","label":"Tickets — category","help":"Add a ticket category, or change one. A category carries its own label, its own staff roles, its own ping and its own per-member limit — which is what lets one panel serve billing, reports and appeals without three panels.","group":"guild","emoji":"🗂️","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"key","label":"Category key","type":"string","required":true,"help":"A short stable id — lower-case letters, digits, - and _. It lands on every ticket, so it is refused rather than tidied up: silently slugging two different names onto one key would merge two categories' tickets.","choices":null,"min":null,"max":null,"secret":false},{"name":"label","label":"What members see","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"emoji","label":"Emoji","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"description","label":"One line of explanation","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"staffRole","label":"Staff role (can see and answer)","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"pingRole","label":"Ping this role on open","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"parent","label":"Create these channels under (overrides the default)","type":"category","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"channelName","label":"Channel name template","type":"string","required":false,"help":"Tokens: {id} {user} {userid} {category}.","choices":null,"min":null,"max":null,"secret":false},{"name":"perMemberOpen","label":"Max open per member in this category","type":"number","required":false,"help":"","choices":null,"min":0,"max":50,"secret":false},{"name":"state","label":"Accepting tickets","type":"enum","required":false,"help":"Leave blank to change the other settings without touching it.","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false}]},
    {"id":"tickets.categoryRemove","label":"Tickets — remove a category","help":"Take a category off the panel. Tickets already opened through it are NOT touched and keep their category on the record — deleting the history of which queue a ticket came through, because somebody tidied a settings screen, would be a silent rewrite.","group":"guild","emoji":"🗑️","module":"tickets","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"key","label":"Category key","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tickets.form","label":"Tickets — form","help":"The questions a member is asked when they open a ticket in this category — up to five, because that is Discord's ceiling for one form. The answers are kept with the ticket and appear in its transcript; the messages posted in the channel never are.","group":"guild","emoji":"📝","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"category","label":"Category key","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"questions","label":"The questions, one per line","type":"reason","required":true,"help":"One question per line, up to five. Send a single dash (-) to clear the form. Add \"|long\" after a question for a multi-line answer box.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tickets.policy","label":"Tickets — policy","help":"How many tickets one member may hold at once, the server-wide ceiling, the cooldown between opens, whether idle tickets close themselves, and whether members are asked to rate a ticket when it closes.","group":"guild","emoji":"⏳","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"perMember","label":"Open tickets per member (0 = no limit)","type":"number","required":false,"help":"","choices":null,"min":0,"max":50,"secret":false},{"name":"guildOpen","label":"Open tickets server-wide (0 = no limit)","type":"number","required":false,"help":"","choices":null,"min":0,"max":5000,"secret":false},{"name":"cooldownSeconds","label":"Cooldown between opens, in seconds (0 = none)","type":"number","required":false,"help":"","choices":null,"min":0,"max":86400,"secret":false},{"name":"autoClose","label":"Close idle tickets","type":"enum","required":false,"help":"","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false},{"name":"idleHours","label":"Idle for, in hours","type":"number","required":false,"help":"","choices":null,"min":1,"max":2160,"secret":false},{"name":"warnHours","label":"Warn this many hours before closing (0 = no warning)","type":"number","required":false,"help":"","choices":null,"min":0,"max":720,"secret":false},{"name":"rating","label":"Ask for a rating on close","type":"enum","required":false,"help":"","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false},{"name":"postTranscript","label":"Post the transcript to the archive channel on close","type":"enum","required":false,"help":"","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false}]},
    {"id":"tickets.panel","label":"Tickets — panel","help":"Publish the ticket panel into a channel, or refresh the one that is already there so it shows the current categories. Refreshing EDITS the existing message rather than posting a second one.","group":"guild","emoji":"📣","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":false,"help":"Leave blank to refresh where it already is.","choices":null,"min":null,"max":null,"secret":false},{"name":"style","label":"Style","type":"enum","required":false,"help":"","choices":[{"value":"buttons","label":"Buttons"},{"value":"select","label":"Dropdown"}],"min":null,"max":null,"secret":false},{"name":"title","label":"Panel title","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"blurb","label":"Panel text","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tickets.modmail","label":"Tickets — ModMail","help":"ModMail turns a member's direct message to the bot into a private staff thread, so somebody can raise something without opening a channel everyone can see is there. One thread per member, always.","group":"guild","emoji":"📬","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ViewChannel","SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"state","label":"ModMail","type":"enum","required":false,"help":"Leave blank to change the other settings without touching it.","choices":[{"value":"on","label":"On"},{"value":"off","label":"Off"}],"min":null,"max":null,"secret":false},{"name":"channel","label":"Staff channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"staffRole","label":"Staff role","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"disclosure","label":"What the member is told when they message","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"ticket.open","label":"Ticket — open","help":"Open a ticket on a member's behalf and create its private channel. Every limit, cooldown and permission the panel would apply is applied here too.","group":"members","emoji":"🎫","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"category","label":"Category key","type":"string","required":false,"help":"Leave blank for a ModMail thread.","choices":null,"min":null,"max":null,"secret":false},{"name":"note","label":"What it is about","type":"reason","required":false,"help":"Recorded as the first form answer.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"ticket.list","label":"Ticket — list","help":"What is open right now — who opened it, who has it, and how long it has been quiet. Filter by category, by member, or to just the ones nobody has claimed.","group":"members","emoji":"📋","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"state","label":"State","type":"enum","required":false,"help":"","choices":[{"value":"open","label":"Open"},{"value":"closed","label":"Closed"}],"min":null,"max":null,"secret":false},{"name":"category","label":"Category key","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"member","label":"Opened by","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"unclaimed","label":"Only unclaimed","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"ticket.show","label":"Ticket — show","help":"One ticket by its number — who opened it, what they were asked and answered, who has handled it, every transfer, and how it ended.","group":"members","emoji":"🔎","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"ticket","label":"Ticket number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"ticket.claim","label":"Ticket — claim","help":"Take ownership of a ticket, or give it back. A ticket somebody else has claimed is not taken silently — use transfer, so the hand-over is on the record.","group":"members","emoji":"✋","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"ticket","label":"Ticket number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"release","label":"Give it back to the pool instead","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"ticket.transfer","label":"Ticket — transfer","help":"Hand a ticket to another staff member, move it into a different category, or both. Every hand-over is kept on the ticket — a ticket that changed hands three times and shows only the last owner cannot answer who had it when it went wrong.","group":"members","emoji":"🔁","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"ticket","label":"Ticket number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"to","label":"Hand it to","type":"member","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"category","label":"Move it to this category key","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"ticket.close","label":"Ticket — close","help":"Close a ticket, write its transcript and archive it. By default the channel is LOCKED rather than deleted, so the member keeps the record of their own conversation and staff can reopen it.","group":"members","emoji":"🔒","module":"tickets","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"ticket","label":"Ticket number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"reason","label":"Why it is being closed","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"deleteChannel","label":"Delete the channel instead of locking it","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"ticket.transcript","label":"Ticket — transcript","help":"Export a ticket as an HTML file. It contains the ticket — who opened it, what they were asked and answered, who handled it, how it ended — and deliberately contains no message text at all.","group":"members","emoji":"🧾","module":"tickets","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"ticket","label":"Ticket number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"mode","label":"What to include","type":"enum","required":false,"help":"","choices":[{"value":"metadata","label":"Ticket record + the member's form answers"}],"min":null,"max":null,"secret":false}]},
    {"id":"ticket.purge","label":"Ticket — erase a member's tickets","help":"Delete a member's tickets and everything they typed into the ticket forms. This is the deletion path a data request is answered with, and it removes the rows outright rather than blanking them.","group":"members","emoji":"🗑️","module":"tickets","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"openToo","label":"Erase their OPEN tickets too","type":"boolean","required":false,"help":"Off by default: erasing an open ticket orphans a channel staff are still working in. On is for a right-to-erasure request, which is a deliberate and different act.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"engagement.feature","label":"Turn an engagement feature on or off","help":"Polls, suggestions, reminders, tags, the starboard, temporary voice rooms and birthdays. Every one of them is OFF until you switch it on — none of these has ever existed in this bot, so there is no running state a default could preserve.","group":"bot","emoji":"🎉","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"feature","label":"Feature","type":"enum","required":true,"help":"","choices":[{"value":"polls","label":"Polls"},{"value":"suggestions","label":"Suggestion board"},{"value":"reminders","label":"Reminders"},{"value":"tags","label":"Tags / custom commands"},{"value":"starboard","label":"Starboard"},{"value":"tempVoice","label":"Temporary voice rooms"},{"value":"birthdays","label":"Birthdays"}],"min":null,"max":null,"secret":false},{"name":"on","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"engagement.content","label":"What reads your members’ messages","help":"Every feature that would read message content, whether it is switched on here, and what each one reads. Eleven other engagement features read nothing privileged at all.","group":"bot","emoji":"📖","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"engagement.content.set","label":"Allow a feature to read messages","help":"Some features cannot work without reading what members type. Every one of them is off in every server until somebody turns it on here, and turning one on widens what this bot has to declare to Discord about the data it reads.","group":"bot","emoji":"⚠️","module":"engagement","permission":"owner","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"feature","label":"Feature","type":"enum","required":true,"help":"","choices":[{"value":"autoresponders","label":"Autoresponders"},{"value":"highlights","label":"Keyword highlights"},{"value":"starboard.text","label":"Starboard — quote the starred message"},{"value":"translation","label":"Message translation"},{"value":"bumps.detect","label":"Bump reminders — detect the bump automatically"}],"min":null,"max":null,"secret":false},{"name":"on","label":"Allow it","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"poll.open","label":"Open a poll","help":"A question with up to twenty options and one vote per member. It closes on its own.","group":"bot","emoji":"🗳️","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages","ViewChannel"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"question","label":"Question","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"options","label":"Options","type":"string","required":true,"help":"Separated by `|` — e.g. `Pizza | Pasta | Neither`.","choices":null,"min":null,"max":null,"secret":false},{"name":"duration","label":"Runs for","type":"duration","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"multi","label":"Allow more than one answer","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"anonymous","label":"Hide who voted","type":"boolean","required":false,"help":"The totals stay public either way.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"poll.close","label":"Close a poll now","help":"Stop taking votes and publish the result, without waiting for the timer.","group":"bot","emoji":"⏹️","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"poll","label":"Poll number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"poll.show","label":"Show a poll","help":"One poll and its running totals.","group":"bot","emoji":"🔎","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"poll","label":"Poll number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"suggestions.setup","label":"Suggestion board","help":"Where suggestions are posted, where decisions are announced, and whether submitters are named.","group":"bot","emoji":"💡","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Suggestion channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"decisions","label":"Decisions channel","type":"channel","required":false,"help":"Leave blank to announce in the same place.","choices":null,"min":null,"max":null,"secret":false},{"name":"anonymous","label":"Hide who submitted","type":"boolean","required":false,"help":"Staff can always see. Only the card is anonymous.","choices":null,"min":null,"max":null,"secret":false},{"name":"autoThread","label":"Open a thread on each one","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"suggestion.decide","label":"Answer a suggestion","help":"Approve, deny, mark implemented or mark duplicate — with a note the submitter can read. The previous status is kept, because a record whose changes are invisible can be quietly rewritten.","group":"bot","emoji":"✅","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"suggestion","label":"Suggestion number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"status","label":"Decision","type":"enum","required":true,"help":"","choices":[{"value":"approved","label":"Approved"},{"value":"denied","label":"Denied"},{"value":"implemented","label":"Implemented"},{"value":"duplicate","label":"Duplicate"}],"min":null,"max":null,"secret":false},{"name":"note","label":"Note","type":"reason","required":false,"help":"Why. The submitter sees this.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"suggestion.list","label":"Suggestions","help":"The board, newest or best-scoring first.","group":"bot","emoji":"📋","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"status","label":"Status","type":"enum","required":false,"help":"","choices":[{"value":"open","label":"Open"},{"value":"approved","label":"Approved"},{"value":"denied","label":"Denied"},{"value":"implemented","label":"Implemented"},{"value":"duplicate","label":"Duplicate"}],"min":null,"max":null,"secret":false},{"name":"sort","label":"Order","type":"enum","required":false,"help":"","choices":[{"value":"new","label":"Newest first"},{"value":"top","label":"Best scoring first"}],"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"tag.set","label":"Add or edit a tag","help":"A named canned response — `rules`, `ip`, `faq`. Summoned by a slash command, NOT by a message prefix: a prefix would mean reading every message in the server to notice one character.","group":"bot","emoji":"🏷️","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"name","label":"Name","type":"string","required":true,"help":"Lowercase letters, numbers, `-` and `_`.","choices":null,"min":null,"max":null,"secret":false},{"name":"content","label":"What it says","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"aliases","label":"Also answers to","type":"string","required":false,"help":"Comma separated.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tag.delete","label":"Delete a tag","help":"Remove a canned response.","group":"bot","emoji":"🗑️","module":"engagement","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"name","label":"Name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tag.list","label":"Tags","help":"Every tag, and how often each has been used — the number that tells you which ones to delete.","group":"bot","emoji":"📋","module":"engagement","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"sort","label":"Order","type":"enum","required":false,"help":"","choices":[{"value":"name","label":"By name"},{"value":"uses","label":"Most used first"}],"min":null,"max":null,"secret":false}]},
    {"id":"starboard.setup","label":"Starboard","help":"React with a star and a message gets highlighted in a board channel. The entry shows who posted, where, the star count and a link — it does NOT copy the message text, which is what lets it work in every server without a privileged intent.","group":"bot","emoji":"⭐","module":"starboard","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages","ViewChannel"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Board channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"emoji","label":"Emoji","type":"string","required":false,"help":"Defaults to ⭐.","choices":null,"min":null,"max":null,"secret":false},{"name":"threshold","label":"Stars needed","type":"count","required":false,"help":"","choices":null,"min":1,"max":1000,"secret":false},{"name":"allowSelfStar","label":"Let people star their own","type":"boolean","required":false,"help":"Off by default — a self-star makes a threshold of 3 into a threshold of 2.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"starboard.top","label":"Most-starred messages","help":"The board leaderboard.","group":"bot","emoji":"🏆","module":"starboard","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"tempvoice.hub","label":"Join-to-create hub","help":"A voice channel that gives anybody who joins it their own room, which disappears when they leave.","group":"bot","emoji":"🔊","module":"temp-voice","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels","MoveMembers"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Hub channel","type":"channel","required":true,"help":"The voice channel members join to get a room.","choices":null,"min":null,"max":null,"secret":false},{"name":"category","label":"Put rooms in","type":"category","required":false,"help":"Leave blank to use the hub's own category.","choices":null,"min":null,"max":null,"secret":false},{"name":"template","label":"Room name","type":"string","required":false,"help":"Use `{user}` for their name. Defaults to `{user}'s room`.","choices":null,"min":null,"max":null,"secret":false},{"name":"userLimit","label":"Room size","type":"count","required":false,"help":"","choices":null,"min":1,"max":99,"secret":false},{"name":"private","label":"Private rooms","type":"boolean","required":false,"help":"Only the owner and whoever they invite can join.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tempvoice.hub.remove","label":"Remove a hub","help":"Stop a channel handing out rooms. Rooms that already exist are left alone and swept normally.","group":"bot","emoji":"🗑️","module":"temp-voice","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"channel","label":"Hub channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"tempvoice.sweep","label":"Sweep empty rooms","help":"Delete temporary rooms that have been empty long enough, and forget any that no longer exist. This is the reconciler — it is what stops a restart leaving a category full of dead rooms.","group":"bot","emoji":"🧹","module":"temp-voice","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageChannels"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[]},
    {"id":"birthdays.setup","label":"Birthdays","help":"Where birthdays are announced, at what hour, and whether a role is given for the day. Members set their own; the year is always optional.","group":"members","emoji":"🎂","module":"birthdays","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages","ViewChannel"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Announce in","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"role","label":"Birthday role","type":"role","required":false,"help":"Given for the day. It has to be below the bot's highest role.","choices":null,"min":null,"max":null,"secret":false},{"name":"atHour","label":"At (hour)","type":"number","required":false,"help":"In this server's timezone. 0 is midnight.","choices":null,"min":0,"max":23,"secret":false},{"name":"showAge","label":"Show ages","type":"boolean","required":false,"help":"Only for members who chose to give a year. Off by default.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"birthday.set","label":"Set a member’s birthday","help":"Day and month. The year is optional and is only stored if it is given — an age is more information than an announcement needs.","group":"members","emoji":"🎈","module":"birthdays","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"month","label":"Month","type":"count","required":true,"help":"","choices":null,"min":1,"max":12,"secret":false},{"name":"day","label":"Day","type":"count","required":true,"help":"","choices":null,"min":1,"max":31,"secret":false},{"name":"year","label":"Year","type":"count","required":false,"help":"Optional. Leave it out and no age is ever shown.","choices":null,"min":1900,"max":null,"secret":false}]},
    {"id":"birthday.clear","label":"Delete a member’s birthday","help":"Remove a birthday completely. Nothing is kept.","group":"members","emoji":"🗑️","module":"birthdays","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"birthday.today","label":"Birthdays today","help":"Whose birthday it is right now, in this server's timezone — and who is next.","group":"members","emoji":"🎉","module":"birthdays","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"reminder.list","label":"Reminders","help":"Every reminder set in this server, or one member's.","group":"members","emoji":"⏰","module":"reminders","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":false,"help":"Leave blank for everybody's.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"reminder.cancel","label":"Cancel a reminder","help":"Remove a reminder somebody set.","group":"members","emoji":"🚫","module":"reminders","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"reminder","label":"Reminder number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"giveaway.start","label":"Start a giveaway","help":"Run a timed giveaway with a button to enter. The prize can be something you hand over yourself, or $ Bucks paid automatically out of your own balance.","group":"bot","emoji":"🎁","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages","ViewChannel"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"kind","label":"Prize","type":"enum","required":true,"help":"","choices":[{"value":"text","label":"Something you hand over yourself"},{"value":"currency","label":"$ Bucks, paid automatically"}],"min":null,"max":null,"secret":false},{"name":"prize","label":"What they win","type":"string","required":false,"help":"For a hand-over prize — a game key, a role, a shout-out.","choices":null,"min":null,"max":null,"secret":false},{"name":"amount","label":"$ per winner","type":"count","required":false,"help":"Only for a $ prize. This much goes to EACH winner.","choices":null,"min":1,"max":null,"secret":false},{"name":"winners","label":"Winners","type":"count","required":false,"help":"How many people win. Defaults to one.","choices":null,"min":1,"max":null,"secret":false},{"name":"duration","label":"Runs for","type":"duration","required":true,"help":"e.g. 2h, 3d.","choices":null,"min":null,"max":null,"secret":false},{"name":"claimWindow","label":"Claim window","type":"duration","required":false,"help":"How long a winner has to claim. Defaults to 24h.","choices":null,"min":null,"max":null,"secret":false},{"name":"requiredRole","label":"Must have role","type":"role","required":false,"help":"Only members with this role can enter.","choices":null,"min":null,"max":null,"secret":false},{"name":"minLevel","label":"Minimum level","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"minAccountAge","label":"Minimum account age","type":"duration","required":false,"help":"Keeps brand-new alt accounts out — e.g. 30d.","choices":null,"min":null,"max":null,"secret":false},{"name":"bonusRole","label":"Bonus entries for","type":"role","required":false,"help":"Members with this role get extra tickets.","choices":null,"min":null,"max":null,"secret":false},{"name":"bonusEntries","label":"Extra tickets","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"giveaway.end","label":"End a giveaway now","help":"Draw the winners immediately instead of waiting for the timer. Everybody who has entered is in.","group":"bot","emoji":"⏹️","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"giveaway.reroll","label":"Reroll a winner","help":"Draw a replacement for somebody who did not claim. A prize that has already been paid cannot be rerolled — that would either pay it twice or take money back out of a member's balance.","group":"bot","emoji":"🎲","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"member","label":"Replace","type":"member","required":false,"help":"Leave blank to replace everybody who has not claimed.","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"giveaway.cancel","label":"Cancel a giveaway","help":"Stop a running giveaway before it draws. Any escrow goes straight back to whoever funded it.","group":"bot","emoji":"🚫","module":"giveaways","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"reason","label":"Why","type":"reason","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"giveaway.close","label":"Close a finished giveaway","help":"Tidy up after every claim window has closed, and return whatever escrow is left to the host. It refuses while somebody still has time to claim.","group":"bot","emoji":"📦","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"giveaway.show","label":"Show a giveaway","help":"One giveaway — who entered, who won, what has been claimed, and where the money is.","group":"bot","emoji":"🔎","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"giveaway.list","label":"Giveaways","help":"Every giveaway in this server, newest first, with how much is held in escrow.","group":"bot","emoji":"📋","module":"giveaways","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"state","label":"State","type":"enum","required":false,"help":"","choices":[{"value":"funding","label":"Being funded"},{"value":"running","label":"Running"},{"value":"ended","label":"Drawn"},{"value":"closed","label":"Closed"},{"value":"cancelled","label":"Cancelled"}],"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":50,"secret":false}]},
    {"id":"giveaway.reconcile","label":"Settle an unconfirmed prize","help":"A prize is marked **unconfirmed** when the ledger was written but the payment could not be confirmed — it may or may not have landed, so the bot will never send it again on its own. Check the member's $ ledger, then say what actually happened.","group":"bot","emoji":"🧾","module":"giveaways","permission":"owner","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"giveaway","label":"Giveaway number","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"member","label":"Winner","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"verdict","label":"What happened","type":"enum","required":true,"help":"","choices":[{"value":"paid","label":"They were paid — mark it settled"},{"value":"unpaid","label":"They were not paid — let them claim again"}],"min":null,"max":null,"secret":false}]},
    {"id":"levels.reward.set","label":"Role reward — set","help":"At level N, grant a role. Optionally take back every reward role below it.","group":"bot","emoji":"🏅","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":null},"params":[{"name":"level","label":"Level","type":"count","required":true,"help":"","choices":null,"min":1,"max":100,"secret":false},{"name":"role","label":"Role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"removePrevious","label":"Remove lower reward roles","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.reward.clear","label":"Role reward — clear","help":"Drop a rung from the ladder. Nobody loses a role they already hold.","group":"bot","emoji":"🧹","module":"leveling-pro","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"level","label":"Level (blank = any)","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false},{"name":"role","label":"Role (blank = any)","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.reward.list","label":"Role rewards","help":"The whole level → role ladder.","group":"bot","emoji":"📋","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"levels.reward.sync","label":"Role reward — sync a member","help":"Give a member every reward role their level has earned. Optionally take back ones they should not have.","group":"bot","emoji":"🔄","module":"leveling-pro","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"prune","label":"Also remove roles above their level","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.multiplier","label":"XP multiplier","help":"Boosters earn 1.5×, a channel counts double. Set 1 to clear.","group":"bot","emoji":"⚖️","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"kind","label":"On a","type":"enum","required":true,"help":"","choices":[{"value":"role","label":"Role"},{"value":"channel","label":"Channel"}],"min":null,"max":null,"secret":false},{"name":"id","label":"Role or channel id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"value","label":"Multiplier","type":"number","required":true,"help":"","choices":null,"min":1,"max":10,"secret":false}]},
    {"id":"levels.noxp","label":"No-XP channel or role","help":"Bot-spam channels should not count. A blocked channel or role earns nothing at all.","group":"bot","emoji":"🚫","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"kind","label":"On a","type":"enum","required":true,"help":"","choices":[{"value":"channel","label":"Channel"},{"value":"role","label":"Role"}],"min":null,"max":null,"secret":false},{"name":"id","label":"Channel or role id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"on","label":"Blocked","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.rules","label":"XP rules","help":"Every multiplier and every no-XP channel or role.","group":"bot","emoji":"📐","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"levels.message","label":"Level-up message","help":"Tokens: {user} {mention} {level} {rank} {server} {xp} {prestige}. Leave blank to restore the default.","group":"bot","emoji":"📣","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"template","label":"Message","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.message.channel","label":"Level-up channel","help":"Where level-ups are announced. Blank falls back to the server default.","group":"bot","emoji":"#️⃣","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["SendMessages"],"mode":"all","scope":"channel","param":"channel","hierarchy":null,"hierarchyParam":null,"verb":null},"params":[{"name":"channel","label":"Channel","type":"channel","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.message.every","label":"Announce every level","help":"Off = only on a new RANK (today's behaviour). On = every single level.","group":"bot","emoji":"🔔","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"on","label":"Every level","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.board.period","label":"Weekly / monthly XP board","help":"Who earned the most XP this week or this month.","group":"bot","emoji":"📅","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"period","label":"Period","type":"enum","required":false,"help":"","choices":[{"value":"week","label":"This week"},{"value":"month","label":"This month"}],"min":null,"max":null,"secret":false},{"name":"when","label":"Which","type":"enum","required":false,"help":"","choices":[{"value":"current","label":"Current"},{"value":"previous","label":"Previous"}],"min":null,"max":null,"secret":false},{"name":"limit","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":25,"secret":false}]},
    {"id":"levels.card.style","label":"Rank card style","help":"Accent and background colour as #rrggbb. Blank restores the rank-based default.","group":"bot","emoji":"🎨","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"accent","label":"Accent (#rrggbb)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"background","label":"Background (#rrggbb)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"showBio","label":"Show member bios","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.card.preview","label":"Rank card — render check","help":"Builds a real card for a member and reports whether the image rendered.","group":"bot","emoji":"🖼️","module":"leveling-pro","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.import.mee6","label":"Import levels from MEE6","help":"Paste MEE6's leaderboard JSON. Levels can only go UP — nobody is ever lowered.","group":"bot","emoji":"📥","module":"level-import","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"payload","label":"MEE6 leaderboard JSON","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"membersOnly","label":"Skip people who have left","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"levels.import.arcane","label":"Import levels from Arcane (roles)","help":"Arcane publishes no export, so this reads the rank ROLES it assigned. Map one role to one level at a time.","group":"bot","emoji":"🔮","module":"level-import","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"role","label":"Arcane rank role","type":"role","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"level","label":"The level it represents","type":"count","required":true,"help":"","choices":null,"min":1,"max":100,"secret":false}]},
    {"id":"levels.import.history","label":"Import history","help":"What the last few imports did.","group":"bot","emoji":"🧾","module":"level-import","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"shop.item.add","label":"Shop — add or edit an item","help":"A role, a cosmetic, a collectible, or a timed consumable. Prices are in earned currency only.","group":"bot","emoji":"🏷️","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":{"need":["ManageRoles"],"mode":"all","scope":"guild","param":null,"hierarchy":"role","hierarchyParam":["role"],"verb":null},"params":[{"name":"sku","label":"Item id (lowercase)","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"kind","label":"Kind","type":"enum","required":true,"help":"","choices":[{"value":"role","label":"role — grants a role"},{"value":"cosmetic","label":"cosmetic — a cosmetic badge"},{"value":"collectible","label":"collectible — a collectible"},{"value":"xp-multiplier","label":"xp-multiplier — multiplies earned XP"},{"value":"rob-shield","label":"rob-shield — blocks one robbery"},{"value":"luck","label":"luck — improves robbery odds"}],"min":null,"max":null,"secret":false},{"name":"name","label":"Display name","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"price","label":"Price","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"desc","label":"Description","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"emoji","label":"Emoji","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"role","label":"Role (role items only)","type":"role","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"magnitude","label":"Strength (boost items only)","type":"number","required":false,"help":"","choices":null,"min":1.01,"max":5,"secret":false},{"name":"duration","label":"How long it lasts (timed items)","type":"duration","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"limitPerMember","label":"Max one member may hold","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"stock","label":"Total ever sold (blank = unlimited)","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"requiresLevel","label":"Unlocks at level","type":"count","required":false,"help":"","choices":null,"min":1,"max":100,"secret":false},{"name":"sellable","label":"Can be sold back (at half price)","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.item.remove","label":"Shop — remove an item","help":"Takes it off the shelf. Members who already bought it KEEP it.","group":"bot","emoji":"🗑️","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"sku","label":"Item id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.list","label":"Shop — what is for sale","help":"Every item, including hidden and sold-out ones.","group":"bot","emoji":"📜","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"shop.currency","label":"Currency name & symbol","help":"What this server calls its money. Presentation only — no balance changes.","group":"bot","emoji":"💱","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"name","label":"Singular name (e.g. Credit)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"symbol","label":"Symbol (max 4 characters)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"plural","label":"Plural (blank = name + s)","type":"string","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.inventory","label":"Inventory — what a member owns","help":"Their items and any effect currently running.","group":"bot","emoji":"🎒","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.grant","label":"Shop — give an item","help":"Hand a member an item for free. Prizes, apologies, compensation.","group":"bot","emoji":"🎁","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"sku","label":"Item id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"qty","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"shop.revoke","label":"Shop — take an item back","help":"Remove an item from a member. No refund — use Economy → Grant if they should be paid back.","group":"bot","emoji":"↩️","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"member","label":"Member","type":"member","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"sku","label":"Item id","type":"string","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false},{"name":"qty","label":"How many","type":"count","required":false,"help":"","choices":null,"min":1,"max":null,"secret":false}]},
    {"id":"shop.feature","label":"Economy extras — on or off","help":"Robbing, raffles and member-to-member trading. All on unless switched off.","group":"bot","emoji":"🎚️","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"feature","label":"Feature","type":"enum","required":true,"help":"","choices":[{"value":"rob","label":"Robbing"},{"value":"lottery","label":"Raffles"},{"value":"trade","label":"Trading"}],"min":null,"max":null,"secret":false},{"name":"on","label":"On","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.lottery.open","label":"Raffle — open","help":"Server-wide pot. Every ticket bought goes to the winner; the house takes nothing.","group":"bot","emoji":"🎟️","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"price","label":"Ticket price","type":"count","required":true,"help":"","choices":null,"min":1,"max":null,"secret":false},{"name":"duration","label":"How long it runs","type":"duration","required":true,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.lottery.status","label":"Raffle — status","help":"Who has entered, how many tickets are out, the size of the pot and when it draws. Reads only — it never opens, closes or cancels anything.","group":"bot","emoji":"🔎","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[]},
    {"id":"shop.lottery.draw","label":"Raffle — draw","help":"Pick a winner and pay the whole pot. Weighted by tickets.","group":"bot","emoji":"🎲","module":"economy","permission":"admin","destructive":false,"confirm":false,"dryRun":false,"bulk":false,"composite":false,"botPermission":null,"params":[{"name":"force","label":"Draw early","type":"boolean","required":false,"help":"","choices":null,"min":null,"max":null,"secret":false}]},
    {"id":"shop.lottery.cancel","label":"Raffle — cancel and refund","help":"Refunds every ticket. Never destroys the pot.","group":"bot","emoji":"🚫","module":"economy","permission":"admin","destructive":true,"confirm":true,"dryRun":true,"bulk":false,"composite":false,"botPermission":null,"params":[]},
  ],
  };
  /* ---- END GENERATED REGISTRY ---- */

  /* Generated alongside the registry above — adminactions.js's exported
     GROUP_MODULE. This is the DEFAULT module of a whole tab, and nothing more:
     an action may override it with `module:`, and 22 of the 221 do. Entitlement
     therefore reads `action.module` (per control), never this table. This is kept
     for the one question that is genuinely per-TAB — "is this whole tab dark?" */
  var GROUP_MODULE = {
    "overview": "admin-console",
    "members": "admin-console",
    "channels": "admin-console",
    "roles": "admin-console",
    "guild": "admin-console",
    "bot": "admin-console",
    "data": "admin-console",
    "settings": "admin-console",
    "blueprints": "blueprints",
    "media": "screening-room",
    "servers": "game-servers"
  };

  var ACTION_BY_ID = {};
  var ACTIONS_BY_GROUP = {};

  /* ⚠ ACTIONS_BY_MODULE AND MODULE_GROUPS ARE DERIVED, NEVER AUTHORED.
     This file used to hand-maintain a `MODULE_UI[].groups` table saying which
     console tabs configure which product. It was wrong in two ways that both
     showed a customer a wrong number:

       · it mapped `bridge -> ['overview']`, reading the `bridge.*` id prefix as
         the self-host bridge module. That prefix means "redirects to a legacy
         card" and its eleven actions belong to SIX different modules;
       · counting a module's controls by summing its tabs over-counts every time
         an action overrides its tab's module. `admin-console` summed to 178
         when the true figure is 162 — 22 actions carry a `module:` of their own.

     Now that `describe()` serialises `module` per action, both fall out of the
     data. A module's control count is the number of controls that say they
     belong to it, and its tabs are the tabs those controls actually live on. */
  var ACTIONS_BY_MODULE = {};
  var MODULE_GROUPS = {};

  (function indexRegistry() {
    for (var i = 0; i < REGISTRY.groups.length; i++) ACTIONS_BY_GROUP[REGISTRY.groups[i].id] = [];
    for (var j = 0; j < REGISTRY.actions.length; j++) {
      var a = REGISTRY.actions[j];
      ACTION_BY_ID[a.id] = a;
      (ACTIONS_BY_GROUP[a.group] || (ACTIONS_BY_GROUP[a.group] = [])).push(a);
      (ACTIONS_BY_MODULE[a.module] || (ACTIONS_BY_MODULE[a.module] = [])).push(a);
      var gs = MODULE_GROUPS[a.module] || (MODULE_GROUPS[a.module] = []);
      if (gs.indexOf(a.group) < 0) gs.push(a.group);
    }
    /* Keep each module's tabs in the console's own tab order, so a settings page
       lists them the way the Discord tab bar does rather than by first hit. */
    var order = REGISTRY.groups.map(function (g) { return g.id; });
    Object.keys(MODULE_GROUPS).forEach(function (m) {
      MODULE_GROUPS[m].sort(function (x, y) { return order.indexOf(x) - order.indexOf(y); });
    });
  })();

  function modActions(id) { return ACTIONS_BY_MODULE[id] || []; }
  function modGroups(id) { return MODULE_GROUPS[id] || []; }

  /* =======================================================================
     2 · PARAM TYPES — ported from src/lib/adminactions.js, unchanged
     -----------------------------------------------------------------------
     `coerce` normalises whatever a surface sent into the shape run() expects;
     `check` returns an error string or null. Neither ever throws.
     ======================================================================= */

  function idCoerce(v) {
    if (v == null || v === '') return null;
    var s = String(v).trim();
    var m = /(\d{17,20})/.exec(s);
    return m ? m[1] : s;
  }
  function idCheck(v, p) {
    if (v == null) return p.required ? (p.label || p.name) + ' is required' : null;
    return /^\d{17,20}$/.test(String(v)) ? null : (p.label || p.name) + ' must be a Discord id';
  }

  var TYPES = {
    string: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function (v, p) { return (p.required && !v) ? (p.label || p.name) + ' is required' : null; }
    },
    reason: {
      coerce: function (v) { return v == null ? null : String(v).slice(0, 512); },
      check: function () { return null; }
    },
    pattern: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function () { return null; }
    },
    number: {
      coerce: function (v) { return (v === '' || v == null) ? null : Number(v); },
      check: function (v, p) {
        if (v == null) return p.required ? (p.label || p.name) + ' is required' : null;
        if (!isFinite(v)) return (p.label || p.name) + ' must be a number';
        if (p.min != null && v < p.min) return (p.label || p.name) + ' must be at least ' + p.min;
        if (p.max != null && v > p.max) return (p.label || p.name) + ' must be at most ' + p.max;
        return null;
      }
    },
    count: {
      coerce: function (v) { return (v == null || v === '') ? null : Math.floor(Number(v)); },
      check: function (v, p) {
        return (v != null && (!isFinite(v) || v < 1)) ? (p.label || p.name) + ' must be 1 or more' : null;
      }
    },
    boolean: {
      coerce: function (v) { return v === true || v === 'true' || v === 1 || v === '1'; },
      check: function () { return null; }
    },
    enum: {
      coerce: function (v) { return v == null ? null : String(v); },
      check: function (v, p) {
        if (v == null || !p.choices) return null;
        for (var i = 0; i < p.choices.length; i++) {
          var c = p.choices[i];
          var val = (c && typeof c === 'object' && c.value !== undefined) ? c.value : c;
          if (val === v) return null;
        }
        return v + ' is not one of the choices';
      }
    },
    member:   { coerce: idCoerce, check: idCheck },
    channel:  { coerce: idCoerce, check: idCheck },
    category: { coerce: idCoerce, check: idCheck },
    role:     { coerce: idCoerce, check: idCheck },
    duration: {
      coerce: function (v) {
        if (v == null || v === '') return null;
        if (typeof v === 'number') return v;
        var m = /^(\d+)\s*(s|m|h|d|w)$/i.exec(String(v).trim());
        if (!m) return Number(v);
        var mult = { s: 1e3, m: 6e4, h: 3.6e6, d: 8.64e7, w: 6.048e8 }[m[2].toLowerCase()];
        return Number(m[1]) * mult;
      },
      check: function (v, p) {
        if (v == null) return p.required ? (p.label || p.name) + ' is required' : null;
        if (!isFinite(v) || v <= 0) return (p.label || p.name) + ' must be a duration like 10m or 1h';
        return null;
      }
    }
  };

  /** Coerce + validate one call's params. Returns { ok, values, errors, fieldErrors }. */
  function validate(action, raw) {
    raw = raw || {};
    var values = {}, errors = [], fieldErrors = {};
    for (var i = 0; i < action.params.length; i++) {
      var p = action.params[i];
      var t = TYPES[p.type];
      var v = t.coerce(raw[p.name]);
      var err = t.check(v, p);
      if (err) { errors.push(err); fieldErrors[p.name] = err; }
      values[p.name] = v;
    }
    return { ok: errors.length === 0, values: values, errors: errors, fieldErrors: fieldErrors };
  }

  /* =======================================================================
     3 · ⚠⚠ PRICING — THE ONE OBJECT TO SWAP ⚠⚠
     =======================================================================
     EVERY plan name, price, allowance and metered rate on billing.html comes
     from here and NOTHING is written into markup. Swapping the final ladder is
     a one-object edit in this file; no HTML and no render function changes.

     ORGANISING PRINCIPLE (owner decision, 2026-08-05):
       The subscription buys FEATURES.
       Media egress and AI are the two USAGE-BASED lines, billed separately,
       because a subscription cannot both be cheap and subsidise bandwidth.

     ⚠ `_provisional: true` means the numbers below are the PLACEHOLDER ladder
     from the current docs/_platform/PRICING.md §1, which is being revised
     DOWNWARD to undercut the market. Anything carrying that flag renders with a
     visible "provisional" marker on the page, so a screenshot of this build can
     never be mistaken for a published price list.

     ⚠ assets/mock-data.js carries a THIRD, older placeholder ladder (Hearth /
     Steading / Longhouse) whose own comment says "replace this whole object".
     It is not read here. mock-data.js is used only for shared world fixtures.
     ======================================================================= */

  var PRICING = {
    _provisional: true,
    _source: 'docs/_platform/PRICING.md §1 and §7 at 2026-08-05. Ladder is being revised downward; treat every figure as unpublished.',
    currency: 'USD',
    symbol: '$',

    /* ---- What the subscription buys: features. ------------------------- */
    plans: [
      {
        id: 'free', name: 'Free', monthly: 0, annual: null, annualPerMo: null,
        _provisional: false,
        memberCeiling: null,
        blurb: 'Genuinely useful, deliberately incomplete.',
        ceilingNote: 'No member cap — fair use.',
        meteredNote: 'No relay allowance. The screening room is not included, so there is nothing to meter.'
      },
      {
        id: 'community', name: 'Community', monthly: 5, annual: 49, annualPerMo: 4.08,
        _provisional: true,
        memberCeiling: 10000,
        blurb: 'The money game, the recap, and your full stats history.',
        ceilingNote: 'Up to 10,000 members.',
        meteredNote: 'No relay allowance.'
      },
      {
        id: 'pro', name: 'Pro', monthly: 12, annual: 119, annualPerMo: 9.92,
        _provisional: true, popular: true,
        memberCeiling: 10000,
        blurb: 'The screening room, the game servers, the API and the bridge.',
        ceilingNote: 'Up to 10,000 members.',
        meteredNote: 'Includes a monthly media-egress allowance; see the metered lines.'
      },
      {
        id: 'studio', name: 'Studio', monthly: 29, annual: 290, annualPerMo: 24.17,
        _provisional: true,
        memberCeiling: 50000,
        blurb: 'Six times the bandwidth, and the second screen.',
        ceilingNote: 'Up to 50,000 members.',
        meteredNote: 'The largest included egress allowance.'
      },
      {
        id: 'sovereign', name: 'Sovereign', monthly: 19, annual: 190, annualPerMo: 15.83,
        _provisional: true, selfHost: true,
        memberCeiling: null,
        blurb: 'Your metal. Every paid module licensed, plus the hosted relay.',
        ceilingNote: 'No member cap.',
        meteredNote: 'The hosted relay is the piece a residential upload line genuinely cannot do.'
      },
      {
        id: 'enterprise', name: 'Enterprise', monthly: null, annual: null, custom: true,
        _provisional: false,
        memberCeiling: null,
        blurb: 'Past 50,000 members, or data residency. A conversation, not a checkout.',
        ceilingNote: 'Above 50,000 members.',
        meteredNote: 'Negotiated.'
      }
    ],

    /* ---- The two usage-based lines. NEITHER is included in any plan. ----
       Both obey the same safety shape, and it is not a courtesy: it is the
       only configuration in which a bug in a meter cannot bankrupt a customer,
       and both meters are new code metering something expensive.
           default OFF · opt-in · owner-set hard cap
           notice → degrade → refuse, and the refusal is the failure mode      */
    metered: [
      {
        id: 'egress',
        name: 'Media egress',
        available: true,
        icon: 'cloud',
        unit: 'GB',
        what: 'Bytes delivered to viewers by the hosted relay.',
        why: 'A six-hour watch party for twenty viewers is roughly 200 GB. This is the one cost that can make a single server cost more than a hundred others.',
        /* Allowance included with each plan id. Sized at a planning rate that
           has no signed contract behind it — see the caveat below. */
        includedByPlan: { free: 0, community: 0, pro: 250, studio: 1500, sovereign: 250, enterprise: null },
        includedNote: {
          pro: '≈ 150 viewer-hours ≈ 6 movie nights',
          studio: '≈ 900 viewer-hours ≈ 36 movie nights',
          sovereign: '≈ 150 viewer-hours ≈ 6 movie nights'
        },
        /* PRICING §3.2: bill in bytes, display in BOTH bytes and viewer-hours.
           Never quote only viewer-hours — the conversion is a rendition
           property we control and could change. */
        gbPerViewerHour: 1.667,
        overage: {
          _provisional: true,
          perUnit: 0.02, blockSize: 100, blockPrice: 2.00,
          defaultOn: false,
          offMeans: 'With overage off, the failure mode is a stopped stream — never a $400 invoice.',
          onMeans: 'Billed per 100 GB block, and never past the monthly ceiling you set.'
        },
        ladder: [
          { at: 80,  label: '80%',  what: 'Notice in your admin channel. Nothing changes.', who: 'Owner and admins' },
          { at: 100, label: '100%', what: 'Rendition drops to 720p — about half the bytes. <b>Nothing stops.</b> That buys roughly 2× headroom on its own.', who: 'Owner and the room, once' },
          { at: 150, label: '150%', what: 'New screenings refuse to start. <b>A screening already playing runs to its end.</b>', who: 'The member who tried, in the refusal' }
        ],
        neverTouched: 'Watch history, attendance, resume points, economy and levels are untouched at every step.',
        caveat: '⚠ The allowance is sized against a budget-CDN rate with no signed contract behind it. If the rate lands higher, the allowance moves before the price does — with 60 days\' notice.'
      },
      {
        id: 'ai',
        name: 'AI companions',
        /* ⚠ NOT PURCHASABLE. Do not build a checkout for this. */
        available: false,
        icon: 'bot',
        unit: '$ of provider spend',
        what: 'Tokens, speech-to-text and text-to-speech, metered at what the providers actually charge.',
        why: 'One 117-member server at a typical load measured $35.84/month — more than any subscription tier. AI cannot be bundled into a plan at any price. That is arithmetic, not positioning.',
        includedByPlan: null,
        unavailableReason:
          'Per-guild AI billing is blocked on a correctness fix that is in flight. The spend ceiling is a module constant over a single global file with no guild id, so one server\'s busy evening would consume every other server\'s ceiling. Billing cannot be per-guild until the store is.',
        unavailableUi: 'This screen is a design preview of how it will be sold. There is no way to buy it, and there will not be one until the store is per-guild.',
        measured: [
          { k: 'One voice turn, all-in', v: '$0.0075' },
          { k: 'One text turn (brain only)', v: '$0.00377' },
          { k: 'Text-to-speech', v: '$0.015 per 1,000 characters' },
          { k: 'Speech-to-text, paid provider', v: '$0.0043 per minute of audio' },
          { k: 'One 117-member server, typical', v: '$35.84 / month' }
        ],
        /* PRICING §4.2: per-turn is the number that misleads here, because
           speech-to-text is always-on in an occupied voice channel. */
        surpriseShape:
          'Speech-to-text is always on in an occupied voice channel, so a member who never addresses the bot still generates spend by sitting in the room with it. That is why the console will show cost per hour of occupied voice, not just cost per turn.',
        overage: {
          _provisional: true,
          defaultOn: false,
          offMeans: 'Paid speech-to-text is opt-in per server and defaults to off. The default is the free provider, or ears off entirely.',
          onMeans: 'You set a hard monthly ceiling at purchase. There is no configuration in which spend continues past it.'
        },
        ladder: [
          { at: 80,  label: '80%',  what: 'Notice to the owner. Nothing changes.', who: 'Owner' },
          { at: 100, label: '100%', what: 'Companions <b>degrade to text only</b> — the expensive half is speech. They keep working.', who: 'Owner and the room, once' },
          { at: 150, label: 'Cap',  what: 'New AI turns refuse. <b>A turn already in flight finishes.</b> Nothing is deleted and no memory is cleared.', who: 'The member who asked, in the refusal' }
        ],
        neverTouched: 'Memory, transcripts and settings are retained at every step. Reaching a cap turns the feature off, never out.',
        caveat: '⚠ Bill the reconciled actual, never the worst-case reservation. The estimator deliberately over-counts before a call and reconciles down afterwards; charging the reservation would bill 2–5× for the safety mechanism that protects the customer.'
      }
    ],

    /* ---- Launch discount. §8.1's rule is load-bearing: a discount touches
       the subscription and NEVER an allowance. A discounted subscription costs
       margin; a discounted allowance costs cash already paid to a CDN. ----- */
    founding: {
      _provisional: true,
      name: 'Founding 100',
      percentOff: 50,
      appliesTo: 'the subscription only',
      neverAppliesTo: 'metered egress and AI, which are always at list',
      terms: [
        'Bound to this server, not to your account. It does not follow you to a second server.',
        'Held for as long as the subscription stays continuously active.',
        'A lapse of more than 30 days ends it permanently. You are told 7 days before.'
      ]
    },

    /* ---- What a lapsed payment actually does. Gate: never deletes data. -- */
    lapseLadder: [
      { when: 'Day −7', what: 'Notice to the owner. <b>Nothing changes.</b>' },
      { when: 'Day 0',  what: 'Payment fails. <b>Nothing changes.</b> The retry schedule begins.' },
      { when: 'Day +7', what: 'Paid modules go <b>read-only</b>. Balances, levels and stats stay visible; the casino refuses new bets; screenings refuse to start; a screening in flight finishes.' },
      { when: 'Day +30', what: 'The server returns to the <b>Free</b> module set. <b>All data retained.</b>' },
      { when: 'Day +365', what: 'The first point at which deletion is even discussed — and only with explicit owner action.' }
    ]
  };

  /* Back-compat alias: the render code reads plans through this name. */
  var TIERS = PRICING.plans;

  /* Rank for the "does this plan cover that module" test. Sovereign and
     Enterprise include everything, so they sit above the ladder rather than on
     it — PRICING §1: "sovereign includes everything, so no row names it as a
     minimum." */
  var TIER_RANK = { free: 0, community: 1, pro: 2, studio: 3, sovereign: 99, enterprise: 99 };

  function tierById(id) {
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i];
    return null;
  }

  function meteredById(id) {
    for (var i = 0; i < PRICING.metered.length; i++) if (PRICING.metered[i].id === id) return PRICING.metered[i];
    return null;
  }

  /** Included allowance of a metered line under a plan. null = not applicable. */
  function allowanceFor(lineId, planId) {
    var line = meteredById(lineId);
    if (!line || !line.includedByPlan) return null;
    var v = line.includedByPlan[planId];
    return v === undefined ? null : v;
  }

  /* =======================================================================
     4 · THE MODULE REGISTRY — PRICING.md §7, normative and complete
     -----------------------------------------------------------------------
     `status` gates what may be advertised: shipped · dark · unwired · partial ·
     planned. PRICING §7: "A `planned` or `dark` row must never appear on a
     pricing page as if it shipped."
     ======================================================================= */

  var MODULES = [
    { id: 'core',           name: 'Bot core & /menu',              tier: 'free',      metered: 'none',   status: 'shipped', locked: true,  note: 'The panel system itself. Cannot be switched off.' },
    { id: 'leveling',       name: 'Leveling & ranks',              tier: 'free',      metered: 'none',   status: 'shipped', note: '21 ranks, 11 prestige tiers. XP cannot be bought, at any price.' },
    { id: 'achievements',   name: 'Achievements & name-icons',     tier: 'free',      metered: 'none',   status: 'shipped', note: '15+1 achievements and equippable name icons.' },
    { id: 'moderation',     name: 'Moderation & bans',             tier: 'free',      metered: 'none',   status: 'shipped', note: 'Booster prison, guardrails, both ban scopes, trusted managers.' },
    { id: 'admin-console',  name: 'Admin console',                 tier: 'free',      metered: 'none',   status: 'shipped', locked: true, note: '162 of the 221 controls. It is a data registry; rendering it costs nothing.' },
    { id: 'notices',        name: 'Notices, changelog & TTL',      tier: 'free',      metered: 'none',   status: 'shipped', note: 'Changelog cards, self-cleaning notices, the weekly health card.' },
    { id: 'stats-basic',    name: 'Stats — day / week / month',    tier: 'free',      metered: 'none',   status: 'shipped', note: 'Collected regardless of plan. Nothing is deleted by being on Free.' },
    { id: 'counting',       name: 'Counting game',                 tier: 'free',      metered: 'none',   status: 'shipped', note: 'Needs Manage Messages, or the room counts from a lie.' },
    { id: 'requests',       name: 'Requests & "tell me when it lands"', tier: 'free',  metered: 'none',   status: 'shipped', note: 'Remembers a title that is not in the library yet.' },
    { id: 'profile',        name: 'Member profile & self-service', tier: 'free',      metered: 'none',   status: 'shipped', note: 'Nickname changes need Manage Nicknames.' },
    { id: 'level-import',   name: 'Import levels from MEE6 / Arcane', tier: 'free',   metered: 'none',   status: 'planned', note: 'Free on purpose — it is acquisition, not a feature. ⚠ Arcane has no export; only the roles it assigned can be read.' },
    { id: 'economy',        name: 'Economy & idle tycoon',         tier: 'community', metered: 'none',   status: 'shipped', note: 'Atomic, conservation-tested money.' },
    { id: 'casino',         name: 'Casino — nine games',           tier: 'community', metered: 'none',   status: 'shipped', note: '⛔ A tier may grant access. It may never grant currency, alter a balance or change odds.' },
    { id: 'stats-history',  name: 'Stats — year & all-time',       tier: 'community', metered: 'none',   status: 'shipped', note: '⚠ "year" is a rolling 12 months, not a calendar year. The UI says so.' },
    { id: 'wrapped',        name: 'Wrapped / recap',               tier: 'community', metered: 'none',   status: 'shipped', note: 'End-of-occasion recap for the whole server.' },
    { id: 'challenges',     name: 'Challenges, goals & roller',    tier: 'community', metered: 'none',   status: 'shipped', note: 'Free runs one of each; this lifts the limit.' },
    { id: 'blueprints',     name: 'Blueprints — composites with rollback', tier: 'community', metered: 'none', status: 'shipped', note: '16 controls. A half-built structure is worse than none, so every kit rolls back.' },
    { id: 'backup',         name: 'Scheduled backup & restore',    tier: 'community', metered: 'none',   status: 'shipped', note: 'Snapshots of configuration, with an undo path.' },
    { id: 'screening-room', name: 'Screening room — films & TV',   tier: 'pro',       metered: 'egress', status: 'shipped', note: 'Needs your hardware and the hosted relay. This is what the egress meter measures.' },
    { id: 'live-tv',        name: 'Live TV — channels & guide',    tier: 'pro',       metered: 'egress', status: 'shipped', note: '⚠ 24/7 live TV for 20 viewers is ~800 GB/day. Watch the meter.' },
    { id: 'game-servers',   name: 'Game-server operations',        tier: 'pro',       metered: 'none',   status: 'shipped', note: 'Start/stop, live player counts, idle shutdown that survives a restart.' },
    { id: 'world-settings', name: 'World settings & New World',    tier: 'pro',       metered: 'none',   status: 'shipped', note: 'Settings generated from the game images, never typed.' },
    { id: 'bridge',         name: 'Self-host bridge',              tier: 'pro',       metered: 'none',   status: 'partial', note: '⚠ Dials IN today. The outbound WSS bridge is Phase 7.' },
    { id: 'api',            name: '/v1 HTTP API',                  tier: 'pro',       metered: 'none',   status: 'shipped', note: '13 routes, including the one that serves this dashboard its registry.' },
    { id: 'mcp',            name: 'MCP tool surface',              tier: 'pro',       metered: 'none',   status: 'shipped', note: 'Delegates to the same runQuery the API uses.' },
    { id: 'second-screen',  name: 'Second simultaneous screen',    tier: 'studio',    metered: 'egress', status: 'shipped', note: '⚠ A half-configured second pipeline silently drives the first one\'s engine.' },
    { id: 'web-dashboard',  name: 'Web dashboard',                 tier: 'pro',       metered: 'none',   status: 'planned', note: 'Phase 8. Read-only on Community, write routes on Pro. You are looking at its preview.' },
    { id: 'mobile',         name: 'Mobile app',                    tier: 'pro',       metered: 'none',   status: 'planned', note: 'Phase 11, React Native, sharing the same core.' },
    { id: 'music',          name: 'Music (from your own library)', tier: 'pro',       metered: 'none',   status: 'planned', note: '⚠ Not YouTube-sourced. Spotify forbids third-party playback, and Plexamp has no public API.' },
    { id: 'ai-companions',  name: 'AI companions',                 tier: 'pro',       metered: 'ai',     status: 'dark',    note: '⚠ Cannot be sold yet: the spend ceiling is a module constant over one global file with no guild_id.' },
    { id: 'themes',         name: 'Cosmetic hero-card themes',     tier: 'community', metered: 'none',   status: 'unwired', note: 'Held back. If ever wired: Bucks-only, never cash.' },
    { id: 'tickets',        name: 'Tickets / modmail',             tier: 'community', metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'giveaways',      name: 'Giveaways',                     tier: 'community', metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'starboard',      name: 'Starboard',                     tier: 'free',      metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'reminders',      name: 'Reminders',                     tier: 'free',      metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'temp-voice',     name: 'Temporary voice channels',      tier: 'community', metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'birthdays',      name: 'Birthdays',                     tier: 'free',      metered: 'none',   status: 'planned', note: 'Zero code today.' },
    { id: 'social-alerts',  name: 'Social alerts (Twitch / YouTube / X)', tier: 'community', metered: 'none', status: 'planned', note: 'Zero code today.' },
    { id: 'automod',        name: 'Automod rules engine',          tier: 'community', metered: 'none',   status: 'partial', note: 'Today we can only toggle Discord\'s native AutoMod. There is no rules engine of our own.' },
    { id: 'modlog',         name: 'Moderation cases & modlog',     tier: 'community', metered: 'none',   status: 'partial', note: 'Actions are logged, but there is no case file to open.' },
    /* ⚠ The two metered CREDIT lines. They are entitlement ids in
       adminactions.js's MODULES like any other, and leaving them out of this
       table is how a vocabulary drifts: `moduleEntitled()` would be asked about
       an id it has never heard of. They own no controls, so they render as
       billing lines rather than as configurable modules — `credit: true`. */
    { id: 'media-credit',   name: 'Media credit (egress)',         tier: 'pro',       metered: 'egress', status: 'shipped', credit: true, note: 'Not a feature — the meter the screening room and Live TV bill against. One-time 50 GB grant per guild.' },
    { id: 'ai-credit',      name: 'AI credit',                     tier: 'pro',       metered: 'ai',     status: 'dark',    credit: true, note: 'Not a feature — the meter the companions bill against. Dark while the companions are dark.' }
  ];

  var MODULE_BY_ID = {};
  for (var mi = 0; mi < MODULES.length; mi++) MODULE_BY_ID[MODULES[mi].id] = MODULES[mi];

  /* ⚠ DRIFT GUARD. If the registry ever ships a control whose module has no row
     here, the old code silently dropped that control's entitlement to
     `undefined` and let it through. Collect the gap instead, and say so on the
     Modules view — a customer seeing "we do not recognise this module" is
     recoverable; a free guild quietly running a paid module is not. */
  var MODULE_DRIFT = Object.keys(ACTIONS_BY_MODULE).filter(function (m) { return !MODULE_BY_ID[m]; });

  var STATUS_META = {
    shipped:  { label: 'Shipped',            cls: 'as-badge--success' },
    dark:     { label: 'Built · ships off',  cls: 'as-badge--warn' },
    partial:  { label: 'Partial',            cls: 'as-badge--warn' },
    unwired:  { label: 'Unwired',            cls: 'as-badge--plain' },
    planned:  { label: 'Planned · not built', cls: 'as-badge--plain' }
  };

  /* ⚠ There used to be a second, hand-written GROUP_MODULE here. It is gone.
     adminactions.js now EXPORTS the table and `describe()` serialises `module`
     on every action, so the one above — generated with the registry — is the
     only copy on this surface. A second copy is how a customer ends up locked
     out of something they paid for. */

  /* =======================================================================
     5 · DISCORD PERMISSIONS — PERMISSIONS.md §2, §3, §4, §8
     -----------------------------------------------------------------------
     Bit values were dumped from the installed discord.js@14.26.4, not from
     memory. "What breaks" is the standard PERMISSIONS §8 sets out: "'Missing
     Manage Emojis' is a fact an admin cannot act on; 'Add/Delete Emoji will
     refuse' is."
     ======================================================================= */

  var PERM_META = {
    ViewChannel:            { label: 'View Channels',           bit: '1024',            breaks: 'The bot cannot read the channel at all, so nothing else in this list matters there.' },
    SendMessages:           { label: 'Send Messages',           bit: '2048',            breaks: 'No rank-up announcements, no achievement notices, no cards of any kind.' },
    EmbedLinks:             { label: 'Embed Links',             bit: '16384',           breaks: 'Every card renders as plain text.' },
    AttachFiles:            { label: 'Attach Files',            bit: '32768',           breaks: 'Charts, cover art, the Wrapped card and the game-server crash log are all dropped.' },
    ReadMessageHistory:     { label: 'Read Message History',    bit: '65536',           breaks: 'The card self-heal path fails, so cards repost instead of editing in place.' },
    ChangeNickname:         { label: 'Change Nickname',         bit: '67108864',        breaks: 'Per-guild bot branding is unavailable — the nickname is the mechanism.' },
    AddReactions:           { label: 'Add Reactions',           bit: '64',              breaks: 'Counting cannot mark a good number; reaction-role boards post but react to nothing.' },
    ManageMessages:         { label: 'Manage Messages',         bit: '8192',            breaks: '⚠ A wrong counting number is not deleted and the room counts from a lie.' },
    UseExternalEmojis:      { label: 'Use External Emojis',     bit: '262144',          breaks: 'Name icons and rank glyphs fall back to plain text.' },
    Connect:                { label: 'Connect',                 bit: '1048576',         breaks: 'The AI companion cannot join a voice channel.' },
    Speak:                  { label: 'Speak',                   bit: '2097152',         breaks: 'The AI companion joins and stays silent.' },
    MoveMembers:            { label: 'Move Members',            bit: '16777216',        breaks: '⚠ Booster prison retries forever — a permanent 50013 loop against Discord.' },
    ManageNicknames:        { label: 'Manage Nicknames',        bit: '134217728',       breaks: 'The /menu → Profile nickname control refuses. It already says so.' },
    ManageRoles:            { label: 'Manage Roles',            bit: '268435456',       breaks: '⚠ Rank, prestige and icon roles never appear — silently, per member, forever.' },
    ModerateMembers:        { label: 'Timeout Members',         bit: '1099511627776',   breaks: 'Raid mode cannot time anyone out; the Members tab timeout controls refuse.' },
    SetVoiceChannelStatus:  { label: 'Set Voice Channel Status', bit: '281474976710656', breaks: 'The "🎬 now showing" line under the voice channel never appears, or never clears.' },
    KickMembers:            { label: 'Kick Members',            bit: '2',               breaks: 'The Members tab kick controls refuse.' },
    BanMembers:             { label: 'Ban Members',             bit: '4',               breaks: 'Both ban scopes refuse.' },
    ManageChannels:         { label: 'Manage Channels',         bit: '16',              breaks: '⚠ The entire Channels tab refuses — and today with a raw "Missing Permissions", no channel named.' },
    ManageGuild:            { label: 'Manage Server',           bit: '32',              breaks: 'Server name, verification level, content filter and invites cannot be changed.' },
    ViewAuditLog:           { label: 'View Audit Log',          bit: '128',             breaks: 'The Discord audit feed and snapshot restore refuse.' },
    MuteMembers:            { label: 'Mute Members',            bit: '4194304',         breaks: 'Voice mute controls refuse.' },
    DeafenMembers:          { label: 'Deafen Members',          bit: '8388608',         breaks: 'Voice deafen controls refuse.' },
    ManageWebhooks:         { label: 'Manage Webhooks',         bit: '536870912',       breaks: 'Four webhook controls on the Channels tab refuse.' },
    ManageGuildExpressions: { label: 'Manage Expressions',      bit: '1073741824',      breaks: 'Add Emoji and Delete Emoji will refuse.' },
    ManageEvents:           { label: 'Manage Events',           bit: '8589934592',      breaks: 'Scheduled events cannot be created, and the event blueprint step fails.' },
    ManageThreads:          { label: 'Manage Threads',          bit: '17179869184',     breaks: 'Thread archive and lock controls refuse.' },
    CreatePublicThreads:    { label: 'Create Public Threads',   bit: '34359738368',     breaks: 'Thread-creating controls refuse.' },
    CreatePrivateThreads:   { label: 'Create Private Threads',  bit: '68719476736',     breaks: 'Private-thread controls refuse.' },
    SendMessagesInThreads:  { label: 'Send Messages in Threads', bit: '274877906944',   breaks: 'The bot can open a thread and then not speak in it.' }
  };

  var PERM_SETS = {
    minimum: {
      id: 'minimum', name: 'Minimum', value: '67226624',
      blurb: 'Boot, /menu, economy, casino, stats, wrapped, challenges — every card the bot posts. Nothing that touches another member.',
      perms: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'ChangeNickname']
    },
    recommended: {
      id: 'recommended', name: 'Recommended', value: '282574978411584',
      blurb: 'Minimum plus every member-facing module: leveling and rank roles, counting, reaction roles, category access, the screening room, game servers, companions, join policies. No moderation console, no server management.',
      perms: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'ChangeNickname',
              'AddReactions', 'ManageMessages', 'UseExternalEmojis', 'Connect', 'Speak', 'MoveMembers',
              'ManageNicknames', 'ManageRoles', 'ModerateMembers', 'SetVoiceChannelStatus']
    },
    full: {
      id: 'full', name: 'Full', value: '282980328533238',
      blurb: 'Recommended plus the moderation and server-management console. The delta on its own is 405350121654, if you would rather install the console as a separate scope.',
      perms: ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'ChangeNickname',
              'AddReactions', 'ManageMessages', 'UseExternalEmojis', 'Connect', 'Speak', 'MoveMembers',
              'ManageNicknames', 'ManageRoles', 'ModerateMembers', 'SetVoiceChannelStatus',
              'KickMembers', 'BanMembers', 'ManageChannels', 'ManageGuild', 'ViewAuditLog',
              'MuteMembers', 'DeafenMembers', 'ManageWebhooks', 'ManageGuildExpressions', 'ManageEvents',
              'ManageThreads', 'CreatePublicThreads', 'CreatePrivateThreads', 'SendMessagesInThreads']
    }
  };

  /* =======================================================================
     6 · THE MOCK WORLD — three servers, deliberately unlike each other
     -----------------------------------------------------------------------
     The switcher has to CHANGE something or it is decoration. These three
     differ in plan, in permissions and in whether hardware is connected, so
     every state the dashboard can be in is reachable by switching.
     ======================================================================= */

  /* Snowflake-shaped ids so the pickers echo something realistic. */
  function sf(seed) {
    var s = String(seed);
    while (s.length < 18) s = s + ((s.charCodeAt(s.length - 1) * 7 + 3) % 10);
    return s.slice(0, 18);
  }

  function entities(spec) {
    var out = { category: [], channel: [], role: [], member: [] };
    var n = 1;
    spec.categories.forEach(function (c) {
      var cid = sf('90' + (n++) + '4471028356');
      out.category.push({ id: cid, name: c.name });
      c.channels.forEach(function (ch) {
        out.channel.push({
          id: sf('10' + (n++) + '5512908347'),
          name: ch[0], kind: ch[1] || 'text', category: c.name
        });
      });
    });
    spec.roles.forEach(function (r, i) {
      out.role.push({
        id: sf('80' + (n++) + '3390127745'),
        name: r.name, color: r.color, position: spec.roles.length - i, managed: !!r.managed
      });
    });
    spec.members.forEach(function (m) {
      out.member.push({
        id: sf('20' + (n++) + '7788channel'.replace(/\D/g, '') + '441'),
        name: m, initials: m.slice(0, 2).toUpperCase()
      });
    });
    return out;
  }

  var GUILDS = [
    {
      id: sf('114477'), name: 'Hearthstead', initials: 'HS',
      members: 1284, online: 213, boostTier: 2,
      plan: 'pro', billingPeriod: 'monthly', founding: true,
      permSet: 'recommended',
      /* Two roles above the bot. This is the number-one support ticket the
         product will have, and no bitfield can express it. */
      hierarchy: { botPosition: 24, above: ['Server Owner', 'Head Moderator'] },
      modulesOff: ['counting'],
      entities: entities({
        categories: [
          { name: 'Welcome', channels: [['rules'], ['announcements'], ['welcome']] },
          { name: 'The Hall', channels: [['general'], ['media'], ['counting'], ['off-topic']] },
          { name: 'Screening Room', channels: [['now-showing'], ['requests'], ['Screen One', 'voice'], ['Screen Two', 'voice']] },
          { name: 'Game Servers', channels: [['server-control'], ['minecraft'], ['Lobby', 'voice']] },
          { name: 'Staff', channels: [['mod-chat'], ['audit-feed'], ['bot-logs']] }
        ],
        roles: [
          { name: 'Server Owner', color: '#e2665e' },
          { name: 'Head Moderator', color: '#e2913f' },
          { name: 'Asbern', color: '#d2a75c', managed: true },
          { name: 'Moderator', color: '#79aec8' },
          { name: 'Booster', color: '#c88fd4' },
          { name: 'Cinema Club', color: '#6fba8b' },
          { name: 'Master General', color: '#8fa2b8' },
          { name: 'Captain', color: '#8fa2b8' },
          { name: 'Private', color: '#6b7889' },
          { name: '@everyone', color: '#6b7889' }
        ],
        members: ['Hallr', 'Sigrún', 'Bekan', 'Thora', 'Gunnar', 'Ylva', 'Ragna', 'Ketil']
      })
    },
    {
      id: sf('225588'), name: 'Nordvik Gaming', initials: 'NG',
      members: 412, online: 47, boostTier: 0,
      plan: 'free', billingPeriod: null, founding: false,
      permSet: 'minimum',
      hierarchy: { botPosition: 3, above: ['Owner', 'Admin', 'Moderator', 'Booster'] },
      modulesOff: [],
      entities: entities({
        categories: [
          { name: 'General', channels: [['rules'], ['general'], ['clips']] },
          { name: 'Voice', channels: [['Lobby', 'voice'], ['Squad One', 'voice']] }
        ],
        roles: [
          { name: 'Owner', color: '#e2665e' },
          { name: 'Admin', color: '#e2913f' },
          { name: 'Moderator', color: '#79aec8' },
          { name: 'Booster', color: '#c88fd4' },
          { name: 'Asbern', color: '#d2a75c', managed: true },
          { name: '@everyone', color: '#6b7889' }
        ],
        members: ['Odd', 'Vigdis', 'Sten', 'Ase']
      })
    },
    {
      id: sf('336699'), name: 'The Long Table', initials: 'LT',
      members: 96, online: 31, boostTier: 1,
      plan: 'sovereign', billingPeriod: 'annual', founding: false,
      permSet: 'full',
      hierarchy: { botPosition: 11, above: [] },
      modulesOff: ['casino'],
      entities: entities({
        categories: [
          { name: 'Table', channels: [['general'], ['kitchen'], ['film-night']] },
          { name: 'Cinema', channels: [['now-showing'], ['Screen', 'voice']] }
        ],
        roles: [
          { name: 'Asbern', color: '#d2a75c', managed: true },
          { name: 'Host', color: '#e2913f' },
          { name: 'Regular', color: '#6fba8b' },
          { name: '@everyone', color: '#6b7889' }
        ],
        members: ['Ingrid', 'Bjarke', 'Solveig', 'Erlend']
      })
    }
  ];

  /* ---- Per-guild usage against the two metered lines -------------------- */
  var USAGE = {
    Hearthstead: {
      egress: { used: 214.6, periodEnds: 'in 9 days', screeningsThisPeriod: 11, peakViewers: 18, overageOn: false, overageCeiling: null },
      ai: { used: 0, cap: 0, credit: 0, voiceHours: 0 }
    },
    'Nordvik Gaming': {
      egress: { used: 0, periodEnds: null, screeningsThisPeriod: 0, peakViewers: 0, overageOn: false, overageCeiling: null },
      ai: { used: 0, cap: 0, credit: 0, voiceHours: 0 }
    },
    'The Long Table': {
      egress: { used: 38.2, periodEnds: 'in 21 days', screeningsThisPeriod: 3, peakViewers: 6, overageOn: false, overageCeiling: null },
      ai: { used: 0, cap: 0, credit: 0, voiceHours: 0 }
    }
  };

  /* ---- Integration health. FOUR-VALUED, and the fourth is load-bearing.
     screening.presence() is three-valued and `null` means "the engine could
     not be asked" — never "nobody is watching". The dashboard inherits that
     discipline: `unknown` is a state, not a synonym for `offline`. ---------- */
  var HEALTH = {
    Hearthstead: [
      { name: 'Discord gateway', state: 'online',   detail: 'Shard 0 · connected 4d 6h' },
      { name: 'Plex media server', state: 'online',  detail: 'ASGARD-PC · 2,918 films, 214 shows' },
      { name: 'Transcode engine', state: 'online',   detail: 'NVENC · idle' },
      { name: 'Hosted relay', state: 'online',       detail: 'Ingest healthy · 0 disconnects in 24h' },
      { name: 'Live TV provider', state: 'degraded', detail: '3 of 152 channels failed their last probe' },
      { name: 'Game servers', state: 'online',       detail: '1 of 3 running · Millénaire, 3 players' },
      { name: 'AI companions', state: 'offline',     detail: 'Disabled by owner toggle. Not a fault.' },
      { name: 'Stats collector', state: 'unknown',   detail: 'Last tick 41 minutes ago. Could not be asked — not the same as "no data".' }
    ],
    'Nordvik Gaming': [
      { name: 'Discord gateway', state: 'online',   detail: 'Shard 0 · connected 11d 2h' },
      { name: 'Plex media server', state: 'offline', detail: 'No hardware connected. Screening room is not on this plan.' },
      { name: 'Transcode engine', state: 'offline',  detail: 'No bridge paired.' },
      { name: 'Hosted relay', state: 'offline',      detail: 'No relay allowance on Free.' },
      { name: 'Live TV provider', state: 'offline',  detail: 'Not configured.' },
      { name: 'Game servers', state: 'offline',      detail: 'Not on this plan.' },
      { name: 'AI companions', state: 'offline',     detail: 'Not on this plan.' },
      { name: 'Stats collector', state: 'online',    detail: 'Collecting. Year and all-time windows are hidden, never discarded.' }
    ],
    'The Long Table': [
      { name: 'Discord gateway', state: 'online',   detail: 'Shard 0 · connected 2d 19h' },
      { name: 'Plex media server', state: 'online',  detail: 'longtable-nas · 640 films' },
      { name: 'Transcode engine', state: 'online',   detail: 'QuickSync via /dev/dri · Linux host' },
      { name: 'Hosted relay', state: 'online',       detail: 'Ingest healthy' },
      { name: 'Live TV provider', state: 'offline',  detail: 'Not configured. Optional.' },
      { name: 'Game servers', state: 'unknown',      detail: 'Agent has not answered since 20:14. Treating as unknown, not as stopped.' },
      { name: 'AI companions', state: 'offline',     detail: 'Disabled by owner toggle.' },
      { name: 'Stats collector', state: 'online',    detail: 'Collecting.' }
    ]
  };

  /* ---- The bridge, per guild ------------------------------------------- */
  var BRIDGE = {
    Hearthstead: {
      state: 'online', host: 'ASGARD-PC', os: 'Windows 11 · Docker Desktop',
      agentVersion: '0.4.2', platformVersion: '1.5.56', lastSeen: '3 seconds ago',
      uptimeHours: 412, encoder: { id: 'nvenc', name: 'NVIDIA NVENC', device: 'GeForce RTX 5080', verdict: 'ok' },
      upMbps: 42,
      capabilities: [
        { id: 'plex', name: 'Plex media server', on: true, detail: '2,918 films · 214 shows' },
        { id: 'encoder', name: 'Hardware encoder', on: true, detail: 'NVENC, 1080p, 2 concurrent' },
        { id: 'game-servers', name: 'Game servers', on: true, detail: '3 declared, prefix game-*' },
        { id: 'gpu', name: 'GPU passthrough', on: true, detail: 'RTX 5080 visible to the container' },
        { id: 'music', name: 'Lavalink audio', on: false, detail: 'Not declared by the agent' }
      ]
    },
    'Nordvik Gaming': {
      state: 'unpaired', host: null, os: null,
      agentVersion: null, platformVersion: '1.5.56', lastSeen: null,
      uptimeHours: 0, encoder: null, upMbps: null, capabilities: []
    },
    'The Long Table': {
      state: 'online', host: 'longtable-nas', os: 'Debian 13 · Docker',
      agentVersion: '0.4.0', platformVersion: '1.5.56', lastSeen: '11 seconds ago',
      uptimeHours: 1913, encoder: { id: 'qsv', name: 'Intel QuickSync', device: '/dev/dri/renderD128', verdict: 'ok' },
      upMbps: 18,
      capabilities: [
        { id: 'plex', name: 'Plex media server', on: true, detail: '640 films' },
        { id: 'encoder', name: 'Hardware encoder', on: true, detail: 'QuickSync via /dev/dri' },
        { id: 'game-servers', name: 'Game servers', on: false, detail: 'Not declared by the agent' },
        { id: 'gpu', name: 'GPU passthrough', on: false, detail: 'Not declared by the agent' },
        { id: 'music', name: 'Lavalink audio', on: false, detail: 'Not declared by the agent' }
      ]
    }
  };

  /* ---- Invoices. Mock. -------------------------------------------------- */
  var INVOICES = {
    Hearthstead: [
      { id: 'ASB-2026-0731', date: '31 Jul 2026', period: 'Jul 2026', lines: [['Pro subscription', 12.00], ['Founding 100 (−50%)', -6.00]], total: 6.00, state: 'paid' },
      { id: 'ASB-2026-0630', date: '30 Jun 2026', period: 'Jun 2026', lines: [['Pro subscription', 12.00], ['Founding 100 (−50%)', -6.00]], total: 6.00, state: 'paid' },
      { id: 'ASB-2026-0531', date: '31 May 2026', period: 'May 2026', lines: [['Pro subscription', 12.00], ['Founding 100 (−50%)', -6.00], ['Media egress overage', 0.00]], total: 6.00, state: 'paid' },
      { id: 'ASB-2026-0430', date: '30 Apr 2026', period: 'Apr 2026', lines: [['Pro subscription', 12.00], ['Founding 100 (−50%)', -6.00]], total: 6.00, state: 'refunded' }
    ],
    'Nordvik Gaming': [],
    'The Long Table': [
      { id: 'ASB-2026-0114', date: '14 Jan 2026', period: '2026 (annual)', lines: [['Sovereign subscription, annual', 190.00]], total: 190.00, state: 'paid' }
    ]
  };

  /* =======================================================================
     7 · STATE — the selected guild and the acting role, both persisted
     ======================================================================= */

  var STORE_GUILD = 'asbern.dash.guild';
  var STORE_ACTOR = 'asbern.dash.actor';

  var state = {
    guild: null,
    actor: 'owner',          /* owner | admin | aidev — mirrors LEVELS */
    moduleOverrides: {},     /* guildName -> { moduleId: bool } */
    audit: []
  };

  function readStore(k, fallback) {
    try { return localStorage.getItem(k) || fallback; } catch (e) { return fallback; }
  }
  function writeStore(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* private mode */ }
  }

  function guildByName(name) {
    for (var i = 0; i < GUILDS.length; i++) if (GUILDS[i].name === name) return GUILDS[i];
    return null;
  }

  function currentGuild() { return state.guild; }
  function currentPlan() { return tierById(state.guild.plan); }

  function setGuild(name) {
    var g = guildByName(name) || GUILDS[0];
    state.guild = g;
    writeStore(STORE_GUILD, g.name);
    return g;
  }

  function setActor(level) {
    state.actor = level;
    writeStore(STORE_ACTOR, level);
  }

  /* =======================================================================
     8 · THE GATES — both of them, where the bot puts them
     ======================================================================= */

  /** Human actor tiers, exactly as adminactions.js:296-299 resolves them. */
  function actorCtx() {
    return {
      isOwner: state.actor === 'owner',
      isAiDev: state.actor === 'aidev' || state.actor === 'owner',
      isAdmin: state.actor === 'admin' || state.actor === 'owner'
    };
  }

  /** Is a module covered by this guild's plan? */
  function moduleEntitled(mod, guild) {
    /* ⚠ FAIL CLOSED ON AN UNKNOWN MODULE, and note that this is the opposite of
       permguard's fail-OPEN rule on purpose. permguard answers "may the bot do
       this?", where a wrong `no` blocks work that would have succeeded. This
       answers "has this guild paid for it?", where a wrong `yes` gives a free
       guild a paid module. Different question, different safe direction. */
    if (!mod) {
      return {
        ok: false, tier: 'unknown', tierName: 'unrecognised module',
        message: 'This control belongs to a module this page does not have a plan row for, ' +
          'so it cannot be shown as included. That is a build error — see the note on Modules.'
      };
    }
    var planId = guild.plan;
    var have = TIER_RANK[planId];
    var need = TIER_RANK[mod.tier];
    if (have === undefined || need === undefined) return { ok: true };
    if (have >= need) return { ok: true };
    var t = tierById(mod.tier);
    return {
      ok: false,
      tier: mod.tier,
      tierName: t ? t.name : mod.tier,
      message: mod.name + ' is included from ' + (t ? t.name : mod.tier) + ' upward. Your plan is ' + (currentPlan() ? currentPlan().name : planId) + '.'
    };
  }

  /** Is a module actually switched on for this guild? */
  function moduleEnabled(modId, guild) {
    var mod = MODULE_BY_ID[modId];
    if (!mod) return true;
    if (mod.locked) return true;
    if (mod.status !== 'shipped') return false;
    if (!moduleEntitled(mod, guild).ok) return false;
    var ov = state.moduleOverrides[guild.name] || {};
    if (ov[modId] !== undefined) return ov[modId];
    return (guild.modulesOff || []).indexOf(modId) === -1;
  }

  function setModuleEnabled(modId, on) {
    var g = currentGuild();
    if (!state.moduleOverrides[g.name]) state.moduleOverrides[g.name] = {};
    state.moduleOverrides[g.name][modId] = on;
  }

  /**
   * ⚠ THE GATE IS HERE, NOT ON THE BUTTON.
   *
   * A straight port of adminactions.run()'s ordering, with the entitlement
   * check slotted where PRICING §7.1 says it goes: after the permission gate
   * and BEFORE validate(). The refusal vocabulary is the existing typed one —
   * 'permission' · 'entitlement' · 'params' — so the audit log can tell
   * "they can't afford it" apart from "it broke", by design.
   *
   * The only thing simulated is the last step: the Discord call itself.
   */
  function run(actionId, rawParams, opts) {
    opts = opts || {};
    var action = ACTION_BY_ID[actionId];
    if (!action) return finish({ ok: false, error: 'unknown action: ' + actionId }, actionId, {}, false);

    var ctx = actorCtx();
    var allowed = action.permission === 'owner' ? ctx.isOwner
      : action.permission === 'aidev' ? (ctx.isAiDev || ctx.isOwner)
        : (ctx.isAdmin || ctx.isOwner);
    if (!allowed) {
      return finish({
        ok: false, error: 'You do not have permission for that.', refused: 'permission',
        hint: 'This control is marked ' + action.permission + '-only in the registry. You are acting as ' + state.actor + '.'
      }, actionId, {}, false);
    }

    var mod = MODULE_BY_ID[action.module] || MODULE_BY_ID[GROUP_MODULE[action.group]];
    var ent = moduleEntitled(mod, currentGuild());
    if (!ent.ok) {
      return finish({
        ok: false, error: ent.message, refused: 'entitlement', upgrade: ent.tier, upgradeName: ent.tierName
      }, actionId, {}, false);
    }
    if (mod && !moduleEnabled(mod.id, currentGuild())) {
      return finish({
        ok: false, error: mod.name + ' is switched off for this server.', refused: 'entitlement',
        hint: 'Turn it back on under Modules. Nothing was deleted while it was off.'
      }, actionId, {}, false);
    }

    var v = validate(action, rawParams);
    if (!v.ok) {
      return finish({
        ok: false, error: v.errors.join(' · '), refused: 'params', fieldErrors: v.fieldErrors
      }, actionId, {}, false);
    }

    var dryRun = opts.dryRun === true;
    var result = simulate(action, v.values, dryRun);
    return finish(result, actionId, v.values, dryRun);
  }

  /**
   * The simulated half. Everything above this line is the real gate chain;
   * everything below is a plausible answer standing in for a Discord call.
   */
  function simulate(action, values, dryRun) {
    var named = [];
    for (var i = 0; i < action.params.length; i++) {
      var p = action.params[i];
      var val = values[p.name];
      if (val == null || val === '' || val === false) continue;
      named.push((p.label || p.name) + ' = ' + describeValue(p, val));
    }

    if (action.composite) {
      var plan = [
        'Resolve targets and check role hierarchy',
        action.label + ' — create objects',
        'Apply permission overwrites',
        'Verify and report'
      ];
      if (dryRun) {
        return { ok: true, dryRun: true, plan: plan, note: 'Nothing was changed. Every step is reversible; a failure part-way rolls the earlier steps back, newest first.' };
      }
      return { ok: true, created: plan.length, changes: plan, note: 'Composite completed. Rollback was not needed.' };
    }

    var affected = action.bulk ? (3 + (action.id.length % 17)) : 1;
    if (dryRun) {
      return {
        ok: true, dryRun: true, affected: affected,
        preview: action.bulk
          ? 'Would affect ' + affected + ' object' + (affected === 1 ? '' : 's') + '. Nothing has changed.'
          : 'Would apply this change. Nothing has changed.',
        params: named
      };
    }
    return {
      ok: true, affected: affected,
      note: action.bulk ? affected + ' object' + (affected === 1 ? '' : 's') + ' changed.' : 'Applied.',
      params: named
    };
  }

  function describeValue(p, val) {
    var g = currentGuild();
    if (p.type === 'member' || p.type === 'channel' || p.type === 'category' || p.type === 'role') {
      var list = g.entities[p.type] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === val) return list[i].name;
      return String(val);
    }
    if (p.type === 'duration') return humanDuration(val);
    if (p.type === 'boolean') return val ? 'on' : 'off';
    return String(val);
  }

  function humanDuration(ms) {
    if (!isFinite(ms)) return String(ms);
    var units = [['w', 6.048e8], ['d', 8.64e7], ['h', 3.6e6], ['m', 6e4], ['s', 1e3]];
    for (var i = 0; i < units.length; i++) {
      if (ms >= units[i][1] && ms % units[i][1] === 0) return (ms / units[i][1]) + units[i][0];
    }
    return A.num(ms) + ' ms';
  }

  /** Audit: mirrors adminaudit.begin/end — one row per call, outcome typed. */
  function finish(result, actionId, values, dryRun) {
    var action = ACTION_BY_ID[actionId];
    var outcome = result.ok ? (dryRun ? 'dry' : 'ok')
      : (result.refused ? 'refused:' + result.refused : 'error');
    state.audit.unshift({
      at: new Date(),
      action: actionId,
      label: action ? action.label : actionId,
      group: action ? action.group : '—',
      actor: state.actor,
      guild: currentGuild() ? currentGuild().name : '—',
      dryRun: dryRun,
      outcome: outcome,
      ok: !!result.ok,
      error: result.error || null,
      affected: result.affected != null ? result.affected : null
    });
    if (state.audit.length > 400) state.audit.length = 400;
    if (typeof state.onAudit === 'function') state.onAudit();
    return result;
  }

  /* =======================================================================
     9 · INFORMATION ARCHITECTURE — deliberately the category convention
     -----------------------------------------------------------------------
     MEE6, Statbot, Arcane and Dyno all use the same shape, and a server owner
     arriving here has used at least one of them:

       · server selector pinned to the top of a left sidebar
       · a grid of PLUGIN CARDS — icon, name, one line, a toggle ON THE CARD,
         and the whole card clicks through to that plugin's settings page
       · locked plugins shown and badged, never hidden
       · channel and role pickers as the signature control

     We follow it. We differentiate on capability, not on making people relearn
     navigation. The one place we deliberately go further is search: because the
     console is a registry rather than 221 hand-built screens, ONE box finds any
     control across all 11 tabs. That is the thing none of them can do, so it
     sits in the top bar rather than three levels down.

     ⚠ EVERY nav item, card and control below comes from data. Re-skinning to a
     reference IA means editing these tables, never the markup.
     ======================================================================= */

  /* Presentation + wiring for each module. Kept beside MODULES rather than in
     it so the normative PRICING §7 rows stay a clean copy of the source.
     `groups` names the registry groups whose controls configure that module —
     that is what makes a module's settings page generate itself. */
  var MODULE_UI = {
    core:            { icon: 'rune',     blurb: 'The panel system, /menu and the card contract everything else draws on.' },
    leveling:        { icon: 'trophy',   blurb: '21 military ranks then 11 prestige tiers. XP is earned and cannot be bought.' },
    achievements:    { icon: 'spark',    blurb: 'Sixteen achievements and equippable name icons.' },
    moderation:      { icon: 'shield',   blurb: 'Bans, timeouts, booster prison and the guardrails around them.' },
    'admin-console': { icon: 'sliders',  blurb: 'Every server control, generated from one registry rather than hand-built.' },
    notices:         { icon: 'info',     blurb: 'Changelog cards, release notes and notices that clean themselves up.' },
    'stats-basic':   { icon: 'chart',    blurb: 'Messages and voice by member, channel and window — day, week, month.' },
    counting:        { icon: 'grid',     blurb: 'The counting game, with wrong numbers removed rather than reset.' },
    requests:        { icon: 'ticket',   blurb: '“Tell me when it lands” — remembers a title you do not have yet.' },
    profile:         { icon: 'users',    blurb: 'Member profile card and the self-service controls on it.' },
    'level-import':  { icon: 'download', blurb: 'Bring three years of MEE6 levels with you instead of starting over.' },
    economy:         { icon: 'coins',    blurb: 'A currency with real stakes, an idle tycoon, and an audited ledger.' },
    casino:          { icon: 'zap',      blurb: 'Nine solo games and three multiplayer tables, house edge verified.' },
    'stats-history': { icon: 'clock',    blurb: 'The year and all-time windows. Collected on every plan, shown on this one.' },
    wrapped:         { icon: 'target',   blurb: 'An end-of-occasion recap card for the whole server.' },
    challenges:      { icon: 'check',    blurb: 'Rotating personal challenges and shared server goals.' },
    blueprints:      { icon: 'cpu',      blurb: 'Kits and templates that build a whole category — and roll back if a step fails.' },
    backup:          { icon: 'cloud',    blurb: 'Scheduled configuration snapshots, with an undo path.' },
    'screening-room':{ icon: 'film',     blurb: 'Films and shows from your own library on one public link. No Plex account.' },
    'live-tv':       { icon: 'tv',       blurb: 'Around 150 channels joined to a guide that knows what is on now.' },
    'game-servers':  { icon: 'server',   blurb: 'Start, stop and watch your game servers without touching a console.' },
    'world-settings':{ icon: 'sliders',  blurb: 'Every world setting, generated from the game images rather than typed.' },
    bridge:          { icon: 'link',     blurb: 'Your hardware, reached without a port forward. The agent dials out.' },
    api:             { icon: 'external', blurb: 'Thirteen HTTP routes, including the one that serves this page its registry.' },
    mcp:             { icon: 'cpu',      blurb: 'The same controls as tools an AI agent can call.' },
    'second-screen': { icon: 'play',     blurb: 'A second independent screen, so two groups can watch different things.' },
    'web-dashboard': { icon: 'grid',     blurb: 'This dashboard. Generated from the registry, so it cannot drift from the bot.' },
    mobile:          { icon: 'home',     blurb: 'Moderation on the go, push, and background audio.' },
    music:           { icon: 'music',    blurb: 'Your own library through the same pipeline. Never scraped from a streaming site.' },
    'ai-companions': { icon: 'bot',      blurb: 'Voice and chat companions with a hard spend ceiling enforced in code.' },
    themes:          { icon: 'spark',    blurb: 'Cosmetic card themes. Bought with Bucks, never with cash.' },
    tickets:         { icon: 'ticket',   blurb: 'Private support threads between a member and your staff.' },
    giveaways:       { icon: 'spark',    blurb: 'Timed entries with a fair draw.' },
    starboard:       { icon: 'spark',    blurb: 'The best messages, pinned by the room rather than by staff.' },
    reminders:       { icon: 'clock',    blurb: 'Nudge a member or a channel at a time they choose.' },
    'temp-voice':    { icon: 'volume',   blurb: 'Voice channels that appear on demand and clean themselves up.' },
    birthdays:       { icon: 'spark',    blurb: 'One announcement a year that people genuinely like.' },
    'social-alerts': { icon: 'wifi',     blurb: 'Post when someone goes live or uploads.' },
    automod:         { icon: 'shield',   blurb: 'Rules that act before a moderator has to.' },
    modlog:          { icon: 'info',     blurb: 'A case file per incident, not just a line in a log.' }
  };

  function modUi(id) { return MODULE_UI[id] || { icon: 'sliders', blurb: '' }; }

  /* Sidebar. Data, not markup. `count` and `tone` are computed per guild. */
  var NAV = [
    {
      group: 'Dashboard', items: [
        { id: 'overview', label: 'Overview', icon: 'home', href: 'dashboard.html#overview' },
        { id: 'modules', label: 'Modules', icon: 'grid', href: 'dashboard.html#modules', count: 'modules' }
      ]
    },
    {
      group: 'Configure', items: [
        { id: 'controls', label: 'All controls', icon: 'sliders', href: 'dashboard.html#controls', count: 'controls' },
        { id: 'branding', label: 'Bot branding', icon: 'spark', href: 'dashboard.html#branding' },
        /* WEB-UX-REFERENCE §8 AMENDMENT 1: "Permissions" on its own collides with
           Carl-bot's per-command meaning, and the suffix earns the item its
           four-state health panel. */
        { id: 'permissions', label: 'Permissions & health', icon: 'shield', href: 'dashboard.html#permissions', count: 'perms' }
      ]
    },
    {
      group: 'Account', items: [
        { id: 'activity', label: 'Activity log', icon: 'clock', href: 'dashboard.html#activity' },
        { id: 'billing', label: 'Billing & usage', icon: 'coins', href: 'billing.html' },
        { id: 'bridge', label: 'Your hardware', icon: 'link', href: 'bridge.html' }
      ]
    }
  ];

  /* =======================================================================
     10 · SMALL RENDER HELPERS
     ======================================================================= */

  function icon(name) { return A.icon(name); }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function fill(id, html) {
    var node = document.getElementById(id);
    if (node) node.innerHTML = html;
    return node;
  }

  function badge(text, cls) {
    return '<span class="as-badge ' + (cls || '') + '">' + esc(text) + '</span>';
  }

  function lamp(stateName, big) {
    var labels = { online: 'Online', degraded: 'Degraded', offline: 'Offline', unpaired: 'Not connected', unknown: 'Unknown' };
    var cls = stateName === 'unpaired' ? 'offline' : stateName;
    return '<span class="ad-lamp ad-lamp--' + cls + (big ? ' ad-lamp--lg' : '') + '">' +
      esc(labels[stateName] || stateName) + '</span>';
  }

  function money(n) { return A.money2(n, PRICING.symbol); }

  function planLabel(p) {
    if (!p) return '—';
    if (p.custom) return p.name;
    if (!p.monthly) return p.name;
    return p.name;
  }

  /** Marks any figure that is not final. The whole ladder is provisional today. */
  function provisionalTag() {
    return '<span class="ad-mock" title="Not a published price. The ladder is being revised.">Provisional</span>';
  }

  function statusBadge(mod) {
    var s = STATUS_META[mod.status] || STATUS_META.planned;
    return badge(s.label, s.cls);
  }

  /* =======================================================================
     11 · CHROME — server selector, global search, account. Shared by 3 pages.
     ======================================================================= */

  function renderServerSelect() {
    var g = currentGuild();
    var plan = currentPlan();
    var host = document.getElementById('ad-serverselect');
    if (!host) return;

    host.innerHTML =
      '<div class="ad-switch">' +
        '<button class="ad-switch__btn" type="button" data-ad-switch aria-haspopup="true" aria-expanded="false">' +
          '<span class="as-avatar as-avatar--accent">' + esc(g.initials) + '</span>' +
          '<span class="ad-switch__label">' +
            '<span class="ad-switch__name">' + esc(g.name) + '</span>' +
            '<span class="ad-switch__plan">' + esc(planLabel(plan)) + '</span>' +
          '</span>' +
          icon('menu') +
        '</button>' +
        '<div class="ad-switch__menu" data-ad-switch-menu hidden role="menu" aria-label="Choose a server">' +
          GUILDS.map(function (x) {
            var p = tierById(x.plan);
            return '<button class="ad-switch__opt" type="button" role="menuitemradio" data-ad-pick-guild="' + esc(x.name) + '"' +
              ' aria-current="' + (x.name === g.name ? 'true' : 'false') + '">' +
              '<span class="as-avatar' + (x.name === g.name ? ' as-avatar--accent' : '') + '">' + esc(x.initials) + '</span>' +
              '<span class="ad-switch__meta"><b>' + esc(x.name) + '</b>' +
              '<span>' + A.num(x.members) + ' members · ' + esc(planLabel(p)) + '</span></span>' +
              (x.name === g.name ? icon('check') : '') +
            '</button>';
          }).join('') +
          '<div class="ad-switch__foot">Additional servers on one account are 25% off each. ' +
          'Every plan, allowance and setting is per server, because the cost is.</div>' +
        '</div>' +
      '</div>';
  }

  function wireServerSelect() {
    A.on('click', '[data-ad-switch]', function (ev, btn) {
      var menu = btn.parentNode.querySelector('[data-ad-switch-menu]');
      var open = menu.hasAttribute('hidden');
      if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    A.on('click', '[data-ad-pick-guild]', function (ev, btn) {
      setGuild(btn.getAttribute('data-ad-pick-guild'));
      A.toast('Switched to ' + currentGuild().name, { variant: 'accent' });
      rerenderAll();
    });
    document.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('.ad-switch')) return;
      A.$$('[data-ad-switch-menu]').forEach(function (m) { m.setAttribute('hidden', ''); });
      A.$$('[data-ad-switch]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      A.$$('[data-ad-switch-menu]').forEach(function (m) { m.setAttribute('hidden', ''); });
    });
  }

  /* ---- The global control search. Our one deliberate deviation: prominent. */

  function searchControls(q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    var out = [];
    for (var i = 0; i < REGISTRY.actions.length; i++) {
      var a = REGISTRY.actions[i];
      var hay = (a.label + ' ' + a.id + ' ' + a.help + ' ' + a.group).toLowerCase();
      var all = true;
      for (var t = 0; t < terms.length; t++) if (hay.indexOf(terms[t]) === -1) { all = false; break; }
      if (!all) continue;
      /* Rank: a label hit beats an id hit beats a help hit. */
      var score = a.label.toLowerCase().indexOf(q) === 0 ? 0
        : a.label.toLowerCase().indexOf(q) > -1 ? 1
          : a.id.toLowerCase().indexOf(q) > -1 ? 2 : 3;
      out.push({ kind: 'control', score: score, action: a });
    }
    for (var m = 0; m < MODULES.length; m++) {
      var mod = MODULES[m];
      var mh = (mod.name + ' ' + mod.id + ' ' + modUi(mod.id).blurb).toLowerCase();
      var ok = true;
      for (var t2 = 0; t2 < terms.length; t2++) if (mh.indexOf(terms[t2]) === -1) { ok = false; break; }
      if (ok) out.push({ kind: 'module', score: mod.name.toLowerCase().indexOf(q) === 0 ? -1 : 0.5, module: mod });
    }
    out.sort(function (x, y) { return x.score - y.score; });
    return out;
  }

  function renderGlobalSearch() {
    var host = document.getElementById('ad-globalsearch');
    if (!host) return;
    host.innerHTML =
      '<div class="ad-search">' +
        icon('target') +
        '<input class="as-input" type="search" id="ad-q" autocomplete="off" spellcheck="false"' +
          ' placeholder="Search ' + REGISTRY.actions.length + ' controls and ' + MODULES.length + ' modules…"' +
          ' aria-label="Search every control and module" role="combobox" aria-expanded="false"' +
          ' aria-controls="ad-qresults" aria-autocomplete="list">' +
        '<span class="ad-search__hint"><kbd class="as-kbd">/</kbd></span>' +
      '</div>' +
      '<div class="ad-switch__menu" id="ad-qresults" hidden role="listbox" aria-label="Search results"' +
        ' style="width:min(34rem,calc(100vw - 2rem));max-height:26rem;overflow-y:auto"></div>';
  }

  function renderSearchResults(q) {
    var box = document.getElementById('ad-qresults');
    var input = document.getElementById('ad-q');
    if (!box) return;
    var results = searchControls(q);
    if (!q) { box.setAttribute('hidden', ''); input.setAttribute('aria-expanded', 'false'); return; }

    if (!results.length) {
      box.innerHTML =
        '<div class="as-empty" style="border:0;padding:var(--as-space-8) var(--as-space-4)">' +
          '<span class="as-empty__icon">' + icon('target') + '</span>' +
          '<span class="as-empty__title">Nothing matches “' + esc(q) + '”</span>' +
          '<span class="as-empty__body">Try a word from the thing itself — “raid”, “emoji”, “slow mode”, ' +
          '“who is boosting”. The search reads every control\'s name, id and description.</span>' +
        '</div>';
    } else {
      var groupName = {};
      REGISTRY.groups.forEach(function (gr) { groupName[gr.id] = gr.emoji + ' ' + gr.label; });
      box.innerHTML =
        '<div class="ad-switch__foot" style="border-top:0;border-bottom:1px solid var(--as-border-soft);margin:0">' +
          results.length + ' match' + (results.length === 1 ? '' : 'es') + ' across all ' +
          REGISTRY.groups.length + ' tabs' +
        '</div>' +
        results.slice(0, 40).map(function (r) {
          if (r.kind === 'module') {
            var u = modUi(r.module.id);
            return '<a class="ad-switch__opt" role="option" href="dashboard.html#module/' + esc(r.module.id) + '">' +
              '<span class="as-plate">' + icon(u.icon) + '</span>' +
              '<span class="ad-switch__meta"><b>' + esc(r.module.name) + '</b>' +
              '<span>Module · ' + esc(u.blurb) + '</span></span></a>';
          }
          var a = r.action;
          return '<a class="ad-switch__opt" role="option" href="dashboard.html#controls/' + esc(a.id) + '">' +
            '<span class="ad-control__glyph" style="width:1.9rem;height:1.9rem">' + (a.emoji ? esc(a.emoji) : icon('sliders')) + '</span>' +
            '<span class="ad-switch__meta"><b>' + esc(a.label) + '</b>' +
            '<span>' + esc(groupName[a.group] || a.group) + ' · <span class="ad-id">' + esc(a.id) + '</span></span></span>' +
            (a.destructive ? '<span class="as-badge as-badge--danger">Destructive</span>' : '') +
          '</a>';
        }).join('');
    }
    box.removeAttribute('hidden');
    input.setAttribute('aria-expanded', 'true');
  }

  function wireGlobalSearch() {
    A.on('input', '#ad-q', function (ev, input) { renderSearchResults(input.value); });
    /* `focus` does not bubble, so a delegated listener would never fire. */
    A.on('focusin', '#ad-q', function (ev, input) { if (input.value) renderSearchResults(input.value); });
    A.on('keydown', '#ad-q', function (ev, input) {
      if (ev.key === 'Escape') { input.value = ''; renderSearchResults(''); input.blur(); }
      if (ev.key === 'Enter') {
        var first = document.querySelector('#ad-qresults a');
        if (first) first.click();
      }
      if (ev.key === 'ArrowDown') {
        var f = document.querySelector('#ad-qresults a');
        if (f) { ev.preventDefault(); f.focus(); }
      }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== '/' || ev.metaKey || ev.ctrlKey) return;
      var t = ev.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      var q = document.getElementById('ad-q');
      if (q) { ev.preventDefault(); q.focus(); q.select(); }
    });
    document.addEventListener('click', function (ev) {
      if (ev.target.closest && ev.target.closest('#ad-globalsearch')) return;
      var box = document.getElementById('ad-qresults');
      if (box) box.setAttribute('hidden', '');
    });
  }

  /* ---- Account menu: also the "view as" switch, which is how the permission
     gate is demonstrable rather than merely described. -------------------- */

  function renderAccount() {
    var host = document.getElementById('ad-account');
    if (!host) return;
    var labels = { owner: 'Owner', admin: 'Admin', aidev: 'AI dev' };
    host.innerHTML =
      '<div class="ad-switch">' +
        '<button class="ad-switch__btn" type="button" data-ad-switch aria-haspopup="true" aria-expanded="false">' +
          '<span class="as-avatar">SI</span>' +
          '<span class="ad-switch__label">' +
            '<span class="ad-switch__name">Sigrún</span>' +
            '<span class="ad-switch__plan">' + esc(labels[state.actor]) + '</span>' +
          '</span>' + icon('menu') +
        '</button>' +
        '<div class="ad-switch__menu" data-ad-switch-menu hidden role="menu" style="left:auto;right:0">' +
          '<div class="ad-switch__foot" style="border-top:0;padding-top:var(--as-space-2)">Acting as</div>' +
          ['owner', 'admin', 'aidev'].map(function (lv) {
            return '<button class="ad-switch__opt" type="button" role="menuitemradio" data-ad-actor="' + lv + '"' +
              ' aria-current="' + (state.actor === lv ? 'true' : 'false') + '">' +
              '<span class="as-plate">' + icon(lv === 'owner' ? 'shield' : lv === 'admin' ? 'sliders' : 'bot') + '</span>' +
              '<span class="ad-switch__meta"><b>' + esc(labels[lv]) + '</b><span>' +
              (lv === 'owner' ? 'Everything, including owner-only controls'
                : lv === 'admin' ? 'Everything except owner-only controls'
                  : 'Admin, plus the tighter AI spend controls') +
              '</span></span>' + (state.actor === lv ? icon('check') : '') + '</button>';
          }).join('') +
          '<div class="ad-switch__foot">The registry marks each control admin, aidev or owner. ' +
          'Switching here changes what the gate lets through — it does not hide buttons.</div>' +
        '</div>' +
      '</div>';
  }

  function wireAccount() {
    A.on('click', '[data-ad-actor]', function (ev, btn) {
      setActor(btn.getAttribute('data-ad-actor'));
      A.toast('Now acting as ' + btn.getAttribute('data-ad-actor'), { variant: 'accent' });
      rerenderAll();
    });
  }

  /* ---- Sidebar ---------------------------------------------------------- */

  function navCounts() {
    var g = currentGuild();
    var on = 0, total = 0;
    MODULES.forEach(function (m) {
      if (m.status !== 'shipped') return;
      total++;
      if (moduleEnabled(m.id, g)) on++;
    });
    var held = PERM_SETS[g.permSet].perms;
    var missing = 0;
    PERM_SETS.full.perms.forEach(function (p) { if (held.indexOf(p) === -1) missing++; });
    return {
      modules: { text: on + '/' + total },
      controls: { text: String(REGISTRY.actions.length) },
      perms: missing ? { text: String(missing), warn: true } : { text: 'OK' }
    };
  }

  function renderSidebar(activeId) {
    var host = document.getElementById('ad-sidenav');
    if (!host) return;
    var counts = navCounts();
    host.innerHTML = NAV.map(function (sec) {
      return '<div class="as-sidebar__group">' + esc(sec.group) + '</div>' +
        sec.items.map(function (it) {
          var c = it.count ? counts[it.count] : null;
          return '<a class="as-sidebar__item" href="' + esc(it.href) + '"' +
            (it.id === activeId ? ' aria-current="page"' : '') + '>' +
            icon(it.icon) + '<span>' + esc(it.label) + '</span>' +
            (c ? '<span class="ad-side-tag' + (c.warn ? ' ad-side-tag--warn' : '') + '">' + esc(c.text) + '</span>' : '') +
            '</a>';
        }).join('');
    }).join('');
  }

  /* =======================================================================
     12 · THE CONTROL CARD — generated, never hand-written
     -----------------------------------------------------------------------
     One function renders all 221. A param's TYPE decides the input, exactly as
     adminactions.js intends: "{ name:'member', type:'member' } is a user-select
     in Discord, a picker on the web, and a snowflake in the API."
     ======================================================================= */

  var PARAM_UI = {
    string:   { wide: true,  hint: null },
    reason:   { wide: true,  hint: 'Optional. Shown in Discord\'s own audit log.' },
    pattern:  { wide: true,  hint: 'Matched against names. Not a regular expression.' },
    number:   { wide: false, hint: null },
    count:    { wide: false, hint: null },
    boolean:  { wide: false, hint: null },
    enum:     { wide: false, hint: null },
    member:   { wide: false, hint: null },
    channel:  { wide: false, hint: null },
    category: { wide: false, hint: null },
    role:     { wide: false, hint: null },
    duration: { wide: false, hint: 'Like 10m, 1h, 7d — or milliseconds.' }
  };

  function fieldId(actionId, name) {
    return 'f_' + actionId.replace(/[^a-zA-Z0-9]/g, '_') + '__' + name.replace(/[^a-zA-Z0-9]/g, '_');
  }

  function entityOptions(kind) {
    var g = currentGuild();
    var list = g.entities[kind] || [];
    if (kind === 'channel') {
      var byCat = {}, order = [];
      list.forEach(function (c) {
        if (!byCat[c.category]) { byCat[c.category] = []; order.push(c.category); }
        byCat[c.category].push(c);
      });
      return order.map(function (cat) {
        return '<optgroup label="' + esc(cat) + '">' + byCat[cat].map(function (c) {
          return '<option value="' + esc(c.id) + '">' + (c.kind === 'voice' ? '🔊 ' : '# ') + esc(c.name) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
    }
    if (kind === 'role') {
      /* ⭐ WEB-UX-REFERENCE §11: flag every role at or above Asbern's own top
         role, AT THE OPTION, before the run. Manage Roles is necessary and not
         sufficient, Administrator does not override position, and today the
         grant path fails silently per member, forever. Catching it in the picker
         turns the number-one support ticket in this product into a line of text
         somebody reads before they press anything. */
      var botIdx = 0;
      list.forEach(function (r, i) { if (r.name === 'Asbern') botIdx = i; });
      return list.map(function (r, i) {
        var above = i < botIdx;
        return '<option value="' + esc(r.id) + '"' + (above ? ' data-ad-above="1"' : '') + '>' +
          esc(r.name) + (r.managed ? ' · managed' : '') +
          (above ? ' — above Asbern, cannot be assigned' : '') + '</option>';
      }).join('');
    }
    return list.map(function (x) {
      return '<option value="' + esc(x.id) + '">' + esc(x.name) + '</option>';
    }).join('');
  }

  function paramField(action, p) {
    var id = fieldId(action.id, p.name);
    var ui = PARAM_UI[p.type] || { wide: false };
    var label = esc(p.label || p.name);
    var req = p.required ? '<span class="ad-param__req" title="Required">*</span>' : '';
    var typeTag = '<span class="ad-param__type">' + esc(p.type) + '</span>';
    var hint = p.help || ui.hint;
    var control = '';

    if (p.type === 'boolean') {
      control = '<label class="as-switch" for="' + id + '">' +
        '<input type="checkbox" id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="boolean">' +
        '<span class="as-switch__label">' + label + '</span></label>';
      return '<div class="ad-param"><div class="as-field">' + control +
        (hint ? '<span class="as-hint">' + esc(hint) + '</span>' : '') +
        '<span class="as-error" data-ad-err hidden></span></div></div>';
    }

    if (p.type === 'enum') {
      var choices = (p.choices || []).map(function (c) {
        var v = (c && typeof c === 'object' && c.value !== undefined) ? c.value : c;
        var n = (c && typeof c === 'object' && (c.name || c.label)) ? (c.name || c.label) : v;
        return '<option value="' + esc(v) + '">' + esc(n) + '</option>';
      }).join('');
      control = '<select class="as-select" id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="enum">' +
        '<option value="">' + (p.required ? 'Choose…' : 'Leave unchanged') + '</option>' + choices + '</select>';
      if ((p.choices || []).length > 6) ui = { wide: true };
    } else if (p.type === 'member' || p.type === 'channel' || p.type === 'category' || p.type === 'role') {
      control = '<select class="as-select" id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="' + p.type + '" data-ad-echo>' +
        '<option value="">' + (p.required ? 'Choose a ' + p.type + '…' : 'None') + '</option>' +
        entityOptions(p.type) + '</select>' +
        '<span class="ad-param__echo" data-ad-echo-for="' + id + '">No ' + esc(p.type) + ' selected</span>';
    } else if (p.type === 'number' || p.type === 'count') {
      control = '<input class="as-input" type="number" id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="' + p.type + '"' +
        (p.type === 'count' ? ' min="1" step="1"' : (p.min != null ? ' min="' + p.min + '"' : '') + (p.max != null ? ' max="' + p.max + '"' : '')) +
        ' placeholder="' + (p.type === 'count' ? '1 or more' : (p.min != null || p.max != null ? (p.min != null ? p.min : '') + '–' + (p.max != null ? p.max : '') : 'A number')) + '">';
    } else if (p.type === 'duration') {
      control = '<input class="as-input" type="text" id="' + id + '" list="ad-durations" data-ad-param="' + esc(p.name) + '" data-ad-type="duration" placeholder="10m">';
    } else {
      control = '<input class="as-input" type="text" id="' + id + '" data-ad-param="' + esc(p.name) + '" data-ad-type="' + p.type + '"' +
        (p.type === 'reason' ? ' maxlength="512" placeholder="Why — this reaches Discord\'s audit log"' : ' placeholder="' + esc(p.label || p.name) + '"') +
        (p.secret ? ' autocomplete="off" spellcheck="false"' : '') + '>';
    }

    return '<div class="ad-param' + (ui.wide ? ' ad-param--wide' : '') + '">' +
      '<div class="as-field">' +
        '<label class="as-label" for="' + id + '">' + label + req + typeTag + '</label>' +
        control +
        (hint ? '<span class="as-hint">' + esc(hint) + '</span>' : '') +
        '<span class="as-error" data-ad-err hidden></span>' +
      '</div></div>';
  }

  /**
   * @param action  a registry action, verbatim
   * @param opts    { compact: show the group name on the card }
   */
  function controlCard(action, opts) {
    opts = opts || {};
    var g = currentGuild();
    var mod = MODULE_BY_ID[action.module] || MODULE_BY_ID[GROUP_MODULE[action.group]];
    var ent = moduleEntitled(mod, g);
    var ctx = actorCtx();
    var permitted = action.permission === 'owner' ? ctx.isOwner
      : action.permission === 'aidev' ? (ctx.isAiDev || ctx.isOwner) : (ctx.isAdmin || ctx.isOwner);

    var flags = [];
    if (action.destructive) flags.push(badge('Destructive', 'as-badge--danger'));
    if (action.dryRun) flags.push(badge('Dry-run first', 'as-badge--frost'));
    if (action.composite) flags.push(badge('Rolls back', 'as-badge--accent'));
    if (action.bulk) flags.push(badge('Bulk', 'as-badge--warn'));
    if (action.permission !== 'admin') flags.push(badge(action.permission + ' only', 'as-badge--plain'));
    if (!ent.ok) flags.push('<span class="as-badge as-badge--accent">' + icon('lock') + ' ' + esc(ent.tierName) + '</span>');
    if (!permitted) flags.push(badge('Above your level', 'as-badge--plain'));

    var groupMeta = null;
    REGISTRY.groups.forEach(function (gr) { if (gr.id === action.group) groupMeta = gr; });

    /* WEB-UX-REFERENCE §11: a destructive control's primary button is PREVIEW,
       not Run. The plan renders into the result strip in place and grows its own
       "Do it". Two steps, one card, NO MODAL — the same shape adminpanel.js uses,
       and a modal here would be a second contract for the same gesture. */
    var buttons = '';
    if (action.dryRun) {
      buttons += '<button class="as-btn as-btn--sm ' + (action.destructive ? 'as-btn--danger' : 'as-btn--secondary') +
        '" type="button" data-ad-run="' + esc(action.id) + '" data-ad-dry="1">' +
        icon('target') + ' Preview</button>';
    } else {
      buttons += '<button class="as-btn as-btn--sm ' + (action.destructive ? 'as-btn--danger' : 'as-btn--primary') + '"' +
        ' type="button" data-ad-run="' + esc(action.id) + '"' + (action.confirm ? ' data-ad-arm="1"' : '') + '>' +
        (action.destructive ? icon('alert') : icon('play')) + ' ' +
        (action.params.length ? 'Apply' : 'Run') + '</button>';
    }

    return '<article class="ad-control' + (action.destructive ? ' is-destructive' : '') + (ent.ok ? '' : ' is-locked') +
        '" data-ad-card="' + esc(action.id) + '" id="ctl-' + esc(action.id.replace(/[^a-zA-Z0-9]/g, '-')) + '">' +
      '<div class="ad-control__head">' +
        '<span class="ad-control__glyph">' + (action.emoji ? esc(action.emoji) : icon('sliders')) + '</span>' +
        '<div class="u-grow">' +
          '<div class="ad-control__title">' + esc(action.label) + '</div>' +
          '<div class="ad-control__id">' + esc(action.id) +
            (opts.showGroup && groupMeta ? ' · ' + esc(groupMeta.emoji + ' ' + groupMeta.label) : '') + '</div>' +
        '</div>' +
      '</div>' +
      (action.help ? '<p class="ad-control__help">' + esc(action.help) + '</p>' : '') +
      (flags.length ? '<div class="ad-control__flags">' + flags.join('') + '</div>' : '') +
      '<div class="ad-control__body">' +
        (action.params.length
          ? '<div class="ad-params">' + action.params.map(function (p) { return paramField(action, p); }).join('') + '</div>'
          : '<p class="ad-empty-params">No parameters — this control acts on the server as a whole.</p>') +
        '<div data-ad-result></div>' +
      '</div>' +
      '<div class="ad-control__foot">' +
        (action.confirm ? '<span class="u-text-xs as-muted">' + icon('shield') + ' Confirms first</span>' : '') +
        '<span class="ad-spacer"></span>' + buttons +
      '</div>' +
    '</article>';
  }

  /* ---- Reading a card's params back out -------------------------------- */

  function readCard(card) {
    var raw = {};
    A.$$('[data-ad-param]', card).forEach(function (input) {
      var name = input.getAttribute('data-ad-param');
      raw[name] = input.type === 'checkbox' ? input.checked : input.value;
    });
    return raw;
  }

  function clearFieldErrors(card) {
    A.$$('[data-ad-err]', card).forEach(function (n) { n.setAttribute('hidden', ''); n.textContent = ''; });
    A.$$('[data-ad-param]', card).forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }

  function showFieldErrors(card, fieldErrors) {
    for (var name in fieldErrors) {
      var input = card.querySelector('[data-ad-param="' + name + '"]');
      if (!input) continue;
      input.setAttribute('aria-invalid', 'true');
      var err = input.closest('.as-field').querySelector('[data-ad-err]');
      if (err) { err.textContent = fieldErrors[name]; err.removeAttribute('hidden'); }
    }
  }

  /* ---- The result strip: the typed outcome vocabulary, rendered --------- */

  function resultHtml(result, action) {
    if (result.ok && result.dryRun) {
      /* The dry run grows the commit button. Nothing else on the card commits,
         so "I previewed but never pressed the second thing" is impossible to
         confuse with "I ran it". */
      var commit = action
        ? '<div class="as-row u-mt-3">' +
            '<button class="as-btn as-btn--sm ' + (action.destructive ? 'as-btn--danger' : 'as-btn--primary') + '"' +
            ' type="button" data-ad-run="' + esc(action.id) + '">' + icon('check') + ' Do it' +
            (result.affected != null && action.bulk ? ' — ' + A.num(result.affected) + ' object' + (result.affected === 1 ? '' : 's') : '') +
            '</button>' +
            '<span class="u-text-xs as-muted">Nothing has changed yet.</span>' +
          '</div>'
        : '';
      return '<div class="ad-result ad-result--dry">' + icon('target') +
        '<div class="ad-result__body"><div class="ad-result__title">Preview — nothing changed</div>' +
        (result.plan
          ? '<ol class="ad-plan-list">' + result.plan.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>'
          : '<div class="u-text-sm">' + esc(result.preview || '') + '</div>') +
        (result.params && result.params.length ? '<div class="u-text-xs as-muted u-mt-2">' + esc(result.params.join(' · ')) + '</div>' : '') +
        (result.note ? '<div class="u-text-xs as-muted u-mt-2">' + esc(result.note) + '</div>' : '') +
        commit +
        '</div></div>';
    }
    if (result.ok) {
      return '<div class="ad-result ad-result--ok">' + icon('check') +
        '<div class="ad-result__body"><div class="ad-result__title">Done' +
        (result.affected != null ? ' — ' + A.num(result.affected) + ' affected' : '') + '</div>' +
        '<div class="u-text-sm">' + esc(result.note || '') + '</div>' +
        (result.changes ? '<ol class="ad-plan-list">' + result.changes.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' : '') +
        '<div class="u-text-xs as-muted u-mt-2">' + esc(SIMULATED) + '</div>' +
        '</div></div>';
    }
    if (result.refused === 'entitlement') {
      return '<div class="ad-result ad-result--warn">' + icon('lock') +
        '<div class="ad-result__body"><div class="ad-result__title">Refused — not on your plan</div>' +
        '<div class="u-text-sm">' + esc(result.error) + '</div>' +
        (result.hint ? '<div class="u-text-xs as-muted u-mt-2">' + esc(result.hint) + '</div>' : '') +
        '<div class="as-row u-mt-3">' +
          (result.upgrade ? '<a class="as-btn as-btn--primary as-btn--sm" href="billing.html#plans">Upgrade to ' + esc(result.upgradeName) + '</a>' : '') +
          '<a class="as-btn as-btn--ghost as-btn--sm" href="dashboard.html#modules">See all modules</a>' +
        '</div>' +
        '<div class="u-text-xs as-muted u-mt-2">Nothing was deleted and nothing is hidden. ' +
        'The gate lives in the runner, so every surface refuses identically.</div>' +
        '</div></div>';
    }
    if (result.refused === 'permission') {
      return '<div class="ad-result ad-result--warn">' + icon('shield') +
        '<div class="ad-result__body"><div class="ad-result__title">Refused — permission</div>' +
        '<div class="u-text-sm">' + esc(result.error) + '</div>' +
        (result.hint ? '<div class="u-text-xs as-muted u-mt-2">' + esc(result.hint) + '</div>' : '') +
        '</div></div>';
    }
    if (result.refused === 'arm') {
      return '<div class="ad-result ad-result--warn">' + icon('shield') +
        '<div class="ad-result__body"><div class="ad-result__title">Are you sure?</div>' +
        '<div class="u-text-sm">' + esc(result.error) + '</div>' +
        '<div class="u-text-xs as-muted u-mt-2">Nothing has changed. The button goes back to normal in a few seconds ' +
        'if you leave it alone.</div></div></div>';
    }
    if (result.refused === 'params') {
      return '<div class="ad-result ad-result--err">' + icon('alert') +
        '<div class="ad-result__body"><div class="ad-result__title">Check the fields above</div>' +
        '<div class="u-text-sm">' + esc(result.error) + '</div>' +
        '<div class="u-text-xs as-muted u-mt-2">These are the bot\'s own validators, not a second copy — ' +
        'so the web surface cannot accept something Discord would refuse.</div>' +
        '</div></div>';
    }
    return '<div class="ad-result ad-result--err">' + icon('alert') +
      '<div class="ad-result__body"><div class="ad-result__title">It failed</div>' +
      '<div class="u-text-sm">' + esc(result.error || 'Unknown error') + '</div></div></div>';
  }

  function paintResult(card, result, action) {
    var host = card.querySelector('[data-ad-result]');
    if (host) host.innerHTML = resultHtml(result, action);
  }

  /* ---- Confirm modal, injected once ------------------------------------ */

  function ensureConfirmDialog() {
    if (document.getElementById('ad-confirm')) return;
    document.body.appendChild(el(
      '<dialog class="as-modal" id="ad-confirm" aria-labelledby="ad-confirm-t">' +
        '<div class="as-modal__header"><h2 class="as-modal__title" id="ad-confirm-t">Confirm</h2>' +
          '<button class="as-btn as-btn--ghost as-btn--icon as-btn--sm" data-as-modal-close aria-label="Close"></button></div>' +
        '<div class="as-modal__body" id="ad-confirm-body"></div>' +
        '<div class="as-modal__footer">' +
          '<button class="as-btn as-btn--ghost" data-as-modal-close type="button">Cancel</button>' +
          '<button class="as-btn as-btn--danger" id="ad-confirm-go" type="button">Yes, run it</button>' +
        '</div></dialog>'));
    var closeBtn = document.querySelector('#ad-confirm [data-as-modal-close]');
    if (closeBtn) closeBtn.innerHTML = icon('x');
  }

  var pendingRun = null;

  function doRun(card, actionId, dry) {
    clearFieldErrors(card);
    var raw = readCard(card);
    var result = run(actionId, raw, { dryRun: dry });
    if (result.fieldErrors) showFieldErrors(card, result.fieldErrors);
    paintResult(card, result, ACTION_BY_ID[actionId]);
    if (result.ok && !dry) A.toast(ACTION_BY_ID[actionId].label + ' — done', { variant: 'success' });
    if (!result.ok && result.refused === 'entitlement') A.toast('Refused: not on your plan', { variant: 'warn' });
    return result;
  }

  function wireControls() {
    A.on('change', '[data-ad-echo]', function (ev, sel) {
      var out = document.querySelector('[data-ad-echo-for="' + sel.id + '"]');
      if (!out) return;
      var opt = sel.options[sel.selectedIndex];
      var above = opt && opt.getAttribute('data-ad-above') === '1';
      if (!sel.value) {
        out.textContent = 'No ' + sel.getAttribute('data-ad-type') + ' selected';
        out.style.color = '';
      } else if (above) {
        /* Warn at the picker, not after the run. */
        out.innerHTML = icon('alert') + ' ' + esc(sel.value) +
          ' — this role sits above Asbern, so it cannot be assigned or edited. ' +
          'Drag Asbern above it in Server Settings → Roles first.';
        out.style.color = 'var(--as-danger)';
      } else {
        out.textContent = sel.value;
        out.style.color = '';
      }
    });

    A.on('click', '[data-ad-run]', function (ev, btn) {
      var actionId = btn.getAttribute('data-ad-run');
      var dry = btn.getAttribute('data-ad-dry') === '1';
      var card = btn.closest('[data-ad-card]');
      var action = ACTION_BY_ID[actionId];
      if (!action) return;

      /* A confirming control with no dry-run arms in place: the button becomes
         "Do it" for six seconds, then goes back. Same two-step contract as the
         preview path, so there is only ever one gesture to learn. */
      if (!dry && action.confirm && btn.getAttribute('data-ad-arm') === '1') {
        btn.removeAttribute('data-ad-arm');
        btn.classList.add('as-btn--danger');
        btn.classList.remove('as-btn--primary');
        btn.innerHTML = icon('check') + ' Do it — press again';
        paintResult(card, {
          ok: false, refused: 'arm',
          error: action.destructive
            ? 'This is marked destructive in the registry. Press again to run it.'
            : 'Press again to run it.'
        }, action);
        window.setTimeout(function () {
          if (!btn.isConnected || btn.getAttribute('data-ad-arm') === '1') return;
          btn.setAttribute('data-ad-arm', '1');
          btn.innerHTML = (action.destructive ? icon('alert') : icon('play')) + ' ' +
            (action.params.length ? 'Apply' : 'Run');
        }, 6000);
        return;
      }

      doRun(card, actionId, dry);
    });
  }

  /* =======================================================================
     13 · VIEW · ALL CONTROLS — 11 tabs, 221 cards, one search
     ======================================================================= */

  var ctlFilter = 'all';
  var ctlQuery = '';

  var CTL_FILTERS = [
    { id: 'all', label: 'All', test: function () { return true; } },
    { id: 'destructive', label: 'Destructive', test: function (a) { return a.destructive; } },
    { id: 'bulk', label: 'Bulk', test: function (a) { return a.bulk; } },
    { id: 'composite', label: 'Rolls back', test: function (a) { return a.composite; } },
    { id: 'params', label: 'Needs input', test: function (a) { return a.params.length > 0; } },
    { id: 'owner', label: 'Owner only', test: function (a) { return a.permission !== 'admin'; } }
  ];

  function filterFn() {
    for (var i = 0; i < CTL_FILTERS.length; i++) if (CTL_FILTERS[i].id === ctlFilter) return CTL_FILTERS[i].test;
    return function () { return true; };
  }

  function matchesQuery(a, q) {
    if (!q) return true;
    var hay = (a.label + ' ' + a.id + ' ' + a.help + ' ' + a.group).toLowerCase();
    var terms = q.toLowerCase().split(/\s+/);
    for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) return false;
    return true;
  }

  function groupLockBanner(groupId) {
    var mod = MODULE_BY_ID[GROUP_MODULE[groupId]];
    var ent = moduleEntitled(mod, currentGuild());
    if (ent.ok) {
      if (mod && !moduleEnabled(mod.id, currentGuild())) {
        return '<div class="as-note as-note--warn u-mb-6">' + icon('info') +
          '<span><strong>' + esc(mod.name) + ' is switched off for this server.</strong> ' +
          'These controls still show — hiding them would only make you wonder where they went. ' +
          'They refuse until you turn the module back on, and nothing was deleted while it was off. ' +
          '<a href="dashboard.html#module/' + esc(mod.id) + '">Turn it back on</a>.</span></div>';
      }
      return '';
    }
    return '<div class="as-note as-note--accent u-mb-6">' + icon('lock') +
      '<span><strong>' + esc(mod.name) + ' is included from ' + esc(ent.tierName) + ' upward.</strong> ' +
      'Every control stays visible and every one of them explains itself — a feature you cannot see is a ' +
      'feature you cannot decide about. Pressing one tells you exactly what it would do and what it costs to unlock. ' +
      '<a href="billing.html#plans">See ' + esc(ent.tierName) + '</a>.</span></div>';
  }

  function renderControls(deepLink) {
    var host = document.getElementById('view-controls');
    if (!host) return;

    var fn = filterFn();
    var q = ctlQuery;
    var shown = REGISTRY.actions.filter(function (a) { return fn(a) && matchesQuery(a, q); });

    var groupsHtml = '', tabsHtml = '';
    REGISTRY.groups.forEach(function (gr, i) {
      var inGroup = shown.filter(function (a) { return a.group === gr.id; });
      var total = (ACTIONS_BY_GROUP[gr.id] || []).length;
      var mod = MODULE_BY_ID[GROUP_MODULE[gr.id]];
      var locked = !moduleEntitled(mod, currentGuild()).ok;
      tabsHtml +=
        '<button class="as-tab" role="tab" type="button" id="tab-' + gr.id + '" aria-controls="panel-' + gr.id + '"' +
        ' aria-selected="' + (i === 0 ? 'true' : 'false') + '" tabindex="' + (i === 0 ? '0' : '-1') + '">' +
        gr.emoji + ' ' + esc(gr.label) +
        ' <span class="ad-side-tag">' + (q || ctlFilter !== 'all' ? inGroup.length + '/' + total : total) + '</span>' +
        (locked ? ' ' + icon('lock') : '') +
        '</button>';
      groupsHtml +=
        '<div class="as-tabpanel" role="tabpanel" id="panel-' + gr.id + '" aria-labelledby="tab-' + gr.id + '"' +
          (i === 0 ? '' : ' hidden') + '>' +
          groupLockBanner(gr.id) +
          (inGroup.length
            ? '<div class="ad-controls">' + inGroup.map(function (a) { return controlCard(a); }).join('') + '</div>'
            : emptyControls(q)) +
        '</div>';
    });

    host.innerHTML =
      '<div class="ad-view__head">' +
        '<div>' +
          '<h1 class="ad-view__title">All controls</h1>' +
          '<p class="ad-view__lede">Every control the bot has, in the same eleven tabs the Discord console uses — ' +
          'because they are the same eleven tabs. This page is <em>generated</em> from the action registry, ' +
          'so a control cannot exist in Discord and be missing here.</p>' +
        '</div>' +
        '<div class="as-row">' + badge(REGISTRY.actions.length + ' controls', 'as-badge--accent') +
          badge(REGISTRY.groups.length + ' tabs', 'as-badge--plain') + '</div>' +
      '</div>' +

      '<div class="ad-toolbar">' +
        '<div class="ad-search">' + icon('target') +
          '<input class="as-input" type="search" id="ad-ctlq" placeholder="Filter these ' + REGISTRY.actions.length + ' controls…"' +
          ' aria-label="Filter controls" value="' + esc(q) + '">' +
        '</div>' +
        '<div class="as-row" role="group" aria-label="Filter by kind">' +
          CTL_FILTERS.map(function (f) {
            return '<button class="as-chip" type="button" data-ad-ctlfilter="' + f.id + '"' +
              ' aria-pressed="' + (ctlFilter === f.id ? 'true' : 'false') + '">' + esc(f.label) + '</button>';
          }).join('') +
        '</div>' +
        '<span class="u-text-xs as-muted u-nowrap">' + A.num(shown.length) + ' of ' + A.num(REGISTRY.actions.length) + '</span>' +
      '</div>' +

      (q ? '<p class="u-text-sm as-muted u-mb-4">Showing matches for “' + esc(q) + '” across all ' +
        REGISTRY.groups.length + ' tabs. <button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-ctlclear>Clear</button></p>' : '') +

      '<div data-as-tabs>' +
        '<div class="as-tabs ad-sticky-tabs" role="tablist" aria-label="Control groups">' + tabsHtml + '</div>' +
        groupsHtml +
      '</div>' +

      '<datalist id="ad-durations">' +
        ['30s', '5m', '10m', '1h', '6h', '1d', '7d', '4w'].map(function (d) { return '<option value="' + d + '">'; }).join('') +
      '</datalist>';

    A.mount(host);

    if (deepLink) {
      var a = ACTION_BY_ID[deepLink];
      if (a) {
        var tab = document.getElementById('tab-' + a.group);
        if (tab) tab.click();
        var card = document.getElementById('ctl-' + deepLink.replace(/[^a-zA-Z0-9]/g, '-'));
        if (card) {
          card.scrollIntoView({ block: 'center', behavior: A.reducedMotion ? 'auto' : 'smooth' });
          card.style.borderColor = 'var(--as-accent)';
          window.setTimeout(function () { card.style.borderColor = ''; }, 2200);
        }
      }
    }
  }

  function emptyControls(q) {
    return '<div class="as-empty">' +
      '<span class="as-empty__icon">' + icon('target') + '</span>' +
      '<span class="as-empty__title">Nothing in this tab matches' + (q ? ' “' + esc(q) + '”' : ' that filter') + '</span>' +
      '<span class="as-empty__body">Other tabs may still have matches — the counts on the tab bar tell you which. ' +
      'Clear the filter to see all ' + REGISTRY.actions.length + ' controls again.</span>' +
      '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-ctlclear>Clear filters</button>' +
    '</div>';
  }

  function wireControlsView() {
    var t = null;
    A.on('input', '#ad-ctlq', function (ev, input) {
      var v = input.value;
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        ctlQuery = v;
        renderControls();
        var again = document.getElementById('ad-ctlq');
        if (again) { again.focus(); again.setSelectionRange(v.length, v.length); }
      }, 140);
    });
    A.on('click', '[data-ad-ctlfilter]', function (ev, btn) {
      ctlFilter = btn.getAttribute('data-ad-ctlfilter');
      renderControls();
    });
    A.on('click', '[data-ad-ctlclear]', function () {
      ctlQuery = ''; ctlFilter = 'all'; renderControls();
    });
  }

  /* =======================================================================
     14 · VIEW · MODULES — the plugin-card grid, the category's own pattern
     ======================================================================= */

  var modFilter = 'all';

  var MOD_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'on', label: 'On' },
    { id: 'off', label: 'Off' },
    { id: 'locked', label: 'Locked' },
    { id: 'roadmap', label: 'Roadmap' }
  ];

  function modBucket(mod) {
    var g = currentGuild();
    if (mod.status !== 'shipped') return 'roadmap';
    if (!moduleEntitled(mod, g).ok) return 'locked';
    return moduleEnabled(mod.id, g) ? 'on' : 'off';
  }

  function moduleCard(mod) {
    var g = currentGuild();
    var u = modUi(mod.id);
    var bucket = modBucket(mod);
    var ent = moduleEntitled(mod, g);
    var on = bucket === 'on';
    var meteredLine = mod.metered !== 'none' ? meteredById(mod.metered) : null;
    var ctlCount = modActions(mod.id).length;

    var ctl;
    if (bucket === 'locked') {
      ctl = '<span class="ad-lock" title="Included from ' + esc(ent.tierName) + '">' + icon('lock') + esc(ent.tierName) + '</span>';
    } else if (bucket === 'roadmap') {
      ctl = '<span class="as-badge as-badge--plain" title="' + esc(mod.note) + '">' +
        esc(STATUS_META[mod.status].label) + '</span>';
    } else if (mod.locked) {
      ctl = '<span class="u-text-xs as-muted u-nowrap" title="Core. Cannot be switched off.">' + icon('lock') + '</span>';
    } else {
      ctl = '<label class="as-switch" data-ad-stop title="' + (on ? 'Switch off' : 'Switch on') + '">' +
        '<input type="checkbox" data-ad-modtoggle="' + esc(mod.id) + '"' + (on ? ' checked' : '') +
        ' aria-label="' + esc(mod.name) + (on ? ' — switch off' : ' — switch on') + '"></label>';
    }

    return '<article class="ad-mod' + (on ? ' is-on' : '') + (bucket === 'locked' ? ' is-locked' : '') +
        (bucket === 'roadmap' ? ' is-unavailable' : '') + '" data-ad-modcard="' + esc(mod.id) + '" tabindex="0"' +
        ' role="link" aria-label="' + esc(mod.name) + ' settings">' +
      '<div class="ad-mod__top">' +
        '<span class="as-plate' + (on ? ' as-plate--accent' : '') + '">' + icon(u.icon) + '</span>' +
        '<div class="u-grow">' +
          '<div class="ad-mod__name">' + esc(mod.name) + '</div>' +
          '<div class="ad-mod__id">' + esc(mod.id) + '</div>' +
        '</div>' +
        '<div class="ad-mod__ctl">' + ctl + '</div>' +
      '</div>' +
      '<p class="ad-mod__why">' + esc(u.blurb) + '</p>' +
      moduleHealthLine(mod, u, bucket) +
      '<div class="ad-mod__foot">' +
        (ctlCount ? '<span class="u-text-xs as-muted u-nowrap">' + ctlCount + ' control' + (ctlCount === 1 ? '' : 's') + '</span>' : '') +
        (bucket === 'roadmap' ? statusBadge(mod) : '') +
        (meteredLine ? badge(meteredLine.available ? 'Metered · ' + meteredLine.name.toLowerCase() : 'Metered · not on sale',
          meteredLine.available ? 'as-badge--frost' : 'as-badge--warn') : '') +
        (bucket === 'locked'
          ? '<a class="as-btn as-btn--primary as-btn--sm" href="billing.html#plans">Unlock with ' + esc(ent.tierName) + '</a>'
          : '') +
        '<span class="ad-spacer u-grow"></span>' +
        '<span class="u-text-xs" style="color:var(--as-accent);font-weight:650">Settings →</span>' +
      '</div>' +
    '</article>';
  }

  /**
   * The states a two-position toggle cannot express.
   *
   * ⚠ WEB-UX-REFERENCE §9: "`unknown` is not a synonym for `offline`, and neither
   * is `disabled`." The bot's own probes are three- and four-valued; flattening
   * that here would be our code telling the truth and our UI throwing it away —
   * which is exactly the "dashboard silently disagrees with the bot" failure the
   * category is criticised for.
   */
  function moduleHealthLine(mod, u, bucket) {
    if (bucket !== 'on') return '';
    var g = currentGuild();

    /* 1. Missing Discord permissions — name what breaks, and link to the fix. */
    var need = MODULE_PERMS[mod.id] || [];
    var held = PERM_SETS[g.permSet].perms;
    var missing = need.filter(function (n) { return held.indexOf(n) === -1; });
    if (missing.length) {
      var count = modActions(mod.id).length;
      return '<div class="as-note as-note--warn u-text-xs" style="padding:var(--as-space-2) var(--as-space-3)">' +
        icon('alert') + '<span>Missing <strong>' + esc(PERM_META[missing[0]].label) + '</strong>' +
        (missing.length > 1 ? ' and ' + (missing.length - 1) + ' more' : '') +
        (count ? ' — ' + count + ' control' + (count === 1 ? '' : 's') + ' will refuse' : '') + '. ' +
        '<a href="dashboard.html#permissions">Fix</a></span></div>';
    }

    /* 2. Role hierarchy — no bitfield expresses it, so nothing above catches it. */
    if (need.indexOf('ManageRoles') > -1 && g.hierarchy.above.length) {
      return '<div class="as-note as-note--warn u-text-xs" style="padding:var(--as-space-2) var(--as-space-3)">' +
        icon('alert') + '<span><strong>' + g.hierarchy.above.length + ' role' +
        (g.hierarchy.above.length === 1 ? '' : 's') + ' sit above Asbern</strong> — role changes fail silently, ' +
        'per member. <a href="dashboard.html#permissions">Fix</a></span></div>';
    }

    /* 3. Hardware. "Offline" and "unknown" are different answers and both are
       different from "off". */
    var needsHardware = ['screening-room', 'live-tv', 'game-servers', 'world-settings', 'second-screen'];
    if (needsHardware.indexOf(mod.id) > -1) {
      var br = BRIDGE[g.name];
      if (br.state !== 'online') {
        return '<div class="as-note u-text-xs" style="padding:var(--as-space-2) var(--as-space-3)">' +
          icon('info') + '<span>' +
          (br.state === 'unpaired'
            ? 'Switched on, but no machine is connected yet. '
            : 'Your hardware is <strong>' + esc(br.state) + '</strong>' +
              (br.lastSeen ? ' — last heard from ' + esc(br.lastSeen) : '') + '. ') +
          'The module is not off. <a href="bridge.html">Your hardware</a></span></div>';
      }
    }
    return '';
  }

  function renderModules() {
    var host = document.getElementById('view-modules');
    if (!host) return;
    var g = currentGuild();
    /* Credit lines are entitlements, not configurable modules — they belong on
       Billing beside the meters they are, not in a grid of things you toggle. */
    var grid = MODULES.filter(function (m) { return !m.credit; });
    var counts = { all: grid.length, on: 0, off: 0, locked: 0, roadmap: 0 };
    grid.forEach(function (m) { counts[modBucket(m)]++; });

    var list = grid.filter(function (m) { return modFilter === 'all' || modBucket(m) === modFilter; });

    host.innerHTML =
      '<div class="ad-view__head">' +
        '<div>' +
          '<h1 class="ad-view__title">Modules</h1>' +
          '<p class="ad-view__lede">Asbern is sold as parts. Switch one off and it stops running — it does not ' +
          'delete anything, and turning it back on picks up where it stopped. Anything your plan does not cover ' +
          'stays on this page, badged, with the price of unlocking it. Nothing is hidden.</p>' +
        '</div>' +
        '<div class="as-row">' + badge(counts.on + ' on', 'as-badge--success') +
          (counts.locked ? badge(counts.locked + ' locked', 'as-badge--accent') : '') +
          badge(counts.roadmap + ' roadmap', 'as-badge--plain') + '</div>' +
      '</div>' +

      '<div class="ad-toolbar">' +
        '<div class="as-row" role="group" aria-label="Filter modules">' +
          MOD_FILTERS.map(function (f) {
            return '<button class="as-chip" type="button" data-ad-modfilter="' + f.id + '"' +
              ' aria-pressed="' + (modFilter === f.id ? 'true' : 'false') + '">' + esc(f.label) +
              ' <span class="ad-side-tag">' + counts[f.id] + '</span></button>';
          }).join('') +
        '</div>' +
        '<span class="u-grow"></span>' +
        '<span class="u-text-xs as-muted u-nowrap">Plan: <strong>' + esc(planLabel(currentPlan())) + '</strong></span>' +
      '</div>' +

      (list.length ? '<div class="ad-mods">' + list.map(moduleCard).join('') + '</div>'
        : '<div class="as-empty"><span class="as-empty__icon">' + icon('grid') + '</span>' +
          '<span class="as-empty__title">Nothing in this filter</span>' +
          '<span class="as-empty__body">On this plan there are no modules in that state. ' +
          'Try “All”.</span></div>') +

      (MODULE_DRIFT.length
        ? '<div class="as-note as-note--danger u-mt-8">' + icon('alert') +
          '<span><strong>' + MODULE_DRIFT.length + ' module' + (MODULE_DRIFT.length === 1 ? '' : 's') +
          ' in the control registry ' + (MODULE_DRIFT.length === 1 ? 'is' : 'are') + ' not in this page’s plan table</strong> — ' +
          '<code>' + MODULE_DRIFT.map(esc).join('</code>, <code>') + '</code>. ' +
          'Their controls are treated as locked until a plan row exists, because guessing an entitlement ' +
          'in either direction is worse than saying so. This is a build error, not a setting.</span></div>'
        : '') +

      '<div class="as-note as-note--frost u-mt-8">' + icon('info') +
        '<span><strong>Switching a module off never deletes data.</strong> Balances are not zeroed, levels are not ' +
        'reset, and stats keep being collected whether or not your plan can read them. That is also what a lapsed ' +
        'payment does — see the ladder on <a href="billing.html#cancel">Billing</a>.</span></div>';

    A.mount(host);
  }

  function wireModules() {
    A.on('click', '[data-ad-modfilter]', function (ev, btn) {
      modFilter = btn.getAttribute('data-ad-modfilter');
      renderModules();
    });
    A.on('change', '[data-ad-modtoggle]', function (ev, input) {
      var id = input.getAttribute('data-ad-modtoggle');
      setModuleEnabled(id, input.checked);
      var mod = MODULE_BY_ID[id];
      /* Explicit autosave feedback — the change is saved the moment it is made,
         and it says so. Consistent across every setting in this dashboard. */
      A.toast(mod.name + (input.checked ? ' switched on' : ' switched off') + ' · saved', {
        variant: input.checked ? 'success' : 'warn'
      });
      renderModules();
      renderSidebar(currentView);
    });
    /* The whole card is the link — but never when the tap was on the toggle. */
    A.on('click', '[data-ad-modcard]', function (ev, card) {
      if (ev.target.closest('label, input, button, a')) return;
      location.hash = '#module/' + card.getAttribute('data-ad-modcard');
    });
    A.on('keydown', '[data-ad-modcard]', function (ev, card) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      if (ev.target !== card) return;
      ev.preventDefault();
      location.hash = '#module/' + card.getAttribute('data-ad-modcard');
    });
  }

  /* =======================================================================
     15 · SHARED · THE METER — used on Overview and on Billing
     ======================================================================= */

  /** Position on a 0–150% axis, so the whole ladder is always visible. */
  function axis(pct) { return Math.max(0, Math.min(100, pct / 1.5)); }

  function meterBar(pctOfAllowance, ladder, frost) {
    var cls = pctOfAllowance >= 100 ? ' ad-meter__fill--danger'
      : pctOfAllowance >= 80 ? ' ad-meter__fill--warn'
        : (frost ? ' ad-meter__fill--frost' : '');
    var ticks = (ladder || []).map(function (r) {
      return '<span class="ad-meter__tick' + (r.at >= 150 ? ' ad-meter__tick--hard' : '') +
        '" style="left:' + axis(r.at).toFixed(2) + '%"></span>';
    }).join('');
    var marks = (ladder || []).map(function (r) {
      var a = axis(r.at);
      return '<span class="ad-meter__mark' + (a >= 99 ? ' ad-meter__mark--end' : '') +
        '" style="left:' + a.toFixed(2) + '%">' + esc(r.label) + '</span>';
    }).join('');
    return '<div class="ad-meter">' +
      '<div class="ad-meter__track" role="img" aria-label="' + Math.round(pctOfAllowance) + ' per cent of the included allowance used">' +
        '<div class="ad-meter__fill' + cls + '" style="width:' + axis(pctOfAllowance).toFixed(2) + '%"></div>' + ticks +
      '</div>' +
      '<div class="ad-meter__scale">' + marks + '</div>' +
    '</div>';
  }

  /* =======================================================================
     16 · VIEW · MODULE SETTINGS — generated from the module's own groups
     ======================================================================= */

  /* Which Discord permissions each module genuinely requires, from
     PERMISSIONS.md §4. An empty array is a real and pleasing answer: the
     economy and casino make zero Discord calls, so they are permission-clean. */
  var MODULE_PERMS = {
    'leveling': ['ManageRoles', 'SendMessages'],
    'achievements': ['SendMessages', 'UseExternalEmojis'],
    'moderation': ['KickMembers', 'BanMembers', 'ModerateMembers', 'MoveMembers'],
    'admin-console': ['KickMembers', 'BanMembers', 'ModerateMembers', 'ManageNicknames', 'MoveMembers',
      'MuteMembers', 'DeafenMembers', 'ManageChannels', 'ManageRoles', 'ManageGuild', 'ViewAuditLog',
      'ManageGuildExpressions', 'ManageEvents', 'ManageWebhooks', 'ManageThreads'],
    'notices': ['SendMessages', 'ManageMessages'],
    'stats-basic': ['AttachFiles', 'EmbedLinks'],
    'stats-history': ['AttachFiles', 'EmbedLinks'],
    'wrapped': ['AttachFiles', 'EmbedLinks'],
    'counting': ['ManageMessages', 'AddReactions'],
    'profile': ['ManageNicknames'],
    'economy': [],
    'casino': [],
    'challenges': [],
    'blueprints': ['ManageChannels', 'ManageRoles', 'ManageEvents', 'SendMessages', 'ReadMessageHistory'],
    'backup': ['ManageChannels', 'ManageRoles', 'ViewAuditLog'],
    'screening-room': ['SetVoiceChannelStatus', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory'],
    'live-tv': ['SetVoiceChannelStatus', 'SendMessages'],
    'game-servers': ['SendMessages', 'AttachFiles', 'ReadMessageHistory'],
    'world-settings': [],
    'second-screen': ['SetVoiceChannelStatus'],
    'ai-companions': ['Connect', 'Speak', 'ChangeNickname'],
    'bridge': [],
    'api': [],
    'mcp': []
  };

  function permChips(names) {
    var held = PERM_SETS[currentGuild().permSet].perms;
    if (!names || !names.length) {
      return '<p class="u-text-sm">' + icon('check') + ' <strong>None beyond the minimum.</strong> ' +
        'This module makes no Discord calls of its own, so there is nothing extra to ask you for.</p>';
    }
    return '<div class="ad-bits">' + names.map(function (n) {
      var m = PERM_META[n];
      var has = held.indexOf(n) > -1;
      return '<span class="ad-bit ' + (has ? 'ad-bit--has' : 'ad-bit--miss') + '" title="' +
        esc(has ? 'Granted' : m.breaks) + '">' + icon(has ? 'check' : 'x') + esc(m.label) + '</span>';
    }).join('') + '</div>';
  }

  function renderModuleDetail(modId) {
    var host = document.getElementById('view-module');
    if (!host) return;
    var mod = MODULE_BY_ID[modId];
    if (!mod) { host.innerHTML = '<div class="as-empty"><span class="as-empty__title">No such module</span></div>'; return; }

    var g = currentGuild();
    var u = modUi(mod.id);
    var ent = moduleEntitled(mod, g);
    var bucket = modBucket(mod);
    var on = bucket === 'on';
    var line = mod.metered !== 'none' ? meteredById(mod.metered) : null;
    var need = MODULE_PERMS[mod.id];
    var held = PERM_SETS[g.permSet].perms;
    var missing = (need || []).filter(function (n) { return held.indexOf(n) === -1; });

    /* The settings body: THIS MODULE'S OWN CONTROLS, derived from the registry's
       per-action `module`. ⚠ It used to be "every control on the tabs this module
       touches", which showed a member of the Economy module all twelve Data-tab
       controls including four that belong to Backup. A settings page that lists
       controls the module does not own is the same defect as a missing one. */
    var acts = modActions(mod.id);
    var tabs = modGroups(mod.id);
    var settings;
    if (!acts.length) {
      settings = '<div class="as-empty">' +
        '<span class="as-empty__icon">' + icon('sliders') + '</span>' +
        '<span class="as-empty__title">No settings of its own</span>' +
        '<span class="as-empty__body">' +
        (mod.status === 'planned'
          ? 'Nothing is built yet, so there is nothing to configure. When it ships, its controls appear here automatically — this page is generated from the registry, not written by hand.'
          : 'This module runs on the defaults and has no controls in the registry. If that changes, they show up here without anyone writing a screen for them.') +
        '</span></div>';
    } else if (tabs.length > 2) {
      settings = '<p class="u-text-sm u-mb-4">Its ' + A.num(acts.length) +
        ' controls are spread across ' + tabs.length +
        ' tabs of the console. Open a tab, or search all ' + REGISTRY.actions.length +
        ' from the box at the top of the page.</p>' +
        '<div class="ad-mods">' + tabs.map(function (gid) {
          var meta = null;
          REGISTRY.groups.forEach(function (x) { if (x.id === gid) meta = x; });
          var mine = acts.filter(function (a) { return a.group === gid; }).length;
          return '<a class="ad-mod" href="dashboard.html#controls/tab-' + esc(gid) + '" style="text-decoration:none">' +
            '<div class="ad-mod__top"><span class="as-plate">' + (meta ? meta.emoji : '') + '</span>' +
            '<div class="u-grow"><div class="ad-mod__name">' + esc(meta ? meta.label : gid) + '</div>' +
            '<div class="ad-mod__id">' + mine + ' control' + (mine === 1 ? '' : 's') + ' here</div></div></div></a>';
        }).join('') + '</div>';
    } else {
      settings = groupLockBanner(tabs[0]) +
        '<div class="ad-controls">' + acts.map(function (a) { return controlCard(a, { showGroup: true }); }).join('') + '</div>';
    }

    var toggle;
    if (bucket === 'locked') {
      toggle = '<a class="as-btn as-btn--primary" href="billing.html#plans">' + icon('lock') +
        ' Unlock with ' + esc(ent.tierName) + '</a>';
    } else if (bucket === 'roadmap') {
      toggle = statusBadge(mod);
    } else if (mod.locked) {
      toggle = '<span class="as-badge as-badge--plain">' + icon('lock') + ' Always on</span>';
    } else {
      toggle = '<label class="as-switch"><input type="checkbox" data-ad-modtoggle="' + esc(mod.id) + '"' +
        (on ? ' checked' : '') + '><span class="as-switch__label">' + (on ? 'On' : 'Off') + '</span></label>';
    }

    host.innerHTML =
      '<a class="as-btn as-btn--ghost as-btn--sm u-mb-4" href="dashboard.html#modules">' + icon('arrow') +
        ' <span style="transform:rotate(180deg);display:inline-block">→</span> All modules</a>' +

      '<div class="ad-view__head">' +
        '<div class="as-row as-row--nowrap as-row--top">' +
          '<span class="as-plate as-plate--lg' + (on ? ' as-plate--accent' : '') + '">' + icon(u.icon) + '</span>' +
          '<div>' +
            '<h1 class="ad-view__title">' + esc(mod.name) + '</h1>' +
            '<p class="ad-view__lede">' + esc(u.blurb) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="as-row">' + toggle + '</div>' +
      '</div>' +

      (bucket === 'locked'
        ? '<div class="as-card as-card--accent u-mb-6"><div class="as-row as-row--between as-row--top">' +
          '<div><h3 style="font-size:var(--as-text-md)">Included from ' + esc(ent.tierName) + '</h3>' +
          '<p class="u-text-sm u-mt-2">' + esc(ent.message) + ' You can read everything about it here first — ' +
          'the settings below are the real ones, and they will already be configured the moment you upgrade.</p></div>' +
          '<a class="as-btn as-btn--primary u-none" href="billing.html#plans">See plans</a></div></div>'
        : '') +

      (mod.status !== 'shipped'
        ? '<div class="as-note as-note--warn u-mb-6">' + icon('alert') +
          '<span><strong>' + esc(STATUS_META[mod.status].label) + '.</strong> ' + esc(mod.note) +
          ' It is on this page because hiding the roadmap is how you end up selling something that does not exist.</span></div>'
        : '') +

      '<div class="ad-duo">' +
        '<div>' +
          '<div class="ad-subhead"><span class="ad-subhead__t">Settings</span>' +
          '<span class="ad-subhead__n">generated from the registry</span></div>' +
          settings +
        '</div>' +
        '<aside class="as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
          '<div class="as-card as-card--tight">' +
            '<div class="as-card__title u-mb-4">At a glance</div>' +
            '<div class="ad-kv">' +
              '<div class="ad-kv__row"><span class="ad-kv__k">Module id</span><span class="ad-kv__v ad-id">' + esc(mod.id) + '</span></div>' +
              '<div class="ad-kv__row"><span class="ad-kv__k">Included from</span><span class="ad-kv__v">' +
                esc(tierById(mod.tier) ? tierById(mod.tier).name : mod.tier) + '</span></div>' +
              '<div class="ad-kv__row"><span class="ad-kv__k">Status</span><span class="ad-kv__v">' + statusBadge(mod) + '</span></div>' +
              '<div class="ad-kv__row"><span class="ad-kv__k">Usage-billed</span><span class="ad-kv__v ad-kv__v--quiet">' +
                (line ? esc(line.name) + (line.available ? '' : ' · not on sale') : 'No') + '</span></div>' +
            '</div>' +
            (mod.note ? '<p class="u-text-xs as-muted u-mt-4">' + esc(mod.note) + '</p>' : '') +
          '</div>' +

          '<div class="as-card as-card--tight">' +
            '<div class="as-card__title u-mb-4">Permissions it needs</div>' +
            permChips(need) +
            (missing.length
              ? '<div class="as-note as-note--warn u-mt-4">' + icon('alert') + '<span><strong>' + missing.length +
                ' missing.</strong> ' + esc(PERM_META[missing[0]].breaks) +
                ' <a href="dashboard.html#permissions">Fix permissions</a>.</span></div>'
              : (need && need.length ? '<p class="u-text-xs as-muted u-mt-3">All granted.</p>' : '')) +
          '</div>' +

          (line
            ? '<div class="as-card as-card--tight">' +
              '<div class="as-card__title u-mb-4">' + esc(line.name) + '</div>' +
              '<p class="u-text-sm">' + esc(line.what) + '</p>' +
              '<p class="u-text-xs as-muted u-mt-3">' + esc(line.why) + '</p>' +
              '<a class="as-btn as-btn--secondary as-btn--sm u-mt-4" href="billing.html#usage">See usage</a>' +
              '</div>'
            : '') +
        '</aside>' +
      '</div>';

    A.mount(host);
  }

  /* =======================================================================
     17 · VIEW · OVERVIEW
     ======================================================================= */

  function healthRow(h) {
    return '<div class="ad-kv__row">' +
      '<span class="ad-kv__k" style="display:flex;flex-direction:column;gap:.15rem">' +
        '<span class="as-strong">' + esc(h.name) + '</span>' +
        '<span class="u-text-xs">' + esc(h.detail) + '</span>' +
      '</span>' +
      '<span class="ad-kv__v">' + lamp(h.state) + '</span></div>';
  }

  function renderOverview() {
    var host = document.getElementById('view-overview');
    if (!host) return;
    var g = currentGuild();
    var plan = currentPlan();
    var usage = USAGE[g.name];
    var egress = meteredById('egress');
    var allowance = allowanceFor('egress', g.plan);
    var pct = allowance ? (usage.egress.used / allowance) * 100 : 0;
    var health = HEALTH[g.name];
    var br = BRIDGE[g.name];
    var held = PERM_SETS[g.permSet].perms;
    var missing = PERM_SETS.full.perms.filter(function (p) { return held.indexOf(p) === -1; });
    var modsOn = MODULES.filter(function (m) { return modBucket(m) === 'on'; }).length;
    var unknowns = health.filter(function (h) { return h.state === 'unknown'; }).length;

    host.innerHTML =
      '<div class="ad-view__head">' +
        '<div>' +
          '<h1 class="ad-view__title">' + esc(g.name) + '</h1>' +
          '<p class="ad-view__lede">' + A.num(g.members) + ' members · ' + A.num(g.online) +
          ' online · on the ' + esc(planLabel(plan)) + ' plan.</p>' +
        '</div>' +
        '<div class="as-row">' +
          '<a class="as-btn as-btn--secondary as-btn--sm" href="dashboard.html#controls">All controls</a>' +
          '<a class="as-btn as-btn--primary as-btn--sm" href="dashboard.html#modules">Modules</a>' +
        '</div>' +
      '</div>' +

      '<div class="as-grid as-grid--4 u-mb-8">' +
        '<div class="as-stat"><span class="as-stat__label">Members</span>' +
          '<span class="as-stat__value">' + A.num(g.members) + '</span>' +
          '<span class="as-stat__note">' + A.num(g.online) + ' online now</span></div>' +
        '<div class="as-stat"><span class="as-stat__label">Modules on</span>' +
          '<span class="as-stat__value">' + modsOn + '</span>' +
          '<span class="as-stat__note">of ' + MODULES.filter(function (m) { return m.status === 'shipped'; }).length + ' shipped</span></div>' +
        '<div class="as-stat as-stat--accent"><span class="as-stat__label">Controls available</span>' +
          '<span class="as-stat__value">' + A.num(REGISTRY.actions.length) + '</span>' +
          '<span class="as-stat__note">across ' + REGISTRY.groups.length + ' tabs</span></div>' +
        '<div class="as-stat"><span class="as-stat__label">Egress used</span>' +
          '<span class="as-stat__value">' + (allowance ? Math.round(pct) + '%' : '—') + '</span>' +
          '<span class="as-stat__note">' + (allowance
            ? A.num(Math.round(usage.egress.used)) + ' of ' + A.num(allowance) + ' GB'
            : 'No relay on this plan') + '</span></div>' +
      '</div>' +

      '<div class="ad-duo">' +
        '<div>' +
          '<div class="ad-subhead"><span class="ad-subhead__t">Health</span>' +
            '<span class="ad-subhead__n">what is actually running</span>' +
            '<span class="ad-subhead__act"><a class="as-btn as-btn--ghost as-btn--sm" href="dashboard.html#controls/diag.scan">Run every diagnostic</a></span>' +
          '</div>' +
          '<div class="as-card as-card--tight"><div class="ad-kv">' + health.map(healthRow).join('') + '</div>' +
            (unknowns
              ? '<div class="as-note as-note--frost u-mt-4">' + icon('info') +
                '<span><strong>' + unknowns + ' component' + (unknowns === 1 ? ' is' : 's are') + ' “unknown”, which is not the same as “off”.</strong> ' +
                'The bot could not get an answer, so it says so rather than guessing. Nothing is paid out, ' +
                'stopped or reported on an unknown tick — a skipped tick corrects itself, a fabricated one becomes ' +
                'a wrong number.</span></div>'
              : '') +
          '</div>' +

          '<div class="ad-subhead"><span class="ad-subhead__t">Recent activity</span>' +
            '<span class="ad-subhead__act"><a class="as-btn as-btn--ghost as-btn--sm" href="dashboard.html#activity">Full log</a></span></div>' +
          '<div class="as-table-wrap">' + activityTable(state.audit.slice(0, 6), true) + '</div>' +
        '</div>' +

        '<aside style="display:flex;flex-direction:column;gap:1.5rem">' +
          '<div class="as-card as-card--tight">' +
            '<div class="as-row as-row--between u-mb-4"><span class="as-card__title">Media egress</span>' +
              (allowance ? badge(Math.round(pct) + '% used', pct >= 80 ? 'as-badge--warn' : 'as-badge--plain') : '') + '</div>' +
            (allowance
              ? meterBar(pct, egress.ladder) +
                '<div class="ad-kv u-mt-4">' +
                  '<div class="ad-kv__row"><span class="ad-kv__k">Delivered</span><span class="ad-kv__v">' +
                    usage.egress.used.toFixed(1) + ' GB</span></div>' +
                  '<div class="ad-kv__row"><span class="ad-kv__k">≈ viewer-hours</span><span class="ad-kv__v ad-kv__v--quiet">' +
                    A.num(Math.round(usage.egress.used / egress.gbPerViewerHour)) + '</span></div>' +
                  '<div class="ad-kv__row"><span class="ad-kv__k">Overage billing</span><span class="ad-kv__v">' +
                    (usage.egress.overageOn ? 'On' : 'Off') + '</span></div>' +
                '</div>' +
                (pct >= 80 ? '<div class="as-note as-note--warn u-mt-4">' + icon('alert') +
                  '<span>Past 80%. At 100% the picture drops to 720p and keeps playing; at 150% new screenings ' +
                  'refuse to start and one already playing runs to its end.</span></div>' : '') +
                '<a class="as-btn as-btn--secondary as-btn--sm u-mt-4 as-btn--block" href="billing.html#usage">Usage &amp; billing</a>'
              : '<div class="as-empty" style="padding:var(--as-space-8) var(--as-space-4)">' +
                '<span class="as-empty__icon">' + icon('cloud') + '</span>' +
                '<span class="as-empty__title">No relay on this plan</span>' +
                '<span class="as-empty__body">There is nothing to meter because the screening room is not included. ' +
                'Nothing here is throttled — it simply is not switched on.</span>' +
                '<a class="as-btn as-btn--primary as-btn--sm" href="billing.html#plans">See plans</a></div>') +
          '</div>' +

          '<div class="as-card as-card--tight">' +
            '<div class="as-row as-row--between u-mb-4"><span class="as-card__title">Permissions</span>' +
              (missing.length ? badge(missing.length + ' missing', 'as-badge--warn') : badge('Complete', 'as-badge--success')) + '</div>' +
            '<p class="u-text-sm">Holding the <strong>' + esc(PERM_SETS[g.permSet].name) + '</strong> set.</p>' +
            (g.hierarchy.above.length
              ? '<div class="as-note as-note--warn u-mt-4">' + icon('alert') +
                '<span><strong>' + g.hierarchy.above.length + ' role' + (g.hierarchy.above.length === 1 ? '' : 's') +
                ' sit above Asbern.</strong> No permission fixes this — position does.</span></div>'
              : '') +
            '<a class="as-btn as-btn--secondary as-btn--sm u-mt-4 as-btn--block" href="dashboard.html#permissions">Permission health</a>' +
          '</div>' +

          '<div class="as-card as-card--tight">' +
            '<div class="as-row as-row--between u-mb-4"><span class="as-card__title">Your hardware</span>' + lamp(br.state) + '</div>' +
            (br.state === 'unpaired'
              ? '<p class="u-text-sm">No machine connected. The screening room and game servers need one.</p>'
              : '<div class="ad-kv">' +
                '<div class="ad-kv__row"><span class="ad-kv__k">Host</span><span class="ad-kv__v">' + esc(br.host) + '</span></div>' +
                '<div class="ad-kv__row"><span class="ad-kv__k">Encoder</span><span class="ad-kv__v">' + esc(br.encoder.name) + '</span></div>' +
                '<div class="ad-kv__row"><span class="ad-kv__k">Last heard from</span><span class="ad-kv__v ad-kv__v--quiet">' + esc(br.lastSeen) + '</span></div>' +
                '</div>') +
            '<a class="as-btn as-btn--secondary as-btn--sm u-mt-4 as-btn--block" href="bridge.html">' +
              (br.state === 'unpaired' ? 'Connect a machine' : 'Bridge details') + '</a>' +
          '</div>' +
        '</aside>' +
      '</div>';

    A.mount(host);
  }

  /* =======================================================================
     18 · VIEW · ACTIVITY LOG — the typed outcome vocabulary, as a table
     ======================================================================= */

  var OUTCOME_META = {
    ok:                    { label: 'Applied',    cls: 'ad-outcome--ok' },
    dry:                   { label: 'Dry run',    cls: 'ad-outcome--dry' },
    'refused:permission':  { label: 'Permission', cls: 'ad-outcome--ref' },
    'refused:entitlement': { label: 'Plan',       cls: 'ad-outcome--ref' },
    'refused:params':      { label: 'Bad input',  cls: 'ad-outcome--ref' },
    error:                 { label: 'Failed',     cls: 'ad-outcome--err' }
  };

  function clockOf(d) {
    var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function activityTable(rows, compact) {
    if (!rows.length) {
      return '<div class="as-empty" style="border:0">' +
        '<span class="as-empty__icon">' + icon('clock') + '</span>' +
        '<span class="as-empty__title">Nothing yet this session</span>' +
        '<span class="as-empty__body">Every control you run is written here with its outcome — ' +
        'applied, previewed, or refused and by which gate. Run something and it appears immediately.</span></div>';
    }
    return '<table class="as-table' + (compact ? ' as-table--compact' : '') + '">' +
      '<caption class="as-visually-hidden">Recent admin actions and their outcomes</caption>' +
      '<thead><tr><th scope="col">Time</th><th scope="col">Control</th>' +
      (compact ? '' : '<th scope="col">Actor</th><th scope="col">Server</th>') +
      '<th scope="col">Outcome</th>' + (compact ? '' : '<th scope="col" class="as-num">Affected</th>') + '</tr></thead><tbody>' +
      rows.map(function (r) {
        var om = OUTCOME_META[r.outcome] || OUTCOME_META.error;
        return '<tr><td class="u-mono u-text-xs u-nowrap">' + clockOf(r.at) + '</td>' +
          '<td><a href="dashboard.html#controls/' + esc(r.action) + '" style="text-decoration:none">' +
            '<strong style="color:var(--as-text-1)">' + esc(r.label) + '</strong></a>' +
            '<div class="ad-id">' + esc(r.action) + '</div>' +
            (r.error ? '<div class="u-text-xs" style="color:var(--as-text-3)">' + esc(r.error) + '</div>' : '') + '</td>' +
          (compact ? '' : '<td class="u-text-xs">' + esc(r.actor) + '</td><td class="u-text-xs">' + esc(r.guild) + '</td>') +
          '<td><span class="ad-outcome ' + om.cls + '">' + esc(om.label) + '</span></td>' +
          (compact ? '' : '<td class="as-num">' + (r.affected != null ? A.num(r.affected) : '—') + '</td>') +
          '</tr>';
      }).join('') + '</tbody></table>';
  }

  var actFilter = 'all';

  function renderActivity() {
    var host = document.getElementById('view-activity');
    if (!host) return;
    var rows = state.audit.filter(function (r) {
      if (actFilter === 'all') return true;
      if (actFilter === 'refused') return r.outcome.indexOf('refused') === 0;
      if (actFilter === 'dry') return r.outcome === 'dry';
      if (actFilter === 'ok') return r.outcome === 'ok';
      return true;
    });
    var counts = { all: state.audit.length, ok: 0, dry: 0, refused: 0 };
    state.audit.forEach(function (r) {
      if (r.outcome === 'ok') counts.ok++;
      else if (r.outcome === 'dry') counts.dry++;
      else if (r.outcome.indexOf('refused') === 0) counts.refused++;
    });

    host.innerHTML =
      '<div class="ad-view__head"><div>' +
        '<h1 class="ad-view__title">Activity log</h1>' +
        '<p class="ad-view__lede">Every call, with its outcome typed rather than described. ' +
        '“Refused by the plan”, “refused by permission”, “bad input” and “it threw” are four different things, ' +
        'and before the bot distinguished them they all looked identical — which is how a bug hides for weeks.</p>' +
      '</div></div>' +

      '<div class="ad-toolbar">' +
        '<div class="as-row" role="group" aria-label="Filter by outcome">' +
          [['all', 'All'], ['ok', 'Applied'], ['dry', 'Dry runs'], ['refused', 'Refused']].map(function (f) {
            return '<button class="as-chip" type="button" data-ad-actfilter="' + f[0] + '"' +
              ' aria-pressed="' + (actFilter === f[0] ? 'true' : 'false') + '">' + f[1] +
              ' <span class="ad-side-tag">' + counts[f[0]] + '</span></button>';
          }).join('') +
        '</div>' +
        '<span class="u-grow"></span>' +
        '<span class="u-text-xs as-muted">Session only in this preview</span>' +
      '</div>' +

      '<div class="as-table-wrap ad-scroll-cap">' + activityTable(rows, false) + '</div>' +

      '<div class="as-note as-note--frost u-mt-6">' + icon('info') +
        '<span>In production this is the same audit stream the bot writes for its Discord surface, so an action ' +
        'taken here and the identical action taken in Discord land in one log with one shape. ' +
        'A dry run is recorded too — knowing what somebody <em>checked</em> is often more useful than knowing what they did.</span></div>';
    A.mount(host);
  }

  /* =======================================================================
     19 · VIEW · BOT BRANDING — per-guild nickname, avatar, banner, bio
     -----------------------------------------------------------------------
     ⭐ Newly possible. Discord shipped `banner`, `avatar` and `bio` on
     PATCH /guilds/{id}/members/@me on 2025-09-10 (discord-api-docs #7807),
     closing a request open since 2021. Before that date, a per-guild bot
     avatar was genuinely impossible, and most of the internet still says so.
     ======================================================================= */

  var branding = {};   /* guildName -> { nick, bio, avatar (dataURL), banner } */

  function brandOf() {
    var g = currentGuild();
    if (!branding[g.name]) {
      branding[g.name] = {
        nick: g.name === 'The Long Table' ? 'Table Steward' : 'Asbern',
        bio: g.name === 'The Long Table' ? 'Keeps the film nights running.' : '',
        avatar: null, avatarName: null, banner: null, bannerName: null
      };
    }
    return branding[g.name];
  }

  var NICK_MAX = 32;
  var BIO_MAX = 190;

  function renderBranding() {
    var host = document.getElementById('view-branding');
    if (!host) return;
    var g = currentGuild();
    var b = brandOf();
    var held = PERM_SETS[g.permSet].perms;
    var canNick = held.indexOf('ChangeNickname') > -1;

    host.innerHTML =
      '<div class="ad-view__head"><div>' +
        '<h1 class="ad-view__title">Bot branding</h1>' +
        '<p class="ad-view__lede">Give Asbern your server\'s name and face. This is <strong>per server</strong> — ' +
        'a different name and avatar in every community, set from one place, and it takes effect immediately.</p>' +
      '</div><div class="as-row">' + badge('New capability', 'as-badge--accent') + '</div></div>' +

      '<div class="ad-duo">' +
        '<div class="as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +

          '<div class="as-card">' +
            '<div class="as-card__header"><span class="as-card__title">Name</span>' +
              (canNick ? '' : badge('Needs Change Nickname', 'as-badge--danger')) + '</div>' +
            '<div class="as-field">' +
              '<label class="as-label" for="brand-nick">Nickname in ' + esc(g.name) +
                '<span class="ad-count" id="brand-nick-count">' + b.nick.length + '/' + NICK_MAX + '</span></label>' +
              '<input class="as-input" id="brand-nick" maxlength="' + NICK_MAX + '" value="' + esc(b.nick) + '"' +
                (canNick ? '' : ' disabled') + ' placeholder="Asbern">' +
              '<span class="as-hint">The guild nickname is the only display name we control. The bot\'s global ' +
              'username is one value for the whole application and is heavily rate-limited, so it is never used ' +
              'for per-server branding.</span>' +
              '<span class="as-error" id="brand-nick-err" hidden></span>' +
            '</div>' +
            (canNick ? '' :
              '<div class="as-note as-note--danger u-mt-4">' + icon('alert') +
              '<span><strong>Asbern cannot rename itself here.</strong> ' + esc(PERM_META.ChangeNickname.breaks) +
              ' Change Nickname is granted to @everyone by default, so this is usually a denied override on a role. ' +
              '<a href="dashboard.html#permissions">Permission health</a>.</span></div>') +
          '</div>' +

          '<div class="as-card">' +
            '<div class="as-card__header"><span class="as-card__title">Avatar &amp; banner</span>' +
              badge('No permission required', 'as-badge--success') + '</div>' +
            '<div class="as-stack">' +
              '<div class="as-field">' +
                '<span class="as-label">Server avatar</span>' +
                '<label class="ad-drop" data-ad-drop="avatar">' +
                  '<input type="file" accept="image/*" data-ad-file="avatar" aria-label="Choose an avatar image">' +
                  '<span class="ad-drop__thumb ad-drop__thumb--round" data-ad-thumb="avatar"' +
                    (b.avatar ? ' style="background-image:url(' + b.avatar + ')"' : '') + '>' +
                    (b.avatar ? '' : icon('plus')) + '</span>' +
                  '<span class="ad-drop__copy">' +
                    '<span class="ad-drop__name" data-ad-fname="avatar">' + esc(b.avatarName || 'Drop an image, or click to choose') + '</span>' +
                    '<span class="ad-drop__meta">Square, at least 128×128. PNG, JPG, GIF or WebP.</span>' +
                  '</span>' +
                  (b.avatar ? '<button class="as-btn as-btn--ghost as-btn--icon as-btn--sm ad-drop__clear" type="button" data-ad-clear="avatar" aria-label="Remove avatar">' + icon('x') + '</button>' : '') +
                '</label>' +
              '</div>' +
              '<div class="as-field">' +
                '<span class="as-label">Server banner</span>' +
                '<label class="ad-drop" data-ad-drop="banner">' +
                  '<input type="file" accept="image/*" data-ad-file="banner" aria-label="Choose a banner image">' +
                  '<span class="ad-drop__thumb ad-drop__thumb--wide" data-ad-thumb="banner"' +
                    (b.banner ? ' style="background-image:url(' + b.banner + ')"' : '') + '>' +
                    (b.banner ? '' : icon('plus')) + '</span>' +
                  '<span class="ad-drop__copy">' +
                    '<span class="ad-drop__name" data-ad-fname="banner">' + esc(b.bannerName || 'Drop an image, or click to choose') + '</span>' +
                    '<span class="ad-drop__meta">Wide, roughly 4:1. Shown on the bot\'s profile card.</span>' +
                  '</span>' +
                  (b.banner ? '<button class="as-btn as-btn--ghost as-btn--icon as-btn--sm ad-drop__clear" type="button" data-ad-clear="banner" aria-label="Remove banner">' + icon('x') + '</button>' : '') +
                '</label>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="as-card">' +
            '<div class="as-card__header"><span class="as-card__title">Bio</span></div>' +
            '<div class="as-field">' +
              '<label class="as-label" for="brand-bio">About Asbern, in this server' +
                '<span class="ad-count" id="brand-bio-count">' + b.bio.length + '/' + BIO_MAX + '</span></label>' +
              '<textarea class="as-textarea" id="brand-bio" maxlength="' + BIO_MAX + '" ' +
                'placeholder="Runs the cinema, the economy and the game servers.">' + esc(b.bio) + '</textarea>' +
              '<span class="as-hint">Kept deliberately short. The per-server bio field is new and Discord has not ' +
              'documented a limit for it, so we cap conservatively rather than let you write something that is ' +
              'silently truncated.</span>' +
            '</div>' +
          '</div>' +

          '<div class="as-row">' +
            '<button class="as-btn as-btn--primary" type="button" data-ad-brand-save>' + icon('check') + ' Apply to ' + esc(g.name) + '</button>' +
            '<button class="as-btn as-btn--ghost" type="button" data-ad-brand-reset>Reset</button>' +
            '<span class="u-grow"></span>' +
            '<span class="u-text-xs as-muted" id="brand-saved" hidden>' + icon('check') + ' Saved</span>' +
          '</div>' +
        '</div>' +

        '<aside style="display:flex;flex-direction:column;gap:1.5rem">' +
          '<div class="as-card as-card--tight">' +
            '<div class="as-card__title u-mb-4">Live preview</div>' +
            '<div class="ad-preview" id="brand-preview"></div>' +
            '<p class="u-text-xs as-muted u-mt-3">Roughly what members see. Not pixel-exact — Discord\'s own ' +
            'rendering is the truth.</p>' +
          '</div>' +

          '<div class="as-note as-note--warn">' + icon('alert') +
            '<span><strong>The avatar is per server and takes effect immediately.</strong> There is no draft state ' +
            'and no preview inside Discord: the moment you apply, every message Asbern posts in ' + esc(g.name) +
            ' carries the new face. Other servers are untouched.</span></div>' +

          '<div class="as-card as-card--tight">' +
            '<div class="as-card__title u-mb-4">How it works</div>' +
            '<pre class="as-code">await guild.members.editMe({\n' +
            '  <b>nick</b>:   ' + esc(JSON.stringify(b.nick || 'Asbern')) + ',\n' +
            '  <b>avatar</b>: &lt;image&gt;,\n' +
            '  <b>banner</b>: &lt;image&gt;,\n' +
            '  <b>bio</b>:    ' + esc(JSON.stringify(b.bio || '')) + '\n});</pre>' +
            '<div class="ad-kv u-mt-4">' +
              '<div class="ad-kv__row"><span class="ad-kv__k">nick</span><span class="ad-kv__v ad-kv__v--quiet">Change Nickname</span></div>' +
              '<div class="ad-kv__row"><span class="ad-kv__k">avatar · banner · bio</span><span class="ad-kv__v ad-kv__v--quiet">no permission</span></div>' +
              '<div class="ad-kv__row"><span class="ad-kv__k">Shipped</span><span class="ad-kv__v ad-kv__v--quiet">10 Sep 2025</span></div>' +
            '</div>' +
          '</div>' +

          '<div class="as-note">' + icon('info') +
            '<span><strong>Two things we have not verified, and will not pretend we have.</strong> ' +
            'Discord does not document a rate limit for this route — for a logo you set once that is almost ' +
            'certainly irrelevant, but it is not measured. And whether the server avatar renders on ' +
            '<em>interaction replies</em> specifically is unconfirmed, which matters here because almost every ' +
            'Asbern screen is one. If it turns out not to, the nickname still brands every surface.</span></div>' +
        '</aside>' +
      '</div>';

    paintPreview();
    A.mount(host);
  }

  function paintPreview() {
    var host = document.getElementById('brand-preview');
    if (!host) return;
    var g = currentGuild();
    var b = brandOf();
    var nick = (document.getElementById('brand-nick') || {}).value;
    if (nick === undefined) nick = b.nick;
    var bio = (document.getElementById('brand-bio') || {}).value;
    if (bio === undefined) bio = b.bio;
    var initials = (nick || 'A').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'AS';

    host.innerHTML =
      '<div class="ad-preview__banner"' + (b.banner ? ' style="background-image:url(' + b.banner + ')"' : '') + '></div>' +
      '<div class="ad-preview__msg">' +
        '<span class="ad-preview__ava"' + (b.avatar ? ' style="background-image:url(' + b.avatar + ')"' : '') + '>' +
          (b.avatar ? '' : esc(initials)) + '</span>' +
        '<div class="u-grow">' +
          '<div class="as-row" style="gap:.45rem">' +
            '<span class="ad-preview__nick">' + esc(nick || 'Asbern') + '</span>' +
            '<span class="ad-preview__tag">App</span>' +
            '<span class="ad-preview__stamp">Today at 21:04</span>' +
          '</div>' +
          '<div class="ad-preview__text">🎬 <strong>The Northman</strong> is on Screen One. ' +
          'Tap Watch for your own link — no account needed.</div>' +
        '</div>' +
      '</div>' +
      (bio ? '<div class="ad-preview__bio">' + esc(bio) + '</div>' : '') +
      '<div class="ad-preview__members">' +
        '<div class="u-text-xs as-muted u-mb-2" style="letter-spacing:.1em;text-transform:uppercase">Online — 3</div>' +
        '<div class="ad-preview__member ad-preview__member--bot">' +
          '<span class="as-avatar as-avatar--sm as-avatar--accent"' +
            (b.avatar ? ' style="background-image:url(' + b.avatar + ');background-size:cover"' : '') + '>' +
            (b.avatar ? '' : esc(initials)) + '</span>' +
          '<span class="ad-preview__nick">' + esc(nick || 'Asbern') + '</span>' +
          '<span class="ad-preview__tag">App</span></div>' +
        '<div class="ad-preview__member"><span class="as-avatar as-avatar--sm">HA</span><span>Hallr</span></div>' +
        '<div class="ad-preview__member"><span class="as-avatar as-avatar--sm">SI</span><span>Sigrún</span></div>' +
      '</div>';
  }

  function readImage(file, kind) {
    if (!file) return;
    var b = brandOf();
    if (!/^image\//.test(file.type)) {
      A.toast('That is not an image', { variant: 'danger' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      A.toast('Images must be under 8 MB', { variant: 'danger' });
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      b[kind] = fr.result;
      b[kind + 'Name'] = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
      renderBranding();
      A.toast(kind === 'avatar' ? 'Avatar ready — apply to publish it' : 'Banner ready — apply to publish it', { variant: 'accent' });
    };
    fr.onerror = function () { A.toast('Could not read that file', { variant: 'danger' }); };
    fr.readAsDataURL(file);
  }

  function wireBranding() {
    A.on('input', '#brand-nick', function (ev, input) {
      var c = document.getElementById('brand-nick-count');
      if (c) {
        c.textContent = input.value.length + '/' + NICK_MAX;
        c.className = 'ad-count' + (input.value.length >= NICK_MAX ? ' is-over' : input.value.length > NICK_MAX - 6 ? ' is-near' : '');
      }
      var err = document.getElementById('brand-nick-err');
      if (err) {
        if (!input.value.trim()) {
          err.textContent = 'A nickname is required. Leave it as “Asbern” if you do not want to rename it.';
          err.removeAttribute('hidden');
          input.setAttribute('aria-invalid', 'true');
        } else {
          err.setAttribute('hidden', ''); input.removeAttribute('aria-invalid');
        }
      }
      paintPreview();
    });
    A.on('input', '#brand-bio', function (ev, ta) {
      var c = document.getElementById('brand-bio-count');
      if (c) {
        c.textContent = ta.value.length + '/' + BIO_MAX;
        c.className = 'ad-count' + (ta.value.length >= BIO_MAX ? ' is-over' : ta.value.length > BIO_MAX - 25 ? ' is-near' : '');
      }
      paintPreview();
    });
    A.on('change', '[data-ad-file]', function (ev, input) {
      readImage(input.files && input.files[0], input.getAttribute('data-ad-file'));
    });
    A.on('click', '[data-ad-clear]', function (ev, btn) {
      ev.preventDefault();
      var kind = btn.getAttribute('data-ad-clear');
      var b = brandOf();
      b[kind] = null; b[kind + 'Name'] = null;
      renderBranding();
    });
    ['dragover', 'dragenter'].forEach(function (type) {
      A.on(type, '[data-ad-drop]', function (ev, zone) { ev.preventDefault(); zone.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (type) {
      A.on(type, '[data-ad-drop]', function (ev, zone) { zone.classList.remove('is-over'); });
    });
    A.on('drop', '[data-ad-drop]', function (ev, zone) {
      ev.preventDefault();
      var dt = ev.dataTransfer;
      if (dt && dt.files && dt.files[0]) readImage(dt.files[0], zone.getAttribute('data-ad-drop'));
    });
    A.on('click', '[data-ad-brand-save]', function () {
      var b = brandOf();
      var nick = document.getElementById('brand-nick');
      if (nick && !nick.value.trim()) {
        A.toast('Give it a nickname first', { variant: 'danger' });
        nick.focus();
        return;
      }
      if (nick) b.nick = nick.value.trim();
      var bio = document.getElementById('brand-bio');
      if (bio) b.bio = bio.value;
      var flag = document.getElementById('brand-saved');
      if (flag) {
        flag.removeAttribute('hidden');
        window.setTimeout(function () { flag.setAttribute('hidden', ''); }, 2600);
      }
      A.toast('Applied to ' + currentGuild().name + ' — live immediately', { variant: 'success' });
    });
    A.on('click', '[data-ad-brand-reset]', function () {
      delete branding[currentGuild().name];
      renderBranding();
      A.toast('Reset to the defaults', { variant: 'accent' });
    });
  }

  /* =======================================================================
     20 · VIEW · PERMISSIONS — the three bitfields, and the fourth thing
     ======================================================================= */

  function renderPermissions() {
    var host = document.getElementById('view-permissions');
    if (!host) return;
    var g = currentGuild();
    var held = PERM_SETS[g.permSet].perms;
    var missing = PERM_SETS.full.perms.filter(function (p) { return held.indexOf(p) === -1; });
    var hier = g.hierarchy;
    var roles = g.entities.role;
    var botIdx = 0;
    roles.forEach(function (r, i) { if (r.name === 'Asbern') botIdx = i; });

    host.innerHTML =
      '<div class="ad-view__head"><div>' +
        '<h1 class="ad-view__title">Permission health</h1>' +
        '<p class="ad-view__lede">What Asbern is allowed to do in ' + esc(g.name) + ', what it is not, and — ' +
        'for each gap — <strong>what specifically breaks</strong>. “Missing Manage Expressions” is a fact you ' +
        'cannot act on; “Add Emoji will refuse” is.</p>' +
      '</div><div class="as-row">' +
        (missing.length ? badge(missing.length + ' missing', 'as-badge--warn') : badge('Nothing missing', 'as-badge--success')) +
        (hier.above.length ? badge(hier.above.length + ' roles above', 'as-badge--danger') : '') +
      '</div></div>' +

      /* --- 1. The three sets ------------------------------------------- */
      '<div class="ad-subhead"><span class="ad-subhead__t">The three install sets</span>' +
        '<span class="ad-subhead__n">none of them includes Administrator</span></div>' +

      '<div class="as-grid as-grid--gap-6 u-mb-8">' +
        ['minimum', 'recommended', 'full'].map(function (key) {
          var s = PERM_SETS[key];
          var isHeld = g.permSet === key;
          var covered = s.perms.filter(function (p) { return held.indexOf(p) > -1; }).length;
          return '<div class="as-card as-stack' + (isHeld ? ' as-card--accent' : '') + '">' +
            '<div class="as-row as-row--between">' +
              '<h3 style="font-size:var(--as-text-md)">' + esc(s.name) + '</h3>' +
              (isHeld ? badge('Installed', 'as-badge--accent') : badge(covered + '/' + s.perms.length, 'as-badge--plain')) +
            '</div>' +
            '<div class="ad-bitfield">' + esc(s.value) +
              '<button class="as-btn as-btn--ghost as-btn--icon as-btn--sm" type="button" data-as-copy="' + esc(s.value) +
              '" aria-label="Copy the permission integer">' + icon('link') + '</button></div>' +
            '<p class="u-text-sm">' + esc(s.blurb) + '</p>' +
            '<div class="as-row u-mt-auto">' +
              (isHeld
                ? '<span class="u-text-xs as-muted">' + icon('check') + ' This is what the bot holds today.</span>'
                : '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-permset="' + key + '">' +
                  'Preview this set</button>') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      '<div class="as-note as-note--frost u-mb-8">' + icon('info') +
        '<span><strong>Asbern does not need Administrator.</strong> Exactly one thing does: handing a role a ' +
        'permission the bot does not itself hold. Rather than keep Administrator for it, boxes Asbern cannot grant ' +
        'render disabled with the reason — “Asbern cannot grant Administrator because it does not have it”. ' +
        'A bot that cannot escalate beyond itself is the honest product answer.</span></div>' +

      /* --- 2. What is missing, and what it costs ----------------------- */
      '<div class="ad-subhead"><span class="ad-subhead__t">What is missing</span>' +
        '<span class="ad-subhead__n">' + missing.length + ' of ' + PERM_SETS.full.perms.length + '</span></div>' +

      (missing.length
        ? '<div class="as-table-wrap u-mb-8"><table class="as-table">' +
          '<caption class="as-visually-hidden">Missing permissions and what each one breaks</caption>' +
          '<thead><tr><th scope="col">Permission</th><th scope="col">Bit</th><th scope="col">What breaks</th></tr></thead><tbody>' +
          missing.map(function (p) {
            var m = PERM_META[p];
            return '<tr><th scope="row" style="color:var(--as-text-1);font-weight:600;white-space:nowrap">' +
              esc(m.label) + '</th>' +
              '<td class="u-mono u-text-xs as-muted">' + esc(m.bit) + '</td>' +
              '<td>' + esc(m.breaks) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
        : '<div class="as-card as-card--tight u-mb-8"><div class="as-row">' + icon('check') +
          '<span class="u-text-sm"><strong>Every permission in the Full set is granted.</strong> ' +
          'There is nothing to fix here, which is a state this page is happy to show rather than inventing a warning.' +
          '</span></div></div>') +

      '<div class="ad-duo ad-duo--even">' +
        /* --- 3. ⭐ The hierarchy — no bitfield expresses this ---------- */
        '<div>' +
          '<div class="ad-subhead"><span class="ad-subhead__t">Role position</span>' +
            '<span class="ad-subhead__n">the half that is not a permission</span></div>' +
          '<div class="as-card">' +
            (hier.above.length
              ? '<div class="as-note as-note--danger u-mb-4">' + icon('alert') +
                '<span><strong>Drag Asbern\'s role to the top of your role list.</strong><br>' +
                'Server Settings → Roles → drag <strong>Asbern</strong> above every role you want it to manage. ' +
                'Permissions decide <em>what</em> it may do; position decides <em>who</em> it may do it to. ' +
                'A bot with every permission and a low role can still do nothing.</span></div>'
              : '<div class="as-note u-mb-4">' + icon('check') +
                '<span><strong>Asbern sits above every role it manages.</strong> Nothing to do.</span></div>') +
            '<div class="ad-ladder">' +
              roles.map(function (r, i) {
                var isBot = r.name === 'Asbern';
                var blocked = i < botIdx;
                return '<div class="ad-rank ' + (isBot ? 'ad-rank--bot' : blocked ? 'ad-rank--blocked' : 'ad-rank--ok') + '">' +
                  '<span class="ad-rank__swatch" style="background:' + esc(r.color) + '"></span>' +
                  '<span>' + esc(r.name) + (isBot ? ' — the bot' : '') + '</span>' +
                  '<span class="ad-rank__pos">' + (isBot ? 'position ' + r.position
                    : blocked ? 'cannot be managed' : 'manageable') + '</span></div>';
              }).join('') +
            '</div>' +
            '<p class="u-text-xs as-muted u-mt-4">' +
              '<strong>Administrator does not override this.</strong> Discord refuses to let a bot touch a role at ' +
              'or above its own highest position, whatever permissions it holds. Ties break by role id, so ' +
              '“the same height” counts as above.</p>' +
          '</div>' +
        '</div>' +

        /* --- 4. Graceful-degradation gaps, ranked ---------------------- */
        '<div>' +
          '<div class="ad-subhead"><span class="ad-subhead__t">If a permission goes missing</span>' +
            '<span class="ad-subhead__n">how each failure actually shows up</span></div>' +
          '<div class="as-accordion">' +
            [
              ['Booster prison retries forever', 'danger',
               'Without Move Members, a member sitting in the stage channel is retried indefinitely — a permanent refusal loop against Discord\'s API. The fix is to count consecutive failures and disable the escalator for the server with a stated reason, rather than hammering.'],
              ['Rank and icon roles fail silently, per member', 'danger',
               'Without Manage Roles — or with one rank role dragged above the bot — a member levels up and simply never gets the role. Nothing on screen says so. This is the exact class of silent wrong number this codebase has been bitten by repeatedly, which is why it is first on the list rather than last.'],
              ['Welcome, goodbye and auto-role drop every join', 'warn',
               'You configure a welcome message, watch nobody get welcomed, and have no way to find out why. The errors are collected and warned to a log nobody reads.'],
              ['Counting stops deleting, and the room counts from a lie', 'warn',
               'Manage Messages is what removes a wrong number. Without it the behaviour on refusal is correct and typed — but you are not told, and the count carries on from the wrong value.'],
              ['Channel and role controls say only “Missing Permissions”', 'warn',
               'About forty controls refuse with a raw Discord string: no permission named, no channel named, no hint that it is fixable in Server Settings. The translator that fixes this already exists on the Members and Guild tabs; the other tabs have not adopted it yet.']
            ].map(function (row) {
              return '<details class="as-acc"><summary class="as-acc__summary">' +
                '<span class="as-row" style="gap:.5rem">' +
                (row[1] === 'danger' ? '<span class="as-badge as-badge--danger">High</span>' : '<span class="as-badge as-badge--warn">Medium</span>') +
                '<span>' + esc(row[0]) + '</span></span></summary>' +
                '<div class="as-acc__body">' + esc(row[2]) + '</div></details>';
            }).join('') +
          '</div>' +
          '<p class="u-text-xs as-muted u-mt-4">These are known gaps in how the bot <em>reports</em> a refusal, ' +
          'listed here rather than discovered by you. None of them loses data.</p>' +
        '</div>' +
      '</div>';

    A.mount(host);
  }

  function wirePermissions() {
    A.on('click', '[data-ad-permset]', function (ev, btn) {
      var key = btn.getAttribute('data-ad-permset');
      currentGuild().permSet = key;
      A.toast('Previewing the ' + PERM_SETS[key].name + ' set', { variant: 'accent' });
      rerenderAll();
    });
  }

  /* =======================================================================
     21 · ROUTER + BOOT
     ======================================================================= */

  var currentView = 'overview';
  var VIEW_IDS = ['overview', 'modules', 'module', 'controls', 'branding', 'permissions', 'activity'];

  /* WEB-UX-REFERENCE §8 AMENDMENT 2: the category trains owners to land on a grid
     of cards. Somebody arriving with MEE6 or Dyno muscle memory expects Modules,
     so that is the default; Overview stays first in the sidebar and one click away. */
  var DEFAULT_VIEW = 'modules';

  function parseHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (!h) return { view: DEFAULT_VIEW, arg: null };
    var parts = h.split('/');
    var view = parts[0];
    var arg = parts.slice(1).join('/') || null;
    if (VIEW_IDS.indexOf(view) === -1) return { view: DEFAULT_VIEW, arg: null };
    return { view: view, arg: arg };
  }

  function showView(view) {
    VIEW_IDS.forEach(function (v) {
      var node = document.getElementById('view-' + v);
      if (node) { if (v === view) node.removeAttribute('hidden'); else node.setAttribute('hidden', ''); }
    });
  }

  function route() {
    var r = parseHash();
    currentView = r.view;
    showView(r.view);
    if (r.view === 'overview') renderOverview();
    else if (r.view === 'modules') renderModules();
    else if (r.view === 'module') renderModuleDetail(r.arg);
    else if (r.view === 'controls') {
      if (r.arg && r.arg.indexOf('tab-') === 0) { renderControls(); var t = document.getElementById(r.arg); if (t) t.click(); }
      else renderControls(r.arg);
    } else if (r.view === 'branding') renderBranding();
    else if (r.view === 'permissions') renderPermissions();
    else if (r.view === 'activity') renderActivity();
    renderSidebar(r.view === 'module' ? 'modules' : r.view);
    window.scrollTo({ top: 0, behavior: A.reducedMotion ? 'auto' : 'smooth' });
  }

  /** Re-render everything that depends on the selected guild or actor. */
  var rerenderAll = function () {
    renderServerSelect();
    renderAccount();
    renderSidebar(currentView);
    var page = document.body.getAttribute('data-ad-page');
    if (page === 'dashboard') route();
    else if (page === 'billing') renderBilling();
    else if (page === 'bridge') renderBridge();
  };

  /* =======================================================================
     22 · PAGE · BILLING — plan, the two metered lines, invoices, cancellation
     -----------------------------------------------------------------------
     ⚠ Every figure is read from PRICING above. Nothing is written into markup,
     so swapping the final ladder is a one-object edit.
     ======================================================================= */

  var billPeriod = null;      /* null = follow the guild; else monthly|annual */
  var wiredBilling = false;

  function periodOf() { return billPeriod || currentGuild().billingPeriod || 'monthly'; }

  function planPrice(plan, period) {
    if (plan.custom) return null;
    if (period === 'annual') return plan.annualPerMo;
    return plan.monthly;
  }

  function withFounding(amount) {
    var g = currentGuild();
    if (!g.founding || !amount) return amount;
    return amount * (1 - PRICING.founding.percentOff / 100);
  }

  function meteredCard(line) {
    var g = currentGuild();
    var usage = USAGE[g.name][line.id];
    var allowance = line.includedByPlan ? allowanceFor(line.id, g.plan) : null;

    /* ---- A line that cannot be bought yet says so, loudly and once. ---- */
    if (!line.available) {
      return '<article class="as-card ad-mod is-unavailable" style="gap:var(--as-space-4)">' +
        '<div class="as-row as-row--between as-row--top">' +
          '<div class="as-row as-row--nowrap as-row--top">' +
            '<span class="as-plate">' + icon(line.icon) + '</span>' +
            '<div><h3 style="font-size:var(--as-text-md)">' + esc(line.name) + '</h3>' +
            '<p class="u-text-xs as-muted">' + esc(line.what) + '</p></div>' +
          '</div>' +
          badge('Not available yet', 'as-badge--warn') +
        '</div>' +

        '<div class="as-note as-note--warn">' + icon('alert') +
          '<span><strong>You cannot buy this today, and there is no button that pretends otherwise.</strong> ' +
          esc(line.unavailableReason) + '</span></div>' +

        '<p class="u-text-sm">' + esc(line.why) + '</p>' +

        '<details class="as-acc"><summary class="as-acc__summary">How it will be sold</summary>' +
          '<div class="as-acc__body as-stack">' +
            '<p>Usage-based, exactly like media egress — <strong>never</strong> bundled into a subscription, ' +
            'because one busy server measured more per month than any plan costs.</p>' +
            '<div class="as-table-wrap"><table class="as-table as-table--compact">' +
              '<caption class="as-visually-hidden">Measured AI costs</caption>' +
              '<thead><tr><th scope="col">Measured</th><th scope="col" class="as-num">Cost</th></tr></thead><tbody>' +
              line.measured.map(function (m) {
                return '<tr><th scope="row" style="font-weight:500">' + esc(m.k) + '</th>' +
                  '<td class="as-num u-mono">' + esc(m.v) + '</td></tr>';
              }).join('') + '</tbody></table></div>' +
            '<div class="as-note as-note--warn">' + icon('alert') + '<span>' + esc(line.surpriseShape) + '</span></div>' +
            '<div><strong class="u-text-sm">' + esc(line.overage.offMeans) + '</strong>' +
            '<p class="u-text-xs as-muted u-mt-2">' + esc(line.overage.onMeans) + '</p></div>' +
            ladderHtml(line, 0) +
            '<p class="u-text-xs as-muted">' + esc(line.neverTouched) + '</p>' +
            '<div class="as-note">' + icon('info') + '<span>' + esc(line.caveat) + '</span></div>' +
          '</div></details>' +

        '<div class="ad-mod__foot">' +
          '<span class="ad-mock">Design preview</span>' +
          '<span class="u-text-xs as-muted">Per server by design — the shared ceiling is the bug being fixed.</span>' +
        '</div>' +
      '</article>';
    }

    /* ---- The live line. ------------------------------------------------ */
    if (!allowance) {
      return '<article class="as-card as-stack">' +
        '<div class="as-row as-row--nowrap as-row--top">' +
          '<span class="as-plate">' + icon(line.icon) + '</span>' +
          '<div><h3 style="font-size:var(--as-text-md)">' + esc(line.name) + '</h3>' +
          '<p class="u-text-xs as-muted">' + esc(line.what) + '</p></div>' +
        '</div>' +
        '<div class="as-empty" style="padding:var(--as-space-8) var(--as-space-4)">' +
          '<span class="as-empty__icon">' + icon(line.icon) + '</span>' +
          '<span class="as-empty__title">Nothing metered on this plan</span>' +
          '<span class="as-empty__body">' + esc(currentPlan().meteredNote) +
          ' Nothing is throttled and nothing is being counted — the feature that would use it is not switched on.</span>' +
          '<a class="as-btn as-btn--primary as-btn--sm" href="#plans">Compare plans</a>' +
        '</div></article>';
    }

    var used = usage.used;
    var pct = (used / allowance) * 100;
    var viewerHours = Math.round(used / line.gbPerViewerHour);
    var blocksNeeded = Math.max(0, Math.ceil((used - allowance) / line.overage.blockSize));

    return '<article class="as-card as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
      '<div class="as-row as-row--between as-row--top">' +
        '<div class="as-row as-row--nowrap as-row--top">' +
          '<span class="as-plate as-plate--accent">' + icon(line.icon) + '</span>' +
          '<div><h3 style="font-size:var(--as-text-md)">' + esc(line.name) + '</h3>' +
          '<p class="u-text-xs as-muted">' + esc(line.what) + '</p></div>' +
        '</div>' +
        badge(Math.round(pct) + '% of allowance', pct >= 100 ? 'as-badge--danger' : pct >= 80 ? 'as-badge--warn' : 'as-badge--success') +
      '</div>' +

      meterBar(pct, line.ladder) +

      '<div class="as-grid as-grid--4">' +
        '<div class="as-stat"><span class="as-stat__label">Delivered</span>' +
          '<span class="as-stat__value">' + used.toFixed(1) + '</span>' +
          '<span class="as-stat__note">GB this period</span></div>' +
        '<div class="as-stat"><span class="as-stat__label">Included</span>' +
          '<span class="as-stat__value">' + A.num(allowance) + '</span>' +
          '<span class="as-stat__note">GB · ' + esc((line.includedNote || {})[currentGuild().plan] || '') + '</span></div>' +
        '<div class="as-stat"><span class="as-stat__label">≈ viewer-hours</span>' +
          '<span class="as-stat__value">' + A.num(viewerHours) + '</span>' +
          '<span class="as-stat__note">at ' + line.gbPerViewerHour + ' GB each</span></div>' +
        '<div class="as-stat"><span class="as-stat__label">Screenings</span>' +
          '<span class="as-stat__value">' + usage.screeningsThisPeriod + '</span>' +
          '<span class="as-stat__note">peak ' + usage.peakViewers + ' viewers</span></div>' +
      '</div>' +

      '<div class="as-note">' + icon('info') +
        '<span>You are billed on <strong>bytes delivered</strong>, which is what a CDN invoices us for. ' +
        'Viewer-hours are shown beside it as a translation, never instead of it — the conversion rate is a ' +
        'property of the video we encode and could change, and an allowance that silently shrank would be ' +
        'indistinguishable from being cheated.</span></div>' +

      ladderHtml(line, pct) +

      '<div class="as-card as-card--tight" style="background:var(--as-sunken)">' +
        '<div class="as-row as-row--between as-row--top">' +
          '<div class="u-grow">' +
            '<label class="as-switch"><input type="checkbox" data-ad-overage' + (usage.overageOn ? ' checked' : '') + '>' +
              '<span class="as-switch__label"><strong>Bill me for overage</strong></span></label>' +
            '<p class="u-text-xs as-muted u-mt-2">' +
              (usage.overageOn ? esc(line.overage.onMeans) : esc(line.overage.offMeans)) + '</p>' +
          '</div>' +
          '<span class="u-none">' + (usage.overageOn ? badge('On', 'as-badge--warn') : badge('Off · default', 'as-badge--success')) + '</span>' +
        '</div>' +
        (usage.overageOn
          ? '<div class="as-field u-mt-4" style="max-width:22rem">' +
            '<label class="as-label" for="ov-cap">Never spend more than, per month</label>' +
            '<input class="as-input" id="ov-cap" type="number" min="0" step="2" value="' +
              (usage.overageCeiling != null ? usage.overageCeiling : 20) + '">' +
            '<span class="as-hint">Sold in ' + line.overage.blockSize + ' GB blocks at ' +
              money(line.overage.blockPrice) + '. We never exceed this figure, ever. ' +
              (blocksNeeded ? 'This period you would be at ' + money(blocksNeeded * line.overage.blockPrice) + '.' : '') +
            '</span></div>'
          : '') +
      '</div>' +

      '<div class="as-note as-note--warn">' + icon('alert') + '<span>' + esc(line.caveat) + '</span></div>' +
      '<p class="u-text-xs as-muted">' + esc(line.neverTouched) + '</p>' +
    '</article>';
  }

  function ladderHtml(line, pct) {
    return '<div class="as-stack--2" style="display:flex;flex-direction:column;gap:.5rem">' +
      line.ladder.map(function (r) {
        var cls = pct >= r.at ? (r.at >= 150 ? ' is-past' : ' is-reached') : '';
        return '<div class="ad-rung' + cls + '">' +
          '<span class="ad-rung__at">' + esc(r.label) + '</span>' +
          '<span class="ad-rung__what">' + r.what +
            '<div class="u-text-xs as-muted u-mt-2">Told: ' + esc(r.who) + '</div></span>' +
          (pct >= r.at ? '<span class="u-none">' + badge('Reached', r.at >= 150 ? 'as-badge--danger' : 'as-badge--warn') + '</span>' : '') +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderBilling() {
    var g = currentGuild();
    var plan = currentPlan();
    var period = periodOf();
    var base = planPrice(plan, period);
    var net = withFounding(base);
    var invoices = INVOICES[g.name] || [];

    /* ---- Current plan ------------------------------------------------- */
    fill('bill-current',
      '<div class="as-card as-card--accent as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
        '<div class="as-row as-row--between as-row--top">' +
          '<div>' +
            '<span class="as-eyebrow">Current plan</span>' +
            '<h2 class="as-display as-display--lg u-mt-2">' + esc(plan.name) +
              (plan.selfHost ? ' <span class="as-badge as-badge--frost">Self-host</span>' : '') + '</h2>' +
            '<p class="u-text-sm u-mt-2">' + esc(plan.blurb) + '</p>' +
          '</div>' +
          '<div class="u-text-right u-none">' +
            (plan.custom
              ? '<div class="as-tier__amount">Custom</div>'
              : '<div class="as-tier__price" style="justify-content:flex-end">' +
                '<span class="as-tier__amount">' + money(net) + '</span>' +
                '<span class="as-tier__per">/ month</span></div>' +
                (g.founding ? '<div class="u-text-xs as-muted"><s>' + money(base) + '</s> · ' +
                  esc(PRICING.founding.name) + ' −' + PRICING.founding.percentOff + '%</div>' : '') +
                (period === 'annual' ? '<div class="u-text-xs as-muted">billed ' + money(plan.annual) + ' yearly</div>' : '')) +
            '<div class="u-mt-2">' + (plan._provisional ? provisionalTag() : '') + '</div>' +
          '</div>' +
        '</div>' +

        (plan.custom ? '' :
          '<div class="as-row as-row--between">' +
            '<div class="as-segmented" role="group" aria-label="Billing period">' +
              ['monthly', 'annual'].map(function (p) {
                return '<label class="as-segmented__opt"><input type="radio" name="ad-period" value="' + p + '"' +
                  (period === p ? ' checked' : '') + ' data-ad-period><span>' +
                  (p === 'monthly' ? 'Monthly' : 'Annual') + '</span></label>';
              }).join('') +
            '</div>' +
            (plan.annualPerMo
              ? '<span class="u-text-xs as-muted">Annual works out at ' + money(withFounding(plan.annualPerMo)) +
                '/mo — about ' + Math.round((1 - plan.annualPerMo / plan.monthly) * 100) + '% less.</span>'
              : '') +
          '</div>') +

        '<div class="ad-kv">' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Server</span><span class="ad-kv__v">' + esc(g.name) + '</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Members</span><span class="ad-kv__v">' + A.num(g.members) +
            ' <span class="ad-kv__v--quiet u-text-xs">· ' + esc(plan.ceilingNote) + '</span></span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Next invoice</span><span class="ad-kv__v">' +
            (plan.monthly ? money(net) + ' · ' + (USAGE[g.name].egress.periodEnds || 'in 30 days') : '—') + '</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Usage lines</span><span class="ad-kv__v ad-kv__v--quiet">' +
            PRICING.metered.map(function (l) { return l.name + (l.available ? '' : ' (not on sale)'); }).join(' · ') + '</span></div>' +
        '</div>' +

        '<div class="as-row">' +
          '<a class="as-btn as-btn--primary" href="#plans">Change plan</a>' +
          '<a class="as-btn as-btn--secondary" href="#usage">See usage</a>' +
          '<span class="u-grow"></span>' +
          '<a class="as-btn as-btn--ghost as-btn--sm" href="#cancel">Cancel</a>' +
        '</div>' +

        (g.founding
          ? '<div class="as-note as-note--accent">' + icon('spark') +
            '<span><strong>' + esc(PRICING.founding.name) + ' — ' + PRICING.founding.percentOff + '% off ' +
            esc(PRICING.founding.appliesTo) + ', held for as long as this stays active.</strong> ' +
            'It never applies to ' + esc(PRICING.founding.neverAppliesTo) + ': a discounted subscription costs us ' +
            'margin, a discounted allowance costs us bandwidth we have already paid for. ' +
            '<br><span class="u-text-xs as-muted">' + PRICING.founding.terms.map(esc).join(' ') + '</span></span></div>'
          : '') +
      '</div>');

    /* ---- Metered usage ------------------------------------------------ */
    fill('bill-usage',
      '<div class="ad-view__head"><div>' +
        '<h2 class="ad-view__title">Usage</h2>' +
        '<p class="ad-view__lede">Your subscription buys features. <strong>Media egress and AI are billed on what ' +
        'you actually use</strong>, and they are separate lines for one reason: a subscription cannot be both ' +
        'cheap and a subsidy for other people\'s bandwidth. Both default to off, both are capped by you, and both ' +
        'fail by stopping rather than by billing.</p>' +
      '</div></div>' +
      '<div class="as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
        PRICING.metered.map(meteredCard).join('') +
      '</div>');

    /* ---- Plans -------------------------------------------------------- */
    fill('bill-plans',
      '<div class="ad-view__head"><div>' +
        '<h2 class="ad-view__title">Plans</h2>' +
        '<p class="ad-view__lede">Priced per server, because the cost is per server. Additional servers on one ' +
        'account are 25% off each.</p>' +
      '</div><div class="as-row">' + provisionalTag() + '</div></div>' +

      '<div class="as-note as-note--warn u-mb-6">' + icon('alert') +
        '<span><strong>These figures are not published prices.</strong> The ladder is being revised downward and ' +
        'every number carrying a “provisional” marker will move. Nothing on this page is an offer.</span></div>' +

      '<div class="as-grid as-grid--gap-6">' +
        PRICING.plans.map(function (p) {
          var isCurrent = p.id === g.plan;
          var allowance = allowanceFor('egress', p.id);
          var price = planPrice(p, period);
          return '<div class="as-card as-tier' + (p.popular ? ' as-tier--popular' : '') + (isCurrent ? ' as-card--accent' : '') + '">' +
            (p.popular ? '<span class="as-tier__flag">' + badge('Most chosen', 'as-badge--accent') + '</span>' : '') +
            '<div><div class="as-tier__name">' + esc(p.name) + '</div>' +
            '<div class="as-tier__epithet">' + esc(p.blurb) + '</div></div>' +
            '<div class="as-tier__price">' +
              (p.custom ? '<span class="as-tier__amount">Talk to us</span>'
                : '<span class="as-tier__amount">' + money(price) + '</span><span class="as-tier__per">/mo</span>') +
            '</div>' +
            (p._provisional ? '<div>' + provisionalTag() + '</div>' : '') +
            '<div class="as-tier__body as-list">' +
              '<div class="as-list__item">' + icon(allowance ? 'check' : 'minus') + '<span>' +
                (allowance === null ? 'Egress negotiated' : allowance ? A.num(allowance) + ' GB egress included' : 'No relay allowance') +
                '</span></div>' +
              '<div class="as-list__item">' + icon('check') + '<span>' + esc(p.ceilingNote) + '</span></div>' +
              '<div class="as-list__item' + (p.selfHost ? '' : ' as-list__item--no') + '">' +
                icon(p.selfHost ? 'check' : 'minus') + '<span>' +
                (p.selfHost ? 'Runs on your own hardware' : 'Hosted by us') + '</span></div>' +
              '<div class="as-list__item">' + icon('check') + '<span>' +
                MODULES.filter(function (m) { return m.status === 'shipped' && TIER_RANK[p.id] >= TIER_RANK[m.tier]; }).length +
                ' modules included</span></div>' +
            '</div>' +
            (isCurrent
              ? '<button class="as-btn as-btn--secondary as-btn--block" type="button" disabled>Your plan</button>'
              : '<button class="as-btn ' + (p.popular ? 'as-btn--primary' : 'as-btn--secondary') +
                ' as-btn--block" type="button" data-ad-plan="' + esc(p.id) + '">' +
                (p.custom ? 'Contact sales' : (TIER_RANK[p.id] > TIER_RANK[g.plan] ? 'Upgrade to ' : 'Change to ') + esc(p.name)) +
                '</button>') +
          '</div>';
        }).join('') +
      '</div>' +

      '<div class="as-note u-mt-6">' + icon('info') +
        '<span><strong>Changing plan never deletes anything.</strong> Moving down hides what the lower plan does ' +
        'not include — it does not erase it. Stats keep being collected, balances are untouched, and moving back ' +
        'up reveals the full history instantly.</span></div>');

    /* ---- Invoices ----------------------------------------------------- */
    fill('bill-invoices',
      '<div class="ad-subhead"><span class="ad-subhead__t">Invoices</span>' +
        '<span class="ad-subhead__n">' + invoices.length + '</span></div>' +
      (invoices.length
        ? '<div class="as-table-wrap"><table class="as-table">' +
          '<caption class="as-visually-hidden">Invoice history</caption>' +
          '<thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col">Period</th>' +
          '<th scope="col">Lines</th><th scope="col" class="as-num">Total</th><th scope="col">Status</th>' +
          '<th scope="col"><span class="as-visually-hidden">Download</span></th></tr></thead><tbody>' +
          invoices.map(function (inv) {
            return '<tr><th scope="row" class="u-mono u-text-xs" style="color:var(--as-text-1)">' + esc(inv.id) + '</th>' +
              '<td class="u-nowrap">' + esc(inv.date) + '</td><td class="u-nowrap">' + esc(inv.period) + '</td>' +
              '<td class="u-text-xs">' + inv.lines.map(function (l) {
                return esc(l[0]) + ' <span class="as-muted">' + money(l[1]) + '</span>';
              }).join('<br>') + '</td>' +
              '<td class="as-num">' + money(inv.total) + '</td>' +
              '<td>' + badge(inv.state, inv.state === 'paid' ? 'as-badge--success' : 'as-badge--warn') + '</td>' +
              '<td><button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-invoice="' + esc(inv.id) + '">' +
                icon('download') + ' PDF</button></td></tr>';
          }).join('') + '</tbody></table></div>'
        : '<div class="as-empty"><span class="as-empty__icon">' + icon('ticket') + '</span>' +
          '<span class="as-empty__title">No invoices</span>' +
          '<span class="as-empty__body">This server has never been charged. On the Free plan there is nothing to ' +
          'bill — no subscription, no relay allowance, and therefore nothing metered.</span></div>'));

    /* ---- Payment method ----------------------------------------------- */
    fill('bill-payment',
      '<div class="ad-subhead"><span class="ad-subhead__t">Payment method</span>' +
        '<span class="ad-subhead__n"><span class="ad-mock">Mock</span></span></div>' +
      '<div class="as-card as-row as-row--between">' +
        '<div class="as-row as-row--nowrap">' +
          '<span class="as-plate as-plate--lg">' + icon('ticket') + '</span>' +
          '<div><div class="as-strong">•••• •••• •••• 4242</div>' +
          '<div class="u-text-xs as-muted">Expires 04/29 · billed in ' + esc(PRICING.currency) + '</div></div>' +
        '</div>' +
        '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-checkout="update">Update</button>' +
      '</div>' +
      '<div class="as-note as-note--warn u-mt-4">' + icon('alert') +
        '<span><strong>There is no payment integration behind this page.</strong> No card is stored, no request ' +
        'leaves your browser, and the checkout step is a drawn mock-up labelled as one. Real billing lands with ' +
        'the billing phase, and it runs in shadow for a full month — meters running, invoices generated and ' +
        'discarded — before anyone is charged a real amount.</span></div>');

    /* ---- Cancellation -------------------------------------------------- */
    fill('bill-cancel',
      '<div class="ad-subhead"><span class="ad-subhead__t">Cancelling</span></div>' +
      '<div class="as-card as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
        '<p class="u-text-sm"><strong>Your data is never deleted because you stopped paying.</strong> ' +
        'Balances are not zeroed, levels are not reset, watch history is kept and stats keep being collected. ' +
        'What lapses is access, not the data. Here is exactly what happens, day by day:</p>' +
        '<div class="ad-timeline">' +
          PRICING.lapseLadder.map(function (s, i) {
            return '<div class="ad-tl' + (i === 0 ? ' is-now' : '') + '">' +
              '<div><div class="ad-tl__when">' + esc(s.when) + '</div>' +
              '<div class="ad-tl__what">' + s.what + '</div></div></div>';
          }).join('') +
        '</div>' +
        '<div class="as-row">' +
          '<button class="as-btn as-btn--danger" type="button" data-ad-cancel>Cancel this subscription</button>' +
          '<span class="u-text-xs as-muted">You keep everything you have paid for until the period ends.</span>' +
        '</div>' +
      '</div>');

    if (!wiredBilling) { wireBilling(); wiredBilling = true; }
    A.mount(document.body);
  }

  function wireBilling() {
    A.on('change', '[data-ad-period]', function (ev, input) {
      billPeriod = input.value;
      renderBilling();
      A.toast('Showing ' + input.value + ' pricing', { variant: 'accent' });
    });

    A.on('change', '[data-ad-overage]', function (ev, input) {
      var u = USAGE[currentGuild().name].egress;
      u.overageOn = input.checked;
      if (input.checked && u.overageCeiling == null) u.overageCeiling = 20;
      renderBilling();
      A.toast(input.checked
        ? 'Overage billing on — set your ceiling below · saved'
        : 'Overage billing off · saved. Streams stop rather than bill.',
      { variant: input.checked ? 'warn' : 'success' });
    });

    A.on('change', '#ov-cap', function (ev, input) {
      USAGE[currentGuild().name].egress.overageCeiling = Number(input.value);
      A.toast('Ceiling set to ' + money(Number(input.value)) + ' · saved', { variant: 'success' });
    });

    A.on('click', '[data-ad-invoice]', function (ev, btn) {
      A.toast('Invoice PDFs are not built yet — nothing was downloaded', { variant: 'warn' });
    });

    A.on('click', '[data-ad-plan]', function (ev, btn) {
      var p = tierById(btn.getAttribute('data-ad-plan'));
      if (!p) return;
      if (p.custom) {
        A.toast('Enterprise is a conversation, not a checkout', { variant: 'accent' });
        return;
      }
      openCheckout(p);
    });

    A.on('click', '[data-ad-checkout]', function () {
      A.toast('The payment step is a mock — no card form exists', { variant: 'warn' });
    });

    A.on('click', '[data-ad-cancel]', function () { openCancel(); });
  }

  /* ---- The mock checkout. Labelled as a mock in three places, because a
     convincing fake payment screen is the one thing here that could actually
     mislead someone. ------------------------------------------------------ */

  function openCheckout(plan) {
    var g = currentGuild();
    var period = periodOf();
    var base = planPrice(plan, period);
    var net = withFounding(base);
    var dlg = document.getElementById('ad-checkout') || el(
      '<dialog class="as-modal" id="ad-checkout" aria-labelledby="ad-checkout-t"></dialog>');
    if (!dlg.parentNode) document.body.appendChild(dlg);

    dlg.innerHTML =
      '<div class="as-modal__header">' +
        '<h2 class="as-modal__title" id="ad-checkout-t">Change to ' + esc(plan.name) + '</h2>' +
        '<span class="ad-mock">Mock checkout</span>' +
      '</div>' +
      '<div class="as-modal__body as-stack">' +
        '<div class="as-note as-note--warn">' + icon('alert') +
          '<span><strong>This is a drawn mock-up of the payment step.</strong> There is no payment provider ' +
          'connected, no card field, and nothing leaves your browser. Pressing the button below only changes ' +
          'the plan in this preview.</span></div>' +
        '<div class="ad-kv">' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Server</span><span class="ad-kv__v">' + esc(g.name) + '</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">From</span><span class="ad-kv__v">' + esc(currentPlan().name) + '</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">To</span><span class="ad-kv__v">' + esc(plan.name) + '</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Billed</span><span class="ad-kv__v">' + esc(period) + '</span></div>' +
          (g.founding ? '<div class="ad-kv__row"><span class="ad-kv__k">' + esc(PRICING.founding.name) +
            '</span><span class="ad-kv__v">−' + PRICING.founding.percentOff + '%</span></div>' : '') +
          '<div class="ad-kv__row"><span class="ad-kv__k">Subscription</span><span class="ad-kv__v">' + money(net) + ' / month</span></div>' +
          '<div class="ad-kv__row"><span class="ad-kv__k">Egress included</span><span class="ad-kv__v">' +
            (allowanceFor('egress', plan.id) ? A.num(allowanceFor('egress', plan.id)) + ' GB' : 'None') + '</span></div>' +
        '</div>' +
        '<p class="u-text-xs as-muted">Usage-based lines are billed separately and are never discounted. ' +
        'AI is not purchasable at all yet.</p>' +
        (TIER_RANK[plan.id] < TIER_RANK[g.plan]
          ? '<div class="as-note">' + icon('info') + '<span>Moving down hides what ' + esc(plan.name) +
            ' does not include. Nothing is deleted, and moving back up reveals it again immediately.</span></div>'
          : '') +
      '</div>' +
      '<div class="as-modal__footer">' +
        '<button class="as-btn as-btn--ghost" type="button" data-as-modal-close>Cancel</button>' +
        '<button class="as-btn as-btn--primary" type="button" data-ad-checkout-go="' + esc(plan.id) + '">' +
          'Confirm (mock)</button>' +
      '</div>';
    A.modal(dlg);
  }

  function openCancel() {
    var g = currentGuild();
    var dlg = document.getElementById('ad-cancel') || el(
      '<dialog class="as-modal" id="ad-cancel" aria-labelledby="ad-cancel-t"></dialog>');
    if (!dlg.parentNode) document.body.appendChild(dlg);
    dlg.innerHTML =
      '<div class="as-modal__header"><h2 class="as-modal__title" id="ad-cancel-t">Cancel ' + esc(g.name) + '</h2>' +
        '<span class="ad-mock">Mock</span></div>' +
      '<div class="as-modal__body as-stack">' +
        '<div class="as-note as-note--frost">' + icon('info') +
          '<span><strong>Nothing is deleted.</strong> Not today, not in thirty days, not in a year. ' +
          'Balances, levels, watch history and stats all stay exactly as they are — you keep collecting stats ' +
          'even on the Free set. What ends is access to the paid modules.</span></div>' +
        '<div class="ad-timeline">' +
          PRICING.lapseLadder.map(function (s, i) {
            return '<div class="ad-tl' + (i === 0 ? ' is-now' : '') + '">' +
              '<div><div class="ad-tl__when">' + esc(s.when) + '</div>' +
              '<div class="ad-tl__what">' + s.what + '</div></div></div>';
          }).join('') +
        '</div>' +
        (g.founding
          ? '<div class="as-note as-note--warn">' + icon('alert') +
            '<span><strong>You would lose ' + esc(PRICING.founding.name) + '.</strong> ' +
            'A lapse of more than 30 days ends it permanently and it cannot be reinstated.</span></div>'
          : '') +
        '<div class="as-field">' +
          '<label class="as-label" for="cancel-confirm">Type <strong>' + esc(g.name) +
            '</strong> to confirm you mean this server</label>' +
          '<input class="as-input" id="cancel-confirm" autocomplete="off" placeholder="' + esc(g.name) + '">' +
          '<span class="as-hint">Typed rather than clicked, because an owner cancelling the wrong server of ' +
          'three is a support ticket nobody enjoys.</span>' +
          '<span class="as-error" id="cancel-err" hidden></span>' +
        '</div>' +
      '</div>' +
      '<div class="as-modal__footer">' +
        '<button class="as-btn as-btn--ghost" type="button" data-as-modal-close>Keep my plan</button>' +
        '<button class="as-btn as-btn--danger" type="button" data-ad-cancel-go>Cancel at period end</button>' +
      '</div>';
    A.modal(dlg);
  }

  A.on('click', '[data-ad-checkout-go]', function (ev, btn) {
    var id = btn.getAttribute('data-ad-checkout-go');
    currentGuild().plan = id;
    if (id === 'free') currentGuild().founding = false;
    A.closeModal(document.getElementById('ad-checkout'));
    A.toast('Now on ' + tierById(id).name + ' — mock, nothing was charged', { variant: 'success' });
    rerenderAll();
  });

  A.on('click', '[data-ad-cancel-go]', function () {
    var input = document.getElementById('cancel-confirm');
    var err = document.getElementById('cancel-err');
    var g = currentGuild();
    if (!input || input.value.trim() !== g.name) {
      if (err) { err.textContent = 'That is not “' + g.name + '”. Nothing has been cancelled.'; err.removeAttribute('hidden'); }
      if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
      return;
    }
    A.closeModal(document.getElementById('ad-cancel'));
    A.toast('Cancelled at period end — mock. Your data is untouched.', { variant: 'warn' });
  });
  /* =======================================================================
     23 · PAGE · BRIDGE — the self-host connector
     -----------------------------------------------------------------------
     Two rules from the platform docs shape this whole page:

     1. The agent DIALS OUT and holds the socket open. No inbound rule, no port
        forward, no public endpoint on the customer's network.
     2. ⚠ "Offline is a stated condition, never assumed to be 'no'." So the
        status lamp has four states and `unknown` is hollow rather than red —
        it is the absence of an answer, not an answer.
     ======================================================================= */

  var ENCODERS = [
    { host: 'Windows', encoder: 'NVIDIA NVENC (GTX 1050 or newer)', verdict: 'ok',
      note: 'The supported path on Windows. One 1080p stream costs almost nothing on the CPU.' },
    { host: 'Windows', encoder: 'Intel QuickSync', verdict: 'no',
      note: 'Does not work inside Docker on Windows or WSL2. This is measured, not assumed — it is what killed an entire migration plan. If your Windows machine has no NVIDIA card, plan for software transcoding.' },
    { host: 'Linux', encoder: 'QuickSync via /dev/dri, or NVENC', verdict: 'ok',
      note: 'Both work with device passthrough.' },
    { host: 'Any', encoder: 'No hardware encoder', verdict: 'warn',
      note: 'Software transcode: roughly 4–6 CPU cores per concurrent stream. It works. It is not comfortable.' }
  ];

  var SPECS = [
    ['Connector only', '1 core', '512 MB', '1 Mbps', 'A Raspberry Pi 4 is enough'],
    ['+ Music (Lavalink)', '2 cores', '2 GB', '1 Mbps', 'The JVM wants about 1 GB'],
    ['+ Media, direct play', '2 cores', '4 GB', '10 Mbps', 'No transcoding'],
    ['+ Media, 1080p transcode', '4 cores + encoder', '8 GB', '15 Mbps', 'See the encoder table above'],
    ['+ Game servers', '4–8 cores', '16–32 GB', '10 Mbps', 'Modded Minecraft wants 6–12 GB per server'],
    ['Everything at once', '8 cores + GPU', '32 GB', '25 Mbps', 'A capable desktop']
  ];

  var pairing = null;      /* { code, expiresAt, spent } */
  var pairTimer = null;
  var wiredBridge = false;
  var bridgeStateOverride = null;

  function newPairingCode() {
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   /* no I, O, 0, 1 */
    function chunk() {
      var s = '';
      for (var i = 0; i < 4; i++) s += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      return s;
    }
    return 'ASB-' + chunk() + '-' + chunk();
  }

  function bridgeState() {
    var br = BRIDGE[currentGuild().name];
    return bridgeStateOverride || br.state;
  }

  function renderBridge() {
    var g = currentGuild();
    var br = BRIDGE[g.name];
    var st = bridgeState();
    var mod = MODULE_BY_ID['bridge'];
    var ent = moduleEntitled(mod, g);

    /* ---- Status ------------------------------------------------------- */
    var stateCopy = {
      online: ['Connected', 'The agent is holding an outbound connection open. Commands go down it; nothing dials in.'],
      degraded: ['Reconnecting', 'The socket dropped and the agent is backing off. Anything in flight has a deadline and will fail cleanly rather than hang.'],
      offline: ['Offline', 'The agent has not been in touch. This is a <strong>stated</strong> condition: your machine may be asleep, updating, or off. It does not mean “no”.'],
      unknown: ['Unknown', 'We cannot currently tell. Nothing is started, stopped or billed on an unknown — a skipped tick corrects itself, a guessed one becomes a wrong number.'],
      unpaired: ['Not connected', 'No machine has been paired with this server yet.']
    };
    var sc = stateCopy[st];

    fill('br-status',
      '<div class="as-card' + (st === 'online' ? ' as-card--accent' : '') + ' as-stack--6" style="display:flex;flex-direction:column;gap:1.5rem">' +
        '<div class="as-row as-row--between as-row--top">' +
          '<div>' +
            '<span class="as-eyebrow">Your hardware</span>' +
            '<h2 class="as-display as-display--lg u-mt-2">' + esc(sc[0]) + '</h2>' +
            '<p class="u-text-sm u-mt-2" style="max-width:52ch">' + sc[1] + '</p>' +
          '</div>' +
          '<div class="u-text-right u-none">' + lamp(st, true) +
            (br.lastSeen && st !== 'unpaired'
              ? '<div class="u-text-xs as-muted u-mt-2">Last heard from ' + esc(st === 'online' ? br.lastSeen : '4 minutes ago') + '</div>'
              : '') + '</div>' +
        '</div>' +

        (st === 'unpaired' ? '' :
          '<div class="ad-kv">' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Machine</span><span class="ad-kv__v">' + esc(br.host || '—') + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Operating system</span><span class="ad-kv__v ad-kv__v--quiet">' + esc(br.os || '—') + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Agent version</span><span class="ad-kv__v u-mono">' + esc(br.agentVersion || '—') + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Platform version</span><span class="ad-kv__v u-mono">' + esc(br.platformVersion) + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Uptime</span><span class="ad-kv__v">' + A.num(br.uptimeHours) + ' hours</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Upload measured</span><span class="ad-kv__v">' + (br.upMbps ? br.upMbps + ' Mbps' : '—') + '</span></div>' +
          '</div>') +

        '<div class="as-row as-row--between">' +
          '<div class="as-segmented" role="group" aria-label="Preview a connection state">' +
            ['online', 'degraded', 'offline', 'unknown'].map(function (s) {
              return '<label class="as-segmented__opt"><input type="radio" name="ad-brstate" value="' + s + '"' +
                (st === s ? ' checked' : '') + ' data-ad-brstate><span>' + s.charAt(0).toUpperCase() + s.slice(1) + '</span></label>';
            }).join('') +
          '</div>' +
          '<span class="u-text-xs as-muted">Preview each state — every one of them is designed, including the one that admits it does not know.</span>' +
        '</div>' +

        (ent.ok ? '' :
          '<div class="as-note as-note--accent">' + icon('lock') +
          '<span><strong>Connecting hardware is included from ' + esc(ent.tierName) + ' upward.</strong> ' +
          'The pairing flow below is real and the requirements are real — read them before you decide. ' +
          '<a href="billing.html#plans">See ' + esc(ent.tierName) + '</a>.</span></div>') +
      '</div>');

    /* ---- Pairing ------------------------------------------------------ */
    var pairBody;
    if (st !== 'unpaired' && !pairing) {
      pairBody =
        '<div class="as-row as-row--between as-row--top">' +
          '<p class="u-text-sm u-grow" style="max-width:54ch">A machine is already paired. Generating a new code ' +
          'does not disconnect it — it lets you connect a second one, or replace this one if it has been rebuilt. ' +
          'To disconnect, revoke the token below.</p>' +
          '<button class="as-btn as-btn--secondary u-none" type="button" data-ad-pair>Generate a pairing code</button>' +
        '</div>';
    } else if (!pairing) {
      pairBody =
        '<div class="as-empty">' +
          '<span class="as-empty__icon">' + icon('link') + '</span>' +
          '<span class="as-empty__title">No machine connected</span>' +
          '<span class="as-empty__body">Media and game servers need hardware you own — your files are never ours ' +
          'to hold, and the transcoder has to sit next to them. Everything else already works without this.</span>' +
          '<button class="as-btn as-btn--primary" type="button" data-ad-pair>Generate a pairing code</button>' +
        '</div>';
    } else {
      pairBody =
        '<div class="ad-bigcode' + (pairing.spent ? ' is-spent' : '') + '">' +
          '<span class="ad-bigcode__val" id="pair-code">' + esc(pairing.code) + '</span>' +
          (pairing.spent ? badge('Used', 'as-badge--plain') :
            '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-as-copy="' + esc(pairing.code) + '">' +
            icon('link') + ' Copy</button>') +
        '</div>' +
        '<div class="as-row as-row--between u-mt-4">' +
          '<span class="u-text-sm">' + (pairing.spent
            ? '<strong>Used.</strong> Single-use means single-use — generate another if you need one.'
            : 'Expires in <strong id="pair-left" class="u-mono">10:00</strong>') + '</span>' +
          '<button class="as-btn as-btn--ghost as-btn--sm" type="button" data-ad-pair>' +
            (pairing.spent ? 'Generate another' : 'Regenerate') + '</button>' +
        '</div>' +
        (pairing.spent ? '' :
          '<p class="u-text-xs as-muted u-mt-2">Regenerating <strong>revokes</strong> this one immediately. ' +
          'A code is good for one connection and then it is dead, so a screenshot in a Discord channel cannot ' +
          'be reused by whoever finds it later.</p>') +
        '<ol class="as-steps u-mt-8">' +
          [['Install the connector', 'Download TheBoysBridge for your machine. It manages Docker for you rather than asking you to learn it. <span class="ad-mock">Installer is Phase 10 — not built</span>'],
           ['Paste this code', 'The setup wizard asks for it once. It also detects Docker, your Plex server and your GPU while you watch.'],
           ['The agent dials out', 'It opens the connection to us and holds it. <strong>No port forwarding, no inbound firewall rule, nothing on your network reachable from ours.</strong>'],
           ['It declares what it can do', 'Media, game servers, GPU, encoder. The platform may never ask for more than the agent declared — capability is granted by your machine, not assumed by us.'],
           ['Modules light up', 'Configured from what the agent <em>actually reported</em>, not from what you told us you had.']
          ].map(function (s) {
            return '<li class="as-step"><div><div class="as-step__title">' + esc(s[0]) + '</div>' +
              '<div class="as-step__body">' + s[1] + '</div></div></li>';
          }).join('') +
        '</ol>';
    }
    fill('br-pair', '<div class="as-card">' + pairBody + '</div>');
    startPairTimer();

    /* ---- Capabilities -------------------------------------------------- */
    fill('br-caps',
      (br.capabilities.length
        ? '<div class="as-card"><div class="ad-kv">' +
          br.capabilities.map(function (c) {
            return '<div class="ad-kv__row">' +
              '<span class="ad-kv__k" style="display:flex;flex-direction:column;gap:.15rem">' +
                '<span class="as-strong">' + esc(c.name) + '</span>' +
                '<span class="u-text-xs">' + esc(c.detail) + '</span></span>' +
              '<span class="ad-kv__v">' + (c.on
                ? '<span class="ad-verdict ad-verdict--ok">' + icon('check') + 'Declared</span>'
                : '<span class="ad-verdict" style="color:var(--as-text-3)">' + icon('minus') + 'Not declared</span>') +
              '</span></div>';
          }).join('') + '</div>' +
          '<div class="as-note as-note--frost u-mt-4">' + icon('shield') +
            '<span><strong>The agent declares; the platform may not exceed it.</strong> If your machine does not ' +
            'say it can run game servers, no command from us can start one — not by mistake, and not if our ' +
            'side is compromised. Capability is granted upward, never assumed downward.</span></div>' +
          '</div>'
        : '<div class="as-empty"><span class="as-empty__icon">' + icon('cpu') + '</span>' +
          '<span class="as-empty__title">Nothing declared yet</span>' +
          '<span class="as-empty__body">Capabilities appear the moment an agent connects and tells us what it has. ' +
          'Until then this list is empty rather than guessed.</span></div>'));

    /* ---- Encoder ------------------------------------------------------- */
    fill('br-encoder',
      (br.encoder
        ? '<div class="as-card as-card--frost u-mb-6"><div class="as-row as-row--between as-row--top">' +
          '<div class="as-row as-row--nowrap">' +
            '<span class="as-plate as-plate--frost as-plate--lg">' + icon('cpu') + '</span>' +
            '<div><div class="as-strong">' + esc(br.encoder.name) + '</div>' +
            '<div class="u-text-xs as-muted">' + esc(br.encoder.device) + ' · detected at install</div></div>' +
          '</div>' +
          '<span class="ad-verdict ad-verdict--ok u-none">' + icon('check') + 'Hardware encoding</span>' +
        '</div></div>'
        : '<div class="as-note as-note--warn u-mb-6">' + icon('alert') +
          '<span><strong>No encoder detected yet.</strong> The installer states which encoder it found ' +
          '<em>before</em> your first watch party — not during it. That is the whole reason it asks.</span></div>') +

      '<div class="as-table-wrap"><table class="as-table">' +
        '<caption class="as-visually-hidden">Which hardware encoders work where</caption>' +
        '<thead><tr><th scope="col">Host</th><th scope="col">Encoder</th><th scope="col">Works?</th>' +
        '<th scope="col">What it means</th></tr></thead><tbody>' +
        ENCODERS.map(function (e) {
          var v = e.verdict === 'ok' ? ['ok', 'check', 'Yes'] : e.verdict === 'no' ? ['no', 'x', 'No'] : ['warn', 'alert', 'Slowly'];
          return '<tr><th scope="row" class="u-nowrap" style="color:var(--as-text-1)">' + esc(e.host) + '</th>' +
            '<td>' + esc(e.encoder) + '</td>' +
            '<td><span class="ad-verdict ad-verdict--' + v[0] + '">' + icon(v[1]) + esc(v[2]) + '</span></td>' +
            '<td class="u-text-xs">' + esc(e.note) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +

      '<div class="as-note as-note--danger u-mt-4">' + icon('alert') +
        '<span><strong>The one that catches people: QuickSync does not work inside Docker on Windows or WSL2.</strong> ' +
        'It is not a configuration you can fix — it is measured, repeatedly, and it is why a Windows host needs an ' +
        'NVIDIA card for comfortable transcoding. We would rather tell you now than have you discover it with ' +
        'twelve people waiting for a film to start.</span></div>');

    /* ---- Relay + specs -------------------------------------------------- */
    fill('br-relay',
      '<div class="ad-duo ad-duo--even">' +
        '<div class="as-card as-stack">' +
          '<h3 style="font-size:var(--as-text-md)">Why the relay exists</h3>' +
          '<p class="u-text-sm">Twenty viewers at about 5 Mbps each is <strong>100 Mbps of upload</strong>, which ' +
          'almost no home connection has. With the relay your machine pushes <strong>one</strong> stream up at ' +
          '5–8 Mbps and we fan it out.</p>' +
          '<div class="ad-kv u-mt-2">' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Direct to 20 viewers</span><span class="ad-kv__v" style="color:var(--as-danger)">100 Mbps up</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Through the relay</span><span class="ad-kv__v" style="color:var(--as-success)">8 Mbps up</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Your measured upload</span><span class="ad-kv__v">' +
              (br.upMbps ? br.upMbps + ' Mbps' : 'not measured') + '</span></div>' +
          '</div>' +
          '<p class="u-text-xs as-muted">That is also why the relay is the part we charge for: it is the only ' +
          'piece of a self-hosted setup that a residential line genuinely cannot do.</p>' +
        '</div>' +
        '<div>' +
          '<div class="as-table-wrap"><table class="as-table as-table--compact">' +
            '<caption class="as-visually-hidden">Minimum hardware by use case</caption>' +
            '<thead><tr><th scope="col">Use</th><th scope="col">CPU</th><th scope="col">RAM</th>' +
            '<th scope="col">Upload</th><th scope="col">Note</th></tr></thead><tbody>' +
            SPECS.map(function (s) {
              return '<tr><th scope="row" class="u-nowrap" style="color:var(--as-text-1)">' + esc(s[0]) + '</th>' +
                '<td class="u-nowrap">' + esc(s[1]) + '</td><td class="u-nowrap">' + esc(s[2]) + '</td>' +
                '<td class="u-nowrap">' + esc(s[3]) + '</td><td class="u-text-xs">' + esc(s[4]) + '</td></tr>';
            }).join('') + '</tbody></table></div>' +
        '</div>' +
      '</div>');

    /* ---- Version skew + danger zone ------------------------------------ */
    fill('br-danger',
      '<div class="ad-duo ad-duo--even">' +
        '<div class="as-card as-stack">' +
          '<h3 style="font-size:var(--as-text-md)">Versions</h3>' +
          '<div class="ad-kv">' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Your agent</span><span class="ad-kv__v u-mono">' + esc(br.agentVersion || 'none') + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Platform</span><span class="ad-kv__v u-mono">' + esc(br.platformVersion) + '</span></div>' +
            '<div class="ad-kv__row"><span class="ad-kv__k">Compatible</span><span class="ad-kv__v">' +
              (br.agentVersion ? '<span class="ad-verdict ad-verdict--ok">' + icon('check') + 'Yes</span>'
                : '<span class="ad-verdict" style="color:var(--as-text-3)">' + icon('minus') + 'n/a</span>') + '</span></div>' +
          '</div>' +
          '<p class="u-text-xs as-muted">We ship weekly; you update when you remember. So the platform ' +
          '<strong>refuses</strong> to send an agent a command it is too old to understand, rather than sending ' +
          'it and hoping. A refusal you can read beats a failure you cannot.</p>' +
        '</div>' +
        '<div class="as-card as-stack" style="border-color:var(--as-danger-soft)">' +
          '<h3 style="font-size:var(--as-text-md)">Disconnecting</h3>' +
          '<p class="u-text-sm">Revoking the token drops the connection immediately and permanently. Your files, ' +
          'your Plex server and your game servers are untouched — this only ends our ability to ask them for ' +
          'anything. Screenings stop; watch history, attendance and resume points are kept.</p>' +
          '<div class="as-row u-mt-2">' +
            '<button class="as-btn as-btn--secondary as-btn--sm" type="button" data-ad-rotate>Rotate token</button>' +
            '<button class="as-btn as-btn--danger as-btn--sm" type="button" data-ad-revoke' +
              (st === 'unpaired' ? ' disabled' : '') + '>Revoke and disconnect</button>' +
          '</div>' +
        '</div>' +
      '</div>');

    if (!wiredBridge) { wireBridge(); wiredBridge = true; }
    A.mount(document.body);
  }

  function startPairTimer() {
    if (pairTimer) { window.clearInterval(pairTimer); pairTimer = null; }
    if (!pairing || pairing.spent) return;
    var tick = function () {
      var left = Math.max(0, Math.round((pairing.expiresAt - Date.now()) / 1000));
      var node = document.getElementById('pair-left');
      if (node) node.textContent = A.clock(left);
      if (left <= 0) {
        window.clearInterval(pairTimer); pairTimer = null;
        pairing.spent = true;
        renderBridge();
        A.toast('The pairing code expired. Generate another.', { variant: 'warn' });
      }
    };
    tick();
    pairTimer = window.setInterval(tick, 1000);
  }

  function wireBridge() {
    A.on('click', '[data-ad-pair]', function () {
      var had = !!pairing;
      pairing = { code: newPairingCode(), expiresAt: Date.now() + 10 * 60 * 1000, spent: false };
      renderBridge();
      A.toast(had ? 'New code — the previous one is revoked' : 'Pairing code generated. It is good for ten minutes.',
        { variant: had ? 'warn' : 'success' });
    });
    A.on('change', '[data-ad-brstate]', function (ev, input) {
      bridgeStateOverride = input.value;
      renderBridge();
    });
    A.on('click', '[data-ad-rotate]', function () {
      A.toast('Token rotated — the agent reconnects with the new one automatically', { variant: 'success' });
    });
    A.on('click', '[data-ad-revoke]', function () {
      ensureConfirmDialog();
      document.getElementById('ad-confirm-t').textContent = 'Revoke and disconnect';
      document.getElementById('ad-confirm-body').innerHTML =
        '<p class="u-text-sm">This drops the connection to <strong>' +
        esc(BRIDGE[currentGuild().name].host || 'your machine') + '</strong> immediately.</p>' +
        '<div class="as-note as-note--warn u-mt-4">' + icon('alert') +
        '<span>Screenings and game servers stop being controllable. <strong>Nothing on your machine is changed ' +
        'or deleted</strong>, and watch history, attendance and resume points are kept.</span></div>';
      var go = document.getElementById('ad-confirm-go');
      go.textContent = 'Revoke';
      pendingRun = null;
      go.setAttribute('data-ad-revoke-go', '1');
      A.modal('#ad-confirm');
    });
    A.on('click', '#ad-confirm-go[data-ad-revoke-go]', function (ev, btn) {
      btn.removeAttribute('data-ad-revoke-go');
      bridgeStateOverride = 'unpaired';
      pairing = null;
      A.closeModal(document.getElementById('ad-confirm'));
      renderBridge();
      A.toast('Disconnected. Nothing on your machine was touched.', { variant: 'warn' });
    });
  }

  function boot() {
    setGuild(readStore(STORE_GUILD, GUILDS[0].name));
    state.actor = readStore(STORE_ACTOR, 'owner');
    state.onAudit = function () {
      if (currentView === 'activity') renderActivity();
    };

    renderServerSelect();
    renderGlobalSearch();
    renderAccount();
    wireServerSelect();
    wireGlobalSearch();
    wireAccount();
    wireControls();
    wireControlsView();
    wireModules();
    wireBranding();
    wirePermissions();

    /* Mount the static chrome BEFORE the views render — a view mounts its own
       subtree, and mounting the document afterwards would wire its tabs twice. */
    A.mount(document);

    var page = document.body.getAttribute('data-ad-page');
    if (page === 'dashboard') {
      window.addEventListener('hashchange', route);
      route();
    } else {
      /* ⚠ currentView drives the sidebar's active item, and rerenderAll() reads
         it after a guild switch. Without this it stays 'overview' and the
         highlight jumps to the wrong row the first time you change server. */
      currentView = page;
      renderSidebar(page);
      if (page === 'billing') renderBilling();
      if (page === 'bridge') renderBridge();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    /* Public surface. Everything prefixed `_` is internal but exposed so the
       billing and bridge renderers below can share one world. */
    _REGISTRY: REGISTRY, _TYPES: TYPES, _PRICING: PRICING, _TIERS: TIERS,
    _MODULES: MODULES, _PERM_SETS: PERM_SETS, _PERM_META: PERM_META,
    _GROUP_MODULE: GROUP_MODULE, _ACTION_BY_ID: ACTION_BY_ID,
    _ACTIONS_BY_GROUP: ACTIONS_BY_GROUP, _MODULE_BY_ID: MODULE_BY_ID,
    _ACTIONS_BY_MODULE: ACTIONS_BY_MODULE, _MODULE_GROUPS: MODULE_GROUPS,
    _MODULE_DRIFT: MODULE_DRIFT,
    _STATUS_META: STATUS_META, _TIER_RANK: TIER_RANK,
    _GUILDS: GUILDS, _USAGE: USAGE, _HEALTH: HEALTH, _BRIDGE: BRIDGE,
    _INVOICES: INVOICES, _state: state,
    _tierById: tierById, _meteredById: meteredById, _allowanceFor: allowanceFor,
    _validate: validate, _run: run, _setGuild: setGuild, _setActor: setActor,
    _currentGuild: currentGuild, _currentPlan: currentPlan,
    _moduleEntitled: moduleEntitled, _moduleEnabled: moduleEnabled,
    _setModuleEnabled: setModuleEnabled, _actorCtx: actorCtx,
    _readStore: readStore, _writeStore: writeStore,
    _humanDuration: humanDuration, _describeValue: describeValue,
    _SIMULATED: SIMULATED, _esc: esc,
    _STORE_GUILD: STORE_GUILD, _STORE_ACTOR: STORE_ACTOR, _guildByName: guildByName
  };
})();
