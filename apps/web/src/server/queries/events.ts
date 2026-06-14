import { EventType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { eachUtcDay } from "@/lib/range";

export type EventSummaryRow = {
  name: string;
  count: number;
  sessions: number;
};

/** Custom events in the window, aggregated by name (occurrences + unique sessions). */
export async function getEventSummary(
  projectId: string,
  from: Date,
  to: Date,
): Promise<EventSummaryRow[]> {
  return prisma.$queryRaw<EventSummaryRow[]>`
    SELECT
      name,
      count(*)::int AS count,
      count(DISTINCT "sessionId")::int AS sessions
    FROM "Event"
    WHERE "projectId" = ${projectId}
      AND "type"::text = 'CUSTOM'
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY name
    ORDER BY count DESC
    LIMIT 100
  `;
}

export type EventOccurrence = {
  id: string;
  createdAt: Date;
  path: string | null;
  metadata: Prisma.JsonValue;
};

export type EventDetail = {
  count: number;
  sessions: number;
  trend: { date: string; count: number }[];
  recent: EventOccurrence[];
};

/** Detail for a single custom event name: totals, daily trend, recent occurrences. */
export async function getEventDetail(
  projectId: string,
  name: string,
  from: Date,
  to: Date,
): Promise<EventDetail> {
  const [summaryRows, trendRows, recent] = await Promise.all([
    prisma.$queryRaw<Array<{ count: number; sessions: number }>>`
      SELECT count(*)::int AS count, count(DISTINCT "sessionId")::int AS sessions
      FROM "Event"
      WHERE "projectId" = ${projectId}
        AND "type"::text = 'CUSTOM'
        AND name = ${name}
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
    `,
    prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS date,
             count(*)::int AS count
      FROM "Event"
      WHERE "projectId" = ${projectId}
        AND "type"::text = 'CUSTOM'
        AND name = ${name}
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.event.findMany({
      where: {
        projectId,
        type: EventType.CUSTOM,
        name,
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, createdAt: true, path: true, metadata: true },
    }),
  ]);

  const counts = new Map(trendRows.map((r) => [r.date, r.count]));
  const trend = eachUtcDay(from, to).map((date) => ({
    date,
    count: counts.get(date) ?? 0,
  }));

  return {
    count: summaryRows[0]?.count ?? 0,
    sessions: summaryRows[0]?.sessions ?? 0,
    trend,
    recent,
  };
}
