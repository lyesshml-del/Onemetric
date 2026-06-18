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
- **Move #2 — Feel & Performance is UNDERWAY.** The spec + plan are approved (`MOVE-2-SPEC.md` +
  `MOVE-2-IMPLEMENTATION-PLAN.md`). **Phase 0 (Motion foundations, `ONE-47`) is implemented +
  verified + committed locally (in review)** — motion tokens, the global reduced-motion guard,
  `useCountUp`/`useReducedMotion`, `<Skeleton>`; nothing wired into a page yet (zero visible change).
  **Next is Phase A — Skeletons (`ONE-48`).** Phases B–G Backlog.

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
- **Move #1 is COMPLETE & APPROVED.** **Move #2 — Feel & Performance is UNDERWAY** (spec + plan
  approved). **Phase 0 (`ONE-47`, Motion foundations) is implemented + verified + committed locally
  (in review)** — motion tokens + `ease-soft`, the global `prefers-reduced-motion` guard,
  `useCountUp`/`useReducedMotion`, `<Skeleton>`, `shimmer`/`draw-in` keyframes; **nothing wired into
  a page** (zero visible change; Overview route unchanged at 4.48 kB).
- **Next exact step:** on approval of Phase 0, implement **Phase A — Skeletons / loading states
  (`ONE-48`) only**: a `loading.tsx` for the Overview built from `<Skeleton>`, mirroring the final
  layout (zero layout shift); static under reduced-motion. Then stop for approval.
- **Do not implement more than one phase, or Move #3, without approval.** No animation library / no
  new dependency (CSS + native View Transitions API + tiny hooks). Accent/identity stays **Move #3**.

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
| `MOVE-2-SPEC.md` | Move #2 "instant + alive" design spec — **awaiting approval** |
| `MOVE-2-IMPLEMENTATION-PLAN.md` | Move #2 phased build plan (0 + A–G) — **awaiting approval** |
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
- **Dependency-free charts** (hand-rolled SVG: `BarChart`, `TrendChart`, `Sparkline`).
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
  deletable (grep: 3 importers on the Events-detail / Funnels-detail / Revenue pages) — it stays,
  and unifying it onto the `rounded-xl` spec is a **Move #3** item.
- **Drill links** in the Lede / cards are absent until their target views exist (D/E/F).
- **Motion/perceived-speed** is now **Move #2 — planned** (`MOVE-2-SPEC.md` + plan written, awaiting
  approval; `ONE-47` Phase 0 Todo). **Accent/identity** remains **Move #3** (separate future plan).
- **Data retention cron** (delete old rows per plan `retentionDays`) is designed but not built.

## 12. Git & verification status
- Branch **`main`**. Recent Move #1 work is committed as **one local commit per phase**, several
  **not yet pushed** (network was intermittent during the session). Pushing triggers a Vercel
  production deploy.
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
