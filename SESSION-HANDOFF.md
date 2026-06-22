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

## 2. Current project state (2026-06-21) — CURRENT, supersedes the running logs below
- **V1 MVP complete and LIVE** at `https://onemetric.sbs` (build phases 0–8): analytics, custom
  events, funnels, PayPal revenue attribution, weekly reports, cookieless tracker, Supabase auth
  (email/password **+ Google OAuth**).
- **All six design/activation "Moves" are COMPLETE & APPROVED and shipped to production**, each
  with its Linear project **Completed**: **#1** Opinionated Overview · **#2** Feel & Performance ·
  **#3** Identity & Craft (the single violet accent + logomark) · **#4** Activation & First
  Experience · **#5** Activation Loop & Retention · **#6** Signup & Polish. Per-issue detail in §3,
  `TODO.md`, and the `HANDOFF.md` running log.
- **Google OAuth: CONFIGURED + VERIFIED LIVE (2026-06-21).** "Continue with Google" on
  `https://onemetric.sbs/login` → Google consent → Supabase → `/auth/callback` → **Dashboard** was
  tested end-to-end. Code shipped in `ONE-79`; the external config (Supabase Google provider +
  Google Cloud OAuth client + consent screen published) is done. Google sign-ups skip the
  email-confirmation wait.
- **Revenue-ready, BLOCKED on external config + legal ONLY — not on code or UX.** The engineering
  is done; the app can charge the moment the launch blockers below clear. **Current bottlenecks
  (all external, all Linear `Todo`):**
  - **`ONE-26`** (Urgent, launch-blocker) — add Paddle **payout details** (Algeria: SWIFT to
    USD/EUR or PayPal). The true revenue gate; likely the longest *business*-side lead time.
  - **`ONE-17`** (Urgent, launch-blocker) + sub-issues **`ONE-27→31`** — flip Paddle **sandbox →
    production**: recreate the Pro product + $19/mo (ONE-27), prod client token + API key with the
    right scopes (ONE-28), webhook destination + approved checkout domain (ONE-29), set the 5
    Vercel env vars + redeploy (ONE-30), prod smoke test (ONE-31). ~1h once payout exists.
  - **`ONE-19`** (High, launch-blocker, legal) — Algeria **ANPDP** cross-border-transfer
    authorization (EU hosting by an Algeria controller). Regulator-dependent → likely the **longest
    overall lead time**; start in parallel now.
  - **`ONE-36`** (High, launch-blocker, legal) — professional review of `/privacy` `/terms`
    `/refund` (accurate templates, never counsel-reviewed).
  - **`ONE-18`** (High) + sub **`ONE-32/33/34/35`** — pre-launch live-DB cleanup (reset the
    `supradz14` sandbox billing, remove the test `ReportSubscription`, DataFast smoke rows,
    unconfirmed auth users). Low effort, before the first real customer.
- **The next priority is BUSINESS CONFIGURATION + LEGAL READINESS, not UX.** Activation/UX is at
  diminishing returns after Moves #4–#6; hold further UI Moves until revenue is unblocked. (Full
  reasoning: the post-Move-#6 readiness analysis.)

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
  line has no open items. **Four post-Move features are Done & live in production (shipped 2026-06-20):**
  **`ONE-63`** (project deletion — Danger Zone, type-to-confirm; cascade verified on the live DB → no
  orphans), **`ONE-64`** (project rename — a "General" card; `Project.name` only, owner-scoped, 1–60 chars),
  and **`ONE-65`** (first-event onboarding & empty states — Overview "No events yet" snippet + 3 steps, a
  TrendChart no-data placeholder, and a shared `EmptyState` across Funnels / Revenue / Events / Project-list),
  and **`ONE-66`** (a "Getting started" activation checklist on the Overview, above the metric cards — five
  steps derived from real data, hides when fully activated; a client component, +1 kB).
  All reuse the existing design system + `radix-ui` — **no new dependency**. (Bundle note: ONE-65 raised
  `/dashboard` + `/funnels` First Load 117 → 189 kB — the empty-state CTA imports `buttonVariants`, pulling
  the `radix-ui` umbrella chunk other server pages already pay; future fix = import `Slot` from
  `@radix-ui/react-slot` directly in `button.tsx`.) **`ONE-67`** (Projects page UX cleanup — dialog-based
  create + per-card quick-delete; inline form removed) is **Done & pushed** (`dd513f7..1fe9b6a`, 2026-06-20
  → prod deploy triggered; `/dashboard` First Load dropped **189 → 129 kB**).
