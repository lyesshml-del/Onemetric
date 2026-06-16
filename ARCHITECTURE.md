# ARCHITECTURE — OneMetric

> How the system is built, for engineers (human or AI). Grounded in the actual repository.
> Companion docs: `ENGINEERING-STANDARDS.md` (principles), `DECISIONS.md` (why), `DATABASE`
> section here + `apps/web/prisma/schema.prisma` (truth).

---

## 1. Monorepo structure
npm workspaces (no Turborepo/Nx — deliberately minimal):

```
OneMetric/
├─ apps/
│  └─ web/                 # the Next.js 15 application (everything user-facing + server)
├─ packages/
│  └─ tracker/             # the standalone cookieless tracking script (builds to a static JS file)
├─ *.md                    # source-of-truth + handoff documentation (this file, etc.)
└─ package.json            # workspace root + scripts (build:tracker, etc.)
```

- **`apps/web`** — Next.js App Router app: marketing site, auth, dashboard, ingestion API,
  webhooks, cron, server actions, query layer, Prisma. Vercel **Root Directory = `apps/web`**.
- **`packages/tracker`** — a tiny (~1.6 kB) dependency-free TypeScript script bundled with
  esbuild into `apps/web/public/onemetric.js` (committed, so the app deploys standalone). The
  root `build:tracker` script builds it; `build` runs it before the web build.

## 2. `apps/web` folder responsibilities
```
src/
├─ app/                         # routes (App Router)
│  ├─ (marketing)/              # public site: landing, pricing, privacy, terms, refund (+ shared layout)
│  ├─ (auth)/                   # login, signup (+ centered layout)
│  ├─ auth/confirm/route.ts     # email-confirmation handler
│  ├─ dashboard/                # authenticated app
│  │  ├─ page.tsx               # project list
│  │  ├─ layout.tsx             # guard + shell (header, sign out)
│  │  ├─ billing/page.tsx       # plan + usage + upgrade/manage
│  │  └─ [projectId]/           # per-project: page.tsx (Overview), events, funnels, revenue, reports, settings
│  ├─ api/
│  │  ├─ collect/route.ts                 # ingestion (Node runtime)
│  │  ├─ webhooks/paypal/[projectId]/route.ts
│  │  ├─ webhooks/paddle/route.ts
│  │  └─ cron/weekly-reports/route.ts
│  ├─ layout.tsx, robots.ts, sitemap.ts, opengraph-image.tsx
├─ components/
│  ├─ ui/                       # shadcn primitives (button, input, label, card)
│  ├─ auth/                     # login/signup forms (client, useActionState)
│  ├─ dashboard/                # app components (StatCard, Lede, Delta, breakdown-card, project-header, …)
│  └─ charts/                   # dependency-free SVG charts (bar-chart, trend-chart, sparkline)
├─ server/
│  ├─ actions/                  # 'use server' mutations (auth, projects, funnels, integrations, reports, billing)
│  ├─ queries/                  # read layer (analytics, events, funnels, revenue, reports, billing, projects, integrations)
│  ├─ ingest/                   # ingestion logic (collect, ua, visitor) + provider webhooks (paypal, paddle)
│  └─ reports/                  # weekly report builder + React Email template + Resend sender
├─ lib/                         # framework glue + pure utilities (see §11)
│  ├─ prisma.ts, auth.ts, crypto.ts, plans.ts, format.ts, range.ts, lede.ts, utils.ts
│  ├─ supabase/{client,server,middleware}.ts
│  └─ validation/{auth,collect,project,funnel,integration,report}.ts   # zod schemas
├─ middleware.ts               # session refresh + route guard
└─ **/*.test.ts                # co-located Vitest unit tests (pure functions)
```

**Layering rule:** `app/` (routes/UI) → `server/actions` + `server/queries` → `lib/prisma` →
Postgres. UI never touches Prisma directly; it goes through actions/queries. `lib/*` pure
helpers have no side effects (easily unit-tested).

## 3. Server actions (`server/actions/*`, `'use server'`)
All **writes** are server actions, owner-scoped via `requireUser()`:
- `auth.ts` — login / signup / logout (zod-validated; signup handles email confirmation).
- `projects.ts` — `createProject` (generates `om_…` public key; **plan-gated** by `maxProjects`).
- `funnels.ts` — `createFunnel` (funnel + ordered steps in one nested create), `deleteFunnel`.
- `integrations.ts` — connect/disconnect PayPal (stores **encrypted** credentials).
- `reports.ts` — add/remove/toggle report recipients + "Send now".
- `billing.ts` — `startCheckout` (Paddle.js client token + price) / `manageBilling` (Paddle
  customer-portal session via API key). Owner-scoped.

## 4. Query layer (`server/queries/*`)
Pure-ish read functions taking `(projectId, from, to)` and returning typed rows. Two styles:
- **Raw SQL (`prisma.$queryRaw`)** for aggregate metrics + timeseries (uniques, sessions,
  pageviews, duration, bounce, per-day series, active-now) — performance + exact control.
