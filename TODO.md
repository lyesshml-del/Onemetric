# TODO

Living task list for OneMetric **V1 (MVP)**. Only V1 work appears here.
Future ideas go to [`ROADMAP.md`](./ROADMAP.md), never into the build.

Legend: `[x]` done · `[ ]` pending

---

## Phase 0 — Foundation ✅ (complete)

- [x] Initialize npm-workspace monorepo (`apps/*`, `packages/*`), no extra tooling
- [x] Scaffold Next.js app in `apps/web` (App Router, src dir, import alias `@/*`)
- [x] Pin **Next.js 15** (15.5.19) per AGENT-RULES (create-next-app shipped 16)
- [x] Strict TypeScript (inherited from scaffold) + `typecheck` scripts
- [x] TailwindCSS v4 + shadcn/ui config (`components.json`, `lib/utils.ts` `cn`)
- [x] Dark-mode-first theme tokens in `globals.css`; `dark` class on `<html>`
- [x] OneMetric root layout + minimal placeholder landing page
- [x] Folder skeleton: `server/{actions,queries,ingest,reports}`,
      `components/{ui,charts,dashboard}`, `lib/{supabase,validation}`, `types`
- [x] `packages/tracker` standalone package skeleton (impl deferred to Phase 3)
- [x] Root tooling: `package.json` scripts, `.gitignore`, `README.md`, `.env.example`
- [x] Remove create-next-app demo assets
- [x] Verify: install · typecheck · lint · production build all pass

## Phase 1 — Database ✅ (complete)

- [x] Install Prisma (pinned **6.x** for stability) + `@prisma/client`
- [x] Configure datasource for PostgreSQL (`DATABASE_URL` + `DIRECT_URL` for Supabase)
- [x] `lib/prisma.ts` singleton (config glue only — no app logic)
- [x] Schema with all 9 V1 entities + 5 enums: User, Project, Session, Event,
      Funnel, FunnelStep, Integration, RevenueEvent, ReportSubscription
- [x] Analytics indexes (projectId+time, visitorHash, UTM, event type/name) and
      uniqueness/attribution constraints; cascade rules
- [x] Initial migration `prisma/migrations/0_init` + `migration_lock.toml`
- [x] `db:*` scripts; validate · generate · typecheck · build all pass
- [x] Normalize `PRD.md` + `AGENT-RULES.md` (from `.txt`)

## Phase 1.5 — Live Database Infrastructure ✅ (complete)

- [x] Create dedicated Supabase project **OneMetric** (`ladsqshpcdyjruzohkvb`,
      eu-central-1, free tier $0/mo)
- [x] Apply `0_init` migration to the live database (9 tables, 18 indexes, 10 FKs)
- [x] Baseline Prisma `_prisma_migrations` with correct checksum (so `migrate
      status` reports up to date; no re-apply conflict)
- [x] Determine working connection strategy: **pooler** host for both URLs
      (direct host is IPv6-only / unreachable). Correct cluster:
      `aws-1-eu-central-1.pooler.supabase.com` (not aws-0).
- [x] Document all env vars: `ENVIRONMENT.md` + updated `.env.example`
- [x] Enable **RLS deny-by-default** on all 10 public tables (9 app tables +
      `_prisma_migrations`); no policies yet. Critical advisory cleared; only
      INFO-level "RLS enabled, no policy" remains (expected). Prisma stays the
      primary data-access layer (owner role bypasses RLS).
- [x] Live Prisma connection test passed: `prisma migrate status` →
      "Database schema is up to date!" against the live Supabase DB
- [x] _(Phase 2 check)_ RLS policies — evaluated: Supabase client does auth only
      (never queries `public.*`), so none needed yet. Revisit if a Supabase-client /
      PostgREST call ever reads a `public` table.

## Phase 2 — Authentication ✅ (complete)

- [x] Install `@supabase/ssr`, `@supabase/supabase-js`, `zod`
- [x] Supabase SSR helpers: browser client, server client, middleware session
      refresh (`lib/supabase/*`)
- [x] Root `middleware.ts`: refresh session + guard `/dashboard` + redirect
      signed-in users away from `/login` `/signup`
- [x] `lib/auth.ts`: `getAuthUser` / `syncUser` / `requireUser` — mirrors the
      Supabase auth user into `public.User` (idempotent upsert via Prisma)
- [x] Auth server actions (`server/actions/auth.ts`): login, signup, logout
      (zod-validated)
