# `packages/web` — the Asbern design system and prospect-facing site

Hand-authored HTML, CSS and vanilla JavaScript. **No build step, no bundler, no
dependencies, no network requests.** Every page opens straight from the
filesystem and works.

---

## Run it

```bash
# simplest — just open the file
start packages/web/index.html          # Windows
open  packages/web/index.html          # macOS
```

Everything works from `file://`: navigation, the theme toggle, the module
filters, the mocked player, the pricing picker, modals and toasts. There is
nothing to install and nothing to compile.

If you want a real origin (some browsers restrict `localStorage` and `<iframe>`
on `file://`, and Chrome's automation tooling refuses `file://` outright):

```bash
node -e "const h=require('http'),f=require('fs'),p=require('path'),R='packages/web',T={'.html':'text/html','.css':'text/css','.js':'text/javascript'};h.createServer((q,s)=>{let u=q.url==='/'?'/index.html':q.url.split('?')[0];f.readFile(p.join(R,u),(e,b)=>e?(s.writeHead(404),s.end()):(s.writeHead(200,{'Content-Type':(T[p.extname(u)]||'text/plain')+'; charset=utf-8'}),s.end(b)))}).listen(8791,()=>console.log('http://127.0.0.1:8791'))"
```

> ⚠ **Do not add a `package.json` here.** `npm install` / `npm ci` cannot
> complete on the Windows dev host (see the root `CLAUDE.md` landmine), and this
> package deliberately has nothing to install. It is not an npm workspace.

---

## Files

```
packages/web/
├── README.md              this file
├── assets/
│   ├── asbern.css         THE DESIGN SYSTEM — tokens, primitives, components
│   ├── asbern.js          shared behaviour: theme, icons, tabs, modal, toast, helpers
│   └── mock-data.js       ALL data. Every number on every page comes from here.
├── index.html             landing page
├── install.html            invite flow — permission sets, the OAuth handoff, first run
├── privacy.html            privacy policy (DRAFT, not in force)
├── terms.html              terms of service (DRAFT, not in force)
├── pricing.html           plans, module picker, metered usage, comparison, FAQ
├── features.html          every module in depth + an honest list of what is missing
└── screening.html         the differentiator, with a mocked player
```

Load order on every page is always:

```html
<script src="assets/mock-data.js"></script>   <!-- data first  -->
<script src="assets/asbern.js"></script>      <!-- behaviour   -->
<script> …page-specific rendering… </script>  <!-- glue        -->
```

They are classic scripts assigning globals (`window.AsbernMock`,
`window.Asbern`). **Not** ES modules — `file://` blocks those.

---

## Visual direction — "cold stone, forge-light"

Asbern is Old Norse *Ásbjǫrn*, "god-bear". The brief was *considered, premium,
slightly austere, warmth in the accents* — and explicitly **not** the default
purple-gradient SaaS look and **not** Discord's own client. What that turned
into, and why:

| Decision | Reasoning |
|---|---|
| **Surfaces are weathered basalt**, near-black with a blue undertone (`#0b0e12`), never neutral grey | Neutral grey reads as "unstyled admin panel". A cold blue-black reads as deliberate, and it puts maximum distance between us and Discord's `#313338` warm-grey chrome, which the audience stares at all day. |
| **One warm colour, and only one** — burnished brass `#d2a75c` | Because it is the only warm thing on the page, brass *always* means "act here". No second call-to-action colour competes with it. The forge/metal association does the Norse work without a single rune texture or fake-parchment background. |
| **A second, cold accent** — glacial steel blue `#79aec8`, used *only* for live/streaming/informational state | A live indicator must never look like a button. Splitting "act" (warm) from "state" (cold) is what stops the screening-room UI reading as a wall of CTAs. |
| **Light theme is warm vellum** `#f3f1ec`, not blue-white | Inverting a cold-blue dark theme into a cold-blue light theme produces something clinical. Warm paper against cold-grey text keeps the same *character* in both themes rather than only being designed once. |
| **Display type is a serif**, UI type is the system sans | The single strongest identity move available with zero network requests. `ui-serif / Iowan Old Style / Palatino / Georgia` is present on every mainstream OS, and a serif headline over a sans interface is what makes the page look art-directed instead of templated. The serif is confined to the wordmark, hero headlines and stat values — everywhere else it would stop being a signal. |
| **The mark is a bind-rune, not a bear** | One vertical stave, Ansuz (`ᚨ`, the *Ás*) arms on the left, Bjarkan (`ᛒ`, *bjǫrn*) bows on the right. It literally spells the name, it is four `<path>` commands, and it scales from a 16px favicon to a hero mark without an image file. A drawn bear at 16px is a smudge. |
| **Almost no gradients, no glows, no glass** | There is exactly one gradient in the system (a barely-visible brass light-fall at the top of the canvas) and one blur (the sticky nav). Restraint is the "premium" lever; more effects would have moved it toward the look the brief ruled out. |

---

## The design system

### Naming convention

```
Tokens      --as-<category>-<role>[-<variant>]     --as-surface-2, --as-text-1
Blocks      .as-<block>                            .as-card
Elements    .as-<block>__<element>                 .as-card__header
Modifiers   .as-<block>--<modifier>                .as-btn--primary
State       .is-<state> / aria-* / [data-state]    .is-active, aria-selected="true"
Utilities   .u-<property>-<value>                  .u-mt-6, .u-text-center
JS hooks    data-as-<behaviour>                    data-as-modal-open="#id"
```

**The one rule that matters:** never style a `data-as-*` attribute, and never
hook JavaScript onto an `.as-*` class. The two vocabularies stay separate so a
redesign cannot break behaviour and a behaviour change cannot break the look.
(The only deliberate exception is `[data-as-tip]`, which *is* the tooltip — it
has no behaviour, only CSS.)

### Token reference

| Group | Tokens |
|---|---|
| **Canvas & surfaces** | `--as-bg` `--as-bg-elev` `--as-surface-1` `--as-surface-2` `--as-surface-3` `--as-sunken` |
| **Borders** | `--as-border` `--as-border-strong` `--as-border-soft` |
| **Text** | `--as-text-1` (headings) `--as-text-2` (body) `--as-text-3` (captions/disabled) `--as-text-inverse` |
| **Accent — brass** | `--as-accent` `--as-accent-hi` `--as-accent-lo` `--as-accent-ink` `--as-accent-soft` `--as-accent-line` |
| **Frost — live/info** | `--as-frost` `--as-frost-soft` `--as-frost-line` |
| **Status** | `--as-success` `--as-warn` `--as-danger` (+ `-soft` variants) |
| **Chrome** | `--as-focus` `--as-hairline` `--as-scrim` |
| **Shadows** | `--as-shadow-sm` `-md` `-lg` `-xl` `--as-shadow-glow` |
| **Type** | `--as-font-sans` `--as-font-display` `--as-font-mono` · `--as-text-2xs → -4xl` · `--as-leading-*` `--as-tracking-*` |
| **Space** | `--as-space-1..24` (4 px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96) |
| **Shape** | `--as-radius-xs sm md lg xl full` |
| **Motion** | `--as-ease` `--as-ease-out` `--as-dur-fast` `-base` `-slow` |
| **Layers** | `--as-z-base sticky nav drawer modal toast tooltip` |
| **Layout** | `--as-container` `--as-container-narrow` `--as-nav-h` `--as-gutter` `--as-tabbar-h` (0 by default; a consumer with a fixed bottom bar sets it so `.as-toasts` lifts clear) |

**The surface ladder means ELEVATION, not lightness.** `--as-surface-1` is a
card at rest, `-2` is raised (hover, dropdown, popover), `-3` is an overlay
(modal, tooltip), and `--as-sunken` is inset (table heads, wells, input
interiors). Elevation always increases contrast against the canvas — in dark
that means lighter, in light it also means lighter. The numbers therefore mean
the same thing in both themes, which is the whole point.

### Theming

Dark is the default (`:root`). Light arrives **two** ways, and both must exist:

* `@media (prefers-color-scheme: light)` — a visitor with no stored choice, and
  critically a visitor **with JavaScript disabled**;
* `:root[data-theme="light"]` — the explicit toggle, persisted to
  `localStorage` under `asbern.theme` (`'dark' | 'light' | 'system'`).

> ⚠ **The light palette is written twice**, because CSS cannot share a
> declaration block across a media-query boundary. Search `LIGHT PALETTE` in
> `asbern.css` — there are exactly two copies, they are adjacent, and they must
> stay identical. If you change one, change the other.

Each page carries a ~5-line inline `<script>` in `<head>` that stamps
`data-theme` **before first paint**, so there is no flash of the wrong theme.
`asbern.js` then takes over, keeps the toggle icon in sync, and listens for the
OS preference changing while the visitor is on `'system'`.

### Components

Buttons (`--primary --secondary --ghost --danger`, `--sm --lg --block --icon`) ·
cards · panels · badges/pills (incl. `--live` with a breathing dot) · chips ·
tables (always inside `.as-table-wrap`) · forms (input, select, textarea,
checkbox, radio, toggle switch, segmented control, range) · tabs · nav +
mobile drawer · sidebar · shell · stat tiles · progress bars · avatars +
avatar stacks · empty states · skeletons · modal · toast · tooltip · accordion ·
code block · kbd · notes/callouts · checked lists · media player · pricing tier
card · pick card · step list · hero · footer.

Two components are worth knowing about before you build the dashboard:

* **`.as-shell`** — `.as-shell__side` + `.as-shell__main`, collapsing to one
  column under 60 rem. This is the frame the client dashboard and member app
  should use. `.as-sidebar` / `.as-sidebar__item` go inside it.
* **`.as-modal`** is a native `<dialog>`. Focus trapping, `Esc` and the backdrop
  come free from the platform; `Asbern.modal('#id')` is a two-line wrapper.
  Centred at desktop width; below 52rem it becomes a bottom sheet (full width,
  anchored to the bottom edge, rounded top corners, a drag-handle affordance) —
  same markup, no per-page work required.

### JavaScript API

```js
Asbern.icon(name)          // inline SVG string from a 40-icon registry
Asbern.theme.get/set/toggle/resolved()
Asbern.toast(msg, {variant})           // 'accent' | 'success' | 'warn' | 'danger'
Asbern.modal('#id') / Asbern.closeModal(dlg)
Asbern.mount(scope)        // wire every data-as-* behaviour in a subtree
Asbern.num/money/money2/pct/clock()
Asbern.$/$$/on/el/escapeHtml()
Asbern.reducedMotion       // boolean
```

Auto-wired attributes: `data-as-icon` · `data-as-theme-toggle` ·
`data-as-drawer` / `data-as-drawer-panel` · `data-as-tabs` (with
`role="tab"`/`role="tabpanel"`) · `data-as-modal-open` / `data-as-modal-close` ·
`data-as-reveal` · `data-as-count` · `data-as-year` · `data-as-copy` ·
`data-as-tip`.

The icon registry carries 55 names (41 original + 14 promoted from the member
app — see the cross-consumer audit below).

---

## Cross-consumer promotion audit — app.css and dashboard.css vs. the system

`app.css` (member app) and `dashboard.css` (client dashboard) were both built
against `asbern.css` and both hit real gaps, which each file patched locally.
This audit went through every reported gap, verified it in a real browser
(a static server on `127.0.0.1:8777`, all 14 pages, 360/390/768/1440px, both
themes, via same-origin `<iframe>`s so real `@media` breakpoints and computed
styles could be inspected without touching this dev machine's actual browser
window — see "How mobile width was verified" below), and either promoted the
fix into `asbern.css` or left it local with a stated reason. Every promotion
also removed the now-redundant local copy, so there is exactly one definition
of each.

| # | Gap | Verdict | Where |
|---|---|---|---|
| 1 | `.as-chip` icons render unsized (24px glyph at 40px) | **Promoted** | `asbern.css` §5.4 |
| 2 | No token for a bottom tab-bar's height; toasts could land on top of one | **Promoted** | `asbern.css` §1 + `.as-toasts` |
| 3 | `.as-modal` is centred at every width | **Promoted** | `asbern.css` §5.14 |
| 4 | 14 icons live only in `app.js`'s local table | **Promoted** | `asbern.js` registry |
| 5 | `.as-shell__side` can blow out the page sideways | **Promoted** | `asbern.css` §4 |
| 6 | `.as-progress` has no threshold-tick variant | **Left local** | `dashboard.css` §5 |
| 7 | No popover/menu primitive; no 4-state status lamp | **Left local** | `dashboard.css` §2, §12 |
| — | `.as-split`'s mobile track can blow out the page the same way as #5 | **Promoted** (found during verification, not in the original report) | `asbern.css` §4 |

### 1 · Unsized `.as-chip` icons — promoted

Real, and reproducible without any special data state: `app.html` and
`leaderboards.html` both render `Asbern.icon('lock')` inside a `.as-chip` when
a period is gated behind a plan (`data-window`/`data-win` period bar). Every
other component that can hold an icon sizes it per component (`.as-btn svg`,
`.as-badge svg`, `.as-plate svg`, `.as-note svg`, `.as-list__item svg`,
`.as-empty__icon svg`) — `.as-chip` was the one gap in the system itself, so
this is systemic, not local. Fixed with `.as-chip svg { width: 1em; height:
1em; flex: none; }` in `asbern.css` §5.4, matching the existing one-rule-per-
component convention rather than a blanket `svg { width: 1em }` (which would
have collapsed every other component's deliberately-chosen icon size to the
same 1em). Verified in-browser: injecting `Asbern.icon('lock')` into a live
`.as-chip` now measures the icon at 12px×12px (1em of the chip's 12px font),
not 40px. `app.css` no longer lists `.as-chip > svg` in its own icon-sizing
block; the rest of that list (`.app-quest__reward svg`, `.app-kv svg`, etc.)
stays, because those are this file's own components and the system still has
no idea they exist.

### 2 · No tabbar-height token — promoted

Real: `.as-toasts` sat at `bottom: 1rem` with a higher z-index than `.as-nav`,
and `app.css` was overriding `.as-toasts`'s `bottom` outright under 52rem to
compensate for `.app-tabbar`. Promoted as a token, `--as-tabbar-h` (default
`0px`, so every existing consumer without a bottom bar is unaffected), read by
`.as-toasts` as `bottom: calc(var(--as-space-4) + var(--as-tabbar-h))`.
`app.css` now just sets the token's value at the width where its tab bar
exists, instead of re-declaring the system rule. Verified in-browser at
400×844: `.app-tabbar` renders at `top: 779` / `height: 61px` (`display:
grid`, matching `--as-tabbar-h`'s computed `calc(3.75rem + 1px + 0px)` = 61px);
a live toast's box measured `bottom: 763`, 16px clear of the bar — no overlap.

### 3 · `.as-modal` is always centred — promoted

Real, and the system's own native-`<dialog>` centring (UA-stylesheet `inset:
0; margin: auto`) is the wrong shape under the width where the nav folds into
the mobile drawer (52rem). Added a bottom-sheet form in `asbern.css` §5.14,
gated to `max-width: 51.99rem` (the same breakpoint `.as-nav`/`.app-tabbar`
already fold at): full width, anchored to the bottom edge, rounded top
corners only, a drag-handle affordance, safe-area padding. Verified in-browser
on three different dialogs across three pages:
* `screening.html` (`#link-modal`, declarative `data-as-modal-open`) — at
  400×844 the dialog measured `position: fixed`, `inset: 354.8,0,0,0`,
  `border-radius: 20px 20px 0 0`; at 1200×800 the SAME dialog measured
  `position: absolute`, `inset: 0,0,0,0`, `width: 544px`, `border-radius: 14px`
  all corners, centred with equal top/bottom margin — confirming the desktop
  centred form is untouched.
* `casino.html` (`#rules-modal`, opened via `Asbern.modal('#id')` from JS) —
  same bottom-sheet shape at 400×844.
* `app.html` (`#ach-modal`) — same shape, and a screenshot confirms the drag
  handle and rounded-top card sitting flush against the bottom edge with the
  scrim above it.

### 4 · 14 icons promoted from `app.js`

`app.js`'s local `EXTRA_ICONS` table (dice, cards, flag, fire, medal, message,
mic, heart, wallet, gift, expand, settings, calendar, trend) was checked
against every one of the registry's existing 41 names — no collisions — and
added verbatim (same paths, same stroke-based 24×24 style) to `asbern.js`.
Verified each of the 14 resolves via `Asbern.icon(name)` in a live page.
**`app.js` itself was not touched** (out of scope) — its `icon()` wrapper
checks its own `EXTRA_ICONS` table first, so it keeps rendering off its local
copy unchanged. Whoever owns `app.js` can now delete `EXTRA_ICONS` (lines
~1262–1277) and the local `icon()` wrapper's special case, and every call site
will resolve the exact same icon from `Asbern.icon()` instead.

### 5 · `.as-shell__side` grid blowout — promoted

Real: a grid item's default `min-width` is `auto` (its content's min-content
size), not `0`. `.as-shell__main` already had the guard; `.as-shell__side` did
not, and `dashboard.html`/`billing.html`/`bridge.html` all render
`<aside class="as-shell__side ad-side">` — the same element, both classes.
Added `min-width: 0` to `.as-shell__side` in `asbern.css` §4. Removed the
now-redundant `min-width: 0` (and its explanatory comment) from `.ad-side` in
`dashboard.css`, replacing it with a one-line note pointing at the promoted
rule. Verified in-browser on `dashboard.html` at 400×844: the combined
`.as-shell__side.ad-side` element computes `min-width: 0px`, `position:
static` (its own mobile rule still applies), width 386px — full viewport, no
overflow.

### 6 · `.as-progress` threshold ticks — left local

`.ad-meter` is real and well-built, but it does not even compose on top of
`.as-progress` — track, fill, tick marks, the labelled 80/100/150 scale and
the degradation-rung list are all bespoke, because the whole shape is an
overage LADDER, a billing concept, not a generic goal bar. Grepping every page
and script in this package for `ad-meter` and `as-progress` turns up exactly
one consumer of thresholds (`dashboard.js`/`billing.html`); every other use of
`.as-progress` (levelling, quests, casino) is a plain fill with no thresholds.
Per this task's own rule — "a component used by exactly one page with
page-specific semantics should stay local" — this stays in `dashboard.css`
§5. If a second consumer ever needs a threshold bar, promote the tick
primitive then, not speculatively now.

### 7 · Popover/menu primitive and 4-state status lamp — left local

Both are real gaps, and both are architecturally the kind of thing a design
system should eventually own — a popover/menu primitive is widely reusable,
and the "`unknown` is hollow, never red" rule behind `.ad-lamp` is stated in
this task as platform-wide (`permguard` fails open on `null`), not specific to
billing. What blocks promoting either **this pass** is the same thing in both
cases: `dashboard.js` builds and toggles these elements by their exact
`.ad-switch*` / `.ad-lamp*` class names, and `dashboard.html`/`billing.html`/
`bridge.html` are the only places that compose them — both files are outside
this pass's scope (`packages/web/assets/*.css`, `*.js` for the design system
only, per the scope lock). A promotion that renamed the classes in
`asbern.css` without updating the markup and the JS that emits it would
silently stop the dashboard's real switcher/lamp from being styled at all —
worse than leaving them local. Renaming the CSS in place without renaming the
classes would "promote" `.ad-*`-prefixed selectors into the system file, which
breaks the naming convention (`.as-*` = system, `.ad-*` = this consumer) for
no real gain, since the markup wouldn't be any more reusable. Left local,
flagged here as the first thing to promote once `dashboard.html`/`dashboard.js`
are in scope together with the CSS.

