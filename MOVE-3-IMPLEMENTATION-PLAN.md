# Move #3 — Incremental Implementation Plan ("One signature")

> Turns `MOVE-3-SPEC.md` into a build strategy. **Planning artifact only — no code, no
> implementation.** Optimized for **small, low-risk, reviewable, additive** steps — never a big-bang
> recolor. Source of truth this plan serves: `MOVE-3-SPEC.md`, `DESIGN-AUDIT.md`, `DESIGN-SYSTEM.md`,
> `AGENT-RULES.md`.
>
> Scope: introduce the single signature **accent** + the final **craft** (one card/number/chart spec,
> a logomark, identity marks). Moves #1 and #2 are complete and **must not change behavior**.

---

## Engineering principles (apply to every phase)

1. **Additive, never destructive.** The accent is layered onto the existing neutral tokens; the UI
   must still read correctly if an accent token were removed (graceful monochrome fallback). One
   surface adopts the accent per phase. `main` stays shippable after every phase.
2. **Restraint is the feature.** Each phase adds the accent to *one* semantic zone (data / active /
   action / links) and **nowhere else**. The spec §5 "used vs NOT" table is binding; over-application
   is a review failure, not a nice-to-have.
3. **One phase = one reviewable PR.** Small diff, single concern. Identical Definition of Done below.
4. **No new dependency.** CSS tokens + Tailwind theme + existing shadcn components + hand-built SVG.
   Any proposed dependency is **flagged for approval**, not added.
5. **No schema changes, no new queries, no data changes.** Move #3 is colour + craft only.
6. **Dark-first, AA-correct.** Tune on the dark surface; define + AA-verify the light value too. Every
   accent use that carries meaning meets WCAG AA, and colour is never the only signal.
7. **Server-first preserved.** Colour is CSS; the logomark is a static SVG. No new client components
   are required.

### Definition of Done (every phase)
- `typecheck · lint · test · build` all green (the 83-test suite extended, never weakened).
- The accent appears **only** where the spec sanctions it (grep/visual check — no stray `bg-brand`).
- **WCAG AA re-verified** for any accent text/icon/button added this phase (dark + light).
- **"What must remain unchanged"** checklist (per phase) re-verified: Move #1 hierarchy/narrative/data
  + Move #2 motion/feel identical; deltas stay semantic green/red; other pages unaffected unless the
  phase explicitly touches them.
- A before/after screenshot (desktop + mobile) where there is a visual change.

---

## Why this order (rationale)

