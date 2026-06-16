# DECISIONS — OneMetric Decision Log (ADRs)

> Why the big choices were made, with consequences. Lightweight ADR style. Grounded in the actual
> repo + approved docs. **Status: Accepted** unless noted. If a decision is later reversed, append
> a new entry rather than rewriting history.

Index: 001 Next.js 15 · 002 Prisma 6 · 003 Postgres-only · 004 No Redis/queues · 005 Supabase Auth
· 006 Prisma + RLS · 007 Pooler connection · 008 Cookieless identity · 009 Pre-aggregated Session ·
010 Always-204 ingestion · 011 Dependency-free charts · 012 shadcn + Tailwind v4 + Geist ·
013 Resend · 014 MoR = Paddle · 015 AES-256-GCM creds · 016 Server-first / RSC · 017 Vitest
node-only · 018 npm-workspace monorepo · 019 Monogram avatars (no 3rd-party favicons) ·
020 Move #1/#2/#3 design arc · 021 Phase-by-phase additive workflow · 022 Repo public · 023 No AI ·
024 EU hosting · 025 Native Date.

---

### ADR-001 — Next.js 15, not 16
**Context:** `create-next-app` shipped Next 16 at scaffold time; the surrounding ecosystem/docs
were stabilized on 15. **Decision:** pin **Next 15** (`^15.5.19`, App Router). **Consequences:**
fewer bleeding-edge surprises; revisit 16 deliberately later. Recorded in `AGENT-RULES.md`.

### ADR-002 — Prisma 6, not 7
**Context:** Prisma 7 was newly out. **Decision:** pin **Prisma 6** (`^6.19.3`) for stability.
**Consequences:** stable migrations/client; upgrade is a future, isolated task.

### ADR-003 — PostgreSQL only (Supabase), one database
**Context:** analytics tempts you toward specialized stores (ClickHouse, time-series DBs).
**Decision:** **one Postgres** (Supabase, Postgres 17, `eu-central-1`). **Consequences:** simple
ops; we compensate with indexes + **pre-aggregated `Session` rows** (ADR-009). If scale ever
demands it, a columnar store is a future migration — not now.

### ADR-004 — No Redis, queues, Kafka, or RabbitMQ
**Context:** "real" analytics pipelines reach for streaming/queues. **Decision:** **none.** Only
**Vercel Cron** for the weekly report. **Consequences:** dramatically simpler to run and reason
about; ingestion writes straight to Postgres. Abuse handled by **Vercel WAF**, not a queue.

### ADR-005 — Supabase Auth, for authentication only
**Context:** need auth without building it. **Decision:** **Supabase Auth (GoTrue)** for sign
up/in/confirm only; it **never reads/writes `public.*`**. **Consequences:** `lib/auth.ts`
mirrors the auth identity into `public.User` (UUID = auth id). Custom SMTP via Resend for
reliable confirmation mail.