### Extra: `.as-split`'s mobile track — found during verification, promoted

Not in the original report. While verifying gap 5, `screening.html` showed a
real horizontal overflow at 400px that persisted after fixing `.as-shell__side`.
Bisection (hiding one subtree at a time and re-measuring
`document.documentElement.scrollWidth`) traced it to the `#bridge` section's
`<pre class="as-code">` ASCII diagram, inside `.as-split`'s single-column
(mobile, under 60rem) track — which was a bare `grid-template-columns: 1fr`,
not `minmax(0, 1fr)`. Same root cause as gap 5: the track's default min-width
is its content's min-content size, and the diagram's long unbroken monospace
lines have a large one. `.as-code` already has its own `overflow-x: auto`, but
it can only scroll inside a track that has stopped growing. The two-column
(desktop) rule already used `minmax(0, …)` on both tracks; only the
single-column collapse had the gap. Fixed in `asbern.css` §4. Verified: before
the fix, `screening.html` at 400×844 measured `scrollWidth: 444` against a
`386` viewport with two real (unclipped, no scrollable ancestor) offending
elements; after, `scrollWidth: 386`, zero offenders.

### How mobile width was verified, and the false negative that hid three bugs

The dev-host browser window this session had access to would not resize below
its monitor's native size (`resize_window` reported success but
`window.innerWidth` stayed at the monitor width regardless). Real `@media`
evaluation needs a real viewport, not a claim, so verification used a
same-origin `<iframe>` (400×844 / 1200×800) whose OWN document has its own
viewport — `@media` queries inside it evaluate against the iframe's size, not
the outer window's, which is standard and correct, not a workaround that
weakens the result.

