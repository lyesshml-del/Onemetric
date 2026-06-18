# Move #2 — Incremental Implementation Plan ("Instant + Alive")

> Turns `MOVE-2-SPEC.md` into a build strategy. **Planning artifact only — no code, no
> implementation.** Written as a principal engineer + principal designer pair would: optimized for
> **small, low-risk, reviewable, reduced-motion-safe** steps — never a big-bang motion rewrite.
>
> Source of truth this plan serves: `MOVE-2-SPEC.md`, `DESIGN-AUDIT.md`, `DESIGN-SYSTEM.md`,
> `ENGINEERING-STANDARDS.md`. Scope is the dashboard's **feel** (Overview + range/section
> navigation) plus shared motion primitives. **The philosophy in `MOVE-2-SPEC.md` is mandatory; the
> exact mechanism of any phase may evolve if a cleaner, dependency-free approach is found** — but a
> change in approach is itself a decision to record, not a license to add scope or dependencies.

---

## Engineering principles (apply to every phase)

1. **Additive, never destructive.** Each capability is layered on; removing it returns to today's
   correct (if static) behavior. `main` stays shippable after every phase.
2. **Server-first is preserved.** The page stays an RSC; new client components are **tiny leaves**
   (optimistic control, count-up number, draw-in wrapper). **No client data/state library.**
3. **One phase = one reviewable PR.** Small diff, single concern, easy to read and revert.
4. **Reduced-motion is part of every phase's Definition of Done** — not deferred to the end. A phase
   isn't done until its motion is fully disabled under `prefers-reduced-motion`.
5. **Pure logic is unit-tested.** `useCountUp` math (and any easing/interpolation helper) are pure
   and tested; they extend the existing 75-test suite (never weaken it).
6. **No new dependency.** CSS + native View Transitions API + tiny hooks. A proposed dependency must
   be **justified, flagged for approval, and left unadded** (per `MOVE-2-SPEC.md` §8).
