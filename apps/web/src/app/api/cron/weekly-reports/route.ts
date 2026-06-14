import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEnabledSubscriptions } from "@/server/queries/reports";
import { buildWeeklyReport, type WeeklyReport } from "@/server/reports/builder";
import { sendWeeklyReport } from "@/server/reports/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const subs = await getEnabledSubscriptions();

  // Build each project's report once, reuse for all its recipients.
  const reportCache = new Map<string, WeeklyReport>();
  let sent = 0;

  for (const sub of subs) {
    let report = reportCache.get(sub.project.id);
    if (!report) {
      report = await buildWeeklyReport(sub.project);
      reportCache.set(sub.project.id, report);
    }

    const ok = await sendWeeklyReport(sub.email, report);
    if (ok) {
      await prisma.reportSubscription.update({
        where: { id: sub.id },
        data: { lastSentAt: new Date() },
      });
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    recipients: subs.length,
    sent,
  });
}