### ADR-006 — Prisma as the sole data layer; RLS deny-by-default
**Context:** Supabase ships RLS. **Decision:** **all** `public.*` access via **Prisma** (owner
role, **bypasses RLS**); RLS is **enabled deny-by-default with no policies.** **Consequences:**
one data path, no policy maze. Add RLS policies only if a Supabase-client/PostgREST call ever
needs row access to a `public` table (it doesn't today).

### ADR-007 — Supabase pooler connection for both URLs
**Context:** Supabase's direct host (`db.<ref>.supabase.co`) is **IPv6-only** and unreachable on
many networks. **Decision:** use the **pooler** host for both — `DATABASE_URL` = transaction
pooler (6543, `pgbouncer`), `DIRECT_URL` = session pooler (5432). Cluster is **`aws-1`-…**.
**Consequences:** reliable from dev + Vercel; documented in `ENVIRONMENT.md`.

### ADR-008 — Cookieless visitor identity (daily-rotating salted hash)
**Context:** privacy-first is the product's identity. **Decision:** identify visitors with a
**daily-rotating, salted SHA-256 `visitorHash`** (`VISITOR_HASH_SALT`); store **no cookies, no
raw IP**, only derived country/device/browser. **Consequences:** no cookie banner needed for
analytics; cannot track a person across days/sites (a feature, not a bug); uniques are
per-day-stable. See `PRODUCT-PHILOSOPHY.md`.

### ADR-009 — Pre-aggregated `Session` rows
**Context:** computing uniques/bounce/duration by scanning the `Event` firehose is expensive.
**Decision:** maintain a **pre-aggregated `Session`** (pageviewCount, entry/exit, referrer, UTM,
country/device/browser) updated on each event within a 30-min window. **Consequences:** cheap
metric queries on Postgres; the `Event` table stays the raw firehose for drill-downs.

### ADR-010 — `/api/collect` always returns 204 (Node runtime)
**Context:** a public ingestion endpoint must not leak info or fall over. **Decision:** **Node
runtime** (Prisma needs it); **always `204`** (never reveal whether a public key exists), `400`
only on malformed body, and **catch DB errors → still `204`** (never 500 under load).
**Consequences:** floods degrade to dropped events, not errors; verified by burst testing. Edge
runtime rejected (would need Prisma Accelerate/driver infra).

### ADR-011 — Dependency-free charts
**Context:** charting libs are heavy and opinionated. **Decision:** **hand-rolled SVG**
(`BarChart` legacy, `TrendChart`, `Sparkline`). **Consequences:** tiny bundle, full control,
correct scaling via `non-scaling-stroke` + HTML-overlay tooltips. Cost: we maintain chart code
ourselves (acceptable for our simple needs).

### ADR-012 — shadcn/ui + Tailwind v4 + Geist, dark-first, no accent yet
**Context:** need a premium, consistent UI fast. **Decision:** **shadcn/ui** primitives +
**Tailwind v4** tokens (oklch) + **Geist** type, **dark-mode first**, **monochrome with no brand
accent** initially. **Consequences:** clean baseline; the single signature **accent is deferred
to Move #3** (ADR-020). One card system (retiring the legacy `MetricCard`).

### ADR-013 — Resend for transactional/report email
**Context:** need reliable email without an SMTP server. **Decision:** **Resend** (domain
`onemetric.sbs` verified) for weekly reports + as Supabase custom SMTP. The sender **no-ops
without `RESEND_API_KEY`** so the pipeline is safe in dev. **Consequences:** simple, one vendor;
named sub-processor.

### ADR-014 — Billing via a Merchant-of-Record = Paddle
**Context:** the founder is in **Algeria → Stripe is unavailable**; we need someone to be seller
of record + handle global tax + pay us out. **Decision:** **Merchant-of-Record**; provider
**Paddle** (verification passed, Algeria seller approved). Groundwork was built provider-agnostic
(`lib/plans.ts`, gating, `billing.ts` seam) so 2Checkout was a fallback. **Consequences:** Paddle
checkout (Paddle.js) + `POST /api/webhooks/paddle` sync `User.plan`. **Sandbox-verified;** going
live needs production keys + **payout details** (`GO-LIVE.md`). PayPal in V1 is a *customer*
revenue source, **not** OneMetric's billing — keep these separate.

### ADR-015 — AES-256-GCM for integration credentials
**Context:** per-project PayPal credentials must be stored safely. **Decision:** encrypt at the
app layer (`lib/crypto.ts`, AES-256-GCM, `CREDENTIALS_KEY`), store opaque JSON in
`Integration.credentials`. **Consequences:** DB compromise alone doesn't expose creds; the key
lives only in env.

### ADR-016 — Server-first (RSC) + server actions; no client data/state library
**Context:** SPA data layers add weight and complexity. **Decision:** **RSC by default**, server
actions for writes, **no** React Query/Redux/SWR. **Consequences:** tiny client bundles, the
server is the store, simpler mental model. Client components only for interactivity.

### ADR-017 — Vitest with `environment: "node"` (no jsdom)
**Context:** testing React renders needs jsdom + testing-library (a dependency + setup).
**Decision:** **node-only Vitest**; test **pure functions** exhaustively; verify components by
typecheck + visual review. **Consequences:** fast, dependency-light tests; we don't unit-render
components (acceptable — logic is extracted to pure functions like `computeFunnel`, `buildLede`).

### ADR-018 — npm-workspace monorepo (no Turborepo/Nx); tracker as a package
**Context:** the tracker script and the app are separate concerns. **Decision:** plain **npm
workspaces**; `packages/tracker` builds (esbuild) to a committed `apps/web/public/onemetric.js`.
**Consequences:** minimal tooling; the app deploys standalone; rebuild + commit the tracker only
when it changes.

### ADR-019 — Monogram avatars instead of third-party favicon services (D1)
**Context:** showing favicons for referrers/sources would **leak our customers' visited domains**
to a third party (e.g. Google's favicon API) — off-brand for a privacy-first product, plus extra
requests. **Decision:** use **monogram/letter avatars** (a `monogram()` helper, no third party).
**Consequences:** fully private, dependency-free, always available; slightly less visually rich
than real favicons (acceptable). Revisit only with a self-hosted, privacy-respecting cache.

### ADR-020 — The Move #1 / #2 / #3 design arc
**Context:** the design audit showed the product is "competent monochrome" but not yet premium;
fixing everything at once is risky. **Decision:** sequence the upgrade: **Move #1 "have an
opinion"** (hierarchy + narrative — the Overview redesign, in additive phases 0/A–J), **Move #2
"instant + alive"** (optimistic UI, skeletons, motion, view transitions), **Move #3 "one
signature"** (a single restrained accent + craft details). **Consequences:** each Move is
independently approvable; **accent color and heavy motion are explicitly out of scope until their
Move.** See `DESIGN-AUDIT.md`, `OVERVIEW-SPEC.md`, `MOVE-1-IMPLEMENTATION-PLAN.md`.

### ADR-021 — Phase-by-phase, additive workflow; `main` always shippable
**Context:** a small team / AI sessions need safety and reviewability. **Decision:** **one
approved phase per turn**, strictly additive, with a fixed Definition of Done (test/typecheck/
lint/build + DB verify + docs). **Consequences:** low blast radius, easy review/rollback,
tolerated transitional states (documented), never a big-bang rewrite.

### ADR-022 — GitHub repo stays public; Vercel Root Directory = `apps/web`
**Context:** making the repo **private** made every Vercel deploy go `BLOCKED` (the Vercel GitHub
App lacked private-repo access on this setup); and empty/root-only commits get **skipped**
(`CANCELED`) because the Root Directory is `apps/web`. **Decision:** **keep the repo public** for
now; to go private later, grant the Vercel GitHub App private-repo access first; trigger deploys
with a real `apps/web` change. **Consequences:** documented in `DEPLOY.md`/`HANDOFF.md`; a known
operational footgun for future sessions.

### ADR-023 — No AI/LLM in the product
**Context:** "AI insights" are trendy. **Decision:** reports/summaries are **templated and
deterministic** — **no LLM in the product.** **Consequences:** zero inference cost/latency, no
nondeterminism, no extra privacy surface. (V4 ROADMAP "AI reports" stays deferred.)

### ADR-024 — EU data hosting
**Context:** trust + GDPR posture. **Decision:** host/process customer analytics data in the
**EU** (Supabase `eu-central-1`). **Consequences:** clear data residency; *the Algeria-based
controller must still complete the ANPDP cross-border-transfer authorization* (a legal, not code,
launch item — tracked in `HANDOFF.md`).

### ADR-025 — Native `Date`, no date library
**Context:** date math (ranges, day buckets) tempts a library (date-fns, dayjs). **Decision:**
use **native `Date`** + small helpers in `lib/range.ts` (`resolveRange`, `eachUtcDay`,
`previousRange`). **Consequences:** one fewer dependency; UTC-day logic is explicit and tested.
