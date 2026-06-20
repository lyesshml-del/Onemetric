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
- [x] **Phase A — Hero ✅ (2026-06-16).** Overview's old bar-chart card → a hero: big tabular
      unique-visitors number + `<Delta>` vs previous period + new `TrendChart` (area+line,
      ghosted previous-period line, branded hover tooltip, crisp non-distorting scaling). Hero
      placed **first** as the visual anchor. **Tiles + breakdowns + empty state unchanged**
      (later phases). Reuses Phase 0 (`previousRange`, `<Delta>`); `getTimeseries` exported
      (additive). Verified: 59 tests, typecheck · lint · build green; live DB cross-check of the
      prev-period window (DataFast cur 1/1, prev 0/0 → shows "—" no-baseline). Monochrome
      (accent = Move #3). Files: +`components/charts/trend-chart.tsx`; edited `page.tsx`,
      `queries/analytics.ts` (export only).
- [x] **Phase B — Lede system ✅ (2026-06-16).** Calm one-sentence "what changed?" briefing at
      the top of the Overview (above the hero). **Traffic-only** (visitors trend + top-source
      clause from existing referrer data); funnel/revenue clauses are **E/F**. Pure templated
      `buildLede` (no AI) covering every edge case: up / down / steady (tiny <0.5% = steady) /
      no-baseline / zero / singular. New `<Lede>` (server component, muted prose + bright nouns).
      Reuses Phase 0 (`computeDelta`, `formatDeltaPct`, `LedeToken`/`LedeInput`); relaxed
      `topSource.href` to optional (no Sources page yet → no drill link in B). Verified: 69 tests
      (+10), typecheck · lint · build green; real DataFast data → "1 visitor this week, led by
      google.com." Monochrome (accent = Move #3). Files: +`lib/lede.ts` (impl),
      +`components/dashboard/lede.tsx`, +`rangePeriodWord` (lib/range); edited `page.tsx`.
- [x] **Phase C — KPI strip ✅ (2026-06-16).** The 6 duplicate vanity tiles → a 4-KPI strip:
      **Pageviews** (value + `<Delta>` + sparkline, all from existing timeseries — C1), **Signup
      conversion** + **Revenue** (placed but *pending*, dimmed "—", light up in E/F), **Active
      now** (live count + dot, new `getActiveNow` query). Bounce / pages-per-session / avg
      duration **demoted** to one muted Engagement line. New `<StatCard>` (unified `rounded-xl`
      card — same system as hero/breakdown) + `<Sparkline>` (server-safe). Volume KPI = Pageviews
      (spec's "Sessions *or* Pageviews"; chose Pageviews for the existing sparkline series).
      Additive, no schema/deps; `MetricCard` no longer used (file retained → retire in Phase J).
      Verified: 69 tests, typecheck · lint · build green; live DB numbers match (pageviews 2,
      active 0, bounce 0.0%). Monochrome (accent = Move #3). Files: +`stat-card.tsx`,
      +`sparkline.tsx`, +`getActiveNow` (analytics); edited `page.tsx`.
- [x] **Phase D — Sources card ✅ (2026-06-16).** Promoted top referrers into the **outcomes
      triad** as "Top sources" with **monogram/letter avatars** (D1 approved — **no third-party
      favicon service**, privacy-first), label + subtle share bar + tabular value. Introduced the
      3-col triad container: **Sources (live)** + Signup-funnel + Revenue-by-source placed as
      **pending** placeholders (light up in E/F). Referrers **moved out** of the old breakdown
      grid (now 4 cards) — transitional until G/H/J. New `<SourceRow>` (reusable by G/H) +
      `<SourcesCard>`; reuses existing `topReferrers` (no new query) + Phase 0 `monogram`.
      Verified: 69 tests, typecheck · lint · build green; Sources data matches `getTopReferrers`
      (live: google.com 1). One card system (`rounded-xl`); monochrome (accent = Move #3).
      Files: +`source-row.tsx`, +`sources-card.tsx`; edited `page.tsx`.
- [x] **Phase E — Funnel card ✅ (2026-06-16).** Replaced the "Signup funnel" triad placeholder
      with the **primary funnel** (E1 = oldest funnel, no schema/pin field): new `<FunnelMini>`
      (compact step bars + overall conversion) in a card titled by the funnel name; **no-funnel →
      "Create a funnel" CTA**. Filled the **Signup conversion KPI** (value % + `mode="points"`
      delta vs previous period). Extended the **Lede** with a funnel clause ("… <name> converts at
      X%", linked to the funnel) — appended only when the funnel had entrants. Reused
      `getFunnelResults`/`computeFunnel`; added additive `getPrimaryFunnel` (oldest + steps).
      Verified: 72 tests (+3), typecheck · lint · build green; live DataFast (0 funnels) →
      CTA + pending KPI + no Lede clause (correct); present-path covered by `computeFunnel [5,2,1]`
      + new Lede tests. One card system; monochrome (accent = Move #3). Files:
      +`funnel-mini.tsx`, +`getPrimaryFunnel` (queries/funnels), `lib/lede.ts` (clause), `page.tsx`.
- [x] **Phase F — Revenue card ✅ (2026-06-16).** Replaced the "Revenue by source" triad
      placeholder with the real card (new `<RevenueMini>` — reuses `<SourceRow>` with money
      formatting + monogram avatars + emphasized total; **not-connected/no-revenue → "Connect
      revenue" CTA**). Filled the **Revenue KPI** (money value + % delta vs previous period).
      Extended the **Lede** with a revenue clause ("`$total` in revenue, led by `<source>`",
      linked) — only when revenue came from a **named/attributable** source. Reused
      `getRevenueSummary`/`getRevenueBySource`/`getPayPalConnection` (no new queries). **Triad is
      now fully real (Sources + Funnel + Revenue).** Verified: 75 tests (+3), typecheck · lint ·
      build green; live DataFast (0 revenue, not connected) → CTA + pending KPI + no Lede clause
      (correct). One card system; monochrome (accent = Move #3). Files: +`revenue-mini.tsx`,
      `lib/lede.ts` (clause), `page.tsx`.
- [x] **Phase G — Audience card ✅ (2026-06-16).** Merged the 3 breakdown cards (Countries,
      Devices, Browsers) into **one Audience card** with a segmented control (small client
      toggle; all 3 datasets already fetched → switching just re-renders, no new request/
      animation). New `<AudienceCard>` reuses `<SourceRow>` (gained an additive optional `icon`):
      **flags** for countries (`flagEmoji` + `countryName`), monochrome **lucide** device icons
      (already a dep), **monogram** for browsers. Removed `mapCountries`/`mapDevices` + the now-
      unused `countryName`/`BreakdownRow` page imports. No new query (reuses
      `countries`/`devices`/`browsers`). Verified: 75 tests, typecheck · lint · build green;
      live DataFast → DZ→Algeria 1 / Desktop 1 / Chrome 1 (matches old cards). One card system;
      monochrome (accent = Move #3). Route `1.9→3.68 kB` (first Overview client component).
      ⚠️ On **Windows**, flag emojis may render as letter-pairs ("DZ") — platform font limit,
      degrades gracefully. Files: +`audience-card.tsx`, `source-row.tsx` (icon prop), `page.tsx`.
- [x] **Phase H — Top pages + diagnostics ✅ (2026-06-17).** Demoted **Top pages** from the legacy
      `<BreakdownCard>` to a new `<TopPagesCard>` that reuses `<SourceRow>` — same monogram-avatar +
      share-bar + tabular-value styling as Sources/Audience (one system). Pages have no favicon, so
      the privacy-safe **monogram default** applies (D1) — no icon override, mirroring `<SourcesCard>`
      (honors the recorded Phase G note). Finalized the demoted **Engagement** line (Bounce ·
      pages/session · avg session) with `tabular-nums` (spec §6: numbers never jitter). **No
      query/schema change** — reuses `analytics.topPages` (`getTopPages`), so numbers are identical
      to the prior (verified) rendering. `<BreakdownCard>` stays (Revenue page still uses it).
      Verified: 75 tests, typecheck · lint · build green; Overview route **3.68 kB (unchanged —
      `<TopPagesCard>` is server-only, zero client JS)**. Monochrome (accent = Move #3). Files:
      +`top-pages-card.tsx`, `page.tsx`.
- [x] **Phase I — Mobile layout pass ✅ (2026-06-18).** A CSS-only responsive pass over the
      assembled Overview (no data/query/logic change). **Hero chart** shorter on phones via a new
      `<TrendChart heightClassName>` (200px <640 / **260px ≥640 — desktop unchanged**). **Outcomes
      triad** stacks on mobile in the spec §10 order **Funnel → Sources → Revenue** using `order-*`
      utilities that reset at `md` (≥768 → natural Sources | Funnel | Revenue row); `<SourcesCard>`
      gained an additive `className` passthrough for this. KPI strip (`grid-cols-2 lg:grid-cols-4` =
      2×2 mobile → 4 desktop) + detail row (`md:grid-cols-2`, stacks) were already correct;
      `<Sparkline>` already scales (`w-full`, 22px) — no variant needed. `ProjectHeader` tabs are
      shared across all pages → out of scope (Overview only). Verified: 75 tests, typecheck · lint ·
      build green; Overview route **3.72 kB** (was 3.68; +~40 B for `cn` + class strings). Desktop
      provably unchanged. Monochrome (accent = Move #3). Files: `trend-chart.tsx`, `sources-card.tsx`,
      `page.tsx`.
- [x] **Phase J — Cleanup & hierarchy polish ✅ (2026-06-18).** Final coherence pass. **Removed**
      the redundant "Overview" `<h2>` (the ProjectHeader tab names the view) and the hero's bare
      min/max date labels (the branded hover tooltip provides dates — spec §4.2). **Replaced** the
      generic "No data in this period yet" card with the single focused empty state (spec §7): a
      live emerald pulse + "Waiting for your first pageview" + the **copyable install snippet**
      (reuses `<InstallSnippet>`; snippet built Overview-local so Settings stays untouched) + a quiet
      "Full setup" link. **Coherence:** `tabular-nums` added to the Lede (every Overview number is
      now tabular); a `focus-visible` ring on the Audience segmented control (matches the Button
      convention); the Overview is on **one card spec** (`Card`/`StatCard`, `rounded-xl`) + **one bar
      style** (`bg-foreground/5` across `SourceRow`/`FunnelMini`). **`MetricCard` NOT deleted** —
      grep found **3 live importers** (Events-detail, Funnels-detail, Revenue), so deleting it would
      break those pages; its unification is deferred to **Move #3**. `BreakdownCard` likewise stays
      (Revenue uses it). No query/schema change. Verified: 75 tests, typecheck · lint · build green;
      Overview route 4.48 kB (was 3.72; +~2 kB for the embedded `<InstallSnippet>`). Monochrome
      (emerald = existing "live" semantic). Files: `page.tsx`, `lede.tsx`, `audience-card.tsx`,
      `DESIGN-SYSTEM.md`.

> **Move #1 — Opinionated Overview: COMPLETE & APPROVED (2026-06-18).** Phases 0, A–J done;
> `ONE-15` Done, the **Move #1** Linear project **Completed**. The Overview is a briefing: Lede →
> Hero → 4 KPIs → outcomes triad → detail row; deltas everywhere; responsive; one card/number/bar
> spec; focused empty state. Accent/identity stays **Move #3**.

---

## Move #2 — Feel & Performance ✅ (COMPLETE & APPROVED)

> Planning artifacts written **2026-06-18** (planning-only session — **no code**): `MOVE-2-SPEC.md`
> (the "instant + alive" design spec) + `MOVE-2-IMPLEMENTATION-PLAN.md` (phased build, 0 + A–G).
> Goal: make the app *feel* instant and alive — optimistic switching, skeletons, count-up, chart
> draw-in, view transitions, hover/press — **Apple-grade restraint**, `prefers-reduced-motion`
> respected, **server-first preserved**, **no animation library / no new dependency**. Linear:
> `Move #2 — Feel & Performance` (Planned) with 8 phase issues. **Do not implement any phase until
> the spec + plan are approved.**

- [x] **Phase 0 — Motion foundations ✅ (2026-06-18)** (`ONE-47`) — motion tokens + one easing
      (`ease-soft`) in `globals.css`; global `prefers-reduced-motion` guard + `useReducedMotion()`;
      `useCountUp` (rAF) with pure math in `lib/motion.ts` (**+8 unit tests**); `<Skeleton>` + the
      `shimmer`/`draw-in` keyframes (defined, unused yet). **Nothing wired into a page → zero visible
      change** (Overview route 4.48 kB, unchanged; grep-confirmed self-contained). 83 tests,
      typecheck · lint · build green. No new dependency. Files: `globals.css`,
      `lib/motion.ts`(+test), `lib/hooks/use-reduced-motion.ts`, `lib/hooks/use-count-up.ts`,
      `components/ui/skeleton.tsx`, `DESIGN-SYSTEM.md`.
- [x] **Phase A — Skeletons / loading states ✅ (2026-06-18)** (`ONE-48`) — the Overview now streams
      a layout-matching skeleton (no blank flash, no layout shift). New `<OverviewSkeleton>` (content
      skeleton, reused as Phase B's pending visual) + an in-page `<Suspense>` in `page.tsx` (split
      into a sync wrapper + the unchanged async `OverviewContent`) with an `OverviewLoading` fallback
      (header + range + `<OverviewSkeleton>`). **Scoped to the Overview** (no route-level
      `loading.tsx`, since there's no `[projectId]/layout.tsx` → other tabs unaffected).
      Reduced-motion → static (Phase-0 global guard). Server-only (route 4.48 kB, unchanged). 83
      tests, typecheck · lint · build green. No new dependency. Files: +`overview-skeleton.tsx`,
      `page.tsx`.
- [x] **Phase B — Optimistic range switching ✅ (2026-06-18)** (`ONE-49`) — new `<OverviewShell>`
      (client) owns the Overview range select + navigates via `useTransition`: instant active value,
      content **dimmed + aria-busy** while the server re-renders (the transition suppresses the
      Phase-A skeleton → no flash), **scroll preserved** (`scroll:false`). Page stays an RSC (content
      passed as children); no client data lib. `RangeSelect` is **shared** (Events/Funnels/Revenue) →
      left untouched; the shell has its own select. **B2 (section tabs) split to `ONE-55`.** 83 tests,
      typecheck · lint · build green; route 4.64 kB (+0.16). No new dependency. Files:
      +`overview-shell.tsx`, `page.tsx`.
- [x] **Phase B2 — Optimistic section-tab switching ✅ (2026-06-18)** (`ONE-55`) — new client
      `<TabNav>` (extracted from the shared `<ProjectHeader>`): clicking a tab flips the active
      underline **immediately** (optimistic `pendingKey`) + a subtle pending dim while the destination
      loads; cleared on commit (effect on `active`, incl. back/forward); native `<Link>` nav preserved
      (prefetch, real hrefs, a11y; modifier-clicks guarded); `aria-current` added. Default (non-pending)
      render identical to the old nav → the 6 pages unchanged. Reduced-motion-safe (color/opacity).
      83 tests, typecheck · lint · build green; Overview First Load unchanged (119 kB); the other 5
      pages gain the small `<TabNav>` client component. No new dependency, no client data lib. Files:
      +`tab-nav.tsx`, `project-header.tsx`.
- [x] **Phase C — Number count-up ✅ (2026-06-18)** (`ONE-50`) — new `<CountUp>` (client, wraps the
      Phase-0 `useCountUp`) animates the hero number + the 4 KPI values up once on arrival;
      `tabular-nums`; reduced-motion / no-JS / SSR → final value instantly. Format is a **serializable
      token** (`"number"|"percent"|"money"` + currency) since a function can't cross the server→client
      boundary; `"number"` rounds to an integer. `StatCard.value` widened `string → ReactNode`
      (non-breaking). Removed the now-unused `formatMoney` import. 83 tests, typecheck · lint · build
      green; route 5.12 kB (+0.48). No new dependency. Files: +`count-up.tsx`, `stat-card.tsx`,
      `page.tsx`. (Hard-load reset + delta intra-count jiggle → Phase G polish.)
- [x] **Phase D — Chart draw-in ✅ (2026-06-18)** (`ONE-51`) — the hero `TrendChart` value line + the
      `Sparkline` lines draw in once on mount via the Phase-0 `draw-in` keyframe (`pathLength=1` +
      `strokeDasharray=1` → `stroke-dashoffset` 1→0, works at any scaled length; `non-scaling-stroke`
      kept). Refined `--animate-draw-in` fill-mode `forwards → both` (hidden before the draw; degrades
      to fully-drawn if animations are off). Reduced-motion → instant/drawn (global guard); draws once
      (no replay on hover/data change). Chart scaling/tooltip/ghosted-prev-line/area untouched; CSS
      only (no client JS). 83 tests, typecheck · lint · build green; route 5.15 kB (+0.03). No new
      dependency. Files: `globals.css`, `trend-chart.tsx`, `sparkline.tsx`.
- [x] **Phase E — Hover & press micro-interactions ✅ (2026-06-18)** (`ONE-52`) — conservative,
      controls-only (no fake card/row hover, per direction). **Audience segmented control:** subtle
      press `active:scale-[0.97]` (gated off via `motion-reduce:active:scale-100`) + faint hover bg on
      non-selected tabs, on the `--motion-micro`/`ease-soft` tokens; focus-visible ring kept. **Range
      select (OverviewShell):** subtle `hover:bg-accent/50` tint + `--motion-micro` transition. No
      layout shift (transform/bg only); reduced-motion → color-only. Shared `RangeSelect`/`Button` +
      other pages untouched. 83 tests, typecheck · lint · build green; route 5.21 kB (+0.06). No new
      dependency. Files: `audience-card.tsx`, `overview-shell.tsx`.
- [x] **Phase F — Route / view transitions ✅ (2026-06-18)** (`ONE-53`) — native View Transitions
      API, **CSS-only**, progressive enhancement. A reduced-motion-gated
      `@view-transition { navigation: auto }` + a subtle ~200ms root cross-fade (`--motion-ease`) on
      **cross-document** navigations (full page loads). **Deliberately scoped to cross-document nav:**
      range changes already animate via Phase B (and aren't doc navs → no conflict); SPA section-tab VT
      would need the shared `ProjectHeader` interactive (B2/`ONE-55`) or Next's experimental API — both
      out of scope. Unsupported browsers / reduced-motion → instant nav. No component change, no JS, no
      dependency; Phase A/B/C/D untouched. 83 tests, typecheck · lint · build green; route 5.21 kB
      (unchanged). File: `globals.css`.
- [x] **Phase G — Polish, reduced-motion & a11y pass ✅ (2026-06-18)** (`ONE-54`) — the final Move #2
      coherence pass. **Tokenized** stray timings (`--animate-draw-in` `0.6s → var(--motion-entrance)`;
      view-transition `200ms → var(--motion-base)`). **Fixed the two Phase-C items:** `useCountUp` now
      **skips the initial mount** (shows the final value — no hard-load flash) and counts on **data
      change**; `<CountUp>` reserves the final width via an invisible **ghost** + overlay (no delta
      jiggle). Final values exact. **Reduced-motion sweep:** every motion gated (count-up via
      `useReducedMotion`; draw-in/dim/shimmer/pulse via the global guard; press via `motion-reduce`;
      VT gated). **a11y:** `aria-busy`/focus/focus-visible verified. 83 tests, typecheck · lint · build
      green; route 5.26 kB (+0.05, First Load unchanged). No new dependency. Files: `globals.css`,
      `use-count-up.ts`, `count-up.tsx`, `DESIGN-SYSTEM.md`.

> **Move #2 — Feel & Performance: FULLY COMPLETE** (Phases 0, A–G + B2; all in review). The app feels
> instant + alive: skeleton · optimistic range **+ section-tab** switching · count-up · chart draw-in ·
> hover/press · view transitions — all reduced-motion-first, no new dependency, server-first.
> **`ONE-55` (B2) is done — nothing else open in Move #2.** §9 criteria: 1 instant (range + sections)
> ✅ · 2 never-blank ✅ · 3 alive/once (draw-in on arrival ✅; count-up on data change, by design, to
> kill the flash) · 4 reduced-motion-whole ✅ · 5 nothing-regressed ✅. **Next: plan Move #3
> (accent/identity) — still locked until its plan is approved.**

---

## Move #3 — Identity & Craft ✅ COMPLETE & APPROVED (Phases 0, A–F done; Linear project Completed 2026-06-19)

> Design source of truth: **`MOVE-3-SPEC.md`** (the single signature accent + craft) +
> **`MOVE-3-IMPLEMENTATION-PLAN.md`** (phases 0 + A–F). Planning-only session **2026-06-18** — no code.
> The final design move: one restrained **violet accent** (lean into the ~285 hue already in the
> neutral tokens) applied **sparingly** (primary action · active state · hero data series · Lede-link
> hover) + craft (one card/number/chart spec end-to-end, a logomark, favicon/flag polish). **Moves #1
> & #2 must not change behavior; the accent is introduced only here.**

- [x] **Phase 0 — Accent token foundations ✅ (2026-06-19)** (`ONE-56`) — defined the signature accent in
      `globals.css` for **dark + light**, AA-verified, **applied to NOTHING** (zero visual change — the
      Move #1/#2 Phase-0 pattern). Tokens: `--brand` (fill) `oklch(0.56 0.18 285)` dark /
      `oklch(0.52 0.2 285)` light · `--brand-foreground` `oklch(0.985 0 0)` (on brand) · `--brand-text`
      (lighter accent-text-on-bg) `oklch(0.7 0.15 285)` dark / `== --brand` light. Mapped in
      `@theme inline` → `bg-brand`/`text-brand`/`border-brand`/`ring-brand`/`from-brand`/`fill-brand`/…
      (+ alpha modifiers like `from-brand/15`). **WCAG AA (computed sRGB→luminance, dark + light):**
      white-on-`--brand` (button) **4.76 / 5.73**; `--brand`-on-bg (series/ring) **4.00 / 5.98**;
      `--brand-text`-on-bg **7.15 / 5.98**; all in sRGB gamut. The spec's first guess
      `oklch(0.62 0.19 285)` was tuned **down** to L=0.56 (white-on-brand was only **3.70** → failed AA).
      **`--ring` kept neutral** (not branded); **no `--brand-muted`** (alpha modifiers cover washes).
      **Proven applied-to-nothing:** grep `src/**/*.{tsx,ts}` for `*-brand` → none; compiled CSS has the
      raw `--brand*` props (resolve) + **zero** `*-brand` utilities; route `/dashboard/[projectId]`
      **6.83 kB byte-identical** with vs without the tokens. No new tests (no JS logic; 83 unchanged &
      green). Verified: **83 tests**, typecheck · lint · build green. No new dependency; server-first;
      deltas green/red; live dot emerald; sparkline neutral. Files: `globals.css`.
- [x] **Phase A — Hero data series accent ✅ (2026-06-19)** (`ONE-57`) — the Overview hero `TrendChart`
      current-period **value line** `stroke-foreground → stroke-brand` + the **area fill** → a `--brand`
      → transparent SVG gradient (vertical `<linearGradient>`, stops `var(--brand)` @ 0.25 → 0 via inline
      style so it resolves per theme; unique `useId()` gradient id, colons stripped for a valid `url(#…)`).
      **"This is the data."** The **previous-period ghost line stays neutral** (`stroke-muted-foreground/40`
      dashed); gridlines, crosshair, hover **dot**, tooltip, and the hero **number + delta** stay
      neutral/semantic (**accent = the line + fill only**). Move #2 behaviour intact: the **draw-in**
      (`pathLength=1` + `animate-draw-in`), branded HTML tooltip, correct non-distorting scaling,
      `non-scaling-stroke`. **Sparkline untouched** (stays neutral — standing decision). **WCAG AA /
      visibility** (line = `--brand` on `--background`, from Phase 0): **4.00:1 dark / 5.98:1 light** —
      ≥3:1 graphical-object, clearly distinguishable (the gradient is decorative, not a contrast surface).
      **Accent scope proven:** the only applied `*-brand` utility is `trend-chart.tsx:141` (`stroke-brand`);
      `TrendChart` has a single consumer (the hero) → `BarChart` + every other surface unaffected.
      Verified: **83 tests** (unchanged — no JS logic to add; node-only suite, no jsdom), typecheck · lint ·
      build green; route `/dashboard/[projectId]` 6.83 → **6.95 kB** (+0.12 for `useId` + gradient markup).
      No new dependency; server-first; additive; deltas green/red; live dot emerald. Files:
      `trend-chart.tsx` (only). No browser in env → the dark/light visual is reasoned from valid SVG/CSS +
      the AA numbers + the green build.
- [x] **Phase B — Active / selected states ✅ (2026-06-19)** (`ONE-58`) — the accent now marks "the current
      thing." **`TabNav`** active tab: underline `border-foreground → border-brand` (label stays
      `text-foreground` — `text-brand` is 4.00:1 on `--background`, fails AA 4.5 at 14px; also one accent
      signal per control). **`AudienceCard`** selected segment: `bg-background text-foreground →
      bg-brand text-brand-foreground` (filled pill). **Range select left neutral** (`overview-shell.tsx`
      untouched) — native `<select>`; a single selected `<option>` can't be branded reliably, and there's
      no range *pill* to mark. **Move #2 optimistic behaviour intact** (`pendingKey`, transitions,
      `useTransition`) — only the active *colour* changed; non-active/hover/focus-visible/pending unchanged.
      `TabNav` is shared by all 6 project pages → every page's active-tab underline is now branded (uniform
      single-class swap; default render otherwise byte-identical → no per-page regression). **WCAG AA:** tab
      underline `border-brand` (2px graphical) on `--background` **4.00:1 dark / 5.98:1 light** (≥3:1);
      segment `text-brand-foreground` on `bg-brand` **4.76:1 dark / 5.73:1 light** (≥4.5). Verified:
      **83 tests**, typecheck · lint · build green; route `/dashboard/[projectId]` **6.96 kB** (+~0.01). No
      new dependency; server-first; additive; deltas green/red; live dot emerald; sparkline + `--ring`
      neutral. Files: `tab-nav.tsx`, `audience-card.tsx`. *(Edits were found already in the working tree
      uncommitted — reviewed, verified, and adopted rather than rewriting identical code.)*
- [x] **Phase C — Primary action + Lede link hover ✅ (2026-06-19)** (`ONE-59`) — the accent now marks the
      *one* primary action + the data-noun links on hover. **`Button` `default` variant** `bg-primary… →
      bg-brand text-brand-foreground hover:bg-brand/90` (destructive/outline/secondary/ghost/link unchanged).
      **Button call-site audit:** every `default` usage is a genuine single primary CTA (marketing hero/
      closing CTAs, pricing CTA, signup/login submit, upgrade, dashboard form submits); every secondary
      action already uses `outline` → **zero demotions**. **Lede** drill-links tint `hover:text-brand-text
      focus-visible:text-brand-text` (rest = `text-foreground`; `--brand-text` = AA 7.15 dark / 5.98 light).
      **`--ring` left NEUTRAL** (standing decision — not branded despite the title's "+ focus ring"). AA:
      button 4.76/5.73 (≥4.5), Lede hover 7.15/5.98 (≥4.5); never colour-only (button = filled/largest, link
      = underlined). Accent footprint now = hero line (A) + tab underline + segment (B) + **primary button +
      Lede hover (C)** — the four sanctioned zones, no creep. Verified: 83 tests, typecheck · lint · build
      green; route `/dashboard/[projectId]` **6.95 kB** (class swaps, zero new JS). No new dependency;
      server-first; additive; deltas green/red; live dot emerald; sparkline + `--ring` neutral. Files:
      `button.tsx`, `lede.tsx`.
- [x] **Phase D — Card/number/chart spec unification ✅ (2026-06-19)** (`ONE-60`, folds in/closes `ONE-46`)
      — the last `MetricCard`/`rounded-lg` drift is retired; one card spec + one number spec on every page.
      **Pure craft, no accent, no data/query change** (restyle only; numbers byte-identical). **`MetricCard`
      restyled in place** onto the `StatCard` spec: `rounded-lg → rounded-xl`, value `+tabular-nums`, label
      `text-sm → text-xs` → card chrome now identical to `StatCard` (kept as the label·value·`hint` card; not
      deleted — 5 live usages + `hint` that `StatCard` lacks; the plan's "simplest, one file" path).
      **`tabular-nums` swept** across the 3 detail pages: `MetricCard` values + `FunnelChart` "↓ N dropped" +
      Revenue Recent-payments Date + Events Recent-occurrences Time + Events BarChart min/max labels
      (`BreakdownCard` / `FunnelChart` count·conv / Revenue Amount were already tabular). **`BarChart` drift:
      decided + documented** — its only consumer is Events-detail (marketing uses the lucide `BarChart3`
      *icon*, not the component); the chart language is `TrendChart`; the `BarChart` rewrite stays its own
      single-concern issue (`ONE-45`), out of this card/number PR. DoD: grep `rounded-lg` → **zero matches**;
      3 pages on the canonical spec; numbers identical. Verified: 83 tests, typecheck · lint · build green;
      detail-page routes unchanged (CSS-only, zero new JS). Docs: `DESIGN-SYSTEM.md` (one card system done;
      `BarChart` consumer corrected). Files: `metric-card.tsx`, `funnel-chart.tsx`, `events/[name]/page.tsx`,
      `revenue/page.tsx`, `DESIGN-SYSTEM.md`.
- [x] **Phase E — Logomark + favicon / identity marks ✅ (2026-06-19)** (`ONE-61`) — the product has a quiet
      face. **Hand-built SVG logomark** (`components/brand/logomark.tsx`): three ascending bars, the tallest
      in the `--brand` accent ("the *one* metric that matters"), the other two `fill-foreground`; no text,
      `aria-hidden`, server-safe, legible at 16px, theme-adaptive. **Lockup** (mark + "OneMetric" wordmark)
      added to the marketing + dashboard headers (`size-5`, beside the existing wordmark; layouts/nav
      unchanged). **Favicon** `app/icon.svg` — the same mark on a dark rounded tile (self-contained → legible
      on any tab, dark/light); legacy `favicon.ico` kept as fallback. **OG** — the mark prepended to
      `opengraph-image.tsx` (bars as Satori divs) above the existing eyebrow; typography/layout unchanged.
      **No new dependency; no accent creep** (the mark's accent bar is identity, sanctioned; grep `*-brand`
      adds only `logomark.tsx`). Verified: 83 tests, typecheck · lint · build green; `/icon.svg` picked up as
      a static route (18 pages, was 17); `/opengraph-image` renders; app route sizes unchanged (zero new JS).
      Docs: `DESIGN-SYSTEM.md` (Identity/logomark section). Files: +`logomark.tsx`, +`icon.svg`,
      `(marketing)/layout.tsx`, `dashboard/layout.tsx`, `opengraph-image.tsx`, `DESIGN-SYSTEM.md`.
- [x] **Phase F — Coherence, contrast & a11y pass ✅ (2026-06-19)** (`ONE-62`) — the final Move #3 pass.
      **Audit (zero code change — no defect found):** grep of every applied `*-brand` utility → the accent
      lives in exactly the four sanctioned zones (A hero series · B active tab + segment · C primary button
      + Lede hover) + the E logomark identity — **no creep**. `rounded-lg` → **zero**; every data metric
      `tabular-nums` (verified at every `formatNumber/Money/Percent` site incl. billing); one chart language
      (`TrendChart`; the lone `BarChart` drift stays `ONE-45`, single consumer). **WCAG AA (dark / light):**
      button 4.76/5.73 · Lede-hover (`--brand-text`) 7.15/5.98 · tab underline + series (graphical) 4.00/5.98
      · segment 4.76/5.73 — all pass; accent never the sole signal (fill/size/underline/pill/height);
      `--ring` neutral; deltas green/red; live dot emerald; sparkline neutral. **`MOVE-3-SPEC.md` §8: all 5
      criteria ✅.** Docs reconciled: `MOVE-3-SPEC.md` §8, `DESIGN-AUDIT.md` (scorecard status + 3 moves
      shipped), `DESIGN-SYSTEM.md` (accent shipped; Future sections retired). Verified: 83 tests, typecheck ·
      lint · build green (docs-only — no code touched). Files: docs only.

> **Move #3 — Identity & Craft: ✅ COMPLETE & APPROVED (2026-06-19).** All phases Done — 0 (`ONE-56`),
> A (`ONE-57`), B (`ONE-58`), C (`ONE-59`), D (`ONE-60`), E (`ONE-61`), F (`ONE-62`); the **Move #3 Linear
> project is Completed** and the umbrella `ONE-44` is closed (`ONE-46` was folded into Phase D). The
> signature accent lives in its four sanctioned zones + the logomark; one card/number/chart spec everywhere;
> a quiet identity (logomark + favicon + OG); WCAG-AA dark + light; nothing from Moves #1/#2 regressed.
> **All three design Moves (#1, #2, #3) are COMPLETE & APPROVED — and shipped to production.** Post-Move
> follow-up **`ONE-45`** (retire the distorting BarChart) is **Done** — events-detail uses the neutral
> crafted `TrendChart`; one chart language everywhere. **`ONE-24` (push + deploy) is Done (2026-06-19):**
> the 36 accumulated local commits were pushed to `origin/main` (`449757a`) and the Vercel **production
> deployment is READY** (`dpl_AeT56nQ8…`, commit `449757a`, target production). **origin/main == local main;
> zero unpushed commits; working tree clean.** Repository, Linear, GitHub, and production are fully
> synchronized. No open items remain in the design line; the broader product backlog
> (marketing / onboarding / Paddle go-live) is separate, pre-existing work.

---

## Post-launch features (beyond Moves #1–#3)

> **🚢 Shipped 2026-06-20 — `ONE-63`, `ONE-64`, `ONE-65`, `ONE-66` are Done and live in production.**
> Pushed `79badb8..5ef6850` (4 commits) → `origin/main`; Vercel prod deploy `dpl_Gw5r3jf8…` **READY** at
> commit `5ef6850` (https://onemetric.sbs). The "implemented, in review" notes below are the build records.

- [x] **ONE-63 — Project deletion (Settings → Danger Zone) ✅ implemented (2026-06-19), in review.** A
      safe, type-to-confirm permanent delete. The **Settings page** gains a "Danger Zone" `Card`
      (`border-destructive/40`, `rounded-xl`) → destructive **Delete project** button → confirmation
      **Dialog** (new `components/ui/dialog.tsx`, built on the already-installed `radix-ui` — **no new dep**).
      The Delete button stays **disabled until the typed name === the project name**; the `deleteProject`
      **server action** re-checks ownership + the exact name (defense in depth), then `prisma.project.delete`
      **cascades** to every dependent row (sessions, events, funnels + steps, integration, revenue, report
      subs — all `onDelete: Cascade`; **verified on the live DB**: all Project-child FKs = CASCADE → no
      orphans). After: `revalidatePath("/dashboard")` + redirect to `/dashboard?deleted=<name>` (RSC soft-nav
      → the list updates, no manual refresh) + a calm neutral success **toast** (`deleted-toast.tsx`;
      destructive colour stays on the delete action only). Owner-scoped; dark-first; Moves #1/#2/#3 untouched;
      no accent creep. Verified: 83 tests, typecheck · lint · build green. Files: +`ui/dialog.tsx`,
      +`dashboard/delete-project-dialog.tsx`, +`dashboard/deleted-toast.tsx`, `server/actions/projects.ts`,
      `dashboard/[projectId]/settings/page.tsx`, `dashboard/page.tsx`.
- [x] **ONE-64 — Rename project (Settings → General) ✅ implemented (2026-06-19), in review.** A "General"
      `Card` (`rounded-xl bg-card border`) **above** the Danger Zone: a pre-filled project-name `Input` + a
      default (primary) **Save changes** button, disabled when the value is unchanged / empty / saving, with
      a "Saving…" loading state. The `renameProject(projectId, newName)` **server action** (owner-only; trim;
      1–60 chars; friendly inline errors; type-safe) updates **`Project.name` only** (no schema / migration /
      new project), then `revalidatePath`s `/dashboard` + the project + settings routes → the header/list
      update with **no page refresh** (called via `useTransition`); a calm neutral success **toast** confirms
      it. No accent creep (the default Button is the sanctioned primary-action accent); dark-first; no new
      dependency; ONE-63 delete flow + analytics + routes untouched. Verified: 83 tests, typecheck · lint ·
      build green. Files: +`dashboard/rename-project-form.tsx`, `server/actions/projects.ts`,
      `dashboard/[projectId]/settings/page.tsx`.
- [x] **ONE-65 — First-event onboarding & empty states ✅ implemented (2026-06-19), in review.** Empty
      dashboards became guided onboarding (instruction over emptiness; no fake data; server-first; no new
      dependency; dark-first). **Overview** (no sessions): a `FirstEventOnboarding` card — "No events yet" +
      the tracking snippet (copy → "Snippet copied" toast) + a 3-step plan (supersedes the Move #1 "waiting"
      panel). **TrendChart**: an icon + "Your traffic will appear here" placeholder at the same height when
      data is empty/all-zero (safety net; current callers never hit it). A shared **`EmptyState`** card
      (`rounded-xl bg-card border`, neutral) on **Funnels** ("No funnels created" + Create-funnel CTA),
      **Revenue** ("No revenue events yet" — instead of zero metric cards when connected + no revenue), and
      the **Project list** ("Create your first project" + CTA); **Events** empty → "No events recorded" +
      "Custom events will appear here automatically." Primary CTAs use the default Button styling
      (`buttonVariants` on a link); no new accent zone, no destructive colours, no illustrations. Verified:
      83 tests, typecheck · lint · build green. **Bundle note:** `/dashboard` + `/funnels` First Load 117 →
      189 kB — the empty-state CTA imports `buttonVariants` from `ui/button`, which pulls the `radix-ui`
      umbrella chunk that server pages already pay (marketing / revenue / reports are 179–189); **no new
      dependency**. Future app-wide fix: import `Slot` from `@radix-ui/react-slot` directly in `button.tsx`.
      Move #1/#2/#3 + delete + rename flows untouched. Files: +`empty-state.tsx`,
      +`first-event-onboarding.tsx`, `trend-chart.tsx`, Overview/funnels/events/revenue/project-list pages.
- [x] **ONE-66 — Onboarding checklist (activation) ✅ implemented (2026-06-19), in review.** A "Getting
      started" card on the Overview **above the metric cards** that shows activation progress and **hides once
      fully activated**. Five steps from **real data the Overview already fetches** (no new queries, no fake
      progress): create project (always ✓) · install tracking script (key exists ✓; CTA Copy snippet →
      "Snippet copied" toast) · receive first pageview (`sessions > 0`) · create first funnel (`primaryFunnel`;
      CTA Create funnel) · track first revenue event (`revenueSummary.count > 0`; CTA View revenue docs).
      Completed = green check, pending = neutral circle, current row emphasized; progress "N / 5 completed".
      **Client** component (copy + toast) → no server-page bundle hit (Overview First Load 121 → 122 kB). No
      new accent zone (CTAs = default Button styling), no destructive colours, no illustrations; dark-first.
      Shown in the `hasData` branch (the `sessions === 0` empty state — ONE-65 — stays unchanged). Verified:
      83 tests, typecheck · lint · build green. Move #1/#2/#3 + delete/rename/empty flows untouched. Files:
      +`onboarding-checklist.tsx`, `dashboard/[projectId]/page.tsx`.
- [x] **ONE-67 — Project list UX cleanup ✅ implemented (2026-06-20), in review.** Decluttered the Projects
      page: removed the always-visible inline create form; **create via a dialog** (new
      `create-project-dialog.tsx` — reuses the ONE-63 `Dialog` + the existing `CreateProjectForm` /
      `createProject` action + validation; trigger = default Button, "New project" in the header / "Create
      project" in the empty state). **Quick delete** — a small trash-icon on each card opens the **existing**
      ONE-63 `DeleteProjectDialog` (added `triggerVariant="icon"`; Settings usage byte-identical; same
      `deleteProject` action — no duplicated logic; the trash sits outside the card `Link` so it doesn't
      navigate). No schema/query/analytics change; server-first; no new dependency; no accent creep; dark-first.
      **Bundle win:** `/dashboard` First Load **189 → 129 kB** (dropped the server-page `buttonVariants`
      umbrella import). Verified: 83 tests, typecheck · lint · build green. Files: +`create-project-dialog.tsx`,
      `delete-project-dialog.tsx` (icon trigger), `dashboard/page.tsx`.

---

## Move #4 — Activation & First Experience (signup → first "aha moment")

Optimize the whole journey: signup → create project → install snippet → first event → first value.
Builds on `ONE-65/66/67`. Server-first · dark-first · reuse existing components · **no accent creep** ·
preserve Moves #1–#3 · one issue at a time, one local commit per issue, In Review + stop for approval.
Linear: project **Move #4 — Activation & First Experience** with `ONE-68…71`.

- [x] **ONE-68 — Welcome flow / project-creation onboarding ✅ implemented (2026-06-20), in review.** The
      dashboard entry for a **brand-new user (0 projects)** became a guided welcome instead of the bare
      project-list chrome. The header greets ("**Welcome to OneMetric**" + "Let's get your first site
      tracking — it only takes a minute."); the body renders a new **`WelcomeProjects`** server component =
      the reused ONE-65 `EmptyState` (primary **Create project** CTA → the ONE-67 `CreateProjectDialog`) +
      a calm **3-step journey preview** (Create a project → Install the snippet → Watch analytics flow) in
      the same numbered "Step N" card language as the Overview `FirstEventOnboarding` (one system). The
      populated project-list state is **byte-identical** (header copy, header `CreateProjectDialog`, cards +
      quick-delete unchanged); only the `projects.length === 0` branch changed. Purely presentational,
      server-first; reuses `EmptyState`/`CreateProjectDialog`/`Card`; no new dependency, no schema/query
      change, no accent creep (the create CTA is the existing sanctioned primary-button zone), dark-first.
      `/dashboard` First Load **129 kB — unchanged** (`WelcomeProjects` is server-only, reusing the already-
      loaded create dialog). Verified: 83 tests, typecheck · lint · build green. Files:
      +`components/dashboard/welcome-projects.tsx`, `app/dashboard/page.tsx`.
- [x] **ONE-69 — Snippet installation experience ✅ implemented (2026-06-20), in review.** Removed the
      "where do I paste this?" friction between creating a project and the first event. New
      **`InstallGuide`** *server* component wraps the existing client `InstallSnippet` (snippet + one-click
      copy, **unchanged**) with (a) a precise placement line — "just before the closing `</head>` … loads
      asynchronously, never slows your site" — and (b) a **zero-JS native `<details>`** "Where does this go?"
      listing per-stack hints (Plain HTML · Next.js/React · WordPress · Webflow/Framer/no-code). Wired into
      the **Settings → Install** card (the canonical install/verify home the Overview's `FirstEventOnboarding`
      already links to via "Full setup & verification →"); the card description was tightened since the guide
      now carries the placement detail. The **Verification** card + `RefreshButton` + every other surface are
      untouched (`FirstEventOnboarding` + the ONE-66 checklist keep their own snippet/copy → no regression to
      ONE-65/66). Server-first; reuses `InstallSnippet`/`Card`; **no new dependency** (native `<details>`, not
      a JS disclosure lib); no schema/query/analytics change; **no accent creep** (muted/foreground tokens
      only); dark-first; Moves #1/#2/#3 + ONE-68 preserved. Settings route **1.91 kB / 130 kB First Load —
      unchanged** (server-only, zero client JS added). Verified: 83 tests, typecheck · lint · build green.
      Files: +`components/dashboard/install-guide.tsx`, `app/dashboard/[projectId]/settings/page.tsx`.
- [x] **ONE-70 — First-event guidance ✅ implemented (2026-06-20), in review.** Reworked the **Settings →
      Verification** card (the surface the user lands on right after installing the snippet) so it answers the
      five new-user questions at that exact moment, from **real ingest data — no fake progress**. New
      **`FirstEventGuide`** *server* component (driven by the existing `getProjectIngestStats` →
      `events`/`lastEventAt`): **waiting** (0 events) → amber dot + "Trigger your first event" with two
      concrete steps (open your site / load any page → first pageview; then "Check again"), the reassurance
      that "waiting" is **normal** until the first load, a pointer to `onemetric.track()` for custom actions,
      the reused `RefreshButton`, and a quiet "Where you'll see it: your dashboard →" link; **receiving**
      (events > 0) → emerald dot + "Receiving data — N events", "Your site is connected … you're all set",
      `lastEventAt`, and a "View your dashboard →" link. Verification `CardDescription` softened ("Let's get
      your first event flowing."). **Deliberately scoped to Settings** — the Overview `FirstEventOnboarding`
      (ONE-65) + the ONE-66 checklist keep their own copy → no duplication/regression. Reuses
      `Card`/`RefreshButton` + the established emerald/amber status-dot language; server-first; dark-first; no
      new query/schema; **no new dependency**; **no accent creep** (semantic dots + muted/foreground text
      links, not brand buttons). Settings route **1.91 kB / 130 kB First Load — unchanged**. Verified: 83
      tests, typecheck · lint · build green. Files: +`components/dashboard/first-event-guide.tsx`,
      `app/dashboard/[projectId]/settings/page.tsx`.
- [x] **ONE-71 — First value / activation ("aha moment") ✅ implemented (2026-06-20), in review.** Closes
      Move #4: the moment data first arrives, the Overview opens with a calm, professional acknowledgement of
      success. New **`FirstValueBanner`** *server* component (standard `Card`) — "**Your analytics are
      live**" with the existing **emerald "live" dot** + one value-framing line ("It works — OneMetric is
      tracking your site … privately, no cookies, no consent banner. Your live numbers are below and keep
      updating"). Answers *It works · I'm getting traffic · why OneMetric is valuable*; the Lede/Hero below
      quantify the traffic and the **ONE-66 checklist** (preserved, untouched) owns *where to go / what to
      explore next* → **complementary, not duplicative**. Rendered as the first child of the populated
      Overview (above the Lede), gated to the **activation window** (`hasData && !fullyActivated`) so it
      **retires together with the checklist** once the project is fully set up — no permanent chrome.
      **Calm by design:** no animation, no toast, no confetti, no noisy notification. Derived from **real
      state only — no fake data**; server-first; dark-first; reuses `Card` + the emerald semantic; **no new
      dependency**; no schema/query change; **no accent creep** (emerald is the existing live/positive
      semantic, not the brand violet). Moves #1/#2/#3 + ONE-68/69/70 preserved. Overview route **5.82 kB /
      122 kB First Load — unchanged** (server-only). Verified: 83 tests, typecheck · lint · build green.
      Files: +`components/dashboard/first-value-banner.tsx`, `app/dashboard/[projectId]/page.tsx`.

> **Move #4 — Activation & First Experience: all four phases implemented.** ONE-68 welcome flow (shipped) ·
> ONE-69 snippet install experience (shipped) · ONE-70 first-event guidance (shipped) · ONE-71 first-value
> banner (in review). The journey signup → create → install → first event → first value now has guidance,
> progress, and a calm success moment at every step. **On ONE-71 approval:** `ONE-71` → Done + the Move #4
> Linear project → Completed.

---

## Excluded from V1 (ROADMAP only — never implement)

Session replay · heatmaps · A/B testing · feature flags · AI reports ·
SEO tracking · alerts (email/Slack/Discord) · Stripe integration.
