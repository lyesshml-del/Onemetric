# Move #3 — Design Specification ("One signature")

> Design source of truth for Move #3, alongside `DESIGN-AUDIT.md`, `DESIGN-SYSTEM.md`, `PRD.md`,
> `AGENT-RULES.md`. **This is a design spec only — no code, no implementation.** It defines *what*
> Move #3 is and *why*. Implementation is a separate, later, approved step
> (`MOVE-3-IMPLEMENTATION-PLAN.md`).
>
> Move #1 ("have an opinion") gave the Overview hierarchy + narrative. Move #2 ("instant + alive")
> gave it the motion system. **Move #3 gives the whole product one signature + the final craft.**
> If this file and the code ever disagree, the code wins — then fix this file.

---

## 1. The opinion (the soul of this Move)

**OneMetric is competent monochrome. Move #3 makes it *unmistakably designed*.**

The audit's one-sentence thesis: OneMetric borrowed Vercel's *palette* (neutral monochrome + Geist)
but not yet Vercel's *identity* — its monochrome reads as the *default*, "neutral by absence, not by
decision." Move #3 fixes that with **one restrained signature accent** and the **craft in the 1%**
(unified specs, a logomark, flags/glyphs) — the last 80% of the "premium" perception.

Three non-negotiable principles:

1. **One signature, used with discipline.** A single accent — a considered indigo/violet leaning into
   the `oklch(… 285)` hue already in the neutrals. It appears in a *handful* of deliberate places and
   nowhere else. Restraint is the whole point: an accent everywhere is no accent at all.
2. **One system, end to end.** One card spec, one number spec, one chart spec — across *every* page,
   not just the Overview. The last `MetricCard`/`rounded-lg` drift is retired (ONE-46).
3. **Quiet identity.** A logomark + favicon + the small craft (flags, glyphs, branded tooltips) so the
   product has a face, calmly. Never loud, never a rebrand — just *finished*.

Voice: still **calm, factual, Stripe/Linear** — the accent *guides the eye*, it does not shout.

---

## 2. The "signature test" (how we'll know it worked)

| # | Question | Today (post Move #1/#2) | After Move #3 |
|---|---|---|---|
| 1 | Does the product have a recognizable color identity? | ❌ neutral-by-absence | ✅ one violet signature, used sparingly |
| 2 | Where does the eye go for "the primary action"? | 🟡 a white button like any other | ✅ the accent marks the one primary action |
| 3 | Is "the current/active thing" obvious? | 🟡 a foreground underline/pill | ✅ the accent marks active state |
| 4 | Does the hero chart feel like *the* data? | 🟡 a white line | ✅ the accent series + gradient |
| 5 | Is it one consistent system on every page? | 🟡 Overview yes; detail pages still drift (`MetricCard`) | ✅ one card/number/chart spec everywhere |
| 6 | Does the product have a face (logo/favicon)? | ❌ text only | ✅ a quiet logomark + favicon |

If a stranger looks at the app and can't name "the OneMetric color" — or can name five — Move #3 failed.

---

## 3. Principles (extends `DESIGN-SYSTEM.md`)

- **Restraint over reach.** The accent is a *seasoning*, not a *coat of paint*. If in doubt, leave it
  neutral. The spec's "used vs NOT" table (§5) is binding.
- **Semantic, not decorative.** The accent always *means* something: "this is the primary action,"
  "this is active," "this is the data." It never appears just to add color.
- **Dark-first, light-correct.** OneMetric is dark-mode first; the accent is tuned for the dark
  surface first, and a light value is defined for the future toggle. Both meet WCAG AA.
- **One system.** A single card radius/padding/border, a single number treatment (tabular-nums,
  scale), a single chart language — on *every* page. No second system survives Move #3.
- **Additive + monochrome-degradable.** The accent is layered onto the existing neutral system; if a
  token were removed the UI would fall back to neutral and still work. No restructure.
- **No new dependency.** CSS tokens + existing components + a hand-built logomark (SVG). The
  dependency-free/server-first stance (`ENGINEERING-STANDARDS.md`) is unchanged.

---

## 4. The accent (the one signature)

