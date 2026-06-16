# Move #1 — Incremental Implementation Plan ("Have an opinion")

> Turns `OVERVIEW-SPEC.md` into a build strategy. **Planning artifact only — no code, no
> implementation.** Written as a principal engineer + principal designer pair would: optimized
> for **small, low-risk, reviewable, maintainable** steps — never a big-bang rewrite.
>
> Source of truth this plan serves: `OVERVIEW-SPEC.md`, `DESIGN-AUDIT.md`, `PRD.md`,
> `AGENT-RULES.md`. Scope is the per-project Overview at
> `apps/web/src/app/dashboard/[projectId]/page.tsx` **only**. Every other page is out of scope.

---

## Engineering principles (apply to every phase)

1. **Additive, never destructive.** Build each new component *alongside* the old one. The page
   swaps **one section per phase**. `main` stays shippable after every phase.
2. **Never change an existing query's signature or behavior.** `getProjectAnalytics`,
   `getOverviewMetrics`, `getTimeseries`, the funnel/revenue queries are consumed by other pages.
   We **add** new helpers (e.g. previous-period) that *reuse* them; we don't edit them.
3. **One phase = one reviewable PR.** Small diff, single concern, easy to read and revert.
   Definition of Done (below) is identical for every phase.
4. **Pure logic is unit-tested.** The Lede builder, delta math, flag/favicon helpers are pure
   functions with tests — they extend the existing 48-test suite (don't replace it).
5. **No schema changes in Move #1.** Everything is derivable from existing tables. (A "pinned
   primary funnel" field is a *possible later* migration — not now; we default to the first funnel.)
6. **Server-first; isolate interactivity.** The page stays a server component. Only the pieces
   that need hover/animation (TrendChart, Sparkline, segmented control) are small `"use client"`
   leaves. Keeps bundle small and perceived speed high.
7. **Transitional states are designed, not accidental.** Because we migrate section-by-section,
   the page briefly shows new + old sections together. That is acceptable and always functional;
   the final coherence pass is Phase J. *(Opt-out available — see "Rollout option" below.)*

### Definition of Done (every phase)
- `typecheck · lint · test · build` all green; new pure logic has unit tests.
- Verified against a **known seed dataset** (the established throwaway-seed discipline) so numbers
  match their dedicated tab (funnel/revenue) and delta math matches a hand calculation.
- A before/after screenshot at desktop **and** mobile widths.
- A filled-in **"What must remain unchanged"** checklist (per phase below) — re-verified.
- Seed data removed afterward; live `DataFast` data never touched.

### Rollout option (principal-engineer's hedge)
If you want **zero** transitional look in production while D–F land, gate the new Overview behind
a flag (`?v=2` query param, or a per-project boolean) and flip it on only when J completes.
Recommended **only if** you're onboarding a real client mid-migration; otherwise the additive,
always-working approach is simpler and fine.

---

## Why this order (rationale)

The spec's hierarchy is Lede → Hero → KPIs → Triad → Detail. The *build* order is deliberately
different from the *visual* order, for risk and dependency reasons:

- **Foundations (Phase 0) first** because three later phases all need the same things —
  previous-period comparison, a `Delta` component, favicon/flag helpers, one card spec. A
  principal engineer never lets Hero, KPIs, and the Lede each invent their own delta logic.
- **Hero first (A)** because it's the protagonist: it establishes the new visual language and
  proves the comparison-data capability end-to-end. Everything else conforms to it. Highest
  single value, so derisk it early.
- **Lede (B) and KPIs (C)** next — they crown the hero and make "what changed" pervasive. Both
  ship **progressively**: their traffic-based parts land now; their funnel/revenue parts *light
  up automatically* when E and F deliver that data. This is the key trick that lets us follow the
  spec's section order without blocking on data.
- **Triad D → E → F**: Sources first (data already exists → lowest risk, and it proves the triad
  container + the favicon language), then Funnel, then Revenue (each also adds its Lede clause and
  its KPI).
- **Detail G → H** after the headline half is solid — Audience (merge 3 cards → 1) then Top pages
  + diagnostics. Lower stakes, so later.
- **Mobile (I)** once all sections exist — do the responsive pass **once** instead of re-doing it
  per phase (cheaper, more consistent).
- **Cleanup (J)** last — remove transitional remnants, retire dead components, final hierarchy +
  a11y + spacing polish. The coherence pass.

---

## Phase 0 — Foundations *(recommended prerequisite; not in the original A–J list, but the rest depends on it)*

- **Goal:** the shared primitives + the comparison-period capability, so no later phase duplicates
  delta/format/favicon/flag logic or re-solves "previous period".
- **Scope:**
  - `previousRange(from, to)` → the immediately-prior window of equal length (for deltas/compare).
  - `getOverviewMetricsDelta` *(thin wrapper)* — calls existing `getOverviewMetrics` for current
    **and** previous window, returns both + computed deltas. **Reuses**, doesn't modify, the query.
  - Format helpers: `formatDelta` (sign, %, pp vs %), ensure `formatMoney` is shared, `flagEmoji(cc)`,
    `faviconSource(domain)` *(see open decision D1 on privacy)*.
  - `<Delta>` component (▲▼ glyph + semantic color + value) — reused by Hero and KPIs.
  - Decide and document **one card spec** (radius/padding/border) to end the `MetricCard`-vs-`Card`
    split — applied as each section is rebuilt (not a mass edit).
- **Components:** `Delta` (new). **Files:** `lib/range.ts`, `lib/format.ts`, new `lib/lede.ts`
  (stub + types), new `components/dashboard/delta.tsx`, new tests. **No `page.tsx` change.**
- **Dependencies:** none.
- **Verification:** unit tests for `previousRange` (DST/month boundaries), `formatDelta`,
  `flagEmoji`; `Delta` renders all three directions. No visual/UX change to verify (page untouched).
- **Risk:** **Very low** — pure additive utilities, zero page impact.
- **Expected UX impact:** none yet (intentionally).
- **Must remain unchanged:** the live Overview page; every existing query's signature/behavior.

---

## Phase A — Hero section

- **Goal:** replace the bar chart + its card with the **hero**: big tabular number + `Delta` +
  an area/line **trend chart** with a previous-period comparison line and a branded hover tooltip.
- **Scope:** new `TrendChart` (client) — area+line, correct scaling (no `preserveAspectRatio="none"`),
  ghosted previous-period series, crosshair + tooltip (date · value · Δ vs same day last period),
  quiet axes. Hero number block. Wire current+previous timeseries (reuse `getTimeseries` for both
  windows) and `getOverviewMetricsDelta` for the headline number.
- **Components:** `TrendChart` (new), `Delta` (from 0), hero block. **Files:** new
  `components/charts/trend-chart.tsx`; `app/dashboard/[projectId]/page.tsx` (swap **only** the
  chart-card section); reuse `getTimeseries`/`previousRange` (no query edits).
- **Dependencies:** Phase 0.
- **Verification:** chart scales correctly at multiple widths; comparison line renders only when
  data exists; hover math matches hand calc on a seed set; `BarChart` still used by Events/Funnel
  pages and visually unchanged there; typecheck/lint/build.
- **Risk:** **Medium** — largest new component + a charting concern. *Mitigation:* `BarChart` is
  left intact for other pages; `TrendChart` is additive; only the overview chart section changes.
- **Expected UX impact:** **High** — the protagonist appears; "are things growing?" becomes
  instant.
- **Must remain unchanged:** `BarChart` (Events trend, Funnel detail still use it); the 6 metric
  tiles + 5 breakdown cards (still present this phase); the empty state; all other pages.

---

## Phase B — Lede system

- **Goal:** add the narrative sentence above the hero. Ships **progressively**: the traffic +
  top-source clauses now; funnel/revenue clauses are appended by E/F.
- **Scope:** pure `buildLede(input)` → ordered clause tokens (with edge cases from spec §5: new
  project, down, flat, no-data); `Lede` component renders tokens with inline drill links. Insert at
  top of page. Define the **clause interface** so E/F can plug in without touching B.
- **Components:** `Lede` (new). **Files:** `lib/lede.ts` (+ tests), new
  `components/dashboard/lede.tsx`, `page.tsx` (insert at top).
- **Dependencies:** Phase 0 (delta/metrics); pairs with A (sits above hero). Top-source uses
  existing `getTopReferrers`.
- **Verification:** unit tests for every edge case (new/down/flat/no-data/no-source); links resolve
  to the right sub-views; sentence never exceeds two sentences; visual at desktop+mobile.
- **Risk:** **Low** — pure function + one presentational component; additive.
- **Expected UX impact:** **High** — the 10-second headline answer.
- **Must remain unchanged:** hero, tiles, breakdowns, empty state. (Funnel/revenue clauses are
  *absent for now* by design — not broken.)

---

## Phase C — KPI strip

- **Goal:** replace the 6 vanity tiles with **4 outcome KPIs** (value + `Delta` + sparkline) and
  **demote** pages/session, avg duration, bounce into one quiet "Engagement" diagnostics line.
- **Scope:** `StatCard` (new, unified card spec), `Sparkline` (new tiny client chart), `getActiveNow`
  (new tiny query: sessions/events in last ~5 min). Ships the **data-available** KPIs first
  (Sessions, Pageviews/Active-now); the **Revenue** and **Signup-conversion** KPIs are placed but
  *light up* when F and E land (progressive, same pattern as the Lede).
- **Components:** `StatCard`, `Sparkline` (new). **Files:** new
  `components/dashboard/stat-card.tsx`, `components/charts/sparkline.tsx`; `analytics.ts` (**add**
  `getActiveNow` + optionally a per-day `sessions` series for that sparkline — additive);
  `page.tsx` (replace the tiles grid; add the engagement line).
- **Dependencies:** Phase 0; sparkline reuses timeseries; full strip completes after E/F.
- **Verification:** delta signs correct; tabular alignment (no jitter); `getActiveNow` matches a
  manual count; engagement line shows the demoted three; tests.
- **Risk:** **Low–Medium** (sparkline data plumbing).
- **Expected UX impact:** **High** — "what changed?" on every KPI; vanity → signal.
- **Must remain unchanged:** hero, lede, the 5 breakdown cards (until their phases), empty state,
  the demoted metrics' *values* (same numbers, just relocated/restyled).

---

## Phase D — Sources card *(triad slot 1; introduces the triad container)*

- **Goal:** promote Top referrers into the triad as **Top sources** with **favicons** + share bars.
- **Scope:** `SourceRow` (favicon/glyph + label + share bar + tabular value, with broken-favicon
  fallback to a monogram), `SourcesCard`, and the **triad grid container** (filled by D/E/F). Data
  exists (`getTopReferrers`); "Direct" gets a glyph. **Resolve open decision D1 (favicon privacy)
  before building.**
- **Components:** `SourceRow`, `SourcesCard` (new), triad grid. **Files:** new
  `components/dashboard/source-row.tsx`, `sources-card.tsx`; `page.tsx` (add triad grid + slot 1).
- **Dependencies:** Phase 0 (`faviconSource`).
- **Verification:** favicons load with graceful fallback; Direct glyph; counts match the old
  referrers card; no layout shift on favicon load.
- **Risk:** **Low** (favicon fetch + fallback is the only new concern).
- **Expected UX impact:** **Medium–High** — Q2 becomes a headline with the premium favicon cue.
- **Must remain unchanged:** the *other* 4 breakdown cards (pages/countries/devices/browsers stay
  in the old grid until G/H); during this phase the page **transitionally** shows Sources in the
  triad **and** the old grid minus referrers — acceptable, always functional.

---

## Phase E — Funnel card *(triad slot 2; lights up Lede + nothing else)*

- **Goal:** surface the **primary funnel** (conversion % + compact step bars) in the triad; append
  the **funnel clause** to the Lede.
- **Scope:** `FunnelMini` (compact step chart + overall %); pick the **primary funnel** = the
  project's first/oldest funnel (open decision E1 on selection); reuse `listFunnels` +
  `getFunnelResults`. **No-funnel state** → a "Create your first funnel" CTA card (smart-suggest
  from top paths, copy only). Extend `buildLede` with the funnel clause.
- **Components:** `FunnelMini` (new). **Files:** new `components/dashboard/funnel-mini.tsx`;
  `server/queries/funnels.ts` (**add** a small `getPrimaryFunnelResults` helper — additive);
  `lib/lede.ts` (funnel clause); `page.tsx` (triad slot 2).
- **Dependencies:** D (triad container), B (Lede clause interface), existing funnel queries.
- **Verification:** numbers match the **Funnels tab** for the same window (seed the [5,2,1]
  scenario); no-funnel CTA renders; Lede funnel clause appears/omits correctly.
- **Risk:** **Low–Medium** (defining "primary funnel").
- **Expected UX impact:** **High** — Q5 answerable on the Overview.
- **Must remain unchanged:** the Funnels tab/page, `computeFunnel`, the [5,2,1] test.

---

## Phase F — Revenue card *(triad slot 3; lights up Lede clause + Revenue KPI)*

- **Goal:** surface **revenue-by-source** in the triad; append the **revenue clause** to the Lede;
  light up the **Revenue KPI** placed in C.
- **Scope:** `RevenueMini` (ranked sources by amount + total); reuse revenue queries + integration
  status (connected?). **Not-connected state** → a quiet connect CTA (copy only). Extend
  `buildLede` with the money clause; wire the C Revenue KPI to real data.
- **Components:** `RevenueMini` (new). **Files:** new `components/dashboard/revenue-mini.tsx`;
  `server/queries/revenue.ts` + `integrations.ts` (status read — additive); `lib/lede.ts` (money
  clause); `page.tsx` (triad slot 3); `stat-card` wiring for the Revenue KPI.
- **Dependencies:** D (triad), B (Lede), C (KPI slot), existing revenue queries.
- **Verification:** matches the **Revenue tab**; not-connected CTA; currency formatting; Lede money
  clause appears only when revenue exists.
- **Risk:** **Low–Medium.**
- **Expected UX impact:** **High** — Q6 answerable; money on the home.
- **Must remain unchanged:** the Revenue tab/page, the PayPal webhook + billing logic.

---

## Phase G — Audience card

- **Goal:** **merge** Countries + Devices + Browsers (3 cards) into **one** Audience card with a
  segmented control; **flags** for countries, **glyphs** for devices/browsers.
- **Scope:** `AudienceCard` + a small `SegmentedControl` (client) toggling the three datasets;
  reuse existing `getCountries/getDevices/getBrowsers`; `flagEmoji` from Phase 0; reuse `SourceRow`.
- **Components:** `AudienceCard`, `SegmentedControl` (new). **Files:** new
  `components/dashboard/audience-card.tsx`, `segmented-control.tsx`; `page.tsx` (replace 3 cards
  with 1).
- **Dependencies:** Phase 0 (`flagEmoji`), D (`SourceRow`).
- **Verification:** control switches cleanly; flags correct for ISO codes (incl. fallback for
  unknown); device/browser counts match the old cards.
- **Risk:** **Low.**
- **Expected UX impact:** **Medium** — declutter (5 breakdown cards → fewer) + premium flags/glyphs.
- **Must remain unchanged:** the underlying breakdown queries/values.

---

## Phase H — Top pages and diagnostics

- **Goal:** finalize the **detail row** — Top pages (demoted, `SourceRow` styling) beside Audience;
  place the **Engagement diagnostics** line (bounce / pages-per-session / duration) exactly per spec.
- **Scope:** reuse `SourceRow` for Top pages; finalize the demoted Engagement line introduced in C;
  lay out the detail row (Top pages + Audience side by side, quieter type).
- **Components:** reuse `SourceRow`; optional `TopPagesCard`. **Files:** `page.tsx` (detail-row
  layout), optional new `top-pages-card.tsx`.
- **Dependencies:** C (engagement line), D (`SourceRow`), G (Audience pairing).
- **Verification:** detail-row layout at all widths; numbers match; demoted styling reads quieter
  than the triad.
- **Risk:** **Low.**
- **Expected UX impact:** **Low–Medium** — tidies the footnotes; reinforces hierarchy.
- **Must remain unchanged:** the breakdown queries.

---

## Phase I — Mobile layout

- **Goal:** implement the responsive spec (§10): single column, order Lede → Hero (shorter) →
  KPI 2×2 → Funnel → Sources → Revenue → Top pages → Audience; correct chart heights; tap targets.
- **Scope:** responsive utility classes across the assembled sections; `TrendChart`/`Sparkline`
  height variants; ensure the triad stacks and KPIs go 2×2.
- **Components:** all (responsive props only). **Files:** `page.tsx` + the section components.
- **Dependencies:** A–H assembled.
- **Verification:** 375 / 390 / 768 / 1024 / 1440 widths; no horizontal overflow; tap targets
  ≥ 40px; chart legible at small heights; above-the-fold = Lede + Hero + KPIs.
- **Risk:** **Low** (CSS only) but easy to regress — verify each width.
- **Expected UX impact:** **High** for mobile users.
- **Must remain unchanged:** desktop layout and behavior.

---

## Phase J — Cleanup and hierarchy polish

- **Goal:** remove transitional remnants, retire dead components, and do the final coherence pass
  (one card spec, one number spec, spacing rhythm, the focused single empty state, a11y).
- **Scope:** delete now-unused paths (the old 6 `MetricCard`s, the old 5-card breakdown grid, the
  `BarChart` import on overview, the redundant "Overview" `<h2>`, the bare min/max date labels);
  **retire `MetricCard`** if nothing else imports it (grep first); replace the empty state with the
  single focused "Waiting for your first pageview" panel (spec §7); enforce tabular-nums + focus
  states + contrast.
- **Components:** remove `MetricCard` (if unused); finalize spacing. **Files:** `page.tsx`,
  `components/dashboard/metric-card.tsx` (retire), any leftover.
- **Dependencies:** all prior phases.
- **Verification:** `grep` confirms no remaining `MetricCard`/old-grid imports; lint shows no dead
  code; full visual QA against `OVERVIEW-SPEC.md` §3 wireframe + §13 success criteria (the
  10-second test, an obvious protagonist, "what changed" answerable); a11y pass; all tests green.
- **Risk:** **Low–Medium** (deletions — grep every removal first).
- **Expected UX impact:** the final "feels designed" coherence.
- **Must remain unchanged:** all other pages; the analytics queries; the test suite (only added to).

---

## Cross-phase "must remain unchanged" (global invariants)

- Existing query **signatures + behavior** (`getProjectAnalytics`, `getOverviewMetrics`,
  `getTimeseries`, funnel/revenue/integration queries) — we only **add** helpers.
- The **Events / Funnels / Revenue / Reports / Settings** pages and `ProjectHeader` tabs.
- `BarChart` (still used outside the Overview), ingestion/`/api/collect`, webhook + billing logic.
- The existing **48-test** suite — extended, never weakened.
- No DB schema change; live `DataFast` data untouched; seed-and-delete discipline throughout.

---

## Open design decisions to resolve before the relevant phase

- **D1 — Favicon source (privacy).** OneMetric is **privacy-first/cookieless**. Proxying every
  referrer domain to Google/DuckDuckGo's favicon service leaks visited domains to a third party
  and adds external requests — off-brand. Options: (a) self-host a cached favicon proxy, (b) a
  privacy-respecting source, (c) **monogram/letter avatars, no third party** (simplest, fully
  private). **Recommendation: (c) for v1**, revisit later. *Decide before Phase D.*
- **E1 — "Primary funnel" selection.** For now: the project's **first/oldest** funnel (no schema
  change). Later, a "pin to overview" boolean (a small migration) if users want control. *Decide
  before Phase E.*
- **C1 — Sparkline data.** Visitors/pageviews series exist; sessions/revenue/conversion need new
  per-day series. Ship sparklines for the available metrics first; add the rest with E/F. *Confirm
  scope before Phase C.*
- **Accent color** (one signature) is **Move #3**, not Move #1 — this plan stays monochrome and
  only establishes hierarchy/narrative/emphasis. Deltas use semantic green/red regardless.

---

## Suggested PR sequence (one per phase)

`0 Foundations → A Hero → B Lede → C KPI strip → D Sources → E Funnel → F Revenue →
G Audience → H Top pages + diagnostics → I Mobile → J Cleanup & polish.`

Each PR: small, single-concern, DoD met, "unchanged" checklist re-verified. **After Phase J**, the
Overview matches `OVERVIEW-SPEC.md` and passes its §13 success criteria — reached through ~11 small,
reversible steps rather than one rewrite.

> **Stop here. Await approval before implementing Phase 0.**