⚠ **A PREVIOUS PASS OF THIS DOCUMENT GOT THIS WRONG, AND THE ERROR HID THREE
REAL BUGS.** It recorded that comparing `document.documentElement.scrollWidth`
to the viewport width produced *false positives* on `.as-table-wrap > .as-table`
and `.app-scroller`, and that a dispatched `wheel` event proving `scrollX === 0`
settled it. Neither claim survives measurement:

- **`body { overflow-x: hidden }` does not stop these pages scrolling sideways.**
  The scrolling box for a normal document is the ROOT element, not `<body>`, so
  an `overflow-x` on `<body>` has nothing to clip. See the comment on the rule
  in `asbern.css` §3.
- **The `wheel`-event check is a false NEGATIVE.** A synthetic, untrusted wheel
  event does not scroll a document in Chrome, so it returns `scrollX: 0`
  whether or not the page can pan.
- **The `pricing.html` table overflow was real.** Setting
  `documentElement.scrollLeft = 9999` moved the document **157px**. The cause
  was not the table scrolling inside its wrap: `overflow-x: auto` clips paint
  but does not clip an absolutely-positioned descendant, and every `.as-table`
  carries two (a `.as-visually-hidden` `<caption>` and per-cell spans). With no
  positioned ancestor their containing block was the initial containing block.
  Fixed with `position: relative` on `.as-table-wrap`.