- **Move #4 — Activation & First Experience (in progress, 2026-06-20).** New Linear project
  (`79b97981`) optimizing the whole journey signup → first "aha": `ONE-68` welcome flow · `ONE-69` snippet
  install experience · `ONE-70` first-event guidance · `ONE-71` first value/activation. Same discipline as
  the Moves (sync before each issue · analyze first · reuse · server-first · dark-first · **no accent
  creep** · preserve Moves #1–#3 · one issue at a time · one local commit · In Review + stop). **`ONE-68`
  (welcome flow) is **Done & shipped** (pushed `1fe9b6a..18cf117` → prod READY `dpl_Cfjd…`, `onemetric.sbs`):
  the 0-project dashboard entry shows a guided welcome (`WelcomeProjects` server component — reuses
  `EmptyState` + `CreateProjectDialog` + a 3-step journey preview). **`ONE-69` (snippet installation
  experience) is implemented + committed locally → In Review (1 unpushed):** new `InstallGuide` *server*
  component wraps the existing `InstallSnippet` with a precise "just before `</head>`" placement line + a
  zero-JS native `<details>` of per-stack hints (Plain HTML / Next.js / WordPress / no-code), wired into the
  **Settings → Install** card (the destination the Overview's `FirstEventOnboarding` already links to); it's
  **Done & shipped** (pushed `18cf117..a298b32` → prod READY `dpl_37kb…`, `onemetric.sbs`). **`ONE-70`
  (first-event guidance) is implemented + committed locally → In Review (1 unpushed):** the **Settings →
  Verification** card was reworked into a new `FirstEventGuide` *server* component (driven by the existing
  `getProjectIngestStats`, no fake data) answering the new-user's five questions right after install; it's
  **Done & shipped** (pushed `a298b32..de4cb1a` → prod READY `dpl_8JQA…`, `onemetric.sbs`). **`ONE-71`
  (first value / "aha moment") is implemented + committed locally → In Review (1 unpushed) — CLOSES MOVE
  #4:** new `FirstValueBanner` *server* component (standard `Card`, emerald "live" dot) — "Your analytics
  are live · it works · privately, no cookies · live numbers below" — gated `hasData && !fullyActivated`; it's
  **Done & shipped** (pushed `de4cb1a..286e217` → prod READY `dpl_GW7p…`, `onemetric.sbs`); the **Move #4
  Linear project is Completed**.
- **Move #5 — Activation Loop & Retention (in progress, 2026-06-21).** New Linear project (`a702d389`):
  automation + retention so the product feels alive automatically. Issues `ONE-72…78`, **execution order
  72 → 74 → 73 → 75 → 77 → 76 → 78**: 72 auto-verify · 74 smarter activation + dismissible onboarding · 73
  send a test event · 75 installed-but-no-data recovery email · 77 promote weekly reports · 76 canonical
  setup surface · 78 progressive disclosure for low-data Overview. Same discipline (sync before each ·
  analyze · reuse · server-first · dark-first · no accent creep · no new dependency unless essential ·
  preserve Moves #1–#4 · one issue/commit · In Review + stop). **`ONE-72` (auto-verify) is implemented +
  committed locally → In Review (1 unpushed):** new `AutoVerify` client island calls `router.refresh()`
  (6 s, pauses when tab hidden, re-checks on refocus, caps at 5 min → "Keep listening") so the waiting UI
  flips to connected on its own — wired into Settings `FirstEventGuide` (replaces manual "Check again") and
  the Overview `FirstEventOnboarding` (empty Overview auto-transitions into the live dashboard). Reuses the
  existing stats (no new endpoint/schema/fake data); amber waiting semantic (no accent creep); it's **Done &
  shipped** (pushed `286e217..2008314` → prod READY `dpl_5Mi6…`, `onemetric.sbs`). **`ONE-74` (smarter
  activation + dismissible onboarding) is implemented + committed locally → In Review (1 unpushed):**
  `fullyActivated` redefined `hasFunnel && hasRevenue` → **`hasFunnel || hasRevenue`** (revenue no longer
  required to retire the ONE-71 banner + ONE-66 checklist); plus a dependency-free
  `useOnboardingDismissed(projectId)` hook (localStorage per project + window-event sync, **no schema**) — the
  checklist gained a calm "Dismiss" control and the banner (now a thin client wrapper) honors the same flag.
  No fake data, no new dependency, no accent creep; it's **Done & shipped** (pushed `2008314..d31f176` → prod
  READY `dpl_EaBV…`, `onemetric.sbs`). **`ONE-73` (send a test event) is implemented + committed locally → In
  Review (1 unpushed):** new `SendTestEventButton` client island POSTs a real, clearly-labelled custom "Test
  event" (`metadata.test`) through the same-origin `/api/collect` (the real ingest pipeline — no fake data),
  then `router.refresh()`es → Settings verification flips to connected + the Overview goes live (ONE-72
  auto-verify also catches it). Wired into both waiting surfaces (Settings `FirstEventGuide` + Overview
  `FirstEventOnboarding`, both now take a `publicKey` prop). Reuses `/api/collect` + the outline Button; no new
  dependency / schema; no accent creep; it's **Done & shipped** (pushed `d31f176..ccf51d4` → prod READY
  `dpl_Bx77…`, `onemetric.sbs`). **`ONE-75` (installed-but-no-data recovery email) is implemented + committed
  locally → In Review (1 unpushed):** a daily Vercel cron (`/api/cron/recovery-emails`, `0 10 * * *`,
  CRON_SECRET-gated like the weekly one) emails one calm setup reminder to projects created 2 days ago with
  **zero events** (`events: { none }` — real data). **No-schema dedup:** new pure `recoveryWindow(now, ageDays)`
  (`lib/range.ts`, +2 tests) = the single UTC day bucket N days ago → each project matches one run → emailed
  once (residual: a rare same-day cron re-fire could double-send; bulletproof = a `recoveryEmailSentAt` field,
  flagged-not-built). New `getStalledProjectsForRecovery` query + `RecoveryEmail` template (neutral dark, no
  accent) + `sendRecoveryEmail` (no-ops without `RESEND_API_KEY`). Reuses Resend + cron + email-template style;
  no new dependency; 85 tests/typecheck/lint/build green; **live cron run skipped** (local hits prod DB + may
  hold a real RESEND key → could email a real user); it's **Done & shipped** (pushed `ccf51d4..11881aa` → prod
  READY `dpl_DoDs…`; the daily recovery cron is now live). **`ONE-77` (promote weekly reports during
  onboarding) is implemented + committed locally → In Review (1 unpushed):** added a 6th step "Set up weekly
  email reports" to the ONE-66 checklist with a **real** done-signal (`hasReportSubscription` — a recipient
  exists; no fake progress) + an outline CTA → the existing `/reports` page. ONE-74's retire gate
  (`fullyActivated = hasFunnel || hasRevenue`) is unchanged, so it never keeps onboarding alive. New
  `hasReportSubscription` query; the Overview fetches it in the existing Promise.all. Reuses the reports
  feature + checklist; no new dependency / schema; no accent creep (outline); it's **Done & shipped** (pushed
  `11881aa..988029a` → prod READY `dpl_syn2…`). **`ONE-76` (canonical setup surface) is implemented +
  committed locally → In Review (1 unpushed):** new `SetupGuide` server component = the Install card
  (`InstallGuide`) + the Verification card (`FirstEventGuide` w/ ONE-72 auto-verify + ONE-73 test-event),
  rendered **identically on Settings and the Overview empty state** → the brand-new user gets full install +
  verify inline, **no Overview→Settings hop**. Deleted the bespoke `FirstEventOnboarding` (ONE-65 — its
  duplicated snippet/steps are superseded); added a `showDashboardLink?` flag to `FirstEventGuide` (hide the
  self-link on the Overview). Reuse-only; no new dependency / schema; no accent creep; Settings rename/delete
  + ONE-72/73/74 behavior preserved; Overview route 7.07 → **6.82 kB** (dropped). 85 tests/typecheck/lint/build
  green; it's **Done & shipped** (pushed `988029a..08d9c54` → prod READY `dpl_Bu9i…`). **`ONE-78` (progressive
  disclosure for low-data Overview) is implemented + committed locally → In Review (1 unpushed) — the LAST
  Move #5 issue:** the KPI strip now shows only KPIs with real data (Pageviews + Active now always; Conversion
  with a funnel; Revenue when connected) via dynamic `lg:grid-cols-{2|3|4}` — the dimmed `pending` tiles are
  gone; and the breakdowns branch on `fullyActivated` — `fullyActivated` keeps the exact Move #1 triad +
  detail row (with discovery CTAs), `!fullyActivated` shows one curated `[Sources | Top pages | Audience]`
  grid (no funnel/revenue placeholders). Fully-populated Overview byte-identical; no fake data; server-first;
  no new dependency / schema; no accent creep; 85 tests/typecheck/lint/build green; it's **Done & shipped**
  (pushed `08d9c54..bd18f4a` → prod READY `dpl_FXf5…`) — the **Move #5 Linear project is Completed** (all 7
  phases live).
