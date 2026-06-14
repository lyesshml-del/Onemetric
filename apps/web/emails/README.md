# Auth email templates (Supabase)

Branded HTML for the Supabase Auth emails. These are **not used by the app at runtime** —
they're the source of truth for what you paste into the Supabase dashboard:

**Supabase → Authentication → Emails → Templates** → pick the template → set the
**Subject** and paste the file's HTML into the **Message body**.

| File | Supabase template | Subject | Key variable |
| --- | --- | --- | --- |
| `confirm-signup.html` | Confirm signup | `Confirm your OneMetric account` | `{{ .ConfirmationURL }}` |
| `magic-link.html` | Magic Link | `Your OneMetric sign-in link` | `{{ .ConfirmationURL }}` |
| `reset-password.html` | Reset Password | `Reset your OneMetric password` | `{{ .ConfirmationURL }}` |
| `change-email.html` | Change Email Address | `Confirm your new email` | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` |
| `invite.html` | Invite user | `You're invited to OneMetric` | `{{ .ConfirmationURL }}` |
| `reauthentication.html` | Reauthentication | `Your OneMetric verification code` | `{{ .Token }}` (a code, not a URL) |

Notes:
- Keep the `{{ .Variable }}` placeholders exactly as written — Supabase substitutes them.
- All templates share one dark, on-brand style (matches the app + the weekly report email).
- Each uses a bulletproof (table-based) button plus a plain-text fallback link, and a hidden
  preheader line for the inbox preview.
- Sent via Resend SMTP from `noreply@onemetric.sbs` (configured in Supabase → Auth → SMTP).