**The reliable test is `documentElement.scrollLeft`.** Set it to a large value,
read it back, set it to 0. A non-zero read-back is a page that genuinely pans,
and it has no false positives from correctly-scrolling children. Use the
element walk (right edge past the viewport, no `overflow-x` ancestor) only to
*locate* the offender once that test has said there is one. By the `scrollLeft`
test all **14** pages are clean at 360, 390, 768 and 1440.

### The `.app-kv__v` overflow — found by an earlier pass, fixed now

`app.html`’s "Rank & progress" panel renders a key/value row whose value is a
qualifying sentence rather than a number, and `.app-kv__v` is `white-space:
nowrap` by design. An earlier pass found it, judged it contained by the
`overflow-x: hidden` above, and deferred it. It was not contained — it was two
of the seven pixels `app.html` actually panned at 390px.

Fixed without loosening the value: the value must stay unbroken (a currency
figure split across two lines is unreadable), so the KEY yields instead —
`.app-kv__row` wraps, and `.app-kv__k` gets `flex: 1 1 auto` plus
`overflow-wrap: anywhere`. `min-width: 0` alone is not enough; a flex item’s
automatic minimum size still refuses to go below its longest word without it.

### Accessibility

Semantic landmarks and headings throughout · skip link on every page · one
global `:focus-visible` ring that is never removed · tabs implement the ARIA
tabs pattern with arrow/Home/End keys · `aria-current="page"` in the nav ·
`aria-pressed` on filter chips · `aria-live` on filter results and toasts ·
visually-hidden text so the comparison table's ✓/− columns read as
"Included"/"Not included" to a screen reader · every table has a `<caption>` ·
all decorative SVG is `aria-hidden` · `prefers-reduced-motion` disables reveals,
counters, the pulsing live dot and smooth scrolling.

