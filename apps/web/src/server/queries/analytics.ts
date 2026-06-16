import { EventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { previousRange } from "@/lib/range";

export type OverviewMetrics = {
  uniqueVisitors: number;
  sessions: number;
  pageviews: number;
  pagesPerSession: number;
  avgDurationSec: number;
  bounceRate: number; // fraction 0..1
};

export type TimeseriesPoint = {
  date: string; // YYYY-MM-DD (UTC)
  visitors: number;
  pageviews: number;
};

export type BreakdownRow = { label: string; value: number };

export type ProjectAnalytics = {
  metrics: OverviewMetrics;
  timeseries: TimeseriesPoint[];
  topPages: BreakdownRow[];
  topReferrers: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
};

/** All analytics for a project + date window, run in parallel. */
export async function getProjectAnalytics(
  projectId: string,
  from: Date,
  to: Date,
): Promise<ProjectAnalytics> {
  const [
    metrics,
    timeseries,
    topPages,
    topReferrers,
    countries,
    devices,
    browsers,
  ] = await Promise.all([
    getOverviewMetrics(projectId, from, to),
    getTimeseries(projectId, from, to),
    getTopPages(projectId, from, to),
    getTopReferrers(projectId, from, to),
    getCountries(projectId, from, to),
    getDevices(projectId, from, to),
    getBrowsers(projectId, from, to),
  ]);

  return {
    metrics,
    timeseries,
    topPages,
    topReferrers,
    countries,
    devices,
    browsers,
  };
}

export async function getOverviewMetrics(
  projectId: string,
  from: Date,
  to: Date,
): Promise<OverviewMetrics> {
  const rows = await prisma.$queryRaw<
    Array<{
      sessions: number;
      unique_visitors: number;
      pageviews: number;
      avg_duration: number;
      bounce_rate: number;
    }>
  >`
    SELECT
      count(*)::int AS sessions,
      count(DISTINCT "visitorHash")::int AS unique_visitors,
      coalesce(sum("pageviewCount"), 0)::int AS pageviews,
      coalesce(avg(extract(epoch FROM ("lastEventAt" - "startedAt"))), 0)::float8 AS avg_duration,
      coalesce(avg(CASE WHEN "pageviewCount" <= 1 THEN 1 ELSE 0 END), 0)::float8 AS bounce_rate
    FROM "Session"
    WHERE "projectId" = ${projectId}
      AND "startedAt" >= ${from}
      AND "startedAt" <= ${to}
  `;

  const r = rows[0];
  const sessions = r?.sessions ?? 0;
  const pageviews = r?.pageviews ?? 0;

  return {
    sessions,
    uniqueVisitors: r?.unique_visitors ?? 0,
    pageviews,
    pagesPerSession: sessions > 0 ? pageviews / sessions : 0,
    avgDurationSec: r?.avg_duration ?? 0,
    bounceRate: r?.bounce_rate ?? 0,
  };
}

export type OverviewMetricsWithDelta = {
  current: OverviewMetrics;
  previous: OverviewMetrics;
};

/**
 * Move #1 / Phase 0 — current-window overview metrics plus the equal-length
 * previous window, so the UI can show period-over-period deltas. Thin wrapper
 * that REUSES `getOverviewMetrics` for both windows; the underlying query is
 * unchanged. Additive — not yet consumed by any page in Phase 0.
 */
export async function getOverviewMetricsDelta(
  projectId: string,
  from: Date,
  to: Date,
): Promise<OverviewMetricsWithDelta> {
  const prev = previousRange(from, to);
  const [current, previous] = await Promise.all([
    getOverviewMetrics(projectId, from, to),
    getOverviewMetrics(projectId, prev.from, prev.to),
  ]);
  return { current, previous };
}

export async function getTimeseries(
  projectId: string,
  from: Date,
  to: Date,
): Promise<TimeseriesPoint[]> {
  const rows = await prisma.$queryRaw<
    Array<{ date: string; visitors: number; pageviews: number }>
  >`
    SELECT
      to_char(date_trunc('day', "startedAt"), 'YYYY-MM-DD') AS date,
      count(DISTINCT "visitorHash")::int AS visitors,
      coalesce(sum("pageviewCount"), 0)::int AS pageviews
    FROM "Session"
    WHERE "projectId" = ${projectId}
      AND "startedAt" >= ${from}
      AND "startedAt" <= ${to}
    GROUP BY 1
    ORDER BY 1
  `;

  // Fill missing days with zeros so the chart has a continuous axis.
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const out: TimeseriesPoint[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  );
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const row = byDate.get(key);
    out.push({
      date: key,
      visitors: row?.visitors ?? 0,
      pageviews: row?.pageviews ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export async function getTopPages(
  projectId: string,
  from: Date,
  to: Date,
): Promise<BreakdownRow[]> {
  const rows = await prisma.event.groupBy({
    by: ["name"],
    where: {
      projectId,
      type: EventType.PAGEVIEW,
      createdAt: { gte: from, lte: to },
    },
    _count: { _all: true },
    orderBy: { _count: { name: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({ label: r.name, value: r._count._all }));
}

async function getTopReferrers(
  projectId: string,
  from: Date,
  to: Date,
): Promise<BreakdownRow[]> {
  const rows = await prisma.session.groupBy({
    by: ["referrerDomain"],
    where: {
      projectId,
      startedAt: { gte: from, lte: to },
      referrerDomain: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { referrerDomain: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({
    label: r.referrerDomain ?? "Direct",
    value: r._count._all,
  }));
}

async function getCountries(
  projectId: string,
  from: Date,
  to: Date,
): Promise<BreakdownRow[]> {
  const rows = await prisma.session.groupBy({
    by: ["country"],
    where: {
      projectId,
      startedAt: { gte: from, lte: to },
      country: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { country: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({ label: r.country ?? "Unknown", value: r._count._all }));
}

async function getDevices(
  projectId: string,
  from: Date,
  to: Date,
): Promise<BreakdownRow[]> {
  const rows = await prisma.session.groupBy({
    by: ["device"],
    where: { projectId, startedAt: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { _count: { device: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({ label: r.device, value: r._count._all }));
}

async function getBrowsers(
  projectId: string,
  from: Date,
  to: Date,
): Promise<BreakdownRow[]> {
  const rows = await prisma.session.groupBy({
    by: ["browser"],
    where: {
      projectId,
      startedAt: { gte: from, lte: to },
      browser: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { browser: "desc" } },
    take: 10,
  });
  return rows.map((r) => ({
    label: r.browser ?? "Unknown",
    value: r._count._all,
  }));
}
