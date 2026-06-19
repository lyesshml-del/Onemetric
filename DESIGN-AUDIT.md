# OneMetric — Product Design Audit

> Written from the POV of Linear / Stripe / Vercel / Apple design teams. Grounded in the
> actual code (theme tokens in `globals.css`, the overview screen, and the component
> primitives), not generic SaaS advice. **No code, no implementation — audit only.**
> Promote anything you want to act on into `TODO.md` / `ROADMAP.md`.

## The one-sentence thesis
OneMetric borrowed Vercel's **palette** (neutral monochrome + Geist) but not Vercel's
**craft** (motion, geometry, precision, hierarchy) — so today it reads as a *competent default
shadcn dark dashboard*, not a *designed product*. It is honest, fast, and clean. It is not yet
**premium**, because premium = a point of view + hierarchy + restraint + motion + identity, and
right now everything on screen has equal weight and no signature.

Overall: **~5/10 today → 9–10 world-class.** The gap is not features. It's editorial.

---

## What actually makes Linear/Stripe/Vercel feel premium (the real answer)
1. **They have an opinion.** They don't show you everything; they show you the *one* thing that
   matters and demote the rest. OneMetric shows 6 equal metrics + 5 identical breakdown cards —
   a grid with no protagonist.
2. **They answer "what changed?" before you ask.** Every Stripe/Linear number carries a trend.
   OneMetric has zero deltas — you cannot tell if anything is up or down.
3. **Speed is a feeling, not a benchmark.** Linear is optimistic + local + keyboard-first, so it
   feels *instant*. OneMetric server-navigates on every tab/range change — fast TTFB, but it
   *feels* like page loads, not an app.
4. **Restraint + one signature.** Linear's indigo, Stripe's blurple+gradient. Even Vercel's
   pure black/white is a *deliberate, crafted* monochrome. OneMetric's monochrome is the
   *default* — neutral by absence, not by decision, so it reads anonymous.
5. **Craft in the 1%.** Favicons on referrers, flags on countries, count-up on numbers, a chart
   that scales correctly, a skeleton instead of a blank flash. These tiny things are 80% of the
   "premium" perception. OneMetric currently ships none of them.

---

## Category scorecard

| # | Category | Now | World-class | One-line gap |
|---|---|:--:|:--:|---|
| 1 | Information hierarchy | 5 | 9 | Uniform grid; no protagonist; nothing emphasized |
| 2 | Navigation | 6 | 9 | Top-tabs + full-page nav; no persistent sidebar; billing orphaned |
| 3 | Information density | 5 | 9 | Generic equal-card grid; weak section separation |
| 4 | Dashboard philosophy | 4 | 9 | Answers ~2 of the 6 key questions in <10s |
| 5 | Interaction quality | 4 | 9 | Static; native tooltips; no skeletons/hover on cards |
| 6 | Performance perception | 5 | 9 | Fast but static; no optimistic UI / view transitions |
| 7 | Component system | 5 | 9 | Two card systems; distorting chart; no icons/favicons |
| 8 | Typography | 6 | 9 | Good type (Geist), but metrics undersized, no tabular-nums on heroes |
| 9 | Color system | 5 | 9 | Monochrome with no signature accent → anonymous |
| 10 | Motion | 3 | 9 | Effectively none beyond hover color |
| 11 | Cognitive load | 6 | 9 | Mostly fine; funnel builder is the heavy spot |
| 12 | Design-system consistency | 5 | 9 | Two card radii/paddings; otherwise shadcn-consistent |

> **Status — 2026-06-19: all three leverage moves shipped (the scorecard above is the original audit
> baseline, kept for the record).** **Move #1 — Opinionated Overview** closed cats 1/3/4 (hierarchy,
> density, dashboard philosophy); **Move #2 — Feel & Performance** closed cats 5/6/10 (interaction,
> perceived performance, motion); **Move #3 — Identity & Craft** closed cats 7/8/9/12 (component system,
> typography/tabular, **color system**, design-system consistency). **#9 Color system → done:** one
> restrained `--brand` indigo-violet, used only on the hero data series, active state, primary action, and
> Lede-link hover, plus the logomark/favicon/OG identity — monochrome everywhere else, AA-verified dark +
> light. (The distorting `BarChart` is the one remaining component-system item, tracked in `ONE-45`.)