### Responsive

The page does not scroll horizontally on any of the 14 pages, at 360, 390, 768
or 1440 — verified by `documentElement.scrollLeft`, not assumed. ⚠ That is a
measured result, not a guarantee bought by a rule: `body { overflow-x: hidden }`
does **not** clip the root scroll box (see §3 of `asbern.css`). What actually
keeps it true is
every grid built from `repeat(auto-fit, minmax(min(100%, X), 1fr))`, so there
are almost no width media queries in the whole stylesheet. Wide content
(comparison tables, the ASCII bridge diagram) scrolls inside its own
`overflow-x: auto` container.

Verified by screenshot at **320 px, 390 px and 1180 px+, in both themes**.

---

## What is real, and what is mocked

### Real — measured in this repository, with sources named in `mock-data.js`

136 MB resident memory · 0.02% CPU · 2,376 passing tests · 221 admin controls
(163 free) · 12 casino games · 21 ranks + 11 prestige tiers · ~150 live TV
channels · ~0.85 MB of live data per server · 2–13¢ infrastructure cost per
server per month · the ≈200 GB / 6-hour / 20-viewer watch-party figure · the
entire encoder-support table, including **QuickSync not working inside Docker on
Windows/WSL2**, which is measured and is why an actual migration plan was
cancelled.