- [x] Email-confirmation route handler (`app/auth/confirm/route.ts`)
- [x] UI: `(auth)` group with login + signup pages and forms (shadcn
      button/input/label/card, `useActionState`)
- [x] Protected `/dashboard` layout (guard + header + sign-out) and page
- [x] Landing page CTAs to sign in / sign up
- [x] Publishable key wired into env; Auth verified reachable (email signups on,
      `mailer_autoconfirm = false` → email confirmation required)
- [x] **RLS evaluation:** Supabase client is used for **auth only** (touches the
      `auth` schema, never `public.*`). All app data goes through Prisma (owner role,
      bypasses RLS). → **No RLS policies needed in Phase 2.** Add them only when/if a
      Supabase-client/PostgREST call reads a `public` table.
- [x] Verified: typecheck · lint · build all pass

## Phase 3 — Tracking Script ✅ (complete)

- [x] Implement `packages/tracker` (pageviews + SPA history patch + `track()` +
      pre-load queue + Do-Not-Track), tiny (1.6 kB min), no runtime deps
- [x] esbuild build → `apps/web/public/onemetric.js`; root `build:tracker` script;
      `build` runs it before the web build
- [x] `POST /api/collect` (**Node** runtime — Prisma can't run on Edge without extra
      infra) + zod validation + permissive CORS + OPTIONS; always 204 (no key leak)
- [x] Minimal UA parsing (device/browser/os), geo via `x-vercel-ip-country`,
      daily-rotating cookieless visitor hash, 30-min session windowing
- [x] Minimal Project CRUD (needed for install/verify): create action + tenancy-scoped
      list/get queries; `/dashboard` projects list + create form
- [x] Install snippet (copy) + live verification UI on `/dashboard/[projectId]`
- [x] `VISITOR_HASH_SALT` added to env + documented
- [x] Verified end-to-end against the **live DB**: events ingested, session aggregated
      (pageviewCount, entry/exit, UTM, referrer, device/browser/os), test data cleaned up
- [x] typecheck · lint · build all pass

## Phase 4 — Analytics Dashboard ✅ (complete)

- [x] Aggregation queries (`server/queries/analytics.ts`): unique visitors, sessions,
      pageviews, pages/session, avg session duration, bounce rate; per-day timeseries;
      breakdowns (top pages, referrers, countries, devices, browsers). Raw SQL for
      metrics/timeseries; Prisma `groupBy` for breakdowns
- [x] Overview UI on `/dashboard/[projectId]`: 6 metric tiles, timeseries chart,
      date-range selector (7/30/90d via `?range`), project switcher
- [x] Breakdown cards with proportional bars; country codes → names; device labels
- [x] Dependency-free SVG `BarChart` (no charting library added)
- [x] Restructured project routes: `/dashboard/[projectId]` = analytics overview,
      `/dashboard/[projectId]/settings` = install/verify (moved from Phase 3); shared
      `ProjectHeader` with Overview/Settings tabs
- [x] Empty state when no data in the period (links to install)
- [x] Helpers: `lib/format.ts` (number/duration/percent/country), `lib/range.ts`
- [x] Verified against the **live DB**: overview math (sessions 3, unique 2, pv 6,
      duration 60s, bounce 0.333), groupBy breakdowns, and timeseries all correct;
      seed + temp script removed afterward
- [x] typecheck · lint · build all pass

## Phase 5 — Event Tracking ✅ (complete)

- [x] Custom-event queries (`server/queries/events.ts`): `getEventSummary` (per-name
      occurrences + unique sessions) and `getEventDetail` (totals, zero-filled daily
      trend, 20 recent occurrences with metadata)
- [x] Events list page `/dashboard/[projectId]/events` (range selector, table linking
      to drill-in, empty state with `track()` docs)
- [x] Event drill-in `/dashboard/[projectId]/events/[name]` (metric tiles, trend chart,
      recent-occurrences table showing path + metadata)
- [x] "Events" tab added to `ProjectHeader`
- [x] `track()` documentation (`CustomEventsDoc`) on the Settings page + the empty state
- [x] `eachUtcDay` helper added to `lib/range.ts` (shared trend zero-fill)
- [x] Verified against the **live DB**: summary (signup 2/2, purchase 1/1, pageviews
      excluded) and detail (trend + recent occurrences + metadata) correct; seed removed
- [x] typecheck · lint · build all pass

## Phase 6 — Funnels ✅ (complete)

