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
- GitHub: `lyesshml-del/Onemetric` (auto-deploys on push to `main`). **Keep PUBLIC** —
  making it private breaks Vercel deploys unless the Vercel GitHub App is granted private-repo
  access first (see deploy gotchas below).
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

**▶ Billing — Paddle CODE BUILT; needs sandbox keys + test (2026-06-15).** Provider =
**Paddle**, vendor account on `vendors.paddle.com`. **✅ Verification PASSED** — Algeria
seller approved. **Code shipped** (commit pending push): Paddle.js overlay checkout
(`UpgradeButton`, passes `custom_data.user_id`), `manageBilling` → customer-portal session,
`POST /api/webhooks/paddle` (HMAC `Paddle-Signature` verify → syncs
`User.plan/subscriptionStatus/currentPeriodEnd/billingCustomerId/billingSubscriptionId`;
`trialing`/`active`/`past_due`→PRO, `paused`/`canceled`→FREE). Pro product = **$19/mo, 7-day
free trial**, Sandbox price `pri_01kv625awpdgwezwk0b2xttgbc`. New deps: `@paddle/paddle-js`.
Code in `server/ingest/paddle.ts` (+ `paddle.test.ts`), `api/webhooks/paddle/route.ts`,
`actions/billing.ts`, `components/dashboard/{upgrade-button,manage-billing-button}.tsx`.

**✅ SANDBOX END-TO-END VERIFIED (2026-06-15):** sandbox env set in Vercel (client token,
API key, `pri_01kv625awpdgwezwk0b2xttgbc`, webhook secret), webhook destination created
(usage type **Both**, all subscription events), `onemetric.sbs` added as a Paddle Checkout
**approved domain** (this was needed — overlay errors "Something went wrong" without it).
Full lifecycle confirmed: checkout → `plan=PRO, trialing`; **Manage-billing portal opens**
(needed the API key scope **Customer portal sessions: Write** + Customers R/W — initial 403
without it); cancel-immediately → FREE; cancel-at-period-end (portal) → stays PRO until
`currentPeriodEnd` then FREE.

**Remaining to actually charge real customers:**
1. **Add Paddle payout details** (Business Account → Payouts) — SWIFT to USD/EUR or PayPal.
2. **GO LIVE:** in **production** Paddle (`vendors.paddle.com`) recreate the Pro product +
   $19/mo price w/ 7-day trial (prod `pri_…`), create a prod **client token** + **API key**
   (scopes: **Customer portal sessions: Write** + **Customers: R/W**) + **webhook destination**
   (→ `https://onemetric.sbs/api/webhooks/paddle`, usage Both, all subscription events), add
   `onemetric.sbs` to prod Checkout **approved domains**, then set the 5 Vercel env vars to
   **production** values (`NEXT_PUBLIC_PADDLE_ENV=production`) and redeploy.
3. **Cleanup:** reset `supradz14@gmail.com` to FREE (the sandbox sub left it PRO/trialing
   with sandbox-only ids) — see Cleanup in TODO.
See `plan-what-need-to-prancy-wren.md` Workstream 1 / TODO Phase 9 remaining.

**▶ Meanwhile (not blocked by Paddle):** (1) ~~free receiving inbox for `support@onemetric.sbs`~~
DONE — ImprovMX catch-all `*@onemetric.sbs` → `lyesshml@gmail.com` (MX mx1/mx2.improvmx.com +
SPF at Vercel DNS, verified, test email received 2026-06-15); (2) ~~set GitHub repo Private~~
**REVERTED to PUBLIC** — see deploy gotchas below; (3) clean test data from live DB (see
Cleanup in TODO); (4) ~~`/api/collect` 500 hardening~~ DONE (verified live); (5) professional
legal review of `/privacy` `/terms` `/refund` + Algeria ANPDP cross-border transfer.

**⚠️ Vercel deploy gotchas (cost ~1h on 2026-06-15 — read before deploying):**
- **Repo must stay PUBLIC.** Setting the GitHub repo **Private** makes every Vercel deploy
  go to state **`BLOCKED`** (Vercel's GitHub app on this plan can't pull the private repo).
  Repo is currently **public**. To go private later you must first grant the **Vercel GitHub
  App** access to the private repo (GitHub → Settings → Applications → Vercel → Configure).
- **Empty / non-`apps/web` commits are auto-skipped** → deploy state **`CANCELED`**, no build.
  Root Directory is `apps/web`, so Vercel skips builds when a commit changes no files there
  (empty commits, root-only doc commits). To force a real deploy, change a file **under
  `apps/web`** (or use dashboard Deployments → ⋯ → Redeploy — but note a `BLOCKED` deploy
  shows "cannot be redeployed, push a fresh commit").
- Toggling repo visibility can drop the Git connection → **Settings → Git → reconnect**.

- **Fixed + verified live (2026-06-15):** `/api/collect` used to return `500` on ~2% of a
  40-way burst (DB-pool pressure; `4/180`). The route now wraps `ingest` in try/catch → logs
  + returns `204`, so floods degrade to dropped events, never 500. Regression test added
  (`src/app/api/collect/route.test.ts`, 42 tests total). Deployed in `3f63a3a`; two prod
  bursts → **`0×500`**.

## Move #1 — Opinionated Overview redesign (design-led, phased)

Design source of truth: **`DESIGN-AUDIT.md`** (approved audit), **`OVERVIEW-SPEC.md`** (approved
Overview spec), **`MOVE-1-IMPLEMENTATION-PLAN.md`** (approved phase plan A–J + Phase 0). Work is
strictly incremental — one phase per PR, additive, `main` always shippable. Scope = the Overview
at `app/dashboard/[projectId]/page.tsx` only.

**✅ Phase 0 — Foundations (2026-06-16). Shared infra only — nothing wired into any page, so
ZERO visual change.** Verified: `59 tests` (+11), typecheck · lint · build all green; a grep
confirmed the new symbols are referenced only by their own defs + tests (no `app/` UI imports).

- **Files created:**
  - `apps/web/src/components/dashboard/delta.tsx` — `<Delta>` period-over-period badge (glyph =
    raw direction, color = good/bad via `invert`; `mode="points"` for rate deltas; neutral "—"
    when no baseline). Presentational, server-safe. **Unused in Phase 0.**
  - `apps/web/src/lib/lede.ts` — **types only** (`LedeToken`, `LedeInput`) reserving the Lede
    contract so Phases B/E/F plug clauses in without churn. `buildLede` is **Phase B**.
- **Files modified (additive exports only — no existing behavior changed):**
  - `apps/web/src/lib/range.ts` — `previousRange(from,to)` → equal-length prior window.
  - `apps/web/src/lib/format.ts` — `computeDelta`, `formatDeltaPct`, `formatDeltaPoints`,
    `flagEmoji`, `monogram` (+ `DeltaDirection` type). `formatMoney` already existed/shared.
  - `apps/web/src/server/queries/analytics.ts` — `getOverviewMetricsDelta` +
    `OverviewMetricsWithDelta`; **reuses** `getOverviewMetrics` for both windows (the SQL query
    is untouched). Imports `previousRange`.
  - `apps/web/src/lib/format.test.ts`, `range.test.ts` — unit tests for all new pure helpers.
- **Reasoning:** three later phases (Hero, Lede, KPI strip) all need period-over-period deltas, a
  `Delta` component, and flag/monogram helpers. Phase 0 builds them **once** so those phases don't
  duplicate logic — the plan's core rationale. Kept it 100% additive so it's trivially reviewable
  and reversible, and `main` stays shippable.
- **Risks:** very low — pure utilities + an unused component + a types file. `<Delta>` was **not**
  unit-tested as a React render (the suite is node-only; we deliberately did **not** add jsdom —
  PRD "avoid unnecessary dependencies"); its underlying logic (`computeDelta`) is fully tested.
- **What future phases MUST know:**
  - **API surface ready to consume:** `getOverviewMetricsDelta(projectId, from, to)` →
    `{ current, previous }`; `<Delta current previous mode? invert? />`; `previousRange`;
    `computeDelta`/`formatDeltaPct`/`formatDeltaPoints`/`flagEmoji`/`monogram`; `LedeToken`/
    `LedeInput`.
  - **Delta semantics:** `invert` for metrics where *down is good* (bounce rate, drop-off);
    `mode="points"` for rate deltas (conversion, bounce); neutral "—" when previous = 0.
  - **Open decisions still to resolve before their phase:** D1 favicon privacy → **recommend
    monograms (no third party)**, `monogram()` already built as the safe fallback; E1 primary
    funnel = first/oldest (no schema change); C1 sparkline data (ship visitors/pageviews first).
  - **Accent color is Move #3, not Move #1** — `<Delta>` uses semantic emerald/red only.
  - **Nothing renders yet.** Phases A–J each need separate approval before implementation.

