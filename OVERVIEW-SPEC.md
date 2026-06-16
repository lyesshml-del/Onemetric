# Overview Page — Design Specification (Move #1: "Have an opinion")

> Design source of truth, alongside `DESIGN-AUDIT.md`, `PRD.md`, `AGENT-RULES.md`.
> **This is a design spec only — no code, no implementation.** It defines *what* the Overview
> should be and *why*. Implementation is a separate, later, approved step.
> Scope: the per-project Overview at `/dashboard/[projectId]`. Other pages unchanged for now.

---

## 1. The opinion (the soul of this page)

**The Overview is not a dashboard. It is a briefing.**

A great analyst doesn't hand you twelve equal charts — they walk in and say *one sentence* about
what happened, then show you the evidence, then let you dig. That is the entire philosophy here.

Three non-negotiable principles:

1. **Lede first.** The page opens with a single, plain-English sentence that states what changed.
   If the user reads nothing else, they got the answer.
2. **One protagonist.** Exactly one hero (the trend). Everything else is supporting cast, visibly
   smaller and quieter. No more "grid of equals."
3. **Outcomes over vanity.** What a founder actually cares about — *where traffic comes from, what
   converts, what earns* — is promoted onto the Overview. Engagement trivia (pages/session, avg
   duration, bounce) is demoted, not deleted.

Voice: **calm, factual, specific** — Stripe/Linear, never hypey. The product sounds like a
trusted analyst, not a growth-hack dashboard.

---

## 2. The 10-second test (every question → exactly one element)

| # | Question | Where it's answered | Element |
|---|---|---|---|
| 1 | Are things growing? | Lede + hero delta | The sentence + big number with ▲% + comparison line |
| 2 | Where does traffic come from? | Outcomes triad → **Sources** | Top sources card w/ favicons |
| 3 | What changed? | Lede + KPI deltas + Movers | The sentence + ▲▼ on every KPI |
| 4 | Which pages matter? | Detail → **Top pages** | Top pages list |
| 5 | Which funnels convert? | Outcomes triad → **Funnel** | Primary funnel conversion + step bars |
| 6 | Which source makes money? | Outcomes triad → **Revenue** | Revenue-by-source card ($) |

If any of these takes a click or a scroll past the fold (desktop), the design has failed.

---

## 3. Layout & hierarchy

Top → bottom, in descending importance. **Reading the page top-to-bottom = reading the story
from headline to footnotes.**

```
┌────────────────────────────────────────────────────────────────────────┐
│  Acme  ·  acme.com            [ 7d  30d  90d ]  ⇄ compare   • live       │  ← context bar (quiet)
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Traffic is up 18% this week — 2,430 visitors, led by Product Hunt.      │  ← THE LEDE
│  Your signup funnel converts at 4.2%, and newsletter drove $340.         │     (the briefing)
│                                                                          │
├────────────────────────────────────────────────────────────────────────┤
│  Unique visitors                                                         │
│  2,430  ▲ 18%   vs 2,060 last period                                     │  ← HERO
│                                                                          │     big number +
│        ╱╲      ╱╲                                                        │     area/line chart,
│   ╱╲  ╱  ╲╱╲  ╱  ╲___╱╲   (solid = now, dashed = previous)               │     full width,
│  ╱  ╲╱        ╲╱       ╲                                                  │     comparison
│  ────────────────────────────────────────────────────────────────────  │
├────────────────────────────────────────────────────────────────────────┤
│  Sessions      Signup conv.     Revenue        Active now                │  ← KPI STRIP
│  3,120 ▲ 9%    4.2% ▲ 0.6pp     $340 ▲ 22%     12 •                      │     4 outcome KPIs,
│  ▁▂▃▅▆▇        ▂▃▃▄▅▆           ▁▁▂▄▆▇         (live)                    │     delta + sparkline
├──────────────────────┬──────────────────────┬──────────────────────────┤
│  Top sources         │  Signup funnel        │  Revenue by source       │  ← OUTCOMES TRIAD
│  ◐ Product Hunt 612  │  Landing  ████████ 100│  Newsletter   $190       │     (where / convert
│  G  Google      280  │  Pricing  █████░░░ 61 │  Product Hunt $ 95       │      / earn) —
│  𝕏  Twitter/X   140  │  Signup   ██░░░░░░ 24 │  Direct       $ 55       │      EQUAL, promoted
│  → direct       110  │  4.2% overall         │  $340 total              │
├──────────────────────┴───────────┬──────────┴──────────────────────────┤
│  Top pages                        │  Audience                           │  ← DETAIL ROW
│  /              1,240             │  [ Countries | Devices | Browsers ]  │     (quiet, demoted)
│  /pricing         610             │  🇺🇸 United States  980              │
│  /blog/x          330             │  🇬🇧 United Kingdom 410              │
│  …                                │  …                                  │
└───────────────────────────────────┴─────────────────────────────────────┘
```

