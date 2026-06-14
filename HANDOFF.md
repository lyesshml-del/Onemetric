# Handoff

## ▶ RESUME HERE (read this first if you're a fresh chat)

**Product is LIVE in production.** This file + `TODO.md`, `PRD.md`, `ROADMAP.md`,
`AGENT-RULES.md`, `DEPLOY.md`, `ENVIRONMENT.md`, and
`~/.claude/plans/plan-what-need-to-prancy-wren.md` are the full context — read them, then
continue. The **Supabase and Vercel MCP connections carry over** across chats (use them to
query the DB / logs / deployments).

**Live facts**
- App: canonical URL is **`https://onemetric.sbs`** (apex; Phase 3 done). The
  `https://onemetric-web.vercel.app` host still works as a fallback (old installs use it).
- GitHub: `lyesshml-del/Onemetric` (auto-deploys on push to `main`). Set repo **Private**.
- Supabase project ref: `ladsqshpcdyjruzohkvb` (eu-central-1).
- Vercel project: `onemetric-web`, team `team_mgBu3PTBSTUAfy4tql0wgxDw`.
- Email working: Resend (domain `onemetric.sbs` verified) + Supabase SMTP
  (`username = resend`). Weekly report send verified in prod.
- Git author is set to `himranelyess@gmail.com` (matches GitHub) so pushes don't get blocked.

