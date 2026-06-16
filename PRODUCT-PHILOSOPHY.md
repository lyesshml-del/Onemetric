# PRODUCT-PHILOSOPHY — OneMetric

> Principles for anyone (human or AI) building OneMetric. Written like a founder handing
> principles to future employees. Grounded in `PRD.md`, `ROADMAP.md`, `AGENT-RULES.md`, and the
> approved design docs. These principles outrank any single feature request.

---

## Why OneMetric exists
Modern analytics is either **bloated and creepy** (heavy, cookie-laden, privacy-hostile,
enterprise-priced) or **too thin to be useful.** OneMetric exists to give indie hackers and
small SaaS founders **simple, affordable, privacy-first analytics** that answer the only
questions that matter — *is it growing, where does traffic come from, what converts, what makes
money* — in seconds, installed in under a minute.

## Who it is for
- **Indie hackers and small SaaS founders.** Technical enough to paste a `<script>` tag, busy
  enough to need answers at a glance, principled enough to care about visitor privacy and cost.
- **Not** for enterprise data teams, not for marketers who want 200 configurable dashboards.
  Serving everyone would betray the people we're for.

## What problems it solves
- **One-minute install** — a single JS snippet, no tag manager, no cookie banner.
- **The real questions** — visitors/sessions/pageviews, top pages/referrers/countries/devices,
  custom events, **conversion funnels**, **revenue attribution** (PayPal), **weekly email
  reports**. (See `PRD.md` for the V1 scope.)
- **Privacy without lawyers** — cookieless by design, so customers generally don't need an
  analytics cookie banner.
- **Affordability** — low infrastructure cost (Postgres + serverless) passed on as a simple
  Free/Pro price.

## What it deliberately refuses to become
- **Not a surveillance tool.** No cross-site tracking, no fingerprinting, no selling data, no PII
  hoarding.
- **Not an enterprise BI suite.** No infinite configurability, no query builder maze, no
  dashboard sprawl.
- **Not an AI product.** Reports and insights are **templated, deterministic** — no LLM in the
  product (it would add cost, latency, nondeterminism, and privacy surface for no real gain).
- **Not a feature checklist chaser.** We say no far more than yes. (V2+ ideas live in
  `ROADMAP.md` and are **not** built until explicitly promoted.)

## The "Linear of analytics" vision
Linear isn't loved for having the most features — it's loved for **opinions, speed, and
restraint.** The analytics equivalent: don't show every metric equally; **say the one thing that
changed** ("traffic +18% this week, led by Product Hunt, 4.2% signup conversion, $340 from
newsletter") and let people drill. Be fast and calm. Be unmistakably *designed*. That is the
north star for every UI decision (see `DESIGN-AUDIT.md`, `OVERVIEW-SPEC.md`).

## Simplicity over feature bloat
Every feature is a tax on clarity, performance, and maintenance. The default answer to "can we
add X?" is **no** unless X serves the core questions for our core user. Remove before adding.
A smaller product that answers the real question in 10 seconds beats a bigger one that buries it.

## Opinionated defaults
Users should get value **without configuration.** Smart defaults over knobs: a sensible date
range, an auto-written summary, a suggested funnel, the right metrics promoted and the vanity
ones demoted. Configuration is a last resort, not a first screen.

## Privacy-first philosophy
Privacy is a **product principle, not a compliance afterthought.** We collect the minimum:
no cookies, no persistent identifiers, **no raw IP stored**, derived country/device/browser only.
Visitors are counted via a **daily-rotating salted hash** that cannot track a person across days
or sites. If a feature requires eroding this, we redesign the feature — e.g. we use **monogram
avatars instead of third-party favicon services** so we never leak our customers' visited domains
to a third party (decision D1).

## Cookieless philosophy
Cookieless is the differentiator and the ethic. Because OneMetric sets/reads **nothing** on a
visitor's device, sites using it generally **don't need a cookie banner for analytics** (EU
ePrivacy Directive Art. 5(3)). We protect this property fiercely; it is a reason customers
choose us.

## European hosting philosophy
Customer analytics data is **hosted and processed in the EU** (Supabase `eu-central-1`). This is
a deliberate trust + compliance posture (GDPR-friendly, data-residency clarity). Sub-processors
are kept few and named (Supabase, Vercel, Resend, the payment provider). *Operational note: the
founder/controller is Algeria-based, which creates a cross-border-transfer obligation requiring
ANPDP authorization — a launch-blocking legal item tracked in `HANDOFF.md`/`DEPLOY.md`.*

## UX principles
- **Answer first, detail second.** The Overview is a briefing (headline → evidence → footnotes).
- **Calm and factual.** No hype, no marketing voice, no dark patterns, no fake urgency.
- **Fast and feels fast.** Server-first; perceived speed matters as much as real speed.
- **One protagonist per screen.** Decide what *not* to emphasize.
- **Honest empty/loading states.** Never broken-looking; guide the next action.
(See `DESIGN-SYSTEM.md` for how this is expressed.)

## Long-term roadmap philosophy
- **V1 is deliberately small and finished.** New ideas go to `ROADMAP.md` and are **not built**
  until explicitly promoted into scope — this is a hard rule (`AGENT-RULES.md`).
- **Earn the right to add.** Polish and trust (the Move #1/#2/#3 design arc) come before breadth.
- **Sequenced, not piled on.** Big changes ship as small, approved, additive phases that keep
  `main` shippable — quality and maintainability over speed.
- **Revenue legitimately, then grow.** Charge a fair, simple price (Free/Pro via a
  Merchant-of-Record), keep infra cheap, and stay independent of surveillance-ad incentives.