---

## 1. Information hierarchy — 5 → 9
**What's there:** overview = 6 equal `MetricCard`s (2/3-col grid) → one chart card → 5 identical
`BreakdownCard`s (2-col). Every element is the same size, weight, and color.
**Weaknesses:** No protagonist. The eye has nowhere to land first. "Unique visitors," "Bounce
rate," and "Pages/session" are presented as equally important — they are not. Five breakdown
cards of identical visual weight = wallpaper.
**Opportunities:** Pick **one hero** (e.g. visitors trend, large, full-width, with the delta) and
**demote** everything else to a quiet supporting row. Stripe's home leads with one chart + a
compact KPI strip. Linear leads with *your* view, not all data. Hierarchy = deciding what *not*
to emphasize.

## 2. Navigation — 6 → 9
**What's there:** top app bar (`OneMetric · Billing · email · Sign out`) + a per-project
`ProjectHeader` with 6 underline tabs (Overview/Events/Funnels/Revenue/Reports/Settings). Each
tab is a full server navigation.
**Compared to Linear/Stripe/Vercel:** all three use a **persistent left sidebar** + near-instant
client transitions. Tabs-on-top works, but it caps at ~6 items and makes the app feel like a
website, not a tool. Billing living only in the top bar (separate from project context) is an
orphan.
**Weaknesses:** No global sidebar; full-page reloads between sections; no command palette
(Linear's ⌘K is core to its identity); range changes reload the page.
**Opportunities:** A quiet left sidebar (projects + sections), client-side transitions, and a
⌘K palette would instantly read "serious tool." Merge low-traffic destinations (Reports +
Settings could be one "Settings" area; Funnels could be an inline tab within analytics).

## 3. Information density — 5 → 9
**What's there:** `Card` = `rounded-xl`, `py-6`, `gap-6`, `px-6`, `shadow-sm`, 10%-white border.
Generous, airy. `space-y-8` between sections.
**Weaknesses:** Density is *uniform* — everything is medium. Linear's magic is **contrast**:
very tight where data lives (rows, tables), very generous around the one thing that matters.
OneMetric is evenly spaced everywhere, which reads "template." Section separation relies on the
faint 10% border + a subtle card-vs-bg lightness step → groups don't clearly separate.
**Opportunities:** Tighten the breakdown rows (denser, more list-like, Linear-tight) and give the
hero more air. Use spacing — not more borders — to group. Consider a subtle background tint or a
hairline divider for section breaks.

## 4. Dashboard philosophy — 4 → 9 (the most important one)
The test: opening the dashboard, can these be answered in **<10s**?

| Question | Answered now? |
|---|---|
| Are things growing? | ❌ no deltas/trend anywhere |
| Where does traffic come from? | 🟡 Top referrers card (text only, no favicons) |
| What changed? | ❌ nothing surfaces change |
| Which pages matter? | ✅ Top pages card |
| Which funnels convert? | ❌ separate tab, must navigate |
| Which source makes money? | ❌ separate Revenue tab, must navigate |

**~2 of 6.** This is the core "another dashboard" problem. A premium analytics home answers all
six at a glance: a headline like *"Visitors +18% WoW, led by Product Hunt, 4.2% signup-funnel
conversion, $340 from newsletter"* — then lets you drill. Right now the overview is a pile of
current-state numbers with no narrative and no money/funnel context.
**Opportunity:** Design an **opinionated default view** that fuses traffic + change + funnel +
revenue into one "what matters" summary. This single move is what would make it feel like the
"Linear of analytics."

## 5. Interaction quality — 4 → 9
**What's there:** tab hover (`transition-colors`), button hover (bg shift), focus-visible rings
(good a11y), tab underline active state. Bars use the **native `<title>`** for tooltips.
**Cheap tells:** native browser tooltips on the chart (slow, OS-styled, un-branded); cards and
breakdown rows have **no hover** state; no skeletons (blank → pop); `UpgradeButton` shows a bare
"Loading…" text.
**Premium bits already present:** focus rings, the underline tab transition, consistent buttons.
**Opportunities:** Custom chart hover (crosshair + branded tooltip + value), row hover on
breakdowns/tables, skeletons on data load, button press/àctive feedback, and a real loading
state on async actions. These are what separate "fine" from "feels expensive."

## 6. Performance perception — 5 → 9
**What's there:** server-first rendering → genuinely fast TTFB and small JS.
**Weaknesses:** every range change and tab switch is a **full server navigation** — no optimistic
update, no view transition, no skeleton — so it *feels* like reloading a webpage. Fast on paper,
static in feel. Nothing is "alive."
**Opportunities:** Optimistic range switching (re-render instantly, fetch in background), route
view-transitions, skeletons, and a subtle number count-up / chart draw-in on first paint. Perçeived
speed > actual speed; Linear feels instant largely through optimism and local state.

## 7. Component system — 5 → 9
**What's there:** shadcn primitives (Button with full variant/size matrix — good), `Card`,
`BreakdownCard`, a hand-rolled SVG `BarChart`.
**Weaknesses:**
- **Two card systems:** `MetricCard` (`rounded-lg` 10px, `p-4`) vs `Card` (`rounded-xl` 14px,
  `py-6`). Same screen, two radii, two paddings → subliminal "not one system."
- **Chart distorts:** `preserveAspectRatio="none"` stretches bars non-uniformly; native tooltips;
  single series; no axes/gridlines/y-scale. It's a placeholder, not a product chart.
- **Breakdowns are text-only:** no favicons for referrers, no flags for countries, no device/
  browser glyphs. This is the single biggest "premium analytics" visual cue, and it's absent.
**Opportunities:** Unify on one card spec. Replace the bar chart with one crafted chart component
(correct scaling, area+line, branded hover). Add favicon/flag/glyph to breakdown rows.

## 8. Typography — 6 → 9
**What's there:** **Geist Sans/Mono** (excellent, Vercel's face). h1 `text-2xl` semibold
tracking-tight; h2 `text-lg`; CardTitle `text-base`. `tabular-nums` used on breakdown values.
**Weaknesses:** Hero **metrics are only `text-2xl` (24px)** and *not* tabular-nums — for the
primary numbers in an analytics product they should be larger, confident, and tabular so they
don't jitter. No distinct "metric" type treatment (Stripe/Linear give big numbers their own
scale + tracking). Heading steps are close (24 → 18 → 16), so hierarchy is shallow.
**Opportunities:** A dedicated metric scale (e.g. 32–40px, tabular, tight tracking), bigger
heading contrast, and consider Geist Mono for raw counts to get the "data instrument" feel.