**✅ Phase A — Hero (2026-06-16). First VISIBLE change — Overview only.** The Overview's old
visitors bar-chart card is replaced by the **hero** (the page's visual anchor, placed first).

- **Files created:** `apps/web/src/components/charts/trend-chart.tsx` — `<TrendChart>` (client):
  dependency-free area+line, **ghosted previous-period comparison line**, branded HTML hover
  tooltip (date · value · prev), crosshair + dot. Lines/area in a stretch-to-fit SVG kept crisp
  with `vector-effect="non-scaling-stroke"`; hover decorations are HTML overlays so non-uniform
  scaling never distorts them (fixes the old `preserveAspectRatio="none"` bar distortion).
- **Files modified:**
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — hero block (big tabular uniques number +
    `<Delta current previous />` + "vs N last period" + `<TrendChart>`), placed **above** the
    tiles. Fetches previous-period data via `previousRange` + `getOverviewMetrics` +
    `getTimeseries` (added to the existing `Promise.all`). **Stopped importing `BarChart`**
    (and removed `CardHeader`/`CardTitle` imports that the old chart card used). The **6 metric
    tiles, 5 breakdown cards, and empty state are byte-for-byte unchanged.**
  - `apps/web/src/server/queries/analytics.ts` — `getTimeseries` is now **exported** (additive
    visibility change only; behavior identical) so the page can fetch the previous-period series.
- **Reasoning:** Hero first establishes the protagonist + visual language and exercises the
  Phase 0 comparison pipeline end-to-end (the plan's "validate the foundations" goal). Kept it
  additive and section-scoped; reused `<Delta>` and `previousRange` rather than re-deriving them.
- **Risks (low):** new client component is the only new bundle (`/dashboard/[projectId]`
  713 B → 1.9 kB First Load — expected). Current/previous timeseries are aligned **by index**;
  if the two windows ever differ in day count (DST/boundary), trailing `prev` is `undefined` and
  the comparison line simply stops — no crash. `TrendChart` is not unit-tested (client/visual;
  node-only suite, no jsdom — same call as `<Delta>`); its inputs come from tested/trusted queries.
- **Transitional state (expected):** the unique-visitors number now appears **twice** (big in the
  hero + in the old tile). That's intentional — **Phase C** replaces the tiles with the KPI strip.
- **Verification:** 59 tests, typecheck · lint · build green. Hero current ≡ tile value (same
  query). Live DB cross-check: DataFast cur `1/1`, prev `0/0` → hero shows `1` vs neutral "—"
  (no-baseline). Other pages/tabs untouched (`BarChart` still used by marketing + event-detail).
  Visual desktop/mobile pass is best confirmed in the running app (only 1 real session in the DB).
- **Future phases must know:** `<TrendChart data valueLabel? height? ariaLabel? />` takes
  `{ label, value, prev? }[]`; reuse it for sessions/pageviews (Phase C sparkline is a *separate*
  smaller chart). The hero currently hardcodes **Unique visitors**; a metric switcher is optional
  later. Accent still deferred to **Move #3** (hero is monochrome).

**✅ Phase B — Lede system (2026-06-16). Overview only.** A calm one-sentence "what changed?"
briefing now sits at the **top of the Overview** (above the hero). **Traffic-only** by scope.

- **Files created:**
  - `apps/web/src/lib/lede.ts` — implemented `buildLede(input): LedeToken[]` (the Phase 0 file
    previously held types only). Pure, **templated** (no AI/LLM/external). Builds the visitors
    trend clause + an optional ", led by <top source>" clause. Edge cases all grammatical:
    increasing, decreasing, **steady** (a change under 0.5% reads as steady — no noisy
    sub-1% %), **no baseline** (previous = 0 → states the figure plainly, no false delta),
    **zero traffic**, and **singular** "1 visitor".
  - `apps/web/src/components/dashboard/lede.tsx` — `<Lede>` (server component): muted prose with
    bright `font-medium` data nouns; a token with `href` renders as a link (none in Phase B).
- **Files modified (additive):**
  - `apps/web/src/lib/lede.ts` — also **relaxed `topSource.href` (and funnel/revenue `href`) to
    optional**, because no Sources page exists yet, so the source is emphasized text without a
    drill link. Backward-compatible refinement of the Phase 0 contract.
  - `apps/web/src/lib/range.ts` — added `rangePeriodWord(key)` → "this week/month/quarter".
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — compute `ledeTokens` from `metrics` +
    `prevMetrics` + `rangePeriodWord(range)` + the existing `analytics.topReferrers[0]`; render
    `<Lede>` at the top of the data section. **No new queries** (reuses Phase A's fetch).
  - tests: `lib/lede.test.ts` (+9 sentence/edge-case tests), `range.test.ts` (+1).
- **Reasoning:** the Lede is what turns the Overview from "a grid of metrics" into "a briefing"
  (the audit's core thesis). Kept it a pure function (fully unit-testable) + a thin presentational
  component; the source clause uses data already fetched, so Phase B adds **zero** query cost.
- **Risks (very low):** pure logic + one server component; no client JS added (route still 1.9 kB).
  Sentence correctness is locked by 9 unit tests; real-data output verified against the live DB.
- **Transitional state (expected):** the redundant "Overview" `<h2>` still sits just above the
  Lede — its removal is **Phase J** (hierarchy cleanup), out of scope here.
- **Future phases must know:** `buildLede` already accepts optional `funnel` and `revenue` inputs
  — **Phase E** populates `funnel` (appends "… converts at X%") and **Phase F** populates
  `revenue` (appends "… <source> drove $N"); the sentence enriches itself with no rewrite.
  Drill `href`s light up when the Sources/Funnel/Revenue targets exist. Accent = Move #3.

**✅ Phase C — KPI strip (2026-06-16). Overview only.** The 6 transitional duplicate tiles are
replaced by a 4-KPI strip + a demoted Engagement line.

- **Files created:**
  - `apps/web/src/components/dashboard/stat-card.tsx` — `<StatCard>` (server): one **unified card
    spec** (`rounded-xl border bg-card`, matching the hero + breakdown cards). label · value ·
    optional `<Delta>` · optional `<Sparkline>` · optional live dot · `pending` (dimmed "—"
    placeholder for KPIs whose data lands later).
  - `apps/web/src/components/charts/sparkline.tsx` — `<Sparkline>` (server, dependency-free, tiny
    area+line, `aria-hidden`).
- **Files modified (additive):**
  - `apps/web/src/server/queries/analytics.ts` — added `getActiveNow(projectId)` (distinct
    visitors with `lastEventAt` in the last 5 min). Existing queries untouched.
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — KPI strip: **Pageviews** (value + delta +
    sparkline from existing `timeseries.pageviews`), **Signup conversion** + **Revenue** (`pending`
    placeholders, light up in **E**/**F**), **Active now** (live count + dot). **Stopped using
    `MetricCard`** (import removed). Added an inline **Engagement** line (bounce · pages/session ·
    avg duration) — the demoted vanity metrics. Fetches `getActiveNow` in the existing `Promise.all`.
- **Decisions (per plan + C1):** volume KPI = **Pageviews** (spec's "Sessions or Pageviews"),
  chosen because its per-day series already exists in `timeseries` → sparkline with **no new
  query**. Sessions is no longer a standalone tile (visitors is the hero). Conversion/Revenue
  sparklines + values are **deferred to E/F** (need per-day funnel/revenue series — C1).
- **Reasoning:** outcome-over-vanity — promote what matters (volume trend, conversion, revenue,
  live), demote diagnostics to one quiet line. `<StatCard>` also begins unifying the card system
  (the `rounded-lg` `MetricCard` is now unused on the Overview).
- **Risks (low):** `getActiveNow` adds one cheap point-in-time count per Overview load (filtered
  by `projectId` + `lastEventAt`). **"Active now" is a snapshot at page load, not a live stream** —
  the dot implies real-time but the page is server-rendered (true realtime is out of scope). For
  projects with no funnel/revenue (e.g. DataFast) 2 of 4 KPIs are dimmed "—" placeholders by design
  until E/F.
- **Transitional state (expected):** `MetricCard` (`components/dashboard/metric-card.tsx`) is now
  **unused** but intentionally **kept** — its deletion is **Phase J**. The "Overview" `<h2>` also
  still remains (Phase J).
- **Future phases must know:** **Phase E** fills the "Signup conversion" `StatCard` (drop
  `pending`; pass `value` % + `delta` with `mode="points"` from funnel data; a conversion sparkline
  needs a new per-day series). **Phase F** fills "Revenue" similarly (value $ + delta; revenue
  sparkline needs a per-day revenue series). `<StatCard>` already supports `mode="points"` and
  `invert` (for rate KPIs like a future bounce/drop-off). To add a Sessions sparkline later, add
  `count(*) AS sessions` to `getTimeseries` (one-line additive). Verified numbers: live DB
  pageviews `2`, active `0`, bounce `0.0%`. Accent = Move #3.

**✅ Phase D — Sources card (2026-06-16). Overview only.** Introduces the **outcomes triad** and
promotes top referrers into it as **"Top sources"**.

- **Decision D1 — APPROVED: monogram/letter avatars, NO third-party favicon service** (would leak
  customers' visited domains; off-brand for privacy-first). Avatars use the Phase 0 `monogram()`.
- **Files created:**
  - `apps/web/src/components/dashboard/source-row.tsx` — `<SourceRow>` (server): monogram avatar +
    label + **subtle** share bar (`bg-foreground/5`) + tabular value. **Reusable by Phases G/H**
    (Audience, Top pages). Has a default `format` (compact number).
  - `apps/web/src/components/dashboard/sources-card.tsx` — `<SourcesCard>`: "Top sources" card,
    top 6 referrers, empty state. Uses the existing `topReferrers` — **no new query**.
- **Files modified:**
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — added the **3-column triad grid** after
    the engagement line: **Sources (live)** + **Signup funnel** + **Revenue by source** as
    **dimmed `pending` placeholder Cards** ("—") that **light up in E/F**. **Moved referrers out**
    of the old breakdown grid (now 4 cards: Top pages, Countries, Devices, Browsers). Re-added
    `CardHeader`/`CardTitle` imports (needed for the placeholder cards; they had been removed in A).
- **Reasoning:** "where does traffic come from?" (Overview Q2) becomes a promoted, premium card
  with avatars instead of a plain text breakdown — the audit's "favicons/avatars are the biggest
  premium tell," done the privacy-first way.
- **Risks (very low):** presentational only; reuses a verified query; no client JS (route 1.9 kB).
- **Transitional states (expected):** (1) the triad currently has **1 live + 2 dimmed placeholder**
  cards, so heights are uneven until E/F fill them; (2) the breakdown grid temporarily lives below
  the triad until **G** (Audience merge) + **H** (Top pages demotion) + **J** (cleanup). "Direct"
  traffic is not a "source" here (the existing `getTopReferrers` excludes null referrers — unchanged).
- **Verification:** 69 tests, typecheck · lint · build green; Sources data matches `getTopReferrers`
  on the live DB (`google.com` 1 → avatar "G").
- **Future phases must know:** **Phase E** replaces the "Signup funnel" placeholder Card with a
  `<FunnelMini>` (and adds the Lede funnel clause); **Phase F** replaces "Revenue by source" with a
  `<RevenueMini>` (and the Lede money clause + the Revenue KPI). Reuse `<SourceRow>` for the
  Audience (G) and Top-pages (H) rows (it takes a `format` prop). Accent = Move #3.

**✅ Phase E — Funnel card (2026-06-16). Overview only.** Surfaces the **primary funnel** in the
triad (slot 2), fills the conversion KPI, and extends the Lede.

- **Decision E1 — APPLIED: primary funnel = the project's first/oldest funnel.** No schema change,
  no "pin to overview" field (a future decision).
- **Files created:**
  - `apps/web/src/components/dashboard/funnel-mini.tsx` — `<FunnelMini>` (server): compact step
    bars (label + thin bar + per-step conversion) + emphasized **overall conversion**. Reuses the
    existing `FunnelResults` type.
- **Files modified (additive):**
  - `apps/web/src/server/queries/funnels.ts` — added `getPrimaryFunnel(projectId)` (oldest funnel
    + ordered steps). Existing funnel queries/`computeFunnel` untouched.
  - `apps/web/src/lib/lede.ts` — refactored `buildLede` to **append** a funnel clause
    ("… `<name>` converts at `X%`", linked to `/funnels/[id]`). The Phase B traffic output is
    **byte-identical** when no funnel is passed (existing tests prove it). Imports `formatPercent`.
  - `apps/web/src/lib/lede.test.ts` — +3 funnel-clause tests.
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — fetch `getPrimaryFunnel` (in the
    `Promise.all`) then `getFunnelResults` for the current **and** previous windows; replace the
    funnel placeholder Card with `<FunnelMini>` (or a "Create a funnel" CTA when none); fill the
    **Signup conversion** KPI (value % + `mode="points"` delta); pass the funnel to `buildLede`.
- **Decisions/edge handling:** the **Lede funnel clause appears only when the funnel had entrants**
  this period (`entered > 0`) — keeps the headline calm. The KPI/card still render the funnel even
  with 0 entrants (honest "0.0%"). KPI label kept as **"Signup conversion"** per the spec/user
  (the canonical SaaS goal); the funnel card is titled by the funnel's actual name.
- **Reasoning:** "which funnels convert?" (Overview Q5) is now answerable on the Overview without a
  tab hop, reusing the verified funnel engine.
- **Risks (low):** reuses tested logic (`computeFunnel`); `getPrimaryFunnel` is a trivial
  `findFirst orderBy asc`; one extra (parallel) pair of funnel queries only when a funnel exists;
  no client JS (route 1.9 kB).
- **Verification:** 72 tests (+3), typecheck · lint · build green. Live DataFast has **0 funnels**
  → exercises the **CTA path** (Create-funnel CTA + pending conversion KPI + no Lede funnel clause)
  — correct. Funnel-present path covered by `computeFunnel [5,2,1]` + the new Lede tests.
- **Future phases must know:** **Phase F** replaces the "Revenue by source" placeholder with
  `<RevenueMini>`, fills the **Revenue** KPI, and appends the Lede **revenue** clause (the
  `buildLede` revenue hook is reserved with a comment). Accent = Move #3.

**✅ Phase F — Revenue card (2026-06-16). Overview only. The outcomes triad is now fully real.**

- **Files created:**
  - `apps/web/src/components/dashboard/revenue-mini.tsx` — `<RevenueMini>` (server): **reuses
    `<SourceRow>`** with money formatting (monogram avatars per D1) + an emphasized **Total**,
    matching `SourcesCard`/`FunnelMini`. Empty state "No revenue yet".
- **Files modified (additive):**
  - `apps/web/src/lib/lede.ts` — appended a **revenue clause** at the reserved hook:
    "`<total>` in revenue, led by `<source>`" (parallels the traffic clause; amount = total to
    match the KPI; linked to `/revenue`). Imports `formatMoney`. Traffic+funnel output unchanged
    when no revenue. +3 tests in `lib/lede.test.ts`.
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — fetch `getPayPalConnection` +
    `getRevenueSummary` (current **and** previous) + `getRevenueBySource` in the `Promise.all`;
    `showRevenue = connected || count > 0`; replace the placeholder with `<RevenueMini>` (or a
    "Connect revenue" CTA); fill the **Revenue** KPI (money + % delta); pass the revenue clause to
    `buildLede`. No revenue query was modified.
- **Decisions:** **revenue clause only when meaningful** — there is revenue (`total > 0`) **and** a
  **named** top source (skips "Direct / unknown"). The card/KPI use `showRevenue` (connected OR any
  revenue): connected-but-zero shows the card with "No revenue yet" + `$0.00`; nothing → CTA +
  pending KPI. KPI delta = **percent** (revenue is an amount, like pageviews).
- **Risks (low):** four cheap revenue aggregates added to the parallel fetch (0 rows for projects
  without revenue); reuses verified queries; no client JS (route 1.9 kB).
- **Verification:** 75 tests (+3), typecheck · lint · build green. Live DataFast (0 revenue, no
  PayPal integration) → **Connect-revenue CTA + pending Revenue KPI + no Lede revenue clause**
  (correct). Revenue-present path covered by the 3 new Lede tests + the Phase 7 revenue-query
  verification + the verified `SourceRow`/`formatMoney`.
- **Transitional states:** **none new in the triad** — Sources + Funnel + Revenue are all real now.
  Still pending overall: the breakdown grid (Top pages + Countries/Devices/Browsers) awaits
  **G** (Audience merge) + **H** (Top pages) + **J** (retire `MetricCard`, remove "Overview" h2,
  focused empty state). KPI strip is complete (all 4 KPIs wired).
- **Future phases must know:** **Phase G** merges Countries/Devices/Browsers into one Audience card
  (flags + glyphs, reuse `<SourceRow>`); **Phase H** demotes Top pages (reuse `<SourceRow>`);
  **Phase I** mobile pass; **Phase J** cleanup. Accent = Move #3.

**✅ Phase G — Audience card (2026-06-16). Overview only.** The 3 breakdown cards (Countries,
Devices, Browsers) are merged into **one Audience card** with a segmented control.

- **Files created:**
  - `apps/web/src/components/dashboard/audience-card.tsx` — `<AudienceCard>` (**client**, the
    Overview's 2nd client component after `TrendChart`): a `useState` segmented control toggling
    Countries / Devices / Browsers. **All three datasets are already fetched server-side**, so
    switching just re-renders a different array — no new request, no animation beyond the existing
    colour transition. Reuses `<SourceRow>`: **flags** (`flagEmoji` + `countryName`) for countries,
    monochrome **lucide** icons (`Monitor`/`Smartphone`/`Tablet`, already a dependency) for devices,
    **monogram** for browsers.
- **Files modified (additive):**
  - `apps/web/src/components/dashboard/source-row.tsx` — added an **optional `icon?: ReactNode`**
    that overrides the monogram avatar. Backward-compatible: Sources/Revenue rows are unchanged.
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — replaced the 3 breakdown cards with
    `<AudienceCard countries/devices/browsers />`; **removed** the `mapCountries`/`mapDevices`
    helpers and the now-unused `countryName` + `BreakdownRow` imports. **No query changed.**
- **Decisions:** segmented control = a small **client** toggle (the spec's preferred interaction;
  server query-param tabs would reload the page per switch — worse). Device glyphs use **lucide**
  (already in `package.json`, monochrome) — not a new dependency. Browsers use monograms (no clean
  per-browser icon). Countries use flag emoji per the spec.
- **Risks (low):** first interactive Overview client component → route First Load `1.9 → 3.68 kB`
  (AudienceCard + 3 lucide icons), still small. **Windows caveat:** Chrome/Edge on Windows render
  flag emojis as letter-pairs ("DZ") not flags — a platform font limitation, degrades gracefully
  (still shows the country). Mac/iOS/Android show flags.
- **Verification:** 75 tests, typecheck · lint · build green. Live DataFast → Countries `DZ`→
  "Algeria" 1, Devices `DESKTOP`→"Desktop" 1, Browsers "Chrome" 1 — identical to the old cards.
- **Transitional states:** the detail row is now **Top pages (still old `BreakdownCard`) +
  Audience**; Top pages restyle/demotion is **Phase H**. The "Overview" `<h2>` and the unused
  `MetricCard` still remain (**Phase J**).
- **Future phases must know:** **Phase H** restyles/keeps Top pages in the detail row (reuse
  `<SourceRow>`) + finalizes the engagement diagnostics placement; **I** mobile pass; **J** cleanup
  (retire `MetricCard`, remove the "Overview" h2, single focused empty state). Accent = Move #3.

**✅ Phase H — Top pages + diagnostics (2026-06-17). Overview only.** The detail row's "footnotes"
now read as one system: Top pages reuses `<SourceRow>`, and the demoted engagement line is finalized.

- **Files created:**
  - `apps/web/src/components/dashboard/top-pages-card.tsx` — `<TopPagesCard>` (**server** component,
    zero client JS): a near-exact parallel of `<SourcesCard>` that maps `analytics.topPages` to
    `<SourceRow>` (monogram avatar + share bar + tabular value). Pages have no favicon, so the
    privacy-safe **monogram default** applies (decision D1) — no `icon` override (honors the Phase G
    note "Top pages keeps monogram/none"). Honest empty state: "No pageviews yet". Renders all rows
    the query returns (≤10) to balance the Audience card beside it.
- **Files modified (additive):**
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — swapped the detail-row card
    `<BreakdownCard title="Top pages" …>` → `<TopPagesCard items={analytics.topPages} />` (and the
    import); added `tabular-nums` to the demoted **Engagement** diagnostics line (Bounce ·
    pages/session · avg session) per spec §6. **No query changed.**
- **Decisions:** monogram (not a new glyph) for page rows — matches `<SourcesCard>` exactly and the
  recorded Phase G intent; lowest-risk, zero new imports/deps. The engagement line **stays below the
  KPI strip** (its correct home since Phase C, spec §4.3) — Phase H only finalized its styling
  (tabular-nums), not its placement. Top pages renders ≤10 rows (prior `<BreakdownCard>` behavior;
  balances Audience).
- **Risks (very low):** presentation-only. `getTopPages`/`analytics.topPages` unchanged → numbers
  identical to the prior verified rendering (no new data path to seed-verify). `<BreakdownCard>` is
  **still used by the Revenue page** (`revenue/page.tsx`) — not orphaned, not a J deletion target.
- **Verification:** 75 tests, typecheck · lint · build green. Overview route **3.68 kB First Load
  (unchanged from Phase G)** — confirms `<TopPagesCard>` adds no client weight (server component).
- **Transitional states remaining:** only the redundant "Overview" `<h2>` and the unused
  `MetricCard` (both **Phase J**). The hero, Lede, KPI strip, triad, and detail row are all
  final-styled now.
- **Future phases must know:** **Phase I** = the responsive/mobile pass (single column; above-the-
  fold = Lede → Hero → KPIs; triad stacks; KPIs 2×2; tap targets ≥40px; correct chart heights)
  across the assembled sections — CSS-only, verify each width (375/390/768/1024/1440). **Phase J** =
  cleanup (retire `MetricCard`, remove the "Overview" `<h2>`, single focused empty state, final
  a11y/spacing). Accent = Move #3.

**✅ Phase I — Mobile layout pass (2026-06-18). Overview only.** A CSS/responsive-only pass over the
assembled Overview — no data, query, or logic change (the 75 pure-logic tests are untouched and green).

- **Files modified (responsive classes / additive props only):**
  - `apps/web/src/components/charts/trend-chart.tsx` — added an optional **`heightClassName`** prop
    (+`cn` import). When set it replaces the inline `height` style so the hero chart can use
    responsive Tailwind heights. The inline `height` (default 260) is untouched for any other caller
    (there are none — `TrendChart` is Overview-only).
  - `apps/web/src/components/dashboard/sources-card.tsx` — added an optional **`className`**
    passthrough to its root `<Card>` (needed to put an `order-*` utility on the Sources grid item).
  - `apps/web/src/app/dashboard/[projectId]/page.tsx` — hero `<TrendChart heightClassName="h-[200px]
    sm:h-[260px]">` (200px <640 / 260px ≥640); the triad grid items get `order-{1,2,3} md:order-none`
    (Sources=2, Funnel=1, Revenue=3) so mobile stacks **Funnel → Sources → Revenue** (spec §10) and
    ≥768 returns to the natural **Sources | Funnel | Revenue** row. Refreshed two stale comments.
- **Already-correct (no change):** KPI strip `grid-cols-2 lg:grid-cols-4` (2×2 mobile/tablet → 4
  desktop); detail row `md:grid-cols-2` (stacks <768); `<Sparkline>` (`w-full`, 22px — legible on
  mobile). The mobile above-the-fold is already Lede → Hero → KPIs (DOM order).
- **Decisions / scope:** kept the **DOM = desktop order** and used `order-*` (reset at `md`) so
  "stacked = mobile order, row = desktop order" — which also preserves the triad's equal-height
  stretch (order utilities sit on the grid items, not wrapper divs). Desktop hero height kept at
  **260px** (`sm:h-[260px]` == the prior inline default) to honor "desktop unchanged" rather than
  bumping to the spec's ~300. **Left `ProjectHeader` (the 6 project tabs) alone** — shared by every
  project page, so out of the Overview-only scope (its mobile behavior is pre-existing; a separate
  ux-debt issue if the tabs overflow on small phones). **RangeSelect** stays `h-9` (36px, adequate
  native control) to avoid changing desktop.
- **Risks (low, CSS-only):** the regression-prone spot is the triad `order-*` — verified all three
  children carry an explicit mobile order (default `order-0` would otherwise float Revenue to the
  top) and that they reset at `md`. No browser in this env, so per-width visual QA is reasoned from
  the deterministic breakpoints + the green build, not screenshots; a live pass at
  375/390/768/1024/1440 on the next deploy preview is recommended.
- **Verification:** 75 tests · typecheck · lint · production build all green. Overview route **3.72
  kB** First Load (was 3.68; +~40 B for the `cn` import + class strings), 116 kB total unchanged.
- **What remained unchanged:** desktop layout/behavior (provably — `sm:h-[260px]`, `md:order-none`);
  all data + every query; other pages; `BarChart`; monochrome (accent = Move #3).
- **Future phases must know:** only **Phase J** remains — cleanup/coherence: retire the unused
  `MetricCard` (grep-confirm; Revenue still uses `BreakdownCard`, so that one stays), remove the
  redundant "Overview" `<h2>`, single focused "Waiting for your first pageview" empty state (spec
  §7), final tabular-nums/focus/contrast/spacing a11y. Accent stays Move #3.

**✅ Phase J — Cleanup & hierarchy polish (2026-06-18). Overview only. — COMPLETES MOVE #1.** The
final coherence pass; no query/schema change, no other page touched.

- **Removed (Overview):**
  - the redundant **"Overview" `<h2>`** (the `ProjectHeader` tab already names the view; spec §4.0)
    — the header row is now just the right-aligned `RangeSelect` (`justify-end`).
  - the hero's **bare min/max date labels** — the branded `TrendChart` hover tooltip provides the
    date now (spec §4.2 / plan Phase J "delete the bare min/max date labels").
- **Empty state (spec §7):** replaced the generic "No data in this period yet." card with **one
  focused panel** — a live **emerald pulse** (`animate-ping`, `motion-reduce:animate-none`) +
  "**Waiting for your first pageview**" + the **copyable install snippet** (`<InstallSnippet>`,
  already a component) + a quiet "Full setup & verification →" link. The snippet string is built
  **Overview-local** (same construction as Settings) so the Settings page stays untouched. Triggers
  on `sessions === 0` for the range, per spec.
- **Coherence / a11y:**
  - `tabular-nums` added to the **Lede** `<p>` → every number on the Overview is now tabular
    (hero, KPIs, rows, charts, engagement line, Lede).
  - `focus-visible` ring on the **Audience segmented control** buttons (`outline-none
    focus-visible:ring-[3px] focus-visible:ring-ring/50`, matching the `Button` convention).
  - confirmed **one card spec** (`Card`/`StatCard`, `rounded-xl`) and **one bar style**
    (`bg-foreground/5` across `SourceRow`/`FunnelMini`/`RevenueMini`) on the Overview — already true
    after H/F, re-verified here.
- **`MetricCard` was NOT deleted (important).** The plan said "retire if nothing else imports it"
  and the issue said "grep-confirm zero imports, then delete." **Grep found 3 live importers** —
  `revenue/page.tsx`, `events/[name]/page.tsx`, `funnels/[funnelId]/page.tsx` — so deleting it
  would break those pages (and violate "other pages unchanged"). It stays. The Overview itself no
  longer uses it (StatCard replaced the tiles in C), so the Overview is already on one card system.
  Unifying `MetricCard` (`rounded-lg`) onto the `rounded-xl` spec across the detail pages is a
  **Move #3 "unify specs"** item. `DESIGN-SYSTEM.md` updated to say so. `BreakdownCard` likewise
  stays (Revenue uses it).
- **Files:** `apps/web/src/app/dashboard/[projectId]/page.tsx`, `components/dashboard/lede.tsx`,
  `components/dashboard/audience-card.tsx`, `DESIGN-SYSTEM.md`. (`metric-card.tsx` deliberately
  untouched.)
- **Verification:** 75 tests · typecheck · lint · production build all green. Overview route **4.48
  kB** First Load (was 3.72; +~2 kB because `<InstallSnippet>`, a client copy-button, is now in the
  empty state). No browser in this env → empty-state visual reasoned from the markup + green build.
- **What remained unchanged:** every query + all data; the Events/Funnels/Revenue/Reports/Settings
  pages; `MetricCard` + `BreakdownCard` + their consumers; the hero/Lede/KPI/triad/detail content
  and the A–I desktop+mobile layouts; monochrome (emerald is the existing "live"/positive semantic,
  not a brand accent).
- **MOVE #1 IS COMPLETE** (Phases 0, A–J). The Overview is a briefing — Lede → Hero → 4 KPIs →
  outcomes triad → detail row, deltas everywhere, responsive, one card/number/bar spec, focused
  empty state. Pending the user's approval of Phase J, then: mark `ONE-15` Done + the **Move #1**
  Linear project Done. **Next is Move #2 (Feel & Performance) — a planning task first** (spec +
  phased plan, approved) **before any phase**. Accent/identity is Move #3.

**📋 Move #2 — Feel & Performance: PLANNING (2026-06-18). Planning-only session — no code.** Move #1
was approved (`ONE-15` Done, Move #1 project Completed). Wrote the Move #2 planning artifacts and set
up Linear; **nothing was implemented**.

- **Docs created:** `MOVE-2-SPEC.md` (the "instant + alive" design spec — philosophy, the "feel
  test", capabilities [optimistic switching · skeletons · view transitions · count-up · chart
  draw-in · hover/press], the one motion system, a11y + `prefers-reduced-motion`, server-first
  preservation, the explicit **no-animation-library** stance, success criteria) and
  `MOVE-2-IMPLEMENTATION-PLAN.md` (phased, additive, approval-gated: **Phase 0 foundations + A–G**,
  each with goal/scope/deps/risks/"must remain unchanged"/DoD).
- **Linear:** `Move #1 — Opinionated Overview` → **Completed**; `ONE-15` → **Done**; `Move #2 — Feel
  & Performance` → **Planned** with 8 phase issues — **`ONE-47` Phase 0 (Motion foundations) = Todo**,
  `ONE-48`..`ONE-54` (A–G) = Backlog. Also filed `ONE-46` (Move #3 design-debt: unify `MetricCard`
  onto the `rounded-xl` spec — discovered in Phase J).
- **Key stance (from the spec):** Move #2 is **feel only** — server-first preserved (RSC + server
  actions; **no client data/state lib**; "optimistic" = `useTransition`/Suspense, not client
  mutation); **no animation library / no new dependency** (CSS + native View Transitions API + ~2
  tiny pure hooks); monochrome (accent = Move #3); `prefers-reduced-motion` is a first-class,
  per-phase DoD item.
- **Must remain unchanged when Move #2 builds:** all Move #1 visuals + data; every query (no
  schema/query change); the Events/Funnels/Revenue/Reports/Settings/Billing pages' content (they may
  *inherit* global skeleton/transition feel only); the 75-test suite (extended, not weakened).
- **Next:** on approval of the spec + plan, implement **Phase 0 (`ONE-47`) only**, then stop. Do not
  start Move #3.

**✅ Move #2 / Phase 0 — Motion foundations (2026-06-18). Foundations only — nothing wired into a
page, so ZERO visible change for default users.** Implemented `ONE-47`.

- **`globals.css`:** motion tokens (theme-agnostic) — `--motion-ease` (`cubic-bezier(0.22,1,0.36,1)`,
  exposed as the `ease-soft` utility) + durations `--motion-micro 120ms` / `--motion-base 180ms` /
  `--motion-entrance 600ms`; the `shimmer` + `draw-in` keyframes + their `animate-shimmer` /
  `animate-draw-in` utilities; and a **global `@media (prefers-reduced-motion: reduce)` guard** that
  makes every animation/transition instant.
- **`lib/motion.ts`** (pure, **unit-tested — +8**): `easeOutCubic` + `countUpValue` (the count-up
  math, kept pure for the node-only suite per ADR-017).
- **`lib/hooks/use-reduced-motion.ts`:** `useReducedMotion()` (SSR-safe matchMedia; `false` on
  server + first render → no hydration mismatch) — for the few JS-driven motions that must branch.
- **`lib/hooks/use-count-up.ts`:** `useCountUp(target, durationMs=600)` — rAF; renders `target` on
  SSR / no-JS / reduced-motion (no layout shift), else eases 0→target once. Returns a raw number;
  callers round/format (Phase C wires it in; the SSR-flash handling is a Phase-C concern).
- **`components/ui/skeleton.tsx`:** `<Skeleton>` — muted block + a subtle shimmer span; static under
  reduced-motion. Consumed by Phase A.
- **`DESIGN-SYSTEM.md`:** "Motion philosophy" updated (target → in progress) — tokens, the
  reduced-motion gate, the primitives.
- **Verification:** 83 tests (+8) · typecheck · lint · production build all green. Overview route
  **4.48 kB First Load — unchanged** (CSS-only + unimported primitives = no client weight). Grep
  confirmed the new symbols are referenced only by their own defs/tests (no `app/` page wiring). No
  browser in env → the reduced-motion guard / shimmer are reasoned from valid CSS + the green build.
- **Decisions:** reduced-motion is **CSS-first** (one global guard) + a JS hook only where needed, so
  later pure-CSS phases inherit reduced-motion for free. `--animate-*`/`--ease-*` live in
  `@theme inline` (Tailwind v4 idiom → real utilities); durations are plain `:root` vars (used by the
  keyframes now, arbitrary values later).
- **What remained unchanged:** every page's default rendering; all data + queries; other pages;
  server-first; monochrome (motion only; accent = Move #3); the suite (extended, +8).
- **Next:** **Phase A — Skeletons / loading states (`ONE-48`)** — a `loading.tsx` mirroring the
  Overview, built from `<Skeleton>`; Phase B then reuses that skeleton as its optimistic pending state.

**✅ Move #2 / Phase A — Skeletons / loading states (2026-06-18). Overview only.** The Overview now
streams a layout-matching skeleton instead of waiting blank — implemented `ONE-48`.

- **New `components/dashboard/overview-skeleton.tsx`** — `<OverviewSkeleton>`: a **content** skeleton
  (Lede → hero → 4 KPIs → engagement line → 3 triad cards → 2 detail cards) from the Phase-0
  `<Skeleton>` + the real `<Card>` chrome, at the real dimensions (the hero chart block matches
  `h-[200px] sm:h-[260px]` exactly). Server component, zero client JS. Header/range excluded so it's
  **reusable as Phase B's in-page pending visual**.
- **`app/dashboard/[projectId]/page.tsx`** — split the default export into a **sync wrapper** that
  renders `<Suspense fallback={<OverviewLoading/>}><OverviewContent {...props}/></Suspense>`; the
  former async body moved **verbatim** into `OverviewContent` (loaded output byte-identical).
  `OverviewLoading` = header skeleton + range placeholder + `<OverviewSkeleton>` in the same
  `space-y-8` shell.
- **Why in-page Suspense, not `loading.tsx`:** there is **no `[projectId]/layout.tsx`**, so a
  route-level `loading.tsx` would also be the Suspense fallback for the sibling tabs
  (Events/Funnels/Revenue/…) and flash an Overview-shaped skeleton there — violating "other pages
  unchanged." The in-page boundary scopes the skeleton to the Overview (ONE-48 allows "loading.tsx
  **and/or Suspense boundaries**").
- **Reduced-motion:** the shimmer is disabled by the Phase-0 global guard → a calm static skeleton.
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **4.48 kB
  First Load — unchanged** (server-only skeleton, no client weight). No new dependency. No browser in
  env → the streamed skeleton / no-layout-shift / reduced-motion reasoned from the mirrored structure
  (hero block matches exactly) + the green build, not screenshots.
- **What remained unchanged:** the loaded Overview (content/layout/data — `OverviewContent` is the
  same body); every query; **all other pages** (no `loading.tsx`); server-first (in-page Suspense, no
  client loader); monochrome; the 83-test suite.
- **Next:** **Phase B — Optimistic range + section switching (`ONE-49`)** — `useTransition` so range
  (and tab) changes flip the active state instantly + show a pending visual (reuse
  `<OverviewSkeleton>` or a subtle dim) while the server re-renders; preserve scroll.

**✅ Move #2 / Phase B (B1) — Optimistic range switching (2026-06-18). Overview only.** Range changes
now feel instant — implemented `ONE-49` (B1; B2 split to `ONE-55`).

- **New `components/dashboard/overview-shell.tsx`** — `<OverviewShell>` (client): owns the Overview's
  range `<select>` and navigates via **`useTransition`**. The active value flips immediately (local
  state); the content is **dimmed + `aria-busy`** while the server re-renders — the transition
  **suppresses the Phase-A Suspense skeleton**, so the content stays in place (no flash) — and
  **scroll is preserved** (`router.push(url, { scroll: false })`). The dim's opacity transition uses
  the Phase-0 `--motion-base`/`--motion-ease` tokens; the global reduced-motion guard makes it instant.
- **`page.tsx`** — wraps the rendered content in `<OverviewShell range={range}>…children…</…>`. The
  page stays a **server component** and passes its content as `children` (the RSC-into-client
  pattern); **no client data/state library** ("optimistic" = instant feedback during the server
  round-trip, not client mutation).
- **`RangeSelect` is SHARED — left untouched.** Grep: `<RangeSelect>` is also used by Events,
  Funnels-detail, and Revenue, so it was **not** modified; `<OverviewShell>` renders its own inline
  select (Overview-only). The other three pages keep the unchanged control.
- **B2 (section tabs) deferred → `ONE-55`.** The `ProjectHeader` tabs are shared by all 6 project
  pages; making them optimistic changes shared chrome → its own reviewable unit. Phase B stayed
  Overview-scoped (range only).
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **4.64 kB**
  (was 4.48; +~0.16 kB for the `<OverviewShell>` client leaf). No new dependency. No browser in env →
  the optimistic feel / scroll preservation / dim reasoned from the architecture (`useTransition` +
  the Phase-A Suspense + `scroll:false` + content-as-children dim) + the green build.
- **What remained unchanged:** the shared `<RangeSelect>` + Events/Funnels/Revenue; the data,
  queries, URL/range semantics, loaded output; server-first; monochrome; the 83-test suite.
- **Next:** **Phase C — Number count-up (`ONE-50`)** — wire the Phase-0 `useCountUp` into the hero
  metric + KPI values (once on arrival; reduced-motion → final value; `tabular-nums`); mind the
  SSR/hydration handling.

**✅ Move #2 / Phase C — Number count-up (2026-06-18). Overview only.** The hero + KPI numbers animate
up once on arrival — implemented `ONE-50`.

- **New `components/dashboard/count-up.tsx`** — `<CountUp>` (client): renders
  `format(useCountUp(value))` with `tabular-nums`. Animates 0→value once on mount + on value change;
  reduced-motion / no-JS / SSR → the final value instantly (the Phase-0 `useCountUp` returns target).
- **Serializable `format` token, NOT a function.** A function prop can't cross the server→client
  boundary (the hero/KPIs are server-rendered and pass `<CountUp>` in), so `format` is
  `"number" | "percent" | "money"` (+ `currency`); `<CountUp>` imports the format helpers. `"number"`
  rounds to an integer so counts never show decimals mid-count.
- **Wired (5 numbers):** hero unique-visitors (`page.tsx`) + the 4 KPI values — Pageviews, Signup
  conversion (%), Revenue ($), Active now — via `StatCard.value`, widened `string → ReactNode`
  (non-breaking; strings are still valid).
- **`formatMoney` import removed** from `page.tsx` (its only use, the Revenue KPI, now goes through
  `<CountUp>`).
- **Final values exact:** integers are already whole (`Math.round` is a no-op on them); `%`/`$` keep
  their formatting. `Delta` / `Sparkline` / live dot / `pending` untouched.
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **5.12 kB**
  (was 4.64; +~0.48 kB for `<CountUp>` + the hooks/format helpers in the client). No new dependency.
  No browser in env → the count-up is reasoned from the tested `useCountUp` math + the green build.
- **Known polish (→ Phase G):** on a *hard* load the number shows final → resets → counts up (clean on
  soft-nav / range-change); the delta badge has a minor intra-count width jiggle (count from 0). Both
  are restraint/polish items for Phase G, not correctness issues.
- **What remained unchanged:** the values themselves; tabular alignment; `Delta`/`Sparkline`/live/
  pending; other pages; server-first (CountUp is a tiny client leaf); monochrome; the 83-test suite.
- **Next:** **Phase D — Chart draw-in (`ONE-51`)** — the hero `TrendChart` + `Sparkline`s draw in once
  on mount via the Phase-0 `draw-in` keyframe (CSS, `pathLength=1`); reduced-motion → static; the
  chart's correctness/scaling/tooltip untouched.

**✅ Move #2 / Phase D — Chart draw-in (2026-06-18). Overview only.** The hero chart + sparkline lines
draw in once on mount — implemented `ONE-51`. CSS-only (no client JS).

- **`trend-chart.tsx` + `sparkline.tsx`** — the **solid value line** in each gets `pathLength={1}` +
  `strokeDasharray={1}` + the `animate-draw-in` class. The Phase-0 `draw-in` keyframe animates
  `stroke-dashoffset` 1→0; `pathLength=1` normalizes the length so the reveal works regardless of the
  real, non-uniformly-scaled (`preserveAspectRatio="none"`) path. `vectorEffect="non-scaling-stroke"`
  is **kept** (crisp constant-width stroke) — it coexists with the pathLength dash reveal.
- **`globals.css`** — refined the Phase-0 `--animate-draw-in` fill-mode **`forwards → both`** so the
  line is hidden *before* the draw (backwards fill → no initial drawn-flash) and persists drawn after
  (forwards). Robustness bonus: if CSS animations are disabled entirely (not via reduced-motion), the
  base `stroke-dashoffset` (0) leaves the line **fully drawn**, not stuck hidden.
- **Reduced-motion:** the global guard makes the animation instant → the line renders drawn (static).
- **Draws once:** a CSS animation doesn't replay on React re-renders, so it plays on mount and not on
  hover; on a range change the line updates without re-drawing (acceptable — "once on mount").
- **Untouched:** the area fill, the **ghosted dashed comparison line** (`stroke-dasharray="4 4"` — NOT
  given the draw-in, since its dash is its style), gridlines, scaling, and the crosshair + branded
  hover tooltip (HTML overlays). `BarChart` (other pages) untouched. `Sparkline` stays a server
  component (`aria-hidden`); `TrendChart` stays client.
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **5.15 kB**
  (was 5.12; +~0.03 kB — two SVG attributes + a class, no new client JS). No new dependency. No
  browser in env → the draw-in is reasoned from the standard `pathLength=1` dash technique + the
  Phase-0 keyframe + the green build.
- **Next:** **Phase E — Hover & press micro-interactions (`ONE-52`)** — subtle hover lift on
  interactive cards/rows + press feedback on buttons/controls (`--motion-micro`); reduced-motion safe.

**✅ Move #2 / Phase E — Hover & press micro-interactions (2026-06-18). Overview only; deliberately
conservative.** Implemented `ONE-52`.

- **Scope decision (per direction): controls only — NO fake card/row hover.** The triad/detail/KPI
  cards and `SourceRow`s are not clickable (drill-in isn't built), so highlighting them on hover would
  imply a false affordance. Phase E refines only the two genuinely-interactive Overview controls.
- **Audience segmented control (`audience-card.tsx`):** a subtle press cue `active:scale-[0.97]`
  (**gated off under reduced-motion** via `motion-reduce:active:scale-100`) + a faint
  `hover:bg-background/50` on the *non-selected* tabs; transitions on the Phase-0 `--motion-micro`
  (~120ms) / `ease-soft` tokens. The `focus-visible` ring (Move #1 / Phase J) is preserved.
- **Range select (`overview-shell.tsx`):** a subtle `hover:bg-accent/50` tint + `transition-colors` on
  `--motion-micro`/`ease-soft`. No press cue (a native select opens a dropdown on click). Focus
  indicator untouched.
- **No layout shift** — only `transform` (scale) + `background` change. **Reduced-motion** → the global
  guard makes transitions instant and the press scale is disabled → color-only, calm.
- **Untouched:** the shared `<Button>` (all pages) and the shared `<RangeSelect>` (Events/Funnels/
  Revenue) — Phase E only touched `OverviewShell`'s own select + `AudienceCard` (both Overview-only);
  the drill links keep their existing hover; all focus-visible states intact.
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **5.21 kB**
  (was 5.15; +~0.06 kB — class strings, no new client JS). No new dependency. No browser in env → the
  hover/press feel is reasoned from the standard CSS classes + token resolution + the green build.
- **Next:** **Phase F — Route / view transitions (`ONE-53`)** — a progressive-enhancement cross-fade on
  navigation via the native View Transitions API (feature-detected + reduced-motion gated); no support
  → today's instant nav; don't regress the Phase-B optimistic switching or the Suspense skeleton.

**✅ Move #2 / Phase F — Route / view transitions (2026-06-18). CSS-only; deliberately partial scope.**
Implemented `ONE-53`.

- **What shipped (`globals.css` only):** a reduced-motion-gated native `@view-transition { navigation:
  auto }` (inside `@media (prefers-reduced-motion: no-preference)`) + a subtle ~200ms root cross-fade
  (`::view-transition-old/new(root)`, `--motion-ease`). Pure progressive enhancement — browsers without
  the View Transitions API ignore the rules; reduced-motion users get instant navigation.
- **Scope decision (a reasoned partial implementation, per the phase's own latitude):**
  `@view-transition` drives **cross-document** transitions only (full page loads — entering the app,
  some auth redirects, hard reloads). The in-app SPA navigations were NOT wrapped, for hard reasons:
  - **Range changes** are SPA `searchParams` updates (not document navigations), already animated by
    **Phase B's optimistic dim** — `navigation: auto` never touches them, so **no conflict** (and the
    direction was to leave Phase B unchanged).
  - **Section-tab** SPA transitions would require making the **shared `ProjectHeader` interactive**
    (= B2 / `ONE-55`, deferred) or Next's **experimental** `ViewTransition` (avoided per direction) —
    both out of scope. A global click-interceptor was rejected as fragile.
  So the native, dependency-free, zero-conflict, zero-component-change implementation is the
  cross-document cross-fade, documented inline in `globals.css`.
- **No conflicts:** Phase A skeleton, Phase C count-up, Phase D draw-in are element-level and unrelated
  to the page-level root cross-fade; Phase B is untouched (range ≠ doc nav). Reduced-motion → no VT.
- **Verification:** 83 tests · typecheck · lint · production build green (Tailwind v4 / Lightning CSS
  accepts `@view-transition` + `::view-transition-*`). Overview route **5.21 kB — unchanged** (CSS
  only, no JS). No new dependency. No browser in env → reasoned from valid native VT CSS + green build.
- **What remained unchanged:** every component; Phase A/B/C/D/E; the shared `ProjectHeader` (no B2);
  server-first; all pages' content/queries; monochrome; no layout shift; the 83-test suite.
- **Next:** **Phase G — Polish, reduced-motion & a11y pass (`ONE-54`)** — the **LAST core Move #2
  phase**: tune timings/consistency, a full reduced-motion audit (incl. the Phase-C count-up SSR/
  hydration reset + delta intra-count jiggle), a11y (aria-busy/focus across motions), perf check, and
  reconcile the `MOVE-2-SPEC` success criteria.

**✅ Move #2 / Phase G — Polish, reduced-motion & a11y pass (2026-06-18). Overview only. — COMPLETES
THE MOVE #2 CORE.** Implemented `ONE-54`.

- **Motion-token harmonization (`globals.css`):** `--animate-draw-in` `0.6s → var(--motion-entrance)`;
  the view-transition cross-fade `200ms → var(--motion-base)`. (The skeleton `shimmer` keeps its 1.6s
  continuous-loop rhythm — intentionally not a micro/base/entrance interaction.) Every other effect
  already used the tokens (Phase B dim = `--motion-base`; Phase E hover/press = `--motion-micro` +
  `ease-soft`).
- **Phase-C item (a) — hard-load count-up flash, FIXED (`use-count-up.ts`):** `useCountUp` now **skips
  the initial mount** (renders the final value immediately, no reset) and counts only on **`target`
  change**. The server paints the final value; a mount animation would reset it to 0 and re-count (the
  visible "final → 0 → count" flash). So the count-up now fires on **data change** (range switch); the
  **chart draw-in** remains the arrival cue. (No clean React API distinguishes hydration from a client
  mount, so skip-on-mount is the robust fix.)
- **Phase-C item (b) — delta width jiggle, FIXED (`count-up.tsx`):** an invisible **ghost** of the
  final value reserves the width; the live value is overlaid (`absolute`). Neighbours (the delta)
  never shift while the number counts. `tabular-nums` kept; final value still exact (settles to ghost).
- **Reduced-motion sweep — every path gated:** count-up (`useReducedMotion` → final value); chart
  draw-in, optimistic dim, skeleton shimmer, live-dot pulse (global reduced-motion guard → instant);
  hover-press scale (`motion-reduce:active:scale-100`); view transitions (gated inside
  `@media (prefers-reduced-motion: no-preference)`). Reduced-motion → full info, zero animation.
- **a11y sweep:** `aria-busy` on the loading skeleton (`role="status"`) + the optimistic dim
  (`aria-busy={isPending}`); skeletons `aria-hidden`; count-up not a live region (no SR spam), ghost
  `aria-hidden`; `focus-visible` rings intact (Phase E); range focus preserved across the
  `scroll:false` soft nav; dimmed content `pointer-events-none` only briefly (controls stay live).
- **Verification:** 83 tests · typecheck · lint · production build green. Overview route **5.26 kB**
  (was 5.21; +~0.05 kB; First Load 119 kB unchanged — no bundle bloat). No new dependency. No browser
  in env → reduced-motion/a11y/60fps reasoned from the gated CSS/JS + green build, not screenshots.
- **What remained unchanged:** Move #1 visuals + all data + queries; other pages; server-first (client
  leaves only); monochrome (accent = Move #3); no layout shift.

**MOVE #2 — `MOVE-2-SPEC.md` §9 success criteria (reconciled):**
1. **Instant** (range <100ms, no white flash, scroll preserved) — ✅ Phase B (`useTransition` + dim +
   `scroll:false`).
2. **Never blank** (skeleton mirrors layout, zero layout shift) — ✅ Phase A (`<OverviewSkeleton>`,
   hero block matches exactly; in-page Suspense scoped to the Overview).
3. **Alive, once** (count-up + draw-in, single, not gimmicky/looping) — ✅ in spirit: the **draw-in
   fires on arrival**; the **count-up fires on data change** (range switch) rather than arrival — a
   deliberate trade to eliminate the hard-load flash (per the Phase-G directive). Single, noticeable,
   non-looping.
4. **Reduced-motion is whole** (identical info instantly, zero motion, nothing broken) — ✅ full sweep.
5. **Nothing regressed** (no new dep, small bundle, server-first, Move #1 visuals + data identical,
   60fps) — ✅ (no-browser caveat on the 60fps/INP measurement; reasoned from cheap CSS/rAF + the
   bundle numbers).
**→ Move #2 core (Phases 0, A–G) is implemented + verified, in review. The ONLY remaining Move #2 item
is `ONE-55` (B2 optimistic section tabs).** Move #3 (accent/identity) stays locked.

**✅ Move #2 / Phase B2 — Optimistic section-tab switching (2026-06-18). — COMPLETES MOVE #2.**
Implemented `ONE-55` (the deferred half of Phase B).

- **New `components/dashboard/tab-nav.tsx`** (client) — extracted the section-tab nav from the shared
  `<ProjectHeader>`. Clicking a tab flips the active underline **immediately** (optimistic `pendingKey`
  state) + shows a subtle pending **dim** (`opacity-70`) while the destination loads. The state clears
  when the destination commits (`useEffect` on the `active` prop — which also covers browser
  back/forward), so the underline always re-syncs with the URL.
- **Native `<Link>` preserved** — prefetch, real `href`s, a11y, middle/⌘-click (guarded so
  modifier-clicks navigate without falsely flipping this page). No `router.push` / `useTransition` /
  `useLinkStatus`; the only client state is `pendingKey`. Added `aria-current="page"` (a11y
  improvement). Transition tuned to `--motion-micro` / `ease-soft`.
- **`project-header.tsx`** stays a **server component**; it now renders `<TabNav projectId active />`
  instead of the inline nav. Its **API + default render are unchanged**, and the **default (non-pending)
  styling is byte-identical** to the old nav (active = `border-foreground text-foreground`) — so the 6
  project pages that share it have **no regression**; the optimism only appears after a click.
- **Reduced-motion-safe:** colour/opacity only; the global guard makes the transition instant; the
  active flip + dim still apply (calm, functional).
- **Verification:** 83 tests · typecheck · lint · production build green. Overview **First Load
  unchanged (119 kB)**; the other 5 project pages each gain the small `<TabNav>` client component (the
  expected cost of an interactive shared header — approved as B2). No new dependency, no client data
  library. No browser in env → the optimistic flip / pending hint reasoned from the `pendingKey` logic
  + green build.
- **What remained unchanged:** every project page's content + data + queries + tab destinations; the
  active underline styling; `focus-visible` (global outline); server-first (TabNav is a tiny client
  leaf); monochrome; the 83-test suite.

**→ MOVE #2 (Feel & Performance) IS FULLY COMPLETE** (Phases 0, A–G + B2). Section-tab switching now
also satisfies §9 criterion 1 ("range **+ section** changes acknowledge in <100ms"). The only related
follow-up spun off along the way is `ONE-46` (MetricCard unification → Move #3). **Next: plan Move #3 —
Identity & Craft (the accent) — still locked until its plan is approved.**

**📐 Move #3 — Identity & Craft: PLANNED (2026-06-18). Awaiting approval — no code yet.** Wrote the two
design docs (planning only): `MOVE-3-SPEC.md` (the single signature **accent** + craft) +
`MOVE-3-IMPLEMENTATION-PLAN.md` (additive, approval-gated phases **0 + A–F**).

- **The accent:** one restrained violet leaning into the ~285 hue already in the neutral tokens,
  applied **sparingly** — primary action, active/selected state, the hero data series, Lede drill-link
  hover — and **nowhere else** (deltas stay semantic green/red; the live dot stays emerald). Exact
  oklch + token names are a **Phase-0** deliverable (tuned + WCAG-AA-verified, dark + light).
- **The craft:** one card/number/chart spec on *every* page — retire the last `MetricCard`/`rounded-lg`
  drift on the Events/Funnels/Revenue detail pages (Phase D folds in the now-canceled `ONE-46`); a
  hand-built SVG **logomark** + favicon/opengraph; flag/glyph polish.
- **Linear:** the `Move #3 — Identity & Craft` project holds 7 phase issues — `ONE-56` Phase 0
  (**Todo**), `ONE-57…62` Phases A–F (Backlog). `ONE-46` **Canceled** (folded into `ONE-60`/Phase D).
- **Move #2 closed out:** `ONE-55` Done; the **Move #2 — Feel & Performance** Linear project
  **Completed** (as is **Move #1**).
- **Hard constraints:** no new dependency (CSS tokens + existing shadcn + hand-built SVG); server-first;
  dark-first + AA; **Moves #1 & #2 behaviour unchanged**; the accent is introduced ONLY in Move #3;
  additive; `main` shippable.
- **Next:** await approval of the spec + plan, then implement **Phase 0 (`ONE-56`) only** (define the
  `--brand` token(s), AA-verify, apply nothing — zero visual change) and stop.

**✅ Move #3 / Phase 0 — Accent token foundations (2026-06-19). Foundations only — applied to NOTHING, so
ZERO visual change** (the Move #1/#2 Phase-0 pattern). Implemented `ONE-56`. CSS-only (`globals.css`).

- **Tokens defined (dark + light) — the signature indigo-violet at hue ~285, leaning into the neutrals:**
  - `--brand` — the accent **fill** (button bg, active indicator, hero series). Dark `oklch(0.56 0.18 285)`
    (#6e5dd8) · light `oklch(0.52 0.2 285)` (#634cd4).
  - `--brand-foreground` — text/icon **on** `--brand`. `oklch(0.985 0 0)` (#fafafa), both themes.
  - `--brand-text` — the lighter **accent-text-on-background** variant. A single fill cannot be AA both as
    white-on-button *and* as text on the dark bg (those pull L in opposite directions), so the spec (§4.2/
    §7) reserved this. Dark `oklch(0.7 0.15 285)` (#968ff7) · light `oklch(0.52 0.2 285)` (== `--brand`;
    the light fill is already AA as text on white).
- **Mapped in `@theme inline`** → `--color-brand` / `--color-brand-foreground` / `--color-brand-text`,
  generating `bg-brand` / `text-brand` / `border-brand` / `ring-brand` / `from-brand` / `fill-brand` /
  `stroke-brand` / … (the full colour-utility set, incl. alpha modifiers like `from-brand/15`).
- **WCAG AA — computed numerically** (no browser available: OKLCH → linear sRGB → relative luminance →
  contrast ratio; the math is recorded inline in `globals.css`), dark + light, **all in sRGB gamut**:
  - dark: white-on-`--brand` (button) **4.76:1** ✓ · `--brand`-on-bg (series/ring/underline, graphical)
    **4.00:1** ✓ · `--brand-text`-on-bg **7.15:1** ✓.
  - light: white-on-`--brand` **5.73:1** ✓ · `--brand`-on-white **5.98:1** ✓ · `--brand-text` **5.98:1** ✓.
- **Tuned the spec's first guess.** `MOVE-3-SPEC.md` §4.2 proposed dark `oklch(0.62 0.19 285)`; that fails
  AA (white-on-brand only **3.70:1** — large-text 3:1 but not button-text 4.5:1), so Phase 0 (whose job is
  exactly "tune the oklch + AA-verify") brought the dark value down to **L=0.56**. The light value passed
  as proposed and was kept.
- **Decisions (resolving the plan's open Phase-0 questions):**
  - **`--ring` stays NEUTRAL and unchanged** (the user's explicit rule + a design call). `ring-brand` is
    *mapped* (the utility was requested) but **unused** — the focus ring is not branded.
  - **No `--brand-muted`** (the issue marks it optional): gradient stops / hover washes use Tailwind's
    alpha modifier (`from-brand/15`, etc.), so a dedicated low-alpha token would be redundant.
  - **Names per spec:** `--brand` / `--brand-foreground` / `--brand-text` — *not* shadcn's neutral
    `--accent` (a muted gray, left untouched).
- **Applied to NOTHING — proven, not asserted:**
  - grep over `apps/web/src/**/*.{tsx,ts,jsx}` for `(bg|text|border|ring|from|…)-brand` → **no matches**.
  - the compiled stylesheet (`.next/static/css/*.css`) contains the raw `--brand*` custom properties for
    both themes (**they resolve**) but **zero** `*-brand` utility classes and **zero** `--color-brand`
    mappings (`@theme inline` emits a utility's CSS only when used) → no rendered byte changes.
  - route `/dashboard/[projectId]` is **6.83 kB — byte-identical with vs without the token block**
    (measured both ways: stash the change → rebuild → 6.83 kB; restore → rebuild → 6.83 kB). *(Aside: the
    route Size had already drifted from the "5.26 kB" last recorded in Move #2 — a pre-existing baseline
    change, unrelated to Phase 0; First Load 119 kB still matches.)*
- **No new tests — correct for this phase.** Phase 0 ships **no JS logic** (only CSS variables), so there
  is nothing the node-only suite can unit-test; the AA "test" is the numeric verification above plus the
  compiled-CSS assertions. The **83-test suite is unchanged and green** (not weakened). *(Contrast: Move #2
  Phase 0 added +8 because it shipped `lib/motion.ts` pure functions — this phase ships none.)*
- **Verification:** 83 tests · typecheck · lint · production build all green. No new dependency;
  server-first; dark-first; monochrome base intact (the accent is **defined, not applied**); deltas stay
  green/red; the live dot stays emerald; the sparkline stays neutral. Files: `globals.css` (only).
- **Next:** **Phase A — Hero data series accent (`ONE-57`)** — the Overview hero `TrendChart` current-
  period **value line** `stroke-foreground → stroke-brand` + the area fill → a `brand → transparent`
  gradient (`from-brand/…`); the **previous-period ghost line stays neutral/muted** (comparison ≠
  protagonist); **the sparkline stays neutral** (standing decision); keep the Move #2 draw-in, the branded
  tooltip, the correct scaling, and `non-scaling-stroke` intact. One component (`trend-chart.tsx`);
  `BarChart` + every other surface untouched. AA-recheck the series visibility on dark + light.

**✅ Move #3 / Phase A — Hero data series accent (2026-06-19). The flagship accent moment — Overview hero
only.** Implemented `ONE-57`. One component (`components/charts/trend-chart.tsx`); `page.tsx` untouched
(no API change).

- **What changed (`trend-chart.tsx`):**
  - The **current-period value line**: `stroke-foreground → stroke-brand`. The Move #2 draw-in
    (`pathLength=1` + `strokeDasharray=1` + `animate-draw-in`) and `non-scaling-stroke` are kept — the dash
    reveal is colour-agnostic, so recolouring the stroke to the accent doesn't affect it.
  - The **area fill**: the flat `fill-foreground/10` → a **`--brand` → transparent** vertical SVG
    `<linearGradient>` (in `<defs>`, stops `var(--brand)` at `stopOpacity 0.25 → 0`, set via inline `style`
    so the CSS var resolves per theme — a plain `stop-color="var(…)"` attribute would NOT resolve). The
    gradient id comes from `useId()` with colons stripped (`trend-area-…`) so `fill="url(#id)"` is valid +
    unique.
- **Stays NEUTRAL (accent = the line + fill only):** the **previous-period ghost line**
  (`stroke-muted-foreground/40`, dashed), gridlines (`stroke-border`), crosshair (`bg-border`), the hover
  **dot** (`bg-foreground`), the branded tooltip, the y-axis labels — and (in `page.tsx`, untouched) the
  hero **number** (`CountUp`, foreground) + the **delta** (semantic green/red).
- **Sparkline: untouched, stays neutral** (the standing decision — restraint). `sparkline.tsx` not opened.
- **Gradient alpha:** chose top `0.25` → `0` (was a flat `0.10` white). Anchored under the line, fading to
  nothing — reads as "the data" without shouting. The fill is decorative (not a contrast surface), so no AA
  requirement applies to it.
- **WCAG AA / visibility (recorded):** the accent **line** is `--brand` on `--background`; from the Phase 0
  computation that pair is **4.00:1 (dark) / 5.98:1 (light)** — both ≥ 3:1 (the graphical-object / non-text
  threshold), so the series is clearly distinguishable in both themes (same `--brand`/`--background` pair
  Phase 0 measured — no colour re-pick).
- **Accent scope proven:** grep for `*-brand` utilities finds the only *applied* one at
  `trend-chart.tsx:141` (`stroke-brand`); the gradient uses `var(--brand)` in the same file. `TrendChart`
  has a **single consumer** (`page.tsx:225`, the Overview hero), so the accent lands on the hero series
  **and nowhere else** — `BarChart` (marketing + event-detail), the sparkline, KPIs, cards, tables, and
  every other page are unaffected.
- **Verification:** 83 tests · typecheck · lint · production build all green. Route
  `/dashboard/[projectId]` **6.83 → 6.95 kB** (+~0.12 kB: the `useId` hook + the `<defs>`/gradient markup;
  First Load 119 → 120 kB). No new dependency; server-first (the chart was already a client leaf);
  additive; dark-first. No browser in env → the dark/light accent render + draw-in are reasoned from valid
  SVG/CSS + the recorded AA numbers + the green build (a deploy-preview visual pass on the hero is
  recommended, especially the gradient on the dark surface).
- **What remained unchanged:** chart scaling / branded tooltip / comparison line / draw-in; the hero number
  + delta; `BarChart` + every other surface; all data + queries + layout; Moves #1 & #2 behaviour; the
  83-test suite (no JS logic added — the change is presentational SVG/CSS; the node-only suite has no jsdom).
- **Next:** **Phase B — Active / selected states (`ONE-58`)** — the active section-tab underline (`TabNav`:
  `border-foreground → border-brand`, optionally `text-brand`), the active segmented-control segment
  (`AudienceCard`), and the active range state adopt the accent (one active indicator per control). **Keep
  the Move #2 optimistic behaviour** (`pendingKey`, transitions) — only the *active colour* changes.
  `TabNav` is shared by all 6 project pages → re-verify all six. Deltas / live-dot / sparkline / `--ring`
  stay neutral.

**✅ Move #3 / Phase B — Active / selected states (2026-06-19). The accent marks "the current thing."**
Implemented `ONE-58`. Two components (`tab-nav.tsx`, `audience-card.tsx`); `overview-shell.tsx` untouched.

- **Provenance note (important):** the Phase B edits were found **already in the working tree, uncommitted**
  — a prior run had moved `ONE-58` to In Progress and edited the two files but never committed or finished
  the bookkeeping (the session's tree was dirty from the start). The diff was reviewed (minimal, exactly
  in-spec, written in-house style), fully verified, and **adopted** as the Phase B commit (rather than
  reverting and rewriting identical code). The user approved the adopt-and-commit path. Tree clean after.
- **`tab-nav.tsx` — active section-tab underline:** `border-foreground → border-brand` on the active tab.
  The **label stays `text-foreground`** (deliberate: `text-brand` is 4.00:1 on `--background` → fails AA
  4.5 for 14px text; two accent signals on one control would overdo it → one active indicator = the
  underline). Default / hover / focus-visible / pending styling unchanged.
- **`audience-card.tsx` — selected segment:** `bg-background text-foreground → bg-brand text-brand-foreground`
  (a filled accent pill). Non-selected segments, the press scale, hover bg, and the focus-visible ring are
  unchanged.
- **Range control left NEUTRAL (`overview-shell.tsx` untouched):** it's a native `<select>` — a single
  selected `<option>` can't be branded reliably across browsers, and the Overview has no range *pill* to
  mark. Leaving it neutral honours "one active indicator per control" without a fragile hack. (The spec's
  "active range pill" doesn't map onto this native select.)
- **Move #2 behaviour intact:** the `TabNav` optimistic `pendingKey` flip + pending dim + native `<Link>`
  (prefetch, modifier-click guard, `aria-current`) and the `AudienceCard` client toggle are unchanged —
  **only the active colour changed.**
- **Shared `TabNav` → all 6 project pages:** Overview / Events / Funnels / Revenue / Reports / Settings all
  render the same `<TabNav>`, so every page's active-tab underline is now the accent. The change is a single
  class swap on the active branch → the non-active render is byte-identical → no per-page regression
  (uniform by construction; no browser here to screenshot all six — reasoned from the shared component +
  green build).
- **WCAG AA (recorded):** tab underline `border-brand` (a 2px graphical object) on `--background` =
  **4.00:1 dark / 5.98:1 light** (≥3:1 graphical ✓); the segment pill text `text-brand-foreground` on
  `bg-brand` = **4.76:1 dark / 5.73:1 light** (≥4.5 text ✓). Values from the Phase 0 token computation — no
  re-pick.
- **Accent footprint (grep):** applied `*-brand` utilities = `trend-chart.tsx` (Phase A line + gradient) +
  `tab-nav.tsx` (`border-brand`) + `audience-card.tsx` (`bg-brand text-brand-foreground`). Exactly the
  sanctioned zones — no creep; `BarChart`, the sparkline, deltas, the live dot, and `--ring` stay neutral.
- **Verification:** 83 tests · typecheck · lint · production build green. Route `/dashboard/[projectId]`
  **6.95 → 6.96 kB** (+~0.01 kB — class swaps only). No new dependency; server-first; additive; dark-first.
- **What remained unchanged:** every page's nav behaviour + destinations; the optimistic switching + pending
  hint; non-active / hover / focus styling; the range control; all data / queries / layout; Moves #1 & #2;
  the 83-test suite (no JS logic added — presentational class swaps; node-only suite, no jsdom).
- **Next:** **Phase C — Primary action + Lede link hover (`ONE-59`)** — the shadcn `Button` `default`
  variant → accent (`bg-brand text-brand-foreground hover:bg-brand/90`); secondary/outline/ghost/link
  neutral; destructive stays red. The Lede drill-links tint to `--brand-text` **on hover/focus only** (rest
  = foreground). **Audit every `Button` call site** so only primary CTAs change. **`--ring` stays NEUTRAL**
  (standing decision — do NOT brand the focus ring, despite the ONE-59 title's "+ focus ring").

**✅ Move #3 / Phase C — Primary action + Lede link hover (2026-06-19). The accent marks the one primary
action + the data-noun links on hover.** Implemented `ONE-59`. Two files (`button.tsx`, `lede.tsx`);
`--ring` deliberately left neutral.

- **`button.tsx` — the shadcn `Button` `default` variant → accent:** `bg-primary text-primary-foreground
  hover:bg-primary/90` → `bg-brand text-brand-foreground hover:bg-brand/90`. **Only the `default` variant
  changed** — `destructive` (stays red), `outline`, `secondary`, `ghost`, and `link` are byte-identical.
- **Button call-site audit (the Medium risk — Button is shared app-wide):** grepped every `<Button>` /
  `buttonVariants` usage. **Every `default`-variant call site is a genuine single primary CTA per screen** —
  the marketing hero + closing CTAs (`(marketing)/page.tsx`), the pricing CTA, the signup/login submit, the
  upgrade button, and the dashboard form submits (`add-subscription`, `connect-paypal`, `create-funnel`,
  `create-project`). Every **secondary** action already uses `variant="outline"` (sign-out, cancel, copy
  snippet, add/remove funnel step, refresh, manage-billing, marketing's secondary CTA). **→ zero demotions
  needed**; flipping the default variant brands exactly the primary actions and nothing else (the plan's
  hoped-for outcome). `buttonVariants` is imported only by `button.tsx` itself → no external
  `buttonVariants({variant:"default"})` to recolour unexpectedly.
- **`lede.tsx` — drill-links tint on hover/focus only:** added `hover:text-brand-text
  focus-visible:text-brand-text` (kept `hover:underline`). **At rest the link stays `text-foreground`**
  (Move #1): the `hover:`/`focus-visible:` pseudo-class rules out-specify the base `text-foreground`, and
  tailwind-merge keeps both (different variant scopes → no conflict). Used **`--brand-text`** (the lighter
  text-on-bg token), NOT `--brand`: `--brand` is only 4.00:1 on `--background` (fails AA 4.5 for text);
  `--brand-text` is **7.15:1 dark / 5.98:1 light** (≥4.5 ✓). `focus-visible` (not `focus`) so a mouse click
  doesn't tint. The only Lede drill-links today are the funnel/revenue clauses (they light up when those
  targets exist); the change is harmless until then and correct when they appear.
- **`--ring` left NEUTRAL — the standing decision honoured (despite the ONE-59 title's "+ focus ring").**
  Phase 0 explicitly chose not to brand the ring; branding it would recolour the focus ring on **every**
  focusable element app-wide (the largest possible blast radius — the opposite of "one surface, restrained").
  Focus stays `focus-visible:ring-ring/50` everywhere. Recorded so Phase F doesn't "fix" it.
- **WCAG AA (recorded):** primary-button label `text-brand-foreground` on `bg-brand` = **4.76:1 dark /
  5.73:1 light** (≥4.5 ✓); Lede link hover `--brand-text` on `--background` = **7.15:1 dark / 5.98:1 light**
  (≥4.5 ✓). **Never colour-only:** the primary button is also the filled/largest control; the Lede link also
  has `hover:underline`. Values from the Phase 0 token computation — no re-pick.
- **Accent footprint (grep `*-brand`):** `trend-chart.tsx` (A: line + gradient) + `tab-nav.tsx` (B:
  `border-brand`) + `audience-card.tsx` (B: `bg-brand`) + **`button.tsx` (C: primary action) + `lede.tsx`
  (C: hover/focus link)** — exactly the four sanctioned zones (data / active / action / links). No creep;
  deltas stay green/red, the live dot emerald, the sparkline and `--ring` neutral.
- **Verification:** 83 tests · typecheck · lint · production build green. Route `/dashboard/[projectId]`
  **6.96 → 6.95 kB** (rounding noise — CSS class swaps, zero new JS; the Button is shared so the recolour is
  global yet weightless). No new dependency; server-first; additive; dark-first. No browser in env → the
  dark/light visual is reasoned from the AA numbers + valid Tailwind classes + the green build.
- **What remained unchanged:** non-primary buttons (outline/secondary/ghost/link) + the destructive variant;
  the Lede at rest; every link destination; focus-visible behaviour (`--ring` neutral); all data / queries /
  layout; Moves #1 & #2; the 83-test suite (presentational class swaps — no JS logic; node-only suite).
- **Next:** **Phase D — Card/number/chart spec unification (`ONE-60`, folds in `ONE-46`)** — unify the
  legacy `MetricCard` (`rounded-lg`) onto the `StatCard`/`rounded-xl` + `tabular-nums` spec across the 3
  detail pages (Events-detail / Funnels-detail / Revenue), then retire/alias it; resolve the `BarChart`
  chart-language drift. Pure craft (no accent). **Await approval before starting.**

**✅ Move #3 / Phase D — Card/number/chart spec unification (2026-06-19). The last `MetricCard`/`rounded-lg`
drift is retired — one card spec, one number spec on every page.** Implemented `ONE-60` (folds in/closes
`ONE-46`). Pure craft, **no accent, no data/query change** — restyle only, numbers byte-identical.

- **`metric-card.tsx` — unified onto the `StatCard` card spec:** `rounded-lg → rounded-xl`, the value gains
  `tabular-nums`, the label `text-sm → text-xs` (matching `StatCard`). The card chrome
  (`bg-card rounded-xl border p-4`, `text-xs` muted label, `text-2xl font-semibold tracking-tight
  tabular-nums` value) is now **identical** to `StatCard`'s non-delta/spark form. **Restyle-in-place** (the
  plan's "simplest, one file" option), NOT delete: `MetricCard` has 5 live usages across the 3 detail pages
  and an optional `hint` line that `StatCard` doesn't have — so it stays as the "label·value·hint" card
  (`StatCard` = the "KPI with delta/sparkline/live" card; **same card chrome, two content shapes**). The
  drift is retired without churning 3 pages. `ONE-46` is closed (it was already Canceled → folded here).
- **`tabular-nums` swept across the 3 detail pages (one number spec):** the `MetricCard` values (all 3
  pages) + the `FunnelChart` "↓ N dropped" line (its sibling count·conversion was already tabular) + the
  Revenue **Recent payments** Date column + the Events-detail **Recent occurrences** Time column + the
  Events-detail BarChart min/max date labels. Already-tabular before (unchanged): `BreakdownCard` values,
  `FunnelChart` count·conversion, the Revenue Amount column. **Every number on the 3 pages is now tabular.**
- **`BarChart` chart-language drift — decided + documented, rewrite deferred to `ONE-45`.** Finding: the
  `BarChart` component's **only consumer is the Events-detail trend** — the marketing page imports the
  **lucide `BarChart3` icon**, not this component (the old "marketing + event-detail" note was wrong; fixed
  in `DESIGN-SYSTEM.md`). The chart language is **`TrendChart`** (correct, undistorted scaling); `BarChart`'s
  `preserveAspectRatio="none"` distortion is the last chart drift. Its rewrite/migration is its **own
  single-concern change** (`ONE-45`, already a distinct Move #3 issue) — bundling a chart rewrite into this
  card/number PR would violate "one phase = one reviewable concern," and it's **not** in this DoD. So Phase D
  documents the decision and leaves the `BarChart` SVG untouched.
- **DoD met (grep):** `rounded-lg` → **zero matches anywhere** in `src/**`; `MetricCard` is now `rounded-xl`
  + `tabular-nums` (no drift). The 3 detail pages match the canonical spec. **Numbers identical** (only CSS
  classes added; `formatNumber`/`formatMoney`/`formatPercent` outputs unchanged).
- **Docs:** `DESIGN-SYSTEM.md` updated — the Border-radius + Card-system sections now say "one card system,
  fully resolved (Phase D)"; the Chart-philosophy section corrects the `BarChart` consumer + records the
  `ONE-45` deferral.
- **Verification:** 83 tests · typecheck · lint · production build green. Detail-page routes **unchanged**
  (events/[name] 1.04 kB · funnels/[funnelId] 1.4 kB · revenue 3.39 kB — CSS-only, server-rendered, zero new
  JS). No new dependency; server-first; additive; monochrome (no accent in this phase). No browser in env →
  the restyle is reasoned from the class diffs (identical chrome to the verified `StatCard`) + green build.
- **What remained unchanged:** all data + every query (no schema/query change); the analytics numbers
  (identical values, restyled only); the Overview (already unified); the `BarChart` SVG (→ `ONE-45`);
  `BreakdownCard` + its Revenue usage; Moves #1 & #2; the 83-test suite.
- **Next:** **Phase E — Logomark + favicon / identity marks (`ONE-61`)** — a hand-built SVG logomark in
  `--brand` + neutrals for the app/marketing header, derive the favicon + refresh `opengraph-image`. Then
  **Phase F** (`ONE-62`) — coherence/contrast/a11y, completes Move #3. **Await approval before starting.**

**✅ Move #3 / Phase E — Logomark + favicon / identity marks (2026-06-19). The product has a quiet face.**
Implemented `ONE-61`. Additive, **no new dependency** (hand-built SVG), no layout/behaviour change.

- **The mark (concept):** three ascending rounded bars — the tallest is the signature `--brand` accent
  ("the *one* metric that matters"), the other two stay monochrome `foreground`. Geometric, no text,
  recognizable at 16px; ties to the product name + the Move #3 "one signature" thesis. One geometry drives
  all three surfaces (header, favicon, OG) → consistent identity.
- **`components/brand/logomark.tsx` (new):** server-safe React SVG, `viewBox 0 0 32 32`, bars at x=5/13/21
  (w=6, heights 9/14/20, baseline y=26, rx=2). Neutral bars `fill-foreground`, accent bar `fill-brand`
  (theme-adaptive via tokens → flips correctly dark/light). `aria-hidden` + `focusable="false"` (it's
  paired with the "OneMetric" wordmark, which carries the accessible name). Accepts `className` for sizing.
- **Headers (lockup):** `(marketing)/layout.tsx` + `dashboard/layout.tsx` brand link → `<Logomark
  className="size-5" />` **beside** the existing "OneMetric" wordmark (the link became `flex items-center
  gap-2`). Wordmark stays (degrade-to-wordmark honoured); nav, hrefs, structure unchanged. No sidebar
  exists — headers are the only brand lockup spots; auth pages have no lockup.
- **Favicon `app/icon.svg` (new, static):** the same mark on a **dark rounded tile** (`#0a0a0a`, rx=7) with
  white bars + the accent bar (`#6e5dd8`, the dark-mode `--brand` hex; standalone SVG can't read CSS vars).
  The tile makes it **self-contained → legible on any tab, dark or light** (solves the tab-bg problem
  without a fragile `prefers-color-scheme` swap). Next picks it up → `/icon.svg` static route + the
  `<link rel="icon" type="image/svg+xml">`. **Legacy `favicon.ico` kept** (additive/preserve-routes) as the
  old-browser fallback; modern browsers prefer the SVG mark. (A raster `apple-icon`/regenerated `.ico` would
  need a raster tool = a dependency → out of scope; optional follow-up.)
- **Open Graph `opengraph-image.tsx`:** the mark **prepended** above the existing eyebrow — three bars as
  Satori `<div>`s (`alignItems:flex-end`, widths 18, heights 27/42/60 — the 9:14:20 mark ratio ×3; neutrals
  `#fafafa`, accent `#6e5dd8`). Satori-safe (divs, not SVG). The eyebrow/headline/sub **typography + text
  unchanged**; the mark just sits above them on the same dark canvas.
- **Accent rules intact (no creep):** grep `*-brand` adds exactly one new applied utility — `logomark.tsx`
  `fill-brand` (the mark's accent bar). The mark using the accent is **identity** (`MOVE-3-SPEC.md` §5.4),
  the sanctioned use — not creep. A/B/C zones unchanged; deltas green/red, live dot emerald, sparkline +
  `--ring` neutral.
- **Verification:** 83 tests · typecheck · lint · production build green. `/icon.svg` now a static route
  (**18 pages, was 17**); `/opengraph-image` still renders; **app route sizes unchanged** (the logomark is
  a zero-JS server SVG; headers gained inline SVG only). No new dependency; server-first; additive;
  dark-first. The dark/light + 16px legibility was also confirmed by a rendered preview of the exact
  geometry (favicon at 64/32/16px + the header lockup on dark and light) shown to the user.
- **What remained unchanged:** all navigation/links/destinations; both layouts' structure; the OG text +
  typography; the metadata (`layout.tsx` icons inferred from `icon.svg`/`favicon.ico`, no manual change);
  Moves #1 & #2; the 83-test suite (no new pure logic — SVG markup; a render test would need jsdom =
  forbidden dependency, same call as Phases A–C).
- **Next:** **Phase F — Coherence, contrast & a11y pass (`ONE-62`)** — the final Move #3 pass: grep the
  accent appears only in sanctioned zones (no creep), full WCAG-AA audit dark + light, reconcile the
  `MOVE-3-SPEC.md` §8 success criteria, update `DESIGN-SYSTEM.md` (accent shipped) + the `DESIGN-AUDIT.md`
  scorecard. **Await approval before starting. Completes Move #3.**

**✅ Move #3 / Phase F — Coherence, contrast & a11y pass (2026-06-19). The final pass — completes the Move #3
build.** Implemented `ONE-62`. **Docs-only: the audit found no defect, so ZERO code changed** (the phase's
"prefer zero code changes" path). The `.md` source-of-truth files were reconciled; no `apps/web` source was
touched.

- **Accent footprint (grep every applied `*-brand` utility):** exactly six call sites, one per sanctioned
  zone — `trend-chart.tsx` (A: hero line + gradient), `tab-nav.tsx` `border-brand` (B: active tab),
  `audience-card.tsx` `bg-brand text-brand-foreground` (B: selected segment), `button.tsx` (C: primary
  action), `lede.tsx` `hover:text-brand-text` (C: link hover), `logomark.tsx` `fill-brand` (E: identity).
  **No creep** — nothing on body text, headings, the hero number, cards, table rows, or other charts.
- **One system everywhere:** `rounded-lg` → **zero matches** in `src/**`. Every **data metric** is
  `tabular-nums` — verified at every `formatNumber/Money/Percent` site: hero "vs N last period"
  (`page.tsx:221`), engagement line (`:289`), KPIs/`StatCard`, `MetricCard`, `BreakdownCard`, `FunnelChart`,
  the Revenue + Events tables, the Lede, and billing usage. (The only non-tabular `formatNumber` uses are
  marketing/pricing/billing **prose** — "50,000 events/month" in a sentence — correctly not treated as
  metrics.) One chart language = `TrendChart`; the legacy `BarChart` (`preserveAspectRatio="none"`) is the
  lone drift, single consumer (Events-detail), tracked in **`ONE-45`** — deliberately out of Move #3.
- **WCAG-AA contrast (computed sRGB→luminance, dark / light), every accent surface:**
  | Surface | Pair | Dark | Light | Min | Pass |
  |---|---|---|---|---|---|
  | Primary button text | `--brand-foreground` on `--brand` | 4.76 | 5.73 | 4.5 | ✅ |
  | Lede-link hover | `--brand-text` on `--background` | 7.15 | 5.98 | 4.5 | ✅ |
  | Active tab underline (2px) | `--brand` on `--background` | 4.00 | 5.98 | 3.0 | ✅ |
  | Selected segment text | `--brand-foreground` on `--brand` | 4.76 | 5.73 | 4.5 | ✅ |
  | Hero chart series (line) | `--brand` on `--background` | 4.00 | 5.98 | 3.0 | ✅ |
  | Logomark accent bar | `--brand` on bg / on dark tile | 4.00 | 5.98 | 3.0 | ✅ |
  (Values from the Phase 0 token computation — no re-pick.) **Accent never the sole signal:** primary button
  = filled + largest; active tab = underline shape + `aria-current`; segment = filled pill; Lede link =
  `hover:underline`; hero series = the only solid line (ghost prev is dashed/muted); logomark accent = the
  tallest bar. Colour-blind users lose nothing.
- **Non-accent invariants reconfirmed:** `--ring` neutral (not remapped; `--color-ring: var(--ring)`);
  deltas `text-emerald-500`/red (`delta.tsx`); live dot `bg-emerald-500` (page / `stat-card` / settings);
  sparkline neutral (`stroke-foreground`). Brand tokens present in `globals.css` (dark + light) + mapped in
  `@theme inline`.
- **`MOVE-3-SPEC.md` §8 — all 5 criteria ✅** (legible signature · one system · it has a face · accessible ·
  nothing regressed); each ticked in the spec with how it's met.
- **Docs reconciled (the only files changed this phase):** `MOVE-3-SPEC.md` §8 (criteria ticked + AA table),
  `DESIGN-AUDIT.md` (status banner under the scorecard: Moves #1–3 shipped, #9 Color → done; the "three
  moves" list marked ✅), `DESIGN-SYSTEM.md` (Colors: accent shipped; the two "Future Move #2/#3" sections
  retired → "shipped"), `TODO.md`, `HANDOFF.md`, `SESSION-HANDOFF.md`.
- **Verification:** 83 tests · typecheck · lint · production build green (re-run for the record; **no code
  changed** → identical to the Phase E green build). No new dependency; server-first; additive; dark-first.
- **What remained unchanged:** literally all `apps/web` source (docs-only phase); all data/queries; Moves
  #1/#2/#3 behaviour; the 83-test suite.
- **MOVE #3 COMPLETE & APPROVED** (Phases 0, A–F). The accent + craft read as one designed system.
  **Approved 2026-06-19 (close-out session):** `ONE-62` marked **Done**, the "Move #3 — Identity & Craft"
  Linear project marked **Completed**, and the umbrella `ONE-44` closed (`ONE-46` was folded into D earlier). **Nothing pushed** — every Move #1/#2/#3 commit is local
  on `main`; pushing (→ a Vercel prod deploy) is its own approved step (`ONE-24`).

**✅ ONE-45 — Retire the legacy distorting BarChart (2026-06-19). One chart language everywhere.** A
post-Move-3 design-debt follow-up (not a Move phase). Additive; committed locally → In Review.

- **Problem:** the legacy `BarChart` (`components/charts/bar-chart.tsx`) used `preserveAspectRatio="none"`
  on a 720×180 viewBox stretched to `h-44 w-full` → bars distorted at every container width, with only a
  native SVG `<title>` tooltip. It was the last chart not on the crafted `TrendChart` language.
- **Single consumer confirmed (grep):** only the **events-detail trend** (`events/[name]/page.tsx`) used the
  `<BarChart>` component; the marketing page's `BarChart3` is the **lucide icon**, not this component.
- **Fix — migrate to the crafted `TrendChart`, in NEUTRAL:** `TrendChart` gained an additive **`accent?:
  boolean` prop, default `true`** (the Overview hero is byte-identical → provably untouched). The
  events-detail trend renders `<TrendChart accent={false} …>` — the same crafted chart (correct viewBox +
  `vector-effect="non-scaling-stroke"`, HTML-overlay date·value tooltip, gridlines, draw-in) but in
  **neutral monochrome** (`stroke-foreground` + a `--foreground`→transparent area gradient). Keeps the
  signature accent the **hero's alone** (MOVE-3-SPEC §4.4 — "not on every chart"); grep `*-brand` confirms
  no new accent surface (events-detail renders neutral).
- **Data + layout preserved:** same `detail.trend` mapped to `{label,value}` (no `prev` → no ghost line);
  the "Trend" card, the min/max date labels, and the chart footprint (`heightClassName="h-44"`) are
  unchanged — only bars → crafted line/area. **`bar-chart.tsx` deleted** (zero remaining importers).
- **Trade-off:** events-detail becomes a client route (TrendChart is `"use client"`) → First Load
  **1.04 → 2.67 kB** (+~1.6 kB; bundle stays small) — the interactive HTML tooltip vs the old static one.
  The Overview hero is 6.95 → 6.98 kB (+0.03 for the added conditional; render identical, `accent` default).
- **Verified:** 83 tests · typecheck · lint · production build green. No new dependency (reuses
  `TrendChart`); server-first (the RSC embeds a client chart, as the Overview does); additive; dark-first.
- **Result: one chart language across the whole product** — `TrendChart` (hero = accent, elsewhere =
  neutral) + `Sparkline`; the distorting `BarChart` is gone. Files: `trend-chart.tsx` (additive prop),
  `events/[name]/page.tsx` (swap), `bar-chart.tsx` (deleted). **On approval:** `ONE-45` → Done; then the
  only remaining backlog item is `ONE-24` (push + deploy).

**✅ ONE-24 — Push accumulated commits + production deploy (2026-06-19). Repository == GitHub; live in prod.**
The session's local backlog is now shipped. Explicitly authorized push (ONE-24 is the one task where pushing
is sanctioned).

- **Pushed:** `git push -u origin main` → `232861c..449757a main -> main` (exit 0). **36 commits** (all of
  Move #1, #2, #3 + ONE-45 + the close-out docs) went from local-only to `origin/main`; upstream tracking
  now set. **origin/main == local main == `449757a`; zero unpushed; tree clean.**
- **Production deploy READY:** the push auto-triggered Vercel → `dpl_AeT56nQ8LDZJtkTw1tFbUdxBVAC1`, target
  **production**, **state READY**, `githubCommitSha 449757a`, repo visibility public (no BLOCK; author
  `himranelyess@gmail.com` matches GitHub → no author-block). Production now serves Moves #1/#2/#3 + ONE-45
  (prior prod was `232861c`). Inspector:
  https://vercel.com/one-metric-s-projects/onemetric-web/AeT56nQ8LDZJtkTw1tFbUdxBVAC1
- **No code changed** (push only — no rebase/squash/history rewrite). After the push, this docs-sync entry +
  the TODO/SESSION updates were committed and pushed too, so the repo stays in sync (a root-docs commit
  doesn't trigger a Vercel build — expected/fine).
- **State:** all three Moves Completed & approved; `ONE-45` + `ONE-24` Done; the design line is fully
  shipped and synchronized (Repository == Linear == GitHub == production). Remaining workspace backlog is
  separate, pre-existing product work (marketing / onboarding / Paddle go-live).

**✅ ONE-63 — Project deletion (Settings → Danger Zone, type-to-confirm) (2026-06-19). First post-Move
feature; committed locally → In Review.** A safe permanent project delete following the GitHub/Vercel/Stripe
"Danger Zone + type the name" convention. No new dependency; server-first; dark-first; Moves #1/#2/#3 untouched.

- **Settings page** (`dashboard/[projectId]/settings/page.tsx`): a new "Danger Zone" `Card`
  (`border-destructive/40`, `rounded-xl`) — title "Danger Zone", the required description, and a destructive
  **Delete project** button (server-rendered chrome; only the interactive bit is a client child).
- **`components/ui/dialog.tsx` (new):** a shadcn-style Dialog built on the already-installed `radix-ui`
  umbrella (`import { Dialog as DialogPrimitive } from "radix-ui"`) — **no new dependency**. `bg-card`,
  `rounded-xl`, quiet overlay, reduced-motion-safe (the Move #2 global guard zeroes the enter/leave anims).
- **`components/dashboard/delete-project-dialog.tsx` (new, client):** the destructive trigger + confirm
  dialog. Body = the required "This action cannot be undone…" copy. A controlled `Input` requires typing the
  **exact project name**; the Delete button is `disabled={confirm !== projectName}` (the safety gate).
  Submits to the server action; Cancel via `DialogClose`; resets the input on close.
- **`deleteProject` server action** (`server/actions/projects.ts`): `requireUser` → owner-scoped
  `getOwnedProject` (tenancy) → **server-side exact-name re-check** (defense in depth; mismatch → redirect
  back, no delete) → `prisma.project.delete` (one statement; FK cascades remove every dependent row) →
  `revalidatePath("/dashboard")` → `redirect("/dashboard?deleted=<name>")`.
- **Cascade / no orphans — verified on the LIVE DB (read-only):** queried `pg_constraint` — every
  Project-child FK is ON DELETE CASCADE (Session/Event/Funnel/Integration/RevenueEvent/ReportSubscription),
  plus FunnelStep→Funnel and Event→Session. RevenueEvent→Session is SET NULL, but RevenueEvent→Project is
  CASCADE, so a project delete still removes it. Read-only — DataFast data untouched.
- **After delete:** the action's `redirect` is a soft RSC navigation → `/dashboard` re-renders with the
  revalidated list (deleted project gone) **without a manual refresh**; a calm neutral **toast**
  (`deleted-toast.tsx`: `?deleted=<name>` flash, emerald check, auto-dismiss, `history.replaceState` cleans
  the URL) confirms it. Destructive colour stays on the delete action only; the toast is neutral.
- **Verified:** 83 tests · typecheck · lint · production build green. `/dashboard` 3.52 → 4.22 kB (+toast);
  `/dashboard/[projectId]/settings` First Load 116 → 129 kB (+~13 kB for the Dialog primitive, settings-route
  only). No new dependency; server-first; type-safe; dark-first. No browser here → the dialog/toast visuals
  are reasoned from the shadcn-on-radix markup + the green build.
- **What remained unchanged:** all analytics behaviour + queries; Moves #1/#2/#3; the accent footprint (the
  new components use destructive + neutral tokens, **not** `*-brand` — grep-confirmed, no creep); the route
  structure (Settings already existed). **On approval:** `ONE-63` → Done. **Not pushed.**

**✅ ONE-64 — Rename project (Settings → General) (2026-06-19). Committed locally → In Review.** Lets the
owner rename a project from Settings; `Project.name` only — no schema/migration, no new project, analytics
untouched. The GitHub/Vercel settings convention (a "General" rename section above the "Danger Zone").

- **Settings page:** a new "General" `Card` (`rounded-xl bg-card border` — the default Card) placed
  **directly above** the Danger Zone; renders `<RenameProjectForm projectId projectName />`. The other
  settings cards (Install / Verification / Custom events) + the Danger Zone are unchanged.
- **`components/dashboard/rename-project-form.tsx` (new, client):** a controlled name `Input` (pre-filled,
  `maxLength=60`) + a **default (primary) Button** "Save changes". `disabled = pending || trimmed === "" ||
  trimmed === savedName` (the unchanged/empty/loading rules); shows "Saving…" while pending. On success it
  updates the local baseline (so the button re-disables) + shows a **calm neutral toast** (emerald check,
  auto-dismiss); errors render inline (`text-destructive`). Calls the action via `useTransition` — no
  navigation, no refresh.
- **`renameProject(projectId, newName)` server action** (`server/actions/projects.ts`): `requireUser` →
  owner-scoped `getOwnedProject` (tenancy) → trim + validate (1–60, non-empty) returning a **friendly error
  string** (not a throw) → `prisma.project.update({ data: { name } })` → `revalidatePath` `/dashboard` + the
  project + settings routes → `{ ok: true }`. No-op when unchanged. Reuses the imports ONE-63 added
  (`revalidatePath`, `getOwnedProject`) — no new imports/deps.
- **No accent creep:** grep `*-brand` on the new form = none; the default Button is the sanctioned
  primary-action accent (Phase C — one primary CTA per screen). Error text uses the destructive/error
  semantic (standard form validation); the toast is neutral.
- **Verified:** 83 tests · typecheck · lint · build green. `/dashboard/[projectId]/settings` 4.22 → 4.73 kB
  (+0.5 kB for the rename form; First Load 129 kB unchanged — the Dialog primitive was already there). No new
  dependency; server-first; type-safe; dark-first.
- **What remained unchanged:** the ONE-63 delete flow + dialog/toast; analytics + every query; routes +
  dashboard layout; Moves #1/#2/#3. **On approval:** `ONE-64` → Done. **Not pushed.**

**✅ ONE-65 — First-event onboarding & empty states (2026-06-19). Committed locally → In Review.** Turned
empty dashboards into guided onboarding across six surfaces. Instruction over emptiness; no fake/demo data;
server-first; no new dependency; dark-first; additive; Moves #1/#2/#3 + the delete/rename flows untouched.

- **`components/dashboard/empty-state.tsx` (new, server):** one neutral `rounded-xl bg-card border` empty
  card — optional icon, title, description, optional action. Used by Funnels / Revenue / Project list.
- **`components/dashboard/first-event-onboarding.tsx` (new, client):** the Overview empty state — "No events
  yet" + the install description + the tracking snippet with a "Copy snippet" button → **"Snippet copied"
  toast**, then a 3-step plan (add snippet → visit site → return) in `rounded-xl` cards. Replaces the Move #1
  "waiting for your first pageview" pulse panel (neutral now). Overview `page.tsx` renders it when
  `metrics.sessions === 0`.
- **`trend-chart.tsx`:** when `data` is empty/all-zero, an early return renders an icon + "Your traffic will
  appear here" at the **same height** (no layout jump) instead of an empty chart. Hooks run before the
  branch (no conditional-hook issue); the populated render is byte-identical, so the Move #1 hero (gated by
  `hasData`) and the event-detail trend (always has occurrences) never hit it — a safety net.
- **Funnels list:** "No funnels created" + "Create your first funnel…" + a Create-funnel CTA (anchors to the
  on-page builder, `id="new-funnel"`). **Project list:** "Create your first project" + CTA (`id="new-project"`).
  **Revenue:** when connected with `summary.count === 0`, an `EmptyState` ("No revenue events yet" + …)
  replaces the zero metric cards / empty breakdowns / empty recent table (no fake numbers); the webhook +
  disconnect card stays. **Events list:** title → "No events recorded" + "Custom events will appear here
  automatically." (kept the `CustomEventsDoc` below — instruction).
- **Design:** neutral; no destructive colours; no new accent zone (the primary CTAs use the default Button
  *styling* via `buttonVariants` on a link); no illustrations/images; simple typography.
- **Verified:** 83 tests · typecheck · lint · build green (18 routes). **Bundle note (investigated):**
  `/dashboard` + `/funnels` First Load rose **117 → 189 kB**. Isolated via `git stash` + a control: the cause
  is importing `buttonVariants` from `ui/button` into these **server** pages — `button.tsx` imports the
  `radix-ui` umbrella, which pulls a ~72 kB chunk into any server page that imports it (the same cost the
  marketing pages, `/revenue`, `/reports`, `/funnels-detail` already pay at 179–189; it's cheap when Button
  is reached via a client component, which is why the rich Overview stays 121 kB). **No new dependency.** A
  future app-wide optimization (out of scope here) is to import `Slot` from `@radix-ui/react-slot` directly
  in `button.tsx` so server pages stop pulling the umbrella. Kept the spec'd default-Button CTA + documented
  the trade-off rather than dropping it. **On approval:** `ONE-65` → Done. **Not pushed.**

**✅ ONE-66 — Onboarding checklist (activation) (2026-06-19). Committed locally → In Review.** A "Getting
started" checklist on the Overview that shows activation progress and disappears once complete. Additive; no
new dependency; server-first; dark-first; Moves #1/#2/#3 + the delete/rename/empty-state flows untouched.

- **`components/dashboard/onboarding-checklist.tsx` (new, client):** a `rounded-xl bg-card` card — title
  "Getting started", subtitle, an "N / 5 completed" progress, and 5 rows. Completed = green `Check` (emerald,
  the existing success semantic); pending = neutral `Circle`; the **current** (first pending) row is
  emphasized (`bg-muted/50` + `font-medium`). CTAs use the default Button styling: step 2 "Copy snippet"
  (outline) → **"Snippet copied"** toast; step 4 "Create funnel" + step 5 "View revenue docs" (default,
  shown only while pending) link to those tabs. Returns `null` when all five are done (also guarded
  server-side).
- **Step conditions — real data only (no new queries):** 1 create project = always ✓; 2 install tracking
  script = the tracking key (always exists) ✓; 3 first pageview = `metrics.sessions > 0`; 4 funnel =
  `primaryFunnel !== null`; 5 revenue = `revenueSummary.count > 0`. All already fetched by the Overview.
- **`dashboard/[projectId]/page.tsx`:** computes `hasFunnel` / `hasRevenue` / `fullyActivated` (steps 1–3 are
  done once there's data, so `fullyActivated = hasFunnel && hasRevenue`) and renders the checklist **above
  the KPI strip** in the `hasData` branch when `!fullyActivated`. The `sessions === 0` branch still shows the
  ONE-65 `FirstEventOnboarding` (empty state unchanged) — the two onboarding stages don't overlap.
- **Updates without refresh:** the Overview is dynamic, so navigating back after creating a funnel / getting
  revenue re-renders with fresh data → the checklist advances / hides. No client polling, no fake progress.
- **Bundle:** it's a **client** component, so Button is reached via the client boundary (cheap) — Overview
  First Load **121 → 122 kB** (no `radix-ui` umbrella server-page hit like the ONE-65 list CTAs).
- **Verified:** 83 tests · typecheck · lint · build green; grep `*-brand` on the new file = none (no accent
  creep). **On approval:** `ONE-66` → Done. **Not pushed.**

**🚢 SHIPPED — ONE-63/64/65/66 (2026-06-20).** The four post-Move features (project delete, rename,
first-event empty states, onboarding checklist) were approved, marked **Done**, and pushed: `git push`
`79badb8..5ef6850` (4 commits) → `origin/main`. The push triggered the Vercel **production deploy
`dpl_Gw5r3jf8mCr6LLKgJ93wiX51qZz2` → READY** (commit `5ef6850`, target production, aliases incl.
**https://onemetric.sbs**, built ~40s). `origin/main == local main`; zero unpushed (before this docs-sync
commit). Repository == Linear == GitHub == production. No open Move/feature work remains in this line; the
broader Launch/Onboarding backlog (e.g. `ONE-18` DB cleanup, `ONE-39` first-run flow, `ONE-23` retention
cron, Paddle go-live) is separate, pre-existing.

**✅ ONE-67 — Project list UX cleanup (2026-06-20). Committed locally → In Review.** Decluttered the Projects
page: dialog-based create + per-card quick-delete, no inline form. Additive; no new dependency; server-first;
dark-first; reuses the ONE-63 Dialog + delete flow.

- **`components/dashboard/create-project-dialog.tsx` (new, client):** a default Button ("New project" /
  "Create project") opens a `Dialog` (ONE-63) containing the existing `CreateProjectForm` (unchanged — same
  `createProject` action + validation; redirect-on-success closes the dialog with the navigation).
- **`delete-project-dialog.tsx` (ONE-63) — additive `triggerVariant` prop:** default `"button"` keeps the
  Settings Danger-Zone CTA byte-identical; `"icon"` renders a quiet ghost trash button
  (`text-muted-foreground hover:text-destructive`, `Trash2`) for the project cards. Same dialog + same
  `deleteProject` server action — no duplicated deletion logic.
- **`dashboard/page.tsx` (rewrite):** header = "Projects" + a `CreateProjectDialog` button (when projects
  exist); a cards-only grid with the quick-delete trash positioned **outside the card `Link`** (`absolute`,
  so it opens the delete dialog without navigating); empty state = the ONE-65 `EmptyState` whose CTA is a
  `CreateProjectDialog`. **Removed** the always-visible inline form card + the `buttonVariants` /
  `CreateProjectForm` / `CardContent` imports.
- **Bundle win:** dropping the server-page `buttonVariants` import (the ONE-65 umbrella culprit) took
  `/dashboard` First Load **189 → 129 kB** — lighter *and* cleaner.
- **Verified:** 83 tests · typecheck · lint · build green; grep `*-brand` on the new dialog = none (no accent
  creep). No schema/query/analytics change; the Settings delete flow is unchanged. **On approval:**
  `ONE-67` → Done. **Not pushed** (1 unpushed).

## Move #4 — Activation & First Experience (signup → first "aha moment")

New Linear project **Move #4 — Activation & First Experience** (`79b97981`) created 2026-06-20 with
`ONE-68…71`: ONE-68 welcome flow · ONE-69 snippet install experience · ONE-70 first-event guidance ·
ONE-71 first value/activation. **ONE-67 was approved + pushed** (`dd513f7..1fe9b6a`) → Done + prod deploy
triggered, so the tree was clean before Move #4 began. Same discipline: one issue at a time, one local
commit each, In Review + stop. Server-first · dark-first · reuse · **no accent creep** · preserve Moves #1–#3.

**✅ ONE-68 — Welcome flow / project-creation onboarding (2026-06-20). Committed locally → In Review.** The
dashboard entry for a **brand-new user (0 projects)** now reads as a guided welcome, not bare list chrome.

- **`components/dashboard/welcome-projects.tsx` (new, server):** the `projects.length === 0` body. Reuses the
  ONE-65 `EmptyState` (title "Create your first project" + the cookieless/no-PII value line + a primary
  **Create project** CTA = the ONE-67 `CreateProjectDialog`) and adds a calm **3-step journey preview**
  (Create a project → Install the snippet → Watch analytics flow) in the same numbered "Step N" `Card`
  language as the Overview `FirstEventOnboarding` → one first-run system. Purely presentational.
- **`app/dashboard/page.tsx` (zero-project branch only):** `isFirstRun = projects.length === 0`; the header
  greets ("**Welcome to OneMetric**" + "Let's get your first site tracking — it only takes a minute.") and the
  body renders `<WelcomeProjects/>`. The **populated state is byte-identical** (header copy, header
  `CreateProjectDialog`, cards + quick-delete unchanged); the old standalone `EmptyState` import was removed
  (now reached via `WelcomeProjects`).
- **Reuse / constraints honored:** server-first; reuses `EmptyState`/`CreateProjectDialog`/`Card`; no new
  dependency; no schema/query/analytics change; **no accent creep** (the create CTA is the existing sanctioned
  primary-button zone; grep `*-brand` on the new file = none); dark-first; Moves #1/#2/#3 untouched.
- **Bundle:** `/dashboard` First Load **129 kB — unchanged** (`WelcomeProjects` is server-only, reusing the
  already-loaded create dialog). New-user path is a deterministic `length===0` branch → DataFast/live data
  untouched; no browser in env, so the welcome visual is reasoned from the markup + the green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-68` → Done. **Not pushed.**

**✅ ONE-68 SHIPPED (2026-06-20).** Approved → pushed `1fe9b6a..18cf117` to `origin/main`; Vercel **production
deploy READY** (`dpl_CfjdQcvoZNgMPFD7c11uBQoHXEVW`, commit `18cf117`, target production, `onemetric.sbs`).
`ONE-68` → Done. Repository == Linear == GitHub == production, all at `18cf117`.

**✅ ONE-69 — Snippet installation experience (2026-06-20). Committed locally → In Review.** Reduces the
friction between project creation and the first event: a clearer, reassuring install step on Settings.

- **Friction analysis (create → first event):** `createProject` redirects to the **Overview**, where ONE-65's
  `FirstEventOnboarding` shows the snippet + a "Full setup & verification →" link to **Settings** (the
  install/verify home: Install card = `InstallSnippet`, Verification card = live status + `RefreshButton`).
  The gap was *placement guidance* — "paste into `<head>`" with no precise location and no per-stack hints.
- **`components/dashboard/install-guide.tsx` (new, server):** wraps the existing client `InstallSnippet`
  (snippet + copy, **unchanged**) with a precise placement line ("just before the closing `</head>` … loads
  asynchronously, never slows your site") + a **zero-JS native `<details>`** "Where does this go?" listing
  per-stack hints (Plain HTML · Next.js/React · WordPress · Webflow/Framer/no-code). Native `<details>` →
  accessible, dark-first, **no disclosure dependency**; the default marker is hidden (`list-none` +
  `[&::-webkit-details-marker]:hidden`) with a "→" affordance.
- **`settings/page.tsx`:** Install card `<InstallSnippet>` → `<InstallGuide>`; the card description tightened
  (the guide now owns the placement detail). The Verification/Custom-events/General/Danger-Zone cards are
  byte-identical.
- **Deliberately scoped to Settings.** `FirstEventOnboarding` (ONE-65) + the ONE-66 checklist keep their own
  snippet/copy widgets → no regression to verified Move-#4-adjacent work; the Overview already routes to
  Settings, so enriching the *destination* improves the journey without touching the landing card.
- **Constraints honored:** server-first; reuses `InstallSnippet`/`Card`; no new dependency; no
  schema/query/analytics change; **no accent creep** (muted/foreground tokens only; grep `*-brand` on the new
  file = none); dark-first; Moves #1/#2/#3 + ONE-68 preserved. Settings route **1.91 kB / 130 kB First Load —
  unchanged** (server-only, zero client JS). No browser in env → the `<details>` UX is reasoned from valid
  HTML + the green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-69` → Done. **Not pushed.**

**✅ ONE-69 SHIPPED (2026-06-20).** Approved → pushed `18cf117..a298b32`; Vercel **production deploy READY**
(`dpl_37kbNgRWDgZ8egMZ3wXDFuy6QAi4`, commit `a298b32`, `onemetric.sbs`). `ONE-69` → Done. Repository ==
Linear == GitHub == production, all at `a298b32`.

**✅ ONE-70 — First-event guidance (2026-06-20). Committed locally → In Review.** Makes the moment right
after snippet install guiding + reassuring instead of a bare status line.

- **Surface = Settings → Verification card** (where the user arrives via the Overview's "Full setup &
  verification →" link, adjacent to the snippet they just pasted). It previously showed only a status dot +
  "Check again" — no "what do I do now / how do I trigger an event / is waiting normal / where do results
  show?".
- **`components/dashboard/first-event-guide.tsx` (new, server):** driven entirely by the existing
  `getProjectIngestStats` (`events`, `lastEventAt`) — **no new query, no fake data.** Two states:
  - **waiting (`events === 0`):** amber dot + "Trigger your first event" → ordered steps (open your site /
    load any page → first pageview; then "Check again"), a "this stays on *waiting* until the first load —
    that's normal" reassurance, an `onemetric.track()` pointer for custom actions, the reused `RefreshButton`,
    and a quiet "Where you'll see it: your dashboard →" link.
  - **receiving (`events > 0`):** emerald dot + "Receiving data — N events", "Your site is connected …
    you're all set", `lastEventAt`, "View your dashboard →".
- **`settings/page.tsx`:** the inline Verification status block → `<FirstEventGuide …/>`; the
  `CardDescription` softened to "Let's get your first event flowing." (`receiving` still drives it). The
  `RefreshButton` import moved into the component. Install/Custom-events/General/Danger-Zone cards untouched.
- **Scope discipline:** Overview `FirstEventOnboarding` (ONE-65) + the ONE-66 checklist keep their own
  snippet/steps → no duplication, no regression to verified work.
- **Constraints honored:** server-first; reuses `Card`/`RefreshButton` + the emerald/amber dot language; no
  new dependency; no schema/query change; **no accent creep** (semantic dots + muted/foreground text links,
  not brand buttons); dark-first; Moves #1/#2/#3 + ONE-68/69 preserved. Settings route **1.91 kB / 130 kB
  First Load — unchanged**. No browser in env → the two states are reasoned from the `events`-driven branch +
  the green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-70` → Done. **Not pushed.**

**✅ ONE-70 SHIPPED (2026-06-20).** Approved → pushed `a298b32..de4cb1a`; Vercel **production deploy READY**
(`dpl_8JQAz3yTHbWuxHRnBmwoY7G1qZ4X`, commit `de4cb1a`, `onemetric.sbs`). `ONE-70` → Done. Repository ==
Linear == GitHub == production, all at `de4cb1a`.

**✅ ONE-71 — First value / activation "aha moment" (2026-06-20). Committed locally → In Review. CLOSES
MOVE #4.** When the first data arrives, the Overview now opens with a calm, professional success moment.

- **Analysis:** the empty→populated transition was silent — the Lede/Hero quantify traffic and the ONE-66
  checklist lists next steps, but nothing *acknowledged the milestone* ("it works"). That recognition +
  value framing was the missing "aha".
- **`components/dashboard/first-value-banner.tsx` (new, server):** a standard `Card` — "**Your analytics are
  live**" + the existing **emerald "live" dot** + one line: "It works — OneMetric is tracking your site …
  privately, no cookies, no consent banner. Your live numbers are below and keep updating." Answers *it
  works · getting traffic · why valuable*. **No animation/toast/confetti** (the "avoid noisy/gimmicky"
  rule). Purely presentational; no props.
- **`dashboard/[projectId]/page.tsx`:** rendered as the **first child of the `hasData` branch** (above the
  Lede), gated `!fullyActivated` — the **same activation window as the checklist**, so banner + checklist
  appear and **retire together** once a funnel + revenue both exist (no permanent chrome). Derived from real
  state (`hasData && !fullyActivated`) — **no fake data, no new query**.
- **No duplication:** the ONE-66 `OnboardingChecklist` (preserved, untouched, rendered just below the Hero)
  keeps the next-step CTAs; the banner only celebrates + frames value. Complementary, separated by Lede+Hero.
- **Constraints honored:** server-first; reuses `Card` + the emerald semantic; no new dependency; no
  schema/query change; **no accent creep** (emerald = existing live/positive semantic, not the brand violet);
  dark-first; Moves #1/#2/#3 + ONE-68/69/70 preserved. Overview route **5.82 kB / 122 kB First Load —
  unchanged** (server-only). No browser in env → the banner is reasoned from the gated branch + green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-71` → Done + the **Move #4**
  Linear project → **Completed** (all four phases done). **Not pushed.**

**✅ ONE-71 SHIPPED + MOVE #4 COMPLETE (2026-06-21).** Approved → pushed `de4cb1a..286e217`; Vercel
**production deploy READY** (`dpl_GW7prLSWsXwYCDziMbqDHXZ2975w`, commit `286e217`, `onemetric.sbs`). `ONE-71`
→ Done; the **Move #4 — Activation & First Experience** Linear project → **Completed**. Repository == Linear
== GitHub == production, all at `286e217`.

## Move #5 — Activation Loop & Retention (automation · instant gratification · retire onboarding · recover)

New Linear project **Move #5 — Activation Loop & Retention** (`a702d389`) created 2026-06-21 with `ONE-72…78`.
Goal: close the activation loop + improve retention by making the product feel alive automatically
(Plausible / GitHub / PostHog / Vercel) — users should never wonder whether install works. **Execution order:
72 → 74 → 73 → 75 → 77 → 76 → 78.** Same discipline: sync before each issue · analyze first · reuse ·
server-first · dark-first · no accent creep · no new dependency unless essential · preserve Moves #1–#4 · one
issue at a time, one local commit, In Review + stop.

**✅ ONE-72 — Auto-verify installation (2026-06-21). Committed locally → In Review.** The verification UI now
detects the first event and transitions to connected on its own — the manual "Check again" is gone.

- **`components/dashboard/auto-verify.tsx` (new, client):** while waiting, calls `router.refresh()` on a 6 s
  interval so the surrounding RSC re-fetches the **existing** `getProjectIngestStats` (Settings) / Overview
  data and flips to connected — **no new endpoint, no schema, no fake data** (server stays source of truth).
  **Bounded (no abuse):** pauses while the tab is hidden, re-checks instantly on tab refocus, gives up after
  5 min → calm "Keep listening" fallback; only mounted while waiting, so it unmounts (poll stops) the moment
  data lands. Renders a live "Listening for your first event…" amber-pulse (`animate-ping` +
  `motion-reduce:animate-none` — the Move #1 Phase-J pattern; reduced-motion-safe).
- **`first-event-guide.tsx` (Settings → Verification):** the waiting branch's static status line + manual
  `RefreshButton` → `<AutoVerify/>`; step-2 copy now "Then return to this tab — OneMetric detects it
  automatically, no refresh needed." The **receiving branch is unchanged** (keeps its emerald status +
  `RefreshButton` to refresh counts).
- **`first-event-onboarding.tsx` (Overview empty state):** added `<AutoVerify className="mt-6 justify-center"/>`
  → when the first event arrives, `hasData` flips and the empty Overview **auto-transitions into the live
  dashboard** (FirstValueBanner + briefing) with no manual refresh. `router.refresh()` is a soft RSC re-render
  → no Suspense-skeleton flash, no full reload.
- **Constraints honored:** server-first; reuses the amber "waiting" semantic + the existing stats; **no new
  dependency** (native `setInterval`/`visibilitychange`); no schema/query change; **no accent creep** (amber
  is the existing waiting semantic, not the brand violet); dark-first; Moves #1–#4 preserved (only the waiting
  surfaces changed; the populated Overview branch is untouched). Routes: Overview 5.82 → **6.21 kB**, Settings
  1.91 → **2.34 kB** (small client island); First Load JS ~unchanged. No browser in env → the auto-transition
  is reasoned from `router.refresh()` semantics + the unmount-on-connect flow + the green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-72` → Done. **Not pushed.**

**✅ ONE-72 SHIPPED (2026-06-21).** Approved → pushed `286e217..2008314`; Vercel **production deploy READY**
(`dpl_5Mi6yD2FNc2bUy3Ww9TRG5Wtqak8`, commit `2008314`, `onemetric.sbs`). `ONE-72` → Done. Repository ==
Linear == GitHub == production, all at `2008314`.

**✅ ONE-74 — Smarter activation state + dismissible onboarding (2026-06-21). Committed locally → In Review.**
The onboarding chrome no longer requires revenue to retire, and an established user can dismiss it.

- **Problem:** `fullyActivated = hasFunnel && hasRevenue` (page.tsx) → the `FirstValueBanner` (ONE-71) +
  `OnboardingChecklist` (ONE-66, both gated on `!fullyActivated`) stayed forever for the majority who never
  connect PayPal/revenue.
- **(1) Smarter auto-retire:** `fullyActivated` → **`hasFunnel || hasRevenue`** (we're already inside the
  `hasData`/first-pageview branch, so this means traffic + a funnel **or** revenue). Setting up **either**
  retires onboarding; revenue is optional.
- **(2) Dismissible:** new **`lib/hooks/use-onboarding-dismissed.ts`** (`useOnboardingDismissed(projectId)` →
  `[dismissed, dismiss]`): persists a per-project flag in **localStorage** (UI preference → **no schema, no
  server round-trip**), dispatches a window `om:onboarding-dismissed` event so all consumers hide at once (the
  banner is at the top of the Overview, the checklist after the Hero — not DOM-adjacent), and listens to
  `storage` for cross-tab sync. SSR returns `false` (no hydration flash-mismatch).
  - **`onboarding-checklist.tsx`:** added a calm muted "**Dismiss**" button in the header; early-returns null
    when dismissed (or when all steps complete, as before). New required `projectId` prop.
  - **`first-value-banner.tsx`:** became a **thin client** wrapper (markup byte-identical) that reads the same
    flag and returns null when dismissed → dismissing the checklist hides the banner too. New `projectId` prop.
  - **`page.tsx`:** redefined `fullyActivated`; passes `projectId` to both.
- **Constraints honored:** honest semantics (no faked "done" steps); server-first (the banner is a thin client
  island only to read the flag — justified); reuses the existing checklist/banner/`Card`; **no new dependency**
  (native localStorage + window events); **no fake data**; **no accent creep** (muted text "Dismiss"; emerald
  banner unchanged); dark-first; Moves #1–#4 + ONE-72 preserved. Overview route 6.21 → **6.65 kB** (123 kB
  First Load). No browser in env → the dismiss/sync is reasoned from the hook + the window-event flow + the
  green build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-74` → Done. **Not pushed.**

**✅ ONE-74 SHIPPED (2026-06-21).** Approved → pushed `2008314..d31f176` (one transient `git push` network
failure, retried OK); Vercel **production deploy READY** (`dpl_EaBVhVNgv5yk9xcxroAFvyiU1Tfn`, commit
`d31f176`, `onemetric.sbs`). `ONE-74` → Done. Repository == Linear == GitHub == production, all at `d31f176`.

**✅ ONE-73 — Send a test event (2026-06-21). Committed locally → In Review.** A "no-site" instant-
gratification path (PostHog-style) so a user who hasn't deployed the snippet still gets the "it works" moment.

- **Pipeline analysis:** the tracker POSTs `{publicKey,type,name,path?,...}` (text/plain) → `POST /api/collect`
  (Node, zod) → `ingest()` resolves the project by `publicKey`, creates/updates a `Session`, writes an
  `Event`, always 204. `getOverviewMetrics` counts `count(*)` from `Session` (any session, pageview or not),
  so one custom event trips `hasData`; `getProjectIngestStats` (events>0) trips the Settings verification.
- **`components/dashboard/send-test-event-button.tsx` (new, client):** POSTs through the **real**
  `/api/collect` (same-origin → a simple text/plain request, no preflight; mirrors the tracker payload) with
  a genuine, clearly-labelled event — `type:"custom"`, `name:"Test event"`, `path:"/"`,
  `metadata:{source:"onemetric-dashboard",test:true}`. **Not fake data** (a real user-triggered event through
  the real path) and trivially identifiable/removable. On 204 → `router.refresh()` (ONE-72 auto-verify catches
  it too). States idle → "Sending…" → "Test event sent — your dashboard is updating…", with a transport-error
  fallback.
- **Wired into both waiting surfaces:** Settings `FirstEventGuide` (new `publicKey` prop; "No site handy?"
  block under the auto-verify line, with a top border) and the Overview `FirstEventOnboarding` (new `publicKey`
  prop; centered "No site to test on yet?"). Settings + Overview pages pass `project.publicKey`.
- **Decision — custom event, not a pageview:** keeps Top Pages / pageview analytics clean and shows as an
  obvious "Test event" in the Events tab; still creates a session (Overview goes live) + an event (verification
  flips). Same-origin fetch (dashboard ↔ `/api/collect` both on `onemetric.sbs`) → no CORS/no-cors needed; DNT
  intentionally not gated (explicit first-party test action, not visitor tracking).
- **Constraints honored:** reuses `/api/collect` + the shared outline `Button`; **no new dependency**; **no
  schema change**; **no accent creep** (outline button + muted text); server-first (pages stay RSC; the button
  is a leaf island); dark-first; Moves #1–#5 + the onboarding (ONE-72/74) preserved. Routes: Overview 6.65 →
  **7.02 kB**, Settings 2.34 → **2.69 kB** (First Load unchanged). No browser in env → the send→refresh→connect
  flow is reasoned from the ingest path + `getOverviewMetrics`/`getProjectIngestStats` semantics + the green
  build.
- **Verified:** 83 tests · typecheck · lint · build green. **On approval:** `ONE-73` → Done. **Not pushed.**

**✅ ONE-73 SHIPPED (2026-06-21).** Approved → pushed `d31f176..ccf51d4`; Vercel **production deploy READY**
(`dpl_Bx77z2wGRfjMHfPFn7QyknnsbBDT`, commit `ccf51d4`, `onemetric.sbs`). `ONE-73` → Done. Repository == Linear
== GitHub == production, all at `ccf51d4`.

**✅ ONE-75 — Installed-but-no-data recovery email (2026-06-21). Committed locally → In Review.** A daily cron
recovers stalled activations with one calm setup reminder.

- **Infra analysis (reused):** the weekly cron `GET /api/cron/weekly-reports` (`CRON_SECRET` Bearer gate),
  `apps/web/vercel.json` crons, `server/reports/send.ts` (Resend; no-ops without `RESEND_API_KEY`), the
  `@react-email/components` dark template, and `Project.createdAt` / `owner.email` / `events` relation.
- **No-schema dedup (the key decision):** instead of a "nudged" column, a **daily** cron targets the **single
  UTC calendar-day bucket** `RECOVERY_AGE_DAYS = 2` days ago. A project's `createdAt` date matches that bucket
  on **exactly one** daily run → emailed at most once. New pure **`recoveryWindow(now, ageDays)`** in
  `lib/range.ts` (+2 unit tests, incl. a "matches on exactly one run" assertion). **Residual edge:** a rare
  same-day Vercel cron re-fire could double-send; the bulletproof upgrade is a `recoveryEmailSentAt` field —
  **flagged for approval, deliberately not built** (rules prefer no-schema).
- **Detection (real data only):** `getStalledProjectsForRecovery(from, to)` = projects with `createdAt` in the
  window **and `events: { none: {} }`** (zero ingested events — the honest "installed-but-no-data" signal),
  selecting `owner.email` + name/domain.
- **Email:** `server/reports/recovery-email.tsx` (`RecoveryEmail`) mirrors the weekly-email dark theme with
  **neutral grays only (no brand accent)**; calm/helpful/privacy-first copy ("we haven't seen any data yet" →
  3 setup steps + the test-event tip + "cookieless, no banner" + "this is a one-time reminder, we won't send
  another"); a neutral white CTA button → `${NEXT_PUBLIC_APP_URL}/dashboard/<id>/settings`. `sendRecoveryEmail`
  added to `send.ts` (mirrors `sendWeeklyReport`, no-ops without the key). `GET /api/cron/recovery-emails`
  (CRON_SECRET-gated, mirrors weekly) → `{ ok, candidates, sent }`; 2nd cron entry `0 10 * * *` in vercel.json.
- **Constraints honored:** reuses Resend + Vercel-cron + the email template style; server-first; **no new
  dependency** (resend + react-email already deps); **no schema change**; **no accent creep** (neutral email);
  calm, non-marketing tone; never targets DataFast (old + has events); Moves #1–#5 preserved.
- **Verified:** 85 tests (+2) · typecheck · lint · build green; the new route compiles. **A live cron run was
  deliberately skipped** — local points at the prod DB and `.env` may hold a real `RESEND_API_KEY`, so running
  it could email a real stalled user. The auth gate + no-op-without-key mirror the verified weekly cron; the
  window logic is unit-tested. **On approval:** `ONE-75` → Done. **Not pushed.** (After deploy, optionally
  hit the route once with the secret on a quiet day to confirm `{ok, candidates, sent:0}`.)

**✅ ONE-75 SHIPPED (2026-06-21).** Approved → pushed `ccf51d4..11881aa`; Vercel **production deploy READY**
(`dpl_DoDs54qprsVVZat7CdA42crUphff`, commit `11881aa`, target production). `ONE-75` → Done. Repository ==
Linear == GitHub == production, all at `11881aa`. (The new daily recovery cron `0 10 * * *` is now live in
prod's vercel.json alongside the weekly one.)

**✅ ONE-77 — Promote weekly reports during onboarding (2026-06-21). Committed locally → In Review.** Surfaces
the existing weekly-reports feature during onboarding as a retention hook — a calm checklist step, not a
rebuild.

- **Analysis:** the reports feature lives at `/dashboard/[projectId]/reports` (a "Reports" tab — add/remove/
  enable recipients + "Send now") via `actions/reports.ts` / `queries/reports.ts` / `ReportSubscription`; new
  users rarely discover it. The ONE-66 `OnboardingChecklist` is the natural onboarding home.
- **`queries/reports.ts`:** new `hasReportSubscription(projectId)` → boolean (`findFirst` — real signal that a
  recipient exists; no fake progress, no schema change).
- **`onboarding-checklist.tsx`:** added a **6th step "Set up weekly email reports"** (`done: hasReports`) with
  an **outline** CTA → the reports page. Outline (vs the funnel/revenue primary CTAs) keeps it calmer/lower-
  priority and non-marketing. New `hasReports` + `reportsHref` props.
- **`dashboard/[projectId]/page.tsx`:** fetches `hasReportSubscription` in the existing `Promise.all` (one
  cheap `findFirst`) and passes `hasReports` + `reportsHref`.
- **ONE-74 retire logic untouched:** `fullyActivated = hasFunnel || hasRevenue` is unchanged, so the reports
  step never keeps onboarding alive — it shows only during the early window and rides the checklist's
  dismiss/auto-hide. The checklist count is now "N / 6".
- **Constraints honored:** reuses the reports pages + the checklist; server-first; **no new dependency**; **no
  schema change**; **no accent creep** (neutral/outline); dark-first; Moves #1–#5 + ONE-72/73/74/75 preserved.
  Overview route 7.02 → **7.07 kB** (123 kB First Load unchanged). No browser in env → reasoned from the real
  `hasReports` signal + the unchanged gate + the green build.
- **Verified:** 85 tests · typecheck · lint · build green. **On approval:** `ONE-77` → Done. **Not pushed.**

**✅ ONE-77 SHIPPED (2026-06-21).** Approved → pushed `11881aa..988029a`; Vercel **production deploy READY**
(`dpl_syn2A5uQtuHCFF6G9o8N1aK58mgF`, commit `988029a`, target production). `ONE-77` → Done. Repository ==
Linear == GitHub == production, all at `988029a`.

**✅ ONE-76 — Canonical setup surface (2026-06-21). Committed locally → In Review.** Collapsed the fragmented
install/verify into one canonical surface shared by Settings and the Overview empty state — no more hop.

- **Fragmentation analysed:** snippet/install/verify lived in 3 shapes — the Overview empty state
  (`FirstEventOnboarding`, a bespoke inline `<pre>` + own copy/toast + 3 step cards + AutoVerify + test button
  + a "Full setup →" hop), Settings → Install (`InstallGuide`, the canonical rich install), Settings → Verify
  (`FirstEventGuide`, canonical). New users had to hop Overview → Settings for the good install.
- **`components/dashboard/setup-guide.tsx` (new, server):** `SetupGuide` = the **Install** card (`InstallGuide`)
  + the **Verification** card (`FirstEventGuide`, which already carries ONE-72 auto-verify + ONE-73 test-event).
  Pure composition of the canonical pieces — **no third variant**. `showDashboardLink` is forwarded to
  `FirstEventGuide`.
- **`first-event-guide.tsx`:** added optional `showDashboardLink?: boolean` (default true) gating the two
  "your dashboard" links (hidden on the Overview, where it'd self-link); trimmed the Settings-specific "see
  Custom events below" clause now that the component is shared.
- **Settings page:** the two inline Install/Verification cards → a single `<SetupGuide>` (removed the now-unused
  `InstallGuide`/`FirstEventGuide` imports + the `receiving` local). Custom events / General / Danger Zone
  cards untouched; spacing identical (`SetupGuide` returns a `space-y-8` of the two cards).
- **Overview empty state:** `<FirstEventOnboarding>` → a heading ("Finish setting up <name>") +
  `<SetupGuide showDashboardLink={false}>` (events=0/lastEventAt=null). Same canonical install + verify inline;
  ONE-72 AutoVerify still auto-transitions it into the live dashboard on first event. **Deleted
  `first-event-onboarding.tsx`** (only consumer was the Overview; its duplicated snippet/steps are superseded).
  Fixed the stale `FirstEventOnboarding` reference in `welcome-projects.tsx`'s comment.
- **Left intentionally:** the ONE-66 checklist's compact "Copy snippet" button (a button, not a full snippet
  panel — a different, compact context; consolidating it would worsen its UX).
- **Constraints honored:** server-first; reuse-only (no new component variant of the snippet); **no new
  dependency**; **no schema change**; **no accent creep** (neutral/outline); dark-first; Moves #1–#5 +
  ONE-72/73/74 behavior preserved; Settings rename/delete intact. Overview route 7.07 → **6.82 kB** (dropped —
  the bespoke client copy/toast is gone). No browser in env → reasoned from the shared composition + the green
  build (the empty-state visual now == the Settings setup section).
- **Verified:** 85 tests · typecheck · lint · build green. **On approval:** `ONE-76` → Done. **Not pushed.**

**✅ ONE-76 SHIPPED (2026-06-21).** Approved → pushed `988029a..08d9c54`; Vercel **production deploy READY**
(`dpl_Bu9iReQLFF4jnZd5E1iUaAtKCutx`, commit `08d9c54`, target production). `ONE-76` → Done. Repository ==
Linear == GitHub == production, all at `08d9c54`.

**✅ ONE-78 — Progressive disclosure for low-data Overview (2026-06-21). Committed locally → In Review. LAST
MOVE #5 ISSUE.** Reduces cognitive load for low-data projects — value over placeholders.

- **Problem mapped:** the populated Overview (`hasData`) rendered, at low data, **2 dimmed `pending` KPI
  tiles** (Signup conversion, Revenue) + **2 placeholder triad cards** ("No funnel yet / Create a funnel",
  "No revenue connected / Connect revenue") — which during onboarding also duplicate the ONE-66 checklist.
- **(1) KPI strip → data-driven dynamic columns** (`page.tsx`): a `kpiCards` array built before `return` —
  Pageviews + Active now always; Signup conversion only if `primaryFunnel && funnelNow && funnelPrev`; Revenue
  only if `showRevenue` — rendered with `lg:grid-cols-{2|3|4}` (`kpiColsClass`). The `pending` StatCards are
  removed; `cn` imported. Fully populated → 4 KPIs / `lg:grid-cols-4` (identical to before).
- **(2) Breakdowns branched on `fullyActivated`** (ONE-74's `hasFunnel || hasRevenue`):
  - `fullyActivated` → the **exact** Move #1 triad (Sources | Funnel | Revenue, with the real cards or the
    discovery CTAs) + the detail row (Top pages | Audience). Unchanged.
  - `!fullyActivated` → one curated `[Sources | Top pages | Audience]` `md:grid-cols-3` grid; the
    funnel/revenue placeholders are omitted (the checklist guides those — not hidden, just not duplicated).
- **Honest + non-destructive:** no fabricated data (hide, don't fake); established users keep discovery (the
  triad CTAs once activated, and the Funnels/Revenue tabs always); the **fully-populated Overview is byte-
  identical** to before — only the partial/low-data presentation changed.
- **Constraints honored:** server-first; reuses `StatCard`/`SourcesCard`/`TopPagesCard`/`AudienceCard`; **no
  new dependency**; **no schema/query change**; **no accent creep**; dark-first; Moves #1–#5 preserved.
  Overview route **6.82 kB unchanged**. No browser in env → reasoned from the deterministic data-driven
  branches + the green build (fully-populated path provably unchanged).
- **Verified:** 85 tests · typecheck · lint · build green. **On approval:** `ONE-78` → Done + the **Move #5**
  Linear project → **Completed** (all 7 phases). **Not pushed.**

## Context notes (from chat — easy to miss otherwise)

**Two phase-numbering schemes (don't conflate):**
- The build phases **0–8** = the V1 MVP; **9–13** in `plan-what-need-to-prancy-wren.md` =
  billing / marketing / tests / deploy / hardening.
- The user later said **"Phase 1 / 2 / 3"** to mean the *post-deploy hardening* items:
  **1 = Email ✅, 2 = WAF rate-limit ✅, 3 = custom domain ✅** (all done 2026-06-14/15).

**Accounts / emails (these tripped us up — keep straight):**
- Vercel account: **lyesshml@gmail.com** · GitHub account: **himranelyess@gmail.com**
  (git commit author is set to this so deploys aren't blocked) · Supabase org owner:
  **himranelyess@gmail.com**.
- App login (the founder's own test account, owns the **DataFast** project):
  **supradz14@gmail.com**. A friend tested signup with **adembensari7@gmail.com**.

**Billing (resolved):** founder is in **Algeria** → **Stripe unavailable** → Merchant-of-Record
= **Paddle** (chosen 2026-06-15; verification PASSED, Algeria seller approved). Full integration
**built + sandbox-verified** (checkout, webhook, portal, cancel). Remaining = production keys +
**payout details** + go-live + cleanup (see the billing block in the RESUME section above).

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

**LIVE in production** at **`https://onemetric.sbs`**. V1 MVP (0–8) + phases 9 (billing),
10 (marketing/legal), 11 (tests+CI), 12 (deploy) done. Post-deploy hardening **all done**:
Email ✅, WAF rate-limit ✅, custom domain ✅, `/api/collect` 500-hardening ✅. **Paddle
billing built + sandbox-verified end-to-end** (2026-06-15). **Only config remains to charge
real customers:** Paddle payout details + production keys/go-live + test-data cleanup (all in
the RESUME section above). 48 tests green.

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
  **⚠️ These are templates — get professional legal review before relying on them.**
  (Contact placeholder now replaced with `support@onemetric.sbs`; a `/refund` page — 14-day
  money-back — was added 2026-06-14 for Paddle's website verification.)
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
  3. ~~Replace the placeholder contact~~ DONE — now `support@onemetric.sbs` on privacy /
     terms / refund, and it **receives** mail via ImprovMX forwarding → `lyesshml@gmail.com`
     (verified 2026-06-15). (Sending *as* support@ from Gmail is still an optional later step.)
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