- **Foundations (Phase 0) first** — every later phase consumes the same accent token(s); define them
  once, AA-verify, and apply nothing yet (the Move #1/#2 "Phase 0" pattern → zero visual change).
- **Hero data series (A)** next — the single highest-value, most-visible accent moment ("this is the
  data"); derisk the accent on the protagonist before spreading it.
- **Active states (B)** then **primary action + links (C)** — pervasive but small, semantic touches.
- **Spec unification (D)** — the craft/"one system" work (MetricCard/ONE-46) on the detail pages;
  larger surface, lower colour-risk, so after the accent is settled.
- **Logomark + favicon (E)** — the identity marks, once the colour exists to build them from.
- **Coherence + contrast + a11y (F)** last — the final pass that reconciles the success criteria.

---

## Phase 0 — Accent token foundations *(prerequisite; zero visual change)*
- **Goal:** define the signature accent token(s) + utilities, AA-verified, consumed by all later
  phases — so no phase re-picks a colour.
- **Scope:** add `--brand` / `--brand-foreground` (+ optional `--brand-muted` / `--brand-text`) to
  `globals.css` for **dark and light** (oklch ~285 hue per spec §4.2); map them in `@theme inline` to
  `bg-brand` / `text-brand` / `border-brand` / `ring-brand` / `from-brand` utilities. **Tune the exact
  oklch on the real dark surface and verify WCAG AA** (button text, accent-text-on-bg, focus ring).
  Decide final token names + whether `--ring` adopts the accent hue. **Apply to nothing yet.**
- **Files:** `globals.css`; optionally a throwaway swatch in a doc/storybook-less review note.
  **No component/page change.**
- **Dependencies:** none. **Risk:** **Very low** (additive tokens, zero application).
- **What must remain unchanged:** every rendered surface (no token is consumed yet) — exactly like the
  Move #1/#2 Phase 0s.
- **Verification:** tokens resolve; AA contrast checked + recorded; grep confirms no component uses
  `*-brand` yet; build green.

## Phase A — Hero data series accent *(the flagship)*
- **Goal:** the Overview hero `TrendChart` current-period line + gradient fill adopt the accent — "this
  is the data."
- **Scope:** `TrendChart` value line `stroke-foreground → stroke-brand`; the area fill `fill-foreground/10
  → from-brand/…` (accent → transparent gradient). The **previous-period ghost line stays neutral/muted**
  (comparison ≠ protagonist). Decide sparkline treatment (lean **neutral** for restraint, or a very
  subtle accent — document the call). Keep correct scaling, the branded tooltip, the Phase-D (Move #2)
  draw-in, `non-scaling-stroke`.
- **Files:** `components/charts/trend-chart.tsx` (+ maybe `sparkline.tsx`); `globals.css` if a gradient
  helper is needed.
- **Dependencies:** Phase 0. **Risk:** **Low–Medium** (the most visible change; AA/visibility of the
  series on dark). *Mitigation:* it's one component; `BarChart` untouched; the series colour is
  distinguishable by design.
- **What must remain unchanged:** chart scaling/tooltip/comparison-line/draw-in; the hero *number* +
  delta stay neutral; `BarChart` + other pages.
- **Verification:** the line/gradient read as the accent on dark + light; tooltip + draw-in still work;
  visual at desktop + mobile.

## Phase B — Active / selected states
- **Goal:** the accent marks "the current/selected thing."
- **Scope:** the active **section-tab** underline (`TabNav`: active `border-foreground → border-brand`,
  optionally `text-brand`); the active **range** value + active **segmented-control** segment
  (`AudienceCard`) adopt the accent for their selected state. One active indicator per control. Keep
  the Move #2 optimistic behaviour (`pendingKey`, transitions) intact — only the *active colour*
  changes. `TabNav` is shared by 6 pages → re-verify all six.
- **Files:** `components/dashboard/tab-nav.tsx`, `audience-card.tsx`, possibly `overview-shell.tsx`.
- **Dependencies:** Phase 0. **Risk:** **Low–Medium** (shared `TabNav` → 6 pages). *Mitigation:* only
  the active styling changes; default/hover/focus untouched.
- **What must remain unchanged:** Move #2 optimistic switching + pending hint; non-active styling;
  focus-visible; all 6 pages' nav behaviour + destinations.
- **Verification:** active tab/segment reads accent on all 6 pages; optimistic flip still instant;
  AA on the active text/underline.

## Phase C — Primary action + Lede drill-link hover + focus ring
- **Goal:** the accent marks the *one* primary action, the data-noun links on hover, and (optionally)
  keyboard focus.
- **Scope:** the shadcn `Button` **`default` variant** → accent (`bg-brand text-brand-foreground
  hover:bg-brand/90`); **secondary/outline/ghost/link stay neutral**. The Lede drill-links tint to the
  accent **on hover/focus only** (`lede.tsx`). Optionally `--ring` adopts the accent hue (focus reads
  "ours"). `Button` is shared app-wide → audit every call site so only *primary* CTAs change (the rest
  already use non-default variants).
- **Files:** `components/ui/button.tsx` (default variant), `components/dashboard/lede.tsx`, `globals.css`
  (ring). **Audit** Button usages first.
- **Dependencies:** Phase 0. **Risk:** **Medium** (Button is shared; changing the default variant
  recolours every default Button). *Mitigation:* grep all Button usages; confirm only primary CTAs use
  `default`; demote any that shouldn't be accent to `secondary/outline` (additive, careful).
- **What must remain unchanged:** non-primary buttons; destructive variant (stays red); the Lede at
  rest (foreground); link destinations; focus-visible behaviour.
- **Verification:** only primary CTAs are accent; Lede links tint on hover only; AA for button text +
  focus ring; no surprise accent buttons (grep + visual).

## Phase D — Card / number / chart spec unification (craft; ONE-46)
- **Goal:** one card spec, one number spec, one chart language on **every** page — retire the last
  `MetricCard` drift.
- **Scope:** unify `MetricCard` onto the `StatCard`/`rounded-xl` + `tabular-nums` spec (restyle
  `MetricCard` in place — simplest, all 3 detail pages inherit — or replace usages with `StatCard`),
  then retire/alias it (grep-confirm). Ensure `tabular-nums` on every metric on the **Events-detail /
  Funnels-detail / Revenue** pages. Resolve the `BarChart` chart-language drift (fix its scaling to
  match `TrendChart`'s quality, or migrate its consumers — decide + document). **(Tracked: ONE-46.)**
- **Files:** `components/dashboard/metric-card.tsx`; the 3 detail pages; possibly `bar-chart` +
  consumers. **No data/query change.**
- **Dependencies:** none on the accent (pure craft) — can run independent of A–C if preferred; placed
  here so the accent is settled first.
- **Risk:** **Low–Medium** (touches 3 detail pages; grep before retiring `MetricCard`).
- **What must remain unchanged:** the detail pages' data + numbers (identical values, restyled only);
  the analytics queries; the Overview (already unified).
- **Verification:** grep shows no `rounded-lg` card / no `MetricCard` drift remains; the 3 pages match
  the `rounded-xl` + tabular spec; numbers identical; build green.

## Phase E — Logomark + favicon / identity
- **Goal:** the product has a quiet face.
- **Scope:** a hand-built **SVG logomark** (monogram/geometric mark in `--brand` + neutrals) component
  for the app top bar + marketing header (replacing wordmark-only). Derive the **favicon** + refresh
  `opengraph-image` from it. Keep it tiny, dependency-free, scalable; degrade to the wordmark where a
  mark doesn't fit.
- **Files:** new `components/brand/logomark.tsx` (or similar); the app bar + marketing header; the
  favicon/`opengraph-image` route(s).
- **Dependencies:** Phase 0 (the accent the mark uses). **Risk:** **Low** (additive identity asset).
- **What must remain unchanged:** navigation behaviour; the marketing/app layouts (mark slots into the
  existing logo position).
- **Verification:** the mark renders crisply at small + large sizes, dark + light; favicon shows in the
  tab; opengraph renders; no layout shift.

## Phase F — Coherence, contrast & accessibility pass *(the final pass)*
- **Goal:** the accent + craft read as **one designed system**; every accent use is AA; the success
  criteria (`MOVE-3-SPEC.md` §8) are reconciled and ticked off.
- **Scope:** a holistic sweep — confirm the accent appears *only* in the sanctioned zones (no creep);
  one card/number/chart spec everywhere; **full WCAG-AA contrast audit** (dark + light, every accent
  text/icon/button/ring); confirm the accent is never the sole signal; final spacing/optical polish;
  update `DESIGN-SYSTEM.md` (accent shipped) + `DESIGN-AUDIT.md` scorecard (colour/identity → done).
- **Files:** small touch-ups across the Move #3 surfaces; `DESIGN-SYSTEM.md`, `DESIGN-AUDIT.md`.
- **Dependencies:** all prior phases. **Risk:** **Low.**
- **What must remain unchanged:** all behaviour; data; other pages; Move #1/#2.
- **Verification:** the §8 success criteria each pass; AA audit recorded; grep confirms no accent
  overuse; all green.

---

## Cross-phase "must remain unchanged" (global invariants)
- **All Move #1 behaviour** (Overview hierarchy/narrative/data, the 10-second test) and **all Move #2
  behaviour** (skeleton, optimistic range + section switching, count-up, chart draw-in, hover/press,
  view transitions, reduced-motion) — identical.
- **Deltas stay semantic** green/red/muted — *never* the accent. The live/"Active now" dot stays
  emerald (a distinct *live* semantic).
- **No schema/query/data change;** the Events/Funnels/Revenue/Reports/Settings *data* unchanged
  (Phase D restyles only).
- **No new dependency;** server-first; dark-first; the 83-test suite extended, never weakened.
- **`main` always shippable;** strictly additive; monochrome remains the base, the accent the seasoning.

## Open design decisions to resolve before the relevant phase
- **Accent exact oklch + names (Phase 0).** Proposed `oklch(0.62 0.19 285)` dark / `oklch(0.52 0.20 285)`
  light; **must be tuned visually + AA-verified**. Decide `--brand` vs reusing/renaming; decide if
  `--ring` adopts the hue.
- **Sparkline accent (Phase A).** Subtle accent vs neutral — recommend **neutral** for restraint;
  decide.
- **`Button` default variant (Phase C).** Confirm every primary CTA *should* be accent; demote any
  non-primary `default` Buttons to `secondary/outline` first (grep audit).
- **`BarChart` (Phase D).** Fix its scaling to the `TrendChart` standard, or migrate its consumers —
  decide based on effort vs the remaining consumers (marketing + event-detail).
- **Logomark form (Phase E).** Monogram "O"/"1" vs geometric mark — design call; keep it tiny + SVG.

## Suggested PR sequence (one per phase)
`0 Accent foundations → A Hero series → B Active states → C Primary action + links →
D Spec unification (ONE-46) → E Logomark + favicon → F Coherence + contrast + a11y.`

Each PR: small, single-concern, DoD met, "unchanged" checklist + **AA** re-verified. **After Phase F**,
OneMetric has one restrained signature, one system end-to-end, and a quiet face — reached through ~7
small, reversible steps, with Moves #1 and #2 untouched.

> **Stop here. Await approval of `MOVE-3-SPEC.md` + this plan before implementing Phase 0.**