## 9. Color system — 5 → 9
**What's there (from `globals.css`):** dark bg `oklch(0.141 0.005 285)` (near-black, *faint*
violet hue, chroma 0.005 ≈ neutral), card `0.21`, primary = near-**white** (`0.92`), borders =
**white @ 10%**, `muted-foreground` `0.705`. The **only** chromatic color is `destructive` (red).
**Verdict:** clean but **anonymous and slightly flat**. There is no accent, so nothing carries
brand or guides the eye to action. Vercel survives monochrome through craft; without that craft,
this reads "unfinished," not "minimal-premium." Borders at 10% + the subtle card step make
section separation weak.
**Opportunities:** Introduce **one** restrained signature accent (a considered indigo/violet —
you already have a violet hue baked into the neutrals, so lean into it) used *sparingly* for the
primary action, active state, and key data series. Keep everything else neutral. One accent is
the difference between "a theme" and "a brand."

## 10. Motion — 3 → 9
**What's there:** `tw-animate-css` is imported but essentially unused; only `transition-colors`
on hovers.
**Weaknesses:** No page/route transitions, no number count-up, no chart draw-in, no stagger, no
micro-interactions. The product is static — it doesn't feel *alive*.
**Opportunities:** Apple-grade restraint, not Lottie everywhere: a 150–250ms ease on route
changes, a count-up on metrics, a chart that draws in once, hover lifts on interactive cards.
Motion is how you signal quality and causality.

