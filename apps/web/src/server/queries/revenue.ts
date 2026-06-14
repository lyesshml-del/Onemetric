import { prisma } from "@/lib/prisma";

export type RevenueSummary = {
  total: number;
  currency: string | null;
  count: number;
};

export type RevenueBreakdownRow = { label: string; value: number };

export type RevenuePayment = {
  id: string;
  amount: number;
  currency: string;
  occurredAt: Date;
  utmSource: string | null;
  utmCampaign: string | null;
};

/** Total revenue + payment count in the window (currency = most common). */
export async function getRevenueSummary(
  projectId: string,
  from: Date,
  to: Date,
): Promise<RevenueSummary> {
  const [agg, topCurrency] = await Promise.all([
    prisma.revenueEvent.aggregate({
      where: { projectId, occurredAt: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.revenueEvent.groupBy({
      by: ["currency"],
      where: { projectId, occurredAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { currency: "desc" } },
      take: 1,
    }),
  ]);

  return {
    total: agg._sum.amount ? Number(agg._sum.amount) : 0,
    currency: topCurrency[0]?.currency ?? null,
    count: agg._count._all,
  };
}

export async function getRevenueBySource(
  projectId: string,
  from: Date,
  to: Date,
): Promise<RevenueBreakdownRow[]> {
  const rows = await prisma.revenueEvent.groupBy({
    by: ["utmSource"],
    where: { projectId, occurredAt: { gte: from, lte: to } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({
    label: r.utmSource ?? "Direct / unknown",
    value: r._sum.amount ? Number(r._sum.amount) : 0,
  }));
}

export async function getRevenueByCampaign(
  projectId: string,
  from: Date,
  to: Date,
): Promise<RevenueBreakdownRow[]> {
  const rows = await prisma.revenueEvent.groupBy({
    by: ["utmCampaign"],
    where: { projectId, occurredAt: { gte: from, lte: to } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({
    label: r.utmCampaign ?? "Direct / unknown",
    value: r._sum.amount ? Number(r._sum.amount) : 0,
  }));
}

export async function getRecentRevenue(
  projectId: string,
  from: Date,
  to: Date,
): Promise<RevenuePayment[]> {
  const rows = await prisma.revenueEvent.findMany({
    where: { projectId, occurredAt: { gte: from, lte: to } },
    orderBy: { occurredAt: "desc" },
    take: 20,
    select: {
      id: true,
      amount: true,
      currency: true,
      occurredAt: true,
      utmSource: true,
      utmCampaign: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    currency: r.currency,
    occurredAt: r.occurredAt,
    utmSource: r.utmSource,
    utmCampaign: r.utmCampaign,
  }));
}
