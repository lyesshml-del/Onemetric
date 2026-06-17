# LINEAR-WORKFLOW — OneMetric

> How OneMetric uses **the repository as permanent memory** and **Linear as the execution
> system**. Read this with `SESSION-HANDOFF.md` / `NEW-CHAT-BOOTSTRAP.md`. If Linear and the
> repo ever disagree about *what's true*, **the repo + the code win** (then fix Linear).

---

## 1. The two-system model

| | Repository (`*.md` + code) | Linear |
| --- | --- | --- |
| **Role** | **Memory** — the durable *why*, *how*, and *what's decided* | **Execution** — the live *what's next* and *who/what state* |
| **Holds** | Architecture, design system, product philosophy, engineering standards, decisions (ADRs), specs, the phased plan, the running log | Initiatives (as projects), phase issues, debt/cleanup/deferred tasks, sub-issues, status, priority |
| **Source of truth for** | Reasoning, constraints, invariants, history | Sequencing, progress, backlog |
| **Updated** | In the same change that changes reality | As work moves through states |

**Rule:** the repo is authoritative for *truth*; Linear is authoritative for *workflow*. Every
issue links back to the repo docs (e.g. `OVERVIEW-SPEC.md`, `DECISIONS.md` ADR-xxx) rather than
restating them.

---

## 2. Structure inside Linear

- **Team:** `OneMetric` (key `ONE`; issues are `ONE-<n>`).
- **"Initiatives" → Projects.** This Linear (via MCP) can't *create* initiatives, so the 9
  parent initiatives are modeled as **Projects**. If true Linear Initiatives are wanted later,
  group these projects under one manually — the structure already supports it.
- **Phases / tasks → Issues.** Each Move #1 phase and each unit of work is an Issue.
- **Multi-step work → Sub-issues** (parent issue + children), e.g. Go-live and Cleanup.

### The 9 projects
| Project | Holds |
| --- | --- |
| **Move #1 — Opinionated Overview** | The Overview redesign, phases **0 → J** (ONE-5…15). *In Progress.* |
| **Move #2 — Feel & Performance** | Motion/perceived-speed work (optimistic UI, skeletons, transitions). *Not started — needs a plan.* |
| **Move #3 — Identity & Craft** | The single signature **accent** + craft (unify specs, logomark, fix legacy chart). **All accent/identity work lives here.** |
| **Marketing Site** | Public site + legal pages; conversion polish; legal review. |
| **Billing** | OneMetric's own Paddle subscription billing; **Go-live** parent + sub-issues. |
| **Onboarding** | First-run activation (signup → first tracked event). |
| **Tracker** | The cookieless tracking script; maintenance. |
| **Reports** | Weekly templated email reports (done). |
| **Launch** | Pre-launch cleanup, compliance (ANPDP), repo-visibility, monitoring, smoke tests. |

### Parent → sub-issue examples
- **Go live with Paddle (ONE-17)** → payout details · prod product/price · prod token+API key ·
  webhook+domain · Vercel env+redeploy · prod smoke test.
- **Pre-launch DB cleanup (ONE-18)** → reset supradz14 billing · remove test ReportSubscription ·
  remove DataFast smoke analytics · remove unconfirmed auth users.

---

## 3. Labels

Workspace defaults: **Feature**, **Improvement**, **Bug**. Added for OneMetric:

| Label | Meaning |
| --- | --- |
| `launch-blocker` | Must be resolved before the first paying client (payout, legal, prod billing, cleanup). |
| `tech-debt` | Known engineering shortcut/limitation to revisit. |
| `design-debt` | A design inconsistency (e.g. legacy distorting chart, card-system drift). |
| `ux-debt` | A known UX gap (onboarding, mobile, conversion). |
| `cleanup` | Removing transitional/test artifacts. |
| `deferred` | Real work intentionally postponed (with a reason). |
| `docs` | Documentation work / documentation debt. |

Use **one or two** labels per issue — enough to filter, not to decorate.

---

## 4. Priorities

