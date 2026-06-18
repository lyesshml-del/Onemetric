# Move #2 — Design Specification ("Instant + Alive": Feel & Performance)

> Design source of truth for Move #2, alongside `DESIGN-AUDIT.md`, `DESIGN-SYSTEM.md`,
> `ENGINEERING-STANDARDS.md`, `DECISIONS.md`. **This is a design spec only — no code, no
> implementation.** It defines *what* the product should feel like and *why*. The phased build is
> `MOVE-2-IMPLEMENTATION-PLAN.md` (also planning-only). Implementation is a separate, approved step.
>
> Scope: the **perceived speed + motion** of the app — primarily the per-project dashboard
> (Overview + range/section navigation), with shared motion primitives. **No new content, no new
> data, no layout redesign** — Move #1 already decided *what* is shown; Move #2 decides how it
> *feels* to use. When this file and the code disagree, the code wins — then update this file.

---

## 1. The opinion (the soul of this Move)

**Speed is a feeling, not a benchmark.**

OneMetric is already fast — server-first, tiny bundles, fast TTFB. But it *feels* like a website:
every range change and every tab switch is a full server navigation with **no acknowledgement** —
the page just freezes for a beat, then repaints from the top. Linear feels instant not because it
is technically faster, but because it **responds immediately**, **never blanks**, and **moves with
restraint**. Move #2 closes exactly that gap.

