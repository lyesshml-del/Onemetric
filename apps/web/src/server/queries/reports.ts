import { prisma } from "@/lib/prisma";

/** Report recipients for a project. */
export function listSubscriptions(projectId: string) {
  return prisma.reportSubscription.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      enabled: true,
      lastSentAt: true,
    },
  });
}

/**
 * ONE-77 — does this project have any weekly-report recipient yet? Real signal
 * (a `ReportSubscription` row exists) for the onboarding checklist's "set up
 * weekly reports" step — no fake progress, no schema change.
 */
export async function hasReportSubscription(projectId: string): Promise<boolean> {
  const sub = await prisma.reportSubscription.findFirst({
    where: { projectId },
    select: { id: true },
  });
  return sub !== null;
}

/** All enabled subscriptions with their project — used by the weekly cron. */
export function getEnabledSubscriptions() {
  return prisma.reportSubscription.findMany({
    where: { enabled: true },
    select: {
      id: true,
      email: true,
      project: { select: { id: true, name: true, domain: true } },
    },
  });
}
