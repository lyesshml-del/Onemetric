# SESSION-HANDOFF — Staff-to-Staff Project Handoff

> **Read this first if you are a fresh AI session with zero memory.** This file lets you
> continue OneMetric safely **without any prior conversation history.** Everything here is
> grounded in the repository and the approved source-of-truth documents — not in chat memory.
>
> If anything here disagrees with the code, **the code wins** — then fix this file.

---

## 1. What OneMetric is (one paragraph)
OneMetric is a **privacy-first, cookieless web-analytics SaaS** for indie hackers and small
SaaS founders: website analytics, custom events, conversion funnels, revenue attribution
(PayPal), and templated weekly email reports — installed via a single `<script>` snippet.
It is **LIVE in production** at **https://onemetric.sbs**. See `PRODUCT-PHILOSOPHY.md`.

## 2. Current project state (2026-06-18)
- **V1 MVP complete and live** (build phases 0–8): analytics, events, funnels, PayPal revenue
  attribution, weekly reports, cookieless tracker, Supabase auth.
- **Launch-prep complete:** Paddle subscription billing (built + **sandbox-verified**, not yet
  charging), marketing site + legal pages, Vitest + CI, deploy, and post-deploy hardening
  (email, WAF rate-limit, custom domain, `/api/collect` never-500 hardening).
- **Revenue-ready, pending config only** — see `GO-LIVE.md`. Two blockers: (1) add Paddle
  **payout details**, (2) **production** Paddle product/keys/webhook + env swap.
- **Move #1 — the "Opinionated Overview" redesign is COMPLETE & APPROVED.** `ONE-15` Done, the
  **Move #1** Linear project **Completed**.
- **Move #2 — Feel & Performance: COMPLETE & APPROVED.** `ONE-47…55` Done; the **Move #2** Linear
  project **Completed**. The whole app feels instant + alive (skeleton, optimistic range + section
  switching, count-up, chart draw-in, hover/press, view transitions), reduced-motion-first,
  server-first, no new dependency.
- **Move #3 — Identity & Craft is COMPLETE & APPROVED** (the final design move). `MOVE-3-SPEC.md` +
  `MOVE-3-IMPLEMENTATION-PLAN.md` define the single restrained **violet accent** applied sparingly +
  craft (one card/number/chart spec, a logomark, favicon/flag polish; phases 0 + A–F). **Phase 0
  (`ONE-56`) — accent token foundations — is implemented, verified, committed locally
  (`7ff0804`) → Done (approved 2026-06-19)** (the `--brand` / `--brand-foreground` / `--brand-text`
  tokens defined in `globals.css` for dark + light, AA-verified, **applied to nothing** — zero visual
  change). **Phases A (`ONE-57`), B (`ONE-58`), C (`ONE-59`), D (`ONE-60`), E (`ONE-61`), F (`ONE-62`) are all Done
  (approved); the Move #3 Linear project is Completed (close-out 2026-06-19) and the umbrella `ONE-44` is
  closed (`ONE-46` was folded into Phase D). **MOVE #3 COMPLETE & APPROVED** (0, A–F): the accent lives in its four sanctioned zones (hero series · active state ·
  primary action · Lede-link hover) + the logomark identity; one card/number/chart spec everywhere; a quiet
  identity (logomark + favicon + OG); WCAG-AA dark + light. The accent is introduced ONLY in Move #3. **On
  approval of Phase F:** `ONE-62` → Done + the Move #3 Linear project → Completed (not done yet).

## 3. Completed phases
- **V1 build:** Phase 0 Foundation · 1 Database · 1.5 Live DB · 2 Auth · 3 Tracker · 4 Analytics
  dashboard · 5 Events · 6 Funnels · 7 PayPal revenue · 8 Weekly reports.
- **Launch prep:** 9 Billing (Paddle) · 10 Marketing+legal · 11 Tests+CI · 12 Deploy · email /
  WAF / custom-domain / 500-hardening.