- [x] Funnel queries (`server/queries/funnels.ts`): `listFunnels`, `getOwnedFunnel`
      (ownership via project relation), `getFunnelResults`
- [x] Funnel actions (`server/actions/funnels.ts`): `createFunnel` (funnel + ordered
      steps in one create), `deleteFunnel` (owner-scoped). Update = delete + recreate
      (no edit UI in MVP)
- [x] Builder UI (`CreateFunnelForm`): name + dynamic step rows (add/remove), each step
      a pageview path or custom event; zod-validated (2–10 steps)
- [x] **Sequential conversion**: per session, walk events in time order advancing a
      step pointer; count sessions reaching each step → conversion (vs step 1) +
      drop-off + overall conversion
- [x] Visualization (`FunnelChart`): per-step bars, counts, conversion %, drop-off
- [x] Pages: `/dashboard/[projectId]/funnels` (list + builder),
      `/funnels/[funnelId]` (results + range selector + delete); "Funnels" tab added
- [x] Verified against the **live DB**: crafted 5-session scenario incl. an out-of-order
      session and a skip → counts `[5,2,1]` exactly as expected; seed + temp script removed
- [x] typecheck · lint · build all pass

## Phase 7 — PayPal Revenue Attribution ✅ (complete)

- [x] AES-256-GCM credential encryption (`lib/crypto.ts`, `CREDENTIALS_KEY` env)
- [x] Integration connect/disconnect (`actions/integrations.ts`) storing encrypted
      PayPal creds (client id/secret/webhook id/environment) per project;
      `queries/integrations.ts` for status + decrypted creds (server-only)
- [x] `POST /api/webhooks/paypal/[projectId]` — verifies signature via PayPal's
      verify-webhook-signature API (OAuth + creds), then records on
      `PAYMENT.CAPTURE.COMPLETED`
- [x] `server/ingest/paypal.ts`: token fetch, signature verify, capture extraction,
      `custom_id` parsing, `recordRevenueEvent` (upsert keyed on projectId+externalId)
- [x] UTM attribution from `custom_id` (`utm_source`/`utm_campaign`) or `om_session`
      → resolves the session's UTMs
- [x] Revenue queries (`queries/revenue.ts`): total + count, by source, by campaign,
      recent payments; `formatMoney` helper; `BreakdownCard` gained a `format` prop
- [x] Revenue page `/dashboard/[projectId]/revenue` (connect form + webhook setup when
      disconnected; metrics + breakdowns + recent payments + disconnect when connected);
      "Revenue" tab added
- [x] Verified against the **live DB**: credential encrypt→store→decrypt round-trip,
      attribution (custom_id UTMs + om_session lookup), upsert idempotency, and
      revenue-by-source totals all correct; seed + temp script removed
- [x] **Not testable here**: PayPal's signature-verification API call needs real
      merchant credentials — implemented per docs but not exercised end-to-end
- [x] typecheck · lint · build all pass

## Phase 8 — Weekly Reports ✅ (complete) — V1 MVP DONE 🎉

- [x] `ReportSubscription` management: add/remove/enable-disable recipients + "Send now"
      (`actions/reports.ts`, `queries/reports.ts`, owner-scoped); `/dashboard/[projectId]/reports`
      page + "Reports" tab
- [x] Templated report builder (`server/reports/builder.ts`) — last-7-day metrics +
      top pages (reuses analytics queries; **no AI**)
- [x] React Email template (`weekly-email.tsx`) + Resend sender (`send.ts`); gracefully
      no-ops without `RESEND_API_KEY`
- [x] `GET /api/cron/weekly-reports` — `CRON_SECRET`-protected, builds each project's
      report once, sends to enabled recipients, stamps `lastSentAt`
- [x] `vercel.json` cron (Mondays 09:00 UTC); env: `RESEND_API_KEY`,
      `REPORT_FROM_EMAIL`, `CRON_SECRET`
- [x] Verified on a running server against the **live DB**: cron returns
      `{ok:true, recipients:1, sent:0}` with the secret (report built, send skipped — no
      key), `401` without/with a wrong secret; seed removed
- [x] **Not testable here**: actual Resend send + email HTML delivery needs a real
      Resend key + verified domain
- [x] typecheck · lint · build all pass

---

# Launch Prep (post-V1) — see `~/.claude/plans/plan-what-need-to-prancy-wren.md`

## Phase 9 — Billing via Merchant-of-Record

Provider: MoR (Algeria payout). **2Checkout vs Paddle still undecided** — provider-specific
checkout + webhook deferred to last.