**Vertical rhythm of importance:** Lede (loudest) → Hero → KPI strip → Triad → Detail (quietest).
Spacing increases around the Hero (give the protagonist air) and tightens in the Detail row.

---

## 4. Section-by-section specification

### 4.0 Context bar (quiet utility, not a headline)
- Left: project name (medium) · domain (muted, smaller). The old `← Projects` link + project
  switcher move into the global sidebar/header (see Navigation, Move later) — not competing here.
- Right: **range segmented control** `7d / 30d / 90d / Custom` + a **"compare" toggle**
  (default **ON** — comparison is what makes every delta meaningful) + a subtle **• live**
  indicator (pulses if an event arrived in the last ~5 min).
- Remove the redundant **"Overview" `<h2>`** entirely — the page *is* the overview; labeling it
  is noise (Linear never labels the obvious).

### 4.1 The Lede — *the single most important element on the page*
- One or two sentences, auto-generated from the data, ~18–20px, regular weight, `foreground`.
- The **data nouns are emphasized** (slightly stronger weight or the accent) and are **inline
  drill links**: the % → trend, "Product Hunt" → Sources, "4.2%" → Funnel, "$340" → Revenue.
- It is **prose, not a heading** — no bold-shouting, no emoji, no exclamation. Calm authority.
- Full logic + templates + edge cases in §5.

### 4.2 The Hero — the one chart that leads
- **Big number block (top-left of the card):** current primary metric (default **Unique
  visitors**) at 36–44px, semibold, `tracking-tight`, **tabular-nums**; beside/under it a
  **delta badge** `▲ 18%` (green up / red down / muted flat) and `vs 2,060 last period` in muted.
- **Chart:** area + line, full card width, ~300px tall (desktop) / ~200px (mobile).
  - Current period = solid line + subtle accent gradient fill (accent → transparent).
  - Previous period = **dashed/ghosted** line for at-a-glance comparison (when compare is ON).
  - 2–3 faint y-gridlines; quiet x-axis ticks (start / mid / end, or weekly).
  - **Branded hover:** vertical crosshair + dot, small tooltip with date, value, and delta vs the
    same day last period. (Replaces the current native `<title>` tooltips and the bare min/max
    date labels — both removed.)
  - **Correct scaling** — no `preserveAspectRatio="none"` distortion.
- **Metric switcher (optional, subtle):** a small control to swap the hero series (Visitors /
  Sessions / Pageviews). Default Visitors. Quiet, not a tab row.

### 4.3 KPI strip — four outcomes, each with change
Replace the current six equal vanity tiles with **four KPIs that carry a delta + sparkline**:

| KPI | Value | Why it's here |
|---|---|---|
| **Sessions** (or Pageviews) | tabular + ▲▼% | volume companion to the hero |
| **Signup conversion** | % + ▲▼pp | the primary funnel's headline (answers "convert") |
| **Revenue** | $ + ▲▼% | the outcome that pays (answers "earn") |
| **Active now** | count + • live | the "alive" signal; makes it feel real-time |

- Each KPI: label (13px muted) · value (24–28px semibold tabular) · delta (13px, semantic color,
  ▲▼) · a **tiny sparkline** (~64×20px) of the period.
- **Demote** pages/session, avg session duration, bounce rate into a single secondary
  **"Engagement"** line *below* the strip (small, muted, inline: `Bounce 33% · 1.8 pages/session
  · 1m 04s avg`) or behind a "Details" disclosure. They're diagnostics, not headlines.

### 4.4 Outcomes triad — *the promotion that changes everything*
Three equal cards, side by side — the "where / convert / earn" that today is buried in tabs:

1. **Top sources** — ranked referrers **with favicons** (and a glyph for direct), value + share
   bar. Answers Q2. (Favicons are the single biggest "premium analytics" tell — non-negotiable.)
2. **Signup funnel** — the project's primary funnel as a compact horizontal step chart: step
   labels, mini bars, conversion %, overall % big at the bottom. Answers Q5. If no funnel exists,
   the card becomes a single CTA: *"Create your first funnel"* (smart-default suggested from top
   paths).
3. **Revenue by source** — ranked sources by amount, total at the bottom, currency-formatted.
   Answers Q6. If no revenue integration, the card is a quiet connect-CTA, not an empty box.

