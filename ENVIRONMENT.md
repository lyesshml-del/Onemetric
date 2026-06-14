# Environment Variables

All variables live in `apps/web/.env` (gitignored). A template is in
[`apps/web/.env.example`](apps/web/.env.example). Add each variable in the phase that
needs it — nothing here implies a feature is built yet.

## Supabase project

| | |
| --- | --- |
| Project name | **OneMetric** |
| Project ref | `ladsqshpcdyjruzohkvb` |
| Region | `eu-central-1` |
| API URL | `https://ladsqshpcdyjruzohkvb.supabase.co` |
| Postgres | v17 |

## Variables

| Variable | Phase | Secret | Purpose / Source |
| --- | --- | :---: | --- |
| `NEXT_PUBLIC_APP_URL` | 0 | no | Base URL of the app (e.g. `http://localhost:3000`). |
| `DATABASE_URL` | 1 | **yes** | Runtime DB connection. **Transaction pooler**, port `6543`, `?pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL` | 1 | **yes** | Migrations DB connection. **Session pooler**, port `5432`. |
| `NEXT_PUBLIC_SUPABASE_URL` | 2 | no | Supabase API URL (above). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 2 | no | Supabase publishable/anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | 2 | **yes** | Server-only Supabase admin key. |
| `VISITOR_HASH_SALT` | 3 | **yes** | Salt for cookieless visitor hashing. |
| `CREDENTIALS_KEY` | 7 | **yes** | 32-byte hex AES-256 key for encrypting per-project integration credentials (PayPal). PayPal client id/secret/webhook id are entered per project in the dashboard, not via env. |
| `RESEND_API_KEY` | 8 | **yes** | Resend API key for weekly report emails. Without it, sends are skipped. |
| `REPORT_FROM_EMAIL` | 8 | no | From address for report emails (Resend-verified domain in prod). |
| `CRON_SECRET` | 8 | **yes** | Shared secret protecting the weekly-report cron route (`Authorization: Bearer …`). |

## Database connection strings

```
DATABASE_URL="postgresql://postgres.ladsqshpcdyjruzohkvb:[YOUR-DB-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.ladsqshpcdyjruzohkvb:[YOUR-DB-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

- Replace `[YOUR-DB-PASSWORD]` with the project's database password
  (Supabase dashboard → **Project Settings → Database → Reset database password**).
- The **pooler** host is used for both URLs because Supabase direct connections
  (`db.<ref>.supabase.co`) are IPv6-only and not reachable from many networks.
- `DATABASE_URL` (6543) is the transaction pooler — required for serverless/Vercel.
- `DIRECT_URL` (5432) is the session pooler — used by `prisma migrate`.

## Verifying the connection

Once the password is set in `apps/web/.env`:

```bash
cd apps/web
npx prisma migrate status   # expect: "Database schema is up to date!"
```