**Groundwork ✅ (complete)**
- [x] Schema: `Plan { FREE PRO }` enum + `User` billing fields (`plan`,
      `subscriptionStatus`, `currentPeriodEnd`, `billingCustomerId`,
      `billingSubscriptionId`); migration `20260614000000_add_billing` applied to live DB
      (via `prisma migrate deploy`) + client regenerated
- [x] `lib/plans.ts` (Free/Pro limits: projects, monthly events, retention)
- [x] `queries/billing.ts` (`getBillingOverview`, `canCreateProject`)
- [x] Plan gating in `createProject` (blocks past `maxProjects` with upgrade message)
- [x] Billing page `/dashboard/billing` (plan + usage bars + upgrade CTA) + "Billing"
      nav link; `actions/billing.ts` + `UpgradeButton` seam (provider-pending)
- [x] Verified: existing user defaulted to FREE; typecheck · lint · build pass

**Remaining (needs chosen MoR + approved account)**
- [x] **Paddle chosen**; vendor account created + KYB/website submitted (2026-06-14).
      **✅ Verification PASSED (2026-06-15)** — Algeria seller approved → billing build unblocked.
- [ ] **(user)** add Paddle **payout details** (Business Account → Payouts) — final "can funds
      reach Algeria" check (SWIFT to USD/EUR, or PayPal). Doesn't block sandbox build.
- [x] **Code built (2026-06-15):** Paddle.js overlay checkout (`UpgradeButton`, passes
      `custom_data.user_id`), `manageBilling` → Paddle customer-portal session,
      `POST /api/webhooks/paddle` (HMAC `Paddle-Signature` verify → syncs `User.plan/
      subscriptionStatus/currentPeriodEnd/billingCustomerId/billingSubscriptionId`).
      `trialing`/`active`/`past_due` → PRO; `paused`/`canceled` → FREE. 6 unit tests.
      Pro product/price created in **Sandbox** (`pri_01kv625awpdgwezwk0b2xttgbc`), 7-day trial.
- [ ] **(user)** Paddle Sandbox: get **client token** + **API key** (Dev Tools → Authentication)
      and create a **webhook destination** → `https://onemetric.sbs/api/webhooks/paddle`
      (copy its signing secret).
- [ ] **(user)** set Vercel env: `NEXT_PUBLIC_PADDLE_ENV=sandbox`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
      `NEXT_PUBLIC_PADDLE_PRICE_PRO`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET` → redeploy.
- [x] **Sandbox end-to-end VERIFIED (2026-06-15) — both directions:** test-card checkout →
      `plan=PRO, subscriptionStatus=trialing, currentPeriodEnd=2026-06-22`; then cancel →
      `plan=FREE, subscriptionStatus=canceled, currentPeriodEnd=null`. Required adding
      `onemetric.sbs` as an approved domain in Paddle Checkout settings.
- [x] **Manage-billing portal VERIFIED (2026-06-15):** opens the Paddle customer portal.
      Root cause of initial 403 "not authorized to create customer-portal-session" = the
      API key was missing the **Customer portal sessions: Write** scope (plus Customers
      R/W). ⚠️ The **production** API key needs those same scopes. Portal cancel = graceful
      (cancel at period end → stays PRO until `currentPeriodEnd`, then `subscription.canceled`
      → FREE); dashboard "cancel immediately" → FREE now. Both confirmed.
- [ ] **GO LIVE:** in **production** Paddle (`vendors.paddle.com`) recreate the Pro product +
      $19/mo price w/ 7-day trial (prod `pri_…`), create a production **client token** +
      **API key** (scopes: **Customer portal sessions: Write** + **Customers: R/W**) +
      **webhook destination** (→ `https://onemetric.sbs/api/webhooks/paddle`, usage Both, all
      subscription events), add `onemetric.sbs` to production **Checkout approved domains**,
      then set the 5 Vercel env vars to production values (`NEXT_PUBLIC_PADDLE_ENV=production`)
      and redeploy. Confirm Paddle **payout details** added first.

## Phase 10 — Public site + legal ✅ (complete)

- [x] `(marketing)` route group with shared header/footer `layout.tsx`
- [x] Landing `(marketing)/page.tsx` — hero, 6-feature grid, cookieless/GDPR section,
      how-it-works, pricing teaser (old placeholder `src/app/page.tsx` removed)
