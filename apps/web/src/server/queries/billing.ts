import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { planLimits, type PlanLimits } from "@/lib/plans";

export type BillingOverview = {
  plan: Plan;
  limits: PlanLimits;
  projects: number;
  eventsThisMonth: number;
};

/** Plan + current usage for the billing page and gating displays. */
export async function getBillingOverview(
  userId: string,
  plan: Plan,
): Promise<BillingOverview> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [projects, eventsThisMonth] = await Promise.all([
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.event.count({
      where: {
        project: { ownerId: userId },
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  return { plan, limits: planLimits(plan), projects, eventsThisMonth };
}

/** True when the user is below their plan's project limit. */
export async function canCreateProject(
  userId: string,
  plan: Plan,
): Promise<boolean> {
  const count = await prisma.project.count({ where: { ownerId: userId } });
  return count < planLimits(plan).maxProjects;
}
