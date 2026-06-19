# DESIGN-SYSTEM — OneMetric

> How OneMetric should **feel**, not merely how it looks. Grounded in the real theme tokens
> (`apps/web/src/app/globals.css`), the shipped components, and the approved design docs:
> `DESIGN-AUDIT.md`, `OVERVIEW-SPEC.md`, `MOVE-1-IMPLEMENTATION-PLAN.md`, `UX-REVIEW.md`.
>
> When this file and the code disagree, the code wins — then update this file.

---

## Design philosophy — Linear + Stripe + Vercel + Apple
- **Linear:** an opinion, not a data dump. Remove until only the signal remains, then make it
  instant. Restraint and keyboard-speed.
- **Stripe:** every number carries a trend; crafted charts; the money story is never buried.
- **Vercel:** disciplined monochrome earned through precision and motion, one consistent system.
- **Apple:** obsess over the first 400ms, optical alignment, numerals that never jitter, one
  accent used with discipline.

**The thesis (from `DESIGN-AUDIT.md`):** OneMetric borrowed Vercel's *palette* (neutral
monochrome + Geist) but must now earn Vercel's *craft* (hierarchy, motion, precision). The
Overview is a **briefing, not a dashboard.**

## Principles
- **Calm** — muted base, generous space around what matters, no shouting, no marketing voice.
- **Opinionated** — one protagonist per screen; decide what *not* to emphasize.
- **Fast (and feels fast)** — server-first; perceived speed via optimism/skeletons (Move #2).
- **Minimal** — fewer, better elements; dependency-free; remove before adding.
- **High information density where data lives** — tight rows/tables; air around the hero.
- **Premium feel** — craft in the 1% (tabular numerals, branded tooltips, avatars, motion).
- **Editorial hierarchy** — the page reads top-to-bottom like a story: headline → evidence →
  footnotes.

## Typography
- **Family:** **Geist Sans** (`--font-geist-sans`) everywhere; **Geist Mono** available for a
  future "instrument" treatment of raw numbers.
- **Numbers always `tabular-nums`** so they never jitter.
- **Scale (target ladder — see `OVERVIEW-SPEC.md` §6):**
  | Role | Size / weight |
  | --- | --- |
  | Hero metric | ~36–40px / 600, `tracking-tight`, tabular |
  | Lede (briefing prose) | 18px / 400, muted base + bright `font-medium` nouns |
  | KPI value | 24px (`text-2xl`) / 600, tabular |
  | Section/KPI label | 12–13px, `text-muted-foreground` |
  | Delta badge | 13px / 500, semantic color |
  | Row label / value | 14px / 400 (value tabular, muted) |
  | Engagement diagnostics | 12–13px, muted, inline |
- **Keep a real jump** from body (14px) to hero (~36px) so the protagonist is unmistakable.

## Colors (from `globals.css`, dark-mode first)
OneMetric is **dark-first** (`.dark` on `<html>`); light tokens exist for a future toggle.
- `--radius: 0.625rem` (10px base).
- **Dark palette (oklch):** background `0.141 0.005 285` (near-black, *faint* violet hue),
  card/popover `0.21`, foreground `0.985` (near-white), `muted-foreground` `0.705`,
  **primary `0.92` (near-white → white buttons)**, **border `oklch(1 0 0 / 10%)` (white @ 10%)**.
- **Only chromatic token today is `destructive` (red).** **There is no brand accent yet** — that
  is deliberate; the single signature accent is **Move #3**.
- **Deltas are semantic, low-saturation:** up = restrained green (`emerald-500`), down = red,
  flat/neutral = muted. The glyph shows direction; color shows good/bad (`invert` for metrics
  where down is good, e.g. bounce/drop-off).
- Separate sections with **spacing, not more borders** — borders stay quiet at 10%.

## Spacing
- Card outer rhythm: `space-y-8` between major sections; within cards, `mt-1 / mt-3 / mt-5`.
- **Give the hero the most surrounding air; tighten detail rows** (Linear's density contrast).
- Touch targets ≥ ~40px on interactive elements.

## Border radius
- Token ladder: `sm` 6px · `md` 8px · `lg` 10px · `xl` 14px.
- **One card radius everywhere: `rounded-xl` (14px)** — hero `Card`, `StatCard`, the
  `SourcesCard`/`TopPagesCard`/`AudienceCard` (all `Card`-based), and `MetricCard` all use it.
  **Move #3 / Phase D (`ONE-60`)** unified the legacy `MetricCard` (was `rounded-lg`) onto the spec
  (`rounded-xl` + `tabular-nums`), so the Events-detail / Funnels-detail / Revenue pages now match
  the Overview. **No `rounded-lg` card remains anywhere** (grep-confirmed); do not introduce one.

## Card system (ONE system)
- Canonical card: `rounded-xl border bg-card` (shadcn `Card` = `py-6 px-6 shadow-sm`; compact
  variants like `StatCard` use `p-4`). Same radius/border/background everywhere.
- `StatCard` (Phase C) is the unified KPI card: label · value · optional `<Delta>` · optional
  `<Sparkline>` · optional live dot · `pending` (dimmed "—" placeholder for later-phase data).
- **One card system (no second system).** The two-card-system inconsistency flagged in
  `DESIGN-AUDIT.md` is **fully resolved** (Move #3 / Phase D): `MetricCard` was restyled onto the
  canonical `rounded-xl` + `tabular-nums` spec (it adds an optional `hint`; `StatCard` adds
  delta/sparkline/live — the same card chrome), so the Overview and all three detail pages share one
  card spec. `BreakdownCard` (still used by Revenue) is also `Card`-based (`rounded-xl`).

## Information hierarchy (the Overview, per `OVERVIEW-SPEC.md`)
Loudest → quietest: **Lede → Hero → KPI strip → Outcomes triad (Sources / Funnel / Revenue) →
Detail (Top pages + Audience)**. One protagonist (the hero trend). Outcomes (where-from /
converts / earns) are promoted above raw tables. The page answers six questions in <10s
(growing? where-from? what-changed? which-pages? which-funnel? which-source-earns?).

## Motion philosophy
- **Move #2 (Feel & Performance) — the motion system is in place (Phases 0/A–G; Phase G in review).**
  A token system + a global reduced-motion guard drive every effect: a layout-mirroring **skeleton**
  (Suspense), **optimistic** range switching (`useTransition` + dim, scroll preserved), **count-up**
  on data change, **chart draw-in** on arrival, **hover/press** feedback, and a **view-transition**
  cross-fade. Optimistic section *tabs* (B2 / `ONE-55`) remain deferred. Full philosophy:
  `MOVE-2-SPEC.md`.
- **Motion tokens** (`globals.css`, theme-agnostic): one easing `--motion-ease`
  (`cubic-bezier(0.22,1,0.36,1)`, exposed as the `ease-soft` utility) + a duration ladder —
  `--motion-micro 120ms` (hover/press) · `--motion-base 180ms` (pending · view-transition) ·
  `--motion-entrance 600ms` (count-up · chart draw-in, **once**). Keyframes `shimmer` (skeletons) and
  `draw-in` (charts, via `pathLength=1`) exist as the `animate-shimmer` / `animate-draw-in` utilities.
- **Reduced-motion is CSS-first + first-class:** a global `@media (prefers-reduced-motion: reduce)`
  guard makes every animation/transition effectively instant; JS-driven motion (count-up) also
  branches via the `useReducedMotion()` hook → final value immediately. Never decorative, never
  blocking; Apple-grade restraint (enter gently, respond instantly).
- **Primitives:** `useCountUp` (rAF; pure math in `lib/motion.ts`, unit-tested; counts on data change,
  ghost-reserved width so neighbours never shift), `useReducedMotion`, `<Skeleton>`, `<OverviewShell>`
  (optimistic range + dim), `<CountUp>`. Built in Phase 0; wired into the UI across Phases A–G.

## Chart philosophy
- **Dependency-free SVG only** (no charting library). Three components today:
  - `TrendChart` (hero): area + line, **previous-period ghosted comparison line**, crisp via
    `vector-effect="non-scaling-stroke"`, **HTML-overlay** crosshair/dot/tooltip so non-uniform
    scaling never distorts decorations. Correct, undistorted scaling.
  - `Sparkline`: tiny area+line, static, `aria-hidden` (the value+delta carry meaning).
  - `BarChart` (legacy, **only consumer = the Events-detail trend**; the marketing page uses the
    lucide `BarChart3` *icon*, not this component): it uses `preserveAspectRatio="none"` which
    distorts bars — **do not reuse it**; prefer `TrendChart`. **One chart language = `TrendChart`**
    (correct, undistorted scaling). Move #3 / Phase D ruled the `BarChart` rewrite its own
    single-concern change, tracked in **`ONE-45`** (kept out of the Phase D card/number PR).
- Quiet axes, low-contrast gridlines, monochrome series — except the hero `TrendChart` series, which
  is the signature accent (Move #3 / Phase A); breakdown bars stay `bg-foreground/5`.

## Tooltip philosophy
- **Branded, never native.** Tooltips use theme tokens (`bg-popover`, `border`, `shadow-md`),
  show date · value · comparison, and are HTML overlays (not SVG `<title>`).

## Empty states
- **One focused state, not many empty cards.** When a project has no data, show a single
  centered panel ("Waiting for your first pageview" + install CTA), not a grid of empties.
  Per-card pending states (e.g. KPI "—", "connect revenue") are dimmed and self-explanatory,
  never broken-looking.

## Loading states
- **Skeletons that mirror the final layout** (Move #2) — no spinners, no blank-then-pop.
  Server-first rendering already gives fast TTFB; perceived speed is the Move #2 goal.

## Mobile philosophy
- Single column; **above-the-fold = Lede → Hero → KPIs** (the 10-second answer). Outcomes before
  detail. KPIs 2×2; triad stacks. Verify tables scroll/reflow (no overflow). The dedicated mobile
  pass is **Move #1 Phase I** (don't bolt mobile onto every earlier phase).

## Accessibility
- Visible `focus-visible` rings on all interactive elements (shadcn default).
- `aria-hidden` on decorative glyphs/sparklines; `role="img"` + `aria-label` on meaningful charts.
- WCAG AA contrast for muted text on dark; `tabular-nums` for legibility.
- Respect `prefers-reduced-motion` once motion lands.

## Things intentionally avoided
- Charting libraries; heavy animation/Lottie; multiple card systems; accent-color overuse;
  marketing-voice microcopy; native browser tooltips; third-party favicon services (privacy —
  use monogram avatars, decision D1).

## Signature elements (what makes it "OneMetric")
- **The Lede** — a calm one-sentence briefing at the top of the Overview.
- **The hero** — one protagonist trend with period-over-period comparison.
- **Monochrome + Geist + tabular numerals** — a quiet, instrument-like feel.
- (Coming in Move #3) **one restrained signature accent** + craft details (avatars, flags).

## Future Move #2 considerations (speed + "alive")
Optimistic range/section switching, route view-transitions, skeletons, number count-up, chart
draw-in, subtle hover/press feedback. Goal: the product *feels* instant, like Linear.

## Future Move #3 considerations (identity + craft)
Introduce **one** restrained signature accent (lean into the faint violet already in the
neutrals), apply it sparingly (primary action, active state, key data series). Finish craft:
monogram/flag/glyph avatars, fully unified card/number/chart specs, a logomark. Quiet, but
unmistakably *designed*.
