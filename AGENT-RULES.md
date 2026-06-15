# Current Phase

**Launch.** The Version 1 MVP is complete and LIVE in production, plus accepted launch-prep
scope: Paddle subscription billing, public marketing site + legal pages, tests + CI, deploy,
and post-deploy hardening. See `plan-what-need-to-prancy-wren.md`, `TODO.md`, `HANDOFF.md`.

Still **never implement Version 2 or later** ROADMAP items (session replay, heatmaps, A/B,
feature flags, AI reports, SEO tracking, alerts, Stripe customer-revenue integration).

---

# Stack

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Prisma
- PostgreSQL
- Supabase Auth
- Vercel

---

# UI

Dark mode first.

Premium appearance inspired by:

- Stripe
- Linear
- Vercel
- PostHog
- DataFast

Responsive.

Fast.

Minimal.

---

# Code Quality

Strict TypeScript.

Use reusable components.

Avoid unnecessary dependencies.

Refactor before adding complexity.

Maintain production quality.

Never break existing features.

Prefer server actions.

---

# Workflow

Always update:

- TODO.md
- HANDOFF.md

If new ideas appear:

Add them to ROADMAP.md.

Do not implement them.

---

# Behavior

Analyze before coding.

Explain major decisions.

Wait for approval before major architectural changes.
