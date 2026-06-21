import { type NextRequest, NextResponse } from "next/server";
import { recoveryWindow } from "@/lib/range";
import { getStalledProjectsForRecovery } from "@/server/queries/projects";
import { sendRecoveryEmail } from "@/server/reports/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// How long after creation a project with zero events is considered "stalled".
// The daily cron targets the single UTC day bucket `RECOVERY_AGE_DAYS` days ago,
// so each project is emailed at most once (no "already nudged" column needed).
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

  const { from, to } = recoveryWindow(new Date(), RECOVERY_AGE_DAYS);
  const projects = await getStalledProjectsForRecovery(from, to);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://onemetric.sbs";
  let sent = 0;

  for (const project of projects) {
    const ok = await sendRecoveryEmail(project.owner.email, {
      projectName: project.name,
      domain: project.domain,
      settingsUrl: `${appUrl}/dashboard/${project.id}/settings`,
    });
    if (ok) sent++;
  }

  return NextResponse.json({
    ok: true,
    candidates: projects.length,
    sent,
  });
}