## 11. Cognitive load — 6 → 9
**What's there:** mostly low — overview is scannable, range select is a simple control.
**Weaknesses:** the **funnel builder** (dynamic step rows, match-type per step) is the one place
that asks the user to think/configure. Empty dashboard after signup also pushes thinking onto the
user ("now what?").
**Opportunities:** Smart defaults (auto-suggest a funnel from top paths), a guided first-run
("waiting for your first event"), and inline editing instead of separate config screens.

## 12. Design-system consistency — 5 → 9
**Inconsistencies found:** two card radii (10px vs 14px) and two paddings (16px vs 24px) on the
same screen; metric numbers lack the tabular-nums used elsewhere; the chart's visual language
(native tooltip, no scale) doesn't match the otherwise-polished shadcn components.
**Verdict:** ~80% one system (shadcn gives you that for free), but the bespoke pieces
(MetricCard, BarChart) drift. **Opportunity:** one card spec, one number spec, one chart spec —
documented as tokens — and the whole thing snaps to "one system."

---

## If each team redesigned OneMetric

**If Linear designed it — what they'd REMOVE:**
- The equal-weight 6-metric + 5-breakdown grid → replaced by one opinionated "what matters" view.
- The top tab bar → a quiet sidebar + ⌘K.
- Most borders and chrome → rely on spacing and hierarchy. *Linear removes until only the
  signal is left, then makes that signal instant.*

**If Stripe designed it — what they'd POLISH:**
- The numbers: big, tabular, each with a trend and a sparkline.
- The chart: a real, crafted time-series with a branded hover tooltip and correct scaling.
- The breakdowns: favicons, flags, device glyphs; tight, scannable rows.
- The money story surfaced on the home, not hidden in a Revenue tab.

**If Vercel designed it — what they'd SIMPLIFY:**
- Collapse 6 destinations into ~3; make range/section changes instant (client transitions).
- One consistent card, one radius, one spacing scale — ruthless system discipline.
- Keep the monochrome, but earn it with motion + precision so it reads *intentional*.

**If Apple designed it — what they'd OBSESS over:**
- The first 400ms: count-up, chart draw-in, route transition — the feeling of the thing loading.
- Optical alignment of every number and label; tabular numerals that never jitter.
- One accent, used with discipline; empty states that feel considered, not apologetic.
- The single sentence the dashboard says to you the instant it opens.

---

## How to become "The Linear of analytics" (not "another dashboard")
Three moves, in order of leverage:

1. **✅ Have an opinion (hierarchy + narrative).** *(Move #1 — shipped.)* Replaced the uniform grid with one
   default view that answers all six questions at a glance and *says one sentence* about what changed —
   traffic, source, funnel, money — then lets people drill. This was 70% of the perceived jump.
2. **✅ Make it feel instant + alive (speed + motion).** *(Move #2 — shipped.)* Optimistic range/section
   changes, view transitions, skeletons, count-up, a chart that draws. Linear is loved for *feel*.
3. **✅ Give it one signature (identity + craft).** *(Move #3 — shipped.)* One restrained accent, one unified
   card + number + chart spec, and the craft details (avatars, flags, glyphs, branded tooltips, logomark +
   favicon). Quiet, but unmistakably *designed*.

Everything else in this audit is in service of those three. The product is already honest and
fast — the work now is **editorial and craft**, not more features.