- **Move #1 Overview redesign (COMPLETE):** Phase 0 (foundations) · A (Hero) · B (Lede) ·
  C (KPI strip) · D (Sources card) · E (Funnel card + conversion KPI) · F (Revenue card + Revenue
  KPI) · G (Audience card — merged Countries/Devices/Browsers) · H (Top pages → `SourceRow` +
  finalized engagement line) · I (mobile layout pass) · J (cleanup: removed the "Overview" h2 +
  hero min/max labels, focused empty state, coherence/a11y; `MetricCard` kept — still used by 3
  detail pages). The Overview redesign is done end-to-end.
- Full detail lives in `TODO.md` and `HANDOFF.md` (the running log).

## 4. Current phase & exact next step
- **Moves #1 & #2 are COMPLETE & APPROVED** (both Linear projects Completed). **Move #3 — Identity &
  Craft is COMPLETE & APPROVED** — `MOVE-3-SPEC.md` + `MOVE-3-IMPLEMENTATION-PLAN.md` (the single
  restrained violet accent, ~285 hue, applied sparingly + craft; phases 0 + A–F). **Phase 0 (`ONE-56`)
  is approved & Done (2026-06-19; commit `7ff0804`):** `--brand` `oklch(0.56 0.18 285)` dark / `oklch(0.52 0.2 285)` light,
  `--brand-foreground`, `--brand-text` (lighter text-on-bg) defined in `globals.css` + mapped to
  `bg-brand`/`text-brand`/`ring-brand`/`from-brand`/… utilities, **WCAG-AA verified** (button 4.76/5.73,
  series 4.00/5.98, text 7.15/5.98), **applied to nothing** (zero visual change, proven by grep +
  compiled-CSS + byte-identical route size). `--ring` kept neutral; no `--brand-muted`.
- **Phase A (`ONE-57`) is Done (approved 2026-06-19):** the hero `TrendChart`
  current-period value line `stroke-foreground → stroke-brand` + the area fill → a `--brand`→transparent
  SVG gradient; the previous-period ghost line, crosshair, dot, tooltip, and the hero number + delta stay
  neutral; the sparkline stays neutral; the Move #2 draw-in / tooltip / scaling are intact. Line-on-
  `--background` AA: **4.00 dark / 5.98 light**. Only `trend-chart.tsx` changed (single consumer →
  `BarChart` + other pages unaffected).
- **Phase B (`ONE-58`) is Done (approved 2026-06-19):** the active section-tab underline (`TabNav`:
  `border-foreground → border-brand`; label stays `text-foreground` for AA) + the selected
  segmented-control segment (`AudienceCard`: `bg-brand text-brand-foreground`). The range select is left
  neutral (native `<select>`). Move #2 optimistic logic intact; only the active colour changed. AA:
  underline 4.00/5.98 (graphical ≥3); segment text 4.76/5.73 (≥4.5). Shared `TabNav` → all 6 pages' active
  underline branded; non-active render byte-identical.
- **Phase C (`ONE-59`) is Done (approved 2026-06-19):** the **primary action** —
  shadcn `Button` `default` variant `bg-primary… → bg-brand text-brand-foreground hover:bg-brand/90`
  (destructive/outline/secondary/ghost/link unchanged) — and the **Lede drill-links** tint to `--brand-text`
  on hover/focus only (`hover:text-brand-text focus-visible:text-brand-text`; at rest = `text-foreground`).
  **Button call-site audit:** every `default` usage is a single primary CTA (marketing hero/closing CTAs,
  pricing, signup/login submit, upgrade, dashboard form submits); every secondary action already uses
  `outline` → **zero demotions**. AA: button 4.76/5.73, Lede hover 7.15/5.98 (both ≥4.5); never colour-only.
  **`--ring` left NEUTRAL** (standing decision). Accent footprint now = the four sanctioned zones only
  (hero series · active tab/segment · primary button · Lede hover). Route `/dashboard/[projectId]` 6.95 kB.
  Files: `button.tsx`, `lede.tsx`.