- [x] Pricing `(marketing)/pricing/page.tsx` — Free vs Pro driven by `lib/plans.ts`
- [x] Legal: `(marketing)/privacy/page.tsx` + `terms/page.tsx` + `refund/page.tsx`
      (cookieless / no-PII / EU data emphasis; refund = 14-day money-back, added 2026-06-14
      for Paddle website verification) — **still templates, need professional legal review.**
      Contact replaced with real `support@onemetric.sbs` — **receiving** via ImprovMX
      forwarding → Gmail (verified 2026-06-15).
- [x] SEO: `robots.ts` (disallow /dashboard,/api), `sitemap.ts`, `opengraph-image.tsx`
      (next/og), root `metadataBase` + OpenGraph/Twitter
- [x] Verified on a running server: `/ /pricing /privacy /terms /login /signup` → 200;
      `/robots.txt` `/sitemap.xml` `/opengraph-image` serve correctly; typecheck · lint ·
      build pass

## Phase 11 — Tests + CI ✅ (complete)

- [x] Vitest added (`vitest.config.ts` + `vitest.setup.ts` dummy env, alias `@`→src);
      `test` scripts (web + root)
- [x] Refactor: extracted pure `computeFunnel(events, steps)` from `getFunnelResults`
- [x] **38 unit tests, 8 files** — `computeFunnel` (incl. the [5,2,1] ordering scenario),
      `parseCustomId`/`extractCapture`, `computeVisitorHash`, `parseUserAgent`,
      `encryptJson`/`decryptJson`, `format.ts`, `range.ts`, and the
      collect/funnel/PayPal zod schemas
- [x] Hardened `countryName` to fall back to the raw code on malformed input
      (`Intl.DisplayNames` `fallback: "none"`)
- [x] CI: `.github/workflows/ci.yml` — npm ci · prisma generate · typecheck · lint ·
      test · build (with dummy env)
- [x] All green locally: test (38 passed) · typecheck · lint · build

## Phase 12 — Deploy + prod config (repo work ✅ · deploy pending user account actions)

- [x] `git init` + initial commit on `main` (141 files; verified **no `.env` secrets
      committed**, `.env.example` template kept)
- [x] Fixed `apps/web/.gitignore` (`.env*` was hiding `.env.example`) + added
      `.gitattributes` (LF normalization → byte-stable tracker/migration files) + `.nvmrc` (20)
- [x] `DEPLOY.md` runbook (GitHub push, Vercel settings, env table, DB password rotation,
      Supabase Auth/SMTP, Resend, WAF, smoke test)
- [x] Generated fresh production secrets (handed over out-of-band, not committed)
- [x] GitHub repo (`lyesshml-del/Onemetric`) + push; auto-deploy wired
- [x] Vercel project (Root Directory `apps/web`) + env vars + **live deploy**
- [x] Rotated Supabase DB password; set Auth Site/Redirect URLs
- [x] **Verified in prod:** signup/login, dashboard, real analytics ingestion
- [x] Fixed two prod issues: git-author deploy block (git email→GitHub email) and the
      dashboard `Application error` (auth-id/`User` mismatch; data + `syncUser` hardened);
      added `prisma generate` to the build
- [ ] _(open)_ set GitHub repo back to **Private** — needs Vercel GitHub App private-repo
      access first (else deploys go `BLOCKED`); kept public for now (see HANDOFF gotchas)

## Post-deploy hardening (user's Phase 1–3)

### Phase 1 — Email ✅ (complete)
- [x] Domain `onemetric.sbs` bought (Vercel) + **verified in Resend** (eu-west-1)
- [x] Vercel env (prod): `RESEND_API_KEY`, `REPORT_FROM_EMAIL=OneMetric <reports@onemetric.sbs>`
- [x] Supabase Auth custom SMTP via Resend (`smtp.resend.com:465`, `noreply@onemetric.sbs`)
- [x] **Verified weekly-report send in prod** (cron → `{ok:true, sent:1}`, `lastSentAt`
      stamped). A test `ReportSubscription` (supradz14@gmail.com) was added — removable in UI.
- [x] _(user)_ signup-confirmation email confirmed working (after SMTP `username=resend` fix)
- [x] Branded auth email templates saved in `apps/web/emails/` (paste into Supabase dashboard)

### Phase 2 — WAF rate limit on `/api/collect` ✅ (complete)
- [x] **(user)** created Vercel Firewall rule: path `=/api/collect` → Rate Limit (Fixed
      Window) 100 req / 10s per IP → Deny (429). Published/live.