Every module's build status is likewise real, and the site is built so it
**cannot** advertise something that is not: `mock-data.js` derives a `sellable`
flag and a `badge` from `status`, once, and all three pages render that. A
`planned` or `dark` module physically cannot appear as purchasable.

### Mocked — and labelled as such in the UI

| What | Where | How it is marked |
|---|---|---|
| **All pricing** | every plan, allowance and rate | A warning callout at the top of `pricing.html`, plus `_provisional: true` on the object |
| **Server / member / uptime counters** | the proof band on `index.html` | Renders **blank (`—`)**, under a "Placeholder counters" badge, with a paragraph saying there are no customers |
| **Customer quotes and logos** | lower on `index.html` | Skeleton loaders under a "Placeholder" badge with copy saying the slots are empty on purpose |
| **The screening-room player** | `screening.html` | A line under it stating nothing is streaming and the data comes from `mock-data.js` |
| **Library titles, channels, viewers** | `screening.html`, `index.html` | Invented; stated in the same line |
| **Every link marked "Soon" / "Draft"** | footers | Docs, status, changelog, support server, privacy policy and terms do not exist. Privacy + ToS are **required for Discord verification** and are currently only drafts in `docs/_platform/DISCORD-VERIFICATION-DRAFT.md` |
| **Checkout** | plan buttons, "Start a trial" | Fires a toast saying checkout is not wired up |
| **Dashboard demo link** | index hero | Disabled, with a tooltip saying the dashboard is a planned phase, not a hidden page |