- **Prisma `groupBy`** for breakdowns (top pages, referrers, countries, devices, browsers).
- `analytics.ts` exposes `getProjectAnalytics` (parallel `Promise.all` of all of the above) plus
  Phase-0/A/C additions: `getOverviewMetricsDelta`, `getTimeseries` (exported), `getActiveNow`.
- Ownership is enforced in queries that can be reached by id (e.g. `getOwnedProject`,
  `getOwnedFunnel` via the project relation).

## 5. Ingestion pipeline (`/api/collect` + `server/ingest`)
- **Runtime: Node** (Prisma can't run on Edge without extra infra). `dynamic = "force-dynamic"`.
- Body is `text/plain` JSON (keeps the browser request "simple" → no CORS preflight). Permissive
  CORS + `OPTIONS`. **Always returns `204`** (never reveals whether a public key exists; never
  500s — DB errors are caught and degrade to `204`). `400` only on malformed/invalid body.
- `collect.ts`: project lookup by `publicKey` → **30-minute session** find-or-create with
  pre-aggregation (pageviewCount, entry/exit path, referrer, UTM, country/device/browser/os) →
  insert the `Event`. `ua.ts` = minimal UA parse; `visitor.ts` = **cookieless** daily-rotating
  salted SHA-256 `visitorHash` (`VISITOR_HASH_SALT`); geo from `x-vercel-ip-country`.
- Abuse protection is a **Vercel WAF** rate-limit rule on `/api/collect` (100 req / 10s per IP →
  429), not app code.

## 6. Database design (`prisma/schema.prisma`)
**9 models, 6 enums.** Postgres 17 on Supabase (`eu-central-1`).
- **`User`** — `id` is a **UUID mirroring the Supabase Auth user id**; billing fields (`plan`,
  `subscriptionStatus`, `currentPeriodEnd`, `billingCustomerId @unique`, `billingSubscriptionId`).
- **`Project`** — `publicKey @unique` (embedded in the snippet); `ownerId` → User (cascade).
- **`Session`** — **pre-aggregated** per-visit row (`pageviewCount`, entry/exit, referrer+domain,
  UTM, `country @db.Char(2)`, device/browser/os, `visitorHash`). Powers uniques/bounce/duration
  without scanning events. Indexes: `(projectId, startedAt)`, `(projectId, visitorHash)`, UTM.
- **`Event`** — unified **firehose** (PAGEVIEW path or CUSTOM name + `metadata Json`). Indexes:
  `(projectId, createdAt)`, `(projectId, type, name, createdAt)`, `(sessionId)`.
- **`Funnel` / `FunnelStep`** — steps are ordered (`@@unique([funnelId, order])`), each a
  `PAGEVIEW_PATH` or `CUSTOM_EVENT` match.
- **`Integration`** — per-project revenue provider (PayPal in V1) + **encrypted** `credentials`
  JSON; `@@unique([projectId, provider])`.
- **`RevenueEvent`** — `amount Decimal(12,2)`, `currency Char(3)`, attribution snapshot
  (`utmSource`/`utmCampaign`, optional `sessionId`); idempotent `@@unique([projectId, externalId])`.
- **`ReportSubscription`** — many recipients per project (`enabled`, `lastSentAt`).
- Enums: `DeviceType`, `EventType`, `FunnelMatchType`, `IntegrationProvider`, `IntegrationStatus`,
  `Plan`.

## 7. Prisma usage
- **Single source of data access.** `lib/prisma.ts` is a singleton client (avoids dev hot-reload
  connection storms). Connects as the table-owner role → **bypasses RLS**.
- **Connections:** `DATABASE_URL` = Supabase **transaction pooler** (6543, `pgbouncer=true&
  connection_limit=1`) for runtime; `DIRECT_URL` = **session pooler** (5432) for migrations.
  (Pooler host is used because Supabase direct host is IPv6-only.)
- **Migrations:** the dev env can reach the live DB via the pooler → normal
  `prisma migrate deploy`. `build` runs `prisma generate` first (reliable Vercel builds).

## 8. Supabase usage
- **Auth only** (GoTrue / the `auth` schema): `signUp`, `signInWithPassword`, `getUser`,
  `verifyOtp`, `signOut`. Custom SMTP via Resend for confirmation emails.
- **It never reads or writes `public.*`.** Therefore RLS is **deny-by-default with no policies**
  and that is correct — all app data flows through Prisma (owner role). Add RLS policies only if
  a Supabase-client/PostgREST call ever needs row access to a `public` table.

## 9. Authentication flow
1. `middleware.ts` runs on every request → `lib/supabase/middleware.ts` refreshes the session and
   guards routes (signed-out users away from `/dashboard`; signed-in users away from `/login`/
   `/signup`).
2. `lib/auth.ts`: `getAuthUser` (read GoTrue user), `syncUser` (idempotent upsert mirroring the
   auth identity into `public.User`, self-healing if the auth id changes for an existing email),
   `requireUser` (the dashboard guard + the single bridge auth-identity → `User`).
3. Signup with email confirmation → `app/auth/confirm/route.ts` verifies the emailed link.

## 10. PayPal integration (customer revenue attribution — distinct from OneMetric's own billing)
- Per-project credentials entered in the dashboard, **encrypted** (`lib/crypto.ts`, AES-256-GCM,
  `CREDENTIALS_KEY`) and stored in `Integration.credentials`.
- `POST /api/webhooks/paypal/[projectId]` → `server/ingest/paypal.ts`: OAuth token → verify the
  webhook signature via PayPal's `verify-webhook-signature` API → on `PAYMENT.CAPTURE.COMPLETED`
  record a `RevenueEvent` (idempotent upsert). Attribution from `custom_id` (`utm_source`/
  `utm_campaign` or `om_session` → resolves that session's UTMs).
- **OneMetric's own subscription billing is separate**: Paddle (Merchant-of-Record),
  `server/actions/billing.ts` + `server/ingest/paddle.ts` + `POST /api/webhooks/paddle`
  (verifies `Paddle-Signature`, syncs `User.plan/subscriptionStatus/currentPeriodEnd/billing*`).

## 11. Reports flow
- `server/reports/builder.ts` builds a last-7-day report (reuses analytics queries; **no AI**).
- `weekly-email.tsx` = React Email template; `send.ts` = Resend sender (**no-ops without
  `RESEND_API_KEY`**, so the pipeline runs safely without it).
- `GET /api/cron/weekly-reports` — `CRON_SECRET`-protected (`Authorization: Bearer`), builds each
  project's report once, sends to enabled recipients, stamps `lastSentAt`. Scheduled in
  `apps/web/vercel.json` (Mondays 09:00 UTC).

## 12. Deployment philosophy
- **Vercel**, Root Directory `apps/web`, auto-deploy on push to `main`. Node 20 (`.nvmrc`).
- The **repo must stay public** unless the Vercel GitHub App is granted private-repo access (else
  deploys go `BLOCKED`). Empty / non-`apps/web` commits are **skipped** (`CANCELED`).
- Secrets live only in Vercel env vars (and local `apps/web/.env`, gitignored). See `DEPLOY.md`
  + `ENVIRONMENT.md`.

## 13. Testing philosophy
- **Vitest, `environment: "node"`** — **no jsdom** (deliberate: avoid a dependency). Tests cover
  **pure functions** (funnel computation, parsing, hashing, crypto round-trip, format/range/lede,
  zod schemas, the collect route via a plain mock). Presentational React components are verified
  by typecheck + visual review, not unit-rendered.
- CI (`.github/workflows/ci.yml`): `npm ci` → prisma generate → typecheck → lint → test → build.
- **69 tests** at time of writing.

## 14. Shared utilities (`lib/`)
- `format.ts` — number/duration/percent/money/country + Phase-0 `computeDelta`, `formatDeltaPct`,
  `formatDeltaPoints`, `flagEmoji`, `monogram`.
- `range.ts` — range presets, `resolveRange`, `eachUtcDay`, `previousRange`, `rangePeriodWord`.
- `lede.ts` — the Overview narrative builder + types.
- `plans.ts` — Free/Pro limits (single source of truth for gating + pricing display).
- `crypto.ts` — AES-256-GCM encrypt/decrypt for integration credentials.
- `auth.ts`, `prisma.ts`, `utils.ts` (`cn`), `supabase/*`, `validation/*` (zod).

## 15. Important patterns
- **Server-first / RSC**; client components only where interactivity demands (`'use client'`).
- **Owner scoping everywhere** via `requireUser` + project-relation checks.
- **Pre-aggregate on write** (Session) to keep reads cheap.
- **Idempotent webhooks** (unique external id).
- **Always-204 ingestion** (never leak key existence, never 500).
- **Dependency-free charts** as small SVG components.
- **Pure logic in `lib/`** for testability; framework glue stays thin.

## 16. Things intentionally avoided
- No Redis, message queue, Kafka/RabbitMQ, or background-worker infra (Vercel Cron only).
- No charting library, no client data-fetching/state library, no date library (native `Date`).
- No ORM other than Prisma; no second auth system; no microservices.
- No Edge runtime for DB routes; no GraphQL.
- No AI/LLM anywhere in the product (reports are templated).

## 17. Future extensibility (without breaking the above)
- New revenue providers → extend `IntegrationProvider` + add an `server/ingest/<provider>.ts`
  (the `Integration` table already isolates this).
- New analytics metrics → add a query in `server/queries/*` + a component; no schema change for
  most (derive from `Session`/`Event`).
- The Overview redesign (Move #1) is additive and phase-gated — see `MOVE-1-IMPLEMENTATION-PLAN.md`.
- V2+ features remain **out of scope** (`ROADMAP.md`).