**Working agreement:** strict phase-by-phase; the user approves each phase and says how far
to go. Keep `TODO.md` + `HANDOFF.md` updated; new ideas → `ROADMAP.md` (don't build them).
I/the agent **cannot** set Vercel env vars / Firewall rules or Supabase Auth-SMTP via MCP —
those are the user's dashboard clicks; the agent guides + verifies.

**✅ Phase 2 (WAF) — DONE (2026-06-14).** Vercel Firewall rule (path `=/api/collect` → Rate
Limit Fixed Window 100 req / 10s per IP → Deny 429), published. Verified by burst:
`143×204, 33×429, 4×500` — `429`s appear (were `0` pre-rule). Re-runnable:
```
seq 1 180 | xargs -P 40 -I{} curl -s -o /dev/null -w "%{http_code}\n" -m 12 \
  -X POST https://onemetric-web.vercel.app/api/collect -H "Content-Type: text/plain" \
  --data '{"publicKey":"om_ratelimit_probe","type":"pageview","name":"/rl"}' | sort | uniq -c
```

**✅ Phase 3 (custom domain) — DONE (2026-06-14).** Canonical URL is the **apex
`https://onemetric.sbs`** (chosen over a subdomain — single Next.js app serves marketing +
app). Domain attached to Vercel (apex serves app, `www` 307→apex). User set
`NEXT_PUBLIC_APP_URL=https://onemetric.sbs` (Prod) + redeployed, and updated Supabase Auth
Site URL + Redirect URL (`/auth/confirm`) to apex (vercel kept as fallback). Verified:
`sitemap.xml`/`robots.txt`/install snippet now use `onemetric.sbs`; apex `/`, `/login`,
`/onemetric.js` all `200`. Existing installs on the old `*.vercel.app` host keep working.

**▶ Next action — MoR billing wiring** (the last build item before first paying client):
**2Checkout vs Paddle is still UNDECIDED** and gated on **Algeria-payout approval** — apply +
confirm first (external dependency). Groundwork already built (schema, `lib/plans.ts`, gating,
billing page, `actions/billing.ts` seam); only the provider hosted-checkout URL +
`POST /api/webhooks/<mor>` remain. See `plan-what-need-to-prancy-wren.md` Workstream 1 / TODO
Phase 13. Also pending: **set GitHub repo Private** + **clean test data** before onboarding
(see Cleanup section in TODO).

- **Known issue (not blocking, do later):** `/api/collect` returns `500` on ~2% of a 40-way
  concurrent burst (DB-pool pressure; `4/180` post-rule). Hardening idea: make `ingest`/the
  route catch DB errors and still return `204` so floods never 500. Deferred.

## Context notes (from chat — easy to miss otherwise)

**Two phase-numbering schemes (don't conflate):**
- The build phases **0–8** = the V1 MVP; **9–13** in `plan-what-need-to-prancy-wren.md` =
  billing / marketing / tests / deploy / hardening.
- The user later said **"Phase 1 / 2 / 3"** to mean the *post-deploy hardening* items:
  **1 = Email (done), 2 = WAF rate-limit (in progress), 3 = custom domain (not started)**.

**Accounts / emails (these tripped us up — keep straight):**
- Vercel account: **lyesshml@gmail.com** · GitHub account: **himranelyess@gmail.com**
  (git commit author is set to this so deploys aren't blocked) · Supabase org owner:
  **himranelyess@gmail.com**.
- App login (the founder's own test account, owns the **DataFast** project):
  **supradz14@gmail.com**. A friend tested signup with **adembensari7@gmail.com**.

**Billing (important constraint):** founder is in **Algeria** → **Stripe is not available** →
decision is a **Merchant-of-Record**; **2Checkout vs Paddle is still UNDECIDED** (needs
Algeria-payout approval; 2CheckoutPayoneer vs Paddle-SWIFT). MoR-agnostic groundwork is
already built (schema, `lib/plans.ts`, gating, billing page, action seam) — only the
provider checkout + `POST /api/webhooks/<mor>` remain.

**Test data currently in the LIVE database (clean up before onboarding a real client):**
- A test `ReportSubscription` (`rsub_test_*`, `supradz14@gmail.com`) on DataFast.
- Test analytics in **DataFast** (a session + pageviews + a `signup` event) from a prod
  ingestion smoke test.
- **Unconfirmed** auth users for `adembensari7@gmail.com` from signups that failed *before*
  the SMTP username fix.

**Secrets:** never commit. Production secrets live in **Vercel env vars** (and locally in
`apps/web/.env`, gitignored). To call the cron route you need `CRON_SECRET` from there.
The dev DB password was leaked via `.claude/` earlier → history scrubbed, password rotated,
`.claude/` now gitignored.

## Current Status

**LIVE in production** on Vercel (`onemetric-web.vercel.app`). V1 MVP (0–8) + phases 9
(billing groundwork), 10 (marketing/legal), 11 (tests+CI), 12 (deploy) done. Email (user's
"Phase 1") **done**. **Phase 2 (WAF rate-limit) in progress** — the Firewall rule still
needs to be created in the Vercel dashboard (agent can't via MCP), then verified.

## Completed (Email — Resend + Supabase SMTP)

- **Domain `onemetric.sbs`** bought via Vercel; **verified in Resend** (eu-west-1, DNS
  auto-configured through Vercel).
- **Vercel env** (Production + Preview): `RESEND_API_KEY`,
  `REPORT_FROM_EMAIL=OneMetric <reports@onemetric.sbs>`.
- **Supabase Auth → custom SMTP** via Resend (`smtp.resend.com:465`, user `resend`, sender
  `noreply@onemetric.sbs`) for reliable signup-confirmation emails.
- **Verified:** triggered `GET /api/cron/weekly-reports` in prod → `{ok:true, sent:1}`,
  `lastSentAt` stamped → **weekly-report email sends through Resend**. (A test
  `ReportSubscription` for `supradz14@gmail.com` on DataFast was added for this — can be
  removed in the Reports UI.)
- **Still to confirm by the user:** the Supabase SMTP leg (signup-confirmation email) — do
  one test signup with a fresh email to confirm it arrives from `noreply@onemetric.sbs`.

## Notes / follow-ups

- Two prod bugs were fixed earlier: the git-author/Vercel block (git email → GitHub email),
  and the dashboard `Application error` (auth account re-created → `User` id mismatch; fixed
  in data + hardened `syncUser`). Also added `prisma generate` to the build.
- **Repo visibility:** Vercel metadata shows the GitHub repo as `public` — set it back to
  **Private** (no secrets committed, but recommended).
- `onemetric.sbs` is **live as the canonical app URL** (`NEXT_PUBLIC_APP_URL=https://onemetric.sbs`,
  Phase 3 done 2026-06-14).

## Completed (Phase 12 — deploy groundwork)

- **Git**: repo initialized, initial commit on `main` (141 files). Verified **no `.env`
  secrets committed**; `.env.example` template is tracked.
- **Fixes**: `apps/web/.gitignore` had `.env*` (which was hiding `.env.example`) → added
  `!.env.example`. Added `.gitattributes` (`* text=auto eol=lf`) so the tracker bundle and
  Prisma migration files stay byte-stable across OSes (protects the migration checksum).
  Added `.nvmrc` (20).
- **Runbook**: `DEPLOY.md` — GitHub push, Vercel settings (Root Directory `apps/web`),
  full env-var table, DB-password rotation, Supabase Auth URLs + custom SMTP, Resend, Vercel
  WAF, and a post-deploy smoke-test checklist.
- **Fresh production secrets generated** (CREDENTIALS_KEY, VISITOR_HASH_SALT, CRON_SECRET)
  and handed over out-of-band — **not committed**. Dev `.env` values must not be reused in prod.

## Pending (your account actions — see DEPLOY.md)

- `gh` CLI is not installed here, so **create the GitHub repo + `git push`** manually.
- Vercel project (Root Directory `apps/web`) + env vars + deploy.
- Rotate the Supabase DB password (was shared in plaintext in dev); set Auth Site/Redirect
  URLs + custom SMTP; consider leaving the free tier.
- Resend domain + API key; Vercel WAF rate-limit on `/api/collect`; custom domain →
  `NEXT_PUBLIC_APP_URL`.

## Completed (Phase 11 — tests + CI)

- **Vitest** added to `apps/web` (`vitest.config.ts`, `vitest.setup.ts` with dummy env so
  Prisma/crypto load in tests; `@`→`src` alias). `test` script on web + root.
- **Refactor for testability**: extracted a pure `computeFunnel(events, steps)` from
  `getFunnelResults` (`server/queries/funnels.ts`) — `getFunnelResults` now just builds the
  query and delegates.
- **38 unit tests across 8 files** (`*.test.ts` co-located): `computeFunnel` (incl. the
  out-of-order `[5,2,1]` scenario), `parseCustomId`/`extractCapture`, `computeVisitorHash`
  (determinism + daily rotation), `parseUserAgent`, `encryptJson`/`decryptJson`,
  `format.ts`, `range.ts`, and the collect/funnel/PayPal zod schemas.
- Small hardening: `countryName` now uses `Intl.DisplayNames` `fallback: "none"` and
  returns the raw code on malformed input.
- **CI**: `.github/workflows/ci.yml` runs `npm ci` → prisma generate → typecheck → lint →
  test → build on push/PR, with dummy env values.
- All green locally: **38 tests pass**, typecheck, lint, build.

## Completed (Phase 10 — marketing site + legal)

- **`(marketing)` route group** with a shared header/footer `layout.tsx`. The old
  placeholder `src/app/page.tsx` was removed and replaced by `(marketing)/page.tsx`.
- **Landing**: hero (with a cookieless/no-cookie-banner badge), 6-feature grid
  (lucide-react icons), privacy-first section, 3-step how-it-works, pricing teaser.
- **Pricing** (`/pricing`): Free vs Pro cards driven by `lib/plans.ts`.
- **Legal** (`/privacy`, `/terms`): cookieless / no-PII / EU-data emphasis.
  **⚠️ These are templates — get professional legal review before relying on them, and
  replace the placeholder contact `support@onemetric.app` with a real address.**
- **SEO**: `app/robots.ts` (disallows `/dashboard`, `/api`), `app/sitemap.ts`,
  `app/opengraph-image.tsx` (next/og), and root `metadataBase` + OpenGraph/Twitter
  metadata. All driven by `NEXT_PUBLIC_APP_URL`.
- **Verified** on a running server: `/`, `/pricing`, `/privacy`, `/terms`, `/login`,
  `/signup` → 200; `/robots.txt`, `/sitemap.xml`, `/opengraph-image` serve correctly.
  typecheck/lint/build pass.

## Legal grounding & compliance action items (verified 2026-06-14)

Grounding sources: the Legal Data Hunter MCP (reconnected) **authoritatively confirms the
EU instruments are in force** — GDPR `CELEX 32016R0679` and ePrivacy Directive
`CELEX 32002L0058` (cookies governed by the Directive, Art. 5(3)). The **Algeria** corpus
(`DZ/JORADP` gazette) is whole-issue only, so Law 18-07 / the 2025 amendment are
**web-sourced, not article-verified**. Treat as informational; **professional legal review
is required** (esp. Algerian + EU counsel). What was verified:

- **EU cookies**: the ePrivacy *Regulation* was **withdrawn (Feb 2025)**; cookie rules
  remain under the **ePrivacy Directive, Art. 5(3)**. A Nov 2025 "Digital Omnibus" draft
  would add audience-measurement exemptions but is **not yet law** (EDPB/EDPS Joint
  Opinion, 11 Feb 2026). OneMetric's cookieless model sets/reads nothing on-device → the
  "no cookie banner for analytics" position is sound. Privacy page now cites Art. 5(3).
- **Algeria (controller is Algeria-based)**: Law **18-07** (2018) was modernized by Law
  **11-25 (July 2025)** — now mandates a **DPO, processing records, and DPIAs**. The
  **ANPDP authority was still non-operational as of 2025**.
- **Action items for the founder (launch-blocking risk, not code):**
  1. **Cross-border transfer**: hosting data in the EU is a transfer of personal data out
     of Algeria, which under Law 18-07/11-25 requires **ANPDP authorization** — confirm the
     current process (authority operational status pending).
  2. Assess **DPO / processing-records / DPIA** obligations under Law 11-25.
  3. Replace the placeholder contact `support@onemetric.app` with a real address.
  4. Confirm the **governing-law** clause (Terms now says Algeria) with counsel.
  5. Reconnect the Legal Data Hunter MCP for corpus-grounded, citable verification.

## Completed (Phase 9 — billing groundwork, MoR-agnostic)

- **Billing provider = Merchant-of-Record** because the founder is in **Algeria** (Stripe
  unavailable; PayPal/Wise payouts limited). The MoR is seller-of-record + pays us out.
  **2Checkout vs Paddle is still undecided** — provider-specific checkout/webhook deferred.
- **Schema**: `enum Plan { FREE PRO }`; `User` += `plan` (default FREE),
  `subscriptionStatus`, `currentPeriodEnd`, `billingCustomerId @unique`,
  `billingSubscriptionId`. Migration `20260614000000_add_billing` created via
  `prisma migrate diff` and applied with **`prisma migrate deploy`** (live DB now reachable
  from the dev env via the aws-1 pooler); client regenerated. Existing real user defaulted
  to FREE (verified).
- **App layer**: `lib/plans.ts` (Free: 1 project / 10k events/mo / 30d; Pro: 10 /
  1M / 365d), `queries/billing.ts` (`getBillingOverview`, `canCreateProject`), plan gating
  in `createProject` (blocks past `maxProjects` with an upgrade message), and
  `/dashboard/billing` (plan + usage bars + upgrade CTA) with a "Billing" nav link.
- **Seam for the provider**: `server/actions/billing.ts` (`startCheckout`/`manageBilling`,
  currently return "not enabled yet") + `UpgradeButton`. The final billing step fills the
  MoR hosted-checkout URL + adds `POST /api/webhooks/<mor>`.
- Verified: typecheck, lint, build pass.

## Migration note

The dev environment can now reach the live DB (aws-1 pooler), so schema changes use the
normal **`prisma migrate deploy`** flow (no more MCP `apply_migration` + manual baseline).

## Completed (Phase 8)

- **Subscriptions**: `ReportSubscription` add/remove/enable-disable + "Send now"
  (`server/actions/reports.ts`, owner-scoped via the project relation),
  `server/queries/reports.ts` (`listSubscriptions`, `getEnabledSubscriptions`). UI at
  `/dashboard/[projectId]/reports` with an add form (`AddSubscriptionForm`), per-recipient
  toggle/remove, and a "Send now" button. "Reports" tab added to `ProjectHeader`.
- **Report builder** (`server/reports/builder.ts`): last-7-day overview metrics + top
  pages, reusing the analytics queries (`getOverviewMetrics`/`getTopPages`, now exported).
  Templated, **no AI**.
- **Email**: React Email template (`server/reports/weekly-email.tsx`) + Resend sender
  (`server/reports/send.ts`). Sender **no-ops when `RESEND_API_KEY` is unset**, so the
  pipeline runs safely without it.
- **Cron**: `GET /api/cron/weekly-reports` (Node runtime) — `CRON_SECRET`-protected
  (`Authorization: Bearer …`), builds each project's report once, sends to enabled
  recipients, stamps `lastSentAt`. `apps/web/vercel.json` schedules it Mondays 09:00 UTC.
- **Env**: `RESEND_API_KEY`, `REPORT_FROM_EMAIL`, `CRON_SECRET` added + documented.
- **Verification**: typecheck/lint/build pass. On a running server against the live DB,
  the cron returned `{ok:true, recipients:1, sent:0}` with the correct secret (report
  built from analytics, send skipped — no key) and `401` without/with a wrong secret.
  Seed data removed.
- **Not exercised here**: the real Resend send + email HTML delivery needs a Resend API
  key and a verified sending domain.

## V1 deferred-to-production checklist (no code needed now)

These are real integrations implemented per their docs but not runnable in this sandbox —
confirm before going live:
- PayPal signature verification (Phase 7) — needs a real PayPal REST app + webhook.
- Resend email sending (Phase 8) — needs `RESEND_API_KEY` + verified `REPORT_FROM_EMAIL`
  domain.
- Set production env vars on Vercel (`DATABASE_URL`/`DIRECT_URL`, Supabase keys,
  `VISITOR_HASH_SALT`, `CREDENTIALS_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`) and point
  `NEXT_PUBLIC_APP_URL` at the deployed domain (used in the install snippet + webhook URL).

> **Live DB note:** the database now contains a **real** project "DataFast" (datafa.st)
> created by the user through the app, owned by a real Supabase auth account. It is
> genuine data — **do not delete it**. All phase verifications use throwaway rows that
> are removed afterward.

## Completed (Phase 7)

- **Credential encryption** (`lib/crypto.ts`): AES-256-GCM using `CREDENTIALS_KEY`
  (32-byte hex). PayPal credentials are entered per project and stored encrypted in
  `Integration.credentials` (`{ enc: "iv:tag:data" }`).
- **Integration** connect/disconnect (`actions/integrations.ts`) + status/credentials
  reads (`queries/integrations.ts`, decrypt is server-only). Disconnect clears the
  encrypted blob (`Prisma.JsonNull`).
- **Webhook** `POST /api/webhooks/paypal/[projectId]` (Node runtime): loads the project's
  creds → verifies the signature via PayPal's `verify-webhook-signature` API (OAuth token
  + transmission headers + webhook id) → on `PAYMENT.CAPTURE.COMPLETED` records a
  `RevenueEvent`. Logic lives in `server/ingest/paypal.ts`.
- **Attribution**: `recordRevenueEvent` parses `custom_id` (`utm_source`/`utm_campaign`,
  optional `om_session`); if `om_session` is present it resolves that session's UTMs and
  links `sessionId`. Upsert is keyed on the unique `(projectId, externalId)`.
- **Reporting** (`queries/revenue.ts`): total + payment count (currency = most common),
  revenue by source, by campaign, recent payments. `formatMoney` added; `BreakdownCard`
  gained an optional `format` prop for currency formatting.
- **UI** `/dashboard/[projectId]/revenue`: when disconnected → connect form + webhook URL
  + `custom_id` attribution docs; when connected → revenue tiles, by-source/by-campaign
  breakdowns, recent payments table, webhook URL, and disconnect. "Revenue" tab added.
- **Env**: `CREDENTIALS_KEY` added to `.env` + documented; the old per-app `PAYPAL_*`
  vars removed from `.env.example`/`ENVIRONMENT.md` (creds are per project now).
- **Verification**: typecheck/lint/build pass. Against the live DB confirmed: credential
  encrypt→store→decrypt round-trip; attribution (custom_id UTMs and `om_session` →
  session UTMs); upsert idempotency on duplicate capture; revenue totals + by-source
  (total 69, newsletter 50 / nl 19). Throwaway data removed.
- **Not exercised here**: PayPal's signature-verification API requires real PayPal
  merchant credentials, so the verify call path was implemented per the PayPal docs but
  not run end-to-end.

## Completed (Phase 6)

- **Queries** (`server/queries/funnels.ts`): `listFunnels` (with step counts),
  `getOwnedFunnel` (steps + project, ownership via the project relation), and
  `getFunnelResults`.
- **Conversion logic** (`getFunnelResults`): fetches events matching any step in the
  window, ordered by session then time; for each session walks events advancing a step
  pointer (step k only counts after steps 1..k matched **in order**). Produces per-step
  counts, conversion vs step 1, drop-off from the previous step, and overall conversion.
- **Actions** (`server/actions/funnels.ts`): `createFunnel` (creates the funnel + ordered
  steps in one nested create, zod-validated 2–10 steps), `deleteFunnel` (owner-scoped).
  No edit UI — updating = delete + recreate (MVP simplicity).
- **UI**: `CreateFunnelForm` (dynamic add/remove step rows; each step a pageview path or
  custom event), `FunnelChart` (per-step bars + counts + conversion % + drop-off).
  Pages: `/dashboard/[projectId]/funnels` (list + builder) and
  `/funnels/[funnelId]` (entered + overall-conversion tiles, step chart, range selector,
  delete). "Funnels" tab added to `ProjectHeader`.
- **Verification**: typecheck/lint/build pass. Seeded a 5-session scenario in the live DB
  (including an out-of-order session and one that skips a step) and confirmed step counts
  `[5, 2, 1]` exactly — proving the sequential/ordering semantics. Seed + temp script
  removed (tables back to 0).

## Completed (Phase 5)

- **Queries** (`server/queries/events.ts`):
  - `getEventSummary` (raw SQL): custom events aggregated by name — occurrences +
    unique sessions, top 100, pageviews excluded.
  - `getEventDetail` (raw SQL + Prisma): totals (count + unique sessions), zero-filled
    daily trend, and the 20 most recent occurrences (path + metadata).
- **UI**:
  - `/dashboard/[projectId]/events` — list table (occurrences, sessions) linking to each
    event; range selector; empty state shows the `track()` docs.
  - `/dashboard/[projectId]/events/[name]` — drill-in with metric tiles, trend bar
    chart, and a recent-occurrences table (time / path / properties JSON).
  - "Events" tab added to `ProjectHeader` (Overview · Events · Settings).
  - `CustomEventsDoc` (reusable) documents `onemetric.track(name, props)` with examples
    (signup, login, purchase, button click, form submit); shown on Settings + empty state.
- **Note**: the tracker + `/api/collect` already capture custom events (Phase 3); Phase 5
  is purely the reporting UI + queries — no ingestion changes.
- `eachUtcDay` helper added to `lib/range.ts` for trend zero-fill.
- **Verification**: typecheck/lint/build pass. Seeded custom events in the live DB and
  confirmed `getEventSummary` (signup 2 occ / 2 sessions, purchase 1/1, pageview
  excluded) and `getEventDetail` (daily trend + recent occurrences with metadata
  preserved). Seed data removed (tables back to 0).

## Completed (Phase 4)

- **Aggregation queries** (`server/queries/analytics.ts`):
  - `getOverviewMetrics` (raw SQL): unique visitors (distinct `visitorHash`), sessions,
    pageviews (sum of `pageviewCount`), pages/session, avg session duration, bounce rate
    (sessions with ≤1 pageview).
  - `getTimeseries` (raw SQL): per-UTC-day visitors + pageviews, zero-filled across range.
  - Breakdowns via Prisma `groupBy` (top 10): top pages (PAGEVIEW events by name), top
    referrers, countries, devices, browsers.
  - `getProjectAnalytics` runs them all in parallel.
- **UI** at `/dashboard/[projectId]` (overview): 6 metric tiles, a dependency-free SVG
  `BarChart` (daily unique visitors), date-range selector (7/30/90d via `?range`),
  project switcher, and breakdown cards with proportional bars. Country codes are mapped
  to names (`Intl.DisplayNames`); device labels title-cased. Empty state links to install.
- **Route restructure**: `/dashboard/[projectId]` is now the analytics overview;
  `/dashboard/[projectId]/settings` holds the install snippet + verification (moved from
  Phase 3). Shared `ProjectHeader` renders the Overview/Settings tabs + switcher.
- **Helpers**: `lib/format.ts` (compact numbers, duration, percent, country names),
  `lib/range.ts` (range presets → date window). No charting library added.
- **Verification**: typecheck/lint/build pass. Seeded multi-day data in the live DB and
  confirmed the exact overview SQL (sessions 3, unique 2, pageviews 6, avg duration 60s,
  bounce 0.333), the Prisma `groupBy` breakdowns (pages/devices/countries), and the
  timeseries — all correct. Seed data + temp script removed (tables back to 0).

## Completed (Phase 3)

- **Tracker** (`packages/tracker/src/index.ts`): dependency-free script — auto
  pageviews, SPA `history` patching + `popstate`, `window.onemetric.track()` with a
  pre-load queue, Do-Not-Track respect, `sendBeacon` (text/plain → no CORS preflight)
  with `fetch` keepalive fallback. Reads `data-public-key` from its own `<script>` tag.
- **Build**: esbuild bundles/minifies to `apps/web/public/onemetric.js` (~1.6 kB),
  served statically. Root `npm run build:tracker`; `npm run build` runs it first.
- **Ingestion** `POST /api/collect`:
  - **Node** runtime (Prisma needs Node; Edge would require Prisma Accelerate / a driver
    adapter — extra infra we are avoiding). `force-dynamic`.
  - zod-validated; permissive CORS + `OPTIONS`; always returns `204` (never reveals
    whether a public key exists); `400` only on malformed/invalid body.
  - `server/ingest/`: `ua.ts` (minimal device/browser/os), `visitor.ts` (daily-rotating
    cookieless SHA-256 hash using `VISITOR_HASH_SALT`), `collect.ts` (project lookup →
    30-min session find-or-create with aggregates → event insert). Geo from
    `x-vercel-ip-country`.
- **Minimal Project management** (required by the install/verify UI):
  - `createProject` action (generates `om_…` public key, tenancy via `requireUser`),
    `listProjects` / `getOwnedProject` / `getProjectIngestStats` queries.
  - `/dashboard` lists projects + create form; `/dashboard/[projectId]` shows the copy
    snippet + live verification (event count / last event + "Check again").
- **Env**: `VISITOR_HASH_SALT` added to `.env` and documented in `.env.example`.
- **Verification**: typecheck, lint, build pass. Ran a live smoke test (prod server +
  seeded throwaway project) — 2 pageviews + 1 custom event ingested as **1 session**
  (`pageviewCount=2`, entry `/`, exit `/pricing`, referrerDomain `google.com`, UTM
  captured, device/browser/os = Desktop/Chrome/Windows); unknown key → 204, bad body →
  400. Test data deleted afterward (all tables back to 0).

## Completed (Phase 2)

- Dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `zod`; shadcn components
  `button`, `input`, `label`, `card`.
- Supabase SSR wiring:
  - `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (RSC/actions),
    `lib/supabase/middleware.ts` (session refresh + route guard).
  - `middleware.ts` — refreshes the session on every request, redirects signed-out
    users away from `/dashboard`, and signed-in users away from `/login` `/signup`.
- `lib/auth.ts` — `getAuthUser`, `syncUser`, `requireUser`. `requireUser` is the
  dashboard guard and the single bridge from auth identity → `public.User` (idempotent
  Prisma upsert keyed on the Supabase user id).
- Auth flows (`server/actions/auth.ts`): `login`, `signup`, `logout`, zod-validated.
  Signup handles email-confirmation (returns a "check your email" message when no
  session); `app/auth/confirm/route.ts` verifies the emailed link.
- UI: `(auth)` route group (centered) with `/login` and `/signup` pages + client forms
  using `useActionState`. Protected `/dashboard` (layout guard + header with email +
  sign-out) and a placeholder dashboard page. Landing page now links to sign in / up.
- Env: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key) added to `.env` + documented
  in `.env.example` / `ENVIRONMENT.md`.
- Verified: typecheck, lint, build all pass (6 routes: `/`, `/login`, `/signup` static;
  `/dashboard`, `/auth/confirm` dynamic). Auth endpoint confirmed reachable.

## Security — RLS & the Supabase client (honoring the standing reminder)

- The Supabase client is used **for authentication only** — it calls GoTrue / the
  `auth` schema (`signUp`, `signInWithPassword`, `getUser`, `verifyOtp`, `signOut`).
- It **never** reads or writes any `public.*` table; all application data access is via
  **Prisma**, which connects as the table-owner role and bypasses RLS.
- Therefore **no RLS policies are required in Phase 2**. The deny-by-default RLS from
  Phase 1.5 stays correct. Add policies only if a Supabase-client / PostgREST call ever
  needs row access to a `public` table.

## Routing decision

- `/` = public landing, `/login` + `/signup` = `(auth)` group, `/dashboard` = the
  authenticated app. The originally-sketched `(dashboard)` group at `/` would have
  collided with the landing page at `/`, so the app lives under the explicit
  `/dashboard` segment (per-project routes will nest as `/dashboard/[projectId]`).

## Auth configuration note (for testing)

- `mailer_autoconfirm = false` on the project → **email confirmation is required** before
  a new user can sign in. For faster local testing you may disable it in the dashboard
  (Authentication → Providers → Email → "Confirm email"), or just confirm via the email
  link. End-to-end login was **not** exercised in a browser here (needs a real session /
  confirmed account) — say the word and I'll run a runtime smoke test.

## History — Phase 1.5

**Live Database Infrastructure: complete and fully verified.** RLS enabled
deny-by-default; Prisma connects to the live Supabase DB (`prisma migrate status` →
"up to date").

Phases 0 (Foundation) and 1 (Database schema) are complete — see history below.

## Completed (Phase 1.5)

- Created a dedicated Supabase project via MCP:
  - Name **OneMetric**, ref `ladsqshpcdyjruzohkvb`, region `eu-central-1`,
    Postgres 17, free tier ($0/month), org `gvlctknbwqfmqxodniwe`.
- Applied the `0_init` Prisma migration to the **live** database (via Supabase MCP,
  since the DB password is not exposed to the MCP). Verified: 9 tables present, 0 rows.
- Baselined Prisma migration history: created `_prisma_migrations` and inserted the
  `0_init` row with the correct SHA-256 checksum
  (`fde96e41…525041`). Equivalent to `prisma migrate resolve --applied 0_init`, so a
  future `prisma migrate deploy` is a no-op and `migrate status` reports up to date.
- Connection strategy resolved: the **pooler** host
  (`aws-0-eu-central-1.pooler.supabase.com`) is used for both URLs because the direct
  host `db.<ref>.supabase.co` is IPv6-only and unreachable. Ports 6543 (transaction,
  for `DATABASE_URL`) and 5432 (session, for `DIRECT_URL`) both verified reachable.
- Documented all environment variables: new `ENVIRONMENT.md` + concrete
  `apps/web/.env.example` (with the project's connection-string templates).

## Security — RLS enabled (deny-by-default) ✅

- Enabled Row Level Security on **all 10 public tables** (9 app tables +
  `_prisma_migrations`). **No policies created** (per instruction).
- Effect: anon/authenticated roles (Supabase client / PostgREST) are denied all
  access; Prisma connects as the table-owner role and **bypasses RLS**, so it remains
  the primary — and only — data-access layer.
- Verified via `pg_class` (all `relrowsecurity = true`, 0 policies) and the Supabase
  security advisor: the critical `rls_disabled_in_public` ERROR is **cleared**; only
  INFO-level `rls_enabled_no_policy` notices remain, which is the expected/intended
  deny-by-default state.
- When the Supabase client (Phase 2 Auth) or PostgREST needs row access to any of
  these tables, add explicit policies then — not before.

## Live connection — done ✅

- DB password set in `apps/web/.env`; live Prisma connection verified
  (`prisma migrate status` → "Database schema is up to date!").
- **Correct pooler cluster is `aws-1-eu-central-1`** (not `aws-0` — that endpoint
  returned "tenant or user not found"). Both `.env`, `.env.example`, and
  `ENVIRONMENT.md` now use `aws-1`.

## Why Integration and ReportSubscription are their own tables in V1

- **Integration** — holds a per-project, per-provider connection (PayPal in V1):
  status + encrypted credentials + timestamps, with a unique `(projectId, provider)`.
  This is mutable connection state with a different lifecycle and access pattern than
  payments. Folding it into `Project` would bloat every project row with nullable
  provider columns and break as soon as a second provider (Stripe, ROADMAP) is added.
  A dedicated table makes "connect/disconnect", credential rotation, and future
  providers a row operation, not a schema change.
- **ReportSubscription** — a project can have **many** weekly-report recipients, each
  with its own `enabled` flag and `lastSentAt`. That is inherently one-to-many, so it
  cannot live as columns on `Project`. A separate table also lets the Phase 8 cron
  query exactly the due/enabled subscriptions and stamp `lastSentAt` per recipient.

## Decisions Made

- Dedicated Supabase project over reusing the unrelated "LLm Cost Simulator" project.
- Pooler (not direct) connection for both URLs due to IPv6-only direct host.
- Applied migration via MCP + manual baseline (password-free path) rather than waiting
  on the DB password, so the live DB is ready and Prisma history stays consistent.

## Next Step

Complete the **Phase 12 account actions** above by following `DEPLOY.md` (push to GitHub,
create the Vercel project, set env, configure Supabase/Resend/WAF, point the domain). Then
**Phase 13 (hardening + first-client onboarding)** or the **final MoR billing wiring** once
a provider is chosen and approved for Algeria payout. V2+ ROADMAP items remain out of scope.