Linear scale: **1 Urgent · 2 High · 3 Medium · 4 Low · 0 None**. How we apply it here:
- **Urgent (1):** the literal revenue gate — `Add Paddle payout details`, `Go live`.
- **High (2):** launch-blockers + the active Move #1 phase + high-leverage UX (activation, legal).
- **Medium (3):** normal phased work + meaningful polish.
- **Low (4):** nice-to-haves, maintenance, far-future (most Move #2/#3 items until planned).
- **None (0):** completed records and sub-steps whose parent already carries the priority.

---

## 5. States & the phase workflow

Statuses: **Backlog → Todo → In Progress → In Review → Done** (+ Canceled / Duplicate).

OneMetric maps the **approval-gated phase workflow** (`ENGINEERING-STANDARDS.md` ADR-021) onto
them:
- **Backlog** — not yet up next (future phases, deferred work).
- **Todo** — the next thing to do (e.g. the next Move #1 phase) — *do not start without approval.*
- **In Progress** — actively being implemented this turn.
- **In Review** — **implemented + verified + committed locally, awaiting the user's approval**
  (the natural end-state of a phase in this workflow). *Current example: Phase G (ONE-12).*
- **Done** — approved/merged-equivalent.

So at any moment there is **at most one** phase In Progress/In Review; everything ahead is Todo/
Backlog. (Move #1 today: 0–F Done, **G In Review**, **H Todo**, I/J Backlog.)

---

## 6. Cycles

**None configured** (the MCP doesn't create them; the project is solo/AI-paced). Philosophy:
- This project runs **phase-by-phase, not sprint-by-sprint** — "one approved phase per turn" is
  the real cadence, so fixed time-boxed cycles add little right now.
- If a steady weekly rhythm forms (or collaborators join), enable Cycles in Linear team settings
  and pull the top Todo items into the active cycle. Until then, **priority + state** are the
  scheduler.

---

## 7. Backlog philosophy

- **Everything real is tracked, nothing is hidden.** Debt (tech/design/UX/docs), deferred work,
  cleanup, and temporary states are issues — not tribal knowledge. The Move #1 transitional
  states are encoded (Phase J + specific debt issues).
- **The backlog is honest, not aspirational.** An item is here because we genuinely intend to do
  it, with a reason; if it's truly out of scope it belongs in `ROADMAP.md` (V2+), **not** Linear.
- **One active front.** Pull from Todo into In Progress one phase at a time; keep `main` shippable.
- **Launch-blockers are visible.** Filter `label:launch-blocker` to see exactly what stands
  between today and the first paying customer.
- **Records of done work** (e.g. Billing groundwork, Reports) stay as Done issues for context —
  Linear is also a history, not just a queue.

---

## 8. How future sessions should use Linear

1. **Ground in the repo first** (memory): `SESSION-HANDOFF.md` → `MOVE-1-IMPLEMENTATION-PLAN.md`
   → the relevant spec → `ENGINEERING-STANDARDS.md`. Linear tells you *what's next*; the repo
   tells you *why and how*.
2. **Find the active work in Linear:** the project `Move #1 — Opinionated Overview` →
   the **Todo** phase (today: **ONE-13 / Phase H**). Read its purpose, acceptance criteria, DoD,
   and "what must remain unchanged".
3. **Confirm with the user, then implement that one phase** (additive, `main` shippable). Move
   the issue **In Progress** while working.
4. **Verify** (`test · typecheck · lint · build` + DB check, never touching DataFast), **update
   the issue** (and `TODO.md` / `HANDOFF.md` / `SESSION-HANDOFF.md`), **commit locally**, set the
   issue **In Review**, and **stop for approval.**
5. **On approval:** set the issue **Done** and advance the next phase from Backlog → Todo.
6. **New debt/ideas discovered mid-work?** File a Linear issue in the right project with the full
   template (purpose · reasoning · constraints · what-must-remain-unchanged · verification ·
   risks · future implications). Don't let it live only in your head or the chat.
7. **Never rely on conversation history** — re-derive everything from the repo + Linear.

### Agent mechanics (Linear MCP)
- Reference issues by identifier (`ONE-13`). Read with `get_issue` / `list_issues`; update with
  `save_issue` (state, labels, priority, parentId, project). Create sub-issues via `parentId`.
- The agent **can and should keep Linear current** as part of each phase's Definition of Done —
  but **creating/moving issues is workflow, not implementation**; it doesn't bypass the
  approval gate for *code*.

---

## 9. Issue template (every issue carries this)
`Purpose` · `Reasoning` · `Constraints` · `What must remain unchanged` · `Verification steps` ·
`Risks` · `Future implications` (+ `Acceptance criteria` / `Files` / `DoD` for build phases).
This mirrors the repo's phase discipline so an issue is actionable cold, without the chat.

---

## 10. Quick map (today)
- **Active:** `ONE-12` Phase G (In Review) → **next** `ONE-13` Phase H (Todo).
- **Revenue gate:** `ONE-17` Go live (Urgent) + `ONE-26` payout (Urgent) → first paying client.
- **Launch-blockers:** `label:launch-blocker` (payout, go-live, cleanup, legal review, ANPDP).
- **Future Moves:** `Move #2` (feel) then `Move #3` (the accent/identity) — both need their own
  approved plan before any phase starts.
