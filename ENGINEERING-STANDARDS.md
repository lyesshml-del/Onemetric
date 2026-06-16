# ENGINEERING-STANDARDS — OneMetric

> How we build OneMetric. Principal-engineer standards for a SaaS meant to last years and survive
> many sessions. Grounded in the real stack (`apps/web/package.json`, the code) and the working
> agreement in `AGENT-RULES.md` / `HANDOFF.md`. Companion: `ARCHITECTURE.md`, `DECISIONS.md`.

---

## Server-first philosophy
- **React Server Components by default.** Data is fetched on the server in the page/query layer;
  client components (`'use client'`) exist **only** where interactivity demands (hover, forms,
  small chart tooltips). This keeps the JS bundle tiny and the app fast.
- **Writes are server actions** (`server/actions/*`, `'use server'`), owner-scoped via
  `requireUser`. No client-side mutation libraries.
- **No client data-fetching/state library** (no React Query, Redux, SWR). The server is the store.

## Minimal dependencies
- **Every dependency is a liability** (bundle, security surface, maintenance, lock-in). The bar to
  add one is high and requires explicit approval.
- Concretely we ship **without**: a charting library (hand-rolled SVG), a date library (native
  `Date`), a state/data-fetching library, an animation library, Redis/queues/Kafka/RabbitMQ, a
  second auth system. See `DECISIONS.md`.
- Current runtime deps are intentionally few: Next, React, Prisma, Supabase SSR, Zod, Resend,
  Paddle.js, lucide, radix/shadcn primitives, tailwind-merge/clsx/cva.

## Why we avoid complexity
Complexity is the main long-term cost of a small SaaS run by a tiny team. We optimize for
**a system one person can hold in their head**: one app, one database, one data layer, one auth
provider, one deploy target. Operational simplicity beats theoretical scalability we don't need.

## Why we avoid unnecessary abstractions
- **Prefer a direct, readable function over a clever framework.** Raw SQL where it's clearer than
  an ORM gymnastic; a plain `lib/` function over a base-class hierarchy.
- **No premature generalization.** Build for the second case when the second case exists (e.g.
  `IntegrationProvider` is an enum ready for more providers, but we only implement PayPal).
- Abstractions must **pay for themselves** in clarity or reuse; otherwise they're debt.

## Testing philosophy
- **Vitest, `environment: "node"` — no jsdom on purpose** (avoid the dependency).
- **Test pure logic exhaustively**: funnel computation, UA/visitor/PayPal parsing, crypto
  round-trip, `format`/`range`/`lede` helpers, zod schemas, and the `/api/collect` route via a
  plain (non-spy) mock. Edge cases are the point (e.g. the funnel `[5,2,1]` ordering case; every
  Lede sentence case).
- **Presentational React components are verified by typecheck + visual review**, not unit render.
- **Data correctness is verified against the live DB** via the Supabase MCP (seed throwaway rows,
  assert, delete — **never touch the real `DataFast` data**).
- Baseline today: **69 tests**. The suite only grows; never weaken it to make a change pass.

## Query-layer principles
- All reads go through `server/queries/*`; all writes through `server/actions/*`. **UI never
  touches Prisma directly.**
- **Owner-scope every query** reachable by id (project relation checks; `requireUser`).
- **Raw SQL for aggregates/timeseries**, Prisma `groupBy` for breakdowns — pick the clearer tool.
- **Never change an existing query's signature or behavior** when adding a feature; **add** a new
  function that reuses it (e.g. `getOverviewMetricsDelta` reuses `getOverviewMetrics`).
- **Pre-aggregate on write** (`Session`) so reads stay cheap; don't scan the `Event` firehose for
  routine metrics.

## Incremental development & phase-by-phase approvals
- **One phase per turn.** A phase is the smallest shippable, reviewable unit. Implement only that
  phase; **stop and wait for approval** before the next. (This is the established working
  agreement; see `MOVE-1-IMPLEMENTATION-PLAN.md`.)
- Build order follows the **plan**, not visual order, to respect dependencies and de-risk.
- Each phase records: files created/modified, reasoning, risks, future-phase notes, verification.

## Additive changes
- **Strictly additive, never destructive.** New components/functions live alongside the old;
  swap one section at a time. Tolerate brief **transitional states** (documented) rather than a
  big-bang rewrite.
- **No schema migration** unless a phase truly needs it and it's approved. Most features derive
  from existing tables.

## Keeping `main` always shippable
- After every phase: `typecheck`, `lint`, `test`, and a production `build` must all pass.
- Nothing half-wired is left on `main`; a phase either fully works or isn't merged.
- Feature-flag the in-progress surface if a transitional state would be user-visible during a
  multi-phase migration (optional `?v=2` style gate).

## Performance principles
- **Perceived speed is a feature.** Server-first + small bundles + pre-aggregated reads.
- Run independent reads in parallel (`Promise.all`); add an index before a slow scan; keep the
  ingestion path lean and **never let it 500** (catch DB errors → `204`).
- Watch the route bundle size in `next build` output; new client components should be tiny.

## Type safety
- **Strict TypeScript**, `tsc --noEmit` is a required gate. No `any` escape hatches in new code;
  model data with explicit types. Zod validates all external input (collect, webhooks, forms).
- Prisma generates the DB types; `npm run build` runs `prisma generate` first.

## Documentation philosophy
- **The repository is the long-term memory** — not conversation history. Source-of-truth docs
  (`PRD`, `AGENT-RULES`, `ROADMAP`, `DESIGN-AUDIT`, `OVERVIEW-SPEC`, the plan, and this set) are
  authoritative; `HANDOFF.md`/`TODO.md` are the running log.
- **Update docs in the same change** that changes reality. A stale doc is a bug. If a doc and the
  code disagree, the code wins — then fix the doc.

## Verification requirements (Definition of Done, every phase)
1. `cd apps/web && npm run test && npm run typecheck && npm run lint && npm run build` — all green.
2. New pure logic has unit tests; numbers verified against the live DB (seed-and-delete).
3. "What must remain unchanged" re-checked (other pages/tabs/queries untouched).
4. `TODO.md` + `HANDOFF.md` updated; one reviewable commit per phase.

## Git philosophy
- Branch **`main`**; **commit or push only when the user asks.** During phased work: **commit
  locally per phase, do not push** (a push deploys); wait for approval.
- **Commit messages** are descriptive and end with the `Co-Authored-By` trailer.
- **Repo must stay public** (Vercel GitHub App constraint) and a real `apps/web` change is needed
  to trigger a deploy (empty/root-only commits are skipped). Never commit secrets.
