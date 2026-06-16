# 🚀 GO-LIVE — OneMetric is revenue-ready (config only)

> **Status (2026-06-15):** The product is **LIVE** at https://onemetric.sbs and the Paddle
> subscription billing is **fully built and verified end-to-end in sandbox**. There is **no
> code left** to start charging customers — only **Paddle production config + payout details**.
> Until the steps below are done, **you cannot actually collect money.**

This file is the single reminder for the last mile. Work top to bottom.

---

## ⛔ The two things blocking real revenue

### 1. Add Paddle **payout details**  ← do this first
- Paddle → **Business Account → Payouts** → add a payout method.
- Algeria options: **SWIFT wire** to a USD/EUR bank account, or **PayPal**.
- This is the real "can the money actually reach me in Algeria" check. Without it, even a
  successful charge has nowhere to land.

### 2. **Go live** in production Paddle (`vendors.paddle.com`)
Currently everything is wired to **Sandbox**. To switch to real payments:

- [ ] **Catalog → Products:** create **OneMetric Pro** + a **$19/mo recurring price with a
      7-day free trial** → note the **production `pri_…`** (different from the sandbox one).
- [ ] **Developer Tools → Authentication:** create a **client-side token** and an **API key**.
      API key scopes **must include**: **Customer portal sessions → Write** + **Customers →
      Read+Write** (missing the portal scope = 403 on "Manage billing").
- [ ] **Developer Tools → Notifications:** create a webhook destination →
      `https://onemetric.sbs/api/webhooks/paddle`, **usage = Both**, all **subscription.\***
      events → copy its **signing secret**.
- [ ] **Checkout → Checkout settings:** add **`onemetric.sbs`** to **approved domains**
      (without it the checkout overlay errors "Something went wrong").
- [ ] **Vercel → Settings → Environment Variables** — set these to the **production** values,
      then **redeploy** (`NEXT_PUBLIC_*` are build-time, so a redeploy is required):

  | Variable | Value |
  | --- | --- |
  | `NEXT_PUBLIC_PADDLE_ENV` | `production` |
  | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | production client-side token |
  | `NEXT_PUBLIC_PADDLE_PRICE_PRO` | production `pri_…` |
  | `PADDLE_API_KEY` | production API key (scopes above) |
  | `PADDLE_WEBHOOK_SECRET` | production webhook signing secret |

- [ ] **Smoke test in production** with a real card (then refund), or trust the sandbox proof:
      Upgrade → checkout → webhook → `User.plan = PRO`.

---

## 🧹 Before onboarding the first real client (cleanup)
- [ ] Reset **`supradz14@gmail.com`** to FREE — it's PRO/trialing from the *sandbox*
      subscription (sandbox-only `ctm_…`/`sub_…` ids). The agent can run the SQL via Supabase MCP.
- [ ] Remove other test data: test `ReportSubscription` (supradz14) + DataFast smoke-test
      analytics + unconfirmed `adembensari7@gmail.com` auth users. (See `TODO.md` → Cleanup.)

---

## ✅ Already done (so you don't redo it)
- Paddle account, **verification PASSED** (Algeria seller approved).
- Full billing code: Paddle.js checkout (7-day trial), webhook (signature verify → syncs
  plan/status/period/customer/subscription ids), customer portal, cancel (both modes).
- Sandbox end-to-end **verified**: upgrade → PRO, portal opens, cancel → FREE. 48 tests green.
- Email, WAF rate-limit, custom domain, `/api/collect` 500-hardening — all done & verified.

## 📌 Also pending (not revenue-blocking, but before scaling)
- Professional **legal review** of `/privacy` `/terms` `/refund` + Algeria **ANPDP
  cross-border transfer** authorization.
- **PayPal** customer-revenue webhook test against a real/sandbox PayPal app.

> Full details + the runbook live in `DEPLOY.md` (§9 Paddle, §10 gotchas), `HANDOFF.md`
> (RESUME section), and `TODO.md` (Phase 9 remaining / Cleanup).
