# DOCS-ORGANIZATION — Proposed documentation structure (recommendation only)

> **This is a proposal. No files are moved here.** Today all docs live at the repo root, which is
> fine while there are ~20 of them but will not scale. This recommends a future `docs/` tree and
> maps every existing document to its home — plus the cross-references that must be updated **when**
> a move is approved (moving files without fixing references would break the bootstrap flow).

---

## Why reorganize (later, not now)
- Discoverability: a newcomer (human or AI) should find "how it's built" / "how it should feel" /
  "how to operate it" without scanning 20 root files.
- Separation of **durable** docs (philosophy, architecture, decisions) from **running logs**
  (HANDOFF, TODO) and **ops** (deploy, env).
- Root stays clean: only the few entry points a fresh session needs immediately.

## Proposed structure
```
docs/
├─ product/         # why we exist, scope, future
│  ├─ PRD.md
│  ├─ PRODUCT-PHILOSOPHY.md
│  └─ ROADMAP.md
├─ architecture/    # how it's built + the rules + the record of choices
│  ├─ ARCHITECTURE.md
│  ├─ ENGINEERING-STANDARDS.md
│  └─ DECISIONS.md            # (or docs/decisions/ if it grows into many ADR files)
├─ design/          # how it should feel + the redesign program
│  ├─ DESIGN-SYSTEM.md
│  ├─ DESIGN-AUDIT.md
│  ├─ UX-REVIEW.md
│  └─ moves/
│     ├─ OVERVIEW-SPEC.md
│     └─ MOVE-1-IMPLEMENTATION-PLAN.md   # future: MOVE-2-…, MOVE-3-…
├─ operations/      # run it / ship it / charge for it
│  ├─ DEPLOY.md
│  ├─ ENVIRONMENT.md
│  └─ GO-LIVE.md
└─ process/         # session continuity + working agreement + logs
   ├─ AGENT-RULES.md
   ├─ HANDOFF.md
   └─ TODO.md

# Kept at repo ROOT for immediate discoverability by a fresh session:
README.md
SESSION-HANDOFF.md
NEW-CHAT-BOOTSTRAP.md
```

## Where each existing document goes
| Document | Proposed home | Rationale |
| --- | --- | --- |
| `PRD.md` | `docs/product/` | product scope |
| `PRODUCT-PHILOSOPHY.md` | `docs/product/` | principles |
| `ROADMAP.md` | `docs/product/` | future scope (never-build-now) |
| `ARCHITECTURE.md` | `docs/architecture/` | system design |
| `ENGINEERING-STANDARDS.md` | `docs/architecture/` | how we build |
| `DECISIONS.md` | `docs/architecture/` (or `docs/decisions/`) | ADRs |
| `DESIGN-SYSTEM.md` | `docs/design/` | how it should feel |
| `DESIGN-AUDIT.md` | `docs/design/` | approved critique |
| `UX-REVIEW.md` | `docs/design/` | earlier review (superseded in depth by the audit) |
| `OVERVIEW-SPEC.md` | `docs/design/moves/` | Move #1 spec |
| `MOVE-1-IMPLEMENTATION-PLAN.md` | `docs/design/moves/` | Move #1 plan |
| `DEPLOY.md` | `docs/operations/` | deploy runbook |
| `ENVIRONMENT.md` | `docs/operations/` | env vars |
| `GO-LIVE.md` | `docs/operations/` | revenue-ready checklist |
| `AGENT-RULES.md` | `docs/process/` | working agreement |
| `HANDOFF.md` | `docs/process/` | running log |
| `TODO.md` | `docs/process/` | task list |
| `SESSION-HANDOFF.md` | **root** | first file a fresh session reads |
| `NEW-CHAT-BOOTSTRAP.md` | **root** | pasted into fresh sessions |
| `README.md` | **root** | repo entry point |
| `DOCS-ORGANIZATION.md` | `docs/` (index) | this map / docs README |

> Note: `apps/web/README.md` and `packages/tracker/README.md` stay where they are (package-local
> docs belong with their package). The launch plan
> `~/.claude/plans/plan-what-need-to-prancy-wren.md` lives outside the repo — consider copying a
> sanitized version into `docs/product/` so it isn't lost.

## Keep at root (deliberately)
`README.md`, `SESSION-HANDOFF.md`, `NEW-CHAT-BOOTSTRAP.md`. These are the **entry points**; burying
them defeats their purpose. `README.md` should link into `docs/` and point a new session to
`SESSION-HANDOFF.md`.

## Migration checklist (do ALL of this in the same change that moves files)
Moving docs is only safe if every cross-reference is updated atomically:
1. **`NEW-CHAT-BOOTSTRAP.md`** STEP 1/STEP 4 paths → new `docs/...` locations.
2. **`SESSION-HANDOFF.md`** §5 source-of-truth table links → new paths.
3. **Cross-links between docs** (e.g. ARCHITECTURE ↔ DECISIONS ↔ DESIGN-SYSTEM) → new paths.
4. **`README.md`** → link the new `docs/` tree + the root entry points.
5. **`MEMORY.md`** pointer + any `~/.claude` memory that names a doc path.
6. **`AGENT-RULES.md`** / first-message file lists used to bootstrap sessions → new paths.
7. Re-run a fresh-session dry run with `NEW-CHAT-BOOTSTRAP.md` to confirm nothing 404s.
8. Use `git mv` (preserve history); one commit, docs-only, clearly titled.

## Sequencing recommendation
Do this **between Moves** (e.g. after Move #1 completes), not mid-phase — a docs reshuffle during
an approved code phase adds noise and risk. It is a pure-docs, additive change and should be its
own approved task. Until then, **leave everything at root** (this file included).