---

## ⚠ What to swap when the real pricing lands

`docs/_platform/PRICING.md` existed when this was written but is marked
**"Status: proposal, not committed"**, and the owner has since decided the ladder
goes *lower* and that AI is metered roadmap rather than a plan feature. So:

**Nothing in any `.html` file contains a price, a plan name, an allowance, a
module id or a rate.** All of it is `AsbernMock.pricing`. Swapping the model is
an edit to one object in `assets/mock-data.js`.

Specifically, replace:

| Field | Current (provisional) | Note |
|---|---|---|
| `pricing.tiers[].monthly` / `.annual` | Free $0 · Community $5/$49 · Pro $12/$119 · Studio $29/$290 · Sovereign $19/$190 | **These are the numbers being revised downward.** The monthly/annual toggle derives the effective monthly from `annual / 12`, so only these two fields change. |
| `pricing.tiers[].egressGB` / `.egressHuman` | 0 / 0 / 250 / 1,500 / 250 GB | Sized on a `[UNVERIFIED]` $0.01/GB CDN cost with no signed contract |
| `pricing.metered[0].price` | $2.00 per 100 GB block ($0.02/GB) | |
| `pricing.egressMath.gbPerViewerHour` | 1.67 GB | **Inferred** from ARCHITECTURE's 200 GB figure, not read off the encoder config. If the real rendition bitrate is higher, every allowance is too generous by the same ratio. |
| `pricing.tiers[].memberCeiling` | 10,000 / 50,000 | The source calls these "a hedge priced on a guess" — throughput vs member count has never been measured |
| `pricing.founding` | Founding 100, 50% off | Per-tier founding prices are deliberately **not shown**; the Studio one is unsettled in the source |

