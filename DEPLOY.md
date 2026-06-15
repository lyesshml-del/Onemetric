# OneMetric — Production Deploy Runbook

Step-by-step to ship OneMetric to production on Vercel. Items marked **(you)** are
account/dashboard actions only you can do; the rest is already in the repo.

Stack: Next.js 15 (monorepo, app in `apps/web`) · Supabase (Postgres + Auth, EU
`eu-central-1`) · Vercel · Resend (email). Billing (MoR) is wired separately — see the
launch plan.

---

## 0. Prerequisites

- The repo is initialized and committed locally (`git`), default branch `main`.
- Supabase project **OneMetric** already exists (`ref ladsqshpcdyjruzohkvb`) with the schema
  migrated (`0_init` + `20260614000000_add_billing`).

## 1. Push to GitHub **(you)**

`gh` isn't installed here, so create the repo and push manually:

```bash
# create an EMPTY repo named "onemetric" on github.com, then:
git remote add origin https://github.com/<you>/onemetric.git
git push -u origin main
```

## 2. Create the Vercel project **(you)**

Import the GitHub repo in Vercel, then set:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| **Root Directory** | `apps/web` |
| Include files outside root directory | **On** (needed for the npm workspace install) |
| Build command | *(default)* `next build` |
| Install command | *(default)* `npm install` |
| Output | *(default)* |
| Node.js version | 20 (matches `.nvmrc` / `engines`) |

> The cron schedule lives in `apps/web/vercel.json` (Mondays 09:00 UTC) and is picked up
> automatically because Root Directory is `apps/web`.

> **Tracker note:** the built tracker `apps/web/public/onemetric.js` is committed, so the
> app deploys standalone. If you ever change `packages/tracker`, run
> `npm run build:tracker` and commit the updated file before deploying.

## 3. Environment variables (Vercel → Settings → Environment Variables) **(you)**

Add all of these for Production (and Preview if you want preview deploys to work):

| Variable | Value / where to get it |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://app.onemetric.xyz` (drives the install snippet + webhook URLs) |
| `DATABASE_URL` | Supabase **transaction pooler** (6543) — see below |
| `DIRECT_URL` | Supabase **session pooler** (5432) — see below |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ladsqshpcdyjruzohkvb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → publishable key |
| `VISITOR_HASH_SALT` | **generate fresh** (don't reuse dev) — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CREDENTIALS_KEY` | **generate fresh** 32-byte hex (same command) |
| `CRON_SECRET` | **generate fresh** — `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |
| `RESEND_API_KEY` | Resend dashboard (Step 6) |
| `REPORT_FROM_EMAIL` | e.g. `OneMetric <reports@yourdomain>` (Resend-verified) |

Connection strings (replace `[PASSWORD]` with the **rotated** DB password from Step 4):

```
DATABASE_URL="postgresql://postgres.ladsqshpcdyjruzohkvb:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.ladsqshpcdyjruzohkvb:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

## 4. Rotate the database password **(you)**

The dev DB password was shared in plaintext during development — rotate it before launch:
Supabase → Project Settings → Database → **Reset database password** → update
`DATABASE_URL` + `DIRECT_URL` in Vercel (and your local `apps/web/.env`).

## 5. Supabase Auth for production **(you)**

- Authentication → URL Configuration → **Site URL** = your production URL; add it to
  **Redirect URLs** (signup confirmation redirects to `<APP_URL>/auth/confirm`).
- Authentication → Emails / SMTP → configure **custom SMTP** (e.g. Resend SMTP). The
  built-in mailer is rate-limited and not for production.
- Consider upgrading off the **free tier** (free projects pause on inactivity).

## 6. Resend (email) **(you)**

- Verify a sending domain, create an API key → set `RESEND_API_KEY`.
- Set `REPORT_FROM_EMAIL` to a verified address. Without the key, weekly reports are
  skipped (the app no-ops safely).

## 7. Abuse protection — Vercel WAF **(you)**

Vercel → Project → Firewall → add a **rate-limit rule** on `POST /api/collect` (e.g. per-IP
burst). Optionally protect `/api/webhooks/*`. No app code needed.

## 8. First deploy & smoke test

After the first deploy, verify:

- [ ] Marketing pages load: `/`, `/pricing`, `/privacy`, `/terms`; `/robots.txt`,
      `/sitemap.xml`, `/opengraph-image` resolve.
- [ ] `/onemetric.js` is served.
- [ ] Sign up → confirmation email arrives (custom SMTP) → `/auth/confirm` → dashboard.
- [ ] Create a project, install the snippet on a test site, confirm pageviews + a
      `onemetric.track()` event appear; build a funnel.
- [ ] Cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://<APP_URL>/api/cron/weekly-reports`
      returns `{ok:true,...}`; without the header → `401`.

## 9. Billing — Paddle (built + sandbox-verified; go-live = config only)

Provider = **Paddle** (Algeria seller approved). Checkout (Paddle.js overlay, 7-day trial),
`POST /api/webhooks/paddle` (signature verify → syncs `User.plan`), and the customer portal
are all built and verified in sandbox. To go live:

1. In **production** Paddle (`vendors.paddle.com`): create the **OneMetric Pro** product +
   **$19/mo recurring price w/ 7-day free trial** (note the prod `pri_…`).
2. **Developer Tools → Authentication:** create a **client-side token** and an **API key**
   (API key scopes: **Customer portal sessions: Write** + **Customers: Read+Write**).
3. **Developer Tools → Notifications:** create a webhook destination → `<APP_URL>/api/webhooks/paddle`,
   usage **Both**, all **subscription.\*** events; copy its **signing secret**.
4. **Checkout → Checkout settings:** add your domain to **approved domains** (else the overlay
   errors "Something went wrong").
5. Set the Vercel env vars (production values) and redeploy:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_PADDLE_ENV` | `production` |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | production client-side token |
| `NEXT_PUBLIC_PADDLE_PRICE_PRO` | production `pri_…` |
| `PADDLE_API_KEY` | production API key (scopes above) |
| `PADDLE_WEBHOOK_SECRET` | production webhook signing secret |

6. **Add payout details** (Business Account → Payouts) — SWIFT to USD/EUR or PayPal.

## 10. Deploy gotchas (learned the hard way — 2026-06-15)

- **Keep the GitHub repo PUBLIC.** Private → every deploy goes **`BLOCKED`** (no build) unless
  the Vercel GitHub App has private-repo access (GitHub → Settings → Applications → Vercel).
- **Root Directory is `apps/web`** → commits that change no files there (empty / root-only doc
  commits) are **auto-skipped** (`CANCELED`, no build). Change a file under `apps/web` to force
  a deploy. A `BLOCKED` deploy can't be redeployed — push a fresh commit.
- `NEXT_PUBLIC_*` env vars are build-time inlined — **redeploy after changing them**.

## 11. Still pending (tracked elsewhere)

- **PayPal** (customer revenue): test the webhook against a real PayPal app/sandbox.
- **Legal review**: have counsel review `/privacy` + `/terms` + `/refund`; complete the
  **ANPDP cross-border transfer** authorization (Algeria) — see HANDOFF.md.
