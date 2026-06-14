import { Plan } from "@prisma/client";

export type PlanLimits = {
  label: string;
  /** Display-only; the real price lives in the Merchant-of-Record. */
  priceLabel: string;
  maxProjects: number;
  monthlyEvents: number;
  retentionDays: number;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    label: "Free",
    priceLabel: "$0",
    maxProjects: 1,
    monthlyEvents: 10_000,
    retentionDays: 30,
  },
  PRO: {
    label: "Pro",
    priceLabel: "$19/mo",
    maxProjects: 10,
    monthlyEvents: 1_000_000,
    retentionDays: 365,
  },
};

export function planLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