### 4.1 The hue
Lean into the **violet already in the neutral tokens** (`globals.css`: background/foreground/ring all
sit at hue **~285–286** in oklch — a faint violet). The accent is that hue brought to life with real
chroma — a considered **indigo-violet**, in the spirit of Linear's indigo, but *ours* (derived from
our own neutrals, not copied).

### 4.2 The tokens (proposed; Phase 0 finalizes + AA-verifies)
New theme tokens in `globals.css` (names illustrative — Phase 0 decides final names; **do not**
repurpose shadcn's neutral `--accent`, which is a muted gray):

| Token | Role | Dark (proposed) | Light (proposed) |
|---|---|---|---|
| `--brand` | the accent fill (button bg, active pill, chart series) | `oklch(0.62 0.19 285)` | `oklch(0.52 0.20 285)` |
| `--brand-foreground` | text/icon **on** `--brand` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `--brand-muted` | low-emphasis accent (gradient stop, hover wash, faint fill) | `--brand` @ low alpha | `--brand` @ low alpha |

- Exposed as Tailwind utilities (e.g. `bg-brand` / `text-brand` / `border-brand` / `ring-brand` /
  `from-brand`). Exact values are a **Phase-0 deliverable**, tuned visually on the real dark surface
  and **AA-verified** (§7).
- The chart series may use `--brand` directly (a line/gradient is not a text-contrast surface, but
  must be clearly distinguishable on `--background`).
- Text uses of the accent (e.g. Lede link hover) must meet **AA 4.5:1** on `--background`; if the fill
  value doesn't, define a slightly lighter `--brand-text` for text-on-bg only.

### 4.3 Where the accent IS used (the only places)
1. **Primary action** — the single most important button on a screen (e.g. signup/upgrade/primary CTA).
   The shadcn `Button` `default` variant becomes the accent; secondary/outline/ghost stay neutral.
2. **Active / selected state** — the active section-tab underline, the active range pill, the active
   segmented-control segment. (One active indicator per control, in the accent.)
3. **The key hero data series** — the Overview hero `TrendChart` line + its gradient fill (`accent →
   transparent`). The *previous-period* comparison line stays muted/ghosted (neutral). Sparklines:
   decide in the plan — likely a **subtle** accent or neutral (lean neutral to keep restraint).
4. **Lede drill-link hover** — the data-noun links in the Lede tint to the accent **on hover/focus**
   (not at rest — at rest they're `foreground`).
5. **Focus ring** — `--ring` may adopt the accent hue so keyboard focus reads as "ours" (optional,
   AA-visible).

### 4.4 Where the accent is explicitly NOT used (binding)
- **Deltas stay semantic** — up = restrained green, down = red, flat = muted. *Never* the accent
  (mixing brand + good/bad would destroy the signal). (`DESIGN-SYSTEM.md` rule, reaffirmed.)
- **Not on body text, headings, the hero *number*, labels, borders, cards, table rows, or icons**
  generally — those stay neutral monochrome.
- **Not on every chart** — only the hero protagonist series. Breakdown bars stay `bg-foreground/5`.
- **Not as a background wash** on cards/sections. Spacing + neutrals separate sections, as today.
- **Not on secondary/tertiary buttons**, not on the "Active now"/live dot (that stays emerald — a
  distinct *live* semantic), not on monogram avatars.
- **No gradients beyond the single hero area fill.** No accent-on-accent, no rainbow.

> Rule of thumb: at most **one accent element per "zone"** (one primary button, one active tab, one
> hero series). If a screen shows the accent in more than ~3 places at once, it's overused.

---

## 5. Craft — "one system, end to end"

### 5.1 Unify the card spec (retire the `MetricCard` drift — ONE-46)
The Overview is already one card system (`Card` / `StatCard`, `rounded-xl`). The **Events-detail,
Funnels-detail, and Revenue** pages still use the legacy `MetricCard` (`rounded-lg`, `p-4`, no
`tabular-nums`). Move #3 unifies them onto the single spec (either restyle `MetricCard` to match
`StatCard`'s `rounded-xl`/tabular spec — simplest, one file — or replace its usages with `StatCard`),
then retire/alias `MetricCard`. After this, **no `rounded-lg` card and no non-tabular metric remains**
anywhere. (Tracked: ONE-46.)

### 5.2 One number spec, everywhere
`tabular-nums` on **every** number on **every** page (the Overview is already done; extend to the
detail pages' metrics, tables, and any stragglers). One metric scale (the `StatCard`/hero ladder).

### 5.3 One chart spec
`TrendChart` (correct scaling, branded tooltip, the accent series) is the language; `BarChart`
(legacy, distorting `preserveAspectRatio="none"`) is the last drift — either fix its scaling to match
or migrate its remaining consumers (marketing + event-detail) to the crafted approach. Decide in the
plan; at minimum, document one chart language.

### 5.4 Identity marks
- **Logomark** — a small, hand-built SVG mark (a monogram/geometric "O"/"1" in the accent + neutrals)
  for the top-left app bar + the marketing header, replacing the plain "OneMetric" wordmark-only
  treatment. Quiet, scalable, dependency-free.
- **Favicon / opengraph** — derive the favicon + a refreshed `opengraph-image` from the logomark so
  the browser tab + social shares carry the identity.
- **Flags / glyphs polish** — the audience flags (`flagEmoji`) degrade to letter-pairs on Windows
  (a known platform limit). Optionally ship a tiny, dependency-free flag/glyph treatment (or accept
  the documented fallback). Monogram avatars (D1) stay — privacy-first, no third-party favicons.

---

## 6. Server-first + dependency stance (hard constraints)

- **No new dependency** for the accent or craft. CSS custom properties + Tailwind theme tokens + the
  existing shadcn components + hand-built SVG (logomark). If any dependency is ever proposed, it is
  **flagged for explicit approval**, not added.
- **Server-first preserved.** Color is CSS; no client JS is required for the accent. The logomark is
  a static SVG component (server-safe). No new client components needed beyond what exists.
- **Additive + `main` shippable** after every phase, as in Moves #1/#2.

---

## 7. Accessibility & contrast (first-class)

- **WCAG AA** for every accent use that carries meaning:
  - `--brand-foreground` on `--brand` (button text/icon) ≥ **4.5:1** (normal) / 3:1 (large).
  - accent **text** on `--background` (Lede link hover) ≥ **4.5:1** — else use a lighter `--brand-text`.
  - the accent **focus ring** must be visibly distinct on both surfaces.
- The accent is **never the only signal**: active state also has the underline/pill shape; the primary
  button is also the largest/filled; the hero series also has position. Color-blind users lose nothing.
- Verify in **dark and light**; verify with a contrast checker (the oklch values are tuned to pass).
- Respect everything Move #2 established (reduced-motion, focus-visible) — Move #3 adds color only.

---

## 8. Success criteria (how we'll know it worked)

1. **One signature is legible** — a viewer can name "the OneMetric color," and it appears in only a
   few, deliberate places (primary action, active state, hero series, Lede-link hover) — *not* sprayed.
2. **One system everywhere** — no `rounded-lg`/`MetricCard` drift, no non-tabular number, one chart
   language; the detail pages match the Overview.
3. **It has a face** — a logomark + favicon + opengraph carry the identity, quietly.
4. **Accessible** — every accent use passes WCAG AA in dark + light; the accent is never the sole
   signal.
5. **Nothing regressed** — Move #1 hierarchy/narrative/data + Move #2 motion/feel are identical; no
   new dependency; server-first intact; deltas stay semantic green/red; the test suite is green.

---

## 9. Out of scope (explicitly)

- **A rebrand / new logo system / multi-color palette** — Move #3 is *one* restrained accent + a quiet
  mark, not a brand overhaul.
- **A light-mode launch** — light tokens are *defined* and AA-correct, but shipping a user-facing
  theme toggle is not part of Move #3 (dark-first stays the product).
- **Any V2+/ROADMAP feature** — Move #3 is pure design/craft, no new product surface.
- **New product pages or data** — no schema change, no new queries.

> Next: `MOVE-3-IMPLEMENTATION-PLAN.md` turns this into approval-gated, additive phases (0 + A–F).
> **Do not implement any phase until the spec + plan are approved.**