- [x] **(agent)** verified with the burst command in HANDOFF. Post-rule test (2026-06-14):
      `143×204, 33×429, 4×500` → `429`s appear (were `0` before) → rule **active**.
- [x] harden `/api/collect` to return `204` on DB errors (route wraps `ingest` in
      try/catch → logs + 204, never 500; regression test in `route.test.ts`). 2026-06-15.
      **Verified live**: two 40-way bursts → `0×500` (was `4/180`). Deployed in `3f63a3a`.

### Phase 3 — Custom domain → `NEXT_PUBLIC_APP_URL` ✅ (complete, 2026-06-14)
- [x] `onemetric.sbs` attached to Vercel (apex serves the app; `www` 307→apex)
- [x] **(user)** `NEXT_PUBLIC_APP_URL=https://onemetric.sbs` (Prod) + redeploy
- [x] **(user)** Supabase Auth Site URL + Redirect URL (`/auth/confirm`) set to apex (vercel kept as fallback)
- [x] **(agent)** verified: `sitemap.xml`/`robots.txt`/install snippet now use `onemetric.sbs`;
      apex `/`, `/login`, `/onemetric.js` all `200`

## Cleanup before first real client
- [ ] Remove test data from the live DB: test `ReportSubscription` (supradz14@gmail.com),
      test analytics in DataFast (session + pageviews + `signup`), and unconfirmed auth users
      for `adembensari7@gmail.com`.
- [ ] **Reset `supradz14@gmail.com` billing** — sandbox checkout left it `plan=PRO,
      trialing` with **sandbox** customer/subscription ids (`ctm_…`/`sub_…`) that don't exist
      in production Paddle. Reset to FREE (clear plan/subscriptionStatus/currentPeriodEnd/
      billingCustomerId/billingSubscriptionId) before launch, unless comping the founder.
- [ ] Set the GitHub repo back to **Private** — ⚠️ only after granting the **Vercel GitHub
      App** access to the private repo, or all deploys go `BLOCKED` (learned 2026-06-15; repo
      is **public** for now). See deploy gotchas in HANDOFF.

## Phase 13 — MoR billing wiring (2Checkout vs Paddle, Algeria payout) + first client (see plan)

---

## Move #1 — Opinionated Overview (design-led redesign)

Source of truth: `DESIGN-AUDIT.md`, `OVERVIEW-SPEC.md`, `MOVE-1-IMPLEMENTATION-PLAN.md`.
Strictly incremental, one phase per PR, additive, `main` always shippable. Scope = the
Overview at `app/dashboard/[projectId]/page.tsx` only.

- [x] **Phase 0 — Foundations ✅ (2026-06-16).** Shared comparison + presentation primitives,
      **all additive, nothing wired into any page → zero visual change.** Verified: 59 tests
      (+11), typecheck · lint · build green; grep confirms no UI imports the new symbols.
      Added: `previousRange` (lib/range), `getOverviewMetricsDelta`+`OverviewMetricsWithDelta`
      (queries/analytics, reuses `getOverviewMetrics`), `computeDelta`/`formatDeltaPct`/
      `formatDeltaPoints`/`flagEmoji`/`monogram` (lib/format), `<Delta>` badge
      (components/dashboard/delta.tsx), Lede type contract (lib/lede.ts, types only).
- [ ] Phase A — Hero (TrendChart + big number + Delta + prev-period comparison)
- [ ] Phase B — Lede system (`buildLede`, progressive clauses)
- [ ] Phase C — KPI strip (StatCard + Sparkline + active-now; demote engagement)
- [ ] Phase D — Sources card (triad slot 1; **decide D1 favicon-privacy → recommend monograms**)
- [ ] Phase E — Funnel card (triad slot 2; **decide E1 primary-funnel = first/oldest**)
- [ ] Phase F — Revenue card (triad slot 3; lights up Lede money clause + Revenue KPI)
- [ ] Phase G — Audience card (merge Countries/Devices/Browsers; flags + glyphs)
- [ ] Phase H — Top pages + diagnostics (detail row)
- [ ] Phase I — Mobile layout pass
- [ ] Phase J — Cleanup + hierarchy polish (retire `MetricCard`, focused empty state)

> **Not started: Phases A–J.** Each requires its own approval. Accent color is **Move #3**.

---

## Excluded from V1 (ROADMAP only — never implement)

Session replay · heatmaps · A/B testing · feature flags · AI reports ·
SEO tracking · alerts (email/Slack/Discord) · Stripe integration.