7. **No new data/queries/schema, no visual redesign.** Move #1 decided *what* is shown; Move #2 only
   changes how it *feels*. Monochrome throughout (accent = Move #3).

### Definition of Done (every phase)
- `typecheck · lint · test · build` all green; new pure logic has unit tests.
- **Reduced-motion verified:** with `prefers-reduced-motion: reduce`, the phase's motion is fully
  off and all information is present instantly.
- **No server-first regression:** the page stays RSC; any new client component is a small leaf; the
  route JS in `next build` is checked (no meaningful bloat).
- **No new dependency**; **Move #1 visuals + all data identical**; "what must remain unchanged"
  re-verified.
- Before/after at desktop **and** mobile (and a reduced-motion pass). Docs updated; one local commit.

---

## Why this order (rationale)

Build the **shared motion system first** (so nothing invents its own timings or reduced-motion
logic), then land the **highest-leverage perceived-speed wins** (skeletons → optimistic switching),
then the **"alive" touches** (count-up → draw-in → hover/press), then the **most
support-dependent** piece (view transitions), and finish with a **coherence + a11y + perf pass**.
Feel-of-speed (skeletons/optimism) outranks delight (count-up/draw-in), which outranks the riskiest
enhancement (view transitions).

---

## Phase 0 — Motion foundations *(prerequisite; nothing user-visible)*
- **Goal:** the shared motion system + the reduced-motion gate + the pure hooks/primitives, built
  **once**, so no later phase duplicates durations/easing or re-solves reduced-motion.
- **Scope:**
  - **Motion tokens** (durations + the single ease-out) as CSS variables / Tailwind theme in
    `globals.css` (`MOVE-2-SPEC.md` §5).
  - **Reduced-motion strategy** — prefer a **CSS-first** approach (`@media (prefers-reduced-motion)`)
    + a small `useReducedMotion()` hook only where JS needs it (e.g. count-up). *Decide and document.*
  - **`useCountUp`** pure hook (rAF, respects reduced-motion → final value) + **unit tests**.
  - **`<Skeleton>`** primitive (shape blocks; shimmer keyframe that disables under reduced-motion).
  - **CSS keyframes** for shimmer + chart draw-in (defined, not yet applied).
  - Document the motion system in `DESIGN-SYSTEM.md` ("Motion philosophy" → from "target" to
    "in progress").
- **Files:** `globals.css` (tokens/keyframes), `lib/hooks/*` (`useCountUp`, `useReducedMotion`),
  `components/ui/skeleton.tsx`, tests. **No page change.**
- **Dependencies:** none. **Risk:** very low (pure additions, zero visible change).
- **Must remain unchanged:** everything visible; the page stays untouched.

## Phase A — Skeletons / loading states
- **Goal:** **no blank flash** — a route-level skeleton that mirrors the Overview.
- **Scope:** `app/dashboard/[projectId]/loading.tsx` (and/or Suspense boundaries) rendering the
  `Skeleton` layout — Lede line, hero chart block, four KPI placeholders, three triad blocks, two
  detail blocks — at the **real components' dimensions** (zero layout shift). Static under
  reduced-motion. (Implements `OVERVIEW-SPEC.md` §7, designed in Move #1.)
- **Dependencies:** Phase 0. **Risk:** low. **UX impact:** high (the "never blank" win).
- **Must remain unchanged:** the loaded Overview; the data; other pages (Overview-first — their
  skeletons are an optional later increment, not a regression).

## Phase B — Optimistic range + section switching *(highest-leverage)*
- **Goal:** range and tab changes **feel instant**.
- **Scope:** wrap the existing navigation in **`useTransition`** so the active state flips
  immediately and a **pending visual** (the Phase-A skeleton or a subtle dim, with `aria-busy`)
  shows while the server re-renders; **preserve scroll** (no jump to top).
  - **B1 — Range** (Overview's `RangeSelect`).
  - **B2 — Section tabs** (the shared `ProjectHeader`) — *feel-only, additive*; touches a shared
    component, so it is a deliberate, separately-reviewable sub-step.
- **Dependencies:** Phase 0; pairs with A (skeleton = the pending visual). **Risk:** low–medium
  (navigation/scroll/focus behavior). **UX impact:** highest — "fast website" → "app."
- **Must remain unchanged:** the URL/range semantics, the data, server-first (no refetch library);
  other pages keep working (B2 only adds pending feel to the tabs).

## Phase C — Number count-up
- **Goal:** the hero metric + KPI values **animate up once** on arrival.
- **Scope:** a small `CountUp` client wrapper using `useCountUp`; apply to the hero number and
  `StatCard` values; **`tabular-nums`** (no width jitter); reduced-motion / no-JS → **final value
  instantly**.
- **Dependencies:** Phase 0 (`useCountUp`). **Risk:** low. **UX impact:** medium–high (the "alive"
  feel).
- **Must remain unchanged:** the values themselves (final == current); tabular alignment; the
  Delta/Sparkline.

## Phase D — Chart draw-in
- **Goal:** the hero `TrendChart` + `Sparkline`s **draw in once** on mount.
- **Scope:** CSS draw-in (animated `stroke-dashoffset` and/or area fade), ~500–700ms, **once**;
  reduced-motion → static. The hover tooltip, crosshair, comparison line, and **correct scaling**
  are untouched.
- **Dependencies:** Phase 0. **Risk:** low. **UX impact:** medium.
- **Must remain unchanged:** chart correctness/scaling/tooltip; `BarChart` (other pages).

## Phase E — Hover & press micro-interactions
- **Goal:** subtle, tactile feedback on interactive surfaces.
- **Scope:** hover tint/lift on interactive cards/rows; press/active feedback on buttons + the
  segmented control; one consistent set of transition tokens. Mostly **color/opacity**
  (reduced-motion safe); any `transform` gated. `focus-visible` rings preserved.
- **Dependencies:** Phase 0. **Risk:** low. **UX impact:** medium (polish).
- **Must remain unchanged:** layouts; focus states; the Move #1 visuals.

## Phase F — Route / view transitions *(most support-dependent)*
- **Goal:** cross-section changes feel like an app, not a page reload.
- **Scope:** a ~150–200ms cross-fade on tab/range navigation via the **native View Transitions
  API**, as **progressive enhancement** — unsupported browsers or reduced-motion → **instant**
  (today's behavior). **Decide the mechanism** at this phase (native `startViewTransition` vs Next's
  experimental `ViewTransition`); **neither is an npm dependency**, but if the experimental Next
  surface is used, **flag it for approval** (it's an unstable API, not a package).
- **Dependencies:** A/B (navigation), Phase 0 (reduced-motion). **Risk:** medium (browser support +
  Next integration) — mitigated by strict progressive enhancement. **UX impact:** high.
- **Must remain unchanged:** server navigation correctness; no SPA/client-data layer; full function
  without the API.

## Phase G — Polish, reduced-motion & a11y pass *(the coherence pass)*
- **Goal:** tune timings into one coherent system; full reduced-motion audit; a11y + perf pass.
- **Scope:** harmonize all durations/easings to the Phase-0 tokens; verify **every** capability
  degrades correctly under `prefers-reduced-motion`; a11y (`aria-busy`, focus across transitions,
  no lost outlines); perf (60fps, no INP regression, route-bundle check); flip `DESIGN-SYSTEM.md`
  motion section to "shipped."
- **Dependencies:** all prior phases. **Risk:** low–medium. **UX impact:** the final "feels
  designed" coherence.
- **Must remain unchanged:** all other pages; the analytics queries; the test suite (only added to).

---

## Cross-phase "must remain unchanged" (global invariants)
- **Server-first**: RSC + server actions; **no client data/state library**; the page stays a server
  component (client leaves only).
- **No animation library / no new dependency** (CSS + View Transitions API + tiny hooks).
- **No schema/query/data change**; **Move #1 visuals + all data identical**; monochrome (accent =
  Move #3).
- The **Events / Funnels / Revenue / Reports / Settings / Billing** pages — content + data unchanged
  (they may *inherit* global skeleton/transition feel; nothing about their structure changes).
- `BarChart`, ingestion/`/api/collect`, webhooks + billing — untouched.
- The existing **75-test** suite — extended, never weakened.

---

## Dependencies to flag (none required)
- **No npm dependency is planned.** Everything is CSS, the native View Transitions API, and ~2 tiny
  pure hooks.
- The only "flag for approval" item is **Phase F's mechanism** *if* it uses Next's **experimental**
  `ViewTransition` surface (an unstable API, not a package) — to be raised at Phase F, with the
  native API as the dependency-free default.
- Per `MOVE-2-SPEC.md` §8: any proposed library must be **justified, flagged, and left unadded**.

---

## Open decisions to resolve before the relevant phase
- **Phase 0 — reduced-motion strategy:** CSS-first (`@media`) vs a JS `useReducedMotion()` hook.
  *Recommendation: CSS-first for pure-CSS motions; the hook only where JS must branch (count-up).*
- **Phase B — section-tab scope (B2):** whether optimistic feel extends to the shared
  `ProjectHeader` tabs now, or range-only first. *Recommendation: range first (B1), tabs as B2.*
- **Phase F — view-transition mechanism:** native API vs Next experimental (flag if experimental).
- **Cross-page feel:** whether skeletons/transitions extend to non-Overview pages. *Recommendation:
  Overview-first; other pages are a later optional increment (keeps scope tight, no regression).*

---

## Suggested PR sequence (one per phase)
`0 Motion foundations → A Skeletons → B Optimistic range/section → C Count-up → D Chart draw-in →
E Hover/press → F View transitions → G Polish & a11y.`

Each PR: small, single-concern, DoD met (incl. the reduced-motion check), "unchanged" checklist
re-verified. **After Phase G**, the app *feels* instant and alive — reached through ~8 small,
reversible, dependency-free, reduced-motion-safe steps rather than one motion rewrite.

> **Stop here. Await approval of `MOVE-2-SPEC.md` + this plan before implementing Phase 0.**