These three sit **above** the page-level detail because outcomes outrank raw tables.

### 4.5 Detail row — quiet, demoted, on-demand
- **Top pages** (list, tabular values, share bars) — answers Q4 but is reference, not headline.
- **Audience** — *merge* the current three separate Countries / Devices / Browsers cards into
  **one** card with a segmented control `[ Countries | Devices | Browsers ]`. Countries show
  **flags**, devices/browsers show **glyphs**. This kills 2 of the 5 redundant cards.
- Smaller type, tighter rows, lower contrast than the triad. This is the footnotes.

---

## 5. The narrative engine (how the Lede writes itself)

The Lede is generated from the same metrics already on the page — no AI, just templated logic
(consistent with PRD "no AI"). Tone: factual, specific, calm.

**Primary template:**
> `{TrafficVerb} {Δ}% {periodWord} — {visitors} visitors, led by {topSource}. {FunnelName}
> converts at {conv}%{, and {topRevenueSource} drove {revenue}}.`

- `TrafficVerb`/`Δ`: "up"/"down"/"steady" from visitors vs previous period (|Δ|<2% → "steady",
  drop the %).
- `periodWord`: "this week" (7d) / "this month" (30d) / "this quarter" (90d).
- Each `{...}` token is an inline drill link.

**Edge cases (must be designed, not left to break):**
- **New project / no comparison data:** *"Your first {visitors} visitors are in — mostly from
  {topSource}."* (No deltas yet.)
- **No traffic at all:** the Lede is replaced by the **empty state** (§7).
- **No revenue integration:** omit the revenue clause entirely (never show "$0 from —").
- **No funnel defined:** omit the funnel clause; the funnel triad card shows its CTA.
- **Down period:** *"Traffic is down 12% this week — …"* — stated plainly, never softened or
  hidden. Honesty is part of trust.
- **Flat:** *"Traffic is steady this week — {visitors} visitors, led by {topSource}."*

The Lede never exceeds two sentences. If data is thin, it says less — it never pads.

---

## 6. Typography hierarchy (exact scale)