Deliberately **not** on the site at all, and it should stay that way until
resolved: the AI spend ceiling. The source carries two conflicting values
(`$15` in `budget.js` vs `$25` in config) and says outright to resolve the
conflict before quoting either. No ceiling figure appears anywhere.

### AI is never sellable, and that is enforced in code

`mock-data.js` marks the AI metered entry `onSale: false`. `decorate()` then
forces `sellable = false` on any module whose metered cost is not on sale, which
means AI is excluded from the picker, shows "Not included" in every column of
the comparison table (including Sovereign), and carries a
"Usage-based · not on sale yet" badge on the landing and features pages. To put
AI on sale later you flip **one** boolean; you cannot do it accidentally.

---

## Category conventions this follows

The site deliberately reads as familiar to someone arriving from MEE6, Statbot,
Arcane or Dyno: one dominant **Add to Discord** CTA in the nav, the hero and the
page foot; a module/plugin grid on the landing page; a counter band near the top;
plan cards side by side with a monthly/annual toggle and the most-chosen plan
emphasised; a feature comparison table under the cards; FAQ at the bottom; real
footer IA. Pricing is stated as **per Discord server** in four places, because
that is the axis this category prices on and it is the first thing people check.

Three things the category does badly that this deliberately does not copy:

1. **Hiding what the free tier includes.** The Free card lists its contents *and*
   its exclusions, and the landing page leads with "most of the market's paid
   features are our free tier".
2. **"Premium" badges with no explanation.** Every badge here says which plan,
   and hovering says why.
3. **Mixing shipped and planned features in one list.** Status is a first-class
   field, filterable, with an entire section (`features.html#roadmap`) devoted to
   what is *missing*.

The one place it deliberately does not look like them is the hero: the headline
leads with the screening room, which none of them have, rather than "the best
all-in-one Discord bot".

> If `docs/_platform/WEB-UX-REFERENCE.md` exists by the time you read this, it
> did not exist when this was built. Reconcile against it — the structure is
> data-driven and re-skinnable.

---

## Known limits of the no-build-step constraint

* **No component reuse across pages.** The nav and footer are duplicated in all
  four HTML files because there is no include mechanism and no server. Changing
  the footer means four edits. This was chosen over rendering them from JS,
  because navigation and legal links must survive JavaScript being off.
* **Page-specific glue is an inline `<script>`** at the bottom of each page
  rather than a module. It is scoped in an IIFE and only ever reads
  `AsbernMock` + `Asbern`.
* **Data-driven content needs JavaScript.** Structure, copy, typography, layout
  and both themes work with JS off; the module grid, plan cards, picker and
  tables do not. Each page carries a `<noscript>` note saying so.
* **No image assets.** Everything is inline SVG or CSS. Where a real product
  screenshot would be better than a mock — the player, the dashboard — there is
  a mock, clearly labelled, because no screenshots exist yet.
* **`ES5-flavoured JS`** (`var`, `function`, no optional chaining in the shared
  files) so the pages degrade gracefully in anything older than the last few
  years without a transpiler in the loop.
