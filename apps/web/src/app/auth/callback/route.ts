import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * ONE-79 (Move #6) — OAuth (Google) callback. Exchanges the PKCE `code` for a
 * session (sets the auth cookies via the server client) and lands the user in
 * the dashboard. `requireUser` → `syncUser` then mirrors them into `public.User`
 * on the first guarded request, exactly like an email user — so no schema or
 * auth-helper change is needed. Google verifies the email, so there is no
 * email-confirmation step for OAuth sign-ups.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-site relative redirects (no open-redirect via `next`).
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=oauth`);
}