The thesis (from `DESIGN-AUDIT.md` move #2): *"Make it feel instant + alive — optimistic
range/section changes, view transitions, skeletons, count-up, a chart that draws. Linear is loved
for feel, not features."* We add a **perception layer** on top of the existing server-first
architecture — we do **not** rebuild it into a client-side SPA.

Three non-negotiable principles:

1. **Instant feedback.** Every interaction is acknowledged within ~100ms — an active state, a
   skeleton, a pending dim — *before* the data arrives. Never a frozen wait then a jump.
2. **Never blank.** No blank-then-pop. Loading states are **skeletons that mirror the final
   layout** (the shape is already on screen; data fills it in). Zero layout shift.
3. **Restraint.** Apple-grade motion: ~150–250ms, one easing, motion that signals **causality**
   (this action caused that change), **never decorative, never blocking input.**

Voice of the motion: **calm and confident** — the same as the visual design. The product should
feel like a precise instrument responding to you, not a site loading pages.

---

## 2. The "feel test" (how we'll know it worked)

Analogous to Move #1's 10-second test. After Move #2, a first-time user should notice:

| # | Interaction | Expected feel |
|---|---|---|
| 1 | Change the range (7d → 30d) | The control responds instantly; content transitions with **no white flash**; **scroll is preserved**. |
| 2 | Switch sections (Overview → Funnels) | A quick cross-fade, not a "page reload." |
| 3 | First load (or slow network) | A **skeleton in the exact final shape** appears immediately, then fills — never a blank screen or spinner. |
| 4 | The Overview appears | Numbers **count up once**; the hero chart **draws in once** — then it's still. |
| 5 | Hover a card / press a control | Subtle, tactile feedback (a tint, a 1px lift, a press). |
| 6 | `prefers-reduced-motion` is on | **All the same information, instantly, with zero motion** — and nothing is broken or missing. |

If any interaction freezes, flashes white, blanks, or animates gratuitously, Move #2 has failed.

---

## 3. Principles

- **Perceived speed > benchmark speed.** We optimize the *feeling* of inst→response, not a number.
- **Server-first is preserved.** RSC + server actions stay; the **server remains the store**. There
  is **no** client data/state library (no React Query/Redux/SWR). "Optimistic" here means *instant
  UI acknowledgement during a server round-trip* (`useTransition` + Suspense), **not** client-side
  data mutation or caching.
- **Reduced-motion is first-class, not an afterthought.** Every motion has a static fallback; a
  `prefers-reduced-motion: reduce` user gets a fully calm, instant UI with **no** animation.
- **Dependency-free.** No animation library. CSS + the native **View Transitions API** + two tiny
  pure hooks. (Same discipline as the hand-rolled charts — `DECISIONS.md` ADR-011/016.)
- **Additive + reversible.** Each capability is a small, independent enhancement; removing it
  returns to today's (correct, if static) behavior. `main` stays shippable after every phase.
- **Motion conveys causality, never information.** Numbers, deltas, and labels always carry the
  meaning; animation only reinforces *what just happened*.

---

## 4. Capability specification

### 4.1 Optimistic range + section switching — *the biggest win*
- **Range control:** on change, **immediately** reflect the new active range (the pill) and enter a
  **pending state** (the skeleton, or a subtle content dim, with `aria-busy`) while the server
  re-renders. **Preserve scroll position** — do not jump to the top.
- **Section tabs:** the same instant active-state + pending while the destination streams in.
- Mechanism (design intent): React **`useTransition`** wrapping the existing router navigation —
  `isPending` drives the pending visual. **No data refetch library**; the server still renders.
- This single capability is what turns "a fast website" into "an app."

### 4.2 Skeletons (loading states)
- A loading UI that **mirrors the Overview's final layout exactly**: a shimmer line for the Lede, a
  chart-shaped block for the hero, four KPI placeholders, three triad blocks, two detail blocks
  (per `OVERVIEW-SPEC.md` §7, which *designed* this for Move #2 to *implement*).
- Built from a shared `Skeleton` primitive reusing the real layout's dimensions → **zero layout
  shift** when content replaces it.
- **No spinners, no blank flashes.** Under `prefers-reduced-motion`: a **static** skeleton (no
  shimmer).

### 4.3 Route / view transitions
- Cross-route (tab) and range transitions get a **~150–200ms cross-fade** (or a subtle slide) via
  the **native View Transitions API**. **Progressive enhancement:** unsupported browsers or
  reduced-motion → **instant** (today's behavior), never broken.
- The transition is **decoration over correct navigation** — the server navigation is unchanged; if
  the API is unavailable nothing is lost.

### 4.4 Number count-up
- The **hero metric** and **KPI values** animate from a baseline to their final value **once** on
  first paint (and on data change), ~400–600ms, ease-out, **`tabular-nums`** so width never jitters.
- A tiny pure **`useCountUp`** hook (`requestAnimationFrame`), **unit-tested**. Under reduced-motion
  (or no JS) it shows the **final value instantly**.
- Never loops, never animates on hover — once, then still.

### 4.5 Chart draw-in
- The hero **`TrendChart`** and the **`Sparkline`s** **draw in once** on mount: the line strokes on
  (animated `stroke-dashoffset`) and/or the area gradient fades up, ~500–700ms, **once**.
- Pure **CSS** (the SVG is already hand-rolled). Under reduced-motion: rendered **statically**, no
  draw-in. The hover crosshair/tooltip and scaling are unchanged.

### 4.6 Hover / press feedback
- Subtle **hover** on interactive cards/rows (a background tint or a 1px lift) and **press/active**
  feedback on buttons + the segmented control (a slight scale or opacity dip).
- One consistent set of transition tokens. Mostly **color/opacity** (safe under reduced-motion); any
  `transform` is gated by reduced-motion. Existing `focus-visible` rings are preserved.

---

## 5. Motion system (the one ladder)

One deliberate system, defined **once** as theme tokens (CSS variables / Tailwind theme in
`globals.css`) so no component invents magic numbers:

| Role | Duration | Use |
|---|---|---|
| Micro | ~120ms | hover / press / focus feedback |
| Base | ~180ms | range/section pending, view-transition cross-fade |
| Entrance | ~500–600ms | count-up, chart draw-in (**once**) |

- **Easing:** one standard **ease-out** token (e.g. `cubic-bezier(0.22, 1, 0.36, 1)`), used
  everywhere; entrances decelerate, never bounce.
- **Rule:** enter gently, **respond instantly**, never animate in a way that delays input.
- Tokens live in the theme so Move #3 and future work inherit the same motion language.

---

## 6. Accessibility & `prefers-reduced-motion`

- **`prefers-reduced-motion: reduce` → everything calm and instant:** count-up shows the final
  value, charts render statically, route/range transitions are instant, skeletons are static (no
  shimmer), hover/press reduce to color-only. **No information is lost or delayed** — reduced-motion
  is a *complete, first-class* experience, decided in Phase 0 and audited in the final phase.
- **`aria-busy`** on regions during a pending transition; **focus is preserved/managed** across
  transitions (never trapped or dropped); the existing "Active now" live signal is unchanged.
- Motion **never** is the only carrier of meaning (numbers/deltas/labels always are).
- WCAG AA contrast and the Move #1 `focus-visible` rings are preserved; transitions must not
  suppress focus outlines.

---

## 7. Server-first architecture preservation (hard constraint)

- **RSC by default, server actions for writes — unchanged.** The page stays a server component; the
  only new client components are **small leaves**: the optimistic range control, the count-up
  number, the draw-in chart wrapper.
- **No client data/state library** is introduced (ADR-016). Optimism = `useTransition` + Suspense
  streaming, **not** client caching/mutation.
- Skeletons use Next's native streaming (`loading.tsx` / Suspense), not a client loading library.
- Bundle discipline holds: each new client leaf is tiny; watch the route JS in `next build`.

---

## 8. Dependency stance (explicit — no heavy animation library)

- **We add NO animation library** — not Framer Motion, GSAP, Lottie, react-spring, auto-animate, or
  similar. Rationale (`ENGINEERING-STANDARDS.md`, ADR-011/016): every dependency is a liability
  (bundle, security surface, lock-in), and our needs — a few restrained, native-feeling motions —
  are fully met by **CSS + the View Transitions API + ~2 tiny pure hooks**.
- If, during implementation, a motion proves genuinely impractical without a library, the rule
  (carried into the plan) is: **stop, justify it in writing, flag it for explicit approval — do not
  add it unilaterally.** The default answer is "find the CSS/native way."

---

## 9. Success criteria

1. **Instant:** range/section changes acknowledge in <~100ms, with **no white flash** and **scroll
   preserved**.
2. **Never blank:** skeletons mirror the layout; **zero layout shift** when content fills in.
3. **Alive, once:** the Overview counts up + draws in a single time on arrival — noticeable, never
   gimmicky or looping.
4. **Reduced-motion is whole:** a `prefers-reduced-motion` user gets the identical information
   instantly, with zero motion, nothing broken.
5. **Nothing regressed:** no new dependency; bundle stays small; server-first intact; **Move #1
   visuals + all data identical**; 60fps, no INP regression.

---

## 10. Out of scope (explicitly)

- **Accent color / visual identity → Move #3** (this Move stays monochrome; motion only).
- **New features, data, queries, or schema** — Move #2 changes feel, not function.
- **Replacing server-first with an SPA/client data layer** — forbidden.
- A bespoke keyboard **⌘K palette** and broader navigation redesign (noted in the audit as
  "Navigation / later," not this Move).

> Next move after this (do **not** start without its own approved plan): **Move #3 — Identity &
> Craft** (one restrained signature accent + craft details). Move #2 deliberately stops at *feel*.
