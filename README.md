# OneMetric

Simple, affordable, all-in-one analytics for indie hackers and SaaS founders.

> **Current phase:** Version 1 (MVP). Only V1 features are built. Future ideas live in
> [`ROADMAP.md`](./ROADMAP.md) and must not be implemented.

## Monorepo layout

```
onemetric/
├── apps/
│   └── web/            # Next.js 15 app (dashboard + ingestion API)
├── packages/
│   └── tracker/        # Standalone embeddable tracking script (Phase 3)
├── PRD.md              # Product requirements
├── ROADMAP.md          # Future versions (do NOT implement)
├── AGENT-RULES.md      # Engineering rules / stack
├── TODO.md             # Living task list
└── HANDOFF.md          # Session handoff / current status
```

Uses **npm workspaces** — no extra monorepo tooling.

## Stack

Next.js 15 · TypeScript (strict) · TailwindCSS v4 · shadcn/ui · Prisma · PostgreSQL ·
Supabase Auth · Vercel. Dark-mode first.

## Getting started

```bash
npm install            # installs all workspaces
npm run dev            # runs the web app
```

## Scripts (root)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the web app in dev mode |
| `npm run build` | Build the web app |
| `npm run lint` | Lint the web app |
| `npm run typecheck` | Type-check all workspaces |

### Database (run inside `apps/web`)

Requires `DATABASE_URL` + `DIRECT_URL` in `apps/web/.env` (see `.env.example`).

| Script | Description |
| --- | --- |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:studio` | Open Prisma Studio |

## Build phases

| Phase | Scope |
| --- | --- |
| 0 | Foundation (this commit) |
| 1 | Database (Prisma + PostgreSQL schema) |
| 2 | Authentication (Supabase) |
| 3 | Tracking script (`packages/tracker`) + ingestion |
| 4 | Analytics dashboard |
| 5 | Event tracking |
| 6 | Funnels |
| 7 | PayPal revenue attribution |
| 8 | Weekly reports |