One deliberate ladder (today's 24→18→16 is too shallow). Geist Sans throughout; **tabular-nums on
every number**; consider Geist Mono for the hero metric for an "instrument" feel.

| Role | Size / weight | Color | Notes |
|---|---|---|---|
| Hero metric | **40px / 600**, tracking-tight, tabular | foreground | the protagonist number |
| Lede | 18–20px / 400 | foreground (nouns stronger/accent) | prose, not a heading |
| KPI value | 26px / 600, tabular | foreground | |
| Section label (Top sources…) | 13px / 500 | muted-foreground | quiet, Linear-style |
| Delta badge | 13px / 500 | green/red/muted | ▲▼ glyph + value |
| Row label (page, source) | 14px / 400 | foreground | truncate long |
| Row value | 14px / 400, tabular | muted-foreground | right-aligned |
| Engagement line (demoted) | 13px / 400 | muted-foreground | inline diagnostics |
| Context bar | 14px name / 13px domain | foreground / muted | |

Rule: **numbers never jitter** (tabular everywhere), and there is a clear 2× jump from body
(14px) to hero (40px) so the eye always knows the protagonist.

---

## 7. States (designed, not accidental)

- **Loading:** skeletons that mirror the final layout exactly — a shimmer line for the Lede, a
  chart-shaped block, four KPI placeholders, three triad blocks. **No spinner, no blank flash.**
- **Empty (no data yet):** *one* focused state, not five empty cards. A single centered panel:
  *"Waiting for your first pageview"* + a live pulse + the install-snippet CTA. The page resolves
  to this when `sessions === 0`. (Replaces today's single generic empty card and removes the
  "5 empty breakdown cards" failure mode.)
- **Partial empty (traffic but no funnel/revenue):** the triad cards individually show their
  connect/create CTAs; the rest of the page renders normally.
- **Error:** quiet inline message + Retry on the affected card only — never blanks the page.
- **Live:** the `• live` dot + "Active now" KPI make the page feel real-time without a full
  realtime stream.

---

## 8. Color & accent (introduce one signature)

- Adopt **one restrained accent** — a considered indigo/violet, leaning into the violet hue
  already baked into the neutral tokens (`oklch(… 285)`). Used **only** for: the hero data series
  + gradient, the active range pill, Lede drill-links on hover, and the occasional positive
  emphasis. Everything else stays neutral monochrome.
- **Deltas are semantic, low-saturation:** up = restrained green, down = restrained red, flat =
  muted. They inform; they don't shout.
- Keep borders quiet (current 10% white) but use **spacing, not more borders**, to separate
  sections. The Hero gets the most surrounding whitespace.

---

## 9. Interaction (still spec, not implementation)

- **Everything is a drill-in:** Lede nouns, KPI cards, source/page/revenue rows → their detail
  views (Events, Funnels, Revenue, page report). The Overview is the map; clicking zooms in.
- **Range + compare:** segmented control; "compare to previous period" default ON. (Optimistic
  re-render is Move #2 — here we only specify that changing range must feel instantaneous and
  preserve scroll.)
- **Hover:** subtle row/card hover background; chart crosshair + tooltip. (No native tooltips.)
- **Keyboard:** range control and drill links fully focusable; (a ⌘K palette is Navigation/Move-
  later, noted not specified here).

---

## 10. Responsive

- **Desktop (≥1024):** Hero full width; KPI strip 4-across; triad 3-across; detail 2-across.
- **Tablet (≥640):** KPI 2×2; triad → 1×3 stacked or 2+1; detail stacked.
- **Mobile (<640):** single column, order = **Lede → Hero (shorter) → KPI 2×2 → Funnel →
  Sources → Revenue → Top pages → Audience.** The Lede + Hero + KPIs are the above-the-fold
  10-second answer; outcomes before detail.

---

## 11. What gets emphasized vs what disappears

| Element (today) | Decision | Rationale |
|---|---|---|
| "Overview" `<h2>` label | **Remove** | The page is self-evidently the overview |
| 6 equal metric tiles | **Reduce to 4 outcome KPIs** (+ deltas + sparklines) | Vanity → signal |
| pages/session, avg duration, bounce | **Demote** to one Engagement line | Diagnostics, not headlines |
| Single bar chart (visitors), native tooltips, min/max labels | **Replace** with hero area/line + comparison + branded hover | The protagonist |
| Top pages card | **Demote** to detail row | Reference, not lede |
| Top referrers card | **Promote** to triad as "Top sources" + favicons | Q2 is a headline question |
| Countries + Devices + Browsers (3 cards) | **Merge** into one "Audience" card w/ segmented control | Kills 2 redundant cards |
| Funnel (was a separate tab only) | **Surface** primary funnel on Overview | Q5 must be answerable here |
| Revenue (was a separate tab only) | **Surface** revenue-by-source on Overview | Q6 must be answerable here |
| — (nothing today) | **Add** the Lede | The 10-second answer |
| — (nothing today) | **Add** deltas/sparklines everywhere | Answers "what changed" |

Net: from **~12 equal blocks** to a **clear hierarchy** of 1 Lede + 1 Hero + 4 KPIs + 3 triad +
2 detail — fewer things, but each one earns its place and its size.

---

## 12. New/changed component specs (design intent only)

- **`Lede`** *(new)* — renders the narrative sentence with inline drill links + edge-case logic.
- **`StatCard`** *(replaces `MetricCard`)* — label + tabular value + delta badge + sparkline; one
  radius/padding (unifies the two card systems flagged in the audit).
- **`TrendChart`** *(replaces `BarChart` on Overview)* — area+line, comparison series, correct
  scaling, branded crosshair tooltip, quiet axes.
- **`SourceRow`** *(new)* — favicon/flag/glyph + label + share bar + value. Used by Sources,
  Audience, Top pages.
- **`FunnelMini`** *(new)* — compact step bars + overall conversion, links to full Funnels.
- **`RevenueMini`** *(new)* — ranked sources by amount + total, links to Revenue.
- **One card spec** for the whole page: a single radius (pick `rounded-xl`/14px), single padding,
  single border treatment — ends the `MetricCard` vs `Card` inconsistency.

---

## 13. Success criteria (how we'll know it worked)

1. **The 10-second test passes:** a first-time viewer answers all six questions without scrolling
   (desktop) or clicking.
2. **There is an obvious protagonist** — ask anyone "what's the most important thing on this
   page?" and they point to the Hero/Lede, not "everything."
3. **"What changed" is answerable** — every headline number shows a direction.
4. **Card count down, clarity up** — ~12 equal blocks → a 5-tier hierarchy.
5. **It reads designed** — one accent, one card spec, one number spec; no two-card-system tells.

> Next moves (do NOT start without approval): Move #2 "instant + alive" (optimistic range,
> skeletons, count-up, view transitions) and Move #3 "one signature" (accent + craft details).
> This spec deliberately stops at hierarchy, narrative, and emphasis — the "opinion."