- **Phase D (`ONE-60`) is Done (approved 2026-06-19):** the card/number spec
  unification (pure craft, **no accent, no data/query change** — restyle only, numbers identical).
  `MetricCard` restyled onto the `StatCard` spec (`rounded-lg → rounded-xl`, value `+tabular-nums`, label
  `text-sm → text-xs`) → the same card chrome as `StatCard` (kept as the label·value·`hint` card, **not
  deleted** — 5 live usages + a `hint` `StatCard` lacks; the plan's "simplest, one file" path). `tabular-nums`
  swept across the 3 detail pages (`MetricCard` values · `FunnelChart` "↓ N dropped" · Revenue Date col ·
  Events Time col + BarChart min/max labels). **`BarChart` rewrite deferred to `ONE-45`** (its only consumer
  is Events-detail — marketing uses the lucide `BarChart3` *icon*, not the component); chart language =
  `TrendChart`. DoD: grep `rounded-lg` → **zero matches**; the 3 pages on the canonical spec; numbers
  identical. `ONE-46` closed (folded here). Files: `metric-card.tsx`, `funnel-chart.tsx`,
  `events/[name]/page.tsx`, `revenue/page.tsx`, `DESIGN-SYSTEM.md`.
- **Phase E (`ONE-61`) is Done (approved 2026-06-19):** the identity layer — a
  hand-built SVG **logomark** (`components/brand/logomark.tsx`: three ascending bars, tallest = `--brand`
  accent, others `fill-foreground`; no text, `aria-hidden`, 16px-legible) added beside the wordmark in the
  marketing + dashboard headers; the **favicon** `app/icon.svg` (same mark on a dark tile → legible on any
  tab; legacy `favicon.ico` kept as fallback); and the **OG** mark prepended to `opengraph-image.tsx`
  (text/layout unchanged). No new dependency; no accent creep (the mark's accent bar is identity, sanctioned).
  `/icon.svg` is a static route; app route sizes unchanged. Files: +`logomark.tsx`, +`icon.svg`,
  `(marketing)/layout.tsx`, `dashboard/layout.tsx`, `opengraph-image.tsx`, `DESIGN-SYSTEM.md`.
- **Phase F (`ONE-62`) is Done (approved 2026-06-19):** the final coherence/
  contrast/a11y pass — **docs-only (the audit found no defect → zero code change).** Confirmed (grep): the
  accent lives in exactly the four sanctioned zones + the logomark (no creep); `rounded-lg` → zero; every
  data metric is `tabular-nums`; `TrendChart` is the one chart language (`BarChart` drift stays `ONE-45`).
  WCAG-AA recorded dark/light (button 4.76/5.73 · Lede-hover 7.15/5.98 · underline + series 4.00/5.98 ·
  segment 4.76/5.73); accent never the sole signal; `--ring` neutral; deltas green/red; live dot emerald;
  sparkline neutral. `MOVE-3-SPEC.md` §8: all 5 criteria ✅. Files: docs only (`MOVE-3-SPEC.md`,
  `DESIGN-AUDIT.md`, `DESIGN-SYSTEM.md`, `TODO.md`, `HANDOFF.md`, `SESSION-HANDOFF.md`).
- **Next exact step — all three design Moves are COMPLETE & APPROVED.** Phase F approved 2026-06-19;
  `ONE-62` is Done, the "Move #3 — Identity & Craft" project is Completed, and the umbrella `ONE-44` is
  closed. There is **no open Move #1/#2/#3 work.** **`ONE-45`** (retire the distorting BarChart) is **Done**
  — events-detail uses the neutral crafted `TrendChart`; one chart language everywhere. **`ONE-24` (push +
  deploy) is Done (2026-06-19):** the 36 local commits were pushed to `origin/main` (`449757a`) and the
  Vercel **production deploy is READY** (commit `449757a`, target production). **origin/main == local main;
  zero unpushed; tree clean.** Repository, Linear, GitHub, and production are fully synchronized; the design
  line has no open items. The broader product backlog (marketing / onboarding / Paddle go-live) is separate,
  pre-existing work — keep one-phase-per-turn discipline if it's picked up later.
- **Do not implement more than one phase without approval.** No animation library / no new dependency.
  The accent is applied only as each Move #3 phase sanctions it.

## 5. Source-of-truth documents (read before acting)
| Document | What it governs |
| --- | --- |
| `AGENT-RULES.md` | Working rules, current phase, "never build V2+" |
| `PRD.md` | V1 product scope |
| `ROADMAP.md` | Future (V2+) — **never implement** |
| `PRODUCT-PHILOSOPHY.md` | Why/for-whom/what-it-refuses-to-be |
| `DESIGN-AUDIT.md` | Approved design critique (the "why premium") |
| `OVERVIEW-SPEC.md` | Approved Overview redesign spec |
| `MOVE-1-IMPLEMENTATION-PLAN.md` | Approved phased build plan (0 + A–J) — **Move #1 done** |
| `MOVE-2-SPEC.md` | Move #2 "instant + alive" design spec — **done & approved** |
| `MOVE-2-IMPLEMENTATION-PLAN.md` | Move #2 phased build plan (0 + A–G) — **done & approved** |
| `MOVE-3-SPEC.md` | Move #3 "one signature" accent + craft spec — **shipped; §8 all met (Phase F audit)** |
| `MOVE-3-IMPLEMENTATION-PLAN.md` | Move #3 phased build plan (0 + A–F) — **COMPLETE & APPROVED; project Completed** |
| `DESIGN-SYSTEM.md` | How it should feel + tokens/patterns |
| `ENGINEERING-STANDARDS.md` | How we build |
| `DECISIONS.md` | Why the big choices were made (ADRs) |
| `ARCHITECTURE.md` | How the system is built |
| `DEPLOY.md` / `ENVIRONMENT.md` / `GO-LIVE.md` | Ops, env vars, go-live |
| `HANDOFF.md` / `TODO.md` | Detailed running log + task list |

## 6. Architectural decisions (summary — full reasoning in `DECISIONS.md`)
- **Next.js 15** (App Router, RSC), **server-first**; **server actions** for writes.
- **PostgreSQL only** (Supabase), **Prisma 6** as the **sole** data-access layer.
- **Supabase Auth for authentication only** — it never reads `public.*`; Prisma (owner role)
  bypasses the deny-by-default RLS.
- **Cookieless** visitor identity (daily-rotating salted SHA-256 hash) — no cookies, no PII.
- **Dependency-free charts** (hand-rolled SVG: `TrendChart`, `Sparkline`; the legacy distorting `BarChart`
  was retired in `ONE-45` — the events-detail trend uses a neutral `TrendChart`).
- **No Redis / queues / Kafka / RabbitMQ / cron service** beyond Vercel Cron.
- **Merchant-of-Record = Paddle** (founder in Algeria → Stripe unavailable).
- **Pre-aggregated `Session`** rows so metrics don't scan the `Event` firehose.

## 7. Product & design philosophy (one line each)
- **Product:** "The Linear of analytics" — calm, opinionated, privacy-first, simple over
  feature-bloat. See `PRODUCT-PHILOSOPHY.md`.
- **Design:** Linear + Stripe + Vercel + Apple — calm, editorial hierarchy, premium, minimal,
  one signature accent (deferred to Move #3). See `DESIGN-SYSTEM.md` + `DESIGN-AUDIT.md`.

## 8. Important constraints (hard rules)
- **Only V1 scope** — never implement ROADMAP / V2+ items (session replay, heatmaps, A/B,
  feature flags, AI reports, SEO, alerts, Stripe-as-customer-revenue).
- **Phase-by-phase, approval-gated.** One phase per turn; stop and wait after each.
- **Strictly additive, low-risk; `main` always shippable.** No big-bang rewrites.
- **No new dependencies** without explicit approval. **No schema changes** unless a phase
  requires one and it's approved.
- **Accent color / visual identity = Move #3** — out of scope until then (stay monochrome).
- **Never touch the live `DataFast` project/account data** — it is a real user's data. Use
  throwaway seed rows and delete them.

## 9. Open decisions
- **D1 (Phase D):** favicons vs monograms → **decided: monogram/letter avatars, no third party**
  (privacy). Build accordingly.
- **E1 (Phase E):** "primary funnel" selection → default to the project's **first/oldest** funnel
  (no schema change now; a "pin to overview" field is a possible later migration).
- **C1 (Phase C, resolved):** sparklines shipped for existing series (visitors/pageviews);
  sessions/revenue/conversion per-day series are added with their phases.
- **2Checkout vs Paddle:** resolved → **Paddle** (verification passed; Algeria seller approved).

## 10. Known risks
- **Cannot charge yet** — Paddle payout details + production config pending (`GO-LIVE.md`).
- **`/api/collect` ~2% 500 under extreme burst** was hardened to return 204 (fixed + verified).
- **"Active now"** KPI is a page-load snapshot, not a live stream.
- **Legal:** privacy/terms/refund are solid templates but need professional review; the Algeria
  **ANPDP cross-border-transfer** authorization is a launch-blocking legal (not code) item.
- **Repo visibility:** making the GitHub repo **private breaks Vercel deploys** unless the Vercel
  GitHub App is first granted private-repo access (see §13).

## 11. Things intentionally deferred / temporary states
- **Move #1 transitional states — resolved (Phase J):** the redundant "Overview" `<h2>` and the
  hero min/max date labels were removed; the focused empty state shipped. `MetricCard` was **not**
  deletable (grep: 3 importers on the Events-detail / Funnels-detail / Revenue pages) — it stays.
  **Resolved in Move #3 / Phase D (`ONE-60`, 2026-06-19):** `MetricCard` was restyled in place onto the
  `rounded-xl` + `tabular-nums` `StatCard` spec (still used by the 3 detail pages, now on one card system).
- **Drill links** in the Lede / cards are absent until their target views exist (D/E/F).
- **Motion/perceived-speed** is now **Move #2 — planned** (`MOVE-2-SPEC.md` + plan written, awaiting
  approval; `ONE-47` Phase 0 Todo). **Accent/identity** remains **Move #3** (separate future plan).
- **Data retention cron** (delete old rows per plan `retentionDays`) is designed but not built.

## 12. Git & verification status
- Branch **`main`**, **pushed to `origin/main` (2026-06-19; `ONE-24`).** `origin/main == local main ==
  449757a`; **zero unpushed commits**; working tree clean. The push (36 commits: Move #1/#2/#3 + ONE-45)
  triggered the Vercel **production deploy → READY** (`dpl_AeT56nQ8…`, commit `449757a`). Future pushes to
  `main` still trigger a production deploy — get explicit go-ahead first.
- **Verification baseline:** `83 tests` pass; `typecheck`, `lint`, and production `build` green.
  Run all four before finishing any phase (`cd apps/web && npm run test && npm run typecheck &&
  npm run lint && npm run build`).

## 13. Things future sessions must NEVER do
1. **Never implement V2+ / ROADMAP features.**
2. **Never start or skip a phase without explicit user approval.** One phase per turn.
3. **Never push or deploy without explicit approval** during phased work.
4. **Never set the GitHub repo private** unless the Vercel GitHub App already has private-repo
   access — it makes every deploy go `BLOCKED`.
5. **Never delete or mutate the live `DataFast` data.**
6. **Never add a dependency, a schema migration, or the accent color** without approval.
7. **Never trust an empty/root-only commit to deploy** — Vercel's Root Directory is `apps/web`,
   so a deploy needs a real change under `apps/web` (else the build is skipped/`CANCELED`).
8. **Never rely on conversation history** — re-derive state from this file + the repo.

## 14. How to proceed safely (the loop)
1. Read this file → `MOVE-1-IMPLEMENTATION-PLAN.md` → the spec for the next phase →
   `ENGINEERING-STANDARDS.md`.
2. Confirm the phase with the user; implement **only** that phase, additively.
3. Run the four checks (test/typecheck/lint/build); verify numbers against the live DB via the
   Supabase MCP (seed-and-delete, never touch DataFast).
4. Update `TODO.md` + `HANDOFF.md`; commit locally as one reviewable commit; **stop and wait.**
