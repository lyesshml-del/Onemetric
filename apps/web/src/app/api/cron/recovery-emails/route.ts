import { type NextRequest, NextResponse } from "next/server";
import { recoveryThreshold } from "@/lib/range";
import {
  getStalledProjectsForRecovery,
  markRecoveryEmailSent,
} from "@/server/queries/projects";
import { sendRecoveryEmail } from "@/server/reports/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// How long after creation a project with zero events is considered "stalled".
// ONE-81: dedup is now the persistent `Project.recoveryEmailSentAt` flag, so this
// is an open-ended cutoff (every still-stalled, never-nudged project) — at most
// once per project, and missed cohorts are caught on a later run.
const RECOVERY_AGE_DAYS = 2;

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` (same gate as the
  // weekly-reports cron).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const olderThan = recoveryThreshold(new Date(), RECOVERY_AGE_DAYS);
  const projects = await getStalledProjectsForRecovery(olderThan);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://onemetric.sbs";
  let sent = 0;

  for (const project of projects) {
    const ok = await sendRecoveryEmail(project.owner.email, {
      projectName: project.name,
      domain: project.domain,
      settingsUrl: `${appUrl}/dashboard/${project.id}/settings`,
    });
    // Stamp only on a successful send → at most once per project; a failed/no-op
    // send (e.g. RESEND_API_KEY absent) leaves the flag NULL so a later run retries.
    if (ok) {
      await markRecoveryEmailSent(project.id);
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: projects.length,
    sent,
  });
}