- **Move #6 — Signup & Polish (in progress, 2026-06-21).** New Linear project (`4474382d`) — refinement, not
  breadth: remove signup friction · trust/honesty · cognitive load. Issues `ONE-79…83`, **execution order
  79 → 80 → 81 → 82 → 83**: 79 Google OAuth · 80 honest "Active now" · 81 persistent recovery-email dedup
  (**flagged schema field** — needs approval) · 82 collapse the 6-step checklist · 83 second-project shortcut.
  *(A duplicate Move #6 project `6b426845` + issue `ONE-84` were created in error and Canceled — use
  `4474382d` / `ONE-79…83`.)* **`ONE-79` (Google OAuth signup) is implemented + committed locally → In Review
  (1 unpushed):** "Continue with Google" on login + signup via a **server-action** `signInWithGoogle`
  (`signInWithOAuth` → redirect to Google; keeps the Supabase browser client off the auth pages → `/login` +
  `/signup` stay ~117 kB) + a new `app/auth/callback/route.ts` (`exchangeCodeForSession` → `/dashboard`;
  open-redirect-guarded) + a `GoogleButton` (outline Button + Google's own logo SVG). `requireUser`→`syncUser`
  mirrors OAuth users into `public.User` unchanged → **no schema change**; no new dependency; no accent creep.
  **✅ Google provider CONFIGURED + VERIFIED LIVE (2026-06-21):** Supabase Google provider enabled (Client
  ID/Secret), `https://onemetric.sbs/auth/callback` allowlisted in Supabase Redirect URLs, Google Cloud OAuth
  client redirect URI = `https://ladsqshpcdyjruzohkvb.supabase.co/auth/v1/callback`, consent screen published
  to Production. End-to-end sign-in tested → Dashboard. 85 tests/typecheck/lint/build green; **Done & shipped**
  (pushed `bd18f4a..d9d2662` → prod READY `dpl_EEzp…`). **`ONE-80` (honest "Active now" indicator) is implemented + committed locally → In Review (1
  unpushed):** the KPI's pulsing dot + "live" wording + "Active now" label implied realtime, but `getActiveNow`
  is a page-load 5-min snapshot — so (presentation only, query unchanged) relabelled **"Active now" → "Active
  (5 min)"** and made `StatCard`'s `LiveDot` a **static** presence dot (no pulse, no "live"). No fake data / no
  schema / no new dependency / no accent creep; Overview 6.82 kB unchanged; 85 tests/typecheck/lint/build
  green; it's **Done & shipped** (pushed `d9d2662..da5c224` → prod READY `dpl_Btvf…`). **`ONE-81` (persistent
  recovery-email dedup) is implemented + committed locally → In Review (1 unpushed) — INCLUDES A LIVE,
  USER-APPROVED SCHEMA CHANGE:** added nullable `Project.recoveryEmailSentAt DateTime?` (migration
  `20260621000000_add_recovery_email_sent_at`) so the recovery email is sent **at most once per project**.
  `getStalledProjectsForRecovery(olderThan)` now filters `createdAt <= olderThan AND events:{none} AND
  recoveryEmailSentAt:null`; `markRecoveryEmailSent` stamps `now()` only after a successful send; `recoveryWindow`
  → `recoveryThreshold`. **⚠️ The migration was applied to the LIVE DB via the Supabase MCP** (local `.env` DB
  password is invalid → P1000, so `prisma migrate deploy` can't run): the `ALTER TABLE` ran via
  `apply_migration` and a matching `_prisma_migrations` row (checksum `56f053…c40c`) was inserted, so Prisma
  history is consistent. Reuses cron + Resend + template; no new dependency; no accent creep; 85
  tests/typecheck/lint/build green; it's **Done & shipped** (pushed `da5c224..0609571` → prod READY
  `dpl_8HXT…`). **`ONE-82` (collapse onboarding checklist) is implemented + committed locally → In Review (1
  unpushed):** the 6-step checklist now collapses to a calm summary (neutral progress bar + one-line summary +
  a "Show steps" chevron toggle) once `completed > steps.length/2` (≥4/6); early users (3/6) keep the
  byte-identical full checklist; same `steps` data drives both (no fake progress). ONE-74 dismiss + ONE-77
  reports step + the `!fullyActivated` gate (fully-activated unchanged) all preserved. No new dependency / no
  schema / no accent creep; Overview 7.13 kB; 85 tests/typecheck/lint/build green; it's **Done & shipped**
  (pushed `0609571..39d08f5` → prod READY `dpl_7i7p…`). **`ONE-83` (second-project onboarding shortcut) is
  implemented + committed locally → In Review (1 unpushed) — the LAST Move #6 issue:** the activation
  onboarding (ONE-71 banner + ONE-66 checklist) now renders only when `!fullyActivated && isFirstProject`,
  where `isFirstProject` = this is the user's oldest project (`listProjects` is `createdAt desc` → oldest is
  last). Returning users skip the re-taught onboarding on later projects; first-project & brand-new (1-project)
  users are byte-identical; the per-project SetupGuide install/verify + the briefing + `createProject` redirect
  are unchanged. Server-side gate; no new query/dependency/schema; no accent creep; Overview 7.13 kB; 85
  tests/typecheck/lint/build green. **Next: await approval of ONE-83 → then `ONE-83` Done + the Move #6 Linear
  project → Completed. Do NOT create Move #7 or any new issue until explicitly authorized.** The broader
  product backlog (marketing / Paddle go-live) is separate.
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
- **"Active (5 min)"** KPI is a page-load snapshot, not a live stream — **now labelled honestly** (ONE-80:
  relabelled from "Active now"; the live-pulse/"live" wording removed).
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
- Branch **`main`** @ **`284357b`** — **Repository == Linear == GitHub == Production, fully synchronized.**
  **`ONE-83` shipped 2026-06-21** (`39d08f5..284357b` → prod READY `dpl_Drky…`, commit `284357b`); **Move #6 —
  Signup & Polish Linear project is Completed** (ONE-79…83 all Done & deployed). **Google OAuth provider
  configured + verified live (2026-06-21)** — no code change involved. **The only unpushed commit is this
  docs-memory reconciliation** (In Review; docs-only — no code/schema; **awaiting push approval**). Earlier
  ships: `ONE-82` (`0609571..39d08f5`); `ONE-81` (`da5c224..0609571`; the `recoveryEmailSentAt` column was
  applied to the live DB via the Supabase MCP); `ONE-80` (`d9d2662..da5c224`); `ONE-79` (`bd18f4a..d9d2662`);
  `ONE-78` (`08d9c54..bd18f4a`, Move #5 Completed); `ONE-76` (`988029a..08d9c54`); `ONE-77` (`11881aa..988029a`);
  `ONE-75` (`ccf51d4..11881aa`); `ONE-73` (`d31f176..ccf51d4`);
- **⚠️ Local `.env` DB password is INVALID (P1000)** — `prisma migrate deploy`/`migrate status` can't auth
  from this env; migrations are applied to the live DB via the **Supabase MCP** (`apply_migration` + a manual
  `_prisma_migrations` row with the file's sha256 checksum). Refresh the local DB password to restore the
  Prisma CLI flow.
  `ONE-74` (`2008314..d31f176`); `ONE-72` (`286e217..2008314`); `ONE-71` (`de4cb1a..286e217`, Move #4
  Completed); `ONE-70`
  (`a298b32..de4cb1a`); `ONE-69` (`18cf117..a298b32`); `ONE-68` (`1fe9b6a..18cf117`); `ONE-67`
  (`dd513f7..1fe9b6a`); 2026-06-20 `79badb8..5ef6850` (`ONE-63/64/65/66`); 2026-06-19 `ONE-24` (Move
  #1/#2/#3 + `ONE-45`). Future pushes to `main` still trigger a production deploy — get explicit go-ahead
  first.
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
