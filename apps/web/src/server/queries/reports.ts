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
