import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import {
  getProjectAnalytics,
  getOverviewMetrics,
  getTimeseries,
  type BreakdownRow,
} from "@/server/queries/analytics";
import { resolveRange, previousRange } from "@/lib/range";
import {
  countryName,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Delta } from "@/components/dashboard/delta";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Analytics — OneMetric",
};

export default async function ProjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { projectId } = await params;
  const { range: rangeParam } = await searchParams;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const { key: range, from, to } = resolveRange(rangeParam);
  const prev = previousRange(from, to);
  const [projects, analytics, prevMetrics, prevSeries] = await Promise.all([
    listProjects(user.id),
    getProjectAnalytics(project.id, from, to),
    getOverviewMetrics(project.id, prev.from, prev.to),
    getTimeseries(project.id, prev.from, prev.to),
  ]);

  const { metrics, timeseries } = analytics;
  const hasData = metrics.sessions > 0;

  // Hero: current visitors trend with the previous period aligned per day slot.
  const heroPoints = timeseries.map((p, i) => ({
    label: p.date,
    value: p.visitors,
    prev: prevSeries[i]?.visitors,
  }));

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="overview"
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Overview</h2>
        <RangeSelect value={range} />
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">No data in this period yet.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Install the snippet to start collecting analytics.
            </p>
            <Link
              href={`/dashboard/${project.id}/settings`}
              className="text-foreground mt-3 inline-block text-sm underline"
            >
              Go to install instructions →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Hero — the protagonist (Move #1 / Phase A). The tiles + breakdowns
              below are intentionally unchanged; later phases replace them. */}
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-sm">Unique visitors</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {formatNumber(metrics.uniqueVisitors)}
                </span>
                <Delta
                  current={metrics.uniqueVisitors}
                  previous={prevMetrics.uniqueVisitors}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                vs {formatNumber(prevMetrics.uniqueVisitors)} last period
              </p>
              <div className="mt-5">
                <TrendChart
                  data={heroPoints}
                  valueLabel="visitors"
                  ariaLabel="Daily unique visitors, current vs previous period"
                />
              </div>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs tabular-nums">
                <span>{heroPoints[0]?.label}</span>
                <span>{heroPoints[heroPoints.length - 1]?.label}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard
              label="Unique visitors"
              value={formatNumber(metrics.uniqueVisitors)}
            />
            <MetricCard label="Sessions" value={formatNumber(metrics.sessions)} />
            <MetricCard
              label="Pageviews"
              value={formatNumber(metrics.pageviews)}
            />
            <MetricCard
              label="Pages / session"
              value={metrics.pagesPerSession.toFixed(1)}
            />
            <MetricCard
              label="Avg. session duration"
              value={formatDuration(metrics.avgDurationSec)}
            />
            <MetricCard
              label="Bounce rate"
              value={formatPercent(metrics.bounceRate)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownCard title="Top pages" items={analytics.topPages} />
            <BreakdownCard title="Top referrers" items={analytics.topReferrers} />
            <BreakdownCard
              title="Countries"
              items={mapCountries(analytics.countries)}
            />
            <BreakdownCard
              title="Devices"
              items={mapDevices(analytics.devices)}
            />
            <BreakdownCard title="Browsers" items={analytics.browsers} />
          </div>
        </>
      )}
    </div>
  );
}

function mapCountries(rows: BreakdownRow[]): BreakdownRow[] {
  return rows.map((r) => ({ ...r, label: countryName(r.label) }));
}

function mapDevices(rows: BreakdownRow[]): BreakdownRow[] {
  return rows.map((r) => ({
    ...r,
    label: r.label.charAt(0) + r.label.slice(1).toLowerCase(),
  }));
}
