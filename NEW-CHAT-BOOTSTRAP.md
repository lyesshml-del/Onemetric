# NEW-CHAT-BOOTSTRAP

> **Purpose:** paste the block below into a brand-new Claude/AI session that has **zero memory**
> of this project. It forces the session to rebuild its understanding from the **repository**, not
> from conversation history, and to proceed safely under OneMetric's rules.
>
> (Everything outside the fenced block is guidance for the human pasting it.)

---

## Paste this into the fresh session ⬇️

```
You are continuing work on OneMetric, a live production SaaS. You have NO reliable memory of this
project — do not assume anything from training or prior chats. The REPOSITORY is the single source
of truth. Rebuild your understanding from the files before doing anything.

STEP 1 — Read these in order, fully, before proposing any action:
  1. SESSION-HANDOFF.md      ← current state, current phase, exact next step, "never do" list
  2. AGENT-RULES.md          ← working rules + current phase
  3. PRODUCT-PHILOSOPHY.md   ← why/for-whom; what we refuse to build
  4. ENGINEERING-STANDARDS.md← how we build (server-first, additive, phase-gated, verification)
  5. ARCHITECTURE.md         ← how the system is built
  6. DESIGN-SYSTEM.md        ← how it should feel (+ DESIGN-AUDIT.md, OVERVIEW-SPEC.md)
  7. DECISIONS.md            ← why the big choices were made (don't relitigate them)
  8. MOVE-1-IMPLEMENTATION-PLAN.md ← the approved phased plan currently in progress
  9. HANDOFF.md + TODO.md    ← the detailed running log + task list (most recent truth)

SOURCE-OF-TRUTH documents (authoritative): PRD.md, AGENT-RULES.md, ROADMAP.md, PRODUCT-PHILOSOPHY.md,
DESIGN-AUDIT.md, OVERVIEW-SPEC.md, MOVE-1-IMPLEMENTATION-PLAN.md, DESIGN-SYSTEM.md,
ENGINEERING-STANDARDS.md, DECISIONS.md, ARCHITECTURE.md. Running log: HANDOFF.md, TODO.md.
Ops: DEPLOY.md, ENVIRONMENT.md, GO-LIVE.md. If a doc and the code disagree, the CODE wins — then
fix the doc.

STEP 2 — Determine the current state and the next phase WITHOUT guessing:
  - Read the "Current phase & exact next step" section of SESSION-HANDOFF.md.
  - Cross-check the checkboxes in TODO.md (the "Move #1 — Opinionated Overview" section) to see
    which phases are done ([x]) and which is next ([ ]).
  - The next phase is the first unchecked phase in MOVE-1-IMPLEMENTATION-PLAN.md's order
    (0 → A → B → C → D → E → F → G → H → I → J). Read that phase's spec in the plan AND the
    matching section of OVERVIEW-SPEC.md before writing anything.

STEP 3 — Rules you must NEVER violate:
  - Never implement V2+ / ROADMAP.md features (session replay, heatmaps, A/B, feature flags,
    AI reports, SEO tracking, alerts, Stripe-as-customer-revenue). V1 scope only.
  - Never start, skip, or combine phases without the user's explicit approval. ONE phase per turn,
    then STOP and wait.
  - Never push or deploy without explicit approval (a push to main triggers a Vercel deploy).
  - Never make the GitHub repo private unless the Vercel GitHub App already has private-repo access
    (otherwise every deploy goes BLOCKED).
  - Never delete or mutate the live "DataFast" project/account data — it is a real user's data.
    Verify with throwaway seed rows via the Supabase MCP and delete them.
  - Never add a dependency, a schema migration, or the accent color (Move #3) without approval.
  - Never rely on conversation memory — re-derive from the repo every time.

STEP 4 — How to proceed safely for the approved phase:
  - Implement ONLY that phase. Strictly ADDITIVE. Keep main shippable. Stay monochrome
    (accent = Move #3). Reuse the Phase 0 foundations (lib/format Delta helpers, lib/range
    previousRange, the <Delta> component, lede types).
  - Definition of Done: cd apps/web && npm run test && npm run typecheck && npm run lint &&
    npm run build  — all green; verify any numbers against the live DB via the Supabase MCP
    (seed-and-delete, never touch DataFast); update TODO.md + HANDOFF.md; commit locally as ONE
    reviewable commit; DO NOT push; then STOP and report (files changed, reasoning, risks,
    verification, future-phase notes) and wait for approval.

STEP 5 — Before you touch code, restate to the user: (a) the current phase you believe is next and
why (cite TODO.md + the plan), (b) exactly what you will and will NOT change, (c) the open decision
relevant to that phase (e.g. D1 = monogram avatars, no third-party favicons). Wait for confirmation.

Begin with STEP 1. Do not write code until you have read the files and confirmed the phase.
```

## ⬆️ End of paste block

---

### Notes for the human
- This bootstrap deliberately points the session at **files, not memory.** If you've added new
  source-of-truth docs, add them to STEP 1.
- The single most important file is **`SESSION-HANDOFF.md`** — keep it current after every phase.
- If the project has moved past Move #1 (all of A–J done), update STEP 2/STEP 4 to point at the
  next Move (Move #2, then Move #3) and their plans.
