# UX / UI Review — OneMetric (2026-06-15)

> **Suggestions only — nothing here is implemented.** Per `AGENT-RULES.md`, new ideas are
> recorded, not built. When you want to act on any of these, promote them into `TODO.md`
> (or `ROADMAP.md` for the larger ones) and we'll do them one at a time.
>
> **Scope caveat:** this is assessed from the pages I've actually seen rendered (billing,
> checkout) plus reading the code for the marketing site, dashboard, and auth. A full visual
> pass (viewing every page on desktop **and** mobile) would sharpen this — happy to do that
> with the preview/browser tools when you want.
>
> Note: the "Activer Windows" watermark in screenshots is your **OS**, not the app — ignore it.

---

## Overall impression
The design is **clean, minimal, dark-first, and on-brand** with the Stripe/Linear/Vercel/PostHog
references — exactly the intended direction. shadcn/ui + Tailwind gives consistent, professional
components, and keeping charts dependency-free keeps it fast and light. For an MVP it looks
**credible and trustworthy**, which is what matters for converting a first paying customer.
The gaps are mostly about **polish, conversion, and activation**, not fundamentals.

Rating (rough): **solid 7/10** — good bones, a few high-leverage improvements away from "premium".

---

## ✅ What's working
- Consistent dark theme, good use of cards, restrained color — feels modern, not cluttered.
- Dependency-free SVG charts and server-first rendering → fast.
- Sensible information architecture (Overview / Events / Funnels / Revenue / Reports / Settings).
- Empty states exist and point users to the next action (install snippet, `track()` docs).
- Marketing site covers the essentials (hero, features, pricing, legal) with a clear privacy angle.

---

## 🎯 High-leverage improvements (most value for least effort)

### 1. Onboarding / activation flow (biggest win)
Right after signup the user faces a blank dashboard. An analytics tool lives or dies on
**activation** (getting the snippet installed + first event). Consider a short **guided
checklist** (ironically, like Paddle's own "Get started 2/2"): _Create project → Copy snippet
→ Install → "Waiting for first event…" → ✅ Live_. A live "waiting for your first pageview"
state with a spinner that flips to success is very satisfying and reduces drop-off.

### 2. Pricing page conversion polish
- Add a short **FAQ** (refunds, cancellation, data location, "do I need a cookie banner?").
- Make the **7-day free trial** and "no credit card surprises / cancel anytime" prominent.
- A single, obvious primary CTA per plan; de-emphasize the Free CTA visually vs Pro.

### 3. Trust signals on the landing page
- Even one or two small things: a "privacy-first / EU-hosted / cookieless" badge row, a sample
  dashboard screenshot, or a short "how it works in 60 seconds". Social proof (a logo or quote)
  later. This lifts credibility for a cold visitor deciding to sign up.

### 4. Mobile pass on data tables
- The Events / Revenue / Recent-payments tables can overflow on narrow screens. Verify they
  scroll or reflow gracefully (horizontal scroll container or stacked rows on mobile).

### 5. Perceived performance / loading states
- The Upgrade button briefly shows "Loading…" while Paddle.js initializes — fine, but a
  subtle skeleton or disabled-with-spinner reads more premium. Same idea for dashboard cards
  if any data fetch is slow.

---

## ✨ Medium polish (nice, not urgent)
- **Branding:** a small logomark next to the "OneMetric" wordmark (header + favicon) adds
  identity. Currently a text wordmark.
- **Charts:** the bar chart is intentionally minimal; a timeseries **area chart with a subtle
  gradient + hover tooltip** would feel closer to PostHog/DataFast — but weigh against the
  "no charting dependency" decision (a tiny custom tooltip keeps it dependency-free).
- **Billing page:** the upgrade card is plain; showing a compact Free-vs-Pro value reminder
  (or the limits the user is hitting) makes the upgrade more motivated.
- **Consistency sweep:** unify card padding, section spacing, and heading sizes across
  dashboard vs marketing for one coherent scale.
- **Number formatting / tabular-nums** on all metrics (already used in places) for clean
  alignment.

---

## ♿ Accessibility & quality (worth a quick audit)
- Color contrast on muted-foreground text against the dark background (WCAG AA).
- Visible **focus states** on all interactive elements (keyboard nav).
- `aria-label`s on icon-only buttons; alt text on any images.
- Respect `prefers-reduced-motion` if animations are added.

---

## 🔭 Larger / later (→ consider ROADMAP, not now)
- Optional **light mode** toggle (dark-first is fine; some users prefer light).
- Richer dashboard **interactions** (date-range presets + custom range, comparison vs previous
  period, per-metric drill-downs).
- A polished **first-run product tour**.

---

## Suggested order if/when you act on this
1. Onboarding checklist + "waiting for first event" state (activation).
2. Pricing FAQ + trial prominence (conversion).
3. Mobile table pass + focus/contrast audit (quality).
4. Landing trust signals + logomark (credibility).
5. Chart tooltip / area chart (polish).

Pick one and we'll scope it into `TODO.md` and build it properly.
